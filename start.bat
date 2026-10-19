@echo off
REM ==============================================================================
REM IoT PULSE - Windows Launcher
REM Starts FastAPI backend (port 8000) and Vite frontend (port 5173)
REM ==============================================================================

echo ======================================================================
echo   IoT PULSE - Cybersecurity Analytics Platform
echo   Foundations of Data Science Case Study (RT-IOT2022)
echo ======================================================================

echo Starting FastAPI Backend...
start "IoT-PULSE Backend" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"

echo Starting Vite Frontend...
start "IoT-PULSE Frontend" cmd /k "cd /d "%~dp0" && npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ======================================================================
echo   System Live & Accessible:
echo   - Web Dashboard:     http://localhost:5173
echo   - FastAPI Swagger:   http://localhost:8000/docs
echo   - Health Endpoint:   http://localhost:8000/api/health
echo ======================================================================
