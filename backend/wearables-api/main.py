"""
CloudCare Wearables API - HCGateway v2 Compatible
Port 8005 - Network accessible for mobile device sync

Compatible with HCGateway mobile app for Android Health Connect data sync.
Simplified schema integration with CloudCare patient records.
"""

from fastapi import FastAPI, HTTPException, Depends, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import sys
import os
import json
import base64
import secrets

# Add parent directory for shared modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import get_prisma, connect_db, disconnect_db
from prisma import Prisma

# Encryption imports (HCGateway compatible)
from cryptography.fernet import Fernet
from argon2 import PasswordHasher

ph = PasswordHasher()

app = FastAPI(
    title="CloudCare Wearables API",
    description="HCGateway v2 compatible wearable data synchronization - Network accessible",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Allow all origins for mobile device access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow mobile devices on same network
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
    print("=" * 60)
    print("✅ CloudCare Wearables API Started")
    print("📱 HCGateway v2 Compatible - Mobile devices can connect!")
    print("🌐 Network: Accessible on http://0.0.0.0:8005")
    print("📡 Local: http://localhost:8005")
    print("📚 Docs: http://localhost:8005/docs")
    print("=" * 60)

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
    print("🔌 Wearables API disconnected from database")

# =============================================================================
# PYDANTIC MODELS (HCGateway v2 Compatible)
# =============================================================================

class LoginRequest(BaseModel):
    username: str  # Patient ID or email
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

class FetchRequest(BaseModel):
    queries: Optional[Dict[str, Any]] = {}

# =============================================================================
# ENCRYPTION UTILITIES (HCGateway v2 Pattern)
# =============================================================================

def get_encryption_key_from_password(password_hash: str) -> bytes:
    """Generate encryption key from hashed password (matches HCGateway pattern)"""
    key = base64.urlsafe_b64encode(password_hash.encode("utf-8").ljust(32)[:32])
    return key

def encrypt_data(data: Dict[str, Any], encryption_key: bytes) -> str:
    """Encrypt wearable data using Fernet"""
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
# TOKEN STORAGE (Database-backed for persistence)
# =============================================================================

async def store_token(token: str, refresh: str, user_id: int, expiry: datetime, db: Prisma):
    """Store token in database for persistence across restarts"""
    await db.userlogin.update(
        where={"id": user_id},
        data={
            "description": json.dumps({
                "token": token,
                "refresh": refresh,
                "expiry": expiry.isoformat()
            })
        }
    )

async def validate_token(token: str, db: Prisma) -> Optional[Dict]:
    """Validate and return token data from database"""
    # Find user with this token
    users = await db.userlogin.find_many()
    
    for user in users:
        if user.description:
            try:
                token_data = json.loads(user.description)
                if token_data.get("token") == token:
                    # Check expiry
                    expiry = datetime.fromisoformat(token_data["expiry"])
                    if datetime.now() > expiry:
                        print(f"⚠️  Token expired for user {user.id}")
                        return None
                    
                    return {
                        "user_id": user.id,
                        "expiry": expiry
                    }
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"⚠️  Error parsing token data for user {user.id}: {e}")
                continue
    
    return None

# =============================================================================
# AUTH MIDDLEWARE
# =============================================================================

async def verify_bearer_token(
    authorization: Optional[str] = Header(None),
    db: Prisma = Depends(get_prisma)
) -> Dict[str, Any]:
    """Verify Bearer token from HCGateway mobile app"""
    if not authorization:
        print("❌ AUTH ERROR: No authorization header provided")
        raise HTTPException(
            status_code=400,
            detail={"error": "no token provided"}
        )
    
    if not authorization.startswith("Bearer "):
        print(f"❌ AUTH ERROR: Invalid authorization header format: {authorization[:20]}...")
        raise HTTPException(
            status_code=400,
            detail={"error": "invalid authorization header"}
        )
    
    token = authorization.split(" ")[1]
    print(f"🔑 Validating token: {token[:10]}...")
    
    # Validate token from database
    token_data = await validate_token(token, db)
    if not token_data:
        print(f"❌ AUTH ERROR: Invalid or expired token: {token[:10]}...")
        raise HTTPException(
            status_code=403,
            detail={"error": "invalid or expired token. Please login again at /api/v2/login"}
        )
    
    # Get user
    user_login = await db.userlogin.find_unique(
        where={"id": token_data["user_id"]},
        include={"patients": True}
    )
    
    if not user_login:
        print(f"❌ AUTH ERROR: User {token_data['user_id']} not found in database")
        raise HTTPException(
            status_code=403,
            detail={"error": "user not found"}
        )
    
    print(f"✅ Token validated for user {user_login.email}")
    
    return {
        "user_id": user_login.id,
        "email": user_login.email,
        "patient": user_login.patients[0] if user_login.patients else None,
        "password_hash": user_login.password
    }

