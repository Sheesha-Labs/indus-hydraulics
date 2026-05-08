/**
 * Oilfield Valves — Batch 2 (Check Valves) — 2026-05-08
 *
 * Adds 22 check valves to the Oilfield Valves column established in
 * Batch 0 (PR #86) and extended in Batch 1 (PR #87).
 *
 * What's new:
 *   - 1 sub-category: oilfield-check-valves (under oilfield-valves, position 3)
 *   - Megamenu: extends "Wellhead & Frac" sub with a new "Check Valves"
 *     leaf — 4 leaves total now (Ball / Gate / SSV / Check).
 *   - 22 products spanning Swing IL (6), Swing TE (6), Dart (4), Type R
 *     wafer (6). Mix of frac-iron (Weco unions 1502/602/206), wellhead
 *     flanged (5M/10M/15M), ANSI flanged (150#/600#).
 *   - Pressures: 285 psi → 15,000 psi. Service: 12 sour + 10 standard.
 *   - Brand split: WOM 4, ANSON 4, SPM 4, Cameron 3, FMC 3, Stream-Flo 2,
 *     Indus 2.
 *
 * No new brands, no spec template change, no new top-level structure.
 * Leverages the oilfield-valve-spec template from Batch 1 (15 fields).
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-check.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-check.ts
 */
import type {
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
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
    slug: 'oilfield-check-valves',
    name: 'Check Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Wellhead, frac, and process check valves — Swing in-line, Swing tee, Dart (vertical flow), and Type R wafer designs. Weco unions, API 6A flanged, ANSI flanged. 285 psi to 15K psi, sour and standard service.',
    position: 3,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Check Valves — Swing, Dart, Type R Wafer | Indus Hydraulics',
    seoDescription:
      'Swing check valves (in-line and tee), dart check valves (vertical flow), and Type R wafer checks per API 6A. 1502/602/206 Weco unions, 5M/10M/15M flanged, 150#/600# ANSI. Sour and standard. AED, RFQ.',
  },
]

// ── Per-product input shape ───────────────────────────────────────────────

type CheckType =
  | 'Swing IL'
  | 'Swing TE'
  | 'Dart'
  | 'Dart Compact'
  | 'Type R'

type CheckValveInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  /** Sub-type — IL/TE for Swing, etc. Drives description + FAQ specifics. */
  checkType: CheckType
  /** Maps to spec field valve_type. */
  valveType: 'Check — Swing' | 'Check — Dart' | 'Check — Type R (Wafer)'
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

