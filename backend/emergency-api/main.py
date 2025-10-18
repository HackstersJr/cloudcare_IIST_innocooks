"""
CloudCare Emergency API Server with Server-Sent Events (SSE)
Handles emergency alerts and real-time notifications
Port: 8004
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from sse_starlette.sse import EventSourceResponse
import sys
import os
import asyncio
import json
from typing import AsyncGenerator, List
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import connect_db, disconnect_db, get_prisma
from shared.models import EmergencyAlertCreate, EmergencyAlertResponse, BaseResponse
from prisma import Prisma


# Global event queue for SSE
emergency_queue: asyncio.Queue = asyncio.Queue()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection"""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="CloudCare Emergency API with SSE",
    description="Real-time emergency alert management system",
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

async def broadcast_emergency(alert_data: dict):
    """Broadcast emergency alert to all SSE subscribers"""
    await emergency_queue.put(alert_data)


async def event_generator(request: Request) -> AsyncGenerator[dict, None]:
    """Generate server-sent events for emergency alerts"""
    while True:
        if await request.is_disconnected():
            break
        
        try:
            # Wait for new emergency with timeout
            alert = await asyncio.wait_for(emergency_queue.get(), timeout=30.0)
            yield {
                "event": "emergency_alert",
                "data": json.dumps(alert)
            }
        except asyncio.TimeoutError:
            # Send keepalive ping
            yield {
                "event": "ping",
                "data": json.dumps({"timestamp": datetime.now().isoformat()})
            }
        except Exception as e:
            print(f"SSE Error: {e}")
            break


# ============================================================================
# EMERGENCY ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CloudCare Emergency API with SSE",
        "version": "1.0.0",
        "status": "running",
        "sse_endpoint": "/api/emergency/stream"
    }


@app.get("/api/emergency/stream")
async def emergency_stream(request: Request):
    """
    Server-Sent Events endpoint for real-time emergency alerts
    
    Usage:
        const eventSource = new EventSource('http://localhost:8004/api/emergency/stream');
        eventSource.addEventListener('emergency_alert', (event) => {
            const alert = JSON.parse(event.data);
            console.log('New emergency:', alert);
        });
    """
    return EventSourceResponse(event_generator(request))


@app.post("/api/emergency/alerts", response_model=EmergencyAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency_alert(
    alert: EmergencyAlertCreate,
    db: Prisma = Depends(get_prisma)
):
    """Create a new emergency alert and broadcast via SSE"""
    try:
        # Verify patient exists
        patient = await db.patient.find_unique(
            where={"patientId": alert.patient_id}
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient {alert.patient_id} not found"
            )
        
        # Verify hospital if provided
        hospital_db_id = None
        if alert.hospital_id:
            hospital = await db.hospital.find_unique(
                where={"hospitalName": alert.hospital_id}
            )
            if hospital:
                hospital_db_id = hospital.id
        
        # Create emergency alert
        new_alert = await db.emergencyalert.create(
            data={
                "alertId": alert.alert_id,
                "patientId": patient.id,
                "hospitalId": hospital_db_id,
                "alertType": alert.alert_type.value,
                "severity": alert.severity.value,
                "description": alert.description,
                "triggeredBy": alert.triggered_by,
                "triggerData": alert.trigger_data,
                "location": alert.location,
                "status": "active"
            }
        )
        
        # Set emergency flag on patient
        await db.patient.update(
            where={"id": patient.id},
            data={
                "emergencyFlag": True,
                "emergencyType": alert.alert_type.value,
                "emergencyNotes": alert.description
            }
        )
        
        # Prepare broadcast data
        broadcast_data = {
            "alert_id": new_alert.alertId,
            "patient_id": alert.patient_id,
            "patient_name": patient.name,
            "alert_type": new_alert.alertType,
            "severity": new_alert.severity,
            "description": new_alert.description,
            "location": alert.location,
            "trigger_data": alert.trigger_data,
            "timestamp": new_alert.createdAt.isoformat(),
            "hospital_id": alert.hospital_id
        }
        
        # Broadcast to SSE subscribers
        await broadcast_emergency(broadcast_data)
        
        return new_alert
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create emergency alert: {str(e)}"
        )


@app.get("/api/emergency/alerts/{alert_id}", response_model=EmergencyAlertResponse)
async def get_emergency_alert(
    alert_id: str,
    db: Prisma = Depends(get_prisma)
):
    """Get emergency alert by ID"""
    alert = await db.emergencyalert.find_unique(
        where={"alertId": alert_id}
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    return alert


@app.get("/api/emergency/alerts", response_model=List[EmergencyAlertResponse])
async def list_emergency_alerts(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    severity: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """List all emergency alerts with filters"""
    where_clause = {}
    
    if active_only:
        where_clause["status"] = "active"
    
    if severity:
        where_clause["severity"] = severity
    
    alerts = await db.emergencyalert.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"createdAt": "desc"},
        include={
            "patient": True,
            "hospital": True
        }
    )
    
    return alerts


