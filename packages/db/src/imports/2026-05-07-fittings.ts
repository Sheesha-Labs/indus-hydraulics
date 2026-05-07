/**
 * Bulk hydraulic-hose-fitting import — 2026-05-07
 *
 * 14 crimp ferrules + 5 metric hose fittings + 5 DIN hose fittings, all under
 * the new house brand "Indus" — plus the 3 new sub-categories, 2 spec
 * templates, and megamenu link replacements they need.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings.ts
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
  brandSlug: 'indus',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 7,
  countryOfOrigin: 'UAE',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Crimp ferrules ────────────────────────────────────────────────────────

type FerruleType = 'no-skive' | 'skive' | 'double-skive' | 'interlock' | 'special'

type CrimpFerrule = {
  sku: string
  title: string
  ferruleType: FerruleType
  /** Comma-separated list of host hose grades the ferrule fits. */
  compatibleHoses: string
  /** Free-text size range, e.g. 'DN6 – DN51 (1/4" – 2")'. */
  nominalSizeRange: string
  /** Short marketing one-liner used in `descriptionShort` and lead paragraph. */
  oneLiner: string
  /** Special distinguishing notes — interlock construction, hose marking range, etc. */
  notes?: string
  /** What hoses to read more about (links by name; the storefront resolves). */
  companion?: string
}

const FERRULE_TYPE_LABEL: Record<FerruleType, string> = {
  'no-skive': 'No-Skive',
  skive: 'Skive',
  'double-skive': 'Double-Skive',
  interlock: 'Interlock',
  special: 'Specialty',
}

function ferruleHtml(g: CrimpFerrule): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(FERRULE_TYPE_LABEL[g.ferruleType].toLowerCase())} crimp ferrule for ${escape(g.compatibleHoses)} hose, available across ${escape(g.nominalSizeRange)}.</p>
<h3>Construction</h3>
<ul>
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated with trivalent (Cr3+) passivation, RoHS-compliant</li>
<li>Crimp method: ${escape(crimpMethodCopy(g.ferruleType))}</li>
${g.notes ? `<li>${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Pressure rating matches the host hose grade — the ferrule does not derate the assembly. Fatigue tested to ISO 6803 / SAE J343 impulse cycles when crimped to the recommended diameter on the matching crimp die.</p>
<h3>Applicable Standards</h3>
<ul>
<li>ISO 12151 fitting/ferrule dimension series</li>
<li>${g.compatibleHoses.includes('EN 853') || g.compatibleHoses.includes('EN 856') || g.compatibleHoses.includes('EN 857') ? 'EN 853 / EN 856 / EN 857 (matched to host hose)' : ''}</li>
<li>${g.compatibleHoses.includes('SAE') ? 'SAE J517 (matched to host hose)' : ''}</li>
${g.notes && g.notes.includes('DIN') ? '<li>DIN 20023</li>' : ''}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching fitting (insert) at each end, and (c) total assembly length plus orientation. Indus crimps and pressure-tests the assembly before dispatch — see the FAQ for our crimping service.</p>
${g.companion ? `<h3>Companion products</h3>\n<p>${escape(g.companion)}</p>` : ''}`
}

function crimpMethodCopy(t: FerruleType): string {
  switch (t) {
    case 'no-skive':
      return 'Crimped over the cover — no skiving required, faster fitting'
    case 'skive':
      return 'Cover is skived (stripped) before crimping for a direct steel-to-reinforcement bond'
    case 'double-skive':
      return 'Both inner tube and outer cover are skived — for very-high-pressure spiral hoses'
    case 'interlock':
      return 'Interlock crimp — ferrule mechanically interlocks with the hose reinforcement for ultra-high pressure / vibration service'
    case 'special':
      return 'Specialty construction matched to the host hose'
  }
}

