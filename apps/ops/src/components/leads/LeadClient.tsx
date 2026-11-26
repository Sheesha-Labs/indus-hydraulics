'use client'

import type { LeadStage } from '@indus/ops-core'
import { Button } from '@indus/ops-ui/controls'
import { Menu, Modal, useToast } from '@indus/ops-ui/overlay'
import { Toggle } from '@indus/ops-ui/controls'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, type RefObject } from 'react'
import {
  convertLeadAction,
  setLeadStageAction,
  updateLeadLineSpecAction,
  updateLeadNotesAction,
} from '../../app/(console)/enquiries/leads/actions/leads'

/**
 * Board 22 / 23 client parts (S09-T05): the stage menu (through the lead machine), the inline spec note, the
 * notes editor and the convert modal (?convert=1; Radix Dialog via the kit: focus trap, Escape, focus back).
 */
const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-io-field w-full border px-2.5 text-[13px]'

const NEXT: Record<string, Array<['contacted' | 'qualified' | 'dropped' | 'new', string]>> = {
  new: [
    ['contacted', 'Mark contacted'],
    ['dropped', 'Drop lead'],
  ],
  contacted: [
    ['qualified', 'Mark qualified'],
    ['dropped', 'Drop lead'],
  ],
  qualified: [['dropped', 'Drop lead']],
}

export function StageMenu({
  leadId,
  leadRef,
  version,
  stage,
}: {
  leadId: string
  leadRef: string
  version: number
  stage: LeadStage
}) {
  const { toast } = useToast()
  const router = useRouter()
  const items = (NEXT[stage] ?? []).map(([to, label]) => ({
    type: 'item' as const,
    label,
    danger: to === 'dropped',
    onSelect: async () => {
      const r = await setLeadStageAction({ leadId, ref: leadRef, version, to })
      if (!r.success) toast({ kind: 'error', title: r.error })
      else {
        toast({
          kind: 'success',
          title: `${leadRef} ${to === 'dropped' ? 'dropped' : `marked ${to}`}`,
        })
        router.refresh()
      }
    },
  }))
  if (!items.length) return null
  return (
    <Menu
      align="end"
      trigger={
        <button
          type="button"
          className="io-focus rounded-io-ctl border-io-stroke bg-io-card h-[34px] border px-3 text-[12.5px]"
        >
          Stage
        </button>
      }
      items={items}
    />
  )
}

export function SpecCell({
  lineId,
  leadRef,
  version,
  value,
  no,
}: {
  lineId: string
  leadRef: string
  version: number
  value: string | null
  no: number
}) {
  const [v, setV] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  async function save() {
    if ((value ?? '') === v.trim()) return
    setBusy(true)
    try {
      const r = await updateLeadLineSpecAction({
        lineId,
        ref: leadRef,
        version,
        specNotes: v.trim() || null,
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        setV(value ?? '')
      } else router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <input
      aria-label={`Material or spec, line ${no}`}
      className="io-focus-field rounded-io-tag hover:border-io-line w-full border border-transparent bg-transparent px-1 py-0.5"
      value={v}
      disabled={busy}
      placeholder="—"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => void save()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setV(value ?? '')
      }}
    />
  )
}

export function NotesEditor({
  leadId,
  leadRef,
  version,
  value,
}: {
  leadId: string
  leadRef: string
  version: number
  value: string | null
}) {
  const [v, setV] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-[12.5px]">
        Notes
        <textarea
          className="rounded-io-ctl border-io-stroke bg-io-card io-focus-field min-h-[200px] w-full border p-2.5 text-[13px]"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      </label>
      <div>
        <Button
          variant="primary"
          disabled={busy || v === (value ?? '')}
          onClick={async () => {
            setBusy(true)
            try {
              const r = await updateLeadNotesAction({
                leadId,
                ref: leadRef,
                version,
                notes: v || null,
              })
              if (!r.success) toast({ kind: 'error', title: r.error })
              else {
                toast({ kind: 'success', title: 'Notes saved' })
                router.refresh()
              }
            } finally {
              setBusy(false)
            }
          }}
        >
          Save notes
        </Button>
      </div>
    </div>
  )
}

const CONVERT_TRIGGER = 'convert-lead-trigger'

