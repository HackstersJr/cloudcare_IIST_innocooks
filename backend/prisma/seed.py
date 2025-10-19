"""
CloudCare Seed Script - Frontend Mock Data
Seeding complete data from frontend/lib/mockData.ts, constants/doctor.ts, constants/hospital.ts
"""

import asyncio
from datetime import datetime, timedelta
from prisma import Prisma

db = Prisma()


async def clear_database():
    """Clear all existing data from database"""
    print("🗑️  Clearing existing database data...")
    
    # Delete in correct order to respect foreign keys
    await db.wearabledata.delete_many()
    await db.record.delete_many()
    await db.prescription.delete_many()
    await db.patientcondition.delete_many()
    
    # Disconnect many-to-many relationships
    patients = await db.patient.find_many()
    for patient in patients:
        await db.patient.update(
            where={"id": patient.id},
            data={
                "doctors": {"set": []},
                "hospitals": {"set": []}
            }
        )
    
    # Delete main entities
    await db.patient.delete_many()
    await db.doctor.delete_many()
    await db.hospital.delete_many()
    await db.userlogin.delete_many()

    # Reset sequences so IDs align with mock data expectations
    # Try to reset sequences if they exist (ignore if they don't)
    try:
        sequence_names = [
            'Patient_id_seq',
            'Doctor_id_seq',
            'Hospital_id_seq',
            'Record_id_seq',
            'Prescription_id_seq',
            'PatientCondition_id_seq',
            'WearableData_id_seq',
            'UserLogin_id_seq',
        ]
        for seq in sequence_names:
            try:
                await db.execute_raw(f'ALTER SEQUENCE "{seq}" RESTART WITH 1;')
            except Exception:
                pass  # Sequence doesn't exist, that's okay
    except Exception as e:
        print(f"   ⚠️  Could not reset sequences (this is usually fine): {e}")
    
    print("   ✅ All existing data cleared")


async def create_hospitals():
    """Create hospitals from frontend mockData"""
    print("🏥 Creating hospitals...")
    hospitals = []
    
    hospital_data = [
        "City General Hospital",
        "Metro Medical Center", 
        "Sunrise Clinic"
    ]
    
    for name in hospital_data:
        hospital = await db.hospital.create(data={"name": name})
        hospitals.append(hospital)
        print(f"   ✅ {name}")
    
    return hospitals


async def create_doctors(hospitals):
    """Create doctors from frontend mockData"""
    print("\n👨‍⚕️ Creating doctors...")
    doctors = []
    
    doctor_data = [
        {"name": "Dr. Sarah Johnson", "age": 45, "gender": "Female", "contact": "+91-9876543210", "specializations": "Cardiology, Internal Medicine"},
        {"name": "Dr. Amit Patel", "age": 38, "gender": "Male", "contact": "+91-9876543211", "specializations": "General Medicine"},
        {"name": "Dr. Priya Sharma", "age": 42, "gender": "Female", "contact": "+91-9876543212", "specializations": "Orthopedics"},
        {"name": "Dr. Rajesh Kumar", "age": 50, "gender": "Male", "contact": "+91-9876543213", "specializations": "Neurology"},
    ]
    
    for idx, data in enumerate(doctor_data):
        doctor = await db.doctor.create(
            data={
                "name": data["name"],
                "age": data["age"],
                "gender": data["gender"],
                "contact": data["contact"],
                "specializations": data["specializations"],
                "hospitalId": hospitals[idx % len(hospitals)].id
            }
        )
        doctors.append(doctor)
        print(f"   ✅ {data['name']} - {data['specializations']}")
    
    return doctors