# =============================================================================
# ROOT ENDPOINTS
# =============================================================================

@app.get("/")
def root():
    """Root endpoint - mobile app discovery"""
    return {
        "service": "CloudCare Wearables Gateway",
        "version": "v2",
        "compatible": "HCGateway v2 API",
        "status": "running",
        "endpoints": {
            "login": "/api/v2/login",
            "refresh": "/api/v2/refresh",
            "sync": "/api/v2/sync/{method}",
            "fetch": "/api/v2/fetch/{method}",
            "docs": "/docs"
        },
        "network": "accessible",
        "message": "Mobile devices can connect from same network"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "wearables-gateway",
        "version": "v2",
        "timestamp": datetime.now().isoformat()
    }

# =============================================================================
# AUTH ENDPOINTS (HCGateway v2 Compatible)
# =============================================================================

@app.post("/api/v2/login", status_code=201)
async def login(
    request: LoginRequest,
    db: Prisma = Depends(get_prisma)
) -> LoginResponse:
    """
    HCGateway v2 Compatible Login
    Mobile app authenticates and gets token
    
    username: Patient ID (e.g., "1", "2") or email
    password: User password
    """
    try:
        # Try to find user by email
        user = await db.userlogin.find_unique(
            where={"email": request.username},
            include={"patients": True}
        )
        
        if not user:
            # Try to find patient by ID and create user
            try:
                patient_id = int(request.username)
                patient = await db.patient.find_unique(where={"id": patient_id})
                
                if patient:
                    # Create new user for this patient
                    hashed_password = ph.hash(request.password)
                    user = await db.userlogin.create(
                        data={
                            "email": f"patient{patient_id}@cloudcare.local",
                            "password": hashed_password
                        }
                    )
                    
                    # Link user to patient
                    await db.patient.update(
                        where={"id": patient_id},
                        data={"userLoginId": user.id}
                    )
                    
                    # Generate tokens
                    token = secrets.token_urlsafe(32)
                    refresh = secrets.token_urlsafe(32)
                    expiry = datetime.now() + timedelta(hours=12)
                    
                    await store_token(token, refresh, user.id, expiry, db)
                    
                    print(f"✅ New user created and logged in: {user.email}")
                    
                    return LoginResponse(
                        token=token,
                        refresh=refresh,
                        expiry=expiry.isoformat()
                    )
            except ValueError:
                pass
            
            raise HTTPException(
                status_code=404,
                detail={"error": "user not found"}
            )
        
        # Verify password
        try:
            ph.verify(user.password, request.password)
        except Exception as e:
            print(f"❌ Password verification failed for {user.email}: {e}")
            raise HTTPException(
                status_code=403,
                detail={"error": "invalid password"}
            )
        
        # Check if user has valid token already
        if user.description:
            try:
                token_data = json.loads(user.description)
                existing_expiry = datetime.fromisoformat(token_data["expiry"])
                
                # If token still valid, return it
                if datetime.now() < existing_expiry:
                    print(f"✅ Returning existing valid token for user {user.email}")
                    return LoginResponse(
                        token=token_data["token"],
                        refresh=token_data["refresh"],
                        expiry=token_data["expiry"]
                    )
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"⚠️  Could not parse existing token data: {e}")
        
        # Generate new tokens
        token = secrets.token_urlsafe(32)
        refresh = secrets.token_urlsafe(32)
        expiry = datetime.now() + timedelta(hours=12)
        
        await store_token(token, refresh, user.id, expiry, db)
        
        print(f"✅ Login successful for user {user.email}, new token generated")
        
        return LoginResponse(
            token=token,
            refresh=refresh,
            expiry=expiry.isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": str(e)}
        )

