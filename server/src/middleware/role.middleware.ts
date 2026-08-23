import type { Response, NextFunction } from "express";
import { AuthorizationError } from "./error.middleware.js";
import type { AuthRequest } from "../types/index.js";

export function requireGlobalRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError("Authentication required"));
    }

    if (!roles.includes(req.user.globalRole)) {
      return next(new AuthorizationError(
        `Requires one of the following roles: ${roles.join(", ")}`
      ));
    }

    next();
  };
}
