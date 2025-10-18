# 🚀 QUICK START GUIDE

## ⚡ Get Up and Running in 5 Minutes!

---

## Step 1: Setup (1 minute)

```bash
cd cloudcare_IIST_innocooks

# Copy environment file
cp backend/.env.example backend/.env

# Install dependencies (inside backend)
cd backend
npm install
pip install -r requirements.txt
```

You are now inside the `backend` directory—stay here for the remaining steps.

---

## Step 2: Database Setup (2 minutes)

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with mock Indian data
python prisma/seed.py
```

**Expected Output:**
```
✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!

📊 Summary:
   • Hospitals: 5
   • Doctors: 5
   • Regular Patients: 4
   • Emergency Patient: 1 (Rajesh Kumar)

🚨 MAIN DEMO PATIENT:
   Name: Rajesh Kumar (ID: will be shown)
   Emergency: TRUE
   Current Doctor: Dr. Suresh Krishnan (Cardiology)
   Past Doctors: Dr. Meera Rao, Dr. Lakshmi Iyer
   Hospital: Apollo Hospital, Bangalore

🎯 Ready for demo and testing!
```

---

## Step 3: Start Services (1 minute)

### Option A: Docker (Recommended)
```bash
docker-compose up -d
```

### Option B: Manual (5 separate terminals)
From the `backend` directory in each terminal:
```bash
# Terminal 1
cd wearables-api && python main.py

# Terminal 2  
cd patient-api && python main.py

# Terminal 3
cd doctor-api && python main.py

# Terminal 4
cd hospital-api && python main.py

# Terminal 5
cd emergency-api && python main.py
```

---

## Step 4: Test (1 minute)

### Test Wearables API

#### Login:
```bash
curl -X POST http://localhost:8005/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rajesh@example.com",
    "password": "test123"
  }'
```

**Copy the token from response!**

#### Sync Data:
```bash
curl -X POST http://localhost:8005/api/v2/sync/heartrate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "metadata": {"id": "hr_001", "dataOrigin": "Fitbit"},
      "time": "2024-10-18T14:30:00Z",
      "heartRate": 75
    }]
  }'
```

#### Fetch Data:
```bash
curl -X POST http://localhost:8005/api/v2/fetch/heartrate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"queries": {}}'
```

---

## 🎯 Demo Flow (Emergency Patient)

### View in Prisma Studio:
```bash
npm run prisma:studio
```

Open: http://localhost:5555

### Find Emergency Patient:
1. Click "Patient" table
2. Look for `emergency = true`
3. Note the ID (e.g., `5`)

### Check His Data:

**Doctors (relationships):**
- Current: Dr. Suresh Krishnan (Cardiologist)
- Past: Dr. Meera Rao, Dr. Lakshmi Iyer

**Hospital:**
- Apollo Hospital, Bangalore

**Conditions:**
- Coronary Artery Disease
- Atrial Fibrillation

**Wearable Data:**
- Heart rate: 145 → 138 → 78 BPM (emergency → stable)
- Oxygen: 92% → 93% → 97%

**AI Analysis:**
- "AI detected abnormal heart rhythm patterns..."

---

## 📊 Service URLs

| Service | URL | Docs |
|---------|-----|------|
| Wearables | http://localhost:8005 | http://localhost:8005/docs |
| Patient | http://localhost:8001 | http://localhost:8001/docs |
| Doctor | http://localhost:8002 | http://localhost:8002/docs |
| Hospital | http://localhost:8003 | http://localhost:8003/docs |
| Emergency | http://localhost:8004 | http://localhost:8004/docs |
| Prisma Studio | http://localhost:5555 | - |

---

## 🔍 Quick Health Checks

```bash
# Check all services
curl http://localhost:8001/  # Patient API
curl http://localhost:8002/  # Doctor API
curl http://localhost:8003/  # Hospital API
curl http://localhost:8004/  # Emergency API
curl http://localhost:8005/  # Wearables API
```

All should return JSON with service info!

---

## 📚 Documentation

- **Complete Guide:** [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)
- **Wearables API:** [WEARABLES_API_DOCUMENTATION.md](WEARABLES_API_DOCUMENTATION.md)
- **Schema Updates:** [SCHEMA_UPDATE_SUMMARY.md](SCHEMA_UPDATE_SUMMARY.md)
- **Full Docs:** [README.md](README.md)

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
(cd backend && docker-compose ps)

# Start if not running
(cd backend && docker-compose up -d postgres)
```

### Prisma Client Error
```bash
# Regenerate client
npm run prisma:generate
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
pip install -r shared/requirements.txt
```

### Token Expired
Just login again to get a new token (expires every 12 hours)

---

## 🎉 You're Ready!

Everything is set up! Now you can:
- ✅ View data in Prisma Studio
- ✅ Test all 5 APIs
- ✅ Demo the emergency patient
- ✅ Sync wearable data
- ✅ Show doctor history
- ✅ Display medical records

---

## 🚨 Emergency Patient Demo Script

```
1. "Let me show you our emergency patient: Rajesh Kumar"
2. "He's a 58-year-old with a cardiac history"
3. "Look at his doctor progression - started with Dr. Meera,
   then Dr. Lakshmi, now with cardiologist Dr. Suresh"
4. "He has two serious conditions: CAD and Atrial Fib"
5. "Watch his wearable data: heart rate spiked to 145,
   gradually came down to normal 78"
6. "Our AI detected the abnormal rhythm and flagged emergency"
7. "He's currently at Apollo Hospital receiving treatment"
```

---

**Time to completion: 5 minutes**
**Difficulty: Easy**
**Prerequisites: Python, Node.js, PostgreSQL**

🚀 **GO BUILD SOMETHING AMAZING!**
