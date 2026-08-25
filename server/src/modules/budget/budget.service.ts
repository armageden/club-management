import { pool } from "../../db/pool.js";
import {
  CreateContributionInput,
  CreateExpenditureInput,
} from "./budget.schema.js";

export interface LedgerEntry {
  id: string;
  entry_type: "contribution" | "expenditure";
  amount: number;
  party: string | null;
  contribution_type: "cash" | "in_kind" | null;
  tier: string | null;
  category: string | null;
  description: string | null;
  occurred_at: string;
  recorded_by_name: string | null;
}

export const listLedgerFromDb = async (eventId: string): Promise<LedgerEntry[]> => {
  const query = `
    SELECT
      c.id,
      'contribution'::text AS entry_type,
      c.amount::float8 AS amount,
      s.name AS party,
      c.contribution_type::text AS contribution_type,
      s.tier::text AS tier,
      NULL::varchar AS category,
      c.description,
      c.received_at AS occurred_at,
      ru.full_name AS recorded_by_name
    FROM sponsor_contributions c
    JOIN sponsors s ON s.id = c.sponsor_id
    LEFT JOIN users ru ON ru.id = c.recorded_by
    WHERE c.event_id = $1
    UNION ALL
    SELECT
      e.id,
      'expenditure'::text AS entry_type,
      e.amount::float8 AS amount,
      e.vendor AS party,
      NULL::varchar AS contribution_type,
      NULL::varchar AS tier,
      e.category::text AS category,
      e.description,
      e.spent_at AS occurred_at,
      ru.full_name AS recorded_by_name
    FROM expenditures e
    LEFT JOIN users ru ON ru.id = e.recorded_by
    WHERE e.event_id = $1
    ORDER BY occurred_at DESC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const getBudgetSummaryFromDb = async (eventId: string) => {
  const contributionsQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN contribution_type = 'cash' THEN amount END), 0)::float8 AS total_cash,
      COALESCE(SUM(CASE WHEN contribution_type = 'in_kind' THEN amount END), 0)::float8 AS total_in_kind,
      COALESCE(SUM(amount), 0)::float8 AS total_contributions,
      COUNT(*)::int AS contribution_count
    FROM sponsor_contributions
    WHERE event_id = $1;
  `;

  const expendituresQuery = `
    SELECT
      COALESCE(SUM(amount), 0)::float8 AS total_expenditures,
      COUNT(*)::int AS expenditure_count
    FROM expenditures
    WHERE event_id = $1;
  `;

  const byCategoryQuery = `
    SELECT category, SUM(amount)::float8 AS total
    FROM expenditures
    WHERE event_id = $1
    GROUP BY category
    ORDER BY total DESC;
  `;

  const [contributions, expenditures, byCategory] = await Promise.all([
    pool.query(contributionsQuery, [eventId]),
    pool.query(expendituresQuery, [eventId]),
    pool.query(byCategoryQuery, [eventId]),
  ]);

  const totals = {
    ...contributions.rows[0],
    ...expenditures.rows[0],
  };

  return {
    totalCash: Number(totals.total_cash ?? 0),
    totalInKind: Number(totals.total_in_kind ?? 0),
    totalContributions: Number(totals.total_contributions ?? 0),
    contributionCount: Number(totals.contribution_count ?? 0),
    totalExpenditures: Number(totals.total_expenditures ?? 0),
    expenditureCount: Number(totals.expenditure_count ?? 0),
    netBalance:
      Number(totals.total_contributions ?? 0) -
      Number(totals.total_expenditures ?? 0),
    expendituresByCategory: byCategory.rows.map((row) => ({
      category: row.category as string,
      total: Number(row.total),
    })),
  };
};

export const createContributionInDb = async (
  data: CreateContributionInput,
  recordedByUserId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find an existing sponsor for this event or create one (case-insensitive)
    let sponsorResult = await client.query(
      `SELECT id FROM sponsors WHERE event_id = $1 AND LOWER(name) = LOWER($2);`,
      [data.eventId, data.sponsorName]
    );

    let sponsorId: string;
    if (sponsorResult.rows.length > 0) {
      sponsorId = sponsorResult.rows[0].id;
      // Keep contact details / tier fresh if provided on a later contribution
      await client.query(
        `UPDATE sponsors SET
           contact_name = COALESCE($2, contact_name),
           contact_email = COALESCE($3, contact_email),
           tier = COALESCE($4, tier)
         WHERE id = $1;`,
        [sponsorId, data.contactName || null, data.contactEmail || null, data.tier || null]
      );
    } else {
      const insertSponsor = await client.query(
        `INSERT INTO sponsors (event_id, name, contact_name, contact_email, tier)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id;`,
        [
          data.eventId,
          data.sponsorName,
          data.contactName || null,
          data.contactEmail || null,
          data.tier || null,
        ]
      );
      sponsorId = insertSponsor.rows[0].id;
    }

    const result = await client.query(
      `INSERT INTO sponsor_contributions
         (event_id, sponsor_id, contribution_type, amount, description, received_at, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        data.eventId,
        sponsorId,
        data.contributionType,
        data.amount,
        data.description || null,
        data.receivedAt ? new Date(data.receivedAt) : new Date(),
        recordedByUserId,
      ]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createExpenditureInDb = async (
  data: CreateExpenditureInput,
  recordedByUserId: string
) => {
  const query = `
    INSERT INTO expenditures (event_id, category, amount, vendor, description, spent_at, recorded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    data.eventId,
    data.category,
    data.amount,
    data.vendor || null,
    data.description || null,
    data.spentAt ? new Date(data.spentAt) : new Date(),
    recordedByUserId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};
