# n8n Integration with CloudCare

## 🎯 Overview

CloudCare now includes **n8n** - a powerful workflow automation platform that can orchestrate all your healthcare APIs, create automated workflows, and integrate with external services.

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudCare + n8n Stack                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌──────────────────────────────────┐  │
│  │   n8n UI    │────▶│  n8n Main Container (5678)       │  │
│  │ (Browser)   │     │  - Workflow Editor               │  │
│  └─────────────┘     │  - Webhook Receiver              │  │
│                      │  - API Orchestrator              │  │
│                      └──────────────────────────────────┘  │
│                                 │                           │
│                      ┌──────────┴───────────┐              │
│                      ▼                      ▼              │
│         ┌──────────────────┐    ┌──────────────────┐      │
│         │  n8n Worker      │    │  Redis Queue     │      │
│         │  (Background)    │◀───│  (Bull Queue)    │      │
│         └──────────────────┘    └──────────────────┘      │
│                      │                                     │
│         ┌────────────┴────────────┐                        │
│         ▼                         ▼                        │
│  ┌──────────────┐        ┌──────────────────┐             │
│  │  PostgreSQL  │        │   CloudCare APIs │             │
│  │  (pgvector)  │◀───────│   - Patient      │             │
│  │              │        │   - Doctor       │             │
│  │  - n8n DB    │        │   - Hospital     │             │
│  │  - CloudCare │        │   - Emergency    │             │
│  │    DB        │        │   - Wearables    │             │
│  └──────────────┘        └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Update Environment Variables

```bash
# Copy the new .env.example
cp .env.example .env

# Edit .env and set these variables:
```

**Required n8n Variables:**
```bash
# PostgreSQL (shared database)
POSTGRES_USER=cloudcare
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=cloudcare_db

# Redis for n8n queue
REDIS_PASSWORD=your_redis_password_here

# n8n Authentication
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_admin_password_here

# n8n Encryption Key (generate new one!)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)

# n8n Base URL
N8N_BASE_URL=http://localhost:5678
```

### Step 2: Generate Encryption Key

```bash
# Generate a secure encryption key
openssl rand -hex 32

# Copy the output and paste it into N8N_ENCRYPTION_KEY in .env
```

### Step 3: Start All Services

```bash
# Start everything with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

**Expected Services:**
```
NAME                   STATUS    PORTS
hacksters-postgres     Up        0.0.0.0:5432->5432/tcp
hacksters-redis        Up        0.0.0.0:6379->6379/tcp
hacksters (n8n)        Up        0.0.0.0:5678->5678/tcp
hacksters-worker       Up
cloudcare_patient_api  Up        0.0.0.0:8001->8001/tcp
cloudcare_doctor_api   Up        0.0.0.0:8002->8002/tcp
cloudcare_hospital_api Up        0.0.0.0:8003->8003/tcp
cloudcare_emergency_api Up       0.0.0.0:8004->8004/tcp
cloudcare_wearables_api Up       0.0.0.0:8005->8005/tcp
```

### Step 4: Access n8n

Open your browser: **http://localhost:5678**

**Login with:**
- Username: Your `N8N_BASIC_AUTH_USER`
- Password: Your `N8N_BASIC_AUTH_PASSWORD`

---

## 🎨 n8n Features

### 1. Workflow Automation
- **Patient Onboarding:** Automatically create patient records, assign doctors
- **Emergency Alerts:** Trigger emergency workflows from wearable data
- **Appointment Reminders:** Send SMS/Email reminders
- **Report Generation:** Automated medical report compilation

### 2. API Orchestration
- Connect all 5 CloudCare APIs in one workflow
- Chain operations: Create patient → Assign doctor → Schedule appointment
- Error handling and retries

### 3. Integration Capabilities
- **Email:** SendGrid, Gmail, SMTP
- **SMS:** Twilio, Vonage
- **Chat:** Slack, Discord, Telegram
- **Cloud:** Google Sheets, Airtable
- **AI:** OpenAI, Anthropic
- **Webhooks:** Receive data from external systems

### 4. Background Processing
- Long-running tasks executed by n8n-worker
- Queue-based execution with Redis
- Parallel workflow execution

---

## 📱 Example Workflows

### Workflow 1: Emergency Alert System

```
Trigger: Emergency API webhook
  ↓
Check wearable data (Wearables API)
  ↓
If heart rate > 140 BPM:
  ↓
  ├─→ Update patient emergency flag (Patient API)
  ├─→ Notify assigned doctor (SMS via Twilio)
  ├─→ Alert nearest hospital (Hospital API)
  └─→ Send family notification (Email)
