from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

ServiceRole = Literal[
    "main-api",
    "agent-worker",
    "risk-worker",
    "integration-worker",
    "bridge-service",
]


class Settings(BaseSettings):
    app_name: str = "영업관리시스템"
    app_env: str = "local"
    service_role: ServiceRole = "main-api"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./.local/sales_management.db"
    dev_token_secret: str = "local-dev-token-secret-change-me"
    integration_api_key: str = "local-integration-key"
    access_token_expire_minutes: int = 60 * 8
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_use_tls: bool = True
    worker_poll_interval_seconds: int = 30
    worker_batch_size: int = 50
    agent_actions_enabled: bool = False
    risk_signals_enabled: bool = False
    external_sync_enabled: bool = False
    bridge_insights_enabled: bool = False
    slack_bot_token: str | None = None
    slack_default_channel: str | None = None
    google_oauth_client_id: str | None = None
    google_oauth_client_secret: str | None = None
    google_oauth_redirect_uri: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_worker_role(self) -> bool:
        return self.service_role != "main-api"

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env", "../.env.local", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
