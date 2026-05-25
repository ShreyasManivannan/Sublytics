import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

/**
 * JWT authentication middleware.
 * Extracts the Bearer token, verifies it, fetches the user, attaches to req.user.
 */
export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, avatar_url, gmail_connected, email_notifications, sms_notifications, reminder_days, phone, created_at FROM users WHERE id = ?',
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Token may be invalid.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}
