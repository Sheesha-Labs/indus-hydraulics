/**
 * Blowout Preventer (BOP) — Equipment + Foundation
 * 2026-05-11
 *
 * Stands up the entire BOP / Pressure Control catalogue tree under a new
 * top-level category `blowout-preventers` (position 11) and seeds 17
 * Tier 1 + Tier 2 equipment SKUs targeted at the GCC drilling market
 * (Saudi Aramco land + offshore, ADNOC onshore + Hail/Ghasha, KOC, PDO,
 * QatarEnergy, BAPCO, Iraq south).
 *
 * This is the FIRST of three BOP catalogue files in the same PR:
 *   - 2026-05-11-bop-equipment.ts  → foundation + 17 equipment SKUs
 *   - 2026-05-11-bop-spares.ts     → 18 spares & cross-sell bundles
 *   - 2026-05-11-bop-services.ts   → 13 services
 *
 * This file owns all foundation work — adding it to a clean DB is a
 * single-shot bring-up:
 *   - 2 new brands (hydril, shaffer)
 *   - 1 top-level category + 9 sub-categories
 *   - 3 new spec templates (bop-equipment-spec, bop-spares-spec, bop-service-spec)
 *   - New megamenu column "Blowout Preventer" with 3 sub-sections + 9 leaves
 *
 * The spares.ts and services.ts files re-declare brands/categories/templates
 * as no-op upserts (idempotent) so each file remains independently runnable.
 *
 * Pricing: RFQ-only (listPrice = null), AED. Status: active. Country of
 * origin defaults to UAE (re-distributed from Indus Dubai HQ).
 *
 * Region defaults applied to every BOP listing:
 *   - Sour Service (NACE MR0175) — H₂S is a default in the GCC, not an option
 *   - HNBR / AFLAS elastomer line called out for replaceable parts
 *   - B7M / L7M bolting line called out for ring-gasket / flange consumables
 *   - API monogram (16A / 16C / 16D / 6A / 20E) prominent on every PDP
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-equipment.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-equipment.ts
 */
import type {
  BrandPayload,
  CategoryPayload,
  FaqEntry,
  ImportBatch,
  NavReplaceLeavesConfig,
  ProductImportPayload,
  SpecTemplatePayload,
} from '../import/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtPsi(psi: number): string {
  return psi.toLocaleString('en-US') + ' psi'
}

// ── Brands ────────────────────────────────────────────────────────────────

const BRANDS: BrandPayload[] = [
  {
    slug: 'hydril',
    name: 'Hydril',
    country: 'USA',
    description:
      'Hydril is a long-established US oilfield-equipment brand specialising in blowout preventers, particularly the GK / GL / GX annular preventer families that are the regional standard for surface and subsea stacks across Saudi Aramco, ADNOC, KOC, and PDO drilling fleets. Now part of the Cameron / SLB pressure-control portfolio.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Hydril BOP & Pressure Control Equipment | Indus Hydraulics',
    seoDescription:
      'Hydril GK / GX annular BOPs, ram BOPs, packing elements, and aftermarket parts — sourced through Indus Hydraulics for Middle East drilling fleets.',
  },
  {
    slug: 'shaffer',
    name: 'Shaffer',
    country: 'USA',
    description:
      'Shaffer is a long-established US oilfield-equipment brand specialising in ram blowout preventers (LWS, SL, NXT families), spherical annular preventers, and integrated subsea stacks. Now part of NOV Pressure Control. Widely deployed across ADNOC offshore, Saudi Aramco land + offshore, and KOC drilling fleets.',
    isAuthorizedDistributor: false,
    isPublished: true,
    seoTitle: 'Shaffer BOP & Pressure Control Equipment | Indus Hydraulics',
    seoDescription:
      'Shaffer LWS / SL / NXT ram BOPs, spherical annular preventers, ram blocks, and aftermarket parts — sourced through Indus Hydraulics for Middle East drilling fleets.',
  },
]

// ── Categories ────────────────────────────────────────────────────────────

const TOP_CAT: CategoryPayload = {
  slug: 'blowout-preventers',
  name: 'Blowout Preventers (BOP)',
  parentSlug: null,
  shortDescription:
    'Annular and ram blowout preventers, ram blocks, control units, choke & kill manifolds, diverters, drilling spools, and BOP services for onshore and offshore drilling across the GCC. Cameron / Hydril / Shaffer / NOV / WOM compatibility, sour-service (NACE MR0175) defaults, API 16A / 16C / 16D / 6A monograms.',
  position: 11,
  isPublished: true,
  seoTitle: 'Blowout Preventers (BOP), Ram Blocks, Control Units & Services | Indus Hydraulics',
  seoDescription:
    'Annular & ram BOPs, control units, choke & kill manifolds, diverters, spools, spares, and API STD 53 BOP services — Cameron / Hydril / Shaffer / NOV compatibility, sour-service (NACE MR0175) defaults. Dubai-based with full GCC coverage.',
}

const SUB_CATS: CategoryPayload[] = [
  {
    slug: 'bop-annular',
    name: 'Annular BOPs',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Hydril GK / GL / GX style and Shaffer Spherical annular preventers, 5K / 10K / 15K psi WP, sour-service rated. The regional surface-stack and subsea workhorses across Saudi Aramco, ADNOC, KOC and PDO fleets.',
    position: 1,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'Annular BOPs — Hydril GK / GX / Shaffer Spherical | Indus Hydraulics',
    seoDescription:
      'Annular blowout preventers in Hydril GK / GX and Shaffer Spherical styles, 5K / 10K / 15K psi, sour-service. Stocked and sourced via Indus Hydraulics Dubai for GCC drilling fleets.',
  },
  {
    slug: 'bop-ram',
    name: 'Ram BOPs',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Single, double, triple, and quadruple cavity ram BOPs in Cameron U / UII / T / Shaffer LWS / SL / NXT styles. 3K / 5K / 10K / 15K psi WP, sour-service (NACE MR0175) standard. Includes coiled-tubing, snubbing, and rotating control device variants for well intervention.',
    position: 2,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'Ram BOPs — Cameron U / Shaffer SL / Coiled Tubing / Snubbing | Indus Hydraulics',
    seoDescription:
      'Ram blowout preventers — Cameron U / UII / T, Shaffer LWS / SL / NXT, plus CT Quad, Snubbing, and Rotating Control Device variants. 3K to 15K psi, sour-service. Indus Hydraulics Dubai.',
  },
  {
    slug: 'bop-ram-blocks',
    name: 'Ram Blocks & Assemblies',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Pipe rams, variable bore rams (VBRs), blind rams, shear rams, and blind-shear ram block assemblies for Cameron U / UII / T and Shaffer LWS / SL / NXT BOP cavities. Sour-service grades, multiple drill-pipe / casing OD ranges. Aftermarket-acceptable for tier-1 GCC operators when supplied with API 16A / NACE MR0175 documentation.',
    position: 3,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-spares-spec',
    seoTitle: 'BOP Ram Blocks — Pipe / VBR / Blind / Shear / Blind-Shear | Indus Hydraulics',
    seoDescription:
      'Cameron U / Shaffer SL / NXT ram block assemblies — pipe rams, VBRs, blind rams, blind-shear rams. 5K / 10K psi, sour-service (NACE MR0175). Sized for 5" / 5-1/2" DP and casing OD.',
  },
  {
    slug: 'bop-spare-parts',
    name: 'BOP Spare Parts & Elastomers',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Annular packing elements, ram packers, bonnet seals, BX ring gaskets, B7M / L7M studs, choke trim kits, koomey soft goods, ram redress kits, nipple-up kits, and BOP test plugs / lift subs. The recurring-purchase consumables that keep a rig BOP operating between recerts.',
    position: 4,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-spares-spec',
    seoTitle: 'BOP Spare Parts & Elastomers — Packing Elements, Ring Gaskets, Studs, Kits | Indus Hydraulics',
    seoDescription:
      'BOP consumables for the GCC — Hydril GK / GX annular elements, Cameron U ram packers, BX gaskets, B7M studs, koomey soft goods, ram redress kits. HNBR / AFLAS sour-service defaults.',
  },
  {
    slug: 'bop-control-units',
    name: 'BOP Control Units & Accumulators',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Koomey-style BOP closing units (Type 80 / Type 100), accumulators, SPM valves, regulators, air-hydraulic pumps, and pilot control hoses per API 16D. Configurable station counts for surface and offshore stacks; 5-year recertification service available.',
    position: 5,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'BOP Control Units & Accumulators (Koomey) — API 16D | Indus Hydraulics',
    seoDescription:
      'Koomey Type 80 / Type 100 BOP control units and accumulators, API 16D, configurable station count. Surface and offshore. Indus Hydraulics Dubai for the GCC.',
  },
  {
    slug: 'bop-choke-kill',
    name: 'Choke & Kill Manifolds & Valves',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'API 16C choke & kill manifolds, gate valves, hydraulic chokes, and trim kits matched to the BOP stack pressure rating. Sour-service trim, Cameron FC / FLS / McEvoy / NOV gate valve compatibility.',
    position: 6,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'Choke & Kill Manifolds & Gate Valves — API 16C | Indus Hydraulics',
    seoDescription:
      'API 16C choke & kill manifolds, gate valves, and trim kits for BOP stacks 5K / 10K / 15K psi. Sour-service trim. Cameron / NOV / McEvoy compatibility. Indus Hydraulics Dubai.',
  },
  {
    slug: 'bop-diverters',
    name: 'Diverter Systems',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'Top-hole diverter systems for offshore jack-up and platform drilling through shallow gas — typically 21-1/4" 2K class. HMH KFDJ / KFDS-FS lineage; mandatory on Lower Zakum, Marjan, Safaniyah and similar shallow-gas-charged offshore tophole sections.',
    position: 7,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'Diverter Systems — Offshore Top-Hole Shallow Gas | Indus Hydraulics',
    seoDescription:
      'Top-hole diverter systems 21-1/4" 2K for offshore jack-up and platform drilling — shallow-gas protection on ADNOC offshore, Saudi Aramco offshore, and equivalent GCC fields.',
  },
  {
    slug: 'bop-spools-adapters',
    name: 'Drilling Spools, DSAs & Adapter Flanges',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'API 6A drilling spools, double-studded adapters (DSAs), adapter flanges, and crossovers — the connection hardware that ties BOP stacks to wellheads and to one another. 5K / 10K / 15K psi, sour-service.',
    position: 8,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-equipment-spec',
    seoTitle: 'Drilling Spools, DSAs & Adapter Flanges — API 6A | Indus Hydraulics',
    seoDescription:
      'API 6A drilling spools, double-studded adapters (DSAs), crossovers, and adapter flanges. 5K / 10K / 15K psi, sour-service. Indus Hydraulics Dubai for GCC drilling.',
  },
  {
    slug: 'bop-services',
    name: 'BOP Services',
    parentSlug: 'blowout-preventers',
    shortDescription:
      'API STD 53 pressure testing, API 16A 5-year major recertification, annual elastomer redress (per Aramco spec), BOP stack rentals, accumulator (Koomey) recertification, choke & kill recert, field service crews, CT / snubbing / wireline BOP services, RCD service, IWCF / IADC WellSharp well control training.',
    position: 9,
    isPublished: true,
    defaultSpecTemplateSlug: 'bop-service-spec',
    seoTitle: 'BOP Services — Pressure Testing, Recertification, Rentals, Field Crew | Indus Hydraulics',
    seoDescription:
      'BOP services for the GCC — API STD 53 testing, 5-year recertification, annual redress, stack rentals, koomey service, field crew, CT / snubbing / wireline BOP testing, IWCF training.',
  },
]

