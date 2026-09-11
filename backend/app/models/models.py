import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    crop = Column(String(50), default="Tomato")
    location = Column(String(100), default="Maharashtra, India")
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farms = relationship("Farm", back_populates="owner")
    scans = relationship("PlantScan", back_populates="user")
    chats = relationship("ChatHistory", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(100), default="My Smart Farm")
    crop = Column(String(50), default="Tomato")
    location = Column(String(100), default="Field 1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    sensors = relationship("SensorReading", back_populates="farm")
    motor_logs = relationship("MotorLog", back_populates="farm")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    water_level = Column(Float, nullable=False)
    is_real_hardware = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="sensors")

class MotorLog(Base):
    __tablename__ = "motor_logs"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    action = Column(String(10), nullable=False)  # "ON" or "OFF"
    mode = Column(String(10), nullable=False)    # "AUTO" or "MANUAL"
    reason = Column(String(255), default="Manual toggle by farmer")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="motor_logs")

class PlantScan(Base):
    __tablename__ = "plant_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String(255), nullable=False)
    plant_name = Column(String(50), default="Unknown")
    final_diagnosis = Column(String(100), nullable=False)
    consensus_status = Column(String(50), default="AGREE")
    confidence_level = Column(String(20), default="High")
    severity = Column(String(20), default="Moderate")
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scans")
    predictions = relationship("PlantPrediction", back_populates="scan", cascade="all, delete-orphan")

class PlantPrediction(Base):
    __tablename__ = "plant_predictions"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("plant_scans.id"), nullable=False)
    model_name = Column(String(50), nullable=False)  # "custom_resnet50" or "gemini_vision"
    prediction = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    raw_output_json = Column(Text, nullable=True)

    scan = relationship("PlantScan", back_populates="predictions")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "model"
    message = Column(Text, nullable=False)
    context_used = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chats")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    auto_irrigation_moisture_threshold = Column(Float, default=40.0)
    min_water_tank_level = Column(Float, default=15.0)
    irrigation_mode = Column(String(10), default="MANUAL")  # "AUTO" or "MANUAL"
    motor_state = Column(String(10), default="OFF")         # "ON" or "OFF"
    language = Column(String(10), default="en")

    user = relationship("User", back_populates="settings")
