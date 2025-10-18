"""
Wearables API Server - Port 8005
HCGateway Compatible Wearable Data Sync Service (v2 with Bearer Token Auth)

Compatible with HCGateway v2 API format for wearable device data synchronization.
Uses MongoDB-style user management with Bearer token authentication.
"""

from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path for shared modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import get_prisma, connect_db, disconnect_db
from prisma import Prisma

# Cryptography imports for HCGateway-style encryption
from cryptography.fernet import Fernet
import base64
import json
import secrets
from argon2 import PasswordHasher

ph = PasswordHasher()

app = FastAPI(
    title="CloudCare Wearables API",
    description="HCGateway v2 compatible wearable data synchronization with Bearer token auth",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# STARTUP/SHUTDOWN
# =============================================================================

@app.on_event("startup")
async def startup():
    await connect_db()
    print("✅ Wearables API (HCGateway v2) connected to database")

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
    print("🔌 Wearables API disconnected from database")

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class LoginRequest(BaseModel):
    username: str  # Can be email or patient ID
    password: str
    fcmToken: Optional[str] = None

class LoginResponse(BaseModel):
    token: str
    refresh: str
    expiry: str

class RefreshRequest(BaseModel):
    refresh: str

class WearableSyncRequest(BaseModel):
    data: List[Dict[str, Any]]

class WearableFetchRequest(BaseModel):
    queries: Optional[Dict[str, Any]] = {}

# =============================================================================
# ENCRYPTION UTILITIES (HCGateway Compatible)
# =============================================================================

def get_encryption_key_from_password(password_hash: str) -> bytes:
    """Generate encryption key from hashed password (HCGateway v2 pattern)"""
    key = base64.urlsafe_b64encode(password_hash.encode("utf-8").ljust(32)[:32])
    return key

def encrypt_data(data: Dict[str, Any], encryption_key: bytes) -> str:
    """Encrypt wearable data"""
    fernet = Fernet(encryption_key)
    data_json = json.dumps(data).encode()
    encrypted = fernet.encrypt(data_json)
    return encrypted.decode()

def decrypt_data(encrypted_data: str, encryption_key: bytes) -> Dict[str, Any]:
    """Decrypt wearable data"""
    fernet = Fernet(encryption_key)
    decrypted = fernet.decrypt(encrypted_data.encode())
    return json.loads(decrypted.decode())

# =============================================================================
# AUTH MIDDLEWARE
# =============================================================================

async def verify_token(
    authorization: Optional[str] = Header(None),
    db: Prisma = Depends(get_prisma)
) -> Dict[str, Any]:
    """Verify Bearer token and return user info"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="No token provided. Include 'Authorization: Bearer <token>' header"
        )
    
    token = authorization.split(" ")[1]
    
    # Find user with this token
    user_login = await db.userlogin.find_first(
        where={
            "email": {"contains": token[:10]}  # Simplified: store token in a custom field in real impl
        }
    )
    
    if not user_login:
        raise HTTPException(status_code=403, detail="Invalid token")
    
    # TODO: Check token expiry (would need additional fields in schema)
    
    return {"user_id": user_login.id, "email": user_login.email}

# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/")
def root():
    return {
        "service": "wearables-gateway",
        "version": "v2",
        "endpoints": ["/api/v2/"],
        "description": "HCGateway v2 compatible API with Bearer token authentication"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "wearables", "version": "v2"}

# =============================================================================
# AUTH ENDPOINTS (HCGateway v2 Compatible)
# =============================================================================

@app.post("/api/v2/login", status_code=status.HTTP_201_CREATED)
async def login(
    request: LoginRequest,
    db: Prisma = Depends(get_prisma)
) -> LoginResponse:
    """
    HCGateway v2 Login
    Creates or authenticates user and returns Bearer token
    """
    try:
        # Try to find existing user by email or patient link
        user = await db.userlogin.find_unique(where={"email": request.username})
        
        if not user:
            # Create new user
            hashed_password = ph.hash(request.password)
            user = await db.userlogin.create(
                data={
                    "email": request.username,
                    "password": hashed_password
                }
            )
            
            # Generate tokens
            token = secrets.token_urlsafe(32)
            refresh = secrets.token_urlsafe(32)
            expiry = datetime.now() + timedelta(hours=12)
            
            # TODO: Store token, refresh, expiry in user record (needs schema update)
            
            return LoginResponse(
                token=token,
                refresh=refresh,
                expiry=expiry.isoformat()
            )
        
        # Verify password
        try:
            ph.verify(user.password, request.password)
        except:
            raise HTTPException(status_code=403, detail="Invalid password")
        
        # Generate new tokens
        token = secrets.token_urlsafe(32)
        refresh = secrets.token_urlsafe(32)
        expiry = datetime.now() + timedelta(hours=12)
        
        return LoginResponse(
            token=token,
            refresh=refresh,
            expiry=expiry.isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v2/refresh")
async def refresh_token(
    request: RefreshRequest,
    db: Prisma = Depends(get_prisma)
) -> LoginResponse:
    """Refresh access token using refresh token"""
    # TODO: Implement refresh token validation
    token = secrets.token_urlsafe(32)
    expiry = datetime.now() + timedelta(hours=12)
    
    return LoginResponse(
        token=token,
        refresh=request.refresh,
        expiry=expiry.isoformat()
    )

@app.delete("/api/v2/revoke")
async def revoke_token(
    user: Dict = Depends(verify_token)
):
    """Revoke current access token"""
    # TODO: Implement token revocation
    return {"success": True}

# =============================================================================
# WEARABLE DATA SYNC (HCGateway v2 Compatible)
# =============================================================================

@app.post("/api/v2/sync/{method}")
async def sync_wearable_data(
    method: str,
    request: WearableSyncRequest,
    user: Dict = Depends(verify_token),
    db: Prisma = Depends(get_prisma)
):
    """
    HCGateway v2 Compatible Sync
    Syncs wearable data from device
    
    Method: heartrate, steps, sleep, bloodpressure, etc.
    Data format: Same as HCGateway v2
    """
    try:
        # Get user's linked patient
        user_login = await db.userlogin.find_unique(
            where={"id": user["user_id"]},
            include={"patients": True}
        )
        
        if not user_login or not user_login.patients:
            raise HTTPException(status_code=404, detail="No patient linked to this account")
        
        patient = user_login.patients[0]  # Use first linked patient
        
        # Get encryption key from user password
        encryption_key = get_encryption_key_from_password(user_login.password)
        
        synced_count = 0
        for item in request.data:
            # Extract metadata
            metadata = item.get("metadata", {})
            item_id = metadata.get("id", f"wearable_{datetime.now().timestamp()}")
            data_origin = metadata.get("dataOrigin", "Unknown")
            
            # Extract timing
            if "time" in item:
                recorded_at = datetime.fromisoformat(item["time"].replace('Z', '+00:00'))
                start_time = None
                end_time = None
            else:
                start_time = datetime.fromisoformat(item["startTime"].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(item["endTime"].replace('Z', '+00:00'))
                recorded_at = start_time
            
            # Extract data fields
            data_obj = {k: v for k, v in item.items() 
                       if k not in ["metadata", "time", "startTime", "endTime"]}
            
            # Encrypt data
            encrypted_data = encrypt_data(data_obj, encryption_key)
            
            # Create wearable data record
            await db.wearabledata.create(
                data={
                    "patientId": patient.id,
                    "timestamp": recorded_at,
                    "heartRate": data_obj.get("heartRate"),
                    "steps": data_obj.get("steps"),
                    "sleepHours": data_obj.get("sleepHours"),
                    "oxygenLevel": data_obj.get("oxygenLevel"),
                    "description": json.dumps({
                        "source": data_origin,
                        "method": method,
                        "itemId": item_id,
                        "encrypted": encrypted_data,
                        "raw": data_obj
                    })
                }
            )
            synced_count += 1
        
        return {"success": True, "synced": synced_count}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v2/fetch/{method}")
async def fetch_wearable_data(
    method: str,
    request: WearableFetchRequest,
    user: Dict = Depends(verify_token),
    db: Prisma = Depends(get_prisma)
):
    """
    HCGateway v2 Compatible Fetch
    Retrieves wearable data
    """
    try:
        # Get user's linked patient
        user_login = await db.userlogin.find_unique(
            where={"id": user["user_id"]},
            include={"patients": True}
        )
        
        if not user_login or not user_login.patients:
            raise HTTPException(status_code=404, detail="No patient linked")
        
        patient = user_login.patients[0]
        
        # Fetch wearable data
        wearable_data = await db.wearabledata.find_many(
            where={"patientId": patient.id},
            order_by={"timestamp": "desc"},
            take=100
        )
        
        # Get encryption key
        encryption_key = get_encryption_key_from_password(user_login.password)
        
        # Format response
        results = []
        for data in wearable_data:
            desc = json.loads(data.description or "{}")
            try:
                decrypted = decrypt_data(desc.get("encrypted", ""), encryption_key)
                results.append({
                    "_id": desc.get("itemId", str(data.id)),
                    "id": desc.get("itemId", str(data.id)),
                    "data": decrypted,
                    "app": desc.get("source", "Unknown"),
                    "start": data.timestamp.isoformat(),
                    "end": None
                })
            except:
                # If decryption fails, return raw data
                results.append({
                    "_id": str(data.id),
                    "id": str(data.id),
                    "data": desc.get("raw", {}),
                    "app": desc.get("source", "Unknown"),
                    "start": data.timestamp.isoformat(),
                    "end": None
                })
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v2/sync/{method}")
async def delete_from_db(
    method: str,
    user: Dict = Depends(verify_token),
    db: Prisma = Depends(get_prisma)
):
    """Delete wearable data from database"""
    # TODO: Implement deletion logic
    return {"success": True}

# =============================================================================
# ADDITIONAL ENDPOINTS
# =============================================================================

@app.get("/api/v2/latest/{patient_id}")
async def get_latest_vitals(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get latest vital signs for a patient"""
    try:
        latest = await db.wearabledata.find_first(
            where={"patientId": patient_id},
            order_by={"timestamp": "desc"}
        )
        
        if not latest:
            raise HTTPException(status_code=404, detail="No wearable data found")
        
        return {
            "patientId": patient_id,
            "timestamp": latest.timestamp.isoformat(),
            "heartRate": latest.heartRate,
            "steps": latest.steps,
            "sleepHours": latest.sleepHours,
            "oxygenLevel": latest.oxygenLevel
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)

from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os
import json
import base64
from datetime import datetime
from typing import List, Optional, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import connect_db, disconnect_db, get_prisma
from shared.models import WearableDataCreate, WearableDataResponse, BaseResponse
from prisma import Prisma
from cryptography.fernet import Fernet


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection"""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="CloudCare Wearables API",
    description="API for wearable data sync and management (HCGateway integration)",
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
# HELPER FUNCTIONS
# ============================================================================

def get_encryption_key(patient_id: str) -> bytes:
    """
    Generate encryption key based on patient ID
    Compatible with HCGateway encryption pattern
    """
    # In production, use a more secure key derivation
    key = base64.urlsafe_b64encode(patient_id.encode("utf-8").ljust(32)[:32])
    return key


def encrypt_data(data: dict, key: bytes) -> str:
    """Encrypt wearable data"""
    fernet = Fernet(key)
    json_data = json.dumps(data).encode()
    encrypted = fernet.encrypt(json_data)
    return encrypted.decode()


def decrypt_data(encrypted_data: str, key: bytes) -> dict:
    """Decrypt wearable data"""
    fernet = Fernet(key)
    decrypted = fernet.decrypt(encrypted_data.encode())
    return json.loads(decrypted.decode())


# ============================================================================
# WEARABLE DATA ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CloudCare Wearables API",
        "version": "1.0.0",
        "status": "running",
        "description": "HCGateway integration for wearable data"
    }


@app.post("/api/wearables/sync", status_code=status.HTTP_201_CREATED)
async def sync_wearable_data(
    sync_data: Dict[str, Any],
    db: Prisma = Depends(get_prisma)
):
    """
    Sync wearable data from HCGateway to CloudCare database
    
    Expected format (compatible with HCGateway):
    {
        "patient_id": "P001",
        "method": "heartRate",
        "data": [
            {
                "metadata": {
                    "id": "uuid",
                    "dataOrigin": "GoogleFit"
                },
                "time": "2024-01-01T12:00:00Z",
                "value": 75,
                ...other fields
            }
        ]
    }
    """
    try:
        patient_id = sync_data.get("patient_id")
        method = sync_data.get("method")
        data_items = sync_data.get("data", [])
        
        if not patient_id or not method or not data_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: patient_id, method, data"
            )
        
        # Verify patient exists
        patient = await db.patient.find_unique(
            where={"patientId": patient_id}
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient {patient_id} not found"
            )
        
        # Check consent
        consent = await db.consentrecord.find_first(
            where={
                "patientId": patient.id,
                "consentGiven": True,
                "status": "active"
            }
        )
        
        consent_given = consent is not None
        consent_id = consent.id if consent else None
        
        # Get encryption key
        encryption_key = get_encryption_key(patient_id)
        
        synced_count = 0
        
        for item in data_items:
            try:
                data_id = item.get("metadata", {}).get("id")
                data_source = item.get("metadata", {}).get("dataOrigin", "Unknown")
                
                if not data_id:
                    continue
                
                # Extract timing information
                recorded_at = item.get("time")
                start_time = item.get("startTime")
                end_time = item.get("endTime")
                
                if not recorded_at and not start_time:
                    continue
                
                # Prepare data for encryption (remove metadata and timing)
                data_obj = {k: v for k, v in item.items() 
                           if k not in ["metadata", "time", "startTime", "endTime"]}
                
                # Encrypt data
                encrypted_data = encrypt_data(data_obj, encryption_key)
                
                # Create data snapshot for quick access (unencrypted summary)
                data_snapshot = {
                    "method": method,
                    "source": data_source,
                    "summary": {k: v for k, v in list(data_obj.items())[:5]}  # First 5 fields
                }
                
                # Convert datetime strings to datetime objects
                recorded_dt = datetime.fromisoformat(recorded_at.replace('Z', '+00:00')) if recorded_at else datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00')) if start_time else None
                end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00')) if end_time else None
                
                # Check if data already exists
                existing = await db.wearabledata.find_unique(
                    where={"dataId": data_id}
                )
                
                if existing:
                    # Update existing record
                    await db.wearabledata.update(
                        where={"dataId": data_id},
                        data={
                            "encryptedData": encrypted_data,
                            "dataSnapshot": data_snapshot,
                            "syncedAt": datetime.now(),
                            "syncStatus": "synced"
                        }
                    )
                else:
                    # Create new record
                    await db.wearabledata.create(
                        data={
                            "dataId": data_id,
                            "patientId": patient.id,
                            "dataType": method.lower().replace("rate", "_rate"),
                            "dataSource": data_source,
                            "encryptedData": encrypted_data,
                            "dataSnapshot": data_snapshot,
                            "recordedAt": recorded_dt,
                            "startTime": start_dt,
                            "endTime": end_dt,
                            "consentGiven": consent_given,
                            "consentId": consent_id,
                            "syncStatus": "synced"
                        }
                    )
                
                synced_count += 1
                
            except Exception as e:
                print(f"Error syncing item {item.get('metadata', {}).get('id')}: {e}")
                continue
        
        return {
            "success": True,
            "message": f"Synced {synced_count} wearable data items for patient {patient_id}",
            "synced_count": synced_count,
            "total_items": len(data_items)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync wearable data: {str(e)}"
        )


@app.get("/api/wearables/patients/{patient_id}", response_model=List[WearableDataResponse])
async def get_patient_wearable_data(
    patient_id: str,
    data_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    db: Prisma = Depends(get_prisma)
):
    """Get wearable data for a patient"""
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    where_clause = {"patientId": patient.id}
    
    if data_type:
        where_clause["dataType"] = data_type
    
    if start_date:
        where_clause["recordedAt"] = {"gte": datetime.fromisoformat(start_date)}
    
    if end_date:
        if "recordedAt" in where_clause:
            where_clause["recordedAt"]["lte"] = datetime.fromisoformat(end_date)
        else:
            where_clause["recordedAt"] = {"lte": datetime.fromisoformat(end_date)}
    
    wearable_data = await db.wearabledata.find_many(
        where=where_clause,
        order={"recordedAt": "desc"},
        take=limit
    )
    
    return wearable_data


@app.get("/api/wearables/patients/{patient_id}/decrypt/{data_id}")
async def get_decrypted_wearable_data(
    patient_id: str,
    data_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Get and decrypt wearable data for a specific record"""
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    wearable_record = await db.wearabledata.find_unique(
        where={"dataId": data_id}
    )
    
    if not wearable_record or wearable_record.patientId != patient.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wearable data not found"
        )
    
    try:
        # Decrypt data
        encryption_key = get_encryption_key(patient_id)
        decrypted_data = decrypt_data(wearable_record.encryptedData, encryption_key)
        
        return {
            "data_id": data_id,
            "patient_id": patient_id,
            "data_type": wearable_record.dataType,
            "data_source": wearable_record.dataSource,
            "recorded_at": wearable_record.recordedAt,
            "data": decrypted_data,
            "consent_given": wearable_record.consentGiven
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt data: {str(e)}"
        )


