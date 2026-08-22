# Sentry setup

Sentry is wired into both apps via `@sentry/nextjs`. The SDK is **safe to
deploy without a DSN** — it initialises but sends nothing. To actually see
errors in Sentry, follow the steps below. One-time setup, ~10 minutes.

## What's already done in code

| File | Purpose |
|---|---|
| `apps/{storefront,admin}/sentry.server.config.ts` | Server-runtime SDK init (server actions, RSC, route handlers, Prisma exceptions) |
| `apps/{storefront,admin}/sentry.client.config.ts` | Browser-runtime SDK init |
| `apps/{storefront,admin}/sentry.edge.config.ts` | Edge-runtime SDK init (middleware) |
| `apps/{storefront,admin}/src/instrumentation.ts` | Next.js entry point that loads the right SDK build per runtime |
| `apps/{storefront,admin}/src/app/global-error.tsx` | Top-level boundary that captures errors above the route segments |
| `apps/{storefront,admin}/next.config.ts` | Wrapped with `withSentryConfig` for build-time source-map upload |

Tags applied to every event: `app=storefront|admin`, `runtime=server|client|edge`.
PII collection is **off** by default. Session Replay is **off** by default.

## What you need to do

### 1. Create a Sentry account + projects

1. Go to **https://sentry.io/signup/** and create an account (free tier is fine — 5K errors/month).
2. Once in, go to **Settings → Projects → Create Project**.
3. Pick **Next.js** as the platform. Name it `indus-hydraulics-storefront`.
4. After creation, you'll see a `dsn` value — copy it.
5. Repeat for `indus-hydraulics-admin`.

### 2. Generate an auth token (for source-map upload)

1. Go to **Settings → Account → Auth Tokens → Create New Token**.
2. Scopes needed: `project:write` and `project:read`.
3. Copy the token. You'll only see it once.

### 3. Add env vars to Vercel

In the Vercel dashboard, for **each project** (`indus-hydraulics` storefront and `indus-hydraulics-admin`):

1. Open the project → **Settings → Environment Variables**.
2. Add these for **Production** + **Preview** + **Development** scopes:
   - `SENTRY_DSN` — the DSN from the matching Sentry project (server-side errors)
   - `NEXT_PUBLIC_SENTRY_DSN` — same DSN (client-side errors; the `NEXT_PUBLIC_` prefix exposes it to the browser, which Sentry expects)
   - `SENTRY_ORG` — your Sentry org slug (visible in the Sentry URL after `sentry.io/organizations/`)
   - `SENTRY_PROJECT` — `indus-hydraulics-storefront` or `indus-hydraulics-admin` (whichever matches the project)
   - `SENTRY_AUTH_TOKEN` — the auth token from step 2 (mark as **Sensitive** so it's not shown in logs)
3. Save and trigger a redeploy of each project so the build picks up the env vars.

> **`SENTRY_AUTH_TOKEN` is the switch for the build-time half.** Without it,
> `next.config.ts` turns source-map upload and release creation off entirely,
> so builds stay silent instead of printing "No auth token provided" twice per
> run. The moment the token exists in Vercel, both switch back on with no code
> change. Runtime error capture only needs the DSN and is unaffected either way.

### 4. Verify

After the redeploy, force an error to confirm events arrive:

- Visit a non-existent page like `https://indus-hydraulics.vercel.app/__test-sentry-error` — the 404 itself won't trigger Sentry, but the global-error boundary will if anything in the layout fails.
- Or temporarily add `throw new Error('sentry test')` to a server action, deploy, hit it once, then remove.

In Sentry: open the project, click **Issues**. Your test error should show up within ~30 seconds, tagged with `app` and `runtime`.

## What gets captured automatically

Once DSNs are set:

- **Unhandled exceptions** in server actions, RSC, route handlers, middleware
- **Unhandled exceptions** in client components (browser console errors)
- **Prisma errors** that bubble up through server actions
- **Failed fetches** from client-side `fetch()` calls (with status codes ≥ 400)
- **Performance traces** for 10% of requests (React Server Component renders, server-action durations, Prisma query timings)

## What does NOT get captured

- Errors that the application **catches and recovers from** silently (e.g. the
  `.catch(() => null)` swallow patterns in `lib/navigation.ts` and friends).
  If you want those tracked, add an explicit `Sentry.captureException(err)` in
  the catch block.
- Sentry's auto-instrumentation does not see structured business events
  (e.g. "RFQ submitted by account X"). Add explicit `Sentry.captureMessage` /
  `Sentry.addBreadcrumb` calls in those code paths if you want them
  searchable later.

## Cost notes

- Free tier: 5K errors / 10K performance events per month.
- `tracesSampleRate: 0.1` means 10% of requests get a full performance trace. Drop to 0.05 if you blow through the quota.
- Session Replay is **off** — turning it on (`replaysOnErrorSampleRate: 1.0`) is helpful for debugging but eats quota fast.

## Adjacent setup: uptime monitor

Sentry catches errors **inside** the app. It does not catch outages where the
app is unreachable. Pair it with an external uptime check on `/api/health`:

- Free options: Better Stack (formerly BetterUptime), UptimeRobot, Vercel's
  built-in monitors.
- Suggested checks (1-minute interval):
  - `https://indus-hydraulics.vercel.app/api/health` — expects HTTP 200 with `{"status":"ok","db":"reachable"}`
  - `https://indus-hydraulics-admin.vercel.app/api/health` — same expectations
- Suggested escalation: email on first failure, SMS on three consecutive failures.

Setting that up is a Vercel/uptime-tool dashboard task — out of scope for this PR.
