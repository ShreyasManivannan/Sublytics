import pool from '../config/db.js';
import { getAuthUrl, getTokens, fetchInvoiceEmails } from '../services/gmailService.js';
import { extractSubscriptionData } from '../services/extractionService.js';

/**
 * GET /api/gmail/connect
 * Generate and return the Google OAuth consent URL for Gmail access.
 */
export async function connectGmail(req, res) {
  try {
    const url = getAuthUrl();
    res.json({ authUrl: url });
  } catch (err) {
    console.error('Connect Gmail error:', err.message);
    res.status(500).json({ error: 'Failed to generate Gmail authorization URL.' });
  }
}

/**
 * POST /api/gmail/callback
 * Exchange the OAuth authorization code for tokens and store the refresh token.
 */
export async function handleCallback(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const tokens = await getTokens(code);

    if (!tokens.refresh_token) {
      return res.status(400).json({
        error: 'No refresh token received. Please revoke access and try again.',
      });
    }

    // Save the refresh token and mark Gmail as connected (1 for MySQL TINYINT)
    await pool.query(
      'UPDATE users SET gmail_connected = 1, gmail_refresh_token = ? WHERE id = ?',
      [tokens.refresh_token, req.user.id],
    );

    res.json({ message: 'Gmail connected successfully.' });
  } catch (err) {
    console.error('Gmail callback error:', err.message);
    res.status(500).json({ error: 'Failed to connect Gmail.' });
  }
}

/**
 * POST /api/gmail/fetch-invoices
 * Fetch invoice/receipt emails from the user's Gmail and extract subscription data.
 */
export async function fetchInvoices(req, res) {
  try {
    const userResult = await pool.query(
      'SELECT gmail_connected, gmail_refresh_token FROM users WHERE id = ?',
      [req.user.id],
    );

    const user = userResult.rows[0];

    if (!user.gmail_connected || !user.gmail_refresh_token) {
      return res.status(400).json({ error: 'Gmail is not connected. Please connect Gmail first.' });
    }

    const emails = await fetchInvoiceEmails(user.gmail_refresh_token);

    const extractedSubscriptions = emails
      .map((email) => {
        const data = extractSubscriptionData(email);
        return {
          ...data,
          source: 'gmail',
          emailSubject: email.subject,
          emailDate: email.date,
          emailFrom: email.from,
        };
      })
      .filter((sub) => sub.serviceName || sub.amount);

    res.json({
      message: `Processed ${emails.length} emails, found ${extractedSubscriptions.length} potential subscriptions.`,
      subscriptions: extractedSubscriptions,
    });
  } catch (err) {
    console.error('Fetch invoices error:', err.message);
    res.status(500).json({ error: 'Failed to fetch invoices from Gmail.' });
  }
}

/**
 * GET /api/gmail/status
 * Check whether Gmail is connected for the current user.
 */
export async function getStatus(req, res) {
  try {
    const result = await pool.query(
      'SELECT gmail_connected FROM users WHERE id = ?',
      [req.user.id],
    );

    res.json({ gmailConnected: result.rows[0]?.gmail_connected || false });
  } catch (err) {
    console.error('Gmail status error:', err.message);
    res.status(500).json({ error: 'Failed to check Gmail status.' });
  }
}
