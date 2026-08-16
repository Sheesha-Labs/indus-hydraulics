# AUDIT — design language v2 · Phase 0

**Date:** 16 August 2026
**Repo:** `indus-hydraulics` @ `8094e3c`
**Method:** thirteen parallel agents over `apps/web`, `packages/*` and `design-source/`, plus an
adversarial pass that refuted or confirmed each finding. Counts were re-verified by grep and, for
the token question, by compiling the real app through Tailwind 4.2.4 and reading the output CSS.

This answers the seventeen questions in `04-audit-and-migration.md` §Phase 0. The execution plan
that follows from it is a separate artefact.

---

## 0 · Headline

**This is a reskin at scale, not a rebuild.** Almost every route the handoff describes already
exists — including seven surfaces it lists as net-new. The handoff was written without reading
this codebase and its scope framing is wrong in both directions: it over-counts new work and
under-counts total work.

| | |
|---|---|
| Artboards in the package | 63 (4 of them are feature builds mislabelled as reskins) |
| `page.tsx` in the repo | **94** — 40 storefront, 54 admin |
| Renderable files (pages + layouts + route handlers + error pages + OG image) | **124** |
| Admin routes covered by an artboard | 13 of 54 |
| Colour references that flip with the token layer | 4,626 across 204 files |
| Hard-coded style values that do **not** | 8,838 arbitrary utilities + ~875 raw colour literals |
| Build health at audit time | typecheck ✅ lint ✅ (4 warnings) tests ✅ |

---

## Styling architecture

### Q1 · What styles the app today

Tailwind CSS v4, single stylesheet, no CSS modules, no styled-components. One
`@theme` block in `apps/web/src/app/globals.css` (225 lines) is the entire token layer. Admin
deltas are scoped by a `[data-surface='admin']` attribute in the same file.

Other CSS in the repo: none. `packages/ui` ships no stylesheet; `packages/email` and
`packages/pdf` carry inline styles because that is their rendering API.

### Q2 · Is there a token layer

Yes, and it is healthier than the handoff assumes — this is the single most important finding in
the audit.

`globals.css:9` opens `@theme {`, **not** `@theme inline {`. Compiled output confirms the
consequence: tokens land as real custom properties on `:root, :host`, and every consumer compiles
to a live `var()` reference rather than an inlined literal.

```css
.text-\[var\(--color-muted\)\] { color: var(--color-muted) }
.rounded-sm                    { border-radius: var(--radius-sm) }
.font-mono                     { font-family: var(--font-mono) }
```

**Therefore changing a token value rebrands every consumer with zero `.tsx` edits.** A ~60-line
edit to one file recolours 4,626 references across 204 files. Nothing else in this programme has
that leverage.

### Q3 · Hard-coded colour outside the layer

| Category | Count |
|---|---|
| Hex literals | 264 |
| Raw `oklch()` literals (177 distinct values) | 531 |
| Tailwind default-palette classes (`bg-slate-*` etc.) | 78 |
| **Total immune to any token change** | **~875** |

Worst concentrations — this is the search-and-destroy list:

| File | Sites | Note |
|---|---|---|
| `components/admin/AdminSidebar.tsx` | 30 hex | Hard-codes chrome that four unused `--color-sidebar-*` tokens already exist for |
| `packages/ui/src/Badge.tsx` | 60 palette classes | Ignores the token layer completely |
| `app/admin/{sign-in,forgot-password,activate}` | ~60 hex | Three auth pages |
| `packages/domain/src/types.ts` | 18 | Status colours in domain code |
| `packages/db/src/seed-industries.ts` | 12 | Seeded gradient strings |
| `packages/email/src/templates/*` | 85 | **Legitimate** — mail clients strip `<style>` |
| `packages/pdf/src/EstimatePDF.tsx` | 78 | **Legitimate** — `style` is `@react-pdf/renderer`'s API |

> The last two must not be "cleaned up". An earlier count of "273 inline `style=` props across 47
> files" conflated all three groups; acting on it breaks the PDF and email renderers. The genuine
> target is 98 `style={{}}` occurrences in `apps/web` + `packages/ui`.

### Q4 · Where the orange and the warm greys live

They live in the token layer, not at the call sites — which is why the cutover is cheap.
Per-token blast radius, descending:

| Token | Refs | v2 counterpart | Risk |
|---|---:|---|---|
| `--color-muted` | 1,136 | `--ih-muted` | routine |
| `--color-border` | 1,011 | `--ih-border` | warm → cool; the most *visible* single change |
| `--color-accent` | 536 | `--ih-accent` | orange → blue; the most *violent*, and the intended one |
| `--color-primary` | 449 | `--ih-ink` | neutral → blue-black |
| `--color-elevated` | 332 | `--ih-surface` | identical value (`#ffffff`) — free |
| `--color-body` | 330 | `--ih-ink-2` | routine |
| `--color-deep` | 279 | `--ih-surface-2` | routine |
| `--color-surface` | 182 | **`--ih-bg`, not `--ih-surface`** | ⚠️ **meaning inverts — see below** |
| `--color-caption` | 162 | `--ih-muted-2` | v2 is lighter; re-check contrast |
| `--color-border-2` | 80 | **none** | ⚠️ **hierarchy inverts — see below** |

**Two traps.**

1. **`surface` means opposite things.** Today `--color-surface` is the *page ground* (`#f5f3ee`);
   in v2 `--ih-surface` is *card white* and the page ground is a different token, `--ih-bg`. A
   blind alias produces white-on-white across 182 sites. Map it to `--ih-bg` explicitly.
2. **`border-2` inverts.** Today `--color-border-2` (`#e6e1d5`) is *lighter* than the base border
   — a softer rule. v2's second border weight, `--ih-border-strong`, is *darker* — an emphasis
   rule. Aliasing flips the visual hierarchy at all 80 sites. Collapse `border-2` onto the base
   border and reintroduce `border-strong` deliberately, per screen.

**Three token names are referenced but were never defined** — 52 dangling references already
rendering wrong in production today: `--color-border-default` (32), `--color-status-danger` (18),
`--color-good-soft` (2). Root cause is CLAUDE.md §2.2, which mandated a bare-utility vocabulary
(`border-default`, `status-good`, `status-danger`…) that was never implemented and never compiled.
*Fixed in this branch; §2.2 rewritten to describe the convention actually in force.*

**Dead tokens** (zero references outside `globals.css`): `--color-info`, `--color-tech`,
`--shadow-1`, `--shadow-2`, `--shadow-pop`, and all four `--color-sidebar-*`.

### Q5 · Dark mode

**Dead code.** `grep data-theme` across `apps/web/src` + `packages/*/src` returns exactly two
hits, both inside `globals.css` itself. Zero `dark:` variants anywhere. `layout.tsx` never writes
the attribute. The twelve-line block has never applied.

v2 specifies no dark theme — `prefers-color-scheme`, `data-theme`, `.dark` and "dark mode" return
zero hits across `tokens.css` and all six handoff documents. Keeping dark mode would mean
authoring 21 values the design package does not supply.

*Removed in this branch.* Zero visual change, confirmed.

### Q6 · Fonts

Loaded via `next/font/google` in `apps/web/src/app/layout.tsx:2` — Inter, IBM Plex Mono,
Source Serif 4. All three targets (Geist, Instrument Serif, JetBrains Mono) are on Google Fonts,
and `next/font` already self-hosts and inlines at build time, so the handoff's "self-host for
production" requirement is satisfied by staying put.

> ⚠️ **Build-breaking coupling.** `layout.tsx:40` requests Source Serif 4 at weights 400/500/600.
> **Instrument Serif ships weight 400 only.** `next/font/google` throws at build for an
> unavailable weight, so the weight list must be dropped in the same edit as the family swap.
> Where a semibold serif is used today, switch to Geist 500/600 rather than faking a serif weight.

---

## Component inventory

### Q7 · What exists

137 components in total, and the audit's first pass missed 50 of them:

| Location | Count |
|---|---|
| `packages/ui/src` | 22 |
| `apps/web/src/components` (+ `admin/`, `services/`) | 65 |
| Colocated client components under `app/**` | **50** |