```

**n8n Nodes:**
1. Webhook Trigger
2. HTTP Request (Wearables API)
3. IF Node (Check HR > 140)
4. HTTP Request (Patient API - Update)
5. Twilio Node (Send SMS)
6. HTTP Request (Hospital API)
7. Email Node (Gmail)

### Workflow 2: Patient Onboarding

```
Trigger: New patient form submission
  ↓
Create patient record (Patient API)
  ↓
Assign doctor based on specialization (Doctor API)
  ↓
Register with hospital (Hospital API)
  ↓
Send welcome email with credentials
  ↓
Schedule first appointment
```

### Workflow 3: Daily Health Report

```
Schedule: Every day at 8 AM
  ↓
Fetch all patients (Patient API)
  ↓
For each patient:
  ├─→ Get latest wearable data (Wearables API)
  ├─→ Get medical records (Patient API)
  ├─→ Generate AI health summary (OpenAI)
  └─→ Send report to doctor (Email)
```

### Workflow 4: Wearable Data Sync

```
Trigger: Webhook from mobile app
  ↓
Authenticate user (Wearables API /login)
  ↓
Sync wearable data (Wearables API /sync)
  ↓
Check for anomalies
  ↓
If anomaly detected:
  └─→ Trigger emergency workflow
```

---

## 🔌 CloudCare API Endpoints for n8n

### Patient API (http://patient-api:8001)
```
GET    /api/patients           - List all patients
POST   /api/patients           - Create patient
GET    /api/patients/{id}      - Get patient details
PUT    /api/patients/{id}      - Update patient
DELETE /api/patients/{id}      - Delete patient
```

### Doctor API (http://doctor-api:8002)
```
GET    /api/doctors            - List all doctors
POST   /api/doctors            - Create doctor
GET    /api/doctors/{id}       - Get doctor details
PUT    /api/doctors/{id}       - Update doctor
```

### Hospital API (http://hospital-api:8003)
```
GET    /api/hospitals          - List all hospitals
POST   /api/hospitals          - Create hospital
GET    /api/hospitals/{id}     - Get hospital details
```

### Emergency API (http://emergency-api:8004)
```
GET    /api/emergency/stream   - SSE event stream
POST   /api/emergency/alerts   - Create alert
GET    /api/emergency/alerts   - List alerts
```

### Wearables API (http://wearables-api:8005)
```
POST   /api/v2/login                  - Login
POST   /api/v2/sync/{method}          - Sync data
POST   /api/v2/fetch/{method}         - Fetch data
GET    /api/v2/latest/{patient_id}    - Latest vitals
```

---

## 🔧 n8n Configuration

### Shared PostgreSQL Database

n8n and CloudCare APIs share the same PostgreSQL instance but use separate databases/schemas:

```
PostgreSQL (pgvector:pg17)
├── cloudcare_db (CloudCare data)
│   ├── Patient
│   ├── Doctor
│   ├── Hospital
│   └── ...
└── cloudcare_db (n8n uses same DB with separate tables)
    ├── n8n_workflow
    ├── n8n_execution
    └── ...
```

### Redis Queue

n8n uses Redis for:
- **Bull Queue:** Job queue management
- **Worker Communication:** Main n8n ↔ n8n-worker
- **Execution Queue:** Background workflow execution

### Volume Persistence

Data is persisted in `./volumes/`:
```
volumes/
├── pgdata/         - PostgreSQL data
├── redisdata/      - Redis data
├── .n8n/          - n8n main container data
└── .worker/       - n8n worker data
```

---

## 🛠️ Advanced Configuration

### Enable External Access

To access n8n from outside localhost:

```yaml
# docker-compose.yml
n8n:
  environment:
    N8N_EDITOR_BASE_URL: https://your-domain.com
    WEBHOOK_URL: https://your-domain.com
    N8N_SECURE_COOKIE: "true"
```

### SSL/TLS Configuration

Add reverse proxy (nginx/traefik) for HTTPS:

```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
```

### Scale Workers

Add more workers for parallel processing:

```yaml
# docker-compose.yml
n8n-worker-2:
  extends: n8n-worker
  container_name: hacksters-worker-2

n8n-worker-3:
  extends: n8n-worker
  container_name: hacksters-worker-3
```

---

## 📊 Monitoring

### Check Service Health

```bash
# View logs
docker-compose logs -f n8n
docker-compose logs -f n8n-worker

# Check resource usage
docker stats

# Access PostgreSQL
docker exec -it hacksters-postgres psql -U cloudcare -d cloudcare_db

