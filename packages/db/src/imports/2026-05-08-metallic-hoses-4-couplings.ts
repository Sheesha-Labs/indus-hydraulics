/**
 * Metallic Hoses — Batch 4 (FINAL: Specialty Couplings) — 2026-05-08
 *
 * 10 specialty couplings in a new metallic-hose-couplings sub-category.
 * Covers Thorburn's quick-coupling line that's specifically designed for
 * metallic-hose ecosystems (cryogenic, dry-break, tanker met-o-seal,
 * pipe unions, swivel joints, sight-flow indicator).
 *
 * Brand: All 10 Thorburn Flex.
 *
 * Note: existing camlock / cam-and-groove couplings (Dixon, Sealfast,
 * Sunpool) are not duplicated here — those continue in their existing
 * industrial-hoses sub-categories.
 */
import type { CategoryPayload, FaqEntry, ImportBatch, ProductImportPayload } from '../import/types'

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'metallic-hose-couplings',
    name: 'Metallic Hose Couplings',
    parentSlug: 'metallic-hoses',
    shortDescription:
      'Specialty quick-couplings for metallic-hose ecosystems — cryogenic non-valved, dry-break, met-o-seal tanker, O-seal pipe unions, swivel joints, sight-flow indicators. Designed for the metallic-hose service envelope (high-pressure, cryogenic, sour-service).',
    position: 6,
    isPublished: true,
    defaultSpecTemplateSlug: 'metallic-hose-spec',
    seoTitle: 'Metallic Hose Couplings — Cryogenic, Dry-Break, Met-O-Seal | Indus Hydraulics',
    seoDescription:
      'Specialty quick-couplings for metallic hoses: T52 cryogenic, T92H dry-break, Met-O-Seal tanker, O-Seal pipe unions, SJ swivel joints, TS25 sight-flow. Per Chlorine Institute, CGA, UL, and ANSI standards. AED, RFQ.',
  },
]

type Input = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  subType: string
  oemPartCode: string
  bodyMaterial: 'Carbon steel A105' | '316L SS' | '316 SS' | 'Monel 400' | 'Type 304 SS'
  endFittingMaterial: string
  nominalIdRange: string
  maxWorkingPressureBar: number
  minBurstPressureBar: number
  tempMinC: number
  tempMaxC: number
  asmeCompliance: string
  cgaUlChlorineCerts: string
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

function buildHtml(g: Input): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const tempRange = `${g.tempMinC}°C to +${g.tempMaxC}°C`
  return `<p>The <strong>${escape(g.title)}</strong> is a specialty quick-coupling designed for the metallic-hose service envelope. ${escape(g.subType)}. ${g.maxWorkingPressureBar > 0 ? `Working pressure ${g.maxWorkingPressureBar} bar.` : ''} Operating temperature ${escape(tempRange)}.</p>
<h3>Construction</h3>
<ul>
<li>Type: Specialty Coupling — ${escape(g.subType)}</li>
<li>Body material: ${escape(g.bodyMaterial)}</li>
<li>End fitting: ${escape(g.endFittingMaterial)}</li>
<li>Bore range: ${escape(g.nominalIdRange)}</li>
${g.maxWorkingPressureBar > 0 ? `<li>Working pressure: ${g.maxWorkingPressureBar} bar (${g.minBurstPressureBar} bar burst)</li>` : ''}
<li>Temperature range: ${escape(tempRange)}</li>
</ul>
<h3>Performance</h3>
<p>Hydrotested at 1.5× working pressure. ${g.cgaUlChlorineCerts ? `Compliant with ${escape(g.cgaUlChlorineCerts)}.` : ''} ${g.asmeCompliance ? `Per ${escape(g.asmeCompliance)}.` : ''} Designed for repeated connect / disconnect cycles in industrial service.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>How to order</h3>
<p>Confirm (a) end-connection size and style on each side, (b) operating pressure / temperature envelope, (c) any required certifications, (d) seal material preference (NBR / FKM / FFKM / PEEK / Teflon — drives chemical compatibility and temperature limit). Indus matches the coupling halves to your hose assemblies and supplies the matched gaskets and fasteners.</p>
<h3>Companion products</h3>
<p>Order in matched pairs (male and female halves) for new installations, or as service spares for existing assemblies. Indus also supplies matched seal kits for routine maintenance, plus replacement gaskets and fasteners.</p>`
}

