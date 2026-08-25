import { api } from '@/lib/api';
import type { IncidentRow, IncidentAnalytics, CreateIncidentRequest, UpdateIncidentStatusRequest } from './types';

export const incidentsApi = {
  list: (eventId: string) => api.get<IncidentRow[]>('/incidents', { eventId }),

  create: (data: CreateIncidentRequest) => api.post<IncidentRow>('/incidents', data),

  updateStatus: (incidentId: string, data: UpdateIncidentStatusRequest) =>
    api.patch<IncidentRow>(`/incidents/${incidentId}/status`, data),

  analytics: (eventId: string) => api.get<IncidentAnalytics>(`/incidents/analytics/${eventId}`),
};

export const incidentsQueryKeys = {
  list: (eventId: string) => ['incidents', 'list', eventId] as const,
  analytics: (eventId: string) => ['incidents', 'analytics', eventId] as const,
};
