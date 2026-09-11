import os
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config.settings import settings
from backend.app.database.database import engine, Base, SessionLocal
from backend.app.models.models import User, UserSettings
from backend.app.utils.security import hash_password

from backend.app.api.auth import router as auth_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.sensors import router as sensors_router
from backend.app.api.weather import router as weather_router
from backend.app.api.motor import router as motor_router
from backend.app.api.plant import router as plant_router
from backend.app.api.chatbot import router as chatbot_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart_farm")

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Seed default user 'kunal' / 'kunal' and ensure only this user exists
def seed_demo_user():
    db = SessionLocal()
    try:
        # Ensure database consists only of user 'kunal'
        db.query(User).filter(User.username != "kunal").delete()
        user = db.query(User).filter(User.username == "kunal").first()
        hashed = hash_password("kunal")
        if not user:
            logger.info("Seeding farmer user ('kunal' / 'kunal')...")
            user = User(
                username="kunal",
                full_name="Kunal Sharma",
                password_hash=hashed,
                crop="Tomato",
                location="Maharashtra, India"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            user_sett = UserSettings(user_id=user.id, motor_state="OFF", irrigation_mode="MANUAL")
            db.add(user_sett)
            db.commit()
            logger.info("Farmer user 'kunal' created successfully.")
        else:
            user.password_hash = hashed
            db.commit()
            logger.info("Farmer user 'kunal' password set to 'kunal'.")
    except Exception as e:
        logger.error(f"Error seeding user: {e}")
    finally:
        db.close()

seed_demo_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SIH Production Smart Farming AI Platform Backend API"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for static image serving
uploads_path = str(settings.UPLOAD_DIR.parent.parent / "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(sensors_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(motor_router, prefix=settings.API_V1_STR)
app.include_router(plant_router, prefix=settings.API_V1_STR)
app.include_router(chatbot_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Mount frontend dist static assets
frontend_dist = settings.ROOT_DIR / "frontend" / "dist"

if (frontend_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="frontend_assets")

@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    # Do not intercept API or Uploads requests
    if full_path.startswith("api") or full_path.startswith("uploads"):
        return None

    requested_file = frontend_dist / full_path
    if full_path and requested_file.exists() and requested_file.is_file():
        return FileResponse(requested_file)

    # Fallback to SPA index.html
    index_html = frontend_dist / "index.html"
    if index_html.exists():
        return FileResponse(index_html)
        
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
