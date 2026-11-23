'use client'

import { Button, Checkbox, RadioGroup, Segmented } from '@indus/ops-ui/controls'
import { Modal } from '@indus/ops-ui/overlay'
import { Banner, Check, Chip } from '@indus/ops-ui/status'
import { WizardSteps } from '@indus/ops-ui/timeline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  confirmMailboxConnectAction,
  startMailboxConnectAction,
} from '../../app/(console)/settings/mailboxes/actions/connect'
import {
  adminTrustInstructions,
  CONNECT_STEPS,
  defaultAddress,
  ROLE_OPTIONS,
  WILL,
  WILL_NEVER,
  type ConnectRoleOption,
} from '../../lib/gmail-connect-copy'
import AuthField from '../auth/AuthField'

/**
 * Board 86 · Connect flow: one Modal stepping through the five steps (role, consent explainer, Google, back in
 * the console, success) and the three error states (wrong account, partial grant, blocked by the Workspace
 * admin). Step 3 is Google's own screen: the modal hands over with a full-page navigation and the callback
 * route brings the person back to step 4 (or an error) through the URL. One primary per step.
 */
export type ConnectRole = ConnectRoleOption['value']
export type ConnectOutcome =
  | 'connected'
  | 'drafts_only'
  | 'wrong_account'
  | 'blocked_by_admin'
  | 'denied'
  | 'expired'
  | 'not_configured'
  | 'error'

export type ConnectedMailboxView = {
  id: string
  address: string
  role: ConnectRole
  grantedEmail: string | null
  canSend: boolean
  signatureLines: string[]
  aliases: string[]
}

export type ConnectMailboxModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where Google sends the person back to. */
  returnTo: 'settings' | 'setup'
  domain: string
  dataLocation: string
  ownerName: string
  /** Roles this person may connect (a Helper: Supplier only, with the flag). */
  allowedRoles: readonly ConnectRole[]
  initial?: {
    step?: 1 | 2 | 4 | 5
    role?: ConnectRole
    address?: string
    outcome?: ConnectOutcome
    mailbox?: ConnectedMailboxView | null
  }
}

const MONTHS = [
  { value: '0', label: 'None' },
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
] as const

function shortAddress(address: string): string {
  return `${address.split('@')[0] ?? address}@`
}

