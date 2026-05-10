/**
 * Eaton Aeroquip Quick Disconnect Couplings — full catalogue — 2026-05-10
 *
 * Imports all 26 Eaton Aeroquip quick-disconnect coupling series from the
 * E-MEQD-MC001-E2 catalogue as 27 series-level products. Variants by size,
 * body material, seal compound, port thread type and coupling half are
 * captured as available-options spec fields and enumerated in the long
 * description, so a customer searching any specific Eaton part number lands
 * on the right series PDP and specifies the exact configuration in the RFQ.
 *
 * Brand: eaton-aeroquip (existing)
 * Category: quick-couplers (new — under hoses-fittings)
 * Spec template: quick-coupler-spec (new — 19 fields)
 * Megamenu: replaces 4 placeholder customUrl leaves under "Quick Couplers" sub
 *           with a single category leaf.
 *
 * Run:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-aeroquip-quick-couplers.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-10-aeroquip-quick-couplers.ts
 */
import type {
  CategoryPayload,
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
  | 'categorySlug'
  | 'specTemplateSlug'
> = {
  brandSlug: 'eaton-aeroquip',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 14, // imported from USA
  countryOfOrigin: 'USA',
  categorySlug: 'quick-couplers',
  specTemplateSlug: 'quick-coupler-spec',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Per-product input shape ───────────────────────────────────────────────

type ApplicationClass =
  | 'Hydraulic'
  | 'Farm Hydraulic'
  | 'Air'
  | 'Refrigerant'
  | 'Diagnostic'
  | 'Specialty'

type Valving =
  | 'Valved (Self-sealing Poppet)'
  | 'Non-Valved'
  | 'Pusher-Style'
  | 'Flush Face (No-Spill)'
  | 'Bleed Valve'
  | 'Dry Break'
  | 'Thread-to-Connect'
  | 'Sampling Valve'
  | 'Multi-Component Kit'

type ConnectionMethod =
  | 'Push-Pull Ball Latch'
  | 'Push-to-Connect'
  | 'Thread-to-Connect'
  | 'Manual Retract'
  | 'Arc Latch'

type ProductInput = {
  sku: string
  title: string
  series: string
  interchangeStandard: string | null
  applicationClass: ApplicationClass
  valving: Valving
  availableSizes: string
  availableBodyMaterials: string
  availableSealMaterials: string
  availablePortThreads: string
  availableHalves: string
  connectionMethod: ConnectionMethod
  flushFace: boolean
  connectUnderPressure: boolean
  maxOperatingPressureBar: number
  minBurstPressureBar: number
  ratedFlowLpmMax: number
  vacuumRatingInHg: number | null
  tempMinC: number
  tempMaxC: number
  interchangeWith: string
  oneLiner: string
  applications: string[]
  partNumberExamples: string[]
  notableFeatures: string[]
}

// ── HTML description builder ──────────────────────────────────────────────

function buildHtml(g: ProductInput): string {
  const features = g.notableFeatures.map((f) => `<li>${escape(f)}</li>`).join('')
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const partNumbers = g.partNumberExamples
    .map((p) => `<code>${escape(p)}</code>`)
    .join(', ')

  const flushLine = g.flushFace
    ? '<li>Flush-face / no-spill design — minimal fluid loss and air inclusion at disconnect</li>'
    : ''
  const cupLine = g.connectUnderPressure
    ? '<li>Connect-under-pressure capability — couplings can be mated against trapped residual pressure</li>'
    : ''
  const interchangeLine = g.interchangeStandard
    ? `<li>Interchange standard: <strong>${escape(g.interchangeStandard)}</strong></li>`
    : ''
  const interchangeWithLine = g.interchangeWith
    ? `<li>Interchanges with: ${escape(g.interchangeWith)}</li>`
    : ''

  return `<p>The <strong>${escape(g.title)}</strong> is a ${escape(g.applicationClass.toLowerCase())} quick-disconnect coupling from Eaton's Aeroquip range. ${escape(g.oneLiner)}</p>
<p>Working pressure to <strong>${g.maxOperatingPressureBar} bar (${Math.round(g.maxOperatingPressureBar * 14.5038)} psi)</strong> at the smallest body size, with minimum burst pressure of ${g.minBurstPressureBar} bar. ${escape(g.connectionMethod)} connection — ${escape(g.valving.toLowerCase())} variant.</p>
<h3>Construction &amp; features</h3>
<ul>
${interchangeLine}
<li>Connection method: ${escape(g.connectionMethod)}</li>
<li>Valving: ${escape(g.valving)}</li>
${flushLine}
${cupLine}
${features}
${interchangeWithLine}
</ul>
<h3>Available variants — specify in your RFQ</h3>
<p>Indus quotes the full ${escape(g.series)} range; specify the configuration that matches your hose end and operating envelope. The Eaton part-number scheme is <code>${escape(g.series)}-XXXX-AA-BB</code> (series, half/material code, port thread size in 16ths of an inch, nominal coupling size in 16ths of an inch).</p>
<ul>
<li><strong>Coupling halves:</strong> ${escape(g.availableHalves)}</li>
<li><strong>Body sizes:</strong> ${escape(g.availableSizes)}</li>
<li><strong>Body materials:</strong> ${escape(g.availableBodyMaterials)}</li>
<li><strong>Seal materials:</strong> ${escape(g.availableSealMaterials)}</li>
<li><strong>Port thread types:</strong> ${escape(g.availablePortThreads)}</li>
</ul>
<p>Sample part numbers: ${partNumbers}. The full part-number matrix is available on request — Indus will quote any standard configuration in the Eaton catalogue.</p>
<h3>Performance</h3>
<ul>
<li>Maximum operating pressure: ${g.maxOperatingPressureBar} bar (${Math.round(g.maxOperatingPressureBar * 14.5038)} psi) at the smallest size; derates with diameter</li>
<li>Minimum burst pressure: ${g.minBurstPressureBar} bar (${Math.round(g.minBurstPressureBar * 14.5038)} psi)</li>
<li>Rated flow (largest size): up to ${g.ratedFlowLpmMax} L/min</li>
${g.vacuumRatingInHg !== null ? `<li>Vacuum rating: ${g.vacuumRatingInHg} in./Hg</li>` : ''}
<li>Operating temperature range: ${g.tempMinC}°C to +${g.tempMaxC}°C (varies by seal compound; specify in RFQ)</li>
</ul>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>How to order</h3>
<p>Confirm (a) the exact Eaton part number you require, or (b) the configuration parameters: coupling half (male / female / complete set / repair kit / dust cap), body size, port thread type and designation, seal compound, body material. Indus will quote ex-Eaton with full mill certification, NACE / ABS / Lloyd's options on request, and air-freight or sea-freight options to UAE / GCC. Standard lead time 14 days from order; in-stock items ship same week.</p>
<h3>Companion products</h3>
<p>Indus also stocks the matching dust caps, dust plugs, and seal repair kits for this series — ask for them on the same RFQ. For hose assemblies terminated with this coupler, request a complete hose-end assembly quote and we will supply the assembly tested at 1.5× working pressure with witness-test certificate.</p>`
}

// ── FAQ generator ─────────────────────────────────────────────────────────

function buildFaqs(g: ProductInput): FaqEntry[] {
  const faqs: FaqEntry[] = [
    {
      q: `What is the Eaton ${g.series} Series used for?`,
      a: `${g.oneLiner} Typical applications include ${g.applications.slice(0, 3).join('; ')}. The ${g.series} is part of Eaton's Aeroquip catalogue and is widely used across ${g.applicationClass.toLowerCase()} systems.`,
    },
    {
      q: `What is the maximum working pressure?`,
      a: `${g.maxOperatingPressureBar} bar (${Math.round(g.maxOperatingPressureBar * 14.5038)} psi) at the smallest body size, with minimum burst pressure of ${g.minBurstPressureBar} bar (${Math.round(g.minBurstPressureBar * 14.5038)} psi). Pressure derates with body size — see the Eaton datasheet for the per-size pressure curve.`,
    },
    {
      q: `What sizes are available?`,
      a: `${g.availableSizes}. Specify the body size that matches your hose ID in the RFQ — Indus will confirm availability and price for each size.`,
    },
    {
      q: `What seal materials and body materials are available?`,
      a: `Seal materials: ${g.availableSealMaterials}. Body materials: ${g.availableBodyMaterials}. Seal compound drives the temperature range — Buna-N (-40°C to +100°C), Viton (-20°C to +200°C), EPR (-45°C to +150°C), Neoprene (-30°C to +90°C). Specify based on your fluid and operating temperature.`,
    },
    {
      q: `What port thread options are available?`,
      a: `${g.availablePortThreads}. The Eaton part number's third group is the port thread size in 16ths of an inch (e.g. <code>-08-</code> = 1/2"). Specify the exact port thread you require to match your existing pipework or hose end.`,
    },
    {
      q: `Does this coupling connect under pressure?`,
      a: g.connectUnderPressure
        ? `Yes — the ${g.series} Series is rated for connect-under-pressure operation. Refer to the datasheet for the specific connect-under-pressure rating, which is typically lower than the connected working pressure.`
        : `No — the ${g.series} Series is not rated for connect-under-pressure. Both halves must be depressurised before mating. For connect-under-pressure capability in similar applications, consider the Eaton FD96 (high-pressure thread-to-connect flush face) or 5100 Series (thread-to-connect brass).`,
    },
    {
      q: `What's the difference between this and other Eaton quick couplers?`,
      a: g.interchangeStandard
        ? `The ${g.series} is built to ${g.interchangeStandard}. ${g.interchangeWith ? `It interchanges with the following competitor lines: ${g.interchangeWith}. ` : ''}Eaton also makes other quick-coupler families with different interchange standards — Indus carries the full Aeroquip range and can recommend the right series based on your existing fleet.`
        : `${g.interchangeWith ? `Interchanges with: ${g.interchangeWith}. ` : ''}The ${g.series} is purpose-built for ${g.applicationClass.toLowerCase()} service — Eaton makes other coupler families for different applications (hydraulic, air, refrigerant, diagnostic, specialty). Indus carries the full Aeroquip range.`,
    },
    {
      q: `What is the typical lead time?`,
      a: `Standard lead time 14 working days from order ex-Eaton USA. Common configurations are typically held in regional stock by Eaton; non-standard sizes or seal compounds add 2-3 weeks. Indus offers air-freight to UAE / GCC for plant-down emergencies — confirm with your sales contact on the RFQ.`,
    },
  ]
  return faqs
}

// ── Translator ────────────────────────────────────────────────────────────

function makeProduct(g: ProductInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildHtml(g),
    specs: {
      series: g.series,
      interchange_standard: g.interchangeStandard ?? '',
      application_class: g.applicationClass,
      valving: g.valving,
      available_sizes: g.availableSizes,
      available_body_materials: g.availableBodyMaterials,
      available_seal_materials: g.availableSealMaterials,
      available_port_threads: g.availablePortThreads,
      available_halves: g.availableHalves,
      connection_method: g.connectionMethod,
      flush_face: g.flushFace,
      connect_under_pressure: g.connectUnderPressure,
      max_operating_pressure_bar: g.maxOperatingPressureBar,
      min_burst_pressure_bar: g.minBurstPressureBar,
      rated_flow_lpm_max: g.ratedFlowLpmMax,
      vacuum_rating_in_hg: g.vacuumRatingInHg ?? 0,
      temp_min_c: g.tempMinC,
      temp_max_c: g.tempMaxC,
      interchange_with: g.interchangeWith,
    },
    faqs: buildFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: `eaton ${g.series.toLowerCase()} quick coupler ${g.applicationClass.toLowerCase()}`.slice(0, 120),
  }
}

// ── Product data ──────────────────────────────────────────────────────────

const PRODUCTS: ProductInput[] = [
  // ── Hydraulic / Fluid Transfer (14) ────────────────────────────────────
  {
    sku: 'EATON-FD35',
    title: 'Eaton FD35 — 10,000 psi Arc Latch Hydraulic Quick Coupler',
    series: 'FD35',
    interchangeStandard: null,
    applicationClass: 'Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '3/8" body size only',
    availableBodyMaterials: 'Carbon Steel (heat-treated, zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N, Viton',
    availablePortThreads: 'Female NPT (3/8-18), Female SAE O-ring (9/16-18)',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug, Repair Kit',
    connectionMethod: 'Arc Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 700,
    minBurstPressureBar: 2800,
    ratedFlowLpmMax: 8,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'UP10P-37F, UP10S-37F (Stucchi)',
    oneLiner: 'Heavy-duty 10,000 psi quick coupler with Arc Latch™ design — greater latch surface contact area for long service life in rugged high-pressure hydraulic applications.',
    applications: [
      '10,000 psi hydraulic systems',
      'Hydraulic tools and impact wrenches',
      'Hydraulic ram and work-loading equipment',
      'Mining and heavy industrial hydraulics',
    ],
    partNumberExamples: [
      'FD35-1000-06-06',
      'FD35-1001-06-06',
      'FD35-1002-06-06',
      'FD35-1006-06-06',
      'FD35-1007-06-06',
      'FD35-1008-06-06',
      'FD-1044-06-06',
      'FF10173-06',
      'FD35-1042-06',
    ],
    notableFeatures: [
      'Arc Latch™ design with extended latch contact surface',
      'Safety sleeve lock prevents accidental disconnection',
      'Heavy-duty back-up ring prevents O-ring extrusion at 10,000 psi',
      'Heat-treated and plated steel for wear and corrosion resistance',
      'Self-sealing poppet valves for excellent high- and low-pressure sealing',
      '125 psi bleed-valve variant available (FD-1044) — relieves disconnected pressure build-up',
    ],
  },
  {
    sku: 'EATON-FD45-VALVED',
    title: 'Eaton FD45 — ISO 7241/1 Series B Valved Hydraulic Quick Coupler',
    series: 'FD45',
    interchangeStandard: 'ISO 7241/1 Series B',
    applicationClass: 'Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/8", 1/4", 3/8", 5/8", 3/4", 1" (brass also available in 1-1/4")',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated), Brass (with stainless springs/balls), 303/304 Stainless Steel',
    availableSealMaterials: 'Buna-N, Viton, EPR',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap, Dust Plug, Repair Kit',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1260,
    ratedFlowLpmMax: 189,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 200,
    interchangeWith: 'Parker 6100, Snap-tite 71, Faster TM2/TM3, Hansen B-Series, Stucchi A',
    oneLiner: 'North American industrial-standard valved quick coupler with self-sealing poppet valves — the highest-volume ISO 7241/1 Series B hydraulic coupler line, available in carbon steel, brass and stainless variants for general, marine and corrosive-fluid service.',
    applications: [
      'General hydraulic and fluid transfer',
      'Construction equipment hydraulics',
      'On-highway dump and refuse vehicles',
      'Marine and offshore hydraulics (stainless variant)',
      'Chemical processing (stainless variant)',
      'Steam service (stainless variant)',
      'Electronics liquid-based cooling (brass / stainless variant)',
    ],
    partNumberExamples: [
      'FD45-1000-04-04',
      'FD45-1001-08-10',
      'FD45-1002-12-12',
      'FD45-1071-06-06',
      'FD45-1064-16-16',
      'FD45-1415-06-04',
    ],
    notableFeatures: [
      'Meets dimensional requirements of ISO 7241/1 Series B (international interchangeability)',
      'PUSH-PULL™ ball latch design for one-hand operation',
      'Self-sealing poppet valves provide excellent high and low pressure sealing',
      'Three body materials: carbon steel (volume), brass (corrosion + electronics), stainless steel (marine + chem)',
      'Brass variant: dual interface O-rings in female half for redundant sealing',
      'Stainless variant: 303/304 SS for chemical processing, marine and electronics-cooling service',
    ],
  },
  {
    sku: 'EATON-FD45-NON-VALVED',
    title: 'Eaton FD45 — ISO 7241/1 Series B Non-Valved Hydraulic Quick Coupler',
    series: 'FD45',
    interchangeStandard: 'ISO 7241/1 Series B',
    applicationClass: 'Hydraulic',
    valving: 'Non-Valved',
    availableSizes: '1/4", 3/8", 5/8", 3/4", 1"',
    availableBodyMaterials: 'Carbon Steel (zinc plated), Brass, 303/304 Stainless Steel',
    availableSealMaterials: 'Buna-N, Viton, EPR',
    availablePortThreads: 'Female NPT',
    availableHalves: 'Male, Female, Complete Set, Dust Cap, Dust Plug',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1260,
    ratedFlowLpmMax: 189,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 200,
    interchangeWith: 'Parker 6100 NV, Snap-tite 71-NV, Faster TM2/TM3 NV',
    oneLiner: 'Non-valved variant of the FD45 ISO 7241/1 Series B coupler — straight-through bore for maximum flow with minimum pressure drop. Will not operate with valved coupling halves; intended for systems where line valving is upstream of the coupler.',
    applications: [
      'Bulk fluid transfer where line valves provide isolation',
      'Suction-side hydraulic returns',
      'Tool change-over where flow restriction is critical',
      'Lubrication and cooling line transfers',
    ],
    partNumberExamples: [
      'FD45-1044-04-04',
      'FD45-1047-08-10',
      'FD45-1061-12-12',
      'FD45-1172-06-06',
      'FD45-1207-16-16',
    ],
    notableFeatures: [
      'Non-valved straight-through bore — minimum pressure drop',
      'Will not operate with valved halves (no valve actuator)',
      'Same body, latch and seal options as the FD45 valved variant',
      'Three body materials: carbon steel, brass, 303/304 stainless',
    ],
  },
  {
    sku: 'EATON-FD45-PUSHER',
    title: 'Eaton FD45 — ISO 7241/1 Series B Pusher-Style Hydraulic Quick Coupler',
    series: 'FD45',
    interchangeStandard: 'ISO 7241/1 Series B',
    applicationClass: 'Hydraulic',
    valving: 'Pusher-Style',
    availableSizes: '1/4", 3/8", 5/8", 3/4", 1"',
    availableBodyMaterials: 'Carbon Steel (zinc plated)',
    availableSealMaterials: 'Buna-N, Viton, EPR',
    availablePortThreads: 'Female NPT',
    availableHalves: 'Male, Female',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1260,
    ratedFlowLpmMax: 189,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 200,
    interchangeWith: 'Parker 6100 P, Snap-tite 71-P (pusher-style)',
    oneLiner: 'Pusher-style variant of the FD45 ISO 7241/1 Series B coupler — incorporates a pusher device that mechanically opens mating valved coupling halves on connection. For mixed-fleet installations where one side is valved and one side is non-valved.',
    applications: [
      'Mixed-fleet installations (valved tractor, non-valved implement)',
      'Field-service hose changeouts where a valved hose end mates a non-valved fitting',
      'Retrofitting non-valved systems into valved infrastructure',
    ],
    partNumberExamples: [
      'FD45-1045-04-04',
      'FD45-1046-06-06',
      'FD45-1228-08-10',
      'FD45-1229-12-12',
    ],
    notableFeatures: [
      'Pusher device opens mating valved coupling halves',
      'For use with FD45 valved or other ISO 7241/1 Series B valved halves',
      'Same body, latch and seal options as standard FD45',
    ],
  },
  {
    sku: 'EATON-FD48',
    title: 'Eaton FD48 — Parker Bruning SM-250 Interchange Hydraulic Quick Coupler',
    series: 'FD48',
    interchangeStandard: 'Parker Bruning SM-250',
    applicationClass: 'Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4" body size only',
    availableBodyMaterials: 'Carbon Steel (heat-treated, zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT (1/4-18)',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 210,
    minBurstPressureBar: 840,
    ratedFlowLpmMax: 11,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker Bruning SM-250',
    oneLiner: 'Poppet-style 3,000 psi quick coupler designed to interchange with Parker Bruning SM-250 — for fleets running mixed-brand hydraulic equipment, particularly agricultural.',
    applications: [
      'Agricultural equipment hydraulics',
      'Hydraulic and fluid transfer (mixed-fleet)',
      'Replacement for Parker Bruning SM-250 couplers',
    ],
    partNumberExamples: [
      'FD48-1000-04-04',
      'FD48-1001-04-04',
      'FD48-1002-04-04',
      'FD48-1042-04',
    ],
    notableFeatures: [
      'Direct dimensional interchange with Parker Bruning SM-250',
      'Self-sealing poppet valves',
      'PUSH-PULL™ ball latch',
      'Heat-treated and plated steel for wear resistance',
    ],
  },
  {
    sku: 'EATON-FD49',
    title: 'Eaton FD49 — NFPA T3.20.15 HTMA Interchange Hydraulic Tool Coupler',
    series: 'FD49',
    interchangeStandard: 'NFPA T3.20.15 (HTMA)',
    applicationClass: 'Hydraulic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '3/8" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Teflon channel seal with Buna-N O-ring backup (Twin-Guard™)',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug',
    connectionMethod: 'Push-to-Connect',
    flushFace: true,
    connectUnderPressure: true,
    maxOperatingPressureBar: 207,
    minBurstPressureBar: 621,
    ratedFlowLpmMax: 38,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker FEM/FET HTMA, Snap-tite 75 HTMA, Faster HTMA',
    oneLiner: 'NFPA T3.20.15 HTMA-interchange coupler developed with the Hydraulic Tool Manufacturers Association — for hydraulic impact tools. Eaton Twin-Guard™ sealing prevents weepage and allows connect/disconnect against pressure to 500 psi.',
    applications: [
      'Hydraulic tools (impact wrenches, breakers, jaws of life)',
      'HTMA-standard rescue and utility tool kits',
      'Hydraulic fluid transfer with HTMA tooling',
    ],
    partNumberExamples: [
      'FD49-1000-06-06',
      'FD49-1001-06-06',
      'FD49-1002-06-06',
    ],
    notableFeatures: [
      'Meets NFPA T3.20.15 HTMA standard',
      'Twin-Guard™ sealing system: Teflon channel seal + Buna-N O-ring backup',
      'Connect/disconnect against pressure to 500 psi',
      'Push-to-connect for one-hand operation',
      'Tubular valve and sleeve construction for high flow with low pressure drop',
      'Dual flush face valving for minimal fluid loss and air inclusion',
    ],
  },
  {
    sku: 'EATON-5100',
    title: 'Eaton 5100 — Thread-to-Connect Brass Hydraulic Quick Coupler',
    series: '5100',
    interchangeStandard: null,
    applicationClass: 'Hydraulic',
    valving: 'Thread-to-Connect',
    availableSizes: '1/4", 3/8", 1/2", 5/8", 3/4", 1", 1-1/4", 1-1/2"',
    availableBodyMaterials: 'Brass body with carbon steel zinc-plated valving and hex / wing nuts',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug, Bulkhead Flange (steel, optional)',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: true,
    maxOperatingPressureBar: 207,
    minBurstPressureBar: 600,
    ratedFlowLpmMax: 379,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker 5100 / 6800 thread-to-connect, Faster TGI',
    oneLiner: 'Brass body thread-to-connect coupler with steel tubular valving — minimum air inclusion, low fluid loss, and connect-under-pressure capability to 500 psi. Wing or hex-nut configurations; the volume on-highway hydraulic wet-line coupler.',
    applications: [
      'On-highway hydraulic wet lines',
      'Dump and refuse vehicles',
      'Bulk liquid transfer',
      'Hydraulics and fluid transfer where vibration is high',
      'Bulkhead-mounted hose feed-through (with optional steel flange)',
    ],
    partNumberExamples: [
      '5100-S2-4B',
      '5100-S2-8B',
      '5100-S2-16B',
      '5110-S5-4B',
      '5110-S5-12B',
      '5111-4B',
      '5111-12B',
      '5111-24B',
    ],
    notableFeatures: [
      'Tubular valve construction — virtually no fluid loss during disconnection',
      'Low air inclusion during connection — maintains system performance',
      'Thread-together latch — vibration-resistant',
      'Connect-under-pressure capability to 500 psi',
      'Wing or hex-nut configurations',
      'Optional steel flange for bulkhead mounting',
      'NOT rated for continuous hydraulic impulse — for impulse, use FD86 or FD96',
    ],
  },
  {
    sku: 'EATON-5600-VALVED',
    title: 'Eaton 5600 — ISO 7241/1 Series A Valved Hydraulic Quick Coupler',
    series: '5600',
    interchangeStandard: 'ISO 7241/1 Series A',
    applicationClass: 'Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4", 3/8", 5/8", 3/4", 1"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated; brass poppet guide in 1/4" size)',
    availableSealMaterials: 'Buna-N, Viton, EPR',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap, Dust Plug, Repair Kit',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1050,
    ratedFlowLpmMax: 189,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 200,
    interchangeWith: 'Parker 6600, Snap-tite 72, Faster TGV, Hansen LL-Series',
    oneLiner: 'Low-profile ISO 7241/1 Series A valved coupler with PUSH-PULL™ ball latch and streamlined poppet valving — minimum pressure drop. The European-standard hydraulic interchange.',
    applications: [
      'Agricultural equipment hydraulics',
      'Construction equipment hydraulics',
      'Dump, snow plough and maintenance vehicles',
      'In-plant manufacturing hydraulic fluid transfer',
      'Hydraulic systems built to European/ISO Series A standard',
    ],
    partNumberExamples: [
      '5600-1001-04-04',
      '5600-1002-08-10',
      '5600-1000-12-12',
      '5600-1070-06-06',
      '5600-1064-16-16',
    ],
    notableFeatures: [
      'Meets ISO 7241/1 Series A dimensional requirements',
      'PUSH-PULL™ ball latch — one-hand operation',
      'Streamlined poppet valving — minimum pressure drop',
      'Self-sealing poppet valves',
      'Low-profile body for tight installations',
      'Three seal materials: Buna-N (general), Viton (high-temp/aromatic), EPR (water/glycol/Skydrol)',
    ],
  },
  {
    sku: 'EATON-5600-NON-VALVED',
    title: 'Eaton 5600 — ISO 7241/1 Series A Non-Valved Hydraulic Quick Coupler',
    series: '5600',
    interchangeStandard: 'ISO 7241/1 Series A',
    applicationClass: 'Hydraulic',
    valving: 'Non-Valved',
    availableSizes: '1/4", 3/8", 5/8", 3/4", 1"',
    availableBodyMaterials: 'Carbon Steel (zinc plated)',
    availableSealMaterials: 'Buna-N, Viton, EPR',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap, Dust Plug',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1050,
    ratedFlowLpmMax: 189,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 200,
    interchangeWith: 'Parker 6600 NV, Faster TGV NV',
    oneLiner: 'Non-valved variant of the 5600 ISO 7241/1 Series A coupler — straight-through bore for maximum flow. For systems with upstream line valving.',
    applications: [
      'Bulk fluid transfer (suction-side returns)',
      'Tool change-over where flow restriction is critical',
      'Lubrication line transfers',
    ],
    partNumberExamples: [
      '5600-1044-04-04',
      '5600-1047-08-10',
      '5600-1061-12-12',
    ],
    notableFeatures: [
      'Non-valved straight-through bore — minimum pressure drop',
      'Will not operate with valved halves',
      'Same body and latch as the 5600 valved variant',
    ],
  },
  {
    sku: 'EATON-FD86',
    title: 'Eaton FD86 — 5,000 psi Dry Break Thread-to-Connect High-Impulse Hydraulic Coupler',
    series: 'FD86',
    interchangeStandard: null,
    applicationClass: 'Hydraulic',
    valving: 'Dry Break',
    availableSizes: '1", 1-1/4"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N, with Teflon back-up rings',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug, Bulkhead Flange (steel)',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: true,
    maxOperatingPressureBar: 345,
    minBurstPressureBar: 1034,
    ratedFlowLpmMax: 284,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker FH high-impulse, Stucchi A-HP',
    oneLiner: 'Thread-together steel high-impulse 5,000 psi dry-break coupler with Acme threads and tubular valve — for mining and high-impulse hydraulic circuits. Connect/disconnect against pressures to 750 psi.',
    applications: [
      'Mining equipment hydraulics',
      'High-impulse hydraulic and fluid transfer',
      'Heavy industrial fluid power circuits',
      'Bulkhead-mounted high-pressure hose feed-through',
    ],
    partNumberExamples: [
      'FD86-1000-16-16',
      'FD86-1001-20-20',
      'FD86-1002-16-16',
    ],
    notableFeatures: [
      'Dry-break design — virtually no fluid loss at disconnect',
      '5,000 psi (345 bar) maximum working pressure',
      'High impulse capability — thread-together design with Acme threads prevents galling',
      'Connect/disconnect against pressure to 750 psi',
      'Teflon back-up rings + secondary metal-to-metal sealing for high-impulse durability',
      'Wing or hex-nut configurations',
      'Optional steel bulkhead flange',
    ],
  },
  {
    sku: 'EATON-FD89',
    title: 'Eaton FD89 — ISO 16028 Flush Face Hydraulic Quick Coupler',
    series: 'FD89',
    interchangeStandard: 'ISO 16028',
    applicationClass: 'Hydraulic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '1/4", 3/8", 1/2", 3/4", 1", 1-1/4", 1-1/2", 2"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N (with anti-extrusion Teflon seal)',
    availablePortThreads: 'Female NPT, Female BSP, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap (PVC), Dust Plug (PVC)',
    connectionMethod: 'Push-to-Connect',
    flushFace: true,
    connectUnderPressure: false,
    maxOperatingPressureBar: 300,
    minBurstPressureBar: 1200,
    ratedFlowLpmMax: 379,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker FEM (ISO 16028), Faster FFI, Stucchi APM, Snap-tite 78, HTMA-interchangeable in 3/8" size',
    oneLiner: 'Premium ISO 16028 flush-face quick coupler — push-to-connect, dual flush-face valving for minimal fluid loss and zero air inclusion at disconnect. The volume modern hydraulic OEM coupler.',
    applications: [
      'Construction equipment hydraulics',
      'Agricultural equipment hydraulics',
      'Utility vehicle hydraulics',
      'On-highway truck hydraulics',
      'Stationary in-plant hydraulics and fluid transfer',
      'HTMA tool interchange (3/8" size)',
    ],
    partNumberExamples: [
      'FD89-1001-04-04',
      'FD89-1002-08-08',
      'FD89-1006-12-12',
      'FD89-1004-12-08',
      'FD89-1005-16-12',
      'FD89-1009-04',
      'FD89-1008-32-32',
    ],
    notableFeatures: [
      'Meets ISO 16028 dimensional requirements (global interchangeability)',
      'Push-to-connect latching for one-hand operation',
      'Dual flush-face valving — minimal spillage and air ingress',
      'Anti-extrusion Teflon seal',
      'Safety sleeve lock prevents accidental disconnection',
      'Largest size range in the ISO 16028 family — 1/4" through 2"',
      'Interchangeable with HTMA couplings in 3/8" size',
    ],
  },
  {
    sku: 'EATON-FD89-2000',
    title: 'Eaton FD89-2000 — 316 Stainless Steel ISO 16028 Flush Face Coupler',
    series: 'FD89-2000',
    interchangeStandard: 'ISO 16028',
    applicationClass: 'Hydraulic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '1/4", 3/8", 1/2", 5/8", 3/4", 1", 1-1/4", 2"',
    availableBodyMaterials: '316 Stainless Steel',
    availableSealMaterials: 'Viton (other materials available on request)',
    availablePortThreads: 'Female NPT, Female BSP, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap, Dust Plug',
    connectionMethod: 'Push-to-Connect',
    flushFace: true,
    connectUnderPressure: false,
    maxOperatingPressureBar: 350,
    minBurstPressureBar: 1400,
    ratedFlowLpmMax: 379,
    vacuumRatingInHg: 28,
    tempMinC: -20,
    tempMaxC: 200,
    interchangeWith: 'Parker FEM-SS, Faster SS-FFI, Stucchi A SS',
    oneLiner: '316 stainless steel ISO 16028 flush-face coupler — same global interchangeability as FD89 but with corrosion-resistant 316 SS body for chemical, pharmaceutical and oil-field service.',
    applications: [
      'Chemical processing fluid transfer',
      'Pharmaceutical and bio-process fluid transfer',
      'Oil-field high-corrosion service',
      'Off-shore and marine hydraulics',
      'Long-life sterile-service applications',
    ],
    partNumberExamples: [
      'FD89-2000-1001-04-04',
      'FD89-2000-1002-08-08',
      'FD89-2000-1006-16-12',
      'FD89-2000-1004-32-32',
    ],
    notableFeatures: [
      '316 stainless steel body — superior corrosion resistance vs. carbon steel FD89',
      'Same ISO 16028 dimensional standard as FD89 — fully interchangeable',
      'Viton seal standard (other materials on request)',
      'Anti-extrusion Teflon seal',
      'Safety sleeve lock',
      'Higher working pressure than carbon steel FD89 in some sizes (350 bar vs 300 bar)',
    ],
  },
  {
    sku: 'EATON-FD96',
    title: 'Eaton FD96 — High-Pressure Thread-to-Connect Flush Face Hydraulic Coupler',
    series: 'FD96',
    interchangeStandard: null,
    applicationClass: 'Hydraulic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '1/4", 3/8", 1/2", 3/4", 1", 1-1/4", 1-1/2", 2"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plating + black oxide plating)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT, Female BSP, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug',
    connectionMethod: 'Thread-to-Connect',
    flushFace: true,
    connectUnderPressure: true,
    maxOperatingPressureBar: 600,
    minBurstPressureBar: 1500,
    ratedFlowLpmMax: 379,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker FEM-HP, Stucchi APM-HP, Faster CVE-HP',
    oneLiner: 'High-pressure thread-to-connect flush-face coupler — working pressures to 8,500 psi with connect-under-pressure capability to 4,300 psi. The premium high-impulse Eaton hydraulic coupler.',
    applications: [
      'Hydraulic fluid transfer at high pressure',
      'High-impulse hydraulic circuits',
      'Oil-field service',
      'Mining hydraulics',
      'Hydraulic systems with trapped residual pressure',
    ],
    partNumberExamples: [
      'FD96-1001-04-04',
      'FD96-1002-08-08',
      'FD96-1006-16-16',
      'FD96-1004-32-32',
    ],
    notableFeatures: [
      'Working pressure to 8,500 psi (600 bar)',
      'Connect-under-pressure capability to 4,300 psi (300 bar)',
      'Thread-together design — high-impulse durability',
      'Dual flush-face valving with non-spill design',
      'Low connection force despite high pressure rating',
      'Carbon steel with zinc trivalent + black oxide plating for severe service',
    ],
  },
  {
    sku: 'EATON-FD99',
    title: 'Eaton FD99 — High-Pressure Flush Face ISO 16028 Hydraulic Coupler',
    series: 'FD99',
    interchangeStandard: 'ISO 16028',
    applicationClass: 'Hydraulic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '1/4", 3/8", 1/2", 5/8", 3/4", 1", 1-1/4", 1-1/2"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Nitrile/Teflon (additional materials on request)',
    availablePortThreads: 'Female NPT, Female BSP, Female SAE O-ring',
    availableHalves: 'Male, Female, Complete Set, Dust Cap/Plug',
    connectionMethod: 'Push-to-Connect',
    flushFace: true,
    connectUnderPressure: false,
    maxOperatingPressureBar: 420,
    minBurstPressureBar: 1260,
    ratedFlowLpmMax: 288,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker FEM-HP (ISO 16028), Faster CVE high-pressure ISO 16028, Stucchi APM-HP',
    oneLiner: 'High-pressure ISO 16028 flush-face coupler — push-to-connect with working pressures to 6,090 psi (420 bar) at 1/4" size. Combines ISO 16028 global interchangeability with high-impulse pressure ratings exceeding the standard.',
    applications: [
      'High-impulse hydraulic fluid transfer',
      'Agricultural equipment requiring high-pressure flush face',
      'Construction equipment and implements',
      'High-pressure ISO 16028 retrofit applications',
    ],
    partNumberExamples: [
      'FD99-1001-04-04',
      'FD99-1002-12-12',
      'FD99-1006-20-16',
    ],
    notableFeatures: [
      'Meets ISO 16028 dimensional requirements',
      'Pressure ratings exceed ISO 16028 standard — to 6,090 psi at 1/4" size',
      'Push-to-connect latching',
      'Dual flush-face valving — non-spill design',
      'Anti-extrusion Teflon seal',
      'Safety sleeve lock',
      'Nitrile/Teflon seal compound for high-impulse durability',
    ],
  },

  // ── Farm Hydraulic (2) ──────────────────────────────────────────────────
  {
    sku: 'EATON-FD72',
    title: 'Eaton FD72 — Connect-Under-Pressure Farm ISO 5675 Quick Coupler',
    series: 'FD72',
    interchangeStandard: 'ISO 5675',
    applicationClass: 'Farm Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '5/8" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT (1/2-14)',
    availableHalves: 'Female (mates FD70/FD76 male tip), Dust Cap, Dust Plug, Breakaway Frame',
    connectionMethod: 'Push-to-Connect',
    flushFace: false,
    connectUnderPressure: true,
    maxOperatingPressureBar: 207,
    minBurstPressureBar: 827,
    ratedFlowLpmMax: 61,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'John Deere old-style, ISO 5675 pioneer (mates FD70 / FD76 male tips)',
    oneLiner: 'Push-to-connect ISO 5675 farm-tractor female coupler with over-travel poppet valve for connect-under-pressure to a pressurised FD76 male tip. Mounts in tractor breakaway frames.',
    applications: [
      'Agricultural tractor remote hydraulics',
      'Farm implement hydraulic supply',
      'Hydraulic fluid transfer between tractor and implement',
    ],
    partNumberExamples: [
      'FD72-1001-08-10',
      '5657-10',
      '5659-10',
      '5603',
    ],
    notableFeatures: [
      'ISO 5675 farm-coupler standard',
      'Push-to-connect for one-hand operation when sleeve is mounted',
      'Connect-under-pressure capability — special over-travel poppet valve',
      'Retaining ring groove on female half for bulkhead and breakaway frame mounting',
      'Mates with FD70 (Deere style) and FD76 (ISO style) male tips',
      'Breakaway frame (5603) sold separately',
    ],
  },
  {
    sku: 'EATON-FD70-FD76',
    title: 'Eaton FD70 / FD76 — ISO 5675 Farm Tractor Male Tip Coupler',
    series: 'FD70 / FD76',
    interchangeStandard: 'ISO 5675 (FD76); John Deere (FD70)',
    applicationClass: 'Farm Hydraulic',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '5/8" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT, Female SAE O-ring',
    availableHalves: 'Male tip only (mates FD72 or older Deere female couplers)',
    connectionMethod: 'Push-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 207,
    minBurstPressureBar: 827,
    ratedFlowLpmMax: 61,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'FD70: John Deere old-style; FD76: ISO 5675 / North American farm tractor standard',
    oneLiner: 'Male tip coupler designed to connect with female couplings on most older-style John Deere (FD70) and ISO 5675 (FD76) farm tractors. Optional ball or poppet valving.',
    applications: [
      'Farm tractor remote hydraulic outlets',
      'Implement-side male tips for tractor connection',
      'ISO 5675 / John Deere replacement service',
    ],
    partNumberExamples: [
      'FD70-1010-08-10',
      'FD76-1002-08-10',
      'FD76-1010-08-10',
    ],
    notableFeatures: [
      'FD70 mates John Deere old-style female couplers',
      'FD76 mates ISO 5675 standard female couplers (including FD72)',
      'Optional ball or poppet style valving',
      'Carbon steel with zinc trivalent chromate plating',
      'Female NPT or Female SAE O-ring port threads',
    ],
  },

  // ── Diagnostics (3) ─────────────────────────────────────────────────────
  {
    sku: 'EATON-FD15',
    title: 'Eaton FD15 — Hydraulic Oil Sampling Valve',
    series: 'FD15',
    interchangeStandard: 'MIL-V-81940/2-1 (1/4" NPTF version)',
    applicationClass: 'Diagnostic',
    valving: 'Sampling Valve',
    availableSizes: '1/8" NPT, 1/4" NPT, 7/16-20 SAE O-ring',
    availableBodyMaterials: 'Corrosion-resistant plated steel with brass internal components',
    availableSealMaterials: 'Buna',
    availablePortThreads: 'Male Pipe Thread (NPT), Male SAE O-ring Thread',
    availableHalves: 'Single-piece valve (no separate male/female)',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 21, // covers both 50-300 psi and 0-50 psi versions
    minBurstPressureBar: 83, // 1,200 psi
    ratedFlowLpmMax: 1.5, // 100-1,500 mL/min
    vacuumRatingInHg: null,
    tempMinC: -53,
    tempMaxC: 135,
    interchangeWith: 'MIL-V-81940/2-1 qualified product',
    oneLiner: 'In-line oil sampling valve for system fluid sampling without shutdown — sampling completed in under one minute with no fluid contamination.',
    applications: [
      'Engine oil sampling',
      'Lubricating oil analysis',
      'Transmission and hydraulic fluid sampling in mobile equipment',
      'Military, construction, mining and trucking equipment fluid analysis',
      'Stationary equipment fluid analysis',
    ],
    partNumberExamples: [
      'FD15-1000-02',
      'FD15-1000-04',
      'FD15-1002-04',
      'FD15-1026-04',
      'FD15-1025-04',
    ],
    notableFeatures: [
      'In-line sampling without system shutdown',
      'No fluid contamination during sample',
      '500-micron particle restriction',
      '10 in-lbs maximum operating torque',
      'Operating temperature -65°F to +275°F (-53°C to +135°C)',
      '1/4" NPTF version (FD15-1000-04) qualified to MIL-V-81940/2-1',
      'Two pressure ranges: 50-300 psi and 0-50 psi',
      'Flow rate 100-1,500 mL/min (per MIL spec at 50-300 psi)',
    ],
  },
  {
    sku: 'EATON-FD90',
    title: 'Eaton FD90 — SAE J1502 Diagnostic Test-Point Coupler',
    series: 'FD90',
    interchangeStandard: 'SAE J1502',
    applicationClass: 'Diagnostic',
    valving: 'Flush Face (No-Spill)',
    availableSizes: '1/4" coupling size; multiple port sizes (1/8" to 13/16")',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT, Male SAE O-ring (3/8-24, 7/16-20, 1/2-20, 9/16-18), Male Metric O-ring (M10x1, M14x1.5), Male ORS Bulkhead, Female ORS Swivel',
    availableHalves: 'Male, Female, Dust Cap (sold separately or with male)',
    connectionMethod: 'Push-to-Connect',
    flushFace: true,
    connectUnderPressure: true,
    maxOperatingPressureBar: 483,
    minBurstPressureBar: 1931,
    ratedFlowLpmMax: 1.89,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Parker test-point couplers (SAE J1502), Bosch Rexroth diagnostic couplers, Hydrotechnik test-points, MiniMess',
    oneLiner: 'SAE J1502 diagnostic test-point coupler — connect/disconnect a pressure gauge to a hydraulic system at up to 500 psi without shutdown. 7,000 psi working pressure, flush-face self-sealing.',
    applications: [
      'Hydraulic system pressure diagnostics',
      'Permanent test-point installation in service-prone hydraulic circuits',
      'Mobile equipment pressure-survey field service',
      'Industrial hydraulic system commissioning',
    ],
    partNumberExamples: [
      'FD90-1021-04-04',
      'FD90-1034-04-04',
      'FD90-1041-09-04',
      'FD90-1044-04-04',
      'FD90-1046-06-04',
      'FD90-1061-06-04',
      'FD90-1090-10-04',
      'FD90-1206-04-04',
      'FD90-1040-04-04',
    ],
    notableFeatures: [
      'SAE J1502 diagnostic-coupler standard',
      'Push-to-connect for one-hand operation',
      'Flush-face self-sealing valve — minimal fluid loss',
      'Connect/disconnect at 500 psi line pressure',
      '7,000 psi (483 bar) maximum working pressure',
      'Wide range of port end configurations: NPT, SAE O-ring, Metric O-ring, ORS Bulkhead/Swivel',
      'Eliminates the need for permanent gauges',
    ],
  },
  {
    sku: 'EATON-FF14802',
    title: 'Eaton FF14802 — Hydraulic Pressure Gauge Test Kit',
    series: 'FF14802',
    interchangeStandard: null,
    applicationClass: 'Diagnostic',
    valving: 'Multi-Component Kit',
    availableSizes: 'Kit includes 1/8" NPT, 1/4" NPT, 7/16-20 UNF, 9/16-20 UNF, M14, M16 test couplings',
    availableBodyMaterials: 'Zinc-Nickel Plated Steel (couplings); Polished Brass (gauges)',
    availableSealMaterials: 'Viton',
    availablePortThreads: 'Test couplings: NPT, UNF, Metric. Hose: 60" (1.52m) PA 11/12 with synthetic-fiber reinforcement',
    availableHalves: 'Complete pre-packaged kit (couplings + adapters + 2× test hose assemblies + 3× gauges)',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: true,
    maxOperatingPressureBar: 630,
    minBurstPressureBar: 1500,
    ratedFlowLpmMax: 5,
    vacuumRatingInHg: null,
    tempMinC: -20,
    tempMaxC: 200,
    interchangeWith: 'Compatible with SAE J1502 / Eaton FD90 test points',
    oneLiner: 'Complete pre-packaged hydraulic pressure-survey kit — Eaton-standard test couplings, adapters, polished brass glycerine-filled gauges and 60" reinforced thermoplastic test hoses for accurate, contamination-free system pressure monitoring.',
    applications: [
      'Field hydraulic system diagnostics',
      'Service-shop pressure surveys',
      'Construction and agricultural equipment field service',
      'Industrial hydraulic commissioning',
    ],
    partNumberExamples: [
      'FF14802',
      'FF14783',
      'FF14784',
      'FF14787',
      'FF14788',
      'FF14794',
      'FF14796',
      'FF14798',
      'FF14799',
      'FF14800',
      'FF14801',
    ],
    notableFeatures: [
      '630 bar (9,000 psi) maximum working pressure',
      '345 bar (5,000 psi) connect-under-pressure capability',
      'Polished brass glycerine-filled gauges with dual scales (bar/psi) and acrylic lens',
      'Three gauge ranges: -30 in/Hg to 30 psi, 1,000 psi, 7,500 psi',
      '60" (1.52m) hose with 20mm bend radius and PA 11/12 synthetic-fiber-reinforced cover',
      'Self-locking caps prevent contamination',
      'Pre-packaged with Eaton\'s most common test couplings and adapters',
      'Leak-free connection before piston valve opens',
    ],
  },

  // ── Specialty (4) ───────────────────────────────────────────────────────
  {
    sku: 'EATON-FD14',
    title: 'Eaton FD14 — Push-to-Connect Oil Drain Coupling (FLOCS)',
    series: 'FD14',
    interchangeStandard: null,
    applicationClass: 'Specialty',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '3/8" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated) with zinc die-cast valve',
    availableSealMaterials: 'Viton (male half), Buna-N (female half)',
    availablePortThreads: 'Multiple port styles for male half',
    availableHalves: 'Male, Female (push-to-connect)',
    connectionMethod: 'Push-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 3.5,
    minBurstPressureBar: 7,
    ratedFlowLpmMax: 12,
    vacuumRatingInHg: 28,
    tempMinC: -20,
    tempMaxC: 200,
    interchangeWith: 'Eaton FLOCS (Fast Lube Oil Change System) compatible',
    oneLiner: 'Low-profile push-to-connect oil drain coupling for Eaton\'s FLOCS (Fast Lube Oil Change System). Provides a leak-free drain port and pre-fill purging port for mobile-equipment oil-evacuation systems.',
    applications: [
      'Automated oil-evacuation systems on mobile equipment',
      'Gravity-drain oil-evacuation systems',
      'Engine oil change service ports',
      'Hydraulic reservoir drain ports',
    ],
    partNumberExamples: [
      'FD14-1001-06-06',
      'FD14-1002-06-06',
    ],
    notableFeatures: [
      'Low-profile design for tight engine-bay installations',
      'Push-to-connect female half — one-hand operation',
      'Multiple sealing mechanisms for leak-free service',
      'Copper-crush gasket for port-face seal',
      'Compatible with Eaton FLOCS (Fast Lube Oil Change System)',
      'Very low pressure (50 psi) — drain / purge service only, NOT pressure containment',
    ],
  },
  {
    sku: 'EATON-FD31',
    title: 'Eaton FD31 — Enerpac-Interchange 10,000 psi Hydraulic Jack Coupler',
    series: 'FD31',
    interchangeStandard: 'Parker 3000 Series interchange',
    applicationClass: 'Specialty',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4", 3/8"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Nitrile',
    availablePortThreads: 'Female NPT, Male NPT',
    availableHalves: 'Male, Female, Dust Cap (aluminum), Dust Plug (aluminum)',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 700,
    minBurstPressureBar: 1850,
    ratedFlowLpmMax: 23,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Enerpac, Parker 3000 Series, Stucchi VEP-10 high-pressure',
    oneLiner: 'Thread-together 10,000 psi (700 bar) hydraulic jack coupler — direct interchange with Enerpac couplings and Parker 3000 Series. For portable hydraulic ram and jack service.',
    applications: [
      'Hydraulic jack service',
      'Portable hydraulic rams',
      'Bottle jacks and porta-power equipment',
      'High-pressure rescue tools',
      'Bridge and structural lifting equipment',
    ],
    partNumberExamples: [
      'FD31-1001-04-04',
      'FD31-1002-04-04',
      'FD31-1001-06-06',
      'FD31-1002-06-06',
      'FD31-1004-04',
      'FD31-1005-04',
    ],
    notableFeatures: [
      'Direct interchange with Enerpac couplings',
      'Direct interchange with Parker 3000 Series',
      '10,000 psi (700 bar) operating pressure',
      'Thread-together design',
      'Nitrile seals',
      'Aluminum dust caps and plugs',
      'NOTE: Connect/disconnect under pressure NOT permitted',
    ],
  },
  {
    sku: 'EATON-FD69',
    title: 'Eaton FD69 — 10,000 psi Water Blast Arc Latch Coupler',
    series: 'FD69',
    interchangeStandard: null,
    applicationClass: 'Specialty',
    valving: 'Non-Valved',
    availableSizes: '3/8" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated) or Stainless Steel',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT',
    availableHalves: 'Male, Female, Dust Cap/Plug',
    connectionMethod: 'Arc Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 689,
    minBurstPressureBar: 2758,
    ratedFlowLpmMax: 170,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Specialty water-blast couplers',
    oneLiner: 'Arc Latch™ 10,000 psi water-blast quick coupler with smooth-bore straight-through design — for high-pressure water-blast applications in shipyards, bridge/concrete repair and paint stripping. Available in plated steel or stainless.',
    applications: [
      'High-pressure water blast (paint stripping, surface prep)',
      'Bridge and concrete repair',
      'Shipyard hull cleaning',
      'Industrial cleaning and de-scaling',
      'Hydroblasting',
    ],
    partNumberExamples: [
      'FD69-1001-06-06',
      'FD69-1002-06-06',
      'FD69-1042-06',
    ],
    notableFeatures: [
      'Arc Latch™ design — extended latch contact surface for rugged service',
      'Smooth-bore straight-through design for high flow',
      '10,000 psi (689 bar) maximum operating pressure',
      '40,000 psi (2,758 bar) minimum burst pressure',
      'Available in plated steel or stainless steel for added corrosion resistance',
      'Heavy-duty back-up ring prevents O-ring extrusion',
      'Safety sleeve lock prevents accidental disconnection',
    ],
  },
  {
    sku: 'EATON-FD83',
    title: 'Eaton FD83 — Full-Flow Dual-Interlock Stainless Coupler (Electronics Cooling)',
    series: 'FD83',
    interchangeStandard: null,
    applicationClass: 'Specialty',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '3/4", 1"',
    availableBodyMaterials: '303 Stainless Steel (other materials on request)',
    availableSealMaterials: 'EPDM (other materials on request)',
    availablePortThreads: 'Female NPT, Hose Barb',
    availableHalves: 'Identical halves (no male/female distinction) — single SKU',
    connectionMethod: 'Push-Pull Ball Latch',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 10,
    minBurstPressureBar: 20,
    ratedFlowLpmMax: 200,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 150,
    interchangeWith: 'Specialty electronics-cooling couplers',
    oneLiner: 'Full-flow dual-interlock stainless steel coupler with identical halves — engineered for electronics liquid cooling and thermal-management systems. Dual interlock prevents accidental opening when disconnected and prevents disconnect with valves open.',
    applications: [
      'Electronics liquid-based cooling (data center, supercomputer)',
      'Thermal management systems',
      'Industrial fluid transfer (low pressure, full flow)',
      'Pharmaceutical process cooling',
      'Bio-process fluid lines',
    ],
    partNumberExamples: [
      'FD83-1000-12-12',
      'FD83-1000-16-16',
      'FD83-1100-12-12',
    ],
    notableFeatures: [
      'Identical coupling halves — simplifies inventory',
      '303 stainless steel for broad fluid compatibility',
      'Dual interlock safety: valves cannot open until halves mated; halves cannot disconnect with valves open',
      'Full-flow capability',
      'Color-coded bumper seals available for system identification',
      'Locking handle and bumper seals',
      'Maintenance and service friendly',
      '3/4" and 1" Female NPT or hose-barb port options',
      'Patent-pending dual-interlock design',
    ],
  },

  // ── Refrigerant (1) ─────────────────────────────────────────────────────
  {
    sku: 'EATON-5400',
    title: 'Eaton 5400 — Low-Air-Inclusion Refrigerant Quick Coupler',
    series: '5400',
    interchangeStandard: null,
    applicationClass: 'Refrigerant',
    valving: 'Thread-to-Connect',
    availableSizes: '1/4" (-04), 1/2" (-08), 3/4" (-12), 1" (-16)',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated); Brass and Steel adapters available',
    availableSealMaterials: 'Neoprene',
    availablePortThreads: 'No-adapter, SAE 37° (JIC), Braze Tubing Adapter (multiple tube ODs)',
    availableHalves: 'Male, Female, Complete Set, Dust Cap (with gasket), Dust Plug (with gasket), JIC adapters, Braze adapters',
    connectionMethod: 'Thread-to-Connect',
    flushFace: false,
    connectUnderPressure: true,
    maxOperatingPressureBar: 207,
    minBurstPressureBar: 621,
    ratedFlowLpmMax: 284,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Mobile A/C OEM refrigerant couplers',
    oneLiner: 'Low-air-inclusion thread-to-connect refrigerant coupler with tubular valve construction — for mobile air conditioning, refrigerant transfer, and gaseous and liquid HVAC service. Brazed or threaded end connections; lock washer / jam nut for bulkhead mounting.',
    applications: [
      'Mobile air conditioning service (heavy-duty trucks, off-highway equipment)',
      'Refrigerant transfer service (R134a / R1234yf / equivalent)',
      'HVAC service line connections',
      'Bulk fluid and gaseous transfer',
    ],
    partNumberExamples: [
      '5400-S2-4',
      '5400-S5-4',
      '5400-S2-8',
      '5400-S5-12',
      '5410-S17-4-4',
      '5410-S14-6-8',
      '5401-S17-8-8',
      '5400-S6-8',
      '5400-S8-12',
    ],
    notableFeatures: [
      'Low air inclusion during connection',
      'Tubular valve construction for low fluid loss',
      'Thread-together latching — vibration-resistant',
      'Connect-under-pressure capability',
      'Neoprene seal compound (refrigerant-compatible)',
      'Multiple end-connection styles: no-adapter, SAE 37° (JIC), braze tubing adapter',
      'Lock washer and jam nut standard for bulkhead mounting',
      'Dust cap / plug with gasket included',
    ],
  },

  // ── Air Couplings (3) ───────────────────────────────────────────────────
  {
    sku: 'EATON-FD40',
    title: 'Eaton FD40 — MIL-C-4109 Push-to-Connect Air Quick Coupler',
    series: 'FD40',
    interchangeStandard: 'MIL-C-4109',
    applicationClass: 'Air',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4", 3/8", 1/2"',
    availableBodyMaterials: 'Female: Brass; Male: Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT, Male NPT',
    availableHalves: 'Male, Female, Dust Cap/Plug',
    connectionMethod: 'Push-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 21,
    minBurstPressureBar: 560,
    ratedFlowLpmMax: 80,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'Industrial Interchange (MIL-C-4109), ARO 310, Hansen 3000, Foster 3 Series',
    oneLiner: 'One-hand push-to-connect industrial-interchange air coupler with ball latching — MIL-C-4109 dimensional compatibility for compressed air and pneumatic tool service. Brass female / steel male halves; 360° swivel prevents hose kinking.',
    applications: [
      'Compressed air supply',
      'Pneumatic tool service',
      'Workshop air-line drops',
      'Mobile compressor air supply',
      'MIL-C-4109 industrial-interchange replacement',
    ],
    partNumberExamples: [
      'FD40-1013-04-04',
      'FD40-1014-04-04',
      'FD40-1054-06-06',
      'FD40-1055-08-08',
    ],
    notableFeatures: [
      'Meets MIL-C-4109 dimensional requirements (industrial interchange)',
      'Automatic sleeve for one-hand push-to-connect operation',
      'Ball latching mechanism with pin latch',
      'Protective sleeve lock prevents accidental disconnection',
      '360° swivels eliminate hose kinking',
      'Female half: brass body with self-sealing poppet valve',
      'Male half: carbon steel zinc-plated, straight-through non-valved design',
      'Both Female NPT and Male NPT port thread options',
    ],
  },
  {
    sku: 'EATON-FD41',
    title: 'Eaton FD41 — ARO 210 Interchange Air Quick Coupler',
    series: 'FD41',
    interchangeStandard: 'ARO 210',
    applicationClass: 'Air',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4" body size only',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Buna-N',
    availablePortThreads: 'Female NPT, Male NPT',
    availableHalves: 'Male, Female',
    connectionMethod: 'Push-to-Connect',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 21,
    minBurstPressureBar: 560,
    ratedFlowLpmMax: 80,
    vacuumRatingInHg: 28,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'ARO 210 series',
    oneLiner: 'One-hand push-to-connect air coupler designed to interchange with ARO 210 Series — high flow with low pressure drop for peak pneumatic tool performance. Self-sealing female with straight-through male.',
    applications: [
      'Compressed air supply (ARO-equipped facilities)',
      'Pneumatic tool service',
      'ARO 210 replacement service',
    ],
    partNumberExamples: [
      'FD41-1000-04-04',
      'FD41-1013-04-04',
      'FD41-1014-04-04',
    ],
    notableFeatures: [
      'Direct interchange with ARO 210 Series',
      'Self-sealing female half',
      'Straight-through male half — high flow with low pressure drop',
      'Automatic sleeve for one-hand push-to-connect operation',
      '360° swivel — eliminates hose kinking',
      'Carbon steel with zinc trivalent chromate plating',
    ],
  },
  {
    sku: 'EATON-FD43',
    title: 'Eaton FD43 — MIL-C-4109 Manual-Retract Air Coupler',
    series: 'FD43',
    interchangeStandard: 'MIL-C-4109',
    applicationClass: 'Air',
    valving: 'Valved (Self-sealing Poppet)',
    availableSizes: '1/4", 3/8", 1/2"',
    availableBodyMaterials: 'Carbon Steel (zinc trivalent chromate plated)',
    availableSealMaterials: 'Neoprene',
    availablePortThreads: 'Female NPT, Male NPT',
    availableHalves: 'Female (uses FD40 male tips), SOCKETLESS™ hose end, Dust Cap/Plug',
    connectionMethod: 'Manual Retract',
    flushFace: false,
    connectUnderPressure: false,
    maxOperatingPressureBar: 21,
    minBurstPressureBar: 560,
    ratedFlowLpmMax: 80,
    vacuumRatingInHg: null,
    tempMinC: -40,
    tempMaxC: 100,
    interchangeWith: 'MIL-C-4109 industrial interchange (uses FD40 male tips)',
    oneLiner: 'Manual-retract ball-latch industrial-interchange air coupler designed specifically for compressed air. Uses Eaton FD40 Series male tips. Protective collar prevents accidental snagging and disconnection.',
    applications: [
      'Compressed air supply with anti-snag protection',
      'Pneumatic tool service in cluttered environments',
      'MIL-C-4109 industrial interchange',
    ],
    partNumberExamples: [
      'FD43-1001-04-04',
      'FD43-1001-06-06',
      'FD43-1001-08-08',
      'FD43-1011-04-04',
    ],
    notableFeatures: [
      'Manual-retract ball latch — no accidental disconnect',
      'Protective collar prevents snagging in cluttered environments',
      'Uses Eaton FD40 Series male tips',
      '360° swivel — eliminates hose kinking',
      'Neoprene seals',
      'Carbon steel zinc-plated body',
      'Available with SOCKETLESS™ hose end',
    ],
  },
]

