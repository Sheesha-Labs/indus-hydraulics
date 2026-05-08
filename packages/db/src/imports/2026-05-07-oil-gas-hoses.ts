/**
 * Bulk Oil & Gas Hoses import — 2026-05-07
 *
 * 36 specialty oilfield hoses (Continental ContiTech + Manuli — both now
 * part of Continental's hose-and-rubber business) across 5 NEW
 * application-based sub-categories under a NEW top-level master category
 * `oil-gas-hoses`. Introduces a NEW 8th megamenu top-level column.
 *
 * Source-spreadsheet pressure split (High Pressure / Low pressure) is
 * dropped in favour of application-based grouping, which matches how oil
 * & gas customers actually shop (drilling contractors search "rotary
 * hose"; well-control engineers search "choke & kill"; etc.).
 *
 * Adds:
 *   - 2 NEW brands: Continental (Germany), Manuli (Italy)
 *   - 1 NEW top-level master category: `oil-gas-hoses`
 *   - 5 NEW sub-categories: drilling, well-control, well-service,
 *     tensioner-compensator, low-pressure-oilfield
 *   - 1 NEW spec template: `oil-gas-hose-spec` (14 fields)
 *   - 36 products (SKU pattern: IH-OG-{cat}-NNN)
 *   - NEW 8th megamenu top-level column "Oil & Gas Hoses" with one
 *     "Hoses by Application" sub-section + 5 leaves
 *
 * Spec values inferred from product names + Continental / Manuli catalog
 * defaults + oil & gas industry standards (API 7K, API 16C, API 17J, NACE
 * MR-0175, ISO 13628, ISO 15540). Refine in admin once datasheets are
 * available.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-oil-gas-hoses.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-oil-gas-hoses.ts
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
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
> = {
  status: 'active',
  unitOfMeasure: 'metre',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 21,
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Type model ────────────────────────────────────────────────────────────

type ApplicationFamily =
  | 'drilling'
  | 'well-control'
  | 'well-service'
  | 'tensioner-compensator'
  | 'low-pressure'

type ServiceType =
  | 'standard'
  | 'sour-service'
  | 'fire-resistant'
  | 'cement-resistant'
  | 'subsea'
  | 'acidizing'
  | 'frac'
  | 'high-temperature'
  | 'offshore'
  | 'well-control'
  | 'water-discharge'
  | 'water-suction-discharge'
  | 'petroleum-discharge'
  | 'petroleum-suction-discharge'
  | 'material-handling'
  | 'bulk-material'
  | 'potable-water'

type CouplingType =
  | 'bonded'
  | 'crimped'
  | 'swaged'
  | 'flanged'
  | 'banded or crimped'
  | 'crimped or banded'
  | 'quick-connect'

type OilGasHoseInput = {
  sku: string
  title: string
  category: string
  brand: string
  applicationFamily: ApplicationFamily
  pressureRating: string
  innerDiameterRange: string
  maxTemperature: string
  linerMaterial: string
  reinforcement: string
  couplingType: CouplingType
  serviceType: ServiceType
  applicableStandards: string
  oneLiner: string
}

const APPLICATION_LABEL: Record<ApplicationFamily, string> = {
  drilling: 'Drilling Hose',
  'well-control': 'Well Control Hose (API 16C)',
  'well-service': 'Well Service / Intervention Hose',
  'tensioner-compensator': 'Tensioner & Compensator Hose',
  'low-pressure': 'Low-Pressure Oilfield Hose',
}

const APPLICATION_CONTEXT: Record<ApplicationFamily, string> = {
  drilling:
    'Drilling hoses connect the rig\'s standpipe manifold (mud pump discharge) through the kelly hose / vibrator hose down to the swivel and drill string, circulating drilling mud or cement under high pressure. Designed per API Specification 7K with NBR liners, multiple steel-cable plies, and bonded / crimped / swaged couplings.',
  'well-control':
    'Well control hoses operate during BOP-stack well kicks — circulating kill mud and routing flowback through the choke manifold. API Specification 16C governs choke & kill lines (10000 psi WP, 15000 psi MBP). API 16D governs BOP control hoses (fire-resistant per ISO 15540). Subsea variants comply with API 17J.',
  'well-service':
    'Well service / intervention hoses cover well-test flowback, well stimulation (acidizing), hydraulic fracturing (frac hoses), and burner / flare-boom service. Pressure ratings up to 15000 psi. Acid-resistant fluoropolymer or specialty rubber liners; abrasion-resistant outer covers for frac service.',
  'tensioner-compensator':
    'Tensioner / compensator hoses run between the surface tensioner skid and the marine riser (riser tensioner) or between the heave compensator and the drill string (drill string compensator). They see millions of high-frequency flex cycles — fatigue-rated steel-cable reinforcement is mandatory. API 17J / API 7K cross-reference.',
  'low-pressure':
    'Low-pressure oilfield hoses are the workhorse utility lines on a drilling rig — water transfer, fuel transfer, mud transfer, bulk material handling, and potable water. Continental Black Gold is the dominant North-American brand; suction-rated (SD) variants have a helical wire reinforcement; discharge-only (D) use textile braid only.',
}

// ── HTML description builder ──────────────────────────────────────────────

function oilgasHoseHtml(g: OilGasHoseInput): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(APPLICATION_LABEL[g.applicationFamily])} from the ${escape(g.brand === 'manuli' ? 'Manuli' : 'Continental ContiTech')} oil &amp; gas hose range. ${escape(g.oneLiner)}</p>
<h3>Construction</h3>
<ul>
<li>Application: ${escape(APPLICATION_LABEL[g.applicationFamily])}</li>
<li>Liner: ${escape(g.linerMaterial)}</li>
<li>Reinforcement: ${escape(g.reinforcement)}</li>
<li>Coupling: ${escape(g.couplingType)}</li>
<li>Service type: ${escape(g.serviceType)}</li>
</ul>
<h3>Performance</h3>
<ul>
<li>Pressure rating: ${escape(g.pressureRating)}</li>
<li>Inner diameter range: ${escape(g.innerDiameterRange)}</li>
<li>Operating temperature: ${escape(g.maxTemperature)}</li>
</ul>
<h3>Application context</h3>
<p>${escape(APPLICATION_CONTEXT[g.applicationFamily])}</p>
<h3>Applicable standards</h3>
<ul>
${g.applicableStandards
    .split(',')
    .map((s) => `<li>${escape(s.trim())}</li>`)
    .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the inner diameter, (b) the assembly length, (c) end-fitting flange spec (API 6A flange code, raised-face / ring-joint), and (d) any special service requirements (sour service, sub-zero / Arctic, fire-resistant cover). Indus engineering will confirm the assembly drawing on the RFQ — pressure-test certificates accompany every assembly.</p>
<h3>Companion products</h3>
<p>Pair with API 6A flanges, swivel joints, and the appropriate manifold valves. Indus is an authorised distributor for the Continental ContiTech and Manuli oil &amp; gas hose ranges.</p>`
}

// ── FAQs (8 per product) ──────────────────────────────────────────────────

function oilgasHoseFaqs(g: OilGasHoseInput): FaqEntry[] {
  return [
    {
      q: 'What is this hose used for?',
      a: APPLICATION_CONTEXT[g.applicationFamily],
    },
    {
      q: 'What is the pressure rating?',
      a: `${g.pressureRating}. The Working Pressure (WP) is the continuous service rating; the Minimum Burst Pressure (MBP) is typically 2.5× the WP per API standards. Hydrotest pressure is 1.5× the WP.`,
    },
    {
      q: 'What inner-diameter sizes are available?',
      a: `${g.innerDiameterRange}. Custom sizes outside this range can be quoted; lead time extends accordingly.`,
    },
    {
      q: 'What is the operating-temperature range?',
      a: `${g.maxTemperature}. Sour service (H2S / CO2) and high-temperature variants exist for most product families — call out the wellbore conditions on the RFQ for an engineering review.`,
    },
    {
      q: 'Is this hose API certified?',
      a: `Compliant with: ${g.applicableStandards}. Each assembly ships with the test certificate referencing the applicable API standard. For audit-grade documentation (DROPS / IADC Daily Drilling Reports), specify "third-party witness" on the RFQ.`,
    },
    {
      q: 'What end fittings / couplings are used?',
      a: g.couplingType === 'flanged'
        ? 'API 6A or API 6BX flanges (raised-face or ring-joint). Specify flange size, pressure class, and gasket type on the RFQ. 4-bolt or 8-bolt patterns per API spec.'
        : g.couplingType === 'bonded'
          ? 'Factory-bonded coupling with the hose body — no field-replaceable. The bonded geometry is API 7K-compliant. Specify the host port type (typically NPT, hammer union, or API ring-joint).'
          : g.couplingType === 'crimped'
            ? 'Hydraulic crimped end fitting on a swaged bell-mouth. Field-replaceable on RFQ; typical end fittings are NPT, hammer union (Weco / FMC), or API hammer-lug per the rig spec.'
            : g.couplingType === 'swaged'
              ? 'Cold-formed swaged coupling — high-cycle fatigue rating. Specified per API 7K; typical end fittings are hammer union or API flange.'
              : g.couplingType === 'banded or crimped' || g.couplingType === 'crimped or banded'
                ? 'Banded (crimped over an external collar) or hose-clamp banded depending on pressure rating and inner diameter. Lower-pressure low-pressure hoses use a band; higher-pressure variants use crimped fittings.'
                : g.couplingType === 'quick-connect'
                  ? 'Continental QC47 quick-connect coupling — mechanical engagement, no thread, designed for low-pressure oilfield service. Pair with the matching QC47 nipple.'
                  : 'Per assembly drawing — specify on RFQ.',
    },
    {
      q: 'How long is the assembly?',
      a: 'Standard rig-floor assemblies: 50 ft (15 m), 75 ft (23 m), 100 ft (30 m). Larger lengths (250 ft / 75 m) are available for offshore tensioner / compensator service. Specify exact length on the RFQ.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are typically 2-3 weeks ex-works (Continental USA / Germany factory). Custom-spec assemblies (sour service, exotic liners, project-specific lengths) typically ship within 6-8 weeks. Indus expedites factory orders for urgent rig requirements — call out the rig name and project on the RFQ.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeOilGasHose(g: OilGasHoseInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    brandSlug: g.brand,
    countryOfOrigin: g.brand === 'manuli' ? 'Italy' : 'Germany',
    categorySlug: g.category,
    specTemplateSlug: 'oil-gas-hose-spec',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: oilgasHoseHtml(g),
    specs: {
      application_family: g.applicationFamily,
      pressure_rating: g.pressureRating,
      inner_diameter_range: g.innerDiameterRange,
      max_temperature: g.maxTemperature,
      liner_material: g.linerMaterial,
      reinforcement: g.reinforcement,
      coupling_type: g.couplingType,
      service_type: g.serviceType,
      applicable_standards: g.applicableStandards,
    },
    faqs: oilgasHoseFaqs(g),
    seoTitle: `${g.title} — ${APPLICATION_LABEL[g.applicationFamily]} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: APPLICATION_LABEL[g.applicationFamily],
  }
}

// ── Spec template ─────────────────────────────────────────────────────────

const APPLICATION_OPTIONS: ApplicationFamily[] = [
  'drilling',
  'well-control',
  'well-service',
  'tensioner-compensator',
  'low-pressure',
]

const SERVICE_OPTIONS: ServiceType[] = [
  'standard',
  'sour-service',
  'fire-resistant',
  'cement-resistant',
  'subsea',
  'acidizing',
  'frac',
  'high-temperature',
  'offshore',
  'well-control',
  'water-discharge',
  'water-suction-discharge',
  'petroleum-discharge',
  'petroleum-suction-discharge',
  'material-handling',
  'bulk-material',
  'potable-water',
]

const COUPLING_OPTIONS: CouplingType[] = [
  'bonded',
  'crimped',
  'swaged',
  'flanged',
  'banded or crimped',
  'crimped or banded',
  'quick-connect',
]

const OIL_GAS_HOSE_SPEC: SpecTemplatePayload = {
  slug: 'oil-gas-hose-spec',
  name: 'Oil & Gas Hose Spec',
  description:
    'Spec template for upstream oil & gas hose products: drilling, well control, well service / intervention, tensioner / compensator, and low-pressure oilfield service. Captures application family, pressure rating, ID range, temperature range, liner / reinforcement / coupling, service type, and API / NACE / ISO standards.',
  position: 6,
  fields: [
    {
      key: 'application_family',
      label: 'Application Family',
      dataType: 'select',
      options: APPLICATION_OPTIONS,
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'pressure_rating',
      label: 'Pressure Rating',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'inner_diameter_range',
      label: 'Inner Diameter Range',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'max_temperature',
      label: 'Operating Temperature',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'liner_material',
      label: 'Liner Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'reinforcement',
      label: 'Reinforcement',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'coupling_type',
      label: 'Coupling Type',
      dataType: 'select',
      options: COUPLING_OPTIONS,
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'service_type',
      label: 'Service Type',
      dataType: 'select',
      options: SERVICE_OPTIONS,
      unit: null,
      group: 'Service',
      isRequired: true,
      isKeyFeature: true,
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
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — generated from /Users/ayushkbhatia/Downloads/Oil & Gas Hoses (1).xlsx
// ─────────────────────────────────────────────────────────────────────────

const OILGAS_HOSES: OilGasHoseInput[] = [
  { sku: 'IH-OG-DRL-001', title: 'Rotary & vibrator hose mud bonded', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP, 12500 psi MBP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Oil-resistant NBR (synthetic rubber)', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'bonded', serviceType: 'standard', applicableStandards: 'API 7K, API Spec 7K Grade D', oneLiner: 'Bonded rotary & vibrator hose for circulating drilling mud at the standpipe / kelly hose / vibrator service. API 7K Grade D.' },
  { sku: 'IH-OG-DRL-002', title: 'Rotary & vibrator hose mud crimped', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP, 12500 psi MBP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Oil-resistant NBR', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'crimped', serviceType: 'standard', applicableStandards: 'API 7K, API Spec 7K Grade D', oneLiner: 'Crimped rotary & vibrator hose for circulating drilling mud — factory-crimped end fittings for inline replacement. API 7K Grade D.' },
  { sku: 'IH-OG-DRL-003', title: 'Rotary & vibrator hose cement bonded', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP, 12500 psi MBP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Cement-resistant NBR', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'bonded', serviceType: 'cement-resistant', applicableStandards: 'API 7K, API Spec 7K Grade D', oneLiner: 'Bonded cementing hose for cement-circulating service. NBR liner resists cement abrasion. API 7K Grade D.' },
  { sku: 'IH-OG-DRL-004', title: 'Rotary & vibrator hose cement crimped Powerspiral', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP, 12500 psi MBP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Cement-resistant NBR', reinforcement: 'Continental Powerspiral high-tensile steel spiral plies', couplingType: 'crimped', serviceType: 'cement-resistant', applicableStandards: 'API 7K, API Spec 7K Grade D', oneLiner: 'Continental Powerspiral cement crimped rotary hose — spiral steel reinforcement for cement-circulating service. API 7K Grade D.' },
  { sku: 'IH-OG-DRL-005', title: 'Rotary & Vibrator Hose (swaged coupling)', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Oil-resistant NBR', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'swaged', serviceType: 'standard', applicableStandards: 'API 7K Grade D', oneLiner: 'Swaged-coupling rotary & vibrator hose — cold-formed coupling attachment for high-cycle drilling service. API 7K.' },
  { sku: 'IH-OG-DRL-006', title: 'Rotary & Vibrator Hose for high temperature & sour service', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '5000 psi WP, 12500 psi MBP (API 7K)', innerDiameterRange: '2" to 5"', maxTemperature: '-30°C to +121°C (HT service)', linerMaterial: 'HNBR / sour-service-rated synthetic rubber', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'bonded', serviceType: 'sour-service', applicableStandards: 'API 7K, NACE MR-0175 (sour service)', oneLiner: 'High-temperature, sour-service rotary & vibrator hose for H2S / CO2 environments. NACE MR-0175 compliant. API 7K Grade D.' },
  { sku: 'IH-OG-WCT-001', title: 'Choke & kill and well control hose assemblies (API 16C)', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '10000 psi WP, 15000 psi MBP (API 16C)', innerDiameterRange: '2" to 4"', maxTemperature: '-30°C to +121°C', linerMaterial: 'HNBR / FKM (per assembly spec)', reinforcement: 'Multiple high-tensile steel cable plies + steel armour', couplingType: 'flanged', serviceType: 'well-control', applicableStandards: 'API 16C, API 17J', oneLiner: 'Choke & kill and well control hose assemblies per API 16C — high-pressure circulation during BOP-stack well control operations. Up to 15000 psi MBP.' },
  { sku: 'IH-OG-WCT-002', title: 'Flexible Choke & Kill Line (with Tauroflon™ liner, up to 266°F/130°C)', category: 'well-control-hoses', brand: 'manuli', applicationFamily: 'well-control', pressureRating: '10000 psi WP, 15000 psi MBP (API 16C)', innerDiameterRange: '3" to 4"', maxTemperature: '-30°C to +130°C (266°F)', linerMaterial: 'Tauroflon™ FEP / fluoropolymer (Manuli specialty)', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'well-control', applicableStandards: 'API 16C, API 17J, NACE MR-0175', oneLiner: 'Manuli flexible Choke & Kill line with Tauroflon™ FEP liner — chemical-resistant fluoropolymer barrier for sour-service well control up to 130°C / 266°F.' },
  { sku: 'IH-OG-WCT-003', title: 'Flexible Choke & Kill Line (with PA liner, up to 266°F/130°C)', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '10000 psi WP, 15000 psi MBP (API 16C)', innerDiameterRange: '3" to 4"', maxTemperature: '-30°C to +130°C (266°F)', linerMaterial: 'Polyamide (PA) — heat-resistant grade', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'well-control', applicableStandards: 'API 16C, API 17J', oneLiner: 'Continental flexible Choke & Kill line with polyamide (PA) liner — well-control service up to 130°C / 266°F. API 16C.' },
  { sku: 'IH-OG-WCT-004', title: 'Flexible Choke & Kill Line (with PA liner, up to 212°F/100°C)', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '10000 psi WP, 15000 psi MBP (API 16C)', innerDiameterRange: '3" to 4"', maxTemperature: '-30°C to +100°C (212°F)', linerMaterial: 'Polyamide (PA) — standard grade', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'well-control', applicableStandards: 'API 16C', oneLiner: 'Continental flexible Choke & Kill line with PA liner — well-control service up to 100°C / 212°F. API 16C.' },
  { sku: 'IH-OG-WCT-005', title: 'Subsea LMRP Hoses for Choke & Kill and Hydraulic Conduit Application', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '15000 psi WP (API 17J)', innerDiameterRange: '2" to 4"', maxTemperature: '-30°C to +60°C (subsea)', linerMaterial: 'HNBR / FKM', reinforcement: 'Multiple high-tensile steel cable plies + corrosion-resistant armour', couplingType: 'flanged', serviceType: 'subsea', applicableStandards: 'API 17J, API 16C, ISO 13628-2', oneLiner: 'Subsea LMRP (Lower Marine Riser Package) hoses for Choke & Kill plus hydraulic conduit on subsea BOP stacks. API 17J / 16C compliant.' },
  { sku: 'IH-OG-DRL-007', title: 'Mud Booster Hose', category: 'drilling-hoses', brand: 'continental', applicationFamily: 'drilling', pressureRating: '3000 psi WP, 7500 psi MBP', innerDiameterRange: '3" to 5"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Mud-resistant NBR', reinforcement: 'High-tensile steel cable plies', couplingType: 'bonded', serviceType: 'standard', applicableStandards: 'API 7K-equivalent (mud booster service)', oneLiner: 'Mud booster hose for boosting circulating mud volume in deep / horizontal-well drilling. NBR liner with steel-cable reinforcement.' },
  { sku: 'IH-OG-WCT-006', title: 'Blowout Preventer Control Hose Fireshield 5000', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '5000 psi WP', innerDiameterRange: '1/4" to 1"', maxTemperature: 'Fireshield: 1300°F (704°C) for 30 minutes per API Spec 16D / API RP 17H', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Wire braid + Fireshield fire-resistant outer armour', couplingType: 'crimped', serviceType: 'fire-resistant', applicableStandards: 'API Spec 16D, API RP 17H, ISO 15540 fire test', oneLiner: 'Continental Fireshield 5000 BOP control hose — fire-resistant per API 16D / API RP 17H, withstands 1300°F (704°C) for 30 minutes. For BOP control circuits.' },
  { sku: 'IH-OG-WSV-001', title: 'Well Test Production Hose', category: 'well-service-hoses', brand: 'continental', applicationFamily: 'well-service', pressureRating: '10000 psi WP, 15000 psi MBP', innerDiameterRange: '2" to 4"', maxTemperature: '-30°C to +100°C', linerMaterial: 'HNBR / sour-service rubber', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'sour-service', applicableStandards: 'API 16C, NACE MR-0175', oneLiner: 'Well test production hose for surface flowback / well test operations. Sour-service rated. NACE MR-0175.' },
  { sku: 'IH-OG-WSV-002', title: 'Offshore Well Stimulation / Intervention / Acidizing Hose', category: 'well-service-hoses', brand: 'continental', applicationFamily: 'well-service', pressureRating: '15000 psi WP (acidizing service)', innerDiameterRange: '2" to 3"', maxTemperature: '-30°C to +130°C', linerMaterial: 'Acid-resistant FKM / fluoropolymer', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'acidizing', applicableStandards: 'API 17J, NACE MR-0175', oneLiner: 'Offshore well stimulation / intervention / acidizing hose — fluoropolymer-lined for HCl, HF, organic-acid pumping at 15000 psi.' },
  { sku: 'IH-OG-WSV-003', title: 'Onshore Well Stimulation Hose', category: 'well-service-hoses', brand: 'continental', applicationFamily: 'well-service', pressureRating: '15000 psi WP (stimulation service)', innerDiameterRange: '2" to 3"', maxTemperature: '-30°C to +100°C', linerMaterial: 'Acid-resistant synthetic rubber', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'acidizing', applicableStandards: 'API Spec 7K, NACE MR-0175', oneLiner: 'Onshore well stimulation hose for acidizing / stimulation service. Acid-resistant rubber liner, steel-cable reinforcement.' },
  { sku: 'IH-OG-WCT-007', title: 'Hydraulic Conduit Hose', category: 'well-control-hoses', brand: 'continental', applicationFamily: 'well-control', pressureRating: '5000 psi WP', innerDiameterRange: '1/4" to 1"', maxTemperature: '-30°C to +100°C', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Wire braid', couplingType: 'crimped', serviceType: 'subsea', applicableStandards: 'API 17J, ISO 13628', oneLiner: 'Subsea hydraulic conduit hose for transmitting control fluid in subsea umbilicals to BOPs / Christmas trees. API 17J.' },
  { sku: 'IH-OG-WSV-004', title: 'Burner/Flare Boom Hose', category: 'well-service-hoses', brand: 'continental', applicationFamily: 'well-service', pressureRating: '5000 psi WP (well test flare line)', innerDiameterRange: '2" to 6"', maxTemperature: '-30°C to +200°C (high-temp produced fluids)', linerMaterial: 'Heat-resistant FKM / HNBR', reinforcement: 'Multiple high-tensile steel cable plies + heat-shielding', couplingType: 'flanged', serviceType: 'high-temperature', applicableStandards: 'API Spec 7K-equivalent', oneLiner: 'Burner / flare-boom hose for offshore well test flowback to flare boom. Heat-resistant liner withstands hot produced fluids.' },
  { sku: 'IH-OG-TC-001', title: 'Riser Tensioner Hose', category: 'tensioner-compensator-hoses', brand: 'continental', applicationFamily: 'tensioner-compensator', pressureRating: '5000 psi WP, 12500 psi MBP', innerDiameterRange: '2" to 4"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Multiple high-tensile steel cable plies — heavy-cycle-rated', couplingType: 'flanged', serviceType: 'offshore', applicableStandards: 'API 17J, API Spec 7K (cross-reference)', oneLiner: 'Riser tensioner hose for compensating drill-rig motion against the riser. High-cycle fatigue-rated. Offshore drilling.' },
  { sku: 'IH-OG-TC-002', title: 'Drill String Compensator Hose', category: 'tensioner-compensator-hoses', brand: 'continental', applicationFamily: 'tensioner-compensator', pressureRating: '5000 psi WP, 12500 psi MBP', innerDiameterRange: '2" to 4"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Multiple high-tensile steel cable plies — heavy-cycle-rated', couplingType: 'flanged', serviceType: 'offshore', applicableStandards: 'API 17J, API Spec 7K', oneLiner: 'Drill string compensator hose for active heave compensation of the drill string. High-cycle fatigue-rated.' },
  { sku: 'IH-OG-TC-003', title: 'Hydraulic tensioner & compensator hose assemblies', category: 'tensioner-compensator-hoses', brand: 'continental', applicationFamily: 'tensioner-compensator', pressureRating: '5000 psi WP, 12500 psi MBP', innerDiameterRange: '1" to 4"', maxTemperature: '-30°C to +82°C', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Multiple high-tensile steel cable plies', couplingType: 'flanged', serviceType: 'offshore', applicableStandards: 'API 17J, API Spec 7K', oneLiner: 'Hydraulic tensioner & compensator hose assemblies — full-assembly delivery (hose + flanged ends + pressure test certificate) for offshore tensioner systems.' },
  { sku: 'IH-OG-WSV-005', title: 'Frac hose assemblies', category: 'well-service-hoses', brand: 'continental', applicationFamily: 'well-service', pressureRating: '15000 psi WP (frac service)', innerDiameterRange: '3" to 5"', maxTemperature: '-30°C to +100°C', linerMaterial: 'Abrasion-resistant rubber', reinforcement: 'Multiple high-tensile steel cable plies — frac-rated', couplingType: 'flanged', serviceType: 'frac', applicableStandards: 'API 7K, API 16C (cross-reference)', oneLiner: 'Frac hose assemblies for high-pressure hydraulic fracturing service — proppant + abrasive frac fluid up to 15000 psi.' },
  { sku: 'IH-OG-LP-001', title: 'Hose Megashield 5000 hose assemblies', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '5000 psi WP', innerDiameterRange: '1/4" to 2"', maxTemperature: 'Fireshield rated', linerMaterial: 'Hydraulic-fluid-compatible synthetic rubber', reinforcement: 'Wire braid + Megashield fire-resistant cover', couplingType: 'crimped', serviceType: 'fire-resistant', applicableStandards: 'API Spec 16D, ISO 15540 fire test', oneLiner: 'Continental Megashield 5000 hose assemblies — fire-resistant cover, low-pressure offshore service.' },
  { sku: 'IH-OG-LP-002', title: 'QC47 quick connect coupling', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: 'Per host hose rating', innerDiameterRange: 'Common LP oilfield sizes', maxTemperature: 'Per host hose rating', linerMaterial: 'N/A (coupling)', reinforcement: 'N/A', couplingType: 'quick-connect', serviceType: 'standard', applicableStandards: 'Continental QC47 spec', oneLiner: 'Continental QC47 quick-connect coupling for fast hookup of low-pressure oilfield hoses. Mechanical engagement, no threading required.' },
  { sku: 'IH-OG-LP-003', title: 'Low pressure oilfield hose Flameshield', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '250-500 psi WP (typical LP service)', innerDiameterRange: '1" to 6"', maxTemperature: 'Flameshield-rated cover', linerMaterial: 'Petroleum-resistant rubber', reinforcement: 'Textile braid + Flameshield outer cover', couplingType: 'crimped or banded', serviceType: 'fire-resistant', applicableStandards: 'API Spec 7K (low-pressure service)', oneLiner: 'Continental Flameshield low-pressure oilfield hose — flame-resistant outer cover, petroleum-resistant tube. For surface-rig service.' },
  { sku: 'IH-OG-LP-004', title: 'Water (discharge) Black Gold Drill Water 300D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (discharge service)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Black-gold rubber', reinforcement: 'Textile braid (discharge-only)', couplingType: 'banded or crimped', serviceType: 'water-discharge', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Drill Water 300D — 300 psi discharge-only water hose for drilling-water service.' },
  { sku: 'IH-OG-LP-005', title: 'Water (suction/discharge) Black Gold Drill Water 300SD', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (suction/discharge)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Black-gold rubber', reinforcement: 'Helical wire + textile braid (suction-rated)', couplingType: 'banded or crimped', serviceType: 'water-suction-discharge', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Drill Water 300SD — 300 psi suction/discharge water hose with helical wire reinforcement.' },
  { sku: 'IH-OG-LP-006', title: 'Oilfield service Black Gold Oilfield Service 400D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '400 psi WP (discharge service)', innerDiameterRange: '1" to 6"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Petroleum-resistant Black-gold rubber', reinforcement: 'Textile braid (discharge)', couplingType: 'banded or crimped', serviceType: 'petroleum-discharge', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Oilfield Service 400D — 400 psi discharge hose for general oilfield service.' },
  { sku: 'IH-OG-LP-007', title: 'Petroleum transfer (discharge) Black Gold Fuel 300D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (discharge service)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Petroleum-resistant Black-gold rubber', reinforcement: 'Textile braid', couplingType: 'banded or crimped', serviceType: 'petroleum-discharge', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Fuel 300D — 300 psi discharge fuel-transfer hose for diesel / gasoline / oilfield petroleum service.' },
  { sku: 'IH-OG-LP-008', title: 'Petroleum transfer (suction/discharge) Black Gold Fuel 300SD', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (suction/discharge)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Petroleum-resistant Black-gold rubber', reinforcement: 'Helical wire + textile braid (suction-rated)', couplingType: 'banded or crimped', serviceType: 'petroleum-suction-discharge', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Fuel 300SD — 300 psi suction/discharge fuel-transfer hose with helical wire reinforcement.' },
  { sku: 'IH-OG-LP-009', title: 'Material handling (discharge) Black Gold Mud & Oil 300D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (discharge service)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Mud / oil-resistant Black-gold rubber', reinforcement: 'Textile braid', couplingType: 'banded or crimped', serviceType: 'material-handling', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Mud & Oil 300D — 300 psi discharge hose for mud / oil mixture transfer.' },
  { sku: 'IH-OG-LP-010', title: 'Material handling (suction/discharge) Black Gold Mud & Oil 300SD', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (suction/discharge)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Mud / oil-resistant Black-gold rubber', reinforcement: 'Helical wire + textile braid (suction-rated)', couplingType: 'banded or crimped', serviceType: 'material-handling', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Mud & Oil 300SD — 300 psi suction/discharge hose for mud / oil mixture transfer.' },
  { sku: 'IH-OG-LP-011', title: 'Material handling (discharge) Black Gold Bulk Material 300D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (discharge service)', innerDiameterRange: '1" to 6"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Abrasion-resistant Black-gold rubber', reinforcement: 'Textile braid', couplingType: 'banded or crimped', serviceType: 'bulk-material', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Bulk Material 300D — 300 psi discharge hose for dry / pelletised bulk-material transfer.' },
  { sku: 'IH-OG-LP-012', title: 'Material handling (suction/discharge) Black Gold Bulk Material 300SD', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (suction/discharge)', innerDiameterRange: '1" to 6"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Abrasion-resistant Black-gold rubber', reinforcement: 'Helical wire + textile braid (suction-rated)', couplingType: 'banded or crimped', serviceType: 'bulk-material', applicableStandards: 'Continental Black Gold series spec', oneLiner: 'Continental Black Gold Bulk Material 300SD — 300 psi suction/discharge hose for dry / pelletised bulk-material transfer.' },
  { sku: 'IH-OG-LP-013', title: 'Material handling (discharge) Black Gold Potable Water 300D', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (discharge service)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Potable-water-grade rubber (NSF / FDA-compatible)', reinforcement: 'Textile braid', couplingType: 'banded or crimped', serviceType: 'potable-water', applicableStandards: 'NSF 61 / FDA-compatible (per Continental Black Gold spec)', oneLiner: 'Continental Black Gold Potable Water 300D — 300 psi discharge hose for potable / drinking water on remote oilfield sites.' },
  { sku: 'IH-OG-LP-014', title: 'Material handling (suction/discharge) Black Gold Potable Water 300SD', category: 'low-pressure-oilfield-hoses', brand: 'continental', applicationFamily: 'low-pressure', pressureRating: '300 psi WP (suction/discharge)', innerDiameterRange: '1" to 4"', maxTemperature: '-40°C to +82°C', linerMaterial: 'Potable-water-grade rubber (NSF / FDA-compatible)', reinforcement: 'Helical wire + textile braid (suction-rated)', couplingType: 'banded or crimped', serviceType: 'potable-water', applicableStandards: 'NSF 61 / FDA-compatible (per Continental Black Gold spec)', oneLiner: 'Continental Black Gold Potable Water 300SD — 300 psi suction/discharge potable-water hose with helical wire reinforcement.' },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-oil-gas-hoses',
    description:
      'Bulk-add 36 specialty oil & gas hoses (Continental ContiTech + Manuli) across 5 NEW application-based sub-categories under a NEW oil-gas-hoses master category. Adds 2 new brands (Continental Germany, Manuli Italy), 1 new top-level master category, 1 new spec template (oil-gas-hose-spec, 9 fields). Adds a NEW 8th megamenu top-level column "Oil & Gas Hoses".',
  },

  brands: [
    {
      slug: 'continental',
      name: 'Continental',
      description:
        'Continental ContiTech is the rubber & plastics technology division of Continental AG (Hannover, Germany). For oil & gas, Continental supplies the full upstream hose range — Black Gold low-pressure service hoses, Powerspiral cement and rotary hoses, Megashield / Fireshield fire-resistant hose lines, and the Choke & Kill lines per API 16C. Indus Hydraulics is an authorised Continental distributor in the UAE.',
      country: 'Germany',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Continental ContiTech Oil & Gas Hoses | Indus Hydraulics',
      seoDescription:
        'Continental ContiTech oil & gas hoses: Black Gold low-pressure, Powerspiral rotary, Megashield / Fireshield fire-resistant, Choke & Kill API 16C. Authorised distributor.',
    },
    {
      slug: 'manuli',
      name: 'Manuli',
      description:
        'Manuli Hydraulics (founded 1935, Milan, Italy) is a global hose-and-fluid-conveyance specialist, now part of Continental ContiTech\'s rubber business. Manuli\'s Tauroflon™ FEP-lined Choke & Kill hose is the industry reference for sour-service / chemical-service well control. Indus Hydraulics is an authorised Manuli distributor in the UAE.',
      country: 'Italy',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Manuli Hydraulics Oil & Gas Hoses | Indus Hydraulics',
      seoDescription:
        'Manuli Hydraulics oil & gas hoses: Tauroflon™ FEP-lined Choke & Kill, sour-service well control. Authorised distributor.',
    },
  ],

  categories: [
    {
      slug: 'oil-gas-hoses',
      name: 'Oil & Gas Hoses',
      shortDescription:
        'Specialty hoses for upstream oil & gas — drilling, well control, well service / intervention, tensioner / compensator, and low-pressure oilfield service. Continental ContiTech + Manuli.',
      position: 7,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Oil & Gas Hoses — Drilling, Well Control, Frac, Service | Indus Hydraulics',
      seoDescription:
        'Specialty oilfield hoses for drilling (API 7K), well control (API 16C), well service / intervention, tensioner / compensator, and low-pressure service. Continental ContiTech + Manuli.',
    },
    {
      slug: 'drilling-hoses',
      name: 'Drilling Hoses',
      parentSlug: 'oil-gas-hoses',
      shortDescription:
        'Rotary, vibrator, mud, cement, and mud-booster hoses for drilling-fluid circulation per API Specification 7K. Bonded, crimped, swaged couplings; high-pressure / sour-service / cement-resistant variants.',
      position: 0,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Drilling Hoses — Rotary, Vibrator, Mud, Cement | API 7K | Indus Hydraulics',
      seoDescription:
        'Rotary & vibrator drilling hoses per API 7K: mud / cement variants in bonded, crimped, swaged couplings. High-temp / sour-service / Powerspiral. Continental ContiTech.',
    },
    {
      slug: 'well-control-hoses',
      name: 'Well Control Hoses (API 16C)',
      parentSlug: 'oil-gas-hoses',
      shortDescription:
        'Choke & Kill hose assemblies (API 16C, 10000 psi WP), Flexible Choke & Kill lines with PA / Tauroflon™ liners, Subsea LMRP hoses (API 17J), BOP control hoses (API 16D Fireshield, fire-resistant), and hydraulic-conduit hoses for subsea umbilicals.',
      position: 1,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Well Control Hoses — Choke & Kill, BOP Control, Subsea | API 16C | Indus Hydraulics',
      seoDescription:
        'Well control hoses: Choke & Kill API 16C, BOP control API 16D Fireshield, Subsea LMRP API 17J, hydraulic conduit. Continental ContiTech + Manuli (Tauroflon™).',
    },
    {
      slug: 'well-service-hoses',
      name: 'Well Service & Intervention Hoses',
      parentSlug: 'oil-gas-hoses',
      shortDescription:
        'Well-test production, well stimulation (offshore + onshore acidizing), frac hose assemblies, and burner / flare-boom hoses. Acid-resistant fluoropolymer and abrasion-resistant rubber liners.',
      position: 2,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Well Service & Intervention Hoses — Frac, Stimulation, Well Test | Indus Hydraulics',
      seoDescription:
        'Well service & intervention hoses: frac (15000 psi), well stimulation / acidizing, well test production, burner/flare-boom. Continental ContiTech.',
    },
    {
      slug: 'tensioner-compensator-hoses',
      name: 'Tensioner & Compensator Hoses',
      parentSlug: 'oil-gas-hoses',
      shortDescription:
        'Riser tensioner, drill string compensator, and hydraulic tensioner hose assemblies for offshore drilling motion compensation. Fatigue-rated steel-cable reinforcement; multi-million-cycle service.',
      position: 3,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Tensioner & Compensator Hoses — Riser, Drill String | API 17J | Indus Hydraulics',
      seoDescription:
        'Riser tensioner, drill string compensator, hydraulic tensioner hose assemblies. Fatigue-rated, API 17J. Continental ContiTech.',
    },
    {
      slug: 'low-pressure-oilfield-hoses',
      name: 'Low-Pressure Oilfield Hoses',
      parentSlug: 'oil-gas-hoses',
      shortDescription:
        'Low-pressure utility hoses for drilling rig water, fuel, mud, bulk material, and potable water transfer. Continental Black Gold series in 300/400 psi discharge (D) and suction/discharge (SD) variants. Megashield / Flameshield fire-resistant covers; QC47 quick-connect couplings.',
      position: 4,
      isPublished: true,
      defaultSpecTemplateSlug: 'oil-gas-hose-spec',
      seoTitle: 'Low-Pressure Oilfield Hoses — Black Gold Series | Indus Hydraulics',
      seoDescription:
        'Low-pressure oilfield hoses: Continental Black Gold series (Drill Water, Fuel, Mud & Oil, Bulk Material, Potable Water) in 300/400 psi D and SD. Megashield / Flameshield. QC47 couplings.',
    },
  ],

  specTemplates: [OIL_GAS_HOSE_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'oil-gas-hoses',
    createColumnIfMissing: true,
    newColumnLabel: 'Oil & Gas Hoses',
    parentSubLabel: 'Hoses by Application',
    createSubSectionIfMissing: true,
    replacements: [
      { label: 'Drilling Hoses', categorySlug: 'drilling-hoses' },
      { label: 'Well Control Hoses (API 16C)', categorySlug: 'well-control-hoses' },
      { label: 'Well Service & Intervention', categorySlug: 'well-service-hoses' },
      { label: 'Tensioner & Compensator', categorySlug: 'tensioner-compensator-hoses' },
      { label: 'Low-Pressure Oilfield', categorySlug: 'low-pressure-oilfield-hoses' },
    ],
  },

  products: OILGAS_HOSES.map(makeOilGasHose),
}

export default batch
