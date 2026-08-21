/**
 * Al Feel competitive gap fill — 2026-08-21
 *
 * A product audit of alfeeltrading.com's three hydraulic categories
 * (Hydraulic Hose Fittings, Hydraulic Adapters, Hydraulic Quick Release
 * Coupling) found 16 listings they carry that Indus does not. This batch
 * imports the six priority gaps as **draft** products — 11 SKUs:
 *
 *   1. Metric 24° cone HEAVY series (4)  → din-hose-fittings (existing)
 *      The only real family gap: we carry the full light series and nothing
 *      in heavy. S-series is what sits on high-pressure European plant.
 *   2. Automotive A/C crimp ferrule (1)  → crimp-ferrules (existing)
 *   3. Pressure-washer / waterjet (2)    → pressure-washer-waterjet-fittings (NEW)
 *   4. NPSM male swivel (1)              → npt-npsm-sae-hose-fittings (existing)
 *   5. BSP male 60° cone bulkhead (1)    → bsp-hose-fittings (existing)
 *   6. Wing nut couplings (2)            → quick-couplers (existing)
 *
 * Everything lands as `status: 'draft'` — nothing is visible on the storefront
 * until a human reviews the copy and flips it to active.
 *
 * The NEW category is created with `isPublished: false` for the same reason: a
 * published category with only draft products renders as an empty shelf. Flip
 * it published in the same pass that publishes the two products inside it.
 *
 * No megamenu changes — deliberately. Linking a hidden category into the nav
 * would surface an empty page. Add the leaf when the category goes live.
 *
 * Reuses existing infrastructure throughout: indus brand, threaded-fitting-spec,
 * crimp-ferrule-spec and quick-coupler-spec templates, hoses-fittings parent.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-08-21-alfeel-gap-fill.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-08-21-alfeel-gap-fill.ts
 */
