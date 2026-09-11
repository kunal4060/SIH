# Smart Farming AI & Dual Plant Pathology Web Application (SIH Edition)

An AI-powered digital assistant platform for Indian farmers, combining real-time farm sensor monitoring, automated/manual irrigation motor control, an empathetic farmer AI chatbot, and a **Dual AI Plant Doctor** that cross-references a trained ResNet50 machine learning model with Google Gemini Vision AI.

---

## 🌟 Key Features

1. **Farmer Dashboard**: Real-time soil moisture %, water tank level %, temperature °C, humidity %, weather card, and motor state.
2. **Dual AI Plant Doctor**:
   - Camera scanner with live viewport (`getUserMedia`), upload from gallery, capture, retake, and flip camera controls.
   - **Analysis A**: Trained ResNet50 Convolutional Neural Network (38 PlantVillage crop & disease classes).
   - **Analysis B**: Google Gemini Vision AI image analysis with structured pathology prompts.
   - **Dual AI Consensus Engine**: Compares both models, reports agreement status, assigns confidence, and generates unified diagnosis cards with nutrient deficiency warnings ("Possible deficiency — confirm with soil/leaf testing"), treatment steps, and prevention measures.
3. **Contextual Farmer AI Assistant (Kisan Mitra)**:
   - Chatbot powered by Google Gemini.
   - Injected with real-time farm sensor telemetry and active plant disease scan context.
   - Pre-built quick prompt chips ("Should I water today?", "Why are my leaves yellow?").
4. **Smart Motor & Safety Control**:
   - MANUAL & AUTO irrigation modes.
   - Backend safety interlocks: prevents pump activation if water tank level drops below safety thresholds (< 15%).
   - AUTO mode triggers pump automatically when soil moisture falls below configured thresholds.
5. **Farm Telemetry & ESP32 Connector**:
   - `POST /api/sensors/telemetry` endpoint for physical ESP32 micro-controllers + automatic mock telemetry provider fallback.
6. **Plant Health History**:
   - Persistent SQLite database archiving all plant scans, ML outputs, Gemini outputs, and consensus reports with search and filter capabilities.
7. **Multilingual Architecture**:
   - Supports English, Hindi (हिंदी), Marathi (मराठी), and Telugu (తెలుగు).
8. **Fully Mobile-Responsive**:
   - PWA-style bottom sticky navigation bar on mobile devices.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         React + Vite Mobile/Desktop UI                   │
│  - Dashboard  - Dual AI Plant Doctor  - Farmer AI Chat  - Scan History  │
│  - Sensor/Irrigation Controls  - Weather Card  - Multilingual Switcher    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP REST APIs / CORS
┌────────────────────────────────────▼─────────────────────────────────────┐
│                          FastAPI Python Backend                          │
│                                                                          │
│  ├── Auth & User Service (JWT + Passlib Hashing)                         │
│  ├── Sensor & Motor Service (ESP32 Gateway + Hardware Simulator)         │
│  ├── Weather Service (Agricultural Weather Telemetry)                   │
│  ├── ML Inference Service (TensorFlow ResNet50 - 38 Classes)             │
│  ├── Gemini Vision Service (Structured Plant Analysis Prompt)            │
│  ├── Dual AI Consensus Engine (ML vs Gemini Comparison Strategy)        │
│  ├── Contextual Farmer Chatbot (Sensor Data + Recent Scan Injection)     │
│  └── SQLite Database (SQLAlchemy ORM + Persistent Audit Logs)            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── chatbot.py
│   │   │   ├── dashboard.py
│   │   │   ├── motor.py
│   │   │   ├── plant.py
│   │   │   ├── sensors.py
│   │   │   └── weather.py
│   │   ├── config/
│   │   │   └── settings.py
│   │   ├── database/
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── services/
│   │   │   ├── diagnosis_service.py
│   │   │   ├── gemini_service.py
│   │   │   ├── ml_service.py
│   │   │   ├── motor_service.py
│   │   │   ├── sensor_service.py
│   │   │   └── weather_service.py
│   │   ├── utils/
│   │   │   ├── image_processing.py
│   │   │   └── security.py
│   │   └── main.py
│   ├── test_system.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── DiagnosisResult.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   ├── MotorControl.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PlantScanner.jsx
│   │   │   ├── SensorCard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── WeatherCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Irrigation.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Monitoring.jsx
│   │   │   ├── PlantDoctor.jsx
│   │   │   ├── PlantHistory.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Weather.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── Plant-Disease-Trained-model-Dataset/
│   └── batch-13-plant-disease-resnet-50.py
├── .env
├── start_all.bat
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root folder:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
SECRET_KEY=smart_farm_sih_secret_key_2026_super_secure_99
DATABASE_URL=sqlite:///./smart_farm.db
AUTO_IRRIGATION_MOISTURE_THRESHOLD=40.0
MIN_WATER_TANK_LEVEL=15.0
```

> **Note**: If `GEMINI_API_KEY` is not set or quota is exceeded, the application gracefully operates using the local ML ResNet50 model and guided expert rule sets.

---

## 🚀 How to Run the Application

### Option A: One-Click Windows Launch
Double click `start_all.bat` (or run `start_backend.bat` and `start_frontend.bat` in separate command prompts).

### Option B: Manual Launch

#### 1. Start Python Backend:
```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start React Frontend:
```bash
cd frontend
npm install
npm run dev
```

Open browser at `http://localhost:5173`.

---

## 🔑 Demo Quick-Login Credentials

- **Username**: `kunal`
- **Password**: `farmer123`

*(Click the "Auto Fill" button on the Login page for 1-click access)*

---

## 🔌 ESP32 Micro-controller Integration

Physical ESP32 hardware can push sensor readings via HTTP POST to:

```http
POST http://<server-ip>:8000/api/sensors/telemetry
Content-Type: application/json

{
  "soilMoisture": 38.5,
  "temperature": 28.4,
  "humidity": 69.0,
  "waterLevel": 72.0
}
```

---

## 🧪 Testing

Run the automated backend test suite:
```bash
python backend/test_system.py
```
Verifies ML inference, Gemini service, motor safety rules, consensus engine, and DB persistence.
