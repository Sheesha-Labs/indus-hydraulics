'use client'

import { Button } from '@indus/ops-ui/controls'
import { useActionState, useState } from 'react'
import { acceptInviteWithPasswordAction } from '../../app/(auth)/sign-in/actions'
import AuthField from './AuthField'
import { keepFields } from './keep-fields'
import type { InviteFormState } from './states'

/**
 * Accept invitation · Set a password (board 77): one field, "At least 12 characters", Create account.
 * The authenticator comes next (/sign-in/two-factor/setup); the first session only after it.
 */
export default function InviteAcceptForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [state, action, pending] = useActionState<InviteFormState, FormData>(
    acceptInviteWithPasswordAction,
    null
  )
  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      className="flex flex-col gap-3.5"
      aria-busy={pending || undefined}
    >
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-2">
        <AuthField
          id="invite-password"
          label="Set a password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          placeholder="At least 12 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state?.status === 'password' ? state.message : undefined}
          aria-describedby="invite-password-hint"
        />
        <span id="invite-password-hint" className="text-io-ink-3 text-[11.5px] leading-[1.45]">
          Then you add an authenticator app: password sign-in always asks for its code.
        </span>
      </div>
      <Button type="submit" size="lg" busy={pending} className="w-full text-[14px]">
        Create account
      </Button>
    </form>
  )
}
