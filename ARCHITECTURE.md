# CloudCare API Architecture

## Overview

This document provides a detailed technical overview of the CloudCare 5-server architecture.

## System Architecture

### Microservices Design

CloudCare uses a microservices architecture with 5 independent FastAPI servers:

1. **Patient API (8001)** - Patient data management
2. **Doctor API (8002)** - Doctor data and assignments
3. **Hospital API (8003)** - Hospital operations and admissions
4. **Emergency API (8004)** - Real-time emergency alerts with SSE
5. **Wearables API (8005)** - Wearable device data integration

### Shared Database Pattern

All services connect to a single PostgreSQL database, ensuring:
- **Data Consistency**: Single source of truth
- **ACID Transactions**: Database-level transaction guarantees
- **Simplified Management**: One database to maintain
- **Join Efficiency**: Cross-service queries without API calls

### Database Design Philosophy

#### Normalization Strategy

The schema follows **Third Normal Form (3NF)**:

1. **First Normal Form (1NF)**
   - All attributes contain atomic values
   - Each record is unique
   - No repeating groups

2. **Second Normal Form (2NF)**
   - Meets 1NF requirements
   - No partial dependencies
   - All non-key attributes depend on the whole primary key

3. **Third Normal Form (3NF)**
   - Meets 2NF requirements
   - No transitive dependencies
   - Non-key attributes depend only on the primary key

#### Entity-Relationship Model

```
Patient ━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ║                               ║
   ║ (1:N)                    (1:N)║
   ║                               ║
   ▼                               ▼
PatientDoctor              PatientHospital
   ║                               ║
   ║ (N:1)                    (N:1)║
   ║                               ║
   ▼                               ▼
Doctor ━━━━━━━━━━━━━━━━━━━━━> Hospital
        (N:M via DoctorHospital)

Patient ━━━> MedicalRecord ━━━> Prescription
   ║              ║
   ║              ▼
   ║         (references)
   ║         WearableData
   ║              ▲
   ║              ║
   ▼              ║
WearableData ━━━━━┛
   ║
   ▼
ConsentRecord

Patient ━━━> EmergencyAlert
Patient ━━━> FamilyContact
Patient ━━━> PatientCondition
```

## API Specifications

### Patient API

**Responsibilities:**
- Patient CRUD operations
- Family contact management
- Patient condition tracking
- Medical record retrieval
- Emergency flag management

**Key Features:**
- Supports emergency flag for real-time alerts
- Links to wearable data
- Tracks current and previous doctors
- Hospital treatment history

### Doctor API

**Responsibilities:**
- Doctor CRUD operations
- Doctor availability management
- Patient assignment
- Hospital affiliation

**Key Features:**
- Specialization filtering
- Availability status
- Current and previous patient relationships
- Multi-hospital affiliations

### Hospital API

**Responsibilities:**
- Hospital CRUD operations
- Bed availability management
- Patient admission/discharge
- Doctor assignment
- Hospital statistics

**Key Features:**
- Real-time bed tracking
- Admission/discharge workflows
- Department-based doctor organization
- Emergency services flag

### Emergency API (SSE)

**Responsibilities:**
- Emergency alert creation
- Real-time alert broadcasting
- Alert status management
- Emergency statistics

**Key Features:**
- **Server-Sent Events (SSE)**: Real-time push notifications
- Alert severity levels (low, medium, high, critical)
- Responder tracking
- Trigger source tracking (wearable, manual, system)
- Automatic patient emergency flag management

**SSE Implementation:**
```python
# Server broadcasts to all connected clients
await emergency_queue.put(alert_data)

# Clients receive via EventSource API
const eventSource = new EventSource('/api/emergency/stream');
eventSource.addEventListener('emergency_alert', handler);
```

### Wearables API

**Responsibilities:**
- Wearable data synchronization
- Data encryption/decryption
- Consent management
- Vital signs retrieval

**Key Features:**
- **HCGateway Integration**: Compatible with existing wearable gateway
- **End-to-End Encryption**: Patient-specific encryption keys
- **Consent-Based Storage**: Requires patient consent
- **Multiple Data Types**: Heart rate, BP, SpO2, steps, sleep, etc.

**Data Encryption:**
```python
# Encryption follows HCGateway pattern
key = base64.urlsafe_b64encode(patient_id.encode().ljust(32)[:32])
fernet = Fernet(key)
encrypted = fernet.encrypt(json.dumps(data).encode())
```

## Data Flow Patterns

### 1. Patient Registration Flow

