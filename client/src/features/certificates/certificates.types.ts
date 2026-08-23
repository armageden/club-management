export interface Certificate {
  id: string;
  event_id: string;
  user_id: string;
  certificate_type: string;
  status: string;
  verification_code: string | null;
  issued_at: string | null;
  revoked_at: string | null;
  metadata: Record<string, any>;
  full_name: string;
  email: string;
}

export interface EligibilityEntry {
  user_id: string;
  full_name: string;
  email: string;
  eligible: boolean;
  has_checkin: boolean;
  has_team: boolean;
  has_project: boolean;
  already_certified: boolean;
}
