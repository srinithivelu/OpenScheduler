from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Queue, User
from ..repositories.queue import create_queue
from ..schemas.queue import QueueCreate, QueueResponse
from .auth import get_current_user


router = APIRouter(
    prefix="/queues",
    tags=["Queues"],
)


# ============================================================
# CREATE QUEUE
# ============================================================

@router.post("/", response_model=QueueResponse)
def create_new_queue(
    queue_data: QueueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    queue = Queue(
        user_id=current_user.id,
        name=queue_data.name,
        description=queue_data.description,
    )

    db.add(queue)
    db.commit()
    db.refresh(queue)

    return queue


# ============================================================
# GET CURRENT USER'S QUEUES
# ============================================================

@router.get("/", response_model=list[QueueResponse])
def get_queues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return (
        db.query(Queue)
        .filter(Queue.user_id == current_user.id)
        .order_by(Queue.created_at.desc())
        .all()
    )