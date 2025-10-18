# CloudCare - Healthcare Management Platform# CloudCare - 5 FastAPI Microservices Architecture



A comprehensive healthcare management system built with microservices architecture, featuring patient management, doctor coordination, hospital operations, emergency services, and wearable device integration.## 🏗️ Project Overview



## 🌟 FeaturesCloudCare is a healthcare management system built with 5 independent FastAPI servers sharing a single PostgreSQL database. The system integrates wearable data from HCGateway and supports real-time emergency alerts via Server-Sent Events (SSE).



- **Patient Management**: Complete patient lifecycle management with medical records### Architecture

- **Doctor Portal**: Specialized healthcare provider management

- **Hospital Operations**: Multi-facility coordination system```

- **Emergency Services**: Real-time emergency case handling┌─────────────────────────────────────────────────────────┐

- **Wearable Integration**: Health monitoring device data collection│                    Frontend (n8n + AI)                  │

- **N8N Automation**: Workflow automation for healthcare processes│              (MCP Server + AI Agent + Chatbots)         │

- **Real-time Analytics**: AI-powered health insights and predictions└────────────────────┬────────────────────────────────────┘

                     │

## 🚀 Quick Start        ┌────────────┴────────────┐

        │   API Gateway (Optional) │

### Prerequisites        └────────────┬────────────┘

```bash                     │

- Docker & Docker Compose    ┌────────────────┼────────────────┐

- Git    │                │                │

```┌───▼────┐  ┌───────▼──┐  ┌─────────▼────┐

│Patient │  │ Doctor   │  │  Hospital    │

### Installation│  API   │  │   API    │  │    API       │

│ :8001  │  │  :8002   │  │   :8003      │

```bash└───┬────┘  └────┬─────┘  └──────┬───────┘

# 1. Clone the repository    │            │                │

git clone https://github.com/HackstersJr/cloudcare_IIST_innocooks.git    │  ┌─────────▼─────┐  ┌──────▼─────┐

cd cloudcare_IIST_innocooks/backend    │  │  Emergency API │  │ Wearables  │

    │  │   (SSE) :8004  │  │   API      │

# 2. Start all services    │  └────────┬───────┘  │  :8005     │

docker-compose up -d    │           │          └──────┬─────┘

    └───────────┴──────────────────┘

# 3. Verify deployment                │

docker-compose ps        ┌───────▼───────┐

```        │   PostgreSQL   │

        │   Database     │

### Access Points        │  (Shared DB)   │

        └────────────────┘

| Service | URL | Documentation |```

|---------|-----|---------------|

| Patient API | http://localhost:8001 | http://localhost:8001/docs |## 📊 Database Schema

| Doctor API | http://localhost:8002 | http://localhost:8002/docs |

| Hospital API | http://localhost:8003 | http://localhost:8003/docs |### Normalized Design Principles

| Emergency API | http://localhost:8004 | http://localhost:8004/docs |

| Wearables API | http://172.20.162.213:8005 | http://172.20.162.213:8005/docs |The database is normalized to 3NF with the following entity relationships:

| N8N Automation | http://localhost:5678 | - |

**Core Entities:**

## 📖 Documentation- `Patient` - Patient information and emergency flags

- `Doctor` - Doctor credentials and specializations

**📘 [Complete Documentation](./DOCUMENTATION.md)** - Comprehensive guide including:- `Hospital` - Hospital details and bed availability

- Full API reference with examples

- Architecture diagrams**Relationship Tables (Junction Tables):**

- Testing workflows- `PatientDoctor` - Current and previous doctor-patient relationships

- N8N integration guide- `PatientHospital` - Hospital admission/treatment history

- Troubleshooting tips- `DoctorHospital` - Doctor-hospital affiliations



## 🧪 Quick Test**Supporting Tables:**

- `MedicalRecord` - Medical records with wearable data references

```bash- `Prescription` - Past and current prescriptions

# Create a patient- `WearableData` - Encrypted wearable device data (HCGateway integration)

curl -X POST http://localhost:8001/api/patients \- `EmergencyAlert` - Real-time emergency alerts

  -H "Content-Type: application/json" \- `FamilyContact` - Patient emergency contacts

  -d '{- `PatientCondition` - Condition tracking

    "name": "John Doe",- `ConsentRecord` - Wearable data consent management

    "age": 35,

    "gender": "male",## 🚀 Quick Start

    "contact": "+1234567890"

  }'### Prerequisites



# Get patient- Python 3.11+

curl http://localhost:8001/api/patients/1- PostgreSQL 15+

```- Docker & Docker Compose (optional)

- Node.js (for Prisma CLI)

## 🏗️ Architecture

### Installation

```

Frontend/Clients1. **Clone the repository**

      │   ```bash

      ├─────┬─────┬─────┬─────┐   cd cloudcare_IIST_innocooks

      ▼     ▼     ▼     ▼     ▼   ```

   Patient Doctor Hospital Emergency Wearables

   (8001) (8002) (8003)  (8004)   (8005)2. **Install Node.js dependencies (for Prisma)**

      │     │     │       │       │   ```bash

      └─────┴─────┴───────┴───────┘   npm install -g prisma

              │   ```

         ┌────┴────┐

         ▼         ▼3. **Set up environment variables**

    PostgreSQL   Redis   ```bash

     (5432)     (6379)   cp .env.example .env

```   # Edit .env with your database credentials

   ```

### Microservices

- **Patient API** (8001): Patient data and medical records4. **Install Python dependencies**

- **Doctor API** (8002): Healthcare provider information   ```bash

- **Hospital API** (8003): Hospital and facility management   pip install -r backend/requirements.txt

- **Emergency API** (8004): Emergency case handling   ```

- **Wearables API** (8005): Device data ingestion

