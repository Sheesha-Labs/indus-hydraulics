/**
 * Bulk SS316L Hose Fittings import — 2026-05-07
 *
 * 53 stainless-steel 316L hose fittings across 11 NEW sub-categories under
 * "Hoses & Fittings → SS316L Fittings" (a NEW megamenu sub-section).
 *
 *   - SS316L BSP Fittings              13 (threaded-fitting-spec)
 *   - SS316L SAE Fittings               6 (sae-flange-spec)
 *   - SS316L Banjos                     2 (threaded-fitting-spec)
 *   - SS316L JIC 37° Fittings           5 (threaded-fitting-spec)
 *   - SS316L Metric Fittings            3 (threaded-fitting-spec)
 *   - SS316L Standpipes                 6 (threaded-fitting-spec)
 *   - SS316L ORFS Fittings              5 (threaded-fitting-spec)
 *   - SS316L NPT-NPSM Fittings          4 (threaded-fitting-spec)
 *   - Double Hexagonal Fittings         3 (threaded-fitting-spec)
 *   - Hydrowashing Machine Couplings    2 (threaded-fitting-spec)
 *   - SAE Flanges for Hoses             4 (sae-flange-spec)
 *
 * Reuses the Indus brand. Reuses existing threaded-fitting-spec (43 products)
 * and sae-flange-spec (10 products) — no new spec template.
 *
 * Megamenu: introduces a NEW 5th sub-section "SS316L Fittings" under the
 * Hoses & Fittings column (positions 0..3 already used by Hydraulic Hose,
 * Hose Fittings, Adapters, Quick Couplers). Uses the new
 * `createSubSectionIfMissing` flag on the navigation block to auto-create
 * the heading row in one transaction.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-ss316l-fittings.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-ss316l-fittings.ts
 */
import type { FaqEntry, ImportBatch, ProductImportPayload } from '../import/types'

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

const SS316L_MATERIAL = '316L stainless steel (austenitic, low-carbon, marine grade)'
const SS316L_FINISH = 'Passivated 316L (no plating; native corrosion-resistant oxide layer)'

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─────────────────────────────────────────────────────────────────────────
// Threaded SS316L fittings (43 products) — uses threaded-fitting-spec
// ─────────────────────────────────────────────────────────────────────────

type ThreadedConfig = 'straight' | '45-elbow' | '90-elbow' | 'banjo' | 'banjo-bolt' | 'tee' | 'cross'
type ThreadedGender = 'male' | 'female' | 'female-swivel'
type ThreadedSeries = 'light-series' | 'heavy-series'

type ThreadedSs316l = {
  sku: string
  title: string
  category: string
  configuration: ThreadedConfig
  threadForm: string
  sealingForm: string
  gender: ThreadedGender
  series?: ThreadedSeries
  sizeRange: string
  applicableStandards: string
  oneLiner: string
}

function ss316lThreadedHtml(g: ThreadedSs316l): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a SS316L stainless-steel hydraulic hose fitting in the ${escape(g.configuration.replace('-', ' '))} configuration. Manufactured from 316L (austenitic, low-carbon, marine-grade) stainless steel and passivated for native corrosion resistance — ideal for chemical, marine, food-grade, and pharmaceutical hydraulic service where carbon-steel fittings would corrode.</p>
<h3>Construction</h3>
<ul>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Thread form: ${escape(g.threadForm)}</li>
<li>Sealing form: ${escape(g.sealingForm)}</li>
<li>Gender: ${escape(g.gender)}</li>
${g.series ? `<li>Series: ${escape(g.series)}</li>` : ''}
<li>Material: ${escape(SS316L_MATERIAL)}</li>
<li>Surface treatment: ${escape(SS316L_FINISH)}</li>
</ul>
<h3>Performance</h3>
<p>Pressure rating tracks the host hose grade and ferrule when crimped to the correct diameter. Operating temperature -40°C to +200°C (limited by hose / O-ring material). 316L resists chloride pitting, marine atmosphere, dilute mineral acids, and food-grade cleaning chemistry.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
    .split(',')
    .map((s) => `<li>${escape(s.trim())}</li>`)
    .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the host hose grade and bore size, (b) the matching SS316L crimp ferrule (also available from Indus), and (c) the thread size on the SS316L body. Indus crimps and pressure-tests the assembly on request.</p>
