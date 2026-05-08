/**
 * Metallic Hoses — Batch 0 (FRAMEWORK + Stainless Annular) — 2026-05-08
 *
 * First batch in the Metallic Hoses initiative. Establishes:
 *   - 4 new OEM brand records (Thorburn Flex, Senior Flexonics,
 *     Hose Master, Witzenmann) — all isAuthorizedDistributor=false
 *   - 1 new spec template `metallic-hose-spec` (22 fields) — purpose-built
 *     for metallic and PTFE hoses across all alloys, replacing the
 *     Dixon-flavored `industrial-hose-spec` for this family
 *   - 7 new categories: parent `metallic-hoses` + 6 sub-categories
 *     (stainless-corrugated, exotic-alloy, high-pressure, fire-protection,
 *     specialty-assemblies, ptfe)
 *   - Migration of 7 existing Dixon products from `metallic-ptfe-hoses` →
 *     new sub-categories with new template (specs + FAQs re-authored to
 *     leverage richer field set)
 *   - 10 new Thorburn Flex products covering the SS Annular / Helical /
 *     High-Pressure stainless steel families
 *
 * Megamenu update is DEFERRED — current `metallic-ptfe-hoses` slug stays
 * published as a legacy hub (now empty after migration). Megamenu
 * surfacing of the new structure to be done in a follow-up PR alongside
 * Batches 1-4.
 *
 * IMPORTANT: This batch MUST be run with --mode=overwrite-edits. The 7
 * Dixon migration products need their existing specs (linked to old
 * `industrial-hose-spec` fields) deleted and recreated against the new
 * `metallic-hose-spec` fields. add-only mode would leave orphan specs.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-0-framework.ts --dry-run --mode=overwrite-edits
 *   pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-0-framework.ts --mode=overwrite-edits
 */
