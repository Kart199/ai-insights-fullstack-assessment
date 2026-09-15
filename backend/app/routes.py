from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .schemas import PromptRequest, SUPPORTED_LANGUAGES
from .services import generate_insights

router = APIRouter()


@router.post("/insights")
def create_insights(request: PromptRequest, page: int = 1, pageSize: int = 10):

    prompt = request.prompt.strip()

    if not prompt:
        return JSONResponse(
            status_code=400,
            content={
                "error": "INVALID_PROMPT",
                "message": "Prompt cannot be empty"
            }
        )

    if request.targetLanguage not in SUPPORTED_LANGUAGES:
        return JSONResponse(
            status_code=400,
            content={
                "error": "INVALID_LANGUAGE",
                "message": "Target language is not supported"
            }
        )

    if len(prompt) < 5:
        return {
            "status": "NEEDS_CLARIFICATION",
            "message": "Please provide more details",
            "insights": []
        }

    insights = generate_insights(
        prompt,
        request.targetLanguage
    )

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
            "hasNext": end < len(insights)
        }
    }