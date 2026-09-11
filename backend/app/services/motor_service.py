import logging
import datetime
from sqlalchemy.orm import Session
from backend.app.models.models import MotorLog, UserSettings
from backend.app.services.sensor_service import sensor_service
from backend.app.config.settings import settings

logger = logging.getLogger(__name__)

class MotorService:
    def control_motor(self, db: Session, action: str, mode: str, user_id: int, reason: str = "Farmer Manual Action") -> dict:
        """Validates safety rules and switches pump state."""
        action = action.upper()
        mode = mode.upper()

        if action not in ["ON", "OFF"]:
            raise ValueError("Invalid motor action. Must be 'ON' or 'OFF'.")
        if mode not in ["AUTO", "MANUAL"]:
            raise ValueError("Invalid motor mode. Must be 'AUTO' or 'MANUAL'.")

        # Fetch telemetry to verify safety checks
        telemetry = sensor_service.get_latest_readings(db)
        water_level = telemetry.get("waterLevel", 68.0)

        # Safety Check: Cannot turn ON if water level is dangerously low (< MIN_WATER_TANK_LEVEL)
        if action == "ON" and water_level < settings.MIN_WATER_TANK_LEVEL:
            return {
                "success": False,
                "status": "OFF",
                "mode": mode,
                "error": f"Safety Interlock Activated: Water tank level is too low ({water_level}% < {settings.MIN_WATER_TANK_LEVEL}% minimum). Refill tank to enable pump."
            }

        # Update UserSettings in database
        user_sett = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not user_sett:
            user_sett = UserSettings(user_id=user_id, motor_state=action, irrigation_mode=mode)
            db.add(user_sett)
        else:
            user_sett.motor_state = action
            user_sett.irrigation_mode = mode

        # Log motor action
        log_entry = MotorLog(
            farm_id=1,
            action=action,
            mode=mode,
            reason=reason
        )
        db.add(log_entry)
        db.commit()

        logger.info(f"Motor state updated: Action={action}, Mode={mode}, User={user_id}")
        return {
            "success": True,
            "status": action,
            "mode": mode,
            "message": f"Irrigation pump turned {action} in {mode} mode.",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    def evaluate_auto_mode(self, db: Session, user_id: int):
        """Runs background AUTO mode evaluation based on soil moisture thresholds."""
        user_sett = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not user_sett or user_sett.irrigation_mode != "AUTO":
            return

        threshold = user_sett.auto_irrigation_moisture_threshold or settings.AUTO_IRRIGATION_MOISTURE_THRESHOLD
        telemetry = sensor_service.get_latest_readings(db)
        moisture = telemetry.get("soilMoisture", 50.0)
        water_level = telemetry.get("waterLevel", 68.0)

        current_state = user_sett.motor_state

        if moisture < threshold and water_level >= settings.MIN_WATER_TANK_LEVEL:
            if current_state != "ON":
                self.control_motor(db, "ON", "AUTO", user_id, f"AUTO trigger: Soil moisture ({moisture}%) below threshold ({threshold}%)")
        else:
            if current_state != "OFF":
                self.control_motor(db, "OFF", "AUTO", user_id, f"AUTO trigger: Soil moisture ({moisture}%) optimal or tank low ({water_level}%)")

motor_service = MotorService()