export default function ConnectMailboxModal(props: ConnectMailboxModalProps) {
  const router = useRouter()
  const init = props.initial ?? {}
  const firstRole = init.role ?? props.allowedRoles[0] ?? 'client'
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(init.step ?? 1)
  const [role, setRole] = useState<ConnectRole>(firstRole)
  const [address, setAddress] = useState(init.address ?? defaultAddress(firstRole, props.domain))
  const [outcome, setOutcome] = useState<ConnectOutcome | undefined>(init.outcome)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState<'0' | '12' | '24'>('12')
  const [aliases, setAliases] = useState<string[]>(init.mailbox?.aliases ?? [])
  const [copied, setCopied] = useState(false)
  const [pending, start] = useTransition()
  const mailbox = init.mailbox ?? null

  const errorOutcome =
    outcome && outcome !== 'connected' && !(outcome === 'drafts_only' && step >= 4)
      ? outcome
      : undefined

  function goToGoogle(nextRole = role, nextAddress = address) {
    setError(null)
    start(async () => {
      const res = await startMailboxConnectAction({
        role: nextRole,
        address: nextAddress,
        returnTo: props.returnTo,
      })
      if (!res.success) {
        setError(res.fieldErrors?.address ?? res.error)
        return
      }
      setStep(3)
      window.location.assign(res.data.url)
    })
  }

  function restart(nextRole: ConnectRole, nextStep: 1 | 2) {
    setOutcome(undefined)
    setRole(nextRole)
    setAddress(nextRole === role ? address : defaultAddress(nextRole, props.domain))
    setStep(nextStep)
  }

  function confirm() {
    if (!mailbox) return
    setError(null)
    start(async () => {
      const res = await confirmMailboxConnectAction({
        mailboxId: mailbox.id,
        backfillMonths: Number(months) as 0 | 12 | 24,
        aliases,
      })
      if (!res.success) {
        setError(res.error)
        return
      }
      setStep(5)
      router.refresh()
    })
  }

  // ── Error states ────────────────────────────────────────────────────────────────────────────
  if (errorOutcome) {
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? 'mailbox'
    const blocks: Record<
      ConnectOutcome,
      { title: string; body: React.ReactNode; actions: React.ReactNode }
    > = {
      wrong_account: {
        title: 'Wrong account',
        body: (
          <Banner tone="warn" icon="warn">
            You signed in with a different Google account. This role expects {address} on @
            {props.domain}.
          </Banner>
        ),
        actions: (
          <>
            <Button variant="secondary" onClick={() => restart('personal', 1)} disabled={pending}>
              Connect as Personal instead
            </Button>
            <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
              Choose another account
            </Button>
          </>
        ),
      },
      drafts_only: {
        title: 'Permission partly granted',
        body: (
          <div className="flex flex-col gap-3">
            <Banner tone="warn" icon="warn">
              The “Send email on your behalf” box was not ticked. The Assistant can read and draft,
              but not send.
            </Banner>
            <div className="border-io-line rounded-io-ctl flex items-center justify-between border px-3 py-2.5 text-[12.5px]">
              <span className="text-io-ink-2">Mailbox card shows</span>
              <Chip tone="warn" label="Drafts only · can’t send" />
            </div>
          </div>
        ),
        actions: (
          <>
            <Button variant="secondary" onClick={() => setStep(4)} disabled={pending || !mailbox}>
              Continue with drafts only
            </Button>
            <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
              Grant send permission
            </Button>
          </>
        ),
      },
      blocked_by_admin: {
        title: 'Blocked by Workspace admin',
        body: (
          <div className="flex flex-col gap-3">
            <Banner tone="bad" icon="bad">
              {props.domain}’s Google Workspace admin has not allowed Indus Operations.
            </Banner>
            <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.5]">
              The admin for this domain is {props.ownerName}. In the Google Admin console: Security
              › API controls › App access control › add Indus Operations as Trusted, then try again.
            </p>
          </div>
        ),
        actions: (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(adminTrustInstructions(props.domain))
                  .then(() => setCopied(true))
              }}
            >
              {copied ? 'Copied' : 'Copy instructions'}
            </Button>
            <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
              Try again
            </Button>
          </>
        ),
      },
      denied: {
        title: 'Google access not granted',
        body: (
          <Banner tone="warn" icon="warn">
            Google did not grant access to {roleLabel.toLowerCase()} {address}. Nothing was
            connected.
          </Banner>
        ),
        actions: (
          <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
            Try again
          </Button>
        ),
      },
      expired: {
        title: 'That sign-in expired',
        body: (
          <Banner tone="warn" icon="warn">
            The Google sign-in took longer than 10 minutes or was already used. Start again; nothing
            was connected.
          </Banner>
        ),
        actions: (
          <Button variant="primary" onClick={() => restart(role, 1)}>
            Start again
          </Button>
        ),
      },
      not_configured: {
        title: 'Mailboxes are not set up yet',
        body: (
          <Banner tone="bad" icon="bad">
            Google sign-in for mailboxes is not configured on this server. See the Gmail setup
            runbook.
          </Banner>
        ),
        actions: (
          <Button variant="primary" onClick={() => props.onOpenChange(false)}>
            Close
          </Button>
        ),
      },
      error: {
        title: 'Something went wrong',
        body: (
          <Banner tone="bad" icon="bad">
            Google answered in a way Indus Operations did not expect. Nothing was connected. Try
            again.
          </Banner>
        ),
        actions: (
          <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
            Try again
          </Button>
        ),
      },
      connected: { title: '', body: null, actions: null },
    }
    const b = blocks[errorOutcome]
    return (
      <Modal
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={b.title}
        width={560}
        actions={b.actions}
      >
        <div data-connect-state={errorOutcome} className="flex flex-col gap-3">
          {b.body}
          {error ? (
            <Banner tone="bad" icon="bad">
              {error}
            </Banner>
          ) : null}
        </div>
      </Modal>
    )
  }

  // ── Steps ───────────────────────────────────────────────────────────────────────────────────
  const titles = {
    1: 'Connect a mailbox',
    2: 'What Indus Operations will do with this mailbox',
    3: 'Opening Google…',
    4: `Connected as ${shortAddress(mailbox?.address ?? address)}`,
    5: 'Reading mail now',
  } as const

  const actions =
    step === 1 ? (
      <Button variant="primary" onClick={() => setStep(2)} disabled={!address.includes('@')}>
        Next
      </Button>
    ) : step === 2 ? (
      <>
        <Button variant="secondary" onClick={() => setStep(1)} disabled={pending}>
          Back
        </Button>
        <Button variant="primary" onClick={() => goToGoogle()} busy={pending}>
          Continue to Google
        </Button>
      </>
    ) : step === 3 ? (
      <Button variant="primary" busy>
        Continue to Google
      </Button>
    ) : step === 4 ? (
      <Button variant="primary" onClick={confirm} busy={pending} disabled={!mailbox}>
        Start reading
      </Button>
    ) : (
      <Button
        variant="secondary"
        onClick={() => {
          props.onOpenChange(false)
          router.replace(props.returnTo === 'setup' ? '/setup/mailboxes' : '/settings/mailboxes')
        }}
      >
        {props.returnTo === 'setup' ? 'Back to setup' : 'Back to Mailboxes'}
      </Button>
    )

  return (
    <Modal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={titles[step]}
      width={560}
      actions={actions}
    >
      <div data-connect-step={step} className="flex flex-col gap-4">
        <WizardSteps steps={CONNECT_STEPS} current={step - 1} />

        {step === 1 ? (
          <div className="flex flex-col gap-3">
            <RadioGroup
              name="mailbox-role"
              legend="Choose a role"
              options={ROLE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
                sub: o.sub,
                disabled: !props.allowedRoles.includes(o.value),
              }))}
              value={role}
              onValueChange={(v) => {
                setRole(v)
                setAddress(defaultAddress(v, props.domain) || address)
              }}
            />
            <AuthField
              id="connect-address"
              label="Mailbox address"
              type="email"
              autoComplete="off"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              hint={
                role === 'client' || role === 'supplier'
                  ? `Sign in to Google as this address. Client and Supplier mailboxes are on @${props.domain}.`
                  : 'Sign in to Google as this address.'
              }
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="io-eyebrow">Will</span>
              {WILL.map((w) => (
                <Check key={w} mark="ok" label={w} />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="io-eyebrow">Will never</span>
              {WILL_NEVER.map((w) => (
                <Check key={w} mark="bad" label={w} />
              ))}
            </div>
            <p className="text-io-ink-3 m-0 text-[12px] leading-[1.5]">{props.dataLocation}</p>
          </div>
        ) : null}

        {step === 3 ? (
          <p className="text-io-ink-2 m-0 text-[13px]">
            Google’s consent screen opens next. Choose {address}, tick every box, and Google brings
            you back here.
          </p>
        ) : null}

        {step === 4 && mailbox ? (
          <div className="flex flex-col gap-3">
            <Check mark="ok" label={`Connected as ${shortAddress(mailbox.address)}`} />
            {!mailbox.canSend ? <Chip tone="warn" label="Drafts only · can’t send" /> : null}
            <div className="flex flex-col gap-1.5">
              <span className="io-eyebrow">Signature detected</span>
              {mailbox.signatureLines.length ? (
                <div className="border-io-line rounded-io-ctl text-io-ink border px-3 py-2.5 text-[12.5px] leading-[1.55]">
                  {mailbox.signatureLines.map((line, i) => (
                    <div key={`${i}-${line}`}>{line}</div>
                  ))}
                </div>
              ) : (
                <p className="text-io-ink-3 m-0 text-[12.5px]">
                  No Gmail signature found. Add one in Settings › Sending.
                </p>
              )}
              <Link href="/settings/sending" className="io-focus text-io-accent text-[12.5px]">
                Edit signature
              </Link>
            </div>
            {mailbox.aliases.length ? (
              <div className="flex flex-col gap-1.5">
                <span className="io-eyebrow">Send-as aliases</span>
                {mailbox.aliases.map((a) => (
                  <Checkbox
                    key={a}
                    label={a}
                    checked={a === mailbox.address || aliases.includes(a)}
                    {...(a === mailbox.address
                      ? { locked: { reason: 'The mailbox’s own address is always used.' } }
                      : {})}
                    onChange={(e) => {
                      const on = e.currentTarget.checked
                      setAliases((list) =>
                        on ? [...new Set([...list, a])] : list.filter((x) => x !== a)
                      )
                    }}
                  />
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <span className="io-eyebrow">Read past mail</span>
              <Segmented<'0' | '12' | '24'>
                options={MONTHS.map((m) => ({ value: m.value, label: m.label }))}
                value={months}
                onValueChange={(v) => setMonths(v)}
                aria-label="Read past mail"
              />
              <p className="text-io-ink-3 m-0 text-[12px]">
                Past mail builds supplier and client history.
              </p>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Check mark="ok" size="lg" label="Connected" />
            <p className="text-io-ink-2 m-0 text-[13px] leading-[1.5]">
              First results in about 10 minutes.{' '}
              {months === '0'
                ? 'Only new mail is read.'
                : `${months} months of past mail are read in the background; Settings › Mailboxes shows a live estimate.`}
            </p>
          </div>
        ) : null}

        {error ? (
          <Banner tone="bad" icon="bad">
            {error}
          </Banner>
        ) : null}
      </div>
    </Modal>
  )
}
