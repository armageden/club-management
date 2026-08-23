import { Router } from "express";
import { certificatesController } from "./certificates.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireEventRole } from "../../middleware/event-role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  certificatesController.listCertificates
);

router.get(
  "/eligibility",
  authenticate,
  requireEventRole("organizer", "participant"),
  certificatesController.checkEligibility
);

router.post(
  "/issue",
  authenticate,
  requireEventRole("organizer"),
  certificatesController.issueCertificate
);

router.post(
  "/bulk-attendance",
  authenticate,
  requireEventRole("organizer"),
  certificatesController.bulkCreateAttendance
);

router.put(
  "/:certificateId/revoke",
  authenticate,
  requireEventRole("organizer"),
  certificatesController.revokeCertificate
);

router.get(
  "/verify/:code",
  authenticate,
  certificatesController.verifyCertificate
);

export default router;