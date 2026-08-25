import { Router } from "express";
import {
  createShift,
  assignVolunteer,
  updateAssignmentStatus,
  getShiftsByEvent,
  listUsers,
  listAssignmentsByEvent,
} from "./volunteers.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGlobalRole } from "../../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/shifts", requireGlobalRole("admin"), createShift);
router.get("/shifts/event/:eventId", getShiftsByEvent);
router.post("/assignments", requireGlobalRole("admin"), assignVolunteer);
router.patch("/assignments/:assignmentId/status", requireGlobalRole("admin", "user"), updateAssignmentStatus);
router.get("/assignments/event/:eventId", listAssignmentsByEvent);
router.get("/users", listUsers);

export default router;
