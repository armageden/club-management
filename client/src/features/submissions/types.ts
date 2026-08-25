export type SubmissionStatus = 'draft' | 'submitted' | 'disqualified';

export interface SubmissionRow {
  id: string;
  event_id: string;
  team_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  created_at: string;
  team_name: string | null;
  score_count: number;
}

export interface TeamRow {
  id: string;
  name: string;
  event_id: string;
}

export interface LeaderboardRow {
  submission_id: string;
  title: string;
  repo_url: string | null;
  demo_url: string | null;
  team_name: string;
  total_votes: number;
  final_score: string | number | null;
}

export interface CreateSubmissionRequest {
  eventId: string;
  teamId: string;
  title: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  status: SubmissionStatus;
}

export interface CreateTeamRequest {
  eventId: string;
  name: string;
}

export interface SubmitScoreRequest {
  scoreInnovation: number;
  scoreTechnical: number;
  scorePresentation: number;
  scoreUsefulness: number;
  feedback?: string;
}
