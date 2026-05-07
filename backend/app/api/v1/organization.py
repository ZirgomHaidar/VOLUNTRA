from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.reliability import Participation, ParticipationStatus
from app.schemas.organization import OrganizationStats, VolunteerMatch
from app.services import matching as matching_service

router = APIRouter()

@router.get("/stats", response_model=OrganizationStats)
def get_org_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get statistics for the current organization.
    """
    if current_user.role != UserRole.ORGANIZATION:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    active_events = db.query(Event).filter(
        Event.organization_id == current_user.id,
        Event.end_time > func.now()
    ).count()
    
    # Total unique volunteers who joined their events
    total_volunteers = db.query(Participation).join(Event).filter(
        Event.organization_id == current_user.id
    ).distinct(Participation.user_id).count()
    
    # Completion rate: COMPLETED / (COMPLETED + NO_SHOW + CANCELLED)
    total_finished = db.query(Participation).join(Event).filter(
        Event.organization_id == current_user.id,
        Participation.status.in_([
            ParticipationStatus.COMPLETED, 
            ParticipationStatus.NO_SHOW, 
            ParticipationStatus.CANCELLED
        ])
    ).count()
    
    completed = db.query(Participation).join(Event).filter(
        Event.organization_id == current_user.id,
        Participation.status == ParticipationStatus.COMPLETED
    ).count()
    
    completion_rate = (completed / total_finished * 100) if total_finished > 0 else 100.0
    
    return {
        "active_events": active_events,
        "total_volunteers": total_volunteers,
        "completion_rate": round(completion_rate, 1)
    }

@router.get("/suggested-volunteers", response_model=List[VolunteerMatch])
def get_suggested_volunteers(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get AI-suggested volunteers for the organization's events.
    """
    if current_user.role != UserRole.ORGANIZATION:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return matching_service.get_suggested_volunteers(db, organization_id=current_user.id)
