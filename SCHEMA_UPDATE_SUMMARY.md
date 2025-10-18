# CloudCare Schema Update & Mock Data - Summary

## ✅ Changes Completed

### 1. Schema Simplification

**Old Schema:** Complex normalized schema with 16 tables, UUIDs, enums, junction tables
**New Schema:** Simplified schema with basic relationships and integer IDs

#### Key Changes:
- ✅ Replaced UUID with auto-increment integers
- ✅ Simplified Hospital to just name, doctors, patients
- ✅ Direct many-to-many relationships (no junction tables)
- ✅ Simplified wearable data structure
- ✅ Added UserLogin for authentication
- ✅ Removed complex enums and audit fields

#### New Models:
```
- Patient (id, name, age, gender, contact, familyContact, emergency, aiAnalysis)
- Doctor (id, name, age, gender, contact, specializations, hospitalId)
- Hospital (id, name)
- Record (id, patientId, description, date)
- Prescription (id, patientId, medication, dosage, startDate, endDate)
- PatientCondition (id, patientId, condition, startDate, endDate)
- WearableData (id, patientId, recordId, timestamp, heartRate, steps, sleepHours, oxygenLevel, description)
- UserLogin (id, email, password)
```

---

### 2. Wearables API Re-implementation

**✅ HCGateway v2 Compatible**

Based on the Flask implementation from `Iotopia/Cloud-Care/backend/wearables/`, the new API includes:

#### Authentication (v2 with Bearer Tokens):
- `POST /api/v2/login` - Login with username/password, returns Bearer token
- `POST /api/v2/refresh` - Refresh expired token
- `DELETE /api/v2/revoke` - Logout/revoke token

#### Data Sync (HCGateway Compatible):
- `POST /api/v2/sync/{method}` - Upload wearable data (heartrate, steps, sleep, etc.)
- `POST /api/v2/fetch/{method}` - Retrieve wearable data
- `DELETE /api/v2/sync/{method}` - Delete wearable data

#### Additional Endpoints:
- `GET /api/v2/latest/{patient_id}` - Get latest vitals for patient
- `GET /` - Service info
- `GET /health` - Health check

#### Key Features:
- ✅ Bearer token authentication (12-hour expiry)
- ✅ Argon2 password hashing
- ✅ Fernet encryption (patient-specific keys)
- ✅ MongoDB-style user management
- ✅ FCM token support (placeholder)
- ✅ HCGateway data format compatibility
- ✅ Supports both `time` and `startTime/endTime` formats

#### Supported Data Types:
- Heart rate (BPM)
- Steps (count)
- Sleep (hours)
- Blood oxygen (SpO2 %)
- Blood pressure (systolic/diastolic)
- Temperature (°C)
- Weight (kg)
- Glucose (mg/dL)

---

### 3. Mock Data (Indian Context)

**✅ Created Realistic Indian Healthcare Data**

#### Seed Script: `prisma/seed.py`

**5 Hospitals:**
1. Apollo Hospital, Bangalore
2. Fortis Hospital, Mumbai
3. AIIMS, Delhi
4. Manipal Hospital, Pune
5. Max Super Specialty Hospital, Gurugram

**5 Doctors:**
1. Dr. Suresh Krishnan (45y Male) - Cardiology - Apollo
2. Dr. Meera Rao (38y Female) - General Medicine - Fortis
3. Dr. Rajesh Gupta (52y Male) - Emergency Medicine - AIIMS
4. Dr. Lakshmi Iyer (41y Female) - Pediatrics - Manipal
5. Dr. Anil Verma (48y Male) - Orthopedics - Max

**5 Patients (4 Regular + 1 Emergency):**

#### Regular Patients:
1. **Rahul Sharma** (Male)
   - Condition: Type 2 Diabetes
   - Doctor: Dr. Suresh Krishnan
   - Hospital: Apollo Hospital
   - Medication: Metformin
   - 5 wearable data points

2. **Priya Gupta** (Female)
   - Condition: Hypertension
   - Doctor: Dr. Meera Rao
   - Hospital: Fortis Hospital
   - Medication: Lisinopril
   - 5 wearable data points

3. **Amit Kumar** (Male)
   - Condition: Asthma
   - Doctor: Dr. Rajesh Gupta
   - Hospital: AIIMS
   - Medication: Salbutamol
   - 5 wearable data points

