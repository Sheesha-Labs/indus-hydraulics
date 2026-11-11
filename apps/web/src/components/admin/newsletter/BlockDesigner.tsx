'use client'

import { Button, Checkbox, Input, Select, Textarea } from '@indus/ui'
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { searchRecordsAction } from '../../../app/admin/(shell)/newsletter/campaign-actions'
import { mediaUrl } from '../../../lib/media'
import { BLOCKS, blockDef } from '../../../lib/newsletter/blocks/catalogue'
import { MAX_BLOCKS, SETTINGS_FIELDS, blockId, newBlock } from '../../../lib/newsletter/blocks/document'
import { INDUS_SWATCHES } from '../../../lib/newsletter/blocks/palette'
import { PRESETS } from '../../../lib/newsletter/blocks/presets'
import {
  BLOCK_CATEGORIES,
  RECORD_KINDS,
  RECORD_LAYOUTS,
  type Block,
  type Design,
  type FieldDef,
  type ImageValue,
  type Props,
  type RecordKind,
  type RecordsValue,
  type ScalarFieldDef,
} from '../../../lib/newsletter/blocks/types'
import { MediaBrowserDialog } from '../MediaBrowserDialog'

type Props_ = {
  design: Design
  onChange: (design: Design) => void
  disabled?: boolean
}

const KIND_LABEL: Record<RecordKind, string> = { product: 'Products', category: 'Categories', article: 'Blog articles', industry: 'Industries' }
const LAYOUT_LABEL: Record<string, string> = { list: 'List', grid: 'Grid', cards: 'Cards' }

/**
 * The block designer: a column of blocks, each opened to edit its fields,
 * built entirely from the catalogue's field definitions — a new block type
 * needs no change here. The server normalises whatever this produces, so
 * nothing here is trusted; it only has to be pleasant.
 */
