# Agent brief — write one /services case study

You are writing **ONE** case study TypeScript file for the Indus Hydraulics
`/services` section. The file must export a typed `ServiceCaseSeed` and
compile cleanly under `tsc --noEmit`.

## Output

Write a single file at the path given in your dispatch prompt, e.g.
`packages/db/src/imports/2026-05-11-service-cases-launch/cases/case-NN-SLUG.ts`.

The file must follow this template exactly:

```ts
/**
 * Case NN — <Title>
 * 2026-05-11
 *
 * <2-3 sentence description of what the case is>
 */
import {
  type ServiceCaseSeed,
  COMMON_CTA_PHONE,
  COMMON_CTA_TITLE,
  COMMON_CTA_BODY,
  approachGrid,
  figure,
  lead,
  para,
  problemSolution,
  pullQuote,
  resultBox,
  sectionHead,
  sopBlock,
  specTable,
  teamList,
} from '../shared'

const CASE: ServiceCaseSeed = {
  slug: '...',
  caseNumber: 'NN',
  isFeatured: false, // or true for case 01 only
  category: '...', // see dispatch
  topicLabel: '...',
  region: '🇦🇪 UAE · Jebel Ali', // or another UAE site
  caseDateLabel: 'MMM 2026 · BAY N / ON-SITE', // pick date in 2026, plausible bay/site
  title: '...',
  titleAccent: '...', // OPTIONAL — italic-orange phrase from inside the title
  deck: '...', // 50-80 word serif sub-headline paragraph

  heroImageCaption: 'FIG. 01 · <description of the hero photo, ~12 words>',
  heroImageCredit: 'PHOTO · <PLACEHOLDER NAME> · 2026-MM-DD',

  metaCells: [
    // EXACTLY 5 cells — see "Meta strip" below
  ],

  bodyBlocks: [
    // 7 sections — see "Body sequence" below
  ],

  ctaCardTitle: COMMON_CTA_TITLE, // or override
  ctaCardBody: COMMON_CTA_BODY, // or override
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: '...', // distinct from any pull_quote inside the body
  pullQuoteAuthor: '...',
  pullQuoteRole: '...',
  pullQuoteLocation: 'JEBEL ALI', // mono caps

  specsAtGlance: [
    // 8-10 {label, value} rows
  ],
  galleryTotalCount: 38, // pick a plausible number 24-50
  downloads: [
    // 3-4 {label, url: '#', size, format} entries
  ],
  caseFileMeta: 'Case file · INTAKE-2026-MM-NNN · WO-2026-NNNN · Published 2026-MM-DD · Updated 2026-MM-DD',

  cardOneLiner: '...', // 30-50 words, distinct from `deck`
  cardOutcomePills: [
    { label: '...', style: 'good' },
    { label: '...', style: 'neutral' },
    { label: '...', style: 'accent' },
  ], // 3-4 pills total
  cardDurationLabel: '...', // e.g. "19 D ON BENCH" / "5 D EMERGENCY" / "48 H ON-SITE"
  cardTagStyle: '...', // 'oil' or 'standard' — see dispatch
  cardTagLabel: '...', // see dispatch (mono caps, e.g. "MUD PUMP")

  durationDays: NN,
  savingsAmount: NNNNNN, // optional; integer AED, omit if not a savings story
  savingsCurrency: 'AED', // omit when savingsAmount is omitted

  seoTitle: '...', // ≤200 chars
  seoDescription: '...', // ≤500 chars
  focusKeyword: '...', // ≤120 chars
}

export default CASE
```

## The shared helpers

Read `packages/db/src/imports/2026-05-11-service-cases-launch/shared.ts` for
the **exact** API. Key signatures:

- `sectionHead(number, anchor, title)` → adds a divider + numbered H2
- `lead(html)` → drop-cap paragraph (orange first letter)
- `para(html)` → normal `<p>`. May contain `<strong>`, `<a>`, `<em>`, `<ul>`, `<li>`
- `problemSolution({label, title, body}, {label, title, body})` → 2-column compare
- `figure(caption, { captionPrefix, placeholderLabel, aspectRatio })` → image/placeholder + caption
- `pullQuote(quote, cite)` → orange-bordered serif italic
- `approachGrid([{number, title, body, duration}, ...])` → 4-phase card grid
- `sopBlock(header, completion, [{name, rows: [{task, detail, who, tool}]}, ...])` → SOP checklist
- `specTable(caption, [{component, spec, asFound, afterRebuild, status, highlight, asFoundStyle, afterStyle}, ...])`
- `resultBox(label, title, body, [{value, valueSmall, label, style}, ...])` → dark outcome panel
- `teamList(intro, [{name, role, location, scope}, ...], caseFileMeta)` → team bullets

