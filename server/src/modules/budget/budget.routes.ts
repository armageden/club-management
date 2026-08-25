import { Router } from "express";
import {
  createContribution,
  createExpenditure,
  getBudgetSummary,
  listLedger,
} from "./budget.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGlobalRole } from "../../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read access for any authenticated member of the platform
router.get("/ledger/:eventId", listLedger);
router.get("/summary/:eventId", getBudgetSummary);

// Financial writes are restricted to organizers (admins / event staff)
router.post("/contributions", requireGlobalRole("admin", "user"), createContribution);
router.post("/expenditures", requireGlobalRole("admin", "user"), createExpenditure);

export default router;
