-- Add created_at to hardware_damage_reports.
-- 005 created this table without a creation timestamp, but
-- listDamageReports and getItemTimeline both ORDER BY / SELECT hdr.created_at,
-- so both endpoints failed with "column does not exist" at runtime.

ALTER TABLE hardware_damage_reports
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
