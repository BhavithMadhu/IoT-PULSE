from fastapi import APIRouter
from backend.app.services.data_service import data_service
from backend.app.services.model_service import model_service
from backend.app.schemas.responses import OverviewResponse

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("", response_model=OverviewResponse)
def get_overview():
    ml_metrics = model_service.get_overview_metrics()
    return data_service.get_overview(rf_metrics=ml_metrics)
