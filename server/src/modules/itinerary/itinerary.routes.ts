import { Router } from "express";
import { itineraryController } from "./itinerary.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireEventRole } from "../../middleware/event-role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  itineraryController.listItems
);

router.get(
  "/:itemId",
  authenticate,
  requireEventRole("organizer", "participant", "volunteer", "judge"),
  itineraryController.getItem
);

router.post(
  "/",
  authenticate,
  requireEventRole("organizer"),
  itineraryController.createItem
);

router.put(
  "/:itemId",
  authenticate,
  requireEventRole("organizer"),
  itineraryController.updateItem
);

router.delete(
  "/:itemId",
  authenticate,
  requireEventRole("organizer"),
  itineraryController.deleteItem
);

export default router;