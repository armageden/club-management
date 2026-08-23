-- Table 20: venue_locations
-- Stores venue spaces

CREATE TABLE IF NOT EXISTS venue_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('room', 'booth', 'table', 'stage', 'lab', 'desk')),
  capacity INTEGER CHECK (capacity > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_locations_event_id ON venue_locations(event_id);

-- Table 21: venue_assignments
-- Stores assignments of teams or projects to venue locations

CREATE TABLE IF NOT EXISTS venue_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_location_id UUID NOT NULL REFERENCES venue_locations(id) ON DELETE CASCADE,
  assignable_type VARCHAR(20) NOT NULL CHECK (assignable_type IN ('team', 'project', 'exhibit')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  project_submission_id UUID,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_venue_assignments_event_id ON venue_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_assignments_location_id ON venue_assignments(venue_location_id);
