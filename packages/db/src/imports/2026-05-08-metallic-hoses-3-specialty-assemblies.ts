/**
 * Metallic Hoses — Batch 3 (Special-Purpose Assemblies) — 2026-05-08
 *
 * 20 engineered specialty assemblies in metallic-specialty-assemblies:
 *   - Cryogenic CO2: 2
 *   - Cryogenic N2/O2/Ar liquid transfer: 3
 *   - Cryogenic LNG unloading: 2
 *   - TSJ Steam-Jacketed (double-containment): 3
 *   - Sure-Temp Electrically-Heated: 2
 *   - ThermaCover removable insulation: 2
 *   - M96ZC Monel Chlorine Transfer: 2
 *   - CGA96 / UL96 industrial gas: 2
 *   - Thor-Loop pipe loops: 2
 *
 * Brand split: Thorburn Flex 16, Witzenmann 1, Senior Flexonics 2, Hose Master 1.
 */
import type { FaqEntry, ImportBatch, ProductImportPayload } from '../import/types'

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

type Input = {
  sku: string
  title: string
  brandSlug: string
  countryOfOrigin: string
  subType: string
  hoseFamily: 'Cryogenic Assembly' | 'Steam-Jacketed Assembly' | 'Electrically-Heated Assembly' | 'Industrial Gas Assembly' | 'Chlorine Transfer Assembly' | 'Pipe Loop / Expansion Joint' | 'Other'
  constructionType: 'Annular Corrugated' | 'Helical Corrugated' | 'Smooth-Bore'
  oemPartCode: string
  braidConfiguration: 'Unbraided' | 'Single Braid' | 'Double Braid' | 'N/A'
  coreMaterial: 'Type 304 SS' | 'Type 316L SS' | 'Type 321 SS' | 'Monel 400' | 'Other'
  braidMaterial: 'Type 304 SS' | 'Type 316L SS' | 'Type 316 SS' | 'Inconel' | 'Monel' | 'N/A (Unbraided)'
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
  iso10380Class: 'PSL 1' | 'PSL 2' | 'PSL 3' | 'N/A'
  pedModule: string
  asmeCompliance: string
  naceMr0175: boolean
  cgaUlChlorineCerts: string
  oneLiner: string
  applications: string[]
  leadTimeDays: number
}

function buildHtml(g: Input): string {
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const tempRange = `${g.tempMinC}°C to +${g.tempMaxC}°C`
  const naceLine = g.naceMr0175 ? '<li>NACE MR0175 / ISO 15156 (sour-service compliant)</li>' : ''
  const cgaLine = g.cgaUlChlorineCerts && g.cgaUlChlorineCerts !== 'N/A' && g.cgaUlChlorineCerts !== ''
    ? `<li>${escape(g.cgaUlChlorineCerts)}</li>` : ''

  const familyIntro = (() => {
    switch (g.hoseFamily) {
      case 'Cryogenic Assembly':
        return `Cryogenic-rated hose assembly for liquefied gas transfer. Vacuum-insulated outer jacket maintains low boil-off and prevents external icing. Inner core ${escape(g.coreMaterial)}; matched-alloy braid for full liquid-immersion service.`
      case 'Steam-Jacketed Assembly':
        return `Steam-jacketed (double containment) assembly. Inner process hose inside an outer steam carrier — heat-traces viscous or temperature-sensitive process fluids. Maintains process temperature without external heat tracing.`
      case 'Electrically-Heated Assembly':
        return `Sure-Temp electrically-heated metallic hose assembly. Integrated heating element with thermostat control maintains process temperature on small-bore lines without steam. Programmable setpoint.`
      case 'Industrial Gas Assembly':
        return `Industrial gas transfer assembly per CGA / UL standards. Cleaned and capped for oxygen, argon, nitrogen, or carbon dioxide service. Built to industry specifications with full traceability.`
      case 'Chlorine Transfer Assembly':
        return `Monel 400 chlorine-transfer assembly per Chlorine Institute Pamphlet 6 and Specification 135-3. The only NS-approved metallic hose for liquid chlorine rail and tanker-truck loading. Fully degreased and capped for chlorine service.`
      case 'Pipe Loop / Expansion Joint':
        return `Thor-Loop flexible pipe loop. Replaces traditional metal expansion joints with a longer-life metallic-hose-based motion absorber. Accommodates axial, lateral, and angular pipe motion without bellows fatigue.`
      default:
        return `Engineered specialty metallic hose assembly. ${escape(g.subType)}.`
    }
  })()

  return `<p>The <strong>${escape(g.title)}</strong> is an engineered specialty assembly. ${familyIntro}</p>
<h3>Construction</h3>
<ul>
<li>Type: ${escape(g.hoseFamily)} — ${escape(g.subType)}</li>
<li>Inner core: ${escape(g.coreMaterial)}</li>
${g.braidConfiguration !== 'N/A' ? `<li>Braid: ${escape(g.braidConfiguration)} — ${escape(g.braidMaterial)}</li>` : ''}
<li>End fitting: ${escape(g.endFittingMaterial)}</li>
<li>Nominal ID range: ${escape(g.nominalIdRange)}</li>
${g.bendRadiusStaticMm > 0 ? `<li>Bend radius (static): ${g.bendRadiusStaticMm} mm minimum</li>` : ''}
</ul>
<h3>Performance</h3>
<p>${g.maxWorkingPressureBar > 0 ? `Working pressure ${g.maxWorkingPressureBar} bar.` : 'Pressure-rated per the host hose / process line.'} Operating temperature ${escape(tempRange)} continuous. ${g.hoseFamily === 'Cryogenic Assembly' ? 'Vacuum-insulated outer jacket — typical boil-off 1-3% per day on standard cryogenic-temperature service.' : g.hoseFamily === 'Electrically-Heated Assembly' ? 'Heating element rated for continuous service at the design setpoint with programmable thermostat control.' : g.hoseFamily === 'Steam-Jacketed Assembly' ? 'Steam jacket sized to maintain process temperature within the design tolerance.' : 'All assemblies hydrotested and pressure-certified per applicable specifications.'}</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Compliance</h3>
<ul>
${g.iso10380Class !== 'N/A' ? `<li>ISO 10380:2012 ${escape(g.iso10380Class)}</li>` : ''}
${g.pedModule !== 'None' ? `<li>Pressure Equipment Directive 2014/68/EU ${escape(g.pedModule)}</li>` : ''}
${g.asmeCompliance ? `<li>${escape(g.asmeCompliance)}</li>` : ''}
${naceLine}
${cgaLine}
<li>EN 10204 3.1 / 3.2 mill test reports on request</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) process medium, (b) operating pressure / temperature envelope, (c) end fitting style and matching alloy, (d) overall length, (e) any specific certifications (CGA, UL, Chlorine Institute, NACE). For cryogenic and steam-jacketed assemblies, also specify the host system interface (vacuum-jacket connection, steam supply pressure, condensate return). Indus quotes ex-OEM with full traceability documentation and pressure-test certificates.</p>
<h3>Companion products</h3>
<p>Specialty assemblies typically integrate with matched-alloy expansion joints, instrumentation tap-offs, and pressure-relief valves. Indus also supplies complete turnkey skids — cryogenic loading, steam-jacket headers, electric-heat control panels, and chlorine-transfer carts — built around these specialty assemblies.</p>`
}

