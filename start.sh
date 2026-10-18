#!/bin/bash
# ==============================================================================
# IoT PULSE — Concurrent Dev Server Launcher (macOS / Linux)
# Starts FastAPI backend (port 8000) and Vite frontend (port 5173)
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "  IoT PULSE — Cybersecurity Analytics Platform"
echo "  Foundations of Data Science Case Study (RT-IOT2022)"
echo "======================================================================"

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "Shutting down IoT PULSE servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health
echo "Waiting for backend initialization..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/api/health > /dev/null 2>&1; then
        echo "Backend is healthy and ready!"
        break
    fi
    sleep 1
done

# Start Frontend
echo "Starting Vite Frontend on http://localhost:5173..."
npm --prefix frontend run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "======================================================================"
echo "  System Live & Accessible:"
echo "  - Web Dashboard:     http://localhost:5173"
echo "  - FastAPI Swagger:   http://localhost:8000/docs"
echo "  - Health Endpoint:   http://localhost:8000/api/health"
echo "  - Curated Exports:   $DIR/exports/"
echo "======================================================================"
echo "Press CTRL+C to stop all servers."

wait
