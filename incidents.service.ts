import { pool } from "../../db/pool.js";
import { CreateIncidentInput, UpdateIncidentStatusInput } from "./incidents.schema.js";
import { NotFoundError } from "../../middleware/error.middleware.js";

export const createIncidentInDb = async (data: CreateIncidentInput, reportedByUserId: string) => {
  const query = `
    INSERT INTO incidents (event_id, title, description, severity, status, location, reported_by, occurred_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    data.eventId,
    data.title,
    data.description || null,
    data.severity || "low",
    data.status || "open",
    data.location || null,
    reportedByUserId,
    data.occurredAt ? new Date(data.occurredAt) : new Date(),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateIncidentStatusInDb = async (incidentId: string, data: UpdateIncidentStatusInput) => {
  const resolvedAtClause = data.status === "resolved" ? ", resolved_at = NOW()" : "";
  
  const query = `
    UPDATE incidents
    SET status = $1,
        assigned_to = COALESCE($2, assigned_to)
        ${resolvedAtClause}
    WHERE id = $3
    RETURNING *;
  `;
  const values = [data.status, data.assignedTo || null, incidentId];

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new NotFoundError("Incident not found");
  }
  return result.rows[0];
};

export const listIncidentsFromDb = async (eventId: string) => {
  const query = `
    SELECT 
      i.*,
      ru.full_name AS reporter_name,
      au.full_name AS assignee_name
    FROM incidents i
    LEFT JOIN users ru ON i.reported_by = ru.id
    LEFT JOIN users au ON i.assigned_to = au.id
    WHERE i.event_id = $1
    ORDER BY i.occurred_at DESC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const getOperationalAnalyticsFromDb = async (eventId: string) => {
  // Aggregate incidents, volunteer fulfillment, and project submissions for organizers
  const incidentStatsQuery = `
    SELECT 
      severity,
      COUNT(*)::int as count
    FROM incidents
    WHERE event_id = $1
    GROUP BY severity;
  `;

  const statusStatsQuery = `
    SELECT 
      status,
      COUNT(*)::int as count
    FROM incidents
    WHERE event_id = $1
    GROUP BY status;
  `;

  const volunteerFulfillmentQuery = `
    SELECT 
      COUNT(DISTINCT vs.id)::int as total_shifts,
      SUM(vs.capacity)::int as total_capacity_needed,
      COUNT(va.id)::int as total_volunteers_assigned,
      COUNT(CASE WHEN va.status = 'checked_in' OR va.status = 'completed' THEN 1 END)::int as total_attended
    FROM volunteer_shifts vs
    LEFT JOIN volunteer_assignments va ON vs.id = va.volunteer_shift_id
    WHERE vs.event_id = $1;
  `;

  const [incidentsBySeverity, incidentsByStatus, volunteerStats] = await Promise.all([
    pool.query(incidentStatsQuery, [eventId]),
    pool.query(statusStatsQuery, [eventId]),
    pool.query(volunteerFulfillmentQuery, [eventId]),
  ]);

  return {
    incidentsBySeverity: incidentsBySeverity.rows,
    incidentsByStatus: incidentsByStatus.rows,
    volunteerOverview: volunteerStats.rows[0] || {},
  };
};