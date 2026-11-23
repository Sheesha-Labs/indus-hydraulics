# Gmail and Pub/Sub setup (S04-T01)

A runbook a person follows once, in the Google consoles, before mailboxes are connected in production. It
holds no secrets, client ids or project numbers: every value below is a placeholder or a public name.
Architecture: `10-architecture.md` ADR-04, ADR-06, ADR-22; integrations map `08-map-integrations.md` §1.1–1.4,
§1.12, §9.1. Read-only check afterwards: `bash apps/ops/scripts/check-gcp.sh` (kept inside `apps/ops` so it never marks the storefront as affected).

What already exists from S00 (do not recreate): the GCP project `indus-operations` inside the Workspace
organisation, the Internal consent screen, the Web OAuth client used for sign-in, and its Trusted status in the
Workspace admin console. S04 adds the mailbox-connect redirects, Pub/Sub, the push subscription and its alerting.

## a. Project inside the Workspace organisation

The project is `indus-operations`, created **inside the `indushydraulics.me` Workspace organisation** (not under
a personal account). Why: Google offers the **Internal** user type only to projects that belong to the Workspace
organisation. An Internal app can request `gmail.modify` without restricted-scope verification and without the
annual CASA security assessment, because only `@indushydraulics.me` accounts can grant consent. A project under a
personal account can only be External, which brings both.

```bash
ORG_ID=$(gcloud organizations list --filter="displayName:indushydraulics.me" --format='value(ID)')
gcloud projects create indus-operations --organization="$ORG_ID"     # S00 did this; skip if it exists
gcloud config set project indus-operations
```

## b. APIs: Gmail and Pub/Sub only

```bash
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

Drive, Calendar and People stay **disabled**. That is what backs the board 86 promise "Will never read Drive,
Calendar or Contacts": even a leaked token could not call them. `check-gcp.sh` fails if any of the three is on.

## c. OAuth consent screen

- User type **Internal**; app name **Indus Operations**; support email sales@.
- Authorised domains: `indushydraulics.com` (the redirect host) and `indushydraulics.me` (the accounts).
- Internal apps need no scopes listed on the screen. The mailbox flow asks at runtime for `gmail.modify`,
  `gmail.labels`, `gmail.send`, `openid` and `email`; nothing else (no `https://mail.google.com/`, no settings
  scopes, no Drive, Calendar or Contacts).

## d. One Web OAuth client, four redirects

Google Cloud console › APIs & Services › Credentials › the existing Web client (from S00) › Authorised redirect
URIs. Add only the two mailbox redirects if the sign-in ones are already there:

```
https://operations.indushydraulics.com/api/auth/callback/google     (sign-in, S00/S03)
https://operations.indushydraulics.com/api/gmail/oauth/callback     (mailbox connect, S04)
http://localhost:3100/api/auth/callback/google
http://localhost:3100/api/gmail/oauth/callback
```

The same client serves both flows; the two token families stay apart: sign-in stores no Google token, the
mailbox flow stores only an encrypted refresh token per mailbox (ADR-06).

## e. Pub/Sub: topic, dead-letter topic, invoker account, push subscription

```bash
gcloud pubsub topics create gmail-push
gcloud pubsub topics add-iam-policy-binding gmail-push \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com --role=roles/pubsub.publisher
gcloud pubsub topics create gmail-push-dlq
gcloud iam service-accounts create gmail-push-invoker --display-name="Gmail push invoker"
PN=$(gcloud projects describe indus-operations --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding gmail-push-invoker@indus-operations.iam.gserviceaccount.com \
  --member=serviceAccount:service-$PN@gcp-sa-pubsub.iam.gserviceaccount.com --role=roles/iam.serviceAccountTokenCreator
gcloud pubsub subscriptions create gmail-push-ops --topic=gmail-push \
  --push-endpoint=https://operations.indushydraulics.com/api/gmail/push \
  --push-auth-service-account=gmail-push-invoker@indus-operations.iam.gserviceaccount.com \
  --push-auth-token-audience=https://operations.indushydraulics.com/api/gmail/push \
  --ack-deadline=20 --message-retention-duration=7d --min-retry-delay=10s --max-retry-delay=600s \
  --dead-letter-topic=gmail-push-dlq --max-delivery-attempts=20
gcloud pubsub topics add-iam-policy-binding gmail-push-dlq \
  --member=serviceAccount:service-$PN@gcp-sa-pubsub.iam.gserviceaccount.com --role=roles/pubsub.publisher
gcloud pubsub subscriptions add-iam-policy-binding gmail-push-ops \
  --member=serviceAccount:service-$PN@gcp-sa-pubsub.iam.gserviceaccount.com --role=roles/pubsub.subscriber
gcloud pubsub subscriptions create gmail-push-dlq-sub --topic=gmail-push-dlq
```

