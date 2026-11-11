/**
 * A block design → the email: HTML an inbox can draw, and its plain text.
 *
 * Email HTML is its own dialect. Everything here is tables and inline styles
 * — mail clients strip <style>, and Outlook renders through Word — so `style=`
 * IS the rendering API (the same exemption packages/email has from CLAUDE.md
 * §2.1). The column is 600px and fluid below that; each block is a
 * full-width row with its own background, so a band of colour runs edge to
 * edge of the white card. The card and its navy legal band match
 * packages/email/src/templates/_layout.ts.
 *
 * Every value reaching HTML is escaped here. Links go through `href`, which
 * allows https, http, mailto, tel or a page on the site — and nothing else,
 * so a stored `javascript:` is drawn as plain text. Images must be https (or
 * a file on the site). No prop is ever emitted as raw HTML.
 */

import { BRAND, BRAND_FONT } from '@indus/domain'
import { SOCIAL_NETWORKS, blockDef } from './catalogue'
import { DEFAULT_SETTINGS, normaliseDesign, normaliseProps } from './document'
import type { Block, Design, DesignSettings, ImageValue, Props, RecordKind, RecordLayout, RecordsValue } from './types'

export type ResolvedRecord = {
  kind: RecordKind
  id: string
  title: string
  subtitle?: string | null
  meta?: string | null
  url: string
  imageUrl?: string | null
  imageAlt?: string | null
}

export type DesignRenderContext = {
  /** e.g. https://indushydraulics.com — relative links resolve against it. */
  siteUrl: string
  /** The document <title>. */
  subject: string
  /** Hidden preview text. */
  preheader?: string
  brand: { legalName: string; addressLines: string[]; logoUrl?: string | null }
  /** Keyed `${kind}:${id}` (see recordKey); a missing record is silently left out of the email. */
  records: Map<string, ResolvedRecord>
  /** null = preview/test: the link renders as href="#" with the same text. */
  unsubscribeUrl: string | null
  /** e.g. "You are receiving this because you subscribed to the Indus Hydraulics newsletter." */
  footerReason: string
}

export type RenderedDesign = { html: string; text: string }

const COLUMN = 600
const GUTTER = 32
const INNER = COLUMN - GUTTER * 2
const PAD: Record<string, number> = { none: 0, s: 16, m: 32, l: 52 }
const HEADING_PX: Record<string, number> = { s: 20, m: 26, l: 32, xl: 40 }
const TABLE = 'role="presentation" cellspacing="0" cellpadding="0" border="0"'

type Ctx = DesignRenderContext & { settings: DesignSettings; text: string[] }

export function recordKey(kind: RecordKind, id: string): string {
  return `${kind}:${id}`
}

// ── Small helpers ───────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const siteBase = (ctx: Pick<DesignRenderContext, 'siteUrl'>) => ctx.siteUrl.replace(/\/+$/, '')

function tokenValue(name: string, ctx: Pick<DesignRenderContext, 'siteUrl' | 'unsubscribeUrl'>): string | null {
  if (name === 'site_url') return siteBase(ctx)
  if (name === 'unsubscribe_url') return ctx.unsubscribeUrl ?? '#'
  return null
}

function fill(s: string, ctx: Pick<DesignRenderContext, 'siteUrl' | 'unsubscribeUrl'>): string {
  return s.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, name: string) => tokenValue(name, ctx) ?? m)
}