@app.get("/api/emergency/patients/{patient_id}/alerts")
async def get_patient_alerts(
    patient_id: str,
    active_only: bool = True,
    db: Prisma = Depends(get_prisma)
):
    """Get all emergency alerts for a specific patient"""
    patient = await db.patient.find_unique(
        where={"patientId": patient_id}
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    
    where_clause = {"patientId": patient.id}
    if active_only:
        where_clause["status"] = "active"
    
    alerts = await db.emergencyalert.find_many(
        where=where_clause,
        order={"createdAt": "desc"}
    )
    
    return alerts


@app.patch("/api/emergency/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    responder_id: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Acknowledge an emergency alert"""
    alert = await db.emergencyalert.find_unique(
        where={"alertId": alert_id}
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    responders = alert.responders or []
    if responder_id and responder_id not in responders:
        responders.append(responder_id)
    
    updated = await db.emergencyalert.update(
        where={"alertId": alert_id},
        data={
            "status": "acknowledged",
            "responseTime": datetime.now(),
            "responders": responders
        }
    )
    
    # Broadcast status update
    await broadcast_emergency({
        "event": "alert_acknowledged",
        "alert_id": alert_id,
        "responder_id": responder_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return BaseResponse(
        success=True,
        message=f"Alert {alert_id} acknowledged"
    )


@app.patch("/api/emergency/alerts/{alert_id}/respond")
async def respond_to_alert(
    alert_id: str,
    responder_id: str,
    notes: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Mark alert as being responded to"""
    alert = await db.emergencyalert.find_unique(
        where={"alertId": alert_id}
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    responders = alert.responders or []
    if responder_id not in responders:
        responders.append(responder_id)
    
    updated = await db.emergencyalert.update(
        where={"alertId": alert_id},
        data={
            "status": "responding",
            "responders": responders,
            "notes": notes
        }
    )
    
    # Broadcast status update
    await broadcast_emergency({
        "event": "alert_responding",
        "alert_id": alert_id,
        "responder_id": responder_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return BaseResponse(
        success=True,
        message=f"Responding to alert {alert_id}"
    )


@app.patch("/api/emergency/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    resolution_notes: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Resolve an emergency alert"""
    alert = await db.emergencyalert.find_unique(
        where={"alertId": alert_id},
        include={"patient": True}
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    # Update alert status
    await db.emergencyalert.update(
        where={"alertId": alert_id},
        data={
            "status": "resolved",
            "resolvedAt": datetime.now(),
            "notes": resolution_notes
        }
    )
    
    # Clear emergency flag on patient if no other active alerts
    active_alerts = await db.emergencyalert.count(
        where={
            "patientId": alert.patientId,
            "status": {"in": ["active", "acknowledged", "responding"]}
        }
    )
    
    if active_alerts == 0:
        await db.patient.update(
            where={"id": alert.patientId},
            data={
                "emergencyFlag": False,
                "emergencyType": None,
                "emergencyNotes": None
            }
        )
    
    # Broadcast resolution
    await broadcast_emergency({
        "event": "alert_resolved",
        "alert_id": alert_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return BaseResponse(
        success=True,
        message=f"Alert {alert_id} resolved"
    )


@app.patch("/api/emergency/alerts/{alert_id}/false-alarm")
async def mark_false_alarm(
    alert_id: str,
    notes: Optional[str] = None,
    db: Prisma = Depends(get_prisma)
):
    """Mark an alert as a false alarm"""
    alert = await db.emergencyalert.find_unique(
        where={"alertId": alert_id},
        include={"patient": True}
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    await db.emergencyalert.update(
        where={"alertId": alert_id},
        data={
            "status": "false_alarm",
            "resolvedAt": datetime.now(),
            "notes": notes
        }
    )
    
    # Clear emergency flag on patient
    await db.patient.update(
        where={"id": alert.patientId},
        data={
            "emergencyFlag": False,
            "emergencyType": None,
            "emergencyNotes": None
        }
    )
    
    # Broadcast false alarm
    await broadcast_emergency({
        "event": "false_alarm",
        "alert_id": alert_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return BaseResponse(
        success=True,
        message=f"Alert {alert_id} marked as false alarm"
    )


# ============================================================================
# EMERGENCY STATISTICS
# ============================================================================

@app.get("/api/emergency/statistics")
async def get_emergency_statistics(
    db: Prisma = Depends(get_prisma)
):
    """Get emergency system statistics"""
    total_alerts = await db.emergencyalert.count()
    active_alerts = await db.emergencyalert.count(where={"status": "active"})
    responding_alerts = await db.emergencyalert.count(where={"status": "responding"})
    resolved_alerts = await db.emergencyalert.count(where={"status": "resolved"})
    false_alarms = await db.emergencyalert.count(where={"status": "false_alarm"})
    
    # Critical severity count
    critical_alerts = await db.emergencyalert.count(
        where={"severity": "critical", "status": {"in": ["active", "responding"]}}
    )
    
    return {
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "responding_alerts": responding_alerts,
        "resolved_alerts": resolved_alerts,
        "false_alarms": false_alarms,
        "critical_active": critical_alerts,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    from typing import Optional
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("EMERGENCY_API_PORT", 8004)),
        reload=True
    )
