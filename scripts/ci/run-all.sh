#!/usr/bin/env bash
# Run every check, even after one fails, then list every failure and exit 1.
# Usage: scripts/ci/run-all.sh "<label>::<command>" ...
# One job, one list: a PR author sees all the lint, format and type errors in
# one run instead of fixing them one push at a time.
set -uo pipefail

failed=()
for spec in "$@"; do
  label="${spec%%::*}"
  cmd="${spec#*::}"
  echo "::group::${label}"
  start=${EPOCHREALTIME:-$(date +%s)}
  bash -c "$cmd"
  rc=$?
  end=${EPOCHREALTIME:-$(date +%s)}
  echo "::endgroup::"
  secs=$(awk -v s="$start" -v e="$end" 'BEGIN { printf "%.1f", e - s }')
  if [ "$rc" -ne 0 ]; then
    echo "::error title=${label} failed::${label} exited ${rc} after ${secs}s"
    failed+=("${label}")
  else
    echo "${label}: ok (${secs}s)"
  fi
done

if [ "${#failed[@]}" -gt 0 ]; then
  echo
  echo "Failed: ${failed[*]}"
  exit 1
fi
