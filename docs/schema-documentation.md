# Hackathon Operations Hub - Database Schema Documentation

## Overview

**Database:** PostgreSQL
**Total Tables:** 28
**Modules:** 10
**Architecture:** Raw SQL (No ORM)

This document provides a complete reference for the database schema used in the Hackathon Operations Hub platform.

---

## Module 1: Users & Profiles

### 1.1 users
Core user account table storing authentication and role information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(150) | NOT NULL | User's full name |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'participant' | User role |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Role CHECK Constraint:** admin, organizer, participant, judge, volunteer

### 1.2 profiles
Extended user profile information with 1:1 relationship to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | PRIMARY KEY, FK → users(id) ON DELETE CASCADE | Reference to user |
| bio | TEXT | | User biography |
| experience_level | VARCHAR(20) | | Technical experience level |
| github_url | VARCHAR(255) | | GitHub profile URL |
| portfolio_url | VARCHAR(255) | | Portfolio website URL |
| seeking_team | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether user is looking for a team |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last profile update |

**Experience Level CHECK Constraint:** beginner, intermediate, advanced

### 1.3 skills
Master list of technical skills available in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique skill identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Skill name |

### 1.4 user_skills
Junction table for many-to-many relationship between users and skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | PRIMARY KEY, FK → users(id) ON DELETE CASCADE | Reference to user |
| skill_id | BIGINT | PRIMARY KEY, FK → skills(id) ON DELETE CASCADE | Reference to skill |

---

## Module 2: Team Formation

### 2.1 team_requests
Requests from users seeking team members for hackathon projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique request identifier |
| user_id | BIGINT | UNIQUE, NOT NULL, FK → users(id) ON DELETE CASCADE | Requesting user |
| tech_stack | TEXT | NOT NULL | Preferred technology stack |
| goals | TEXT | | Project goals and objectives |
| desired_team_size | INT | NOT NULL, DEFAULT 4 | Target team size |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Request status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Request creation time |

**Status CHECK Constraint:** open, matched, cancelled
**Desired Team Size CHECK Constraint:** 2-10

### 2.2 teams
Hackathon teams formed for project development.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique team identifier |
| name | VARCHAR(120) | UNIQUE, NOT NULL | Team name |
| theme | VARCHAR(150) | | Project theme or focus area |
| capacity | INT | NOT NULL, DEFAULT 4 | Maximum team size |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Team status |
| created_by | BIGINT | FK → users(id) | Team creator |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Team creation time |

**Status CHECK Constraint:** open, locked, disqualified
**Capacity CHECK Constraint:** 1-10

### 2.3 team_members
Junction table for many-to-many relationship between teams and users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| team_id | BIGINT | PRIMARY KEY, FK → teams(id) ON DELETE CASCADE | Reference to team |
| user_id | BIGINT | PRIMARY KEY, FK → users(id) ON DELETE CASCADE | Reference to user |
| member_role | VARCHAR(50) | NOT NULL, DEFAULT 'member' | Role within team |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when user joined |

---

## Module 3: Hardware Inventory

### 3.1 inventory_items
Physical hardware and equipment available for checkout.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique item identifier |
| name | VARCHAR(150) | NOT NULL | Item name |
| category | VARCHAR(80) | NOT NULL | Item category |
| serial_number | VARCHAR(120) | UNIQUE | Manufacturer serial number |
| description | TEXT | | Detailed item description |
| condition | VARCHAR(20) | NOT NULL, DEFAULT 'good' | Current condition |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'available' | Availability status |
| quantity_total | INT | NOT NULL | Total quantity in inventory |
| quantity_available | INT | NOT NULL | Currently available quantity |
| location | VARCHAR(120) | | Storage location |
| qr_code | TEXT | | QR code data for scanning |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Condition CHECK Constraint:** new, good, fair, damaged, retired
**Status CHECK Constraint:** available, checked_out, maintenance, retired

### 3.2 inventory_checkouts
Records of hardware items checked out by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique checkout identifier |
| item_id | BIGINT | NOT NULL, FK → inventory_items(id) | Item being checked out |
| borrower_id | BIGINT | NOT NULL, FK → users(id) | User borrowing the item |
| checked_out_by | BIGINT | NOT NULL, FK → users(id) | Staff member who processed checkout |
| checkout_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Checkout timestamp |
| due_at | TIMESTAMPTZ | NOT NULL | Expected return date |
| returned_at | TIMESTAMPTZ | | Actual return timestamp |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Checkout status |
| notes | TEXT | | Additional notes |

**Status CHECK Constraint:** active, returned, overdue, damaged, lost

