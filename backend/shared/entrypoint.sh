#!/bin/sh
# Prisma Migration and Startup Script

echo "🔄 Checking database and running Prisma setup..."

# Push schema directly (works better for fresh setups)
echo "📊 Pushing Prisma schema to database..."
prisma db push --accept-data-loss --skip-generate --schema=/app/prisma/schema.prisma 2>&1 | tee /tmp/migrate.log

if grep -q "already in sync" /tmp/migrate.log || grep -q "Your database is now in sync" /tmp/migrate.log; then
    echo "✅ Database schema is ready"
    
    # Check if we need to seed (only if Patient table is empty)
    echo "🌱 Checking if seeding is needed..."
    PATIENT_COUNT=$(python -c "
import asyncio
from prisma import Prisma
async def check():
    db = Prisma()
    await db.connect()
    count = await db.patient.count()
    await db.disconnect()
    print(count)
asyncio.run(check())
" 2>/dev/null || echo "0")
    
    if [ "$PATIENT_COUNT" = "0" ]; then
        echo "📦 Database is empty, running seed script..."
        python /app/prisma/seed.py 2>&1 | tee /tmp/seed.log
        if [ $? -eq 0 ]; then
            echo "✅ Seeding completed successfully"
        else
            echo "⚠️  Seeding encountered issues but continuing..."
        fi
    else
        echo "✅ Database already contains data (${PATIENT_COUNT} patients found)"
    fi
else
    echo "⚠️  Schema push warning (continuing with startup)..."
fi

# Start the application
echo "🚀 Starting application..."
exec python main.py
