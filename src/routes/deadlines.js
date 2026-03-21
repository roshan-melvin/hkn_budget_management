// src/routes/deadlines.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp, formatTimestamp } = require('../utils/timezone');

// Helper function to determine deadline status
function getDeadlineStatus(startDate, endDate) {
    const now = getCurrentTimestamp();
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'expired';
}

// ============================================
// ADMIN ENDPOINTS (Official Deadlines)
// ============================================

// List all official deadlines (admin)
router.get('/admin/official', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, c.name as category_name, c.type as category_type
            FROM deadlines d
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE d.is_official = TRUE
            ORDER BY d.start_date ASC
        `);

        const deadlines = rows.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            start_date: d.start_date,
            end_date: d.end_date,
            category_id: d.category_id,
            category_name: d.category_name,
            category_type: d.category_type,
            status: getDeadlineStatus(d.start_date, d.end_date),
            created_at: formatTimestamp(d.created_at, 'UTC'),
            updated_at: d.updated_at ? formatTimestamp(d.updated_at, 'UTC') : null
        }));

        res.json({ ok: true, deadlines });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create official deadline (admin)
router.post('/admin/official', async (req, res) => {
    try {
        const { name, description, start_date, end_date, category_id } = req.body;

        if (!name || !start_date || !end_date) {
            return res.status(400).json({ error: 'Name, start_date, and end_date are required' });
        }

        if (start_date >= end_date) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        const now = getCurrentTimestamp();
        const status = getDeadlineStatus(start_date, end_date);

        const [result] = await pool.query(`
            INSERT INTO deadlines 
            (name, description, start_date, end_date, category_id, user_id, is_official, status, created_at, created_by)
            VALUES (?, ?, ?, ?, ?, NULL, TRUE, ?, ?, NULL)
        `, [name, description || null, start_date, end_date, category_id || null, status, now]);

        res.status(201).json({
            ok: true,
            deadline: {
                id: result.insertId,
                name,
                description,
                start_date,
                end_date,
                category_id,
                is_official: true,
                status
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update official deadline (admin)
router.put('/admin/official/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, start_date, end_date, category_id } = req.body;

        // Check if deadline exists and is official
        const [check] = await pool.query('SELECT id FROM deadlines WHERE id = ? AND is_official = TRUE', [id]);
        if (!check.length) {
            return res.status(404).json({ error: 'Official deadline not found' });
        }

        if (start_date && end_date && start_date >= end_date) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description || null); }
        if (start_date !== undefined) { updates.push('start_date = ?'); params.push(start_date); }
        if (end_date !== undefined) { updates.push('end_date = ?'); params.push(end_date); }
        if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id || null); }

        if (updates.length > 0) {
            // Update status based on new dates
            const [current] = await pool.query('SELECT start_date, end_date FROM deadlines WHERE id = ?', [id]);
            const newStartDate = start_date !== undefined ? start_date : current[0].start_date;
            const newEndDate = end_date !== undefined ? end_date : current[0].end_date;
            const newStatus = getDeadlineStatus(newStartDate, newEndDate);

            updates.push('status = ?');
            params.push(newStatus);
            updates.push('updated_at = ?');
            params.push(getCurrentTimestamp());
            params.push(id);

            await pool.query(`UPDATE deadlines SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete official deadline (admin)
router.delete('/admin/official/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await pool.query('SELECT id FROM deadlines WHERE id = ? AND is_official = TRUE', [id]);
        if (!check.length) {
            return res.status(404).json({ error: 'Official deadline not found' });
        }

        await pool.query('DELETE FROM deadlines WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// APPLICATION ENDPOINTS
// ============================================

// Apply for a deadline (User)
router.post('/apply', requireAuth, async (req, res) => {
    try {
        const { deadline_id, notes, status } = req.body;

        if (!deadline_id) {
            return res.status(400).json({ error: 'Deadline ID is required' });
        }

        // Validate status
        const applicationStatus = status || 'pending_review'; // Default to pending_review if not specified
        const validStatuses = ['draft', 'pending_review'];
        if (!validStatuses.includes(applicationStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if deadline exists and is active
        const [deadline] = await pool.query('SELECT * FROM deadlines WHERE id = ?', [deadline_id]);
        if (!deadline.length) {
            return res.status(404).json({ error: 'Deadline not found' });
        }

        const now = getCurrentTimestamp();
        if (now < deadline[0].start_date || now > deadline[0].end_date) {
            return res.status(400).json({ error: 'Application period is not active' });
        }

        // Check for duplicate application (only for non-draft submissions)
        if (applicationStatus !== 'draft') {
            const [existing] = await pool.query(
                'SELECT id FROM deadline_applications WHERE user_id = ? AND deadline_id = ? AND status != ?',
                [req.user.id, deadline_id, 'draft']
            );
            if (existing.length) {
                return res.status(400).json({ error: 'You have already applied for this event' });
            }
        }

        // Insert application
        const [result] = await pool.query(`
            INSERT INTO deadline_applications 
            (deadline_id, user_id, status, applied_at, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [deadline_id, req.user.id, applicationStatus, now, notes || null]);

        res.status(201).json({
            ok: true,
            message: applicationStatus === 'draft' ? 'Draft saved successfully' : 'Application submitted successfully',
            application_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List all applications (Admin)
router.get('/admin/applications', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                da.id,
                da.status,
                da.current_stage_id,
                da.approved_amount,
                da.applied_at,
                da.notes,
                u.name as user_name,
                u.email as user_email,
                d.name as event_name,
                d.end_date as event_end_date
            FROM deadline_applications da
            JOIN users u ON da.user_id = u.id
            JOIN deadlines d ON da.deadline_id = d.id
            ORDER BY da.applied_at DESC
        `);

        const applications = rows.map(app => ({
            id: app.id,
            status: app.status,
            current_stage_id: app.current_stage_id || 1,
            approved_amount: app.approved_amount || 0,
            applied_at: formatTimestamp(app.applied_at, 'UTC'),
            notes: app.notes,
            user_name: app.user_name,
            user_email: app.user_email,
            event_name: app.event_name,
            event_end_date: app.event_end_date
        }));

        res.json({ ok: true, applications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update application status (Admin)
router.put('/admin/applications/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, current_stage_id, approved_amount } = req.body;
        console.log('PUT /admin/applications/%s/status body:', id, req.body);

        const validStatuses = ['draft', 'pending_review', 'approved', 'payment_processing', 'completed', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updates = ['status = ?'];
        const params = [status];

        if (current_stage_id !== undefined) {
            updates.push('current_stage_id = ?');
            params.push(current_stage_id);
        }

        if (approved_amount !== undefined) {
            updates.push('approved_amount = ?');
            params.push(approved_amount);
        }
        params.push(id);

        await pool.query(`UPDATE deadline_applications SET ${updates.join(', ')} WHERE id = ?`, params);

        // If approved_amount was updated, also update the linked transaction if it exists
        if (approved_amount !== undefined) {
            const [apps] = await pool.query('SELECT transaction_id FROM deadline_applications WHERE id = ?', [id]);
            if (apps.length && apps[0].transaction_id) {
                await pool.query('UPDATE transactions SET amount = ? WHERE id = ?', [approved_amount, apps[0].transaction_id]);
                console.log(`Updated linked transaction ${apps[0].transaction_id} amount to ${approved_amount}`);
            }
        }

        // If admin moved the application to Stage 4 (Distributed), create transaction
        if (Number(current_stage_id) === 4) {
            try {
                console.log(`Admin set current_stage_id=${current_stage_id} for application ${id}`);

                // Fetch application
                const [apps] = await pool.query('SELECT * FROM deadline_applications WHERE id = ?', [id]);
                if (apps.length) {
                    const app = apps[0];
                    const amount = parseFloat(app.approved_amount) || 0;

                    // Only create transaction if amount > 0 and not already linked
                    if (amount > 0 && !app.transaction_id) {
                        const now = getCurrentTimestamp();

                        // Find a budget for the user
                        let budgetId = null;
                        const [brows] = await pool.query('SELECT id FROM budgets WHERE user_id = ? LIMIT 1', [app.user_id]);
                        if (brows.length) budgetId = brows[0].id;
                        else {
                            const [anyBudget] = await pool.query('SELECT id FROM budgets LIMIT 1');
                            if (anyBudget.length) budgetId = anyBudget[0].id;
                        }

                        if (budgetId) {
                            // Create Income Transaction
                            const [txRes] = await pool.query(`
                                INSERT INTO transactions
                                (budget_id, category_id, amount, description, date, type, is_projected, created_at)
                                VALUES (?, NULL, ?, ?, ?, 'income', 0, ?)
                            `, [
                                budgetId,
                                amount,
                                'Grant Funds Received',
                                now,
                                now
                            ]);

                            if (txRes && txRes.insertId) {
                                // Link transaction to application
                                await pool.query('UPDATE deadline_applications SET transaction_id = ? WHERE id = ?', [txRes.insertId, id]);
                                console.log(`Auto-created transaction ${txRes.insertId} for application ${id}`);
                            }
                        } else {
                            console.warn('No budget found to attach auto-created transactions for application', id);
                        }
                    }
                }
            } catch (errInner) {
                console.error('Error auto-creating transactions for stage 4:', errInner);
            }
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List user's applications (User - for Tracking)
router.get('/user/applications', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                da.id,
                da.deadline_id,
                da.status,
                da.current_stage_id,
                da.approved_amount,
                da.applied_at,
                da.notes,
                d.name as event_name,
                d.end_date as event_end_date,
                c.name as category_name
            FROM deadline_applications da
            JOIN deadlines d ON da.deadline_id = d.id
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE da.user_id = ?
            ORDER BY da.applied_at DESC
        `, [req.user.id]);

        const applications = rows.map(app => ({
            id: app.id,
            deadline_id: app.deadline_id,
            status: app.status,
            current_stage_id: app.current_stage_id || 1,
            approved_amount: app.approved_amount || 0,
            applied_at: formatTimestamp(app.applied_at, 'UTC'),
            notes: app.notes,
            event_name: app.event_name,
            category_name: app.category_name,
            event_end_date: app.event_end_date
        }));

        res.json({ ok: true, applications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// COMBINED VIEW (Official + User Deadlines)
// ============================================

// Get all deadlines (official + user's personal)
router.get('/all', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, c.name as category_name, c.type as category_type
            FROM deadlines d
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE d.is_official = TRUE OR d.user_id = ?
            ORDER BY d.is_official DESC, d.start_date ASC
        `, [req.user.id]);

        const deadlines = rows.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            start_date: d.start_date,
            end_date: d.end_date,
            category_id: d.category_id,
            category_name: d.category_name,
            category_type: d.category_type,
            is_official: d.is_official,
            status: getDeadlineStatus(d.start_date, d.end_date),
            created_at: formatTimestamp(d.created_at, 'UTC'),
            updated_at: d.updated_at ? formatTimestamp(d.updated_at, 'UTC') : null
        }));

        res.json({ ok: true, deadlines });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
