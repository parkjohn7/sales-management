from __future__ import annotations

from app.core.config import Settings
from workers.runtime import build_runtime_summary, run_worker_entrypoint

ROLE = "agent-worker"


def get_runtime_summary(settings: Settings | None = None) -> dict[str, object]:
    return build_runtime_summary(ROLE, settings=settings)


def main() -> None:
    run_worker_entrypoint(ROLE)


if __name__ == "__main__":
    main()
