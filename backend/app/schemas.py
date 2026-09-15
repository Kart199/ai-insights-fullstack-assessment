from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


SUPPORTED_LANGUAGES = {"en", "es", "fr", "de"}


class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    targetLanguage: str
    contextId: Optional[UUID] = None