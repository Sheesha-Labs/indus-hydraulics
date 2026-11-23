'use client'

import { Button, RadioGroup, Select, Toggle } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { SignoffTag } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type ReactNode } from 'react'
import { updateSettingAction } from '../../actions/settings'
import {
  saveDailyCapsAction,
  saveSendPolicyAction,
} from '../../app/(console)/settings/sending/actions/sending'
import type { SendingPage } from '../../data/sending'

/**
 * Board 87's policy cards: the delay before external sends (the undo window), the send window, attachment file
 * names, then daily caps, the internal test addresses and the Gmail Drafts mirror (fixed off, G12). Each saves
 * on its own with its settings version; the Helper sees them read-only.
 */
function PolicyCard({
  eyebrow,
  children,
  id,
}: {
  eyebrow: string
  children: ReactNode
  id?: string
}) {
  return (
    <section
      {...(id ? { id } : {})}
      aria-label={eyebrow}
      className="bg-io-card border-io-line rounded-io-card flex min-w-0 scroll-mt-6 flex-col gap-3 border px-4.5 py-4"
    >
      <span className="io-eyebrow">{eyebrow}</span>
      {children}
    </section>
  )
}

function useSave() {
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const run = (
    fn: () => Promise<{ success: boolean; error?: string }>,
    ok: string,
    onFail?: () => void
  ) =>
    start(async () => {
      const res = await fn()
      if (!res.success) {
        onFail?.()
        toast({ kind: 'error', title: res.error ?? 'Could not save.' })
        return
      }
      toast({ kind: 'success', title: ok })
      router.refresh()
    })
  return { pending, run }
}

const HOLD = [1, 2, 5, 10, 15, 30]

export default function SendPolicyCards({ page }: { page: SendingPage }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <HoldCard page={page} />
        <WindowCard page={page} />
        <NamesCard page={page} />
      </div>
      <p className="text-io-ink-3 m-0 text-[12px]">
        The client’s original files are never attached to supplier mail. The cleaned copy from the
        identifier check (board 63) is used instead.
      </p>
      <div className="grid grid-cols-3 gap-4">
        <CapsCard page={page} />
        <TestAddressesCard page={page} />
        <PolicyCard eyebrow="Gmail Drafts mirror">
          <Toggle
            checked={false}
            disabled
            label="Copy drafts into Gmail Drafts"
            sub="A draft edited in Gmail and also approved here could send twice. Drafts stay in Operations."
            aria-label="Gmail Drafts mirror (fixed off)"
          />
        </PolicyCard>
      </div>
    </div>
  )
}

function HoldCard({ page }: { page: SendingPage }) {
  const [minutes, setMinutes] = useState(page.hold.minutes)
  const { pending, run } = useSave()
  const options = (HOLD.includes(minutes) ? HOLD : [...HOLD, minutes].sort((a, b) => a - b)).map(
    (m) => ({
      value: String(m),
      label: `${m} minute${m === 1 ? '' : 's'}`,
    })
  )
  return (
    <PolicyCard eyebrow="Delay before external sends">
      <label className="flex items-center justify-between gap-3 text-[13px]">
        Hold every external email for
        <Select
          size="md"
          aria-label="Hold every external email for"
          value={String(minutes)}
          disabled={!page.canEdit || pending}
          options={options}
          onChange={(e) => {
            const before = minutes
            const next = Number(e.target.value)
            setMinutes(next)
            run(
              () =>
                saveSendPolicyAction({
                  part: 'hold',
                  minutes: next,
                  expectedVersion: page.hold.version,
                }),
              `External emails now wait ${next} minute${next === 1 ? '' : 's'} before they go.`,
              () => setMinutes(before)
            )
          }}
        />
      </label>
      <p className="text-io-ink-3 m-0 text-[12px]">
        During the delay the send can be undone from the receipt row.
      </p>
    </PolicyCard>
  )
}

function WindowCard({ page }: { page: SendingPage }) {
  const [value, setValue] = useState(page.timing.clientWindow)
  const { pending, run } = useSave()
  return (
    <PolicyCard eyebrow="Send window">
      <RadioGroup
        name="send-window"
        legend="Send window"
        hideLegend
        value={value}
        onValueChange={(next) => {
          if (!page.canEdit || pending) return
          const before = value
          setValue(next)
          run(
            () =>
              saveSendPolicyAction({
                part: 'window',
                clientWindow: next,
                expectedVersion: page.timing.version,
              }),
            'Send window saved.',
            () => setValue(before)
          )
        }}
        options={[
          {
            value: 'next_morning',
            label: 'Send at 08:30 next working day if composed after 19:00',
            sub: 'Suppliers in Japan and China see Indus mail at the start of their day; European suppliers get it before lunch. Dubai clients get it at 08:30.',
            disabled: !page.canEdit,
          },
          {
            value: 'immediately',
            label: 'Send immediately',
            sub: 'Fastest, but late-evening mail lands at night for clients and is easy to miss.',
            disabled: !page.canEdit,
          },
        ]}
      />
      {page.timing.signoff === 'awaiting' ? <SignoffTag className="self-start" /> : null}
    </PolicyCard>
  )
}

