/**
 * Oilfield Valves — Batch 3 (Plug Valves + Choke Valves) — 2026-05-08
 *
 * Adds 16 plug valves + 12 choke valves to the Oilfield Valves column,
 * introducing a new megamenu sub-section "Pressure & Flow Control" for
 * Choke Valves while extending the existing "Wellhead & Frac" sub with
 * a Plug Valves leaf.
 *
 * What's new:
 *   - 2 sub-categories: oilfield-plug-valves, oilfield-choke-valves
 *   - Megamenu — TWO navigation operations in one batch (uses the new
 *     array-based navigation field added to the import library):
 *       (a) "Wellhead & Frac" sub now has 5 leaves: Ball / Gate / Plug
 *           (new) / Check / SSV & ESD
 *       (b) New "Pressure & Flow Control" sub created with 1 leaf:
 *           Choke Valves
 *   - 16 plug valves: 6 Lubricated (LT) + 10 Non-lubricated (TE)
 *     including 4 reducing-bore (2"×1") and 2 wellhead-flanged
 *   - 12 choke valves: 8 Adjustable Manual (N-60, H2 trim) + 4 Positive
 *     (FC-140 fixed bean)
 *
 * No new brands. No spec template change (valve_type uses existing 'Plug'
 * and 'Choke' generic options; LT/TE/Adjustable/Positive distinction is
 * captured in product title and description text — full-text search picks
 * up "lubricated plug valve", "positive choke", etc. via descriptionLong).
 *
 * Pricing: RFQ-only (listPrice=null), AED. Status: active.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-plug-choke.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-plug-choke.ts
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
    slug: 'oilfield-plug-valves',
    name: 'Plug Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Quarter-turn plug valves for wellhead, frac, and process service. Lubricated (LT) and non-lubricated (TE) designs, including reducing-bore (2"×1") variants. Weco unions, API 6A flanged, ANSI flanged. 285 psi to 15K psi, sour and standard.',
    position: 4,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Plug Valves — Lubricated & Non-lubricated | Indus Hydraulics',
    seoDescription:
      'Lubricated (LT) and non-lubricated (TE) plug valves for wellhead, frac, and process. 1502/602/206 Weco unions, 5M-15M API 6A flanged, ANSI 300#/900# RF. Reducing-bore options. AED pricing, RFQ.',
  },
  {
    slug: 'oilfield-choke-valves',
    name: 'Choke Valves',
    parentSlug: 'oilfield-valves',
    shortDescription:
      'Wellhead and frac choke valves — adjustable manual (N-60, H2 trim) and positive (FC-140 fixed bean) designs. Pressure / flow control at production trees, well-test trains, and choke manifolds. Sour and standard service.',
    position: 5,
    isPublished: true,
    defaultSpecTemplateSlug: 'oilfield-valve-spec',
    seoTitle: 'Oilfield Choke Valves — Adjustable & Positive | Indus Hydraulics',
    seoDescription:
      'Adjustable manual chokes (N-60, H2 trim) and positive chokes (FC-140 fixed bean) for wellhead and frac service. 1502/602/206 Weco unions, 5M flanged. Sour and standard. AED pricing, RFQ.',
  },
]

// ── Per-product input shapes ──────────────────────────────────────────────

type PlugInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  /** Lubricated (LT) sealant-injected, or Non-lubricated (TE) PEEK / elastomer-lined. */
  plugType: 'Lubricated (LT)' | 'Non-lubricated (TE)'
  operation: 'Manual' | 'Gear-Operated'
  /** Captures reducing variants (2"×1", 3"×1", etc.) — passed verbatim into nominal_size. */
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
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

type ChokeInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  /** Adjustable Manual (handwheel-variable) or Positive (fixed-bean orifice). */
  chokeType: 'Adjustable Manual' | 'Positive'
  /** Trim model designation, e.g. 'N-60', 'H2', 'FC-140', 'N-60 5x7'. */
  trimModel: string
  /** Bean / orifice size descriptor, e.g. '3/4 in max', '2 in max', '3 in nominal × 2 in max'. */
  beanMax: string
  /** Auxiliary feature note, e.g. 'with autoclave tap', 'no cap'. */
  options?: string
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
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

// ── HTML description builders ─────────────────────────────────────────────

function buildPlugHtml(g: PlugInput): string {
  const sealLine =
    g.plugType === 'Lubricated (LT)'
      ? 'Lubricated taper-plug design — body sealant is injected through ports in the bonnet to seal between the tapered plug and body cavities. Periodic re-injection (typically each frac stage or test cycle) maintains the bubble-tight seal. Field-serviceable: the sealant-injection ports are accessible without removing the valve from the line.'
      : 'Non-lubricated taper-plug design — a PEEK / elastomeric liner seats against the tapered plug to deliver bubble-tight shut-off without sealant injection. No periodic maintenance required during operation. Trade-off: liner replacement at each major service interval; lower max temperature than the LT variant.'

  const operationLine =
    g.operation === 'Gear-Operated'
      ? 'Gear-operated handwheel — the gear ratio reduces operating torque on larger sizes (3-inch and up) and at higher pressure classes (15K+). Position indicator on the gear housing confirms open / closed state.'
      : 'Manual quarter-turn handle — direct lever or wrench-operated. Position is visually indicated by the handle alignment (in-line = open, perpendicular = closed). Suitable for sizes ≤ 2-inch and pressure classes up to 15K.'

  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.plugType.toLowerCase())} plug valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class), ${escape(g.endConnectionInlet)} inlet × ${escape(g.endConnectionOutlet)} outlet. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}</p>
