# Docker Deployment Guide

This guide explains how to build and run the HKN Budget Management System using Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- At least 4GB of free disk space

## Quick Start

### Option 1: Helper Script (Easiest)

```bash
./docker-deploy.sh
```
(Use `sudo ./docker-deploy.sh` if you get permission errors)

### Option 2: Manual Commands

### 1. Build and Run

```bash
# Navigate to project directory
cd Hkn_Budget_Backend

# Build and start all services
docker-compose up --build
```

This single command will:
- Build the React frontend
- Build the Node.js backend
- Start MySQL database
- Start the application
- Run database migrations
- Set up demo data

### 2. Access the Application

Once you see "Server listening on http://localhost:4000" in the logs:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Admin Panel**: Login as admin and you'll be redirected

### 3. Login Credentials

**Admin:**
- Email: `admin@ieee.org`
- Password: `admin`

**User:**
- Email: `user@ieee.org`
- Password: `admin`

## Detailed Instructions

### Building the Docker Image

```bash
# Build without starting
docker-compose build

# Build with no cache (fresh build)
docker-compose build --no-cache
```

### Running the Application

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Stopping the Application

```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including volumes (DELETES ALL DATA)
docker-compose down -v
```

### Managing Data

```bash
# Reset database (removes all data)
docker-compose down -v
docker-compose up --build

# Backup database
docker exec hkn-budget-db mysqldump -u root -prootpassword hkn_budget_db > backup.sql

# Restore database
docker exec -i hkn-budget-db mysql -u root -prootpassword hkn_budget_db < backup.sql
```

### Setup Demo Data

The demo data (admin user, regular user, categories, deadlines) is automatically created when you first run the application. If you need to reset it:

```bash
# Enter the app container
docker exec -it hkn-budget-app sh

# Run the setup script
node scripts/setup_demo_data.js

# Exit container
exit
```

## Docker Architecture

### Services

**1. Database (db)**
- Image: MySQL 8.0
- Port: 3306
- Volume: `mysql_data` (persistent storage)
- Health check: Ensures database is ready before starting app

**2. Application (app)**
- Built from Dockerfile
- Ports:
  - 4000: Backend API
  - 3000: Frontend (production build)
  - 3002: Admin panel
- Volumes:
  - `./uploads`: User uploaded files
  - `./logs`: Application logs

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

**Stage 1: Frontend Builder**
- Builds the React application
- Optimizes for production
- Outputs to `dist` folder

**Stage 2: Application**
- Installs backend dependencies
- Copies built frontend
- Copies admin panel
- Serves everything from one container

## Environment Variables

The application uses these environment variables (set in docker-compose.yml):

```yaml
NODE_ENV: production
DB_HOST: db
DB_PORT: 3306
DB_NAME: hkn_budget_db
DB_USER: hkn_user
DB_PASSWORD: hkn_password
JWT_SECRET: your-super-secret-jwt-key-change-this
PORT: 4000
```

To customize, create a `.env` file in the project root:

```env
DB_NAME=my_custom_db
DB_USER=my_user
DB_PASSWORD=my_secure_password
JWT_SECRET=my-super-secret-key
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :4000
lsof -i :3306

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Cannot Access Application

```bash
# Verify containers are running
docker-compose ps

# Check if ports are exposed
docker port hkn-budget-app

# Test backend health
curl http://localhost:4000/health
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi hkn_budget_backend-app

# Rebuild and start
docker-compose up --build
```

## Production Deployment

For production deployment:

### 1. Update Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_NAME=hkn_budget_prod
DB_USER=prod_user
DB_PASSWORD=super_secure_password_here
JWT_SECRET=very-long-random-secret-key
```

### 2. Use Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:4000"
    environment:
      NODE_ENV: production
      DB_HOST: ${DB_HOST}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    env_file:
      - .env.production
```

### 3. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### View Resource Usage

```bash
# Container stats
docker stats hkn-budget-app hkn-budget-db

# Disk usage
docker system df
```

### Health Checks

```bash
# Check application health
curl http://localhost:4000/health

# Check database
docker exec hkn-budget-db mysqladmin ping -h localhost
```

## Useful Commands

```bash
# Enter app container shell
docker exec -it hkn-budget-app sh

# Enter database shell
docker exec -it hkn-budget-db mysql -u root -p

# View all containers
docker ps -a

# View all images
docker images

# Clean up unused resources
docker system prune -a
```

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all containers are running: `docker-compose ps`
3. Try rebuilding: `docker-compose up --build`
4. Reset everything: `docker-compose down -v && docker-compose up --build`

---

**For more information, see the main [README.md](README.md)**
