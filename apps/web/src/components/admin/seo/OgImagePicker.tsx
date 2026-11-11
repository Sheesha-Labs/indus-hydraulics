'use client'

import { useRef, useState, useTransition } from 'react'
import { ImageIcon, Upload, X } from 'lucide-react'
import { Button } from '@indus/ui'
import { MediaBrowserDialog } from '../MediaBrowserDialog'
import type { Result } from '../../../lib/result'

export type RecentMedia = {
  id: string
  storagePath: string
  alt: string | null
  originalFilename: string
}

interface Props {
  /** Currently-selected media id, or null. Stored in `Product.ogImageMediaId` etc. */
  value: string | null
  /** Recent images for the picker. Loaded server-side. */
  recent: RecentMedia[]
  /** Server action invoked when the user uploads a new file. */
  uploadAction: (formData: FormData) => Promise<Result<{ mediaId: string; storagePath: string; alt: string | null; originalFilename: string }>>
  /** Called whenever the selection changes. Parent stores the id in form state. */
  onChange: (value: string | null, preview: { storagePath: string; alt: string | null } | null) => void
  /** What the picker says when nothing is selected. Defaults to the OG-image wording. */
  emptyLabel?: string
  /** Hint line under the picker. Defaults to the OG-image sizing guidance. */
  hint?: string
  /** Title of the library dialog. Defaults to the OG-image wording. */
  dialogTitle?: string
}

/**
 * Lite OG image picker. No full media gallery — just the most recent ~50
 * images plus an inline upload. The drawer's OG preview reads the
 * resolved `storagePath` so the user sees the choice immediately.
 *
 * The full grid-based media browser ships in Phase 2.
 */
export default function OgImagePicker({
  value,
  recent,
  uploadAction,
  onChange,
  emptyLabel = 'Using the site default',
  hint = 'JPEG / PNG / WebP. Recommended 1200×630 (1.91:1) for the cleanest social card.',
  dialogTitle = 'Choose a social share image',
}: Props) {
  const [items, setItems] = useState<RecentMedia[]>(recent)
  const [pending, startTransition] = useTransition()
  const [browsing, setBrowsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = items.find((i) => i.id === value) ?? null

  function handleSelect(id: string | null) {
    setError(null)
    const next = id ? (items.find((i) => i.id === id) ?? null) : null
    onChange(id, next ? { storagePath: next.storagePath, alt: next.alt } : null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', file.name.replace(/\.[^.]+$/, ''))
    startTransition(async () => {
      const res = await uploadAction(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      const newItem: RecentMedia = {
        id: res.data.mediaId,
        storagePath: res.data.storagePath,
        alt: res.data.alt,
        originalFilename: res.data.originalFilename,
      }
      setItems((prev) => [newItem, ...prev])
      handleSelect(newItem.id)
      if (fileRef.current) fileRef.current.value = ''
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/*
        Bazar's picker shape: a landscape thumbnail, then what is selected and
        the three things you can do about it on one row. The old layout put
        the "clear" action's label ("— No hero image —") where a status would
        go, so it read as the current state rather than a button, and the
        upload control was a keyboard-unreachable <label> styled as a chip.
      */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-md border border-ih-border bg-ih-surface-2 sm:w-40">
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveUrl(selected.storagePath)} alt={selected.alt ?? ''} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={20} strokeWidth={1.5} aria-hidden="true" className="text-ih-muted" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className={`truncate text-[13px] ${selected ? 'text-ih-ink-2' : 'text-ih-muted'}`}>
            {selected ? selected.originalFilename : emptyLabel}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" kind="outline" size="dense-sm" icon={<ImageIcon size={13} strokeWidth={1.8} aria-hidden="true" />} onClick={() => setBrowsing(true)}>
              {selected ? 'Change image' : 'Choose from library'}
            </Button>
            <Button
              type="button"
              kind="outline"
              size="dense-sm"
              loading={pending}
              icon={<Upload size={13} strokeWidth={1.8} aria-hidden="true" />}
              onClick={() => fileRef.current?.click()}
            >
              {pending ? 'Uploading…' : 'Upload new'}
            </Button>
            {value ? (
              <Button type="button" kind="ghost" size="dense-sm" icon={<X size={13} strokeWidth={1.8} aria-hidden="true" />} onClick={() => handleSelect(null)}>
                Clear
              </Button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handleFileChange}
              disabled={pending}
            />
          </div>
          {error && (
            <span className="text-[12px] text-ih-danger-ink" role="alert">
              {error}
            </span>
          )}
          <p className="text-[12px] text-ih-muted">{hint}</p>
        </div>
      </div>
      <MediaBrowserDialog
        open={browsing}
        onOpenChange={setBrowsing}
        selectedId={value}
        fixedKind="image"
        title={dialogTitle}
        onSelect={(media) => {
          setItems((prev) =>
            prev.some((i) => i.id === media.id)
              ? prev
              : [
                  {
                    id: media.id,
                    storagePath: media.storagePath,
                    alt: media.alt,
                    originalFilename: media.originalFilename,
                  },
                  ...prev,
                ]
          )
          onChange(media.id, { storagePath: media.storagePath, alt: media.alt })
          setBrowsing(false)
        }}
      />
    </div>
  )
}

function resolveUrl(storagePath: string): string {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  return base ? `${base}/${storagePath}` : storagePath
}

