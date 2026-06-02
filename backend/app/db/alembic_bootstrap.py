from app.core.config import get_settings
from sqlalchemy import create_engine, text


def prepare_alembic_version_table() -> None:
    database_url = get_settings().database_url
    if not database_url.startswith("postgresql"):
        return

    engine = create_engine(database_url)
    statements = [
        "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(128) PRIMARY KEY)",
        "ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(128)",
    ]
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
