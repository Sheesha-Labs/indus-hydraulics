'use client'

import { useEffect, useState } from 'react'
import { ImageOff, Search, X } from 'lucide-react'
import { mediaThumbnailSrc } from '@indus/domain'
import { Button, cn } from '@indus/ui'

import { getMediaById, type PickerResult } from '../../app/admin/(shell)/media/actions'
import { MediaBrowserDialog } from './MediaBrowserDialog'

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
  /**
   * Recent files, still loaded server-side. Used only to render the current
   * selection without a round-trip; browsing goes through the dialog.
   */
  recent: MediaRow[]
  /** Retained for source compatibility. Thumbnail resolution now handles the
   *  storagePath shapes directly, so this is unused. */
  publicUrlBase?: string
  /** Helper text below the picker. */
  hint?: string
}

/**
 * Media picker for content editors. Drops into any `<form>` as a hidden input
 * whose value is the selected `Media.id`.
 *
 * The external API is unchanged, deliberately — the internals were replaced
 * rather than the call sites, so every editor that already renders this gets
 * the library browser without being touched.
 *
 * What changed: choosing a file that was not among the 50 most recent used to
 * mean **pasting a UUID by hand**. With 665 files that made most of the
 * library reachable only by copying an id out of the database. The free-text
 * id field is gone; there is a search over the whole library instead.
 */
export default function MediaPicker({ name, defaultValue, recent, hint }: Props) {
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  // Only the fetched row is state. The selection itself is DERIVED, so the
  // common case — the value is among `recent` — needs no effect and no render
  // pass to settle. Mirroring it into state instead meant a synchronous
  // setState inside an effect, which cascades renders and which the React
  // lint rule correctly rejects.
  const [fetched, setFetched] = useState<PickerResult | null>(null)
  const selected: MediaRow | PickerResult | null = value
    ? (recent.find((m) => m.id === value) ?? (fetched?.id === value ? fetched : null))
    : null

  // Runs only when the saved value is older than the `recent` window — exactly
  // the case the previous picker could not render at all. The setState here is
  // asynchronous, inside the resolved promise, not in the effect body.
  useEffect(() => {
    if (!value || selected) return
    let cancelled = false
    void getMediaById({ id: value }).then((res) => {
      if (!cancelled && res.success && res.data) setFetched(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [value, selected])

  // Always 'image': this picker is image-only (the dialog below is opened
  // with fixedKind="image"), so there is no other kind a selection can be.
  // Narrowing the MediaRow | PickerResult union with `in` yields unknown here,
  // and a cast would be pretending to know something rather than knowing it.
  const thumb = selected
    ? mediaThumbnailSrc({ kind: 'image', storagePath: selected.storagePath })
    : null

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'bg-ih-surface-2 grid h-20 w-24 flex-shrink-0 place-items-center overflow-hidden rounded-md border',
            selected ? 'border-ih-border' : 'border-ih-rounded-lg border'
          )}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={selected?.alt ?? ''} className="h-full w-full object-cover" />
          ) : (
            <ImageOff size={16} strokeWidth={1.5} aria-hidden="true" className="text-ih-muted-2" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {selected ? (
            <>
              <span
                className="truncate text-[12.5px] font-medium"
                title={selected.originalFilename}
              >
                {selected.originalFilename}
              </span>
              <span className="text-ih-muted truncate text-[11.5px]" title={selected.alt ?? ''}>
                {selected.alt || 'No alt text'}
              </span>
            </>
          ) : (
            <span className="text-ih-muted text-[12.5px]">No file chosen</span>
          )}

          <div className="flex items-center gap-2">
            <Button
              kind="outline"
              size="sm"
              type="button"
              onClick={() => setOpen(true)}
              icon={<Search size={13} strokeWidth={1.7} />}
            >
              {selected ? 'Change' : 'Choose from library'}
            </Button>
            {value ? (
              <Button
                kind="ghost"
                size="sm"
                type="button"
                onClick={() => setValue('')}
                icon={<X size={13} strokeWidth={1.7} />}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {hint ? <p className="text-ih-muted text-[11.5px]">{hint}</p> : null}

      <MediaBrowserDialog
        open={open}
        onOpenChange={setOpen}
        selectedId={value || null}
        fixedKind="image"
        onSelect={(media) => {
          setValue(media.id)
          // Cached so the choice paints immediately even when it is older than
          // the `recent` window the server sent.
          setFetched(media)
          setOpen(false)
        }}
      />
    </div>
  )
}
