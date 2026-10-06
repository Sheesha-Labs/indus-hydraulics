/**
 * The corrections, as data. Each group says what was wrong and why the new
 * text is right; `plan.ts` applies them and `run.ts` writes them.
 *
 * Found while writing the 2026-10-06 article waves, which quote listings and
 * so had to read them closely. Nothing here is a style edit — every rule fixes
 * a statement that was false, or a value in the wrong unit or row.
 */
import type { FieldSet, Guard, SpecRule, TextRule, VariantRule } from './plan'

// ── Scopes ───────────────────────────────────────────────────────────────────

/** Flow iron flanges and adapters at 5K and 3K — API 6B sizes, R/RX rings. */
const FI_6B = [
  'IH-FI-FL-BLIND-5K-CAMERON',
  'IH-FI-FL-COMP-5K-CAMERON',
  'IH-FI-FL-WN-5K-STREAMFLO',
  'IH-FI-AF-5K-602-INDUS',
  'IH-FI-DSA-API-5K-3K-CAMERON',
] as const

/** Wellhead components whose flanges are 3K or 5K at 13-5/8" and below. */
const WH_6B = [
  'IH-WH-XT-API-5K-CAMERON',
  'IH-WH-CH-API-3K-STREAMFLO',
  'IH-WH-CS-API-5K-CAMERON',
  'IH-WH-TH-API-5K-CAMERON',
] as const

/** 5K below, 10K above: one API 6B flange and one API 6BX. */
const WH_THA = ['IH-WH-THA-API-5K-10K-STREAMFLO'] as const

/** API 6A valves with 5M flanged ends. */
const OFV_5M = [
  'IH-OFV-CHK-TYPER-318-5K-PSL1-FMC',
  'IH-OFV-GATE-2116-5K-MAN-FC-INDUS',
  'IH-OFV-GATE-318-5K-HYD-FC-FMC',
  'IH-OFV-GATE-318-5K-MAN-FLS-STREAMFLO',
  'IH-OFV-GATE-4116-5K-HYD-FC-STREAMFLO',
  'IH-OFV-GATE-4116-5K-MAN-FC-STREAMFLO',
] as const

const MANUAL_FAIL_CLOSE = [
  'IH-OFV-GATE-4116-5K-MAN-FC-STREAMFLO',
  'IH-OFV-GATE-2116-5K-MAN-FC-INDUS',
  'IH-OFV-GATE-2116-10K-MAN-FC-WOM',
  'IH-OFV-GATE-3116-10K-MAN-FC-WOM',
  'IH-OFV-GATE-3116-15K-MAN-FC-CAMERON',
] as const

const MANUAL_FLS = [
  'IH-OFV-GATE-318-5K-MAN-FLS-STREAMFLO',
  'IH-OFV-GATE-3116-10K-MAN-FLS-WOM',
  'IH-OFV-GATE-11316-15K-MAN-FLS-CAMERON',
] as const

/** Fig 602 valves rated 6,000 psi that the valve template could only file as 5K. */
const VALVES_602_6K = [
  'IH-OFV-BALL-2-602FM-6K-SOUR-ANSON',
  'IH-OFV-PLUG-TE-2-602MF-6K-SOUR-ANSON',
  'IH-OFV-CHOKE-ADJ-H2-3-602FM-6K-SOUR-ANSON',
  'IH-OFV-CHOKE-ADJ-N60-2-602FM-6K-SOUR-ANSON',
  'IH-OFV-PRV-SPRING-2-602MF-6K-SOUR-ANSON',
  'IH-OFV-CHOKE-POS-FC140-2-602FM-6K-SOUR-WOM',
] as const

const CRYO_HOSE = [
  'IH-MH-THORBURN-T52-CRYO-LIQUID',
  'IH-MH-THORBURN-T52-CRYO-VAPOR',
  'IH-MH-WITZENMANN-CRYO-LAR',
  'IH-MH-SENIOR-FLEX-CRYO-LNG',
  'IH-MH-THORBURN-CRYO-LNG-UNLOAD',
] as const

const G006X = [
  'IH-LUB-G-0060-FM-WHITE-MULTIPURPOSE-GREASE',
  'IH-LUB-G-0061-FM-WHITE-MULTIPURPOSE-GREASE',
  'IH-LUB-G-0062-FM-WHITE-MULTIPURPOSE-GREASE',
] as const

const O_RING_SKU = 'IH-AD-HSF-009'

const BOLTING_GASKETS = ['IH-FI-BG-RJG-API-INDUS', 'IH-FI-BG-STUDS-API-INDUS'] as const

// ── BOP ring numbers ─────────────────────────────────────────────────────────
//
// Every BOP listing told the buyer to size rings from the same six numbers,
// "BX-152 / BX-154 / BX-155 / BX-158 / BX-160 / BX-169", whatever the stack.
// Most of those cannot fit most of the stacks. API 6A: 11" 10K–15K is BX-158;
// 11" 5K is R-54 / RX-54; 13-5/8" 10K–15K is BX-159; 13-5/8" 5K is BX-160;
// 18-3/4" 10K is BX-164; 3-1/16" 10K is BX-154; 5-1/8" 10K is BX-169;
// 7-1/16" 3K / 5K / 10K are R/RX-45, R/RX-46 and BX-156; 21-1/4" 2K is R/RX-73.

const BOP_RING_TEXT = (size: string) =>
  `Indus supplies BX-152 / BX-154 / BX-155 / BX-158 / BX-160 / BX-169 (sized to ${size})`

export const BOP_RINGS: ReadonlyArray<{ sku: string; size: string; text: string }> = [
  {
    sku: 'IH-BOP-AN-11-10K-T20-INDUS',
    size: '11"',
    text: 'the 11" 10K flanges take BX-158 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-11-10K-DBL-T20-INDUS',
    size: '11"',
    text: 'the 11" 10K flanges take BX-158 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-AN-11-5K-T20-INDUS',
    size: '11"',
    text: 'the 11" 5K flanges take R-54 or RX-54 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-11-5K-DBL-T20-INDUS',
    size: '11"',
    text: 'the 11" 5K flanges take R-54 or RX-54 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RCD-5K-MPD-INDUS',
    size: '11"',
    text: 'the 11" 5K flanges take R-54 or RX-54 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-AN-13-58-10K-T20-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 10K flanges take BX-159 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-13-58-10K-DBL-T20-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 10K flanges take BX-159 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-13-58-15K-DBL-HPHT-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 15K flanges take BX-159 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-AN-13-58-5K-T20-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 5K flanges take BX-160 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-13-58-5K-DBL-T20-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 5K flanges take BX-160 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-AN-1834-10K-T20-INDUS',
    size: '18-3/4"',
    text: 'the 18-3/4" 10K flanges take BX-164 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-1834-15K-TRP-T20-INDUS',
    size: '18-3/4"',
    text: 'the 18-3/4" mandrel hub ends seal with the hub connector\'s own gasket rather than a flange ring; for flanged connections on the stack, Indus supplies BX rings',
  },
  {
    sku: 'IH-BOP-CK-3116-10K-T20-INDUS',
    size: '3-1/16"',
    text: 'the 3-1/16" 10K flanges take BX-154 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-CT-QUAD-5-10K-T20-INDUS',
    size: '5-1/8"',
    text: 'the 5-1/8" 10K flanges take BX-169 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-DIV-2114-2K-INDUS',
    size: '21-1/4"',
    text: 'the 21-1/4" 2K flanges take R-73 or RX-73 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-DSA-13-58-10K-11-10K-INDUS',
    size: '11"',
    text: 'the 13-5/8" 10K top takes a BX-159 ring and the 11" 10K bottom a BX-158, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-7-3K-DBL-T20-INDUS',
    size: '7-1/16"',
    text: 'the 7-1/16" 3K flanges take R-45 or RX-45 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-RAM-7-5K-DBL-T20-INDUS',
    size: '7-1/16"',
    text: 'the 7-1/16" 5K flanges take R-46 or RX-46 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-SNUB-7-10K-T20-INDUS',
    size: '7-1/16"',
    text: 'the 7-1/16" 10K flanges take BX-156 rings, which Indus supplies',
  },
  {
    sku: 'IH-BOP-SPOOL-13-58-10K-T20-INDUS',
    size: '13-5/8"',
    text: 'the 13-5/8" 10K flanges take BX-159 rings and the 3-1/16" 10K side outlets BX-154, which Indus supplies',
  },
  {
    sku: 'IH-BOP-XOVER-11-10K-7-10K-INDUS',
    size: '7-1/16"',
    text: 'the 11" 10K end takes a BX-158 ring and the 7-1/16" 10K end a BX-156, which Indus supplies',
  },
]

