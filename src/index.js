// src/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const chapterRoutes = require('./routes/chapter_organizations');
const rolesRoutes = require('./routes/roles');
const academicYearsRoutes = require('./routes/academic_years');
const budgetsRoutes = require('./routes/budgets');
const categoriesRoutes = require('./routes/categories');
const deadlinesRoutes = require('./routes/deadlines');
const transactionsRoutes = require('./routes/transactions');
const eventReportsRoutes = require('./routes/event-reports');
const db = require('./db');

const app = express();
// CORS: allow the client dev server origins and allow credentials (cookies)
const allowed = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3002', 'http://127.0.0.1:3002'];
app.use(cors({
	origin: true, // allow any origin (including admin UI)
	credentials: true,
}));

app.use(cookieParser());
app.use(express.json()); // parse JSON body

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Middleware to protect Admin UI
const adminAuthMiddleware = (req, res, next) => {
	const token = req.cookies.hb_token;
	if (!token) {
		// Not logged in - redirect to main app login
		return res.redirect('/');
	}
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		const db = require('./db');
		db.query('SELECT role FROM users WHERE id = ?', [decoded.id])
			.then(([rows]) => {
				if (rows.length > 0 && rows[0].role === 'admin') {
					next();
				} else {
					// Logged in but not admin - redirect to main app
					res.redirect('/');
				}
			})
			.catch(err => {
				console.error('Admin auth error', err);
				res.redirect('/');
			});
	} catch (err) {
		res.redirect('/');
	}
};

// Serve Admin Panel explicitly at /admin (Protected)
app.use('/admin', adminAuthMiddleware, express.static(path.join(__dirname, '..', 'public', 'admin')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoint for Docker
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chapter-organizations', chapterRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/academic-years', academicYearsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/deadlines', deadlinesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/event-reports', eventReportsRoutes);

// basic healthcheck
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Serve React App (Production)
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '..', 'public', 'client', 'dist')));

	// SPA Fallback - send index.html for any other requests
	app.get(/(.*)/, (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'client', 'dist', 'index.html'));
	});
}

const PORT = process.env.PORT || 4000;

(async function start() {
	try {
		await db.testConnection();
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error('Fatal: cannot connect to database. Please check your .env credentials and ensure MySQL is running.');
		console.error(err && err.message ? err.message : err);
		process.exit(1);
	}
})();
