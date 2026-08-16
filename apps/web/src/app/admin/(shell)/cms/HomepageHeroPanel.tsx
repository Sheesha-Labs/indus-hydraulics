'use client'

/**
 * Homepage hero carousel admin panel — rendered inside cms/page.tsx when
 * `?tab=hero`. List of slides with thumbnail, alt-text editor, publish
 * toggle, up/down reorder buttons, and delete.
 *
 * Talks to the server actions in cms/actions.ts.
 */

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  uploadHomeHeroSlide,
  updateHomeHeroSlide,
  moveHomeHeroSlide,
  deleteHomeHeroSlide,
} from './actions'

export type HeroSlideRow = {
  id: string
  position: number
  alt: string | null
  isPublished: boolean
  createdAt: Date
  media: {
    id: string
    storagePath: string
    originalFilename: string
    width: number | null
    height: number | null
  }
}

interface Props {
  slides: HeroSlideRow[]
}

export default function HomepageHeroPanel({ slides }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [uploadKey, setUploadKey] = useState(0) // bump to reset the file input after a successful upload

  function refresh() {
    router.refresh()
  }

  async function handleUpload(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await uploadHomeHeroSlide(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setUploadKey((k) => k + 1)
      refresh()
    })
  }

  async function handleUpdate(id: string, patch: { alt?: string | null; isPublished?: boolean }) {
    setError(null)
    startTransition(async () => {
      const res = await updateHomeHeroSlide({ id, ...patch })
      if (!res.success) {
        setError(res.message)
        return
      }
      refresh()
    })
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    setError(null)
    startTransition(async () => {
      const res = await moveHomeHeroSlide({ id, direction })
      if (!res.success) {
        setError(res.message)
        return
      }
      refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this slide? This removes the image from storage and cannot be undone.')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteHomeHeroSlide(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <form
        action={handleUpload}
        className="border border-ih-border bg-ih-surface p-5 space-y-3"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-[14px] font-semibold">Add a new slide</h2>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
            JPEG / PNG / WebP / GIF · ≤ 10 MB · ~1200×1100 recommended
          </span>
        </div>
        <div className="grid grid-cols-[1fr_240px_120px] gap-3">
          <input
            key={uploadKey}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="text-[13px]"
          />
          <input
            name="alt"
            type="text"
            placeholder="Alt text (for screen readers)"
            maxLength={200}
            className="border border-ih-border bg-ih-bg px-3 py-2 text-[13px]"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-10 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      {error && (
        <div className="border border-ih-danger bg-[var(--color-ih-danger)]/10 px-4 py-3 text-[13px] text-ih-danger">
          {error}
        </div>
      )}

      {/* Slide list */}
      <div className="border border-ih-border">
        {slides.length === 0 ? (
          <div className="py-12 text-center text-ih-muted text-[13px]">
            No slides yet. The storefront falls back to the static placeholder until at least one published slide exists.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[60px_120px_1fr_200px_100px_120px_60px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
              <div>#</div>
              <div>Preview</div>
              <div>Filename</div>
              <div>Alt text</div>
              <div className="text-center">Status</div>
              <div className="text-center">Reorder</div>
              <div />
            </div>
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={`grid grid-cols-[60px_120px_1fr_200px_100px_120px_60px] px-4 py-3 items-center bg-ih-surface gap-3 ${
                  i > 0 ? 'border-t border-ih-border' : ''
                }`}
              >
                <div className="font-mono text-[12px] text-ih-muted">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative w-[100px] h-[80px] bg-ih-surface-2 overflow-hidden">
                  <Image
                    src={slide.media.storagePath}
                    alt={slide.alt ?? slide.media.originalFilename}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
                <div className="font-mono text-[11px] text-ih-ink-2 truncate" title={slide.media.originalFilename}>
                  {slide.media.originalFilename}
                </div>
                <input
                  type="text"
                  defaultValue={slide.alt ?? ''}
                  placeholder="(no alt)"
                  maxLength={200}
                  onBlur={(e) => {
                    const next = e.target.value.trim()
                    if (next === (slide.alt ?? '')) return
                    handleUpdate(slide.id, { alt: next || null })
                  }}
                  className="border border-ih-border bg-ih-bg px-2 py-1.5 text-[12px]"
                />
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleUpdate(slide.id, { isPublished: !slide.isPublished })}
                    disabled={pending}
                    className={`px-2 py-0.5 font-mono text-[10px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 ${
                      slide.isPublished
                        ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                        : 'text-ih-muted bg-ih-surface-2'
                    }`}
                  >
                    {slide.isPublished ? 'Published' : 'Hidden'}
                  </button>
                </div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(slide.id, 'up')}
                    disabled={pending || i === 0}
                    aria-label="Move up"
                    title="Move up"
                    className="w-8 h-8 flex items-center justify-center border border-ih-border bg-ih-bg hover:bg-ih-surface-2 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-[14px]"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(slide.id, 'down')}
                    disabled={pending || i === slides.length - 1}
                    aria-label="Move down"
                    title="Move down"
                    className="w-8 h-8 flex items-center justify-center border border-ih-border bg-ih-bg hover:bg-ih-surface-2 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-[14px]"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(slide.id)}
                    disabled={pending}
                    aria-label="Delete slide"
                    className="font-mono text-[11px] text-ih-danger hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
