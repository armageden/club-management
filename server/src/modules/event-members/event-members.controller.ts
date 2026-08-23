import type { Request, Response, NextFunction } from "express";
import { eventMembersService } from "./event-members.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import { p } from "../../types/index.js";
import type { AuthRequest } from "../../types/index.js";

export const eventMembersController = {
  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");

      const members = await eventMembersService.getMembers(eventId);
      res.json({ success: true, data: { members } });
    } catch (err) {
      next(err);
    }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { userId, role } = req.body;

      if (!eventId) throw new ValidationError("Event ID is required");
      if (!userId) throw new ValidationError("User ID is required");
      if (!role || !["organizer", "participant", "volunteer", "judge"].includes(role)) {
        throw new ValidationError("Valid role is required (organizer, participant, volunteer, judge)");
      }

      const member = await eventMembersService.addMember(eventId, userId, role);
      res.status(201).json({ success: true, data: { member } });
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const userId = p(req, "userId");
      const { role } = req.body;

      if (!eventId || !userId) throw new ValidationError("Event ID and User ID are required");
      if (!role || !["organizer", "participant", "volunteer", "judge"].includes(role)) {
        throw new ValidationError("Valid role is required");
      }

      const member = await eventMembersService.updateRole(eventId, userId, role);
      res.json({ success: true, data: { member } });
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const userId = p(req, "userId");
      if (!eventId || !userId) throw new ValidationError("Event ID and User ID are required");

      await eventMembersService.removeMember(eventId, userId);
      res.json({ success: true, data: { message: "Member removed" } });
    } catch (err) {
      next(err);
    }
  },

  async getMyRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const membership = await eventMembersService.getMyRole(eventId, req.user.id);
      res.json({ success: true, data: { membership } });
    } catch (err) {
      next(err);
    }
  },
};
