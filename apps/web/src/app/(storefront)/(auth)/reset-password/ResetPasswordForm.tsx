'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { resetPasswordAction } from '../../../../actions/auth'
import { Input } from '@indus/ui'

type Props = {
  token: string
}

export default function ResetPasswordForm({ token }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')

  function handleSubmit(formData: FormData) {
    setError(null)
    if (pw !== confirm) {
      setError('The two passwords don’t match.')
      return
    }
    startTransition(async () => {
      const r = await resetPasswordAction(formData)
      if (r.success) {
        setDone(true)
      } else {
        setError(r.error)
      }
    })
  }

  if (done) {
    return (
      <div className="border border-[oklch(0.85_0.13_145)] bg-[oklch(0.97_0.04_145)] p-5">
        <h2 className="text-[16px] font-semibold text-[oklch(0.35_0.12_145)] mb-1.5">Password updated</h2>
        <p className="text-[13px] text-[oklch(0.4_0.08_145)] mb-4">
          You can now sign in with your new password.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center h-10 px-4 bg-ih-navy text-white font-mono text-[12px] hover:opacity-90"
        >
          Sign in →
        </Link>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="reset-password" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          New password
        </label>
        <Input
          id="reset-password"
          type="password"
          name="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="reset-confirm" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Confirm new password
        </label>
        <Input
          id="reset-confirm"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error ? (
        <div className="text-[12px] text-[oklch(0.5_0.18_25)] font-mono" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || pw.length < 10 || confirm.length < 10}
        className="h-10 w-full bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Updating…' : 'Set new password →'}
      </button>

      <p className="text-[12px] text-ih-muted pt-2">
        <Link href="/sign-in" className="hover:text-ih-ink">
          ← Back to sign in
        </Link>
      </p>
    </form>
  )
}
