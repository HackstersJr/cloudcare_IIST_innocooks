# CloudCare - 5 FastAPI Microservices Architecture

## 🏗️ Project Overview

CloudCare is a healthcare management system built with 5 independent FastAPI servers sharing a single PostgreSQL database. The system integrates wearable data from HCGateway and supports real-time emergency alerts via Server-Sent Events (SSE).

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (n8n + AI)                  │
│              (MCP Server + AI Agent + Chatbots)         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   API Gateway (Optional) │
        └────────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐  ┌───────▼──┐  ┌─────────▼────┐
│Patient │  │ Doctor   │  │  Hospital    │
│  API   │  │   API    │  │    API       │
│ :8001  │  │  :8002   │  │   :8003      │
└───┬────┘  └────┬─────┘  └──────┬───────┘
    │            │                │
    │  ┌─────────▼─────┐  ┌──────▼─────┐
    │  │  Emergency API │  │ Wearables  │
    │  │   (SSE) :8004  │  │   API      │
    │  └────────┬───────┘  │  :8005     │
    │           │          └──────┬─────┘
    └───────────┴──────────────────┘
                │
        ┌───────▼───────┐
        │   PostgreSQL   │
        │   Database     │
        │  (Shared DB)   │
        └────────────────┘
```

## 📊 Database Schema

### Normalized Design Principles

The database is normalized to 3NF with the following entity relationships:

**Core Entities:**
- `Patient` - Patient information and emergency flags
- `Doctor` - Doctor credentials and specializations
- `Hospital` - Hospital details and bed availability

**Relationship Tables (Junction Tables):**
- `PatientDoctor` - Current and previous doctor-patient relationships
- `PatientHospital` - Hospital admission/treatment history
- `DoctorHospital` - Doctor-hospital affiliations

**Supporting Tables:**
- `MedicalRecord` - Medical records with wearable data references
- `Prescription` - Past and current prescriptions
- `WearableData` - Encrypted wearable device data (HCGateway integration)
- `EmergencyAlert` - Real-time emergency alerts
- `FamilyContact` - Patient emergency contacts
- `PatientCondition` - Condition tracking
- `ConsentRecord` - Wearable data consent management

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Node.js (for Prisma CLI)

### Installation

1. **Clone the repository**
   ```bash
   cd cloudcare_IIST_innocooks
   ```

2. **Install Node.js dependencies (for Prisma)**
   ```bash
   npm install -g prisma
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma Client
   prisma generate --schema=./backend/prisma/schema.prisma
   
   # Run migrations
   prisma db push --schema=./backend/prisma/schema.prisma
   ```

6. **Run with Docker Compose (Recommended)**
   ```bash
   cd backend
   docker-compose up -d
   ```

   Or run each server individually:
   ```bash
   # Terminal 1 - Patient API
   cd backend/patient-api && python main.py
   
   # Terminal 2 - Doctor API
   cd backend/doctor-api && python main.py
   
   # Terminal 3 - Hospital API
   cd backend/hospital-api && python main.py
   
   # Terminal 4 - Emergency API (SSE)
   cd backend/emergency-api && python main.py
   
   # Terminal 5 - Wearables API
   cd backend/wearables-api && python main.py
   ```

## 📡 API Endpoints

### Patient API (Port 8001)

**Patient Management:**
- `POST /api/patients` - Create patient
- `GET /api/patients/{patient_id}` - Get patient by ID
- `GET /api/patients` - List all patients
- `PUT /api/patients/{patient_id}` - Update patient
- `DELETE /api/patients/{patient_id}` - Deactivate patient

**Family Contacts:**
- `GET /api/patients/{patient_id}/family-contacts` - Get contacts
- `POST /api/patients/{patient_id}/family-contacts` - Add contact

**Patient Conditions:**
- `GET /api/patients/{patient_id}/conditions` - Get conditions
- `POST /api/patients/{patient_id}/conditions` - Add condition

**Medical Records:**
- `GET /api/patients/{patient_id}/records` - Get all records

**Emergency Flag:**
- `POST /api/patients/{patient_id}/emergency` - Set emergency flag
- `DELETE /api/patients/{patient_id}/emergency` - Clear emergency flag

### Doctor API (Port 8002)

**Doctor Management:**
- `POST /api/doctors` - Create doctor
- `GET /api/doctors/{doctor_id}` - Get doctor by ID
- `GET /api/doctors` - List doctors (filter by specialization)
- `PUT /api/doctors/{doctor_id}` - Update doctor
- `PATCH /api/doctors/{doctor_id}/availability` - Update availability
- `DELETE /api/doctors/{doctor_id}` - Deactivate doctor

**Doctor-Patient Relationships:**
- `GET /api/doctors/{doctor_id}/patients` - Get doctor's patients
- `POST /api/doctors/{doctor_id}/patients/{patient_id}` - Assign patient
- `DELETE /api/doctors/{doctor_id}/patients/{patient_id}` - Remove patient

**Doctor-Hospital Relationships:**
- `GET /api/doctors/{doctor_id}/hospitals` - Get doctor's hospitals
- `POST /api/doctors/{doctor_id}/hospitals/{hospital_name}` - Assign to hospital

### Hospital API (Port 8003)

**Hospital Management:**
- `POST /api/hospitals` - Create hospital
- `GET /api/hospitals/{hospital_name}` - Get hospital
- `GET /api/hospitals` - List hospitals
- `PUT /api/hospitals/{hospital_name}` - Update hospital
- `PATCH /api/hospitals/{hospital_name}/beds` - Update bed availability
- `DELETE /api/hospitals/{hospital_name}` - Deactivate hospital

**Hospital Staff:**
- `GET /api/hospitals/{hospital_name}/doctors` - Get hospital doctors

**Hospital Patients:**
- `GET /api/hospitals/{hospital_name}/patients` - Get admitted patients
- `POST /api/hospitals/{hospital_name}/patients/{patient_id}/admit` - Admit patient
- `POST /api/hospitals/{hospital_name}/patients/{patient_id}/discharge` - Discharge patient

**Statistics:**
- `GET /api/hospitals/{hospital_name}/statistics` - Hospital stats

### Emergency API with SSE (Port 8004)

**Server-Sent Events (Real-time):**
- `GET /api/emergency/stream` - SSE endpoint for real-time alerts

**Emergency Alerts:**
- `POST /api/emergency/alerts` - Create emergency alert (broadcasts via SSE)
- `GET /api/emergency/alerts/{alert_id}` - Get alert
- `GET /api/emergency/alerts` - List alerts
- `GET /api/emergency/patients/{patient_id}/alerts` - Patient alerts

**Alert Status Management:**
- `PATCH /api/emergency/alerts/{alert_id}/acknowledge` - Acknowledge alert
- `PATCH /api/emergency/alerts/{alert_id}/respond` - Respond to alert
- `PATCH /api/emergency/alerts/{alert_id}/resolve` - Resolve alert
- `PATCH /api/emergency/alerts/{alert_id}/false-alarm` - Mark false alarm

**Statistics:**
- `GET /api/emergency/statistics` - Emergency system stats

### Wearables API (Port 8005)

**Wearable Data Sync (HCGateway Integration):**
- `POST /api/wearables/sync` - Sync wearable data from HCGateway
- `GET /api/wearables/patients/{patient_id}` - Get patient wearable data
- `GET /api/wearables/patients/{patient_id}/decrypt/{data_id}` - Decrypt data
- `GET /api/wearables/patients/{patient_id}/latest` - Latest vital signs

**Consent Management:**
- `POST /api/wearables/consent` - Create/update consent
- `GET /api/wearables/consent/{patient_id}` - Get consent status

**Statistics:**
- `GET /api/wearables/statistics` - Wearable system stats

## 🔐 Data Flow

### Wearable Data Flow

1. **HCGateway** collects data from wearable devices
2. Data is synced to **Wearables API** via `/api/wearables/sync`
3. Data is encrypted and stored in `WearableData` table
4. Consent is checked via `ConsentRecord` table
5. Medical records can reference wearable data IDs
6. Patient API can retrieve linked wearable data

### Emergency Alert Flow

1. **Trigger Source** (wearable, manual, system) creates alert
2. Alert posted to **Emergency API** `/api/emergency/alerts`
3. Patient's `emergency_flag` is set to `true`
4. Alert is broadcast to all SSE subscribers in real-time
5. Healthcare providers receive alert via SSE stream
6. Responders acknowledge/respond/resolve via API
7. On resolution, patient's `emergency_flag` is cleared

## 🔗 Frontend Integration (n8n + AI)

The backend is designed to integrate with:

1. **n8n Workflows** - Automation and orchestration
2. **MCP Server** - Model Context Protocol for AI
3. **AI Agent** - Role-based access and decision making
4. **Frontend Chatbots** - Patient and provider interfaces

**SSE Integration Example:**
```javascript
// Frontend code to listen to emergency alerts
const eventSource = new EventSource('http://localhost:8004/api/emergency/stream');

