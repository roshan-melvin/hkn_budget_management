require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupDemoData() {
    console.log('Setting up demo data...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'hkn_budget_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        // 1. Clear existing data (except keep the schema)
        console.log('Clearing existing data...');
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM roles');
        await pool.query('DELETE FROM categories');
        await pool.query('DELETE FROM deadlines');
        await pool.query('DELETE FROM chapter_organizations');
        console.log('✓ Cleared existing data');

        // 1.2 Create Roles
        const roles = ['admin', 'officer', 'member'];
        for (const role of roles) {
            await pool.query(
                'INSERT INTO roles (name, is_active, created_at, updated_at) VALUES (?, TRUE, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
                [role]
            );
        }
        console.log(`✓ Created ${roles.length} roles`);

        // 1.5 Create Chapter Organizations
        const organizations = [
            'Sri Sai Ram Engineering College',
            'Anna University',
            'IIT Madras',
            'MIT'
        ];

        for (const org of organizations) {
            await pool.query(
                'INSERT INTO chapter_organizations (name, is_active, created_at) VALUES (?, TRUE, UNIX_TIMESTAMP())',
                [org]
            );
        }
        console.log(`✓ Created ${organizations.length} chapter organizations`);

        // 2. Create Admin User
        const adminEmail = 'admin@ieee.org';
        const adminPassword = await bcrypt.hash('admin', 10);
        await pool.query(
            'INSERT INTO users (email, password, name, role, chapter_organization, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
            [adminEmail, adminPassword, 'Admin User', 'admin', 'Sri Sai Ram Engineering College']
        );
        console.log('✓ Created admin user (admin@ieee.org / admin)');

        // 3. Create Regular User
        const userEmail = 'user@ieee.org';
        const userPassword = await bcrypt.hash('admin', 10);
        await pool.query(
            'INSERT INTO users (email, password, name, role, chapter_organization, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
            [userEmail, userPassword, 'Regular User', 'user', 'Sri Sai Ram Engineering College']
        );
        console.log('✓ Created regular user (user@ieee.org / admin)');

        // 4. Create Useful Categories
        const categories = [
            'Conference Grant',
            'Research Funding',
            'Workshop/Seminar',
            'Equipment Purchase',
            'Student Travel',
            'Chapter Activities'
        ];

        for (const category of categories) {
            await pool.query(
                'INSERT INTO categories (name, created_at) VALUES (?, UNIX_TIMESTAMP())',
                [category]
            );
        }
        console.log(`✓ Created ${categories.length} categories`);

        // 5. Create Sample Deadlines
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        // Get category IDs
        const [categoryRows] = await pool.query('SELECT id, name FROM categories');
        const categoryMap = {};
        categoryRows.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });

        const deadlines = [
            {
                name: 'IEEE Conference Grant 2024',
                description: 'Apply for funding to attend IEEE international conferences. Covers registration, travel, and accommodation.',
                start_date: Math.floor(now / 1000),
                end_date: Math.floor((now + twoWeeks) / 1000),
                category_id: categoryMap['Conference Grant']
            },
            {
                name: 'Research Publication Fund',
                description: 'Funding support for publishing research papers in IEEE journals and conferences.',
                start_date: Math.floor(now / 1000),
                end_date: Math.floor((now + oneMonth) / 1000),
                category_id: categoryMap['Research Funding']
            },
            {
                name: 'Technical Workshop Sponsorship',
                description: 'Apply for sponsorship to organize technical workshops and hands-on training sessions.',
                start_date: Math.floor(now / 1000),
                end_date: Math.floor((now + oneWeek) / 1000),
                category_id: categoryMap['Workshop/Seminar']
            },
            {
                name: 'Student Travel Grant',
                description: 'Travel grants for students presenting papers or attending IEEE events.',
                start_date: Math.floor(now / 1000),
                end_date: Math.floor((now + twoWeeks) / 1000),
                category_id: categoryMap['Student Travel']
            }
        ];

        for (const deadline of deadlines) {
            const status = 'active'; // All are currently active
            await pool.query(
                'INSERT INTO deadlines (name, description, start_date, end_date, category_id, is_official, status, created_at) VALUES (?, ?, ?, ?, ?, TRUE, ?, UNIX_TIMESTAMP())',
                [deadline.name, deadline.description, deadline.start_date, deadline.end_date, deadline.category_id, status]
            );
        }
        console.log(`✓ Created ${deadlines.length} sample deadlines`);

        console.log('\n=== Demo Data Setup Complete ===');
        console.log('Admin: admin@ieee.org / admin');
        console.log('User: user@ieee.org / admin');
        console.log('Organization: Sri Sai Ram Engineering College');

    } catch (err) {
        console.error('Error setting up demo data:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

setupDemoData();