**`packages/ui` is largely unproven.** 14 of its 20 modules have **zero import sites** — Badge,
Input, Card, Table, Tabs, EmptyState, QuantityStepper, FilterBar, StatusPill among them.
Meanwhile `apps/web` carries 13 independent local `Field` re-implementations, 11 local `Th`
helpers, 9 local `Section` helpers, 3 ad-hoc avatars and 2 local chips. The shared layer is
roughly 4× under-built against v2 and the duplication is already paid for.

### Q8 · Mapping table

Against the ~17 v2 primitives and ~90 `.ih-*` classes:

| Verdict | Count | Meaning |
|---|---:|---|
| `rebuild` | 17 | Exists, but the API is wrong for v2 |
| `build` | 5 | No equivalent — Avatar, SecHead, Note, Spec, section scaffolding |
| `extend` | 4 | Absorbs v2 with prop/variant changes |
| `already-ok` | 2 | SEO/JSON-LD helpers, untouched by the reskin |

Blast radius is small almost everywhere, precisely *because* `packages/ui` is under-consumed —
`Badge`, `Input`, `Card`, `Table`, `Tabs`, `FilterBar` and `StatusPill` all have **0** import
sites, so rebuilding them breaks nothing. The exceptions: the token layer (155 files), the type
utilities (25), the eyebrow class (13) and the image placeholder (8).

### Q9 · Icons

`lucide-react`, and exactly **one** file imports it — `components/admin/AdminSidebar.tsx`, 16
icons. Every other icon in the product is a hand-rolled inline `<svg>`: 15 occurrences across 9
files.

Version skew: `apps/web` pins `^1.14.0`, `packages/ui` pins `^0.511.0` — a major-version gap
across which export names changed. Building the Icon primitive in `packages/ui` against 0.511
while the app resolves 1.14 would ship two copies with divergent names. *Aligned in this branch.*

**Recommendation:** keep lucide, wrap it, delete the inline SVGs. Do not port the 37 designed
glyphs — lucide supports the required 24×24 viewBox, 1.7 stroke-width and round caps natively,
and mixing two icon families is explicitly banned by the design language.

### Q10 · shadcn/ui

**Not installed.** No `components.json` anywhere, no `components/ui` directory, no dependency in
any `package.json`. What exists is the shadcn *idiom* hand-copied: `cva` + `clsx` +
`tailwind-merge` + a six-line `cn()` + `@radix-ui/react-slot` for `asChild`. Exactly three Radix
imports exist repo-wide — `react-tabs`, `react-label`, `react-slot`. Seven declared `@radix-ui`
packages have zero imports.

**This matters for planning:** it turns v2's overlay surfaces — command palette, compare tray,
mega menu, dialogs — from "retheme the Radix primitive" into "build it, including the focus trap".
*CLAUDE.md corrected in this branch.*

---

## Routes

### Q11–Q12 · Inventory and artboard mapping

**Storefront — 40 routes, 12,370 lines.** 33 map cleanly to an artboard. Ten have none and are
derived from a neighbour: `/reset-password`, `/account/{lists,addresses,notifications,profile}`,
`/account/email-change/confirm`, `/replacement/[brand]`, `/quote/[code]`, `/llms.txt`, root 404.

**Admin — 54 routes.** 13 are realised by an artboard; **41 are not**. The console is 3.2× the
artboard set. The overhang is concentrated in SEO: 20 routes behind an 11-tab nav plus a 4-tab
sub-nav, against exactly one artboard whose grammar has no vocabulary for tabs inside the console
at all.

### Q13 · Corrections to the handoff's "net-new" list

Seven of the fifteen already exist:

| Handoff claim | Reality |
|---|---|
| `/replacement` net-new | 3 routes, 393 lines, live, sitemap priority 0.7 |
| Category index net-new | `/c` exists |
| Brand detail net-new | `/brands/[slug]`, 399 lines |
| Five policy pages net-new | All five live, 1,276 lines total |
| ⌘K palette never built | Shortcut bound at `SearchAutocomplete.tsx:131` |
| Compare tray net-new | Store + badge, mounted in the storefront layout |
| Industries "one hand-written page" | Already one data-driven template |

And two "restructures" are really reskins:

- **Services.** The `ServiceCaseCategory` enum is *exactly* the ten v2 categories. `/services`
  already renders hero stats, a chip rail that shows zero-count categories, case-of-the-week, the
  card grid and the four-step method band. The handoff's "rebuild to the live structure" has
  already happened.
