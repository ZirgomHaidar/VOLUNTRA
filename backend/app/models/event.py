from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base_class import Base

# Association table for Event Skills
event_skills = Table(
    "event_skills",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("event.id"), primary_key=True),
    Column("skill", String, primary_key=True)
)

class Event(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String)
    organization_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # PostGIS geometry for location (longitude, latitude)
    location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    required_skills = relationship("Event", secondary=event_skills) # Note: Simplified for now, usually a separate Skill model
    
    organization = relationship("User", backref="organized_events")