/** A link field's value as an address an inbox may follow, or null. */
function href(raw: unknown, ctx: Pick<DesignRenderContext, 'siteUrl' | 'unsubscribeUrl'>): string | null {
  if (typeof raw !== 'string') return null
  const value = fill(raw.trim(), ctx)
  if (!value) return null
  if (value === '#') return '#'
  if (/^(https?:\/\/[^\s"'<>/][^\s"'<>]*|mailto:[^\s"'<>]+|tel:[^\s"'<>]+)$/i.test(value)) return value
  if (/^\/(?!\/)[^\s"'<>\\]*$/.test(value)) return `${siteBase(ctx)}${value}`
  return null
}

/** An image address an inbox may load: https as is, a site path made absolute, anything else nothing. */
function imageSrc(raw: unknown, ctx: Pick<DesignRenderContext, 'siteUrl'>): string {
  const url = typeof raw === 'string' ? raw.trim() : raw && typeof raw === 'object' ? String((raw as ImageValue).url ?? '').trim() : ''
  if (/^https:\/\/[^\s"'<>()\\/][^\s"'<>()\\]*$/.test(url)) return url
  if (/^\/(?!\/)[^\s"'<>()\\]*$/.test(url)) return `${siteBase(ctx)}${url}`
  return ''
}

function imageAlt(v: unknown): string {
  return v && typeof v === 'object' && typeof (v as ImageValue).alt === 'string' ? ((v as ImageValue).alt as string) : ''
}

function str(props: Props, key: string): string {
  return typeof props[key] === 'string' ? (props[key] as string) : ''
}

/** Escaped, tokens filled, **bold**, [links](…) and line breaks — a paragraph's inline text. */
function inline(raw: string, ctx: Ctx, linkColor: string): string {
  let s = esc(raw)
  s = s.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, name: string) => {
    const v = tokenValue(name, ctx)
    return v === null ? m : esc(v)
  })
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, target: string) => {
    const to = href(target.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'), ctx)
    return to ? `<a href="${esc(to)}" style="color:${linkColor};text-decoration:underline">${label}</a>` : label
  })
  return s.replace(/\n/g, '<br>')
}

/** The same text as a reader of the plain-text part sees it. */
function plain(raw: string, ctx: Ctx): string {
  return fill(raw, ctx)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, target: string) => {
      const to = href(target, ctx)
      return to ? `${label}: ${to}` : label
    })
}

function paragraphs(raw: string, ctx: Ctx, style: string, linkColor: string): string {
  const list = raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return list.map((p, i) => `<p style="margin:0 0 ${i === list.length - 1 ? 0 : 14}px 0;${style}">${inline(p, ctx, linkColor)}</p>`).join('')
}

function font(ctx: Ctx, which: 'heading' | 'body' | 'serif' | 'sans'): string {
  const choice = which === 'heading' ? ctx.settings.headingFont : which === 'body' ? ctx.settings.bodyFont : which
  return BRAND_FONT[choice]
}

function alignOf(v: unknown): 'left' | 'center' | 'right' {
  return v === 'center' ? 'center' : v === 'end' ? 'right' : 'left'
}

function color(v: unknown, fallback: string): string {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : fallback
}

function rgba(hex: string, opacity: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, opacity)).toFixed(2)})`
}

/** One block's row: full width, its own background and vertical padding. */
function row(inner: string, props: Props, opts: { gutter?: boolean; padding?: number } = {}): string {
  const bg = color(props.background, '')
  const pad = opts.padding ?? PAD[String(props.padding ?? 'm')] ?? 32
  const gutter = opts.gutter === false ? 0 : GUTTER
  return `<tr><td${bg ? ` bgcolor="${bg}"` : ''} style="${bg ? `background-color:${bg};` : ''}padding:${pad}px ${gutter}px">${inner}</td></tr>`
}

function spacer(px: number): string {
  return `<div style="height:${px}px;line-height:${px}px;font-size:1px">&nbsp;</div>`
}

function eyebrow(text: string, ctx: Ctx, align: string, ink: string): string {
  if (!text) return ''
  ctx.text.push(plain(text, ctx).toUpperCase())
  return `<p style="margin:0 0 10px 0;font-family:${BRAND_FONT.mono};font-size:11px;font-weight:500;letter-spacing:0.13em;text-transform:uppercase;color:${ink};text-align:${align}">${inline(text, ctx, ink)}</p>`
}

function headingHtml(text: string, ctx: Ctx, o: { size: unknown; align: string; ink: string; font?: unknown; level?: 1 | 2; margin?: number }): string {
  if (!text) return ''
  ctx.text.push(plain(text, ctx))
  const px = HEADING_PX[String(o.size)] ?? 26
  const which = o.font === 'serif' || o.font === 'sans' ? o.font : 'heading'
  const serif = (which === 'heading' ? ctx.settings.headingFont : which) === 'serif'
  const tag = o.level === 1 ? 'h1' : 'h2'
  return `<${tag} style="margin:0 0 ${o.margin ?? 12}px 0;font-family:${font(ctx, which)};font-size:${px}px;line-height:1.2;font-weight:${serif ? 400 : 600};color:${o.ink};text-align:${o.align};letter-spacing:-0.01em">${inline(text, ctx, o.ink)}</${tag}>`
}

function bodyStyle(ctx: Ctx, ink: string, align: string, size = 15): string {
  return `font-family:${font(ctx, 'body')};font-size:${size}px;line-height:1.6;color:${ink};text-align:${align}`
}

type ButtonSpec = { label: string; url: unknown; fill: string; ink: string; style: unknown; shape?: unknown; fullWidth?: boolean; align: string }

function button(b: ButtonSpec, ctx: Ctx): string {
  const to = href(b.url, ctx)
  if (!b.label || !to) return ''
  ctx.text.push(`${plain(b.label, ctx)}: ${to}`)
  const label = inline(b.label, ctx, b.ink)
  if (b.style === 'link') {
    return `<p style="margin:0;text-align:${b.align}"><a href="${esc(to)}" style="font-family:${font(ctx, 'body')};font-size:14px;font-weight:600;color:${b.fill};text-decoration:none;border-bottom:1px solid ${b.fill}">${label} &rarr;</a></p>`
  }
  const radius = b.shape === 'pill' ? 999 : b.shape === 'square' ? 0 : 6
  const outline = b.style === 'outline'
  const bg = outline ? 'transparent' : b.fill
  const ink = outline ? b.fill : b.ink
  const width = b.fullWidth ? ' width="100%"' : ''
  const margin = b.align === 'center' ? '0 auto' : b.align === 'right' ? '0 0 0 auto' : '0'
  return `<table ${TABLE} align="${b.align}"${width} style="margin:${margin}"><tr><td align="center"${outline ? '' : ` bgcolor="${bg}"`} style="background-color:${bg};border-radius:${radius}px;border:1px solid ${b.fill}"><a href="${esc(to)}" style="display:${b.fullWidth ? 'block' : 'inline-block'};padding:12px 24px;font-family:${BRAND_FONT.sans};font-size:14px;font-weight:600;line-height:1.2;color:${ink};text-decoration:none;border-radius:${radius}px">${label}</a></td></tr></table>`
}

function blockButton(props: Props, ctx: Ctx, align: string, prefix = 'button', style?: string): string {
  return button(
    {
      label: str(props, `${prefix}Label`),
      url: props[`${prefix}Url`],
      fill: color(props[`${prefix}Color`], ctx.settings.buttonColor),
      ink: color(props[`${prefix}TextColor`], ctx.settings.buttonTextColor),
      style: style ?? props[`${prefix}Style`] ?? 'solid',
      align,
    },
    ctx,
  )
}

function img(src: string, alt: string, width: number, ctx: Ctx, o: { rounded?: boolean; link?: unknown; center?: boolean } = {}): string {
  if (!src) return ''
  const tag = `<img src="${esc(src)}" alt="${esc(alt)}" width="${width}" style="display:block;${o.center ? 'margin:0 auto;' : ''}width:100%;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none${o.rounded ? ';border-radius:10px' : ''}">`
  const to = href(o.link, ctx)
  return to ? `<a href="${esc(to)}" style="text-decoration:none">${tag}</a>` : tag
}

/** Columns side by side; fluid widths, since there is no <style> to stack them on a phone. */
function columns(cells: string[], o: { gap?: number; dividers?: string; valign?: string } = {}): string {
  const gap = o.gap ?? 20
  const width = Math.floor(100 / cells.length)
  const tds = cells
    .map((cell, i) => {
      const divider = o.dividers && i > 0 ? `border-left:1px solid ${o.dividers};` : ''
      // Half the gap on each inner edge; the outer edges sit on the block's own margin.
      const pad = `padding-left:${i === 0 ? 0 : gap / 2}px;padding-right:${i === cells.length - 1 ? 0 : gap / 2}px`
      return `<td width="${width}%" valign="${o.valign ?? 'top'}" style="${divider}${pad};width:${width}%">${cell}</td>`
    })
    .join('')
  return `<table ${TABLE} width="100%" style="table-layout:fixed;width:100%"><tr>${tds}</tr></table>`
}

function items(props: Props, key = 'items'): Props[] {
  return Array.isArray(props[key]) ? (props[key] as Props[]).filter((i) => i && typeof i === 'object') : []
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/** Phone, WhatsApp and email as links when they parse, as plain text when they don't. */
function reachLinks(p: Props, ctx: Ctx, ink: string, size: number): string[] {
  const out: string[] = []
  const add = (label: string, value: string, to: string | null) => {
    const v = value.trim()
    if (!v) return
    ctx.text.push(`${label}: ${v}`)
    const shown = `${esc(label)}: ${esc(v)}`
    out.push(
      to
        ? `<a href="${esc(to)}" style="font-family:${font(ctx, 'sans')};font-size:${size}px;color:${ink};text-decoration:none">${shown}</a>`
        : `<span style="font-family:${font(ctx, 'sans')};font-size:${size}px;color:${ink}">${shown}</span>`,
    )
  }
  const digits = (v: string) => v.replace(/[^\d]/g, '')
  const phone = str(p, 'phone')
  add('Tel', phone, digits(phone).length >= 6 ? `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits(phone)}` : null)
  const wa = str(p, 'whatsapp')
  add('WhatsApp', wa, digits(wa).length >= 6 ? `https://wa.me/${digits(wa)}` : null)
  const email = str(p, 'email').trim()
  add('Email', email, /^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i.test(email) ? `mailto:${email}` : null)
  return out
}

