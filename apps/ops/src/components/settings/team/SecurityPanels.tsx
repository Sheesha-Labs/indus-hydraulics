'use client'

import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  changePasswordAction,
  regenerateBackupCodesAction,
} from '../../../app/(console)/settings/team/actions/sessions'
import AuthField from '../../auth/AuthField'

/**
 * The two Security panels that open after a recent sign-in (`?security=password|backup-codes`):
 * set or change the password, and replace the backup codes. The server re-checks the 10-minute window
 * on save; these only collect input and show the outcome.
 */
export function PasswordPanel({ hasPassword, totpOn }: { hasPassword: boolean; totpOn: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [pending, start] = useTransition()

  if (saved !== null) {
    return (
      <Banner tone="ok" className="px-3 py-2.5 text-[12.5px]">
        {`Password saved.${saved > 0 ? ` ${saved === 1 ? 'Your other device was' : `${saved} other devices were`} signed out.` : ''}${totpOn ? '' : ' Password sign-in also needs the authenticator: set it up above.'}`}
      </Banner>
    )
  }

  return (
    <form
      className="flex flex-col gap-2.5"
      aria-busy={pending || undefined}
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const result = await changePasswordAction({ password })
          if (result.success) {
            setSaved(result.data.signedOut)
            setPassword('')
            router.refresh()
          } else {
            setError(result.fieldErrors?.password ?? result.error)
          }
        })
      }}
    >
      <AuthField
        id="security-new-password"
        label={hasPassword ? 'New password' : 'Password'}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={12}
        required
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError(null)
        }}
        error={error ?? undefined}
        hint="12+ characters · not used before · strong. Saving signs out your other devices."
      />
      <Button type="submit" size="sm" variant="secondary" busy={pending} className="self-start">
        Save password
      </Button>
    </form>
  )
}

export function BackupCodesPanel() {
  const router = useRouter()
  const [codes, setCodes] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (codes) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-io-ink-2 m-0 text-[12px] leading-[1.5]">
          Your new backup codes. Each works once; the old ones no longer work. Save them now: they
          are not shown again.
        </p>
        <ul
          aria-label="Backup codes"
          className="bg-io-fill rounded-io-ctl m-0 grid list-none grid-cols-2 gap-x-4 gap-y-1 px-3 py-2.5 text-[13px] tabular-nums"
        >
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-io-ink-2 m-0 text-[12px] leading-[1.5]">
        Ten new codes replace every code you have now.
      </p>
      {error ? (
        <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
          {error}
        </Banner>
      ) : null}
      <Button
        size="sm"
        variant="secondary"
        busy={pending}
        className="self-start"
        onClick={() =>
          start(async () => {
            const result = await regenerateBackupCodesAction({})
            if (result.success) {
              setCodes(result.data.codes)
              router.refresh()
            } else {
              setError(result.error)
            }
          })
        }
      >
        Replace my backup codes
      </Button>
    </div>
  )
}
