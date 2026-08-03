# Product Requirements Document (PRD)

## Project Title
**Hackathon Operations Hub**

## Document Purpose
This document defines the product vision, scope, features, users, and requirements for the Hackathon Operations Hub.  
The system is a unified event management platform for organizers, participants, volunteers, judges, and administrators.

This project is designed to satisfy the following academic requirements:
- 9 total features
- At least 3 features per group member
- CRUD operations in every major module
- Unique workflows beyond simple create/read operations
- No ORM usage
- SQL-based backend data access
- Relational database design with ER/EER and schema diagrams

---

# 1. Problem Statement

Managing a hackathon or tech event involves many moving parts:
- shared hardware and tools
- participant registration and team formation
- schedules and check-ins
- venue allocation
- budgets and sponsorships
- certificates
- project submissions and judging
- volunteer coordination
- incident handling

Most event tools only handle one or two of these areas.  
This project aims to build a single platform that manages the full lifecycle of a technical event.

---

# 2. Project Objectives

The system will aim to:

1. Manage shared hardware inventory with check-out, return, and damage tracking.
2. Help solo participants find or form teams.
3. Provide a dynamic itinerary with real-time updates and check-in support.
4. Track sponsorships and expenses.
5. Automatically determine certificate eligibility.
6. Prevent venue conflicts by managing booths, tables, and rooms.
7. Manage project submission and judging.
8. Coordinate volunteer shifts and assignments.
9. Track incidents and produce operational analytics.

---

# 3. Target Users

| Role | Description |
|---|---|
| Admin | Full access to all modules and settings |
| Organizer | Manages schedule, venue, budget, volunteers, certificates, incidents |
| Participant | Joins event, forms teams, checks in, submits projects |
| Judge | Reviews and scores project submissions |
| Volunteer | Accepts shifts and performs assigned duties |
| Sponsor / Finance Viewer | Optional limited access to sponsorship summaries |

> **Note:** Login, Logout, and Signup are required for the system but are **not counted** as project features.

---

# 4. Product Scope

The system is a web-based application with:
- role-based dashboards
- CRUD modules
- event workflow automation
- relational database persistence
- direct SQL queries / stored procedures where appropriate
- no ORM layer

---

# 5. Group Feature Ownership

| Feature | Feature Name | Owner |
|---|---|---|
| Feature 1 | Hardware Inventory Tracker | Member 1 |
| Feature 2 | Participant & Team Formation | Member 2 |
| Feature 3 | Dynamic Itinerary & Check-in | Member 2 |
| Feature 4 | Budget & Sponsorship Ledger | Member 3 |
| Feature 5 | Automated Certificate Log | Member 2 |
| Feature 6 | Venue & Logistics Mapping | Member 1 |
| Feature 7 | Project Submission & Judging Pipeline | Member 1 |
| Feature 8 | Volunteer Shift & Task Management | Member 3 |
| Feature 9 | Incident Reporting & Operational Analytics | Member 3 |

Each member owns **3 major features**.

---

# 6. Detailed Feature Requirements

## Feature 1: Hardware Inventory Tracker

### Purpose
Manage shared microcontrollers, sensors, tools, and kits available for participants during the event.

### Users
- Admin
- Organizer
- Participant

### Functional Requirements
- Add hardware items
- View hardware inventory
- Update item condition, quantity, and status
- Delete or retire damaged/unusable items
- Track check-outs and returns
- Log damaged items
- Track overdue items
- Generate item identifiers or QR labels

### CRUD Operations
- **Create:** add inventory items, create checkout records, create damage reports
- **Read:** view available stock, current borrower, item history
- **Update:** update condition, return status, damage resolution
- **Delete:** remove retired or duplicate inventory entries

### Unique / Non-Plain Features
- Availability validation before checkout
- Automatic status change from available to checked out
- Damage severity tracking
- Overdue detection
- Item condition history

### Acceptance Criteria
- Admin can add and manage inventory.
- Organizer can check out and return items.
- System prevents checkout if stock is unavailable.
- Damaged items can be reported and tracked.
- Overdue checkouts can be identified.

---

## Feature 2: Participant & Team Formation

### Purpose
Allow solo registrants to find teammates or allow admins to create balanced teams automatically.

### Users
- Participant
- Admin
- Organizer

### Functional Requirements
- Participants can create a solo profile
- Participants can list skills, interests, and preferred stack
- Solo participants can post “looking for team” requests
- Users can browse open team requests
- Admins can manually assign participants to teams
- Admins can auto-generate balanced groups

### CRUD Operations
- **Create:** team requests, teams, team memberships
- **Read:** list solo participants, open requests, team rosters
- **Update:** edit team details, change member roles, update request status
- **Delete:** cancel requests or remove members

### Unique / Non-Plain Features
- Skill-based matching
- Balanced team assignment
- Team capacity validation
- “Looking for team” workflow

