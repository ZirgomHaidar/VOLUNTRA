import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class NotificationType(str, enum.Enum):
    INVITATION = "invitation"
    GENERAL = "general"

class Notification(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.GENERAL)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional link to event
    event_id = Column(Integer, ForeignKey("event.id"), nullable=True)
    
    user = relationship("User", backref="notifications")
    event = relationship("Event")
