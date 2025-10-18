# Wearables API Documentation

## Overview

The CloudCare Wearables API is **HCGateway v2 compatible** and provides seamless integration with wearable health devices. It uses Bearer token authentication and MongoDB-style encrypted data storage.

---

## Base URL

```
http://localhost:8005
```

---

## Authentication

### HCGateway v2 Bearer Token Authentication

All endpoints (except `/api/v2/login` and `/api/v2/refresh`) require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_token>
```

---

## Endpoints

### 1. Root

```http
GET /
```

Returns service information.

**Response:**
```json
{
  "service": "wearables-gateway",
  "version": "v2",
  "endpoints": ["/api/v2/"],
  "description": "HCGateway v2 compatible API with Bearer token authentication"
}
```

---

### 2. Health Check

```http
GET /health
```

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "wearables",
  "version": "v2"
}
```

---

## Authentication Endpoints

### 3. Login

```http
POST /api/v2/login
```

Create new user or authenticate existing user. Returns Bearer token.

**Request Body:**
```json
{
  "username": "patient@email.com",
  "password": "secure_password",
  "fcmToken": "optional_fcm_token_for_push_notifications"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "refresh_token_string",
  "expiry": "2024-10-19T10:30:00Z"
}
```

**Notes:**
- If user doesn't exist, creates new account
- If user exists, verifies password
- Token expires in 12 hours
- Store the token securely and include in all subsequent requests

---

### 4. Refresh Token

```http
POST /api/v2/refresh
```

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refresh": "your_refresh_token"
}
```

**Response (200 OK):**
```json
{
  "token": "new_access_token",
  "refresh": "same_refresh_token",
  "expiry": "2024-10-19T22:30:00Z"
}
```

---

### 5. Revoke Token

```http
DELETE /api/v2/revoke
```

Revoke current access token (logout).

**Headers:**
```http
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true
}
```

---

## Wearable Data Sync Endpoints

### 6. Sync Wearable Data

```http
POST /api/v2/sync/{method}
```

Upload health data from wearable devices. **HCGateway v2 compatible format.**

**Path Parameters:**
- `method` - Data type: `heartrate`, `steps`, `sleep`, `bloodpressure`, etc.

**Headers:**
```http
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": [
    {
      "metadata": {
        "id": "unique_measurement_id",
        "dataOrigin": "Fitbit Charge 5"
      },
      "time": "2024-10-18T14:30:00Z",
      "heartRate": 75,
      "steps": 8500
    }
  ]
}
```

**For time-range data (sleep, exercise):**
```json
{
  "data": [
    {
      "metadata": {
        "id": "sleep_session_123",
        "dataOrigin": "Apple Watch"
      },
      "startTime": "2024-10-17T22:00:00Z",
      "endTime": "2024-10-18T06:30:00Z",
      "sleepHours": 8.5,
      "sleepQuality": "good"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "synced": 1
}
```

**Supported Data Types:**
- `heartrate` - Heart rate measurements
- `steps` - Step count
- `sleep` - Sleep duration and quality
- `bloodpressure` - Blood pressure readings
- `oxygen` - Blood oxygen levels
- `temperature` - Body temperature
- `weight` - Weight measurements
- `glucose` - Blood glucose levels
- `activity` - Activity/exercise data

---

### 7. Fetch Wearable Data

```http
POST /api/v2/fetch/{method}
```

Retrieve synced wearable data for the authenticated user.

**Path Parameters:**
- `method` - Data type to fetch

**Headers:**
```http
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "queries": {}
}
```

**Response (200 OK):**
```json
[
  {
    "_id": "measurement_id_1",
    "id": "measurement_id_1",
    "data": {
      "heartRate": 75,
      "steps": 8500
    },
    "app": "Fitbit Charge 5",
    "start": "2024-10-18T14:30:00Z",
    "end": null
  },
  {
    "_id": "sleep_session_123",
    "id": "sleep_session_123",
    "data": {
      "sleepHours": 8.5,
      "sleepQuality": "good"
    },
    "app": "Apple Watch",
    "start": "2024-10-17T22:00:00Z",
    "end": "2024-10-18T06:30:00Z"
  }
]
```

---

### 8. Delete Wearable Data

```http
DELETE /api/v2/sync/{method}
```

Delete synced wearable data from database.

**Path Parameters:**
- `method` - Data type

**Headers:**
```http
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true
}
```

---

## Additional Endpoints

### 9. Get Latest Vitals

```http
GET /api/v2/latest/{patient_id}
```

Get latest vital signs for a specific patient.

**Path Parameters:**
- `patient_id` - Patient ID (integer)

**Response (200 OK):**
```json
{
  "patientId": 1,
  "timestamp": "2024-10-18T14:30:00Z",
  "heartRate": 75,
  "steps": 8500,
  "sleepHours": 7.5,
  "oxygenLevel": 98.0
}
```

---

## Data Format

### HCGateway v2 Compatible Format

#### Single Timestamp Measurement
```json
{
  "metadata": {
    "id": "unique_id",
    "dataOrigin": "Device Name"
  },
  "time": "ISO8601_timestamp",
  "heartRate": 75,
  "steps": 8500,
  "oxygenLevel": 98.0
}
```

#### Time Range Measurement
```json
{
  "metadata": {
    "id": "unique_id",
    "dataOrigin": "Device Name"
  },
  "startTime": "ISO8601_timestamp",
  "endTime": "ISO8601_timestamp",
  "sleepHours": 8.5,
  "calories": 2100
}
```

### Supported Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `heartRate` | int | Heart rate in BPM |
| `steps` | int | Step count |
| `sleepHours` | float | Sleep duration in hours |
| `oxygenLevel` | float | Blood oxygen % (SpO2) |
| `bloodPressure` | object | `{systolic: 120, diastolic: 80}` |
| `temperature` | float | Body temperature in °C |
| `weight` | float | Weight in kg |
| `glucose` | float | Blood glucose in mg/dL |
| `calories` | int | Calories burned |
| `distance` | float | Distance in km |

---

## Encryption

All wearable data is encrypted using **Fernet symmetric encryption** with patient-specific keys derived from user passwords. This follows the HCGateway security model.

**Encryption Process:**
1. User password is hashed
2. Hash is used to derive encryption key
3. Data is encrypted with Fernet
4. Encrypted data is stored in database
5. Data is decrypted on retrieval using same key

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "No token provided. Include 'Authorization: Bearer <token>' header"
}
```

