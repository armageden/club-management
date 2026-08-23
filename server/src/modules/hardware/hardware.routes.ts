import { Router } from "express";
import { hardwareController } from "./hardware.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGlobalRole } from "../../middleware/role.middleware.js";

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Hardware Items
router.get("/items", hardwareController.listItems);
router.get("/items/:itemId", hardwareController.getItem);
router.get("/items/:itemId/timeline", hardwareController.getItemTimeline);
router.post("/items", requireGlobalRole("admin", "user"), hardwareController.createItem);
router.put("/items/:itemId", requireGlobalRole("admin", "user"), hardwareController.updateItem);
router.delete("/items/:itemId", requireGlobalRole("admin"), hardwareController.deleteItem);

// Checkouts
router.get("/checkouts", hardwareController.listCheckouts);
router.get("/checkouts/:checkoutId", hardwareController.getCheckout);
router.post("/checkouts", requireGlobalRole("admin", "user"), hardwareController.checkoutItem);

// Returns
router.post("/returns", requireGlobalRole("admin", "user"), hardwareController.returnItem);

// Damage Reports
router.get("/damage-reports", hardwareController.listDamageReports);
router.post("/damage-reports", requireGlobalRole("admin", "user"), hardwareController.createDamageReport);
router.put("/damage-reports/:reportId/resolve", requireGlobalRole("admin", "user"), hardwareController.resolveDamageReport);

// Analytics
router.get("/analytics", hardwareController.getAnalytics);

// Overdue
router.get("/overdue", hardwareController.getOverdue);
router.post("/overdue/mark", requireGlobalRole("admin", "user"), hardwareController.markOverdue);

// User's active checkouts
router.get("/my-checkouts", hardwareController.getMyCheckouts);

export default router;