function logoHtml(p: Props, ctx: Ctx, align: string, ink: string): string {
  const width = Number(p.logoWidth ?? 140)
  const margin = align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'
  const picture = (src: string) =>
    `<img src="${esc(src)}" alt="${esc(ctx.brand.legalName)}" width="${width}" style="display:block;margin:${margin};width:${width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none">`
  const wordmark = `<div style="font-family:${BRAND_FONT.serif};font-size:26px;font-weight:400;line-height:1.1;letter-spacing:-0.01em;color:${ink};text-align:${align}">${esc(ctx.brand.legalName)}</div>`
  if (p.logo === 'none') return ''
  if (p.logo === 'custom') {
    const src = imageSrc(p.logoImage, ctx)
    return src ? picture(src) : wordmark
  }
  if (p.logo === 'brand') {
    const src = imageSrc(ctx.brand.logoUrl ?? '', ctx)
    return src ? picture(src) : wordmark
  }
  return wordmark
}

// ── Records ─────────────────────────────────────────────────────

const RECORD_LINK: Record<RecordKind, string> = {
  product: 'View product',
  category: 'Browse the range',
  article: 'Read the article',
  industry: 'See the industry',
  brand: 'See the brand',
}

function recordCell(r: ResolvedRecord, ctx: Ctx, layout: RecordLayout, imageWidth: number): string {
  const to = href(r.url, ctx)
  const ink = ctx.settings.textColor
  const head = ctx.settings.headingColor
  const src = imageSrc(r.imageUrl ?? '', ctx)
  // A content image always says what it shows: the record's own alt, else its title (CLAUDE.md §13).
  const picture = img(src, r.imageAlt?.trim() || r.title, imageWidth, ctx, { link: r.url, rounded: layout !== 'list' })
  const titleSize = layout === 'cards' ? 20 : layout === 'grid' ? 17 : 16
  const titleText = esc(r.title)
  const title = `<p style="margin:0 0 4px 0;font-family:${font(ctx, layout === 'cards' ? 'heading' : 'body')};font-size:${titleSize}px;line-height:1.3;font-weight:${layout === 'cards' && ctx.settings.headingFont === 'serif' ? 400 : 600};color:${head}">${to ? `<a href="${esc(to)}" style="color:${head};text-decoration:none">${titleText}</a>` : titleText}</p>`
  const subtitle = r.subtitle ? `<p style="margin:0 0 4px 0;${bodyStyle(ctx, ink, 'left', 13)}">${esc(r.subtitle)}</p>` : ''
  const meta = r.meta
    ? `<p style="margin:0 0 6px 0;font-family:${BRAND_FONT.mono};font-size:11px;line-height:1.5;letter-spacing:0.04em;color:${ctx.settings.mutedColor}">${esc(r.meta)}</p>`
    : ''
  const link =
    to && layout !== 'grid'
      ? `<p style="margin:8px 0 0 0"><a href="${esc(to)}" style="font-family:${font(ctx, 'body')};font-size:13px;font-weight:600;color:${ctx.settings.linkColor};text-decoration:none">${RECORD_LINK[r.kind]} &rarr;</a></p>`
      : ''
  const words = title + subtitle + meta + link
  if (layout === 'list') {
    return picture
      ? `<table ${TABLE} width="100%"><tr><td width="${imageWidth + 16}" valign="top" style="width:${imageWidth + 16}px;padding-right:16px">${picture}</td><td valign="top">${words}</td></tr></table>`
      : words
  }
  return `${picture}${picture ? spacer(12) : ''}${words}`
}

function resolveRecords(value: RecordsValue, ctx: Ctx): ResolvedRecord[] {
  return value.ids.map((id) => ctx.records.get(recordKey(value.kind, id))).filter((r): r is ResolvedRecord => Boolean(r && r.title))
}

function drawRecords(found: ResolvedRecord[], layout: RecordLayout, ctx: Ctx): string {
  for (const r of found) {
    const to = href(r.url, ctx)
    ctx.text.push([r.subtitle ? `${r.title} — ${r.subtitle}` : r.title, to ?? ''].filter(Boolean).join('\n'))
  }
  if (layout === 'grid') {
    const width = Math.floor((INNER - 20) / 2)
    return chunk(found, 2)
      .map((pair) => columns(pair.map((r) => recordCell(r, ctx, 'grid', width)).concat(pair.length === 1 ? [''] : []), { gap: 20 }))
      .join(spacer(24))
  }
  if (layout === 'cards') {
    return found.map((r) => recordCell(r, ctx, 'cards', INNER)).join(spacer(32))
  }
  const rule = rgba(ctx.settings.mutedColor, 0.3)
  return `<table ${TABLE} width="100%">${found
    .map((r, i) => `<tr><td style="padding:14px 0;${i < found.length - 1 ? `border-bottom:1px solid ${rule};` : ''}">${recordCell(r, ctx, 'list', 96)}</td></tr>`)
    .join('')}</table>`
}

// ── The blocks ──────────────────────────────────────────────────

type Drawer = (props: Props, ctx: Ctx) => string

