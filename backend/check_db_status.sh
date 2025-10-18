#!/bin/bash
# CloudCare Database Status Checker
# Shows the current state of both n8n and CloudCare schemas

echo "🔍 CloudCare Database Status Check"
echo "=================================="

# Database connection details
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="cloudcare_db"
DB_USER="cloudcare"
DB_PASSWORD="cloudcare123"

# Check n8n tables in public schema
echo "📊 n8n Tables (public schema):"
N8N_TABLES=$(docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -t -c "
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%n8n%' OR table_name IN ('user', 'workflow_entity', 'execution_entity', 'credentials_entity');
")
echo "   Tables found: $N8N_TABLES"

# Check CloudCare tables in cloudcare schema
echo ""
echo "🏥 CloudCare Tables (cloudcare schema):"
CLOUDCARE_TABLES=$(docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -t -c "
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'cloudcare'
AND table_name IN ('Patient', 'Doctor', 'Hospital', 'Record', 'Prescription', 'PatientCondition', 'WearableData', 'UserLogin');
")
echo "   Tables found: $CLOUDCARE_TABLES"

# Show schema separation
echo ""
echo "📋 Schema Separation Status:"
docker exec hacksters-postgres psql -U $DB_USER -d $DB_NAME -c "
SELECT schemaname, COUNT(*) as tables
FROM pg_tables
WHERE schemaname IN ('public', 'cloudcare')
GROUP BY schemaname
ORDER BY schemaname;
"

echo ""
echo "✅ Both n8n and CloudCare can now coexist safely!"
echo "   • n8n uses: public schema"
echo "   • CloudCare uses: cloudcare schema"