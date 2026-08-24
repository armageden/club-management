import type { Request, Response, NextFunction } from "express";
import { projectsService } from "./projects.service.js";
import { ValidationError } from "../../middleware/error.middleware.js";
import { p, type AuthRequest } from "../../types/index.js";

type EventRoleRequest = AuthRequest & { eventRole?: string };

export const projectsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const user = (req as EventRoleRequest).user;
      if (!user) throw new ValidationError("Authentication required");
      const isOrganizer = (req as EventRoleRequest).eventRole === "organizer";
      const projects = await projectsService.list(eventId, { id: user.id, isOrganizer });
      res.json({ success: true, data: { projects } });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      if (!eventId) throw new ValidationError("Event ID is required");
      const user = (req as EventRoleRequest).user;
      if (!user) throw new ValidationError("Authentication required");
      const { title, description, repo_url, demo_url } = req.body;
      const project = await projectsService.create(
        eventId,
        { title, description, repo_url, demo_url },
        { id: user.id }
      );
      res.status(201).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const projectId = p(req, "projectId");
      if (!eventId || !projectId)
        throw new ValidationError("Event ID and Project ID are required");
      const user = (req as EventRoleRequest).user;
      if (!user) throw new ValidationError("Authentication required");
      const isOrganizer = (req as EventRoleRequest).eventRole === "organizer";
      const project = await projectsService.get(eventId, projectId, {
        id: user.id,
        isOrganizer,
      });
      res.json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const projectId = p(req, "projectId");
      if (!eventId || !projectId)
        throw new ValidationError("Event ID and Project ID are required");
      const user = (req as EventRoleRequest).user;
      if (!user) throw new ValidationError("Authentication required");
      const isOrganizer = (req as EventRoleRequest).eventRole === "organizer";
      const { title, description, repo_url, demo_url } = req.body;
      const project = await projectsService.update(
        eventId,
        projectId,
        { title, description, repo_url, demo_url },
        { id: user.id, isOrganizer }
      );
      res.json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const projectId = p(req, "projectId");
      if (!eventId || !projectId)
        throw new ValidationError("Event ID and Project ID are required");
      const user = (req as EventRoleRequest).user;
      if (!user) throw new ValidationError("Authentication required");
      const project = await projectsService.submit(eventId, projectId, { id: user.id });
      res.json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  },

  async disqualify(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = p(req, "eventId");
      const projectId = p(req, "projectId");
      if (!eventId || !projectId)
        throw new ValidationError("Event ID and Project ID are required");
      const project = await projectsService.disqualify(eventId, projectId);
      res.json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  },
};
