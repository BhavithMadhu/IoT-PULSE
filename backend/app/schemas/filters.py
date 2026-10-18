from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class FlowFilterParams(BaseModel):
    attack_type: Optional[str] = Field(None, description="Filter by attack label")
    proto: Optional[str] = Field(None, description="Filter by protocol (e.g. tcp, udp, icmp)")
    service: Optional[str] = Field(None, description="Filter by service (e.g. mqtt, dns, http, -)")
    page: int = Field(1, ge=1, description="Page number, 1-indexed")
    page_size: int = Field(50, ge=1, le=500, description="Items per page (max 500)")
    sort_by: Optional[str] = Field("flow_duration", description="Column to sort by")
    sort_order: Optional[str] = Field("asc", description="Sort order: asc or desc")
    columns: Optional[str] = Field(None, description="Comma-separated columns to return")

    @field_validator("sort_order")
    def validate_sort_order(cls, v):
        if v and v.lower() not in {"asc", "desc"}:
            raise ValueError("sort_order must be 'asc' or 'desc'")
        return v.lower() if v else "asc"
