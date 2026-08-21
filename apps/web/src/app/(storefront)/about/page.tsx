import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { urlFor } from '../../../lib/seo'

// Static-ish marketing page; cache for 1 hour.
export const revalidate = 3600

const FOUNDING_YEAR = 2003

export async function generateMetadata(): Promise<Metadata> {
  const [page, skuCount, brandCount] = await Promise.all([
    db.cmsPage.findUnique({ where: { slug: 'about' } }),
    db.product.count({ where: { status: 'active' } }),
    db.brand.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  const skuFloor = Math.max(100, Math.floor(skuCount / 100) * 100)
  return {
    title: page?.seoTitle ?? 'About Indus Hydraulics',
    description:
      page?.seoDescription ??
      `A specialist hydraulics supplier built by engineers for engineers. ${yearsInBusiness} years in business, ${skuFloor.toLocaleString()}+ SKUs across ${brandCount} brands, shipped from Dubai HQ.`,
    // Hand-built metadata, so it never went through `pageMetadata` and never
    // declared one. Same omission as the home page's.
    alternates: { canonical: urlFor('/about') },
  }
}

type Props = { params: Promise<Record<string, never>> }

const TIMELINE = [
  { year: '2003', title: 'Founded in Dubai', desc: 'Started as a sole-trader hydraulics trading company in Al Quasis, importing genuine pumps and valves for UAE industrial customers. First customer: a steel re-rolling mill in Sharjah Industrial Area.' },
  { year: '2008', title: 'First GCC export', desc: 'Shipped our first cross-border project consignment to Dammam, Saudi Arabia. Discovered our future was regional, not just local.' },
  { year: '2012', title: 'Al Quasis warehouse opens', desc: 'Moved into our current 14,000 sq.ft. facility off Al Nahda Street. Consolidated stock under one roof for the first time.' },
  { year: '2017', title: 'Hose assembly line commissioned', desc: 'Brought hydraulic hose crimping and fittings assembly in-house. Replacement assemblies that used to take days now leave the workshop the same afternoon.' },
  { year: '2021', title: 'Engineering desk launched', desc: 'Made our applications team free for any customer with a question — from a circuit diagram to a failed-seal photo.' },
  { year: '2024', title: 'JAFZA bonded presence', desc: 'Opened a Jebel Ali Free Zone bonded position for tax-efficient regional distribution across the GCC and wider MENA.' },
  { year: '2026', title: 'This website', desc: 'The catalogue you\'re browsing right now — built by the same engineers who answer the phone.' },
]

const TEAM = [
  { initials: 'RB', name: 'Ravi Bhatt', title: 'Founder & CEO · 23 yrs' },
  { initials: 'SP', name: 'Sunil Patel', title: 'Head of Sales · 12 yrs' },
  { initials: 'AK', name: 'Anjali Krishnan', title: 'Technical Director · 10 yrs' },
  { initials: 'MR', name: 'Mehul Rana', title: 'Operations Lead · 8 yrs' },
]

export default async function AboutPage({ params }: Props) {
  await params
  const [page, activeSkuCount, publishedBrandCount] = await Promise.all([
    db.cmsPage.findUnique({ where: { slug: 'about', isPublished: true } }),
    db.product.count({ where: { status: 'active' } }),
    db.brand.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  // Floor to the nearest 100 so the hero claim never overstates the
  // catalogue — adding SKUs only ever ratchets the number up.
  const skuFloor = Math.max(100, Math.floor(activeSkuCount / 100) * 100)

  if (page) {
    return (
      <div className="max-w-[860px] mx-auto px-8 py-10 pb-20">
        <h1 className="text-[32px] font-semibold tracking-tight mb-8">{page.title}</h1>
        <div
          className="prose prose-sm max-w-none text-ih-ink-2 leading-[1.7] prose-headings:text-ih-ink prose-a:text-ih-accent"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    )
  }

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pt-16 pb-8 grid grid-cols-1 gap-14 items-end lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-3">ABOUT INDUS · EST. 2003</div>
          <h1 className="text-[clamp(44px,5.5vw,72px)] tracking-[-0.035em] leading-[1.02] font-semibold">
            A specialist supplier, built by engineers, for engineers.
          </h1>
        </div>
        <p className="text-[17px] text-ih-muted leading-[1.55] max-w-[520px]">
          We started in a 200-square-foot office in Al Quasis with one hydraulics distributorship and a fax machine. {yearsInBusiness} years later we ship {skuFloor.toLocaleString()}+ SKUs across the GCC — and we still know the bore, rod and stroke of every cylinder we sell.
        </p>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        <div className="grid grid-cols-4 border-t border-b border-ih-border">
          {[
            { num: `${yearsInBusiness} yrs`, lbl: 'In business' },
            { num: activeSkuCount.toLocaleString(), lbl: 'Live SKUs' },
            { num: 'GCC', lbl: 'Service area' },
            { num: String(publishedBrandCount), lbl: 'Partner brands' },
          ].map((s, i) => (
            <div key={s.lbl} className={`px-6 py-6 ${i < 3 ? 'border-r border-ih-border' : ''}`}>
              <div className="font-mono text-[40px] tracking-[-0.03em] font-medium">{s.num}</div>
              <div className="font-mono text-[11px] text-ih-muted tracking-[0.08em] uppercase mt-1">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">OUR STORY</div>
            <h2 className="text-[36px] font-semibold tracking-[-0.02em] leading-[1.1] mb-4">From a trading desk to an assembly line.</h2>
            <p className="text-ih-muted leading-[1.6] text-[14px]">
              Indus Hydraulics was founded in 2003 by Ravi Bhatt, a mechanical engineer who got tired of watching UAE plants wait six weeks for a replacement valve. The company was built around a single idea: stock the parts engineers actually need, ship them today.
            </p>
          </div>
          <div>
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                /* Class, not inline: an inline gridTemplateColumns beats the
                   responsive utilities, so the 80px year column plus body
                   text ran past a 390px viewport. */
                className={`grid grid-cols-[64px_1fr] gap-4 py-5 sm:grid-cols-[80px_1fr] sm:gap-6 ${i < TIMELINE.length - 1 ? 'border-b border-ih-border' : ''}`}
              >
                <span className="font-mono text-[16px] text-ih-accent">{item.year}</span>
                <div className="min-w-0">
                  <h4 className="text-[17px] font-semibold mb-1.5">{item.title}</h4>
                  <p className="text-[14px] text-ih-muted leading-[1.55]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────── */}
      <section className="border-t border-ih-border py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">PEOPLE · LEADERSHIP</div>
              <h2 className="text-[32px] font-semibold tracking-[-0.02em]">The engineers behind the catalogue.</h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {TEAM.map((person) => (
              <div key={person.name} className="border border-ih-border bg-ih-surface overflow-hidden">
                <div className="aspect-[4/5] bg-ih-surface-2 border-b border-ih-border grid place-items-center">
                  <div className="w-20 h-20 rounded-full bg-ih-navy text-white grid place-items-center text-[28px] font-semibold">
                    {person.initials}
                  </div>
                </div>
                <div className="p-4 pb-5">
                  <h4 className="text-[15px] font-semibold">{person.name}</h4>
                  <p className="font-mono text-[11px] text-ih-muted tracking-[0.04em] mt-1">{person.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────── */}
      <section className="border-t border-ih-border bg-ih-surface py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">HOW WE WORK</div>
          <h2 className="text-[32px] font-semibold tracking-[-0.02em] mb-10">Three things that don&apos;t change.</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Stock it, or say so.', desc: 'We quote from real inventory. If something isn\'t stocked, we say the lead time upfront — never after you\'ve committed.' },
              { num: '02', title: 'Engineers answer the phone.', desc: 'When you call with a technical question, you reach an applications engineer — not a call centre. We know the spec sheet, not just the catalogue number.' },
              { num: '03', title: 'One price, no theatre.', desc: 'Our quote is a fixed-price commitment. No undisclosed freight surcharges, no "minimum order uplift" sprung at invoice.' },
            ].map((v) => (
              <div key={v.num}>
                <div className="font-mono text-[32px] font-semibold text-ih-muted opacity-30 mb-4">{v.num}</div>
                <h3 className="text-[20px] font-semibold tracking-[-0.01em] mb-3">{v.title}</h3>
                <p className="text-[14px] text-ih-muted leading-[1.6]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-16 grid grid-cols-1 gap-8 items-center md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2">Ready to put us to the test?</h2>
          <p className="text-[14px] text-ih-muted">Send us your hardest-to-source SKU. We respond within 4 hours — often in minutes.</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:shrink-0">
          <Link href={`/quote`} className="h-11 px-6 flex items-center bg-ih-accent text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
            Submit an RFQ →
          </Link>
          <Link href={`/contact`} className="h-11 px-5 flex items-center border border-ih-border text-[14px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors whitespace-nowrap">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  )
}
