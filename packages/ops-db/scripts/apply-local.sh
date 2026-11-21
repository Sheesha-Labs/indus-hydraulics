#!/usr/bin/env bash
# Apply the Ops schema to a LOCAL Postgres (Docker or CI service container).
#
# Usage: bash packages/ops-db/scripts/apply-local.sh postgresql://postgres:postgres@localhost:54329/postgres
#
#   1. sql/local/public-stub.sql   stand-in Supabase roles + website tables (local only)
#   2. migrations/*.sql            every Ops migration, in ls order
#   3. ALTER ROLE ops_app PASSWORD 'ops_app_local'   so tests can connect as ops_app
#
# Refuses any URL whose host is not localhost / 127.0.0.1 / ::1. Production migrations are
# applied file by file with `prisma db execute` over OPS_DIRECT_URL (migrations/README.md),
# never with this script, and the stub must never reach Supabase.
#
# The password below is a LOCAL-ONLY development credential for a throwaway Docker database.
# It is the only password in this repository, and this script will not send it anywhere but
# localhost. Real ops_app passwords are set out of band and live only in Vercel env.
set -euo pipefail

url="${1:-}"
if [[ -z "$url" ]]; then
  echo "usage: $0 <postgres-url on localhost>" >&2
  exit 2
fi

# Host = what sits between the credentials '@' and the port / path. A libpq `host=` query
# parameter would override it, so that form is refused outright.
if [[ "$url" == *"host="* ]]; then
  echo "refusing: host= query parameters are not allowed (local databases only)" >&2
  exit 1
fi
rest="${url#*://}"
rest="${rest##*@}"
if [[ "$rest" == \[* ]]; then
  host="${rest%%]*}"
  host="${host#[}"
else
  host="${rest%%[:/?]*}"
fi
case "$host" in
  localhost | 127.0.0.1 | ::1) ;;
  *)
    echo "refusing: host '$host' is not local. apply-local.sh only ever runs against localhost." >&2
    exit 1
    ;;
esac

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pkg="$(cd "$here/.." && pwd)"
cd "$pkg"

run_sql() {
  local file="$1"
  echo "→ $file"
  bunx prisma db execute --url "$url" --file "$file" >/dev/null
}

run_sql sql/local/public-stub.sql
for f in $(ls migrations/*.sql); do
  run_sql "$f"
done

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
echo "ALTER ROLE ops_app PASSWORD 'ops_app_local';" >"$tmp"
echo "→ local-only password for ops_app"
bunx prisma db execute --url "$url" --file "$tmp" >/dev/null

echo "Ops schema applied to $host."
