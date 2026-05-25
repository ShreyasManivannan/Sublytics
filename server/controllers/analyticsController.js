import pool from '../config/db.js';

/**
 * GET /api/analytics/monthly
 * Monthly spending totals for the current year.
 */
export async function getMonthlySpending(req, res) {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const result = await pool.query(
      `SELECT
         m.month_num AS month,
         DATE_FORMAT(STR_TO_DATE(m.month_num, '%m'), '%b') AS month_name,
         COALESCE(SUM(
           CASE
             WHEN s.billing_cycle = 'monthly' THEN s.amount
             WHEN s.billing_cycle = 'yearly'  THEN ROUND(s.amount / 12, 2)
             WHEN s.billing_cycle = 'weekly'  THEN ROUND(s.amount * 4.33, 2)
             ELSE 0
           END
         ), 0) AS total
       FROM (
         SELECT 1 AS month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
         UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
       ) m
       LEFT JOIN subscriptions s
         ON s.user_id = ?
         AND s.status = 'active'
         AND YEAR(s.created_at) <= ?
         AND (
           YEAR(s.renewal_date) > ?
           OR (YEAR(s.renewal_date) = ? AND MONTH(s.renewal_date) >= m.month_num)
         )
         AND MONTH(s.created_at) <= m.month_num
       GROUP BY m.month_num
       ORDER BY m.month_num`,
      [userId, currentYear, currentYear, currentYear],
    );

    res.json({ monthlySpending: result.rows });
  } catch (err) {
    console.error('Monthly spending error:', err.message);
    res.status(500).json({ error: 'Failed to calculate monthly spending.' });
  }
}

/**
 * GET /api/analytics/categories
 * Spending grouped by category for active subscriptions.
 */
export async function getCategoryBreakdown(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         COALESCE(category, 'Uncategorized') AS category,
         COUNT(*) AS count,
         SUM(
           CASE
             WHEN billing_cycle = 'monthly' THEN amount
             WHEN billing_cycle = 'yearly'  THEN ROUND(amount / 12, 2)
             WHEN billing_cycle = 'weekly'  THEN ROUND(amount * 4.33, 2)
             ELSE 0
           END
         ) AS monthly_total,
         SUM(
           CASE
             WHEN billing_cycle = 'yearly'  THEN amount
             WHEN billing_cycle = 'monthly' THEN amount * 12
             WHEN billing_cycle = 'weekly'  THEN ROUND(amount * 52, 2)
             ELSE 0
           END
         ) AS yearly_total
       FROM subscriptions
       WHERE user_id = ? AND status = 'active'
       GROUP BY category
       ORDER BY monthly_total DESC`,
      [userId],
    );

    res.json({ categoryBreakdown: result.rows });
  } catch (err) {
    console.error('Category breakdown error:', err.message);
    res.status(500).json({ error: 'Failed to calculate category breakdown.' });
  }
}

/**
 * GET /api/analytics/yearly
 * Total yearly cost across all active subscriptions.
 */
export async function getYearlyTotal(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(
           CASE
             WHEN billing_cycle = 'yearly'  THEN amount
             WHEN billing_cycle = 'monthly' THEN amount * 12
             WHEN billing_cycle = 'weekly'  THEN ROUND(amount * 52, 2)
             ELSE 0
           END
         ), 0) AS yearly_total,
         COALESCE(SUM(
           CASE
             WHEN billing_cycle = 'monthly' THEN amount
             WHEN billing_cycle = 'yearly'  THEN ROUND(amount / 12, 2)
             WHEN billing_cycle = 'weekly'  THEN ROUND(amount * 4.33, 2)
             ELSE 0
           END
         ), 0) AS monthly_total,
         COUNT(*) AS subscription_count
       FROM subscriptions
       WHERE user_id = ? AND status = 'active'`,
      [userId],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Yearly total error:', err.message);
    res.status(500).json({ error: 'Failed to calculate yearly total.' });
  }
}

/**
 * GET /api/analytics/trends
 * Month-over-month spending trends for the past 12 months.
 */
export async function getTrends(req, res) {
  try {
    const userId = req.user.id;

    // Generate the last 12 months using a UNION
    const result = await pool.query(
      `SELECT
         DATE_FORMAT(month_start, '%Y-%m') AS month,
         DATE_FORMAT(month_start, '%b %Y') AS label,
         COALESCE(SUM(
           CASE
             WHEN s.billing_cycle = 'monthly' THEN s.amount
             WHEN s.billing_cycle = 'yearly'  THEN ROUND(s.amount / 12, 2)
             WHEN s.billing_cycle = 'weekly'  THEN ROUND(s.amount * 4.33, 2)
             ELSE 0
           END
         ), 0) AS total
       FROM (
         SELECT DATE_FORMAT(DATE_SUB(NOW(), INTERVAL n MONTH), '%Y-%m-01') AS month_start
         FROM (
           SELECT 11 AS n UNION SELECT 10 UNION SELECT 9 UNION SELECT 8
           UNION SELECT 7 UNION SELECT 6 UNION SELECT 5 UNION SELECT 4
           UNION SELECT 3 UNION SELECT 2 UNION SELECT 1 UNION SELECT 0
         ) nums
       ) months
       LEFT JOIN subscriptions s
         ON s.user_id = ?
         AND s.status = 'active'
         AND s.created_at <= LAST_DAY(months.month_start)
         AND (s.renewal_date >= months.month_start OR s.status = 'active')
       GROUP BY months.month_start
       ORDER BY months.month_start ASC`,
      [userId],
    );

    // Calculate month-over-month change percentages
    const trends = result.rows.map((row, idx) => {
      const prevTotal = idx > 0 ? parseFloat(result.rows[idx - 1].total) : 0;
      const currentTotal = parseFloat(row.total);
      const change = prevTotal > 0
        ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100 * 100) / 100
        : 0;

      return { month: row.month, label: row.label, total: currentTotal, change };
    });

    res.json({ trends });
  } catch (err) {
    console.error('Trends error:', err.message);
    res.status(500).json({ error: 'Failed to calculate spending trends.' });
  }
}
