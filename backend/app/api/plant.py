import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Request, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import User, PlantScan, PlantPrediction
from backend.app.api.auth import get_current_user
from backend.app.utils.image_processing import validate_and_save_image, generate_base64_thumbnail
from backend.app.services.ml_service import ml_service
from backend.app.services.gemini_service import gemini_service
from backend.app.services.diagnosis_service import diagnosis_service

router = APIRouter(prefix="/plant", tags=["Plant Doctor"])

@router.post("/analyze")
async def analyze_plant_scan(
    file: UploadFile = File(...),
    lang: Optional[str] = Form("en"),
    request: Request = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Executes Dual AI Pipeline: Local ResNet50 ML + Gemini Vision AI consensus."""
    try:
        contents = await file.read()
        image_path = validate_and_save_image(contents, file.filename)
        thumbnail_b64 = generate_base64_thumbnail(contents)

        chosen_lang = lang or (request.headers.get("x-language") if request else "en") or "en"

        # 1. Analysis A: My Trained ML Model
        ml_res = ml_service.predict(contents)

        # 2. Analysis B: Gemini Vision AI (with language instruction)
        gemini_res = gemini_service.analyze_plant_image(contents, language=chosen_lang)

        # 3. Dual AI Consensus Layer
        final_report = diagnosis_service.synthesize_diagnosis(ml_res, gemini_res)
        final_report["image_path"] = image_path
        if thumbnail_b64:
            final_report["thumbnail"] = thumbnail_b64

        # 4. Save to Database
        scan = PlantScan(
            user_id=user.id,
            image_path=image_path,
            plant_name=final_report["plant"],
            final_diagnosis=final_report["final_diagnosis"],
            consensus_status=final_report["consensus_status"],
            confidence_level=final_report["confidence_level"],
            severity=final_report["severity"],
            details_json=json.dumps(final_report)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        # Save individual model predictions
        pred_ml = PlantPrediction(
            scan_id=scan.id,
            model_name="custom_resnet50",
            prediction=ml_res.get("prediction", "Unknown"),
            confidence=ml_res.get("confidence", 0.0),
            raw_output_json=json.dumps(ml_res)
        )
        pred_gemini = PlantPrediction(
            scan_id=scan.id,
            model_name="gemini_vision",
            prediction=gemini_res.get("condition", "Unknown"),
            confidence=gemini_res.get("confidence", 0.0),
            raw_output_json=json.dumps(gemini_res)
        )
        db.add(pred_ml)
        db.add(pred_gemini)
        db.commit()

        final_report["scan_id"] = scan.id
        return final_report

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process plant scan: {str(e)}")

@router.get("/history")
def get_plant_history(
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PlantScan).filter((PlantScan.user_id == user.id) | (user.username == "admin"))
    if search:
        s_clean = search.strip()
        if s_clean:
            query = query.filter(
                (PlantScan.plant_name.ilike(f"%{s_clean}%")) | 
                (PlantScan.final_diagnosis.ilike(f"%{s_clean}%"))
            )
    scans = query.order_by(PlantScan.created_at.desc()).all()
    
    result = []
    for s in scans:
        thumb = ""
        if s.details_json:
            try:
                dt = json.loads(s.details_json)
                thumb = dt.get("thumbnail", "")
            except Exception:
                pass
        result.append({
            "id": s.id,
            "plant": s.plant_name,
            "diagnosis": s.final_diagnosis,
            "consensus": s.consensus_status,
            "confidence": s.confidence_level,
            "severity": s.severity,
            "imagePath": s.image_path,
            "thumbnail": thumb,
            "date": s.created_at.strftime("%b %d, %Y - %I:%M %p") if s.created_at else "Recently"
        })
    return result

@router.get("/latest")
def get_latest_plant_scan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the most recent plant scan report for the logged in user."""
    scan = db.query(PlantScan).filter((PlantScan.user_id == user.id) | (user.username == "admin")).order_by(PlantScan.created_at.desc()).first()
    if not scan:
        return None

    report = json.loads(scan.details_json) if scan.details_json else {}
    report["scan_id"] = scan.id
    report["image_path"] = scan.image_path
    report["created_at"] = scan.created_at.strftime("%b %d, %Y %I:%M %p") if scan.created_at else "Recently"
    return report

@router.get("/history/{scan_id}")
def get_plant_scan_detail(
    scan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(PlantScan).filter(PlantScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")

    report = json.loads(scan.details_json) if scan.details_json else {}
    report["scan_id"] = scan.id
    report["image_path"] = scan.image_path
    report["created_at"] = scan.created_at.strftime("%b %d, %Y %I:%M %p") if scan.created_at else "Recently"
    return report