async def create_main_patient(doctors, hospitals):
    """Create main patient (Rajesh Kumar) from frontend mockData"""
    print("\n🚨 Creating main patient (Rajesh Kumar)...")
    
    # Create patient
    patient = await db.patient.create(
        data={
            "name": "Rajesh Kumar",
            "age": 58,
            "gender": "Male",
            "contact": "+91-9876543210",
            "familyContact": "+91-9876543211",
            "emergency": True,
            "aiAnalysis": "AI detected elevated cardiovascular risk driven by hypertension history and recent heart-rate variability trends. Recommend recording BP twice daily, staying hydrated, and scheduling a cardiology follow-up this week."
        }
    )
    
    # Link to doctors and hospital
    await db.patient.update(
        where={"id": patient.id},
        data={
            "doctors": {"connect": [{"id": doctors[0].id}]},
            "hospitals": {"connect": [{"id": hospitals[0].id}]}
        }
    )
    
    # Add conditions
    conditions_data = [
        {"condition": "Hypertension (Stage 1)", "startDate": datetime(2022, 3, 12), "endDate": None},
        {"condition": "Type 2 Diabetes Mellitus", "startDate": datetime(2021, 7, 1), "endDate": None},
        {"condition": "Generalized Anxiety Disorder", "startDate": datetime(2024, 1, 15), "endDate": datetime(2024, 9, 1)},
    ]
    
    for cond in conditions_data:
        await db.patientcondition.create(
            data={
                "patientId": patient.id,
                "condition": cond["condition"],
                "startDate": cond["startDate"],
                "endDate": cond["endDate"]
            }
        )
    
    # Add prescriptions
    prescriptions_data = [
        {"medication": "Amlodipine", "dosage": "5mg", "startDate": datetime(2025, 10, 1), "endDate": datetime(2025, 11, 1)},
        {"medication": "Metformin", "dosage": "500mg", "startDate": datetime(2025, 9, 15), "endDate": datetime(2025, 12, 15)},
        {"medication": "Aspirin", "dosage": "75mg", "startDate": datetime(2025, 10, 10), "endDate": None},
        {"medication": "Atorvastatin", "dosage": "10mg", "startDate": datetime(2025, 9, 20), "endDate": None},
        {"medication": "Omeprazole", "dosage": "20mg", "startDate": datetime(2025, 8, 1), "endDate": datetime(2025, 9, 1)},
        {"medication": "Losartan", "dosage": "50mg", "startDate": datetime(2025, 7, 15), "endDate": datetime(2025, 8, 15)},
    ]
    
    for presc in prescriptions_data:
        await db.prescription.create(
            data={
                "patientId": patient.id,
                "medication": presc["medication"],
                "dosage": presc["dosage"],
                "startDate": presc["startDate"],
                "endDate": presc["endDate"]
            }
        )
    
    # Add medical records  
    records_data = [
        {
            "description": "[Consultation] Cardiology review • systolic BP averaged 145 mmHg. Diagnosis: Hypertension not fully controlled. Treatment: Continue Amlodipine 5mg daily, add evening walk regimen. Dr. Sarah Johnson at City General Hospital",
            "date": datetime(2025, 10, 15, 10, 0),
        },
        {
            "description": "[Lab Test] Complete lipid profile and HbA1c screening. Results: LDL 145 mg/dL • HbA1c 7.2%. Treatment: Maintain Metformin, start Atorvastatin 10mg nightly. Dr. Amit Patel at City General Hospital",
            "date": datetime(2025, 10, 10, 8, 30),
        },
        {
            "description": "[Emergency] Emergency visit for chest discomfort and dizziness. Diagnosis: Ruled out myocardial infarction; observed anxiety episode. Treatment: Observation for 4 hours, prescribed short-term anxiolytic. Dr. Priya Sharma at Metro Medical Center",
            "date": datetime(2025, 9, 5, 22, 30),
        }
    ]
    
    for rec in records_data:
        await db.record.create(
            data={
                "patientId": patient.id,
                "description": rec["description"],
                "date": rec["date"],
            }
        )
    
    # Add wearable data
    wearables_data = [
        {"timestamp": datetime.now() - timedelta(days=1), "heartRate": 72, "steps": 8500, "sleepHours": 7.5, "oxygenLevel": 98.0, "description": "Normal readings"},
        {"timestamp": datetime.now() - timedelta(days=2), "heartRate": 75, "steps": 9200, "sleepHours": 7.0, "oxygenLevel": 97.5, "description": "Normal readings"},
        {"timestamp": datetime.now() - timedelta(days=3), "heartRate": 70, "steps": 7800, "sleepHours": 8.0, "oxygenLevel": 98.5, "description": "Normal readings"},
    ]
    
    for wear in wearables_data:
        await db.wearabledata.create(
            data={
                "patientId": patient.id,
                "timestamp": wear["timestamp"],
                "heartRate": wear["heartRate"],
                "steps": wear["steps"],
                "sleepHours": wear["sleepHours"],
                "oxygenLevel": wear["oxygenLevel"],
                "description": wear["description"]
            }
        )
    
    print(f"   ✅ Rajesh Kumar (58y Male) - Emergency: TRUE")
    print(f"   📍 Conditions: 3 | Prescriptions: 6 | Records: 3 | Wearables: 3")
    
    return patient


