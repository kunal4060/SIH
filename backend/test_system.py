import os
import sys
import unittest
from pathlib import Path
from PIL import Image

# Add root directory to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database.database import engine, Base, SessionLocal
from backend.app.models.models import User, UserSettings, PlantScan
from backend.app.utils.security import hash_password, verify_password
from backend.app.services.ml_service import ml_service
from backend.app.services.gemini_service import gemini_service
from backend.app.services.diagnosis_service import diagnosis_service
from backend.app.services.sensor_service import sensor_service
from backend.app.services.motor_service import motor_service

class TestSmartFarmBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_user_and_auth(self):
        hashed = hash_password("secret123")
        self.assertTrue(verify_password("secret123", hashed))
        self.assertFalse(verify_password("wrongpass", hashed))

    def test_02_ml_service(self):
        # Create a test leaf image in memory
        img = Image.new('RGB', (100, 100), color='green')
        import io
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        img_bytes = buf.getvalue()

        result = ml_service.predict(img_bytes)
        self.assertIn("prediction", result)
        self.assertIn("confidence", result)
        self.assertIn("custom_resnet50", result["model"])
        print("ML Service Prediction Test:", result["prediction"], f"({result['confidence']*100}%)")

    def test_03_gemini_service(self):
        img = Image.new('RGB', (100, 100), color='green')
        import io
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        img_bytes = buf.getvalue()

        gemini_res = gemini_service.analyze_plant_image(img_bytes)
        self.assertIn("condition", gemini_res)
        self.assertIn("symptoms", gemini_res)
        print("Gemini Analysis Test Condition:", gemini_res["condition"])

    def test_04_dual_ai_consensus(self):
        ml_res = {
            "prediction": "Tomato Early Blight",
            "crop": "Tomato",
            "disease": "Early Blight",
            "confidence": 0.94,
            "class_id": 28
        }
        gemini_res = {
            "plant": "Tomato",
            "condition": "Early Blight",
            "confidence": 0.89,
            "severity": "Moderate",
            "symptoms": ["Brown circular spots"],
            "possible_nutrient_deficiencies": ["Nitrogen deficiency"]
        }
        report = diagnosis_service.synthesize_diagnosis(ml_res, gemini_res)
        self.assertEqual(report["consensus_status"], "AGREE")
        self.assertEqual(report["confidence_level"], "High")
        print("Consensus Engine Test:", report["consensus_status"], "->", report["final_diagnosis"])

    def test_05_motor_safety(self):
        user = self.db.query(User).first()
        if not user:
            user = User(username="test_farmer", full_name="Test", password_hash="hash")
            self.db.add(user)
            self.db.commit()

        # Turn ON motor
        res = motor_service.control_motor(self.db, "ON", "MANUAL", user.id)
        self.assertTrue(res["success"])
        self.assertEqual(res["status"], "ON")

        # Turn OFF motor
        res_off = motor_service.control_motor(self.db, "OFF", "MANUAL", user.id)
        self.assertTrue(res_off["success"])
        self.assertEqual(res_off["status"], "OFF")
        print("Motor Control Test: Passed ON and OFF safety checks.")

if __name__ == "__main__":
    unittest.main()
