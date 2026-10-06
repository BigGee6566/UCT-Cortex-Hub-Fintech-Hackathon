from fastapi import APIRouter

from app.api.v1 import auth, budgets, consents, insights, transactions, users

api_router = APIRouter()
for module in (auth, users, budgets, transactions, insights, consents):
    api_router.include_router(module.router)
