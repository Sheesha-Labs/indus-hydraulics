'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, UploadCloud, X } from 'lucide-react'
import {
  checkMediaUpload,
  MAX_MEDIA_UPLOAD_BYTES,
  MEDIA_UPLOAD_ACCEPT,
  MEDIA_UPLOAD_ACCEPT_LABEL,
  suggestAltFromFilename,
} from '@indus/domain'
import { Button, Input, cn } from '@indus/ui'

import { createMediaUploadTicket, finaliseMediaUpload } from '../actions'

/**
 * Multi-file upload with per-file progress and alt text captured up front.
 *
 * The bytes go straight from the browser to storage; only the ticket and the
 * finalise call touch our server. See `createMediaUploadTicket` for why that
 * is mandatory rather than an optimisation.
 *
 * Alt text is asked for HERE, while the operator is looking at the picture
 * they just chose. Bazar threads an `alt_text` parameter all the way to its
 * insert and no caller ever passes it, which is why every asset in that system
 * has none. A field nobody is standing in front of does not get filled in.
 */

type Status = 'queued' | 'uploading' | 'done' | 'error'

interface QueueItem {
  id: string
  file: File
  alt: string
  progress: number
  status: Status
  message?: string
}

/**
 * Progress widths as literal classes, in 5% steps.
 *
 * Inline `style=` is banned in apps/web (CLAUDE.md §2.1) and a percentage is
 * the one value a utility cannot express continuously — so it is quantised
 * instead. Tailwind only emits classes it can see as literals, which is why
 * this is a table rather than a template string. 5% is finer than the eye
 * tracks on a 200px bar.
 */
const WIDTHS = [
  'w-0', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]', 'w-[35%]',
  'w-[40%]', 'w-[45%]', 'w-[50%]', 'w-[55%]', 'w-[60%]', 'w-[65%]', 'w-[70%]', 'w-[75%]',
  'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-full',
] as const

function widthClass(fraction: number): string {
  const step = Math.min(WIDTHS.length - 1, Math.max(0, Math.round(fraction * 20)))
  return WIDTHS[step] as string
}

/**
 * XHR rather than fetch, only because fetch cannot report upload progress.
 * A 25 MB photo on site wifi is a long silence otherwise, and a progress bar
 * is the difference between "working" and "broken" to the person waiting.
 */
