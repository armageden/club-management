export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface IncidentRow {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string | null;
  reported_by: string;
  assigned_to: string | null;
  occurred_at: string;
  resolved_at: string | null;
  reporter_name: string | null;
  assignee_name: string | null;
}

export interface IncidentAnalytics {
  incidentsBySeverity: { severity: string; count: number }[];
  incidentsByStatus: { status: string; count: number }[];
  volunteerOverview: {
    total_shifts?: number;
    total_capacity_needed?: number;
    total_volunteers_assigned?: number;
    total_attended?: number;
  };
}

export interface CreateIncidentRequest {
  eventId: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location?: string;
  occurredAt?: string;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}
