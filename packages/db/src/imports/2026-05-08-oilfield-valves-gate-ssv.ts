/**
 * Oilfield Valves — Batch 1 (Gate Valves + SSV/ESD) — 2026-05-08
 *
 * Adds 13 gate valves (Hydraulic FC, Manual FC, Manual FLS, Slab) and 3
 * Surface Safety Valves (Hydraulic SSV / SAH) to the Oilfield Valves
 * column established in Batch 0 (PR #86).
 *
 * What's new:
 *   - 2 sub-categories: oilfield-gate-valves, oilfield-ssv-esd-valves
 *     (under the existing oilfield-valves top-level)
 *   - oilfield-valve-spec template extended:
 *       • New field `material_class_api` (API 6A material class — EE, HH,
 *         etc.; covers chemistry/sour-class beyond what PSL/PR encode)
 *       • pr_class options extended to include 'PR2F' (fire-tested PR2)
 *   - Megamenu: extends "Wellhead & Frac" sub-section with 2 new leaves
 *     (Gate Valves, SSV & ESD Valves). Existing Ball Valves leaf preserved
 *     by listing it in the replacements array (replacePlaceholderLeaves
 *     deletes-and-recreates all leaves under the matched sub).
 *   - 16 products: 13 gate + 3 SSV
 *     • Sizes: 1-13/16", 2-1/16", 3-1/16", 3-1/8", 4-1/16"
 *     • Pressures: 5K / 10K / 15K psi (API 6A wellhead-flanged)
 *     • Service: 14 sour (NACE) + 2 standard (small-bore Indus + 5K Stream-Flo)
 *     • Brand split: Cameron 5, FMC 4, WOM 3, Stream-Flo 3, Indus 1
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 * No new brands in this batch (all 6 from Batch 0 are reused).
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-gate-ssv.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-gate-ssv.ts
 */
import type {
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtPsi(psi: number): string {
  return psi.toLocaleString('en-US') + ' psi'
}

// ── Categories ────────────────────────────────────────────────────────────

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'oilfield-gate-valves',
    name: 'Gate Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Wellhead and frac gate valves — manual, hydraulic, and slab designs. API 6A 5K / 10K / 15K psi flanged ends, sour-service (NACE) and standard. Fail-close (FC) and fail-last-stable (FLS) actuator options.',
    position: 1,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Gate Valves — Manual, Hydraulic, Slab | Indus Hydraulics',
    seoDescription:
      'API 6A wellhead gate valves: manual, hydraulic FC, manual FLS, and slab designs. 5K-15K psi, sour and standard service. PSL 1-3G, PR1/PR2/PR2F. AED pricing, RFQ.',
  },
  {
    slug: 'oilfield-ssv-esd-valves',
    name: 'SSV & ESD Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Surface Safety Valves (SSV) and Emergency Shutdown Valves (ESD) for wellhead and Christmas tree service. Hydraulically-actuated, fail-close, API 6A SSV Class II. 10K and 15K psi.',
    position: 2,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'SSV & ESD Valves — Surface Safety / Emergency Shutdown | Indus Hydraulics',
    seoDescription:
      'API 6A Surface Safety Valves and Emergency Shutdown Valves for wellhead Christmas trees. Hydraulic fail-close, SSV Class II, 10K-15K psi. Sour-service compliant. AED pricing, RFQ.',
  },
]

// ── Spec template — additive update ───────────────────────────────────────
//
// Adds one new field (material_class_api) and extends pr_class options to
// include PR2F. The importer's upsertSpecTemplate is additive: existing
// fields are updated in-place, new fields are inserted, no orphan removal.
// All existing fields and their data on Batch 0 ball-valve products survive.

