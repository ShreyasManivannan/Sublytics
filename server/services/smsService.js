import twilio from 'twilio';
import { formatDate } from '../utils/helpers.js';

/**
 * Lazy-initialise the Twilio client so the module can be imported
 * without the env vars being set yet.
 */
let client = null;
function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

/**
 * Send a generic SMS message.
 * @param {string} to - Recipient phone number in E.164 format (e.g. +1234567890)
 * @param {string} message - The message body
 * @returns {Promise<object>} Twilio message response
 */
export async function sendSMS(to, message) {
  const twilioClient = getClient();

  const result = await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  return result;
}

/**
 * Send a subscription renewal reminder via SMS.
 * @param {string} to - Recipient phone number in E.164 format
 * @param {string} subscriptionName - Name of the subscription
 * @param {Date|string} renewalDate - The upcoming renewal date
 * @returns {Promise<object>}
 */
export async function sendRenewalSMS(to, subscriptionName, renewalDate) {
  const formattedDate = formatDate(renewalDate);
  const message = `SubGuard Reminder: Your ${subscriptionName} subscription renews on ${formattedDate}. Review it in your dashboard.`;
  return sendSMS(to, message);
}
