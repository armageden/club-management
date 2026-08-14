-- Table 17: sponsors
-- Stores sponsor records

CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  tier VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_event_id ON sponsors(event_id);

-- Table 18: sponsor_contributions
-- Stores sponsor contributions

CREATE TABLE IF NOT EXISTS sponsor_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contribution_type VARCHAR(20) NOT NULL CHECK (contribution_type IN ('cash', 'in_kind')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sponsor_contributions_event_id ON sponsor_contributions(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_contributions_sponsor_id ON sponsor_contributions(sponsor_id);

-- Table 19: expenditures
-- Stores event spending

CREATE TABLE IF NOT EXISTS expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  vendor VARCHAR(255),
  description TEXT,
  spent_at TIMESTAMP WITH TIME ZONE,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expenditures_event_id ON expenditures(event_id);