import type {
  CategoryPayload,
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
  status: 'draft',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 7,
  countryOfOrigin: 'UAE',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Threaded hose fittings ────────────────────────────────────────────────
// Mirrors the shape used by 2026-05-07-fittings-2.ts so the new rows are
// indistinguishable from their siblings in the admin and on the PDP.

type FittingConfig = 'straight' | '45-elbow' | '90-elbow'

type FittingCategory =
  | 'din-hose-fittings'
  | 'bsp-hose-fittings'
  | 'npt-npsm-sae-hose-fittings'
  | 'pressure-washer-waterjet-fittings'

type FittingFamily = 'DIN' | 'BSP' | 'NPSM' | 'Pressure Washer'

type ThreadedFitting = {
  sku: string
  title: string
  /** Explicit slug — set it when slugify(title) would mangle a diacritic
   *  (slugify turns "Kärcher" into "k-rcher"). Otherwise omit. */
  slug?: string
  category: FittingCategory
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

function familyFaqContext(f: FittingFamily): string {
  switch (f) {
    case 'DIN':
      return 'DIN-style 24° cone — DIN 2353 / ISO 8434-1 (compression on tube) and DIN 3865 / ISO 12151-2 (with face O-ring). Heavy series (S) carries the higher pressure ratings and uses a thicker tube wall than light series (L); the two are not interchangeable.'
    case 'BSP':
      return 'British Standard Pipe — parallel (BSPP, ISO 228) for hydraulics with separate seal, taper (BSPT, ISO 7/BS 21) for self-sealing taper-on-taper. Common across UK and Commonwealth markets.'
    case 'NPSM':
      return 'NPSM — American National Standard Straight Mechanical pipe thread, SAE J514 / ASME B1.20.1. The swivel nut turns freely so the hose is not twisted during installation; sealing is on the 60° internal cone, not on the thread.'
    case 'Pressure Washer':
      return 'Pressure-washing and waterjet fittings — M22 and 3/8" quick-connect conventions used on Kärcher-pattern and industrial cold/hot-water machines. Interchange parts, not OEM-branded components.'
  }
}

function fittingFaqs(g: ThreadedFitting): FaqEntry[] {
  return [
    {
      q: 'What thread family does this fitting use?',
      a: `${g.family}. ${familyFaqContext(g.family)}`,
    },
    {
      q: 'What thread sizes are available?',
      a: `${g.threadForm}. Common sizes ex-stock; specific thread × bore combinations typically ship within 7 working days.`,
    },
    {
      q: 'What is the sealing form?',
      a: `${g.sealingForm}. Pair with the matching counterpart (port or fitting) — mismatched sealing forms can leak under pressure.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: 'Pressure rating matches the host hose grade and crimp ferrule when crimped to the correct diameter. The fitting itself does not derate the assembly. Refer to the matched hose grade for the bar/psi rating at your bore size.',
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, food-grade, and chemical service.',
    },
    {
      q: 'Which crimp ferrule should I pair with this fitting?',
      a: 'It can be paired with any compatible Indus crimp ferrule. The host hose grade determines the ferrule (skive vs no-skive, double-skive for spiral). Tell us your hose grade on the RFQ and we will recommend the correct ferrule + fitting combo.',
    },
    {
      q: 'Is crimping included?',
      a: 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request. Send your hose grade, bore size, fitting selections, and overall length on the RFQ.',
    },
    {
      q: 'Lead time?',
      a: 'Common configurations are ex-stock from Dubai. Less-common thread × bore combinations typically ship within 7 working days.',
    },
  ]
}

function makeFitting(g: ThreadedFitting): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    ...(g.slug ? { slug: g.slug } : {}),
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

// ── Gap 1: Metric 24° cone, HEAVY series (4) ──────────────────────────────
// Deliberate mirror of the four existing light-series SKUs (IH-DF-*-LS), same
// copy shape, same sealing form (24° cone with face O-ring), heavy geometry.
// Heavy series tops out at DN38 — there is no DN42 in S.

const DIN_HEAVY: ThreadedFitting[] = [
  {
    sku: 'IH-DF-MAL-24-HS',
    title: 'Metric Male 24° Cone (Heavy Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (24° cone — DIN 2353 heavy series)',
    sealingForm: '24° cone (compression on tube)',
    gender: 'male',
    series: 'heavy-series',
    sizeRange: 'DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 2353, ISO 8434-1',
    family: 'DIN',
    oneLiner:
      'Straight hose fitting with male 24° cone — DIN 2353 / ISO 8434-1 heavy series — for high-pressure metric DIN tube ports on European mobile and industrial plant.',
    notes:
      'Heavy series (S) — thicker tube wall and higher pressure rating than light series (L). Not interchangeable with L-series ports.',
  },
  {
    sku: 'IH-DF-FEM-24-OR-HS',
    title: 'Metric Female 24° O-ring Cone (Heavy Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: 'straight',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2, heavy series)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: 'DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    family: 'DIN',
    oneLiner:
      'Straight hose fitting with female-swivel 24° cone + O-ring sealing — heavy series — for high-pressure, high-vibration metric DIN tube ports.',
    notes:
      'Heavy series (S) — higher pressure rating than light series (L). Not interchangeable with L-series ports.',
  },
  {
    sku: 'IH-DF-FEM-24-OR-HS-45',
    title: '45° Metric Female 24° O-ring Cone (Heavy Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: '45-elbow',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2, heavy series)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: 'DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    family: 'DIN',
    oneLiner:
      '45° elbow hose fitting with female-swivel 24° cone + O-ring sealing — heavy series — for tight routing into high-pressure metric DIN ports.',
    notes:
      'Heavy series (S) — higher pressure rating than light series (L). Not interchangeable with L-series ports.',
  },
  {
    sku: 'IH-DF-FEM-24-OR-HS-90',
    title: '90° Metric Female 24° O-ring Cone (Heavy Series) Hose Fitting',
    category: 'din-hose-fittings',
    configuration: '90-elbow',
    threadForm: 'Metric (24° cone with O-ring — DIN 3865 / ISO 12151-2, heavy series)',
    sealingForm: '24° cone with face O-ring (no metal-to-metal seat — soft-seal)',
    gender: 'female-swivel',
    series: 'heavy-series',
    sizeRange: 'DN6 – DN38 (heavy series)',
    applicableStandards: 'DIN 3865, ISO 12151-2',
    family: 'DIN',
    oneLiner:
      '90° elbow hose fitting with female-swivel 24° cone + O-ring sealing — heavy series — for tight routing into high-pressure metric DIN ports.',
    notes:
      'Heavy series (S) — higher pressure rating than light series (L). Not interchangeable with L-series ports.',
  },
]

// ── Gap 4: NPSM male swivel (1) ───────────────────────────────────────────
// We already list NPT male in carbon steel and NPSM swivel female in SS316L —
// this is the everyday carbon-steel swivel that was missing between them.

const NPSM_SWIVEL: ThreadedFitting[] = [
  {
    sku: 'IH-PT-NPSM-SWV',
    title: 'NPSM Male Swivel Hose Fitting',
    category: 'npt-npsm-sae-hose-fittings',
    configuration: 'straight',
    threadForm: 'NPSM straight pipe thread (1/4" – 2" NPSM)',
    sealingForm: '60° internal cone (swivel nut — seal on the cone, not the thread)',
    gender: 'male',
    sizeRange: 'DN6 – DN51 (1/4" – 2")',
    applicableStandards: 'SAE J514, ASME B1.20.1',
    family: 'NPSM',
    oneLiner:
      'Straight male swivel hose fitting on NPSM straight pipe thread — the nut turns freely so the hose is not twisted during installation.',
    notes:
      'Swivel nut removes installation torque from the hose. Mates to NPSM/NPTF male ports with a 60° seat — do not treat as a taper-thread NPT fitting.',
  },
]

// ── Gap 5: BSP male 60° cone bulkhead (1) ─────────────────────────────────

const BSP_BULKHEAD: ThreadedFitting[] = [
  {
    sku: 'IH-BSP-MAL-60-BH',
    title: 'BSP Male 60° Cone Bulkhead Hose Fitting',
    category: 'bsp-hose-fittings',
    configuration: 'straight',
    threadForm: 'BSP parallel (G1/4 to G2 — common sizes), extended bulkhead shank',
    sealingForm: '60° cone (BSPP)',
    gender: 'male',
    sizeRange: 'DN6 – DN51 (1/4" – 2")',
    applicableStandards: 'ISO 228, BS 5200, ISO 12151-6',
    family: 'BSP',
    oneLiner:
      'Bulkhead version of the BSP male 60° cone hose fitting — passes through a panel or tank wall and locks with a bulkhead nut.',
    notes:
      'Supplied with bulkhead locknut. Panel thickness and hole diameter must be confirmed on the RFQ — shank length is size-dependent.',
  },
]

// ── Gap 3: Pressure-washer / waterjet (2) ─────────────────────────────────
// New category. Kärcher is a third-party trademark: these are interchange
// parts, described as such. Nothing here is presented as an OEM component.

const PRESSURE_WASHER: ThreadedFitting[] = [
  {
    sku: 'IH-PW-GUN-INSERT',
    title: 'Pressure Washer Gun Insert — Kärcher Interchange',
    slug: 'pressure-washer-gun-insert-karcher-interchange',
    category: 'pressure-washer-waterjet-fittings',
    configuration: 'straight',
    threadForm: 'Bayonet gun insert (Kärcher-pattern) — hose tail end crimped to hose',
    sealingForm: 'O-ring face seal in the gun socket',
    gender: 'male',
    sizeRange: 'DN6 – DN8 (1/4" – 5/16") hose bore',
    applicableStandards: 'Manufacturer interchange dimensions',
    family: 'Pressure Washer',
    oneLiner:
      'Replacement gun-end insert for Kärcher-pattern pressure washer hoses — bayonet into the trigger gun, crimped onto the hose at the other end.',
    notes:
      'Interchange part manufactured to Kärcher-pattern dimensions. Not an OEM Kärcher component and not sold as one. Confirm the machine series before ordering — the bayonet profile changed across generations.',
  },
  {
    sku: 'IH-PW-WJ-FEM',
    title: 'Pressure Washer / Waterjet Female Hose Fitting',
    category: 'pressure-washer-waterjet-fittings',
    configuration: 'straight',
    threadForm: 'M22 × 1.5 female (3/8" BSP female also available)',
    sealingForm: '15 mm internal cone / O-ring seat, depending on variant',
    gender: 'female-swivel',
    sizeRange: 'DN6 – DN10 (1/4" – 3/8") hose bore',
    applicableStandards: 'Manufacturer interchange dimensions',
    family: 'Pressure Washer',
    oneLiner:
      'Female swivel hose fitting for cold and hot water pressure washers and low-volume waterjet lines — M22 × 1.5 standard, 3/8" BSP on request.',
    notes:
      'Specify the machine-side insert diameter (14 mm or 15 mm) on the RFQ — the two are visually similar and will not seal against each other.',
  },
]

// ── Gap 2: Automotive A/C crimp ferrule (1) ───────────────────────────────

function acFerrule(): ProductImportPayload {
  const compatibleHoses =
    'SAE J2064 automotive air-conditioning hose (types B, C and E — R134a and R1234yf service)'
  const sizeRange = '#6, #8, #10, #12 (5/16" – 5/8")'
  const oneLiner =
    'No-skive crimp ferrule for automotive air-conditioning hose — crimps directly over the cover on SAE J2064 barrier hose.'

  return {
    ...COMMON,
    sku: 'IH-CF-NS-AC',
    title: 'No-Skive Crimp Ferrule for Automotive A/C Hose (SAE J2064)',
    categorySlug: 'crimp-ferrules',
    specTemplateSlug: 'crimp-ferrule-spec',
    descriptionShort: `${oneLiner} For ${compatibleHoses}, ${sizeRange}.`.slice(0, 500),
    descriptionLong: `<p>The <strong>No-Skive Crimp Ferrule for Automotive A/C Hose</strong> is a no-skive crimp ferrule for ${escape(compatibleHoses)}, available across ${escape(sizeRange)}.</p>
<h3>Construction</h3>
<ul>
<li>Material: Aluminium (steel available on request)</li>
<li>Surface treatment: Mill finish or anodised, depending on size</li>
<li>Crimp method: Crimped over the cover — no skiving required, faster fitting</li>
<li>Beadlock profile matched to barrier-hose construction so the crimp does not cut the inner tube</li>
</ul>
<h3>Performance</h3>
<p>Rated to match the host A/C hose grade when crimped to the recommended diameter on the matching die. Suitable for R134a and R1234yf refrigerant service with the correct barrier hose. Operating temperature -30°C to +125°C.</p>
<h3>Applicable Standards</h3>
<ul>
<li>SAE J2064 (matched to host hose)</li>
<li>ISO 12151 ferrule dimension series</li>
</ul>
<h3>How to order</h3>
<p>Specify (a) the host A/C hose grade and bore size (#6 / #8 / #10 / #12), (b) the fitting at each end, and (c) total assembly length plus orientation. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with SAE J2064 automotive air-conditioning hose and the matching A/C fitting for the vehicle. For hydraulic hose grades see the rest of the Crimp Ferrules category.</p>`,
    specs: {
      ferrule_type: 'no-skive',
      compatible_hoses: compatibleHoses,
      nominal_size_range: sizeRange,
      crimp_method: 'Crimped over the cover — no skiving required, faster fitting',
      material: 'Aluminium (steel on request)',
      surface_treatment: 'Mill finish or anodised',
      applicable_standards: 'SAE J2064, ISO 12151',
      sold_by: 'each',
    },
    faqs: [
      {
        q: 'What hoses does this ferrule fit?',
        a: `${compatibleHoses}, across ${sizeRange}.`,
      },
      {
        q: 'Can this be used on hydraulic hose?',
        a: 'No. The beadlock profile and aluminium construction are specific to automotive A/C barrier hose. Use the hydraulic ferrules in the same category for R1/R2/spiral hose grades.',
      },
      {
        q: 'Is it suitable for R1234yf as well as R134a?',
        a: 'Yes, provided the host hose is a barrier hose rated for the refrigerant. The ferrule does not set the refrigerant compatibility — the hose does.',
      },
      {
        q: 'What crimp die do I need?',
        a: 'A/C crimp dies are refrigerant-hose specific and differ from hydraulic dies. Send us your crimper model and hose grade and we will quote with the correct die and crimp diameter.',
      },
      {
        q: 'Can a crimped ferrule be reused?',
        a: 'No. Once crimped, the ferrule is permanently deformed onto the hose. Replace the assembly entirely if a fitting needs to change.',
      },
      {
        q: 'Lead time and crimping service?',
        a: 'Common sizes are ex-stock from Dubai. Less common bores typically ship within 7 working days. We offer in-house crimping with pressure testing on request.',
      },
      {
        q: 'How is this product sold?',
        a: 'Each. RFQ specifies the host hose grade, bore size, and quantity.',
      },
    ],
    seoTitle: 'Automotive A/C Crimp Ferrule — SAE J2064 | Indus Hydraulics',
    seoDescription: oneLiner.slice(0, 500),
    focusKeyword: 'automotive A/C crimp ferrule',
  }
}

// ── Gap 6: Wing nut quick couplings (2) ───────────────────────────────────
// First Indus house-brand entries in quick-couplers, which is otherwise an
// all-Eaton category. Screw-together agricultural / trailer interchange.

type WingNutCoupling = {
  sku: string
  title: string
  series: string
  oneLiner: string
  applicationNote: string
  sizeRange: string
  portThreads: string
}

function makeWingNut(g: WingNutCoupling): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'quick-couplers',
    specTemplateSlug: 'quick-coupler-spec',
    descriptionShort: `${g.oneLiner} ${g.sizeRange}, ${g.portThreads}.`.slice(0, 500),
    descriptionLong: `<p>The <strong>${escape(g.title)}</strong> is a screw-together (wing nut) hydraulic quick coupling for agricultural and trailer service. ${escape(g.applicationNote)}</p>
<h3>Construction</h3>
<ul>
<li>Series: ${escape(g.series)}</li>
<li>Connection method: thread-to-connect, hand-tightened by the wing nut — no tools required</li>
<li>Valving: non-valved (free flow when coupled; the line must be depressurised before disconnecting)</li>
<li>Body material: carbon steel, zinc-plated</li>
<li>Seals: NBR standard; Viton on request for high-temperature or aggressive fluids</li>
<li>Available sizes: ${escape(g.sizeRange)}</li>
<li>Port threads: ${escape(g.portThreads)}</li>
</ul>
<h3>Performance</h3>
<p>Rated to 250 bar working pressure with a 4:1 burst safety factor. Operating temperature -25°C to +100°C on NBR seals. The wing nut resists vibration loosening better than a push-to-connect ball latch, which is why it persists on trailer and implement lines.</p>
<h3>How to order</h3>
<p>Specify (a) the body size, (b) the port thread you need, (c) male half, female half, or matched pair, and (d) seal compound. Tell us the implement or trailer make on the RFQ if you are matching an existing coupling.</p>
<h3>Companion products</h3>
<p>For push-to-connect service see the Eaton 5600 (ISO 7241 Series A), FD45 (Series B) and FD89 flush-face ranges in the same category. For farm tractor tips see Eaton FD70 / FD76 (ISO 5675).</p>`,
    specs: {
      series: g.series,
      interchange_standard: 'Wing nut screw-together — agricultural / trailer interchange',
      application_class: 'Farm Hydraulic',
      valving: 'Non-Valved',
      available_sizes: g.sizeRange,
      available_body_materials: 'Carbon steel, zinc-plated',
      available_seal_materials: 'NBR (standard), Viton (on request)',
      available_port_threads: g.portThreads,
      available_halves: 'Male half, female half, or matched pair',
      connection_method: 'Thread-to-Connect',
      flush_face: 'false',
      connect_under_pressure: 'false',
      max_operating_pressure_bar: 250,
      min_burst_pressure_bar: 1000,
      temp_min_c: -25,
      temp_max_c: 100,
    },
    faqs: [
      {
        q: 'What is a wing nut coupling?',
        a: 'A screw-together hydraulic quick coupling: the two halves are joined by a knurled wing nut tightened by hand rather than a push-on ball latch. It resists vibration loosening, which is why it stays common on trailers and agricultural implements.',
      },
      {
        q: 'Can it be connected under pressure?',
        a: 'No. Depressurise the line on both sides before coupling or uncoupling. For connect-under-pressure service use a thread-to-connect flush-face coupler such as the Eaton FD86 or FD96.',
      },
      {
        q: 'Is it valved?',
        a: 'No — this is a non-valved coupling, so both halves flow freely when separated. Cap or plug open ends to keep contamination out.',
      },
      {
        q: 'What pressure is it rated to?',
        a: '250 bar working pressure with a 4:1 burst safety factor. Confirm the rating against the host hose grade — the assembly is rated to the lower of the two.',
      },
      {
        q: 'Which port threads are available?',
        a: `${g.portThreads}. Other threads can be quoted — send the port spec on the RFQ.`,
      },
      {
        q: 'Are male and female halves sold separately?',
        a: 'Yes. Order either half individually or as a matched pair. Tell us the existing coupling make on the RFQ if you are matching one already in service.',
      },
      {
        q: 'Lead time?',
        a: 'Common sizes ex-stock from Dubai; other configurations typically ship within 7 working days.',
      },
    ],
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: 'wing nut hydraulic coupling',
  }
}

const WING_NUTS: WingNutCoupling[] = [
  {
    sku: 'IH-QC-WINGNUT',
    title: 'Wing Nut Hydraulic Quick Coupling',
    series: 'Wing Nut (screw-together)',
    oneLiner:
      'Screw-together hydraulic quick coupling tightened by hand with a wing nut — vibration-resistant, non-valved, for agricultural and general implement lines.',
    applicationNote:
      'Used where a push-to-connect latch works loose under vibration — implement lines, static machine connections and low-cycle service points.',
    sizeRange: '1/4", 3/8", 1/2", 3/4"',
    portThreads: 'BSP female, BSP male, NPT female',
  },
  {
    sku: 'IH-QC-WINGNUT-TRL',
    title: 'Wing Nut Hydraulic Quick Coupling — Trailer Type',
    series: 'Wing Nut Trailer (screw-together)',
    oneLiner:
      'Trailer-pattern screw-together hydraulic quick coupling with an extended wing nut for gloved hands — non-valved, for tipping trailer and implement circuits.',
    applicationNote:
      'Trailer pattern: longer body and larger wing for connection with gloves on, commonly fitted to tipping trailers and towed implements.',
    sizeRange: '3/8", 1/2", 3/4"',
    portThreads: 'BSP female, BSP male',
  },
]

// ── New category ──────────────────────────────────────────────────────────
// Created UNPUBLISHED on purpose — see the file header. Publish it in the same
// pass that flips the two products inside it to active, and add the megamenu
// leaf then.

const CATEGORIES: CategoryPayload[] = [
  {
    slug: 'pressure-washer-waterjet-fittings',
    name: 'Pressure Washer & Waterjet Fittings',
    parentSlug: 'hoses-fittings',
    shortDescription:
      'Hose fittings and gun inserts for cold and hot water pressure washers and low-volume waterjet lines — M22 × 1.5, 3/8" BSP and Kärcher-pattern bayonet interchanges.',
    position: 32,
    isPublished: false,
    defaultSpecTemplateSlug: 'threaded-fitting-spec',
    seoTitle: 'Pressure Washer & Waterjet Hose Fittings — Dubai | Indus Hydraulics',
    seoDescription:
      'Pressure washer and waterjet hose fittings: M22 × 1.5 female swivels, 3/8" BSP, and Kärcher-pattern gun inserts. Crimped and pressure-tested in Dubai.',
  },
]

// ── Batch ─────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-08-21-alfeel-gap-fill',
    description:
      'Six priority gaps from the Al Feel Trading product audit, imported as 11 draft products across 4 existing categories plus 1 new unpublished category.',
  },

  brands: [],
  categories: CATEGORIES,
  specTemplates: [],

  products: [
    ...DIN_HEAVY.map(makeFitting),
    acFerrule(),
    ...PRESSURE_WASHER.map(makeFitting),
    ...NPSM_SWIVEL.map(makeFitting),
    ...BSP_BULKHEAD.map(makeFitting),
    ...WING_NUTS.map(makeWingNut),
  ],
}

export default batch
