'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateEnquiryFactsAction } from '../../app/(console)/enquiries/[ref]/actions/update-facts'

/**
 * Board 05 · the header facts (S09-T03): title, client ref, deadline, decision-by and owner, shown in the
 * Overview rail and edited in a modal. Saving is version-checked; when someone else changed the enquiry since,
 * the modal shows their values beside yours with Keep theirs (reload) and Keep mine (save again on top).
 */
const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-io-field w-full border px-2.5 text-[13px]'

export interface FactsValue {
  title: string
  clientRef: string | null
  deadline: string | null
  decisionBy: string | null
  ownerId: string | null
}

type Conflict = {
  version: number
  by: string
  theirs: Partial<Record<keyof FactsValue, string | null>>
}

const LABEL: Record<keyof FactsValue, string> = {
  title: 'Title',
  clientRef: 'Client ref',
  deadline: 'Client deadline',
  decisionBy: 'Decision by',
  ownerId: 'Owner',
}

export default function HeaderFactsEditor({
  enquiryId,
  enquiryRef,
  version,
  value,
  owners,
}: {
  enquiryId: string
  enquiryRef: string
  version: number
  value: FactsValue
  owners: Array<{ id: string; initials: string; name: string }>
}) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState<FactsValue>(value)
  const [busy, setBusy] = useState(false)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const ownerName = (id: string | null) => owners.find((o) => o.id === id)?.initials ?? '—'

  async function save(at: number) {
    setBusy(true)
    try {
      const changed = (Object.keys(v) as Array<keyof FactsValue>).filter((k) => v[k] !== value[k])
      const r = await updateEnquiryFactsAction({
        enquiryId,
        ref: enquiryRef,
        version: at,
        ...Object.fromEntries(changed.map((k) => [k, v[k]])),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      if (r.data.kind === 'conflict') {
        setConflict({ version: r.data.version, by: r.data.by, theirs: r.data.theirs })
        return
      }
      setConflict(null)
      setOpen(false)
      toast({ kind: 'success', title: r.data.changed.length ? 'Facts saved' : 'Nothing changed' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const show = (k: keyof FactsValue, x: string | null | undefined) =>
    k === 'ownerId' ? ownerName(x ?? null) : (x ?? '—')

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setV(value)
          setConflict(null)
        }
      }}
      title={`Edit ${enquiryRef}`}
      trigger={
        <Button size="sm" aria-label="Edit facts">
          Edit
        </Button>
      }
      actions={
        conflict ? (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false)
                router.refresh()
              }}
            >
              Keep theirs
            </Button>
            <Button variant="primary" disabled={busy} onClick={() => void save(conflict.version)}>
              Keep mine
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={busy} onClick={() => void save(version)}>
              Save
            </Button>
          </>
        )
      }
    >
      {conflict ? (
        <div role="status" data-part="facts-conflict" className="flex flex-col gap-2 text-[13px]">
          <p className="m-0">Changed by {conflict.by} while you were editing.</p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {(Object.keys(conflict.theirs) as Array<keyof FactsValue>).map((k) => (
              <li key={k}>
                {LABEL[k]}: theirs <b className="font-medium">{show(k, conflict.theirs[k])}</b>,
                yours <b className="font-medium">{show(k, v[k])}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-[12.5px]">
          <label className="col-span-2 flex flex-col gap-1.5">
            Title
            <input
              className={FIELD}
              value={v.title}
              onChange={(e) => setV({ ...v, title: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Client ref
            <input
              className={FIELD}
              value={v.clientRef ?? ''}
              onChange={(e) => setV({ ...v, clientRef: e.target.value || null })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Owner
            <select
              className={FIELD}
              value={v.ownerId ?? ''}
              onChange={(e) => setV({ ...v, ownerId: e.target.value || null })}
            >
              <option value="">Not set</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.initials} · {o.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            Client deadline
            <input
              type="date"
              className={FIELD}
              value={v.deadline ?? ''}
              onChange={(e) => setV({ ...v, deadline: e.target.value || null })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Decision by
            <input
              type="date"
              className={FIELD}
              value={v.decisionBy ?? ''}
              onChange={(e) => setV({ ...v, decisionBy: e.target.value || null })}
            />
          </label>
        </div>
      )}
    </Modal>
  )
}
