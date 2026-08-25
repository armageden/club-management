-- Table 24: volunteer_shifts
-- Stores volunteer shifts

CREATE TABLE IF NOT EXISTS volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
  required_skills TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_event_id ON volunteer_shifts(event_id);

-- Table 25: volunteer_assignments
-- Stores volunteers assigned to shifts

CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_shift_id UUID NOT NULL REFERENCES volunteer_shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'checked_in', 'completed', 'no_show')),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(volunteer_shift_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_shift_id ON volunteer_assignments(volunteer_shift_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_user_id ON volunteer_assignments(user_id);
