#!/bin/bash

# CloudCare Setup Script
# Sets up the database and all 5 FastAPI servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🏥 CloudCare Setup Script"
echo "=========================="
echo ""

# Check if .env exists next to this script
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    echo "📝 Edit .env file and run this script again."
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🗄️  Setting up database..."

# Check if Prisma is installed
if ! command -v prisma &> /dev/null; then
    echo "📥 Installing Prisma CLI..."
    npm install -g prisma
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
prisma generate --schema=./prisma/schema.prisma

# Push schema to database
echo "📊 Pushing schema to database..."
prisma db push --schema=./prisma/schema.prisma

# Seed database
echo ""
echo "🌱 Would you like to seed the database with mock Indian data? (y/n)"
read -r seed_response
if [ "$seed_response" = "y" ] || [ "$seed_response" = "Y" ]; then
    echo "🌱 Seeding database..."
    python prisma/seed.py
    echo "✅ Mock data created:"
    echo "   • 5 Hospitals (Apollo, Fortis, AIIMS, etc.)"
    echo "   • 5 Doctors (various specializations)"
    echo "   • 5 Patients (including 1 emergency patient: Rajesh Kumar)"
    echo "   • Medical records, prescriptions, and wearable data"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start all services with Docker (from repo root):"
echo "   cd backend && docker-compose up -d"
echo ""
echo "🚀 To start services individually (from repo root):"
echo "   Terminal 1: cd backend/patient-api && python main.py"
echo "   Terminal 2: cd backend/doctor-api && python main.py"
echo "   Terminal 3: cd backend/hospital-api && python main.py"
echo "   Terminal 4: cd backend/emergency-api && python main.py"
echo "   Terminal 5: cd backend/wearables-api && python main.py"
echo ""
echo "📚 API Documentation available at:"
echo "   Patient API:    http://localhost:8001/docs"
echo "   Doctor API:     http://localhost:8002/docs"
echo "   Hospital API:   http://localhost:8003/docs"
echo "   Emergency API:  http://localhost:8004/docs"
echo "   Wearables API:  http://localhost:8005/docs"
echo ""
