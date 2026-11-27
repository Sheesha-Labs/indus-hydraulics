'use client'

import { Button, Toggle } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import type { Tone } from '@indus/ops-ui/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  documentUploadSlotAction,
  recordDocumentAction,
  revokeDocumentRequestAction,
  sendDocumentRequestAction,
} from '../../../app/(console)/suppliers/new/actions/onboarding'
import type { SupplierWizard } from '../../../data/supplier-wizard'
import { FIELD } from '../DirectoryEditors'

/**
 * Board 50 step "Documents" (S10-T04): the nine documents with status, detail and expiry; each row can be updated
 * (status, number, issuer, expiry, a PDF or image). Below, the document request: the email preview with the secure
 * link (added when sent), "Reminder every 4 days until complete", and the request's state once sent.
 */
const STATUS: Record<string, { word: string; tone: Tone }> = {
  received: { word: 'Received', tone: 'ok' },
  signed: { word: 'Signed', tone: 'ok' },
  awaiting_signature: { word: 'Awaiting signature', tone: 'warn' },
  requested: { word: 'Requested', tone: 'acc' },
  missing: { word: 'Missing', tone: 'bad' },
  expired: { word: 'Expired', tone: 'bad' },
}

type Doc = SupplierWizard['documents'][number]

export async function putFile(url: string, file: File): Promise<boolean> {
  try {
    const r = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'content-type': file.type, 'x-upsert': 'false' },
    })
    return r.ok
  } catch {
    return false
  }
}

