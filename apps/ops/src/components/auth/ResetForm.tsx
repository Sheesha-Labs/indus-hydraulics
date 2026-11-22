'use client'

import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Banner } from '@indus/ops-ui/status'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { resetPassword } from '../../app/(auth)/sign-in/actions'
import AuthField from './AuthField'
import { keepFields } from './keep-fields'
import { TEXT, type ResetFormState } from './states'
import { roughStrength } from './strength'

/** Board 77 "Set new password": new password with a meter, the authenticator code, Save and sign in. */
export default function ResetForm({ token, needsCode }: { token: string; needsCode: boolean }) {
  const [password, setPassword] = useState('')
  const [state, action, pending] = useActionState<ResetFormState, FormData>(resetPassword, null)
  const strength = roughStrength(password)
  const passwordError = state?.status === 'password' ? state.message : undefined
  const codeError = state?.status === 'code' ? TEXT.wrongCode : undefined
  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      className="flex flex-col gap-3.5"
      aria-busy={pending || undefined}
    >
      <input type="hidden" name="token" value={token} />
      {state?.status === 'locked' ? (
        <div className="flex flex-col gap-3">
          <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
            {TEXT.locked(state.minutes)}
          </Banner>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <AuthField
          id="reset-password"
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          aria-describedby="reset-password-hint"
        />
        <div aria-hidden="true" className="flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={cn(
                'rounded-io-tag h-1 flex-1',
                n <= strength
                  ? strength >= 3
                    ? 'bg-io-ok-solid'
                    : strength === 2
                      ? 'bg-io-warn-solid'
                      : 'bg-io-bad-solid'
                  : 'bg-io-line'
              )}
            />
          ))}
        </div>
        <span id="reset-password-hint" className="text-io-ink-3 text-[11.5px] leading-[1.45]">
          12+ characters · not used before · strong
        </span>
      </div>
      {needsCode ? (
        <AuthField
          id="reset-code"
          label="Authenticator code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          error={codeError}
        />
      ) : null}
      <Button type="submit" variant="primary" size="lg" busy={pending} className="w-full">
        {needsCode ? 'Save and sign in' : 'Save password'}
      </Button>
      <Link
        href="/sign-in"
        className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover self-center text-[12.5px]"
      >
        Back to sign in
      </Link>
    </form>
  )
}
