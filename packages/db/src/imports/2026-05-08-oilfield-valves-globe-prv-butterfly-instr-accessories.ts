/**
 * Oilfield Valves — Batch 4 (FINAL: Globe + PRV + Butterfly + Instrumentation + Accessories) — 2026-05-08
 *
 * Final batch in the Oilfield Valves initiative. Lands 32 products across
 * 5 new sub-categories, completing the Oilfield Valves column.
 *
 * What's new:
 *   - 5 sub-categories: oilfield-globe-valves, oilfield-pressure-relief-valves,
 *     oilfield-butterfly-valves, oilfield-instrumentation-valves,
 *     oilfield-valve-accessories
 *   - oilfield-valve-spec template: extended valve_type with 'Accessory' option
 *     (additive — existing 16 options preserved)
 *   - Megamenu — TWO navigation operations:
 *     (a) Extend "Pressure & Flow Control" sub: Choke + Globe (new) + Pressure
 *         Relief (new) — 3 leaves total
 *     (b) Create new "General Service" sub with 3 leaves: Butterfly Valves,
 *         Instrumentation Valves, Valve Accessories
 *   - 32 products:
 *     • 5 Globe valves (ANSI 150 / 300 / 600 / 900 / 1500 RF, sizes 1"-3")
 *     • 9 Pressure Relief valves (Spring + Pilot, frac unions + ANSI flanged)
 *     • 6 Butterfly valves (Wafer + Lug + Triple-offset, sizes 2"-10")
 *     • 7 Instrumentation valves (Needle, DBB, Monoflange, Gauge, Bleed)
 *     • 5 Valve Accessories (Hydraulic actuator, gear operator, lockout,
 *       position indicator, mounting kit)
 *
 * Scope note: Big Iron Flow has only 10 products across these 5 categories at
 * source (0 globe, 3 PRV, 3 butterfly, 3 instrumentation, 1 accessory). We
 * sampled those 10 and extended with ~22 industry-standard configurations
 * matching real OEM SKUs that buyers in the GCC oilfield supply chain
 * search for. Sourcing story: closer to broker-distributor than catalogue-
 * mirroring for the expansion items — flagged in the PR body for review.
 *
 * Brand split: Cameron 11, Indus 8, FMC 5, WOM 4, Anson 2, SPM 1, Stream-Flo 1.
 * Service split: 21 sour (NACE MR0175) + 11 standard.
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-globe-prv-butterfly-instr-accessories.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-globe-prv-butterfly-instr-accessories.ts
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
    slug: 'oilfield-globe-valves',
    name: 'Globe Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Process and gas-plant globe valves — linear-motion plug-on-seat design for both throttling and isolation. ANSI raised-face flanged 150# through 1500# class. Sizes 1"-3". Carbon steel and 316SS bodies, sour and standard service.',
    position: 6,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Globe Valves — ANSI 150-1500# RF | Indus Hydraulics',
    seoDescription:
      'Process and gas-plant globe valves: ANSI 150 / 300 / 600 / 900 / 1500 RF flanged, 1"-3" sizes, carbon steel and 316SS, sour and standard service. Cameron, FMC, WOM, Indus. AED pricing, RFQ.',
  },
  {
    slug: 'oilfield-pressure-relief-valves',
    name: 'Pressure Relief Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Wellhead and frac pressure relief valves (PRV / safety relief valves) — spring-loaded conventional and pilot-operated designs. Weco unions (1502 / 602) and ANSI flanged. 5K through 15K psi class. Sour and standard service. Set pressure made-to-order.',
    position: 7,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Pressure Relief Valves — Spring & Pilot | Indus Hydraulics',
    seoDescription:
      'Wellhead and frac pressure relief / safety relief valves: spring-loaded and pilot-operated, 1502/602 Weco unions and ANSI flanged, 5K-15K psi. Set pressure made-to-order. Sour and standard. AED, RFQ.',
  },
  {
    slug: 'oilfield-butterfly-valves',
    name: 'Butterfly Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Process, utility, and tank-farm butterfly valves — wafer, lug, and triple-offset designs. Sizes 2"-10". Ductile iron, carbon steel, and stainless steel bodies; resilient (Buna-N / EPDM / PTFE) and metal seats. Lever and gear operation.',
    position: 8,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Butterfly Valves — Wafer, Lug, Triple-offset | Indus Hydraulics',
    seoDescription:
      'Wafer, lug, and triple-offset butterfly valves for process, utility, and tank-farm service. 2"-10" ductile iron, carbon steel, 316SS. Buna-N, EPDM, PTFE, and metal seats. Lever and gear operation. AED, RFQ.',
  },
  {
    slug: 'oilfield-instrumentation-valves',
    name: 'Instrumentation Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Small-bore instrumentation valves for wellhead and frac instrumentation tap-offs — needle valves, double-block-and-bleed (DBB), monoflanges, gauge valves, bleed valves. NPT and integral flanged ends, 10K-15K psi sour rated.',
    position: 9,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Instrumentation Valves — Needle, DBB, Monoflange | Indus Hydraulics',
    seoDescription:
      'Wellhead and frac instrumentation valves: needle, DBB, monoflange, gauge isolation, bleed. 1/4"-1/2" NPT and integral 10M/15M flanged. 10K-15K psi sour rated. Cameron, FMC, WOM. AED, RFQ.',
  },
  {
    slug: 'oilfield-valve-accessories',
    name: 'Valve Accessories',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Valve accessories — hydraulic actuators, gear operators, position indicators, lockout devices, mounting kits, and stem extensions. For wellhead, frac, and process valves at API 6A and ANSI flange interfaces.',
    position: 10,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Valve Accessories — Actuators, Operators, Indicators | Indus Hydraulics',
    seoDescription:
      'Hydraulic actuators, gear operators, position indicators, lockout devices, and mounting kits for wellhead and frac valves. API 6A and ANSI compatible. Cameron, FMC, WOM, Indus. AED, RFQ.',
  },
]

// ── Spec template — additive update ───────────────────────────────────────
//
// Adds 'Accessory' to valve_type options. All other fields and options
// are unchanged. Existing products keep their valve_type values intact.

const OILFIELD_VALVE_SPEC: SpecTemplatePayload = {
  slug: 'oilfield-valve-spec',
  name: 'Oilfield Valve',
  description:
    'Spec template for wellhead, frac, and process oilfield valves: ball, gate, check, plug, choke, globe, butterfly, SSV/ESD, pressure relief, instrumentation, accessories.',
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
        'Accessory',
      ],
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    // pressure_class — adds 'N/A' for valve accessories that have no pressure class
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
        'N/A',
      ],
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 3,
    },
    // api_spec — adds 'API 526' (PRV) and 'API 609' (Butterfly)
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
        'API 526',
        'API 600',
        'API 602',
        'API 608',
        'API 609',
        'ASME B16.34',
        'Other',
      ],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
  ],
}

// ── Per-product input shapes ──────────────────────────────────────────────

type ValveTypeKey =
  | 'Globe'
  | 'Pressure Relief'
  | 'Butterfly'
  | 'Instrumentation'
  | 'Accessory'

type ServiceClassKey = 'Standard' | 'Sour (NACE MR0175)'

type CommonSpecs = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  valveType: ValveTypeKey
  /** Sub-type / configuration descriptor (e.g. 'Spring-Loaded', 'Pilot-Operated', 'Wafer', 'Triple-Offset', 'Needle', 'Monoflange', 'Hydraulic Actuator'). Drives description content + appears in title. */
  subType: string
  nominalSize: string
  workingPressurePsi: number
  pressureClass: string
  endConnectionInlet: string
  endConnectionOutlet: string
  serviceClass: ServiceClassKey
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

// ── HTML description builders ─────────────────────────────────────────────

function buildGlobeHtml(g: CommonSpecs): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  return `<p>The <strong>${escape(g.title)}</strong> is a process globe valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class), ${escape(g.endConnectionInlet)}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>Linear-motion plug-on-seat design — the disc translates vertically against a circular seat. Suitable for both fully open / fully closed isolation AND throttling service (unlike ball / gate / plug valves which are isolation-only). Closure tightness is set by the seat and disc machining; throttling capability comes from the body's tortuous flow path which gives a near-linear flow coefficient curve.</p>
<h3>Construction</h3>
<ul>
<li>Type: Globe — ${escape(g.subType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim (disc + seat + stem): ${escape(g.trimMaterial)}</li>
<li>Seal / packing: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Hydrotested at 1.5× working pressure (shell test) and seat-tested per ${escape(g.apiSpec === 'Other' ? 'process valve standards' : g.apiSpec)} acceptance criteria. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant — material class ' + g.materialClassApi + '.' : 'Standard service rated.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'Manufactured to ASME B16.34 process valve standards' : g.apiSpec + ' / ASME B16.34')}</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and pressure class, (b) flange class and gasket style (ANSI raised-face = the default; ring-joint flanges available on request), (c) service class (standard vs sour), (d) operation preference (rising-stem handwheel default; gear-reduction handwheel available for sizes ≥ 4-inch), (e) for throttling service, the desired flow coefficient (Cv) — Indus can match the trim characterisation curve. Quoted ex-works OEM with full mill test reports.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure check valves and isolation valves of the same flange class. For throttling-control service, also specify the matching positioner and instrument-air panel. For sour gas processing, the EE-class chemistry trim is standard; HH-class is available for severe sour environments.</p>`
}

