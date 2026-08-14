import pg from "pg";
import { config } from "../config/index.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
