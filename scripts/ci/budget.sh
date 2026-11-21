#!/usr/bin/env bash
# Hold a CI job to its time budget. Runs as the job's last step, reads the job's
# own timings from the GitHub API and fails the job if any bucket is over:
#
#   waiting  run created -> job started          budget 5 s
#   setup    every step before the first work step  budget 15 s
#   job      run created -> this step             budget 35 s (the slowest job)
#
# Work-step budgets (lint 1 s, format 1 s, typecheck 5 s) are enforced by
# scripts/ci/run-all.sh; the test budget (30 s) here, on the Test step.
#
# CI_BUDGETS=enforce fails the job; anything else reports the same numbers as
# warnings. Budgets are enforced once the runners can meet them: on GitHub's
# hosted 4-vCPU runners the type-aware lint alone takes about 4.5 s.
#
# Usage: scripts/ci/budget.sh <job name> <first work step name>
set -euo pipefail

job_name="$1"
first_work_step="$2"
WAIT_BUDGET=5
SETUP_BUDGET=15
JOB_BUDGET=35
TEST_BUDGET=30

json="$(gh api "repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/attempts/${GITHUB_RUN_ATTEMPT:-1}/jobs?per_page=100")"
run_created="$(gh api "repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}" --jq '.run_started_at')"

report="$(JOB="$job_name" FIRST="$first_work_step" RUN_CREATED="$run_created" \
  WAIT_BUDGET="$WAIT_BUDGET" SETUP_BUDGET="$SETUP_BUDGET" JOB_BUDGET="$JOB_BUDGET" TEST_BUDGET="$TEST_BUDGET" \
  node -e '
const jobs = JSON.parse(require("fs").readFileSync(0, "utf8")).jobs
const job = jobs.find((j) => j.name === process.env.JOB)
if (!job) { console.log(`over job: "${process.env.JOB}" not found in this run`); process.exit(0) }
const t = (s) => Date.parse(s) / 1000
const now = Date.now() / 1000
const runCreated = t(process.env.RUN_CREATED)
const wait = t(job.started_at) - runCreated
let setup = 0, test = null, inSetup = true
for (const s of job.steps) {
  if (!s.started_at || !s.completed_at) continue
  if (s.name === process.env.FIRST) inSetup = false
  const d = t(s.completed_at) - t(s.started_at)
  if (inSetup && s.name !== "Set up job") setup += d
  if (s.name === "Test") test = d
}
const total = now - runCreated
const lines = []
const check = (label, value, budget) =>
  lines.push(`${value > budget ? "over" : "ok"} ${label}: ${value.toFixed(1)} s (budget ${budget} s)`)
check("waiting", wait, +process.env.WAIT_BUDGET)
check("setup", setup, +process.env.SETUP_BUDGET)
if (test !== null) check("test", test, +process.env.TEST_BUDGET)
check("job", total, +process.env.JOB_BUDGET)
console.log(lines.join("\n"))
' <<<"$json")"

echo "$report"
{
  echo "### Time budget: ${job_name}"
  echo '```'
  echo "$report"
  echo '```'
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

if grep -q '^over' <<<"$report"; then
  if [ "${CI_BUDGETS:-}" = "enforce" ]; then
    grep '^over' <<<"$report" | sed 's/^/::error title=Over budget::/'
    exit 1
  fi
  grep '^over' <<<"$report" | sed 's/^/::warning title=Over budget::/'
fi