- **Case studies.** `ServiceCase` carries body blocks, meta cells, pull quotes and a featured
  flag. What is missing is the seven-part *structure*, not the entity.

### Q14 · Four artboards are feature builds mislabelled as reskins

`adm-inv`, `adm-price`, `adm-infra` and `adm-tokens` map to **no route, no Prisma model and no
sidebar entry**. Inventory needs per-warehouse stock, reorder points and lead times; pricing needs
margin bands and a floor. `schema.prisma:3` explicitly excludes both. These should be struck or
deferred before anyone estimates the console.

### Q15 · Behaviours the designs assume

| Behaviour | Status |
|---|---|
| Quote-list persistence | ✅ localStorage `quote_items` |
| Compare tray | ✅ `lib/compare-tray.ts` |
| Facets + sort in URL | ✅ PLP and search |
| Mega menu | ✅ CMS-driven, 3-level hard limit, implicit `/c` trigger |
| ⌘K palette | ⚠️ shortcut only — no dialog, no focus trap, no grouped results |
| Part-number interception | ⚠️ exact-SKU short-circuit only; no supersession lookup |
| No prices anywhere | ✅ in effect — 0 of 1,138 products carry a price, so `ProductPrice` always renders the quote CTA |

> On prices: `ProductPrice` is rendered on the PDP, the PLP (via `ProductCard`) and compare. It is
> not a violation today and not dead code — it is the enforcement point. The latent conflict is
> the admin write path, which still accepts `listPrice`. Gate rendering behind a store setting
> defaulting off, rather than deleting the component and its tests.

---

## Data

### Q16 · Schema gap list

63 models exist. Against the v2 §12 amendments:

| Entity | Status | What's missing |
|---|---|---|
| `part_interchange` (+ deltas, enquiry) | **absent** | `ProductCrossReference` records *competitor* codes → our SKU. v2 needs *same-brand supersession* with per-attribute deltas, fit confidence and a narrative note. Three new tables. Doc claim **verified true**. |
| `service` / `service_category` / `service_outcome` | **absent** | No `service` entity — `/services` is a case-study index. The 10-value enum must become a table to admit the 11th category. |
| `case_study` family | **partial** | `ServiceCase` stores the whole article in an untyped `bodyBlocks` JSON. Needs phases, the signed SOP ledger, before/after metrics, team. Ten live rows to migrate. |
| industry child tables | **partial** | Already carried as five JSON columns — workable. Missing only `verifiedAt` sign-off on certifications, and a `product_industry` join for rated SKUs. |
| structured `policy` | **absent** | `CmsPage` is an HTML blob. Five pages need numbered sections + at-a-glance list. |
| `rfq_line` substitution | **absent** | No offered product, no reason, no offered qty, no per-line state. |
| Quote-list → account | **absent** | Browser-only, and stores `{sku, qty}` — too little for the v2 chips. |
| `ProductImage` aspect hint | **absent** | The 4:3 PDP hero is gated on it. |
| Category cached counts | **absent** | Category index counts on every render today. |
| `SavedList` | ✅ **exists** | Fully modelled. Handoff agrees. |

### Q17 · Migration procedure

`pnpm db:push` **cannot be used** — `001_seo_fts.sql` adds a generated `search_tsv` column that
`schema.prisma` does not model, so every push wants to drop it and Prisma blocks. Passing
`--accept-data-loss` would break `/search` in production.

Working procedure, with precedent in `packages/db/migrations/`:

1. Write hand-rolled SQL at `packages/db/migrations/00X_<name>.sql` — `BEGIN`/`COMMIT`,
   `IF NOT EXISTS`, idempotent.
2. Apply via the Supabase MCP `apply_migration` tool.
3. Update `packages/db/migrations/README.md` with the applied date.
4. **Apply before merging the code PR** — the new client expects the columns at runtime.
5. Regenerate locally with `pnpm --filter @indus/db db:generate`.

---

## Risk

### Q18 · Test coverage and what a restyle breaks

`smoke.spec.ts` is the **only** Playwright spec, and `.github/workflows/smoke-e2e.yml` triggers on
`deployment_status` against **production only** — it cannot fail a pull request, and it skips
admin deploys entirely. CI on PRs runs typecheck, lint and Vitest.