// ── O-rings for SAE flanges: the template described a steel adapter ──────────

const O_RING_LONG = [
  '<p>The <strong>O-Rings for SAE Hydraulic Flanges</strong> are spare face seals for SAE J518 four-bolt flange connections, Code 61 and Code 62, in sizes 1/2" to 5". The O-ring sits in the groove machined into the flange face and makes the seal on its own: the four bolts only clamp the faces together and hold the ring under compression.</p>',
  '<h3>Construction</h3> <ul> <li>Part: spare O-ring for the SAE J518 flange-face groove</li> <li>Flange codes: Code 61 (standard pressure) and Code 62 (high pressure)</li> <li>Sizes: 1/2" to 5"</li> <li>Material: elastomer, with the compound matched to the fluid and temperature</li> </ul>',
  '<h3>Performance</h3> <p>The O-ring does not set the pressure rating of the joint — that comes from the flange, its code and the bolts that hold it. What the O-ring decides is whether the joint stays dry. A flange that weeps is far more often a flattened, nicked or wrong-compound O-ring, or one pinched out of its groove at assembly, than a fault in the flange itself.</p>',
  '<h3>Fitting an O-ring</h3> <p>Fit a new O-ring every time the flange is broken: a used ring has taken a set in its groove and may not seal a second time. Clean the groove and the mating face, check both for scratches across the sealing area, and lightly lubricate the ring with the system fluid so that it stays seated while the halves come together. Draw the bolts up evenly in a cross pattern so the faces close parallel; tightening one side first can squeeze the ring out of its groove.</p>',
  '<h3>Choosing the compound</h3> <p>Nitrile suits mineral hydraulic oil at ordinary temperatures. Fluorocarbon (FKM) is the usual step up for higher temperatures and many synthetic fluids. Tell us the fluid, the operating temperature and the pressure, and we will match the compound before quoting.</p>',
  '<h3>Applicable Standards</h3> <ul> <li>SAE J518 (matching O-ring spare)</li> </ul>',
  '<h3>How to order</h3> <p>Specify (a) the flange code (61 or 62) and the nominal size, (b) the fluid and the operating temperature, so the compound can be matched, and (c) the quantity. Indus engineering will confirm the correct part against your equipment.</p>',
  '<h3>Companion products</h3> <p>Pair with Indus SAE J518 flanges, split flanges and flange fittings of the same code and size.</p>',
].join(' ')

export const FIELD_SETS: readonly FieldSet[] = [
  {
    id: 'o-ring-rewrite',
    sku: O_RING_SKU,
    fields: {
      seoDescription:
        'Spare O-rings for SAE J518 Code 61 and Code 62 flange faces, 1/2" to 5". Compound matched to your fluid and temperature. Priced on RFQ from Dubai.',
      descriptionShort:
        'Spare O-rings for SAE J518 four-bolt flange faces, Code 61 and Code 62, 1/2" to 5". The O-ring is the only seal in the joint, so fit a new one whenever the flange is broken. Compound matched to the fluid and temperature you send us.',
      descriptionLong: O_RING_LONG,
    },
    faqs: [
      {
        question: 'Which flanges do these O-rings fit?',
        answer:
          'SAE J518 four-bolt flanges, Code 61 (standard pressure) and Code 62 (high pressure), in sizes 1/2" to 5". Quote the code and the nominal size on the RFQ and we match the ring to the groove.',
      },
      {
        question: 'What sizes are available?',
        answer: '1/2" to 5". Larger or non-standard sizes are typically quoted on request.',
      },
      {
        question: 'What is the maximum working pressure?',
        answer:
          'This is a part / accessory — pressure rating is set by the host fitting it accompanies, not by the part itself.',
      },
      {
        question: 'What are the O-rings made of?',
        answer:
          'Elastomer, not metal. Tell us the fluid and the operating temperature and we match the compound to them: nitrile suits mineral hydraulic oil at ordinary temperatures, and fluorocarbon (FKM) is the usual step up for higher temperatures and many synthetic fluids.',
      },
      {
        question: 'Can an O-ring be re-used?',
        answer:
          'Fit a new one whenever the flange is broken. A used O-ring has taken a set in its groove and may not seal a second time, and it costs far less than the leak.',
      },
      {
        question: 'What is the lead time?',
        answer:
          'Send the flange code, the sizes and the quantity and we confirm availability and lead time on the quotation.',
      },
    ],
  },
]

// ── PVC hose: the summary columns were shifted by one ───────────────────────
//
// "Min bend radius: 0.7 mm" and "Weight: 86.00-230.00 kg/m" on a 19–51 mm
// suction hose. The bend radius held the vacuum figures and the weight held
// the bend radii; the size tables underneath are right. The summaries now give
// the tables' ranges, which run.ts re-derives from the variants before writing.

export const PVC_BEND: Readonly<
  Record<
    string,
    { was: string; min: number; max: number; weightWas: string; kgMin: number; kgMax: number }
  >
> = {
  'IH-IH-BAKU': {
    was: '0.78-0.88 mm',
    min: 113,
    max: 684,
    weightWas: '113.00-684.00 kg/m',
    kgMin: 0.49,
    kgMax: 4.43,
  },
  'IH-IH-DELIKATESSE': {
    was: '0.68 mm',
    min: 114,
    max: 342,
    weightWas: '114.00-342.00 kg/m',
    kgMin: 0.33,
    kgMax: 1.38,
  },
  'IH-IH-DELVAC': {
    was: '0.7 mm',
    min: 86,
    max: 230,
    weightWas: '86.00-230.00 kg/m',
    kgMin: 0.28,
    kgMax: 0.81,
  },
  'IH-IH-IRRIBULK': {
    was: '0.6-0.78 mm',
    min: 57,
    max: 401,
    weightWas: '57.00-401.00 kg/m',
    kgMin: 0.36,
    kgMax: 4.22,
  },
  'IH-IH-PREMFLEX': {
    was: '0.9 mm',
    min: 152,
    max: 608,
    weightWas: '152.00-608.00 kg/m',
    kgMin: 0.7,
    kgMax: 5,
  },
  'IH-IH-PREMVIN': {
    was: '0.88 mm',
    min: 26,
    max: 456,
    weightWas: '26.00-456.00 kg/m',
    kgMin: 0.21,
    kgMax: 6.9,
  },
}
const pvcRange = (sku: string) => `${PVC_BEND[sku]!.min} to ${PVC_BEND[sku]!.max} mm, by size`
const pvcWeight = (sku: string) =>
  `${PVC_BEND[sku]!.kgMin.toFixed(2)} to ${PVC_BEND[sku]!.kgMax.toFixed(2)} kg/m, by size`

