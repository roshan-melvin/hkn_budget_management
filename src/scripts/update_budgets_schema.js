const db = require('../db');

async function updateBudgetsSchema() {
    try {
        console.log('Updating budgets table schema...');

        // Add used_amount
        try {
            await db.query("ALTER TABLE budgets ADD COLUMN used_amount DECIMAL(15, 2) DEFAULT 0.00");
            console.log('Added used_amount column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('used_amount column already exists');
            } else {
                throw e;
            }
        }

        // Add planned_amount
        try {
            await db.query("ALTER TABLE budgets ADD COLUMN planned_amount DECIMAL(15, 2) DEFAULT 0.00");
            console.log('Added planned_amount column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('planned_amount column already exists');
            } else {
                throw e;
            }
        }

        // Add updated_at
        try {
            await db.query("ALTER TABLE budgets ADD COLUMN updated_at BIGINT");
            console.log('Added updated_at column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('updated_at column already exists');
            } else {
                throw e;
            }
        }

        console.log('Budgets table schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating budgets schema:', err);
        process.exit(1);
    }
}

updateBudgetsSchema();
