import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", os.getenv("SUPABASE_URL", ""))
    SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    FETOAI_DEMO_MODE: bool = os.getenv("FETOAI_DEMO_MODE", "true").lower() == "true"

    # Dynamic credit costs per request type
    CREDIT_COST_STANDARD: int = 1
    CREDIT_COST_WEB_SEARCH: int = 2
    CREDIT_COST_DEEP_RAG: int = 2
    CREDIT_COST_CODE_INTERPRETER: int = 3

    # Primary & Fallback model identifiers
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Custom Fine-Tuned Model Endpoint (Hugging Face / Together AI / vLLM / Ollama)
    CUSTOM_MODEL_BASE_URL: str = os.getenv("CUSTOM_MODEL_BASE_URL", "")
    CUSTOM_MODEL_NAME: str = os.getenv("CUSTOM_MODEL_NAME", "custom-model")
    CUSTOM_MODEL_API_KEY: str = os.getenv("CUSTOM_MODEL_API_KEY", "")

settings = Settings()
