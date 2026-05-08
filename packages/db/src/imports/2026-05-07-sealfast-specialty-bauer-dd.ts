/**
 * Bulk Sealfast Specialty Adapters / Bauer / Dry Disconnect import — 2026-05-07
 *
 * 31 industrial hose coupling products from the Sealfast catalogue series
 * (catalogues 02 / 03 / 04) plus the user-provided Excel
 * `Industrial Hose Couplings - continued.xlsx`. Extends the Sealfast brand
 * + cam-and-groove coupling family landed in PR #82.
 *
 * Source product list (Excel, canonical):
 *   - Specialty Adapters & Couplings (17): Type AW socket-weld, DW
 *     socket-weld, FA/FC ANSI 150 flanged, DCL lockable dust caps,
 *     SA spool adapters, DD spool, DA reducing, AR/BR/BLN/CR/DR/ER
 *     reducing variants, plus 3 thread-reducer fittings (NPSM/BSP/NPT)
 *   - Bauer Type Couplings (10): Zinc-plated steel agriculture / water
 *     transfer couplings — male/female threaded, hose shank, flanged,
 *     lever rings, complete sets
 *   - Dry Disconnect Couplings (4): Aluminum coupler/adapter × female NPT
 *     in Viton or PTFE seal options for fuel / chemical / aggressive
 *     fluid transfer with automatic shut-off
 *
 * Catalogue PDFs (02 crimping, 03 fuel-tanker, 04 dry-disconnect) provided
 * spec context where they aligned. PDF 02 is mostly the CrimpTEK detail
 * already covered by PR #82 + Combo Nipples / Sleeves out of scope here.
 * PDF 03 covers fuel-tanker fittings (API valves / drop elbows / fill
 * adapters) which aren't in the Excel — deferred to a future batch. PDF 04
 * matches the 4 Dry Disconnect rows.
 *
 * Adds:
 *   - 3 NEW sub-categories under the existing `industrial-hoses` master
 *     (positions 10, 11, 12): specialty-adapters-couplings,
 *     bauer-type-couplings, dry-disconnect-couplings
 *   - 1 NEW spec template: `industrial-coupling-spec` (10 text fields,
 *     flexible across all 3 coupling families)
 *   - 31 products (SKU patterns: IH-SPC-{TYPE}, IH-BC-{TYPE}, IH-DDC-{TYPE})
 *   - 3 NEW megamenu leaves added to the existing "Couplings" sub-section
 *     under the Industrial Hoses column (alongside Cam & Groove Couplings
 *     from PR #82)
 *
 * Reuses Sealfast brand from PR #82 — no new brand row.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-specialty-bauer-dd.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-specialty-bauer-dd.ts
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Common defaults ───────────────────────────────────────────────────────

const COMMON: Pick<
  ProductImportPayload,
  | 'brandSlug'
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
  | 'countryOfOrigin'
> = {
  brandSlug: 'sealfast',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 14,
  countryOfOrigin: 'USA',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Type model ────────────────────────────────────────────────────────────

type CouplingFamily =
  | 'specialty-cam-groove'
  | 'thread-reducer'
  | 'bauer'
  | 'dry-disconnect'

type CouplingInput = {
  sku: string
  title: string
  category: string
  family: CouplingFamily
  couplingType: string
  endA: string
  endB: string
  sizeRange: string
  materials: string
  workingPressure: string
  sealOrGasket: string
  standards: string
  oneLiner: string
  notes?: string
}

const FAMILY_LABEL: Record<CouplingFamily, string> = {
  'specialty-cam-groove': 'Specialty Cam & Groove Coupling',
  'thread-reducer': 'Thread Reducer Fitting',
  bauer: 'Bauer Type Coupling',
  'dry-disconnect': 'Dry Disconnect Coupling',
}

const FAMILY_CONTEXT: Record<CouplingFamily, string> = {
  'specialty-cam-groove':
    'Sealfast specialty cam & groove couplings extend the standard Type A-F / DA-DD / DC-DP cam-and-groove range with bespoke end configurations: socket-weld for permanent pipe attachment (Type AW, DW), ANSI 150 flanged for refinery / chemical-plant standardisation (Type FA, FC), lockable dust caps for hazardous-fluid security (Type DCL), male-male spool adapters for adapter-to-adapter joining (Type SA, DD), and reducing variants for size transitions inline (AR, BR, BLN, CR, DR, DR, ER, DA reducing). Cam-and-groove geometry is industry-standard and interchangeable with Dixon, OPW, PT Coupling, Banjo of the same Type letter.',
  'thread-reducer':
    'Stainless-steel and brass thread reducers convert between BSP, NPT, and NPSM thread standards on instrument lines, sample lines, and low-pressure transfer assemblies. Used as inline adapters where the pipe-thread standard differs from the host-equipment standard.',
  bauer:
    'Bauer Type couplings (developed by Bauer GmbH, Austria, 1970s) are quick-connect couplings with a lever-ring locking mechanism, used extensively in agriculture, water transfer, irrigation, and dewatering service. Two end configurations engage by inserting one half into the other, then rotating the spring-loaded lever ring to lock. Sealfast manufactures Bauer-compatible couplings in zinc-plated steel for low-to-medium-pressure water and slurry service. Sizes 2"–8". Compatible with all Bauer-standard couplings (Bauer, Perrot, Selecta, etc.).',
  'dry-disconnect':
    'Sealfast Dry Disconnect couplings have an automatic shut-off valve in BOTH halves — when disconnected, both the coupler and adapter close their valves, eliminating product spillage. Used for fuel, solvent, acid, and aggressive-chemical transfer where any drip is unacceptable (chemical loading, refuelling, hazardous-fluid handling). Available with Viton (FKM) seals for petroleum / fuel / oil service, or PTFE seals for the most aggressive chemical service. Cam-and-groove style engagement on the connection face.',
}

// ── HTML description builder ──────────────────────────────────────────────

function couplingHtml(g: CouplingInput): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(FAMILY_LABEL[g.family])} from the Sealfast US industrial coupling range. Indus Hydraulics is an authorised Sealfast distributor in the UAE.</p>
<h3>Configuration</h3>
<ul>
<li><strong>Coupling family:</strong> ${escape(FAMILY_LABEL[g.family])}</li>
<li><strong>Coupling type:</strong> ${escape(g.couplingType)}</li>
<li><strong>End A:</strong> ${escape(g.endA)}</li>
<li><strong>End B:</strong> ${escape(g.endB)}</li>
</ul>
<h3>Specifications</h3>
<ul>
<li><strong>Size range:</strong> ${escape(g.sizeRange)}</li>
<li><strong>Materials available:</strong> ${escape(g.materials)}</li>
<li><strong>Working pressure:</strong> ${escape(g.workingPressure)}</li>
<li><strong>Seal / gasket:</strong> ${escape(g.sealOrGasket)}</li>
<li><strong>Applicable standards:</strong> ${escape(g.standards)}</li>
${g.notes ? `<li><strong>Notes:</strong> ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Family context</h3>
<p>${escape(FAMILY_CONTEXT[g.family])}</p>
<h3>How to order</h3>
<p>Specify (a) the size, (b) the body material from the available options, and (c) any special seal / gasket requirements. Indus engineering will confirm the exact Sealfast part number on the RFQ. For Bauer couplings, specify the Bauer-standard size code (2", 3", 4", 5", 6", 8") and end configuration. For Dry Disconnect, specify the seal compound (Viton FKM for petroleum / fuel; PTFE for aggressive chemical) — selection drives the part number.</p>
<h3>Companion products</h3>
<p>Pair with matching cam-and-groove halves (specialty cam-and-groove), Bauer-standard mating couplings (Bauer Type), or matching dry-disconnect adapter/coupler (Dry Disconnect). Browse the Sealfast Couplings range for the full product family.</p>`
}

// ── FAQs (8 per product) ──────────────────────────────────────────────────

function couplingFaqs(g: CouplingInput): FaqEntry[] {
  return [
    {
      q: `What is a ${FAMILY_LABEL[g.family]}?`,
      a: FAMILY_CONTEXT[g.family],
    },
    {
      q: 'What are the end configurations?',
      a: `End A: ${g.endA}. End B: ${g.endB}.`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Specify the size on the RFQ — Sealfast manufactures the full range; lead time depends on size and material.`,
    },
    {
      q: 'What materials does this coupling come in?',
      a: g.materials,
    },
    {
      q: 'What is the working pressure?',
      a: g.workingPressure,
    },
    {
      q: 'What seal / gasket is supplied?',
      a: g.sealOrGasket,
    },
    {
      q: 'Is this product compliant with industry standards?',
      a: `${g.standards}. ${g.family === 'specialty-cam-groove' ? 'Cam-and-groove geometry interchanges with Dixon, OPW, PT Coupling, and Banjo of the same Type letter and size.' : g.family === 'bauer' ? 'Compatible with all Bauer-standard couplings (Bauer, Perrot, Selecta, etc.).' : g.family === 'dry-disconnect' ? 'Dry-disconnect halves must be matched within the same brand / system; not always interchangeable across manufacturers.' : ''}`,
    },
    {
      q: 'Lead time?',
      a: 'Common sizes ex-Indus Dubai stock; less-common sizes / materials typically ship within 14-21 working days from RFQ confirmation.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeCoupling(g: CouplingInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'industrial-coupling-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: couplingHtml(g),
    specs: {
      coupling_family: FAMILY_LABEL[g.family],
      coupling_type: g.couplingType,
      end_a: g.endA,
      end_b: g.endB,
      size_range: g.sizeRange,
      materials_available: g.materials,
      working_pressure: g.workingPressure,
      seal_or_gasket: g.sealOrGasket,
      applicable_standards: g.standards,
      ...(g.notes ? { notes: g.notes } : {}),
    },
    faqs: couplingFaqs(g),
    seoTitle: `${g.title} — Sealfast | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `Sealfast ${FAMILY_LABEL[g.family]}`,
  }
}

// ── Spec template ─────────────────────────────────────────────────────────

const INDUSTRIAL_COUPLING_SPEC: SpecTemplatePayload = {
  slug: 'industrial-coupling-spec',
  name: 'Industrial Coupling Spec',
  description:
    'Spec template for industrial hose couplings beyond standard cam & groove: specialty cam & groove variants (socket-weld, flanged, reducing, lockable, spool), thread reducers, Bauer Type agriculture/water couplings, and Dry Disconnect chemical/fuel couplings. All-text fields for flexibility across the three coupling families.',
  position: 9,
  fields: [
    {
      key: 'coupling_family',
      label: 'Coupling Family',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'coupling_type',
      label: 'Coupling Type / Variant',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'end_a',
      label: 'End A Configuration',
      dataType: 'text',
      unit: null,
      group: 'Configuration',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 2,
    },
    {
      key: 'end_b',
      label: 'End B Configuration',
      dataType: 'text',
      unit: null,
      group: 'Configuration',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'size_range',
      label: 'Size Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'materials_available',
      label: 'Materials Available',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'working_pressure',
      label: 'Working Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 6,
    },
    {
      key: 'seal_or_gasket',
      label: 'Seal / Gasket',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'applicable_standards',
      label: 'Applicable Standards',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'notes',
      label: 'Notes',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
  ],
}

// ── Common spec values ────────────────────────────────────────────────────

const SPC_STANDARDS = 'MIL-A-A-59326 (US), EN 14420-7 (Europe), ANSI B16.5 (flanged variants)'
const SPC_GASKET = 'Buna-N (nitrile) standard. Viton (FKM), EPDM, PTFE, Neoprene available on request for chemical compatibility'
const SPC_PRESSURE = 'Up to 250 psi (1/2"–2"); 150 psi (3"–4"); 75 psi (5"–6") — derates with size, see datasheet'
const BAUER_STANDARDS = 'Bauer-standard (DIN-derivative for agriculture / water). Compatible with Bauer GmbH, Perrot, Selecta, and other Bauer-pattern couplings'
const BAUER_PRESSURE = 'Up to 16 bar (232 psi) — typical Bauer water-transfer service rating'
const BAUER_GASKET = 'Buna-N (nitrile) gasket on the female end. Viton, EPDM available on request'
const DD_STANDARDS = 'Sealfast Dry Disconnect proprietary geometry. Cam-and-groove style engagement face. Pair only with Sealfast dry-disconnect halves of the same size'
const DD_PRESSURE_VITON = 'Up to 150 psi at +20°C; derates above +80°C. Vacuum to 28" Hg. Refer to Viton compatibility chart for the host fluid'
const DD_PRESSURE_PTFE = 'Up to 150 psi at +20°C; PTFE seal extends chemical compatibility to aggressive acids / solvents (HCl, HF, organic solvents). Refer to PTFE compatibility chart'

// ── Product data ──────────────────────────────────────────────────────────

const PRODUCTS: CouplingInput[] = [
  // ── Specialty Adapters & Couplings (17) ─────────────────────────────────
  {
    sku: 'IH-SPC-AW',
    title: 'Type AW Socket Weld Adapter Specialty Cam and Groove Coupling',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type AW (Socket-Weld variant of Type A male adapter)',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler',
    endB: 'Socket weld bevel — welds directly to a Schedule 40 / 80 pipe end',
    sizeRange: '1", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type AW socket-weld adapter — male adapter on the cam side, socket-weld bevel on the back. For permanent pipe attachment without NPT thread sealing.',
  },
  {
    sku: 'IH-SPC-DW',
    title: 'Type DW Socket Weld Specialty Cam and Groove Coupling',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type DW (Socket-Weld variant of Type D female coupler)',
    endA: 'Female coupler (with cam arms) — engages a male adapter',
    endB: 'Socket weld bevel — welds directly to a Schedule 40 / 80 pipe end',
    sizeRange: '1", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type DW socket-weld coupler — female coupler on the cam side, socket-weld bevel on the back. Permanent pipe-end coupler for refinery / chemical-plant fixed-pipe service.',
  },
  {
    sku: 'IH-SPC-FA-150',
    title: '150# Flanged Type FA: Type FA ANSI Class 150 Flanged Specialty Adapter Fittings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type FA (ANSI Class 150 flanged variant of Type A male adapter)',
    endA: 'Male adapter (cam-grooved) — engages into a female coupler',
    endB: 'ANSI Class 150 RF (raised-face) flange — bolts to ANSI 150 mating flange',
    sizeRange: '1-1/2", 2", 3", 4", 6"',
    materials: '316 Stainless Steel, Aluminum',
    workingPressure: SPC_PRESSURE + '. Flange pressure rating per ANSI B16.5 Class 150',
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS + ', ANSI B16.5 Class 150',
    oneLiner: 'Sealfast Type FA flanged adapter — male cam adapter on the cam side, ANSI Class 150 raised-face flange on the back. For refinery / chemical-plant pipework standardised on flanged connections.',
  },
  {
    sku: 'IH-SPC-FC-150',
    title: '150# Flanged Type FC: Type FC ANSI Class 150 Flanged Couplers Stainless Steel',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type FC (ANSI Class 150 flanged female coupler)',
    endA: 'Female coupler (with cam arms) — engages a male adapter',
    endB: 'ANSI Class 150 RF (raised-face) flange — bolts to ANSI 150 mating flange',
    sizeRange: '1-1/2", 2", 3", 4", 6"',
    materials: '316 Stainless Steel only',
    workingPressure: SPC_PRESSURE + '. Flange pressure rating per ANSI B16.5 Class 150',
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS + ', ANSI B16.5 Class 150',
    oneLiner: 'Sealfast Type FC flanged female coupler in 316 SS — quick-disconnect female on the cam side, ANSI Class 150 RF flange on the back. SS for chemical / pharma service.',
  },
  {
    sku: 'IH-SPC-DCL',
    title: 'Type DCL Lockable Dust Caps (SS / Brass)',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type DCL (Lockable dust cap variant of Type DC)',
    endA: 'Female coupler dust cap with padlock-lockable cam arms',
    endB: 'Solid cap — closes a male adapter',
    sizeRange: '1", 1-1/2", 2", 3", 4"',
    materials: '316 Stainless Steel, Brass',
    workingPressure: 'Not designed for pressure — dust protection + tamper-resistance only',
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type DCL lockable dust cap — like a standard DC but with cam arms that accept a padlock to prevent tampering. For hazardous-fluid storage tanks and unattended service.',
    notes: 'Padlock NOT included. Order separately. Standard hasp accepts 5/16" shackle padlock.',
  },
  {
    sku: 'IH-SPC-SA',
    title: 'Type SA Male × Male Spool Adapter Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type SA (Male × Male spool adapter)',
    endA: 'Male adapter (cam-grooved)',
    endB: 'Male adapter (cam-grooved) — opposite end',
    sizeRange: '1", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, 316 Stainless Steel, Polypropylene',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type SA spool adapter — male cam adapter on BOTH ends. Joins two female couplers (Type B / C / D) coupler-to-coupler for hose-to-hose extension.',
  },
  {
    sku: 'IH-SPC-DD-SPOOL',
    title: 'Spool Adapters: Type DD Female × Female Coupler Spool',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type DD spool adapter (Female × Female cam coupler)',
    endA: 'Female coupler (with cam arms)',
    endB: 'Female coupler (with cam arms) — opposite end',
    sizeRange: '1", 1-1/2", 2", 3", 4"',
    materials: 'Aluminum, 316 Stainless Steel, Polypropylene',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type DD spool adapter — female coupler on BOTH ends. Joins two male adapters (Type A / E / F) adapter-to-adapter. Note: distinct from the DD elbow — this is a straight spool.',
  },
  {
    sku: 'IH-SPC-DA-RED',
    title: 'Reducer / Increaser: Type DA Female Coupler × Male Adapter Reducing Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type DA reducing (Female coupler × Male adapter, different sizes)',
    endA: 'Female coupler (with cam arms) — larger size',
    endB: 'Male adapter (cam-grooved) — smaller size',
    sizeRange: 'Reductions: 2"→1", 2"→1-1/2", 3"→2", 4"→3", 4"→2", 6"→4"',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE + ' (rated to the smaller of the two sizes)',
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type DA reducing coupling — female coupler on one end, male adapter on the other, with different cam sizes. Inline size transition without an additional fitting.',
  },
  {
    sku: 'IH-SPC-AR',
    title: 'Reducer / Increaser: Type AR Reducing A Male × Female NPT Specialty Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type AR (Reducing variant of Type A)',
    endA: 'Male adapter (cam-grooved) — larger size',
    endB: 'Female NPT thread — smaller size',
    sizeRange: 'Cam side 2"–4", NPT side typically one size smaller',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type AR reducing coupling — male cam adapter on the cam side, smaller female NPT thread on the back. Connects a small NPT pipe to a larger cam-and-groove female coupler.',
  },
  {
    sku: 'IH-SPC-BR',
    title: 'Reducer / Increaser: Reducing B Female Coupler × Male NPT Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Reducing Type B (Female coupler × Male NPT, different sizes)',
    endA: 'Female coupler (with cam arms) — larger size',
    endB: 'Male NPT thread — smaller size',
    sizeRange: 'Cam side 2"–4", NPT side typically one size smaller',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Reducing Type B coupling — female cam coupler on the cam side, smaller male NPT thread on the back. For connecting a hose with a larger Type E / F adapter to a smaller male NPT port.',
  },
  {
    sku: 'IH-SPC-BLN',
    title: 'Reducer / Increaser: Type BLN Longneck Female × Male NPT Specialty Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type BLN Longneck (Female cam × Male NPT with extended neck)',
    endA: 'Female coupler (with cam arms)',
    endB: 'Male NPT thread, on an extended-length body',
    sizeRange: '1-1/2", 2", 3"',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type BLN Longneck — Type B with an extended-length body. For applications where the female coupler must clear a deep recess or shoulder before reaching the NPT port.',
  },
  {
    sku: 'IH-SPC-CR',
    title: 'Reducer / Increaser: Type CR Female Coupler × Shank Reducing C Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type CR (Reducing variant of Type C)',
    endA: 'Female coupler (with cam arms) — larger size',
    endB: 'Barbed hose shank — smaller size',
    sizeRange: 'Cam side 2"–4", shank typically one size smaller',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type CR reducing — female cam coupler on the cam side, smaller barbed shank on the back. Connects a small-bore hose to a larger cam-and-groove adapter.',
  },
  {
    sku: 'IH-SPC-DR',
    title: 'Reducer / Increaser: Type DR Female Coupler × Female NPT Reducing D Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type DR (Reducing variant of Type D)',
    endA: 'Female coupler (with cam arms) — larger size',
    endB: 'Female NPT thread — smaller size',
    sizeRange: 'Cam side 2"–4", NPT side typically one size smaller',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type DR reducing — female cam coupler on the cam side, smaller female NPT on the back. Connects a small male NPT pipe to a larger cam-and-groove adapter.',
  },
  {
    sku: 'IH-SPC-ER',
    title: 'Reducer / Increaser: Type ER Male Adapter × Shank Reducing E Cam and Groove Couplings',
    category: 'specialty-adapters-couplings',
    family: 'specialty-cam-groove',
    couplingType: 'Type ER (Reducing variant of Type E)',
    endA: 'Male adapter (cam-grooved) — larger size',
    endB: 'Barbed hose shank — smaller size',
    sizeRange: 'Cam side 2"–4", shank typically one size smaller',
    materials: 'Aluminum, 316 Stainless Steel',
    workingPressure: SPC_PRESSURE,
    sealOrGasket: SPC_GASKET,
    standards: SPC_STANDARDS,
    oneLiner: 'Sealfast Type ER reducing — male cam adapter on the cam side, smaller barbed shank on the back. Connects a small-bore hose to a larger cam-and-groove female coupler.',
  },
  {
    sku: 'IH-SPC-TR-NPSM',
    title: 'Reducer / Increaser: 316SS Female NPSM × Male NPT Thread Reducer Fittings',
    category: 'specialty-adapters-couplings',
    family: 'thread-reducer',
    couplingType: 'Thread reducer (Female NPSM × Male NPT)',
    endA: 'Female NPSM straight pipe thread (parallel)',
    endB: 'Male NPT taper thread',
    sizeRange: '1/4", 3/8", 1/2", 3/4", 1"',
    materials: '316 Stainless Steel only',
    workingPressure: 'Up to 1500 psi at room temperature (refer to host pipe / fitting rating)',
    sealOrGasket: 'PTFE tape or anaerobic thread sealant required on NPT thread',
    standards: 'ANSI/ASME B1.20.1 (NPT), ANSI/ASME B1.20.1 (NPSM), ASTM A276 (316 SS)',
    oneLiner: 'Sealfast 316 SS thread reducer — female NPSM straight on one end, male NPT taper on the other. Converts between NPSM swivel-style and NPT taper-thread standards on instrument or sample lines.',
  },
  {
    sku: 'IH-SPC-TR-BSP',
    title: 'Reducer / Increaser: 316SS Female BSP × Male NPT Thread Reducer Fittings',
    category: 'specialty-adapters-couplings',
    family: 'thread-reducer',
    couplingType: 'Thread reducer (Female BSP × Male NPT)',
    endA: 'Female BSP (BSPP / BSPT) thread',
    endB: 'Male NPT taper thread',
    sizeRange: '1/4", 3/8", 1/2", 3/4", 1"',
    materials: '316 Stainless Steel only',
    workingPressure: 'Up to 1500 psi at room temperature (refer to host pipe / fitting rating)',
    sealOrGasket: 'PTFE tape or anaerobic thread sealant required on both threads',
    standards: 'ISO 228-1 (BSPP) / ISO 7-1 (BSPT), ANSI/ASME B1.20.1 (NPT), ASTM A276 (316 SS)',
    oneLiner: 'Sealfast 316 SS thread reducer — female BSP on one end, male NPT on the other. Converts between BSP (UK / EU) and NPT (US) thread standards on instrument lines.',
    notes: 'BSPP (parallel) is the most common variant. Specify BSPP vs BSPT on the RFQ.',
  },
  {
    sku: 'IH-SPC-TR-NPT',
    title: 'Reducer / Increaser: Male NPT × Female NPT Thread Reducer Fittings',
    category: 'specialty-adapters-couplings',
    family: 'thread-reducer',
    couplingType: 'Thread reducer (Male NPT × Female NPT, different sizes)',
    endA: 'Male NPT taper thread (larger)',
    endB: 'Female NPT taper thread (smaller)',
    sizeRange: 'Reductions: 1/2"→1/4", 3/4"→1/2", 1"→3/4", 1-1/4"→1", 2"→1-1/2"',
    materials: '316 Stainless Steel, Brass, Carbon Steel',
    workingPressure: 'Up to 1500 psi at room temperature',
    sealOrGasket: 'PTFE tape or anaerobic thread sealant required',
    standards: 'ANSI/ASME B1.20.1 (NPT)',
    oneLiner: 'Sealfast NPT × NPT thread reducer — male NPT one end, smaller female NPT the other. Inline size transition for NPT-threaded pipework.',
  },

  // ── Bauer Type Couplings (10) ───────────────────────────────────────────
  {
    sku: 'IH-BC-MALE-FEMALE',
    title: 'Zinc Plated Steel Male Threaded Female Bauer Type Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Female (with male threaded back)',
    endA: 'Bauer female end (open ring with internal flange seat for the male coupling tip)',
    endB: 'Male NPT / BSP threaded back',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Female × Male Threaded coupling — Bauer female end on the cam side, male NPT / BSP thread on the back. Connects a Bauer-pattern hose to a male-threaded port.',
  },
  {
    sku: 'IH-BC-MALE-MALE',
    title: 'Zinc Plated Steel Male Threaded Male Bauer Type Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Male (with male threaded back)',
    endA: 'Bauer male end (cylindrical tip with sealing groove)',
    endB: 'Male NPT / BSP threaded back',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Male × Male Threaded coupling — Bauer male end on the cam side, male NPT / BSP thread on the back. Connects a male-threaded port to a Bauer-pattern hose with a Bauer female end.',
  },
  {
    sku: 'IH-BC-FLANGE-MALE-SET',
    title: 'Zinc Plated Steel Flanged Bauer Type Male Threaded Coupling Complete Set',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Flanged Male Threaded Complete Set',
    endA: 'Bauer male end (flanged construction)',
    endB: 'Bauer female end (flanged construction) — paired set',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Flanged Male Threaded complete set — matching male and female Bauer couplings with bolted flange backs, supplied as a paired set ready for installation.',
  },
  {
    sku: 'IH-BC-SHANK-COMPLETE',
    title: 'Zinc Plated Steel Hose Shank Bauer Type Coupling Complete Set',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Hose Shank Complete Set',
    endA: 'Bauer male end (cylindrical tip)',
    endB: 'Bauer female end (open ring) — paired set, both with hose shanks',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Hose Shank complete set — matching male and female Bauer couplings, both with barbed hose shanks for hose-end mounting. Paired set for two hose ends.',
  },
  {
    sku: 'IH-BC-SHANK-FEMALE',
    title: 'Zinc Plated Steel Hose Shank Bauer Type Female Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Female (with hose shank back)',
    endA: 'Bauer female end',
    endB: 'Barbed hose shank — clamps onto a hose with hose bands',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Female × Hose Shank coupling — Bauer female on the cam side, barbed hose shank on the back. Hose-end coupling for the female mating half.',
  },
  {
    sku: 'IH-BC-SHANK-MALE',
    title: 'Zinc Plated Steel Hose Shank Bauer Type Male Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Male (with hose shank back)',
    endA: 'Bauer male end',
    endB: 'Barbed hose shank — clamps onto a hose with hose bands',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Male × Hose Shank coupling — Bauer male on the cam side, barbed hose shank on the back. Hose-end coupling for the male mating half.',
  },
  {
    sku: 'IH-BC-LEVER-RING',
    title: 'Zinc Plated Steel Lever Rings (Bauer Type)',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Lever Ring (replacement / spare part)',
    endA: 'Lever ring with twin lever handles for engaging the male tip into the female cup',
    endB: 'N/A — single-component lever ring',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS,
    oneLiner: 'Sealfast Bauer Lever Ring — replacement lever ring component for a Bauer female coupling. The lever handles compress against the male tip groove to seal the joint. Spare-parts SKU.',
    notes: 'Replacement / spare part. Order when refurbishing existing Bauer female couplings.',
  },
  {
    sku: 'IH-BC-FLANGE-FEMALE',
    title: 'Zinc Plated Steel Female Flanged Bauer Type Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Female (with bolted flange back)',
    endA: 'Bauer female end',
    endB: 'Bolted flange (typically PN 10 / DIN 2501 pattern)',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS + ', DIN 2501 PN 10 flange pattern',
    oneLiner: 'Sealfast Bauer Female × Bolted Flange coupling — Bauer female on the cam side, DIN 2501 PN 10 flange on the back. For permanent installation on bolted-flange equipment.',
  },
  {
    sku: 'IH-BC-FLANGE-MALE',
    title: 'Zinc Plated Steel Male Flanged Bauer Type Couplings',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Male (with bolted flange back)',
    endA: 'Bauer male end',
    endB: 'Bolted flange (typically PN 10 / DIN 2501 pattern)',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS + ', DIN 2501 PN 10 flange pattern',
    oneLiner: 'Sealfast Bauer Male × Bolted Flange coupling — Bauer male on the cam side, DIN 2501 PN 10 flange on the back. For permanent installation on bolted-flange equipment.',
  },
  {
    sku: 'IH-BC-FLANGE-SET',
    title: 'Zinc Plated Steel Flanged Bauer Type Coupling Complete Set',
    category: 'bauer-type-couplings',
    family: 'bauer',
    couplingType: 'Bauer Flanged Complete Set',
    endA: 'Bauer male end with bolted flange back',
    endB: 'Bauer female end with bolted flange back — paired set',
    sizeRange: '2", 3", 4", 5", 6"',
    materials: 'Zinc-plated carbon steel',
    workingPressure: BAUER_PRESSURE,
    sealOrGasket: BAUER_GASKET,
    standards: BAUER_STANDARDS + ', DIN 2501 PN 10 flange pattern',
    oneLiner: 'Sealfast Bauer Flanged Coupling complete set — matching male and female Bauer couplings, both with DIN 2501 PN 10 bolted flange backs. Paired set for permanent flanged installation on both ends.',
  },

  // ── Dry Disconnect Couplings (4) ────────────────────────────────────────
  {
    sku: 'IH-DDC-COUPLER-VITON',
    title: 'Aluminum Viton Coupler × Female NPT Dry Disconnect Couplings',
    category: 'dry-disconnect-couplings',
    family: 'dry-disconnect',
    couplingType: 'Dry Disconnect Coupler (Viton seal)',
    endA: 'Dry-disconnect coupler face (with automatic shut-off valve)',
    endB: 'Female NPT thread',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum body, 316 SS internal valve components',
    workingPressure: DD_PRESSURE_VITON,
    sealOrGasket: 'Viton (FKM) primary and shut-off valve seals',
    standards: DD_STANDARDS,
    oneLiner: 'Sealfast aluminum dry-disconnect coupler with Viton seals — coupler face on one end, female NPT thread on the other. Automatic shut-off valve eliminates spillage on disconnect. For petroleum, fuel, and Viton-compatible chemical service.',
  },
  {
    sku: 'IH-DDC-COUPLER-PTFE',
    title: 'Aluminum PTFE Coupler × Female NPT Dry Disconnect Couplings',
    category: 'dry-disconnect-couplings',
    family: 'dry-disconnect',
    couplingType: 'Dry Disconnect Coupler (PTFE-encapsulated seal)',
    endA: 'Dry-disconnect coupler face (with automatic shut-off valve)',
    endB: 'Female NPT thread',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum body, 316 SS internal valve components',
    workingPressure: DD_PRESSURE_PTFE,
    sealOrGasket: 'PTFE-encapsulated primary seals; PTFE shut-off valve seats',
    standards: DD_STANDARDS,
    oneLiner: 'Sealfast aluminum dry-disconnect coupler with PTFE seals — coupler face on one end, female NPT thread on the other. PTFE seals extend chemical compatibility to aggressive acids / solvents.',
  },
  {
    sku: 'IH-DDC-ADAPTER-VITON',
    title: 'Aluminum Viton Adapter × Female NPT Dry Disconnect Couplings',
    category: 'dry-disconnect-couplings',
    family: 'dry-disconnect',
    couplingType: 'Dry Disconnect Adapter (Viton seal)',
    endA: 'Dry-disconnect adapter face (with automatic shut-off valve)',
    endB: 'Female NPT thread',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum body, 316 SS internal valve components',
    workingPressure: DD_PRESSURE_VITON,
    sealOrGasket: 'Viton (FKM) primary and shut-off valve seals',
    standards: DD_STANDARDS,
    oneLiner: 'Sealfast aluminum dry-disconnect adapter with Viton seals — adapter face on one end, female NPT thread on the other. Mates with the dry-disconnect coupler for spillage-free fuel / petroleum transfer.',
  },
  {
    sku: 'IH-DDC-ADAPTER-PTFE',
    title: 'Aluminum PTFE Adapter × Female NPT Dry Disconnect Couplings',
    category: 'dry-disconnect-couplings',
    family: 'dry-disconnect',
    couplingType: 'Dry Disconnect Adapter (PTFE-encapsulated seal)',
    endA: 'Dry-disconnect adapter face (with automatic shut-off valve)',
    endB: 'Female NPT thread',
    sizeRange: '1-1/2", 2", 3", 4"',
    materials: 'Aluminum body, 316 SS internal valve components',
    workingPressure: DD_PRESSURE_PTFE,
    sealOrGasket: 'PTFE-encapsulated primary seals; PTFE shut-off valve seats',
    standards: DD_STANDARDS,
    oneLiner: 'Sealfast aluminum dry-disconnect adapter with PTFE seals — adapter face on one end, female NPT thread on the other. PTFE seals for aggressive chemical / acid / solvent service.',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-sealfast-specialty-bauer-dd',
    description:
      'Bulk-add 31 Sealfast industrial coupling products: 17 Specialty Cam & Groove Adapters & Couplings + 10 Bauer Type Couplings + 4 Dry Disconnect Couplings. Adds 3 new sub-categories under the existing industrial-hoses master and 1 new spec template (industrial-coupling-spec, 10 fields). Adds 3 new megamenu leaves to the existing "Couplings" sub-section under the Industrial Hoses column. Reuses Sealfast brand from PR #82.',
  },

  brands: [],

  categories: [
    {
      slug: 'specialty-adapters-couplings',
      name: 'Specialty Adapters & Couplings',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Specialty cam & groove couplings beyond the standard Type A-F / DA-DD range — socket-weld (AW, DW), ANSI Class 150 flanged (FA, FC), lockable dust caps (DCL), spool adapters (SA, DD spool), reducing variants (DA, AR, BR, BLN, CR, DR, ER), and stainless-steel thread reducers (NPSM/BSP/NPT).',
      position: 10,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-coupling-spec',
      seoTitle: 'Specialty Cam & Groove Adapters & Couplings — Sealfast | Indus Hydraulics',
      seoDescription:
        'Sealfast specialty cam & groove couplings: Type AW/DW socket-weld, FA/FC ANSI 150 flanged, DCL lockable, SA/DD spool, AR/BR/BLN/CR/DR/ER reducing, plus 316 SS thread reducers.',
    },
    {
      slug: 'bauer-type-couplings',
      name: 'Bauer Type Couplings',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Bauer Type quick-connect couplings with lever-ring locking mechanism — agriculture, water transfer, irrigation, dewatering. Zinc-plated steel construction, sizes 2"–6", up to 16 bar working pressure. Compatible with Bauer GmbH, Perrot, Selecta and other Bauer-pattern couplings.',
      position: 11,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-coupling-spec',
      seoTitle: 'Bauer Type Couplings — Agriculture / Water Transfer | Indus Hydraulics',
      seoDescription:
        'Sealfast Bauer Type couplings: zinc-plated steel for agriculture, irrigation, water transfer, dewatering. Male / female threaded, hose shank, flanged, lever rings. Sizes 2"-6", 16 bar.',
    },
    {
      slug: 'dry-disconnect-couplings',
      name: 'Dry Disconnect Couplings',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Dry Disconnect couplings — automatic shut-off valves in BOTH halves eliminate product spillage on disconnect. For fuel, solvent, acid, and aggressive-chemical transfer. Aluminum body, 316 SS internal valves, Viton or PTFE seals.',
      position: 12,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-coupling-spec',
      seoTitle: 'Dry Disconnect Couplings — Fuel / Chemical Transfer | Indus Hydraulics',
      seoDescription:
        'Sealfast Dry Disconnect couplings: automatic shut-off valve in both halves, zero-spillage fuel / solvent / chemical transfer. Aluminum body, Viton or PTFE seals, 1-1/2"-4".',
    },
  ],

  specTemplates: [INDUSTRIAL_COUPLING_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'industrial-hoses',
    parentSubLabel: 'Couplings',
    replacements: [
      { label: 'Cam & Groove Couplings', categorySlug: 'cam-and-groove-couplings' },
      { label: 'Specialty Adapters & Couplings', categorySlug: 'specialty-adapters-couplings' },
      { label: 'Bauer Type Couplings', categorySlug: 'bauer-type-couplings' },
      { label: 'Dry Disconnect Couplings', categorySlug: 'dry-disconnect-couplings' },
    ],
  },

  products: PRODUCTS.map(makeCoupling),
}

export default batch
