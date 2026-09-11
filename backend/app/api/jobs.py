from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Job, Queue, User
from ..schemas.job import JobCreate, JobResponse
from .auth import get_current_user


router = APIRouter(
    tags=["Jobs"]
)


# ============================================================
# CREATE JOB
# ============================================================

@router.post("/", response_model=JobResponse)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Make sure the queue belongs to the logged-in user
    queue = (
        db.query(Queue)
        .filter(
            Queue.id == job_data.queue_id,
            Queue.user_id == current_user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    job = Job(
        user_id=current_user.id,
        queue_id=job_data.queue_id,
        payload=job_data.payload,
        priority=job_data.priority,
        scheduled_at=(
            job_data.scheduled_at
            if job_data.scheduled_at is not None
            else None
        ),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


# ============================================================
# GET CURRENT USER'S JOBS
# ============================================================

@router.get("/", response_model=list[JobResponse])
def get_all_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs


# ============================================================
# GET ONE JOB
# ============================================================

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


# ============================================================
# DELETE JOB
# ============================================================

@router.delete("/{job_id}")
def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    status = str(job.status).upper()

    if status == "RUNNING":
        raise HTTPException(
            status_code=400,
            detail="This job is currently running and cannot be deleted."
        )

    db.delete(job)
    db.commit()

    return {
        "message": "Job deleted successfully"
    }