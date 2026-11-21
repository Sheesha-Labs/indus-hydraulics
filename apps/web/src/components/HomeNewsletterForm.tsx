'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { NEWSLETTER_CONSENT } from '@indus/domain'
import { subscribeToNewsletter } from '../actions/newsletter'

// The consent sentence, with "privacy policy" as a link. The text itself is
// NEWSLETTER_CONSENT.text verbatim — the server stores that string as what
// the subscriber agreed to, so the two must never diverge.
const [CONSENT_BEFORE, CONSENT_AFTER] = NEWSLETTER_CONSENT.text.split('privacy policy')

type Props = {
  /**
   * `accent` — the homepage band: translucent white field, white button.
   * `navy` — the blog index's navy band: navy-2 field, accent Subscribe (the
   * page's one primary action), 40px controls that stack at 760px and below.
   * Focus outlines go steel here: the global accent outline is ~2:1 on navy.
   * The `!` is needed because the global :focus-visible rule is unlayered and
   * would otherwise beat any utility.
   */
  tone?: 'accent' | 'navy'
  /** Recorded on the subscriber row so sign-ups can be traced to a page. */
  source?: string
}

export default function HomeNewsletterForm({ tone = 'accent', source = 'homepage_footer' }: Props) {
  const [doneMsg, setDoneMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Stamped after hydration: the timing check treats a missing stamp as no
  // evidence, so a visitor whose JavaScript has not run is never refused.
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const emailId = useId()
  const navy = tone === 'navy'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData(e.currentTarget)
    fd.set('formStartedAt', String(startedAt.current))
    startTransition(async () => {
      const result = await subscribeToNewsletter(fd)
      if (result.success) {
        setDoneMsg(result.message)
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {doneMsg ? (
        <span role="status" className="text-[13.5px] font-medium text-white">
          {doneMsg}
        </span>
      ) : (
        <>
          {/* Honeypot — must stay empty. Off-screen rather than display:none,
              which form-filling bots recognise and skip; still out of the tab
              order and the accessibility tree. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[10000px] h-px w-px overflow-hidden"
            defaultValue=""
          />
          <input type="hidden" name="source" value={source} />
          <label htmlFor={emailId} className="sr-only">
            Work email
          </label>
          <div
            className={
              navy ? 'flex flex-col gap-2 min-[761px]:flex-row' : 'flex flex-col gap-2 sm:flex-row'
            }
          >
            <input
              id={emailId}
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={isPending}
              className={
                navy
                  ? 'bg-ih-navy-2 placeholder:text-ih-on-navy-placeholder focus:border-ih-steel focus-visible:outline-ih-steel! h-10 w-full min-w-0 rounded-md border border-white/20 px-3 text-[13.5px] text-white transition-[border-color] duration-150 disabled:opacity-50 motion-reduce:transition-none min-[761px]:flex-1'
                  : 'h-14 w-full min-w-0 shrink-0 rounded-md border border-white/40 bg-white/15 px-4 text-[15px] text-white backdrop-blur-sm transition-colors outline-none placeholder:text-white/60 focus:border-white focus:ring-[3px] focus:ring-white/25 disabled:opacity-50 sm:h-12 sm:flex-1 sm:text-[13.5px]'
              }
            />
            <button
              type="submit"
              disabled={isPending}
              className={
                navy
                  ? 'bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover focus-visible:outline-ih-steel! h-10 w-full shrink-0 rounded-md px-[18px] text-[13.5px] font-medium transition-colors duration-150 disabled:opacity-50 motion-reduce:transition-none min-[761px]:w-auto'
                  : 'text-ih-accent h-14 w-full shrink-0 rounded-md bg-white px-6 text-[14.5px] font-medium transition-colors hover:bg-white/90 disabled:opacity-50 sm:h-12 sm:w-auto'
              }
            >
              {isPending ? '...' : 'Subscribe'}
            </button>
          </div>
          {errorMsg && (
            <span role="alert" className="text-[12.5px] font-medium text-white">
              {errorMsg}
            </span>
          )}
          <span
            className={
              navy
                ? 'text-ih-on-navy-fine text-[11.5px] leading-[1.5]'
                : 'text-[12px] leading-[1.5] text-white/80'
            }
          >
            {CONSENT_BEFORE}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
              privacy policy
            </Link>
            {CONSENT_AFTER}
          </span>
        </>
      )}
    </form>
  )
}
