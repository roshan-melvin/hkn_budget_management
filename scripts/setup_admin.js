require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setup() {
    console.log('Setting up admin user...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'hkn_budget_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        // 1. Ensure columns exist
        try {
            await pool.query('ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT "user"');
            console.log('✓ Added role column');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('  Role column check:', e.message);
        }

        try {
            await pool.query('ALTER TABLE users ADD COLUMN chapter_organization VARCHAR(255)');
            console.log('✓ Added chapter_organization column');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('  Chapter column check:', e.message);
        }

        // 2. Create/Update Admin User
        const email = 'admin@ieee.org';
        const password = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);
        const chapterOrg = 'Sri Sai Ram Engineering College';

        // Delete old admin user if exists
        await pool.query('DELETE FROM users WHERE email = ?', ['admin']);

        // Check if exists
        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            // Update
            await pool.query(
                'UPDATE users SET password = ?, role = ?, chapter_organization = ? WHERE email = ?',
                [hashedPassword, 'admin', chapterOrg, email]
            );
            console.log('✓ Admin user updated (Email: admin, Password: admin)');
        } else {
            // Insert
            await pool.query(
                'INSERT INTO users (email, password, name, role, chapter_organization, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
                [email, hashedPassword, 'Admin User', 'admin', chapterOrg]
            );
            console.log('✓ Admin user created (Email: admin, Password: admin)');
        }

    } catch (err) {
        console.error('Error setting up admin:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

setup();
