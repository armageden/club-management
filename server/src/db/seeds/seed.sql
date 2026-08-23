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

-- Tech stack tags
INSERT INTO tech_stack_tags (id, name, category) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'JavaScript', 'language'),
  ('b0000000-0000-0000-0000-000000000002', 'TypeScript', 'language'),
  ('b0000000-0000-0000-0000-000000000003', 'Python', 'language'),
  ('b0000000-0000-0000-0000-000000000004', 'React', 'framework'),
  ('b0000000-0000-0000-0000-000000000005', 'Node.js', 'framework'),
  ('b0000000-0000-0000-0000-000000000006', 'Flask', 'framework'),
  ('b0000000-0000-0000-0000-000000000007', 'PostgreSQL', 'database'),
  ('b0000000-0000-0000-0000-000000000008', 'MongoDB', 'database'),
  ('b0000000-0000-0000-0000-000000000009', 'Docker', 'tool'),
  ('b0000000-0000-0000-0000-000000000010', 'AWS', 'platform')
ON CONFLICT (name) DO NOTHING;

-- Sample itinerary items
INSERT INTO itinerary_items (id, event_id, title, description, location, starts_at, ends_at, session_type)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Opening Ceremony', 'Welcome speech and event rules', 'Main Hall', '2026-09-01 09:00:00+00', '2026-09-01 10:00:00+00', 'ceremony'),
  ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Hacking Begins', 'Start working on your projects', 'Open Area', '2026-09-01 10:00:00+00', '2026-09-02 18:00:00+00', 'general'),
  ('c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Mentoring Session', 'Get help from industry experts', 'Room A', '2026-09-01 14:00:00+00', '2026-09-01 16:00:00+00', 'workshop'),
  ('c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Project Submissions', 'Submit your final projects', 'Online', '2026-09-02 16:00:00+00', '2026-09-02 18:00:00+00', 'general'),
  ('c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'Demo Day & Judging', 'Present your projects to judges', 'Main Hall', '2026-09-03 09:00:00+00', '2026-09-03 15:00:00+00', 'presentation'),
  ('c0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'Closing Ceremony', 'Awards and closing remarks', 'Main Hall', '2026-09-03 15:00:00+00', '2026-09-03 18:00:00+00', 'ceremony')
ON CONFLICT (id) DO NOTHING;
