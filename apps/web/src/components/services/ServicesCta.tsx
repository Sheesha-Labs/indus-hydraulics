import Link from 'next/link'

type Props = {
  /** Pre-built `wa.me` URL. `null` hides the WhatsApp button (StoreSettings.contactPhone unset). */
  whatsappUrl?: string | null
  /** Pre-built `mailto:` URL. Always rendered (falls back to a generic sales inbox upstream). */
  emailUrl: string
}

/**
 * Bottom CTA strip — appears at the foot of /services AND /services/[slug].
 * Eyebrow + italic byline + h2 + three buttons (Open ticket, WhatsApp, Email).
 * WhatsApp / email URLs are passed in from the page (per the "pages fetch,
 * components render" rule); WhatsApp button hides itself when no number is
 * configured, instead of shipping a dead link.
 */
export default function ServicesCta({ whatsappUrl, emailUrl }: Props) {
  return (
    <section className="px-4 py-20 text-center">
      <span className="eyebrow">SERVICE INTAKE · OPEN 24×7 · JEBEL ALI</span>
      <p className="mx-auto my-4 max-w-[760px] font-serif text-lg italic leading-[1.45] text-ih-ink-2 sm:text-xl lg:text-[22px]">
        If it leaks, hums, screams, drips, slips or simply refuses to move — we&rsquo;d like a look at it.
      </p>
      <h2 className="mx-auto mb-5 max-w-[880px] text-4xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl lg:text-[56px]">
        Send us a photo, an SKU or a part on a pallet. We&rsquo;ll do the rest.
      </h2>
      <p className="mx-auto mb-8 max-w-[540px] text-[17px] leading-[1.55] text-ih-muted">
        An applications engineer will read your ticket inside one business day — no charge for the
        conversation, no obligation to use us.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/quote"
          className="inline-flex items-center gap-2 rounded-sm bg-ih-navy px-7 py-3.5 text-[15px] font-medium text-white hover:bg-ih-ink"
        >
          Open a service ticket
        </Link>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm px-7 py-3.5 text-[15px] font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: '#16a34a' }}
          >
            WhatsApp us
          </a>
        )}
        <a
          href={emailUrl}
          className="inline-flex items-center gap-2 rounded-sm border border-ih-border bg-ih-surface px-7 py-3.5 text-[15px] font-medium hover:border-ih-accent"
        >
          Email
        </a>
      </div>
    </section>
  )
}
