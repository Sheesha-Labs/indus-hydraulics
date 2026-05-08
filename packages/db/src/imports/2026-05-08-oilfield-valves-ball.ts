/**
 * Oilfield Valves — Batch 0 (framework + Ball Valves) — 2026-05-08
 *
 * First batch in the Oilfield Valves initiative. Establishes:
 *   - 6 new OEM brand records (Cameron, FMC Technologies, WOM, Anson,
 *     SPM Oil & Gas, Stream-Flo) — all isAuthorizedDistributor=false until
 *     formal distributor agreements are in place.
 *   - 1 new spec template (oilfield-valve-spec, 14 fields) — covers ball,
 *     gate, check, plug, choke, globe, butterfly, SSV/ESD, pressure relief,
 *     instrumentation valves used in wellhead, frac, and process service.
 *   - 1 new top-level category (oilfield-valves) parallel to oil-gas-hoses.
 *   - 1 sub-category (oilfield-ball-valves).
 *   - New megamenu column "Oilfield Valves" with sub-section
 *     "Wellhead & Frac" → leaf "Ball Valves". Subsequent batches will add
 *     more sub-sections (Gate/SSV, Check, Plug/Choke, Globe/PRV/Butterfly,
 *     Instrumentation/Accessories) and leaves.
 *   - 11 ball valve products: floating + trunnion, 2"–4", 285 psi to 15K psi,
 *     Weco unions (1502/602/206) + flanged + butt-weld, sour and standard
 *     service. Brands distributed across WOM, Anson, SPM, Cameron, Indus.
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-ball.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-ball.ts
 */
import type {
  BrandPayload,
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

// ── Brand records ─────────────────────────────────────────────────────────

const BRANDS: BrandPayload[] = [
  {
    slug: 'cameron',
    name: 'Cameron',
    country: 'USA',
    description:
      'Cameron is a global manufacturer of wellhead equipment, gate valves, ball valves, choke valves, and surface safety systems for upstream oil and gas. Now part of SLB.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Cameron Valves & Wellhead Equipment | Indus Hydraulics',
    seoDescription:
      'Cameron wellhead, gate valves, ball valves, choke valves, and surface safety systems supplied by Indus Hydraulics. AED pricing, RFQ on request.',
  },
  {
    slug: 'fmc-technologies',
    name: 'FMC Technologies',
    country: 'USA',
    description:
      'FMC Technologies (TechnipFMC) supplies wellhead equipment, frac trees, gate valves, choke valves, and surface safety valves for upstream oil and gas operations.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'FMC Technologies Valves & Frac Equipment | Indus Hydraulics',
    seoDescription:
      'FMC Technologies wellhead, frac trees, gate valves, choke valves, and SSV/ESD supplied by Indus Hydraulics in the UAE. RFQ on request.',
  },
  {
    slug: 'wom',
    name: 'Worldwide Oilfield Machine',
    country: 'USA',
    description:
      'Worldwide Oilfield Machine (WOM) manufactures gate, ball, plug, and check valves plus choke manifolds for wellhead and frac applications. Texas-based since 1980.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'WOM Worldwide Oilfield Machine Valves | Indus Hydraulics',
    seoDescription:
      'WOM gate, ball, plug, and check valves plus choke manifolds for wellhead and frac service. Supplied by Indus Hydraulics. RFQ on request.',
  },
  {
    slug: 'anson',
    name: 'Anson',
    country: 'United Kingdom',
    description:
      'Anson manufactures high-pressure frac flow iron, plug valves, ball valves, and check valves for well stimulation and pressure pumping. Based in Tyne & Wear, UK.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Anson Frac Flow Iron & Valves | Indus Hydraulics',
    seoDescription:
      'Anson frac flow iron, plug valves, ball valves, and check valves for well stimulation. Supplied by Indus Hydraulics in the UAE. RFQ on request.',
  },
  {
    slug: 'spm-oil-gas',
    name: 'SPM Oil & Gas',
    country: 'USA',
    description:
      'SPM Oil & Gas (a Weir Group brand) supplies plug valves, chokes, swivel joints, and pressure pumping equipment for hydraulic fracturing operations.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'SPM Oil & Gas Plug Valves & Chokes | Indus Hydraulics',
    seoDescription:
      'SPM Oil & Gas plug valves, chokes, and frac equipment supplied by Indus Hydraulics. AED pricing, RFQ on request.',
  },
  {
    slug: 'stream-flo',
    name: 'Stream-Flo Industries',
    country: 'Canada',
    description:
      'Stream-Flo Industries is a Canadian manufacturer of wellhead equipment, gate valves, ball valves, and Christmas trees for upstream oil and gas.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Stream-Flo Wellhead Valves & Christmas Trees | Indus Hydraulics',
    seoDescription:
      'Stream-Flo wellhead equipment, gate valves, ball valves, and Christmas trees supplied by Indus Hydraulics in the UAE. RFQ on request.',
  },
]

// ── Spec template ─────────────────────────────────────────────────────────

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
      options: ['PR1', 'PR2', 'N/A'],
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
  ],
}

