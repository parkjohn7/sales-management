from typing import Any

from fastapi import HTTPException


def ok(data: Any, meta: dict[str, Any] | None = None) -> dict[str, Any]:
    response: dict[str, Any] = {"success": True, "data": data}
    if meta is not None:
        response["meta"] = meta
    return response


def fail(status_code: int, code: str, message: str, details: Any = None) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"success": False, "error": {"code": code, "message": message, "details": details}},
    )
