from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.services.sensor_service import sensor_service

router = APIRouter(prefix="/sensors", tags=["Sensors"])

@router.get("")
@router.get("/current")
def get_sensors(db: Session = Depends(get_db)):
    return sensor_service.get_latest_readings(db)

@router.post("/telemetry")
def push_esp32_data(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Endpoint for physical ESP32 micro-controller telemetry upload."""
    moisture = payload.get("soilMoisture", 42.0)
    temp = payload.get("temperature", 29.0)
    humidity = payload.get("humidity", 71.0)
    water_level = payload.get("waterLevel", 68.0)

    reading = sensor_service.push_esp32_telemetry(db, moisture, temp, humidity, water_level)
    return {"status": "success", "id": reading.id}
