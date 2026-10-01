from typing import Optional
from uuid import UUID

from pydantic import BaseModel

SUPPORTED_LANGUAGES = {"en", "es", "fr", "de"}
MIN_PROMPT_LENGTH = 5


class PromptRequest(BaseModel):
    # Emptiness / language rules live in the route so every failure
    # goes through the same structured error format.
    prompt: str
    targetLanguage: str
    contextId: Optional[UUID] = None