const DRAW: Record<string, Drawer> = {
  hero(p, ctx) {
    const src = imageSrc(p.image, ctx)
    const overlay = color(p.overlayColor, BRAND.navy)
    const strength = Number(p.overlayOpacity ?? 45) / 100
    const ink = color(p.textColor, BRAND.white)
    const align = alignOf(p.align)
    const pad = { s: 40, m: 72, l: 120 }[String(p.height)] ?? 72
    const bg = src
      ? `background-color:${overlay};background-image:url('${esc(src)}');background-image:linear-gradient(${rgba(overlay, strength)},${rgba(overlay, strength)}),url('${esc(src)}');background-size:cover;background-position:center;`
      : `background-color:${overlay};`
    const logo = logoHtml(p, ctx, align, ink)
    const value = str(p, 'text')
    const head =
      (logo ? `<div style="margin:0 0 32px 0">${logo}</div>` : '') +
      eyebrow(str(p, 'eyebrow'), ctx, align, ink) +
      headingHtml(str(p, 'heading'), ctx, { size: 'xl', align, ink, level: 1 }) +
      headingHtml(str(p, 'subheading'), ctx, { size: 's', align, ink })
    if (value) ctx.text.push(plain(value, ctx))
    const cta = blockButton(p, ctx, align)
    const note = str(p, 'note')
    if (note) ctx.text.push(plain(note, ctx))
    const body =
      head +
      (value ? paragraphs(value, ctx, bodyStyle(ctx, ink, align, 16), ink) : '') +
      (cta ? spacer(24) + cta : '') +
      (note ? `<p style="margin:24px 0 0 0;${bodyStyle(ctx, ink, align, 11)};opacity:0.85">${inline(note, ctx, ink)}</p>` : '')
    return `<tr><td align="${align}" valign="middle"${src ? ` background="${esc(src)}"` : ''} bgcolor="${overlay}" style="${bg}padding:${pad}px ${GUTTER}px;text-align:${align}">${body}</td></tr>`
  },

  logo(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.mutedColor)
    const label = str(p, 'linkLabel')
    const to = href(p.linkUrl, ctx)
    if (!label || !to) return row(logoHtml(p, ctx, align, ctx.settings.headingColor), p)
    ctx.text.push(`${plain(label, ctx)}: ${to}`)
    const link = `<a href="${esc(to)}" style="font-family:${font(ctx, 'sans')};font-size:12px;color:${ink};text-decoration:underline">${inline(label, ctx, ink)}</a>`
    return row(
      `<table ${TABLE} width="100%"><tr><td valign="middle" style="text-align:left">${logoHtml(p, ctx, 'left', ctx.settings.headingColor)}</td><td valign="middle" style="text-align:right">${link}</td></tr></table>`,
      p,
    )
  },

  heading(p, ctx) {
    const align = alignOf(p.align)
    const html =
      eyebrow(str(p, 'eyebrow'), ctx, align, color(p.textColor, ctx.settings.mutedColor)) +
      headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink: color(p.textColor, ctx.settings.headingColor), font: p.font, margin: 0 })
    return html ? row(html, p) : ''
  },

  text(p, ctx) {
    const value = str(p, 'text')
    if (!value.trim()) return ''
    ctx.text.push(plain(value, ctx))
    const size = { s: 13, m: 15, l: 18 }[String(p.size)] ?? 15
    return row(paragraphs(value, ctx, bodyStyle(ctx, color(p.textColor, ctx.settings.textColor), alignOf(p.align), size), ctx.settings.linkColor), p)
  },

  section(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.textColor)
    const value = str(p, 'text')
    const head =
      eyebrow(str(p, 'eyebrow'), ctx, align, color(p.textColor, ctx.settings.mutedColor)) +
      headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink: color(p.textColor, ctx.settings.headingColor) })
    if (value) ctx.text.push(plain(value, ctx))
    const cta = blockButton(p, ctx, align)
    const html = head + (value ? paragraphs(value, ctx, bodyStyle(ctx, ink, align), ctx.settings.linkColor) : '') + (cta ? spacer(24) + cta : '')
    return html ? row(html, p) : ''
  },

  quote(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.headingColor)
    const quote = str(p, 'quote')
    if (!quote.trim()) return ''
    ctx.text.push(`“${plain(quote, ctx)}”`)
    const who = [str(p, 'author'), str(p, 'role')].filter(Boolean)
    if (who.length) ctx.text.push(`— ${who.map((w) => plain(w, ctx)).join(', ')}`)
    const portrait = imageSrc(p.portrait, ctx)
    const italic = ctx.settings.headingFont === 'serif' ? ';font-style:italic' : ''
    return row(
      `<p style="margin:0 0 18px 0;font-family:${font(ctx, 'heading')};font-size:22px;line-height:1.4;color:${ink};text-align:${align}${italic}">&ldquo;${inline(quote, ctx, ink)}&rdquo;</p>` +
        (portrait
          ? `<img src="${esc(portrait)}" alt="${esc(str(p, 'author') || imageAlt(p.portrait))}" width="56" height="56" style="display:block;margin:${align === 'center' ? '0 auto 10px' : align === 'right' ? '0 0 10px auto' : '0 0 10px'};width:56px;height:56px;border-radius:28px;border:0">`
          : '') +
        (who.length
          ? `<p style="margin:0;${bodyStyle(ctx, color(p.textColor, ctx.settings.mutedColor), align, 13)}"><strong>${inline(who[0] ?? '', ctx, ink)}</strong>${who[1] ? `<br>${inline(who[1], ctx, ink)}` : ''}</p>`
          : ''),
      p,
    )
  },

  image(p, ctx) {
    const bleed = p.fullBleed === true
    const caption = str(p, 'caption')
    const html = img(imageSrc(p.image, ctx), str(p, 'alt') || imageAlt(p.image) || caption, bleed ? COLUMN : INNER, ctx, { rounded: p.rounded === true, link: p.link })
    if (!html) return ''
    if (caption) ctx.text.push(plain(caption, ctx))
    const cap = caption
      ? `<p style="margin:10px 0 0 0;padding:0 ${bleed ? GUTTER : 0}px;${bodyStyle(ctx, ctx.settings.mutedColor, 'left', 12)}">${inline(caption, ctx, ctx.settings.linkColor)}</p>`
      : ''
    return row(html + cap, p, { gutter: !bleed })
  },

  'image-text'(p, ctx) {
    const ink = color(p.textColor, ctx.settings.textColor)
    const heading = str(p, 'heading')
    const picture = img(imageSrc(p.image, ctx), str(p, 'alt') || imageAlt(p.image) || heading, 250, ctx, { rounded: true })
    const value = str(p, 'text')
    const head =
      eyebrow(str(p, 'eyebrow'), ctx, 'left', ctx.settings.mutedColor) +
      headingHtml(heading, ctx, { size: 'm', align: 'left', ink: color(p.textColor, ctx.settings.headingColor) })
    if (value) ctx.text.push(plain(value, ctx))
    const cta = blockButton(p, ctx, 'left')
    const words = head + (value ? paragraphs(value, ctx, bodyStyle(ctx, ink, 'left', 14), ctx.settings.linkColor) : '') + (cta ? spacer(16) + cta : '')
    if (!words && !picture) return ''
    const cells = picture ? (p.side === 'end' ? [words, picture] : [picture, words]) : [words]
    return row(columns(cells, { gap: 28, valign: 'middle' }), p)
  },

  gallery(p, ctx) {
    const list = items(p).filter((i) => imageSrc(i.image, ctx))
    if (list.length === 0) return ''
    const width = Math.floor((INNER - 16 * (list.length - 1)) / list.length)
    const cells = list.map((i) => {
      const caption = str(i, 'caption')
      if (caption) ctx.text.push(plain(caption, ctx))
      return (
        img(imageSrc(i.image, ctx), str(i, 'alt') || imageAlt(i.image) || caption, width, ctx, { rounded: p.rounded === true, link: i.link }) +
        (caption ? `<p style="margin:8px 0 0 0;${bodyStyle(ctx, ctx.settings.mutedColor, 'left', 12)}">${inline(caption, ctx, ctx.settings.linkColor)}</p>` : '')
      )
    })
    return row(columns(cells, { gap: 16 }), p)
  },

  features(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.textColor)
    const list = items(p)
    if (list.length === 0) return ''
    const head = headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink: color(p.textColor, ctx.settings.headingColor), margin: 20 })
    const iconWidth = Math.floor(INNER / list.length) - 20
    const cells = list.map((i) => {
      const title = str(i, 'title')
      const body = str(i, 'text')
      const line = [title, body].filter(Boolean).map((t) => plain(t, ctx)).join(' — ')
      if (line) ctx.text.push(line)
      const icon = img(imageSrc(i.icon, ctx), title || imageAlt(i.icon), iconWidth, ctx, { center: align === 'center' })
      return (
        (icon ? `<div style="margin:0 0 12px 0">${icon}</div>` : '') +
        (title
          ? `<p style="margin:0 0 6px 0;font-family:${font(ctx, 'body')};font-size:15px;font-weight:600;line-height:1.3;color:${color(p.textColor, ctx.settings.headingColor)};text-align:${align}">${inline(title, ctx, ink)}</p>`
          : '') +
        (body ? `<p style="margin:0;${bodyStyle(ctx, color(p.textColor, ctx.settings.mutedColor), align, 13)};line-height:1.45">${inline(body, ctx, ctx.settings.linkColor)}</p>` : '')
      )
    })
    return row(head + columns(cells, { gap: 20, dividers: p.dividers === true ? rgba(color(p.textColor, ctx.settings.mutedColor), 0.35) : undefined }), p)
  },

  cards(p, ctx) {
    const list = items(p)
    if (list.length === 0) return ''
    const ink = color(p.textColor, ctx.settings.textColor)
    const card = color(p.cardBackground, BRAND.white)
    const head = headingHtml(str(p, 'heading'), ctx, { size: 'm', align: 'center', ink: color(p.textColor, ctx.settings.headingColor), margin: 20 })
    const width = Math.floor((INNER - 16 * (list.length - 1)) / list.length)
    const cells = list.map((i) => {
      const title = str(i, 'title')
      const body = str(i, 'text')
      const line = [title, body].filter(Boolean).map((t) => plain(t, ctx)).join(' — ')
      if (line) ctx.text.push(line)
      const link = button({ label: str(i, 'linkLabel'), url: i.url, fill: ctx.settings.linkColor, ink, style: 'link', align: 'left' }, ctx)
      const picture = img(imageSrc(i.image, ctx), title || imageAlt(i.image), width, ctx, { link: i.url })
      return `<table ${TABLE} width="100%" bgcolor="${card}" style="background-color:${card};border:1px solid ${BRAND.border};border-radius:10px;border-collapse:separate;overflow:hidden">${picture ? `<tr><td>${picture}</td></tr>` : ''}<tr><td style="padding:16px 18px 18px">${
        title
          ? `<p style="margin:0 0 6px 0;font-family:${font(ctx, 'heading')};font-size:19px;line-height:1.25;color:${color(p.textColor, ctx.settings.headingColor)}">${inline(title, ctx, ink)}</p>`
          : ''
      }${body ? `<p style="margin:0 0 12px 0;${bodyStyle(ctx, ink, 'left', 13)}">${inline(body, ctx, ctx.settings.linkColor)}</p>` : ''}${link}</td></tr></table>`
    })
    return row(head + columns(cells, { gap: 16 }), p)
  },

  stats(p, ctx) {
    const list = items(p).filter((i) => str(i, 'value') || str(i, 'label'))
    if (list.length === 0) return ''
    const valueInk = color(p.valueColor, ctx.settings.headingColor)
    const head = headingHtml(str(p, 'heading'), ctx, { size: 'm', align: 'center', ink: color(p.textColor, ctx.settings.headingColor), margin: 20 })
    const cells = list.map((i) => {
      const value = str(i, 'value')
      const label = str(i, 'label')
      ctx.text.push([value, label].filter(Boolean).map((t) => plain(t, ctx)).join(' — '))
      return `<p style="margin:0 0 4px 0;font-family:${BRAND_FONT.mono};font-size:26px;font-weight:500;line-height:1.15;color:${valueInk};text-align:center">${inline(value, ctx, valueInk)}</p><p style="margin:0;${bodyStyle(ctx, color(p.textColor, ctx.settings.mutedColor), 'center', 12)}">${inline(label, ctx, valueInk)}</p>`
    })
    return row(head + columns(cells, { gap: 12 }), p)
  },

  chips(p, ctx) {
    const align = alignOf(p.align)
    const chip = color(p.chipColor, ctx.settings.textColor)
    const chipFill = color(p.chipFill, '')
    const radius = p.shape === 'pill' ? 999 : p.shape === 'rounded' ? 4 : 0
    const intro = str(p, 'intro')
    const labels = items(p)
      .map((i) => str(i, 'label'))
      .filter(Boolean)
    const head = headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink: color(p.textColor, ctx.settings.headingColor) })
    if (intro) ctx.text.push(plain(intro, ctx))
    if (labels.length) ctx.text.push(labels.map((l) => plain(l, ctx)).join(' · '))
    const pills = labels
      .map(
        (l) =>
          `<span style="display:inline-block;margin:4px;padding:6px 14px;border:1px solid ${chip};border-radius:${radius}px;${chipFill ? `background-color:${chipFill};` : ''}font-family:${font(ctx, 'body')};font-size:13px;line-height:1.3;color:${chip}">${inline(l, ctx, chip)}</span>`,
      )
      .join('')
    const html =
      head +
      (intro ? paragraphs(intro, ctx, bodyStyle(ctx, color(p.textColor, ctx.settings.textColor), align), ctx.settings.linkColor) + spacer(10) : '') +
      (pills ? `<div style="text-align:${align}">${pills}</div>` : '')
    return html ? row(html, p) : ''
  },

  list(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.textColor)
    const rule = rgba(color(p.textColor, ctx.settings.mutedColor), 0.3)
    const entries = items(p)
      .map((i) => str(i, 'text'))
      .filter(Boolean)
    if (entries.length === 0) return ''
    const head = headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink: color(p.textColor, ctx.settings.headingColor) })
    const intro = str(p, 'intro')
    if (intro) ctx.text.push(plain(intro, ctx))
    ctx.text.push(entries.map((e) => `• ${plain(e, ctx)}`).join('\n'))
    const marker = ({ dot: '&bull;', check: '&#10003;', dash: '&ndash;', rule: '' } as Record<string, string>)[String(p.marker)] ?? ''
    const line = (e: string) =>
      `<tr><td style="padding:7px 0;${p.marker === 'rule' ? `border-bottom:1px solid ${rule};` : ''}${bodyStyle(ctx, ink, 'left', 14)}">${marker ? `<span style="color:${ctx.settings.linkColor};padding-right:8px">${marker}</span>` : ''}${inline(e, ctx, ctx.settings.linkColor)}</td></tr>`
    const two = p.columns === '2' && entries.length > 1
    const half = Math.ceil(entries.length / 2)
    const lists = two ? [entries.slice(0, half), entries.slice(half)] : [entries]
    const tables = lists.map((l) => `<table ${TABLE} width="100%">${l.map(line).join('')}</table>`)
    return row(
      head +
        (intro ? paragraphs(intro, ctx, bodyStyle(ctx, ink, align), ctx.settings.linkColor) + spacer(12) : '') +
        (two ? columns(tables, { gap: 32 }) : (tables[0] ?? '')),
      p,
    )
  },

  'key-values'(p, ctx) {
    const ink = color(p.textColor, ctx.settings.textColor)
    const rule = rgba(color(p.textColor, ctx.settings.mutedColor), 0.3)
    const lines = items(p)
      .map((i) => [str(i, 'label'), str(i, 'value')] as const)
      .filter(([l, v]) => l || v)
    if (lines.length === 0) return ''
    const head = headingHtml(str(p, 'heading'), ctx, { size: p.size, align: 'left', ink: color(p.textColor, ctx.settings.headingColor) })
    ctx.text.push(lines.map(([l, v]) => `${plain(l, ctx)}: ${plain(v, ctx)}`).join('\n'))
    const border = p.rules === true ? `border-bottom:1px solid ${rule};` : ''
    const body = lines
      .map(
        ([l, v]) =>
          `<tr><td valign="top" style="padding:8px 12px 8px 0;${border}${bodyStyle(ctx, color(p.textColor, ctx.settings.mutedColor), 'left', 14)}">${inline(l, ctx, ink)}</td><td valign="top" style="padding:8px 0;${border}${bodyStyle(ctx, ink, 'right', 14)}${p.boldValues === true ? ';font-weight:600' : ''}">${inline(v, ctx, ctx.settings.linkColor)}</td></tr>`,
      )
      .join('')
    return row(head + `<table ${TABLE} width="100%">${body}</table>`, p)
  },

  person(p, ctx) {
    const ink = color(p.textColor, ctx.settings.textColor)
    const name = str(p, 'name')
    const role = str(p, 'role')
    const said = str(p, 'text')
    const who = [name, role].filter(Boolean).map((t) => plain(t, ctx)).join(', ')
    if (who) ctx.text.push(who)
    if (said) ctx.text.push(plain(said, ctx))
    const links = reachLinks(p, ctx, ctx.settings.linkColor, 13)
    const words =
      (name
        ? `<p style="margin:0 0 2px 0;font-family:${font(ctx, 'heading')};font-size:22px;line-height:1.2;color:${color(p.textColor, ctx.settings.headingColor)}">${inline(name, ctx, ink)}</p>`
        : '') +
      (role ? `<p style="margin:0 0 10px 0;${bodyStyle(ctx, ctx.settings.mutedColor, 'left', 13)}">${inline(role, ctx, ink)}</p>` : '') +
      (said ? paragraphs(said, ctx, bodyStyle(ctx, ink, 'left', 14), ctx.settings.linkColor) : '') +
      (links.length ? `<p style="margin:10px 0 0 0;line-height:1.8">${links.join('<br>')}</p>` : '')
    if (!words) return ''
    const photo = imageSrc(p.photo, ctx)
    const pic = photo
      ? `<img src="${esc(photo)}" alt="${esc(name || imageAlt(p.photo))}" width="96" height="96" style="display:block;width:96px;height:96px;border-radius:48px;border:0">`
      : ''
    return row(
      pic ? `<table ${TABLE} width="100%"><tr><td width="116" valign="top" style="width:116px">${pic}</td><td valign="top">${words}</td></tr></table>` : words,
      p,
    )
  },

  button(p, ctx) {
    const html = button(
      {
        label: str(p, 'label'),
        url: p.url,
        fill: color(p.buttonColor, ctx.settings.buttonColor),
        ink: color(p.buttonTextColor, ctx.settings.buttonTextColor),
        style: p.buttonStyle,
        shape: p.shape,
        fullWidth: p.fullWidth === true,
        align: alignOf(p.align),
      },
      ctx,
    )
    return html ? row(html, p) : ''
  },

  'cta-band'(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, BRAND.white)
    const value = str(p, 'text')
    const head = eyebrow(str(p, 'eyebrow'), ctx, align, ink) + headingHtml(str(p, 'heading'), ctx, { size: p.size, align, ink })
    if (value) ctx.text.push(plain(value, ctx))
    const first = blockButton(p, ctx, align, 'primary', 'solid')
    const second = blockButton(p, ctx, align, 'secondary', 'outline')
    const html =
      head +
      (value ? paragraphs(value, ctx, bodyStyle(ctx, ink, align), ink) : '') +
      (first ? spacer(22) + first : '') +
      (second ? spacer(12) + second : '')
    return html ? row(html, { ...p, background: color(p.background, BRAND.navy) }) : ''
  },

  offer(p, ctx) {
    const ink = ctx.settings.textColor
    const badgeText = str(p, 'badge')
    if (badgeText) ctx.text.push(`[${plain(badgeText, ctx)}]`)
    const badge = badgeText
      ? `<table ${TABLE} style="margin:0 0 14px 0"><tr><td bgcolor="${color(p.badgeColor, BRAND.accent)}" style="background-color:${color(p.badgeColor, BRAND.accent)};border-radius:999px;padding:5px 12px;font-family:${BRAND_FONT.sans};font-size:12px;font-weight:600;line-height:1.2;color:${color(p.badgeTextColor, BRAND.white)}">${inline(badgeText, ctx, color(p.badgeTextColor, BRAND.white))}</td></tr></table>`
      : ''
    const head = eyebrow(str(p, 'eyebrow'), ctx, 'left', ctx.settings.mutedColor) + headingHtml(str(p, 'heading'), ctx, { size: p.size, align: 'left', ink: ctx.settings.headingColor })
    const value = str(p, 'text')
    if (value) ctx.text.push(plain(value, ctx))
    const body = value ? paragraphs(value, ctx, bodyStyle(ctx, ink, 'left'), ctx.settings.linkColor) : ''
    const code = str(p, 'code')
    if (code) ctx.text.push(`Quote: ${plain(code, ctx)}`)
    const codeHtml = code
      ? `<p style="margin:14px 0 0 0;${bodyStyle(ctx, ink, 'left', 14)}">Quote <strong style="color:${ctx.settings.headingColor}">${inline(code, ctx, ctx.settings.headingColor)}</strong> when you ask.</p>`
      : ''
    const recordsValue = p.records as RecordsValue | null
    const found = recordsValue ? resolveRecords(recordsValue, ctx) : []
    const drawn = found.length ? spacer(20) + drawRecords(found, recordsValue!.layout, ctx) : ''
    const cta = blockButton(p, ctx, 'left')
    const terms = str(p, 'terms')
    if (terms) ctx.text.push(plain(terms, ctx))
    const termsHtml = terms
      ? `<p style="margin:16px 0 0 0;${bodyStyle(ctx, ctx.settings.mutedColor, 'left', 12)}">${inline(terms, ctx, ctx.settings.mutedColor)}</p>`
      : ''
    const inner = badge + head + body + codeHtml + drawn + (cta ? spacer(22) + cta : '') + termsHtml
    if (!head && !body && !drawn) return ''
    const border = color(p.borderColor, BRAND.border)
    const card = color(p.cardBackground, BRAND.white)
    return row(
      `<table ${TABLE} width="100%"><tr><td bgcolor="${card}" style="background-color:${card};border:1px solid ${border};border-radius:10px;padding:28px">${inner}</td></tr></table>`,
      p,
    )
  },

  records(p, ctx) {
    const value = p.records as RecordsValue | null
    const found = value ? resolveRecords(value, ctx) : []
    // Every pick missing (unpublished, deleted): the block goes, heading and all.
    if (!value || found.length === 0) return ''
    const head = headingHtml(str(p, 'heading'), ctx, { size: p.size, align: 'left', ink: ctx.settings.headingColor })
    const intro = str(p, 'intro')
    if (intro) ctx.text.push(plain(intro, ctx))
    const introHtml = intro ? paragraphs(intro, ctx, bodyStyle(ctx, ctx.settings.textColor, 'left'), ctx.settings.linkColor) + spacer(12) : ''
    const drawn = drawRecords(found, value.layout, ctx)
    const all = blockButton(p, ctx, 'center', 'button', 'outline')
    return row(head + introHtml + drawn + (all ? spacer(24) + all : ''), p)
  },

  social(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.linkColor)
    const names = new Map<string, string>(SOCIAL_NETWORKS.map(([n, l]) => [n, l]))
    const links = items(p)
      .map((i) => {
        const to = href(i.url, ctx)
        if (!to) return ''
        const name = names.get(String(i.network)) ?? 'Website'
        ctx.text.push(`${name}: ${to}`)
        return `<a href="${esc(to)}" style="font-family:${font(ctx, 'sans')};font-size:13px;font-weight:600;color:${ink};text-decoration:none">${esc(name)}</a>`
      })
      .filter(Boolean)
    return links.length ? row(`<p style="margin:0;text-align:${align}">${links.join(`<span style="color:${ctx.settings.mutedColor}">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`)}</p>`, p) : ''
  },

  contact(p, ctx) {
    const align = alignOf(p.align)
    const ink = color(p.textColor, ctx.settings.mutedColor)
    const lines: string[] = []
    const company = str(p, 'company')
    if (company) {
      ctx.text.push(plain(company, ctx))
      lines.push(
        `<p style="margin:0 0 6px 0;font-family:${font(ctx, 'body')};font-size:14px;font-weight:600;color:${color(p.textColor, ctx.settings.textColor)};text-align:${align}">${inline(company, ctx, ink)}</p>`,
      )
    }
    const address = str(p, 'address')
    if (address) {
      ctx.text.push(plain(address, ctx))
      lines.push(`<p style="margin:0 0 8px 0;${bodyStyle(ctx, ink, align, 12)}">${inline(address, ctx, ink)}</p>`)
    }
    const reach = reachLinks(p, ctx, ink, 12)
    if (reach.length) lines.push(`<p style="margin:0 0 8px 0;text-align:${align}">${reach.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;')}</p>`)
    const links = items(p, 'links')
      .map((l) => {
        const label = str(l, 'label')
        const to = href(l.url, ctx)
        if (!label || !to) return ''
        ctx.text.push(`${plain(label, ctx)}: ${to}`)
        return `<a href="${esc(to)}" style="font-family:${font(ctx, 'sans')};font-size:12px;color:${ink};text-decoration:underline">${inline(label, ctx, ink)}</a>`
      })
      .filter(Boolean)
    if (links.length) lines.push(`<p style="margin:0;text-align:${align}">${links.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;')}</p>`)
    return lines.length ? row(lines.join(''), p) : ''
  },

  divider(p, ctx) {
    const line = color(p.color, ctx.settings.mutedColor)
    const width = Number(p.width ?? 100)
    return row(
      `<table ${TABLE} width="${width}%" align="center" style="margin:0 auto"><tr><td height="1" style="height:1px;line-height:1px;font-size:1px;background-color:${rgba(line, 0.35)}">&nbsp;</td></tr></table>`,
      p,
    )
  },

  spacer(p) {
    const bg = color(p.background, '')
    const h = Number(p.height ?? 32)
    return `<tr><td height="${h}"${bg ? ` bgcolor="${bg}"` : ''} style="height:${h}px;line-height:${h}px;font-size:1px;${bg ? `background-color:${bg}` : ''}">&nbsp;</td></tr>`
  },
}

