import type { Response, NextFunction } from "express";
import { AuthorizationError } from "./error.middleware.js";
import type { AuthRequest } from "../types/index.js";

export function requireGlobalRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthorizationError("Authentication required");
    }

    if (!roles.includes(req.user.globalRole)) {
      throw new AuthorizationError(
        `Requires one of the following roles: ${roles.join(", ")}`
      );
    }

    next();
  };
}