@app.post("/api/v2/refresh", status_code=200)
async def refresh_token(request: RefreshRequest) -> LoginResponse:
    """Refresh access token"""
    # Simplified: Generate new token (enhance for production)
    token = secrets.token_urlsafe(32)
    expiry = datetime.now() + timedelta(hours=12)
    
    return LoginResponse(
        token=token,
        refresh=request.refresh,
        expiry=expiry.isoformat()
    )

@app.delete("/api/v2/revoke", status_code=200)
async def revoke_token(user: Dict = Depends(verify_bearer_token)):
    """Revoke current access token"""
    # Remove from token store (simplified)
    return {"success": True}

# =============================================================================
# WEARABLE DATA SYNC (HCGateway v2 Compatible)
# =============================================================================

@app.post("/api/v2/sync/{method}", status_code=200)
async def sync_wearable_data(
    method: str,
    request: WearableSyncRequest,
    user: Dict = Depends(verify_bearer_token),
    db: Prisma = Depends(get_prisma)
):
    """
    HCGateway v2 Compatible Sync Endpoint
    Receives data from mobile app and stores in CloudCare
    
    Method examples: heartRate, steps, sleepSession, bloodPressure, etc.
    
    Data format (per HCGateway spec):
    {
        "data": [
            {
                "metadata": {
                    "id": "uuid-here",
                    "dataOrigin": "com.google.android.apps.fitness"
                },
                "time": "2025-10-18T10:30:00Z",  // For instant readings
                // OR
                "startTime": "2025-10-18T22:00:00Z",  // For time-series
                "endTime": "2025-10-18T06:00:00Z",
                
                // Data fields (varies by method)
                "beatsPerMinute": 72,
                "samples": [...],
                ...
            }
        ]
    }
    """
    try:
        print(f"\n{'='*60}")
        print(f"📱 SYNC REQUEST: {method}")
        print(f"User: {user.get('email')}")
        print(f"Records: {len(request.data)}")
        print(f"{'='*60}")
        
        if not user.get("patient"):
            print(f"❌ SYNC ERROR: No patient linked to user {user.get('email')}")
            raise HTTPException(
                status_code=404,
                detail={"error": "no patient linked to this account"}
            )
        
        patient = user["patient"]
        encryption_key = get_encryption_key_from_password(user["password_hash"])
        
        synced_count = 0
        error_count = 0
        
        print(f"📱 Syncing {len(request.data)} {method} records for patient {patient.id} ({patient.name})")
        
        for idx, item in enumerate(request.data):
            try:
                # Extract metadata
                metadata = item.get("metadata", {})
                item_id = metadata.get("id", f"wearable_{datetime.now().timestamp()}")
                data_origin = metadata.get("dataOrigin", "Unknown")
                
                # Extract timing
                if "time" in item:
                    # Instant reading
                    timestamp = datetime.fromisoformat(item["time"].replace('Z', '+00:00'))
                    start_time = None
                    end_time = None
                elif "startTime" in item and "endTime" in item:
                    # Time series
                    start_time = datetime.fromisoformat(item["startTime"].replace('Z', '+00:00'))
                    end_time = datetime.fromisoformat(item["endTime"].replace('Z', '+00:00'))
                    timestamp = start_time
                else:
                    print(f"⚠️  Skipping item {item_id}: no timing info")
                    continue
                
                # Extract data fields (exclude metadata and timing)
                data_obj = {k: v for k, v in item.items() 
                           if k not in ["metadata", "time", "startTime", "endTime"]}
                
                # Encrypt full data
                encrypted_data = encrypt_data(data_obj, encryption_key)
                
                # Extract key vitals for quick access
                heart_rate = data_obj.get("beatsPerMinute") or data_obj.get("heartRate")
                steps = data_obj.get("count") or data_obj.get("steps")
                sleep_hours = None
                oxygen_level = data_obj.get("percentage") or data_obj.get("oxygenLevel")
                
                # Calculate sleep hours if sleep session
                if method.lower() == "sleepsession" and start_time and end_time:
                    sleep_hours = (end_time - start_time).total_seconds() / 3600
                
                # Store in database
                await db.wearabledata.create(
                    data={
                        "patientId": patient.id,
                        "timestamp": timestamp,
                        "heartRate": int(heart_rate) if heart_rate else None,
                        "steps": int(steps) if steps else None,
                        "sleepHours": float(sleep_hours) if sleep_hours else None,
                        "oxygenLevel": float(oxygen_level) if oxygen_level else None,
                        "description": json.dumps({
                            "method": method,
                            "itemId": item_id,
                            "source": data_origin,
                            "encrypted": encrypted_data,
                            "startTime": start_time.isoformat() if start_time else None,
                            "endTime": end_time.isoformat() if end_time else None
                        })
                    }
                )
                
                synced_count += 1
                if (idx + 1) % 10 == 0:
                    print(f"  ✓ Synced {idx + 1}/{len(request.data)} records...")
                
            except Exception as e:
                error_count += 1
                print(f"❌ Error syncing item {idx + 1}: {e}")
                continue
        
        print(f"{'='*60}")
        print(f"✅ SYNC COMPLETE: {synced_count}/{len(request.data)} records synced successfully")
        if error_count > 0:
            print(f"⚠️  {error_count} errors occurred")
        print(f"{'='*60}\n")
        
        return {"success": True, "synced": synced_count, "errors": error_count}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Sync error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": str(e)}
        )

