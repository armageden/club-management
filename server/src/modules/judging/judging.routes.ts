import { Router } from "express";
import { judgingController } from "./judging.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireEventRole } from "../../middleware/event-role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/projects",
  authenticate,
  requireEventRole("judge", "organizer"),
  judgingController.listScorable
);

router.post(
  "/projects/:projectId/scores",
  authenticate,
  requireEventRole("judge", "organizer"),
  judgingController.score
);

router.get(
  "/leaderboard",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  judgingController.leaderboard
);

export default router;
