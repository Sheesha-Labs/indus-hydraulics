#!/usr/bin/env bash
#
# Vercel "Ignored Build Step" for every app in this repository. Exit 1 to BUILD,
# exit 0 to SKIP.
#
#   bash ../../scripts/vercel-ignore-build.sh <workspace package name>
#
# apps/web/vercel.json passes `web`, apps/ops/vercel.json passes `@indus/ops`.
#
# Three rules, for three kinds of waste. Measured over the 30 days to 2026-08-26:
# 547 deployments, 2,449 build minutes, against 257 commits.
#
#   1. Every push to an open PR built a preview, and every merge built
#      production — two builds per change before any of them shipped anything.
#      Preview builds are now opt-in.
#
#   2. Commits that cannot change the site still rebuilt all of it.
#
#   3. Two apps share this repository (ADR-02). An Indus Operations change must
#      never rebuild the storefront, and a storefront change must never rebuild
#      Operations: an app builds only when the commit touches it or a workspace
#      package it depends on (scripts/affected-workspaces.mjs).
#
# A deployment also costs more than its build: Vercel gives each one its own ISR
# cache and does not reuse the previous deployment's, so every production deploy
# makes ~1,790 of 2,070 URLs cold again. See docs/deployment-budget.md.
set -euo pipefail

APP="${1:?usage: vercel-ignore-build.sh <workspace package name>}"

# Vercel runs the Ignored Build Step from the project's Root Directory
# (`apps/web`, `apps/ops`) — that is where each vercel.json lives.
#
# The rules compare paths across the WHOLE repository, so resolve to the repo
# root before doing anything. Without this, `.` in the pathspec below means the
# app folder, and a commit touching only `packages/domain` or `packages/db`
# shows no changes at all — which this script would read as "documentation
# only" and skip a production deploy that ships real code. That failure is
# silent: the check passes, the merge goes green, and the change simply never
# reaches the site.
cd "$(git rev-parse --show-toplevel)"

# ── Rule 1: previews are opt-in ──────────────────────────────────────────────
# Put [preview] in the commit message when a change wants a preview URL. A
# [preview] commit still goes through rule 3, so it previews only the apps it
# affects.
if [ "${VERCEL_ENV:-}" != "production" ]; then
  if ! echo "${VERCEL_GIT_COMMIT_MESSAGE:-}" | grep -q '\[preview\]'; then
    echo "preview: no [preview] marker — skipping"
    exit 0
  fi
fi

# On a shallow clone HEAD^ may not exist. Build rather than guess.
if ! git rev-parse --verify --quiet HEAD^ >/dev/null; then
  echo "${APP}: no parent commit available — building"
  exit 1
fi

# ── Rule 3: only the apps the commit affects ─────────────────────────────────
# Plain Node, because nothing is installed yet when Vercel runs this step. Any
# failure, or ALL, means build.
if ! affected="$(node scripts/affected-workspaces.mjs HEAD^ HEAD)"; then
  echo "${APP}: could not work out the affected workspaces — building"
  exit 1
fi
if [ "$affected" != "ALL" ] && ! printf '%s\n' "$affected" | grep -qxF -- "$APP"; then
  echo "${APP}: not affected by this commit — skipping"
  exit 0
fi

if [ "${VERCEL_ENV:-}" != "production" ]; then
  echo "preview: [preview] in commit message and ${APP} affected — building"
  exit 1
fi

# ── Rule 2: skip commits that cannot change the site ─────────────────────────
# Documentation, markdown, and import payloads under packages/db/data/.
# Deliberately narrow: a wrong answer here ships nothing, and 'nothing shipped'
# is invisible until someone looks for a change that never arrived.
#
# packages/db/data/ holds catalogue payloads that import scripts write to the
# database from a developer machine. The app never reads them — the rows are
# already live by the time the PR merges ("— already applied"). Building for
# them is not just waste: on 2026-10-10 twelve payload-only PRs merged in one
# sitting started twelve concurrent production builds, their prerender pools
# exhausted Supavisor's 200-client cap, and the live site served
# `(EMAXCONN) max client connections reached` 500s on /c-filter and /c.
# A commit that also touches code under packages/db/src still builds.
if git diff --quiet HEAD^ HEAD -- . ':(exclude)docs/' ':(exclude)*.md' ':(exclude)**/*.md' \
  ':(exclude)packages/db/data/'; then
  echo "production: documentation or import payloads only — skipping"
  exit 0
fi

echo "production: ${APP} affected — building"
exit 1
