# CloudCare - Login Credentials Quick Reference

This document contains all the login credentials seeded in the database for testing and demo purposes.

---

## 🏥 Patient Portal Login
**URL**: `/login`

### Available Patient Accounts

| Patient Name | Email | Password | Patient ID | Notes |
|-------------|-------|----------|------------|-------|
| **Rajesh Kumar** | `patient5@cloudcare.local` | `Demo@123` | 12 | ⚠️ **EMERGENCY PATIENT** - Main demo patient |
| **Mobile Test User** | `patient7@cloudcare.local` | `test123` | 14 | Recommended for mobile app testing |
| Rahul Sharma | `rahul.sharma@yahoo.in` | `Demo@123` | 8 | Regular patient |
| Priya Gupta | `priya.gupta@gmail.com` | `Demo@123` | 9 | Regular patient |
| Amit Kumar | `patient3@cloudcare.local` | `Demo@123` | 10 | Regular patient |
| Sneha Mehta | `patient4@cloudcare.local` | `Demo@123` | 11 | Regular patient |
| John Doe | `patient6@cloudcare.local` | `Demo@123` | 13 | Regular patient |

### Pre-filled Login (Web)
- **Email**: `patient7@cloudcare.local`
- **Password**: `test123`

### Recommended for Demo
- **Emergency Patient**: `patient5@cloudcare.local` / `Demo@123` (Rajesh Kumar - has active emergency flag, cardiac conditions)

---

## 👨‍⚕️ Doctor Portal Login
**URL**: `/doctor-login`

| Doctor Name | Specialization | Email | Password | Doctor ID |
|------------|----------------|-------|----------|-----------|
| Dr. Suresh Krishnan | Cardiology | `suresh.krishnan@gmail.com` | `Doctor@123` | 6 |
| Dr. Meera Rao | General Medicine | `meera.rao@outlook.com` | `Doctor@123` | 7 |

### Pre-filled Login
- **Email**: `suresh.krishnan@gmail.com`
- **Password**: `Doctor@123`

---

## 🏥 Hospital Portal Login
**URL**: `/hospital-login`

| Hospital Name | Hospital Code | Password | Hospital ID |
|--------------|---------------|----------|-------------|
| Apollo Hospital, Bangalore | `apollo` | `Hospital@123` | 8 |
| Fortis Hospital, Mumbai | `fortis` | `Hospital@123` | 9 |
| AIIMS, Delhi | `aiims` | `Hospital@123` | 10 |
| Manipal Hospital, Pune | `manipal` | `Hospital@123` | 11 |
| Max Super Specialty Hospital, Gurugram | `max` | `Hospital@123` | 12 |

### Usage
- Enter the hospital code (lowercase) as the Hospital ID
- Use `Hospital@123` as the password for all hospitals

---

## 📱 Mobile App (HCGateway) Login

### For Testing with Wearables Data
**Recommended**: 
- **Username**: `7` (Patient ID for Mobile Test User)
- **Password**: `test123`

**Alternative**:
- **Username**: `1-6` (Other patient IDs)
- **Password**: `Demo@123`

---

## 🔗 Quick Links

- **Patient Dashboard**: http://localhost:3000/patient
- **Doctor Dashboard**: http://localhost:3000/doctor
- **Hospital Dashboard**: http://localhost:3000/hospital

---

## 📊 Database Information

### Emergency Patient Details (Rajesh Kumar - ID: 12)
- **Emergency Flag**: ✅ Active
- **Conditions**: 
  - Coronary Artery Disease (2+ years)
  - Atrial Fibrillation (3 months)
- **Current Doctor**: Dr. Suresh Krishnan (Cardiologist)
- **Past Doctors**: Dr. Meera Rao, Dr. Lakshmi Iyer
- **Hospital**: Apollo Hospital, Bangalore
- **Recent Event**: Emergency admission for irregular heartbeat
- **AI Analysis**: "AI detected abnormal heart rhythm patterns. Immediate cardiac evaluation recommended."

### API Endpoints
- **Patient API**: http://localhost:8001
- **Doctor API**: http://localhost:8002
- **Hospital API**: http://localhost:8003
- **Emergency API**: http://localhost:8004
- **Wearables API**: http://localhost:8005

---

## 🛠️ Development Notes

1. All login validations are currently client-side only
2. Passwords are stored in plain text in the database (demo purposes only)
3. Auth tokens are mock tokens stored in localStorage
4. Hospital logins don't have UserLogin entries in DB - credentials are hardcoded in frontend

---

**Last Updated**: October 19, 2025  
**Project**: CloudCare - Healthcare Management System  
**Team**: IIST Innocooks
