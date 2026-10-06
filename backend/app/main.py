"""Mo'Mali API. Stateless: no in-memory sessions, so any number of instances can run behind a load balancer."""

import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.database import engine
from app.core.errors import install_error_handlers, unexpected_error_response

logger = logging.getLogger("momali.access")


def create_app() -> FastAPI:
    settings = get_settings()
    logging.basicConfig(level=settings.log_level, format="%(asctime)s %(levelname)s %(name)s %(message)s")

    app = FastAPI(
        title="Mo'Mali API",
        version="0.1.0",
        description="Budgets, transactions, insights and consent management for Mo'Mali.",
        # Interactive docs are off in production to reduce the exposed surface.
        docs_url=None if settings.app_env == "production" else "/docs",
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["X-Request-ID"],
    )

    @app.middleware("http")
    async def request_id_and_access_log(request: Request, call_next):
        # The request id ties a user-visible error to a log line without logging personal data.
        request.state.request_id = uuid.uuid4().hex
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception as exc:
            # Handled here because Starlette's last-resort handler re-raises to the server, which then
            # logs the full traceback including the exception message (possibly personal data).
            response = unexpected_error_response(request, exc)
        response.headers["X-Request-ID"] = request.state.request_id
        # Method, path, status and timing only: no IP address, query string, headers or body.
        logger.info(
            "%s %s %s %.1fms ref=%s",
            request.method,
            request.url.path,
            response.status_code,
            (time.perf_counter() - started) * 1000,
            request.state.request_id,
        )
        return response

    install_error_handlers(app)
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["health"])
    def health() -> JSONResponse:
        """For load-balancer checks: 200 when the database answers, 503 otherwise."""
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
        except Exception:
            logger.warning("Health check: database unavailable")
            return JSONResponse(status_code=503, content={"status": "unavailable", "database": "unreachable"})
        return JSONResponse(status_code=200, content={"status": "ok", "database": "ok"})

    return app


app = create_app()
