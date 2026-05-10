/**
 * DEMCO Butterfly Valves — full catalogue — 2026-05-10
 *
 * Imports the full DEMCO butterfly-valve product line from the Cooper Cameron
 * Valves catalogue (CT-DEM-NE/NF/NEI, 08/05) as 14 products: 6 valve series
 * + 8 accessory products (handles, gear operator, pneumatic actuators, stem
 * extension). Variants by size, pressure rating, body / stem / disc / seat
 * material, body configuration (wafer or lug) and actuation are captured as
 * available-options spec fields and enumerated in the long description, so a
 * customer searching any specific DEMCO base part number lands on the right
 * series PDP and specifies the exact configuration in the RFQ.
 *
 * Brand: demco (NEW — house DEMCO product line, USA, authorised distributor)
 * Category: butterfly-valves (NEW — under valves-manifolds)
 * Spec templates:
 *   - butterfly-valve-spec (NEW — 16 fields, used by the 6 valve products)
 *   - butterfly-valve-accessory-spec (NEW — 9 fields, used by the 8 accessories)
 * Megamenu: creates a new "Process Valves" sub-section under Valves & Manifolds
 *           with a single "Butterfly Valves" leaf. (Existing V&M sub-sections —
 *           Directional Control / Pressure Control / Flow Control / Check &
 *           Logic / Manifolds — are placeholder customUrl leaves for the
 *           hydraulic-valve roadmap and are NOT touched.)
 *
 * Run:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-butterfly-valves.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-butterfly-valves.ts
 */