function ferruleFaqs(g: CrimpFerrule): FaqEntry[] {
  return [
    {
      q: 'What hoses does this ferrule fit?',
      a: `${g.compatibleHoses}, across ${g.nominalSizeRange}.`,
    },
    {
      q: 'Skive or no-skive — what is the difference?',
      a: `${FERRULE_TYPE_LABEL[g.ferruleType]} construction: ${crimpMethodCopy(g.ferruleType)}. Skive ferrules are typically required for premium spiral hoses; no-skive is faster and works for most braided hoses.`,
    },
    {
      q: 'What crimp die do I need?',
      a: 'Indus assembles and crimps to the host hose manufacturer\'s die specification (Aeroquip, Winner, Parker). If you crimp in-house, send us your crimper model and we will quote with the correct die / crimp diameter.',
    },
    {
      q: 'Is the ferrule pressure-rated separately from the hose?',
      a: 'No — the ferrule is rated to match the host hose grade when crimped to the correct diameter. The assembly\'s safety factor and burst pressure follow the hose specification.',
    },
    {
      q: 'Can a crimped ferrule be reused?',
      a: 'No. Once crimped, the ferrule is permanently deformed onto the hose. Replace the assembly entirely if a fitting needs to change.',
    },
    {
      q: 'What materials are available?',
      a: 'Carbon steel with zinc-plated and Cr3+ passivated finish is standard. Stainless steel (304/316) is available on request for marine and chemical service.',
    },
    {
      q: 'Lead time and crimping service?',
      a: 'Common ferrules are ex-stock from Dubai. Less common bores typically ship within 7 working days. We offer in-house crimping with pressure testing and certification on request.',
    },
    {
      q: 'How is this product sold?',
      a: 'Each. RFQ specifies the host hose grade, bore size, and quantity. Crimping and assembly is quoted separately when you provide the matching fitting at each end.',
    },
  ]
}

function makeFerrule(g: CrimpFerrule): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'crimp-ferrules',
    specTemplateSlug: 'crimp-ferrule-spec',
    descriptionShort: `${g.oneLiner} For ${g.compatibleHoses}, ${g.nominalSizeRange}.`.slice(0, 500),
    descriptionLong: ferruleHtml(g),
    specs: {
      ferrule_type: g.ferruleType,
      compatible_hoses: g.compatibleHoses,
      nominal_size_range: g.nominalSizeRange,
      crimp_method: crimpMethodCopy(g.ferruleType),
      material: 'Carbon steel (stainless on request)',
      surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
      applicable_standards: 'ISO 12151',
      sold_by: 'each',
    },
    faqs: ferruleFaqs(g),
    seoTitle: `${g.title} — Crimp Ferrule | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${FERRULE_TYPE_LABEL[g.ferruleType]} crimp ferrule`,
  }
}

// ── Threaded fittings (Metric + DIN) ──────────────────────────────────────

type FittingConfig =
  | 'straight'
  | '45-elbow'
  | '90-elbow'
  | 'banjo'
  | 'banjo-bolt'
  | 'tee'
  | 'cross'

type ThreadedFitting = {
  sku: string
  title: string
  /** Which sub-category bucket this fitting belongs to. */
  category: 'metric-hose-fittings' | 'din-hose-fittings'
  configuration: FittingConfig
  threadForm: string
  sealingForm: string
  gender: 'male' | 'female' | 'female-swivel'
  /** Light vs heavy series for DIN; n/a for metric BSP-style. */
  series?: 'light-series' | 'heavy-series'
  /** Free-text size range for the assembly. */
  sizeRange: string
  /** Standards the fitting conforms to. */
  applicableStandards: string
  /** Marketing one-liner. */
  oneLiner: string
}

