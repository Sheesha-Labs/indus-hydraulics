# 02 · Screen index

All 63 artboards, in canvas order. Every artboard is **1440px wide**; the height given is the measured content height.

Column key — **Source**: file in `design-source/`. **Status**: `reskin` (route exists, apply language) · `restructure` (route exists, page materially changes) · `new` (no current equivalent).

---

## 00 · Design language — 1 board

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `tokens` | Foundation — colour, type, components | 1660 | `foundation.jsx` | new |

Not a product page. A living specimen sheet: the blue family as swatches, the type scale, and every component in every state. **Build this as an internal route** (e.g. `/_design`) in the app. It is how the team catches drift later, and it is cheap because it is only the primitives.

---

## 01 · Entry & discovery — 6 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `home` | Home — full assembly | 5662 | `site-home.jsx` | reskin |
| `plp` | Category — faceted list | 2150 | `site-catalog.jsx` | reskin |
| `search` | Search results — with cross-reference | 1475 | `site-catalog.jsx` | reskin |
| `brands` | Brands index | 1785 | `site-catalog.jsx` | reskin |
| `compare` | Compare — spec matrix | 1472 | `site-catalog.jsx` | reskin |
| `megamenu` | Mega menu — open state | 1050 | `site-catalog.jsx` | reskin |

**Home** is the longest page in the system and the fullest expression of the language. Work top to bottom: hero, capability strip, featured categories, stat band, product rails, services teaser, industries grid, navy band, editorial teaser, footer. If a pattern appears here, it is canonical.

**PLP** — left facet rail (fixed width, sticky), results header with count and sort, product grid. Facets are checkbox groups with counts in mono. Product cards are `.ih-prod`: 1:1 media, SKU in mono, title 14px/500, meta row pinned to bottom.

**Search** — the notable detail is the cross-reference interception: when a query looks like a part number, a cross-reference result appears above the organic results, linking to `/replacement`.

**Compare** — spec matrix with the attribute column frozen left. Rows where values differ get emphasis; identical rows recede.

**Mega menu** — open state over the home hero. Category columns, a promoted brand panel, and a "can't find it" cross-reference prompt in the last column.

---

## 02 · Product & quote path — 4 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `pdp` | Product detail | 1892 | `site-product.jsx` | restructure |
| `quotelist` | Quote list | 1140 | `site-product.jsx` | reskin |
| `rfq` | RFQ form | 1850 | `site-product.jsx` | reskin |
| `rfq-done` | RFQ confirmation | 1265 | `site-product.jsx` | reskin |

**No prices anywhere.** This is a quote-only catalogue. Never render a price field, a cart total, or a checkout affordance.

**PDP is a restructure**: title comes *before* the hero image, and the hero is 4:3 rather than square. This was a deliberate fix — the product name must surface before any scroll. Below: spec table, datasheet downloads, cross-reference block, related SKUs.

**RFQ** — contact block, requirement block, file upload, delivery detail. Field-level hints in `.ih-hint`. The submit is the single primary button on the page.

**RFQ confirmation** — reference number in large mono, what-happens-next as a numbered list with expected timings, contact fallback.

---

## 03 · Services & case studies — 3 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `svc-index` | Services index — live structure, 20 services | 7314 | `site-services-index.jsx` | **restructure** |
| `cases` | Services — case studies index | 2375 | `site-services.jsx` | reskin |
| `case-detail` | Case detail — mud pump rebuild | 2230 | `site-services.jsx` | reskin |

**`svc-index` is the important one.** It is rebuilt to match the live site's structure and carries the real service taxonomy — a BOP and pressure-control business, not generic industrial hydraulics.

Structure, in order: hero with stat row → filter chip bar (11 categories with counts; zero-count categories rendered at 45% opacity) → "Case of the week" wide featured card → 19-card grid with outcome chips → four-step "How we work" hairline band with step 02 tinted accent-soft → step-02 deep-dive split → two long-read cards → intake CTA.

The 20 service names and their descriptions are verbatim from indushydraulics.com. Category counts: BOP & pressure control 10, CT & wireline 2, Pumps 2, Field service 2, Cylinders 1, Hoses 1, Lab 1, Custom builds 1, and three zero-count categories retained for taxonomy completeness.

`cases` and `case-detail` are the earlier, more generic services treatment. Retained for comparison; if the client confirms `svc-index`, these can be retired.

---

## 04 · Industries — 7 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `ind-master` | Industries — master | 2355 | `site-industries.jsx` | restructure |
| `ind-oil` | Oil & Gas | 4025 | `site-industries.jsx` | restructure |
| `ind-mining` | Mining | 4002 | `site-industries.jsx` | restructure |
| `ind-constr` | Construction | 4002 | `site-industries.jsx` | restructure |
| `ind-power` | Power & Energy | 4002 | `site-industries.jsx` | restructure |
| `ind-marine` | Marine & Offshore | 4002 | `site-industries.jsx` | **new** |
| `ind-steel` | Steel & Metals | 4002 | `site-industries.jsx` | **new** |

