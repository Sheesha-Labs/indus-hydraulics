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
        <span className="font-mono text-[13px] text-[var(--color-accent)]">✓ Subscribed — check your inbox.</span>
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
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={isPending}
              className="flex-1 h-11 px-4 bg-[#15181d] border border-[#2a2e35] text-[var(--color-surface)] placeholder:text-[#8a8f97] text-[13px] focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-11 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
            >
              {isPending ? '...' : 'Subscribe'}
            </button>
          </div>
          {errorMsg && (
            <span role="alert" className="font-mono text-[12px] text-[var(--color-status-danger,#dc2626)]">
              {errorMsg}
            </span>
          )}
          <span className="font-mono text-[12px] text-[#8a8f97]">
            By subscribing you agree to our privacy policy. Unsubscribe in one click.
          </span>
        </>
      )}
    </form>
  )
}