eventSource.addEventListener('emergency_alert', (event) => {
    const alert = JSON.parse(event.data);
    console.log('Emergency Alert:', alert);
    // Handle alert in UI
});
```

## 🗄️ Database Schema Highlights

### Key Relationships

- **Patient ↔ Doctor**: Many-to-many via `PatientDoctor` (tracks current/previous)
- **Patient ↔ Hospital**: Many-to-many via `PatientHospital` (admission history)
- **Doctor ↔ Hospital**: Many-to-many via `DoctorHospital` (affiliations)
- **Patient → WearableData**: One-to-many (all wearable records)
- **Patient → EmergencyAlert**: One-to-many (emergency history)
- **Patient → MedicalRecord**: One-to-many (medical history)
- **MedicalRecord → WearableData**: References via `wearable_data_ids` array

### Normalized Features

- **No Redundancy**: Doctor/hospital names not duplicated
- **Data Integrity**: Foreign key constraints ensure consistency
- **Audit Trail**: All tables have `createdAt` and `updatedAt`
- **Soft Deletes**: `isActive` flag for soft deletion
- **Flexible JSON**: `Json` fields for complex/evolving data structures

## 📝 Development Guidelines

### Adding New Endpoints

1. Add endpoint to appropriate API server (`patient-api`, `doctor-api`, etc.)
2. Use shared models from `shared/models.py`
3. Access database via `get_prisma()` dependency
4. Handle errors with proper HTTP status codes
5. Update this README with new endpoint documentation

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `prisma generate`
3. Run `prisma db push` (dev) or create migration (prod)
4. Update `shared/models.py` if needed
5. Test with all 5 API servers

### Testing

```bash
# Run individual API server tests
cd patient-api && pytest

