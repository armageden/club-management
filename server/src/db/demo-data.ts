import { pool } from "./pool.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The single event this module may ever create or delete. All dummy rows hang
// off it, and every child table cascades on event delete, so disabling is one
// statement that cannot touch real event data.
export const DEMO_EVENT_ID = "e0000000-0000-0000-0000-000000000002";

const EVENT_SCOPED_TABLES = [
  "event_members",
  "teams",
  "itinerary_items",
  "check_ins",
  "venue_locations",
  "venue_assignments",
  "hardware_items",
  "hardware_checkouts",
  "hardware_damage_reports",
  "project_submissions",
  "certificates",
  "incidents",
] as const;

export async function demoRowCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const table of EVENT_SCOPED_TABLES) {
    const res = await pool.query(
      `SELECT count(*)::int AS n FROM ${table} WHERE event_id = $1`,
      [DEMO_EVENT_ID]
    );
    counts[table] = res.rows[0].n;
  }

  const teamMembers = await pool.query(
    `SELECT count(*)::int AS n FROM team_members
     WHERE team_id IN (SELECT id FROM teams WHERE event_id = $1)`,
    [DEMO_EVENT_ID]
  );
  counts["team_members"] = teamMembers.rows[0].n;

  const judgingScores = await pool.query(
    `SELECT count(*)::int AS n FROM judging_scores
     WHERE project_submission_id IN (
       SELECT id FROM project_submissions WHERE event_id = $1
     )`,
    [DEMO_EVENT_ID]
  );
  counts["judging_scores"] = judgingScores.rows[0].n;

  return counts;
}

export async function demoEventExists(): Promise<boolean> {
  const res = await pool.query("SELECT 1 FROM events WHERE id = $1", [
    DEMO_EVENT_ID,
  ]);
  return res.rowCount !== null && res.rowCount > 0;
}

// Idempotent: re-running against existing data changes nothing.
export async function enableDemoData(): Promise<Record<string, number>> {
  if (!(await demoEventExists())) {
    const sqlFile = path.join(__dirname, "seeds", "demo-seed.sql");
    const sql = fs.readFileSync(sqlFile, "utf-8");
    await pool.query(sql);
  }
  return demoRowCounts();
}

// Returns the per-table row counts removed; empty object when already off.
export async function disableDemoData(): Promise<Record<string, number>> {
  if (!(await demoEventExists())) {
    return {};
  }
  const before = await demoRowCounts();
  await pool.query("DELETE FROM events WHERE id = $1", [DEMO_EVENT_ID]);
  return before;
}

export async function demoDataStatus(): Promise<{
  enabled: boolean;
  counts: Record<string, number>;
}> {
  const enabled = await demoEventExists();
  return { enabled, counts: enabled ? await demoRowCounts() : {} };
}
