# CloudCare API Testing Guide

This guide provides example API calls for testing all 5 CloudCare services.

## Prerequisites

Make sure all services are running:
```bash
docker-compose up -d
# or start each service individually
```

## Testing Tools

You can use:
- **curl** (command line)
- **Postman** (GUI)
- **HTTPie** (command line, user-friendly)
- **Thunder Client** (VS Code extension)

## 1. Patient API (Port 8001)

### Create a Patient

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
    "email": "john.doe@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701"
    },
    "blood_type": "O_POSITIVE",
    "allergies": ["penicillin"],
    "chronic_conditions": ["hypertension"],
    "family_contacts": [
      {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "contact": "+1234567891",
        "email": "jane.doe@example.com",
        "is_primary": true,
        "is_emergency_contact": true
      }
    ]
  }'
```

### Get Patient

```bash
curl http://localhost:8001/api/patients/P001
```

### List All Patients

```bash
curl "http://localhost:8001/api/patients?skip=0&limit=10"
```

### Set Emergency Flag

```bash
curl -X POST http://localhost:8001/api/patients/P001/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_type": "cardiac_arrest",
    "emergency_notes": "Patient reported chest pain"
  }'
```

### Get Patient Family Contacts

```bash
curl http://localhost:8001/api/patients/P001/family-contacts
```

## 2. Doctor API (Port 8002)

### Create a Doctor

```bash
curl -X POST http://localhost:8002/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "D001",
    "name": "Dr. Sarah Smith",
    "age": 42,
    "gender": "female",
    "contact": "+1234567892",
    "email": "dr.smith@hospital.com",
    "license_number": "MED12345",
    "specializations": ["Cardiology", "Internal Medicine"],
    "qualification": ["MD", "Board Certified Cardiologist"],
    "experience": 15
  }'
```

### Get Doctor

```bash
curl http://localhost:8002/api/doctors/D001
```

### List Doctors by Specialization

```bash
curl "http://localhost:8002/api/doctors?specialization=Cardiology"
```

### Update Doctor Availability

```bash
curl -X PATCH http://localhost:8002/api/doctors/D001/availability \
  -H "Content-Type: application/json" \
  -d '{"is_available": true}'
```

### Assign Patient to Doctor

```bash
curl -X POST "http://localhost:8002/api/doctors/D001/patients/P001?relationship_type=current"
```

### Get Doctor's Patients

```bash
curl "http://localhost:8002/api/doctors/D001/patients?current_only=true"
```

## 3. Hospital API (Port 8003)

### Create a Hospital

```bash
curl -X POST http://localhost:8003/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_name": "Springfield General Hospital",
    "registration_number": "HOS12345",
    "hospital_type": "government",
    "contact": "+1234567893",
    "email": "info@springfieldgeneral.com",
    "address": {
      "street": "456 Hospital Ave",
      "city": "Springfield",
      "state": "IL",
      "zip": "62702"
    },
    "website": "https://springfieldgeneral.com",
    "total_beds": 200,
    "available_beds": 150,
    "emergency_services": true,
    "specializations": ["Emergency", "Cardiology", "Surgery"],
    "accreditations": ["Joint Commission", "ISO 9001"]
  }'
```

### Get Hospital

```bash
curl http://localhost:8003/api/hospitals/Springfield%20General%20Hospital
```

### List Hospitals with Emergency Services

```bash
curl "http://localhost:8003/api/hospitals?emergency_only=true"
```

### Update Bed Availability

```bash
curl -X PATCH "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/beds?available_beds=145" \
  -H "Content-Type: application/json"
```

### Assign Doctor to Hospital

```bash
curl -X POST "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/doctors/D001" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Cardiology",
    "position": "Senior Cardiologist"
  }'
```

### Admit Patient

```bash
curl -X POST "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/patients/P001/admit" \
  -H "Content-Type: application/json" \
  -d '{
    "treatment_type": "inpatient",
    "department": "Cardiology",
    "reason": "Chest pain evaluation"
  }'
