import { Router } from "express";
import { createIncident, updateIncidentStatus, getOperationalAnalytics, listIncidents } from "./incidents.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGlobalRole } from "../../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", requireGlobalRole("admin", "user"), createIncident);
router.get("/", listIncidents);
router.patch("/:incidentId/status", requireGlobalRole("admin", "user"), updateIncidentStatus);
router.get("/analytics/:eventId", getOperationalAnalytics);

export default router;
