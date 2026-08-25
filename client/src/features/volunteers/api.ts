import { api } from '@/lib/api';
import type {
  VolunteerShiftRow,
  VolunteerAssignmentRow,
  UserOption,
  CreateShiftRequest,
  AssignVolunteerRequest,
  AssignmentStatus,
} from './types';

export const volunteersApi = {
  listShifts: (eventId: string) => api.get<VolunteerShiftRow[]>(`/volunteers/shifts/event/${eventId}`),

  createShift: (data: CreateShiftRequest) => api.post<VolunteerShiftRow>('/volunteers/shifts', data),

  assignVolunteer: (data: AssignVolunteerRequest) =>
    api.post<VolunteerAssignmentRow>('/volunteers/assignments', data),

  updateAssignmentStatus: (assignmentId: string, status: AssignmentStatus) =>
    api.patch<VolunteerAssignmentRow>(`/volunteers/assignments/${assignmentId}/status`, { status }),

  listAssignments: (eventId: string) => api.get<VolunteerAssignmentRow[]>(`/volunteers/assignments/event/${eventId}`),

  listUsers: () => api.get<UserOption[]>('/volunteers/users'),
};

export const volunteersQueryKeys = {
  shifts: (eventId: string) => ['volunteers', 'shifts', eventId] as const,
  assignments: (eventId: string) => ['volunteers', 'assignments', eventId] as const,
  users: () => ['volunteers', 'users'] as const,
};
