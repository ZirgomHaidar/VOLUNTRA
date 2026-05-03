import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.db.base_class import Base

class UserRole(str, enum.Enum):
    VOLUNTEER = "volunteer"
    ORGANIZATION = "organization"
    ADMIN = "admin"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum(UserRole), default=UserRole.VOLUNTEER, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_verified = Column(Boolean(), default=False)
    reliability_score = Column(Integer, default=100) # 0-100
    points = Column(Integer, default=0)