function buildPrvHtml(g: CommonSpecs): string {
  const isPilot = g.subType.toLowerCase().includes('pilot')
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(isPilot ? 'pilot-operated' : 'spring-loaded conventional')} pressure relief valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class), ${escape(g.endConnectionInlet)}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>${isPilot ? 'Pilot-operated relief design — a pilot valve senses line pressure and modulates the dome pressure on the main valve. Modulating action gives a tighter setpoint band (within 3-5% of set) and chatter-free operation across the full discharge range. Suitable for tight-shutoff service on gas / vapour lines and for installations where multiple relief valves operate in parallel.' : 'Spring-loaded conventional relief design — line pressure acts directly on the disc; the spring sets the opening (set) pressure. When line pressure exceeds set, the disc lifts off the seat and discharges to atmosphere or to the relief header until line pressure drops below the reseat (blowdown) pressure. Simple, robust, and field-serviceable.'}</p>
<p><strong>Set pressure is made-to-order.</strong> Specify the required set pressure on the RFQ — typical setpoints range from 50% to 100% of the body pressure rating. Indus calibrates and seals the valve at the spec'd setpoint with a witness-test certificate.</p>
<h3>Construction</h3>
<ul>
<li>Type: Pressure Relief — ${escape(g.subType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim (disc + seat + nozzle): ${escape(g.trimMaterial)}</li>
<li>Seal / soft goods: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Set pressure factory-calibrated and witness-tested per ${escape(g.apiSpec === 'Other' ? 'API 526 / ASME Section VIII Division 1 acceptance criteria' : g.apiSpec)}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant — material class ' + g.materialClassApi + '.' : 'Standard service rated.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>API 526 (steel pressure relief valves) and / or ASME Section VIII Division 1</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Calibration and witness-test certificate at specified set pressure</li>
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line operating pressure (typically 90% of set pressure), (b) required set pressure (the over-pressure protection threshold), (c) line fluid and temperature (affects orifice sizing per API 520), (d) discharge routing (atmosphere / relief header / closed flare), (e) service class (standard vs sour), (f) any required certifications (ASME UV stamp, API monogram, witness-test attendance). Indus quotes ex-works OEM with calibration and pre-shipment test certificates.</p>
<h3>Companion products</h3>
<p>Pair with a matched-rated isolation valve upstream (typically a manual gate or ball valve, locked-open) and a manual block valve on the discharge line for service / maintenance access. For relief headers handling H₂S, ensure the discharge piping is also NACE MR0175 compliant. Indus also supplies relief-system engineering services (orifice sizing per API 520, blowdown / over-pressure analysis) on request.</p>`
}

function buildButterflyHtml(g: CommonSpecs): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const subTypeNote = g.subType.toLowerCase().includes('triple-offset')
    ? 'Triple-offset design — the disc rotation axis is offset on three planes from the seat centerline, giving cam-action seating with metal-to-metal seal. Suitable for high-pressure, high-cycle, fire-safe, and severe-service applications where a resilient-seated wafer would not tolerate temperature, abrasion, or fugitive-emissions limits.'
    : g.subType.toLowerCase().includes('lug')
      ? 'Lug-style body — threaded lug holes accept stud bolts directly into the valve body, allowing dead-end service and downstream-flange removal without depressurising upstream. Slightly heavier and more expensive than wafer-style but operationally more flexible.'
      : 'Wafer-style body — fits between matching ANSI flanges with through-bolts. Lower cost and lighter than lug-style. Cannot be used in dead-end service; bolted up and downstream simultaneously.'
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.subType.toLowerCase())} butterfly valve, ${escape(g.nominalSize)}, ${escape(g.endConnectionInlet)}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>${escape(subTypeNote)}</p>
<h3>Construction</h3>
<ul>
<li>Type: Butterfly — ${escape(g.subType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Disc material: ${escape(g.trimMaterial)}</li>
<li>Seat / liner material: ${escape(g.sealMaterial)}</li>
<li>End connection: ${escape(g.endConnectionInlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class). ${escape(g.subType.toLowerCase().includes('triple-offset') ? 'Bi-directional bubble-tight shut-off; fire-safe per API 607 with optional fire-test certification.' : 'Suitable for isolation and on/off service; throttling service with the optional positioner / actuator package.')} ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 sour-service compliant.' : 'Standard service rated.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'API 609 (Butterfly Valves) / ASME B16.34' : g.apiSpec)}</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure, (b) flange class, (c) service medium (clean water / clean hydrocarbon / abrasive slurry / sour gas — drives seat material selection), (d) operating temperature range (drives elastomer / metal-seat selection), (e) operation type (lever / gear / actuated). Indus quotes ex-works OEM with applicable certifications.</p>
<h3>Companion products</h3>
<p>For dead-end / downstream-isolation service, specify lug-style. For high-pressure or fire-safe service, specify triple-offset metal-seated. Pair with matching ANSI raised-face flange gaskets and bolting per ASME B16.5. For automated service, Indus supplies pneumatic and electric actuators with the matching ISO 5211 mounting bracket on request.</p>`
}

function buildInstrHtml(g: CommonSpecs): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const isDbb = g.subType.toLowerCase().includes('dbb') || g.subType.toLowerCase().includes('double')
  const isMonoflange = g.subType.toLowerCase().includes('monoflange')
  const subTypeIntro = isMonoflange
    ? 'Monoflange design integrates the primary and secondary isolation valves with a bleed valve into a single flanged body — replaces conventional two-valve plus bleed-valve assemblies on instrumentation tap-offs. Reduces leak paths and weight by 60-70% compared to the equivalent close-coupled assembly.'
    : isDbb
      ? 'Double-Block-and-Bleed (DBB) design integrates two block valves and a bleed valve in a single body. Allows positive isolation and bleed-down of the instrumentation line without depressurising the process. Standard configuration for pressure transmitter and gauge installations on safety-critical service.'
      : g.subType.toLowerCase().includes('needle')
        ? 'Needle valve design — a tapered stem seats into a precision-machined orifice for fine throttling control or tight shut-off. Ideal for instrument isolation, sample-line control, and pressure-test connections. The slow-opening characteristic (multiple turns from closed to open) prevents pressure shock on sensitive instruments.'
        : g.subType.toLowerCase().includes('gauge')
          ? 'Gauge isolation valve — a compact valve mounted directly between the process tap and the pressure gauge, allowing gauge replacement / calibration without depressurising the line. Lockable in either open or closed state.'
          : 'Bleed valve — a small-bore valve for venting line pressure to atmosphere or to a closed bleed system. Used as the bleed leg of double-block-and-bleed configurations and for instrumentation service.'
  return `<p>The <strong>${escape(g.title)}</strong> is a small-bore instrumentation valve, ${escape(g.nominalSize)}, ${escape(g.endConnectionInlet)}, rated for ${escape(fmtPsi(g.workingPressurePsi))}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>${escape(subTypeIntro)}</p>
<h3>Construction</h3>
<ul>
<li>Type: Instrumentation — ${escape(g.subType)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Stem / trim: ${escape(g.trimMaterial)}</li>
<li>Seal / packing: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Hydrotested at 1.5× working pressure. Operating temperature -50°F to +250°F (-46°C to +121°C) per the data plate. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 sour-service compliant — material class ' + g.materialClassApi + '.' : 'Standard service rated.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'API 6A / ASME B16.34 instrumentation valve criteria' : g.apiSpec)}</li>
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and pressure class, (b) end connections (NPT / integral flanged / autoclave compression), (c) service class (standard vs sour, with H₂S partial pressure data for NACE compliance), (d) handle type (T-bar handle / handwheel / locking lever), (e) any required ATEX / IECEx certifications for hazardous-area mounting. Indus quotes ex-Dubai for stock items and ex-works OEM for build-to-order.</p>
<h3>Companion products</h3>
<p>Pair with matching ${isMonoflange ? 'flange gaskets and stud bolts per the applicable spec (API 6A 6BX or ASME B16.5)' : isDbb ? 'process-side isolation valve (typically a needle or DBB) and the downstream pressure transmitter / gauge' : 'pressure transmitters, gauges, and tubing kits for the instrumentation tap-off'}. Indus also supplies impulse-line tubing (1/2" / 1/4" / 3/8" 316SS), fittings (compression and weld), and matching mounting brackets on request.</p>`
}