<h3>Companion products</h3>
<p>Pair with Indus SS316L crimp ferrules and the matching SS316L hose grade for a fully stainless assembly. Browse the SS316L Fittings sub-section under Hoses & Fittings for matching thread families.</p>`
}

const FAMILY_NOTE = (cat: string): string => {
  if (cat.startsWith('ss316l-bsp')) return 'BSPP (parallel) requires a separate seal — bonded seal, ED seal, 60° cone, or flat-face. BSPT (taper) self-seals on engagement.'
  if (cat.startsWith('ss316l-jic')) return 'JIC 37° (SAE J514 / ISO 8434-2) uses metal-on-metal cone seal — no soft seal needed.'
  if (cat.startsWith('ss316l-orfs')) return 'ORFS (SAE J1453) uses an O-ring on the male flat face for leak-free service under high vibration. Specify the O-ring elastomer for chemical compatibility on chemical-service hoses.'
  if (cat.startsWith('ss316l-metric')) return 'Metric 24° cone (ISO 6149-1 / DIN 3852-2) — common on European OEM equipment.'
  if (cat.startsWith('ss316l-npt')) return 'NPT taper (ASME B1.20.1, 60° angle) is NOT interchangeable with BSPT (55° angle). NPSM is straight pipe with a 60° cone seat on the swivel.'
  if (cat.startsWith('ss316l-banjos')) return 'Banjos use a hollow bolt through a banjo eye, sealed with bonded-seal washers (DIN 7642). The eye rotates around the bolt for orientation.'
  if (cat.startsWith('ss316l-standpipes')) return 'Standpipes are rigid tube extensions for hose assemblies — fitted between hose and host port to clear obstructions or panel-mount through a bulkhead.'
  if (cat.startsWith('ss316l-double-hexagonal')) return 'Double-hexagonal (DH) fittings have a longer hexagonal body for higher wrenching torque and easier installation in tight spaces.'
  if (cat.startsWith('ss316l-hydrowashing')) return 'Hydrowashing-machine couplings are sized to the high-pressure washer hose end (typically 6000 psi+ wash hose). Connection is mechanical (clamp), not threaded.'
  return ''
}

function ss316lThreadedFaqs(g: ThreadedSs316l): FaqEntry[] {
  const familyNote = FAMILY_NOTE(g.category)
  return [
    {
      q: 'Why SS316L instead of carbon steel?',
      a: '316L is an austenitic, low-carbon, marine-grade stainless steel. It resists chloride pitting (seawater), marine atmosphere, dilute mineral acids, and food-grade cleaning chemistry — environments where zinc-plated carbon steel would corrode within months. The "L" denotes <0.03% carbon, which prevents carbide precipitation at weld grain boundaries.',
    },
    {
      q: 'What thread form does this fitting use?',
      a: `${g.threadForm}. ${familyNote}`,
    },
    {
      q: 'What is the sealing form?',
      a: `${g.sealingForm}. The mating port must use a compatible sealing form — mismatched seals leak under pressure.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: 'Pressure rating tracks the host hose grade and ferrule. The fitting itself does not derate the assembly when crimped to spec. Operating temperature -40°C to +200°C (limited by hose and any O-ring elastomer present).',
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Common sizes are ex-stock; less-common sizes typically ship within 7 working days.`,
    },
    {
      q: 'Which crimp ferrule should I pair with this fitting?',
      a: 'Use the matching SS316L crimp ferrule — pairing a 316L body with a carbon-steel ferrule defeats the corrosion-resistance benefit. Tell us your hose grade on the RFQ and we will recommend the correct Indus SS316L ferrule.',
    },
    {
      q: 'Is crimping included?',
      a: 'Crimping is quoted separately. Indus offers full SS316L assembly with pressure testing and certification on request — important for food-grade, pharma, and chemical-service applications where the chain of custody matters.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are ex-stock from Dubai. Less-common SS316L thread × bore combinations typically ship within 7 working days from RFQ confirmation.',
    },
  ]
}

function makeThreaded(g: ThreadedSs316l): ProductImportPayload {
  const specs: Record<string, string | number | boolean> = {
    fitting_configuration: g.configuration,
    thread_form: g.threadForm,
    sealing_form: g.sealingForm,
    gender: g.gender,
    nominal_size_range: g.sizeRange,
    material: SS316L_MATERIAL,
    surface_treatment: SS316L_FINISH,
    applicable_standards: g.applicableStandards,
  }
  if (g.series) specs.series = g.series

  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'threaded-fitting-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: ss316lThreadedHtml(g),
    specs,
    faqs: ss316lThreadedFaqs(g),
    seoTitle: `${g.title} — SS316L | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `SS316L ${g.configuration.replace('-', ' ')} hose fitting`,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Flange SS316L fittings (10 products) — uses sae-flange-spec
// ─────────────────────────────────────────────────────────────────────────

type FlangeType = 'split-clamp' | 'supercat' | 'code-62-fitting' | 'code-61-fitting'
type FlangeCode = 'code-61' | 'code-62'
type FlangeConfig = 'straight' | '45-elbow' | '90-elbow' | 'long-drop' | 'clamp-only'

type FlangeSs316l = {
  sku: string
  title: string
  category: string
  flangeType: FlangeType
  flangeCode: FlangeCode
  configuration: FlangeConfig
  sizeRange: string
  workingPressureMax: string
  boltPattern: string
  applicableStandards: string
  oneLiner: string
}

