import { apiRequest } from "../../lib/api";
import type {
  ProjectSubmission,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/api";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listProjects(eventId: string = EVENT_ID): Promise<ProjectSubmission[]> {
  const res = await apiRequest<{ projects: ProjectSubmission[] }>(`/events/${eventId}/projects`);
  return res.projects;
}

export async function createProject(
  eventId: string = EVENT_ID,
  data: CreateProjectRequest
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(`/events/${eventId}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.project;
}

export async function getProject(
  eventId: string = EVENT_ID,
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}`
  );
  return res.project;
}

export async function updateProject(
  eventId: string = EVENT_ID,
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
  eventId: string = EVENT_ID,
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}/submit`,
    { method: "POST" }
  );
  return res.project;
}

export async function disqualifyProject(
  eventId: string = EVENT_ID,
  projectId: string
): Promise<ProjectSubmission> {
  const res = await apiRequest<{ project: ProjectSubmission }>(
    `/events/${eventId}/projects/${projectId}/disqualify`,
    { method: "POST" }
  );
  return res.project;
}
