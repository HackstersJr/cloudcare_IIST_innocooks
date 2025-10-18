"""
CloudCare Hospital API Server
Handles all hospital-related operations
Port: 8003
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import connect_db, disconnect_db, get_prisma
from shared.models import HospitalCreate, HospitalResponse, BaseResponse
from prisma import Prisma
from typing import List, Optional


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection"""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="CloudCare Hospital API",
    description="API for managing hospital data, doctors, and patients",
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
# HOSPITAL ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CloudCare Hospital API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/api/hospitals", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital(
    hospital: HospitalCreate,
    db: Prisma = Depends(get_prisma)
):
    """Create a new hospital record"""
    try:
        # Check if hospital already exists
        existing = await db.hospital.find_unique(
            where={"hospitalName": hospital.hospital_name}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hospital {hospital.hospital_name} already exists"
            )
        
        new_hospital = await db.hospital.create(
            data={
                "hospitalName": hospital.hospital_name,
                "registrationNumber": hospital.registration_number,
                "hospitalType": hospital.hospital_type,
                "contact": hospital.contact,
                "email": hospital.email,
                "address": hospital.address,
                "website": hospital.website,
                "totalBeds": hospital.total_beds,
                "availableBeds": hospital.available_beds,
                "emergencyServices": hospital.emergency_services,
                "specializations": hospital.specializations,
                "accreditations": hospital.accreditations,
            }
        )
        
        return new_hospital
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hospital: {str(e)}"
        )


@app.get("/api/hospitals/{hospital_name}", response_model=HospitalResponse)
async def get_hospital(
    hospital_name: str,
    db: Prisma = Depends(get_prisma)
):
    """Get hospital by name"""
    hospital = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    return hospital


@app.get("/api/hospitals", response_model=List[HospitalResponse])
async def list_hospitals(
    skip: int = 0,
    limit: int = 100,
    emergency_only: bool = False,
    specialization: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """List all hospitals with optional filters"""
    where_clause = {"isActive": True}
    
    if emergency_only:
        where_clause["emergencyServices"] = True
    
    if specialization:
        where_clause["specializations"] = {"has": specialization}
    
    hospitals = await db.hospital.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"createdAt": "desc"}
    )
    
    return hospitals


@app.put("/api/hospitals/{hospital_name}", response_model=HospitalResponse)
async def update_hospital(
    hospital_name: str,
    hospital_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """Update hospital information"""
    existing = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    try:
        updated_hospital = await db.hospital.update(
            where={"hospitalName": hospital_name},
            data=hospital_data
        )
        return updated_hospital
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update hospital: {str(e)}"
        )


@app.patch("/api/hospitals/{hospital_name}/beds")
async def update_bed_availability(
    hospital_name: str,
    available_beds: int,
    db: Prisma = Depends(get_prisma)
):
    """Update hospital bed availability"""
    hospital = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    if available_beds > hospital.totalBeds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Available beds ({available_beds}) cannot exceed total beds ({hospital.totalBeds})"
        )
    
    updated = await db.hospital.update(
        where={"hospitalName": hospital_name},
        data={"availableBeds": available_beds}
    )
    
    return BaseResponse(
        success=True,
        message=f"Bed availability updated to {available_beds}"
    )


@app.delete("/api/hospitals/{hospital_name}", response_model=BaseResponse)
async def delete_hospital(
    hospital_name: str,
    db: Prisma = Depends(get_prisma)
):
    """Soft delete a hospital"""
    existing = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    await db.hospital.update(
        where={"hospitalName": hospital_name},
        data={"isActive": False}
    )
    
    return BaseResponse(
        success=True,
        message=f"Hospital {hospital_name} deactivated successfully"
    )


# ============================================================================
# HOSPITAL DOCTORS ENDPOINTS
# ============================================================================

