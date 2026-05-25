import pool from '../config/db.js';
import { uploadInvoiceToS3, scanInvoiceWithTextract } from '../services/awsService.js';

/**
 * GET /api/subscriptions
 * Retrieve all subscriptions for the authenticated user.
 */
export async function getAll(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY renewal_date ASC',
      [req.user.id],
    );
    res.json({ subscriptions: result.rows });
  } catch (err) {
    console.error('Get subscriptions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subscriptions.' });
  }
}

/**
 * GET /api/subscriptions/:id
 * Get a single subscription by ID.
 */
export async function getById(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    res.json({ subscription: result.rows[0] });
  } catch (err) {
    console.error('Get subscription error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subscription.' });
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription.
 */
export async function create(req, res) {
  try {
    const {
      service_name, amount, billing_cycle, category,
      renewal_date, autopay, icon_url, notes,
      currency, payment_method, split_count, last_used_at, invoice_url,
    } = req.body;

    if (!service_name || !amount || !billing_cycle || !renewal_date) {
      return res.status(400).json({
        error: 'service_name, amount, billing_cycle, and renewal_date are required.',
      });
    }

    const insertResult = await pool.query(
      `INSERT INTO subscriptions
         (user_id, service_name, amount, billing_cycle, category, renewal_date, autopay, icon_url, notes, currency, payment_method, split_count, last_used_at, invoice_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, service_name, amount, billing_cycle,
        category || null, renewal_date, autopay ? 1 : 0,
        icon_url || null, notes || null,
        currency || 'USD', payment_method || 'Visa', split_count || 1,
        last_used_at || new Date().toISOString().split('T')[0], invoice_url || null,
      ],
    );

    // Fetch the newly inserted subscription
    const fetchResult = await pool.query(
      'SELECT * FROM subscriptions WHERE id = ?',
      [insertResult.insertId],
    );

    res.status(201).json({ subscription: fetchResult.rows[0] });
  } catch (err) {
    console.error('Create subscription error:', err.message);
    res.status(500).json({ error: 'Failed to create subscription.' });
  }
}

/**
 * PUT /api/subscriptions/:id
 * Update an existing subscription.
 */
export async function update(req, res) {
  try {
    const { id } = req.params;
    const {
      service_name, amount, billing_cycle, category,
      renewal_date, autopay, status, icon_url, notes,
      currency, payment_method, split_count, last_used_at, invoice_url,
    } = req.body;

    // Verify ownership
    const existing = await pool.query(
      'SELECT id FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, req.user.id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    const autopayVal = autopay === undefined ? undefined : (autopay ? 1 : 0);

    await pool.query(
      `UPDATE subscriptions SET
         service_name   = COALESCE(?, service_name),
         amount         = COALESCE(?, amount),
         billing_cycle  = COALESCE(?, billing_cycle),
         category       = COALESCE(?, category),
         renewal_date   = COALESCE(?, renewal_date),
         autopay        = COALESCE(?, autopay),
         status         = COALESCE(?, status),
         icon_url       = COALESCE(?, icon_url),
         notes          = COALESCE(?, notes),
         currency       = COALESCE(?, currency),
         payment_method = COALESCE(?, payment_method),
         split_count    = COALESCE(?, split_count),
         last_used_at   = COALESCE(?, last_used_at),
         invoice_url    = COALESCE(?, invoice_url),
         updated_at     = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        service_name, amount, billing_cycle, category,
        renewal_date, autopayVal, status, icon_url, notes,
        currency, payment_method, split_count, last_used_at, invoice_url,
        id, req.user.id,
      ],
    );

    const fetchResult = await pool.query(
      'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, req.user.id],
    );

    res.json({ subscription: fetchResult.rows[0] });
  } catch (err) {
    console.error('Update subscription error:', err.message);
    res.status(500).json({ error: 'Failed to update subscription.' });
  }
}

/**
 * DELETE /api/subscriptions/:id
 * Delete a subscription.
 */
export async function remove(req, res) {
  try {
    await pool.query(
      'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
    );
    res.json({ message: 'Subscription deleted successfully.' });
  } catch (err) {
    console.error('Delete subscription error:', err.message);
    res.status(500).json({ error: 'Failed to delete subscription.' });
  }
}

/**
 * GET /api/subscriptions/stats
 * Return aggregate stats for the authenticated user.
 */
export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    const [activeRes, expiredRes, autopayRes, upcomingRes, totalRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND status = 'active'", [userId]),
      pool.query("SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND status = 'expired'", [userId]),
      pool.query('SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND autopay = 1', [userId]),
      pool.query(
        "SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND status = 'active' AND renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)",
        [userId],
      ),
      pool.query("SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND status != 'cancelled'", [userId]),
    ]);

    res.json({
      stats: {
        total: parseInt(totalRes.rows[0].count || 0),
        active: parseInt(activeRes.rows[0].count || 0),
        expired: parseInt(expiredRes.rows[0].count || 0),
        autopay: parseInt(autopayRes.rows[0].count || 0),
        upcomingRenewals: parseInt(upcomingRes.rows[0].count || 0),
      },
    });
  } catch (err) {
    console.error('Get stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subscription stats.' });
  }
}

/**
 * POST /api/subscriptions/scan
 * Upload an invoice and analyze it with OCR.
 */
export async function scanInvoice(req, res) {
  try {
    const { base64Data, fileName, fileMime } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No invoice file data provided.' });
    }

    const base64Clean = base64Data.split(',')[1] || base64Data;
    const fileBuffer = Buffer.from(base64Clean, 'base64');

    const s3Url = await uploadInvoiceToS3(fileBuffer, fileName || 'invoice.pdf', fileMime || 'application/pdf');
    const extractedData = await scanInvoiceWithTextract(fileBuffer, fileName || 'invoice.pdf');

    res.json({ success: true, invoiceUrl: s3Url, extractedData });
  } catch (err) {
    console.error('Invoice scan error:', err.message);
    res.status(500).json({ error: `Invoice processing failed: ${err.message}` });
  }
}
