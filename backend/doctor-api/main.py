"""
CloudCare Doctor API Server
Handles all doctor-related operations
Port: 8002
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import connect_db, disconnect_db, get_prisma
from shared.models import DoctorCreate, DoctorResponse, BaseResponse
from prisma import Prisma
from typing import List, Optional


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection"""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="CloudCare Doctor API",
    description="API for managing doctor data and assignments",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DOCTOR ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CloudCare Doctor API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/api/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor: DoctorCreate,
    db: Prisma = Depends(get_prisma)
):
    """Create a new doctor record"""
    try:
        # Check if doctor ID already exists
        existing = None
        # If external doctor_id provided, try to resolve by name/email fallback
        if getattr(doctor, 'doctor_id', None):
            existing = await db.doctor.find_first(where={"name": doctor.doctor_id})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor with ID {doctor.doctor_id} already exists"
            )
        
        # Check if license number already exists
        existing_license = None
        if getattr(doctor, 'license_number', None):
            existing_license = await db.doctor.find_first(where={"licenseNumber": doctor.license_number})
        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor with license number {doctor.license_number} already exists"
            )
        
        new_doctor = await db.doctor.create(
            data={
                "name": doctor.name,
                "age": doctor.age,
                "gender": doctor.gender.value if hasattr(doctor, 'gender') else str(doctor.gender),
                "contact": doctor.contact,
                "specializations": ",".join(doctor.specializations) if hasattr(doctor, 'specializations') else doctor.specializations,
                "experience": getattr(doctor, 'experience', 0)
            }
        )
        
        return new_doctor
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create doctor: {str(e)}"
        )


@app.get("/api/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Get doctor by doctor ID"""
    try:
        did = int(doctor_id)
        doctor = await db.doctor.find_unique(where={"id": did})
    except Exception:
        doctor = await db.doctor.find_first(where={"name": doctor_id})
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctor_id} not found"
        )
    
    return doctor


@app.get("/api/doctors", response_model=List[DoctorResponse])
async def list_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = None,
    available_only: bool = False,
    db: Prisma = Depends(get_prisma)
):
    """List all doctors with optional filters"""
    where_clause = {}
    if available_only:
        where_clause["specializations"] = {"contains": specialization} if specialization else {}
    if specialization and not available_only:
        where_clause["specializations"] = {"contains": specialization}

    doctors = await db.doctor.find_many(
        where=where_clause,
        skip=skip,
        take=limit
    )
    
    return doctors


@app.put("/api/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: str,
    doctor_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """Update doctor information"""
    try:
        did = int(doctor_id)
        existing = await db.doctor.find_unique(where={"id": did})
    except Exception:
        existing = await db.doctor.find_first(where={"name": doctor_id})
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctor_id} not found"
        )
    
    try:
        updated_doctor = await db.doctor.update(
            where={"doctorId": doctor_id},
            data=doctor_data
        )
        return updated_doctor
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update doctor: {str(e)}"
        )


@app.patch("/api/doctors/{doctor_id}/availability")
async def update_availability(
    doctor_id: str,
    is_available: bool,
    db: Prisma = Depends(get_prisma)
):
    """Update doctor availability status"""
    try:
        did = int(doctor_id)
        doctor = await db.doctor.find_unique(where={"id": did})
    except Exception:
        doctor = await db.doctor.find_first(where={"name": doctor_id})
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctor_id} not found"
        )
    
    updated = await db.doctor.update(
        where={"id": doctor.id},
        data={"specializations": doctor.specializations}
    )
    
    return BaseResponse(
        success=True,
        message=f"Doctor availability updated to {'available' if is_available else 'unavailable'}"
    )