**Build this as one template driven by a data object.** `IND_PAGES` in the source keyed by slug; six of the seven boards render from `<IndustryDetailPage slug="…" />`. Adding a vertical must be a data entry, not a new component.

Section order, following the live site exactly:

1. Breadcrumb (`INDUSTRIES / <VERTICAL>`, first segment accent)
2. Hero split 1.25fr / 1fr — serif H1 (long declarative sentence, italic closing clause), lede, certification pills, 4:3 image
3. Stat row — 4 items, accent top rules
4. "Where we deliver" — four-up hairline grid, each with mono tag, H3, description, SKU count + arrow
5. Rated SKUs — 8-card product grid with a "see all" action
6. Reference installs — 3 case cards with client/year eyebrow
7. Quote band — `--ih-steel-soft` panel, split, with WhatsApp and phone fallbacks
8. Support band — the page's single navy panel: steel eyebrow, white serif H2, 2×2 checklist with steel ticks, image, primary CTA

Certification pills carry real standards per vertical (API 6A/16A, ATEX/IECEx, NACE MR0175 for oil & gas; DNV/LR/ABS/IRS for marine; IEC 61511 for power). These are claims — verify with the client before publishing.

---

## 05 · Long-form templates — 3 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `lf-editorial` | Services — editorial feature spreads | 3859 | `site-longform.jsx` | new |
| `lf-ledger` | Services — log & bench notes | 2420 | `site-longform.jsx` | new |
| `lf-case-7part` | Case study — seven-part oilfield format | 8478 | `site-case-full.jsx` | new |

Three reusable editorial patterns. These are the reference set for anything long-form on the platform — insights, technical articles, case studies.

**`lf-editorial`** — masthead rule (volume/quarter/locations), five-up index nav, then alternating image/text feature spreads. Each spread: dot + mono tag, serif H2, two body paragraphs, pull-quote on a 2px accent left rule, spec table in a card, engineer byline with avatar and a quote CTA.

**`lf-ledger`** — navy hero with a blueprint grid overlay and a 2×2 stat block, then the ten-service log table with bench-type badges, then a worked case with a mono "note from the bench" block and a measured in/out spec table.

**`lf-case-7part`** — the seven-part deep case. Numbered `/01`–`/07`: the problem, what we did instead, four phases, the SOP ledger with a signed column, before/after numbers, outcome panel, team grid. Sticky rail with contents, job card and CTA. Related cases at the foot. **This is the canonical case-study template** — the earlier `case-detail` is a looser precursor.

---

## 06 · Catalogue tools & surfaces — 5 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `replacement` | Replacement — cross-reference finder | 3047 | `site-replacement.jsx` | **new** |
| `cat-index` | Categories — index | 2583 | `site-surfaces.jsx` | **new** |
| `brand-detail` | Brand detail — Bosch Rexroth | 2758 | `site-surfaces.jsx` | **new** |
| `palette` | ⌘K command palette — overlay | 900 | `site-surfaces.jsx` | **new** |
| `compare-tray` | Compare tray — docked state | 2150 | `site-surfaces.jsx` | **new** |

**`replacement` is the highest-value new surface.** Live sitemap gives it priority 0.7 and weekly changefreq, above the policy pages. It is a real tool, not a landing page.

Structure: hero with a 52px search field, brand select and submit, plus example-query chips → result as an obsolete→current pairing (three-column card: obsolete on white, arrow in a tinted gutter, current on `--ih-accent-soft`, each with badges and a mono part code) → action bar → "what changed" table with a per-attribute fit-effect column, where unchanged attributes render as plain muted text and changed ones get a steel badge → note block interpreting the change → related interchanges list → sticky rail with a nameplate-photo dropzone, the four-step method, and an engineer-contact card → popular-interchange table at the foot.

The design's argument: a substitution is documented, not asserted. Preserve that — the "what changed" table and the interpretive note are the point of the page.

**`palette`** — overlay on a blurred, dimmed home (`oklch(0.2 0.02 255 / 0.42)` scrim). 660px card at 96px from top, shadow-2. Search row, grouped results (Products / Categories / Services / Pages) with 30px thumbnails, first row pre-selected in accent-soft, keyboard legend footer with bordered key caps and an indexed-SKU count.

**`compare-tray`** — navy bar docked to the bottom of the PLP. Count block, chips with thumbnail + title + SKU + dismiss, a dashed "add a fourth" slot, clear-all and compare actions. In the artboard this is `position:absolute` within the board; **in production it is `position:fixed`.**