async def create_doctor_assigned_patients(doctors, hospitals):
    """Create patients for doctor dashboard from constants/doctor.ts"""
    print("\n👥 Creating doctor-assigned patients...")
    patients = []
    
    patients_data = [
        {
            "name": "John Smith", "age": 45, "gender": "Male",
            "contact": "+1 (555) 234-5678", "familyContact": "+1 (555) 234-5679",
            "emergency": False, "aiAnalysis": None,
            "condition": "Hypertension"
        },
        {
            "name": "Emily Davis", "age": 32, "gender": "Female",
            "contact": "+1 (555) 345-6789", "familyContact": "+1 (555) 345-6790",
            "emergency": False, "aiAnalysis": None,
            "condition": "Diabetes Type 2"
        },
        {
            "name": "Michael Brown", "age": 58, "gender": "Male",
            "contact": "+1 (555) 456-7890", "familyContact": "+1 (555) 456-7891",
            "emergency": True, "aiAnalysis": "Cardiac risk detected - immediate attention required",
            "condition": "Cardiac Arrhythmia"
        },
        {
            "name": "Sarah Johnson", "age": 67, "gender": "Female",
            "contact": "+1 (555) 567-8901", "familyContact": "+1 (555) 567-8902",
            "emergency": False, "aiAnalysis": None,
            "condition": "Hypertension, High Cholesterol"
        },
        {
            "name": "David Wilson", "age": 55, "gender": "Male",
            "contact": "+1 (555) 678-9012", "familyContact": "+1 (555) 678-9013",
            "emergency": False, "aiAnalysis": None,
            "condition": "COPD"
        },
    ]
    
    for idx, data in enumerate(patients_data):
        patient = await db.patient.create(
            data={
                "name": data["name"],
                "age": data["age"],
                "gender": data["gender"],
                "contact": data["contact"],
                "familyContact": data["familyContact"],
                "emergency": data["emergency"],
                "aiAnalysis": data["aiAnalysis"]
            }
        )
        
        # Link to first doctor (Dr. Sarah Johnson)
        await db.patient.update(
            where={"id": patient.id},
            data={
                "doctors": {"connect": [{"id": doctors[0].id}]},
                "hospitals": {"connect": [{"id": hospitals[0].id}]}
            }
        )
        
        # Add condition
        await db.patientcondition.create(
            data={
                "patientId": patient.id,
                "condition": data["condition"],
                "startDate": datetime.now() - timedelta(days=365),
                "endDate": None
            }
        )
        
        # Add some wearable data
        await db.wearabledata.create(
            data={
                "patientId": patient.id,
                "timestamp": datetime.now() - timedelta(hours=2),
                "heartRate": 145 if data["emergency"] else 75,
                "steps": 150 if data["emergency"] else 6000,
                "sleepHours": 3.2 if data["emergency"] else 7.0,
                "oxygenLevel": 92.0 if data["emergency"] else 98.0,
                "description": "⚠️ ALERT: Abnormal readings" if data["emergency"] else "Normal readings"
            }
        )
        
        patients.append(patient)
        print(f"   ✅ {data['name']} ({data['age']}y {data['gender']}) - {data['condition']}")
    
    return patients


