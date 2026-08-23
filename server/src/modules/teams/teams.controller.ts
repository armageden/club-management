import type { Request, Response, NextFunction } from "express";
import { teamsService } from "./teams.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import type { AuthRequest } from "../../types/index.js";
import { p } from "../../types/index.js";

export const teamsController = {
  async listTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const teams = await teamsService.listTeams(eventId);
      res.json({ success: true, data: { teams } });
    } catch (err) {
      next(err);
    }
  },

  async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      const team = await teamsService.getTeam(eventId, teamId);
      res.json({ success: true, data: { team } });
    } catch (err) {
      next(err);
    }
  },

  async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { name, description, max_size } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const team = await teamsService.createTeam(
        eventId,
        req.user.id,
        name,
        description,
        max_size
      );
      res.status(201).json({ success: true, data: { team } });
    } catch (err) {
      next(err);
    }
  },

  async updateTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const { name, description, max_size, status } = req.body;
      const team = await teamsService.updateTeam(eventId, teamId, req.user.id, {
        name,
        description,
        max_size,
        status,
      });
      res.json({ success: true, data: { team } });
    } catch (err) {
      next(err);
    }
  },

  async deleteTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      await teamsService.deleteTeam(eventId, teamId, req.user.id);
      res.json({ success: true, data: { message: "Team deleted" } });
    } catch (err) {
      next(err);
    }
  },

  async joinTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const member = await teamsService.joinTeam(eventId, teamId, req.user.id);
      res.status(201).json({ success: true, data: { member } });
    } catch (err) {
      next(err);
    }
  },

  async leaveTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const result = await teamsService.leaveTeam(eventId, teamId, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      const userId = p(req, "userId");
      if (!eventId || !teamId || !userId) throw new ValidationError("Event ID, Team ID, and User ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const result = await teamsService.removeMember(eventId, teamId, userId, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async applyToTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      const { message } = req.body;
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const application = await teamsService.applyToTeam(eventId, teamId, req.user.id, message);
      res.status(201).json({ success: true, data: { application } });
    } catch (err) {
      next(err);
    }
  },

  async listApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teamId = p(req, "teamId");
      if (!teamId) throw new ValidationError("Team ID is required");
      if (!req.user) throw new ValidationError("Authentication required");

      const applications = await teamsService.listApplications(teamId, req.user.id);
      res.json({ success: true, data: { applications } });
    } catch (err) {
      next(err);
    }
  },

  async reviewApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const applicationId = p(req, "applicationId");
      const { status } = req.body;
      if (!eventId || !applicationId) throw new ValidationError("Event ID and Application ID are required");
      if (!req.user) throw new ValidationError("Authentication required");

      const application = await teamsService.reviewApplication(eventId, applicationId, status, req.user.id);
      res.json({ success: true, data: { application } });
    } catch (err) {
      next(err);
    }
  },

  async autoAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const { max_size } = req.body;
      if (!eventId) throw new ValidationError("Event ID is required");

      const result = await teamsService.autoAssign(eventId, max_size || 5);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async deleteTeamByOrganizer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");

      await teamsService.deleteTeamByOrganizer(eventId, teamId);
      res.json({ success: true, data: { message: "Team deleted" } });
    } catch (err) {
      next(err);
    }
  },

  async forceJoinTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const teamId = p(req, "teamId");
      const { user_id } = req.body;
      if (!eventId || !teamId) throw new ValidationError("Event ID and Team ID are required");
      if (!user_id) throw new ValidationError("user_id is required");

      const member = await teamsService.forceJoinTeam(eventId, teamId, user_id);
      res.status(201).json({ success: true, data: { member } });
    } catch (err) {
      next(err);
    }
  },
};
