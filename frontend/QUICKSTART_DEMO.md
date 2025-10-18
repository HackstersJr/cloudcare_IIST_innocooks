# 🚀 CloudCare Quick Start Guide

## ⚡ Run the Application

### Option 1: Quick Demo (Frontend Only)
```bash
cd frontend
npm run dev
```
**Access**: http://localhost:3001

**Demo Login**:
- Email: `rajesh@example.com`
- Password: `test123`

### Option 2: Full Stack (with Backend)
```bash
# Terminal 1 - Start Backend
cd backend
docker-compose up -d

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

---

## 📱 Page Navigation

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Home page with login options |
| Login | `/login` | Email/password authentication |
| Dashboard | `/patient` | Main patient overview |
| Wearables | `/patient/wearables` | Health metrics & charts |
| Appointments | `/patient/appointments` | Schedule & manage appointments |
| Prescriptions | `/patient/prescriptions` | Medication list |
| Profile | `/patient/profile` | Edit profile & family contacts |
| Records | `/patient/records` | Medical history |

---

## 🎯 Key Features to Demo

### 1. Wearables Page (Impressive!)
✨ **Real-time charts** with auto-refresh
- Heart rate line chart
- Oxygen level trends
- Health metrics pie chart
- Auto-sync every 30s

### 2. Appointments (Interactive)
✨ **Schedule new appointments**
- Click "New Appointment"
- Pick date with calendar widget
- Select time with clock widget
- Choose doctor & hospital
- Cancel existing appointments

### 3. Medical Records (Search)
✨ **Smart search & filter**
- Search by diagnosis, description
- Filter by record type
- Click "View" for detailed modal

### 4. Profile (Edit Mode)
✨ **Live editing**
- Click "Edit Profile"
- Change name, age, gender
- Add family contacts
- Save changes instantly

---

## 🔍 Testing Checklist

### Desktop Testing:
- [ ] Navigate through all 6 pages via sidebar
- [ ] Click "New Appointment" and fill form
- [ ] View wearables charts (heart rate, oxygen)
- [ ] Search medical records
- [ ] Edit profile and add family contact
- [ ] Check prescriptions table

### Mobile Testing (Resize Browser):
- [ ] Hamburger menu appears
- [ ] Cards stack vertically
- [ ] Prescription mobile cards visible
- [ ] Charts are responsive
- [ ] Forms are scrollable

---

## 🎨 Demo Flow (5 minutes)

1. **Start at Landing** (`/`)
   - "This is CloudCare, our healthcare management system"
   - Click "Continue as Demo Patient"

2. **Dashboard Overview** (`/patient`)
   - "Here's Rajesh Kumar, a 58-year-old patient with emergency status"
   - Show emergency alert banner
   - Point out AI health analysis
   - Show current conditions

3. **Wearables & Sensors** (sidebar click)
   - "Real-time health monitoring from connected devices"
   - Show heart rate chart
   - Point out oxygen level trends
   - Click "Sync Data" button
   - "Auto-refreshes every 30 seconds"

4. **Appointments** (sidebar click)
   - "2 upcoming appointments"
   - Click "New Appointment"
   - Demo date/time pickers
   - "Can cancel appointments easily"

5. **Prescriptions** (sidebar click)
   - "6 active medications"
   - Show table with dosages
   - Click tabs (All/Active/Past)
   - "Print and download functionality"

6. **Profile** (sidebar click)
   - Click "Edit Profile"
   - Change age → Save
   - "Family contacts with emergency designations"
   - Click "Add Contact" modal

7. **Medical Records** (sidebar click)
   - Use search: type "cardiac"
   - Click filters: "Consultation" only
   - Click "View" on a record
   - Show detailed modal

---

## 🐛 Troubleshooting

### Port 3000 in use?
```bash
# Server will auto-start on 3001
# Or kill existing process:
lsof -ti:3000 | xargs kill -9
```

### TypeScript errors?
```bash
npm run build
# All pages should compile successfully
```

### Missing dependencies?
```bash
npm install
```

---

## 📊 Mock Data Reference

### Patient: Rajesh Kumar
- **ID**: 1
- **Age**: 58
- **Gender**: Male
- **Emergency**: ⚠️ YES
- **Condition**: High Blood Pressure

### Family Contacts:
1. **Priya Kumar** (Spouse) - Primary, Emergency
2. **Amit Kumar** (Son) - Emergency
3. **Neha Kumar** (Daughter)

### Upcoming Appointments:
1. **Oct 25** - Dr. Sarah Johnson (Cardiology)
2. **Oct 28** - Dr. Amit Patel (General Medicine)

### Active Prescriptions:
- Amlodipine 5mg (Blood pressure)
- Metformin 500mg (Diabetes)
- Aspirin 75mg (Heart health)
- Atorvastatin 10mg (Cholesterol)

---

## 🎨 UI Highlights to Show

1. **Color-Coded Status Chips**:
   - Blue = Scheduled
   - Green = Completed/Active/Normal
   - Red = Cancelled/Emergency/High

2. **Hover Effects**: Cards highlight on hover

3. **Empty States**: Try filtering to "Cancelled" in appointments

4. **Loading Skeletons**: Visible during data fetch

5. **Responsive Sidebar**: Resize window to see mobile drawer

---

## 💡 Pro Tips

- Use **Cmd/Ctrl + Click** to open pages in new tabs
- **Demo patient** has complete data for all pages
- All modals can be closed with **ESC** key
- Search is **case-insensitive**
- Filters are **instant** (no loading)

---

## 🚢 Deployment Ready

### Build for Production:
```bash
npm run build
npm start
```

### Environment Variables (.env.local):
```env
NEXT_PUBLIC_PATIENT_API_URL=http://localhost:8001
NEXT_PUBLIC_DOCTOR_API_URL=http://localhost:8002
NEXT_PUBLIC_HOSPITAL_API_URL=http://localhost:8003
NEXT_PUBLIC_EMERGENCY_API_URL=http://localhost:8004
NEXT_PUBLIC_WEARABLES_API_URL=http://localhost:8005
NEXT_PUBLIC_DEMO_PATIENT_ID=1
```

---

**Need Help?** Check `PROJECT_COMPLETE.md` for full documentation!

**Demo Time**: ~5 minutes
**Pages**: 7 complete
**Status**: ✅ Ready to impress!
