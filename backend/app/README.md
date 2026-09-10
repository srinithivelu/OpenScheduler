# OpenScheduler

OpenScheduler is a production-inspired distributed job scheduling platform.

## Features

- Queue creation
- Job creation
- Priority-based jobs
- Job scheduling
- PostgreSQL database
- FastAPI REST API
- Worker-based job execution
- Job status tracking

## Run API

```bash
python -m uvicorn backend.app.main:app --port 8001