```
POST /api/patients
    ↓
Patient record created
    ↓
Family contacts created
    ↓
Return patient_id
```

### 2. Doctor-Patient Assignment Flow

```
POST /api/doctors/{doctor_id}/patients/{patient_id}
    ↓
Verify doctor exists
    ↓
Verify patient exists
    ↓
Create PatientDoctor relationship
    ↓
Set isCurrent = true
    ↓
Return success
```

### 3. Hospital Admission Flow

```
POST /api/hospitals/{hospital_name}/patients/{patient_id}/admit
    ↓
Check bed availability
    ↓
Create PatientHospital record
    ↓
Decrease available_beds
    ↓
Return admission confirmation
```

### 4. Emergency Alert Flow

```
POST /api/emergency/alerts
    ↓
Create EmergencyAlert record
    ↓
Set patient.emergency_flag = true
    ↓
Broadcast to SSE subscribers ← Real-time push
    ↓
Healthcare providers notified
    ↓
Responders acknowledge/respond
    ↓
Alert resolved
    ↓
Clear patient.emergency_flag
```

### 5. Wearable Data Sync Flow

```
POST /api/wearables/sync
    ↓
Verify patient exists
    ↓
Check consent
    ↓
For each data item:
    ↓
    Encrypt data with patient key
    ↓
    Create/update WearableData record
    ↓
    Link to patient
    ↓
Return sync confirmation
```

## Security Considerations

### Data Encryption

1. **Wearable Data**: Encrypted at rest using Fernet (symmetric encryption)
2. **Patient-Specific Keys**: Each patient has unique encryption key
3. **Consent Required**: Storage requires explicit patient consent

### Access Control

1. **Role-Based Access**: To be implemented via n8n + AI agent
2. **API Gateway**: Consider adding authentication layer
3. **Database Security**: Use connection pooling and prepared statements

### HIPAA Compliance Considerations

1. **Audit Logging**: All operations should be logged
2. **Data Encryption**: Sensitive data encrypted
3. **Access Controls**: Implement proper authentication
4. **Data Retention**: Define retention policies

## Performance Optimization

### Database Indexing

Key indexes defined in schema:
- `patientId` on Patient table
- `doctorId` on Doctor table
- `hospitalName` on Hospital table
- `dataType`, `recordedAt` on WearableData
- `status`, `severity` on EmergencyAlert

### Query Optimization

1. **Use Prisma's `include`**: Fetch related data in single query
2. **Pagination**: All list endpoints support skip/limit
3. **Filtering**: Where clauses to reduce data transfer
4. **Connection Pooling**: Shared Prisma client across requests

## Scalability Considerations

### Horizontal Scaling

Each API server can be independently scaled:
```yaml
docker-compose scale patient-api=3 doctor-api=2
```

### Load Balancing

Add nginx or API gateway:
```
Client → Load Balancer → API Servers → Database
```

### Caching Strategy

Consider Redis for:
- Frequently accessed patient data
- Hospital bed availability
- Doctor availability status

## Monitoring and Observability

### Health Checks

Each service exposes:
- `GET /` - Basic health check
- Database connection status
- Service version info

### Logging

Implement structured logging:
```python
logger.info("patient_created", patient_id=patient_id, timestamp=now())
```

### Metrics

Track:
- Request latency per endpoint
- Database query performance
- SSE connection count
- Active emergency alerts

## Integration Points

### n8n Workflows

APIs designed for workflow automation:
- Webhook-friendly endpoints
- JSON responses
- Standard HTTP status codes

### MCP Server Integration

Compatible with Model Context Protocol:
- RESTful design
- Predictable response formats
- Comprehensive documentation

### Frontend Chatbots

Real-time updates via:
- SSE for emergency alerts
- Polling for status updates
- WebSocket support (future)

## Future Enhancements

1. **Authentication & Authorization**
   - JWT tokens
   - OAuth2 integration
   - Role-based access control

2. **GraphQL API**
   - Unified query interface
   - Reduced over-fetching
   - Real-time subscriptions

3. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Event sourcing
   - CQRS pattern

4. **Advanced Analytics**
   - Patient outcome predictions
   - Resource optimization
   - Anomaly detection

5. **Mobile Support**
   - Native mobile apps
   - Push notifications
   - Offline capability

## Conclusion

The CloudCare architecture provides a solid foundation for a scalable, maintainable healthcare management system. The normalized database design ensures data integrity, while the microservices architecture allows independent scaling and development of each component.
