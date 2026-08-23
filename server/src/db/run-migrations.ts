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

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`  OK: ${file}`);
    } catch (err: unknown) {
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