// ── Spec templates ────────────────────────────────────────────────────────

const BORE_SIZE_OPTIONS = [
  '2-1/16"',
  '3-1/16"',
  '4-1/16"',
  '5-1/8"',
  '7-1/16"',
  '9"',
  '11"',
  '13-5/8"',
  '16-3/4"',
  '18-3/4"',
  '20-3/4"',
  '21-1/4"',
  'N/A',
]

const PRESSURE_CLASS_OPTIONS = ['2K', '3K', '5K', '10K', '15K', '20K', 'N/A']

const SERVICE_CLASS_OPTIONS = [
  'Standard',
  'Sour Service (NACE MR0175)',
  'HPHT',
  'HPHT + Sour',
]

const BOP_EQUIPMENT_SPEC: SpecTemplatePayload = {
  slug: 'bop-equipment-spec',
  name: 'BOP Equipment',
  description:
    'Spec template for blowout preventer equipment — annular and ram BOPs, BOP control units / accumulators, choke & kill manifolds, diverters, drilling spools, and adapter flanges. Covers Cameron / Hydril / Shaffer / NOV / WOM compatibility for 5K / 10K / 15K psi surface and subsea stacks.',
  position: 30,
  fields: [
    {
      key: 'bop_equipment_type',
      label: 'BOP Equipment Type',
      dataType: 'select',
      options: [
        'Annular BOP',
        'Ram BOP (Single)',
        'Ram BOP (Double)',
        'Ram BOP (Triple)',
        'Ram BOP (Quadruple)',
        'Coiled Tubing Quad BOP',
        'Snubbing BOP Stack',
        'Subsea BOP Stack',
        'Rotating Control Device',
        'Diverter System',
        'BOP Control Unit / Accumulator',
        'Choke & Kill Manifold',
        'Drilling Spool',
        'Double Studded Adapter (DSA)',
        'Adapter Flange / Crossover',
      ],
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'bore_size',
      label: 'Vertical Bore Size',
      dataType: 'select',
      options: BORE_SIZE_OPTIONS,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'working_pressure_psi',
      label: 'Cold Working Pressure',
      dataType: 'number',
      unit: 'psi',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'pressure_class',
      label: 'Pressure Class',
      dataType: 'select',
      options: PRESSURE_CLASS_OPTIONS,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: SERVICE_CLASS_OPTIONS,
      helpText: 'Sour Service (NACE MR0175 / ISO 15156) is the GCC default.',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 5,
    },
    {
      key: 'ram_configuration',
      label: 'Ram Configuration',
      dataType: 'select',
      options: ['Single', 'Double', 'Triple', 'Quadruple', 'N/A'],
      group: 'Configuration',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'end_connection',
      label: 'End Connection',
      dataType: 'text',
      group: 'Configuration',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'material_construction',
      label: 'Body Material',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'api_monogram',
      label: 'API Monogram',
      dataType: 'select',
      options: ['16A', '16C', '16D', '6A', 'Multiple', 'None'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 9,
    },
    {
      key: 'temperature_rating',
      label: 'Temperature Rating',
      dataType: 'text',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'oem_compatibility',
      label: 'OEM Compatibility',
      dataType: 'text',
      helpText: 'Cameron U / Hydril GK / Shaffer LWS / NOV / WOM cross-reference.',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'weight_kg',
      label: 'Weight',
      dataType: 'number',
      unit: 'kg',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
  ],
}

const BOP_SPARES_SPEC: SpecTemplatePayload = {
  slug: 'bop-spares-spec',
  name: 'BOP Spares & Consumables',
  description:
    'Spec template for BOP spare parts and consumables — annular packing elements, ram block assemblies, ring gaskets, stud & nut kits, ram redress kits, nipple-up kits, koomey soft goods. Cameron / Hydril / Shaffer aftermarket cross-reference; HNBR / AFLAS / NACE MR0175 sour-service defaults for the GCC.',
  position: 31,
  fields: [
    {
      key: 'spare_type',
      label: 'Spare Part Type',
      dataType: 'select',
      options: [
        'Annular Packing Element',
        'Pipe Ram Block Assembly',
        'Variable Bore Ram (VBR) Block',
        'Blind Ram Block',
        'Shear Ram Block',
        'Blind-Shear Ram Block',
        'Bonnet Seal Kit',
        'Ring Gasket Set',
        'Stud & Nut Kit',
        'Ram Redress Kit',
        'Annular Element + Head Seal Kit',
        'BOP Nipple-Up Kit',
        'Koomey Soft Goods Kit',
        'BOP Test Plug & Lift Sub Set',
        'Other',
      ],
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'fits_oem',
      label: 'Fits OEM',
      dataType: 'text',
      helpText: 'Cameron U / UII / T, Hydril GK / GX, Shaffer LWS / SL / NXT, etc.',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'bore_size',
      label: 'BOP Bore Size',
      dataType: 'select',
      options: BORE_SIZE_OPTIONS,
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 3,
    },
    {
      key: 'working_pressure_psi',
      label: 'Cold Working Pressure',
      dataType: 'number',
      unit: 'psi',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'pressure_class',
      label: 'Pressure Class',
      dataType: 'select',
      options: PRESSURE_CLASS_OPTIONS,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 5,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: SERVICE_CLASS_OPTIONS,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 6,
    },
    {
      key: 'elastomer_compound',
      label: 'Elastomer Compound',
      dataType: 'select',
      options: ['NBR', 'HNBR', 'FKM (Viton)', 'AFLAS', 'N/A'],
      helpText: 'HNBR / AFLAS for sour-service GCC fields; NBR for sweet-service only.',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'pipe_or_tubing_size',
      label: 'Pipe / Tubing Size',
      dataType: 'text',
      helpText: 'For pipe rams: drill-pipe OD (e.g., 5", 5-1/2"). For VBRs: range.',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'bolt_grade',
      label: 'Bolt Grade',
      dataType: 'select',
      options: ['B7', 'B7M', 'L7', 'L7M', 'N/A'],
      helpText: 'B7M / L7M for sour service per NACE MR0175.',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'ring_gasket_type',
      label: 'Ring Gasket Type',
      dataType: 'select',
      options: ['BX', 'RX', 'R', 'API 6A', 'N/A'],
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
    {
      key: 'material',
      label: 'Material of Construction',
      dataType: 'text',
      group: 'Construction',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 11,
    },
    {
      key: 'api_spec',
      label: 'API Specification',
      dataType: 'select',
      options: ['6A', '16A', '20E', 'Multiple', 'None'],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 12,
    },
    {
      key: 'temperature_rating',
      label: 'Temperature Rating',
      dataType: 'text',
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 13,
    },
    {
      key: 'kit_contents',
      label: 'Kit Contents',
      dataType: 'text',
      helpText: 'For kits and bundles — itemise the included parts.',
      group: 'Configuration',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 14,
    },
  ],
}

const BOP_SERVICE_SPEC: SpecTemplatePayload = {
  slug: 'bop-service-spec',
  name: 'BOP Service',
  description:
    'Spec template for BOP services — pressure testing, recertification, redress, stack rentals, koomey service, field service crew, CT / snubbing / wireline BOP service, RCD service, training. API STD 53 / API 16A / 16C / 16D defaults; sour-service capability called out per service.',
  position: 32,
  fields: [
    {
      key: 'service_type',
      label: 'Service Type',
      dataType: 'select',
      options: [
        'BOP Pressure Testing',
        '5-Year Major Inspection & Recertification',
        'Annual Redress / Elastomer Service',
        'BOP Stack Rental',
        'Accumulator (Koomey) Service',
        'Choke & Kill Service',
        'Field Service Crew',
        'CT BOP Service',
        'Snubbing BOP Service',
        'Wireline BOP Service',
        'RCD Service',
        'Subsea Stack Service',
        'Diverter Service',
        'HPHT Service',
        'FAT/SIT Witness & Engineering',
        'Well Control Training',
        'Other',
      ],
      group: 'Identification',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 1,
    },
    {
      key: 'api_standard',
      label: 'API Standard',
      dataType: 'select',
      options: [
        'API STD 53',
        'API 16A',
        'API 16C',
        'API 16D',
        'API Q1',
        'API Q2',
        'IWCF',
        'IADC WellSharp',
        'Multiple',
        'None',
      ],
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 2,
    },
    {
      key: 'equipment_compatibility',
      label: 'Equipment Compatibility',
      dataType: 'text',
      helpText: 'Cameron U / Shaffer SL / Hydril GK / NOV LWS, etc.',
      group: 'Identification',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 3,
    },
    {
      key: 'pressure_class',
      label: 'Pressure Class Coverage',
      dataType: 'select',
      options: PRESSURE_CLASS_OPTIONS,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: true,
      position: 4,
    },
    {
      key: 'service_class',
      label: 'Service Class',
      dataType: 'select',
      options: SERVICE_CLASS_OPTIONS,
      group: 'Performance',
      isRequired: false,
      isKeyFeature: true,
      isQuickSpec: true,
      position: 5,
    },
    {
      key: 'service_environment',
      label: 'Service Environment',
      dataType: 'select',
      options: ['Onshore', 'Offshore', 'Subsea', 'All'],
      group: 'Configuration',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 6,
    },
    {
      key: 'deliverables',
      label: 'Deliverables',
      dataType: 'text',
      helpText: 'What the customer receives — test reports, recert certificates, etc.',
      group: 'Scope',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 7,
    },
    {
      key: 'certifications',
      label: 'Certifications Held',
      dataType: 'text',
      helpText: 'API monogram licences, ISO 9001 / 45001, ASNT NDT, IWCF accreditation.',
      group: 'Compliance',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 8,
    },
    {
      key: 'coverage_area',
      label: 'Coverage Area',
      dataType: 'text',
      helpText: 'UAE / Saudi Arabia / Oman / Kuwait / Qatar / Bahrain / Iraq.',
      group: 'Scope',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 9,
    },
    {
      key: 'typical_lead_time',
      label: 'Typical Lead Time',
      dataType: 'text',
      group: 'Scope',
      isRequired: false,
      isKeyFeature: false,
      isQuickSpec: false,
      position: 10,
    },
  ],
}

// ── Megamenu navigation ───────────────────────────────────────────────────
//
// Creates a brand-new "Blowout Preventer" column under primary_megamenu with
// three sub-sections (Equipment, Control & Aftermarket, Services). The first
// config creates the column; all three create their sub-sections if missing.
// All configs are idempotent — re-running this import is a no-op.

const NAV_CONFIGS: NavReplaceLeavesConfig[] = [
  {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'blowout-preventers',
    parentSubLabel: 'Equipment',
    createColumnIfMissing: true,
    newColumnPosition: 11,
    newColumnLabel: 'Blowout Preventer',
    createSubSectionIfMissing: true,
    newSubSectionPosition: 1,
    replacements: [
      { label: 'Annular BOPs', categorySlug: 'bop-annular' },
      { label: 'Ram BOPs', categorySlug: 'bop-ram' },
      { label: 'Ram Blocks & Assemblies', categorySlug: 'bop-ram-blocks' },
      { label: 'Diverter Systems', categorySlug: 'bop-diverters' },
      { label: 'Spools, DSAs & Adapter Flanges', categorySlug: 'bop-spools-adapters' },
    ],
  },
  {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'blowout-preventers',
    parentSubLabel: 'Control & Aftermarket',
    createColumnIfMissing: true,
    createSubSectionIfMissing: true,
    newSubSectionPosition: 2,
    replacements: [
      { label: 'Control Units & Accumulators', categorySlug: 'bop-control-units' },
      { label: 'Choke & Kill Manifolds & Valves', categorySlug: 'bop-choke-kill' },
      { label: 'Spare Parts & Elastomers', categorySlug: 'bop-spare-parts' },
    ],
  },
  {
    menuLocation: 'primary_megamenu',
    parentColumnCategorySlug: 'blowout-preventers',
    parentSubLabel: 'Services',
    createColumnIfMissing: true,
    createSubSectionIfMissing: true,
    newSubSectionPosition: 3,
    replacements: [{ label: 'BOP Services', categorySlug: 'bop-services' }],
  },
]

// ── Equipment input shape ─────────────────────────────────────────────────

type EquipmentInput = {
  sku: string
  title: string
  categorySlug: string
  bopType: string
  bore: string // e.g. '13-5/8"'
  workingPressurePsi: number
  pressureClass: string
  serviceClass: 'Standard' | 'Sour Service (NACE MR0175)' | 'HPHT' | 'HPHT + Sour'
  ramConfig?: 'Single' | 'Double' | 'Triple' | 'Quadruple' | 'N/A'
  endConnection: string
  material: string
  apiMonogram: '16A' | '16C' | '16D' | '6A' | 'Multiple' | 'None'
  temperatureRating: string
  oemCompatibility: string
  weightKg?: number
  oneLiner: string
  designNote: string
  applications: string[]
  oemKeywords: string[]
  leadTimeDays: number
  // Optional control-unit specific:
  accumulatorGal?: number
  stationCount?: number
  closingTimeSeconds?: number
}

// ── HTML description builder for equipment ────────────────────────────────

function buildEquipmentHtml(g: EquipmentInput): string {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  const isHpht = g.serviceClass === 'HPHT' || g.serviceClass === 'HPHT + Sour'
  const sourLine = isSour
    ? 'NACE MR0175 / ISO 15156 sour-service compliant — full body, trim, and bolting hardness controlled per the standard. Required across Saudi Aramco, ADNOC, KOC, PDO, and QatarEnergy default specifications for sour fields.'
    : 'Standard service rated for sweet hydrocarbon, completion fluid, water, brine, and gas streams within the working-pressure envelope. For wells with H₂S exposure, specify the sour-service variant.'
  const hphtLine = isHpht
    ? ' HPHT-capable trim — qualified for high-pressure / high-temperature service consistent with Hail & Ghasha (ADNOC), Jafurah (Aramco), and equivalent ultra-deep sour gas plays.'
    : ''
  const apps = g.applications.map((a) => `<li>${escape(a)}</li>`).join('')
  const oemKw = g.oemKeywords.map((k) => `<li>${escape(k)}</li>`).join('')
  const accum =
    g.accumulatorGal !== undefined
      ? `<li>Accumulator capacity: ${g.accumulatorGal} gal usable</li>`
      : ''
  const stations =
    g.stationCount !== undefined
      ? `<li>Stations: ${g.stationCount} (configurable)</li>`
      : ''
  const closing =
    g.closingTimeSeconds !== undefined
      ? `<li>Closing time: &lt; ${g.closingTimeSeconds} s on largest cavity (per API STD 53)</li>`
      : ''
  const ramConfigLine =
    g.ramConfig && g.ramConfig !== 'N/A'
      ? `<li>Ram configuration: ${escape(g.ramConfig)}</li>`
      : ''

  return `<p>The <strong>${escape(g.title)}</strong> is a complete ${escape(g.bopType.toLowerCase())} unit rated for ${escape(fmtPsi(g.workingPressurePsi))} working pressure (${escape(g.pressureClass)} class) in ${escape(g.serviceClass.toLowerCase())}. ${escape(g.designNote)} ${escape(sourLine)}${escape(hphtLine)}</p>
<h3>Construction</h3>
<ul>
<li>Equipment type: ${escape(g.bopType)}</li>
<li>Vertical bore size: ${escape(g.bore)}</li>
<li>Cold working pressure: ${escape(fmtPsi(g.workingPressurePsi))} (${escape(g.pressureClass)} class)</li>
<li>Service class: ${escape(g.serviceClass)}</li>
${ramConfigLine}
<li>End connections: ${escape(g.endConnection)}</li>
<li>Body material: ${escape(g.material)}</li>
<li>Temperature rating: ${escape(g.temperatureRating)}</li>
${accum}
${stations}
${closing}
${g.weightKg !== undefined ? `<li>Approximate weight: ${g.weightKg.toLocaleString('en-US')} kg (transport-ready)</li>` : ''}
</ul>
<h3>OEM compatibility</h3>
<p>Engineered as a recognised matched-pressure interchange / supply for the following OEM equipment lines (Indus Hydraulics is not an authorised distributor of these OEMs — units are sourced through Indus and supplied with full traceability):</p>
<ul>
${oemKw}
</ul>
<p>OEM cross-reference: <strong>${escape(g.oemCompatibility)}</strong>.</p>
<h3>Applications</h3>
<ul>
${apps}
</ul>
<h3>Performance & testing</h3>
<p>Hydrostatic shell test at 1.5× rated working pressure on every unit. Function-test on rams, packers, and seal elements per API STD 53. Mill test reports per EN 10204 3.1 / 3.2 supplied. Charpy V-notch impact testing at low temperature available where service requires toughness verification. Closing-time and seal-pressure data sheets included with FAT package.</p>
<h3>Compliance</h3>
<ul>
<li>API ${escape(g.apiMonogram)} (per equipment class)</li>
${isSour ? '<li>NACE MR0175 / ISO 15156 (sour-service / H₂S)</li>' : ''}
${isHpht ? '<li>HPHT trim qualification (high-pressure / high-temperature)</li>' : ''}
<li>EN 10204 3.1 / 3.2 mill test reports</li>
<li>Hydrostatic test certificates per unit</li>
<li>Heat-number traceability stamped on body</li>
<li>FAT (factory acceptance test) report on request</li>
</ul>
<h3>How to order</h3>
<p>Confirm on your RFQ: (a) exact bore size, (b) working pressure and pressure class, (c) ram configuration / cavity count (where applicable), (d) end connection family (API 6A studded, flanged, or bolted), (e) service class — sour (NACE MR0175), HPHT, or standard, (f) elastomer compound preference (HNBR / AFLAS for GCC sour service), (g) FAT witness requirement, and (h) destination port for door-to-door logistics. Indus quotes ex-Dubai (AED) with Aramco / ADNOC / KOC vendor-registered logistics support.</p>
<h3>Region notes</h3>
<p>Stocked / sourced for the GCC: Saudi Arabia (Aramco IKTVA), UAE (ADNOC ICV), Kuwait (KOC), Oman (PDO), Qatar (QatarEnergy), Bahrain (BAPCO), and Iraq south. Sour-service trim is the regional default; Indus carries sour-service variants in stock and treats sweet-service as a build-to-order downgrade.</p>
<h3>Companion products</h3>
<p>Pair with matched-pressure ${escape(g.pressureClass)} BOP control unit (Koomey-style accumulator), API 16C choke & kill manifold, BX ring gaskets, B7M studs and 2H nuts (sour service), HNBR / AFLAS elastomer kits, and matching drilling spool / DSA crossover. Annual redress kits and 5-year API 16A recertification service available — see the BOP Services category.</p>`
}

// ── FAQ generator for equipment ───────────────────────────────────────────

function buildEquipmentFaqs(g: EquipmentInput): FaqEntry[] {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  return [
    {
      q: `What pressure rating and bore size does this ${g.bopType.toLowerCase()} carry?`,
      a: `Cold working pressure ${fmtPsi(g.workingPressurePsi)} (${g.pressureClass} class) at ${g.bore} vertical bore. Hydrostatic shell test at 1.5× working pressure on every unit, with function testing per API STD 53. The ${g.pressureClass} class is the regional default for ${g.pressureClass === '5K' ? 'shallower mature-field onshore' : g.pressureClass === '10K' ? 'mainstream development drilling — Saudi Aramco land, KOC, ADNOC onshore' : g.pressureClass === '15K' ? 'ultra-sour gas (Hail & Ghasha, Jafurah, Khuff) and HPHT' : 'specialised'} service in the GCC.`,
    },
    {
      q: 'Is this BOP suitable for sour-service (H₂S) wells?',
      a: isSour
        ? `Yes — this unit is fully NACE MR0175 / ISO 15156 sour-service compliant. Body forging, trim, ram blocks / packing element, and bolting hardness are controlled per the standard. Required across Saudi Aramco (Khurais, Hawiyah, Haradh, Khuff), ADNOC (Asab, Bab, Hail & Ghasha), KOC (North Kuwait Jurassic), PDO sour fields, and QatarEnergy North Field. Provide H₂S partial pressure, temperature, and chloride content on the RFQ for a final material-selection sign-off.`
        : `No — this configuration is rated for sweet (standard) service. For wells with H₂S exposure, specify the sour-service variant — Indus carries sour-service trim as the regional default and can re-spec the order to NACE MR0175 / ISO 15156 with HNBR or AFLAS elastomers and B7M / L7M bolting.`,
    },
    {
      q: 'What OEM equipment is this compatible with?',
      a: `Engineered as a recognised matched-pressure interchange / sourced supply for ${g.oemKeywords.join(', ')}. OEM cross-reference: ${g.oemCompatibility}. Indus Hydraulics is not an authorised distributor of these OEMs but every unit ships with full mill test reports, hydrostatic certificates, and heat-number traceability. Where the application requires an OEM-stamped unit, Indus can source a genuine OEM build to your specification — call us with the wellhead programme and BOP stack-up drawing.`,
    },
    {
      q: 'What end connections does this unit have?',
      a: `${g.endConnection}. Connection style is matched to your wellhead and adjacent stack components — confirm on the RFQ. For ring gasket sizing, Indus supplies BX-152 / BX-154 / BX-155 / BX-158 / BX-160 / BX-169 (sized to ${g.bore}) in soft iron (sweet) or Inconel-625-clad (sour service) — see the BOP Spare Parts category.`,
    },
    {
      q: 'What approvals and certifications come with each unit?',
      a: `Each unit ships with: (a) API ${g.apiMonogram} compliance documentation, (b) hydrostatic test certificate at 1.5× working pressure, (c) EN 10204 3.1 / 3.2 mill test reports, (d) heat-number stamped on body for full traceability, (e) function-test report per API STD 53${isSour ? ', (f) NACE MR0175 / ISO 15156 sour-service compliance certificate, (g) charpy V-notch impact-energy report at the applicable test temperature' : ''}, and a complete export-ready certificate package for customs clearance into KSA, UAE, Iraq, Oman, Kuwait, Qatar, and Bahrain.`,
    },
    {
      q: 'What companion equipment do I need to order with this BOP?',
      a: `A complete BOP installation typically requires: (a) Koomey-style accumulator / control unit (API 16D) sized to the closing-volume requirement, (b) API 16C choke & kill manifold matched to the working-pressure class, (c) BX ring gaskets and B7M studs / 2H nuts for the flanged connections (sour-service grade if applicable), (d) drilling spool or DSA crossover to mate to the wellhead, (e) HNBR / AFLAS elastomer kits for the first redress cycle, and (f) optional 5-year API 16A recertification service. All available from Indus — bundle the RFQ for matched-class / matched-cert delivery.`,
    },
    {
      q: 'Can Indus supply on Aramco / ADNOC / KOC vendor terms?',
      a: `Yes. Indus is set up for the GCC NOC procurement reality — Saudi Aramco IKTVA, ADNOC ICV, KOC, PDO, QatarEnergy, BAPCO, and Iraq vendor lists. We can supply against your purchase order with the exact certification package, packaging, and INCOTERMS each NOC requires (typically DDP wellsite, DAP base, or FCA Dubai). Lead-time, ICV/IKTVA local-content credit position, and shipping window are confirmed on the RFQ.`,
    },
    {
      q: 'What is the lead time and how do I order?',
      a: `Common configurations are stock-or-short-lead from Dubai — typical lead time ${g.leadTimeDays} working days for stock-style units; build-to-order configurations are 12–24 weeks ex-works depending on mill build slots. RFQ with: (a) exact bore size + pressure class + ram cavity count, (b) service class (sour / sweet / HPHT), (c) end-connection style on each port, (d) elastomer preference, (e) certification requirements (NACE, charpy, mill 3.2 vs 3.1, IKTVA / ICV documentation), (f) destination port. Indus quotes ex-Dubai (AED) with door-to-door logistics on request — sales@indushydraulics.com or WhatsApp +971 (Dubai HQ).`,
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeEquipmentProduct(g: EquipmentInput): ProductImportPayload {
  const isSour =
    g.serviceClass === 'Sour Service (NACE MR0175)' ||
    g.serviceClass === 'HPHT + Sour'
  const focusKw =
    `${g.bopType.toLowerCase()} ${g.bore} ${g.pressureClass.toLowerCase()}${isSour ? ' sour' : ''}`
      .slice(0, 120)
  return {
    sku: g.sku,
    title: g.title,
    brandSlug: 'indus',
    categorySlug: g.categorySlug,
    specTemplateSlug: 'bop-equipment-spec',
    status: 'active',
    unitOfMeasure: 'each',
    listPriceCurrency: 'AED',
    stockQty: 0,
    leadTimeDays: g.leadTimeDays,
    countryOfOrigin: 'UAE',
    descriptionShort: g.oneLiner.slice(0, 500),
    descriptionLong: buildEquipmentHtml(g),
    specs: {
      bop_equipment_type: g.bopType,
      bore_size: g.bore,
      working_pressure_psi: g.workingPressurePsi,
      pressure_class: g.pressureClass,
      service_class: g.serviceClass,
      ram_configuration: g.ramConfig ?? 'N/A',
      end_connection: g.endConnection,
      material_construction: g.material,
      api_monogram: g.apiMonogram,
      temperature_rating: g.temperatureRating,
      oem_compatibility: g.oemCompatibility,
      ...(g.weightKg !== undefined ? { weight_kg: g.weightKg } : {}),
    },
    faqs: buildEquipmentFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: focusKw,
  }
}

// ── Equipment data — 17 SKUs (Tier 1 + Tier 2) ────────────────────────────

const STD_TEMP = '-20°F to 250°F (-29°C to 121°C) — API 16A standard envelope'
const SOUR_TEMP = '-20°F to 180°F (-29°C to 82°C) — sour-service NACE MR0175 envelope'
const HPHT_TEMP = '-20°F to 350°F (-29°C to 177°C) — HPHT trim envelope'
const STD_MAT = 'Forged AISI 4130 alloy steel — quenched and tempered to API 16A working-pressure design; hardness controlled'
const SOUR_MAT = 'Forged AISI 4130 alloy steel — NACE MR0175 hardness controlled (max 22 HRC); charpy V-notch tested at low temperature'

const PRODUCTS: EquipmentInput[] = [
  // ── Annular BOPs (5) ────────────────────────────────────────────────────
  {
    sku: 'IH-BOP-AN-13-58-5K-T20-INDUS',
    title: 'Annular BOP, Hydril GK Style, 13-5/8" 5,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-annular',
    bopType: 'Annular BOP',
    bore: '13-5/8"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 13-5/8" 5K studded top × studded bottom; alternative flanged on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Hydril GK 13-5/8" 5K (genuine), Cameron D 13-5/8" 5K, Shaffer Spherical 13-5/8" 5K — interchangeable on standard surface stack-ups',
    weightKg: 4500,
    closingTimeSeconds: 30,
    oneLiner:
      'Hydril GK style annular BOP, 13-5/8" 5,000 psi cold working pressure, sour-service (NACE MR0175). The regional surface-stack workhorse for shallow / mature onshore drilling across Saudi Aramco, ADNOC, KOC, and PDO.',
    designNote:
      'The 13-5/8" 5K annular is the most common surface-stack annular preventer in the GCC — paired on top of a 13-5/8" 5K ram stack for shallow onshore drilling. Spherical packer with HNBR or AFLAS elastomer (specify on RFQ).',
    applications: [
      'Surface BOP stack on shallow onshore land rigs (Aramco, KOC, PDO, BAPCO, Iraq south)',
      'Mature-field development drilling at 5K WP',
      'Workover BOP top piece on 5K well head',
      'Stripper-mode drilling through annular on slim-hole intervals',
    ],
    oemKeywords: ['Hydril GK 13-5/8" 5K', 'Cameron D 13-5/8" 5K', 'Shaffer Spherical 13-5/8" 5K'],
    leadTimeDays: 60,
  },
  {
    sku: 'IH-BOP-AN-13-58-10K-T20-INDUS',
    title: 'Annular BOP, Hydril GK Style, 13-5/8" 10,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-annular',
    bopType: 'Annular BOP',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 13-5/8" 10K studded top × flanged bottom; both studded on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Hydril GK 13-5/8" 10K (genuine), Cameron DL 13-5/8" 10K, Shaffer Spherical 13-5/8" 10K — interchangeable on standard surface stack-ups',
    weightKg: 6800,
    closingTimeSeconds: 30,
    oneLiner:
      'Hydril GK style annular BOP, 13-5/8" 10,000 psi cold working pressure, sour-service (NACE MR0175). Pairs with 13-5/8" 10K Cameron U ram stack on Aramco / ADNOC / KOC mainstream development drilling.',
    designNote:
      'The 13-5/8" 10K annular is the GCC mainstream development-drilling annular — sits atop the 13-5/8" 10K ram stack. HNBR or AFLAS spherical packer for sour service. Heavy-duty operating cylinder for repeated-cycle sour wells.',
    applications: [
      'Surface BOP stack on mainstream onshore Aramco, ADNOC, KOC, PDO development drilling',
      'Sour-service oil and gas drilling at 10K WP',
      'Saudi Khurais / Hawiyah / Haradh / Khuff land programmes',
      'ADNOC Bab / Asab onshore sour-service drilling',
    ],
    oemKeywords: ['Hydril GK 13-5/8" 10K', 'Cameron DL 13-5/8" 10K', 'Shaffer Spherical 13-5/8" 10K'],
    leadTimeDays: 90,
  },
  {
    sku: 'IH-BOP-AN-11-10K-T20-INDUS',
    title: 'Annular BOP, Hydril GK Style, 11" 10,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-annular',
    bopType: 'Annular BOP',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 11" 10K studded top × flanged bottom; both studded on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Hydril GK 11" 10K (genuine), Cameron DL 11" 10K, Shaffer Spherical 11" 10K — interchangeable on workover and slim-hole stacks',
    weightKg: 5200,
    closingTimeSeconds: 30,
    oneLiner:
      'Hydril GK style annular BOP, 11" 10,000 psi cold working pressure, sour-service (NACE MR0175). The workover and slim-hole annular for sour-service infill drilling across Aramco / ADNOC / KOC.',
    designNote:
      'The 11" 10K annular is the second-most-common surface annular in the GCC — paired with 11" 10K Cameron U / Shaffer SL ram stacks for workover and slim-hole infill drilling on sour wells.',
    applications: [
      'Workover BOP stack on 11" 10K wellheads',
      'Slim-hole infill drilling on Aramco / KOC mature fields',
      'Sour-service drilling at 10K WP through smaller bore',
      'CT and snubbing operations (top annular)',
    ],
    oemKeywords: ['Hydril GK 11" 10K', 'Cameron DL 11" 10K', 'Shaffer Spherical 11" 10K'],
    leadTimeDays: 90,
  },
  {
    sku: 'IH-BOP-AN-11-5K-T20-INDUS',
    title: 'Annular BOP, Hydril GK Style, 11" 5,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-annular',
    bopType: 'Annular BOP',
    bore: '11"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 11" 5K studded top × studded bottom',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Hydril GK 11" 5K (genuine), Cameron D 11" 5K, Shaffer Spherical 11" 5K',
    weightKg: 3800,
    closingTimeSeconds: 30,
    oneLiner:
      'Hydril GK style annular BOP, 11" 5,000 psi cold working pressure, sour-service (NACE MR0175). Workover and shallow-well annular for mature Bahrain, Iraq south, Oman, and KOC fields at 5K WP.',
    designNote:
      'The 11" 5K annular is the workover-stack annular on shallower / mature wells — paired with 11" 5K Cameron U or Shaffer SL ram stacks. Lower-cost lighter-duty option than the 10K equivalent.',
    applications: [
      'Workover BOP stack on shallow / mature 11" 5K wellheads',
      'Bahrain / Iraq south / Oman heavy-oil workovers',
      'KOC mature-field intervention',
      'Shallow infill drilling at 5K WP',
    ],
    oemKeywords: ['Hydril GK 11" 5K', 'Cameron D 11" 5K', 'Shaffer Spherical 11" 5K'],
    leadTimeDays: 60,
  },
  {
    sku: 'IH-BOP-AN-1834-10K-T20-INDUS',
    title: 'Subsea Annular BOP, Hydril GX Style, 18-3/4" 10,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-annular',
    bopType: 'Annular BOP',
    bore: '18-3/4"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 18-3/4" 10K flanged top × flanged bottom — for subsea LMRP / LRP integration',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Hydril GX 18-3/4" 10K (genuine), Cameron 18-3/4" 10K subsea annular, Shaffer 18-3/4" 10K — for LMRP integration on subsea stacks',
    weightKg: 14500,
    closingTimeSeconds: 45,
    oneLiner:
      'Hydril GX style subsea annular BOP, 18-3/4" 10,000 psi cold working pressure, sour-service (NACE MR0175). Lower Marine Riser Package (LMRP) annular for jack-up and platform offshore drilling on ADNOC, Aramco offshore.',
    designNote:
      'The 18-3/4" 10K subsea annular is the LMRP-mounted annular on offshore stacks — heavy GX-style spherical packer with hydraulic-piston actuation suited to subsea remote operation. Tier 2 / offshore item — large per-unit value, RFQ-driven volume.',
    applications: [
      'Subsea LMRP annular for jack-up and platform offshore drilling',
      'ADNOC offshore — Lower Zakum, Upper Zakum, Hail & Ghasha satellite jack-ups',
      'Saudi Aramco offshore — Marjan, Safaniyah expansion campaigns',
      'New-build offshore stack-ups for the GCC offshore drilling fleet',
    ],
    oemKeywords: ['Hydril GX 18-3/4" 10K', 'Cameron LMRP annular 18-3/4" 10K', 'Shaffer subsea annular 18-3/4" 10K'],
    leadTimeDays: 180,
  },

  // ── Ram BOPs (8) ────────────────────────────────────────────────────────
  {
    sku: 'IH-BOP-RAM-13-58-10K-DBL-T20-INDUS',
    title: 'Ram BOP, Cameron U Style, 13-5/8" 10,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 13-5/8" 10K studded top × flanged bottom; both flanged on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron U 13-5/8" 10K (genuine), Shaffer LWS 13-5/8" 10K, Hydril V 13-5/8" 10K — bonnet / ram block interchangeable per OEM dimensional standard',
    weightKg: 8900,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron U style double ram BOP, 13-5/8" 10,000 psi cold working pressure, sour-service (NACE MR0175). The mainstream development ram BOP across Saudi Aramco, ADNOC, KOC, PDO land drilling — supplied empty or with pipe + blind-shear ram blocks.',
    designNote:
      'The 13-5/8" 10K Cameron-U-style double ram is the GCC land-drilling workhorse — sits below the 13-5/8" 10K annular and above the wellhead. Two cavities accept any pipe-ram + blind-shear / pipe-ram + pipe-ram combination. Sour-service trim, HNBR / AFLAS elastomers.',
    applications: [
      'Mainstream onshore development drilling — Aramco Ghawar / Khurais / Hawiyah / Haradh',
      'KOC North Kuwait Jurassic and South Kuwait development',
      'PDO heavy-oil and sour-gas land programmes',
      'ADNOC Bab / Asab / Bu Hasa onshore sour-service drilling',
      'Iraq south Majnoon / West Qurna / Rumaila drilling',
    ],
    oemKeywords: ['Cameron U 13-5/8" 10K', 'Shaffer LWS 13-5/8" 10K', 'Hydril V 13-5/8" 10K', 'NOV Pressure Control 13-5/8" 10K'],
    leadTimeDays: 120,
  },
  {
    sku: 'IH-BOP-RAM-11-10K-DBL-T20-INDUS',
    title: 'Ram BOP, Cameron U Style, 11" 10,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 11" 10K studded top × flanged bottom; both studded on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron U 11" 10K (genuine), Shaffer SL 11" 10K, Hydril V 11" 10K, NOV Pressure Control 11" 10K',
    weightKg: 6700,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron U style double ram BOP, 11" 10,000 psi cold working pressure, sour-service (NACE MR0175). The workover and slim-hole ram BOP for sour-service infill drilling across the GCC.',
    designNote:
      'The 11" 10K Cameron-U-style double ram is the slim-hole / workover ram BOP — paired with the 11" 10K annular for completion, workover, and sour-service infill drilling. Two cavities: typical config is pipe ram (for 5" or 5-1/2" DP) + blind-shear ram.',
    applications: [
      'Workover ram BOP on 11" 10K wellheads',
      'Slim-hole infill drilling — Aramco / KOC / ADNOC mature fields',
      'Sour-service workover and well intervention',
      'Pre-completion drilling on narrower programmes',
    ],
    oemKeywords: ['Cameron U 11" 10K', 'Shaffer SL 11" 10K', 'Hydril V 11" 10K'],
    leadTimeDays: 100,
  },
  {
    sku: 'IH-BOP-RAM-11-5K-DBL-T20-INDUS',
    title: 'Ram BOP, Cameron U Style, 11" 5,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '11"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 11" 5K studded top × studded bottom',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron U 11" 5K (genuine), Shaffer SL 11" 5K, Hydril V 11" 5K — interchangeable on shallow / mature workover stacks',
    weightKg: 5400,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron U style double ram BOP, 11" 5,000 psi cold working pressure, sour-service (NACE MR0175). The shallow / mature-field workover ram BOP for Bahrain, Iraq south, Oman, KOC.',
    designNote:
      'The 11" 5K Cameron-U-style double ram is the lower-pressure workover ram for shallow / mature wells. Lower-cost lighter-duty option to the 10K — but still sour-service trim by default for the GCC.',
    applications: [
      'Workover ram BOP on shallow / mature 11" 5K wellheads',
      'Bahrain / Iraq south / Oman heavy-oil workovers',
      'KOC mature-field intervention',
      'Shallow infill drilling at 5K WP',
    ],
    oemKeywords: ['Cameron U 11" 5K', 'Shaffer SL 11" 5K', 'Hydril V 11" 5K'],
    leadTimeDays: 75,
  },
  {
    sku: 'IH-BOP-RAM-13-58-5K-DBL-T20-INDUS',
    title: 'Ram BOP, Cameron U Style, 13-5/8" 5,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '13-5/8"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 13-5/8" 5K studded top × studded bottom',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron U 13-5/8" 5K (genuine), Shaffer LWS 13-5/8" 5K, Hydril V 13-5/8" 5K',
    weightKg: 7200,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron U style double ram BOP, 13-5/8" 5,000 psi cold working pressure, sour-service (NACE MR0175). Shallower onshore land-drilling ram BOP for Oman heavy-oil, Bahrain mature fields, Iraq southern oilfields.',
    designNote:
      'The 13-5/8" 5K Cameron-U-style double ram is the shallower-pressure variant of the regional workhorse — used where 5K WP is sufficient (mature fields, shallow oil). Same dimensional envelope as the 10K version, lighter wall.',
    applications: [
      'Shallower onshore drilling — Oman heavy-oil',
      'Bahrain mature fields',
      'Iraq southern oilfields where 5K WP suffices',
      '5K-rated workover and shallow development drilling',
    ],
    oemKeywords: ['Cameron U 13-5/8" 5K', 'Shaffer LWS 13-5/8" 5K', 'Hydril V 13-5/8" 5K'],
    leadTimeDays: 90,
  },
  {
    sku: 'IH-BOP-RAM-7-5K-DBL-T20-INDUS',
    title: 'Workover Ram BOP, Cameron T-81 Style, 7-1/16" 5,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '7-1/16"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 7-1/16" 5K studded top × studded bottom; flanged on request',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron T-81 / T-82 7-1/16" 5K (genuine), Shaffer SL 7-1/16" 5K — small-bore workover compact design',
    weightKg: 1800,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron T-81 style small-bore double ram BOP, 7-1/16" 5,000 psi WP, sour-service (NACE MR0175). The workover / snubbing prep ram BOP for Aramco / ADNOC well intervention campaigns — extremely high deployment volume.',
    designNote:
      'The 7-1/16" 5K Cameron-T-style small-bore ram is the workover and well-intervention workhorse — compact design, light enough for crane-deployed workover stacks. Sour-service trim is the GCC default for intervention on producing wells.',
    applications: [
      'Workover BOP stack on production wellheads',
      'Snubbing prep on mature wells',
      'Well intervention through-tubing operations',
      'Aramco / ADNOC / KOC / PDO workover campaigns',
    ],
    oemKeywords: ['Cameron T-81 7-1/16" 5K', 'Cameron T-82 7-1/16" 5K', 'Shaffer SL 7-1/16" 5K', 'Jereh 7-1/16" 5K'],
    leadTimeDays: 60,
  },
  {
    sku: 'IH-BOP-RAM-7-3K-DBL-T20-INDUS',
    title: 'Workover Ram BOP, Cameron T-81 Style, 7-1/16" 3,000 psi WP, Double Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '7-1/16"',
    workingPressurePsi: 3000,
    pressureClass: '3K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Double',
    endConnection: 'API 6A 7-1/16" 3K studded top × studded bottom',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron T-81 / T-82 7-1/16" 3K (genuine), Shaffer SL 7-1/16" 3K',
    weightKg: 1400,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron T-81 style small-bore double ram BOP, 7-1/16" 3,000 psi WP, sour-service (NACE MR0175). Lower-pressure workover stack for shallow-tubing well intervention.',
    designNote:
      'The 7-1/16" 3K Cameron-T-style small-bore ram is the lighter-duty workover / intervention BOP for shallower-pressure tubing strings. Same dimensional envelope as the 5K version, lighter wall.',
    applications: [
      'Workover BOP stack on shallow-tubing wellheads',
      'Through-tubing well intervention at 3K WP',
      'PDO heavy-oil workover',
      'Bahrain / Iraq south / Oman shallow tubing operations',
    ],
    oemKeywords: ['Cameron T-81 7-1/16" 3K', 'Shaffer SL 7-1/16" 3K'],
    leadTimeDays: 45,
  },
  {
    sku: 'IH-BOP-RAM-13-58-15K-DBL-HPHT-INDUS',
    title: 'Ram BOP, Cameron UII Style, 13-5/8" 15,000 psi WP, Double Cavity, HPHT + Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Double)',
    bore: '13-5/8"',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'HPHT + Sour',
    ramConfig: 'Double',
    endConnection: 'API 6A 13-5/8" 15K flanged top × flanged bottom; SBMS / SH-style mating per stack programme',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: HPHT_TEMP,
    oemCompatibility: 'Cameron UII 13-5/8" 15K (genuine), Shaffer NXT-15K 13-5/8", Hydril V 13-5/8" 15K — HPHT-trim equivalents',
    weightKg: 12500,
    closingTimeSeconds: 30,
    oneLiner:
      'Cameron UII style HPHT double ram BOP, 13-5/8" 15,000 psi WP, sour-service (NACE MR0175). Required for ultra-sour Hail & Ghasha (ADNOC), Jafurah unconventional gas (Aramco), Khazzan / Ghazeer tight gas (Oman).',
    designNote:
      'The 13-5/8" 15K HPHT ram BOP is the high-end of the regional ram fleet — required for ultra-sour HPHT plays where 10K WP is insufficient. Sour-service NACE MR0175 trim throughout, HPHT temperature qualification, larger-cylinder operating piston.',
    applications: [
      'ADNOC Hail & Ghasha ultra-sour gas drilling (H₂S up to 30%)',
      'Aramco Jafurah unconventional sour gas',
      'Oman Khazzan / Ghazeer tight gas',
      'Saudi Khuff gas at 15K WP',
      'Iraq deep-gas exploratory drilling',
    ],
    oemKeywords: ['Cameron UII 13-5/8" 15K', 'Shaffer NXT-15K 13-5/8"', 'Hydril V 13-5/8" 15K'],
    leadTimeDays: 180,
  },
  {
    sku: 'IH-BOP-RAM-1834-15K-TRP-T20-INDUS',
    title: 'Subsea Ram BOP, Cameron TL Style, 18-3/4" 15,000 psi WP, Triple Cavity, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Ram BOP (Triple)',
    bore: '18-3/4"',
    workingPressurePsi: 15000,
    pressureClass: '15K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Triple',
    endConnection: 'API 6A 18-3/4" 15K mandrel hub top × mandrel hub bottom; subsea wellhead connector compatible',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron TL 18-3/4" 15K (genuine), Shaffer NXT-15K subsea 18-3/4", NOV Pressure Control subsea 18-3/4" 15K',
    weightKg: 42000,
    closingTimeSeconds: 45,
    oneLiner:
      'Cameron TL style triple-cavity subsea ram BOP, 18-3/4" 15,000 psi WP, sour-service (NACE MR0175). Subsea stack lower section for offshore ADNOC (Lower Zakum, Hail & Ghasha satellites) and Aramco offshore (Marjan, Safaniyah).',
    designNote:
      'The 18-3/4" 15K subsea triple ram is the subsea-stack lower section — three cavities (typical: pipe ram + pipe ram + blind-shear ram) sit below the LMRP annular. Six-figure-USD line item; long-lead build-to-order.',
    applications: [
      'Subsea stack lower section on jack-up and platform offshore drilling',
      'ADNOC offshore — Lower Zakum, Upper Zakum, Hail & Ghasha satellite jack-ups',
      'Saudi Aramco offshore — Marjan, Safaniyah',
      'New-build subsea stacks for the GCC offshore drilling fleet',
    ],
    oemKeywords: ['Cameron TL 18-3/4" 15K', 'Shaffer NXT-15K subsea', 'NOV Pressure Control subsea 18-3/4" 15K'],
    leadTimeDays: 240,
  },

  // ── Specialty BOPs (3) ──────────────────────────────────────────────────
  {
    sku: 'IH-BOP-CT-QUAD-5-10K-T20-INDUS',
    title: 'Coiled Tubing Quad BOP, 5-1/8" 10,000 psi WP, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Coiled Tubing Quad BOP',
    bore: '5-1/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Quadruple',
    endConnection: 'API 6A 5-1/8" 10K studded top × flanged bottom; CT-stripper integration on top connection',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron CT 5-1/8" 10K Quad, NOV CT Quad 5-1/8" 10K, Hydril CT 5-1/8" 10K Quad — standard four-ram CT stack arrangement (blind, shear, slip, pipe)',
    weightKg: 3200,
    closingTimeSeconds: 30,
    oneLiner:
      'Coiled tubing Quad BOP, 5-1/8" 10,000 psi WP, sour-service (NACE MR0175). Four-cavity CT pressure-control stack (blind / shear / slip / pipe) for CT stimulation, CT cleanout, CT logging across Aramco / ADNOC / KOC.',
    designNote:
      'The 5-1/8" 10K CT Quad BOP carries four ram cavities in a single body — typically arranged as blind ram (top), shear ram, slip ram, pipe ram (bottom). Coupled below the CT injector head and above the wellhead riser. Driven by ADNOC / Aramco / QatarEnergy CT campaigns post-2021.',
    applications: [
      'Coiled tubing stimulation (acid, fracturing, scale removal)',
      'CT cleanout and milling on producing wells',
      'CT logging and intervention',
      'Aramco / ADNOC / KOC CT well intervention campaigns',
    ],
    oemKeywords: ['Cameron CT 5-1/8" 10K Quad', 'NOV CT Quad 5-1/8" 10K', 'Hydril CT 5-1/8" 10K Quad', 'Jereh CT Quad 5-1/8" 10K'],
    leadTimeDays: 90,
  },
  {
    sku: 'IH-BOP-SNUB-7-10K-T20-INDUS',
    title: 'Snubbing BOP Stack, 7-1/16" 10,000 psi WP with Stripper Rams, Sour Service (NACE MR0175)',
    categorySlug: 'bop-ram',
    bopType: 'Snubbing BOP Stack',
    bore: '7-1/16"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    ramConfig: 'Quadruple',
    endConnection: 'API 6A 7-1/16" 10K studded top × flanged bottom; snubbing-jack integration on top connection',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron snubbing 7-1/16" 10K, Hydril snubbing stack 7-1/16" 10K, Otis snubbing BOP 7-1/16" 10K — four-ram snubbing arrangement (upper stripper, lower stripper, safety, pipe)',
    weightKg: 4500,
    closingTimeSeconds: 30,
    oneLiner:
      'Snubbing BOP stack, 7-1/16" 10,000 psi WP, sour-service (NACE MR0175), with upper and lower stripper rams. For under-pressure snubbing operations on producing wells across the GCC.',
    designNote:
      'The 7-1/16" 10K snubbing BOP stack carries four cavities in a stacked arrangement: upper stripper, lower stripper, safety ram, pipe ram. Stripper rams allow tubing / drill pipe to be moved through under wellhead pressure. Tier 2 — limited fleet but recurring RFQs.',
    applications: [
      'Under-pressure snubbing operations on producing wells',
      'Underground-blowout remediation jobs',
      'Live-well workover and intervention',
      'Specialist well-intervention contractor scope (Halliburton, SLB, Expro, Cansco, Axis)',
    ],
    oemKeywords: ['Cameron snubbing 7-1/16" 10K', 'Hydril snubbing 7-1/16" 10K', 'Otis snubbing BOP'],
    leadTimeDays: 120,
  },
  {
    sku: 'IH-BOP-RCD-5K-MPD-INDUS',
    title: 'Rotating Control Device (RCD), 5,000 psi Class, Sour Service (NACE MR0175) — MPD Stack',
    categorySlug: 'bop-ram',
    bopType: 'Rotating Control Device',
    bore: '11"',
    workingPressurePsi: 5000,
    pressureClass: '5K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 11" 5K studded top × flanged bottom; passive (rotating) seal on drill string',
    material: SOUR_MAT,
    apiMonogram: '16A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Weatherford SafeShield / SeaShield 5M, SLB RCD-3, NOV ReedHycalog RCD 5K — interchangeable on managed-pressure-drilling (MPD) stacks',
    weightKg: 2200,
    oneLiner:
      'Rotating Control Device (RCD), 5,000 psi class, sour-service (NACE MR0175). Managed-pressure-drilling (MPD) seal element for tight-gas, depleted-reservoir, and HPHT applications on Jafurah and Oman tight-gas plays.',
    designNote:
      'The 5K-class RCD is a passive (rotating) seal that diverts annular returns through a closed flow path while drilling — enabling managed-pressure drilling (MPD) on narrow-margin wells. Replaceable seal element (rubber + bearings) is the consumable; small installed base, big-ticket per unit.',
    applications: [
      'Managed-pressure drilling (MPD) on narrow-margin wells',
      'Aramco Jafurah unconventional sour gas',
      'Oman Khazzan / Ghazeer tight gas',
      'Depleted-reservoir infill drilling',
      'Underbalanced drilling on producing reservoirs',
    ],
    oemKeywords: ['Weatherford SafeShield 5M', 'Weatherford SeaShield 5M', 'SLB RCD-3', 'NOV RCD 5K'],
    leadTimeDays: 120,
  },

  // ── Diverter (1) ────────────────────────────────────────────────────────
  {
    sku: 'IH-BOP-DIV-2114-2K-INDUS',
    title: 'Top-Hole Diverter System, 21-1/4" 2,000 psi WP, HMH KFDJ Style — Offshore Shallow Gas',
    categorySlug: 'bop-diverters',
    bopType: 'Diverter System',
    bore: '21-1/4"',
    workingPressurePsi: 2000,
    pressureClass: '2K',
    serviceClass: 'Standard',
    endConnection: 'API 6A 21-1/4" 2K flanged top × flanged bottom; integral overboard / diverter line on side outlets',
    material: STD_MAT,
    apiMonogram: '16A',
    temperatureRating: STD_TEMP,
    oemCompatibility: 'HMH KFDJ 21-1/4" 2K, HMH KFDS-FS, Cameron diverter 21-1/4" 2K, Shaffer diverter 21-1/4" 2K — interchangeable on offshore jack-up / platform top-hole stacks',
    weightKg: 7800,
    closingTimeSeconds: 30,
    oneLiner:
      'HMH KFDJ style top-hole diverter system, 21-1/4" 2,000 psi WP. Mandatory shallow-gas protection on offshore jack-up and platform drilling top-hole sections — ADNOC offshore, Saudi Aramco offshore, equivalent GCC fields.',
    designNote:
      'The 21-1/4" 2K diverter sits at the top of the offshore stack during top-hole / surface-casing drilling — diverts uncontrolled shallow-gas flow overboard rather than letting it reach the rig floor. Mandatory on offshore drilling through gas-charged shallow sands. Tier 2 — offshore-only, lower volume but high per-unit value.',
    applications: [
      'Offshore jack-up top-hole drilling through shallow gas',
      'Platform drilling on ADNOC offshore (Lower Zakum, Upper Zakum)',
      'Saudi Aramco offshore (Marjan, Safaniyah, Manifa) top-hole sections',
      'New-build offshore-rig diverter retrofits',
    ],
    oemKeywords: ['HMH KFDJ 21-1/4" 2K', 'HMH KFDS-FS 21-1/4" 2K', 'Cameron diverter 21-1/4" 2K'],
    leadTimeDays: 150,
  },

  // ── Control Unit (1) ────────────────────────────────────────────────────
  {
    sku: 'IH-BOP-CTRL-K80-11STN-INDUS',
    title: 'BOP Control Unit / Accumulator, Koomey Type 80, 11-Station, ~80 gal Usable, API 16D',
    categorySlug: 'bop-control-units',
    bopType: 'BOP Control Unit / Accumulator',
    bore: 'N/A',
    workingPressurePsi: 3000,
    pressureClass: 'N/A',
    serviceClass: 'Standard',
    endConnection: '1" NPT closing / opening hydraulic outlets per station; pilot air-hydraulic backup',
    material: 'Skid-mounted carbon-steel frame; hydraulic reservoir 304 SS lined; SPM-style station valves',
    apiMonogram: '16D',
    temperatureRating: STD_TEMP,
    oemCompatibility: 'Koomey Type 80 (Cameron lineage), NOV Pressure Control Type 80, Pacseal Type 80, Jereh Type 80 — interchangeable on standard land-rig BOP control hookup',
    weightKg: 2800,
    accumulatorGal: 80,
    stationCount: 11,
    closingTimeSeconds: 30,
    oneLiner:
      'Koomey Type 80 BOP control unit / accumulator, 11-station, ~80 gal usable accumulator volume, API 16D. Sold with virtually every land-rig BOP stack — the GCC default closing unit.',
    designNote:
      'The Koomey Type 80 is the standard land-rig BOP control unit — air-hydraulic pump, electric pump backup, ~80 gal usable nitrogen-precharged accumulator, 11 SPM-style station valves for closing / opening BOP rams + annular + diverter. API 16D-compliant build with 5-year recert programme.',
    applications: [
      'Standard land-rig BOP control hookup (Aramco, ADNOC, KOC, PDO, BAPCO, Iraq south)',
      'Workover-rig BOP control unit',
      'Mobile pressure-control unit',
      'Replacement / upgrade for end-of-life Koomey or Pacseal units',
    ],
    oemKeywords: ['Koomey Type 80', 'NOV Pressure Control Type 80', 'Pacseal Type 80', 'Jereh Type 80'],
    leadTimeDays: 75,
  },

  // ── Choke & Kill Manifold (1) ──────────────────────────────────────────
  {
    sku: 'IH-BOP-CK-3116-10K-T20-INDUS',
    title: 'Choke & Kill Manifold, 3-1/16" 10,000 psi WP, API 16C, Sour Service (NACE MR0175)',
    categorySlug: 'bop-choke-kill',
    bopType: 'Choke & Kill Manifold',
    bore: '3-1/16"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 3-1/16" 10K flanged inlet × flanged choke / kill outlets; gate-valve isolation per leg',
    material: SOUR_MAT,
    apiMonogram: '16C',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron 3-1/16" 10K choke manifold, NOV 3-1/16" 10K choke manifold, McEvoy / Wood Group choke manifolds — sour-service trim per Aramco / ADNOC default',
    weightKg: 3500,
    oneLiner:
      'Choke & kill manifold, 3-1/16" 10,000 psi WP, API 16C, sour-service (NACE MR0175). Pairs with 13-5/8" 10K BOP stacks across Aramco / ADNOC / KOC mainstream development drilling.',
    designNote:
      'The 3-1/16" 10K choke & kill manifold sits adjacent to the BOP stack — gate-valve isolated, with at least one hydraulic choke + one manual choke per Aramco / API STD 53 spec. Sour-service trim throughout (Inconel-clad seats + gate, B7M studs).',
    applications: [
      'Choke & kill manifold for 10K BOP stacks',
      'Mainstream development drilling — Aramco, ADNOC, KOC, PDO',
      'Sour-service drilling (default trim)',
      'Workover and well-intervention manifolds',
    ],
    oemKeywords: ['Cameron 3-1/16" 10K choke manifold', 'NOV 3-1/16" 10K choke manifold', 'McEvoy choke manifold', 'Wood Group choke manifold'],
    leadTimeDays: 100,
  },

  // ── Spools / DSAs / Adapter Flanges (3) ────────────────────────────────
  {
    sku: 'IH-BOP-SPOOL-13-58-10K-T20-INDUS',
    title: 'Drilling Spool, 13-5/8" 10K × 13-5/8" 10K, API 6A, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spools-adapters',
    bopType: 'Drilling Spool',
    bore: '13-5/8"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 13-5/8" 10K flanged top × flanged bottom; with two 3-1/16" 10K flanged side outlets for choke & kill connection',
    material: SOUR_MAT,
    apiMonogram: '6A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron drilling spool 13-5/8" 10K, FMC drilling spool 13-5/8" 10K, Stream-Flo drilling spool 13-5/8" 10K — interchangeable on standard surface stack-ups',
    weightKg: 1800,
    oneLiner:
      'Drilling spool, 13-5/8" 10K × 13-5/8" 10K, API 6A, sour-service (NACE MR0175). The choke & kill connection spool that sits between the BOP stack and the wellhead — included on every 13-5/8" 10K stack.',
    designNote:
      'The drilling spool is the choke-and-kill connection point — sits below the bottom ram and above the wellhead, with two 3-1/16" 10K side outlets for choke & kill manifold connection. Required on every 13-5/8" 10K BOP stack.',
    applications: [
      'BOP stack choke & kill connection on 13-5/8" 10K wells',
      'Aramco / ADNOC / KOC mainstream development drilling',
      'Sour-service drilling (default trim)',
      'Replacement / upgrade for end-of-life drilling spools',
    ],
    oemKeywords: ['Cameron drilling spool 13-5/8" 10K', 'FMC drilling spool 13-5/8" 10K', 'Stream-Flo drilling spool 13-5/8" 10K'],
    leadTimeDays: 75,
  },
  {
    sku: 'IH-BOP-DSA-13-58-10K-11-10K-INDUS',
    title: 'Double Studded Adapter (DSA), 13-5/8" 10K × 11" 10K, API 6A, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spools-adapters',
    bopType: 'Double Studded Adapter (DSA)',
    bore: '11"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 13-5/8" 10K studded top × 11" 10K studded bottom; double studded adapter design',
    material: SOUR_MAT,
    apiMonogram: '6A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron DSA 13-5/8" 10K × 11" 10K, FMC DSA, Stream-Flo DSA — standard wellhead-to-BOP crossover',
    weightKg: 950,
    oneLiner:
      'Double studded adapter (DSA), 13-5/8" 10K × 11" 10K, API 6A, sour-service (NACE MR0175). Crossover between an 11" 10K wellhead and a 13-5/8" 10K BOP stack — common workover configuration.',
    designNote:
      'The 13-5/8" 10K × 11" 10K DSA adapts a 13-5/8" 10K BOP stack down to an 11" 10K wellhead — typical workover-on-development-wellhead arrangement. Two studded faces, no flange face — saves vertical height vs a spool.',
    applications: [
      'Workover stack adaptation to 11" 10K wellhead',
      'Mixed-class stack-ups on infill drilling',
      'Aramco / ADNOC / KOC workover campaigns',
      'Pre-completion stack adaptation',
    ],
    oemKeywords: ['Cameron DSA 13-5/8" 10K × 11" 10K', 'FMC DSA', 'Stream-Flo DSA'],
    leadTimeDays: 60,
  },
  {
    sku: 'IH-BOP-XOVER-11-10K-7-10K-INDUS',
    title: 'Adapter Flange / Crossover, 11" 10K × 7-1/16" 10K, API 6A, Sour Service (NACE MR0175)',
    categorySlug: 'bop-spools-adapters',
    bopType: 'Adapter Flange / Crossover',
    bore: '7-1/16"',
    workingPressurePsi: 10000,
    pressureClass: '10K',
    serviceClass: 'Sour Service (NACE MR0175)',
    endConnection: 'API 6A 11" 10K flanged top × 7-1/16" 10K flanged bottom; adapter-flange crossover design',
    material: SOUR_MAT,
    apiMonogram: '6A',
    temperatureRating: SOUR_TEMP,
    oemCompatibility: 'Cameron adapter flange 11" × 7-1/16" 10K, FMC adapter flange — standard workover stack-to-wellhead crossover',
    weightKg: 580,
    oneLiner:
      'Adapter flange / crossover, 11" 10K × 7-1/16" 10K, API 6A, sour-service (NACE MR0175). Crossover between an 11" 10K BOP stack and a 7-1/16" 10K production wellhead — workover configuration.',
    designNote:
      'The 11" 10K × 7-1/16" 10K adapter-flange crossover adapts an 11" workover BOP stack down to a 7-1/16" production wellhead. Single-piece flanged crossover — no studs, just bolted flanges with two BX gaskets.',
    applications: [
      'Workover BOP stack to production wellhead crossover',
      'Aramco / ADNOC / KOC workover campaigns on producing wells',
      'Through-tubing intervention stack-ups',
      'Snubbing prep on production wellheads',
    ],
    oemKeywords: ['Cameron adapter flange 11" × 7-1/16" 10K', 'FMC adapter flange'],
    leadTimeDays: 45,
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-11-bop-equipment',
    description:
      'Stands up the BOP catalogue tree — adds Hydril & Shaffer brands, 1 top-level + 9 sub-categories, 3 spec templates (bop-equipment-spec, bop-spares-spec, bop-service-spec), creates a new "Blowout Preventer" megamenu column with 3 sub-sections, and seeds 17 Tier 1 + Tier 2 equipment SKUs (annulars, rams, CT/snubbing/RCD, diverter, koomey, choke/kill, spools).',
  },

  brands: BRANDS,

  categories: [TOP_CAT, ...SUB_CATS],

  specTemplates: [BOP_EQUIPMENT_SPEC, BOP_SPARES_SPEC, BOP_SERVICE_SPEC],

  navigation: NAV_CONFIGS,

  products: PRODUCTS.map(makeEquipmentProduct),
}

export default batch
