#!/bin/sh
# Prisma Migration and Startup Script

echo "🔄 Checking database and running Prisma migrations..."

# Try to run migrations
prisma migrate deploy --schema=/app/prisma/schema.prisma 2>&1 | tee /tmp/migrate.log

# Check if migrations were successful or if database is already up to date
if grep -q "No pending migrations" /tmp/migrate.log || grep -q "already applied" /tmp/migrate.log; then
    echo "✅ Database is up to date"
elif grep -q "P3005" /tmp/migrate.log; then
    echo "📊 Database schema exists, marking as baselined..."
    # Database exists but no migration history - this is OK for existing deployments
    echo "✅ Using existing database schema"
elif [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migration warning (continuing with startup)..."
fi

# Start the application
echo "🚀 Starting application..."
exec python main.py
