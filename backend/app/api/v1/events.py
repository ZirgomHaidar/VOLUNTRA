from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.models.event import Event, event_skills
from app.models.reliability import Participation
from app.models.notification import Notification, NotificationType
from app.schemas.event import EventCreate, EventUpdate, Event as EventSchema
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
    role = current_user.role.lower()
    if role != 'organization' and role != 'admin':
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

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an event and notify joined volunteers.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    role = current_user.role.lower()
    if event.organization_id != current_user.id and role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = event_in.model_dump(exclude_unset=True)
    
    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.get("latitude", 0)
        lon = update_data.get("longitude", 0)
        point = f"POINT({lon} {lat})"
        event.location = WKTElement(point, srid=4326)
        update_data.pop("latitude", None)
        update_data.pop("longitude", None)

    if "skills" in update_data:
        db.execute(event_skills.delete().where(event_skills.c.event_id == event_id))
        for skill in update_data["skills"]:
            db.execute(event_skills.insert().values(event_id=event.id, skill=skill))
        update_data.pop("skills")

    for field in update_data:
        setattr(event, field, update_data[field])
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Notify joined volunteers
    volunteers = db.query(Participation).filter(Participation.event_id == event_id).all()
    for p in volunteers:
        notification = Notification(
            user_id=p.user_id,
            title=f"Update: {event.title}",
            message=f"The event '{event.title}' you joined has been updated. Please check the new details.",
            type=NotificationType.GENERAL,
            event_id=event_id
        )
        db.add(notification)
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
    if current_user.role.lower() != 'organization':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Event).filter(Event.organization_id == current_user.id).all()

@router.get("/{event_id}", response_model=EventSchema)
def get_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    has_joined = db.query(Participation).filter(
        Participation.user_id == current_user.id,
        Participation.event_id == event_id
    ).first() is not None
    
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "organization_id": event.organization_id,
        "organization_name": event.organization.full_name,
        "has_joined": has_joined
    }
