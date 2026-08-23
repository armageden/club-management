import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AuthenticationError } from "./error.middleware.js";
import type { AuthRequest, JwtPayload } from "../types/index.js";

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      globalRole: decoded.globalRole,
    };
    next();
  } catch {
    throw new AuthenticationError("Invalid or expired token");
  }
}