export default function BlockDesigner({ design, onChange, disabled }: Props_) {
  const [open, setOpen] = useState<string | null>(design.blocks[0]?.id ?? null)
  const [adding, setAdding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const setBlocks = (blocks: Block[]) => onChange({ ...design, blocks })
  const setProps = (id: string, props: Props) => setBlocks(design.blocks.map((b) => (b.id === id ? { ...b, props } : b)))
  const move = (i: number, by: number) => {
    const j = i + by
    if (j < 0 || j >= design.blocks.length) return
    const next = [...design.blocks]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    setBlocks(next)
  }
  const insert = (block: Block) => {
    const at = open ? design.blocks.findIndex((b) => b.id === open) + 1 : design.blocks.length
    const next = [...design.blocks]
    next.splice(at > 0 ? at : design.blocks.length, 0, block)
    setBlocks(next)
    setOpen(block.id)
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" kind="outline" size="dense-sm" disabled={disabled || design.blocks.length >= MAX_BLOCKS} onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
          {adding ? 'Close' : '+ Add block'}
        </Button>
        <Button type="button" kind="ghost" size="dense-sm" onClick={() => setShowSettings((s) => !s)} aria-expanded={showSettings}>
          Colours &amp; type
        </Button>
        <span className="text-[12px] text-ih-muted">
          {design.blocks.length} / {MAX_BLOCKS} blocks{open ? ' · new blocks go below the open one' : ''}
        </span>
      </div>

      {showSettings ? (
        <div className="grid gap-3 rounded-[10px] border border-ih-border p-3 sm:grid-cols-2">
          {SETTINGS_FIELDS.map((f) =>
            f.kind === 'font' ? (
              <label key={f.key} className="flex flex-col gap-1 text-[12.5px] text-ih-muted">
                {f.label}
                <Select
                  value={String(design.settings[f.key])}
                  disabled={disabled}
                  onChange={(e) => onChange({ ...design, settings: { ...design.settings, [f.key]: e.target.value } })}
                >
                  <option value="serif">Serif (headings like the site)</option>
                  <option value="sans">Sans-serif</option>
                </Select>
              </label>
            ) : (
              <ColorField
                key={f.key}
                label={f.label}
                value={String(design.settings[f.key])}
                allowBlank={false}
                disabled={disabled}
                onChange={(v) => onChange({ ...design, settings: { ...design.settings, [f.key]: v } })}
              />
            ),
          )}
        </div>
      ) : null}

      {adding ? <AddBlock onPick={insert} /> : null}

      {design.blocks.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-ih-border p-6 text-center text-[13.5px] text-ih-muted">No blocks yet. Add a heading, some text, a few products.</p>
      ) : null}

      <ol className="flex flex-col gap-2">
        {design.blocks.map((b, i) => {
          const def = blockDef(b.type)
          const isOpen = open === b.id
          return (
            <li key={b.id} className={`rounded-[10px] border ${isOpen ? 'border-ih-accent' : 'border-ih-border'} bg-ih-surface`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium text-ih-ink"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : b.id)}
                >
                  {def?.label ?? b.type}
                  <span className="ml-2 font-normal text-ih-muted">{summary(b)}</span>
                </button>
                {!disabled ? (
                  <span className="flex shrink-0 items-center gap-0.5">
                    <Button type="button" kind="ghost" size="icon-xs" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp size={14} aria-hidden />
                    </Button>
                    <Button type="button" kind="ghost" size="icon-xs" aria-label="Move down" disabled={i === design.blocks.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown size={14} aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      kind="ghost"
                      size="icon-xs"
                      aria-label="Duplicate block"
                      disabled={design.blocks.length >= MAX_BLOCKS}
                      onClick={() => insert({ id: blockId(), type: b.type, props: structuredClone(b.props) })}
                    >
                      <Copy size={14} aria-hidden />
                    </Button>
                    <Button type="button" kind="ghost" size="icon-xs" aria-label="Delete block" onClick={() => setBlocks(design.blocks.filter((x) => x.id !== b.id))}>
                      <Trash2 size={14} aria-hidden />
                    </Button>
                  </span>
                ) : null}
              </div>
              {isOpen && def ? (
                <fieldset disabled={disabled} className="grid gap-3 border-t border-ih-border px-3 py-3 sm:grid-cols-2">
                  {def.fields.map((f) => (
                    <FieldEditor key={f.key} field={f} value={b.props[f.key]} onChange={(v) => setProps(b.id, { ...b.props, [f.key]: v })} />
                  ))}
                </fieldset>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** A word or two from the block's main text, so a closed list is scannable. */
function summary(b: Block): string {
  const p = b.props
  const t = [p.heading, p.text, p.label, p.quote, p.name].find((v) => typeof v === 'string' && v.trim())
  return typeof t === 'string' ? `— ${t.slice(0, 48)}${t.length > 48 ? '…' : ''}` : ''
}

function AddBlock({ onPick }: { onPick: (b: Block) => void }) {
  return (
    <div className="grid gap-4 rounded-[10px] border border-ih-border bg-ih-surface-2 p-3 sm:grid-cols-2">
      {BLOCK_CATEGORIES.map((cat) => {
        const blocks = BLOCKS.filter((b) => b.category === cat)
        const presets = PRESETS.filter((p) => blockDef(p.type)?.category === cat)
        if (!blocks.length && !presets.length) return null
        return (
          <div key={cat}>
            <p className="mb-1 tabular-nums text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">{cat}</p>
            <ul className="flex flex-col gap-0.5">
              {blocks.map((b) => (
                <li key={b.type}>
                  <button type="button" onClick={() => onPick(newBlock(b.type))} className="w-full rounded-md px-2 py-1 text-left hover:bg-ih-surface">
                    <span className="text-[13px] text-ih-ink">{b.label}</span>
                    <span className="block text-[11.5px] text-ih-muted">{b.description}</span>
                  </button>
                </li>
              ))}
              {presets.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => onPick(newBlock(p.type, p.props))} className="w-full rounded-md px-2 py-1 text-left hover:bg-ih-surface">
                    <span className="text-[13px] text-ih-ink">{p.label}</span>
                    <span className="block text-[11.5px] text-ih-muted">{p.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function FieldEditor({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (field.kind === 'items') return <ItemsEditor field={field} value={value} onChange={onChange} />
  if (field.kind === 'records') return <RecordsEditor label={field.label} value={value as RecordsValue | null} onChange={onChange} />
  return <ScalarEditor field={field} value={value} onChange={onChange} />
}

function Labelled({ label, help, wide, children }: { label: string; help?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-[12.5px] text-ih-muted ${wide ? 'sm:col-span-2' : ''}`}>
      {label}
      {children}
      {help ? <span className="text-[11.5px]">{help}</span> : null}
    </label>
  )
}

function ScalarEditor({ field, value, onChange }: { field: ScalarFieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.kind) {
    case 'text':
    case 'url':
      return (
        <Labelled label={field.label} help={field.help}>
          <Input
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder ?? (field.kind === 'url' ? 'https://… or /contact' : undefined)}
            maxLength={field.kind === 'text' ? field.max : 2000}
            onChange={(e) => onChange(e.target.value)}
          />
        </Labelled>
      )
    case 'textarea':
      return (
        <Labelled label={field.label} help={field.help ?? 'A blank line starts a new paragraph.'} wide>
          <Textarea rows={4} value={typeof value === 'string' ? value : ''} placeholder={field.placeholder} maxLength={field.max} onChange={(e) => onChange(e.target.value)} />
        </Labelled>
      )
    case 'select':
      return (
        <Labelled label={field.label} help={field.help}>
          <Select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Labelled>
      )
    case 'number':
      return (
        <Labelled label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`} help={field.help}>
          <Input type="number" min={field.min} max={field.max} step={field.step ?? 1} value={typeof value === 'number' ? value : field.min} onChange={(e) => onChange(Number(e.target.value))} />
        </Labelled>
      )
    case 'toggle':
      return <Checkbox label={field.label} checked={value === true} onChange={(e) => onChange(e.target.checked)} />
    case 'color':
      return <ColorField label={field.label} value={typeof value === 'string' ? value : ''} allowBlank={Boolean(field.allowBlank)} onChange={onChange} />
    case 'image':
      return <ImageEditor label={field.label} value={(value as ImageValue | null) ?? null} onChange={onChange} />
  }
}

function ColorField({ label, value, allowBlank, disabled, onChange }: { label: string; value: string; allowBlank: boolean; disabled?: boolean; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 text-[12.5px] text-ih-muted">
      <span>{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <input type="color" aria-label={`${label} colour`} value={value || '#ffffff'} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-ih-border bg-transparent p-0.5" />
        <Input value={value} disabled={disabled} maxLength={7} placeholder={allowBlank ? 'Default' : '#000000'} onChange={(e) => onChange(e.target.value)} className="w-24 tabular-nums" aria-label={`${label} hex value`} />
        {INDUS_SWATCHES.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.label}
            aria-label={`${label}: ${s.label}`}
            disabled={disabled}
            onClick={() => onChange(s.value)}
            className={`h-5 w-5 overflow-hidden rounded-full border ${value.toLowerCase() === s.value.toLowerCase() ? 'border-ih-accent ring-2 ring-ih-accent-soft' : 'border-ih-border'}`}
          >
            {/* An SVG fill, not style=: the swatch is a stored hex value no token can name. */}
            <svg viewBox="0 0 10 10" className="block h-full w-full" aria-hidden>
              <rect width="10" height="10" fill={s.value} />
            </svg>
          </button>
        ))}
        {allowBlank && value ? (
          <button type="button" className="text-[11.5px] underline underline-offset-2" onClick={() => onChange('')} disabled={disabled}>
            Default
          </button>
        ) : null}
      </div>
    </div>
  )
}

function ImageEditor({ label, value, onChange }: { label: string; value: ImageValue | null; onChange: (v: ImageValue | null) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1 text-[12.5px] text-ih-muted sm:col-span-2">
      <span>{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- a thumbnail of an arbitrary chosen image, not a page image
          <img src={value.url} alt="" className="h-16 w-24 rounded border border-ih-border object-cover" />
        ) : null}
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <div className="flex gap-1.5">
            <Button type="button" kind="outline" size="dense-sm" onClick={() => setOpen(true)}>
              {value?.url ? 'Change image' : 'Choose image'}
            </Button>
            {value?.url ? (
              <Button type="button" kind="ghost" size="dense-sm" onClick={() => onChange(null)}>
                Remove
              </Button>
            ) : null}
          </div>
          {value?.url ? (
            <Input value={value.alt ?? ''} maxLength={160} placeholder="Describe the picture (alt text)" aria-label={`${label} alt text`} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
          ) : null}
        </div>
      </div>
      <MediaBrowserDialog
        open={open}
        onOpenChange={setOpen}
        fixedKind="image"
        selectedId={value?.mediaId ?? null}
        onSelect={(m) => {
          onChange({ url: mediaUrl(m.storagePath), alt: m.alt ?? value?.alt ?? '', mediaId: m.id })
          setOpen(false)
        }}
      />
    </div>
  )
}

function ItemsEditor({ field, value, onChange }: { field: Extract<FieldDef, { kind: 'items' }>; value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? (value as Props[]) : []
  const blank = () => Object.fromEntries(field.fields.map((f) => [f.key, f.kind === 'toggle' ? false : f.kind === 'number' ? f.min : f.kind === 'image' ? null : f.kind === 'select' ? (f.options[0]?.value ?? '') : '']))
  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <p className="text-[12.5px] text-ih-muted">
        {field.label} ({items.length}/{field.max})
      </p>
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-ih-border p-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-ih-ink">
              {field.itemLabel} {i + 1}
            </span>
            <span className="flex gap-0.5">
              <Button type="button" kind="ghost" size="icon-xs" aria-label={`Move ${field.itemLabel} up`} disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
                <ArrowUp size={13} aria-hidden />
              </Button>
              <Button type="button" kind="ghost" size="icon-xs" aria-label={`Move ${field.itemLabel} down`} disabled={i === items.length - 1} onClick={() => onChange(swap(items, i, i + 1))}>
                <ArrowDown size={13} aria-hidden />
              </Button>
              <Button type="button" kind="ghost" size="icon-xs" aria-label={`Remove ${field.itemLabel}`} disabled={items.length <= field.min} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 size={13} aria-hidden />
              </Button>
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {field.fields.map((f) => (
              <ScalarEditor key={f.key} field={f} value={item[f.key]} onChange={(v) => onChange(items.map((it, j) => (j === i ? { ...it, [f.key]: v } : it)))} />
            ))}
          </div>
        </div>
      ))}
      {items.length < field.max ? (
        <div>
          <Button type="button" kind="ghost" size="dense-sm" onClick={() => onChange([...items, blank()])}>
            + Add {field.itemLabel.toLowerCase()}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  return next
}

function RecordsEditor({ label, value, onChange }: { label: string; value: RecordsValue | null; onChange: (v: RecordsValue | null) => void }) {
  const current: RecordsValue = value ?? { kind: 'product', ids: [], labels: [], layout: 'grid' }
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ id: string; label: string; hint: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const t = setTimeout(async () => {
      const r = await searchRecordsAction(current.kind, q)
      if (!live) return
      if (r.success) {
        setResults(r.data)
        setError(null)
      } else setError(r.message)
    }, 250)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [q, current.kind])

  const picked = useMemo(() => new Set(current.ids), [current.ids])
  const set = (patch: Partial<RecordsValue>) => onChange({ ...current, ...patch })

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <p className="text-[12.5px] text-ih-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Select
          aria-label="What to feature"
          value={current.kind}
          onChange={(e) => set({ kind: e.target.value as RecordKind, ids: [], labels: [] })}
          className="w-44"
        >
          {RECORD_KINDS.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </Select>
        <Select aria-label="Layout" value={current.layout} onChange={(e) => set({ layout: e.target.value as RecordsValue['layout'] })} className="w-32">
          {RECORD_LAYOUTS.map((l) => (
            <option key={l} value={l}>
              {LAYOUT_LABEL[l] ?? l}
            </option>
          ))}
        </Select>
      </div>
      {current.ids.length ? (
        <ol className="flex flex-col gap-1">
          {current.ids.map((id, i) => (
            <li key={id} className="flex items-center gap-2 rounded-md bg-ih-surface-2 px-2 py-1 text-[13px] text-ih-ink">
              <span className="min-w-0 flex-1 truncate">{current.labels[i] ?? id}</span>
              <Button type="button" kind="ghost" size="icon-xs" aria-label="Move up" disabled={i === 0} onClick={() => set({ ids: swap(current.ids, i, i - 1), labels: swap(current.labels, i, i - 1) })}>
                <ArrowUp size={13} aria-hidden />
              </Button>
              <Button
                type="button"
                kind="ghost"
                size="icon-xs"
                aria-label={`Remove ${current.labels[i] ?? 'item'}`}
                onClick={() => set({ ids: current.ids.filter((_, j) => j !== i), labels: current.labels.filter((_, j) => j !== i) })}
              >
                <Trash2 size={13} aria-hidden />
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-[12.5px] text-ih-muted">Nothing picked yet.</p>
      )}
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${KIND_LABEL[current.kind].toLowerCase()}`} aria-label={`Search ${KIND_LABEL[current.kind]}`} />
      {error ? <p role="alert" className="text-[12.5px] text-ih-danger-ink">{error}</p> : null}
      <ul className="max-h-48 overflow-y-auto rounded-md border border-ih-border">
        {results.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              disabled={picked.has(r.id) || current.ids.length >= 12}
              onClick={() => set({ ids: [...current.ids, r.id], labels: [...current.labels, r.label] })}
              className="flex w-full items-baseline justify-between gap-2 px-2 py-1 text-left text-[13px] hover:bg-ih-surface-2 disabled:opacity-45"
            >
              <span className="truncate text-ih-ink">{r.label}</span>
              <span className="shrink-0 tabular-nums text-[11px] text-ih-muted">{picked.has(r.id) ? 'added' : r.hint}</span>
            </button>
          </li>
        ))}
        {results.length === 0 ? <li className="px-2 py-1 text-[12.5px] text-ih-muted">No matches.</li> : null}
      </ul>
    </div>
  )
}
