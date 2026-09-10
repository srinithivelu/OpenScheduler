import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from .database import SessionLocal
from .models import Job, JobStatus


WORKER_ID = uuid.uuid4()


def process_job(job: Job):
    print("\n==============================")
    print("WORKER PICKED JOB")
    print("==============================")
    print(f"Worker ID: {WORKER_ID}")
    print(f"Job ID: {job.id}")
    print(f"Payload: {job.payload}")

    print("Executing job...")

    # Simulate actual work
    time.sleep(3)

    print("Job execution completed!")


def run_worker():
    print("==============================")
    print("OpenScheduler Worker started")
    print(f"Worker ID: {WORKER_ID}")
    print("Waiting for jobs...")
    print("==============================\n")

    while True:
        db = SessionLocal()

        try:
            # Lock one available job.
            # SKIP LOCKED allows multiple workers to safely
            # work on different jobs at the same time.
            statement = (
                select(Job)
                .where(
                    Job.status == JobStatus.QUEUED,
                    Job.scheduled_at <= datetime.now(timezone.utc),
                )
                .order_by(
                    Job.priority.desc(),
                    Job.created_at.asc(),
                )
                .with_for_update(skip_locked=True)
                .limit(1)
            )

            job = db.execute(statement).scalars().first()

            if job is None:
                db.rollback()
                db.close()
                time.sleep(2)
                continue

            # Claim the job while the database row is locked.
            job.status = JobStatus.RUNNING
            job.claimed_at = datetime.now(timezone.utc)
            job.started_at = datetime.now(timezone.utc)
            job.claimed_by_worker_id = WORKER_ID
            job.attempt_count += 1

            db.commit()

            print(f"\nFound job: {job.id}")
            print(f"Claimed by worker: {WORKER_ID}")

            # Execute the job
            process_job(job)

            # Mark completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.now(timezone.utc)

            db.commit()

            print(f"Job {job.id} -> COMPLETED\n")

        except Exception as e:
            print(f"Worker error: {e}")
            db.rollback()

        finally:
            db.close()


if __name__ == "__main__":
    run_worker()