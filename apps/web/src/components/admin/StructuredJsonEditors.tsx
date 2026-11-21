'use client'

import { DeleteButton } from '@indus/ui'
import { useState, useMemo } from 'react'

/**
 * Four small repeating-row editors that serialise their structured
 * state to a hidden JSON `<input>` on every change. Drop into any
 * <form> as `<XxxEditor name="chips" defaultValue={"..."} />` and the
 * existing server action that expects a JSON-string column keeps
 * working unchanged.
 */

// ── chips: string[] ──────────────────────────────────────────────────────

export function ChipsEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const initial = useMemo(() => parseStringArray(defaultValue), [defaultValue])
  const [items, setItems] = useState<string[]>(initial)

  const update = (next: string[]) => setItems(next)

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((chip, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={chip}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              update(next)
            }}
            placeholder='e.g. "API 6A / 16A RATED"'
            className="border-ih-border h-9 flex-1 rounded-md border px-3 text-[13px]"
          />
          <DeleteButton
            label="Remove item"
            className="h-9 w-9"
            onClick={() => update(items.filter((_, idx) => idx !== i))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...items, ''])}
        className="border-ih-border bg-ih-surface hover:border-ih-accent h-8 self-start rounded-md border px-3 text-[11px]"
      >
        + Add chip
      </button>
    </div>
  )
}

// ── stats: Array<{ value, label }> ──────────────────────────────────────

export function StatsEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const initial = useMemo(
    () => parseObjArray<{ value: string; label: string }>(defaultValue, { value: '', label: '' }),
    [defaultValue]
  )
  const [items, setItems] = useState(initial)
  const update = (next: typeof items) => setItems(next)

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
          <input
            type="text"
            value={row.value}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...row, value: e.target.value }
              update(next)
            }}
            placeholder='value e.g. "220+"'
            className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
          />
          <input
            type="text"
            value={row.label}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...row, label: e.target.value }
              update(next)
            }}
            placeholder='label e.g. "OIL & GAS CUSTOMERS"'
            className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
          />
          <DeleteButton
            label="Remove item"
            className="h-9 w-9"
            onClick={() => update(items.filter((_, idx) => idx !== i))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...items, { value: '', label: '' }])}
        className="border-ih-border bg-ih-surface hover:border-ih-accent h-8 self-start rounded-md border px-3 text-[11px]"
      >
        + Add stat
      </button>
    </div>
  )
}

// ── deliveryAreas: Array<{ category, title, description, skuCount }> ────

export function DeliveryAreasEditor({
  name,
  defaultValue,
}: {
  name: string
  defaultValue: string
}) {
  const initial = useMemo(
    () =>
      parseObjArray<{ category: string; title: string; description: string; skuCount: string }>(
        defaultValue,
        { category: '', title: '', description: '', skuCount: '' }
      ),
    [defaultValue]
  )
  const [items, setItems] = useState(initial)
  const update = (next: typeof items) => setItems(next)

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((row, i) => (
        <div key={i} className="border-ih-border flex flex-col gap-2 rounded-lg border p-3">
          <div className="grid grid-cols-[2fr_3fr_1fr_auto] items-start gap-2">
            <input
              type="text"
              value={row.category}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...row, category: e.target.value }
                update(next)
              }}
              placeholder='category e.g. "WELLHEAD & BOP"'
              className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
            />
            <input
              type="text"
              value={row.title}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...row, title: e.target.value }
                update(next)
              }}
              placeholder="title"
              className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
            />
            <input
              type="text"
              value={row.skuCount}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...row, skuCount: e.target.value }
                update(next)
              }}
              placeholder='SKU count e.g. "78 SKUs"'
              className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
            />
            <DeleteButton
              label="Remove item"
              className="h-9 w-9"
              onClick={() => update(items.filter((_, idx) => idx !== i))}
            />
          </div>
          <textarea
            value={row.description}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...row, description: e.target.value }
              update(next)
            }}
            placeholder="description"
            rows={2}
            className="border-ih-border resize-vertical rounded-md border px-3 py-2 text-[13px]"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          update([...items, { category: '', title: '', description: '', skuCount: '' }])
        }
        className="border-ih-border bg-ih-surface hover:border-ih-accent h-8 self-start rounded-md border px-3 text-[11px]"
      >
        + Add delivery area
      </button>
    </div>
  )
}

// ── supportBlock: { eyebrow, headline, description, bullets[], cta, image?, imageAlt? } ───

