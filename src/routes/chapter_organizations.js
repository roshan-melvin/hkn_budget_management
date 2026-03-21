// src/routes/chapter_organizations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { getCurrentTimestamp } = require('../utils/timezone');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'hb_token';

// Middleware to verify authentication
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies[COOKIE_NAME];
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // JWT payload uses `id` (signed in auth.login)
        req.userId = payload.id || payload.uid;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Get all active chapter organizations (public - for login/signup)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name FROM chapter_organizations WHERE is_active = TRUE ORDER BY name ASC'
        );
        return res.json({ ok: true, organizations: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Get all chapter organizations (admin - includes inactive)
router.get('/admin/all', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, is_active, created_at, updated_at FROM chapter_organizations ORDER BY name ASC'
        );
        return res.json({ ok: true, organizations: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Create new chapter organization (admin)
router.post('/admin', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Organization name is required' });
        }

        // Check if organization already exists
        const [existing] = await pool.query(
            'SELECT id FROM chapter_organizations WHERE name = ?',
            [name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Organization already exists' });
        }

        const now = getCurrentTimestamp();
        const [result] = await pool.query(
            'INSERT INTO chapter_organizations (name, is_active, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), true, now, now, null]
        );

        return res.status(201).json({
            ok: true,
            organization: {
                id: result.insertId,
                name: name.trim(),
                is_active: true,
                created_at: now,
                updated_at: now
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Update chapter organization (admin)
router.put('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active } = req.body;

        // Check if organization exists
        const [existing] = await pool.query(
            'SELECT id FROM chapter_organizations WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (name !== undefined && name.trim().length > 0) {
            // Check if new name conflicts with another organization
            const [nameCheck] = await pool.query(
                'SELECT id FROM chapter_organizations WHERE name = ? AND id != ?',
                [name.trim(), id]
            );

            if (nameCheck.length > 0) {
                return res.status(409).json({ error: 'Organization name already exists' });
            }

            updates.push('name = ?');
            params.push(name.trim());
        }

        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }

        if (updates.length === 0) {
            return res.json({ ok: true });
        }

        updates.push('updated_at = ?');
        params.push(getCurrentTimestamp());
        params.push(id);

        await pool.query(
            `UPDATE chapter_organizations SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Delete chapter organization (admin)
router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if organization exists
        const [existing] = await pool.query(
            'SELECT id, name FROM chapter_organizations WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if any users are using this organization
        const [users] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE chapter_organization = ?',
            [existing[0].name]
        );

        if (users[0].count > 0) {
            return res.status(400).json({
                error: `Cannot delete organization. ${users[0].count} user(s) are associated with it. Consider deactivating instead.`
            });
        }

        await pool.query('DELETE FROM chapter_organizations WHERE id = ?', [id]);

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
