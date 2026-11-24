# Indus Operations — rules for `apps/ops` and `packages/ops-*`

Read this file in full before changing anything under `apps/ops`, `packages/ops-core`, `packages/ops-db`,
`packages/ops-ai`, `packages/ops-pdf`, `packages/ops-ui` or `packages/intake`. The root `CLAUDE.md` still applies;
where the two differ for Ops code, this file wins. Every rule has a reason; do not break a rule because the reason
seems not to apply.

Toolchain (since the CI batch #654–#668): Bun workspaces with the exact canary pinned in `package.json`
`packageManager`; `bun check` (TypeScript 7) for types; `bun lint --type-aware` with the root `.oxlintrc.json`;
`bun fmt`; `bun test --parallel --isolate=modules --randomize`. Lint runs once from the repo root, so packages have
no lint script. Git hooks (`hk install`, `hk.pkl`) run format and lint on commit and the CI checks on push.

## 1. What Ops is

Indus Operations is a private, desktop-first console at `operations.indushydraulics.com` that runs the trading cycle
of Indus Hydraulic Power Trading LLC: client enquiry → supplier RFQs → supplier quotes → compare on landed cost →
priced INDUS/Q quotation → client PO → order documents, inspection, freight, delivery, tax invoice → money. Users are
the Owner (KB) and the Helper (AB). The Assistant is an actor that runs server-side on the Anthropic API.

It is separate from the website and its `/admin`: its own app (`apps/ops`, `@indus/ops`), Vercel project
(`indus-operations`, region bom1), Auth.js instance and cookies, Postgres schema (`ops`) and role (`ops_app`),
Inngest app (`indus-operations`), Sentry project and Storage buckets. It shares the public GitHub repository, the
Supabase project and the Vercel team. Gmail is the record of correspondence; Zoho Books is the ledger.

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict (`tsconfig.base.json`), `typedRoutes: true` |
| Styling | Tailwind CSS v4 with generated `@theme inline` tokens from `packages/ops-ui/tokens/tokens.json` |
| Components | `@indus/ops-ui` (13 kits, templates T1–T12 + X1, shell). Radix only for Dialog, AlertDialog, Popover, DropdownMenu, Tooltip, Tabs, Slot |
| Data | Prisma 6 client generated to `packages/ops-db/generated/client`, schema `ops`, Supabase Postgres through the Supavisor transaction pooler |
| Auth | Auth.js v5, own instance in `src/lib/auth.ts`: Google (Internal OAuth app, `hd=indushydraulics.me`) or password + TOTP |
| Jobs | Inngest app `indus-operations`, served at `/api/inngest`, function ids `ops.*`, events `ops/*` |
| AI | Anthropic Messages API through `@indus/ops-ai` (server-only). Models: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5` |
| Mail | Gmail API for all business mail (sales@, purchase@); Resend for system mail only (visitor acknowledgements, brief, sign-in notices) |
| Files | Supabase Storage, private buckets `ops-mail`, `ops-documents`, `ops-uploads`, `ops-company`, `ops-imports`, `ops-evals`, `ops-backup` |
| PDF | `@react-pdf/renderer` in `@indus/ops-pdf`, from the same `DocumentData` as the HTML `DocumentPage` |
| Tests | `bun test` (unit, guards; files import from `vitest`, which bun test provides), Playwright (e2e, visual regression, local design parity), axe, evals |

## 3. Packages and the dependency rule

1. `apps/ops` may import `@indus/ops-core`, `@indus/ops-db`, `@indus/ops-ai`, `@indus/ops-pdf`, `@indus/ops-ui`,
   `@indus/intake`. Nothing else from the workspace. *Reason: anything shared with the website rebuilds the
   storefront and wipes its ISR cache.*
2. `apps/ops` never imports `@indus/db`, `@indus/ui`, `@indus/email`, `@indus/pdf`, `@indus/domain`, `apps/web/**`
   or `next-auth/react` (enforced by `no-restricted-imports` in the root `.oxlintrc.json`). *Reason: deploy coupling and the wrong auth instance.*
3. `@indus/ops-core` is pure TypeScript + Zod: no I/O, no `node:` imports, no React, no Prisma. Every business rule
   (money, pricing, landed cost, FX, VAT, numbering formats, calendars, send slots, Autopilot levels, identity scan,
   state machines, reference parsing) is written down here and only here. *Reason: one tested home per rule.*
4. `ops-ai → ops-core`; `ops-pdf → ops-core`; `ops-ui → ops-core` (types and format only). `package-deps.test.ts`
   asserts these edges.
5. `apps/web` may import only `@indus/intake` from the Ops side.
6. Lifted website engines are **copied** into `ops-core`, `ops-ai` or `ops-pdf` and adapted there with their tests;
   the originals are not imported and are deleted at cutover cleanup.
7. `@indus/ops-crosscheck` (`packages/ops-crosscheck`, S18-T01) is a private, test-only package: devDependencies
   `@indus/ops-core` and `@indus/domain`, a `test` script and nothing else. No app and no package imports it, so a
   change to it affects neither Vercel project (the S00-T03 ignore-script test has the case). It is the only Ops
   package allowed to see `@indus/domain`, and only to prove the two token formats never verify each other.

## 4. Styling, tokens and type

1. **Tokens only.** Colours, radii, shadows, sizes and z-order come from `packages/ops-ui/tokens/tokens.json`
   (+ the named `ext` block), generated by `bun run --filter @indus/ops-ui tokens` into `src/styles/tokens.css`,
   `theme.css`, `tokens.pdf.ts`. Never edit generated files; `tokens.drift.test.ts` fails if you do.
2. **Bare `io-` utilities**: `bg-io-card`, `text-io-ink-3`, `border-io-line`, `rounded-io-card`, `shadow-io-e2`,
   `w-io-sidebar`. Tailwind's default palette, fonts, radii and shadows are wiped, so `bg-blue-500` or `rounded-lg`
   compiles to nothing, and `token-usage.test.ts` fails on any `io-` class that does not resolve. *Reason: an
   undefined token renders a wrong colour silently.* (Ops does not use the website's `bg-[var(--color-x)]` form.)
3. **No colour literals** (`#hex`, `rgb(`, `hsl(`, `oklch(`) in `className` or `cva` strings.
4. **No inline `style=`** anywhere in `apps/ops/src` or `packages/ops-ui/src`. Data-driven geometry (bars, Gantt,
   progress) is SVG presentation attributes. `packages/ops-pdf` is exempt because `style` is react-pdf's API.
5. **No monospace anywhere.** Never write `font-mono`, `monospace`, `ui-monospace`, `JetBrains`, or a `mono` class.
   `--font-mono` maps to Geist. Part numbers, SKUs, quantities, dates, money and refs are Geist with tabular
   numerals (set globally on `body`). `ops-no-mono.test.ts` fails the build; it scans `apps/ops/src` (every route
   group, `(client)` included), `packages/ops-ui/src` and `packages/ops-pdf/src` (font registration may register only
   Geist and Instrument Serif; `Courier` is banned). The only non-Geist face is the Mail
   kit `Email` part, which renders an outbound email in Arial as the recipient sees it.
6. **Two families.** Geist 400/500/600 for all UI and data; Instrument Serif 400 only for section (40), greeting
   (32), record (30) and document (54) titles. Never put a weight class on a serif element. KPI numerals are
   Geist 500 24.
   *(decision, S02-T09)* next/font's Geist ships only the Google subsets (latin, latin-ext, cyrillic, plus
   vietnamese/cyrillic-ext faces), and none of them carries → (U+2192) or ↗ (U+2197); `latin` has only ↑ and ↓.
   Those two arrows therefore render in the system fallback face. Accepted: they are decorative link affordances
   and their metrics stay within the line box. Do not switch to `next/font/local` or a lucide icon just for them
   without a design decision.
7. **Radius ladder**: `rounded-io-paper` 2 (A4), `-tag` 4, `-ctl` 6 (buttons, fields), `-card` 10 (cards, tables,
   banners, toasts, menus), `-dialog` 14, `-pill` 999. Cards at rest have a 1px `io-line` border and no shadow.
8. **Focus is never removed.** Use the `io-focus` and `io-focus-field` utilities. Reduced motion drops transforms
   and keeps 100 ms fades.
9. **One primary action per view.** If a screen seems to need two, one is secondary. An e2e assertion checks it.
10. **Component conventions**: one file per kit part named after the part; cva variants named after the kit props;
    every variant sets its own border colour; real states are props reflected to `data-state` / `aria-*`, hover
    and focus are CSS; RSC by default, `'use client'` only for state, effects, refs or handlers; no shadcn, cmdk or
    chart libraries (charts and Gantt are SVG); icons are `OpsIcon` (the 13 sidebar paths) and `lucide-react` at
    `strokeWidth={1.75}`.
11. Desktop only (boards are 1440 × 940, minimum 1280; the sidebar collapses to 64 below 1440; below 1024 a
    "built for a desktop browser" notice). Client pages under `(client)` are the one responsive surface, with
    44 px buttons.

## 5. Routes and authorization

1. Route groups: `(auth)` (`/sign-in`, invite, reset, two-factor), `(console)` (everything signed-in inside
   AppShell), `(setup)` (`/welcome`, `/setup/[step]`: the Owner's first run, signed in but drawn without AppShell
   because T11/T9 own the page's `<main>`; each page still calls `requireOpsUser()` and the proxy protects both
   paths), `(client)` (`/q/[token]`, `/d/[token]`, `/s/[token]`, `/u/[token]`, `/q/legacy/[code]`), `(kit)`
   (`/_kit`, `OPS_KIT`-gated, never in production), `api/*`. Every route renders per request: the root layout
   awaits `connection()`, because a prerendered page carries no CSP nonce and the browser refuses its scripts.
   A `loading.tsx` or `template.tsx` must not reach a `'use client'` module, not even through a kit barrel: Next
   renders those boundaries' chunks as `<script>` tags without the nonce (`loading-client-free.test.ts`,
   `tests/e2e/csp.spec.ts`).
2. `src/proxy.ts` is **default-deny**: an explicit allow-list of public paths, each of which verifies itself
   (Auth.js, signed document tokens, Inngest signature, Pub/Sub OIDC JWT, Zoho and Resend signatures, health/live).
   Every response carries `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`, CSP with nonces, HSTS,
   `X-Frame-Options: DENY`. `robots.txt` disallows everything.
3. Authorization never lives in a layout. Every page and every action calls `requireOpsUser()` (or
   `requireOwner()`); the proxy also verifies the session token (`kind === 'ops'`, `sid` not revoked). Never
   default `kind`.
4. Owner-only operations (approve and send a client quotation, approve supplier POs, approve supplier payments,
   bank call-backs, Autopilot and guardrails, numbering, bank accounts, data deletion, pause/resume, export) are
   checked in `defineAction` and, for quotation, PO and payment approvals, again by database triggers.
5. Helper flags (`canSeeMargins`, `canSendSupplierMail`, `canEditChaserRules`) are read from the session's user row
   on the server. Margins are masked in data mappers and in search, not only in the UI.
6. Every data segment has `loading.tsx`, `error.tsx` and `not-found.tsx`. A known-format reference that is missing
   renders the "not imported" state (board 211).
7. Why? is an intercepting route in the `@drawer` slot; record-local drawers use search params.
8. Client pages never read a console session, set `Cache-Control: private, no-store` and
   `Referrer-Policy: no-referrer`, and render only `ClientSafe*` DTOs.

## 6. Data access

1. Page reads: RSC → `src/data/*` (`import 'server-only'`) → Prisma. At most two queries per request (or one with
   `include`); keyset pagination at 50 rows; table state in URL search params validated by a Zod schema per index.
2. Mutations: only through `defineAction({ name, schema, roles, handler, audit })` in `src/lib/define-action.ts`,
   returning `Result<T> = { success: true; data: T } | { success: false; error: string; fieldErrors? }`. Zod
   validation, roles from the session, an idempotency key for approve / send / pay, an audit row, then
   `revalidatePath` for the segment and a bump of the affected live-count keys.
3. Segment actions live in `src/app/(console)/<segment>/actions/`; cross-cutting ones in `src/actions/`.
4. No client-side `fetch()` to internal routes. Client panels read through read actions.
5. Prisma is imported only in `src/data/**`, `src/server/**`, `src/inngest/**` and `packages/ops-db`. Domain
   services live in `src/server/<domain>/` and call pure rules in `@indus/ops-core`.
6. Never expose a Prisma error, stack trace, model output or provider error to the browser. Log it to Sentry with
   the request id; return a safe message.
7. Every Assistant mutation of business data goes through `writeTracked()` (field before/after, `actionId`).
8. Money is `numeric(18,4)` + currency, FX `numeric(20,10)` AED per unit; parse and compute money only with the
   `ops-core/money` helpers, never with floats in components.
9. Ids are UUIDv7; human refs (ENQ-, IH-RFQ-, INDUS/…, SO-) are separate unique columns. No generic soft delete.
10. Content and configuration are database rows (`settings_entry`, templates, terms, guardrails, cadences, help,
    numbering patterns, email copy), read through `getSetting(key)`. Never hard-code a threshold, wording or
    pattern that the handoff marks *default*: seed it with `signoffStatus = 'awaiting'`.
11. Environment variables are read only through `src/lib/env.ts` (Zod-parsed at boot; production fails to boot if a
    required one is missing). Never read `process.env` elsewhere.

## 7. Connection budget (ADR-04)

The Supavisor pooler is shared with the storefront and has failed three times. Ops stays at or below 15 clients.

1. `DATABASE_URL` is role `ops_app` through the transaction pooler with
   `pgbouncer=true&connection_limit=1&pool_timeout=20`. Do not raise it.
2. **No database access at build time.** Every route is dynamic; no `generateStaticParams`; CI builds with a dead
   database URL.
3. `/api/gmail/push`, `/api/zoho/webhook`, `/api/webhooks/resend` and `/api/inngest`'s serve handler verify and
   `inngest.send` only; they never touch Prisma.
4. **Never hold a connection across a model call.** Inngest functions do `load → step.run(ai) → step.run(write)`;
   the AI step takes and returns plain data.
5. Every Inngest function is defined with `defineOpsFunction()`, which requires a `lane` (live / bulk / house,
   `src/inngest/plan.ts`) and a `pause` behaviour, and may add one `perKey` limit inside the lane. The plan is the
   free plan: 5 concurrent steps account-wide, shared with the website; the lanes (2 + 1 + 1) plus a website reserve
   of 1 fit it (decision 2026-11-23, `docs/infra-decisions.md` §1). `src/inngest/concurrency.test.ts` checks every
   function sits in one lane. A new function picks its lane and adds its row to §16 below; never a slot of its own.
6. Bulk work runs in transactions of at most 500 rows with `step.sleep` between batches, and never within an hour of
   a storefront deploy or an IndexNow burst.
7. `statement_timeout` 15 s on `ops_app`. Every list screen's `WHERE` / `ORDER BY` has an index in the migration
   that creates the table.
8. `/api/health` reports `ops_app` connections and alerts above 12.

## 8. Sending email (ADR-07, ADR-11)

1. **Every email goes through one queue**: an `outbound_email` row (`channel = gmail | system`) with an idempotency
   key, sent by `ops.mail.send`. Nothing else calls `users.messages.send` or Resend.
2. Status is forward-only: `draft → scheduled → (held) → sending → sent | failed | unknown | cancelled | superseded`.
3. The server owns a **5-minute undo** (`undoUntil`); the UI shows the server's remaining milliseconds. Undo returns
   the proposal as it was, with the person's edits kept, and releases any number it consumed.
4. `ops.mail.send` has `retries: 0`. It sleeps to `undoUntil`, computes the send slot (working hours, supplier local
   morning, Ramadan, caps), re-runs `sendGate` (pause, mailbox live, caps, guardrails, `basis_hash`, credit hold,
   identifier check on the exact bytes, attachments present), then claims `scheduled → sending` and sends once.
   An ambiguous result is reconciled by searching Sent for `X-Indus-Outbound`. **Never resend automatically.**
5. Client mail goes from sales@ in the client's thread; supplier mail from purchase@ in the supplier's thread.
   Never switch mailbox for a thread.
6. Outside production every send is recorded as `suppressed_preview` unless the recipient is in
   `OPS_SEND_ALLOWLIST`.
7. The Gmail client wrapper exports an allow-list of methods. Never call delete, trash, untrash, import, insert,
   filters, forwarding, or remove a system label; `gmail-allowlist.test.ts` fails the build. Ops writes only
   `Indus/*` labels.
8. Pause holds queued sends; on resume every held send is re-gated and stale ones become redrafts.

## 9. The Assistant (ADR-08 – ADR-13)

1. The Assistant runs on the Messages API via `@indus/ops-ai` with `OPS_ANTHROPIC_API_KEY`. No Agent SDK, no
   Managed Agents, no dependency on a Claude Code subscription. The SDK Tool Runner is used only for supplier
   research (web search and fetch server tools, per-turn cost check).
2. **Fixed rules (constants in `ops-core/autopilot/levels.ts`, never data):** #20 `send_quotation` and #28
   `supplier_pos` are locked Draft and ask; #32 `supplier_payments` is Never; imported or backfilled mail never
   causes an external effect. `resolveLevel()` can only lower autonomy (property-tested).
3. The Assistant never: sends a client price without the Owner; raises a supplier PO without a person; moves money
   (it prepares a checked payment instruction); deletes, archives or trashes mail; writes an **Unsure** value into
   a record; acts while paused; emails anyone during history import; chases a client about quotation validity.
4. **Numbers are computed in code**, never by the model: money parsing, landed cost, margins, FX, totals, VAT,
   dates. A model may cite a figure only through a placeholder that code fills, and its output is checked for
   stray digits.
5. Every action is one `assistant_action` row with an immutable proposal (headline, reasons with source span ids,
   preview, checks, confidence, unsure items, options, on-approve sentence) and an append-only event trail. One
   `ProposalCard` renders every type. `basis_hash` makes a stale proposal unapprovable.
6. **Why?**: models return verbatim quotes; the server resolves each into a `source_span`. Unresolved means Unsure.
   Confidence (Sure / Likely / Unsure) is computed by code checks, not the model's self-report.
7. Structured output via `output_config.format` (JSON schema) validated with Zod; check `stop_reason` before
   content; one retry with the validation error; refusal → fallback model → Unsure card. No `temperature`; explicit
   `effort`.
8. Model routing lives in the model registry (DB-priced), not in action code: Haiku for classification and
   tie-breaks; Sonnet for extraction, capture, drafting, identifier model check; Opus for research and Compare
   narratives, and as escalation (> 15 pages or > 20% Unsure).
9. Prompts are versioned code: `src/server/assistant/prompts/<action-key>.v<N>.ts`; every `ai_call` row records
   `promptVersion` and cost. Byte-stable system prefixes for prompt caching. Prompts describe mechanisms, never
   counterparties.
10. Every call **reserves budget first** (`ai_budget_reserve`); a refused reservation fails the action with reason
    `budget`. Research has a per-enquiry cap.
11. A prompt or model change runs the eval suite by hand first (`bun run --filter @indus/ops eval …`); scores and cost
    go in the PR. The golden set lives only in the private `ops-evals` bucket.
12. Learned preferences shape wording and choices; they can never override a fixed rule or a deterministic check.

## 10. Identities never cross (ADR-13)

1. A client's identity (names, aliases, domains, emails, contacts, phones, client refs, client part numbers, sites,
   vessels, projects, the ENQ ref) **never reaches a supplier**: not in a body, subject, attachment, file name,
   PDF/XLSX/DOCX metadata or research query.
2. A supplier's identity, supplier refs, costs, margins and internal notes **never reach a client**: not in a
   quotation, relay, regret, client pack or client page.
3. The identifier check (`ops-core/identity` deterministic scan + `src/server/identity/check.ts` model check) runs
   at proposal build, at approval and in `sendGate` for every supplier-bound message and file, and in reverse for
   client-bound output. A deterministic hit hard-blocks. A model finding blocks unless the Owner overrides with a
   logged reason.
4. Builders for client output take only `ClientSafe*` types; builders for supplier output take only
   `SupplierSafe*` types. Do not add a supplier field to a `ClientSafe*` type, ever.
5. The adversarial identifier eval must keep 100% recall.

## 11. Migrations and the database

1. Ops migrations live in `packages/ops-db/migrations/`, named `YYYYMMDDHHMM_ops_<snake_case>.sql`. Get the name
   from `packages/ops-db/scripts/new-migration.sh <snake_name>`; never type a timestamp. Every file is listed in
   `migrations/README.md`. `migration-filenames.test.ts` checks both migration folders and prefix uniqueness across
   them.
2. Write idempotent SQL (`IF NOT EXISTS`, `CREATE OR REPLACE`, `ON CONFLICT DO NOTHING`). Forward-only: never edit
   a file that has been applied anywhere; write a new one.
3. Apply locally with `bun run --filter @indus/ops-db db:apply:local` (refuses non-local hosts). Apply to production
   **before the PR merges**, only after the "no hosted build in flight" check, with
   `(cd packages/ops-db && bunx prisma) db execute --url "$OPS_MIGRATION_URL" --file migrations/<file>.sql`,
   then `bun run --filter @indus/ops-db db:generate`, then the sprint's verification SQL.
4. **Never** `prisma db push`, never `prisma migrate dev` against the shared database. `db:push` is disabled.
5. Lifecycle states are Prisma enums. `ALTER TYPE … ADD VALUE` ships ahead of code; no row may use the new value
   until the deploy with the regenerated client is live. Open vocabularies are text + CHECK or lookup rows.
6. RLS is on for every `ops` table with explicit `ops_app` policies; the schema is not exposed to PostgREST.
   `ops_app` has no privilege on `public`; website data is read only through views owned by `postgres` in `ops`
   and the SECURITY DEFINER functions the architecture names.
7. Append-only tables (`assistant_action_event`, `activity_event`, `auth_event`, `ai_call`, `share_link_event`,
   `zoho_sync_log`) are enforced by grants and triggers. Retention purges run as `ops_maint`.
8. Numbers come only from `ops.allocate_number()` inside the transaction that commits the approval;
   `release_number()` only from undo paths where nothing left the building.
9. Large indexes: `CREATE INDEX CONCURRENTLY` over the direct URL, then check `indisvalid`.

## 12. The public repository

1. **No supplier or principal name, client name, bank detail, IBAN, TRN, address, mail content or real figure** in
   any file, fixture, snapshot, test name, branch name, commit message or PR text. Supplier SKUs and storage keys
   carry no supplier initials.
2. Fixtures use only neutral names: "Example Valve Co", "Sample Client LLC", "TEST BANK", TRN `000000000000000`.
3. The handoff and the plan live outside the repo (`$OPS_DESIGN_REF_DIR`, `$OPS_PLAN_DIR`). Nothing is copied from
   the handoff except token values (via `tokens.json`) and the 13 sidebar icon paths.
4. Before every commit and push run the leak check:
   `git diff origin/main... | grep -qiEf ~/.config/indus/supplier-denylist.txt && echo STOP || echo clean`
   (also on `git diff --cached` and `git log origin/main..HEAD --format=%B`). CI's `repo-leak-guard` repeats it
   with the `SUPPLIER_DENYLIST` secret, and `public-repo-secrets.test.ts` scans for IBAN and TRN patterns.
5. Design-parity screenshots and diffs go to `$OPS_EVIDENCE_DIR` / `$OPS_SCRATCH`, never to the repo. Committed
   visual baselines use neutral fixtures only.

## 13. Testing

1. Vitest everywhere. Tests sit next to the code (`thing.ts` + `thing.test.ts`).
2. Every state machine in `ops-core/state/` has 100% transition coverage. Table-driven tests for send slots,
   calendars, pricing, landed cost, numbering formats, `parseReference`, the identifier scan. Property tests
   (fast-check) for `resolveLevel`.
3. Guard tests that fail the build — never edit one to make a change pass: `ops-no-mono`, `tokens.drift`,
   `token-usage`, `no-colour-literals`, `no-inline-style`, `gmail-allowlist`, `package-deps`, `ops-core-purity`,
   `inngest concurrency`, `migration-filenames`, `public-repo-secrets`, `no-restricted-imports` (root `.oxlintrc.json`),
   `no-payment-without-person`.
4. Playwright projects: `ops-e2e` (disposable Postgres, mocked Google, TOTP path, proxy default-deny, approve/undo,
   `/q` tokens, intake), `ops-visual` (committed baselines on neutral fixtures: `/_kit` and one screen per template),
   `ops-visual-design` (local only: parity with `screens/png/<board>.png` at 1440 × 940, DPR 1, clock frozen,
   `maxDiffPixelRatio 0.02`), `client-mobile` (390 × 844, DOM scan proving no supplier name or cost).
5. axe runs on every route; critical and serious findings fail. Keyboard-only journeys are part of e2e.
6. Evals: synthetic fixtures in `apps/ops/evals/`; the golden set in the private `ops-evals` bucket
   (`OPS_EVALS_BUCKET_READ=1`, local only). Bars: classification ≥ 97% on non-Unsure with Unsure ≤ 8%; extraction
   quantity exact 100%, price exact ≥ 99%; identifier recall 100%.

## 14. Session protocol (every task)

Every task prompt starts from this frame:

```text
Context: Indus Operations, sprint SNN, task SNN-Tnn. Worktree: <path>. Branch: feat/ops-sNN-<slug>.
Read first: apps/ops/CLAUDE.md; 10-architecture.md ADR-<ids>; handoff screens/<section>.md for boards <n…>;
            handoff components/<kit>.md for parts used; the board PNGs in $OPS_DESIGN_REF_DIR/screens/png.
Do: <the task detail>.
Rules: no monospace, no inline style, tokens only; server actions via defineAction; pure rules in ops-core;
       Prisma only in src/data and src/server; no supplier or client names in code, fixtures, commits;
       migrations named $(date +%Y%m%d%H%M)_ops_<name>.sql and listed in the README table.
Verify: bun run typecheck && bun run lint && bun run format:check && bun run test
        bun run --filter @indus/ops test:e2e -- --grep "<board>"          (when the task has a route)
        bun run --filter @indus/ops test:visual:design -- --grep "<board>" (local parity vs PNG)
        git diff origin/main... | grep -iEf ~/.config/indus/supplier-denylist.txt   (must be empty)
Commit: <type>(ops): <summary> (SNN-Tnn) with the attribution trailer.
```

Inside a task: do not commit or push (the builder commits after review); stay inside the task's files; when the
task text and `10-architecture.md` disagree, follow the architecture and say so in the report as a "(decision)";
end with "Stop and report" (files changed, tests and counts, verify output, decisions, anything not done).

## 15. Git, commits and deploys

1. Branch per sprint: `feat/ops-sNN-<slug>`; hotfixes `fix/ops-<slug>`. Never push to `main`. Squash merge only.
2. Conventional Commits. Scopes: `ops` (cross-cutting) or `ops-<area>`: `ops-infra`, `ops-ci`, `ops-db`, `ops-ui`,
   `ops-shell`, `ops-auth`, `ops-settings`, `ops-mail`, `ops-assistant`, `ops-review`, `ops-autopilot`, `ops-today`,
   `ops-intake`, `ops-enquiry`, `ops-directory`, `ops-docs`, `ops-numbering`, `ops-sourcing`, `ops-research`,
   `ops-quotes`, `ops-compare`, `ops-pricing`, `ops-quotation`, `ops-client`, `ops-import`, `ops-zoho`, `ops-cutover`,
   `ops-orders`, `ops-freight`, `ops-money`, `ops-parts`, `ops-notify`, `ops-search`, `ops-tenders`, `ops-reports`,
   `ops-help`, `ops-states`, `ops-security`. Subject ends with the task id, e.g.
   `feat(ops-sourcing): reserve one IH-RFQ ref per trade group (S12-T01)`.
3. Every commit ends with the attribution trailer the session provides.
4. One sprint = one batch PR = one production deploy. Previews are opt-in with `[preview]` in a commit message.
   Content and configuration edits are Settings changes on production, not deploys.
5. Only S00, S19 and S21 change `apps/web` or shared root config. Anything else that would is a plan change.

## 16. Background jobs

Register every function in `src/inngest/functions.ts` through `defineOpsFunction`. Ids `ops.<area>.<verb>`, events
`ops/<area>.<event>` (never `procurement/*`). Crons carry an explicit zone (`TZ=Asia/Dubai …`) unless they run every
few minutes. Every function declares concurrency, retries, idempotency and pause behaviour (`wait`, `skip`,
`record_only`, `exempt`). The full planned catalogue is Appendix E of the prompt book; add a row here when a
function ships.

| Function | Trigger | Lane (+ per key) | Retries | Pause | Sprint |
|---|---|---|---|---|---|
| `ops.system.heartbeat` | cron `*/10 * * * *` | house | 0 | exempt | S00 |
| `ops.mailbox.on-connected` | `ops/mailbox.connected`, `ops/mailbox.reconnected` | live + mailbox · 1 | 3 | exempt | S04 |
| `ops.gmail.sync` | `ops/gmail.notified`, `ops/gmail.poll.tick` (debounce 3 s) | live + address · 1 | 3 | record_only | S04 |
| `ops.gmail.poll` | cron `*/10 * * * *` | house | 1 | skip | S04 |
| `ops.gmail.watch.renew` | cron `TZ=Asia/Dubai 10 3 * * *` | house | 3 | exempt | S04 |
| `ops.gmail.message.fetch` | `ops/gmail.message.fetch` | live | 4 | wait | S04 |
| `ops.gmail.message.fetch.backfill` | `ops/gmail.message.fetch.backfill` | bulk | 4 | wait | S04 |
| `ops.gmail.backfill` | `ops/gmail.backfill.requested`, `ops/gmail.backfill.continue` | bulk | 5 | wait | S04 |
| `ops.mail.send` | `ops/mail.send.requested`; cancelOn `ops/mail.send.cancelled` | live + mailbox · 1 | **0** | exempt (the gate holds) | S04 |
| `ops.mail.send.reconcile` | cron `*/15 * * * *` | house | 2 | exempt | S04 |
| `ops.gmail.health` | cron `*/5 * * * *` | house | 0 | exempt | S04 |
| `ops.mailbox.purge` | `ops/mailbox.purge.requested` (continues itself past 400 batches) | bulk | 2 | exempt | S04 |
| `ops.assistant.run` | `ops/action.requested` (idempotency `event.data.idempotencyKey`) | live + recordKey · 1 | 2 | wait | S05 |
| `ops.mail.route` | `ops/mail.received`, `ops/mail.classified` | live | 3 | wait | S05 |
| `ops.gmail.labels.apply` | `ops/mail.classified`, `ops/mail.linked`, `ops/review.changed` | live + messageId · 1 | 4 | wait | S05 |
| `ops.mail.bounce.soft` | `ops/mail.bounce.soft` (sleeps 24 h) | house | 2 | wait | S05 |
| `ops.assistant.on-resumed` | `ops/assistant.resumed` | house | 2 | exempt | S05 |
| `ops.assistant.backlog` | `ops/assistant.pipeline.enabled` (200 a batch, 2 s apart) | bulk | 2 | wait | S05 |
| `ops.clocks.tick` | cron `*/15 * * * *` (each registered clock, ≤ 200 items) | house | 2 | skip | S06 |
| `ops.autopilot.suggestions` | cron `TZ=Asia/Dubai 30 1 * * *` (earned suggestions; never changes a level) | house | 2 | skip | S07 |

## 17. Assistant actions

Action keys are the constants in `packages/ops-core/src/autopilot/keys.ts`, seeded into `ops.autopilot_action_def`
by S03-T06. A later sprint adds a key with one `INSERT … ON CONFLICT DO NOTHING` in its `<ts>_ops_sNN_action_defs.sql`,
the key in `ACTION_KEYS`, and (if it emails anyone outside Indus) the key in `SENDS_EXTERNALLY`, in one commit;
`autopilot-catalogue.guard.test.ts` parses every such migration and fails on a mismatch. Priced client sends
(`PRICED_CLIENT_SENDS`: #20, #26, #27, #31) are locked or capped at Draft and ask, and the send gate refuses a
priced client email without a person's `approvedById`. Each action is a module
`src/server/assistant/actions/<kebab-key>.ts` (gather → propose → verify → decide by level → effect → record),
with its prompt in `src/server/assistant/prompts/<kebab-key>.v<N>.ts` when it calls a model. The full mapping is
Appendix F of the prompt book.
