from typing import List, Dict, Any, Optional
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.router.llm_router import smart_stream_router

router = APIRouter()

class ChatStreamRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: str = "feto-auto"
    web_search: bool = False
    deep_rag: bool = False
    code_interpreter: bool = False
    attachments: Optional[List[Dict[str, Any]]] = []
    user_id: Optional[str] = None
    custom_keys: Optional[Dict[str, str]] = None


@router.post("/chat/stream")
async def chat_stream_endpoint(payload: ChatStreamRequest):
    """
    SSE Real-time streaming endpoint:
    Streams structured JSON events:
    - {"type": "trace", "step": "..."}
    - {"type": "citations", "data": [...]}
    - {"type": "code_execution", "data": {...}}
    - {"type": "token", "content": "..."}
    - {"type": "telemetry", "metrics": {...}}
    - {"type": "done"}
    """
    generator = smart_stream_router(
        messages=payload.messages,
        model_id=payload.model,
        web_search=payload.web_search,
        deep_rag=payload.deep_rag,
        code_interpreter=payload.code_interpreter,
        attachments=payload.attachments,
        user_id=payload.user_id,
        custom_keys=payload.custom_keys,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
        }
    )
