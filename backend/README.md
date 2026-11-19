# FetoAI Backend Microservice

Microservice supporting Python sandbox execution, hybrid vector RAG embeddings, and LLM orchestration for FetoAI SaaS.

## Environment Setup
Copy `.env` and supply optional Free-tier API keys:
- `GROQ_API_KEY`: https://console.groq.com
- `GEMINI_API_KEY`: https://aistudio.google.com
- `TAVILY_API_KEY`: https://tavily.com
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: https://supabase.com

*Note: If keys are left blank, FetoAI automatically falls back to the built-in deterministic demo engine.*

## Running the Backend
```bash
pip install -r requirements.txt
python main.py
```
Default port: `http://localhost:8000`
