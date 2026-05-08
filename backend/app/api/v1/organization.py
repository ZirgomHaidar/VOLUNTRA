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

from app.models.notification import Notification, NotificationType
from app.schemas.event import Event as EventSchema

router = APIRouter()

@router.get("/active-events", response_model=List[EventSchema])
def get_active_events(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get active events for the current organization.
    """
    if current_user.role != UserRole.ORGANIZATION:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Event).filter(
        Event.organization_id == current_user.id,
        Event.end_time > func.now()
    ).all()

@router.post("/invite", status_code=201)
def invite_volunteer(
    volunteer_id: int,
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Invite a volunteer to an event.
    """
    if current_user.role != UserRole.ORGANIZATION:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    event = db.query(Event).filter(Event.id == event_id, Event.organization_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not owned by you")
    
    volunteer = db.query(User).filter(User.id == volunteer_id, User.role == UserRole.VOLUNTEER).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    
    # Create notification
    notification = Notification(
        user_id=volunteer_id,
        title="New Event Invitation",
        message=f"Organization {current_user.full_name} has invited you to join their event: {event.title}",
        type=NotificationType.INVITATION,
        event_id=event_id
    )
    db.add(notification)
    db.commit()
    return {"message": "Invitation sent successfully"}

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
