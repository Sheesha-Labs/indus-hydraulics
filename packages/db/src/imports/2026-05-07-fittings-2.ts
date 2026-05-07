/**
 * Bulk hose-fitting import — 2026-05-07 (batch 2)
 *
 * 26 threaded hose fittings under the existing Indus house brand:
 *   - 2 additional DIN fittings (extending din-hose-fittings from PR #65)
 *   - 10 BSP fittings  (NEW category bsp-hose-fittings)
 *   - 10 JIC 37° fittings (NEW category jic-37-hose-fittings)
 *   - 4 Japanese OEM fittings (NEW category japanese-hose-fittings)
 *
 * Reuses everything from PR #64 + #65: import library, Indus brand,
 * threaded-fitting-spec template, hoses-fittings parent category.
 *
 * Megamenu: extends "Hoses & Fittings → Hose Fittings" sub from 3 → 6
 * leaves by re-running replacePlaceholderLeaves with the full set.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings-2.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-fittings-2.ts
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
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

// ── Threaded fitting type ─────────────────────────────────────────────────

type FittingConfig =
  | 'straight'
  | '45-elbow'
  | '90-elbow'
  | 'banjo'
  | 'banjo-bolt'
  | 'tee'
  | 'cross'

type FittingCategory =
  | 'din-hose-fittings'
  | 'bsp-hose-fittings'
  | 'jic-37-hose-fittings'
  | 'japanese-hose-fittings'

type ThreadedFitting = {
  sku: string
  title: string
  category: FittingCategory
  configuration: FittingConfig
  threadForm: string
  sealingForm: string
  gender: 'male' | 'female' | 'female-swivel'
  /** Light vs heavy series — DIN fittings only. */
  series?: 'light-series' | 'heavy-series'
  sizeRange: string
  applicableStandards: string
  oneLiner: string
  /** Shorthand of the standards family for the focusKeyword (e.g. "BSP", "JIC", "DIN", "JIS"). */
  family: 'DIN' | 'BSP' | 'JIC 37°' | 'JIS'
  /** Optional construction notes — used in the description and one FAQ when set. */
  notes?: string
}

// ── HTML description ──────────────────────────────────────────────────────

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
<p>Pressure rating matches the matching ferrule and host hose grade — see Indus Crimp Ferrules for compatibility tables. Tested to manufacturer-recommended impulse cycles when crimped to the correct ferrule diameter. Operating temperature -40°C to +120°C; refer to fluid compatibility chart for aggressive media.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
  .split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching crimp ferrule (see the Crimp Ferrules category), and (c) the thread size you need. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with Indus crimp ferrules from the matching hose grade. For other thread families see the Metric, BSP, JIC 37°, DIN, and Japanese sub-categories under Hose Fittings.</p>`
}

// ── FAQ generation ────────────────────────────────────────────────────────

function fittingFaqs(g: ThreadedFitting): FaqEntry[] {
  const familyContext = familyFaqContext(g.family)
  return [
    {
      q: `What thread family does this fitting use?`,
      a: `${g.family}. ${familyContext}`,
    },
    {
      q: `What thread sizes are available?`,
      a: `${g.threadForm}. Common sizes ex-stock; specific thread × bore combinations typically ship within 7 working days.`,
    },
    {
      q: `What is the sealing form?`,
      a: `${g.sealingForm}. Pair with the matching counterpart (port or fitting) — mismatched sealing forms can leak under pressure.`,
    },
    {
      q: `What is the maximum working pressure?`,
      a: `Pressure rating matches the host hose grade and crimp ferrule when crimped to the correct diameter. The fitting itself does not derate the assembly. Refer to the matched hose grade for the bar/psi rating at your bore size.`,
    },
    {
      q: `What materials and finishes are available?`,
      a: `Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, food-grade, and chemical service.`,
    },
    {
      q: `Which crimp ferrule should I pair with this fitting?`,
      a: `It can be paired with any compatible Indus crimp ferrule. The host hose grade determines the ferrule (skive vs no-skive, double-skive for spiral). Tell us your hose grade on the RFQ and we will recommend the correct ferrule + fitting combo.`,
    },
    {
      q: `Is crimping included?`,
      a: `Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request. Send your hose grade, bore size, fitting selections, and overall length on the RFQ.`,
    },
    {
      q: `Lead time?`,
      a: `Common configurations are ex-stock from Dubai. Less-common thread × bore combinations typically ship within 7 working days.`,
    },
  ]
}

function familyFaqContext(f: ThreadedFitting['family']): string {
  switch (f) {
    case 'DIN':
      return 'DIN-style 24° cone — DIN 2353 / ISO 8434-1 (compression on tube) and DIN 3865 / ISO 12151-2 (with face O-ring). Common in European mobile and industrial hydraulics.'
    case 'BSP':
      return 'British Standard Pipe — parallel (BSPP, ISO 228) for hydraulics with separate seal, taper (BSPT, ISO 7/BS 21) for self-sealing taper-on-taper. Common across UK and Commonwealth markets.'
    case 'JIC 37°':
      return 'JIC 37° flare — SAE J514 / ISO 8434-2. Industry standard in North America and widely used worldwide for hydraulics. Metal-to-metal seal at the 37° cone.'
    case 'JIS':
      return 'Japanese Industrial Standard — common on Toyota, Komatsu, and other Japanese OEM equipment. Typically uses a 30° flare seat with metric-style threads. Use the matching gender/angle for your equipment.'
  }
}

// ── Generic translator ────────────────────────────────────────────────────

function makeFitting(g: ThreadedFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'threaded-fitting-spec',
    descriptionShort:
      `${g.oneLiner} ${g.configuration.replace('-', ' ')}, ${g.threadForm}, ${g.sealingForm}.`.slice(
        0,
        500,
      ),
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

// ── 2 DIN Hose Fittings (additions to existing din-hose-fittings) ─────────

const DIN_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-DF-FEM-24-OR-LS',
    title: 'Metric Female 24° O-ring Cone (Light Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    family: 'DIN',
    oneLiner:
      'Straight hose fitting with female-swivel 24° cone + O-ring sealing — light series — for high-vibration metric DIN tube ports.',
  },
  {
    sku: 'IH-DF-MAL-24-LS',
    title: 'Metric Male 24° Cone (Light Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (24° cone — DIN 2353 light series)',
    sealingForm: '24° cone (compression on tube)',
    gender: 'male',
    series: 'light-series',
    sizeRange: 'DN6 – DN42 (light series)',
    applicableStandards: 'DIN 2353, ISO 8434-1',
    family: 'DIN',
    oneLiner:
      'Straight hose fitting with male 24° cone — DIN 2353 / ISO 8434-1 light series, for direct connection to DIN tube ports.',
  },
]

// ── 10 BSP Hose Fittings ──────────────────────────────────────────────────

const BSP_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-BSP-BANJO-BOLT',
    title: 'Banjo Bolt — BSP Thread',
    category: 'bsp-hose-fittings',
    configuration: 'banjo-bolt',
    threadForm: 'BSP parallel (G1/8 to G3/4 — common sizes)',
    sealingForm: 'Banjo washer (copper or aluminium)',
    gender: 'male',
    sizeRange: 'G1/8 – G3/4',
    applicableStandards: 'ISO 228, BS 5200, DIN 7603 (bonded-seal washers)',
    family: 'BSP',
    oneLiner:
      'BSP-thread banjo bolt for connecting a banjo-eye fitting to a tapped port — fuel, oil, brake, and pilot circuits.',
  },
  {
    sku: 'IH-BSP-BANJO',
    title: 'BSP Banjo Eye Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'banjo',
    threadForm: 'BSP eye (matched to banjo-bolt)',
    sealingForm: 'Banjo washer (copper or aluminium)',
    gender: 'female',
    sizeRange: 'G1/8 – G3/4 (to match banjo bolt)',
    applicableStandards: 'ISO 228, BS 5200',
    family: 'BSP',
    oneLiner:
      'BSP banjo eye for hose-end connection to a tapped BSP port via banjo bolt — typical of brake, fuel, and pilot lines.',
  },
  {
    sku: 'IH-BSP-FEM-60-90-CP',
    title: '90° BSP Female 60° Cone Compact Elbow Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes)',
    sealingForm: '60° cone (BSPP)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      '90° elbow with BSP female-swivel + 60° cone — compact construction (shorter overall length) for tight routing.',
    notes: 'Compact = shorter overall length than the standard 90° elbow',
  },
  {
    sku: 'IH-BSP-FEM-60-90',
    title: '90° BSP Female 60° Cone Elbow Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes)',
    sealingForm: '60° cone (BSPP)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      '90° elbow hose fitting with BSP female-swivel thread and 60° cone seat — for right-angle routing into BSPP-style ports.',
  },
  {
    sku: 'IH-BSP-FEM-60-45',
    title: '45° BSP Female 60° Cone Elbow Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes)',
    sealingForm: '60° cone (BSPP)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      '45° elbow hose fitting with BSP female-swivel thread and 60° cone seat — for moderate-angle routing into BSPP-style ports.',
  },
  {
    sku: 'IH-BSP-FEM-60',
    title: 'BSP Female 60° Cone Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes)',
    sealingForm: '60° cone (BSPP)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      'Straight hose fitting with BSP female-swivel thread and 60° cone seat — for hose-to-male-stud connections.',
  },
  {
    sku: 'IH-BSP-FEM-WN',
    title: 'BSP Female Thrust Wire Nut Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP parallel',
    sealingForm: 'Thrust wire nut (specialty mechanical retention)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200',
    family: 'BSP',
    oneLiner:
      'BSP female fitting with thrust wire nut — specialty mechanical retention for service-friendly disassembly.',
    notes: 'Thrust wire nut = wire-retained nut allowing repeated assembly without thread wear',
  },
  {
    sku: 'IH-BSP-FEM-FLAT',
    title: 'BSP Female Flat Seat Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP parallel (G1/4 to G2)',
    sealingForm: 'Flat-face with O-ring (ORFS-equivalent)',
    gender: 'female-swivel',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, ISO 12151-6, SAE J1453 (analogous flat-face)',
    family: 'BSP',
    oneLiner:
      'Straight hose fitting with BSP female thread and flat-face O-ring seat — for high-vibration service requiring leak-free joints.',
  },
  {
    sku: 'IH-BSP-MAL-60',
    title: 'BSP Male 60° Cone Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes)',
    sealingForm: '60° cone (BSPP)',
    gender: 'male',
    sizeRange: 'G1/4 – G2',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      'Straight hose fitting with BSP male thread and 60° cone seat — direct seal into female 60° cone ports.',
  },
  {
    sku: 'IH-BSP-MAL-T',
    title: 'BSPT Male Hose Fitting (Tapered Thread)',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP taper (R / Rp — ISO 7-1, BS 21)',
    sealingForm: 'Tapered thread (self-sealing on taper engagement)',
    gender: 'male',
    sizeRange: 'R1/4 – R2',
    applicableStandards: 'ISO 7-1, BS 21',
    family: 'BSP',
    oneLiner:
      'BSPT male fitting with tapered thread — self-sealing on taper engagement, no separate gasket required. Use thread sealant for hydraulic service.',
    notes: 'Tapered thread (BSPT/R/Rp) — distinct from parallel BSP (G/BSPP). Use PTFE tape or anaerobic thread sealant.',
  },
]

// ── 10 JIC 37° Hose Fittings ──────────────────────────────────────────────

const JIC_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-JIC-FEM-37-90-LD',
    title: '90° JIC Female 37° Seat Long Drop Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12 — common sizes)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      '90° elbow JIC female-swivel 37° cone — long-drop construction (extended barrel before the bend) for clearance over hose ferrule shoulders.',
    notes: 'Long-drop = extended pre-bend barrel — clears interference at the hose ferrule end',
  },
  {
    sku: 'IH-JIC-FEM-37-90-CP',
    title: '90° JIC Female 37° Seat Compact Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      '90° elbow JIC female-swivel 37° cone — compact construction for tight routing where space is limited.',
    notes: 'Compact = shorter overall length than standard 90° elbow',
  },
  {
    sku: 'IH-JIC-FEM-37-90-SL',
    title: '90° JIC Female 37° Seat Slip-on Nut Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC), slip-on swivel nut',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      '90° elbow JIC female-swivel 37° cone — slip-on nut design for assembly without pre-attached nut.',
    notes: 'Slip-on nut = nut not pre-attached; slides on after the assembly is built',
  },
  {
    sku: 'IH-JIC-FEM-37-90',
    title: '90° JIC Female 37° Seat Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      '90° elbow hose fitting with JIC female-swivel 37° cone seat — the workhorse JIC right-angle fitting.',
  },
  {
    sku: 'IH-JIC-FEM-37-SL',
    title: 'JIC Female 37° Seat Slip-on Nut Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC), slip-on swivel nut',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      'Straight JIC female-swivel 37° cone hose fitting — slip-on nut design for flexible assembly sequencing.',
    notes: 'Slip-on nut = nut not pre-attached',
  },
  {
    sku: 'IH-JIC-FEM-37-45',
    title: '45° JIC Female 37° Seat Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      '45° elbow hose fitting with JIC female-swivel 37° cone seat — for moderate-angle routing at the hose end.',
  },
  {
    sku: 'IH-JIC-FEM-WN',
    title: 'JIC Female Thrust Wire Nut Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF',
    sealingForm: 'Thrust wire nut (specialty mechanical retention)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514',
    family: 'JIC 37°',
    oneLiner:
      'JIC female fitting with thrust wire nut — wire-retained nut for service-friendly disassembly.',
    notes: 'Thrust wire nut = wire-retained swivel nut, allowing repeated assembly without thread wear',
  },
  {
    sku: 'IH-JIC-FEM-37-DH',
    title: 'JIC Female 37° Cone Double Hex Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      'JIC female-swivel 37° cone hose fitting with double-hex profile — two wrench flats for back-up tightening to prevent hose twist.',
    notes: 'Double-hex = two wrench surfaces (back-up + swivel) to torque the swivel without spinning the hose body',
  },
  {
    sku: 'IH-JIC-MAL-37',
    title: 'JIC Male 37° Cone Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12 — common sizes)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'male',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      'Straight hose fitting with JIC male 37° cone — direct seal into JIC female 37° ports on cylinders, valve manifolds, and pump housings.',
  },
  {
    sku: 'IH-JIC-FEM-37',
    title: 'JIC Female 37° Seat Hose Fitting',
    category: 'jic-37-hose-fittings',
    configuration: 'straight',
    threadForm: 'UN/UNF (7/16-20 to 1-5/8-12)',
    sealingForm: '37° cone seat (JIC)',
    gender: 'female-swivel',
    sizeRange: '-04 to -24',
    applicableStandards: 'SAE J514, ISO 8434-2',
    family: 'JIC 37°',
    oneLiner:
      'Straight JIC female-swivel 37° cone hose fitting — the workhorse JIC straight, fits male studs on cylinders, valves, and ports.',
  },
]

// ── 4 Japanese OEM Hose Fittings ──────────────────────────────────────────

const JP_FITTINGS: ThreadedFitting[] = [
  {
    sku: 'IH-JP-TOYOTA-FEM-90',
    title: '90° Toyota Female Hose Fitting (JIS Metric)',
    category: 'japanese-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'JIS metric (Toyota OEM thread spec)',
    sealingForm: '30° flare seat (Japanese OEM)',
    gender: 'female-swivel',
    sizeRange: 'M14 – M30 (Toyota OEM size range)',
    applicableStandards: 'JIS B 8363 (analogous), Toyota OEM specification',
    family: 'JIS',
    oneLiner:
      '90° elbow hose fitting with Toyota OEM-spec metric thread and 30° flare seat — for service of Toyota construction, agricultural, and material-handling equipment.',
    notes: 'Toyota-spec thread/seat geometry — verify your equipment with the parts catalogue before ordering',
  },
  {
    sku: 'IH-JP-TOYOTA-FEM-45',
    title: '45° Toyota Female Hose Fitting (JIS Metric)',
    category: 'japanese-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'JIS metric (Toyota OEM thread spec)',
    sealingForm: '30° flare seat (Japanese OEM)',
    gender: 'female-swivel',
    sizeRange: 'M14 – M30 (Toyota OEM size range)',
    applicableStandards: 'JIS B 8363 (analogous), Toyota OEM specification',
    family: 'JIS',
    oneLiner:
      '45° elbow hose fitting with Toyota OEM-spec metric thread and 30° flare seat — for moderate-angle routing on Toyota equipment.',
    notes: 'Toyota-spec thread/seat geometry',
  },
  {
    sku: 'IH-JP-TOYOTA-FEM',
    title: 'Toyota Female Hose Fitting (JIS Metric)',
    category: 'japanese-hose-fittings',
    configuration: 'straight',
    threadForm: 'JIS metric (Toyota OEM thread spec)',
    sealingForm: '30° flare seat (Japanese OEM)',
    gender: 'female-swivel',
    sizeRange: 'M14 – M30 (Toyota OEM size range)',
    applicableStandards: 'JIS B 8363 (analogous), Toyota OEM specification',
    family: 'JIS',
    oneLiner:
      'Straight hose fitting with Toyota OEM-spec metric thread and 30° flare seat — for hose service on Toyota equipment.',
    notes: 'Toyota-spec thread/seat geometry',
  },
  {
    sku: 'IH-JP-KOMATSU-FEM',
    title: 'Komatsu Female Hose Fitting (JIS Metric)',
    category: 'japanese-hose-fittings',
    configuration: 'straight',
    threadForm: 'JIS metric (Komatsu OEM thread spec)',
    sealingForm: '30° flare seat (Japanese OEM)',
    gender: 'female-swivel',
    sizeRange: 'M16 – M33 (Komatsu OEM size range)',
    applicableStandards: 'JIS B 8363 (analogous), Komatsu OEM specification',
    family: 'JIS',
    oneLiner:
      'Straight hose fitting with Komatsu OEM-spec metric thread and 30° flare seat — for hose service on Komatsu construction and mining equipment.',
    notes: 'Komatsu-spec thread/seat geometry — verify part numbers with the equipment parts catalogue',
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-fittings-2',
    description:
      'Bulk-add 26 hydraulic hose fittings under the Indus house brand: 2 additional DIN fittings + 10 BSP fittings + 10 JIC 37° fittings + 4 Japanese OEM fittings. Adds 3 new sub-categories (BSP, JIC 37°, Japanese) under Hoses & Fittings; reuses existing Indus brand and threaded-fitting-spec template; extends the Hose Fittings megamenu sub from 3 to 6 leaves.',
  },

  // Indus brand already exists (PR #65) — not in this list (would needlessly
  // overwrite its existing fields). All products reference brandSlug: 'indus'.
  brands: [],

  categories: [
    {
      slug: 'bsp-hose-fittings',
      name: 'BSP Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'BSP-thread hydraulic hose fittings: parallel and tapered, 60° cone seats, banjo bolts/eyes, flat-face seats, in straight, 45°, and 90° configurations.',
      position: 6,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'BSP Hydraulic Hose Fittings — Parallel & Taper, 60° Cone | Indus Hydraulics',
      seoDescription:
        'BSP-thread hydraulic hose fittings: parallel (BSPP / ISO 228) and tapered (BSPT / ISO 7-1), 60° cone seats, banjo, flat-face, in straight, 45°, 90° configurations.',
    },
    {
      slug: 'jic-37-hose-fittings',
      name: 'JIC 37° Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'JIC 37° flare hydraulic hose fittings (SAE J514 / ISO 8434-2): female-swivel and male, in straight, 45°, and 90° configurations including long-drop, compact, slip-on nut, and double-hex variants.',
      position: 7,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'JIC 37° Hydraulic Hose Fittings — SAE J514 / ISO 8434-2 | Indus Hydraulics',
      seoDescription:
        'JIC 37° flare hose fittings: female-swivel and male, straight / 45° / 90°, long-drop, compact, slip-on nut, and double-hex variants. SAE J514 / ISO 8434-2.',
    },
    {
      slug: 'japanese-hose-fittings',
      name: 'Japanese Hose Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'Japanese OEM hydraulic hose fittings (Toyota, Komatsu) with 30° flare seat and JIS metric threads — for service of Japanese construction, mining, and material-handling equipment.',
      position: 8,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'Japanese OEM Hydraulic Hose Fittings — Toyota & Komatsu | Indus Hydraulics',
      seoDescription:
        'Japanese OEM hydraulic hose fittings — Toyota and Komatsu thread specs with 30° flare seat. Straight and elbow configurations for OEM equipment service.',
    },
  ],

  // No new spec templates — reuses threaded-fitting-spec from PR #65.
  specTemplates: [],

  // Megamenu: extend "Hose Fittings" sub from 3 → 6 leaves. Re-runs
  // replacePlaceholderLeaves with all 6, so the existing 3 (Crimp Ferrules,
  // Metric, DIN) are deleted and re-inserted alongside the 3 new ones.
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
    ],
  },

  products: [
    ...DIN_FITTINGS.map(makeFitting),
    ...BSP_FITTINGS.map(makeFitting),
    ...JIC_FITTINGS.map(makeFitting),
    ...JP_FITTINGS.map(makeFitting),
  ],
}

export default batch
