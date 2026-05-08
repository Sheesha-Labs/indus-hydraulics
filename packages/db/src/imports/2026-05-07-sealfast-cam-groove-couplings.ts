/**
 * Bulk Sealfast Cam & Groove Couplings import — 2026-05-07
 *
 * 25 cam & groove coupling products from the Sealfast catalogue
 * (`01_couplings_cam-and-groove.pdf`, 28 pages) across 4 product
 * families: Standard (8), CrimpTEK (2), Self-Locking (6), Elbow (9).
 *
 * Adds:
 *   - 1 NEW brand: Sealfast (USA, isAuthorizedDistributor: true)
 *   - 1 NEW sub-category `cam-and-groove-couplings` under the existing
 *     `industrial-hoses` master (position 9)
 *   - 1 NEW spec template: `cam-groove-coupling-spec` (10 fields)
 *   - 25 products (SKU pattern: IH-CGC-{VARIANT}-{TYPE})
 *   - NEW megamenu sub-section "Couplings" under the existing
 *     "Industrial Hoses" column (alongside "Hoses by Service") with
 *     1 leaf "Cam & Groove Couplings"
 *
 * Spec values extracted from the Sealfast catalogue (image-only PDF
 * read visually). Pressure ratings, material options, and standards
 * are typical cam-and-groove industry conventions; refine in admin
 * once Sealfast technical datasheets are integrated per product.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-cam-groove-couplings.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-cam-groove-couplings.ts
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
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
  brandSlug: 'sealfast',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 14,
  countryOfOrigin: 'USA',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Type model ────────────────────────────────────────────────────────────

type Variant = 'standard' | 'crimptek' | 'self-locking' | 'elbow-90' | 'elbow-45'
type CouplingType =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'DA' | 'DC' | 'DD' | 'DP'

type CamGrooveInput = {
  sku: string
  title: string
  variant: Variant
  type: CouplingType
  endA: string
  endB: string
  sizeRange: string
  materials: string
  workingPressure: string
  standards: string
  gasket: string
  oneLiner: string
  notes?: string
}

const VARIANT_LABEL: Record<Variant, string> = {
  standard: 'Standard',
  crimptek: 'CrimpTEK',
  'self-locking': 'Self-Locking',
  'elbow-90': '90° Elbow',
  'elbow-45': '45° Elbow',
}

const VARIANT_CONTEXT: Record<Variant, string> = {
  standard:
    'Standard cam & groove couplings (sometimes called quick-disconnect or "camlock") use two cam arms to engage a male adapter into a female coupler with a soft gasket seal. Industry standard since 1949 for fast hose / pipe / tank connections in low-to-medium-pressure transfer applications. Compliant with MIL-A-A-59326 (US) and EN 14420 (Europe).',
  crimptek:
    'Sealfast CrimpTEK couplings replace the standard barbed shank with a precision-machined crimp shank designed for hydraulic crimping. Eliminates hose bands and re-usable threaded couplings — provides a fully crimped, leak-free hose-end termination matching the host hose ID and reinforcement.',
  'self-locking':
    'Sealfast Self-Locking cam & groove couplings have spring-loaded cam arms that automatically lock when the cam handles are seated. Prevents accidental disengagement under pressure spikes, vibration, or operator error — required for offshore, hazardous-fluid, and pressurised-air service. Backwards-compatible with standard couplings of the same type.',
  'elbow-90':
    '90° elbow cam & groove couplings combine a quick-disconnect cam-and-groove end with a 90° body to route hose / pipe around obstructions in tight spaces. Available in male adapter, female coupler, and shank end configurations.',
  'elbow-45':
    '45° elbow cam & groove couplings provide a moderate-angle bend at the coupling joint — useful when a 90° turn is too aggressive for the line geometry. Same cam-and-groove engagement as the standard family.',
}

// ── HTML description builder ──────────────────────────────────────────────

function camGrooveHtml(g: CamGrooveInput): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(VARIANT_LABEL[g.variant])} cam & groove coupling, Type ${escape(g.type)}, from the Sealfast industrial coupling range. Sealfast (USA) is a leading manufacturer of cam & groove couplings; Indus Hydraulics is an authorised distributor in the UAE.</p>
<h3>Configuration</h3>
<ul>
<li><strong>Variant:</strong> ${escape(VARIANT_LABEL[g.variant])}</li>
<li><strong>Type:</strong> ${escape(g.type)}</li>
<li><strong>End A:</strong> ${escape(g.endA)}</li>
<li><strong>End B:</strong> ${escape(g.endB)}</li>
</ul>
<h3>Specifications</h3>
<ul>
<li><strong>Size range:</strong> ${escape(g.sizeRange)}</li>
<li><strong>Materials available:</strong> ${escape(g.materials)}</li>
<li><strong>Working pressure:</strong> ${escape(g.workingPressure)}</li>
<li><strong>Gasket:</strong> ${escape(g.gasket)}</li>
<li><strong>Applicable standards:</strong> ${escape(g.standards)}</li>
${g.notes ? `<li><strong>Notes:</strong> ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Variant context</h3>
<p>${escape(VARIANT_CONTEXT[g.variant])}</p>
<h3>How to order</h3>
<p>Specify (a) the size (1/2", 3/4", 1", 1-1/4", 1-1/2", 2", 3", 4", 6"), (b) the body material from the available options, and (c) the gasket compound (Buna-N is standard; Viton, EPDM, or PTFE on request for chemical compatibility). Indus engineering will confirm the exact Sealfast part number on the RFQ.</p>
<h3>Companion products</h3>
<p>Pair with the matching cam & groove half (e.g., Type A pairs with Type B / D / DC; Type C pairs with Type E / F / DP), Sealfast hose clamps, and Indus industrial hose for a complete fluid-transfer assembly. Browse the Sealfast Couplings range for the full Standard / CrimpTEK / Self-Locking / Elbow family.</p>`
}

// ── FAQs (8 per product) ──────────────────────────────────────────────────

function camGrooveFaqs(g: CamGrooveInput): FaqEntry[] {
  return [
    {
      q: 'What is a cam & groove coupling?',
      a: 'A cam & groove (also called camlock or quick-disconnect) coupling uses two cam arms on a female "coupler" to engage a male "adapter". The cam arms rotate over a groove on the adapter, compressing a soft gasket to form a leak-free seal. Industry standard since 1949 for fast hose-to-hose, hose-to-pipe, and hose-to-tank connections in low-to-medium-pressure liquid and air transfer.',
    },
    {
      q: 'What does the Type letter mean?',
      a: `Type ${g.type} is the standard cam-and-groove configuration code: ${g.endA} on one end and ${g.endB} on the other. The Type letters are an industry-wide convention — Type A through Type F cover the most common combinations of male adapter, female coupler, NPT thread, and barbed shank ends. Types DC and DP are dust caps and dust plugs.`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Sealfast manufactures the full sub-2" range across all materials; 3" to 6" sizes are typically aluminum, brass, and 316/304 SS only. Specify the size on the RFQ.`,
    },
    {
      q: 'What materials does this coupling come in?',
      a: `${g.materials}. Aluminum is the workhorse for general-service air / water / petroleum. Brass is used for marine, fuel, and food-contact service. 316 SS is required for chemical, pharma, and corrosive marine service. 304 SS for general SS. Plated iron / polypropylene / Nyglass are budget alternatives for non-corrosive low-pressure service.`,
    },
    {
      q: 'What is the working pressure?',
      a: `${g.workingPressure}. Cam & groove couplings are NOT designed for high-pressure hydraulic service — these are LOW-to-MEDIUM-pressure transfer fittings (typically up to 250 psi at sub-2" sizes, derating with size). For high-pressure hose-end fittings, see the Indus hose-fitting range.`,
    },
    {
      q: 'What gasket should I order?',
      a: `Standard gasket is Buna-N (nitrile) — compatible with petroleum, water, and most general-service fluids. Specify on the RFQ for chemical compatibility: Viton (FKM) for fuels and aggressive solvents; EPDM for ketones and water; PTFE for the most demanding chemical service. Sealfast supplies all gasket options. ${g.gasket}`,
    },
    {
      q: 'Is this product compliant with industry standards?',
      a: `${g.standards}. The cam-and-groove geometry is interchangeable with all major manufacturers (Dixon, OPW, PT Coupling, Banjo) of the same Type letter and size — Sealfast couplings will mate with any standards-compliant cam-and-groove half from the same family.`,
    },
    {
      q: 'Lead time?',
      a: 'Common sizes (1" to 4") in aluminum, brass, and SS are typically ex-stock from Indus Dubai. Less-common sizes / materials (6", Nyglass, polypropylene) typically ship within 14 working days. Self-Locking and CrimpTEK variants may add 7-10 days for less-common configurations.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeCamGroove(g: CamGrooveInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'cam-and-groove-couplings',
    specTemplateSlug: 'cam-groove-coupling-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: camGrooveHtml(g),
    specs: {
      variant: g.variant,
      type: g.type,
      end_a: g.endA,
      end_b: g.endB,
      size_range: g.sizeRange,
      materials_available: g.materials,
      working_pressure: g.workingPressure,
      gasket: g.gasket,
      applicable_standards: g.standards,
      ...(g.notes ? { notes: g.notes } : {}),
    },
    faqs: camGrooveFaqs(g),
    seoTitle: `${g.title} — Sealfast | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `Sealfast Type ${g.type} cam and groove`,
  }
}

// ── Spec template ─────────────────────────────────────────────────────────

const VARIANT_OPTIONS: Variant[] = [
  'standard',
  'crimptek',
  'self-locking',
  'elbow-90',
  'elbow-45',
]

const TYPE_OPTIONS: CouplingType[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'DA',
  'DC',
  'DD',
  'DP',
]

const CAM_GROOVE_SPEC: SpecTemplatePayload = {
  slug: 'cam-groove-coupling-spec',
  name: 'Cam & Groove Coupling Spec',
  description:
    'Spec template for cam & groove (camlock) couplings: Standard, CrimpTEK, Self-Locking, and Elbow variants in Types A–F, DA, DC, DD, DP. Captures variant, type, end configurations, size range, materials, working pressure, gasket, and applicable standards.',
  position: 8,
  fields: [
    {
      key: 'variant',
      label: 'Variant',
      dataType: 'select',
      options: VARIANT_OPTIONS,
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'type',
      label: 'Coupling Type',
      dataType: 'select',
      options: TYPE_OPTIONS,
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'end_a',
      label: 'End A Configuration',
      dataType: 'text',
      unit: null,
      group: 'Configuration',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 2,
    },
    {
      key: 'end_b',
      label: 'End B Configuration',
      dataType: 'text',
      unit: null,
      group: 'Configuration',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'size_range',
      label: 'Size Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'materials_available',
      label: 'Materials Available',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'working_pressure',
      label: 'Working Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 6,
    },
    {
      key: 'gasket',
      label: 'Standard Gasket',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'applicable_standards',
      label: 'Applicable Standards',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'notes',
      label: 'Notes',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
  ],
}

// ── Common spec values shared across most types ───────────────────────────

const STD_SIZE_RANGE = '1/2", 3/4", 1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4", 5", 6" (size availability varies by material)'
const STD_MATERIALS = 'Aluminum, Brass, 316 Stainless Steel, 304 Stainless Steel, Plated Iron, Polypropylene, Nyglass (composite)'
const STD_PRESSURE = 'Up to 250 psi (1/2"–2"); 150 psi (3"–4"); 75 psi (5"–6") — derates with size, see datasheet'
const STD_STANDARDS = 'MIL-A-A-59326 (US), EN 14420-7 (Europe), ISO 16028-compatible cam geometry'
const STD_GASKET = 'Buna-N (nitrile) standard. Viton (FKM), EPDM, PTFE, Neoprene available on request for chemical compatibility'

const SS_MATERIALS = 'Stainless steel grades only (316 SS, 304 SS)'
const SL_MATERIALS = 'Aluminum, Brass, 316 Stainless Steel'
const ELBOW_MATERIALS = 'Aluminum, Polypropylene, Plated Iron (selected types)'

// ── Product data — 25 entries ─────────────────────────────────────────────

const PRODUCTS: CamGrooveInput[] = [
  // ── Standard (8) ────────────────────────────────────────────────────────
  {
    sku: 'IH-CGC-STD-A',
    title: 'Standard Type A: Female NPT × Male Adapter Cam and Groove Coupling',
    variant: 'standard',
    type: 'A',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler',
    endB: 'Female NPT thread — screws onto a male NPT pipe / fitting',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type A — male adapter on the cam side, female NPT thread on the back. The most common adapter configuration for connecting a tank / pipe outlet to a hose with a Type C / D / DC mating coupler.',
  },
  {
    sku: 'IH-CGC-STD-B',
    title: 'Standard Type B: Female Coupler × Male NPT Cam and Groove Coupling',
    variant: 'standard',
    type: 'B',
    endA: 'Female coupler (with cam arms) — engages a male adapter',
    endB: 'Male NPT thread — screws into a female NPT port',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type B — female coupler on the cam side, male NPT thread on the back. Connects a male NPT port (pump discharge, valve outlet) to a hose with a Type E / F mating adapter.',
  },
  {
    sku: 'IH-CGC-STD-C',
    title: 'Standard Type C: Female Coupler × Shank Cam and Groove Coupling',
    variant: 'standard',
    type: 'C',
    endA: 'Female coupler (with cam arms) — engages a male adapter',
    endB: 'Barbed shank — slides into hose end and clamps with a hose band',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type C — female coupler on the cam side, barbed shank on the back. The workhorse hose-end coupling: clamps onto a hose with two hose bands, then quick-connects to a Type E / F male adapter.',
  },
  {
    sku: 'IH-CGC-STD-D',
    title: 'Standard Type D: Female Coupler × Female NPT Cam and Groove Coupling',
    variant: 'standard',
    type: 'D',
    endA: 'Female coupler (with cam arms) — engages a male adapter',
    endB: 'Female NPT thread — screws onto a male NPT pipe',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type D — female coupler on the cam side, female NPT thread on the back. Connects a male NPT pipe to a hose with a Type E / F mating adapter.',
  },
  {
    sku: 'IH-CGC-STD-E',
    title: 'Standard Type E: Male Adapter × Shank Cam and Groove Coupling',
    variant: 'standard',
    type: 'E',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler',
    endB: 'Barbed shank — slides into hose end and clamps with a hose band',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type E — male adapter on the cam side, barbed shank on the back. The complement to Type C: clamps onto a hose, then quick-connects into a Type B / C / D female coupler.',
  },
  {
    sku: 'IH-CGC-STD-F',
    title: 'Standard Type F: Male Adapter × Male NPT Cam and Groove Coupling',
    variant: 'standard',
    type: 'F',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler',
    endB: 'Male NPT thread — screws into a female NPT port',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard cam & groove Type F — male adapter on the cam side, male NPT thread on the back. Connects a female NPT port to a hose with a Type B / C / D female-coupler hose end.',
  },
  {
    sku: 'IH-CGC-STD-DC',
    title: 'Standard Type DC: Coupler Dust Cap',
    variant: 'standard',
    type: 'DC',
    endA: 'Female coupler (with cam arms) — engages a male adapter for dust protection',
    endB: 'Solid cap — closes the coupler when not in service',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: 'Not designed for pressure applications — dust protection only',
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard Type DC dust cap — female coupler that clamps over a male adapter (Type A / E / F) to keep dust, dirt, and contamination out when the line is not in service. NOT a pressure-rated cap.',
    notes: 'NOT designed for pressure applications. Order one DC per Type A/E/F adapter to be capped.',
  },
  {
    sku: 'IH-CGC-STD-DP',
    title: 'Standard Type DP Dust Plug Adapter',
    variant: 'standard',
    type: 'DP',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler for dust protection',
    endB: 'Solid plug — closes the female coupler when not in service',
    sizeRange: STD_SIZE_RANGE,
    materials: STD_MATERIALS,
    workingPressure: 'Not designed for pressure applications — dust protection only',
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Standard Type DP dust plug — male adapter that engages into a female coupler (Type B / C / D) to keep dust and contamination out of the open coupler when not in service. NOT a pressure-rated plug.',
    notes: 'NOT designed for pressure applications. Order one DP per Type B/C/D coupler to be plugged.',
  },

  // ── CrimpTEK (2) ─────────────────────────────────────────────────────────
  {
    sku: 'IH-CGC-CT-C',
    title: 'CrimpTEK Type C: Female Coupler × Crimp Shank Cam and Groove Coupling',
    variant: 'crimptek',
    type: 'C',
    endA: 'Female coupler (with cam arms)',
    endB: 'Precision-machined crimp shank for hydraulic crimping',
    sizeRange: '3/4", 1", 1-1/4", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, Brass, 316 Stainless Steel',
    workingPressure: 'Per host hose rating (CrimpTEK eliminates the band-clamp pressure derate)',
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Sealfast CrimpTEK Type C — replaces the standard barbed shank with a precision-machined crimp shank. Crimps directly onto the hose for a leak-free, hose-band-free hose-end termination. Higher pressure rating than band-clamped Type C.',
    notes: 'Aluminum and Brass shanks are machined for hydraulic crimping. CrimpTEK eliminates the need for hose bands.',
  },
  {
    sku: 'IH-CGC-CT-E',
    title: 'CrimpTEK Type E: Male Adapter × Crimp Shank Cam and Groove Coupling',
    variant: 'crimptek',
    type: 'E',
    endA: 'Male adapter (cam-grooved)',
    endB: 'Precision-machined crimp shank for hydraulic crimping',
    sizeRange: '3/4", 1", 1-1/4", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, Brass, 316 Stainless Steel',
    workingPressure: 'Per host hose rating (CrimpTEK eliminates the band-clamp pressure derate)',
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Sealfast CrimpTEK Type E — replaces the standard barbed shank with a precision-machined crimp shank. Crimps directly onto the hose for a leak-free, hose-band-free hose-end termination.',
    notes: 'Pair with Sealfast hydraulic crimper sized to the host hose ID + reinforcement.',
  },

  // ── Self-Locking (6) ─────────────────────────────────────────────────────
  {
    sku: 'IH-CGC-SL-B',
    title: 'Self-Locking Type B: Female Coupler × Male NPT Self-Locking Cam and Groove Coupling',
    variant: 'self-locking',
    type: 'B',
    endA: 'Self-locking female coupler (spring-loaded cam arms)',
    endB: 'Male NPT thread',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4"',
    materials: SL_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type B — spring-loaded cam arms automatically lock when seated, preventing accidental disengagement under pressure spikes or vibration. Required for offshore, hazardous-fluid, and pressurised-air service. Backwards-compatible with standard Type A / DA adapters.',
  },
  {
    sku: 'IH-CGC-SL-C',
    title: 'Self-Locking Type C: Female Coupler × Hose Shank Self-Locking Cam and Groove Coupling',
    variant: 'self-locking',
    type: 'C',
    endA: 'Self-locking female coupler (spring-loaded cam arms)',
    endB: 'Barbed hose shank',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4"',
    materials: SL_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type C — spring-loaded cam arms with a barbed hose-shank back. Hose-end coupling for safety-critical service where accidental disengagement would be dangerous.',
  },
  {
    sku: 'IH-CGC-SL-DA',
    title: 'Self-Locking Type DA: Female Coupler × Male Adapter Self-Locking Cam and Groove Coupling',
    variant: 'self-locking',
    type: 'DA',
    endA: 'Self-locking female coupler (spring-loaded cam arms)',
    endB: 'Male adapter (cam-grooved)',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4"',
    materials: SL_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type DA — locking female coupler on one end, male adapter on the other. Inline hose-to-hose connector with safety lock for offshore / hazardous-service.',
  },
  {
    sku: 'IH-CGC-SL-D',
    title: 'Self-Locking Type D: Female Coupler × Female NPT Self-Locking Cam and Groove Coupling',
    variant: 'self-locking',
    type: 'D',
    endA: 'Self-locking female coupler (spring-loaded cam arms)',
    endB: 'Female NPT thread',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4"',
    materials: SL_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type D — locking female coupler with female NPT thread back. Connects a male NPT pipe to a hose with safety lock for accidental-disengagement protection.',
  },
  {
    sku: 'IH-CGC-SL-DC',
    title: 'Self-Locking Type DC Stainless Steel Coupler Dust Cap',
    variant: 'self-locking',
    type: 'DC',
    endA: 'Self-locking female coupler dust cap (spring-loaded cam arms)',
    endB: 'Solid cap',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 3", 4"',
    materials: SS_MATERIALS,
    workingPressure: 'Not designed for pressure applications — dust protection only',
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type DC dust cap in 316 stainless steel — locking female coupler that caps an open male adapter for hazardous-service idle-line protection. SS material for marine / chemical / offshore environments.',
    notes: 'NOT designed for pressure applications. SS-only for corrosive-environment idle protection.',
  },
  {
    sku: 'IH-CGC-SL-DD',
    title: 'Self-Locking Type DD: Female Coupler × Female Coupler Cam and Groove Coupling',
    variant: 'self-locking',
    type: 'DD',
    endA: 'Self-locking female coupler (spring-loaded cam arms)',
    endB: 'Self-locking female coupler (spring-loaded cam arms)',
    sizeRange: '1", 1-1/4", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum',
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Self-Locking Type DD — female coupler on BOTH ends. Connects two male adapters for hose-to-hose extension or adapter-to-adapter joining with two safety locks.',
  },

  // ── Elbow (9) ────────────────────────────────────────────────────────────
  {
    sku: 'IH-CGC-90-A',
    title: 'Type A 90° Elbow: Male Adapter × Female NPT Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'A',
    endA: 'Male adapter (cam-grooved)',
    endB: 'Female NPT thread, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type A 90° Elbow — male adapter on the cam side, female NPT thread at right angles. Routes a tank / valve outlet around an obstruction at 90° before the cam-and-groove disconnect.',
  },
  {
    sku: 'IH-CGC-90-B',
    title: 'Type B 90° Elbow: Female Coupler × Male NPT Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'B',
    endA: 'Female coupler (with cam arms)',
    endB: 'Male NPT thread, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type B 90° Elbow — female coupler on the cam side, male NPT thread at right angles. Routes a hose into a male NPT port at 90° angle.',
  },
  {
    sku: 'IH-CGC-90-C',
    title: 'Type C 90° Elbow: Female Coupler × Shank Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'C',
    endA: 'Female coupler (with cam arms)',
    endB: 'Barbed shank, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type C 90° Elbow — female coupler on the cam side, hose shank at right angles. Hose-end elbow for tight-radius hose routing.',
  },
  {
    sku: 'IH-CGC-90-D',
    title: 'Type D 90° Elbow: Female Coupler × Female NPT Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'D',
    endA: 'Female coupler (with cam arms)',
    endB: 'Female NPT thread, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type D 90° Elbow — female coupler on the cam side, female NPT thread at right angles. Routes a male NPT pipe at 90° before the cam-and-groove disconnect.',
  },
  {
    sku: 'IH-CGC-90-E',
    title: 'Type E 90° Elbow: Male Adapter × Shank Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'E',
    endA: 'Male adapter (cam-grooved)',
    endB: 'Barbed shank, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type E 90° Elbow — male adapter on the cam side, hose shank at right angles. Hose-end elbow for connecting a hose to a Type C / D / DC female coupler at 90°.',
  },
  {
    sku: 'IH-CGC-90-F',
    title: 'Type F 90° Elbow: Male Adapter × Male NPT Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'F',
    endA: 'Male adapter (cam-grooved)',
    endB: 'Male NPT thread, at 90° to the cam axis',
    sizeRange: '3/4", 1", 1-1/2", 2", 3", 4"',
    materials: ELBOW_MATERIALS,
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type F 90° Elbow — male adapter on the cam side, male NPT thread at right angles. Routes a female NPT port to a Type C / D female coupler at 90°.',
  },
  {
    sku: 'IH-CGC-90-DA',
    title: 'Type DA 90° Elbow: Female Coupler × Male Adapter Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'DA',
    endA: 'Female coupler (with cam arms)',
    endB: 'Male adapter (cam-grooved), at 90° to End A cam axis',
    sizeRange: '1-1/2", 2", 3", 4", 6"',
    materials: 'Aluminum, Plated Iron',
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type DA 90° Elbow — female coupler on one end, male adapter on the other, at 90°. Inline hose-to-hose elbow connector.',
  },
  {
    sku: 'IH-CGC-45-DA',
    title: 'Type DA 45° Elbow: Female Coupler × Male Adapter Cam and Groove Coupling',
    variant: 'elbow-45',
    type: 'DA',
    endA: 'Female coupler (with cam arms)',
    endB: 'Male adapter (cam-grooved), at 45° to End A cam axis',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum, Plated Iron',
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type DA 45° Elbow — female coupler on one end, male adapter on the other, at 45°. Moderate-angle hose-to-hose elbow when 90° is too aggressive.',
  },
  {
    sku: 'IH-CGC-90-DD',
    title: 'Type DD 90° Elbow: Female Coupler × Female Coupler Cam and Groove Coupling',
    variant: 'elbow-90',
    type: 'DD',
    endA: 'Female coupler (with cam arms)',
    endB: 'Female coupler (with cam arms), at 90° to End A cam axis',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum',
    workingPressure: STD_PRESSURE,
    standards: STD_STANDARDS,
    gasket: STD_GASKET,
    oneLiner: 'Type DD 90° Elbow — female coupler on BOTH ends, at 90°. Connects two male adapters at right angles for tight hose-to-hose routing.',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-sealfast-cam-groove-couplings',
    description:
      'Bulk-add 25 Sealfast cam & groove coupling products across 4 variants (Standard, CrimpTEK, Self-Locking, Elbow) under a NEW cam-and-groove-couplings sub-category of the existing industrial-hoses master. Adds 1 new brand (Sealfast, USA, authorised distributor), 1 new spec template (cam-groove-coupling-spec, 10 fields). Adds a NEW "Couplings" sub-section to the existing Industrial Hoses megamenu column.',
  },

  brands: [
    {
      slug: 'sealfast',
      name: 'Sealfast',
      description:
        'Sealfast is a leading US manufacturer of industrial cam & groove couplings, hose clamps, and fluid-transfer connectors. The Sealfast cam & groove range covers Standard, CrimpTEK (machined crimp shank), Self-Locking (spring-loaded cam arms for safety-critical service), and Elbow variants in aluminum, brass, 316/304 stainless steel, plated iron, polypropylene, and Nyglass composite. Indus Hydraulics is an authorised Sealfast distributor in the UAE.',
      country: 'USA',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Sealfast Cam & Groove Couplings — Authorised Distributor | Indus Hydraulics',
      seoDescription:
        'Sealfast cam & groove couplings: Standard, CrimpTEK, Self-Locking, Elbow variants in aluminum, brass, 316 SS, polypropylene. Types A-F + DA, DC, DD, DP. Authorised distributor.',
    },
  ],

  categories: [
    {
      slug: 'cam-and-groove-couplings',
      name: 'Cam & Groove Couplings',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Cam & groove (camlock / quick-disconnect) couplings — Standard, CrimpTEK, Self-Locking, and Elbow variants in Types A-F, DA, DC, DD, DP. The industry-standard quick-connect for industrial hose, pipe, and tank connections in low-to-medium-pressure service. MIL-A-A-59326 / EN 14420-7. Sealfast (USA) authorised range.',
      position: 9,
      isPublished: true,
      defaultSpecTemplateSlug: 'cam-groove-coupling-spec',
      seoTitle: 'Cam & Groove Couplings — Sealfast Type A-F, DA-DP | Indus Hydraulics',
      seoDescription:
        'Sealfast cam & groove (camlock) couplings: Standard / CrimpTEK / Self-Locking / Elbow in Types A-F, DA, DC, DD, DP. Aluminum, brass, 316 SS, PP, Nyglass. MIL-A-A-59326. Authorised distributor.',
    },
  ],

  specTemplates: [CAM_GROOVE_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'industrial-hoses',
    parentSubLabel: 'Couplings',
    createSubSectionIfMissing: true,
    replacements: [
      { label: 'Cam & Groove Couplings', categorySlug: 'cam-and-groove-couplings' },
    ],
  },

  products: PRODUCTS.map(makeCamGroove),
}

export default batch
