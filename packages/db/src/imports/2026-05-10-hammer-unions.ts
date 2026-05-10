/**
 * Hammer Unions — Indus-branded coverage of the full ABCO-style figure range
 * 2026-05-10
 *
 * Adds 15 Indus-branded hammer-union PDPs to flow-iron-fittings, completing
 * Indus catalogue coverage of the canonical 19 hammer-union figure series
 * (40, 50, 100, 200, 201, 206, 207, 211, 300, 301, 400, 600, 602, 1002, 1003,
 * 1004, 1502, 2202, AG). Four figures (100/200/400/1002) already have an
 * Indus + NPT + Standard variant from PR #108 (flow-iron-wellhead-0); this
 * batch fills the remaining 15.
 *
 * Reuses the existing `flow-iron-spec` template (no new template) and the
 * existing `flow-iron-fittings` category (no new category, no megamenu
 * change — the products surface under Flow Iron & Wellhead → Flow Iron →
 * Fittings as soon as they're created).
 *
 * Two additive patches to flow-iron-spec:
 *   - figure_class: extend options to include the 12 ABCO figures missing
 *     from the original list (40, 50, 201, 207, 211, 300, 301, 600, 1003,
 *     1004, 2202, AG). All existing options retained.
 *   - pressure_class: add 'N/A' to options for sub-1K figures (40 / 50).
 *     All existing options retained.
 *
 * Both patches are additive and idempotent — re-running this file leaves the
 * 92 existing IH-FI-* products untouched.
 *
 * Pricing: RFQ-only (listPrice = null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-hammer-unions.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-hammer-unions.ts
 */