function DocRow({ supplierId, d }: { supplierId: string; d: Doc }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [v, setV] = useState<{ status: string; number: string; issuer: string; expiresAt: string }>(
    {
      status: d.status === 'expired' ? 'missing' : d.status,
      number: d.number ?? '',
      issuer: d.issuer ?? '',
      expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString().slice(0, 10) : '',
    }
  )
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const s = STATUS[d.status] ?? { word: d.status, tone: 'n' as Tone }

  async function save() {
    setBusy(true)
    try {
      let upload: { key: string; filename: string } | undefined
      if (file) {
        const slot = await documentUploadSlotAction({
          supplierId,
          name: file.name,
          size: file.size,
        })
        if (!slot.success) {
          toast({ kind: 'error', title: slot.error })
          return
        }
        if (!(await putFile(slot.data.uploadUrl, file))) {
          toast({ kind: 'error', title: 'Upload failed. Try again.' })
          return
        }
        upload = { key: slot.data.key, filename: file.name }
      }
      const r = await recordDocumentAction({
        supplierId,
        document: {
          kind: d.kind,
          status: (file && v.status === 'missing' ? 'received' : v.status) as 'received',
          ...(v.number.trim() ? { number: v.number.trim() } : {}),
          ...(v.issuer.trim() ? { issuer: v.issuer.trim() } : {}),
          ...(v.expiresAt ? { expiresAt: v.expiresAt } : {}),
          ...(upload ? { upload } : {}),
        },
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: `${d.label} saved` })
      setOpen(false)
      setFile(null)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="row" data-doc={d.kind} className="border-io-line border-b last:border-b-0">
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_150px_minmax(0,1fr)_64px] items-center gap-3 px-4 py-3 text-[12.5px]">
        <span role="cell" className="font-medium">
          {d.label}
          {d.optional && d.status === 'missing' ? (
            <span className="text-io-ink-3 font-normal"> · when the line card has categories</span>
          ) : null}
        </span>
        <span role="cell" className="text-io-ink-3 text-[12px]">
          {[d.issuer, d.number].filter(Boolean).join(' · ') || d.detail}
        </span>
        <span role="cell">
          <Chip tone={s.tone} label={s.word} />
        </span>
        <span
          role="cell"
          className={
            d.status === 'missing' || d.status === 'expired'
              ? 'text-io-bad text-[12px]'
              : 'text-io-ink-3 text-[12px]'
          }
        >
          {d.expires ? `Expires ${d.expires}` : d.hasFile ? 'File on record' : '—'}
        </span>
        <span role="cell" className="justify-self-end">
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={open}
            aria-label={`Update ${d.label}`}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Update'}
          </Button>
        </span>
      </div>
      {open ? (
        <div className="bg-io-paper grid grid-cols-4 items-end gap-2.5 px-4 py-3 text-[12px]">
          <label className="flex flex-col gap-1">
            Status
            <select
              className={FIELD}
              value={v.status}
              onChange={(e) => setV({ ...v, status: e.target.value })}
            >
              {['received', 'requested', 'awaiting_signature', 'signed', 'missing'].map((k) => (
                <option key={k} value={k}>
                  {STATUS[k]!.word}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Number
            <input
              className={FIELD}
              value={v.number}
              onChange={(e) => setV({ ...v, number: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Issuer
            <input
              className={FIELD}
              value={v.issuer}
              onChange={(e) => setV({ ...v, issuer: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Expires
            <input
              className={FIELD}
              type="date"
              value={v.expiresAt}
              onChange={(e) => setV({ ...v, expiresAt: e.target.value })}
            />
          </label>
          <label className="col-span-3 flex flex-col gap-1">
            File (PDF, PNG or JPEG, up to 20 MB)
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="io-focus text-[12px]"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void save()}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default function DocumentsStep({ wizard }: { wizard: SupplierWizard }) {
  const [remindersOn, setRemindersOn] = useState(wizard.request?.remindersOn ?? true)
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const outstanding = wizard.documents.filter(
    (d) => !d.optional && !['received', 'signed', 'awaiting_signature'].includes(d.status)
  )
  const pct = wizard.of ? Math.round((wizard.inCount / wizard.of) * 100) : 0
  const r = wizard.request
  const open = r?.status === 'open'

  return (
    <div className="flex flex-col gap-5" data-part="documents-step">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="m-0 text-[15px] font-semibold">
            {wizard.inCount} of {wizard.of} documents in
          </h2>
          <p className="text-io-ink-3 m-0 mt-1 text-[12.5px]">
            Required for every supplier; product approvals depend on the categories on the line card
          </p>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 6"
          preserveAspectRatio="none"
          className="h-1.5 w-[200px]"
        >
          <rect x="0" y="0" width="100" height="6" rx="1" className="fill-io-fill" />
          <rect x="0" y="0" width={Math.max(pct, 1)} height="6" rx="1" className="fill-io-accent" />
        </svg>
      </div>
      <div
        role="table"
        aria-label="Documents"
        className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
      >
        <div
          role="row"
          className="border-io-line text-io-ink-3 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_150px_minmax(0,1fr)_64px] gap-3 border-b px-4 py-3 text-[10.5px] font-medium tracking-[0.1em] uppercase"
        >
          <span role="columnheader">Document</span>
          <span role="columnheader">Detail</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Expiry · follow-up</span>
          <span role="columnheader" className="sr-only">
            Update
          </span>
        </div>
        {wizard.documents.map((d) => (
          <DocRow key={d.kind} supplierId={wizard.id} d={d} />
        ))}
      </div>

      <section
        aria-label="Document request"
        className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="io-eyebrow m-0">Document request</h2>
          {r ? (
            <span className="text-io-ink-3 text-[12px]" data-state={r.status}>
              {r.status === 'open'
                ? `${r.sentAt ? `Sent ${r.sentAt}` : 'Waiting for approval in Review'} · link open until ${r.expires}${r.remindersSent ? ` · ${r.remindersSent} reminder${r.remindersSent === 1 ? '' : 's'}` : ''}`
                : r.status === 'completed'
                  ? 'Every document asked for is in'
                  : r.status === 'expired'
                    ? `The link expired ${r.expires}`
                    : 'Withdrawn'}
            </span>
          ) : null}
        </div>
        {wizard.composer ? (
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="border-io-line grid grid-cols-[60px_1fr] border-b pb-2.5">
              <span className="text-io-ink-3">To</span>
              <span>
                {wizard.composer.to ?? (
                  <span className="text-io-bad">Add the Sales contact&apos;s email first</span>
                )}
              </span>
            </div>
            <p className="m-0 leading-[1.6] whitespace-pre-line">{wizard.composer.body}</p>
            <Toggle
              label="Reminder every 4 days until complete"
              checked={remindersOn}
              onCheckedChange={setRemindersOn}
              disabled={busy || open}
            />
            <div className="flex justify-end gap-2">
              {open && r ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    void (async () => {
                      setBusy(true)
                      const x = await revokeDocumentRequestAction({
                        supplierId: wizard.id,
                        requestId: r.id,
                      })
                      setBusy(false)
                      if (!x.success) {
                        toast({ kind: 'error', title: x.error })
                        return
                      }
                      toast({ kind: 'success', title: 'Link withdrawn' })
                      router.refresh()
                    })()
                  }
                >
                  Withdraw link
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                disabled={busy || !outstanding.length || !wizard.composer.to}
                onClick={() =>
                  void (async () => {
                    setBusy(true)
                    const x = await sendDocumentRequestAction({
                      supplierId: wizard.id,
                      kinds: outstanding.map((d) => d.kind),
                      remindersOn,
                    })
                    setBusy(false)
                    if (!x.success) {
                      toast({ kind: 'error', title: x.error })
                      return
                    }
                    toast({
                      kind: 'success',
                      title: 'The Assistant is drafting the request for Review',
                    })
                    router.refresh()
                  })()
                }
              >
                {open
                  ? 'Send a new link'
                  : `Ask for ${outstanding.length} document${outstanding.length === 1 ? '' : 's'}`}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-io-ink-3 m-0 text-[12.5px]">The request template is missing.</p>
        )}
      </section>
    </div>
  )
}
