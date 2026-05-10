# Services section build — handoff (2026-05-11)

This document captures the state of the `feat/services-section` worktree after
the infrastructure pass. Use it as context when picking up the work in a
fresh session.

**Worktree:** `/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-services`
**Branch:** `feat/services-section` (tracking `origin/main`)

---

## TL;DR

The services-section infrastructure is ~90% built. The remaining work is
content: 10 launch case studies. PR 1 (infra) can ship now — the index page
renders a graceful empty state. PR 2 (cases) seeds the 10 cases. PR 3
migrates the existing 13 BOP services + decommissions the old products +
301-redirects.

⚠️ **Time-sensitive:** the "Services" header nav link is already LIVE on
prod DB (inserted into `primary_header` at position 3). The matching
`/services` route only exists in this worktree. **Until PR 1 merges, every
visitor clicking "Services" in the header gets a 404.** Ship PR 1 fast or
roll back the nav link.

To roll back the nav link if PR 1 won't ship soon:

```sql
DELETE FROM nav_menu_items
 WHERE "menuId" = (SELECT id FROM nav_menus WHERE location = 'primary_header')
   AND "linkType" = 'custom_url' AND "customUrl" = '/services';

UPDATE nav_menu_items
   SET "position" = "position" - 1, "updatedAt" = now()
 WHERE "menuId" = (SELECT id FROM nav_menus WHERE location = 'primary_header')
   AND "parentId" IS NULL AND "position" >= 4;
```

---

## What's done (this worktree)

### Schema (LIVE on prod DB)

- `service_cases` table — 53 columns, 3 indexes, FTS `tsvector` STORED column + GIN
- 3 enums: `ServiceCaseStatus`, `ServiceCaseCategory`, `ServiceCaseCardTagStyle`
- Migration SQL: `packages/db/migrations/007_service_cases.sql`
- Applied via supabase MCP `apply_migration` (name: `service_cases`)

### Schema in code

- `packages/db/prisma/schema.prisma` — new `ServiceCase` model + 3 enums + Media inverse relations (`serviceCaseHeroes`, `serviceCaseOgImages`)
- `packages/db/src/index.ts` — re-exports `ServiceCase`, `ServiceCaseStatus`, `ServiceCaseCategory`, `ServiceCaseCardTagStyle` from `@indus/db`

### Domain layer

- `packages/domain/package.json` — added `zod ^4.4.1` dep
- `packages/domain/src/service-case-blocks.ts` — discriminated union of 11 body-block kinds + Zod schemas + meta-cell / spec / download / pill schemas + category-label map
- `packages/domain/src/index.ts` — barrel re-export

### Storefront — fonts & tokens

- `apps/storefront/src/app/layout.tsx` — `Source_Serif_4` from `next/font/google` wired to `--font-source-serif` CSS variable
- `apps/storefront/src/app/globals.css` — `--font-serif` token + `.sc-article-body` / `.sc-lead` utilities (orange accent drop-cap)

### Storefront — index page (`/services`)

- `apps/storefront/src/app/services/page.tsx` — composes hero + topic rail + featured + grid + approach + two-up + CTA
- `apps/storefront/src/app/services/error.tsx`
- `apps/storefront/src/app/services/not-found.tsx`
- `apps/storefront/src/lib/service-cases.ts` — data layer (parseSort, parseCategory, listServiceCases, featuredServiceCase, topTwoStoryCases, categoryCounts, totalCount, getServiceCaseBySlug, getGalleryMedia, listPublishedSlugs)
- `apps/storefront/src/lib/services-config.ts` — `HERO_STATS` (2,400+ / 96 h / 100%) + 4 `APPROACH_STEPS`
- `apps/storefront/src/components/services/`:
  - `ServicesHero.tsx`
  - `ServicesTopicRail.tsx` + `ServicesSortDropdown.tsx` (client)
  - `FeaturedCase.tsx`
  - `ServiceCaseCard.tsx`
  - `ApproachSteps.tsx` (client)
  - `StoryCard.tsx`
  - `ServicesCta.tsx`
  - `PlaceholderImage.tsx`

### Storefront — detail page (`/services/[slug]`)

- `apps/storefront/src/app/services/[slug]/page.tsx` — breadcrumbs + hero + meta strip + 3-col body + related + CTA + Article JSON-LD
- `apps/storefront/src/app/services/[slug]/error.tsx` + `not-found.tsx`
- Components in `apps/storefront/src/components/services/`:
  - `CaseBreadcrumbs.tsx`
  - `CaseHero.tsx` (title-accent + deck + hero figure with caption strip)
  - `CaseMetaStrip.tsx`
  - `CaseToc.tsx` (sticky left)
  - `ReadingProgress.tsx` (client — scroll-based progress bar)
  - `CaseRail.tsx` (sticky right rail — CTA card + pull quote + specs + gallery + downloads)
  - `RelatedCases.tsx`
