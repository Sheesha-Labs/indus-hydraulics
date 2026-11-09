/**
 * A block design from loose JSON to something safe to store and render, and
 * the questions asked of one: which records it features, which links it
 * holds, whether a template placeholder is still in it.
 *
 * `normaliseDesign` is the save boundary (and runs again at render): unknown
 * blocks dropped, every value checked against its field — colours are hex,
 * selects are one of their options, numbers clamped, images on https, texts
 * capped — so whatever reaches the renderer is a value it expects. Pure; the
 * designer imports it on the client.
 */

import { BRAND } from '@indus/domain'
import { BLOCKS, blockDef } from './catalogue'
import {
  FONT_CHOICES,
  RECORD_KINDS,
  RECORD_LAYOUTS,
  type Block,
  type BlockDef,
  type Design,
  type DesignSettings,
  type FieldDef,
  type FontChoice,
  type ImageValue,
  type Props,
  type RecordKind,
  type RecordLayout,
  type RecordsValue,
  type ScalarFieldDef,
} from './types'

export const MAX_BLOCKS = 60
const TEXT_MAX = 300
const TEXTAREA_MAX = 4000
const URL_MAX = 1000
const RECORDS_MAX = 12

/** `{{token}}`s the renderer fills; any other `{{…}}` is a leftover placeholder. */
export const KNOWN_TOKENS = ['site_url', 'unsubscribe_url'] as const

export const DEFAULT_SETTINGS: DesignSettings = {
  pageBackground: BRAND.bg,
  contentBackground: BRAND.surface,
  textColor: BRAND.ink2,
  headingColor: BRAND.ink,
  mutedColor: BRAND.muted,
  linkColor: BRAND.accent,
  buttonColor: BRAND.accent,
  buttonTextColor: BRAND.white,
  headingFont: 'serif',
  bodyFont: 'sans',
}

export const SETTINGS_FIELDS: { key: keyof DesignSettings; label: string; kind: 'color' | 'font' }[] = [
  { key: 'pageBackground', label: 'Behind the email', kind: 'color' },
  { key: 'contentBackground', label: 'Email background', kind: 'color' },
  { key: 'textColor', label: 'Text', kind: 'color' },
  { key: 'headingColor', label: 'Headings', kind: 'color' },
  { key: 'mutedColor', label: 'Small print', kind: 'color' },
  { key: 'linkColor', label: 'Links', kind: 'color' },
  { key: 'buttonColor', label: 'Buttons', kind: 'color' },
  { key: 'buttonTextColor', label: 'Button text', kind: 'color' },
  { key: 'headingFont', label: 'Heading typeface', kind: 'font' },
  { key: 'bodyFont', label: 'Body typeface', kind: 'font' },
]

const HEX = /^#[0-9a-fA-F]{6}$/
const MEDIA_ID = /^[A-Za-z0-9_-]{1,64}$/
const RECORD_ID = /^[A-Za-z0-9_-]{1,64}$/
/** An image an inbox can fetch without a mixed-content warning, or a file on the site. */
const IMAGE_URL = /^(https:\/\/[^\s"'<>()\\]+|\/(?!\/)[^\s"'<>()\\]*)$/

export function emptyDesign(): Design {
  return { version: 1, settings: { ...DEFAULT_SETTINGS }, blocks: [] }
}

/** A short id, unique enough inside one design. */
export function blockId(): string {
  return Math.random().toString(36).slice(2, 10).padEnd(8, '0')
}

function str(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  // Control characters out; line breaks stay, for textareas.
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max)
}

function cleanImage(v: unknown): ImageValue | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const url = typeof o.url === 'string' ? o.url.trim() : ''
  if (!url || url.length > URL_MAX || !IMAGE_URL.test(url)) return null
  const mediaId = typeof o.mediaId === 'string' && MEDIA_ID.test(o.mediaId) ? o.mediaId : null
  return { url, alt: str(o.alt, TEXT_MAX).replace(/[\r\n]+/g, ' '), mediaId }
}