function buildFaqs(g: Input): FaqEntry[] {
  return [
    { q: 'What is this coupling used for?', a: `${g.oneLiner} Typical applications: ${g.applications.slice(0, 3).join('; ')}.` },
    {
      q: 'What is the working pressure rating?',
      a: g.maxWorkingPressureBar > 0
        ? `${g.maxWorkingPressureBar} bar working pressure (${g.minBurstPressureBar} bar minimum burst). Hydrotested at 1.5× working pressure. Repeated connect / disconnect rated for 5,000+ cycles in standard service.`
        : 'Pressure rating per the host hose / process line — this coupling is not the limiting factor in most installations.',
    },
    {
      q: 'What is the operating temperature range?',
      a: `${g.tempMinC}°C to +${g.tempMaxC}°C continuous. Beyond this range, choose a different seal material — Indus can quote the matched seal kit for extended-temperature service.`,
    },
    {
      q: 'What body and seal materials are used?',
      a: `Body: ${g.bodyMaterial}. End fitting: ${g.endFittingMaterial}. Standard seals: NBR (general service), FKM / Viton (chemical / hydrocarbon), PEEK (cryogenic), Teflon (chemical inertness). Seal selection is driven by the process medium and temperature envelope.`,
    },
    {
      q: 'Can this coupling be used in sour-service (H₂S) installations?',
      a: g.bodyMaterial === '316L SS' || g.bodyMaterial === 'Monel 400'
        ? 'Yes — body material is NACE MR0175 compliant. Confirm the seal material for the H₂S partial pressure on the RFQ.'
        : 'Body material is standard service. For sour-service, specify the NACE MR0175 compliant variant (typically 316L SS or Monel 400 body) on the RFQ.',
    },
    {
      q: 'What standards / certifications does this meet?',
      a: `${g.asmeCompliance ? g.asmeCompliance + '. ' : ''}${g.cgaUlChlorineCerts ? g.cgaUlChlorineCerts + '. ' : ''}EN 10204 3.1 / 3.2 mill test reports for body material on request.`,
    },
    {
      q: 'How is connect / disconnect performed?',
      a: g.subType.toLowerCase().includes('cryogenic')
        ? 'Cryogenic couplings disconnect under pressure with no spillage — push the male half into the female receptacle, rotate 90° to lock. Disconnect by reversing — the internal valve mechanism prevents loss of cryogenic liquid.'
        : g.subType.toLowerCase().includes('dry break')
          ? 'Dry-break couplings have an integrated check valve in each half — the valve closes automatically on disconnect, preventing fluid spillage. Push to engage, rotate to lock; disconnect by reverse rotation.'
          : g.subType.toLowerCase().includes('met-o-seal')
            ? 'Met-O-Seal couplings use a metal-to-metal seal that compresses under wing-nut torque. Engagement is bayonet-style: push and twist to lock, then tighten the wing nuts to seal.'
            : g.subType.toLowerCase().includes('o-seal') || g.subType.toLowerCase().includes('pipe union')
              ? 'O-Seal pipe unions use an O-ring face seal — connect by hand, then torque the union nut to compress the seal. Standard make-up torque per the OEM table.'
              : g.subType.toLowerCase().includes('swivel')
                ? 'Swivel joints rotate freely under pressure. Specify the rotational speed and pressure envelope on the RFQ — different bearing / seal configurations cover different duty profiles.'
                : g.subType.toLowerCase().includes('sight')
                  ? 'Sight-flow indicators are inline pass-through devices — the indicator wheel rotates with flow, providing visual confirmation of fluid movement. No connect / disconnect needed; install in the line during initial assembly.'
                  : 'See OEM commissioning manual for specific connect / disconnect procedure.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-OEM. Common configurations are stocked at the OEM for short-lead delivery; non-standard sizes / materials build to order.`,
    },
  ]
}