function NamesCard({ page }: { page: SendingPage }) {
  const [editing, setEditing] = useState(false)
  const [quotation, setQuotation] = useState(page.names.quotation)
  const [rfq, setRfq] = useState(page.names.supplierRfq)
  const { pending, run } = useSave()
  const q = useId()
  const r = useId()
  return (
    <PolicyCard eyebrow="Attachments">
      {editing ? (
        <div className="flex flex-col gap-2 text-[12.5px]">
          <label htmlFor={q} className="text-io-ink-2">
            Quotation file name ({'{n}'} = the number)
          </label>
          <input
            id={q}
            value={quotation}
            onChange={(e) => setQuotation(e.target.value)}
            className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn bg-io-card border px-2.5 text-[13px]"
          />
          <label htmlFor={r} className="text-io-ink-2">
            Supplier RFQ file name ({'{ref}'} = the reference)
          </label>
          <input
            id={r}
            value={rfq}
            onChange={(e) => setRfq(e.target.value)}
            className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn bg-io-card border px-2.5 text-[13px]"
          />
          <span className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              busy={pending}
              onClick={() =>
                run(
                  () =>
                    saveSendPolicyAction({
                      part: 'names',
                      quotation,
                      supplierRfq: rfq,
                      expectedVersion: page.names.version,
                    }),
                  'File names saved.',
                  () => undefined
                )
              }
            >
              Save names
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <dl className="m-0 flex flex-col gap-2 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-io-ink-2">Quotation file name</dt>
              <dd className="m-0 tabular-nums">{page.names.quotationExample}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-io-ink-2">Supplier RFQ file name</dt>
              <dd className="m-0 tabular-nums">{page.names.supplierRfqExample}</dd>
            </div>
          </dl>
          {page.canEdit ? (
            <Button
              variant="link"
              size="sm"
              className="self-start"
              onClick={() => setEditing(true)}
            >
              Change file names
            </Button>
          ) : null}
        </div>
      )}
      {page.names.signoff === 'awaiting' ? <SignoffTag className="self-start" /> : null}
    </PolicyCard>
  )
}

function CapsCard({ page }: { page: SendingPage }) {
  const [caps, setCaps] = useState(page.caps.map((c) => ({ ...c, input: String(c.cap) })))
  const { pending, run } = useSave()
  const dirty = caps.some((c, i) => Number(c.input) !== page.caps[i]?.cap)
  return (
    <PolicyCard eyebrow="Daily send limits">
      {caps.map((c, i) => (
        <label key={c.mailboxId} className="flex items-center justify-between gap-3 text-[13px]">
          {c.address.split('@')[0]}@
          <span className="flex items-center gap-1.5">
            <input
              inputMode="numeric"
              aria-label={`Daily limit for ${c.address}`}
              value={c.input}
              disabled={!page.canEdit}
              onChange={(e) =>
                setCaps((all) =>
                  all.map((x, j) =>
                    j === i ? { ...x, input: e.target.value.replace(/\D/g, '') } : x
                  )
                )
              }
              className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn bg-io-card w-16 border px-2 text-right text-[13px] tabular-nums"
            />
            <span className="text-io-ink-3 text-[12px]">a day</span>
          </span>
        </label>
      ))}
      <p className="text-io-ink-3 m-0 text-[12px]">
        Console sends only. The count resets at 04:00 GST.
      </p>
      {page.canEdit && dirty ? (
        <Button
          size="sm"
          variant="secondary"
          busy={pending}
          className="self-start"
          onClick={() =>
            run(
              () =>
                saveDailyCapsAction({
                  caps: caps.map((c) => ({ mailboxId: c.mailboxId, cap: Number(c.input) || 1 })),
                }),
              'Daily limits saved.'
            )
          }
        >
          Save limits
        </Button>
      ) : null}
    </PolicyCard>
  )
}

function TestAddressesCard({ page }: { page: SendingPage }) {
  const [text, setText] = useState(page.testAddresses.addresses.join('\n'))
  const { pending, run } = useSave()
  const id = useId()
  return (
    <PolicyCard eyebrow="Test email addresses" id="test-addresses">
      <label htmlFor={id} className="text-io-ink-2 text-[12.5px]">
        Internal addresses “Send a test email…” may use, one per line
      </label>
      <textarea
        id={id}
        rows={3}
        value={text}
        disabled={!page.canEdit}
        onChange={(e) => setText(e.target.value)}
        className="io-focus-field border-io-stroke rounded-io-ctl bg-io-card w-full border px-2.5 py-2 text-[13px]"
      />
      {page.canEdit ? (
        <Button
          size="sm"
          variant="secondary"
          busy={pending}
          className="self-start"
          onClick={() =>
            run(
              () =>
                updateSettingAction({
                  key: 'mail.test_allowlist',
                  value: {
                    addresses: text
                      .split(/[\n,]/)
                      .map((a) => a.trim())
                      .filter(Boolean),
                  },
                  expectedVersion: page.testAddresses.version,
                }),
              'Test addresses saved.'
            )
          }
        >
          Save addresses
        </Button>
      ) : null}
    </PolicyCard>
  )
}
