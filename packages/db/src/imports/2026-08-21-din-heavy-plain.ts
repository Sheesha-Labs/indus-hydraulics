/**
 * DIN heavy-series plain 24° cone females + Al Feel gap-fill go-live — 2026-08-21
 *
 * Follow-up to PR #265, which imported the six priority gaps from the Al Feel
 * product audit as drafts. Review flagged one modelling choice: the heavy-series
 * females were built as the O-ring type (DIN 3865 / ISO 12151-2), mirroring the
 * existing light-series four, whereas Al Feel lists the plain metal-to-metal
 * variant. Both are real parts and they do not substitute for each other — the
 * soft-seal version needs an O-ring groove in the mating port.
 *
 * This batch adds the three missing plain metal-to-metal heavy-series females:
 *
 *   IH-DF-FEM-24-HS      Metric Female 24° Cone (Heavy Series)
 *   IH-DF-FEM-24-HS-45   45° elbow
 *   IH-DF-FEM-24-HS-90   90° elbow
 *
 * They go in `active`, not draft — the founder approved the go-live for the whole
 * gap-fill set in the same pass.
 *
 * It also finishes the go-live the earlier PR deliberately left open:
 *   - publishes `pressure-washer-waterjet-fittings` (was isPublished:false)
 *   - adds its megamenu leaf under "Hose Fittings" (9 leaves -> 10; the column
 *     ceiling is 13, so this is inside it)
 *
 * The 11 products from PR #265 are flipped draft -> active by the companion
 * script, which runs AFTER this batch:
 *   src/scripts/publish-alfeel-gap-fill.ts
 *
 * NOTE ON IMAGES: every product in the gap-fill set ships without a photograph.
 * They are live and quotable but visually blank until renders are produced and
 * attached the usual way (generate, drop in a folder, run an attach script).
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-08-21-din-heavy-plain.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-08-21-din-heavy-plain.ts
 */
import type {
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
} from '../import/types'

// ── Common defaults ───────────────────────────────────────────────────────

const COMMON: Pick<
  ProductImportPayload,
  | 'brandSlug'
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
  | 'countryOfOrigin'
> = {
  brandSlug: 'indus',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 7,
  countryOfOrigin: 'UAE',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Threaded hose fittings ────────────────────────────────────────────────
// Same shape as 2026-05-07-fittings-2.ts and 2026-08-21-alfeel-gap-fill.ts so
// the rows are indistinguishable from their siblings in admin and on the PDP.

type FittingConfig = 'straight' | '45-elbow' | '90-elbow'

type ThreadedFitting = {
  sku: string
  title: string
  configuration: FittingConfig
  threadForm: string
  sealingForm: string
  gender: 'male' | 'female' | 'female-swivel'
  series: 'light-series' | 'heavy-series'
  sizeRange: string
  applicableStandards: string
  oneLiner: string
  notes?: string
}

const DIN_FAQ_CONTEXT =
  'DIN-style 24° cone — DIN 2353 / ISO 8434-1 (compression on tube) and DIN 3865 / ISO 12151-2 (with face O-ring). Heavy series (S) carries the higher pressure ratings and uses a thicker tube wall than light series (L); the two are not interchangeable.'

function fittingHtml(g: ThreadedFitting): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.configuration.replace('-', ' '))} hydraulic hose fitting in the DIN family — ${escape(g.gender)} thread with ${escape(g.sealingForm)} sealing form. Compliant with ${escape(g.applicableStandards)}.</p>
<h3>Construction</h3>
<ul>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Thread form: ${escape(g.threadForm)}</li>
<li>Sealing form: ${escape(g.sealingForm)}</li>
<li>Gender: ${escape(g.gender)}</li>
<li>Series: ${escape(g.series)}</li>
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
${g.notes ? `<li>Notes: ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Pressure rating matches the matching ferrule and host hose grade — see Indus Crimp Ferrules for compatibility tables. Tested to manufacturer-recommended impulse cycles when crimped to the correct ferrule diameter. Operating temperature -40°C to +120°C; refer to fluid compatibility chart for aggressive media.</p>
<h3>Metal-to-metal or O-ring?</h3>
<p>This is the <strong>metal-to-metal</strong> 24° cone — the seal is made by the cone seat itself, with no elastomer in the joint. It mates to a plain DIN 2353 24° port. If your port has an O-ring groove in the cone, you need the soft-seal version instead (see the Metric Female 24° O-ring Cone fittings in this category). The two look nearly identical and will not seal against each other's ports.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
  .split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching crimp ferrule (see the Crimp Ferrules category), and (c) the thread size you need. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with Indus crimp ferrules from the matching hose grade. For other thread families see the Metric, BSP, JIC 37°, DIN, and Japanese sub-categories under Hose Fittings.</p>`
}

