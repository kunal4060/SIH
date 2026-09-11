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

# Seed default user 'admin' / 'admin' and ensure only this user exists
def seed_demo_user(db=None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        db.query(User).filter(User.username != "admin").delete()
        user = db.query(User).filter(User.username == "admin").first()
        hashed = hash_password("admin")
        if not user:
            logger.info("Seeding admin user ('admin' / 'admin')...")
            user = User(
                username="admin",
                full_name="Administrator",
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
            logger.info("Admin user 'admin' created successfully.")
        else:
            user.password_hash = hashed
            user.full_name = "Administrator"
            db.commit()
            logger.info("Admin user 'admin' password verified.")
    except Exception as e:
        logger.error(f"Error seeding user: {e}")
    finally:
        if close_db:
            db.close()

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

@app.on_event("startup")
def on_startup():
    logger.info("FastAPI startup event: Initializing database schema...")
    try:
        Base.metadata.create_all(bind=engine)
        seed_demo_user()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Primary database connection error: {e}")
        try:
            logger.warning("Initializing fallback local SQLite database for zero downtime...")
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            fallback_engine = create_engine(f"sqlite:///{settings.BASE_DIR}/smart_farm.db", connect_args={"check_same_thread": False})
            Base.metadata.create_all(bind=fallback_engine)
            fallback_session = sessionmaker(bind=fallback_engine)()
            seed_demo_user(db=fallback_session)
            fallback_session.close()
            logger.info("Local SQLite fallback database is active and ready.")
        except Exception as ex:
            logger.error(f"Fallback SQLite error: {ex}")

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
