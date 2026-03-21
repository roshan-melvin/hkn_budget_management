const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp, formatTimestamp } = require('../utils/timezone');

// List all academic years (no authentication required for admin)
router.get('/', async (req, res) => {
    try {
        // Get all academic years
        const [rows] = await pool.query(
            `SELECT * FROM academic_years ORDER BY start_date DESC`
        );

        // Format timestamps
        const academic_years = rows.map(ay => ({
            id: ay.id,
            name: ay.name,
            start_date: ay.start_date,
            end_date: ay.end_date,
            user_id: ay.user_id,
            created_at: formatTimestamp(ay.created_at, 'UTC')
        }));

        return res.json({ ok: true, academic_years });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Create Academic Year (no authentication required for admin)
router.post('/', async (req, res) => {
    try {
        const { name, start_date, end_date } = req.body;
        if (!name || !start_date || !end_date) return res.status(400).json({ error: 'Name, start_date, and end_date required' });

        const [result] = await pool.query(
            'INSERT INTO academic_years (name, start_date, end_date, user_id, created_at) VALUES (?, ?, ?, ?, ?)',
            [name, start_date, end_date, null, getCurrentTimestamp()]
        );
        res.status(201).json({ ok: true, academic_year: { id: result.insertId, name, start_date, end_date } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Academic Year (no authentication required for admin)
router.put('/:id', async (req, res) => {
    try {
        const { name, start_date, end_date, is_global } = req.body;
        const { id } = req.params;

        const [check] = await pool.query('SELECT id FROM academic_years WHERE id = ?', [id]);
        if (!check.length) return res.status(404).json({ error: 'Academic year not found' });

        let query = 'UPDATE academic_years SET name = ?, start_date = ?, end_date = ?';
        const params = [name, start_date, end_date];

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

// Delete Academic Year (no authentication required for admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await pool.query('SELECT id FROM academic_years WHERE id = ?', [id]);
        if (!check.length) return res.status(404).json({ error: 'Academic year not found' });

        await pool.query('DELETE FROM academic_years WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
