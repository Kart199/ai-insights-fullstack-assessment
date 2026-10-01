from uuid import uuid4

from fastapi import APIRouter, Query

from .errors import ApiError
from .schemas import MIN_PROMPT_LENGTH, SUPPORTED_LANGUAGES, PromptRequest
from .services import generate_insights

router = APIRouter()


@router.post("/insights")
def create_insights(
    request: PromptRequest,
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    prompt = request.prompt.strip()
    target_language = request.targetLanguage.strip().lower()
    context_id = str(request.contextId or uuid4())

    if not prompt:
        raise ApiError("INVALID_PROMPT", "Prompt is required")

    if target_language not in SUPPORTED_LANGUAGES:
        raise ApiError("INVALID_LANGUAGE", "Target language is not supported")

    # Decided before any downstream (AI) call.
    if len(prompt) < MIN_PROMPT_LENGTH:
        return {
            "status": "NEEDS_CLARIFICATION",
            "message": "Please provide more details",
            "contextId": context_id,
            "insights": [],
        }

    insights = generate_insights(prompt, target_language)

    start = (page - 1) * pageSize
    end = start + pageSize

    return {
        "status": "SUCCESS",
        "contextId": context_id,
        "insights": insights[start:end],
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": len(insights),
            "hasNext": end < len(insights),
        },
    }
