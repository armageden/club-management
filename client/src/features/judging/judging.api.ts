import { apiRequest } from "../../lib/api";
import { getActiveEventId } from "../../lib/event-id";
import type {
  ProjectSubmission,
  SubmitScoresRequest,
  JudgingScore,
  LeaderboardEntry,
} from "@/types/api";

export async function listScorableProjects(
  eventId: string = getActiveEventId()
): Promise<ProjectSubmission[]> {
  const res = await apiRequest<{ projects: ProjectSubmission[] }>(
    `/events/${eventId}/judging/projects`
  );
  return res.projects;
}

export async function submitScore(
  eventId: string = getActiveEventId(),
  projectId: string,
  data: Omit<SubmitScoresRequest, "project_submission_id">
): Promise<JudgingScore> {
  const res = await apiRequest<{ score: JudgingScore }>(
    `/events/${eventId}/judging/projects/${projectId}/scores`,
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.score;
}

export async function getLeaderboard(eventId: string = getActiveEventId()): Promise<LeaderboardEntry[]> {
  const res = await apiRequest<{ leaderboard: LeaderboardEntry[] }>(
    `/events/${eventId}/judging/leaderboard`
  );
  return res.leaderboard;
}
