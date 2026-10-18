from typing import Optional
from fastapi import APIRouter, Depends
from backend.app.schemas.filters import FlowFilterParams
from backend.app.schemas.responses import ExplorerResponse
from backend.app.services.data_service import data_service

router = APIRouter(tags=["Data Explorer"])

@router.get("/flows", response_model=ExplorerResponse)
def get_flows(params: FlowFilterParams = Depends()):
    return data_service.explore_flows(params)