function buildHtml(g: CheckValveInput): string {
  const checkTypeLine = (() => {
    switch (g.checkType) {
      case 'Swing IL':
        return 'In-line swing-disc design — a hinged disc opens with forward flow and swings closed against reverse flow. Low pressure drop (Cv-equivalent close to a full-bore tee), bidirectional installation orientation supported, but horizontal-with-cover-up or vertical-flow-up installation is preferred for cleanest disc seating.'
      case 'Swing TE':
        return 'Tee-body swing-disc design — one inlet leg and a perpendicular outlet leg, with a hinged disc on the inlet path. Used at frac iron junctions where flow combines into a manifold trunk. The tee body absorbs reaction loads cleanly, and the disc seats on the inlet face when reverse flow occurs in the trunk.'
      case 'Dart':
        return 'Vertical-flow dart-style design — a spring-loaded poppet (dart) seats against forward-flow stop on no-flow or reverse-flow conditions. Must be installed vertical-flow-up: gravity assists the dart returning to seat. Tighter shut-off than swing checks at low pressures (helpful in cement-pumping iron where slight back-flow during hold can contaminate the trunk).'
      case 'Dart Compact':
        return 'Compact-body vertical-flow dart-style design — same operating principle as the standard dart but in a shorter overall length. Used where space between unions is tight, e.g. tightly-packaged frac iron service trees and frac trees.'
      case 'Type R':
        return 'Wafer-style swing check, wafer body fits between matching API 6A 6BX flanges. The disc pivots on a top-mounted hinge and seats by gravity / line pressure. Distinguished by the very short face-to-face dimension and the ring-joint (RTJ) flange interface — common at the inlet of choke manifolds and Christmas tree side-outlets.'
    }
  })()

  const installLine = (() => {
    switch (g.checkType) {
      case 'Swing IL':
      case 'Swing TE':
        return 'Install with the flow arrow on the body matching line direction. For swing types, horizontal-with-cover-up is the preferred orientation; vertical-flow-up is also supported. Avoid vertical-flow-down installation (the disc fights gravity to close).'
      case 'Dart':
      case 'Dart Compact':
        return 'Install vertical-flow-up only — the dart relies on gravity returning to seat. The body must be plumbed so the dart axis is vertical and the inlet is below the outlet.'
      case 'Type R':
        return 'Install between matching API 6A 6BX ring-joint flanges, with the flow arrow on the body matching line direction. Studs and ring gasket per API 6A 6BX bolting; ensure the wafer is centered in the bore (use centering lugs if the studs allow).'
    }
  })()

  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.checkType.toLowerCase())} check valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class) with ${escape(g.endConnectionInlet)} inlet and ${escape(g.endConnectionOutlet)} outlet. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>${escape(checkTypeLine)}</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.valveType)} — ${escape(g.checkType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Bore: ${escape(g.boreType)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim (disc/dart + seat): ${escape(g.trimMaterial)}</li>
<li>Seal / elastomer: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Hydrotested at 1.5× working pressure (shell test); seat-tested per ${escape(g.apiSpec === 'Other' ? 'frac-iron flow-control acceptance criteria' : g.apiSpec + ' acceptance criteria')}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant — H₂S-rated trim and elastomers, material class ' + g.materialClassApi + '.' : 'Standard service rated for clean hydrocarbon and water-cut streams.')}</p>
<h3>Installation</h3>
<p>${escape(installLine)}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'Manufactured to recognised oilfield flow-iron design standards' : g.apiSpec + ' ' + g.pslClass + ' ' + g.prClass)}</li>
${g.materialClassApi !== 'N/A' ? `<li>Material class ${escape(g.materialClassApi)} (API 6A chemistry / sour-service grading)</li>` : ''}
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and pressure class, (b) inlet and outlet end-connection sizes / styles, (c) service class (standard vs sour), (d) installation orientation (especially for dart-type — vertical-flow-up only), and (e) any flow-velocity or noise constraints (over-spec'd swing checks can chatter at low flow). Indus quotes ex-Dubai for stock items and ex-works OEM for build-to-order items, with full mill test reports and pre-shipment hydrotest certificates.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure ball valves, plug valves, gate valves, and SSV/ESDs of the same end-connection family. For frac iron service trees, the 1502/602/206 Weco unions are the matched standard. For wellhead and Christmas tree service, the API 6A 5M/10M/15M flanged geometries pair check valves with master and wing gate valves.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: CheckValveInput): FaqEntry[] {
  const isDart = g.checkType === 'Dart' || g.checkType === 'Dart Compact'
  const isTypeR = g.checkType === 'Type R'

  const operationFaq: FaqEntry = isDart
    ? {
        q: 'How does the dart-style check operate?',
        a: 'A spring-loaded poppet (the "dart") sits in the bore, lifted off its seat by forward flow and pushed back to seat by the spring + gravity + reverse-flow pressure. Tighter shut-off than a swing-disc check at low pressures, and faster reseating because the dart travel is short. Trade-off: higher pressure drop in the open position than an equivalent-sized swing check.',
      }
    : isTypeR
      ? {
          q: 'How does the Type R wafer check operate?',
          a: 'A pivoting disc on a top-mounted hinge swings open with forward flow and seats by gravity / line pressure on no-flow or reverse-flow. The wafer body fits between matching API 6A 6BX flanges with very short face-to-face length — typically half or less of an in-line swing check. Disc closure is rapid because the disc travel arc is short.',
        }
      : {
          q: 'How does the swing check operate?',
          a: 'A hinged disc inside the body lifts off its seat under forward flow and swings closed when forward flow stops or reverses. Closure is gravity-assisted: in horizontal installation the disc falls onto its seat; in vertical-up installation the disc swings down. Low pressure drop in the open position, and very rapid closure on reverse-flow events.',
        }

  const orientationFaq: FaqEntry = isDart
    ? {
        q: 'What installation orientation is required?',
        a: 'Vertical-flow-up only. The dart relies on gravity returning it to seat — installing horizontal or vertical-flow-down will cause the dart to drop or chatter. Always confirm vertical orientation at the installation point.',
      }
    : isTypeR
      ? {
          q: 'What installation orientation is supported?',
          a: 'Horizontal flow with the hinge pin at the top is preferred (the disc falls cleanly onto its seat). Vertical-flow-up is also supported. Vertical-flow-down is NOT recommended — the disc fights gravity to close, leading to slow closure and potential chatter.',
        }
      : {
          q: 'What installation orientation is supported?',
          a: 'Horizontal flow with the bonnet (cover) up is preferred. Vertical-flow-up is also supported with no derate. Vertical-flow-down is NOT recommended because the disc fights gravity to close.',
        }

  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. Hydrotested at 1.5× working pressure (shell test). The body and end-connection ratings are matched to the pressure class — never operate above the rated pressure even briefly during pressure transients.`,
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') || g.endConnectionInlet.includes('206') ? 'These are Weco wing-union connections, the standard for frac flow iron — the F (female) half threads onto the M (male) half via the wing nut. Always match like-class on both sides of the joint.' : g.endConnectionInlet.includes('Flanged') || /\d+M\b/.test(g.endConnectionInlet) ? 'These are API 6A flanged ends per 6BX hub geometry with ring-joint (RTJ) gasket sealing.' : g.endConnectionInlet.includes('RF') ? 'These are ANSI raised-face flanged ends per ASME B16.5 — standard bolting and gasket pattern.' : 'See the spec table for inlet / outlet detail.'}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant for sour-service exposure. Material class ${g.materialClassApi}; body, trim, and elastomers meet the NACE hardness and chemistry limits. Provide a partial-pressure data sheet with H₂S, CO₂, and chloride values and we will confirm trim suitability.`
          : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE thresholds), specify the NACE MR0175 compliant variant of this size and pressure class on the RFQ.',
    },
    operationFaq,
    orientationFaq,
    {
      q: 'What materials are used for the body, trim, and seals?',
      a: `Body: ${g.bodyMaterial}. Trim (${isDart ? 'dart + seat' : isTypeR ? 'wafer disc + seat' : 'disc + seat'}): ${g.trimMaterial}. Seals: ${g.sealMaterial}. Alternative trims (Inconel 718, F22, Stellite hardfacing) and elastomers (FFKM, AFLAS) are available on request for higher-temperature or aggressive sour environments.`,
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. ${g.workingPressurePsi >= 15000 ? '15K-class checks are typically build-to-order — confirm the OEM build slot at quote stage.' : isTypeR ? 'Type R wafer checks at API 6A PSL 3 are typically build-to-order; PSL 1 (no monogram) variants are commonly OEM-stocked.' : 'Frac-iron Weco-union checks in common sizes are usually OEM stock or short-lead. Confirm at quote stage.'}`,
    },
    {
      q: 'What standards and certifications are supplied?',
      a: `${g.apiSpec === 'Other' ? 'Manufactured to recognised oilfield flow-iron design standards (frac iron lineage from API 6A pressure-class methodology). Mill test reports per EN 10204 3.1 / 3.2 supplied with each unit.' : `${g.apiSpec} ${g.pslClass} ${g.prClass}, material class ${g.materialClassApi}. Mill test reports per EN 10204 3.1 / 3.2 supplied with each unit. ${g.pslClass === 'PSL 3' || g.pslClass === 'PSL 3G' ? 'API monogram on body and trim.' : ''}`} ${g.serviceClass === 'Sour (NACE MR0175)' ? 'Plus NACE MR0175 / ISO 15156 sour-service compliance certificate.' : ''}`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: CheckValveInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'oilfield-check-valves',
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
      `${g.checkType.toLowerCase()} check valve ${g.workingPressurePsi >= 10000 ? Math.round(g.workingPressurePsi / 1000) + 'k psi' : g.workingPressurePsi + ' psi'}${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

// ── Common spec values ────────────────────────────────────────────────────

const FORGED_4130_NACE = 'Forged AISI 4130 — NACE MR0175 compliant'
const FORGED_4130_STD = 'Forged AISI 4130'
const CAST_LF2_NACE = 'ASTM A350 LF2 — NACE MR0175 compliant'
const CAST_WCB = 'Cast carbon steel (WCB)'
const TRIM_316_17_4 = '316SS disc + 17-4PH stem/hinge'
const TRIM_INCONEL = 'F6NM disc + Inconel 625 overlay seats'
const TRIM_316SS_FULL = '316SS disc + 316SS seats'
const SEAL_PEEK_HNBR = 'PEEK back-up + HNBR primary seals'
const SEAL_RPTFE_FKM = 'RPTFE seats + Viton (FKM) O-rings'

// ── Product data — 22 Check Valves ────────────────────────────────────────

const PRODUCTS: CheckValveInput[] = [
  // ── Swing IL (6) ────────────────────────────────────────────────────────
  {
    sku: 'IH-OFV-CHK-SWING-IL-2-1502FM-10K-SOUR-ANSON',
    title: 'Swing Check Valve, In-Line, 2 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union in-line swing check valve, 10,000 psi sour-service. NACE MR0175 trim. Frac iron service for kill / circulation lines.',
    applications: [
      'Frac iron service trees',
      'Kill / circulation lines (sour)',
      'Coiled-tubing pump-in lines',
      'Flow-back manifolds',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-CHK-SWING-IL-2-602FM-5K-SOUR-ANSON',
    title: 'Swing Check Valve, In-Line, 2 in × 602 F×M, 5,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '2 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '2 in 602 Female Weco Union',
    endConnectionOutlet: '2 in 602 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: CAST_LF2_NACE,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 602 F×M Weco-union in-line swing check, 5,000 psi sour-service. 602 union pattern is the standard 5K/6K low-torque connection for production-test iron.',
    applications: [
      'Production-test flow lines',
      'Well-test surface equipment (sour)',
      '5K / 6K frac iron',
      'Sour-service flow-back lines',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-CHK-SWING-IL-2-1502FM-15K-STD-WOM',
    title: 'Swing Check Valve, In-Line, 2 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union in-line swing check, 15,000 psi standard-service. High-pressure frac discharge protection.',
    applications: [
      'High-pressure frac discharge (sweet)',
      'Cement-unit pump-off lines',
      '15K service trees',
      'Pressure-pumping iron — sweet wells',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-SWING-IL-2-1502MF-10K-SOUR-SPM',
    title: 'Swing Check Valve, In-Line, 2 in × 1502 M×F, 10,000 psi, Sour Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '2 in 1502 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 M×F Weco-union in-line swing check, 10,000 psi sour-service. Reverse end orientation (M inlet × F outlet) for tee-to-line direction.',
    applications: [
      'Frac iron tee-to-line connections',
      'Service tree branch legs (reverse-flow)',
      'Coiled-tubing kill lines',
      'Sour-service flow-back assemblies',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-CHK-SWING-IL-3-1502FM-15K-STD-ANSON',
    title: 'Swing Check Valve, In-Line, 3 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '3 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3 in 1502 Female Weco Union',
    endConnectionOutlet: '3 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 1502 F×M Weco-union in-line swing check, 15,000 psi standard-service. Larger 3-inch bore for high-rate frac discharge.',
    applications: [
      '3-inch frac discharge manifolds',
      'High-rate cement-unit lines',
      '15K service trees (3-inch leg)',
      'Pressure-pumping iron — sweet wells',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-SWING-IL-2-206FM-2K-STD-INDUS',
    title: 'Swing Check Valve, In-Line, 2 in × 206 F×M, 2,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    checkType: 'Swing IL',
    valveType: 'Check — Swing',
    nominalSize: '2 in',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    endConnectionInlet: '2 in 206 Female Weco Union',
    endConnectionOutlet: '2 in 206 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: 'Forged carbon steel (A105N)',
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 206 F×M Weco-union in-line swing check, 2,000 psi standard-service. 206 union — low-pressure standard for cementing and kill-fluid lines.',
    applications: [
      'Cementing surface lines',
      'Kill-fluid circulation',
      'Low-pressure flow-back',
      'Mud-circulation skid manifolds',
    ],
    leadTimeDays: 7,
  },
  // ── Swing TE (6) ────────────────────────────────────────────────────────
  {
    sku: 'IH-OFV-CHK-SWING-TE-3-1502FM-15K-STD-WOM',
    title: 'Swing Check Valve, Tee Body, 3 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '3 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3 in 1502 Female Weco Union',
    endConnectionOutlet: '3 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 1502 F×M Weco-union swing check, tee body, 15,000 psi standard-service. Tee design for frac iron junctions and discharge manifolds.',
    applications: [
      'Frac iron junction blocks',
      'Discharge manifold trunk',
      '3-inch tee inlets to choke skids',
      'Sweet 15K service trees',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-SWING-TE-3-1502MF-15K-STD-SPM',
    title: 'Swing Check Valve, Tee Body, 3 in × 1502 M×F, 15,000 psi, Standard Service, Reverse Flow',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '3 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3 in 1502 Male Weco Union',
    endConnectionOutlet: '3 in 1502 Female Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 1502 M×F Weco-union swing check, tee body, 15,000 psi standard-service. Reverse-flow orientation (M inlet × F outlet) for branch-to-trunk routing.',
    applications: [
      'Branch-to-trunk junctions in frac discharge',
      'Reverse-flow side outlets',
      'Manifold tee inlets',
      'Pressure-pumping iron',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-SWING-TE-3116-15M-1502-15K-STD-FMC',
    title: 'Swing Check Valve, Tee Body, 3-1/16 in × 15M Flanged × 3 in 1502 F, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '3-1/16 in × 3 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3 in 1502 Female Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3-1/16 in × 15M flanged inlet × 3 in 1502 F outlet swing check, tee body, 15,000 psi per API 6A PSL 3 / PR1. Wellhead-to-flow-iron adapter check.',
    applications: [
      'Christmas tree to frac-iron interface',
      'Wellhead service-tree adapters',
      '15K well-intervention manifolds',
      'Production tree side outlets to manifold',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-CHK-SWING-TE-3-600RF-1480-SOUR-CAMERON',
    title: 'Swing Check Valve, Tee Body, 3 in × 600# RF, 1,480 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '3 in',
    workingPressurePsi: 1480,
    pressureClass: 'ANSI 600',
    endConnectionInlet: '3 in 600# ANSI Raised-Face Flange',
    endConnectionOutlet: '3 in 600# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Cast WCB carbon steel — NACE MR0175 compliant',
    trimMaterial: '316SS disc + 316SS seats with Stellite hardfacing',
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 600# RF swing check, tee body, 1,480 psi sour-service per API 6D. WCB body with 316SS Stellite-hardfaced trim. Gas-processing inlet manifold service.',
    applications: [
      'Gas-processing inlet manifolds',
      'Pipeline pig-launcher block protection',
      'Process-plant service (sour)',
      '600# class refinery / gas-plant',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-CHK-SWING-TE-3-150RF-285-SOUR-INDUS',
    title: 'Swing Check Valve, Tee Body, 3 in × 150# RF, 285 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '3 in',
    workingPressurePsi: 285,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '3 in 150# ANSI Raised-Face Flange',
    endConnectionOutlet: '3 in 150# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Cast WCB carbon steel — NACE MR0175 compliant',
    trimMaterial: TRIM_316SS_FULL,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 150# RF swing check, tee body, 285 psi sour-service. Low-pressure utility check for sour-gas vent / drain headers.',
    applications: [
      'Sour-gas vent headers',
      'Drain manifolds (sour)',
      '150# utility process service',
      'Tank-farm ingress lines (sour)',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-CHK-SWING-TE-4-1502FM-15K-STD-WOM',
    title: 'Swing Check Valve, Tee Body, 4 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    checkType: 'Swing TE',
    valveType: 'Check — Swing',
    nominalSize: '4 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '4 in 1502 Female Weco Union',
    endConnectionOutlet: '4 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '4 in × 1502 F×M Weco-union swing check, tee body, 15,000 psi standard-service. Large-bore tee for high-rate frac discharge manifolds.',
    applications: [
      'Sand / water blender discharge',
      'High-rate frac discharge',
      '4-inch service tree trunks',
      '15K service iron — sweet wells',
    ],
    leadTimeDays: 28,
  },
  // ── Dart (4) ────────────────────────────────────────────────────────────
  {
    sku: 'IH-OFV-CHK-DART-2-1502FM-15K-STD-SPM',
    title: 'Dart Check Valve, 2 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    checkType: 'Dart',
    valveType: 'Check — Dart',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: 'F6NM dart + 316SS body insert',
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union dart check, 15,000 psi standard-service. Vertical-flow-up installation. Fast reseating for cement-pumping iron.',
    applications: [
      'Cement pump-out lines (vertical)',
      'Frac iron pump discharge',
      '15K service trees (vertical legs)',
      'Pump-side check protection',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-DART-2-1502FM-10K-SOUR-ANSON',
    title: 'Dart Check Valve, 2 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    checkType: 'Dart',
    valveType: 'Check — Dart',
    nominalSize: '2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: 'F6NM dart + Inconel 625 body insert',
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union dart check, 10,000 psi sour-service. Vertical-flow-up. Sour-rated trim with Inconel 625 body insert.',
    applications: [
      'Sour-well frac iron (vertical)',
      'Sour-cement pump-out',
      'Production-test pump checks',
      'Sour-gas treatment lines',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-DART-COMPACT-2-1502FM-15K-STD-SPM',
    title: 'Dart Check Valve, Compact, 2 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    checkType: 'Dart Compact',
    valveType: 'Check — Dart',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: 'F6NM dart + 316SS body insert',
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union dart check, COMPACT body, 15,000 psi standard. Shorter face-to-face length for tightly packaged frac trees.',
    applications: [
      'Tight-package service trees',
      'Skid-mounted frac iron',
      'Wireline / coiled-tubing pressure-control stack',
      'High-rate sweet wells',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHK-DART-3-1502FM-10K-SOUR-WOM',
    title: 'Dart Check Valve, 3 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    checkType: 'Dart',
    valveType: 'Check — Dart',
    nominalSize: '3 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3 in 1502 Female Weco Union',
    endConnectionOutlet: '3 in 1502 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: 'F6NM dart + Inconel 625 body insert',
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 1502 F×M Weco-union dart check, 10,000 psi sour-service. 3-inch bore for high-rate vertical pump-out lines on sour wells.',
    applications: [
      'High-rate sour-well frac iron',
      'Cement pump-out (sour)',
      '3-inch vertical service iron',
      'Sand / fluid blender protection (sour)',
    ],
    leadTimeDays: 28,
  },
  // ── Type R (Wafer) — 6 ──────────────────────────────────────────────────
  {
    sku: 'IH-OFV-CHK-TYPER-3116-10K-PSL3-CAMERON',
    title: 'Type R Wafer Check Valve, 3-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 3 PR1, EE Material Class L+U',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/16 in × 10M flanged Type R wafer check, 10,000 psi sour-service per API 6A PSL 3 / PR1, material class EE (L+U temp range). Christmas tree side-outlet check.',
    applications: [
      'Christmas tree side outlets',
      'Wellhead service trees (sour)',
      '10K production manifolds',
      'Choke skid inlets',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-CHK-TYPER-3116-15K-PSL3-CAMERON',
    title: 'Type R Wafer Check Valve, 3-1/16 in × 15M Flanged, 15,000 psi, API 6A PSL 3 PR1, EE Material Class L+U',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/16 in × 15M flanged Type R wafer check, 15,000 psi sour-service per API 6A PSL 3 / PR1. HP wellhead service for production trees.',
    applications: [
      '15K Christmas trees',
      'HPHT wellhead service',
      'High-pressure manifolds (sour)',
      '15K side-outlet protection',
    ],
    leadTimeDays: 70,
  },
  {
    sku: 'IH-OFV-CHK-TYPER-3116-15K-PSL1-FMC',
    title: 'Type R Wafer Check Valve, 3-1/16 in × 15M Flanged, 15,000 psi, PSL 1 NM, EE-P+U',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Standard',
    apiSpec: 'API 6A',
    pslClass: 'PSL 1',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_316_17_4,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Standard',
    oneLiner:
      '3-1/16 in × 15M flanged Type R wafer check, 15,000 psi standard-service per API 6A PSL 1 (no monogram), EE material class. Cost-effective HP check.',
    applications: [
      'Sweet 15K production manifolds',
      'Service-iron Christmas tree side outlets',
      'Test-tree applications',
      'Cost-effective HP wellhead check',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-CHK-TYPER-318-5K-PSL1-FMC',
    title: 'Type R Wafer Check Valve, 3-1/8 in × 5M Flanged, 5,000 psi, API 6A PSL 1 PR1, EE-P+U Sour',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 1',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/8 in × 5M flanged Type R wafer check, 5,000 psi sour-service per API 6A PSL 1 / PR1. 5M wellhead pressure class for older trees.',
    applications: [
      '5K wellhead production trees',
      'Sour-gas surface trees',
      '5M Christmas tree side outlets',
      'Production manifold inlets',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-CHK-TYPER-3116-10K-PSL1-STREAMFLO',
    title: 'Type R Wafer Check Valve, 3-1/16 in × 10M Flanged, 10,000 psi, API 6A PSL 1 PR1, EE-P+U Sour',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 10M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 1',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/16 in × 10M flanged Type R wafer check, 10,000 psi sour-service per API 6A PSL 1 / PR1, material class EE. Wellhead and Christmas tree service.',
    applications: [
      '10K wellhead production trees (sour)',
      'Christmas tree side outlets',
      '10M production manifolds',
      'Workover-tree adapter checks',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-CHK-TYPER-3116-15K-PSL3-STREAMFLO',
    title: 'Type R Wafer Check Valve, 3-1/16 in × 15M Flanged, 15,000 psi, API 6A PSL 3 PR1, EE-1.5',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    checkType: 'Type R',
    valveType: 'Check — Type R (Wafer)',
    nominalSize: '3-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '3-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-1.5',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/16 in × 15M flanged Type R wafer check, 15,000 psi sour-service per API 6A PSL 3 / PR1, EE-1.5 (extended temperature). Premium HP wellhead service.',
    applications: [
      '15K Christmas trees (HPHT)',
      'Premium sour-gas wellheads',
      'Production manifold isolation',
      'Severe-service tree blocks',
    ],
    leadTimeDays: 70,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-oilfield-valves-check',
    description:
      'Oilfield Valves Batch 2 — adds 1 sub-category (oilfield-check-valves), 22 check valve products spanning Swing IL/TE, Dart, Dart Compact, and Type R wafer designs. Pressures 285-15K psi, sour and standard service. Megamenu "Wellhead & Frac" extended to 4 leaves (Ball / Gate / SSV / Check).',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [],

  // Megamenu — extend "Wellhead & Frac" sub. Lists ALL existing leaves
  // (Ball, Gate, SSV from prior batches) plus Check Valves new leaf.
  // replacePlaceholderLeaves does a full delete-and-recreate.
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'oilfield-valves',
    parentSubLabel: 'Wellhead & Frac',
    replacements: [
      { label: 'Ball Valves', categorySlug: 'oilfield-ball-valves' },
      { label: 'Gate Valves', categorySlug: 'oilfield-gate-valves' },
      { label: 'SSV & ESD Valves', categorySlug: 'oilfield-ssv-esd-valves' },
      { label: 'Check Valves', categorySlug: 'oilfield-check-valves' },
    ],
  },

  products: PRODUCTS.map(makeProduct),
}

export default batch
