"""One error format for every response, and no raw errors or stack traces sent to users.

Every error body looks like:
    {"error": {"code": "machine_readable", "message": "Plain-language message.", ...}}
"""

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("momali.errors")

GENERIC_MESSAGE = "Something went wrong on our side. Your data is safe. Please try again."


class ApiError(Exception):
    """An expected error with a status code, a stable code and a friendly message."""

    def __init__(self, status_code: int, code: str, message: str, headers: dict[str, str] | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.headers = headers


def error_body(code: str, message: str, **extra: object) -> dict:
    return {"error": {"code": code, "message": message, **extra}}


def unauthorized(code: str, message: str) -> ApiError:
    # OAuth 2.0 bearer-token errors carry a WWW-Authenticate header.
    return ApiError(401, code, message, headers={"WWW-Authenticate": "Bearer"})


_HTTP_DEFAULTS = {
    404: ("not_found", "We couldn't find what you were looking for."),
    405: ("method_not_allowed", "That action isn't supported here."),
}


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(_: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message), headers=exc.headers)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code, message = _HTTP_DEFAULTS.get(exc.status_code, ("http_error", "That request couldn't be completed."))
        return JSONResponse(
            status_code=exc.status_code, content=error_body(code, message), headers=getattr(exc, "headers", None)
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        # Report which fields are wrong and why, but never echo submitted values (they may be passwords).
        fields = [
            {
                "field": ".".join(str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path")),
                "message": err.get("msg", ""),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422, content=error_body("validation_error", "Some fields need attention.", fields=fields)
        )

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        # Fallback only: the request middleware in main.py normally handles these first.
        return unexpected_error_response(request, exc)


def unexpected_error_response(request: Request, exc: Exception) -> JSONResponse:
    reference = getattr(request.state, "request_id", None) or uuid.uuid4().hex
    # Log the exception type and the request id only: the message could contain personal data
    # (database errors, for example, can include the values that failed).
    logger.error("Unhandled %s on %s %s (ref %s)", type(exc).__name__, request.method, request.url.path, reference)
    return JSONResponse(status_code=500, content=error_body("internal_error", GENERIC_MESSAGE, reference=reference))
