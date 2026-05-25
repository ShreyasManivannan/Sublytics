/**
 * Regex-based extraction service that parses email body text
 * to find subscription-related data points.
 */

/**
 * Extract structured subscription data from raw email text.
 * @param {{ subject: string, from: string, body: string, date: string }} email
 * @returns {{ serviceName: string|null, amount: number|null, billingCycle: string|null, renewalDate: string|null, autopay: boolean }}
 */
export function extractSubscriptionData(email) {
  const { subject = '', from = '', body = '', date = '' } = email;
  const combined = `${subject}\n${from}\n${body}`;

  return {
    serviceName: extractServiceName(subject, from),
    amount: extractAmount(combined),
    billingCycle: extractBillingCycle(combined),
    renewalDate: extractRenewalDate(combined, date),
    autopay: extractAutopay(combined),
  };
}

/**
 * Attempt to extract the service / company name from the From header or subject.
 * @param {string} subject
 * @param {string} from
 * @returns {string|null}
 */
function extractServiceName(subject, from) {
  // Well-known services – quick match
  const knownServices = [
    'Netflix', 'Spotify', 'Hulu', 'Disney+', 'Disney Plus',
    'Apple', 'Amazon', 'Google', 'Microsoft', 'Adobe',
    'Dropbox', 'Slack', 'Zoom', 'GitHub', 'Notion',
    'YouTube', 'HBO', 'Paramount', 'Peacock', 'Twitch',
    'LinkedIn', 'Grammarly', 'Canva', 'Figma', 'Vercel',
    'Heroku', 'AWS', 'DigitalOcean', 'Cloudflare',
    'ChatGPT', 'OpenAI', 'Midjourney', 'Claude', 'Anthropic',
  ];

  const combinedText = `${subject} ${from}`;
  for (const service of knownServices) {
    if (combinedText.toLowerCase().includes(service.toLowerCase())) {
      return service;
    }
  }

  // Try to extract a name from the From header – e.g. "Netflix <billing@netflix.com>"
  const fromNameMatch = from.match(/^"?([^"<]+)"?\s*</);
  if (fromNameMatch) {
    const name = fromNameMatch[1].trim();
    // Filter out generic names
    if (name.length > 1 && !['noreply', 'no-reply', 'billing', 'support', 'info'].includes(name.toLowerCase())) {
      return name;
    }
  }

  // Try domain from email address
  const domainMatch = from.match(/@([a-zA-Z0-9-]+)\./);
  if (domainMatch) {
    const domain = domainMatch[1];
    // Capitalise first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }

  return null;
}

/**
 * Extract the first dollar/currency amount found in the text.
 * Handles formats like $12.99, USD 12.99, 12.99 USD, etc.
 * @param {string} text
 * @returns {number|null}
 */
function extractAmount(text) {
  // Match patterns like $12.99, $1,234.56, USD 12.99
  const patterns = [
    /\$\s?([\d,]+\.?\d{0,2})/,
    /USD\s?([\d,]+\.?\d{0,2})/i,
    /([\d,]+\.?\d{0,2})\s?USD/i,
    /(?:total|amount|charge|price|cost|payment)[:\s]*\$?\s?([\d,]+\.\d{2})/i,
    /(?:billed|charged)[:\s]*\$?\s?([\d,]+\.\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, '');
      const amount = parseFloat(raw);
      // Sanity: ignore amounts that are clearly not subscription prices
      if (!isNaN(amount) && amount > 0 && amount < 100000) {
        return amount;
      }
    }
  }

  return null;
}

/**
 * Determine the billing cycle from keywords in the text.
 * @param {string} text
 * @returns {'monthly'|'yearly'|'weekly'|null}
 */
function extractBillingCycle(text) {
  const lower = text.toLowerCase();

  if (/\b(yearly|annual|annually|per year|\/year|\/yr)\b/.test(lower)) return 'yearly';
  if (/\b(monthly|per month|\/month|\/mo|each month)\b/.test(lower)) return 'monthly';
  if (/\b(weekly|per week|\/week|each week)\b/.test(lower)) return 'weekly';

  return null;
}

/**
 * Try to extract a renewal / next billing date from the text.
 * Falls back to the email date if no explicit date is found.
 * @param {string} text
 * @param {string} emailDate - The Date header from the email
 * @returns {string|null} ISO date string (YYYY-MM-DD) or null
 */
function extractRenewalDate(text, emailDate) {
  // Look for phrases like "next billing date: Jan 15, 2026" or "renews on 01/15/2026"
  const dateContextPatterns = [
    /(?:next\s*(?:billing|renewal|payment)\s*(?:date)?|renews?\s*on|due\s*(?:date|on)|valid\s*(?:until|through|till))[:\s]*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /(?:next\s*(?:billing|renewal|payment)\s*(?:date)?|renews?\s*on|due\s*(?:date|on))[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(?:next\s*(?:billing|renewal|payment)\s*(?:date)?|renews?\s*on|due\s*(?:date|on))[:\s]*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
  ];

  for (const pattern of dateContextPatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  // Fallback: use the email date itself
  if (emailDate) {
    const parsed = new Date(emailDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }

  return null;
}

/**
 * Check for autopay / auto-renewal keywords.
 * @param {string} text
 * @returns {boolean}
 */
function extractAutopay(text) {
  const lower = text.toLowerCase();
  return /\b(auto[\s-]?pay|auto[\s-]?renew|automatic\s*(?:payment|renewal|billing)|will\s*(?:be\s*)?(?:automatically|auto)\s*(?:charged|billed|renewed))\b/.test(lower);
}