function putWithProgress(
  url: string,
  file: File,
  onProgress: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total)
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Storage rejected the upload (${xhr.status}).`))
    xhr.onerror = () => reject(new Error('The connection dropped during upload.'))
    xhr.send(file)
  })
}

export function MediaUploader({ onUploaded }: { onUploaded?: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<QueueItem[]>([])
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)

  const patch = useCallback((id: string, next: Partial<QueueItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i)))
  }, [])

  const enqueue = useCallback((files: FileList | File[]) => {
    const added: QueueItem[] = []
    for (const file of Array.from(files)) {
      const id = `f${nextId.current++}`
      // Checked before anything is sent, so an operator finds out about a
      // 40 MB TIFF now rather than after waiting for it to upload.
      const check = checkMediaUpload({
        filename: file.name,
        contentType: file.type,
        bytes: file.size,
      })
      added.push({
        id,
        file,
        alt: suggestAltFromFilename(file.name),
        progress: 0,
        status: check.ok ? 'queued' : 'error',
        message: check.ok ? undefined : check.message,
      })
    }
    setItems((prev) => [...prev, ...added])
  }, [])

  async function uploadAll() {
    setBusy(true)
    // Sequential, not parallel. Six 20 MB files at once on a site connection
    // starves them all and the progress bars crawl together; one at a time
    // finishes the first file first, which is what someone waiting wants.
    for (const item of items) {
      if (item.status !== 'queued') continue
      patch(item.id, { status: 'uploading', progress: 0 })
      try {
        const ticket = await createMediaUploadTicket({
          filename: item.file.name,
          contentType: item.file.type,
          bytes: item.file.size,
        })
        if (!ticket.success) {
          patch(item.id, { status: 'error', message: ticket.message })
          continue
        }
        await putWithProgress(ticket.data.signedUrl, item.file, (f) =>
          patch(item.id, { progress: f })
        )
        const finalised = await finaliseMediaUpload({
          key: ticket.data.key,
          bucket: ticket.data.bucket,
          filename: item.file.name,
          contentType: item.file.type,
          alt: item.alt.trim() || null,
        })
        if (!finalised.success) {
          patch(item.id, { status: 'error', message: finalised.message })
          continue
        }
        patch(item.id, { status: 'done', progress: 1 })
      } catch (err) {
        patch(item.id, {
          status: 'error',
          message: err instanceof Error ? err.message : 'Upload failed.',
        })
      }
    }
    setBusy(false)
    router.refresh()
    onUploaded?.()
  }

  const queued = items.filter((i) => i.status === 'queued')
  const done = items.filter((i) => i.status === 'done').length

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files)
        }}
        className={cn(
          'flex flex-col items-center gap-1.5 rounded-lg border px-4 py-7 text-center transition-colors',
          over ? 'border-ih-accent bg-ih-accent-soft' : 'border-ih-border bg-ih-bg'
        )}
      >
        <UploadCloud size={20} strokeWidth={1.6} aria-hidden="true" className="text-ih-muted" />
        <p className="text-[13px] text-ih-ink-2">
          Drag files here, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-ih-accent underline underline-offset-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
          >
            browse
          </button>
        </p>
        <p className="text-[11.5px] text-ih-muted">
          {MEDIA_UPLOAD_ACCEPT_LABEL} · up to {MAX_MEDIA_UPLOAD_BYTES / 1024 / 1024} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MEDIA_UPLOAD_ACCEPT}
          className="sr-only"
          aria-label="Choose files to upload"
          onChange={(e) => {
            if (e.target.files?.length) enqueue(e.target.files)
            // Reset so choosing the same file twice still fires a change.
            e.target.value = ''
          }}
        />
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-ih-border bg-ih-surface px-3 py-2"
            >
              <span className="w-8 flex-shrink-0">
                {item.status === 'done' ? (
                  <Check size={14} strokeWidth={2} className="text-ih-success" aria-hidden="true" />
                ) : item.status === 'error' ? (
                  <AlertTriangle
                    size={14}
                    strokeWidth={2}
                    className="text-ih-danger"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="font-mono text-[11px] tabular-nums text-ih-muted">
                    {item.status === 'uploading' ? `${Math.round(item.progress * 100)}%` : '—'}
                  </span>
                )}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[12.5px]" title={item.file.name}>
                  {item.file.name}
                </span>
                {item.status === 'error' ? (
                  <span className="text-[11.5px] text-ih-danger" role="alert">
                    {item.message}
                  </span>
                ) : item.status === 'uploading' ? (
                  <span
                    className="block h-1 overflow-hidden rounded-full bg-ih-surface-2"
                    role="progressbar"
                    aria-valuenow={Math.round(item.progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Uploading ${item.file.name}`}
                  >
                    <span
                      className={cn(
                        'block h-full rounded-full bg-ih-accent transition-[width] duration-150',
                        widthClass(item.progress)
                      )}
                    />
                  </span>
                ) : null}
              </div>

              {item.status === 'queued' ? (
                <>
                  <label className="sr-only" htmlFor={`alt-${item.id}`}>
                    Alt text for {item.file.name}
                  </label>
                  <Input
                    id={`alt-${item.id}`}
                    value={item.alt}
                    onChange={(e) => patch(item.id, { alt: e.target.value })}
                    placeholder="Describe the image"
                    className="h-8 w-56 flex-shrink-0 text-[12px]"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    aria-label={`Remove ${item.file.name} from the queue`}
                    className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
                  >
                    <X size={12} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <div className="flex items-center gap-2">
          <Button kind="primary" size="sm" onClick={uploadAll} loading={busy} disabled={queued.length === 0}>
            Upload {queued.length > 0 ? queued.length : ''}
          </Button>
          <Button kind="ghost" size="sm" onClick={() => setItems([])} disabled={busy}>
            Clear
          </Button>
          {done > 0 ? (
            <span className="text-[12px] text-ih-muted" role="status">
              {done} uploaded
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The uploader, behind a disclosure.
 *
 * Self-contained rather than split between the page header and the body: the
 * trigger and the panel share one piece of state, and keeping them in the same
 * client component avoids turning the whole page into a client component to
 * hoist a boolean. AdminPageShell stays server-rendered.
 *
 * Collapsed by default because this is a browse screen first — a permanently
 * open dropzone would push the library down the page for the majority of
 * visits that are looking for something rather than adding something.
 */
export function MediaUploadPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button
          kind={open ? 'ghost' : 'outline'}
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          icon={<UploadCloud size={13} strokeWidth={1.7} />}
        >
          {open ? 'Hide uploader' : 'Upload files'}
        </Button>
      </div>
      {open ? <MediaUploader onUploaded={() => undefined} /> : null}
    </div>
  )
}
