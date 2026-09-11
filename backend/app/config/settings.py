import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

# Load environment variables from root .env file
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Farming AI Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Path attributes
    BASE_DIR: Path = BASE_DIR
    ROOT_DIR: Path = ROOT_DIR
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart_farm_sih_secret_key_2026_super_secure_99")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/smart_farm.db")
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Firebase Realtime Telemetry
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "")
    FIREBASE_DATABASE_URL: str = os.getenv("FIREBASE_DATABASE_URL", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")

    # IoT Defaults & Thresholds
    AUTO_IRRIGATION_MOISTURE_THRESHOLD: float = float(os.getenv("AUTO_IRRIGATION_MOISTURE_THRESHOLD", "40.0"))
    MIN_WATER_TANK_LEVEL: float = float(os.getenv("MIN_WATER_TANK_LEVEL", "15.0"))
    
    # Directories
    UPLOAD_DIR: Path = BASE_DIR / "uploads" / "plant_scans"
    MODEL_DIR: Path = ROOT_DIR / "Plant-Disease-Trained-model-Dataset"

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
