"""RAG document management endpoints."""

from app.core.security import get_current_active_user
from app.db.models.rag import RAGDocument
from app.db.session import get_db
from app.services.rag.document_service import upload_document
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/documents")
async def upload_rag_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Upload a PDF or DOCX document for RAG retrieval."""
    docs = await upload_document(file, current_user.id, db)
    return {"chunks_created": len(docs), "document_ids": [str(d.id) for d in docs]}


@router.get("/documents")
def list_rag_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """List all RAG documents owned by the current teacher."""
    docs = db.query(RAGDocument).filter(RAGDocument.teacher_id == current_user.id).all()
    return [
        {
            "id": str(d.id),
            "title": d.title,
            "source_type": d.source_type,
            "created_at": d.created_at,
        }
        for d in docs
    ]


@router.delete("/documents/{doc_id}", status_code=204)
def delete_rag_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a RAG document owned by the current teacher."""
    doc = db.query(RAGDocument).filter(RAGDocument.id == doc_id).first()
    if not doc or doc.teacher_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
