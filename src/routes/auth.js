// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, chapterName, role, timezone, currency } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // check if user exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(409).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    // Store name and chapter_organization; set created_at as current unix timestamp
    // Apply sensible defaults for timezone and currency when not provided
    const tz = timezone || 'UTC';
    const cur = currency || 'USD';
    const [result] = await pool.query(
      // include role, timezone, currency
      'INSERT INTO users (email, password, name, chapter_organization, role, timezone, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
      [email, hashed, name || null, chapterName || null, role || null, tz, cur]
    );

    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await pool.query('SELECT id, email, password, name, chapter_organization, role, created_at, timezone, currency FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    // Update last_login timestamp
    try {
      await pool.query('UPDATE users SET last_login = UNIX_TIMESTAMP() WHERE id = ?', [user.id]);
    } catch (e) {
      console.warn('Could not update last_login', e && e.message);
    }

    // Sign a JWT and set as httpOnly cookie
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    try {
      res.cookie('hb_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } catch (e) {
      console.warn('Could not set cookie', e && e.message);
    }

    // include token in response for clients that prefer Authorization header
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, chapterName: user.chapter_organization, role: user.role, createdAt: user.created_at, timezone: user.timezone, currency: user.currency } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Me - return current user from cookie
router.get('/me', async (req, res) => {
  try {
    // Accept token from cookie or Authorization header
    let token = req.cookies && req.cookies.hb_token;
    if (!token && req.headers && req.headers.authorization) {
      const m = String(req.headers.authorization).match(/^Bearer (.+)$/i);
      if (m) token = m[1];
    }
    if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }
    const [rows] = await pool.query('SELECT id, email, name, chapter_organization, created_at, timezone, role, currency FROM users WHERE id = ?', [payload.id]);
    if (!rows.length) return res.status(401).json({ ok: false, error: 'Not found' });
    const u = rows[0];
    return res.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, chapterName: u.chapter_organization, createdAt: u.created_at, timezone: u.timezone, role: u.role, currency: u.currency } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Update current user's profile (name, role, timezone, chapter_organization)
router.put('/me', async (req, res) => {
  try {
    // Accept token from cookie or Authorization header
    let token = req.cookies && req.cookies.hb_token;
    if (!token && req.headers && req.headers.authorization) {
      const m = String(req.headers.authorization).match(/^Bearer (.+)$/i);
      if (m) token = m[1];
    }
    if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }

    const userId = payload.id;
    const { name, role, timezone, chapterName, currency } = req.body;

    // Build update query dynamically
    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name || null); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role || null); }
    if (timezone !== undefined) { updates.push('timezone = ?'); params.push(timezone || null); }
    if (currency !== undefined) { updates.push('currency = ?'); params.push(currency || null); }
    if (chapterName !== undefined) { updates.push('chapter_organization = ?'); params.push(chapterName || null); }

    if (updates.length > 0) {
      updates.push('updated_at = ?'); params.push(Math.floor(Date.now() / 1000));
      params.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Return updated user
    const [rows] = await pool.query('SELECT id, email, name, chapter_organization, created_at, timezone, role, currency FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'User not found' });
    const u = rows[0];
    return res.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, chapterName: u.chapter_organization, createdAt: u.created_at, timezone: u.timezone, role: u.role, currency: u.currency } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('hb_token');
  return res.json({ ok: true });
});

module.exports = router;
