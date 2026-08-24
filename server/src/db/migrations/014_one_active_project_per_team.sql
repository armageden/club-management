-- Feature 7: one live (draft or submitted) project submission per team per event.
-- Disqualified submissions don't count as live, so a team can resubmit after DQ.

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_submissions_live_per_team
ON project_submissions (event_id, team_id)
WHERE status IN ('draft', 'submitted');
