from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base_class import Base

class UserSkill(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    skill = Column(String, nullable=False, index=True)
