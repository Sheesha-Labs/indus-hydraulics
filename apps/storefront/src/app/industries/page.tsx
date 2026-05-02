import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

const FOUNDING_YEAR = 2003

export async function generateMetadata(): Promise<Metadata> {
  const [activeSkuCount, industryCount] = await Promise.all([
    db.product.count({ where: { status: 'active' } }),
    db.industry.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  return {
    title: 'Industries We Serve',
    description: `Hydraulic components for ${industryCount} industries including oil & gas, mining, marine and construction. ${activeSkuCount.toLocaleString()} live SKUs. Specialist supplier, ${yearsInBusiness} years, 47 countries.`,
  }
}

type Props = { params: Promise<Record<string, never>> }

const INDUSTRIES = [
  {
    slug: 'oil-gas',
    name: 'Oil & Gas',
    eyebrow: 'UPSTREAM · MIDSTREAM · DOWNSTREAM',
    description: 'API-rated, ATEX-certified and NACE-compliant components for wellhead controls, BOP systems, pipeline pump stations and refinery process control valves.',
    chips: ['API 6A / 16A', 'ATEX / IECEx', 'NACE MR0175'],
    skuCount: '346+',
    gradient: 'linear-gradient(160deg,oklch(0.18 0.04 45),oklch(0.14 0.03 50))',
  },
  {
    slug: 'mining',
    name: 'Mining',
    eyebrow: 'UNDERGROUND · OPEN PIT · SURFACE',
    description: 'High-cycle, dust-rated components for underground and open-pit mining — from roof-support proportional valves to excavator pump replacements.',
    chips: ['HIGH-CYCLE RATED', 'IP67 ENCLOSURES', 'CBM CERTIFIED'],
    skuCount: '270+',
    gradient: 'linear-gradient(160deg,oklch(0.2 0.02 80),oklch(0.16 0.015 85))',
  },
  {
    slug: 'marine',
    name: 'Marine & Offshore',
    eyebrow: 'VESSELS · OFFSHORE · DREDGING',
    description: 'Saltwater-rated pumps, IP-rated valves, class-approved cylinders for vessels, offshore platforms and dredgers. DNV, LR, ABS and IRS approved.',
    chips: ['DNV · LR · ABS · IRS', 'SS316 OPTIONS', 'IP66 RATED'],
    skuCount: '224+',
    gradient: 'linear-gradient(160deg,oklch(0.22 0.04 230),oklch(0.18 0.03 235))',
  },
  {
    slug: 'steel',
    name: 'Steel & Metals',
    eyebrow: 'ROLLING MILLS · PRESSES · CASTING',
    description: 'High-force cylinders, servo valves and proportional systems for steel rolling mills, aluminium presses, forging equipment and continuous casting machines.',
    chips: ['SERVO-HYDRAULIC', 'HIGH-FORCE', 'HOT-MILL SEALS'],
    skuCount: '250+',
    gradient: 'linear-gradient(160deg,oklch(0.2 0.01 200),oklch(0.15 0.01 205))',
  },
  {
    slug: 'construction',
    name: 'Construction',
    eyebrow: 'EXCAVATORS · CRANES · CONCRETE',
    description: 'OEM-equivalent and upgraded hydraulic components for construction machinery. Most common excavator and crane pump models stocked for next-day metro delivery.',
    chips: ['OEM REPLACEMENT', 'NEXT-DAY METRO', 'ALL MAJOR BRANDS'],
    skuCount: '768+',
    gradient: 'linear-gradient(160deg,oklch(0.22 0.03 60),oklch(0.17 0.025 65))',
  },
  {
    slug: 'power',
    name: 'Power & Energy',
    eyebrow: 'HYDRO · WIND · THERMAL · DAM GATES',
    description: 'Electrohydraulic governor systems, pitch and yaw actuators for wind, Kaplan blade controls and dam gate operators — for utilities, IPPs and EPC contractors.',
    chips: ['IEC 61511', 'TURBINE GOVERNORS', 'REDUNDANT SYSTEMS'],
    skuCount: '200+',
    gradient: 'linear-gradient(160deg,oklch(0.2 0.03 300),oklch(0.15 0.025 305))',
  },
]

export default async function IndustriesIndexPage({ params }: Props) {
  await params

  const [activeSkuCount, industryCount] = await Promise.all([
    db.product.count({ where: { status: 'active' } }),
    db.industry.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR

  return (
    <div>
      {/* Hero */}
      <div className="max-w-[1360px] mx-auto px-8 pt-14 pb-10">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-3">INDUSTRIES WE SERVE</div>
        <div className="grid gap-12 items-end" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <h1 className="text-[clamp(40px,5vw,64px)] tracking-[-0.03em] leading-[1.05] font-semibold">
            Specialist supply for the industries that cannot stop.
          </h1>
          <p className="text-[17px] text-[var(--color-muted)] leading-[1.55] max-w-[520px]">
            From oil well to wind turbine, from underground mine to floating drydock — our engineers understand your application, not just your part number.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-[1360px] mx-auto px-8">
        <div className="grid grid-cols-4 border-t border-b border-[var(--color-border)]">
          {[
            { num: String(industryCount), lbl: 'Industries served' },
            { num: activeSkuCount.toLocaleString(), lbl: 'Live SKUs' },
            { num: '47', lbl: 'Countries shipped' },
            { num: `${yearsInBusiness} yrs`, lbl: 'Specialist experience' },
          ].map((s, i) => (
            <div key={s.lbl} className={`px-6 py-5 ${i < 3 ? 'border-r border-[var(--color-border-2)]' : ''}`}>
              <div className="font-mono text-[36px] tracking-[-0.03em] font-medium">{s.num}</div>
              <div className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.08em] uppercase mt-1">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry cards grid */}
      <div className="max-w-[1360px] mx-auto px-8 py-12 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group flex flex-col overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-body)] transition-colors"
            >
              {/* Dark hero band */}
              <div
                className="px-7 py-8 flex flex-col gap-3"
                style={{ background: ind.gradient, color: 'white', minHeight: '160px' }}
              >
                <div className="font-mono text-[10px] tracking-[0.16em] opacity-60 uppercase">{ind.eyebrow}</div>
                <h2 className="text-[22px] font-semibold tracking-[-0.015em] leading-tight">{ind.name}</h2>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {ind.chips.map((chip) => (
                    <span
                      key={chip}
                      className="font-mono text-[9px] tracking-[0.1em] px-2 py-0.5"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card body */}
              <div className="px-7 py-5 bg-[var(--color-elevated)] flex flex-col gap-3 flex-1">
                <p className="text-[13px] text-[var(--color-muted)] leading-[1.6]">{ind.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border-2)]">
                  <div className="font-mono text-[11px] text-[var(--color-muted)]">
                    <span className="text-[var(--color-primary)] font-medium">{ind.skuCount}</span> SKUs
                  </div>
                  <span className="font-mono text-[12px] text-[var(--color-accent)] group-hover:underline">
                    View solutions →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-elevated)] py-14">
        <div className="max-w-[1360px] mx-auto px-8 flex items-center justify-between gap-8">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2">Don't see your industry listed?</h2>
            <p className="text-[14px] text-[var(--color-muted)]">
              We supply hydraulic components across many more applications. Send us your part number or specification.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href={`/quote`}
              className="h-11 px-6 flex items-center bg-[var(--color-accent)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Submit an RFQ →
            </Link>
            <Link
              href={`/contact`}
              className="h-11 px-5 flex items-center border border-[var(--color-border)] text-[14px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