### 3.3 damage_reports
Reports of damaged or malfunctioning inventory items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique report identifier |
| item_id | BIGINT | NOT NULL, FK → inventory_items(id) | Damaged item |
| checkout_id | BIGINT | FK → inventory_checkouts(id) | Related checkout (if applicable) |
| reported_by | BIGINT | NOT NULL, FK → users(id) | User who reported damage |
| severity | VARCHAR(20) | NOT NULL | Damage severity level |
| description | TEXT | NOT NULL | Detailed damage description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Report status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Report creation time |

**Severity CHECK Constraint:** minor, major, critical
**Status CHECK Constraint:** open, repairing, resolved, retired

---

## Module 4: Schedule & Check-in

### 4.1 sessions
Hackathon event sessions including workshops, keynotes, and activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique session identifier |
| title | VARCHAR(180) | NOT NULL | Session title |
| session_type | VARCHAR(40) | NOT NULL | Type of session |
| start_at | TIMESTAMPTZ | NOT NULL | Session start time |
| end_at | TIMESTAMPTZ | NOT NULL | Session end time |
| venue_area | VARCHAR(120) | | Location within venue |
| capacity | INT | | Maximum attendees |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'scheduled' | Session status |

**Session Type CHECK Constraint:** keynote, workshop, mentoring, demo, break, judging, other
**Status CHECK Constraint:** scheduled, live, cancelled, completed

### 4.2 checkins
Junction table tracking user attendance at sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique check-in identifier |
| user_id | BIGINT | NOT NULL, FK → users(id) | User checking in |
| session_id | BIGINT | NOT NULL, FK → sessions(id) | Session being attended |
| method | VARCHAR(10) | NOT NULL, DEFAULT 'manual' | Check-in method |
| checked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Check-in timestamp |

**Method CHECK Constraint:** qr, manual
**UNIQUE Constraint:** (user_id, session_id)

---

## Module 5: Finance

### 5.1 sponsors
Companies and organizations sponsoring the hackathon.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique sponsor identifier |
| name | VARCHAR(150) | UNIQUE, NOT NULL | Sponsor name |
| tier | VARCHAR(50) | | Sponsorship tier |
| contact_email | VARCHAR(255) | | Primary contact email |
| contact_phone | VARCHAR(30) | | Primary contact phone |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Tier CHECK Constraint:** title, gold, silver, bronze, partner

### 5.2 contributions
Financial and in-kind contributions from sponsors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique contribution identifier |
| sponsor_id | BIGINT | NOT NULL, FK → sponsors(id) ON DELETE CASCADE | Contributing sponsor |
| amount | NUMERIC(12,2) | NOT NULL | Contribution amount |
| contribution_type | VARCHAR(20) | NOT NULL, DEFAULT 'cash' | Type of contribution |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pledged' | Contribution status |
| received_at | TIMESTAMPTZ | | Date contribution received |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Contribution Type CHECK Constraint:** cash, in-kind
**Status CHECK Constraint:** pledged, received, cancelled

### 5.3 expenses
Hackathon operational expenses and budget tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique expense identifier |
| category | VARCHAR(40) | NOT NULL | Expense category |
| amount | NUMERIC(12,2) | NOT NULL | Expense amount |
| spent_at | TIMESTAMPTZ | NOT NULL | Date expense occurred |
| description | TEXT | | Expense description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Approval status |
| approved_by | BIGINT | FK → users(id) | User who approved expense |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Category CHECK Constraint:** venue, catering, swag, equipment, logistics, other
**Status CHECK Constraint:** draft, submitted, approved, rejected

---

## Module 6: Certificates

### 6.1 certificate_rules
Configuration rules for certificate eligibility.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique rule identifier |
| min_session_checkins | INT | NOT NULL, DEFAULT 3 | Minimum sessions to attend |
| require_project_submission | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether project submission required |
| min_project_score | NUMERIC(5,2) | | Minimum project score threshold |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether rule is currently active |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### 6.2 certificates
Certificates issued to qualifying participants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique certificate identifier |
| user_id | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE | Certificate recipient |
| verification_code | VARCHAR(100) | UNIQUE, NOT NULL | Unique verification code |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'eligible' | Certificate status |
| issued_at | TIMESTAMPTZ | | Date certificate issued |
| reason | TEXT | | Reason for status (if revoked) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Status CHECK Constraint:** eligible, issued, revoked

---

## Module 7: Venue & Logistics

### 7.1 venue_areas
Physical spaces within the hackathon venue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique area identifier |
| name | VARCHAR(120) | UNIQUE, NOT NULL | Area name |
| area_type | VARCHAR(20) | NOT NULL | Type of venue area |
| capacity | INT | NOT NULL, DEFAULT 2 | Maximum occupancy |
| map_location | VARCHAR(120) | | Location on venue map |
| is_bookable | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether area can be reserved |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Area Type CHECK Constraint:** table, booth, room, stage, lab, exhibit