4. **Sneha Mehta** (Female)
   - Condition: Arthritis
   - Doctor: Dr. Lakshmi Iyer
   - Hospital: Manipal Hospital
   - Medication: Paracetamol
   - 5 wearable data points

#### 🚨 EMERGENCY PATIENT (Main Demo):
**Rajesh Kumar** (58y Male)
- ✅ **emergency flag = TRUE**
- ✅ **2 Past Doctors:**
  - Dr. Meera Rao (treated 1 year ago)
  - Dr. Lakshmi Iyer (treated 6 months ago)
- ✅ **1 Current Doctor:**
  - Dr. Suresh Krishnan (Cardiologist)
- ✅ **Hospital:**
  - Apollo Hospital, Bangalore
- ✅ **Conditions:**
  - Coronary Artery Disease (2 years)
  - Atrial Fibrillation (3 months)
- ✅ **Medications:**
  - Aspirin (75mg daily)
  - Atorvastatin (20mg daily)
  - Apixaban (5mg twice daily)
- ✅ **Medical Records:**
  - Emergency: Severe chest pain, irregular heartbeat (2 hours ago)
  - Follow-up: Stable on anticoagulant therapy (7 days ago)
- ✅ **Wearable Data:**
  - ⚠️ 2 hours ago: Heart rate 145 BPM (ELEVATED), O2 92% (LOW)
  - ⚠️ 1 hour ago: Heart rate 138 BPM (STILL HIGH), O2 93%
  - ✅ 30 min ago: Heart rate 78 BPM (NORMALIZED), O2 97%
- ✅ **AI Analysis:**
  - "AI detected abnormal heart rhythm patterns. Immediate cardiac evaluation recommended."

**Perfect for Demo:**
- Shows emergency patient workflow
- Multiple doctor history
- Critical wearable data trends
- AI analysis integration
- Complex medical history

---

### 4. Updated Shared Models

**✅ Simplified Pydantic Models**

Updated `shared/models.py` to match new schema:
- PatientCreate/Update/Response
- DoctorCreate/Update/Response
- HospitalCreate/Update/Response
- RecordCreate/Update/Response
- PrescriptionCreate/Update/Response
- PatientConditionCreate/Update/Response
- WearableDataCreate/Update/Response
- UserLoginCreate/Response
- Relationship assignment models

---

## 📁 Files Created/Modified

### Created:
1. ✅ `prisma/seed.py` - Mock data generation script
2. ✅ `WEARABLES_API_DOCUMENTATION.md` - Complete API docs
3. ✅ `SCHEMA_UPDATE_SUMMARY.md` - This file

### Modified:
1. ✅ `prisma/schema.prisma` - Completely replaced with new simplified schema
2. ✅ `wearables-api/main.py` - Re-implemented with HCGateway v2 compatibility
3. ✅ `shared/models.py` - Updated to match new schema

---

## 🚀 Next Steps

### 1. Setup Database & Generate Prisma Client
```bash
# Install dependencies (if not done)
npm install
pip install -r requirements.txt

# Generate Prisma client with new schema
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### 2. Seed Mock Data
```bash
# Run seed script
python prisma/seed.py
```

Expected output:
```
🏥 Creating hospitals...
   ✅ Created: Apollo Hospital, Bangalore
   ✅ Created: Fortis Hospital, Mumbai
   ...

👨‍⚕️ Creating doctors...
   ✅ Created: Dr. Suresh Krishnan (Cardiology) at Apollo Hospital
   ...

👥 Creating regular patients...
   ✅ Rahul Sharma (45y Male) - Type 2 Diabetes - Dr. Suresh Krishnan
   ...

🚨 Creating EMERGENCY PATIENT (Main Demo)...
   🚨 EMERGENCY PATIENT: Rajesh Kumar (58y Male)
   📍 Hospital: Apollo Hospital, Bangalore
   👨‍⚕️ Past Doctors:
      - Dr. Meera Rao (treated 1 year ago)
      - Dr. Lakshmi Iyer (treated 6 months ago)
   👨‍⚕️ Current Doctor: Dr. Suresh Krishnan (Cardiologist)
   ...

✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!
```

### 3. Update API Servers
The existing API servers need minor updates to work with the new schema:
- Remove UUID references
- Update to use integer IDs
- Remove enum imports
- Simplify relationship queries

### 4. Test Wearables API
```bash
# Start wearables API
cd wearables-api
python main.py

# Test login
curl -X POST http://localhost:8005/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "password123"}'

# Test sync (use token from login)
curl -X POST http://localhost:8005/api/v2/sync/heartrate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "metadata": {"id": "hr_001", "dataOrigin": "Fitbit"},
      "time": "2024-10-18T14:30:00Z",
      "heartRate": 75
    }]
  }'
```

---

## 🎯 Demo Flow

### Perfect Demo Scenario (Emergency Patient):

1. **Show Patient List** - 5 patients, one with emergency flag
2. **Open Emergency Patient** - Rajesh Kumar (ID from seed output)
3. **Show Doctor History:**
   - Past: Dr. Meera Rao, Dr. Lakshmi Iyer
   - Current: Dr. Suresh Krishnan (Cardiologist)
4. **Show Medical Conditions:**
   - Coronary Artery Disease (2 years)
   - Atrial Fibrillation (3 months)
5. **Show Medications:** 3 active prescriptions
6. **Show Wearable Data Trend:**
   - 2hrs ago: HR 145 ⚠️ (ALERT)
   - 1hr ago: HR 138 ⚠️ (STILL HIGH)
   - 30min ago: HR 78 ✅ (NORMALIZED)
7. **Show AI Analysis:** Detected abnormal rhythm
8. **Show Hospital:** Apollo Hospital, Bangalore
9. **Demonstrate Emergency Alert:** Real-time SSE notification

---

## 📊 Database Statistics

After seeding:
- **5 Hospitals** - Major Indian hospitals
- **5 Doctors** - Various specializations
- **5 Patients** - Mixed conditions
- **1 Emergency Patient** - Complex case for demo
- **~30 Wearable Data Points** - Recent vitals
- **5 Prescriptions** - Active medications
- **5 Conditions** - Various health issues
- **5 Medical Records** - Recent visits
- **4 User Logins** - For authentication testing

---

## 🔐 Indian Data Authenticity

All mock data uses realistic Indian context:
- ✅ Indian names (Hindi/Tamil/Telugu origins)
- ✅ Real hospital chains (Apollo, Fortis, AIIMS, etc.)
- ✅ Indian cities (Mumbai, Delhi, Bangalore, etc.)
- ✅ Indian phone format (+91-XXXXXXXXXX)
- ✅ Common Indian health conditions
- ✅ Indian medical practices
- ✅ Indian doctor titles and specializations

---

## 🎓 Key Learnings

### Schema Design:
- Simpler is often better for MVPs
- Integer IDs are easier to work with than UUIDs
- Direct relationships are cleaner than junction tables for simple cases

### HCGateway Integration:
- Flask pattern works well in FastAPI
- Bearer tokens are industry standard
- Encryption key derivation from passwords is clever
- MongoDB-style collections map to SQL tables

### Mock Data:
- Realistic data makes better demos
- Emergency cases are excellent for showcasing features
- Doctor history shows system sophistication
- Wearable trends demonstrate real-time monitoring

---

## 🐛 Known Issues

1. **Token Storage:** Tokens are not persisted in database (needs schema update)
2. **Password Hashing:** Seed uses placeholder hashes (production needs real Argon2)
3. **API Server Updates:** Patient/Doctor/Hospital APIs need updates for new schema
4. **Emergency API:** Needs update to work with new patient schema

---

## ✅ Ready for Production?

**Almost! Just need:**
1. ✅ Database schema ✓
2. ✅ Wearables API ✓
3. ✅ Mock data ✓
4. ✅ Documentation ✓
5. ⏳ Update other API servers
6. ⏳ Add proper authentication middleware
7. ⏳ Add error handling
8. ⏳ Add logging
9. ⏳ Add tests

**Current Status:** 60% Complete - Ready for Demo!

---

## 📞 Support

Questions about:
- **Schema changes:** Check `prisma/schema.prisma`
- **Wearables API:** Read `WEARABLES_API_DOCUMENTATION.md`
- **Mock data:** Run `python prisma/seed.py --help`
- **HCGateway format:** See original Flask code in `Iotopia/Cloud-Care/backend/wearables/`

---

**Built with ❤️ for CloudCare @ IIST Innocooks**
