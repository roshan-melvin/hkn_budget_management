const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/authMiddleware');
const { getCurrentTimestamp, formatTimestamp } = require('../utils/timezone');
const upload = require('../middleware/upload');
const { deleteFile, getFileSize } = require('../utils/fileHelpers');
const path = require('path');
const fs = require('fs');

// ============================================
// EVENT REPORT ENDPOINTS
// ============================================

// Create or update event report
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            application_id,
            total_funds_received,
            total_funds_utilized,
            utilization_breakdown,
            event_date,
            participant_count,
            guest_speakers,
            resource_persons,
            audience_details,
            survey_link,
            survey_responses_summary
        } = req.body;

        if (!application_id) {
            return res.status(400).json({ error: 'Application ID is required' });
        }

        // Check if report already exists
        const [existing] = await pool.query(
            'SELECT id FROM event_reports WHERE application_id = ?',
            [application_id]
        );

        const now = getCurrentTimestamp();

        if (existing.length) {
            // Update existing report
            await pool.query(`
                UPDATE event_reports
                SET total_funds_received = ?, total_funds_utilized = ?,
                    utilization_breakdown = ?, event_date = ?, participant_count = ?,
                    guest_speakers = ?, resource_persons = ?, audience_details = ?,
                    survey_link = ?, survey_responses_summary = ?, updated_at = ?
                WHERE id = ?
            `, [
                total_funds_received,
                total_funds_utilized,
                JSON.stringify(utilization_breakdown),
                event_date,
                participant_count,
                JSON.stringify(guest_speakers),
                JSON.stringify(resource_persons),
                JSON.stringify(audience_details),
                survey_link,
                survey_responses_summary,
                now,
                existing[0].id
            ]);

            res.json({
                ok: true,
                message: 'Report updated successfully',
                report_id: existing[0].id
            });
        } else {
            // Create new report
            const [result] = await pool.query(`
                INSERT INTO event_reports
                (application_id, user_id, total_funds_received, total_funds_utilized,
                 utilization_breakdown, event_date, participant_count, guest_speakers,
                 resource_persons, audience_details, survey_link, survey_responses_summary,
                 status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
            `, [
                application_id,
                req.user.id,
                total_funds_received,
                total_funds_utilized,
                JSON.stringify(utilization_breakdown),
                event_date,
                participant_count,
                JSON.stringify(guest_speakers),
                JSON.stringify(resource_persons),
                JSON.stringify(audience_details),
                survey_link,
                survey_responses_summary,
                now,
                now
            ]);

            res.status(201).json({
                ok: true,
                message: 'Report created successfully',
                report_id: result.insertId
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get event report by ID
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [reports] = await pool.query(`
            SELECT 
                er.*,
                u.name as user_name,
                u.email as user_email,
                approver.name as approved_by_name
            FROM event_reports er
            LEFT JOIN users u ON er.user_id = u.id
            LEFT JOIN users approver ON er.approved_by = approver.id
            WHERE er.id = ?
        `, [id]);

        if (!reports.length) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = reports[0];

        // Parse JSON fields
        if (report.utilization_breakdown) {
            report.utilization_breakdown = JSON.parse(report.utilization_breakdown);
        }
        if (report.guest_speakers) {
            report.guest_speakers = JSON.parse(report.guest_speakers);
        }
        if (report.resource_persons) {
            report.resource_persons = JSON.parse(report.resource_persons);
        }
        if (report.audience_details) {
            report.audience_details = JSON.parse(report.audience_details);
        }

        // Format timestamps
        report.created_at = formatTimestamp(report.created_at, 'UTC');
        report.updated_at = formatTimestamp(report.updated_at, 'UTC');
        if (report.submitted_at) {
            report.submitted_at = formatTimestamp(report.submitted_at, 'UTC');
        }
        if (report.approved_at) {
            report.approved_at = formatTimestamp(report.approved_at, 'UTC');
        }

        // Get associated files
        const [files] = await pool.query(`
            SELECT id, file_type, original_filename, stored_filename, file_size, mime_type, uploaded_at
            FROM report_files
            WHERE report_id = ?
            ORDER BY uploaded_at DESC
        `, [id]);

        res.json({
            ok: true,
            report,
            files
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get reports by application ID
router.get('/application/:applicationId', requireAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Fetch application details first
        const [apps] = await pool.query('SELECT approved_amount FROM deadline_applications WHERE id = ?', [applicationId]);
        const approvedAmount = apps.length ? apps[0].approved_amount : 0;

        const [reports] = await pool.query(`
            SELECT 
                er.*,
                u.name as user_name
            FROM event_reports er
            LEFT JOIN users u ON er.user_id = u.id
            WHERE er.application_id = ?
        `, [applicationId]);

        if (!reports.length) {
            return res.json({
                ok: true,
                report: null,
                application: {
                    approved_amount: approvedAmount
                }
            });
        }

        const report = reports[0];

        // Parse JSON fields
        if (report.utilization_breakdown) {
            report.utilization_breakdown = JSON.parse(report.utilization_breakdown);
        }
        if (report.guest_speakers) {
            report.guest_speakers = JSON.parse(report.guest_speakers);
        }
        if (report.resource_persons) {
            report.resource_persons = JSON.parse(report.resource_persons);
        }
        if (report.audience_details) {
            report.audience_details = JSON.parse(report.audience_details);
        }

        res.json({
            ok: true,
            report,
            application: {
                approved_amount: approvedAmount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit report for review
router.post('/:id/submit', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [reports] = await pool.query(
            'SELECT * FROM event_reports WHERE id = ?',
            [id]
        );

        if (!reports.length) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if user owns the report
        if (reports[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const now = getCurrentTimestamp();

        await pool.query(`
            UPDATE event_reports
            SET status = 'submitted', submitted_at = ?
            WHERE id = ?
        `, [now, id]);

        res.json({
            ok: true,
            message: 'Report submitted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update report status (approve/reject)
router.put('/:id/status', requireAuth, async (req, res) => {
    try {
        // Only admins can approve/reject
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { status, admin_comments } = req.body;

        const validStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const now = getCurrentTimestamp();
        const updates = ['status = ?', 'updated_at = ?'];
        const params = [status, now];

        if (admin_comments) {
            updates.push('admin_comments = ?');
            params.push(admin_comments);
        }

        if (status === 'approved') {
            updates.push('approved_at = ?', 'approved_by = ?');
            params.push(now, req.user.id);
        }

        params.push(id);

        await pool.query(`
            UPDATE event_reports
            SET ${updates.join(', ')}
            WHERE id = ?
        `, params);

        res.json({
            ok: true,
            message: `Report ${status} successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload file for report
router.post('/:id/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { file_type } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Verify report exists
        const [reports] = await pool.query(
            'SELECT * FROM event_reports WHERE id = ?',
            [id]
        );

        if (!reports.length) {
            // Delete uploaded file if report doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Report not found' });
        }

        const now = getCurrentTimestamp();
        const fileSize = getFileSize(req.file.path);

        const [result] = await pool.query(`
            INSERT INTO report_files
            (report_id, file_type, original_filename, stored_filename, file_path,
             file_size, mime_type, uploaded_at, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            file_type || 'other',
            req.file.originalname,
            req.file.filename,
            req.file.path,
            fileSize,
            req.file.mimetype,
            now,
            req.user.id
        ]);

        res.status(201).json({
            ok: true,
            message: 'File uploaded successfully',
            file: {
                id: result.insertId,
                filename: req.file.originalname,
                size: fileSize,
                type: file_type
            }
        });
    } catch (err) {
        console.error(err);
        // Clean up uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// Download file
router.get('/files/:fileId/download', requireAuth, async (req, res) => {
    try {
        const { fileId } = req.params;

        const [files] = await pool.query(
            'SELECT * FROM report_files WHERE id = ?',
            [fileId]
        );

        if (!files.length) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Check if file exists on disk
        if (!fs.existsSync(file.file_path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(file.file_path, file.original_filename);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete file
router.delete('/files/:fileId', requireAuth, async (req, res) => {
    try {
        const { fileId } = req.params;

        const [files] = await pool.query(
            'SELECT * FROM report_files WHERE id = ?',
            [fileId]
        );

        if (!files.length) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Delete from filesystem
        if (fs.existsSync(file.file_path)) {
            await deleteFile(file.file_path);
        }

        // Delete from database
        await pool.query('DELETE FROM report_files WHERE id = ?', [fileId]);

        res.json({
            ok: true,
            message: 'File deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List all reports (Admin)
router.get('/', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { status } = req.query;

        let query = `
            SELECT 
                er.*,
                u.name as user_name,
                u.email as user_email,
                da.deadline_id,
                d.name as event_name
            FROM event_reports er
            LEFT JOIN users u ON er.user_id = u.id
            LEFT JOIN deadline_applications da ON er.application_id = da.id
            LEFT JOIN deadlines d ON da.deadline_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND er.status = ?';
            params.push(status);
        }

        query += ' ORDER BY er.submitted_at DESC, er.created_at DESC';

        const [reports] = await pool.query(query, params);

        res.json({
            ok: true,
            reports
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