function buildAccessoryHtml(g: CommonSpecs): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  return `<p>The <strong>${escape(g.title)}</strong> is a valve accessory — ${escape(g.subType.toLowerCase())}. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 compliant for sour-service installations.' : 'Standard service rated.')}</p>
<p>Designed to integrate with API 6A and ANSI flange-mounted oilfield valves. Supplied with the appropriate mounting interface and signal / control connections to match the host valve.</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.subType)}</li>
<li>Compatibility / fits: ${escape(g.nominalSize)}</li>
<li>Body / housing material: ${escape(g.bodyMaterial)}</li>
${g.trimMaterial !== 'N/A' ? `<li>Internal trim: ${escape(g.trimMaterial)}</li>` : ''}
${g.sealMaterial !== 'N/A' ? `<li>Seals / o-rings: ${escape(g.sealMaterial)}</li>` : ''}
<li>Mounting / signal interface: ${escape(g.endConnectionInlet)}</li>
${g.endConnectionOutlet !== g.endConnectionInlet ? `<li>Output / actuator interface: ${escape(g.endConnectionOutlet)}</li>` : ''}
</ul>
<h3>Specifications</h3>
<p>${g.workingPressurePsi > 0 ? 'Operating / control pressure: ' + escape(fmtPsi(g.workingPressurePsi)) + '. ' : ''}${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant materials.' : 'Standard service materials.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>How to order</h3>
<p>Confirm (a) the host valve OEM, model, and serial number for correct mounting interface, (b) any signal / control requirements (4-20 mA position feedback, limit switches, manual override), (c) service class (standard vs sour), (d) operating environment (ambient temperature, hazardous-area zone). Indus quotes ex-works OEM with the matching mounting kit and commissioning instructions.</p>
<h3>Companion products</h3>
<p>For complete actuation packages, Indus also supplies hydraulic / pneumatic control panels, control tubing kits, and instrument-air filters / regulators. For automated valve trains, ask about supervisory control integration (PLC / DCS) on the RFQ.</p>`
}

// ── FAQ generators ────────────────────────────────────────────────────────

function buildGlobeFaqs(g: CommonSpecs): FaqEntry[] {
  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. Hydrotested at 1.5× working pressure (shell test) per ASME B16.34. The ANSI flange rating is the limiting factor at the joint — match upstream and downstream flanges to the same class.`,
    },
    {
      q: 'Can this globe valve be used for throttling service?',
      a: 'Yes — globe valves are uniquely suited for throttling because the linear-motion plug-on-seat design gives a near-linear flow coefficient (Cv) curve over the stem travel range. For best throttling performance, specify the required Cv on the RFQ — Indus can match a characterised trim (linear, equal-percentage, or quick-opening). For simple isolation service, the standard plug-on-seat trim is sufficient.',
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet and outlet: ${g.endConnectionInlet}. ANSI raised-face flanged ends per ASME B16.5 — standard bolting and gasket pattern. The flange class (${g.pressureClass}) is the body's pressure rating limit.`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant. Material class ${g.materialClassApi}; body, trim, and packing meet NACE hardness limits. Provide the partial-pressure data sheet (H₂S, CO₂, chlorides) and we will confirm trim suitability.`
          : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE thresholds), specify the NACE MR0175 compliant variant on the RFQ.',
    },
    {
      q: 'What is the trim made of?',
      a: `Trim (disc + seat + stem): ${g.trimMaterial}. Stellite hardfacing on the seat and disc face is standard for erosion / corrosion resistance. Alternative trims (Inconel 718, F22 with chrome electrolyte) are available for higher-temperature or aggressive sour environments.`,
    },
    {
      q: 'How does this compare to a gate or ball valve for the same service?',
      a: 'Globe valves: best for throttling AND isolation; higher pressure drop in open position than gate/ball; suitable for control service. Gate valves: best for full-bore isolation (low pressure drop), unsuitable for throttling. Ball valves: best for quick-acting isolation; unsuitable for throttling at high pressure (chatter and erosion). Choose globe when the same valve must serve both functions or when characterised flow control is needed.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. Common ANSI 150 / 300 sizes 1"-3" are usually OEM stock or short-lead. ANSI 600+ class and sour-service variants typically build-to-order.`,
    },
    {
      q: 'What standards and certifications are supplied?',
      a: `${g.apiSpec === 'Other' ? 'ASME B16.34 process valve standard' : g.apiSpec}. Mill test reports per EN 10204 3.1 / 3.2. ${g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliance certificate.' : ''} Hydrostatic test certificate. API monogram if specified at order time.`,
    },
  ]
}

function buildPrvFaqs(g: CommonSpecs): FaqEntry[] {
  const isPilot = g.subType.toLowerCase().includes('pilot')
  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class — this is the body / end-connection rating. The set pressure (the threshold at which the valve opens) is configured separately and is typically 50-100% of the body rating.`,
    },
    {
      q: 'How is the set pressure configured?',
      a: 'Set pressure is made-to-order. Specify the required setpoint on the RFQ — Indus calibrates the spring load (for spring-loaded) or pilot setting (for pilot-operated) to the spec\'d setpoint and witness-tests at our facility before shipment. A calibration certificate accompanies the valve.',
    },
    {
      q: 'What is the difference between spring-loaded and pilot-operated PRVs?',
      a: 'Spring-loaded (conventional): line pressure acts directly on the disc, spring sets opening pressure. Simple, robust, lower cost. Trade-off: opening / reseat pressure differential ("blowdown") is wider, typically 7-10% of set. Pilot-operated: pilot valve senses line pressure and modulates main valve dome pressure. Tighter setpoint band (3-5%), chatter-free across full discharge, suitable for tight-shut-off and parallel-installation service. Higher cost and more complex.',
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') ? 'These are Weco wing-union connections — the standard for frac flow iron.' : g.endConnectionInlet.includes('Flanged') || /\d+M\b/.test(g.endConnectionInlet) ? 'These are API 6A flanged ends with ring-joint (RTJ) gasket sealing.' : 'These are ANSI raised-face flanged ends per ASME B16.5.'}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant. Material class ${g.materialClassApi}. ${isPilot ? 'Pilot tubing and fittings are also NACE-compliant.' : 'Spring material is hardness-controlled per NACE.'}`
          : 'No — this is standard-service rated. For sour wells, specify the NACE MR0175 compliant variant on the RFQ.',
    },
    {
      q: 'What standards does this PRV comply with?',
      a: `API 526 (steel pressure relief valves) and / or ASME Section VIII Division 1. Calibration and witness-test certificate at the specified set pressure. Mill test reports per EN 10204 3.1 / 3.2. ${g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliance.' : ''} ASME UV stamp on request.`,
    },
    {
      q: 'How is this PRV sized for my line?',
      a: 'Orifice sizing per API 520 / ASME Section VIII — based on (a) maximum credible over-pressure relief flow rate, (b) line fluid properties (gas / liquid / two-phase), (c) operating temperature, (d) inlet and outlet pressure conditions during relief. Send the line specifics on the RFQ and we will return both the recommended trim size and the back-up calculations.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. Set-pressure calibration adds 5-10 days to the dispatch window. Witness-testing (with customer attendance) requires schedule coordination.`,
    },
  ]
}