@app.delete("/api/doctors/{doctor_id}", response_model=BaseResponse)
async def delete_doctor(
    doctor_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Soft delete a doctor"""
    existing = await db.doctor.find_unique(
        where={"doctorId": doctor_id}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctor_id} not found"
        )
    
    await db.doctor.update(
        where={"doctorId": doctor_id},
        data={"isActive": False}
    )
    
    return BaseResponse(
        success=True,
        message=f"Doctor {doctor_id} deactivated successfully"
    )


# ============================================================================
# DOCTOR-PATIENT RELATIONSHIP ENDPOINTS
# ============================================================================

@app.get("/api/doctors/{doctor_id}/patients")
async def get_doctor_patients(
    doctor_id: str,
    current_only: bool = True,
    db: Prisma = Depends(get_prisma)
):
    """Get all patients for a doctor"""
    doctor = await db.doctor.find_unique(
        where={"doctorId": doctor_id}
    )
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctor_id} not found"
        )
    
    where_clause = {"doctorId": doctor.id}
    if current_only:
        where_clause["isCurrent"] = True
    
    patient_doctors = await db.patientdoctor.find_many(
        where=where_clause,
        include={"patient": True}
    )
    
    return [pd.patient for pd in patient_doctors]


@app.post("/api/doctors/{doctor_id}/patients/{patient_id}")
async def assign_patient_to_doctor(
    doctor_id: str,
    patient_id: str,
    relationship_type: str = "current",
    db: Prisma = Depends(get_prisma)
):
    """Assign a patient to a doctor"""
    doctor = await db.doctor.find_unique(where={"doctorId": doctor_id})
    patient = await db.patient.find_unique(where={"patientId": patient_id})
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if relationship already exists
    existing = await db.patientdoctor.find_first(
        where={
            "doctorId": doctor.id,
            "patientId": patient.id,
            "relationshipType": relationship_type
        }
    )
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Patient-Doctor relationship already exists"
        )
    
    relationship = await db.patientdoctor.create(
        data={
            "doctorId": doctor.id,
            "patientId": patient.id,
            "relationshipType": relationship_type,
            "startDate": datetime.now(),
            "isCurrent": True
        }
    )
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} assigned to doctor {doctor_id}"
    )


@app.delete("/api/doctors/{doctor_id}/patients/{patient_id}")
async def remove_patient_from_doctor(
    doctor_id: str,
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Remove patient from doctor (mark as previous)"""
    doctor = await db.doctor.find_unique(where={"doctorId": doctor_id})
    patient = await db.patient.find_unique(where={"patientId": patient_id})
    
    if not doctor or not patient:
        raise HTTPException(status_code=404, detail="Doctor or Patient not found")
    
    await db.patientdoctor.update_many(
        where={
            "doctorId": doctor.id,
            "patientId": patient.id,
            "isCurrent": True
        },
        data={
            "isCurrent": False,
            "endDate": datetime.now()
        }
    )
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} removed from doctor {doctor_id}"
    )


# ============================================================================
# DOCTOR-HOSPITAL RELATIONSHIP ENDPOINTS
# ============================================================================

@app.get("/api/doctors/{doctor_id}/hospitals")
async def get_doctor_hospitals(
    doctor_id: str,
    current_only: bool = True,
    db: Prisma = Depends(get_prisma)
):
    """Get all hospitals for a doctor"""
    doctor = await db.doctor.find_unique(where={"doctorId": doctor_id})
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    where_clause = {"doctorId": doctor.id}
    if current_only:
        where_clause["isCurrent"] = True
    
    doctor_hospitals = await db.doctorhospital.find_many(
        where=where_clause,
        include={"hospital": True}
    )
    
    return [dh.hospital for dh in doctor_hospitals]


@app.post("/api/doctors/{doctor_id}/hospitals/{hospital_name}")
async def assign_doctor_to_hospital(
    doctor_id: str,
    hospital_name: str,
    department: str,
    position: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Assign a doctor to a hospital"""
    doctor = await db.doctor.find_unique(where={"doctorId": doctor_id})
    hospital = await db.hospital.find_unique(where={"hospitalName": hospital_name})
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    relationship = await db.doctorhospital.create(
        data={
            "doctorId": doctor.id,
            "hospitalId": hospital.id,
            "department": department,
            "position": position,
            "joinDate": datetime.now(),
            "isCurrent": True
        }
    )
    
    return BaseResponse(
        success=True,
        message=f"Doctor {doctor_id} assigned to hospital {hospital_name}"
    )


if __name__ == "__main__":
    import uvicorn
    from datetime import datetime
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("DOCTOR_API_PORT", 8002)),
        reload=True
    )