// ── Text rules, in the order they run ────────────────────────────────────────

export const TEXT_RULES: readonly TextRule[] = [
  // API 6A: 6B flanges are 2K, 3K and 5K (R or RX rings); 6BX are 10K and up,
  // and 5K only from 13-5/8". These listings are all 6B but said 6BX.
  // Specific ring numbers first, so the general rename does not eat them.
  {
    id: '6b-casing-head-3k-ring',
    scope: ['IH-WH-CH-API-3K-STREAMFLO'],
    find: 'API 6BX 3K studded flange — 13-5/8 in, RX-65 ring groove',
    replace: 'API 6B 3K studded flange — 13-5/8 in, R-57 or RX-57 ring groove',
  },
  {
    id: '6b-casing-spool-5k-ring',
    scope: ['IH-WH-CS-API-5K-CAMERON'],
    find: 'API 6BX 5K studded flange — 7-1/16 in, BX-156 ring groove',
    replace: 'API 6B 5K studded flange — 7-1/16 in, R-46 or RX-46 ring groove',
  },
  {
    id: '6b-tubing-head-5k-ring',
    scope: ['IH-WH-TH-API-5K-CAMERON'],
    find: 'API 6BX 5K studded flange — 11 in, BX-156 ring groove',
    replace: 'API 6B 5K studded flange — 11 in, R-54 or RX-54 ring groove',
  },
  // A 7-1/16" 10K flange takes BX-156; BX-158 is the 11" ring.
  {
    id: 'casing-spool-10k-ring',
    scope: ['IH-WH-CS-API-10K-FMC'],
    find: 'API 6BX 10K studded flange — 7-1/16 in, BX-158 ring groove',
    replace: 'API 6BX 10K studded flange — 7-1/16 in, BX-156 ring groove',
  },
  {
    id: 'casing-spool-10k-bottom',
    scope: ['IH-WH-CS-API-10K-FMC'],
    find: 'API 6BX 5K or 10K studded flange — 11 in',
    replace: 'API 6B 5K or API 6BX 10K studded flange — 11 in',
  },
  // The top of this tubing head is 11" (its nominal size); BX-160 is 13-5/8" 5K.
  {
    id: 'tubing-head-15k-ring',
    scope: ['IH-WH-TH-API-15K-NOV'],
    find: 'API 6BX 15K studded flange — BX-160 ring groove',
    replace: 'API 6BX 15K studded flange — 11 in, BX-158 ring groove',
  },
  {
    id: 'tha-title',
    scope: WH_THA,
    find: 'Tubing Head Adapter (5K to 10K), API 6BX, Standard Service',
    replace: 'Tubing Head Adapter (5K to 10K), API 6B × 6BX, Standard Service',
  },
  { id: '6b-5k', scope: [...FI_6B, ...WH_6B, ...WH_THA], find: 'API 6BX 5K', replace: 'API 6B 5K' },
  { id: '6b-3k', scope: [...FI_6B, ...WH_6B], find: 'API 6BX 3K', replace: 'API 6B 3K' },
  { id: '6b-config', scope: FI_6B, find: '× API 6BX flange', replace: '× API 6B flange' },
  { id: '6b-groove', scope: FI_6B, find: '(BX ring groove)', replace: '(R or RX ring groove)' },
  {
    id: '6b-end-faq',
    scope: FI_6B,
    find: 'These are API 6A / 6BX flanged ends — ring-joint gasket (RTJ) sealing on a BX-series ring groove. Studs and nuts to match the API 6BX bolting pattern',
    replace:
      'These are API 6A / 6B flanged ends — ring-joint gasket (RTJ) sealing on an R or RX ring groove. Studs and nuts to match the API 6B bolting pattern',
  },
  // 3-1/16" is a 10K-and-up size; the 5K and 3K flange in that bore is 3-1/8".
  { id: '6b-size-318', scope: FI_6B, find: '3-1/16 in', replace: '3-1/8 in' },
  {
    id: '6b-companions',
    scope: WH_6B,
    find: 'API 6BX flanges, ring-joint gaskets',
    replace: 'API 6B flanges, ring-joint gaskets',
  },
  {
    id: '6b-companions-tha',
    scope: WH_THA,
    find: 'API 6BX flanges, ring-joint gaskets',
    replace: 'API 6B and 6BX flanges, ring-joint gaskets',
  },
  {
    id: 'wellhead-ring-series',
    scope: /^IH-WH-/,
    find: 'verify ring-groove series (BX-150 to BX-169 etc.)',
    replace: 'verify ring-groove series (R or RX for API 6B flanges, BX for API 6BX)',
  },
  // API 6A shell-tests 2K–5K equipment at twice rated pressure and 10K up at
  // 1.5×, so "1.5×" was wrong on every 5K and 3K page. Nothing is "ring-groove
  // tested" — grooves are gauged, and a hanger has none. State it by reference.
  {
    id: 'wellhead-shell-test',
    scope: /^IH-WH-/,
    find: 'Hydrostatic body and ring-groove tests at 1.5× shell pressure on every unit',
    replace: 'Hydrostatic shell test to API 6A on every unit',
  },
  {
    id: 'wellhead-shell-test-cert',
    scope: /^IH-WH-/,
    find: 'hydrostatic body and ring-groove test certificates at 1.5× shell pressure',
    replace: 'hydrostatic shell test certificates to API 6A',
  },
  {
    id: '6b-shell-test',
    scope: FI_6B,
    find: 'Hydrostatic test at 1.5× shell pressure on every unit.',
    replace: 'Hydrostatic shell test to API 6A on every unit.',
  },
  {
    id: '6b-shell-test-faq',
    scope: FI_6B,
    find: 'The unit is hydrotested at 1.5× shell-test pressure per the applicable specification.',
    replace: 'The unit is hydrostatically shell-tested to API 6A.',
  },
  {
    id: '6b-shell-test-cert',
    scope: FI_6B,
    find: 'hydrostatic test certificate at 1.5× shell pressure',
    replace: 'hydrostatic shell test certificate to API 6A',
  },
  // A sour API flange is not derated: NACE controls the material, the class stays.
  {
    id: 'flange-sour-rating',
    scope: /^IH-FI-(FL-|AF-5K-|DSA-API-5K-)/,
    find: 'Sour variants typically run 8–10K psi where standard runs 15K (a deliberate downrate to stay within NACE hardness limits).',
    replace:
      'A sour-service API flange keeps its pressure class — the difference is hardness-controlled material to NACE MR0175, not a lower rating.',
  },
  {
    id: 'bolting-schedules',
    scope: ['IH-FI-BG-STUDS-API-INDUS'],
    find: 'Per API 6BX flange schedule — 2-1/16 in to 18-3/4 in flange sizes',
    replace: 'Per API 6B and 6BX flange schedules — 2-1/16 in to 18-3/4 in flange sizes',
  },
  {
    id: 'rjg-title',
    scope: ['IH-FI-BG-RJG-API-INDUS'],
    find: 'API 6BX Ring Joint Gasket Set',
    replace: 'API 6A Ring Joint Gasket Set',
  },
  {
    id: 'rjg-summary',
    scope: ['IH-FI-BG-RJG-API-INDUS'],
    find: 'API 6BX ring-joint gasket set covering all standard wellhead and ASME flange ring grooves',
    replace:
      'API 6A ring-joint gasket set: BX rings for API 6BX flanges, R rings for API 6B and ASME flanges',
  },
  {
    id: 'rjg-r-series',
    scope: ['IH-FI-BG-RJG-API-INDUS'],
    find: 'R-12 to R-46 (ASME flanges)',
    replace: 'R-12 to R-46 (API 6B and ASME flanges)',
  },
  // The stud and gasket sets were written from the flange template, so they
  // claimed a hydrostatic shell test. Studs and ring gaskets hold no pressure
  // of their own and are not hydrotested.
  {
    id: 'bolting-no-hydrotest',
    scope: BOLTING_GASKETS,
    find: ' Hydrostatic test at 1.5× shell pressure on every unit.',
    replace: '',
  },
  {
    id: 'bolting-no-hydrotest-li',
    scope: BOLTING_GASKETS,
    find: /\s*<li>Hydrostatic test certificates per unit<\/li>/g,
    replace: '',
  },
  {
    id: 'bolting-no-hydrotest-faq',
    scope: BOLTING_GASKETS,
    find: ' The unit is hydrotested at 1.5× shell-test pressure per the applicable specification.',
    replace: '',
  },
  {
    id: 'bolting-no-hydrotest-cert',
    scope: BOLTING_GASKETS,
    find: '(c) hydrostatic test certificate at 1.5× shell pressure, and traceability stamps on the body',
    replace: '(c) traceability stamps on each part',
  },
  {
    id: 'bolting-no-hydrotest-oem',
    scope: BOLTING_GASKETS,
    find: 'with full mill test reports and hydrostatic certificates on file',
    replace: 'with full mill test reports on file',
  },
  {
    id: 'bolting-no-hydrotest-rfq',
    scope: BOLTING_GASKETS,
    find: 'beyond the standard MTR + hydrostatic.',
    replace: 'beyond the standard MTR.',
  },

  // BOP ring sizing, one listing at a time (see BOP_RINGS).
  ...BOP_RINGS.map(
    (r): TextRule => ({
      id: `bop-ring:${r.sku}`,
      scope: [r.sku],
      find: BOP_RING_TEXT(r.size),
      replace: r.text,
      fields: ['faq'],
    })
  ),
  // A control unit has no flanges.
  {
    id: 'bop-ring:IH-BOP-CTRL-K80-11STN-INDUS',
    scope: ['IH-BOP-CTRL-K80-11STN-INDUS'],
    find: /\s*For ring gasket sizing, Indus supplies BX-152 \/ BX-154 \/ BX-155 \/ BX-158 \/ BX-160 \/ BX-169 \(sized to N\/A\) in soft iron \(sweet\) or Inconel-625-clad \(sour service\) — see the BOP Spare Parts category\./g,
    replace: '',
    fields: ['faq'],
  },
  // A 13-5/8" 10K flange takes a BX-159 ring and 20 studs of 1-7/8"-8UN.
  // BX-160 is the 5K ring; 12 × 1-1/4" is nowhere near a 10K bolt circle.
  {
    id: 'nipple-up-ring',
    scope: ['IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS'],
    find: 'BX-160',
    replace: 'BX-159',
  },
  {
    id: 'nipple-up-studs',
    scope: ['IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS'],
    find: 'B7M studs (×12, 1-1/4"-8 UN × 9-1/2")',
    replace: 'B7M studs (×20, 1-7/8"-8 UN, length to suit the make-up)',
  },
  {
    id: 'nipple-up-nuts',
    scope: ['IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS'],
    find: '2HM heavy-hex nuts (×24, top + bottom)',
    replace: '2HM heavy-hex nuts (×40, two per stud)',
  },
  {
    id: 'stud-kit-studs',
    scope: ['IH-BOP-STUD-B7M-13-58-10K-INDUS'],
    find: 'ASTM A193 B7M studs (12-count, 1-1/4"-8 UN × 9-1/2" length per API 6A 13-5/8" 10K)',
    replace:
      'ASTM A193 B7M studs (20-count, 1-7/8"-8 UN per API 6A 13-5/8" 10K; length to suit the make-up)',
  },
  {
    id: 'stud-kit-nuts',
    scope: ['IH-BOP-STUD-B7M-13-58-10K-INDUS'],
    find: 'ASTM A194 2HM heavy-hex nuts (24-count, top + bottom)',
    replace: 'ASTM A194 2HM heavy-hex nuts (40-count, two per stud)',
  },
  // BX-152/154/155/158/160/169 are 2-1/16", 3-1/16", 4-1/16", 11" and 5-1/8" at
  // 10K–15K, plus 13-5/8" at 5K. The set fits no 7-1/16" or 18-3/4" flange.
  {
    id: 'ring-set-summary',
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    find: '— all common BOP & wellhead flange sizes (7-1/16", 11", 13-5/8", 18-3/4") in soft iron',
    replace:
      '— for 2-1/16", 3-1/16", 4-1/16", 5-1/8" and 11" flanges at 10K and 15K, and 13-5/8" at 5K, in soft iron',
  },
  {
    id: 'ring-set-bore',
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    find: 'is a recurring-purchase ring gasket set sized for N/A bore BOP equipment.',
    replace: 'is a recurring-purchase ring gasket set for API 6BX flanges.',
  },
  {
    id: 'ring-set-coverage',
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    find: 'The BX-152 / 154 / 155 / 158 / 160 / 169 combination covers all common BOP-and-wellhead flange sizes.',
    replace:
      'The BX-152 / 154 / 155 / 158 / 160 / 169 combination covers 2-1/16", 3-1/16", 4-1/16", 5-1/8" and 11" flanges at 10K and 15K, and 13-5/8" at 5K. It does not include BX-156 (7-1/16" 10K and 15K) or BX-159 (13-5/8" 10K and 15K).',
  },
  {
    id: 'ring-set-fits',
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    find: 'API 6A flanges 7-1/16" / 11" / 13-5/8" / 18-3/4"',
    replace:
      'API 6BX flanges 2-1/16" / 3-1/16" / 4-1/16" / 5-1/8" / 11" (10K and 15K) and 13-5/8" (5K)',
  },
  {
    id: 'ring-set-contents',
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    find: '— covers 7-1/16", 11", 13-5/8", and 18-3/4" API 6A flange sizes',
    replace:
      '— covers 2-1/16", 3-1/16", 4-1/16", 5-1/8" and 11" API 6BX flanges at 10K and 15K, and 13-5/8" at 5K',
  },

  // 1887-002 and 1887-008 are DM 2000–5000 gates. The page also carries
  // photographed DM 7500 gates, so it keeps both series but stops implying
  // the 1887 numbers fit a DM 7500 valve. See demco-dm-gate-valve-families.
  {
    id: 'dm-gate-seo',
    scope: ['IH-GVRK-DM-GATE-2'],
    find: 'Part nos. 1887-002, 1887-008. OEM Cameron or interchangeable.',
    replace: 'Part nos. 1887-002, 1887-008 (DM 2000–5000). OEM Cameron or interchangeable.',
  },
  {
    id: 'dm-gate-short',
    scope: ['IH-GVRK-DM-GATE-2'],
    find: 'OEM Cameron or interchangeable; Cameron part no. 1887-002.',
    replace: 'OEM Cameron or interchangeable; Cameron part no. 1887-002 for DM 2000–5000.',
  },
  {
    id: 'dm-gate-fits',
    scope: ['IH-GVRK-DM-GATE-2'],
    find: 'Demco DM mud gate valves — DM 2000–5000 and DM 7500',
    replace:
      'Demco DM mud gate valves — DM 2000–5000 (part nos. 1887-002, 1887-008); DM 7500 gates matched by the number stamped on the old gate',
    fields: ['spec'],
  },

  // A manual gate valve has no fail-safe position: "fail close" needs an actuator.
  {
    id: 'manual-fc-title',
    scope: MANUAL_FAIL_CLOSE,
    find: 'Manual Gate Valve, Fail Close, ',
    replace: 'Manual Gate Valve, ',
  },
  {
    id: 'manual-fc-type',
    scope: MANUAL_FAIL_CLOSE,
    find: 'Gate — Manual — Fail Close',
    replace: 'Gate — Manual',
  },
  {
    id: 'manual-fls-type',
    scope: MANUAL_FLS,
    find: 'Gate — Manual — Fail Last Stable',
    replace: 'Gate — Manual, FLS actuator retrofit option',
  },

  // In API 6A the number after a sour material class is the H2S partial
  // pressure limit in psia (EE-1.5 = 1.5 psia; NL = no limit). Temperature is
  // a separate class. The FAQ said the suffix was a temperature range.
  {
    id: 'material-class-suffix',
    scope: /^IH-OFV-/,
    find: '— this captures both the chemistry (sour-service grading: AA = standard, EE = sour with controlled hardness, HH = severe sour with high-alloy / cladded trim) and operating-temperature class. The "-0.5", "-1.5", and "-HF" suffixes indicate temperature ranges within the EE chemistry — refer to API 6A Table 5 / Table 6 for the exact temperature envelopes.',
    replace:
      '— the letters set the materials (AA to CC general service; DD, EE and FF sour service with hardness-controlled materials to NACE MR0175; HH sour service in corrosion-resistant alloy). On a sour class, a number after the dash is the maximum H₂S partial pressure the materials are qualified for, in psia — EE-1.5 means 1.5 psia — and NL means no limit. Temperature is rated separately, by the API 6A temperature class (K to Y), and is specified alongside the material class.',
  },
  // 5M flanges are API 6B (R or RX rings). Flanges are not hubs.
  {
    id: 'valve-5m-ends',
    scope: OFV_5M,
    find: 'These are API 6A flanged ends with ring-joint (RTJ) gasket sealing per API 6A 6BX hub geometry. Studs and nuts to match the API 6A 6BX bolting pattern.',
    replace:
      'These are API 6B flanged ends with ring-joint (RTJ) gasket sealing on R or RX rings. Studs and nuts to match the API 6B bolting pattern.',
  },
  {
    id: 'valve-5m-ends-check',
    scope: OFV_5M,
    find: 'These are API 6A flanged ends per 6BX hub geometry with ring-joint (RTJ) gasket sealing.',
    replace: 'These are API 6B flanged ends with ring-joint (RTJ) gasket sealing on R or RX rings.',
  },
  {
    id: 'valve-5m-wafer',
    scope: ['IH-OFV-CHK-TYPER-318-5K-PSL1-FMC'],
    find: /API 6A 6BX (ring-joint flanges|flanges|bolting)/g,
    replace: 'API 6B $1',
  },
  {
    id: 'valve-6bx-ends',
    scope: /^IH-OFV-/,
    find: 'gasket sealing per API 6A 6BX hub geometry',
    replace: 'gasket sealing on BX rings (API 6BX flanges)',
  },
  {
    id: 'valve-6bx-ends-check',
    scope: /^IH-OFV-/,
    find: 'These are API 6A flanged ends per 6BX hub geometry with ring-joint (RTJ) gasket sealing.',
    replace: 'These are API 6BX flanged ends with ring-joint (RTJ) gasket sealing on BX rings.',
  },
  {
    id: 'valve-5m-shell-test',
    scope: OFV_5M,
    find: 'Hydrotested at 1.5× working pressure (shell test)',
    replace: 'Hydrostatically shell-tested to API 6A',
  },

  // ISO 13795 bollards keep their own rows; nothing in text. (Variant rule.)
  // Molykote: Fahrenheit labelled Celsius, doubled units, a stray phrase in a
  // density, a typo in a pack size.
  {
    id: 'g006x-operating-range',
    scope: G006X,
    find: '0°F °C to 302°F °C',
    replace: '-18 °C to 150 °C (0 °F to 302 °F)',
  },
  {
    id: 'g006x-service-range',
    scope: G006X,
    find: '0°F to 302°F',
    replace: '-18 to 150',
    fields: ['spec'],
  },
  { id: 'g006x-viscosity', scope: G006X, find: '205 cst', replace: '205', fields: ['spec'] },
  {
    id: 'molykote-4-range',
    scope: ['IH-LUB-4-ELECTRICAL-INSULATING-COMPOUND'],
    find: '-54 °C to 200°C °C',
    replace: '-54 °C to 200 °C',
  },
  {
    id: 'molykote-4-service-range',
    scope: ['IH-LUB-4-ELECTRICAL-INSULATING-COMPOUND'],
    find: '-54 to 200°C',
    replace: '-54 to 200',
    fields: ['spec'],
  },
  {
    id: 'molykote-3400a-density',
    scope: ['IH-LUB-3400-A'],
    find: '1.2 No adhesion loss No adhesion loss',
    replace: '1.2',
    fields: ['spec'],
  },
  {
    id: 'l5030-operating-range',
    scope: ['IH-LUB-L-5030-SEMI-DRY-LUBRICANT'],
    find: '-40 °C to 100 (intermittent use at 150 °C) °C',
    replace: '-40 °C to 100 °C (intermittent use at 150 °C)',
  },
  { id: 'p40-pail', scope: ['IH-LUB-P40'], find: 'PAlL', replace: 'PAIL' },

  // The Danforth summary quoted its first and last rows, not its range.
  {
    id: 'danforth-range',
    scope: ['IH-LR-AN-DAN'],
    find: '20 kg to 30 kg',
    replace: '1.5 kg to 18,000 kg',
  },

  // PVC summaries (see PVC_BEND).
  ...Object.keys(PVC_BEND).map(
    (sku): TextRule => ({
      id: `pvc-bend:${sku}`,
      scope: [sku],
      find: `<strong>Min bend radius:</strong> ${PVC_BEND[sku]!.was}`,
      replace: `<strong>Min bend radius:</strong> ${pvcRange(sku)}`,
      fields: ['descriptionLong'],
    })
  ),
  ...Object.keys(PVC_BEND).map(
    (sku): TextRule => ({
      id: `pvc-weight:${sku}`,
      scope: [sku],
      find: `<strong>Weight:</strong> ${PVC_BEND[sku]!.weightWas}`,
      replace: `<strong>Weight:</strong> ${pvcWeight(sku)}`,
      fields: ['descriptionLong'],
    })
  ),

  // Cam and groove couplings are A-A-59326 (it replaced MIL-C-27487) and
  // EN 14420-7. ISO 16028 is a flat-face hydraulic coupler standard.
  {
    id: 'cam-groove-standards',
    scope: /^IH-CGC-/,
    find: 'MIL-A-A-59326 (US), EN 14420-7 (Europe), ISO 16028-compatible cam geometry',
    replace: 'A-A-59326 (US, formerly MIL-C-27487), EN 14420-7 (Europe)',
  },
  {
    id: 'cam-groove-compliance',
    scope: /^IH-CGC-/,
    find: 'MIL-A-A-59326 (US) and EN 14420 (Europe)',
    replace: 'A-A-59326 (US) and EN 14420-7 (Europe)',
  },
  // The specialty halves (reducers, spools, weld and flanged ends) carry the
  // same garbled designation.
  {
    id: 'cam-groove-specialty-standards',
    scope: /^IH-SPC-/,
    find: 'MIL-A-A-59326 (US)',
    replace: 'A-A-59326 (US, formerly MIL-C-27487)',
  },
  // There is no Korean or Asian standard behind the KC nipple pattern.
  {
    id: 'kc-standard',
    scope: /^IH-KC-/,
    find: ' (Korean / Asian industrial standard)',
    replace: '',
  },
  { id: 'kc-pattern', scope: /^IH-KC-/, find: ' — Korean / Asian industrial pattern', replace: '' },

  // ISO 10380 has no product specification levels — PSL is an API term — and
  // no monogram.
  {
    id: 'metal-hose-psl',
    scope: /^IH-(MH|IH)-/,
    find: /ISO 10380(:2012)? PSL [123]/g,
    replace: 'ISO 10380$1',
  },
  {
    id: 'metal-hose-psl-class',
    scope: /^IH-(MH|IH)-/,
    find: '(ISO 10380 PSL class, PED Module',
    replace: '(ISO 10380, PED Module',
  },
  {
    id: 'metal-hose-psl-custom',
    scope: /^IH-(MH|IH)-/,
    find: /, exotic alloys, severe-service certifications, or PSL (2\/3|3) monogrammed assemblies\)/g,
    replace: ', exotic alloys or severe-service certifications)',
  },
  {
    id: 'metal-hose-psl-lead',
    scope: /^IH-(MH|IH)-/,
    find: ' Bronze is regularly stocked; PSL 3 monogrammed variants add 1-2 weeks.',
    replace: ' Bronze is regularly stocked.',
  },
  {
    id: 'metal-hose-psl-alt',
    scope: /^IH-(MH|IH)-/,
    find: ' European-engineered HP alternative with PSL 3 monogrammed certification.',
    replace: ' European-engineered HP alternative.',
  },
  {
    id: 'metal-hose-psl-li',
    scope: /^IH-(MH|IH)-/,
    find: /<li>PSL 3 monogrammed (HP )?assemblies<\/li>/g,
    replace: '',
  },
  {
    id: 'metal-hose-psl-app',
    scope: /^IH-(MH|IH)-/,
    find: /; PSL 3 monogrammed (HP )?assemblies\./g,
    replace: '.',
  },

  // EN 13648-1 covers safety devices for cryogenic vessels, not hoses or couplers.
  {
    id: 'cryo-en13648-coupler',
    scope: CRYO_HOSE,
    find: 'German-engineered with EN 13648-1 cryogenic coupler',
    replace: 'German-engineered with a cryogenic coupler',
  },
  {
    id: 'cryo-en13648-flanged',
    scope: CRYO_HOSE,
    find: 'flanged with EN 13648-1 cryogenic coupler',
    replace: 'flanged with a cryogenic coupler',
  },
  { id: 'cryo-en13648-lead', scope: CRYO_HOSE, find: 'EN 13648-1, ', replace: '' },
  { id: 'cryo-en13648-tail', scope: CRYO_HOSE, find: ', EN 13648-1', replace: '' },

  // NPT is ASME B1.20.1. ISO 7-1 is BSPT — a 55° thread.
  {
    id: 'npt-iso7',
    scope: /^(IH-AD-NPT-\d+|IH-PT-NPT-MAL)$/,
    find: 'ASME B1.20.1 / ISO 7-1',
    replace: 'ASME B1.20.1',
  },
  {
    id: 'npt-iso7-list',
    scope: /^(IH-AD-NPT-\d+|IH-PT-NPT-MAL)$/,
    find: 'ASME B1.20.1, ISO 7-1',
    replace: 'ASME B1.20.1',
  },
  {
    id: 'npt-iso7-li',
    scope: /^(IH-AD-NPT-\d+|IH-PT-NPT-MAL)$/,
    find: /\s*<li>ISO 7-1<\/li>/g,
    replace: '',
  },

  // ISO 6149 is a port; DIN 3852-2 is a BSP stud end. The metric 24° cone is
  // ISO 8434-1 / DIN 2353, and metric stud ports are ISO 6149 / DIN 3852-1.
  {
    id: 'metric-adapter-family',
    scope: /^IH-AD-MET-/,
    find: 'ISO 6149-1 / DIN 3852-2 — metric straight or 24° cone',
    replace: '24° cone to ISO 8434-1 / DIN 2353, metric ports to ISO 6149 / DIN 3852-1',
  },
  {
    id: 'metric-adapter-spec',
    scope: /^IH-AD-MET-/,
    find: 'ISO 6149-1, DIN 3852-2',
    replace: 'ISO 8434-1, DIN 2353, ISO 6149, DIN 3852-1',
  },
  {
    id: 'metric-adapter-li',
    scope: /^IH-AD-MET-/,
    find: /<li>ISO 6149-1<\/li>\s*<li>DIN 3852-2<\/li>/g,
    replace:
      '<li>ISO 8434-1 / DIN 2353 (24° cone)</li> <li>ISO 6149 / DIN 3852-1 (metric ports)</li>',
  },
  {
    id: 'metric-ss-faq',
    scope: /^IH-SS-MET-/,
    find: 'Metric 24° cone (ISO 6149-1 / DIN 3852-2)',
    replace: 'Metric 24° cone (ISO 8434-1 / DIN 2353)',
  },
  {
    id: 'metric-ss-spec',
    scope: /^IH-SS-MET-/,
    find: 'ISO 6149-1, DIN 3852-2',
    replace: 'ISO 8434-1, DIN 2353',
  },
  {
    id: 'metric-ss-li',
    scope: /^IH-SS-MET-/,
    find: /<li>ISO 6149-1<\/li>\s*<li>DIN 3852-2<\/li>/g,
    replace: '<li>ISO 8434-1</li> <li>DIN 2353</li>',
  },

  // EN 14420-6 and DIN 28450 are not the Guillemin coupling.
  {
    id: 'guillemin-standard',
    scope: ['IH-GUI-GUILLEMIN-COUPLING-FEMALE-THREAD'],
    find: ' EN 14420-6 / DIN 28450.',
    replace: '.',
  },

  // API 17J is unbonded flexible pipe. A tensioner hose is a bonded rubber hose.
  {
    id: 'tensioner-17j-faq',
    scope: /^IH-OG-TC-/,
    find: 'API 17J / API 7K cross-reference.',
    replace: 'API 7K cross-reference.',
  },
  {
    id: 'tensioner-17j',
    scope: /^IH-OG-TC-/,
    find: 'API 17J, API Spec 7K',
    replace: 'API Spec 7K',
  },
  { id: 'tensioner-17j-li', scope: /^IH-OG-TC-/, find: /\s*<li>API 17J<\/li>/g, replace: '' },
]

