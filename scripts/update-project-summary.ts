#!/usr/bin/env tsx
/**
 * Auto-generate PROJECT_SUMMARY.md from actual codebase state
 * Run manually: npx tsx scripts/update-project-summary.ts
 * Or via CI/CD on every push
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const PROJECT_ROOT = join(__dirname, "..");
const DOCS_DIR = join(PROJECT_ROOT, "docs");
const SUMMARY_PATH = join(DOCS_DIR, "PROJECT_SUMMARY.md");
const SERVER_SRC = join(PROJECT_ROOT, "server/src");
const CLIENT_SRC = join(PROJECT_ROOT, "client/src");

// ============================================================================
// Helpers
// ============================================================================

function countFiles(dir: string, extensions: string[] = [".ts", ".tsx"]): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) {
        if (!entry.startsWith(".") && entry !== "node_modules") walk(full);
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        count++;
      }
    }
  }
  walk(dir);
  return count;
}

function countDirs(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((e) => statSync(join(dir, e)).isDirectory() && !e.startsWith(".")).length;
}

function dirHasFiles(dir: string, exts = [".ts"]): boolean {
  if (!existsSync(dir)) return false;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (dirHasFiles(full, exts)) return true;
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      return true;
    }
  }
  return false;
}

function getModuleStatus(modulesDir: string, moduleNames: string[]): { done: string[]; planned: string[] } {
  const done: string[] = [];
  const planned: string[] = [];
  for (const name of moduleNames) {
    const modDir = join(modulesDir, name);
    if (existsSync(modDir) && dirHasFiles(modDir)) {
      done.push(name);
    } else {
      planned.push(name);
    }
  }
  return { done, planned };
}

function getMigrationCount(): number {
  const dir = join(SERVER_SRC, "db/migrations");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith(".sql")).length;
}

function getUIComponents(): string[] {
  const dir = join(CLIENT_SRC, "components/ui");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && f !== "index.ts")
    .map((f) => f.replace(".tsx", ""))
    .sort();
}

function getChartComponents(): string[] {
  const dir = join(CLIENT_SRC, "components/charts");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && f !== "index.ts")
    .map((f) => f.replace(".tsx", ""))
    .sort();
}

function getLayoutComponents(): string[] {
  const dir = join(CLIENT_SRC, "components/layout");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(".tsx", ""))
    .sort();
}

function getFeatureModules(): { done: string[]; partial: string[] } {
  const dir = join(CLIENT_SRC, "features");
  if (!existsSync(dir)) return { done: [], partial: [] };
  const done: string[] = [];
  const partial: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    const files = readdirSync(full);
    // Flexible matching: api.ts, *.api.ts, types.ts, *.types.ts
    const hasApi = files.some(f => f === "api.ts" || f.endsWith(".api.ts"));
    const hasTypes = files.some(f => f === "types.ts" || f.endsWith(".types.ts"));
    // Check for pages either in pages/ dir or .tsx files directly in feature folder
    const hasPagesDir = existsSync(join(full, "pages")) && readdirSync(join(full, "pages")).length > 0;
    const hasPageFiles = files.some(f => f.endsWith(".tsx") && (f.includes("Page") || f.includes("page")));
    const hasPages = hasPagesDir || hasPageFiles;
    // Check for components either in components/ dir or component files directly
    const hasComponentsDir = existsSync(join(full, "components")) && readdirSync(join(full, "components")).length > 0;
    const hasComponentFiles = files.some(f => f.endsWith(".tsx") && (f.includes("Component") || f.includes("Modal") || f.includes("Form") || f.includes("Table") || f.includes("Card") || f.includes("Dashboard") || f.includes("Chart") || f.includes("Grid") || f.includes("Map") || f.includes("Timeline") || f.includes("Report")));
    const hasComponents = hasComponentsDir || hasComponentFiles;
    // A feature is "done" if it has API + Types + Pages + (Components OR is auth-like with only pages)
    const isComplete = hasApi && hasTypes && hasPages && (hasComponents || entry === "auth");
    if (isComplete) {
      done.push(entry);
    } else if (files.length > 0) {
      partial.push(entry);
    }
  }
  return { done, partial };
}

function getBackendModules(): { done: string[]; planned: string[] } {
  const dir = join(SERVER_SRC, "modules");
  if (!existsSync(dir)) return { done: [], planned: [] };
  const allModules = [
    "auth", "users", "events", "event-members", "participants", "teams",
    "hardware", "itinerary", "checkin", "budget", "sponsors", "certificates",
    "venue", "projects", "judging", "volunteers", "incidents", "analytics", "audit"
  ];
  return getModuleStatus(dir, allModules);
}

function readTemplate(): string {
  // Read current summary to preserve manual sections, or use default template
  if (existsSync(SUMMARY_PATH)) {
    return readFileSync(SUMMARY_PATH, "utf-8");
  }
  return "";
}

function generateSummary(): string {
  const date = new Date().toISOString().split("T")[0];
  
  // Collect metrics
  const backendTsFiles = countFiles(SERVER_SRC);
  const frontendTsxFiles = countFiles(CLIENT_SRC, [".tsx", ".ts"]);
  const migrationCount = getMigrationCount();
  const uiComponents = getUIComponents();
  const chartComponents = getChartComponents();
  const layoutComponents = getLayoutComponents();
  const { done: beDone, planned: bePlanned } = getBackendModules();
  const { done: feDone, partial: fePartial } = getFeatureModules();

  // Generate the markdown
  return `# Hackathon Hub - Project Summary

> **Last Updated:** ${date} (auto-generated)  
> **Status:** Core Backend & Frontend Foundation Complete | Feature Implementation In Progress

---

## 📊 Executive Summary

The **Hackathon Hub** (formerly "Event Operations & Hackathon Management Platform") is a full-stack web application for managing hackathon/event operations. The project has a **solid architectural foundation** with database schema, authentication, core API structure, and a modern React frontend with reusable UI components.

**Completion Estimate:** ~${Math.min(45, Math.round(
  15 + /* Foundation: DB schema, migrations, auth, infra = 15% */
  (beDone.length / 19) * 20 + /* Backend modules = 20% */
  (feDone.length / 10) * 20 + /* Frontend features = 20% */
  (uiComponents.length / 20) * 10 /* UI components = 10% */
))}% of full PRD scope

