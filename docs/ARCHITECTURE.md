# Architecture

## Confirmed Stack

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Raw SQL only
- No ORM
- JWT authentication

### Frontend

- React 18
- TypeScript
- Tailwind CSS
- Vite

### Database

- PostgreSQL
- 28 tables
- Direct SQL queries
- No ORM

---

## High-Level Architecture

```text
Frontend
React 18 + TypeScript + Tailwind CSS + Vite
        |
        | HTTP JSON API
        v
Backend
Node.js + Express.js + TypeScript
        |
        | Raw SQL using PostgreSQL driver
        v
Database
PostgreSQL
28 tables
```

The frontend is a single-page application.

The backend is a REST API.

The database is PostgreSQL.

All database access uses direct SQL queries.

---

## Frontend Architecture

### Frontend Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Native fetch or lightweight HTTP client

### Frontend Folder Structure

```text
client/
  src/
    app/
      routes.tsx
      providers.tsx
    components/
      ui/
      layout/
      forms/
      tables/
      dashboard/
    features/
      auth/
      events/
      hardware/
      teams/
      itinerary/
      checkin/
      budget/
      certificates/
      venue/
      projects/
      judging/
      volunteers/
      incidents/
    hooks/
    lib/
    types/
    pages/
    styles/
```

### Main Frontend Pages

#### Authentication

- Login
- Register

#### Organizer Dashboard

- Event overview
- Hardware
- Teams
- Schedule
- Check-in
- Budget
- Certificates
- Venue
- Projects
- Volunteers
- Incidents
- Analytics

#### Participant Dashboard

- My event
- My team
- Schedule
- Check-in
- Hardware checkout
- Project submission
- Incident reporting

#### Judge Dashboard

- Assigned projects
- Scoring form
- Leaderboard

#### Volunteer Dashboard

- My shifts
- Shift check-in
- Incident reporting

---

## Backend Architecture

### Backend Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT authentication
- Raw SQL queries

### Backend Folder Structure

```text
server/
  src/
    index.ts
    app.ts
    config/
    middleware/
      auth.middleware.ts
      role.middleware.ts
      validation.middleware.ts
      error.middleware.ts
    modules/
      auth/
      users/
      events/
      event-members/
      participants/
      teams/
      hardware/
      itinerary/
      checkin/
      budget/
      sponsors/
      certificates/
      venue/
      projects/
      judging/
      volunteers/
      incidents/
      analytics/
      audit/
    repositories/
      users.repository.ts
      events.repository.ts
      event-members.repository.ts
      participants.repository.ts
      teams.repository.ts
      hardware.repository.ts
      itinerary.repository.ts
      checkin.repository.ts
      budget.repository.ts
      certificates.repository.ts
      venue.repository.ts
      projects.repository.ts
      judging.repository.ts
      volunteers.repository.ts
      incidents.repository.ts
      audit.repository.ts
    services/
    routes/
    db/
      pool.ts
      migrations/
      seeds/
    utils/
    types/
```

### Backend Layers

```text
Routes
  |
Controllers
  |
Services
  |
Repositories
  |
PostgreSQL
```

### Routes

Define API endpoints.

### Controllers

Handle HTTP request and response.

### Services

Contain business logic.

### Repositories

Contain raw SQL queries.

### Database

PostgreSQL using direct parameterized SQL.

---

## Authentication Architecture

### Authentication Method

JWT authentication.

### Login Flow

```text
User submits email and password
        |
Backend checks user in PostgreSQL
        |
Backend verifies password hash
        |
Backend creates JWT
        |
Frontend stores JWT
        |
Frontend sends JWT in Authorization header
```

### JWT Payload

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "globalRole": "admin"
}
```

### Event-Level Authorization

Event role is fetched from the `event_members` table.

Example roles:

- organizer
- participant
- volunteer
- judge

### Authorization Middleware

Example route protection:

```text
Require authenticated user
        |
Require event membership
        |
Require event role
```

Example:

```text
/api/events/:eventId/hardware
  - organizer can manage
  - participant can view
