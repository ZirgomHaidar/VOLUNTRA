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

class Event(EventBase):
    id: int
    organization_id: int

    class Config:
        from_attributes = True

class MatchResult(BaseModel):
    event_id: int
    title: str
    score: float
    distance_km: float
    match_reasons: List[str]
