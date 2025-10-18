# CloudCare System Diagrams

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                         │
│              (n8n Workflows + MCP + AI Agent)                  │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
    ┌──────────────────┴───────────────────┐
    │                                      │
    │        API LAYER (5 Servers)         │
    │                                      │
    ├──────┬──────┬──────┬──────┬──────────┤
    │      │      │      │      │          │
┌───▼──┐ ┌─▼───┐ ┌▼────┐ ┌▼────┐ ┌────────▼─┐
│Patient│Doctor │Hosp.│Emerg │Wearables│
│ :8001│ :8002│ :8003│ :8004│  :8005   │
│ API  │  API │  API │ API  │   API    │
│      │      │      │ (SSE)│(HCGateway│
└───┬──┘ └──┬──┘ └──┬─┘ └──┬─┘ └────┬────┘
    │       │       │      │        │
    └───────┴───────┴──────┴────────┘
            │
            │ Prisma ORM
            │
    ┌───────▼────────┐
    │   PostgreSQL   │
    │    Database    │
    │  (Shared DB)   │
    └────────────────┘
```

## Database Entity-Relationship Diagram

```
┌──────────────┐
│   Patient    │
│──────────────│
│ id (PK)      │ 1────────────┐
│ patientId    │              │
│ name         │              │
│ age          │              │
│ gender       │              │ N
│ contact      │         ┌────▼──────────┐
│ emergency    │         │PatientDoctor  │
│ flag (bool)  │         │───────────────│
└──────┬───────┘         │ id (PK)       │
       │                 │ patientId (FK)│
       │                 │ doctorId (FK) │
       │                 │ isCurrent     │
       │                 │ relationship  │
       │ 1               └────┬──────────┘
       │                      │ N
       │                      │
       │ N              ┌─────▼─────┐
       │                │  Doctor   │
       │                │───────────│
       │                │ id (PK)   │
       │                │ doctorId  │
       │ 1              │ name      │
       │                │ special.  │
  ┌────▼────────────┐   └─────┬─────┘
  │PatientHospital  │         │
  │─────────────────│         │ N
  │ id (PK)         │         │
  │ patientId (FK)  │   ┌─────▼──────────┐
  │ hospitalId (FK) │   │ DoctorHospital │
  │ admission       │   │────────────────│
  │ discharge       │   │ id (PK)        │
  └─────┬───────────┘   │ doctorId (FK)  │
        │               │ hospitalId(FK) │
        │ N             │ department     │
        │               └────┬───────────┘
  ┌─────▼─────┐             │
  │ Hospital  │             │ N
  │───────────│◄────────────┘
  │ id (PK)   │
  │ name      │
  │ beds      │
  └───────────┘

┌──────────────┐
│   Patient    │
├──────────────┤
│              │ 1
│              ├────┐
│              │    │
└──────────────┘    │ N
                    │
          ┌─────────▼──────────┐
          │  MedicalRecord     │
          │────────────────────│
          │ id (PK)            │
          │ patientId (FK)     │
          │ doctorId (FK)      │
          │ diagnosis          │
          │ wearableDataIds[]  │← References
          └────────────────────┘

┌──────────────┐
│   Patient    │
├──────────────┤
│              │ 1
│              ├────┐
│              │    │
└──────────────┘    │ N
                    │
          ┌─────────▼──────────┐
          │  WearableData      │
          │────────────────────│
          │ id (PK)            │
          │ patientId (FK)     │
          │ dataType           │
          │ encryptedData      │
          │ consentId (FK)     │
          └────┬───────────────┘
               │ N
               │
          ┌────▼───────────┐
          │ ConsentRecord  │
          │────────────────│
          │ id (PK)        │
          │ patientId (FK) │
          │ consentGiven   │
          └────────────────┘

┌──────────────┐
│   Patient    │
├──────────────┤
│              │ 1
│              ├────┐
└──────────────┘    │ N
                    │
          ┌─────────▼──────────┐
          │  EmergencyAlert    │
          │────────────────────│
          │ id (PK)            │
          │ patientId (FK)     │
          │ alertType          │
          │ severity           │
          │ status             │
          │ triggeredBy        │
          └────────────────────┘
```

## Data Flow: Emergency Alert

```
1. Wearable Device
        │
        │ Abnormal Reading Detected
        ▼
2. HCGateway / Manual Trigger
        │
        │ POST /api/emergency/alerts
        ▼
3. Emergency API
        │
        ├─► Create EmergencyAlert record
        │
        ├─► Set Patient.emergencyFlag = true
        │
        ├─► Broadcast via SSE
        │
        ▼
4. SSE Event Stream
        │
        ├─► Frontend Chatbots
        │
        ├─► n8n Workflows
        │
        └─► Healthcare Providers
                │
                ▼
5. Response Actions
        │
        ├─► Acknowledge Alert
        │
        ├─► Respond to Scene
        │
        ├─► Update Status
        │
        └─► Resolve Alert
                │
                ▼
6. Clear Patient.emergencyFlag = false
```

## Data Flow: Wearable Data Sync

```
1. Wearable Device (Apple Watch, Fitbit, etc.)
        │
        │ Collects Health Data
        ▼
2. HCGateway (Existing System)
        │
        │ Aggregates & Formats
        ▼
3. POST /api/wearables/sync
        │
        │ {
        │   patient_id: "P001",
        │   method: "heartRate",
        │   data: [...]
        │ }
        ▼
4. Wearables API
        │
        ├─► Check Patient Exists
        │
        ├─► Verify Consent
        │
        ├─► Encrypt Data (patient key)
        │
        └─► Store in WearableData table
                │
                ▼
5. Medical Records Reference
        │
        │ wearableDataIds: ["wd-001", "wd-002"]
        ▼
6. Available for:
        │
        ├─► Patient API (records)
        │
        ├─► Doctor API (diagnosis)
        │
        └─► Emergency API (triggers)
```

## Microservices Communication

```
┌────────────────────────────────────────────────────────┐
│                    Shared Database                     │
│                      PostgreSQL                        │
└─────┬────────┬────────┬────────┬────────┬─────────────┘
      │        │        │        │        │
      │        │        │        │        │
      ▼        ▼        ▼        ▼        ▼
  ┌───────┐┌───────┐┌────────┐┌────────┐┌──────────┐
  │Patient││Doctor ││Hospital││Emergency││Wearables │
  │  API  ││  API  ││  API   ││  API   ││   API    │
  └───┬───┘└───┬───┘└────┬───┘└────┬───┘└────┬─────┘
      │        │         │         │         │
      └────────┴─────────┴─────────┴─────────┘
              │
              │ All services read/write
              │ to same database
              ▼
      Direct database joins
      No inter-service API calls
      Shared data consistency
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Compose                     │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         PostgreSQL Container              │  │
│  │  Port: 5432                               │  │
│  │  Volume: postgres_data                    │  │
│  └────────────┬─────────────────────────────┘  │
│               │                                 │
│  ┌────────────┴─────────────────────────────┐  │
│  │    API Containers (5 services)           │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ Patient API    :8001                │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ Doctor API     :8002                │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ Hospital API   :8003                │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ Emergency API  :8004 (SSE)          │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ Wearables API  :8005                │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                  │
                  │ Network: cloudcare_network
                  ▼
         Exposed Ports: 5432, 8001-8005
```

## Normalization Example

### Before Normalization (1NF violation):
```
Patient Table:
┌───────┬──────┬──────────────────┬───────────────────┐
│ ID    │ Name │ Doctors          │ Hospitals         │
├───────┼──────┼──────────────────┼───────────────────┤
│ P001  │ John │ Dr.Smith,Dr.Jane │ SGH,City Hospital │
└───────┴──────┴──────────────────┴───────────────────┘
Problems:
- Multiple values in single field
- Cannot track relationship details
- Update anomalies
```

### After Normalization (3NF):
```
Patient Table:
┌───────┬──────┐
│ ID    │ Name │
├───────┼──────┤
│ P001  │ John │
└───────┴──────┘

PatientDoctor Table:
┌───────────┬──────────┬───────────┬───────────┐
│ PatientID │ DoctorID │ IsCurrent │ StartDate │
├───────────┼──────────┼───────────┼───────────┤
│ P001      │ D001     │ true      │ 2024-01   │
│ P001      │ D002     │ false     │ 2023-06   │
└───────────┴──────────┴───────────┴───────────┘

PatientHospital Table:
┌───────────┬────────────┬───────────┬───────────┐
│ PatientID │ HospitalID │ Admission │ Discharge │
├───────────┼────────────┼───────────┼───────────┤
│ P001      │ H001       │ 2024-01   │ 2024-02   │
└───────────┴────────────┴───────────┴───────────┘

Benefits:
✓ No redundancy
✓ Track relationship history
✓ No update anomalies
✓ Scalable structure
```

## SSE (Server-Sent Events) Flow

```
Backend (Emergency API)
        │
        │ Emergency Alert Created
        ▼
   emergency_queue.put(alert)
        │
        ▼
   Event Generator
        │
        ├─► Connection 1 (n8n)
        │   └─► Workflow Triggered
        │
        ├─► Connection 2 (Frontend)
        │   └─► UI Alert Displayed
        │
        └─► Connection 3 (Mobile App)
            └─► Push Notification

Frontend JavaScript:
const es = new EventSource('/api/emergency/stream');
es.addEventListener('emergency_alert', (e) => {
    const alert = JSON.parse(e.data);
    showAlert(alert); // Display to user
});
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│                                         │
│  FastAPI (Python 3.11)                  │
│  ├─ REST API Framework                  │
│  ├─ Async/Await Support                 │
│  ├─ Auto-generated OpenAPI Docs         │
│  └─ SSE (Server-Sent Events)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         ORM Layer                       │
│                                         │
│  Prisma (prisma-client-py)              │
│  ├─ Type-safe Database Client           │
│  ├─ Schema Definition                   │
│  ├─ Migration Management                │
│  └─ Query Builder                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Database Layer                  │
│                                         │
│  PostgreSQL 15                          │
│  ├─ ACID Transactions                   │
│  ├─ Foreign Keys                        │
│  ├─ Indexes                             │
│  └─ JSON Support                        │
└─────────────────────────────────────────┘

Supporting Technologies:
├─ Pydantic         (Data Validation)
├─ Cryptography     (Data Encryption)
├─ Docker           (Containerization)
├─ Docker Compose   (Orchestration)
└─ SSE-Starlette    (Real-time Events)
```

---

These diagrams provide a visual understanding of the CloudCare architecture,
data flows, and system design principles.