@app.get("/api/hospitals/{hospital_name}/doctors")
async def get_hospital_doctors(
    hospital_name: str,
    current_only: bool = True,
    department: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Get all doctors in a hospital"""
    hospital = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    where_clause = {"hospitalId": hospital.id}
    if current_only:
        where_clause["isCurrent"] = True
    if department:
        where_clause["department"] = department
    
    doctor_hospitals = await db.doctorhospital.find_many(
        where=where_clause,
        include={"doctor": True}
    )
    
    return [
        {
            "doctor": dh.doctor,
            "department": dh.department,
            "position": dh.position,
            "join_date": dh.joinDate
        }
        for dh in doctor_hospitals
    ]


# ============================================================================
# HOSPITAL PATIENTS ENDPOINTS
# ============================================================================

@app.get("/api/hospitals/{hospital_name}/patients")
async def get_hospital_patients(
    hospital_name: str,
    current_only: bool = True,
    db: Prisma = Depends(get_prisma)
):
    """Get all patients who have been treated at a hospital"""
    hospital = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    where_clause = {"hospitalId": hospital.id}
    if current_only:
        # Only currently admitted patients
        where_clause["dischargeDate"] = None
    
    patient_hospitals = await db.patienthospital.find_many(
        where=where_clause,
        include={"patient": True},
        order={"admissionDate": "desc"}
    )
    
    return [
        {
            "patient": ph.patient,
            "admission_date": ph.admissionDate,
            "discharge_date": ph.dischargeDate,
            "treatment_type": ph.treatmentType,
            "department": ph.department,
            "reason": ph.reasonForVisit
        }
        for ph in patient_hospitals
    ]


@app.post("/api/hospitals/{hospital_name}/patients/{patient_id}/admit")
async def admit_patient(
    hospital_name: str,
    patient_id: str,
    admission_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """Admit a patient to hospital"""
    hospital = await db.hospital.find_unique(where={"hospitalName": hospital_name})
    patient = await db.patient.find_unique(where={"patientId": patient_id})
    
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check bed availability
    if hospital.availableBeds <= 0:
        raise HTTPException(
            status_code=400,
            detail="No beds available in the hospital"
        )
    
    from datetime import datetime
    
    # Create patient-hospital record
    await db.patienthospital.create(
        data={
            "patientId": patient.id,
            "hospitalId": hospital.id,
            "admissionDate": datetime.now(),
            "treatmentType": admission_data.get("treatment_type", "inpatient"),
            "department": admission_data.get("department"),
            "reasonForVisit": admission_data.get("reason"),
        }
    )
    
    # Decrease available beds
    await db.hospital.update(
        where={"hospitalName": hospital_name},
        data={"availableBeds": hospital.availableBeds - 1}
    )
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} admitted to {hospital_name}"
    )


@app.post("/api/hospitals/{hospital_name}/patients/{patient_id}/discharge")
async def discharge_patient(
    hospital_name: str,
    patient_id: str,
    discharge_summary: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Discharge a patient from hospital"""
    hospital = await db.hospital.find_unique(where={"hospitalName": hospital_name})
    patient = await db.patient.find_unique(where={"patientId": patient_id})
    
    if not hospital or not patient:
        raise HTTPException(status_code=404, detail="Hospital or Patient not found")
    
    from datetime import datetime
    
    # Find active admission
    admission = await db.patienthospital.find_first(
        where={
            "patientId": patient.id,
            "hospitalId": hospital.id,
            "dischargeDate": None
        }
    )
    
    if not admission:
        raise HTTPException(
            status_code=404,
            detail="No active admission found for this patient"
        )
    
    # Update discharge date
    await db.patienthospital.update(
        where={"id": admission.id},
        data={
            "dischargeDate": datetime.now(),
            "diagnosisSummary": discharge_summary
        }
    )
    
    # Increase available beds
    await db.hospital.update(
        where={"hospitalName": hospital_name},
        data={"availableBeds": hospital.availableBeds + 1}
    )
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} discharged from {hospital_name}"
    )


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@app.get("/api/hospitals/{hospital_name}/statistics")
async def get_hospital_statistics(
    hospital_name: str,
    db: Prisma = Depends(get_prisma)
):
    """Get hospital statistics"""
    hospital = await db.hospital.find_unique(
        where={"hospitalName": hospital_name}
    )
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_name} not found"
        )
    
    # Count doctors
    doctor_count = await db.doctorhospital.count(
        where={"hospitalId": hospital.id, "isCurrent": True}
    )
    
    # Count current patients
    current_patients = await db.patienthospital.count(
        where={"hospitalId": hospital.id, "dischargeDate": None}
    )
    
    # Total patients ever treated
    total_patients = await db.patienthospital.count(
        where={"hospitalId": hospital.id}
    )
    
    return {
        "hospital_name": hospital.hospitalName,
        "total_beds": hospital.totalBeds,
        "available_beds": hospital.availableBeds,
        "occupied_beds": hospital.totalBeds - hospital.availableBeds,
        "occupancy_rate": ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds * 100) if hospital.totalBeds > 0 else 0,
        "doctor_count": doctor_count,
        "current_patients": current_patients,
        "total_patients_treated": total_patients,
        "emergency_services": hospital.emergencyServices,
        "specializations": hospital.specializations
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("HOSPITAL_API_PORT", 8003)),
        reload=True
    )