@app.post("/api/v2/fetch/{method}", status_code=200)
async def fetch_wearable_data(
    method: str,
    request: FetchRequest,
    user: Dict = Depends(verify_bearer_token),
    db: Prisma = Depends(get_prisma)
):
    """
    HCGateway v2 Compatible Fetch
    Returns decrypted wearable data for user's patient
    """
    try:
        if not user.get("patient"):
            raise HTTPException(
                status_code=404,
                detail={"error": "no patient linked"}
            )
        
        patient = user["patient"]
        encryption_key = get_encryption_key_from_password(user["password_hash"])
        
        # Fetch wearable data (limit to 100 recent records)
        wearable_data = await db.wearabledata.find_many(
            where={"patientId": patient.id},
            order_by={"timestamp": "desc"},
            take=100
        )
        
        # Format response per HCGateway spec
        results = []
        for data in wearable_data:
            try:
                desc = json.loads(data.description or "{}")
                
                # Only return data matching requested method
                if desc.get("method", "").lower() != method.lower():
                    continue
                
                # Decrypt data
                encrypted = desc.get("encrypted", "")
                if encrypted:
                    decrypted = decrypt_data(encrypted, encryption_key)
                else:
                    decrypted = {}
                
                results.append({
                    "_id": desc.get("itemId", str(data.id)),
                    "id": desc.get("itemId", str(data.id)),
                    "data": decrypted,
                    "app": desc.get("source", "Unknown"),
                    "start": data.timestamp.isoformat() + "Z",
                    "end": desc.get("endTime")
                })
            except Exception as e:
                print(f"⚠️  Error decrypting record {data.id}: {e}")
                continue
        
        print(f"📤 Returning {len(results)} {method} records")
        
        return results
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Fetch error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": str(e)}
        )

@app.delete("/api/v2/sync/{method}", status_code=200)
async def delete_from_db(
    method: str,
    uuid: List[str],
    user: Dict = Depends(verify_bearer_token),
    db: Prisma = Depends(get_prisma)
):
    """Delete wearable data from database (HCGateway app cleanup)"""
    # TODO: Implement if needed
    return {"success": True}

# =============================================================================
# ADDITIONAL ENDPOINTS (CloudCare Specific)
# =============================================================================

@app.get("/api/patients/{patient_id}/wearables/latest")
async def get_latest_vitals(
    patient_id: int,
    db: Prisma = Depends(get_prisma)
):
    """Get latest vital signs for a patient"""
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

@app.get("/api/patients/{patient_id}/wearables/history")
async def get_wearables_history(
    patient_id: int,
    limit: int = 50,
    db: Prisma = Depends(get_prisma)
):
    """Get wearable data history for a patient"""
    data = await db.wearabledata.find_many(
        where={"patientId": patient_id},
        order_by={"timestamp": "desc"},
        take=limit
    )
    
    return {
        "patientId": patient_id,
        "count": len(data),
        "data": [
            {
                "id": d.id,
                "timestamp": d.timestamp.isoformat(),
                "heartRate": d.heartRate,
                "steps": d.steps,
                "sleepHours": d.sleepHours,
                "oxygenLevel": d.oxygenLevel
            }
            for d in data
        ]
    }

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Bind to 0.0.0.0 for network accessibility
    uvicorn.run(
        app,
        host="0.0.0.0",  # Accept connections from any network interface
        port=8005,
        log_level="info"
    )
