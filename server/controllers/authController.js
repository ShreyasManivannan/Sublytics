import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { generateToken } from '../utils/helpers.js';

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Register a new user with email + password.
 */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );

    // Fetch the newly created user
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, gmail_connected, email_notifications, sms_notifications, reminder_days, phone, created_at FROM users WHERE id = ?',
      [insertResult.insertId],
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email + password.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, avatar_url, gmail_connected,
              email_notifications, sms_notifications, reminder_days, phone, created_at
       FROM users WHERE email = ?`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Google-only accounts won't have a password hash
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please log in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Don't send password hash to client
    delete user.password_hash;

    res.json({ message: 'Login successful.', token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

/**
 * POST /api/auth/google
 * Handle Google OAuth — find or create the user.
 * Expects { googleId, email, name, avatarUrl } in the request body.
 */
export async function googleAuth(req, res) {
  try {
    const { googleId, email, name, avatarUrl } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required.' });
    }

    // Check if user already exists (by google_id or email)
    const existing = await pool.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email],
    );

    let user;

    if (existing.rows.length > 0) {
      // Existing user — update Google fields
      user = existing.rows[0];
      await pool.query(
        'UPDATE users SET google_id = ?, avatar_url = COALESCE(?, avatar_url), name = COALESCE(?, name) WHERE id = ?',
        [googleId, avatarUrl, name, user.id],
      );

      // Re-fetch updated user
      const updated = await pool.query(
        'SELECT id, name, email, avatar_url, gmail_connected, email_notifications, sms_notifications, reminder_days, phone, created_at FROM users WHERE id = ?',
        [user.id],
      );
      user = updated.rows[0];
    } else {
      // New user via Google
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, google_id, avatar_url) VALUES (?, ?, ?, ?)',
        [name, email, googleId, avatarUrl],
      );

      const result = await pool.query(
        'SELECT id, name, email, avatar_url, gmail_connected, email_notifications, sms_notifications, reminder_days, phone, created_at FROM users WHERE id = ?',
        [insertResult.insertId],
      );
      user = result.rows[0];
    }

    const token = generateToken(user);

    res.json({ message: 'Google authentication successful.', token, user });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
}

/**
 * GET /api/auth/profile
 * Return the current authenticated user's profile.
 */
export async function getProfile(req, res) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}