```

---

## API Architecture

Base URL:

```text
/api/v1
```

All responses should return JSON.

### Success Format

```json
{
  "success": true,
  "data": {}
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

## Core API Endpoints

### Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Events

```text
POST /api/v1/events
GET  /api/v1/events
GET  /api/v1/events/:eventId
PUT  /api/v1/events/:eventId
```

### Event Members

```text
GET    /api/v1/events/:eventId/members
POST   /api/v1/events/:eventId/members
PUT    /api/v1/events/:eventId/members/:userId
DELETE /api/v1/events/:eventId/members/:userId
```

### Participant Profiles

```text
GET  /api/v1/events/:eventId/participants
POST /api/v1/events/:eventId/participants/me
PUT  /api/v1/events/:eventId/participants/me
```

### Teams

```text
GET  /api/v1/events/:eventId/teams
POST /api/v1/events/:eventId/teams
GET  /api/v1/events/:eventId/teams/:teamId
PUT  /api/v1/events/:eventId/teams/:teamId
```

### Team Applications

```text
POST /api/v1/events/:eventId/teams/:teamId/applications
GET  /api/v1/events/:eventId/teams/:teamId/applications
PUT  /api/v1/events/:eventId/teams/:teamId/applications/:applicationId
```

### Hardware

```text
GET    /api/v1/events/:eventId/hardware/items
POST   /api/v1/events/:eventId/hardware/items
PUT    /api/v1/events/:eventId/hardware/items/:itemId
GET    /api/v1/events/:eventId/hardware/checkouts
POST   /api/v1/events/:eventId/hardware/checkouts
POST   /api/v1/events/:eventId/hardware/returns
GET    /api/v1/events/:eventId/hardware/damage-reports
POST   /api/v1/events/:eventId/hardware/damage-reports
```

### Itinerary

```text
GET    /api/v1/events/:eventId/itinerary
POST   /api/v1/events/:eventId/itinerary
PUT    /api/v1/events/:eventId/itinerary/:itemId
DELETE /api/v1/events/:eventId/itinerary/:itemId
```

### Check-in

```text
POST /api/v1/events/:eventId/checkin/qr
POST /api/v1/events/:eventId/checkin/manual
GET  /api/v1/events/:eventId/checkins
```

### Budget

```text
GET    /api/v1/events/:eventId/budget/summary
GET    /api/v1/events/:eventId/sponsors
POST   /api/v1/events/:eventId/sponsors
PUT    /api/v1/events/:eventId/sponsors/:sponsorId
GET    /api/v1/events/:eventId/sponsors/:sponsorId/contributions
POST   /api/v1/events/:eventId/sponsors/:sponsorId/contributions
GET    /api/v1/events/:eventId/expenditures
POST   /api/v1/events/:eventId/expenditures
PUT    /api/v1/events/:eventId/expenditures/:expenditureId
```

### Certificates

```text
GET  /api/v1/events/:eventId/certificates/eligibility
GET  /api/v1/events/:eventId/certificates
POST /api/v1/events/:eventId/certificates/issue
POST /api/v1/events/:eventId/certificates/:certificateId/revoke
```

### Venue

```text
GET    /api/v1/events/:eventId/venue/locations
POST   /api/v1/events/:eventId/venue/locations
PUT    /api/v1/events/:eventId/venue/locations/:locationId
GET    /api/v1/events/:eventId/venue/assignments
POST   /api/v1/events/:eventId/venue/assignments
PUT    /api/v1/events/:eventId/venue/assignments/:assignmentId
DELETE /api/v1/events/:eventId/venue/assignments/:assignmentId
```

### Projects

```text
GET  /api/v1/events/:eventId/projects
POST /api/v1/events/:eventId/projects
GET  /api/v1/events/:eventId/projects/:projectId
PUT  /api/v1/events/:eventId/projects/:projectId
POST /api/v1/events/:eventId/projects/:projectId/submit
```

### Judging

```text
GET  /api/v1/events/:eventId/judging/projects
POST /api/v1/events/:eventId/judging/projects/:projectId/scores
GET  /api/v1/events/:eventId/judging/leaderboard
```

### Volunteers

```text
GET    /api/v1/events/:eventId/volunteers/shifts
POST   /api/v1/events/:eventId/volunteers/shifts
PUT    /api/v1/events/:eventId/volunteers/shifts/:shiftId
GET    /api/v1/events/:eventId/volunteers/assignments
POST   /api/v1/events/:eventId/volunteers/assignments
PUT    /api/v1/events/:eventId/volunteers/assignments/:assignmentId
```

### Incidents

```text
GET  /api/v1/events/:eventId/incidents
POST /api/v1/events/:eventId/incidents
GET  /api/v1/events/:eventId/incidents/:incidentId
PUT  /api/v1/events/:eventId/incidents/:incidentId
GET  /api/v1/events/:eventId/incidents/analytics
```

---

## Raw SQL Data Access

All database access must go through repositories.

Example repository pattern:

```ts
import { pool } from "../db/pool";

export const hardwareRepository = {
  async listByEvent(eventId: string) {
    const text = `
      SELECT
        id,
        name,
        category,
        model,
        serial_number,
        quantity_available,
        condition,
        status,
        location
      FROM hardware_items
      WHERE event_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(text, [eventId]);
    return result.rows;
  },
};
```

Rules:

- Use parameterized queries.
- Do not interpolate user input into SQL.
- Do not use an ORM.
- Keep SQL inside repository files.
- Use transactions for multi-table mutations.

---

## Transactions

Use transactions for operations that affect multiple tables.

Examples:

- Hardware checkout.
- Hardware return.
- Team application approval.
- Participant assignment to team.
- Venue assignment.
- Volunteer assignment.
- Project submission finalization.
- Judge score submission.
- Certificate issuance.

Example transaction pattern:

```ts
const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query(firstQuery, firstParams);
  await client.query(secondQuery, secondParams);

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