### Acceptance Criteria
- A solo participant can publish their tech stack and request a team.
- Other participants can view and join team requests.
- Admin can assign participants into teams manually or automatically.
- Teams cannot exceed capacity.
- Each participant can belong to only one active team.

---

## Feature 3: Dynamic Itinerary & Check-in

### Purpose
Provide a live event schedule and support participant check-in for sessions.

### Users
- Participant
- Organizer
- Admin

### Functional Requirements
- Create event sessions
- View schedule by time or track
- Update or cancel sessions
- Delete sessions if needed
- Support QR-based or manual check-in
- Show updated schedule on all dashboards
- Track participant attendance

### CRUD Operations
- **Create:** sessions, check-ins
- **Read:** schedule, attendance, session details
- **Update:** session timing, status, venue
- **Delete:** cancel/remove sessions

### Unique / Non-Plain Features
- Real-time itinerary changes
- QR or manual check-in
- Attendance history
- Session capacity tracking
- Live status: scheduled / live / cancelled / completed

### Acceptance Criteria
- Organizer can create and update sessions.
- Participants can see the latest schedule.
- Participants can be checked in by QR or manual method.
- Duplicate check-ins for the same session are prevented.
- Attendance can later be used for certificate eligibility.

---

## Feature 4: Budget & Sponsorship Ledger

### Purpose
Track sponsor contributions and event expenditures in one financial dashboard.

### Users
- Admin
- Organizer

### Functional Requirements
- Add sponsors
- Record sponsor pledges and received contributions
- Add expenses by category
- Approve or reject expenses
- View total income and spend
- Compare contributions against operational costs

### CRUD Operations
- **Create:** sponsors, contributions, expenses
- **Read:** financial summary, sponsor list, expense records
- **Update:** contribution status, expense approval status
- **Delete:** remove draft or invalid entries

### Unique / Non-Plain Features
- Budget health summary
- Expense approval workflow
- Sponsor tier tracking
- Category-based expense analytics
- Low-balance or overspend alerts

### Acceptance Criteria
- Organizers can record sponsorships and expenses.
- Only approved expenses count toward final spend.
- System calculates remaining budget.
- Admin can review financial summaries.
- Expense categories are supported.

---

## Feature 5: Automated Certificate Log

### Purpose
Automatically verify participant eligibility and maintain a certificate log.

### Users
- Admin
- Organizer
- Participant

### Functional Requirements
- Define certificate eligibility rules
- Track attendance requirements
- Verify participant completion status
- Generate certificate records
- Allow certificate verification by code
- Revoke certificates if needed

### CRUD Operations
- **Create:** certificate rules, certificate records
- **Read:** eligibility status, certificate details
- **Update:** issue, revoke, or verify certificate
- **Delete:** remove invalid certificate entries

### Unique / Non-Plain Features
- Rule-based eligibility engine
- Attendance threshold checking
- Unique verification code
- Certificate status lifecycle

### Acceptance Criteria
- Admin can set minimum attendance requirement.
- System can determine eligible participants.
- Certificates can be generated for eligible users.
- Each certificate has a unique verification code.
- Certificate status can be issued, revoked, or verified.

---

## Feature 6: Venue & Logistics Mapping

### Purpose
Assign teams, exhibits, or activities to tables, booths, or rooms and prevent double-booking.

### Users
- Admin
- Organizer

### Functional Requirements
- Define venue areas such as tables, booths, rooms, labs, and stages
- Assign teams/projects to areas
- View booking calendar or map
- Update booking time or location
- Cancel bookings
- Prevent schedule conflicts

### CRUD Operations
- **Create:** venue areas, bookings
- **Read:** venue map, booking list, team allocation
- **Update:** booking time/status, venue details
- **Delete:** remove bookings or inactive areas

### Unique / Non-Plain Features
- Double-booking prevention
- Time-slot conflict detection
- Area capacity validation
- Venue allocation dashboard

### Acceptance Criteria
- Organizer can create venue areas.
- Teams/projects can be assigned to specific areas.
- Overlapping bookings for the same area are rejected.
- Booking conflicts are shown before confirmation.
- Venue allocation can be updated or cancelled.

---

## Feature 7: Project Submission & Judging Pipeline

### Purpose
Allow teams to submit projects and allow judges to evaluate submissions.

### Users
- Participant
- Judge
- Admin
- Organizer

### Functional Requirements
- Create projects
- Submit project links and details
- Lock final submissions after deadline
- Assign judges to submissions
- Enter scores and comments
- Generate ranking or leaderboard

### CRUD Operations
- **Create:** projects, submissions, judge scores
- **Read:** project details, submission list, score summaries
- **Update:** project status, submission status, judge comments
- **Delete:** remove invalid/draft submissions or disqualified entries

### Unique / Non-Plain Features
- Weighted scoring system
- Judge assignment
- Leaderboard generation
- Submission locking
- Draft vs submitted status

### Acceptance Criteria
- Teams can create and submit projects.
- Judges can score assigned submissions.
- Scores are saved per judge and per submission.
- System computes weighted totals.
- A ranked leaderboard can be generated.

