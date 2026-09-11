from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import User, UserSettings, PlantScan
from backend.app.api.auth import get_current_user
from backend.app.services.sensor_service import sensor_service
from backend.app.services.weather_service import weather_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sensors = sensor_service.get_latest_readings(db)
    weather = weather_service.get_current_weather(user.location or "Maharashtra, India")
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    motor_state = settings.motor_state if settings else "OFF"
    motor_mode = settings.irrigation_mode if settings else "MANUAL"

    latest_scan = db.query(PlantScan).filter((PlantScan.user_id == user.id) | (user.username == "admin")).order_by(PlantScan.created_at.desc()).first()
    
    thumb = ""
    if latest_scan and latest_scan.details_json:
        try:
            import json
            dt = json.loads(latest_scan.details_json)
            thumb = dt.get("thumbnail", "")
        except Exception:
            pass

    return {
        "user": {
            "name": user.full_name,
            "crop": user.crop,
            "location": user.location
        },
        "sensors": sensors,
        "weather": weather,
        "motor": {
            "status": motor_state,
            "mode": motor_mode
        },
        "latestScan": {
            "id": latest_scan.id,
            "plant": latest_scan.plant_name,
            "diagnosis": latest_scan.final_diagnosis,
            "confidence": latest_scan.confidence_level,
            "severity": latest_scan.severity,
            "imagePath": latest_scan.image_path,
            "thumbnail": thumb,
            "date": latest_scan.created_at.strftime("%b %d, %Y") if latest_scan.created_at else "Recently"
        } if latest_scan else None
    }