```

### Get Hospital Statistics

```bash
curl "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/statistics"
```

## 4. Emergency API (Port 8004)

### Test SSE Connection (Browser or EventSource client)

```javascript
// In browser console or Node.js
const eventSource = new EventSource('http://localhost:8004/api/emergency/stream');

eventSource.addEventListener('emergency_alert', (event) => {
    const alert = JSON.parse(event.data);
    console.log('Emergency Alert:', alert);
});

eventSource.addEventListener('ping', (event) => {
    console.log('Keepalive ping');
});
```

### Create Emergency Alert

```bash
curl -X POST http://localhost:8004/api/emergency/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "ALERT001",
    "patient_id": "P001",
    "hospital_id": "Springfield General Hospital",
    "alert_type": "cardiac_arrest",
    "severity": "critical",
    "description": "Patient experiencing cardiac arrest",
    "triggered_by": "wearable",
    "trigger_data": {
      "heart_rate": 0,
      "device": "Apple Watch"
    },
    "location": {
      "latitude": 39.7817,
      "longitude": -89.6501
    }
  }'
```

### Get Emergency Alert

```bash
curl http://localhost:8004/api/emergency/alerts/ALERT001
```

### List Active Emergency Alerts

```bash
curl "http://localhost:8004/api/emergency/alerts?active_only=true"
```

### Acknowledge Alert

```bash
curl -X PATCH "http://localhost:8004/api/emergency/alerts/ALERT001/acknowledge?responder_id=D001"
```

### Respond to Alert

```bash
curl -X PATCH http://localhost:8004/api/emergency/alerts/ALERT001/respond \
  -H "Content-Type: application/json" \
  -d '{
    "responder_id": "D001",
    "notes": "En route to patient location"
  }'
```

### Resolve Alert

```bash
curl -X PATCH http://localhost:8004/api/emergency/alerts/ALERT001/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolution_notes": "Patient stabilized and transported to hospital"
  }'
```

### Get Emergency Statistics

```bash
curl http://localhost:8004/api/emergency/statistics
```

## 5. Wearables API (Port 8005)

### Create Consent

```bash
curl -X POST http://localhost:8005/api/wearables/consent \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "consent_given": true,
    "data_types": ["heart_rate", "blood_pressure", "steps", "sleep"],
    "purpose": "Healthcare monitoring and emergency detection"
  }'
```

### Sync Wearable Data (HCGateway Format)

```bash
curl -X POST http://localhost:8005/api/wearables/sync \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "method": "heartRate",
    "data": [
      {
        "metadata": {
          "id": "hr-001",
          "dataOrigin": "Apple Health"
        },
        "time": "2024-01-15T10:30:00Z",
        "value": 75,
        "unit": "bpm"
      },
      {
        "metadata": {
          "id": "hr-002",
          "dataOrigin": "Apple Health"
        },
        "time": "2024-01-15T11:00:00Z",
        "value": 78,
        "unit": "bpm"
      }
    ]
  }'
```

### Get Patient Wearable Data

```bash
curl "http://localhost:8005/api/wearables/patients/P001?data_type=heart_rate&limit=10"
```

### Get Latest Vitals

```bash
curl http://localhost:8005/api/wearables/patients/P001/latest
```

### Get Decrypted Wearable Data

```bash
curl http://localhost:8005/api/wearables/patients/P001/decrypt/hr-001
```

### Get Consent Status

```bash
curl http://localhost:8005/api/wearables/consent/P001
```

### Get Wearables Statistics

```bash
curl http://localhost:8005/api/wearables/statistics
```

## Complete Workflow Test

Here's a complete workflow that tests the integration of all services:

```bash
#!/bin/bash

echo "=== CloudCare Complete Workflow Test ==="

# 1. Create Patient
echo -e "\n1. Creating patient..."
curl -X POST http://localhost:8001/api/patients \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","name":"John Doe","age":35,"date_of_birth":"1989-01-15","gender":"male","contact":"+1234567890","email":"john@example.com","address":{"city":"Springfield"},"blood_type":"O_POSITIVE","allergies":[],"chronic_conditions":[],"family_contacts":[]}'

