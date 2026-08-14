 # Database Schema

## Database

PostgreSQL

## Rules

- 28 tables total.
- Direct SQL queries only.
- No ORM.
- Use parameterized queries.
- Use transactions for multi-table mutations.
- Use UUID primary keys.
- Use `created_at` and `updated_at` timestamps where appropriate.

---

## Table List

1. users
2. events
3. event_members
4. participant_profiles
5. tech_stack_tags
6. participant_tech_stack
7. teams
8. team_members
9. team_applications
10. hardware_items
11. hardware_checkouts
12. hardware_returns
13. hardware_damage_reports
14. itinerary_items
15. qr_tokens
16. check_ins
17. sponsors
18. sponsor_contributions
19. expenditures
20. venue_locations
21. venue_assignments
22. project_submissions
23. judging_scores
24. volunteer_shifts
25. volunteer_assignments
26. incidents
27. certificates
28. audit_logs

---

## Table 1: users

Stores global user accounts.

### Key Fields

- id
- email
- password_hash
- full_name
- global_role
- created_at
- updated_at

### Notes

- `email` must be unique.
- `global_role` can be `admin` or `user`.

---

## Table 2: events

Stores event records.

### Key Fields

- id
- name
- slug
- description
- starts_at
- ends_at
- status
- settings
- created_by
- created_at
- updated_at

### Notes

- `slug` can be used for URLs.
- `settings` can store JSON configuration such as certificate rules.
- `status` can be `draft`, `active`, `archived`.

---

## Table 3: event_members

Stores user membership and role inside an event.

### Key Fields

- id
- event_id
- user_id
- role
- status
- joined_at

### Roles

- organizer
- participant
- volunteer
- judge

### Notes

- A user can have only one membership row per event.
- Event role is used for authorization.

---

## Table 4: participant_profiles

Stores event-specific participant details.

### Key Fields

- id
- event_id
- user_id
- bio
- experience_level
- preferred_role
- looking_for_team
- tech_stack_summary
- created_at
- updated_at

### Notes

- One participant profile per user per event.
- Used for team formation.

---

## Table 5: tech_stack_tags

Stores available technology tags.

### Key Fields

- id
- name
- category

### Examples

- React
- Node.js
- Python
- Arduino
- Raspberry Pi
- Tailwind
- PostgreSQL

---

## Table 6: participant_tech_stack

Links participants to tech stack tags.

### Key Fields

- participant_profile_id
- tech_stack_tag_id

### Notes

- Composite primary key recommended.
- Supports participant skill matching.

---

## Table 7: teams

Stores teams for an event.

### Key Fields

- id
- event_id
- name
- description
- max_size
- status
- created_by
- created_at
- updated_at

### Notes

- Team belongs to one event.
- `max_size` controls capacity.

---

## Table 8: team_members

Stores team membership.

### Key Fields

- id
- team_id
- user_id
- role
- assigned_by
- joined_at

### Roles

- owner
- member

### Notes

- A user can only be in one team per event.
- `assigned_by` supports admin assignment.

---

## Table 9: team_applications

Stores participant applications to teams.

### Key Fields

- id
- team_id
- participant_profile_id
- message
- status
- reviewed_by
- reviewed_at

### Statuses

- pending
- approved
- rejected

### Notes

- Prevent duplicate pending applications.
- Approval should create a `team_members` row inside a transaction.

---

## Table 10: hardware_items

Stores hardware inventory.

### Key Fields

- id
- event_id
- name
- category
- model
- serial_number
- quantity_available
- condition
- status
- location
- notes
- created_at
- updated_at

### Statuses

- available
- checked_out
- damaged
- lost
- retired

---

## Table 11: hardware_checkouts

Stores hardware checkout records.

### Key Fields

- id
- event_id
- hardware_item_id
- borrower_user_id
- checked_out_by
- checked_out_at
- due_at
- status
- notes

### Statuses

- active
- overdue
- returned
- damaged

### Notes

- Checkout must reduce availability.
- Checkout must be created inside a transaction.

---

## Table 12: hardware_returns

Stores hardware return records.

### Key Fields

- id
- checkout_id
- returned_at
- condition
- received_by
- notes

### Notes

- Return should update checkout status.
- Return should update hardware item condition.
- If damaged, create damage report.

---

## Table 13: hardware_damage_reports

Stores damage reports for hardware.

### Key Fields

- id
- event_id
- hardware_item_id
- checkout_id
- reported_by
- description
- severity
- status
- resolved_at

### Statuses

- open
- resolved

---

## Table 14: itinerary_items

Stores event schedule items.

### Key Fields

- id
- event_id
- title
- description
- location
- starts_at
- ends_at
- session_type
- status
- created_at
- updated_at

### Statuses

- active
- cancelled

### Notes

- Participant dashboards should query this table for live schedule.

---

## Table 15: qr_tokens

Stores QR check-in tokens.

### Key Fields

- id
- event_id
- user_id
- token_hash
- purpose
- expires_at
- used_at
- created_at

### Notes

- Store hashed token, not plain token.
- Token must expire.
- Token must be single-use.

---

## Table 16: check_ins

Stores event and session check-ins.