- Block renderers in `apps/storefront/src/components/services/blocks/`:
  - `ArticleRenderer.tsx` — Zod-validates `bodyBlocks` and switches by `block.type`
  - `SectionHeadBlock.tsx`, `LeadBlock.tsx`, `ParagraphBlock.tsx`
  - `ProblemSolutionBlock.tsx`, `FigureBlock.tsx`, `PullQuoteBlock.tsx`
  - `ApproachGridBlock.tsx`, `SopBlock.tsx`
  - `SpecTableBlock.tsx`, `ResultBoxBlock.tsx`, `TeamListBlock.tsx`

### SEO

- `apps/storefront/src/app/sitemap.ts` — added `service_cases` entries + `/services` static entry

### Nav (LIVE on prod DB — not in any worktree)

- "Services" inserted at position 3 of `primary_header`, shifting Blog/About/Contact to 4/5/6

### Seed scaffolding (started, not finished)

- `packages/db/src/imports/2026-05-11-service-cases-launch/shared.ts` — `ServiceCaseSeed` type + 11 block-builder helpers (sectionHead, lead, para, problemSolution, figure, pullQuote, approachGrid, sopBlock, specTable, resultBox, teamList) + COMMON_CTA_PHONE / TITLE / BODY constants

---

## Typecheck status

- ✅ `packages/db` — clean
- ✅ `packages/domain` — clean (after adding zod dep)
- ✅ `apps/storefront` — clean (last verified)
- ❓ `apps/admin` — not yet verified (no expected impact, but run `pnpm --filter admin typecheck`)

---

## What's NOT done

1. The 10 launch cases (the bulk of the content authoring work — see below)
2. Runner script for the cases (`packages/db/src/imports/2026-05-11-service-cases-launch/run.ts`)
3. Storefront smoke test (dev server boot + curl all routes)
4. Full monorepo typecheck
5. PR 1 commit/push/open/merge
6. PR 3 — migrate 13 BOP services + decommission + 301 redirects

---

## PR sequencing (3 PRs)

| PR | Scope | Status |
|---|---|---|
| **PR 1** | All infrastructure listed above (schema, components, sitemap) — page renders empty grid | Ready to ship |
| **PR 2** | Seed 10 UAE-themed launch cases via TS import script | Fresh chat |
| **PR 3** | Migrate 13 `IH-BOP-SVC-*` products → `ServiceCase` rows, delete products, remove BOP Services from megamenu, 301 redirects | After PR 2 |

---

## To finish PR 1

```bash
cd /Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-services

# 1. Verify monorepo typecheck
pnpm -r typecheck

# 2. Smoke-test storefront
cd apps/storefront && PORT=3010 pnpm dev &
sleep 15
curl -sI http://localhost:3010/services         # expect 200
curl -sI http://localhost:3010/services/foo     # expect 404 (no cases yet)
kill %1; cd ../..

# 3. Commit + push + PR
git add -A
git commit -m "feat(services): structured services section — schema, /services index + detail, block renderer, sitemap, nav link"
git push -u origin feat/services-section
gh pr create --title "feat(services): structured services section (infrastructure)"
```

PR 1 body must mention:
- Schema migration `007_service_cases.sql` already applied to prod via supabase MCP `apply_migration` (name `service_cases`)
- "Services" header nav link already inserted into `primary_header` (position 3)
- Empty-state grid until PR 2 seeds the launch cases

---

## To finish PR 2 (10 launch cases) — fresh chat instructions

User-confirmed scope: **10 cases, full ~2,000-word case-study depth, UAE-only context, real GCC oilfield services, synthesized as plausibly real**.

### Files to create

- `packages/db/src/imports/2026-05-11-service-cases-launch/cases-1-5.ts` — exports `CASES_1_5: ServiceCaseSeed[]`
- `packages/db/src/imports/2026-05-11-service-cases-launch/cases-6-10.ts` — exports `CASES_6_10: ServiceCaseSeed[]`
- `packages/db/src/imports/2026-05-11-service-cases-launch/run.ts` — orchestrator that imports both arrays and `db.serviceCase.upsert({ where: { slug }, create, update })` each one

### Run command

```bash
pnpm --filter @indus/db exec tsx src/imports/2026-05-11-service-cases-launch/run.ts
```

### Helper API (already written in `shared.ts`)

```ts
import {
  ServiceCaseSeed,
  sectionHead, lead, para, problemSolution, figure, pullQuote,
  approachGrid, sopBlock, specTable, resultBox, teamList,
  COMMON_CTA_PHONE, COMMON_CTA_TITLE, COMMON_CTA_BODY,
} from './shared'
```

