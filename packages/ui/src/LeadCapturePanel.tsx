export type LeadCapturePanelProps = {
  /** Section heading. Imperative phrasing usually converts best ("Get pricing on this part"). */
  heading: string
  /** Optional supporting copy under the heading. */
  body?: string
  /** Pre-built wa.me URL (call `buildWhatsappHref` on the server). `null` hides the button. */
  whatsappUrl?: string | null
  /** Pre-built `mailto:` URL. Always rendered (falls back to a generic sales inbox upstream). */
  emailUrl: string
  /** Where the primary "Request a quote" button points. Defaults to `/quote`. */
  quoteUrl?: string
  /** Optional click-to-call number in E.164. `null`/undefined hides the tel button. */
  phone?: string | null
  /** Label override for the primary button. Defaults to "Request a quote". */
  quoteLabel?: string
  /** Variant — "wide" is a centred hero-style band, "compact" sits inline at section width. */
  variant?: 'wide' | 'compact'
}

/**
 * Shared lead-capture panel. Used at the bottom of content surfaces that
 * rank organically but historically had no conversion path: industry
 * pages, replacement landing pages, services index.
 *
 * Renders three CTAs side-by-side: primary "Request a quote", WhatsApp
 * (hidden if no number configured), and Email. Optional click-to-call
 * row sits below. The component is a Server Component — no client JS,
 * no hydration cost. PostHog autocapture picks up clicks on every
 * outbound link so the conversion is measurable without wiring events.
 */
export function LeadCapturePanel({
  heading,
  body,
  whatsappUrl,
  emailUrl,
  quoteUrl = '/quote',
  phone,
  quoteLabel = 'Request a quote',
  variant = 'wide',
}: LeadCapturePanelProps) {
  // `sc-cta-panel` is a styling opt-out, not a look: article bodies style bare
  // anchors (accent + underline) at a specificity that beats the button
  // utilities below. The marker keeps this panel's CTAs looking like buttons
  // wherever it is embedded, including inside a blog article.
  const containerCls =
    variant === 'wide'
      ? 'sc-cta-panel border-t border-ih-border bg-ih-surface py-14 px-8'
      : 'sc-cta-panel border border-ih-border bg-ih-surface py-8 px-6'

  return (
    <section className={containerCls} aria-labelledby="lead-capture-heading">
      <div className={variant === 'wide' ? 'max-w-[840px] mx-auto text-center' : ''}>
        <h2
          id="lead-capture-heading"
          className={
            variant === 'wide'
              ? 'font-serif text-[clamp(24px,3vw,36px)] font-normal tracking-[-0.02em] leading-[1.15] mb-3'
              : 'text-[22px] font-semibold tracking-[-0.01em] mb-2'
          }
        >
          {heading}
        </h2>
        {body && (
          <p
            className={
              variant === 'wide'
                ? 'text-[15px] text-ih-muted leading-[1.6] mb-7 max-w-[620px] mx-auto'
                : 'text-[14px] text-ih-muted leading-[1.55] mb-5'
            }
          >
            {body}
          </p>
        )}

        <div
          className={
            variant === 'wide'
              ? 'flex flex-wrap justify-center gap-2.5'
              : 'flex flex-wrap gap-2.5'
          }
        >
          <a
            href={quoteUrl}
            className="inline-flex items-center h-11 px-6 bg-ih-accent text-white font-medium text-[14px] hover:opacity-90 transition-opacity"
          >
            {quoteLabel} →
          </a>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-11 px-6 font-medium text-[14px] text-white hover:opacity-90 transition-opacity"
              style={{ background: '#16a34a' }}
            >
              WhatsApp us
            </a>
          )}

          <a
            href={emailUrl}
            className="inline-flex items-center h-11 px-6 border border-ih-border bg-ih-bg text-ih-ink-2 font-medium text-[14px] hover:border-ih-ink transition-colors"
          >
            Email
          </a>
        </div>

        {phone && (
          <p
            className={
              variant === 'wide'
                ? 'mt-5 font-mono text-[12px] text-ih-muted'
                : 'mt-3 font-mono text-[12px] text-ih-muted'
            }
          >
            Plant-down?{' '}
            <a href={`tel:${phone}`} className="text-ih-accent hover:underline">
              Call {phone}
            </a>{' '}
            — 24/7
          </p>
        )}
      </div>
    </section>
  )
}

/**
 * Build a `wa.me` URL from a raw phone string (e.g. `+971 52 247 7942`).
 * Strips non-digits and appends an optional `text` query so the
 * recipient sees a contextual opener. Returns `null` when the phone is
 * unset or too short, so callers can conditionally hide the WhatsApp
 * button instead of shipping a dead link.
 */
export function buildWhatsappHref(phone: string | null | undefined, prefill?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null
  const text = prefill ? `?text=${encodeURIComponent(prefill)}` : ''
  return `https://wa.me/${digits}${text}`
}

/**
 * Build a `mailto:` URL with optional subject prefill. Falls back to a
 * generic sales inbox when `email` is unset so the CTA is never dead.
 */
export function buildMailtoHref(email: string | null | undefined, subject?: string): string {
  const to = email ?? 'enquiries@indushydraulics.me'
  const subjectPart = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${to}${subjectPart}`
}