function fittingFaqs(g: ThreadedFitting): FaqEntry[] {
  return [
    {
      q: 'What thread family does this fitting use?',
      a: `DIN. ${DIN_FAQ_CONTEXT}`,
    },
    {
      q: 'Metal-to-metal or O-ring — which do I need?',
      a: 'This is the metal-to-metal version: the 24° cone seat seals directly, with no elastomer in the joint. If the mating port has an O-ring groove machined into its cone, order the O-ring (soft-seal) version instead. The two are dimensionally close but will not seal against each other.',
    },
    {
      q: 'What thread sizes are available?',
      a: `${g.threadForm}. Common sizes ex-stock; specific thread × bore combinations typically ship within 7 working days.`,
    },
    {
      q: 'Light series or heavy series?',
      a: 'This is heavy series (S) — thicker tube wall and a higher pressure rating than light series (L). L and S ports are not interchangeable; check the machine spec before ordering.',
    },
    {
      q: 'What is the maximum working pressure?',
      a: 'Pressure rating matches the host hose grade and crimp ferrule when crimped to the correct diameter. The fitting itself does not derate the assembly. Refer to the matched hose grade for the bar/psi rating at your bore size.',
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, food-grade, and chemical service.',
    },
    {
      q: 'Which crimp ferrule should I pair with this fitting?',
      a: 'It can be paired with any compatible Indus crimp ferrule. The host hose grade determines the ferrule (skive vs no-skive, double-skive for spiral). Tell us your hose grade on the RFQ and we will recommend the correct ferrule + fitting combo.',
    },
    {
      q: 'Is crimping included?',
      a: 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request. Send your hose grade, bore size, fitting selections, and overall length on the RFQ.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are ex-stock from Dubai. Less-common thread × bore combinations typically ship within 7 working days.',
    },
  ]
}

function makeFitting(g: ThreadedFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'din-hose-fittings',
    specTemplateSlug: 'threaded-fitting-spec',
    descriptionShort:
      `${g.oneLiner} ${g.configuration.replace('-', ' ')}, ${g.threadForm}, ${g.sealingForm}.`.slice(
        0,
        500,
      ),
    descriptionLong: fittingHtml(g),
    specs: {
      fitting_configuration: g.configuration,
      thread_form: g.threadForm,
      sealing_form: g.sealingForm,
      gender: g.gender,
      series: g.series,
      nominal_size_range: g.sizeRange,
      material: 'Carbon steel (stainless on request)',
      surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
      applicable_standards: g.applicableStandards,
    },
    faqs: fittingFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `DIN ${g.configuration.replace('-', ' ')}`,
  }
}

// ── The three plain metal-to-metal heavy-series females ───────────────────

const THREAD_FORM = 'Metric (24° cone — DIN 2353 / ISO 8434-1, heavy series)'
const SEALING_FORM = '24° cone, metal-to-metal (no O-ring)'
const SIZE_RANGE = 'DN6 – DN38 (heavy series)'
const STANDARDS = 'DIN 2353, ISO 8434-1, ISO 12151-2'
const NOTES =
  'Metal-to-metal seat — for plain DIN 24° ports. Heavy series (S): higher pressure rating than light series (L), and not interchangeable with L-series ports.'