**So the reskin currently ships unguarded, and every break is found in production after merge.**

Assertions that genuinely constrain the rebuild — treat as naming contracts:

- `smoke.spec.ts:82` — `input[name="inquiryType"]` on contact
- `:71–73` — `name="email"`, `name="password"`, an accessible "Sign in" label
- `highlight.test.ts:55–68` — asserts `<mark class="x">` is **escaped**, so search highlighting
  must be styled by a descendant selector on bare `<mark>`, never a utility class
- `admin-path-prefix.test.ts` — every admin path literal starts with `/admin`
- `cache-tags.test.ts` — scans storefront source bidirectionally

Loose assertions that survive: the PDP `h1` word-alternation, the 404 body text.

### Q19 · Entanglement

- **The admin top bar cannot migrate incrementally.** It derives breadcrumbs from `usePathname()`
  and is auto-mounted in the shell layout, taking no props. v2 needs title, subtitle and actions
  from each page — one atomic change across 51 files that cannot be committed per screen.
- **Site chrome is in the layout, above any page wrapper.** Nav, footer and compare tray mount in
  `(storefront)/layout.tsx:151–154`. A per-page token scope therefore *cannot* migrate the
  chrome — which is what rules out a scoped cutover and settles the strategy (below).
- 53 hard-coded `1360px` literals bypass the width token entirely.
- Base type changes 15px/1.5 → 14px/1.45, silently reflowing all 94 routes at once.

### Q20 · Hard constraints the reskin must not break

- 14 permanent 301s in `next.config.ts` — URL shapes are SEO-load-bearing
- Sitemap priorities pinned in `sitemap.ts:206–220`
- Structured data on 13 routes via `buildProductLd` / `buildArticleLd` / etc.
- `robots.ts` reserved disallows that a staff edit cannot remove
- CSP is set in `proxy.ts:53–79`, not `next.config.ts`
- The auth boundary is enforced only by ESLint globs — update in lockstep with any file move
- Mega menu renders exactly 3 levels; deeper items are stored and silently never shown

### Q21 · References to the superseded v1 handoff

**None in code.** The v1 folder sits outside the repo at
`/Users/ayushkbhatia/indus-hydraulics-code/design_handoff_indus_hydraulics`. Nothing imports from
it and no token name traces to it. It should be deleted to stop it being read — its `PROMPTS.md`
instructs porting Inter, IBM Plex Mono and a 0–2px radius ceiling, all now wrong.

---

## The token cutover — settled

Three strategies were considered. **Revalue in place behind an alias layer** wins.

| | Verdict |
|---|---|
| **(a) Revalue in place + alias layer** | ✅ **Chosen.** Add the 42 `--ih-*` tokens to `@theme`, then redefine the 15 legacy `--color-*` names as one-line aliases pointing at them. Zero `.tsx` edits in the cutover commit. Legacy names die out per screen as each screen is rebuilt against `--ih-*`; the alias block is deleted when `grep -r 'var(--color-'` returns 0. |
| **(b) Parallel palettes scoped by a `data-` attribute** | ❌ Technically possible — `@theme` keeps values live, so a scoped redefinition really would recolour a subtree with no call-site edits. But the nav, footer and compare tray mount in the **layout**, above any page wrapper, so the chrome could never migrate until every page had. It buys per-page review only for page bodies, at the cost of maintaining two palettes for the length of the epic. |
| **(c) New namespace + call-site sweep** | ❌ No compile-time safety net. The 52 dangling references already in the tree are proof of the failure mode: a wrong token name produces no error, no lint failure and no test failure — only a wrong colour. A 4,600-site sweep under those conditions is not reviewable. |

The interim state under (a) is "correct palette, old shape" — coherent, never broken, and it makes
each subsequent screen a pure structural diff.

---

## Done-when

- [x] Route ↔ artboard mapping complete for all 94 routes, both directions
- [x] Component mapping table names every v2 primitive `extend` / `rebuild` / `build` / `already-ok`
- [x] Schema gap list written, with the entities that block which screens
- [x] Token cutover strategy chosen, with the argument recorded
- [x] Handoff claims corrected where they contradict the codebase
- [x] Decisions register produced, each with a default so no work blocks on an answer