### 7.2 bookings
Reservations for venue areas by teams and projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique booking identifier |
| area_id | BIGINT | NOT NULL, FK → venue_areas(id) ON DELETE CASCADE | Booked area |
| team_id | BIGINT | FK → teams(id) ON DELETE SET NULL | Booking team |
| project_id | BIGINT | FK → projects(id) ON DELETE SET NULL | Associated project |
| purpose | VARCHAR(180) | | Booking purpose |
| start_at | TIMESTAMPTZ | NOT NULL | Booking start time |
| end_at | TIMESTAMPTZ | NOT NULL | Booking end time |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'confirmed' | Booking status |
| assigned_by | BIGINT | FK → users(id) | User who made assignment |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Status CHECK Constraint:** tentative, confirmed, cancelled, completed
**CHECK Constraint:** team_id IS NOT NULL OR project_id IS NOT NULL OR purpose IS NOT NULL

---

## Module 8: Projects & Judging

### 8.1 projects
Hackathon projects developed by teams.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique project identifier |
| team_id | BIGINT | UNIQUE, FK → teams(id) ON DELETE CASCADE | Developing team |
| title | VARCHAR(180) | NOT NULL | Project title |
| problem_statement | TEXT | | Problem being solved |
| tech_stack | TEXT | | Technologies used |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'idea' | Project status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Status CHECK Constraint:** idea, active, submitted, disqualified

### 8.2 project_submissions
Final project submissions with links and materials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique submission identifier |
| project_id | BIGINT | NOT NULL, FK → projects(id) ON DELETE CASCADE | Submitted project |
| repo_url | VARCHAR(255) | | Source code repository URL |
| demo_url | VARCHAR(255) | | Live demo URL |
| video_url | VARCHAR(255) | | Demo video URL |
| submission_status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Submission status |
| submitted_at | TIMESTAMPTZ | | Submission timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Submission Status CHECK Constraint:** draft, submitted, locked

### 8.3 judging_scores
Scores assigned by judges to project submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique score identifier |
| submission_id | BIGINT | NOT NULL, FK → project_submissions(id) ON DELETE CASCADE | Judged submission |
| judge_id | BIGINT | NOT NULL, FK → users(id) | Judge user |
| innovation | INT | NOT NULL | Innovation score (0-10) |
| technical | INT | NOT NULL | Technical implementation score (0-10) |
| presentation | INT | NOT NULL | Presentation quality score (0-10) |
| impact | INT | NOT NULL | Potential impact score (0-10) |
| comments | TEXT | | Judge feedback comments |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Scoring timestamp |

**UNIQUE Constraint:** (submission_id, judge_id)
**CHECK Constraints:** All score fields must be between 0 and 10

---

## Module 9: Volunteer Shifts

### 9.1 volunteer_shifts
Available volunteer work shifts during the hackathon.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique shift identifier |
| title | VARCHAR(150) | NOT NULL | Shift title |
| area | VARCHAR(120) | | Work area or location |
| start_at | TIMESTAMPTZ | NOT NULL | Shift start time |
| end_at | TIMESTAMPTZ | NOT NULL | Shift end time |
| capacity | INT | NOT NULL | Maximum volunteers needed |
| required_skills | TEXT | | Skills required for shift |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Shift status |

**Status CHECK Constraint:** open, closed, cancelled

### 9.2 shift_assignments
Junction table for volunteer shift assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| shift_id | BIGINT | PRIMARY KEY, FK → volunteer_shifts(id) ON DELETE CASCADE | Assigned shift |
| user_id | BIGINT | PRIMARY KEY, FK → users(id) ON DELETE CASCADE | Volunteer user |
| assigned_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Assignment timestamp |
| checked_in_at | TIMESTAMPTZ | | Check-in timestamp |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'assigned' | Assignment status |

**Status CHECK Constraint:** assigned, checked_in, cancelled, completed

---

## Module 10: Incidents & Feedback

### 10.1 incidents
Incident reports for issues during the hackathon.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique incident identifier |
| title | VARCHAR(180) | NOT NULL | Incident title |
| description | TEXT | NOT NULL | Detailed description |
| category | VARCHAR(40) | NOT NULL | Incident category |
| severity | VARCHAR(20) | NOT NULL | Severity level |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Incident status |
| reported_by | BIGINT | NOT NULL, FK → users(id) | Reporting user |
| assigned_to | BIGINT | FK → users(id) | Assigned handler |
| resolved_at | TIMESTAMPTZ | | Resolution timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Report creation time |

**Category CHECK Constraint:** safety, hardware, network, conduct, logistics, other
**Severity CHECK Constraint:** low, medium, high, critical
**Status CHECK Constraint:** open, in_progress, resolved, closed

