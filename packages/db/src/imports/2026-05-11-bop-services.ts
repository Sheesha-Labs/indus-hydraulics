/**
 * Blowout Preventer (BOP) — Services
 * 2026-05-11
 *
 * Adds 13 BOP service SKUs (8 Tier 1 + 5 Tier 2) under the BOP catalogue
 * tree. Services often have higher margins than equipment / parts and
 * create recurring relationships with drilling contractors and operator
 * vendor lists across the GCC.
 *
 * Companion to:
 *   - 2026-05-11-bop-equipment.ts  → foundation (brands, categories, templates, megamenu) + 17 equipment SKUs
 *   - 2026-05-11-bop-spares.ts     → 18 spares & cross-sell bundles
 *
 * This file does NOT redeclare brands / categories / templates — they are
 * created by the equipment file. Run the equipment file FIRST. Re-running
 * this file is fully idempotent (add-only mode).
 *
 * Pricing: RFQ-only (listPrice = null), AED. Status: active. Country of
 * origin defaults to UAE (services delivered ex-Dubai HQ with regional
 * field crews based in KSA, Iraq, Oman as required).
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-services.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-services.ts
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Spec-template patch ───────────────────────────────────────────────────
//
// Additive extension to bop-service-spec.pressure_class options — adds
// 'Multiple' as a sentinel for services that cover several pressure classes
// (e.g. pressure-testing, recertification, redress). Same additive-options
// pattern as the hammer-unions PR extended flow-iron-spec.figure_class.
// Idempotent — re-running this file leaves the 13 service products unchanged.

const BOP_SERVICE_SPEC_PATCH: SpecTemplatePayload = {
  slug: 'bop-service-spec',
  name: 'BOP Service',
  description:
    'Spec template for BOP services — pressure testing, recertification, redress, stack rentals, koomey service, field service crew, CT / snubbing / wireline BOP service, RCD service, training. API STD 53 / API 16A / 16C / 16D defaults; sour-service capability called out per service.',
  position: 32,
  fields: [
    {
      key: 'pressure_class',
      label: 'Pressure Class Coverage',
      dataType: 'select',
      options: ['2K', '3K', '5K', '10K', '15K', '20K', 'Multiple', 'N/A'],
      helpText: 'Use "Multiple" for services that span 5K / 10K / 15K stacks.',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 4,
    },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Service input shape ───────────────────────────────────────────────────

type ServiceInput = {
  sku: string
  title: string
  serviceType: string
  apiStandard: string
  equipmentCompatibility: string
  pressureClassCoverage: string
  serviceClass: 'Standard' | 'Sour Service (NACE MR0175)' | 'HPHT' | 'HPHT + Sour'
  serviceEnvironment: 'Onshore' | 'Offshore' | 'Subsea' | 'All'
  oneLiner: string
  scopeBlurb: string
  scopeItems: string[]
  deliverables: string
  certifications: string
  coverageArea: string
  typicalLeadTime: string
  applications: string[]
  oemKeywords: string[]
  faqExtras?: FaqEntry[]
  leadTimeDays: number
}

// ── HTML description builder for services ─────────────────────────────────

function buildServiceHtml(g: ServiceInput): string {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  const sourLine = isSour
    ? 'Sour-service capable — H₂S-trained crews, sour-service rated test fittings, and NACE MR0175-compliant elastomer / metal-trim selection on all replacement parts. Required across Saudi Aramco, ADNOC, KOC, PDO, and QatarEnergy default specifications.'
    : 'Sweet-service standard scope. Sour-service uplift available on request.'
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const scope = g.scopeItems.map((s) => `<li>${escape(s)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')

  return `<p>The <strong>${escape(g.title)}</strong> is delivered to <strong>${escape(g.apiStandard)}</strong> on the equipment listed below. ${escape(g.scopeBlurb)} ${escape(sourLine)}</p>
<h3>Scope of work</h3>
<ul>
${scope}
</ul>
<h3>Equipment compatibility</h3>
<p>This service is configured for: <strong>${escape(g.equipmentCompatibility)}</strong>. Indus carries the matched-OEM redress kits, soft goods, and test fittings to perform the work without sub-contracting parts supply — single point of contract for parts + service.</p>
<h3>OEM equipment lines covered</h3>
<ul>
${oemKw}
</ul>
<h3>Pressure-class coverage</h3>
<p>${escape(g.pressureClassCoverage)} pressure class. Service class: ${escape(g.serviceClass)}. Service environment: ${escape(g.serviceEnvironment)}.</p>
<h3>Deliverables</h3>
<p>${escape(g.deliverables)}</p>
<h3>Certifications held by Indus for this service</h3>
<p>${escape(g.certifications)}</p>
<h3>Coverage area</h3>
<p>Indus delivers this service across: <strong>${escape(g.coverageArea)}</strong>. Field-crew travel and accommodation included in the daily rate; door-to-rig logistics for parts is handled by Indus.</p>
<h3>Typical lead time</h3>
<p>${escape(g.typicalLeadTime)}</p>
<h3>Why this service typically has demand in the GCC</h3>
<ul>
${apps}
</ul>
<h3>How to engage</h3>
<p>RFQ with: (a) BOP equipment list (OEM, model, bore, pressure class, serial number, last test / recert date), (b) service scope (e.g., "5-year recert + redress" or "weekly pressure test for 90 days"), (c) location and access constraints (rig name, base, escort requirement), (d) certification package required by your operator (Aramco SAEP, ADNOC SPC, KOC, PDO, etc.), (e) IKTVA / ICV documentation requirement, (f) target start window. Indus quotes a fixed scope-and-rate against your specification — sales@indushydraulics.com or WhatsApp +971 (Dubai HQ).</p>`
}

// ── FAQ generator for services ────────────────────────────────────────────

function buildServiceFaqs(g: ServiceInput): FaqEntry[] {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  const base: FaqEntry[] = [
    {
      q: 'What standard does Indus deliver this service to?',
      a: `${g.apiStandard}. Indus is set up to deliver the work, the documentation pack, and the certification trail required by Saudi Aramco (SAEP / GI standards), ADNOC (drilling manual + SPC compliance), KOC, PDO, BAPCO, QatarEnergy, and Iraq south operator-vendor lists. Provide your operator's reference standard on the RFQ and we will mirror it.`,
    },
    {
      q: 'What equipment can Indus service?',
      a: `${g.equipmentCompatibility}. The OEM lines covered include ${g.oemKeywords.join(', ')}. Indus is not an authorised service centre of these OEMs but every job is performed against the OEM service manual, with OEM-equivalent or genuine OEM parts, and a complete documentation pack. For OEM-stamped service specifically (e.g., Cameron-stamped 5-year recert), call us — we can route through the OEM service centre on a sub-contracted basis with appropriate uplift.`,
    },
    {
      q: 'Is this service sour-service capable?',
      a: isSour
        ? `Yes — fully sour-service capable. H₂S-trained crews (current SAEP-1142 or equivalent), sour-service rated test fittings, NACE MR0175-compliant elastomer and metal-trim on all replacement parts. Provide the H₂S concentration, partial pressure, temperature, and chloride content on the RFQ for a final material-selection sign-off.`
        : `Standard scope is sweet-service. Sour-service uplift is available on request — typically a 15–25% rate uplift covering H₂S-trained crew certification, sour-service test fittings, and NACE MR0175 parts substitution. Confirm on the RFQ.`,
    },
    {
      q: 'What deliverables come with the service?',
      a: g.deliverables,
    },
    {
      q: 'What certifications does Indus hold to bid this service?',
      a: g.certifications,
    },
    {
      q: 'Where does Indus deliver this service?',
      a: `Indus delivers across: ${g.coverageArea}. Dubai HQ acts as the parts and crew base; regional field crews mobilise into KSA, Iraq, Oman, Kuwait, Qatar, and Bahrain as required. Travel, accommodation, and visa support are included in the daily rate.`,
    },
    {
      q: 'What is the typical lead time?',
      a: g.typicalLeadTime,
    },
    {
      q: 'Can Indus supply on Aramco / ADNOC / KOC vendor terms?',
      a: `Yes. Indus is set up for the GCC NOC procurement reality — Saudi Aramco IKTVA, ADNOC ICV, KOC, PDO, QatarEnergy, BAPCO, and Iraq vendor lists. We can deliver against your purchase order with the exact certification package and INCOTERMS each NOC requires. ICV / IKTVA local-content credit position is confirmed on the RFQ.`,
    },
  ]
  return g.faqExtras ? [...base, ...g.faqExtras] : base
}

// ── Translator ────────────────────────────────────────────────────────────

function makeServiceProduct(g: ServiceInput): ProductImportPayload {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  const focusKw =
    `${g.serviceType.toLowerCase()} ${g.apiStandard.toLowerCase()}${isSour ? ' sour' : ''} gcc`.slice(0, 120)
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: 'indus',
    categorySlug: 'bop-services',
    specTemplateSlug: 'bop-service-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: 'UAE',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildServiceHtml(g),
    specs: {
      service_type: g.serviceType,
      api_standard: g.apiStandard,
      equipment_compatibility: g.equipmentCompatibility,
      pressure_class: g.pressureClassCoverage,
      service_class: g.serviceClass,
      service_environment: g.serviceEnvironment,
      deliverables: g.deliverables,
      certifications: g.certifications,
      coverage_area: g.coverageArea,
      typical_lead_time: g.typicalLeadTime,
    },
    faqs: buildServiceFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: focusKw,
  }
}

// ── Service data — 13 SKUs (Tier 1 + Tier 2) ──────────────────────────────

const COVERAGE_FULL_GCC =
  'United Arab Emirates (Abu Dhabi, Dubai), Kingdom of Saudi Arabia (Eastern Province + Khurais / Hawiyah / Haradh / Khuff), Sultanate of Oman (PDO and OQ blocks), State of Kuwait (KOC north and south), State of Qatar (QatarEnergy), Kingdom of Bahrain (BAPCO), and Iraq south (Basra)'

const COVERAGE_OFFSHORE =
  'ADNOC offshore (Lower Zakum, Upper Zakum, Hail & Ghasha satellite jack-ups), Saudi Aramco offshore (Marjan, Safaniyah, Manifa), and equivalent GCC offshore platforms / jack-ups. Mobilisation by helicopter or supply boat on operator schedule.'

const SERVICES: ServiceInput[] = [
  // ── Tier 1 — 8 services ─────────────────────────────────────────────────
  {
    sku: 'IH-BOP-SVC-PRESSURE-TEST-API53-INDUS',
    title: 'BOP Pressure Testing Service per API STD 53 (5K / 10K / 15K Stacks)',
    serviceType: 'BOP Pressure Testing',
    apiStandard: 'API STD 53',
    equipmentCompatibility:
      'All Cameron U / UII / T, Shaffer LWS / SL / NXT, Hydril GK / GX / V, NOV Pressure Control, WOM, and Jereh BOP stacks; choke & kill manifolds; control units',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'BOP pressure testing per API STD 53 — both low-pressure (250–350 psi) and high-pressure tests on 5K / 10K / 15K stacks. Witnessed test reports, chart-recorder traces, and 3rd-party verification on request. Highest-frequency BOP service in the GCC.',
    scopeBlurb:
      'Full pressure-test cycle per API STD 53 — BOP rams, annular, choke & kill manifold, ram blocks, kill line, choke line, wellhead seals, and ancillary connections. Both low-pressure (250–350 psi) and high-pressure (rated WP) test phases.',
    scopeItems: [
      'Pre-test BOP function check (open / close / pressure-build cycle on every cavity)',
      'Low-pressure test phase: 250–350 psi for 5 minutes per cavity (per API STD 53)',
      'High-pressure test phase: full rated working pressure for 10 minutes per cavity (per API STD 53)',
      'Annular preventer test on all sizes of pipe / casing in use',
      'Blind-shear ram test (sealing + bore-isolation function)',
      'Choke & kill manifold pressure test (per API 16C)',
      'Wellhead seal and BOP-stack-connection leak test',
      'Chart-recorder trace + digital test-report PDF for every test',
      '3rd-party witness (TUV / DNV / Lloyd\'s) on operator request',
    ],
    deliverables:
      'Per-test deliverables: (a) chart-recorder trace (raw + annotated), (b) digital test-report PDF with timestamps and pressure-hold envelope, (c) BOP stack drawing showing tested cavities, (d) sour-service certification tag, (e) operator-signed acceptance form. 3rd-party witness reports (TUV / DNV / Lloyd\'s) on request.',
    certifications:
      'API Q1 quality system, API Q2 service quality (where required), ASNT NDT Level II/III personnel, IWCF Level 4 well-control crew leads, SAEP-1142 (Aramco) / ADNOC SPC (UAE) prequalified.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Pressure-test crews mobilise from Dubai within 48–72 hours of operator confirmation. Per-test execution is typically 2–4 hours on a fully-rigged-up stack. For weekly / 14-day / 21-day recurring test schedules, Indus places a stationed crew at the rig for the contract duration.',
    applications: [
      'API STD 53 mandates 14- or 21-day BOP test cycles on every active rig',
      'Aramco revised Well Control Manual (2023+) tightened H₂S testing — drives demand for sour-service test capability',
      'ADNOC follows API STD 53 and adds platform-specific test schedules',
      'Workover / well-intervention contractors test BOP at every job',
      'Pre-spud BOP test is mandatory on every new well',
    ],
    oemKeywords: ['Cameron U BOP testing', 'Shaffer SL BOP testing', 'Hydril GK testing', 'NOV BOP testing', 'API STD 53 BOP testing'],
    leadTimeDays: 3,
  },
  {
    sku: 'IH-BOP-SVC-RECERT-5YR-API16A-INDUS',
    title: 'BOP API 16A 5-Year Major Inspection & Recertification',
    serviceType: '5-Year Major Inspection & Recertification',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron U / UII / UM, NOV Shaffer LWS / SL / NXT, Hydril GK / GX, T3, Worldwide Oilfield Machine BOPs',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'BOP API 16A 5-year major inspection & recertification — full strip-down, NDT (MPI / UT / hardness / dimensional / dye-penetrant), reassembly, and FAT. Required by API STD 53 every 5 years; Aramco enforces equivalents on land BOPs.',
    scopeBlurb:
      'Complete API 16A 5-year recertification scope — full BOP strip-down, replacement of all elastomer soft goods, NDT inspection of every metallic component, hardness verification per NACE MR0175, dimensional inspection against the OEM datum, dye-penetrant inspection on critical surfaces, reassembly, hydrostatic shell test, function test, and Factory Acceptance Test (FAT) report.',
    scopeItems: [
      'Receipt inspection and as-found condition report',
      'Full BOP strip-down to component level (body, bonnets, ram cavities, operating cylinders)',
      'NDT inspection of all metallic components — magnetic-particle inspection (MPI), ultrasonic testing (UT), hardness testing per NACE MR0175 (max 22 HRC for sour service), dimensional inspection',
      'Dye-penetrant inspection on critical sealing surfaces',
      'Replacement of all elastomer soft goods (bonnet seals, ram packers, annular element, piston seals)',
      'Reconditioning or replacement of damaged metallic components (ram blocks, bonnet faces, hub faces)',
      'Reassembly per OEM service manual',
      'Hydrostatic shell test at 1.5× rated working pressure',
      'Function test — open / close / pressure-build on every cavity',
      'Factory Acceptance Test (FAT) report and recertification stamp',
    ],
    deliverables:
      'Per-BOP deliverables: (a) as-found condition report with photos, (b) NDT report (MPI / UT / hardness / dimensional / DP) per component, (c) replaced-parts list with batch / lot traceability, (d) hydrostatic shell test certificate at 1.5× WP, (e) function-test report per API STD 53, (f) Factory Acceptance Test (FAT) report, (g) API 16A recertification stamp + certificate (5-year validity), (h) sour-service NACE MR0175 / ISO 15156 compliance certificate where applicable.',
    certifications:
      'API 16A licence (BOP equipment recertification), API Q1 quality system, ISO 9001 / 14001 / 45001, ASNT NDT Level II/III personnel, NACE / SSPC coating inspectors where coating is in scope.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Single BOP recert: 6–10 weeks ex-Dubai workshop. Drilling-contractor fleet recerts (multiple stacks): scheduled in batches across 3–6 months. Replacement BOP rental available during the recert window — see "BOP Stack Rental" SKU.',
    applications: [
      'Required every 5 years per API STD 53 (and equivalent operator standards)',
      'Aramco SAEP-style equivalents enforced on land BOPs',
      'Drilling contractors own the BOPs — recurring scope every 5 years per stack',
      'ADNOC Drilling, ADES, KDC, NDC, Nabors, H&P-KCA Deutag fleet recerts',
      'Pre-purchase / acquisition condition assessment',
    ],
    oemKeywords: ['Cameron U 5-year recert', 'Shaffer SL 5-year recert', 'Hydril GK 5-year recert', 'API 16A recertification', 'BOP overhaul'],
    leadTimeDays: 60,
  },
  {
    sku: 'IH-BOP-SVC-ANNUAL-REDRESS-INDUS',
    title: 'Annual BOP Redress (12-Month Elastomer Service per Aramco Specification)',
    serviceType: 'Annual Redress / Elastomer Service',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron U / UII / T, Shaffer LWS / SL / NXT, Hydril GK / GX, NOV Pressure Control surface BOPs',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'Onshore',
    oneLiner:
      'Annual 12-month BOP elastomer redress per Saudi Aramco specification — replace bonnet seals, ram packers, annular element + head seal, plus ram-block re-machining where surface condition requires it. Higher-frequency than the 5-year recert; smaller-ticket but recurring scope across the fleet.',
    scopeBlurb:
      'Annual elastomer redress on each BOP — strip the bonnets, replace all wearing soft goods (top seal, front packer, side packers per cavity, bonnet seals, annular element + head seal + piston seal), re-machine ram-block sealing surfaces if dimensional inspection shows wear, and reassemble. Lighter scope than a 5-year recert but performed every 12 months per Aramco-style specifications.',
    scopeItems: [
      'BOP function check + as-found condition report',
      'Bonnet open + ram block extraction (per cavity)',
      'Replace top seal, front packer, side packers (per cavity) with HNBR / AFLAS sour-service grade',
      'Replace bonnet seals (primary + secondary backup)',
      'Annular element replacement + head seal + piston seal',
      'Ram-block sealing surface dimensional inspection — re-machine if outside tolerance',
      'Reassemble per OEM service manual',
      'Function test + low-pressure leak test (250–350 psi)',
      'High-pressure operability test at WP',
      'Annual redress certificate + replaced-parts traceability',
    ],
    deliverables:
      'Per-BOP deliverables: (a) as-found condition report with photos, (b) replaced-parts list with batch / lot traceability and recommended-use-by dates, (c) ram-block dimensional inspection report, (d) function-test report, (e) low-pressure + high-pressure operability test certificate, (f) annual redress certificate (12-month validity), (g) sour-service NACE MR0175 elastomer compliance documentation.',
    certifications:
      'API Q1 quality system, ASNT NDT Level II personnel for ram-block inspection, IWCF Level 4 crew leads, SAEP-1142 / ADNOC SPC prequalified.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Per BOP: 5–10 working days at the rig site (bonnet-open redress) or 2–3 weeks ex-Dubai workshop (full strip + reassemble). Coordinated with the rig\'s 12-month maintenance window. Replacement BOP rental available during workshop redress.',
    applications: [
      'Saudi Aramco specifies 12-month elastomer replacement on BOPs',
      'ADNOC, KOC, PDO, QatarEnergy follow equivalent annual redress schedules',
      'Driver of recurring HNBR / AFLAS elastomer-kit sales',
      'Lighter-touch alternative to mid-life 5-year recert',
      'Pre-mobilisation refresh on rigs returning from cold-stack',
    ],
    oemKeywords: ['Cameron U annual redress', 'Shaffer SL annual elastomer redress', 'Hydril GK annual element replacement', 'BOP 12-month redress'],
    leadTimeDays: 14,
  },
  {
    sku: 'IH-BOP-SVC-RENTAL-11-10K-WORKOVER-INDUS',
    title: 'BOP Stack Rental — 11" 10K Workover Stack, Sour Service (NACE MR0175)',
    serviceType: 'BOP Stack Rental',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron U 11" 10K double-ram + Hydril GK 11" 10K annular + 3-1/16" 10K choke & kill manifold + Koomey Type 80 control unit',
    pressureClassCoverage: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'Onshore',
    oneLiner:
      '11" 10K workover BOP stack rental — Cameron U style double-ram + Hydril GK annular + 3-1/16" 10K choke & kill manifold + Koomey Type 80 control unit. The #1 rental class in the GCC; sour-service rated, freshly tested before each mobilisation.',
    scopeBlurb:
      'Complete workover-stack rental — Cameron U 11" 10K double-ram BOP + Hydril GK 11" 10K annular + matched 3-1/16" 10K choke & kill manifold + Koomey Type 80 control unit. Rental rate covers daily on-rig use; mobilisation, de-mobilisation, freshly-tested status, and operator-spec consumables included on agreed terms.',
    scopeItems: [
      'Pre-mobilisation full pressure test per API STD 53 (low + high)',
      'Mobilisation from Dubai to rig site (truck / trailer logistics)',
      'On-rig hand-over with function test and ram-block inventory',
      'Replacement parts pool on standby (bonnet seals, ram packers, ring gaskets) for the rental window',
      'De-mobilisation strip / inspect / refresh-elastomer cycle on return',
      'Replacement BOP rental during major recerts on operator-owned BOPs',
      'Sour-service trim throughout (HNBR elastomers, B7M bolting, Inconel-clad ring grooves)',
    ],
    deliverables:
      'Per-rental deliverables: (a) freshly-tested API STD 53 test certificate (≤ 14 days old), (b) BOP stack inventory with serial numbers, ram-block details, last-recert date for every component, (c) on-rig hand-over function test report, (d) replacement-parts pool list, (e) on-return condition report and refresh-cycle deliverables.',
    certifications:
      'API 16A on the rented BOPs, API 16C on the choke & kill manifold, API 16D on the control unit. Indus Q1 quality system. NACE MR0175 sour-service elastomers and bolting on every rental.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Mobilisation from Dubai within 5–7 working days of rental confirmation. For longer-duration rentals (90+ days), the stack is reserved against the operator\'s campaign schedule. Short-notice (24–48 hour) mobilisation possible if rental fleet is on stand-by.',
    applications: [
      'Workover and well-intervention contractors (the highest-volume rental class in the GCC)',
      'Operator-owned BOPs in 5-year recert / requiring replacement during recert window',
      'Pre-completion rig-up where the operator has not yet purchased the BOP',
      'Aramco / ADNOC Drilling Island Services / KDC workover / PDO workover JV use cases',
    ],
    oemKeywords: ['BOP stack rental Dubai', 'Cameron U 11" 10K rental', '11" 10K workover BOP rental', 'GCC BOP rental'],
    leadTimeDays: 7,
  },
  {
    sku: 'IH-BOP-SVC-KOOMEY-RECERT-API16D-INDUS',
    title: 'Accumulator (Koomey) Service & API 16D 5-Year Recertification',
    serviceType: 'Accumulator (Koomey) Service',
    apiStandard: 'API 16D',
    equipmentCompatibility:
      'Koomey Type 80 / Type 100 BOP control units (Cameron lineage), Pacseal Type 80, NOV Pressure Control Type 80, Jereh Type 80',
    pressureClassCoverage: 'N/A',
    serviceClass: 'Standard',
    serviceEnvironment: 'All',
    oneLiner:
      'Koomey accumulator service & API 16D 5-year recertification — pre-charge nitrogen, accumulator-bottle hydrotest, SPM valve overhaul, regulator service, pump rebuild, function test. Often rolled into BOP recert scope but listed separately because search-volume justifies its own page.',
    scopeBlurb:
      'API 16D 5-year recertification on Koomey-style BOP control units — strip-down of every soft-goods component, hydrostatic test of every accumulator bottle, SPM valve seal-kit replacement, regulator overhaul, air-hydraulic and electric pump rebuild, function test, and recertification stamp.',
    scopeItems: [
      'As-found condition report — full unit inventory and SPM-valve performance map',
      'Accumulator bladder / piston pre-charge nitrogen check + replacement on every bottle',
      'Hydrostatic test on every accumulator bottle at 1.5× design pressure',
      'SPM valve overhaul — replace 1" and 3/4" seal kits on every station',
      'Annular and manifold regulator overhaul — replace diaphragm + valve trim',
      'Air-hydraulic pump rebuild',
      'Electric pump rebuild',
      'Pilot control hose pressure test + replacement on any failed line',
      'Reassembly per API 16D and OEM service manual',
      'Function test — closing-volume verification on simulated BOP load',
      'API 16D recertification stamp + 5-year validity certificate',
    ],
    deliverables:
      'Per-unit deliverables: (a) as-found condition + performance report, (b) bottle hydrotest certificate per accumulator, (c) replaced-parts list with batch traceability, (d) regulator and pump rebuild reports, (e) function-test report including closing-volume verification, (f) API 16D recertification stamp + 5-year validity certificate.',
    certifications:
      'API 16D licence, API Q1 quality system, ASNT NDT Level II/III for bottle hydrotest, IWCF Level 4 crew leads.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Single Koomey unit: 4–6 weeks ex-Dubai workshop. Combined BOP + Koomey scope: typically 8–12 weeks. Mobile / on-rig service possible for SPM valve repair and regulator overhaul (lighter scope) — 5–7 days per unit.',
    applications: [
      'Required every 5 years per API 16D (and operator standards)',
      'Often coupled with BOP 5-year recert for combined scope',
      'Driver of Koomey 5-Year Soft Goods Kit sales (see BOP Spare Parts)',
      'Pre-mobilisation refresh on units returning from cold-stack',
    ],
    oemKeywords: ['Koomey Type 80 recert', 'API 16D BOP control unit recert', 'Pacseal Type 80 service', 'BOP closing unit overhaul'],
    leadTimeDays: 35,
  },
  {
    sku: 'IH-BOP-SVC-CHOKE-KILL-RECERT-API16C-INDUS',
    title: 'Choke & Kill Manifold Testing & 5-Year Recertification (API 16C)',
    serviceType: 'Choke & Kill Service',
    apiStandard: 'API 16C',
    equipmentCompatibility:
      'Cameron 3-1/16" / 4-1/16" 10K / 15K choke manifolds, NOV choke manifolds, McEvoy / Wood Group choke manifolds, WOM choke manifolds',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'Choke & kill manifold testing & 5-year recertification per API 16C — gate valve seat / stem replacement, choke trim replacement, hydrostatic test, function test. Aramco requires secondary choke / kill on 10K+ systems; create dedicated SKU pages by ID and pressure rating.',
    scopeBlurb:
      'API 16C 5-year recertification on choke & kill manifolds — full strip-down of every gate valve and choke, replacement of seats / stems / packing on every gate valve, replacement of trim on every choke, hydrostatic shell test at 1.5× WP, function test, and recertification stamp.',
    scopeItems: [
      'As-found inventory of every gate valve, choke, and connection',
      'Strip-down of every gate valve — replace seats, stem packing, body O-rings',
      'Strip-down of every choke — replace trim (gate, seat, stem packing) per OEM kit',
      'NDT inspection of valve bodies and choke bodies (MPI / UT)',
      'Hardness verification per NACE MR0175 on sour-service trim',
      'Hydrostatic shell test at 1.5× rated working pressure',
      'Function test — open / close / leakage on every valve and choke',
      'Sour-service trim certification (Inconel-clad seats, B7M bolting)',
      'API 16C recertification stamp + 5-year validity certificate',
    ],
    deliverables:
      'Per-manifold deliverables: (a) inventory + as-found condition report, (b) NDT inspection reports per body, (c) replaced-trim list with batch traceability, (d) hydrostatic shell test certificate at 1.5× WP, (e) function-test report per valve and choke, (f) API 16C recertification stamp + 5-year validity certificate, (g) NACE MR0175 sour-service compliance certificate.',
    certifications:
      'API 16C licence, API Q1 quality system, ASNT NDT Level II/III, IWCF Level 4 crew leads.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Single manifold recert: 4–8 weeks ex-Dubai workshop. Often coupled with BOP recert for combined scope.',
    applications: [
      'Required every 5 years per API 16C',
      'Aramco requires secondary choke / kill on 10K+ systems (driver of demand)',
      'Often coupled with BOP 5-year recert for combined scope',
      'Pre-mobilisation refresh',
    ],
    oemKeywords: ['Cameron choke manifold recert', 'NOV choke manifold recert', 'API 16C 5-year recertification', 'choke trim kit'],
    leadTimeDays: 45,
  },
  {
    sku: 'IH-BOP-SVC-FIELD-CREW-INDUS',
    title: 'BOP Field Service Crew — Nipple-Up, Function Test, Troubleshooting (H₂S-Trained)',
    serviceType: 'Field Service Crew',
    apiStandard: 'IADC WellSharp',
    equipmentCompatibility:
      'All Cameron / Hydril / Shaffer / NOV / WOM BOP stacks; choke & kill manifolds; control units; CT BOPs; snubbing stacks',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'BOP field service crew on day-rate — nipple-up support, function testing, troubleshooting, BOP stack handler operation. H₂S-trained crews with IWCF / WellSharp Level 4 cards. Buyers: every land-rig contractor in KSA / UAE / Iraq / Oman.',
    scopeBlurb:
      'Day-rate BOP field service crew — supervisor + 2 technicians, mobilising from Dubai with full PPE, sour-service certification, and tooling. Scope includes BOP nipple-up, function test, troubleshooting, leak diagnosis, ram-block change-out, redress field work, and BOP stack handler operation. Crew is operator-spec compliant (Aramco SAEP-1142, ADNOC SPC, KOC, PDO, etc.).',
    scopeItems: [
      'BOP nipple-up support (wellhead-to-BOP stack make-up)',
      'BOP function test execution per API STD 53',
      'Leak diagnosis and on-rig troubleshooting',
      'Ram-block change-out on operator schedule',
      'Field redress (bonnet-open elastomer replacement)',
      'BOP stack handler operation (hydraulic stack handler / bridge crane)',
      'Pressure-test execution and chart-recorder operation',
      'On-rig training of operator personnel where required',
    ],
    deliverables:
      'Per-day deliverables: (a) daily field-service report with hours-on-job breakdown, (b) function-test reports for every BOP cycle performed, (c) replaced-parts traceability log, (d) on-rig hand-over sign-off from operator company-man, (e) end-of-job summary report.',
    certifications:
      'IWCF Well Intervention + Drilling Well Control (Levels 2–4), IADC WellSharp Supervisor, SAEP-1142 NDT (where required), H2S Awareness + Escape (current OPITO or equivalent), HUET (where offshore mobilisation is in scope), API Q2 service quality system.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Crew mobilises from Dubai within 48–72 hours of operator confirmation. Long-term contracts (30+ days) place a stationed crew at the rig; short-notice (24-hour) mobilisation possible for emergency response.',
    applications: [
      'Standard support service for every land-rig contractor in the GCC',
      'BOP nipple-up at every well-spud',
      'API STD 53 mandated 14- or 21-day pressure tests',
      'Emergency response — BOP leak / failure',
      'Pre-mobilisation BOP function test',
    ],
    oemKeywords: ['BOP field service crew Dubai', 'BOP nipple-up support', 'GCC BOP field crew', 'IWCF crew BOP'],
    leadTimeDays: 3,
  },
  {
    sku: 'IH-BOP-SVC-CT-SNUB-WL-TEST-INDUS',
    title: 'Coiled Tubing / Snubbing / Wireline BOP Testing & Recertification',
    serviceType: 'CT BOP Service',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron / NOV / Hydril Coiled Tubing Quad BOPs (5-1/8" 10K most common); Cameron / Hydril / Otis snubbing BOP stacks (7-1/16" 10K); slickline / wireline BOP stacks',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'CT, snubbing, and wireline BOP testing & recertification — separate from drilling BOPs. Buyers are intervention specialists (Halliburton, SLB, Expro, Cansco, Axis). Sour-service capability is mandatory for Ghawar, ADNOC sour fields, Oman Harweel.',
    scopeBlurb:
      'Specialised testing and recertification on CT Quad BOPs (5-1/8" 10K), snubbing BOP stacks (7-1/16" 10K with stripper rams), and slickline / wireline BOP stacks. Includes API 16A 5-year recert scope, plus the specialist sealing-element work that distinguishes intervention BOPs from drilling BOPs.',
    scopeItems: [
      'CT Quad BOP — full 4-cavity strip + redress (blind / shear / slip / pipe rams)',
      'Snubbing BOP stack — stripper-ram redress (upper + lower stripper); safety + pipe ram redress',
      'Wireline / slickline BOP — grease injection and packing replacement',
      'NDT inspection of every metallic component',
      'Hardness verification per NACE MR0175',
      'Hydrostatic shell test at 1.5× WP',
      'Function test on every cavity / stripper / packing',
      'Sour-service certification on all replacement parts',
      'API 16A 5-year recertification stamp where applicable',
    ],
    deliverables:
      'Per-stack deliverables: (a) as-found condition report, (b) NDT inspection report, (c) replaced-parts list with batch traceability, (d) hydrostatic shell test certificate, (e) function-test report per cavity / stripper, (f) recertification stamp + 5-year validity certificate, (g) NACE MR0175 sour-service compliance.',
    certifications:
      'API 16A licence, API Q1 quality system, ASNT NDT Level II/III, IWCF Well Intervention crew leads.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'CT Quad BOP recert: 4–6 weeks. Snubbing stack recert: 6–10 weeks. Wireline BOP service: 1–2 weeks (mostly grease + packing replacement).',
    applications: [
      'Aramco / ADNOC / KOC / PDO CT stimulation campaigns (acid, fracturing, scale removal)',
      'CT cleanout and milling on producing wells',
      'Snubbing operations on producing wells',
      'Slickline / wireline well intervention',
      'H₂S-bearing well intervention (Ghawar, ADNOC sour, Oman Harweel)',
    ],
    oemKeywords: ['CT Quad BOP recert', 'snubbing BOP recert', 'wireline BOP service', 'Cameron CT BOP service', 'NOV CT BOP service'],
    leadTimeDays: 30,
  },

  // ── Tier 2 — 5 services ─────────────────────────────────────────────────
  {
    sku: 'IH-BOP-SVC-SUBSEA-FAT-SIT-INDUS',
    title: 'Subsea BOP Stack FAT/SIT Witness & Engineering Support',
    serviceType: 'FAT/SIT Witness & Engineering',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron TL / NOV Shaffer subsea stacks 18-3/4" 15K; Hydril GX subsea LMRP annulars; subsea control systems',
    pressureClassCoverage: 'Multiple',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'Offshore',
    oneLiner:
      'Subsea BOP stack FAT (Factory Acceptance Test) and SIT (System Integration Test) witness and engineering support — for new-build subsea stacks entering ADNOC offshore (Hail & Ghasha satellites), Saudi Aramco offshore (Marjan, Safaniyah). Premium / low-volume / high-margin specialist service.',
    scopeBlurb:
      'Senior BOP engineer mobilises to OEM workshop (Cameron / NOV / Hydril) for FAT and SIT witness on a new-build subsea BOP stack — verifies build to operator specification, signs off function tests, validates documentation pack, and acts as operator\'s technical proxy where direct attendance is not feasible.',
    scopeItems: [
      'Pre-FAT documentation review against operator specification',
      'On-site FAT witness at OEM workshop (Cameron Houston, NOV Houston, Hydril Houston)',
      'Function-test verification on every BOP cavity, annular, control system',
      'Hydrostatic shell test verification at 1.5× WP',
      'SIT (System Integration Test) witness — BOP + control system + LMRP integration',
      'Documentation-pack verification (NACE certs, NDT reports, mill certs, hardness reports)',
      'Operator-stamp coordination with OEM',
      'Mobilisation to operator base for hand-over',
    ],
    deliverables:
      'Per-engagement deliverables: (a) FAT witness report with photos and verification log, (b) SIT witness report, (c) deviation list and operator-spec compliance matrix, (d) recommendation report on as-built condition, (e) operator hand-over sign-off support.',
    certifications:
      'API 16A engineering authority, IWCF Drilling Well Control Supervisor / Well Intervention, 15+ years BOP engineering experience.',
    coverageArea:
      'OEM workshops globally (typically Houston Texas — Cameron, NOV, Hydril) for FAT; operator base in UAE / KSA for hand-over.',
    typicalLeadTime:
      'Engagement scheduled against the OEM build slot — typically 4–8 weeks ahead of FAT date. Travel and mobilisation handled by Indus.',
    applications: [
      'New-build subsea BOP stacks for ADNOC offshore (Hail & Ghasha satellites)',
      'Saudi Aramco offshore stack-up additions (Marjan, Safaniyah)',
      'Operator capacity gap — direct attendance not feasible',
      'Independent technical review for procurement audit',
    ],
    oemKeywords: ['subsea BOP FAT witness', 'subsea BOP SIT witness', 'Cameron TL FAT', 'NOV Shaffer subsea SIT', 'subsea BOP engineering'],
    leadTimeDays: 45,
  },
  {
    sku: 'IH-BOP-SVC-15K-HPHT-INDUS',
    title: '15K HPHT BOP Service — Hail & Ghasha / Jafurah Sour Gas',
    serviceType: 'HPHT Service',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Cameron UII 13-5/8" / 18-3/4" 15K HPHT, Shaffer NXT-15K, Hydril V 13-5/8" 15K HPHT; HPHT trim across all OEMs',
    pressureClassCoverage: '15K',
    serviceClass: 'HPHT + Sour',
    serviceEnvironment: 'All',
    oneLiner:
      '15K psi BOP service & HPHT capability — small but premium niche tied to ADNOC Hail & Ghasha (H₂S up to 30%), Aramco Jafurah unconventional sour gas, and Oman Khazzan / Ghazeer tight gas. HPHT trim, NACE MR0175 throughout, charpy V-notch impact testing.',
    scopeBlurb:
      'Specialist 15K HPHT BOP service — full API 16A scope plus the HPHT-specific qualification work (low-temperature charpy testing, elevated-temperature elastomer qualification, expanded NDT scope on HPHT-trim components). Sour-service throughout. Performed in Dubai workshop with HPHT-qualified test fittings.',
    scopeItems: [
      'Full API 16A strip + redress at the 15K HPHT scope',
      'HPHT trim NDT — expanded MPI / UT / hardness / dimensional inspection',
      'Low-temperature charpy V-notch impact testing on HPHT-trim metallic parts',
      'Elevated-temperature elastomer qualification (HNBR / AFLAS at HPHT envelope)',
      'NACE MR0175 sour-service material verification on every metallic part',
      'Hydrostatic shell test at 1.5× 15K WP (22,500 psi)',
      'Function test at WP and operator-spec sour conditions',
      'HPHT recertification documentation pack',
    ],
    deliverables:
      'Per-BOP deliverables: (a) full API 16A recert deliverables (see "BOP API 16A 5-Year" SKU), (b) charpy V-notch test reports at low temperature on every HPHT-trim component, (c) HNBR / AFLAS elastomer qualification report at HPHT envelope, (d) NACE MR0175 sour-service compliance certificate, (e) HPHT-trim verification matrix, (f) operator-spec compliance sign-off.',
    certifications:
      'API 16A licence with HPHT qualification, API Q1, ASNT NDT Level II/III with HPHT trim experience, ISO 17025 mechanical-test laboratory partnership for charpy testing.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      '8–14 weeks ex-Dubai workshop. Longer than standard 5-year recert because of the expanded HPHT trim qualification scope. Replacement BOP rental during the recert window only available for 10K-class — 15K HPHT replacement BOPs are typically operator-owned.',
    applications: [
      'ADNOC Hail & Ghasha ultra-sour gas drilling (H₂S up to 30%)',
      'Aramco Jafurah unconventional sour gas',
      'Oman Khazzan / Ghazeer tight gas',
      'Saudi Khuff gas at 15K WP',
      'Iraq deep-gas exploratory drilling',
    ],
    oemKeywords: ['Cameron UII 15K HPHT recert', 'Shaffer NXT-15K service', 'Hydril V 15K HPHT', 'HPHT BOP service GCC'],
    leadTimeDays: 75,
  },
  {
    sku: 'IH-BOP-SVC-DIVERTER-RECERT-INDUS',
    title: 'Diverter System Testing & Recertification (21-1/4" 2K Class)',
    serviceType: 'Diverter Service',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'HMH KFDJ 21-1/4" 2K, HMH KFDS-FS, Cameron diverter 21-1/4" 2K, Shaffer diverter 21-1/4" 2K — offshore jack-up / platform top-hole diverters',
    pressureClassCoverage: '2K',
    serviceClass: 'Standard',
    serviceEnvironment: 'Offshore',
    oneLiner:
      'Diverter system testing & recertification on 21-1/4" 2K class top-hole diverters. Mandatory on every offshore jack-up / platform drilling shallow-gas zones; recurring scope on the GCC offshore drilling fleet.',
    scopeBlurb:
      'Recertification scope on 21-1/4" 2K top-hole diverter systems — strip-down, NDT inspection, sealing-element replacement, overboard line + valve verification, function test, hydrostatic shell test, recertification stamp.',
    scopeItems: [
      'As-found condition report',
      'Strip-down of diverter body, sealing element, overboard valves',
      'NDT inspection of metallic components (MPI / UT / hardness / dimensional)',
      'Sealing element replacement (rubber + steel insert)',
      'Overboard line and valve hydrostatic test',
      'Function test — close / divert cycle',
      'Hydrostatic shell test at 1.5× 2K WP',
      'Recertification stamp + 5-year validity',
    ],
    deliverables:
      'Per-diverter deliverables: (a) as-found condition report, (b) NDT inspection reports, (c) replaced-parts list, (d) hydrostatic test certificate, (e) function-test report, (f) recertification stamp + 5-year validity certificate.',
    certifications:
      'API 16A licence, API Q1 quality system, ASNT NDT Level II/III.',
    coverageArea: COVERAGE_OFFSHORE,
    typicalLeadTime:
      'Single diverter recert: 4–8 weeks ex-Dubai workshop. Mobilisation to / from offshore on operator schedule.',
    applications: [
      'Mandatory on offshore jack-up / platform drilling shallow gas',
      'Required every 5 years per API 16A',
      'ADNOC offshore (Lower Zakum, Upper Zakum) recurring scope',
      'Saudi Aramco offshore (Marjan, Safaniyah) top-hole diverter recerts',
    ],
    oemKeywords: ['HMH KFDJ recert', 'HMH KFDS-FS service', 'Cameron diverter 21-1/4" 2K recert', 'offshore diverter recertification'],
    leadTimeDays: 45,
  },
  {
    sku: 'IH-BOP-SVC-RCD-MPD-INDUS',
    title: 'Rotating Control Device (RCD) Service & MPD Equipment Support',
    serviceType: 'RCD Service',
    apiStandard: 'API 16A',
    equipmentCompatibility:
      'Weatherford SafeShield / SeaShield 5M, SLB RCD-3, NOV ReedHycalog RCD 5K — managed-pressure-drilling (MPD) RCDs',
    pressureClassCoverage: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    serviceEnvironment: 'All',
    oneLiner:
      'Rotating Control Device (RCD) service & MPD equipment support — passive seal element replacement, bearing service, pressure-test, function verification on Weatherford / SLB / NOV RCDs. MPD scope on Jafurah / Oman tight gas.',
    scopeBlurb:
      'RCD service scope — replace the passive (rotating) seal element, service the upper and lower bearings, replace the bearing-pack soft goods, pressure-test the unit, and verify function on a simulated drill-string load. Includes the MPD support kit (pressure-control hoses, manifold connections).',
    scopeItems: [
      'As-found condition + last-job-hours report',
      'Replace passive (rotating) seal element',
      'Bearing pack service — upper + lower bearings',
      'Bearing soft-goods replacement',
      'Pressure test at WP',
      'Function test on simulated drill-string load',
      'NACE MR0175 sour-service material verification',
      'Recertification stamp',
    ],
    deliverables:
      'Per-unit deliverables: (a) as-found condition report, (b) replaced-parts list with batch traceability, (c) pressure-test certificate, (d) function-test report, (e) sour-service compliance certificate, (f) recertification stamp + service-life record.',
    certifications:
      'API 16A licence, API Q1 quality system, ASNT NDT Level II/III for bearing-pack inspection.',
    coverageArea: COVERAGE_FULL_GCC,
    typicalLeadTime:
      'Single RCD service: 2–4 weeks ex-Dubai workshop. Mobile / on-rig service possible for seal-element-only replacement (3–5 days at the rig).',
    applications: [
      'Managed-pressure drilling (MPD) on Jafurah unconventional sour gas',
      'Oman Khazzan / Ghazeer tight gas MPD',
      'Depleted-reservoir infill drilling',
      'Underbalanced drilling on producing reservoirs',
    ],
    oemKeywords: ['Weatherford SafeShield service', 'SLB RCD-3 service', 'NOV RCD service', 'MPD RCD service', 'rotating control device recert'],
    leadTimeDays: 21,
  },
  {
    sku: 'IH-BOP-SVC-IWCF-WELLSHARP-TRAINING-INDUS',
    title: 'IWCF / IADC WellSharp Well Control Training (Levels 2–4 + Supervisor)',
    serviceType: 'Well Control Training',
    apiStandard: 'IWCF',
    equipmentCompatibility:
      'Drilling Well Control Levels 2 / 3 / 4 (Driller / Assistant Driller / Supervisor); Well Intervention (CT / Snubbing / Wireline) Levels 2 / 3 / 4',
    pressureClassCoverage: 'N/A',
    serviceClass: 'Standard',
    serviceEnvironment: 'All',
    oneLiner:
      'IWCF and IADC WellSharp well control training — Levels 2 / 3 / 4 (Driller / Assistant Driller / Supervisor) and Well Intervention. Aramco requires assistant drillers to hold supervisor-level certs; ADNOC Drilling and KDC procure in bulk. Dubai-based delivery.',
    scopeBlurb:
      'IWCF / IADC WellSharp accredited well control training delivered from Indus Dubai training centre. Covers Drilling Well Control (Levels 2, 3, 4), Well Intervention Pressure Control (CT, Snubbing, Wireline — Levels 2, 3, 4), and Supervisor-level certification. Includes simulator-based exam preparation.',
    scopeItems: [
      'IWCF Drilling Well Control Level 2 (Roughneck / Roustabout) — 2-day course',
      'IWCF Drilling Well Control Level 3 (Driller) — 4-day course + simulator exam',
      'IWCF Drilling Well Control Level 4 (Assistant Driller / Supervisor / Engineer) — 5-day course + simulator exam',
      'IADC WellSharp Driller / Supervisor certification — 4-day course + exam',
      'IWCF Well Intervention Pressure Control (CT / Snubbing / Wireline) Levels 2 / 3 / 4',
      'Refresher courses (re-certification, every 2 years)',
      'On-rig delivery available for bulk corporate enrolment (15+ candidates)',
      'Bilingual delivery (English / Arabic) on request for KSA / Iraq / Oman crews',
    ],
    deliverables:
      'Per-candidate deliverables: (a) IWCF / IADC WellSharp certificate (digital + hard copy), (b) simulator exam result report, (c) course materials and reference manual, (d) wallet card with certificate number and expiry date, (e) renewal calendar reminder service.',
    certifications:
      'IWCF accredited training centre (full Drilling Well Control + Well Intervention curriculum), IADC WellSharp accredited training centre, Aramco SAEP-1142 NDT-equivalent training delivery on request, ADNOC SPC-approved training provider.',
    coverageArea:
      'Indus Dubai training centre (full classroom + simulator); on-rig / on-site delivery across the GCC for bulk corporate enrolment.',
    typicalLeadTime:
      'Open-enrolment courses scheduled monthly from Dubai. Bulk corporate enrolment (15+ candidates): scheduled within 3–6 weeks of confirmation. On-rig delivery: 4–8 weeks lead time.',
    applications: [
      'Aramco requires assistant drillers to hold supervisor-level certs',
      'ADNOC Drilling and KDC procure training in bulk',
      'IWCF / IADC WellSharp recertification every 2 years',
      'New-hire onboarding for drilling contractors',
      'Pre-mobilisation refresher for crew rotation',
    ],
    oemKeywords: ['IWCF training Dubai', 'IADC WellSharp Dubai', 'well control training GCC', 'IWCF Level 4 supervisor training'],
    leadTimeDays: 14,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-11-bop-services',
    description:
      'Adds 13 BOP service SKUs (8 Tier 1 + 5 Tier 2) under the BOP catalogue tree (created by 2026-05-11-bop-equipment.ts). Tier 1: API STD 53 pressure testing, API 16A 5-year recert, annual redress, 11" 10K rental, koomey API 16D recert, choke & kill API 16C recert, field service crew, CT / snubbing / wireline BOP service. Tier 2: subsea FAT/SIT, 15K HPHT, diverter recert, RCD service, IWCF / IADC WellSharp training. Coverage: full GCC + offshore.',
  },

  brands: [],

  categories: [],

  specTemplates: [BOP_SERVICE_SPEC_PATCH],

  products: SERVICES.map(makeServiceProduct),
}

export default batch