function fittingHtml(g: ThreadedFitting): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.configuration.replace('-', ' '))} hydraulic hose fitting, ${escape(g.gender)} thread with ${escape(g.sealingForm)} sealing form. Compliant with ${escape(g.applicableStandards)}.</p>
<h3>Construction</h3>
<ul>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Thread form: ${escape(g.threadForm)}</li>
<li>Sealing form: ${escape(g.sealingForm)}</li>
<li>Gender: ${escape(g.gender)}</li>
${g.series ? `<li>Series: ${escape(g.series)}</li>` : ''}
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
</ul>
<h3>Performance</h3>
<p>Pressure rating matches the matching ferrule and host hose grade. Tested to manufacturer recommended impulse cycles when crimped to the correct ferrule diameter. Operating temperature -40°C to +120°C; refer to fluid compatibility chart for aggressive media.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
  .split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching ferrule, and (c) the thread size you need (M16×1.5, M22×1.5, etc.). Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with Indus crimp ferrules from the matching hose grade — see the Crimp Ferrules category for compatibility tables.</p>`
}

function fittingFaqs(g: ThreadedFitting): FaqEntry[] {
  return [
    {
      q: 'What thread sizes are available?',
      a: `${g.threadForm}. Common sizes ex-stock; specific thread × bore combinations (e.g. M22×1.5 with DN12 hose) typically ship within 7 working days.`,
    },
    {
      q: 'What is the sealing form?',
      a: `${g.sealingForm}. Pair with the matching counterpart (port or fitting) — mismatched sealing forms can leak under pressure.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: 'Pressure rating matches the host hose grade and ferrule when crimped to the correct diameter. The fitting itself does not derate the assembly. Refer to the matched hose grade for the bar/psi rating at your bore size.',
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, food-grade, and chemical service.',
    },
    {
      q: 'Can this fitting be used with any hose grade?',
      a: 'It can be paired with any compatible Indus crimp ferrule. The host hose grade determines the ferrule (skive vs no-skive, double-skive for spiral). Tell us your hose grade on the RFQ and we will recommend the correct ferrule + fitting combo.',
    },
    {
      q: 'Is crimping included in the price?',
      a: 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request. Send your hose grade, bore size, fitting selections, and overall length on the RFQ.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are ex-stock from Dubai. Less-common thread × bore combinations typically ship within 7 working days.',
    },
    {
      q: 'How is this product sold?',
      a: 'Each. Crimping into a hose assembly is a separate line item on the quote.',
    },
  ]
}

function makeFitting(g: ThreadedFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'threaded-fitting-spec',
    descriptionShort: `${g.oneLiner} ${g.configuration.replace('-', ' ')}, ${g.threadForm}, ${g.sealingForm}.`.slice(0, 500),
    descriptionLong: fittingHtml(g),
    specs: {
      fitting_configuration: g.configuration,
      thread_form: g.threadForm,
      sealing_form: g.sealingForm,
      gender: g.gender,
      ...(g.series ? { series: g.series } : {}),
      nominal_size_range: g.sizeRange,
      material: 'Carbon steel (stainless on request)',
      surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
      applicable_standards: g.applicableStandards,
    },
    faqs: fittingFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: g.title.split(' ').slice(0, 4).join(' '),
  }
}

// ── 14 Crimp Ferrules ─────────────────────────────────────────────────────

