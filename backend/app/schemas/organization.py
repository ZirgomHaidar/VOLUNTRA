from pydantic import BaseModel
from typing import List
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
