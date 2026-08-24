import { Router } from "express";
import {
  createSubmission,
  submitScore,
  getLeaderboard,
  listSubmissions,
  listTeams,
  createTeam,
} from "./submissions.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGlobalRole } from "../../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", requireGlobalRole("admin", "user"), createSubmission);
router.get("/", listSubmissions);
router.get("/teams", listTeams);
router.post("/teams", requireGlobalRole("admin", "user"), createTeam);
router.post("/:submissionId/score", requireGlobalRole("admin"), submitScore);
router.get("/leaderboard/:eventId", getLeaderboard);

export default router;
