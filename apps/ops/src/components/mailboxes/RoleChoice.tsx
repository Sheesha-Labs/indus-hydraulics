'use client'

import { useToast } from '@indus/ops-ui/overlay'
import { cn } from '@indus/ops-ui/lib/cn'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { setMailboxRoleAction } from '../../app/(console)/settings/mailboxes/actions/mailbox'
import { ROLE_CARDS, type MailboxRoleValue } from '../../lib/mailbox-card-copy'

/**
 * Board 85 "Role": four option cards (Client / Supplier / Read-only / Personal) with their one-line meaning. A
 * native radio group (arrow keys move, one tab stop), saved as soon as it changes; the Owner only.
 */
export default function RoleChoice({
  mailboxId,
  address,
  value,
  disabled,
}: {
  mailboxId: string
  address: string
  value: MailboxRoleValue
  disabled: boolean
}) {
  const name = useId()
  const [role, setRole] = useState(value)
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function choose(next: MailboxRoleValue) {
    const before = role
    setRole(next)
    start(async () => {
      const res = await setMailboxRoleAction({ mailboxId, role: next })
      if (!res.success) {
        setRole(before)
        toast({ kind: 'error', title: res.error })
        return
      }
      const label = ROLE_CARDS.find((r) => r.value === next)?.label ?? next
      toast({
        kind: 'success',
        title: res.data.sendTurnedOff
          ? `${address} is now ${label}. Send is off: this role never sends.`
          : `${address} is now ${label}.`,
      })
      router.refresh()
    })
  }

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" aria-busy={pending || undefined}>
      <legend className="io-eyebrow mb-2 p-0">Role</legend>
      <div className="grid grid-cols-4 gap-2">
        {ROLE_CARDS.map((r) => {
          const on = r.value === role
          return (
            <label
              key={r.value}
              data-state={on ? 'on' : 'off'}
              className={cn(
                'rounded-io-ctl relative flex min-h-[96px] cursor-pointer flex-col gap-1 border px-2.5 py-2 text-[12.5px] leading-[1.45]',
                'has-[:focus-visible]:shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]',
                on
                  ? 'border-io-accent bg-io-accent-faint shadow-[0_0_0_1px_var(--io-accent)]'
                  : 'border-io-line bg-io-card hover:border-io-stroke',
                disabled && 'cursor-default'
              )}
            >
              <input
                type="radio"
                name={name}
                value={r.value}
                checked={on}
                disabled={disabled || pending}
                onChange={() => choose(r.value)}
                className="peer absolute size-px opacity-0"
              />
              <span className="text-io-ink font-medium">{r.label}</span>
              <span className="text-io-ink-3 text-[11.5px]">{r.sub}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
