from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from ..models import Job, JobStatus


def create_job(
    db: Session,
    queue_id: UUID,
    payload: dict,
    priority: int = 0,
    scheduled_at: datetime | None = None,
):
    job = Job(
        queue_id=queue_id,
        payload=payload,
        priority=priority,
        status=JobStatus.QUEUED,
        scheduled_at=scheduled_at or datetime.now(timezone.utc),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job