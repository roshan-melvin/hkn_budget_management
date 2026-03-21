
const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp, formatTimestamp } = require('../utils/timezone');

// List Categories (no authentication required for admin)
router.get('/', async (req, res) => {
    try {
        // Get all categories
        const [rows] = await pool.query(
            `SELECT * FROM categories ORDER BY created_at DESC`
        );

        // Format timestamps
        const categories = rows.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            user_id: cat.user_id,
            created_at: formatTimestamp(cat.created_at, 'UTC')
        }));

        res.json({ ok: true, categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Category (no authentication required for admin)
router.post('/', async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) return res.status(400).json({ error: 'Name and type required' });
        if (!['income', 'expense'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

        const [result] = await pool.query('INSERT INTO categories (name, type, user_id, created_at) VALUES (?, ?, ?, ?)', [name, type, null, getCurrentTimestamp()]);
        res.status(201).json({ ok: true, category: { id: result.insertId, name, type, user_id: null } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Category (no authentication required for admin)
router.put('/:id', async (req, res) => {
    try {
        const { name, type, is_global } = req.body;
        const { id } = req.params;

        // Check if category exists
        const [check] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (!check.length) return res.status(404).json({ error: 'Category not found' });

        let query = 'UPDATE categories SET name = ?, type = ?';
        const params = [name, type];

        if (is_global === true) {
            query += ', user_id = NULL';
        }

        query += ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Category (no authentication required for admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [check] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (!check.length) return res.status(404).json({ error: 'Category not found' });

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
