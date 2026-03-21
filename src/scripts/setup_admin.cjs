// Setup admin user and default organization
const pool = require('../db');
const bcrypt = require('bcrypt');

async function setupAdmin() {
    try {
        console.log('🔧 Setting up admin user and organization...');

        // Add is_admin column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
        `);
        console.log('✓ Added is_admin column to users table');

        // Create Sri Sai Ram Engineering College
        const [orgResult] = await pool.query(`
            INSERT INTO chapter_organizations (name, is_active, created_at)
            VALUES ('Sri Sai Ram Engineering College', TRUE, UNIX_TIMESTAMP())
            ON DUPLICATE KEY UPDATE 
                is_active = TRUE,
                id = LAST_INSERT_ID(id)
        `);

        const orgId = orgResult.insertId;
        console.log('✓ Created/Updated organization: Sri Sai Ram Engineering College (ID:', orgId, ')');

        // Hash password "admin"
        const hashedPassword = await bcrypt.hash('admin', 10);

        // Create admin user
        const [userResult] = await pool.query(`
            INSERT INTO users (name, email, password, chapter_organization_id, is_admin, created_at)
            VALUES ('Admin User', 'admin', ?, ?, TRUE, UNIX_TIMESTAMP())
            ON DUPLICATE KEY UPDATE 
                password = VALUES(password),
                is_admin = TRUE,
                chapter_organization_id = VALUES(chapter_organization_id)
        `, [hashedPassword, orgId]);

        console.log('✓ Created/Updated admin user');
        console.log('');
        console.log('✅ Admin setup complete!');
        console.log('');
        console.log('Admin Credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin');
        console.log('');
        console.log('Organization: Sri Sai Ram Engineering College');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up admin:', error);
        process.exit(1);
    }
}

setupAdmin();
