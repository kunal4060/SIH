from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.database.database import get_db
from backend.app.models.models import User, ChatHistory, PlantScan, UserSettings
from backend.app.api.auth import get_current_user
from backend.app.services.sensor_service import sensor_service
from backend.app.services.weather_service import weather_service
from backend.app.services.gemini_service import gemini_service

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

class ChatMessageRequest(BaseModel):
    message: str
    scan_id: Optional[int] = None

@router.post("/message")
def chat_message(
    req: ChatMessageRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    lang = request.headers.get("x-language", "en")

    # 1. Fetch live farm sensor context
    sensors = sensor_service.get_latest_readings(db)
    weather = weather_service.get_current_weather(user.location or "Maharashtra, India")
    sett = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    
    farm_ctx = {
        "soilMoisture": sensors.get("soilMoisture"),
        "temperature": sensors.get("temperature"),
        "humidity": sensors.get("humidity"),
        "waterLevel": sensors.get("waterLevel"),
        "weather": weather,
        "motorState": sett.motor_state if sett else "OFF",
        "motorMode": sett.irrigation_mode if sett else "MANUAL",
        "crop": user.crop
    }

    # 2. Fetch plant diagnosis context
    scan_ctx = None
    if req.scan_id:
        scan = db.query(PlantScan).filter(PlantScan.id == req.scan_id, (PlantScan.user_id == user.id) | (user.username == "admin")).first()
        if scan:
            scan_ctx = {
                "plant": scan.plant_name,
                "final_diagnosis": scan.final_diagnosis,
                "confidence_level": scan.confidence_level,
                "severity": scan.severity
            }
    else:
        latest_scan = db.query(PlantScan).filter((PlantScan.user_id == user.id) | (user.username == "admin")).order_by(PlantScan.created_at.desc()).first()
        if latest_scan:
            scan_ctx = {
                "plant": latest_scan.plant_name,
                "final_diagnosis": latest_scan.final_diagnosis,
                "confidence_level": latest_scan.confidence_level,
                "severity": latest_scan.severity
            }

    # 3. Generate response using Gemini
    reply_text = gemini_service.chat_with_farmer(
        user_message=req.message,
        farm_context=farm_ctx,
        scan_context=scan_ctx,
        language=lang
    )

    # 4. Save to Chat History
    user_msg_db = ChatHistory(user_id=user.id, role="user", message=req.message)
    ai_msg_db = ChatHistory(user_id=user.id, role="model", message=reply_text)
    db.add(user_msg_db)
    db.add(ai_msg_db)
    db.commit()

    return {
        "reply": reply_text,
        "suggested_questions": [
            "Should I turn on the motor now?",
            "How do I control this plant disease?",
            "What fertilizer is best for my soil?",
            "Is rain expected today?"
        ]
    }

@router.get("/history")
def get_chat_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.timestamp.asc()).all()
    return [
        {
            "id": c.id,
            "role": c.role,
            "message": c.message,
            "timestamp": c.timestamp.strftime("%I:%M %p") if c.timestamp else "Recently"
        } for c in chats
    ]

@router.delete("/clear")
def clear_chat_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ChatHistory).filter(ChatHistory.user_id == user.id).delete()
    db.commit()
    return {"status": "cleared"}
