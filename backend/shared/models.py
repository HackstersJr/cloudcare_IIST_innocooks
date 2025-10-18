"""
Shared Pydantic Models for CloudCare APIs
Simplified schema matching the new database structure
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# =============================================================================
# PATIENT MODELS
# =============================================================================

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    familyContact: str
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

# =============================================================================
# USER LOGIN MODELS
# =============================================================================

class UserLoginCreate(BaseModel):
    email: str
    password: str

class UserLoginResponse(BaseModel):
    id: int
    email: str

# =============================================================================
# RELATIONSHIP MODELS
# =============================================================================

class PatientDoctorAssignment(BaseModel):
    patientId: int
    doctorId: int

class PatientHospitalAssignment(BaseModel):
    patientId: int
    hospitalId: int

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime, date
from enum import Enum


# ============================================================================
# ENUMS (matching Prisma schema)
# ============================================================================

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"


class BloodType(str, Enum):
    A_POSITIVE = "A_POSITIVE"
    A_NEGATIVE = "A_NEGATIVE"
    B_POSITIVE = "B_POSITIVE"
    B_NEGATIVE = "B_NEGATIVE"
    AB_POSITIVE = "AB_POSITIVE"
    AB_NEGATIVE = "AB_NEGATIVE"
    O_POSITIVE = "O_POSITIVE"
    O_NEGATIVE = "O_NEGATIVE"
    unknown = "unknown"


class EmergencySeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class EmergencyType(str, Enum):
    cardiac_arrest = "cardiac_arrest"
    fall_detection = "fall_detection"
    abnormal_vitals = "abnormal_vitals"
    manual_trigger = "manual_trigger"
    seizure = "seizure"
    unconscious = "unconscious"
    other = "other"


class WearableDataType(str, Enum):
    heart_rate = "heart_rate"
    blood_pressure = "blood_pressure"
    blood_oxygen = "blood_oxygen"
    steps = "steps"
    distance = "distance"
    calories = "calories"
    sleep = "sleep"
    temperature = "temperature"
    ecg = "ecg"
    glucose = "glucose"
    weight = "weight"
    activity = "activity"
    other = "other"


# ============================================================================
# BASE RESPONSE MODELS
# ============================================================================

class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None


# ============================================================================
# PATIENT MODELS
# ============================================================================

class FamilyContactCreate(BaseModel):
    name: str
    relationship: str
    contact: str
    email: Optional[EmailStr] = None
    is_primary: bool = False
    is_emergency_contact: bool = False


class PatientCreate(BaseModel):
    patient_id: str = Field(..., description="External patient ID")
    name: str
    age: int
    date_of_birth: date
    gender: Gender
    contact: str
    email: Optional[EmailStr] = None
    address: Dict[str, Any]
    blood_type: Optional[BloodType] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    family_contacts: List[FamilyContactCreate] = []


class PatientResponse(BaseModel):
    id: str
    patient_id: str
    name: str
    age: int
    gender: Gender
    contact: str
    emergency_flag: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# DOCTOR MODELS
# ============================================================================

class DoctorCreate(BaseModel):
    doctor_id: str
    name: str
    age: int
    gender: Gender
    contact: str
    email: EmailStr
    license_number: str
    specializations: List[str]
    qualification: List[str]
    experience: int = 0


class DoctorResponse(BaseModel):
    id: str
    doctor_id: str
    name: str
    specializations: List[str]
    contact: str
    email: str
    is_available: bool
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================================
# HOSPITAL MODELS
# ============================================================================

class HospitalCreate(BaseModel):
    hospital_name: str
    registration_number: str
    hospital_type: str
    contact: str
    email: EmailStr
    address: Dict[str, Any]
    website: Optional[str] = None
    total_beds: int = 0
    available_beds: int = 0
    emergency_services: bool = False
    specializations: List[str] = []
    accreditations: List[str] = []


class HospitalResponse(BaseModel):
    id: str
    hospital_name: str
    hospital_type: str
    contact: str
    available_beds: int
    emergency_services: bool
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================================
# WEARABLE DATA MODELS
# ============================================================================

class WearableDataCreate(BaseModel):
    data_id: str
    patient_id: str
    data_type: WearableDataType
    data_source: str
    encrypted_data: str
    data_snapshot: Dict[str, Any]
    recorded_at: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    consent_given: bool = False
    consent_id: Optional[str] = None


class WearableDataResponse(BaseModel):
    id: str
    data_id: str
    patient_id: str
    data_type: WearableDataType
    data_source: str
    data_snapshot: Dict[str, Any]
    recorded_at: datetime
    synced_at: datetime
    consent_given: bool

    class Config:
        from_attributes = True


# ============================================================================
# EMERGENCY MODELS
# ============================================================================

class EmergencyAlertCreate(BaseModel):
    alert_id: str
    patient_id: str
    hospital_id: Optional[str] = None
    alert_type: EmergencyType
    severity: EmergencySeverity
    description: str
    triggered_by: str
    trigger_data: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None


class EmergencyAlertResponse(BaseModel):
    id: str
    alert_id: str
    patient_id: str
    alert_type: EmergencyType
    severity: EmergencySeverity
    description: str
    status: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================================
# MEDICAL RECORD MODELS
# ============================================================================

class MedicalRecordCreate(BaseModel):
    record_id: str
    patient_id: str
    doctor_id: Optional[str] = None
    hospital_id: Optional[str] = None
    record_type: str
    title: str
    description: str
    diagnosis: List[str] = []
    symptoms: List[str] = []
    vital_signs: Optional[Dict[str, Any]] = None
    wearable_data_ids: List[str] = []
    visit_date: datetime
    notes: Optional[str] = None


class PrescriptionCreate(BaseModel):
    prescription_id: str
    patient_id: str
    doctor_id: str
    record_id: Optional[str] = None
    medications: List[Dict[str, Any]]
    dosage_instructions: str
    duration: str
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None