function buildFaqs(g: Input): FaqEntry[] {
  return [
    { q: 'What is this assembly used for?', a: `${g.oneLiner} Specific applications: ${g.applications.slice(0, 3).join('; ')}.` },
    {
      q: 'What is the operating temperature range?',
      a: `${g.tempMinC}°C to +${g.tempMaxC}°C continuous. ${g.hoseFamily === 'Cryogenic Assembly' ? 'Cryogenic service requires careful pre-cooldown and warm-up procedures — refer to the OEM commissioning manual.' : g.hoseFamily === 'Steam-Jacketed Assembly' ? 'The steam jacket maintains the process at the desired set temperature; choose steam supply pressure to match.' : ''}`,
    },
    {
      q: 'What standards / certifications does this meet?',
      a: `${g.iso10380Class !== 'N/A' ? `ISO 10380:2012 ${g.iso10380Class}.` : ''} ${g.pedModule !== 'None' ? `PED 2014/68/EU ${g.pedModule}.` : ''} ${g.asmeCompliance}. ${g.naceMr0175 ? 'NACE MR0175 / ISO 15156.' : ''} ${g.cgaUlChlorineCerts}. EN 10204 3.1 / 3.2 mill test reports.`,
    },
    {
      q: 'What end fittings are used?',
      a: `${g.endFittingMaterial}. End-fitting alloy is typically matched to the inner core for severe service. For cryogenic assemblies, vacuum-jacketed bayonet or threaded couplers are standard; for steam-jacketed assemblies, the inner and outer hoses are sealed at independent flanged ports.`,
    },
    {
      q: g.hoseFamily === 'Cryogenic Assembly' ? 'How is the cryogenic insulation maintained?' : g.hoseFamily === 'Steam-Jacketed Assembly' ? 'How does the steam-jacket integrate with my system?' : g.hoseFamily === 'Chlorine Transfer Assembly' ? 'Why Monel 400 for chlorine?' : g.hoseFamily === 'Electrically-Heated Assembly' ? 'How does the electric heat tracing work?' : 'How does this assembly integrate with my system?',
      a: g.hoseFamily === 'Cryogenic Assembly'
        ? 'The vacuum-jacketed outer hose maintains insulation against ambient heat ingress. A super-insulator (typically multi-layer aluminized mylar) wraps the inner process hose; the outer jacket is evacuated to <10⁻⁵ torr. Re-evacuation is recommended every 18-24 months to maintain rated boil-off performance.'
        : g.hoseFamily === 'Steam-Jacketed Assembly'
          ? 'The outer steam carrier connects to your steam header at one end and condensate return at the other. The inner process hose has its own independent inlet and outlet flanges. Steam supply pressure is sized to match the desired process temperature — typically 50-150 psi steam for asphalt / pitch service at 200-300°F process temperature.'
          : g.hoseFamily === 'Chlorine Transfer Assembly'
            ? 'Monel 400 (UNS N04400) is the only metallic alloy approved by the Chlorine Institute (Pamphlet 6 + Specification 135-3) for liquid chlorine transfer. Carbon steel and stainless steel both fail rapidly in dry / wet chlorine due to galvanic and chloride-cell corrosion. Monel\'s nickel-copper composition is uniquely passive in chlorine environments.'
            : g.hoseFamily === 'Electrically-Heated Assembly'
              ? 'The Sure-Temp heating element is integrated within the hose construction (typically a self-regulating heating cable wrapped around the inner core, beneath an insulating jacket). A thermostat senses process temperature and modulates power to maintain setpoint. Power supply: 110-240 VAC, with optional explosion-proof / hazardous-area variants.'
              : 'Confirm the host system interface on the RFQ — Indus matches the assembly fittings to your installation.',
    },
    {
      q: 'What is the lead time?',
      a: `Typical lead time ${g.leadTimeDays} working days ex-OEM. Specialty assemblies are typically build-to-order — confirm OEM build slot at quote stage. Cryogenic assemblies require vacuum-jacket evacuation testing (24-48 hours); steam-jacketed assemblies require leak testing on both inner and outer hoses; chlorine-transfer assemblies require degreasing and Chlorine-Institute certification.`,
    },
    {
      q: 'What is the typical service life and maintenance schedule?',
      a: `${g.hoseFamily === 'Cryogenic Assembly' ? 'Vacuum-jacketed cryogenic assemblies: 5-10 year service life with re-evacuation every 18-24 months. Replace inner gasket and outer pump-out valve at each re-evacuation.' : g.hoseFamily === 'Steam-Jacketed Assembly' ? 'Steam-jacketed assemblies: 5-7 year service life. Annual inspection of inner-hose integrity (pressure-test from process side) and steam-trap function. Replace inner-hose if pressure-test failure.' : g.hoseFamily === 'Chlorine Transfer Assembly' ? 'Chlorine-rated assemblies: 3-5 year service life depending on duty cycle. Required: annual hydrotest, chlorine-institute re-certification every 24 months. Replace at any sign of pitting or surface degradation.' : g.hoseFamily === 'Electrically-Heated Assembly' ? 'Electrically-heated assemblies: 7-10 year service life. Annual electrical safety / megger test on the heating element; replace thermostat if drift > 5°C from setpoint.' : 'Service life depends on duty cycle and process exposure. Annual inspection recommended.'}`,
    },
    {
      q: 'Can this be supplied as part of a complete skid / cart?',
      a: 'Yes — Indus supplies complete turnkey skids and carts integrating these assemblies with matched valves, instrumentation, control panels, and structural framing. Specify the duty (e.g., chlorine rail-loading cart, asphalt steam-jacket header, cryogenic LNG unloading cart) on the RFQ for a complete proposal.',
    },
  ]
}

