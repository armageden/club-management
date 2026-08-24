import { Router } from "express";
import type { Response, NextFunction } from "express";
import { demoController } from "./demo.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { AuthorizationError } from "../../middleware/error.middleware.js";
import type { AuthRequest } from "../../types/index.js";

// Demo data is a global dev/demo tool, not an event-scoped resource: only
// global admins may seed or purge it.
export function requireGlobalAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.globalRole !== "admin") {
    throw new AuthorizationError("Global admin access required");
  }
  next();
}

const router = Router();

router.post("/enable", authenticate, requireGlobalAdmin, demoController.enable);
router.post("/disable", authenticate, requireGlobalAdmin, demoController.disable);
router.get("/status", authenticate, requireGlobalAdmin, demoController.status);

export default router;