- If the organisation enforces **domain-restricted sharing** (`constraints/iam.allowedPolicyMemberDomains`), the
  first binding fails. Add the exception Google documents for `gmail-api-push@system.gserviceaccount.com` on this
  project (an organisation policy override at project level), then repeat the binding.
- The push endpoint verifies the OIDC token (issuer Google, audience as above, email
  `gmail-push-invoker@…`, `email_verified`) and forwards `{emailAddress, historyId}` as one Inngest event. It
  never touches the database (ADR-04).
- Vercel (project `indus-operations`, Production): `GMAIL_PUBSUB_TOPIC=projects/indus-operations/topics/gmail-push`,
  `GMAIL_PUSH_AUDIENCE=https://operations.indushydraulics.com/api/gmail/push`,
  `GMAIL_PUSH_SA_EMAIL=gmail-push-invoker@indus-operations.iam.gserviceaccount.com`. Preview gets none of them.

## f. Dead-letter monitoring

Cloud Monitoring › Alerting › Create policy: metric `pubsub.googleapis.com/subscription/num_undelivered_messages`
on subscription `gmail-push-dlq-sub`, condition `> 0` for 5 minutes, notification channel email purchase@.

**Decision (S04-T01):** Ops holds **no GCP service-account key**, so it cannot read the dead-letter count itself.
`mailbox_sync_state.dlqCount` stays `null` (the card shows nothing for it) unless a read-only key is added later.
Missed notifications are still caught: the 10-minute safety poll syncs any live mailbox with no successful sync in
10 minutes, and the health job marks it "Behind" after 30.

## g. Workspace admin: trust the client

Admin console › Security › Access and data control › API controls › Manage third-party app access › Add app ›
OAuth app name or client ID › paste the client ID › **Trusted**. S00 did this for the sign-in client; it is the
same client, so nothing new is needed unless the client was recreated.

This is the fix for the board 86 error state **"Blocked by Workspace admin"**: the copyable instructions in the
connect flow (`src/lib/gmail-connect-copy.ts`) say exactly this.

## h. Password changes and disconnects

- Changing a mailbox account's password makes Google revoke every Gmail-scoped token for it. Ops sees
  `invalid_grant` on the next refresh: the mailbox becomes **Disconnected**, sends from it wait ("Waiting for
  sales@") and never switch mailbox, and Today, Review and Mail show the disconnected banner (board 89).
- Fix: Settings › Mailboxes › Reconnect. Sync resumes from the stored history position; if that is too old for
  Google, a bounded resync reads only what is missing. Nothing is read twice.
- Removing the app from Trusted, or suspending the account, has the same effect and the same fix.

## h2. Health and Sentry alerts (S04-T09)

`ops.gmail.health` runs every 5 minutes against the database only (no Gmail call) and sets each mailbox's
state: **Live** (a successful sync within 15 minutes, watch not expired), **Behind** (no successful sync for 30
minutes, a watch error, a watch expiring within 24 hours, or dead letters when known), **Limit reached** (sends
held for the daily cap), **Backfill paused**. Disconnected, Paused, Connecting and Resyncing are left to their own
paths. Between 15 and 30 minutes nothing flips.

Sentry (project `indus-operations`), tag `job: gmail.health`, tag `mailbox: sales@ | purchase@`:

| Message | When | Suggested alert rule |
|---|---|---|
| `Gmail watch renewal failed` | any hour, while `mailbox_sync_state.watchError` is set | first seen + every 1 h while it repeats, email the Owner |
| `No Gmail sync for 30 minutes` | desk hours only (UAE working day, 08:00–19:00 GST) | 3 events in 15 minutes, email the Owner |
| `Gmail mailbox access lost` | Google refused the token (`invalid_grant` or a 401) | every event, email the Owner (the in-app notification is locked on) |
| `ops_app connections above the alert line` | `/api/health` saw more than 12 ops_app connections | every event, email the Owner (ADR-04: the pooler is shared with the storefront) |

`/api/health` (signed in) also lists every mailbox's status, last successful sync, lag and watch expiry, and the
send queue (`scheduled`, `held`, `waitingForMailbox`, `unknown`). `/api/health/live` touches nothing.

## i. Decisions to record (fill in, date, initials)

| Decision | Value | Date | By |
|---|---|---|---|
| Inngest plan: concurrency cap per function or account-wide? | | | |
| If account-wide: plan upgraded before mail goes live? (ADR-22 S04 gate) | | | |
| Dedicated test mailbox seat (`ops-test@`), or only the internal allow-list (`OPS_SEND_ALLOWLIST`)? | | | |
| DLQ alert policy created and notifying purchase@ | | | |