# Access Redis
docker exec -it hacksters-redis redis-cli -a your_redis_password
```

### n8n Execution Stats

Access n8n UI → Settings → Execution Data to view:
- Workflow execution history
- Success/failure rates
- Execution times
- Error logs

---

## 🔐 Security Best Practices

### 1. Strong Passwords
```bash
# Generate strong passwords
openssl rand -base64 32
```

### 2. Encryption Key
```bash
# Generate unique encryption key
openssl rand -hex 32
```

### 3. Environment Variables
- Never commit `.env` to git
- Use secrets management in production
- Rotate credentials regularly

### 4. Network Security
- Use internal Docker network
- Expose only necessary ports
- Add firewall rules in production

### 5. Authentication
- Enable n8n basic auth
- Use JWT tokens for API access
- Implement OAuth for external integrations

---

## 📚 Example n8n Workflow JSON

### Emergency Alert Workflow

```json
{
  "name": "CloudCare Emergency Alert",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "emergency-alert"
    },
    {
      "name": "Get Patient Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "http://patient-api:8001/api/patients/={{$json.patientId}}",
        "method": "GET"
      }
    },
    {
      "name": "Check Heart Rate",
      "type": "n8n-nodes-base.if",
      "position": [650, 300],
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.heartRate}}",
              "operation": "larger",
              "value2": 140
            }
          ]
        }
      }
    },
    {
      "name": "Send Doctor SMS",
      "type": "n8n-nodes-base.twilio",
      "position": [850, 250],
      "parameters": {
        "message": "EMERGENCY: Patient {{$node['Get Patient Data'].json.name}} has elevated heart rate {{$json.heartRate}} BPM"
      }
    }
  ]
}
```

---

## 🎓 Learning Resources

### n8n Documentation
- Official Docs: https://docs.n8n.io/
- Workflow Templates: https://n8n.io/workflows/
- Community Forum: https://community.n8n.io/

### CloudCare API Docs
- Patient API: http://localhost:8001/docs
- Doctor API: http://localhost:8002/docs
- Hospital API: http://localhost:8003/docs
- Emergency API: http://localhost:8004/docs
- Wearables API: See `WEARABLES_API_DOCUMENTATION.md`

---

## 🐛 Troubleshooting

### n8n Won't Start

```bash
# Check logs
docker-compose logs n8n

# Common issues:
# 1. Encryption key not set
# 2. PostgreSQL not ready
# 3. Port 5678 already in use
```

### Worker Not Processing

```bash
# Check worker logs
docker-compose logs n8n-worker

# Verify Redis connection
docker exec -it hacksters-redis redis-cli -a your_password ping
```

### Database Connection Issues

```bash
# Test PostgreSQL
docker exec -it hacksters-postgres pg_isready

# Check connection from n8n
docker exec -it hacksters n8n healthcheck
```

### Workflow Execution Fails

1. Check workflow logs in n8n UI
2. Verify API endpoints are accessible
3. Check environment variables
4. Test APIs manually with curl

---

## 🚀 Production Deployment

### Environment Variables for Production

```bash
# Production .env
N8N_EDITOR_BASE_URL=https://n8n.yourdomain.com
WEBHOOK_URL=https://n8n.yourdomain.com
N8N_SECURE_COOKIE=true
N8N_BASIC_AUTH_ACTIVE=true

# Strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### Backup Strategy

```bash
# Backup PostgreSQL
docker exec hacksters-postgres pg_dump -U cloudcare cloudcare_db > backup.sql

# Backup n8n workflows
docker exec hacksters tar -czf - /home/node/.n8n > n8n_backup.tar.gz

# Backup Redis
docker exec hacksters-redis redis-cli -a password --rdb /data/dump.rdb
```

---

## 📞 Quick Reference

### Service URLs
| Service | URL | Purpose |
|---------|-----|---------|
| n8n UI | http://localhost:5678 | Workflow editor |
| Patient API | http://localhost:8001 | Patient management |
| Doctor API | http://localhost:8002 | Doctor management |
| Hospital API | http://localhost:8003 | Hospital management |
| Emergency API | http://localhost:8004 | Emergency alerts |
| Wearables API | http://localhost:8005 | Wearable data |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Queue |

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart n8n
docker-compose restart n8n

# View logs
docker-compose logs -f n8n

# Execute commands in n8n container
docker exec -it hacksters sh
```

---

## 🎉 You're Ready!

Your CloudCare system now has powerful workflow automation with n8n. You can:
- ✅ Orchestrate all 5 CloudCare APIs
- ✅ Create automated workflows
- ✅ Integrate with external services
- ✅ Process background jobs
- ✅ Handle webhooks
- ✅ Build complex healthcare automations

**Happy Automating! 🚀**
