/**
 * Flow Iron & Wellhead — Batch 2 (Wellhead + Surface Test Trees) — 2026-05-08
 *
 * Final batch in the Flow Iron & Wellhead initiative. Reuses the
 * "Flow Iron & Wellhead" megamenu column established in Batch 0 (PR #91)
 * and extends it with a new "Wellhead Systems" sub-section.
 *
 * Establishes:
 *   - 2 new spec templates: wellhead-spec (14 fields, position 21) and
 *     surface-test-tree-spec (12 fields, position 22). Wellhead components
 *     have a fundamentally different parameter set from frac iron — API 6A
 *     temperature classes, PSL / PR classes, material classes, top / bottom
 *     connection geometry — so they get their own templates.
 *   - 2 new sub-categories under flow-iron-wellhead: wellhead (position 5),
 *     surface-test-trees (position 6).
 *   - 1 new megamenu sub-section "Wellhead Systems" at position 1 (after
 *     "Flow Iron" sub-section at position 0) with 2 leaves: Wellhead +
 *     Surface Test Trees.
 *   - 22 consolidated PDPs (15 Wellhead + 7 Surface Test Tree) covering
 *     the canonical industry product families across Cameron, FMC, Stream-Flo,
 *     NOV, Halliburton, Forum Energy, Anson, and Indus brand allocations.
 *
 * Data source: industry-standard wellhead and STT product taxonomy (Cameron
 * Type C / Type SS-15, FMC SDX / FlexMaster, Stream-Flo, NOV PowerChoke,
 * Halliburton SafeShield, Forum Energy WellSAFE, etc.). BIF's public listings
 * for these categories were empty so each consolidated PDP was constructed
 * from public OEM catalogues and API 6A / 17D specification.
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
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

// ── Spec templates ────────────────────────────────────────────────────────

const WELLHEAD_SPEC: SpecTemplatePayload = {
  slug: 'wellhead-spec',
  name: 'Wellhead',
  description:
    'Spec template for API 6A wellhead components — tubing heads, casing heads, casing spools, Christmas trees, frac trees, tubing hangers, casing hangers, and wellhead adapters. Covers API 6A pressure classes (2K-20K), temperature classes (K-V), material classes (AA-HH), PSL 1-4, and PR 1/2.',
  position: 21,
  fields: [
    {
      key: 'wellhead_component_type',
      label: 'Wellhead Component Type',
      dataType: 'select',
      options: [
        'Tubing Head',
        'Casing Head',
        'Casing Spool',
        'Christmas Tree',
        'Frac Tree',
        'Tubing Head Adapter',
        'Casing Head Adapter',
        'Mandrel Tubing Hanger',
        'Slip-Type Casing Hanger',
        'Wellhead Studded Adapter',
        'Tree Cap',
        'Other',
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
      helpText: 'Bowl × tubing/casing bore, e.g. "11 in × 2-9/16 in" or "13-5/8 in × 2-1/16 in".',
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
      label: 'API 6A Pressure Class',
      dataType: 'select',
      options: ['2K', '3K', '5K', '10K', '15K', '20K'],
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: ['Standard', 'Sour (NACE MR0175)', 'High Temperature', 'Low Temperature'],
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'top_connection',
      label: 'Top Connection',
      dataType: 'text',
      helpText: 'Upper interface — flange size, ring groove, bore, e.g. "API 6BX 11 in 5K studded, RX-65 ring groove".',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'bottom_connection',
      label: 'Bottom Connection',
      dataType: 'text',
      helpText: 'Lower interface — flange / casing thread / weld-on.',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'vertical_bore',
      label: 'Vertical Through-Bore',
      dataType: 'text',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'temperature_class',
      label: 'Temperature Class (API 6A)',
      dataType: 'select',
      options: ['K', 'L', 'N', 'P', 'R', 'S', 'T', 'U', 'V'],
      helpText: 'API 6A temperature class — K (-75°F to 180°F) through V (-20°F to 350°F).',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'material_class',
      label: 'Material Class (API 6A)',
      dataType: 'select',
      options: ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'HH'],
      helpText:
        'API 6A material class. AA-CC for general/standard service, DD-FF for sour, HH for severe sour.',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'psl_class',
      label: 'Product Specification Level (PSL)',
      dataType: 'select',
      options: ['PSL 1', 'PSL 2', 'PSL 3', 'PSL 3G', 'PSL 4'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'pr_class',
      label: 'Performance Requirement (PR)',
      dataType: 'select',
      options: ['PR1', 'PR2'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'api_spec',
      label: 'API Specification',
      dataType: 'select',
      options: ['API 6A', 'API 17D', 'Other'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
    {
      key: 'body_material',
      label: 'Body Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
  ],
}

const SURFACE_TEST_TREE_SPEC: SpecTemplatePayload = {
  slug: 'surface-test-tree-spec',
  name: 'Surface Test Tree',
  description:
    'Spec template for surface test trees (STT) — pressure-control assemblies that sit above the wellhead during well testing, frac stimulation, coiled-tubing operations, snubbing, and subsea well testing. Includes hydraulic actuation pressures, valve counts, and end-connection details.',
  position: 22,
  fields: [
    {
      key: 'stt_configuration',
      label: 'STT Configuration',
      dataType: 'select',
      options: [
        'Conventional Frac STT',
        'Subsea STT',
        'Coiled-Tubing STT',
        'Snubbing STT',
        'Wellhead-Mounted STT',
        'Other',
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
      helpText: 'Vertical bore size, e.g. "5-1/8 in", "7-1/16 in".',
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
      options: ['5K', '10K', '15K', '20K'],
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: ['Standard', 'Sour (NACE MR0175)', 'High Temperature', 'Low Temperature'],
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'hydraulic_actuation_pressure',
      label: 'Hydraulic Actuation Pressure',
      dataType: 'text',
      helpText: 'For hydraulically-operated valves, the actuator pilot pressure (e.g. 3,000 psi pilot for 15K master valve).',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'valve_count',
      label: 'Valve Count',
      dataType: 'text',
      helpText: 'Total number of valves and breakdown by function (e.g. "5 valves: 2 master, 1 swab, 2 wing").',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 6,
    },
    {
      key: 'valve_types',
      label: 'Valve Types',
      dataType: 'text',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'end_connections',
      label: 'End Connections',
      dataType: 'text',
      helpText: 'Top, bottom, and lateral connection summary, e.g. "Top: 1502 Female. Bottom: API 6BX 10K studded. Lateral: 1502 Female × 2".',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'temperature_class',
      label: 'Temperature Class (API 6A)',
      dataType: 'select',
      options: ['K', 'L', 'N', 'P', 'R', 'S', 'T', 'U', 'V'],
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'material_class',
      label: 'Material Class (API 6A)',
      dataType: 'select',
      options: ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'HH'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'api_spec',
      label: 'API Specification',
      dataType: 'select',
      options: ['API 6A', 'API 16C', 'API 17D', 'Other'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
  ],
}

// ── Categories ────────────────────────────────────────────────────────────

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'wellhead',
    name: 'Wellhead',
    parentSlug: 'flow-iron-wellhead',
    shortDescription:
      'API 6A wellhead components — tubing heads, casing heads, casing spools, Christmas trees, frac trees, tubing hangers, slip-type casing hangers, and wellhead adapters. 2K-20K pressure classes, sour and standard service. Cameron / FMC / Stream-Flo / NOV / Anson / Indus.',
    position: 5,
    isPublished: true,
    defaultSpecTemplateSlug: 'wellhead-spec',
    seoTitle: 'API 6A Wellhead — Tubing Heads, Casing Heads, Christmas Trees | Indus Hydraulics',
    seoDescription:
      'Cameron / FMC / Stream-Flo / NOV API 6A wellhead components — tubing heads, casing heads, Christmas trees, frac trees, tubing hangers, casing hangers. 2K-20K, sour and standard. AED, RFQ.',
  },
  {
    slug: 'surface-test-trees',
    name: 'Surface Test Trees',
    parentSlug: 'flow-iron-wellhead',
    shortDescription:
      'API 16C / 6A surface test trees (STT) for frac stimulation, coiled-tubing, snubbing, and subsea well-test operations. Hydraulically-actuated master / swab / wing valves. 5K-15K pressure classes, sour and standard service. Halliburton / FMC / Forum Energy / Cameron.',
    position: 6,
    isPublished: true,
    defaultSpecTemplateSlug: 'surface-test-tree-spec',
    seoTitle: 'Surface Test Trees — Frac, Coiled-Tubing, Snubbing, Subsea | Indus Hydraulics',
    seoDescription:
      'Surface test trees for frac stimulation, coiled-tubing, snubbing, and subsea well testing. Hydraulically-actuated master, swab, and wing valves. 5K-15K psi. Halliburton, FMC, Forum Energy. AED, RFQ.',
  },
]

// ── Wellhead Input shape ──────────────────────────────────────────────────

type WellheadInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  componentType: string
  nominalSize: string
  workingPressurePsi: number
  pressureClass: string
  serviceClass: 'Standard' | 'Sour (NACE MR0175)'
  topConnection: string
  bottomConnection: string
  verticalBore: string
  temperatureClass: string
  materialClass: string
  pslClass: string
  prClass: string
  apiSpec: string
  bodyMaterial: string
  oneLiner: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
}

// ── STT Input shape ───────────────────────────────────────────────────────

type SttInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  configuration: string
  nominalSize: string
  workingPressurePsi: number
  pressureClass: string
  serviceClass: 'Standard' | 'Sour (NACE MR0175)'
  hydraulicActuationPressure: string
  valveCount: string
  valveTypes: string
  endConnections: string
  temperatureClass: string
  materialClass: string
  apiSpec: string
  oneLiner: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
}

// ── Wellhead HTML + FAQs ──────────────────────────────────────────────────

function buildWellheadHtml(g: WellheadInput): string {
  const sourLine =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'NACE MR0175 / ISO 15156 sour-service compliant — body, trim, ring grooves, and bolting selected to the H₂S-rated material class.'
      : 'Standard service rated for clean hydrocarbon and water-cut wellbores.'
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is an ${escape(g.componentType.toLowerCase())} for upstream oil and gas wellhead service, ${escape(g.pressureClass)} class (${escape(fmtPsi(g.workingPressurePsi))} working pressure), ${escape(g.serviceClass.toLowerCase())} rated. ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Component: ${escape(g.componentType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Vertical through-bore: ${escape(g.verticalBore)}</li>
<li>Top connection: ${escape(g.topConnection)}</li>
<li>Bottom connection: ${escape(g.bottomConnection)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Material class: ${escape(g.materialClass)} (API 6A)</li>
<li>Temperature class: ${escape(g.temperatureClass)} (API 6A)</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class). Manufactured to ${escape(g.apiSpec)}, ${escape(g.pslClass)} (Product Specification Level), ${escape(g.prClass)} (Performance Requirement). Hydrostatic body and ring-groove tests at 1.5× shell pressure on every unit.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>OEM equivalents and compatibility</h3>
<p>This component is supplied as a recognised dimensional and metallurgical interchange for the following OEM wellhead product lines (no implied authorised-distributor relationship — supplied by Indus Hydraulics):</p>
<ul>
${oemKw}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec)} design and manufacture</li>
<li>API 6A material class: ${escape(g.materialClass)}</li>
<li>API 6A temperature class: ${escape(g.temperatureClass)}</li>
<li>${escape(g.pslClass)} / ${escape(g.prClass)}</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Ring-groove dimension certificates and hardness reports</li>
</ul>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) wellhead bowl size and tubing / casing bore, (b) working pressure and pressure class, (c) top and bottom connection geometry (studded vs flanged, ring-groove series), (d) service class — sour (NACE MR0175) or standard, (e) temperature class, (f) PSL and PR requirements, (g) any custom porting (kill / circulation / instrumentation outlets), and (h) certification requirements. Indus quotes ex-Dubai with full API 6A traceability and OEM-source documentation on request.</p>
<h3>Companion products</h3>
<p>Pair with matched-class wellhead gate valves (manual or hydraulic), API 6BX flanges, ring-joint gaskets, BSL bolting, casing / tubing hangers, and tree caps in the same pressure class. For frac applications, stack into a frac tree with master valves, swab valves, wing valves, and pressure-release manifolds.</p>`
}

function buildWellheadFaqs(g: WellheadInput): FaqEntry[] {
  const sourFaq =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'Yes — fully NACE MR0175 / ISO 15156 compliant for sour-service exposure. Body, trim, and bolting selected to the hardness and chemistry limits of API 6A material class ' + g.materialClass + '. Provide an inquiry data sheet listing H₂S partial pressure, chloride content, and temperature and we will confirm material suitability and any additional cladding (Inconel 625 seal pockets, F22 / F51 trim).'
      : 'No — this is standard-service rated. For sour wells, specify the NACE MR0175 sour variant of this size and pressure class on the RFQ. Sour variants typically use API 6A material class DD, EE, or FF.'
  return [
    {
      q: 'What sizes and configurations are available?',
      a: `This product family covers ${g.nominalSize} (bowl × bore) at ${g.pressureClass} pressure class and ${g.serviceClass} service. Other bowl / bore combinations within the same pressure class can be sourced from the OEM mill on a build-to-order basis (typically 8–16 weeks lead). For complete frac trees, Christmas trees, or wellhead stacks, RFQ with the operator's wellhead drawing or full assembly drawing.`,
    },
    {
      q: 'What is the working pressure rating and PSL / PR?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. Manufactured to ${g.apiSpec}, ${g.pslClass}, ${g.prClass}. The PSL determines QA stringency (PSL 1 = baseline, PSL 4 = strictest with full third-party witness). PR1 is non-environmentally-rated; PR2 includes environmental performance testing.`,
    },
    {
      q: 'Is this product suitable for sour service (H₂S wells)?',
      a: sourFaq,
    },
    {
      q: 'What top and bottom connections does this component use?',
      a: `Top connection: ${g.topConnection}. Bottom connection: ${g.bottomConnection}. The connection geometry determines what mates above and below — verify ring-groove series (BX-150 to BX-169 etc.), bolting pattern, and pressure class match the connecting equipment before specifying.`,
    },
    {
      q: 'What OEM brands and product lines is this compatible with?',
      a: `Recognised matched-spec interchange for ${g.oemKeywords.join(', ')}. Indus is not an authorised distributor of these OEMs but every unit is engineered to be dimensionally and metallurgically interchangeable with the named OEM standard, with full API 6A traceability and OEM-source documentation. For applications requiring an OEM-stamped unit, we can source genuine OEM product on a build-to-order basis.`,
    },
    {
      q: 'What materials and material class are used?',
      a: `Body material: ${g.bodyMaterial}. API 6A material class: ${g.materialClass}. ${g.materialClass.match(/^(DD|EE|FF|HH)$/) ? 'This class is sour-service capable per NACE MR0175.' : 'This class is standard-service general use.'} Higher classes (Inconel 625 cladding on seal pockets, F22 / F51 wetted parts, NACE-compliant bolting per B7M / 2HM) are available on request for severe sour, high-temperature, or chloride-rich service.`,
    },
    {
      q: 'What standards and certifications come with each unit?',
      a: `Each unit ships with: (a) ${g.apiSpec} design and manufacture compliance, (b) ${g.pslClass} / ${g.prClass} certification, (c) EN 10204 3.1 mill test report (3.2 on request), (d) hydrostatic body and ring-groove test certificates at 1.5× shell pressure, (e) hardness reports, ${g.serviceClass === 'Sour (NACE MR0175)' ? '(f) NACE MR0175 / ISO 15156 sour-service certificate, ' : ''}and API monogram where the source mill holds the licence.`,
    },
    {
      q: 'What is the lead time and how do I order?',
      a: `Common combinations are short-lead from our Dubai warehouse — typical lead time ${g.leadTimeDays} working days. Custom configurations (sour service, exotic alloys, special porting) ship 12–20 weeks ex-works depending on OEM build slots. RFQ with: wellhead schematic or assembly drawing, target spec (size / pressure class / service), and any agency-specific documentation requirements.`,
    },
  ]
}

// ── STT HTML + FAQs ───────────────────────────────────────────────────────

function buildSttHtml(g: SttInput): string {
  const sourLine =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'NACE MR0175 / ISO 15156 sour-service compliant — body, trim, valve seats, and elastomers selected to the H₂S-rated material class.'
      : 'Standard service rated for clean hydrocarbon and completion-fluid streams.'
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a surface test tree (STT) for ${escape(g.configuration.toLowerCase())} service, ${escape(g.pressureClass)} class (${escape(fmtPsi(g.workingPressurePsi))} working pressure), ${escape(g.serviceClass.toLowerCase())} rated. ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Nominal vertical bore: ${escape(g.nominalSize)}</li>
<li>Valves: ${escape(g.valveCount)}</li>
<li>Valve types: ${escape(g.valveTypes)}</li>
<li>End connections: ${escape(g.endConnections)}</li>
<li>Hydraulic actuation: ${escape(g.hydraulicActuationPressure)}</li>
<li>Material class: ${escape(g.materialClass)}</li>
<li>Temperature class: ${escape(g.temperatureClass)}</li>
</ul>
<h3>Operation</h3>
<p>The STT functions as the primary surface pressure-control barrier during well-stimulation, well-test, coiled-tubing, snubbing, or subsea operations. Master valves provide the primary seal; swab valves enable wireline access; wing (lateral) valves route flow to the choke / flowback iron. Hydraulic actuators allow remote operation from the operator's panel — fail-safe close on hydraulic loss. ${escape(g.configuration === 'Subsea STT' ? 'Subsea variants are designed for installation on the seabed wellhead during exploration well-testing.' : g.configuration === 'Coiled-Tubing STT' ? 'Coiled-tubing variants integrate a pack-off / stripper for sealing around coiled tubing in the live well.' : g.configuration === 'Snubbing STT' ? 'Snubbing variants seal around tubing being run into a live well under pressure (snubbing operations).' : 'Conventional frac variants stack above the wellhead frac tree to control flowback pressure during frac stimulation.')}</p>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class). Hydrotested at 1.5× shell pressure. Designed and manufactured to ${escape(g.apiSpec)}. Each valve hydrotested per API 6A / 16C requirements before assembly.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>OEM equivalents and compatibility</h3>
<p>This STT is supplied as a recognised matched-spec interchange for the following OEM product lines (no implied authorised-distributor relationship):</p>
<ul>
${oemKw}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec)} design and manufacture</li>
<li>API 6A material class: ${escape(g.materialClass)}</li>
<li>API 6A temperature class: ${escape(g.temperatureClass)}</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Hydrostatic body, valve seat, and back-seat test certificates per unit</li>
</ul>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) operation type (frac / coiled-tubing / snubbing / subsea / well-test), (b) target working pressure and pressure class, (c) vertical bore and end-connection requirements (top / bottom / lateral), (d) valve count and types, (e) service class — sour (NACE MR0175) or standard, (f) hydraulic actuation pressure / panel requirements, (g) coiled-tubing pack-off requirement, and (h) certification beyond standard MTRs. Indus quotes ex-Dubai with full FAT (factory acceptance test) report on request.</p>
<h3>Companion products</h3>
<p>Pair with matched-class wellhead, frac tree, choke manifold, blowdown manifold, hydraulic control panel, hose loops, and pressure-relief lines. For coiled-tubing service, additionally specify pack-off / stripper, BOP stack, and reel iron.</p>`
}

function buildSttFaqs(g: SttInput): FaqEntry[] {
  const sourFaq =
    g.serviceClass === 'Sour (NACE MR0175)'
      ? 'Yes — fully NACE MR0175 / ISO 15156 compliant. Body, trim, valve seats, and elastomers selected to the hardness and chemistry limits of API 6A material class ' + g.materialClass + '. Provide H₂S partial pressure and chloride data on the RFQ to confirm material suitability.'
      : 'No — this is standard-service. Specify the sour-service variant on the RFQ for H₂S wells; sour variants typically downrate to 10K psi where standard runs 15K (NACE hardness limits).'
  return [
    {
      q: 'What is this surface test tree designed for?',
      a: `This is a ${g.configuration} configuration. ${g.configuration === 'Conventional Frac STT' ? 'Conventional frac STTs sit above the frac tree on a pumping spread to control flowback pressure and allow safe well isolation during frac operations.' : g.configuration === 'Coiled-Tubing STT' ? 'Coiled-tubing STTs include a pack-off / stripper for sealing around coiled tubing being run in or out of a live well.' : g.configuration === 'Snubbing STT' ? 'Snubbing STTs are used for snubbing operations where tubing is run into a live well under pressure.' : g.configuration === 'Subsea STT' ? 'Subsea STTs are deployed on the seabed wellhead for exploration well-testing in offshore operations.' : 'Wellhead-mounted STTs are integrated permanently with a production wellhead for testing and intervention service.'} Working pressure ${fmtPsi(g.workingPressurePsi)} (${g.pressureClass} class).`,
    },
    {
      q: 'How many valves does this STT have, and what are their functions?',
      a: `${g.valveCount}. Valve types: ${g.valveTypes}. Master valves are the primary safety barrier — kept fully open during operation, closed for shut-in. Swab valves are above the master and allow wireline access. Wing (lateral) valves route flow to the choke manifold or flowback iron. Each valve has redundant manual + hydraulic actuation where applicable.`,
    },
    {
      q: 'What hydraulic actuation pressure is needed?',
      a: `${g.hydraulicActuationPressure}. Hydraulic actuators are fail-safe close — loss of hydraulic pressure from the operator's panel causes the master and wing valves to spring-close, sealing the well. Indus can supply matched hydraulic control panels and umbilicals on the RFQ.`,
    },
    {
      q: 'Is this suitable for sour service (H₂S wells)?',
      a: sourFaq,
    },
    {
      q: 'What end connections does the STT have?',
      a: `${g.endConnections}. Confirm the matching wellhead, frac tree, or choke manifold connection geometry on your RFQ — ring-groove series (BX-152 etc.), pressure class, and gender must match.`,
    },
    {
      q: 'What standards and certifications come with each STT?',
      a: `Each STT ships with: (a) ${g.apiSpec} compliance, (b) API 6A material class ${g.materialClass} certification, (c) hydrostatic body and individual valve seat / back-seat tests, (d) full FAT (Factory Acceptance Test) report including hydraulic actuation cycle test, (e) EN 10204 3.1 / 3.2 mill test reports, ${g.serviceClass === 'Sour (NACE MR0175)' ? '(f) NACE MR0175 / ISO 15156 compliance certificate, ' : ''}and traceability stamps on every wetted-parts component.`,
    },
    {
      q: 'What OEM brands is this compatible with?',
      a: `Recognised matched-spec interchange for ${g.oemKeywords.join(', ')}. Indus engineers each unit to OEM dimensional and metallurgical equivalence with full traceability. For applications requiring an OEM-stamped or factory-witness-tested unit, we can source genuine OEM product on a build-to-order basis.`,
    },
    {
      q: 'What is the lead time?',
      a: `Common configurations from short-lead stock: ${g.leadTimeDays} working days. Custom configurations (subsea, coiled-tubing pack-off, sour service, exotic alloys) ship 16–28 weeks ex-works. RFQ with the well-test or stimulation programme and we will quote a complete BOM including spares kit, hydraulic panel, and FAT witnessing arrangements.`,
    },
  ]
}

// ── Translators ───────────────────────────────────────────────────────────

function makeWellheadProduct(g: WellheadInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'wellhead',
    specTemplateSlug: 'wellhead-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildWellheadHtml(g),
    specs: {
      wellhead_component_type: g.componentType,
      nominal_size: g.nominalSize,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      service_class: g.serviceClass,
      top_connection: g.topConnection,
      bottom_connection: g.bottomConnection,
      vertical_bore: g.verticalBore,
      temperature_class: g.temperatureClass,
      material_class: g.materialClass,
      psl_class: g.pslClass,
      pr_class: g.prClass,
      api_spec: g.apiSpec,
      body_material: g.bodyMaterial,
    },
    faqs: buildWellheadFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${g.componentType.toLowerCase()} ${g.pressureClass.toLowerCase()}${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour' : ''}`.slice(0, 120),
  }
}

function makeSttProduct(g: SttInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'surface-test-trees',
    specTemplateSlug: 'surface-test-tree-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildSttHtml(g),
    specs: {
      stt_configuration: g.configuration,
      nominal_size: g.nominalSize,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      service_class: g.serviceClass,
      hydraulic_actuation_pressure: g.hydraulicActuationPressure,
      valve_count: g.valveCount,
      valve_types: g.valveTypes,
      end_connections: g.endConnections,
      temperature_class: g.temperatureClass,
      material_class: g.materialClass,
      api_spec: g.apiSpec,
    },
    faqs: buildSttFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `surface test tree ${g.configuration.toLowerCase()} ${g.pressureClass.toLowerCase()}`.slice(0, 120),
  }
}

// ── Wellhead products (15) ────────────────────────────────────────────────

const WELLHEAD_PRODUCTS: WellheadInput[] = [
  {
    sku: 'IH-WH-TH-API-5K-CAMERON',
    title: 'Tubing Head, API 6BX 5K, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Tubing Head',
    nominalSize: '11 in × 2-9/16 in or 2-1/16 in tubing',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 5K studded flange — 11 in, BX-156 ring groove',
    bottomConnection: 'API 6BX 5K studded flange — to mate with casing head',
    verticalBore: '2-9/16 in or 2-1/16 in (tubing-spec dependent)',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 2',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130), normalised and tempered',
    oneLiner:
      'API 6BX 5K Tubing Head with hanger landing for production tubing. Cameron Type C / Type SS-15 dimensional interchange. The standard 5K production wellhead component.',
    applications: [
      'Production well tubing landing',
      'Onshore conventional oil and gas wellheads',
      'Mature-field workover wellhead replacement',
    ],
    oemKeywords: ['Cameron Type C 5K', 'FMC SDX 5K', 'Stream-Flo SD 5K', 'NOV ML-15'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-WH-TH-API-10K-FMC',
    title: 'Tubing Head, API 6BX 10K, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    componentType: 'Tubing Head',
    nominalSize: '11 in × 2-9/16 in / 3-1/16 in tubing',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 10K studded flange — 11 in, BX-158 ring groove',
    bottomConnection: 'API 6BX 10K studded flange',
    verticalBore: '2-9/16 in / 3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140), normalised and tempered',
    oneLiner:
      'API 6BX 10K Tubing Head for high-pressure production wellheads. FMC SDX-10 / Cameron equivalent. The 10K production-wellhead workhorse.',
    applications: [
      'High-pressure production wellheads',
      'Frac-stimulation well isolation',
      'High-pressure gas-well tubing landing',
    ],
    oemKeywords: ['FMC SDX 10K', 'Cameron Type SS-15 10K', 'Stream-Flo SD 10K', 'NOV ML-15 10K'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-WH-TH-API-10K-SOUR-CAMERON',
    title: 'Tubing Head, API 6BX 10K, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Tubing Head',
    nominalSize: '11 in × 2-9/16 in / 3-1/16 in tubing',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    topConnection: 'API 6BX 10K studded flange — sour-service ring groove (BX-158, NACE)',
    bottomConnection: 'API 6BX 10K studded flange — NACE-compliant studs and nuts',
    verticalBore: '2-9/16 in / 3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'EE',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130) — NACE MR0175 hardness controlled',
    oneLiner:
      'API 6BX 10K Tubing Head, sour-service (NACE MR0175). Cameron / FMC interchange. For H₂S production wellheads — material class EE.',
    applications: [
      'Sour-well production wellheads',
      'H₂S high-pressure tubing landing',
      'NACE-compliant production trees',
    ],
    oemKeywords: ['Cameron Sour 10K', 'FMC SDX-10 NACE', 'Stream-Flo Sour'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-WH-TH-API-15K-NOV',
    title: 'Tubing Head, API 6BX 15K, Standard Service',
    brandSlug: 'nov',
    countryOfOrigin: 'USA',
    componentType: 'Tubing Head',
    nominalSize: '11 in × 2-1/16 in / 3-1/16 in tubing',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 15K studded flange — BX-160 ring groove',
    bottomConnection: 'API 6BX 15K studded flange',
    verticalBore: '2-1/16 in / 3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR2',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140), high-strength heat-treated',
    oneLiner:
      'API 6BX 15K Tubing Head for ultra-high-pressure wellheads. NOV / Cameron / FMC interchange. The premium 15K class with PR2 environmental compliance.',
    applications: [
      'Deep gas-well wellheads',
      '15K frac-stimulation wellheads',
      'High-pressure subsea-pre-installation wellheads',
    ],
    oemKeywords: ['NOV ML-15 15K', 'Cameron Type SS-15 15K', 'FMC SDX 15K', 'Stream-Flo SD 15K'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-WH-CH-API-3K-STREAMFLO',
    title: 'Casing Head, API 6BX 3K (Multi-Bowl), Standard Service',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    componentType: 'Casing Head',
    nominalSize: '13-5/8 in × 11 in bowl',
    workingPressurePsi: 3000,
    pressureClass: '3K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 3K studded flange — 13-5/8 in, RX-65 ring groove',
    bottomConnection: 'Surface casing thread / weld-on (e.g. 13-3/8 in BTC casing thread)',
    verticalBore: '11 in (intermediate casing)',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 1',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130)',
    oneLiner:
      'API 6BX 3K Casing Head with multi-bowl design for surface and intermediate casing strings. Stream-Flo / Cameron interchange. The first wellhead component above the conductor.',
    applications: [
      'Surface casing landing',
      'Intermediate casing landing',
      'BOP stack lower interface',
    ],
    oemKeywords: ['Stream-Flo Casing Head', 'Cameron Type WH 3K', 'FMC Casing Head'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-WH-CS-API-5K-CAMERON',
    title: 'Casing Spool, API 6BX 5K, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Casing Spool',
    nominalSize: '11 in × 7-1/16 in bore',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 5K studded flange — 7-1/16 in, BX-156 ring groove',
    bottomConnection: 'API 6BX 5K studded flange — 11 in',
    verticalBore: '7-1/16 in (production casing)',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 2',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130)',
    oneLiner:
      'API 6BX 5K Casing Spool — adapts intermediate casing (11 in flange) to production casing (7-1/16 in flange). Cameron / Stream-Flo wellhead interchange.',
    applications: [
      'Casing-to-tubing-head transitions',
      'Wellhead pressure step-up',
      'Production-casing landing',
    ],
    oemKeywords: ['Cameron Casing Spool', 'Stream-Flo CS 5K', 'FMC SDX Casing Spool'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-WH-CS-API-10K-FMC',
    title: 'Casing Spool, API 6BX 10K, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    componentType: 'Casing Spool',
    nominalSize: '11 in × 7-1/16 in bore',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 10K studded flange — 7-1/16 in, BX-158 ring groove',
    bottomConnection: 'API 6BX 5K or 10K studded flange — 11 in',
    verticalBore: '7-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140)',
    oneLiner:
      'API 6BX 10K Casing Spool — pressure step-up from 5K casing head to 10K production tree. FMC / Cameron interchange.',
    applications: [
      'High-pressure wellhead stacks',
      'Pressure-class transitions',
      'Production-tree foundation',
    ],
    oemKeywords: ['FMC Casing Spool 10K', 'Cameron Type SS-15 Spool', 'Stream-Flo CS 10K'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-WH-XT-API-5K-CAMERON',
    title: 'Christmas Tree, API 6BX 5K Conventional, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Christmas Tree',
    nominalSize: '2-9/16 in × 5K (conventional 5-valve tree)',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Standard',
    topConnection: 'Tree cap (API 6BX 5K studded — top of swab valve)',
    bottomConnection: 'API 6BX 5K studded flange (mates to tubing head adapter)',
    verticalBore: '2-9/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 2',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130)',
    oneLiner:
      'API 6BX 5K conventional Christmas tree — 2 master valves + 1 swab + 2 wing valves. Cameron / FMC / Stream-Flo wellhead interchange. The standard production-well tree.',
    applications: [
      'Onshore production wells',
      'Conventional oil and gas tree assemblies',
      'Mature-field workover replacements',
    ],
    oemKeywords: ['Cameron Type C XT 5K', 'FMC FlexMaster 5K', 'Stream-Flo XT 5K'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-WH-XT-API-10K-FMC',
    title: 'Christmas Tree, API 6BX 10K Conventional, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    componentType: 'Christmas Tree',
    nominalSize: '3-1/16 in × 10K (conventional 5-valve tree)',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    topConnection: 'Tree cap (API 6BX 10K)',
    bottomConnection: 'API 6BX 10K studded flange',
    verticalBore: '3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140)',
    oneLiner:
      'API 6BX 10K conventional Christmas tree — 2 master + 1 swab + 2 wing valves. FMC FlexMaster / Cameron interchange. The 10K production tree.',
    applications: [
      'High-pressure production wells',
      'Gas-well production trees',
      'Tight-formation oil-well trees',
    ],
    oemKeywords: ['FMC FlexMaster 10K', 'Cameron Type SS-15 XT 10K', 'Stream-Flo XT 10K'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-WH-XT-API-10K-SOUR-CAMERON',
    title: 'Christmas Tree, API 6BX 10K Conventional, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Christmas Tree',
    nominalSize: '3-1/16 in × 10K (5-valve tree, NACE)',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    topConnection: 'Tree cap (API 6BX 10K, NACE)',
    bottomConnection: 'API 6BX 10K studded flange (NACE)',
    verticalBore: '3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'EE',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130) — NACE MR0175 hardness controlled',
    oneLiner:
      'API 6BX 10K Christmas tree, sour-service (NACE MR0175) — 2 master + 1 swab + 2 wing valves. Cameron / FMC sour-service interchange. For H₂S high-pressure production.',
    applications: [
      'Sour-well production trees',
      'H₂S gas-well wellheads',
      'NACE-compliant high-pressure production',
    ],
    oemKeywords: ['Cameron Type SS-15 NACE', 'FMC FlexMaster Sour 10K', 'Stream-Flo XT Sour'],
    leadTimeDays: 112,
  },
  {
    sku: 'IH-WH-XT-FT-API-15K-FMC',
    title: 'Frac Tree, API 6BX 15K (Frac Stimulation), Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    componentType: 'Frac Tree',
    nominalSize: '7-1/16 in × 15K (frac configuration)',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 15K studded flange (mates to swab valve / kill spool)',
    bottomConnection: 'API 6BX 15K studded flange (mates to tubing head adapter)',
    verticalBore: '7-1/16 in (large bore for frac flow)',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR2',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140), high-strength heat-treated',
    oneLiner:
      'API 6BX 15K Frac Tree — temporary high-pressure tree assembly for frac stimulation. FMC / Cameron / NOV interchange. Removed after stimulation; replaced with production tree.',
    applications: [
      'Hydraulic fracturing wellhead assemblies',
      'High-pressure stimulation isolation',
      'Frac-stack with master / swab / wing arrangement',
    ],
    oemKeywords: ['FMC Frac Tree 15K', 'Cameron Type SS-15 Frac', 'NOV Frac Stack', 'Stream-Flo Frac'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-WH-THA-API-5K-10K-STREAMFLO',
    title: 'Tubing Head Adapter (5K to 10K), API 6BX, Standard Service',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    componentType: 'Tubing Head Adapter',
    nominalSize: '5K × 10K studded',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 10K studded — to mate with Christmas tree',
    bottomConnection: 'API 6BX 5K studded — to mate with tubing head',
    verticalBore: '2-9/16 in / 3-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 2',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4130)',
    oneLiner:
      'Tubing Head Adapter — bridges a 5K tubing head to a 10K Christmas tree. Stream-Flo / Cameron interchange. Avoids the cost of upgrading the tubing head.',
    applications: [
      'Pressure-class step-up between wellhead and tree',
      'Wellhead retrofits',
      'Workover-driven pressure upgrades',
    ],
    oemKeywords: ['Stream-Flo THA', 'Cameron Tubing Head Adapter', 'FMC SDX TH Adapter'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-WH-MTH-API-10K-FMC',
    title: 'Mandrel Tubing Hanger, API 6A 10K, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    componentType: 'Mandrel Tubing Hanger',
    nominalSize: '2-9/16 in × 10K (single-string)',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    topConnection: 'Tubing-hanger top — mates with tubing head adapter',
    bottomConnection: 'Tubing thread (e.g. 2-7/8 in EUE 8RD or NU)',
    verticalBore: '2-9/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140) with packoff seal pockets',
    oneLiner:
      'API 6A 10K Mandrel Tubing Hanger — supports the production tubing string within the tubing head. FMC / Cameron / Stream-Flo interchange.',
    applications: [
      'Production tubing string support',
      'Wireline-set or stab-in tubing landing',
      'Workover tubing replacement',
    ],
    oemKeywords: ['FMC Mandrel Hanger', 'Cameron Type C MTH', 'Stream-Flo MTH'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-WH-SCH-API-5K-CAMERON',
    title: 'Slip-Type Casing Hanger, API 6A 5K, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    componentType: 'Slip-Type Casing Hanger',
    nominalSize: '11 in × 7 in casing',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Standard',
    topConnection: 'Casing-hanger top — mates with casing-head bowl',
    bottomConnection: 'Casing string (slip-and-pack-off)',
    verticalBore: '7 in (production casing)',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 2',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel with hardened slip teeth',
    oneLiner:
      'API 6A 5K Slip-Type Casing Hanger — packoff slip device for landing production casing in the casing-head bowl. Cameron / Stream-Flo interchange.',
    applications: [
      'Production casing landing',
      'Field-set casing hanger installation',
      'Casing string suspension',
    ],
    oemKeywords: ['Cameron Slip Hanger', 'Stream-Flo Slip Hanger', 'FMC Casing Hanger'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-WH-WSA-API-15K-ANSON',
    title: 'Wellhead Studded Adapter, API 6BX 15K, Standard Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    componentType: 'Wellhead Studded Adapter',
    nominalSize: '7-1/16 in × 7-1/16 in (full-bore)',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    topConnection: 'API 6BX 15K studded',
    bottomConnection: 'API 6BX 15K studded',
    verticalBore: '7-1/16 in',
    temperatureClass: 'P',
    materialClass: 'AA',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    apiSpec: 'API 6A',
    bodyMaterial: 'Forged alloy steel (AISI 4140)',
    oneLiner:
      'API 6BX 15K Wellhead Studded Adapter — single-spool studded fitting bridging two flanged components without a separate flange-and-stud kit. Anson / Cameron interchange.',
    applications: [
      'Wellhead stack vertical bridges',
      'Tight-clearance frac-tree assembly',
      'Sub-assembly integration',
    ],
    oemKeywords: ['Anson Studded Adapter', 'Cameron Studded Spool', 'FMC SDX Studded'],
    leadTimeDays: 42,
  },
]

// ── Surface Test Tree products (7) ────────────────────────────────────────

const STT_PRODUCTS: SttInput[] = [
  {
    sku: 'IH-STT-FRAC-1502-15K-STD-FMC',
    title: 'Surface Test Tree, Conventional Frac 1502, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    configuration: 'Conventional Frac STT',
    nominalSize: '5-1/8 in vertical bore',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: '3,000 psi pilot (fail-safe close on hydraulic loss)',
    valveCount: '5 valves: 2 master, 1 swab, 2 wing',
    valveTypes: 'Hydraulic gate valves (master + wing); manual gate (swab)',
    endConnections:
      'Top: 1502 Female Weco Union (frac flow inlet). Bottom: API 6BX 15K studded flange (mates frac tree). Lateral: 2× 1502 Female Weco Union (wing outlets to choke manifold).',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 16C',
    oneLiner:
      'Conventional 1502 frac surface test tree, 15,000 psi standard. FMC / Halliburton interchange. The classic 5-valve frac STT — 2 master + 1 swab + 2 wing.',
    applications: [
      'Frac stimulation surface pressure control',
      'Pumping-spread well isolation',
      'Frac flowback isolation',
    ],
    oemKeywords: ['FMC Frac STT 15K', 'Halliburton SafeShield', 'Forum Energy WellSAFE', 'Cameron Frac STT'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-STT-FRAC-1502-10K-SOUR-HALLIBURTON',
    title: 'Surface Test Tree, Conventional Frac 1502, 10,000 psi, Sour Service',
    brandSlug: 'halliburton',
    countryOfOrigin: 'USA',
    configuration: 'Conventional Frac STT',
    nominalSize: '5-1/8 in vertical bore',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour (NACE MR0175)',
    hydraulicActuationPressure: '3,000 psi pilot, NACE-compliant actuators',
    valveCount: '5 valves: 2 master, 1 swab, 2 wing',
    valveTypes: 'Hydraulic NACE-compliant gate valves; manual gate (swab)',
    endConnections:
      'Top: 1502 Female Weco. Bottom: API 6BX 10K studded flange. Lateral: 2× 1502 Female Weco.',
    temperatureClass: 'P',
    materialClass: 'EE',
    apiSpec: 'API 16C',
    oneLiner:
      'Conventional 1502 frac STT, 10,000 psi sour-service. Halliburton SafeShield NACE / FMC interchange. For H₂S frac stimulation.',
    applications: [
      'Sour-well frac stimulation',
      'H₂S surface pressure control',
      'NACE-compliant pumping spreads',
    ],
    oemKeywords: ['Halliburton SafeShield NACE', 'FMC Frac STT Sour', 'Forum Energy NACE STT'],
    leadTimeDays: 112,
  },
  {
    sku: 'IH-STT-FRAC-API-10K-FLG-CAMERON',
    title: 'Surface Test Tree, Conventional Frac API 6BX 10K Flanged, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    configuration: 'Conventional Frac STT',
    nominalSize: '5-1/8 in vertical bore',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: '3,000 psi pilot',
    valveCount: '5 valves: 2 master, 1 swab, 2 wing',
    valveTypes: 'Hydraulic gate valves; manual gate (swab)',
    endConnections:
      'Top: API 6BX 10K studded. Bottom: API 6BX 10K studded. Lateral: 2× 1502 Female Weco.',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 6A',
    oneLiner:
      'Conventional API 6BX 10K flanged frac STT, standard service. Cameron / FMC interchange. Permanent flanged variant for fixed installations.',
    applications: [
      'Permanent frac STT installations',
      'Fixed wellhead pressure control',
      'Multi-stage frac campaign re-use',
    ],
    oemKeywords: ['Cameron Flanged STT 10K', 'FMC API STT', 'NOV STT 10K'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-STT-CT-1502-15K-STD-HALLIBURTON',
    title: 'Surface Test Tree, Coiled-Tubing 1502, 15,000 psi, Standard Service',
    brandSlug: 'halliburton',
    countryOfOrigin: 'USA',
    configuration: 'Coiled-Tubing STT',
    nominalSize: '5-1/8 in vertical bore with CT pack-off',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: '3,000 psi pilot for valves; 1,500 psi for stripper packer',
    valveCount: '6 valves: 2 master, 1 swab, 2 wing, 1 shear/seal BOP',
    valveTypes: 'Hydraulic gates + integral CT shear/seal BOP + stripper / pack-off',
    endConnections:
      'Top: CT entry stripper. Bottom: 1502 Female Weco. Lateral: 2× 1502 Female Weco.',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 16C',
    oneLiner:
      'Coiled-tubing surface test tree, 1502 15K standard. Halliburton / FMC interchange. Includes integrated stripper / pack-off and shear/seal BOP for live-well CT operations.',
    applications: [
      'Coiled-tubing frac stimulation',
      'CT well intervention',
      'Live-well CT logging and milling',
    ],
    oemKeywords: ['Halliburton CT STT', 'FMC CT FlexMaster', 'NOV CT Tree'],
    leadTimeDays: 112,
  },
  {
    sku: 'IH-STT-SUB-API-15K-FORUM',
    title: 'Surface Test Tree, Subsea API 6BX 15K, Standard Service',
    brandSlug: 'forum-energy',
    countryOfOrigin: 'USA',
    configuration: 'Subsea STT',
    nominalSize: '7-1/16 in vertical bore',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: 'Subsea control panel — 5,000 psi hydraulic',
    valveCount: '7 valves: 2 master, 1 swab, 2 wing, 2 retainer',
    valveTypes: 'Hydraulic subsea-rated gates with mechanical override',
    endConnections:
      'Top: API 6BX 15K studded (riser interface). Bottom: API 6BX 15K studded (wellhead). Lateral: API 6BX 10K studded (kill / choke).',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 17D',
    oneLiner:
      'Subsea surface test tree, API 17D 15K standard. Forum Energy / FMC interchange. For exploration well-testing on subsea wellheads.',
    applications: [
      'Offshore exploration well testing',
      'Subsea wellhead operations',
      'Riserless or riser-deployed well-test campaigns',
    ],
    oemKeywords: ['Forum Energy Subsea STT', 'FMC Subsea Tree', 'Cameron 17D STT'],
    leadTimeDays: 168,
  },
  {
    sku: 'IH-STT-SNUB-1502-10K-STD-FMC',
    title: 'Surface Test Tree, Snubbing 1502, 10,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    configuration: 'Snubbing STT',
    nominalSize: '5-1/8 in vertical bore with snubbing stripper',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: '3,000 psi pilot; 2,000 psi for stripper rams',
    valveCount: '6 valves: 2 master, 1 swab, 2 wing, 1 ram-type stripper',
    valveTypes: 'Hydraulic gates + dual ram-type stripper (snubbing-rated)',
    endConnections:
      'Top: Snubbing stripper. Bottom: 1502 Female Weco. Lateral: 2× 1502 Female Weco.',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 16C',
    oneLiner:
      'Snubbing surface test tree, 1502 10K standard. FMC / NOV interchange. Includes dual ram-type stripper for running tubing into a live well under pressure (snubbing).',
    applications: [
      'Snubbing operations on live wells',
      'High-pressure tubing-pull-and-run',
      'Live-well intervention',
    ],
    oemKeywords: ['FMC Snubbing STT', 'NOV Snubbing Tree', 'Halliburton Snubbing'],
    leadTimeDays: 140,
  },
  {
    sku: 'IH-STT-WHSTT-1502-15K-STD-INDUS',
    title: 'Surface Test Tree, Wellhead-Mounted 1502, 15,000 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    configuration: 'Wellhead-Mounted STT',
    nominalSize: '5-1/8 in vertical bore',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Standard',
    hydraulicActuationPressure: '3,000 psi pilot',
    valveCount: '4 valves: 1 master, 1 swab, 2 wing',
    valveTypes: 'Hydraulic gates (master + wing); manual gate (swab)',
    endConnections:
      'Top: 1502 Female Weco. Bottom: API 6BX 15K studded (permanent wellhead). Lateral: 2× 1502 Female Weco.',
    temperatureClass: 'P',
    materialClass: 'AA',
    apiSpec: 'API 16C',
    oneLiner:
      'Wellhead-mounted surface test tree, 1502 15K standard. Compact 4-valve STT integrated permanently with the production wellhead for routine testing and intervention. Indus interchange.',
    applications: [
      'Permanent production-well surface testing',
      'Wellhead-integrated intervention iron',
      'Single-well test loops',
    ],
    oemKeywords: ['Wellhead STT 15K', 'FMC Wellhead Tree', 'Cameron Mounted STT'],
    leadTimeDays: 56,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-flow-iron-wellhead-2',
    description:
      'Flow Iron & Wellhead — Batch 2: Wellhead + Surface Test Trees (22 PDPs) + 2 new spec templates + Wellhead Systems megamenu sub-section.',
  },
  brands: [],
  categories: CATEGORIES,
  specTemplates: [WELLHEAD_SPEC, SURFACE_TEST_TREE_SPEC],
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'flow-iron-wellhead',
    parentSubLabel: 'Wellhead Systems',
    createSubSectionIfMissing: true,
    newSubSectionPosition: 1,
    replacements: [
      { label: 'Wellhead', categorySlug: 'wellhead' },
      { label: 'Surface Test Trees', categorySlug: 'surface-test-trees' },
    ],
  },
  products: [
    ...WELLHEAD_PRODUCTS.map(makeWellheadProduct),
    ...STT_PRODUCTS.map(makeSttProduct),
  ],
}

export default batch