- **N8N** (5678): Workflow automation5. **Set up the database**

   ```bash

## 📊 Database Schema   # Generate Prisma Client

   prisma generate --schema=./backend/prisma/schema.prisma

### Core Models   

- `Patient` - Patient information with emergency flags   # Run migrations

- `Doctor` - Medical professionals with specializations   prisma db push --schema=./backend/prisma/schema.prisma

- `Hospital` - Healthcare facilities   ```

- `Record` - Medical records and history

- `Prescription` - Medication prescriptions6. **Run with Docker Compose (Recommended)**

- `PatientCondition` - Health conditions tracking   ```bash

- `WearableData` - Device health metrics   cd backend

   docker-compose up -d

## 🔧 Development   ```



### Project Structure   Or run each server individually:

```   ```bash

backend/   # Terminal 1 - Patient API

├── patient-api/       # Patient management   cd backend/patient-api && python main.py

├── doctor-api/        # Doctor management   

├── hospital-api/      # Hospital management   # Terminal 2 - Doctor API

├── emergency-api/     # Emergency services   cd backend/doctor-api && python main.py

├── wearables-api/     # Wearable integration   

├── shared/            # Shared code   # Terminal 3 - Hospital API

│   ├── models.py      # Pydantic models   cd backend/hospital-api && python main.py

│   ├── database.py    # DB connection   

│   └── entrypoint.sh  # Auto-migrations   # Terminal 4 - Emergency API (SSE)

├── prisma/            # Schema & migrations   cd backend/emergency-api && python main.py

└── docker-compose.yml # Orchestration   

```   # Terminal 5 - Wearables API

   cd backend/wearables-api && python main.py

### Useful Commands   ```



```bash## 📡 API Endpoints

# View logs

docker logs cloudcare_patient_api -f### Patient API (Port 8001)



# Rebuild a service**Patient Management:**

docker-compose up -d --build patient-api- `POST /api/patients` - Create patient

- `GET /api/patients/{patient_id}` - Get patient by ID

# Access database- `GET /api/patients` - List all patients

docker exec -it hacksters-postgres psql -U cloudcare -d cloudcare_db- `PUT /api/patients/{patient_id}` - Update patient

- `DELETE /api/patients/{patient_id}` - Deactivate patient

# Stop all services

docker-compose down**Family Contacts:**

- `GET /api/patients/{patient_id}/family-contacts` - Get contacts

# Reset everything (WARNING: deletes data)- `POST /api/patients/{patient_id}/family-contacts` - Add contact

docker-compose down -v

```**Patient Conditions:**

- `GET /api/patients/{patient_id}/conditions` - Get conditions

## 🔄 Recent Updates (October 2025)- `POST /api/patients/{patient_id}/conditions` - Add condition



### ✅ Completed**Medical Records:**

- ✅ Simplified database schema (integer IDs, removed complex enums)- `GET /api/patients/{patient_id}/records` - Get all records

- ✅ Patient API fully updated (15+ working endpoints)

- ✅ Auto-migrations on Docker startup**Emergency Flag:**

- ✅ Fixed N8N PostgreSQL connection- `POST /api/patients/{patient_id}/emergency` - Set emergency flag

- ✅ Consolidated documentation- `DELETE /api/patients/{patient_id}/emergency` - Clear emergency flag



### 🚧 In Progress### Doctor API (Port 8002)

- Doctor/Hospital/Emergency/Wearables API updates

- Frontend development**Doctor Management:**

- `POST /api/doctors` - Create doctor

## 🛠️ Tech Stack- `GET /api/doctors/{doctor_id}` - Get doctor by ID

- `GET /api/doctors` - List doctors (filter by specialization)

- **FastAPI** - Modern Python web framework- `PUT /api/doctors/{doctor_id}` - Update doctor

- **Prisma ORM** - Type-safe database access- `PATCH /api/doctors/{doctor_id}/availability` - Update availability

- **PostgreSQL** - Primary database with pgvector- `DELETE /api/doctors/{doctor_id}` - Deactivate doctor

- **Redis** - Caching and queues

- **N8N** - Workflow automation**Doctor-Patient Relationships:**

- **Docker** - Containerization- `GET /api/doctors/{doctor_id}/patients` - Get doctor's patients

- `POST /api/doctors/{doctor_id}/patients/{patient_id}` - Assign patient

## 🤝 Contributing- `DELETE /api/doctors/{doctor_id}/patients/{patient_id}` - Remove patient



1. Fork the repository**Doctor-Hospital Relationships:**

2. Create feature branch (`git checkout -b feature/amazing-feature`)- `GET /api/doctors/{doctor_id}/hospitals` - Get doctor's hospitals

3. Commit changes (`git commit -m 'Add amazing feature'`)- `POST /api/doctors/{doctor_id}/hospitals/{hospital_name}` - Assign to hospital

4. Push to branch (`git push origin feature/amazing-feature`)

5. Open Pull Request### Hospital API (Port 8003)



## 📄 License**Hospital Management:**

- `POST /api/hospitals` - Create hospital

MIT License - see LICENSE file for details.- `GET /api/hospitals/{hospital_name}` - Get hospital

- `GET /api/hospitals` - List hospitals

## 📞 Support- `PUT /api/hospitals/{hospital_name}` - Update hospital

- `PATCH /api/hospitals/{hospital_name}/beds` - Update bed availability

- **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)- `DELETE /api/hospitals/{hospital_name}` - Deactivate hospital

- **Issues**: [GitHub Issues](https://github.com/HackstersJr/cloudcare_IIST_innocooks/issues)

**Hospital Staff:**

---- `GET /api/hospitals/{hospital_name}/doctors` - Get hospital doctors



**Made with ❤️ for Healthcare Innovation****Hospital Patients:**

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