<p>${escape(sealLine)}</p>
<h3>Construction</h3>
<ul>
<li>Type: Plug — ${escape(g.plugType)}</li>
<li>Operation: ${escape(g.operation)}</li>
<li>Nominal size: ${escape(g.nominalSize)}${g.nominalSize.includes('×') || g.nominalSize.includes('x') ? ' (reducing — different inlet vs outlet bore)' : ''}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim (plug + seats): ${escape(g.trimMaterial)}</li>
<li>Seal / liner: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. Quarter-turn open / closed operation — full open in 90° of stem rotation, with bubble-tight shut-off in both flow directions. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 sour-service compliant — material class ' + g.materialClassApi + '.' : 'Standard service rated.')} ${escape(operationLine)}</p>
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
<p>Confirm (a) line working pressure and pressure class, (b) inlet and outlet end-connection sizes / styles (specify reducing variants like 2"×1" if needed), (c) service class (standard vs sour), (d) operation preference (manual lever vs gear-operated handwheel), (e) for LT variants, sealant brand / chemistry preference. Indus quotes ex-Dubai for stock items and ex-works OEM for build-to-order, with full mill test reports and pre-shipment hydrostatic test certificates.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure ball valves, gate valves, check valves, and chokes of the same end-connection family. ${g.plugType === 'Lubricated (LT)' ? 'For LT plug valves, also stock the matching sealant grease for periodic re-injection (specify per OEM recommendation).' : 'For non-lubricated TE plug valves, also stock the matching liner / o-ring kit for service-interval replacement.'} For frac iron, the 1502/602/206 Weco union family is the matched standard.</p>`
}

function buildChokeHtml(g: ChokeInput): string {
  const operationLine =
    g.chokeType === 'Adjustable Manual'
      ? `Adjustable manual choke — handwheel rotates a threaded stem to vary the trim opening, controlling flow rate / back-pressure on the wellhead or test train. The ${escape(g.trimModel)} trim is replaceable as a service item — stem and seat can be removed without taking the body out of line. Bean / orifice maximum: ${escape(g.beanMax)}.`
      : `Positive choke — fixed bean (orifice plate) controls flow rate / back-pressure at a calibrated opening. ${escape(g.trimModel)} trim with bean maximum ${escape(g.beanMax)}. Beans are interchangeable as a service item: replace the bean to change the orifice. Used where a stable, repeatable setting is required (e.g. extended well-test or production-allocated flow).`

  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.chokeType.toLowerCase())} choke valve rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class), ${escape(g.endConnectionInlet)} inlet × ${escape(g.endConnectionOutlet)} outlet, ${escape(g.trimModel)} trim. ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 / ISO 15156 sour-service compliant.' : 'Standard service rated.')}${g.options ? ' ' + escape(g.options) + '.' : ''}</p>
<p>${operationLine}</p>
<h3>Construction</h3>
<ul>
<li>Type: Choke — ${escape(g.chokeType)}</li>
<li>Trim model: ${escape(g.trimModel)}</li>
<li>Bean / orifice: ${escape(g.beanMax)}</li>
<li>Nominal size: ${escape(g.nominalSize)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>Trim material (stem / bean / seat): ${escape(g.trimMaterial)}</li>
<li>Seal / packing: ${escape(g.sealMaterial)}</li>
<li>Inlet: ${escape(g.endConnectionInlet)}</li>
<li>Outlet: ${escape(g.endConnectionOutlet)}</li>
${g.options ? `<li>Options: ${escape(g.options)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(fmtPsi(g.workingPressurePsi))}. ${escape(g.chokeType === 'Adjustable Manual' ? 'Variable-orifice flow control by handwheel — full closed to ' + g.beanMax + ' fully open. Position indicator on the bonnet shows current opening. Tungsten-carbide trim resists erosion in sand-laden flow.' : 'Fixed-orifice flow control via interchangeable bean. Bean is hardened tungsten-carbide for sand erosion resistance.')} ${escape(g.serviceClass === 'Sour (NACE MR0175)' ? 'NACE MR0175 sour-service compliant — material class ' + g.materialClassApi + '.' : 'Standard service rated.')}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>${escape(g.apiSpec === 'Other' ? 'Manufactured to recognised oilfield flow-control design standards' : g.apiSpec + ' ' + g.pslClass + ' ' + g.prClass)}</li>
${g.materialClassApi !== 'N/A' ? `<li>Material class ${escape(g.materialClassApi)} (API 6A chemistry / sour-service grading)</li>` : ''}
${g.serviceClass === 'Sour (NACE MR0175)' ? '<li>NACE MR0175 / ISO 15156 (sour-service)</li>' : ''}
<li>Mill test reports per EN 10204 3.1 / 3.2</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) upstream and downstream pressure (the choke must handle the full ΔP across the trim), (b) inlet and outlet end-connection sizes / styles, (c) service class (standard vs sour), (d) trim model preference (${g.chokeType === 'Adjustable Manual' ? 'N-60 for compact / lower-flow service, H2 for high-flow / 3-inch lines' : 'FC-140 for 2-inch flow iron'}), (e) any auxiliary features (autoclave tap for pressure / sample, gear handwheel for high-torque). Indus quotes ex-works OEM for build-to-order, with full mill test reports and pre-shipment hydrotest certificates.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure block valves (ball, gate, plug) upstream and downstream of the choke. For frac iron, the 1502/602/206 Weco union family is the matched standard. ${g.chokeType === 'Adjustable Manual' ? 'For data-rich operations, also specify autoclave taps with matching pressure transmitters and / or sample bombs.' : 'For positive chokes, stock a range of bean sizes covering the full operating envelope (typically 1/4" through 3/4" or 2") so the operator can change settings without procurement lead.'}</p>`
}

// ── FAQ generators ────────────────────────────────────────────────────────

function buildPlugFaqs(g: PlugInput): FaqEntry[] {
  const isLubricated = g.plugType === 'Lubricated (LT)'
  const isReducing = g.nominalSize.includes('×') || g.nominalSize.includes('x')

  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. Hydrotested at 1.5× working pressure (shell test) and seat-tested per the applicable specification. The plug-to-body taper geometry is calibrated to seal under full rated pressure in either flow direction.`,
    },
    {
      q: 'What is the difference between Lubricated (LT) and Non-lubricated (TE) plug valves?',
      a: 'LT (Lubricated) valves use injected body sealant to seal between the tapered plug and body — periodic re-injection required, but very forgiving in dirty service. TE (Non-lubricated, "Twin-Elastomer") valves use a PEEK / elastomer liner around the plug — no sealant maintenance, but liner replacement at each major service interval. LT is the heritage frac-iron standard; TE is gaining ground in long-cycle wellhead service where maintenance access is limited.',
    },
    {
      q: 'What end connections does this valve use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') || g.endConnectionInlet.includes('206') ? 'These are Weco wing-union connections — the standard for frac flow iron. Always match like-class on both sides of the joint.' : g.endConnectionInlet.includes('Flanged') || /\d+M\b/.test(g.endConnectionInlet) ? 'These are API 6A flanged ends with ring-joint (RTJ) gasket sealing per API 6A 6BX hub geometry.' : g.endConnectionInlet.includes('RF') ? 'These are ANSI raised-face flanged ends per ASME B16.5 — standard bolting and gasket pattern.' : 'See the spec table for inlet / outlet detail.'}${isReducing ? ' Note: this is a REDUCING-bore valve — inlet and outlet bores are different (typically 2-inch inlet × 1-inch outlet). Pressure rating is set by the smaller bore.' : ''}`,
    },
    {
      q: 'Is this valve suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant. Material class ${g.materialClassApi}; body, plug, and ${isLubricated ? 'sealant-compatible elastomers' : 'liner / O-rings'} meet NACE hardness and chemistry limits. Provide a partial-pressure data sheet with H₂S, CO₂, and chloride values and we will confirm trim suitability.`
          : 'No — this is standard-service rated. For sour wells (H₂S partial pressure above NACE thresholds), specify the NACE MR0175 compliant variant of this size and pressure class on the RFQ.',
    },
    isLubricated
      ? {
          q: 'How often does the sealant need re-injection?',
          a: 'Per OEM recommendation — typically once per frac stage / well-test cycle for high-cycle service, or every 6-12 months for lower-cycle wellhead service. Sealant injection is via grease ports in the bonnet; specialised grease guns (high-pressure pneumatic) are required to inject against full line pressure. Indus stocks compatible OEM-grade sealant; specify line pressure and temperature for grade selection.',
        }
      : {
          q: 'How often does the liner need replacement?',
          a: 'Per OEM recommendation — typically every major service interval (12-24 months for low-cycle service, more frequently for high-cycle frac iron). The liner is a service item: removable without taking the valve out of line on most TE designs. Indus stocks the matching liner / O-ring kit; specify the valve OEM and serial number for the correct part.',
        },
    {
      q: 'What materials are used for the body, plug, and seals?',
      a: `Body: ${g.bodyMaterial}. Trim (plug + seats): ${g.trimMaterial}. Seals / ${isLubricated ? 'sealant-compatible elastomers' : 'liner'}: ${g.sealMaterial}. Alternative trims (Inconel 718, F22) and elastomers (FFKM, AFLAS) are available on request for higher-temperature or aggressive sour environments.`,
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. ${g.workingPressurePsi >= 15000 ? '15K-class plug valves are typically build-to-order — confirm OEM build slot at quote stage.' : isReducing ? 'Reducing-bore variants (2"×1") are typically OEM stock for common sizes. Confirm at quote stage.' : 'Standard sizes and pressure classes are commonly OEM stock or short-lead.'}`,
    },
    {
      q: `What is the difference between manual lever and gear-operated handwheel?`,
      a: g.operation === 'Gear-Operated'
        ? 'Gear-operated valves use a gear-reduction handwheel to lower operating torque — required on 3-inch and larger sizes at 15K+ pressure where direct lever operation would exceed safe operator effort. The gear ratio (typically 4:1 to 16:1) trades turns-to-open for reduced effort. Position indicator on the gear housing confirms open / closed.'
        : 'Manual lever / handle valves are operated by direct quarter-turn — 90° of stem rotation from open to closed. Suitable for sizes ≤ 2-inch and pressures up to 15K (above this, operator torque exceeds safe limits and gear operation is required). Position is visually indicated by the lever alignment.',
    },
  ]
}

function buildChokeFaqs(g: ChokeInput): FaqEntry[] {
  const isAdjustable = g.chokeType === 'Adjustable Manual'

  return [
    {
      q: 'What is the working pressure rating?',
      a: `${fmtPsi(g.workingPressurePsi)} working pressure, ${g.pressureClass} class. The choke body is rated at the full pressure class; the trim (stem, bean, seat) is sized to handle the rated ΔP at the bean orifice. Note: pressure drops across a choke can be severe — specify both upstream and downstream pressures on the RFQ to confirm trim suitability.`,
    },
    {
      q: 'What is the difference between Adjustable and Positive chokes?',
      a: 'Adjustable chokes use a handwheel-controlled threaded stem to vary the orifice opening — the operator can dial in any flow rate from fully closed to fully open. Position indicator on the bonnet shows current opening. Positive chokes have a fixed orifice (bean) of a calibrated size — the bean is interchangeable to change settings, but cannot be varied during operation. Adjustable for active flow control; positive for stable, repeatable flow allocation.',
    },
    {
      q: `What does the trim model "${g.trimModel}" indicate?`,
      a: `${g.trimModel} is the trim family designation — ${g.trimModel.includes('N-60') ? 'N-60 is a compact-body 2-inch trim, common for lower-flow service.' : g.trimModel.includes('H2') ? 'H2 is a high-flow trim, common for 3-inch lines and high-rate well-test service.' : g.trimModel.includes('FC-140') ? 'FC-140 is a positive-bean 2-inch trim, commonly stocked across 1502 Weco-union frac iron.' : 'Refer to the OEM data sheet for details.'} Bean / orifice maximum: ${g.beanMax}. ${g.trimModel.includes('5x7') ? 'The "5x7" suffix indicates a gear-reduction handwheel (5:7 ratio) — used for higher-torque adjustment under full line pressure.' : ''}`,
    },
    {
      q: 'What end connections does this choke use?',
      a: `Inlet: ${g.endConnectionInlet}. Outlet: ${g.endConnectionOutlet}. ${g.endConnectionInlet.includes('1502') || g.endConnectionInlet.includes('602') || g.endConnectionInlet.includes('206') ? 'These are Weco wing-union connections — the standard for frac flow iron.' : /\d+M\b/.test(g.endConnectionInlet) ? 'These are API 6A flanged ends with ring-joint (RTJ) gasket sealing.' : 'See the spec table for detail.'}`,
    },
    {
      q: 'Is this choke suitable for sour-service (H₂S) wells?',
      a:
        g.serviceClass === 'Sour (NACE MR0175)'
          ? `Yes — fully NACE MR0175 / ISO 15156 compliant. Material class ${g.materialClassApi}; body, trim, and elastomers meet NACE hardness limits. Tungsten-carbide trim resists both erosion and sour-service stress corrosion.`
          : 'No — this is standard-service rated. For sour wells, specify the NACE MR0175 compliant variant on the RFQ.',
    },
    isAdjustable
      ? {
          q: 'Can the trim be replaced in the field?',
          a: 'Yes — adjustable choke trim (stem assembly, bean, seat) is service-replaceable without taking the body out of line. Bleed line pressure, remove the bonnet, swap the trim insert, reinstall. Indus stocks complete trim refurbishment kits and individual bean / seat sizes; specify the OEM and serial number for the correct fit.',
        }
      : {
          q: 'How are positive choke beans sized and changed?',
          a: 'Beans are calibrated to a specific orifice diameter (typically 1/8" to 3/4" or 2" depending on trim family) and are interchangeable. To change the flow setting, bleed line pressure, open the body, swap the bean, reinstall. Indus stocks a range of bean sizes covering common allocations; for non-standard orifices, machined-to-spec beans are quoted on request.',
        },
    {
      q: 'What materials are used for the body and trim?',
      a: `Body: ${g.bodyMaterial}. Trim (stem / bean / seat): ${g.trimMaterial}. Seals: ${g.sealMaterial}. Tungsten-carbide hardfacing (or full TC inserts) on the bean and seat is standard for sand-laden flow. Inconel 625 trim is available for severe sour environments.`,
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-works. ${g.workingPressurePsi >= 15000 ? '15K-class chokes are typically build-to-order — confirm OEM build slot at quote stage. Sour-service variants add 5-15 days for material certification.' : isAdjustable ? 'Common adjustable choke configurations are usually OEM stock or short-lead.' : 'Common bean sizes for the FC-140 trim are usually OEM stock; non-standard beans add 7-14 days.'}`,
    },
  ]
}

