'use client'

import { useRef, useState, useTransition } from 'react'
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
}

/**
 * Lite OG image picker. No full media gallery — just the most recent ~50
 * images plus an inline upload. The drawer's OG preview reads the
 * resolved `storagePath` so the user sees the choice immediately.
 *
 * The full grid-based media browser ships in Phase 2.
 */
export default function OgImagePicker({ value, recent, uploadAction, onChange }: Props) {
  const [items, setItems] = useState<RecentMedia[]>(recent)
  const [pending, startTransition] = useTransition()
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
      <div className="flex gap-3 items-start">
        <div className="w-32 h-32 border border-ih-border bg-ih-surface-2 grid place-items-center overflow-hidden flex-shrink-0">
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveUrl(selected.storagePath)}
              alt={selected.alt ?? ''}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-ih-muted">No image</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <select
            value={value ?? ''}
            onChange={(e) => handleSelect(e.target.value || null)}
            className="h-9 px-2 border border-ih-border bg-white text-[13px]"
          >
            <option value="">— Use site default —</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {truncate(item.alt ?? item.originalFilename, 60)}
              </option>
            ))}
          </select>
          <label className="text-[12px] text-ih-ink-2 cursor-pointer">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={pending}
            />
            <span className="inline-block h-8 px-3 bg-ih-surface-2 border border-ih-border hover:bg-ih-surface grid place-items-center font-mono text-[11px]">
              {pending ? 'Uploading…' : 'Upload new image'}
            </span>
          </label>
          {error && (
            <span className="text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
              {error}
            </span>
          )}
          <p className="text-[11px] text-ih-muted-2">
            JPEG / PNG / WebP. Recommended 1200×630 (1.91:1) for the cleanest social card.
          </p>
        </div>
      </div>
    </div>
  )
}

function resolveUrl(storagePath: string): string {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  return base ? `${base}/${storagePath}` : storagePath
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}
