'use client'

import { useCallback, useRef, useState, useId } from 'react'

/**
 * The RFQ attachment field.
 *
 * This replaces a dropzone that was decorative: it rendered "Drag & drop · or
 * browse files · max 25 MB" over a dashed border with no file input behind
 * it, so anyone who tried to attach a drawing silently could not. The
 * RfqAttachment model has existed the whole time with no application code
 * reading or writing it.
 *
 * Files upload straight to storage against a single-use signed URL minted by
 * /api/rfq/attachments/sign; only the resulting storage paths travel with the
 * form. See that route for why bytes cannot go through the server action.
 */

export type UploadedAttachment = {
  path: string
  label: string
  size: number
  contentType: string
}

type Row = {
  id: string
  file: File
  status: 'uploading' | 'done' | 'error'
  error?: string
  uploaded?: UploadedAttachment
}

const MAX_BYTES = 25 * 1024 * 1024
const MAX_FILES = 6
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.step,.stp,.dwg,.dxf'

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function RfqAttachments({ name = 'attachments' }: { name?: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File, id: string) => {
    try {
      const signRes = await fetch('/api/rfq/attachments/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          // Browsers leave `type` empty for CAD files they do not know. The
          // server maps that to a generic binary, which is why it is on the
          // allow-list rather than being rejected outright.
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        }),
      })
      const signed = await signRes.json()
      if (!signRes.ok) throw new Error(signed?.error ?? 'Upload could not be prepared.')

      const put = await fetch(signed.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'content-type': file.type || 'application/octet-stream' },
      })
      if (!put.ok) throw new Error('Upload failed.')

      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'done',
                uploaded: {
                  path: signed.path,
                  label: file.name.slice(0, 180),
                  size: file.size,
                  contentType: file.type || 'application/octet-stream',
                },
              }
            : r,
        ),
      )
    } catch (err) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'error', error: err instanceof Error ? err.message : 'Upload failed.' } : r,
        ),
      )
    }
  }, [])

  const accept = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const incoming = Array.from(files)
      setRows((prev) => {
        const room = MAX_FILES - prev.length
        const next: Row[] = []
        for (const file of incoming.slice(0, Math.max(0, room))) {
          const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`
          if (file.size > MAX_BYTES) {
            next.push({ id, file, status: 'error', error: 'Larger than 25 MB.' })
            continue
          }
          next.push({ id, file, status: 'uploading' })
          void upload(file, id)
        }
        return [...prev, ...next]
      })
    },
    [upload],
  )

  const fileInputId = useId()
  const ready = rows.filter((r) => r.status === 'done' && r.uploaded).map((r) => r.uploaded!)
  const busy = rows.some((r) => r.status === 'uploading')

  return (
    <div>
      {/*
        The real file input is sr-only and sits inside the dropzone below, so
        this caption pairs with it by id. It carried no htmlFor before, which
        left the only keyboard-reachable control in the whole dropzone
        unnamed.
      */}
      <label
        htmlFor={fileInputId}
        className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted"
      >
        Attachments — drawings, schedules, nameplate photos
      </label>

      {/* The paths, not the bytes, travel with the form. */}
      <input type="hidden" name={name} value={JSON.stringify(ready)} />
      {/* Blocks submit while an upload is in flight — the form would otherwise
          post an attachment list that is still filling in. */}
      {busy && <input type="hidden" name="attachmentsPending" value="1" />}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          accept(e.dataTransfer.files)
        }}
        className={`rounded-lg border-[1.5px] border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-ih-accent bg-ih-accent-soft' : 'border-ih-border-strong bg-ih-surface-2'
        }`}
      >
        <p className="text-[13px] text-ih-ink-2">
          Drag and drop, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-ih-accent underline underline-offset-2"
          >
            browse files
          </button>
        </p>
        <p className="mt-1.5 font-mono text-[10.5px] text-ih-muted">
          PDF · JPG · PNG · HEIC · STEP · DWG — up to 25 MB each, {MAX_FILES} files
        </p>
        <input
          ref={inputRef}
          id={fileInputId}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            accept(e.target.files)
            // Reset so re-selecting the same file fires change again.
            e.target.value = ''
          }}
        />
      </div>

      {rows.length > 0 && (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-md border border-ih-border bg-ih-surface px-3 py-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px]">{row.file.name}</span>
                <span className="mt-0.5 block font-mono text-[10.5px] text-ih-muted">
                  {humanSize(row.file.size)}
                  {row.status === 'uploading' && ' · uploading…'}
                  {row.status === 'error' && ` · ${row.error}`}
                </span>
              </span>
              {row.status === 'done' && (
                <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-success">
                  attached
                </span>
              )}
              {row.status === 'error' && (
                <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-danger">
                  failed
                </span>
              )}
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                aria-label={`Remove ${row.file.name}`}
                className="shrink-0 rounded-sm px-1 text-[15px] leading-none text-ih-muted transition-colors hover:text-ih-danger"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="sr-only">
        {busy ? 'Uploading attachments' : `${ready.length} attachment${ready.length === 1 ? '' : 's'} ready`}
      </p>
    </div>
  )
}
