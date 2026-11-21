'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  title: string
  sku: string
  datasheetUrl?: string
  whatsappUrl?: string | null
  emailUrl: string
}

type Phase = 'hidden' | 'bar' | 'popup'

/** Once a reader closes the pop-up it stays closed for the visit, on every PDP. */
const DISMISS_KEY = 'ih-pdp-enquiry-popup-dismissed'

/**
 * The pop-up takes over once the site footer is within this distance of the
 * viewport's bottom edge — i.e. the reader has reached the related parts. Keyed
 * to the footer rather than to the page height because the footer stacks to
 * several screens on a phone.
 */
const POPUP_BEFORE_FOOTER_PX = 320

/**
 * The PDP's enquiry dock.
 *
 * - Past the first screen: a slim bar with the part and its two routes
 *   (WhatsApp, email; datasheet on wide screens).
 * - Near the end of the page — related parts, footer — the bar becomes a
 *   pop-up card with the same two routes, larger (owner call, 2026-11-19: the
 *   bottom of the page is where a reader who has read everything decides,
 *   and the old bar hid itself exactly there).
 * - Closing the pop-up drops back to the bar for the rest of the visit.
 *
 * Non-modal: it never traps focus or blocks the page, so it is a labelled
 * region, not a dialog. `data-bottom-dock` lets the call-back card lift
 * itself above whichever of the two is showing.
 */
export default function ProductStickyBar({
  title,
  sku,
  datasheetUrl,
  whatsappUrl,
  emailUrl,
}: Props) {
  const [phase, setPhase] = useState<Phase>('hidden')
  // A ref, not state: it only gates the next scroll update, and reading
  // sessionStorage lazily keeps it out of render.
  const dismissed = useRef<boolean | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (dismissed.current === null) {
        try {
          dismissed.current = window.sessionStorage.getItem(DISMISS_KEY) === '1'
        } catch {
          // Storage blocked: the pop-up simply shows again on the next page.
          dismissed.current = false
        }
      }
      const y = window.scrollY
      const footer = document.querySelector('body > footer, footer[role="contentinfo"], footer')
      const nearEnd = footer
        ? footer.getBoundingClientRect().top < window.innerHeight + POPUP_BEFORE_FOOTER_PX
        : y + window.innerHeight >= document.documentElement.scrollHeight - 900
      if (y < 600) setPhase('hidden')
      else if (nearEnd && !dismissed.current) setPhase('popup')
      else setPhase('bar')
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function dismiss() {
    dismissed.current = true
    setPhase('bar')
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore — dismissal still holds for this page view
    }
  }

  if (phase === 'hidden') return null

  if (phase === 'popup') {
    return (
      <section
        data-bottom-dock
        aria-label="Enquire about this part"
        className="border-ih-border bg-ih-surface fixed inset-x-3 bottom-3 z-30 rounded-[var(--radius-lg)] border p-4 shadow-[0_18px_48px_rgba(20,28,45,0.18)] motion-safe:animate-[ih-pop-in_180ms_ease-out] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] sm:p-5"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink absolute top-2 right-2 grid h-10 w-10 place-items-center rounded-full"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="text-ih-accent pr-10 text-[12px] font-semibold tracking-[0.08em] uppercase">
          Need a price or lead time?
        </p>
        <p className="text-ih-ink mt-1.5 pr-8 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
          Ask about <span className="line-clamp-2">{title}</span>
        </p>
        <p className="text-ih-muted mt-1 text-[12.5px]">
          Part <span className="tabular-nums">{sku}</span> · an engineer replies within working
          hours.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#16a34a] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppGlyph />
              WhatsApp us
            </a>
          ) : null}
          <a
            href={emailUrl}
            className={`border-ih-ink bg-ih-surface text-ih-ink hover:bg-ih-surface-2 inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-4 text-[14px] font-medium transition-colors ${
              whatsappUrl ? '' : 'sm:col-span-2'
            }`}
          >
            <MailGlyph />
            Email us
          </a>
        </div>
      </section>
    )
  }

  return (
    <div
      data-bottom-dock
      className="border-ih-border bg-ih-surface fixed right-0 bottom-0 left-0 z-30 border-t shadow-[0_-4px_20px_-8px_rgba(17,20,24,0.1)]"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-2.5 sm:gap-4 sm:px-8 sm:py-3 xl:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <b className="truncate text-[13.5px] font-semibold sm:text-[14px]">{title}</b>
          <span className="text-ih-muted hidden shrink-0 text-[12px] tabular-nums sm:inline">
            {sku}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          {datasheetUrl && (
            <a
              href={datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 hidden h-10 items-center rounded-[var(--radius-md)] border px-4 text-[13px] transition-colors md:flex"
            >
              ↓ Datasheet
            </a>
          )}
          <a
            href={emailUrl}
            aria-label="Enquire by email"
            className="border-ih-ink bg-ih-surface text-ih-ink hover:bg-ih-surface-2 flex h-10 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-[13px] font-medium transition-colors sm:px-4"
          >
            <MailGlyph />
            <span className="hidden sm:inline">Enquire</span>
          </a>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enquire on WhatsApp"
              className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[#16a34a] px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90 sm:px-4"
            >
              <WhatsAppGlyph />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.29A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  )
}

function MailGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  )
}
