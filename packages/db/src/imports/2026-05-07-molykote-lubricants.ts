/**
 * Bulk Molykote Lubricants import — 2026-05-07
 *
 * 63 specialty lubricants from the Molykote (DuPont / Dow Performance
 * Lubricants) range across 5 NEW sub-categories under a NEW top-level
 * `lubricants` master category. Introduces a NEW 7th megamenu top-level
 * column "Lubricants" with one Molykote sub-section.
 *
 * Adds:
 *   - 1 NEW brand: Molykote (USA, isAuthorizedDistributor: true)
 *   - 1 NEW top-level master category: `lubricants`
 *   - 5 NEW sub-categories under `lubricants`:
 *     greases, pastes, compounds, anti-friction-coatings, specialty
 *   - 1 NEW spec template: `lubricant-spec` (12 fields)
 *   - 63 products (SKU pattern: IH-LUB-{model})
 *   - NEW 7th megamenu top-level column "Lubricants" with the Molykote
 *     sub-section auto-created (uses createColumnIfMissing + createSubSectionIfMissing)
 *
 * Spec values are inferred from product names + family-level Molykote-catalog
 * defaults. Refine in admin once datasheet specifics are available.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-molykote-lubricants.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-molykote-lubricants.ts
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
  | 'brandSlug'
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
  | 'countryOfOrigin'
> = {
  brandSlug: 'molykote',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 7,
  countryOfOrigin: 'USA',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Type model ────────────────────────────────────────────────────────────

type ProductType = 'grease' | 'paste' | 'compound' | 'anti-friction' | 'specialty'

type MolykoteInput = {
  sku: string
  title: string
  category: string
  productType: ProductType
}

const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  grease: 'Grease',
  paste: 'Paste',
  compound: 'Compound',
  'anti-friction': 'Anti-Friction Coating',
  specialty: 'Specialty Lubricant',
}

// Family-level defaults (per product type) — used to populate the spec
// values when the product name doesn't carry the relevant info.
const TYPE_DESCRIPTION: Record<ProductType, string> = {
  grease:
    'A specialty Molykote grease formulated for hydraulic, bearing, gear, or food-grade service. Pair with the host equipment per its OEM lubricant chart.',
  paste:
    'A solid-lubricant Molykote paste for assembly, anti-seize, threaded-fastener, or running-in service. Withstands extreme assembly temperatures.',
  compound:
    'A specialty Molykote compound (silicone, sealant, or grinding) for industrial sealing, dielectric, corrosion-protection, or grinding/lapping service.',
  'anti-friction':
    'A bonded dry-film Molykote anti-friction coating that lubricates without grease. Suitable where grease cannot be retained — extreme temperature, vacuum, dust, or food contact.',
  specialty:
    'A specialty Molykote lubricant — refer to product datasheet for application guidance.',
}

const TYPE_NLGI_DEFAULT: Record<ProductType, string> = {
  grease: 'Refer to datasheet (typical: NLGI 2)',
  paste: 'N/A (paste, not NLGI-graded)',
  compound: 'N/A (compound, not NLGI-graded)',
  'anti-friction': 'N/A (dry film coating)',
  specialty: 'N/A',
}

const TYPE_BASE_OIL: Record<ProductType, string> = {
  grease: 'Mineral / synthetic / silicone / PFPE (per product datasheet)',
  paste: 'Mineral oil + solid lubricants (MoS2 / graphite / copper / PTFE per datasheet)',
  compound: 'Silicone (typical) — per datasheet',
  'anti-friction': 'Resin-bonded MoS2 / graphite / PTFE (binder per datasheet)',
  specialty: 'Per datasheet',
}

const TYPE_TEMP_RANGE: Record<ProductType, string> = {
  grease: '-40°C to +200°C (typical; refer to datasheet for product-specific limits)',
  paste:
    '-30°C to +1100°C (Molykote pastes can withstand assembly temperatures into the copper-melt range)',
  compound: '-40°C to +200°C (silicone compounds, typical)',
  'anti-friction':
    '-180°C to +450°C (bonded dry-film coatings withstand extreme temperature beyond grease range)',
  specialty: '-30°C to +250°C (typical)',
}

const TYPE_APPLICATIONS: Record<ProductType, string> = {
  grease:
    'Bearings, gears, slides, seals, valve stems, and general industrial / hydraulic lubrication.',
  paste:
    'Threaded-fastener anti-seize, press-fit assembly, valve stems, splines, running-in of new components, high-temperature bolt lubrication.',
  compound:
    'Electrical insulation, dielectric protection, gasket sealing, valve-stem corrosion protection, optical-fibre splice, grinding / lapping.',
  'anti-friction':
    'Sliding contacts, fasteners, locks, hinges, mechanisms in dust / vacuum / extreme temperature where grease cannot be retained.',
  specialty: 'Refer to product datasheet for application guidance.',
}

// ── HTML description builder ──────────────────────────────────────────────

function molykoteHtml(g: MolykoteInput): string {
  return `<p>The <strong>${escape(g.title)}</strong> is a Molykote ${escape(PRODUCT_TYPE_LABEL[g.productType])} from the DuPont / Dow Performance Lubricants range. ${escape(TYPE_DESCRIPTION[g.productType])}</p>
<h3>Product type</h3>
<ul>
<li>Type: ${escape(PRODUCT_TYPE_LABEL[g.productType])}</li>
<li>NLGI grade: ${escape(TYPE_NLGI_DEFAULT[g.productType])}</li>
<li>Base oil / chemistry: ${escape(TYPE_BASE_OIL[g.productType])}</li>
<li>Operating temperature range: ${escape(TYPE_TEMP_RANGE[g.productType])}</li>
</ul>
<h3>Typical applications</h3>
<p>${escape(TYPE_APPLICATIONS[g.productType])}</p>
<h3>Container sizes</h3>
<p>Available in standard Molykote container sizes — typically 50 g tubes, 1 kg tins, 5 kg pails, and 25 kg drums depending on the product. Confirm exact pack sizes on the RFQ.</p>
<h3>Compatibility &amp; certifications</h3>
<p>Many Molykote products carry NSF H1 / H2 food-grade approvals, OEM specifications (Caterpillar, Komatsu, JCB, Volvo, etc.), and ISO 12922 / DIN 51825 / ISO 6743 industrial classifications. Refer to the product datasheet for specific approvals — Indus engineering will confirm compatibility for your application on the RFQ.</p>
<h3>How to order</h3>
<p>Specify (a) the Molykote part number (this product is <strong>${escape(g.title)}</strong>), (b) container size, and (c) quantity. For multi-pack discounts and project-quantity pricing, mention the project name and target delivery date.</p>
<h3>Companion products</h3>
<p>Browse the Molykote sub-section under Lubricants for compatible greases, pastes, compounds, and anti-friction coatings. Indus is an authorised Molykote distributor — full product range available on quote.</p>`
}

// ── FAQs (8 per product) ──────────────────────────────────────────────────

function molykoteFaqs(g: MolykoteInput): FaqEntry[] {
  return [
    {
      q: 'What is this product used for?',
      a: TYPE_APPLICATIONS[g.productType],
    },
    {
      q: 'What is the operating temperature range?',
      a: `${TYPE_TEMP_RANGE[g.productType]}. The product datasheet specifies the exact limit for ${g.title} — Indus engineering will confirm on the RFQ if you provide your operating conditions.`,
    },
    {
      q: 'What container sizes are available?',
      a: 'Standard Molykote container sizes — typically 50 g tubes, 1 kg tins, 5 kg pails, and 25 kg drums depending on the product. Some specialty products are also available in 400 g cartridges. Confirm exact pack sizes on the RFQ.',
    },
    {
      q: 'Is this product food-grade certified?',
      a: 'Some Molykote products carry NSF H1 (incidental food contact) or NSF H2 (no food contact) approvals. Check the product datasheet for ' + g.title + ' specifically — Indus engineering will confirm on the RFQ. NEVER assume food-grade unless explicitly certified.',
    },
    {
      q: 'How does this compare to standard greases?',
      a: g.productType === 'grease'
        ? 'Molykote greases are formulated for specific applications (chemical-resistant, food-grade, high/low temperature, EP, etc.) where standard mineral greases would fail. Match the product to your operating conditions.'
        : g.productType === 'paste'
          ? 'Pastes contain a high concentration of solid lubricants (MoS2, graphite, copper, PTFE) — they protect threads, splines, and contact surfaces under load and at temperatures where grease would melt out.'
          : g.productType === 'compound'
            ? 'Compounds are silicone-based or sealant-grade — they provide dielectric protection, corrosion sealing, or grinding action rather than rolling-element lubrication.'
            : g.productType === 'anti-friction'
              ? 'Bonded dry-film coatings adhere permanently to the substrate and lubricate without bleeding — ideal where any grease residue would attract contaminants (food contact, vacuum service, semiconductor manufacturing).'
              : 'Refer to the product datasheet — specialty Molykote products are formulated for specific industries / OEM specifications.',
    },
    {
      q: 'Is Indus an authorised Molykote distributor?',
      a: 'Yes — Indus Hydraulics is an authorised Molykote distributor in the UAE. All Molykote products supplied by Indus are factory-original, with valid batch records and shelf-life dates. Counterfeit Molykote is prevalent in the regional market — always insist on authorised-distributor channels.',
    },
    {
      q: 'What is the shelf life?',
      a: 'Most Molykote greases and pastes have a 24-36 month shelf life from manufacture date when stored in the original sealed container at +5°C to +35°C. Anti-friction coatings (liquid pre-coat form) typically have 12 months. Bonded coatings already applied to parts are essentially indefinite. Indus rotates stock — newer batches go to the customer.',
    },
    {
      q: 'Lead time?',
      a: 'Common Molykote products are ex-stock from Dubai. Less-common specialty products typically ship within 2-3 weeks from RFQ confirmation (factory order from DuPont).',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeMolykote(g: MolykoteInput): ProductImportPayload {
  const oneLiner = `${g.title} — Molykote ${PRODUCT_TYPE_LABEL[g.productType]}. ${TYPE_DESCRIPTION[g.productType].split('.')[0]}.`

  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'lubricant-spec',
    descriptionShort: oneLiner.slice(0, 500),
    descriptionLong: molykoteHtml(g),
    specs: {
      product_type: g.productType,
      nlgi_grade: TYPE_NLGI_DEFAULT[g.productType],
      base_oil: TYPE_BASE_OIL[g.productType],
      operating_temperature_range: TYPE_TEMP_RANGE[g.productType],
      typical_applications: TYPE_APPLICATIONS[g.productType],
      container_sizes: 'Standard Molykote sizes (50 g tube, 1 kg tin, 5 kg pail, 25 kg drum — varies by product)',
      food_grade_status: 'Per product datasheet (some Molykote products are NSF H1 / H2 certified — confirm specific approvals on RFQ)',
      applicable_standards: 'Per product datasheet (ISO 12922 / DIN 51825 / ISO 6743 / OEM spec as applicable)',
    },
    faqs: molykoteFaqs(g),
    seoTitle: `${g.title} — Molykote ${PRODUCT_TYPE_LABEL[g.productType]} | Indus Hydraulics`.slice(0, 200),
    seoDescription: oneLiner.slice(0, 500),
    focusKeyword: `Molykote ${PRODUCT_TYPE_LABEL[g.productType]}`,
  }
}

// ── Spec template definition ──────────────────────────────────────────────

const LUBRICANT_SPEC: SpecTemplatePayload = {
  slug: 'lubricant-spec',
  name: 'Lubricant Spec',
  description:
    'Spec template for industrial lubricants: greases, pastes, compounds, anti-friction coatings, oils, and specialty lubricants. Captures product type, NLGI grade, base oil, operating temperature range, food-grade status, and typical applications.',
  position: 5,
  fields: [
    {
      key: 'product_type',
      label: 'Product Type',
      dataType: 'select',
      options: ['grease', 'paste', 'compound', 'anti-friction', 'specialty'],
      unit: null,
      group: 'Identification',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 0,
    },
    {
      key: 'nlgi_grade',
      label: 'NLGI Grade',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'base_oil',
      label: 'Base Oil / Chemistry',
      dataType: 'text',
      unit: null,
      group: 'Composition',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 2,
    },
    {
      key: 'thickener',
      label: 'Thickener',
      dataType: 'text',
      unit: null,
      group: 'Composition',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'solid_lubricants',
      label: 'Solid Lubricants',
      dataType: 'text',
      unit: null,
      group: 'Composition',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'operating_temperature_range',
      label: 'Operating Temperature Range',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 5,
    },
    {
      key: 'dropping_point',
      label: 'Dropping Point',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'flash_point',
      label: 'Flash Point',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'food_grade_status',
      label: 'Food-Grade Status',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'typical_applications',
      label: 'Typical Applications',
      dataType: 'text',
      unit: null,
      group: 'Application',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'container_sizes',
      label: 'Container Sizes',
      dataType: 'text',
      unit: null,
      group: 'Commercial',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'applicable_standards',
      label: 'Applicable Standards',
      dataType: 'text',
      unit: null,
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — generated from /Users/ayushkbhatia/Downloads/Molykote Products.xlsx
// ─────────────────────────────────────────────────────────────────────────

const MOLYKOTE: MolykoteInput[] = [
  { sku: 'IH-LUB-1000', title: 'Molykote 1000', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-1122-CHAIN-AND-OPEN-AIR-GREASE', title: 'Molykote 1122 Chain and Open Air Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-33-MED', title: 'Molykote 33 MED', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-41-EXTREME-HIGH-TEMPERATURE-BEARING-GREASE', title: 'Molykote 41 Extreme High Temperature Bearing Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-44-MED', title: 'Molykote 44 MED', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-44-LIGHT', title: 'Molykote 44 Light', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-55-O-RING-GREASE', title: 'Molykote 55 O-Ring Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-BG-20-GREASE', title: 'Molykote BG-20 Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-BR-2-PLUS', title: 'Molykote BR-2 Plus', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-DC-HVG', title: 'Molykote DC HVG', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-111-COMPOUND', title: 'Molykote 111 Compound', category: 'molykote-compounds', productType: 'compound' },
  { sku: 'IH-LUB-340', title: 'Molykote 340', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7', title: 'Molykote 7', category: 'molykote-compounds', productType: 'compound' },
  { sku: 'IH-LUB-DX-PASTE', title: 'Molykote DX Paste', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-EP', title: 'Molykote EP', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-EM-30L', title: 'Molykote EM-30L', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-G4500-MULTI-PURPOSE-SYNTHETIC-GREASE', title: 'Molykote G4500 Multi-Purpose Synthetic Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-G-RAPID-PLUS-PASTE-1KG', title: 'Molykote G Rapid Plus Paste 1KG', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-G5700', title: 'Molykote G5700', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-G4700-EXTREME-PRESSURE-SYNTHETIC-GREASE', title: 'Molykote G4700 Extreme Pressure Synthetic Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-HP-300', title: 'Molykote HP-300', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-HP-500', title: 'Molykote HP-500', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-HP-870', title: 'Molykote HP-870', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-CU-7435-PLUS', title: 'Molykote CU 7435 Plus', category: 'molykote-specialty-lubricants', productType: 'specialty' },
  { sku: 'IH-LUB-LONG-TERM-2-PLUS-EXTREME-PRESSURE', title: 'Molykote Long Term 2 Plus Extreme Pressure', category: 'molykote-specialty-lubricants', productType: 'specialty' },
  { sku: 'IH-LUB-LONG-TERM-W2-MULTI-PURPOSE', title: 'Molykote Long Term W2 Multi-Purpose', category: 'molykote-specialty-lubricants', productType: 'specialty' },
  { sku: 'IH-LUB-M-77-ASSEMBLY-PASTE', title: 'Molykote M-77 Assembly Paste', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-MULTILUB-HIGH-PERFORMANCE-GREASE', title: 'Molykote MultiLub High Performance Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-PG-54-PLASTISLIP-GREASE', title: 'Molykote PG-54 Plastislip Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-PG-75-PLASTISLIP-GREASE', title: 'Molykote PG-75 Plastislip Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-1102-GAS-COCK-GREASE', title: 'Molykote 1102 Gas Cock Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-3452-CHEMICAL-RESISTANT-VALVE-GREASE', title: 'Molykote 3452 Chemical Resistant Valve Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-3451-CHEMICAL-RESISTANT-BEARING-GREASE', title: 'Molykote 3451 Chemical Resistant Bearing Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-EP-GREASE', title: 'Molykote EP Grease', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-3402-C', title: 'Molykote 3402 C', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-3400-A', title: 'Molykote 3400 A', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-165-LT', title: 'Molykote 165 LT', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-165-LT-A', title: 'Molykote 165 LT (Variant 2)', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-1292', title: 'Molykote 1292', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-7409', title: 'Molykote 7409', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7405', title: 'Molykote 7405', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7414', title: 'Molykote 7414', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7400', title: 'Molykote 7400', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-739', title: 'Molykote 739', category: 'molykote-compounds', productType: 'compound' },
  { sku: 'IH-LUB-7438', title: 'Molykote 7438', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7439', title: 'Molykote 7439', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7325', title: 'Molykote 7325', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-7093', title: 'Molykote 7093', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-106-ANTI-FRICTION-COATING', title: 'Molykote 106 Anti Friction Coating', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-2-POWDER', title: 'Molykote 2 Powder', category: 'molykote-specialty-lubricants', productType: 'specialty' },
  { sku: 'IH-LUB-TP42-GREASE-PASTE-126865', title: 'Molykote TP42 Grease Paste 126865', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-HSC-PLUS-PASTE', title: 'Molykote HSC Plus Paste', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-D321-ANTI-FRICTION', title: 'Molykote D321 Anti-Friction', category: 'molykote-anti-friction-coatings', productType: 'anti-friction' },
  { sku: 'IH-LUB-P-1600', title: 'Molykote P-1600', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-P44-HIGH-TEMPERATURE-LUBRICANT', title: 'Molykote P44 High Temperature Lubricant', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-P33-LOW-TEMPERATURE-LUBRICANT', title: 'Molykote P33 Low Temperature Lubricant', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-CLOVER-COMPOUND', title: 'Molykote Clover Compound', category: 'molykote-compounds', productType: 'compound' },
  { sku: 'IH-LUB-SEPARATOR-SPRAY', title: 'Molykote Separator Spray', category: 'molykote-specialty-lubricants', productType: 'specialty' },
  { sku: 'IH-LUB-GN-PLUS', title: 'Molykote GN Plus', category: 'molykote-pastes', productType: 'paste' },
  { sku: 'IH-LUB-P40', title: 'Molykote P40', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-P37', title: 'Molykote P37', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-P74', title: 'Molykote P74', category: 'molykote-greases', productType: 'grease' },
  { sku: 'IH-LUB-33-MED-A', title: 'Molykote 33 MED (Variant 2)', category: 'molykote-greases', productType: 'grease' },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-molykote-lubricants',
    description:
      'Bulk-add 63 Molykote specialty lubricants (DuPont / Dow Performance Lubricants) across 5 NEW sub-categories under a NEW lubricants master category. Adds 1 new brand (Molykote, USA, authorised distributor), 1 new top-level master category, 1 new spec template (lubricant-spec, 12 fields). Adds a NEW 7th megamenu top-level column "Lubricants" with the Molykote sub-section auto-created via createColumnIfMissing + createSubSectionIfMissing.',
  },

  brands: [
    {
      slug: 'molykote',
      name: 'Molykote',
      description:
        'Molykote is the specialty-lubricants brand of DuPont (formerly Dow Performance Lubricants / Dow Corning). Established in 1948, Molykote is a global leader in solid-lubricant pastes, greases, anti-friction coatings, and specialty lubricants for industrial, automotive, aerospace, and food-processing applications.',
      country: 'USA',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Molykote Specialty Lubricants — Authorised Distributor | Indus Hydraulics',
      seoDescription:
        'Molykote specialty lubricants from DuPont — greases, pastes, compounds, anti-friction coatings. Indus Hydraulics is an authorised Molykote distributor in the UAE.',
    },
  ],

  categories: [
    {
      slug: 'lubricants',
      name: 'Lubricants',
      shortDescription:
        'Industrial specialty lubricants — greases, pastes, compounds, anti-friction coatings, and oils for hydraulic, bearing, gear, and assembly service.',
      position: 6,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Industrial Specialty Lubricants | Indus Hydraulics',
      seoDescription:
        'Specialty lubricants from Molykote (DuPont) and other authorised brands — greases, pastes, compounds, anti-friction coatings for industrial, marine, food-grade service.',
    },
    {
      slug: 'molykote-greases',
      name: 'Molykote Greases',
      parentSlug: 'lubricants',
      shortDescription:
        'Molykote specialty greases — multi-purpose, EP, high-temperature, low-temperature, food-grade, chemical-resistant, and OEM-spec. Lithium / calcium / polyurea / silicone thickeners.',
      position: 0,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Molykote Greases | Indus Hydraulics',
      seoDescription:
        'Molykote specialty greases: multi-purpose, EP, HT/LT, food-grade, chemical-resistant. Lithium / calcium / polyurea / silicone thickeners. Authorised distributor.',
    },
    {
      slug: 'molykote-pastes',
      name: 'Molykote Pastes',
      parentSlug: 'lubricants',
      shortDescription:
        'Molykote solid-lubricant pastes — assembly, anti-seize, threaded-fastener, running-in, and high-temperature service. MoS2, graphite, copper, and PTFE solid lubricants in mineral / synthetic carrier oils.',
      position: 1,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Molykote Pastes — Anti-Seize & Assembly | Indus Hydraulics',
      seoDescription:
        'Molykote solid-lubricant pastes: anti-seize, assembly, threaded-fastener, running-in. MoS2, graphite, copper, PTFE. Authorised distributor.',
    },
    {
      slug: 'molykote-compounds',
      name: 'Molykote Compounds',
      parentSlug: 'lubricants',
      shortDescription:
        'Molykote silicone compounds, dielectric compounds, sealant compounds, and grinding / lapping compounds for industrial sealing, electrical, and surface-finishing applications.',
      position: 2,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Molykote Compounds | Indus Hydraulics',
      seoDescription:
        'Molykote silicone, dielectric, sealant, and grinding compounds. Authorised distributor.',
    },
    {
      slug: 'molykote-anti-friction-coatings',
      name: 'Molykote Anti-Friction Coatings',
      parentSlug: 'lubricants',
      shortDescription:
        'Molykote bonded dry-film anti-friction coatings — lubricate without grease residue. MoS2, graphite, PTFE in resin binders. For sliding contacts, fasteners, mechanisms in extreme temperature / vacuum / dust / food contact.',
      position: 3,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Molykote Anti-Friction Coatings | Indus Hydraulics',
      seoDescription:
        'Molykote bonded dry-film anti-friction coatings — MoS2 / graphite / PTFE. Lubricate without grease residue. Authorised distributor.',
    },
    {
      slug: 'molykote-specialty-lubricants',
      name: 'Molykote Specialty Lubricants',
      parentSlug: 'lubricants',
      shortDescription:
        'Molykote specialty lubricants — sprays, powders, oils, and OEM-spec products that don\'t fit the standard grease / paste / compound / anti-friction categories.',
      position: 4,
      isPublished: true,
      defaultSpecTemplateSlug: 'lubricant-spec',
      seoTitle: 'Molykote Specialty Lubricants | Indus Hydraulics',
      seoDescription:
        'Molykote specialty lubricants — sprays, powders, oils, OEM-spec. Authorised distributor.',
    },
  ],

  specTemplates: [LUBRICANT_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'lubricants',
    createColumnIfMissing: true,
    newColumnLabel: 'Lubricants',
    parentSubLabel: 'Molykote',
    createSubSectionIfMissing: true,
    replacements: [
      { label: 'Greases', categorySlug: 'molykote-greases' },
      { label: 'Pastes', categorySlug: 'molykote-pastes' },
      { label: 'Compounds', categorySlug: 'molykote-compounds' },
      { label: 'Anti-Friction Coatings', categorySlug: 'molykote-anti-friction-coatings' },
      { label: 'Specialty Lubricants', categorySlug: 'molykote-specialty-lubricants' },
    ],
  },

  products: MOLYKOTE.map(makeMolykote),
}

export default batch
