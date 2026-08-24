import {
  enableDemoData,
  disableDemoData,
  demoDataStatus,
} from "./demo-data.js";
import { pool } from "./pool.js";

function printCounts(counts: Record<string, number>, label: string): void {
  console.log(label);
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (entries.length === 0) {
    console.log("  (none)");
  }
  for (const [table, n] of entries) {
    console.log(`  ${table}: ${n}`);
  }
}

async function turnOn(): Promise<void> {
  const counts = await enableDemoData();
  const alreadyOn = Object.values(counts).some((n) => n > 0);
  console.log(
    alreadyOn
      ? "Dummy data is ON — re-seeding is a no-op (idempotent)."
      : "Dummy data ON — 'Demo Hackathon' event seeded."
  );
  printCounts(counts, "Dummy rows:");
  console.log(
    "\nNext step: in the app, flip the sidebar 'Demo Mode' switch ON to view this event."
  );
}

async function turnOff(): Promise<void> {
  const removed = await disableDemoData();
  if (Object.keys(removed).length === 0) {
    console.log("Dummy data is already OFF — nothing to remove.");
    return;
  }
  printCounts(removed, "Removed rows:");
  console.log(
    "\nDatabase is back to real data only. Remember to flip the sidebar 'Demo Mode' switch OFF too — it lives in your browser."
  );
}

async function showStatus(): Promise<void> {
  const { enabled, counts } = await demoDataStatus();
  if (!enabled) {
    console.log("Status: OFF — no dummy data in the database.");
    return;
  }
  printCounts(counts, "Status: ON — dummy rows present:");
}

const commands: Record<string, () => Promise<void>> = {
  on: turnOn,
  off: turnOff,
  status: showStatus,
};

async function main() {
  const command = process.argv[2] ?? "status";
  const handler = commands[command];
  if (!handler) {
    console.error(
      `Unknown command "${command}". Usage: npm run demo:on | demo:off | demo:status`
    );
    process.exit(1);
  }

  try {
    await handler();
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`demo:${command} failed:`, error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
