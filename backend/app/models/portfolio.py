from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Portfolio(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, nullable=False)
    bio = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="portfolio")
    media = relationship("Media", back_populates="portfolio", cascade="all, delete-orphan")

class Media(Base):
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolio.id"), nullable=False)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=False) # Cloudinary public ID for deletion
    media_type = Column(String) # e.g., 'image', 'video'
    caption = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    portfolio = relationship("Portfolio", back_populates="media")
