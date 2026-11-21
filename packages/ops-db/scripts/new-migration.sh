#!/usr/bin/env bash
# Print the path for a new Ops migration file:
#
#   packages/ops-db/migrations/<YYYYMMDDHHMM>_ops_<snake_name>.sql
#
# Usage: bash packages/ops-db/scripts/new-migration.sh add_the_thing
#
# The prefix is `date +%Y%m%d%H%M` (local time, the same rule as
# packages/db/migrations). If that 12-digit prefix is already taken in EITHER
# packages/ops-db/migrations or packages/db/migrations, the stamp moves forward
# one minute at a time until it is free, so two files written in the same
# minute still sort in the order they were authored and never collide across
# the two folders (src/migration-filenames.test.ts enforces both rules).
#
# The script only prints the path. It creates nothing.
set -euo pipefail

name="${1:-}"
if [[ ! "$name" =~ ^[a-z0-9]+(_[a-z0-9]+)*$ ]]; then
  echo "usage: $0 <snake_case_name>   (lowercase letters, digits and single underscores)" >&2
  exit 2
fi
if [[ "$name" == ops_* ]]; then
  echo "do not include the ops_ prefix; the script adds it" >&2
  exit 2
fi

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pkg="$(cd "$here/.." && pwd)"
repo="$(cd "$pkg/../.." && pwd)"
ops_dir="$pkg/migrations"
web_dir="$repo/packages/db/migrations"

# Next minute after a 12-digit stamp, on BSD (macOS) or GNU date.
next_minute() {
  local stamp="$1"
  if date -j -f '%Y%m%d%H%M' "$stamp" '+%Y%m%d%H%M' >/dev/null 2>&1; then
    date -j -v+1M -f '%Y%m%d%H%M' "$stamp" '+%Y%m%d%H%M'
  else
    local iso="${stamp:0:4}-${stamp:4:2}-${stamp:6:2} ${stamp:8:2}:${stamp:10:2}"
    date -d "$iso + 1 min" '+%Y%m%d%H%M'
  fi
}

taken() {
  local stamp="$1" dir f
  for dir in "$ops_dir" "$web_dir"; do
    [[ -d "$dir" ]] || continue
    for f in "$dir/${stamp}"_*.sql; do
      [[ -e "$f" ]] && return 0
    done
  done
  return 1
}

stamp="$(date +%Y%m%d%H%M)"
# Never go backwards past the newest Ops file either: a clock behind the last
# file would otherwise sort the new migration before one already written.
latest="$(find "$ops_dir" -maxdepth 1 -name '[0-9]*_ops_*.sql' -exec basename {} \; 2>/dev/null | sort | tail -1 | cut -c1-12 || true)"
if [[ -n "$latest" && "$stamp" < "$latest" ]]; then
  stamp="$latest"
fi
while taken "$stamp"; do
  stamp="$(next_minute "$stamp")"
done

echo "packages/ops-db/migrations/${stamp}_ops_${name}.sql"
