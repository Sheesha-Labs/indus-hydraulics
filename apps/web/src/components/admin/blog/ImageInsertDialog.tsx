'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import type { Result } from '../../../lib/result'
import { mediaUrl } from '../../../lib/media'

export type BodyMedia = {
  id: string
  storagePath: string
  alt: string | null
  originalFilename: string
}

export type InsertedFigure = {
  storagePath: string
  previewUrl: string
  caption: string
  captionPrefix: string | null
  aspectRatio: '16/9' | '21/9' | '4/3' | '1/1'
}

type UploadResult = Result<{
  mediaId: string
  storagePath: string
  alt: string | null
  originalFilename: string
}>

type Props = {
  open: boolean
  onClose: () => void
  media: BodyMedia[]
  uploadAction: (formData: FormData) => Promise<UploadResult>
  /** Bubbles a fresh upload up so the library list has it without a refresh. */
  onUploaded: (m: BodyMedia) => void
  onInsert: (figure: InsertedFigure) => void
}

const RATIOS = ['16/9', '21/9', '4/3', '1/1'] as const

/**
 * Picks an image from the media library — or uploads one — and inserts it into
 * the body at the cursor.
 *
 * Hand-rolled overlay because nothing in this codebase provides one: no Radix
 * dialog is installed, so the focus trap, Escape handling and focus
 * restoration are this component's own job (CLAUDE.md §10.5).
 *
 * The caption is required. A `figure` block's caption is what the article
 * renders under the image and what a screen reader announces for it, and the
 * schema rejects an empty one — asking here beats a save that fails with a
 * validation error pointing at a block the author cannot see.
 */
export default function ImageInsertDialog(props: Props) {
  // The form is mounted only while the dialog is open, so every open starts
  // from blank state. Resetting it in an effect instead would leave the first
  // render showing the previous selection — and is how an author ends up
  // attaching the wrong image to the next insert.
  if (!props.open) return null
  return <ImageInsertForm {...props} />
}

function ImageInsertForm({ onClose, media, uploadAction, onUploaded, onInsert }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [captionPrefix, setCaptionPrefix] = useState('')
  const [aspectRatio, setAspectRatio] = useState<(typeof RATIOS)[number]>('16/9')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  // Focus moves into the dialog rather than staying on the toolbar button
  // behind it, and is handed back on close — the overlay is hand-rolled, so
  // both halves are this component's job (CLAUDE.md §10.5).
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(
      () => dialogRef.current?.querySelector('input')?.focus(),
      0,
    )
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
      if (event.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, select, textarea, [href]',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const images = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return media
    return media.filter((m) => m.originalFilename.toLowerCase().includes(term))
  }, [media, query])

  const picked = media.find((m) => m.id === selected) ?? null

  function close() {
    onClose()
    returnFocusRef.current?.focus()
  }

  function upload(file: File | undefined) {
    if (!file) return
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', file.name.replace(/\.[^.]+$/, ''))
    startTransition(async () => {
      const result = await uploadAction(formData)
      if (!result.success) {
        setError(result.message)
        return
      }
      const next: BodyMedia = {
        id: result.data.mediaId,
        storagePath: result.data.storagePath,
        alt: result.data.alt,
        originalFilename: result.data.originalFilename,
      }
      onUploaded(next)
      setSelected(next.id)
    })
  }

  function insert() {
    if (!picked) return
    if (!caption.trim()) {
      setError('A caption is required — it is what the article prints under the image.')
      return
    }
    onInsert({
      storagePath: picked.storagePath,
      previewUrl: mediaUrl(picked.storagePath),
      caption: caption.trim(),
      captionPrefix: captionPrefix.trim() || null,
      aspectRatio,
    })
    close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ih-navy/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-image-title"
        className="flex max-h-[86vh] w-full max-w-[680px] flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-ih-border px-5 py-3.5">
          <div>
            <h2 id="insert-image-title" className="text-[15px] font-medium text-ih-ink">
              Insert an image
            </h2>
            <p className="mt-0.5 text-[12px] text-ih-muted">
              Pick one from the media library or upload a new file. It lands where the cursor is.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2">
            <label htmlFor="image-search" className="sr-only">
              Search the media library by filename
            </label>
            <input
              id="image-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="h-8 flex-1 rounded-md border border-ih-border bg-ih-bg px-2.5 text-[12.5px] outline-none focus:border-ih-accent"
            />
            <label
              className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-ih-border px-2.5 text-[12px] transition-colors hover:bg-ih-surface-2 ${
                pending ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <Upload size={12} strokeWidth={1.8} />
              {pending ? 'Uploading…' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={pending}
                onChange={(e) => {
                  upload(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <div className="max-h-[240px] overflow-y-auto rounded-md border border-ih-border p-2">
            {images.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-ih-muted">
                {media.length === 0
                  ? 'The media library has no images yet — upload one to get started.'
                  : 'No images match that filename.'}
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {images.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelected(m.id)}
                    aria-pressed={selected === m.id}
                    title={m.originalFilename}
                    className={`relative aspect-[4/3] overflow-hidden rounded-md border-2 bg-ih-surface-2 transition-colors ${
                      selected === m.id
                        ? 'border-ih-accent'
                        : 'border-transparent hover:border-ih-border-strong'
                    }`}
                  >
                    <Image
                      src={mediaUrl(m.storagePath)}
                      alt={m.alt ?? m.originalFilename}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div>
              <label
                htmlFor="figure-caption"
                className="mb-1 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted"
              >
                Caption *
              </label>
              <input
                id="figure-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What the image shows"
                className="h-9 w-full rounded-md border border-ih-border bg-ih-bg px-2.5 text-[13px] outline-none focus:border-ih-accent"
              />
              <p className="mt-1 text-[11px] text-ih-muted-2">
                Printed under the image, and read out in place of it by a screen reader.
              </p>
            </div>
            <div>
              <label
                htmlFor="figure-prefix"
                className="mb-1 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted"
              >
                Prefix
              </label>
              <input
                id="figure-prefix"
                value={captionPrefix}
                onChange={(e) => setCaptionPrefix(e.target.value)}
                placeholder="FIG. 01"
                className="h-9 w-full rounded-md border border-ih-border bg-ih-bg px-2.5 font-mono text-[12px] outline-none focus:border-ih-accent"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              Shape
            </span>
            <div className="flex gap-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  aria-pressed={aspectRatio === r}
                  className={`h-7 rounded-md border px-2.5 font-mono text-[11px] transition-colors ${
                    aspectRatio === r
                      ? 'border-ih-accent bg-ih-accent-soft text-ih-accent'
                      : 'border-ih-border text-ih-muted hover:text-ih-ink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-[12px] text-ih-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ih-border px-5 py-3">
          <button
            type="button"
            onClick={close}
            className="h-9 rounded-md border border-ih-border px-4 text-[13px] font-medium text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={insert}
            disabled={!picked}
            className="h-9 rounded-md bg-ih-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Insert image
          </button>
        </div>
      </div>
    </div>
  )
}
