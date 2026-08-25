import { pool } from "./pool.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration files`);

  // Ensure migrations table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Get already applied migrations
  const appliedResult = await pool.query("SELECT filename FROM migrations");
  const applied = new Set(appliedResult.rows.map(r => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  SKIP: ${file} (already applied)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`Running migration: ${file}`);
    try {
      await pool.query("BEGIN");
      await pool.query(sql);
      await pool.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
      await pool.query("COMMIT");
      console.log(`  OK: ${file}`);
    } catch (err: unknown) {
      await pool.query("ROLLBACK");
      const error = err as Error;
      console.error(`  FAILED: ${file}`);
      console.error(`  Error: ${error.message}`);
      process.exit(1);
    }
  }

  console.log("All migrations completed successfully");
  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
