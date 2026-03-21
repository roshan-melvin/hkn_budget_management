#!/bin/bash

# Docker Deployment Helper Script for HKN Budget Management System

echo "======================================"
echo "HKN Budget Management System"
echo "Docker Deployment Helper"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is installed"
echo ""

# Check if Docker is running
# Check if Docker is running
if ! docker info &> /dev/null; then
    # Try with sudo to see if it's just a permission issue
    if sudo docker info &> /dev/null; then
        echo "⚠️  Docker is running but requires root permissions."
        echo "   Please run this script with sudo:"
        echo "   sudo ./docker-deploy.sh"
        exit 1
    else
        echo "❌ Docker is not running. Please start the Docker service."
        echo "   Linux: sudo systemctl start docker"
        echo "   Mac/Windows: Start Docker Desktop"
        exit 1
    fi
fi

echo "✓ Docker is running"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
fi

# Menu
echo "What would you like to do?"
echo "1) Build and start the application"
echo "2) Start the application (already built)"
echo "3) Stop the application"
echo "4) View logs"
echo "5) Reset everything (WARNING: Deletes all data)"
echo "6) Setup demo data"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo ""
        echo "Building and starting the application..."
        echo "This may take a few minutes on first run."
        docker-compose up -d --build
        echo ""
        echo "Initializing database schema..."
        sleep 5  # Wait for containers to be fully ready
        docker exec hkn-budget-app node src/scripts/init_db.js
        docker exec hkn-budget-app node src/scripts/add_default_academic_years.js
        echo "✓ Database initialized"
        ;;
    2)
        echo ""
        echo "Starting the application..."
        docker-compose up -d
        ;;
    3)
        echo ""
        echo "Stopping the application..."
        docker-compose down
        echo "✓ Application stopped"
        ;;
    4)
        echo ""
        echo "Viewing logs (Press Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    5)
        echo ""
        read -p "⚠️  This will delete ALL data. Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Resetting everything..."
            docker-compose down -v
            echo "✓ All data deleted"
            echo "Run option 1 to rebuild and start fresh"
        else
            echo "Cancelled"
        fi
        ;;
    6)
        echo ""
        echo "Initializing database schema..."
        docker exec hkn-budget-app node src/scripts/init_db.js
        docker exec hkn-budget-app node src/scripts/add_default_academic_years.js
        echo ""
        echo "Setting up demo data..."
        docker exec -it hkn-budget-app node scripts/setup_demo_data.js
        echo "✓ Demo data setup complete"
        ;;
    7)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "Application URLs:"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000/admin"
echo ""
echo "Login Credentials:"
echo "Admin: admin@ieee.org / admin"
echo "User:  user@ieee.org / admin"
echo "======================================"
