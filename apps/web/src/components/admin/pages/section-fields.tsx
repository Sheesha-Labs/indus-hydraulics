'use client'

import { useEffect, useState } from 'react'
import { ImageOff, Plus, Trash2, X } from 'lucide-react'
import {
  isImageField,
  isListField,
  isSelectField,
  isToggleField,
  mediaThumbnailSrc,
  type FieldDef,
  type ImageValue,
  type ItemValue,
  type SectionValues,
  type SimpleFieldDef,
} from '@indus/domain'
import { Button, cn } from '@indus/ui'

import { getMediaById, type PickerResult } from '../../../app/admin/(shell)/media/actions'
import { MediaBrowserDialog } from '../MediaBrowserDialog'

/** Options a `select` or a seedable `list` field draws from. */
export type SeedItem = { slug: string; name: string; href?: string }
export type Seeds = Partial<Record<string, SeedItem[]>>

const inputCls =
  'w-full rounded-md border border-ih-border bg-ih-bg px-2.5 py-2 text-[13px] text-ih-ink outline-none placeholder:text-ih-muted focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'

export function FieldLabel({
  label,
  help,
  count,
}: {
  label: string
  help?: string | undefined
  count?: string | undefined
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] font-medium text-ih-ink-2">{label}</span>
      {count ? <span className="font-mono text-[10.5px] text-ih-muted-2">{count}</span> : null}
      {help && !count ? <span className="text-[10.5px] text-ih-muted-2">{help}</span> : null}
    </div>
  )
}