function ss316lFlangeHtml(g: FlangeSs316l): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a SS316L stainless-steel SAE J518 4-bolt flange fitting. Manufactured from 316L (austenitic, low-carbon, marine-grade) stainless steel and passivated — ideal for chemical, marine, food-grade, and pharmaceutical hydraulic service where carbon-steel fittings would corrode.</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.flangeType)}</li>
<li>Code: SAE J518 ${escape(g.flangeCode === 'code-62' ? 'Code 62 (high pressure)' : 'Code 61 (standard pressure)')}</li>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Size range: ${escape(g.sizeRange)}</li>
<li>Bolt pattern: ${escape(g.boltPattern)}</li>
<li>Material: ${escape(SS316L_MATERIAL)}</li>
<li>Surface treatment: ${escape(SS316L_FINISH)}</li>
</ul>
<h3>Performance</h3>
<p>Working pressure: ${escape(g.workingPressureMax)}. Operating temperature -40°C to +200°C (limited by O-ring face seal). Sealed by an O-ring under the flange head — pair with the matching SS316L O-ring set for fully stainless assembly. 316L resists chloride pitting, marine atmosphere, dilute mineral acids, and food-grade cleaning chemistry.</p>
<h3>Applicable Standards</h3>
<ul>
${g.applicableStandards
    .split(',')
    .map((s) => `<li>${escape(s.trim())}</li>`)
    .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the SAE flange port size on the equipment side, (b) the matching SS316L split-flange clamps with stainless bolts (also available from Indus), and (c) for hose assemblies the host hose grade and overall length. Indus crimps and pressure-tests the assembly on request.</p>
<h3>Companion products</h3>
<p>Pair with Indus SS316L Split Flange Clamps in the matching SAE code (61 or 62), the SS316L O-ring face seal, and the appropriate SS316L crimp ferrule for the host hose grade.</p>`
}

function ss316lFlangeFaqs(g: FlangeSs316l): FaqEntry[] {
  return [
    {
      q: 'Why SS316L instead of carbon steel?',
      a: '316L is an austenitic, low-carbon, marine-grade stainless steel. It resists chloride pitting (seawater), marine atmosphere, dilute mineral acids, and food-grade cleaning chemistry — environments where zinc-plated carbon steel would corrode within months. Use SS316L for any hydraulic service where the host fluid or atmosphere is corrosive.',
    },
    {
      q: 'What SAE J518 code series is this — Code 61 or Code 62?',
      a: g.flangeCode === 'code-62'
        ? 'Code 62 — high-pressure series (up to 415 bar / 6000 psi). Use Code 62 split-flange clamps. Code 61 clamps are NOT interchangeable.'
        : 'Code 61 — standard-pressure series (up to 210 bar / 3000 psi). Use Code 61 split-flange clamps. Code 62 clamps are NOT interchangeable.',
    },
    {
      q: 'What is the working pressure rating?',
      a: `${g.workingPressureMax}. The pressure rating is set by the SAE J518 series and the host port grade.`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.sizeRange}. Sizes correspond to the flange port on the equipment side (pump, valve, cylinder, manifold).`,
    },
    {
      q: 'What bolt pattern and bolt grade?',
      a: `${g.boltPattern}. For SS316L applications use SS316 bolts (not zinc-plated steel) to keep the entire flange joint corrosion-resistant.`,
    },
    {
      q: 'Do I need to order split-flange clamps separately?',
      a: g.configuration === 'clamp-only'
        ? 'This product IS the split-flange clamp set. Pair with the matching SS316L flange-on-fitting hose end (Code 61 or Code 62 to match this clamp).'
        : 'Yes — flange-on-fitting variants must be paired with matching SS316L Split Flange Clamps in the same code (61 or 62). Order quantity = number of flange joints (each joint takes 4 bolts + 2 clamp halves).',
    },
    {
      q: 'Is crimping included?',
      a: g.configuration === 'clamp-only'
        ? 'N/A — this is mounting hardware, not a hose end.'
        : 'Crimping is quoted separately. Indus offers full SS316L assembly with pressure testing and certification on request.',
    },
    {
      q: 'Lead time?',
      a: 'Common SAE flange sizes (1/2" – 2") are ex-stock from Dubai. Larger sizes (2-1/2" – 5") typically ship within 7 working days.',
    },
  ]
}

