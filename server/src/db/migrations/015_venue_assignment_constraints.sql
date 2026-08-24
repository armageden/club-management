-- Add CHECK constraint on status for venue_assignments
-- (FK on project_submission_id already exists from 008_create_venue.sql)

ALTER TABLE venue_assignments
  ADD CONSTRAINT chk_venue_assignments_status
  CHECK (status IN ('active', 'cancelled'));
