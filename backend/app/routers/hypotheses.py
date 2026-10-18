from fastapi import APIRouter
from backend.app.services.hypothesis_service import hypothesis_service
from backend.app.schemas.responses import HypothesisSummaryResponse

router = APIRouter(prefix="/hypotheses", tags=["Hypothesis Testing"])

@router.get("", response_model=HypothesisSummaryResponse)
def get_hypotheses():
    return hypothesis_service.get_hypothesis_summary()
