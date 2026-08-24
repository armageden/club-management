import { apiRequest } from "../../lib/api";
import { getActiveEventId } from "../../lib/event-id";
import type {
  ProjectSubmission,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/api";

export async function listProjects(eventId: string = getActiveEventId()): Promise<ProjectSubmission[]> {
  const res = await apiRequest<{ projects: ProjectSubmission[] }>(`/events/${eventId}/projects`);
  return res.projects;
}

export async function createProject(
  eventId: string = getActiveEventId(),
  data: CreateProjectRequest
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(`/events/${eventId}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.project;
}

export async function getProject(
  eventId: string = getActiveEventId(),
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}`
  );
  return res.project;
}

export async function updateProject(
  eventId: string = getActiveEventId(),
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
  return res.project;
}

export async function submitProject(
  eventId: string = getActiveEventId(),
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}/submit`,
    { method: "POST" }
  );
  return res.project;
}

export async function disqualifyProject(
  eventId: string = getActiveEventId(),
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}/disqualify`,
    { method: "POST" }
  );
  return res.project;
}
