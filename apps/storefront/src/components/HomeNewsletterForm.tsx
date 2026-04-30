'use client'

import { useState } from 'react'

export default function HomeNewsletterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {submitted ? (
        <span className="font-mono text-[13px] text-[var(--color-accent)]">✓ Subscribed — check your inbox.</span>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 h-11 px-4 bg-[#15181d] border border-[#2a2e35] text-[var(--color-surface)] placeholder:text-[#8a8f97] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              className="h-11 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity shrink-0"
            >
              Subscribe
            </button>
          </div>
          <span className="font-mono text-[12px] text-[#8a8f97]">
            By subscribing you agree to our privacy policy. Unsubscribe in one click.
          </span>
        </>
      )}
    </form>
  )
}
