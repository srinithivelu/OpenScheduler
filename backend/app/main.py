from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .worker import run_worker

from .api.auth import router as auth_router
from .api.jobs import router as jobs_router
from .api.workers import router as workers_router
from .api.queues import router as queues_router


# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the job worker in the background
    worker_thread = Thread(
        target=run_worker,
        daemon=True
    )

    worker_thread.start()

    print("OpenScheduler background worker started")

    yield


app = FastAPI(
    title="OpenScheduler API",
    description="Distributed Job Scheduling Platform",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "OpenScheduler API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    jobs_router,
    prefix="/jobs",
    tags=["Jobs"]
)

app.include_router(
    workers_router,
    prefix="/workers",
    tags=["Workers"]
)

app.include_router(
    queues_router,
    prefix="/queues",
    tags=["Queues"]
)