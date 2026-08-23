import type { Request, Response, NextFunction } from "express";
import { checkinService } from "./checkin.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import type { AuthRequest } from "../../types/index.js";
import { p } from "../../types/index.js";

export const checkinController = {
  async listCheckins(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const checkins = await checkinService.listCheckins(eventId);
      res.json({ success: true, data: { checkins } });
    } catch (err) {
      next(err);
    }
  },

  async manualCheckin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { user_id, itinerary_item_id } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");
      if (!user_id) throw new ValidationError("User ID is required");

      const checkin = await checkinService.manualCheckin(
        eventId, user_id, req.user.id, itinerary_item_id
      );
      res.status(201).json({ success: true, data: { checkin } });
    } catch (err) {
      next(err);
    }
  },

  async qrCheckin(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { token } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!token) throw new ValidationError("QR token is required");

      const result = await checkinService.qrCheckin(eventId, token);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async generateQRToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { user_id, expires_in_minutes } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const targetUserId = user_id || req.user.id;
      const result = await checkinService.generateQRToken(
        eventId, targetUserId, expires_in_minutes
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const stats = await checkinService.getStats(eventId);
      res.json({ success: true, data: { stats } });
    } catch (err) {
      next(err);
    }
  },
};