import random
import datetime
import logging
from typing import Dict
import urllib.request
import json
from sqlalchemy.orm import Session
from backend.app.config.settings import settings
from backend.app.models.models import SensorReading

logger = logging.getLogger(__name__)

class SensorService:
    def __init__(self):
        # Base simulated state for smooth variation when hardware is disconnected
        self._current_moisture = 42.0
        self._current_temp = 29.0
        self._current_humidity = 71.0
        self._current_water_level = 68.0
        self._is_hardware = False

    def get_latest_readings(self, db: Session = None, farm_id: int = 1) -> Dict:
        """Fetches latest sensor telemetry from Firebase Realtime DB, local DB, or generates mock data."""
        
        # 1. Check Firebase Realtime Database if configured
        if settings.FIREBASE_DATABASE_URL:
            try:
                url = settings.FIREBASE_DATABASE_URL.rstrip('/') + '/sensors.json'
                if settings.FIREBASE_API_KEY:
                    url += f'?auth={settings.FIREBASE_API_KEY}'
                
                req = urllib.request.Request(url, headers={'User-Agent': 'SmartFarmServer/1.0'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    data = json.loads(resp.read().decode())
                    if data and isinstance(data, dict):
                        moisture = float(data.get('soilMoisture', data.get('moisture', 42.0)))
                        temp = float(data.get('temperature', data.get('temp', 29.0)))
                        humidity = float(data.get('humidity', 71.0))
                        water_level = float(data.get('waterLevel', data.get('tankLevel', 68.0)))

                        self._current_moisture = moisture
                        self._current_temp = temp
                        self._current_humidity = humidity
                        self._current_water_level = water_level
                        self._is_hardware = True

                        return {
                            "soilMoisture": round(moisture, 1),
                            "temperature": round(temp, 1),
                            "humidity": round(humidity, 1),
                            "waterLevel": round(water_level, 1),
                            "isHardware": True,
                            "source": "Firebase Realtime DB",
                            "moistureStatus": self._get_moisture_status(moisture),
                            "waterStatus": self._get_water_status(water_level),
                            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                        }
            except Exception as e:
                logger.warning(f"Firebase fetch warning: {e}. Falling back to database/sensor service.")

        # 2. Check Local Database ESP32 telemetry
        if db:
            last_record = db.query(SensorReading).order_by(SensorReading.created_at.desc()).first()
            if last_record and last_record.is_real_hardware:
                return {
                    "soilMoisture": round(last_record.soil_moisture, 1),
                    "temperature": round(last_record.temperature, 1),
                    "humidity": round(last_record.humidity, 1),
                    "waterLevel": round(last_record.water_level, 1),
                    "isHardware": True,
                    "source": "ESP32 Hardware",
                    "moistureStatus": self._get_moisture_status(last_record.soil_moisture),
                    "waterStatus": self._get_water_status(last_record.water_level),
                    "timestamp": last_record.created_at.isoformat()
                }

        # 3. Realistic fluctuation fallback for demo
        self._current_moisture = max(15.0, min(85.0, self._current_moisture + random.uniform(-0.5, 0.5)))
        self._current_temp = max(18.0, min(42.0, self._current_temp + random.uniform(-0.2, 0.2)))
        self._current_humidity = max(30.0, min(95.0, self._current_humidity + random.uniform(-0.3, 0.3)))
        self._current_water_level = max(5.0, min(100.0, self._current_water_level + random.uniform(-0.1, 0.1)))

        return {
            "soilMoisture": round(self._current_moisture, 1),
            "temperature": round(self._current_temp, 1),
            "humidity": round(self._current_humidity, 1),
            "waterLevel": round(self._current_water_level, 1),
            "isHardware": False,
            "source": "Simulated Telemetry",
            "moistureStatus": self._get_moisture_status(self._current_moisture),
            "waterStatus": self._get_water_status(self._current_water_level),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def push_esp32_telemetry(self, db: Session, moisture: float, temp: float, humidity: float, water_level: float):
        """Saves telemetry payload pushed directly from an ESP32 micro-controller."""
        reading = SensorReading(
            soil_moisture=moisture,
            temperature=temp,
            humidity=humidity,
            water_level=water_level,
            is_real_hardware=True
        )
        db.add(reading)
        db.commit()
        db.refresh(reading)
        
        self._current_moisture = moisture
        self._current_temp = temp
        self._current_humidity = humidity
        self._current_water_level = water_level
        self._is_hardware = True
        return reading

    def _get_moisture_status(self, val: float) -> str:
        if val < 35:
            return "Dry (Needs Water)"
        elif val > 75:
            return "Wet (Optimal)"
        return "Good"

    def _get_water_status(self, val: float) -> str:
        if val < 20:
            return "Low Warning"
        elif val > 80:
            return "Full"
        return "Sufficient"

sensor_service = SensorService()
