import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# ============================================================
# JOB STATUS
# ============================================================

class JobStatus(str, Enum):
    CREATED = "CREATED"
    SCHEDULED = "SCHEDULED"
    QUEUED = "QUEUED"
    CLAIMED = "CLAIMED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    DEAD = "DEAD"


# ============================================================
# USER MODEL
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --------------------------------------------------------
    # USER RELATIONSHIPS
    # --------------------------------------------------------

    jobs: Mapped[list["Job"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    queues: Mapped[list["Queue"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    workers: Mapped[list["Worker"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ============================================================
# QUEUE MODEL
# ============================================================

class Queue(Base):
    __tablename__ = "queues"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # --------------------------------------------------------
    # OWNER
    # --------------------------------------------------------

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    concurrency_limit: Mapped[int] = mapped_column(
        Integer,
        default=5,
        nullable=False,
    )

    is_paused: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --------------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------------

    user: Mapped["User"] = relationship(
        back_populates="queues",
    )

    jobs: Mapped[list["Job"]] = relationship(
        back_populates="queue",
        cascade="all, delete-orphan",
    )


# ============================================================
# JOB MODEL
# ============================================================

class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # --------------------------------------------------------
    # OWNER
    # --------------------------------------------------------

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # QUEUE
    # --------------------------------------------------------

    queue_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("queues.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus),
        default=JobStatus.QUEUED,
        nullable=False,
        index=True,
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    claimed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    claimed_by_worker_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    attempt_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    max_attempts: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )

    idempotency_key: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --------------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------------

    user: Mapped["User"] = relationship(
        back_populates="jobs",
    )

    queue: Mapped["Queue"] = relationship(
        back_populates="jobs",
    )

    __table_args__ = (
        Index(
            "ix_jobs_claimable",
            "status",
            "scheduled_at",
            "priority",
            "created_at",
        ),
    )


# ============================================================
# WORKER MODEL
# ============================================================

class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # --------------------------------------------------------
    # OWNER
    # --------------------------------------------------------

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="IDLE",
        nullable=False,
    )

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --------------------------------------------------------
    # RELATIONSHIP
    # --------------------------------------------------------

    user: Mapped["User"] = relationship(
        back_populates="workers",
    )