// ── Spec rows ────────────────────────────────────────────────────────────────

export const SPEC_RULES: readonly SpecRule[] = [
  // The valve template's pressure options stopped at 5K, so 6,000 psi valves
  // were filed under it. run.ts adds 6K to the template first.
  ...VALVES_602_6K.map(
    (sku): SpecRule => ({
      id: `pressure-class-6k:${sku}`,
      scope: [sku],
      op: 'set',
      label: 'Pressure Class',
      value: '6K',
    })
  ),
  // Each Fig 1003 test pressure belongs to a different maker's rating than the
  // working pressures beside it — 7,500 psi against a 7,500 psi sour rating,
  // 12,000 psi against a 10,000 psi standard one. Neither is published here.
  { id: 'fig-1003-test', scope: /^IH-FI-HU-1003-/, op: 'delete', label: 'Test Pressure' },
  { id: 'iso-10380-class', scope: /^IH-(MH|IH)-/, op: 'delete', label: 'ISO 10380 Class' },
  {
    id: 'dm-gate-part-numbers',
    scope: ['IH-GVRK-DM-GATE-2'],
    op: 'set',
    label: 'Part numbers',
    value: '1887-002, 1887-008 (DM 2000–5000)',
  },
  {
    id: 'l5030-service-range',
    scope: ['IH-LUB-L-5030-SEMI-DRY-LUBRICANT'],
    op: 'set',
    label: 'Service temperature range',
    value: '-40 to 100 °C (intermittent use at 150 °C)',
    unit: null,
  },
  {
    id: 'l5030-cure',
    scope: ['IH-LUB-L-5030-SEMI-DRY-LUBRICANT'],
    op: 'set',
    label: 'Cure temperature',
    value: 'Not required',
    unit: null,
  },
  ...Object.keys(PVC_BEND).map(
    (sku): SpecRule => ({
      id: `pvc-bend-spec:${sku}`,
      scope: [sku],
      op: 'set',
      label: 'Min Bend Radius',
      value: pvcRange(sku),
      unit: null,
    })
  ),
  ...Object.keys(PVC_BEND).map(
    (sku): SpecRule => ({
      id: `pvc-weight-spec:${sku}`,
      scope: [sku],
      op: 'set',
      label: 'Weight',
      value: pvcWeight(sku),
      unit: null,
    })
  ),
  {
    id: 'o-ring-material',
    scope: [O_RING_SKU],
    op: 'set',
    label: 'Material',
    value: 'Elastomer — compound matched to the fluid and temperature',
    unit: null,
  },
  {
    id: 'o-ring-codes',
    scope: [O_RING_SKU],
    op: 'relabel',
    label: 'Surface Treatment',
    to: 'Flange Codes',
    value: 'SAE J518 Code 61 and Code 62',
    unit: null,
  },
]

