from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.models.reliability import Participation, ParticipationStatus, Feedback
from app.services import reliability as reliability_service
from pydantic import BaseModel

router = APIRouter()

class FeedbackCreate(BaseModel):
    participation_id: int
    rating: int
    comment: str

@router.post("/join/{event_id}")
def join_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Volunteer joins an event.
    """
    existing = db.query(Participation).filter(
        Participation.user_id == current_user.id,
        Participation.event_id == event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this event")
    
    participation = Participation(user_id=current_user.id, event_id=event_id)
    db.add(participation)
    db.commit()
    return {"message": "Successfully joined event"}

@router.post("/complete/{participation_id}")
def complete_participation(
    participation_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Mark participation as completed and award points.
    """
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    
    participation.status = ParticipationStatus.COMPLETED
    db.commit()
    
    # Award points: 50 base points for completion
    reliability_service.award_points(db, participation.user_id, 50)
    reliability_service.update_user_reliability(db, participation.user_id)
    
    return {"message": "Participation marked as completed"}

@router.post("/no-show/{participation_id}")
def mark_no_show(
    participation_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Mark volunteer as no-show (drops reliability score).
    """
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    
    participation.status = ParticipationStatus.NO_SHOW
    db.commit()
    
    # Recalculate reliability (it will drop because of NO_SHOW status)
    reliability_service.update_user_reliability(db, participation.user_id)
    
    return {"message": "Participation marked as no-show"}

@router.post("/feedback")
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Submit feedback for a participation.
    """
    participation = db.query(Participation).filter(Participation.id == feedback_in.participation_id).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")

    feedback = Feedback(
        participation_id=feedback_in.participation_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment
    )
    db.add(feedback)
    db.commit()
    
    # Update reliability score after feedback
    reliability_service.update_user_reliability(db, participation.user_id)
    
    return {"message": "Feedback submitted successfully"}
