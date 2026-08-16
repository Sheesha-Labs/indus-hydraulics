/**
 * Industry seed data — extracted from the previously hardcoded
 * INDUSTRIES maps in apps/web/src/app/industries/*. Lives in a
 * separate module so seed.ts stays readable and so a future content
 * editor can extend the list without scrolling through pump SKUs.
 *
 * Idempotent: every entry has a stable `slug` used as the upsert key.
 * Re-running the seed updates the row in place (no duplicates).
 */

import type { PrismaClient } from '@prisma/client'

type CaseStudySeed = {
  tag: string
  title: string
  description: string
  year: string | null
  position: number
}

type DeliveryArea = {
  category: string
  title: string
  description: string
  skuCount: string
}

type Stat = { value: string; label: string }

type SupportBlock = {
  eyebrow: string
  headline: string
  description: string
  bullets: string[]
  cta: string
}

type IndustrySeed = {
  slug: string
  name: string
  description: string
  tagline: string
  headline: string
  breadcrumb: string
  gradient: string
  position: number
  chips: string[]
  stats: Stat[]
  deliveryAreas: DeliveryArea[]
  supportBlock: SupportBlock
  featuredCategorySlugs: string[]
  caseStudies: CaseStudySeed[]
}

export const INDUSTRY_SEED: IndustrySeed[] = [
  {
    slug: 'oil-gas',
    name: 'Oil & Gas',
    description:
      'API-rated, ATEX-certified and NACE-compliant components for wellhead controls, BOP systems, pipeline pump stations and refinery process control valves.',
    tagline: 'UPSTREAM · MIDSTREAM · DOWNSTREAM',
    breadcrumb: 'OIL & GAS',
    headline:
      'Hydraulics for wells, pipelines and refineries — where downtime is never an option.',
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 1,
    chips: ['API 6A / 16A RATED', 'ATEX / IECEx', 'NACE MR0175', 'H₂S TRIM'],
    stats: [
      { value: '220+', label: 'OIL & GAS CUSTOMERS' },
      { value: '18', label: 'YRS · UPSTREAM FOCUS' },
      { value: '48h', label: 'EMERGENCY DELIVERY' },
      { value: '24/7', label: 'PLANT-DOWN SUPPORT' },
    ],
    deliveryAreas: [
      { category: 'WELLHEAD & BOP', title: 'Blowout preventer controls', description: 'Accumulators, shuttle valves, kill manifold components. API 16A-compliant.', skuCount: '78 SKUs' },
      { category: 'PIPELINE', title: 'Pump station hydraulics', description: 'Axial piston pumps, proportional valves, HPUs for mainline and booster stations.', skuCount: '94 SKUs' },
      { category: 'REFINERY', title: 'Process valve actuators', description: 'Rack-and-pinion and scotch-yoke actuators, NAMUR solenoids, positioners.', skuCount: '112 SKUs' },
      { category: 'OFFSHORE', title: 'Subsea & riser systems', description: 'High-pressure cylinders, seawater-compatible seals, ROV-interface components.', skuCount: '62 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'PLANT-DOWN SUPPORT',
      headline: 'When your process line trips at 02:00, we answer.',
      description:
        'Our oil & gas team maintains pre-staged critical spares and can despatch to wellhead, pipeline station or refinery gate within 48 hours — anywhere in our service network.',
      bullets: [
        'Pre-staged API-rated critical spares',
        'ATEX-certified components from stock',
        'On-site commissioning by certified hydraulic technicians',
        'NACE-compliant materials, certified documentation',
      ],
      cta: 'Request plant-down support →',
    },
    featuredCategorySlugs: ['hydraulic-pumps', 'valves-manifolds', 'cylinders'],
    caseStudies: [
      { tag: 'HPCL · 2024', year: '2024', position: 1, title: 'Mumbai Refinery — HPU overhaul on 14 FCC control valves', description: '14 rotary actuators, 3 HPUs and 220+ solenoid valves replaced during planned shutdown. 9-day turnaround.' },
      { tag: 'ONGC · 2025', year: '2025', position: 2, title: 'BHS Neelam — BOP accumulator recharge', description: 'Emergency replacement of 6 × A10VSO-180 charge pumps on BOP stack. Plant-down response in 36h.' },
      { tag: 'RELIANCE · 2024', year: '2024', position: 3, title: 'Jamnagar DTA — actuator upgrade programme', description: 'Scotch-yoke actuator fleet upgrade: 32 units, HART-enabled positioners, commissioned in 4 weeks.' },
    ],
  },
  {
    slug: 'mining',
    name: 'Mining',
    description:
      'High-cycle, dust-rated components for underground and open-pit mining — from roof-support proportional valves to excavator pump replacements.',
    tagline: 'UNDERGROUND · OPEN PIT · SURFACE',
    breadcrumb: 'MINING',
    headline: 'Heavy-duty hydraulics for roof supports, haul trucks and continuous miners.',
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 2,
    chips: ['HIGH-CYCLE RATED', 'IP67 ENCLOSURES', 'COAL MINE APPROVED', 'CBM CERTIFIED'],
    stats: [
      { value: '85+', label: 'MINING SITES SERVED' },
      { value: '14', label: 'YRS · MINING FOCUS' },
      { value: '72h', label: 'SITE DELIVERY (REMOTE)' },
      { value: '24/7', label: 'PLANT-DOWN LINE' },
    ],
    deliveryAreas: [
      { category: 'UNDERGROUND', title: 'Roof support systems', description: 'Proportional valves, high-pressure cylinders and pumps for powered roof supports.', skuCount: '96 SKUs' },
      { category: 'HAUL TRUCKS', title: 'Steering & hoist', description: 'Replacement hydraulics for Cat, Komatsu and Liebherr haul trucks. Quick-fit hoses.', skuCount: '74 SKUs' },
      { category: 'CONTINUOUS MINERS', title: 'Cutting & conveying', description: 'High-flow pumps and directional valves for Joy, Sandvik and Atlas Copco machines.', skuCount: '58 SKUs' },
      { category: 'SURFACE', title: 'Draglines & shovels', description: 'Large bore cylinders, high-pressure accumulators for P&H, BE and Bucyrus machines.', skuCount: '42 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'REMOTE SITE SUPPORT',
      headline: 'We deliver to pit head and shaft collar — 72 hours, anywhere in our service network.',
      description:
        'Our mining logistics team coordinates airfreight, DG certification and last-mile delivery to the most remote sites. Pre-agreed exchange kits for repeat customers.',
      bullets: [
        'Pre-staged exchange kits by machine type',
        'DG / PESO certified documentation',
        'On-site commissioning support available',
        'Quality certs and test reports standard',
      ],
      cta: 'Request mining support →',
    },
    featuredCategorySlugs: ['hydraulic-pumps', 'cylinders', 'hoses-fittings'],
    caseStudies: [
      { tag: 'COAL INDIA · 2024', year: '2024', position: 1, title: 'Singrauli — 48-unit roof support valve overhaul', description: '48 proportional valves on DBT shield supports replaced during panel setup. Zero unplanned downtime.' },
      { tag: 'VEDANTA · 2024', year: '2024', position: 2, title: 'Lanjigarh — Komatsu 930E haul truck fleet', description: 'Hydraulic pump kits for 12 × Komatsu 930E trucks. Site delivery to Odisha in 72h.' },
      { tag: 'HINDALCO · 2025', year: '2025', position: 3, title: 'Mahan — continuous miner pump replacement', description: 'Joy 14CM15 cutter-head pump failure. Swap unit despatched overnight. Mine back online in 18h.' },
    ],
  },
  {
    slug: 'marine',
    name: 'Marine & Offshore',
    description:
      'Saltwater-rated pumps, IP-rated valves, class-approved cylinders. We supply 64 vessels across the regional fleet — including DG-rated parts for offshore platforms and dredgers.',
    tagline: 'VESSELS · OFFSHORE · DREDGING',
    breadcrumb: 'MARINE & OFFSHORE',
    headline: "Hydraulics that don't quit, when the deck does.",
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 3,
    chips: ['★ DNV · LR · ABS · IRS APPROVED', 'SS316 / DUPLEX OPTIONS', 'IP66 ENCLOSURES', 'ATEX / IECEx ON REQUEST'],
    stats: [
      { value: '64', label: 'VESSELS SUPPLIED' },
      { value: '12', label: 'YRS · MARINE FOCUS' },
      { value: '4', label: 'CLASS APPROVALS' },
      { value: '24/7', label: 'PORT-CALL SUPPORT' },
    ],
    deliveryAreas: [
      { category: 'DECK MACHINERY', title: 'Winches & cranes', description: 'Anchor winches, mooring drums, davit hydraulics. Salt-mist tested.', skuCount: '86 SKUs' },
      { category: 'STEERING & CONTROL', title: 'Rudder hydraulics', description: 'Ram steering gear, follow-up controls. Class-approved cylinders.', skuCount: '42 SKUs' },
      { category: 'CARGO HANDLING', title: 'Hatch covers, ramps', description: 'Tween-deck cylinders, ramp drives, tank-cleaning power packs.', skuCount: '58 SKUs' },
      { category: 'OFFSHORE & DREDGING', title: 'Subsea & dredge', description: 'Cutter drives, jet pumps, ROV-spec valves with deepwater seals.', skuCount: '38 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'PORT-CALL SUPPORT',
      headline: 'When your vessel calls Jebel Ali, Mumbai or our partner ports — we come aboard.',
      description:
        'Our marine team carries authorised spares for the major brands and can be dockside within 4 hours of port arrival. Survey, swap, certificate-handed-over — before you sail.',
      bullets: [
        'Pre-arrival parts staged from your spares list',
        'DG / customs documentation handled',
        'On-board commissioning by certified hydraulic technicians',
        'Class-approved test certificates issued same-day',
      ],
      cta: 'Request marine support →',
    },
    featuredCategorySlugs: ['hydraulic-pumps', 'valves-manifolds', 'cylinders'],
    caseStudies: [
      { tag: 'SHIPPING CORP · 2024', year: '2024', position: 1, title: 'VLGC Bhuvan — full hydraulics retrofit', description: '22 cylinders, 4 power packs, 180+ valves replaced during dry-dock at Cochin Shipyard. 11-day turnaround.' },
      { tag: 'GREATSHIP · 2025', year: '2025', position: 2, title: 'AHTS Greatship Ahalya — winch upgrade', description: 'Anchor winch hydraulics — duplex SS rams, 350-bar HPU. Commissioned at Mumbai port-stop in 4 days.' },
      { tag: 'DREDGING CORP · 2025', year: '2025', position: 3, title: 'TSHD Aquarius — cutter drive overhaul', description: 'A4VSO 500cc cutter pump rebuild + spare unit kept on-site. Zero downtime for 9-month campaign.' },
    ],
  },
  {
    slug: 'steel',
    name: 'Steel & Metals',
    description:
      'High-force cylinders, servo valves and proportional systems for steel rolling mills, aluminium presses, forging equipment and continuous casting machines.',
    tagline: 'ROLLING MILLS · PRESSES · CASTING',
    breadcrumb: 'STEEL & METALS',
    headline: 'Proportional control for rolling mills, presses and casting lines.',
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 4,
    chips: ['ROLLING MILLS', 'SERVO-HYDRAULIC', 'HIGH-FORCE CYLINDERS', 'HOT-MILL SEALS'],
    stats: [
      { value: '40+', label: 'STEEL PLANTS SERVED' },
      { value: '16', label: 'YRS · METALS FOCUS' },
      { value: '48h', label: 'EMERGENCY DELIVERY' },
      { value: '24/7', label: 'PLANT-DOWN LINE' },
    ],
    deliveryAreas: [
      { category: 'HOT ROLLING', title: 'Roll-gap servo systems', description: 'Moog, Bosch Rexroth and Parker servo valves for AGC systems on hot strip mills.', skuCount: '68 SKUs' },
      { category: 'COLD ROLLING', title: 'Tension & flatness', description: 'Proportional valves, precision cylinders, accumulator banks for tandem mills.', skuCount: '52 SKUs' },
      { category: 'PRESSES', title: 'Forging & stamping', description: 'High-flow pumps, large-bore cylinders, electro-hydraulic press controls.', skuCount: '86 SKUs' },
      { category: 'CONTINUOUS CASTING', title: 'Mold oscillation', description: 'Servo-hydraulic oscillation systems, strand guide cylinders, tundish drives.', skuCount: '44 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'PLANNED MAINTENANCE SUPPORT',
      headline: 'We align with your shutdown windows — kit staged, engineers on-call.',
      description:
        'Our metals team plans with your maintenance scheduler to pre-stage critical spares 48 hours before your rolling schedule shutdown begins.',
      bullets: [
        'Shutdown-aligned pre-staged kits',
        'Servo valve exchange & certification programme',
        'On-site commissioning and tuning support',
        'Mill clearance certificates and traceability records',
      ],
      cta: 'Plan your maintenance support →',
    },
    featuredCategorySlugs: ['cylinders', 'valves-manifolds', 'hydraulic-pumps'],
    caseStudies: [
      { tag: 'TATA STEEL · 2024', year: '2024', position: 1, title: 'Jamshedpur HSM — AGC servo valve overhaul', description: '24 servo valves on the hot strip mill AGC system replaced during annual maintenance. Mill back at 98% efficiency.' },
      { tag: 'JSPL · 2025', year: '2025', position: 2, title: 'Raigarh — continuous caster hydraulics', description: 'Full hydraulic overhaul of 6-strand billet caster: mold oscillation, withdrawal drives, emergency cylinders.' },
      { tag: 'HINDALCO · 2024', year: '2024', position: 3, title: 'Renukoot — foil rolling press', description: 'High-force cylinder replacement on 2,800-tonne foil rolling press. 36h plant-down response.' },
    ],
  },
  {
    slug: 'construction',
    name: 'Construction',
    description:
      'OEM-equivalent and upgraded hydraulic components for construction machinery. Most common excavator and crane pump models in stock at our regional warehouses.',
    tagline: 'EXCAVATORS · CRANES · CONCRETE',
    breadcrumb: 'CONSTRUCTION',
    headline: 'Replacement hydraulics for excavators, cranes and concrete pumps — fast.',
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 5,
    chips: ['OEM REPLACEMENT', 'NEXT-DAY METRO DELIVERY', 'ALL MAJOR BRANDS', 'GENUINE & AFTERMARKET'],
    stats: [
      { value: '300+', label: 'CONSTRUCTION CUSTOMERS' },
      { value: '8', label: 'YRS · CONSTRUCTION FOCUS' },
      { value: '24h', label: 'METRO DELIVERY' },
      { value: '1200+', label: 'EXCAVATOR PUMP SKUS' },
    ],
    deliveryAreas: [
      { category: 'EXCAVATORS', title: 'Main & pilot pumps', description: 'Replacement pumps for Cat, Komatsu, Hitachi, Hyundai, Volvo and Doosan machines.', skuCount: '420 SKUs' },
      { category: 'CRANES', title: 'Slewing & luffing', description: 'Fixed and variable displacement pumps and motors for crawler and truck cranes.', skuCount: '186 SKUs' },
      { category: 'CONCRETE', title: 'Pump & mixer drives', description: 'High-pressure piston pumps, rock valve cylinders, boom hydraulics for truck-mounted pumps.', skuCount: '94 SKUs' },
      { category: 'COMPACTION', title: 'Vibro & roller drives', description: 'Eaton and Bosch orbit motors, charge pumps, drum drive axle drives for compactors.', skuCount: '68 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'SAME-DAY METRO DELIVERY',
      headline: "Pump fails at 06:00 — we're at your site by lunch.",
      description:
        'Same-day delivery on stocked SKUs across our partner metro network. WhatsApp your model number and get a live stock check in minutes.',
      bullets: [
        'Live stock check via WhatsApp in 5 minutes',
        'Same-day delivery in partner metro cities',
        'OEM cross-reference database for all major brands',
        'Exchange programme for large pumps and motors',
      ],
      cta: 'Check availability now →',
    },
    featuredCategorySlugs: ['hydraulic-pumps', 'cylinders', 'hoses-fittings'],
    caseStudies: [
      { tag: 'SHAPOORJI PALLONJI · 2024', year: '2024', position: 1, title: 'Bandra Dharavi — Cat 390 main pump', description: 'Emergency replacement of twin-pump assembly on Cat 390 excavator. Site delivery to Mumbai in 18h.' },
      { tag: 'AFCONS · 2025', year: '2025', position: 2, title: 'Zojila tunnel — Liebherr LTM crane', description: 'Slewing pump kit for LTM 1100-5.2. Altitude delivery to J&K site. 48h turnaround.' },
      { tag: 'PUTZMEISTER · 2024', year: '2024', position: 3, title: 'Pune — PM 47Z boom pump rebuild', description: 'Rock valve cylinder set + piston wear kit for 47-metre boom pump. Scheduled PM support.' },
    ],
  },
  {
    slug: 'power',
    name: 'Power & Energy',
    description:
      'Electrohydraulic governor systems, pitch and yaw actuators for wind, Kaplan blade controls and dam gate operators — for utilities, IPPs and EPC contractors.',
    tagline: 'HYDRO · WIND · THERMAL · DAM GATES',
    breadcrumb: 'POWER & ENERGY',
    headline: 'Precision actuators for hydro turbines, wind pitch systems and dam gates.',
    gradient: 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))',
    position: 6,
    chips: ['IEC 61511 FUNCTIONAL SAFETY', 'TURBINE GOVERNORS', 'PITCH CONTROL', 'REDUNDANT SYSTEMS'],
    stats: [
      { value: '28', label: 'POWER PLANTS SERVED' },
      { value: '10', label: 'YRS · ENERGY FOCUS' },
      { value: '4000 MW', label: 'INSTALLED BASE' },
      { value: '48h', label: 'CRITICAL DELIVERY' },
    ],
    deliveryAreas: [
      { category: 'HYDRO TURBINES', title: 'Governor systems', description: 'Moog and Bosch servo valves for Francis, Kaplan and Pelton governors. Redundant configurations.', skuCount: '52 SKUs' },
      { category: 'WIND ENERGY', title: 'Pitch & yaw systems', description: 'Compact hydraulic pitch cylinders, proportional valves and HPUs for onshore turbines.', skuCount: '38 SKUs' },
      { category: 'DAM GATES', title: 'Gate operators', description: 'High-force cylinders, electro-hydraulic power packs for radial, tainter and flap gates.', skuCount: '44 SKUs' },
      { category: 'THERMAL & GAS', title: 'Steam valve actuators', description: 'High-temperature rack-and-pinion actuators, positioners and solenoids for turbine steam valves.', skuCount: '66 SKUs' },
    ],
    supportBlock: {
      eyebrow: 'OUTAGE SUPPORT',
      headline: 'We plan to your maintenance schedule — and respond when the plan changes.',
      description:
        'Our power team pre-stages governor and pitch components ahead of planned outages. When an unplanned trip occurs, our 24/7 line connects you to a hydraulic engineer in minutes.',
      bullets: [
        'Outage-aligned pre-staged critical spares',
        'IEC 61511 compliant components available',
        'On-site commissioning and testing support',
        'As-built documentation and traceability records',
      ],
      cta: 'Plan your outage support →',
    },
    featuredCategorySlugs: ['valves-manifolds', 'cylinders', 'hydraulic-pumps'],
    caseStudies: [
      { tag: 'NHPC · 2024', year: '2024', position: 1, title: 'Salal hydro — Kaplan runner blade controls', description: '4 units servo valve replacement on Kaplan runner blade controls. Plant back to full capacity in 72h.' },
      { tag: 'NTPC WIND · 2025', year: '2025', position: 2, title: 'Rojmal wind farm — pitch HPU overhaul', description: '12 × pitch HPU systems overhauled during annual maintenance window. Full redundancy restored.' },
      { tag: 'DAMODAR VALLEY · 2024', year: '2024', position: 3, title: 'Panchet dam — radial gate operators', description: '6 radial gate operator cylinder sets replaced. Monsoon-readiness certification met ahead of schedule.' },
    ],
  },
]

export async function seedIndustries(db: PrismaClient): Promise<number> {
  let count = 0
  for (const ind of INDUSTRY_SEED) {
    const data = {
      name: ind.name,
      description: ind.description,
      tagline: ind.tagline,
      headline: ind.headline,
      breadcrumb: ind.breadcrumb,
      gradient: ind.gradient,
      isPublished: true,
      position: ind.position,
      chips: ind.chips,
      stats: ind.stats,
      deliveryAreas: ind.deliveryAreas,
      supportBlock: ind.supportBlock,
      featuredCategorySlugs: ind.featuredCategorySlugs,
      // featuredProductSkus starts empty — editors curate per industry
      // once real product photography lands.
    }
    const industry = await db.industry.upsert({
      where: { slug: ind.slug },
      create: { ...data, slug: ind.slug },
      update: data,
    })
    count++

    // Case studies are seeded only when no rows exist yet for the
    // industry. Once an editor starts curating real customer stories
    // they shouldn't be overwritten by reseed.
    const existing = await db.industryCaseStudy.count({ where: { industryId: industry.id } })
    if (existing === 0) {
      await db.industryCaseStudy.createMany({
        data: ind.caseStudies.map((c) => ({
          industryId: industry.id,
          tag: c.tag,
          title: c.title,
          description: c.description,
          year: c.year,
          position: c.position,
          isPublished: true,
        })),
      })
    }
  }
  return count
}
