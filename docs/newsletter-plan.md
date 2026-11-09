# Newsletter system — plan

Status: **Phase 1 live, 2026-11-09** (PR #597, merged as `416d39a`). **Phases 2–4 built 2026-11-09** — admin subscribers/lists (#599), composer and templates (#600), sending/scheduling/reports (stacked PR) — held for one batch deploy; all migrations applied. Phase 5 (launch) follows the deploy. See Appendices C–F.

Goal: a working newsletter for Indus Hydraulics, end to end — a signup that
actually confirms, a subscriber and list manager in the admin, a composer that
builds branded emails from templates, sending to every subscriber or to an
uploaded list, and the unsubscribe, bounce and suppression handling that bulk
email legally needs. English only.

Source: the system already built for Bazar Real Estate (`bazar-real-estate-cms`,
**`origin/main`**, merged 2026-11-04 as #718 — the checked-out branch there is
stale and still has the old Mailchimp code). Its own docs are
`docs/NEWSLETTER.md` and `docs/decisions/ADR-0009-own-newsletter-sender-over-mailchimp.md`.

---

## 1. Where Indus is today

| Piece | State |
|---|---|
| Signup tile | On the home page and `/blog`. Saves the address to `newsletter_subscribers` (table exists, migration 202605110511). **One row in production** (20 Sep 2026). |
| Confirmation email | None. The form says "check your inbox" and nothing is sent. |
| Unsubscribe | None. The form promises "Unsubscribe in one click". |
| Admin | None — no screen reads the table. |
| Composer, campaigns, lists, sending | None. |
| Bounce / complaint handling | None. No Resend webhook. |
| Copy | Home tile claims "4,200+ engineers" and "2× a month". Neither is true. |
| Spam guard on the form | Weaker than the other forms: `display:none` honeypot, no timing check, and the "silent success" branch for bots is unreachable (schema rejects first). |
| Privacy policy | Mentions Resend for transactional email only; nothing about a newsletter. |

What Indus already has that the port can stand on:

- **Resend** (`resend` 4.8.0) with `sendEmail()` + a `sent_emails` audit row per message, and `.com` verified for sending. Reply-To must be `.me` (`packages/domain/src/email-domains.ts`; `assertMarketingSender` exists, unused).
- **Inngest** wiring (`apps/web/src/inngest`), but `INNGEST_SETUP.md` says it is **not connected** in production.
- **Email templates** as HTML strings with a branded 600 px layout (`packages/email/src/templates/_layout.ts`).
- **TipTap 3** editors (blog block editor, generic `RichTextEditor`), **papaparse**/**xlsx** and a full CSV import flow (`admin/(shell)/products/import`), the media library and `uploadToStorage`, signed-token helpers (`quote-access-token.ts`), the shared honeypot + timing helper (`lib/designed-enquiry.ts`), and the admin page/CRUD patterns (`AdminPageShell`, `Result<T>`, `requireRole`).

## 2. What Bazar has, and what ports

Bazar's system (all on `origin/main`):

- **Data:** subscribers (`pending → confirmed → unsubscribed/bounced`, permanent unsubscribe token), campaigns (`draft/scheduled/sending/sent`, rich or block format, `design` JSON, audience + `list_ids`), per-recipient deliveries (status, attempts, Resend id, delivered/bounced/complained timestamps), saved templates, uploaded lists + list contacts, a hashed suppression table kept in sync by triggers, and a single-row sender setting.
- **Signup:** double opt-in, rate limit, honeypot + timing + dotted-Gmail bot drop, confirmation then welcome email.
- **Unsubscribe:** read-only page with a button (so link scanners can't unsubscribe people), POST-only RFC 8058 one-click endpoint, `List-Unsubscribe` headers on every campaign email, cross-list suppression.
- **Admin (`/admin/newsletter`):** campaigns, composer (rich text or a 23-block designer with colour/font settings, preview in a desktop/phone frame, test send, send now or schedule), saved templates, subscribers (filter, search, re-send confirmation, unsubscribe), lists (CSV upload with preview, add one, export), sender settings checked against Resend's verified domains.
- **Sending:** Postgres as the queue — a snapshot function fills deliveries, a `FOR UPDATE SKIP LOCKED` claim hands out 100 at a time, Resend batch API with an idempotency key per batch, three attempts, dry run by default outside production. Drained by a Vercel cron every minute (~1,000 emails/min ceiling).
- **Tracking:** Resend webhook (Svix-verified) records delivered / bounced / complained; a permanent bounce or complaint suppresses the address everywhere. **No open or click tracking** — deliberately.
- **Tests:** good TypeScript unit coverage (send, render, CSV, webhook verification, sender, blocks). No SQL tests, no e2e of the composer.

### Port decisions

| Bazar piece | For Indus |
|---|---|
| Supabase JS + SQL migrations | **Prisma models** for the tables; **raw-SQL migrations** for the functions, triggers, partial indexes and checks (`prisma db execute`, timestamped names per CLAUDE.md §5.4). Call the snapshot/claim functions with `$queryRaw` so `SKIP LOCKED` survives. |
| RLS as a second gate | Prisma bypasses RLS here, so **app-level `requireRole` is the only gate**. Enable RLS with no policies on every new table (the 202605110531 precedent). Do **not** port the anon-insert policy. |
| Bilingual (EN/AR) layer | **Drop** — every `_ar` field, locale column, RTL handling, machine translation. Audience becomes *all subscribers* and/or chosen lists. |
| Real-estate feature cards (property, development, area) | **Replace** with Indus records: product, category, blog article, industry — drawn from live data at send time. |
| Bazar templates (launch, listings, market…) | **Replace** with Indus starters: *New in stock*, *Product spotlight*, *From the blog*, *Industry update*, *Announcement*. |
| Bazar palette, logo, footer | **Indus brand**: `BRAND` hex from `packages/domain/src/brand-colors.ts`, store logo, legal name + registered address from `StoreSettings`. |
| Vercel cron every minute | **Event-driven Inngest** instead (see decision D2) — no polling cost, and it survives the planned Hetzner move. |
| `form_submissions`, `logAudit`, observability helpers | Indus equivalents: `account_activity`-style audit rows where useful, `console.error` + Sentry as today. |
| TipTap `EmailBodyEditor`, `EmailFrame` | Reuse Indus's `RichTextEditor` for the rich mode; port `EmailFrame` (sandboxed iframe preview). |
| CSV parser (`lib/newsletter/lists.ts`) | Port as-is (pure, tested). Server parse via papaparse/xlsx as products already do, so `.xlsx` works too. |

### Bazar bugs to fix on the way in (not port)

1. **Confirmation on GET.** Mail scanners open links, so they confirm subscriptions nobody asked for. Indus: confirm page shows a button; the button POSTs.
2. **Anonymous insert policy** lets anyone with the public key insert pending rows. Not applicable to Indus (no anon client), and must stay that way.
3. **Editors can schedule a send** through RLS. Indus: scheduling and sending require `NEWSLETTER_SEND`, checked in the action.
4. **Possible duplicate sends** if marking a batch `sent` fails after Resend accepted it. Indus: write delivery status in the same transaction that claims the next batch, check the update result, and key idempotency on the delivery id.
5. **CSV size limit** (5 MB) above the server-action body limit (4 MB) → unclear failure. Indus: upload the file to storage first and parse it server-side from there, like product import.
6. **Block-built emails can lack a postal address.** Indus: the legal footer (legal name, address, unsubscribe link) is always appended, whatever the design.
7. **No consent record.** Indus: store the consent wording version and timestamp on signup and on every CSV import.

## 3. Decisions needed before building

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | **Sending domain** | (a) send newsletters from `indushydraulics.com`, same as RFQ/quote mail; (b) verify a subdomain such as `news.indushydraulics.com` in Resend (DNS: SPF, DKIM, DMARC) | **(b).** A spam complaint on a campaign then cannot hurt quote and RFQ deliverability. Reply-To stays `sales@indushydraulics.me`. |
| D2 | **What drives the sending queue** | (a) connect Inngest (free tier covers this) and drive sends by event; (b) a scheduler on the Hetzner box; (c) Vercel cron every minute | **(a).** Event-driven: "send" starts a function that drains in steps and sleeps between batches, scheduled sends use a delayed event. No per-minute polling, no extra Vercel invocations, and it moves with us to Hetzner. Also fixes the existing crons (quote expiry, email retry) that never fire today. |
| D3 | **Resend plan** | Free (100/day, 3,000/month) vs Pro (50,000/month) | Free is enough for Phase 1 (confirmations only). Move to Pro before the first real campaign to a list of more than ~100. |
| D4 | **Open/click tracking** | Off (Bazar's choice) / on | **Off** for launch. Turning it on needs a privacy-policy change and a consent line; revisit after the first campaigns. |
| D5 | **Who can do what** | — | `NEWSLETTER_WRITE` (write drafts, templates, manage lists): super_admin, manager, cms_editor. `NEWSLETTER_SEND` (send, schedule, import lists, sender settings): super_admin, manager. |
| D6 | **Uploaded lists and consent** | — | Every import requires ticking "everyone on this list agreed to receive email from Indus", stored with the import. Suppressed addresses are always dropped. This matters: mailing a scraped or bought list from our domain risks the domain, not just the campaign. |
| D7 | **Copy that overstates** | — | Change the home tile now (no deploy, CMS): drop "4,200+ engineers" and "2× a month" until they are true. |

## 4. Phases

Each phase is **one PR** (CLAUDE.md batch rule), migrations applied before merge.
Rough sizes assume one engineer-session per "day".

### Phase 0 — Setup and honest copy *(½ day, no deploy)*

- Fix the home and blog newsletter copy in Pages & Blocks (D7).
- D1: add the sending subdomain in Resend and the DNS records at **Spaceship** (not Cloudflare — the zone is on `launch1/2.spaceship.net`); confirm DKIM/SPF/DMARC pass.
- D2: connect Inngest (event key + signing key in Vercel and `.env.local`), register the app, check the existing crons start firing.
- Create the Resend webhook (delivered, bounced, complained) → `/api/webhooks/resend`; store `RESEND_WEBHOOK_SECRET`.
- Draft the privacy-policy paragraph on newsletters and Resend (content edit, no deploy).

### Phase 1 — A signup that works *(2 days, 1 deploy)*

Outcome: someone subscribes, gets a confirmation email, confirms, gets a welcome email, and can unsubscribe in one click. Bounces and complaints suppress.

- **Schema:** extend `newsletter_subscribers` — status `pending | confirmed | unsubscribed | bounced` (migrate the one existing row), `confirmationToken`, permanent `unsubscribeToken`, `confirmationSentAt`, `confirmedAt`, `consentText`/`consentVersion`; new `newsletter_suppressions` (email hash + reason) and the sync trigger.
- **`packages/email`:** `sendEmail` gains `headers`, `text`, and a `kind` for `newsletter_confirmation` / `newsletter_welcome`; new `sendEmailBatch` (Resend batch API, idempotency key). Layout gains a legal/unsubscribe footer slot. Two templates: confirmation, welcome.
- **Signup action:** fix the honeypot (silent success), add the timing check (shared `designed-enquiry` helper), a per-IP limit, bot heuristics from Bazar, consent capture, confirmation email. Already-confirmed → "you're already subscribed".
- **Public routes** (noindex, not in sitemap, `/newsletter/` added to robots disallow): `/newsletter/confirm/[token]` (button → POST), `/newsletter/unsubscribe/[token]` (read-only page + button), `POST /api/newsletter/unsubscribe` (RFC 8058, unknown token → 200), `POST /api/webhooks/resend` (Svix-verified; delivered/bounced/complained → status + suppression).
- Home stays static: nothing here reads cookies or headers during render.
- **Tests:** signup schema + bot paths, token checks, unsubscribe idempotency, webhook signature (port Bazar's `events.test.ts`), suppression trigger via a DB test script.

### Phase 2 — Subscribers and lists in the admin *(2 days, 1 deploy)*

Outcome: staff can see and manage everyone who can be mailed, and upload their own lists.

- RBAC groups (D5); sidebar entry **Content → Newsletter**, breadcrumb labels, `/admin` prefix test.
- **Subscribers:** status tabs with counts, search, date range, CSV export (formula-safe, port `contactsToCsv`), re-send confirmation (batched, 24 h cooldown), unsubscribe.
- **Lists:** `newsletter_lists` + `newsletter_list_contacts` (+ status sync trigger). Create/rename/delete, add one contact, export.
- **CSV / XLSX import:** upload to storage, server parse (papaparse/xlsx), auto-detect the email/name columns *plus a manual column picker* (Bazar has none), preview with counts — added, already on list, suppressed, invalid, duplicate — consent checkbox stored with the import, 20,000-row cap, dedupe, never revive an unsubscribed contact.
- **Suppressions:** read-only view (reason, date; hashed, so no addresses).
- Port `lists.test.ts`; add import action tests.

### Phase 3 — Composer and templates *(3–4 days, 1 deploy)*

Outcome: staff build a branded newsletter, preview it, and send themselves a test.

- **Schema:** `newsletter_campaigns` (subject, preheader, format `rich | blocks`, `design` JSON, body HTML, audience `all | none`, `listIds`, status, scheduledAt, counts, created/updated/sent by), `newsletter_templates`, `newsletter_settings` (from name, from address on the newsletter domain, reply-to on `.me`).
- **Block designer:** port Bazar's block document (`types`, `catalogue`, `normaliseDesign`, `render`, `presets`) without the Arabic layer. Keep the general blocks (hero, logo, heading, text, section, quote, image, image+text, gallery, features, cards, stats, chips, list, key-values, person, button, CTA band, social, contact, divider, spacer). Replace `records` with Indus kinds: **product** (photo, title, part no., link), **category**, **blog article**, **industry**. Indus palette and fonts as the design settings defaults.
- **Rich mode:** Indus `RichTextEditor` + an email-safe sanitiser; same "feature" embeds as blocks.
- **Starters:** New in stock, Product spotlight, From the blog, Industry update, Announcement, Blank — built from live data where they reference records.
- **Saved templates:** save any design as a template; use, rename, delete.
- **Preview:** sandboxed iframe, desktop/phone toggle, inbox header (subject + preheader).
- **Test send** to the signed-in staff member, `[Test]` prefix, dead unsubscribe link.
- **Send gate** (`campaignProblems`): empty subject/body, placeholders left in, unknown tokens, unsafe links, no audience, missing legal footer.
- **Sender settings** page, checked against Resend's verified domains.
- Port `campaign.test.ts`, `catalogue.test.ts`, `sender.test.ts`.

### Phase 4 — Sending, scheduling and reports *(3 days, 1 deploy)*

Outcome: send to all confirmed subscribers and/or chosen lists, now or later, and see what happened.

- **Schema:** `newsletter_deliveries` (one per recipient, subscriber *or* list contact, status, attempts, Resend id, delivered/bounced/complained timestamps, unique per campaign + recipient); SQL functions `newsletter_start_campaign` (snapshot, dedupe by address, suppression excluded) and `newsletter_claim_deliveries` (`SKIP LOCKED`, stale reclaim).
- **Inngest function** `newsletter/campaign.send`: start → loop { claim 100 → render each (own unsubscribe link + headers) → Resend batch with idempotency key → record per-recipient status → sleep } → finish. Dry run outside production. Scheduled sends: delayed event at `scheduledAt`, cancellable.
- **Fix Bazar #4** (duplicate-send risk) as described above.
- **New vs Bazar:** cancel a send in progress; per-campaign rate cap (start low for warm-up).
- **Report screen:** recipients, sent, delivered, bounced, complained, failed, skipped; refreshes while sending. Campaign list with status and counts; duplicate a campaign.
- Port `send.test.ts`; add SQL tests for start/claim/suppression (a small script against a scratch schema).

### Phase 5 — Launch *(1 day, docs only — no deploy)*

- Dry-run a full campaign against a seeded test list in production with `EMAIL_DRY_RUN`.
- Warm-up: first real send to a small engaged list (staff + friendly customers), then widen over 2–3 weeks.
- `docs/NEWSLETTER.md` for Indus: how to subscribe, import, compose, send, what each status means, what to do on a complaint spike.
- Publish the privacy-policy paragraph.

### Later (not in this plan)

Open/click tracking (D4), a preference centre (topics/frequency), segments beyond lists (e.g. by industry from RFQ history), first-name personalisation, A/B subject tests, signup prompts on product pages and the RFQ thank-you screen.

## 5. Deploy and cost footprint

- Phases 1–4: **4 production deploys** in total (one per PR), batched with other work where possible. Phase 0 and 5 deploy nothing.
- Sending runs in Inngest, not Vercel functions, so a 5,000-recipient campaign costs no Vercel invocations beyond the admin clicks.
- Resend: Pro plan (~$20/month for 50,000 emails) once real campaigns start.

## 6. Risks

- **Domain reputation.** Bulk mail from the same domain as quotes can drag quote emails into spam. Mitigated by D1 (subdomain) and D6 (consented lists only).
- **Inngest not connected today.** Phase 0 must land first; until then nothing scheduled or queued runs.
- **Uploaded lists without consent** are the biggest legal and deliverability risk. The import UI makes consent explicit and records it, but cannot verify it.
- **Pooler limits.** Sends run in Inngest steps with small batches, not in parallel workers, so they stay inside the Supabase connection budget.

---

## Appendix A — Phase 0 status (2026-11-08)

| Item | Status |
|---|---|
| Tile copy | **Not changed** — Ayush: the subscriber figure reflects the internal list that will be uploaded. |
| Sending subdomain in Resend | **Verified 2026-11-08.** `news.indushydraulics.com`, Tokyo region, open/click tracking off. Records added at Spaceship (zone `indushydraulics.com`): TXT `resend._domainkey.news` (DKIM), CNAME `send.news` → `send.forge.rmta.net` (return path / SPF), CNAME `rsend.news` → `rsend-apne1.forge.rmta.net`. No apex record touched; DMARC inherited from the apex (`p=none`). Receiving not enabled. |
| Inngest | **Root cause found:** `PUT /api/inngest` returns 400 — *"The function 'procurement.research.item' has higher concurrency limits (8) than your plan limit of 5"*. One function over the plan cap makes Inngest reject the whole app, so nothing has ever been registered. Fixed (limit 5) on the newsletter branch; re-sync right after it deploys. The 3 stale failed emails were marked `dead_letter` on 2026-11-08 so the retry job won't send them; the trash purge is approved to run. Before the fix, keys **were** set in Vercel production but the app had never been synced: no SEO health score has ever been written, `gsc_metric_daily` is empty, and 3 failed emails (May–Aug) have `retryCount = 0`. Syncing (`PUT /api/inngest`) turns every cron on at once — see the side effects below, which need a decision first. |
| Resend webhook | **Created 2026-11-08; enabled and returning 200 since the 2026-11-09 deploy.** `https://indushydraulics.com/api/webhooks/resend`, events delivered / bounced / complained. Resend webhooks are per account and this account also sends for another site, so the route ignores events whose From is not on `indushydraulics.com`. `RESEND_WEBHOOK_SECRET` is set in Vercel production (Sensitive). |
| Privacy-policy paragraph | Drafted below; not published (publish at launch, Phase 5). |

**What syncing Inngest switches on (checked against production data):**

| Function | First run would… |
|---|---|
| `email.retry-failed` (every 15 min) | Re-send 3 old failed emails: an `rfq_confirmation` from 2026-05-09 to a customer and two `staff_password_reset` from 2026-08-16. **Recommend marking these `dead_letter` before syncing.** |
| `media.trash.purge` (03:00) | Permanently delete 9 media files trashed 2026-09-24 → 10-08 (past the 30-day hold the media library promises). Irreversible. |
| `quote.expiry-reminder`, `quote.auto-expiry` | Nothing today — no `quote_sent` quotes in range. |
| `seo.health.recompute_all`, `gsc.daily.sync` | First ever runs; harmless (GSC sync needs its own credentials). |

## Appendix B — Privacy-policy draft (not published)

Additions to the existing sections of `/privacy` (Pages & Blocks → Privacy). Publish at launch.

**What we collect — add:**
> **Newsletter:** if you subscribe, your email address, the page you subscribed from, and the date and time you confirmed your subscription, together with the wording you agreed to. If you are added to one of our mailing lists by our team, we record that you were added, by whom, and on what basis.

**How we use it — add:**
> to send the newsletter you asked for — product news, new stock, technical articles and company updates. Every newsletter has an unsubscribe link, and most email apps also show a one-click unsubscribe button. Unsubscribing takes effect immediately.

**Who we share it with — amend the email line:**
> **Email service:** Resend, for delivery of transactional emails (quote confirmations, contact-form alerts) and of our newsletter, and for telling us whether an email was delivered or bounced. We do not track whether you open our newsletters or which links you click.

**How long we keep it — add:**
> When you unsubscribe, or an address permanently bounces, we keep a one-way encrypted fingerprint of the address so that we never email it again, even if it appears on a list later. We cannot recover the address from it.

**Also out of date, unrelated to the newsletter:** the policy still describes *account creation* and a *customer portal* (removed in #586) and names Vercel as the host. Worth correcting in the same edit.

## Appendix C — Phase 1 as built (2026-11-08)

| Piece | Where |
|---|---|
| Migration part 1 (additive) | `202611081838_newsletter_double_opt_in.sql` — **applied** 2026-11-08 via Supabase MCP. Trigger checked with `packages/db/scripts/test-newsletter-suppression.sql` (all 8 cases pass, rolls back). |
| Migration part 2 (retire `active`) | `202611081839_newsletter_retire_active_status.sql` — **applied 2026-11-09**, minutes after the deploy. The first attempt failed and rolled back: the status-sync trigger is `UPDATE OF status`, and Postgres will not change a column's type under a trigger that names it. The migration now drops the trigger for the swap and recreates it; the trigger test was re-run on the new enum (all pass, plus a check that the default is `pending`). |
| Sender | `newsletter@news.indushydraulics.com`, Reply-To `sales@indushydraulics.me`; `assertMarketingSender` refuses anything off `news.`. Sends fail until the subdomain is verified in Resend — **verify before deploying.** |
| Signup | `actions/newsletter.ts` → `lib/newsletter/service.ts`. Silent success for honeypot / under-1.5 s / dotted Gmail / hard-suppressed / 10-min resend cooldown; 5 per IP per hour, 20 per day (counted from the table, durable across instances); consent text + version stored. |
| Tokens | Confirmation: 48 hex, only its SHA-256 stored, one-time, 14 days. Unsubscribe: 48 hex, permanent, in clear. |
| Pages | `/newsletter/confirm/[token]`, `/newsletter/unsubscribe/[token]` — read only, act on a button (POST server action). Noindex, `/newsletter/` disallowed, not in the sitemap. |
| One-click | `POST /api/newsletter/unsubscribe?token=` (RFC 8058; unknown token → 200; GET → 405). The welcome email carries `List-Unsubscribe` + `List-Unsubscribe-Post`. |
| Webhook | `POST /api/webhooks/resend`, Svix-verified with `RESEND_WEBHOOK_SECRET` (503 until set, so Resend retries). delivered → `sent_emails.deliveredAt`; permanent bounce → suppress + subscriber `bounced`; complaint → suppress as `complained` + unsubscribe. Any email counts, transactional included. |
| Deviations from the plan | Suppressed for bounce/complaint = not mailed from the web form again (they can email sales). The webhook stamps `sent_emails` rather than a deliveries table (Phase 4 adds that). |

**Before the deploy** (needs a Resend sign-in): (1) verify `news.indushydraulics.com` in Resend; (2) create the Resend webhook (`email.delivered`, `email.bounced`, `email.complained` → `https://indushydraulics.com/api/webhooks/resend`) — disabled if Resend allows, otherwise its first events 404 and are retried — and put its signing secret in Vercel production as `RESEND_WEBHOOK_SECRET`. It has to be there before the build: Vercel env changes only reach new deployments, and a second deploy just for the secret is what the batch rule exists to avoid.

**After the deploy:** (1) run migration part 2; (2) `PUT https://indushydraulics.com/api/inngest` and check every function registers; (3) enable the webhook; (4) end to end on production with a real inbox: signup → confirmation → confirm → welcome → one-click unsubscribe; (5) Resend's test addresses `bounced@resend.dev` / `complained@resend.dev` through the signup form, then check `newsletter_suppressions`.

**Done 2026-11-09 (production, after the `416d39a` deploy):**

| Check | Result |
|---|---|
| Routes | `POST /api/webhooks/resend` unsigned → 401 (secret loaded); one-click `POST` → 200, `GET` → 405; `/newsletter/unsubscribe/<token>` is `noindex, nofollow`; `robots.txt` has `Disallow: /newsletter/`. |
| Migration part 2 | Applied. The legacy row is `confirmed` with `legacy-single-opt-in` consent; enum is `pending, confirmed, unsubscribed, bounced`; default `pending`; trigger recreated. |
| Inngest | `PUT /api/inngest` → `Successfully registered`, `modified: true`. |
| Signup → confirm → welcome | Through the homepage form with `delivered@resend.dev`: confirmation sent from `newsletter@news.indushydraulics.com`, `deliveredAt` stamped by the webhook; the confirm page acted only on the button; welcome sent and delivered. |
| One-click unsubscribe | `POST` with the welcome's token → 200 and status `unsubscribed`, suppression `unsubscribed`; a repeat `POST` → 200. |
| Bounce | `bounced@resend.dev` → subscriber `bounced`, suppression `bounced`, `sent_emails.bouncedAt` set. |
| Complaint | `complained@resend.dev` → subscriber `unsubscribed`, suppression `complained`, `sent_emails.complainedAt` set. |
| Webhook log | Every event 200 — including the retries of other-site events that 404'd before the deploy, now ignored by the sender filter. |

The three test subscribers, their suppressions and their four `sent_emails` rows were deleted afterwards. One real subscriber remains (the legacy row).

**Open:** the other site on this Resend account receives Indus events on its own webhook too — a permanent bounce of Indus mail could mark one of its subscribers bounced. Fix belongs in that repository (filter by From domain, as here).

---

## Appendix D — Phase 2 as built (2026-11-09)

| Piece | Where |
|---|---|
| Migration | `202611091422_newsletter_lists.sql` — **applied** 2026-11-09 (additive, ahead of the code). Lists, contacts, imports; `newsletter_contact_status_sync`; `newsletter_subscriber_status_sync` replaced to also mark list rows. Checked by `packages/db/scripts/test-newsletter-lists.sql` (all pass, rolls back). |
| Roles (D5) | `ROLES.NEWSLETTER_WRITE` (super_admin, manager, cms_editor): see everything, create/rename lists, add one address, unsubscribe someone, re-send confirmations. `ROLES.NEWSLETTER_SEND` (super_admin, manager): import, export (subscribers or a list), delete a list. |
| Admin | Sidebar **Content → Newsletter**: `/admin/newsletter` (overview tiles), `/subscribers` (status tabs with counts, email search, signup date range, CSV export, re-send confirmation per row and in bulk, unsubscribe), `/lists`, `/lists/[id]` (rename, add one, upload, search, status tabs, unsubscribe/remove per row, export, delete, upload history), `/suppressions` (counts by reason, hashed rows, check-one-address). |
| Import | CSV or Excel, read **in the browser** (`lib/newsletter/spreadsheet.ts`); columns guessed and overridable with a **manual column picker** (email, name, or first + last; header row on/off) — Bazar has no picker; preview of counts and first rows; consent checkbox. Only `[address, name]` per row is sent to the server (`toImportPairs`), which re-parses, drops suppressed addresses, inserts with `skipDuplicates`, and writes a `newsletter_list_imports` row with the consent wording, the uploader and the counts. 20,000-row cap; server-action body limit raised to 4 MB for it. |
| Never revive | An address already on the list is left exactly as it is, so a re-upload cannot reactivate someone who left; a suppressed address cannot be added by hand either. Re-confirming a subscription lifts the suppression but leaves list rows unsubscribed. |
| Re-send confirmation | Fresh one-time token per person, only for pending people last mailed > 24 h ago, hard-suppressed addresses skipped, **at most 50 per click** (Resend's free plan is 100 emails a day in all), sent through `sendEmailBatch`. |
| Webhook | A permanent bounce or complaint now also marks the address's list rows (`recordEmailEvent`), whether or not it ever subscribed. |
| Export | CSV built in memory, formula-leading cells defused (`'=…`), UTF-8 BOM for Excel. |
| Deviations | The uploaded file is **not** stored (the plan said "upload to storage"): only the two columns ever reach the server, and the import row records who, when, which file name, the consent and the counts. Exports are not logged — Indus has no admin audit table yet. |
| Tests | `lists.test.ts` (Bazar port + mapping + browser→server pairs), `admin.test.ts` (import, add, re-send, unsubscribe, filters), `service.test.ts` (webhook → list rows). |

---

## Appendix E — Phase 3 as built (2026-11-09)

| Piece | Where |
|---|---|
| Migration | `202611091444_newsletter_campaigns.sql` — **applied** 2026-11-09 (additive). Campaigns, templates, single-row sender settings. |
| Block library | `apps/web/src/lib/newsletter/blocks/` — ported from Bazar without the Arabic layer: `types`, `catalogue` (22 general blocks + `records`), `document` (normalise, refs, link/placeholder checks), `render` (table email, inline styles, **mandatory legal footer** via `renderShell` — fixes Bazar bug 6), `presets` (52), `palette`. 84 tests. |
| Records | `lib/newsletter/records.ts` — products, categories, blog articles, industries, resolved by id at render time (published only, live title/photo/link via `crawlableImageUrl`); picker search. A record unpublished later is left out of the email and flagged by the send gate. |
| Starters | New in stock, Product spotlight, From the blog, Industry update, Announcement, Blank — record blocks filled with the latest published records. Subjects are left for staff; the announcement body is a `[Write …]` placeholder the gate refuses. |
| Rich mode | The catalogue `RichTextEditor`; on render `sanitiseEmailHtml` (sanitize-html allowlist, styles only from our transforms, links http(s)/mailto/tel/site-relative, images https only) inside the same shell and footer. |
| Composer | `/admin/newsletter/campaigns/[id]`: subject, preview text, audience (subscribers and/or up to 20 lists, live reach count with suppressions out), blocks/rich toggle, block designer generated from the catalogue's field definitions (media library images, record picker, items, colours with brand swatches), autosave, live server-rendered preview in a sandboxed iframe (desktop/phone, subscriber or list-contact footer, inbox header), send gate, **test send** to the signed-in staff member with `[Test]` and a dead unsubscribe link, save as template, duplicate, delete draft. |
| Send gate | `campaignProblems` — subject, preview text and body placeholders, empty body, unfollowable links, unpublished records, no audience, deleted lists. The legal footer cannot be missing. |
| Templates | `/admin/newsletter/templates`: use, rename, delete. Saved from the composer. |
| Sender | `/admin/newsletter/settings` (`NEWSLETTER_SEND`): From name, From local part on `news.indushydraulics.com`, Reply-To; shows the subdomain's Resend verification status (`sendingDomainStatus`). |
| Deviations | No `{{token}}` system beyond `site_url`/`unsubscribe_url`, which the renderer fills. Social/person/contact blocks use text links (no icon assets). Columns don't stack on phones (no `<style>`). Confirmation and welcome emails still use the fixed `newsletter@` sender; campaigns use the settings. |

---

## Appendix F — Phase 4 as built (2026-11-09)

| Piece | Where |
|---|---|
| Migration | `202611091458_newsletter_deliveries.sql` — **applied** 2026-11-09 (additive). Deliveries, `maxPerHour`, `dryRun`, `newsletter_start_campaign`, `newsletter_claim_deliveries`. Checked by `packages/db/scripts/test-newsletter-send.sql` (all pass, rolls back). |
| Sender | `apps/web/src/inngest/newsletterSend.ts` — Inngest function `newsletter.campaign.send` on event `newsletter/campaign.send`: start → { claim 100 → send → sleep } → finish. One run per campaign (concurrency key). Hands over to a fresh run after 250 batches (25,000 recipients) to stay under Inngest's step cap. |
| Duplicate sends (Bazar bug 4) | Claim and send are separate steps, so a retried send works on the same memoised deliveries; the Resend idempotency key is a hash of the claimed delivery ids. Only rows still `sending` are sent or marked. A row left `sending` by a dead run is never re-sent — `finishCampaign` marks it failed ("outcome unknown"). |
| Per recipient | Re-checked at send time: a subscriber must still be confirmed, a contact still active, the address not suppressed — otherwise `skipped`. Each email carries the recipient's own unsubscribe link (page + RFC 8058 headers); list contacts' tokens now work on `/newsletter/unsubscribe/[token]` and the one-click endpoint. The footer says why they got it (subscriber vs list). |
| No per-email copies | Campaign mail goes through `sendCampaignBatch` (no `sent_emails` row — that table would hold the full HTML once per subscriber); `newsletter_deliveries` is the record. The webhook stamps deliveries by Resend id. |
| Actions (`NEWSLETTER_SEND`, Bazar bug 3) | Send now, schedule (5 min – 60 days ahead; the event fires at the time and does nothing if the campaign was unscheduled or rescheduled), unschedule, cancel (stops before the next batch; the rest are `skipped`). All re-run the send gate on the saved row and refuse an empty audience. |
| Pace | 300 / 600 / 1,200 / 3,000 / 6,000 an hour (batches of 100 with a computed pause). Start at 300 for warm-up. The panel warns when the audience is over 100 (Resend free plan: 100 emails a day, shared with quote mail — plan D3). |
| Rehearsal | `dryRun`: the whole pipeline — snapshot, claims, rendering, statuses, report — without calling Resend. This is how Phase 5's production dry run is done, with no environment change or deploy. |
| Report | In the composer once sending: progress bar and recipients / sent / delivered / bounced / complaints / failed / skipped / waiting, refreshing every 5 s while it sends. |
| Tests | `send.test.ts` (pace, keys, per-recipient links and headers, retries only `sending` rows, skips, rehearsal, provider failure then failed, cancel, finish/orphans), `service.test.ts` (contact tokens, delivery stamps). |

| Review fixes (2026-11-09) | An independent review found no double-send, suppression, link-leak or role path, and six defects, all fixed: autosave no longer marks an edit made during a save as saved; a run whose `start` answer was lost resumes instead of stranding the campaign; `finish` waits out young orphans and closes; `onFailure` closes a run that exhausted its retries as cancelled; a cms_editor's edit to a scheduled campaign takes it back to draft; the webhook asks Resend to retry a newsletter event that arrived before its Resend id was recorded. A rehearsal uses the campaign up (the UI says so; Duplicate to send for real). |

### After the batch deploy (Phases 2–4)

1. `PUT https://indushydraulics.com/api/inngest` — registers `newsletter.campaign.send`.
2. In the admin: create a list with staff addresses only, compose from a starter, send yourself a test, then **Rehearse** to the list and check the report.
3. Phase 5 below.