---

## Validation

Validate all request bodies, params, and query strings.

Recommended validation rules:

- IDs must be valid UUIDs.
- Dates must be valid ISO timestamps.
- Amounts must be positive numbers.
- Enums must match allowed values.
- Strings must have max length limits.
- Required fields must be present.

---

## Error Handling

Use centralized error handling.

Error categories:

- Validation error
- Authentication error
- Authorization error
- Not found error
- Conflict error
- Internal server error

Example conflict errors:

- Venue double-booking.
- Duplicate team membership.
- Duplicate judge score.
- Shift capacity exceeded.
- Hardware item unavailable.

---

## Security

- Hash passwords before storing.
- Use JWT for authenticated requests.
- Check event membership before event-scoped actions.
- Check role before organizer-only actions.
- Use parameterized SQL everywhere.
- Do not expose password hashes.
- Do not expose internal database errors directly to clients.
- Store secrets in environment variables.

---

## Environment Variables

Backend environment variables:

```text
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
NODE_ENV=
CLIENT_URL=
```

Frontend environment variables:

```text
VITE_API_URL=
```

---

## Database Migrations

Use plain SQL migration files.

Example:

```text
server/
  src/
    db/
      migrations/
        001_create_users.sql
        002_create_events.sql
        003_create_event_members.sql
```

No ORM migrations.

---

## Testing Strategy

### Backend Tests

Test:

- Authentication.
- Authorization.
- Business rules.
- Repository SQL queries.
- Transaction rollback behavior.
- Conflict prevention.

### Frontend Tests

Test:

- Form validation.
- Route protection.
- Dashboard rendering.
- API error states.
- Loading states.

---

## Deployment

### Backend

- Node.js server.
- Environment variables configured.
- PostgreSQL connection string configured.
- Migrations run before startup.

### Frontend

- Built with Vite.
- Static assets served from CDN or static host.
- API URL configured through environment variable.

### Database

- PostgreSQL instance.
- 28 tables created.
- Indexes added for foreign keys and common filters.