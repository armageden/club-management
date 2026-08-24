import { pool } from "../../db/pool.js";
import { CreateShiftInput, AssignVolunteerInput } from "./volunteers.schema.js";
import { NotFoundError, ConflictError } from "../../middleware/error.middleware.js";

export const createShiftInDb = async (data: CreateShiftInput) => {
  const query = `
    INSERT INTO volunteer_shifts (event_id, title, description, location, starts_at, ends_at, capacity, required_skills, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [
    data.eventId,
    data.title,
    data.description || null,
    data.location || null,
    new Date(data.startsAt),
    new Date(data.endsAt),
    data.capacity || 1,
    data.requiredSkills || null,
    data.status || "open",
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const assignVolunteerToShiftInDb = async (data: AssignVolunteerInput, assignedByUserId?: string) => {
  // Check 1: Verify capacity and availability
  const shiftCheckQuery = `
    SELECT capacity, starts_at, ends_at,
           (SELECT COUNT(*)::int FROM volunteer_assignments WHERE volunteer_shift_id = $1) as current_assignments
    FROM volunteer_shifts
    WHERE id = $1;
  `;
  const shiftRes = await pool.query(shiftCheckQuery, [data.shiftId]);
  if (shiftRes.rows.length === 0) {
    throw new NotFoundError("Volunteer shift not found");
  }

  const shift = shiftRes.rows[0];
  if (shift.current_assignments >= shift.capacity) {
    throw new ConflictError("This shift is already at full capacity");
  }

  // Check 2: Prevent overlapping shift schedules for the same volunteer
  const overlapCheckQuery = `
    SELECT va.id 
    FROM volunteer_assignments va
    JOIN volunteer_shifts vs ON va.volunteer_shift_id = vs.id
    WHERE va.user_id = $1 
      AND va.status IN ('assigned', 'checked_in')
      AND (vs.starts_at < $3 AND vs.ends_at > $2);
  `;
  const overlapRes = await pool.query(overlapCheckQuery, [data.userId, shift.starts_at, shift.ends_at]);
  if (overlapRes.rows.length > 0) {
    throw new ConflictError("Volunteer already has an overlapping shift");
  }

  // Assign volunteer
  const assignQuery = `
    INSERT INTO volunteer_assignments (volunteer_shift_id, user_id, assigned_by)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(assignQuery, [data.shiftId, data.userId, assignedByUserId || null]);

  // Update shift status to 'full' if capacity reached
  if (shift.current_assignments + 1 >= shift.capacity) {
    await pool.query(`UPDATE volunteer_shifts SET status = 'full' WHERE id = $1;`, [data.shiftId]);
  }

  return result.rows[0];
};

export const updateAssignmentStatusInDb = async (assignmentId: string, status: string) => {
  let timeClause = "";
  if (status === "checked_in") {
    timeClause = ", checked_in_at = NOW()";
  } else if (status === "completed") {
    timeClause = ", completed_at = NOW()";
  }

  const query = `
    UPDATE volunteer_assignments
    SET status = $1 ${timeClause}
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, assignmentId]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Volunteer assignment not found");
  }
  return result.rows[0];
};

export const listUsersFromDb = async () => {
  const query = `
    SELECT id, email, full_name, global_role
    FROM users
    ORDER BY full_name ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const listAssignmentsByEventFromDb = async (eventId: string) => {
  const query = `
    SELECT 
      va.*,
      vs.title AS shift_title,
      vs.starts_at AS shift_starts_at,
      vs.ends_at AS shift_ends_at,
      u.full_name AS volunteer_name,
      u.email AS volunteer_email
    FROM volunteer_assignments va
    JOIN volunteer_shifts vs ON va.volunteer_shift_id = vs.id
    JOIN users u ON va.user_id = u.id
    WHERE vs.event_id = $1
    ORDER BY vs.starts_at ASC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const getShiftsByEventFromDb = async (eventId: string) => {
  const query = `
    SELECT 
      vs.*,
      COUNT(va.id)::int AS filled_slots
    FROM volunteer_shifts vs
    LEFT JOIN volunteer_assignments va ON vs.id = va.volunteer_shift_id
    WHERE vs.event_id = $1
    GROUP BY vs.id
    ORDER BY vs.starts_at ASC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};