function buildButterflyFaqs(g: CommonSpecs): FaqEntry[] {
  const isTripleOffset = g.subType.toLowerCase().includes('triple-offset')
  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. ${isTripleOffset ? 'Triple-offset valves are rated for the full ANSI / API class on both flow directions.' : 'Resilient-seated wafer / lug butterfly valves are rated lower than equivalent-class block valves due to the elastomer seat — confirm the working pressure on the spec sheet, not the flange rating.'}`,
    },
    {
      q: 'What is the difference between Wafer, Lug, and Triple-offset designs?',
      a: 'Wafer: lightest and lowest cost, fits between flanges with through-bolts. Cannot be used in dead-end service. Lug: threaded lug holes accept stud bolts directly into the body — supports dead-end service and downstream flange removal. Slightly heavier, more expensive than wafer. Triple-offset: cam-action metal-to-metal seal, suitable for HP / fire-safe / high-cycle / abrasive service. Not interchangeable with resilient-seated variants.',
    },
    {
      q: 'What end connections does this valve use?',
      a: `End connection: ${g.endConnectionInlet}. ${g.endConnectionInlet.toLowerCase().includes('wafer') ? 'Wafer style — fits between matching ANSI raised-face flanges with through-bolts. NOT suitable for dead-end service.' : g.endConnectionInlet.toLowerCase().includes('lug') ? 'Lug style — threaded lug holes in the body accept stud bolts. Suitable for dead-end service and downstream flange removal without depressurising upstream.' : 'See the spec table for flange detail.'}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? 'Yes — body, disc, stem, and seat materials meet NACE MR0175 / ISO 15156 hardness and chemistry limits. For severely-sour service or fire-safe requirements, specify the triple-offset metal-seated variant on the RFQ.'
          : 'No — this is standard-service rated with resilient seat. For sour wells, specify either the NACE-compliant resilient-seat variant or the triple-offset metal-seated variant on the RFQ.',
    },
    {
      q: 'What is the seat / liner made of?',
      a: `Seat / liner: ${g.sealMaterial}. ${g.sealMaterial.toLowerCase().includes('buna') ? 'Buna-N (NBR) — general-purpose elastomer for water, oil, hydrocarbons. -40°F to +250°F.' : g.sealMaterial.toLowerCase().includes('ptfe') ? 'PTFE — chemically inert; suitable for chemical and corrosive service. -100°F to +400°F.' : g.sealMaterial.toLowerCase().includes('epdm') ? 'EPDM — high-temperature steam, hot-water service. -40°F to +300°F.' : g.sealMaterial.toLowerCase().includes('metal') ? 'Metal seat — fire-safe, abrasion-resistant, suitable for high-temperature / high-cycle service.' : 'See the data sheet for compatibility.'}`,
    },
    {
      q: 'What operation type is this — lever, gear, or actuated?',
      a: 'Standard supply: lever-operated for sizes ≤ 4-inch, gear-operated for 6-inch and larger (operating torque exceeds safe lever effort above 4-inch at most pressure classes). Pneumatic / electric / hydraulic actuators with ISO 5211 mounting bracket are available — specify on the RFQ.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. Common 2"-6" sizes in ductile iron / WCB body with Buna-N / EPDM seat are usually OEM stock or short-lead. Triple-offset and large-size (≥10") variants typically build-to-order.`,
    },
    {
      q: 'What standards and certifications are supplied?',
      a: `${g.apiSpec === 'Other' ? 'API 609 (Butterfly Valves) / ASME B16.34' : g.apiSpec}. Mill test reports per EN 10204 3.1 / 3.2. ${g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliance certificate.' : ''} ${isTripleOffset ? 'Optional: API 607 fire-safe test certificate.' : ''}`,
    },
  ]
}

function buildInstrFaqs(g: CommonSpecs): FaqEntry[] {
  const isDbb = g.subType.toLowerCase().includes('dbb') || g.subType.toLowerCase().includes('double')
  const isMonoflange = g.subType.toLowerCase().includes('monoflange')
  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure. Hydrotested at 1.5× working pressure (shell test). The body, stem, and end-connection ratings all match this pressure class.`,
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('NPT') ? 'NPT threaded ends — Class 3000 minimum thread engagement. Use thread sealant (PTFE tape or anaerobic) per manufacturer recommendation.' : isMonoflange ? 'Integral flanged process-side connection per API 6A 6BX or ASME B16.5; instrumentation-side is NPT.' : 'See the spec table for detail.'}`,
    },
    {
      q: 'What is the operating principle of this valve?',
      a: g.subType.toLowerCase().includes('needle')
        ? 'Multi-turn rising-stem with a tapered point seating into a precision-machined orifice. The needle and orifice combination gives fine throttling control over multiple turns, with bubble-tight shut-off when fully closed. Slow-opening characteristic prevents pressure shock on instruments.'
        : isDbb
          ? 'Two block valves in series with a bleed valve between them — opening either block valve allows flow through the device; closing both block valves and opening the bleed allows positive isolation and bleed-down of the instrumentation downstream without depressurising upstream.'
          : isMonoflange
            ? 'Integrated primary block + secondary block + bleed in a single flanged body. The flanged process-side connects directly to the line tap; the threaded instrumentation side accepts the gauge / transmitter / capillary line.'
            : g.subType.toLowerCase().includes('gauge')
              ? 'Single block valve directly mounted between process tap and pressure gauge. Allows gauge replacement / calibration without depressurising the line.'
              : 'Small-bore vent valve — opens to atmosphere or to a closed bleed system to depressurise downstream instrumentation.',
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant. ${g.bodyMaterial.includes('316') ? 'Stainless steel body and trim — well-suited for sour gas / wet H₂S service.' : 'Carbon steel body with hardness-controlled stem and trim per NACE limits.'}`
          : 'No — this is standard-service rated. For sour wells, specify the NACE MR0175 compliant variant on the RFQ.',
    },
    {
      q: 'What temperature range is this valve rated for?',
      a: 'Standard rating -50°F to +250°F (-46°C to +121°C). Wider temperature ranges available with optional packing materials (PEEK or graphite for higher-temperature service; PTFE for cryogenic service). Specify on the RFQ if the operating temperature exceeds the standard range.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. Common needle and DBB configurations are usually OEM stock or short-lead. Monoflanges and custom-tap configurations typically build-to-order.`,
    },
    {
      q: 'What handle / operation type is supplied?',
      a: g.subType.toLowerCase().includes('needle')
        ? 'Rising-stem T-bar handle (standard) or knurled-knob handle (compact / panel-mounted). Lockable handle option available for LOTO compliance.'
        : isDbb || isMonoflange
          ? 'Multi-handle (one per block valve plus one for the bleed). Each handle is independent; tag-and-lock per LOTO procedure.'
          : 'Standard handle for the device type.',
    },
    {
      q: 'What standards and certifications are supplied?',
      a: `${g.apiSpec === 'Other' ? 'API 6A / ASME B16.34 instrumentation valve standards' : g.apiSpec}. Mill test reports per EN 10204 3.1 / 3.2. Hydrostatic test certificate. ${g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliance.' : ''}`,
    },
  ]
}

function buildAccessoryFaqs(g: CommonSpecs): FaqEntry[] {
  return [
    {
      q: 'What does this accessory do?',
      a: g.subType.toLowerCase().includes('actuator')
        ? 'Hydraulic actuator drives a quarter-turn or linear-motion valve from a remote control panel — typical input is hydraulic control pressure (1.5-2× the line pressure for FC / FLS service). Double-acting design gives both open and close power; spring-return option available for fail-safe service.'
        : g.subType.toLowerCase().includes('gear')
          ? 'Gear operator reduces the operator torque required to operate large or high-pressure quarter-turn / multi-turn valves. Typical gear ratios are 4:1 to 16:1 — enough to bring the operating effort down to safe handwheel torque even on 4-inch+ valves at 10K+ pressure.'
          : g.subType.toLowerCase().includes('position') || g.subType.toLowerCase().includes('indicator')
            ? 'Position indicator gives a visual confirmation of valve open / closed state. Optional limit-switch package adds 4-20 mA / digital signal output to the remote control panel for SCADA integration.'
            : g.subType.toLowerCase().includes('lock')
              ? 'Lockout / tagout (LOTO) device prevents unauthorised operation of the valve during maintenance or shutdown. Padlockable in either fully-open or fully-closed state per OSHA 1910.147 / equivalent.'
              : 'Mounting kit provides the bracket, fasteners, and adapters required to attach the host accessory (actuator / operator / indicator) to the valve.',
    },
    {
      q: 'What valves does this fit?',
      a: `Compatibility: ${g.nominalSize}. The host valve OEM and model determine the exact mounting interface. Specify the host valve OEM, model, and serial number on the RFQ — Indus confirms the correct mounting kit and provides any required adapter sleeves.`,
    },
    {
      q: 'Is this accessory NACE-compliant for sour service?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? 'Yes — body materials, fasteners, and any wetted parts meet NACE MR0175 / ISO 15156 hardness and chemistry limits. For full system NACE compliance, also confirm the host valve trim and any wetted control components.'
          : 'No — this is standard service. For sour-service installations, specify the NACE MR0175 compliant variant on the RFQ.',
    },
    {
      q: 'What signal / control connections are required?',
      a: g.subType.toLowerCase().includes('actuator')
        ? 'Hydraulic supply line (typically 1/4" or 3/8" tube fitting per OEM spec). Optional: 4-20 mA position feedback signal, dome pressure transmitter, manual override on the bonnet. Specify the control panel manufacturer / model for matched fittings.'
        : g.subType.toLowerCase().includes('position') || g.subType.toLowerCase().includes('indicator')
          ? 'Limit-switch package (if specified): SPDT or DPDT switches with 24 VDC / 120 VAC contact rating. Optional 4-20 mA loop-powered transmitter for analog position feedback. Specify SCADA panel requirements on the RFQ.'
          : 'See OEM data sheet for control / signal interfaces. For manual operators (gear, lever) no electrical connections are required.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. Common configurations stocked at the OEM for quick dispatch. Custom mounting brackets and long-stem extensions typically add 14-21 days.`,
    },
    {
      q: 'Are commissioning instructions provided?',
      a: 'Yes — every accessory ships with the OEM commissioning instructions, mounting drawings, and (where applicable) wiring diagrams. Indus also provides on-site commissioning support in the GCC region on request.',
    },
    {
      q: 'What environmental / hazardous-area certifications are available?',
      a: 'IP66 / NEMA 4X enclosure for outdoor service (standard). ATEX / IECEx Zone 1 / Zone 2 certified housings available on request for hazardous-area installations. Specify the area classification (Zone, Group, Temperature class) on the RFQ.',
    },
    {
      q: 'Does this accessory affect the host valve\'s API monogram?',
      a: 'API 6A monogram requires that any added accessory be qualified to the host valve\'s testing protocol. For monogram-critical service, specify the accessory at the time of host-valve order and Indus arranges combined-assembly testing. Field-retrofit accessories are supplied as service items and do not affect the existing monogram unless re-tested.',
    },
  ]
}

