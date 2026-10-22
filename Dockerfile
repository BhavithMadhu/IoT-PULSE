# ==============================================================================
# IoT PULSE — Full-Stack All-in-One Multi-Stage Dockerfile
# Stage 1: Build the React 3D Web Application
# Stage 2: Serve API, Analytics & Static Frontend via FastAPI + DuckDB
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build production bundle
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Python Backend & Production Server
# ------------------------------------------------------------------------------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy dataset and backend application
COPY RT_IOT2022.csv ./RT_IOT2022.csv
COPY backend/ ./backend/
COPY exports/ ./exports/

# Copy built frontend assets from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /build/dist ./frontend/dist

# Expose standard container port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Launch FastAPI Uvicorn server using dynamic environment PORT
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