function makeProduct(g: Input): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'metallic-hose-couplings',
    specTemplateSlug: 'metallic-hose-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: g.countryOfOrigin,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      hose_family: 'Other',
      construction_type: 'Smooth-Bore',
      oem_part_code: g.oemPartCode,
      braid_configuration: 'N/A',
      core_material: 'Other',
      braid_material: 'N/A (Unbraided)',
      end_fitting_material: g.endFittingMaterial,
      nominal_id_range: g.nominalIdRange,
      bend_radius_static_mm: 0,
      bend_radius_dynamic_mm: 0,
      live_length_for_vibration_mm: 0,
      weight_kg_per_m: 0,
      max_working_pressure_bar: g.maxWorkingPressureBar,
      min_burst_pressure_bar: g.minBurstPressureBar,
      safety_factor: 4,
      temp_min_c: g.tempMinC,
      temp_max_c: g.tempMaxC,
      iso_10380_class: 'N/A',
      ped_module: 'Module A',
      asme_compliance: g.asmeCompliance,
      nace_mr0175: g.bodyMaterial === '316L SS' || g.bodyMaterial === 'Monel 400',
      cga_ul_chlorine_certs: g.cgaUlChlorineCerts,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `${g.subType.toLowerCase()} coupling`.slice(0, 120),
  }
}

