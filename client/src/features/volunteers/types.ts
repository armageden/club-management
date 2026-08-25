export type ShiftStatus = 'open' | 'full' | 'cancelled';
export type AssignmentStatus = 'assigned' | 'checked_in' | 'completed' | 'no_show';

export interface VolunteerShiftRow {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  required_skills: string | null;
  status: ShiftStatus;
  filled_slots: number;
}

export interface VolunteerAssignmentRow {
  id: string;
  volunteer_shift_id: string;
  user_id: string;
  status: AssignmentStatus;
  assigned_by: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  shift_title: string;
  shift_starts_at: string;
  shift_ends_at: string;
  volunteer_name: string;
  volunteer_email: string;
}

export interface UserOption {
  id: string;
  email: string;
  full_name: string;
  global_role: string;
}

export interface CreateShiftRequest {
  eventId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  requiredSkills?: string;
  status: ShiftStatus;
}

export interface AssignVolunteerRequest {
  shiftId: string;
  userId: string;
}
