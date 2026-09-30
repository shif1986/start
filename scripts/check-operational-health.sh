#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_FILE="$PROJECT_ROOT/backend/supabase/scripts/check_operational_health.sql"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL est requis." >&2
  exit 2
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql est requis pour le contrôle opérationnel." >&2
  exit 2
fi

result="$(psql "$SUPABASE_DB_URL" \
  --no-psqlrc \
  --set ON_ERROR_STOP=1 \
  --tuples-only \
  --no-align \
  --field-separator '|' \
  --file "$SQL_FILE")"

printf '%s\n' "$result"

if grep -q '|ALERTE$' <<< "$result"; then
  echo "Une ou plusieurs alertes opérationnelles sont actives." >&2
  exit 1
fi

echo "Contrôle opérationnel réussi."