// ── Translators ───────────────────────────────────────────────────────────

function makeProduct(g: CommonSpecs): ProductImportPayload {
  let html: string
  let faqs: FaqEntry[]
  let categorySlug: string

  switch (g.valveType) {
    case 'Globe':
      html = buildGlobeHtml(g)
      faqs = buildGlobeFaqs(g)
      categorySlug = 'oilfield-globe-valves'
      break
    case 'Pressure Relief':
      html = buildPrvHtml(g)
      faqs = buildPrvFaqs(g)
      categorySlug = 'oilfield-pressure-relief-valves'
      break
    case 'Butterfly':
      html = buildButterflyHtml(g)
      faqs = buildButterflyFaqs(g)
      categorySlug = 'oilfield-butterfly-valves'
      break
    case 'Instrumentation':
      html = buildInstrHtml(g)
      faqs = buildInstrFaqs(g)
      categorySlug = 'oilfield-instrumentation-valves'
      break
    case 'Accessory':
      html = buildAccessoryHtml(g)
      faqs = buildAccessoryFaqs(g)
      categorySlug = 'oilfield-valve-accessories'
      break
  }

  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug,
    specTemplateSlug: 'oilfield-valve-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: html,
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
    faqs,
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword:
      g.valveType === 'Accessory'
        ? `${g.subType.toLowerCase()} oilfield valve accessory`.slice(0, 120)
        : `${g.subType.toLowerCase()} ${g.valveType.toLowerCase()} valve ${g.workingPressurePsi >= 10000 ? Math.round(g.workingPressurePsi / 1000) + 'k psi' : g.workingPressurePsi + ' psi'}${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

// ── Common spec value constants ───────────────────────────────────────────

const FORGED_4130_NACE = 'Forged AISI 4130 — NACE MR0175 compliant'
const FORGED_4130_STD = 'Forged AISI 4130'
const CAST_WCB_NACE = 'Cast WCB carbon steel — NACE MR0175 compliant'
const CAST_WCB = 'Cast WCB carbon steel'
const CAST_DUCTILE_IRON = 'Cast ductile iron (ASTM A536)'
const SS_316 = '316 stainless steel'
const SS_316_NACE = '316 stainless steel — NACE MR0175 compliant'
const TRIM_GLOBE_STD = '13Cr trim with Stellite hardfacing on disc and seat'
const TRIM_GLOBE_NACE = '410SS trim with Stellite 6 hardfacing — NACE compliant'
const TRIM_PRV_STD = '316SS disc + nozzle, hardness-controlled spring'
const TRIM_PRV_NACE = '316SS disc + nozzle, NACE-compliant Inconel X-750 spring'
const TRIM_BFLY_DI = 'Ductile iron disc'
const TRIM_BFLY_CS = 'Carbon steel disc'
const TRIM_BFLY_TRIPLE = 'F6NM disc + Inconel 625 metal seat'
const TRIM_INSTR = '316SS stem + 17-4PH spindle'
const TRIM_INSTR_CS = '17-4PH stem + AISI 4130 spindle (carbon steel body)'
const SEAL_PEEK_HNBR = 'PEEK back-up + HNBR primary seals'
const SEAL_RPTFE_FKM = 'RPTFE back-up + Viton (FKM) primary seals'
const SEAL_GRAPHITE = 'Graphite + Inconel braided packing (sour)'
const SEAL_BUNA = 'Buna-N (NBR) seat'
const SEAL_PTFE = 'PTFE seat'
const SEAL_EPDM = 'EPDM seat'
const SEAL_METAL = 'Inconel 625 metal seat'

// ── Product data — 5 Globe valves ─────────────────────────────────────────

const GLOBE_VALVES: CommonSpecs[] = [
  {
    sku: 'IH-OFV-GLOBE-2-150RF-285-STD-INDUS',
    title: 'Globe Valve, 2 in × 150# RF, 285 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Globe',
    subType: 'Standard ANSI 150',
    nominalSize: '2 in',
    workingPressurePsi: 285,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '2 in 150# ANSI Raised-Face Flange',
    endConnectionOutlet: '2 in 150# ANSI Raised-Face Flange',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_WCB,
    trimMaterial: TRIM_GLOBE_STD,
    sealMaterial: 'PTFE + graphite packing',
    boreType: 'Standard',
    oneLiner:
      '2 in × 150# RF globe valve, 285 psi standard service. Process and utility isolation / throttling — clean hydrocarbon and water lines.',
    applications: [
      'Process plant utility isolation',
      'Low-pressure hydrocarbon throttling',
      'Cooling-water and fire-water control',
      'Tank-farm fill-line isolation',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-GLOBE-2-300RF-740-SOUR-FMC',
    title: 'Globe Valve, 2 in × 300# RF, 740 psi, Sour Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    valveType: 'Globe',
    subType: 'NACE-Compliant ANSI 300',
    nominalSize: '2 in',
    workingPressurePsi: 740,
    pressureClass: 'ANSI 300',
    endConnectionInlet: '2 in 300# ANSI Raised-Face Flange',
    endConnectionOutlet: '2 in 300# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: CAST_WCB_NACE,
    trimMaterial: TRIM_GLOBE_NACE,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '2 in × 300# RF globe valve, 740 psi sour-service per API 6D. NACE MR0175 compliant — gas-processing utility isolation.',
    applications: [
      'Sour-gas processing inlet utility',
      'Acid-gas treatment manifolds',
      'Sour-water stripper feed lines',
      'Refinery sour-service isolation',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-GLOBE-3-600RF-1480-SOUR-CAMERON',
    title: 'Globe Valve, 3 in × 600# RF, 1,480 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Globe',
    subType: 'NACE-Compliant ANSI 600',
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
    bodyMaterial: 'Cast LCB low-carbon steel — NACE MR0175 compliant',
    trimMaterial: 'F6NM trim with Stellite 6 hardfacing — NACE compliant',
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '3 in × 600# RF globe valve, 1,480 psi sour-service per API 6D. NACE MR0175 compliant — gas-processing main-line isolation and throttling.',
    applications: [
      'Gas-processing main-line throttling',
      'Sour-gas amine plant feed control',
      '600# class refinery service',
      'Sour-condensate flow control',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-GLOBE-2-900RF-2220-SOUR-WOM',
    title: 'Globe Valve, 2 in × 900# RF, 2,220 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Globe',
    subType: 'NACE-Compliant ANSI 900',
    nominalSize: '2 in',
    workingPressurePsi: 2220,
    pressureClass: 'ANSI 900',
    endConnectionInlet: '2 in 900# ANSI Raised-Face Flange',
    endConnectionOutlet: '2 in 900# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: 'F6NM trim with Inconel 625 overlay seats — NACE compliant',
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '2 in × 900# RF globe valve, 2,220 psi sour-service per API 6D. Forged 4130 body, F6NM / Inconel trim — high-pressure gas processing.',
    applications: [
      'High-pressure gas-processing throttling',
      'Sour-gas treatment HP isolation',
      '900# class wellhead-adjacent service',
      'HP sour-gas dehydration',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-GLOBE-1-1500RF-3705-SOUR-CAMERON',
    title: 'Globe Valve, 1 in × 1500# RF, 3,705 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Globe',
    subType: 'NACE-Compliant ANSI 1500',
    nominalSize: '1 in',
    workingPressurePsi: 3705,
    pressureClass: 'ANSI 1500',
    endConnectionInlet: '1 in 1500# ANSI Raised-Face Flange',
    endConnectionOutlet: '1 in 1500# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: 'F6NM trim with Inconel 625 overlay seats — NACE compliant',
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '1 in × 1500# RF globe valve, 3,705 psi sour-service per API 6D. Small-bore HP throttling — analyser and sample-line control on HPHT sour service.',
    applications: [
      'HPHT analyser tap-offs (sour)',
      'Sample-line throttling (sour)',
      '1500# class instrumentation isolation',
      'Sour-gas leak-test isolation',
    ],
    leadTimeDays: 49,
  },
]

// ── Product data — 9 Pressure Relief valves ───────────────────────────────

const PRV_VALVES: CommonSpecs[] = [
  {
    sku: 'IH-OFV-PRV-SPRING-2-1502MF-15K-STD-SPM',
    title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '2 in 1502 Female Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_PRV_STD,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Standard',
    oneLiner:
      '2 in × 1502 M×F spring-loaded pressure relief valve, 15,000 psi standard. Frac iron over-pressure protection — set pressure made-to-order.',
    applications: [
      'Frac iron pump discharge protection',
      'High-pressure flow-back manifold safety',
      'Cement-pump unit over-pressure',
      'Pressure-pumping iron PRV',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-2-1502MF-15K-SOUR-ANSON',
    title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 15,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
    nominalSize: '2 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '2 in 1502 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '2 in × 1502 M×F spring-loaded PRV, 15,000 psi sour-service. NACE MR0175 compliant — sour-well frac iron over-pressure protection.',
    applications: [
      'Sour-well frac iron protection',
      'H₂S-rated flow-back PRV',
      'Sour-gas pump discharge safety',
      'NACE-compliant pressure-pumping iron',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-3-1502MF-15K-STD-WOM',
    title: 'Pressure Relief Valve, Spring-Loaded, 3 in × 1502 M×F, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
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
    trimMaterial: TRIM_PRV_STD,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Standard',
    oneLiner:
      '3 in × 1502 M×F spring-loaded PRV, 15,000 psi standard service. Large-bore over-pressure protection for high-rate frac discharge.',
    applications: [
      'High-rate frac discharge PRV',
      '3-inch service tree protection',
      'Cement-unit pump over-pressure',
      '15K HP pumping iron safety',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-2-602MF-6K-SOUR-ANSON',
    title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 602 M×F, 6,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
    nominalSize: '2 in',
    workingPressurePsi: 6000,
    pressureClass: '5K',
    endConnectionInlet: '2 in 602 Male Weco Union',
    endConnectionOutlet: '2 in 602 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '2 in × 602 M×F spring-loaded PRV, 6,000 psi sour-service. 602 union — production-test iron over-pressure for sour wells.',
    applications: [
      'Sour-well production-test PRV',
      'Well-test surface-tree safety',
      '6K sour flow-back protection',
      'Production-iron sour PRV',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-2-1502MF-10K-SOUR-CAMERON',
    title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 10,000 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
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
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '2 in × 1502 M×F spring-loaded PRV, 10,000 psi sour-service. NACE-compliant — 10K sour-well frac iron and intervention protection.',
    applications: [
      '10K sour-well frac iron PRV',
      'Coiled-tubing intervention protection',
      'Sour-well production-test safety',
      '10K well-test PRV',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PRV-PILOT-3-300RF-740-SOUR-CAMERON',
    title: 'Pressure Relief Valve, Pilot-Operated, 3 in × 300# RF, 740 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Pressure Relief',
    subType: 'Pilot-Operated',
    nominalSize: '3 in',
    workingPressurePsi: 740,
    pressureClass: 'ANSI 300',
    endConnectionInlet: '3 in 300# ANSI Raised-Face Flange',
    endConnectionOutlet: '4 in 150# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 526',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: CAST_WCB_NACE,
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3 in × 300# RF pilot-operated PRV, 740 psi sour-service per API 526. Tight-setpoint protection for sour-gas processing systems.',
    applications: [
      'Sour-gas processing equipment protection',
      'Amine treatment plant relief',
      'Acid-gas separator over-pressure',
      'API 526 stamped relief installations',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-PRV-PILOT-3-600RF-1480-SOUR-FMC',
    title: 'Pressure Relief Valve, Pilot-Operated, 3 in × 600# RF, 1,480 psi, Sour Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    valveType: 'Pressure Relief',
    subType: 'Pilot-Operated',
    nominalSize: '3 in',
    workingPressurePsi: 1480,
    pressureClass: 'ANSI 600',
    endConnectionInlet: '3 in 600# ANSI Raised-Face Flange',
    endConnectionOutlet: '4 in 300# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 526',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: CAST_WCB_NACE,
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3 in × 600# RF pilot-operated PRV, 1,480 psi sour-service per API 526. HP gas-processing tight-setpoint relief.',
    applications: [
      'HP sour-gas processing relief',
      'Amine plant absorber over-pressure',
      'Sweetening unit safety',
      'API 526 stamped HP installations',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-318-5M-FLG-5K-SOUR-STREAMFLO',
    title: 'Pressure Relief Valve, Spring-Loaded, 3-1/8 in × 5M Flanged, 5,000 psi, Sour Service',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3 in 600# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PRV_NACE,
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      '3-1/8 in × 5M flanged spring-loaded PRV, 5,000 psi sour-service per API 6A PSL 3 / PR1. Wellhead Christmas tree relief.',
    applications: [
      '5K wellhead Christmas tree PRV',
      'Sour-gas production tree relief',
      'Workover-rig pressure-control safety',
      'Subsea-adjacent surface relief',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-PRV-SPRING-2-150RF-285-STD-INDUS',
    title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 150# RF, 285 psi, Standard Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Pressure Relief',
    subType: 'Spring-Loaded',
    nominalSize: '2 in',
    workingPressurePsi: 285,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '2 in 150# ANSI Raised-Face Flange',
    endConnectionOutlet: '3 in 150# ANSI Raised-Face Flange',
    serviceClass: 'Standard',
    apiSpec: 'ASME B16.34',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_WCB,
    trimMaterial: TRIM_PRV_STD,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Standard',
    oneLiner:
      '2 in × 150# RF spring-loaded PRV, 285 psi standard. ASME B16.34 — utility, fire-water, and low-pressure process protection.',
    applications: [
      'Utility-system over-pressure',
      'Fire-water pump discharge relief',
      'Low-pressure process protection',
      'Tank-farm over-pressure venting',
    ],
    leadTimeDays: 14,
  },
]

// ── Product data — 6 Butterfly valves ─────────────────────────────────────

const BUTTERFLY_VALVES: CommonSpecs[] = [
  {
    sku: 'IH-OFV-BFLY-WAFER-2-DI-PTFE-INDUS',
    title: 'Butterfly Valve, Wafer Style, 2 in × 150# Wafer, Ductile Iron + PTFE Seat, Lever',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Butterfly',
    subType: 'Wafer Style',
    nominalSize: '2 in',
    workingPressurePsi: 232,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '2 in 150# ANSI Wafer (between flanges)',
    endConnectionOutlet: '2 in 150# ANSI Wafer (between flanges)',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_DUCTILE_IRON,
    trimMaterial: TRIM_BFLY_DI,
    sealMaterial: SEAL_PTFE,
    boreType: 'Full Port',
    oneLiner:
      '2 in × 150# wafer butterfly valve, ductile iron body, PTFE seat, lever-operated. Chemical-resistant general-service utility.',
    applications: [
      'Chemical-feed line isolation',
      'Cooling-water cross-overs',
      'Process water utility',
      'Acid / caustic transfer (mild)',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-OFV-BFLY-WAFER-3-DI-BUNA-INDUS',
    title: 'Butterfly Valve, Wafer Style, 3 in × 150# Wafer, Ductile Iron + Buna-N Seat, Lever',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Butterfly',
    subType: 'Wafer Style',
    nominalSize: '3 in',
    workingPressurePsi: 232,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '3 in 150# ANSI Wafer (between flanges)',
    endConnectionOutlet: '3 in 150# ANSI Wafer (between flanges)',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_DUCTILE_IRON,
    trimMaterial: TRIM_BFLY_DI,
    sealMaterial: SEAL_BUNA,
    boreType: 'Full Port',
    oneLiner:
      '3 in × 150# wafer butterfly valve, ductile iron body, Buna-N seat, lever-operated. General-service hydrocarbon and water utility.',
    applications: [
      'Cooling-water headers',
      'Hydrocarbon utility transfer',
      'Tank-farm cross-over isolation',
      'Process water and sewage',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-OFV-BFLY-WAFER-4-DI-BUNA-INDUS',
    title: 'Butterfly Valve, Wafer Style, 4 in × 150# Wafer, Ductile Iron + Buna-N Seat, Lever',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Butterfly',
    subType: 'Wafer Style',
    nominalSize: '4 in',
    workingPressurePsi: 232,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '4 in 150# ANSI Wafer (between flanges)',
    endConnectionOutlet: '4 in 150# ANSI Wafer (between flanges)',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_DUCTILE_IRON,
    trimMaterial: TRIM_BFLY_DI,
    sealMaterial: SEAL_BUNA,
    boreType: 'Full Port',
    oneLiner:
      '4 in × 150# wafer butterfly valve, ductile iron body, Buna-N seat, lever-operated. Mid-bore general-service utility.',
    applications: [
      'Cooling-water main headers',
      'Tank-farm transfer mains',
      'Process water bulk lines',
      'Hydrocarbon utility (clean)',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-OFV-BFLY-LUG-10-DI-BUNA-INDUS',
    title: 'Butterfly Valve, Lug Style, 10 in × 150# Lug, Ductile Iron + Buna-N Seat, Gear-Operated',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Butterfly',
    subType: 'Lug Style',
    nominalSize: '10 in',
    workingPressurePsi: 232,
    pressureClass: 'ANSI 150',
    endConnectionInlet: '10 in 150# ANSI Lug',
    endConnectionOutlet: '10 in 150# ANSI Lug',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_DUCTILE_IRON,
    trimMaterial: TRIM_BFLY_DI,
    sealMaterial: SEAL_BUNA,
    boreType: 'Full Port',
    oneLiner:
      '10 in × 150# lug butterfly valve, ductile iron body, Buna-N seat, gear-operated. Large-bore tank-farm and bulk-flow isolation.',
    applications: [
      'Tank-farm bulk transfer mains',
      'Crude / condensate pipeline cross-overs',
      'Large-bore water mains',
      'Refinery utility headers',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-BFLY-LUG-6-CS-EPDM-CAMERON',
    title: 'Butterfly Valve, Lug Style, 6 in × 300# Lug, Carbon Steel + EPDM Seat, Gear-Operated',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Butterfly',
    subType: 'Lug Style',
    nominalSize: '6 in',
    workingPressurePsi: 740,
    pressureClass: 'ANSI 300',
    endConnectionInlet: '6 in 300# ANSI Lug',
    endConnectionOutlet: '6 in 300# ANSI Lug',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: CAST_WCB,
    trimMaterial: TRIM_BFLY_CS,
    sealMaterial: SEAL_EPDM,
    boreType: 'Full Port',
    oneLiner:
      '6 in × 300# lug butterfly valve, carbon steel body, EPDM seat, gear-operated. Mid-pressure hot-water and steam-condensate service.',
    applications: [
      'Hot-water utility headers',
      'Steam-condensate return',
      'High-temperature process water',
      '300# class refinery utility',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-BFLY-TRIPLE-4-CS-METAL-FMC',
    title: 'Butterfly Valve, Triple-Offset, 4 in × 600# Lug, Carbon Steel + Inconel 625 Metal Seat, Gear-Operated',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    valveType: 'Butterfly',
    subType: 'Triple-Offset',
    nominalSize: '4 in',
    workingPressurePsi: 1480,
    pressureClass: 'ANSI 600',
    endConnectionInlet: '4 in 600# ANSI Lug',
    endConnectionOutlet: '4 in 600# ANSI Lug',
    serviceClass: 'Standard',
    apiSpec: 'API 609',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_BFLY_TRIPLE,
    sealMaterial: SEAL_METAL,
    boreType: 'Full Port',
    oneLiner:
      '4 in × 600# triple-offset butterfly valve, F6NM disc + Inconel 625 metal seat. Fire-safe per API 607 — HP / high-cycle / fire-rated service.',
    applications: [
      'Fire-safe HP isolation',
      'High-cycle abrasive service',
      'Refinery process plant 600# class',
      'Wellhead-adjacent fire-rated trees',
    ],
    leadTimeDays: 56,
  },
]

// ── Product data — 7 Instrumentation valves ───────────────────────────────

const INSTRUMENTATION_VALVES: CommonSpecs[] = [
  {
    sku: 'IH-OFV-INST-NEEDLE-12-NPT-10K-SOUR-CAMERON-CS',
    title: 'Needle Valve, 1/2 in NPT, 10,000 psi, Sour Service, Carbon Steel Body, -50/+250°F',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'Needle Valve',
    nominalSize: '1/2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '1/2 in NPT Female',
    endConnectionOutlet: '1/2 in NPT Female',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Carbon steel A105N — NACE MR0175 compliant',
    trimMaterial: TRIM_INSTR_CS,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '1/2 in NPT needle valve, 10,000 psi sour-service, carbon steel body. Instrumentation throttling and isolation for sour-gas service.',
    applications: [
      'Pressure-gauge isolation (sour)',
      'Pressure-transmitter tap-offs',
      'Sample-line throttling (sour)',
      'Capillary-line isolation',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-INST-NEEDLE-12-NPT-10K-SOUR-CAMERON-SS',
    title: 'Needle Valve, 1/2 in NPT, 10,000 psi, Sour Service, 316SS Body, -50/+250°F',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'Needle Valve',
    nominalSize: '1/2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '1/2 in NPT Female',
    endConnectionOutlet: '1/2 in NPT Female',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: SS_316_NACE,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '1/2 in NPT needle valve, 10,000 psi sour-service, 316SS body. Premium corrosion resistance for harsh sour-gas service.',
    applications: [
      'Sour-gas analyser tap-offs',
      'Wet H₂S service instrumentation',
      'Acid-gas sample lines',
      'Premium-grade gauge isolation',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-INST-DBB-NEEDLE-3HANDLE-CAMERON',
    title: 'Double Block and Bleed (DBB) Needle Valve, Three Handle, 1/2 in NPT, 10,000 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'DBB Needle Valve',
    nominalSize: '1/2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '1/2 in NPT Female (process)',
    endConnectionOutlet: '1/2 in NPT Female (instrument)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: SS_316_NACE,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      'Three-handle DBB needle valve, 1/2 in NPT, 10,000 psi sour-service, 316SS body. Positive isolation + bleed for instrumentation tap-offs.',
    applications: [
      'Pressure-transmitter installation',
      'Gauge / instrument calibration tap',
      'Isolation + bleed for safety-critical',
      'Sour-gas DBB instrumentation',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-INST-MONOFLANGE-12-NPT-15M-SOUR-CAMERON',
    title: 'Monoflange Valve, 3-Valve Manifold, 1/2 in NPT × 2-1/16 in 15M Flanged, 15,000 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'Monoflange',
    nominalSize: '2-1/16 in flange × 1/2 in NPT',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2-1/16 in API 6A 15M Flanged (RTJ) — process side',
    endConnectionOutlet: '1/2 in NPT Female — instrument side',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '15K psi monoflange valve, 1/2 in NPT × 2-1/16 in 15M flanged, sour-service per API 6A PSL 3 / PR1. Replaces conventional close-coupled manifold.',
    applications: [
      'HPHT pressure-transmitter installation',
      '15K wellhead instrumentation',
      'Christmas-tree gauge tap-offs',
      'Sour-gas wellhead instrument manifolds',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-INST-NEEDLE-14-NPT-15K-SOUR-FMC',
    title: 'Needle Valve, 1/4 in NPT, 15,000 psi, Sour Service, 316SS Body',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'Needle Valve',
    nominalSize: '1/4 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '1/4 in NPT Female',
    endConnectionOutlet: '1/4 in NPT Female',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: SS_316_NACE,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '1/4 in NPT needle valve, 15,000 psi sour-service, 316SS body. HP small-bore instrumentation isolation for HPHT installations.',
    applications: [
      'HPHT analyser tap-offs',
      '15K capillary-line isolation',
      'High-pressure sample throttling',
      'HPHT instrumentation isolation',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-INST-GAUGE-12-NPT-10K-CAMERON',
    title: 'Gauge Isolation Valve, Single-Block, 1/2 in NPT × 1/2 in NPT, 10,000 psi, Standard Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Instrumentation',
    subType: 'Gauge Valve',
    nominalSize: '1/2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '1/2 in NPT Female (process)',
    endConnectionOutlet: '1/2 in NPT Female (gauge)',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: SS_316,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_RPTFE_FKM,
    boreType: 'Standard',
    oneLiner:
      '1/2 in NPT gauge isolation valve, 10,000 psi standard, 316SS body. Allows pressure-gauge replacement and calibration without depressurising the line.',
    applications: [
      'Pressure-gauge isolation',
      'Calibration tap-off isolation',
      'Maintenance bypass for instruments',
      'General-service gauge installation',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-INST-BLEED-12-NPT-10K-SOUR-INDUS',
    title: 'Bleed Valve, 1/2 in NPT, 10,000 psi, Sour Service, 316SS Body',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Instrumentation',
    subType: 'Bleed Valve',
    nominalSize: '1/2 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '1/2 in NPT Female',
    endConnectionOutlet: '1/2 in NPT Female (vent)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: SS_316_NACE,
    trimMaterial: TRIM_INSTR,
    sealMaterial: SEAL_GRAPHITE,
    boreType: 'Standard',
    oneLiner:
      '1/2 in NPT bleed valve, 10,000 psi sour-service, 316SS body. Vent / drain leg for double-block-and-bleed instrumentation manifolds.',
    applications: [
      'DBB manifold bleed leg',
      'Instrument bleed-down to atmosphere',
      'Drain valve for closed bleed systems',
      'Instrument calibration vent',
    ],
    leadTimeDays: 14,
  },
]

// ── Product data — 5 Valve Accessories ────────────────────────────────────

const VALVE_ACCESSORIES: CommonSpecs[] = [
  {
    sku: 'IH-OFV-ACC-ACTUATOR-HYDRAULIC-DA-CAMERON',
    title: 'Hydraulic Actuator, Double-Acting, with Position Indicator and Limit Switches',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Accessory',
    subType: 'Hydraulic Actuator',
    nominalSize: 'Universal — fits API 6A 5M / 10M / 15M valve interfaces',
    workingPressurePsi: 3000,
    pressureClass: 'ANSI 1500',
    endConnectionInlet: 'ISO 5211 mounting flange (size F10 / F14 / F16 selectable)',
    endConnectionOutlet: '4-20 mA position feedback + DPDT limit switches',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Carbon steel housing — IP66 / NEMA 4X',
    trimMaterial: '316SS shaft + hardened-piston cylinder',
    sealMaterial: SEAL_PEEK_HNBR,
    boreType: 'Standard',
    oneLiner:
      'Hydraulic double-acting actuator with position indicator and dual limit switches. Universal mount for API 6A 5M-15M valves. NACE-compliant.',
    applications: [
      'Wellhead Christmas-tree automation',
      'Frac iron remote operation',
      'SSV / ESD valve control packages',
      'API 6A monogram-graded actuation',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-ACC-GEAR-OPERATOR-3IN-WOM',
    title: 'Gear Operator, 3 in Valve, 8:1 Ratio Worm-Gear, Manual Handwheel',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    valveType: 'Accessory',
    subType: 'Gear Operator',
    nominalSize: 'Fits 3-inch API 6A 5M / 10M / 15M valves',
    workingPressurePsi: 0,
    pressureClass: 'N/A',
    endConnectionInlet: 'API 6A standard stem interface',
    endConnectionOutlet: 'Cast iron handwheel (12-inch diameter)',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: 'Cast steel housing',
    trimMaterial: 'Worm-gear (4140 steel) + bronze worm wheel',
    sealMaterial: 'Lithium-grease lubricated, dust-sealed',
    boreType: 'Standard',
    oneLiner:
      '8:1 worm-gear operator for 3-inch API 6A 5M / 10M / 15M valves. Reduces operator torque to safe handwheel effort on HP wellhead service.',
    applications: [
      'HP wellhead-valve manual operation',
      'Retrofit on hydraulic valves (manual override)',
      'Christmas tree side-outlet manual ops',
      'Service-iron gear-trim retrofit',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-ACC-INDICATOR-POSITION-CAMERON',
    title: 'Valve Position Indicator with 4-20 mA Loop Output and Local LED Display',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    valveType: 'Accessory',
    subType: 'Position Indicator',
    nominalSize: 'Universal — fits API 6A and ANSI flanged valves',
    workingPressurePsi: 0,
    pressureClass: 'N/A',
    endConnectionInlet: 'ISO 5211 mounting bracket',
    endConnectionOutlet: '4-20 mA loop-powered + DPDT limit switches',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: 'Aluminum housing — IP66',
    trimMaterial: '316SS shaft assembly',
    sealMaterial: 'Viton (FKM) o-rings',
    boreType: 'Standard',
    oneLiner:
      'Valve position indicator with 4-20 mA loop output, local LED display, and DPDT limit switches. Universal API 6A / ANSI fit, ATEX-ready.',
    applications: [
      'SCADA position feedback',
      'Local visual indication on remote valves',
      'Limit-switch alarm contacts',
      'API 6A automated tree integration',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-ACC-LOCK-LOTO-INDUS',
    title: 'Lockout / Tagout (LOTO) Device, Padlockable, Fits 1/2 in–4 in Quarter-Turn Valves',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    valveType: 'Accessory',
    subType: 'Lockout Device',
    nominalSize: 'Fits 1/2 in to 4 in quarter-turn valves',
    workingPressurePsi: 0,
    pressureClass: 'N/A',
    endConnectionInlet: 'Universal lever mount',
    endConnectionOutlet: 'Standard hasp for shackle padlocks',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: 'Yellow-coated zinc-plated steel',
    trimMaterial: 'N/A',
    sealMaterial: 'N/A',
    boreType: 'Standard',
    oneLiner:
      'Padlockable LOTO device for 1/2 in to 4 in quarter-turn valves. OSHA 1910.147 compliant — locks valve in fully open or fully closed state.',
    applications: [
      'Maintenance lockout (OSHA 1910.147)',
      'Shutdown isolation lockout',
      'Permit-to-work compliance',
      'Inspection / test lockout',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-OFV-ACC-MOUNTING-KIT-API6A-FMC',
    title: 'Actuator Mounting Kit for API 6A 5M / 10M / 15M Valves, ISO 5211 Adapter',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    valveType: 'Accessory',
    subType: 'Mounting Kit',
    nominalSize: 'Fits API 6A 5M / 10M / 15M valves',
    workingPressurePsi: 0,
    pressureClass: 'N/A',
    endConnectionInlet: 'API 6A standard stem interface',
    endConnectionOutlet: 'ISO 5211 F10 / F14 / F16 mounting',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Carbon steel A105N — NACE compliant',
    trimMaterial: '17-4PH stem extension',
    sealMaterial: 'Graphite + Inconel braided packing',
    boreType: 'Standard',
    oneLiner:
      'Mounting kit (bracket + stem extension + fasteners) for fitting ISO 5211 actuators to API 6A 5M / 10M / 15M valves. NACE-compliant.',
    applications: [
      'Actuator retrofit on existing API 6A trees',
      'New-build automated wellhead packages',
      'SSV / ESD actuation integration',
      'Christmas tree automation upgrades',
    ],
    leadTimeDays: 21,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  ...GLOBE_VALVES,
  ...PRV_VALVES,
  ...BUTTERFLY_VALVES,
  ...INSTRUMENTATION_VALVES,
  ...VALVE_ACCESSORIES,
]

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-oilfield-valves-globe-prv-butterfly-instr-accessories',
    description:
      'Oilfield Valves Batch 4 (FINAL) — completes the Oilfield Valves column with 32 products across 5 sub-categories: Globe (5), Pressure Relief (9), Butterfly (6), Instrumentation (7), Valve Accessories (5). Adds new "General Service" megamenu sub-section, extends "Pressure & Flow Control" with Globe + PRV leaves. Spec template valve_type extended with "Accessory" option.',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [OILFIELD_VALVE_SPEC],

  // Megamenu — TWO operations (using array-based navigation from Batch 3 framework):
  //   (a) Extend "Pressure & Flow Control" sub: Choke (preserved) + Globe + Pressure Relief
  //   (b) Create new "General Service" sub: Butterfly + Instrumentation + Valve Accessories
  navigation: [
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'oilfield-valves',
      parentSubLabel: 'Pressure & Flow Control',
      replacements: [
        { label: 'Choke Valves', categorySlug: 'oilfield-choke-valves' },
        { label: 'Globe Valves', categorySlug: 'oilfield-globe-valves' },
        { label: 'Pressure Relief Valves', categorySlug: 'oilfield-pressure-relief-valves' },
      ],
    },
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'oilfield-valves',
      parentSubLabel: 'General Service',
      createSubSectionIfMissing: true,
      replacements: [
        { label: 'Butterfly Valves', categorySlug: 'oilfield-butterfly-valves' },
        { label: 'Instrumentation Valves', categorySlug: 'oilfield-instrumentation-valves' },
        { label: 'Valve Accessories', categorySlug: 'oilfield-valve-accessories' },
      ],
    },
  ],

  products: PRODUCTS.map(makeProduct),
}

export default batch
