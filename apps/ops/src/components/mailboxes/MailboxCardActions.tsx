'use client'

import { Button, RadioGroup, Select } from '@indus/ops-ui/controls'
import { Menu, Modal, useToast } from '@indus/ops-ui/overlay'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { undoOutboundAction } from '../../actions/outbound'
import {
  pauseMailboxReadingAction,
  resumeMailboxReadingAction,
  sendTestEmailAction,
} from '../../app/(console)/settings/mailboxes/actions/mailbox'

/**
 * Board 85 card foot: Pause reading / Resume reading, Reconnect (the board 86 flow, passed in as `reconnect`),
 * Disconnect (board 90, S04-T08, passed in as `disconnect`), and for the Owner an overflow with "Send a test
 * email…" (a diagnostic not drawn on the board): it queues one email through the real send queue and shows the
 * server's Undo countdown.
 */
export default function MailboxCardActions({
  mailboxId,
  address,
  paused,
  canManage,
  testAddresses,
  reconnect,
  disconnect,
}: {
  mailboxId: string
  address: string
  paused: boolean
  canManage: boolean
  testAddresses: string[]
  reconnect: ReactNode
  disconnect: ReactNode
}) {
  const [pending, start] = useTransition()
  const [testOpen, setTestOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  function togglePause() {
    start(async () => {
      const res = paused
        ? await resumeMailboxReadingAction({ mailboxId })
        : await pauseMailboxReadingAction({ mailboxId })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      toast({
        kind: 'success',
        title: paused
          ? `Reading ${address} again. It catches up from where it stopped.`
          : `Reading paused for ${address}. Mail keeps arriving in Gmail; nothing is lost.`,
      })
      router.refresh()
    })
  }

  return (
    <div className="border-io-line flex items-center gap-2 border-t px-4.5 py-3">
      {canManage ? (
        <Button variant="secondary" busy={pending} onClick={togglePause}>
          {paused ? 'Resume reading' : 'Pause reading'}
        </Button>
      ) : null}
      {reconnect}
      <span className="ml-auto flex items-center gap-2">
        {canManage ? (
          <Menu
            align="end"
            trigger={
              <Button variant="ghost" aria-label={`More for ${address}`} icon={MoreHorizontal} />
            }
            items={[
              { type: 'item', label: 'Send a test email…', onSelect: () => setTestOpen(true) },
            ]}
          />
        ) : null}
        {disconnect}
      </span>
      {canManage ? (
        <TestEmailModal
          open={testOpen}
          onOpenChange={setTestOpen}
          mailboxId={mailboxId}
          address={address}
          addresses={testAddresses}
          onQueued={(outboundId, remainingMs) =>
            toast({
              kind: 'success',
              title: `Test email queued from ${address}.`,
              undo: {
                remainingMs,
                onUndo: async () => undoOutboundAction({ outboundId }),
              },
            })
          }
        />
      ) : null}
    </div>
  )
}

function TestEmailModal({
  open,
  onOpenChange,
  mailboxId,
  address,
  addresses,
  onQueued,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailboxId: string
  address: string
  addresses: string[]
  onQueued: (outboundId: string, remainingMs: number) => void
}) {
  const [to, setTo] = useState(addresses[0] ?? '')
  const [mode, setMode] = useState<'reply' | 'new'>('reply')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function send() {
    setError(null)
    start(async () => {
      const res = await sendTestEmailAction({ mailboxId, to, mode })
      if (!res.success) {
        setError(res.error)
        return
      }
      onOpenChange(false)
      onQueued(res.data.outboundId, res.data.undoRemainingMs)
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Send a test email"
      note="It waits for the undo delay and the send window like every email."
      actions={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" busy={pending} disabled={!to} onClick={send}>
            Send test
          </Button>
        </>
      }
    >
      {addresses.length ? (
        <div className="flex flex-col gap-4">
          <p className="m-0">
            One email from {address} to an internal address, through the same queue as every send.
          </p>
          <Select
            size="md"
            inlineLabel="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            options={addresses.map((a) => ({ value: a, label: a }))}
          />
          <RadioGroup
            name="test-mode"
            legend="Thread"
            value={mode}
            onValueChange={setMode}
            options={[
              { value: 'reply', label: 'Reply in the latest thread with this address' },
              { value: 'new', label: 'New thread' },
            ]}
          />
          {error ? (
            <p role="alert" className="text-io-bad m-0 text-[12.5px]">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="m-0">
          No test addresses yet. Add internal addresses under{' '}
          <Link href="/settings/sending#test-addresses" className="io-focus text-io-accent">
            Settings › Sending
          </Link>{' '}
          first.
        </p>
      )}
    </Modal>
  )
}
