# Inngest setup

Inngest runs background jobs and scheduled functions (cron) for the **admin
app**. The SDK is **safe to deploy without keys** — it initialises but cron
functions don't fire and `inngest.send()` is a no-op. To turn on scheduled
work in production, follow the steps below. One-time setup, ~5 minutes.

## What's already done in code

| File | Purpose |
|---|---|
| `apps/admin/src/inngest/client.ts` | Inngest client singleton (`id: 'indus-hydraulics-admin'`) |
| `apps/admin/src/inngest/functions.ts` | Function definitions — currently registers two |
| `apps/admin/src/app/api/inngest/route.ts` | Webhook endpoint Inngest calls into to invoke functions |
| `turbo.json` `globalEnv` | Whitelists `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` |

### Functions registered

| Function ID | Trigger | What it does |
|---|---|---|
| `seo.health.recompute_all` | Cron `0 4 * * *` (04:00 UTC daily) | Recomputes per-entity SEO health scores into `SeoHealthScore` table for the trends dashboard |
| `quote.expiry-reminder` | Cron `0 8 * * *` (08:00 UTC daily) | Finds Quotes expiring in the next 3 days where the RFQ is still `quote_sent`, and emails the customer a reminder. Skips quotes that already received a reminder in the last 24 hours |

## What you need to do

### 1. Create an Inngest account

1. Go to **https://app.inngest.com/sign-up** and create an account (free tier covers 50K function steps / month — plenty for this scale).
2. After sign-up you'll land on a workspace. Default name is fine.

### 2. Create an environment

1. In the workspace, you'll see a default **Production** environment. We'll use that.
2. Go to **Manage → Event Keys** and copy the production event key.
3. Go to **Manage → Signing Key** and copy the production signing key.

### 3. Add env vars to Vercel — **admin project only**

In the Vercel dashboard, open the **`indus-hydraulics-admin`** project (the storefront does not use Inngest):

1. **Settings → Environment Variables**.
2. Add for **Production** + **Preview** + **Development** scopes:
   - `INNGEST_EVENT_KEY` — the event key from step 2 (mark as **Sensitive**)
   - `INNGEST_SIGNING_KEY` — the signing key from step 2 (mark as **Sensitive**)
3. Save and trigger a redeploy of the admin project.

### 4. Register the webhook with Inngest

Inngest needs to know where to call into your app to invoke functions.

**If you set up Inngest's GitHub integration:** Inngest auto-discovers the webhook URL from each Vercel deployment. Nothing more to do.

**Otherwise, register manually:**
1. In the Inngest dashboard, go to **Apps → Sync App** (or **Add App**).
2. Paste your admin app's Inngest endpoint URL: `https://indus-hydraulics-admin.vercel.app/api/inngest`.
3. Click **Sync**. Inngest fetches the function definitions from the route and registers them.

### 5. Verify

In the Inngest dashboard:

- **Functions** tab should show both `seo.health.recompute_all` and `quote.expiry-reminder`, each with their cron schedule.
- **Apps** tab should show `indus-hydraulics-admin` connected.
- The next scheduled run will appear under **Runs** when the cron fires; you can also click **Invoke** on a function to trigger it manually for testing.

## How to add a new background job

1. Open `apps/admin/src/inngest/functions.ts`.
2. Define a new `inngest.createFunction(...)` export — see existing functions as templates.
3. Add it to the `allFunctions` array at the bottom of the file.
4. Deploy. Inngest auto-syncs on the next deployment if the GitHub integration is set up; otherwise re-sync manually in the dashboard.

## Patterns

- **Use `step.run(...)` liberally.** Each step is independently retryable. If step 4 of a function fails, Inngest re-runs step 4 only — earlier steps are cached.
- **Make functions idempotent.** Steps may re-run after partial failures. The quote-expiry reminder uses a 24-hour `dedupeFrom` window check on `SentEmail` so a re-run never double-sends.
- **Keep each function focused.** Cron + retries + concurrency + step semantics are the value-add; complex business logic still lives in the app code that the function calls.

## Cost notes

- Free tier: 50K function steps + 25 functions / month.
- The two scheduled functions together cost ~3 steps/day each = ~180 steps/month. Negligible.
- If you wire up storefront RFQ submissions to Inngest later, plan for ~1 step per submitted RFQ.

## What this does NOT cover

- **Storefront events** (RFQ submission emails). Today those `await sendEmail()` directly — failures are caught + logged but not retried. Wiring them through Inngest is a separate PR; defer until you see Resend reliability becoming a real issue.
- **Real-time queue monitoring.** Sentry catches errors *inside* Inngest functions; for queue depth or lag metrics, use Inngest's own dashboard.
