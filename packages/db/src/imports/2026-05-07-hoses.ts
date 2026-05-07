/**
 * Bulk hose import — 2026-05-07
 *
 * 14 hydraulic hoses + 2 thermoplastic hoses, plus the categories, brands,
 * spec template, and megamenu links they need.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-hoses.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-hoses.ts
 *
 * Spec values come from SAE J517 / EN 853 / EN 856 / EN 857 reference data
 * for representative bore sizes — figures are conservative across the
 * range; refer to grade-specific datasheets for size-by-size pressure tables.
 *
 * Brand mapping (decided in plan): 8 Eaton Aeroquip, 4 Eaton Winner, 4
 * Parker Hannifin. Parker exists with slug "parker" (not "parker-hannifin")
 * — products reference the existing record. Aeroquip and Winner are created
 * fresh with isAuthorizedDistributor: true (confirmed by user).
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
} from '../import/types'

// ── Domain knowledge ──────────────────────────────────────────────────────

type Brand = 'eaton-aeroquip' | 'eaton-winner' | 'parker'
type CategorySlug = 'hydraulic-hoses' | 'thermoplastic-hoses'

const BRAND_DISPLAY: Record<Brand, string> = {
  'eaton-aeroquip': 'Eaton Aeroquip',
  'eaton-winner': 'Eaton Winner',
  parker: 'Parker Hannifin',
}

type GradeInput = {
  sku: string
  brand: Brand
  category: CategorySlug
  title: string
  /** Full standard string e.g. "SAE 100R2AT / EN 853 2SN". The first token
   *  before " / " becomes the focus keyword and SEO title prefix. */
  standard: string
  /** Must match one of the spec template's `construction_type` select options. */
  constructionType:
    | '1-wire-braid'
    | '2-wire-braid'
    | 'compact-1-wire'
    | 'compact-2-wire'
    | '4-spiral'
    | '6-spiral'
    | 'multi-spiral'
    | 'textile-braid'
    | 'textile-cover'
    | 'ptfe-thermoplastic'
    | 'fiber-braid-thermoplastic'
  boreSizeRange: string
  pressureWorkingMax: number // bar — at the smallest bore (i.e. peak rating)
  pressureBurstMin: number // bar
  safetyFactor: string
  tempMin: number // °C
  tempMax: number // °C
  bendRadius: string
  reinforcement: string
  tubeMaterial: string
  coverMaterial: string
  coverFinish: 'smooth' | 'wrapped' | 'perforated'
  conductivity: 'conductive' | 'non-conductive' | 'static-dissipative'
  /** One-liner for the listing card AND lead paragraph. ≤140 chars. */
  oneLiner: string
  /** Bullet points for the Applications section. */
  applications: string[]
  /** "For higher pressures see X. For tighter routing see Y." — links the
   *  grade to its catalogue siblings without hard-coding URLs. */
  companion: string
  /** Manufacturing origin — Aeroquip = USA, Winner = China, Parker = USA. */
  countryOfOrigin: string
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** First identifier in a "SAE 100R2AT / EN 853 2SN" string — used as focus
 *  keyword + SEO title prefix. */
function focusKeyword(standard: string): string {
  return standard.split(' / ')[0]!.trim()
}

/** "Eaton Aeroquip and Parker Hannifin" — the two brands NOT chosen for the
 *  primary brand on this product. Used in the long description's "Also
 *  available in" paragraph. */
