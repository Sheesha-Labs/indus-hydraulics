# Inngest setup

Inngest runs the background jobs and cron schedules for this app.

> **Status as of 2026-09-01: NOT CONNECTED.** No keys are set, so nothing below
> is running in production. See *How to tell whether it is actually on* before
> assuming otherwise.

## Read this first: the failure mode

**The SDK is safe to deploy without keys — and that is exactly what makes it
dangerous.** Without `INNGEST_EVENT_KEY` it initialises normally, cron functions
never fire, and **`inngest.send()` silently succeeds while doing nothing.** No
error, no warning, no log line.

This has already cost real debugging time. The supplier-research feature created
a `ResearchRun` row, fired an event into the void, and left the run `queued`
forever — and its own "already running" guard then disabled the button
permanently. The button looked broken; the actual cause was three layers away.

**If you write a feature that depends on a background job, check for the key
explicitly and provide a path that works without it.** `startSupplierResearch`
in `apps/web/src/app/admin/(shell)/enquiries/actions.ts` is the reference:

```ts
const hasBackgroundJobs = Boolean(process.env.INNGEST_EVENT_KEY)
if (hasBackgroundJobs) { await inngest.send(...) } else { await runInline() }
```

## How to tell whether it is actually on

Fastest check, no dashboard needed — query the table a cron job writes to:

```sql
SELECT count(*), max("computedAt") FROM seo_health_scores;
```

`seo.health.recompute_all` runs nightly at 04:00 UTC. **If that table is empty,
Inngest has never run.** That single query is how the outage above was found.

## What is already done in code

| File | Purpose |
|---|---|
| `apps/web/src/inngest/client.ts` | Client singleton (`id: 'indus-hydraulics-admin'`) |
| `apps/web/src/inngest/functions.ts` | Cron functions + the `allFunctions` registry |
| `apps/web/src/inngest/*.ts` | One file per event-driven job |
| `apps/web/src/app/api/inngest/route.ts` | The endpoint Inngest calls into (`maxDuration = 300`) |
| `turbo.json` `globalEnv` | Already whitelists both keys — no change needed |

### Functions registered (10)

| Function ID | Trigger | What it does |
|---|---|---|
| `seo.health.recompute_all` | cron `0 4 * * *` | Per-entity SEO health scores into `seo_health_scores` |
| `gsc.daily.sync` | cron `0 5 * * *` + event | Search Console sync |
| `quote.expiry-reminder` | cron `0 8 * * *` | Emails customers whose quote expires within 3 days |
| `quote.auto-expiry` | cron `0 * * * *` | Flips RFQs in `quote_sent` past their expiry |
| `email.retry-failed` | cron `*/15 * * * *` | Retries failed transactional email |
| `media.trash.purge` | cron `0 3 * * *` | Permanently deletes media trashed >30 days |
| `scraper.job.run` | event `scraper/job.requested` | Competitor scrape |
| `product.blueprint.generate` | event `product/blueprint.requested` | AI catalogue blueprint |
| `procurement.research.start` | event `procurement/research.requested` | Fans out supplier research per enquiry |
| `procurement.research.item` | event `procurement/research.item` | Researches one enquiry line |

**Two of these are customer-facing and currently dormant:** `email.retry-failed`
means a transactional email that fails is never retried, and `quote.auto-expiry`
means quotes never expire on their own.

## What you need to do

One-time, ~10 minutes, entirely in two web dashboards. No code changes.

### 1. Create an Inngest account

[app.inngest.com/sign-up](https://app.inngest.com/sign-up). Default workspace is
fine. Free tier is 50K function steps / month.

### 2. Copy two keys

From the **Production** environment:

- **Manage → Event Keys** → the event key
- **Manage → Signing Key** → the signing key

### 3. Add them to Vercel

Project **`indus-hydraulics`** → **Settings → Environment Variables**. Add for
**Production + Preview + Development**, both marked **Sensitive**:

- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`

Then redeploy.

> There is one Vercel project. The storefront and admin were merged into
> `apps/web`; an older version of this document referred to a separate
> `indus-hydraulics-admin` project, which no longer exists.

### 4. Register the endpoint

**Apps → Sync App**, and paste:

```
https://indushydraulics.com/api/inngest
```

Or connect Inngest's GitHub integration and it auto-discovers on each deploy.

### 5. Verify

- **Functions** lists all ten.
- **Apps** shows the app connected.
- Click **Invoke** on `seo.health.recompute_all` and re-run the SQL above — a
  non-zero count is proof, and better proof than a green tick in a dashboard.

## Adding a new background job

1. Define `inngest.createFunction(...)` in `apps/web/src/inngest/`.
2. Add it to `allFunctions` in `functions.ts` — **a function missing from that
   array is silently never registered.**
3. Deploy, then re-sync in the dashboard if the GitHub integration is not set up.

## Patterns

- **Use `step.run(...)` liberally.** Each step retries independently; earlier
  steps are cached on a retry.
- **Make functions idempotent.** Steps re-run after partial failures.
  `quote.expiry-reminder` dedupes on a 24-hour `SentEmail` window.
- **Persist per-item results as they land, not in a final aggregate step.** A
  run that dies halfway should still leave usable output —
  `procurement.research.item` writes its row before returning.
- **Cap concurrency.** Unbounded fan-out exhausts the Supabase connection pool
  and surfaces as an error that reads like a code bug.
- **Keep `step.run` bodies under `maxDuration = 300`.** Split slow external
  calls from database writes.

## Cost notes

- Free tier: 50K steps + 25 functions / month.
- The six cron functions total roughly 1,000 steps/month.
- Supplier research is the variable one: about 2 steps per enquiry line, so 20
  enquiries a day at 5 lines each ≈ 6,000 steps/month. Still inside free tier.
- Inngest steps are free; the **Claude calls inside them are not**. Research
  cost is tracked per run in `research_runs.costUsdMicros`.

## What this does NOT cover

- **Storefront RFQ emails** still `await sendEmail()` directly. Failures are
  logged and picked up by `email.retry-failed` — once that is running.
- **Queue depth and lag metrics.** Sentry catches errors *inside* functions;
  use Inngest's own dashboard for queue health.
