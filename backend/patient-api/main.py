"""
CloudCare Patient API Server
Handles all patient-related operations
Port: 8001
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

# Add parent directory to path for shared module imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import connect_db, disconnect_db, get_prisma
from shared.models import (
    PatientCreate,
    PatientResponse,
    BaseResponse,
    ErrorResponse,
    FamilyContactCreate
)
from prisma import Prisma
from typing import List, Optional
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection"""
    await connect_db()
    yield
    await disconnect_db()


# Initialize FastAPI app
app = FastAPI(
    title="CloudCare Patient API",
    description="API for managing patient data and medical records",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PATIENT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CloudCare Patient API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/api/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient: PatientCreate,
    db: Prisma = Depends(get_prisma)
):
    """
    Create a new patient record
    """
    try:
        # Check if patient ID already exists
        existing = await db.patient.find_unique(
            where={"patientId": patient.patient_id}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Patient with ID {patient.patient_id} already exists"
            )
        
        # Create patient
        new_patient = await db.patient.create(
            data={
                "patientId": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "dateOfBirth": patient.date_of_birth,
                "gender": patient.gender.value,
                "contact": patient.contact,
                "email": patient.email,
                "address": patient.address,
                "bloodType": patient.blood_type.value if patient.blood_type else None,
                "allergies": patient.allergies,
                "chronicConditions": patient.chronic_conditions,
            }
        )
        
        # Create family contacts
        if patient.family_contacts:
            for fc in patient.family_contacts:
                await db.familycontact.create(
                    data={
                        "patientId": new_patient.id,
                        "name": fc.name,
                        "relationship": fc.relationship,
                        "contact": fc.contact,
                        "email": fc.email,
                        "isPrimary": fc.is_primary,
                        "isEmergencyContact": fc.is_emergency_contact,
                    }
                )
        
        return new_patient
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patient: {str(e)}"
        )


@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Get patient by patient ID
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    return patient


@app.get("/api/patients", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    emergency_only: bool = False,
    db: Prisma = Depends(get_prisma)
):
    """
    List all patients with pagination
    """
    where_clause = {}
    if emergency_only:
        where_clause["emergencyFlag"] = True
    
    patients = await db.patient.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"createdAt": "desc"}
    )
    
    return patients


@app.put("/api/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """
    Update patient information
    """
    existing = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    try:
        updated_patient = await db.patient.update(
            where={"patientId": patient_id},
            data=patient_data
        )
        return updated_patient
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update patient: {str(e)}"
        )


@app.delete("/api/patients/{patient_id}", response_model=BaseResponse)
async def delete_patient(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Soft delete a patient (set isActive to False)
    """
    existing = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    await db.patient.update(
        where={"patientId": patient_id},
        data={"isActive": False}
    )
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} deactivated successfully"
    )


# ============================================================================
# FAMILY CONTACTS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/family-contacts")
async def get_family_contacts(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Get all family contacts for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id},
        include={"familyContacts": True}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    return patient.familyContacts


@app.post("/api/patients/{patient_id}/family-contacts")
async def add_family_contact(
    patient_id: str,
    contact: FamilyContactCreate,
    db: Prisma = Depends(get_prisma)
):
    """
    Add a family contact for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    new_contact = await db.familycontact.create(
        data={
            "patientId": patient.id,
            "name": contact.name,
            "relationship": contact.relationship,
            "contact": contact.contact,
            "email": contact.email,
            "isPrimary": contact.is_primary,
            "isEmergencyContact": contact.is_emergency_contact,
        }
    )
    
    return new_contact


# ============================================================================
# PATIENT CONDITIONS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/conditions")
async def get_patient_conditions(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Get all conditions for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id},
        include={"patientConditions": True}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    return patient.patientConditions


@app.post("/api/patients/{patient_id}/conditions")
async def add_patient_condition(
    patient_id: str,
    condition_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """
    Add a condition for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    condition = await db.patientcondition.create(
        data={
            "patientId": patient.id,
            **condition_data
        }
    )
    
    return condition


# ============================================================================
# MEDICAL RECORDS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/records")
async def get_patient_records(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Get all medical records for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id},
        include={
            "medicalRecords": {
                "include": {
                    "doctor": True,
                    "hospital": True
                },
                "order": {"visitDate": "desc"}
            }
        }
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    return patient.medicalRecords


# ============================================================================
# EMERGENCY FLAG ENDPOINTS
# ============================================================================

@app.post("/api/patients/{patient_id}/emergency")
async def set_emergency_flag(
    patient_id: str,
    emergency_data: dict,
    db: Prisma = Depends(get_prisma)
):
    """
    Set emergency flag for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    updated = await db.patient.update(
        where={"patientId": patient_id},
        data={
            "emergencyFlag": True,
            "emergencyType": emergency_data.get("emergency_type"),
            "emergencyNotes": emergency_data.get("emergency_notes")
        }
    )
    
    return updated


@app.delete("/api/patients/{patient_id}/emergency")
async def clear_emergency_flag(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """
    Clear emergency flag for a patient
    """
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    updated = await db.patient.update(
        where={"patientId": patient_id},
        data={
            "emergencyFlag": False,
            "emergencyType": None,
            "emergencyNotes": None
        }
    )
    
    return BaseResponse(
        success=True,
        message="Emergency flag cleared"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PATIENT_API_PORT", 8001)),
        reload=True
    )
