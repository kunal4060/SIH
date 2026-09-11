from fastapi import APIRouter
from backend.app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
@router.get("/current")
def get_weather(location: str = "Maharashtra, India"):
    return weather_service.get_current_weather(location)