# Test database connectivity
python -c "from shared.database import connect_db; import asyncio; asyncio.run(connect_db())"
```

## 🚨 Important Notes

1. **DO NOT create mock data** yet (as per requirements)
2. **Wearable data is encrypted** using patient-specific keys
3. **Consent is required** for wearable data storage
4. **Emergency alerts broadcast in real-time** via SSE
5. **All servers share one database** - no data duplication

## 🛠️ Technology Stack

- **Backend Framework**: FastAPI 0.109.0
- **Database**: PostgreSQL 15
- **ORM**: Prisma (via prisma-client-py)
- **Real-time**: Server-Sent Events (SSE)
- **Encryption**: Cryptography (Fernet)
- **Containerization**: Docker & Docker Compose
- **Python**: 3.11+

## 📚 Next Steps

1. ✅ Normalized Prisma schema created
2. ✅ 5 FastAPI servers implemented
3. ✅ Shared database configuration
4. ✅ Docker Compose setup
5. ⏳ Set up database and run migrations
6. ⏳ Test all API endpoints
7. ⏳ Integrate with n8n and MCP server
8. ⏳ Connect frontend chatbots
9. ⏳ Deploy to production

## 📞 API Health Check

```bash
# Check all services are running
curl http://localhost:8001/  # Patient API
curl http://localhost:8002/  # Doctor API
curl http://localhost:8003/  # Hospital API
curl http://localhost:8004/  # Emergency API
curl http://localhost:8005/  # Wearables API
```

## 🔧 Troubleshooting

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

**Prisma Issues:**
```bash
# Regenerate Prisma Client
prisma generate --schema=./prisma/schema.prisma

# Reset database (WARNING: deletes all data)
prisma db push --force-reset --schema=./prisma/schema.prisma
```

## 📄 License

Proprietary - CloudCare IIST Innocooks Project
