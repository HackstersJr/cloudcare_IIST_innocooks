"""
CloudCare Mock Data Seed Script
Creates 5 Indian patients, 5 doctors, and 5 hospitals with realistic interdependencies
One emergency patient with specific doctor history
"""

import asyncio
from datetime import datetime, timedelta
from prisma import Prisma
import random

db = Prisma()

# Indian Names and Data
INDIAN_MALE_NAMES = [
    "Rahul Sharma", "Amit Kumar", "Raj Patel", "Arjun Singh", "Vikram Reddy"
]

INDIAN_FEMALE_NAMES = [
    "Priya Gupta", "Sneha Mehta", "Anjali Desai", "Kavya Nair", "Pooja Iyer"
]

INDIAN_DOCTORS = [
    {"name": "Dr. Suresh Krishnan", "age": 45, "gender": "Male", "specializations": "Cardiology"},
    {"name": "Dr. Meera Rao", "age": 38, "gender": "Female", "specializations": "General Medicine"},
    {"name": "Dr. Rajesh Gupta", "age": 52, "gender": "Male", "specializations": "Emergency Medicine"},
    {"name": "Dr. Lakshmi Iyer", "age": 41, "gender": "Female", "specializations": "Pediatrics"},
    {"name": "Dr. Anil Verma", "age": 48, "gender": "Male", "specializations": "Orthopedics"},
]

INDIAN_HOSPITALS = [
    "Apollo Hospital, Bangalore",
    "Fortis Hospital, Mumbai",
    "AIIMS, Delhi",
    "Manipal Hospital, Pune",
    "Max Super Specialty Hospital, Gurugram"
]

INDIAN_CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"]
INDIAN_PHONE_PREFIX = ["+91-98", "+91-99", "+91-97", "+91-96", "+91-95"]

MEDICAL_CONDITIONS = [
    "Type 2 Diabetes",
    "Hypertension",
    "Asthma",
    "Arthritis",
    "Thyroid Disorder"
]

MEDICATIONS = [
    {"name": "Metformin", "dosage": "500mg twice daily"},
    {"name": "Lisinopril", "dosage": "10mg once daily"},
    {"name": "Salbutamol", "dosage": "2 puffs as needed"},
    {"name": "Paracetamol", "dosage": "650mg thrice daily"},
    {"name": "Levothyroxine", "dosage": "50mcg once daily"}
]


def generate_phone():
    """Generate Indian phone number"""
    prefix = random.choice(INDIAN_PHONE_PREFIX)
    suffix = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{suffix}"


def generate_email(name):
    """Generate email from name"""
    name_part = name.lower().replace(" ", ".").replace("dr.", "")
    domains = ["gmail.com", "yahoo.in", "hotmail.com", "outlook.com"]
    return f"{name_part}@{random.choice(domains)}"


async def create_hospitals():
    """Create 5 Indian hospitals"""
    print("🏥 Creating hospitals...")
    hospitals = []
    for hospital_name in INDIAN_HOSPITALS:
        hospital = await db.hospital.create(
            data={
                "name": hospital_name
            }
        )
        hospitals.append(hospital)
        print(f"   ✅ Created: {hospital.name}")
    return hospitals


async def create_doctors(hospitals):
    """Create 5 Indian doctors"""
    print("\n👨‍⚕️ Creating doctors...")
    doctors = []
    for idx, doctor_data in enumerate(INDIAN_DOCTORS):
        # Assign to a hospital
        hospital = hospitals[idx % len(hospitals)]
        
        doctor = await db.doctor.create(
            data={
                "name": doctor_data["name"],
                "age": doctor_data["age"],
                "gender": doctor_data["gender"],
                "contact": generate_phone(),
                "specializations": doctor_data["specializations"],
                "hospitalId": hospital.id
            }
        )
        doctors.append(doctor)
        print(f"   ✅ Created: {doctor.name} ({doctor.specializations}) at {hospital.name}")
    return doctors


