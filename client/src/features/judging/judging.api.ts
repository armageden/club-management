import { apiRequest } from "../../lib/api";
import type {
  ProjectSubmission,
  SubmitScoresRequest,
  JudgingScore,
  LeaderboardEntry,
} from "@/types/api";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listScorableProjects(
  eventId: string = EVENT_ID
): Promise<ProjectSubmission[]> {
  const res = await apiRequest<{ projects: ProjectSubmission[] }>(
    `/events/${eventId}/judging/projects`
  );
  return res.projects;
}

export async function submitScore(
  eventId: string = EVENT_ID,
  projectId: string,
  data: Omit<SubmitScoresRequest, "project_submission_id">
): Promise<JudgingScore> {
  const res = await apiRequest<{ score: JudgingScore }>(
    `/events/${eventId}/judging/projects/${projectId}/scores`,
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.score;
}

export async function getLeaderboard(eventId: string = EVENT_ID): Promise<LeaderboardEntry[]> {
  const res = await apiRequest<{ leaderboard: LeaderboardEntry[] }>(
    `/events/${eventId}/judging/leaderboard`
  );
  return res.leaderboard;
}
