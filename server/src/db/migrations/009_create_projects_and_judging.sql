-- Table 22: project_submissions
-- Stores team project submissions

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  repo_url VARCHAR(500),
  demo_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'disqualified')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_submissions_event_id ON project_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_team_id ON project_submissions(team_id);

-- Add FK from venue_assignments to project_submissions
ALTER TABLE venue_assignments
  ADD CONSTRAINT fk_venue_assignments_project_submission
  FOREIGN KEY (project_submission_id) REFERENCES project_submissions(id) ON DELETE SET NULL;

-- Table 23: judging_scores
-- Stores judge scores for projects

CREATE TABLE IF NOT EXISTS judging_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_submission_id UUID NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  judge_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score_total NUMERIC(5, 2),
  score_innovation NUMERIC(5, 2) CHECK (score_innovation >= 0 AND score_innovation <= 100),
  score_technical NUMERIC(5, 2) CHECK (score_technical >= 0 AND score_technical <= 100),
  score_presentation NUMERIC(5, 2) CHECK (score_presentation >= 0 AND score_presentation <= 100),
  score_usefulness NUMERIC(5, 2) CHECK (score_usefulness >= 0 AND score_usefulness <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(project_submission_id, judge_user_id)
);

CREATE INDEX IF NOT EXISTS idx_judging_scores_project_id ON judging_scores(project_submission_id);
