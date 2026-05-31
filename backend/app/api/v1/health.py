from fastapi import APIRouter

from app.api.responses import ok

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return ok({"status": "ok"})


@router.get("/ready")
def ready() -> dict:
    return ok({"status": "ready"})
