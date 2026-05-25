import { sendSESEmail } from './awsService.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';

/**
 * Send a subscription renewal reminder email using AWS SES.
 * @param {string} to - Recipient email address
 * @param {string} subscriptionName - Name of the subscription (e.g. "Netflix")
 * @param {Date|string} renewalDate - The upcoming renewal date
 * @param {number|string} amount - The renewal amount
 */
export async function sendRenewalReminder(to, subscriptionName, renewalDate, amount) {
  const formattedDate = formatDate(renewalDate);
  const formattedAmount = formatCurrency(amount);

  const subject = `⏰ Reminder: ${subscriptionName} renews on ${formattedDate}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc;">
      <h2 style="color: #3b82f6; border-bottom: 2px solid #334155; padding-bottom: 10px;">Sublytics AI Renewal Reminder</h2>
      <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #334155;">
        <p style="font-size: 16px; margin: 0 0 12px; color: #f8fafc;">
          Your subscription to <strong style="color: #60a5fa;">${subscriptionName}</strong> is renewing soon.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Service</td>
            <td style="padding: 10px 0; font-weight: 600; color: #f8fafc; border-bottom: 1px solid #334155; text-align: right;">${subscriptionName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Amount</td>
            <td style="padding: 10px 0; font-weight: 600; color: #10b981; border-bottom: 1px solid #334155; text-align: right;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Renewal Date</td>
            <td style="padding: 10px 0; font-weight: 600; color: #f59e0b; border-bottom: 1px solid #334155; text-align: right;">${formattedDate}</td>
          </tr>
        </table>
      </div>
      <p style="color: #94a3b8; font-size: 14px; text-align: center;">
        Review or cancel this subscription in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Sublytics AI dashboard</a>.
      </p>
      <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 11px; text-align: center;">
        You're receiving this because you have email notifications enabled on Sublytics AI. Powered by AWS SES.
      </p>
    </div>
  `;

  return sendSESEmail(to, subject, html);
}

/**
 * Send a welcome email after registration using AWS SES.
 * @param {string} to - Recipient email address
 * @param {string} name - User's display name
 */
export async function sendWelcomeEmail(to, name) {
  const subject = '🎉 Welcome to Sublytics AI!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc;">
      <h2 style="color: #3b82f6; border-bottom: 2px solid #334155; padding-bottom: 10px;">Welcome to Sublytics AI, ${name}!</h2>
      <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
        We're thrilled to help you take command of your recurring expenses with visual financial intelligence and smart AI insights.
      </p>
      <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #334155;">
        <h3 style="margin-top: 0; color: #3b82f6;">Your Ultimate SaaS Subscription Dashboard is Ready:</h3>
        <ul style="color: #94a3b8; line-height: 2; padding-left: 20px;">
          <li>🤖 <strong style="color: #f8fafc;">AI Financial Insights:</strong> Auto-detect savings and optimized tiers.</li>
          <li>📊 <strong style="color: #f8fafc;">Subscription Health Score:</strong> Keep your autopays and renewals perfectly healthy.</li>
          <li>📅 <strong style="color: #f8fafc;">Renewal Calendar:</strong> Visualise payments to prevent unexpected billing.</li>
          <li>📸 <strong style="color: #f8fafc;">Smart Invoice Scanner:</strong> Drag-and-drop bills to scan with AWS Textract.</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
          Launch Dashboard
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 11px; text-align: center;">
        Sublytics AI Platform. Secure subscription analytics. Powered by AWS Cloud Infrastructure.
      </p>
    </div>
  `;

  return sendSESEmail(to, subject, html);
}
