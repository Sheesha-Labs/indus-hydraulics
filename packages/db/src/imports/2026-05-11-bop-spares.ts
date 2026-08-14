/**
 * ══════════════════════════════════════════════════════════════════════════
 * ALREADY APPLIED — DO NOT RE-RUN
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Imported into production 2026-05-11. This file was only merged on
 * 2026-08-14, as the missing record of that import — every other batch in
 * this directory has its file on record; the BOP ones did not.
 *
 * State verified against production at merge time via --dry-run:
 *   Products           — created 0, updated 18
 *   Categories / brands / spec templates — no changes
 *   Megamenu nav links — no changes
 *
 * This file is cleanly idempotent — all 18 spares are present and it touches no
 * navigation. It is still not worth re-running: the "updated 18" is just
 * rewriting identical values.
 * ══════════════════════════════════════════════════════════════════════════
 */
/**
 * Blowout Preventer (BOP) — Spare Parts & Cross-Sell Bundles
 * 2026-05-11
 *
 * Adds 18 Tier 1 spare parts and cross-sell bundle SKUs under the BOP
 * catalogue tree. Spares are the bread-and-butter recurring-purchase line
 * of any oilfield supplier — operators replace these every test cycle or
 * every well.
 *
 * Companion to:
 *   - 2026-05-11-bop-equipment.ts  → foundation (brands, categories, templates, megamenu) + 17 equipment SKUs
 *   - 2026-05-11-bop-services.ts   → 13 services
 *
 * This file does NOT redeclare brands / categories / templates — they are
 * created by the equipment file. Run the equipment file FIRST. Re-running
 * this file is fully idempotent (add-only mode).
 *
 * Pricing: RFQ-only (listPrice = null), AED. Status: active. Country of
 * origin defaults to UAE.
 *
 * Region defaults applied (GCC sour-service is the default, NOT the option):
 *   - HNBR / AFLAS elastomers on every packer / element listing
 *   - B7M / L7M studs on every bolting kit
 *   - Inconel-625-clad ring grooves on every gasket SKU
 *   - HRC ≤ 22 hardness on every metallic part per NACE MR0175
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-spares.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-spares.ts
 */
import type {
  FaqEntry,
  ImportBatch,
  ProductImportPayload,
} from '../import/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtPsi(psi: number): string {
  return psi.toLocaleString('en-US') + ' psi'
}

// ── Spare-part input shape ────────────────────────────────────────────────

type SpareInput = {
  sku: string
  title: string
  categorySlug: string
  spareType: string
  fitsOem: string
  bore: string // e.g. '13-5/8"' or 'N/A'
  workingPressurePsi?: number
  pressureClass: string
  serviceClass: 'Standard' | 'Sour Service (NACE MR0175)'
  elastomerCompound?: 'NBR' | 'HNBR' | 'FKM (Viton)' | 'AFLAS' | 'N/A'
  pipeOrTubingSize?: string
  boltGrade?: 'B7' | 'B7M' | 'L7' | 'L7M' | 'N/A'
  ringGasketType?: 'BX' | 'RX' | 'R' | 'API 6A' | 'N/A'
  material: string
  apiSpec: '6A' | '16A' | '20E' | 'Multiple' | 'None'
  temperatureRating: string
  kitContents?: string
  oneLiner: string
  designNote: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
  unitOfMeasure: 'each' | 'set' | 'kit'
}

// ── HTML description builder for spares ───────────────────────────────────

function buildSpareHtml(g: SpareInput): string {
  const isSour = g.serviceClass === 'Sour Service (NACE MR0175)'
  const sourLine = isSour
    ? 'NACE MR0175 / ISO 15156 sour-service compliant — required across Saudi Aramco, ADNOC, KOC, PDO, QatarEnergy default specifications for the GCC.'
    : 'Standard service rated for sweet hydrocarbon, completion fluid, water, brine, and gas streams within the working-pressure envelope.'
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')
  const elastomerLine = g.elastomerCompound && g.elastomerCompound !== 'N/A'
    ? `<li>Elastomer compound: ${escape(g.elastomerCompound)}${isSour ? ' (sour-service grade)' : ''}</li>`
    : ''
  const pipeLine = g.pipeOrTubingSize
    ? `<li>Pipe / tubing size: ${escape(g.pipeOrTubingSize)}</li>`
    : ''
  const boltLine = g.boltGrade && g.boltGrade !== 'N/A'
    ? `<li>Bolting grade: ASTM A193 ${escape(g.boltGrade)} (per NACE MR0175 for sour service)</li>`
    : ''
  const gasketLine = g.ringGasketType && g.ringGasketType !== 'N/A'
    ? `<li>Ring-gasket type: API 6A ${escape(g.ringGasketType)}-style</li>`
    : ''
  const wpLine = g.workingPressurePsi
    ? `<li>Cold working pressure: ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class)</li>`
    : ''
  const kitLine = g.kitContents
    ? `<h3>Kit contents</h3><p>${escape(g.kitContents)}</p>`
    : ''

  return `<p>The <strong>${escape(g.title)}</strong> is a recurring-purchase ${escape(g.spareType.toLowerCase())} sized for ${escape(g.bore)} bore BOP equipment. ${escape(g.designNote)} ${escape(sourLine)}</p>
<h3>Construction</h3>
<ul>
<li>Spare-part type: ${escape(g.spareType)}</li>
<li>Fits OEM: <strong>${escape(g.fitsOem)}</strong></li>
${g.bore !== 'N/A' ? `<li>BOP bore size: ${escape(g.bore)}</li>` : ''}
${wpLine}
<li>Service class: ${escape(g.serviceClass)}</li>
${elastomerLine}
${pipeLine}
${boltLine}
${gasketLine}
<li>Material: ${escape(g.material)}</li>
<li>Temperature rating: ${escape(g.temperatureRating)}</li>
</ul>
${kitLine}
<h3>OEM compatibility</h3>
<p>Engineered as a recognised aftermarket-acceptable replacement for the following OEM equipment lines (Indus Hydraulics is not an authorised distributor of these OEMs — parts are manufactured to the OEM dimensional standard with full mill test reports and API monogram traceability):</p>
<ul>
${oemKw}
</ul>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Performance & testing</h3>
<p>Each unit is dimensionally inspected against the OEM datum, dye-penetrant or magnetic-particle inspected for surface defects, and shipped with mill test reports per EN 10204 3.1 / 3.2. Elastomer parts are batch-tested for hardness, compression set, and fluid resistance (sour service variants tested per NACE TM0297 / TM0187 where applicable). Charpy V-notch impact testing on metallic parts available where service requires low-temperature toughness verification.</p>
<h3>Compliance</h3>
<ul>
<li>API ${escape(g.apiSpec)} (per part class)</li>
${isSour ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Dimensional inspection report per part</li>
<li>Heat-number / batch traceability</li>
${g.boltGrade && g.boltGrade !== 'N/A' ? '<li>API 20E BSL-2 / BSL-3 bolting on request</li>' : ''}
</ul>
<h3>Sealed & dated packaging (GCC climate)</h3>
<p>50 °C ambient + UV degrades unsealed elastomers in storage. Indus ships every elastomer / packing element / soft-goods kit in heat-sealed UV-resistant bags with manufacture date, batch number, and recommended-use-by date stamped on the outer label. Re-sealable bins for partial use. This is what Aramco / ADNOC / KOC supplier audits ask about — make sure you specify "sealed dated packaging" on the RFQ.</p>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) exact OEM part number or BOP serial number being serviced (we cross-reference to the matched aftermarket part), (b) bore size and working pressure, (c) drill-pipe or casing OD if a ram packer or VBR, (d) elastomer compound preference (HNBR / AFLAS for sour service GCC default), (e) bolting grade (B7M / L7M for sour), (f) certification requirements (NACE, charpy, mill 3.2 vs 3.1, IKTVA / ICV documentation), (g) destination port and packaging requirements. Indus quotes ex-Dubai (AED) — sales@indushydraulics.com or WhatsApp +971.</p>`
}

