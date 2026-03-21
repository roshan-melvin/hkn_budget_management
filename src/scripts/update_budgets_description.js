const db = require('../db');

async function updateBudgetsDescription() {
    try {
        console.log('Updating budgets table schema...');

        // Add description
        try {
            await db.query("ALTER TABLE budgets ADD COLUMN description TEXT");
            console.log('Added description column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('description column already exists');
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

updateBudgetsDescription();
