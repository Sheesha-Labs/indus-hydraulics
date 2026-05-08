/**
 * Flow Iron & Wellhead — Batch 1 (Flow Line + Manifolds) — 2026-05-08
 *
 * Second batch in the Flow Iron & Wellhead initiative. Builds on Batch 0
 * (PR #91) — reuses the flow-iron-spec template and the Flow Iron & Wellhead
 * megamenu column established there.
 *
 * Establishes:
 *   - 2 new OEM brand records: Halliburton (USA) and Forum Energy
 *     Technologies (USA). Both isAuthorizedDistributor=false.
 *   - 2 new sub-categories under flow-iron-wellhead: flow-iron-flow-line
 *     (position 3), flow-iron-manifolds (position 4).
 *   - Megamenu update — extends the "Flow Iron" sub from 3 leaves to 5
 *     by adding "Flow Line" and "Manifolds" leaves.
 *   - 38 consolidated PDPs across Flow Line (swivel joints, pup joints,
 *     spacer spools, hose loops, blast joints, data headers) and Manifolds
 *     (choke, diverter, multi-well, skid packages).
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-1.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-1.ts
 */
import type {
  BrandPayload,
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

// ── Brand records (only the new ones) ────────────────────────────────────

const BRANDS: BrandPayload[] = [
  {
    slug: 'halliburton',
    name: 'Halliburton',
    country: 'USA',
    description:
      'Halliburton supplies pressure-pumping equipment, choke manifolds, surface test trees, frac iron, and well-stimulation services. One of the largest oilfield services companies, headquartered in Houston, Texas.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Halliburton Choke Manifolds, Frac Iron & Surface Test Trees | Indus Hydraulics',
    seoDescription:
      'Halliburton choke manifolds, frac iron, blast joints, and surface test trees supplied by Indus Hydraulics in the UAE. AED pricing, RFQ on request.',
  },
  {
    slug: 'forum-energy',
    name: 'Forum Energy Technologies',
    country: 'USA',
    description:
      'Forum Energy Technologies (FET) supplies choke manifolds, frac iron (Beanstalk and Davis-Lynch lines), surface test trees, and pressure-control packages for upstream oil and gas. Houston-based.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Forum Energy Choke Manifolds & Frac Iron | Indus Hydraulics',
    seoDescription:
      'Forum Energy Technologies (FET) choke manifolds, frac iron, surface test trees, and manifold skids supplied by Indus Hydraulics. AED pricing, RFQ on request.',
  },
]

// ── Categories (only the new ones) ───────────────────────────────────────

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'flow-iron-flow-line',
    name: 'Flow Line',
    parentSlug: 'flow-iron-wellhead',
    shortDescription:
      'Frac flow line equipment — Chiksan-style swivel joints, pup joints, spacer spools, hose loops (C&C), blast joints, data headers. WECO 1502 / 1002 / 602 / 206 series, 1K-15K psi, sour and standard service.',
    position: 3,
    isPublished: true,
    defaultSpecTemplateSlug: 'flow-iron-spec',
    seoTitle: 'Frac Flow Line — Swivel Joints, Pup Joints, Blast Joints | Indus Hydraulics',
    seoDescription:
      'Chiksan-style swivel joints (1-axis to 4-axis), pup joints, spacer spools, hose loops, blast joints, and data headers. WECO 1502/1002/602/206 series. FMC, SPM, Anson, Halliburton. AED, RFQ.',
  },
  {
    slug: 'flow-iron-manifolds',
    name: 'Manifolds',
    parentSlug: 'flow-iron-wellhead',
    shortDescription:
      'Choke, diverter, and multi-well manifolds plus engineered manifold skids and flow-line packages for frac, well-test, and pressure-control service. 5K, 10K, 15K psi classes. Standard and sour service.',
    position: 4,
    isPublished: true,
    defaultSpecTemplateSlug: 'flow-iron-spec',
    seoTitle: 'Choke Manifolds, Diverter Manifolds, Multi-Well Skids | Indus Hydraulics',
    seoDescription:
      'Choke manifolds (single / dual stage), diverter manifolds, multi-well manifolds, and engineered manifold skids. 5K-15K psi, sour and standard service. Cameron, FMC, Halliburton, Forum Energy, NOV. AED, RFQ.',
  },
]

// ── Per-product input shape ───────────────────────────────────────────────

type FlowIronInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  categorySlug: string
  flowIronType: string
  figureClass: string
  workingPressurePsi: number
  pressureClass: string
  serviceClass: 'Standard' | 'Sour (NACE MR0175)'
  configuration: string
  endConnectionA: string
  endConnectionB: string
  endConnectionExtra: string
  availableSizes: string
  boreId: string
  lengthIn: string
  materialConstruction: string
  apiSpec: string
  materialClass: string
  temperatureRating: string
  oneLiner: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
}

// ── HTML description builder ──────────────────────────────────────────────

