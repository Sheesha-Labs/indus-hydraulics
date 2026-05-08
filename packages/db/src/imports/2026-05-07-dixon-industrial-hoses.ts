/**
 * Bulk Dixon Industrial Hoses import — 2026-05-07
 *
 * 46 industrial hose products from the Dixon Group Europe catalogue
 * (April 2018) across 9 NEW application-based sub-categories under a
 * NEW top-level `industrial-hoses` master category.
 *
 * Source: Dixon Hose Catalogue PDF (52 pages, 36 standard products + 7
 * metallic/PTFE families + 3 specialist hand-built ranges).
 *
 * Adds:
 *   - 1 NEW brand: Dixon (UK, isAuthorizedDistributor: true)
 *   - 1 NEW top-level master category: `industrial-hoses`
 *   - 9 NEW sub-categories: air-water, water-suction-delivery,
 *     food-beverage, oil-chemical-purpose, composite, industrial-steam,
 *     abrasive, metallic-ptfe, specialist
 *   - 1 NEW spec template: `industrial-hose-spec` (16 fields)
 *   - 46 products (SKU pattern: IH-IH-{DIXON-CODE})
 *   - NEW 9th megamenu top-level column "Industrial Hoses" with one
 *     "Hoses by Service" sub-section + 9 leaves
 *
 * Hose Fittings & Accessories (catalogue pages 32-35) are described
 * as broad product groups, not individual SKUs — flagged as a follow-up
 * batch when Dixon provides per-SKU detail.
 *
 * Spec values extracted from the Dixon catalogue PDF directly. All
 * Hose Assemblies compliant with Pressure Equipment Directive 2014/68/EU
 * per the Dixon catalogue.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-dixon-industrial-hoses.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-dixon-industrial-hoses.ts
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
  brandSlug: 'dixon',
  status: 'active',
  unitOfMeasure: 'metre',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 14,
  countryOfOrigin: 'United Kingdom',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Type model ────────────────────────────────────────────────────────────

type ApplicationFamily =
  | 'air-water'
  | 'water-suction-delivery'
  | 'food-beverage'
  | 'oil-chemical-purpose'
  | 'composite'
  | 'industrial-steam'
  | 'abrasive'
  | 'metallic-ptfe'
  | 'specialist'

type DixonHoseInput = {
  sku: string
  title: string
  category: string
  dixonCode: string
  application: string
  cover: string
  lining: string
  reinforcement: string
  branding: string
  temperature: string
  safetyFactor: string
  idRange: string
  maxWorkingPressure: string
  minBurstPressure: string
  minBendRadius: string
  weight: string
}

const CATEGORY_TO_FAMILY: Record<string, ApplicationFamily> = {
  'air-water-hoses': 'air-water',
  'water-suction-delivery-hoses': 'water-suction-delivery',
  'food-beverage-hoses': 'food-beverage',
  'oil-chemical-purpose-hoses': 'oil-chemical-purpose',
  'composite-hoses': 'composite',
  'industrial-steam-hoses': 'industrial-steam',
  'abrasive-hoses': 'abrasive',
  'metallic-ptfe-hoses': 'metallic-ptfe',
  'specialist-hoses': 'specialist',
}

const FAMILY_LABEL: Record<ApplicationFamily, string> = {
  'air-water': 'Air / Water Hose',
  'water-suction-delivery': 'Water Suction & Delivery Hose',
  'food-beverage': 'Food & Beverage Hose',
  'oil-chemical-purpose': 'Oil / Chemical / General Purpose Hose',
  composite: 'Composite Hose',
  'industrial-steam': 'Industrial Steam Hose',
  abrasive: 'Abrasive / Bulk Material Hose',
  'metallic-ptfe': 'Metallic & PTFE Hose',
  specialist: 'Specialist & Custom-Built Hose',
}

const FAMILY_CONTEXT: Record<ApplicationFamily, string> = {
  'air-water':
    'Air & water hoses for compressed air, pneumatic tools, water transfer, and general industrial utility — typically 20 bar working pressure with EPDM/SBR rubber tube and textile reinforcement. BS 5118/2, ISO 2398.',
  'water-suction-delivery':
    'Water suction & delivery hoses with helical wire reinforcement for vacuum / suction service. Sizes from 25 mm up to 200 mm bore. Common on dewatering, irrigation, and tanker service.',
  'food-beverage':
    'FDA / EU food-grade hoses for hygienic transfer of beverages, dairy, and bulk food ingredients. Hygienic San-grade NBR, silicone, and PVC tube options. CIP/SIP cleaning compatible.',
  'oil-chemical-purpose':
    'Multi-purpose hoses for oil, fuel, mineral oil, and chemical transfer. Range covers tanker reeling, oil suction & delivery, and UHMWPE chemical hoses for aggressive media. EN 1761 / EN 12115 where applicable.',
  composite:
    'Lightweight composite hoses with multi-ply polypropylene/polyester construction over an internal wire helix and external wire helix. EN 13765:2015 Type 3. For oil tanker, vapour recovery, and chemical service. Working pressure 14 bar.',
  'industrial-steam':
    'Saturated-steam transfer hoses with red or black EPDM cover, steel-wire reinforcement, and high-temperature EPDM tube. 7-18 bar saturated steam service. BS 5342 / EN ISO 6134 type 2 class A.',
  abrasive:
    'Bulk-material and abrasive-handling hoses for sand, cement, dry powders, slurry, and grain. Heavy-duty NR / PVC tube with helical wire reinforcement.',
  'metallic-ptfe':
    'Stainless-steel corrugated metallic hoses (Adflex / Suparflex / Hyparflex / HP-THP) and PTFE smoothbore / convoluted hoses for high-pressure, high-temperature, and corrosive service. -200°C to +650°C metallic; -60°C to +260°C PTFE. EN ISO 10380 class 1.',
  specialist:
    'Hand-built and custom-engineered hose assemblies — Bulkstream rubber-compound hand-built hoses (51-1000 mm bore), heat-traced/jacketed hoses with electric heat-trace cabling, and GSM ball-joint armoured hoses for steel mill / foundry service.',
}

// ── HTML description builder ──────────────────────────────────────────────

function dixonHoseHtml(g: DixonHoseInput): string {
  const family = CATEGORY_TO_FAMILY[g.category]!
  return `<p>The <strong>${escape(g.title)}</strong> (Dixon part code <code>${escape(g.dixonCode)}</code>) is a ${escape(FAMILY_LABEL[family])} from the Dixon Group Europe industrial hose range. Indus Hydraulics is an authorised Dixon distributor in the UAE.</p>
<h3>Application</h3>
<p>${escape(g.application)}</p>
<h3>Construction</h3>
<ul>
<li><strong>Cover:</strong> ${escape(g.cover)}</li>
<li><strong>Lining / Tube:</strong> ${escape(g.lining)}</li>
<li><strong>Reinforcement:</strong> ${escape(g.reinforcement)}</li>
<li><strong>Branding (printed on hose):</strong> ${escape(g.branding)}</li>
</ul>
<h3>Performance</h3>
<ul>
<li><strong>Inner-diameter range:</strong> ${escape(g.idRange)}</li>
<li><strong>Max working pressure:</strong> ${escape(g.maxWorkingPressure)}</li>
<li><strong>Min burst pressure:</strong> ${escape(g.minBurstPressure)}</li>
<li><strong>Min bend radius:</strong> ${escape(g.minBendRadius)}</li>
<li><strong>Weight:</strong> ${escape(g.weight)}</li>
<li><strong>Operating temperature:</strong> ${escape(g.temperature)}</li>
<li><strong>Safety factor:</strong> ${escape(g.safetyFactor)}</li>
</ul>
<h3>Family context</h3>
<p>${escape(FAMILY_CONTEXT[family])}</p>
<h3>Compliance</h3>
<p>All Dixon hose assemblies are compliant with the Pressure Equipment Directive 2014/68/EU. Dixon Group Europe manufactures and engineers to BSI ISO 9001 with over 100 years' experience.</p>
<h3>How to order</h3>
<p>Specify (a) the inner diameter from the size range, (b) the assembly length, (c) end-fitting requirements (Dixon supplies a full range of cam &amp; groove, brass, hygienic, steam, and quick-release couplings), and (d) any special requirements such as Lloyd's certification or third-party witness testing. Indus engineering will confirm the assembly drawing on the RFQ.</p>
<h3>Companion products</h3>
<p>Pair with Dixon's matching couplings and accessories (Cam &amp; Groove, Boss steam couplings, hose clamps, Holedall permanently-attached fittings, hose tags, and Spiral Hose Guard / Fire Jacket protective sleeves) — full range available on quote.</p>`
}

// ── FAQs (8 per product) ──────────────────────────────────────────────────

function dixonHoseFaqs(g: DixonHoseInput): FaqEntry[] {
  const family = CATEGORY_TO_FAMILY[g.category]!
  return [
    {
      q: 'What is this hose used for?',
      a: g.application,
    },
    {
      q: 'What sizes are available?',
      a: `${g.idRange}. Specify the exact inner diameter on the RFQ — Dixon supplies multiple bore sizes per family code; lead time depends on size.`,
    },
    {
      q: 'What is the maximum working pressure?',
      a: `${g.maxWorkingPressure}. Minimum burst pressure: ${g.minBurstPressure}. Safety factor: ${g.safetyFactor}.`,
    },
    {
      q: 'What is the operating temperature range?',
      a: `${g.temperature}. Refer to the datasheet for any de-rating factors at extreme temperatures.`,
    },
    {
      q: 'What is the construction (cover / lining / reinforcement)?',
      a: `Cover: ${g.cover}. Lining/tube: ${g.lining}. Reinforcement: ${g.reinforcement}.`,
    },
    {
      q: 'Is this hose compliant with the Pressure Equipment Directive?',
      a: 'Yes — all Dixon hose assemblies are compliant with the Pressure Equipment Directive 2014/68/EU. Dixon Group Europe manufactures to BSI ISO 9001. Each assembly ships with a test certificate; Lloyd\'s Approval and third-party witness testing available on request.',
    },
    {
      q: 'What is the printed branding on the hose?',
      a: `${g.branding}. The branding is printed continuously along the hose for in-field identification — useful for cross-checking against engineering drawings and procurement specs.`,
    },
    {
      q: 'Lead time?',
      a: 'Common sizes are typically 2-3 weeks ex-Dixon UK. Custom assemblies (specific lengths, end fittings, certification) typically ship within 4-6 weeks. Indus expedites Dixon factory orders for urgent requirements — call out the rig name / project on the RFQ.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeDixonHose(g: DixonHoseInput): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: g.category,
    specTemplateSlug: 'industrial-hose-spec',
    descriptionShort: g.application.slice(0, 500),
    descriptionLong: dixonHoseHtml(g),
    specs: {
      application_family: CATEGORY_TO_FAMILY[g.category]!,
      dixon_part_code: g.dixonCode,
      cover: g.cover,
      lining: g.lining,
      reinforcement: g.reinforcement,
      branding: g.branding,
      inner_diameter_range: g.idRange,
      max_working_pressure: g.maxWorkingPressure,
      min_burst_pressure: g.minBurstPressure,
      min_bend_radius: g.minBendRadius,
      operating_temperature: g.temperature,
      safety_factor: g.safetyFactor,
      weight: g.weight,
      applicable_standards: 'Pressure Equipment Directive 2014/68/EU; ISO 9001 manufacturing',
    },
    faqs: dixonHoseFaqs(g),
    seoTitle: `${g.title} — Dixon ${g.dixonCode} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.application.slice(0, 500),
    focusKeyword: `Dixon ${g.dixonCode} ${FAMILY_LABEL[CATEGORY_TO_FAMILY[g.category]!]}`,
  }
}

// ── Spec template ─────────────────────────────────────────────────────────

const APPLICATION_OPTIONS: ApplicationFamily[] = [
  'air-water',
  'water-suction-delivery',
  'food-beverage',
  'oil-chemical-purpose',
  'composite',
  'industrial-steam',
  'abrasive',
  'metallic-ptfe',
  'specialist',
]

const INDUSTRIAL_HOSE_SPEC: SpecTemplatePayload = {
  slug: 'industrial-hose-spec',
  name: 'Industrial Hose Spec',
  description:
    'Spec template for industrial hoses (Dixon Group Europe range and similar): air/water, water suction & delivery, food & beverage, oil/chemical/general purpose, composite, steam, abrasive, metallic & PTFE, and specialist hand-built variants. Captures cover, lining, reinforcement, ID range, working/burst pressure, bend radius, weight, temperature, safety factor, branding, and the manufacturer part code.',
  position: 7,
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
      key: 'dixon_part_code',
      label: 'Manufacturer Part Code',
      dataType: 'text',
      unit: null,
      group: 'Identification',
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
      key: 'max_working_pressure',
      label: 'Max Working Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'min_burst_pressure',
      label: 'Min Burst Pressure',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 4,
    },
    {
      key: 'min_bend_radius',
      label: 'Min Bend Radius',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 5,
    },
    {
      key: 'operating_temperature',
      label: 'Operating Temperature',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: true,
      isKeyFeature: true,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'safety_factor',
      label: 'Safety Factor',
      dataType: 'text',
      unit: null,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'cover',
      label: 'Cover Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'lining',
      label: 'Lining / Tube Material',
      dataType: 'text',
      unit: null,
      group: 'Construction',
      isRequired: true,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
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
      position: 10,
    },
    {
      key: 'weight',
      label: 'Weight',
      dataType: 'text',
      unit: null,
      group: 'Dimensions',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'branding',
      label: 'Hose Branding (Printed)',
      dataType: 'text',
      unit: null,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
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
      position: 13,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — extracted from /Users/ayushkbhatia/Documents/hose_catalogue_apr_18.pdf
// ─────────────────────────────────────────────────────────────────────────

const DIXON_HOSES: DixonHoseInput[] = [
  { sku: 'IH-IH-A101AS-T3', title: 'Dixon Anti-Static Air/Water Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A101AS-T3', application: 'Widely used in offshore oil and gas industries where a spark free environment is crucial', cover: 'Black smooth extruded, anti-static, abrasion, oil mist, ozone and weather resistant EPDM', lining: 'Black extruded anti-static, oil mist resistant EPDM', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A101AS T3 AIR WATER 20 BAR 3:1 BS2878', temperature: 'From -30°C to +80°C intermittent use up to 100°C', safetyFactor: '3:1', idRange: '6 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '55-150 mm', weight: '0.21-0.70 kg/m' },
  { sku: 'IH-IH-A101HP', title: 'Dixon Air/Water Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A101HP', application: 'Used in various air and water applications in agriculture, construction, plant & civil engineering', cover: 'Black smooth extruded, abrasion, ozone and weather resistant EPDM/SBR', lining: 'Black extruded oil mist resistant NR/SBR', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A101HP AIR/WATER BS5118/2 & ISO2398 20 BAR SF 3:1', temperature: 'From -20°C to +80°C', safetyFactor: '3:1', idRange: '6 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '60-250 mm', weight: '0.18-0.67 kg/m' },
  { sku: 'IH-IH-A102HP', title: 'Dixon Air/Water Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A102HP', application: 'Used in various air and water applications in agriculture, construction, plant & civil engineering', cover: 'Yellow smooth extruded, abrasion, ozone and weather resistant EPDM/SBR', lining: 'Black extruded oil mist resistant NR/SBR', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A102HP AIR/WATER BS5118/2 & ISO2398 20 BAR SF 3:1', temperature: 'From -20°C to +80°C', safetyFactor: '3:1', idRange: '13 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '130-250 mm', weight: '0.35-0.67 kg/m' },
  { sku: 'IH-IH-A103HP', title: 'Dixon Multi Utility Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A103HP', application: 'Multi-purpose hose used in steel mills, shipyard, foundries, automotive and construction industries.', cover: 'Blue smooth extruded, oil mist, abrasion, ozone and weather resistant EPDM/SBR', lining: 'Black extruded SBR/NR oil mist resistant', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A103HP Multi Utility 20 BAR SF 3:1', temperature: 'From -20°C to +90°C', safetyFactor: '3:1', idRange: '19 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '190-250 mm', weight: '0.65-0.88 kg/m' },
  { sku: 'IH-IH-A105HP', title: 'DIXON Multi Utility Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A105HP', application: 'Multi-purpose hose used in steel mills, shipyard, foundries, automotive and construction industries.', cover: 'Green smooth extruded, oil mist, abrasion, ozone and weather resistant EPDM/SBR', lining: 'Black extruded SBR/NR oil mist resistant', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A105HP Multi Utility 20 BAR SF 3:1', temperature: 'From -20°C to +90°C', safetyFactor: '3:1', idRange: '19 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '190-250 mm', weight: '0.65-0.88 kg/m' },
  { sku: 'IH-IH-A116EU100', title: 'Dixon High Temperature Air Hose 40 Bar', category: 'air-water-hoses', dixonCode: 'A116EU100', application: 'Robust heavy duty high pressure air hose for quarry, mining and construction industries', cover: 'Yellow pin pricked, mandrel wrap, ozone, oil mist and weather resistant EPDM', lining: 'Black SBR oil mist resistant', reinforcement: 'High tensile strength steel wire plies', branding: 'DIXON LOGO A116EU100 AIR 40 BAR S:F 3:1', temperature: 'From -30°C to +100°C', safetyFactor: '3:1', idRange: '51 mm to 102 mm', maxWorkingPressure: '40 bar', minBurstPressure: '120 bar', minBendRadius: '510-1020 mm', weight: '1.97-5.65 kg/m' },
  { sku: 'IH-IH-A190', title: 'Dixon Air/Water Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A190', application: 'Robust mandrel built hose for arduous applications in mining and construction', cover: 'Black mandrel wrap, abrasion, ozone and weather resistant SBR', lining: 'Black SBR oil mist resistant', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A190 AIR WATER EN 2398 2008 - 20 BAR - SF 3:1', temperature: 'From -20°C to +70°C', safetyFactor: '3:1', idRange: '13 mm to 76 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '91-532 mm', weight: '0.40-3.20 kg/m' },
  { sku: 'IH-IH-A190Y', title: 'Dixon Air/Water Hose 20 Bar', category: 'air-water-hoses', dixonCode: 'A190Y', application: 'Robust mandrel built hose for arduous applications in mining and construction', cover: 'Yellow mandrel wrap, abrasion, ozone and weather resistant SBR', lining: 'Black SBR oil mist resistant', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A190 AIR WATER EN 2398 2008 - 20 BAR - SF 3:1', temperature: 'From -20°C to +70°C', safetyFactor: '3:1', idRange: '13 mm to 76 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '91-532 mm', weight: '0.40-3.20 kg/m' },
  { sku: 'IH-IH-A210', title: 'Dixon Water Suction & Delivery Hose 10 Bar', category: 'water-suction-delivery-hoses', dixonCode: 'A210', application: 'Industrial hose for water and mild abrasives.', cover: 'Black mandrel wrap, ozone and weather resistant SBR', lining: 'Black SBR', reinforcement: 'High tensile strength textile plies, carbon wire helix', branding: 'DIXON LOGO, A210 WATER S&D 10 BAR/700mmHg SF 3:1', temperature: 'From -20°C to +70°C', safetyFactor: '3:1', idRange: '25 mm to 152 mm', maxWorkingPressure: '10 bar', minBurstPressure: '30 bar', minBendRadius: '150-1064 mm', weight: '0.80-9.50 kg/m' },
  { sku: 'IH-IH-A216', title: 'Dixon Water Suction & Delivery Hose 16 Bar', category: 'water-suction-delivery-hoses', dixonCode: 'A216', application: 'Industrial hose for water and mild abrasives.', cover: 'Black mandrel wrap, abrasion, ozone and weather resistant SBR', lining: 'Black SBR', reinforcement: 'High tensile strength textile plies, double helix', branding: 'DIXON LOGO A216 WATER S&D 16 BAR', temperature: 'From -35°C to +70°C', safetyFactor: '3:1', idRange: '51 mm to 203 mm', maxWorkingPressure: '16 bar', minBurstPressure: '48 bar', minBendRadius: '200-1100 mm', weight: '2.23-12.61 kg/m' },
  { sku: 'IH-IH-DELVAC', title: 'PVC Suction & Delivery Hose', category: 'water-suction-delivery-hoses', dixonCode: 'DELVAC', application: 'Low pressure generic hose for water and dilute chemicals. For use in agriculture, construction and water utility industries', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'PVC spiral helix', branding: 'DIXON DELVAC', temperature: '-10°C TO +55°C', safetyFactor: '3:1', idRange: '19 mm to 51 mm', maxWorkingPressure: '4-8 bar', minBurstPressure: '13-24 bar', minBendRadius: '0.7 mm', weight: '86.00-230.00 kg/m' },
  { sku: 'IH-IH-IRRIBULK', title: 'PVC Suction & Delivery Hose', category: 'water-suction-delivery-hoses', dixonCode: 'IRRIBULK', application: 'Medium Duty hose for water, slurry, abrasives and chemicals. For use in agriculture, construction and civil engineering industries', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'PVC spiral helix', branding: 'DIXON IRRIBULK M', temperature: '-10°C TO +55°C', safetyFactor: '3:1', idRange: '25 mm to 152 mm', maxWorkingPressure: '3-8 bar', minBurstPressure: '10-24 bar', minBendRadius: '0.6-0.78 mm', weight: '57.00-401.00 kg/m' },
  { sku: 'IH-IH-SANB', title: 'Dixon San-Hygienic Brew Suction & Delivery Hose 10 bar', category: 'food-beverage-hoses', dixonCode: 'SANB', application: 'For the transfer of liquid food stuffs including fatty oils, alcohol and potable water', cover: 'Red smooth cloth finish and resistant to vegetable oils and fats, abrasion, weather & ozone', lining: 'NBR white food quality', reinforcement: 'Synthetic plies, twin carbon steel helices', branding: 'Refer to host hose marking', temperature: 'From -20°C to +90°C', safetyFactor: '3:1', idRange: '19 mm to 102 mm', maxWorkingPressure: '10 bar', minBurstPressure: '30 bar', minBendRadius: '95-510 mm', weight: '0.72-5.91 kg/m' },
  { sku: 'IH-IH-SANF', title: 'Dixon San-Hygienic Food Suction & Delivery Hose 10 bar', category: 'food-beverage-hoses', dixonCode: 'SANF', application: 'For the transfer of liquid food stuffs including fatty oils, alcohol and potable water', cover: 'Blue smooth cloth finish and resistant to vegetable oils and fats, abrasion, weather & ozone', lining: 'NBR white food quality (FDA Specification)', reinforcement: 'Synthetic plies, twin carbon steel helices', branding: 'Refer to host hose marking', temperature: 'From -20°C to +90°C (additional temp for CIP)', safetyFactor: '3:1', idRange: '19 mm to 102 mm', maxWorkingPressure: '10 bar', minBurstPressure: '30 bar', minBendRadius: '95-510 mm', weight: '0.72-5.91 kg/m' },
  { sku: 'IH-IH-SANSIL', title: 'DIXON Silicone Suction & Delivery Hose', category: 'food-beverage-hoses', dixonCode: 'SANSIL', application: 'For use in Pharmaceutical, food & beverage applications in health and personal care industries', cover: 'Translucent seamless extruded silicone, Platinum cured', lining: 'FDA approved transparent seamless smooth silicone, Platinum cured', reinforcement: 'Polyester fabrics, 316L stainless steel helix', branding: 'Refer to host hose marking', temperature: 'From -40°C to +200°C', safetyFactor: '4:1', idRange: '13 mm to 102 mm', maxWorkingPressure: '3-10 bar', minBurstPressure: '12-40 bar', minBendRadius: '45-360 mm', weight: '0.39-3.99 kg/m' },
  { sku: 'IH-IH-DELIKATESSE', title: 'PVC Non Toxic Suction & Delivery Hose', category: 'food-beverage-hoses', dixonCode: 'DELIKATESSE', application: 'Lightweight flexible hose for use with various food stuffs or solids even at low temperature', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'PVC spiral helix, smooth bore', branding: 'DIXON DELIKATESSE', temperature: '-10°C TO +55°C', safetyFactor: '3:1', idRange: '25 mm to 76 mm', maxWorkingPressure: '4-8 bar', minBurstPressure: '12-24 bar', minBendRadius: '0.68 mm', weight: '114.00-342.00 kg/m' },
  { sku: 'IH-IH-PREMVIN', title: 'Food & Bulk PVC Suction & Delivery Hose', category: 'food-beverage-hoses', dixonCode: 'PREMVIN', application: 'Food grade PVC hose for abrasive and non- abrasive solids or liquids including diluted chemicals', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'Spring steel', branding: 'DIXON PREMVIN SUCTION', temperature: '-10°C TO +55°C', safetyFactor: '3:1', idRange: '13 mm to 152 mm', maxWorkingPressure: '2-12 bar', minBurstPressure: '7-36 bar', minBendRadius: '0.88 mm', weight: '26.00-456.00 kg/m' },
  { sku: 'IH-IH-BAKU', title: 'PVC Oil Suction & Delivery Hose', category: 'oil-chemical-purpose-hoses', dixonCode: 'BAKU', application: 'Suitable for light fuel oils, diesels and kerosene for use in plants and tanker applications', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'PVC spiral helix', branding: 'DIXON BAKU OIL HOSE', temperature: '-10°C TO +55°C', safetyFactor: '3:1 and vacuum 0.88 bar to 0.78 depending on size', idRange: '25 mm to 152 mm', maxWorkingPressure: '3-9 bar', minBurstPressure: '9-27 bar', minBendRadius: '0.78-0.88 mm', weight: '113.00-684.00 kg/m' },
  { sku: 'IH-IH-A104', title: 'Dixon Red Multi-Purpose Non-Conductive OGS Hose', category: 'oil-chemical-purpose-hoses', dixonCode: 'A104', application: 'Multi-Purpose hose for conveying a wide range of media inc. air, water, oil and other petroleum products used in steel mills, shipyards, foundries, auto plants and construction industries', cover: 'Red smooth extruded, oil, abrasion, ozone and weather resistant NBR/SBR (Also available with black cover)', lining: 'Black non-conductive NBR/SBR', reinforcement: 'High tensile strength textile plies', branding: 'DIXON A104 Non Conductive Multipurpose 300', temperature: 'From -20°C to +100°C', safetyFactor: '4:1', idRange: '6 mm to 25 mm', maxWorkingPressure: '20 bar', minBurstPressure: '80 bar', minBendRadius: '55-225 mm', weight: '0.24-0.96 kg/m' },
  { sku: 'IH-IH-A110', title: 'Dixon Multi-Purpose Mineral Oil Hose 10 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A110', application: 'Low pressure, electrically conductive fuel delivery hose for diesel, heating oils and petroleum including unleaded fuel for use across a variety of industries including automotive sector', cover: 'Black smooth extruded, oil, abrasion, ozone and weather resistant NBR/SBR', lining: 'Black non-conductive NBR', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A110 MULTI-PURPOSE MINERAL', temperature: 'From -40°C to +100°C', safetyFactor: '4:1', idRange: '5 mm to 25 mm', maxWorkingPressure: '10 bar', minBurstPressure: '40 bar', minBendRadius: '40-150 mm', weight: '0.10-0.62 kg/m' },
  { sku: 'IH-IH-A125', title: 'Dixon Multi-Purpose Mineral Oil & Air Hose 25 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A125', application: 'Medium pressure, electrically conductive fuel delivery hose for diesel, heating oils and petroleum including unleaded fuel for use across a variety of industries including automotive sector', cover: 'Black smooth extruded, oil, abrasion, ozone and weather resistant NBR/SBR', lining: 'Black non-conductive NBR', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A125 MULTI-PURPOSE MINERAL', temperature: 'From -40°C to +80°C', safetyFactor: '3:1', idRange: '6 mm to 25 mm', maxWorkingPressure: '25 bar', minBurstPressure: '75 bar', minBendRadius: '40-150 mm', weight: '0.17-0.73 kg/m' },
  { sku: 'IH-IH-A420', title: 'Dixon Tanker Reeling Hose 17 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A420', application: 'Petroleum tanker delivery hose specifically designed for use on reels. Suitable for oil, diesel, domestic fuels and petrol including unleaded', cover: 'Red smooth extruded, oil, abrasion, ozone and weather resistant', lining: 'Black smooth NBR, suitable for diesel, domestic fuels including unleaded petrol', reinforcement: '2 x high strength textile yarn, 2 x copper braided anti-static wires', branding: 'DIXON A420 TANKER REELING HOSE 17 BAR', temperature: '-20°C to +70°C', safetyFactor: '3:1', idRange: '35 mm to 38 mm', maxWorkingPressure: '17 bar', minBurstPressure: '51 bar', minBendRadius: '210-230 mm', weight: '1.40-1.60 kg/m' },
  { sku: 'IH-IH-A430', title: 'Dixon Oil Suction & Delivery Hose 10 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A430', application: 'Used in petrochemical plants and dockyards for handling unleaded fuels and hydraulic oils', cover: 'Black mandrel wrap, oil, abrasion, ozone and weather resistant CR/NBR', lining: 'Black oil resistant NBR suitable for 50% aromatic hydrocarbons', reinforcement: 'High tensile strength textile plies, twin steel helix and anti-static wires', branding: 'DIXON LOGO, A430 OIL S & D 10BAR / 0.93 VAC', temperature: 'From -35°C to +80°C', safetyFactor: '3:1', idRange: '25 mm to 152 mm', maxWorkingPressure: '10 bar', minBurstPressure: '30 bar', minBendRadius: '178-1064 mm', weight: '0.70-9.50 kg/m' },
  { sku: 'IH-IH-A460', title: 'Dixon Oil Suction & Delivery Hose 20 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A460', application: 'Heavy duty hose used in petrochemical plants and dockyards for handling unleaded fuels and hydraulic oils', cover: 'Black mandrel wrap, oil, abrasion, ozone and weather resistant CR', lining: 'Black oil resistant NBR suitable for 50% aromatic hydrocarbons', reinforcement: 'High tensile strength textile plies, twin steel helix and anti-static wires', branding: 'DIXON LOGO A460 OIL S&D 20 BAR SF 3:1 VAC 0.9 BAR', temperature: 'From -40°C to +100°C', safetyFactor: '3:1', idRange: '51 mm to 152 mm', maxWorkingPressure: '20 bar', minBurstPressure: '60 bar', minBendRadius: '255-760 mm', weight: '2.08-11.02 kg/m' },
  { sku: 'IH-IH-A400EU', title: 'Dixon Oil, Mud & Sea Water Suction & Delivery Hose 20 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A400EU', application: 'Extra heavy duty hose for arduous applications including tanker loading and unloading, offshore and onshore and petrochemical plants', cover: 'Black mandrel wrap, hydrocarbon, mud, sea water, abrasion, ozone and weather resistant CR', lining: 'Black oil, mud, sea water resistant NBR suitable for 50% aromatic hydrocarbons', reinforcement: 'Multi layer high tensile strength textile plies, steel helix wire and antistatic wires', branding: 'DIXON LOGO, BULKSTREAM A400EU OIL MUD', temperature: 'From -30°C to +90°C.', safetyFactor: '4:1', idRange: '76 mm to 203 mm', maxWorkingPressure: '20 bar', minBurstPressure: '80 bar', minBendRadius: '380-1220 mm', weight: '3.90-19.30 kg/m' },
  { sku: 'IH-IH-A410', title: 'Dixon UHMWPE Chemical Suction & Delivery Hose 10 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A410', application: 'Used for a wide range of chemicals including acids and alkalines within plants and on road tankers', cover: 'Blue EPDM rubber ozone and weather resistant', lining: 'Ultra High Molecular Weight Polyethylene', reinforcement: 'High tensile strength textile ply, twin carbon steel wire helix, copper braided anti-static wire', branding: 'DIXON LOGO, A410 Chemical S&D UHMWPE', temperature: 'From -30°C to +100°C (Subject to chemical compatibility), +130°C for intermittent sterilization', safetyFactor: '4:1', idRange: '19 mm to 102 mm', maxWorkingPressure: '10 bar', minBurstPressure: '40 bar', minBendRadius: '125-450 mm', weight: '0.68-4.11 kg/m' },
  { sku: 'IH-IH-A416', title: 'Dixon UHMWPE Chemical Suction & Delivery Hose 16 Bar', category: 'oil-chemical-purpose-hoses', dixonCode: 'A416', application: 'FDA approved hose used for a wide range of chemicals including acids and alkaline within plants, on road tankers and water utility industries', cover: 'Blue EPDM rubber ozone and weather resistant', lining: 'Food Quality (FDA Specification) conductive Ultra', reinforcement: 'High tensile strength textile ply, twin carbon steel wire helix, copper braided anti-static wire', branding: 'DIXON LOGO, A416 FDA Chemical S&D UHMWPE', temperature: 'From -30°C to +100°C (Subject to chemical compatibility), +130°C for intermittent sterilization', safetyFactor: '3:1', idRange: '19 mm to 102 mm', maxWorkingPressure: '16 bar', minBurstPressure: '48 bar', minBendRadius: '125-450 mm', weight: '0.68-4.11 kg/m' },
  { sku: 'IH-IH-A901GG', title: 'Dixon Oil Composite Hose 14 Bar', category: 'composite-hoses', dixonCode: 'A901GG', application: 'Highly fl exible oil transfer hose for use on road tankers, petrochemical refi nery and environmental service applications', cover: 'Black weatherproof UV, ozone and abrasion resistant PVC and galvanised carbon steel external wire', lining: 'polypropylene, polyethylene & polyester fi lms and polypropylene fabrics', reinforcement: 'High-tensile textile / synthetic reinforcement', branding: 'DIXON LOGO DIXOIL TYPE 3 EN13765:2015 14 BAR 80°C Reinforcement/ Galvanised carbon steel internal wire,', temperature: '-30°C TO +80°C', safetyFactor: '4:1', idRange: '25 mm to 100 mm', maxWorkingPressure: '14 bar', minBurstPressure: '56 bar', minBendRadius: '75-250 mm', weight: '0.80-4.80 kg/m' },
  { sku: 'IH-IH-A901AG', title: 'Dixon Vapour Recovery Composite Hose 14 Bar', category: 'composite-hoses', dixonCode: 'A901AG', application: 'Highly fl exible VRH oil composite hose for use on petrol forecourts and petrochemical refi neries', cover: 'Orange weatherproof UV, ozone and abrasion resistant PVC and galvanised carbon steel external wire', lining: 'polyethylene fi lms and fabrics', reinforcement: 'High-tensile textile / synthetic reinforcement', branding: 'DIXON LOGO DIXOIL TYPE 3 EN13765:2015 14 BAR 80°C Reinforcement/ Aluminium internal wire, with polypropylene,', temperature: '-30°C TO +80°C', safetyFactor: '4:1', idRange: '75 mm to 100 mm', maxWorkingPressure: '14 bar', minBurstPressure: '56 bar', minBendRadius: '185-275 mm', weight: '2.10-2.90 kg/m' },
  { sku: 'IH-IH-A906PG', title: 'Dixon Chemical Composite Hose 14 Bar', category: 'composite-hoses', dixonCode: 'A906PG', application: 'Highly fl exible hose for petrochemical plants and road tankers', cover: 'Grey weatherproof UV, ozone and abrasion resistant', lining: 'internal wire with polypropylene, polyethylene fi lms and fabrics', reinforcement: 'High-tensile textile / synthetic reinforcement', branding: 'DIXON LOGO DIXCHEM TYPE 3 EN13765:2015 14 BAR 80°C Reinforcement/ Polypropylene coated galvanised carbon steel', temperature: '-30°C TO +80°C', safetyFactor: '4:1', idRange: '25 mm to 100 mm', maxWorkingPressure: '14 bar', minBurstPressure: '56 bar', minBendRadius: '75-250 mm', weight: '0.80-4.80 kg/m' },
  { sku: 'IH-IH-A911SG', title: 'Dixon PTFE Chemical Composite Hose 14 Bar', category: 'composite-hoses', dixonCode: 'A911SG', application: 'PTFE lined hose designed for use on plant and road tankers with a wide range of aggressive chemicals or foods', cover: 'Red weatherproof UV, ozone and abrasion resistant', lining: 'polypropylene, polyethylene fi lms and fabrics', reinforcement: '/ Stainless steel internal wire, PTFE lined with', branding: 'DIXON LOGO PTFE TYPE 3 EN13765:2015 14 BAR 120°C', temperature: '-30°C TO +120°C', safetyFactor: '4:1', idRange: '25 mm to 100 mm', maxWorkingPressure: '14 bar', minBurstPressure: '56 bar', minBendRadius: '75-250 mm', weight: '0.80-4.80 kg/m' },
  { sku: 'IH-IH-A230', title: 'Dixon High Pressure Red Saturated Steam Hose 18 Bar', category: 'industrial-steam-hoses', dixonCode: 'A230', application: 'High pressure saturated steam hose for high temperatures. Used in petrochemical plants/ refineries for maintenance and pipe insulation', cover: 'Red mandrel wrap, ozone and weather resistant pin pricked EPDM. (Also available in black)', lining: 'Black EPDM', reinforcement: '2 ply multi stranded high tensile strength steel wires', branding: 'DIXON LOGO, A230 SUPER STEAM 18 BAR -', temperature: 'From -40°C to +210°C. Intermittent 232°C', safetyFactor: '10:1', idRange: '13 mm to 51 mm', maxWorkingPressure: '18 bar', minBurstPressure: '180 bar', minBendRadius: '130-500 mm', weight: '0.53-2.20 kg/m' },
  { sku: 'IH-IH-A235BK', title: 'Dixon Black Saturated Steam Hose 7 Bar', category: 'industrial-steam-hoses', dixonCode: 'A235BK', application: 'Saturated steam hose for high temperatures. Used in petrochemical plants/refineries for maintenance and pipe insulation', cover: 'Black mandrel wrap, ozone and weather resistant pin pricked EPDM', lining: 'Black EPDM', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A235 Saturated Steam 7 BAR SF 10:1 170 deg C BS5122 A2', temperature: 'From -20°C to +170°C', safetyFactor: '10:1', idRange: '13 mm to 25 mm', maxWorkingPressure: '7 bar', minBurstPressure: '70 bar', minBendRadius: '91-175 mm', weight: '0.40-0.80 kg/m' },
  { sku: 'IH-IH-A235BU', title: 'Dixon Steam, Hot Water & Food Hose 7 Bar', category: 'industrial-steam-hoses', dixonCode: 'A235BU', application: 'Multi-purpose steam, hot water and food hose.', cover: 'Blue mandrel wrap, ozone and weather resistant pin pricked EPDM', lining: 'White food grade EPDM rubber FDA approved compounds', reinforcement: 'High tensile strength textile plies', branding: 'DIXON LOGO, A235 STEAM HOT WATER FOOD', temperature: 'From -20°C to +170°C (STEAM) +95°C (HOT WATER)', safetyFactor: '10:1', idRange: '13 mm to 25 mm', maxWorkingPressure: '7 bar', minBurstPressure: '70 bar', minBendRadius: '91-175 mm', weight: '0.40-0.80 kg/m' },
  { sku: 'IH-IH-A361', title: 'Dixon Bulk Material Suction & Delivery Hose 10 bar', category: 'abrasive-hoses', dixonCode: 'A361', application: 'Heavy duty hose for use in mining, construction, civil engineering, foundries and bulk transportation', cover: 'Black abrasion, weather & ozone resistant synthetic rubber', lining: 'Black anti-static natural rubber', reinforcement: 'High tensile strength textile plies, steel helix and anti-static wires', branding: 'DIXON LOGO, A361 BULK MATERIAL S & D HOSE 10 BAR', temperature: 'From -40°C to +70°C', safetyFactor: '3:1', idRange: '76 mm to 102 mm', maxWorkingPressure: '10 bar', minBurstPressure: '30 bar', minBendRadius: '380-550 mm', weight: '3.76-4.55 kg/m' },
  { sku: 'IH-IH-PREMFLEX', title: 'MDSE Chemical & Abrasion PVC Suction & Delivery Hose', category: 'abrasive-hoses', dixonCode: 'PREMFLEX', application: 'Suitable for most suction and delivery applications for conveying chemical solutions, abrasive slurries and solids', cover: 'PVC tube construction (no separate cover/lining)', lining: 'PVC tube construction (no separate cover/lining)', reinforcement: 'PVC spiral helix', branding: 'DIXON PREMFLEX', temperature: '-10°C TO +55°C', safetyFactor: '3:1', idRange: '38 mm to 152 mm', maxWorkingPressure: '3-5 bar', minBurstPressure: '10-16 bar', minBendRadius: '0.9 mm', weight: '152.00-608.00 kg/m' },
  { sku: 'IH-IH-METALLIC-ADFLEX', title: 'Adflex Commercial Grade Metallic Hose', category: 'metallic-ptfe-hoses', dixonCode: 'ADFLEX', application: 'Versatile robust hose suited to high pressure, high temperature and corrosive applications. Flexible metal hoses can accommodate angular movements, temperature expansion, vibration and misalignment. Steam, compressed air, petrochemical and vacuum service.', cover: 'Stainless-steel braid (AISI 304) or unbraided', lining: 'Corrugated AISI 316L or AISI 321 stainless-steel core (exotics on request)', reinforcement: 'Single, double, or triple AISI 304 stainless braid', branding: 'Per EN ISO 10380 class 1 marking', temperature: '-200°C to +650°C', safetyFactor: '4:1', idRange: 'DN 6 (6mm) to DN 300 (300mm)', maxWorkingPressure: '5-100 bar (varies with bore size; refer to size table)', minBurstPressure: 'Per EN ISO 10380 class 1', minBendRadius: '100-1525 mm dynamic; 25-725 mm static', weight: 'Refer to datasheet' },
  { sku: 'IH-IH-METALLIC-SUPARFLEX', title: 'Suparflex Standard Pitch Metallic Hose', category: 'metallic-ptfe-hoses', dixonCode: 'SUPARFLEX', application: 'Standard-pitch corrugated metallic hose for high-pressure, high-temperature service. Single / double / triple braid options for graduated pressure ratings up to 175 bar.', cover: 'Stainless-steel braid (AISI 304)', lining: 'Standard-pitch corrugated AISI 316L stainless-steel core', reinforcement: 'Single, double, or triple AISI 304 stainless braid', branding: 'Per EN ISO 10380 class 1', temperature: '-200°C to +650°C', safetyFactor: '4:1', idRange: 'DN 6 (6mm) to DN 150 (150mm)', maxWorkingPressure: 'Single braid 0.3-18 bar; Double braid 11-145 bar; Triple braid 25-175 bar (size-dependent)', minBurstPressure: 'Per EN ISO 10380 class 1', minBendRadius: '10-390 mm static; 110-1250 mm dynamic', weight: 'Refer to datasheet' },
  { sku: 'IH-IH-METALLIC-HYPARFLEX', title: 'Hyparflex Close Pitch Metallic Hose', category: 'metallic-ptfe-hoses', dixonCode: 'HYPARFLEX', application: 'Close-pitch corrugated metallic hose for tighter bend radius than standard pitch. Same single / double / triple braid options for high-pressure service.', cover: 'Stainless-steel braid (AISI 304)', lining: 'Close-pitch corrugated AISI 316L stainless-steel core', reinforcement: 'Single, double, or triple AISI 304 stainless braid', branding: 'Per EN ISO 10380 class 1', temperature: '-200°C to +650°C', safetyFactor: '4:1', idRange: 'DN 6 (6mm) to DN 150 (150mm)', maxWorkingPressure: 'Single braid 0.2-18 bar; Double braid 11-150 bar; Triple braid 27-175 bar (size-dependent)', minBurstPressure: 'Per EN ISO 10380 class 1', minBendRadius: '9-290 mm static; 110-1250 mm dynamic', weight: 'Refer to datasheet' },
  { sku: 'IH-IH-METALLIC-HP-THP', title: 'HP / THP High Pressure Metallic Hose', category: 'metallic-ptfe-hoses', dixonCode: 'HP-THP', application: 'High-pressure metallic hose series for the most demanding service — petrochemical, gas, steam at full process pressure. Single or double braid up to 255 bar working pressure.', cover: 'Stainless-steel braid (AISI 304)', lining: 'Reinforced corrugated AISI 316L stainless-steel core', reinforcement: 'Single or double AISI 304 stainless braid', branding: 'Per EN ISO 10380 class 1', temperature: '-200°C to +650°C', safetyFactor: '4:1', idRange: 'DN 6 (6mm) to DN 200 (200mm)', maxWorkingPressure: 'Single braid 20-180 bar; Double braid 30-255 bar (size-dependent)', minBurstPressure: 'Per EN ISO 10380 class 1', minBendRadius: '25-520 mm static; 110-2000 mm dynamic', weight: 'Refer to datasheet' },
  { sku: 'IH-IH-PTFE-SMOOTHBORE-SS', title: 'PTFE Smoothbore Hose with Stainless Steel Braid', category: 'metallic-ptfe-hoses', dixonCode: 'PTFE-SB-SS', application: 'Inert to practically all commercial chemicals, acids, solvents and hydraulic fluids. Pharmaceutical and food processing — does not contaminate the media. Tasteless and odourless. Suited to arduous flexing over an extended temperature range.', cover: 'AISI 304 or AISI 316 stainless-steel braid', lining: 'FDA-approved smooth-bore PTFE', reinforcement: 'Single AISI 304 or AISI 316 stainless-steel braid', branding: 'Per FDA spec', temperature: '-60°C to +260°C', safetyFactor: '3:1', idRange: '6 mm (1/4") to 25 mm (1")', maxWorkingPressure: '69-241 bar (size-dependent)', minBurstPressure: '207-724 bar', minBendRadius: '76-305 mm', weight: 'Refer to datasheet' },
  { sku: 'IH-IH-PTFE-CONVOLUTED-SS', title: 'Convoluted & Anti-Static PTFE Hose with Stainless Steel Braid', category: 'metallic-ptfe-hoses', dixonCode: 'PTFE-CONV-SS', application: 'FDA-approved convoluted PTFE hose with anti-static option for electrically resistive fluid transfer at high flow rates. External vacuum wire prevents collapse under suction. Pharmaceutical, food processing, chemical service.', cover: 'AISI 304 or AISI 316 stainless-steel braid', lining: 'FDA-approved black/white virgin convoluted or black anti-static convoluted PTFE', reinforcement: 'AISI 304 or AISI 316 stainless braid + external vacuum wire', branding: 'Per FDA spec', temperature: '-60°C to +260°C', safetyFactor: '3:1', idRange: '10 mm (1/4") to 100 mm (4")', maxWorkingPressure: '10-60 bar (size-dependent)', minBurstPressure: '40-290 bar', minBendRadius: '25-400 mm', weight: '150-5550 g/m' },
  { sku: 'IH-IH-PTFE-CONVOLUTED-POLYMER', title: 'Convoluted & Anti-Static PTFE Hose with Polypropylene Braid', category: 'metallic-ptfe-hoses', dixonCode: 'PTFE-CONV-POLY', application: 'FDA-approved convoluted PTFE hose with synthetic polypropylene yarn braid (blue or black) for lighter weight than stainless braid. Anti-static option available. External vacuum wire. Pharmaceutical, food, chemical service at moderate temperature.', cover: 'Synthetic polypropylene yarn braid (blue or black)', lining: 'FDA-approved black/white virgin convoluted or black anti-static convoluted PTFE', reinforcement: 'Synthetic polypropylene braid + external vacuum wire', branding: 'Per FDA spec', temperature: '-30°C to +95°C', safetyFactor: '3:1', idRange: '20 mm (1/4") to 100 mm (3")', maxWorkingPressure: '10 bar', minBurstPressure: '40 bar', minBendRadius: '50-260 mm', weight: '210-3920 g/m' },
  { sku: 'IH-IH-BULKSTREAM', title: 'Bulkstream Hand-Built Hose Assembly', category: 'specialist-hoses', dixonCode: 'BULKSTREAM', application: 'Hand-built bespoke hose assemblies for ship-to-shore, ship-to-ship, chemical, and bulk-material transfer. Built to customer specification with rubber liner compounds matched to the application — fuels, oils, sea water, dry powders, sand, animal feed, abrasives.', cover: 'Smooth or corrugated rubber cover', lining: 'Rubber compound liner (NBR / EPDM / NR / SBR / CSM Hypalon / FPM Viton / CR Chlorobutyl per application)', reinforcement: 'Hand-built textile / wire reinforcement (built-in or crimped ends)', branding: 'Lloyd\'s Approval available; standard hoses upon request', temperature: '-30°C to +150°C (depending on rubber compound)', safetyFactor: '4:1', idRange: '51 mm to 1000 mm (NB: maximum length determined by mandrel length of relevant bore size)', maxWorkingPressure: '3.5 bar to 40 bar', minBurstPressure: 'Per BS EN 1765 (ship-to-shore/ship-to-ship) or EN 12115 (chemical)', minBendRadius: 'Per assembly drawing', weight: 'Per assembly drawing' },
  { sku: 'IH-IH-HEAT-TRACED', title: 'Heat Traced / Jacketed Hose', category: 'specialist-hoses', dixonCode: 'HEAT-TRACED', application: 'Metallic & industrial hoses with electric heat trace cabling to facilitate hose-body heating — ensures continuous flow of viscous, crystallising, or solidifying products. Supplied with electrical junction box at one hose end. Bespoke heat-shrink and jacketed cover options available.', cover: 'Heat-shrink jacket or insulated cover (per application)', lining: 'Per host hose (rubber, PTFE, or metallic)', reinforcement: 'Per host hose + electric heat-trace cabling', branding: 'Per host hose', temperature: 'Per host hose + heat-trace controller setpoint', safetyFactor: 'Per host hose', idRange: 'Per host hose', maxWorkingPressure: 'Per host hose', minBurstPressure: 'Per host hose', minBendRadius: 'Per host hose', weight: 'Per assembly' },
  { sku: 'IH-IH-GSM-HOSE', title: 'GSM Ball-Joint Armoured Hose', category: 'specialist-hoses', dixonCode: 'GSM', application: 'GSM ball-joint armour protects hose against extreme heat, abrasion and kinking. Used in steel mills (water, oxygen, gas service in critical applications), foundries, mining. Stainless steel or galvanised steel armour with various fibreglass insulation layers for extreme heat resistance.', cover: 'GSM ball-joint armour (stainless steel or galvanised steel) + fibreglass insulation layers', lining: 'Inner hose per material conveyed (rubber, PTFE, or metal)', reinforcement: 'Ball-joint armour with no interlocking parts (no bend restriction)', branding: 'Per host hose + GSM armour spec', temperature: 'Per host hose + armour insulation rating', safetyFactor: '4:1', idRange: 'Per host hose', maxWorkingPressure: 'Per host hose', minBurstPressure: 'Per host hose', minBendRadius: 'Per host hose (no ball-joint restriction)', weight: 'Per assembly' },
]

// ─────────────────────────────────────────────────────────────────────────
// The batch
// ─────────────────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-dixon-industrial-hoses',
    description:
      'Bulk-add 46 Dixon industrial hose products across 9 NEW application-based sub-categories under a NEW industrial-hoses master category. Adds 1 new brand (Dixon, UK, authorised distributor), 1 new top-level master, 1 new spec template (industrial-hose-spec, 14 fields). Adds a NEW 9th megamenu top-level column "Industrial Hoses".',
  },

  brands: [
    {
      slug: 'dixon',
      name: 'Dixon',
      description:
        'Dixon Group Europe is a specialist supplier of industrial hose and hose assemblies, certified to the Pressure Equipment Directive 2014/68/EU. Manufacturing and engineering facilities are approved to BSI ISO 9001, with over 100 years\' experience in fluid & air handling. Dixon\'s industrial hose range covers air/water, water suction & delivery, food & beverage, oil/chemical/general purpose, composite, steam, abrasive, metallic, PTFE, and hand-built specialist hoses. Indus Hydraulics is an authorised Dixon distributor in the UAE.',
      country: 'United Kingdom',
      isAuthorizedDistributor: true,
      isPublished: true,
      seoTitle: 'Dixon Industrial Hoses — Authorised Distributor | Indus Hydraulics',
      seoDescription:
        'Dixon Group Europe industrial hoses: air/water, food, oil/chemical, steam, composite, metallic, PTFE, specialist hand-built. PED 2014/68/EU compliant. Authorised distributor.',
    },
  ],

  categories: [
    {
      slug: 'industrial-hoses',
      name: 'Industrial Hoses',
      shortDescription:
        'Industrial hoses for air, water, food, oil, chemical, steam, abrasive, metallic, PTFE, and specialist applications. Dixon Group Europe authorised range — PED 2014/68/EU compliant.',
      position: 8,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Industrial Hoses — Air, Water, Food, Oil, Steam, Metallic | Indus Hydraulics',
      seoDescription:
        'Industrial hoses from Dixon Group Europe — air/water, food & beverage, oil & chemical, steam, abrasive, metallic, PTFE, specialist hand-built. PED 2014/68/EU compliant.',
    },
    {
      slug: 'air-water-hoses',
      name: 'Air & Water Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Industrial air & water hoses (Dixon A-series) — 20 bar working pressure, EPDM/SBR rubber tube and cover, textile reinforcement. Anti-static, multi-utility, high-temperature variants. BS 5118/2, ISO 2398.',
      position: 0,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Industrial Air & Water Hoses — Dixon A-Series | Indus Hydraulics',
      seoDescription:
        'Dixon air & water hoses: A101AS-T3 anti-static, A101HP/A102HP/A103HP/A105HP multi-utility, A116EU100 high-temp, A190/A190Y. 20 bar EPDM/SBR. BS 5118/2.',
    },
    {
      slug: 'water-suction-delivery-hoses',
      name: 'Water Suction & Delivery Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Helical wire-reinforced suction/delivery hoses for water transfer, dewatering, irrigation, and tanker service. 10-16 bar working pressure. Dixon A210, A216, DELVAC, IRRIBULK PVC variants.',
      position: 1,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Water Suction & Delivery Hoses — Dixon | Indus Hydraulics',
      seoDescription:
        'Dixon water suction & delivery hoses: A210 (10 bar), A216 (16 bar), DELVAC + IRRIBULK PVC variants. Helical wire reinforced. Dewatering, irrigation, tanker.',
    },
    {
      slug: 'food-beverage-hoses',
      name: 'Food & Beverage Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'FDA / EU food-grade hoses for hygienic transfer of beverages, dairy, bulk food. Dixon SANB / SANF / SANSIL / DELIKATESSE / PREMVIN. CIP/SIP cleaning compatible.',
      position: 2,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Food & Beverage Hoses — Dixon Hygienic | Indus Hydraulics',
      seoDescription:
        'Dixon food & beverage hoses: SANB San-Hygienic Brew, SANF San-Hygienic Food, SANSIL Silicone, DELIKATESSE PVC, PREMVIN. FDA / EU compliant. CIP/SIP.',
    },
    {
      slug: 'oil-chemical-purpose-hoses',
      name: 'Oil, Chemical & General-Purpose Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Multi-purpose oil, fuel, mineral oil, and chemical hoses. Dixon BAKU PVC, A104/A110/A125 multi-purpose, A420 tanker reeling, A430/A460 oil suction & delivery, A400EU mud & sea water, A410/A416 UHMWPE chemical.',
      position: 3,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Oil, Chemical & General-Purpose Hoses — Dixon | Indus Hydraulics',
      seoDescription:
        'Dixon oil/chemical hoses: A104/A110/A125 multi-purpose, A420 tanker reeling, A430/A460 oil S&D, A410/A416 UHMWPE chemical, A400EU mud, BAKU PVC.',
    },
    {
      slug: 'composite-hoses',
      name: 'Composite Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Multi-ply composite hoses — Dixon DIXOIL (A901GG/A901AG) and DIXCHEM (A906PG/A911SG). Internal + external wire helix with polypropylene/polyester layers. EN 13765:2015 Type 3. 14 bar.',
      position: 4,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Composite Hoses — Dixon DIXOIL / DIXCHEM | Indus Hydraulics',
      seoDescription:
        'Dixon composite hoses: A901GG (oil), A901AG (vapour recovery), A906PG (chemical), A911SG (PTFE chemical). EN 13765:2015 Type 3. 14 bar. Tankers, refineries.',
    },
    {
      slug: 'industrial-steam-hoses',
      name: 'Industrial Steam Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Saturated-steam transfer hoses — Dixon A230 (red, 18 bar), A235BK (black, 7 bar), A235BU (steam, hot water, food, 7 bar). EPDM tube, steel-wire reinforcement, EPDM cover. BS 5342 / EN ISO 6134.',
      position: 5,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Industrial Steam Hoses — Dixon A230, A235 | Indus Hydraulics',
      seoDescription:
        'Dixon saturated-steam hoses: A230 (red, 18 bar), A235BK (black, 7 bar), A235BU (food-compatible steam/hot water, 7 bar). EPDM tube + steel-wire reinforcement.',
    },
    {
      slug: 'abrasive-hoses',
      name: 'Abrasive & Bulk-Material Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Bulk-material handling hoses for sand, cement, dry powders, slurry, grain. Dixon A361 bulk material S&D, PREMFLEX MDSE chemical & abrasion PVC. Heavy-duty NR/PVC tube + helical wire.',
      position: 6,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Abrasive & Bulk-Material Hoses — Dixon | Indus Hydraulics',
      seoDescription:
        'Dixon abrasive & bulk-material hoses: A361 bulk material S&D, PREMFLEX MDSE PVC chemical & abrasion. Sand, cement, slurry, grain.',
    },
    {
      slug: 'metallic-ptfe-hoses',
      name: 'Metallic & PTFE Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Stainless-steel corrugated metallic (Adflex / Suparflex / Hyparflex / HP-THP) and PTFE smoothbore / convoluted hoses. -200°C to +650°C metallic; -60°C to +260°C PTFE. EN ISO 10380 class 1. Pharmaceutical, petrochemical, vacuum.',
      position: 7,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Metallic & PTFE Hoses — Dixon Adflex / Suparflex / PTFE | Indus Hydraulics',
      seoDescription:
        'Dixon metallic & PTFE hoses: Adflex / Suparflex / Hyparflex / HP-THP corrugated metallic; smoothbore + convoluted PTFE with stainless or polypropylene braid. EN ISO 10380.',
    },
    {
      slug: 'specialist-hoses',
      name: 'Specialist & Custom-Built Hoses',
      parentSlug: 'industrial-hoses',
      shortDescription:
        'Hand-built and custom-engineered hose assemblies — Dixon Bulkstream rubber-compound hand-built (51-1000 mm bore), heat-traced/jacketed hoses, and GSM ball-joint armoured hoses for steel mill / foundry service.',
      position: 8,
      isPublished: true,
      defaultSpecTemplateSlug: 'industrial-hose-spec',
      seoTitle: 'Specialist & Custom-Built Hoses — Dixon Bulkstream / Heat-Traced / GSM | Indus Hydraulics',
      seoDescription:
        'Dixon specialist hoses: Bulkstream hand-built (51-1000 mm), heat-traced/jacketed, GSM ball-joint armoured. Bespoke rubber compounds, heat-trace cabling.',
    },
  ],

  specTemplates: [INDUSTRIAL_HOSE_SPEC],

  navigation: {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'industrial-hoses',
    createColumnIfMissing: true,
    newColumnLabel: 'Industrial Hoses',
    parentSubLabel: 'Hoses by Service',
    createSubSectionIfMissing: true,
    replacements: [
      { label: 'Air & Water', categorySlug: 'air-water-hoses' },
      { label: 'Water Suction & Delivery', categorySlug: 'water-suction-delivery-hoses' },
      { label: 'Food & Beverage', categorySlug: 'food-beverage-hoses' },
      { label: 'Oil, Chemical & General Purpose', categorySlug: 'oil-chemical-purpose-hoses' },
      { label: 'Composite Hoses', categorySlug: 'composite-hoses' },
      { label: 'Industrial Steam', categorySlug: 'industrial-steam-hoses' },
      { label: 'Abrasive & Bulk Material', categorySlug: 'abrasive-hoses' },
      { label: 'Metallic & PTFE', categorySlug: 'metallic-ptfe-hoses' },
      { label: 'Specialist & Custom-Built', categorySlug: 'specialist-hoses' },
    ],
  },

  products: DIXON_HOSES.map(makeDixonHose),
}

export default batch
