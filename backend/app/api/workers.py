from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Worker, User
from .auth import get_current_user


router = APIRouter(
    tags=["Workers"]
)


# ============================================================
# WORKER SCHEMA
# ============================================================

class WorkerCreate(BaseModel):
    name: str


# ============================================================
# ADD WORKER
# ============================================================

@router.post("/")
def add_worker(
    worker_data: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    worker = Worker(
        id=__import__("uuid").uuid4(),
        user_id=current_user.id,
        name=worker_data.name,
        status="IDLE",
        registered_at=datetime.now(timezone.utc),
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    return {
        "id": str(worker.id),
        "name": worker.name,
        "status": worker.status,
        "registered_at": worker.registered_at.isoformat(),
    }


# ============================================================
# GET CURRENT USER'S WORKERS
# ============================================================

@router.get("/")
def get_workers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    workers = (
        db.query(Worker)
        .filter(Worker.user_id == current_user.id)
        .order_by(Worker.registered_at.desc())
        .all()
    )

    return [
        {
            "id": str(worker.id),
            "name": worker.name,
            "status": worker.status,
            "registered_at": worker.registered_at.isoformat(),
        }
        for worker in workers
    ]


# ============================================================
# GET SINGLE WORKER
# ============================================================

@router.get("/{worker_id}")
def get_worker(
    worker_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    worker = (
        db.query(Worker)
        .filter(
            Worker.id == worker_id,
            Worker.user_id == current_user.id
        )
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return {
        "id": str(worker.id),
        "name": worker.name,
        "status": worker.status,
        "registered_at": worker.registered_at.isoformat(),
    }


# ============================================================
# DELETE WORKER
# ============================================================

@router.delete("/{worker_id}")
def delete_worker(
    worker_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    worker = (
        db.query(Worker)
        .filter(
            Worker.id == worker_id,
            Worker.user_id == current_user.id
        )
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    db.delete(worker)
    db.commit()

    return {
        "message": "Worker deleted successfully"
    }