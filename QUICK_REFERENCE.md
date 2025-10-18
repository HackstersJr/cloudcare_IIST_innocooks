# CloudCare Quick Reference

## 🚀 Quick Start Commands

```bash
# Setup
cp .env.example .env
chmod +x setup.sh
./setup.sh

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f patient-api

# Restart a service
docker-compose restart patient-api
```

## 🌐 Service URLs

| Service | Port | URL | Docs |
|---------|------|-----|------|
| Patient API | 8001 | http://localhost:8001 | http://localhost:8001/docs |
| Doctor API | 8002 | http://localhost:8002 | http://localhost:8002/docs |
| Hospital API | 8003 | http://localhost:8003 | http://localhost:8003/docs |
| Emergency API | 8004 | http://localhost:8004 | http://localhost:8004/docs |
| Wearables API | 8005 | http://localhost:8005 | http://localhost:8005/docs |
| PostgreSQL | 5432 | localhost:5432 | - |

## 📊 Database Info

```bash
# Connection String
DATABASE_URL=postgresql://cloudcare:cloudcare_password@localhost:5432/cloudcare_db

# Connect via psql
docker-compose exec postgres psql -U cloudcare -d cloudcare_db

# List tables
\dt

# Describe table
\d patients
```

## 🔑 Key API Endpoints

### Patient API (:8001)
```bash
POST   /api/patients                      # Create patient
GET    /api/patients/{patient_id}         # Get patient
GET    /api/patients                      # List patients
PUT    /api/patients/{patient_id}         # Update patient
DELETE /api/patients/{patient_id}         # Delete patient
GET    /api/patients/{id}/family-contacts # Get contacts
POST   /api/patients/{id}/emergency       # Set emergency flag
```

### Doctor API (:8002)
```bash
POST   /api/doctors                         # Create doctor
GET    /api/doctors/{doctor_id}             # Get doctor
GET    /api/doctors                         # List doctors
PATCH  /api/doctors/{id}/availability       # Update availability
POST   /api/doctors/{id}/patients/{pid}     # Assign patient
GET    /api/doctors/{id}/patients           # Get patients
```

### Hospital API (:8003)
```bash
POST   /api/hospitals                           # Create hospital
GET    /api/hospitals/{hospital_name}           # Get hospital
GET    /api/hospitals                           # List hospitals
PATCH  /api/hospitals/{name}/beds               # Update beds
POST   /api/hospitals/{name}/patients/{pid}/admit    # Admit
POST   /api/hospitals/{name}/patients/{pid}/discharge # Discharge
GET    /api/hospitals/{name}/statistics         # Get stats
```

### Emergency API (:8004)
```bash
GET    /api/emergency/stream                     # SSE Stream
POST   /api/emergency/alerts                     # Create alert
GET    /api/emergency/alerts/{alert_id}          # Get alert
PATCH  /api/emergency/alerts/{id}/acknowledge    # Acknowledge
PATCH  /api/emergency/alerts/{id}/respond        # Respond
PATCH  /api/emergency/alerts/{id}/resolve        # Resolve
```

### Wearables API (:8005)
```bash
POST   /api/wearables/sync                       # Sync data
GET    /api/wearables/patients/{id}              # Get data
GET    /api/wearables/patients/{id}/latest       # Latest vitals
GET    /api/wearables/patients/{id}/decrypt/{did} # Decrypt
POST   /api/wearables/consent                    # Create consent
```

## 🗂️ Database Tables

**Core Tables:**
- `patients` - Patient information
- `doctors` - Doctor credentials
- `hospitals` - Hospital data

**Relationships:**
- `patient_doctors` - Patient-doctor links
- `patient_hospitals` - Admission history
- `doctor_hospitals` - Doctor affiliations

**Medical Data:**
- `medical_records` - Medical records
- `prescriptions` - Prescriptions
- `wearable_data` - Wearable device data
- `consent_records` - Data consent

**Emergency:**
- `emergency_alerts` - Emergency alerts
- `family_contacts` - Emergency contacts
- `patient_conditions` - Conditions

## 📝 Common Tasks

### Create Complete Patient Record
```bash
curl -X POST http://localhost:8001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "name": "John Doe",
    "age": 35,
    "date_of_birth": "1989-01-15",
    "gender": "male",
    "contact": "+1234567890",
    "email": "john@example.com",
    "address": {"city": "Springfield"},
    "blood_type": "O_POSITIVE",
    "allergies": ["penicillin"],
    "chronic_conditions": [],
    "family_contacts": []
  }'
```

### Assign Doctor to Patient
```bash
curl -X POST "http://localhost:8002/api/doctors/D001/patients/P001?relationship_type=current"
```

