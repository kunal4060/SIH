# Smart Farm AI

An AI-powered farming assistant built for the Smart India Hackathon (SIH). It combines live farm sensor monitoring, irrigation motor control, a farmer chatbot, and a dual-AI plant disease doctor in one mobile-friendly web app.

## What it does

1. **Farmer dashboard:** live soil moisture, water tank level, temperature, humidity, weather, and motor state.
2. **Dual AI Plant Doctor:** photograph a crop and get a diagnosis from two models — a trained ResNet50 classifier (PlantVillage crop/disease classes) and Google Gemini Vision — cross-checked by a consensus engine with treatment and prevention steps.
3. **Kisan Mitra chatbot:** a Gemini-powered assistant that answers farming questions with your live sensor data as context.
4. **Smart irrigation:** manual and automatic motor control with safety interlocks (the pump will not run if the tank level is too low).
5. **Scan history:** every plant scan and diagnosis is archived in a SQLite database with search and filters.
6. **ESP32 support:** physical sensors can push telemetry to `POST /api/sensors/telemetry`; a mock provider fills in when no hardware is connected.

The app works in English, Hindi, Marathi, and Telugu.

## Requirements

- Python 3.10 or newer (backend)
- Node.js 18 or newer (frontend)
- A Google Gemini API key for the chatbot and Vision analysis

## Install

### 1. Download the project

```bash
git clone https://github.com/kunal4060/SIH.git
cd SIH
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` in the repo root and add your `GEMINI_API_KEY`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

## Usage

Start the backend (FastAPI on port 8000):

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Start the frontend (in a second terminal):

```bash
cd frontend
npm run dev
```

On Windows you can also use the ready-made launchers: `start_all.bat` starts everything, or `start_backend.bat` / `start_frontend.bat` individually. A static preview page, `smart_farm_app.html`, shows the UI without the backend. `docker-compose.yml` and `render.yaml` are provided for containerized and cloud deployment.

## Project structure

```text
SIH/
├── backend/                    ← FastAPI app (app/main.py, api, services, models)
├── frontend/                   ← React + Vite UI (src/, tailwind)
├── Plant-Disease-Trained-model-Dataset/ ← training data for the ResNet50 model
├── smart_farm_app.html         ← static UI preview
├── docker-compose.yml          ← container setup
├── render.yaml                 ← cloud deploy config
└── start_all.bat               ← Windows launcher
```

## License

Built for the Smart India Hackathon. Provided for learning purposes. No warranty is provided.
