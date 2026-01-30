from fastapi import APIRouter

from app.api.routers import auth, health, open_banking

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(open_banking.router)