function makeProduct(g: Input): ProductImportPayload {
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: g.brandSlug,
    categorySlug: 'metallic-specialty-assemblies',
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
    focusKeyword: `${g.hoseFamily.toLowerCase()} metallic hose assembly`.slice(0, 120),
  }
}

const PRODUCTS: Input[] = [
  // ── Cryogenic CO2 (2) ──────────────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-CRYO-CO2-DEWAR',
    title: 'Thorburn Cryogenic CO₂ Connector — Dewar Transfer',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Vacuum-jacketed CO₂ dewar transfer hose',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CRYO-CO2-DEWAR', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'CGA-320 dewar coupler (one end) and 316L SS NPT (other end)',
    nominalIdRange: 'DN 13 (1/2") to DN 25 (1")',
    bendRadiusStaticMm: 200, bendRadiusDynamicMm: 600, liveLengthForVibrationMm: 200, weightKgPerM: 1.2,
    maxWorkingPressureBar: 50, minBurstPressureBar: 200, safetyFactor: 4,
    tempMinC: -78, tempMaxC: 60,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section IX', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-320, UL536',
    oneLiner: 'Thorburn vacuum-jacketed cryogenic CO₂ dewar transfer connector. Insulated stainless inner core with bayonet dewar coupler. Beverage / industrial CO₂ filling.',
    applications: ['Beverage industry CO₂ dewar filling', 'Industrial CO₂ supply', 'Laboratory dry-ice production', 'Cryogenic CO₂ tank-to-tank transfer'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-THORBURN-CRYO-CO2-PROCESS',
    title: 'Thorburn Cryogenic CO₂ Connector — Process Plant',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Vacuum-jacketed CO₂ process plant transfer',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CRYO-CO2-PROC', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 150# RF flanged with vacuum-jacket bayonet coupler',
    nominalIdRange: 'DN 25 (1") to DN 100 (4")',
    bendRadiusStaticMm: 300, bendRadiusDynamicMm: 750, liveLengthForVibrationMm: 200, weightKgPerM: 2.5,
    maxWorkingPressureBar: 100, minBurstPressureBar: 400, safetyFactor: 4,
    tempMinC: -78, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-320',
    oneLiner: 'Thorburn vacuum-jacketed cryogenic CO₂ process-plant transfer hose. ANSI 150# RF flanged with vacuum-jacket bayonet. DN 25 to DN 100, 100 bar.',
    applications: ['Industrial CO₂ process plants', 'EOR CO₂ injection systems', 'Cryogenic CO₂ rail-loading', 'Beverage-plant bulk CO₂ supply'],
    leadTimeDays: 70,
  },
  // ── Cryogenic N2 / O2 / Ar (3) ──────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-CRYO-LIN',
    title: 'Thorburn Cryogenic Liquid Nitrogen (LIN) Transfer Hose',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Vacuum-jacketed LIN transfer assembly',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CRYO-LIN', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 316L SS',
    endFittingMaterial: 'CGA-295 LIN coupler / ANSI 150# RF flange (selectable)',
    nominalIdRange: 'DN 13 (1/2") to DN 100 (4")',
    bendRadiusStaticMm: 250, bendRadiusDynamicMm: 700, liveLengthForVibrationMm: 200, weightKgPerM: 2.2,
    maxWorkingPressureBar: 35, minBurstPressureBar: 140, safetyFactor: 4,
    tempMinC: -196, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-8.1-M86, CGA-295',
    oneLiner: 'Thorburn vacuum-jacketed liquid nitrogen (LIN, -196°C) transfer hose. CGA-295 coupler standard. DN 13 to DN 100. Industrial gas plant and food-freezing service.',
    applications: ['Industrial gas plant LIN distribution', 'Food-freezing tunnel LIN supply', 'Cryogenic shrink-fit operations', 'Laboratory LIN dewar transfer'],
    leadTimeDays: 70,
  },
  {
    sku: 'IH-MH-THORBURN-CRYO-LOX',
    title: 'Thorburn Cryogenic Liquid Oxygen (LOX) Transfer Hose',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Vacuum-jacketed LOX transfer assembly (degreased / capped for O₂ service)',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CRYO-LOX', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 316L SS',
    endFittingMaterial: 'CGA-440 LOX coupler / ANSI 150# RF flange (degreased per CGA G-4.1)',
    nominalIdRange: 'DN 13 (1/2") to DN 100 (4")',
    bendRadiusStaticMm: 250, bendRadiusDynamicMm: 700, liveLengthForVibrationMm: 200, weightKgPerM: 2.2,
    maxWorkingPressureBar: 35, minBurstPressureBar: 140, safetyFactor: 4,
    tempMinC: -183, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-440, CGA G-4.1 (cleaning), UL536',
    oneLiner: 'Thorburn vacuum-jacketed liquid oxygen (LOX, -183°C) transfer hose. Degreased and capped for O₂ service per CGA G-4.1. Hospital, gas plant, and rocketry-grade service.',
    applications: ['Hospital LOX bulk supply', 'Industrial gas plant LOX distribution', 'Rocketry / aerospace LOX transfer', 'Steel-mill cutting LOX supply'],
    leadTimeDays: 70,
  },
  {
    sku: 'IH-MH-WITZENMANN-CRYO-LAR',
    title: 'Witzenmann Cryogenic Liquid Argon (LAR) Transfer Hose',
    brandSlug: 'witzenmann', countryOfOrigin: 'Germany',
    subType: 'Vacuum-jacketed LAR transfer assembly',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'WX-CRYO-LAR', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 316L SS',
    endFittingMaterial: 'DIN 1.4571 / 316Ti SS flanged with EN 13648-1 cryogenic coupler',
    nominalIdRange: 'DN 13 (1/2") to DN 100 (4")',
    bendRadiusStaticMm: 280, bendRadiusDynamicMm: 750, liveLengthForVibrationMm: 200, weightKgPerM: 2.3,
    maxWorkingPressureBar: 30, minBurstPressureBar: 120, safetyFactor: 4,
    tempMinC: -186, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'EN 13480 / ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'EN 13648-1, TÜV / CE marking',
    oneLiner: 'Witzenmann vacuum-jacketed liquid argon (LAR, -186°C) transfer hose. German-engineered with EN 13648-1 cryogenic coupler. Welding, semiconductor, and inert-gas service.',
    applications: ['Welding gas LAR distribution', 'Semiconductor / fab inert gas', 'Industrial LAR rail-loading', 'Stainless-steel processing inert blanket'],
    leadTimeDays: 84,
  },
  // ── Cryogenic LNG Unloading (2) ─────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-CRYO-LNG-UNLOAD',
    title: 'Thorburn Cryogenic LNG Unloading Hose',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Vacuum-jacketed LNG truck-unloading assembly',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CRYO-LNG-UL', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 316L SS',
    endFittingMaterial: 'ANSI 150# RF flanged (truck and tank end), with vacuum-jacket bayonet',
    nominalIdRange: 'DN 50 (2") to DN 200 (8")',
    bendRadiusStaticMm: 600, bendRadiusDynamicMm: 1500, liveLengthForVibrationMm: 300, weightKgPerM: 5.5,
    maxWorkingPressureBar: 30, minBurstPressureBar: 120, safetyFactor: 4,
    tempMinC: -162, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1, EN 13480', naceMr0175: false,
    cgaUlChlorineCerts: 'EN 13648-1, CSA B51',
    oneLiner: 'Thorburn vacuum-jacketed LNG truck-unloading hose. DN 50 to DN 200, -162°C. Vapor-tight bayonet coupler with ANSI 150# RF flanges. Cryogenic truck-to-tank transfer.',
    applications: ['LNG truck unloading at receiving terminal', 'LNG bunkering operations', 'Cryogenic peak-shaving station supply', 'LNG rail-tanker unloading'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-MH-SENIOR-FLEX-CRYO-LNG',
    title: 'Senior Flexonics Cryogenic LNG Marine Transfer Hose',
    brandSlug: 'senior-flexonics', countryOfOrigin: 'United Kingdom',
    subType: 'Marine-grade vacuum-jacketed LNG bunkering hose',
    hoseFamily: 'Cryogenic Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'PATHWAY-LNG-MARINE', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 316L SS',
    endFittingMaterial: 'ANSI 300# RF flanged with marine-grade vacuum-jacket coupler',
    nominalIdRange: 'DN 100 (4") to DN 250 (10")',
    bendRadiusStaticMm: 800, bendRadiusDynamicMm: 2000, liveLengthForVibrationMm: 400, weightKgPerM: 8.0,
    maxWorkingPressureBar: 50, minBurstPressureBar: 200, safetyFactor: 4,
    tempMinC: -162, tempMaxC: 60,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'EN 13480, ASME B31.3, Section VIII Div 1, IGC Code', naceMr0175: false,
    cgaUlChlorineCerts: 'EN 13648-1, IGC Code, BV / DNV / Lloyds (selectable)',
    oneLiner: 'Senior Flexonics marine-grade vacuum-jacketed LNG bunkering hose. ANSI 300# RF, IGC Code compliant. DN 100 to DN 250 for ship-to-ship LNG transfer.',
    applications: ['LNG bunkering (ship-to-ship)', 'Cruise-ship LNG fueling stations', 'LNG carrier offloading', 'Marine LNG distribution'],
    leadTimeDays: 112,
  },
  // ── TSJ Steam-Jacketed (3) ──────────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-TSJ-2IN-ASPHALT',
    title: 'Thorburn TSJ Steam-Jacketed Hose, 2 in — Asphalt / Pitch Service',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Steam-jacketed double-containment for asphalt / pitch transfer',
    hoseFamily: 'Steam-Jacketed Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'TSJ-2-ASPHALT', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 300# RF flanged inner; ANSI 150# RF flanged steam jacket',
    nominalIdRange: 'DN 50 (2") inner, DN 80 (3") outer',
    bendRadiusStaticMm: 400, bendRadiusDynamicMm: 1000, liveLengthForVibrationMm: 250, weightKgPerM: 3.5,
    maxWorkingPressureBar: 25, minBurstPressureBar: 100, safetyFactor: 4,
    tempMinC: -50, tempMaxC: 230,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1 (steam), B31.3 (process)', naceMr0175: false,
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn TSJ steam-jacketed hose, 2 in inner × 3 in outer. Maintains asphalt / pitch / sulphur viscosity at 200-230°C process via integrated steam carrier.',
    applications: ['Asphalt loading / unloading (rail / truck)', 'Pitch transfer in coke plants', 'Sulphur transfer (molten)', 'Heavy-fuel-oil transfer'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-THORBURN-TSJ-3IN-MOLTEN',
    title: 'Thorburn TSJ Steam-Jacketed Hose, 3 in — Molten Service',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Steam-jacketed double-containment for molten-product transfer',
    hoseFamily: 'Steam-Jacketed Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'TSJ-3-MOLTEN', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 300# RF flanged inner / ANSI 150# RF flanged outer',
    nominalIdRange: 'DN 75 (3") inner, DN 125 (5") outer',
    bendRadiusStaticMm: 500, bendRadiusDynamicMm: 1200, liveLengthForVibrationMm: 300, weightKgPerM: 5.0,
    maxWorkingPressureBar: 25, minBurstPressureBar: 100, safetyFactor: 4,
    tempMinC: -50, tempMaxC: 250,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1 (steam), B31.3 (process)', naceMr0175: false,
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn TSJ-3 steam-jacketed hose for high-flow molten transfer. 3 in × 5 in. Molten polymer / chocolate / wax / petroleum-derivative service to 250°C.',
    applications: ['Polymer / plastic molten transfer', 'Chocolate / food-grade molten transfer', 'Wax and petroleum-derivative transfer', 'Specialty chemical molten lines'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-SENIOR-FLEX-TSJ-CHEMICAL',
    title: 'Senior Flexonics Steam-Jacketed Chemical Process Hose',
    brandSlug: 'senior-flexonics', countryOfOrigin: 'United Kingdom',
    subType: 'Steam-jacketed double-containment for chemical process',
    hoseFamily: 'Steam-Jacketed Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'PATHWAY-TSJ-CHEMICAL', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'EN 1092-1 PN16 flanged inner / PN10 flanged outer',
    nominalIdRange: 'DN 25 (1") to DN 100 (4") inner; outer +25mm',
    bendRadiusStaticMm: 350, bendRadiusDynamicMm: 800, liveLengthForVibrationMm: 250, weightKgPerM: 3.0,
    maxWorkingPressureBar: 16, minBurstPressureBar: 64, safetyFactor: 4,
    tempMinC: -50, tempMaxC: 200,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'EN 13480, ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'TÜV / CE marking',
    oneLiner: 'Senior Flexonics steam-jacketed chemical-process hose. EN 1092-1 PN16 flanges. European-engineered for chemical-plant temperature-sensitive transfer.',
    applications: ['European chemical-plant temperature-controlled transfer', 'Pharmaceutical / cosmetic warm-process lines', 'Resin / specialty-chemical transfer', 'Plant-utility steam-traced lines'],
    leadTimeDays: 70,
  },
  // ── Sure-Temp Electrically-Heated (2) ───────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-SURETEMP-1IN',
    title: 'Thorburn Sure-Temp Electrically-Heated Metallic Hose, 1 in',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Electrically-heated metallic hose with thermostat control',
    hoseFamily: 'Electrically-Heated Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'SURETEMP-1', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: '316L SS NPT or sanitary tri-clamp; integrated 110/240 VAC power lead',
    nominalIdRange: 'DN 25 (1")',
    bendRadiusStaticMm: 100, bendRadiusDynamicMm: 300, liveLengthForVibrationMm: 150, weightKgPerM: 1.8,
    maxWorkingPressureBar: 30, minBurstPressureBar: 120, safetyFactor: 4,
    tempMinC: 0, tempMaxC: 200,
    iso10380Class: 'PSL 1', pedModule: 'Module A',
    asmeCompliance: 'ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'UL536 (electrical)',
    oneLiner: 'Thorburn Sure-Temp electrically-heated 1 in metallic hose with integrated heating element and thermostat. Maintains process at programmable setpoint without steam.',
    applications: ['Small-bore steam-trace replacement', 'Lab / pilot-plant process lines', 'Adhesive / sealant transfer (warm-flow)', 'Honey / syrup beverage transfer'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-THORBURN-SURETEMP-EX-2IN',
    title: 'Thorburn Sure-Temp Hazardous-Area Electrically-Heated Hose, 2 in (Ex-rated)',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Hazardous-area electrically-heated metallic hose (ATEX/IECEx Zone 1)',
    hoseFamily: 'Electrically-Heated Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'SURETEMP-EX-2', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 150# RF flanged; ATEX/IECEx-rated electrical entry',
    nominalIdRange: 'DN 50 (2")',
    bendRadiusStaticMm: 200, bendRadiusDynamicMm: 500, liveLengthForVibrationMm: 200, weightKgPerM: 3.0,
    maxWorkingPressureBar: 25, minBurstPressureBar: 100, safetyFactor: 4,
    tempMinC: 0, tempMaxC: 200,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'UL536, ATEX II 2 G Ex db IIB+H₂ T3, IECEx Zone 1',
    oneLiner: 'Thorburn Sure-Temp Ex-rated 2 in electrically-heated hose. ATEX / IECEx Zone 1 hazardous-area certified. For oilfield, refinery, and petrochemical hazardous-zone process.',
    applications: ['Hazardous-area hydrocarbon transfer', 'Refinery temperature-controlled lines', 'Oilfield hazardous-zone process', 'Petrochemical Zone 1 service'],
    leadTimeDays: 84,
  },
  // ── ThermaCover Insulation (2) ──────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-THERMACOVER-STD',
    title: 'Thorburn ThermaCover Removable Thermal Insulation Cover',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Removable thermal insulation blanket (mineral-wool with silicone outer)',
    hoseFamily: 'Other', constructionType: 'Smooth-Bore',
    oemPartCode: 'THERMACOVER-STD', braidConfiguration: 'N/A',
    coreMaterial: 'Other', braidMaterial: 'N/A (Unbraided)',
    endFittingMaterial: 'Velcro / D-ring closure; no rigid fittings',
    nominalIdRange: 'Fits DN 25 (1") to DN 200 (8") host hoses',
    bendRadiusStaticMm: 0, bendRadiusDynamicMm: 0, liveLengthForVibrationMm: 0, weightKgPerM: 1.5,
    maxWorkingPressureBar: 0, minBurstPressureBar: 0, safetyFactor: 0,
    tempMinC: -40, tempMaxC: 540,
    iso10380Class: 'N/A', pedModule: 'None',
    asmeCompliance: '', naceMr0175: false,
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn ThermaCover removable thermal insulation cover. Mineral-wool insulation with silicone-impregnated fiberglass outer. Cleanable, repeatable installation. -40°C to +540°C.',
    applications: ['Heat-loss prevention on metallic hoses', 'Personnel protection from hot surfaces', 'Energy efficiency / process insulation', 'Steam-trace assembly insulation'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-MH-THORBURN-THERMACOVER-CRYO',
    title: 'Thorburn ThermaCover Cryogenic Insulation Cover',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Cryogenic-rated thermal insulation cover (aerogel core, multi-layer)',
    hoseFamily: 'Other', constructionType: 'Smooth-Bore',
    oemPartCode: 'THERMACOVER-CRYO', braidConfiguration: 'N/A',
    coreMaterial: 'Other', braidMaterial: 'N/A (Unbraided)',
    endFittingMaterial: 'Velcro closure; multi-layer reflective wrap',
    nominalIdRange: 'Fits DN 25 (1") to DN 200 (8") host hoses',
    bendRadiusStaticMm: 0, bendRadiusDynamicMm: 0, liveLengthForVibrationMm: 0, weightKgPerM: 1.0,
    maxWorkingPressureBar: 0, minBurstPressureBar: 0, safetyFactor: 0,
    tempMinC: -200, tempMaxC: 100,
    iso10380Class: 'N/A', pedModule: 'None',
    asmeCompliance: '', naceMr0175: false,
    cgaUlChlorineCerts: '',
    oneLiner: 'Thorburn ThermaCover cryogenic-rated insulation cover. Aerogel core with multi-layer reflective wrap. Reduces external icing and boil-off on cryogenic hoses to -200°C.',
    applications: ['Cryogenic hose external insulation', 'Reduce LIN/LOX/LAR boil-off', 'Prevent external moisture condensation / icing', 'Personnel protection on cryogenic lines'],
    leadTimeDays: 28,
  },
  // ── M96ZC Monel Chlorine (2) ────────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-M96ZC-RAIL',
    title: 'Thorburn M96ZC Monel Chlorine Transfer Hose — Rail-Loading',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Monel chlorine transfer hose for rail-tanker loading',
    hoseFamily: 'Chlorine Transfer Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'M96ZC-RAIL', braidConfiguration: 'Double Braid',
    coreMaterial: 'Monel 400', braidMaterial: 'Monel',
    endFittingMaterial: 'Monel 400 ANSI 150# RF flanges; chlorine-grade gaskets and bolting',
    nominalIdRange: 'DN 50 (2") to DN 100 (4")',
    bendRadiusStaticMm: 250, bendRadiusDynamicMm: 700, liveLengthForVibrationMm: 200, weightKgPerM: 4.5,
    maxWorkingPressureBar: 14, minBurstPressureBar: 56, safetyFactor: 4,
    tempMinC: -40, tempMaxC: 100,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'Chlorine Institute Pamphlet 6 + Specification 135-3, CSA B51',
    oneLiner: 'Thorburn M96ZC Monel 400 chlorine-transfer hose for rail-tanker loading. Per Chlorine Institute Pamphlet 6 and Spec 135-3. The industry-standard Cl₂ rail-loading hose.',
    applications: ['Liquid chlorine rail-tanker loading', 'Cl₂ railroad terminal service', 'Chlor-alkali plant rail-fill stations', 'Multi-tank Cl₂ distribution'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-MH-THORBURN-M96ZC-TANKER',
    title: 'Thorburn M96ZC Monel Chlorine Transfer Hose — Tanker Truck',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'Monel chlorine transfer hose for tanker-truck loading',
    hoseFamily: 'Chlorine Transfer Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'M96ZC-TANKER', braidConfiguration: 'Double Braid',
    coreMaterial: 'Monel 400', braidMaterial: 'Monel',
    endFittingMaterial: 'Monel 400 with chlorine-rated truck couplers (Pamphlet 6)',
    nominalIdRange: 'DN 50 (2") to DN 75 (3")',
    bendRadiusStaticMm: 250, bendRadiusDynamicMm: 700, liveLengthForVibrationMm: 200, weightKgPerM: 4.0,
    maxWorkingPressureBar: 14, minBurstPressureBar: 56, safetyFactor: 4,
    tempMinC: -40, tempMaxC: 100,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3', naceMr0175: false,
    cgaUlChlorineCerts: 'Chlorine Institute Pamphlet 6 + Specification 135-3',
    oneLiner: 'Thorburn M96ZC Monel chlorine-transfer hose for tanker-truck loading. Truck-grade couplers per Chlorine Institute Pamphlet 6.',
    applications: ['Liquid chlorine tanker-truck loading', 'Chlor-alkali truck distribution', 'Cl₂ municipal water treatment', 'Industrial chlorine consumer delivery'],
    leadTimeDays: 70,
  },
  // ── CGA96 / UL96 Industrial Gas (2) ──────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-CGA96-O2',
    title: 'Thorburn CGA96 Industrial Oxygen Service Hose',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'CGA96-rated O₂ industrial transfer hose (degreased/capped per CGA G-4.1)',
    hoseFamily: 'Industrial Gas Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'CGA96-O2', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'CGA-540 oxygen coupler; degreased per CGA G-4.1',
    nominalIdRange: 'DN 13 (1/2") to DN 50 (2")',
    bendRadiusStaticMm: 100, bendRadiusDynamicMm: 300, liveLengthForVibrationMm: 150, weightKgPerM: 1.5,
    maxWorkingPressureBar: 200, minBurstPressureBar: 800, safetyFactor: 4,
    tempMinC: -200, tempMaxC: 60,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-8.1-M86, CGA96, CGA G-4.1, UL536',
    oneLiner: 'Thorburn CGA96 industrial oxygen transfer hose. CGA-540 coupler standard. Degreased and capped for O₂ service per CGA G-4.1. Up to 200 bar.',
    applications: ['Industrial oxygen distribution', 'Hospital medical-grade oxygen', 'Steel-mill oxygen-cutting torches', 'Welding shop oxygen supply'],
    leadTimeDays: 56,
  },
  {
    sku: 'IH-MH-HOSE-MASTER-CGA96-AR',
    title: 'Hose Master CGA96 Industrial Argon / Nitrogen Service Hose',
    brandSlug: 'hose-master', countryOfOrigin: 'USA',
    subType: 'CGA96-rated industrial gas hose (Ar / N₂ / CO₂)',
    hoseFamily: 'Industrial Gas Assembly', constructionType: 'Annular Corrugated',
    oemPartCode: 'ANNUFLEX-CGA96', braidConfiguration: 'Single Braid',
    coreMaterial: 'Type 316L SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'CGA-580 / CGA-320 / CGA-540 selectable per service',
    nominalIdRange: 'DN 13 (1/2") to DN 50 (2")',
    bendRadiusStaticMm: 120, bendRadiusDynamicMm: 350, liveLengthForVibrationMm: 150, weightKgPerM: 1.6,
    maxWorkingPressureBar: 200, minBurstPressureBar: 800, safetyFactor: 4,
    tempMinC: -100, tempMaxC: 60,
    iso10380Class: 'PSL 2', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.3, Section VIII Div 1', naceMr0175: false,
    cgaUlChlorineCerts: 'CGA-8.1-M86, CGA96, UL536',
    oneLiner: 'Hose Master CGA96 industrial gas transfer hose for argon, nitrogen, or CO₂. CGA-580 / 320 / 540 couplers selectable. US-market industrial gas standard.',
    applications: ['Welding shop argon / mixed-gas distribution', 'Industrial nitrogen blanketing', 'Beverage CO₂ supply lines', 'Semiconductor process inert gas'],
    leadTimeDays: 42,
  },
  // ── Thor-Loop Pipe Loops (2) ────────────────────────────────────────────
  {
    sku: 'IH-MH-THORBURN-THORLOOP-VLOOP',
    title: 'Thorburn Thor-Loop Series VL "V-Loop" Flexible Pipe Loop',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'V-shaped pipe loop motion absorber (replaces metal expansion joints)',
    hoseFamily: 'Pipe Loop / Expansion Joint', constructionType: 'Annular Corrugated',
    oemPartCode: 'THORLOOP-VL', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 321 SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 150# / 300# / 600# RF flanged ends (selectable)',
    nominalIdRange: 'DN 50 (2") to DN 250 (10")',
    bendRadiusStaticMm: 1000, bendRadiusDynamicMm: 2500, liveLengthForVibrationMm: 1000, weightKgPerM: 6.0,
    maxWorkingPressureBar: 100, minBurstPressureBar: 400, safetyFactor: 4,
    tempMinC: -200, tempMaxC: 650,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section VIII Div 1', naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51',
    oneLiner: 'Thorburn Thor-Loop V-shaped flexible pipe loop. V-form metallic-hose design absorbs axial, lateral, and angular pipe motion. Longer service life than conventional metal expansion joints.',
    applications: ['Steam-line pipe motion (replaces bellows expansion joints)', 'Hot-process plant piping', 'Power-generation steam mains', 'Long-run process piping with thermal expansion'],
    leadTimeDays: 84,
  },
  {
    sku: 'IH-MH-THORBURN-THORLOOP-ULOOP',
    title: 'Thorburn Thor-Loop Series UL "U-Loop" Flexible Pipe Loop',
    brandSlug: 'thorburn-flex', countryOfOrigin: 'Canada',
    subType: 'U-shaped pipe loop motion absorber (compact alternative to V-Loop)',
    hoseFamily: 'Pipe Loop / Expansion Joint', constructionType: 'Annular Corrugated',
    oemPartCode: 'THORLOOP-UL', braidConfiguration: 'Double Braid',
    coreMaterial: 'Type 321 SS', braidMaterial: 'Type 304 SS',
    endFittingMaterial: 'ANSI 150# / 300# / 600# RF flanged ends',
    nominalIdRange: 'DN 50 (2") to DN 200 (8")',
    bendRadiusStaticMm: 800, bendRadiusDynamicMm: 2000, liveLengthForVibrationMm: 800, weightKgPerM: 5.5,
    maxWorkingPressureBar: 100, minBurstPressureBar: 400, safetyFactor: 4,
    tempMinC: -200, tempMaxC: 650,
    iso10380Class: 'PSL 3', pedModule: 'Module H',
    asmeCompliance: 'ASME B31.1, B31.3, Section VIII Div 1', naceMr0175: true,
    cgaUlChlorineCerts: 'CSA B51',
    oneLiner: 'Thorburn Thor-Loop U-shaped flexible pipe loop. Compact alternative to V-Loop for tighter pipe-rack installations. Same motion-absorption capability.',
    applications: ['Compact pipe-rack expansion compensation', 'Indoor process plant piping', 'Refinery / petrochemical pipe-rack', 'Power-generation auxiliary lines'],
    leadTimeDays: 84,
  },
]

const batch: ImportBatch = {
  meta: {
    id: '2026-05-08-metallic-hoses-3-specialty-assemblies',
    description:
      'Metallic Hoses Batch 3 — 20 special-purpose assemblies in metallic-specialty-assemblies: cryogenic CO₂ / N₂ / O₂ / Ar / LNG, steam-jacketed, electrically-heated, thermal insulation, Monel chlorine transfer, CGA96/UL96 industrial gas, Thor-Loop pipe loops. Brand split: Thorburn 16, Witzenmann 1, Senior Flexonics 2, Hose Master 1.',
  },
  brands: [],
  categories: [],
  specTemplates: [],
  products: PRODUCTS.map(makeProduct),
}

export default batch
