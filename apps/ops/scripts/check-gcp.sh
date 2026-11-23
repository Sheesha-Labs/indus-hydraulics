#!/usr/bin/env bash
# Read-only checks of the Google Cloud setup for Gmail push (S04-T01, docs/gmail-setup.md).
#
#   GMAIL_PUSH_AUDIENCE=https://operations.indushydraulics.com/api/gmail/push bash apps/ops/scripts/check-gcp.sh
#
# Prints PASS or FAIL per line and exits 1 if anything failed. It never writes: only `describe`, `list` and
# `get-iam-policy` calls. Needs gcloud authenticated as someone who can read the project.
set -euo pipefail

PROJECT="${GCP_PROJECT:-indus-operations}"
TOPIC="gmail-push"
DLQ_TOPIC="gmail-push-dlq"
SUBSCRIPTION="gmail-push-ops"
AUDIENCE="${GMAIL_PUSH_AUDIENCE:-https://operations.indushydraulics.com/api/gmail/push}"
GMAIL_PUBLISHER="serviceAccount:gmail-api-push@system.gserviceaccount.com"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() {
  printf 'FAIL  %s\n' "$1"
  failures=$((failures + 1))
}

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is not installed or not on PATH" >&2
  exit 2
fi

if gcloud projects describe "$PROJECT" --format='value(projectId)' >/dev/null 2>&1; then
  pass "project $PROJECT exists"
else
  fail "project $PROJECT exists (or you cannot read it)"
  exit 1
fi

enabled="$(gcloud services list --enabled --project="$PROJECT" --format='value(config.name)' 2>/dev/null || true)"
for api in gmail.googleapis.com pubsub.googleapis.com; do
  if grep -qx "$api" <<<"$enabled"; then pass "API enabled: $api"; else fail "API enabled: $api"; fi
done
for api in drive.googleapis.com calendar-json.googleapis.com people.googleapis.com; do
  if grep -qx "$api" <<<"$enabled"; then fail "API NOT enabled: $api"; else pass "API NOT enabled: $api"; fi
done

if gcloud pubsub topics describe "$TOPIC" --project="$PROJECT" >/dev/null 2>&1; then
  pass "topic $TOPIC exists"
  policy="$(gcloud pubsub topics get-iam-policy "$TOPIC" --project="$PROJECT" \
    --flatten='bindings[].members' --filter='bindings.role:roles/pubsub.publisher' \
    --format='value(bindings.members)' 2>/dev/null || true)"
  if grep -qx "$GMAIL_PUBLISHER" <<<"$policy"; then
    pass "topic $TOPIC: Gmail may publish"
  else
    fail "topic $TOPIC: Gmail may publish (roles/pubsub.publisher for gmail-api-push@system)"
  fi
else
  fail "topic $TOPIC exists"
fi

if gcloud pubsub topics describe "$DLQ_TOPIC" --project="$PROJECT" >/dev/null 2>&1; then
  pass "dead-letter topic $DLQ_TOPIC exists"
else
  fail "dead-letter topic $DLQ_TOPIC exists"
fi

sub="$(gcloud pubsub subscriptions describe "$SUBSCRIPTION" --project="$PROJECT" \
  --format='value(pushConfig.pushEndpoint,pushConfig.oidcToken.audience,deadLetterPolicy.maxDeliveryAttempts,deadLetterPolicy.deadLetterTopic)' \
  2>/dev/null || true)"
if [[ -z "$sub" ]]; then
  fail "subscription $SUBSCRIPTION exists"
else
  IFS=$'\t' read -r endpoint audience attempts dlq <<<"$sub"
  if [[ -n "$endpoint" ]]; then pass "subscription $SUBSCRIPTION is push"; else fail "subscription $SUBSCRIPTION is push"; fi
  if [[ "$audience" == "$AUDIENCE" ]]; then
    pass "subscription $SUBSCRIPTION: OIDC audience matches"
  else
    fail "subscription $SUBSCRIPTION: OIDC audience matches GMAIL_PUSH_AUDIENCE"
  fi
  if [[ "$attempts" == "20" ]]; then
    pass "subscription $SUBSCRIPTION: dead-letter after 20 attempts"
  else
    fail "subscription $SUBSCRIPTION: dead-letter after 20 attempts"
  fi
  if [[ "$dlq" == *"/topics/$DLQ_TOPIC" ]]; then
    pass "subscription $SUBSCRIPTION: dead-letter topic is $DLQ_TOPIC"
  else
    fail "subscription $SUBSCRIPTION: dead-letter topic is $DLQ_TOPIC"
  fi
fi

if [[ "$failures" -gt 0 ]]; then
  echo "$failures check(s) failed" >&2
  exit 1
fi
echo "all checks passed"
