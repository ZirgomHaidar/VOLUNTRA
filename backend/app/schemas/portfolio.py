from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class MediaBase(BaseModel):
    caption: Optional[str] = None
    media_type: Optional[str] = "image"

class MediaCreate(MediaBase):
    url: str
    public_id: str

class Media(MediaBase):
    id: int
    url: str
    created_at: datetime

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    bio: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioUpdate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    media: List[Media] = []
    created_at: datetime

    class Config:
        from_attributes = True