const FERRULES: CrimpFerrule[] = [
  {
    sku: 'IH-CF-NS-1SN2SN',
    title: 'No-Skive Crimp Ferrule for 1SN / 2SN Hose',
    ferruleType: 'no-skive',
    compatibleHoses: 'EN 853 1SN, EN 853 2SN',
    nominalSizeRange: 'DN6 – DN51 (1/4" – 2")',
    oneLiner: 'No-skive crimp ferrule for the most-stocked single-wire and two-wire braid hoses to EN 853 1SN / 2SN.',
    companion: 'Pair with Indus metric or DIN hose fittings from this catalogue.',
  },
  {
    sku: 'IH-CF-NS-R1T1SN',
    title: 'No-Skive Crimp Ferrule for R1AT / 1SN Hose',
    ferruleType: 'no-skive',
    compatibleHoses: 'SAE 100R1AT, EN 853 1SN',
    nominalSizeRange: 'DN6 – DN51 (1/4" – 2")',
    oneLiner: 'No-skive crimp ferrule for SAE 100R1AT and EN 853 1SN single-wire braid hoses.',
  },
  {
    sku: 'IH-CF-NS-R2T2SN',
    title: 'No-Skive Crimp Ferrule for R2AT / 2SN Hose',
    ferruleType: 'no-skive',
    compatibleHoses: 'SAE 100R2AT, EN 853 2SN',
    nominalSizeRange: 'DN6 – DN51 (1/4" – 2")',
    oneLiner: 'No-skive crimp ferrule for SAE 100R2AT and EN 853 2SN double-wire braid hoses — the workhorse pairing for general hydraulics.',
  },
  {
    sku: 'IH-CF-SK-R1A1ST',
    title: 'Skive Crimp Ferrule for R1A / 1ST Hose',
    ferruleType: 'skive',
    compatibleHoses: 'SAE 100R1A, EN 853 1ST',
    nominalSizeRange: 'DN6 – DN51 (1/4" – 2")',
    oneLiner: 'Skive crimp ferrule for SAE 100R1A and EN 853 1ST single-wire textile-cover hoses — direct-bond to wire reinforcement.',
  },
  {
    sku: 'IH-CF-SK-R2A2ST',
    title: 'Skive Crimp Ferrule for R2A / 2ST Hose',
    ferruleType: 'skive',
    compatibleHoses: 'SAE 100R2A, EN 853 2ST',
    nominalSizeRange: 'DN6 – DN51 (1/4" – 2")',
    oneLiner: 'Skive crimp ferrule for SAE 100R2A and EN 853 2ST double-wire textile-cover hoses.',
  },
  {
    sku: 'IH-CF-SK-R9',
    title: 'Skive Crimp Ferrule for R9 Hose',
    ferruleType: 'skive',
    compatibleHoses: 'SAE 100R9, SAE 100R9R',
    nominalSizeRange: 'DN10 – DN51 (3/8" – 2")',
    oneLiner: 'Skive crimp ferrule for SAE 100R9 / R9R four-spiral high-pressure hoses.',
  },
  {
    sku: 'IH-CF-SK-4SP',
    title: 'Skive Crimp Ferrule for 4SP Hose',
    ferruleType: 'skive',
    compatibleHoses: 'EN 856 4SP',
    nominalSizeRange: 'DN10 – DN51 (3/8" – 2")',
    oneLiner: 'Skive crimp ferrule for EN 856 4SP four-spiral premium hoses.',
  },
  {
    sku: 'IH-CF-SK-4SH-1016',
    title: 'Skive Crimp Ferrule for 4SH Hose, DN10–DN16',
    ferruleType: 'skive',
    compatibleHoses: 'EN 856 4SH',
    nominalSizeRange: 'DN10 – DN16 (3/8" – 5/8")',
    oneLiner: 'Skive crimp ferrule for EN 856 4SH four-spiral heavy-duty hoses, smaller-bore range.',
    notes: 'Smaller-bore variant — use IH-CF-SK-4SH-IL or IH-CF-SK-DIN20023 for larger bores',
  },
  {
    sku: 'IH-CF-SK-R12-0616',
    title: 'Skive Crimp Ferrule for R12 Hose, DN6–DN16',
    ferruleType: 'skive',
    compatibleHoses: 'SAE 100R12',
    nominalSizeRange: 'DN6 – DN16 (1/4" – 5/8")',
    oneLiner: 'Skive crimp ferrule for SAE 100R12 four-spiral high-pressure hoses, smaller-bore range.',
  },
  {
    sku: 'IH-CF-SK-DIN20023',
    title: 'Skive Crimp Ferrule (DIN 20023) for 4SH / R12-32 Hose',
    ferruleType: 'skive',
    compatibleHoses: 'DIN 20023 4SH, SAE 100R12 (DN32 / 1-1/4")',
    nominalSizeRange: 'DN32 (1-1/4")',
    oneLiner: 'DIN 20023 skive crimp ferrule for 4SH and SAE 100R12 hoses at DN32 bore.',
    notes: 'Specifically dimensioned per DIN 20023',
  },
  {
    sku: 'IH-CF-SK-4SH-IL',
    title: 'Skive Interlock Crimp Ferrule for 4SH Hose',
    ferruleType: 'interlock',
    compatibleHoses: 'EN 856 4SH',
    nominalSizeRange: 'DN19 – DN51 (3/4" – 2")',
    oneLiner: 'Interlock skive crimp ferrule for EN 856 4SH — mechanically interlocks with the hose reinforcement for ultra-high-pressure / vibration service.',
    notes: 'Interlock construction — recommended for sustained high-vibration / impulse service',
  },
  {
    sku: 'IH-CF-DS-R13',
    title: 'Double-Skive Crimp Ferrule for R13 Hose',
    ferruleType: 'double-skive',
    compatibleHoses: 'SAE 100R13',
    nominalSizeRange: 'DN10 – DN51 (3/8" – 2")',
    oneLiner: 'Double-skive crimp ferrule for SAE 100R13 multi-spiral very-high-pressure hoses.',
  },
  {
    sku: 'IH-CF-NS-R7R8',
    title: 'No-Skive Crimp Ferrule for R7 / R8 Thermoplastic Hose',
    ferruleType: 'no-skive',
    compatibleHoses: 'SAE 100R7, SAE 100R8 (thermoplastic)',
    nominalSizeRange: 'DN6 – DN25 (1/4" – 1")',
    oneLiner: 'No-skive crimp ferrule for SAE 100R7 / R8 thermoplastic hoses — dimensioned for polymer tube and fibre-braid construction.',
    companion: 'Pair with Indus metric or DIN fittings; specify thermoplastic hose on the RFQ for the correct crimp die.',
  },
  {
    sku: 'IH-CF-TEFLON',
    title: 'Specialty Crimp Ferrule for PTFE / Teflon Hose',
    ferruleType: 'special',
    compatibleHoses: 'SAE 100R14 (PTFE / Teflon)',
    nominalSizeRange: 'DN6 – DN25 (1/4" – 1")',
    oneLiner: 'Specialty crimp ferrule dimensioned for PTFE-tube hoses with stainless-steel or polyurethane outer cover.',
    notes: 'PTFE-specific dimensions — do NOT use on rubber hoses',
  },
]

