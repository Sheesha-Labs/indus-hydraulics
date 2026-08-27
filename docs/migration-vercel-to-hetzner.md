# Leaving Vercel — plan of action

Moving indus-hydraulics from Vercel to a Hetzner VPS behind Cloudflare.
Supabase stays where it is for now.

**Audited 2026-08-27.** 35 agents, 151 findings, 24 put through an adversarial
pass that tried to refute them. Severities below are *after* that review — the
auditors marked 30 findings as blockers and 22 were downgraded, because the
evidence held but "broken on day one" was overstated. Every item cites file and
line so nothing here has to be re-derived under time pressure.

Tick the boxes. Nothing user-visible moves until Phase 5.

---

## 0. The decision that gates everything

> **Hetzner has no location near both Mumbai and the Gulf.**
>
> The database is in `ap-south-1`. Functions run in `bom1` today, beside it.
> Several storefront pages issue **9–13 sequential** database round trips —
> ~25 ms from Mumbai, **1.0–1.7 s** from a German box.

Cached pages are unaffected; Cloudflare serves those. This decides how the site
feels on cache misses, admin screens and every server action.

- [ ] **Pick one, and write down why:**
  - [ ] **Hetzner Singapore** — closest Hetzner site to Mumbai (~55 ms). Gulf visitors see ~110 ms TTFB on uncached pages. Pair with collapsing the query chains.
  - [ ] **Supabase to Europe + box in Falkenstein** — back to single-digit latency, but it is a project migration, not a setting.
  - [ ] **Drop the Hetzner constraint** — a VPS in Dubai or Bahrain sits near both the database and the customers.

Everything below is sized from this answer.

---

## 1. Pre-flight — do before the box exists

- [ ] **Export the Search Console history.** `gsc_metric_daily` has **zero rows**
      and Vercel Analytics never transmitted, so there is currently no baseline to
      detect a post-cutover regression against. GSC holds 16 months; fix the sync
      and let it backfill, or take a manual export by page for the last 90 days
      and commit it.
- [ ] **Export both DNS zone files** (`.com` and `.me`) before touching Cloudflare.
- [ ] **Get the env into a real secret store.** After Vercel is decommissioned it
      is one laptop away from unrecoverable. `vercel env pull`, then diff against
      `turbo.json` globalEnv.
- [ ] **Copy these verbatim — regenerating them invalidates live sessions or breaks links:**
      `CUSTOMER_AUTH_SECRET`, `STAFF_AUTH_SECRET`, `PREVIEW_TOKEN_SECRET`, `QUOTE_TOKEN_SECRET`.
- [ ] **Regenerate `.env.example`.** It still names `STOREFRONT_AUTH_SECRET` and
      `ADMIN_AUTH_SECRET` (`.env.example:5,9`) — names the code stopped using.
      The real allowlist is `turbo.json` globalEnv, because Turbo 2.9.6 runs
      `envMode: strict` and silently strips anything not listed.

---

## 2. Security — worth doing this week regardless of the migration

These apply to production **today**. Two get materially worse behind Cloudflare.

- [ ] **Password-reset links are built from a client-controlled header.**
      `admin/forgot-password/actions.ts:9-15,39` derives the link origin from
      `x-forwarded-host`. Vercel normalised that header; a hand-rolled proxy will
      not. Use a fixed `APP_ORIGIN` unconditionally.
- [ ] **The upload rate limiter reads the attacker's own value.**
      `api/rfq/attachments/sign/route.ts:88-92` takes the *first* element of
      `x-forwarded-for`. Behind Cloudflare that hop is client-supplied, so the
      limit is bypassed with a header. Read `cf-connecting-ip`, falling back to
      the **last** XFF entry — never the first. Factor into one `clientIp()` helper.
- [ ] **The origin will answer on any hostname.** `trustHost: true` is hardcoded
      in `lib/auth.ts:15` and `lib/admin-auth.ts:16`. Firewall inbound 80/443 to
      Cloudflare ranges (or use a Tunnel), enable Authenticated Origin Pulls, and
      give the proxy a default vhost that drops unknown `Host`.
- [ ] **`/_next/image` is an open proxy.** `remotePatterns` allows `*.supabase.co`
      — anyone can point the optimizer at any Supabase project, on your CPU once
      it is your VPS. Narrow to the one project ref.

