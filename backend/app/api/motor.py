from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.database.database import get_db
from backend.app.models.models import User, UserSettings, MotorLog
from backend.app.api.auth import get_current_user
from backend.app.services.motor_service import motor_service

router = APIRouter(prefix="/motor", tags=["Motor Control"])

class MotorControlRequest(BaseModel):
    action: str  # "ON" or "OFF"
    mode: str    # "AUTO" or "MANUAL"

@router.get("/status")
def get_motor_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        return {"status": "OFF", "mode": "MANUAL", "threshold": 40.0}
    return {
        "status": settings.motor_state,
        "mode": settings.irrigation_mode,
        "autoThreshold": settings.auto_irrigation_moisture_threshold,
        "minWaterLevel": settings.min_water_tank_level
    }

@router.post("/control")
def control_motor(
    req: MotorControlRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        res = motor_service.control_motor(db, req.action, req.mode, user.id)
        if not res["success"]:
            raise HTTPException(status_code=400, detail=res["error"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs")
def get_motor_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(MotorLog).order_by(MotorLog.timestamp.desc()).limit(20).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "mode": l.mode,
            "reason": l.reason,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        } for l in logs
    ]