// ── 5 Metric Hose Fittings ────────────────────────────────────────────────

const METRIC_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-MF-BANJO-BOLT',
    title: 'Banjo Bolt — Metric Thread',
    category: 'metric-hose-fittings',
    configuration: 'banjo-bolt',
    threadForm: 'Metric (M10×1.0 to M22×1.5 — common sizes)',
    sealingForm: 'Banjo washer (copper or aluminium)',
    gender: 'male',
    sizeRange: 'M10 – M22',
    applicableStandards: 'ISO 6149-1 (metric port), bonded-seal washers per DIN 7603',
    oneLiner: 'Metric-thread banjo bolt for connecting a banjo-eye fitting to a tapped port — fuel, oil, brake, and pilot circuits.',
  },
  {
    sku: 'IH-MF-BANJO',
    title: 'Banjo Eye Fitting — Metric Thread',
    category: 'metric-hose-fittings',
    configuration: 'banjo',
    threadForm: 'Metric eye (matched to banjo-bolt)',
    sealingForm: 'Banjo washer (copper or aluminium)',
    gender: 'female',
    sizeRange: 'M10 – M22 (to match banjo bolt)',
    applicableStandards: 'ISO 6149-1, DIN 7603',
    oneLiner: 'Metric banjo eye for hose-end connection to a tapped port via banjo bolt — typical of brake / fuel / pilot lines.',
  },
  {
    sku: 'IH-MF-FEM-60-90',
    title: '90° Metric Female 60° Cone Hose Fitting',
    category: 'metric-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'Metric (M14×1.5 to M52×2 — common sizes)',
    sealingForm: '60° cone seat (BSPP-style)',
    gender: 'female-swivel',
    sizeRange: 'M14 – M52',
    applicableStandards: 'ISO 12151-2 (matching ports), BS 5200',
    oneLiner: '90° elbow hose fitting with metric female-swivel thread and 60° cone sealing seat — for tight routing with metric BSPP-style ports.',
  },
  {
    sku: 'IH-MF-MAL-60-SEAT',
    title: 'Metric Male 60° Cone Seat Hose Fitting',
    category: 'metric-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (M14×1.5 to M52×2 — common sizes)',
    sealingForm: '60° cone seat (BSPP-style)',
    gender: 'male',
    sizeRange: 'M14 – M52',
    applicableStandards: 'ISO 12151-2, BS 5200',
    oneLiner: 'Straight hose fitting with metric male thread and 60° cone seat — direct seal into BSPP-style ports.',
  },
  {
    sku: 'IH-MF-FEM-60',
    title: 'Metric Female 60° Cone Hose Fitting',
    category: 'metric-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (M14×1.5 to M52×2 — common sizes)',
    sealingForm: '60° cone seat (BSPP-style)',
    gender: 'female-swivel',
    sizeRange: 'M14 – M52',
    applicableStandards: 'ISO 12151-2, BS 5200',
    oneLiner: 'Straight hose fitting with metric female-swivel thread and 60° cone seat — for hose-to-male-stud connections.',
  },
]