---

## 07 · Account — 6 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `signin` | Sign in | 1232 | `site-account.jsx` | reskin |
| `signup` | Sign up | 1232 | `site-account.jsx` | reskin |
| `forgot` | Forgot password | 1232 | `site-account.jsx` | reskin |
| `acct-dash` | Account — overview | 1079 | `site-account.jsx` | reskin |
| `acct-quotes` | Account — my quotes | 1111 | `site-account.jsx` | reskin |
| `saved` | Account — saved list | 2000 | `site-account.jsx` | reskin |

Auth screens are a 1fr/1fr split: form left, navy panel with a supporting claim right. Signed-in screens use a left `AccountNav` rail; the top nav passes `active="none"` because no top-level section applies — location is signalled by the account rail instead.

Accounts are optional. Quoting works without one; it only saves re-typing. Do not gate the quote path behind auth.

---

## 08 · Editorial & company — 4 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `about` | About | 2453 | `site-editorial.jsx` | reskin |
| `blog` | Insights index | 2140 | `site-editorial.jsx` | reskin |
| `post` | Insights — article | 2071 | `site-editorial.jsx` | reskin |
| `contact` | Contact | 1549 | `site-editorial.jsx` | reskin |

Nav label is **Blog** (matching the live IA) though the pages are titled "Insights". Keep the nav label as-is.

**Contact** carries the real facts: Dubai HQ, +971 52 2477942, 09:00–18:00 GST Mon–Fri, sales@indushydraulics.me. Verify against the live site before publishing.

---

## 09 · System & utility — 2 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `404` | 404 — not found | 1030 | `site-system.jsx` | reskin |
| `maint` | Maintenance | 760 | `site-system.jsx` | reskin |

404 offers search, popular categories and the cross-reference route — a wrong part number is a common way to land here.

---

## 10 · Policy & legal — 5 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `pol-shipping` | Shipping | 2372 | `site-policy.jsx` | **new** |
| `pol-returns` | Returns | 2247 | `site-policy.jsx` | **new** |
| `pol-warranty` | Warranty | 2249 | `site-policy.jsx` | **new** |
| `pol-privacy` | Privacy | 2168 | `site-policy.jsx` | **new** |
| `pol-terms` | Terms of sale | 2270 | `site-policy.jsx` | **new** |

**One template, five content sets** — `POLICIES` keyed by slug. Three-column layout: 196px sticky left nav (policy switcher + on-this-page), 780px max article column, sticky right rail with an at-a-glance spec card and a PDF-download card.

Article body: numbered `/01`-style sections, each with 2–3 sub-headings and paragraphs at 15px/1.7.

The copy takes real positions — returns distinguishes unfitted from run; warranty names contamination as the most common non-covered cause; terms caps liability at invoice value and excludes rig time. **These are commercial commitments. Have the client's commercial lead sign them off before publishing.**

---

## 11 · Console — catalogue operations — 7 boards

| ID | Screen | H | Source | Status |
|---|---|---|---|---|
| `adm-dash` | Dashboard | 900 | `admin-core.jsx` | reskin |
| `adm-prod` | Product master | 965 | `admin-catalog.jsx` | reskin |
| `adm-edit` | Product editor | 1012 | `admin-catalog.jsx` | reskin |
| `adm-cats` | Categories | 922 | `admin-catalog.jsx` | reskin |
| `adm-inv` | Inventory | 900 | `admin-catalog.jsx` | reskin |
| `adm-price` | Pricing | — | `admin-catalog.jsx` | reskin |
| `adm-import` | Bulk import | — | `admin-catalog.jsx` | reskin |

## 12 · Console — demand & content — 6 boards

`adm-quotes` (RFQ queue) · `adm-cust` (customers) · `adm-cust-1` (customer detail) · `adm-cms` · `adm-media` · `adm-seo` — all `admin-crm.jsx`, all reskin.

## 13 · Console — platform — 4 boards

`adm-users` · `adm-set` · `adm-infra` · `adm-tokens` — all `admin-platform.jsx`, all reskin.

### Console notes

**Desktop only, by decision.** No responsive work. Fixed 1440×~900 viewport with internal scroll regions.

The console uses the same language, differently weighted: navy sidebar as persistent chrome, dense tables, mono for every identifier and quantity, and accent reserved strictly for the single primary action per view. It should read as the same product as the public site, not a separate admin theme.

`adm-tokens` renders the design tokens inside the console so operators can see the system. Keep it in sync with `/_design`, or drop one of the two.

### Known gap

The **quote pricing console** — the screen where an engineer prices a multi-line RFQ, marks substitutions with reasons, flags lines as sourcing, and sends — **does not exist in this package**. `adm-quotes` is the queue only. This is the most-used screen in the backend. Flag it before scoping Phase 5.