import type {
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Common defaults for all products in this batch ─────────────────────────

const COMMON: Pick<
  ProductImportPayload,
  | 'brandSlug'
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
  | 'countryOfOrigin'
  | 'categorySlug'
> = {
  brandSlug: 'demco',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 14, // imported from USA — Cooper Cameron Valves
  countryOfOrigin: 'USA',
  categorySlug: 'butterfly-valves',
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function listToHtml(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${escape(i)}</li>`).join('')}</ul>`
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1 — VALVES (6 products)
// ═════════════════════════════════════════════════════════════════════════════

type ValveInput = {
  sku: string
  title: string
  series: string
  bodyConfiguration: string
  sizeRange: string
  shutoffRatings: string
  isSanitary: boolean
  endConnectionStandard: string
  bodyMaterials: string
  stemMaterials: string
  discMaterials: string
  seatElastomers: string
  temperatureRange: string
  endOfLineService: boolean
  actuationOptions: string
  flowCoefficientMax: string
  oneLiner: string
  introParagraph: string
  applications: string[]
  notableFeatures: string[]
  basePartNumberExamples: string[]
  howToOrderTable: { col: string; values: string[] }[]
  companionAccessories: string[]
}

function buildValveDescription(g: ValveInput): string {
  const partNumberRows = g.basePartNumberExamples
    .map((p) => `<li><code>${escape(p)}</code></li>`)
    .join('')

  const orderTable = `<table><thead><tr><th scope="col">Position</th><th scope="col">Selection</th></tr></thead><tbody>${g.howToOrderTable
    .map(
      (r) =>
        `<tr><td><strong>${escape(r.col)}</strong></td><td>${r.values
          .map((v) => escape(v))
          .join(', ')}</td></tr>`,
    )
    .join('')}</tbody></table>`

  return `<p>${escape(g.introParagraph)}</p>
<h3>Construction</h3>
<ul>
<li><strong>Body configurations:</strong> ${escape(g.bodyConfiguration)}</li>
<li><strong>Size range:</strong> ${escape(g.sizeRange)}</li>
<li><strong>End connections:</strong> ${escape(g.endConnectionStandard)}</li>
<li><strong>Body materials:</strong> ${escape(g.bodyMaterials)}</li>
<li><strong>Stem materials:</strong> ${escape(g.stemMaterials)}</li>
<li><strong>Disc materials:</strong> ${escape(g.discMaterials)}</li>
<li><strong>Seat elastomers:</strong> ${escape(g.seatElastomers)}</li>
<li><strong>Bearings:</strong> Bronze (standard); throttling discs include 4 stem O-rings for stem sealing.</li>
</ul>
<h3>Performance</h3>
<ul>
<li><strong>Pressure class:</strong> ASME Class 150 (285 psi non-shock body rating).</li>
<li><strong>Drop-tight shut-off ratings:</strong> ${escape(g.shutoffRatings)}.</li>
<li><strong>Vacuum:</strong> Sealed against 10 microns of vacuum (29.9 in Hg).</li>
<li><strong>Temperature range:</strong> ${escape(g.temperatureRange)}.</li>
<li><strong>Bi-directional sealing:</strong> Identical drop-tight closure from either flow direction.</li>
<li><strong>End-of-line service:</strong> ${
    g.endOfLineService
      ? 'Lug body suitable for end-of-line service with downstream piping removed (weld-neck or socket flanges only).'
      : 'Not rated for end-of-line service.'
  }</li>
<li><strong>Flow coefficient (Cv at 90° open):</strong> ${escape(g.flowCoefficientMax)}.</li>
</ul>
<h3>Engineered features</h3>
${listToHtml(g.notableFeatures)}
<h3>Typical applications</h3>
${listToHtml(g.applications)}
<h3>How to order</h3>
<p>DEMCO uses an 11-character part number to specify each unique configuration. Build the part number from the base number plus six selection digits:</p>
${orderTable}
<p>Example DEMCO base part numbers in this series:</p>
<ul>${partNumberRows}</ul>
<p><strong>For your RFQ, please specify:</strong> required size, pressure rating, body configuration (wafer or lug), body / stem / disc materials, seat elastomer, and required actuation. Indus Hydraulics will return an estimate against the corresponding DEMCO base part number.</p>
<h3>Compliance &amp; marking</h3>
<ul>
<li>MSS SP-25 marking standard on every valve.</li>
<li>Body rating to ASME Class 150 (285 psi non-shock).</li>
<li>Wafer body diameters self-centre in ASME Class 150 flange patterns.</li>
<li>Triple stem seal: hard-backed cartridge seat + integral flange seal + dual O-ring stem ribs in the seat bore.</li>
</ul>
<h3>Companion products</h3>
<p>Manual handles, weatherproof worm-gear operators, and Series DR pneumatic actuators all interchange on this valve via the DEMCO top-flange standard. Compatible Indus SKUs include ${g.companionAccessories
    .map((s) => `<code>${escape(s)}</code>`)
    .join(', ')}. For automated installations, also see the position indicator switch, solenoid valve, pneumatic positioner, and seal-repair-kit accessories listed against the corresponding actuator product.</p>`
}

function buildValveFaqs(g: ValveInput): FaqEntry[] {
  return [
    {
      q: `Is the ${g.series} a wafer or lug butterfly valve?`,
      a: `${g.bodyConfiguration}. Wafer bodies install between two flanges using through-bolts and self-centre in ASME Class 150 flange patterns. Lug bodies have threaded bolt holes${
        g.endOfLineService
          ? ' and can be used for end-of-line service with the downstream pipe removed (provided weld-neck or socket flanges are used upstream)'
          : ''
      }. Specify the body configuration explicitly on your RFQ.`,
    },
    {
      q: `What sizes are available in the DEMCO ${g.series}?`,
      a: `${g.sizeRange}. Larger bores (14"–36" / 350–900 mm) are covered by the Series NF-C product line — please request the NF-C series instead if you need 14" or larger.`,
    },
    {
      q: 'Which shut-off pressure rating should I order?',
      a: `${g.shutoffRatings}. The 200 psi rating is the standard general-service shut-off and covers the majority of applications. The 285 psi rating is for higher-pressure liquid service. The 50 psi rating is selected when the application allows reduced shut-off pressure in exchange for substantially smaller actuator sizing — common in automated systems where actuator cost dominates. Throttling-rated valves do not provide drop-tight closure but offer the lowest operating torque for control-valve service.`,
    },
    {
      q: 'How do I select the right seat elastomer?',
      a: `Match the elastomer to your fluid and temperature: Buna-N is the general-purpose hydrocarbon and oil seat (0–180°F). EPDM is the recommended water-service elastomer (peroxide-cured, +20–275°F) and is also resistant to alkaline solutions. Viton is the premium chemical/high-temperature seat (+20–300°F). Hypalon is preferred in acid service. Refer to the DEMCO Material Selection Guide for chemical-specific compatibility — Indus Hydraulics will cross-check the elastomer against your service conditions during quote review.`,
    },
    {
      q: 'How do I select the right body and disc material?',
      a: `Body material is driven by line-fluid corrosivity and pressure: ductile iron is the volume choice; bronze, stainless steel, aluminium and aluminium-bronze cover progressively more aggressive fluids; nickel-plated and PVF-coated ductile iron variants extend ductile iron's chemical service. Disc material should match the body material's corrosion class — DEMCO discs are available in 316 SS, Monel, aluminium, bronze, ductile iron (nickel-plated or PVF-coated), Alloy 20 and Hastelloy C. Indus Hydraulics will recommend a body/disc pairing on your RFQ once you confirm the line fluid and temperature.`,
    },
    {
      q: 'Can this valve be automated?',
      a: `Yes. The DEMCO top-flange is dimensionally compatible with competitive butterfly valves, so any DEMCO 10-position locking handle, 2-position locking handle, memory-stop throttling handle, square-nut handle, weatherproof worm-gear operator, or Series DR double-acting / spring-return pneumatic actuator can be fitted in the field. With the optional "utility top" stem the valve also accepts third-party actuators without modification — useful when replacing a competitive valve in an existing automated installation.`,
    },
    {
      q: 'Is this valve fire-safe / NACE / API 607 rated?',
      a: 'No — the DEMCO NE/NF/NEI series is a resilient-seated process butterfly valve and does not carry API 607 fire-safe certification or NACE MR0175 certification. For fire-safe or sour-service applications, Indus Hydraulics carries triple-offset metal-seated butterfly valves under the Cameron oilfield valve product line — please request the oilfield butterfly valve series instead.',
    },
    {
      q: 'Is end-of-line service supported?',
      a: g.endOfLineService
        ? `Yes — the lug-body variant of the ${g.series} is rated for end-of-line liquid service with the downstream piping removed, up to the standard 200 psi shut-off rating (150 psi for sizes 14" and larger). Only weld-neck or socket flanges may be used upstream — slip-on or threaded flanges are not supported in this configuration. Lug bodies are also recommended for isolation of pumps, control devices and any system component which may need to be removed for repair or replacement.`
        : `End-of-line service is not supported on this body style. The ${g.series} is supplied wafer-only and requires both upstream and downstream flanges to constrain the valve in service. For end-of-line service requirements, specify the lug-body NE-C, NE-I or NF-C product line instead.`,
    },
  ]
}

// ── Valve product data ────────────────────────────────────────────────────

const HOW_TO_ORDER_SMALL: ValveInput['howToOrderTable'] = [
  { col: 'Body Configuration', values: ['Wafer (1)', 'Lug (5)'] },
  {
    col: 'Body Material',
    values: [
      'Ductile Iron (1)',
      'Cast Iron wafer (2)',
      'Aluminium Bronze (3)',
      'Carbon Steel (4)',
      'Aluminium NE-I wafer only (5)',
      'ENC Coated DI (6)',
      'Stainless Steel (8)',
    ],
  },
  {
    col: 'Stem Material',
    values: ['416 SS (1)', '316 SS (2)', 'Monel (3)'],
  },
  {
    col: 'Disc Material',
    values: [
      '316 SS (2)',
      'Monel (3)',
      'Aluminium (4)',
      'Ductile Iron (5)',
      'Vented (6)',
      'Solid SS (9)',
      'Alloy 20 (7)',
      'Hastelloy C (8)',
    ],
  },
  {
    col: 'Seat Elastomer',
    values: [
      'Buna-N (31)',
      'Black Neoprene (32)',
      'Hypalon (33)',
      'Viton (34)',
      'Peroxide-Cured EPDM (35)',
      'Natural Rubber (36)',
      'White Neoprene (37)',
      'ETM-30230 (01)',
      'Fluorosteam (02)',
      'Peroxide-Cured Buna-N (03)',
    ],
  },
  {
    col: 'Actuation',
    values: [
      'Bare Shaft (—)',
      '10-Position Locking Handle (14)',
      '2-Position Locking Handle (64)',
      'Throttling Memory-Stop Handle (24)',
      'Square Nut (5)',
      'Worm-Gear Operator',
      'Series DR Pneumatic Actuator',
    ],
  },
]

const HOW_TO_ORDER_NFC: ValveInput['howToOrderTable'] = [
  { col: 'Body Configuration', values: ['Wafer (1)', 'Lug (5)'] },
  {
    col: 'Body Material',
    values: [
      'Ductile Iron lug (1)',
      'Cast Iron wafer (2)',
      'Carbon Steel lug (4)',
      'Stainless Steel lug (8)',
    ],
  },
  {
    col: 'Stem Material',
    values: ['416 SS (1)', '316 SS (2)', 'Monel (3)'],
  },
  {
    col: 'Disc Material',
    values: [
      '316 SS (2)',
      'Monel (3)',
      'Aluminium Bronze (4)',
      'Ductile Iron Nickel-Plated (5)',
      'PVC Coated DI (6)',
    ],
  },
  {
    col: 'Seat Elastomer',
    values: [
      'Buna-N (31)',
      'Black Neoprene (32)',
      'Hypalon (33)',
      'Viton (34)',
      'EPDM (35)',
    ],
  },
  {
    col: 'Actuation',
    values: ['Bare Shaft (E)', 'Hand Wheel WGO (A)', 'Chain Wheel WGO (C)', 'Square Nut WGO (D)', 'Series DR Pneumatic Actuator'],
  },
]

const VALVES: ValveInput[] = [
  {
    sku: 'IH-VAL-BFLY-NEC',
    title: 'DEMCO Series NE-C General-Purpose Butterfly Valve, 2″–12″',
    series: 'NE-C',
    bodyConfiguration: 'Wafer and Lug',
    sizeRange: '2″ – 12″ (50 – 300 mm)',
    shutoffRatings: '200 psi (standard), 285 psi (high-pressure), 50 psi (low-torque), Throttling',
    isSanitary: false,
    endConnectionStandard: 'ASME Class 125/150 flanges (raised- or flat-face)',
    bodyMaterials:
      'Cast iron (wafer), ductile iron (lug), aluminium bronze, carbon steel (WCB), aluminium, ENC nickel-plated ductile iron, 316 stainless steel (CF8M), PVF-coated ductile iron',
    stemMaterials: '416 stainless, 316 stainless, Monel — utility-top option for actuator interchangeability',
    discMaterials:
      '316 SS (CF8M), Monel (M30C), aluminium, bronze, ductile iron, ENC nickel-plated ductile iron, vented, solid SS, Alloy 20 (CN-7M), Hastelloy C (CW-2M), aluminium bronze, PVF-coated ductile iron',
    seatElastomers:
      'Buna-N, Black Neoprene, Hypalon, Viton, EPDM (peroxide-cured), Natural Rubber, White Neoprene, ETM-30230, Fluorosteam, Peroxide-Cured Buna-N',
    temperatureRange: '−30°F to +300°F (−34°C to +149°C) — depends on selected elastomer',
    endOfLineService: true,
    actuationOptions:
      'Lever handles (10-position, 2-position, memory-stop, square nut), weatherproof worm-gear operators (handwheel/chainwheel/square nut/crank), Series DR double-acting and spring-return pneumatic actuators',
    flowCoefficientMax: '145 (2″) → 7,500 (12″)',
    oneLiner:
      'Long-neck general-purpose resilient-seated butterfly valve for chemical, oil & gas, water, HVAC and industrial process service. Long neck clears 2 inches of insulation on the pipe.',
    introParagraph:
      'The DEMCO Series NE-C is the long-neck, general-purpose member of the DEMCO resilient-seated butterfly valve family. The longer neck length is engineered to provide full clearance of the valve top over two inches of insulation on ASME Class 150 pipe flanges, making it the default selection for insulated process lines, steam-jacketed systems, and any installation where the valve top must clear lagging or cladding. Available in both wafer and lug body styles, in sizes 2″ through 12″, with the full DEMCO range of body / stem / disc materials and seat elastomers. Bi-directional sealing at full rated pressure, with three drop-tight shut-off ratings (200 / 285 / 50 psi) and a throttling option for control-valve service.',
    applications: [
      'Chemical and petrochemical process lines (insulated)',
      'Oil and gas drilling and production utilities',
      'Steam-jacketed and steam-traced piping',
      'Cooling towers and HVAC chilled-water service',
      'Power generation auxiliary systems',
      'Mining and minerals processing',
      'Water and waste-water treatment',
      'Marine and government service',
    ],
    notableFeatures: [
      'Long neck clears 2″ of insulation on ASME Class 150 flanges — eliminates handle/actuator clearance issues on lagged piping',
      'One-piece body for minimum weight and maximum strength',
      'Hard-backed cartridge seat — bonds resilient elastomer to a rigid backing ring; field-replaceable with no special tools',
      'Triple stem seal: integral flange seal + hard-backed seat + dual O-ring ribs in stem bore (eliminates stem leakage path that is common to "boot-seat" competitive designs)',
      'Dry stem journal — continuous annular raised land around stem hole prevents fluid behind the seat',
      'Floating disc — perfectly centres in seat for prolonged service life and drop-tight closure',
      'Positive stem retention — blowout-proof stem',
      'Flatted "double-D" upper stem with large flange top — accepts the full DEMCO actuation range',
      'MSS SP-25 marking is standard',
    ],
    basePartNumberExamples: [
      '22119 (2″, 200 psi)',
      '22124 (6″, 200 psi)',
      '22127 (12″, 200 psi)',
      '22230 (6″, 285 psi)',
      '22239 (6″, 50 psi)',
      '22248 (6″, throttling)',
    ],
    howToOrderTable: HOW_TO_ORDER_SMALL,
    companionAccessories: [
      'IH-VAL-BFLY-HDL-10P',
      'IH-VAL-BFLY-HDL-MEM',
      'IH-VAL-BFLY-WGO',
      'IH-VAL-BFLY-DR-DA',
      'IH-VAL-BFLY-STMX',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-NEI',
    title: 'DEMCO Series NE-I Short-Neck Butterfly Valve, 2″–12″',
    series: 'NE-I',
    bodyConfiguration: 'Wafer and Lug',
    sizeRange: '2″ – 12″ (50 – 300 mm)',
    shutoffRatings: '200 psi (standard), 285 psi (high-pressure), 50 psi (low-torque), Throttling',
    isSanitary: false,
    endConnectionStandard: 'ASME Class 125/150 flanges (raised- or flat-face)',
    bodyMaterials:
      'Ductile iron, aluminium bronze, carbon steel (WCB), aluminium (wafer only), 316 stainless steel (CF8M), ENC nickel-plated ductile iron, PVF-coated ductile iron',
    stemMaterials: '416 stainless, 316 stainless (17-4 PH for 8″–12″ upper stem), Monel',
    discMaterials:
      '316 SS, Monel, aluminium, bronze, ductile iron, vented, solid SS, Alloy 20, Hastelloy C, PVF-coated ductile iron, aluminium bronze',
    seatElastomers:
      'Buna-N, Black Neoprene, Hypalon, Viton, EPDM (peroxide-cured), Natural Rubber, White Neoprene, ETM-30230, Fluorosteam, Peroxide-Cured Buna-N',
    temperatureRange: '−30°F to +300°F (−34°C to +149°C) — depends on selected elastomer',
    endOfLineService: true,
    actuationOptions:
      'Lever handles (10-position, 2-position, memory-stop, square nut), weatherproof worm-gear operators, Series DR double-acting and spring-return pneumatic actuators',
    flowCoefficientMax: '145 (2″) → 7,500 (12″)',
    oneLiner:
      'Standard short-neck resilient-seated butterfly valve — the volume choice for general industrial process lines, food/beverage utilities, and a wide range of body materials including aluminium and stainless steel.',
    introParagraph:
      'The DEMCO Series NE-I is the short-neck, standard-installation member of the DEMCO butterfly valve family. Designed for installation between ASME Class 125/150 flanges, the NE-I covers the broadest range of body materials of any DEMCO series — including aluminium for low-weight installations and 316 stainless for corrosive-fluid service. Suited to a wide range of applications across many industries, including food and beverage utilities, process flow lines, and general industrial isolation duty. Available in wafer and lug body styles, sizes 2″ through 12″, with three drop-tight shut-off ratings (200 / 285 / 50 psi) plus throttling.',
    applications: [
      'Chemical and petrochemical process flow lines',
      'Food and beverage utility lines (water, steam, cleaning solutions)',
      'Pharmaceutical and biotech utilities',
      'Pulp & paper process lines',
      'Power-plant condensate and cooling water',
      'Mining slurry and tailings (with appropriate elastomer)',
      'Marine and shipboard auxiliaries',
      'General industrial isolation duty',
    ],
    notableFeatures: [
      'Short-neck design — installs flush between ASME Class 125/150 flanges without spool-piece adapters',
      'Broadest body-material range of any DEMCO series — including aluminium (wafer-only) for weight-critical installations',
      'Hard-backed cartridge seat — field-replaceable with no special tools',
      'Triple stem seal — integral flange seal + hard-backed seat + dual O-ring ribs',
      'Dry stem journal eliminates leakage potential behind the seat',
      'Floating disc with rectangular drive — ensures perfect seat centring and drop-tight closure',
      'Positive stem retention — blowout-proof stem',
      'PVF-coated ductile iron disc available for chemically aggressive service at ductile-iron pricing',
      'MSS SP-25 marking is standard',
    ],
    basePartNumberExamples: [
      '22128 (2″, 200 psi)',
      '22133 (6″, 200 psi)',
      '22136 (12″, 200 psi)',
      '22257 (6″, 285 psi)',
      '22266 (6″, 50 psi)',
      '22275 (6″, throttling)',
    ],
    howToOrderTable: HOW_TO_ORDER_SMALL,
    companionAccessories: [
      'IH-VAL-BFLY-HDL-10P',
      'IH-VAL-BFLY-HDL-2P',
      'IH-VAL-BFLY-WGO',
      'IH-VAL-BFLY-DR-DA',
      'IH-VAL-BFLY-DR-SR',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-NEI-SAN',
    title: 'DEMCO Series NE-I Sanitary Butterfly Valve (FDA), 2″–12″',
    series: 'NE-I Sanitary',
    bodyConfiguration: 'Wafer only',
    sizeRange: '2″, 2½″, 3″, 4″, 6″, 8″, 10″, 12″ (50–300 mm; 5″/125 mm not available)',
    shutoffRatings: '200 psi (drop-tight)',
    isSanitary: true,
    endConnectionStandard: 'ASME Class 125/150 sanitary flanges',
    bodyMaterials: 'Bronze, 316 stainless steel (CF8M) — polished / tumbled / unpolished, aluminium, ENC nickel-coated ductile iron',
    stemMaterials: '316 stainless steel; 17-4 PH SS upper stem on 8″–12″',
    discMaterials: '316 SS — polished (#4 dairy finish), tumbled (vibratory finish), or unpolished (as-cast surface)',
    seatElastomers:
      'Food-Grade EPT (peroxide-cured), Sulfur-Cured Food-Grade EPDM, Peroxide-Cured Food-Grade Buna-N — all FDA 21 CFR 177.2600 compliant; Black Neoprene, Viton, White Neoprene also available',
    temperatureRange: '+20°F to +275°F (−7°C to +135°C) for Food-Grade EPT (peroxide-cured) — most-common dairy/beverage choice',
    endOfLineService: false,
    actuationOptions:
      'Sanitary-trim lever handles (bronze hub with stainless-steel parts and fasteners), weatherproof worm-gear operators, Series DR pneumatic actuators',
    flowCoefficientMax: '145 (2″) → 7,500 (12″)',
    oneLiner:
      'FDA-compliant sanitary butterfly valve for the food, beverage, and pharmaceutical industries. Vented disc, dry stem journal, no closed chambers — engineered to meet rigorous sanitary-service requirements.',
    introParagraph:
      'The DEMCO Series NE-I Sanitary is an FDA-compliant sanitary butterfly valve, exclusively designed to meet the rigorous requirements of sanitary service in the food, beverage, dairy and pharmaceutical industries. All wetted parts are produced from FDA-approved materials. Discs are produced from investment castings, smooth and non-porous, with stem bosses minimised for increased flow. Drilled passageways — a design originated by DEMCO — vent the entire interior of the disc to atmosphere, leaving no closed chamber for the culture of undesirable organisms. The projecting inner surface of the resilient seat contacts and is compressed by the mating flange to form a smooth, uninterrupted flow way that ensures aseptic conditions after a piping flush. Handle parts are bronze with stainless-steel fasteners, permitting caustic wash-down.',
    applications: [
      'Dairy processing (milk, cream, whey, cultured products)',
      'Brewery and beverage process lines',
      'Pharmaceutical and biotech utility lines',
      'Edible oil and fat processing',
      'CIP / SIP (clean-in-place / sterilise-in-place) loop service',
      'Cosmetics and personal-care manufacturing',
      'Sanitary water service (RO, DI, WFI auxiliary)',
    ],
    notableFeatures: [
      'FDA 21 CFR 177.2600 compliant seat elastomers (Food-Grade EPT, Buna-N, EPDM)',
      'Dry stem journal — no fluid behind the seat',
      'Vented disc design — no closed chambers for organism culture',
      'Smooth investment-cast 316 SS disc with minimal stem bosses',
      'Trap-free flow way — projecting seat lip seals against mating flange',
      'Three disc finishes: polished (#4 dairy), tumbled, or unpolished',
      'Caustic wash-down compatible — bronze handle hub with SS fasteners',
      'Body in bronze, 316 SS, aluminium or ENC-coated ductile iron',
    ],
    basePartNumberExamples: [
      '23150 (2″, 200 psi)',
      '23151 (2½″, 200 psi)',
      '23154 (6″, 200 psi)',
      '23155 (8″, 200 psi)',
      '23157 (12″, 200 psi)',
    ],
    howToOrderTable: HOW_TO_ORDER_SMALL,
    companionAccessories: [
      'IH-VAL-BFLY-HDL-10P',
      'IH-VAL-BFLY-HDL-MEM',
      'IH-VAL-BFLY-WGO',
      'IH-VAL-BFLY-DR-DA',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-NED',
    title: 'DEMCO Series NE-D Lightweight-Flange Butterfly Valve, 2″–12″',
    series: 'NE-D',
    bodyConfiguration: 'Wafer only (with body notches for lightweight flange patterns)',
    sizeRange: '2″ – 12″ (50 – 300 mm)',
    shutoffRatings: '200 psi (standard), 285 psi (high-pressure), 50 psi (low-torque), Throttling',
    isSanitary: false,
    endConnectionStandard: 'Lightweight flange patterns (transportation/bulk-handling) AND ASME Class 125/150 flanges',
    bodyMaterials: 'Ductile iron, PVF-coated ductile iron, ENC nickel-coated ductile iron',
    stemMaterials: '416 stainless, 316 stainless, Monel',
    discMaterials:
      '316 SS, Monel, aluminium, bronze, ductile iron, ENC nickel-plated ductile iron, vented, PVF-coated ductile iron',
    seatElastomers:
      'Buna-N, Black Neoprene, Hypalon, Viton, EPDM (peroxide-cured), Natural Rubber, White Neoprene, ETM-30230, Fluorosteam',
    temperatureRange: '−30°F to +300°F (−34°C to +149°C) — depends on selected elastomer',
    endOfLineService: false,
    actuationOptions:
      'Lever handles, worm-gear operators, Series DR pneumatic actuators',
    flowCoefficientMax: '145 (2″) → 7,500 (12″)',
    oneLiner:
      'Short-neck wafer butterfly valve with body notches for popular lightweight flange patterns — designed for bulk material handling, transportation, and tank-truck service. Self-centres in ASME Class 125/150 flanges as well.',
    introParagraph:
      'The DEMCO Series NE-D is a short-neck wafer butterfly valve with body notches engineered to fit popular lightweight flange patterns, making it the natural choice for bulk material handling and the transportation industry — petroleum tank trucks, dry-bulk tankers, mobile blending units, and similar duty. The body also self-centres in standard ASME Class 125/150 flanges, so the same valve covers both lightweight and standard installations. Available wafer-only in sizes 2″ through 12″, with the full DEMCO range of disc materials and seat elastomers and three drop-tight shut-off ratings.',
    applications: [
      'Petroleum tank-truck loading and discharge',
      'Dry-bulk tanker discharge',
      'Cement and powder bulk-handling',
      'Agricultural mobile equipment',
      'Marine bulk-loading terminals',
      'Mobile blending and dosing units',
      'Industrial vacuum-truck service',
    ],
    notableFeatures: [
      'Body notches fit popular lightweight flange patterns — tank-truck and bulk-handling installations',
      'Also self-centres in ASME Class 125/150 flanges — single SKU for mixed-fleet operators',
      'PVF-coated ductile iron disc and body options for hydrocarbon service',
      'Vented disc option for extreme-temperature service',
      'Hard-backed cartridge seat — field-replaceable with no special tools',
      'Triple stem seal + dry stem journal',
      'MSS SP-25 marking is standard',
    ],
    basePartNumberExamples: [
      '22181 (2″, 200 psi)',
      '22185 (6″, 200 psi)',
      '22134 (8″, 200 psi)',
      '22136 (12″, 200 psi)',
      '22283 (6″, 285 psi)',
      '22289 (6″, 50 psi)',
    ],
    howToOrderTable: HOW_TO_ORDER_SMALL,
    companionAccessories: [
      'IH-VAL-BFLY-HDL-10P',
      'IH-VAL-BFLY-HDL-2P',
      'IH-VAL-BFLY-DR-DA',
      'IH-VAL-BFLY-DR-SR',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-NEIT',
    title: 'DEMCO Series NEI-T Teflon-Lined Sanitary Butterfly Valve, 2″–10″',
    series: 'NEI-T',
    bodyConfiguration: 'Wafer (short-neck) and Lug (long-neck)',
    sizeRange: '2″ – 10″ (50 – 250 mm)',
    shutoffRatings: '150 psi (drop-tight)',
    isSanitary: true,
    endConnectionStandard: 'ASME Class 125/150 flanges',
    bodyMaterials:
      'Ductile iron, gray iron (lug long-neck), aluminium bronze, carbon steel, aluminium (wafer only), 316 stainless steel, Hastelloy C',
    stemMaterials: '316 stainless, Monel, Hastelloy C',
    discMaterials: '316 SS (polished or unpolished), Alloy 20, Hastelloy C',
    seatElastomers:
      'Buna-N/Teflon (peroxide-cured), EPDM/Teflon (peroxide-cured or sulfur-cured) — virgin Teflon liner overlaying and bonded to elastomer cushion (Buna-N or EPT)',
    temperatureRange: '+20°F to +275°F (−7°C to +135°C) — Teflon liner inert across the range',
    endOfLineService: false,
    actuationOptions:
      'Sanitary or corrosion-resistant lever handles, weatherproof worm-gear operators, Series DR pneumatic actuators',
    flowCoefficientMax: '145 (2″) → 5,000 (10″)',
    oneLiner:
      'Teflon-lined butterfly valve for "clean lines" in food and beverage plants and for highly corrosive chemical service. Inert, aseptic, non-stick virgin Teflon liner.',
    introParagraph:
      'The DEMCO Series NEI-T is a Teflon-lined butterfly valve, ideal for "clean lines" in food and beverage plants and for highly corrosive chemical service where the inert, aseptic and non-stick character of Teflon is required. The seat consists of a virgin Teflon liner overlaying and bonded to an elastomer cushion (Buna-N or EPT) which provides resilience for sealing. Available in wafer (short-neck) and lug (long-neck) styles, sizes 2″ through 10″, with the broadest range of corrosion-resistant body and disc materials of any DEMCO series including Hastelloy C and Alloy 20. 150 psi drop-tight shut-off across all sizes.',
    applications: [
      'Aseptic food and beverage clean-in-place (CIP) loops',
      'Pharmaceutical purified-water and process service',
      'Chemical processing — strong acids, caustics, solvents',
      'Pulp and paper bleach plant',
      'Specialty cosmetics and personal-care lines',
      'Semiconductor ultra-pure water and chemical handling',
    ],
    notableFeatures: [
      'Virgin Teflon (PTFE) liner — inert, aseptic, non-stick',
      'Teflon overlays a Buna-N or EPT elastomer cushion for resilience',
      'Hastelloy C and Alloy 20 body / disc options for the most aggressive chemical service',
      'Polished or unpolished 316 SS disc for sanitary or chemical applications',
      'Wafer (short-neck) for between-flange installation; lug (long-neck) for clearance over insulation',
      '150 psi drop-tight closure across all sizes',
      'Same trim-handle range as the NE-I Sanitary series — bronze hub with SS fasteners for caustic wash-down',
    ],
    basePartNumberExamples: [
      '24680 (2″, 150 psi)',
      '24681 (2½″, 150 psi)',
      '24682 (3″, 150 psi)',
      '24683 (4″, 150 psi)',
      '24684 (6″, 150 psi)',
      '24685 (8″, 150 psi)',
      '24686 (10″, 150 psi)',
    ],
    howToOrderTable: HOW_TO_ORDER_SMALL,
    companionAccessories: [
      'IH-VAL-BFLY-HDL-MEM',
      'IH-VAL-BFLY-WGO',
      'IH-VAL-BFLY-DR-DA',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-NFC',
    title: 'DEMCO Series NF-C Large-Bore Butterfly Valve, 14″–36″',
    series: 'NF-C',
    bodyConfiguration: 'Wafer and Lug',
    sizeRange: '14″ – 36″ (350 – 900 mm)',
    shutoffRatings:
      '150 psi (standard) and 50 psi (low-torque) for 14″–36″; Throttling for 14″–24″',
    isSanitary: false,
    endConnectionStandard:
      'ASME Class 125/150 flanges (14″–24″); ASME Class 150 Series A and MSS SP-44 (30″–36″)',
    bodyMaterials:
      'Ductile iron lug, cast iron wafer, carbon steel lug, 316 stainless steel lug, ENC nickel-plated, PVC-coated ductile iron',
    stemMaterials: '416 stainless, 316 stainless, Monel',
    discMaterials:
      '316 SS, Monel, aluminium bronze, ductile iron (nickel-plated), PVF-coated ductile iron, bronze (30″–36″ option)',
    seatElastomers: 'Buna-N, Black Neoprene, Hypalon, Viton, EPDM',
    temperatureRange: '−30°F to +300°F (−34°C to +149°C) — depends on elastomer',
    endOfLineService: true,
    actuationOptions:
      'Weatherproof worm-gear operators (handwheel/chainwheel/square nut) — gear operator recommended on 14″ and larger; Series DR pneumatic actuators',
    flowCoefficientMax: '10,000 (14″) → 70,000 (36″)',
    oneLiner:
      'Large-bore (14″–36″) resilient-seated butterfly valve for high-volume isolation in power, water/wastewater, mining, and large process service.',
    introParagraph:
      'The DEMCO Series NF-C extends the DEMCO butterfly-valve product line into large-bore service: 14″ through 36″ (350 mm through 900 mm). Wafer and lug bodies are available across the full range, and the 14″–24″ sizes carry the same hard-backed cartridge seat, dry-stem-journal and triple-stem-seal architecture as the 2″–12″ DEMCO product line. Sizes 30″ and 36″ use a robust upper-and-lower bronze bearing arrangement plus thrust collar to handle the dynamic loads of large-bore service. All sizes are supplied with a worm-gear operator as standard (recommended for 14″ and larger), with Series DR pneumatic actuation available for automated installations. Drop-tight shut-off at 150 psi standard, with 50 psi and throttling-rated options for low-torque service.',
    applications: [
      'Power-plant cooling-water mains',
      'Water- and waste-water treatment plants',
      'Mining tailings and concentrate handling',
      'Petroleum and petrochemical low-pressure mains',
      'HVAC chilled-water and condenser-water mains',
      'Pulp and paper mill stock and white-water lines',
      'Marine ballast and bilge mains',
    ],
    notableFeatures: [
      'Sizes 14″–36″ (350–900 mm) — the large-bore companion to the NE-C/NE-I/NE-D/NEI-T 2″–12″ product lines',
      'Same hard-backed cartridge seat and triple stem seal as the small-size DEMCO valves on 14″–24″',
      'Upper-and-lower bronze bearings plus thrust collar on 30″ and 36″ for large-bore stability',
      '30″ and 36″ flanged pattern conforms to ASME Class 150 Series A and MSS SP-44',
      'Worm-gear operator standard on every 14″ and larger valve (manual lever not practical at this size)',
      'Series DR pneumatic actuators (EDA350 → PSA4004) cover the torque range for full automation',
      'Lug-body variant supports end-of-line liquid service to 150 psi with downstream piping removed',
      'MSS SP-25 marking is standard',
    ],
    basePartNumberExamples: [
      '23820 (14″, 150 psi)',
      '23822 (18″, 150 psi)',
      '23824 (24″, 150 psi)',
      '24141 (30″, 150 psi)',
      '24357 (36″, 150 psi)',
      '24446 (16″, throttling)',
    ],
    howToOrderTable: HOW_TO_ORDER_NFC,
    companionAccessories: [
      'IH-VAL-BFLY-WGO',
      'IH-VAL-BFLY-DR-DA',
      'IH-VAL-BFLY-DR-SR',
      'IH-VAL-BFLY-STMX',
    ],
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 2 — ACCESSORIES (8 products)
// ═════════════════════════════════════════════════════════════════════════════

type AccessoryInput = {
  sku: string
  title: string
  accessoryType: string
  compatibleValveSeries: string
  compatibleValveSizes: string
  actuationMethod: string
  trimOptions: string
  torqueOutputMax: string
  supplyPressureRange: string
  mountingStandard: string
  weatherproofing: string
  oneLiner: string
  introParagraph: string
  features: string[]
  applications: string[]
  whatItDoes: string
  configurationDetail: string
  partNumberExamples: string[]
}

function buildAccessoryDescription(g: AccessoryInput): string {
  const partNumberRows = g.partNumberExamples
    .map((p) => `<li><code>${escape(p)}</code></li>`)
    .join('')

  return `<p>${escape(g.introParagraph)}</p>
<h3>What it does</h3>
<p>${escape(g.whatItDoes)}</p>
<h3>Compatibility</h3>
<ul>
<li><strong>Compatible valve series:</strong> ${escape(g.compatibleValveSeries)}</li>
<li><strong>Compatible valve sizes:</strong> ${escape(g.compatibleValveSizes)}</li>
<li><strong>Mounting standard:</strong> ${escape(g.mountingStandard)}</li>
</ul>
<h3>Configuration &amp; trim</h3>
<p>${escape(g.configurationDetail)}</p>
<ul>
<li><strong>Actuation method:</strong> ${escape(g.actuationMethod)}</li>
<li><strong>Trim options:</strong> ${escape(g.trimOptions)}</li>
<li><strong>Maximum torque output:</strong> ${escape(g.torqueOutputMax)}</li>
<li><strong>Supply / input pressure range:</strong> ${escape(g.supplyPressureRange)}</li>
<li><strong>Weatherproofing / environmental:</strong> ${escape(g.weatherproofing)}</li>
</ul>
<h3>Engineered features</h3>
${listToHtml(g.features)}
<h3>Typical applications</h3>
${listToHtml(g.applications)}
<h3>How to order</h3>
<p><strong>For your RFQ, please specify:</strong> the DEMCO valve series and size you intend to mount this accessory on, the trim level required (standard, corrosion-resistant or sanitary where applicable), and any environmental requirements (chemical exposure, temperature, IP rating). Indus Hydraulics will return an estimate against the corresponding DEMCO base part number.</p>
<p>Example DEMCO base part numbers in this product family:</p>
<ul>${partNumberRows}</ul>
<h3>Companion products</h3>
<p>This accessory is part of the DEMCO butterfly-valve product family. See the matching valve series in <code>IH-VAL-BFLY-NEC</code>, <code>IH-VAL-BFLY-NEI</code>, <code>IH-VAL-BFLY-NEI-SAN</code>, <code>IH-VAL-BFLY-NED</code>, <code>IH-VAL-BFLY-NEIT</code> and <code>IH-VAL-BFLY-NFC</code>.</p>`
}

function buildAccessoryFaqs(g: AccessoryInput): FaqEntry[] {
  return [
    {
      q: `Which DEMCO valve series is the ${g.accessoryType} compatible with?`,
      a: `${g.compatibleValveSeries}, in sizes ${g.compatibleValveSizes}. The DEMCO top-flange standard means this accessory will field-mount to any compatible valve without modification. With the optional "utility top" stem, the underlying valve also accepts third-party actuators — useful when replacing a competitive valve in an existing automated installation.`,
    },
    {
      q: 'Can this accessory be retro-fitted to a valve already in service?',
      a: 'Yes. DEMCO valve actuation is fully field-changeable: handles, gear operators and actuators all interchange on the same DEMCO top flange. Open the valve, remove the existing actuation, fit the new accessory to the top flange, re-secure the fasteners, and the valve is ready to return to service. No special tools are required.',
    },
    {
      q: 'What trim level should I order?',
      a: `${g.trimOptions}. Standard trim is appropriate for general industrial service. Corrosion-resistant trim uses stainless-steel parts and fasteners throughout — recommended for marine, offshore, water-treatment, and any environment subject to spray or wash-down. Sanitary trim (where applicable) uses bronze-and-stainless construction permitting caustic wash-down for food, beverage and pharmaceutical service.`,
    },
    {
      q: 'How do I size this accessory for my valve?',
      a: `Sizing is driven by the valve's required operating torque, which depends on size, pressure rating, seat elastomer and service condition (wet vs dry). Reference the DEMCO valve-torque tables on the corresponding valve PDP, then cross-reference against the torque output of this accessory at your supply pressure (for actuators) or your input torque limit (for manual operators). Indus Hydraulics will validate the sizing during quote review — supply your valve series, size, shut-off rating and service condition on the RFQ and we will confirm the right accessory model.`,
    },
    {
      q: 'Is this accessory weatherproof / explosion-proof?',
      a: `${g.weatherproofing}. For NEMA 7 explosion-proof installations, please call out the requirement explicitly on your RFQ — the corresponding NEMA-7 variants (where available) carry a different DEMCO part number suffix.`,
    },
    {
      q: 'What is the country of origin and lead time?',
      a: 'DEMCO accessories are manufactured in the USA by Cooper Cameron Valves (now Cameron Valves & Measurement, an SLB business). Standard lead time from Indus Hydraulics is 14 days for stocked configurations and 4–6 weeks for non-stocked configurations — the exact lead time will be confirmed on your estimate.',
    },
  ]
}

const ACCESSORIES: AccessoryInput[] = [
  {
    sku: 'IH-VAL-BFLY-HDL-10P',
    title: 'DEMCO 10-Position Locking Handle for Butterfly Valves, 2″–12″',
    accessoryType: '10-position locking handle',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T (any 2″–12″ DEMCO butterfly valve)',
    compatibleValveSizes: '2″–4″ (small), 5″–6″ (medium), 8″–12″ (large) — three frame sizes',
    actuationMethod: 'Manual lever with 10-position locking latch',
    trimOptions: 'Standard, Corrosion-Resistant (stainless throughout), Sanitary (bronze hub + stainless fasteners)',
    torqueOutputMax: 'Hand-operable across the 2″–6″ range; gear operator recommended for 8″–12″',
    supplyPressureRange: 'N/A (manual)',
    mountingStandard: 'DEMCO top-flange standard — direct mount to the valve flatted "double-D" upper stem',
    weatherproofing: 'Outdoor-rated; SS-trim variant for marine and wash-down service',
    oneLiner: '10-position locking lever handle for DEMCO butterfly valves — the volume manual operator for general industrial isolation duty.',
    introParagraph:
      'The DEMCO 10-position locking lever handle is the volume manual operator for the 2″–12″ DEMCO butterfly-valve range. Ten positive locking detents from full-closed to full-open allow flow throttling at fixed positions, with positive latch engagement at every detent. Available in three trim levels — standard (zinc-plated steel parts on a ductile-iron handle), corrosion-resistant (stainless throughout), and sanitary (bronze hub with stainless fasteners) — across three frame sizes (2″–4″, 5″–6″, 8″–12″). Direct mount to the DEMCO top flange via the flatted "double-D" upper stem.',
    features: [
      'Ten positive locking detents from closed to full open',
      'Positive latch engagement at every detent — handle cannot drift under flow forces',
      '0.25″ padlock hole for security lockout',
      'Three trim levels: standard / corrosion-resistant / sanitary',
      'Three frame sizes: 2″–4″, 5″–6″, 8″–12″',
      'Direct field-mount to DEMCO top flange — no spool-piece adapter',
      'Compatible with the optional "utility top" stem for installation on competitive valves',
    ],
    applications: [
      'General industrial isolation and throttling',
      'Process plant manual flow control',
      'Marine and offshore manual valve operation (SS-trim variant)',
      'Food and beverage utility lines (sanitary-trim variant)',
      'Lockout / tagout safety isolation',
    ],
    whatItDoes: 'Manually rotates the valve disc 0–90° between full-closed and full-open with ten intermediate locking detents, providing positive flow control without an external actuator or gear operator.',
    configurationDetail:
      'Specify trim level (standard, corrosion-resistant, sanitary) and frame size (matching your valve size). Sanitary trim uses bronze handle hub with stainless-steel fasteners for caustic wash-down; standard trim uses zinc-plated steel parts on a ductile-iron handle.',
    partNumberExamples: [
      '24227 (Std, 2″–4″)',
      '24228 (Std, 5″–6″)',
      '24229 (Std, 8″)',
      '24230 (Std, 10″)',
      '24231 (Std, 12″)',
      '22319 (Sanitary, 2″–4″)',
      '22323 (Sanitary, 12″)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-HDL-2P',
    title: 'DEMCO 2-Position Locking Handle for Butterfly Valves, 2″–12″',
    accessoryType: '2-position locking handle',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T (any 2″–12″ DEMCO butterfly valve)',
    compatibleValveSizes: '2″–4″, 5″–6″, 8″–12″',
    actuationMethod: 'Manual lever with 2-position locking latch (full-closed and full-open)',
    trimOptions: 'Standard, Corrosion-Resistant (stainless throughout), Sanitary (bronze hub + stainless fasteners)',
    torqueOutputMax: 'Hand-operable across the 2″–6″ range; gear operator recommended for 8″–12″',
    supplyPressureRange: 'N/A (manual)',
    mountingStandard: 'DEMCO top-flange standard',
    weatherproofing: 'Outdoor-rated; SS-trim variant for marine and wash-down service',
    oneLiner: '2-position (open/closed only) locking lever handle for DEMCO butterfly valves — the simple manual operator for on/off isolation duty.',
    introParagraph:
      'The DEMCO 2-position locking lever handle is the simple manual operator for on/off isolation duty. Two positive locking detents — full-closed and full-open — with positive latch engagement at each. Available in the same three trim levels as the 10-position handle (standard, corrosion-resistant, sanitary) and three frame sizes. Selected when the application requires only on/off operation and an intermediate-position handle would risk operator-induced throttling.',
    features: [
      'Two positive locking detents — full-closed and full-open only',
      'Positive latch engagement at each detent',
      '0.25″ padlock hole for security lockout',
      'Three trim levels: standard / corrosion-resistant / sanitary',
      'Three frame sizes: 2″–4″, 5″–6″, 8″–12″',
      'Direct field-mount to DEMCO top flange',
      'Selected when operator-induced throttling must be prevented',
    ],
    applications: [
      'Critical on/off isolation (where throttling must be physically prevented)',
      'Pump suction/discharge isolation',
      'Tank-farm bulk-loading lines',
      'Safety-shutdown manual block valves',
      'Loadout and offloading manual block service',
    ],
    whatItDoes: 'Manually rotates the valve disc between full-closed (0°) and full-open (90°) with positive locking at each end position only — no intermediate detents, eliminating operator-induced throttling.',
    configurationDetail:
      'Specify trim level (standard, corrosion-resistant, sanitary) and frame size matching your valve size. Same construction as the 10-position handle but with a 2-position throttle plate instead of a 10-detent plate.',
    partNumberExamples: [
      '24232 (Std, 2″–4″)',
      '24233 (Std, 5″–6″)',
      '24234 (Std, 8″)',
      '22324 (Sanitary, 2″–4″)',
      '22328 (Sanitary, 12″)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-HDL-MEM',
    title: 'DEMCO Memory-Stop Throttling Handle for Butterfly Valves, 2″–12″',
    accessoryType: 'Memory-stop throttling handle',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T (any 2″–12″ DEMCO butterfly valve)',
    compatibleValveSizes: '2″–4″, 5″–6″, 8″–12″',
    actuationMethod: 'Manual lever with infinitely adjustable throttle position and lock-nut memory stop',
    trimOptions: 'Standard, Corrosion-Resistant, Sanitary',
    torqueOutputMax: 'Hand-operable across the 2″–6″ range; gear operator recommended for 8″–12″',
    supplyPressureRange: 'N/A (manual)',
    mountingStandard: 'DEMCO top-flange standard',
    weatherproofing: 'Outdoor-rated; SS-trim variant for marine and wash-down service',
    oneLiner: 'Infinitely adjustable throttling handle with memory-stop setting — for manual flow balancing where the open position must be repeatable.',
    introParagraph:
      'The DEMCO memory-stop throttling handle provides infinitely adjustable manual throttling between full-closed and full-open, with a lock-nut memory stop that holds a preset open position once balanced. Used for manual flow balancing in branch lines, hose-station service, and any application where the operator must return to a repeatable open position after closing. The lock nut is set with a wing-nut-and-carriage-bolt arrangement so the memory stop can be adjusted in service without removing the handle.',
    features: [
      'Infinitely adjustable position between 0° (closed) and 90° (open)',
      'Lock-nut memory stop preserves a preset open position',
      'Wing-nut throttling tab for in-service adjustment of the memory stop',
      'Throttle plate with carriage bolt and wing nut for tool-free recalibration',
      'Three trim levels: standard / corrosion-resistant / sanitary',
      'Three frame sizes: 2″–4″, 5″–6″, 8″–12″',
      'Direct field-mount to DEMCO top flange',
    ],
    applications: [
      'Manual flow balancing on branch lines',
      'Hose-station and wash-down outlets requiring repeatable flow',
      'Process trim adjustment',
      'Building HVAC manual balancing',
      'Cooling-water flow trim',
    ],
    whatItDoes: 'Provides infinitely adjustable manual throttling with a memory stop that returns the valve to a preset open position after each closure — combines flow-balancing capability with the simple operation of a manual lever.',
    configurationDetail:
      'Specify trim level and frame size matching your valve. The memory stop is set in the field by loosening the wing nut, rotating the handle to the desired throttle position, and re-tightening the wing nut. The valve can subsequently be closed and re-opened to the memory stop without resetting.',
    partNumberExamples: [
      '24252 (Std, 2″–4″)',
      '24253 (Std, 5″–6″)',
      '24254 (Std, 8″)',
      '22329 (Sanitary, 2″–4″)',
      '22333 (Sanitary, 12″)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-HDL-SQ',
    title: 'DEMCO Square-Nut Handle for Butterfly Valves, 2″–12″',
    accessoryType: 'Square-nut operator',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T (any 2″–12″ DEMCO butterfly valve)',
    compatibleValveSizes: '2″–4″, 5″–6″, 8″–12″',
    actuationMethod: '2″ square-nut operator (operated with a buried-service "T-key" wrench)',
    trimOptions: 'Standard (ductile-iron square-nut hub, steel throttle plate)',
    torqueOutputMax: 'Wrench-operable across the 2″–6″ range; gear operator recommended for 8″–12″',
    supplyPressureRange: 'N/A (manual)',
    mountingStandard: 'DEMCO top-flange standard',
    weatherproofing: 'Outdoor-rated; AWWA-style buried-service operator',
    oneLiner: '2″ square-nut operator for buried, kerb-stop and below-grade DEMCO butterfly valve installations — operated with a T-key wrench.',
    introParagraph:
      'The DEMCO square-nut operator replaces the lever handle with a 2″ × 2″ × 1¼″ ductile-iron square nut, mounted on a 2.0″ square × 2.25″ tall hub with a 1.25″ pedestal. Operated with a buried-service "T-key" wrench from grade level. The standard configuration for buried, kerb-stop, and below-grade DEMCO butterfly-valve installations in water- and waste-water service. Available in standard trim only — the application doesn\'t typically require corrosion-resistant or sanitary trim levels.',
    features: [
      '2″ × 2″ × 1¼″ ductile-iron square nut on a 2.0″ tall hub',
      'AWWA-style buried-service operator',
      'Operated with a standard T-key valve wrench',
      'Three frame sizes: 2″–4″, 5″–6″, 8″–12″',
      'Direct field-mount to DEMCO top flange',
      'Standard trim only — designed for buried/below-grade service',
    ],
    applications: [
      'Buried water-distribution mains',
      'Kerb-stop isolation valves',
      'Below-grade fire-water mains',
      'Underground process and utility lines',
      'Manhole-access valve installations',
    ],
    whatItDoes: 'Replaces the manual lever handle with a 2″ square-nut operator for buried, below-grade and confined-access installations — operated from grade with a T-key valve wrench rather than direct hand contact.',
    configurationDetail:
      'Specify frame size matching your valve. The square nut is fixed-torque only — for repeatable throttle positions, use the memory-stop handle instead.',
    partNumberExamples: [
      '23356 (2″–4″)',
      '23357 (5″–6″)',
      '23358 (8″)',
      '23359 (10″)',
      '22360 (12″)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-WGO',
    title: 'DEMCO Worm-Gear Operator for Butterfly Valves, 2″–36″',
    accessoryType: 'Manual worm-gear operator',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T, NF-C (full DEMCO butterfly-valve range)',
    compatibleValveSizes: '2″ – 36″ (50 – 900 mm)',
    actuationMethod: 'Manual hand-operated worm-gear with self-locking action',
    trimOptions: 'Gray-iron weatherproof case with ductile-iron gear and hardened-steel worm; bronze bearings; green-enamel exterior (white epoxy / coal-tar epoxy / inorganic-zinc primer available special order)',
    torqueOutputMax:
      '46 ft-lb input → 30:1 ratio (2″–6″); 65 ft-lb → 48:1 (8″–16″); 98 ft-lb → 57:1 (18″–20″); 164 ft-lb → 60:1 (24″); 104 ft-lb → 316:1 (30″); 174 ft-lb → 240:1 (36″)',
    supplyPressureRange: 'N/A (manual)',
    mountingStandard: 'DEMCO top-flange standard — direct mount on 2″–24″; large-bore mounting kit on 30″–36″',
    weatherproofing: 'Gray-iron weatherproof case and cover; permanently lubricated; position indicator standard on every model',
    oneLiner:
      'Self-locking weatherproof worm-gear operator — the standard manual operator for 8″ and larger DEMCO butterfly valves; available with handwheel, chain-wheel, square-nut or crank input.',
    introParagraph:
      'The DEMCO weatherproof worm-gear operator is the standard manual operator for 8″ and larger DEMCO butterfly valves and is recommended on every NF-C (14″–36″) installation. The gray-iron case and cover enclose a ductile-iron gear and hardened-steel worm supported on bronze bearings, with the gearing permanently lubricated for the life of the valve. Self-locking in all positions — adjustment screws stop travel at the open and closed positions, and a position indicator is standard on every model. Available with handwheel, chain-wheel, square-nut, or crank input. Standard external coating is green enamel; white epoxy, coal-tar epoxy and inorganic-zinc primer are available on special order for offshore or buried-service applications.',
    features: [
      'Self-locking in every position — manual operators cannot back-drive under flow forces',
      'Gray-iron weatherproof case and cover',
      'Ductile-iron gear and hardened-steel worm with bronze bearings',
      'Permanently lubricated for valve life',
      'Position indicator standard on every model',
      'Travel stops adjust to set open and closed positions',
      'Optional adjustable memory stop for "balance return" to a preset open position after closing',
      'Four input options: handwheel, chain-wheel, square-nut, crank',
      'Five gear ratios across 2″–36″ — 30:1, 48:1, 57:1, 60:1, 240:1, 316:1',
      'Special-order coatings: white epoxy, coal-tar epoxy, inorganic-zinc primer',
    ],
    applications: [
      '8″ and larger DEMCO butterfly-valve installations (where manual lever is not practical)',
      'Power-plant cooling-water and condenser-water mains',
      'Water- and waste-water treatment',
      'Mining tailings and concentrate handling',
      'Marine ballast and bilge mains',
      'Buried-service installations (square-nut or chain-wheel input + special-order coating)',
    ],
    whatItDoes: 'Reduces operator input torque by 30:1 to 316:1 — converting a manageable hand-wheel input into the high stem torque required to operate large butterfly valves. Self-locking action holds the valve in any position without back-drive.',
    configurationDetail:
      'Specify the valve series and size you intend to mount the gear operator on (DEMCO selects the right gear ratio automatically), the input style (handwheel, chain-wheel, square-nut, crank), and the chain length in feet for chain-wheel input (suffix = length, e.g. 4462-025 for 25 ft of chain). Chains are ordered separately. For chain-wheel installations, mount the valve upside-down to ensure pipe clearance and visual contact with the position indicator.',
    partNumberExamples: [
      '22622 (2″–6″, handwheel)',
      '22623 (8″–12″, handwheel)',
      '2060229 (14″, gear-op assy)',
      '2060231 (18″–20″, gear-op assy)',
      '2060332 (30″, gear-op assy)',
      '2060334 (36″, gear-op assy)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-DR-DA',
    title: 'DEMCO Series DR Double-Acting Pneumatic Actuator for Butterfly Valves, 2″–24″',
    accessoryType: 'Double-acting pneumatic piston actuator',
    compatibleValveSeries: 'NE-C, NE-I, NE-D, NF-C (2″–24″ — automated installations)',
    compatibleValveSizes: '2″ – 24″ (50 – 600 mm)',
    actuationMethod: 'Double-acting opposed-piston pneumatic actuator with integral gear racks (rotary motion)',
    trimOptions:
      'Aluminium body, pistons and end caps; hard-anodised Aluminium Alloy 70-75 central drive shaft; plated-steel fasteners; Buna-N seals; carbon-filled Teflon guide bands; flatted stem adapter (2″–12″) or keyed stem (14″–24″)',
    torqueOutputMax:
      'EDA40: 620 in-lb @ 120 psi · EDA200: 3,071 in-lb · EDA350: 5,337 in-lb · EDA600: 9,069 in-lb · EDA950: 13,537 in-lb · EDA1600: 22,379 in-lb · PDA2500: 35,912 in-lb · PDA4000: 60,623 in-lb',
    supplyPressureRange: '40 – 120 psi air or hydraulic',
    mountingStandard: 'Direct mount via splined aluminium stem adapter (most popular sizes); aluminium adapter plate (closed-coupled) for non-direct sizes; steel brackets and coupling kit for the largest valves',
    weatherproofing: 'Totally enclosed with gaskets — weatherproof body construction (NEMA 4 / NEMA 7 enclosures available for accessories)',
    oneLiner:
      'Compact high-torque pneumatic actuator with two opposed pistons and integral gear racks — fail-last-position double-acting design for the most economical valve automation.',
    introParagraph:
      'The DEMCO Series DR double-acting pneumatic actuator is the most economical Series-DR variant: two opposed pistons with integral gear racks coupled to a common central drive shaft, requiring either air or hydraulic pressure on either side of the pistons to open or close the valve (fail-last-position). The body, pistons and end caps are aluminium; the central drive shaft is hard-anodised Aluminium Alloy 70-75. Carbon-filled Teflon guide bands support the pistons to eliminate metal-to-metal contact during operation, so piston O-rings are dedicated to sealing rather than bearing duty. Mounting is direct via a splined aluminium stem adapter on the 2″–12″ valves (NE-C/NE-I/NE-D) and via a keyed stem on the 14″–24″ NF-C valves. Available in 10 frame sizes — EDA40 through PDA4000.',
    features: [
      'Two opposed pistons with integral gear racks — high torque in a compact envelope',
      'Hard-anodised Aluminium Alloy 70-75 central drive shaft',
      'Carbon-filled Teflon guide bands eliminate metal-to-metal contact',
      'Buna-N seals; totally enclosed with gaskets — weatherproof',
      'Flatted-stem direct-mount on 2″–12″; keyed-stem mount on 14″–24″',
      'Fail-last-position — pressure on either side opens or closes the valve',
      '10 frame sizes covering 204 in-lb to 60,623 in-lb torque output',
      'Compatible with DEMCO solenoid valves, position-indicator switches, pneumatic positioners and exhaust metering valves (sold separately)',
    ],
    applications: [
      'Automated process-plant isolation valves',
      'Cooling-water and chilled-water automation',
      'Tank-farm batch-control valves',
      'Pump-discharge automation',
      'CIP / SIP automated isolation (sanitary services — pair with a sanitary valve)',
      'Power-plant condenser and feed-water automation',
    ],
    whatItDoes: 'Converts pneumatic (air) or hydraulic supply pressure into a 90° rotary stroke that opens or closes the valve under remote command. Double-acting means pressure is required to move the valve in either direction — fail-last-position behaviour on supply loss.',
    configurationDetail:
      'Specify the valve series and size you intend to mount the actuator on, the supply medium (air or hydraulic), the available supply pressure (40, 60, 80, 100, or 120 psi), and the orientation (flow-axis closed/open relative to the actuator body). Indus Hydraulics will size the actuator against the valve\'s wet-opening torque table and confirm the right model — the part number suffix encodes valve size, orientation and accessories.',
    partNumberExamples: [
      'J024872-01 (EDA40)',
      'J024872-02 (EDA65)',
      'J024872-03 (EDA100)',
      'J024872-04 (EDA200)',
      'J024872-05 (EDA350)',
      'J024872-08 (PDA1100)',
      'J024872-10 (PDA4000)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-DR-SR',
    title: 'DEMCO Series DR Spring-Return Pneumatic Actuator for Butterfly Valves, 2″–24″',
    accessoryType: 'Spring-return pneumatic piston actuator',
    compatibleValveSeries: 'NE-C, NE-I, NE-D, NF-C (2″–24″ — automated fail-safe installations)',
    compatibleValveSizes: '2″ – 24″ (50 – 600 mm)',
    actuationMethod: 'Spring-return opposed-piston pneumatic actuator (fail-open or fail-closed on supply loss)',
    trimOptions:
      'Aluminium body, pistons and end caps; hard-anodised drive shaft; compression spring(s) sized to the application; plated-steel fasteners; Buna-N seals; declutchable manual override available on size 40 → 4004',
    torqueOutputMax:
      'ESA40 spring-set 5: 322 in-lb @ 120 psi · ESA350: 4,141 in-lb · ESA600: 8,364 in-lb · ESA950: 12,518 in-lb · ESA1600: 20,668 in-lb · PSA2500: 28,401 in-lb (14-spring set) · PSA4000: 47,613 in-lb (12-spring set) · PSA4004: 47,613 in-lb',
    supplyPressureRange: '40 – 120 psi air',
    mountingStandard: 'Same as Series DR double-acting — direct splined-stem mount (2″–12″) or keyed stem (14″–24″)',
    weatherproofing: 'Totally enclosed with gaskets; declutchable manual override option allows the handwheel to hold the valve in its last position until the actuator returns to automatic',
    oneLiner:
      'Spring-return pneumatic actuator with selectable spring sets — fails to a predetermined safe position on supply-air loss. The standard choice for safety-critical automated valve installations.',
    introParagraph:
      'The DEMCO Series DR spring-return pneumatic actuator uses compression spring(s) to move the valve in one direction, with air pressure moving it in the opposite direction. On loss of supply air, the spring drives the valve to a predetermined safe position — fail-open or fail-closed depending on the spring orientation. The standard choice for safety-critical automated valve installations: emergency shutdown valves, blow-down lines, fire-water valves, and any application where loss of control air must drive the valve to a defined position. Six spring-set arrangements (sets 2–6 on ESA40–ESA1600; sets 8–14 on PSA2500–PSA4004) tune the spring torque to the application, with declutchable manual override available across the full range.',
    features: [
      'Compression-spring fail-safe on loss of supply air',
      'Six spring-set arrangements — tune spring torque to the application',
      'Spring-Set #2 (mid-spring only) → Spring-Set #6 (full spring stack)',
      'Declutchable manual override — handwheel engages to hold valve in last position when actuator returns to automatic',
      'Same aluminium-body construction as the double-acting DR series',
      'Same Carbon-filled Teflon guide bands and Buna-N seals',
      'Totally enclosed with gaskets — weatherproof',
      'Frame sizes ESA40 → PSA4004 covering 322 in-lb to 47,613 in-lb torque',
      'Compatible with DEMCO solenoid valves, position-indicator switches, pneumatic positioners and speed-control valves',
    ],
    applications: [
      'Emergency shutdown (ESD) automated isolation',
      'Fire-water and deluge-system valves',
      'Blow-down and depressurisation valves',
      'Process safety automated isolation',
      'Tank-farm fail-safe block valves',
      'Compressor station fail-safe isolation',
    ],
    whatItDoes: 'Converts pneumatic supply pressure into a 90° rotary stroke against a calibrated compression spring. On loss of supply air, the spring drives the valve to a predetermined safe position (fail-open or fail-closed) — ensuring the valve fails to a defined state under any control-system fault.',
    configurationDetail:
      'Specify the valve series and size, the available supply pressure (40, 60, 80, 100, 120 psi), the desired fail position (fail-open or fail-closed), and the spring set (#2–#6 for ESA series; #8–#14 for PSA series — Indus Hydraulics will recommend the spring set against your wet-opening torque). Optionally specify a declutchable manual override and any required NEMA-7 explosion-proof solenoid or position switch.',
    partNumberExamples: [
      'J024873-5-01 (ESA40, spring-set 5)',
      'J024873-5-04 (ESA200, spring-set 5)',
      'J024873-5-05 (ESA350, spring-set 5)',
      'J024873-5-26 (ESA600, spring-set 5)',
      'J024873-7-09 (PSA2500, spring-set 14)',
      'J024873-7-11 (PSA4004, spring-set 14)',
    ],
  },

  {
    sku: 'IH-VAL-BFLY-STMX',
    title: 'DEMCO Stem Extension for Butterfly Valves, 2″–24″',
    accessoryType: 'Stem extension assembly',
    compatibleValveSeries: 'NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T, NF-C (2″–24″; 30″/36″ consult factory)',
    compatibleValveSizes: '2″ – 24″ (50 – 600 mm); 30″/36″ require factory consultation',
    actuationMethod: 'Mechanical extension between valve top-flange and operator (handle/gear operator/actuator)',
    trimOptions: 'Carbon steel or stainless steel construction',
    torqueOutputMax: 'Pass-through — does not develop torque; stem material is sized to the valve\'s rated operating torque',
    supplyPressureRange: 'N/A (mechanical)',
    mountingStandard: 'DEMCO top-flange standard at both ends — valve flange below, operator flange above',
    weatherproofing: 'Tubular housing with gaskets and O-rings sealing the stem extension at top and bottom',
    oneLiner:
      'Fabricated-to-length stem extension — moves the operator (handle / gear operator / actuator) up to 16 feet above the valve for tank-bottom, buried, insulated, or otherwise inaccessible installations.',
    introParagraph:
      'The DEMCO stem extension assembly mechanically links the valve\'s upper stem to a relocated operator (manual handle, gear operator, or pneumatic actuator) up to 16 feet above the valve. Used wherever the operator must be installed at a different elevation than the valve — tank-bottom valves with grade-level operators, buried valves, valves installed inside heavy insulation or cladding, or any inaccessible-installation scenario. Fabricated from carbon-steel or stainless-steel parts contained in a tubular housing, with gaskets and O-rings sealing the stem extension at top and bottom. Lengths from 3″ to 16 ft are fabricated to order; lengths over 16 ft require special design consideration for torsional deflection (special order only).',
    features: [
      'Fabricated to specified length (3″ to 16 ft standard; over 16 ft is special order)',
      'Carbon-steel or stainless-steel construction',
      'Tubular housing with sealed gaskets and O-rings at top and bottom',
      'DEMCO top-flange standard at both ends — accepts any DEMCO operator on the upper end',
      'Available for 2″–24″ DEMCO valves; 30″ and 36″ NF-C requires factory consultation',
      'Lengths over 16 ft accommodated with torsional-deflection analysis',
    ],
    applications: [
      'Tank-bottom valves with grade-level manual operators',
      'Buried-service installations — operator at grade, valve below grade',
      'Valves installed inside thick insulation or cladding',
      'Confined-space valves with operators relocated to accessible service points',
      'High-elevation and below-grade combined installations',
      'Mezzanine-floor valves with handle-level operators',
    ],
    whatItDoes: 'Mechanically transmits the rotary motion from a relocated operator down to the valve\'s upper stem. The tubular housing protects the extension shaft and provides bearing support; the gaskets and O-rings prevent fluid ingress at both ends.',
    configurationDetail:
      'Specify the valve series and size, the construction material (carbon steel or stainless steel), and the exact length required in inches (or feet for longer extensions). Lengths over 16 feet require torsional-deflection review at the factory before fabrication. The 14″–24″ NF-C extensions use a different base part number from the 2″–12″ small-valve extensions.',
    partNumberExamples: [
      '23318 (2″–4″, carbon steel)',
      '23319 (5″–6″, carbon steel)',
      '23320 (8″, carbon steel)',
      '23321 (10″, carbon steel)',
      '23322 (12″, carbon steel)',
      '24529 (14″, carbon steel)',
      '24532 (24″, carbon steel)',
    ],
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 3 — SPEC TEMPLATES
// ═════════════════════════════════════════════════════════════════════════════

const VALVE_SPEC: SpecTemplatePayload = {
  slug: 'butterfly-valve-spec',
  name: 'Butterfly Valve',
  description:
    'Specification template for resilient-seated process butterfly valves: identification, dimensions, performance, materials, compliance and commercial fields. Used by the DEMCO NE/NF/NEI product line and any future general-industrial butterfly-valve product (NOT used by the API 6D oilfield butterfly product line, which uses oilfield-valve-spec).',
  position: 0,
  fields: [
    { key: 'series', label: 'Series', dataType: 'text', group: 'Identification', isRequired: true, isKeyFeature: true, isQuickSpec: true, position: 0 },
    { key: 'body_configuration', label: 'Body configuration', dataType: 'text', group: 'Identification', isRequired: true, isKeyFeature: true, isQuickSpec: true, position: 1 },
    { key: 'sanitary', label: 'Sanitary / FDA service', dataType: 'boolean', group: 'Identification', isRequired: false, isKeyFeature: true, isQuickSpec: false, position: 2 },
    { key: 'size_range', label: 'Size range', dataType: 'text', group: 'Dimensions', isRequired: true, isKeyFeature: false, isQuickSpec: true, position: 3 },
    { key: 'pressure_class', label: 'ASME pressure class', dataType: 'text', group: 'Performance', isRequired: true, isKeyFeature: true, isQuickSpec: true, position: 4 },
    { key: 'shutoff_ratings', label: 'Drop-tight shut-off ratings', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 5 },
    { key: 'temperature_range', label: 'Operating temperature range', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: true, position: 6 },
    { key: 'vacuum_rating', label: 'Vacuum rating', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 7 },
    { key: 'end_of_line_service', label: 'End-of-line service capable', dataType: 'boolean', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 8 },
    { key: 'flow_coefficient_max', label: 'Flow coefficient Cv (full open)', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 9 },
    { key: 'actuation_options', label: 'Actuation options', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 10 },
    { key: 'end_connection_standard', label: 'End-connection / flange standard', dataType: 'text', group: 'Compliance', isRequired: true, isKeyFeature: false, isQuickSpec: false, position: 11 },
    { key: 'body_materials', label: 'Body material options', dataType: 'text', group: 'Construction', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 12 },
    { key: 'stem_materials', label: 'Stem material options', dataType: 'text', group: 'Construction', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 13 },
    { key: 'disc_materials', label: 'Disc material options', dataType: 'text', group: 'Construction', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 14 },
    { key: 'seat_elastomers', label: 'Seat elastomer options', dataType: 'text', group: 'Construction', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 15 },
  ],
}

const ACCESSORY_SPEC: SpecTemplatePayload = {
  slug: 'butterfly-valve-accessory-spec',
  name: 'Butterfly Valve Accessory',
  description:
    'Specification template for butterfly-valve actuators, gear operators, manual handles, and stem extensions. Captures compatibility (which valve series and sizes), trim options, torque output, supply pressure, and weatherproofing. Used by the DEMCO accessory product line and any future butterfly-valve accessory product.',
  position: 1,
  fields: [
    { key: 'accessory_type', label: 'Accessory type', dataType: 'text', group: 'Identification', isRequired: true, isKeyFeature: true, isQuickSpec: true, position: 0 },
    { key: 'compatible_valve_series', label: 'Compatible valve series', dataType: 'text', group: 'Identification', isRequired: true, isKeyFeature: true, isQuickSpec: true, position: 1 },
    { key: 'compatible_valve_sizes', label: 'Compatible valve sizes', dataType: 'text', group: 'Identification', isRequired: true, isKeyFeature: false, isQuickSpec: true, position: 2 },
    { key: 'actuation_method', label: 'Actuation method', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: true, isQuickSpec: false, position: 3 },
    { key: 'torque_output_max', label: 'Maximum torque output', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 4 },
    { key: 'supply_pressure_range', label: 'Supply / input pressure range', dataType: 'text', group: 'Performance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 5 },
    { key: 'trim_options', label: 'Trim / material options', dataType: 'text', group: 'Construction', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 6 },
    { key: 'mounting_standard', label: 'Mounting standard', dataType: 'text', group: 'Compliance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 7 },
    { key: 'weatherproofing', label: 'Weatherproofing / environmental', dataType: 'text', group: 'Compliance', isRequired: false, isKeyFeature: false, isQuickSpec: false, position: 8 },
  ],
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 4 — TRANSLATORS (input → ProductImportPayload)
// ═════════════════════════════════════════════════════════════════════════════

function makeValveProduct(g: ValveInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    specTemplateSlug: 'butterfly-valve-spec',
    descriptionShort: g.oneLiner,
    descriptionLong: buildValveDescription(g),
    specs: {
      series: g.series,
      body_configuration: g.bodyConfiguration,
      sanitary: g.isSanitary,
      size_range: g.sizeRange,
      pressure_class: 'ASME Class 150 (285 psi non-shock body rating)',
      shutoff_ratings: g.shutoffRatings,
      temperature_range: g.temperatureRange,
      vacuum_rating: '29.9 in Hg (sealed against 10 microns)',
      end_of_line_service: g.endOfLineService,
      flow_coefficient_max: g.flowCoefficientMax,
      actuation_options: g.actuationOptions,
      end_connection_standard: g.endConnectionStandard,
      body_materials: g.bodyMaterials,
      stem_materials: g.stemMaterials,
      disc_materials: g.discMaterials,
      seat_elastomers: g.seatElastomers,
    },
    faqs: buildValveFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`,
    seoDescription: g.oneLiner,
    focusKeyword: `DEMCO ${g.series} butterfly valve`,
  }
}

function makeAccessoryProduct(g: AccessoryInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    specTemplateSlug: 'butterfly-valve-accessory-spec',
    descriptionShort: g.oneLiner,
    descriptionLong: buildAccessoryDescription(g),
    specs: {
      accessory_type: g.accessoryType,
      compatible_valve_series: g.compatibleValveSeries,
      compatible_valve_sizes: g.compatibleValveSizes,
      actuation_method: g.actuationMethod,
      torque_output_max: g.torqueOutputMax,
      supply_pressure_range: g.supplyPressureRange,
      trim_options: g.trimOptions,
      mounting_standard: g.mountingStandard,
      weatherproofing: g.weatherproofing,
    },
    faqs: buildAccessoryFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`,
    seoDescription: g.oneLiner,
    focusKeyword: `DEMCO ${g.accessoryType}`,
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 5 — CATEGORIES
// ═════════════════════════════════════════════════════════════════════════════

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'butterfly-valves',
    name: 'Butterfly Valves',
    parentSlug: 'valves-manifolds',
    shortDescription:
      'Resilient-seated and sanitary butterfly valves for general industrial process service — chemical, food/beverage, pharmaceutical, water/wastewater, HVAC, mining, and marine applications. Sizes 2″–36″, ASME Class 150, with full DEMCO range of body / disc / seat materials and lever, gear or pneumatic actuation. RFQ-only AED pricing — Request a Quote.',
    position: 0,
    isPublished: true,
    defaultSpecTemplateSlug: 'butterfly-valve-spec',
    seoTitle: 'Industrial Butterfly Valves — DEMCO NE/NF/NEI Series | Indus Hydraulics',
    seoDescription:
      'Resilient-seated industrial butterfly valves for general process, food/beverage, sanitary, water/wastewater, HVAC, mining and marine applications. DEMCO NE/NF/NEI series 2″–36″, ASME Class 150, full material and elastomer range. AED, RFQ-only — Request a Quote.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 6 — THE BATCH
// ═════════════════════════════════════════════════════════════════════════════

const batch: ImportBatch = {
  meta: {
    id: '2026-05-10-butterfly-valves',
    description:
      'DEMCO butterfly valve product line — 14 products (6 valve series + 8 accessories), new DEMCO brand, new Butterfly Valves category, two new spec templates, new "Process Valves" sub-section under Valves & Manifolds in the megamenu.',
  },

  brands: [
    {
      slug: 'demco',
      name: 'DEMCO',
      country: 'USA',
      isAuthorizedDistributor: true,
      isPublished: true,
      description:
        'DEMCO is the resilient-seated process-butterfly-valve product line of Cooper Cameron Valves (now Cameron Valves & Measurement, an SLB business). Acclaimed as the most durable resilient-seated butterfly-valve line in the industry, DEMCO is engineered for long-term, maintenance-free performance across chemical, petrochemical, food and beverage, water and waste-water, HVAC, power, mining, dry bulk handling, and marine applications. The product line spans the NE-C, NE-I, NE-I Sanitary, NE-D, NEI-T (Teflon-lined) and NF-C (large-bore) series in sizes 2″ through 36″ (50 through 900 mm), with the full range of body, stem, disc and seat materials and a comprehensive accessories range — manual handles, weatherproof worm-gear operators, Series DR pneumatic actuators, stem extensions, and a complete range of position-indicator switches, solenoid valves and pneumatic positioners.',
      seoTitle: 'DEMCO Butterfly Valves — Cooper Cameron Process Valves | Indus Hydraulics',
      seoDescription:
        'DEMCO is the resilient-seated process-butterfly-valve line of Cooper Cameron Valves (Cameron Valves & Measurement, SLB). 2″–36″, ASME Class 150, NE-C / NE-I / NEI-T / NE-D / NF-C series. Indus Hydraulics is an authorised DEMCO distributor in the UAE.',
    },
  ],

  categories: CATEGORIES,

  specTemplates: [VALVE_SPEC, ACCESSORY_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'valves-manifolds',
    parentSubLabel: 'Process Valves',
    createSubSectionIfMissing: true,
    newSubSectionPosition: 5, // after the 5 existing hydraulic sub-sections
    replacements: [{ label: 'Butterfly Valves', categorySlug: 'butterfly-valves' }],
  },

  products: [
    ...VALVES.map(makeValveProduct),
    ...ACCESSORIES.map(makeAccessoryProduct),
  ],
}

export default batch
