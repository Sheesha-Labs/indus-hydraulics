'use client'

import { Button } from '@indus/ops-ui/controls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { confirmUploadAction, uploadSlotAction } from '../../app/(client)/u/[token]/actions'

/**
 * The /u upload list (S10-T04): one row per requested document, a file picker (PDF, PNG or JPEG, up to 20 MB) and an
 * optional expiry date. The file goes straight to storage through a signed URL; the server then checks it and marks
 * the document received. 44 px controls; works at 390 px.
 */
export interface PortalKind {
  kind: string
  label: string
  received: boolean
}

type RowState = { kind: 'idle' | 'busy' | 'done' | 'error'; message?: string }

function Row({ token, k }: { token: string; k: PortalKind }) {
  const [file, setFile] = useState<File | null>(null)
  const [expiry, setExpiry] = useState('')
  const [state, setState] = useState<RowState>({ kind: k.received ? 'done' : 'idle' })
  const router = useRouter()
  async function send() {
    if (!file) return
    setState({ kind: 'busy' })
    const slot = await uploadSlotAction({ token, kind: k.kind, name: file.name, size: file.size })
    if (!slot.success) {
      setState({ kind: 'error', message: slot.error })
      return
    }
    let ok = false
    try {
      ok = (
        await fetch(slot.data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'content-type': file.type || 'application/octet-stream', 'x-upsert': 'false' },
        })
      ).ok
    } catch {
      ok = false
    }
    if (!ok) {
      setState({ kind: 'error', message: 'Upload failed. Check your connection and try again.' })
      return
    }
    const done = await confirmUploadAction({
      token,
      kind: k.kind,
      key: slot.data.key,
      filename: file.name,
      ...(expiry ? { expiresAt: expiry } : {}),
    })
    if (!done.success) {
      setState({ kind: 'error', message: done.error })
      return
    }
    setState({ kind: 'done' })
    router.refresh()
  }
  const id = `file-${k.kind}`
  return (
    <li
      className="border-io-line flex flex-col gap-3 border-b py-4 last:border-b-0"
      data-kind={k.kind}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-medium">{k.label}</span>
        <span
          className={state.kind === 'done' ? 'text-io-ok text-[13px]' : 'text-io-ink-3 text-[13px]'}
          role="status"
        >
          {state.kind === 'done' ? 'Received' : state.kind === 'busy' ? 'Uploading…' : 'Needed'}
        </span>
      </div>
      {state.kind !== 'done' ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <label htmlFor={id} className="flex flex-1 flex-col gap-1 text-[13px]">
            {`${k.label}: file (PDF, PNG or JPEG, up to 20 MB)`}
            <input
              id={id}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="io-focus min-h-11 text-[14px]"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[13px]">
            Expiry date (if any)
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="rounded-io-ctl border-io-stroke io-focus-field h-11 border px-3 text-[14px]"
            />
          </label>
          <Button
            size="lg"
            variant="primary"
            className="min-h-11"
            disabled={!file || state.kind === 'busy'}
            onClick={() => void send()}
          >
            {`Upload ${k.label}`}
          </Button>
        </div>
      ) : null}
      {state.kind === 'error' ? (
        <p role="alert" className="text-io-bad m-0 text-[13px]">
          {state.message}
        </p>
      ) : null}
    </li>
  )
}

export default function UploadPortal({ token, kinds }: { token: string; kinds: PortalKind[] }) {
  return (
    <ul className="m-0 list-none p-0" aria-label="Documents requested">
      {kinds.map((k) => (
        <Row key={k.kind} token={token} k={k} />
      ))}
    </ul>
  )
}
