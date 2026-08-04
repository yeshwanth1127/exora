#!/usr/bin/env bash
# Apply all Exora base migrations to PostgreSQL in one run.
# Safe to re-run: underlying SQL uses IF NOT EXISTS / idempotent alters where applicable.
#
# Usage:
#   ./apply_all_migrations.sh
#   DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/exora-web ./apply_all_migrations.sh
#   PGDATABASE=exora-web PGUSER=postgres ./apply_all_migrations.sh
#
# Optional — CRM tables (same DB must already have public.users from step above):
#   INCLUDE_CRM_SCHEMA=1 ./apply_all_migrations.sh
#   (Only enable if your app expects crm_* tables on this database; separate exora-crm
#    setups may need a different schema — create_crm_schema.sql FK-references users.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_MASTER="${SCRIPT_DIR}/apply_all_migrations.sql"

if [[ ! -f "$SQL_MASTER" ]]; then
  echo "error: missing $SQL_MASTER" >&2
  exit 1
fi

run_psql() {
  if [[ -n "${DATABASE_URL:-}" ]]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 "$@"
  else
    psql -v ON_ERROR_STOP=1 "$@"
  fi
}

echo "Applying migrations from: $SCRIPT_DIR"
run_psql -f "$SQL_MASTER"

if [[ "${INCLUDE_CRM_SCHEMA:-0}" == "1" ]]; then
  echo ""
  echo ">>> Optional: create_crm_schema.sql (INCLUDE_CRM_SCHEMA=1)"
  run_psql -f "${SCRIPT_DIR}/create_crm_schema.sql"
  echo ">>> CRM schema applied."
fi

echo ""
echo "Done. Optional verification:"
echo "  psql ... -f ${SCRIPT_DIR}/verify_schema.sql"