export function ConvertButton() {
  const router = useRouter()
  const path = usePathname()
  return (
    <Button
      id={CONVERT_TRIGGER}
      variant="primary"
      className="px-[13px] text-[12.5px]"
      onClick={() => router.replace(`${path}?convert=1` as Route, { scroll: false })}
    >
      Convert to enquiry
    </Button>
  )
}

export interface ConvertModel {
  leadId: string
  leadRef: string
  nextRef: string | null
  clientRef: string | null
  deadline: string | null
  ownerId: string | null
  owners: Array<{ id: string; initials: string; name: string }>
  categories: Array<{ key: string; label: string; count: number }>
  total: number
}

export function ConvertLeadModal({ m }: { m: ConvertModel }) {
  const search = useSearchParams()
  const path = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const open = search.get('convert') === '1'
  const [clientRef, setClientRef] = useState(m.clientRef ?? '')
  const [deadline, setDeadline] = useState(m.deadline ?? '')
  const [ownerId, setOwnerId] = useState(m.ownerId ?? m.owners[0]?.id ?? '')
  const [picked, setPicked] = useState<Set<string>>(new Set(m.categories.map((c) => c.key)))
  const [pre, setPre] = useState(true)
  const [busy, setBusy] = useState(false)
  const carrying = m.categories.filter((c) => picked.has(c.key)).reduce((n, c) => n + c.count, 0)
  const enq = m.nextRef ?? 'the next ENQ number'
  const close = () => router.replace(path as Route, { scroll: false })
  // The header re-renders when the URL changes, so the trigger is found again when the modal closes.
  const back = useMemo(
    () =>
      ({
        get current() {
          return typeof document === 'undefined' ? null : document.getElementById(CONVERT_TRIGGER)
        },
      }) as RefObject<HTMLElement | null>,
    []
  )

  async function create() {
    setBusy(true)
    try {
      const r = await convertLeadAction({
        leadId: m.leadId,
        ref: m.leadRef,
        clientRef: clientRef.trim() || null,
        deadline: deadline || null,
        ownerId,
        categories: [...picked],
        preallocate: pre,
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({
        kind: 'success',
        title: `${r.data.ref} ${r.data.replayed ? 'already created' : 'created'} · ${r.data.lines} lines`,
      })
      router.push(`/enquiries/${r.data.ref}` as Route)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
      title={`Create enquiry ${enq}`}
      variant="sheet"
      eyebrow={`Convert lead ${m.leadRef}`}
      returnFocusRef={back}
      actions={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={busy || carrying === 0 || !ownerId}
            onClick={() => void create()}
          >
            Create enquiry
          </Button>
        </>
      }
    >
      <div data-part="convert-lead" className="flex flex-col gap-4 text-[12.5px]">
        <div className="grid grid-cols-[1fr_0.75fr_0.85fr] gap-3">
          <label className="flex flex-col gap-1.5">
            Client RFQ reference
            <input
              className={FIELD}
              value={clientRef}
              onChange={(e) => setClientRef(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Client deadline
            <input
              className={FIELD}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Owner
            <select className={FIELD} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              {m.owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0">
            Lines to carry · {carrying} of {m.total}
          </legend>
          {m.categories.length === 0 ? (
            <p className="text-io-ink-3 m-0">
              The lead has no lines yet: the enquiry needs at least one.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {m.categories.map((c) => (
                <label
                  key={c.key}
                  className="border-io-line rounded-io-8 flex items-center gap-2 border px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    className="io-focus h-4 w-4"
                    checked={picked.has(c.key)}
                    onChange={(e) => {
                      const next = new Set(picked)
                      if (e.target.checked) next.add(c.key)
                      else next.delete(c.key)
                      setPicked(next)
                    }}
                  />
                  {c.label} · {c.count}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="bg-io-accent-tint rounded-io-8 px-3.5 py-3">
          <Toggle
            checked={pre}
            onCheckedChange={setPre}
            label="Pre-allocate from line cards"
            sub="Drafts the supplier RFQs from line cards. You review them before anything is sent."
          />
        </div>
        <p className="text-io-ink-2 m-0">
          The lead is closed as Converted and linked to {enq}. Documents and notes move with it.
        </p>
      </div>
    </Modal>
  )
}
