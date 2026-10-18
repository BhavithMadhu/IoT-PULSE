from fastapi import APIRouter
from backend.app.data.data_loader import data_loader
from backend.app.schemas.responses import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
def get_health():
    df = data_loader.df
    conn = data_loader.duckdb_conn
    duckdb_active = False
    if conn:
        res = conn.execute("SELECT 1").fetchone()
        duckdb_active = (res[0] == 1)

    return HealthResponse(
        status="healthy",
        dataset_loaded=data_loader._is_loaded,
        total_records=len(df),
        columns_count=len(df.columns),
        duckdb_active=duckdb_active
    )