### Key Fields

- id
- event_id
- user_id
- itinerary_item_id
- method
- checked_in_by
- checked_in_at
- status

### Methods

- qr
- manual

### Notes

- Used for attendance and certificate eligibility.

---

## Table 17: sponsors

Stores sponsor records.

### Key Fields

- id
- event_id
- name
- contact_name
- contact_email
- tier
- notes
- created_at

---

## Table 18: sponsor_contributions

Stores sponsor contributions.

### Key Fields

- id
- sponsor_id
- event_id
- contribution_type
- amount
- description
- received_at
- recorded_by

### Contribution Types

- cash
- in_kind

---

## Table 19: expenditures

Stores event spending.

### Key Fields

- id
- event_id
- category
- amount
- vendor
- description
- spent_at
- recorded_by
- approved_by

### Categories

Examples:

- venue
- catering
- swag
- hardware
- marketing
- logistics
- other

---

## Table 20: venue_locations

Stores venue spaces.

### Key Fields

- id
- event_id
- name
- location_type
- capacity
- description
- created_at

### Location Types

- room
- booth
- table
- stage
- lab
- desk

---

## Table 21: venue_assignments

Stores assignments of teams or projects to venue locations.

### Key Fields

- id
- event_id
- venue_location_id
- assignable_type
- team_id
- project_submission_id
- starts_at
- ends_at
- assigned_by
- status

### Assignable Types

- team
- project
- exhibit

### Notes

- Must prevent double-booking.
- Conflict check should happen inside a transaction.

---

## Table 22: project_submissions

Stores team project submissions.

### Key Fields

- id
- event_id
- team_id
- title
- description
- repo_url
- demo_url
- status
- submitted_at
- created_at
- updated_at

### Statuses

- draft
- submitted
- disqualified

### Notes

- A team can have one active project submission per event.

---

## Table 23: judging_scores

Stores judge scores for projects.

### Key Fields

- id
- project_submission_id
- judge_user_id
- score_total
- score_innovation
- score_technical
- score_presentation
- score_usefulness
- feedback
- submitted_at

### Notes

- One score per judge per project.
- Leaderboard is calculated from this table.

---

## Table 24: volunteer_shifts

Stores volunteer shifts.

### Key Fields

- id
- event_id
- title
- description
- location
- starts_at
- ends_at
- capacity
- required_skills
- status

---

## Table 25: volunteer_assignments

Stores volunteers assigned to shifts.

### Key Fields

- id
- volunteer_shift_id
- user_id
- status
- assigned_by
- checked_in_at
- completed_at

### Statuses

- assigned
- checked_in
- completed
- no_show

### Notes

- Must prevent overlapping volunteer assignments.

---

## Table 26: incidents

Stores event incident reports.

### Key Fields

- id
- event_id
- title
- description
- severity
- status
- location
- reported_by
- assigned_to
- occurred_at
- resolved_at

### Severity Levels

- low
- medium
- high
- critical

### Statuses

- open
- investigating
- resolved

---

## Table 27: certificates

Stores certificate eligibility and issuance.

### Key Fields

- id
- event_id
- user_id
- certificate_type
- status
- verification_code
- issued_at
- revoked_at
- metadata

### Certificate Types

- attendance
- completion
- volunteer
- judge

### Statuses

- eligible
- issued
- revoked

---

## Table 28: audit_logs

Stores important actions for auditing.

### Key Fields

- id
- event_id
- user_id
- action
- entity_type
- entity_id
- old_values
- new_values
- created_at

### Notes

- Use for important create, update, delete, and approval actions.
- `old_values` and `new_values` can be JSONB.

---

## Relationship Overview

### Users

A user can:

- Belong to many events through `event_members`.
- Have one participant profile per event.
- Join one team per event.
- Borrow hardware.
- Report incidents.
- Receive certificates.

### Events

An event can have many:

- Members.
- Participant profiles.
- Teams.
- Hardware items.
- Itinerary items.
- Check-ins.
- Sponsors.
- Expenditures.
- Venue locations.
- Venue assignments.
- Project submissions.
- Volunteer shifts.
- Incidents.
- Certificates.

### Teams

A team can have many:

- Team members.
- Team applications.
- Project submissions.
- Venue assignments.

### Hardware

A hardware item can have many:

- Checkouts.
- Returns through checkouts.
- Damage reports.

### Projects

A project submission can have many:

- Judging scores.
- Venue assignments.

### Volunteers

A volunteer shift can have many:

- Volunteer assignments.

A volunteer user can have many:

- Volunteer assignments.

---

## Important Constraints

### Unique Constraints

- `users.email`
- `events.slug`
- One event member per user per event.
- One participant profile per user per event.
- One team member row per user per team.
- One judge score per judge per project.

### Foreign Keys

All event-scoped tables should reference `events.id`.

All user references should reference `users.id`.

All team references should reference `teams.id`.

All hardware references should reference `hardware_items.id`.

### Conflict Prevention

The following operations must check for conflicts inside a transaction:

- Venue assignment double-booking.
- Volunteer shift overlap.
- Hardware checkout availability.
- Team capacity.
- Duplicate team membership.
- Duplicate judge scoring.