@app.get("/api/wearables/patients/{patient_id}/latest")
async def get_latest_vitals(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Get latest vital signs from wearable data for a patient"""
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    # Get latest data for each vital type
    vital_types = ["heart_rate", "blood_pressure", "blood_oxygen", "temperature"]
    latest_vitals = {}
    
    for vital_type in vital_types:
        latest = await db.wearabledata.find_first(
            where={
                "patientId": patient.id,
                "dataType": vital_type
            },
            order={"recordedAt": "desc"}
        )
        
        if latest:
            latest_vitals[vital_type] = {
                "value": latest.dataSnapshot,
                "recorded_at": latest.recordedAt,
                "source": latest.dataSource
            }
    
    return {
        "patient_id": patient_id,
        "vitals": latest_vitals,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# CONSENT MANAGEMENT
# ============================================================================

@app.post("/api/wearables/consent")
async def create_consent(
    consent_data: Dict[str, Any],
    db: Prisma = Depends(get_prisma)
):
    """Create or update wearable data consent for a patient"""
    patient_id = consent_data.get("patient_id")
    
    if not patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="patient_id is required"
        )
    
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    # Create consent record
    consent = await db.consentrecord.create(
        data={
            "patientId": patient.id,
            "consentType": "wearable_data_storage",
            "consentGiven": consent_data.get("consent_given", True),
            "consentDate": datetime.now(),
            "dataTypes": consent_data.get("data_types", []),
            "purpose": consent_data.get("purpose", "Healthcare monitoring and analysis"),
            "status": "active"
        }
    )
    
    return {
        "success": True,
        "message": "Consent recorded successfully",
        "consent_id": consent.id
    }


@app.get("/api/wearables/consent/{patient_id}")
async def get_consent_status(
    patient_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Get consent status for a patient"""
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    consents = await db.consentrecord.find_many(
        where={"patientId": patient.id},
        order={"consentDate": "desc"}
    )
    
    return {
        "patient_id": patient_id,
        "consents": consents,
        "has_active_consent": any(c.consentGiven and c.status == "active" for c in consents)
    }


# ============================================================================
# STATISTICS
# ============================================================================

@app.get("/api/wearables/statistics")
async def get_wearable_statistics(
    db: Prisma = Depends(get_prisma)
):
    """Get wearable data system statistics"""
    total_records = await db.wearabledata.count()
    synced_records = await db.wearabledata.count(where={"syncStatus": "synced"})
    pending_records = await db.wearabledata.count(where={"syncStatus": "pending"})
    
    # Patients with wearable data
    patients_with_data = await db.patient.count(
        where={"wearableData": {"some": {}}}
    )
    
    # Active consents
    active_consents = await db.consentrecord.count(
        where={"consentGiven": True, "status": "active"}
    )
    
    return {
        "total_records": total_records,
        "synced_records": synced_records,
        "pending_records": pending_records,
        "patients_with_data": patients_with_data,
        "active_consents": active_consents,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("WEARABLES_API_PORT", 8005)),
        reload=True
    )