// ── FAQ generator for spares ──────────────────────────────────────────────

function buildSpareFaqs(g: SpareInput): FaqEntry[] {
  const isSour = g.serviceClass === 'Sour Service (NACE MR0175)'
  return [
    {
      q: 'What OEM equipment does this part fit?',
      a: `This part is a recognised aftermarket-acceptable replacement for ${g.fitsOem}. OEM cross-references: ${g.oemKeywords.join(', ')}. Indus Hydraulics is not an authorised distributor of these OEMs but each part ships with full mill test reports, API monogram traceability, and dimensional inspection report. Where the application requires an OEM-stamped genuine part, Indus can source it on a build-to-order basis — call us with the OEM part number and we will quote both options.`,
    },
    {
      q: 'Is this part suitable for sour-service (H₂S) wells?',
      a: isSour
        ? `Yes — this part is fully NACE MR0175 / ISO 15156 sour-service compliant. ${g.elastomerCompound && g.elastomerCompound !== 'N/A' ? `Elastomer compound: ${g.elastomerCompound} (sour-service grade — qualified per NACE TM0297 for H₂S resistance and per NACE TM0187 for amine resistance).` : 'Metallic body hardness controlled per NACE limits (max 22 HRC).'} ${g.boltGrade && g.boltGrade !== 'N/A' ? `Bolting per ASTM A193 ${g.boltGrade} (NACE-compliant grade).` : ''} Required across Saudi Aramco, ADNOC, KOC, PDO, QatarEnergy default sour-service specifications.`
        : `No — this configuration is rated for sweet (standard) service. For wells with H₂S exposure, specify the sour-service variant — Indus carries sour-service grades as the regional default and can re-spec the order to NACE MR0175 / ISO 15156 with HNBR or AFLAS elastomers and B7M / L7M bolting.`,
    },
    {
      q: 'How often does this part need replacement?',
      a: `${g.spareType === 'Annular Packing Element' ? 'Annular packing elements are the highest-frequency BOP consumable — degrades from every closure cycle. API STD 53 mandates spare elements on the rig at all times. Most operators replace every 12 months or sooner depending on closure-cycle count and condition on inspection.' : g.spareType === 'Pipe Ram Block Assembly' || g.spareType === 'Variable Bore Ram (VBR) Block' ? 'Ram blocks are typically replaced when the packer / front seal degrades — usually annually as part of the Aramco-style 12-month elastomer redress, or when surface condition fails dimensional inspection. The block body itself can last multiple redress cycles; only the soft goods are routinely replaced.' : g.spareType === 'Bonnet Seal Kit' ? 'Bonnet seals are replaced at every BOP recertification (3–5 yr) plus on-rig field redress when the bonnet is opened to swap ram blocks. Stock at least one kit per cavity per BOP for the rig fleet.' : g.spareType === 'Ring Gasket Set' || g.spareType === 'Stud & Nut Kit' ? 'Ring gaskets and studs are consumed every nipple-up — once a ring gasket is energised, it should never be re-used. Studs are typically replaced when surface condition shows galling, corrosion, or stretch beyond limits. Stock by the box.' : g.spareType === 'BOP Test Plug & Lift Sub Set' ? 'BOP test plugs and lift subs are drilling consumables — replaced when surface condition fails inspection or when BOP testing wears the test plug profile. Stock per rig.' : 'This consumable is replaced per the OEM service-life recommendation — typically annually as part of the Aramco-style 12-month redress, or sooner if surface inspection shows wear.'} The 12-month elastomer redress is a Saudi Aramco / ADNOC default — Indus ships an annual redress-kit subscription on request.`,
    },
    {
      q: 'What materials and certifications come with each part?',
      a: `Material: ${g.material}. Each part ships with: (a) dimensional inspection report against the OEM datum, (b) EN 10204 3.1 mill test report (3.2 on request), (c) heat-number / batch traceability, (d) API ${g.apiSpec} compliance documentation${isSour ? ', (e) NACE MR0175 / ISO 15156 sour-service compliance certificate, (f) charpy V-notch impact-energy report on metallic parts at the applicable test temperature' : ''}. Elastomer parts include batch hardness / compression-set test data and recommended-use-by date.`,
    },
    {
      q: 'Does Indus stock these as fast-moving consumables?',
      a: `Yes — recurring-purchase BOP spares are core stock at Indus Dubai. Common bore-size + pressure-class + sour-service combinations are stocked or short-lead from the warehouse — typical lead time ${g.leadTimeDays} working days for stock-style configurations. Less-common variants are 4–10 weeks build-to-order. We carry the GCC-default sour-service grades by default; sweet-service variants are downgrades on request.`,
    },
    {
      q: 'How does Indus package elastomer / soft-goods parts for the GCC climate?',
      a: '50 °C ambient + UV degrades unsealed elastomers in storage. Indus ships every elastomer / packing element / soft-goods kit in heat-sealed UV-resistant bags with manufacture date, batch number, and recommended-use-by date stamped on the outer label. Re-sealable bins for partial use. This is what Aramco / ADNOC / KOC supplier audits specifically ask about — specify "sealed dated packaging" on the RFQ and Indus delivers to that standard by default.',
    },
    {
      q: 'What companion parts should I order with this?',
      a: `${g.spareType === 'Annular Packing Element' ? 'Annular elements are typically ordered with: head seal, piston seal, wear plate, and operating-cylinder soft goods. The "Annular Element + Head Seal Kit" cross-sell SKU bundles all four — see the BOP Spare Parts category.' : g.spareType.includes('Ram Block') ? 'Ram block assemblies are typically ordered with: matching ram packer / VBR packer, top seal, side packer, ram screws, and grease. The "Ram Redress Kit (Per Cavity)" cross-sell SKU bundles all of these for one cavity — see the BOP Spare Parts category.' : g.spareType === 'Ring Gasket Set' ? 'Ring gaskets are typically ordered with matched B7M studs and 2H heavy hex nuts. The "BOP Nipple-Up Kit" cross-sell SKU bundles BX gasket + studs + nuts + thread compound for one flange — see the BOP Spare Parts category.' : g.spareType === 'Bonnet Seal Kit' ? 'Bonnet seals are typically ordered alongside the matching ram block redress — Indus packages them together on RFQ.' : 'Indus packages matched-class bundles on RFQ — confirm your stack-up on the order and we will return a complete bill of materials.'} For full BOP recertification scope, see the BOP Services category.`,
    },
    {
      q: 'What is the lead time and how do I order?',
      a: `Common configurations are stock-or-short-lead from Dubai — typical lead time ${g.leadTimeDays} working days. Less common variants are 4–10 weeks build-to-order. RFQ with: (a) exact OEM part number or BOP serial number, (b) bore size + pressure class, (c) drill-pipe or casing OD (for ram packers / VBRs), (d) elastomer preference, (e) bolting grade preference, (f) certification requirements (NACE, charpy, mill 3.2 vs 3.1, IKTVA / ICV documentation), (g) destination port and packaging. Indus quotes ex-Dubai (AED) — sales@indushydraulics.com or WhatsApp +971.`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeSpareProduct(g: SpareInput): ProductImportPayload {
  const isSour = g.serviceClass === 'Sour Service (NACE MR0175)'
  const focusKw =
    `${g.spareType.toLowerCase()} ${g.bore !== 'N/A' ? g.bore + ' ' : ''}${g.pressureClass !== 'N/A' ? g.pressureClass.toLowerCase() + ' ' : ''}${isSour ? 'sour' : ''}`
      .trim()
      .slice(0, 120)
  const specs: Record<string, string | number | boolean> = {
    spare_type: g.spareType,
    fits_oem: g.fitsOem,
    bore_size: g.bore,
    pressure_class: g.pressureClass,
    service_class: g.serviceClass,
    material: g.material,
    api_spec: g.apiSpec,
    temperature_rating: g.temperatureRating,
  }
  if (g.workingPressurePsi !== undefined) specs.working_pressure_psi = g.workingPressurePsi
  if (g.elastomerCompound) specs.elastomer_compound = g.elastomerCompound
  if (g.pipeOrTubingSize) specs.pipe_or_tubing_size = g.pipeOrTubingSize
  if (g.boltGrade) specs.bolt_grade = g.boltGrade
  if (g.ringGasketType) specs.ring_gasket_type = g.ringGasketType
  if (g.kitContents) specs.kit_contents = g.kitContents
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: 'indus',
    categorySlug: g.categorySlug,
    specTemplateSlug: 'bop-spares-spec',
    status: 'active',
    unitOfMeasure: g.unitOfMeasure,
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: 'UAE',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildSpareHtml(g),
    specs,
    faqs: buildSpareFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: focusKw,
  }
}

// ── Spare data — 18 SKUs ──────────────────────────────────────────────────

const SOUR_TEMP = '-20°F to 250°F (-29°C to 121°C) — sour-service NACE MR0175 envelope'
const ELAST_MAT_HNBR =
  'HNBR (hydrogenated nitrile) compound — qualified per NACE TM0297 for H₂S resistance, NACE TM0187 for amine resistance, batch hardness controlled'
const ELAST_MAT_AFLAS =
  'AFLAS / FEPM compound — high-temperature sour-service grade qualified per NACE TM0297, recommended for H₂S above 5% partial pressure'
const SOUR_BOLT_MAT =
  'ASTM A193 B7M studs (HRC ≤ 22 per NACE MR0175) with ASTM A194 2HM heavy-hex nuts; phos-coated for assembly, anti-seize on threads'
const SOUR_GASKET_MAT =
  'Soft-iron-seal-ring body with Inconel-625 cladding on the seating surface (sour-service standard); also available in 316L stainless or solid Inconel-625 on request'

const SPARES: SpareInput[] = [
  // ── Annular Packing Elements (5) ────────────────────────────────────────
  {
    sku: 'IH-BOP-PE-HYDRIL-GK-13-58-5K-HNBR-INDUS',
    title: 'Annular Packing Element, Hydril GK Style 13-5/8" 5K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Packing Element',
    fitsOem: 'Hydril GK 13-5/8" 5K',
    bore: '13-5/8"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material: ELAST_MAT_HNBR,
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      'Hydril GK style annular packing element, 13-5/8" 5K, HNBR sour-service. The single highest-frequency BOP consumable in the GCC — annular elements degrade from every closure cycle and API STD 53 mandates spares on the rig at all times.',
    designNote:
      'The 13-5/8" 5K Hydril GK annular packing element is the most-consumed spare in the regional BOP fleet. HNBR compound is the GCC-default sour-service grade — AFLAS available for H₂S > 5% on request. Sealed UV-resistant packaging with batch date.',
    applications: [
      'Surface BOP stack annular element replacement (Aramco, ADNOC, KOC, PDO)',
      '12-month annual redress per Saudi Aramco specification',
      'Stock for API STD 53 mandated spare-on-rig requirement',
      'Workover BOP element replacement on 13-5/8" 5K wellheads',
    ],
    oemKeywords: ['Hydril GK 13-5/8" 5K element', 'Cameron D 13-5/8" 5K element', 'Shaffer Spherical 13-5/8" 5K element'],
    leadTimeDays: 21,
    unitOfMeasure: 'each',
  },
  {
    sku: 'IH-BOP-PE-HYDRIL-GK-13-58-10K-HNBR-INDUS',
    title: 'Annular Packing Element, Hydril GK Style 13-5/8" 10K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Packing Element',
    fitsOem: 'Hydril GK 13-5/8" 10K',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material: ELAST_MAT_HNBR,
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      'Hydril GK style annular packing element, 13-5/8" 10K, HNBR sour-service. The mainstream-development annular consumable for Aramco / ADNOC / KOC / PDO 10K BOP stacks.',
    designNote:
      'The 13-5/8" 10K Hydril GK annular packing element is the second-highest-frequency BOP element in the GCC — sized for the mainstream 10K development drilling stack. HNBR sour-service grade by default; AFLAS for ultra-sour wells.',
    applications: [
      'Mainstream 13-5/8" 10K surface BOP stack element replacement',
      '12-month annual redress per Saudi Aramco specification',
      'Aramco Khurais / Hawiyah / Haradh / Khuff land programmes',
      'ADNOC Bab / Asab / Bu Hasa onshore drilling',
    ],
    oemKeywords: ['Hydril GK 13-5/8" 10K element', 'Cameron DL 13-5/8" 10K element', 'Shaffer Spherical 13-5/8" 10K element'],
    leadTimeDays: 28,
    unitOfMeasure: 'each',
  },
  {
    sku: 'IH-BOP-PE-HYDRIL-GK-11-10K-HNBR-INDUS',
    title: 'Annular Packing Element, Hydril GK Style 11" 10K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Packing Element',
    fitsOem: 'Hydril GK 11" 10K',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material: ELAST_MAT_HNBR,
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      'Hydril GK style annular packing element, 11" 10K, HNBR sour-service. The slim-hole / workover annular element for sour-service infill drilling across Aramco / ADNOC / KOC.',
    designNote:
      'The 11" 10K Hydril GK annular packing element is the workover-stack annular consumable — sized for slim-hole and intervention BOP stacks. HNBR sour-service grade by default.',
    applications: [
      'Workover 11" 10K BOP stack element replacement',
      'Slim-hole infill drilling annular service',
      'CT and snubbing top-annular replacement',
      'Sour-service workover and intervention',
    ],
    oemKeywords: ['Hydril GK 11" 10K element', 'Cameron DL 11" 10K element', 'Shaffer Spherical 11" 10K element'],
    leadTimeDays: 28,
    unitOfMeasure: 'each',
  },
  {
    sku: 'IH-BOP-PE-HYDRIL-GX-1834-10K-HNBR-INDUS',
    title: 'Subsea Annular Packing Element, Hydril GX Style 18-3/4" 10K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Packing Element',
    fitsOem: 'Hydril GX 18-3/4" 10K subsea',
    bore: '18-3/4"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material: ELAST_MAT_HNBR,
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      'Hydril GX style subsea annular packing element, 18-3/4" 10K, HNBR sour-service. The LMRP-mounted annular consumable for offshore stacks on ADNOC offshore (Lower Zakum, Hail & Ghasha satellites) and Aramco offshore.',
    designNote:
      'The 18-3/4" 10K Hydril GX annular packing element is the subsea LMRP annular consumable — heavy-section element for subsea pressure containment. Tier 2 / offshore item; lower replacement frequency than land but high per-unit value.',
    applications: [
      'Subsea LMRP annular element replacement on offshore stacks',
      'ADNOC offshore — Lower Zakum, Upper Zakum, Hail & Ghasha satellite jack-ups',
      'Saudi Aramco offshore — Marjan, Safaniyah expansion',
      '5-year subsea stack overhaul element replacement',
    ],
    oemKeywords: ['Hydril GX 18-3/4" 10K element', 'Cameron LMRP 18-3/4" 10K element', 'Shaffer subsea annular 18-3/4" 10K element'],
    leadTimeDays: 60,
    unitOfMeasure: 'each',
  },
  {
    sku: 'IH-BOP-PE-SHAFFER-SPH-13-58-10K-HNBR-INDUS',
    title: 'Annular Packing Element, Shaffer Spherical Style 13-5/8" 10K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Packing Element',
    fitsOem: 'Shaffer Spherical 13-5/8" 10K',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material: ELAST_MAT_HNBR,
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    oneLiner:
      'Shaffer Spherical style annular packing element, 13-5/8" 10K, HNBR sour-service. For Shaffer-equipped 13-5/8" 10K BOP stacks — common on KOC and Iraq south rig fleet.',
    designNote:
      'The 13-5/8" 10K Shaffer Spherical annular packing element is the Shaffer-equivalent of the Hydril GK element — different sub geometry, but same operating envelope. Stock for rigs running Shaffer-equipped BOP stacks.',
    applications: [
      'Shaffer-equipped 13-5/8" 10K BOP stack element replacement',
      'KOC and Iraq south rig fleet annular service',
      '12-month annual redress on Shaffer-equipped rigs',
      'Replacement element for end-of-service-life Shaffer Spherical units',
    ],
    oemKeywords: ['Shaffer Spherical 13-5/8" 10K element', 'NOV Pressure Control 13-5/8" 10K Shaffer element'],
    leadTimeDays: 30,
    unitOfMeasure: 'each',
  },

  // ── Ram Block Assemblies (4) ────────────────────────────────────────────
  {
    sku: 'IH-BOP-RB-PIPE-CAM-U-13-58-10K-5DP-INDUS',
    title: 'Pipe Ram Block Assembly, Cameron U Style 13-5/8" 10K, for 5" Drill Pipe, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram-blocks',
    spareType: 'Pipe Ram Block Assembly',
    fitsOem: 'Cameron U 13-5/8" 10K (also fits Cameron UII)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: '5" drill pipe (5.000" OD)',
    material:
      'Forged AISI 4130 alloy steel block (NACE MR0175 hardness controlled, max 22 HRC); HNBR top seal, front packer, side packers',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents: 'Pipe ram block (1) + top seal (1) + front packer (1) + side packers (2) + ram screws (4) + assembly grease (1 tube) — single cavity',
    oneLiner:
      'Pipe ram block assembly, Cameron U style 13-5/8" 10K, sized for 5" drill pipe, sour service. The most-consumed ram block in the GCC mainstream 13-5/8" 10K development BOP stack.',
    designNote:
      'The Cameron-U-style pipe ram block sized for 5" drill pipe is the regional workhorse ram block. Block body lasts multiple redress cycles; soft goods replaced annually per Aramco-style 12-month redress. HNBR sour-service standard.',
    applications: [
      'Cameron U 13-5/8" 10K ram block replacement (one cavity)',
      'Mainstream development drilling running 5" DP',
      'Aramco / ADNOC / KOC / PDO land BOP stack maintenance',
      '12-month annual redress per Saudi Aramco specification',
    ],
    oemKeywords: ['Cameron U 13-5/8" 10K pipe ram', 'Cameron UII pipe ram 13-5/8" 10K', 'Shaffer LWS pipe ram 13-5/8" 10K'],
    leadTimeDays: 30,
    unitOfMeasure: 'set',
  },
  {
    sku: 'IH-BOP-RB-PIPE-CAM-U-11-10K-5DP-INDUS',
    title: 'Pipe Ram Block Assembly, Cameron U Style 11" 10K, for 5" Drill Pipe, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram-blocks',
    spareType: 'Pipe Ram Block Assembly',
    fitsOem: 'Cameron U 11" 10K',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: '5" drill pipe (5.000" OD)',
    material:
      'Forged AISI 4130 alloy steel block (NACE MR0175 hardness controlled); HNBR top seal, front packer, side packers',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents: 'Pipe ram block (1) + top seal (1) + front packer (1) + side packers (2) + ram screws (4) + assembly grease (1 tube) — single cavity',
    oneLiner:
      'Pipe ram block assembly, Cameron U style 11" 10K, sized for 5" drill pipe, sour service. The slim-hole / workover ram block for sour-service infill drilling across the GCC.',
    designNote:
      'The Cameron-U-style pipe ram block for 11" 10K BOP cavities — slim-hole / workover variant. Sized for 5" DP (the most common workover string OD). HNBR sour-service standard.',
    applications: [
      'Cameron U 11" 10K ram block replacement (one cavity)',
      'Slim-hole infill drilling',
      'Workover BOP stack maintenance on sour wells',
      'CT and snubbing prep ram block replacement',
    ],
    oemKeywords: ['Cameron U 11" 10K pipe ram', 'Shaffer SL pipe ram 11" 10K', 'Hydril V 11" 10K pipe ram'],
    leadTimeDays: 30,
    unitOfMeasure: 'set',
  },
  {
    sku: 'IH-BOP-RB-VBR-CAM-U-11-10K-3-5-INDUS',
    title: 'Variable Bore Ram (VBR) Block Assembly, Cameron U Style 11" 10K, 3-1/2"–5" Range, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram-blocks',
    spareType: 'Variable Bore Ram (VBR) Block',
    fitsOem: 'Cameron U / UII 11" 10K (VBR-II compatible)',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: '3-1/2" to 5" pipe / tubing OD range',
    material:
      'Forged AISI 4130 alloy steel block (NACE MR0175 hardness controlled); HNBR top seal, multi-segment front packer with steel inserts, side packers',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents: 'VBR block (1) + top seal (1) + multi-segment front packer (1 set) + side packers (2) + ram screws (4) + assembly grease (1 tube) — single cavity',
    oneLiner:
      'Variable Bore Ram (VBR) block assembly, Cameron U style 11" 10K, 3-1/2"–5" pipe range, sour service. Multi-OD pipe ram for multi-tubular drilling and workover programmes — higher wear than fixed-OD pipe rams.',
    designNote:
      'The Cameron-U-style VBR (variable bore ram) seals on a range of pipe ODs (3-1/2" to 5") — used on multi-tubular drilling programmes where the same cavity must seal different string ODs. Higher wear rate than fixed-OD pipe rams; annual redress is the norm. HNBR sour-service standard.',
    applications: [
      'Multi-tubular drilling and workover programmes',
      'Aramco / KOC infill drilling with multiple casing strings',
      'Workover stacks running multiple tubing sizes',
      '12-month annual redress on VBR-equipped cavities',
    ],
    oemKeywords: ['Cameron VBR-II 11" 10K 3-1/2"–5"', 'Shaffer SL VBR 11" 10K', 'Hydril V VBR 11" 10K'],
    leadTimeDays: 45,
    unitOfMeasure: 'set',
  },
  {
    sku: 'IH-BOP-RB-VBR-CAM-U-13-58-10K-5-7-INDUS',
    title: 'Variable Bore Ram (VBR) Block Assembly, Cameron U Style 13-5/8" 10K, 5"–7" Range, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram-blocks',
    spareType: 'Variable Bore Ram (VBR) Block',
    fitsOem: 'Cameron U / UII 13-5/8" 10K (VBR-II compatible)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: '5" to 7" pipe / casing OD range',
    material:
      'Forged AISI 4130 alloy steel block (NACE MR0175 hardness controlled); HNBR top seal, multi-segment front packer with steel inserts, side packers',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents: 'VBR block (1) + top seal (1) + multi-segment front packer (1 set) + side packers (2) + ram screws (4) + assembly grease (1 tube) — single cavity',
    oneLiner:
      'Variable Bore Ram (VBR) block assembly, Cameron U style 13-5/8" 10K, 5"–7" pipe range, sour service. Multi-OD pipe ram for the mainstream 13-5/8" 10K stack on multi-tubular development drilling.',
    designNote:
      'The Cameron-U-style VBR sized 5"–7" — used on the 13-5/8" 10K mainstream stack where the ram cavity must seal both 5" DP and 7" casing during a single well. HNBR sour-service standard.',
    applications: [
      'Mainstream 13-5/8" 10K development drilling on multi-tubular wells',
      'Aramco / ADNOC / KOC / PDO development drilling',
      'Workover stacks adapted to development wellheads',
      '12-month annual redress',
    ],
    oemKeywords: ['Cameron VBR-II 13-5/8" 10K 5"–7"', 'Shaffer LWS VBR 13-5/8" 10K', 'Hydril V VBR 13-5/8" 10K'],
    leadTimeDays: 45,
    unitOfMeasure: 'set',
  },

  // ── Blind-Shear Ram Block (1) ───────────────────────────────────────────
  {
    sku: 'IH-BOP-RB-BLIND-SHEAR-CAM-U-13-58-10K-INDUS',
    title: 'Blind-Shear Ram Block Assembly, Cameron U Style 13-5/8" 10K, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram-blocks',
    spareType: 'Blind-Shear Ram Block',
    fitsOem: 'Cameron U / UII 13-5/8" 10K (Type-U "ISR" compatible)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: 'Up to 5-1/2" drill pipe — shears API-grade S135 / G105 / E75 drill pipe',
    material:
      'Forged AISI 4130 alloy steel block with hardened H13 tool-steel shear blade inserts; HNBR top seal, blind-face seal',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents: 'Blind-shear ram block (1) + shear blade inserts (top + bottom) + top seal (1) + blind-face seal (1) + ram screws (4) + assembly grease (1 tube) — single cavity',
    oneLiner:
      'Blind-shear ram block assembly, Cameron U style 13-5/8" 10K, sour service. Shears drill pipe and seals the bore in a single closure — the last-resort BOP function on every land and offshore stack.',
    designNote:
      'The Cameron-U-style blind-shear ram block ("Type U ISR" or "Super Shear") cuts through drill pipe with hardened H13 tool-steel shear blade inserts and seals the open bore with the HNBR blind-face seal — combined function on a single closure. Blade inserts replaced after any shear event; H₂S-grade required across most GCC basins.',
    applications: [
      'Last-resort blind-shear function on every land BOP stack (mandatory per API STD 53)',
      'Mainstream 13-5/8" 10K development drilling',
      'Aramco / ADNOC / KOC blind-shear ram replacement post-shear-event',
      'Subsea stack blind-shear ram replacement',
    ],
    oemKeywords: ['Cameron U Type ISR blind-shear 13-5/8" 10K', 'Shaffer NXT-S 13-5/8" 10K blind-shear', 'NOV Pressure Control blind-shear 13-5/8" 10K'],
    leadTimeDays: 60,
    unitOfMeasure: 'set',
  },

  // ── Critical Consumables (3) ────────────────────────────────────────────
  {
    sku: 'IH-BOP-RG-BX-SET-INC625-INDUS',
    title: 'API 6A BX Ring Gasket Set (BX-152, BX-154, BX-155, BX-158, BX-160, BX-169), Inconel-625-Clad Sour Service',
    categorySlug: 'bop-spare-parts',
    spareType: 'Ring Gasket Set',
    fitsOem: 'API 6A flanges 7-1/16" / 11" / 13-5/8" / 18-3/4" — Cameron / FMC / Stream-Flo / NOV / WOM wellheads + BOPs',
    bore: 'N/A',
    pressureClass: 'N/A',
    serviceClass: 'Sour Service (NACE MR0175)',
    ringGasketType: 'BX',
    material: SOUR_GASKET_MAT,
    apiSpec: '6A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'BX-152 (×2), BX-154 (×2), BX-155 (×2), BX-158 (×2), BX-160 (×2), BX-169 (×2) — soft-iron body with Inconel-625 cladding on the seating surface — covers 7-1/16", 11", 13-5/8", and 18-3/4" API 6A flange sizes',
    oneLiner:
      'API 6A BX ring gasket set covering BX-152 / 154 / 155 / 158 / 160 / 169 — all common BOP & wellhead flange sizes (7-1/16", 11", 13-5/8", 18-3/4") in soft iron with Inconel-625 cladding for sour-service. Sold by the box.',
    designNote:
      'Ring gaskets are consumed every nipple-up — once a gasket is energised, it should never be re-used. The BX-152 / 154 / 155 / 158 / 160 / 169 combination covers all common BOP-and-wellhead flange sizes. Inconel-625-clad seating surface is the GCC sour-service default; solid Inconel or 316L stainless on request.',
    applications: [
      'Every BOP stack nipple-up (consumed each time)',
      'Wellhead flange make-up',
      'Choke & kill manifold flange make-up',
      'Drilling spool / DSA / adapter flange installation',
      'Stock by the box for the rig fleet',
    ],
    oemKeywords: ['API 6A BX ring gasket', 'Cameron BX gasket', 'FMC BX gasket', 'Wood BX gasket'],
    leadTimeDays: 14,
    unitOfMeasure: 'set',
  },
  {
    sku: 'IH-BOP-STUD-B7M-13-58-10K-INDUS',
    title: 'API 6A Stud & Heavy Hex Nut Kit, ASTM A193 B7M / A194 2HM, Sour Service — for 13-5/8" 10K Flange',
    categorySlug: 'bop-spare-parts',
    spareType: 'Stud & Nut Kit',
    fitsOem: 'API 6A 13-5/8" 10K flange — Cameron / FMC / Stream-Flo / NOV / WOM wellheads + BOPs',
    bore: '13-5/8"',
    pressureClass: '10K',
    workingPressurePsi: 10000,
    serviceClass: 'Sour Service (NACE MR0175)',
    boltGrade: 'B7M',
    material: SOUR_BOLT_MAT,
    apiSpec: '6A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'ASTM A193 B7M studs (12-count, 1-1/4"-8 UN × 9-1/2" length per API 6A 13-5/8" 10K) + ASTM A194 2HM heavy-hex nuts (24-count, top + bottom) — phos-coated, anti-seize on threads',
    oneLiner:
      'API 6A flange stud & 2HM nut kit for the 13-5/8" 10K flange — ASTM A193 B7M studs (sour-service grade per NACE MR0175) and ASTM A194 2HM heavy hex nuts. Highest dollar-volume bulk consumable in BOP nipple-up.',
    designNote:
      'Studs and nuts are replaced when surface condition shows galling, corrosion, or stretch beyond limits. B7M (HRC ≤ 22) is the GCC sour-service default; L7M for low-temperature sour. API 20E BSL-2 / BSL-3 traceability available on request.',
    applications: [
      'BOP / wellhead 13-5/8" 10K flange make-up bolting',
      'Aramco / ADNOC / KOC / PDO sour-service drilling',
      'Replacement bolting on existing flanges (stretched / galled bolts)',
      'New-build BOP installation bolting',
    ],
    oemKeywords: ['API 6A B7M stud kit 13-5/8" 10K', 'ASTM A193 B7M', 'ASTM A194 2HM heavy hex nut'],
    leadTimeDays: 21,
    unitOfMeasure: 'kit',
  },
  {
    sku: 'IH-BOP-BS-CAM-U-13-58-10K-INDUS',
    title: 'Bonnet Seal Rebuild Kit, Cameron U Style 13-5/8" 10K, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Bonnet Seal Kit',
    fitsOem: 'Cameron U / UII 13-5/8" 10K (single bonnet)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material:
      'HNBR primary bonnet seals + AFLAS backup secondary seals (sour-service grade); stainless steel anti-extrusion rings; phos-coated retainer screws',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'Primary bonnet seal (1) + secondary backup seal (1) + anti-extrusion rings (2) + bonnet retainer screws (8) + locking screw seals (4) + assembly grease (1 tube) — for one bonnet',
    oneLiner:
      'Bonnet seal rebuild kit for one Cameron U style 13-5/8" 10K BOP bonnet — HNBR primary + AFLAS backup + anti-extrusion rings + retainer screws. Replaced at every BOP recertification (3–5 yr) and on-rig field redress.',
    designNote:
      'Bonnet seals are replaced when the BOP bonnet is opened to swap ram blocks — always at the 5-year recertification, often at the 12-month annual redress, and on any field intervention that opens the bonnet. HNBR primary + AFLAS backup is the GCC sour-service default.',
    applications: [
      'Cameron U 13-5/8" 10K BOP bonnet rebuild (one bonnet)',
      '5-year API 16A major recertification',
      '12-month annual redress when bonnet is opened',
      'Field replacement of leaking bonnet seal',
    ],
    oemKeywords: ['Cameron U bonnet seal kit 13-5/8" 10K', 'Cameron UII bonnet seal kit', 'Shaffer LWS door seal kit 13-5/8" 10K'],
    leadTimeDays: 30,
    unitOfMeasure: 'kit',
  },

  // ── Cross-Sell Bundles (4) ──────────────────────────────────────────────
  {
    sku: 'IH-BOP-KIT-RAM-REDRESS-CAM-U-13-58-10K-INDUS',
    title: 'Ram Redress Kit (Per Cavity), Cameron U Style 13-5/8" 10K, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Ram Redress Kit',
    fitsOem: 'Cameron U / UII 13-5/8" 10K (single cavity)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    pipeOrTubingSize: 'Specify on RFQ — sized for 5", 5-1/2" DP, or 7" casing',
    material:
      'HNBR top seal + HNBR front packer + HNBR side packers; phos-coated ram screws; assembly grease — sour-service grade throughout',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'Top seal (1) + front packer (1, sized to your RFQ) + side packers (2) + ram screws (4) + assembly grease (1 tube) + step-by-step redress instructions — for ONE cavity. Bundle ×2 for a double-ram BOP, ×3 for a triple-ram BOP.',
    oneLiner:
      'Ram Redress Kit (per cavity) for Cameron U style 13-5/8" 10K BOPs — top seal + front packer + side packers + ram screws + grease, packaged ready for one-cavity rebuild. Order one kit per cavity per BOP per redress.',
    designNote:
      'The Ram Redress Kit is the converted-bundle version of "the ram packer family I always order together at redress" — single-cavity packaging that matches how ram redress is actually performed in the field. HNBR sour-service grade by default. Specify pipe OD on RFQ to size the front packer.',
    applications: [
      '12-month annual redress per Saudi Aramco specification',
      'On-rig field rebuild after pressure-test failure',
      'Ram-block redress at 5-year API 16A recertification',
      'Pre-shipment ram-redress before mobilising the rig',
    ],
    oemKeywords: ['Cameron U ram redress kit 13-5/8" 10K', 'Cameron UII ram redress kit'],
    leadTimeDays: 30,
    unitOfMeasure: 'kit',
  },
  {
    sku: 'IH-BOP-KIT-ANN-ELE-HEADSEAL-HYDRIL-GK-13-58-5K-INDUS',
    title: 'Annular Element + Head Seal Kit, Hydril GK Style 13-5/8" 5K, HNBR Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'Annular Element + Head Seal Kit',
    fitsOem: 'Hydril GK 13-5/8" 5K',
    bore: '13-5/8"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material:
      'HNBR annular packing element + HNBR head seal + HNBR piston seal + bronze wear plate; sour-service grade throughout',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'Annular packing element (1) + head seal (1) + piston seal (1) + wear plate (1) + assembly grease (1 tube) + step-by-step instructions — complete annular rebuild for a Hydril GK 13-5/8" 5K',
    oneLiner:
      'Annular Element + Head Seal Kit for Hydril GK style 13-5/8" 5K BOPs — packing element + head seal + piston seal + wear plate + grease, complete annular rebuild bundle. Order one kit per annular per redress cycle.',
    designNote:
      'The Annular Element + Head Seal Kit is the converted-bundle version of "the annular soft-goods I always order together at redress" — complete annular rebuild packaging. HNBR sour-service grade by default for the 13-5/8" 5K Hydril GK annular.',
    applications: [
      '12-month annual redress on 13-5/8" 5K Hydril GK annulars',
      'Field rebuild after pressure-test failure',
      'Pre-shipment rebuild before mobilising the rig',
      '5-year API 16A annular overhaul',
    ],
    oemKeywords: ['Hydril GK 13-5/8" 5K rebuild kit', 'Hydril GK annular element + head seal'],
    leadTimeDays: 30,
    unitOfMeasure: 'kit',
  },
  {
    sku: 'IH-BOP-KIT-NIPPLE-UP-13-58-10K-SOUR-INDUS',
    title: 'BOP Nipple-Up Kit (BX-160 Gasket + B7M Studs + 2HM Nuts + Compound), 13-5/8" 10K, Sour Service',
    categorySlug: 'bop-spare-parts',
    spareType: 'BOP Nipple-Up Kit',
    fitsOem: 'API 6A 13-5/8" 10K flange',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    boltGrade: 'B7M',
    ringGasketType: 'BX',
    material:
      'BX-160 ring gasket (Inconel-625-clad sour service) + ASTM A193 B7M studs + ASTM A194 2HM nuts + Molykote anti-seize thread compound',
    apiSpec: '6A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'BX-160 ring gasket (×1, Inconel-625-clad) + B7M studs (×12, 1-1/4"-8 UN × 9-1/2") + 2HM heavy-hex nuts (×24, top + bottom) + Molykote anti-seize thread compound (1 tube) — one-shot SKU for a single 13-5/8" 10K flange make-up',
    oneLiner:
      'One-shot BOP Nipple-Up Kit for a 13-5/8" 10K flange — BX-160 gasket + B7M studs + 2HM nuts + thread compound, packaged ready for a single flange make-up. The "one part number per flange" buyer convenience SKU.',
    designNote:
      'The BOP Nipple-Up Kit converts "find a gasket, find studs, find nuts, find thread compound" into a single SKU per flange — every part needed for one flange make-up. Sour-service grade throughout. Order one kit per flange make-up.',
    applications: [
      'BOP stack nipple-up (one kit per flange)',
      'Wellhead-to-BOP make-up',
      'Drilling spool / DSA / adapter flange installation',
      'Choke & kill manifold flange make-up',
    ],
    oemKeywords: ['BOP nipple-up kit 13-5/8" 10K', 'BX-160 + B7M stud kit'],
    leadTimeDays: 14,
    unitOfMeasure: 'kit',
  },
  {
    sku: 'IH-BOP-KIT-KOOMEY-5YR-SOFTGOODS-INDUS',
    title: 'Koomey 5-Year Soft Goods Kit (SPM Seals + Diaphragms + Bladders + Pilot Hose Set), API 16D',
    categorySlug: 'bop-spare-parts',
    spareType: 'Koomey Soft Goods Kit',
    fitsOem: 'Koomey Type 80 / Type 100 BOP control units (Cameron lineage); also fits Pacseal Type 80 and NOV Pressure Control Type 80',
    bore: 'N/A',
    pressureClass: 'N/A',
    serviceClass: 'Standard',
    elastomerCompound: 'HNBR',
    material:
      'HNBR / Buna-N seal kit assortment for SPM valves (1" and 3/4" sizes), regulator diaphragms, accumulator bladders, pilot air-hydraulic pump rebuild kits, and pilot control hose set per API 16D',
    apiSpec: '16A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'SPM 1" valve seal kits (×6) + SPM 3/4" valve seal kits (×4) + annular regulator diaphragm (×1) + manifold regulator diaphragm (×1) + accumulator bladder kit (×3 for 11-station 80 gal unit) + air-hydraulic pump rebuild kit (×1) + electric pump rebuild kit (×1) + pilot control hose set (×11) — full 5-year soft-goods refresh for an 11-station Koomey Type 80',
    oneLiner:
      'Koomey 5-Year Soft Goods Kit for API 16D recertification — SPM seal kits + regulator diaphragms + accumulator bladders + pilot hose set. Complete 5-year refresh in a single SKU.',
    designNote:
      'The Koomey 5-Year Soft Goods Kit is the BOP control unit equivalent of the BOP nipple-up kit — converts "every soft good I need at 5-year API 16D recertification" into a single SKU. Sized for the 11-station Koomey Type 80; configurable on RFQ for Type 100 or other station counts.',
    applications: [
      '5-year API 16D Koomey recertification',
      'Mid-life Koomey overhaul',
      'Pre-mobilisation refresh on rig BOP control units',
      'Workover / mobile pressure-control unit refresh',
    ],
    oemKeywords: ['Koomey 5-year soft goods kit', 'Koomey Type 80 SPM kit', 'Pacseal soft goods', 'API 16D recert kit'],
    leadTimeDays: 45,
    unitOfMeasure: 'kit',
  },

  // ── BOP Test Plug & Lift Sub Set (1) ────────────────────────────────────
  {
    sku: 'IH-BOP-TP-LIFT-13-58-10K-INDUS',
    title: 'BOP Test Plug & Lift Sub Set, 13-5/8" 10K, NC50 / 5-1/2" FH Connections, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spare-parts',
    spareType: 'BOP Test Plug & Lift Sub Set',
    fitsOem: 'API 6A 13-5/8" 10K wellhead bowl; NC50 / 5-1/2" FH drill-pipe connections',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    elastomerCompound: 'HNBR',
    material:
      'Forged AISI 4130 alloy steel body (NACE MR0175 hardness controlled); HNBR cup-style sealing element; phos-coated drill-pipe connection',
    apiSpec: '6A',
    temperatureRating: SOUR_TEMP,
    kitContents:
      'BOP test plug 13-5/8" 10K (cup-style, ×1) + lift sub NC50 box × NC50 pin (×1) + lift sub NC50 box × 5-1/2" FH pin (×1) + junk sub 13-5/8" 10K (×1) + test stump gasket set (×4) — drilling consumables for BOP testing',
    oneLiner:
      'BOP Test Plug & Lift Sub Set for 13-5/8" 10K wellheads — test plug + matched lift subs (NC50 / 5-1/2" FH) + junk sub + test stump gaskets. Drilling consumables consumed every rig move.',
    designNote:
      'The BOP Test Pack converts "every drilling consumable used during BOP nipple-up and testing" into a single SKU. Sour-service grade. Specify drill-pipe connection (NC50 / 5-1/2" FH most common) on RFQ.',
    applications: [
      'BOP testing consumables (per API STD 53 schedule)',
      'BOP nipple-up consumables',
      'Wear bushing handling',
      'Stock per rig in the GCC fleet',
    ],
    oemKeywords: ['BOP test plug 13-5/8" 10K', 'cup-style BOP test plug', 'lift sub NC50', 'lift sub 5-1/2" FH', 'junk sub 13-5/8" 10K'],
    leadTimeDays: 21,
    unitOfMeasure: 'set',
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-11-bop-spares',
    description:
      'Adds 18 Tier 1 BOP spare parts and cross-sell bundles to the BOP catalogue tree (created by 2026-05-11-bop-equipment.ts). Annular packing elements (5), pipe ram blocks (2), VBR blocks (2), blind-shear ram block (1), critical consumables (3 — BX gaskets, B7M stud kit, bonnet seal kit), cross-sell bundles (4 — ram redress, annular + head seal, BOP nipple-up, koomey 5-yr softgoods), BOP test pack (1). HNBR / AFLAS sour-service defaults; HNBR / Inconel-625 / B7M / 2HM regional convention.',
  },

  brands: [],

  categories: [],

  specTemplates: [],

  products: SPARES.map(makeSpareProduct),
}

export default batch
