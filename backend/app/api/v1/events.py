from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.models.event import Event, event_skills
from app.schemas.event import EventCreate, Event as EventSchema
from geoalchemy2.elements import WKTElement
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=EventSchema)
def create_event(
    *,
    db: Session = Depends(deps.get_db),
    event_in: EventCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new event.
    """
    if current_user.role != UserRole.ORGANIZATION and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create location point
    point = f"POINT({event_in.longitude} {event_in.latitude})"
    
    event = Event(
        title=event_in.title,
        description=event_in.description,
        organization_id=current_user.id,
        location=WKTElement(point, srid=4326),
        start_time=event_in.start_time,
        end_time=event_in.end_time
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Add skills
    for skill in event_in.skills:
        db.execute(
            event_skills.insert().values(event_id=event.id, skill=skill)
        )
    db.commit()
    
    return event

@router.get("/me", response_model=List[EventSchema])
def get_my_events(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all events for the current organization.
    """
    if current_user.role != UserRole.ORGANIZATION:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Event).filter(Event.organization_id == current_user.id).all()

@router.get("/{event_id}", response_model=EventSchema)
def get_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
