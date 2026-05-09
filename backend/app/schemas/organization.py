from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.schemas.event import Event

class OrganizationStats(BaseModel):
    active_events: int
    total_volunteers: int
    completion_rate: float

class VolunteerMatch(BaseModel):
    user_id: int
    full_name: str
    score: float
    expertise: str

class Participant(BaseModel):
    id: int # participation_id
    user_id: int
    user_name: str
    event_id: int
    event_title: str
    status: str
    joined_at: datetime

    class Config:
        from_attributes = True
