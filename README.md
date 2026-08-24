# Hackathon Hub

A full-stack web platform for organizing hackathons and events: participants, teams, check-in, judging, hardware loans, venues, budgets, and more.

> **Status:** Foundation complete (auth, database, UI library) — feature modules are being built out. Two of ~19 backend modules are done (`auth`, `hardware`); see `docs/PROJECT_SUMMARY.md` for the live status.

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js 18+, Express, TypeScript, raw SQL (no ORM) |
| Database | PostgreSQL 16 (migrations + seeds included) |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4, React Router v7, TanStack Query |
| Dev tooling | `start.sh` supervisor (auto-restart, health monitor, config watcher) |

## Quick Start

```bash
./start.sh                # Linux / macOS / WSL / Git Bash
```

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1    # native Windows (PowerShell 5.1+)
```

That's it. The script:

- creates `.env` files from templates if missing
- starts PostgreSQL via Docker if no local database is found
- runs migrations and seeds demo data
- installs dependencies, starts backend (`:5000`) and frontend (`:5173`)
- supervises both: crashed services restart automatically, unresponsive ones are restarted by the health monitor, and dependency/config changes trigger reinstall + restart

**Demo credentials** (created by seeds):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hackathon.com` | `admin123` |
| User | `user@hackathon.com` | `user123` |

Press `Ctrl+C` to stop everything cleanly.

### Options

```bash
./start.sh --no-db        # skip database setup (external DB)
./start.sh --docker-db    # force PostgreSQL via Docker
./start.sh --no-seed      # skip seeding
./start.sh --prod         # build + production mode
./start.sh --no-watch     # disable supervisor/health monitor
```

Ports and database settings are configurable via env vars: `BACKEND_PORT`, `FRONTEND_PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`. Use `DEBUG=1` for verbose output. Logs land in `logs/`.

## Requirements

- Node.js >= 18, npm >= 9
- PostgreSQL — local install **or** Docker (Docker Desktop is the easiest path)
- curl

### Windows

- **No WSL needed** — use `start.ps1` (above) on stock Windows with PowerShell. It handles env files, Docker Desktop PostgreSQL, deps, migrations/seeds, and both dev servers.
- The bash `start.sh` also runs under **Git Bash**, with two caveats: occupied-port reclamation is skipped (no `lsof`/`fuser`), and process cleanup is less robust.
- **WSL2** gives the identical full Linux experience, including `start.sh`'s crash-supervisor and health monitor (which `start.ps1` intentionally omits — Vite HMR and `tsx watch` cover hot reload either way).
- Do not edit `start.sh` with CRLF editors — `.gitattributes` enforces LF, but local overrides can still bite.

## Manual Setup (without start.sh)

```bash
# 1. Environment
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# 2. Database (adjust DATABASE_URL in server/.env first)
cd server
npm install
npm run migrate
npm run seed

# 3. Dev servers
npm run dev          # backend on :5000 (from server/)
cd ../client && npm install && npm run dev   # frontend on :5173
```

## Project Structure

```
server/
  src/
    config/           env-driven configuration
    db/               pool, migrations, seeds
    middleware/       auth, roles, centralized error handling
    modules/
      auth/           controller / service / repository / routes (complete)
      hardware/       controller / service / repository / routes (complete)
    types/            shared types
    app.ts            express app + route mounting + health endpoints
    index.ts          entry point

client/
  src/
    app/              routes (with protection), providers
    components/       ui/ (16 components), charts/, layout/, forms/, tables/
    features/         auth/, hardware/ (complete); judging/, projects/, venue/ (stubs)
    lib/  hooks/  types/
    pages/            HomePage, DashboardPage
```

## Implementing a New Module

Every module follows the same layering (see `server/src/modules/hardware/` as the reference):

1. **Migration** — `server/src/db/migrations/NNN_create_<module>.sql`
2. **Types** — add to `server/src/types/index.ts`
3. **Repository** — raw, parameterized SQL; multi-table writes use transactions
4. **Service** — business logic, throws typed errors (`ValidationError`, `NotFoundError`, `AuthorizationError`, `ConflictError` from `middleware/error.middleware.js`)
5. **Controller** — request validation + response shaping
6. **Routes** — mounted in `server/src/app.ts` under `/api/v1/...`
7. **Frontend feature** — `client/src/features/<module>/` with `api.ts`, `types.ts`, pages, components; register routes in `client/src/app/routes.tsx`

Conventions:

- Most data is event-scoped — always filter by `event_id`
- Check **both** global role (`users.global_role`) and event role (`event_members.role`)
- Path/body IDs are UUIDs; malformed IDs are rejected centrally as `400 VALIDATION_ERROR`
- Share types between backend and frontend (backend: `server/src/types`, frontend: `features/<module>/types.ts`)
- Never commit `.env` files

## Documentation

| Doc | Read it for |
|-----|-------------|
| `docs/prd.md` | Product requirements, feature phases, roles |
| `docs/database.md` | **Authoritative** schema — all 28 tables |
| `docs/schema-documentation.md` | Column-level detail, constraints, indexes |
| `docs/UIUX.md` | Design system, tokens, component specs |
| `docs/ARCHITECTURE.md` | Intended architecture (folder listing is target state, not current) |
| `docs/PROJECT_SUMMARY.md` | Auto-generated status dashboard (`npx tsx scripts/update-project-summary.ts` to refresh) |

> ⚠️ **`docs/schema.md` and `docs/er.md` are outdated** — they describe an earlier data model (role subtype tables) that was never implemented. Use `docs/database.md` instead.

## Useful Commands

```bash
npm run migrate        # apply pending migrations (idempotent)
npm run seed           # seed demo data
npm run test           # vitest (server)
npm run lint           # oxlint (client)
npx tsx scripts/update-project-summary.ts   # refresh docs/PROJECT_SUMMARY.md
```
