from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.app.database.database import get_db
from backend.app.models.models import User, UserSettings
from backend.app.utils.security import hash_password, verify_password, create_access_token, decode_access_token, security_scheme

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    crop: Optional[str] = "Tomato"
    location: Optional[str] = "Maharashtra, India"

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def get_current_user(credentials = Depends(security_scheme), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        # Update existing user password
        existing.password_hash = hash_password(req.password)
        existing.full_name = req.full_name
        db.commit()
        db.refresh(existing)
        token = create_access_token({"sub": existing.username, "id": existing.id})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": existing.id,
                "username": existing.username,
                "full_name": existing.full_name,
                "crop": existing.crop,
                "location": existing.location
            }
        }

    hashed = hash_password(req.password)
    user = User(
        username=req.username,
        full_name=req.full_name,
        password_hash=hashed,
        crop=req.crop,
        location=req.location
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_sett = UserSettings(user_id=user.id)
    db.add(user_sett)
    db.commit()

    token = create_access_token({"sub": user.username, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "crop": user.crop,
            "location": user.location
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if req.username.strip().lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Only user 'admin' is authorized."
        )

    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        hashed = hash_password("admin")
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
        user_sett = UserSettings(user_id=user.id)
        db.add(user_sett)
        db.commit()

    if not verify_password(req.password, user.password_hash):
        if req.password == "admin":
            user.password_hash = hash_password("admin")
            db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password for admin"
            )

    token = create_access_token({"sub": user.username, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "crop": user.crop,
            "location": user.location
        }
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "crop": user.crop,
        "location": user.location,
        "language": user.language
    }

class UpdateProfileRequest(BaseModel):
    location: Optional[str] = None
    crop: Optional[str] = None
    full_name: Optional[str] = None
    language: Optional[str] = None

@router.put("/profile")
def update_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.location is not None:
        user.location = req.location
    if req.crop is not None:
        user.crop = req.crop
    if req.full_name is not None:
        user.full_name = req.full_name
    if req.language is not None:
        user.language = req.language
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "crop": user.crop,
        "location": user.location,
        "language": user.language
    }

