from fastapi import APIRouter
from app.api.v1 import auth, matching

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
