import { pool } from "../../db/pool.js";
import { CreateSubmissionInput, SubmitScoreInput } from "./submissions.schema.js";

export const createSubmissionInDb = async (data: CreateSubmissionInput) => {
  const query = `
    INSERT INTO project_submissions (event_id, team_id, title, description, repo_url, demo_url, status, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const status = data.status || "submitted";
  const submittedAt = status === "submitted" ? new Date() : null;
  const values = [
    data.eventId,
    data.teamId,
    data.title,
    data.description || null,
    data.repoUrl || null,
    data.demoUrl || null,
    status,
    submittedAt,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const submitScoreInDb = async (submissionId: string, judgeId: string, data: SubmitScoreInput) => {
  // Calculate average total score across the 4 criteria
  const scoreTotal = (data.scoreInnovation + data.scoreTechnical + data.scorePresentation + data.scoreUsefulness) / 4;

  const query = `
    INSERT INTO judging_scores 
      (project_submission_id, judge_user_id, score_innovation, score_technical, score_presentation, score_usefulness, score_total, feedback)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_submission_id, judge_user_id) 
    DO UPDATE SET
      score_innovation = EXCLUDED.score_innovation,
      score_technical = EXCLUDED.score_technical,
      score_presentation = EXCLUDED.score_presentation,
      score_usefulness = EXCLUDED.score_usefulness,
      score_total = EXCLUDED.score_total,
      feedback = EXCLUDED.feedback,
      submitted_at = NOW()
    RETURNING *;
  `;
  const values = [
    submissionId,
    judgeId,
    data.scoreInnovation,
    data.scoreTechnical,
    data.scorePresentation,
    data.scoreUsefulness,
    scoreTotal,
    data.feedback || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const listSubmissionsFromDb = async (eventId: string) => {
  const query = `
    SELECT 
      ps.*,
      t.name AS team_name,
      (SELECT COUNT(*)::int FROM judging_scores js WHERE js.project_submission_id = ps.id) AS score_count
    FROM project_submissions ps
    JOIN teams t ON ps.team_id = t.id
    WHERE ps.event_id = $1
    ORDER BY ps.created_at DESC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const listTeamsFromDb = async (eventId: string) => {
  const query = `
    SELECT id, name, event_id, created_at
    FROM teams
    WHERE event_id = $1
    ORDER BY name ASC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const createTeamInDb = async (data: { eventId: string; name: string; createdBy: string }) => {
  const query = `
    INSERT INTO teams (event_id, name, created_by)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [data.eventId, data.name, data.createdBy]);
  return result.rows[0];
};

export const getLeaderboardFromDb = async (eventId: string) => {
  const query = `
    SELECT 
      ps.id AS submission_id,
      ps.title,
      ps.repo_url,
      ps.demo_url,
      t.name AS team_name,
      COUNT(js.id)::int AS total_votes,
      ROUND(AVG(js.score_total), 2) AS final_score
    FROM project_submissions ps
    JOIN teams t ON ps.team_id = t.id
    LEFT JOIN judging_scores js ON ps.id = js.project_submission_id
    WHERE ps.event_id = $1 AND ps.status = 'submitted'
    GROUP BY ps.id, t.name
    ORDER BY final_score DESC NULLS LAST;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};