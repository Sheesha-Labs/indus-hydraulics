'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { setPromo, uploadPromoImage } from '../actions'
import type { EditorItem } from './NavigationEditor'

interface Props {
  item: EditorItem
  onClose: () => void
  onSaved: () => void
}

export default function PromoFormDialog({ item, onClose, onSaved }: Props) {
  const [imageId, setImageId] = useState<string | null>(item.promoImageId)
  const [imageUrl, setImageUrl] = useState<string | null>(item.promoImageUrl)
  const [heading, setHeading] = useState(item.promoHeading ?? '')
  const [body, setBody] = useState(item.promoBody ?? '')
  const [linkUrl, setLinkUrl] = useState(item.promoLinkUrl ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadPromoImage(fd)
      if (!result.success) {
        setError(result.message)
        return
      }
      setImageId(result.data.mediaId)
      setImageUrl(result.data.url)
    } finally {
      setUploading(false)
    }
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await setPromo({
        itemId: item.id,
        promoImageId: imageId ?? '',
        promoHeading: heading || undefined,
        promoBody: body || undefined,
        promoLinkUrl: linkUrl || undefined,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      onSaved()
    })
  }

  function clearImage() {
    setImageId(null)
    setImageUrl(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-12 px-4 overflow-y-auto">
      <div className="bg-white border border-[var(--color-border)] w-full max-w-lg p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h2 className="text-[18px] font-semibold">Promo tile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Featured tile shown at the bottom of the <span className="font-medium">{item.label}</span> column.
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] text-[var(--color-muted)]">Image</span>
          {imageUrl ? (
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 border border-[var(--color-border)]">
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="text-[12px] text-[var(--color-danger)] hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleUpload(f)
              }}
              disabled={uploading}
              className="text-[13px]"
            />
          )}
          {uploading ? <span className="text-[11px] text-[var(--color-muted)]">Uploading…</span> : null}
        </div>

        <label className="flex flex-col gap-1 text-[12px]">
          <span className="text-[var(--color-muted)]">Heading</span>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12px]">
          <span className="text-[var(--color-muted)]">Body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="px-3 py-2 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12px]">
          <span className="text-[var(--color-muted)]">Link URL</span>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/sale or https://example.com"
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px] font-mono"
          />
        </label>

        {error ? (
          <p role="alert" className="text-[12px] text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-9 px-4 border border-[var(--color-border)] text-[13px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