function makeFlange(g: FlangeSs316l): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'sae-flange-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: ss316lFlangeHtml(g),
    specs: {
      flange_type: g.flangeType,
      flange_code: g.flangeCode,
      configuration: g.configuration,
      nominal_size_range: g.sizeRange,
      working_pressure_max: g.workingPressureMax,
      bolt_pattern: g.boltPattern,
      material: SS316L_MATERIAL,
      surface_treatment: SS316L_FINISH,
      applicable_standards: g.applicableStandards,
    },
    faqs: ss316lFlangeFaqs(g),
    seoTitle: `${g.title} — SS316L | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `SS316L SAE J518 ${g.flangeCode} flange`,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — generated from /Users/ayushkbhatia/Downloads/SS316L Fittings.xlsx
// ─────────────────────────────────────────────────────────────────────────

const THREADED: ThreadedSs316l[] = [
  { sku: 'IH-SS-BSP-001', title: 'BSP Male Flat Seat', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: 'Flat-face seal on swivel nut', gender: 'male', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP Male Flat Seat — SS316L stainless-steel BSP hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-002', title: 'BSP male-parallel 60° cone', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat', gender: 'male', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP male-parallel 60° cone — SS316L stainless-steel BSP hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-003', title: 'BSP swivel female 60° (90º compact elbow)', category: 'ss316l-bsp-fittings', configuration: '90-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° (90º compact elbow) — SS316L stainless-steel BSP hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-004', title: 'BSP swivel female 60° cone with o-ring (45º elbow)', category: 'ss316l-bsp-fittings', configuration: '45-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat with O-ring', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° cone with o-ring (45º elbow) — SS316L stainless-steel BSP hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-005', title: 'BSP swivel female 60° cone with o-ring (90º elbow)', category: 'ss316l-bsp-fittings', configuration: '90-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat with O-ring', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° cone with o-ring (90º elbow) — SS316L stainless-steel BSP hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-006', title: 'BSP swivel female flat seat (45º elbow)', category: 'ss316l-bsp-fittings', configuration: '45-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: 'Flat-face seal on swivel nut', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female flat seat (45º elbow) — SS316L stainless-steel BSP hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-007', title: 'Male BSPT tapered', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPT R1/8 to R2 (taper)', sealingForm: 'BSPT taper (self-sealing on engagement)', gender: 'male', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'Male BSPT tapered — SS316L stainless-steel BSP hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-008', title: 'BSP swivel female 60° cone (45º elbow)', category: 'ss316l-bsp-fittings', configuration: '45-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° cone (45º elbow) — SS316L stainless-steel BSP hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-009', title: 'BSP swivel female flat seat (90º elbow)', category: 'ss316l-bsp-fittings', configuration: '90-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: 'Flat-face seal on swivel nut', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female flat seat (90º elbow) — SS316L stainless-steel BSP hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-010', title: 'BSP Swivel Female 60° cone (90º elbow)', category: 'ss316l-bsp-fittings', configuration: '90-elbow', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP Swivel Female 60° cone (90º elbow) — SS316L stainless-steel BSP hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-011', title: 'BSP swivel female flat seat', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: 'Flat-face seal on swivel nut', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female flat seat — SS316L stainless-steel BSP hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-012', title: 'BSP swivel female 60° cone with o-ring', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat with O-ring', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° cone with o-ring — SS316L stainless-steel BSP hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BSP-013', title: 'BSP swivel female 60° cone', category: 'ss316l-bsp-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel)', sealingForm: '60° cone seat', gender: 'female-swivel', sizeRange: 'G1/8 to G2', applicableStandards: 'ISO 228-1 (BSPP), ISO 7-1 (BSPT)', oneLiner: 'BSP swivel female 60° cone — SS316L stainless-steel BSP hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BJ-001', title: 'Banjo BSP', category: 'ss316l-banjos', configuration: 'banjo', threadForm: 'BSPP G1/8 to G3/4 (banjo eye + bolt)', sealingForm: 'Bonded-seal washers on bolt (DIN 7642 banjo)', gender: 'male', sizeRange: 'G1/8 to G3/4', applicableStandards: 'ISO 228-1 (BSPP), DIN 7642', oneLiner: 'Banjo BSP — SS316L stainless-steel Banjo hose fitting, banjo, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-BJ-002', title: 'Banjo Metric', category: 'ss316l-banjos', configuration: 'banjo', threadForm: 'Metric M10×1 to M22×1.5 (banjo eye + bolt)', sealingForm: 'Bonded-seal washers on bolt (DIN 7642 banjo)', gender: 'male', sizeRange: 'G1/8 to G3/4', applicableStandards: 'ISO 228-1 (BSPP), DIN 7642', oneLiner: 'Banjo Metric — SS316L stainless-steel Banjo hose fitting, banjo, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-JIC-001', title: 'JIC 37º swivel female', category: 'ss316l-jic-37-fittings', configuration: 'straight', threadForm: 'JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sealingForm: '37° cone seat (metal-on-metal)', gender: 'female-swivel', sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'JIC 37º swivel female — SS316L stainless-steel JIC hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-JIC-002', title: 'JIC 37º swivel female (45º elbow)', category: 'ss316l-jic-37-fittings', configuration: '45-elbow', threadForm: 'JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sealingForm: '37° cone seat (metal-on-metal)', gender: 'female-swivel', sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'JIC 37º swivel female (45º elbow) — SS316L stainless-steel JIC hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-JIC-003', title: 'JIC 37º swivel female (90º compact elbow)', category: 'ss316l-jic-37-fittings', configuration: '90-elbow', threadForm: 'JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sealingForm: '37° cone seat (metal-on-metal)', gender: 'female-swivel', sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'JIC 37º swivel female (90º compact elbow) — SS316L stainless-steel JIC hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-JIC-004', title: 'Male JIC 37°', category: 'ss316l-jic-37-fittings', configuration: 'straight', threadForm: 'JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sealingForm: '37° cone seat (metal-on-metal)', gender: 'male', sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'Male JIC 37° — SS316L stainless-steel JIC hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-JIC-005', title: 'male JIC 37° with o-ring', category: 'ss316l-jic-37-fittings', configuration: 'straight', threadForm: 'JIC 37° UN/UNF (7/16-20 to 1-7/8-12)', sealingForm: '37° cone seat with O-ring', gender: 'male', sizeRange: '-04 to -32 (1/4" to 2")', applicableStandards: 'SAE J514, ISO 8434-2', oneLiner: 'male JIC 37° with o-ring — SS316L stainless-steel JIC hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-MET-001', title: 'Metric female swivel with o-ring 24° cone', category: 'ss316l-metric-fittings', configuration: 'straight', threadForm: 'Metric M10×1 to M42×2 (24° cone)', sealingForm: '24° cone with O-ring (DIN 3852)', gender: 'female', sizeRange: 'M10×1 to M42×2', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Metric female swivel with o-ring 24° cone — SS316L stainless-steel Metric hose fitting, straight, female. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-MET-002', title: 'Metric male stud 24° cone', category: 'ss316l-metric-fittings', configuration: 'straight', threadForm: 'Metric M10×1 to M42×2 (24° cone)', sealingForm: '24° cone (DIN 3852)', gender: 'male', sizeRange: 'M10×1 to M42×2', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Metric male stud 24° cone — SS316L stainless-steel Metric hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-MET-003', title: 'Metric swivel female with o-ring 24° cone (45º elbow)', category: 'ss316l-metric-fittings', configuration: '45-elbow', threadForm: 'Metric M10×1 to M42×2 (24° cone)', sealingForm: '24° cone with O-ring (DIN 3852)', gender: 'female-swivel', sizeRange: 'M10×1 to M42×2', applicableStandards: 'ISO 6149-1, DIN 3852-2', oneLiner: 'Metric swivel female with o-ring 24° cone (45º elbow) — SS316L stainless-steel Metric hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-001', title: 'Double crimp standpipe', category: 'ss316l-standpipes', configuration: 'straight', threadForm: 'Standpipe with double-crimp ferrule (light + heavy series)', sealingForm: '24° cone (DIN 2353)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Double crimp standpipe — SS316L stainless-steel Standpipe hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-002', title: 'Gas tube standpipes', category: 'ss316l-standpipes', configuration: 'straight', threadForm: 'Gas tube end (BSPP / DIN 2353 compatible)', sealingForm: '24° cone (DIN 2353)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Gas tube standpipes — SS316L stainless-steel Standpipe hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-003', title: 'Gas tube standpipes (90º elbow)', category: 'ss316l-standpipes', configuration: '90-elbow', threadForm: 'Gas tube end (BSPP / DIN 2353 compatible)', sealingForm: '24° cone (DIN 2353)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Gas tube standpipes (90º elbow) — SS316L stainless-steel Standpipe hose fitting, 90 elbow, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-004', title: 'Metric standpipe DIN 2353 fittings (90º elbow)', category: 'ss316l-standpipes', configuration: '90-elbow', threadForm: 'Metric DIN 2353 24° cone (M10 to M42)', sealingForm: '24° cone (DIN 2353)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Metric standpipe DIN 2353 fittings (90º elbow) — SS316L stainless-steel Standpipe hose fitting, 90 elbow, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-005', title: 'Welding standpipes', category: 'ss316l-standpipes', configuration: 'straight', threadForm: 'Tube weld end (DIN 24° sizes L6 to L42, S6 to S38)', sealingForm: 'Welded (no threaded seal)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Welding standpipes — SS316L stainless-steel Standpipe hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SP-006', title: 'Metric standpipe for DIN 2353 fittings', category: 'ss316l-standpipes', configuration: 'straight', threadForm: 'Metric DIN 2353 24° cone (M10 to M42)', sealingForm: '24° cone (DIN 2353)', gender: 'male', sizeRange: 'Tube OD 6 to 42 mm (light + heavy series)', applicableStandards: 'DIN 2353, ISO 8434-1', oneLiner: 'Metric standpipe for DIN 2353 fittings — SS316L stainless-steel Standpipe hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-ORFS-001', title: 'Double hexagonal ORFS swivel female straight', category: 'ss316l-orfs-fittings', configuration: 'straight', threadForm: 'ORFS UN/UNF (9/16-18 to 1-7/16-12)', sealingForm: 'ORFS face O-ring', gender: 'female-swivel', sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'Double hexagonal ORFS swivel female straight — SS316L stainless-steel ORFS hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-ORFS-002', title: 'ORFS male', category: 'ss316l-orfs-fittings', configuration: 'straight', threadForm: 'ORFS UN/UNF (9/16-18 to 1-7/16-12)', sealingForm: 'ORFS face O-ring', gender: 'male', sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'ORFS male — SS316L stainless-steel ORFS hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-ORFS-003', title: 'ORFS swivel female (45º elbow)', category: 'ss316l-orfs-fittings', configuration: '45-elbow', threadForm: 'ORFS UN/UNF (9/16-18 to 1-7/16-12)', sealingForm: 'ORFS face O-ring', gender: 'female-swivel', sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'ORFS swivel female (45º elbow) — SS316L stainless-steel ORFS hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-ORFS-004', title: 'ORFS swivel female (90º elbow)', category: 'ss316l-orfs-fittings', configuration: '90-elbow', threadForm: 'ORFS UN/UNF (9/16-18 to 1-7/16-12)', sealingForm: 'ORFS face O-ring', gender: 'female-swivel', sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'ORFS swivel female (90º elbow) — SS316L stainless-steel ORFS hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-ORFS-005', title: 'ORFS swivel female straight', category: 'ss316l-orfs-fittings', configuration: 'straight', threadForm: 'ORFS UN/UNF (9/16-18 to 1-7/16-12)', sealingForm: 'ORFS face O-ring', gender: 'female-swivel', sizeRange: '-04 to -16', applicableStandards: 'SAE J1453, ISO 8434-3', oneLiner: 'ORFS swivel female straight — SS316L stainless-steel ORFS hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-HW-001', title: 'Hexagonal nuts for hydrowashing machines', category: 'ss316l-hydrowashing-couplings', configuration: 'straight', threadForm: 'Hexagonal nut for high-pressure washer hose end', sealingForm: 'Mechanical clamp on hose end (no thread seal)', gender: 'male', sizeRange: 'Sized to host equipment', applicableStandards: 'Manufacturer spec (high-pressure washer)', oneLiner: 'Hexagonal nuts for hydrowashing machines — SS316L stainless-steel Hydrowashing hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-HW-002', title: 'Standpipes for hidrowashing machines', category: 'ss316l-hydrowashing-couplings', configuration: 'straight', threadForm: 'Standpipe for high-pressure washer hose', sealingForm: 'Mechanical seal at hose end (no thread seal)', gender: 'male', sizeRange: 'Sized to host equipment', applicableStandards: 'Manufacturer spec (high-pressure washer)', oneLiner: 'Standpipes for hidrowashing machines — SS316L stainless-steel Hydrowashing hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-NPT-001', title: 'NPSM swivel female 60° cone', category: 'ss316l-npt-npsm-fittings', configuration: 'straight', threadForm: 'NPSM straight pipe (parallel) 1/8" to 2"', sealingForm: '60° cone seat (NPSM swivel)', gender: 'female-swivel', sizeRange: '1/8" to 2"', applicableStandards: 'ASME B1.20.1 (NPT), ANSI/ASME B1.20.1 (NPSM)', oneLiner: 'NPSM swivel female 60° cone — SS316L stainless-steel NPT-NPSM hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-NPT-002', title: 'NPSM swivel female 60° cone (45º elbow)', category: 'ss316l-npt-npsm-fittings', configuration: '45-elbow', threadForm: 'NPSM straight pipe (parallel) 1/8" to 2"', sealingForm: '60° cone seat (NPSM swivel)', gender: 'female-swivel', sizeRange: '1/8" to 2"', applicableStandards: 'ASME B1.20.1 (NPT), ANSI/ASME B1.20.1 (NPSM)', oneLiner: 'NPSM swivel female 60° cone (45º elbow) — SS316L stainless-steel NPT-NPSM hose fitting, 45 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-NPT-003', title: 'NPSM swivel female 60° cone (90º elbow)', category: 'ss316l-npt-npsm-fittings', configuration: '90-elbow', threadForm: 'NPSM straight pipe (parallel) 1/8" to 2"', sealingForm: '60° cone seat (NPSM swivel)', gender: 'female-swivel', sizeRange: '1/8" to 2"', applicableStandards: 'ASME B1.20.1 (NPT), ANSI/ASME B1.20.1 (NPSM)', oneLiner: 'NPSM swivel female 60° cone (90º elbow) — SS316L stainless-steel NPT-NPSM hose fitting, 90 elbow, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-NPT-004', title: 'NPT male pipe straight', category: 'ss316l-npt-npsm-fittings', configuration: 'straight', threadForm: 'NPT taper 1/8" to 2"', sealingForm: 'NPT taper (self-sealing on engagement)', gender: 'male', sizeRange: '1/8" to 2"', applicableStandards: 'ASME B1.20.1 (NPT), ANSI/ASME B1.20.1 (NPSM)', oneLiner: 'NPT male pipe straight — SS316L stainless-steel NPT-NPSM hose fitting, straight, male. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-DH-001', title: 'Double hexagonal BSP swivel female cone 60º', category: 'ss316l-double-hexagonal-fittings', configuration: 'straight', threadForm: 'BSPP G1/8 to G2 (parallel) — double-hexagonal body for higher wrenching torque', sealingForm: '60° cone seat', gender: 'female-swivel', sizeRange: 'Sized to host port (BSP / JIC / NPSM)', applicableStandards: 'ISO 228, SAE J514, ISO 8434', oneLiner: 'Double hexagonal BSP swivel female cone 60º — SS316L stainless-steel Double Hexagonal hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-DH-002', title: 'Double hexagonal JIC 37º swivel female', category: 'ss316l-double-hexagonal-fittings', configuration: 'straight', threadForm: 'JIC 37° UN/UNF — double-hexagonal body', sealingForm: '37° cone seat (metal-on-metal)', gender: 'female-swivel', sizeRange: 'Sized to host port (BSP / JIC / NPSM)', applicableStandards: 'ISO 228, SAE J514, ISO 8434', oneLiner: 'Double hexagonal JIC 37º swivel female — SS316L stainless-steel Double Hexagonal hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-DH-003', title: 'Double hexagonal NPSM swivel female cone 60º', category: 'ss316l-double-hexagonal-fittings', configuration: 'straight', threadForm: 'NPSM straight pipe — double-hexagonal body', sealingForm: '60° cone seat (NPSM swivel)', gender: 'female-swivel', sizeRange: 'Sized to host port (BSP / JIC / NPSM)', applicableStandards: 'ISO 228, SAE J514, ISO 8434', oneLiner: 'Double hexagonal NPSM swivel female cone 60º — SS316L stainless-steel Double Hexagonal hose fitting, straight, female swivel. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
]

const FLANGE: FlangeSs316l[] = [
  { sku: 'IH-SS-SAE-001', title: '3000 psi SAE flange (45º elbow) – code 61', category: 'ss316l-sae-fittings', flangeType: 'code-61-fitting', flangeCode: 'code-61', configuration: '45-elbow', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 210 bar (3000 psi) — Code 61 standard series', boltPattern: 'SAE J518 Code 61 4-bolt; bolts SAE J429 Grade 5 minimum', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '3000 psi SAE flange (45º elbow) – code 61 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SAE-002', title: '3000 PSI sae flange 90o elbow code 61', category: 'ss316l-sae-fittings', flangeType: 'code-61-fitting', flangeCode: 'code-61', configuration: '90-elbow', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 210 bar (3000 psi) — Code 61 standard series', boltPattern: 'SAE J518 Code 61 4-bolt; bolts SAE J429 Grade 5 minimum', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '3000 PSI sae flange 90o elbow code 61 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SAE-003', title: '3000 psi SAE straight flange-code 61', category: 'ss316l-sae-fittings', flangeType: 'code-61-fitting', flangeCode: 'code-61', configuration: 'straight', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 210 bar (3000 psi) — Code 61 standard series', boltPattern: 'SAE J518 Code 61 4-bolt; bolts SAE J429 Grade 5 minimum', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '3000 psi SAE straight flange-code 61 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SAE-004', title: '6000 psi SAE flange (45º elbow) – code 62', category: 'ss316l-sae-fittings', flangeType: 'code-62-fitting', flangeCode: 'code-62', configuration: '45-elbow', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 415 bar (6000 psi) — Code 62 high-pressure series', boltPattern: 'SAE J518 Code 62 4-bolt; bolts SAE J429 Grade 8', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '6000 psi SAE flange (45º elbow) – code 62 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SAE-005', title: '6000 psi sae flange (90º elbow) – code 62', category: 'ss316l-sae-fittings', flangeType: 'code-62-fitting', flangeCode: 'code-62', configuration: '90-elbow', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 415 bar (6000 psi) — Code 62 high-pressure series', boltPattern: 'SAE J518 Code 62 4-bolt; bolts SAE J429 Grade 8', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '6000 psi sae flange (90º elbow) – code 62 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-SAE-006', title: '6000 psi SAE straight flange – code 62', category: 'ss316l-sae-fittings', flangeType: 'code-62-fitting', flangeCode: 'code-62', configuration: 'straight', sizeRange: '1/2" to 2"', workingPressureMax: 'up to 415 bar (6000 psi) — Code 62 high-pressure series', boltPattern: 'SAE J518 Code 62 4-bolt; bolts SAE J429 Grade 8', applicableStandards: 'SAE J518, ISO 6162', oneLiner: '6000 psi SAE straight flange – code 62 — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-FL-001', title: 'SAE counter-flange', category: 'ss316l-sae-flanges-for-hoses', flangeType: 'split-clamp', flangeCode: 'code-62', configuration: 'clamp-only', sizeRange: '1/2" to 2"', workingPressureMax: 'L-series 210 bar (3000 psi); S-series 415 bar (6000 psi)', boltPattern: 'SAE J518 4-bolt counter-flange (mating piece for SAE flange head)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'SAE counter-flange — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-FL-002', title: 'SAE flange', category: 'ss316l-sae-flanges-for-hoses', flangeType: 'code-62-fitting', flangeCode: 'code-62', configuration: 'straight', sizeRange: '1/2" to 2"', workingPressureMax: 'L-series 210 bar (3000 psi); S-series 415 bar (6000 psi)', boltPattern: 'SAE J518 4-bolt; bolts SAE J429 grade per series', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'SAE flange — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-FL-003', title: 'SAE split flange', category: 'ss316l-sae-flanges-for-hoses', flangeType: 'split-clamp', flangeCode: 'code-62', configuration: 'clamp-only', sizeRange: '1/2" to 2"', workingPressureMax: 'L-series 210 bar (3000 psi); S-series 415 bar (6000 psi)', boltPattern: 'SAE J518 4-bolt; bolts SAE J429 grade per series', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'SAE split flange — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
  { sku: 'IH-SS-FL-004', title: 'Seals for 3000-6000 psi flange', category: 'ss316l-sae-flanges-for-hoses', flangeType: 'split-clamp', flangeCode: 'code-62', configuration: 'clamp-only', sizeRange: '1/2" to 2"', workingPressureMax: 'Spare seal kit — pressure rating set by host flange', boltPattern: 'N/A (O-ring seal kit)', applicableStandards: 'SAE J518, ISO 6162', oneLiner: 'Seals for 3000-6000 psi flange — SS316L stainless-steel SAE J518 4-bolt flange fitting. Passivated 316L for chemical, marine, and food-grade hydraulic service.' },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-ss316l-fittings',
    description:
      'Bulk-add 53 SS316L stainless-steel hose fittings across 11 NEW sub-categories under Hoses & Fittings. Reuses existing threaded-fitting-spec and sae-flange-spec — no new spec template. Adds a NEW 5th megamenu sub-section "SS316L Fittings" under the Hoses & Fittings column with 11 leaves (uses the new createSubSectionIfMissing flag in the import library).',
  },

  brands: [],

  categories: [
    {
      slug: 'ss316l-bsp-fittings',
      name: 'SS316L BSP Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel BSP hose fittings — BSPP parallel (ISO 228-1) and BSPT taper (ISO 7-1) in 60° cone, flat-face, and O-ring sealing variants.',
      position: 20,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L BSP Hose Fittings — Stainless Steel 316L | Indus Hydraulics',
      seoDescription:
        'SS316L (marine-grade stainless) BSP hose fittings: BSPP parallel and BSPT taper, sizes G1/8 to G2. Male, female-swivel, 45°, 90° elbow. For chemical, marine, and food-grade hydraulic service.',
    },
    {
      slug: 'ss316l-sae-fittings',
      name: 'SS316L SAE Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel SAE J518 4-bolt flange-on-fitting hose ends — Code 61 (3000 psi) and Code 62 (6000 psi) in straight, 45°, and 90° configurations.',
      position: 21,
      isPublished: true,
      defaultSpecTemplateSlug: 'sae-flange-spec',
      seoTitle: 'SS316L SAE Flange Hose Fittings — Code 61 & Code 62 | Indus Hydraulics',
      seoDescription:
        'SS316L SAE J518 flange-on-fitting hose ends: Code 61 (3000 psi) and Code 62 (6000 psi), sizes 1/2" to 2", straight / 45° / 90°. For chemical, marine, food-grade hydraulic service.',
    },
    {
      slug: 'ss316l-banjos',
      name: 'SS316L Banjos',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel banjo fittings (DIN 7642) in BSPP and metric thread variants. Hollow-bolt + banjo-eye geometry with bonded-seal washers.',
      position: 22,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L Banjo Hose Fittings | Indus Hydraulics',
      seoDescription:
        'SS316L banjo hose fittings: DIN 7642 hollow-bolt + eye, BSPP and metric thread variants, bonded-seal washers. Marine-grade stainless steel for corrosive hydraulic service.',
    },
    {
      slug: 'ss316l-jic-37-fittings',
      name: 'SS316L JIC 37° Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel JIC 37° hose fittings per SAE J514 / ISO 8434-2 — male, female-swivel, with optional O-ring, in straight, 45°, and 90° configurations.',
      position: 23,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L JIC 37° Hose Fittings — SAE J514 | Indus Hydraulics',
      seoDescription:
        'SS316L JIC 37° hose fittings: SAE J514 / ISO 8434-2, sizes -04 to -32. Male, female-swivel, optional O-ring boss. Marine-grade stainless steel for corrosive hydraulic service.',
    },
    {
      slug: 'ss316l-metric-fittings',
      name: 'SS316L Metric Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel metric 24° cone hose fittings per ISO 6149-1 / DIN 3852-2 — male stud and female swivel with optional O-ring.',
      position: 24,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L Metric Hose Fittings | Indus Hydraulics',
      seoDescription:
        'SS316L metric 24° cone hose fittings: ISO 6149-1 / DIN 3852-2, M10×1 to M42×2. Male stud and female swivel with optional O-ring. Marine-grade stainless steel.',
    },
    {
      slug: 'ss316l-standpipes',
      name: 'SS316L Standpipes',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel standpipes for hose assemblies — DIN 2353 metric, gas-tube, double-crimp, and welding variants in straight and 90° configurations.',
      position: 25,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L Standpipes for Hose Assemblies | Indus Hydraulics',
      seoDescription:
        'SS316L stainless-steel standpipes: DIN 2353 metric, gas-tube, double-crimp, welding variants. Tube extensions for hose assemblies in marine, chemical, food-grade service.',
    },
    {
      slug: 'ss316l-orfs-fittings',
      name: 'SS316L ORFS Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel ORFS face-O-ring hose fittings per SAE J1453 / ISO 8434-3 — male, female-swivel, double-hex, in straight, 45°, and 90° configurations.',
      position: 26,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L ORFS Hose Fittings — SAE J1453 | Indus Hydraulics',
      seoDescription:
        'SS316L ORFS face-O-ring hose fittings: SAE J1453 / ISO 8434-3, sizes -04 to -16. Marine-grade stainless steel for corrosive hydraulic service.',
    },
    {
      slug: 'ss316l-npt-npsm-fittings',
      name: 'SS316L NPT-NPSM Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel NPT taper and NPSM straight-pipe hose fittings — male NPT and female NPSM swivel in straight, 45°, and 90° configurations.',
      position: 27,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L NPT / NPSM Hose Fittings | Indus Hydraulics',
      seoDescription:
        'SS316L NPT taper and NPSM straight-pipe hose fittings: ASME B1.20.1, sizes 1/8" to 2". Marine-grade stainless steel for corrosive hydraulic service.',
    },
    {
      slug: 'ss316l-double-hexagonal-fittings',
      name: 'SS316L Double Hexagonal Fittings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel double-hexagonal (DH) hose fittings — extended hex body for higher wrenching torque and tight-space installation. BSP, JIC, NPSM thread variants.',
      position: 28,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L Double Hexagonal Hose Fittings | Indus Hydraulics',
      seoDescription:
        'SS316L double-hexagonal (DH) hose fittings — longer hex body for higher torque, BSP / JIC / NPSM threads. Marine-grade stainless steel.',
    },
    {
      slug: 'ss316l-hydrowashing-couplings',
      name: 'SS316L Hydrowashing Couplings',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel couplings for high-pressure hydrowashing machines — hexagonal nuts and standpipes sized to the machine hose.',
      position: 29,
      isPublished: true,
      defaultSpecTemplateSlug: 'threaded-fitting-spec',
      seoTitle: 'SS316L Hydrowashing Machine Couplings | Indus Hydraulics',
      seoDescription:
        'SS316L stainless-steel couplings for high-pressure hydrowashing machines: hexagonal nuts and standpipes. Marine-grade stainless steel for chemical-cleaning service.',
    },
    {
      slug: 'ss316l-sae-flanges-for-hoses',
      name: 'SS316L SAE Flanges for Hoses',
      parentSlug: 'hoses-fittings',
      shortDescription:
        'SS316L stainless-steel SAE J518 flange components for hoses — counter-flange, single flange, split-flange, and matching O-ring seal sets.',
      position: 30,
      isPublished: true,
      defaultSpecTemplateSlug: 'sae-flange-spec',
      seoTitle: 'SS316L SAE Flanges for Hoses | Indus Hydraulics',
      seoDescription:
        'SS316L SAE J518 flange components: counter-flange, single flange, split-flange, plus matching 3000-6000 psi O-ring seal sets. Marine-grade stainless steel.',
    },
  ],

  specTemplates: [],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'SS316L Fittings',
    createSubSectionIfMissing: true,
    replacements: [
      { label: 'SS316L BSP Fittings', categorySlug: 'ss316l-bsp-fittings' },
      { label: 'SS316L SAE Fittings', categorySlug: 'ss316l-sae-fittings' },
      { label: 'SS316L Banjos', categorySlug: 'ss316l-banjos' },
      { label: 'SS316L JIC 37° Fittings', categorySlug: 'ss316l-jic-37-fittings' },
      { label: 'SS316L Metric Fittings', categorySlug: 'ss316l-metric-fittings' },
      { label: 'SS316L Standpipes', categorySlug: 'ss316l-standpipes' },
      { label: 'SS316L ORFS Fittings', categorySlug: 'ss316l-orfs-fittings' },
      { label: 'SS316L NPT / NPSM Fittings', categorySlug: 'ss316l-npt-npsm-fittings' },
      { label: 'SS316L Double Hexagonal', categorySlug: 'ss316l-double-hexagonal-fittings' },
      { label: 'SS316L Hydrowashing Couplings', categorySlug: 'ss316l-hydrowashing-couplings' },
      { label: 'SS316L SAE Flanges for Hoses', categorySlug: 'ss316l-sae-flanges-for-hoses' },
    ],
  },

  products: [
    ...THREADED.map(makeThreaded),
    ...FLANGE.map(makeFlange),
  ],
}

export default batch
