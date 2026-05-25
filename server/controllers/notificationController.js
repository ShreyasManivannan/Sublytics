import pool from '../config/db.js';
import { sendRenewalReminder } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

/**
 * GET /api/notifications/preferences
 * Return the current user's notification preferences.
 */
export async function getPreferences(req, res) {
  try {
    const result = await pool.query(
      'SELECT email_notifications, sms_notifications, reminder_days, phone, email FROM users WHERE id = ?',
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ preferences: result.rows[0] });
  } catch (err) {
    console.error('Get preferences error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notification preferences.' });
  }
}

/**
 * PUT /api/notifications/preferences
 * Update the user's notification preferences.
 */
export async function updatePreferences(req, res) {
  try {
    const { email_notifications, sms_notifications, reminder_days, phone } = req.body;

    if (reminder_days !== undefined && (reminder_days < 1 || reminder_days > 30)) {
      return res.status(400).json({ error: 'reminder_days must be between 1 and 30.' });
    }

    if (sms_notifications && !phone && !req.user.phone) {
      return res.status(400).json({ error: 'Phone number is required for SMS notifications.' });
    }

    await pool.query(
      `UPDATE users SET
         email_notifications = COALESCE(?, email_notifications),
         sms_notifications   = COALESCE(?, sms_notifications),
         reminder_days       = COALESCE(?, reminder_days),
         phone               = COALESCE(?, phone)
       WHERE id = ?`,
      [email_notifications, sms_notifications, reminder_days, phone, req.user.id],
    );

    // Fetch updated preferences
    const result = await pool.query(
      'SELECT email_notifications, sms_notifications, reminder_days, phone FROM users WHERE id = ?',
      [req.user.id],
    );

    res.json({ message: 'Notification preferences updated.', preferences: result.rows[0] });
  } catch (err) {
    console.error('Update preferences error:', err.message);
    res.status(500).json({ error: 'Failed to update notification preferences.' });
  }
}

/**
 * POST /api/notifications/test-email
 * Send a test notification email to the current user.
 */
export async function sendTestEmail(req, res) {
  try {
    const user = req.user;

    await sendRenewalReminder(
      user.email,
      'Test Subscription',
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      9.99,
    );

    await pool.query(
      "INSERT INTO notifications (user_id, type, status, message, sent_at) VALUES (?, 'email', 'sent', 'Test email notification sent', NOW())",
      [user.id],
    );

    res.json({ message: 'Test email sent successfully.' });
  } catch (err) {
    console.error('Test email error:', err.message);

    await pool.query(
      "INSERT INTO notifications (user_id, type, status, message) VALUES (?, 'email', 'failed', ?)",
      [req.user.id, `Test email failed: ${err.message}`],
    ).catch(() => {});

    res.status(500).json({ error: 'Failed to send test email.' });
  }
}

/**
 * POST /api/notifications/test-sms
 * Send a test notification SMS to the current user.
 */
export async function sendTestSMS(req, res) {
  try {
    const user = req.user;

    if (!user.phone) {
      return res.status(400).json({ error: 'No phone number on file. Update your notification preferences first.' });
    }

    await sendSMS(user.phone, 'Sublytics Test: This is a test SMS notification. Your notifications are working!');

    await pool.query(
      "INSERT INTO notifications (user_id, type, status, message, sent_at) VALUES (?, 'sms', 'sent', 'Test SMS notification sent', NOW())",
      [user.id],
    );

    res.json({ message: 'Test SMS sent successfully.' });
  } catch (err) {
    console.error('Test SMS error:', err.message);

    await pool.query(
      "INSERT INTO notifications (user_id, type, status, message) VALUES (?, 'sms', 'failed', ?)",
      [req.user.id, `Test SMS failed: ${err.message}`],
    ).catch(() => {});

    res.status(500).json({ error: 'Failed to send test SMS.' });
  }
}
