# backend/utils/generation_models.py

from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class GenerationResponseData(BaseModel):
    file_id: str
    success: bool
    message: Optional[str] = None
    raw_llm_response: Optional[str] = None

class GenerationMode(str, Enum):
    DIRECT = "direct"
    PROMPT = "prompt"
    PASTE = "paste"

class GenerationRequest(BaseModel):
    prompt: Optional[str] = None
    current_track: Optional[str] = None
    unchosen_track: Optional[str] = None
    user_name: Optional[str] = None


# 智能总结返回Data
class SummarizeRequest(BaseModel):
    content: str
    model: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str
    success: bool
    message: Optional[str] = None

# 生成HTML返回Data
class WebFetchResponse(BaseModel):
    content: str
    success: bool
    message: Optional[str] = None

class WebFetchRequest(BaseModel):
    url: str