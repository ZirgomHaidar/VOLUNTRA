from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_SetSRID
from app.api import deps
from app.models.event import Event
from app.models.user import User

router = APIRouter()

@router.post("/validate")
def validate_presence(
    event_id: int,
    lat: float,
    lon: float,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Validate if the volunteer is within 100m of the event location (Geo-fencing).
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Calculate distance using PostGIS
    user_point = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
    distance = db.query(ST_Distance(event.location, user_point)).scalar()
    
    # 100 meters threshold
    is_present = distance <= 100
    
    return {
        "is_present": is_present,
        "distance_meters": round(distance, 2),
        "message": "Validated" if is_present else "Too far from event location"
    }