## Body sequence (REQUIRED — all 7 sections in this order)

```
sectionHead('/01', 'problem', '<your section title>'),
lead('<60-100 word HTML drop-cap paragraph>'),
para('<90-130 word HTML paragraph>'),
problemSolution(
  { label: 'What the operator told us', title: '...', body: '<60-90 word body>' },
  { label: 'What the inspection actually found', title: '...', body: '<60-90 word body>' },
),
para('<60-90 word setup paragraph leading into /02>'),

sectionHead('/02', 'solution', '<your section title>'),
para('<130-180 word HTML paragraph with <strong> spec callouts>'),
para('<90-130 word HTML paragraph>'),
figure('<30-50 word caption>', { captionPrefix: 'FIG. 02', placeholderLabel: '"<short photo description>\\n1200×675"' }),
pullQuote('<30-60 word quote in engineer voice>', '— Author Name · Role · Jebel Ali'),

sectionHead('/03', 'approach', '<your section title>'),
para('<40-60 word intro>'),
approachGrid([
  { number: 'PHASE 01', title: '<3-5 words>', body: '<25-40 word body>', duration: 'Days 0 — 2' },
  { number: 'PHASE 02', title: '<3-5 words>', body: '<25-40 word body>', duration: 'Days 3 — 4' },
  { number: 'PHASE 03', title: '<3-5 words>', body: '<25-40 word body>', duration: 'Days 5 — N' },
  { number: 'PHASE 04', title: '<3-5 words>', body: '<25-40 word body>', duration: 'Days N — N' },
]),

sectionHead('/04', 'sop', '<your section title>'),
para('<40-60 word intro>'),
sopBlock(
  'SOP-XX-NNN · <DESCRIPTION CAPS> · REV NN · NACE',
  'NN / NN COMPLETE',
  [
    {
      name: 'Phase 01 · <Heading>',
      rows: [
        { task: '<short task>', detail: '<10-20 word detail>', who: 'NAME / ROLE', tool: '<short tag>' },
        // 3-5 rows
      ],
    },
    // 3-5 phases, ~20-25 rows total
  ],
),

sectionHead('/05', 'technicals', '<your section title>'),
para('<40-60 word intro>'),
specTable(
  'FINDINGS · <ASSET TAG> · SERIAL <SN> · SOUR SERVICE',
  [
    {
      component: '<component>',
      spec: '<spec>',
      asFound: '<measured>',
      afterRebuild: '<measured>',
      status: '<status with leading symbol like ↻ or ✓>',
      highlight: true, // mark 3-4 critical findings
      asFoundStyle: 'bad', // for failures
      afterStyle: 'good',
    },
    // 8-12 rows total
  ],
),

sectionHead('/06', 'outcome', '<your section title>'),
para('<70-100 word outcome summary>'),
resultBox(
  'Result · summary',
  '<20-30 word outcome statement>',
  '<60-100 word body>',
  [
    { value: 'NN', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
    { value: 'NN / NN', label: '<metric>', style: 'good' },
    { value: 'NN / NN', label: '<metric>', style: 'good' },
    { value: 'NN', valueSmall: ' mo', label: 'System warranty' },
  ],
),

sectionHead('/07', 'team', '<your section title>'),
teamList(
  '<30-50 word intro>',
  [
    // 4-6 members
    { name: '<placeholder name>', role: '<role>', location: 'Jebel Ali', scope: '<15-30 word scope>' },
  ],
  'Case file · INTAKE-2026-MM-NNN · WO-2026-NNNN · Published 2026-MM-DD · Updated 2026-MM-DD',
),
```

## Meta strip (5 cells)