// ── Variant size tables ──────────────────────────────────────────────────────

const KN_PER_TONNE = 9.80665

const NYLON_ROPE_INCH: Readonly<Record<string, string>> = {
  '85 mm (200-5/8″)': '85 mm (10-5/8″)',
  '90 mm (201-1/4″)': '90 mm (11-1/4″)',
  '95 mm (201-7/8″)': '95 mm (11-7/8″)',
  '100 mm (202-1/2″)': '100 mm (12-1/2″)',
}

export const VARIANT_RULES: readonly VariantRule[] = [
  // ISO 13795: the towing load in kN did not match the same row's tonnes
  // (DN150: 10 t beside 540 kN). The mooring columns convert cleanly, so the
  // tonnes are right; the kN is recomputed wherever it is more than 2% out.
  {
    id: 'iso-13795-towing-kn',
    scope: ['IH-LR-BM-MDBI13795', 'IH-LR-BM-MDBI137952'],
    apply: (dims) => {
      const t = Number(dims['wllT@towing'])
      const kn = Number(dims['wllKn@towing'])
      if (!Number.isFinite(t) || !Number.isFinite(kn) || t <= 0) return null
      const expected = t * KN_PER_TONNE
      if (Math.abs(kn - expected) / expected <= 0.02) return null
      return { ...dims, 'wllKn@towing': Math.round(expected) }
    },
  },
  // The supplier's "test pressure" column, printed with a unit of kg, landed
  // in the proof-load column. It is neither a load nor in kg.
  {
    id: 'pneumatic-fender-proof',
    scope: ['IH-LR-MF-PFS'],
    apply: (dims) => {
      if (!('proofKg' in dims)) return null
      const { proofKg: _dropped, ...rest } = dims
      return rest
    },
  },
  // Inch sizes are mm ÷ 8 on this listing (88 mm is 11″, 96 mm is 12″); four
  // had a stray "20" for "1".
  {
    id: 'nylon-rope-inch',
    scope: ['IH-LR-FR-NPRHT'],
    apply: (dims) => {
      const next = NYLON_ROPE_INCH[String(dims.size)]
      return next ? { ...dims, size: next } : null
    },
  },
  // A decimal point lost: 1418 t between 131.6 t and 152 t.
  {
    id: 'pp-rope-104-mbl',
    scope: ['IH-LR-FR-DBRPPNPEU'],
    apply: (dims, partNumber) =>
      partNumber === 'IH-LR-FR-DBRPPNPEU-104MM' && dims['mblT@ppMulti'] === 1418
        ? { ...dims, 'mblT@ppMulti': 141.8 }
        : null,
  },
]

