'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function AdminSignInForm({ locale }: { locale: string }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', { email, password, redirect: false })

    if (!result?.ok) {
      setError('Invalid email or password.')
      setPending(false)
      return
    }

    // Full page navigation so the session cookie is included in the request
    window.location.href = `/${locale}`
  }

  const inputCls =
    'h-10 w-full border border-[#2a2e35] bg-[#0e1013] px-3 text-sm text-[#f0ece3] placeholder:text-[#3a3f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.16_45)] transition-colors'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="px-4 py-3 text-sm text-[oklch(0.65_0.18_25)] border border-[oklch(0.4_0.18_25)] bg-[oklch(0.15_0.04_25)]"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[#9aa0a8]">Work email</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@indushydraulics.com"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[#9aa0a8]">Password</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 bg-[oklch(0.62_0.16_45)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
      >
        {pending ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  )
}