# 2. Create Doctor
echo -e "\n\n2. Creating doctor..."
curl -X POST http://localhost:8002/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"doctor_id":"D001","name":"Dr. Smith","age":42,"gender":"female","contact":"+1234567892","email":"dr.smith@hospital.com","license_number":"MED12345","specializations":["Cardiology"],"qualification":["MD"],"experience":15}'

# 3. Create Hospital
echo -e "\n\n3. Creating hospital..."
curl -X POST http://localhost:8003/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{"hospital_name":"Springfield General Hospital","registration_number":"HOS12345","hospital_type":"government","contact":"+1234567893","email":"info@hospital.com","address":{"city":"Springfield"},"total_beds":200,"available_beds":150,"emergency_services":true,"specializations":["Cardiology"],"accreditations":[]}'

# 4. Assign Doctor to Hospital
echo -e "\n\n4. Assigning doctor to hospital..."
curl -X POST "http://localhost:8002/api/doctors/D001/hospitals/Springfield%20General%20Hospital" \
  -H "Content-Type: application/json" \
  -d '{"department":"Cardiology","position":"Senior"}'

# 5. Assign Patient to Doctor
echo -e "\n\n5. Assigning patient to doctor..."
curl -X POST "http://localhost:8002/api/doctors/D001/patients/P001?relationship_type=current"

# 6. Create Wearable Consent
echo -e "\n\n6. Creating wearable consent..."
curl -X POST http://localhost:8005/api/wearables/consent \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","consent_given":true,"data_types":["heart_rate"],"purpose":"Healthcare monitoring"}'

# 7. Sync Wearable Data
echo -e "\n\n7. Syncing wearable data..."
curl -X POST http://localhost:8005/api/wearables/sync \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","method":"heartRate","data":[{"metadata":{"id":"hr-001","dataOrigin":"Apple Health"},"time":"2024-01-15T10:30:00Z","value":75}]}'

# 8. Create Emergency Alert
echo -e "\n\n8. Creating emergency alert..."
curl -X POST http://localhost:8004/api/emergency/alerts \
  -H "Content-Type: application/json" \
  -d '{"alert_id":"ALERT001","patient_id":"P001","hospital_id":"Springfield General Hospital","alert_type":"cardiac_arrest","severity":"critical","description":"Cardiac arrest detected","triggered_by":"wearable"}'

# 9. Admit Patient to Hospital
echo -e "\n\n9. Admitting patient to hospital..."
curl -X POST "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/patients/P001/admit" \
  -H "Content-Type: application/json" \
  -d '{"treatment_type":"emergency","department":"Cardiology","reason":"Cardiac emergency"}'

# 10. Get Hospital Statistics
echo -e "\n\n10. Getting hospital statistics..."
curl "http://localhost:8003/api/hospitals/Springfield%20General%20Hospital/statistics"

echo -e "\n\n=== Workflow Test Complete ==="
```

## Testing with Postman

1. Import the following as a Postman collection
2. Set `{{base_url_patient}}` = `http://localhost:8001`
3. Set `{{base_url_doctor}}` = `http://localhost:8002`
4. Set `{{base_url_hospital}}` = `http://localhost:8003`
5. Set `{{base_url_emergency}}` = `http://localhost:8004`
6. Set `{{base_url_wearables}}` = `http://localhost:8005`

## Troubleshooting

### Service Not Responding

```bash
# Check if service is running
docker-compose ps

# View service logs
docker-compose logs patient-api
docker-compose logs doctor-api
# etc.
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U cloudcare -d cloudcare_db

# List tables
\dt
```

### Clear All Data (Reset)

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart
docker-compose up -d
```

## API Documentation

Each service provides interactive API documentation at:

- Patient API: http://localhost:8001/docs
- Doctor API: http://localhost:8002/docs
- Hospital API: http://localhost:8003/docs
- Emergency API: http://localhost:8004/docs
- Wearables API: http://localhost:8005/docs

Use these Swagger UI interfaces to explore and test endpoints interactively!
