from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stream import router as stream_router
from app.api.routes import router as general_router
from app.api.documents import router as documents_router
from app.config import settings

app = FastAPI(
    title="FetoAI Backend Microservice",
    description="High-performance backend for FetoAI SaaS with Server-Sent Events (SSE) streaming, smart multi-provider routing, zero-cost live web search, and Hybrid RAG with local embeddings.",
    version="1.2.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(stream_router, prefix="/api/v1", tags=["Streaming"])
app.include_router(general_router, prefix="/api/v1", tags=["General"])
app.include_router(documents_router, prefix="/api/v1", tags=["Documents"])
app.include_router(documents_router, prefix="/api", tags=["Documents (Root)"])


@app.get("/health")
def root_health():
    return {
        "status": "healthy",
        "service": "FetoAI Modular FastAPI Microservice",
        "version": "1.1.0",
        "sse_streaming_ready": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
