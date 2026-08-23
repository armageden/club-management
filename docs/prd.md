# Product Requirements Document

## Product Name

Event Operations & Hackathon Management Platform

## Product Goal

Build a web platform for organizers to manage event participants, teams, hardware inventory, schedules, check-ins, budgets, sponsorships, certificates, venue assignments, project judging, volunteer shifts, and incident reporting.

The platform should support event organizers, participants, volunteers, judges, and administrators.

---

## Source of Truth

This document is the source of truth for the product requirements.

If any previous document mentions a different stack, ignore it.

The confirmed stack is:

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

No Prisma.  
No TypeORM.  
No Sequelize.  
No Drizzle.  
No database abstraction layer.

---

## User Roles

### Admin

Global system administrator.

Can:

- Create events.
- Assign organizers.
- Manage users.
- View all events.
- Access audit logs.

### Organizer

Event-level manager.

Can:

- Manage event details.
- Manage itinerary.
- Manage hardware inventory.
- Manage participants and teams.
- Manage sponsors and budget.
- Assign venue locations.
- Manage volunteers.
- View incidents.
- Generate certificates.
- View analytics.

### Participant

Event participant.

Can:

- Register for event.
- Create participant profile.
- Add tech stack.
- Join or request a team.
- View schedule.
- Check in.
- Submit project.
- Borrow hardware.
- Report incidents.

### Volunteer

Event helper.

Can:

- View assigned shifts.
- Check in to shifts.
- Report incidents.
- View assigned tasks.

### Judge

Event judge.

Can:

- View submitted projects.
- Score projects.
- View judging dashboard.

---

## Feature Requirements

## Feature 1: Hardware Inventory Tracker

### Purpose

Manage shared hardware such as microcontrollers, sensors, cables, tools, and kits.

### Requirements

Organizers can:

- Add hardware items.
- Edit hardware items.
- Mark items as available, checked out, damaged, lost, or retired.
- Track quantity.
- Track item condition.
- Check out items to participants.
- Accept returned items.
- Record damaged items.

Participants can:

- View available hardware.
- Request hardware checkout.
- View their active borrowed items.

### Business Rules

- An item cannot be checked out if it is unavailable.
- A checkout record must include borrower, item, checkout time, and due time.
- A return record must include condition and received-by user.
- If a returned item is damaged, a damage report must be created.
- Hardware history must be auditable.

---

## Feature 2: Participant & Team Formation

### Purpose

Allow solo participants to find teams and allow organizers to assign participants to teams.

### Requirements

Participants can:

- Create a participant profile.
- Add skills and tech stack.
- Mark themselves as looking for a team.
- View teams.
- Request to join a team.
- Accept or decline team invitations if applicable.

Organizers can:

- View solo participants.
- View participant tech stacks.
- Manually assign participants to teams.
- Auto-assign solo participants into balanced teams.

### Business Rules

- A participant can only belong to one team per event.
- A team has a maximum member limit.
- A participant cannot submit duplicate pending applications to the same team.
- Auto-assignment should avoid placing all members with the same skill into one team if possible.

---

## Feature 3: Dynamic Itinerary & Check-in

### Purpose

Provide a live event schedule and support QR or manual check-in.

### Requirements

Organizers can:

- Create itinerary items.
- Edit itinerary items.
- Cancel itinerary items.
- Set start and end times.
- Set location.
- Set session type.

Participants can:

- View schedule.
- See updated schedule changes.
- Check in using QR code or manual organizer check-in.

### Business Rules

- Schedule changes must appear on participant dashboards.
- QR tokens must expire.
- QR tokens must be single-use.
- Manual check-in can only be done by authorized organizers or volunteers.
- Check-in records must store timestamp and method.

---

## Feature 4: Budget & Sponsorship Ledger

### Purpose

Track sponsor contributions and event spending.

### Requirements

Organizers can:

- Add sponsors.
- Log sponsor contributions.
- Log expenditures.
- Categorize spending.
- View total sponsorship received.
- View total amount spent.
- View remaining budget.

### Budget Categories

Examples:

- Venue
- Catering
- Swag
- Hardware
- Marketing
- Logistics
- Other

### Business Rules

- Amounts must be positive numbers.
- Contributions can be cash or in-kind.
- Expenditures must include category, amount, vendor, and date.
- Dashboard must show totals.

---

## Feature 5: Automated Certificate Log

### Purpose

Track certificate eligibility for participants.

### Requirements

The system can:

