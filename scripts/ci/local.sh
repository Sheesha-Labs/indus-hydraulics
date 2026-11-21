#!/usr/bin/env bash
# What CI checks, run locally: the pre-push hook (hk.pkl) and anyone who wants
# CI's answer before pushing. Same commands, same order, every failure listed.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
exec scripts/ci/run-all.sh \
  "typecheck::bun run typecheck" \
  "lint::bun run lint" \
  "format::bun run format:check" \
  "test::bun run test"
