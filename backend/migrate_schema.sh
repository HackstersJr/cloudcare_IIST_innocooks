#!/bin/bash
# CloudCare Database Schema Migration Script
# This script separates CloudCare tables from n8n tables using PostgreSQL schemas

set -e

echo "🔄 Starting CloudCare database schema migration..."

# Database connection details
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="cloudcare_db"
DB_USER="cloudcare"
DB_PASSWORD="cloudcare123"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker exec hacksters-postgres pg_isready -h localhost -p 5432 -U $DB_USER -d $DB_NAME; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready"

# Create cloudcare schema if it doesn't exist
echo "🏗️ Creating cloudcare schema..."
docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE SCHEMA IF NOT EXISTS cloudcare;
GRANT ALL ON SCHEMA cloudcare TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cloudcare TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cloudcare TO $DB_USER;
"

# Check if CloudCare tables exist in public schema
CLOUDCARE_TABLES_EXIST=$(docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -t -c "
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('Patient', 'Doctor', 'Hospital', 'Record', 'Prescription', 'PatientCondition', 'WearableData', 'UserLogin');
")

if [ "$CLOUDCARE_TABLES_EXIST" -gt 0 ]; then
    echo "📦 Moving existing CloudCare tables to cloudcare schema..."

    # Move tables to cloudcare schema
    docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -c "
    -- Move CloudCare tables to cloudcare schema
    -- Note: Sequences are automatically moved with their tables
    ALTER TABLE \"Patient\" SET SCHEMA cloudcare;
    ALTER TABLE \"Doctor\" SET SCHEMA cloudcare;
    ALTER TABLE \"Hospital\" SET SCHEMA cloudcare;
    ALTER TABLE \"Record\" SET SCHEMA cloudcare;
    ALTER TABLE \"Prescription\" SET SCHEMA cloudcare;
    ALTER TABLE \"PatientCondition\" SET SCHEMA cloudcare;
    ALTER TABLE \"WearableData\" SET SCHEMA cloudcare;
    ALTER TABLE \"UserLogin\" SET SCHEMA cloudcare;
    "

    echo "✅ CloudCare tables moved to cloudcare schema"
else
    echo "ℹ️ No existing CloudCare tables found in public schema"
fi

echo "🎯 Schema migration completed!"
echo ""
echo "📋 Current database status:"
echo "   • n8n tables remain in 'public' schema"
echo "   • CloudCare tables are in 'cloudcare' schema"
echo "   • Both applications can coexist without conflicts"
echo ""
echo "🚀 You can now run Prisma migrations and seeding safely!"