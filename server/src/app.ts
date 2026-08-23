import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import eventMembersRoutes from "./modules/event-members/event-members.routes.js";
import participantsRoutes from "./modules/participants/participants.routes.js";
import teamsRoutes from "./modules/teams/teams.routes.js";
import itineraryRoutes from "./modules/itinerary/itinerary.routes.js";
import checkinRoutes from "./modules/checkin/checkin.routes.js";
import certificatesRoutes from "./modules/certificates/certificates.routes.js";

const app = express();

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events/:eventId/members", eventMembersRoutes);
app.use("/api/v1/events/:eventId/participants", participantsRoutes);
app.use("/api/v1/events/:eventId/teams", teamsRoutes);
app.use("/api/v1/events/:eventId/itinerary", itineraryRoutes);
app.use("/api/v1/events/:eventId/checkin", checkinRoutes);
app.use("/api/v1/events/:eventId/certificates", certificatesRoutes);

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
