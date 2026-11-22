'use client'

import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import { useActionState, useState } from 'react'
import { verifySecondFactor } from '../../app/(auth)/sign-in/actions'
import AuthField from './AuthField'
import { keepFields } from './keep-fields'
import CodeInput from './CodeInput'
import { TEXT, type TwoFactorFormState } from './states'

/**
 * Board 77 "2FA code": the six-digit code, or "Use a backup code". Submits to the server action,
 * which calls signIn('ops-password') with the sealed pending value; a wrong code comes back here,
 * a lock or a timeout goes back to /sign-in with its state.
 */
export default function TwoFactorForm() {
  const [method, setMethod] = useState<'code' | 'backup'>('code')
  // A new key per attempt remounts the code boxes empty after a wrong code.
  const [attempt, setAttempt] = useState(0)
  const [state, action, pending] = useActionState<TwoFactorFormState, FormData>(
    async (previous, form) => {
      const result = await verifySecondFactor(previous, form)
      setAttempt((n) => n + 1)
      return result
    },
    null
  )
  const message =
    state?.status === 'wrong_code'
      ? method === 'backup'
        ? TEXT.wrongBackupCode
        : TEXT.wrongCode
      : state?.status === 'rate_limited'
        ? TEXT.codeRateLimited
        : null

  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      className="flex flex-col gap-3.5"
      aria-busy={pending || undefined}
    >
      <input type="hidden" name="method" value={method} />
      {message ? (
        <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
          <span id="two-factor-error">{message}</span>
        </Banner>
      ) : null}
      {method === 'code' ? (
        <CodeInput
          key={attempt}
          id="two-factor-code"
          label="Six-digit code from your authenticator app"
          describedBy={message ? 'two-factor-error' : undefined}
          invalid={!!message}
        />
      ) : (
        <AuthField
          key={attempt}
          id="two-factor-backup"
          label="Backup code"
          name="backupCode"
          autoComplete="off"
          spellCheck={false}
          placeholder="xxxx-xxxx"
          required
          hint="Each backup code works once."
        />
      )}
      <Button type="submit" variant="primary" size="lg" busy={pending} className="w-full">
        Continue
      </Button>
      <button
        type="button"
        onClick={() => setMethod(method === 'code' ? 'backup' : 'code')}
        className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover cursor-pointer self-center text-[12px]"
      >
        {method === 'code' ? 'Use a backup code' : 'Use the authenticator code'}
      </button>
    </form>
  )
}
