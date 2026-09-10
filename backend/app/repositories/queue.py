from uuid import UUID

from sqlalchemy.orm import Session

from ..models import Queue
from ..schemas.queue import QueueCreate


# ============================================================
# CREATE QUEUE
# ============================================================

def create_queue(
    db: Session,
    queue_data: QueueCreate,
    user_id: UUID,
):
    queue = Queue(
        user_id=user_id,
        name=queue_data.name,
        description=queue_data.description,
    )

    db.add(queue)
    db.commit()
    db.refresh(queue)

    return queue


# ============================================================
# GET MY QUEUES
# ============================================================

def get_all_queues(
    db: Session,
    user_id: UUID,
):
    return (
        db.query(Queue)
        .filter(
            Queue.user_id == user_id
        )
        .order_by(
            Queue.created_at.desc()
        )
        .all()
    )