### Create Emergency Alert
```bash
curl -X POST http://localhost:8004/api/emergency/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "ALERT001",
    "patient_id": "P001",
    "alert_type": "cardiac_arrest",
    "severity": "critical",
    "description": "Emergency",
    "triggered_by": "wearable"
  }'
```

### Sync Wearable Data
```bash
curl -X POST http://localhost:8005/api/wearables/sync \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "method": "heartRate",
    "data": [{
      "metadata": {"id": "hr-001", "dataOrigin": "Apple Health"},
      "time": "2024-01-15T10:30:00Z",
      "value": 75
    }]
  }'
```

## 🔍 Debugging

### Check Service Health
```bash
curl http://localhost:8001/  # Returns service info
```

### View Service Logs
```bash
docker-compose logs -f patient-api
```

### Check Database Connection
```bash
docker-compose exec postgres pg_isready
```

### Restart All Services
```bash
docker-compose restart
```

### Reset Database (⚠️ Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

## 🎯 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Server Ports
PATIENT_API_PORT=8001
DOCTOR_API_PORT=8002
HOSPITAL_API_PORT=8003
EMERGENCY_API_PORT=8004
WEARABLES_API_PORT=8005

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# App Config
ENVIRONMENT=development
DEBUG=True
```

## 📚 Documentation Files

- `README.md` - Main documentation
- `ARCHITECTURE.md` - Technical architecture
- `API_TESTING_GUIDE.md` - Testing examples
- `PROJECT_SUMMARY.md` - Project overview
- `DIAGRAMS.md` - Visual diagrams
- `QUICK_REFERENCE.md` - This file

## 🛠️ Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Generate Prisma Client
prisma generate --schema=./prisma/schema.prisma

# Push schema to DB
prisma db push --schema=./prisma/schema.prisma

# Run single service (development)
cd patient-api && python main.py

# Format code
black .

# Type checking
mypy .
```

## 🔐 Security Notes

- Wearable data is **encrypted** with patient-specific keys
- Consent is **required** for wearable data storage
- Use **environment variables** for secrets
- Enable **HTTPS** in production
- Implement **authentication** before deployment

## 📊 Monitoring

### Key Metrics to Track:
- API response times
- Database connection pool usage
- Active SSE connections
- Emergency alert count
- Wearable data sync rate

### Health Check Endpoints:
```bash
curl http://localhost:8001/
curl http://localhost:8002/
curl http://localhost:8003/
curl http://localhost:8004/
curl http://localhost:8005/
```

## 🚨 Emergency Alert Flow

1. Create alert → `POST /api/emergency/alerts`
2. Alert broadcasts via SSE to all subscribers
3. Patient's `emergency_flag` set to `true`
4. Responders acknowledge → `PATCH /acknowledge`
5. Responders respond → `PATCH /respond`
6. Alert resolved → `PATCH /resolve`
7. Patient's `emergency_flag` cleared

## 📡 SSE Integration

### Frontend JavaScript:
```javascript
const eventSource = new EventSource(
  'http://localhost:8004/api/emergency/stream'
);

eventSource.addEventListener('emergency_alert', (event) => {
  const alert = JSON.parse(event.data);
  console.log('Emergency:', alert);
});
```

### Python Client:
```python
import sseclient
import requests

response = requests.get(
    'http://localhost:8004/api/emergency/stream',
    stream=True
)
client = sseclient.SSEClient(response)

for event in client.events():
    print(f"Event: {event.event}, Data: {event.data}")
```

## 📦 Project Structure

```
cloudcare_IIST_innocooks/
├── prisma/schema.prisma       # Database schema
├── shared/                    # Shared code
├── patient-api/               # Patient service
├── doctor-api/                # Doctor service
├── hospital-api/              # Hospital service
├── emergency-api/             # Emergency service (SSE)
├── wearables-api/             # Wearables service
├── docker-compose.yml         # Docker setup
└── *.md                       # Documentation
```

## 🎓 Key Concepts

**Normalization:** Database is in 3NF - no redundancy
**Microservices:** 5 independent FastAPI servers
**Shared DB:** All services use one PostgreSQL database
**SSE:** Real-time push notifications for emergencies
**Encryption:** Wearable data encrypted per-patient
**Consent:** Required for wearable data storage

## ✅ Pre-flight Checklist

Before deployment:
- [ ] Update `.env` with production values
- [ ] Change default passwords
- [ ] Enable HTTPS
- [ ] Set up authentication
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Load test SSE connections
- [ ] Verify data encryption
- [ ] Review security settings

---

**Need help?** Check the full documentation in README.md
**Issues?** Review ARCHITECTURE.md for design details
**Testing?** Follow API_TESTING_GUIDE.md
