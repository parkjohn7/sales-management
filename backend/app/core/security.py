from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any

from app.core.config import get_settings


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def create_access_token(payload: dict[str, Any]) -> str:
    settings = get_settings()
    issued_payload = {
        **payload,
        "exp": int(time.time()) + settings.access_token_expire_minutes * 60,
    }
    header = {"alg": "HS256", "typ": "JWT"}
    header_part = _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_part = _b64encode(json.dumps(issued_payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_part}.{payload_part}".encode("ascii")
    signature = hmac.new(
        settings.dev_token_secret.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    return f"{header_part}.{payload_part}.{_b64encode(signature)}"


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        header_part, payload_part, signature_part = token.split(".")
    except ValueError as exc:
        raise ValueError("Malformed bearer token") from exc

    signing_input = f"{header_part}.{payload_part}".encode("ascii")
    expected_signature = hmac.new(
        settings.dev_token_secret.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    supplied_signature = _b64decode(signature_part)
    if not hmac.compare_digest(expected_signature, supplied_signature):
        raise ValueError("Invalid bearer token signature")

    payload = json.loads(_b64decode(payload_part))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise ValueError("Bearer token has expired")
    return payload
