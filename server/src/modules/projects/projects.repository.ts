import { pool } from "../../db/pool.js";

export interface ProjectRecord {
  id: string;
  event_id: string;
  team_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  status: string;
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  team_name?: string;
  is_own?: boolean;
}

const BASE_SELECT = `
  SELECT p.*, t.name AS team_name
  FROM project_submissions p
  JOIN teams t ON t.id = p.team_id
`;

export const projectsRepository = {
  async listByEvent(eventId: string, viewerId: string, isOrganizer: boolean) {
    const result = await pool.query(
      `SELECT p.*, t.name AS team_name,
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = p.team_id AND tm.user_id = $2
        ) AS is_own
       FROM project_submissions p
       JOIN teams t ON t.id = p.team_id
       WHERE p.event_id = $1
         AND (
           p.status = 'submitted'
           OR (p.status = 'disqualified' AND ($3::boolean OR EXISTS (
             SELECT 1 FROM team_members tm
             WHERE tm.team_id = p.team_id AND tm.user_id = $2
           )))
           OR (
             p.status = 'draft'
             AND ($3::boolean OR EXISTS (
               SELECT 1 FROM team_members tm
               WHERE tm.team_id = p.team_id AND tm.user_id = $2
             ))
           )
         )
       ORDER BY p.created_at DESC`,
      [eventId, viewerId, isOrganizer]
    );
    return result.rows;
  },

  async findById(eventId: string, projectId: string) {
    const result = await pool.query(`${BASE_SELECT} WHERE p.event_id = $1 AND p.id = $2`, [
      eventId,
      projectId,
    ]);
    return (result.rows[0] as ProjectRecord) ?? null;
  },

  async findLiveByTeam(eventId: string, teamId: string) {
    const result = await pool.query(
      `SELECT * FROM project_submissions
       WHERE event_id = $1 AND team_id = $2 AND status IN ('draft', 'submitted')
       LIMIT 1`,
      [eventId, teamId]
    );
    return result.rows[0] ?? null;
  },

  async findTeamIdByUser(eventId: string, userId: string) {
    const result = await pool.query(
      `SELECT tm.team_id
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       WHERE t.event_id = $1 AND tm.user_id = $2
       LIMIT 1`,
      [eventId, userId]
    );
    return (result.rows[0]?.team_id as string) ?? null;
  },

  async isUserTeamMember(eventId: string, teamId: string, userId: string) {
    const result = await pool.query(
      `SELECT 1
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       WHERE tm.team_id = $2 AND tm.user_id = $3 AND t.event_id = $1`,
      [eventId, teamId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  async insert(
    eventId: string,
    teamId: string,
    data: {
      title: string;
      description: string | null;
      repo_url: string | null;
      demo_url: string | null;
      status: string;
    }
  ) {
    const result = await pool.query(
      `INSERT INTO project_submissions (event_id, team_id, title, description, repo_url, demo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [eventId, teamId, data.title, data.description, data.repo_url, data.demo_url, data.status]
    );
    return result.rows[0];
  },

  async update(eventId: string, projectId: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 3}`);
    const values = keys.map((k) => fields[k]);
    const result = await pool.query(
      `UPDATE project_submissions SET ${sets.join(", ")}, updated_at = NOW()
       WHERE event_id = $1 AND id = $2
       RETURNING *`,
      [eventId, projectId, ...values]
    );
    return result.rows[0] ?? null;
  },
};
