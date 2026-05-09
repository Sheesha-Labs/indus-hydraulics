import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { mediaUrl } from '../../../lib/media'

const INDUSTRIES: Record<string, {
  name: string
  breadcrumb: string
  headline: string
  description: string
  chips: string[]
  stats: { value: string; label: string }[]
  gradient: string
  tint: string
  deliveryAreas: { category: string; title: string; description: string; skuCount: string }[]
  refInstalls: { tag: string; title: string; description: string; img: string }[]
  support: { eyebrow: string; headline: string; description: string; bullets: string[]; cta: string }
  categorySlugs: string[]
}> = {
  'oil-gas': {
    name: 'Oil & Gas',
    breadcrumb: 'OIL & GAS',
    headline: 'Hydraulics for wells, pipelines and refineries — where downtime is never an option.',
    description: 'API-rated, ATEX-certified and NACE-compliant components for wellhead controls, BOP systems, pipeline pump stations and refinery process control valves.',
    chips: ['API 6A / 16A RATED', 'ATEX / IECEx', 'NACE MR0175', 'H₂S TRIM'],
    stats: [
      { value: '220+', label: 'OIL & GAS CUSTOMERS' },
      { value: '18', label: 'YRS · UPSTREAM FOCUS' },
      { value: '48h', label: 'EMERGENCY DELIVERY' },
      { value: '24/7', label: 'PLANT-DOWN SUPPORT' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.18 0.04 45),oklch(0.14 0.03 50))',
    tint: 'oklch(0.28 0.04 45)',
    deliveryAreas: [
      { category: 'WELLHEAD & BOP', title: 'Blowout preventer controls', description: 'Accumulators, shuttle valves, kill manifold components. API 16A-compliant.', skuCount: '78 SKUs' },
      { category: 'PIPELINE', title: 'Pump station hydraulics', description: 'Axial piston pumps, proportional valves, HPUs for mainline and booster stations.', skuCount: '94 SKUs' },
      { category: 'REFINERY', title: 'Process valve actuators', description: 'Rack-and-pinion and scotch-yoke actuators, NAMUR solenoids, positioners.', skuCount: '112 SKUs' },
      { category: 'OFFSHORE', title: 'Subsea & riser systems', description: 'High-pressure cylinders, seawater-compatible seals, ROV-interface components.', skuCount: '62 SKUs' },
    ],
    refInstalls: [
      { tag: 'HPCL · 2024', title: 'Mumbai Refinery — HPU overhaul on 14 FCC control valves', description: '14 rotary actuators, 3 HPUs and 220+ solenoid valves replaced during planned shutdown. 9-day turnaround.', img: 'REFINERY HPU' },
      { tag: 'ONGC · 2025', title: 'BHS Neelam — BOP accumulator recharge', description: 'Emergency replacement of 6 × A10VSO-180 charge pumps on BOP stack. Plant-down response in 36h.', img: 'BOP SYSTEM' },
      { tag: 'RELIANCE · 2024', title: 'Jamnagar DTA — actuator upgrade programme', description: 'Scotch-yoke actuator fleet upgrade: 32 units, HART-enabled positioners, commissioned in 4 weeks.', img: 'ACTUATOR BANK' },
    ],
    support: {
      eyebrow: 'PLANT-DOWN SUPPORT',
      headline: 'When your process line trips at 02:00, we answer.',
      description: 'Our oil & gas team maintains pre-staged critical spares and can despatch to wellhead, pipeline station or refinery gate within 48 hours — anywhere in India.',
      bullets: [
        'Pre-staged API-rated critical spares',
        'ATEX-certified components from stock',
        'On-site commissioning by certified hydraulic technicians',
        'NACE-compliant materials, certified documentation',
      ],
      cta: 'Request plant-down support →',
    },
    categorySlugs: ['hydraulic-pumps', 'valves-manifolds', 'cylinders'],
  },

  mining: {
    name: 'Mining',
    breadcrumb: 'MINING',
    headline: 'Heavy-duty hydraulics for roof supports, haul trucks and continuous miners.',
    description: 'High-cycle, dust-rated components for underground and open-pit mining — from roof-support proportional valves to excavator pump replacements.',
    chips: ['HIGH-CYCLE RATED', 'IP67 ENCLOSURES', 'COAL MINE APPROVED', 'CBM CERTIFIED'],
    stats: [
      { value: '85+', label: 'MINING SITES SERVED' },
      { value: '14', label: 'YRS · MINING FOCUS' },
      { value: '72h', label: 'SITE DELIVERY (REMOTE)' },
      { value: '24/7', label: 'PLANT-DOWN LINE' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.2 0.02 80),oklch(0.16 0.015 85))',
    tint: 'oklch(0.3 0.02 80)',
    deliveryAreas: [
      { category: 'UNDERGROUND', title: 'Roof support systems', description: 'Proportional valves, high-pressure cylinders and pumps for powered roof supports.', skuCount: '96 SKUs' },
      { category: 'HAUL TRUCKS', title: 'Steering & hoist', description: 'Replacement hydraulics for Cat, Komatsu and Liebherr haul trucks. Quick-fit hoses.', skuCount: '74 SKUs' },
      { category: 'CONTINUOUS MINERS', title: 'Cutting & conveying', description: 'High-flow pumps and directional valves for Joy, Sandvik and Atlas Copco machines.', skuCount: '58 SKUs' },
      { category: 'SURFACE', title: 'Draglines & shovels', description: 'Large bore cylinders, high-pressure accumulators for P&H, BE and Bucyrus machines.', skuCount: '42 SKUs' },
    ],
    refInstalls: [
      { tag: 'COAL INDIA · 2024', title: 'Singrauli — 48-unit roof support valve overhaul', description: '48 proportional valves on DBT shield supports replaced during panel setup. Zero unplanned downtime.', img: 'ROOF SUPPORT' },
      { tag: 'VEDANTA · 2024', title: 'Lanjigarh — Komatsu 930E haul truck fleet', description: 'Hydraulic pump kits for 12 × Komatsu 930E trucks. Site delivery to Odisha in 72h.', img: 'HAUL TRUCK HPU' },
      { tag: 'HINDALCO · 2025', title: 'Mahan — continuous miner pump replacement', description: 'Joy 14CM15 cutter-head pump failure. Swap unit despatched overnight. Mine back online in 18h.', img: 'CONTINUOUS MINER' },
    ],
    support: {
      eyebrow: 'REMOTE SITE SUPPORT',
      headline: 'We deliver to pit head and shaft collar — 72 hours, anywhere in India.',
      description: 'Our mining logistics team coordinates airfreight, DG certification and last-mile delivery to the most remote sites. Pre-agreed exchange kits for repeat customers.',
      bullets: [
        'Pre-staged exchange kits by machine type',
        'DG / PESO certified documentation',
        'On-site commissioning support available',
        'Quality certs and test reports standard',
      ],
      cta: 'Request mining support →',
    },
    categorySlugs: ['hydraulic-pumps', 'cylinders', 'hoses-fittings'],
  },

  marine: {
    name: 'Marine & Offshore',
    breadcrumb: 'MARINE & OFFSHORE',
    headline: 'Hydraulics that don\'t quit, when the deck does.',
    description: 'Saltwater-rated pumps, IP-rated valves, class-approved cylinders. We supply 64 vessels across the Indian fleet — including DG-rated parts for offshore platforms and dredgers.',
    chips: ['★ DNV · LR · ABS · IRS APPROVED', 'SS316 / DUPLEX OPTIONS', 'IP66 ENCLOSURES', 'ATEX / IECEx ON REQUEST'],
    stats: [
      { value: '64', label: 'VESSELS SUPPLIED' },
      { value: '12', label: 'YRS · MARINE FOCUS' },
      { value: '4', label: 'CLASS APPROVALS' },
      { value: '24/7', label: 'PORT-CALL SUPPORT' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.22 0.04 230),oklch(0.18 0.03 235))',
    tint: 'oklch(0.3 0.04 230)',
    deliveryAreas: [
      { category: 'DECK MACHINERY', title: 'Winches & cranes', description: 'Anchor winches, mooring drums, davit hydraulics. Salt-mist tested.', skuCount: '86 SKUs' },
      { category: 'STEERING & CONTROL', title: 'Rudder hydraulics', description: 'Ram steering gear, follow-up controls. Class-approved cylinders.', skuCount: '42 SKUs' },
      { category: 'CARGO HANDLING', title: 'Hatch covers, ramps', description: 'Tween-deck cylinders, ramp drives, tank-cleaning power packs.', skuCount: '58 SKUs' },
      { category: 'OFFSHORE & DREDGING', title: 'Subsea & dredge', description: 'Cutter drives, jet pumps, ROV-spec valves with deepwater seals.', skuCount: '38 SKUs' },
    ],
    refInstalls: [
      { tag: 'SHIPPING CORP OF INDIA · 2024', title: 'VLGC Bhuvan — full hydraulics retrofit', description: '22 cylinders, 4 power packs, 180+ valves replaced during dry-dock at Cochin Shipyard. 11-day turnaround.', img: 'VESSEL · GAS CARRIER' },
      { tag: 'GREATSHIP · 2025', title: 'AHTS Greatship Ahalya — winch upgrade', description: 'Anchor winch hydraulics — duplex SS rams, 350-bar HPU. Commissioned at Mumbai port-stop in 4 days.', img: 'OSV · ANCHOR HANDLER' },
      { tag: 'DREDGING CORP · 2025', title: 'TSHD Aquarius — cutter drive overhaul', description: 'A4VSO 500cc cutter pump rebuild + spare unit kept on-site. Zero downtime for 9-month campaign.', img: 'DREDGER' },
    ],
    support: {
      eyebrow: 'PORT-CALL SUPPORT',
      headline: 'When your vessel calls Mumbai, JNPT, Cochin or Chennai — we come aboard.',
      description: 'Our marine team carries authorised spares for the major brands and can be dockside within 4 hours of port arrival. Survey, swap, certificate-handed-over — before you sail.',
      bullets: [
        'Pre-arrival parts staged from your spares list',
        'DG / customs documentation handled',
        'On-board commissioning by certified hydraulic technicians',
        'Class-approved test certificates issued same-day',
      ],
      cta: 'Request marine support →',
    },
    categorySlugs: ['hydraulic-pumps', 'valves-manifolds', 'cylinders'],
  },

  steel: {
    name: 'Steel & Metals',
    breadcrumb: 'STEEL & METALS',
    headline: 'Proportional control for rolling mills, presses and casting lines.',
    description: 'High-force cylinders, servo valves and proportional systems for steel rolling mills, aluminium presses, forging equipment and continuous casting machines.',
    chips: ['ROLLING MILLS', 'SERVO-HYDRAULIC', 'HIGH-FORCE CYLINDERS', 'HOT-MILL SEALS'],
    stats: [
      { value: '40+', label: 'STEEL PLANTS SERVED' },
      { value: '16', label: 'YRS · METALS FOCUS' },
      { value: '48h', label: 'EMERGENCY DELIVERY' },
      { value: '24/7', label: 'PLANT-DOWN LINE' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.2 0.01 200),oklch(0.15 0.01 205))',
    tint: 'oklch(0.3 0.01 200)',
    deliveryAreas: [
      { category: 'HOT ROLLING', title: 'Roll-gap servo systems', description: 'Moog, Bosch Rexroth and Parker servo valves for AGC systems on hot strip mills.', skuCount: '68 SKUs' },
      { category: 'COLD ROLLING', title: 'Tension & flatness', description: 'Proportional valves, precision cylinders, accumulator banks for tandem mills.', skuCount: '52 SKUs' },
      { category: 'PRESSES', title: 'Forging & stamping', description: 'High-flow pumps, large-bore cylinders, electro-hydraulic press controls.', skuCount: '86 SKUs' },
      { category: 'CONTINUOUS CASTING', title: 'Mold oscillation', description: 'Servo-hydraulic oscillation systems, strand guide cylinders, tundish drives.', skuCount: '44 SKUs' },
    ],
    refInstalls: [
      { tag: 'TATA STEEL · 2024', title: 'Jamshedpur HSM — AGC servo valve overhaul', description: '24 servo valves on the hot strip mill AGC system replaced during annual maintenance. Mill back at 98% efficiency.', img: 'HOT STRIP MILL' },
      { tag: 'JSPL · 2025', title: 'Raigarh — continuous caster hydraulics', description: 'Full hydraulic overhaul of 6-strand billet caster: mold oscillation, withdrawal drives, emergency cylinders.', img: 'CONTINUOUS CASTER' },
      { tag: 'HINDALCO · 2024', title: 'Renukoot — foil rolling press', description: 'High-force cylinder replacement on 2,800-tonne foil rolling press. 36h plant-down response.', img: 'ALUMINIUM PRESS' },
    ],
    support: {
      eyebrow: 'PLANNED MAINTENANCE SUPPORT',
      headline: 'We align with your shutdown windows — kit staged, engineers on-call.',
      description: 'Our metals team plans with your maintenance scheduler to pre-stage critical spares 48 hours before your rolling schedule shutdown begins.',
      bullets: [
        'Shutdown-aligned pre-staged kits',
        'Servo valve exchange & certification programme',
        'On-site commissioning and tuning support',
        'Mill clearance certificates and traceability records',
      ],
      cta: 'Plan your maintenance support →',
    },
    categorySlugs: ['cylinders', 'valves-manifolds', 'hydraulic-pumps'],
  },

  construction: {
    name: 'Construction',
    breadcrumb: 'CONSTRUCTION',
    headline: 'Replacement hydraulics for excavators, cranes and concrete pumps — fast.',
    description: 'OEM-equivalent and upgraded hydraulic components for construction machinery. Most common excavator and crane pump models in stock at Mumbai and Delhi warehouses.',
    chips: ['OEM REPLACEMENT', 'NEXT-DAY METRO DELIVERY', 'ALL MAJOR BRANDS', 'GENUINE & AFTERMARKET'],
    stats: [
      { value: '300+', label: 'CONSTRUCTION CUSTOMERS' },
      { value: '8', label: 'YRS · CONSTRUCTION FOCUS' },
      { value: '24h', label: 'METRO DELIVERY' },
      { value: '1200+', label: 'EXCAVATOR PUMP SKUS' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.22 0.03 60),oklch(0.17 0.025 65))',
    tint: 'oklch(0.3 0.03 60)',
    deliveryAreas: [
      { category: 'EXCAVATORS', title: 'Main & pilot pumps', description: 'Replacement pumps for Cat, Komatsu, Hitachi, Hyundai, Volvo and Doosan machines.', skuCount: '420 SKUs' },
      { category: 'CRANES', title: 'Slewing & luffing', description: 'Fixed and variable displacement pumps and motors for crawler and truck cranes.', skuCount: '186 SKUs' },
      { category: 'CONCRETE', title: 'Pump & mixer drives', description: 'High-pressure piston pumps, rock valve cylinders, boom hydraulics for truck-mounted pumps.', skuCount: '94 SKUs' },
      { category: 'COMPACTION', title: 'Vibro & roller drives', description: 'Eaton and Bosch orbit motors, charge pumps, drum drive axle drives for compactors.', skuCount: '68 SKUs' },
    ],
    refInstalls: [
      { tag: 'SHAPOORJI PALLONJI · 2024', title: 'Bandra Dharavi — Cat 390 main pump', description: 'Emergency replacement of twin-pump assembly on Cat 390 excavator. Site delivery to Mumbai in 18h.', img: 'EXCAVATOR PUMP' },
      { tag: 'AFCONS · 2025', title: 'Zojila tunnel — Liebherr LTM crane', description: 'Slewing pump kit for LTM 1100-5.2. Altitude delivery to J&K site. 48h turnaround.', img: 'CRANE HPU' },
      { tag: 'PUTZMEISTER · 2024', title: 'Pune — PM 47Z boom pump rebuild', description: 'Rock valve cylinder set + piston wear kit for 47-metre boom pump. Scheduled PM support.', img: 'BOOM PUMP' },
    ],
    support: {
      eyebrow: 'SAME-DAY METRO DELIVERY',
      headline: "Pump fails at 06:00 — we're at your site by lunch.",
      description: 'Mumbai, Delhi, Pune, Hyderabad, Chennai: same-day delivery on stocked SKUs. WhatsApp your model number and get a live stock check in minutes.',
      bullets: [
        'Live stock check via WhatsApp in 5 minutes',
        'Same-day delivery in 8 metro cities',
        'OEM cross-reference database for all major brands',
        'Exchange programme for large pumps and motors',
      ],
      cta: 'Check availability now →',
    },
    categorySlugs: ['hydraulic-pumps', 'cylinders', 'hoses-fittings'],
  },

  power: {
    name: 'Power & Energy',
    breadcrumb: 'POWER & ENERGY',
    headline: 'Precision actuators for hydro turbines, wind pitch systems and dam gates.',
    description: 'Electrohydraulic governor systems, pitch and yaw actuators for wind, Kaplan blade controls and dam gate operators — for utilities, IPPs and EPC contractors.',
    chips: ['IEC 61511 FUNCTIONAL SAFETY', 'TURBINE GOVERNORS', 'PITCH CONTROL', 'REDUNDANT SYSTEMS'],
    stats: [
      { value: '28', label: 'POWER PLANTS SERVED' },
      { value: '10', label: 'YRS · ENERGY FOCUS' },
      { value: '4000 MW', label: 'INSTALLED BASE' },
      { value: '48h', label: 'CRITICAL DELIVERY' },
    ],
    gradient: 'linear-gradient(160deg,oklch(0.2 0.03 300),oklch(0.15 0.025 305))',
    tint: 'oklch(0.3 0.03 300)',
    deliveryAreas: [
      { category: 'HYDRO TURBINES', title: 'Governor systems', description: 'Moog and Bosch servo valves for Francis, Kaplan and Pelton governors. Redundant configurations.', skuCount: '52 SKUs' },
      { category: 'WIND ENERGY', title: 'Pitch & yaw systems', description: 'Compact hydraulic pitch cylinders, proportional valves and HPUs for onshore turbines.', skuCount: '38 SKUs' },
      { category: 'DAM GATES', title: 'Gate operators', description: 'High-force cylinders, electro-hydraulic power packs for radial, tainter and flap gates.', skuCount: '44 SKUs' },
      { category: 'THERMAL & GAS', title: 'Steam valve actuators', description: 'High-temperature rack-and-pinion actuators, positioners and solenoids for turbine steam valves.', skuCount: '66 SKUs' },
    ],
    refInstalls: [
      { tag: 'NHPC · 2024', title: 'Salal hydro — Kaplan runner blade controls', description: '4 units servo valve replacement on Kaplan runner blade controls. Plant back to full capacity in 72h.', img: 'HYDRO TURBINE' },
      { tag: 'NTPC WIND · 2025', title: 'Rojmal wind farm — pitch HPU overhaul', description: '12 × pitch HPU systems overhauled during annual maintenance window. Full redundancy restored.', img: 'WIND TURBINE' },
      { tag: 'DAMODAR VALLEY · 2024', title: 'Panchet dam — radial gate operators', description: '6 radial gate operator cylinder sets replaced. Monsoon-readiness certification met ahead of schedule.', img: 'DAM GATE' },
    ],
    support: {
      eyebrow: 'OUTAGE SUPPORT',
      headline: 'We plan to your maintenance schedule — and respond when the plan changes.',
      description: 'Our power team pre-stages governor and pitch components ahead of planned outages. When an unplanned trip occurs, our 24/7 line connects you to a hydraulic engineer in minutes.',
      bullets: [
        'Outage-aligned pre-staged critical spares',
        'IEC 61511 compliant components available',
        'On-site commissioning and testing support',
        'As-built documentation and traceability records',
      ],
      cta: 'Plan your outage support →',
    },
    categorySlugs: ['valves-manifolds', 'cylinders', 'hydraulic-pumps'],
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ind = INDUSTRIES[slug]
  if (!ind) return {}
  // The storefront industry pages are powered by the in-file INDUSTRIES map
  // (not db.industry rows). Funnel through pageMetadata for consistent
  // canonical/robots/OG handling; admin SEO overrides land in a follow-up
  // when this page is migrated to the DB.
  const { pageMetadata } = await import('../../../lib/seo')
  return pageMetadata({
    title: ind.name,
    description: ind.description,
    path: `/industries/${slug}`,
  })
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params
  const ind = INDUSTRIES[slug]
  if (!ind) notFound()

  const featuredProducts = await db.product.findMany({
    where: {
      status: 'active',
      category: { slug: { in: ind.categorySlugs } },
    },
    include: {
      brand: { select: { name: true, slug: true } },
      images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
    },
    take: 8,
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          background: ind.gradient,
          color: 'white',
          padding: '64px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 38px,oklch(1 0 0 / 0.04) 38px,oklch(1 0 0 / 0.04) 39px)',
            pointerEvents: 'none',
          }}
        />
        <div className="max-w-[1360px] mx-auto px-8" style={{ position: 'relative' }}>
          <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase mb-2">
            <Link href={`/`} className="text-[var(--color-accent)] hover:opacity-80">INDUSTRIES</Link>
            {' / '}{ind.breadcrumb}
          </div>
          <h1 className="text-[72px] tracking-[-0.03em] leading-[1] text-white font-semibold max-w-[900px] mt-2 mb-3.5">
            {ind.headline}
          </h1>
          <p className="text-[18px] max-w-[680px] mb-7 leading-[1.55]" style={{ color: 'oklch(0.78 0 0)' }}>
            {ind.description}
          </p>
          <div className="flex gap-2 flex-wrap mb-8">
            {ind.chips.map((chip) => (
              <span
                key={chip}
                className="font-mono text-[12px] px-3 py-1.5"
                style={{ background: ind.tint, color: 'oklch(0.9 0 0)', borderRadius: '14px' }}
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="grid gap-12 font-mono" style={{ gridTemplateColumns: 'repeat(4,auto)' }}>
            {ind.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-[36px] font-semibold text-white">{stat.value}</div>
                <div className="text-[11px] tracking-[0.08em] uppercase mt-0.5" style={{ color: 'oklch(0.7 0 0)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where we deliver ──────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-8 py-12">
        <h2 className="text-[28px] tracking-[-0.02em] font-semibold mb-6">Where we deliver</h2>
        <div className="grid grid-cols-4 gap-3.5">
          {ind.deliveryAreas.map((area) => (
            <div key={area.category} className="p-5 border border-[var(--color-border)] bg-[var(--color-elevated)]">
              <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-accent)] uppercase mb-2">{area.category}</div>
              <h3 className="text-[17px] font-semibold mb-1.5 leading-snug">{area.title}</h3>
              <p className="text-[13px] text-[var(--color-muted)] leading-[1.5] mb-2.5">{area.description}</p>
              <div className="font-mono text-[11px] text-[var(--color-muted)]">{area.skuCount} →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured SKUs ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[28px] tracking-[-0.02em] font-semibold">{ind.name}-rated SKUs</h2>
            <Link href={`/c`} className="text-[13px] text-[var(--color-accent)] hover:underline">
              All {ind.name} SKUs →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {featuredProducts.map((product) => {
              const img = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="flex flex-col border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-[var(--color-deep)] border-b border-[var(--color-border)] relative overflow-hidden">
                    {img ? (
                      <Image
                        src={mediaUrl(img.media.storagePath)}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 1360px) 25vw, 320px"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[var(--color-muted)]">IMG</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[var(--color-muted)]">{product.sku}</div>
                    <div className="text-[13px] font-medium mt-0.5 mb-1 leading-snug line-clamp-2">{product.title}</div>
                    {product.brand && <div className="font-mono text-[10px] text-[var(--color-muted)]">{product.brand.name}</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Reference installs ────────────────────────────────── */}
      <section className="bg-[var(--color-elevated)] border-t border-b border-[var(--color-border)] py-14 mt-8">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">Reference installs</div>
          <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-6">A few of the projects we serve</h2>
          <div className="grid grid-cols-3 gap-4">
            {ind.refInstalls.map((ref) => (
              <article key={ref.title} className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                <div className="aspect-[16/10] bg-[var(--color-deep)] border-b border-[var(--color-border)] grid place-items-center">
                  <span className="font-mono text-[10px] text-[var(--color-muted)]">{ref.img}</span>
                </div>
                <div className="p-[18px]">
                  <div className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.08em] uppercase">{ref.tag}</div>
                  <h3 className="text-[18px] font-semibold mt-1.5 mb-2 leading-snug">{ref.title}</h3>
                  <p className="text-[13px] text-[var(--color-body)] leading-[1.5]">{ref.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support section ───────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-8 py-14">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">{ind.support.eyebrow}</div>
            <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-3.5 leading-snug">{ind.support.headline}</h2>
            <p className="text-[var(--color-body)] mb-4 leading-[1.6] text-[15px]">{ind.support.description}</p>
            <ul className="flex flex-col gap-2 text-[14px] mb-6">
              {ind.support.bullets.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <Link
              href={`/contact`}
              className="inline-flex items-center h-11 px-6 bg-[var(--color-accent)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
            >
              {ind.support.cta}
            </Link>
          </div>
          <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] grid place-items-center">
            <span className="font-mono text-[11px] text-[var(--color-muted)]">{ind.name.toUpperCase()} SERVICE TEAM</span>
          </div>
        </div>
      </section>
    </div>
  )
}