/** One block (normalised against its definition), drawing into `ctx.text` as it goes. "" when it has nothing to show. */
function drawBlock(block: Block, ctx: Ctx): string {
  const def = blockDef(block.type)
  const draw = def ? DRAW[def.type] : undefined
  if (!def || !draw) return ''
  try {
    return draw(normaliseProps(def, block.props), ctx)
  } catch (error) {
    // A block that throws is left out rather than costing the whole email.
    console.warn(`[newsletter] block ${block.type} failed to render:`, error instanceof Error ? error.message : error)
    return ''
  }
}

/** One block's table row (`<tr>…</tr>`), or "" when it has nothing to show. Settings default to the Indus palette. */
export function renderBlock(block: Block, ctx: DesignRenderContext, settings: DesignSettings = DEFAULT_SETTINGS): string {
  return drawBlock(block, { ...ctx, settings, text: [] })
}

// ── The document ────────────────────────────────────────────────

function footerHtml(ctx: DesignRenderContext): string {
  const unsubscribe = ctx.unsubscribeUrl ? (href(ctx.unsubscribeUrl, ctx) ?? '#') : '#'
  const address = ctx.brand.addressLines.filter((l) => l.trim()).map(esc).join('<br>')
  return `<tr><td bgcolor="${BRAND.navy}" style="padding:18px ${GUTTER}px;background-color:${BRAND.navy};border-top:1px solid ${BRAND.border};font-family:${BRAND_FONT.sans};font-size:11px;color:${BRAND.onNavy};line-height:1.6;text-align:left"><strong style="color:${BRAND.white};">${esc(ctx.brand.legalName)}</strong>${address ? `<br>${address}` : ''}<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);">${esc(ctx.footerReason)} <a href="${esc(unsubscribe)}" style="color:${BRAND.white};text-decoration:underline;">Unsubscribe</a>.</div></td></tr>`
}

