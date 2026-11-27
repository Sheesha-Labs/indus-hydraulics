'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  createLeadAction,
  importLeadsCsvAction,
} from '../../app/(console)/enquiries/leads/actions/leads'

/**
 * Board 03 header actions (S09-T05): "Import CSV" (secondary) previews the file in the browser and sends the
 * text; the server parses it again, validates every row and says what it created and skipped. "New lead"
 * (primary) is a short form; Owner lists the active team only.
 */
const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-io-field w-full border px-2.5 text-[13px]'

const SOURCES = [
  ['manual', 'Manual'],
  ['email', 'Email'],
  ['callback', 'Call-back'],
  ['website', 'Website'],
] as const

export function NewLeadButton({
  owners,
}: {
  owners: Array<{ id: string; initials: string; name: string }>
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState<Record<string, string>>({ source: 'manual', estCurrency: 'USD' })
  const { toast } = useToast()
  const router = useRouter()
  const set = (k: string) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value })
  const opt = (k: string) => (f[k]?.trim() ? { [k]: f[k]!.trim() } : {})

  async function save() {
    setBusy(true)
    try {
      const r = await createLeadAction({
        name: f.name ?? '',
        source: f.source as 'manual',
        ...opt('companyName'),
        ...opt('email'),
        ...opt('phone'),
        ...opt('title'),
        ...opt('interest'),
        ...opt('estValue'),
        ...(f.estValue ? { estCurrency: f.estCurrency ?? 'USD' } : {}),
        ...opt('nextAction'),
        ...opt('nextActionAt'),
        ...opt('ownerId'),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      setOpen(false)
      toast({ kind: 'success', title: `${r.data.ref} created` })
      router.push(`/enquiries/leads/${r.data.ref}` as Route)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="New lead"
      width={560}
      trigger={<Button variant="primary">New lead</Button>}
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={busy || !f.name?.trim()} onClick={() => void save()}>
            Create lead
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 text-[12.5px]">
        <label className="flex flex-col gap-1.5">
          Name
          <input className={FIELD} value={f.name ?? ''} onChange={set('name')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Company
          <input className={FIELD} value={f.companyName ?? ''} onChange={set('companyName')} />
        </label>
        <label className="col-span-2 flex flex-col gap-1.5">
          Requirement
          <input
            className={FIELD}
            value={f.title ?? ''}
            onChange={set('title')}
            placeholder="e.g. Pump station instrumentation"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          Email
          <input className={FIELD} type="email" value={f.email ?? ''} onChange={set('email')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Phone
          <input className={FIELD} value={f.phone ?? ''} onChange={set('phone')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Source
          <select className={FIELD} value={f.source} onChange={set('source')}>
            {SOURCES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          Interest
          <input className={FIELD} value={f.interest ?? ''} onChange={set('interest')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Est. value
          <span className="flex gap-2">
            <input
              className={FIELD}
              inputMode="decimal"
              value={f.estValue ?? ''}
              onChange={set('estValue')}
            />
            <select
              aria-label="Currency"
              className={`${FIELD} w-24`}
              value={f.estCurrency}
              onChange={set('estCurrency')}
            >
              {['USD', 'AED', 'EUR', 'GBP'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          Owner
          <select className={FIELD} value={f.ownerId ?? ''} onChange={set('ownerId')}>
            <option value="">Me</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.initials} · {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          Next action
          <input className={FIELD} value={f.nextAction ?? ''} onChange={set('nextAction')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Next action date
          <input
            className={FIELD}
            type="date"
            value={f.nextActionAt ?? ''}
            onChange={set('nextActionAt')}
          />
        </label>
      </div>
    </Modal>
  )
}

export function ImportCsvButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ rows: number; headers: string[] } | null>(null)
  const [result, setResult] = useState<{
    created: number
    skipped: Array<{ row: number; reason: string }>
    unknownColumns: string[]
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function pick(file: File | undefined) {
    setResult(null)
    if (!file) return
    const t = await file.text()
    // Preview only: the server parses the text again and is the judge of every row.
    const p = Papa.parse<Record<string, string>>(t, {
      header: true,
      skipEmptyLines: 'greedy',
      preview: 2000,
    })
    setText(t)
    setPreview({ rows: p.data.length, headers: p.meta.fields ?? [] })
  }

  async function upload() {
    if (!text) return
    setBusy(true)
    try {
      const r = await importLeadsCsvAction({ text })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      setResult(r.data)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setText(null)
          setPreview(null)
          setResult(null)
        }
      }}
      title="Import leads from CSV"
      trigger={<Button>Import CSV</Button>}
      note="Columns: name, company, title, email, phone, interest, est value, currency, next action, next action date, owner, notes."
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {result ? null : (
            <Button
              variant="primary"
              disabled={busy || !preview?.rows}
              onClick={() => void upload()}
            >
              Import {preview?.rows ?? 0} rows
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[12.5px]">
        <label className="flex flex-col gap-1.5">
          CSV file
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </label>
        {preview ? (
          <p className="m-0" data-part="csv-preview">
            {preview.rows} row{preview.rows === 1 ? '' : 's'} · columns{' '}
            {preview.headers.join(', ') || 'none'}
          </p>
        ) : null}
        {result ? (
          <div role="status" data-part="csv-result" className="flex flex-col gap-1">
            <b className="font-medium">
              {result.created} created · {result.skipped.length} skipped
            </b>
            {result.skipped.slice(0, 8).map((s) => (
              <span key={s.row} className="text-io-ink-2">
                Row {s.row}: {s.reason}
              </span>
            ))}
            {result.unknownColumns.length ? (
              <span className="text-io-ink-3">
                Ignored columns: {result.unknownColumns.join(', ')}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
