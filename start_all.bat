@echo off
echo ========================================================
echo   Starting Smart Farming AI Web Application (SIH)
echo ========================================================
echo.

set PY_CMD=python
where py >nul 2>nul && set PY_CMD=py

echo 1. Launching Python FastAPI Backend Server (Port 8000)...
start "Smart Farm Backend (FastAPI)" cmd /k "%PY_CMD% -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. Launching React Vite Frontend Dev Server (Port 5173)...
start "Smart Farm Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo 3. Waiting 3 seconds for servers to initialize...
timeout /t 3 >nul

echo 4. Launching Default Web Browser...
start http://localhost:5173

echo.
echo ========================================================
echo   Web Application Running: http://localhost:5173
echo   Production Unified URL:  http://localhost:8000
echo   API Documentation:       http://localhost:8000/docs
echo ========================================================
echo.
pause