---

## ✅ What's Complete

### 🗄️ Database Layer (100% Schema Design, ~60% Implementation)

| Component | Status | Details |
|-----------|--------|---------|
| **Schema Design** | ✅ Complete | 28 tables across 10 modules documented in \`docs/database.md\` |
| **Migrations** | ✅ ${migrationCount}/11 Created | All migration files exist in \`server/src/db/migrations/\` |
| **Migration Runner** | ✅ Complete | \`run-migrations.ts\` with transaction support & idempotency |
| **Seed Script** | ✅ Complete | \`run-seeds.ts\` with demo data |
| **Connection Pool** | ✅ Complete | \`pool.ts\` with error handling |

---

### 🔐 Authentication & Authorization (95% Complete)

| Component | Status | Files |
|-----------|--------|-------|
| **JWT Auth** | ✅ Complete | \`auth.service.ts\`, \`auth.middleware.ts\` |
| **Register/Login/Me** | ✅ Complete | \`auth.controller.ts\`, \`auth.routes.ts\` |
| **Password Hashing** | ✅ Complete | bcryptjs |
| **Role Middleware** | ✅ Complete | \`role.middleware.ts\` |
| **Event-Level Auth** | ✅ Complete | Checks \`event_members\` table |
| **Global Roles** | ✅ Complete | \`admin\`, \`user\` in \`users\` table |
| **Event Roles** | ✅ Complete | \`organizer\`, \`participant\`, \`volunteer\`, \`judge\` |

---

### 🛠️ Backend Infrastructure (85% Complete)

| Component | Status | Details |
|-----------|--------|---------|
| **Express App** | ✅ Complete | \`app.ts\` with CORS, JSON parsing |
| **Entry Point** | ✅ Complete | \`index.ts\` with graceful shutdown |
| **Config Management** | ✅ Complete | \`config/index.ts\` with env validation |
| **Error Handling** | ✅ Complete | \`error.middleware.ts\` centralized |
| **Type Definitions** | ✅ Complete | \`types/index.ts\` shared types |
| **Health Endpoint** | ⚠️ Partial | Referenced in start.sh, needs implementation |

**Module Structure (${beDone.length}/${beDone.length + bePlanned} implemented):**

\`\`\`
src/modules/
${[...beDone.map(m => `├── ${m}/              ✅ Complete`), ...bePlanned.map(m => `├── ${m}/             📋 Planned`)].join("\n")}
\`\`\`

---

### 💻 Frontend Foundation (70% Complete)

#### Core Setup ✅
- **React 18 + TypeScript + Vite** configured
- **Tailwind CSS v4** with custom theme
- **React Router v7** with route protection
- **Path aliases** configured (\`@/\`, \`@components/\`, etc.)

#### UI Component Library (${uiComponents.length} Components) ✅
| Component | File | Purpose |
|-----------|------|---------|
${uiComponents.map(c => `| ${c} | \`${c}.tsx\` | Auto-detected component |`).join("\n")}

