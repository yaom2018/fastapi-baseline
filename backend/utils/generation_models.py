# backend/utils/generation_models.py

from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class GenerationResponseData(BaseModel):
    file_id: str
    success: bool
    html_path: Optional[str] = None
    message: Optional[str] = None
    raw_llm_response: Optional[str] = None

class GenerationMode(str, Enum):
    DIRECT = "direct"
    PROMPT = "prompt"
    PASTE = "paste"

class GenerationRequest(BaseModel):
    mode: GenerationMode
    prompt: Optional[str] = None
    template: Optional[str] = None
    html_input: Optional[str] = None
    style: Optional[str] = Field(default="default")
    model: Optional[str] = None
    temperature: Optional[float] = 0.7


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