from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.auth import router as auth_router
from .api.jobs import router as jobs_router
from .api.workers import router as workers_router
from .api.queues import router as queues_router


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="OpenScheduler API",
    description="Distributed Job Scheduling Platform",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # Allow frontend requests
    allow_origins=["*"],

    # Since we use JWT in Authorization header,
    # credentials are not required here.
    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "OpenScheduler API is running",
        "status": "online"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# API ROUTERS
# ============================================================

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