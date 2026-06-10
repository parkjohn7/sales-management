from __future__ import annotations

import argparse
import json
import time
from dataclasses import asdict, dataclass
from typing import Literal

from app.core.config import Settings, get_settings

ServiceRole = Literal[
    "main-api",
    "agent-worker",
    "risk-worker",
    "integration-worker",
    "bridge-service",
]

VALID_SERVICE_ROLES: tuple[ServiceRole, ...] = (
    "main-api",
    "agent-worker",
    "risk-worker",
    "integration-worker",
    "bridge-service",
)


@dataclass(frozen=True)
class WorkerRuntime:
    app_name: str
    app_env: str
    service_role: ServiceRole
    poll_interval_seconds: int
    batch_size: int
    agent_actions_enabled: bool
    risk_signals_enabled: bool
    external_sync_enabled: bool
    bridge_insights_enabled: bool


def build_worker_runtime(
    service_role: str | None = None,
    *,
    settings: Settings | None = None,
) -> WorkerRuntime:
    resolved_settings = settings or get_settings()
    resolved_role = service_role or resolved_settings.service_role
    if resolved_role not in VALID_SERVICE_ROLES:
        raise ValueError(f"Unsupported service role: {resolved_role}")

    return WorkerRuntime(
        app_name=resolved_settings.app_name,
        app_env=resolved_settings.app_env,
        service_role=resolved_role,
        poll_interval_seconds=resolved_settings.worker_poll_interval_seconds,
        batch_size=resolved_settings.worker_batch_size,
        agent_actions_enabled=resolved_settings.agent_actions_enabled,
        risk_signals_enabled=resolved_settings.risk_signals_enabled,
        external_sync_enabled=resolved_settings.external_sync_enabled,
        bridge_insights_enabled=resolved_settings.bridge_insights_enabled,
    )


def build_runtime_summary(
    service_role: str,
    *,
    settings: Settings | None = None,
) -> dict[str, object]:
    runtime = build_worker_runtime(service_role, settings=settings)
    summary = asdict(runtime)
    summary["runtime_mode"] = "worker" if runtime.service_role != "main-api" else "api"
    return summary


def parse_runtime_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-forever", action="store_true")
    return parser.parse_args(argv)


def run_worker_entrypoint(
    service_role: ServiceRole,
    *,
    argv: list[str] | None = None,
    settings: Settings | None = None,
) -> None:
    args = parse_runtime_args(argv)
    summary = build_runtime_summary(service_role, settings=settings)
    print(json.dumps(summary, ensure_ascii=False))
    if not args.run_forever:
        return

    resolved_settings = settings or get_settings()
    while True:
        time.sleep(resolved_settings.worker_poll_interval_seconds)
