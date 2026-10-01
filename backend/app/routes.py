from fastapi import APIRouter, HTTPException, Query

from .schemas import PromptRequest, SUPPORTED_LANGUAGES
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

    if not prompt:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_PROMPT",
                "message": "Prompt is required",
            },
        )

    if target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_LANGUAGE",
                "message": "Target language is not supported",
            },
        )

    if len(prompt) < 5:
        return {
            "status": "NEEDS_CLARIFICATION",
            "message": "Please provide more details",
            "insights": [],
        }

    insights = generate_insights(prompt)

    start = (page - 1) * pageSize
    end = start + pageSize

    paginated_insights = insights[start:end]

    return {
        "status": "SUCCESS",
        "insights": paginated_insights,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": len(insights),
            "hasNext": end < len(insights),
        },
    }