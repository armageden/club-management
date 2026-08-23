import type { Request, Response, NextFunction } from "express";
import { participantsService } from "./participants.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import type { AuthRequest } from "../../types/index.js";
import { p } from "../../types/index.js";

export const participantsController = {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const profile = await participantsService.getMyProfile(eventId, req.user.id);
      res.json({ success: true, data: { profile } });
    } catch (err) {
      next(err);
    }
  },

  async listParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { looking_for_team } = req.query;
      if (!eventId) throw new ValidationError("Event ID is required");

      const lookingForTeam = looking_for_team === "true" ? true : looking_for_team === "false" ? false : undefined;
      const participants = await participantsService.listParticipants(eventId, lookingForTeam);
      res.json({ success: true, data: { participants } });
    } catch (err) {
      next(err);
    }
  },

  async createOrUpdateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const { bio, experience_level, preferred_role, looking_for_team, tech_stack_summary, tech_stack_tag_ids } = req.body;

      if (experience_level && !["beginner", "intermediate", "advanced", "expert"].includes(experience_level)) {
        throw new ValidationError("Invalid experience level");
      }

      const profile = await participantsService.createOrUpdateProfile(eventId, req.user.id, {
        bio,
        experience_level,
        preferred_role,
        looking_for_team,
        tech_stack_summary,
        tech_stack_tag_ids,
      });

      res.status(201).json({ success: true, data: { profile } });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const { bio, experience_level, preferred_role, looking_for_team, tech_stack_summary } = req.body;

      const profile = await participantsService.updateProfile(eventId, req.user.id, {
        bio,
        experience_level,
        preferred_role,
        looking_for_team,
        tech_stack_summary,
      });

      res.json({ success: true, data: { profile } });
    } catch (err) {
      next(err);
    }
  },

  async setTechStack(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { tag_ids } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");
      if (!Array.isArray(tag_ids)) throw new ValidationError("tag_ids must be an array");

      const profile = await participantsService.setTechStack(eventId, req.user.id, tag_ids);
      res.json({ success: true, data: { profile } });
    } catch (err) {
      next(err);
    }
  },

  async getTechTags(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await participantsService.getTechTags();
      res.json({ success: true, data: { tags } });
    } catch (err) {
      next(err);
    }
  },

  async createTechTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category } = req.body;
      if (!name) throw new ValidationError("Tag name is required");

      const tag = await participantsService.createTechTag(name, category);
      res.status(201).json({ success: true, data: { tag } });
    } catch (err) {
      next(err);
    }
  },

  async checkHasTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const hasTeam = await participantsService.checkHasTeam(eventId, req.user.id);
      res.json({ success: true, data: { has_team: hasTeam } });
    } catch (err) {
      next(err);
    }
  },
};
