import type { Response, NextFunction } from "express";
import { eventMembersRepository } from "../modules/event-members/event-members.repository.js";
import { AuthorizationError } from "./error.middleware.js";
import type { AuthRequest } from "../types/index.js";
import { p } from "../types/index.js";

export function requireEventRole(...roles: string[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AuthorizationError("Authentication required"));
      }

      const eventId = p(req, "eventId");
      if (!eventId) {
        return next(new AuthorizationError("Event ID required"));
      }

      const membership = await eventMembersRepository.findByEventAndUser(eventId, req.user.id);

      if (!membership || (membership.status !== "active" && membership.status !== "approved")) {
        return next(new AuthorizationError("You are not a member of this event"));
      }

      if (!roles.includes(membership.role)) {
        return next(new AuthorizationError(
          `Requires one of the following event roles: ${roles.join(", ")}`
        ));
      }

      (req as any).eventRole = membership.role;
      (req as any).eventId = eventId;
      next();
    } catch (err) {
      next(err);
    }
  };
}
