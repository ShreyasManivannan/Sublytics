import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Create a configured Google OAuth2 client using env credentials.
 * @returns {google.auth.OAuth2}
 */
export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
}

/**
 * Generate the consent URL that the user should visit to authorise Gmail access.
 * @returns {string} authorization URL
 */
export function getAuthUrl() {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',     // Needed to get a refresh token
    prompt: 'consent',          // Force consent screen so we always get refresh token
    scope: SCOPES,
  });
}

/**
 * Exchange an authorization code for access + refresh tokens.
 * @param {string} code - The authorization code returned by Google
 * @returns {Promise<{ access_token: string, refresh_token: string }>}
 */
export async function getTokens(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

/**
 * Fetch emails matching common invoice / receipt / subscription keywords.
 * Returns an array of simplified message objects.
 * @param {string} refreshToken - User's stored Gmail refresh token
 * @returns {Promise<Array<{ id: string, snippet: string, subject: string, from: string, date: string, body: string }>>}
 */
export async function fetchInvoiceEmails(refreshToken) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: client });

  // Search for invoice-like emails (last 90 days)
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: 'subject:(invoice OR receipt OR subscription OR payment OR billing) newer_than:90d',
    maxResults: 50,
  });

  const messages = response.data.messages || [];
  const results = [];

  for (const msg of messages) {
    try {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = full.data.payload?.headers || [];
      const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '';
      const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
      const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

      const body = getEmailBody(full.data.payload);

      results.push({
        id: msg.id,
        snippet: full.data.snippet || '',
        subject,
        from,
        date,
        body,
      });
    } catch (err) {
      console.error(`Failed to fetch message ${msg.id}:`, err.message);
    }
  }

  return results;
}

/**
 * Recursively extract the plain-text or HTML body from a Gmail message payload.
 * @param {object} payload - Gmail message payload
 * @returns {string} decoded body text
 */
function getEmailBody(payload) {
  if (!payload) return '';

  // Simple body (single-part message)
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }

  // Multipart – recurse through parts, preferring text/plain
  if (payload.parts && payload.parts.length > 0) {
    // First try to find text/plain
    const plainPart = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return Buffer.from(plainPart.body.data, 'base64url').toString('utf-8');
    }

    // Fall back to text/html
    const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      return Buffer.from(htmlPart.body.data, 'base64url').toString('utf-8');
    }

    // Recurse into nested parts
    for (const part of payload.parts) {
      const nested = getEmailBody(part);
      if (nested) return nested;
    }
  }

  return '';
}
