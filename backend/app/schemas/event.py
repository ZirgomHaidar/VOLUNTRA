from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class EventCreate(EventBase):
    latitude: float
    longitude: float
    skills: List[str]

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    skills: Optional[List[str]] = None

class Event(EventBase):
    id: int
    organization_id: int
    organization_name: Optional[str] = None
    has_joined: Optional[bool] = False

    class Config:
        from_attributes = True

class MatchResult(BaseModel):
    event_id: int
    title: str
    score: float
    distance_km: float
    match_reasons: List[str]