import type {
  BrandPayload,
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Brand records (4 new OEM brands) ──────────────────────────────────────

const BRANDS: BrandPayload[] = [
  {
    slug: 'thorburn-flex',
    name: 'Thorburn Flex',
    country: 'Canada',
    description:
      'Thorburn Flex is a Canadian manufacturer of engineered metallic hose assemblies and expansion joints for power generation, petrochemical, hydro/pyrometallurgical, cryogenic, chlorine, and oxygen service. Manufacturing since 1954.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Thorburn Flex Metallic Hoses & Expansion Joints | Indus Hydraulics',
    seoDescription:
      'Thorburn Flex engineered metallic hose assemblies — stainless, Hastelloy, Inconel, Monel, Bronze. Cryogenic, steam-jacketed, chlorine transfer, oxygen lance. Supplied in the UAE by Indus Hydraulics.',
  },
  {
    slug: 'senior-flexonics',
    name: 'Senior Flexonics',
    country: 'United Kingdom',
    description:
      'Senior Flexonics (Pathway / Bartlett) is a global manufacturer of metallic hose assemblies, expansion joints, and bellows for industrial process, power generation, and petrochemical service. Part of the Senior plc group.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Senior Flexonics Metallic Hoses & Expansion Joints | Indus Hydraulics',
    seoDescription:
      'Senior Flexonics (Pathway / Bartlett) metallic hose assemblies, expansion joints, and bellows. Industrial process, power generation, and petrochemical service. AED pricing, RFQ.',
  },
  {
    slug: 'hose-master',
    name: 'Hose Master',
    country: 'USA',
    description:
      'Hose Master is a Cleveland, Ohio-based manufacturer of metallic hose assemblies (Annuflex, Stresstite product lines), expansion joints, and braided hose products for industrial, oilfield, and process service.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Hose Master Metallic Hoses (Annuflex, Stresstite) | Indus Hydraulics',
    seoDescription:
      'Hose Master metallic hose assemblies — Annuflex annular corrugated, Stresstite, Helibraid. Industrial, oilfield, and process service. AED pricing, RFQ.',
  },
  {
    slug: 'witzenmann',
    name: 'Witzenmann',
    country: 'Germany',
    description:
      'Witzenmann is the German pioneer of metallic hoses, expansion joints, and pipe-bellows since 1854. Premium engineered solutions for power, automotive, aerospace, chemical, and cryogenic service.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Witzenmann Metallic Hoses & Bellows | Indus Hydraulics',
    seoDescription:
      'Witzenmann metallic hoses, expansion joints, and pipe-bellows from Germany. Premium engineered solutions for power, chemical, and cryogenic service. AED pricing, RFQ.',
  },
]

// ── Spec template (22 fields, purpose-built for metallic + PTFE hoses) ───

const METALLIC_HOSE_SPEC: SpecTemplatePayload = {
  slug: 'metallic-hose-spec',
  name: 'Metallic Hose',
  description:
    'Spec template for metallic and PTFE hose assemblies — covers annular and helical corrugated cores in stainless / Hastelloy / Inconel / Monel / Bronze, plus PTFE smoothbore and convoluted. Supports specialty assemblies (cryogenic, steam-jacketed, electrically-heated, chlorine transfer, industrial gas).',
  position: 20,
  fields: [
    {
      key: 'hose_family',
      label: 'Hose Family',
      dataType: 'select',
      options: [
        'Stainless SS Corrugated',
        'Exotic Alloy Corrugated',
        'High-Pressure Metallic',
        'Specialty Metallic Core',
        'Fire Protection',
        'Cryogenic Assembly',
        'Steam-Jacketed Assembly',
        'Electrically-Heated Assembly',
        'Industrial Gas Assembly',
        'Chlorine Transfer Assembly',
        'Pipe Loop / Expansion Joint',
        'PTFE Smoothbore',
        'PTFE Convoluted',
        'Other',
      ],
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
      options: ['Annular Corrugated', 'Helical Corrugated', 'Smooth-Bore', 'Convoluted-PTFE'],
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'oem_part_code',
      label: 'OEM Part Code',
      dataType: 'text',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 2,
    },
    {
      key: 'braid_configuration',
      label: 'Braid Configuration',
      dataType: 'select',
      options: ['Unbraided', 'Single Braid', 'Double Braid', 'Triple Braid', 'N/A'],
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'core_material',
      label: 'Core Material',
      dataType: 'select',
      options: [
        'Type 304 SS',
        'Type 316L SS',
        'Type 321 SS',
        'Hastelloy C276',
        'Inconel 625',
        'Monel 400',
        'Bronze',
        'PTFE',
        'Other',
      ],
      group: 'Construction',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'braid_material',
      label: 'Braid Material',
      dataType: 'select',
      options: [
        'Type 304 SS',
        'Type 316L SS',
        'Type 316 SS',
        'Inconel',
        'Monel',
        'Bronze',
        'Polypropylene',
        'N/A (Unbraided)',
      ],
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'end_fitting_material',
      label: 'End Fitting Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'nominal_id_range',
      label: 'Nominal ID Range',
      dataType: 'text',
      group: 'Dimensions',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 7,
    },
    {
      key: 'bend_radius_static_mm',
      label: 'Bend Radius (Static)',
      unit: 'mm',
      dataType: 'number',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'bend_radius_dynamic_mm',
      label: 'Bend Radius (Dynamic)',
      unit: 'mm',
      dataType: 'number',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'live_length_for_vibration_mm',
      label: 'Live Length for Vibration',
      unit: 'mm',
      dataType: 'number',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'weight_kg_per_m',
      label: 'Weight',
      unit: 'kg/m',
      dataType: 'number',
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'max_working_pressure_bar',
      label: 'Max Working Pressure',
      unit: 'bar',
      dataType: 'number',
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 12,
    },
    {
      key: 'min_burst_pressure_bar',
      label: 'Min Burst Pressure',
      unit: 'bar',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
    {
      key: 'safety_factor',
      label: 'Safety Factor',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 14,
    },
    {
      key: 'temp_min_c',
      label: 'Min Operating Temperature',
      unit: '°C',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 15,
    },
    {
      key: 'temp_max_c',
      label: 'Max Operating Temperature',
      unit: '°C',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 16,
    },
    {
      key: 'iso_10380_class',
      label: 'ISO 10380 Class',
      dataType: 'select',
      options: ['PSL 1', 'PSL 2', 'PSL 3', 'N/A'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 17,
    },
    {
      key: 'ped_module',
      label: 'PED 2014/68/EU Module',
      dataType: 'select',
      options: ['None', 'Module A', 'Module B', 'Module D', 'Module H', 'Module H1'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 18,
    },
    {
      key: 'asme_compliance',
      label: 'ASME Compliance',
      dataType: 'text',
      helpText: 'Free-form list of applicable ASME standards (e.g. B31.1, B31.3, Sec III, Sec VIII Div 1).',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 19,
    },
    {
      key: 'nace_mr0175',
      label: 'NACE MR0175 / ISO 15156',
      dataType: 'boolean',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 20,
    },
    {
      key: 'cga_ul_chlorine_certs',
      label: 'CGA / UL / Chlorine Institute Certs',
      dataType: 'text',
      helpText: 'Free-form list of industrial gas / chlorine institute certifications (e.g. CGA-8.1, CGA96, UL96, UL536, Chlorine Institute Pamphlet 6).',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 21,
    },
  ],
}

// ── Categories (1 parent + 6 sub-categories) ─────────────────────────────

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'metallic-hoses',
    name: 'Metallic Hoses',
    parentSlug: 'industrial-hoses',
    shortDescription:
      'Engineered metallic hose assemblies — stainless, exotic alloys (Hastelloy / Inconel / Monel / Bronze), high-pressure, fire-protected, and specialty assemblies (cryogenic, steam-jacketed, electrically-heated, chlorine transfer, industrial gas). Plus PTFE smoothbore and convoluted hoses.',
    position: 27,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Metallic Hose Assemblies — Stainless, Hastelloy, Inconel, Monel, PTFE | Indus Hydraulics',
    seoDescription:
      'Engineered metallic hose assemblies and PTFE hoses. Stainless, exotic alloys, high-pressure, cryogenic, steam-jacketed, chlorine, oxygen. Thorburn Flex, Senior Flexonics, Hose Master, Witzenmann, Dixon. AED pricing, RFQ.',
  },
  {
    slug: 'metallic-stainless-corrugated-hoses',
    name: 'Stainless Corrugated Hoses',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'Type 304 / 316L / 321 stainless steel annular and helical corrugated metal hoses. Single, double, and triple braid configurations. DN 6 (1/4") to DN 350 (14"). Working pressures to 350+ bar with safety factor 4:1.',
    position: 0,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Stainless Steel Corrugated Metal Hoses — 304/316L/321 | Indus Hydraulics',
    seoDescription:
      'Stainless steel annular and helical corrugated metal hoses. Type 304 / 316L / 321 cores with 304 / 316L / 316 SS braid. DN 6 to DN 350. ISO 10380, PED 2014/68/EU. Thorburn Flex, Hose Master, Dixon. AED, RFQ.',
  },
  {
    slug: 'metallic-exotic-alloy-hoses',
    name: 'Exotic Alloy Hoses',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'Hastelloy C276, Inconel 625, Monel 400, and Bronze annular corrugated hoses for severe corrosion, high-temperature, sea-water, and dry-chlorine service. Per Chlorine Institute Pamphlet 6 and NACE MR0175.',
    position: 1,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Hastelloy / Inconel / Monel / Bronze Metallic Hoses | Indus Hydraulics',
    seoDescription:
      'Hastelloy C276, Inconel 625, Monel 400, Bronze metallic hoses. Severe corrosion / chloride / sour-gas / sea-water / chlorine service. Per Chlorine Institute Pamphlet 6, NACE MR0175. AED, RFQ.',
  },
  {
    slug: 'metallic-high-pressure-hoses',
    name: 'High-Pressure Metallic Hoses',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'High-pressure and ultra-high-pressure metallic hoses — fully compressed annular and helical designs rated up to 6,000 psi (414 bar). Nuclear CRN-rated variants. Suitable for steam, hydraulics, and high-pressure cryogenic loading.',
    position: 2,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'High-Pressure Metallic Hoses — to 6,000 psi | Indus Hydraulics',
    seoDescription:
      'High-pressure and ultra-high-pressure metallic hoses to 6,000 psi (414 bar). Fully compressed annular / helical, nuclear CRN-rated variants. Steam, hydraulic, cryogenic loading. AED, RFQ.',
  },
  {
    slug: 'metallic-fire-protection-hoses',
    name: 'Fire Protection & Specialty Cores',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'Specialty metallic hose cores and protection — Lock-Section interlocking cores, Armor-Flex ball-joint hose guards, Smooth-Flex non-corrugated alternatives, Fire Jackets and Fire Tape (Fry-Sil) for fire-survivability per insulation regulations.',
    position: 3,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Fire-Protected Metallic Hoses & Specialty Cores | Indus Hydraulics',
    seoDescription:
      'Lock-Section interlocking cores, Armor-Flex ball-joint guards, Smooth-Flex non-corrugated, Fire Jackets and Fire Tape (Fry-Sil). Fire-survivability for power, chemical, and process service. AED, RFQ.',
  },
  {
    slug: 'metallic-specialty-assemblies',
    name: 'Specialty Hose Assemblies',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'Engineered metallic hose assemblies for special service — cryogenic (LIN/LOX/LAR/LNG), steam-jacketed double-containment, electrically-heated, oxygen lance (Oxylance), industrial gas (CGA96/UL96), Monel chlorine transfer, and flexible pipe loops (Thor-Loop).',
    position: 4,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Specialty Metallic Hose Assemblies — Cryogenic, Steam, Chlorine | Indus Hydraulics',
    seoDescription:
      'Cryogenic, steam-jacketed, electrically-heated, oxygen lance, industrial gas (CGA96/UL96), Monel chlorine transfer, and flexible pipe loops. Per Chlorine Institute Spec 135-3, CGA-8.1, UL536. AED, RFQ.',
  },
  {
    slug: 'ptfe-hoses',
    name: 'PTFE Hoses',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'PTFE smoothbore and convoluted hoses with stainless steel or polypropylene braid. Anti-static options. Chemical, pharmaceutical, food, and high-purity service. Operating temperature -73°C to +260°C.',
    position: 5,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'PTFE Hoses — Smoothbore & Convoluted, SS/Polymer Braid | Indus Hydraulics',
    seoDescription:
      'PTFE smoothbore and convoluted hoses. Stainless steel and polypropylene braid options. Anti-static available. Chemical, pharmaceutical, food, high-purity service. -73°C to +260°C. AED, RFQ.',
  },
]

// ── Common spec value constants ──────────────────────────────────────────

const FITTING_MATERIAL_DEFAULT = 'Carbon steel ASTM A105, 304SS or 316SS — flange / NPT / sanitary / camlock per order'
const FITTING_MATERIAL_PREMIUM = '316L SS standard; Inconel, Hastelloy, or Monel available for matched-trim service'
const FITTING_MATERIAL_PTFE = 'Carbon steel or 316SS — sanitary tri-clamp, NPT, JIC, or flanged per order'

// ── Per-product input shape ──────────────────────────────────────────────

type MetallicHoseInput = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  categorySlug: string
  /** For PDP description and SEO; freeform sub-type after the family. */
  subType: string
  /** Spec field values */
  hoseFamily: string
  constructionType: string
  oemPartCode: string
  braidConfiguration: string
  coreMaterial: string
  braidMaterial: string
  endFittingMaterial: string
  nominalIdRange: string
  bendRadiusStaticMm: number
  bendRadiusDynamicMm: number
  liveLengthForVibrationMm: number
  weightKgPerM: number
  maxWorkingPressureBar: number
  minBurstPressureBar: number
  safetyFactor: number
  tempMinC: number
  tempMaxC: number
  iso10380Class: string
  pedModule: string
  asmeCompliance: string
  naceMr0175: boolean
  cgaUlChlorineCerts: string
  /** Marketing copy + applications */
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

// ── HTML description builder ─────────────────────────────────────────────

function buildHtml(g: MetallicHoseInput): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const tempRange = `${g.tempMinC}°C to +${g.tempMaxC}°C`
  const hasNace = g.naceMr0175 ? '<li>NACE MR0175 / ISO 15156 (sour-service compliant trim and fittings)</li>' : ''
  const hasCgaUl = g.cgaUlChlorineCerts && g.cgaUlChlorineCerts !== 'N/A' && g.cgaUlChlorineCerts !== 'Available on request'
    ? `<li>${escape(g.cgaUlChlorineCerts)}</li>`
    : ''

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.constructionType.toLowerCase())} metallic hose in the <em>${escape(g.hoseFamily)}</em> family. ${escape(g.coreMaterial)} core${g.braidConfiguration === 'Unbraided' ? ' (unbraided inner hose for bonnet and venting service)' : ` with ${escape(g.braidConfiguration.toLowerCase())} of ${escape(g.braidMaterial)}`}. Working pressure to ${g.maxWorkingPressureBar} bar, operating temperature ${escape(tempRange)}.</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.hoseFamily)} — ${escape(g.subType)}</li>
<li>Construction: ${escape(g.constructionType)}</li>
<li>Core material: ${escape(g.coreMaterial)}</li>
<li>Braid: ${escape(g.braidConfiguration)} — ${escape(g.braidMaterial)}</li>
<li>End fitting material: ${escape(g.endFittingMaterial)}</li>
<li>Nominal ID range: ${escape(g.nominalIdRange)}</li>
${g.bendRadiusStaticMm > 0 ? `<li>Bend radius (static): ${g.bendRadiusStaticMm} mm minimum</li>` : ''}
${g.bendRadiusDynamicMm > 0 ? `<li>Bend radius (dynamic): ${g.bendRadiusDynamicMm} mm minimum</li>` : ''}
${g.weightKgPerM > 0 ? `<li>Weight: ~${g.weightKgPerM} kg/m (size-dependent)</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Maximum working pressure ${g.maxWorkingPressureBar} bar at the smallest bore (decreases with increasing diameter — refer to the OEM size table for per-size ratings). Minimum burst pressure ${g.minBurstPressureBar} bar with safety factor ${g.safetyFactor}:1 per ISO 10380. Operating temperature range ${escape(tempRange)} (continuous service; intermittent excursions evaluated on request). All assemblies hydrotested at 1.5× working pressure with a witness-test certificate available on request.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
<li>ISO 10380:2012 ${escape(g.iso10380Class)} (Corrugated Metal Hoses and Hose Assemblies)</li>
${g.pedModule !== 'None' ? `<li>Pressure Equipment Directive 2014/68/EU ${escape(g.pedModule)}</li>` : ''}
${g.asmeCompliance ? `<li>${escape(g.asmeCompliance)}</li>` : ''}
${hasNace}
${hasCgaUl}
<li>EN 10204 3.1 / 3.2 mill test reports on request</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and process medium, (b) operating temperature range, (c) bore size and overall length, (d) end fitting type per side (NPT / BSPP / ANSI 150-1500# RF / DIN PN10-PN40 / sanitary tri-clamp / camlock / butt-weld / etc.), (e) braid configuration (unbraided / single / double / triple — drives pressure rating), (f) any required certifications (ISO 10380 PSL class, PED Module, ASME conformance, NACE MR0175, CGA / UL / Chlorine Institute). Indus quotes ex-Dubai for stock items and ex-OEM for build-to-order, with mill test reports and pressure-test certificates included.</p>
<h3>Companion products</h3>
<p>Pair with matched ANSI flange gaskets, hose clamps, and OEM end-fitting hardware. For high-vibration installations, also specify a Lock-Section or Armor-Flex external hose guard. For fire-rated runs, add a Fry-Sil Fire Jacket or Fire Tape covering. For high-cycle or premium-corrosion service, ask about the matched OEM expansion-joint variant of the same alloy and pressure class.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: MetallicHoseInput): FaqEntry[] {
  return [
    {
      q: 'What is this metallic hose used for?',
      a: `${g.oneLiner} Typical applications: ${g.applications.slice(0, 3).join('; ')}. The ${g.coreMaterial} core gives the corrosion / temperature envelope; the ${g.braidConfiguration === 'Unbraided' ? 'unbraided design' : g.braidConfiguration.toLowerCase() + ' of ' + g.braidMaterial} sets the pressure containment.`,
    },
    {
      q: 'What sizes are available?',
      a: `${g.nominalIdRange}. Working pressure decreases as bore size increases — at the smallest bore the rating is up to ${g.maxWorkingPressureBar} bar; at the largest bore the rating drops to a fraction of that. Refer to the OEM datasheet for per-size pressure curves, or send the required (size, pressure, temperature, end fittings) on the RFQ for a matched quote.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: `Up to ${g.maxWorkingPressureBar} bar working pressure (smallest bore, ${g.braidConfiguration.toLowerCase()} configuration). Minimum burst pressure ${g.minBurstPressureBar} bar — safety factor ${g.safetyFactor}:1. Hydrotested at 1.5× working pressure per ISO 10380 acceptance criteria. ${g.braidConfiguration !== 'Triple Braid' ? 'For higher pressures than the listed rating, specify the next-higher braid count on the RFQ — Indus can quote a double or triple braid variant of the same core.' : 'Triple braid is the highest-pressure variant of this family; for further uprating, switch to the High-Pressure Metallic line.'}`,
    },
    {
      q: 'What is the operating temperature range?',
      a: `${g.tempMinC}°C to +${g.tempMaxC}°C continuous. The ${g.coreMaterial} core handles the full range; ${g.coreMaterial.includes('SS') || g.coreMaterial.includes('Inconel') || g.coreMaterial.includes('Hastelloy') ? 'temperature de-rates pressure capacity per ISO 10380 — at upper temperatures, expect ~30-40% pressure de-rating. Intermittent excursions outside this range are evaluated case-by-case.' : 'consult the OEM datasheet for the temperature de-rating curve.'}`,
    },
    {
      q: 'What is the construction (cover / lining / reinforcement)?',
      a: `Lining (core): ${g.coreMaterial} — ${g.constructionType.toLowerCase()} corrugated profile. Reinforcement (braid): ${g.braidConfiguration} of ${g.braidMaterial}. End fittings: ${g.endFittingMaterial}. The corrugation profile and braid weave are matched at the OEM to deliver the rated pressure containment with the design bend-radius envelope (${g.bendRadiusStaticMm > 0 ? g.bendRadiusStaticMm + ' mm static minimum' : 'see datasheet'}${g.bendRadiusDynamicMm > 0 ? ', ' + g.bendRadiusDynamicMm + ' mm dynamic' : ''}).`,
    },
    {
      q: 'What standards and certifications does this hose meet?',
      a: `ISO 10380:2012 ${g.iso10380Class}.${g.pedModule !== 'None' ? ` PED 2014/68/EU ${g.pedModule}.` : ''}${g.asmeCompliance ? ` ${g.asmeCompliance}.` : ''}${g.naceMr0175 ? ' NACE MR0175 / ISO 15156 sour-service compliant.' : ''}${g.cgaUlChlorineCerts && g.cgaUlChlorineCerts !== 'N/A' && g.cgaUlChlorineCerts !== 'Available on request' ? ' Plus: ' + g.cgaUlChlorineCerts + '.' : ''} EN 10204 3.1 / 3.2 mill test reports supplied on request. Pressure-test certificate (1.5× working pressure) included with every assembly.`,
    },
    {
      q: 'What end fittings are available?',
      a: `${g.endFittingMaterial}. Common end-fitting styles: NPT / BSPP threaded; ANSI 150# / 300# / 600# / 900# / 1500# Raised-Face flanged; DIN PN10 / PN16 / PN25 / PN40 flanged; sanitary tri-clamp; camlock male / female; butt-weld for permanent installation. Specify the end style and connection size per side on the RFQ — Indus matches and welds the fittings to the hose at our Dubai facility (or ex-OEM for premium-grade assemblies).`,
    },
    {
      q: 'What is the lead time?',
      a: `Common configurations are short-lead from Indus Dubai stock (typical lead time ${g.leadTimeDays} working days). Custom assemblies (specific sizes, exotic alloys, severe-service certifications, or ${g.iso10380Class === 'PSL 3' ? 'PSL 3 monogrammed assemblies' : 'PSL 2/3 monogrammed assemblies'}) typically build to order — confirm OEM build slot at quote stage. Pressure-testing, NACE certification, or PED Module H attestation add 5-10 days to the dispatch window.`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: MetallicHoseInput): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: g.categorySlug,
    specTemplateSlug: 'metallic-hose-spec',
    status: 'active',
    unitOfMeasure: 'metre',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      hose_family: g.hoseFamily,
      construction_type: g.constructionType,
      oem_part_code: g.oemPartCode,
      braid_configuration: g.braidConfiguration,
      core_material: g.coreMaterial,
      braid_material: g.braidMaterial,
      end_fitting_material: g.endFittingMaterial,
      nominal_id_range: g.nominalIdRange,
      bend_radius_static_mm: g.bendRadiusStaticMm,
      bend_radius_dynamic_mm: g.bendRadiusDynamicMm,
      live_length_for_vibration_mm: g.liveLengthForVibrationMm,
      weight_kg_per_m: g.weightKgPerM,
      max_working_pressure_bar: g.maxWorkingPressureBar,
      min_burst_pressure_bar: g.minBurstPressureBar,
      safety_factor: g.safetyFactor,
      temp_min_c: g.tempMinC,
      temp_max_c: g.tempMaxC,
      iso_10380_class: g.iso10380Class,
      ped_module: g.pedModule,
      asme_compliance: g.asmeCompliance,
      nace_mr0175: g.naceMr0175,
      cga_ul_chlorine_certs: g.cgaUlChlorineCerts,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword:
      `${g.coreMaterial.toLowerCase().replace(' ss', ' stainless')} ${g.constructionType.toLowerCase()} metallic hose ${g.maxWorkingPressureBar} bar`.slice(0, 120),
  }
}