function buildHtml(g: FlowIronInput): string {
  const sourLine =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'NACE MR0175 / ISO 15156 sour-service compliant — H₂S-rated body and trim with hardness controlled per the standard.'
      : 'Standard service rated for clean hydrocarbon, completion fluid, and water-cut streams.'
  const apiLine =
    g.apiSpec === 'Other (frac-iron lineage)' || g.apiSpec === 'N/A'
      ? 'Manufactured to recognised oilfield frac-iron design standards — pressure-class methodology and hydrostatic testing aligned with API 6A.'
      : `Manufactured to ${escape(g.apiSpec)}${g.materialClass !== 'N/A' ? `, material class ${escape(g.materialClass)}` : ''}.`
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.flowIronType.toLowerCase())} ${escape(g.configuration ? '(' + g.configuration + ') ' : '')}rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure in ${escape(g.serviceClass.toLowerCase())} service. ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.flowIronType)}</li>
<li>Series / class: ${escape(g.figureClass)} (${escape(g.pressureClass)})</li>
<li>Configuration: ${escape(g.configuration || '—')}</li>
<li>End A: ${escape(g.endConnectionA || '—')}</li>
${g.endConnectionB ? `<li>End B: ${escape(g.endConnectionB)}</li>` : ''}
${g.endConnectionExtra ? `<li>Auxiliary: ${escape(g.endConnectionExtra)}</li>` : ''}
${g.boreId ? `<li>Bore / ID: ${escape(g.boreId)}</li>` : ''}
${g.lengthIn ? `<li>Length: ${escape(g.lengthIn)}</li>` : ''}
<li>Material: ${escape(g.materialConstruction)}</li>
<li>Temperature rating: ${escape(g.temperatureRating)}</li>
</ul>
<h3>Available sizes and configurations</h3>
<p>This product family covers the following stock or short-lead nominal sizes / configurations: <strong>${escape(g.availableSizes)}</strong>. Other sizes and lengths within the same series and pressure class can be sourced from the OEM mill on a build-to-order basis (8–14 weeks lead). Indus quotes a firm size, pressure class, configuration, and service-class match against your inquiry data sheet — call or RFQ with the line specification and we will return a complete matched bill of materials.</p>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class), ${escape(g.serviceClass.toLowerCase())} rated. ${escape(apiLine)} Hydrostatic test at 1.5× shell pressure on every unit. Mill test reports per EN 10204 3.1 / 3.2 supplied with each shipment.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>OEM equivalents and compatibility</h3>
<p>This product is supplied as a recognised matched-pressure interchange for the following OEM standards and product lines (no implied authorised-distributor relationship — supplied by Indus Hydraulics):</p>
<ul>
${oemKw}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other (frac-iron lineage)' || g.apiSpec === 'N/A' ? 'Recognised oilfield frac-iron design standards (frac-iron pressure-class lineage)' : g.apiSpec)}</li>
${g.materialClass !== 'N/A' ? `<li>Material class: ${escape(g.materialClass)}</li>` : ''}
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Hydrostatic test certificates per unit</li>
</ul>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) exact nominal size, length, and bore ID, (b) line working pressure and pressure class, (c) end-connection style and gender on each port (M / F, NPT / BW / Integral / RTJ / RF), (d) service class — sour (NACE MR0175) or standard, (e) any additional ports, taps, or instrumentation requirements, and (f) required certifications beyond the standard MTR + hydrostatic. Indus quotes ex-Dubai with full traceability.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure crossover unions, hammer unions, integral crosses / tees / elbows, plug valves, ball valves, check valves, and API 6BX flanges of the same WECO figure class. For frac-tree integration, also specify wellhead adapters, ring-joint gaskets, and BSL bolting in the matched pressure class.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: FlowIronInput): FaqEntry[] {
  const sourFaq =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'Yes — this product is fully NACE MR0175 / ISO 15156 compliant for sour-service exposure (H₂S-bearing hydrocarbon streams). Body, trim, and any elastomers are selected to the NACE hardness and chemistry limits. Provide an inquiry data sheet listing H₂S partial pressure, temperature, and chloride content and we will confirm material suitability and material-class designation (typically DD, EE, or FF for sour).'
      : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE MR0175 thresholds), specify the sour-service variant of this size and pressure class on the RFQ. Sour variants typically run 8–10K psi where standard runs 15K (a deliberate downrate to stay within NACE hardness limits).'
  return [
    {
      q: 'What sizes / configurations are available in this family?',
      a: `Stock or short-lead: ${g.availableSizes}. The product page consolidates a family that share the same series, pressure class, and service class — confirm the exact size / length / configuration you need on the RFQ. Variants outside the listed stock range can be sourced build-to-order at typical 8–14 week lead times depending on OEM build slots.`,
    },
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. The unit is hydrotested at 1.5× shell-test pressure per the applicable specification. The working pressure is fixed by both the body design and the end connection — the union, flange, or weld rating is the limiting factor at the joint, so always specify matched-class connections on both sides.`,
    },
    {
      q: 'Is this product suitable for sour service (H₂S wells)?',
      a: sourFaq,
    },
    {
      q: 'What end connections does this product use?',
      a: `End A: ${g.endConnectionA || 'see configuration'}. ${g.endConnectionB ? 'End B: ' + g.endConnectionB + '. ' : ''}${g.endConnectionExtra ? 'Auxiliary: ' + g.endConnectionExtra + '. ' : ''}${g.figureClass.match(/^(100|200|206|400|602|1002|1502|2002)$/) ? 'These are WECO wing-union (hammer-union) connections, the standard for frac flow iron — the Female (F) half threads onto the Male (M) half via the hand-tight wing nut, then is hammered tight with a non-sparking sledge. Always match like-class on both sides of the joint.' : g.figureClass.match(/^(2K|3K|5K|10K|15K|20K)$/) ? 'These are API 6A / 6BX flanged ends — ring-joint gasket (RTJ) sealing on a BX-series ring groove. Studs and nuts to match the API 6BX bolting pattern (BSL stud-and-nut sets are sold separately).' : 'See the spec table for end-connection detail.'}`,
    },
    {
      q: 'What OEM brands and standards is this compatible with?',
      a: `This product is supplied as a recognised matched-pressure interchange for ${g.oemKeywords.join(', ')}. Indus is not an authorised distributor of these OEMs but every unit is engineered to be dimensionally and metallurgically interchangeable with the named OEM standard, with full mill test reports and hydrostatic certificates on file. For applications requiring an OEM-stamped unit, we can source genuine OEM product on a build-to-order basis — call us with the application detail.`,
    },
    {
      q: 'What materials and material class are used?',
      a: `Material: ${g.materialConstruction}. ${g.materialClass !== 'N/A' ? 'API 6A material class: ' + g.materialClass + ' (' + (g.materialClass.match(/^(DD|EE|FF|HH)$/) ? 'sour-service capable per NACE MR0175' : 'standard-service general use') + '). ' : ''}Higher material classes (Inconel-clad seal pockets, F22 / F51 wetted parts, NACE-compliant bolting) are available on request for severe sour, high-temperature, or chloride-rich service.`,
    },
    {
      q: 'What standards and certifications come with each unit?',
      a: `Each unit ships with: (a) ${g.apiSpec === 'Other (frac-iron lineage)' || g.apiSpec === 'N/A' ? 'recognised frac-iron design standards traceability' : g.apiSpec + ' design and manufacture compliance'}, (b) EN 10204 3.1 mill test report (3.2 on request), (c) hydrostatic test certificate at 1.5× shell pressure, ${g.serviceClass === 'Sour (NACE MR0175)' ? '(d) NACE MR0175 / ISO 15156 sour-service compliance certificate, ' : ''}and traceability stamps on the body. API monogram is available where the source mill holds the licence — flag this on the RFQ if it is a hard requirement.`,
    },
    {
      q: 'What is the lead time and how do I order?',
      a: `Common combinations are stocked or short-lead from our Dubai warehouse — typical lead time ${g.leadTimeDays} working days. Sour-service variants, large manifold skids, and unusual configurations ship 8–14 weeks ex-works depending on OEM build slots. RFQ with: (a) exact size and configuration, (b) pressure class and service, (c) end-connection style and gender on each port, (d) certification requirements, and (e) destination port. Indus quotes ex-Dubai with door-to-door logistics on request.`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: FlowIronInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: g.categorySlug,
    specTemplateSlug: 'flow-iron-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      flow_iron_type: g.flowIronType,
      figure_class: g.figureClass,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      service_class: g.serviceClass,
      configuration: g.configuration,
      end_connection_a: g.endConnectionA,
      end_connection_b: g.endConnectionB,
      end_connection_extra: g.endConnectionExtra,
      available_sizes: g.availableSizes,
      bore_id: g.boreId,
      length_in: g.lengthIn,
      material_construction: g.materialConstruction,
      api_spec: g.apiSpec,
      material_class: g.materialClass,
      temperature_rating: g.temperatureRating,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${g.flowIronType.toLowerCase()} ${g.figureClass} ${g.pressureClass.toLowerCase()}${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour' : ''}`.slice(0, 120),
  }
}