### 10.2 incident_comments
Comments and updates on incident reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique comment identifier |
| incident_id | BIGINT | NOT NULL, FK → incidents(id) ON DELETE CASCADE | Parent incident |
| user_id | BIGINT | NOT NULL, FK → users(id) | Commenting user |
| comment | TEXT | NOT NULL | Comment text |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Comment timestamp |

### 10.3 feedback_forms
Feedback collection forms for hackathon evaluation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique form identifier |
| title | VARCHAR(180) | NOT NULL | Form title |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether form is accepting responses |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Form creation time |

### 10.4 feedback_questions
Questions within feedback forms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique question identifier |
| form_id | BIGINT | NOT NULL, FK → feedback_forms(id) ON DELETE CASCADE | Parent form |
| label | TEXT | NOT NULL | Question text |
| question_type | VARCHAR(20) | NOT NULL | Type of question |
| options | TEXT | | Answer options (for choice questions) |

**Question Type CHECK Constraint:** rating, text, choice

### 10.5 feedback_responses
User responses to feedback forms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique response identifier |
| form_id | BIGINT | NOT NULL, FK → feedback_forms(id) ON DELETE CASCADE | Responded form |
| user_id | BIGINT | NOT NULL, FK → users(id) | Responding user |
| submitted_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Response timestamp |

**UNIQUE Constraint:** (form_id, user_id)

### 10.6 feedback_answers
Junction table linking responses to specific question answers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| response_id | BIGINT | PRIMARY KEY, FK → feedback_responses(id) ON DELETE CASCADE | Parent response |
| question_id | BIGINT | PRIMARY KEY, FK → feedback_questions(id) ON DELETE CASCADE | Answered question |
| rating | INT | | Rating value (for rating questions) |
| text_value | TEXT | | Text answer (for text questions) |

**Rating CHECK Constraint:** 1-5

---

## Entity Relationship Summary

### One-to-One Relationships (1:1)
- users ↔ profiles
- teams ↔ projects

### One-to-Many Relationships (1:N)
- users → team_requests
- users → inventory_checkouts (as borrower)
- users → inventory_checkouts (as staff)
- users → damage_reports
- users → certificates
- users → expenses (as approver)
- users → incidents (as reporter)
- users → incidents (as assignee)
- users → incident_comments
- users → feedback_responses
- inventory_items → inventory_checkouts
- inventory_items → damage_reports
- inventory_checkouts → damage_reports
- teams → bookings
- projects → bookings
- projects → project_submissions
- project_submissions → judging_scores
- sponsors → contributions
- venue_areas → bookings
- feedback_forms → feedback_questions
- feedback_forms → feedback_responses

### Many-to-Many Relationships (M:N)
- users ↔ skills (via user_skills)
- users ↔ teams (via team_members)
- users ↔ sessions (via checkins)
- users ↔ volunteer_shifts (via shift_assignments)
- feedback_responses ↔ feedback_questions (via feedback_answers)

### Governance Relationships (No FK)
- certificate_rules → certificates (business logic, not FK)

---

## Indexes and Performance Considerations

### Recommended Indexes
- `users.email` - UNIQUE index for login queries
- `users.role` - Index for role-based filtering
- `sessions.start_at, sessions.end_at` - Composite index for schedule queries
- `inventory_items.status` - Index for availability filtering
- `inventory_checkouts.due_at` - Index for overdue checkout queries
- `projects.status` - Index for project status filtering
- `incidents.status, incidents.severity` - Composite index for incident management

### Query Optimization Notes
- Use TIMESTAMPTZ for all timestamp columns to handle timezone conversions
- NUMERIC(12,2) for financial calculations to avoid floating-point precision issues
- BIGSERIAL for all primary keys to support large-scale events
- CASCADE deletes on junction tables to maintain referential integrity

---

## Data Integrity Rules

### CHECK Constraints
All enumerated fields use CHECK constraints to ensure data validity:
- Status fields: Consistent status workflows across modules
- Role fields: Controlled vocabularies for user and member roles
- Score fields: Bounded ranges (0-10 for judging, 1-5 for ratings)

### Foreign Key Actions
- **ON DELETE CASCADE:** Used for dependent records (profiles, junction tables)
- **ON DELETE SET NULL:** Used for optional references (bookings → teams)

### Unique Constraints
- Natural keys: email, serial_number, name fields
- Composite keys: Junction table primary keys
- Business rules: (user_id, session_id) for checkins, (submission_id, judge_id) for scores

---

## Migration Strategy

Since the project uses raw SQL without an ORM:
1. Create migration files in `/migrations/` directory
2. Use sequential numbering: `001_create_users.sql`, `002_create_profiles.sql`, etc.
3. Include both UP and DOWN migrations for rollback capability
4. Test migrations against a development database before production

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-03 | Initial schema documentation |

---

*Generated from ARCHITECTURE.md - Hackathon Operations Hub*
