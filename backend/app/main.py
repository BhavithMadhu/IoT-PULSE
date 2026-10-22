import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.data.data_loader import data_loader
from backend.app.services.model_service import model_service
from backend.app.services.export_service import export_service
from backend.app.routers import (
    health, overview, attacks, statistics, hypotheses, model, explorer, export
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("iot_pulse.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing IoT PULSE Analytics Backend...")
    t0 = time.time()
    
    # 1. Load dataset & DuckDB
    data_loader.load_data()
    
    # 2. Pre-train & cache ML model
    model_service.train_and_evaluate()
    
    # 3. Generate export analytical tables
    export_service.generate_all_exports()
    
    t1 = time.time()
    logger.info(f"IoT PULSE Backend initialization complete in {t1 - t0:.2f} seconds.")
    yield
    logger.info("Shutting down IoT PULSE Analytics Backend...")

from pydantic import ValidationError

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Full-stack cybersecurity analytics engine for the RT-IOT2022 dataset.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    clean_errors = [
        {"loc": list(e.get("loc", [])), "msg": str(e.get("msg", "")), "type": str(e.get("type", ""))}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": clean_errors}
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Mount routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(overview.router, prefix=settings.API_PREFIX)
app.include_router(attacks.router, prefix=settings.API_PREFIX)
app.include_router(statistics.router, prefix=settings.API_PREFIX)
app.include_router(hypotheses.router, prefix=settings.API_PREFIX)
app.include_router(model.router, prefix=settings.API_PREFIX)
app.include_router(explorer.router, prefix=settings.API_PREFIX)
app.include_router(export.router, prefix=settings.API_PREFIX)

# Mount frontend SPA if dist exists (enables all-in-one single-container deployment)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_candidates = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("/app/frontend/dist"),
    Path("frontend/dist")
]
frontend_dist = next((p for p in dist_candidates if p.exists() and (p / "index.html").exists()), None)

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "project": "IoT PULSE — Cybersecurity Analytics Platform",
            "documentation": "/docs",
            "api_health": f"{settings.API_PREFIX}/health",
            "version": settings.PROJECT_VERSION
        }

