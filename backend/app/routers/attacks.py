from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.data_service import data_service
from backend.app.schemas.responses import (
    AttackDistributionResponse, ProtocolDistributionResponse,
    ServiceDistributionResponse, FeatureSummaryResponse
)

router = APIRouter(tags=["Attacks & Compositions"])

@router.get("/attacks/distribution", response_model=AttackDistributionResponse)
def get_attack_distribution():
    return data_service.get_attack_distribution()

@router.get("/protocols", response_model=ProtocolDistributionResponse)
def get_protocol_distribution():
    return data_service.get_protocol_distribution()

@router.get("/services", response_model=ServiceDistributionResponse)
def get_service_distribution(top_n: int = Query(20, ge=1, le=100)):
    return data_service.get_service_distribution(top_n=top_n)

@router.get("/features/summary", response_model=FeatureSummaryResponse)
def get_feature_summary():
    return data_service.get_feature_summary()
