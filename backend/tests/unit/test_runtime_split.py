import pytest
from app.core.config import Settings
from insights.bridge_service.main import get_runtime_summary as get_bridge_summary
from workers.agent_worker.main import get_runtime_summary as get_agent_summary
from workers.integration_worker.main import get_runtime_summary as get_integration_summary
from workers.risk_worker.main import get_runtime_summary as get_risk_summary
from workers.runtime import VALID_SERVICE_ROLES, build_worker_runtime


def test_settings_support_worker_runtime_values() -> None:
    settings = Settings(
        service_role="agent-worker",
        worker_poll_interval_seconds=45,
        worker_batch_size=20,
        agent_actions_enabled=True,
    )

    runtime = build_worker_runtime(settings=settings)

    assert runtime.service_role == "agent-worker"
    assert runtime.poll_interval_seconds == 45
    assert runtime.batch_size == 20
    assert runtime.agent_actions_enabled is True


def test_build_worker_runtime_rejects_unknown_role() -> None:
    with pytest.raises(ValueError):
        build_worker_runtime("unknown-role", settings=Settings())


def test_runtime_entrypoints_report_expected_roles() -> None:
    worker_settings = Settings(
        service_role="agent-worker",
        worker_poll_interval_seconds=15,
        worker_batch_size=10,
        agent_actions_enabled=True,
        risk_signals_enabled=True,
        external_sync_enabled=True,
        bridge_insights_enabled=True,
    )

    assert get_agent_summary(worker_settings)["service_role"] == "agent-worker"
    assert get_risk_summary(worker_settings)["service_role"] == "risk-worker"
    assert get_integration_summary(worker_settings)["service_role"] == "integration-worker"
    assert get_bridge_summary(worker_settings)["service_role"] == "bridge-service"
    assert "main-api" in VALID_SERVICE_ROLES
