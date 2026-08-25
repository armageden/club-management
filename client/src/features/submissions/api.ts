import { api } from '@/lib/api';
import type {
  SubmissionRow,
  TeamRow,
  LeaderboardRow,
  CreateSubmissionRequest,
  CreateTeamRequest,
  SubmitScoreRequest,
} from './types';

export const submissionsApi = {
  list: (eventId: string) => api.get<SubmissionRow[]>('/submissions', { eventId }),

  create: (data: CreateSubmissionRequest) => api.post<SubmissionRow>('/submissions', data),

  listTeams: (eventId: string) => api.get<TeamRow[]>('/submissions/teams', { eventId }),

  createTeam: (data: CreateTeamRequest) => api.post<TeamRow>('/submissions/teams', data),

  submitScore: (submissionId: string, data: SubmitScoreRequest) =>
    api.post(`/submissions/${submissionId}/score`, data),

  leaderboard: (eventId: string) => api.get<LeaderboardRow[]>(`/submissions/leaderboard/${eventId}`),
};

export const submissionsQueryKeys = {
  list: (eventId: string) => ['submissions', 'list', eventId] as const,
  teams: (eventId: string) => ['submissions', 'teams', eventId] as const,
  leaderboard: (eventId: string) => ['submissions', 'leaderboard', eventId] as const,
};
