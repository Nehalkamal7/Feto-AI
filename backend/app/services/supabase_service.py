import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

supabase_client = None

def get_supabase_client():
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY):
        try:
            from supabase import create_client
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
            supabase_client = create_client(settings.SUPABASE_URL, key)
            return supabase_client
        except Exception as e:
            logger.warning(f"Could not initialize Supabase client: {e}")
            return None
    return None


async def get_user_system_memory(user_id: Optional[str]) -> str:
    """
    Fetches custom system memory instructions for the given user from Supabase.
    """
    if not user_id or user_id.startswith("guest"):
        return ""

    client = get_supabase_client()
    if not client:
        return ""

    try:
        response = client.table("user_memory").select("custom_instructions").eq("user_id", user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0].get("custom_instructions", "") or ""
    except Exception as e:
        logger.warning(f"Failed to fetch user memory for {user_id}: {e}")

    return ""


async def check_and_deduct_credits(user_id: Optional[str], cost: int = 1) -> Dict[str, Any]:
    """
    Checks user credit balance and deducts required credits.
    Standard: 1 credit
    Web Search / RAG: 2 credits
    Code Interpreter: 3 credits
    """
    if not user_id:
        return {"allowed": True, "remaining": 999, "plan": "guest"}

    # Guest user logic
    if user_id.startswith("guest"):
        return {"allowed": True, "remaining": 5, "plan": "guest"}

    client = get_supabase_client()
    if not client:
        # Graceful fallback: allow generation in demo mode
        return {"allowed": True, "remaining": 15 - cost, "plan": "free"}

    try:
        res = client.rpc("deduct_user_credit", {"user_uuid": user_id, "cost": cost}).execute()
        if res.data:
            return {
                "allowed": res.data.get("success", True),
                "remaining": res.data.get("remaining", 0),
                "plan": res.data.get("plan_tier", "free"),
                "error": res.data.get("error")
            }
    except Exception as e:
        logger.warning(f"Error calling deduct_user_credit RPC: {e}")

    return {"allowed": True, "remaining": 10, "plan": "free"}