### 401 Unauthorized
```json
{
  "detail": "No token provided. Include 'Authorization: Bearer <token>' header"
}
```

### 403 Forbidden
```json
{
  "detail": "Invalid token"
}
```

### 404 Not Found
```json
{
  "detail": "No patient linked to this account"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error message details"
}
```

---

## Example Workflows

### Complete Workflow: Login and Sync Data

#### Step 1: Login
```bash
curl -X POST http://localhost:8005/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient@example.com",
    "password": "secure_password"
  }'
```

**Save the token from response**

#### Step 2: Sync Heart Rate Data
```bash
curl -X POST http://localhost:8005/api/v2/sync/heartrate \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "metadata": {
        "id": "hr_20241018_143000",
        "dataOrigin": "Fitbit Charge 5"
      },
      "time": "2024-10-18T14:30:00Z",
      "heartRate": 75
    }]
  }'
```

#### Step 3: Fetch Data
```bash
curl -X POST http://localhost:8005/api/v2/fetch/heartrate \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"queries": {}}'
```

---

## Integration with HCGateway Mobile Apps

This API is **100% compatible** with existing HCGateway mobile applications (Android/iOS) that use the v2 API. Simply point your app's backend URL to:

```
http://your-server:8005/api/v2/
```

All existing HCGateway v2 functionality will work seamlessly:
- Login with Bearer tokens
- Sync data from Health Connect / HealthKit
- Fetch historical data
- Push notifications (FCM)
- Data encryption

---

## Security Best Practices

1. **Always use HTTPS in production** - Never send tokens over HTTP
2. **Store tokens securely** - Use secure storage (Keychain, EncryptedSharedPreferences)
3. **Implement token refresh** - Refresh tokens before expiry
4. **Handle 403 errors** - Re-authenticate if token is invalid
5. **Encrypt sensitive data** - All wearable data is automatically encrypted
6. **Validate input** - API validates all incoming data

---

## Database Schema

The wearables API uses the following simplified schema:

```prisma
model WearableData {
  id          Int       @id @default(autoincrement())
  patient     Patient   @relation(fields: [patientId], references: [id])
  patientId   Int
  record      Record?   @relation(fields: [recordId], references: [id])
  recordId    Int?
  timestamp   DateTime
  heartRate   Int?
  steps       Int?
  sleepHours  Float?
  oxygenLevel Float?
  description String?
}
```

---

## Troubleshooting

### Token Expired
**Error:** `{"detail": "token expired. Use /api/v2/login to reauthenticate."}`

**Solution:** Use the refresh endpoint or login again

### No Patient Linked
**Error:** `{"detail": "No patient linked to this account"}`

**Solution:** Ensure user login is linked to a patient record in the database

### Decryption Failed
**Error:** Decryption errors in logs

**Solution:** Ensure patient password hasn't changed (encryption key is password-derived)

---

## Port Information

- **Wearables API:** Port 8005
- **Patient API:** Port 8001
- **Doctor API:** Port 8002
- **Hospital API:** Port 8003
- **Emergency API:** Port 8004

---

## Version History

### v2.0.0 (Current)
- HCGateway v2 API compatibility
- Bearer token authentication
- Argon2 password hashing
- Fernet encryption
- Token refresh support
- FCM token support (placeholder)

---

## Support

For issues or questions:
- Check API logs: `docker-compose logs -f wearables-api`
- Verify database connection
- Test with simple curl commands first
- Check token expiry

---

**🔗 Related Documentation:**
- [API Testing Guide](../API_TESTING_GUIDE.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Quick Reference](../QUICK_REFERENCE.md)