// ── 5 DIN Hose Fittings ───────────────────────────────────────────────────

const DIN_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-DF-STANDPIPE-90',
    title: '90° Metric Standpipe Tube Fitting (DIN 2353)',
    category: 'din-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'Metric (24° cone — DIN 2353 light or heavy series)',
    sealingForm: '24° cone (compression on tube)',
    gender: 'male',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series); DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 2353, ISO 8434-1',
    oneLiner: '90° elbow standpipe — DIN 2353 / ISO 8434-1 24° compression tube fitting for tight routing in metric tube assemblies.',
  },
  {
    sku: 'IH-DF-STANDPIPE-45',
    title: '45° Metric Standpipe Tube Fitting (DIN 2353)',
    category: 'din-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'Metric (24° cone — DIN 2353 light or heavy series)',
    sealingForm: '24° cone (compression on tube)',
    gender: 'male',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series); DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 2353, ISO 8434-1',
    oneLiner: '45° elbow standpipe — DIN 2353 / ISO 8434-1 24° compression tube fitting for moderate-angle routing.',
  },
  {
    sku: 'IH-DF-STANDPIPE',
    title: 'Metric Standpipe Tube Fitting (DIN 2353)',
    category: 'din-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (24° cone — DIN 2353 light or heavy series)',
    sealingForm: '24° cone (compression on tube)',
    gender: 'male',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series); DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 2353, ISO 8434-1',
    oneLiner: 'Straight standpipe — DIN 2353 / ISO 8434-1 24° compression tube fitting for tube-to-port connections.',
  },
  {
    sku: 'IH-DF-FEM-24-OR-LS-90',
    title: '90° Metric Female 24° O-ring Cone (Light Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    oneLiner: '90° elbow hose fitting with female-swivel 24° cone + O-ring sealing — light series — for high-vibration metric DIN tube ports.',
  },
  {
    sku: 'IH-DF-FEM-24-OR-LS-45',
    title: '45° Metric Female 24° O-ring Cone (Light Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    oneLiner: '45° elbow hose fitting with female-swivel 24° cone + O-ring sealing — light series — for moderate-angle metric DIN tube routing.',
  },
]

// ── Spec template definitions ─────────────────────────────────────────────

const CRIMP_FERRULE_SPEC: SpecTemplatePayload = {
  slug: 'crimp-ferrule-spec',
  name: 'Crimp Ferrule Spec',
  description: 'Spec template for hydraulic-hose crimp ferrules: type, compatibility, dimensions, material, surface treatment, applicable standards.',
  position: 1,
  fields: [
    {
      key: 'ferrule_type',
      label: 'Ferrule Type',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['no-skive', 'skive', 'double-skive', 'interlock', 'special'],
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'compatible_hoses',
      label: 'Compatible Hoses',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'nominal_size_range',
      label: 'Nominal Size Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'crimp_method',
      label: 'Crimp Method',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'material',
      label: 'Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'surface_treatment',
      label: 'Surface Treatment',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'applicable_standards',
      label: 'Applicable Standards',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'sold_by',
      label: 'Sold By',
      dataType: 'select',
      unit: null,
      group: 'Commercial',
      options: ['each', 'pack', 'box'],
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 7,
    },
  ],
}

