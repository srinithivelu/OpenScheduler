from uuid import UUID

from pydantic import BaseModel, ConfigDict


class QueueCreate(BaseModel):
    name: str
    description: str | None = None


class QueueResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)