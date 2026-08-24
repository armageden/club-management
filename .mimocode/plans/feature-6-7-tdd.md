# Implementation Plan — Features 6 & 7 (TDD)

Status: DRAFT for user review · Scope: Feature 6 (Venue & Logistics Mapping), then Feature 7 (Project Submission & Judging Pipeline)
Method: test-driven development, mirroring `hardware.service.test.ts` house style.

---

## 0. Testing approach

- **Backend TDD loop per module**: write failing `*.service.test.ts` first → implement repository + service → thin controller/routes → mount → verify.
- Test style = existing convention: vitest, `vi.mock` the repository module, assert business rules throw (`ValidationError` / `NotFoundError` / `ConflictError`) and that mutating repo calls did **not** happen on rejection.
- New suites: `venue.service.test.ts`, `projects.service.test.ts`, `judging.service.test.ts`. Existing 16 hardware tests must stay green throughout.
- **Client testing infra (new)**: add `vitest + @testing-library/react + jsdom` to `client/` with a handful of smoke tests per page (renders, role-gated UI, API-error states). Marked optional — say the word to drop it.
- Verification gate per feature (same as merge wiring): server tsc, client tsc + vite build, full vitest run, authenticated curl smoke, browser walkthrough. Browser stays open (standing rule).

---

## 1. Feature 6 — Venue & Logistics Mapping

DB: already exists — `venue_locations` (type enum room|booth|table|stage|lab|desk), `venue_assignments` (assignable_type team|project|exhibit, time range, status default 'active'). No migration needed.

### Backend — new module `server/src/modules/venue/`

Endpoints (per ARCHITECTURE.md contract), mounted at `/api/v1/events/:eventId/venue`, router with `mergeParams` + `authenticate` + `requireEventRole`:

| Method & path | Access |
|---|---|
| GET `/venue/locations` | any event member |
| POST `/venue/locations` | organizer |
| PUT `/venue/locations/:locationId` | organizer |
| GET `/venue/assignments?location_id=` | any event member |
| POST `/venue/assignments` | organizer |
| PUT `/venue/assignments/:assignmentId` | organizer (manual override) |
| DELETE `/venue/assignments/:assignmentId` | organizer |

### Tests FIRST (~14 cases)

1. create location validates `location_type` enum → ValidationError
2. create location requires name → ValidationError
3. update/delete nonexistent location → NotFoundError
4. assignment rejects unknown location → NotFoundError
5. assignment rejects `ends_at <= starts_at` → ValidationError
6. **double-booking**: overlapping active assignment on same location → ConflictError
7. adjacency allowed (`prev.ends_at == new.starts_at`)
8. same time range on a different location → OK
9. cancelled/expired assignments don't block overlap check
10. updating an assignment excludes itself from its own conflict check
11. `assignable_type` enum validated; `team_id` required when type=team; project id required when type=project
12. team must belong to the same event → ValidationError
13. conflict-check + insert run in one transaction (repository-level, verified in integration smoke since service tests mock repo)
14. delete of nonexistent assignment → NotFoundError

Overlap predicate in SQL: `starts_at < :newEnd AND COALESCE(ends_at, 'infinity') > :newStart AND status = 'active' AND venue_location_id = :locationId`.

### Frontend

- `client/src/features/venue/`: `venue.types.ts`, `venue.api.ts`, `VenuePage.tsx`
- Two tabs: **Locations** (table + create/edit dialog) and **Schedule** (`ScheduleGrid` + `VenueMap` components that already exist in `components/venue/`; assignment dialog surfaces API 409 as an inline "double-booked" warning).
- Wire `routes.tsx`: replace `venue` placeholder with `<VenuePage />` (sidebar link already exists).

---

## 2. Feature 7 — Project Submission & Judging Pipeline

### Migration `014_one_active_project_per_team.sql`

Partial unique index enforcing PRD "one active submission per team per event":

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_submissions_live_per_team
ON project_submissions (event_id, team_id)
WHERE status IN ('draft', 'submitted');
```

Service upserts the team's live row instead of inserting duplicates.

### Backend — modules `projects/` and `judging/`

| Method & path | Access |
|---|---|
| GET `/projects` | any member (sees submitted; own draft visible to own team) |
| POST `/projects` | participant in a team without a live submission |
| GET `/projects/:projectId` | any member (draft only to own team/organizer) |
| PUT `/projects/:projectId` | own team while `draft`; organizer override after `submitted`; locked once `disqualified` |
| POST `/projects/:projectId/submit` | own team, `draft → submitted`, sets `submitted_at` |
| GET `/judging/projects` | judge, organizer (only `submitted`) |
| POST `/judging/projects/:projectId/scores` | judge (organizer may too) |
| GET `/judging/leaderboard` | any member — computed by SQL aggregation |

Leaderboard = pure SQL (PRD rule): join `judging_scores` × `project_submissions` × `teams`, `AVG(score_total)` + judge count + `RANK()`, filtered to `status='submitted'`, ordered desc. No stored table.

Score model: four dimensions (innovation, technical, presentation, usefulness) 0–100 each; `score_total` = server-computed average. Scores are immutable after creation (no edit endpoint) — PRD ambiguity resolved conservatively; flagged as open decision below.

### Tests FIRST (~22 cases)

Projects:
1. create requires team membership → ValidationError if participant has no team
2. create when live submission already exists → ConflictError
3. second insert for same team hits unique index path → upsert returns existing updated
4. non-member cannot edit another team's project → AuthorizationError
5. edit draft OK; edit `submitted` by non-organizer → ConflictError
6. organizer can edit `submitted` (override); cannot edit `disqualified` → ConflictError
7. submit sets status + `submitted_at`; re-submit → ConflictError
8. title required; URL length limits validated

Judging:
9. scoring restricted to judge/organizer roles → AuthorizationError otherwise
10. each dimension must be 0–100 → ValidationError
11. `score_total` computed server-side as mean of four dims
12. duplicate judge×project score → ConflictError (service pre-check + DB UNIQUE backstop)
13. judges only see `submitted` projects in queue
14. leaderboard orders by avg desc and includes rank + judge count; disqualified excluded
15. empty leaderboard returns [] not error

### Frontend

- `client/src/features/projects/`: `projects.types.ts`, `projects.api.ts`, `ProjectsPage.tsx`
  - Participant view: my-team submission form (title, description, repo/demo links), save draft, submit final, read-only badge states
  - Organizer view: all-submissions table with disqualify action
- `client/src/features/judging/`: `judging.types.ts`, `judging.api.ts`, `JudgingPage.tsx`
  - Judge view: scoring queue + score form (4 sliders/inputs + feedback)
  - Leaderboard tab: top-3 podium + ranked table
- Wire `routes.tsx`: replace `projects` and `judging` placeholders (sidebar links exist).

---

## 3. Execution order

1. **T2 — Feature 6**: venue tests → venue repo/service → controller/routes → mount in app.ts → VenuePage → wire route → verify gates
2. **T3 — Feature 7**: migration 014 → projects tests → projects impl → judging tests → judging impl → mount → pages → wire routes → verify gates
3. **Wrap-up**: full test suite, both features walked through in the browser, memory/checkpoint updated

## Open decisions (defaults applied unless you object)

- Venue mutations are **organizer-only** (volunteers read-only) — strict PRD reading
- Scores immutable once submitted (no judge edit path)
- Leaderboard visible to all event members
- Client-side testing infra included (optional — can drop)
