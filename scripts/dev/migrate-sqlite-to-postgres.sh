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

echo "Preparing alembic_version table for long revision ids..."
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
  psql -U "$PG_USER" -d "$PG_DB" \
  -c "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(128) PRIMARY KEY);" >/dev/null
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
  psql -U "$PG_USER" -d "$PG_DB" \
  -c "ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(128);" >/dev/null

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

ORDERED_TABLES=(
  roles
  users
  leads
  accounts
  contacts
  opportunities
  activities
  stage_histories
  audit_logs
  admin_settings
)

echo "Truncating target tables..."
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
  psql -U "$PG_USER" -d "$PG_DB" \
  -c "SET session_replication_role = replica; DO \$\$ DECLARE r record; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'alembic_version') LOOP EXECUTE format('TRUNCATE TABLE %I CASCADE', r.tablename); END LOOP; END \$\$; SET session_replication_role = origin;" >/dev/null

build_sqlite_select() {
  local table="$1"
  local cols="$2"
  local select_expr=""
  local where_clause=""
  IFS=',' read -r -a col_items <<< "$cols"
  for col_item in "${col_items[@]}"; do
    local col="${col_item//\"/}"
    local expr="\"$col\""

    if [ "$table" = "contacts" ] && [ "$col" = "account_id" ]; then
      where_clause=" WHERE EXISTS (SELECT 1 FROM accounts a WHERE a.id = contacts.account_id)"
    fi
    if [ "$table" = "opportunities" ]; then
      if [ "$col" = "contact_id" ]; then
        expr="CASE WHEN \"contact_id\" IS NULL OR EXISTS (SELECT 1 FROM contacts c WHERE c.id = opportunities.contact_id) THEN \"contact_id\" ELSE NULL END AS \"contact_id\""
      elif [ "$col" = "lead_id" ]; then
        expr="CASE WHEN \"lead_id\" IS NULL OR EXISTS (SELECT 1 FROM leads l WHERE l.id = opportunities.lead_id) THEN \"lead_id\" ELSE NULL END AS \"lead_id\""
      elif [ "$col" = "account_id" ]; then
        where_clause=" WHERE EXISTS (SELECT 1 FROM accounts a WHERE a.id = opportunities.account_id)"
      fi
    fi
    if [ "$table" = "activities" ]; then
      if [ "$col" = "lead_id" ]; then
        expr="CASE WHEN \"lead_id\" IS NULL OR EXISTS (SELECT 1 FROM leads l WHERE l.id = activities.lead_id) THEN \"lead_id\" ELSE NULL END AS \"lead_id\""
      elif [ "$col" = "opportunity_id" ]; then
        expr="CASE WHEN \"opportunity_id\" IS NULL OR EXISTS (SELECT 1 FROM opportunities o WHERE o.id = activities.opportunity_id) THEN \"opportunity_id\" ELSE NULL END AS \"opportunity_id\""
      fi
    fi
    if [ "$table" = "stage_histories" ] && [ "$col" = "opportunity_id" ]; then
      where_clause=" WHERE EXISTS (SELECT 1 FROM opportunities o WHERE o.id = stage_histories.opportunity_id)"
    fi

    if [ -z "$select_expr" ]; then
      select_expr="$expr"
    else
      select_expr="$select_expr,$expr"
    fi
  done
  echo "SELECT $select_expr FROM \"$table\"$where_clause;"
}

migrate_table() {
  local table="$1"
  SQLITE_COLS_RAW="$(sqlite3 "$SQLITE_DB" "PRAGMA table_info($table);" 2>/dev/null | cut -d'|' -f2 || true)"
  if [ -z "$SQLITE_COLS_RAW" ]; then
    return 0
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
    return 0
  fi

  SQLITE_SELECT="$(build_sqlite_select "$table" "$COLS")"
  echo "Migrating table: $table"
  sqlite3 "$SQLITE_DB" -csv -header "$SQLITE_SELECT" \
    | docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
      psql -U "$PG_USER" -d "$PG_DB" \
      -c "\\copy \"$table\"($COLS) FROM STDIN WITH (FORMAT csv, HEADER true)"
}

for table in "${ORDERED_TABLES[@]}"; do
  if ! echo "$TABLES" | grep -Fxq "$table"; then
    continue
  fi
  migrate_table "$table"
done

for table in $TABLES; do
  if printf '%s\n' "${ORDERED_TABLES[@]}" | grep -Fxq "$table"; then
    continue
  fi
  migrate_table "$table"
done

echo "Migration complete."
