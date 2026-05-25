import jwt from 'jsonwebtoken';

/**
 * Format a numeric amount as a USD currency string.
 * @param {number|string} amount
 * @returns {string} e.g. "$12.99"
 */
export function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Format a Date object or date string into a human-readable string.
 * @param {Date|string} date
 * @returns {string} e.g. "May 24, 2026"
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate the number of days between today and a given renewal date.
 * Returns a negative number if the renewal date has passed.
 * @param {Date|string} renewalDate
 * @returns {number}
 */
export function daysUntilRenewal(renewalDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);
  const diffMs = renewal.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generate a signed JWT token for a given user.
 * Token contains user id, email, and name; expires in 7 days.
 * @param {{ id: number, email: string, name: string }} user
 * @returns {string} signed JWT
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
