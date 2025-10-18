"""
Shared Pydantic Models for CloudCare APIs
Simplified schema matching the database structure
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# =============================================================================
# BASE RESPONSE MODELS
# =============================================================================

class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

# =============================================================================
# PATIENT MODELS
# =============================================================================

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    familyContact: Optional[str] = None
    emergency: bool = False
    aiAnalysis: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    familyContact: Optional[str] = None
    emergency: Optional[bool] = None
    aiAnalysis: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    contact: str
    familyContact: str
    emergency: bool
    aiAnalysis: Optional[str]

    class Config:
        from_attributes = True

# =============================================================================
# DOCTOR MODELS
# =============================================================================

class DoctorCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    specializations: str
    hospitalId: Optional[int] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    specializations: Optional[str] = None
    hospitalId: Optional[int] = None

class DoctorResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    contact: str
    specializations: str
    hospitalId: Optional[int]

    class Config:
        from_attributes = True

# =============================================================================
# HOSPITAL MODELS
# =============================================================================

class HospitalCreate(BaseModel):
    name: str

class HospitalUpdate(BaseModel):
    name: Optional[str] = None

class HospitalResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# =============================================================================
# RECORD MODELS
# =============================================================================

class RecordCreate(BaseModel):
    patientId: int
    description: str
    date: datetime

class RecordUpdate(BaseModel):
    description: Optional[str] = None
    date: Optional[datetime] = None

class RecordResponse(BaseModel):
    id: int
    patientId: int
    description: str
    date: datetime

    class Config:
        from_attributes = True

# =============================================================================
# PRESCRIPTION MODELS
# =============================================================================

class PrescriptionCreate(BaseModel):
    patientId: int
    medication: str
    dosage: str
    startDate: datetime
    endDate: Optional[datetime] = None

class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

class PrescriptionResponse(BaseModel):
    id: int
    patientId: int
    medication: str
    dosage: str
    startDate: datetime
    endDate: Optional[datetime]

    class Config:
        from_attributes = True

# =============================================================================
# PATIENT CONDITION MODELS
# =============================================================================

class PatientConditionCreate(BaseModel):
    patientId: int
    condition: str
    startDate: datetime
    endDate: Optional[datetime] = None

class PatientConditionUpdate(BaseModel):
    condition: Optional[str] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

class PatientConditionResponse(BaseModel):
    id: int
    patientId: int
    condition: str
    startDate: datetime
    endDate: Optional[datetime]

    class Config:
        from_attributes = True

# =============================================================================
# WEARABLE DATA MODELS
# =============================================================================

class WearableDataCreate(BaseModel):
    patientId: int
    timestamp: datetime
    heartRate: Optional[int] = None
    steps: Optional[int] = None
    sleepHours: Optional[float] = None
    oxygenLevel: Optional[float] = None
    description: Optional[str] = None
    recordId: Optional[int] = None

class WearableDataUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    heartRate: Optional[int] = None
    steps: Optional[int] = None
    sleepHours: Optional[float] = None
    oxygenLevel: Optional[float] = None
    description: Optional[str] = None

class WearableDataResponse(BaseModel):
    id: int
    patientId: int
    timestamp: datetime
    heartRate: Optional[int]
    steps: Optional[int]
    sleepHours: Optional[float]
    oxygenLevel: Optional[float]
    description: Optional[str]
    recordId: Optional[int]

    class Config:
        from_attributes = True

# =============================================================================
# USER LOGIN MODELS
# =============================================================================

class UserLoginCreate(BaseModel):
    email: str
    password: str

class UserLoginResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

# =============================================================================
# RELATIONSHIP MODELS
# =============================================================================

class PatientDoctorAssignment(BaseModel):
    patientId: int
    doctorId: int

class PatientHospitalAssignment(BaseModel):
    patientId: int
    hospitalId: int