// ── Categories ────────────────────────────────────────────────────────────

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'oilfield-valves',
    name: 'Oilfield Valves',
    parentSlug: null,
    shortDescription:
      'Wellhead, frac, and process oilfield valves — ball, gate, check, plug, choke, globe, butterfly, surface safety (SSV/ESD), pressure relief, instrumentation. API 6A / 6D / 16C, sour and standard service.',
    position: 9,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Valves — Wellhead, Frac & Process | Indus Hydraulics',
    seoDescription:
      'Ball, gate, check, plug, choke, globe, butterfly, SSV, ESD, and pressure relief valves for wellhead, frac, and process service. API 6A / 6D / 16C. AED pricing, RFQ on request.',
  },
  {
    slug: 'oilfield-ball-valves',
    name: 'Ball Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Floating and trunnion ball valves for wellhead, frac, and process service. Weco unions (1502/602/206), API flanges, and butt-weld ends. 2K to 15K psi, sour and standard service.',
    position: 0,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Ball Valves — Floating & Trunnion | Indus Hydraulics',
    seoDescription:
      'Floating and trunnion ball valves for wellhead, frac, and process service. 1502/602/206 Weco unions, API flanges, butt-weld. 2K-15K psi, sour and standard. AED pricing, RFQ.',
  },
]

// ── Per-product input shape ───────────────────────────────────────────────

type BallValveInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  valveType: 'Ball — Floating' | 'Ball — Trunnion'
  nominalSize: string
  workingPressurePsi: number
  pressureClass: string
  endConnectionInlet: string
  endConnectionOutlet: string
  serviceClass: 'Standard' | 'Sour (NACE MR0175)'
  apiSpec: string
  pslClass: string
  prClass: string
  bodyMaterial: string
  trimMaterial: string
  sealMaterial: string
  boreType: 'Full Port' | 'Reduced Port' | 'Standard'
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

// ── HTML description builder ──────────────────────────────────────────────

