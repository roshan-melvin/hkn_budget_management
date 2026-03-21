// src/routes/roles.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getCurrentTimestamp } = require('../utils/timezone');

// Public: get active roles (for signup dropdown)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM roles WHERE is_active = TRUE ORDER BY name ASC'
    );
    return res.json({ ok: true, roles: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get all roles
router.get('/admin/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, is_active, created_at, updated_at FROM roles ORDER BY name ASC'
    );
    return res.json({ ok: true, roles: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: create role
router.post('/admin', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const [existing] = await pool.query('SELECT id FROM roles WHERE name = ?', [name.trim()]);
    if (existing.length > 0) return res.status(409).json({ error: 'Role already exists' });

    const now = getCurrentTimestamp();
    const [result] = await pool.query(
      'INSERT INTO roles (name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [name.trim(), true, now, now]
    );

    return res.status(201).json({ ok: true, role: { id: result.insertId, name: name.trim(), is_active: true, created_at: now, updated_at: now } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update role
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM roles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Role not found' });

    const updates = [];
    const params = [];
    if (name !== undefined && name.trim().length > 0) {
      const [nameCheck] = await pool.query('SELECT id FROM roles WHERE name = ? AND id != ?', [name.trim(), id]);
      if (nameCheck.length > 0) return res.status(409).json({ error: 'Role name already exists' });
      updates.push('name = ?'); params.push(name.trim());
    }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length === 0) return res.json({ ok: true });

    updates.push('updated_at = ?'); params.push(getCurrentTimestamp());
    params.push(id);

    await pool.query(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: delete role
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id, name FROM roles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Role not found' });

    // Prevent deleting if users exist with this role
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', [existing[0].name]);
    if (users[0].count > 0) return res.status(400).json({ error: `Cannot delete role. ${users[0].count} user(s) are associated with it.` });

    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
