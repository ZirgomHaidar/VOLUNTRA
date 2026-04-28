from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.event import MatchResult
from app.services import matching as matching_service

router = APIRouter()

@router.get("/suggested", response_model=List[MatchResult])
def get_suggested_events(
    lat: float,
    lon: float,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Get AI-suggested events based on location, skills, and user profile.
    """
    return matching_service.get_matches_for_user(
        db, user=current_user, lat=lat, lon=lon
    )
