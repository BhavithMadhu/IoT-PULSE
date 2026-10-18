import os
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.app.services.export_service import export_service

router = APIRouter(prefix="/export", tags=["Exports & Power BI Integration"])

ALLOWED_TABLES = {
    "AttackDistribution",
    "ProtocolDistribution",
    "ServiceDistribution",
    "FeatureSummary",
    "HypothesisTestResults",
    "CorrelationResults",
    "ModelMetrics",
    "ConfusionMatrix",
    "FeatureImportance",
    "iot_pulse_clean_flows"
}

@router.get("/tables", response_model=Dict[str, Any])
def list_available_tables():
    return {
        "allowed_tables": sorted(list(ALLOWED_TABLES)),
        "export_format": "CSV",
        "powerbi_ready": True
    }

@router.get("/{table_name}")
def download_table(table_name: str):
    clean_name = table_name.replace(".csv", "")
    if clean_name not in ALLOWED_TABLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid table name '{table_name}'. Allowed tables: {sorted(list(ALLOWED_TABLES))}"
        )
    file_path = export_service.get_table_path(clean_name)
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=500, detail="Table file generation failed.")
    return FileResponse(
        path=str(file_path),
        filename=f"{clean_name}.csv",
        media_type="text/csv"
    )

@router.post("/generate")
def generate_all_exports():
    results = export_service.generate_all_exports()
    return {
        "status": "success",
        "generated_tables": len(results),
        "files": results
    }
