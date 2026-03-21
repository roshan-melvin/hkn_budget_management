const db = require('../db');

async function initDb() {
  try {
    console.log('Initializing database tables...');

    // Roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at BIGINT,
        updated_at BIGINT
      )`);
    console.log('✓ roles table checked/created');

    // Users table (already exists, but ensuring schema)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at BIGINT,
        last_login BIGINT,
        timezone VARCHAR(64) DEFAULT 'UTC',
        currency VARCHAR(8) DEFAULT 'USD',
        updated_at BIGINT,
        chapter_organization VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    // Chapter Organizations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS chapter_organizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at BIGINT,
        updated_at BIGINT,
        created_by INT
      )
    `);

    // Academic Years table
    await db.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date BIGINT NOT NULL,
        end_date BIGINT NOT NULL,
        created_at BIGINT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        user_id INT,
        created_at BIGINT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Budgets table
    // "budgets linked to academic year and user"
    await db.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        academic_year_id INT NOT NULL,
        user_id INT NOT NULL,
        total_amount DECIMAL(15, 2) DEFAULT 0.00,
        used_amount DECIMAL(15, 2) DEFAULT 0.00,
        planned_amount DECIMAL(15, 2) DEFAULT 0.00,
        description TEXT,
        created_at BIGINT,
        updated_at BIGINT,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Deadlines table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deadlines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date BIGINT NOT NULL,
        end_date BIGINT NOT NULL,
        category_id INT,
        is_official BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'active',
        created_at BIGINT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Transactions table (Needed for Budget Summary: actual vs projected)
    // Although Member 1 might not be fully responsible for CRUD, the summary endpoint requires this structure.
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        budget_id INT NOT NULL,
        category_id INT,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        date BIGINT NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        is_projected BOOLEAN DEFAULT FALSE,
        created_at BIGINT,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    console.log('Database tables initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDb();
