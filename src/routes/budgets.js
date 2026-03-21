const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp, formatTimestamp } = require('../utils/timezone');

// Helper to update budget totals based on transactions
const updateBudgetTotals = async (budgetId) => {
    try {
        // Calculate sum of expenses (actual vs projected)
        // We only care about 'expense' type for budget usage. 'income' might be added to total_amount?
        // For now, let's assume total_amount is fixed allocation, and transactions are spending against it.
        const [rows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN is_projected = 0 THEN amount ELSE 0 END) as used_amount,
                SUM(CASE WHEN is_projected = 1 THEN amount ELSE 0 END) as planned_amount
            FROM transactions 
            WHERE budget_id = ? AND type = 'expense'
        `, [budgetId]);

        const used = rows[0].used_amount || 0;
        const planned = rows[0].planned_amount || 0;

        await pool.query('UPDATE budgets SET used_amount = ?, planned_amount = ?, updated_at = ? WHERE id = ?',
            [used, planned, getCurrentTimestamp(), budgetId]);
    } catch (err) {
        console.error('Error updating budget totals:', err);
    }
};

// List Budgets (optionally filter by academic_year_id)
router.get('/', requireAuth, async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        let query = 'SELECT b.*, u.timezone FROM budgets b LEFT JOIN users u ON b.user_id = u.id WHERE b.user_id = ?';
        const params = [req.user.id];

        if (academic_year_id) {
            query += ' AND b.academic_year_id = ?';
            params.push(academic_year_id);
        }
        query += ' ORDER BY b.created_at DESC';

        const [rows] = await pool.query(query, params);

        // Format timestamps with user's timezone
        const budgets = rows.map(budget => {
            const userTimezone = budget.timezone || 'UTC';
            const allocatedAmount = parseFloat(budget.total_amount) || 0;
            const usedAmount = parseFloat(budget.used_amount) || 0;
            const plannedAmount = parseFloat(budget.planned_amount) || 0;

            return {
                id: budget.id,
                name: budget.name,
                description: budget.description,
                academic_year_id: budget.academic_year_id,
                user_id: budget.user_id,
                allocated_amount: allocatedAmount,
                used_amount: usedAmount,
                planned_amount: plannedAmount,
                actual_balance: allocatedAmount - usedAmount,
                projected_balance: allocatedAmount - (usedAmount + plannedAmount),
                created_at: formatTimestamp(budget.created_at, userTimezone),
                updated_at: budget.updated_at ? formatTimestamp(budget.updated_at, userTimezone) : null
            };
        });

        res.json({ ok: true, budgets });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Budget
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, academic_year_id, total_amount, description } = req.body;
        if (!name || !academic_year_id) return res.status(400).json({ error: 'Name and academic_year_id required' });

        // Verify academic year ownership
        const [ay] = await pool.query('SELECT id FROM academic_years WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [academic_year_id, req.user.id]);
        if (!ay.length) return res.status(400).json({ error: 'Invalid academic year' });

        const now = getCurrentTimestamp();
        const [result] = await pool.query(
            'INSERT INTO budgets (name, academic_year_id, user_id, total_amount, description, used_amount, planned_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)',
            [
                name,
                academic_year_id,
                req.user.id,
                total_amount || 0,
                description || null,
                now,
                now
            ]
        );

        const allocatedAmount = parseFloat(total_amount) || 0;

        res.status(201).json({
            ok: true,
            budget: {
                id: result.insertId,
                name,
                description,
                academic_year_id,
                allocated_amount: allocatedAmount,
                used_amount: 0,
                planned_amount: 0,
                actual_balance: allocatedAmount,
                projected_balance: allocatedAmount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Budget
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { name, total_amount, description } = req.body;
        const { id } = req.params;

        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        // Build dynamic update query
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (total_amount !== undefined) {
            updates.push('total_amount = ?');
            params.push(total_amount);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (updates.length === 0) {
            return res.json({ ok: true, message: 'No updates provided' });
        }

        // Always update updated_at
        updates.push('updated_at = ?');
        params.push(getCurrentTimestamp());

        params.push(id);

        await pool.query(
            `UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Budget Summary (Actual vs Projected)
router.get('/:id/summary', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership and get budget with user timezone
        const [budgetRows] = await pool.query(
            `SELECT b.*, u.timezone 
             FROM budgets b 
             LEFT JOIN users u ON b.user_id = u.id 
             WHERE b.id = ? AND b.user_id = ?`,
            [id, req.user.id]
        );

        if (!budgetRows.length) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        const budget = budgetRows[0];
        const userTimezone = budget.timezone || 'UTC';

        // Calculate totals dynamically from transactions for accuracy
        const [txRows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN type='expense' AND is_projected=0 THEN amount ELSE 0 END) as used_amount,
                SUM(CASE WHEN type='expense' AND is_projected=1 THEN amount ELSE 0 END) as planned_amount,
                SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as actual_income
            FROM transactions 
            WHERE budget_id = ?
        `, [id]);

        const usedAmount = parseFloat(txRows[0].used_amount) || 0;
        const plannedAmount = parseFloat(txRows[0].planned_amount) || 0;
        const actualIncome = parseFloat(txRows[0].actual_income) || 0;
        const allocatedAmount = parseFloat(budget.total_amount) || 0;

        // Calculate balances
        // Actual Balance = (Allocated + Actual Income) - Actual Expenses
        const actualBalance = (allocatedAmount + actualIncome) - usedAmount;
        // Projected Balance = Actual Balance - Projected Expenses
        const projectedBalance = actualBalance - plannedAmount;

        res.json({
            ok: true,
            summary: {
                budget_id: budget.id,
                budget_name: budget.name,
                description: budget.description,
                academic_year_id: budget.academic_year_id,

                // Core amounts
                allocated_amount: allocatedAmount,
                actual_income: actualIncome,
                used_amount: usedAmount,
                planned_amount: plannedAmount,

                // Calculated balances
                actual_balance: actualBalance,
                projected_balance: projectedBalance,

                // Timestamps
                created_at: formatTimestamp(budget.created_at, userTimezone),
                updated_at: budget.updated_at ? formatTimestamp(budget.updated_at, userTimezone) : null
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Budget
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        // Manually delete transactions first to ensure deletion works even if ON DELETE CASCADE is missing
        await pool.query('DELETE FROM transactions WHERE budget_id = ?', [id]);

        await pool.query('DELETE FROM budgets WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Transaction Routes ---

// List Transactions for a Budget
router.get('/:id/transactions', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify budget ownership
        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        const [rows] = await pool.query('SELECT * FROM transactions WHERE budget_id = ? ORDER BY date DESC', [id]);
        res.json({ ok: true, transactions: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add Transaction
router.post('/:id/transactions', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, is_projected, type } = req.body; // type: 'expense' or 'income'

        // Verify budget ownership
        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        const now = getCurrentTimestamp();
        await pool.query(
            'INSERT INTO transactions (budget_id, amount, description, is_projected, type, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, amount, description, is_projected ? 1 : 0, type || 'expense', now, now]
        );

        // Update budget totals
        await updateBudgetTotals(id);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Transaction
router.put('/:id/transactions/:transactionId', requireAuth, async (req, res) => {
    try {
        const { id, transactionId } = req.params;
        const { amount, description, is_projected, type } = req.body;

        // Verify budget ownership
        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        // Verify transaction belongs to budget
        const [txCheck] = await pool.query('SELECT id FROM transactions WHERE id = ? AND budget_id = ?', [transactionId, id]);
        if (!txCheck.length) return res.status(404).json({ error: 'Transaction not found' });

        const updates = [];
        const params = [];
        if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (is_projected !== undefined) { updates.push('is_projected = ?'); params.push(is_projected ? 1 : 0); }
        if (type !== undefined) { updates.push('type = ?'); params.push(type); }

        if (updates.length > 0) {
            params.push(transactionId);
            await pool.query(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`, params);

            // Update budget totals
            await updateBudgetTotals(id);
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Transaction
router.delete('/:id/transactions/:transactionId', requireAuth, async (req, res) => {
    try {
        const { id, transactionId } = req.params;

        // Verify budget ownership
        const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!check.length) return res.status(404).json({ error: 'Budget not found' });

        // Verify transaction belongs to budget
        const [txCheck] = await pool.query('SELECT id FROM transactions WHERE id = ? AND budget_id = ?', [transactionId, id]);
        if (!txCheck.length) return res.status(404).json({ error: 'Transaction not found' });

        await pool.query('DELETE FROM transactions WHERE id = ?', [transactionId]);

        // Update budget totals
        await updateBudgetTotals(id);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List all transactions for the user (for Dashboard)
router.get('/all-transactions', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, b.name as budget_name 
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.id
            WHERE b.user_id = ?
            ORDER BY t.date DESC
            LIMIT 10
        `, [req.user.id]);
        res.json({ ok: true, transactions: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
