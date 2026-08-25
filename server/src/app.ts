import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import hardwareRoutes from "./modules/hardware/hardware.routes.js";
import { pool } from "./db/pool.js";
import submissionRoutes from "./modules/submissions/submissions.routes.js";
import volunteerRoutes from "./modules/volunteers/volunteers.routes.js";
import incidentRoutes from "./modules/incidents/incidents.routes.js";
import budgetRoutes from "./modules/budget/budget.routes.js";

const app = express();

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events/:eventId/hardware", hardwareRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/volunteers", volunteerRoutes);
app.use("/api/v1/incidents", incidentRoutes);
app.use("/api/v1/budget", budgetRoutes);

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Detailed health check with database info
app.get("/api/v1/health/detailed", async (_req, res) => {
  try {
    const dbResult = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as postgres_version,
        now() as server_time,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections
    `);
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const migrationResult = await pool.query(`
      SELECT * FROM migrations ORDER BY id DESC LIMIT 5
    `).catch(() => ({ rows: [] }));
    
    res.json({ 
      success: true, 
      data: { 
        status: "ok",
        database: dbResult.rows[0],
        tables: tablesResult.rows.map(r => r.table_name),
        recent_migrations: migrationResult.rows,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      } 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: { 
        code: "DB_ERROR", 
        message: err instanceof Error ? err.message : "Database connection failed" 
      } 
    });
  }
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