const PRODUCTS: Input[] = [
  {
    sku: 'IH-MH-THORBURN-TS25-SIGHT-FLOW',
    title: 'Thorburn TS25 Thor-Sight Sight-Flow Indicator',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Inline sight-flow indicator with rotating wheel',
    oemPartCode: 'TS25',
    bodyMaterial: '316L SS',
    endFittingMaterial: 'ANSI 150# RF flanged ends with Ryton indicator wheel',
    nominalIdRange: 'DN 25 (1") to DN 100 (4")',
    maxWorkingPressureBar: 14,
    minBurstPressureBar: 56,
    tempMinC: -40, tempMaxC: 200,
    asmeCompliance: 'ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn TS25 Thor-Sight inline sight-flow indicator with rotating Ryton wheel. ANSI 150# RF flanged. Visual confirmation of fluid flow direction and rate.',
    applications: ['Tanker truck loading flow verification', 'Process plant utility flow', 'Pump-discharge flow indication', 'Custom batch-loading verification'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-MH-THORBURN-T92H-DRY-BREAK',
    title: 'Thorburn T92H Dry-Break Quick Coupling',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Self-sealing dry-break quick coupling (no spillage on disconnect)',
    oemPartCode: 'T92H',
    bodyMaterial: '316L SS',
    endFittingMaterial: 'ANSI 150# / 300# / 600# RF flanged or DIN PN10-PN40; 14 end-style options',
    nominalIdRange: 'DN 25 (1") to DN 150 (6")',
    maxWorkingPressureBar: 70,
    minBurstPressureBar: 280,
    tempMinC: -40, tempMaxC: 200,
    asmeCompliance: 'ASME B31.3',
    cgaUlChlorineCerts: 'API 6FA fire-test option available',
    oneLiner: 'Thorburn T92H dry-break quick coupling with integrated check valves. Self-sealing on disconnect — no fluid spillage. 14 end-connection options. Hazardous fluid transfer.',
    applications: ['Hazardous chemical transfer (no spillage)', 'Tanker truck top-loading systems', 'Aviation fuel ground service', 'Hot-tap maintenance disconnects'],
    leadTimeDays: 49,
  },
  {
    sku: 'IH-MH-THORBURN-T52-CRYO-LIQUID',
    title: 'Thorburn T52 Non-Valved Cryogenic Coupling — Liquid Phase',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Non-valved cryogenic coupling for liquid-phase transfer',
    oemPartCode: 'T52-LIQUID',
    bodyMaterial: '316L SS',
    endFittingMaterial: 'CGA-295 LIN / CGA-440 LOX / CGA-580 Ar / customer-specified',
    nominalIdRange: 'DN 13 (1/2") to DN 100 (4")',
    maxWorkingPressureBar: 35,
    minBurstPressureBar: 140,
    tempMinC: -200, tempMaxC: 60,
    asmeCompliance: 'ASME B31.3, EN 13648-1',
    cgaUlChlorineCerts: 'CGA-8.1-M86, EN 13648-1',
    oneLiner: 'Thorburn T52 non-valved cryogenic coupling for liquid-phase transfer (LIN, LOX, LAR, LNG). Full-flow design — no internal valve. Bayonet-style engagement with PEEK back-up seals.',
    applications: ['Cryogenic truck-to-tank liquid transfer', 'Industrial gas plant LOX / LIN distribution', 'LNG bunkering operations', 'Cryogenic dewar filling'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-THORBURN-T52-CRYO-VAPOR',
    title: 'Thorburn T52 Non-Valved Cryogenic Coupling — Vapor Return',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Non-valved cryogenic coupling for vapor-return service',
    oemPartCode: 'T52-VAPOR',
    bodyMaterial: '316L SS',
    endFittingMaterial: 'CGA-295V / CGA-440V vapor-return couplers',
    nominalIdRange: 'DN 13 (1/2") to DN 50 (2")',
    maxWorkingPressureBar: 14,
    minBurstPressureBar: 56,
    tempMinC: -200, tempMaxC: 60,
    asmeCompliance: 'ASME B31.3, EN 13648-1',
    cgaUlChlorineCerts: 'CGA-8.1-M86, EN 13648-1',
    oneLiner: 'Thorburn T52 vapor-return cryogenic coupling — companion to liquid-phase T52 for tank-equalization vapor return. Smaller bore, lower pressure than the liquid variant.',
    applications: ['Cryogenic vapor return (tank pressure equalization)', 'Boil-off gas recovery', 'Tank breathing during liquid transfer', 'Gas-phase return on industrial gas plants'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-THORBURN-MT3TL-METO-SEAL',
    title: 'Thorburn MT3TL Met-O-Seal Tanker Truck Loading Coupling — Lightweight',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Lightweight metal-to-metal seal tanker coupling (carbon steel)',
    oemPartCode: 'MT3TL',
    bodyMaterial: 'Carbon steel A105',
    endFittingMaterial: 'Carbon steel SA105 body, 316SS external sleeve, HNBR backup seals',
    nominalIdRange: 'DN 50 (2") to DN 100 (4")',
    maxWorkingPressureBar: 16,
    minBurstPressureBar: 64,
    tempMinC: -40, tempMaxC: 150,
    asmeCompliance: 'ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn MT3TL Met-O-Seal lightweight tanker-truck loading coupling. Metal-to-metal seal compresses under wing-nut torque. Bayonet engagement. Low-cost workhorse for fleet operations.',
    applications: ['Tanker truck top-loading depots', 'Fuel terminal loading racks', 'Bulk-chemical truck loading', 'Asphalt / heavy-fuel truck loading'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-MH-THORBURN-MTS4-METO-SEAL',
    title: 'Thorburn MTS4 Met-O-Seal Tanker Coupling — Heavy Duty',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Heavy-duty metal-to-metal seal tanker coupling (316SS)',
    oemPartCode: 'MTS4',
    bodyMaterial: '316L SS',
    endFittingMaterial: '316L SS body and external sleeve, FKM backup seals',
    nominalIdRange: 'DN 50 (2") to DN 150 (6")',
    maxWorkingPressureBar: 25,
    minBurstPressureBar: 100,
    tempMinC: -40, tempMaxC: 200,
    asmeCompliance: 'ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn MTS4 Met-O-Seal heavy-duty tanker coupling in 316L SS. Premium corrosion-resistant alternative to the lightweight MT3TL. Higher pressure, higher temperature service.',
    applications: ['Sour-gas tanker loading (NACE compliant)', 'High-pressure chemical loading', 'Premium fleet tanker terminals', 'Marine bunkering operations'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-MH-THORBURN-UO-SMALL',
    title: 'Thorburn UO O-Seal Never-Leak Pipe Union — Small Bore (1/2 in to 2 in)',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'O-ring face-seal pipe union for small-bore service',
    oemPartCode: 'UO-SMALL',
    bodyMaterial: '316L SS',
    endFittingMaterial: '316L SS NPT or sanitary tri-clamp; FKM, EPDM, or PTFE O-ring seal',
    nominalIdRange: 'DN 13 (1/2") to DN 50 (2")',
    maxWorkingPressureBar: 100,
    minBurstPressureBar: 400,
    tempMinC: -73, tempMaxC: 260,
    asmeCompliance: 'ASME B16.11, ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn UO O-Seal "Never-Leak" pipe union, small bore. O-ring face seal compresses under union nut torque — reliable repeated make / break without thread wear. 316L SS body.',
    applications: ['Small-bore process plant disconnects', 'Instrument-line pipe unions', 'Frequent-maintenance piping joints', 'Pharmaceutical sanitary tri-clamp adapters'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-UO-LARGE',
    title: 'Thorburn UO O-Seal Never-Leak Pipe Union — Large Bore (2-1/2 in to 6 in)',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'O-ring face-seal pipe union for large-bore service',
    oemPartCode: 'UO-LARGE',
    bodyMaterial: '316L SS',
    endFittingMaterial: '316L SS ANSI 150# RF flanged or NPT; FKM, EPDM, or PTFE O-ring seal',
    nominalIdRange: 'DN 65 (2-1/2") to DN 150 (6")',
    maxWorkingPressureBar: 50,
    minBurstPressureBar: 200,
    tempMinC: -73, tempMaxC: 260,
    asmeCompliance: 'ASME B16.11, ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn UO O-Seal large-bore pipe union. Same O-ring face-seal design as small-bore variant, scaled for high-flow lines. 316L SS body. Frequent-maintenance large-bore disconnects.',
    applications: ['Large-bore process plant disconnects', 'Pump-station piping joints', 'Tank-farm distribution headers', 'High-flow utility piping'],
    leadTimeDays: 28,
  },
  {
    sku: 'IH-MH-THORBURN-SJ-LP',
    title: 'Thorburn SJ Series Swivel Joint — Low Pressure (up to 35 bar)',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Single-plane swivel joint for low-pressure rotating service',
    oemPartCode: 'SJ-LP',
    bodyMaterial: '316L SS',
    endFittingMaterial: '316L SS ANSI 150# RF flanged ends; PTFE / FKM seals',
    nominalIdRange: 'DN 25 (1") to DN 150 (6")',
    maxWorkingPressureBar: 35,
    minBurstPressureBar: 140,
    tempMinC: -73, tempMaxC: 260,
    asmeCompliance: 'ASME B31.3',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn SJ Series single-plane swivel joint, low-pressure variant. Ball-bearing rotation with PTFE/FKM seals. Continuous rotation under pressure to 35 bar.',
    applications: ['Bottom-loading arm rotation', 'Chemical injection skid pivots', 'Tank-mixer rotating connections', 'Low-pressure rotating equipment'],
    leadTimeDays: 42,
  },
  {
    sku: 'IH-MH-THORBURN-SJ-HP',
    title: 'Thorburn SJ Series Swivel Joint — High Pressure (up to 200 bar)',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'High-pressure swivel joint with hardened bearing race',
    oemPartCode: 'SJ-HP',
    bodyMaterial: '316L SS',
    endFittingMaterial: '316L SS ANSI 600# RF flanged ends; PEEK + FKM tandem seals',
    nominalIdRange: 'DN 25 (1") to DN 100 (4")',
    maxWorkingPressureBar: 200,
    minBurstPressureBar: 800,
    tempMinC: -73, tempMaxC: 260,
    asmeCompliance: 'ASME B31.3, Section VIII Div 1',
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn SJ Series HP swivel joint with hardened bearing race and PEEK + FKM tandem seals. Working pressure to 200 bar. ANSI 600# RF flanges. HP rotating service.',
    applications: ['HP loading arm rotation (oil terminal)', 'HP chemical injection systems', 'HP rotating manifold blocks', 'Pressure-pumping iron rotating connections'],
    leadTimeDays: 56,
  },
]

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-metallic-hoses-4-couplings',
    description:
      'Metallic Hoses Batch 4 (FINAL) — 10 specialty couplings in new metallic-hose-couplings sub-category. TS25 sight-flow, T92H dry-break, T52 cryogenic (liquid + vapor), MT3TL/MTS4 Met-O-Seal, UO O-Seal pipe unions (small + large), SJ swivel joints (LP + HP). All Thorburn Flex.',
  },
  brands: [],
  categories: CATEGORIES,
  specTemplates: [],
  products: PRODUCTS.map(makeProduct),
}

export default batch
