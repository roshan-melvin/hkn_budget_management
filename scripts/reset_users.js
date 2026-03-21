require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetUsers() {
    console.log('Resetting users table...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'hkn_budget_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        // 1. Delete all users
        await pool.query('DELETE FROM users');
        console.log('✓ Deleted all existing users');

        // 2. Create Admin User
        const adminEmail = 'admin@ieee.org';
        const adminPassword = 'admin';
        const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await pool.query(
            'INSERT INTO users (email, password, name, role, chapter_organization, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
            [adminEmail, adminHashedPassword, 'Admin User', 'admin', 'Sri Sai Ram Engineering College']
        );
        console.log('✓ Created admin user (admin@ieee.org / admin)');

        // 3. Create Test User
        const userEmail = 'user@ieee.org';
        const userPassword = 'admin';
        const userHashedPassword = await bcrypt.hash(userPassword, 10);
        
        await pool.query(
            'INSERT INTO users (email, password, name, role, chapter_organization, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
            [userEmail, userHashedPassword, 'user', 'user', 'Sri Sai Ram Engineering College']
        );
        console.log('✓ Created test user (user@ieee.org / admin)');

        console.log('\n✅ Users reset complete!');
        console.log('\nAvailable users:');
        console.log('  Admin: admin@ieee.org / admin');
        console.log('  User:  user@ieee.org / admin');

    } catch (err) {
        console.error('Error resetting users:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

resetUsers();
