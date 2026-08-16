'use client'

import { useState, useTransition } from 'react'
import { subscribeToNewsletter } from '../actions/newsletter'

export default function HomeNewsletterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

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
          <input type="hidden" name="source" value="homepage_footer" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={isPending}
              className="h-12 w-full min-w-0 flex-1 rounded-md border border-white/35 bg-white/12 px-4 text-[13.5px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-white focus:ring-[3px] focus:ring-white/25 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-12 w-full shrink-0 rounded-md bg-white px-6 sm:w-auto text-[14.5px] font-medium text-ih-accent transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              {isPending ? '...' : 'Subscribe'}
            </button>
          </div>
          {errorMsg && (
            <span role="alert" className="text-[12.5px] font-medium text-white">
              {errorMsg}
            </span>
          )}
          <span className="font-mono text-[11px] text-white/70">
            By subscribing you agree to our privacy policy. Unsubscribe in one click.
          </span>
        </>
      )}
    </form>
  )
}