// ── Migrated Dixon products (7) ───────────────────────────────────────────

const DIXON_MIGRATED: MetallicHoseInput[] = [
  {
    sku: 'IH-IH-METALLIC-ADFLEX',
    title: 'Adflex Commercial Grade Metallic Hose',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Commercial-grade annular corrugated',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'ADFLEX',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_DEFAULT,
    nominalIdRange: 'DN 6 (1/4") to DN 300 (12")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 100,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 100,
    minBurstPressureBar: 400,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 1',
    pedModule: 'Module H',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'Available on request',
    oneLiner:
      'Adflex commercial-grade Type 316L stainless corrugated metal hose with single, double, or triple AISI 304 SS braid. DN 6 to DN 300 with working pressure to 100 bar.',
    applications: [
      'Process plant utility transfer',
      'Compressed gas / steam connector lines',
      'Vibration absorption on rotating equipment',
      'Pump suction / discharge connectors',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-IH-METALLIC-HP-THP',
    title: 'HP / THP High Pressure Metallic Hose',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'High-pressure reinforced annular',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'HP-THP',
    braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_DEFAULT,
    nominalIdRange: 'DN 6 (1/4") to DN 200 (8")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 110,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 255,
    minBurstPressureBar: 1020,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 1',
    pedModule: 'Module H',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'Available on request',
    oneLiner:
      'HP / THP reinforced 316L stainless annular corrugated hose with single or double 304 SS braid. DN 6 to DN 200 rated to 255 bar (double braid). High-pressure process and steam.',
    applications: [
      'High-pressure steam transfer',
      'Hydraulic power-pack connectors',
      'High-pressure pump-discharge protection',
      'Heat-exchanger flexible joints',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-IH-METALLIC-HYPARFLEX',
    title: 'Hyparflex Close Pitch Metallic Hose',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Close-pitch annular for tight bend radius',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'HYPARFLEX',
    braidConfiguration: 'Triple Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_DEFAULT,
    nominalIdRange: 'DN 6 (1/4") to DN 150 (6")',
    bendRadiusStaticMm: 9,
    bendRadiusDynamicMm: 110,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 175,
    minBurstPressureBar: 700,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 1',
    pedModule: 'Module H',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'Available on request',
    oneLiner:
      'Hyparflex close-pitch 316L stainless annular hose. Tight static bend radius from 9 mm. Single, double, or triple 304 SS braid up to 175 bar working pressure.',
    applications: [
      'Tight-bend installations / instrument tap-offs',
      'Confined-space high-vibration connectors',
      'Flexible joints in compact equipment skids',
      'Robotic / articulated motion lines',
    ],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-IH-METALLIC-SUPARFLEX',
    title: 'Suparflex Standard Pitch Metallic Hose',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Standard-pitch annular all-purpose',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'SUPARFLEX',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_DEFAULT,
    nominalIdRange: 'DN 6 (1/4") to DN 250 (10")',
    bendRadiusStaticMm: 30,
    bendRadiusDynamicMm: 150,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 80,
    minBurstPressureBar: 320,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 1',
    pedModule: 'Module H',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'Available on request',
    oneLiner:
      'Suparflex standard-pitch 316L stainless annular hose for general process and utility service. DN 6 to DN 250 with single, double, or triple 304 SS braid. Up to 80 bar.',
    applications: [
      'General process plant utility',
      'Steam and condensate transfer',
      'Compressed gas connector lines',
      'Pump-discharge flexible joints',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-IH-PTFE-CONVOLUTED-POLYMER',
    title: 'Convoluted PTFE Hose with Polypropylene Braid',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'ptfe-hoses',
    subType: 'Anti-static convoluted PTFE with polymer braid',
    hoseFamily: 'PTFE Convoluted',
    constructionType: 'Convoluted-PTFE',
    oemPartCode: 'PTFE-CONV-POLY',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'PTFE',
    braidMaterial: 'Polypropylene',
    endFittingMaterial: FITTING_MATERIAL_PTFE,
    nominalIdRange: 'DN 10 (3/8") to DN 50 (2")',
    bendRadiusStaticMm: 40,
    bendRadiusDynamicMm: 130,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 16,
    minBurstPressureBar: 64,
    safetyFactor: 4,
    tempMinC: -73,
    tempMaxC: 260,
    iso10380Class: 'N/A',
    pedModule: 'Module A',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'N/A',
    oneLiner:
      'Anti-static convoluted PTFE hose with polypropylene braid. Light-weight chemical and pharmaceutical service. DN 10 to DN 50, working pressure up to 16 bar.',
    applications: [
      'Chemical transfer (corrosive, anti-static required)',
      'Pharmaceutical transfer',
      'Food and beverage (FDA-compliant trim)',
      'High-purity solvent transfer',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-IH-PTFE-CONVOLUTED-SS',
    title: 'Convoluted PTFE Hose with Stainless Steel Braid',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'ptfe-hoses',
    subType: 'Anti-static convoluted PTFE with SS braid',
    hoseFamily: 'PTFE Convoluted',
    constructionType: 'Convoluted-PTFE',
    oemPartCode: 'PTFE-CONV-SS',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'PTFE',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PTFE,
    nominalIdRange: 'DN 10 (3/8") to DN 75 (3")',
    bendRadiusStaticMm: 40,
    bendRadiusDynamicMm: 130,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 25,
    minBurstPressureBar: 100,
    safetyFactor: 4,
    tempMinC: -73,
    tempMaxC: 260,
    iso10380Class: 'N/A',
    pedModule: 'Module A',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'N/A',
    oneLiner:
      'Anti-static convoluted PTFE hose with 304 SS braid. Premium chemical, pharmaceutical, and high-purity service. DN 10 to DN 75, working pressure up to 25 bar.',
    applications: [
      'Aggressive chemical transfer',
      'Pharmaceutical / cosmetic transfer (high-purity)',
      'Solvent and reagent transfer',
      'Steam-cleanable process lines',
    ],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-IH-PTFE-SMOOTHBORE-SS',
    title: 'PTFE Smoothbore Hose with Stainless Steel Braid',
    brandSlug: 'dixon',
    countryOfOrigin: 'United Kingdom',
    categorySlug: 'ptfe-hoses',
    subType: 'Smoothbore PTFE with SS braid',
    hoseFamily: 'PTFE Smoothbore',
    constructionType: 'Smooth-Bore',
    oemPartCode: 'PTFE-SMOOTHBORE-SS',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'PTFE',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PTFE,
    nominalIdRange: 'DN 5 (3/16") to DN 50 (2")',
    bendRadiusStaticMm: 50,
    bendRadiusDynamicMm: 200,
    liveLengthForVibrationMm: 0,
    weightKgPerM: 0,
    maxWorkingPressureBar: 350,
    minBurstPressureBar: 1400,
    safetyFactor: 4,
    tempMinC: -73,
    tempMaxC: 260,
    iso10380Class: 'N/A',
    pedModule: 'Module A',
    asmeCompliance: '',
    naceMr0175: false,
    cgaUlChlorineCerts: 'N/A',
    oneLiner:
      'PTFE smoothbore hose with 304 SS braid. Up to 350 bar working pressure (smallest bore). Hydraulic, paint, and chemical transfer in tight bores.',
    applications: [
      'High-pressure hydraulic transfer (clean fluids)',
      'Paint and ink transfer (smoothbore — minimal residual)',
      'Aggressive chemical small-bore lines',
      'Pharmaceutical / cosmetic high-pressure transfer',
    ],
    leadTimeDays: 7,
  },
]

// ── New Thorburn Flex products (10) ───────────────────────────────────────

const THORBURN_NEW: MetallicHoseInput[] = [
  {
    sku: 'IH-MH-THORBURN-S95-321-UB',
    title: 'Thorburn S95 — Type 321 SS Annular, Unbraided Inner Core',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 321 unbraided annular inner core',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S95',
    braidConfiguration: 'Unbraided',
    coreMaterial: 'Type 321 SS',
    braidMaterial: 'N/A (Unbraided)',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 350 (14")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.13,
    maxWorkingPressureBar: 13,
    minBurstPressureBar: 52,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S95 Type 321 stainless annular corrugated hose, unbraided inner core. DN 6 to DN 350. Use as a vibration-absorbing connector or as the inner element of a multi-layer assembly.',
    applications: [
      'Vibration absorption on rotating equipment',
      'Inner element of jacketed / armored assemblies',
      'Pulp & paper bleach plants',
      'Power-generation flue ducts',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-S96-321',
    title: 'Thorburn S96 — Type 321 SS Annular, Single Braid (304 SS)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 321 single-braid annular',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S96',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 321 SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 350 (14")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.25,
    maxWorkingPressureBar: 146,
    minBurstPressureBar: 584,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S96 Type 321 stainless annular corrugated hose with single 304 SS braid. DN 6 to DN 350. Working pressure to 146 bar (smallest bore). General-purpose petrochemical and process service.',
    applications: [
      'Petrochemical process lines',
      'Steam transfer (saturated and superheated)',
      'Compressed gas distribution',
      'Pump suction / discharge connectors',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-S96Z-321',
    title: 'Thorburn S96Z — Type 321 SS Annular, Double Braid (304 SS)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 321 double-braid annular',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S96Z',
    braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 321 SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 300 (12")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.37,
    maxWorkingPressureBar: 215,
    minBurstPressureBar: 862,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S96Z Type 321 stainless annular corrugated hose with double 304 SS braid. DN 6 to DN 300. Working pressure to 215 bar — premium higher-pressure variant of the S96.',
    applications: [
      'High-pressure petrochemical service',
      'Steam transfer (HP / superheated)',
      'Hydrogen and ammonia distribution',
      'Refinery process plant flexible joints',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-MH-THORBURN-S91-316L-UB',
    title: 'Thorburn S91 — Type 316L SS Annular, Unbraided Inner Core',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 316L unbraided annular inner core',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S91',
    braidConfiguration: 'Unbraided',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'N/A (Unbraided)',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 350 (14")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.13,
    maxWorkingPressureBar: 13,
    minBurstPressureBar: 52,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S91 Type 316L stainless annular corrugated hose, unbraided inner core. DN 6 to DN 350. Premium L-grade chemistry for chloride-corrosive service.',
    applications: [
      'Chloride-rich process lines',
      'Sea-water and brackish-water service',
      'Inner element of jacketed assemblies',
      'Pharma / FDA-compliant utility',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-S92-316L',
    title: 'Thorburn S92 — Type 316L SS Annular, Single Braid (304 SS)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 316L single-braid annular (304 SS braid)',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S92',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 350 (14")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.25,
    maxWorkingPressureBar: 146,
    minBurstPressureBar: 584,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S92 Type 316L stainless annular corrugated hose with single 304 SS braid. DN 6 to DN 350. Working pressure to 146 bar — chloride-resistant general-purpose hose.',
    applications: [
      'Chloride-rich process lines',
      'Sea-water cooling utility',
      'Petrochemical and refinery service',
      'Sour-gas processing (NACE-compliant)',
    ],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-S92Z-316L',
    title: 'Thorburn S92Z — Type 316L SS Annular, Double Braid (304 SS)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 316L double-braid annular (304 SS braid)',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S92Z',
    braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 300 (12")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.37,
    maxWorkingPressureBar: 215,
    minBurstPressureBar: 862,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 2',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S92Z Type 316L stainless annular corrugated hose with double 304 SS braid. DN 6 to DN 300. Working pressure to 215 bar — high-pressure chloride-resistant variant.',
    applications: [
      'High-pressure petrochemical service',
      'Sour-gas processing manifolds',
      'HP sea-water cooling',
      'Refinery cracker / reformer service',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-MH-THORBURN-S93-316L',
    title: 'Thorburn S93 — Type 316L SS Annular, Single Braid (316L SS — Premium)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 316L single-braid annular (316L SS braid — premium)',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S93',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 316L SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 350 (14")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.25,
    maxWorkingPressureBar: 146,
    minBurstPressureBar: 584,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 3',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S93 Type 316L stainless annular hose with single 316L SS braid (matched-alloy braid for extreme chloride service). DN 6 to DN 350. Premium L-grade for severe corrosion environments.',
    applications: [
      'Severe chloride-corrosive process lines',
      'High-purity pharmaceutical / semiconductor',
      'PSL 3 monogrammed assemblies',
      'Marine and offshore severe-service',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-MH-THORBURN-S93Z-316L',
    title: 'Thorburn S93Z — Type 316L SS Annular, Double Braid (316L SS — Premium)',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 316L double-braid annular (316L SS braid — premium)',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S93Z',
    braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 316L SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 300 (12")',
    bendRadiusStaticMm: 25,
    bendRadiusDynamicMm: 127,
    liveLengthForVibrationMm: 102,
    weightKgPerM: 0.37,
    maxWorkingPressureBar: 215,
    minBurstPressureBar: 862,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 3',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section IX',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S93Z Type 316L stainless annular hose with double 316L SS braid. DN 6 to DN 300. Premium HP variant for the most severe chloride and sour-gas service.',
    applications: [
      'HP severe-service chloride process',
      'Sour-gas plant high-pressure connectors',
      'PSL 3 monogrammed HP assemblies',
      'Severe-service marine / offshore',
    ],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-MH-THORBURN-S65-XFLEX-321',
    title: 'Thorburn S65 — Extra Flex Helical, Type 321 SS with 304 SS Braid',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-stainless-corrugated-hoses',
    subType: 'Type 321 helical extra-flex (low torsional stress)',
    hoseFamily: 'Stainless SS Corrugated',
    constructionType: 'Helical Corrugated',
    oemPartCode: 'S65',
    braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 321 SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 25 (1") to DN 250 (10")',
    bendRadiusStaticMm: 75,
    bendRadiusDynamicMm: 250,
    liveLengthForVibrationMm: 150,
    weightKgPerM: 0.4,
    maxWorkingPressureBar: 35,
    minBurstPressureBar: 140,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 1',
    pedModule: 'Module D',
    asmeCompliance: 'ASME B31.1, B31.3',
    naceMr0175: false,
    cgaUlChlorineCerts: 'CSA B51',
    oneLiner:
      'Thorburn S65 Type 321 helical-corrugated hose with single 304 SS braid. Extra-flex design for high-cycle vibration absorption and minimal torsional stress. DN 25 to DN 250.',
    applications: [
      'High-cycle vibration absorption',
      'Compressed gas connectors with frequent bending',
      'Articulated / robotic motion lines',
      'Reciprocating equipment connectors',
    ],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-MH-THORBURN-S81-HP-316L',
    title: 'Thorburn S81 — High Pressure 316L SS Annular, Double Braid',
    brandSlug: 'thorburn-flex',
    countryOfOrigin: 'Canada',
    categorySlug: 'metallic-high-pressure-hoses',
    subType: 'Type 316L high-pressure double-braid annular',
    hoseFamily: 'High-Pressure Metallic',
    constructionType: 'Annular Corrugated',
    oemPartCode: 'S81',
    braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS',
    braidMaterial: 'Type 304 SS',
    endFittingMaterial: FITTING_MATERIAL_PREMIUM,
    nominalIdRange: 'DN 6 (1/4") to DN 100 (4")',
    bendRadiusStaticMm: 50,
    bendRadiusDynamicMm: 200,
    liveLengthForVibrationMm: 100,
    weightKgPerM: 0.5,
    maxWorkingPressureBar: 200,
    minBurstPressureBar: 800,
    safetyFactor: 4,
    tempMinC: -200,
    tempMaxC: 650,
    iso10380Class: 'PSL 3',
    pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section VIII Div 1',
    naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51, CGA-8.1-M86',
    oneLiner:
      'Thorburn S81 Type 316L high-pressure annular hose with double 304 SS braid. DN 6 to DN 100. Working pressure to 200 bar — bridges the gap between standard SS Annular and the ultra-HP Fully Compressed line.',
    applications: [
      'High-pressure steam (saturated and superheated)',
      'Hydraulic power-pack connectors',
      'High-pressure gas distribution',
      'Pump-discharge connectors at HP service',
    ],
    leadTimeDays: 42,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const PRODUCTS = [...DIXON_MIGRATED, ...THORBURN_NEW]

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-metallic-hoses-0-framework',
    description:
      'Metallic Hoses Batch 0 — establishes 4 OEM brands (Thorburn Flex, Senior Flexonics, Hose Master, Witzenmann), new metallic-hose-spec template (22 fields), 7 new categories (parent metallic-hoses + 6 sub-categories), migrates 7 existing Dixon products to the new structure, and lands 10 new Thorburn Flex stainless-annular products. MUST run with --mode=overwrite-edits.',
  },

  brands: BRANDS,
  categories: CATEGORIES,
  specTemplates: [METALLIC_HOSE_SPEC],

  // Megamenu update is DEFERRED to a follow-up PR — Industrial Hoses column
  // currently has 26+ leaves; rather than reshuffle that list in this large
  // framework batch, we'll add metallic-hoses to the megamenu in a small
  // dedicated PR after Batches 1-2 land more content.

  products: PRODUCTS.map(makeProduct),
}

export default batch