function footerText(ctx: DesignRenderContext): string {
  const unsubscribe = ctx.unsubscribeUrl ? (href(ctx.unsubscribeUrl, ctx) ?? '#') : '#'
  return ['--', ctx.brand.legalName, ...ctx.brand.addressLines.filter((l) => l.trim()), '', ctx.footerReason, `Unsubscribe: ${unsubscribe}`].join('\n')
}

/**
 * Wrap already-rendered, already-sanitised inner HTML (the rich-text campaign
 * mode) in the same document, column and mandatory legal footer renderDesign
 * uses. The caller guarantees innerHtml is safe; this function does not
 * sanitise it.
 *
 * `inner.html` sits edge to edge in the 600px card, in one cell that sets the
 * body font, size and colour for prose to inherit — give prose its own side
 * padding (renderDesign's rows carry theirs).
 */
export function renderShell(inner: { html: string; text: string }, settings: DesignSettings, ctx: DesignRenderContext): RenderedDesign {
  const s = settings
  const preheader = ctx.preheader?.trim()
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(ctx.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${s.pageBackground};font-family:${BRAND_FONT[s.bodyFont]};color:${s.textColor};-webkit-text-size-adjust:100%">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${s.pageBackground}">${esc(preheader)}</div>` : ''}
<table ${TABLE} width="100%" bgcolor="${s.pageBackground}" style="background-color:${s.pageBackground}"><tr><td align="center" style="padding:32px 16px">
<table ${TABLE} width="${COLUMN}" bgcolor="${s.contentBackground}" style="width:100%;max-width:${COLUMN}px;background-color:${s.contentBackground};border:1px solid ${BRAND.border};border-radius:10px;border-collapse:separate;overflow:hidden">
<tr><td style="padding:0;font-family:${BRAND_FONT[s.bodyFont]};font-size:15px;line-height:1.6;color:${s.textColor}">
${inner.html}
</td></tr>
${footerHtml(ctx)}
</table>
</td></tr></table>
</body>
</html>`
  const text = [inner.text.trim(), footerText(ctx)].filter(Boolean).join('\n\n')
  return { html, text: `${text}\n` }
}

/** The whole email: normalised first, every block drawn, the legal footer always last. */
export function renderDesign(raw: Design | unknown, ctx: DesignRenderContext): RenderedDesign {
  const design = normaliseDesign(raw)
  const c: Ctx = { ...ctx, settings: design.settings, text: [] }
  const rows: string[] = []
  for (const block of design.blocks) {
    const before = c.text.length
    const html = drawBlock(block, c)
    if (html) rows.push(html)
    // A blank line between blocks in the text part; a block that drew nothing adds none.
    if (c.text.length > before) c.text.push('')
  }
  const inner = rows.length ? `<table ${TABLE} width="100%" style="width:100%">\n${rows.join('\n')}\n</table>` : ''
  const text = c.text
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return renderShell({ html: inner, text }, design.settings, ctx)
}
