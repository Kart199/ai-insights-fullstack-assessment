from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    """Raised for any client error; rendered as {"error", "message"}."""

    def __init__(self, error: str, message: str, status_code: int = 400):
        self.error = error
        self.message = message
        self.status_code = status_code


def _error_response(error: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": error, "message": message},
    )


# Maps a request field to the error code the API contract promises.
_FIELD_ERRORS = {
    "prompt": ("INVALID_PROMPT", "Prompt is required and must be a string"),
    "targetLanguage": (
        "INVALID_LANGUAGE",
        "Target language is required and must be a string",
    ),
    "contextId": ("INVALID_CONTEXT_ID", "contextId must be a valid UUID"),
    "page": ("INVALID_PAGINATION", "page must be an integer >= 1"),
    "pageSize": (
        "INVALID_PAGINATION",
        "pageSize must be an integer between 1 and 100",
    ),
}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(_: Request, exc: ApiError):
        return _error_response(exc.error, exc.message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        errors = exc.errors()
        first = errors[0] if errors else {}
        loc = first.get("loc", ())
        field = loc[-1] if loc else None

        if first.get("type") == "json_invalid":
            return _error_response(
                "INVALID_REQUEST", "Request body must be valid JSON", 400
            )

        error, message = _FIELD_ERRORS.get(
            field, ("INVALID_REQUEST", "Request is invalid")
        )
        return _error_response(error, message, 400)