### The 10 cases

| # | Title direction | Category | Tag style | cardTagLabel | Featured? |
|---|---|---|---|---|---|
| 1 | Workover Rig Cylinder & Hose Overhaul (Jebel Ali, ADNOC sub-contractor) | `cylinders` | `oil` | "CYLINDERS · OILFIELD" | **Yes** |
| 2 | Mud Pump Fluid End Rebuild (12-P-160 / 14-P-220 class, sour service) | `pumps` | `oil` | "MUD PUMP" | No |
| 3 | BOP API 16A 5-Year Major Recertification (13-5/8" 10K Cameron U) | `bop_pressure_control` | `oil` | "BOP & RECERT" | No |
| 4 | Koomey Accumulator Rebladder & API 16D 5-Year Recert | `bop_pressure_control` | `oil` | "KOOMEY" | No |
| 5 | Coiled Tubing Injector Skid — Emergency Repair (5-day TAT) | `ct_wireline` | `oil` | "CT & WIRELINE" | No |
| 6 | Choke & Kill Manifold 5-Year Recert (API 16C, 3-1/16" 10K, sour) | `bop_pressure_control` | `oil` | "CHOKE & KILL" | No |
| 7 | Hydraulic Power Unit (HPU) Refurbishment — drilling-rig auxiliary | `pumps` | `standard` | "HPU" | No |
| 8 | Sour-Service Hose Assembly Build & Certification (bulk 100+ assemblies) | `hoses` | `standard` | "HOSES" | No |
| 9 | ISO 4406 Oil Cleanliness Coding & Failure Investigation (Q1 program) | `lab_forensics` | `standard` | "LAB" | No |
| 10 | Custom 16-port High-Pressure Manifold Fabrication (EN24, 420 bar) | `custom_builds` | `standard` | "BUILD" | No |

### Per-case authoring template

Refer to `~/Downloads/service-case-uae-cylinders-hoses.html` for the canonical structure. Each case must include:

- **Hero**: `topicLabel` + `region` (with 🇦🇪 flag) + `caseDateLabel`, `title` with optional `titleAccent` (italic-orange phrase), `deck` (60-word serif paragraph), `heroImageCaption`, `heroImageCredit`
- **Meta strip** (`metaCells`): exactly 5 cells (Asset / quantity / quantity / TAT (style: `accent`) / standard or service class (style: `good`))
- **Body** (`bodyBlocks`): 7 sections — `/01 problem`, `/02 solution`, `/03 approach`, `/04 SOP`, `/05 findings`, `/06 outcome`, `/07 team`
  - **/01**: `sectionHead` → `lead` (drop-cap paragraph, 60 words) → `para` (90 words) → `problemSolution` (red "what they told us" / green "what we found") → `para` (60-word setup for /02)
  - **/02**: `sectionHead` → `para` × 2 (180 words total, with `<strong>` callouts for spec like "EN 856 4SP") → `figure` (16:9, mock placeholder) → `pullQuote` (engineer voice + cite)
  - **/03**: `sectionHead` → `para` (intro) → `approachGrid` of 4 phases (PHASE 01-04, ~25-word body each, "Days 0-2" duration footer)
  - **/04**: `sectionHead` → `para` (intro) → `sopBlock` (header line: "SOP-XX-NNN · DESCRIPTION · REV NN · NACE", completion: "32 / 32 COMPLETE", 5 phases × 3-5 rows each = ~20-25 rows total, each row: task + detail + who + tool)
  - **/05**: `sectionHead` → `para` (intro) → `specTable` (caption + 8-12 rows, mark critical findings with `highlight: true`, use `asFoundStyle: 'bad'` for failures, `afterStyle: 'good'` for passes)
  - **/06**: `sectionHead` → `para` (70-word outcome) → `resultBox` (label + title + body + 4 metric cells, first cell typically `style: 'accent'`)
  - **/07**: `sectionHead` → `teamList` (intro paragraph + 4-6 members + caseFileMeta footer like "Case file · INTAKE-YYYY-MM-NNN · WO-YYYY-NNNN · Published... · Updated...")
- **Right rail**:
  - `ctaCardTitle` / `ctaCardBody` — use `COMMON_CTA_TITLE` / `COMMON_CTA_BODY` defaults or write per-case
  - `ctaCardPhone` — use `COMMON_CTA_PHONE` (`+971 4 881 2345`)
  - `pullQuoteText` / `pullQuoteAuthor` / `pullQuoteRole` / `pullQuoteLocation` (rail's own quote, separate from in-body pull quote)
  - `specsAtGlance` — 8-10 rows of {label, value} mono-table data
  - `galleryTotalCount` — e.g. 38, 24, 47 (placeholder thumbs render automatically)
  - `downloads` — 3-4 items: {label, url: "#" or "media:storagePath", size: "22 pp", format: "PDF"}
- **Card grid**:
  - `cardOneLiner` — short paragraph (40 words) for the index card (separate from `deck`)
  - `cardOutcomePills` — 3-4 pills, format: `"Label"` or `"Key: Value"` (latter splits in cards/featured)
  - `cardDurationLabel` — "19 D ON BENCH" / "5 D EMERGENCY" / "48 H ON-SITE"
- **Sort/SEO**:
  - `durationDays` — used by `?sort=tat`
  - `savingsAmount` (in AED minor units? no — full AED amount, integer) + `savingsCurrency: 'AED'` (used by `?sort=savings`)
  - `seoTitle`, `seoDescription`, `focusKeyword`

### Voice & substance reference

The mock case (workover-rig cylinders) is the gold standard. Real specs to cite throughout:

- **Sour service is the default** (NACE MR0175 / ISO 15156). H₂S in the GCC is the rule, not the exception.
- **Elastomers**: HNBR / FKM (Viton) / AFLAS — call these out by name on every elastomer-bearing component
- **Bolting**: B7M / L7M studs, 2HM nuts (sour-service grades). API 20E BSL-2/3 traceability available.
- **Hose specs**: EN 856 4SP (high pressure), EN 853 2SN (return / case drain), EN 856 4SH (extreme HP), API 7K Grade D / E (rotary lines), API 16C (well-control hoses), API 16D (BOP control hoses)
- **Fittings**: 316 SS for sour service, NACE-compliant elastomers
- **API standards**: 16A (BOPs), 16C (choke & kill), 16D (control units / accumulators), 6A (wellhead/flanges/bolting), STD 53 (well-control equipment systems), 17D (subsea trees), 7K (rotating equipment)
- **GCC operators**: ADNOC, ADNOC Drilling, ADNOC Offshore (Lower Zakum, Upper Zakum, Hail & Ghasha), Saudi Aramco (Khurais, Hawiyah, Haradh, Khuff, Jafurah), KOC, PDO (Khazzan/Ghazeer, Yibal/Lekhwair), QatarEnergy, BAPCO, Iraq south (Rumaila, West Qurna, Majnoon)
- **Indus context**: Dubai HQ + JAFZA yard, +971 4 881 2345 (placeholder), engineer bylines like "Khalid Al Marzouqi · Field Lead · Jebel Ali"
- **Numbers**: real ranges — rod straightness `mm/m TIR`, bore tolerance `mm`, working pressure `psi`, cylinder hydrotest at `1.5× MAWP`, hose proof test at `2× WP`, accumulator pre-charge `1,000 psi N₂`, API STD 53 BOP tests at the rated WP for 10 minutes

---

## To finish PR 3 (BOP migration + decommission)

After PR 2 is live:

1. New script `packages/db/src/imports/2026-05-12-bop-services-migration/run.ts`:
   - Read each `IH-BOP-SVC-*` product from prod DB
   - Build a `ServiceCase` row from its content (descriptionLong → bodyBlocks paragraphs, FAQs → no direct mapping, specs → specsAtGlance)
   - `upsert` the new ServiceCase
   - Delete the product (cascades remove specs / FAQs / cross-references)
2. Delete the `bop-services` category once all 13 products are gone
3. Remove the "BOP Services" sub-section from the `primary_megamenu` BOP column (3 sub-sections → 2)
4. Add 301 redirects in `apps/storefront/next.config.ts`:
   ```ts
   { source: '/p/IH-BOP-SVC-PRESSURE-TEST-API53-INDUS', destination: '/services/<new-slug>', permanent: true },
   // ... 12 more
   ```

---

## Files inventory (untracked + modified in worktree)

Run `git -C /Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-services status` for the live list. As of this handoff, expect:

- **Modified**: `packages/db/prisma/schema.prisma`, `packages/db/src/index.ts`, `packages/domain/package.json`, `packages/domain/src/index.ts`, `apps/storefront/src/app/layout.tsx`, `apps/storefront/src/app/globals.css`, `apps/storefront/src/app/sitemap.ts`, `pnpm-lock.yaml`
- **New**: `packages/db/migrations/007_service_cases.sql`, `packages/domain/src/service-case-blocks.ts`, `apps/storefront/src/app/services/**`, `apps/storefront/src/lib/service-cases.ts`, `apps/storefront/src/lib/services-config.ts`, `apps/storefront/src/components/services/**`, `packages/db/src/imports/2026-05-11-service-cases-launch/shared.ts`, this handoff doc
