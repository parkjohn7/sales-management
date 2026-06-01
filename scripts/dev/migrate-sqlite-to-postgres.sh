#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQLITE_DB="${1:-$ROOT_DIR/backend/.local/sales_management.db}"
PG_DB="${PG_DB:-sales_management}"
PG_USER="${PG_USER:-sales}"

if [ ! -f "$SQLITE_DB" ]; then
  echo "SQLite DB not found: $SQLITE_DB"
  exit 1
fi

echo "Using SQLite source: $SQLITE_DB"
echo "Starting postgres container..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres >/dev/null

echo "Applying alembic migrations to PostgreSQL..."
(
  cd "$ROOT_DIR/backend"
  DATABASE_URL="postgresql+psycopg://$PG_USER:sales@localhost:5432/$PG_DB" .venv/bin/alembic upgrade head
)

TABLES="$(
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
    psql -U "$PG_USER" -d "$PG_DB" -At \
    -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'alembic_version' ORDER BY tablename;"
)"

echo "Truncating target tables..."
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
  psql -U "$PG_USER" -d "$PG_DB" \
  -c "SET session_replication_role = replica; DO \$\$ DECLARE r record; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'alembic_version') LOOP EXECUTE format('TRUNCATE TABLE %I CASCADE', r.tablename); END LOOP; END \$\$; SET session_replication_role = origin;" >/dev/null

for table in $TABLES; do
  SQLITE_COLS_RAW="$(sqlite3 "$SQLITE_DB" "PRAGMA table_info($table);" 2>/dev/null | cut -d'|' -f2 || true)"
  if [ -z "$SQLITE_COLS_RAW" ]; then
    continue
  fi

  PG_COLS_RAW="$(
    docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
      psql -U "$PG_USER" -d "$PG_DB" -At \
      -c "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='$table' ORDER BY ordinal_position;"
  )"

  COLS=""
  while IFS= read -r pg_col; do
    if echo "$SQLITE_COLS_RAW" | grep -Fxq "$pg_col"; then
      if [ -z "$COLS" ]; then
        COLS="\"$pg_col\""
      else
        COLS="$COLS,\"$pg_col\""
      fi
    fi
  done <<< "$PG_COLS_RAW"

  if [ -z "$COLS" ]; then
    continue
  fi

  echo "Migrating table: $table"
  sqlite3 "$SQLITE_DB" -csv -header "SELECT $COLS FROM \"$table\";" \
    | docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
      psql -U "$PG_USER" -d "$PG_DB" \
      -c "\\copy \"$table\"($COLS) FROM STDIN WITH (FORMAT csv, HEADER true)"
done

echo "Migration complete."
