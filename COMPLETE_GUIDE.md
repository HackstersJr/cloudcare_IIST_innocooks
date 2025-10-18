# CloudCare - Complete Setup & Reference Guide

**Last Updated:** October 19, 2025  
**Project:** Healthcare Monitoring System with AI-Powered Emergency Detection  
**Status:** ✅ Fully Configured with Auto-Migration & Seeding

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [User Credentials](#user-credentials)
3. [API Endpoints](#api-endpoints)
4. [Database Architecture](#database-architecture)
5. [System Components](#system-components)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Start Everything (Auto-configured)
```bash
cd backend
docker compose up -d
# Wait 30 seconds for auto-migration and seeding
```

### Fresh Clean Install
```bash
cd backend
docker compose down -v  # Remove all data
docker compose up -d    # Start fresh - auto-migrates & seeds
```

### Verify Setup
```bash
# Check all containers
docker ps

# Check patient count
docker exec hacksters-postgres psql -U cloudcare -d cloudcare_db -c "SELECT COUNT(*) FROM \"Patient\";"

# Check databases exist
docker exec hacksters-postgres psql -U cloudcare -d postgres -c "\l" | grep -E "(cloudcare_db|n8n_db)"
```

---

## 🔐 User Credentials

### All Passwords (except Patient 7)
**Default Password:** `Demo@123`

### 👥 Patient Logins (7 Total)

| ID | Name | Email | Password | HCGateway Username | Notes |
|----|------|-------|----------|-------------------|-------|
| 1 | Rahul Sharma | rahul.sharma@yahoo.in | Demo@123 | 1 | Demo patient |
| 2 | Priya Gupta | priya.gupta@gmail.com | Demo@123 | 2 | Demo patient |
| 3 | Amit Kumar | patient3@cloudcare.local | Demo@123 | 3 | Demo patient |
| 4 | Sneha Mehta | patient4@cloudcare.local | Demo@123 | 4 | Demo patient |
| 5 | Rajesh Kumar | patient5@cloudcare.local | Demo@123 | 5 | **Emergency patient** |
| 6 | John Doe | patient6@cloudcare.local | Demo@123 | 6 | Test patient |
| 7 | **Mobile Test User** | patient7@cloudcare.local | **test123** | 7 | **Recommended for HCGateway** |

**✅ All 7 patients have login accounts**  
**✅ All can sync wearable data via HCGateway app**

### 👨‍⚕️ Doctor Logins (2/5 have accounts)

| ID | Name | Specialization | Email | Password | Status |
|----|------|----------------|-------|----------|--------|
| 1 | Dr. Suresh Krishnan | Cardiology | .suresh.krishnan@gmail.com | Doctor@123 | ✅ Has login |
| 2 | Dr. Meera Rao | General Medicine | .meera.rao@outlook.com | Doctor@123 | ✅ Has login |
| 3 | Dr. Rajesh Gupta | Emergency Medicine | - | - | ⚠️ No login |
| 4 | Dr. Lakshmi Iyer | Pediatrics | - | - | ⚠️ No login |
| 5 | Dr. Anil Verma | Orthopedics | - | - | ⚠️ No login |

### 🔧 System Admin Credentials

#### n8n Workflow Automation
```
URL: http://localhost:5678
Username: cloudcare
Password: cloudcare
```
*(Change in `.env`: `N8N_BASIC_AUTH_USER` and `N8N_BASIC_AUTH_PASSWORD`)*

#### PostgreSQL Database
```
Host: localhost:5432
Database (CloudCare): cloudcare_db
Database (n8n): n8n_db
Username: cloudcare
Password: cloudcare123
```

#### Redis Cache
```
Host: localhost:6379
Password: redis123
```

---

## 🌐 API Endpoints

### CloudCare APIs

#### Patient API (Port 8001)
```
Base URL: http://localhost:8001
Swagger: http://localhost:8001/docs
ReDoc: http://localhost:8001/redoc

Key Endpoints:
- GET  /api/patients - List all patients
- GET  /api/patients/{id} - Get patient details
- POST /api/patients - Create new patient
- GET  /api/patients/{id}/wearables/latest - Latest wearable data
```

#### Doctor API (Port 8002)
```
Base URL: http://localhost:8002
Swagger: http://localhost:8002/docs

Key Endpoints:
- GET  /api/doctors - List all doctors
- GET  /api/doctors/{id} - Get doctor details
- GET  /api/doctors/{id}/patients - Doctor's patients
```

#### Hospital API (Port 8003)
```
Base URL: http://localhost:8003
Swagger: http://localhost:8003/docs

Key Endpoints:
- GET  /api/hospitals - List all hospitals
- GET  /api/hospitals/{id} - Get hospital details
- GET  /api/hospitals/{id}/doctors - Hospital's doctors
```

#### Emergency API (Port 8004)
```
Base URL: http://localhost:8004
Swagger: http://localhost:8004/docs

Key Endpoints:
- GET  /api/emergency - List emergency cases
- GET  /api/emergency/active - Active emergencies
- SSE  /api/emergency/stream - Real-time updates
```

#### Wearables API (Port 8005)
```
Base URL: http://localhost:8005
Swagger: http://localhost:8005/docs

Key Endpoints:
- POST /api/patients/{id}/wearables - Submit wearable data
- GET  /api/patients/{id}/wearables/latest - Latest reading
- GET  /api/patients/{id}/wearables/history - Historical data
```

### HCGateway Mobile App Integration

#### Recommended Login
```
Server URL: http://<your-local-ip>:8005
Username: 7
Password: test123
```

#### Alternative Logins
```
Server URL: http://<your-local-ip>:8005
Username: 1-6
Password: Demo@123
```

**How it works:**
- Username = Patient ID (1-7)
- Data syncs to that patient's record
- View at: `http://localhost:8005/api/patients/{id}/wearables/latest`

### n8n Workflow Automation
```
URL: http://localhost:5678
Username: cloudcare
Password: cloudcare

Access CloudCare Data:
- Use PostgreSQL Node with cloudcare_db
- Or call CloudCare APIs directly
```

---

## 🗄️ Database Architecture

### Two Separate Databases

#### cloudcare_db (CloudCare Application)
**Purpose:** All patient, doctor, and healthcare data  
**Tables:** 10
- Patient (7 records)
- Doctor (5 records)
- Hospital (5 records)
- UserLogin (9 records)
- Record, Prescription, PatientCondition
- WearableData
- _PatientDoctors, _PatientHospitals (relations)

#### n8n_db (Workflow Automation)
**Purpose:** n8n workflows, executions, and automation data  
**Tables:** 41
- workflow_entity, execution_entity
- credentials_entity, auth_identity
- All n8n operational tables

### Benefits of Separation
- ✅ No schema conflicts between systems
- ✅ Independent migrations and updates
- ✅ Clear separation of concerns
- ✅ Easy to backup separately
- ✅ n8n can still access CloudCare data via PostgreSQL node

### Database Connection String
```bash
# CloudCare APIs
DATABASE_URL=postgresql://cloudcare:cloudcare123@postgres:5432/cloudcare_db

# n8n (automatic)
DB_POSTGRESDB_DATABASE=n8n_db
```

---

## 🏗️ System Components

### Docker Services

| Service | Container Name | Port | Purpose |
|---------|----------------|------|---------|
| **postgres** | hacksters-postgres | 5432 | PostgreSQL with pgvector |
| **redis** | hacksters-redis | 6379 | Cache for n8n |
| **n8n** | hacksters | 5678 | Workflow automation UI |
| **n8n-worker** | hacksters-worker | - | Background job processor |
| **patient-api** | cloudcare_patient_api | 8001 | Patient management |
| **doctor-api** | cloudcare_doctor_api | 8002 | Doctor management |
| **hospital-api** | cloudcare_hospital_api | 8003 | Hospital management |
| **emergency-api** | cloudcare_emergency_api | 8004 | Emergency detection |
| **wearables-api** | cloudcare_wearables_api | 8005 | Wearable data ingestion |

### Auto-Configuration Features

#### On Container Startup (`entrypoint.sh`)
1. **Prisma Schema Push** - Automatically syncs database schema
2. **Seeding Check** - Checks if database is empty
3. **Auto-Seed** - Seeds data only if no patients exist
4. **App Start** - Starts FastAPI application

#### What Gets Auto-Created
- ✅ 7 patients with login credentials
- ✅ 5 doctors (2 with login accounts)
- ✅ 5 hospitals across India
- ✅ Medical records, prescriptions, conditions
- ✅ Sample wearable data
- ✅ 1 emergency patient (Rajesh Kumar)

---

## 🧪 Quick Test Commands

### Test Patient Login (HCGateway API)
```bash
curl -X POST http://localhost:8005/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"username": "7", "password": "test123"}' | jq
```

### Get Patient Info
```bash
curl http://localhost:8001/api/patients/1 | jq
```

### Get Latest Wearable Data
```bash
curl http://localhost:8005/api/patients/7/wearables/latest | jq
```

### View All Patients with Login
```bash
docker exec hacksters-postgres psql -U cloudcare -d cloudcare_db \
  -c "SELECT p.id, p.name, u.email FROM \"Patient\" p 
      JOIN \"UserLogin\" u ON p.\"userLoginId\" = u.id 
      ORDER BY p.id;"
```

### Check Database Tables
```bash
# CloudCare tables
docker exec hacksters-postgres psql -U cloudcare -d cloudcare_db -c "\dt"

# n8n tables
docker exec hacksters-postgres psql -U cloudcare -d n8n_db -c "\dt"
```

---

## 🛠️ Troubleshooting

### Containers Won't Start
```bash
# Check logs
docker logs cloudcare_patient_api
docker logs hacksters-postgres

# Restart specific service
docker restart cloudcare_patient_api
```

### Seeding Failed or Incomplete
```bash
# Manually run seed
docker exec cloudcare_patient_api python3 /app/prisma/seed.py

# Check if patients exist
docker exec hacksters-postgres psql -U cloudcare -d cloudcare_db \
  -c "SELECT COUNT(*) FROM \"Patient\";"
```

### n8n Tables Missing
```bash
# Create n8n_db if missing
docker exec hacksters-postgres psql -U cloudcare -d postgres \
  -c "CREATE DATABASE n8n_db;"

# Restart n8n to trigger table creation
docker restart hacksters hacksters-worker
```

### Database Connection Issues
```bash
# Check PostgreSQL is healthy
docker ps | grep postgres

# Test connection
docker exec hacksters-postgres psql -U cloudcare -d cloudcare_db -c "SELECT 1;"
```

### Reset Everything
```bash
cd backend
docker compose down -v         # Stop and remove volumes
docker volume prune -f         # Clean dangling volumes
docker compose up -d           # Start fresh
sleep 30                       # Wait for auto-seeding
docker logs cloudcare_patient_api  # Verify seeding
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8001  # or :5432, :5678, etc.

# Kill process or change port in docker-compose.yml
```

---

## 📊 Current Data Status

### Populated Data (Auto-Seeded)

#### Patients: 7
- 4 regular patients (various conditions)
- 1 emergency patient (Rajesh Kumar - cardiac issues)
- 2 test patients (John Doe, Mobile Test User)

#### Doctors: 5 (2 with logins)
- Dr. Suresh Krishnan (Cardiology) ✅
- Dr. Meera Rao (General Medicine) ✅
- Dr. Rajesh Gupta (Emergency Medicine)
- Dr. Lakshmi Iyer (Pediatrics)
- Dr. Anil Verma (Orthopedics)

#### Hospitals: 5
- Apollo Hospital, Bangalore
- Fortis Hospital, Mumbai
- AIIMS, Delhi
- Manipal Hospital, Pune
- Max Super Specialty Hospital, Gurugram

#### Wearable Data
- Sample data for all patients
- Emergency patient has critical readings
- Ready to receive live data from HCGateway app

---

## 📱 HCGateway Mobile App Setup

### Configuration
1. Open HCGateway app
2. Go to Settings → Server
3. Enter: `http://<your-local-ip>:8005`
4. Login: Username `7`, Password `test123`
5. Sync data from Health Connect

### Finding Your Local IP
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

---

## 🎯 Environment Variables

### Key Variables in `.env`
```bash
# CloudCare Database
POSTGRES_DB=cloudcare_db
POSTGRES_USER=cloudcare
POSTGRES_PASSWORD=cloudcare123

# n8n Database (Separate)
N8N_DB=n8n_db

# n8n Auth
N8N_BASIC_AUTH_USER=cloudcare
N8N_BASIC_AUTH_PASSWORD=cloudcare

# Redis
REDIS_PASSWORD=redis123

# API Ports
PATIENT_API_PORT=8001
DOCTOR_API_PORT=8002
HOSPITAL_API_PORT=8003
EMERGENCY_API_PORT=8004
WEARABLES_API_PORT=8005
```

---

## ✅ Setup Verification Checklist

After running `docker compose up -d`, verify:

- [ ] All 9 containers running (`docker ps`)
- [ ] PostgreSQL healthy
- [ ] Both databases exist (cloudcare_db, n8n_db)
- [ ] 7 patients in cloudcare_db
- [ ] n8n UI accessible at http://localhost:5678
- [ ] Patient API docs at http://localhost:8001/docs
- [ ] Wearables API docs at http://localhost:8005/docs
- [ ] Can login to HCGateway with patient 7 credentials

---

## 📝 File Structure

```
backend/
├── docker-compose.yml       # All services configuration
├── .env                     # Environment variables
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.py             # Auto-seeding script (7 patients)
├── shared/
│   ├── entrypoint.sh       # Auto-migration & seeding
│   ├── database.py         # Shared DB connection
│   └── models.py           # Shared Pydantic models
├── patient-api/            # Patient management API
├── doctor-api/             # Doctor management API
├── hospital-api/           # Hospital management API
├── emergency-api/          # Emergency detection API
└── wearables-api/          # Wearable data API
```

---

## 🔄 Maintenance Tasks

### Rebuild After Code Changes
```bash
docker compose down
docker compose build
docker compose up -d
```

### Backup Database
```bash
# CloudCare data
docker exec hacksters-postgres pg_dump -U cloudcare cloudcare_db > cloudcare_backup.sql

# n8n workflows
docker exec hacksters-postgres pg_dump -U cloudcare n8n_db > n8n_backup.sql
```

### Restore Database
```bash
cat cloudcare_backup.sql | docker exec -i hacksters-postgres psql -U cloudcare -d cloudcare_db
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker logs -f cloudcare_patient_api

# Last 50 lines
docker logs --tail 50 cloudcare_patient_api
```

---

## 🎉 Success Indicators

Your system is working correctly when:

1. ✅ `docker ps` shows 9 containers (all "Up")
2. ✅ http://localhost:8001/docs loads Swagger UI
3. ✅ Patient query returns 7 patients
4. ✅ n8n UI accessible at http://localhost:5678
5. ✅ HCGateway app can login and sync data
6. ✅ No error logs in `docker logs cloudcare_patient_api`

---

**Everything configured and ready to use! 🚀**

For issues or questions, check the Troubleshooting section above.
