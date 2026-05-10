'use client'

import { useState } from 'react'

type MediaRow = {
  id: string
  storagePath: string
  alt: string | null
  originalFilename: string
}

type Props = {
  /** Hidden input name — emitted into the surrounding <form>. */
  name: string
  defaultValue?: string | null
  recent: MediaRow[]
  /** Optional R2/public-URL prefix for thumbnails. */
  publicUrlBase?: string
  /** Helper text below the picker. */
  hint?: string
}

/**
 * Tiny media-library picker. Drops into any <form> as a hidden input
 * (`name={name}`) whose value is the selected Media.id. Click a recent
 * thumbnail to set; click the current row's × to clear; type a UUID
 * manually for media that's not in the latest 50.
 */
export default function MediaPicker({
  name,
  defaultValue,
  recent,
  publicUrlBase,
  hint,
}: Props) {
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [open, setOpen] = useState(false)

  const selected = value ? recent.find((m) => m.id === value) : null

  function thumbUrl(m: MediaRow): string {
    if (m.storagePath.startsWith('http')) return m.storagePath
    if (publicUrlBase) return `${publicUrlBase}/${m.storagePath}`
    return m.storagePath
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />

      {/* Current selection row */}
      <div className="flex items-center gap-3 border border-[var(--color-border)] bg-white p-2">
        <div className="w-14 h-14 bg-[var(--color-deep)] border border-[var(--color-border)] grid place-items-center overflow-hidden shrink-0">
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl(selected)} alt={selected.alt ?? ''} className="max-w-full max-h-full object-contain" />
          ) : value ? (
            <span className="font-mono text-[9px] text-[var(--color-muted)] text-center px-1">
              {value.slice(0, 8)}…
            </span>
          ) : (
            <span className="font-mono text-[10px] text-[var(--color-caption)]">none</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Media UUID, or click a thumbnail below"
            className="w-full h-8 px-2 border border-[var(--color-border)] text-[12px] font-mono"
          />
          {selected && (
            <div className="text-[11px] text-[var(--color-muted)] truncate mt-1">
              {selected.originalFilename}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-7 px-3 text-[11px] border border-[var(--color-border)] bg-white hover:border-[var(--color-body)]"
          >
            {open ? 'Hide' : 'Browse'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              className="h-7 px-3 text-[11px] border border-[var(--color-border)] bg-white text-[oklch(0.5_0.16_25)]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Recent grid */}
      {open && (
        <div className="border border-[var(--color-border)] bg-[var(--color-deep)] p-3">
          {recent.length === 0 ? (
            <p className="text-[12px] text-[var(--color-muted)] py-4 text-center">
              No images in the media library yet. Upload via the media admin page.
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-2 max-h-[240px] overflow-y-auto">
              {recent.map((m) => {
                const active = m.id === value
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setValue(m.id)}
                    title={m.originalFilename}
                    className={`aspect-square bg-white border ${active ? 'border-[var(--color-accent)] outline outline-2 outline-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-body)]'} grid place-items-center overflow-hidden`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl(m)}
                      alt={m.alt ?? m.originalFilename}
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {hint && <span className="text-[11px] text-[var(--color-muted)]">{hint}</span>}
    </div>
  )
}