---

## 3. Make it buildable — no infrastructure yet

Nothing but Vercel has ever compiled this app.

- [ ] `output: 'standalone'` in `next.config.ts`. There is currently no deployable
      artifact, only a 2.6 GB working tree. Remember to copy the two things Next
      does *not*: `.next/static` and `public/`.
- [ ] **Fix the Prisma engine target.** `packages/db/prisma/schema.prisma:7` is
      `["native", "rhel-openssl-3.0.x"]` — RHEL is Vercel's Lambda runtime and
      matches no Hetzner image. Use `debian-openssl-3.0.x` (Debian/Ubuntu) or
      `linux-musl-openssl-3.0.x` (Alpine). **This exact class of error has bitten
      this project before.**
- [ ] **Add `sharp` as an explicit dependency of `apps/web`.** It currently
      resolves only as an optionalDependency of `next`, and only the darwin-arm64
      binary is in this tree. Without it every image on the site is missing —
      `apps/web/public` holds nothing but six stock SVGs.
- [ ] **Delete the duplicate `@prisma/client`.** Two major versions resolve in one
      tree (`apps/web/package.json:28` pins `^7.8.0` unused). A hoisting change
      during containerisation makes the winner non-deterministic.
- [x] **Add a `build` job to CI** that produces the artifact. Deploy *that* — never
      build on the production box. Note `next build` no longer typechecks
      (deliberate, see #417); `typecheck · lint · test` is the required gate.
- [ ] **Add the build secrets and set `CI_BUILD=true`.** The job is gated off
      until then so it does not sit red. It needs more than a database, which the
      first run proved rather than the docs — with only `DATABASE_URL` set it
      failed on `STAFF_AUTH_SECRET is missing`, because route modules are
      evaluated while collecting page data and the auth config is built at import
      time. Required repository secrets:
      `DATABASE_URL`, `DIRECT_URL`, `CUSTOMER_AUTH_SECRET`, `STAFF_AUTH_SECRET`
      (two **different** values), `SUPABASE_SERVICE_ROLE_KEY`,
      `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] **Replace the `VERCEL_ENV` gates.** `markets/page.tsx:174`,
      `markets/[slug]/page.tsx:181`, `MarketsIndex.tsx:319` all read
      `process.env.VERCEL_ENV !== 'production'`. Off Vercel that is **true**, so
      an internal reviewer's debug strip renders on **127 public market pages**.
      Use `APP_ENV`, written so unset means production.
- [ ] **Read `cf-ipcountry`.** `proxy.ts:234` reads `x-vercel-ip-country`, the only
      geo source. Keep the Vercel header as a transitional fallback, and add a
      Cloudflare Transform Rule stripping any client-supplied copy of either.
- [ ] **Add `experimental.serverActions.allowedOrigins`** as belt-and-braces for
      the CSRF check below.
- [ ] **Add `DATABASE_BUILD_CONNECTION_LIMIT`, `DATABASE_POOL_TIMEOUT`, `CI`,
      `APP_ENV`, `INNGEST_SERVE_HOST`** to `turbo.json` globalEnv.

---

## 4. Stand up the box

- [ ] **Process supervision.** systemd with `Restart=always`, `RestartSec=2`, a
      `MemoryMax=` below box RAM so the unit restarts rather than the kernel
      picking a victim, and a swapfile. One OOM otherwise ends the site until a
      human notices.
- [ ] **Reverse proxy headers — get this wrong and every admin save fails with an
      unexplained 500.** Next's Server Action CSRF check keys on
      `x-forwarded-host`. Set `Host`, `X-Forwarded-Host` and
      `X-Forwarded-Proto https` explicitly; never let a local proxy overwrite the
      proto with `http`, or reset links and Auth.js callbacks become `http://` too.
- [ ] **Redis cache handler**, composed: try Redis, fall back to the on-disk
      cache, write through on first read. A *pure* Redis handler never reads
      build-time prerenders back, which makes every `generateStaticParams` list
      dead weight.
- [ ] **`.next/cache` on a persistent path outside the release directory**, with a
      size cap. It holds ISR pages, the fetch cache and a 30-day image cache, and
      a naive deploy wipes it — the image-optimizer warm-up alone is 1–2 CPU-hours
      from cold.
- [ ] **Separate liveness endpoint.** `/api/health` returns 503 on a database blip,
      which is wrong for a container probe — it restarts a healthy app because a
      remote database hiccuped. Add `/api/health/live` returning 200 unconditionally.
- [ ] **Bound the logs.** 631 bare `console.*` calls currently land in Vercel's log
      viewer, which the runbook names as the way to debug production. On a VPS
      nothing replaces it. Set `SystemMaxUse=` or route to a rotated file.
- [ ] **Raise the connection pool.** One long-lived process shares a single
      10-connection pool where each lambda had its own. Start at 30–50, load-test,
      keep total clients under the Supavisor 200 cap. Drop `pgbouncer=true` when
      connecting directly — it disables prepared statements.
- [ ] **Pin full-ICU Node.** `Asia/Dubai` formatting fails silently on a small-ICU
      build. Assert once at boot in `instrumentation.ts` (which already exists).

---

## 5. Rehearse on a real hostname

- [ ] **`staging.indushydraulics.com` behind Cloudflare, pointed at the box.**
      It must be real HTTPS: `__Secure-` cookie prefixes are baked from `NODE_ENV`
      (`auth-cookies.ts:43-45`), so **nobody can sign in over plain HTTP**. Do not
      work around this by changing `NODE_ENV`.
- [ ] **TLS: Full (strict)** + Cloudflare Origin CA cert + Authenticated Origin
      Pulls. **Flexible SSL would carry admin session JWTs in plaintext across the
      public internet.**
- [ ] **Turn OFF before any traffic:** Email Obfuscation and Rocket Loader (both
      rewrite server-rendered HTML and break React hydration), Auto Minify if the
      zone still offers it.
- [ ] **Leave Bot Fight Mode OFF.** It blocks exactly the crawlers this site exists
      to attract. Allow the AI crawlers explicitly and verify with
      `curl -A 'GPTBot'` before and a week after cutover — these defaults change.
- [ ] **Cache rules: static assets only.** Cache `/_next/static/*`, `/_next/image`,
      `/favicon.ico`, and the `.xml`/`.txt` endpoints. **Bypass HTML.**
      A "Cache Everything" rule would serve the wrong body, because middleware
      makes one URL serve many: `/` → `/h/<country>`, `/c/*` → `/c-filter/*`.
- [ ] **Enable Vary for Images**, or pin `images.formats: ['image/webp']` — without
      it Cloudflare serves AVIF bytes to browsers that asked for WebP.
- [ ] **Run the full E2E suite against staging.** Then by hand: submit the contact
      form and save one admin CMS field — those two cover the whole server-action
      path.
- [ ] Update the E2E specs: they assert `x-vercel-cache` and assume the edge
      overwrites the geo header. Swap to `cf-cache-status`.

---

## 6. Background jobs — cut over last

Six crons and two event-driven functions all run through one Inngest endpoint.
Nothing uses Vercel Cron, so the scheduling surface moves as one piece.

- [ ] **Pin the serve URL.** `api/inngest/route.ts:16` infers it from request
      headers. Set `INNGEST_SERVE_HOST` and `INNGEST_SERVE_PATH`.
- [ ] **Mint production keys.** `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` are
      empty everywhere. `inngest.send()` *throws* without one — it does not no-op.
- [ ] **Set `NEXT_PUBLIC_BASE_URL` in the BUILD environment.** It is inlined at
      build time, so every link in every cron-sent email is frozen to whatever the
      build machine had. Assert post-build that `localhost:3000` appears nowhere in
      `.next/server/chunks`.
- [ ] **WAF skip rule** on `/api/inngest`, and note in the runbook that the path is
      intentionally unauthenticated at the app layer — Inngest authenticates by
      HMAC signature.
- [ ] **The scraper crawl runs 4+ minutes in one step**, past Cloudflare's ~100 s
      proxy timeout. Either put the endpoint on a grey-clouded subdomain, or split
      the step.
- [ ] **Re-sync after every deploy:** `curl -fsS -X PUT https://…/api/inngest` as
      the last deploy step, failing the deploy on non-2xx. Vercel's integration
      used to do this.
- [ ] **Rewrite `INNGEST_SETUP.md`** — every path in it points at `apps/admin/`,
      which has not existed since the merge.

---

## 7. Cutover

> **This is a nameserver delegation, not a record change.** Lowering TTLs does
> not help, and rollback is the same slow operation in reverse.

- [ ] **Phase A — move the zone, change nothing.** Point Cloudflare at Vercel and
      let delegation settle **48 hours**. Nothing user-visible changes.
- [ ] **Verify mail before going further.** The zone move takes your email with
      it: the `.com` is the marketing sender with no mailboxes, the `.me` holds the
      real mailboxes and all transactional mail. Diff both imported zones against
      the exported files, keep every mail record **grey-clouded**, and test a real
      send *and* a real receive.
- [ ] **Phase B — flip the record.** Watch cache-hit ratio, error rate, TTFB.
- [ ] **Dual-run reads only.** Inngest cannot be dual-run — either register a
      separate app id for the overlap, or accept a scheduled-jobs blackout and cut
      it over last.
- [ ] **Keep Vercel deployable for two weeks.** Rollback is one record.

---

## 8. After

- [ ] **Update the privacy policy.** `page-sections/pages/privacy.ts:98,108` names
      Vercel as hosting sub-processor and international-transfer recipient — a
      published legal statement that becomes false on cutover day. Add Cloudflare
      as a CDN/WAF processor. Note the Pages & Blocks trap: these are seed
      defaults and a saved DB row wins over them.
- [ ] **Rewrite `docs/deployment-budget.md`** — see below.
- [ ] **Restrict Supabase to the VPS IP**, but only *after* cutover and only once
      the build no longer needs a live database.
- [ ] **Fix the Sentry browser SDK.** `sentry.client.config.ts` is webpack-only and
      this app builds with Turbopack, so client-side error reporting has never
      worked. Unrelated to the migration; broken today.
- [ ] Delete `@vercel/analytics` and `@vercel/speed-insights`, and their now-dead
      CSP allowances in `proxy.ts:92-93`.
- [ ] Delete the dead `preferredRegion` export and `vercel.json` — both are no-ops
      off Vercel and encode an assumption that is no longer true.

---

## What this reverses

**Self-hosting eliminates the per-deploy ISR cache wipe** — the exact problem
`docs/deployment-budget.md` was written around. Vercel gives every deployment its
own cache and will not reuse the previous one; a Redis handler keys entries by
pathname with no build id, so the cache survives deploys and the ~1,790 cold URLs
per deploy stop happening.

So, of the work done on 2026-08-26:

| Practice | Survives? |
|---|---|
| Content in the database, not commits | **Yes, stronger** — now about avoiding a build at all |
| Batching merges | Yes, weaker reason — build minutes move to GitHub Actions, they do not vanish |
| Short prerender lists | **Only with a composed cache handler** — pure Redis makes them dead weight |
| Preview builds opt-in | Port to the new workflow as a commit-message condition or PR label |
| Docs-only build skip | Port to `paths-ignore: ['docs/**', '**/*.md']` |

---

## Decisions needed from the founder

| Decision | Why it is not mine to make |
|---|---|
| **Region** | Trades Gulf page speed against database latency. Everything is sized from it. |
| **Supabase: stay or move** | Currently "stay for now" — worth re-confirming against the measured latency. |
| **Email risk appetite** | The zone move touches live mailboxes. Someone should be watching. |
| **Security fixes now or at migration** | All three apply to production today. |

---

## Verified non-issues — do not spend cutover time on these

- **Middleware runtime does not change.** Next 16 already pins `src/proxy.ts` to
  Node, so `getToken`, `node:crypto` and the Prisma redirect lookup run exactly as
  they do today.
- **The SEO surface is portable.** Every canonical, sitemap `loc`, RSS link and
  JSON-LD `url` derives from `NEXT_PUBLIC_BASE_URL`, not the request host.
- **Cloudflare Pages is not worth wiring up.** Cloudflare already caches
  `/_next/static` from the origin — hashed, immutable filenames, no code change. A
  separate Pages origin buys nothing and costs an `assetPrefix`, a CSP rewrite and
  a CORS surface.
- **`DIRECT_URL` already points at the IPv4-reachable session pooler**, so
  migrations work unchanged.
