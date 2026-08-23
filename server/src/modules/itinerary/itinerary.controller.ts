import type { Request, Response, NextFunction } from "express";
import { itineraryService } from "./itinerary.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import { p } from "../../types/index.js";

export const itineraryController = {
  async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const items = await itineraryService.listItems(eventId);
      res.json({ success: true, data: { items } });
    } catch (err) {
      next(err);
    }
  },

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const itemId = p(req, "itemId");
      if (!eventId || !itemId) throw new ValidationError("Event ID and Item ID are required");
      const item = await itineraryService.getItem(eventId, itemId);
      res.json({ success: true, data: { item } });
    } catch (err) {
      next(err);
    }
  },

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const { title, description, location, starts_at, ends_at, session_type } = req.body;
      const item = await itineraryService.createItem(eventId, {
        title, description, location, starts_at, ends_at, session_type,
      });
      res.status(201).json({ success: true, data: { item } });
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const itemId = p(req, "itemId");
      if (!eventId || !itemId) throw new ValidationError("Event ID and Item ID are required");
      const { title, description, location, starts_at, ends_at, session_type, status } = req.body;
      const item = await itineraryService.updateItem(eventId, itemId, {
        title, description, location, starts_at, ends_at, session_type, status,
      });
      res.json({ success: true, data: { item } });
    } catch (err) {
      next(err);
    }
  },

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const itemId = p(req, "itemId");
      if (!eventId || !itemId) throw new ValidationError("Event ID and Item ID are required");
      await itineraryService.deleteItem(eventId, itemId);
      res.json({ success: true, data: { message: "Item cancelled" } });
    } catch (err) {
      next(err);
    }
  },
};