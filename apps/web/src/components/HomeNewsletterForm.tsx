'use client'

import { useId, useState, useTransition } from 'react'
import { subscribeToNewsletter } from '../actions/newsletter'

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
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const emailId = useId()
  const navy = tone === 'navy'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await subscribeToNewsletter(fd)
      if (result.success) {
        setSubmitted(true)
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {submitted ? (
        <span className="text-[13.5px] font-medium text-white">Subscribed — check your inbox.</span>
      ) : (
        <>
          {/* Honeypot — must stay empty. Hidden from sighted users + screen readers. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            defaultValue=""
          />
          <input type="hidden" name="source" value={source} />
          <label htmlFor={emailId} className="sr-only">
            Work email
          </label>
          <div className={navy ? 'flex flex-col gap-2 min-[761px]:flex-row' : 'flex flex-col gap-2 sm:flex-row'}>
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
                  ? 'h-10 w-full min-w-0 rounded-md border border-white/20 bg-ih-navy-2 px-3 text-[13.5px] text-white transition-[border-color] duration-150 placeholder:text-ih-on-navy-placeholder focus:border-ih-steel focus-visible:outline-ih-steel! disabled:opacity-50 motion-reduce:transition-none min-[761px]:flex-1'
                  : 'h-12 w-full min-w-0 flex-1 rounded-md border border-white/35 bg-white/12 px-4 text-[13.5px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-white focus:ring-[3px] focus:ring-white/25 disabled:opacity-50'
              }
            />
            <button
              type="submit"
              disabled={isPending}
              className={
                navy
                  ? 'h-10 w-full shrink-0 rounded-md bg-ih-accent px-[18px] text-[13.5px] font-medium text-ih-accent-fg transition-colors duration-150 hover:bg-ih-accent-hover focus-visible:outline-ih-steel! disabled:opacity-50 motion-reduce:transition-none min-[761px]:w-auto'
                  : 'h-12 w-full shrink-0 rounded-md bg-white px-6 sm:w-auto text-[14.5px] font-medium text-ih-accent transition-colors hover:bg-white/90 disabled:opacity-50'
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
              navy ? 'text-[11.5px] leading-[1.5] text-ih-on-navy-fine' : 'font-mono text-[11px] text-white/70'
            }
          >
            By subscribing you agree to our privacy policy. Unsubscribe in one click.
          </span>
        </>
      )}
    </form>
  )
}
