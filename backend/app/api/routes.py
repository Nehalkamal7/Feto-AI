from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.config import settings
from app.services.search_service import search_live_web
from app.services.sandbox_service import execute_python_code
from app.services.supabase_service import get_supabase_client, get_user_system_memory

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5

class PythonExecRequest(BaseModel):
    code: str

class MemoryRequest(BaseModel):
    user_id: str
    custom_instructions: str


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FetoAI FastAPI Microservice",
        "groq_primary_configured": bool(settings.GROQ_API_KEY),
        "gemini_fallback_configured": bool(settings.GEMINI_API_KEY),
        "tavily_search_configured": bool(settings.TAVILY_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL),
        "credit_costs": {
            "standard": settings.CREDIT_COST_STANDARD,
            "web_search": settings.CREDIT_COST_WEB_SEARCH,
            "deep_rag": settings.CREDIT_COST_DEEP_RAG,
            "code_interpreter": settings.CREDIT_COST_CODE_INTERPRETER,
        }
    }


@router.post("/search")
async def standalone_search(payload: SearchRequest):
    results = await search_live_web(payload.query, payload.max_results)
    return {"query": payload.query, "results": results}


@router.post("/execute-python")
@router.post("/python/execute")
def standalone_python(payload: PythonExecRequest):
    return execute_python_code(payload.code)


@router.get("/memory/{user_id}")
async def get_memory(user_id: str):
    instructions = await get_user_system_memory(user_id)
    return {"user_id": user_id, "custom_instructions": instructions}


@router.post("/memory")
async def save_memory(payload: MemoryRequest):
    client = get_supabase_client()
    if not client:
        return {"success": True, "note": "Local memory updated"}

    try:
        client.table("user_memory").upsert({
            "user_id": payload.user_id,
            "custom_instructions": payload.custom_instructions,
        }).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