import type {
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

// ── Spec-template patch ───────────────────────────────────────────────────
//
// Two field updates to flow-iron-spec, additive only. The library's spec-
// template upsert leaves any field NOT listed here untouched, so the other
// 14 fields on flow-iron-spec stay as they are.

const FLOW_IRON_SPEC_PATCH: SpecTemplatePayload = {
  slug: 'flow-iron-spec',
  name: 'Flow Iron',
  description:
    'Spec template for frac flow iron, hammer unions, integral fittings, adapters, API flanges, swivel joints, pup joints, manifolds, and pressure-pumping iron. Covers WECO, Chiksan, and API 6A / 16C connection families across 1K to 20K psi.',
  position: 20,
  fields: [
    {
      key: 'figure_class',
      label: 'Figure / Pressure Series',
      dataType: 'select',
      options: [
        // Low-pressure general-service hammer-union figures (added 2026-05-10)
        '40',
        '50',
        // WECO frac-iron series
        '100',
        '200',
        '201',
        '206',
        '207',
        '211',
        '300',
        '301',
        '400',
        '600',
        '602',
        '1002',
        '1003',
        '1004',
        '1502',
        '2002',
        '2202',
        'AG',
        // API 6A pressure classes
        '2K',
        '3K',
        '5K',
        '10K',
        '15K',
        '20K',
        // ANSI flange classes
        'ANSI 150',
        'ANSI 300',
        'ANSI 600',
        'ANSI 900',
        'ANSI 1500',
        'ANSI 2500',
        'N/A',
      ],
      helpText:
        'WECO frac-iron series number (40/50/100/200/201/206/207/211/300/301/400/600/602/1002/1003/1004/1502/2002/2202/AG) for hammer-union products, or API 6A pressure class (5K/10K/15K/20K) for flanged products.',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'pressure_class',
      label: 'Pressure Class',
      dataType: 'select',
      options: [
        '1K',
        '2K',
        '3K',
        '4K',
        '5K',
        '6K',
        '10K',
        '15K',
        '20K',
        'ANSI 150',
        'ANSI 300',
        'ANSI 600',
        'ANSI 900',
        'ANSI 1500',
        'ANSI 2500',
        'N/A',
      ],
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 3,
    },
  ],
}

// ── Per-product input shape ───────────────────────────────────────────────

type HammerUnionInput = {
  sku: string
  title: string
  figure: string
  workingPressurePsi: number
  pressureClass: string
  service: 'Standard' | 'Sour (NACE MR0175)'
  endStyle: 'NPT' | 'Butt-Weld' | 'Butt-Weld (Sched XXH)' | 'Mixed'
  endConnectionA: string
  endConnectionB: string
  endConnectionExtra: string
  availableSizes: string
  applicationsBlurb: string
  designNote: string
  oneLiner: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
}

const STD_TEMP = '-20°F to 250°F (-29°C to 121°C)'
const SOUR_TEMP = '-20°F to 180°F (-29°C to 82°C)'
const STD_MAT = 'Forged carbon / alloy steel — ASTM A105 below 6,000 psi, AISI 4130 at 6,000 psi and above; tempered'
const SOUR_MAT = 'Forged AISI 4130 alloy steel — NACE MR0175 hardness controlled; charpy-tested at low temperature'

// ── HTML description builder ──────────────────────────────────────────────

function buildHtml(g: HammerUnionInput): string {
  const sourLine =
    g.service === 'Sour (NACE MR0175)'
      ? 'NACE MR0175 / ISO 15156 sour-service compliant — H₂S-rated body and trim with hardness controlled per the standard.'
      : 'Standard service rated for clean hydrocarbon, completion fluid, water, brine, oil, and gas streams within the working-pressure envelope.'
  const matLine =
    g.workingPressurePsi >= 6000
      ? 'Bodies are forged from AISI 4130 alloy steel and tempered to the working-pressure design.'
      : 'Bodies are forged from ASTM A105 carbon steel (AISI 4130 alloy steel available on request) and tempered to the working-pressure design.'
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a complete wing-union (hammer-union) set comprising a Male sub, a Female sub, and a hand-tightened wing nut for hammer-tightened assembly. ${escape(g.designNote)} Rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure in ${escape(g.service.toLowerCase())} service. ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Type: Hammer Union Set (Male sub + Female sub + wing nut)</li>
<li>Series: ${escape(g.figure)} (${escape(g.pressureClass)} pressure class)</li>
<li>End A: ${escape(g.endConnectionA)}</li>
<li>End B: ${escape(g.endConnectionB)}</li>
${g.endConnectionExtra ? `<li>Auxiliary: ${escape(g.endConnectionExtra)}</li>` : ''}
<li>Material: ${escape(g.service === 'Sour (NACE MR0175)' ? SOUR_MAT : STD_MAT)}</li>
<li>Temperature rating: ${escape(g.service === 'Sour (NACE MR0175)' ? SOUR_TEMP : STD_TEMP)}</li>
<li>Charpy-tested impact-energy reports available on request</li>
</ul>
<h3>Available sizes</h3>
<p>Stock or short-lead nominal sizes: <strong>${escape(g.availableSizes)}</strong>. Other sizes within the same series can be sourced build-to-order at typical 8–14 week mill lead times. Indus quotes a firm size, pressure class, end-connection style, and service-class match against your inquiry data sheet — call or RFQ with the line specification and we will return a complete matched bill of materials.</p>
<h3>Performance</h3>
<p>Cold working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class), ${escape(g.service.toLowerCase())} rated. ${escape(matLine)} Hydrostatic test at 1.5× shell pressure on every unit. Mill test reports per EN 10204 3.1 / 3.2 supplied with each shipment. Charpy V-notch impact testing available where service requires low-temperature toughness verification.</p>
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
<li>${g.workingPressurePsi >= 6000 ? 'AISI 4130 alloy steel forging (per industry frac-iron material lineage)' : 'ASTM A105 carbon steel forging — AISI 4130 alloy steel available on request'}</li>
<li>Recognised oilfield wing-union design lineage — pressure-class methodology and hydrostatic testing aligned with API 6A practice</li>
${g.service === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Hydrostatic test certificates per unit (1.5× shell pressure)</li>
<li>Charpy V-notch impact testing on request</li>
<li>Full traceability — heat number stamped on body</li>
</ul>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) exact nominal size and bore ID, (b) line working pressure and pressure class, (c) end-connection style on each port (NPT thread, butt-weld, integral / non-pressure thread sealing end), (d) service class — sour (NACE MR0175) or standard, (e) any auxiliary requirement (charpy testing report, low-temperature certification), and (f) destination port for door-to-door logistics. Indus quotes ex-Dubai with full traceability.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure crossover unions, integral crosses / tees / elbows, swivel joints, pup joints, and adapter flanges of the same WECO figure class. For the higher-pressure frac series (1502 / 2202), also specify API 6A flanges, ring-joint gaskets, and BSL stud-and-nut sets in the matched pressure class. Hammer-union gaskets (Buna-N, Viton, HSN, FFKM) are sold separately — confirm fluid chemistry to match elastomer.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: HammerUnionInput): FaqEntry[] {
  const sourFaq =
    g.service === 'Sour (NACE MR0175)'
      ? `Yes — this hammer union is fully NACE MR0175 / ISO 15156 compliant for sour-service exposure. Body and wing-nut hardness controlled to NACE limits, AISI 4130 alloy steel, low-temperature charpy-tested. Provide H₂S partial pressure, temperature, and chloride content on the RFQ and we will confirm material suitability.`
      : `No — this product is standard-service rated. For sour wells (H₂S partial pressure above NACE MR0175 thresholds), specify the sour-service variant or step up to a sour-rated figure series (e.g. ${g.figure === '1502' ? '2202 butt-weld at 15K sour' : '602 / 1002 / 1502 sour variants'}). Sour variants typically downrate the working pressure to stay within NACE hardness limits.`
  const designFaq =
    g.figure === '1003'
      ? 'The 1003 series is a misaligning hammer union — the wing-nut and seal geometry tolerate a few degrees of angular offset between the male and female subs at make-up. Use it on high-pressure lines that cannot be perfectly aligned (e.g. between fixed-position equipment), where a standard 1002 would not seal under bending stress.'
      : g.figure === '1004'
        ? 'The 1004 series is a 10K butt-weld-only hammer union manufactured to Schedule XXH wall thickness — the heavy wall lets it accept butt-weld attachment to Schedule XXH high-pressure pipe without compromising the union strength.'
        : g.figure === '2202'
          ? 'The 2202 series is the sour-service equivalent of the 1502 — same 15K cold working pressure, but the 2202 is butt-weld-only at Schedule XXH wall thickness, AISI 4130 forged, and NACE MR0175 hardness-controlled throughout. It carries no threaded variant (sour service hammer unions are always welded to avoid stress concentrators).'
          : g.figure === '300'
            ? 'The 300 series is a "flat face" union — the male and female sub mating faces are flat (rather than the standard cup-and-cone), giving an easier straight-line break-out for repair / inspection where there is no clearance to swing the wing nut. The 2-inch threaded variant is rerated to 6,000 psi cold working pressure where the 3"–4" sizes carry the standard 2K rating.'
            : g.figure === '207'
              ? 'The 207 series is purpose-built for manifold and end-of-line blanking — the cap section is tappable for a 1/2 in NPT pressure gauge or instrumentation valve, and the elastomer O-ring in the metal sub provides a leak-free face seal. For pressure-tap requirements, ask us about the matching 1/2 in NPT instrument valve assembly.'
              : g.figure === '206'
                ? 'The 206 series uses a metal-sub seal with an O-ring backing the cup-and-cone — this gives "zero clearance against extrusion" performance at sour-service operating pressures, particularly on cyclic-pressure manifolds. All sizes (2"–6") are available in sour service, and socketweld variants exist in 2", 3", 4", and 6" specifically for low-stress weld attachment.'
                : g.figure === '602'
                  ? 'The 602 series uses a lip-type elastomer seal that protects the metal-to-metal sealing face from cyclic-pressure turbulence. This makes it the workhorse for choke-manifold and mud-pumping service where flow turbulence is high. Non-pressure thread sealing ends (no thread sealant required) are available alongside standard NPT and butt-weld variants.'
                  : g.figure === '1502'
                    ? 'The 1502 series is the industry-standard 15K hammer union for choke / kill, cementing, fracturing, and pressure-testing service. Field-replaceable lip seal protects a secondary metal-to-metal seal. Available in NPT threaded, butt-weld, integral welded, and non-pressure thread sealing ends.'
                    : 'The wing-union design uses a Female sub (with the threaded wing nut) that pulls a Male sub (with the cup-and-cone or flat-face seal) into a hand-tightened assembly, then is hammered fully tight with a non-sparking sledge. Always match like-class on both sides of the joint — mixing different figure classes is prohibited even where threads appear to engage.'
  return [
    {
      q: 'What sizes are available in this hammer-union family?',
      a: `Stock or short-lead nominal sizes: ${g.availableSizes}. The product page consolidates the size family that shares the same figure series, end-connection style, pressure class, and service class — confirm the exact nominal size on the RFQ. Sizes outside the listed range can be sourced build-to-order at typical 8–14 week mill lead times.`,
    },
    {
      q: 'What is the working pressure rating?',
      a: `Cold working pressure ${fmtPsi(g.workingPressurePsi)} (${g.pressureClass} pressure class). The unit is hydrotested at 1.5× shell pressure per the applicable design standard. The working pressure is fixed by both the body design AND the seal — the wing-nut threads, body forging, and seal element together set the rating. Always match like-figure-class on both sides of the joint; mixing a 1502 with a 1002 is prohibited even where threads appear to engage.`,
    },
    {
      q: 'Is this hammer union suitable for sour service (H₂S wells)?',
      a: sourFaq,
    },
    {
      q: 'What end connections does this hammer union use?',
      a: `End A: ${g.endConnectionA}. End B: ${g.endConnectionB}.${g.endConnectionExtra ? ' Auxiliary: ' + g.endConnectionExtra + '.' : ''} The set includes the wing nut and both subs as a complete pair. Hammer-union elastomer gaskets (Buna-N, Viton, HSN, FFKM) are sold separately — specify your fluid chemistry on the RFQ and we will recommend the matched elastomer compound.`,
    },
    {
      q: 'What design features distinguish the ' + g.figure + ' series from neighbouring figures?',
      a: designFaq,
    },
    {
      q: 'What OEM brands and standards is this compatible with?',
      a: `This product is supplied as a recognised matched-pressure interchange for ${g.oemKeywords.join(', ')}. Indus is not an authorised distributor of these OEMs but every unit is engineered to be dimensionally and metallurgically interchangeable with the named OEM standard, with full mill test reports and hydrostatic certificates on file. For applications requiring an OEM-stamped unit, we can source genuine OEM product on a build-to-order basis — call us with the application detail.`,
    },
    {
      q: 'What materials are used and what certifications come with each unit?',
      a: `Material: ${g.service === 'Sour (NACE MR0175)' ? SOUR_MAT : STD_MAT}. Each unit ships with: (a) EN 10204 3.1 mill test report (3.2 on request), (b) hydrostatic test certificate at 1.5× shell pressure, (c) heat-number stamped on the body for full traceability, ${g.service === 'Sour (NACE MR0175)' ? '(d) NACE MR0175 / ISO 15156 sour-service compliance certificate, (e) charpy V-notch impact-energy report at the applicable test temperature, ' : '(d) charpy V-notch impact-energy report on request, '}and an export-ready certificate package for customs clearance.`,
    },
    {
      q: 'What is the lead time and how do I order?',
      a: `Common combinations are stocked or short-lead from our Dubai warehouse — typical lead time ${g.leadTimeDays} working days. Sour-service variants and unusual sizes ship 6–14 weeks ex-works depending on mill build slots. RFQ with: (a) exact size, (b) pressure class and service, (c) end-connection style on each port, (d) certification requirements (charpy, NACE, mill 3.2 vs 3.1), and (e) destination port. Indus quotes ex-Dubai (AED) with door-to-door logistics on request.`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: HammerUnionInput): ProductImportPayload {
  const isSour = g.service === 'Sour (NACE MR0175)'
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: 'indus',
    categorySlug: 'flow-iron-fittings',
    specTemplateSlug: 'flow-iron-spec',
    status: 'active',
    unitOfMeasure: 'set',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: 'UAE',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      flow_iron_type: 'Hammer Union',
      figure_class: g.figure,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      service_class: g.service,
      configuration: 'Complete set — Male sub + Female sub + wing nut',
      end_connection_a: g.endConnectionA,
      end_connection_b: g.endConnectionB,
      end_connection_extra: g.endConnectionExtra,
      available_sizes: g.availableSizes,
      bore_id: 'Same as nominal',
      length_in: '',
      material_construction: isSour ? SOUR_MAT : STD_MAT,
      api_spec: 'Other (frac-iron lineage)',
      material_class: isSour ? 'EE' : 'N/A',
      temperature_rating: isSour ? SOUR_TEMP : STD_TEMP,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `hammer union ${g.figure} ${g.pressureClass.toLowerCase()}${isSour ? ' sour' : ''}`.slice(0, 120),
  }
}

// ── Product data (15 products, ABCO figure series) ────────────────────────

const PRODUCTS: HammerUnionInput[] = [
  // Figure 40 — 400 psi general service, threaded only
  {
    sku: 'IH-FI-HU-40-NPT-400-STD-INDUS',
    title: 'Hammer Union Set, 40 Series, NPT × NPT, 400 psi, Standard Service',
    figure: '40',
    workingPressurePsi: 400,
    pressureClass: 'N/A',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Hand-tight wing nut included; elastomer gasket sold separately',
    availableSizes: '1 in, 1-1/2 in, 2 in, 3 in, 4 in',
    applicationsBlurb: 'Low-pressure air, water, oil, and gas service',
    designNote: 'The 40 series is the lowest cold-working-pressure hammer union in the WECO-style range — designed for general air, water, oil, and gas service in atmospheric and low-pressure manifolding.',
    oneLiner:
      '40 Series complete hammer union set, 400 psi cold working pressure, threaded NPT × NPT. The economy choice for low-pressure air, water, oil, and gas service.',
    applications: [
      'Bulk water and brine transfer at atmospheric pressure',
      'Low-pressure compressed-air manifolds',
      'Light oil and gas line couplings',
      'Yard / shop temporary line connections',
    ],
    oemKeywords: ['FMC WECO Figure 40', 'Anson 40', 'SPM 40', 'OPI 40'],
    leadTimeDays: 7,
  },

  // Figure 50 — 500 psi general service, threaded; bronze option
  {
    sku: 'IH-FI-HU-50-NPT-500-STD-INDUS',
    title: 'Hammer Union Set, 50 Series, NPT × NPT, 500 psi, Standard Service',
    figure: '50',
    workingPressurePsi: 500,
    pressureClass: 'N/A',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Bronze-bodied variants available on request for sea-water / non-sparking service',
    availableSizes: '1 in, 1-1/2 in, 2 in, 3 in, 4 in',
    applicationsBlurb: 'Low-pressure air, water, oil, and gas service',
    designNote: 'The 50 series is a 500 psi general-purpose hammer union with threaded ends. A bronze-body variant is available where the application calls for sea-water resistance, non-sparking material, or chloride-rich service.',
    oneLiner:
      '50 Series complete hammer union set, 500 psi cold working pressure, threaded NPT × NPT. Bronze-body option available for marine / non-sparking applications.',
    applications: [
      'Light air, water, oil, and gas line couplings to 500 psi',
      'Bronze variant: sea-water injection lines',
      'Non-sparking environments (refinery / petrochemical)',
      'Light pumping-spread temporary lines',
    ],
    oemKeywords: ['FMC WECO Figure 50', 'Anson 50', 'SPM 50', 'OPI 50'],
    leadTimeDays: 7,
  },

  // Figure 201 — 2K threaded & butt-weld
  {
    sku: 'IH-FI-HU-201-NPT-2K-STD-INDUS',
    title: 'Hammer Union Set, 201 Series, NPT × NPT, 2,000 psi, Standard Service',
    figure: '201',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Butt-weld variants available — confirm pipe schedule on RFQ',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '2K manifold and general-purpose union',
    designNote: 'The 201 series is a 2K cold-working-pressure manifold-and-general-service hammer union, available threaded or butt-weld. Sister design to the 200 with a slightly different sub geometry — confirm match before pairing across series.',
    oneLiner:
      '201 Series complete hammer union set, 2,000 psi cold working pressure, threaded NPT × NPT. Manifold and general-purpose service.',
    applications: [
      '2K production-line manifolds',
      'General-purpose oilfield line connections',
      'Surface pipework at moderate pressure',
      'Drilling-fluid transfer lines',
    ],
    oemKeywords: ['FMC WECO Figure 201', 'Anson 201', 'SPM 201', 'OPI 201'],
    leadTimeDays: 10,
  },

  // Figure 206 — 2K with O-ring metal-sub seal, sour-service capable
  {
    sku: 'IH-FI-HU-206-NPT-2K-STD-INDUS',
    title: 'Hammer Union Set, 206 Series with O-Ring Metal Sub, NPT × NPT, 2,000 psi, Standard Service',
    figure: '206',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub) with O-ring metal sub',
    endConnectionExtra: 'Socketweld variants in 2 / 3 / 4 / 6 in available; butt-weld available; all sizes available in sour service',
    availableSizes: '2 in, 3 in, 4 in, 6 in',
    applicationsBlurb: '2K cyclic-pressure / sour-capable manifold union',
    designNote: 'The 206 series uses an O-ring in the metal sub to back the cup-and-cone seal — providing "zero clearance against extrusion" performance, particularly on cyclic-pressure manifolds. All sizes (2"–6") are available in sour service, and socketweld variants exist in 2", 3", 4", and 6".',
    oneLiner:
      '206 Series complete hammer union set, 2,000 psi cold working pressure, threaded NPT × NPT. O-ring metal-sub seal for cyclic-pressure / sour-service manifolds; socketweld available 2"–6".',
    applications: [
      'Cyclic-pressure manifold service (2K)',
      'Sour-service manifolds (NACE MR0175 variant)',
      'Production-line couplings on H₂S-bearing wells',
      'Choke-and-kill manifolds at 2K pressure class',
    ],
    oemKeywords: ['FMC WECO Figure 206', 'Anson 206', 'SPM 206', 'OPI 206'],
    leadTimeDays: 10,
  },

  // Figure 207 — 2K with tappable cap (manifold/blanking)
  {
    sku: 'IH-FI-HU-207-NPT-2K-STD-INDUS',
    title: 'Hammer Union Set, 207 Series with Tappable End Cap, 2,000 psi, Standard Service',
    figure: '207',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub) with tappable O-ring end cap',
    endConnectionExtra: '1/2 in NPT instrument tap on cap (factory-tapped); butt-weld variants on request',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '2K manifold blanking + pressure tap',
    designNote: 'The 207 series is a manifold and blanking union — the female sub is a closed cap (with O-ring face seal) that can be factory-tapped for a 1/2 in NPT pressure gauge or instrumentation valve. Use it as the end-of-line cap on a manifold where you need pressure / temperature monitoring.',
    oneLiner:
      '207 Series complete hammer union set, 2,000 psi, with tappable O-ring end cap. For manifold blanking and end-of-line pressure / instrumentation taps.',
    applications: [
      'Manifold end-of-line blanking with pressure-gauge tap',
      'Skid-mounted manifolds with monitoring instrumentation',
      '2K test-bench fluid-pressure monitoring',
      'Production-line pressure-gauge installations',
    ],
    oemKeywords: ['FMC WECO Figure 207', 'Anson 207', 'SPM 207'],
    leadTimeDays: 10,
  },

  // Figure 211 — 2K threaded
  {
    sku: 'IH-FI-HU-211-NPT-2K-STD-INDUS',
    title: 'Hammer Union Set, 211 Series, NPT × NPT, 2,000 psi, Standard Service',
    figure: '211',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Hand-tight wing nut included; elastomer gasket sold separately',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '2K threaded service union',
    designNote: 'The 211 series is a 2K threaded-only hammer union for surface-pipework service. Sister-design to the 200 / 201 with slight wing-nut and sub-geometry variation; do not interchange across series.',
    oneLiner:
      '211 Series complete hammer union set, 2,000 psi cold working pressure, threaded NPT × NPT. 2K manifold service union.',
    applications: [
      '2K manifold and surface-pipework couplings',
      'General-purpose oilfield line connections',
      'Drilling-mud transfer lines',
      'Low-frequency-cycle production manifolds',
    ],
    oemKeywords: ['FMC WECO Figure 211', 'Anson 211', 'OPI 211'],
    leadTimeDays: 10,
  },

  // Figure 300 — 2K (6K in 2") flat-face design
  {
    sku: 'IH-FI-HU-300-NPT-2K-STD-INDUS',
    title: 'Hammer Union Set, 300 Series Flat-Face, NPT × NPT, 2,000 psi (6,000 psi in 2 in), Standard Service',
    figure: '300',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub) — flat-face seal',
    endConnectionB: 'NPT (Female sub) — flat-face seal',
    endConnectionExtra: '2 in size is rerated to 6,000 psi cold working pressure; butt-weld variants in 3 / 4 in on request',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: 'Flat-face union for tight-clearance break-out',
    designNote: 'The 300 series is a flat-face hammer union — the male and female mating faces are flat (rather than cup-and-cone), giving an easier straight-line break-out for repair / inspection where there is no clearance to swing the wing nut. Vacuum-service insulated unions are available for cryogenic and partial-vacuum applications.',
    oneLiner:
      '300 Series flat-face complete hammer union set, 2,000 psi (6,000 psi in 2 in). For tight-clearance break-out service and moderate-vacuum applications.',
    applications: [
      'Tight-clearance manifold break-out service',
      'Repair / inspection access points',
      'Moderate-vacuum service (insulated variant)',
      'Connection to fixed-position equipment',
    ],
    oemKeywords: ['FMC WECO Figure 300', 'Anson 300', 'SPM 300'],
    leadTimeDays: 10,
  },

  // Figure 301 — 3K threaded & butt-weld
  {
    sku: 'IH-FI-HU-301-NPT-3K-STD-INDUS',
    title: 'Hammer Union Set, 301 Series, NPT × NPT, 3,000 psi, Standard Service',
    figure: '301',
    workingPressurePsi: 3000,
    pressureClass: '3K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Butt-weld variants available; specify pipe schedule on RFQ',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '3K production-line union',
    designNote: 'The 301 series is a 3K cold-working-pressure hammer union, threaded or butt-weld, for production-line and intermediate-pressure manifold service.',
    oneLiner:
      '301 Series complete hammer union set, 3,000 psi cold working pressure, threaded NPT × NPT. 3K production-line and manifold service.',
    applications: [
      '3K production-line manifolds',
      'Intermediate-pressure surface pipework',
      'Drilling-fluid recirculation lines',
      'Pressure-test-bench connections',
    ],
    oemKeywords: ['FMC WECO Figure 301', 'Anson 301', 'SPM 301', 'OPI 301'],
    leadTimeDays: 10,
  },

  // Figure 600 — 6K butt-weld only
  {
    sku: 'IH-FI-HU-600-BW-6K-STD-INDUS',
    title: 'Hammer Union Set, 600 Series Butt-Weld, 6,000 psi, Standard Service',
    figure: '600',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    service: 'Standard',
    endStyle: 'Butt-Weld',
    endConnectionA: 'Butt-weld (Male sub)',
    endConnectionB: 'Butt-weld (Female sub)',
    endConnectionExtra: 'Specify pipe schedule (typically Sched 80 / XH or XXH) on the RFQ',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '6K butt-weld manifold-and-mud union',
    designNote: 'The 600 series is a 6K butt-weld-only hammer union for high-pressure manifold-and-mud-pumping service. The butt-weld attachment eliminates the thread stress concentrators of NPT for cyclic / vibration-prone service.',
    oneLiner:
      '600 Series complete hammer union set, 6,000 psi cold working pressure, butt-weld × butt-weld. 6K manifold and mud-pumping service.',
    applications: [
      '6K mud-pumping manifolds',
      'Drilling-fluid high-pressure transfer',
      'Cyclic-pressure manifold service',
      'Production-line high-pressure couplings',
    ],
    oemKeywords: ['FMC WECO Figure 600', 'Anson 600', 'SPM 600'],
    leadTimeDays: 14,
  },

  // Figure 602 — 6K threaded, butt-weld, NPST sealing ends
  {
    sku: 'IH-FI-HU-602-NPT-6K-STD-INDUS',
    title: 'Hammer Union Set, 602 Series Lip-Seal, NPT × NPT, 6,000 psi, Standard Service',
    figure: '602',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub) with lip-type elastomer seal',
    endConnectionExtra: 'Butt-weld variants available; non-pressure thread sealing ends (NPST) available — no thread sealant required',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '6K choke-manifold and mud-service union',
    designNote: 'The 602 series uses a lip-type elastomer seal that protects the metal-to-metal sealing face from cyclic-pressure turbulence — making it the workhorse for choke-manifold and mud-pumping service. Available threaded, butt-weld, and with non-pressure thread sealing ends (NPST) for no-sealant assembly.',
    oneLiner:
      '602 Series complete hammer union set, 6,000 psi cold working pressure, threaded NPT × NPT. Lip-type elastomer seal for 6K choke-manifold and mud-pumping service.',
    applications: [
      '6K choke and kill manifolds',
      'Mud-pumping high-pressure transfer',
      'Cementing-line surface manifolds',
      'High-cyclic-pressure production lines',
    ],
    oemKeywords: ['FMC WECO Figure 602', 'Anson 602', 'SPM 602', 'OPI 602'],
    leadTimeDays: 10,
  },

  // Figure 1003 — 10K misaligning butt-weld only
  {
    sku: 'IH-FI-HU-1003-BW-10K-STD-INDUS',
    title: 'Misaligning Hammer Union Set, 1003 Series Butt-Weld, 10,000 psi, Standard Service',
    figure: '1003',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    service: 'Standard',
    endStyle: 'Butt-Weld',
    endConnectionA: 'Butt-weld (Male sub) with misalignment-tolerant geometry',
    endConnectionB: 'Butt-weld (Female sub) with misalignment-tolerant geometry',
    endConnectionExtra: 'Tolerates a few degrees of angular offset at make-up — specify pipe schedule (typically XXH)',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '10K misaligning union for unaligned high-pressure lines',
    designNote: 'The 1003 series is a misaligning hammer union — the wing-nut and seal geometry tolerate a few degrees of angular offset between the male and female subs at make-up. Use it on 10K high-pressure lines that cannot be perfectly aligned (e.g. between fixed-position equipment), where a standard 1002 would not seal under bending stress. The 5-inch size is downrated to 7,500 psi (5,000 psi sour).',
    oneLiner:
      '1003 Series misaligning complete hammer union set, 10,000 psi cold working pressure, butt-weld × butt-weld. For 10K high-pressure lines with angular offset that a standard 1002 cannot tolerate.',
    applications: [
      '10K production-line connections between fixed-position equipment',
      'Frac-pumping iron with unavoidable angular offset',
      'Misaligned high-pressure manifolds',
      'Choke-and-kill iron with tight equipment spacing',
    ],
    oemKeywords: ['FMC WECO Figure 1003', 'Anson 1003', 'SPM 1003'],
    leadTimeDays: 14,
  },

  // Figure 1004 — 10K butt-weld only, Sched XXH forged steel
  {
    sku: 'IH-FI-HU-1004-BW-10K-STD-INDUS',
    title: 'Hammer Union Set, 1004 Series Butt-Weld Schedule XXH, 10,000 psi, Standard Service',
    figure: '1004',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    service: 'Standard',
    endStyle: 'Butt-Weld (Sched XXH)',
    endConnectionA: 'Butt-weld (Male sub) — Schedule XXH wall thickness',
    endConnectionB: 'Butt-weld (Female sub) — Schedule XXH wall thickness',
    endConnectionExtra: 'Forged-steel-only — no threaded variant. For attachment to Schedule XXH high-pressure pipe.',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '10K Sched XXH butt-weld union',
    designNote: 'The 1004 series is a 10K butt-weld-only hammer union manufactured to Schedule XXH wall thickness in forged AISI 4130 steel — the heavy wall lets it accept butt-weld attachment to Schedule XXH high-pressure pipe without compromising union strength. Used where a 1002 / 1003 wall thickness would mismatch the connecting pipe.',
    oneLiner:
      '1004 Series complete hammer union set, 10,000 psi cold working pressure, butt-weld × butt-weld at Schedule XXH. Forged-steel union for high-pressure pipe at heavy wall.',
    applications: [
      '10K Sched XXH high-pressure pipework',
      'Frac-pumping iron with heavy-wall pipe runs',
      'Choke-and-kill iron with Sched XXH connecting pipe',
      'Field-welded high-pressure manifolds',
    ],
    oemKeywords: ['FMC WECO Figure 1004', 'Anson 1004', 'SPM 1004'],
    leadTimeDays: 14,
  },

  // Figure 1502 — 15K threaded (FMC and Indus existing in NPT only via earlier batches; this Indus-NPT entry was missing)
  {
    sku: 'IH-FI-HU-1502-NPT-15K-STD-INDUS',
    title: 'Hammer Union Set, 1502 Series Field-Replaceable Lip-Seal, NPT × NPT, 15,000 psi, Standard Service',
    figure: '1502',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub) with field-replaceable lip seal',
    endConnectionB: 'NPT (Female sub) with field-replaceable lip seal',
    endConnectionExtra: 'Butt-weld, integral welded, and non-pressure thread sealing ends (NPST) available on request',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '15K choke-and-kill / cementing / fracturing union',
    designNote: 'The 1502 series is the industry-standard 15K hammer union for choke / kill, cementing, fracturing, and pressure-testing service. Field-replaceable lip seal protects a secondary metal-to-metal seal, so a worn elastomer can be replaced in the field without scrapping the body.',
    oneLiner:
      '1502 Series complete hammer union set, 15,000 psi cold working pressure, threaded NPT × NPT. The industry-standard 15K union for choke / kill, cementing, fracturing, and pressure-testing service.',
    applications: [
      '15K choke and kill manifolds',
      'Frac-pumping iron and fracturing-tree manifolds',
      'High-pressure cementing surface lines',
      'Pressure-testing service iron',
    ],
    oemKeywords: ['FMC WECO Figure 1502', 'Anson 1502', 'SPM 1502', 'Forum Energy 1502'],
    leadTimeDays: 10,
  },

  // Figure 2202 — 15K sour-service butt-weld only (Sched XXH)
  {
    sku: 'IH-FI-HU-2202-BW-15K-SOUR-INDUS',
    title: 'Hammer Union Set, 2202 Series Butt-Weld Schedule XXH, 15,000 psi, Sour Service (NACE MR0175)',
    figure: '2202',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    service: 'Sour (NACE MR0175)',
    endStyle: 'Butt-Weld (Sched XXH)',
    endConnectionA: 'Butt-weld (Male sub) — Schedule XXH wall, NACE MR0175 hardness controlled',
    endConnectionB: 'Butt-weld (Female sub) — Schedule XXH wall, NACE MR0175 hardness controlled',
    endConnectionExtra: 'Sour-service only — no standard-service variant. No threaded variant — sour-service hammer unions are always welded to avoid stress concentrators.',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '15K sour-service butt-weld union',
    designNote: 'The 2202 series is the sour-service equivalent of the 1502 — same 15K cold working pressure, but butt-weld-only at Schedule XXH wall thickness, AISI 4130 forged, and NACE MR0175 hardness-controlled throughout. It carries no threaded variant. Charpy V-notch impact testing at low-temperature is included with every unit.',
    oneLiner:
      '2202 Series complete hammer union set, 15,000 psi cold working pressure, butt-weld × butt-weld at Schedule XXH. Sour-service (NACE MR0175) only — the H₂S-rated equivalent of the 1502.',
    applications: [
      'Sour-well 15K choke-and-kill manifolds',
      'Sour-service fracturing iron (H₂S-bearing wells)',
      'NACE MR0175-compliant high-pressure manifolds',
      'Sour-gas surface-pipework with charpy-tested toughness',
    ],
    oemKeywords: ['FMC WECO Figure 2202', 'Anson 2202', 'SPM 2202'],
    leadTimeDays: 21,
  },

  // Figure AG — 6K threaded (specialty)
  {
    sku: 'IH-FI-HU-AG-NPT-6K-STD-INDUS',
    title: 'Hammer Union Set, AG Series, NPT × NPT, 6,000 psi, Standard Service',
    figure: 'AG',
    workingPressurePsi: 6000,
    pressureClass: '6K',
    service: 'Standard',
    endStyle: 'NPT',
    endConnectionA: 'NPT (Male sub)',
    endConnectionB: 'NPT (Female sub)',
    endConnectionExtra: 'Specialty 6K series — confirm interchange against your existing iron before mixing',
    availableSizes: '2 in, 3 in, 4 in',
    applicationsBlurb: '6K specialty production-service union',
    designNote: 'The AG series is a 6K specialty hammer union with threaded ends, standard or sour service. Used where an existing AG-iron inventory needs matched-class extension; confirm interchange against your in-service iron before mixing.',
    oneLiner:
      'AG Series complete hammer union set, 6,000 psi cold working pressure, threaded NPT × NPT. 6K specialty production-service union.',
    applications: [
      '6K production-line connections',
      'AG-series existing-inventory matched extension',
      'Specialty mud-pumping / cementing iron',
      'Surface-pipework on legacy AG installations',
    ],
    oemKeywords: ['FMC WECO Figure AG', 'Anson AG', 'OPI AG'],
    leadTimeDays: 14,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-10-hammer-unions',
    description:
      '15 Indus-branded hammer-union PDPs covering ABCO figure series 40, 50, 201, 206, 207, 211, 300, 301, 600, 602, 1003, 1004, 1502, 2202, AG. Reuses flow-iron-spec template and flow-iron-fittings category. Two additive option-list extensions to figure_class and pressure_class.',
  },

  brands: [],

  categories: [],

  specTemplates: [FLOW_IRON_SPEC_PATCH],

  // No megamenu changes — products surface under Flow Iron & Wellhead →
  // Flow Iron → Fittings via the existing flow-iron-fittings category.

  products: PRODUCTS.map(makeProduct),
}

export default batch
