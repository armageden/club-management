import { pool } from "../../db/pool.js";

export const eventMembersRepository = {
  async findByEventAndUser(eventId: string, userId: string) {
    const result = await pool.query(
      "SELECT id, event_id, user_id, role, status, joined_at FROM event_members WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );
    return result.rows[0] || null;
  },

  async listByEvent(eventId: string) {
    const result = await pool.query(
      `SELECT em.id, em.event_id, em.user_id, em.role, em.status, em.joined_at,
              u.email, u.full_name
       FROM event_members em
       JOIN users u ON u.id = em.user_id
       WHERE em.event_id = $1
       ORDER BY em.joined_at ASC`,
      [eventId]
    );
    return result.rows;
  },

  async addMember(eventId: string, userId: string, role: string) {
    const result = await pool.query(
      `INSERT INTO event_members (event_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET role = $3
       RETURNING id, event_id, user_id, role, status, joined_at`,
      [eventId, userId, role]
    );
    return result.rows[0];
  },

  async updateRole(eventId: string, userId: string, role: string) {
    const result = await pool.query(
      `UPDATE event_members SET role = $3
       WHERE event_id = $1 AND user_id = $2
       RETURNING id, event_id, user_id, role, status, joined_at`,
      [eventId, userId, role]
    );
    return result.rows[0] || null;
  },

  async removeMember(eventId: string, userId: string) {
    const result = await pool.query(
      "DELETE FROM event_members WHERE event_id = $1 AND user_id = $2 RETURNING id",
      [eventId, userId]
    );
    return result.rows[0] || null;
  },

  async getMyRole(eventId: string, userId: string) {
    const result = await pool.query(
      "SELECT role, status FROM event_members WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );
    return result.rows[0] || null;
  },
};
