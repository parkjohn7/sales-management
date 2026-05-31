from fastapi import APIRouter

from app.api.v1 import (
    accounts,
    activities,
    admin,
    auth,
    contacts,
    dashboard,
    health,
    integrations,
    leads,
    opportunities,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
