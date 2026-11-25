'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  deleteHolidayAction,
  saveHolidayAction,
} from '../../app/(console)/assistant/guardrails/actions/guardrails'
import type { HolidayItem } from '../../data/guardrails'

const KIND_WORD: Record<string, string> = {
  public_holiday: 'Public holiday',
  closure: 'Closure',
  ramadan: 'Ramadan hours',
}

type Draft = {
  id?: string
  date: string
  to: string
  name: string
  kind: 'public_holiday' | 'closure' | 'ramadan'
  hoursStart: string
  hoursEnd: string
}
const EMPTY: Draft = {
  date: '',
  to: '',
  name: '',
  kind: 'public_holiday',
  hoursStart: '10:00',
  hoursEnd: '15:00',
}

/**
 * Board 100 "Holiday calendar · UAE · edit" (S07-T03): the next 12 months of UAE holidays, closures and Ramadan
 * days. Add (a Ramadan window is a date range with its hours, one row per day), edit or remove a row; each
 * change is audited and the resolver sees it on its next call.
 */
export default function HolidayEditor({
  holidays,
  canEdit,
}: {
  holidays: HolidayItem[]
  canEdit: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const res = await saveHolidayAction({
      ...(draft.id ? { id: draft.id } : {}),
      country: 'AE',
      date: draft.date,
      ...(draft.to && !draft.id ? { to: draft.to } : {}),
      name: draft.name,
      kind: draft.kind,
      hoursStart: draft.kind === 'ramadan' ? draft.hoursStart : null,
      hoursEnd: draft.kind === 'ramadan' ? draft.hoursEnd : null,
    })
    setBusy(false)
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: `${draft.name} saved` })
    setDraft(EMPTY)
    router.refresh()
  }

  async function remove(h: HolidayItem) {
    const res = await deleteHolidayAction({ id: h.id })
    if (!res.success) toast({ kind: 'error', title: res.error })
    else toast({ kind: 'success', title: `${h.name} removed` })
    router.refresh()
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        aria-label="Holiday calendar: UAE, edit"
      >
        UAE · edit
      </Button>
      {open ? (
        <Modal
          open
          onOpenChange={setOpen}
          title="Holiday calendar · UAE"
          width={560}
          actions={
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <div data-part="holiday-editor" className="flex flex-col gap-4 text-[13px]">
            {holidays.length === 0 ? (
              <p className="text-io-ink-3 m-0">No holidays in the next 12 months yet.</p>
            ) : (
              <ul className="m-0 flex max-h-[240px] list-none flex-col overflow-y-auto p-0">
                {holidays.map((h) => (
                  <li
                    key={h.id}
                    className="border-io-line flex items-center gap-3 border-b py-1.5 last:border-b-0"
                  >
                    <span className="w-[92px] flex-none tabular-nums">{h.date}</span>
                    <span className="min-w-0 flex-1 truncate">{h.name}</span>
                    <span className="text-io-ink-3 flex-none text-[12px]">
                      {KIND_WORD[h.kind] ?? h.kind}
                      {h.kind === 'ramadan' && h.hoursStart ? ` ${h.hoursStart}–${h.hoursEnd}` : ''}
                    </span>
                    {canEdit ? (
                      <>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setDraft({
                              id: h.id,
                              date: h.date,
                              to: '',
                              name: h.name,
                              kind: h.kind as Draft['kind'],
                              hoursStart: h.hoursStart ?? '10:00',
                              hoursEnd: h.hoursEnd ?? '15:00',
                            })
                          }
                          aria-label={`Edit ${h.name} ${h.date}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => void remove(h)}
                          aria-label={`Remove ${h.name} ${h.date}`}
                        >
                          Remove
                        </Button>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {canEdit ? (
              <form
                className="border-io-line grid grid-cols-2 gap-2.5 border-t pt-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  void save()
                }}
              >
                <label className="flex flex-col gap-1">
                  {draft.kind === 'ramadan' && !draft.id ? 'From' : 'Date'}
                  <input
                    required
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  {draft.kind === 'ramadan' && !draft.id ? 'To' : 'To (optional, a range)'}
                  <input
                    type="date"
                    value={draft.to}
                    disabled={!!draft.id}
                    onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                    className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Name
                  <input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Kind
                  <select
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, kind: e.target.value as Draft['kind'] }))
                    }
                    className="io-focus-field rounded-io-ctl border-io-stroke bg-io-card h-9 border px-2.5"
                  >
                    <option value="public_holiday">Public holiday</option>
                    <option value="closure">Closure</option>
                    <option value="ramadan">Ramadan hours</option>
                  </select>
                </label>
                {draft.kind === 'ramadan' ? (
                  <>
                    <label className="flex flex-col gap-1">
                      Hours from
                      <input
                        type="time"
                        value={draft.hoursStart}
                        onChange={(e) => setDraft((d) => ({ ...d, hoursStart: e.target.value }))}
                        className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Hours to
                      <input
                        type="time"
                        value={draft.hoursEnd}
                        onChange={(e) => setDraft((d) => ({ ...d, hoursEnd: e.target.value }))}
                        className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
                      />
                    </label>
                  </>
                ) : null}
                <div className="col-span-2 flex justify-end gap-2">
                  {draft.id ? (
                    <Button variant="ghost" onClick={() => setDraft(EMPTY)}>
                      New instead
                    </Button>
                  ) : null}
                  <Button variant="navy" type="submit" busy={busy}>
                    {draft.id ? 'Save holiday' : 'Add holiday'}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  )
}