// ── Common defaults ───────────────────────────────────────────────────────

const STD_TEMP = '-20°F to 250°F (-29°C to 121°C)'
const SOUR_TEMP = '-20°F to 180°F (-29°C to 82°C)'
const STD_MAT = 'Forged alloy steel (4130/4140), tempered'
const SOUR_MAT = 'Forged alloy steel (4130) — NACE MR0175 hardness controlled'

// ── Product data ──────────────────────────────────────────────────────────

const PRODUCTS: FlowIronInput[] = [
  // ════════════════════════════════════════════════════════════════════════
  // FLOW LINE — Swivel Joints (Chiksan-style) (8)
  // ════════════════════════════════════════════════════════════════════════
  {
    sku: 'IH-FI-SJ-1502-S10-1AX-15K-STD-FMC',
    title: 'Swivel Joint, 1502 Style 10 (1-Axis), 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 10 — 1-axis (single-plane rotation)',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: 'Tungsten-carbide ball-race for high-cycle service',
    availableSizes: '2 in, 3 in (M×F or M×M variants)',
    boreId: 'Same as nominal — full bore',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 10 single-axis Chiksan-style swivel joint, 15,000 psi standard service. The simplest swivel — single-plane rotation for routing flow iron around obstructions.',
    applications: [
      'Frac iron service tree make-ups',
      'Pump-truck flow lines',
      'Coiled-tubing surface manifolds',
      'Stimulation iron flexibility',
    ],
    oemKeywords: ['FMC Chiksan Style 10', 'SPM 1502 Swivel', 'Anson Swivel', 'Forum Beanstalk'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-SJ-1502-S20-1AX-15K-STD-SPM',
    title: 'Swivel Joint, 1502 Style 20 (1-Axis), 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 20 — 1-axis, 90° elbowed body',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal — full bore',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 20 single-axis Chiksan-style swivel joint with 90° elbowed body, 15,000 psi standard. SPM / FMC interchange. Combines a 90° turn with single-plane rotation.',
    applications: [
      'Frac iron 90° turns with rotation',
      'Service-tree side-out flexibility',
      'Stimulation manifolds',
    ],
    oemKeywords: ['SPM 1502 Swivel', 'FMC Chiksan Style 20', 'Anson Swivel'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-SJ-1502-S30-2AX-15K-STD-FMC',
    title: 'Swivel Joint, 1502 Style 30 (2-Axis), 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 30 — 2-axis (compound rotation)',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal — full bore',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 30 two-axis Chiksan-style swivel joint, 15,000 psi standard. Two ball-races allow compound rotation in two perpendicular planes.',
    applications: [
      'Frac iron complex routing',
      'Pump-truck flexible connections',
      'Stimulation iron with multi-plane offsets',
    ],
    oemKeywords: ['FMC Chiksan Style 30', 'SPM 1502 Swivel', 'Anson 2-Axis'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-SJ-1502-S40-REEL-15K-STD-FMC',
    title: 'Reel Swivel, 1502 Style 40 (2-Axis Reel), 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 40 — 2-axis reel swivel (hose-reel mount)',
    endConnectionA: '1502 Male Weco Union (×2)',
    endConnectionB: '1502 Male Weco Union (×2)',
    endConnectionExtra: 'Reel-end shaft for hose-reel mounting',
    availableSizes: '2 in',
    boreId: 'Same as nominal',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 40 two-axis Reel Swivel, 15,000 psi standard. Mounts on a hose reel to feed pressurised fluid through a rotating spool.',
    applications: [
      'Hose-reel-fed coiled-tubing service',
      'Acid-injection reel feeds',
      'High-pressure mobile pumping spreads',
    ],
    oemKeywords: ['FMC Chiksan Reel Style 40', 'SPM Reel Swivel', 'Halliburton Reel'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-FI-SJ-1502-S50-3AX-15K-STD-FMC',
    title: 'Swivel Joint, 1502 Style 50 (3-Axis), 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 50 — 3-axis (full-freedom rotation)',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: 'Three ball-races give X / Y / Z rotation',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal — full bore',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 50 three-axis Chiksan-style swivel joint, 15,000 psi standard. The classic frac-iron flexibility joint — allows full-freedom rotation between two flow-line ends.',
    applications: [
      'Pump-discharge to service-tree flexible joints',
      'Full-freedom flow-iron routing',
      'Coiled-tubing flexible feeds',
    ],
    oemKeywords: ['FMC Chiksan Style 50', 'SPM 1502 3-Axis', 'Forum Beanstalk', 'Anson 3-Axis'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-SJ-1502-S50-3AX-10K-SOUR-FMC',
    title: 'Swivel Joint, 1502 Style 50 (3-Axis), 10,000 psi, Sour Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Style 50 — 3-axis, sour-service variant',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: 'NACE-compliant ball-race materials and elastomers',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal',
    lengthIn: '',
    materialConstruction: SOUR_MAT,
    apiSpec: 'NACE MR0175',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Style 50 three-axis Chiksan-style swivel joint, 10,000 psi sour-service rated. For H₂S frac and well-stimulation iron with multi-plane rotation.',
    applications: [
      'Sour-well frac iron flexible joints',
      'H₂S service-tree complex routing',
      'NACE-compliant pumping spreads',
    ],
    oemKeywords: ['FMC Chiksan Style 50 Sour', 'SPM 1502 NACE', 'Anson Sour Swivel'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-FI-SJ-1502-S100-3AX-15K-STD-SPM',
    title: 'Swivel Joint, 1502 Style 100 (3-Axis Heavy-Duty), 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Style 100 — 3-axis heavy-duty (cyclic-load rated)',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: 'Heavy-walled body for high-cycle frac applications',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal — full bore',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Style 100 three-axis heavy-duty Chiksan-style swivel joint, 15,000 psi standard. Cyclic-load-rated body for repeat high-pressure pumping cycles.',
    applications: [
      'High-cycle frac pumping spreads',
      'Repeat-stage stimulation iron',
      'Pump-discharge primary swivels',
    ],
    oemKeywords: ['SPM 1502 Style 100', 'FMC Chiksan Style 100', 'Forum Beanstalk Heavy'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-FI-SJ-602-S50-3AX-6K-STD-INDUS',
    title: 'Swivel Joint, 602 Style 50 (3-Axis), 6,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Swivel Joint',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Standard',
    configuration: 'Style 50 — 3-axis (full-freedom rotation)',
    endConnectionA: '602 Male Weco Union',
    endConnectionB: '602 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '602 Style 50 three-axis Chiksan-style swivel joint, 6,000 psi standard. Production-pressure flexibility joint for well-test, flowback, and intermediate-pressure iron.',
    applications: [
      'Production well-test flexible iron',
      'Flowback line offsets',
      'Intermediate-pressure manifolds',
    ],
    oemKeywords: ['FMC Chiksan 602', 'SPM 602 Swivel', 'Anson 602'],
    leadTimeDays: 14,
  },

  // ════════════════════════════════════════════════════════════════════════
  // FLOW LINE — Pup Joints (8)
  // ════════════════════════════════════════════════════════════════════════
  {
    sku: 'IH-FI-PJ-1502-MF-INT-15K-STD-FMC',
    title: 'Pup Joint, 1502 Series M×F Integral, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Integral body, Male × Female',
    endConnectionA: '1502 Male Weco Union (integral)',
    endConnectionB: '1502 Female Weco Union (integral)',
    endConnectionExtra: 'No welds — forged single-piece body',
    availableSizes: '2 in, 3 in (sizes); 2 ft, 5 ft, 10 ft, 15 ft, 20 ft (lengths)',
    boreId: 'Same as nominal — full bore',
    lengthIn: '2-20 ft (specify on RFQ)',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Male × Female integral pup joint, 15,000 psi standard. The classic frac-iron pup — 2 to 20 ft lengths, integral hammer-union ends, no welds.',
    applications: [
      'Frac iron flow-line make-ups',
      'Service-tree fluid distribution',
      'Pump-discharge piping',
    ],
    oemKeywords: ['FMC WECO 1502 Pup', 'SPM 1502', 'Anson 1502', 'Forum Beanstalk'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-PJ-1502-FM-INT-15K-STD-SPM',
    title: 'Pup Joint, 1502 Series F×M Integral, 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Integral body, Female × Male',
    endConnectionA: '1502 Female Weco Union (integral)',
    endConnectionB: '1502 Male Weco Union (integral)',
    endConnectionExtra: 'No welds — forged single-piece body',
    availableSizes: '2 in, 3 in (sizes); 2 ft, 5 ft, 10 ft, 15 ft, 20 ft (lengths)',
    boreId: 'Same as nominal — full bore',
    lengthIn: '2-20 ft',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Female × Male integral pup joint, 15,000 psi standard. SPM / WECO interchange. F×M variant for matching to female-ended flow-iron components.',
    applications: [
      'Frac iron pup-joint runs',
      'Service-tree extensions',
      'Pump-discharge gauge runs',
    ],
    oemKeywords: ['SPM 1502 Pup', 'FMC WECO 1502', 'Anson 1502'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-PJ-1502-FM-INT-10K-SOUR-ANSON',
    title: 'Pup Joint, 1502 Series F×M Integral, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Integral body, Female × Male, sour-service',
    endConnectionA: '1502 Female Weco Union (integral)',
    endConnectionB: '1502 Male Weco Union (integral)',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in; 2 ft, 5 ft, 10 ft, 15 ft, 20 ft',
    boreId: 'Same as nominal',
    lengthIn: '2-20 ft',
    materialConstruction: SOUR_MAT,
    apiSpec: 'NACE MR0175',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Series Female × Male integral pup joint, 10,000 psi sour-service (NACE MR0175). Anson / WECO interchange. For H₂S frac iron and stimulation lines.',
    applications: [
      'Sour-well frac iron flow lines',
      'H₂S stimulation iron',
      'NACE-compliant pumping spreads',
    ],
    oemKeywords: ['Anson 1502 Pup Sour', 'FMC WECO 1502 NACE', 'SPM 1502 Sour'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-PJ-1502-NPST-DET-15K-STD-INDUS',
    title: 'Pup Joint, 1502 NPST DET (Threaded × Threaded), 15,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'NPST double-end-tapered threaded, F×M',
    endConnectionA: '1502 Female Weco (NPST)',
    endConnectionB: '1502 Male Weco (NPST)',
    endConnectionExtra: 'Threaded subs (DET) for replaceability',
    availableSizes: '1 in, 2 in; 1-10 ft lengths',
    boreId: 'Same as nominal',
    lengthIn: '1-10 ft',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series NPST double-end-tapered (DET) pup joint, 15,000 psi standard. Threaded subs allow field replacement — economical alternative to integral pups.',
    applications: [
      'Skid-piping make-ups',
      'Test-pump tie-ins',
      'Field-repairable flow-iron runs',
    ],
    oemKeywords: ['FMC WECO 1502 NPST DET', 'Anson 1502 Threaded', 'SPM 1502 DET'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-PJ-1002-MF-INT-10K-STD-FMC',
    title: 'Pup Joint, 1002 Series M×F Integral, 10,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '1002',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    configuration: 'Integral body, Male × Female',
    endConnectionA: '1002 Male Weco Union (integral)',
    endConnectionB: '1002 Female Weco Union (integral)',
    endConnectionExtra: '',
    availableSizes: '3 in, 4 in; 2-15 ft lengths',
    boreId: 'Same as nominal — full bore',
    lengthIn: '2-15 ft',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1002 Series Male × Female integral pup joint, 10,000 psi standard. WECO / FMC interchange. The 1002 series suits 10K-psi flow lines with 3 in or 4 in bore.',
    applications: [
      '10K flow lines',
      'Pump-truck high-volume discharge',
      'Stimulation manifolds',
    ],
    oemKeywords: ['FMC WECO 1002 Pup', 'SPM 1002', 'Anson 1002'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-PJ-602-MF-INT-6K-STD-FMC',
    title: 'Pup Joint, 602 Series M×F Integral, 6,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Standard',
    configuration: 'Integral body, Male × Female',
    endConnectionA: '602 Male Weco Union (integral)',
    endConnectionB: '602 Female Weco Union (integral)',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in, 4 in; 2-20 ft',
    boreId: 'Same as nominal',
    lengthIn: '2-20 ft',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '602 Series Male × Female integral pup joint, 6,000 psi standard. WECO / FMC interchange. The 602 series serves production-pressure flow lines (6K class).',
    applications: [
      'Production well flow lines',
      'Well-test iron pup-joint runs',
      'Intermediate-pressure manifold extensions',
    ],
    oemKeywords: ['FMC WECO 602 Pup', 'SPM 602', 'Anson 602'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-PJ-602-FM-INT-6K-SOUR-INDUS',
    title: 'Pup Joint, 602 Series F×M Integral, 6,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Integral body, Female × Male, sour service',
    endConnectionA: '602 Female Weco Union (integral)',
    endConnectionB: '602 Male Weco Union (integral)',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in, 4 in; 2-20 ft',
    boreId: 'Same as nominal',
    lengthIn: '2-20 ft',
    materialConstruction: SOUR_MAT,
    apiSpec: 'NACE MR0175',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '602 Series Female × Male integral pup joint, 6,000 psi sour-service rated. WECO interchange. For H₂S production-well and well-test iron.',
    applications: [
      'Sour-well production flow lines',
      'H₂S well-test iron',
      'NACE-compliant 6K manifolds',
    ],
    oemKeywords: ['FMC WECO 602 Sour', 'Anson 602 NACE', 'SPM 602'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-PJ-206-FM-BWXH-2K-SOUR-FMC',
    title: 'Pup Joint, 206 Series F×M (BW XH DET), 2,000 psi, Sour Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Pup Joint',
    figureClass: '206',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Butt-Weld XH DET, Female × Male',
    endConnectionA: '206 Female Weco Union (BW XH DET)',
    endConnectionB: '206 Male Weco Union (BW XH DET)',
    endConnectionExtra: 'Schedule XH butt-weld between subs and pipe body',
    availableSizes: '2 in, 3 in, 4 in; 2-20 ft',
    boreId: 'Same as nominal',
    lengthIn: '2-20 ft',
    materialConstruction: SOUR_MAT,
    apiSpec: 'ASME B16.25 (BW)',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '206 Series Female × Male pup joint with butt-weld XH double-end-tapered ends, 2,000 psi sour-service. WECO / FMC interchange. For H₂S water and brine handling.',
    applications: [
      'Sour-well water transfer',
      'H₂S flowback iron',
      'NACE-compliant low-pressure manifolds',
    ],
    oemKeywords: ['FMC WECO 206 BW Sour', 'Anson 206', 'SPM 206'],
    leadTimeDays: 14,
  },

  // ════════════════════════════════════════════════════════════════════════
  // FLOW LINE — Spacer Spools, Hose Loops, Blast Joints, Data Headers (7)
  // ════════════════════════════════════════════════════════════════════════
  {
    sku: 'IH-FI-SS-1502-MF-15K-STD-FMC',
    title: 'Spacer Spool, 1502 Series M×F, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Spacer Spool',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Short-length integral spool, M×F',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in; 6 in / 12 in / 18 in / 24 in lengths',
    boreId: 'Same as nominal',
    lengthIn: '6-24 in',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Male × Female spacer spool, 15,000 psi standard. Short straight section for tightening tolerances in frac-tree make-ups. WECO / FMC interchange.',
    applications: [
      'Frac-tree clearance adjustment',
      'Service-tree alignment',
      'Pump-discharge fine fitment',
    ],
    oemKeywords: ['FMC WECO 1502 Spacer', 'SPM 1502', 'Anson 1502'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-SS-1502-MF-10K-SOUR-INDUS',
    title: 'Spacer Spool, 1502 Series M×F, 10,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Spacer Spool',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Short-length integral spool, M×F, sour',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in; 6-24 in lengths',
    boreId: 'Same as nominal',
    lengthIn: '6-24 in',
    materialConstruction: SOUR_MAT,
    apiSpec: 'NACE MR0175',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Series M×F spacer spool, 10,000 psi sour-service. For H₂S frac iron alignment and tolerance adjustment.',
    applications: [
      'Sour-well frac-tree alignment',
      'H₂S service-tree clearance',
    ],
    oemKeywords: ['FMC WECO 1502 Sour Spacer', 'Anson 1502 NACE'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-FI-SS-602-MF-6K-STD-INDUS',
    title: 'Spacer Spool, 602 Series M×F, 6,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Spacer Spool',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Standard',
    configuration: 'Short-length integral spool, M×F',
    endConnectionA: '602 Male Weco Union',
    endConnectionB: '602 Female Weco Union',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in; 6-24 in',
    boreId: 'Same as nominal',
    lengthIn: '6-24 in',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '602 Series M×F spacer spool, 6,000 psi standard. For 6K production-tree make-ups requiring small length adjustments.',
    applications: [
      'Production-tree alignment',
      'Well-test iron clearance',
    ],
    oemKeywords: ['FMC WECO 602 Spacer', 'SPM 602', 'Anson 602'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-FI-HL-1502-15K-STD-FMC',
    title: 'Hose Loop (C&C), 1502 Series M×F, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Hose Loop (C&C)',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Coiled-and-Configured (C&C) flexible hose loop, integral hammer-union ends',
    endConnectionA: '1502 Male Weco Union',
    endConnectionB: '1502 Female Weco Union',
    endConnectionExtra: 'Stainless-steel-braid pressure carcass',
    availableSizes: '2 in; 6 ft / 10 ft / 15 ft / 20 ft hose lengths',
    boreId: 'Same as nominal',
    lengthIn: '6-20 ft',
    materialConstruction: 'SS-braid hose with forged hammer-union end fittings',
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Coiled-and-Configured (C&C) hose loop, 15,000 psi standard. Flexible high-pressure hose for pump-truck-to-service-tree connections — replaces multiple swivel joints with a single flexible run.',
    applications: [
      'Pump-truck flexible discharge lines',
      'Coiled-tubing surface feeds',
      'Frac-spread mobile pumping',
    ],
    oemKeywords: ['FMC WECO 1502 Hose Loop', 'SPM 1502 C&C', 'Halliburton Frac Hose'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-FI-BJ-1502-MF-INT-15K-STD-HALLIBURTON',
    title: 'Blast Sub Pup Joint, 1502 Series M×F Integral, 15,000 psi, Standard Service',
    brandSlug: 'halliburton',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Blast Joint',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Heavy-walled erosion-resistant pup joint',
    endConnectionA: '1502 Male Weco Union (integral)',
    endConnectionB: '1502 Female Weco Union (integral)',
    endConnectionExtra: 'Tungsten-carbide hardfaced bore for sand erosion',
    availableSizes: '2 in; 1 ft / 2 ft / 3 ft / 5 ft lengths',
    boreId: 'Reduced ID with hardfacing — engineered to limit erosion',
    lengthIn: '1-5 ft',
    materialConstruction: 'Forged 4140 with tungsten-carbide bore overlay',
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Blast Sub pup joint, 15,000 psi standard. Heavy-walled, tungsten-carbide-hardfaced bore for frac sand erosion. Halliburton frac-spread interchange.',
    applications: [
      'Frac sand-laden flow lines (proppant transport)',
      'Blender-discharge sand-protection iron',
      'High-erosion stimulation iron',
    ],
    oemKeywords: ['Halliburton Blast Sub', 'FMC Erosion-Resistant', 'SPM Sand-Service'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-FI-DH-1502-15K-STD-CAMERON',
    title: 'Data Header (Pressure / Temperature Manifold), 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Data Header',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Multi-port instrument manifold — pressure transmitter + temperature probe + sample port',
    endConnectionA: '1502 Female Weco Union (line)',
    endConnectionB: '1502 Male Weco Union (line)',
    endConnectionExtra: '3-4× 9/16 in Autoclave or 1/2 in NPT instrument ports',
    availableSizes: '2 in, 3 in (line bore); standard manifold body',
    boreId: 'Same as line nominal',
    lengthIn: '12-24 in',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series Data Header, 15,000 psi standard. Multi-port instrument manifold for live pressure / temperature monitoring on frac iron and well-test lines. Cameron / FMC interchange.',
    applications: [
      'Frac-spread pressure monitoring',
      'Well-test data acquisition',
      'Stimulation iron sensor mounts',
    ],
    oemKeywords: ['Cameron Data Header', 'FMC Instrument Manifold', 'NOV Sensor Header'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-FI-DH-602-6K-STD-INDUS',
    title: 'Data Header (Pressure Manifold), 602 Series, 6,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-flow-line',
    flowIronType: 'Data Header',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Standard',
    configuration: 'Pressure transmitter manifold with 2× instrument ports',
    endConnectionA: '602 Female Weco Union',
    endConnectionB: '602 Male Weco Union',
    endConnectionExtra: '2× 1/2 in NPT instrument taps',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal',
    lengthIn: '8-18 in',
    materialConstruction: STD_MAT,
    apiSpec: 'Other (frac-iron lineage)',
    materialClass: 'N/A',
    temperatureRating: STD_TEMP,
    oneLiner:
      '602 Series Data Header, 6,000 psi standard. Compact pressure-monitoring manifold for production-pressure well-test and flowback lines.',
    applications: [
      'Production well-test sensor mounts',
      'Flowback pressure monitoring',
      '6K well-control instrumentation',
    ],
    oemKeywords: ['FMC 602 Data Header', 'Cameron 602 Instrument'],
    leadTimeDays: 14,
  },

  // ════════════════════════════════════════════════════════════════════════
  // MANIFOLDS — Choke Manifolds (6)
  // ════════════════════════════════════════════════════════════════════════
  {
    sku: 'IH-FI-MN-CK-S-1502-15K-STD-CAMERON',
    title: 'Choke Manifold, Single-Stage 1502, 15,000 psi, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Single-stage choke — fixed or adjustable bean',
    endConnectionA: '1502 Female Weco Union (inlet)',
    endConnectionB: '1502 Male Weco Union (outlet)',
    endConnectionExtra: 'Optional 1/2 in NPT bypass and gauge taps',
    availableSizes: '2 in, 3 in line bore; bean sizes 1/16 in to 1 in',
    boreId: 'Choke bean (engineered per flow-rate spec)',
    lengthIn: '',
    materialConstruction: 'Forged 4130 body with tungsten-carbide choke bean and seat',
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series single-stage choke manifold, 15,000 psi standard. Cameron / FMC frac-iron interchange. Tungsten-carbide bean and seat for sand-laden flow.',
    applications: [
      'Frac flowback control',
      'Well-test rate management',
      'Drilling-fluid pressure-relief',
    ],
    oemKeywords: ['Cameron Choke 15K', 'FMC Choke Manifold', 'NOV Choke', 'Halliburton Choke'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-FI-MN-CK-D-1502-15K-STD-FMC',
    title: 'Choke Manifold, Dual-Stage 1502, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Dual-stage — primary positive choke + secondary adjustable choke',
    endConnectionA: '1502 Female Weco Union (inlet)',
    endConnectionB: '1502 Male Weco Union (outlet)',
    endConnectionExtra: 'Inlet / outlet gauge ports + emergency-shutdown bypass',
    availableSizes: '2 in, 3 in line bore; bean sizes 1/16 in to 1-1/2 in (per stage)',
    boreId: 'Two-stage bean configuration',
    lengthIn: '',
    materialConstruction: 'Forged 4130 body with tungsten-carbide bean / seat at both stages',
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series dual-stage choke manifold, 15,000 psi standard. Two chokes in series for two-step pressure let-down — common for high-rate frac flowback. FMC / Cameron interchange.',
    applications: [
      'High-rate frac flowback control',
      'Two-step pressure management',
      'Sand-laden well-test',
    ],
    oemKeywords: ['FMC Dual Choke', 'Cameron Two-Stage Choke', 'NOV Choke', 'Halliburton Cyclonic'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-FI-MN-CK-S-1502-10K-SOUR-HALLIBURTON',
    title: 'Choke Manifold, Single-Stage 1502, 10,000 psi, Sour Service',
    brandSlug: 'halliburton',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Single-stage choke, NACE-compliant',
    endConnectionA: '1502 Female Weco Union (inlet)',
    endConnectionB: '1502 Male Weco Union (outlet)',
    endConnectionExtra: 'NACE-compliant gauge ports',
    availableSizes: '2 in line bore; bean sizes 1/16 in to 1 in',
    boreId: 'Choke bean (engineered)',
    lengthIn: '',
    materialConstruction: 'Forged 4130 NACE-controlled with tungsten-carbide trim',
    apiSpec: 'API 16C',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Series single-stage choke manifold, 10,000 psi sour-service (NACE MR0175). Halliburton / Cameron interchange. For H₂S frac flowback and sour well-test.',
    applications: [
      'Sour-well frac flowback',
      'H₂S well-test rate management',
      'NACE-compliant flowback iron',
    ],
    oemKeywords: ['Halliburton Sour Choke', 'Cameron NACE Choke', 'FMC Sour Choke'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-FI-MN-CK-D-1502-10K-SOUR-FORUM',
    title: 'Choke Manifold, Dual-Stage 1502, 10,000 psi, Sour Service',
    brandSlug: 'forum-energy',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Dual-stage NACE choke (positive + adjustable)',
    endConnectionA: '1502 Female Weco Union (inlet)',
    endConnectionB: '1502 Male Weco Union (outlet)',
    endConnectionExtra: 'NACE gauge ports + emergency bypass',
    availableSizes: '2 in line bore; bean sizes 1/16 in to 1-1/2 in',
    boreId: 'Two-stage bean configuration',
    lengthIn: '',
    materialConstruction: 'Forged 4130 NACE-controlled with tungsten-carbide trim',
    apiSpec: 'API 16C',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Series dual-stage choke manifold, 10,000 psi sour-service. Forum Energy / Halliburton interchange. NACE-compliant two-step pressure let-down for sour wells.',
    applications: [
      'Sour-well high-rate flowback',
      'Two-step NACE pressure control',
      'H₂S sand-laden well-test',
    ],
    oemKeywords: ['Forum Energy Sour Choke', 'Halliburton Dual Sour', 'Cameron NACE Choke'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-FI-MN-CK-S-602-6K-SOUR-INDUS',
    title: 'Choke Manifold, Single-Stage 602, 6,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: 'Single-stage NACE choke, compact',
    endConnectionA: '602 Female Weco Union (inlet)',
    endConnectionB: '602 Male Weco Union (outlet)',
    endConnectionExtra: '',
    availableSizes: '2 in, 3 in line bore; bean 1/16 in to 1 in',
    boreId: 'Choke bean',
    lengthIn: '',
    materialConstruction: 'Forged 4130 NACE-controlled with tungsten-carbide trim',
    apiSpec: 'API 16C',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '602 Series single-stage choke manifold, 6,000 psi sour-service. For 6K H₂S production well-test and flowback control.',
    applications: [
      'Sour-well production flowback',
      'H₂S well-test choking',
      '6K sour-service control',
    ],
    oemKeywords: ['FMC 602 Choke', 'Cameron 602 NACE', 'Halliburton 6K Sour'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-FI-MN-CK-API10K-FLG-NOV',
    title: 'Choke Manifold, API 6BX 10K Flanged, Standard Service',
    brandSlug: 'nov',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Choke Manifold',
    figureClass: '10K',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    configuration: 'Single-stage choke, API 6BX flanged inlet / outlet',
    endConnectionA: 'API 6BX 10K flange (inlet)',
    endConnectionB: 'API 6BX 10K flange (outlet)',
    endConnectionExtra: 'Optional 1502 Weco-union outlet on request',
    availableSizes: '3-1/16 in flange bore; bean 1/16 in to 1-1/2 in',
    boreId: 'Choke bean',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'API 6A',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      'API 6BX 10K flanged choke manifold, single-stage, standard service. NOV / Cameron wellhead interchange. Permanently-mounted choke for production-tree integration.',
    applications: [
      'Production-tree integrated choke',
      'Wellhead-mounted flowback control',
      '10K permanent surface installations',
    ],
    oemKeywords: ['NOV 10K Choke', 'Cameron API Choke', 'FMC Wellhead Choke', 'Halliburton'],
    leadTimeDays: 35,
  },

  // ════════════════════════════════════════════════════════════════════════
  // MANIFOLDS — Diverter, Multi-Well, Skid Packages (6)
  // ════════════════════════════════════════════════════════════════════════
  {
    sku: 'IH-FI-MN-DV-1502-15K-STD-FORUM',
    title: 'Diverter Manifold, 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'forum-energy',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Diverter Manifold',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Diverter manifold — 1 inlet × 2 outlets with isolation valves',
    endConnectionA: '1502 Female Weco Union (inlet)',
    endConnectionB: '1502 Male Weco Union (×2 outlets)',
    endConnectionExtra: '2× plug-valve isolation per outlet',
    availableSizes: '2 in, 3 in',
    boreId: 'Same as nominal',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series diverter manifold, 15,000 psi standard. Forum Energy / Halliburton interchange. Diverts a single high-pressure stream into one of two outlet paths via plug-valve isolation.',
    applications: [
      'Frac-spread bypass routing',
      'Two-tank flowback diversion',
      'Pressure-test isolation',
    ],
    oemKeywords: ['Forum Energy Diverter', 'Halliburton Bypass', 'FMC Diverter'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-FI-MN-MW-1502-4WELL-15K-STD-NOV',
    title: 'Multi-Well Manifold (4-Well), 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'nov',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Multi-Well Manifold',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: '4-well frac-spread distribution manifold with plug-valve isolation per well',
    endConnectionA: '1502 Female Weco Union (×4 inlets — one per well)',
    endConnectionB: '1502 Male Weco Union (×1-2 trunk outlets)',
    endConnectionExtra: 'Plug-valve isolation per well + check-valve on each branch',
    availableSizes: '3 in trunk × 2 in branches (typical) — engineered per spread',
    boreId: 'Same as nominal',
    lengthIn: 'Skid-mounted, 8-12 ft footprint',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series 4-well frac-spread distribution manifold, 15,000 psi standard. NOV / SPM frac-pad interchange. Distributes pump-truck output across 4 wells with per-well isolation.',
    applications: [
      'Multi-well frac pad distribution',
      'Zipper-frac pumping spreads',
      'Coiled-tubing multi-well operations',
    ],
    oemKeywords: ['NOV 4-Well Manifold', 'SPM Multi-Well', 'Forum Energy Pad Iron', 'Halliburton'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-FI-MN-MW-1502-8WELL-15K-STD-SPM',
    title: 'Multi-Well Manifold (8-Well), 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Multi-Well Manifold',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: '8-well frac-spread distribution manifold — engineered to order',
    endConnectionA: '1502 Female Weco Union (×8 inlets)',
    endConnectionB: '1502 Male Weco Union (×2-4 trunk outlets)',
    endConnectionExtra: 'Plug-valve isolation per well + check-valve on each branch',
    availableSizes: '4 in trunk × 3 in branches (typical) — engineered per spread',
    boreId: 'Same as nominal',
    lengthIn: 'Skid-mounted, 12-20 ft footprint',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series 8-well frac-spread distribution manifold, 15,000 psi standard. SPM / NOV / Halliburton frac-pad interchange. The full-scale multi-well frac distribution package.',
    applications: [
      'Large-pad zipper-frac operations',
      'Multi-well simul-frac spreads',
      'High-throughput pumping pads',
    ],
    oemKeywords: ['SPM 8-Well Manifold', 'NOV Multi-Well', 'Halliburton Pad Manifold', 'Forum Energy'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-FI-MN-MW-1502-8WELL-10K-SOUR-HALLIBURTON',
    title: 'Multi-Well Manifold (8-Well), 1502 Series, 10,000 psi, Sour Service',
    brandSlug: 'halliburton',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Multi-Well Manifold',
    figureClass: '1502',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    configuration: '8-well NACE-compliant distribution manifold',
    endConnectionA: '1502 Female Weco Union (×8 inlets) — sour service',
    endConnectionB: '1502 Male Weco Union (×2-4 trunk outlets)',
    endConnectionExtra: 'NACE plug-valve and check-valve isolation per branch',
    availableSizes: '3 in trunk × 2 in branches — engineered per spread',
    boreId: 'Same as nominal',
    lengthIn: 'Skid-mounted, 12-20 ft footprint',
    materialConstruction: SOUR_MAT,
    apiSpec: 'API 16C',
    materialClass: 'EE',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      '1502 Series 8-well frac-spread distribution manifold, 10,000 psi sour-service. Halliburton / NOV interchange. Full NACE compliance for sour-well multi-well frac.',
    applications: [
      'Sour-well multi-well frac pads',
      'H₂S simul-frac spreads',
      'NACE-compliant pumping pads',
    ],
    oemKeywords: ['Halliburton Sour 8-Well', 'NOV NACE Manifold', 'SPM Sour Pad'],
    leadTimeDays: 112,
  },
  {
    sku: 'IH-FI-MN-SK-1502-15K-STD-FORUM',
    title: 'Manifold Skid Package (Frac Iron), 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'forum-energy',
    countryOfOrigin: 'USA',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Manifold Skid',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Skid-mounted frac iron package — distribution manifold + chokes + plug valves + isolation',
    endConnectionA: '1502 Female Weco Union (multiple inlets)',
    endConnectionB: '1502 Male Weco Union (multiple outlets)',
    endConnectionExtra: 'Engineered to customer flow-path spec; includes structural skid, lifting points, walkways',
    availableSizes: 'Engineered to spread requirements — typical 20-40 ft skid footprints',
    boreId: 'Per branch spec',
    lengthIn: '20-40 ft skid',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series engineered frac iron manifold skid package, 15,000 psi standard. Forum Energy / Halliburton turnkey frac-spread iron — distribution + chokes + isolation in a single skid.',
    applications: [
      'Turnkey frac-spread iron packages',
      'Pre-fabricated pumping skids',
      'Mobile pressure-control packages',
    ],
    oemKeywords: ['Forum Energy Manifold Skid', 'Halliburton Frac Skid', 'NOV Pad Skid', 'SPM Skid'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-FI-MN-PKG-1502-15K-STD-INDUS',
    title: 'Flow Line Package (Engineered), 1502 Series, 15,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    categorySlug: 'flow-iron-manifolds',
    flowIronType: 'Flow Line Package',
    figureClass: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    configuration: 'Custom-engineered flow line package — pup joints + swivel joints + crosses + tees + chokes per spread',
    endConnectionA: 'Customer-specified',
    endConnectionB: 'Customer-specified',
    endConnectionExtra: 'Full bill-of-materials engineered to operational data sheet',
    availableSizes: 'Engineered to spread spec',
    boreId: 'Per branch',
    lengthIn: '',
    materialConstruction: STD_MAT,
    apiSpec: 'API 16C',
    materialClass: 'AA',
    temperatureRating: STD_TEMP,
    oneLiner:
      '1502 Series engineered flow line package, 15,000 psi standard. Custom frac-iron bill-of-materials — pup joints, swivels, crosses, tees, manifolds, valves, gaskets, all matched to your operational spec.',
    applications: [
      'Frac-spread turnkey iron packages',
      'New-rig commissioning kits',
      'Stimulation-iron renewal',
    ],
    oemKeywords: ['Frac Iron Package', 'Halliburton Spread', 'FMC Spread', 'SPM Spread'],
    leadTimeDays: 56,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-flow-iron-wellhead-1',
    description:
      'Flow Iron & Wellhead — Batch 1: Flow Line + Manifolds (38 consolidated PDPs) + Halliburton + Forum Energy.',
  },
  brands: BRANDS,
  categories: CATEGORIES,
  specTemplates: [],
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'flow-iron-wellhead',
    parentSubLabel: 'Flow Iron',
    replacements: [
      { label: 'Adapters', categorySlug: 'flow-iron-adapters' },
      { label: 'Fittings', categorySlug: 'flow-iron-fittings' },
      { label: 'API Flanges', categorySlug: 'flow-iron-flanges-api' },
      { label: 'Flow Line', categorySlug: 'flow-iron-flow-line' },
      { label: 'Manifolds', categorySlug: 'flow-iron-manifolds' },
    ],
  },
  products: PRODUCTS.map(makeProduct),
}

export default batch
