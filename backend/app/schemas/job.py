from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE JOB
# ============================================================

class JobCreate(BaseModel):
    queue_id: UUID
    payload: dict
    priority: int = 0
    scheduled_at: datetime | None = None


# ============================================================
# JOB RESPONSE
# ============================================================

class JobResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    queue_id: UUID
    status: str
    priority: int
    payload: dict
    scheduled_at: datetime