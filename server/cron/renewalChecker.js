import cron from 'node-cron';
import pool from '../config/db.js';
import { sendRenewalReminder } from '../services/emailService.js';
import { sendRenewalSMS } from '../services/smsService.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';

/**
 * Start the daily renewal checker cron job.
 * Runs every day at 9:00 AM server time.
 *
 * 1. Finds subscriptions approaching renewal (within user's reminder_days).
 * 2. Sends email and/or SMS reminders based on preferences.
 * 3. Logs each notification attempt.
 * 4. Marks expired subscriptions.
 */
export function startRenewalChecker() {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 [Cron] Running daily renewal checker...');

    try {
      // Step 1: Send renewal reminders
      const upcomingResult = await pool.query(
        `SELECT
           s.id AS subscription_id,
           s.service_name,
           s.amount,
           s.renewal_date,
           s.billing_cycle,
           u.id AS user_id,
           u.email,
           u.phone,
           u.email_notifications,
           u.sms_notifications,
           u.reminder_days
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE s.status = 'active'
           AND s.renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL u.reminder_days DAY)
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.subscription_id = s.id
               AND n.status = 'sent'
               AND DATE(n.created_at) = CURDATE()
           )`,
      );

      const subscriptions = upcomingResult.rows;
      console.log(`🔔 [Cron] Found ${subscriptions.length} upcoming renewals to notify.`);

      for (const sub of subscriptions) {
        // Email notification
        if (sub.email_notifications && sub.email) {
          try {
            await sendRenewalReminder(sub.email, sub.service_name, sub.renewal_date, sub.amount);

            await pool.query(
              "INSERT INTO notifications (user_id, subscription_id, type, status, message, sent_at) VALUES (?, ?, 'email', 'sent', ?, NOW())",
              [sub.user_id, sub.subscription_id, `Renewal reminder: ${sub.service_name} renews on ${formatDate(sub.renewal_date)} (${formatCurrency(sub.amount)})`],
            );
            console.log(`  ✉️  Email sent to ${sub.email} for ${sub.service_name}`);
          } catch (err) {
            console.error(`  ❌ Email failed for ${sub.email}:`, err.message);
            await pool.query(
              "INSERT INTO notifications (user_id, subscription_id, type, status, message) VALUES (?, ?, 'email', 'failed', ?)",
              [sub.user_id, sub.subscription_id, `Email failed: ${err.message}`],
            );
          }
        }

        // SMS notification
        if (sub.sms_notifications && sub.phone) {
          try {
            await sendRenewalSMS(sub.phone, sub.service_name, sub.renewal_date);

            await pool.query(
              "INSERT INTO notifications (user_id, subscription_id, type, status, message, sent_at) VALUES (?, ?, 'sms', 'sent', ?, NOW())",
              [sub.user_id, sub.subscription_id, `SMS reminder: ${sub.service_name} renews on ${formatDate(sub.renewal_date)}`],
            );
            console.log(`  📱 SMS sent to ${sub.phone} for ${sub.service_name}`);
          } catch (err) {
            console.error(`  ❌ SMS failed for ${sub.phone}:`, err.message);
            await pool.query(
              "INSERT INTO notifications (user_id, subscription_id, type, status, message) VALUES (?, ?, 'sms', 'failed', ?)",
              [sub.user_id, sub.subscription_id, `SMS failed: ${err.message}`],
            );
          }
        }
      }

      // Step 2: Mark expired subscriptions
      const expiredResult = await pool.query(
        "UPDATE subscriptions SET status = 'expired', updated_at = NOW() WHERE status = 'active' AND renewal_date < CURDATE()",
      );

      if (expiredResult.affectedRows > 0) {
        console.log(`🔔 [Cron] Marked ${expiredResult.affectedRows} subscriptions as expired.`);
      }

      console.log('🔔 [Cron] Renewal checker completed.');
    } catch (err) {
      console.error('🔔 [Cron] Renewal checker failed:', err.message);
    }
  });

  console.log('🔔 Renewal checker cron job scheduled (daily at 9:00 AM).');
}
