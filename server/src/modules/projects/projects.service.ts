import { projectsRepository } from "./projects.repository.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  AuthorizationError,
} from "../../middleware/error.middleware.js";

export interface ProjectViewer {
  id: string;
  isOrganizer: boolean;
}

function validateLinks(data: { repo_url?: string | null; demo_url?: string | null }) {
  for (const key of ["repo_url", "demo_url"] as const) {
    const value = data[key];
    if (value != null && value.length > 500) {
      throw new ValidationError(`${key} must be at most 500 characters`);
    }
  }
}

export const projectsService = {
  async list(eventId: string, viewer: ProjectViewer) {
    return projectsRepository.listByEvent(eventId, viewer.id, viewer.isOrganizer);
  },

  async get(eventId: string, projectId: string, viewer: ProjectViewer) {
    const project = await projectsRepository.findById(eventId, projectId);
    if (!project) throw new NotFoundError("Project not found");

    if (project.status === "draft") {
      const isMember = await projectsRepository.isUserTeamMember(
        eventId,
        project.team_id,
        viewer.id
      );
      if (!isMember && !viewer.isOrganizer) throw new NotFoundError("Project not found");
    }
    if (project.status === "disqualified") {
      const isMember = await projectsRepository.isUserTeamMember(
        eventId,
        project.team_id,
        viewer.id
      );
      if (!isMember && !viewer.isOrganizer) throw new NotFoundError("Project not found");
    }
    return project;
  },

  async create(
    eventId: string,
    data: { title: string; description?: string; repo_url?: string; demo_url?: string },
    actor: { id: string }
  ) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError("Title is required");
    }
    validateLinks(data);

    const teamId = await projectsRepository.findTeamIdByUser(eventId, actor.id);
    if (!teamId) {
      throw new ValidationError("You must join a team before creating a project");
    }

    const live = await projectsRepository.findLiveByTeam(eventId, teamId);
    if (live) {
      throw new ConflictError("Your team already has a project submission for this event");
    }

    return projectsRepository.insert(eventId, teamId, {
      title: data.title.trim(),
      description: data.description ?? null,
      repo_url: data.repo_url ?? null,
      demo_url: data.demo_url ?? null,
      status: "draft",
    });
  },

  async update(
    eventId: string,
    projectId: string,
    data: { title?: string; description?: string; repo_url?: string; demo_url?: string },
    actor: ProjectViewer
  ) {
    const project = await projectsRepository.findById(eventId, projectId);
    if (!project) throw new NotFoundError("Project not found");

    if (project.status === "disqualified") {
      throw new ConflictError("This project is locked because it was disqualified");
    }

    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new ValidationError("Title is required");
    }
    validateLinks(data);

    if (project.status === "submitted" && !actor.isOrganizer) {
      throw new ConflictError("Project has already been submitted and can no longer be edited");
    }

    if (project.status === "draft") {
      const isMember = await projectsRepository.isUserTeamMember(
        eventId,
        project.team_id,
        actor.id
      );
      if (!isMember) {
        throw new AuthorizationError("Only members of your team can edit this project");
      }
    }

    const fields: Record<string, any> = {};
    if (data.title !== undefined) fields.title = data.title.trim();
    if (data.description !== undefined) fields.description = data.description;
    if (data.repo_url !== undefined) fields.repo_url = data.repo_url;
    if (data.demo_url !== undefined) fields.demo_url = data.demo_url;

    return projectsRepository.update(eventId, projectId, fields);
  },

  async submit(eventId: string, projectId: string, actor: { id: string }) {
    const project = await projectsRepository.findById(eventId, projectId);
    if (!project) throw new NotFoundError("Project not found");

    if (project.status === "submitted") {
      throw new ConflictError("Project has already been submitted");
    }
    if (project.status === "disqualified") {
      throw new ConflictError("This project was disqualified and cannot be submitted");
    }

    const isMember = await projectsRepository.isUserTeamMember(eventId, project.team_id, actor.id);
    if (!isMember) {
      throw new AuthorizationError("Only members of your team can submit this project");
    }

    return projectsRepository.update(eventId, projectId, {
      status: "submitted",
      submitted_at: new Date().toISOString(),
    });
  },

  async disqualify(eventId: string, projectId: string) {
    const project = await projectsRepository.findById(eventId, projectId);
    if (!project) throw new NotFoundError("Project not found");
    return projectsRepository.update(eventId, projectId, { status: "disqualified" });
  },
};
