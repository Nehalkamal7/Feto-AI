from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.services.document_service import (
    process_and_store_document,
    hybrid_search_knowledge_base,
)
from app.services.supabase_service import get_supabase_client

router = APIRouter()


class SearchQueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    match_count: int = 5
    document_id: Optional[str] = None


@router.post("/documents/upload")
async def upload_document_endpoint(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """
    Ingest and embed a document into the Knowledge Base:
    - Extracts text per page from PDF, DOCX, TXT, or MD
    - Recursive semantic chunking (chunk_size=800, chunk_overlap=150)
    - Generates 384-dim embeddings locally (all-MiniLM-L6-v2)
    - Stores document and chunks in Supabase pgvector
    """
    try:
        file_bytes = await file.read()
        file_name = file.filename or "uploaded_document"
        file_type = file.content_type or "application/octet-stream"

        result = await process_and_store_document(
            file_bytes=file_bytes,
            file_name=file_name,
            file_type=file_type,
            user_id=user_id,
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document ingestion failed: {str(e)}")


@router.get("/documents")
async def list_documents_endpoint(user_id: Optional[str] = None):
    """
    List user documents from Supabase documents table.
    """
    client = get_supabase_client()
    if not client or not user_id or user_id.startswith("guest"):
        return {
            "documents": [
                {
                    "id": "doc_default_1",
                    "title": "FetoAI_Architecture_Whitepaper.pdf",
                    "size": "2.4 MB",
                    "type": "pdf",
                    "chunkCount": 38,
                    "vectorId": "vec_7f39a1",
                    "status": "ready",
                    "uploadedAt": "2025-02-10",
                },
                {
                    "id": "doc_default_2",
                    "title": "Enterprise_SOC2_Compliance_2025.pdf",
                    "size": "1.8 MB",
                    "type": "pdf",
                    "chunkCount": 24,
                    "vectorId": "vec_2b810d",
                    "status": "ready",
                    "uploadedAt": "2025-02-12",
                },
                {
                    "id": "doc_default_3",
                    "title": "Cloud_Infrastructure_Runbook.docx",
                    "size": "950 KB",
                    "type": "docx",
                    "chunkCount": 16,
                    "vectorId": "vec_9c44e2",
                    "status": "ready",
                    "uploadedAt": "2025-02-14",
                },
            ]
        }

    try:
        res = client.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"documents": res.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")


@router.delete("/documents/{document_id}")
async def delete_document_endpoint(document_id: str, user_id: Optional[str] = None):
    """
    Deletes a document and cascades deletion of its vector chunks.
    """
    client = get_supabase_client()
    if not client:
        return {"success": True, "message": "Document removed from local cache."}

    try:
        query = client.table("documents").delete().eq("id", document_id)
        if user_id and not user_id.startswith("guest"):
            query = query.eq("user_id", user_id)
        query.execute()
        return {"success": True, "document_id": document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@router.post("/documents/search")
async def hybrid_search_endpoint(payload: SearchQueryRequest):
    """
    Test endpoint for hybrid search (vector cosine + tsvector keyword RRF).
    """
    results = await hybrid_search_knowledge_base(
        query_text=payload.query,
        user_id=payload.user_id,
        match_count=payload.match_count,
        filter_document_id=payload.document_id,
    )
    return {"query": payload.query, "results": results}
