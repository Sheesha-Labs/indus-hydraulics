'use client'

import { Button, Toggle } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import {
  saveCapsAction,
  saveGuardrailAction,
} from '../../app/(console)/assistant/guardrails/actions/guardrails'
import type { GuardrailRowData, GuardrailsPageData } from '../../data/guardrails'
import HolidayEditor from './HolidayEditor'

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function daysText(days: number[]): string {
  const sorted = [...days].sort()
  const run = sorted.every((d, i) => i === 0 || d === sorted[i - 1]! + 1)
  return run && sorted.length > 2
    ? `${DAY[sorted[0]!]}–${DAY[sorted.at(-1)!]}`
    : sorted.map((d) => DAY[d]).join(', ')
}

function grouped(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

/**
 * Board 100's rows (S07-T03): each guardrail with its control, its "n× this month" count from
 * guardrail_trigger and a "Default · awaiting sign-off" tag until the Owner saves it. Values save inline
 * (Enter or leaving the field), version-checked; the Helper sees them read only. The two fixed rules are not
 * controls.
 */
export default function GuardrailRows({ page }: { page: GuardrailsPageData }) {
  const value = page.rows.filter((r) => r.section === 'value')
  const time = page.rows.filter((r) => r.section === 'time')
  const fixed = page.rows.filter((r) => r.section === 'fixed')
  return (
    <div data-part="guardrails" className="flex flex-col gap-5">
      <Section title="Value and counterparty">
        {value.map((r) => (
          <Row key={r.key} row={r} page={page} />
        ))}
      </Section>
      <Section title="Time and volume">
        {time.map((r) => (
          <Row key={r.key} row={r} page={page} />
        ))}
      </Section>
      <Section title="Fixed · not Autopilot settings">
        {fixed.map((r) => (
          <Row key={r.key} row={r} page={page} />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `gr-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5">
      <h2 id={id} className="io-eyebrow m-0 font-normal">
        {title}
      </h2>
      <div className="rounded-io-card border-io-line bg-io-card overflow-hidden border">
        {children}
      </div>
    </section>
  )
}

function Row({ row, page }: { row: GuardrailRowData; page: GuardrailsPageData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [version, setVersion] = useState(row.version)
  const [busy, setBusy] = useState(false)
  const edit = page.isOwner && !row.fixed

  async function save(params: Record<string, unknown>, enabled = row.enabled) {
    setBusy(true)
    const res = await saveGuardrailAction({ key: row.key, enabled, params, version })
    setBusy(false)
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      router.refresh()
      return false
    }
    setVersion(res.data.version)
    toast({ kind: 'success', title: `${row.label}: saved` })
    router.refresh()
    return true
  }

  const p = row.params
  let note = row.note
  let control: ReactNode = null
  if (row.kind === 'value_threshold') {
    const currency = String(p.currency ?? 'AED')
    control = (
      <InlineNumber
        label={row.label}
        prefix={currency}
        value={Number(p.amount ?? 0)}
        disabled={!edit || busy}
        onSave={(n) => save({ ...p, amount: n })}
      />
    )
  } else if (row.kind === 'first_contact' || row.kind === 'credit_hold') {
    control = (
      <Toggle
        aria-label={row.label}
        checked={row.enabled}
        disabled={!edit || busy}
        onCheckedChange={(v) => void save(p, v)}
      />
    )
  } else if (row.kind === 'margin_floor') {
    note = `${row.note} · hard minimum ${String(p.hardMinPct ?? 5)}% is fixed`
    control = (
      <InlineNumber
        label={row.label}
        suffix="%"
        value={Number(p.floorPct ?? 12)}
        disabled={!edit || busy}
        onSave={(n) => save({ ...p, floorPct: n })}
      />
    )
  } else if (row.kind === 'working_hours') {
    const days = (p.days as number[] | undefined) ?? [1, 2, 3, 4, 5]
    note = `${daysText(days)} ${String(p.start ?? '09:00')}–${String(p.end ?? '18:00')} GST; anything after waits for the ${String(p.queueUntil ?? '08:30')} release on the next working day`
    control = <HoursControl row={row} disabled={!edit || busy} onSave={save} />
  } else if (row.kind === 'holiday_calendar') {
    const next = page.nextHoliday
    note = `UAE public holidays and Ramadan hours (${String(p.ramadanStart ?? '10:00')}–${String(p.ramadanEnd ?? '15:00')})${
      next ? ` · next: ${shortDate(next.date)}, ${next.name}` : ''
    }`
    control = <HolidayEditor holidays={page.holidays} canEdit={page.isOwner} />
  } else if (row.kind === 'daily_send_cap') {
    control = <Caps caps={page.caps} canEdit={page.isOwner} />
  } else if (row.kind === 'research_cap') {
    control = (
      <InlineNumber
        label={row.label}
        prefix="USD"
        decimals
        value={Number(p.perEnquiryUsd ?? 5)}
        disabled={!edit || busy}
        onSave={(n) => save({ ...p, perEnquiryUsd: n })}
      />
    )
  } else if (row.fixed) {
    control = (
      <span className="text-io-ink-2 flex items-center gap-1.5 text-[12.5px]">
        <Lock aria-hidden="true" size={13} strokeWidth={1.75} />
        Fixed
      </span>
    )
  }

  return (
    <div
      data-part="guardrail-row"
      id={row.key}
      data-guardrail={row.key}
      className="border-io-line grid min-h-[63px] grid-cols-[minmax(0,1fr)_auto_96px] items-center gap-4 border-b px-4 py-3 last:border-b-0"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[13.5px] font-medium">
          {row.fixed ? (
            <Lock aria-hidden="true" size={13} strokeWidth={1.75} className="text-io-ink-3" />
          ) : null}
          {row.label}
        </span>
        <span className="text-io-ink-3 text-[12.5px] leading-[1.45]">{note}</span>
        {row.awaiting && !row.fixed ? (
          <span className="text-io-warn text-[11.5px]">Default · awaiting sign-off</span>
        ) : null}
      </div>
      <div className="flex justify-end">{control}</div>
      <div className="flex flex-col items-end text-right">
        <span className="text-[13px] tabular-nums">{row.monthCount} ×</span>
        <span className="text-io-ink-3 text-[11.5px]">this month</span>
      </div>
    </div>
  )
}

function InlineNumber({
  label,
  value,
  prefix,
  suffix,
  decimals = false,
  disabled,
  onSave,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: boolean
  disabled: boolean
  onSave: (n: number) => Promise<boolean>
}) {
  const shown = decimals ? value.toFixed(2) : grouped(value)
  const [text, setText] = useState<string | null>(null)
  async function commit() {
    if (text === null) return
    const n = Number(text.replace(/[^0-9.]/g, ''))
    setText(null)
    if (!Number.isFinite(n) || n === value || text.trim() === '') return
    await onSave(n)
  }
  return (
    <label
      className={cn(
        'rounded-io-ctl border-io-stroke bg-io-card focus-within:border-io-accent flex h-9 items-center gap-1 border px-2.5 text-[13px] tabular-nums',
        disabled && 'opacity-80'
      )}
    >
      <span className="sr-only">{label}</span>
      {prefix ? <span>{prefix}</span> : null}
      <input
        type="text"
        inputMode="decimal"
        value={text ?? shown}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void commit()
          if (e.key === 'Escape') setText(null)
        }}
        className="io-focus w-[72px] bg-transparent text-right outline-none"
        size={Math.max(3, shown.length)}
      />
      {suffix ? <span>{suffix}</span> : null}
    </label>
  )
}

function HoursControl({
  row,
  disabled,
  onSave,
}: {
  row: GuardrailRowData
  disabled: boolean
  onSave: (p: Record<string, unknown>) => Promise<boolean>
}) {
  const p = row.params
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({
    days: (p.days as number[] | undefined) ?? [1, 2, 3, 4, 5],
    start: String(p.start ?? '09:00'),
    end: String(p.end ?? '18:00'),
    queueUntil: String(p.queueUntil ?? '08:30'),
  })
  return (
    <>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={`${row.label}: ${draft.queueUntil}, edit`}
      >
        {String(p.queueUntil ?? '08:30')}
      </Button>
      {open ? (
        <Modal
          open
          onOpenChange={setOpen}
          title="Working hours"
          actions={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (await onSave(draft)) setOpen(false)
                }}
              >
                Save
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3 text-[13px]">
            <fieldset className="m-0 flex flex-wrap gap-3 border-0 p-0">
              <legend className="mb-1.5">Working days</legend>
              {DAY.map((d, i) => (
                <label key={d} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="io-focus"
                    checked={draft.days.includes(i)}
                    onChange={(e) =>
                      setDraft((x) => ({
                        ...x,
                        days: e.target.checked
                          ? [...x.days, i].sort()
                          : x.days.filter((y) => y !== i),
                      }))
                    }
                  />
                  {d}
                </label>
              ))}
            </fieldset>
            {(['start', 'end', 'queueUntil'] as const).map((k) => (
              <label key={k} className="flex items-center justify-between gap-3">
                {k === 'start' ? 'Day starts' : k === 'end' ? 'Day ends' : 'Queued sends go at'}
                <input
                  type="time"
                  value={draft[k]}
                  onChange={(e) => setDraft((x) => ({ ...x, [k]: e.target.value }))}
                  className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5 tabular-nums"
                />
              </label>
            ))}
            <p className="text-io-ink-3 m-0 text-[12px]">
              Outside {draft.start}–{draft.end} sends wait for the {draft.queueUntil} release on the
              next working day.
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  )
}

function Caps({ caps, canEdit }: { caps: GuardrailsPageData['caps']; canEdit: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState('')
  async function commit(mailboxId: string) {
    const cap = Number(text)
    setEditing(null)
    if (!Number.isInteger(cap) || cap < 1) return
    const res = await saveCapsAction({ caps: [{ mailboxId, cap }] })
    if (!res.success) toast({ kind: 'error', title: res.error })
    else toast({ kind: 'success', title: 'Daily cap saved' })
    router.refresh()
  }
  if (!caps.length) return <span className="text-io-ink-3 text-[12.5px]">No mailbox yet</span>
  return (
    <div className="flex gap-2">
      {caps.map((c) => {
        const name = `${c.address.split('@')[0]}@`
        return editing === c.mailboxId ? (
          <label
            key={c.mailboxId}
            className="rounded-io-ctl border-io-accent flex h-9 items-center gap-1 border px-2.5 text-[13px]"
          >
            {name}
            <input
              autoFocus
              inputMode="numeric"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => void commit(c.mailboxId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void commit(c.mailboxId)
                if (e.key === 'Escape') setEditing(null)
              }}
              className="io-focus w-[44px] bg-transparent text-right tabular-nums outline-none"
              aria-label={`Daily cap for ${c.address}`}
            />
          </label>
        ) : (
          <Button
            key={c.mailboxId}
            variant="secondary"
            disabled={!canEdit}
            onClick={() => {
              setText(String(c.cap))
              setEditing(c.mailboxId)
            }}
          >
            {name} {c.cap}
          </Button>
        )
      })}
    </div>
  )
}
