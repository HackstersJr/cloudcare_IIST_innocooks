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
    PatientUpdate,
    PatientResponse,
    BaseResponse,
    RecordResponse,
    PrescriptionResponse,
    PatientConditionResponse,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse
)
from prisma import Prisma
from typing import List, Optional


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
    """Create a new patient record"""
    try:
        new_patient = await db.patient.create(
            data={
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "contact": patient.contact,
                "familyContact": patient.familyContact or patient.contact,
                "emergency": patient.emergency,
                "aiAnalysis": patient.aiAnalysis
            }
        )
        
        return new_patient
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patient: {str(e)}"
        )


@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get patient by ID"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
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
    """List all patients with pagination"""
    where_clause = {}
    if emergency_only:
        where_clause["emergency"] = True

    patients = await db.patient.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"id": "desc"}
    )
    
    return patients


@app.put("/api/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Prisma = Depends(get_prisma)
):
    """Update patient information"""
    existing = await db.patient.find_unique(where={"id": patient_id})
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    try:
        # Build update data dict with only provided fields
        update_data = {k: v for k, v in patient_data.dict(exclude_unset=True).items()}
        
        updated_patient = await db.patient.update(
            where={"id": patient_id},
            data=update_data
        )
        return updated_patient
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update patient: {str(e)}"
        )