async def create_regular_patients(doctors, hospitals):
    """Create 4 regular patients"""
    print("\n👥 Creating regular patients...")
    patients = []
    
    for i in range(4):
        # Mix of male and female names
        if i % 2 == 0:
            name = INDIAN_MALE_NAMES[i // 2]
            gender = "Male"
        else:
            name = INDIAN_FEMALE_NAMES[i // 2]
            gender = "Female"
        
        age = random.randint(25, 65)
        
        # Create patient
        patient = await db.patient.create(
            data={
                "name": name,
                "age": age,
                "gender": gender,
                "contact": generate_phone(),
                "familyContact": generate_phone(),
                "emergency": False,
                "aiAnalysis": None
            }
        )
        
        # Assign current doctor
        current_doctor = doctors[i % len(doctors)]
        await db.patient.update(
            where={"id": patient.id},
            data={
                "doctors": {
                    "connect": [{"id": current_doctor.id}]
                }
            }
        )
        
        # Assign hospital
        hospital = hospitals[i % len(hospitals)]
        await db.patient.update(
            where={"id": patient.id},
            data={
                "hospitals": {
                    "connect": [{"id": hospital.id}]
                }
            }
        )
        
        # Add medical condition
        condition = MEDICAL_CONDITIONS[i]
        await db.patientcondition.create(
            data={
                "patientId": patient.id,
                "condition": condition,
                "startDate": datetime.now() - timedelta(days=random.randint(365, 1825)),
                "endDate": None
            }
        )
        
        # Add prescription
        med = MEDICATIONS[i]
        await db.prescription.create(
            data={
                "patientId": patient.id,
                "medication": med["name"],
                "dosage": med["dosage"],
                "startDate": datetime.now() - timedelta(days=random.randint(30, 180)),
                "endDate": None
            }
        )
        
        # Add medical record
        await db.record.create(
            data={
                "patientId": patient.id,
                "description": f"Routine checkup for {condition}. Patient doing well on current medication.",
                "date": datetime.now() - timedelta(days=random.randint(1, 30))
            }
        )
        
        # Add wearable data
        for _ in range(5):
            await db.wearabledata.create(
                data={
                    "patientId": patient.id,
                    "timestamp": datetime.now() - timedelta(hours=random.randint(1, 72)),
                    "heartRate": random.randint(60, 85),
                    "steps": random.randint(5000, 12000),
                    "sleepHours": round(random.uniform(6.5, 8.5), 1),
                    "oxygenLevel": round(random.uniform(96.0, 99.0), 1),
                    "description": "Synced from smartwatch"
                }
            )
        
        patients.append(patient)
        print(f"   ✅ {name} ({age}y {gender}) - {condition} - Dr. {current_doctor.name} - {hospital.name}")
    
    return patients


async def create_emergency_patient(doctors, hospitals):
    """
    Create THE MAIN DEMO PATIENT with emergency flag
    - Has 2 past doctors
    - Has 1 current doctor  
    - In one hospital
    - Emergency flag = True
    """
    print("\n🚨 Creating EMERGENCY PATIENT (Main Demo)...")
    
    name = "Rajesh Kumar"
    age = 58
    gender = "Male"
    
    # Create emergency patient
    patient = await db.patient.create(
        data={
            "name": name,
            "age": age,
            "gender": gender,
            "contact": "+91-9845123456",
            "familyContact": "+91-9876543210",
            "emergency": True,  # EMERGENCY FLAG
            "aiAnalysis": "AI detected abnormal heart rhythm patterns. Immediate cardiac evaluation recommended."
        }
    )
    
    # Assign 3 doctors (2 past + 1 current)
    # Past Doctor 1 - Dr. Meera Rao (was treating 1 year ago)
    past_doctor_1 = doctors[1]  # Dr. Meera Rao
    
    # Past Doctor 2 - Dr. Lakshmi Iyer (was treating 6 months ago)
    past_doctor_2 = doctors[3]  # Dr. Lakshmi Iyer
    
    # Current Doctor - Dr. Suresh Krishnan (Cardiologist - current)
    current_doctor = doctors[0]  # Dr. Suresh Krishnan
    
    # Connect all doctors
    await db.patient.update(
        where={"id": patient.id},
        data={
            "doctors": {
                "connect": [
                    {"id": past_doctor_1.id},
                    {"id": past_doctor_2.id},
                    {"id": current_doctor.id}
                ]
            }
        }
    )
    
    # Assign to hospital (Apollo Hospital)
    hospital = hospitals[0]
    await db.patient.update(
        where={"id": patient.id},
        data={
            "hospitals": {
                "connect": [{"id": hospital.id}]
            }
        }
    )
    
    # Add serious conditions
    await db.patientcondition.create(
        data={
            "patientId": patient.id,
            "condition": "Coronary Artery Disease",
            "startDate": datetime.now() - timedelta(days=730),
            "endDate": None
        }
    )
    
    await db.patientcondition.create(
        data={
            "patientId": patient.id,
            "condition": "Atrial Fibrillation",
            "startDate": datetime.now() - timedelta(days=90),
            "endDate": None
        }
    )
    
    # Add multiple prescriptions
    await db.prescription.create(
        data={
            "patientId": patient.id,
            "medication": "Aspirin",
            "dosage": "75mg once daily",
            "startDate": datetime.now() - timedelta(days=730),
            "endDate": None
        }
    )
    
    await db.prescription.create(
        data={
            "patientId": patient.id,
            "medication": "Atorvastatin",
            "dosage": "20mg once daily",
            "startDate": datetime.now() - timedelta(days=730),
            "endDate": None
        }
    )
    
    await db.prescription.create(
        data={
            "patientId": patient.id,
            "medication": "Apixaban",
            "dosage": "5mg twice daily",
            "startDate": datetime.now() - timedelta(days=90),
            "endDate": None
        }
    )
    
    # Add emergency medical records
    await db.record.create(
        data={
            "patientId": patient.id,
            "description": "EMERGENCY: Patient reported severe chest pain and irregular heartbeat. ECG shows signs of atrial fibrillation. Immediate cardiology consultation required.",
            "date": datetime.now() - timedelta(hours=2)
        }
    )
    
    await db.record.create(
        data={
            "patientId": patient.id,
            "description": "Follow-up after cardiac event. Patient stable on anticoagulant therapy. Continue monitoring.",
            "date": datetime.now() - timedelta(days=7)
        }
    )
    
    # Add critical wearable data (showing emergency)
    await db.wearabledata.create(
        data={
            "patientId": patient.id,
            "timestamp": datetime.now() - timedelta(hours=2),
            "heartRate": 145,  # ELEVATED
            "steps": 150,
            "sleepHours": 3.2,  # LOW
            "oxygenLevel": 92.0,  # LOW
            "description": "⚠️ ALERT: Abnormal heart rate detected by smartwatch"
        }
    )
    
    await db.wearabledata.create(
        data={
            "patientId": patient.id,
            "timestamp": datetime.now() - timedelta(hours=1),
            "heartRate": 138,
            "steps": 200,
            "sleepHours": None,
            "oxygenLevel": 93.0,
            "description": "⚠️ ALERT: Heart rate still elevated"
        }
    )
    
    # Recent normal data
    await db.wearabledata.create(
        data={
            "patientId": patient.id,
            "timestamp": datetime.now() - timedelta(minutes=30),
            "heartRate": 78,  # Normalized after treatment
            "steps": 500,
            "sleepHours": None,
            "oxygenLevel": 97.0,
            "description": "Heart rate normalized after intervention"
        }
    )
    
    print(f"   🚨 EMERGENCY PATIENT: {name} ({age}y {gender})")
    print(f"   📍 Hospital: {hospital.name}")
    print(f"   👨‍⚕️ Past Doctors:")
    print(f"      - {past_doctor_1.name} (treated 1 year ago)")
    print(f"      - {past_doctor_2.name} (treated 6 months ago)")
    print(f"   👨‍⚕️ Current Doctor: {current_doctor.name} (Cardiologist)")
    print(f"   ❤️ Conditions: Coronary Artery Disease, Atrial Fibrillation")
    print(f"   💊 Medications: Aspirin, Atorvastatin, Apixaban")
    print(f"   🤖 AI Analysis: {patient.aiAnalysis}")
    
    return patient


async def create_user_logins(patients, doctors):
    """Create login credentials for patients and doctors"""
    print("\n🔐 Creating user logins...")
    
    # Create logins for first 2 patients
    for i in range(2):
        patient = patients[i]
        email = generate_email(patient.name)
        
        user = await db.userlogin.create(
            data={
                "email": email,
                "password": "hashed_password_" + str(i)  # In production, use proper hashing
            }
        )
        
        # Link to patient
        await db.patient.update(
            where={"id": patient.id},
            data={"userLoginId": user.id}
        )
        
        print(f"   ✅ Patient login: {email}")
    
    # Create logins for first 2 doctors
    for i in range(2):
        doctor = doctors[i]
        email = generate_email(doctor.name)
        
        user = await db.userlogin.create(
            data={
                "email": email,
                "password": "hashed_doctor_password_" + str(i)
            }
        )
        
        # Link to doctor
        await db.doctor.update(
            where={"id": doctor.id},
            data={"userLoginId": user.id}
        )
        
        print(f"   ✅ Doctor login: {email}")


async def seed_database():
    """Main seeding function"""
    print("🌱 Starting database seeding with Indian mock data...\n")
    
    await db.connect()
    
    try:
        # Create entities in order
        hospitals = await create_hospitals()
        doctors = await create_doctors(hospitals)
        regular_patients = await create_regular_patients(doctors, hospitals)
        emergency_patient = await create_emergency_patient(doctors, hospitals)
        
        all_patients = regular_patients + [emergency_patient]
        await create_user_logins(all_patients, doctors)
        
        print("\n" + "="*60)
        print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   • Hospitals: {len(hospitals)}")
        print(f"   • Doctors: {len(doctors)}")
        print(f"   • Regular Patients: {len(regular_patients)}")
        print(f"   • Emergency Patient: 1 (Rajesh Kumar)")
        print(f"   • Total Patients: {len(all_patients)}")
        print(f"\n🚨 MAIN DEMO PATIENT:")
        print(f"   Name: Rajesh Kumar (ID: {emergency_patient.id})")
        print(f"   Emergency: TRUE")
        print(f"   Current Doctor: Dr. Suresh Krishnan (Cardiology)")
        print(f"   Past Doctors: Dr. Meera Rao, Dr. Lakshmi Iyer")
        print(f"   Hospital: Apollo Hospital, Bangalore")
        print("\n🎯 Ready for demo and testing!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_database())
x