// ── New spec template (19 fields) ─────────────────────────────────────────

const QUICK_COUPLER_SPEC: SpecTemplatePayload = {
  slug: 'quick-coupler-spec',
  name: 'Quick Coupler Spec',
  description:
    'Spec template for hydraulic, pneumatic, refrigerant and diagnostic quick-disconnect couplers. Captures interchange standard, valving style, available variants (sizes, body / seal materials, port threads, halves), connection method, and performance envelope. Variant axes are enumerated as text fields rather than constrained selects so a single product can represent an entire series catalogue.',
  position: 23,
  fields: [
    {
      key: 'series',
      label: 'Series',
      dataType: 'text',
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'interchange_standard',
      label: 'Interchange Standard',
      dataType: 'text',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'application_class',
      label: 'Application Class',
      dataType: 'select',
      options: [
        'Hydraulic',
        'Farm Hydraulic',
        'Air',
        'Refrigerant',
        'Diagnostic',
        'Specialty',
      ],
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'valving',
      label: 'Valving',
      dataType: 'select',
      options: [
        'Valved (Self-sealing Poppet)',
        'Non-Valved',
        'Pusher-Style',
        'Flush Face (No-Spill)',
        'Bleed Valve',
        'Dry Break',
        'Thread-to-Connect',
        'Sampling Valve',
        'Multi-Component Kit',
      ],
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'available_sizes',
      label: 'Available Body Sizes',
      dataType: 'text',
      group: 'Variants',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 10,
    },
    {
      key: 'available_body_materials',
      label: 'Available Body Materials',
      dataType: 'text',
      group: 'Variants',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'available_seal_materials',
      label: 'Available Seal Materials',
      dataType: 'text',
      group: 'Variants',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
    {
      key: 'available_port_threads',
      label: 'Available Port Thread Types',
      dataType: 'text',
      group: 'Variants',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
    {
      key: 'available_halves',
      label: 'Available Coupling Halves',
      dataType: 'text',
      group: 'Variants',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 14,
    },
    {
      key: 'connection_method',
      label: 'Connection Method',
      dataType: 'select',
      options: [
        'Push-Pull Ball Latch',
        'Push-to-Connect',
        'Thread-to-Connect',
        'Manual Retract',
        'Arc Latch',
      ],
      group: 'Construction',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 20,
    },
    {
      key: 'flush_face',
      label: 'Flush Face / No-Spill',
      dataType: 'boolean',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 21,
    },
    {
      key: 'connect_under_pressure',
      label: 'Connect Under Pressure',
      dataType: 'boolean',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 22,
    },
    {
      key: 'max_operating_pressure_bar',
      label: 'Maximum Operating Pressure',
      unit: 'bar',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 30,
    },
    {
      key: 'min_burst_pressure_bar',
      label: 'Minimum Burst Pressure',
      unit: 'bar',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 31,
    },
    {
      key: 'rated_flow_lpm_max',
      label: 'Rated Flow (Largest Size)',
      unit: 'L/min',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 32,
    },
    {
      key: 'vacuum_rating_in_hg',
      label: 'Vacuum Rating',
      unit: 'in./Hg',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 33,
    },
    {
      key: 'temp_min_c',
      label: 'Operating Temperature Min',
      unit: '°C',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 34,
    },
    {
      key: 'temp_max_c',
      label: 'Operating Temperature Max',
      unit: '°C',
      dataType: 'number',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 35,
    },
    {
      key: 'interchange_with',
      label: 'Interchanges With (Competitor Brands)',
      dataType: 'text',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 40,
    },
  ],
}

// ── Category (1) ──────────────────────────────────────────────────────────

const QUICK_COUPLERS_CATEGORY: CategoryPayload = {
  slug: 'quick-couplers',
  name: 'Quick Couplers',
  parentSlug: 'hoses-fittings',
  shortDescription:
    'Hydraulic, pneumatic, refrigerant and diagnostic quick-disconnect couplers — Eaton Aeroquip catalogue covering ISO 7241/1 Series A and B, ISO 16028, MIL-C-4109, ARO 210, SAE J1502, ISO 5675, NFPA T3.20.15 HTMA and Enerpac interchange standards.',
  position: 31,
  isPublished: true,
  defaultSpecTemplateSlug: 'quick-coupler-spec',
  seoTitle: 'Quick-Disconnect Couplers — Hydraulic, Air, Refrigerant, Diagnostic',
  seoDescription:
    'Quick-disconnect coupler catalogue covering ISO 7241/1, ISO 16028, MIL-C-4109, ARO 210 and other interchange standards. Eaton Aeroquip range stocked for UAE / GCC fluid-power service.',
}

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-10-aeroquip-quick-couplers',
    description:
      'Eaton Aeroquip quick-disconnect coupler catalogue — 27 series-level products covering hydraulic, farm, diagnostic, specialty, refrigerant and air couplings. New spec template + new category + replaces Quick Couplers megamenu placeholder leaves.',
  },

  brands: [],

  categories: [QUICK_COUPLERS_CATEGORY],

  specTemplates: [QUICK_COUPLER_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'hoses-fittings',
    parentSubLabel: 'Quick Couplers',
    replacements: [
      { label: 'Quick Couplers', categorySlug: 'quick-couplers' },
    ],
  },

  products: PRODUCTS.map(makeProduct),
}

export default batch
