from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.jobs.scheduler import start_scheduler

settings = get_settings()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:3000",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = start_scheduler()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title="MoMali Backend", version="1.0.0", lifespan=lifespan)


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})

# CORS configuration for frontend-backend connectivity
origins = (
    [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
    if settings.CORS_ORIGINS
    else DEFAULT_CORS_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    app.state.scheduler = start_scheduler()


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("shutdown")
async def shutdown_event() -> None:
    scheduler = getattr(app.state, "scheduler", None)
    if scheduler:
        scheduler.shutdown(wait=False)