The 5 hero meta-strip cells are case-specific. Pattern:
```ts
metaCells: [
  { label: 'Asset', value: '<asset code>', valueSmall: ' · <short tag>', style: 'neutral' },
  { label: '<Quantity>', value: 'N', valueSmall: ' · <unit>', style: 'neutral' },
  { label: '<Quantity>', value: 'NN', valueSmall: ' · <unit>', style: 'neutral' },
  { label: 'Turnaround', value: 'NN', valueSmall: ' days', style: 'accent' },
  { label: 'H₂S service', value: 'NACE MR0175', style: 'good' }, // or another standard
]
```

## UAE-only context (NON-NEGOTIABLE)

- **Region**: UAE / Jebel Ali (JAFZA workshop) for everything. NO references to Mumbai, Houston, Pune, Houston, etc.
- **Operators / fields to weave in (where plausible)**: ADNOC, ADNOC Drilling, ADNOC Offshore (Lower Zakum, Upper Zakum, Hail & Ghasha), Saudi Aramco (Ghawar, Khurais, Hawiyah, Haradh, Khuff, Jafurah), KOC, PDO, QatarEnergy, BAPCO, Iraq south (Rumaila, West Qurna, Majnoon)
- **Sour service is the GCC default**. Reference NACE MR0175 / ISO 15156, HNBR / FKM (Viton) / AFLAS elastomers, B7M / L7M bolting, 316 SS fittings.
- **API standards** to namedrop: 16A (BOP), 16C (choke & kill), 16D (control units), 6A (wellhead/flanges/bolting), STD 53 (well-control systems), 7K (rotating equipment), 17D (subsea trees), 20E (BSL bolting). Cite EN 856 4SP, EN 853 2SN, EN 856 4SH for hose grades; API 7K-D for rotary lines.
- **Real numbers**: rod straightness `mm/m TIR`, bore tolerance `mm`, working pressure `psi`, hydrotest at `1.5× MAWP`, hose proof test at `2× WP`, accumulator pre-charge `1,000 psi N₂`, API STD 53 BOP test holds for 10 minutes.
- **Indus context**: Dubai HQ, Jebel Ali yard, +971 4 881 2345 (already in `COMMON_CTA_PHONE`), engineer placeholder bylines like "Khalid Al Marzouqi · Field Lead · Jebel Ali" or "Yusuf Al Hashimi · Workshop Manager · Jebel Ali" or "Aisha Al Suwaidi · QA Lead · Jebel Ali" or "Omar Al Maktoum · Lead Fitter · Jebel Ali" or "Hassan Al Awadi · Hose Bay Supervisor · JAFZA". Use any plausible Emirati or GCC-Levantine names you like — placeholders only.

## Voice & substance

Read `~/Downloads/service-case-uae-cylinders-hoses.html` (or the equivalent already-merged page in this codebase) as the canonical voice reference. Key traits:

- **Concrete numbers, not adjectives**. "0.42 mm/m TIR" not "out of tolerance"; "525 bar held 30 min, leak-rate < 5 ml/min" not "passed pressure test".
- **Engineer voice**, not marketing. Direct, sometimes wry. Examples from the mock:
  - "We took the call on a Sunday."
  - "The story we got was: 'seal kits, please.' The story the unit told was longer than that."
  - "This is the case for sending an inspection engineer before you send a seal kit."
  - "You can't argue with sour service."
- **Inline `<strong>` for spec callouts** in `para()` HTML (e.g., `<strong>EN 856 4SP</strong>`).
- **Short, punchy paragraphs** — never wall of text.

## Output checklist before you finish

- [ ] File compiles: imports match `shared.ts`, no extra fields outside `ServiceCaseSeed`
- [ ] All 7 body sections present in the right order with the right anchor strings
- [ ] At least one `figure` and one `pullQuote` in the body
- [ ] SOP block has 3-5 phases, ~20-25 rows total
- [ ] Spec table has 8-12 rows with 3-4 highlighted (critical findings)
- [ ] Result box has exactly 4 metric cells with the first one styled `'accent'`
- [ ] Team list has 4-6 members + caseFileMeta footer
- [ ] Card display fields all set (cardOneLiner, 3-4 outcome pills, cardDurationLabel)
- [ ] All currency in AED, all locations in UAE, no India / Mumbai / Houston references
- [ ] `slug` matches the dispatch
- [ ] `isFeatured: true` ONLY for case 01

When done, do not run anything. Just save the file. The orchestrator
typechecks + runs the import.