function alsoAvailableIn(primary: Brand): string {
  const others = (Object.keys(BRAND_DISPLAY) as Brand[]).filter((b) => b !== primary)
  const names = others.map((b) => BRAND_DISPLAY[b])
  return names.length === 2 ? `${names[0]} and ${names[1]}` : names.join(', ')
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildLongDescription(g: GradeInput): string {
  const fk = focusKeyword(g.standard)
  const alsoIn = alsoAvailableIn(g.brand)
  return `<p>The <strong>${escape(g.title)}</strong> ${escape(g.oneLiner)} Conforms to ${escape(g.standard)}.</p>
<h3>Construction</h3>
<ul>
<li>Tube: ${escape(g.tubeMaterial)}</li>
<li>Reinforcement: ${escape(g.reinforcement)}</li>
<li>Cover: ${escape(g.coverMaterial)}, ${escape(g.coverFinish)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressures up to ${g.pressureWorkingMax} bar at the smallest bore, with a minimum burst of ${g.pressureBurstMin} bar (safety factor ${escape(g.safetyFactor)}). Continuous service from ${g.tempMin}°C to ${g.tempMax}°C, with the upper limit reduced for aggressive fluids — ask for a fluid compatibility chart if needed.</p>
<h3>Applications</h3>
<ul>
${g.applications.map((a) => `<li>${escape(a)}</li>`).join('\n')}
</ul>
<h3>Compliance</h3>
<ul>
${g.standard
  .split(' / ')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
${g.coverMaterial.toLowerCase().includes('msha') ? '<li>MSHA-accepted cover</li>' : ''}
</ul>
<h3>Also available in</h3>
<p>The same ${escape(fk)} grade is stocked in ${escape(alsoIn)} in addition to the ${escape(BRAND_DISPLAY[g.brand])} reference shown here. Tell us your brand preference on the RFQ and we will quote accordingly.</p>
<h3>Companion grades</h3>
<p>${escape(g.companion)}</p>`
}

function buildFaqs(g: GradeInput): FaqEntry[] {
  const fk = focusKeyword(g.standard)
  return [
    {
      q: `What standard does this hose comply with?`,
      a: `It conforms to ${g.standard}.`,
    },
    {
      q: `What is the maximum working pressure?`,
      a: `Up to ${g.pressureWorkingMax} bar at the smallest bore, scaling down at larger bores. Exact figure depends on inner diameter — request a size-specific datasheet on the RFQ.`,
    },
    {
      q: `What temperature range is supported?`,
      a: `${g.tempMin}°C to ${g.tempMax}°C continuous service. Aggressive fluids (phosphate-ester, water-glycol, certain biodegradables) reduce the upper limit; ask for a fluid compatibility chart.`,
    },
    {
      q: `What bore sizes are available?`,
      a: `${g.boreSizeRange}. Common sizes are ex-stock; less common bores have a short lead time.`,
    },
    {
      q: `Is this hose conductive?`,
      a:
        g.conductivity === 'conductive'
          ? `Conductive cover. The reinforcement and cover form a continuous electrical path — confirm with the application's grounding requirements.`
          : g.conductivity === 'static-dissipative'
            ? `Static-dissipative cover — designed to bleed off static charge while remaining electrically isolated for safety.`
            : `Non-conductive cover. The reinforcement carries continuity but is sleeved by the cover — safe for routing near energised circuits per most plant standards.`,
    },
    {
      q: `What end fittings are recommended?`,
      a: g.constructionType.includes('thermoplastic') || g.constructionType === 'ptfe-thermoplastic'
        ? `Reusable and crimped fittings are both available. Specify your termination (JIC 37°, ORFS, BSP, NPT, metric 24°) on the RFQ and we will recommend a matched ferrule and crimp die.`
        : `Standard hydraulic fittings — JIC 37°, ORFS, BSP, NPT, and metric 24° flat-face — are crimped on this grade. Specify your termination on the RFQ and we will quote with a matched ferrule and crimp die.`,
    },
    {
      q: `How is this hose sold?`,
      a: `Per metre cut-to-length, or as a full coil. Add the bore size, length, and any fitting requirements to your RFQ; we will quote inclusive of crimping where applicable.`,
    },
    {
      q: `What is the typical lead time?`,
      a: `Common sizes are ex-stock from our Dubai warehouse. Less common bores or full coils typically ship within 7 working days.`,
    },
  ]
}

/** Translate a GradeInput into a fully-formed ProductImportPayload. */
function makeProduct(g: GradeInput): ProductImportPayload {
  const fk = focusKeyword(g.standard)
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brand,
    categorySlug: g.category,
    specTemplateSlug: 'hydraulic-hose-spec',
    status: 'active',
    unitOfMeasure: 'metre',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: 7,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: `${g.oneLiner} ${g.boreSizeRange}.`.slice(0, 500),
    descriptionLong: buildLongDescription(g),
    specs: {
      standard: g.standard,
      construction_type: g.constructionType,
      bore_size_range: g.boreSizeRange,
      pressure_working_max: g.pressureWorkingMax,
      pressure_burst_min: g.pressureBurstMin,
      safety_factor: g.safetyFactor,
      temp_min: g.tempMin,
      temp_max: g.tempMax,
      bend_radius: g.bendRadius,
      reinforcement: g.reinforcement,
      tube_material: g.tubeMaterial,
      cover_material: g.coverMaterial,
      cover_finish: g.coverFinish,
      conductivity: g.conductivity,
      sold_by: 'per-metre',
    },
    faqs: buildFaqs(g),
    seoTitle: `${fk} ${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: fk,
  }
}

// ── Grade data — 16 entries ───────────────────────────────────────────────

const HOSES_HYDRAULIC: GradeInput[] = [
  // ── Winner: standard SAE/EN steel-braid ─────────────────────────────────
  {
    sku: 'IH-HOSE-R1-1SN',
    brand: 'eaton-winner',
    category: 'hydraulic-hoses',
    title: 'R1 1SN Single Wire Braid Hydraulic Hose',
    standard: 'SAE 100R1AT / EN 853 1SN',
    constructionType: '1-wire-braid',
    boreSizeRange: '1/4" – 2" (DN6 – DN51)',
    pressureWorkingMax: 230,
    pressureBurstMin: 920,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per size table (DIN 20066)',
    reinforcement: 'One layer of high-tensile steel wire braid',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Single-wire braid medium-pressure hydraulic hose for general industrial and mobile hydraulics.',
    applications: [
      'General-purpose hydraulics on machine tools and power units',
      'Mobile equipment — agricultural, light construction, materials handling',
      'Hydraulic return-line and pilot-line service',
    ],
    companion: 'For higher pressures see R2 2SN. For tighter routing see the 1SC compact equivalent.',
    countryOfOrigin: 'China',
  },
  {
    sku: 'IH-HOSE-R2-2SN',
    brand: 'eaton-winner',
    category: 'hydraulic-hoses',
    title: 'R2 2SN Double Wire Braid Hydraulic Hose',
    standard: 'SAE 100R2AT / EN 853 2SN',
    constructionType: '2-wire-braid',
    boreSizeRange: '1/4" – 2" (DN6 – DN51)',
    pressureWorkingMax: 415,
    pressureBurstMin: 1660,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per size table (DIN 20066)',
    reinforcement: 'Two layers of high-tensile steel wire braid',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Two-wire braid medium-to-high-pressure hydraulic hose — the workhorse of general hydraulics.',
    applications: [
      'Mobile hydraulics — construction, agricultural, materials handling',
      'Hydraulic power units and industrial equipment',
      'General-purpose hydraulic lines on machine tools',
    ],
    companion: 'For higher pressures see R12 / R13 / R15 multi-spiral. For tighter routing see the 2SC compact two-wire equivalent.',
    countryOfOrigin: 'China',
  },
  {
    sku: 'IH-HOSE-R3',
    brand: 'eaton-winner',
    category: 'hydraulic-hoses',
    title: 'R3 Two-Fibre Braid Hydraulic Hose',
    standard: 'SAE 100R3',
    constructionType: 'textile-braid',
    boreSizeRange: '1/4" – 1-1/2" (DN6 – DN38)',
    pressureWorkingMax: 85,
    pressureBurstMin: 340,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per size table',
    reinforcement: 'Two textile braids (high-tensile yarn)',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, weather-resistant',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Two-fibre-braid low-to-medium-pressure hydraulic hose for return-line and low-pressure delivery.',
    applications: [
      'Return-line service on hydraulic systems',
      'Low-pressure delivery and tank lines',
      'Light-duty agricultural and industrial hydraulics',
    ],
    companion: 'For higher pressures step up to R1 1SN (single wire braid). For lower-pressure air/water applications see R6.',
    countryOfOrigin: 'China',
  },
  {
    sku: 'IH-HOSE-R6',
    brand: 'eaton-winner',
    category: 'hydraulic-hoses',
    title: 'R6 Single Fibre Braid Low-Pressure Hose',
    standard: 'SAE 100R6',
    constructionType: 'fiber-braid-thermoplastic',
    boreSizeRange: '1/4" – 1" (DN6 – DN25)',
    pressureWorkingMax: 21,
    pressureBurstMin: 84,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per size table',
    reinforcement: 'One textile braid',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, weather-resistant',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Single-fibre-braid low-pressure hose for fuel, oil, air, and mild hydraulic service.',
    applications: [
      'Fuel and lubricating oil transfer',
      'Compressed-air lines on light-duty equipment',
      'Anti-static drain lines on agricultural machinery',
    ],
    companion: 'For higher hydraulic pressures see R3 (two-fibre) or step up to R1 1SN (wire braid).',
    countryOfOrigin: 'China',
  },

  // ── Aeroquip: premium / compact / spiral ────────────────────────────────
  {
    sku: 'IH-HOSE-R1-1SC',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: 'R1 1SC Compact Single Wire Braid Hose',
    standard: 'EN 857 1SC',
    constructionType: 'compact-1-wire',
    boreSizeRange: '1/4" – 1-1/4" (DN6 – DN31)',
    pressureWorkingMax: 250,
    pressureBurstMin: 1000,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'half of EN 853 1SN at the same bore',
    reinforcement: 'One layer of high-tensile steel wire braid',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Compact single-wire-braid hose with half the bend radius of EN 853 1SN — for tight routing in mobile equipment.',
    applications: [
      'Tight routing on mobile hydraulics where space is constrained',
      'Skid-steer loaders, mini-excavators, telehandlers',
      'Replacement of larger-OD R1 1SN where space saving is critical',
    ],
    companion: 'For higher pressures in compact construction see 2SC. For standard EN 853 dimensions see R1 1SN.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-2SC',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: '2SC Compact Two Wire Braid Hose',
    standard: 'EN 857 2SC',
    constructionType: 'compact-2-wire',
    boreSizeRange: '1/4" – 1-1/4" (DN6 – DN31)',
    pressureWorkingMax: 450,
    pressureBurstMin: 1800,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'half of EN 853 2SN at the same bore',
    reinforcement: 'Two layers of high-tensile steel wire braid',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Compact two-wire-braid hose for high-pressure mobile hydraulics in tight routing scenarios.',
    applications: [
      'High-pressure mobile equipment with tight routing',
      'Hydraulic attachments on skid-steers and excavators',
      'Replacement of bulkier R2 2SN where bend radius is critical',
    ],
    companion: 'For standard EN 853 dimensions see R2 2SN. For higher pressures step up to 4SP / 4SH multi-spiral.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-4SP',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: '4SP Four-Spiral Hydraulic Hose',
    standard: 'EN 856 4SP',
    constructionType: '4-spiral',
    boreSizeRange: '3/8" – 2" (DN10 – DN51)',
    pressureWorkingMax: 450,
    pressureBurstMin: 1800,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per EN 856 size table',
    reinforcement: 'Four alternating layers of high-tensile spiralled steel wire',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Four-spiral high-pressure hose for heavy-duty hydraulic systems with sustained high working pressures.',
    applications: [
      'Heavy construction equipment — wheel loaders, dozers, excavators',
      'Hydraulic presses and forging machinery',
      'High-pressure power units in industrial plants',
    ],
    companion: 'For ultra-high pressures see 4SH or 6-spiral R15. For uniform high pressure across all bores see R13.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-4SH',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: '4SH Four-Spiral Heavy-Duty Hydraulic Hose',
    standard: 'EN 856 4SH',
    constructionType: '4-spiral',
    boreSizeRange: '3/4" – 2" (DN19 – DN51)',
    pressureWorkingMax: 420,
    pressureBurstMin: 1680,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'per EN 856 size table',
    reinforcement: 'Four alternating layers of high-tensile spiralled steel wire (heavy gauge)',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Heavy-gauge four-spiral hose with uniform 420 bar working pressure across the larger-bore range.',
    applications: [
      'Heavy-duty earth-moving and mining equipment',
      'Large-bore hydraulic press lines',
      'Industrial hydraulics where uniform high pressure is required at 3/4" and above',
    ],
    companion: 'For smaller bores at similar pressures see 4SP. For ultra-high-pressure 6-spiral see R15.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R12',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: 'R12 Four-Spiral High-Pressure Hose',
    standard: 'SAE 100R12',
    constructionType: '4-spiral',
    boreSizeRange: '3/8" – 2" (DN10 – DN51)',
    pressureWorkingMax: 280,
    pressureBurstMin: 1120,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 121,
    bendRadius: 'per SAE J517 size table',
    reinforcement: 'Four alternating layers of spiralled steel wire',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'SAE 100R12 four-spiral hose with uniform 280 bar working pressure across all bores.',
    applications: [
      'Industrial and mobile hydraulics needing uniform pressure across bore sizes',
      'Hydraulic main-line service on heavy equipment',
      'High-pressure return loops on press circuits',
    ],
    companion: 'For higher pressures see R13. For 4-spiral premium grade see EN 856 4SP / 4SH.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R13',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: 'R13 Multi-Spiral Very-High-Pressure Hose',
    standard: 'SAE 100R13',
    constructionType: 'multi-spiral',
    boreSizeRange: '3/8" – 2" (DN10 – DN51)',
    pressureWorkingMax: 345,
    pressureBurstMin: 1380,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 121,
    bendRadius: 'per SAE J517 size table',
    reinforcement: 'Four or six alternating layers of spiralled steel wire (multi-spiral construction)',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'SAE 100R13 multi-spiral hose with uniform 345 bar working pressure for very-high-pressure hydraulics.',
    applications: [
      'Hydraulic mining and construction equipment under sustained high load',
      'Heavy-duty industrial hydraulics — presses, injection moulding',
      'Off-highway equipment in demanding service',
    ],
    companion: 'For ultra-high pressures see R15 6-spiral. For lower pressures with similar geometry see R12.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R15',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: 'R15 Six-Spiral Ultra-High-Pressure Hose',
    standard: 'SAE 100R15',
    constructionType: '6-spiral',
    boreSizeRange: '3/8" – 1-1/2" (DN10 – DN38)',
    pressureWorkingMax: 420,
    pressureBurstMin: 1680,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 121,
    bendRadius: 'per SAE J517 size table',
    reinforcement: 'Six alternating layers of spiralled steel wire',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion-resistant, MSHA-accepted',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'SAE 100R15 six-spiral hose with uniform 420 bar working pressure for ultra-high-pressure hydraulics.',
    applications: [
      'Ultra-high-pressure hydraulics on mining and forestry equipment',
      'Heavy industrial presses and forging machinery',
      'Specialty hydraulic systems beyond R13 capacity',
    ],
    companion: 'For lower pressure / wider bore range see R13. For 4-spiral premium see EN 856 4SH.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R17',
    brand: 'eaton-aeroquip',
    category: 'hydraulic-hoses',
    title: 'R17 Compact High-Pressure Hose',
    standard: 'SAE 100R17',
    constructionType: '1-wire-braid',
    boreSizeRange: '1/4" – 1" (DN6 – DN25)',
    pressureWorkingMax: 210,
    pressureBurstMin: 840,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 100,
    bendRadius: 'half of standard 2-wire at the same bore',
    reinforcement: 'One or two layers of high-tensile steel wire braid (uniform-pressure construction)',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Synthetic rubber, abrasion- and weather-resistant',
    coverFinish: 'wrapped',
    conductivity: 'non-conductive',
    oneLiner: 'Compact single-wire-braid hose delivering 2-wire-class pressures at 1-wire dimensions and bend radius.',
    applications: [
      'Mobile hydraulics where space and routing constraints matter',
      'Replacement of bulkier R2 2SN at moderate pressures',
      'Light-to-medium machinery requiring tight routing',
    ],
    companion: 'For higher pressures step up to R2 2SN or 2SC compact. For lower pressures see R1 1SN.',
    countryOfOrigin: 'USA',
  },

  // ── Parker: specialty (textile cover, PTFE, thermoplastic) ──────────────
  {
    sku: 'IH-HOSE-R5',
    brand: 'parker',
    category: 'hydraulic-hoses',
    title: 'R5 Textile-Cover Single Wire Braid Hose',
    standard: 'SAE 100R5',
    constructionType: 'textile-cover',
    boreSizeRange: '3/16" – 2" (DN5 – DN51)',
    pressureWorkingMax: 210,
    pressureBurstMin: 840,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 121,
    bendRadius: 'per SAE J517 size table',
    reinforcement: 'One layer of high-tensile steel wire braid under a textile-braid cover',
    tubeMaterial: 'Synthetic rubber (NBR), oil-resistant',
    coverMaterial: 'Textile braid (cotton/polyester), exposing the wire braid for inspection',
    coverFinish: 'smooth',
    conductivity: 'non-conductive',
    oneLiner: 'Textile-cover single-wire-braid hose for fuel, oil, air, and refrigerant lines on legacy and military equipment.',
    applications: [
      'Truck and bus fuel/oil lines',
      'Air and water service on industrial equipment',
      'Legacy hydraulic systems specifying textile-cover hose',
    ],
    companion: 'For modern rubber-cover dimensions see R1 1SN. For thermoplastic equivalents see R7 / R8.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R14',
    brand: 'parker',
    category: 'hydraulic-hoses',
    title: 'R14 PTFE Hydraulic Hose',
    standard: 'SAE 100R14',
    constructionType: 'ptfe-thermoplastic',
    boreSizeRange: '3/16" – 1" (DN5 – DN25)',
    pressureWorkingMax: 210,
    pressureBurstMin: 840,
    safetyFactor: '4:1',
    tempMin: -54,
    tempMax: 204,
    bendRadius: 'per Parker Parflex datasheet',
    reinforcement: 'Single layer of stainless-steel braid (Type A) or stainless braid + Aramid (Type B)',
    tubeMaterial: 'Virgin PTFE (chemically inert)',
    coverMaterial: 'Stainless-steel braid (exposed) or polyurethane jacket',
    coverFinish: 'smooth',
    conductivity: 'static-dissipative',
    oneLiner: 'PTFE-tube hose with stainless braid for chemicals, food/beverage, steam, and high-temperature hydraulic service.',
    applications: [
      'Chemical transfer where PTFE chemical inertness is required',
      'Steam and high-temperature service to +204°C',
      'Food, beverage, and pharmaceutical applications (FDA-grade PTFE on request)',
      'Hydraulic systems with aggressive fluids — phosphate ester, water-glycol',
    ],
    companion: 'For lower temperatures with similar chemical resistance see R7 / R8 thermoplastic. For higher pressures in steel construction see R12 / R13.',
    countryOfOrigin: 'USA',
  },
]

const HOSES_THERMOPLASTIC: GradeInput[] = [
  {
    sku: 'IH-HOSE-R7-TP',
    brand: 'parker',
    category: 'thermoplastic-hoses',
    title: 'R7 Thermoplastic Hydraulic Hose',
    standard: 'SAE 100R7',
    constructionType: 'fiber-braid-thermoplastic',
    boreSizeRange: '1/8" – 1" (DN3 – DN25)',
    pressureWorkingMax: 210,
    pressureBurstMin: 840,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 93,
    bendRadius: 'tighter than equivalent rubber hose at same pressure',
    reinforcement: 'One layer of synthetic-fibre braid',
    tubeMaterial: 'Polyamide (nylon), hydraulic-fluid-resistant',
    coverMaterial: 'Polyurethane, abrasion- and weather-resistant',
    coverFinish: 'smooth',
    conductivity: 'non-conductive',
    oneLiner: 'Single-fibre-braid thermoplastic hose — lightweight alternative to R1 1SN with tighter bend radius and abrasion resistance.',
    applications: [
      'Lift trucks and aerial work platforms',
      'Hydraulic equipment where weight savings matter',
      'Small-bore control and pilot lines',
      'Robotics and articulated machinery requiring flex life',
    ],
    companion: 'For higher pressures see R8 thermoplastic (double-fibre braid). For temperatures above 93°C see R14 PTFE.',
    countryOfOrigin: 'USA',
  },
  {
    sku: 'IH-HOSE-R8-TP',
    brand: 'parker',
    category: 'thermoplastic-hoses',
    title: 'R8 Thermoplastic Hydraulic Hose',
    standard: 'SAE 100R8',
    constructionType: 'fiber-braid-thermoplastic',
    boreSizeRange: '1/8" – 1" (DN3 – DN25)',
    pressureWorkingMax: 350,
    pressureBurstMin: 1400,
    safetyFactor: '4:1',
    tempMin: -40,
    tempMax: 93,
    bendRadius: 'tighter than equivalent rubber hose at same pressure',
    reinforcement: 'Two layers of synthetic-fibre braid',
    tubeMaterial: 'Polyamide (nylon), hydraulic-fluid-resistant',
    coverMaterial: 'Polyurethane, abrasion- and weather-resistant',
    coverFinish: 'smooth',
    conductivity: 'non-conductive',
    oneLiner: 'Double-fibre-braid thermoplastic hose with R2-class working pressure and 30% lighter than rubber.',
    applications: [
      'Aerial work platforms, scissor lifts, articulated booms',
      'Hydraulic equipment in weight-sensitive applications',
      'Replacement of R2 2SN where flex life and weight matter',
      'Control circuits requiring tight routing and high pressure',
    ],
    companion: 'For lower-pressure thermoplastic see R7. For PTFE at high temperature see R14. For traditional rubber-and-wire R2 2SN, see the hydraulic-hoses category.',
    countryOfOrigin: 'USA',
  },
]

const ALL_GRADES: GradeInput[] = [...HOSES_HYDRAULIC, ...HOSES_THERMOPLASTIC]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-hoses',
    description:
      'Bulk-add 14 hydraulic + 2 thermoplastic hose products with full SAE/EN spec data, FAQs, and megamenu integration. Three brands: Eaton Aeroquip (8), Eaton Winner (4), Parker Hannifin (4).',
  },

  brands: [
    {
      slug: 'eaton-aeroquip',
      name: 'Eaton Aeroquip',
      country: 'USA',
      description:
        'Eaton Aeroquip — premium-tier hydraulic hose, fittings, and assemblies. Industry-leading multi-spiral and compact constructions for heavy-duty mobile and industrial hydraulics.',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Eaton Aeroquip Hydraulic Hose — Authorised Distributor | Indus Hydraulics',
      seoDescription:
        'Authorised Eaton Aeroquip distributor in the UAE. Full range of premium hydraulic hose: 1SC, 2SC, 4SP, 4SH, R12, R13, R15, R17. Cut-to-length and crimping service.',
    },
    {
      slug: 'eaton-winner',
      name: 'Eaton Winner',
      country: 'China',
      description:
        'Eaton Winner — global standard SAE/EN hydraulic hose line. Cost-effective workhorse grades 1SN, 2SN, R3, R6 for general industrial and mobile hydraulics.',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Eaton Winner Hydraulic Hose — Authorised Distributor | Indus Hydraulics',
      seoDescription:
        'Authorised Eaton Winner distributor in the UAE. SAE 100R1, 100R2, 100R3, 100R6 hydraulic hose stocked in Dubai. Cut-to-length and crimping service.',
    },
    // Parker (slug: "parker") already exists — not in this list (would needlessly
    // overwrite its existing fields). Products reference brandSlug: 'parker'.
  ],

  categories: [
    {
      slug: 'hydraulic-hoses',
      name: 'Hydraulic Hoses',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Single-wire, two-wire, compact, four-spiral, six-spiral, and PTFE hydraulic hoses to SAE J517 and EN standards. Cut-to-length, crimped, and tested.',
      position: 1,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-hose-spec',
      seoTitle: 'Hydraulic Hoses — SAE & EN Grades | Indus Hydraulics',
      seoDescription:
        'Hydraulic hose to SAE J517 and EN 853 / EN 856 / EN 857 standards. Single-wire, two-wire, multi-spiral, and PTFE construction. Authorised distributor of Eaton Aeroquip, Winner, and Parker Hannifin.',
    },
    {
      slug: 'thermoplastic-hoses',
      name: 'Thermoplastic Hoses',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Lightweight thermoplastic hoses (SAE 100R7 / R8) — fibre-braid reinforced, polyurethane cover, tighter bend radius and superior flex life vs. rubber.',
      position: 2,
      isPublished: true,
      defaultSpecTemplateSlug: 'hydraulic-hose-spec',
      seoTitle: 'Thermoplastic Hoses — SAE 100R7 / R8 | Indus Hydraulics',
      seoDescription:
        'Thermoplastic hydraulic hose for aerial platforms, lift trucks, and weight-sensitive applications. R7 single-fibre and R8 double-fibre constructions, polyurethane cover.',
    },
  ],

  specTemplates: [
    {
      slug: 'hydraulic-hose-spec',
      name: 'Hydraulic Hose Spec',
      description:
        'Spec template for hydraulic and thermoplastic hose products. 15 fields covering identification, dimensions, performance, construction, compliance, and commercial.',
      position: 0,
      fields: [
        {
          key: 'standard',
          label: 'Applicable Standard',
          dataType: 'text',
          unit: null,
          group: 'Identification',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: true,
          position: 0,
        },
        {
          key: 'construction_type',
          label: 'Construction Type',
          dataType: 'select',
          unit: null,
          group: 'Identification',
          options: [
            '1-wire-braid',
            '2-wire-braid',
            'compact-1-wire',
            'compact-2-wire',
            '4-spiral',
            '6-spiral',
            'multi-spiral',
            'textile-braid',
            'textile-cover',
            'ptfe-thermoplastic',
            'fiber-braid-thermoplastic',
          ],
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: true,
          position: 1,
        },
        {
          key: 'bore_size_range',
          label: 'Bore Size Range',
          dataType: 'text',
          unit: null,
          group: 'Dimensions',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: true,
          position: 2,
        },
        {
          key: 'pressure_working_max',
          label: 'Max Working Pressure',
          dataType: 'number',
          unit: 'bar',
          group: 'Performance',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: true,
          position: 3,
        },
        {
          key: 'pressure_burst_min',
          label: 'Min Burst Pressure',
          dataType: 'number',
          unit: 'bar',
          group: 'Performance',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: false,
          position: 4,
        },
        {
          key: 'safety_factor',
          label: 'Safety Factor',
          dataType: 'text',
          unit: null,
          group: 'Performance',
          isRequired: false,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 5,
        },
        {
          key: 'temp_min',
          label: 'Min Operating Temperature',
          dataType: 'number',
          unit: '°C',
          group: 'Performance',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: false,
          position: 6,
        },
        {
          key: 'temp_max',
          label: 'Max Operating Temperature',
          dataType: 'number',
          unit: '°C',
          group: 'Performance',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: true,
          position: 7,
        },
        {
          key: 'bend_radius',
          label: 'Min Bend Radius',
          dataType: 'text',
          unit: null,
          group: 'Dimensions',
          isRequired: false,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 8,
        },
        {
          key: 'reinforcement',
          label: 'Reinforcement',
          dataType: 'text',
          unit: null,
          group: 'Construction',
          isRequired: true,
          isKeyFeature: true,
          isQuickSpec: false,
          position: 9,
        },
        {
          key: 'tube_material',
          label: 'Tube (Inner) Material',
          dataType: 'text',
          unit: null,
          group: 'Construction',
          isRequired: true,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 10,
        },
        {
          key: 'cover_material',
          label: 'Cover Material',
          dataType: 'text',
          unit: null,
          group: 'Construction',
          isRequired: true,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 11,
        },
        {
          key: 'cover_finish',
          label: 'Cover Finish',
          dataType: 'select',
          unit: null,
          group: 'Construction',
          options: ['smooth', 'wrapped', 'perforated'],
          isRequired: false,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 12,
        },
        {
          key: 'conductivity',
          label: 'Conductivity',
          dataType: 'select',
          unit: null,
          group: 'Compliance',
          options: ['conductive', 'non-conductive', 'static-dissipative'],
          isRequired: false,
          isKeyFeature: false,
          isQuickSpec: false,
          position: 13,
        },
        {
          key: 'sold_by',
          label: 'Sold By',
          dataType: 'select',
          unit: null,
          group: 'Commercial',
          options: ['per-metre', 'coil', 'cut-to-length'],
          isRequired: true,
          isKeyFeature: false,
          isQuickSpec: true,
          position: 14,
        },
      ],
    },
  ],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Hydraulic Hose',
    replacements: [
      { label: 'Hydraulic Hoses', categorySlug: 'hydraulic-hoses' },
      { label: 'Thermoplastic Hoses', categorySlug: 'thermoplastic-hoses' },
    ],
  },

  products: ALL_GRADES.map(makeProduct),
}

export default batch
