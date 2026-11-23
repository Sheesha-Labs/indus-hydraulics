'use client'

import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Modal } from '@indus/ops-ui/overlay'
import { ActivityFeed } from '@indus/ops-ui/timeline'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import {
  disconnectCountsAction,
  disconnectMailboxAction,
} from '../../app/(console)/settings/mailboxes/actions/disconnect'
import type { DisconnectCounts, DisconnectReceipt } from '../../server/gmail/disconnect'

/**
 * Board 90 · Disconnect (Overlay · Modal, the S07 confirm pattern). The consequence first, then the choice about
 * the data (keep, or delete with LIVE counts), then the address typed to confirm, which enables the destructive
 * Disconnect. After it runs, the modal shows the receipt as it was written to the log.
 */
const CONSEQUENCE: Record<string, string> = {
  client:
    'The Assistant stops reading and sending from this mailbox at once. Quotations, client replies and order documents will wait until another Client mailbox is connected.',
  supplier:
    'The Assistant stops reading and sending from this mailbox at once. Supplier RFQs, chasers and supplier POs will wait until another Supplier mailbox is connected.',
}
const READ_ONLY = 'The Assistant stops reading this mailbox at once.'

const fmt = (n: number) => n.toLocaleString('en-US')

export default function DisconnectModal({
  mailboxId,
  address,
  role,
}: {
  mailboxId: string
  address: string
  role: string
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'keep' | 'delete'>('keep')
  const [typed, setTyped] = useState('')
  const [counts, setCounts] = useState<DisconnectCounts | null>(null)
  const [receipt, setReceipt] = useState<DisconnectReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const inputId = useId()
  const name = useId()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setMode('keep')
      setTyped('')
      setError(null)
      setReceipt(null)
      setCounts(null)
      start(async () => {
        const res = await disconnectCountsAction({ mailboxId })
        if (res.success) setCounts(res.data)
      })
    } else if (receipt) {
      router.refresh()
    }
  }

  function disconnect() {
    setError(null)
    start(async () => {
      const res = await disconnectMailboxAction({ mailboxId, mode, typed })
      if (!res.success) {
        setError(res.error)
        return
      }
      setReceipt(res.data)
    })
  }

  const matches = typed.trim().toLowerCase() === address.toLowerCase()
  const c = counts
  const keepText =
    'Enquiries, supplier quotes and prices stay. Emails remain linked by reference only; opening one goes to Gmail.'
  const deleteText = c
    ? `Removes ${fmt(c.emails)} emails and ${fmt(c.attachments)} attachments from Indus Operations. Captured prices on ${fmt(c.supplierQuotes)} supplier quotes are deleted too. Gmail itself is not touched.`
    : 'Counting what was imported…'

  const choice = (value: 'keep' | 'delete', label: string, sub: string) => (
    <label
      data-state={mode === value ? 'on' : 'off'}
      className={cn(
        'rounded-io-card flex cursor-pointer items-start gap-3 border px-4 py-3.5',
        'has-[:focus-visible]:shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]',
        mode === value ? 'border-io-accent bg-io-accent-faint' : 'border-io-line bg-io-card'
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={mode === value}
        onChange={() => setMode(value)}
        className="border-io-stroke rounded-io-pill bg-io-card checked:border-io-accent m-0 mt-0.5 size-4 flex-none cursor-pointer appearance-none border checked:border-[5px]"
      />
      <span className="flex flex-col gap-1">
        <span
          className={cn(
            'text-[13.5px] font-medium',
            value === 'delete' ? 'text-io-bad' : 'text-io-ink'
          )}
        >
          {label}
        </span>
        <span className="text-io-ink-2 text-[12.5px] leading-[1.55]">{sub}</span>
      </span>
    </label>
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={receipt ? `${address} disconnected` : `Disconnect ${address}?`}
      tone="danger"
      width={560}
      trigger={<Button variant="danger">Disconnect</Button>}
      {...(receipt
        ? {
            note: 'Reconnecting the same mailbox later resumes from where it stopped; nothing is read twice.',
          }
        : {})}
      actions={
        receipt ? (
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              busy={pending}
              disabled={!matches || !counts}
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </>
        )
      }
    >
      {receipt ? (
        <ActivityFeed
          aria-label="Result in the Assistant log"
          items={[
            {
              key: receipt.at,
              time: new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Dubai',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).format(new Date(receipt.at)),
              dateTime: receipt.at,
              mark: 'person',
              text: (
                <span className="flex flex-col gap-1">
                  <span className="text-io-ink">{receipt.headline}</span>
                  <span className="text-io-ink-3">{receipt.detail}</span>
                </span>
              ),
            },
          ]}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="m-0">{CONSEQUENCE[role] ?? READ_ONLY}</p>
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="sr-only">What happens to what was imported</legend>
            {choice('keep', 'Keep what was imported', keepText)}
            {choice('delete', 'Delete everything imported from this mailbox', deleteText)}
          </fieldset>
          <label htmlFor={inputId} className="text-io-ink text-[12.5px]">
            Type <b className="font-medium">{address}</b> to confirm
          </label>
          <input
            id={inputId}
            value={typed}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setTyped(e.target.value)}
            className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn-lg bg-io-card text-io-ink w-full border px-3 text-[13px]"
          />
          {error ? (
            <p role="alert" className="text-io-bad m-0 text-[12.5px]">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </Modal>
  )
}
