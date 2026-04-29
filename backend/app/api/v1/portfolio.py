from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.portfolio import Portfolio, Media
from app.schemas.portfolio import Portfolio as PortfolioSchema, PortfolioUpdate
from app.services import media as media_service

router = APIRouter()

@router.get("/me", response_model=PortfolioSchema)
def get_my_portfolio(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        # Create empty portfolio if it doesn't exist
        portfolio = Portfolio(user_id=current_user.id, bio="")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio

@router.put("/me", response_model=PortfolioSchema)
def update_portfolio(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    portfolio_in: PortfolioUpdate,
) -> Any:
    """
    Update portfolio bio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=current_user.id, bio=portfolio_in.bio)
        db.add(portfolio)
    else:
        portfolio.bio = portfolio_in.bio
    db.commit()
    db.refresh(portfolio)
    return portfolio

@router.post("/me/media", response_model=PortfolioSchema)
async def upload_portfolio_media(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
) -> Any:
    """
    Upload media to portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=current_user.id, bio="")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

    url, public_id = media_service.upload_image(file.file)
    
    media = Media(
        portfolio_id=portfolio.id,
        url=url,
        public_id=public_id,
        media_type=file.content_type.split('/')[0],
        caption=caption
    )
    db.add(media)
    db.commit()
    db.refresh(portfolio)
    return portfolio

@router.delete("/me/media/{media_id}", response_model=PortfolioSchema)
def delete_portfolio_media(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    media_id: int,
) -> Any:
    """
    Delete media from portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    media = db.query(Media).filter(Media.id == media_id, Media.portfolio_id == portfolio.id).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    media_service.delete_image(media.public_id)
    db.delete(media)
    db.commit()
    db.refresh(portfolio)
    return portfolio