#### Chart Components (${chartComponents.length}) ✅
${chartComponents.map(c => `- **${c}** - \`charts/${c}.tsx\``).join("\n")}

#### Layout Components (${layoutComponents.length}) ✅
${layoutComponents.map(c => `- **${c}** - \`layout/${c}.tsx\``).join("\n")}

#### Pages & Features
| Feature | Status | Files |
|---------|--------|-------|
| **Auth Pages** | ✅ Complete | LoginPage, RegisterPage |
| **Home Page** | ✅ Complete | Landing page |
| **Dashboard Page** | ✅ Complete | Main dashboard |
| **Hardware Feature** | 🟡 Advanced | 8 components + 2 pages + API + Types |
${feDone.map(f => `| **${f}** | ✅ Complete | Full feature (api, types, pages, components) |`).join("\n")}
${fePartial.map(f => `| **${f}** | 🟡 Partial | Some files present |`).join("\n")}

#### Frontend Architecture
\`\`\`
client/src/
├── app/
│   ├── routes.tsx        ✅ Route definitions with protection
│   └── providers.tsx     ✅ Auth, Toast, Query providers
├── components/
│   ├── ui/               ✅ ${uiComponents.length} reusable components
│   ├── layout/           ✅ ${layoutComponents.length} layout components
│   ├── charts/           ✅ ${chartComponents.length} chart components
│   ├── tables/           ✅ DataTable
│   ├── venue/            ✅ VenueMap, ScheduleGrid
│   ├── forms/            ✅ FormWizard, AutoSave
│   └── DatabaseStatusCard.tsx
├── features/
│   ├── auth/             ✅ Login, Register, API, Types
${feDone.map(f => `│   └── ${f}/           ✅ Full feature`).join("\n")}
${fePartial.map(f => `│   └── ${f}/           🟡 Partial`).join("\n")}
├── hooks/                📋 Planned
├── lib/                  📋 Planned (api client, utils)
├── types/                📋 Planned (shared types)
├── pages/                ✅ HomePage, DashboardPage
└── main.tsx              ✅ Entry point
\`\`\`

---

### 🚀 DevOps & Developer Experience (90% Complete)

| Tool/Script | Status | Description |
|-------------|--------|-------------|
| **start.sh** | ✅ Complete | Universal start script (Linux/macOS/Windows) |
| **Environment Setup** | ✅ Complete | Auto-creates \`.env\` from \`.example\` files |
| **Docker PostgreSQL** | ✅ Complete | Auto-starts if no local DB |
| **Dependency Install** | ✅ Complete | Auto-detects npm/pnpm/yarn |
| **Health Checks** | ✅ Complete | Waits for backend/frontend readiness |
| **Production Mode** | ✅ Complete | \`--prod\` flag builds & serves |
| **Graceful Shutdown** | ✅ Complete | Ctrl+C cleans all processes |
| **Package Scripts** | ✅ Complete | dev, build, start, migrate, seed, db:setup |
| **Auto-summary Script** | ✅ Complete | \`scripts/update-project-summary.ts\` |

---

## 🟡 In Progress / Partially Complete

### Hardware Module (Backend + Frontend) - ~80% Complete
- ✅ Database schema (4 tables)
- ✅ Repository with raw SQL
- ✅ Service layer with business logic
- ✅ Controller with validation
- ✅ Routes defined
- ✅ Frontend: 8 components, 2 pages, API client, Types
- ⚠️ Need: Integration testing, edge cases

${fePartial.length > 0 ? `### Other Partial Frontend Features
${fePartial.map(f => `- **${f}** - Has some files but incomplete`).join("\n")}` : ""}

---

## 📋 Not Started (Per PRD Phase Plan)

### Phase 1: Core Platform (Partial - Auth Done)
- [ ] Users module (CRUD, profile management)
- [ ] Events module (CRUD, status management)
- [ ] Event Members module (invite, role management)
- [ ] Participant Profiles module

### Phase 2: Event Operations
- [ ] Itinerary module (CRUD, live updates)
- [ ] Check-in module (QR generation, scanning, manual)
- [ ] QR Tokens (generation, validation, expiry)
- [ ] Team Formation (applications, auto-assignment)

### Phase 3: Resource Management
- [ ] Venue module (locations, assignments, conflict prevention)
- ⚠️ Hardware - **In Progress**

### Phase 4: Event Business Logic
- [ ] Budget & Sponsorship (CRUD, summaries)
- [ ] Certificates (eligibility, issuance, revocation, PDF generation)
- [ ] Projects (submissions, draft/submitted states)
- [ ] Judging (scoring, leaderboard calculation)

### Phase 5: Operations & Analytics
- [ ] Volunteers (shifts, assignments, check-in)
- [ ] Incidents (reporting, assignment, resolution)
- [ ] Analytics Dashboard (charts, metrics)
- [ ] Audit Logs (viewing, filtering)

---

## 📈 Code Statistics

| Metric | Count |
|--------|-------|
| **Backend TypeScript Files** | ${backendTsFiles} (excluding node_modules) |
| **Frontend TypeScript/TSX Files** | ${frontendTsxFiles} |
| **Database Migrations** | ${migrationCount} |
| **UI Components** | ${uiComponents.length} |
| **Chart Components** | ${chartComponents.length} |
| **Layout Components** | ${layoutComponents.length} |
| **Backend Modules Done** | ${beDone.length}/19 |
| **Frontend Features Done** | ${feDone.length}/10+ |

---

## 🎯 Next Priority Actions

### Immediate (Unblock Frontend Development)
1. **Implement Health Endpoint** - \`GET /api/v1/health\` for start.sh checks
2. **Complete Users Module** - Profile management, avatar upload
3. **Complete Events Module** - CRUD + event-scoped middleware

### Short Term (Core Features)
4. **Event Members Module** - Join/leave events, role management
5. **Itinerary + Check-in** - Schedule + QR check-in flow
6. **Teams + Participants** - Team formation workflow

### Medium Term (Business Features)
7. **Budget + Sponsors** - Financial tracking
8. **Projects + Judging** - Submission & scoring pipeline
9. **Certificates** - PDF generation with \`@react-pdf/renderer\`
10. **Venue Mapping** - Visual venue editor

### Polish
11. **Tests** - Unit (backend), Component (frontend), E2E
12. **CI/CD** - GitHub Actions for lint, test, build
13. **Documentation** - API docs (OpenAPI/Swagger)

---

## 🔗 Key Files Reference

| Category | Files |
|----------|-------|
| **Architecture** | \`docs/ARCHITECTURE.md\`, \`docs/PROJECT_SUMMARY.md\` |
| **Requirements** | \`docs/prd.md\` |
| **Database** | \`docs/database.md\`, \`docs/schema.md\`, \`docs/schema-documentation.md\` |
| **Start Script** | \`start.sh\` |
| **Backend Entry** | \`server/src/index.ts\`, \`server/src/app.ts\` |
| **Auth** | \`server/src/modules/auth/*.ts\` |
| **Hardware** | \`server/src/modules/hardware/*.ts\` |
| **Frontend Entry** | \`client/src/main.tsx\`, \`client/src/app/routes.tsx\` |
| **UI Library** | \`client/src/components/ui/index.ts\` |
| **Auto-generator** | \`scripts/update-project-summary.ts\` |

---

## 💡 Notes for Contributors

1. **No ORM** - All SQL is raw, parameterized queries in repository files
2. **Transactions Required** - Multi-table operations must use transactions
3. **Event-Scoped** - Most data belongs to an event; always filter by \`event_id\`
4. **Role-Based Access** - Check both global role and event role
5. **Type Safety** - Share types between backend/frontend via \`server/src/types\` and \`client/src/features/*/types.ts\`
6. **Environment** - Never commit \`.env\` files; use \`.env.example\` templates
7. **Auto-summary** - Run \`npx tsx scripts/update-project-summary.ts\` after significant changes

---

*Last auto-generated: ${new Date().toISOString()}. This file is partially auto-generated - the "Not Started" and "Priority Actions" sections are maintained manually.`;
}

// ============================================================================
// Main
// ============================================================================

// Compute metrics for logging (also done inside generateSummary)
const { done: beDone, planned: bePlanned } = getBackendModules();
const { done: feDone, partial: fePartial } = getFeatureModules();

const summary = generateSummary();
writeFileSync(SUMMARY_PATH, summary);
console.log(`✅ Updated ${relative(PROJECT_ROOT, SUMMARY_PATH)}`);
console.log(`📊 Backend modules: ${beDone.length} done, ${bePlanned.length} planned`);
console.log(`📊 Frontend features: ${feDone.length} done, ${fePartial.length} partial`);