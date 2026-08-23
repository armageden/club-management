import { Router } from "express";
import { participantsController } from "./participants.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireEventRole } from "../../middleware/event-role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  participantsController.listParticipants
);

router.get(
  "/me",
  authenticate,
  requireEventRole("organizer", "participant"),
  participantsController.getMyProfile
);

router.post(
  "/me",
  authenticate,
  requireEventRole("organizer", "participant"),
  participantsController.createOrUpdateProfile
);

router.put(
  "/me",
  authenticate,
  requireEventRole("organizer", "participant"),
  participantsController.updateProfile
);

router.put(
  "/me/tech-stack",
  authenticate,
  requireEventRole("organizer", "participant"),
  participantsController.setTechStack
);

router.get(
  "/me/has-team",
  authenticate,
  requireEventRole("organizer", "participant"),
  participantsController.checkHasTeam
);

router.get(
  "/tech-tags",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  participantsController.getTechTags
);

router.post(
  "/tech-tags",
  authenticate,
  requireEventRole("organizer"),
  participantsController.createTechTag
);

export default router;
