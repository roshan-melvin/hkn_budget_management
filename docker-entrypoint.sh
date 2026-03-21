#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until nc -z -v -w30 $DB_HOST $DB_PORT; do
  echo "Waiting for database connection..."
  sleep 5
done
echo "MySQL is up and running!"

# Initialize database schema
echo "Initializing database schema..."
node src/scripts/init_db.js

# Add default academic years
echo "Adding default academic years..."
node src/scripts/add_default_academic_years.js

# Start the application
echo "Starting application..."
exec "$@"