// ── Translators ───────────────────────────────────────────────────────────

function makePlug(g: PlugInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'oilfield-plug-valves',
    specTemplateSlug: 'oilfield-valve-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildPlugHtml(g),
    specs: {
      valve_type: 'Plug',
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
      bore_type: g.nominalSize.includes('×') || g.nominalSize.includes('x') ? 'Reduced Port' : 'Full Port',
    },
    faqs: buildPlugFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${g.plugType.toLowerCase().includes('lubricated') ? 'lubricated' : 'non-lubricated'} plug valve ${Math.round(g.workingPressurePsi / 1000)}k psi${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

function makeChoke(g: ChokeInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'oilfield-choke-valves',
    specTemplateSlug: 'oilfield-valve-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildChokeHtml(g),
    specs: {
      valve_type: 'Choke',
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
      bore_type: 'Standard',
    },
    faqs: buildChokeFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${g.chokeType.toLowerCase()} choke valve ${Math.round(g.workingPressurePsi / 1000)}k psi${g.serviceClass === 'Sour (NACE MR0175)' ? ' sour service' : ''}`.slice(0, 120),
  }
}

// ── Common spec values ────────────────────────────────────────────────────

const FORGED_4130_NACE = 'Forged AISI 4130 — NACE MR0175 compliant'
const FORGED_4130_STD = 'Forged AISI 4130'
const CAST_WCB_NACE = 'Cast WCB carbon steel — NACE MR0175 compliant'
const CAST_WCB = 'Cast WCB carbon steel'
const TRIM_PLUG_LT = '17-4PH plug + 410SS body inserts (sealant-injected)'
const TRIM_PLUG_TE = '17-4PH plug + PEEK liner'
const TRIM_PLUG_TE_INCONEL = 'Inconel 625 plug + PEEK liner (sour)'
const TRIM_CHOKE_TC = 'Tungsten-carbide bean + Inconel 625 stem + TC seat'
const TRIM_CHOKE_TC_BASIC = 'Tungsten-carbide bean + 17-4PH stem + TC seat'
const SEAL_PEEK_HNBR = 'PEEK back-up + HNBR primary seals'
const SEAL_RPTFE_FKM = 'RPTFE back-up + Viton (FKM) primary seals'
const SEAL_HNBR_GRAPHITE = 'HNBR + graphite packing (sour)'

// ── Plug Valve products (16) ──────────────────────────────────────────────

const PLUG_VALVES: PlugInput[] = [
  // Lubricated (LT) — 6
  {
    sku: 'IH-OFV-PLUG-LT-2-1502MF-10K-SOUR-ANSON',
    title: 'Plug Valve, Lubricated (LT), Manual, 2 in × 1502 M×F, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    plugType: 'Lubricated (LT)',
    operation: 'Manual',
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
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 1502 M×F lubricated plug valve, manual operation, 10,000 psi sour-service. Sealant-injected taper plug — frac iron service standard for high-cycle isolation.',
    applications: [
      'Frac iron service trees',
      'High-pressure flow-back manifolds',
      'Coiled-tubing pump-in lines (sour)',
      'Cement-unit pump discharge',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-PLUG-LT-2X1-1502MF-10K-SOUR-SPM',
    title: 'Plug Valve, Lubricated (LT), Manual, 2 in × 1 in 1502 M×F (Reducing), 10,000 psi, Sour Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    plugType: 'Lubricated (LT)',
    operation: 'Manual',
    nominalSize: '2 in × 1 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '1 in 1502 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 1 in 1502 M×F reducing-bore lubricated plug valve, manual, 10,000 psi sour. Adapts 2-inch frac iron to 1-inch lines — pump-in / kill-fluid service.',
    applications: [
      'Pump-in lines from 2" iron to 1" lines',
      'Kill / circulation lines',
      'Frac tree side outlets to instrumentation',
      'Reducing-bore service trees',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PLUG-LT-3-1502MF-15K-STD-WOM',
    title: 'Plug Valve, Lubricated (LT), Gear-Operated, 3 in × 1502 M×F, 15,000 psi, Standard Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    plugType: 'Lubricated (LT)',
    operation: 'Gear-Operated',
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
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '3 in × 1502 M×F lubricated plug valve, gear-operated handwheel, 15,000 psi standard-service. Larger 3-inch bore for high-rate frac discharge and cement-unit pump-off.',
    applications: [
      '3-inch high-rate frac discharge',
      'Cement-unit pump-off lines',
      '15K service trees (3-inch leg)',
      'High-pressure pumping iron — sweet wells',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PLUG-LT-2-1502MF-15K-STD-ANSON',
    title: 'Plug Valve, Lubricated (LT), Manual, 2 in × 1502 M×F, 15,000 psi, Standard Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    plugType: 'Lubricated (LT)',
    operation: 'Manual',
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
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '2 in × 1502 M×F lubricated plug valve, manual, 15,000 psi standard-service. 15K HP frac iron isolation — sweet wells.',
    applications: [
      '15K frac iron isolation',
      'Pump-side discharge service trees',
      'High-rate sweet wells',
      'Pressure-pumping HP iron',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PLUG-LT-3-1502MF-15K-STD-FMC',
    title: 'Plug Valve, Lubricated (LT), Manual, 3 in × 1502 M×F, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    plugType: 'Lubricated (LT)',
    operation: 'Manual',
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
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '3 in × 1502 M×F lubricated plug valve, manual, 15,000 psi standard-service. Large-bore HP frac discharge and cement-pumping iron.',
    applications: [
      '3-inch HP frac discharge (sweet)',
      'Cement-pump discharge manifolds',
      '15K service trees (3-inch leg)',
      'Pressure-pumping HP iron',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PLUG-LT-2X1-1502MF-15K-STD-SPM',
    title: 'Plug Valve, Lubricated (LT), Manual, 2 in × 1 in 1502 M×F (Reducing), 15,000 psi, Standard Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    plugType: 'Lubricated (LT)',
    operation: 'Manual',
    nominalSize: '2 in × 1 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '1 in 1502 Female Weco Union',
    serviceClass: 'Standard',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'N/A',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_PLUG_LT,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '2 in × 1 in 1502 M×F reducing-bore lubricated plug valve, manual, 15,000 psi standard. HP adapter for instrument tap-offs and small-line pump-in.',
    applications: [
      'HP instrument tap-offs (15K iron)',
      '15K kill / circulation small-line',
      'Reducing-bore service trees (HP)',
      'Pump-in lines from 2" to 1"',
    ],
    leadTimeDays: 35,
  },
  // Non-lubricated (TE) — 10
  {
    sku: 'IH-OFV-PLUG-TE-2X1-1502MF-10K-SOUR-SPM',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2 in × 1 in 1502 M×F (Reducing), 10,000 psi, Sour Service',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '2 in × 1 in',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    endConnectionInlet: '2 in 1502 Male Weco Union',
    endConnectionOutlet: '1 in 1502 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PLUG_TE_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2 in × 1 in 1502 M×F reducing-bore non-lubricated plug valve, manual, 10,000 psi sour. PEEK liner — no sealant maintenance. Sour-rated trim with Inconel 625 plug.',
    applications: [
      'Sour-well frac iron pump-in',
      'Kill / circulation small-line',
      'Reducing-bore sour service trees',
      'Long-cycle wellhead service',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2-602MF-6K-SOUR-ANSON',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2 in × 602 M×F, 6,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
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
    trimMaterial: TRIM_PLUG_TE_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2 in × 602 M×F non-lubricated plug valve, manual, 6,000 psi sour. 602 union — production-test iron with PEEK liner for low-maintenance sour service.',
    applications: [
      'Production-test iron (sour)',
      'Well-test surface trees',
      'Long-cycle 6K isolation',
      'Sour flow-back manifolds',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2-206MF-2K-SOUR-INDUS',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2 in × 206 M×F, 2,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '2 in',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    endConnectionInlet: '2 in 206 Male Weco Union',
    endConnectionOutlet: '2 in 206 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Forged carbon steel (LF2) — NACE MR0175 compliant',
    trimMaterial: TRIM_PLUG_TE,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2 in × 206 M×F non-lubricated plug valve, manual, 2,000 psi sour. Cost-effective low-pressure sour-service iron — cementing and kill-fluid lines.',
    applications: [
      'Cementing surface lines (sour)',
      'Kill-fluid circulation (sour)',
      'Low-pressure flow-back',
      'Mud-circulation skid manifolds',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2-1502MF-10K-SOUR-ANSON',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2 in × 1502 M×F, 10,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
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
    trimMaterial: TRIM_PLUG_TE_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2 in × 1502 M×F non-lubricated plug valve, manual, 10,000 psi sour-service. PEEK liner — no sealant maintenance. Long-cycle sour frac iron.',
    applications: [
      'Long-cycle sour frac iron',
      'Production-test trees (sour)',
      'Subsea-adjacent surface manifolds',
      'High-cycle 10K service',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2-900RF-2220-SOUR-CAMERON',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2 in × 900# RF, 2,220 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
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
    bodyMaterial: 'Cast WCB carbon steel — NACE MR0175 compliant',
    trimMaterial: TRIM_PLUG_TE,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2 in × 900# RF non-lubricated plug valve, manual, 2,220 psi sour-service per API 6D. ANSI raised-face flanges — process-plant and pipeline manifolds.',
    applications: [
      'Process-plant block service (sour)',
      'Pipeline manifold isolation',
      '900# class refinery / gas-plant',
      'Sour-gas processing inlets',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2116-15M-15K-SOUR-CAMERON',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2-1/16 in × 15M Flanged, 15,000 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '2-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE-1.5',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_PLUG_TE_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '2-1/16 in × 15M flanged non-lubricated plug valve, manual, 15K psi sour per API 6A PSL 3 / PR1 / EE-1.5. Wellhead Christmas tree side-outlet plug.',
    applications: [
      '15K Christmas tree side outlets',
      'HPHT wellhead manifolds',
      'Production tree small-bore isolation',
      'Sour-gas surface trees',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-PLUG-TE-2116-15M-15K-STD-FMC',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 2-1/16 in × 15M Flanged, 15,000 psi, Standard Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '2-1/16 in',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    endConnectionInlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    endConnectionOutlet: '2-1/16 in API 6A 15M Flanged (RTJ)',
    serviceClass: 'Standard',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_STD,
    trimMaterial: TRIM_PLUG_TE,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '2-1/16 in × 15M flanged non-lubricated plug valve, manual, 15K psi standard per API 6A PSL 3 / PR1. Wellhead side-outlet plug for sweet HP wells.',
    applications: [
      '15K sweet Christmas tree side outlets',
      'Sweet HPHT wellhead manifolds',
      'Production tree side-outlet isolation',
      'Sweet 15K production trees',
    ],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-OFV-PLUG-TE-3-206MF-2K-SOUR-INDUS',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 3 in × 206 M×F, 2,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '3 in',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    endConnectionInlet: '3 in 206 Male Weco Union',
    endConnectionOutlet: '3 in 206 Female Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Forged carbon steel (LF2) — NACE MR0175 compliant',
    trimMaterial: TRIM_PLUG_TE,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '3 in × 206 M×F non-lubricated plug valve, manual, 2,000 psi sour. 3-inch low-pressure cementing and kill-fluid iron, sour-rated.',
    applications: [
      '3-inch sour cementing iron',
      'Low-pressure mud-circulation manifolds',
      'Bulk-flow kill / circulation lines',
      'Tank-farm cross-over manifolds',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-OFV-PLUG-TE-3-300RF-740-SOUR-STREAMFLO',
    title: 'Plug Valve, Non-lubricated (TE), Manual, 3 in × 300# RF, 740 psi, Sour Service',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    plugType: 'Non-lubricated (TE)',
    operation: 'Manual',
    nominalSize: '3 in',
    workingPressurePsi: 740,
    pressureClass: 'ANSI 300',
    endConnectionInlet: '3 in 300# ANSI Raised-Face Flange',
    endConnectionOutlet: '3 in 300# ANSI Raised-Face Flange',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6D',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Cast WCB carbon steel — NACE MR0175 compliant',
    trimMaterial: TRIM_PLUG_TE,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '3 in × 300# RF non-lubricated plug valve, manual, 740 psi sour-service per API 6D. Process-plant low-pressure block valve, sour-rated.',
    applications: [
      'Sour-gas processing utility headers',
      'Tank-farm ingress / drain manifolds',
      'Low-pressure process service',
      'Pipeline cross-over isolation',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-PLUG-TE-3-1502FM-10K-SOUR-WOM',
    title: 'Plug Valve, Non-lubricated (TE), Gear-Operated, 3 in × 1502 F×M, 10,000 psi, Sour Service',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    plugType: 'Non-lubricated (TE)',
    operation: 'Gear-Operated',
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
    trimMaterial: TRIM_PLUG_TE_INCONEL,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '3 in × 1502 F×M non-lubricated plug valve, gear-operated, 10,000 psi sour-service. Large-bore sour iron with PEEK liner — high-rate sour wells.',
    applications: [
      'High-rate sour-well frac iron',
      'Cement-pump discharge (sour)',
      '3-inch sour service trees',
      'Long-cycle sour-gas iron',
    ],
    leadTimeDays: 35,
  },
]

// ── Choke Valve products (12) ─────────────────────────────────────────────

const CHOKE_VALVES: ChokeInput[] = [
  // Adjustable Manual — 8
  {
    sku: 'IH-OFV-CHOKE-ADJ-N60-2-1502FM-10K-SOUR-CAMERON',
    title: 'Adjustable Manual Choke, N-60 Trim, 2 in × 1502 F×M, 3/4 in Max Bean, 10,000 psi, Sour Service',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    chokeType: 'Adjustable Manual',
    trimModel: 'N-60',
    beanMax: '3/4 in max',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 1502 F×M adjustable manual choke, N-60 trim, 3/4 in max bean, 10,000 psi sour-service. Wellhead and well-test flow control.',
    applications: [
      'Wellhead production trees (sour)',
      'Well-test choke manifolds',
      'Sour-gas flow control',
      '10K production allocation',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-N60-5X7-2-1502FM-15K-STD-CAMERON',
    title: 'Adjustable Manual Choke, N-60 5x7 Trim, 2 in × 1502 F×M, 3/4 in Max Bean, 15,000 psi, Standard, w/ Autoclave Tap',
    brandSlug: 'cameron',
    countryOfOrigin: 'USA',
    chokeType: 'Adjustable Manual',
    trimModel: 'N-60 5x7',
    beanMax: '3/4 in max',
    options: 'with autoclave tap (9/16 in) for pressure / sample instrumentation',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '2 in × 1502 F×M adjustable manual choke, N-60 5x7 gear trim, 3/4 in max bean, 15K psi standard, with autoclave tap. HP well-test flow control.',
    applications: [
      '15K well-test trees',
      'HP frac flow-back chokes',
      'Production allocation (sweet)',
      'Pressure-pumping control',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-N60-2-602FM-6K-SOUR-ANSON',
    title: 'Adjustable Manual Choke, N-60 Trim, 2 in × 602 F×M, 3/4 in Max Bean, 6,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    chokeType: 'Adjustable Manual',
    trimModel: 'N-60',
    beanMax: '3/4 in max',
    nominalSize: '2 in',
    workingPressurePsi: 6000,
    pressureClass: '5K',
    endConnectionInlet: '2 in 602 Female Weco Union',
    endConnectionOutlet: '2 in 602 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 602 F×M adjustable manual choke, N-60 trim, 3/4 in max bean, 6,000 psi sour. 602-union production-test choke for low-pressure trees.',
    applications: [
      'Production-test choke manifolds',
      'Sour-well 6K flow control',
      'Well-test surface trees',
      'Low-rate production allocation',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-H2-3-1502FM-10K-SOUR-FMC',
    title: 'Adjustable Manual Choke, H2 Trim, 3 in × 1502 F×M, 3 in Nom / 2 in Max Bean, 10,000 psi, Sour Service',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    chokeType: 'Adjustable Manual',
    trimModel: 'H2',
    beanMax: '3 in nominal / 2 in max',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '3 in × 1502 F×M adjustable manual choke, H2 trim, 3 in nom / 2 in max bean, 10,000 psi sour. Large-bore sour-gas flow control.',
    applications: [
      'High-rate sour production trees',
      '3-inch flow-back chokes',
      'Choke manifold trunk',
      'Sour-gas allocation',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-H2-3-1502FM-15K-STD-FMC',
    title: 'Adjustable Manual Choke, H2 Trim, 3 in × 1502 F×M, 3 in Nom / 2 in Max Bean, 15,000 psi, Standard',
    brandSlug: 'fmc-technologies',
    countryOfOrigin: 'USA',
    chokeType: 'Adjustable Manual',
    trimModel: 'H2',
    beanMax: '3 in nominal / 2 in max',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '3 in × 1502 F×M adjustable manual choke, H2 trim, 3 in nom / 2 in max bean, 15K psi standard. HP large-bore choke for sweet wells.',
    applications: [
      '15K production trees (sweet)',
      'HP flow-back trains',
      'Frac flow-back chokes',
      '3-inch HP allocation',
    ],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-H2-3-602FM-6K-SOUR-ANSON',
    title: 'Adjustable Manual Choke, H2 Trim, 3 in × 602 F×M, 3 in Nom / 2 in Max Bean, 6,000 psi, Sour Service',
    brandSlug: 'anson',
    countryOfOrigin: 'United Kingdom',
    chokeType: 'Adjustable Manual',
    trimModel: 'H2',
    beanMax: '3 in nominal / 2 in max',
    nominalSize: '3 in',
    workingPressurePsi: 6000,
    pressureClass: '5K',
    endConnectionInlet: '3 in 602 Female Weco Union',
    endConnectionOutlet: '3 in 602 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '3 in × 602 F×M adjustable manual choke, H2 trim, 3 in nom / 2 in max bean, 6,000 psi sour. Mid-pressure 3-inch sour-gas choke.',
    applications: [
      'Mid-pressure sour production trees',
      'Well-test 6K choke manifolds',
      '3-inch sour flow allocation',
      'Sour-gas processing inlet chokes',
    ],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-H2-3-206FM-2K-SOUR-INDUS',
    title: 'Adjustable Manual Choke, H2 Trim, 3 in × 206 F×M, 3 in Nom / 2 in Max Bean, 2,000 psi, Sour Service',
    brandSlug: 'indus',
    countryOfOrigin: 'UAE',
    chokeType: 'Adjustable Manual',
    trimModel: 'H2',
    beanMax: '3 in nominal / 2 in max',
    nominalSize: '3 in',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    endConnectionInlet: '3 in 206 Female Weco Union',
    endConnectionOutlet: '3 in 206 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: 'Forged carbon steel (LF2) — NACE MR0175 compliant',
    trimMaterial: TRIM_CHOKE_TC_BASIC,
    sealMaterial: SEAL_PEEK_HNBR,
    oneLiner:
      '3 in × 206 F×M adjustable manual choke, H2 trim, 3 in nom / 2 in max bean, 2,000 psi sour. Cost-effective low-pressure sour-gas choke.',
    applications: [
      'Low-pressure sour-gas allocation',
      'Mud-circulation choke manifolds',
      'Tank-farm flow control',
      'Low-rate flow-back chokes',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-OFV-CHOKE-ADJ-H2-318-5M-FLG-5K-SOUR-STREAMFLO',
    title: 'Adjustable Manual Choke, H2 Trim, 3-1/8 in × 5M Flanged BW, 3 in Nom / 2 in Max Bean, 5,000 psi, Sour Service',
    brandSlug: 'stream-flo',
    countryOfOrigin: 'Canada',
    chokeType: 'Adjustable Manual',
    trimModel: 'H2',
    beanMax: '3 in nominal / 2 in max',
    nominalSize: '3-1/8 in',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    endConnectionInlet: '3-1/8 in API 6A 5M Flanged (RTJ)',
    endConnectionOutlet: '3 in Butt-Weld (Schedule 160)',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'API 6A',
    pslClass: 'PSL 3',
    prClass: 'PR1',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '3-1/8 in × 5M flanged inlet × 3 in butt-weld outlet adjustable manual choke, H2 trim, 5,000 psi sour per API 6A PSL 3 / PR1 / EE. Flanged-to-welded transition.',
    applications: [
      '5M wellhead choke manifolds',
      'Flanged-to-welded production lines',
      'Sour-gas processing inlets',
      '5K production tree side outlets',
    ],
    leadTimeDays: 56,
  },
  // Positive — 4
  {
    sku: 'IH-OFV-CHOKE-POS-FC140-2-1502FM-10K-SOUR-SPM',
    title: 'Positive Choke, FC-140 Trim, 2 in × 1502 F×M, 3/4 in Max Bean, 10,000 psi, Sour Service, No Cap',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    chokeType: 'Positive',
    trimModel: 'FC-140',
    beanMax: '3/4 in max',
    options: 'no cap (open-bore configuration for inline flow indicators)',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 1502 F×M positive choke, FC-140 trim, 3/4 in max bean, 10,000 psi sour, no cap. Fixed-bean stable-flow allocation for sour wells.',
    applications: [
      'Production allocation (sour)',
      'Fixed-bean flow-back service',
      'Sour-gas test bench chokes',
      'Calibrated bypass loops',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-CHOKE-POS-FC140-2-1502FM-15K-STD-SPM',
    title: 'Positive Choke, FC-140 Trim, 2 in × 1502 F×M, 3/4 in Max Bean, 15,000 psi, Standard, 9/16 in Autoclave, No Cap',
    brandSlug: 'spm-oil-gas',
    countryOfOrigin: 'USA',
    chokeType: 'Positive',
    trimModel: 'FC-140',
    beanMax: '3/4 in max',
    options: 'with 9/16 in autoclave tap, no cap',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_RPTFE_FKM,
    oneLiner:
      '2 in × 1502 F×M positive choke, FC-140 trim, 3/4 in max bean, 15K psi standard, 9/16 in autoclave tap. HP fixed-bean allocation.',
    applications: [
      '15K production allocation (sweet)',
      'HP fixed-bean flow-back',
      'Sweet sand-water flow chokes',
      'Calibrated 15K test bench',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-OFV-CHOKE-POS-FC140-2-602FM-6K-SOUR-WOM',
    title: 'Positive Choke, FC-140 Trim, 2 in × 602 F×M, 3/4 in Max Bean, 6,000 psi, Sour Service, No Cap',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    chokeType: 'Positive',
    trimModel: 'FC-140',
    beanMax: '3/4 in max',
    options: 'no cap',
    nominalSize: '2 in',
    workingPressurePsi: 6000,
    pressureClass: '5K',
    endConnectionInlet: '2 in 602 Female Weco Union',
    endConnectionOutlet: '2 in 602 Male Weco Union',
    serviceClass: 'Sour (NACE MR0175)',
    apiSpec: 'Other',
    pslClass: 'N/A',
    prClass: 'N/A',
    materialClassApi: 'EE',
    bodyMaterial: FORGED_4130_NACE,
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 602 F×M positive choke, FC-140 trim, 3/4 in max bean, 6,000 psi sour, no cap. 602-union sour fixed-bean allocation.',
    applications: [
      '6K sour production allocation',
      '602-iron flow-back chokes',
      'Sour well-test bench',
      'Production-test calibrated bypass',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-OFV-CHOKE-POS-FC140-5X7-2-1502FM-10K-SOUR-WOM',
    title: 'Positive Choke, FC-140 5x7 Trim, 2 in × 1502 F×M, 3/4 in Max Bean, 10,000 psi, Sour Service, No Cap',
    brandSlug: 'wom',
    countryOfOrigin: 'USA',
    chokeType: 'Positive',
    trimModel: 'FC-140 5x7',
    beanMax: '3/4 in max',
    options: 'no cap, gear-reduction handwheel for bean change under pressure',
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
    trimMaterial: TRIM_CHOKE_TC,
    sealMaterial: SEAL_HNBR_GRAPHITE,
    oneLiner:
      '2 in × 1502 F×M positive choke, FC-140 5x7 gear trim, 3/4 in max bean, 10,000 psi sour, no cap. Gear-reduction for bean change under pressure.',
    applications: [
      '10K sour production allocation (gear-trim)',
      'High-cycle bean-change service',
      'Sour-gas flow-back with low-effort change',
      'Wellhead bench-test bypass',
    ],
    leadTimeDays: 42,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-oilfield-valves-plug-choke',
    description:
      'Oilfield Valves Batch 3 — adds 2 sub-categories (oilfield-plug-valves, oilfield-choke-valves), 28 products (16 plug + 12 choke), and a new "Pressure & Flow Control" megamenu sub-section. Extends the import library with array-based navigation to support multiple sub-section operations in one batch.',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [],

  // Megamenu — TWO operations using the new array-based navigation:
  //   (a) Extend "Wellhead & Frac" sub: add Plug Valves leaf, preserve existing 4
  //   (b) Create new "Pressure & Flow Control" sub with Choke Valves leaf
  navigation: [
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'oilfield-valves',
      parentSubLabel: 'Wellhead & Frac',
      replacements: [
        { label: 'Ball Valves', categorySlug: 'oilfield-ball-valves' },
        { label: 'Gate Valves', categorySlug: 'oilfield-gate-valves' },
        { label: 'Plug Valves', categorySlug: 'oilfield-plug-valves' },
        { label: 'Check Valves', categorySlug: 'oilfield-check-valves' },
        { label: 'SSV & ESD Valves', categorySlug: 'oilfield-ssv-esd-valves' },
      ],
    },
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'oilfield-valves',
      parentSubLabel: 'Pressure & Flow Control',
      createSubSectionIfMissing: true,
      replacements: [
        { label: 'Choke Valves', categorySlug: 'oilfield-choke-valves' },
      ],
    },
  ],

  products: [...PLUG_VALVES.map(makePlug), ...CHOKE_VALVES.map(makeChoke)],
}

export default batch
