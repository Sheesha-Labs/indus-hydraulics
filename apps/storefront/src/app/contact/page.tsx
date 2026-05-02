import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.cmsPage.findUnique({ where: { slug: 'contact' } })
  return {
    title: page?.seoTitle ?? 'Contact',
    description: page?.seoDescription ?? 'Talk to a real applications engineer. Send us a part number, circuit diagram, or photo of the failure.',
  }
}

type Props = { params: Promise<Record<string, never>> }

const FAQS = [
  { q: 'How fast do you respond to RFQs?', a: 'Routine RFQs within 1 business day. Priority within 4 working hours. Plant-down within 30 minutes, 24/7.' },
  { q: 'Do you supply to customers outside India?', a: 'Yes — we supply to UAE, Singapore, Malaysia and other markets. Contact us for freight terms and lead times.' },
  { q: 'Can I get a sample or trial unit?', a: 'For qualified projects above a threshold value, we can arrange trial units with a deposit. Speak to your sales engineer.' },
  { q: 'Do you offer on-site commissioning?', a: 'Yes, for hydraulic systems we supply. Our certified technicians cover major industrial sites across India.' },
  { q: 'What brands do you stock?', a: 'Bosch Rexroth, Parker Hannifin, Atos, Hydac, Stauff, Eaton Vickers, Sun Hydraulics, and more. Full brand list on our brands page.' },
]

