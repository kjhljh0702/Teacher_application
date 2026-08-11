#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

docker run --rm \
  --user postgres \
  -e HOME=/tmp \
  -v "$ROOT:/work:ro" \
  postgres:17-alpine \
  sh -ec '
    initdb -D /tmp/pgdata >/dev/null
    pg_ctl -D /tmp/pgdata -o "-c listen_addresses=" -w start >/dev/null
    trap "pg_ctl -D /tmp/pgdata -m fast -w stop >/dev/null" EXIT
    psql -v ON_ERROR_STOP=1 -d postgres -f /work/tests/postgres-bootstrap.sql >/dev/null
    psql -v ON_ERROR_STOP=1 -d postgres -f /work/supabase/schema.sql >/dev/null
    psql -v ON_ERROR_STOP=1 -d postgres -f /work/supabase/schema.sql >/dev/null
    psql -v ON_ERROR_STOP=1 -d postgres -f /work/tests/security-policy.sql
  '
