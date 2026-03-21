// Script to add default academic years
const db = require('../db');

async function addDefaultAcademicYears() {
    try {
        console.log('Adding default academic years...');

        // Check if default academic years already exist
        const [existing] = await db.query(
            'SELECT id FROM academic_years WHERE user_id IS NULL'
        );

        if (existing.length > 0) {
            console.log('Default academic years already exist. Skipping...');
            process.exit(0);
        }

        const now = Math.floor(Date.now() / 1000);

        // 2024-2025 academic year (July 1, 2024 - June 30, 2025)
        const start_2024 = Math.floor(new Date('2024-07-01').getTime() / 1000);
        const end_2024 = Math.floor(new Date('2025-06-30').getTime() / 1000);

        await db.query(
            'INSERT INTO academic_years (name, start_date, end_date, created_at, user_id) VALUES (?, ?, ?, ?, ?)',
            ['2024-2025', start_2024, end_2024, now, null]
        );
        console.log('✅ Added 2024-2025 academic year');

        // 2025-2026 academic year (July 1, 2025 - June 30, 2026)
        const start_2025 = Math.floor(new Date('2025-07-01').getTime() / 1000);
        const end_2025 = Math.floor(new Date('2026-06-30').getTime() / 1000);

        await db.query(
            'INSERT INTO academic_years (name, start_date, end_date, created_at, user_id) VALUES (?, ?, ?, ?, ?)',
            ['2025-2026', start_2025, end_2025, now, null]
        );
        console.log('✅ Added 2025-2026 academic year');

        console.log('Default academic years added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding default academic years:', err);
        process.exit(1);
    }
}

addDefaultAcademicYears();