export default async function ContactPage({ params }: Props) {
  await params

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-8 pt-14 pb-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-3">CONTACT · WE PICK UP THE PHONE</div>
        <h1 className="text-[clamp(40px,5vw,60px)] tracking-[-0.03em] leading-[1.05] max-w-[780px] mb-4 font-semibold">
          Talk to a real applications engineer.
        </h1>
        <p className="text-[17px] text-[var(--color-muted)] max-w-[580px] leading-[1.55]">
          Send us a circuit diagram, a part number, or a photo of the failure. We'll respond within 4 business hours — often within minutes via WhatsApp.
        </p>
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-8 py-8 pb-16 grid gap-14" style={{ gridTemplateColumns: '1.1fr 1fr' }}>

        {/* ── Form card ─────────────────────────────────────── */}
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-9">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] mb-1">Send us a message</h2>
          <p className="text-[14px] text-[var(--color-muted)] mb-6">Or pick a faster channel on the right →</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-[var(--color-surface)] border border-[var(--color-border)]">
            {['Quotation request', 'Application help', 'General enquiry'].map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`flex-1 py-2.5 px-3.5 text-[13px] font-medium transition-colors ${i === 0 ? 'bg-[var(--color-primary)] text-[var(--color-elevated)]' : 'text-[var(--color-muted)] hover:text-[var(--color-body)]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">First name *</label>
                <input type="text" placeholder="e.g. Rohit" required className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Last name *</label>
                <input type="text" placeholder="e.g. Kapoor" required className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Work email *</label>
                <input type="email" placeholder="rohit@company.com" required className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Phone / WhatsApp</label>
                <input type="tel" placeholder="+91 98XXX XXXXX" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Company *</label>
                <input type="text" placeholder="Your company" required className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Industry</label>
                <select className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-accent)]">
                  <option>Select…</option>
                  <option>Oil & Gas</option>
                  <option>Marine</option>
                  <option>Mining</option>
                  <option>Steel & Metals</option>
                  <option>Construction</option>
                  <option>Power & Energy</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">SKUs or part numbers</label>
              <input type="text" placeholder="e.g. IH-AP71-D-R-V, A10VSO 71cc" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]" />
              <p className="font-mono text-[11px] text-[var(--color-muted)] mt-1">Separate multiple SKUs with commas</p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Message / application details</label>
              <textarea rows={4} placeholder="Describe the equipment, failure mode, application, or question…" className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-2)]">
              <p className="text-[12px] text-[var(--color-muted)] max-w-[280px] leading-[1.4]">
                By submitting, you agree to our privacy policy. We don't share your data.
              </p>
              <button type="submit" className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                Send message →
              </button>
            </div>
          </form>
        </div>

        {/* ── Right column: channels + offices ──────────────── */}
        <div>
          {/* Channels */}
          <div className="flex flex-col gap-3 mb-8">
            {[
              {
                cls: 'wa',
                iconBg: '#16a34a',
                icon: '💬',
                title: 'WhatsApp',
                sub: 'Fastest response · typically < 15 min',
                value: '+91 98XXX XXXXX',
                badge: 'Online now',
                badgeColor: 'oklch(0.4 0.12 150)',
                badgeBg: 'oklch(0.95 0.05 150)',
                href: 'https://wa.me/91980000000',
              },
              {
                cls: 'email',
                iconBg: 'var(--color-primary)',
                icon: '✉',
                title: 'Email',
                sub: 'Response within 4 business hours',
                value: 'enquiries@indushydraulics.com',
                badge: null,
                badgeColor: '',
                badgeBg: '',
                href: 'mailto:enquiries@indushydraulics.com',
              },
              {
                cls: 'phone',
                iconBg: 'var(--color-accent)',
                icon: '📞',
                title: 'Phone',
                sub: 'Mon–Sat · 09:00–18:30 IST',
                value: '+91 22 4000 0000',
                badge: null,
                badgeColor: '',
                badgeBg: '',
                href: 'tel:+912240000000',
              },
            ].map((ch) => (
              <a
                key={ch.title}
                href={ch.href}
                className="grid gap-4 items-center p-5 border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors"
                style={{ gridTemplateColumns: '44px 1fr auto' }}
              >
                <div
                  className="w-11 h-11 border grid place-items-center text-[18px]"
                  style={{ background: ch.iconBg, borderColor: ch.iconBg, color: 'white' }}
                >
                  {ch.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold">{ch.title}</h3>
                  <p className="text-[12px] text-[var(--color-muted)] mt-0.5">{ch.sub}</p>
                  <div className="font-mono text-[13px] text-[var(--color-primary)] mt-1">{ch.value}</div>
                </div>
                {ch.badge && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 shrink-0" style={{ background: ch.badgeBg, color: ch.badgeColor }}>
                    {ch.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Offices */}
          <div className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-3">Our offices</div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              {
                flag: 'INDIA · HQ',
                city: 'Mumbai',
                address: 'Andheri East\nMumbai 400 059\nMaharashtra, India',
                hours: 'Mon–Sat · 09:00–18:30 IST',
                isHq: true,
              },
              {
                flag: 'INDIA',
                city: 'Delhi NCR',
                address: 'Sector 68, Gurugram\nHaryana 122 018\nIndia',
                hours: 'Mon–Sat · 09:00–18:30 IST',
                isHq: false,
              },
              {
                flag: 'UAE',
                city: 'Dubai',
                address: 'JAFZA · Jebel Ali\nDubai, UAE',
                hours: 'Sun–Thu · 08:30–17:30 GST',
                isHq: false,
              },
              {
                flag: 'INDIA',
                city: 'Chennai',
                address: 'Ambattur Industrial Estate\nChennai 600 058\nTamil Nadu, India',
                hours: 'Mon–Sat · 09:00–18:30 IST',
                isHq: false,
              },
            ].map((office) => (
              <div key={office.city} className="relative border border-[var(--color-border)] bg-[var(--color-elevated)] p-5 flex flex-col gap-2">
                {office.isHq && (
                  <span className="absolute top-4 right-4 font-mono text-[10px] bg-[var(--color-primary)] text-[var(--color-elevated)] px-1.5 py-0.5 tracking-[0.06em]">HQ</span>
                )}
                <div className="font-mono text-[11px] text-[var(--color-accent)] tracking-[0.06em]">{office.flag}</div>
                <h4 className="text-[16px] font-semibold tracking-[-0.01em]">{office.city}</h4>
                <address className="not-italic text-[13px] text-[var(--color-muted)] leading-[1.5] whitespace-pre-line">{office.address}</address>
                <div className="font-mono text-[11px] text-[var(--color-muted)] mt-auto pt-2 border-t border-[var(--color-border-2)]">
                  {office.hours}
                </div>
              </div>
            ))}
          </div>

          {/* RFQ CTA */}
          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
            <b className="text-[14px]">Prefer to submit a formal RFQ?</b>
            <p className="mt-1 text-[13px] text-[var(--color-muted)] mb-3">Use our quote builder to add specific SKUs with quantities and we'll respond with pricing within 4 hours.</p>
            <Link
              href={`/quote`}
              className="inline-flex h-9 px-4 items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
            >
              Submit an RFQ →
            </Link>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)] py-16">
        <div className="max-w-[1360px] mx-auto px-8 grid gap-14" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div>
            <h2 className="text-[32px] font-semibold tracking-[-0.02em] leading-snug">Frequently asked questions</h2>
            <p className="mt-3 text-[14px] text-[var(--color-muted)] leading-[1.6]">
              Can't find your answer? Call us or use WhatsApp — we're the fastest channel.
            </p>
          </div>
          <div className="flex flex-col">
            {FAQS.map((faq) => (
              <details key={faq.q} className="border-b border-[var(--color-border-2)] py-[18px] first:pt-0 group">
                <summary className="list-none flex justify-between items-center gap-4 cursor-pointer">
                  <h4 className="text-[16px] font-medium flex-1">{faq.q}</h4>
                  <span className="font-mono text-[18px] text-[var(--color-muted)] group-open:text-[var(--color-accent)] transition-colors shrink-0">+</span>
                </summary>
                <p className="mt-3 text-[14px] text-[var(--color-muted)] leading-[1.6]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
