/**
 * Bulk hose-fitting import — 2026-05-07 (batch 3)
 *
 * 25 products across the Indus catalogue:
 *   - 1 Komatsu Male (extends japanese-hose-fittings from PR #66)
 *   - 4 ORFS fittings (NEW category orfs-hose-fittings)
 *   - 10 NPT / NPSM / SAE fittings (NEW category npt-npsm-sae-hose-fittings)
 *   - 10 SAE Flange Fittings (NEW category sae-flange-fittings, NEW spec template)
 *
 * Reuses Indus brand and threaded-fitting-spec from PR #65/#66. Adds one new
 * spec template (sae-flange-spec) for the flange products since flanges have
 * a fundamentally different parameter set (4-bolt mount, code 61/62 pressure
 * series, no thread/cone sealing).
 *
 * Megamenu: extends "Hoses & Fittings → Hose Fittings" sub from 6 → 9 leaves.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings-3.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings-3.ts
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

// ─────────────────────────────────────────────────────────────────────────
// Threaded fittings (Komatsu, ORFS, NPT/NPSM/SAE) — reuses threaded-fitting-spec
// ─────────────────────────────────────────────────────────────────────────

type FittingConfig = 'straight' | '45-elbow' | '90-elbow' | 'banjo' | 'banjo-bolt' | 'tee' | 'cross'
type FittingFamily = 'JIS' | 'ORFS' | 'SAE 45° Flare' | 'SAE Inverted Flare' | 'SAE O-Ring Boss' | 'NPT'

type ThreadedFitting = {
  sku: string
  title: string
  category: string
  configuration: FittingConfig
  threadForm: string
  sealingForm: string
  gender: 'male' | 'female' | 'female-swivel'
  series?: 'light-series' | 'heavy-series'
  sizeRange: string
  applicableStandards: string
  oneLiner: string
  family: FittingFamily
  notes?: string
}

function fittingHtml(g: ThreadedFitting): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.configuration.replace('-', ' '))} hydraulic hose fitting in the ${escape(g.family)} family — ${escape(g.gender)} thread with ${escape(g.sealingForm)} sealing form. Compliant with ${escape(g.applicableStandards)}.</p>
<h3>Construction</h3>
<ul>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Thread form: ${escape(g.threadForm)}</li>
<li>Sealing form: ${escape(g.sealingForm)}</li>
<li>Gender: ${escape(g.gender)}</li>
${g.series ? `<li>Series: ${escape(g.series)}</li>` : ''}
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
${g.notes ? `<li>Notes: ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Pressure rating matches the matching ferrule and host hose grade — see Indus Crimp Ferrules for compatibility tables. Operating temperature -40°C to +120°C; refer to fluid compatibility chart for aggressive media.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
  .split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching crimp ferrule, and (c) the thread size. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with Indus crimp ferrules from the matching hose grade. Browse the Hose Fittings sub-section under Hoses & Fittings for other thread families.</p>`
}

function familyContext(f: FittingFamily): string {
  switch (f) {
    case 'JIS':
      return 'Japanese Industrial Standard — Toyota, Komatsu, and other Japanese OEM equipment. Typically 30° flare seat with metric-style threads.'
    case 'ORFS':
      return 'O-Ring Face Seal — SAE J1453 / ISO 8434-3. Soft face-O-ring seal, leak-free under high vibration. Common on heavy mobile and industrial hydraulics.'
    case 'SAE 45° Flare':
      return 'SAE 45° flare seat — SAE J512. Found on refrigeration, air-conditioning, and lower-pressure hydraulic circuits.'
    case 'SAE Inverted Flare':
      return 'SAE inverted flare — SAE J512. Common on automotive brake, fuel, and instrumentation lines. Female-flared seat in the fitting body.'
    case 'SAE O-Ring Boss':
      return 'SAE straight-thread O-ring boss (ORB) — SAE J1926 / ISO 11926. Static O-ring seal under the shoulder; threads bottom out without sealing on threads.'
    case 'NPT':
      return 'National Pipe Taper — ASME B1.20.1 / ISO 7-1. Self-sealing taper-on-taper engagement; PTFE tape or anaerobic sealant recommended for hydraulic service.'
  }
}

function fittingFaqs(g: ThreadedFitting): FaqEntry[] {
  return [
    { q: 'What thread family does this fitting use?', a: `${g.family}. ${familyContext(g.family)}` },
    { q: 'What thread sizes are available?', a: `${g.threadForm}. Common sizes ex-stock; less common combinations typically ship within 7 working days.` },
    { q: 'What is the sealing form?', a: `${g.sealingForm}. Pair with the matching counterpart — mismatched sealing forms can leak under pressure.` },
    { q: 'What is the maximum working pressure?', a: 'Pressure rating matches the host hose grade and ferrule when crimped to the correct diameter. The fitting itself does not derate the assembly.' },
    { q: 'What materials and finishes are available?', a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request.' },
    { q: 'Which crimp ferrule should I pair with this fitting?', a: 'Tell us your hose grade on the RFQ and we will recommend the correct Indus crimp ferrule (skive vs no-skive, double-skive for spiral) and crimp die.' },
    { q: 'Is crimping included?', a: 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request.' },
    { q: 'Lead time?', a: 'Common configurations are ex-stock from Dubai. Less-common thread × bore combinations typically ship within 7 working days.' },
  ]
}

function makeFitting(g: ThreadedFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'threaded-fitting-spec',
    descriptionShort:
      `${g.oneLiner} ${g.configuration.replace('-', ' ')}, ${g.threadForm}, ${g.sealingForm}.`.slice(0, 500),
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
    focusKeyword: `${g.family} ${g.configuration.replace('-', ' ')}`,
  }
}

// ── 1 Komatsu Male (extends japanese-hose-fittings) ───────────────────────

const JP_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-JP-KOMATSU-MAL',
    title: 'Komatsu Male Hose Fitting (JIS Metric)',
    category: 'japanese-hose-fittings',
    configuration: 'straight',
    threadForm: 'JIS metric (Komatsu OEM thread spec)',
    sealingForm: '30° flare seat (Japanese OEM)',
    gender: 'male',
    sizeRange: 'M16 – M33 (Komatsu OEM size range)',
    applicableStandards: 'JIS B 8363 (analogous), Komatsu OEM specification',
    family: 'JIS',
    oneLiner:
      'Straight male hose fitting with Komatsu OEM-spec metric thread and 30° flare seat — for service of Komatsu construction and mining equipment.',
    notes: 'Komatsu-spec thread/seat geometry — verify part numbers with the equipment parts catalogue',
  },
]

// ── 4 ORFS Fittings ───────────────────────────────────────────────────────

const ORFS_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-ORFS-FEM-90',
    title: '90° ORFS Female Hose Fitting',
    category: 'orfs-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (9/16-18 to 1-7/16-12 — common sizes)',
    sealingForm: 'O-ring face seal (ORFS)',
    gender: 'female-swivel',
    sizeRange: '-04 to -16',
    applicableStandards: 'SAE J1453, ISO 8434-3',
    family: 'ORFS',
    oneLiner:
      '90° elbow hose fitting with ORFS female-swivel and face O-ring — leak-free under high vibration on heavy mobile and industrial hydraulics.',
  },
  {
    sku: 'IH-ORFS-FEM-45',
    title: '45° ORFS Female Hose Fitting',
    category: 'orfs-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'UN/UNF (9/16-18 to 1-7/16-12)',
    sealingForm: 'O-ring face seal (ORFS)',
    gender: 'female-swivel',
    sizeRange: '-04 to -16',
    applicableStandards: 'SAE J1453, ISO 8434-3',
    family: 'ORFS',
    oneLiner:
      '45° elbow hose fitting with ORFS female-swivel and face O-ring — moderate-angle routing into ORFS male studs.',
  },
  {
    sku: 'IH-ORFS-MAL',
    title: 'ORFS Male Hose Fitting',
    category: 'orfs-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (9/16-18 to 1-7/16-12)',
    sealingForm: 'O-ring face seal (ORFS)',
    gender: 'male',
    sizeRange: '-04 to -16',
    applicableStandards: 'SAE J1453, ISO 8434-3',
    family: 'ORFS',
    oneLiner:
      'Straight ORFS male hose fitting — face O-ring sealing into ORFS female-swivel ports on cylinders, valves, and manifolds.',
  },
  {
    sku: 'IH-ORFS-FEM',
    title: 'ORFS Female Hose Fitting',
    category: 'orfs-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (9/16-18 to 1-7/16-12)',
    sealingForm: 'O-ring face seal (ORFS)',
    gender: 'female-swivel',
    sizeRange: '-04 to -16',
    applicableStandards: 'SAE J1453, ISO 8434-3',
    family: 'ORFS',
    oneLiner:
      'Straight ORFS female-swivel hose fitting — the workhorse straight ORFS for hose-to-male-stud connections.',
  },
]

// ── 10 NPT / NPSM / SAE Fittings ──────────────────────────────────────────

const PIPE_THREAD_FITTINGS: ThreadedFitting[] = [
  // SAE Inverted Flare (3)
  {
    sku: 'IH-PT-INV-FLARE-90',
    title: '90° SAE Inverted Flare Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (3/8-24 to 5/8-18 — typical inverted-flare sizes)',
    sealingForm: 'SAE inverted flare (45° female cone in fitting body)',
    gender: 'female',
    sizeRange: '-03 to -10',
    applicableStandards: 'SAE J512',
    family: 'SAE Inverted Flare',
    oneLiner:
      '90° elbow hose fitting with SAE inverted flare seat — common on automotive brake, fuel, and instrumentation lines.',
  },
  {
    sku: 'IH-PT-INV-FLARE-45',
    title: '45° SAE Inverted Flare Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'UN/UNF (3/8-24 to 5/8-18)',
    sealingForm: 'SAE inverted flare (45° female cone in fitting body)',
    gender: 'female',
    sizeRange: '-03 to -10',
    applicableStandards: 'SAE J512',
    family: 'SAE Inverted Flare',
    oneLiner:
      '45° elbow hose fitting with SAE inverted flare seat — moderate-angle routing on brake/fuel lines.',
  },
  {
    sku: 'IH-PT-INV-FLARE',
    title: 'SAE Inverted Flare Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (3/8-24 to 5/8-18)',
    sealingForm: 'SAE inverted flare (45° female cone in fitting body)',
    gender: 'female',
    sizeRange: '-03 to -10',
    applicableStandards: 'SAE J512',
    family: 'SAE Inverted Flare',
    oneLiner:
      'Straight SAE inverted flare hose fitting — workhorse for automotive brake and fuel lines.',
  },
  // SAE 45° Flare Female (3)
  {
    sku: 'IH-PT-SAE-FEM-45-90',
    title: '90° SAE Female 45° Cone Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-1/16-14 — SAE 45° flare sizes)',
    sealingForm: '45° cone seat (SAE J512)',
    gender: 'female-swivel',
    sizeRange: '-04 to -12',
    applicableStandards: 'SAE J512',
    family: 'SAE 45° Flare',
    oneLiner:
      '90° elbow hose fitting with SAE female-swivel 45° cone — refrigeration, AC, and lower-pressure hydraulic circuits.',
  },
  {
    sku: 'IH-PT-SAE-FEM-45',
    title: 'SAE Female 45° Cone Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-1/16-14)',
    sealingForm: '45° cone seat (SAE J512)',
    gender: 'female-swivel',
    sizeRange: '-04 to -12',
    applicableStandards: 'SAE J512',
    family: 'SAE 45° Flare',
    oneLiner:
      'Straight SAE female-swivel 45° cone hose fitting — for refrigerant lines and lower-pressure hydraulic ports.',
  },
  {
    sku: 'IH-PT-SAE-FEM-45-45',
    title: '45° SAE Female 45° Cone Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-1/16-14)',
    sealingForm: '45° cone seat (SAE J512)',
    gender: 'female-swivel',
    sizeRange: '-04 to -12',
    applicableStandards: 'SAE J512',
    family: 'SAE 45° Flare',
    oneLiner:
      '45° elbow hose fitting with SAE female-swivel 45° cone — moderate-angle routing on refrigerant or hydraulic lines.',
  },
  // SAE O-Ring Boss (2)
  {
    sku: 'IH-PT-SAE-MBS-OR',
    title: 'SAE Male Boss Swivel O-Ring Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF straight thread O-ring boss (SAE J1926)',
    sealingForm: 'Static O-ring seal under shoulder (threads bottom out)',
    gender: 'male',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J1926, ISO 11926',
    family: 'SAE O-Ring Boss',
    oneLiner:
      'Straight male O-ring boss with swivel head — leak-free into SAE J1926 ports under high pressure / vibration.',
    notes: 'Swivel head allows torque-free orientation after the threads bottom out',
  },
  {
    sku: 'IH-PT-SAE-MAL-OR',
    title: 'SAE O-Ring Male Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF straight thread O-ring boss (SAE J1926)',
    sealingForm: 'Static O-ring seal under shoulder',
    gender: 'male',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J1926, ISO 11926',
    family: 'SAE O-Ring Boss',
    oneLiner:
      'Straight male O-ring boss hose fitting — direct seal into SAE J1926 ports on pumps, valves, and manifolds.',
  },
  // NPT (1)
  {
    sku: 'IH-PT-NPT-MAL',
    title: 'NPT Male Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'NPT taper (1/8" – 2" — ASME B1.20.1)',
    sealingForm: 'Tapered thread (self-sealing on engagement)',
    gender: 'male',
    sizeRange: 'NPT 1/8 – 2',
    applicableStandards: 'ASME B1.20.1, ISO 7-1',
    family: 'NPT',
    oneLiner:
      'Straight NPT male hose fitting — tapered thread, self-sealing on engagement. Use PTFE tape or anaerobic sealant for hydraulic service.',
    notes: 'Tapered thread — distinct from BSPT (NPT has 60° thread angle vs BSPT 55°). Not interchangeable.',
  },
  // SAE 45° Flare Male (1)
  {
    sku: 'IH-PT-SAE-MAL-45',
    title: 'SAE Male 45° Cone Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-1/16-14 — SAE 45° flare sizes)',
    sealingForm: '45° cone (male)',
    gender: 'male',
    sizeRange: '-04 to -12',
    applicableStandards: 'SAE J512',
    family: 'SAE 45° Flare',
    oneLiner:
      'Straight SAE male 45° cone hose fitting — direct seal into female 45° cone ports on refrigerant or hydraulic equipment.',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// SAE Flange Fittings (10) — uses NEW sae-flange-spec template
// ─────────────────────────────────────────────────────────────────────────

type FlangeType = 'split-clamp' | 'supercat' | 'code-62-fitting' | 'code-61-fitting'
type FlangeConfig = 'straight' | '45-elbow' | '90-elbow' | 'long-drop' | 'clamp-only'
type FlangeCode = 'code-61' | 'code-62'

type FlangeFitting = {
  sku: string
  title: string
  flangeType: FlangeType
  flangeCode: FlangeCode
  configuration: FlangeConfig
  sizeRange: string
  workingPressureMax: string // text — varies by code/size
  boltPattern: string // text — bolt size + spacing
  applicableStandards: string
  oneLiner: string
  notes?: string
}

const FLANGE_TYPE_LABEL: Record<FlangeType, string> = {
  'split-clamp': 'Split Flange Clamp',
  supercat: 'Supercat Flange-on-Fitting',
  'code-62-fitting': 'Code 62 Flange-on-Fitting',
  'code-61-fitting': 'Code 61 Flange-on-Fitting',
}

function flangeHtml(g: FlangeFitting): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(FLANGE_TYPE_LABEL[g.flangeType])} per SAE ${escape(g.flangeCode === 'code-62' ? 'J518 Code 62 (high-pressure, up to 415 bar / 6000 psi)' : 'J518 Code 61 (standard-pressure, up to 210 bar / 3000 psi)')} — ${escape(g.configuration === 'clamp-only' ? 'mounting hardware (split clamp halves + bolts)' : g.configuration.replace('-', ' ') + ' configuration')}.</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(FLANGE_TYPE_LABEL[g.flangeType])}</li>
<li>Code: SAE J518 ${escape(g.flangeCode === 'code-62' ? 'Code 62 (high pressure)' : 'Code 61 (standard pressure)')}</li>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Bolt pattern: ${escape(g.boltPattern)}</li>
<li>Size range: ${escape(g.sizeRange)}</li>
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
${g.notes ? `<li>Notes: ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(g.workingPressureMax)}. Operating temperature -40°C to +120°C. Sealed by a face O-ring under the flange head — no thread sealing required.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
  .split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the flange port size on your equipment, (b) the matching ${escape(g.flangeType === 'split-clamp' ? 'flange-on-fitting (Supercat / Code 62 / Code 61)' : 'split flange clamps (Code 61 or Code 62 to match)')}, and (c) for hose assemblies the host hose grade and overall length. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>${escape(g.flangeType === 'split-clamp' ? 'Pair with Indus Supercat / Code 62 / Code 61 flange-on-fitting variants.' : 'Pair with Indus Split Flange Clamps in the matching code (61 or 62) and the appropriate Indus crimp ferrule for the host hose grade.')}</p>`
}

function flangeFaqs(g: FlangeFitting): FaqEntry[] {
  return [
    {
      q: 'What SAE J518 code series is this — Code 61 or Code 62?',
      a: g.flangeCode === 'code-62'
        ? 'Code 62 — high-pressure series, rated up to 415 bar (6000 psi). Use Code 62 split-flange clamps to mount; Code 61 clamps are NOT interchangeable.'
        : 'Code 61 — standard-pressure series, rated up to 210 bar (3000 psi). Use Code 61 split-flange clamps to mount; Code 62 clamps are NOT interchangeable.',
    },
    {
      q: 'What is the working pressure rating?',
      a: `${g.workingPressureMax}. The pressure rating is set by the SAE J518 series — Code 62 for high pressure, Code 61 for standard pressure. The host hose grade must match (don't drop a Code 62 fitting onto a hose rated below the Code 62 pressure).`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Sizes correspond to the flange port on the equipment side (pump, valve, cylinder).`,
    },
    {
      q: 'What bolt pattern does this flange use?',
      a: `${g.boltPattern}. Bolt grade per SAE J429 Grade 5 minimum (Grade 8 for Code 62 high-pressure).`,
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request.',
    },
    {
      q: g.flangeType === 'split-clamp'
        ? 'Are the bolts included with the split-flange clamps?'
        : 'Do I need to order split-flange clamps separately?',
      a: g.flangeType === 'split-clamp'
        ? 'Yes — Indus split-flange clamps are supplied with the matching SAE J429 grade bolts and washers. Order quantity = number of flange joints (each joint takes 4 bolts + 2 clamp halves).'
        : 'Yes — flange-on-fitting variants must be paired with matching Indus Split Flange Clamps in the same code (61 or 62). Order quantity = number of flange joints.',
    },
    {
      q: 'Is crimping included?',
      a: g.flangeType === 'split-clamp'
        ? 'Not applicable — split-flange clamps are mounting hardware. For flange-on-fitting + hose assemblies, crimping and pressure testing is quoted separately.'
        : 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request.',
    },
    {
      q: 'Lead time?',
      a: 'Common sizes (1/2" – 2") are ex-stock from Dubai. Larger flange sizes (2-1/2" – 5") typically ship within 7 working days.',
    },
  ]
}

function makeFlange(g: FlangeFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'sae-flange-fittings',
    specTemplateSlug: 'sae-flange-spec',
    descriptionShort:
      `${g.oneLiner} SAE J518 ${g.flangeCode === 'code-62' ? 'Code 62 (415 bar)' : 'Code 61 (210 bar)'}, ${g.sizeRange}.`.slice(0, 500),
    descriptionLong: flangeHtml(g),
    specs: {
      flange_type: g.flangeType,
      flange_code: g.flangeCode,
      configuration: g.configuration,
      nominal_size_range: g.sizeRange,
      working_pressure_max: g.workingPressureMax,
      bolt_pattern: g.boltPattern,
      material: 'Carbon steel (stainless on request)',
      surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
      applicable_standards: g.applicableStandards,
    },
    faqs: flangeFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `SAE J518 ${g.flangeCode === 'code-62' ? 'Code 62' : 'Code 61'} flange`,
  }
}

const FLANGE_FITTINGS: FlangeFitting[] = [
  {
    sku: 'IH-FL-CLAMP-62',
    title: 'Split Flange Clamps Code 62 (Pair + Bolts)',
    flangeType: 'split-clamp',
    flangeCode: 'code-62',
    configuration: 'clamp-only',
    sizeRange: '1/2" – 2" (high-pressure series limit)',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt; bolts SAE J429 Grade 8',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      'Split-flange clamp halves + Grade 8 bolt set per SAE J518 Code 62 — high-pressure 4-bolt mounting up to 415 bar.',
    notes: 'Sold per joint (2 clamp halves + 4 bolts + washers). Pair with Indus Code 62 flange-on-fitting variants.',
  },
  {
    sku: 'IH-FL-CLAMP-61',
    title: 'Split Flange Clamps Code 61 (Pair + Bolts)',
    flangeType: 'split-clamp',
    flangeCode: 'code-61',
    configuration: 'clamp-only',
    sizeRange: '1/2" – 5"',
    workingPressureMax: 'up to 210 bar (3000 psi)',
    boltPattern: 'SAE J518 Code 61 4-bolt; bolts SAE J429 Grade 5 minimum',
    applicableStandards: 'SAE J518 Code 61, ISO 6162-1',
    oneLiner:
      'Split-flange clamp halves + Grade 5 bolt set per SAE J518 Code 61 — standard-pressure 4-bolt mounting up to 210 bar.',
    notes: 'Sold per joint (2 clamp halves + 4 bolts + washers). Pair with Indus Code 61 flange-on-fitting variants.',
  },
  {
    sku: 'IH-FL-SUPERCAT-90',
    title: '90° "Supercat" Flange-on-Fitting (Code 62)',
    flangeType: 'supercat',
    flangeCode: 'code-62',
    configuration: '90-elbow',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      '90° elbow Supercat flange-on-fitting — Code 62 high-pressure flange head welded to fitting body for one-piece hose-end assembly.',
    notes: 'Supercat = one-piece flange-and-fitting design (vs. separate flange + threaded fitting). Must be paired with Code 62 split-flange clamps.',
  },
  {
    sku: 'IH-FL-SUPERCAT-LD',
    title: '"Supercat" Flange-on-Fitting Long Drop (Code 62)',
    flangeType: 'supercat',
    flangeCode: 'code-62',
    configuration: 'long-drop',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      'Long-drop Supercat flange-on-fitting — Code 62 high-pressure with extended barrel for clearance over hose ferrule shoulders.',
  },
  {
    sku: 'IH-FL-SUPERCAT-45',
    title: '45° "Supercat" Flange-on-Fitting (Code 62)',
    flangeType: 'supercat',
    flangeCode: 'code-62',
    configuration: '45-elbow',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      '45° elbow Supercat flange-on-fitting — Code 62 high-pressure with moderate-angle drop from the flange head.',
  },
  {
    sku: 'IH-FL-SUPERCAT',
    title: '"Supercat" Flange-on-Fitting (Code 62)',
    flangeType: 'supercat',
    flangeCode: 'code-62',
    configuration: 'straight',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      'Straight Supercat flange-on-fitting — Code 62 high-pressure one-piece flange-and-fitting for hose assemblies.',
  },
  {
    sku: 'IH-FL-62-90',
    title: '90° Flange Code 62 Hose Fitting',
    flangeType: 'code-62-fitting',
    flangeCode: 'code-62',
    configuration: '90-elbow',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      '90° elbow Code 62 flange-on-fitting — high-pressure hose end with separate threaded section + flange head for hose assemblies.',
  },
  {
    sku: 'IH-FL-62-LD',
    title: 'Flange Code 62 Long Drop Hose Fitting',
    flangeType: 'code-62-fitting',
    flangeCode: 'code-62',
    configuration: 'long-drop',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      'Long-drop Code 62 flange-on-fitting — high-pressure with extended barrel for clearance over hose ferrule shoulders.',
  },
  {
    sku: 'IH-FL-62',
    title: 'Flange Code 62 Hose Fitting',
    flangeType: 'code-62-fitting',
    flangeCode: 'code-62',
    configuration: 'straight',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      'Straight Code 62 flange-on-fitting — high-pressure hose end for SAE J518 Code 62 4-bolt mounting on heavy hydraulic equipment.',
  },
  {
    sku: 'IH-FL-62-45',
    title: '45° Flange Code 62 Hose Fitting',
    flangeType: 'code-62-fitting',
    flangeCode: 'code-62',
    configuration: '45-elbow',
    sizeRange: '1/2" – 2"',
    workingPressureMax: 'up to 415 bar (6000 psi)',
    boltPattern: 'SAE J518 Code 62 4-bolt',
    applicableStandards: 'SAE J518 Code 62, ISO 6162-2',
    oneLiner:
      '45° elbow Code 62 flange-on-fitting — high-pressure with moderate-angle drop from the flange head.',
  },
]

// ── SAE Flange spec template ──────────────────────────────────────────────

const SAE_FLANGE_SPEC: SpecTemplatePayload = {
  slug: 'sae-flange-spec',
  name: 'SAE Flange Spec',
  description:
    'Spec template for SAE J518 / ISO 6162 4-bolt flange products: split-flange clamps and flange-on-fitting variants in Code 61 (standard pressure) and Code 62 (high pressure) series.',
  position: 3,
  fields: [
    {
      key: 'flange_type',
      label: 'Flange Type',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['split-clamp', 'supercat', 'code-62-fitting', 'code-61-fitting'],
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'flange_code',
      label: 'SAE J518 Code',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['code-61', 'code-62'],
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'configuration',
      label: 'Configuration',
      dataType: 'select',
      unit: null,
      group: 'Identification',
      options: ['straight', '45-elbow', '90-elbow', 'long-drop', 'clamp-only'],
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
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
      position: 3,
    },
    {
      key: 'working_pressure_max',
      label: 'Max Working Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'bolt_pattern',
      label: 'Bolt Pattern',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
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
    id: '2026-05-07-fittings-3',
    description:
      'Bulk-add 25 hydraulic hose fittings: 1 Komatsu Male (extends japanese-hose-fittings), 4 ORFS, 10 NPT/NPSM/SAE pipe-thread, 10 SAE Flange Fittings. Adds 3 new sub-categories under Hoses & Fittings, 1 new spec template (sae-flange-spec). Extends the Hose Fittings megamenu sub from 6 → 9 leaves.',
  },

  // Reuses 'indus' brand from PR #65 — not in this list.
  brands: [],

  categories: [
    {
      slug: 'orfs-hose-fittings',
      name: 'ORFS Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'O-Ring Face Seal hose fittings (SAE J1453 / ISO 8434-3) — face O-ring sealing for leak-free joints under high vibration.',
      position: 9,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'ORFS Hydraulic Hose Fittings — SAE J1453 / ISO 8434-3 | Indus Hydraulics',
      seoDescription:
        'O-Ring Face Seal hydraulic hose fittings — SAE J1453 / ISO 8434-3 face O-ring sealing for leak-free service under high vibration. Female-swivel and male in straight, 45°, 90°.',
    },
    {
      slug: 'npt-npsm-sae-hose-fittings',
      name: 'NPT / NPSM / SAE Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Pipe-thread hose fittings — NPT taper, NPSM parallel, SAE inverted flare, SAE 45° flare, and SAE J1926 O-ring boss in straight, 45°, 90° configurations.',
      position: 10,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'NPT / NPSM / SAE Pipe-Thread Hose Fittings | Indus Hydraulics',
      seoDescription:
        'Pipe-thread hydraulic hose fittings: NPT taper (ASME B1.20.1), SAE inverted flare and 45° cone (J512), SAE J1926 O-ring boss. Straight, 45°, 90° configurations.',
    },
    {
      slug: 'sae-flange-fittings',
      name: 'SAE Flange Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SAE J518 4-bolt flange fittings — Code 61 (standard, 210 bar) and Code 62 (high pressure, 415 bar) split clamps and flange-on-fitting hose-end variants.',
      position: 11,
      isPublished: true,
      defaultSpecTemplateSlug: 'sae-flange-spec',
      seoTitle: 'SAE J518 Flange Fittings — Code 61 & Code 62 | Indus Hydraulics',
      seoDescription:
        'SAE J518 4-bolt flange fittings: split clamps and flange-on-fitting (Supercat / standard) variants in Code 61 (210 bar) and Code 62 (415 bar). Straight, 45°, 90°, long-drop.',
    },
  ],

  // 1 new spec template — sae-flange-spec.
  specTemplates: [SAE_FLANGE_SPEC],

  // Megamenu: extend "Hose Fittings" sub from 6 → 9 leaves. Re-runs
  // replacePlaceholderLeaves with all 9, so the existing 6 are deleted-and-
  // recreated alongside the 3 new ones.
  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Hose Fittings',
    replacements: [
      { label: 'Crimp Ferrules', categorySlug: 'crimp-ferrules' },
      { label: 'Metric Hose Fittings', categorySlug: 'metric-hose-fittings' },
      { label: 'DIN Hose Fittings', categorySlug: 'din-hose-fittings' },
      { label: 'BSP Hose Fittings', categorySlug: 'bsp-hose-fittings' },
      { label: 'JIC 37° Hose Fittings', categorySlug: 'jic-37-hose-fittings' },
      { label: 'Japanese Hose Fittings', categorySlug: 'japanese-hose-fittings' },
      { label: 'ORFS Hose Fittings', categorySlug: 'orfs-hose-fittings' },
      { label: 'NPT / NPSM / SAE Hose Fittings', categorySlug: 'npt-npsm-sae-hose-fittings' },
      { label: 'SAE Flange Fittings', categorySlug: 'sae-flange-fittings' },
    ],
  },

  products: [
    ...JP_FITTINGS.map(makeFitting),
    ...ORFS_FITTINGS.map(makeFitting),
    ...PIPE_THREAD_FITTINGS.map(makeFitting),
    ...FLANGE_FITTINGS.map(makeFlange),
  ],
}

export default batch