@app.delete("/api/patients/{patient_id}", response_model=BaseResponse)
async def delete_patient(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Delete a patient"""
    existing = await db.patient.find_unique(where={"id": patient_id})
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    await db.patient.delete(where={"id": patient_id})
    
    return BaseResponse(
        success=True,
        message=f"Patient {patient_id} deleted successfully"
    )


# ============================================================================
# PATIENT CONDITIONS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/conditions", response_model=List[PatientConditionResponse])
async def get_patient_conditions(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get all conditions for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    conditions = await db.patientcondition.find_many(
        where={"patientId": patient_id},
        order={"startDate": "desc"}
    )
    
    return conditions


@app.post("/api/patients/{patient_id}/conditions", response_model=PatientConditionResponse)
async def add_patient_condition(
    patient_id: int,
    condition: str,
    startDate: str,
    endDate: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Add a condition for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    from datetime import datetime
    
    new_condition = await db.patientcondition.create(
        data={
            "patientId": patient_id,
            "condition": condition,
            "startDate": datetime.fromisoformat(startDate),
            "endDate": datetime.fromisoformat(endDate) if endDate else None
        }
    )
    
    return new_condition


# ============================================================================
# MEDICAL RECORDS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/records", response_model=List[RecordResponse])
async def get_patient_records(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get all medical records for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    records = await db.record.find_many(
        where={"patientId": patient_id},
        order={"date": "desc"}
    )
    
    return records


@app.post("/api/patients/{patient_id}/records", response_model=RecordResponse)
async def create_patient_record(
    patient_id: int,
    description: str,
    date: str,
    db: Prisma = Depends(get_prisma)
):
    """Create a new medical record for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    from datetime import datetime
    
    new_record = await db.record.create(
        data={
            "patientId": patient_id,
            "description": description,
            "date": datetime.fromisoformat(date)
        }
    )
    
    return new_record


# ============================================================================
# PRESCRIPTIONS ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/prescriptions", response_model=List[PrescriptionResponse])
async def get_patient_prescriptions(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get all prescriptions for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    prescriptions = await db.prescription.find_many(
        where={"patientId": patient_id},
        order={"startDate": "desc"}
    )
    
    return prescriptions


@app.post("/api/patients/{patient_id}/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    patient_id: int,
    medication: str,
    dosage: str,
    startDate: str,
    endDate: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Create a new prescription for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    from datetime import datetime
    
    new_prescription = await db.prescription.create(
        data={
            "patientId": patient_id,
            "medication": medication,
            "dosage": dosage,
            "startDate": datetime.fromisoformat(startDate),
            "endDate": datetime.fromisoformat(endDate) if endDate else None
        }
    )
    
    return new_prescription


# ============================================================================
# APPOINTMENT ENDPOINTS
# ============================================================================

@app.get("/api/patients/{patient_id}/appointments", response_model=List[AppointmentResponse])
async def get_patient_appointments(
    patient_id: int,
    status: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Get all appointments for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    where_clause = {"patientId": patient_id}
    if status:
        where_clause["status"] = status
    
    appointments = await db.appointment.find_many(
        where=where_clause,
        order={"appointmentDate": "desc"},
        include={
            "doctor": True,
            "hospital": True
        }
    )
    
    return appointments


@app.post("/api/patients/{patient_id}/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    patient_id: int,
    doctorId: int,
    hospitalId: int,
    appointmentDate: str,
    appointmentTime: str,
    department: str,
    notes: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Create a new appointment for a patient"""
    # Verify patient exists
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    # Verify doctor exists
    doctor = await db.doctor.find_unique(where={"id": doctorId})
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor {doctorId} not found"
        )
    
    # Verify hospital exists
    hospital = await db.hospital.find_unique(where={"id": hospitalId})
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospitalId} not found"
        )
    
    from datetime import datetime
    
    new_appointment = await db.appointment.create(
        data={
            "patientId": patient_id,
            "doctorId": doctorId,
            "hospitalId": hospitalId,
            "appointmentDate": datetime.fromisoformat(appointmentDate.split('T')[0]),
            "appointmentTime": appointmentTime,
            "department": department,
            "status": "scheduled",
            "notes": notes
        }
    )
    
    return new_appointment


@app.put("/api/patients/{patient_id}/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    patient_id: int,
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    db: Prisma = Depends(get_prisma)
):
    """Update an appointment"""
    appointment = await db.appointment.find_unique(where={"id": appointment_id})
    
    if not appointment or appointment.patientId != patient_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment {appointment_id} not found for patient {patient_id}"
        )
    
    update_data = {k: v for k, v in appointment_data.dict(exclude_unset=True).items()}
    
    # Handle datetime conversion if appointmentDate is provided
    if "appointmentDate" in update_data and update_data["appointmentDate"]:
        from datetime import datetime
        if isinstance(update_data["appointmentDate"], str):
            update_data["appointmentDate"] = datetime.fromisoformat(update_data["appointmentDate"].split('T')[0])
    
    updated_appointment = await db.appointment.update(
        where={"id": appointment_id},
        data=update_data
    )
    
    return updated_appointment


@app.delete("/api/patients/{patient_id}/appointments/{appointment_id}", response_model=BaseResponse)
async def delete_appointment(
    patient_id: int,
    appointment_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Delete/Cancel an appointment"""
    appointment = await db.appointment.find_unique(where={"id": appointment_id})
    
    if not appointment or appointment.patientId != patient_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment {appointment_id} not found for patient {patient_id}"
        )
    
    # Mark as cancelled instead of deleting
    await db.appointment.update(
        where={"id": appointment_id},
        data={"status": "cancelled"}
    )
    
    return BaseResponse(
        success=True,
        message=f"Appointment {appointment_id} cancelled successfully"
    )


# ============================================================================
# EMERGENCY FLAG ENDPOINTS
# ============================================================================

@app.post("/api/patients/{patient_id}/emergency", response_model=PatientResponse)
async def set_emergency_flag(
    patient_id: int,
    emergency: bool = True,
    aiAnalysis: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Set emergency flag for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    updated = await db.patient.update(
        where={"id": patient_id},
        data={
            "emergency": emergency,
            "aiAnalysis": aiAnalysis
        }
    )
    
    return updated


@app.delete("/api/patients/{patient_id}/emergency", response_model=BaseResponse)
async def clear_emergency_flag(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Clear emergency flag for a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    await db.patient.update(
        where={"id": patient_id},
        data={
            "emergency": False,
            "aiAnalysis": None
        }
    )
    
    return BaseResponse(
        success=True,
        message="Emergency flag cleared"
    )


# ============================================================================
# PATIENT-DOCTOR RELATIONSHIPS
# ============================================================================

@app.get("/api/patients/{patient_id}/doctors")
async def get_patient_doctors(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get all doctors assigned to a patient"""
    patient = await db.patient.find_unique(
        where={"id": patient_id},
        include={"doctors": True}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    return patient.doctors


@app.post("/api/patients/{patient_id}/doctors/{doctor_id}", response_model=BaseResponse)
async def assign_doctor_to_patient(
    patient_id: int,
    doctor_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Assign a doctor to a patient"""
    patient = await db.patient.find_unique(where={"id": patient_id})
    doctor = await db.doctor.find_unique(where={"id": doctor_id})
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Connect doctor to patient
    await db.patient.update(
        where={"id": patient_id},
        data={
            "doctors": {
                "connect": {"id": doctor_id}
            }
        }
    )
    
    return BaseResponse(
        success=True,
        message=f"Doctor {doctor_id} assigned to patient {patient_id}"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PATIENT_API_PORT", 8001)),
        reload=True
    )