function cleanRecords(v: unknown): RecordsValue | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  if (!(RECORD_KINDS as readonly unknown[]).includes(o.kind)) return null
  const rawIds = Array.isArray(o.ids) ? o.ids : []
  const rawLabels = Array.isArray(o.labels) ? o.labels : []
  const ids: string[] = []
  const labels: string[] = []
  rawIds.forEach((id, i) => {
    if (typeof id !== 'string' || !RECORD_ID.test(id) || ids.includes(id) || ids.length >= RECORDS_MAX) return
    ids.push(id)
    // Labels stay paired with their id, so a dropped id takes its label with it.
    labels.push(str(rawLabels[i], 200).replace(/[\r\n]+/g, ' '))
  })
  const layout = (RECORD_LAYOUTS as readonly unknown[]).includes(o.layout) ? (o.layout as RecordLayout) : 'grid'
  return { kind: o.kind as RecordKind, ids, labels, layout }
}

function cleanScalar(f: ScalarFieldDef, v: unknown, fallback: unknown): unknown {
  switch (f.kind) {
    case 'text':
      return typeof v === 'string' ? str(v, f.max ?? TEXT_MAX).replace(/[\r\n]+/g, ' ') : (fallback ?? '')
    case 'textarea':
      return typeof v === 'string' ? str(v, f.max ?? TEXTAREA_MAX).replace(/\r\n?/g, '\n') : (fallback ?? '')
    case 'url':
      return typeof v === 'string' ? str(v, URL_MAX).replace(/[\r\n]+/g, '').trim() : (fallback ?? '')
    case 'color': {
      if (typeof v === 'string' && HEX.test(v.trim())) return v.trim().toLowerCase()
      if (v === '' && f.allowBlank) return ''
      return typeof fallback === 'string' ? fallback : ''
    }
    case 'image':
      return v === undefined ? (fallback ?? null) : cleanImage(v)
    case 'select':
      return f.options.some((o) => o.value === v) ? v : (fallback ?? f.options[0]?.value)
    case 'number': {
      const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN
      if (!Number.isFinite(n)) return typeof fallback === 'number' ? fallback : f.min
      return Math.min(f.max, Math.max(f.min, Math.round(n)))
    }
    case 'toggle':
      return typeof v === 'boolean' ? v : Boolean(fallback)
  }
}

/** One field's value into `out`. */
function cleanField(f: FieldDef, raw: Props, defaults: Props, out: Props): void {
  if (f.kind === 'items') {
    const list = Array.isArray(raw[f.key]) ? (raw[f.key] as unknown[]) : ((defaults[f.key] as unknown[] | undefined) ?? [])
    out[f.key] = list.slice(0, f.max).map((item) => {
      const src = item && typeof item === 'object' ? (item as Props) : {}
      const clean: Props = {}
      for (const sub of f.fields) cleanField(sub, src, {}, clean)
      return clean
    })
    return
  }
  if (f.kind === 'records') {
    out[f.key] = raw[f.key] === undefined ? cleanRecords(defaults[f.key]) : cleanRecords(raw[f.key])
    return
  }
  out[f.key] = cleanScalar(f, raw[f.key], defaults[f.key])
}

/** A block's props from loose input, over the block's defaults. Keys the block does not define are dropped. */
export function normaliseProps(def: BlockDef, raw: Props): Props {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out: Props = {}
  for (const f of def.fields) cleanField(f, src, def.defaults, out)
  return out
}

export function normaliseSettings(raw: unknown): DesignSettings {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const out = { ...DEFAULT_SETTINGS }
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof DesignSettings)[]) {
    const v = src[key]
    if (key === 'headingFont' || key === 'bodyFont') {
      if ((FONT_CHOICES as readonly unknown[]).includes(v)) out[key] = v as FontChoice
    } else if (typeof v === 'string' && HEX.test(v.trim())) {
      out[key] = v.trim().toLowerCase()
    }
  }
  return out
}

/** Loose JSON → a design the renderer can trust. Never throws; junk is an empty design. */
export function normaliseDesign(raw: unknown): Design {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const seen = new Set<string>()
  const blocks: Block[] = []
  for (const b of Array.isArray(src.blocks) ? src.blocks : []) {
    if (blocks.length >= MAX_BLOCKS) break
    if (!b || typeof b !== 'object') continue
    const o = b as Record<string, unknown>
    const def = typeof o.type === 'string' ? blockDef(o.type) : undefined
    if (!def) continue
    let id = typeof o.id === 'string' && /^[a-z0-9-]{1,40}$/i.test(o.id) ? o.id : blockId()
    while (seen.has(id)) id = blockId()
    seen.add(id)
    blocks.push({ id, type: def.type, props: normaliseProps(def, o.props && typeof o.props === 'object' ? (o.props as Props) : {}) })
  }
  return { version: 1, settings: normaliseSettings(src.settings), blocks }
}

