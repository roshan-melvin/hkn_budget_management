const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp } = require('../utils/timezone');

// ============================================
// TRANSACTION ENDPOINTS
// ============================================

// Create a new transaction
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            application_id,
            budget_id,
            type,
            category,
            description,
            amount,
            transaction_date,
            is_recurring
        } = req.body;

        // Validation
        if (!type || !amount || !budget_id) {
            return res.status(400).json({ error: 'Type, amount, and budget_id are required' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }

        // Verify budget ownership
        const [budgets] = await pool.query('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [budget_id, req.user.id]);
        if (!budgets.length && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied to this budget' });
        }

        const now = getCurrentTimestamp();
        const date = transaction_date || now;

        const [result] = await pool.query(`
            INSERT INTO transactions 
            (application_id, budget_id, type, category, description, 
             amount, date, is_recurring, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            application_id || null,
            budget_id,
            type,
            category || null,
            description || null,
            amount,
            date,
            is_recurring || false,
            now
        ]);

        res.status(201).json({
            ok: true,
            message: 'Transaction created successfully',
            transaction_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get transactions with filters
router.get('/', requireAuth, async (req, res) => {
    try {
        const { application_id, budget_id, type, limit, offset } = req.query;

        let query = `
            SELECT 
                t.id,
                t.application_id,
                t.budget_id,
                t.type,
                t.category,
                t.description,
                t.amount,
                t.date as transaction_date,
                t.is_recurring,
                t.created_at,
                u.name as created_by_name
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Apply filters
        if (application_id) {
            query += ' AND t.application_id = ?';
            params.push(application_id);
        }

        if (budget_id) {
            query += ' AND t.budget_id = ?';
            params.push(budget_id);
        }

        if (type) {
            query += ' AND t.type = ?';
            params.push(type);
        }

        // For non-admin users, only show their own transactions (via budget ownership)
        if (req.user.role !== 'admin') {
            query += ' AND b.user_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY t.date DESC, t.created_at DESC';

        // Pagination
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        if (offset) {
            query += ' OFFSET ?';
            params.push(parseInt(offset));
        }

        const [rows] = await pool.query(query, params);

        res.json({
            ok: true,
            transactions: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get transaction summary
router.get('/summary', requireAuth, async (req, res) => {
    try {
        const { application_id, budget_id } = req.query;

        let query = `
            SELECT 
                t.type,
                SUM(t.amount) as total,
                COUNT(*) as count
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.id
            WHERE 1=1
        `;
        const params = [];

        if (application_id) {
            query += ' AND t.application_id = ?';
            params.push(application_id);
        }

        if (budget_id) {
            query += ' AND t.budget_id = ?';
            params.push(budget_id);
        }

        // For non-admin users, only show their own transactions
        if (req.user.role !== 'admin') {
            query += ' AND b.user_id = ?';
            params.push(req.user.id);
        }

        query += ' GROUP BY t.type';

        const [rows] = await pool.query(query, params);

        const summary = {
            income: { total: 0, count: 0 },
            expense: { total: 0, count: 0 },
            balance: 0
        };

        rows.forEach(row => {
            summary[row.type] = {
                total: parseFloat(row.total),
                count: row.count
            };
        });

        summary.balance = summary.income.total - summary.expense.total;

        res.json({
            ok: true,
            summary
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a transaction
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            category,
            description,
            amount,
            transaction_date,
            is_recurring
        } = req.body;

        // Check if transaction exists and user has permission (via budget)
        const [existing] = await pool.query(`
            SELECT t.*, b.user_id 
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.id
            WHERE t.id = ?
        `, [id]);

        if (!existing.length) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Only owner or admin can update
        if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const date = transaction_date !== undefined ? transaction_date : existing[0].date;

        await pool.query(`
            UPDATE transactions
            SET type = ?, category = ?, description = ?, amount = ?,
                date = ?, is_recurring = ?
            WHERE id = ?
        `, [
            type || existing[0].type,
            category !== undefined ? category : existing[0].category,
            description !== undefined ? description : existing[0].description,
            amount !== undefined ? amount : existing[0].amount,
            date,
            is_recurring !== undefined ? is_recurring : existing[0].is_recurring,
            id
        ]);

        res.json({
            ok: true,
            message: 'Transaction updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a transaction
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if transaction exists and user has permission
        const [existing] = await pool.query(`
            SELECT t.*, b.user_id 
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.id
            WHERE t.id = ?
        `, [id]);

        if (!existing.length) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Only owner or admin can delete
        if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        await pool.query('DELETE FROM transactions WHERE id = ?', [id]);

        res.json({
            ok: true,
            message: 'Transaction deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
