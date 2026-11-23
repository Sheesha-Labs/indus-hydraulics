'use client'

import { rejection } from '@indus/ops-ui/form'
import { cn } from '@indus/ops-ui/lib/cn'
import { useId, useRef, useState, type DragEvent } from 'react'
import { finishCompanyUploadAction, startCompanyUploadAction } from '../../actions/setup'
import type { CompanyImageSlot } from '../../lib/company-profile'

export type UploadedImage = {
  fileId: string
  filename: string
  /** company.assets' new version. */
  version: number
  savedAt: string
}

export interface ImageSlotProps {
  label: string
  slot: CompanyImageSlot
  accept: string[]
  /** "Drop PNG" / "Drop PNG or JPEG". */
  emptyText: string
  /** The current file's name, or null when the slot is empty. */
  fileName: string | null
  assetsVersion: number
  maxBytes: number
  onUploaded: (image: UploadedImage) => void
}

type Phase =
  { kind: 'idle' } | { kind: 'uploading'; name: string } | { kind: 'error'; message: string }

/**
 * One image tile of Setup 1 (board 79: Logo, Stamp, Signature · <person>): 72 high, dashed, "Drop PNG"
 * when empty, "<file> Replace" when filled. Click or drop. The Form kit's `rejection` refuses a wrong
 * type or an oversize file before anything is sent; then the upload is three steps: a signed upload URL
 * from the server, a PUT of the file straight to Storage, and a confirm that sniffs the bytes and points
 * company.assets at the new file. The file never passes through a server action.
 *
 * (decision) A compact tile, not the Form kit's full-width Dropzone row: the board draws four 72 px
 * tiles side by side; the kit's checks (`rejection`) are reused.
 */
export default function ImageSlot({
  label,
  slot,
  accept,
  emptyText,
  fileName,
  assetsVersion,
  maxBytes,
  onUploaded,
}: ImageSlotProps) {
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [over, setOver] = useState(false)

  async function upload(file: File) {
    const refused = rejection(file, accept, maxBytes)
    if (refused) {
      setPhase({ kind: 'error', message: `${refused}. ${emptyText.replace('Drop ', 'Use ')}.` })
      return
    }
    setPhase({ kind: 'uploading', name: file.name })
    const start = await startCompanyUploadAction({
      slot,
      filename: file.name,
      size: file.size,
      mime: file.type,
    })
    if (!start.success) return setPhase({ kind: 'error', message: start.error })
    let put: Response
    try {
      // Straight to Storage (a signed upload URL): never through a server action body.
      put = await fetch(start.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'content-type': file.type, 'x-upsert': 'false' },
      })
    } catch {
      return setPhase({
        kind: 'error',
        message: 'Upload failed. Check your connection and try again.',
      })
    }
    if (!put.ok) return setPhase({ kind: 'error', message: 'Upload failed. Try again.' })
    const done = await finishCompanyUploadAction({
      slot,
      key: start.data.key,
      filename: file.name,
      expectedVersion: assetsVersion,
    })
    if (!done.success) return setPhase({ kind: 'error', message: done.error })
    setPhase({ kind: 'idle' })
    onUploaded({
      fileId: done.data.fileId,
      filename: done.data.filename,
      version: done.data.version,
      savedAt: done.data.savedAt,
    })
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) void upload(file)
  }

  const busy = phase.kind === 'uploading'
  return (
    <div data-image-slot={slot.kind} className="flex min-w-0 flex-col gap-1.5">
      <span id={`${id}-label`} className="text-io-ink-2 text-[12px] font-medium">
        {label}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'bg-io-card rounded-io-8 flex h-[72px] items-center justify-center gap-2 border-[1.5px] border-dashed px-2 text-[12px]',
          over ? 'border-io-accent bg-io-accent-tint' : 'border-io-stroke'
        )}
      >
        {busy ? (
          <span className="text-io-ink-3 truncate">Uploading…</span>
        ) : fileName ? (
          <>
            <span className="text-io-ink min-w-0 truncate">{fileName}</span>
            <button
              type="button"
              aria-describedby={`${id}-label`}
              onClick={() => input.current?.click()}
              className="io-focus text-io-accent rounded-io-tag flex-none"
            >
              Replace
            </button>
          </>
        ) : (
          <button
            type="button"
            aria-describedby={`${id}-label`}
            onClick={() => input.current?.click()}
            className="io-focus text-io-ink-3 rounded-io-tag h-full w-full"
          >
            {emptyText}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        accept={accept.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void upload(file)
        }}
      />
      {phase.kind === 'error' ? (
        <span role="alert" className="text-io-bad text-[11.5px] leading-[1.4]">
          {phase.message}
        </span>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {busy ? `Uploading ${phase.name}` : ''}
      </span>
    </div>
  )
}