const OILFIELD_VALVE_SPEC: SpecTemplatePayload = {
  slug: 'oilfield-valve-spec',
  name: 'Oilfield Valve',
  description:
    'Spec template for wellhead, frac, and process oilfield valves: ball, gate, check, plug, choke, globe, butterfly, SSV/ESD, pressure relief, instrumentation.',
  position: 19,
  fields: [
    {
      key: 'valve_type',
      label: 'Valve Type',
      dataType: 'select',
      options: [
        'Ball — Floating',
        'Ball — Trunnion',
        'Gate — Manual',
        'Gate — Hydraulic',
        'Gate — Slab',
        'Check — Swing',
        'Check — Dart',
        'Check — Type R (Wafer)',
        'Plug',
        'Choke',
        'Globe',
        'Butterfly',
        'Pressure Relief',
        'Surface Safety (SSV)',
        'ESD',
        'Instrumentation',
      ],
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'nominal_size',
      label: 'Nominal Size',
      dataType: 'text',
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'working_pressure_psi',
      label: 'Working Pressure',
      unit: 'psi',
      dataType: 'number',
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'pressure_class',
      label: 'Pressure Class',
      dataType: 'select',
      options: [
        'ANSI 150',
        'ANSI 300',
        'ANSI 600',
        'ANSI 900',
        'ANSI 1500',
        'ANSI 2500',
        '2K',
        '3K',
        '5K',
        '10K',
        '15K',
        '20K',
      ],
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'end_connection_inlet',
      label: 'End Connection (Inlet)',
      dataType: 'text',
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'end_connection_outlet',
      label: 'End Connection (Outlet)',
      dataType: 'text',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: [
        'Standard',
        'Sour (NACE MR0175)',
        'High Temperature',
        'Low Temperature',
        'Cryogenic',
      ],
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 6,
    },
    {
      key: 'api_spec',
      label: 'API Specification',
      dataType: 'select',
      options: [
        'API 6A',
        'API 6D',
        'API 6DSS',
        'API 16C',
        'API 17D',
        'API 600',
        'API 602',
        'API 608',
        'ASME B16.34',
        'Other',
      ],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'psl_class',
      label: 'PSL Class',
      dataType: 'select',
      options: ['PSL 1', 'PSL 2', 'PSL 3', 'PSL 3G', 'PSL 4', 'N/A'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'pr_class',
      label: 'PR Class',
      dataType: 'select',
      options: ['PR1', 'PR2', 'PR2F', 'N/A'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'body_material',
      label: 'Body Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'trim_material',
      label: 'Trim Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'seal_material',
      label: 'Seal / Elastomer Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
    {
      key: 'bore_type',
      label: 'Bore Type',
      dataType: 'select',
      options: ['Full Port', 'Reduced Port', 'Standard'],
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
    // ── New field added in Batch 1 ──────────────────────────────────────
    {
      key: 'material_class_api',
      label: 'Material Class (API 6A)',
      dataType: 'select',
      options: [
        'AA',
        'BB',
        'CC',
        'DD',
        'EE',
        'EE-0.5',
        'EE-1.5',
        'EE-HF',
        'FF',
        'HH',
        'N/A',
      ],
      helpText:
        'API 6A material chemistry / sour-service class. EE and HH are NACE-compliant; HH adds severe sour-service requirements.',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 14,
    },
  ],
}

// ── Per-product input shape ───────────────────────────────────────────────

type GateOrSsvInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  categorySlug: 'oilfield-gate-valves' | 'oilfield-ssv-esd-valves'
  valveType:
    | 'Gate — Manual'
    | 'Gate — Hydraulic'
    | 'Gate — Slab'
    | 'Surface Safety (SSV)'
  /** "FC" (fail close), "FLS" (fail last stable), "Manual" (no actuator), "SSV" */
  actuatorMode: 'FC' | 'FLS' | 'Manual' | 'SSV'
  nominalSize: string
  workingPressurePsi: number
  pressureClass: string
  endConnectionInlet: string
  endConnectionOutlet: string
  serviceClass: 'Standard' | 'Sour (NACE MR0175)'
  apiSpec: string
  pslClass: string
  prClass: string
  materialClassApi: string
  bodyMaterial: string
  trimMaterial: string
  sealMaterial: string
  boreType: 'Full Port' | 'Reduced Port' | 'Standard'
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

// ── HTML description builder ──────────────────────────────────────────────

function buildHtml(g: GateOrSsvInput): string {
  const isSsv = g.valveType === 'Surface Safety (SSV)'
  const isHydraulic = g.valveType === 'Gate — Hydraulic' || isSsv
  const isSlab = g.valveType === 'Gate — Slab'

  const actuatorLine = isSsv
    ? 'Hydraulically-actuated fail-close emergency shutdown valve — closes on loss of hydraulic control pressure to the actuator dome. SSV Class II per API 6A (block-bleed-blow).'
    : g.valveType === 'Gate — Hydraulic'
      ? `Hydraulically-actuated, ${g.actuatorMode === 'FC' ? 'fail-close (spring closes on hydraulic loss) — required for downstream isolation and safety integrity' : 'fail-last-stable (FLS) — holds last position on hydraulic loss, used where unintended motion is undesirable'}. Manual override on the bonnet for testing and lockout.`
      : g.actuatorMode === 'FLS'
        ? 'Manually-operated handwheel with FLS (fail-last-stable) actuator option for retrofit conversion. Rising-stem indicator confirms position.'
        : 'Manually-operated handwheel. Rising-stem indicator confirms position. Lockable in either fully-open or fully-closed state.'

  const slabLine = isSlab
    ? '<p>Slab-gate design: a single-piece slab gate that translates linearly through the bore — simpler than the more common expanding-gate (split-wedge) variant. Lower part count, easier to refurbish in the field, and proven for high-cycle service. The Inconel 625 hard-faced trim resists erosion in sand-laden flow and stress-corrosion cracking in severe sour service.</p>'
    : ''

  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class) per ${escape(g.apiSpec)} ${escape(g.pslClass)}, ${escape(g.prClass)}, material class ${escape(g.materialClassApi)}. ${escape(actuatorLine)}</p>
${slabLine}
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.valveType)}${isSsv ? '' : ` — ${escape(g.actuatorMode === 'FC' ? 'Fail Close' : g.actuatorMode === 'FLS' ? 'Fail Last Stable' : 'Manual')}`}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Bore: ${escape(g.boreType)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim material: ${escape(g.trimMaterial)}</li>
<li>Seal / elastomer: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
${isHydraulic ? '<li>Actuator: hydraulic dome — control pressure typically 1.5× working pressure</li>' : ''}
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Bidirectional flow with metal-to-metal seat seal. Hydrotested at 1.5× working pressure (shell test) and seat-tested per ${escape(g.apiSpec)} acceptance criteria. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant — H₂S-rated trim and elastomers.' : 'Standard service rated for clean hydrocarbon and water-cut streams.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec)} ${escape(g.pslClass)} ${escape(g.prClass)}</li>
<li>Material class ${escape(g.materialClassApi)} (API 6A chemistry / sour-service grading)</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
${isSsv ? '<li>SSV Class II — block-bleed-blow per API 6A</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
<li>API monogram traceability on body and trim</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and pressure class, (b) inlet and outlet end-connection sizes / styles (5M / 10M / 15M flanges, or other), (c) service class (standard vs sour vs HF), (d) actuator mode for hydraulic variants (FC, FLS, or manual override option), (e) any special trim (Inconel 625, Stellite, F22) or temperature class (PR1 / PR2 / PR2F fire-tested) requirements. Indus quotes ex-works with full mill test reports, sour-service certificates where applicable, and pre-shipment hydrostatic / shell test certificates.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure check valves, ball valves, and SSV/ESDs of the same flange class to build a complete wellhead service tree or Christmas tree. ${isSsv ? 'For full-stack emergency shutdown, pair the SSV with an upstream wing/master valve and downstream bleed/check sequence.' : 'For hydraulic-actuated trains, integrate with a hydraulic control panel sized to the dome volumes and intervention timings.'} Indus also supplies API 6A studs, gaskets (R/RX/BX ring-joint), and instrumentation tap-offs to specification.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: GateOrSsvInput): FaqEntry[] {
  const isSsv = g.valveType === 'Surface Safety (SSV)'
  const isHydraulic = g.valveType === 'Gate — Hydraulic' || isSsv

  const actuatorFaq: FaqEntry = isSsv
    ? {
        q: 'How does the SSV close in an emergency shutdown?',
        a: 'Fail-close on loss of hydraulic dome pressure. The actuator spring drives the gate closed when control pressure is bled or lost — typical close time 3-5 seconds at 5K psi class, scaling with size. The valve can also be closed locally via the manual override on the bonnet for routine testing and lockout.',
      }
    : g.valveType === 'Gate — Hydraulic'
      ? {
          q: 'What is the difference between FC (Fail Close) and FLS (Fail Last Stable)?',
          a: g.actuatorMode === 'FC'
            ? 'FC valves close automatically when hydraulic actuator pressure is lost — used for downstream isolation in safety-critical service (master valves, wing valves, kill lines). The internal spring drives the gate to the closed position when dome pressure drops below the spring set point.'
            : 'FLS valves hold the last position when hydraulic pressure is lost — used where unintended valve motion would be more dangerous than holding state (e.g. choke isolation lines where a sudden close could cause a slugging event). Distinct from FC by the actuator construction; the body is identical.',
        }
      : g.actuatorMode === 'FLS'
        ? {
            q: 'Is this manual gate compatible with a hydraulic actuator retrofit?',
            a: 'Yes — the bonnet stem and stem-thread pitch are the API 6A standard, so a hydraulic actuator can be fitted later to convert this manual valve to FC or FLS service. Specify the desired actuator type (and any signal switches for position feedback) on the RFQ and we will quote the actuator + adapter sleeve as a package.',
          }
        : {
            q: 'How is this manual gate operated and indicated?',
            a: 'Single-handwheel operation — turn clockwise to close, anti-clockwise to open. The rising-stem indicator confirms position visually (stem fully extended = open, retracted = closed). The handwheel is lockable in either state for LOTO compliance.',
          }

  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. Hydrotested at 1.5× working pressure (shell test) and seat-tested per ${g.apiSpec} acceptance criteria. The flange and body design rating is ${g.pressureClass} per ${g.apiSpec}.`,
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('Flanged') || /\d+M\b/.test(g.endConnectionInlet) ? 'These are API 6A flanged ends with ring-joint (RTJ) gasket sealing per API 6A 6BX hub geometry. Studs and nuts to match the API 6A 6BX bolting pattern.' : g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') || g.endConnectionInlet.includes('206') ? 'These are Weco wing-union connections, the standard for frac flow iron — the F (female) half threads onto the M (male) half via the wing nut.' : 'See the spec table for inlet / outlet detail.'}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant for sour-service exposure. Material class ${g.materialClassApi} per API 6A; body, stem, gate, and elastomers meet the NACE hardness and chemistry limits. ${g.materialClassApi === 'HH' ? 'HH is the most severe class — Inconel 625 cladded trim and high-alloy bodies for severe sour environments.' : ''} Provide a partial-pressure data sheet with H₂S, CO₂, and chloride values and we will confirm trim suitability.`
          : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE thresholds), specify the NACE MR0175 compliant variant of this size and pressure class on the RFQ.',
    },
    {
      q: 'What does the API 6A material class mean?',
      a: `Material class ${g.materialClassApi} per API 6A — this captures both the chemistry (sour-service grading: AA = standard, EE = sour with controlled hardness, HH = severe sour with high-alloy / cladded trim) and operating-temperature class. ${g.materialClassApi.startsWith('EE') ? 'The "-0.5", "-1.5", and "-HF" suffixes indicate temperature ranges within the EE chemistry — refer to API 6A Table 5 / Table 6 for the exact temperature envelopes.' : g.materialClassApi === 'HH' ? 'HH-grade valves are typically Inconel 625 cladded internally for the most aggressive sour-service environments.' : 'See API 6A Table 5 / Table 6 for the chemistry limits and corresponding temperature class.'}`,
    },
    actuatorFaq,
    {
      q: 'What materials are used for the body, gate, and seals?',
      a: `Body: ${g.bodyMaterial}. Trim (gate + seats): ${g.trimMaterial}. Seals / elastomers: ${g.sealMaterial}. Alternative trims (Inconel 718, F22, F51) and elastomers (FFKM, AFLAS) are available on request for higher-temperature or more aggressive sour environments.`,
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. ${g.workingPressurePsi >= 15000 || g.materialClassApi === 'HH' || g.materialClassApi === 'EE-HF' ? 'High-pressure (15K) and severe-sour (HH / EE-HF) variants are typically build-to-order — confirm the OEM build slot at quote stage. Hydrotest, sour-service, and API monogram certifications add 5-10 days to the dispatch window.' : 'Standard sizes and pressure classes are commonly OEM stock or short-lead. Confirm at quote stage.'}`,
    },
    {
      q: 'What standards and certifications are supplied?',
      a: `${g.apiSpec} ${g.pslClass} ${g.prClass}, material class ${g.materialClassApi}. Mill test reports per EN 10204 3.1 / 3.2 supplied with each unit. API monogram on body and trim. ${g.serviceClass === 'Sour (NACE MR0175)' ? 'Plus NACE MR0175 / ISO 15156 sour-service compliance certificate.' : ''} ${isSsv ? 'API 6A Class II SSV testing certificate (block-bleed-blow). Witness testing available on request.' : ''}${g.prClass === 'PR2F' ? ' PR2F includes API 6FA fire-test certification.' : ''}`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: GateOrSsvInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: g.categorySlug,
    specTemplateSlug: 'oilfield-valve-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      valve_type: g.valveType,
      nominal_size: g.nominalSize,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      end_connection_inlet: g.endConnectionInlet,
      end_connection_outlet: g.endConnectionOutlet,
      service_class: g.serviceClass,
      api_spec: g.apiSpec,
      psl_class: g.pslClass,
      pr_class: g.prClass,
      material_class_api: g.materialClassApi,
      body_material: g.bodyMaterial,
      trim_material: g.trimMaterial,
      seal_material: g.sealMaterial,
      bore_type: g.boreType,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword:
      g.valveType === 'Surface Safety (SSV)'
        ? `surface safety valve ${g.workingPressurePsi >= 10000 ? Math.round(g.workingPressurePsi / 1000) + 'k' : g.workingPressurePsi} psi api 6a`.slice(0, 120)
        : `${g.valveType.toLowerCase().includes('hydraulic') ? 'hydraulic gate valve' : g.valveType.toLowerCase().includes('slab') ? 'slab gate valve' : 'manual gate valve'} ${Math.round(g.workingPressurePsi / 1000)}k api 6a${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

// ── Common spec values ────────────────────────────────────────────────────

const STANDARD_4130 = 'Forged AISI 4130 — NACE MR0175 compliant'
const STANDARD_LF2 = 'ASTM A350 LF2 — NACE MR0175 compliant'
const HH_CLAD = 'Forged AISI 4130 with Inconel 625 internal cladding (HH)'
const TRIM_410SS = '410SS gate + 410SS seats with Stellite 6 hardfacing'
const TRIM_INCONEL = 'F6NM gate + Inconel 625 overlay seats'
const TRIM_INCONEL_HH = 'Inconel 625 cladded gate + Inconel 625 overlay seats'
const SEAL_PEEK_HNBR = 'PEEK back-up + HNBR primary seals'
const SEAL_PEEK_FFKM = 'PEEK back-up + FFKM primary seals (high-temp)'

// ── Product data — 13 Gate Valves ─────────────────────────────────────────

const GATE_VALVES: GateOrSsvInput[] = [
  {
    sku: 'IH-OFV-GATE-3116-10K-HYD-FC-FMC',
    title: 'Hydraulic Gate Valve, Fail Close, 3-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 3 PR1, EE-1.5',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Hydraulic',
    actuatorMode: 'FC',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 10M flanged hydraulic-actuated gate valve, fail-close, 10K psi sour service per API 6A PSL 3 / PR1 / EE-1.5. Wing-valve service for production trees.',
    applications: [
      'Production tree wing valves',
      '10K Christmas-tree manifold blocks',
      'Hydraulic master valve service',
      'Subsea-adjacent dry-tree applications',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-GATE-3116-15K-HYD-FC-CAMERON',
    title: 'Hydraulic Gate Valve, Fail Close, 3-1/16 in × 15M Flanged, 15,000 psi, API 6A PSL 3 PR1, EE-0.5',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Hydraulic',
    actuatorMode: 'FC',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-0.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 15M flanged hydraulic-actuated gate valve, fail-close, 15K psi sour service per API 6A PSL 3 / PR1 / EE-0.5. Premium HP service for high-pressure trees.',
    applications: [
      '15K production trees',
      'High-pressure master valve service',
      'HPHT well intervention manifolds',
      'Sour-gas production headers',
    ],
    leadTimeDays: 70,
  },
  {
    sku: 'IH-OFV-GATE-318-5K-HYD-FC-FMC',
    title: 'Hydraulic Gate Valve, Fail Close, 3-1/8 in × 5M Flanged, 5,000 psi, API 6A PSL 2 PR2, EE-0.5',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Hydraulic',
    actuatorMode: 'FC',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 2',
    prClass: 'PR2',
    materialClassApi: 'EE-0.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_410SS,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/8 in × 5M flanged hydraulic-actuated gate valve, fail-close, 5K psi sour service per API 6A PSL 2 / PR2 / EE-0.5. Mid-pressure tree wing-valve.',
    applications: [
      '5K production tree wing valves',
      'Mid-pressure manifold blocks',
      'Sour-gas testing trees',
      'Workover-rig pressure-control stack',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-GATE-4116-5K-HYD-FC-STREAMFLO',
    title: 'Hydraulic Gate Valve, Fail Close, 4-1/16 in × 5M Flanged, 5,000 psi, API 6A PSL 3 PR2, EE-0.5',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Hydraulic',
    actuatorMode: 'FC',
    nominalSize: '4-1/16 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '4-1/16 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '4-1/16 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR2',
    materialClassApi: 'EE-0.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '4-1/16 in × 5M flanged hydraulic-actuated gate valve, fail-close, 5K psi sour service per API 6A PSL 3 / PR2 / EE-0.5. Large-bore for high-rate production.',
    applications: [
      'High-rate 5K production trees',
      'Large-bore master valve service',
      'Multi-phase production headers',
      'Sour-gas processing inlet manifolds',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-GATE-2116-10K-MAN-FC-WOM',
    title: 'Manual Gate Valve, Fail Close, 2-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 3 PR1, EE',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FC',
    nominalSize: '2-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '2-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_410SS,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2-1/16 in × 10M flanged manual gate valve, 10K psi sour service per API 6A PSL 3 / PR1 / EE. Compact wing valve for high-pressure trees.',
    applications: [
      '10K wing valve service',
      '2-inch tree side-outlets',
      'Production-test manifolds',
      'High-pressure sample / instrument tap-offs',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-GATE-2116-5K-MAN-FC-INDUS',
    title: 'Manual Gate Valve, Fail Close, 2-1/16 in × 5M Flanged, 5,000 psi, API 6A PSL 3 PR1, EE',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FC',
    nominalSize: '2-1/16 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '2-1/16 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '2-1/16 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_410SS,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2-1/16 in × 5M flanged manual gate valve, 5K psi sour service per API 6A PSL 3 / PR1 / EE. Cost-effective wing valve for production-test trees.',
    applications: [
      '5K production-test trees',
      'Workover wing valves',
      'Low-rate well manifolds',
      'Spare-stock master valve replacements',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-GATE-3116-10K-MAN-FC-WOM',
    title: 'Manual Gate Valve, Fail Close, 3-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 3 PR1, EE-1.5',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FC',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 10M flanged manual gate valve, 10K psi sour service per API 6A PSL 3 / PR1 / EE-1.5. Master / wing valve for production trees.',
    applications: [
      '10K master valve service',
      'Production tree side-outlets',
      'Wireline lubricator base valves',
      'Sour-gas production manifolds',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-GATE-3116-15K-MAN-FC-CAMERON',
    title: 'Manual Gate Valve, Fail Close, 3-1/16 in × 15M Flanged, 15,000 psi, API 6A PSL 3 PR1, EE-0.5',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FC',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-0.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 15M flanged manual gate valve, 15K psi sour service per API 6A PSL 3 / PR1 / EE-0.5. HP master valve for severe-service production trees.',
    applications: [
      '15K master valve service',
      'HPHT production tree blocks',
      'Sour-gas wellhead trees',
      'Backup isolation upstream of choke',
    ],
    leadTimeDays: 63,
  },
  {
    sku: 'IH-OFV-GATE-4116-5K-MAN-FC-STREAMFLO',
    title: 'Manual Gate Valve, Fail Close, 4-1/16 in × 5M Flanged, 5,000 psi, API 6A PSL 3 PR1, EE',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FC',
    nominalSize: '4-1/16 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '4-1/16 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '4-1/16 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_410SS,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '4-1/16 in × 5M flanged manual gate valve, 5K psi sour service per API 6A PSL 3 / PR1 / EE. Large-bore for high-rate production manifolds.',
    applications: [
      'High-rate 5K production trees',
      'Bulk-flow gathering manifolds',
      'Sour-gas processing inlets',
      '4-inch wing valves',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-GATE-11316-15K-MAN-FLS-CAMERON',
    title: 'Manual Gate Valve, FLS, 1-13/16 in × 15M Flanged, 15,000 psi, API 6A PSL 3G PR2, EE-1.5',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FLS',
    nominalSize: '1-13/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '1-13/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '1-13/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3G',
    prClass: 'PR2',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_FFKM,
    boreType: 'Full Port',
    oneLiner:
      '1-13/16 in × 15M flanged manual gate valve with FLS actuator option, 15K psi sour gas service per API 6A PSL 3G / PR2 / EE-1.5. Small-bore HPHT for instrument and sample tap-offs.',
    applications: [
      'HPHT instrument tap-offs',
      '15K sample lines',
      'Wireline / coiled-tubing pressure-control stack',
      'Choke bypass (small bore)',
    ],
    leadTimeDays: 63,
  },
  {
    sku: 'IH-OFV-GATE-3116-10K-MAN-FLS-WOM',
    title: 'Manual Gate Valve, FLS, 3-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 3 PR2F, EE-1.5',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FLS',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR2F',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_FFKM,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 10M flanged manual gate valve with FLS option, 10K psi fire-tested sour service per API 6A PSL 3 / PR2F / EE-1.5. Fire-rated wing valve.',
    applications: [
      'Fire-rated production trees',
      '10K master valve service (fire safety)',
      'Sour-gas processing manifolds',
      'Pressure-control stack components',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-GATE-318-5K-MAN-FLS-STREAMFLO',
    title: 'Manual Gate Valve, FLS, 3-1/8 in × 5M Flanged, 5,000 psi, API 6A PSL 3 PR2F, EE-1.5',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Manual',
    actuatorMode: 'FLS',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR2F',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_FFKM,
    boreType: 'Full Port',
    oneLiner:
      '3-1/8 in × 5M flanged manual gate valve with FLS option, 5K psi fire-tested sour service per API 6A PSL 3 / PR2F / EE-1.5. Fire-rated mid-pressure wing valve.',
    applications: [
      'Fire-rated 5K trees',
      'Workover pressure-control stack',
      'Sour-gas testing manifolds',
      'Spare-stock high-spec replacements',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-GATE-3116-15K-SLAB-FMC',
    title: 'Manual Slab Gate Valve, 3-1/16 in × 10M Flanged, 15,000 psi, API 6A PSL 3G PR2, HH Inconel 625 Cladded',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-gate-valves',
    valveType: 'Gate — Slab',
    actuatorMode: 'Manual',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3G',
    prClass: 'PR2',
    materialClassApi: 'HH',
    bodyMaterial: HH_CLAD,
    trimMaterial: TRIM_INCONEL_HH,
    sealMaterial: SEAL_PEEK_FFKM,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 10M flanged manual slab gate valve, 15K psi severe-sour service per API 6A PSL 3G / PR2, HH material class with full Inconel 625 cladding. Flagship sour-gas service.',
    applications: [
      'Severe sour-gas wellheads',
      'HPHT Christmas trees (HH-grade)',
      'Sour-gas processing inlet headers',
      'High-cycle production trees (slab design)',
    ],
    leadTimeDays: 84,
  },
]

// ── Product data — 3 SSVs ─────────────────────────────────────────────────

const SSV_VALVES: GateOrSsvInput[] = [
  {
    sku: 'IH-OFV-SSV-3116-10K-1502-CAMERON',
    title: 'Surface Safety Valve, Hydraulic, 3-1/16 in × 10M Flanged Inlet × 3 in 1502 F×M Outlet, 10,000 psi, API 6A PSL 3 PR1, EE-1.5',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-ssv-esd-valves',
    valveType: 'Surface Safety (SSV)',
    actuatorMode: 'SSV',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3 in 1502 F×M Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-1.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 10M flanged inlet × 3 in 1502 F×M Weco-union outlet hydraulic surface safety valve, 10K psi sour service per API 6A PSL 3 / PR1 / EE-1.5. Frac-iron-to-tree adapter SSV.',
    applications: [
      'Frac iron emergency shutdown',
      'Tree-to-flow-iron adapter point',
      'Coiled-tubing intervention safety',
      '10K well-test surface trees',
    ],
    leadTimeDays: 70,
  },
  {
    sku: 'IH-OFV-SSV-2116-15K-FE-CAMERON',
    title: 'Surface Safety Valve, Hydraulic, 2-1/16 in × 15M Flanged Each (FE), 15,000 psi, API 6A PSL 3 SSV Class II, EE-0.5',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-ssv-esd-valves',
    valveType: 'Surface Safety (SSV)',
    actuatorMode: 'SSV',
    nominalSize: '2-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-0.5',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2-1/16 in × 15M flanged-each hydraulic surface safety valve, 15K psi sour service, SSV Class II per API 6A PSL 3 / PR1 / EE-0.5. Compact HP tree shutdown.',
    applications: [
      '15K Christmas tree ESD',
      'HPHT well intervention safety',
      'Tree-mounted master shutdown',
      'Sour-gas production safety',
    ],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-OFV-SSV-3116-15K-FE-FMC',
    title: 'Surface Safety Valve, Hydraulic SAH, 3-1/16 in × 15M Flanged Each (FE), 15,000 psi, API 6A PSL 3 SSV Class II, EE-HF',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'oilfield-ssv-esd-valves',
    valveType: 'Surface Safety (SSV)',
    actuatorMode: 'SSV',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-HF',
    bodyMaterial: STANDARD_4130,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_FFKM,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 15M flanged-each Surface Actuated Hydraulic (SAH) SSV, 15K psi high-flow sour service, SSV Class II per API 6A PSL 3 / PR1 / EE-HF. Premium Christmas tree ESD.',
    applications: [
      'HPHT Christmas tree master ESD',
      'Sour-gas wellhead safety system',
      'High-flow well intervention',
      '15K production ESD with API 6A monogram',
    ],
    leadTimeDays: 84,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const PRODUCTS = [...GATE_VALVES, ...SSV_VALVES]

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-oilfield-valves-gate-ssv',
    description:
      'Oilfield Valves Batch 1 — adds 2 sub-categories (oilfield-gate-valves, oilfield-ssv-esd-valves), extends oilfield-valve-spec with material_class_api field + PR2F option, extends "Wellhead & Frac" megamenu sub with Gate Valves + SSV & ESD Valves leaves. 16 products (13 gate + 3 SSV) at 5K-15K psi, API 6A PSL 1-3G / PR1-PR2F.',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [OILFIELD_VALVE_SPEC],

  // Megamenu — extend "Wellhead & Frac" sub. Must list ALL existing leaves
  // (Ball Valves from Batch 0) plus the new ones, because
  // replacePlaceholderLeaves deletes-and-recreates every leaf under the
  // matched sub.
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'oilfield-valves',
    parentSubLabel: 'Wellhead & Frac',
    replacements: [
      { label: 'Ball Valves', categorySlug: 'oilfield-ball-valves' },
      { label: 'Gate Valves', categorySlug: 'oilfield-gate-valves' },
      { label: 'SSV & ESD Valves', categorySlug: 'oilfield-ssv-esd-valves' },
    ],
  },

  products: PRODUCTS.map(makeProduct),
}

export default batch
