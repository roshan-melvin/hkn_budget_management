# IEEE-HKN International Hackathon

## Team Information
**Team Name**: ROSHAN MELVIN G A

**Team Members**:
- [ALAGAPPAN A] — [Nu Eta Chapter, Sri Sairam Engineering College]
- [SARAVANAN R K] — [Nu Eta Chapter, Sri Sairam Engineering College]
- [HARINI M] — [Nu Eta Chapter, Sri Sairam Engineering College]
- [NAKUL S] — [Nu Eta Chapter, Sri Sairam Engineering College]

## Project Overview
A comprehensive full-stack budget management system designed for IEEE Eta Kappa Nu (HKN) chapters to streamline financial operations, grant applications, and event reporting. The system provides a unified platform for chapter leaders to manage budgets, track expenses, apply for grants, and generate financial reports.

## Used Technologies
- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Other Tools**: Recharts (Analytics), React Hook Form, Zod

## Implemented Features

### Mandatory Features
- **Expense and Income Tracking**: Full management of expenses and incomes with support for real-time and planned transactions.
- **Budget Planning**: Dashboard displaying actual vs. projected balances to help chapters plan effectively.
- **Export Reports**: Ability to export budget summaries and transaction histories to CSV/PDF.
- **Deadline Tracking**: Dedicated section for tracking grant application deadlines and funding opportunities.

### Optional Features
- **Event-linked Budgeting**: Budgets are organized by academic years and can be linked to specific events.
- **Receipt Management**: Support for uploading and attaching digital receipts to transactions and reports.
- **Analytics and Reports**: Visual charts and graphs to illustrate spending trends, budget utilization, and category breakdowns.
- **Admin Panel**: Comprehensive admin interface for managing organizations, deadlines, categories, and reviewing applications.

### Extra Features
- **Multi-Timezone Support**: Automatic timezone detection and configuration for global chapters.
- **Currency Support**: Support for multiple currencies (USD, EUR, GBP, etc.) to cater to international chapters.
- **Unified Login System**: Single entry point for both admins and regular users with role-based redirection.
- **Docker Helper Script**: Custom script to simplify deployment and management of the Docker environment.

## Running the Project

### Platform Tested
- **Linux** (Ubuntu 22.04) - Primary development and testing environment.
- Compatible with macOS and Windows via Docker Desktop.

### Prerequisites
- Docker Desktop installed

### Quick Start (Recommended)
Run the helper script to build and start the application:
```bash
./docker-deploy.sh
```
*(If you encounter permission errors on Linux, use `sudo ./docker-deploy.sh`)*

### Manual Start
Alternatively, you can use standard Docker commands:
```bash
docker-compose up --build -d
```

### Local Development (Without Docker)
If you prefer to run the application locally without Docker:

1. **Prerequisites**:
   - Node.js (v18+)
   - MySQL Server running locally

2. **Setup Database**:
   - Create a MySQL database named `hkn_budget_db`
   - Configure your `.env` file with database credentials (copy `.env.example` to `.env`)

3. **Install Dependencies**:
   ```bash
   npm install
   npm run install:client
   ```

4. **Initialize Database Schema**:
   ```bash
   node src/scripts/init_db.js
   node src/scripts/add_default_academic_years.js
   ```

5. **Setup Demo Data (Optional)**:
   ```bash
   node scripts/setup_demo_data.js
   ```

6. **Run Application**:
   ```bash
   npm run dev
   ```
   This will start both the backend (port 4000) and frontend (port 5173) concurrently.

### Access Credentials
- **Admin User**: `admin@ieee.org` / `admin`
- **Regular User**: `user@ieee.org` / `admin`

### Application URLs
Once the application is running, access it at:
- **Frontend/Login**: [http://localhost:5173](http://localhost:5173)
  - Login here with admin or user credentials
  - You'll be redirected to the appropriate dashboard based on your role
- **API Base**: [http://localhost:5000/api](http://localhost:5000/api)
  - Backend API endpoints (not for direct browser access)

## API

### Authentication
- `POST /api/auth/login` - Authenticate user and return token
- `POST /api/auth/signup` - Register a new user account
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update budget details
- `DELETE /api/budgets/:id` - Delete a budget

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add a new income or expense
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Deadlines & Applications
- `GET /api/deadlines/all` - List all active deadlines
- `POST /api/deadlines/apply/:id` - Apply for a specific grant/deadline
- `GET /api/deadlines/user/applications` - View user's submitted applications

### Admin
- `GET /api/chapter-organizations` - List all chapter organizations
- `POST /api/deadlines/admin/official` - Create new official deadline
- `GET /api/academic-years` - Manage academic years

## Database Structure

### users
- `id` - INT - PK
- `email` - VARCHAR - Unique
- `password` - VARCHAR
- `role` - VARCHAR (admin/user)
- `chapter_organization` - VARCHAR

### academic_years
- `id` - INT - PK
- `name` - VARCHAR
- `start_date` - BIGINT
- `end_date` - BIGINT
- `user_id` - INT - FK (users)

### budgets
- `id` - INT - PK
- `name` - VARCHAR
- `academic_year_id` - INT - FK (academic_years)
- `user_id` - INT - FK (users)
- `total_amount` - DECIMAL
- `used_amount` - DECIMAL

### transactions
- `id` - INT - PK
- `budget_id` - INT - FK (budgets)
- `category_id` - INT - FK (categories)
- `amount` - DECIMAL
- `type` - ENUM (income/expense)
- `is_projected` - BOOLEAN

### categories
- `id` - INT - PK
- `name` - VARCHAR
- `type` - ENUM
- `user_id` - INT - FK (users)

### deadlines
- `id` - INT - PK
- `name` - VARCHAR
- `start_date` - BIGINT
- `end_date` - BIGINT
- `category_id` - INT - FK (categories)
- `is_official` - BOOLEAN

### chapter_organizations
- `id` - INT - PK
- `name` - VARCHAR - Unique
- `is_active` - BOOLEAN
