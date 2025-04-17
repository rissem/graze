#!/bin/bash

set -e
set -x

echo "Resetting database..."

# Stop running containers
echo "Stopping running containers..."
docker compose down

# Remove the database volume
echo "Removing database volume..."
docker volume rm graze_app-db-data

# Start the database container
echo "Starting database container..."
docker compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Upgrade database to latest migration
echo "Applying latest migrations..."
docker compose run --rm --no-deps backend alembic upgrade head

# Seed database with initial data
echo "Seeding database with initial data..."
docker compose run --rm --no-deps backend python app/initial_data.py

echo "Database reset complete!" 