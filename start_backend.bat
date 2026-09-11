@echo off
echo Starting Smart Farm AI Python FastAPI Backend Server...
set PY_CMD=python
where py >nul 2>nul && set PY_CMD=py
%PY_CMD% -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause

