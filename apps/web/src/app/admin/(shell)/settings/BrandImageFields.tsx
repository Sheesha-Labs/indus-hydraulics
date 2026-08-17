'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { Crop, Upload, X } from 'lucide-react'
import {
  LOGO_STYLES,
  LOGO_STYLE_DESCRIPTION,
  LOGO_STYLE_LABEL,
  type LogoStyle,
} from '../../../../lib/brand-identity'
import { uploadBrandImage } from './actions'
import { trimTransparentPadding, type TrimResult } from './_trim-client'

/** One row of the media library as the picker needs it. */
export type BrandImageOption = { id: string; filename: string; url: string }

/** What actually happened to the file, so the note does not overstate it. */
function trimNote(trim: Extract<TrimResult, { status: 'trimmed' }>): string {
  const padding = Math.round((1 - trim.coverage) * 100)
  const size = `Now ${trim.width}×${trim.height}.`
  return padding >= 2 ? `Cropped ${padding}% transparent padding. ${size}` : `Resized for the web. ${size}`
}

/**
 * Shared picker behind every brand-image field.
 *
 * Value is a Media id, emitted into the surrounding <form> as a hidden input —
 * same contract as `MediaPicker`, and the same reason: the settings columns are
 * FKs to `media`, so storing the id (not the URL) is what lets the library know
 * the file is in use. `options` carries the resolved URL alongside each id so
 * the preview can render without a second round-trip.
 */
function BrandImagePicker({
  label,
  name,
  value,
  options,
  onChange,
  emptyLabel,
  previewClassName,
  previewOnInk = false,
  help,
  children,
}: {
  label: string
  /** Hidden-input name — this is what the server action reads. */
  name: string
  value: string
  options: BrandImageOption[]
  onChange: (mediaId: string) => void
  emptyLabel: string
  /** Preview box geometry — a favicon is square, a lockup is not. */
  previewClassName: string
  /**
   * Draw the preview on the navy surface instead of the checkerboard. The
   * footer logo is normally white artwork, and white-on-checkerboard is the
   * one background that hides whether it reads at all.
   */
  previewOnInk?: boolean
  help: ReactNode
  /** Extra controls shown under the field once a file is chosen. */
  children?: ReactNode
}) {
  const selectId = useId()
  const [library, setLibrary] = useState(options)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ tone: 'ok' | 'info' | 'error'; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const picked = library.find((o) => o.id === value)

  async function store(file: File, extra?: string) {
    const body = new FormData()
    body.set('file', file)
    const res = await uploadBrandImage(body)
    if (!res.success) {
      setNote({ tone: 'error', text: res.message })
      return false
    }
    setNote({
      tone: 'ok',
      text: extra ? `Uploaded "${file.name}". ${extra}` : `Uploaded "${file.name}" to the media library.`,
    })
    setLibrary((cur) => [{ id: res.data.mediaId, filename: res.data.filename, url: res.data.url }, ...cur])
    onChange(res.data.mediaId)
    return true
  }

  /**
   * Brand art is exported on an artboard, so most uploads carry a wide
   * transparent margin. `object-contain` fits that whole canvas, which is what
   * makes a logo look small in a box that is not small — and for the favicon,
   * drawn by the browser at 16px, sizing cannot compensate at all. So the
   * padding comes off here, once, and every surface downstream draws ink
   * rather than air. Art that already fills its canvas is uploaded untouched.
   */
  async function upload(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setNote(null)
    const trim = await trimTransparentPadding(file, file.name)
    if (trim.status === 'trimmed') {
      const pct = Math.round((1 - trim.coverage) * 100)
      await store(trim.file, `Trimmed ${pct}% transparent padding.`)
    } else {
      await store(file)
    }
    setBusy(false)
  }

  /** Same trim, for a file that is already in the library. */
  async function trimCurrent() {
    if (!picked) return
    setBusy(true)
    setNote(null)
    const trim = await trimTransparentPadding(picked.url, picked.filename)

    if (trim.status === 'error') {
      setNote({ tone: 'error', text: trim.message })
      setBusy(false)
      return
    }
    if (trim.status === 'unchanged') {
      setNote({
        tone: 'info',
        text:
          trim.reason === 'already-tight'
            ? 'No transparent padding to trim — this file already fills its canvas.'
            : trim.reason === 'blank'
              ? 'That image is fully transparent.'
              : 'That file is not a raster image.',
      })
      setBusy(false)
      return
    }

    await store(trim.file, trimNote(trim))
    setBusy(false)
  }

  return (
    <div className="border border-ih-border bg-white p-4">
      <input type="hidden" name={name} value={value} />

      <label
        htmlFor={selectId}
        className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2"
      >
        {label}
      </label>

      <div className="flex items-start gap-3">
        {/*
          Checkerboard behind the preview: brand art is usually a transparent
          PNG, and a white swatch on a white card hides exactly the mistake an
          operator needs to catch before saving. The footer field opts out and
          previews on navy instead — that is the surface it actually lands on.
        */}
        <div
          className={`relative shrink-0 overflow-hidden border border-ih-border ${
            previewOnInk ? 'bg-ih-navy' : 'bg-ih-surface-2 ih-checkerboard'
          } ${previewClassName}`}
        >
          {picked ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picked.url}
              alt={picked.filename}
              className="absolute inset-0 h-full w-full object-contain p-1.5"
            />
          ) : (
            <span
              className={`absolute inset-0 grid place-items-center font-mono text-[10px] ${
                previewOnInk ? 'text-white/45' : 'text-ih-muted-2'
              }`}
            >
              none
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <select
            id={selectId}
            className="w-full h-8 px-2 border border-ih-border bg-white text-[12px] focus:border-ih-accent outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{emptyLabel}</option>
            {library.map((o) => (
              <option key={o.id} value={o.id}>
                {o.filename}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11.5px] text-ih-muted hover:text-ih-ink disabled:opacity-50"
            >
              <Upload size={11} strokeWidth={1.8} />
              {busy ? 'Working…' : 'Upload new'}
            </button>
            {picked ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void trimCurrent()}
                  className="inline-flex items-center gap-1 text-[11.5px] text-ih-muted hover:text-ih-ink disabled:opacity-50"
                  title="Crop the transparent margin off this file and save the result as a new asset."
                >
                  <Crop size={11} strokeWidth={1.8} /> Trim padding
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 text-[11.5px] text-ih-muted hover:text-ih-ink"
                >
                  <X size={11} /> Remove
                </button>
              </>
            ) : null}
          </div>

          <p className="text-[11px] leading-[1.5] text-ih-muted">{help}</p>

          {note ? (
            <p
              className={`text-[11px] ${
                note.tone === 'error'
                  ? 'text-ih-danger'
                  : note.tone === 'ok'
                    ? 'text-ih-success'
                    : 'text-ih-muted'
              }`}
            >
              {note.text}
            </p>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/avif,image/jpeg"
          className="hidden"
          onChange={(e) => {
            void upload(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {picked ? children : null}
    </div>
  )
}

/** The logo that renders in the storefront top bar. */
export function LogoField({
  value,
  style,
  options,
  onChange,
  onStyleChange,
}: {
  value: string
  style: LogoStyle
  options: BrandImageOption[]
  onChange: (mediaId: string) => void
  onStyleChange: (style: LogoStyle) => void
}) {
  return (
    <BrandImagePicker
      label="Header logo"
      name="logoMediaId"
      value={value}
      options={options}
      onChange={onChange}
      emptyLabel="No logo — use the built-in mark"
      previewClassName="h-20 w-20"
      help={
        <>
          PNG, WebP or AVIF with a transparent background. The top bar draws it 44px tall, so anything
          above ~256px on the long edge is only weight. Artboard padding is cropped off on upload —
          export it however you like. SVG is not accepted: it can carry script.
        </>
      }
    >
      {/* Only meaningful once there is a logo — with none, both options render
          the same built-in mark and the choice is noise. */}
      <div className="mt-4">
        <span className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
          Placement
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LOGO_STYLES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onStyleChange(option)}
              aria-pressed={style === option}
              className={`text-left border px-3 py-2 transition-colors ${
                style === option
                  ? 'border-ih-accent bg-ih-accent-soft'
                  : 'border-ih-border hover:border-ih-accent'
              }`}
            >
              <span className="block text-[13px] text-ih-ink">{LOGO_STYLE_LABEL[option]}</span>
              <span className="block text-[11px] leading-[1.5] text-ih-muted mt-0.5">
                {LOGO_STYLE_DESCRIPTION[option]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </BrandImagePicker>
  )
}

/**
 * The lockup drawn in the storefront footer.
 *
 * Its own field rather than a reuse of the top-bar logo: the footer is the navy
 * surface, so the file that works there is normally the reversed (light)
 * variant of the same artwork. Left empty, the footer keeps the built-in mark
 * it has always drawn.
 */
export function FooterLogoField({
  value,
  options,
  onChange,
}: {
  value: string
  options: BrandImageOption[]
  onChange: (mediaId: string) => void
}) {
  return (
    <BrandImagePicker
      label="Footer logo"
      name="footerLogoMediaId"
      value={value}
      options={options}
      onChange={onChange}
      emptyLabel="No footer logo — use the built-in mark"
      previewClassName="h-20 w-32"
      previewOnInk
      help={
        <>
          PNG, WebP or AVIF with a transparent background. The footer sits on the navy surface, so
          upload the light/reversed artwork — the preview here is on that same background, which is
          where a dark file gives itself away. Drawn 40px tall, so anything above ~320px on the long
          edge is only weight.
        </>
      }
    />
  )
}

/** The browser-tab icon. */
export function FaviconField({
  value,
  brandName,
  options,
  onChange,
}: {
  value: string
  /** Drawn in the tab rehearsal so it reads as this site, not a mock. */
  brandName: string
  options: BrandImageOption[]
  onChange: (mediaId: string) => void
}) {
  const picked = options.find((o) => o.id === value)
  return (
    <BrandImagePicker
      label="Favicon"
      name="faviconMediaId"
      value={value}
      options={options}
      onChange={onChange}
      emptyLabel="No favicon — use the built-in default"
      previewClassName="h-20 w-20"
      help={
        <>
          Square PNG, 512×512 or smaller. This is read at 16px in a tab strip, so a full lockup turns
          to mud — use the mark alone. Artboard padding is cropped off on upload, which matters more
          here than anywhere: the browser fixes the size, so margin in the file is the one thing that
          makes a favicon small. Browsers cache favicons hard — expect to hard-refresh, or to see the
          old one for a while.
        </>
      }
    >
      {/* Tab-strip rehearsal at true size. A favicon that looks fine in the
          80px preview and illegible here is the whole failure mode. */}
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 border border-b-0 border-ih-border bg-ih-surface-2 px-2.5 py-1.5">
          {/* Plain <img>: 16px is below every optimizer breakpoint, so
              next/image would only add a request for the same bytes. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={picked?.url} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
          <span className="text-[11px] text-ih-ink">{brandName}</span>
        </span>
        <span className="text-[11px] text-ih-muted">Tab preview, actual size</span>
      </div>
    </BrandImagePicker>
  )
}

/**
 * The square mark a search engine draws beside the site.
 *
 * Its own field rather than a reuse of the favicon: a file authored to stay
 * legible at 16px in a tab strip is normally cruder than the one that should
 * stand for the brand in a result row or a knowledge panel. Left empty it falls
 * back to the favicon, then the header logo, so this is additive for an
 * operator who never touches it.
 */
export function SearchLogoField({
  value,
  brandName,
  tagline,
  fallbackUrl,
  options,
  onChange,
}: {
  value: string
  brandName: string
  /** Stands in for the meta description in the rehearsal row. */
  tagline: string | null
  /** What search engines get when this field is empty — favicon, then logo. */
  fallbackUrl: string | null
  options: BrandImageOption[]
  onChange: (mediaId: string) => void
}) {
  const picked = options.find((o) => o.id === value)
  const shown = picked?.url ?? fallbackUrl
  return (
    <BrandImagePicker
      label="Search-result logo"
      name="searchLogoMediaId"
      value={value}
      options={options}
      onChange={onChange}
      emptyLabel="No search logo — reuse the favicon"
      previewClassName="h-20 w-20"
      help={
        <>
          Square PNG, 512×512 (Google wants a multiple of 48px). This is the mark shown next to your
          result on Google and in the knowledge panel — drawn at about 24px in a result row and much
          larger in a panel, so unlike the favicon it can carry a little more detail. Left empty it
          reuses the favicon, then the header logo. Search engines re-crawl on their own schedule:
          expect days, not minutes, before a result row changes.
        </>
      }
    >
      {/*
        Result-row rehearsal at roughly true size. The failure this catches is
        the one the operator cannot otherwise see until Google has re-crawled:
        a mark that dissolves inside the small circular chip a SERP draws it in.
        `shown` rather than the picked value alone, so the row stays honest
        about the fallback when the field is empty.
      */}
      <div className="mt-4">
        <div className="border border-ih-border bg-ih-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-ih-border bg-white">
              {shown ? (
                /* Plain <img>: 28px is below every optimizer breakpoint. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={shown} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
              ) : (
                <span className="h-3 w-3 rounded-full bg-ih-muted-2" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] text-ih-ink">{brandName}</span>
              <span className="block truncate text-[11px] text-ih-muted">indushydraulics.com</span>
            </span>
          </div>
          <span className="mt-1.5 block text-[13px] text-ih-accent">
            {brandName} — Industrial Hydraulic Components
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-ih-muted">
            {tagline ??
              'Pumps, cylinders, valves, hoses and consumables for engineers who can’t afford downtime.'}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-ih-muted">
          {picked
            ? 'Search-result preview, approximate size'
            : 'Search-result preview — currently showing the fallback'}
        </p>
      </div>
    </BrandImagePicker>
  )
}
