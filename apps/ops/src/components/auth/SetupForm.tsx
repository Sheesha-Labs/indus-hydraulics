'use client'

import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import { useActionState, useState } from 'react'
import { confirmTotpSetup, finishTotpSetup } from '../../app/(auth)/sign-in/actions'
import CodeInput from './CodeInput'
import { keepFields } from './keep-fields'
import { TEXT, type SetupFormState } from './states'

/**
 * Authenticator setup: scan the QR (or type the key), confirm with the first code, then the ten
 * backup codes, shown once, with "I have saved these" before continuing. The codes live only in this
 * component's state: they are never stored in clear and never shown again.
 */
export default function SetupForm({ qr, manualKey }: { qr: string; manualKey: string }) {
  const [attempt, setAttempt] = useState(0)
  const [state, action, pending] = useActionState<SetupFormState, FormData>(
    async (previous, form) => {
      const result = await confirmTotpSetup(previous, form)
      setAttempt((n) => n + 1)
      return result
    },
    null
  )

  if (state?.status === 'done') {
    return (
      <form action={finishTotpSetup} className="flex flex-col gap-3.5">
        <Banner tone="ok" className="px-3 py-2.5 text-[12.5px]">
          Two-step verification is on. Save these backup codes now: each works once, and they are
          not shown again.
        </Banner>
        <ol
          aria-label="Backup codes"
          className="bg-io-paper border-io-line rounded-io-card grid grid-cols-2 gap-x-6 gap-y-1.5 border px-4 py-3 text-[14px] tabular-nums"
        >
          {state.backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ol>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          I have saved these
        </Button>
      </form>
    )
  }

  const message =
    state?.status === 'wrong_code'
      ? TEXT.wrongCode
      : state?.status === 'rate_limited'
        ? TEXT.codeRateLimited
        : state?.status === 'expired'
          ? 'This setup took too long. Start it again from Settings › Security.'
          : null

  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      className="flex flex-col gap-3.5"
      aria-busy={pending || undefined}
    >
      <ol className="text-io-ink-2 flex list-decimal flex-col gap-1 pl-5 text-[12.5px] leading-[1.45]">
        <li>Open your authenticator app and scan this code.</li>
        <li>Enter the six-digit code it shows.</li>
      </ol>
      {/* A data: URI of an SVG the server drew; the CSP allows data: images. */}
      <img
        src={qr}
        alt="QR code for your authenticator app"
        width={176}
        height={176}
        className="border-io-line rounded-io-card bg-io-card self-center border p-2"
      />
      <p className="text-io-ink-3 text-center text-[12px] leading-[1.45]">
        Can&apos;t scan it? Enter this key instead:
        <br />
        <span className="text-io-ink text-[13px] tracking-[0.04em] break-all">{manualKey}</span>
      </p>
      {message ? (
        <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
          <span id="setup-error">{message}</span>
        </Banner>
      ) : null}
      <CodeInput
        key={attempt}
        id="setup-code"
        label="Six-digit code from your authenticator app"
        describedBy={message ? 'setup-error' : undefined}
        invalid={!!message}
      />
      <Button type="submit" variant="primary" size="lg" busy={pending} className="w-full">
        Turn on two-step verification
      </Button>
    </form>
  )
}