export function SupportBlockEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const initial = useMemo(() => {
    try {
      const parsed = JSON.parse(defaultValue || 'null') as unknown
      if (parsed && typeof parsed === 'object') {
        const o = parsed as Record<string, unknown>
        return {
          eyebrow: typeof o.eyebrow === 'string' ? o.eyebrow : '',
          headline: typeof o.headline === 'string' ? o.headline : '',
          description: typeof o.description === 'string' ? o.description : '',
          bullets: Array.isArray(o.bullets)
            ? (o.bullets as unknown[]).filter((x): x is string => typeof x === 'string')
            : [],
          cta: typeof o.cta === 'string' ? o.cta : '',
          image: typeof o.image === 'string' ? o.image : '',
          imageAlt: typeof o.imageAlt === 'string' ? o.imageAlt : '',
        }
      }
    } catch {
      // fall through
    }
    return {
      eyebrow: '',
      headline: '',
      description: '',
      bullets: [] as string[],
      cta: '',
      image: '',
      imageAlt: '',
    }
  }, [defaultValue])

  const [state, setState] = useState(initial)

  // Serialise to a JSON string for the hidden input. Empty / all-default
  // state writes an empty string so the server-side parser stores null.
  const serialised = useMemo(() => {
    const isEmpty =
      !state.eyebrow.trim() &&
      !state.headline.trim() &&
      !state.description.trim() &&
      !state.cta.trim() &&
      !state.image.trim() &&
      state.bullets.filter((b) => b.trim()).length === 0
    return isEmpty ? '' : JSON.stringify(state)
  }, [state])

  return (
    <div className="border-ih-border flex flex-col gap-3 rounded-lg border p-3">
      <input type="hidden" name={name} value={serialised} />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={state.eyebrow}
          onChange={(e) => setState({ ...state, eyebrow: e.target.value })}
          placeholder='eyebrow e.g. "PLANT-DOWN SUPPORT"'
          className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
        />
        <input
          type="text"
          value={state.cta}
          onChange={(e) => setState({ ...state, cta: e.target.value })}
          placeholder='CTA label e.g. "Request plant-down support →"'
          className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
        />
      </div>
      <input
        type="text"
        value={state.headline}
        onChange={(e) => setState({ ...state, headline: e.target.value })}
        placeholder="headline"
        className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
      />
      <textarea
        value={state.description}
        onChange={(e) => setState({ ...state, description: e.target.value })}
        placeholder="description"
        rows={3}
        className="border-ih-border resize-vertical rounded-md border px-3 py-2 text-[13px]"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={state.image}
          onChange={(e) => setState({ ...state, image: e.target.value })}
          placeholder="image URL (4:3 panel beside the copy)"
          className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
        />
        <input
          type="text"
          value={state.imageAlt}
          onChange={(e) => setState({ ...state, imageAlt: e.target.value })}
          placeholder="image alt text"
          className="border-ih-border h-9 rounded-md border px-3 text-[13px]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-ih-muted text-[11px] tracking-[0.1em] uppercase tabular-nums">
          Bullets
        </span>
        {state.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={b}
              onChange={(e) => {
                const next = [...state.bullets]
                next[i] = e.target.value
                setState({ ...state, bullets: next })
              }}
              placeholder="single bullet"
              className="border-ih-border h-9 flex-1 rounded-md border px-3 text-[13px]"
            />
            <DeleteButton
              label="Remove bullet"
              className="h-9 w-9"
              onClick={() => {
                setState({ ...state, bullets: state.bullets.filter((_, idx) => idx !== i) })
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setState({ ...state, bullets: [...state.bullets, ''] })}
          className="border-ih-border bg-ih-surface hover:border-ih-accent h-8 self-start rounded-md border px-3 text-[11px]"
        >
          + Add bullet
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function parseStringArray(v: string): string[] {
  try {
    const arr = JSON.parse(v || '[]') as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

function parseObjArray<T extends Record<string, string>>(v: string, shape: T): T[] {
  try {
    const arr = JSON.parse(v || '[]') as unknown
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
      .map((o) => {
        const out = { ...shape }
        for (const key of Object.keys(shape) as (keyof T)[]) {
          const val = (o as Record<string, unknown>)[key as string]
          out[key] = (typeof val === 'string' ? val : '') as T[keyof T]
        }
        return out
      })
  } catch {
    return []
  }
}