// ── Slugs, shelves and template options ──────────────────────────────────────

/** Each move leaves a 301 and rewrites every product, article and page link to it. */
export const SLUG_MOVES: ReadonlyArray<{ sku: string; from: string; to: string }> = [
  {
    sku: 'IH-FI-FL-BLIND-5K-CAMERON',
    from: 'blind-flange-api-6bx-5k-standard-service',
    to: 'blind-flange-api-6b-5k-standard-service',
  },
  {
    sku: 'IH-FI-FL-COMP-5K-CAMERON',
    from: 'companion-flange-api-6bx-5k-standard-service',
    to: 'companion-flange-api-6b-5k-standard-service',
  },
  {
    sku: 'IH-FI-FL-WN-5K-STREAMFLO',
    from: 'weld-neck-flange-api-6bx-5k-standard-service',
    to: 'weld-neck-flange-api-6b-5k-standard-service',
  },
  {
    sku: 'IH-FI-AF-5K-602-INDUS',
    from: 'adapter-flange-api-6bx-5k-602-female-weco-standard-service',
    to: 'adapter-flange-api-6b-5k-602-female-weco-standard-service',
  },
  {
    sku: 'IH-FI-DSA-API-5K-3K-CAMERON',
    from: 'double-studded-adapter-api-6bx-5k-3k-standard-service',
    to: 'double-studded-adapter-api-6b-5k-3k-standard-service',
  },
  {
    sku: 'IH-FI-BG-RJG-API-INDUS',
    from: 'api-6bx-ring-joint-gasket-set-bx-r-series-all-pressure-classes',
    to: 'api-6a-ring-joint-gasket-set-bx-r-series-all-pressure-classes',
  },
  {
    sku: 'IH-WH-XT-API-5K-CAMERON',
    from: 'christmas-tree-api-6bx-5k-conventional-standard-service',
    to: 'christmas-tree-api-6b-5k-conventional-standard-service',
  },
  {
    sku: 'IH-WH-CH-API-3K-STREAMFLO',
    from: 'casing-head-api-6bx-3k-multi-bowl-standard-service',
    to: 'casing-head-api-6b-3k-multi-bowl-standard-service',
  },
  {
    sku: 'IH-WH-CS-API-5K-CAMERON',
    from: 'casing-spool-api-6bx-5k-standard-service',
    to: 'casing-spool-api-6b-5k-standard-service',
  },
  {
    sku: 'IH-WH-TH-API-5K-CAMERON',
    from: 'tubing-head-api-6bx-5k-standard-service',
    to: 'tubing-head-api-6b-5k-standard-service',
  },
  {
    sku: 'IH-WH-THA-API-5K-10K-STREAMFLO',
    from: 'tubing-head-adapter-5k-to-10k-api-6bx-standard-service',
    to: 'tubing-head-adapter-5k-to-10k-api-6b-6bx-standard-service',
  },
  {
    sku: 'IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS',
    from: 'bop-nipple-up-kit-bx-160-gasket-b7m-studs-2hm-nuts-compound-13-5-8-10k-sour-service',
    to: 'bop-nipple-up-kit-bx-159-gasket-b7m-studs-2hm-nuts-compound-13-5-8-10k-sour-service',
  },
  // The slug still carried the "6,000 psi in 2 in" of the May import; the
  // 2026-08-25 rewrite sourced 2,000 psi for both sizes and kept the URL.
  {
    sku: 'IH-FI-HU-300-NPT-2K-STD-INDUS',
    from: 'hammer-union-set-300-series-flat-face-npt-npt-2-000-psi-6-000-psi-in-2-in-standard-service',
    to: 'figure-300-hammer-union-flat-face-o-ring-2000-psi',
  },
  {
    sku: 'IH-OFV-GATE-4116-5K-MAN-FC-STREAMFLO',
    from: 'manual-gate-valve-fail-close-4-1-16-in-5m-flanged-5-000-psi-api-6a-psl-3-pr1-ee',
    to: 'manual-gate-valve-4-1-16-in-5m-flanged-5-000-psi-api-6a-psl-3-pr1-ee',
  },
  {
    sku: 'IH-OFV-GATE-2116-5K-MAN-FC-INDUS',
    from: 'manual-gate-valve-fail-close-2-1-16-in-5m-flanged-5-000-psi-api-6a-psl-3-pr1-ee',
    to: 'manual-gate-valve-2-1-16-in-5m-flanged-5-000-psi-api-6a-psl-3-pr1-ee',
  },
  {
    sku: 'IH-OFV-GATE-2116-10K-MAN-FC-WOM',
    from: 'manual-gate-valve-fail-close-2-1-16-in-10m-flanged-10-000-psi-api-6a-psl-3-pr1-ee',
    to: 'manual-gate-valve-2-1-16-in-10m-flanged-10-000-psi-api-6a-psl-3-pr1-ee',
  },
  {
    sku: 'IH-OFV-GATE-3116-10K-MAN-FC-WOM',
    from: 'manual-gate-valve-fail-close-3-1-16-in-10m-flanged-10-000-psi-api-6a-psl-3-pr1-ee-1-5',
    to: 'manual-gate-valve-3-1-16-in-10m-flanged-10-000-psi-api-6a-psl-3-pr1-ee-1-5',
  },
  {
    sku: 'IH-OFV-GATE-3116-15K-MAN-FC-CAMERON',
    from: 'manual-gate-valve-fail-close-3-1-16-in-15m-flanged-15-000-psi-api-6a-psl-3-pr1-ee-0-5',
    to: 'manual-gate-valve-3-1-16-in-15m-flanged-15-000-psi-api-6a-psl-3-pr1-ee-0-5',
  },
]