/** A new block of `type`, its defaults under `props`. Throws on an unknown type — that is a programming error. */
export function newBlock(type: string, props: Props = {}): Block {
  const def = blockDef(type)
  if (!def) throw new Error(`Unknown block type ${type}`)
  return { id: blockId(), type: def.type, props: normaliseProps(def, { ...structuredClone(def.defaults), ...structuredClone(props) }) }
}

/**
 * Every records value in the design with at least one id — what the sender
 * looks up before rendering. One entry per records value, in block order;
 * the caller merges by kind.
 */
export function recordRefs(design: Design): { kind: RecordKind; ids: string[] }[] {
  const out: { kind: RecordKind; ids: string[] }[] = []
  const visit = (fields: readonly FieldDef[], props: Props) => {
    for (const f of fields) {
      if (f.kind === 'records') {
        const value = cleanRecords(props[f.key])
        if (value && value.ids.length) out.push({ kind: value.kind, ids: value.ids })
      } else if (f.kind === 'items') {
        const items = Array.isArray(props[f.key]) ? (props[f.key] as unknown[]) : []
        for (const item of items) if (item && typeof item === 'object') visit(f.fields, item as Props)
      }
    }
  }
  for (const b of design.blocks) {
    const def = blockDef(b.type)
    if (def) visit(def.fields, b.props)
  }
  return out
}

/** Every link field's value, with where it is — for the "links that go nowhere" check. */
export function linkSlots(design: Design): { blockLabel: string; label: string; value: string }[] {
  const out: { blockLabel: string; label: string; value: string }[] = []
  design.blocks.forEach((b, index) => {
    const def = blockDef(b.type)
    if (!def) return
    const blockLabel = `${index + 1}. ${def.label}`
    const visit = (fields: readonly FieldDef[], props: Props, itemLabel?: string) => {
      for (const f of fields) {
        if (f.kind === 'items') {
          const items = Array.isArray(props[f.key]) ? (props[f.key] as Props[]) : []
          items.forEach((item, i) => visit(f.fields, item, `${f.itemLabel} ${i + 1}`))
        } else if (f.kind === 'url') {
          const value = typeof props[f.key] === 'string' ? (props[f.key] as string).trim() : ''
          if (value) out.push({ blockLabel, label: itemLabel ? `${itemLabel} › ${f.label}` : f.label, value })
        }
      }
    }
    visit(def.fields, b.props)
  })
  return out
}

const TOKEN_LEAD = new RegExp(`^\\{\\{\\s*(${KNOWN_TOKENS.join('|')})\\s*\\}\\}`)

/**
 * Whether a link field holds something an inbox may follow: http(s),
 * mailto:, tel:, a page on the site, or a known {{token}}. Blank counts as
 * usable — it means "no link". The renderer draws anything else as plain
 * text; this is the check that says so while writing.
 */
export function isUsableLink(raw: string): boolean {
  const v = raw.trim()
  if (!v) return true
  if (TOKEN_LEAD.test(v)) return /^[^\s"'<>]+$/.test(v.replace(TOKEN_LEAD, ''))
  return /^(https?:\/\/[^\s"'<>/][^\s"'<>]*|mailto:[^\s"'<>]+|tel:[^\s"'<>]+)$/i.test(v) || /^\/(?!\/)[^\s"'<>\\]*$/.test(v)
}

/**
 * A template placeholder still unreplaced: "[Your headline]", "Lorem ipsum",
 * "TODO", "XXX", or a {{token}} the renderer does not fill. A markdown link
 * "[label](url)" is not a placeholder.
 */
export function placeholderIn(text: string): boolean {
  if (!text) return false
  if (/\[(?:your|write|insert|add|enter|placeholder|replace|tbc|tbd)\b[^\]]*\](?!\()/i.test(text)) return true
  if (/\blorem ipsum\b/i.test(text)) return true
  if (/\bTODO\b/.test(text) || /\bxxx+\b/i.test(text)) return true
  for (const m of text.matchAll(/\{\{([^{}]*)\}\}/g)) {
    if (!(KNOWN_TOKENS as readonly string[]).includes((m[1] ?? '').trim())) return true
  }
  return false
}

/** Re-exported so callers needn't know where the catalogue lives. */
export { BLOCKS, blockDef }