const DIN_HEAVY_PLAIN: ThreadedFitting[] = [
  {
    sku: 'IH-DF-FEM-24-HS',
    title: 'Metric Female 24° Cone (Heavy Series) Hose Fitting',
    configuration: 'straight',
    threadForm: THREAD_FORM,
    sealingForm: SEALING_FORM,
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: SIZE_RANGE,
    applicableStandards: STANDARDS,
    oneLiner:
      'Straight hose fitting with female-swivel 24° cone sealing metal-to-metal — heavy series — for high-pressure metric DIN tube ports without an O-ring groove.',
    notes: NOTES,
  },
  {
    sku: 'IH-DF-FEM-24-HS-45',
    title: '45° Metric Female 24° Cone (Heavy Series) Hose Fitting',
    configuration: '45-elbow',
    threadForm: THREAD_FORM,
    sealingForm: SEALING_FORM,
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: SIZE_RANGE,
    applicableStandards: STANDARDS,
    oneLiner:
      '45° elbow hose fitting with female-swivel 24° cone sealing metal-to-metal — heavy series — for tight routing into plain high-pressure metric DIN ports.',
    notes: NOTES,
  },
  {
    sku: 'IH-DF-FEM-24-HS-90',
    title: '90° Metric Female 24° Cone (Heavy Series) Hose Fitting',
    configuration: '90-elbow',
    threadForm: THREAD_FORM,
    sealingForm: SEALING_FORM,
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: SIZE_RANGE,
    applicableStandards: STANDARDS,
    oneLiner:
      '90° elbow hose fitting with female-swivel 24° cone sealing metal-to-metal — heavy series — for tight routing into plain high-pressure metric DIN ports.',
    notes: NOTES,
  },
]

// ── Category go-live ──────────────────────────────────────────────────────
// Re-declares the category created in PR #265 with isPublished flipped true.
// Everything else is byte-identical to the original payload, so the upsert
// changes exactly one column.

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'pressure-washer-waterjet-fittings',
    name: 'Pressure Washer & Waterjet Fittings',
    parentSlug: 'hoses-fittings',
    shortDescription:
      'Hose fittings and gun inserts for cold and hot water pressure washers and low-volume waterjet lines — M22 × 1.5, 3/8" BSP and Kärcher-pattern bayonet interchanges.',
    position: 32,
    isPublished: true,
    defaultSpecTemplateSlug: 'threaded-fitting-spec',
    seoTitle: 'Pressure Washer & Waterjet Hose Fittings — Dubai | Indus Hydraulics',
    seoDescription:
      'Pressure washer and waterjet hose fittings: M22 × 1.5 female swivels, 3/8" BSP, and Kärcher-pattern gun inserts. Crimped and pressure-tested in Dubai.',
  },
]

// ── Batch ─────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-08-21-din-heavy-plain',
    description:
      'Three plain metal-to-metal heavy-series DIN female fittings, plus the go-live of the pressure-washer category and its megamenu leaf.',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [],

  // Megamenu: "Hose Fittings" sub goes 9 leaves -> 10. replacePlaceholderLeaves
  // deletes the current leaves and reinserts this exact list, so all nine
  // existing entries are restated in their current order.
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Hose Fittings',
    replacements: [
      { label: 'Crimp Ferrules', categorySlug: 'crimp-ferrules' },
      { label: 'Metric Hose Fittings', categorySlug: 'metric-hose-fittings' },
      { label: 'DIN Hose Fittings', categorySlug: 'din-hose-fittings' },
      { label: 'BSP Hose Fittings', categorySlug: 'bsp-hose-fittings' },
      { label: 'JIC 37° Hose Fittings', categorySlug: 'jic-37-hose-fittings' },
      { label: 'Japanese Hose Fittings', categorySlug: 'japanese-hose-fittings' },
      { label: 'ORFS Hose Fittings', categorySlug: 'orfs-hose-fittings' },
      {
        label: 'NPT / NPSM / SAE Hose Fittings',
        categorySlug: 'npt-npsm-sae-hose-fittings',
      },
      { label: 'SAE Flange Fittings', categorySlug: 'sae-flange-fittings' },
      {
        label: 'Pressure Washer & Waterjet Fittings',
        categorySlug: 'pressure-washer-waterjet-fittings',
      },
    ],
  },

  products: DIN_HEAVY_PLAIN.map(makeFitting),
}

export default batch