---

## Feature 8: Volunteer Shift & Task Management

### Purpose
Manage volunteer shifts, assignments, and attendance.

### Users
- Admin
- Organizer
- Volunteer

### Functional Requirements
- Create volunteer shifts
- Define shift capacity and required skills
- Allow volunteers to apply for shifts
- Approve or reject volunteer assignments
- Check in volunteers for shifts
- Cancel or reassign shifts

### CRUD Operations
- **Create:** shifts, assignments
- **Read:** shift list, volunteer assignments
- **Update:** shift details, assignment status
- **Delete:** remove shifts or cancel assignments

### Unique / Non-Plain Features
- Capacity control
- Overlapping shift prevention
- Volunteer check-in tracking
- Shift completion status

### Acceptance Criteria
- Organizer can create shifts.
- Volunteers can apply for open shifts.
- Shift capacity is enforced.
- Volunteers cannot be assigned to overlapping shifts.
- Volunteer attendance for shifts can be recorded.

---

## Feature 9: Incident Reporting & Operational Analytics

### Purpose
Allow users to report operational or safety issues and allow organizers to resolve them.

### Users
- Participant
- Volunteer
- Organizer
- Admin

### Functional Requirements
- Report incidents
- Categorize incidents
- Assign severity levels
- Assign incidents to staff
- Update resolution status
- View analytics dashboard

### CRUD Operations
- **Create:** incident reports, comments, resolutions
- **Read:** incident list, incident details, analytics
- **Update:** assign staff, change status, resolve incident
- **Delete:** remove false or duplicate reports

### Unique / Non-Plain Features
- Severity-based priority
- Incident status lifecycle
- Operational analytics
- Resolution tracking
- Incident comments/history

### Acceptance Criteria
- Users can submit incident reports.
- Organizers can assign and resolve incidents.
- Incident severity and category are tracked.
- Analytics show open vs resolved incidents.
- Incident history is available.

---

# 7. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Database | Any RDBMS such as PostgreSQL, MySQL, SQLite, or SQL Server |
| Backend | Any backend language such as Python, PHP, Java, Node.js, C#, etc. |
| Data Access | Direct SQL queries only; **no ORM allowed** |
| Security | Password hashing, role-based access, parameterized queries |
| Performance | Core pages should load within 2–3 seconds for normal data volumes |
| Usability | Responsive and easy-to-use dashboards |
| Reliability | Enforce data integrity using constraints and transactions |
| Maintainability | Modular code by feature |

---

# 8. Unique Aspects of the Project

This project is not just a basic CRUD app because it includes:

- QR/manual check-in workflow
- Skill-based team matching
- Inventory checkout/return lifecycle
- Double-booking prevention
- Budget approval workflow
- Certificate eligibility automation
- Weighted judging and leaderboard
- Volunteer capacity and overlap checks
- Incident analytics dashboard

---

# 9. Deliverables Required for Submission

The GitHub repository or shared Drive folder must include:

1. **Project feature list**  
   - Can be exported from this PRD into a `.doc` / `.docx`

2. **ER/EER diagrams**  
   - Show entities, relationships, and role-based subtypes if needed

3. **Database schema diagrams**  
   - Show tables, primary keys, foreign keys, and relationships

4. **Final report**  
   - Include introduction, requirements, design, implementation, SQL approach, testing, and conclusion

5. **Project code**  
   - Backend, frontend, SQL scripts, and configuration

---

# 10. Definition of Done

The project will be considered complete when:

- All 9 features are implemented
- Each feature has CRUD operations
- Every member can demonstrate their 3 features
- Login / Logout / Signup works
- Database is normalized to a reasonable level
- No ORM is used
- SQL queries are parameterized
- Core workflows are validated with constraints and business rules
- Repository contains all required documentation

---

# 11. Suggested Final Report Sections

1. Introduction  
2. Objectives  
3. Problem Statement  
4. Feature List  
5. User Roles  
6. System Architecture  
7. ER/EER Diagram  
8. Database Schema  
9. SQL Implementation  
10. Feature-wise Explanation  
11. Testing  
12. Challenges  
13. Future Enhancements  
14. Conclusion  
15. References  

---

# 12. Feature List Summary for Submission

| # | Feature Name | Module Type | Owner |
|---|---|---|---|
| 1 | Hardware Inventory Tracker | Operations / Asset Management | Member 1 |
| 2 | Participant & Team Formation | Participant Management | Member 2 |
| 3 | Dynamic Itinerary & Check-in | Event Management | Member 2 |
| 4 | Budget & Sponsorship Ledger | Finance | Member 3 |
| 5 | Automated Certificate Log | Certification | Member 2 |
| 6 | Venue & Logistics Mapping | Logistics | Member 1 |
| 7 | Project Submission & Judging Pipeline | Competition Management | Member 1 |
| 8 | Volunteer Shift & Task Management | Workforce Management | Member 3 |
| 9 | Incident Reporting & Operational Analytics | Support / Analytics | Member 3 |