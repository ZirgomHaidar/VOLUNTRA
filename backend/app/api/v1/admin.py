from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.models.document import Document, DocumentStatus, DocumentType
from app.services import media as media_service
from pydantic import BaseModel

router = APIRouter()

class DocumentResponse(BaseModel):
    id: int
    type: DocumentType
    status: DocumentStatus
    url: str
    admin_comment: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
    doc_type: DocumentType = Form(...),
) -> Any:
    """
    Upload a document for verification.
    """
    url, public_id = media_service.upload_image(file.file, folder="voluntra/documents")
    
    doc = Document(
        user_id=current_user.id,
        type=doc_type,
        url=url,
        public_id=public_id,
        status=DocumentStatus.PENDING
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/my-documents", response_model=List[DocumentResponse])
def get_my_documents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all documents for the current user.
    """
    return db.query(Document).filter(Document.user_id == current_user.id).all()

# Admin Endpoints
@router.get("/admin/pending", response_model=List[DocumentResponse])
def get_pending_documents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all pending documents (Admin only).
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Document).filter(Document.status == DocumentStatus.PENDING).all()

@router.post("/admin/review/{doc_id}")
def review_document(
    doc_id: int,
    status: DocumentStatus,
    comment: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Approve or reject a document (Admin only).
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.status = status
    doc.admin_comment = comment
    
    # If identity is approved, verify user
    if status == DocumentStatus.APPROVED and doc.type == DocumentType.IDENTITY:
        doc.user.is_verified = True
        
    db.commit()
    return {"message": f"Document {status}"}