/** One field of any kind, including lists. */
export function FieldEditor({
  field,
  value,
  onChange,
  seeds,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: SectionValues[string]) => void
  seeds: Seeds
}) {
  if (isListField(field)) {
    const items = Array.isArray(value) ? (value as Record<string, ItemValue>[]) : []
    return (
      <div className="flex flex-col gap-2">
        <FieldLabel label={field.label} help={field.help} count={`${items.length}/${field.max}`} />
        {items.length === 0 ? (
          <p className="text-[11.5px] text-ih-muted">
            Empty — the section keeps the list it ships with. Add one to take the whole list over.
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex flex-col gap-2.5 rounded-md border border-ih-border bg-ih-surface-2 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                  {field.itemLabel} {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    kind="ghost"
                    size="icon-xs"
                    aria-label={`Move ${field.itemLabel} ${i + 1} up`}
                    disabled={i === 0}
                    onClick={() => onChange(swap(items, i, i - 1))}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    kind="ghost"
                    size="icon-xs"
                    aria-label={`Move ${field.itemLabel} ${i + 1} down`}
                    disabled={i === items.length - 1}
                    onClick={() => onChange(swap(items, i, i + 1))}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    kind="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${field.itemLabel} ${i + 1}`}
                    onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 size={12} strokeWidth={1.7} aria-hidden="true" />
                  </Button>
                </div>
              </div>
              {field.fields.map((sub) => (
                <ScalarField
                  key={sub.key}
                  field={sub}
                  value={item[sub.key]}
                  seeds={seeds}
                  onChange={(v) => {
                    const next = items.slice()
                    next[i] = { ...item, [sub.key]: v }
                    onChange(next)
                  }}
                />
              ))}
            </li>
          ))}
        </ul>
        {items.length < field.max ? (
          <Button
            type="button"
            kind="outline"
            size="dense-sm"
            className="self-start"
            onClick={() => onChange([...items, blankItem(field.fields)])}
          >
            <Plus size={12} strokeWidth={1.9} aria-hidden="true" /> Add {field.itemLabel}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <ScalarField
      field={field}
      value={value as ItemValue}
      onChange={onChange}
      seeds={seeds}
    />
  )
}

function swap<T>(items: T[], a: number, b: number): T[] {
  const next = items.slice()
  const moved = next[a]!
  next[a] = next[b]!
  next[b] = moved
  return next
}

function blankItem(fields: readonly FieldDef[]): Record<string, ItemValue> {
  const out: Record<string, ItemValue> = {}
  for (const f of fields) {
    out[f.key] = isToggleField(f) ? true : isImageField(f) ? { mediaId: null, alt: null } : ''
  }
  return out
}

function ScalarField({
  field,
  value,
  onChange,
  seeds,
}: {
  field: Exclude<FieldDef, { kind: 'list' }>
  value: ItemValue | undefined
  onChange: (v: ItemValue) => void
  seeds: Seeds
}) {
  if (isToggleField(field)) {
    const on = value !== false
    return (
      <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px]">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 accent-ih-accent"
        />
        <span className={cn(!on && 'text-ih-muted')}>
          {on ? field.label : `${field.label} — hidden`}
        </span>
      </label>
    )
  }

  if (isSelectField(field)) {
    const options = seeds[field.optionsKey] ?? []
    const picked = typeof value === 'string' ? value : ''
    const missing = picked !== '' && !options.some((o) => o.slug === picked)
    return (
      <div className="flex flex-col gap-1.5">
        <FieldLabel label={field.label} help={field.help} />
        <select
          className={inputCls}
          value={picked}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">{field.placeholder ?? 'Choose one'}</option>
          {/* A pick whose record has since been unpublished or renamed stays
              selectable, so saving doesn't silently drop it. */}
          {missing ? <option value={picked}>{picked} (no longer available)</option> : null}
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
        {missing ? (
          <span className="text-[11px] text-ih-danger-ink">
            This record isn&apos;t published any more — it won&apos;t appear on the page.
          </span>
        ) : null}
      </div>
    )
  }

  if (isImageField(field)) {
    const v: ImageValue =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as ImageValue)
        : { mediaId: null, alt: null }
    return (
      <ImageField
        label={field.label}
        help={field.help}
        value={v}
        onChange={(next) => onChange(next)}
      />
    )
  }

  const simple = field as SimpleFieldDef
  const textValue = typeof value === 'string' ? value : ''
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        label={simple.label}
        help={simple.help}
        count={simple.max ? `${textValue.length}/${simple.max}` : undefined}
      />
      {simple.kind === 'textarea' || simple.kind === 'richtext' ? (
        <textarea
          className={cn(inputCls, 'min-h-[80px] resize-y leading-[1.55]')}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          value={textValue}
          placeholder={simple.kind === 'link' ? '/quote' : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {simple.help && simple.max ? (
        <span className="text-[10.5px] text-ih-muted-2">{simple.help}</span>
      ) : null}
    </div>
  )
}

/**
 * Pick an image out of the media library.
 *
 * Goes through the same dialog every other content editor uses, so a section
 * image is an ordinary `Media` row — which is what keeps it visible to the
 * library's usage index instead of becoming an orphan nobody can trace.
 */
export function ImageField({
  label,
  help,
  value,
  onChange,
}: {
  label: string
  help?: string | undefined
  value: ImageValue
  onChange: (v: ImageValue) => void
}) {
  const [open, setOpen] = useState(false)
  // Only the FETCHED row is state; the selection is derived from it. Mirroring
  // the selection into its own state would mean a synchronous `setState` in
  // the effect that clears it when the id goes away — a cascading render the
  // React lint rule correctly rejects.
  const [fetched, setFetched] = useState<PickerResult | null>(null)
  const picked = value.mediaId && fetched?.id === value.mediaId ? fetched : null
  const thumb = picked
    ? mediaThumbnailSrc({ kind: 'image', storagePath: picked.storagePath })
    : null

  // The stored value is an id. Resolving it here rather than server-side keeps
  // the field self-contained — the editor can add a list item with an image
  // without a round-trip through the page. The setState below is inside the
  // resolved promise, not in the effect body.
  useEffect(() => {
    if (!value.mediaId || picked) return
    let cancelled = false
    void getMediaById({ id: value.mediaId }).then((res) => {
      if (!cancelled && res.success && res.data) setFetched(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [value.mediaId, picked])

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} help={help} />
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-ih-border bg-ih-surface-2">
          {thumb ? (
            // The library stores absolute R2 URLs for some rows and keys for
            // others, and `next/image` needs a configured host for each — so
            // this is a plain <img>, exactly as MediaPicker does it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={picked?.alt ?? picked?.originalFilename ?? ''}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-ih-muted-2">
              <ImageOff size={16} strokeWidth={1.6} aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" kind="outline" size="dense-sm" onClick={() => setOpen(true)}>
              {value.mediaId ? 'Change image' : 'Choose image'}
            </Button>
            {value.mediaId ? (
              <Button
                type="button"
                kind="ghost"
                size="dense-sm"
                onClick={() => onChange({ ...value, mediaId: null })}
              >
                <X size={12} strokeWidth={1.8} aria-hidden="true" /> Remove
              </Button>
            ) : null}
            {picked ? (
              <span className="truncate font-mono text-[11px] text-ih-muted">
                {picked.originalFilename}
              </span>
            ) : null}
          </div>
          <input
            className={inputCls}
            placeholder="Alt text (describes the image to a screen reader)"
            value={value.alt ?? ''}
            onChange={(e) => onChange({ ...value, alt: e.target.value || null })}
          />
        </div>
      </div>
      <MediaBrowserDialog
        open={open}
        onOpenChange={setOpen}
        fixedKind="image"
        selectedId={value.mediaId}
        title={`Choose image — ${label}`}
        onSelect={(media) => {
          setFetched(media)
          onChange({ ...value, mediaId: media.id, alt: value.alt ?? media.alt ?? null })
          setOpen(false)
        }}
      />
    </div>
  )
}
