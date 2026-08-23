# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hackathon Operations Hub** — a unified web-based event management platform for hackathons covering inventory, teams, scheduling, finance, certificates, venue booking, project judging, volunteer coordination, and incident tracking.

**Status:** Pre-implementation. Documentation and schema design are complete; no application code exists yet.

## Architecture

3-tier web application:
- **Frontend:** HTML, CSS, JavaScript, Bootstrap (Jinja templates if using Flask)
- **Backend:** Python (Flask or FastAPI recommended)
- **Database:** PostgreSQL — 28 tables across 10 modules

### Critical Constraint: No ORM

All database access must use **raw SQL queries** with parameterized queries. No SQLAlchemy ORM, Hibernate, Eloquent, Sequelize, or Entity Framework. Use raw SQL, stored procedures/functions, and views directly.

```python
# Correct — parameterized query
cur.execute("SELECT * FROM users WHERE email = %s", (email,))

# Wrong — never do this
cur.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

## User Roles

| Role | Access Level |
|---|---|
| Admin | Full access to all modules |
| Organizer | Manage event modules (schedule, venue, budget, volunteers) |
| Participant | View schedule, join teams, submit projects, report incidents |
| Judge | View assigned submissions, enter scores |
| Volunteer | View and join shifts |

Roles are stored in the `users.role` column with CHECK constraint. Role-based route protection is required.

## Database Schema

Detailed schema is in [schema-documentation.md](schema-documentation.md). Key reference files:
- [ARCHITECTURE.md](ARCHITECTURE.md) — full architecture, SQL schema DDL, sample queries, stored functions
- [prd.md](prd.md) — feature requirements and acceptance criteria
- [schema.md](schema.md) — Graphviz relational schema diagram (DOT format)
- [schema-documentation.md](schema-documentation.md) — per-table column/constraint reference

### Schema Design Notes
- All primary keys are `BIGSERIAL`
- All timestamps use `TIMESTAMPTZ`
- Financial amounts use `NUMERIC(12,2)` (no floating point)
- Status/lifecycle fields use `VARCHAR` + `CHECK` constraints (not enums)
- Junction tables for M:N relationships: `user_skills`, `team_members`, `checkins`, `shift_assignments`, `feedback_answers`
- User subtype roles (admin, organizer, judge, volunteer) are in the `users.role` column — not separate tables

### Key Business Logic (SQL-level)
- Hardware checkout uses transactions with availability check (`quantity_available > 0`)
- Venue double-booking prevented via overlap range query
- Duplicate check-in prevented via `UNIQUE(user_id, session_id)` + `ON CONFLICT DO NOTHING`
- Certificate eligibility uses CTE with attendance threshold subquery
- Judging leaderboard uses weighted average (innovation 30%, technical 30%, presentation 20%, impact 20%)

## 9 Feature Modules

| # | Module | Key Tables |
|---|---|---|
| 1 | Hardware Inventory Tracker | `inventory_items`, `inventory_checkouts`, `damage_reports` |
| 2 | Participant & Team Formation | `team_requests`, `teams`, `team_members`, `profiles`, `skills`, `user_skills` |
| 3 | Dynamic Itinerary & Check-in | `sessions`, `checkins` |
| 4 | Budget & Sponsorship Ledger | `sponsors`, `contributions`, `expenses` |
| 5 | Automated Certificate Log | `certificate_rules`, `certificates` |
| 6 | Venue & Logistics Mapping | `venue_areas`, `bookings` |
| 7 | Project Submission & Judging | `projects`, `project_submissions`, `judging_scores` |
| 8 | Volunteer Shift Management | `volunteer_shifts`, `shift_assignments` |
| 9 | Incident Reporting & Analytics | `incidents`, `incident_comments`, `feedback_forms`, `feedback_questions`, `feedback_responses`, `feedback_answers` |

Login/logout/signup are system utilities, not counted as features.

## Suggested Backend Structure

```
backend/
├── app.py           # Application entry point
├── config.py        # Configuration
├── db.py            # Database connection helper
├── auth/            # Signup, login, logout, role middleware
├── inventory/       # Feature 1
├── teams/           # Feature 2
├── schedule/        # Feature 3
├── finance/         # Feature 4
├── certificates/    # Feature 5
├── venue/           # Feature 6
├── projects/        # Feature 7
├── volunteers/      # Feature 8
└── incidents/       # Feature 9
```

## Diagram Files

- `eer-diagram.pdf` — EER diagram export
- `graphEER.svg` — EER diagram (SVG)
- ` schemaschemagraph.svg` — Schema diagram (SVG)
- `User and Team Management-EER.png` — EER diagram (PNG)