- Verify attendance.
- Verify completion criteria.
- Mark participants eligible or ineligible.
- Generate certificate records.
- Track certificate issue date.
- Store certificate verification code.

Organizers can:

- View eligible participants.
- Issue certificates.
- Revoke certificates if needed.

### Possible Eligibility Rules

A participant may be eligible if:

- They checked into the event.
- They attended required sessions.
- They were part of a team.
- Their team submitted a project.

Exact eligibility rules can be configured by organizers.

---

## Feature 6: Venue & Logistics Mapping

### Purpose

Assign teams, projects, booths, tables, or rooms without double-booking.

### Requirements

Organizers can:

- Create venue locations.
- Define location type.
- Assign teams or projects to locations.
- Set assignment time ranges.
- Prevent double-booking.

### Location Types

Examples:

- Room
- Booth
- Table
- Stage
- Lab
- Desk
- Exhibition area

### Business Rules

- A location cannot have two conflicting assignments at the same time.
- Assignments must include event, location, assigned entity, and time range.
- Organizers can override assignments manually.

---

## Feature 7: Project Submission & Judging Pipeline

### Purpose

Allow teams to submit projects and judges to score them.

### Requirements

Teams can:

- Create project submission.
- Edit draft submission.
- Submit final project.
- Add project title.
- Add project description.
- Add repository link.
- Add demo link.

Judges can:

- View submitted projects.
- Score projects.
- Submit scoring feedback.

Organizers can:

- View leaderboard.
- View rankings.
- Disqualify projects if needed.

### Business Rules

- A team can have one active project submission per event.
- Judges can score a project only once.
- Scores cannot be edited after final submission unless organizer allows it.
- Leaderboard is calculated from judging scores.
- Leaderboard is generated by SQL query, not stored as a separate table.

---

## Feature 8: Volunteer Shift & Task Management

### Purpose

Manage volunteer shifts and prevent scheduling conflicts.

### Requirements

Organizers can:

- Create shifts.
- Assign volunteers.
- Set shift capacity.
- Track volunteer attendance.
- Mark volunteers as completed or no-show.

Volunteers can:

- View available shifts.
- View assigned shifts.
- Check in to shifts.

### Business Rules

- A volunteer cannot be assigned to overlapping shifts.
- Shift capacity cannot be exceeded.
- Shift attendance must be tracked.
- Organizers can manually override assignments.

---

## Feature 9: Incident Reporting & Operational Analytics

### Purpose

Report problems during the event and provide analytics to organizers.

### Requirements

Users can:

- Report incidents.
- Add incident description.
- Set severity.
- Add location.

Organizers can:

- View incidents.
- Assign incidents.
- Update incident status.
- Resolve incidents.
- View analytics.

### Analytics

Organizer dashboard should show:

- Total incidents.
- Open incidents.
- Resolved incidents.
- Incidents by severity.
- Incidents by time.
- Incident resolution rate.

### Incident Severity Levels

- Low
- Medium
- High
- Critical

### Incident Statuses

- Open
- Investigating
- Resolved

---

## Non-Functional Requirements

### Security

- Passwords must be hashed.
- JWT must be used for authentication.
- API routes must check authentication.
- Event-level routes must check user role.
- SQL queries must use parameterized values.
- No raw string interpolation in SQL.

### Reliability

- Critical operations must use database transactions.
- Double-booking must be prevented.
- Duplicate team membership must be prevented.
- Duplicate judge scoring must be prevented.

### Usability

- Responsive UI.
- Organizer dashboard.
- Participant dashboard.
- Judge dashboard.
- Volunteer dashboard.

### Maintainability

- Backend must be modular.
- SQL queries must live in repository files.
- Frontend must use reusable components.
- TypeScript types must be shared where possible.

---

## Release Plan

### Phase 1: Core Platform

- Authentication.
- User profiles.
- Event creation.
- Event membership.
- Role-based access.

### Phase 2: Event Operations

- Itinerary.
- Check-in.
- QR tokens.
- Participant profiles.
- Team formation.

### Phase 3: Resource Management

- Hardware inventory.
- Hardware checkout.
- Hardware returns.
- Damage reports.
- Venue mapping.

### Phase 4: Event Business Logic

- Budget ledger.
- Sponsorship tracking.
- Certificates.
- Project submission.
- Judging.
- Leaderboard.

### Phase 5: Operations & Analytics

- Volunteer shifts.
- Incident reporting.
- Analytics dashboard.
- Audit logs.