import { Router } from "express";
import { projectsController } from "./projects.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireEventRole } from "../../middleware/event-role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  projectsController.list
);

router.post("/", authenticate, requireEventRole("participant"), projectsController.create);

router.get(
  "/:projectId",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  projectsController.get
);

// Own-team draft edits and organizer overrides are both resolved in the
// service layer; the route admits either event role.
router.put(
  "/:projectId",
  authenticate,
  requireEventRole("organizer", "participant"),
  projectsController.update
);

router.post(
  "/:projectId/submit",
  authenticate,
  requireEventRole("organizer", "participant"),
  projectsController.submit
);

router.post(
  "/:projectId/disqualify",
  authenticate,
  requireEventRole("organizer"),
  projectsController.disqualify
);

export default router;
