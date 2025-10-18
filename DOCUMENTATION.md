# CloudCare - Complete API Documentation

**Last Updated:** October 18, 2025  
**Version:** 2.0 (Simplified Schema)

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [API Reference](#api-reference)
4. [Testing Guide](#testing-guide)
5. [N8N Integration](#n8n-integration)
6. [Changelog](#changelog)

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/HackstersJr/cloudcare_IIST_innocooks.git
cd cloudcare_IIST_innocooks/backend

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Services

| Service | Port | URL | Documentation |
|---------|------|-----|---------------|
| Patient API | 8001 | http://localhost:8001 | http://localhost:8001/docs |
| Doctor API | 8002 | http://localhost:8002 | http://localhost:8002/docs |
| Hospital API | 8003 | http://localhost:8003 | http://localhost:8003/docs |
| Emergency API | 8004 | http://localhost:8004 | http://localhost:8004/docs |
| Wearables API | 8005 | http://localhost:8005 | http://localhost:8005/docs |
| N8N Automation | 5678 | http://localhost:5678 | - |
| PostgreSQL | 5432 | localhost:5432 | - |
| Redis | 6379 | localhost:6379 | - |

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend / Clients                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Patient API │   │  Doctor API  │   │ Hospital API │
│   Port 8001  │   │  Port 8002   │   │  Port 8003   │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Emergency API│   │ Wearables API│   │  N8N (Auto)  │
│  Port 8004   │   │  Port 8005   │   │  Port 5678   │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐        ┌──────────┐
        │  PostgreSQL  │        │  Redis   │
        │   Port 5432  │        │ Port 6379│
        └──────────────┘        └──────────┘
```

### Database Schema (Simplified)

**Core Models:**
- `Patient` - Patient information with emergency flags
- `Doctor` - Medical professionals  
- `Hospital` - Healthcare facilities
- `Record` - Medical records
- `Prescription` - Medication prescriptions
- `PatientCondition` - Health conditions
- `WearableData` - Device health data
- `UserLogin` - Authentication

---

## 📋 API Reference

### Patient API (Port 8001)

#### Create Patient
```bash
POST /api/patients
Content-Type: application/json

{
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "contact": "+1234567890",
  "familyContact": "+0987654321",
  "emergency": false
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "contact": "+1234567890",
  "familyContact": "+0987654321",
  "emergency": false,
  "aiAnalysis": null
}
```

#### Get Patient
```bash
GET /api/patients/{id}
```

#### List Patients
```bash
GET /api/patients?skip=0&limit=10&emergency_only=false
```

#### Update Patient
```bash
PUT /api/patients/{id}
Content-Type: application/json

{
  "age": 36,
  "emergency": true,
  "aiAnalysis": "High blood pressure detected"
}
```

#### Medical Records
```bash
# Add record
POST /api/patients/{id}/records?description=Checkup&date=2025-10-18T10:00:00

# Get records
GET /api/patients/{id}/records
```

#### Prescriptions
```bash
# Add prescription
POST /api/patients/{id}/prescriptions?medication=Aspirin&dosage=100mg&startDate=2025-10-18T10:00:00

# Get prescriptions
GET /api/patients/{id}/prescriptions
```

#### Conditions
```bash
# Add condition
POST /api/patients/{id}/conditions?condition=Hypertension&startDate=2025-10-18T10:00:00

# Get conditions
GET /api/patients/{id}/conditions
```

#### Emergency Management
```bash
# Set emergency flag
POST /api/patients/{id}/emergency?emergency=true&aiAnalysis=Critical

# Clear emergency flag
DELETE /api/patients/{id}/emergency
```

#### Doctor Assignment
```bash
# Get patient's doctors
GET /api/patients/{id}/doctors

# Assign doctor
POST /api/patients/{id}/doctors/{doctor_id}
```

### Doctor API (Port 8002)

#### Create Doctor
```bash
POST /api/doctors
Content-Type: application/json

{
  "name": "Dr. Sarah Smith",
  "age": 42,
  "gender": "female",
  "contact": "+1234567892",
  "specializations": "Cardiology",
  "hospitalId": 1
}
```

#### List Doctors
```bash
GET /api/doctors?specialization=Cardiology
```

### Hospital API (Port 8003)

#### Create Hospital
```bash
POST /api/hospitals
Content-Type: application/json

{
  "name": "Springfield General Hospital"
}
```

#### Get Hospital
```bash
GET /api/hospitals/{name}
```

---

## 🧪 Testing Guide

### Complete Workflow Test

```bash
#!/bin/bash

# 1. Create Hospital
curl -X POST http://localhost:8003/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{"name":"Springfield General"}'

# 2. Create Doctor
curl -X POST http://localhost:8002/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Dr. Smith",
    "age":42,
    "gender":"female",
    "contact":"+1234567892",
    "specializations":"Cardiology",
    "hospitalId":1
  }'

# 3. Create Patient
curl -X POST http://localhost:8001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "age":35,
    "gender":"male",
    "contact":"+1234567890",
    "familyContact":"+0987654321"
  }'

# 4. Assign Doctor to Patient
curl -X POST http://localhost:8001/api/patients/1/doctors/1

# 5. Add Medical Record
curl -X POST "http://localhost:8001/api/patients/1/records?description=Annual%20checkup&date=2025-10-18T10:00:00"

# 6. Add Prescription
curl -X POST "http://localhost:8001/api/patients/1/prescriptions?medication=Aspirin&dosage=100mg&startDate=2025-10-18T10:00:00"

# 7. Add Condition
curl -X POST "http://localhost:8001/api/patients/1/conditions?condition=Hypertension&startDate=2025-10-18T10:00:00"

# 8. Set Emergency
curl -X POST "http://localhost:8001/api/patients/1/emergency?emergency=true&aiAnalysis=Critical"

echo "✅ Workflow complete!"
```

### Interactive Testing

Visit Swagger UI for interactive testing:
- http://localhost:8001/docs (Patient API)
- http://localhost:8002/docs (Doctor API)
- http://localhost:8003/docs (Hospital API)

---

## 🔄 N8N Integration

### Access N8N
- URL: http://localhost:5678
- Username: `admin` (default)
- Password: `admin_password_change_me` (from .env)

### Database Configuration
N8N now uses PostgreSQL (`cloudcare_db`) for persistence.

### Common Workflows

1. **Patient Emergency Alert**
   - Trigger: Patient API webhook (emergency flag set)
   - Actions: Send SMS, email, notify hospital

2. **Wearable Data Sync**
   - Trigger: Schedule (every 5 minutes)
   - Actions: Pull data from wearable API, analyze, store

3. **Daily Reports**
   - Trigger: Schedule (daily at 9 AM)
   - Actions: Generate patient reports, email to doctors

---

## 📝 Changelog (October 2025)

### ✅ Major Changes

**Simplified Schema:**
- Removed complex enums and nested objects
- Changed from UUID to auto-increment IDs
- Consolidated 15+ field models to 6-8 field models
- Removed unused tables and relationships

**Auto-Migrations:**
- All services now auto-run Prisma migrations on startup
- Added `entrypoint.sh` script for migration handling
- Created initial migration: `20251018_init`

**Fixed Issues:**
- ✅ N8N database connection (was using SQLite, now PostgreSQL)
- ✅ Database type mismatch (`postgres` → `postgresdb`)
- ✅ Patient API fully updated and tested
- ✅ All 15+ patient endpoints working

**API Updates:**
- Patient API: 15+ working endpoints
- Simplified request/response models
- Integer IDs throughout
- Better error handling

---

## 🔧 Troubleshooting

### Services Not Starting

```bash
# Check status
docker-compose ps

# View logs
docker logs cloudcare_patient_api
docker logs hacksters  # n8n
docker logs hacksters-postgres
```

### Database Issues

```bash
# Access database
docker exec -it hacksters-postgres psql -U cloudcare -d cloudcare_db

# List tables
\dt

# View data
SELECT * FROM "Patient" LIMIT 10;
```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

### N8N Not Accessible

1. Check if service is running: `docker logs hacksters`
2. Verify port 5678 is not in use: `lsof -i :5678`
3. Check .env configuration
4. Restart: `docker-compose restart n8n`

---

## 📞 Support & Resources

- **Swagger Docs**: http://localhost:8001/docs (and other ports)
- **Repository**: https://github.com/HackstersJr/cloudcare_IIST_innocooks
- **Issues**: GitHub Issues

---

## 🎯 Next Steps

1. **For Development:**
   - Explore the Swagger UI for each API
   - Create test workflows in N8N
   - Connect your frontend application

2. **For Production:**
   - Update passwords in `.env`
   - Set up SSL/TLS certificates
   - Configure proper CORS origins
   - Enable rate limiting
   - Set up monitoring and logging

---

**Made with ❤️ for Healthcare Innovation**