function buildHtml(g: BallValveInput): string {
  const sourLine =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'NACE MR0175 / ISO 15156 sour-service compliant — H₂S-rated trim and elastomers.'
      : 'Standard service rated for clean hydrocarbon and water-cut streams.'
  const apiLine =
    g.apiSpec === 'Other'
      ? 'Manufactured to recognised oilfield flow-iron design standards (frac iron lineage).'
      : `Manufactured to ${escape(g.apiSpec)}${g.pslClass !== 'N/A' ? `, ${escape(g.pslClass)}` : ''}${g.prClass !== 'N/A' ? `, ${escape(g.prClass)}` : ''}.`
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.valveType.toLowerCase())} ball valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure with ${escape(g.endConnectionInlet)} inlet and ${escape(g.endConnectionOutlet)} outlet. ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.valveType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Bore: ${escape(g.boreType)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim material: ${escape(g.trimMaterial)}</li>
<li>Seal / elastomer: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class). ${escape(apiLine)} Service class: ${escape(g.serviceClass)}.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'Recognised oilfield flow-iron design standards' : g.apiSpec)}</li>
${g.pslClass !== 'N/A' ? `<li>Material class: ${escape(g.pslClass)}</li>` : ''}
${g.prClass !== 'N/A' ? `<li>Performance requirement: ${escape(g.prClass)}</li>` : ''}
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
</ul>
<h3>How to order</h3>
<p>Confirm (a) line pressure rating and pressure class, (b) inlet and outlet end-connection sizes / styles, (c) service class (sour vs standard), (d) bore preference (full vs reduced port), and (e) any temperature, fugitive-emissions, or fire-safe certification requirements. Indus quotes ex-Dubai with full mill test reports, API monogram traceability where applicable, and pre-shipment hydrostatic / shell test certificates.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure check valves, plug valves, and flow-iron unions of the same end-connection family. For wellhead service, also specify gate valves and surface safety valves of the equivalent API 6A pressure class. For frac applications, the 1502, 602, and 206 Weco unions are the most common matched standards.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: BallValveInput): FaqEntry[] {
  const sourFaq =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'Yes — this valve is fully NACE MR0175 / ISO 15156 compliant for sour-service exposure (H₂S-bearing streams). Body, stem, ball, and elastomers are selected to the NACE hardness and chemistry limits. Provide an inquiry data sheet listing partial pressures, temperature, and chloride levels and we will confirm trim suitability.'
      : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE thresholds), specify the NACE MR0175 compliant variant of this size and pressure class on the RFQ.'
  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. The valve is hydrotested at the standard 1.5× shell-test pressure and seat-tested per the applicable specification. The working pressure is fixed by both the body design and the end connection — the union or flange rating is the limiting factor at the joint.`,
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') || g.endConnectionInlet.includes('206') ? 'These are Weco wing-union connections, the standard for frac flow iron — the F (female) half threads onto the M (male) half via the wing nut. Always match like-class on both sides of the joint.' : g.endConnectionInlet.includes('Flanged') || g.endConnectionInlet.includes('M ') ? 'These are wellhead flanged ends per API 6A — ring-joint gasket (RTJ) sealing. Studs and nuts to match the API 6BX hub bolting pattern.' : g.endConnectionInlet.includes('RF') ? 'These are ANSI raised-face flanged ends — standard B16.5 bolting and gasket pattern.' : g.endConnectionInlet.includes('BW') || g.endConnectionInlet.includes('Butt-Weld') ? 'These are butt-weld ends per ASME B16.25 — for permanent in-line installation. Schedule (wall thickness) selected to match line pressure rating.' : 'See the spec table for inlet / outlet detail.'}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a: sourFaq,
    },
    {
      q: 'Is this a full-port or reduced-port ball?',
      a: `${g.boreType}. ${g.boreType === 'Full Port' ? 'A full-port ball matches the bore ID through the body, allowing pigging and minimising pressure drop — preferred for frac iron and wellhead service.' : 'Reduced-port balls have a smaller bore than the connection ID — gives a lighter body and lower torque to operate, at the cost of higher pressure drop. Common in process-plant service.'}`,
    },
    {
      q: 'What materials are used for the body, trim, and seals?',
      a: `Body: ${g.bodyMaterial}. Trim (ball + stem): ${g.trimMaterial}. Seals / elastomers: ${g.sealMaterial}. Alternative trim and seal materials (Inconel, F22, F51, FFKM, Devlon, RPTFE) are available on request for higher-temperature, sour, or chemical service.`,
    },
    {
      q: 'What standards and certifications does this valve comply with?',
      a: `${g.apiSpec === 'Other' ? 'Manufactured to recognised oilfield frac flow-iron design standards (lineage from API 6A pressure-class methodology). Material certificates are issued per EN 10204 3.1 / 3.2 on request.' : `${g.apiSpec}, ${g.pslClass !== 'N/A' ? `material class ${g.pslClass}, ` : ''}${g.prClass !== 'N/A' ? `performance requirement ${g.prClass}.` : '.'} Mill test reports per EN 10204 3.1 / 3.2 supplied with each unit.`} ${g.serviceClass === 'Sour (NACE MR0175)' ? 'Plus NACE MR0175 / ISO 15156 sour-service compliance.' : ''}`,
    },
    {
      q: 'What is the lead time?',
      a: `Common combinations are stocked or short-lead from ${g.countryOfOrigin === 'UAE' ? 'our Dubai warehouse' : 'OEM source'} — typical lead time ${g.leadTimeDays} working days. Sour-service variants and unusual sizes / pressure classes ship 8–14 weeks ex-works depending on OEM build slots. Contact us with the full size + pressure + service spec for a firm delivery date.`,
    },
    {
      q: 'Can this valve be integrated into a manifold skid or frac iron train?',
      a: 'Yes — Indus also supplies matched plug valves, check valves, swivel joints, integral fittings, and frac flow iron in the same Weco / flanged end-connection family. We can quote complete frac trees, manifold blocks, choke skids, and Christmas trees on request. Specify upstream and downstream connections, pressure class, and service class on the RFQ and we will return a complete bill of materials.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: BallValveInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'oilfield-ball-valves',
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
      body_material: g.bodyMaterial,
      trim_material: g.trimMaterial,
      seal_material: g.sealMaterial,
      bore_type: g.boreType,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword:
      `${g.valveType.toLowerCase().includes('floating') ? 'floating ball valve' : 'trunnion ball valve'} ${g.workingPressurePsi >= 10000 ? Math.round(g.workingPressurePsi / 1000) + 'k psi' : g.workingPressurePsi + ' psi'}${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

// ── Product data (11 ball valves) ─────────────────────────────────────────

const PRODUCTS: BallValveInput[] = [
  {
    sku: 'IH-OFV-BALL-2-1502FM-10K-SOUR-WOM',
    title: 'Floating Ball Valve, 2 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged alloy steel (4130) — NACE-compliant',
    trimMaterial: '316SS ball + 17-4PH stem',
    sealMaterial: 'Devlon seats + HNBR O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M Weco-union floating ball valve, 10,000 psi sour-service rated. NACE MR0175 trim. Full-port — for frac iron service trees and high-pressure flow lines.',
    applications: [
      'Frac iron service trees',
      'High-pressure well-stimulation flow lines',
      'Coiled-tubing kill / circulation lines',
      'Flow-back manifolds (sour wells)',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-BALL-2-1502MF-10K-SOUR-ANSON',
    title: 'Floating Ball Valve, 2 in × 1502 M×F, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '2 in 1502 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged alloy steel (4130) — NACE-compliant',
    trimMaterial: '316SS ball + 17-4PH stem',
    sealMaterial: 'Devlon seats + HNBR O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 M×F Weco-union floating ball valve, 10,000 psi sour-service rated. Reverse end-connection orientation for tee-to-line flow direction.',
    applications: [
      'Frac iron tee-to-line connections',
      'Service-tree manifolds (reverse-flow leg)',
      'Coiled-tubing kill lines',
      'Sour-service flow-back assemblies',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-BALL-2-1502FM-15K-STD-WOM',
    title: 'Trunnion Ball Valve, 2 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Trunnion',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Female Weco Union',
    endConnectionOutlet: '2 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged alloy steel (4130)',
    trimMaterial: '316SS ball + 17-4PH stem (trunnion-mounted)',
    sealMaterial: 'RPTFE seats + FKM O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 1502 F×M trunnion-mounted ball valve, 15,000 psi standard-service rated. Trunnion design lowers operating torque and supports double block-and-bleed.',
    applications: [
      'High-pressure frac discharge manifolds',
      'Cement unit kill lines',
      '15K rated service trees',
      'Pressure-pumping iron (sweet wells)',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-BALL-2-602FM-6K-SOUR-ANSON',
    title: 'Floating Ball Valve, 2 in × 602 F×M, 6,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 6000,
    pressureClass: '5K',
    endConnectionInlet: '2 in 602 Female Weco Union',
    endConnectionOutlet: '2 in 602 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged carbon steel (LF2) — NACE-compliant',
    trimMaterial: '316SS ball + 17-4PH stem',
    sealMaterial: 'Devlon seats + HNBR O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 602 F×M Weco-union floating ball valve, 6,000 psi sour-service rated. 602 union pattern is the standard 6K low-torque connection for production and well-test iron.',
    applications: [
      'Production-test flow lines',
      'Well-test surface equipment',
      'Sour-service flow-back manifolds',
      '6K frac iron (low-pressure stages)',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-BALL-2-206FM-2K-STD-SPM',
    title: 'Floating Ball Valve, 2 in × 206 F×M, 2,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    endConnectionInlet: '2 in 206 Female Weco Union',
    endConnectionOutlet: '2 in 206 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged carbon steel (A105N)',
    trimMaterial: '316SS ball + 17-4PH stem',
    sealMaterial: 'RPTFE seats + FKM O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 206 F×M Weco-union floating ball valve, 2,000 psi standard-service rated. 206 union is the low-pressure standard for cementing, kill-fluid, and test lines.',
    applications: [
      'Cementing surface lines',
      'Kill-fluid circulation',
      'Low-pressure flow-back lines',
      'Mud-circulation skid manifolds',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-BALL-3-1502FM-15K-STD-ANSON',
    title: 'Trunnion Ball Valve, 3 in × 1502 F×M, 15,000 psi, Standard Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    valveType: 'Ball — Trunnion',
    nominalSize: '3 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '3 in 1502 Female Weco Union',
    endConnectionOutlet: '3 in 1502 Male Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged alloy steel (4130)',
    trimMaterial: '316SS ball + 17-4PH stem (trunnion-mounted)',
    sealMaterial: 'RPTFE seats + FKM O-rings',
    boreType: 'Full Port',
    oneLiner:
      '3 in × 1502 F×M trunnion-mounted ball valve, 15,000 psi standard-service rated. Larger 3-inch bore for high-rate frac discharge and cement-unit pump-off lines.',
    applications: [
      '3-inch frac discharge manifolds',
      'High-rate cement-unit pump-off',
      '15K service trees (3-inch leg)',
      'Pressure-pumping iron — sweet wells',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-BALL-3-5M-FLG-5K-SOUR-WOM',
    title: 'Trunnion Ball Valve, 3-1/8 in × 5M Flanged, 5,000 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Trunnion',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    bodyMaterial: 'Forged AISI 4130 — NACE-compliant',
    trimMaterial: '410SS ball + Inconel-625 overlay seats',
    sealMaterial: 'PEEK back-up + HNBR primary seals',
    boreType: 'Full Port',
    oneLiner:
      '3-1/8 in × 5M flanged trunnion-mounted ball valve per API 6A PSL 3 / PR1 / sour service. RTJ end-connection — wellhead service for production trees and Christmas trees.',
    applications: [
      'Wellhead production trees (sour)',
      'Christmas-tree side-outlet valves',
      '5K wellhead manifold blocks',
      'Subsea-adjacent surface equipment',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-BALL-4-600RF-1480-SOUR-CAMERON',
    title: 'Trunnion Ball Valve, 4 in × 600# RF, 1,480 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Trunnion',
    nominalSize: '4 in',
    workingPressurePsi: 1480,
    pressureClass: 'ANSI 600',
    endConnectionInlet: '4 in 600# ANSI Raised-Face Flange',
    endConnectionOutlet: '4 in 600# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'ASTM A350 LF2 — NACE-compliant',
    trimMaterial: '316L ball + Inconel-625 overlay seats',
    sealMaterial: 'PEEK back-up + Viton (FKM) primary seals',
    boreType: 'Full Port',
    oneLiner:
      '4 in × 600# RF trunnion-mounted ball valve, 1,480 psi sour-service per API 6D. ANSI raised-face flanges for gas-processing and pipeline-inlet manifold service.',
    applications: [
      'Gas-processing inlet manifolds',
      'Pipeline pig-launcher block valves',
      'Process-plant emergency block-and-bleed',
      '600# class refinery / gas-plant service',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-BALL-4-1502FM-10K-SOUR-WOM',
    title: 'Trunnion Ball Valve, 4 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Trunnion',
    nominalSize: '4 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '4 in 1502 Female Weco Union',
    endConnectionOutlet: '4 in 1502 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged alloy steel (4130) — NACE-compliant',
    trimMaterial: '316SS ball + 17-4PH stem (trunnion-mounted)',
    sealMaterial: 'Devlon seats + HNBR O-rings',
    boreType: 'Full Port',
    oneLiner:
      '4 in × 1502 F×M trunnion-mounted ball valve, 10,000 psi sour-service rated. Large-bore frac flow iron for high-rate stimulation and sand-water blender discharge.',
    applications: [
      'Sand / water blender discharge',
      'High-rate frac discharge manifolds',
      'Flow-back tank manifolds (sour)',
      '4-inch frac iron service trees',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-BALL-2-150RF-285-STD-INDUS',
    title: 'Floating Ball Valve, 2 in × 150# RF, 285 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 285,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '2 in 150# ANSI Raised-Face Flange',
    endConnectionOutlet: '2 in 150# ANSI Raised-Face Flange',
    serviceClass: 'Standard',
    apiSpec: 'API 608',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Cast carbon steel (WCB)',
    trimMaterial: '316SS ball + 316SS stem',
    sealMaterial: 'RPTFE seats + Viton (FKM) O-rings',
    boreType: 'Full Port',
    oneLiner:
      '2 in × 150# RF floating ball valve, 285 psi standard-service per API 608 / ASME B16.34. General-purpose isolation for utility, instrument-air, and low-pressure process service.',
    applications: [
      'Utility air / water lines',
      'Low-pressure process isolation',
      'Instrument-supply manifolds',
      'General-service block valves',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-OFV-BALL-2-BW160-5K-SOUR-SPM',
    title: 'Floating Ball Valve, 2 in × Butt-Weld Schedule 160, 5,000 psi, Sour Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    valveType: 'Ball — Floating',
    nominalSize: '2 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '2 in Butt-Weld Schedule 160 (ASME B16.25)',
    endConnectionOutlet: '2 in Butt-Weld Schedule 160 (ASME B16.25)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    bodyMaterial: 'Forged AISI 4130 — NACE-compliant',
    trimMaterial: '316SS ball + 17-4PH stem',
    sealMaterial: 'PEEK back-up + HNBR primary seals',
    boreType: 'Full Port',
    oneLiner:
      '2 in × butt-weld Sch 160 floating ball valve, 5,000 psi sour-service per API 6D. Permanent in-line installation — no flange or union joint at the valve body.',
    applications: [
      'Permanent in-line block valves (sour)',
      'Pipeline pig-trap header isolation',
      '5K welded manifolds',
      'Sand-control surface trees (welded leg)',
    ],
    leadTimeDays: 21,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-oilfield-valves-ball',
    description:
      'Oilfield Valves Batch 0 — establishes new top-level category, oilfield-valve-spec template, 6 OEM brand records (Cameron, FMC Technologies, WOM, Anson, SPM, Stream-Flo), new megamenu column, and 11 ball valves across floating + trunnion designs in 285-15,000 psi range.',
  },

  brands: BRANDS,
  categories: CATEGORIES,
  specTemplates: [OILFIELD_VALVE_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'oilfield-valves',
    parentSubLabel: 'Wellhead & Frac',
    createColumnIfMissing: true,
    newColumnLabel: 'Oilfield Valves',
    createSubSectionIfMissing: true,
    replacements: [{ label: 'Ball Valves', categorySlug: 'oilfield-ball-valves' }],
  },

  products: PRODUCTS.map(makeProduct),
}

export default batch
