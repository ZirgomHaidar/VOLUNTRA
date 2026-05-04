import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class ParticipationStatus(str, enum.Enum):
    JOINED = "joined"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Participation(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("event.id"), nullable=False)
    status = Column(Enum(ParticipationStatus), default=ParticipationStatus.JOINED, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="participations")
    event = relationship("Event", backref="participations")

class Feedback(Base):
    id = Column(Integer, primary_key=True, index=True)
    participation_id = Column(Integer, ForeignKey("participation.id"), unique=True, nullable=False)
    rating = Column(Integer, nullable=False) # 1-5
    comment = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participation = relationship("Participation", backref="feedback")