const THREADED_FITTING_SPEC: SpecTemplatePayload = {
  slug: 'threaded-fitting-spec',
  name: 'Threaded Hose Fitting Spec',
  description: 'Spec template for metric and DIN hydraulic hose fittings: configuration, thread, sealing form, gender, series, dimensions, material, surface treatment.',
  position: 2,
  fields: [
    {
      key: 'fitting_configuration',
      label: 'Fitting Configuration',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['straight', '45-elbow', '90-elbow', 'banjo', 'banjo-bolt', 'tee', 'cross'],
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'thread_form',
      label: 'Thread Form',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'sealing_form',
      label: 'Sealing Form',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'gender',
      label: 'Thread Gender',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['male', 'female', 'female-swivel'],
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'series',
      label: 'Series',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['light-series', 'heavy-series'],
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'nominal_size_range',
      label: 'Nominal Size Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'material',
      label: 'Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'surface_treatment',
      label: 'Surface Treatment',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: false,
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
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
  ],
}

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-fittings',
    description:
      'Bulk-add 24 hydraulic hose fittings under the Indus house brand: 14 crimp ferrules, 5 metric hose fittings, 5 DIN hose fittings. Adds 3 new sub-categories under Hoses & Fittings, 2 new spec templates, and replaces megamenu placeholder leaves under "Hose Fittings".',
  },

  brands: [
    {
      slug: 'indus',
      name: 'Indus Hydraulics',
      country: 'UAE',
      description:
        'Indus Hydraulics — Dubai-based stockist and assembly house for hydraulic hose, fittings, ferrules, and adapters. The Indus house brand covers in-stock crimp ferrules and threaded fittings dimensioned for the most common SAE/EN/DIN hose grades, with assembly and pressure-testing service.',
      isAuthorizedDistributor: false,
      isPublished: true,
      seoTitle: 'Indus Hydraulics — House Brand of Crimp Ferrules & Hose Fittings | UAE',
      seoDescription:
        'Indus Hydraulics house brand: crimp ferrules and threaded hose fittings dimensioned for SAE/EN/DIN hose grades. Carbon steel with zinc-plated, Cr3+ passivated finish. Stocked in Dubai with full assembly and pressure-testing service.',
    },
  ],

  categories: [
    {
      slug: 'crimp-ferrules',
      name: 'Crimp Ferrules',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Crimp ferrules for SAE / EN / DIN hose grades — no-skive, skive, double-skive, and interlock constructions. Carbon steel, zinc-plated.',
      position: 3,
      isPublished: true,
      defaultSpecTemplateSlug: 'crimp-ferrule-spec',
      seoTitle: 'Hydraulic Hose Crimp Ferrules — No-Skive / Skive / Interlock | Indus Hydraulics',
      seoDescription:
        'Crimp ferrules for hydraulic hose — no-skive, skive, double-skive, and interlock for SAE J517 and EN 853 / EN 856 / EN 857 hose grades. Stocked in Dubai with assembly service.',
    },
    {
      slug: 'metric-hose-fittings',
      name: 'Metric Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Metric-thread hydraulic hose fittings: banjo bolts, banjo eyes, 60° cone male / female / female-swivel ends in straight, 45° and 90° configurations.',
      position: 4,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'Metric Hydraulic Hose Fittings — Banjo, 60° Cone, M-Thread | Indus Hydraulics',
      seoDescription:
        'Metric-thread hydraulic hose fittings — banjo bolts and eyes, 60° cone seats (male / female / female-swivel) in straight, 45°, 90° configurations. ISO 6149-1, BS 5200, ISO 12151-2 compliant.',
    },
    {
      slug: 'din-hose-fittings',
      name: 'DIN Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'DIN-style 24° cone hydraulic hose fittings: standpipes, female-swivel 24° cone with O-ring (light / heavy series), straight / 45° / 90° configurations.',
      position: 5,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'DIN Hydraulic Hose Fittings — 24° Cone Standpipes & Swivel Ends | Indus Hydraulics',
      seoDescription:
        'DIN-style hydraulic hose fittings: 24° cone standpipes (DIN 2353 / ISO 8434-1) and female-swivel 24° cone with O-ring (DIN 3865 / ISO 12151-2). Light and heavy series.',
    },
  ],

  specTemplates: [CRIMP_FERRULE_SPEC, THREADED_FITTING_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Hose Fittings',
    replacements: [
      { label: 'Crimp Ferrules', categorySlug: 'crimp-ferrules' },
      { label: 'Metric Hose Fittings', categorySlug: 'metric-hose-fittings' },
      { label: 'DIN Hose Fittings', categorySlug: 'din-hose-fittings' },
    ],
  },

  products: [
    ...FERRULES.map(makeFerrule),
    ...METRIC_FITTINGS.map(makeFitting),
    ...DIN_FITTINGS.map(makeFitting),
  ],
}

export default batch
