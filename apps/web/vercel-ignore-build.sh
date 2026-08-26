#!/usr/bin/env bash
#
# Vercel "Ignored Build Step". Exit 1 to BUILD, exit 0 to SKIP.
#
# Two rules, for two different kinds of waste. Measured over the 30 days to
# 2026-08-26: 547 deployments, 2,449 build minutes, against 257 commits.
#
#   1. Every push to an open PR built a preview, and every merge built
#      production — two builds per change before any of them shipped anything.
#      Preview builds are now opt-in.
#
#   2. Commits that cannot change the site still rebuilt all of it.
#
# A deployment also costs more than its build: Vercel gives each one its own ISR
# cache and does not reuse the previous deployment's, so every production deploy
# makes ~1,790 of 2,070 URLs cold again. See docs/deployment-budget.md.
set -euo pipefail

# ── Rule 1: previews are opt-in ──────────────────────────────────────────────
# Put [preview] in the commit message when a change wants a preview URL.
if [ "${VERCEL_ENV:-}" != "production" ]; then
  if echo "${VERCEL_GIT_COMMIT_MESSAGE:-}" | grep -q '\[preview\]'; then
    echo "preview: [preview] in commit message — building"
    exit 1
  fi
  echo "preview: no [preview] marker — skipping"
  exit 0
fi

# ── Rule 2: skip commits that cannot change the site ─────────────────────────
# Only documentation and markdown. Deliberately narrow: a wrong answer here
# ships nothing, and 'nothing shipped' is invisible until someone looks for a
# change that never arrived.
#
# On a shallow clone HEAD^ may not exist. Build rather than guess.
if ! git rev-parse --verify --quiet HEAD^ >/dev/null; then
  echo "production: no parent commit available — building"
  exit 1
fi

if git diff --quiet HEAD^ HEAD -- . ':(exclude)docs/**' ':(exclude)*.md' ':(exclude)**/*.md'; then
  echo "production: documentation only — skipping"
  exit 0
fi

echo "production: shippable changes — building"
exit 1