async def create_hospital_emergency_patients(doctors, hospitals):
    """Create emergency patients for hospital dashboard"""
    print("\n🚨 Creating hospital emergency patients...")
    patients = []
    
    emergency_data = [
        {"name": "John Anderson", "age": 65, "gender": "Male", "contact": "+1 (555) 100-0001", "familyContact": "+1 (555) 100-0002", "condition": "Cardiac Arrest"},
        {"name": "Maria Garcia", "age": 42, "gender": "Female", "contact": "+1 (555) 100-0003", "familyContact": "+1 (555) 100-0004", "condition": "Severe Trauma"},
        {"name": "Robert Johnson", "age": 58, "gender": "Male", "contact": "+1 (555) 100-0005", "familyContact": "+1 (555) 100-0006", "condition": "Stroke Symptoms"},
        {"name": "Lisa Thompson", "age": 35, "gender": "Female", "contact": "+1 (555) 100-0007", "familyContact": "+1 (555) 100-0008", "condition": "Severe Allergic Reaction"},
        {"name": "David Martinez", "age": 52, "gender": "Male", "contact": "+1 (555) 100-0009", "familyContact": "+1 (555) 100-0010", "condition": "Respiratory Distress"},
        {"name": "Jennifer Lee", "age": 40, "gender": "Female", "contact": "+1 (555) 100-0011", "familyContact": "+1 (555) 100-0012", "condition": "Head Injury"},
        {"name": "William Brown", "age": 60, "gender": "Male", "contact": "+1 (555) 100-0013", "familyContact": "+1 (555) 100-0014", "condition": "Chest Pain"},
        {"name": "Sarah Davis", "age": 28, "gender": "Female", "contact": "+1 (555) 100-0015", "familyContact": "+1 (555) 100-0016", "condition": "Fracture"},
        {"name": "Michael Wilson", "age": 45, "gender": "Male", "contact": "+1 (555) 100-0017", "familyContact": "+1 (555) 100-0018", "condition": "Abdominal Pain"},
        {"name": "Emily Taylor", "age": 33, "gender": "Female", "contact": "+1 (555) 100-0019", "familyContact": "+1 (555) 100-0020", "condition": "Minor Burns"},
    ]
    
    for idx, data in enumerate(emergency_data):
        patient = await db.patient.create(
            data={
                "name": data["name"],
                "age": data["age"],
                "gender": data["gender"],
                "contact": data["contact"],
                "familyContact": data["familyContact"],
                "emergency": True,
                "aiAnalysis": f"Emergency case: {data['condition']}"
            }
        )
        
        # Link to doctor and hospital
        await db.patient.update(
            where={"id": patient.id},
            data={
                "doctors": {"connect": [{"id": doctors[idx % len(doctors)].id}]},
                "hospitals": {"connect": [{"id": hospitals[0].id}]}
            }
        )
        
        # Add condition
        await db.patientcondition.create(
            data={
                "patientId": patient.id,
                "condition": data["condition"],
                "startDate": datetime.now() - timedelta(hours=idx + 1),
                "endDate": None
            }
        )
        
        # Add emergency record
        await db.record.create(
            data={
                "patientId": patient.id,
                "description": f"[Emergency] Emergency admission: {data['condition']}. Patient admitted {idx + 1} hours ago. In treatment. Emergency stabilization in progress. Doctor: {doctors[idx % len(doctors)].name} at City General Hospital",
                "date": datetime.now() - timedelta(hours=idx + 1),
            }
        )
        
        patients.append(patient)
        print(f"   ✅ {data['name']} - {data['condition']}")
    
    return patients


async def create_user_logins(main_patient, doctors):
    """Create user logins for main patient and doctors"""
    print("\n🔐 Creating user logins...")
    
    # Main patient login
    user1 = await db.userlogin.create(
        data={
            "email": "rajesh.kumar@cloudcare.local",
            "password": "patient123"
        }
    )
    await db.patient.update(
        where={"id": main_patient.id},
        data={"userLoginId": user1.id}
    )
    print(f"   ✅ Patient: rajesh.kumar@cloudcare.local (password: patient123)")
    
    # Doctor logins
    doctor_emails = [
        "sarah.johnson@cloudcare.com",
        "amit.patel@cloudcare.com"
    ]
    
    for idx in range(2):
        user = await db.userlogin.create(
            data={
                "email": doctor_emails[idx],
                "password": "doctor123"
            }
        )
        await db.doctor.update(
            where={"id": doctors[idx].id},
            data={"userLoginId": user.id}
        )
        print(f"   ✅ Doctor: {doctor_emails[idx]} (password: doctor123)")


async def seed_database():
    """Main seeding function"""
    print("🌱 Starting database seeding with frontend mock data...\n")
    
    await db.connect()
    
    try:
        # Clear existing data first
        await clear_database()
        
        # Create all entities
        hospitals = await create_hospitals()
        doctors = await create_doctors(hospitals)
        main_patient = await create_main_patient(doctors, hospitals)
        doctor_patients = await create_doctor_assigned_patients(doctors, hospitals)
        hospital_patients = await create_hospital_emergency_patients(doctors, hospitals)
        await create_user_logins(main_patient, doctors)
        
        print("\n" + "="*70)
        print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\n📊 Summary:")
        print(f"   • Hospitals: {len(hospitals)}")
        print(f"   • Doctors: {len(doctors)} (2 with logins)")
        print(f"   • Main Patient: 1 (Rajesh Kumar - with login)")
        print(f"   • Doctor Dashboard Patients: {len(doctor_patients)}")
        print(f"   • Hospital Emergency Patients: {len(hospital_patients)}")
        print(f"   • Total Patients: {1 + len(doctor_patients) + len(hospital_patients)}")
        print(f"\n🔐 Login Credentials:")
        print(f"   Patient: rajesh.kumar@cloudcare.local / patient123")
        print(f"   Doctor 1: sarah.johnson@cloudcare.com / doctor123")
        print(f"   Doctor 2: amit.patel@cloudcare.com / doctor123")
        print("\n🎯 Ready for frontend integration!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_database())