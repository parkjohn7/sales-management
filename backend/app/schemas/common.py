from typing import Any

from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)


class ErrorBody(BaseModel):
    code: str
    message: str
    details: Any = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody


class SuccessResponse(BaseModel):
    success: bool = True
    data: Any
    meta: PageMeta | dict[str, Any] | None = None
