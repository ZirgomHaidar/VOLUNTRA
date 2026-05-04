from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from geoalchemy2 import Geometry
from app.db.base_class import Base

class LocationLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("event.id"), nullable=False)
    location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
