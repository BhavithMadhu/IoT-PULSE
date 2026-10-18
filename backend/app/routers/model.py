from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.services.model_service import model_service
from backend.app.schemas.responses import (
    ModelMetricsResponse, ModelMetricRow, ConfusionMatrixData, FeatureImportanceItem
)

router = APIRouter(prefix="/model", tags=["Machine Learning"])

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    return model_service.train_and_evaluate()

@router.get("/confusion-matrix", response_model=ConfusionMatrixData)
def get_confusion_matrix():
    res = model_service.train_and_evaluate()
    return res.confusion_matrix

@router.get("/feature-importance", response_model=List[FeatureImportanceItem])
def get_feature_importance():
    res = model_service.train_and_evaluate()
    return res.top_feature_importance
