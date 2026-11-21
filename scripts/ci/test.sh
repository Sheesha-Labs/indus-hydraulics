#!/usr/bin/env bash
# Run the unit tests. On a pull request with selection switched on, run only the
# tests the diff can reach; everywhere else (main, the merge queue, a manual
# run, selection off) run every test.
#
# Selection only narrows the feedback a PR gets. The full suite still runs in
# the merge queue before anything reaches main, which is why selection is
# switched on by the repository variable TEST_SELECTION=on only once the merge
# queue is enabled.
#
#   scripts/ci/test.sh            full run, or selected run on a PR
#   scripts/ci/test.sh --explain  print what would run and why, run nothing
set -euo pipefail

FLAGS=(--parallel --isolate=modules --randomize)
ROOTS=(./apps/web/src ./apps/ops/src ./packages)
TEST_GLOBS=('apps/web/src/**/*.test.ts' 'apps/web/src/**/*.test.tsx' 'apps/ops/src/**/*.test.ts' 'apps/ops/src/**/*.test.tsx' 'packages/*/src/**/*.test.ts' 'packages/*/src/**/*.test.tsx')

# A change to any of these can change the result of any test, so it reruns
# everything: the toolchain and its config, dependencies, TypeScript config and
# shared types, the test preload, CI itself.
FULL_RUN_INPUTS='^(bun\.lock|bunfig\.toml|package\.json|tsconfig\.base\.json|\.oxlintrc\.json|\.prettierrc|types/|\.github/|scripts/ci/|apps/web/bunfig\.toml|apps/web/tsconfig\.json|apps/web/package\.json|apps/web/src/test/|apps/ops/(bunfig\.toml|tsconfig\.json|package\.json)|apps/ops/src/test/|packages/[^/]+/package\.json|packages/[^/]+/tsconfig\.json|packages/db/prisma/)'

# bun test --changed follows the import graph. A test that reads files from
# disk, spawns a process or imports by computed path depends on files it never
# imports, so it is always run. Detected from the source, not listed by hand,
# so a new test of that kind is covered the day it lands.
ALWAYS_RUN_PATTERN="from '(node:)?fs(/promises)?'|from \"(node:)?fs|require\('(node:)?fs|child_process|await import\(|import\.meta\.glob|readFileSync|readdirSync"

explain=false
[ "${1:-}" = "--explain" ] && explain=true

mode=full
reason="not a pull request with selection on"
if [ "${TEST_SELECTION:-}" = "on" ] && [ "${GITHUB_EVENT_NAME:-}" = "pull_request" ]; then
  # actions/checkout puts a PR on its merge commit; the first parent is the
  # tip of the base branch, so this diff is exactly what merging would add.
  base="$(git rev-parse HEAD^1)"
  changed="$(git diff --name-only "$base" HEAD)"
  if trigger="$(grep -E "$FULL_RUN_INPUTS" <<<"$changed" | head -1)" && [ -n "$trigger" ]; then
    reason="$trigger changed, which reruns everything"
  else
    mode=select
    reason="selected from $(wc -l <<<"$changed" | tr -d ' ') changed files"
  fi
fi

echo "test mode: $mode ($reason)"

if [ "$mode" = full ]; then
  $explain && exit 0
  exec bun test "${FLAGS[@]}" "${ROOTS[@]}"
fi

always=()
while IFS= read -r f; do always+=("$f"); done < <(git grep -lE "$ALWAYS_RUN_PATTERN" -- "${TEST_GLOBS[@]}" || true)
echo "always run (read files, spawn or import dynamically): ${#always[@]} files"
if $explain; then
  printf '  %s\n' "${always[@]}"
  exit 0
fi

# Two passes: what the diff reaches through imports, then the always-run set.
# A file in both runs twice, which costs a little time and hides nothing.
bun test "${FLAGS[@]}" --changed="$base" "${ROOTS[@]}"
if [ "${#always[@]}" -gt 0 ]; then
  bun test "${FLAGS[@]}" "${always[@]/#/./}"
fi
