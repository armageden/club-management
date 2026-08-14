-- Seed data for hackathon_hub
-- Passwords:
--   admin@hackathon.com -> admin123
--   user@hackathon.com  -> user123

-- Admin user
INSERT INTO users (id, email, password_hash, full_name, global_role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@hackathon.com',
  '$2a$12$nWXtY4xYzMieXyhRHzyLz.X6M8wFktL.zSoVlXlUNtI515hP.E9i6',
  'Admin User',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Regular user
INSERT INTO users (id, email, password_hash, full_name, global_role)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'user@hackathon.com',
  '$2a$12$aHuKsazJmgdbH/pDFu7cFe1daMSNkIrc/SdlN7SWVibHR6gNY9VaO',
  'Regular User',
  'user'
) ON CONFLICT (email) DO NOTHING;

-- Sample event
INSERT INTO events (id, name, slug, description, starts_at, ends_at, status, created_by)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'Hackathon 2026',
  'hackathon-2026',
  'Annual hackathon event for developers and innovators.',
  '2026-09-01 09:00:00+00',
  '2026-09-03 18:00:00+00',
  'active',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (slug) DO NOTHING;

-- Admin as organizer of the event
INSERT INTO event_members (event_id, user_id, role, status)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'organizer',
  'active'
) ON CONFLICT (event_id, user_id) DO NOTHING;

-- Regular user as participant
INSERT INTO event_members (event_id, user_id, role, status)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'participant',
  'active'
) ON CONFLICT (event_id, user_id) DO NOTHING;
