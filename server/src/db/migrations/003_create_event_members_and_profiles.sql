-- Table 3: event_members
-- Stores user membership and role inside an event

CREATE TABLE IF NOT EXISTS event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'participant', 'volunteer', 'judge')),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON event_members(user_id);

-- Table 4: participant_profiles
-- Stores event-specific participant details

CREATE TABLE IF NOT EXISTS participant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_role VARCHAR(50),
  looking_for_team BOOLEAN DEFAULT false,
  tech_stack_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participant_profiles_event_id ON participant_profiles(event_id);
CREATE INDEX IF NOT EXISTS idx_participant_profiles_user_id ON participant_profiles(user_id);

-- Table 5: tech_stack_tags
-- Stores available technology tags

CREATE TABLE IF NOT EXISTS tech_stack_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50)
);

-- Table 6: participant_tech_stack
-- Links participants to tech stack tags

CREATE TABLE IF NOT EXISTS participant_tech_stack (
  participant_profile_id UUID NOT NULL REFERENCES participant_profiles(id) ON DELETE CASCADE,
  tech_stack_tag_id UUID NOT NULL REFERENCES tech_stack_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (participant_profile_id, tech_stack_tag_id)
);
