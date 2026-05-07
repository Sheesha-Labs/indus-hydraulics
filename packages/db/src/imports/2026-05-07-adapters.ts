/**
 * Bulk Hydraulic Adapters import — 2026-05-07
 *
 * 211 products across 8 NEW sub-categories under "Hoses & Fittings → Adapters":
 *   - DIN 2353 Bite Type Adapters: 45
 *   - BSP Adapters:                53
 *   - JIC Adapters:                37
 *   - ORFS Adapters:               24
 *   - Metric Adapters:             17
 *   - NPT Adapters:                20
 *   - SAE Flange Adapters:          5
 *   - Hydraulic SAE Flanges:       10
 *
 * Adds:
 *   - 1 NEW spec template:  hydraulic-adapter-spec (14 fields, port-A / port-B / port-C aware)
 *   - 8 NEW categories under hoses-fittings (positions 12–19)
 *   - Megamenu: replaces 5 placeholder customUrl leaves under
 *     "Hoses & Fittings → Adapters" with 8 real category-linked leaves
 *
 * Reuses the Indus brand from PR #65 — no new brand row.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-adapters.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-adapters.ts
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

// ── Type model ────────────────────────────────────────────────────────────

type SealValue =
  | '60-cone'
  | '37-cone'
  | '24-cone'
  | 'orfs'
  | 'npt-taper'
  | 'bspt-taper'
  | 'orb'
  | 'flat-face'
  | 'ed-seal'
  | 'bonded-seal'
  | 'flange-face'
  | 'weld'
  | 'none'

type GenderValue = 'male' | 'female' | 'female-swivel' | 'weld' | 'flange-face' | 'none'

type BodyConfig =
  | 'straight'
  | '45-elbow'
  | '90-elbow'
  | 'branch-tee'
  | 'run-tee'
  | 'swivel-tee'
  | 'cross'
  | 'bulkhead'
  | 'bulkhead-elbow'
  | 'banjo'
  | 'banjo-bolt'
  | 'plug'
  | 'cap'
  | 'reducer'
  | 'expander'
  | 'bonded-seal'
  | 'flange'
  | 'blind-flange'
  | 'weld-flange'
  | 'double-flange'
  | 'lock-nut'
  | 'cutting-ring'
  | 'weld-nipple'
  | 'accessory'

type Family =
  | 'DIN 2353'
  | 'BSP'
  | 'JIC'
  | 'ORFS'
  | 'Metric'
  | 'NPT'
  | 'SAE Flange Adapter'
  | 'Hydraulic SAE Flange'

type Port = [thread: string, seal: SealValue, gender: GenderValue]

type AdapterInput = {
  sku: string
  title: string
  bodyConfiguration: BodyConfig
  adjustable: boolean
  portA: Port
  portB?: Port
  portCSummary?: string
  sizeRange: string
  pressureMax?: string
  applicableStandards: string
  oneLiner: string
  notes?: string
}

// Family is derived from category for HTML / FAQ context
function familyFromCategory(slug: string): Family {
  switch (slug) {
    case 'din-2353-bite-type-adapters':
      return 'DIN 2353'
    case 'bsp-adapters':
      return 'BSP'
    case 'jic-adapters':
      return 'JIC'
    case 'orfs-adapters':
      return 'ORFS'
    case 'metric-adapters':
      return 'Metric'
    case 'npt-adapters':
      return 'NPT'
    case 'sae-flange-adapters':
      return 'SAE Flange Adapter'
    case 'hydraulic-sae-flanges':
      return 'Hydraulic SAE Flange'
    default:
      return 'DIN 2353'
  }
}

const FAMILY_CONTEXT: Record<Family, string> = {
  'DIN 2353':
    'DIN 2353 / ISO 8434-1 — 24° cone bite-type fittings using a hardened cutting-ring that grips the hardened-tube OD on assembly. The de-facto standard for hydraulic tube connections in Europe.',
  BSP: 'British Standard Pipe — ISO 228-1 (BSPP, parallel) and ISO 7-1 (BSPT, taper). BSPP requires a separate seal (bonded-seal washer, ED seal, 60° cone, or flat-face); BSPT is taper-on-taper self-sealing.',
  JIC: 'SAE J514 / ISO 8434-2 — 37° cone seat with UN/UNF threads. The dominant North-American hydraulic adapter family. Metal-on-metal seal, no soft seal needed.',
  ORFS: 'SAE J1453 / ISO 8434-3 — face O-ring seal on the male; flat face on the female. Leak-free under high vibration.',
  Metric: 'ISO 6149-1 / DIN 3852-2 — metric straight or 24° cone. Common on European OEM equipment.',
  NPT: 'ASME B1.20.1 / ISO 7-1 — National Pipe Taper. 60° thread angle (NOT interchangeable with BSPT 55°). PTFE tape or anaerobic sealant required for hydraulic service.',
  'SAE Flange Adapter':
    'SAE J518 4-bolt flange-on-fitting adapter — JIC, BSP, NPT, weld-tube, or metric on one end; SAE J518 Code 61 (L-series) or Code 62 (S-series) flange head on the other.',
  'Hydraulic SAE Flange':
    'SAE J518 4-bolt flanges (Code 61 standard / Code 62 high-pressure) with BSP- or NPT-threaded back, weld-in / weld-on, blind-flange, or accessory variants.',
}

const SEAL_LABEL: Record<SealValue, string> = {
  '60-cone': '60° cone seat',
  '37-cone': '37° cone (JIC)',
  '24-cone': '24° cone (DIN bite-type)',
  orfs: 'O-ring face seal (ORFS)',
  'npt-taper': 'NPT taper thread (self-sealing)',
  'bspt-taper': 'BSPT taper thread (self-sealing)',
  orb: 'O-ring boss (SAE J1926)',
  'flat-face': 'Flat-face seal',
  'ed-seal': 'Elastomeric ED seal',
  'bonded-seal': 'Bonded-seal washer',
  'flange-face': 'SAE J518 flange face',
  weld: 'Welded end',
  none: 'No threaded seal',
}

const GENDER_LABEL: Record<GenderValue, string> = {
  male: 'Male',
  female: 'Female',
  'female-swivel': 'Female swivel',
  weld: 'Weld end',
  'flange-face': 'Flange face',
  none: 'No port',
}

const BODY_LABEL: Record<BodyConfig, string> = {
  straight: 'Straight',
  '45-elbow': '45° elbow',
  '90-elbow': '90° elbow',
  'branch-tee': 'Branch tee',
  'run-tee': 'Run tee',
  'swivel-tee': 'Swivel-nut tee',
  cross: 'Cross',
  bulkhead: 'Bulkhead union',
  'bulkhead-elbow': 'Bulkhead elbow',
  banjo: 'Banjo',
  'banjo-bolt': 'Banjo bolt',
  plug: 'Blanking plug',
  cap: 'Cap',
  reducer: 'Reducer',
  expander: 'Expander',
  'bonded-seal': 'Bonded-seal washer',
  flange: 'Threaded flange',
  'blind-flange': 'Blind flange',
  'weld-flange': 'Weld flange',
  'double-flange': 'Double flange',
  'lock-nut': 'Lock nut',
  'cutting-ring': 'Cutting ring',
  'weld-nipple': 'Weld nipple',
  accessory: 'Accessory / spare part',
}

// ── HTML description builder ──────────────────────────────────────────────

function adapterHtml(g: AdapterInput, family: Family): string {
  const portARow = `<li><strong>Port A:</strong> ${escape(GENDER_LABEL[g.portA[2]])} — ${escape(g.portA[0])} (${escape(SEAL_LABEL[g.portA[1]])})</li>`
  const portBRow = g.portB
    ? `<li><strong>Port B:</strong> ${escape(GENDER_LABEL[g.portB[2]])} — ${escape(g.portB[0])} (${escape(SEAL_LABEL[g.portB[1]])})</li>`
    : ''
  const portCRow = g.portCSummary ? `<li><strong>Additional ports:</strong> ${escape(g.portCSummary)}</li>` : ''

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(BODY_LABEL[g.bodyConfiguration])} hydraulic adapter in the ${escape(family)} family. ${escape(g.oneLiner)}</p>
<h3>Construction</h3>
<ul>
<li>Body configuration: ${escape(BODY_LABEL[g.bodyConfiguration])}${g.adjustable ? ' (adjustable)' : ''}</li>
${portARow}
${portBRow}
${portCRow}
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
${g.notes ? `<li>Notes: ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>${escape(g.pressureMax ?? 'Working pressure matches the host port grade and the lowest-rated component in the assembly. Operating temperature -40°C to +120°C.')}. ${escape(family)} family — ${escape(FAMILY_CONTEXT[family])}</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
    .split(',')
    .map((s) => `<li>${escape(s.trim())}</li>`)
    .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host port size and thread spec on each end, (b) any special seal requirements (bonded seal vs ED seal vs cone seat), and (c) whether you need stainless-steel construction or non-standard surface treatment. Indus engineering will confirm the correct part number against your equipment.</p>
<h3>Companion products</h3>
<p>Pair with the appropriate Indus tubing or hose ends. For tube assemblies use Indus DIN 2353 cutting rings and end nuts. For hose assemblies pair with Indus crimp ferrules and the matching hose grade.</p>`
}

// ── FAQs (8 per product, family-aware) ────────────────────────────────────

function adapterFaqs(g: AdapterInput, family: Family): FaqEntry[] {
  const portB = g.portB
  return [
    {
      q: 'What thread family does this adapter use?',
      a: `${family}. ${FAMILY_CONTEXT[family]}`,
    },
    {
      q: 'What are the port specs?',
      a: portB
        ? `Port A: ${GENDER_LABEL[g.portA[2]]} ${g.portA[0]} (${SEAL_LABEL[g.portA[1]]}). Port B: ${GENDER_LABEL[portB[2]]} ${portB[0]} (${SEAL_LABEL[portB[1]]}).${g.portCSummary ? ` ${g.portCSummary}` : ''}`
        : `Single port: ${GENDER_LABEL[g.portA[2]]} ${g.portA[0]} (${SEAL_LABEL[g.portA[1]]}).`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Larger or non-standard sizes are typically quoted on request.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: g.pressureMax
        ? `${g.pressureMax}. The pressure rating tracks the lowest-rated component in the assembly — pair with appropriately rated host ports, hoses, and ferrules.`
        : 'This is a part / accessory — pressure rating is set by the host fitting it accompanies, not by the part itself.',
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, chemical, or food-grade service.',
    },
    {
      q: g.bodyConfiguration === 'plug' || g.bodyConfiguration === 'cap'
        ? 'When should I use a plug vs a cap?'
        : g.adjustable
          ? 'How does the adjustable mechanism work?'
          : 'Is this adapter interchangeable with other thread families?',
      a:
        g.bodyConfiguration === 'plug'
          ? 'Use a blanking plug to seal an unused port (e.g., during testing or when a port on a manifold is not yet wired up). The plug threads into the port and seals against the port seat.'
          : g.bodyConfiguration === 'cap'
            ? 'Use a cap to protect a male thread end during shipping or storage, or to permanently seal off a male stud. The cap threads onto the male thread and seals against the cone or face of the male body.'
            : g.adjustable
              ? 'Adjustable adapters use a locking nut on the body. After tightening into the host port, you rotate the body to align the elbow / branch in the desired direction, then tighten the lock nut against the host port to lock the orientation.'
              : `${family} is a thread family in its own right and is NOT directly interchangeable with other families (BSP / JIC / NPT / Metric / ORFS / DIN). Use the appropriate thread-mix adapter (e.g., m JIC × m BSPT) when crossing thread families.`,
    },
    {
      q: 'Do I need to crimp this onto a hose?',
      a: 'No — these are tube / port adapters, not hose ends. Use Indus crimp ferrules + Indus hose-end fittings for hose assemblies. These adapters thread into ports or join tube sections.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are ex-stock from Dubai. Less-common thread × seal × size combinations typically ship within 7 working days from RFQ confirmation.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeAdapter(g: AdapterInput, categorySlug: string): ProductImportPayload {
  const family = familyFromCategory(categorySlug)
  const specs: Record<string, string | number | boolean> = {
    body_configuration: g.bodyConfiguration,
    port_a_thread: g.portA[0],
    port_a_seal: g.portA[1],
    port_a_gender: g.portA[2],
    nominal_size_range: g.sizeRange,
    material: 'Carbon steel (stainless on request)',
    surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
    applicable_standards: g.applicableStandards,
  }
  if (g.portB) {
    specs.port_b_thread = g.portB[0]
    specs.port_b_seal = g.portB[1]
    specs.port_b_gender = g.portB[2]
  }
  if (g.portCSummary) specs.port_c_summary = g.portCSummary
  if (g.adjustable) specs.adjustable = true
  if (g.pressureMax) specs.working_pressure_max = g.pressureMax

  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug,
    specTemplateSlug: 'hydraulic-adapter-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: adapterHtml(g, family),
    specs,
    faqs: adapterFaqs(g, family),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${family} ${BODY_LABEL[g.bodyConfiguration]} adapter`,
  }
}

// ── Spec template ─────────────────────────────────────────────────────────

const SEAL_OPTIONS = [
  '60-cone',
  '37-cone',
  '24-cone',
  'orfs',
  'npt-taper',
  'bspt-taper',
  'orb',
  'flat-face',
  'ed-seal',
  'bonded-seal',
  'flange-face',
  'weld',
  'none',
]

const GENDER_OPTIONS = ['male', 'female', 'female-swivel', 'weld', 'flange-face', 'none']

const BODY_OPTIONS = [
  'straight',
  '45-elbow',
  '90-elbow',
  'branch-tee',
  'run-tee',
  'swivel-tee',
  'cross',
  'bulkhead',
  'bulkhead-elbow',
  'banjo',
  'banjo-bolt',
  'plug',
  'cap',
  'reducer',
  'expander',
  'bonded-seal',
  'flange',
  'blind-flange',
  'weld-flange',
  'double-flange',
  'lock-nut',
  'cutting-ring',
  'weld-nipple',
  'accessory',
]

const HYDRAULIC_ADAPTER_SPEC: SpecTemplatePayload = {
  slug: 'hydraulic-adapter-spec',
  name: 'Hydraulic Adapter Spec',
  description:
    'Spec template for hydraulic adapter products: DIN 2353 bite-type, BSP, JIC, ORFS, NPT, Metric, SAE Flange Adapter, and threaded/weld/blind hydraulic flange variants. Captures up to three ports plus body configuration, size, pressure, material, and standards.',
  position: 4,
  fields: [
    {
      key: 'body_configuration',
      label: 'Body Configuration',
      dataType: 'select',
      options: BODY_OPTIONS,
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'port_a_thread',
      label: 'Port A Thread',
      dataType: 'text',
      unit: null,
      group: 'Port A',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'port_a_seal',
      label: 'Port A Sealing',
      dataType: 'select',
      options: SEAL_OPTIONS,
      unit: null,
      group: 'Port A',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 2,
    },
    {
      key: 'port_a_gender',
      label: 'Port A Gender',
      dataType: 'select',
      options: GENDER_OPTIONS,
      unit: null,
      group: 'Port A',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'port_b_thread',
      label: 'Port B Thread',
      dataType: 'text',
      unit: null,
      group: 'Port B',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'port_b_seal',
      label: 'Port B Sealing',
      dataType: 'select',
      options: SEAL_OPTIONS,
      unit: null,
      group: 'Port B',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'port_b_gender',
      label: 'Port B Gender',
      dataType: 'select',
      options: GENDER_OPTIONS,
      unit: null,
      group: 'Port B',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'port_c_summary',
      label: 'Additional Ports',
      dataType: 'text',
      unit: null,
      group: 'Port C',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'adjustable',
      label: 'Adjustable',
      dataType: 'boolean',
      unit: null,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'nominal_size_range',
      label: 'Nominal Size Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'working_pressure_max',
      label: 'Max Working Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 10,
    },
    {
      key: 'material',
      label: 'Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'surface_treatment',
      label: 'Surface Treatment',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
    {
      key: 'applicable_standards',
      label: 'Applicable Standards',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — generated from /Users/ayushkbhatia/Downloads/Hydraulic Adapters Product.xlsx
// (211 entries; SKUs IH-AD-{SUB}-NNN; titles preserved from source with "(Variant N)"
// suffix where the source had duplicate names within a sub-category)
// ─────────────────────────────────────────────────────────────────────────

const DIN_BITE_TYPE: AdapterInput[] = [
  { sku: 'IH-AD-DIN-001', title: 'Orbital Weld Nipple', bodyConfiguration: 'weld-nipple', adjustable: false, portA: ['Tube weld end (DIN 24° sizes L6 to L42, S6 to S38)', 'weld', 'weld'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Orbital Weld Nipple — DIN 2353 family weld nipple for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-002', title: 'Lock Nut for Bulkhead', bodyConfiguration: 'lock-nut', adjustable: false, portA: ['Lock nut for DIN 2353 / SAE J518 bulkhead (matches host fitting thread)', 'none', 'female'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Lock Nut for Bulkhead — DIN 2353 family lock nut for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-003', title: 'Cutting Ring for 24° Cone End Nut', bodyConfiguration: 'cutting-ring', adjustable: false, portA: ['Cutting ring for DIN 2353 bite-type fitting (sizes L6 to L42, S6 to S38)', 'none', 'female'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Cutting Ring for 24° Cone End Nut — DIN 2353 family cutting ring for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-004', title: '24° Cone End Nut', bodyConfiguration: 'accessory', adjustable: false, portA: ['DIN 24° cone end nut, sizes L6 to L42 (light) and S6 to S38 (heavy)', 'none', 'female'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: '24° Cone End Nut — DIN 2353 family accessory for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-005', title: 'Union Cross', bodyConfiguration: 'cross', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portCSummary: 'Four ports total — all identical to Port A unless title indicates otherwise.', sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Union Cross — DIN 2353 family cross for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-006', title: 'Pump Connector', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Pump Connector — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-007', title: 'Swivel Nut Run Tee', bodyConfiguration: 'run-tee', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Nut Run Tee — DIN 2353 family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-008', title: 'Swivel Nut Branch Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Nut Branch Tee — DIN 2353 family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-009', title: 'Adjustable BranchTee', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable BranchTee — DIN 2353 family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-010', title: 'Adjustable Branch Tee m Metric X m SAE X m Metric', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portCSummary: 'Third port: male METRIC — Metric M10×1 to M42×2 (24° cone)', sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable Branch Tee m Metric X m SAE X m Metric — DIN 2353 family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-011', title: 'Adjustable BranchTee (Variant 2)', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable BranchTee — DIN 2353 family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-012', title: 'Adjustable RunTee', bodyConfiguration: 'run-tee', adjustable: true, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable RunTee — DIN 2353 family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-013', title: 'Adjustable Run Tee m Metric X m Metric', bodyConfiguration: 'run-tee', adjustable: true, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portB: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable Run Tee m Metric X m Metric — DIN 2353 family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-014', title: 'Union Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Union Tee — DIN 2353 family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-015', title: 'Male Female Connector', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Female Connector — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-016', title: 'Blanking Plug for Port with ED Seal', bodyConfiguration: 'plug', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', 'ed-seal', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Blanking Plug for Port with ED Seal — DIN 2353 family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-017', title: 'Blanking Plug with Nut for Cone', bodyConfiguration: 'plug', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Blanking Plug with Nut for Cone — DIN 2353 family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-018', title: 'Blanking Plug', bodyConfiguration: 'plug', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Blanking Plug — DIN 2353 family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-019', title: 'Swivel Union', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Union — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-020', title: 'Swivel Connector BSPP Flat', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Connector BSPP Flat — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-021', title: 'Swivel Connector BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Connector BSPT — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-022', title: 'Swivel Nut Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Nut Elbow — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-023', title: 'Swivel Connector BSPP 60° Cone Seat', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Connector BSPP 60° Cone Seat — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-024', title: 'Swivel Nut Union Tube End Reducer', bodyConfiguration: 'reducer', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Nut Union Tube End Reducer — DIN 2353 family reducer for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-025', title: 'Swivel Connector Metric', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'female-swivel'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Swivel Connector Metric — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-026', title: 'Bulkhead Elbow Union Metric', bodyConfiguration: 'bulkhead-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Bulkhead Elbow Union Metric — DIN 2353 family bulkhead elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-027', title: 'Bulkhead Elbow Union Metric (Variant 2)', bodyConfiguration: 'bulkhead-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Bulkhead Elbow Union Metric — DIN 2353 family bulkhead elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-028', title: 'Bulkhead Union Metric', bodyConfiguration: 'bulkhead', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Bulkhead Union Metric — DIN 2353 family bulkhead for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-029', title: 'Weld Connector', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Weld Connector — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-030', title: 'Male Stud Connector BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector BSPT — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-031', title: 'Male Stud Elbow BSPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Elbow BSPT — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-032', title: 'Male Stud Elbow NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Elbow NPT — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-033', title: 'Male Stud Connector NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector NPT — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-034', title: 'Male Stud Connector Metric', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector Metric — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-035', title: 'High Pressure Banjo Elbow Metric', bodyConfiguration: 'banjo', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'High Pressure Banjo Elbow Metric — DIN 2353 family banjo for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-036', title: 'Adjustable LockNut Elbow Metric', bodyConfiguration: '90-elbow', adjustable: true, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable LockNut Elbow Metric — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-037', title: 'High Pressure Banjo Elbow BSPP', bodyConfiguration: 'banjo', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'High Pressure Banjo Elbow BSPP — DIN 2353 family banjo for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-038', title: 'Male Stud Connector Metric with ED Seal', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', 'ed-seal', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector Metric with ED Seal — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-039', title: 'Adjustable Lock Nut Elbow BSPP', bodyConfiguration: '90-elbow', adjustable: true, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Adjustable Lock Nut Elbow BSPP — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-040', title: 'Male Stud Connector BSPP with ED Seal', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', 'ed-seal', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector BSPP with ED Seal — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-041', title: 'Male Stud Connector', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-042', title: 'Elbow Union', bodyConfiguration: '90-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Elbow Union — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-043', title: 'Male Stud Connector BSPP', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Male Stud Connector BSPP — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-044', title: 'Union Metric', bodyConfiguration: 'straight', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Union Metric — DIN 2353 family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-DIN-045', title: 'Union Elbow Metric', bodyConfiguration: '90-elbow', adjustable: false, portA: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], portB: ['DIN 24° cone L-series and S-series (M10×1 to M42×2)', '24-cone', 'male'], sizeRange: 'L6 to L42 (light series), S6 to S38 (heavy series)', pressureMax: 'L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Union Elbow Metric — DIN 2353 family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const BSP: AdapterInput[] = [
  { sku: 'IH-AD-BSP-001', title: 'Bulkhead Locknut', bodyConfiguration: 'lock-nut', adjustable: false, portA: ['Lock nut for DIN 2353 / SAE J518 bulkhead (matches host fitting thread)', 'none', 'female'], sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Bulkhead Locknut — BSP family lock nut for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-002', title: 'Female Thread Cross', bodyConfiguration: 'cross', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female'], portCSummary: 'Four ports total — all identical to Port A unless title indicates otherwise.', sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Female Thread Cross — BSP family cross for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-003', title: 'Swivel Nut Tee', bodyConfiguration: 'swivel-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Nut Tee — BSP family swivel tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-004', title: 'Female Thread Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Female Thread Tee — BSP family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-005', title: 'Swivel Nut Branch Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Nut Branch Tee — BSP family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-006', title: 'Swivel Nut Run Tee', bodyConfiguration: 'run-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Nut Run Tee — BSP family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-007', title: 'Union Tee BSPT', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union Tee BSPT — BSP family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-008', title: 'Male Stud Branch Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Branch Tee — BSP family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-009', title: 'Union Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union Tee — BSP family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-010', title: 'Male Stud Run Tee', bodyConfiguration: 'run-tee', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Run Tee — BSP family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-011', title: 'Female Swivel Cap', bodyConfiguration: 'cap', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Female Swivel Cap — BSP family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-012', title: 'Hexagon Socket Plug', bodyConfiguration: 'plug', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Hexagon Socket Plug — BSP family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-013', title: 'Blanking Plug for Ports with ED Seal', bodyConfiguration: 'plug', adjustable: false, portA: ['BSPP G1/8 to G2 with ED seal', 'ed-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Blanking Plug for Ports with ED Seal — BSP family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-014', title: 'Hex Head Plug', bodyConfiguration: 'plug', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Hex Head Plug — BSP family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-015', title: 'Female Thread Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Female Thread Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-016', title: 'BSP Plug (Plug)', bodyConfiguration: 'plug', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP Plug — BSP family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-017', title: 'BSP Female Connector', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP Female Connector — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-018', title: 'Male Female Thread Adaptor BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'female'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Female Thread Adaptor BSPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-019', title: 'Thread Reducer', bodyConfiguration: 'reducer', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Thread Reducer — BSP family reducer for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-020', title: 'Thread Adaptor BSP ED Seal', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 with ED seal', 'ed-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Thread Adaptor BSP ED Seal — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-021', title: 'Male Female Thread Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Female Thread Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-022', title: 'Thread Expander', bodyConfiguration: 'expander', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Thread Expander — BSP family expander for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-023', title: 'Swivel Nut Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Nut Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-024', title: 'Thread Reducer (Variant 2)', bodyConfiguration: 'reducer', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Thread Reducer — BSP family reducer for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-025', title: 'Swivel Nut Union', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'female-swivel'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Nut Union — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-026', title: 'Swivel Male Stud BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male Stud BSPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-027', title: 'Swivel Male Elbow NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male Elbow NPT — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-028', title: 'Swivel Male Stud NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male Stud NPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-029', title: 'Swivel Male 45° Elbow', bodyConfiguration: '45-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male 45° Elbow — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-030', title: 'Swivel Male Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-031', title: 'Bulkhead Union', bodyConfiguration: 'bulkhead', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Bulkhead Union — BSP family bulkhead for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-032', title: 'Swivel Male Stud', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Swivel Male Stud — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-033', title: 'Union Elbow BSPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union Elbow BSPT — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-034', title: 'Union BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union BSPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-035', title: 'Male Stud 45° Elbow BSPT', bodyConfiguration: '45-elbow', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud 45° Elbow BSPT — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-036', title: 'Male Stud Elbow BSPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Elbow BSPT — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-037', title: 'Male Stud Elbow UNF O-Ring', bodyConfiguration: '90-elbow', adjustable: false, portA: ['UNF straight (SAE J1926 ORB)', 'orb', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Elbow UNF O-Ring — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-038', title: 'Male Stud Connector BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector BSPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-039', title: 'Male Stud 45° Elbow UNF O-Ring', bodyConfiguration: '45-elbow', adjustable: false, portA: ['UNF straight (SAE J1926 ORB)', 'orb', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud 45° Elbow UNF O-Ring — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-040', title: 'Male Stud Connector UNF O-Ring', bodyConfiguration: 'straight', adjustable: false, portA: ['UNF straight (SAE J1926 ORB)', 'orb', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector UNF O-Ring — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-041', title: 'Male Stud 45° Elbow NPT', bodyConfiguration: '45-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud 45° Elbow NPT — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-042', title: 'Male Stud Elbow NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Elbow NPT — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-043', title: 'Male Stud Elbow JIC', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Elbow JIC — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-044', title: 'Male Stud Connector NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector NPT — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-045', title: 'Male Stud Connector JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector JIC — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-046', title: 'Male Stud Connector Metric O-Ring', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['Metric M10×1 to M42×2 (ORB)', 'orb', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector Metric O-Ring — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-047', title: 'Male Stud 45° Elbow BSPP O-Ring', bodyConfiguration: '45-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud 45° Elbow BSPP O-Ring — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-048', title: 'Male Stud Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-049', title: 'Male Stud Connector BSP O-Ring', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector BSP O-Ring — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-050', title: 'Male Stud Connector ORFS', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male Stud Connector ORFS — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-051', title: 'Union 45° Elbow', bodyConfiguration: '45-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union 45° Elbow — BSP family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-052', title: 'Union Elbow', bodyConfiguration: '90-elbow', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union Elbow — BSP family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-BSP-053', title: 'Union', bodyConfiguration: 'straight', adjustable: false, portA: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: 'G1/8 to G2', pressureMax: 'up to 400 bar at smaller sizes; derates with size', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Union — BSP family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const JIC: AdapterInput[] = [
  { sku: 'IH-AD-JIC-001', title: 'Lock Nut JIC', bodyConfiguration: 'lock-nut', adjustable: false, portA: ['Lock nut for DIN 2353 / SAE J518 bulkhead (matches host fitting thread)', 'none', 'female'], sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Lock Nut JIC — JIC family lock nut for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-002', title: 'Male Cross JIC', bodyConfiguration: 'cross', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portCSummary: 'Four ports total — all identical to Port A unless title indicates otherwise.', sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Cross JIC — JIC family cross for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-003', title: 'Run Tee Swivel JIC', bodyConfiguration: 'run-tee', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Run Tee Swivel JIC — JIC family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-004', title: 'Female Swivel Tee JIC', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Female Swivel Tee JIC — JIC family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-005', title: 'Male Tee JIC', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Tee JIC — JIC family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-006', title: 'Branch Tee Swivel Connector JIC', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Branch Tee Swivel Connector JIC — JIC family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-007', title: 'Adjustable Branch Tee m JIC X m NPT X m JIC', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portCSummary: 'Third port: male JIC — JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable Branch Tee m JIC X m NPT X m JIC — JIC family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-008', title: 'Adjustable Branch Tee m JIC X m SAE X m JIC', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portCSummary: 'Third port: male JIC — JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable Branch Tee m JIC X m SAE X m JIC — JIC family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-009', title: 'Adjustable Run Tee m JIC X m JIC X m Metric', bodyConfiguration: 'run-tee', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portCSummary: 'Third port: male METRIC — Metric M10×1 to M42×2 (24° cone)', sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable Run Tee m JIC X m JIC X m Metric — JIC family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-010', title: 'Adjustable Run Tee m JIC X m JIC X m BSP', bodyConfiguration: 'run-tee', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portCSummary: 'Third port: male BSPP — BSPP G1/8 to G2 (parallel)', sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable Run Tee m JIC X m JIC X m BSP — JIC family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-011', title: '90° Male Female Connector m JIC X f JIC', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90° Male Female Connector m JIC X f JIC — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-012', title: 'Cap JIC', bodyConfiguration: 'cap', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Cap JIC — JIC family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-013', title: 'Male Female Connector m JIC X f JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Female Connector m JIC X f JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-014', title: 'Plug JIC', bodyConfiguration: 'plug', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Plug JIC — JIC family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-015', title: 'Swivel Cap JIC', bodyConfiguration: 'cap', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Swivel Cap JIC — JIC family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-016', title: '45°  Female Swivel Connector JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '45°  Female Swivel Connector JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-017', title: '90°  Female Swivel Connector JIC', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90°  Female Swivel Connector JIC — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-018', title: '90° Swivel Connector m JIC X f JIC', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90° Swivel Connector m JIC X f JIC — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-019', title: 'Swivel Connector  f JIC x f JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Swivel Connector  f JIC x f JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-020', title: '45° Swivel Connector m JIC X f JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '45° Swivel Connector m JIC X f JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-021', title: 'Swivel Connector m JIC X f JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'female-swivel'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Swivel Connector m JIC X f JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-022', title: '90° Elbow m JIC X m BSPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90° Elbow m JIC X m BSPT — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-023', title: 'Bulkhead Union JIC', bodyConfiguration: 'bulkhead', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Bulkhead Union JIC — JIC family bulkhead for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-024', title: 'Male Connector m JIC X m BSPT', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector m JIC X m BSPT — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-025', title: '45° Elbow m JIC X m BSPT', bodyConfiguration: '45-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['BSPT R1/8 to R2 (taper)', 'bspt-taper', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '45° Elbow m JIC X m BSPT — JIC family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-026', title: 'Male Connector m JIC X m NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector m JIC X m NPT — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-027', title: '90° Elbow Connector m JIC X m NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90° Elbow Connector m JIC X m NPT — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-028', title: 'Adjustable 90° Elbow m JIC X m Metric Flat', bodyConfiguration: '90-elbow', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable 90° Elbow m JIC X m Metric Flat — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-029', title: 'Male Connector m JIC X m Metric', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector m JIC X m Metric — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-030', title: 'Male Connector m JIC X m Metric Flat with Seal', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector m JIC X m Metric Flat with Seal — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-031', title: 'Adjustable 45° Elbow m JIC X m Metric Flat', bodyConfiguration: '45-elbow', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable 45° Elbow m JIC X m Metric Flat — JIC family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-032', title: 'Adjustable 90° Elbow m JIC X m SAE', bodyConfiguration: '90-elbow', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable 90° Elbow m JIC X m SAE — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-033', title: 'Adjustable 90° Elbow m JIC X m BSP', bodyConfiguration: '90-elbow', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable 90° Elbow m JIC X m BSP — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-034', title: 'Adjustable 45° Elbow m JIC X m SAE', bodyConfiguration: '45-elbow', adjustable: true, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Adjustable 45° Elbow m JIC X m SAE — JIC family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-035', title: 'Male Connector m JIC X m SAE', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector m JIC X m SAE — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-036', title: 'Male Connector JIC', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male Connector JIC — JIC family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-JIC-037', title: '90° Elbow Connector m JIC', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], sizeRange: '-04 to -32 (1/4" to 2")', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: '90° Elbow Connector m JIC — JIC family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const ORFS: AdapterInput[] = [
  { sku: 'IH-AD-ORFS-001', title: 'Lock Nut ORFS', bodyConfiguration: 'lock-nut', adjustable: false, portA: ['Lock nut for DIN 2353 / SAE J518 bulkhead (matches host fitting thread)', 'none', 'female'], sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Lock Nut ORFS — ORFS family lock nut for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-002', title: 'Adjustable Branch Tee m ORFS X m SAE X m ORFS', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portCSummary: 'Third port: male ORFS — ORFS UN/UNF (9/16-18 to 1-7/16-12)', sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable Branch Tee m ORFS X m SAE X m ORFS — ORFS family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-003', title: 'Adjustable Branch Tee m ORFS X m BSP X m ORFS', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], portCSummary: 'Third port: male ORFS — ORFS UN/UNF (9/16-18 to 1-7/16-12)', sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable Branch Tee m ORFS X m BSP X m ORFS — ORFS family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-004', title: 'Adjustable Branch Tee m ORFS X m Metric X m ORFS', bodyConfiguration: 'branch-tee', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portCSummary: 'Third port: male ORFS — ORFS UN/UNF (9/16-18 to 1-7/16-12)', sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable Branch Tee m ORFS X m Metric X m ORFS — ORFS family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-005', title: 'Adjustable Run Tee m ORFS X m ORFS X m SAE', bodyConfiguration: 'run-tee', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portCSummary: 'Third port: male SAE — SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable Run Tee m ORFS X m ORFS X m SAE — ORFS family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-006', title: 'Adjustable Run Tee m ORFS X m ORFS X m Metric', bodyConfiguration: 'run-tee', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portCSummary: 'Third port: male METRIC — Metric M10×1 to M42×2 (24° cone)', sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable Run Tee m ORFS X m ORFS X m Metric — ORFS family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-007', title: 'Plug ORFS', bodyConfiguration: 'plug', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Plug ORFS — ORFS family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-008', title: 'Swivel Cap ORFS', bodyConfiguration: 'cap', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'female-swivel'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Swivel Cap ORFS — ORFS family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-009', title: 'Swivel Connector m SAE X f ORFS', bodyConfiguration: 'straight', adjustable: false, portA: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'female-swivel'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Swivel Connector m SAE X f ORFS — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-010', title: '90° Swivel Connector m ORFS X f ORFS', bodyConfiguration: '90-elbow', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'female-swivel'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: '90° Swivel Connector m ORFS X f ORFS — ORFS family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-011', title: 'Swivel Connector m ORFS X f ORFS', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'female-swivel'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Swivel Connector m ORFS X f ORFS — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-012', title: '45° Swivel Connector m ORFS X f ORFS', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'female-swivel'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: '45° Swivel Connector m ORFS X f ORFS — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-013', title: 'Bulkhead Union ORFS', bodyConfiguration: 'bulkhead', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Bulkhead Union ORFS — ORFS family bulkhead for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-014', title: 'Adjustable 90° Elbow m ORFS X m SAE', bodyConfiguration: '90-elbow', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable 90° Elbow m ORFS X m SAE — ORFS family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-015', title: 'Male Connector m ORFS X m SAE', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Male Connector m ORFS X m SAE — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-016', title: 'Adjustable 45° Elbow m ORFS X m SAE', bodyConfiguration: '45-elbow', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable 45° Elbow m ORFS X m SAE — ORFS family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-017', title: 'Male Connector m ORFS X m NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Male Connector m ORFS X m NPT — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-018', title: 'Adjustable 90° Elbow m ORFS X m Metric Flat', bodyConfiguration: '90-elbow', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable 90° Elbow m ORFS X m Metric Flat — ORFS family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-019', title: 'Male Connector m ORFS X m Metric Flat', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Male Connector m ORFS X m Metric Flat — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-020', title: 'Adjustable 90° Elbow m ORFS X m BSP', bodyConfiguration: '90-elbow', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable 90° Elbow m ORFS X m BSP — ORFS family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-021', title: 'Adjustable 45° Elbow m ORFS X m BSP', bodyConfiguration: '45-elbow', adjustable: true, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Adjustable 45° Elbow m ORFS X m BSP — ORFS family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-022', title: 'Male Connector m ORFS X m BSP', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['BSPP G1/8 to G2 (parallel)', 'bonded-seal', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Male Connector m ORFS X m BSP — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-023', title: '90° Elbow Connector m ORFS X m ORFS', bodyConfiguration: '90-elbow', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: '90° Elbow Connector m ORFS X m ORFS — ORFS family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-ORFS-024', title: 'Male Connector m ORFS X m ORFS', bodyConfiguration: 'straight', adjustable: false, portA: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], portB: ['ORFS UN/UNF (9/16-18 to 1-7/16-12)', 'orfs', 'male'], sizeRange: '-04 to -16', pressureMax: 'up to 415 bar (6000 psi)', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Male Connector m ORFS X m ORFS — ORFS family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const METRIC: AdapterInput[] = [
  { sku: 'IH-AD-MET-001', title: 'BSM Bonded Seal', bodyConfiguration: 'bonded-seal', adjustable: false, portA: ['Bonded-seal washer for BSPP / metric ports (sizes 1/8" to 2" / M10 to M42)', 'bonded-seal', 'none'], sizeRange: 'M10×1 to M42×2', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'BSM Bonded Seal — Metric family bonded seal for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-002', title: 'Male Cross Metric', bodyConfiguration: 'cross', adjustable: false, portA: ['Metric M10×1 to M42×2', 'flat-face', 'male'], portCSummary: 'Four ports total — all identical to Port A unless title indicates otherwise.', sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Cross Metric — Metric family cross for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-003', title: 'Swivel Cap Metric', bodyConfiguration: 'cap', adjustable: false, portA: ['Metric M10×1 to M42×2', 'flat-face', 'female-swivel'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Swivel Cap Metric — Metric family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-004', title: 'Male Metric Tee', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['Metric M10×1 to M42×2', 'flat-face', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Metric Tee — Metric family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-005', title: 'Bulkhead Union Metric Flat', bodyConfiguration: 'bulkhead', adjustable: false, portA: ['Metric M10×1 to M42×2', 'flat-face', 'male'], portB: ['Metric M10×1 to M42×2', 'flat-face', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Bulkhead Union Metric Flat — Metric family bulkhead for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-006', title: '90° Bulkhead Metric Flat', bodyConfiguration: 'bulkhead-elbow', adjustable: false, portA: ['Metric M10×1 to M42×2', 'flat-face', 'male'], portB: ['Metric M10×1 to M42×2', 'flat-face', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: '90° Bulkhead Metric Flat — Metric family bulkhead elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-007', title: 'Plug Metric', bodyConfiguration: 'plug', adjustable: false, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Plug Metric — Metric family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-008', title: 'Hollow Hex Plug Metric Flat', bodyConfiguration: 'plug', adjustable: false, portA: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Hollow Hex Plug Metric Flat — Metric family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-009', title: 'Plug Metric O-Ring', bodyConfiguration: 'plug', adjustable: false, portA: ['Metric M10×1 to M42×2 (ORB)', 'orb', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Plug Metric O-Ring — Metric family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-010', title: 'Plug Metric Seal Flat', bodyConfiguration: 'plug', adjustable: false, portA: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Plug Metric Seal Flat — Metric family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-011', title: 'Male Connector m Metric X m Komatsu', bodyConfiguration: 'straight', adjustable: false, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portB: ['JIS Komatsu metric (M14×1.5 to M33×2, 30° flare)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m Metric X m Komatsu — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-012', title: 'Male Connector m NPT X m Komatsu', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['JIS Komatsu metric (M14×1.5 to M33×2, 30° flare)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m NPT X m Komatsu — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-013', title: 'Male Connector m Metric Flat X m Komatsu', bodyConfiguration: 'straight', adjustable: false, portA: ['Metric M10×1 to M42×2 (flat-face)', 'flat-face', 'male'], portB: ['JIS Komatsu metric (M14×1.5 to M33×2, 30° flare)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m Metric Flat X m Komatsu — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-014', title: 'Male Connector m SAE X m Komatsu', bodyConfiguration: 'straight', adjustable: false, portA: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portB: ['JIS Komatsu metric (M14×1.5 to M33×2, 30° flare)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m SAE X m Komatsu — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-015', title: 'Male Connector m Komatsu', bodyConfiguration: 'straight', adjustable: false, portA: ['Metric M10×1 to M42×2', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m Komatsu — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-016', title: 'Male Connector m Metric X m SAE', bodyConfiguration: 'straight', adjustable: false, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portB: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m Metric X m SAE — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-MET-017', title: 'Male Connector m Metric X m Metric', bodyConfiguration: 'straight', adjustable: false, portA: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], portB: ['Metric M10×1 to M42×2 (24° cone)', '24-cone', 'male'], sizeRange: 'M10×1 to M42×2', pressureMax: 'up to 400 bar', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Male Connector m Metric X m Metric — Metric family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const NPT: AdapterInput[] = [
  { sku: 'IH-AD-NPT-001', title: 'Female Cross NPT', bodyConfiguration: 'cross', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portCSummary: 'Four ports total — all identical to Port A unless title indicates otherwise.', sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Female Cross NPT — NPT family cross for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-002', title: 'Branch Tee Connector f NPT X m NPT X f NPT', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portCSummary: 'Third port: female NPT — NPT taper 1/8" to 2"', sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Branch Tee Connector f NPT X m NPT X f NPT — NPT family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-003', title: 'Male Tee NPT', bodyConfiguration: 'branch-tee', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Male Tee NPT — NPT family branch tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-004', title: 'Run Tee Connector f NPT X f NPT X m NPT', bodyConfiguration: 'run-tee', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], portCSummary: 'Third port: male NPT — NPT taper 1/8" to 2"', sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Run Tee Connector f NPT X f NPT X m NPT — NPT family run tee for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-005', title: '90° Elbow Female f NPT X f Swivel NPSM', bodyConfiguration: '90-elbow', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: '90° Elbow Female f NPT X f Swivel NPSM — NPT family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-006', title: 'Female Connector f NPT X f Swivel NPSM', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Female Connector f NPT X f Swivel NPSM — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-007', title: '90° Elbow Fixed Female NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: '90° Elbow Fixed Female NPT — NPT family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-008', title: 'Fixed Female Connector NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Fixed Female Connector NPT — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-009', title: '90° Male Female Connector m NPT X f NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: '90° Male Female Connector m NPT X f NPT — NPT family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-010', title: 'Male Female Connector m SAE X f NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Male Female Connector m SAE X f NPT — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-011', title: 'Male Female Connector m NPT X f NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Male Female Connector m NPT X f NPT — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-012', title: 'Reducing Adaptor NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Reducing Adaptor NPT — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-013', title: 'Cap NPT', bodyConfiguration: 'cap', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'female'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Cap NPT — NPT family cap for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-014', title: 'Hollow Hex Insert Plug NPT', bodyConfiguration: 'plug', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Hollow Hex Insert Plug NPT — NPT family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-015', title: 'Plug NPT', bodyConfiguration: 'plug', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Plug NPT — NPT family plug for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-016', title: 'Swivel Connector m SAE X f NPSM', bodyConfiguration: 'straight', adjustable: false, portA: ['SAE J1926 ORB UN/UNF (7/16-20 to 1-7/8-12)', 'orb', 'male'], portB: ['NPSM straight pipe (parallel) 1/8" to 2"', 'flat-face', 'female-swivel'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Swivel Connector m SAE X f NPSM — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-017', title: '90° Swivel Connector m NPT X f NPSM', bodyConfiguration: '90-elbow', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPSM straight pipe (parallel) 1/8" to 2"', 'flat-face', 'female-swivel'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: '90° Swivel Connector m NPT X f NPSM — NPT family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-018', title: 'Swivel Connector m NPT X f NPSM', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPSM straight pipe (parallel) 1/8" to 2"', 'flat-face', 'female-swivel'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Swivel Connector m NPT X f NPSM — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-019', title: 'Male Connector m NPT X m NPT', bodyConfiguration: 'straight', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: 'Male Connector m NPT X m NPT — NPT family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-NPT-020', title: '90° Elbow Connector NPT', bodyConfiguration: '90-elbow', adjustable: false, portA: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], portB: ['NPT taper 1/8" to 2"', 'npt-taper', 'male'], sizeRange: 'NPT 1/8" to 2"', pressureMax: 'up to 350 bar (5000 psi)', applicableStandards: 'ASME B1.20.1, ISO 7-1', oneLiner: '90° Elbow Connector NPT — NPT family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const SAE_FLANGE_ADAPTERS: AdapterInput[] = [
  { sku: 'IH-AD-SAEFL-001', title: 'Weld Flange Connector L-series flange X Weld tube', bodyConfiguration: 'weld-flange', adjustable: false, portA: ['SAE J518 Code 61 L-series flange head (1/2" to 2")', 'flange-face', 'flange-face'], portB: ['Tube weld end (1/2" to 2")', 'weld', 'weld'], sizeRange: '1/2" to 2"', pressureMax: 'L-series up to 210 bar (3000 psi); S-series up to 415 bar (6000 psi)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'Weld Flange Connector L-series flange X Weld tube — SAE Flange Adapter family weld flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-SAEFL-002', title: 'Weld Flange Connector S-series flange X Weld tube', bodyConfiguration: 'weld-flange', adjustable: false, portA: ['SAE J518 Code 62 S-series flange head (1/2" to 2")', 'flange-face', 'flange-face'], portB: ['Tube weld end (1/2" to 2")', 'weld', 'weld'], sizeRange: '1/2" to 2"', pressureMax: 'L-series up to 210 bar (3000 psi); S-series up to 415 bar (6000 psi)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'Weld Flange Connector S-series flange X Weld tube — SAE Flange Adapter family weld flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-SAEFL-003', title: '45° Elbow Flange Connector m JIC X L-series flange', bodyConfiguration: '45-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J518 Code 61 L-series flange head (1/2" to 2")', 'flange-face', 'flange-face'], sizeRange: '1/2" to 2"', pressureMax: 'L-series up to 210 bar (3000 psi); S-series up to 415 bar (6000 psi)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '45° Elbow Flange Connector m JIC X L-series flange — SAE Flange Adapter family 45 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-SAEFL-004', title: 'Male Flange Connector m JIC X L-series flange', bodyConfiguration: 'straight', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J518 Code 61 L-series flange head (1/2" to 2")', 'flange-face', 'flange-face'], sizeRange: '1/2" to 2"', pressureMax: 'L-series up to 210 bar (3000 psi); S-series up to 415 bar (6000 psi)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'Male Flange Connector m JIC X L-series flange — SAE Flange Adapter family straight for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-SAEFL-005', title: '90° Elbow Flange Connector m JIC X L-series flange', bodyConfiguration: '90-elbow', adjustable: false, portA: ['JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', '37-cone', 'male'], portB: ['SAE J518 Code 61 L-series flange head (1/2" to 2")', 'flange-face', 'flange-face'], sizeRange: '1/2" to 2"', pressureMax: 'L-series up to 210 bar (3000 psi); S-series up to 415 bar (6000 psi)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '90° Elbow Flange Connector m JIC X L-series flange — SAE Flange Adapter family 90 elbow for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

const HYDRAULIC_SAE_FLANGES: AdapterInput[] = [
  { sku: 'IH-AD-HSF-001', title: 'BSP Threaded', bodyConfiguration: 'flange', adjustable: false, portA: ['SAE J518 flange face (Code 61 / Code 62)', 'flange-face', 'flange-face'], portB: ['BSPP G1/2 to G2 (parallel)', 'bonded-seal', 'female'], sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'BSP Threaded — Hydraulic SAE Flange family flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-002', title: 'BSP Threaded Double Flange', bodyConfiguration: 'double-flange', adjustable: false, portA: ['BSPP G1/2 to G2 (parallel)', 'bonded-seal', 'female'], portB: ['BSPP G1/2 to G2 (parallel)', 'bonded-seal', 'female'], portCSummary: 'Two SAE J518 flange faces (Code 61 / Code 62) on opposite sides of the body.', sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'BSP Threaded Double Flange — Hydraulic SAE Flange family double flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-003', title: 'NPT Threaded Double Flange', bodyConfiguration: 'double-flange', adjustable: false, portA: ['NPT 1/2" to 2"', 'npt-taper', 'female'], portB: ['NPT 1/2" to 2"', 'npt-taper', 'female'], portCSummary: 'Two SAE J518 flange faces (Code 61 / Code 62) on opposite sides of the body.', sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'NPT Threaded Double Flange — Hydraulic SAE Flange family double flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-004', title: 'NPT Threaded', bodyConfiguration: 'flange', adjustable: false, portA: ['SAE J518 flange face (Code 61 / Code 62)', 'flange-face', 'flange-face'], portB: ['NPT 1/2" to 2"', 'npt-taper', 'female'], sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'NPT Threaded — Hydraulic SAE Flange family flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-005', title: 'Weld-in Socket Weld', bodyConfiguration: 'weld-flange', adjustable: false, portA: ['SAE J518 flange face (Code 61 / Code 62)', 'flange-face', 'flange-face'], portB: ['Socket weld for tube/pipe end (1/2" to 5")', 'weld', 'weld'], sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'Weld-in Socket Weld — Hydraulic SAE Flange family weld flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-006', title: 'Socket Weld Double Flange', bodyConfiguration: 'double-flange', adjustable: false, portA: ['Socket weld for tube/pipe end (1/2" to 5")', 'weld', 'weld'], portB: ['Socket weld for tube/pipe end (1/2" to 5")', 'weld', 'weld'], portCSummary: 'Two SAE J518 flange faces (Code 61 / Code 62) on opposite sides of the body.', sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'Socket Weld Double Flange — Hydraulic SAE Flange family double flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-007', title: 'SAE Blind Flange', bodyConfiguration: 'blind-flange', adjustable: false, portA: ['SAE J518 blind flange (Code 61 sizes 1/2" to 5")', 'flange-face', 'flange-face'], sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'SAE Blind Flange — Hydraulic SAE Flange family blind flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-008', title: 'Weld-on Butt Weld', bodyConfiguration: 'weld-flange', adjustable: false, portA: ['SAE J518 flange face (Code 61 / Code 62)', 'flange-face', 'flange-face'], portB: ['Butt weld for pipe end (1/2" to 5")', 'weld', 'weld'], sizeRange: '1/2" to 5"', pressureMax: 'Code 61 up to 210 bar (3000 psi); Code 62 up to 415 bar (6000 psi)', applicableStandards: 'SAE J518', oneLiner: 'Weld-on Butt Weld — Hydraulic SAE Flange family weld flange for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-009', title: 'O-Rings for SAE Hydraulic Flanges', bodyConfiguration: 'accessory', adjustable: false, portA: ['SAE J518 flange-face O-ring (Code 61 / Code 62 sizes 1/2" to 5")', 'flange-face', 'none'], sizeRange: '1/2" to 5"', applicableStandards: 'SAE J518 (matching O-ring spare)', oneLiner: 'O-Rings for SAE Hydraulic Flanges — Hydraulic SAE Flange family accessory for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
  { sku: 'IH-AD-HSF-010', title: 'Set of Bolts and Spring Washers', bodyConfiguration: 'accessory', adjustable: false, portA: ['SAE J429 Grade 5 / Grade 8 bolt set with spring washers, matching SAE J518 4-bolt pattern', 'none', 'none'], sizeRange: '1/2" to 5"', applicableStandards: 'SAE J518, SAE J429', oneLiner: 'Set of Bolts and Spring Washers — Hydraulic SAE Flange family accessory for hydraulic line interconnection. RFQ-only; standard Indus zinc-plated carbon-steel construction.' },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-adapters',
    description:
      'Bulk-add 211 hydraulic adapters across 8 NEW sub-categories under Hoses & Fittings. Adds 1 new spec template (hydraulic-adapter-spec, 14 fields). Replaces 5 placeholder customUrl leaves under the Adapters megamenu sub with 8 real category-linked leaves. Reuses the Indus brand from PR #65.',
  },

  brands: [],

  categories: [
    {
      slug: 'din-2353-bite-type-adapters',
      name: 'DIN 2353 Bite Type Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'DIN 2353 / ISO 8434-1 bite-type tube adapters — 24° cone, hardened cutting-ring grip on tube OD. Standard for European hydraulic tube assemblies.',
      position: 12,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'DIN 2353 Bite Type Hydraulic Adapters | Indus Hydraulics',
      seoDescription:
        'DIN 2353 / ISO 8434-1 bite-type tube adapters — 24° cone, L-series and S-series, sizes M10 to M42. Tees, crosses, elbows, bulkheads, banjos, plugs, swivels, ED-seal variants.',
    },
    {
      slug: 'bsp-adapters',
      name: 'BSP Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'British Standard Pipe adapters — BSPP parallel (ISO 228-1) and BSPT taper (ISO 7-1). Bonded-seal, ED-seal, 60° cone, and flat-face variants in straight, elbow, tee, cross, bulkhead, plug, and male-stud configurations.',
      position: 13,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'BSP Hydraulic Adapters — BSPP & BSPT | Indus Hydraulics',
      seoDescription:
        'BSP hydraulic adapters: BSPP (parallel) with bonded-seal / ED-seal / 60° cone / flat-face, BSPT (taper) self-sealing. Sizes G1/8 to G2. Straight, elbows, tees, crosses, bulkheads, plugs.',
    },
    {
      slug: 'jic-adapters',
      name: 'JIC Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'JIC 37° cone adapters per SAE J514 / ISO 8434-2. UN/UNF threads, metal-on-metal seal, the standard for North-American hydraulic line connections.',
      position: 14,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'JIC 37° Hydraulic Adapters — SAE J514 | Indus Hydraulics',
      seoDescription:
        'JIC 37° cone adapters: SAE J514 / ISO 8434-2, UN/UNF threads, sizes -04 to -32 (1/4" to 2"). Crosses, tees, elbows, bulkheads, swivel connectors, plus mixed-thread (JIC × BSPT/NPT/Metric/SAE) adapters.',
    },
    {
      slug: 'orfs-adapters',
      name: 'ORFS Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'ORFS face-O-ring adapters per SAE J1453 / ISO 8434-3 — leak-free under high vibration. UN/UNF threads, sizes -04 to -16.',
      position: 15,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'ORFS Hydraulic Adapters — SAE J1453 | Indus Hydraulics',
      seoDescription:
        'ORFS hydraulic adapters: SAE J1453 / ISO 8434-3, UN/UNF threads, sizes -04 to -16. Tees, swivel connectors, bulkheads, plus mixed-thread (ORFS × SAE/NPT/BSP/Metric) adapters for transitions to other thread families.',
    },
    {
      slug: 'metric-adapters',
      name: 'Metric Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Metric thread adapters per ISO 6149-1 / DIN 3852-2 — 24° cone, flat-face, and ORB variants. Sizes M10×1 to M42×2. Includes Komatsu OEM-spec metric adapters.',
      position: 16,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'Metric Hydraulic Adapters — ISO 6149 / DIN 3852 | Indus Hydraulics',
      seoDescription:
        'Metric hydraulic adapters: ISO 6149-1 / DIN 3852-2, 24° cone, flat-face, ORB. M10×1 to M42×2. Crosses, tees, bulkheads, BSM bonded seals, Komatsu OEM-spec, plus mixed-thread (Metric × NPT/SAE) adapters.',
    },
    {
      slug: 'npt-adapters',
      name: 'NPT Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'NPT taper adapters per ASME B1.20.1 / ISO 7-1 — 60° thread angle (NOT interchangeable with BSPT 55°). PTFE tape or anaerobic sealant required for hydraulic service.',
      position: 17,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'NPT Hydraulic Adapters — ASME B1.20.1 | Indus Hydraulics',
      seoDescription:
        'NPT taper hydraulic adapters: ASME B1.20.1, sizes 1/8" to 2". Crosses, tees, elbows, plugs, NPSM swivels, plus mixed-thread (NPT × SAE/JIC/Metric) adapters.',
    },
    {
      slug: 'sae-flange-adapters',
      name: 'SAE Flange Adapters',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SAE J518 4-bolt flange-on-fitting adapters — JIC × flange and weld-tube × flange variants. Code 61 (L-series, 210 bar) and Code 62 (S-series, 415 bar).',
      position: 18,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'SAE Flange Adapters — Code 61 & Code 62 | Indus Hydraulics',
      seoDescription:
        'SAE J518 4-bolt flange-on-fitting adapters: weld-flange (tube × flange) and JIC × flange in straight, 45°, 90°. Code 61 (L-series, 210 bar) and Code 62 (S-series, 415 bar).',
    },
    {
      slug: 'hydraulic-sae-flanges',
      name: 'Hydraulic SAE Flanges',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SAE J518 hydraulic flanges — BSP/NPT-threaded back, weld-in / weld-on, blind-flange, plus accessory O-rings and bolt sets. Code 61 (210 bar) and Code 62 (415 bar). Sizes 1/2" to 5".',
      position: 19,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-adapter-spec',
      seoTitle: 'Hydraulic SAE Flanges — Code 61 & Code 62 | Indus Hydraulics',
      seoDescription:
        'SAE J518 hydraulic flanges: BSP-threaded, NPT-threaded, weld-in socket, weld-on butt, blind, double-flange, plus matching O-rings and bolt sets. Sizes 1/2" to 5". Code 61 (210 bar), Code 62 (415 bar).',
    },
  ],

  specTemplates: [HYDRAULIC_ADAPTER_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Adapters',
    replacements: [
      { label: 'DIN 2353 Bite Type Adapters', categorySlug: 'din-2353-bite-type-adapters' },
      { label: 'BSP Adapters', categorySlug: 'bsp-adapters' },
      { label: 'JIC Adapters', categorySlug: 'jic-adapters' },
      { label: 'ORFS Adapters', categorySlug: 'orfs-adapters' },
      { label: 'Metric Adapters', categorySlug: 'metric-adapters' },
      { label: 'NPT Adapters', categorySlug: 'npt-adapters' },
      { label: 'SAE Flange Adapters', categorySlug: 'sae-flange-adapters' },
      { label: 'Hydraulic SAE Flanges', categorySlug: 'hydraulic-sae-flanges' },
    ],
  },

  products: [
    ...DIN_BITE_TYPE.map((g) => makeAdapter(g, 'din-2353-bite-type-adapters')),
    ...BSP.map((g) => makeAdapter(g, 'bsp-adapters')),
    ...JIC.map((g) => makeAdapter(g, 'jic-adapters')),
    ...ORFS.map((g) => makeAdapter(g, 'orfs-adapters')),
    ...METRIC.map((g) => makeAdapter(g, 'metric-adapters')),
    ...NPT.map((g) => makeAdapter(g, 'npt-adapters')),
    ...SAE_FLANGE_ADAPTERS.map((g) => makeAdapter(g, 'sae-flange-adapters')),
    ...HYDRAULIC_SAE_FLANGES.map((g) => makeAdapter(g, 'hydraulic-sae-flanges')),
  ],
}

export default batch