/** Molykote 7325 is a grease, filed among the anti-friction coatings. */
export const CATEGORY_MOVES: ReadonlyArray<{ sku: string; to: string }> = [
  { sku: 'IH-LUB-7325', to: 'molykote-grease-suppliers-uae' },
]

export const TEMPLATE_OPTIONS: ReadonlyArray<{
  template: string
  key: string
  add: string
  after: string
}> = [{ template: 'oilfield-valve-spec', key: 'pressure_class', add: '6K', after: '5K' }]

// ── What must be gone afterwards ─────────────────────────────────────────────

export const GUARDS: readonly Guard[] = [
  {
    scope: [...FI_6B, ...WH_6B, ...WH_THA],
    pattern: /API 6BX [35]K|BX ring groove|BX-series ring groove/,
    why: '6B listing still says 6BX',
  },
  { scope: FI_6B, pattern: /3-1\/16/, why: '3-1/16" is not a 5K or 3K size' },
  {
    scope: [...FI_6B, ...WH_6B, ...WH_THA],
    pattern: /1\.5× shell/,
    why: 'wrong shell-test multiplier at 5K',
  },
  {
    scope: /^IH-WH-/,
    pattern: /BX-150 to BX-169|ring-groove test/,
    why: 'wellhead ring/test boilerplate',
  },
  {
    scope: ['IH-WH-CS-API-10K-FMC', 'IH-WH-TH-API-15K-NOV'],
    pattern: /7-1\/16 in, BX-158|BX-160/,
    why: 'wrong ring for the flange',
  },
  {
    scope: ['IH-FI-BG-RJG-API-INDUS'],
    pattern: /API 6BX (Ring|ring)/,
    why: 'gasket set is not 6BX only',
  },
  { scope: /^IH-BOP-/, pattern: /BX-152 \/ BX-154 \/ BX-155/, why: 'generic BOP ring list' },
  {
    scope: ['IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS'],
    pattern: /BX-160|1-1\/4"-8|×12|×24/,
    why: '5K ring or wrong bolting',
  },
  {
    scope: ['IH-BOP-STUD-B7M-13-58-10K-INDUS'],
    pattern: /12-count|24-count|1-1\/4"-8/,
    why: 'wrong bolting',
  },
  {
    scope: ['IH-BOP-RG-BX-SET-INC625-INDUS'],
    pattern: /7-1\/16", 11"|18-3\/4|N\/A bore|all common/,
    why: 'ring set coverage',
  },
  { scope: MANUAL_FAIL_CLOSE, pattern: /Fail Close/, why: 'manual valve called fail close' },
  { scope: MANUAL_FLS, pattern: /Manual — Fail Last Stable/, why: 'manual valve called FLS' },
  {
    scope: /^IH-OFV-/,
    pattern: /suffixes indicate temperature|hub geometry/,
    why: 'valve template error',
  },
  {
    scope: OFV_5M,
    pattern: /6BX|1\.5× working pressure \(shell/,
    why: '5M valve said 6BX or 1.5× shell test',
  },
  { scope: /^IH-CGC-/, pattern: /ISO 16028|MIL-A-A/, why: 'cam and groove standard' },
  { scope: /^IH-SPC-/, pattern: /MIL-A-A/, why: 'cam and groove standard' },
  {
    scope: BOLTING_GASKETS,
    pattern: /hydrost|hydrotest/i,
    why: 'studs and gaskets are not hydrotested',
  },
  { scope: /^IH-KC-/, pattern: /Korean/, why: 'KC pattern is not Korean' },
  { scope: /^IH-(MH|IH)-/, pattern: /PSL/, why: 'ISO 10380 has no PSL' },
  { scope: CRYO_HOSE, pattern: /13648/, why: 'EN 13648-1 is not a hose standard' },
  { scope: /^(IH-AD-NPT-\d+|IH-PT-NPT-MAL)$/, pattern: /ISO 7-1/, why: 'ISO 7-1 is BSPT' },
  { scope: /^IH-(AD|SS)-MET-/, pattern: /DIN 3852-2/, why: 'DIN 3852-2 is a BSP stud end' },
  { scope: /^IH-OG-TC-/, pattern: /17J/, why: 'API 17J is unbonded pipe' },
  {
    scope: ['IH-GUI-GUILLEMIN-COUPLING-FEMALE-THREAD'],
    pattern: /14420-6|28450/,
    why: 'wrong Guillemin standard',
  },
  { scope: G006X, pattern: /°F °C|°F to 302°F$|cst/, why: 'grease units' },
  { scope: ['IH-LUB-4-ELECTRICAL-INSULATING-COMPOUND'], pattern: /°C °C/, why: 'doubled unit' },
  {
    scope: ['IH-LUB-3400-A'],
    pattern: /No adhesion loss No adhesion loss/,
    why: 'stray phrase in density',
  },
  { scope: ['IH-LUB-L-5030-SEMI-DRY-LUBRICANT'], pattern: /no need|\) °C/, why: 'L-5030 units' },
  { scope: ['IH-LUB-P40'], pattern: /PAlL/, why: 'pack size typo' },
  { scope: ['IH-LR-AN-DAN'], pattern: /20 kg to 30 kg/, why: 'Danforth range' },
  {
    scope: Object.keys(PVC_BEND),
    pattern: /Min (B|b)end (R|r)adius:(<\/strong>)? 0\.\d/,
    why: 'PVC bend radius held vacuum',
  },
  {
    scope: Object.keys(PVC_BEND),
    pattern: /Weight:(<\/strong>)? \d{2,}\.00-/,
    why: 'PVC weight held bend radius',
  },
  {
    scope: [O_RING_SKU],
    pattern: /[Cc]arbon[ -]steel|[Zz]inc-plated|thread family|crimp/,
    why: 'O-ring described as a steel adapter',
  },
]
