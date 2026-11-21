#!/usr/bin/env bash
# Run every check, even after one fails, then list every failure and exit 1.
#
# Usage: scripts/ci/run-all.sh "<label>[:<budget seconds>]::<command>" ...
#
# One job, one list: a PR author sees all the lint, format and type errors in
# one run instead of fixing them one push at a time. A check that runs longer
# than its budget is reported; with CI_BUDGETS=enforce it fails like any other
# check (see scripts/ci/budget.sh for why enforcement is a switch).
set -uo pipefail

now() {
  if [ -n "${EPOCHREALTIME:-}" ]; then echo "$EPOCHREALTIME"; else perl -MTime::HiRes=time -e 'printf "%.3f", time'; fi
}

failed=()
over=()
for spec in "$@"; do
  head="${spec%%::*}"
  cmd="${spec#*::}"
  label="${head%%:*}"
  budget=""
  [ "$head" != "$label" ] && budget="${head#*:}"

  echo "::group::${label}"
  start=$(now)
  bash -c "$cmd"
  rc=$?
  end=$(now)
  echo "::endgroup::"
  secs=$(awk -v s="$start" -v e="$end" 'BEGIN { printf "%.1f", e - s }')

  if [ "$rc" -ne 0 ]; then
    echo "::error title=${label} failed::${label} exited ${rc} after ${secs}s"
    failed+=("${label}")
  elif [ -n "$budget" ] && awk -v s="$secs" -v b="$budget" 'BEGIN { exit !(s > b) }'; then
    level=warning
    if [ "${CI_BUDGETS:-}" = "enforce" ]; then level=error; failed+=("${label} (over budget)"); fi
    echo "::${level} title=${label} over budget::${label} took ${secs}s, budget ${budget}s"
    over+=("${label} ${secs}s/${budget}s")
  else
    echo "${label}: ok (${secs}s${budget:+ of ${budget}s})"
  fi
  echo "| ${label} | ${secs} s | ${budget:-–} s | $([ "$rc" -ne 0 ] && echo failed || echo ok) |" >> "${CHECKS_SUMMARY:-/dev/null}"
done

if [ "${#over[@]}" -gt 0 ]; then echo "Over budget: ${over[*]}"; fi
if [ "${#failed[@]}" -gt 0 ]; then
  echo
  echo "Failed: ${failed[*]}"
  exit 1
fi
