import sanitizeHtml from 'sanitize-html'
import { z } from 'zod'
import { BRAND, BRAND_FONT } from '@indus/domain'

import { isUsableLink, linkSlots, normaliseDesign, placeholderIn, recordRefs } from './blocks/document'
import { recordKey, renderDesign, renderShell, type DesignRenderContext, type RenderedDesign, type ResolvedRecord } from './blocks/render'

/**
 * A newsletter campaign: what a draft must have before it can go, and how it
 * becomes an email. Pure — the composer runs `campaignProblems` in the
 * browser as the editor types, the send action runs it again on the server.
 *
 * Ported from Bazar (lib/newsletter/campaign.ts) without the Arabic edition
 * and the {{token}} system: an Indus newsletter has one token-shaped thing,
 * the unsubscribe link, and the renderer puts it in the footer itself.
 */

export const AUDIENCES = ['all', 'none'] as const
export type Audience = (typeof AUDIENCES)[number]
export const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'All confirmed subscribers (plus any lists chosen)',
  none: 'Only the lists chosen',
}

export const CAMPAIGN_FORMATS = ['blocks', 'rich'] as const
export type CampaignFormat = (typeof CAMPAIGN_FORMATS)[number]

export const MAX_CAMPAIGN_LISTS = 20

export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'cancelled'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  cancelled: 'Cancelled',
}

/** Statuses in which the content can still change. */
export const EDITABLE_STATUSES: readonly CampaignStatus[] = ['draft', 'scheduled']

export const campaignDraftSchema = z.object({
  subject: z.string().max(200, 'Keep the subject under 200 characters.'),
  preheader: z.string().max(200, 'Keep the preview text under 200 characters.'),
  format: z.enum(CAMPAIGN_FORMATS),
  design: z.unknown().nullable(),
  bodyHtml: z.string().max(200_000, 'The newsletter is too long.'),
  audience: z.enum(AUDIENCES),
  listIds: z.array(z.string().uuid()).max(MAX_CAMPAIGN_LISTS, `Pick at most ${MAX_CAMPAIGN_LISTS} lists.`),
})
export type CampaignDraft = z.infer<typeof campaignDraftSchema>

// ── Rich-text body ─────────────────────────────────────────────────────

const P = `margin:0 0 16px 0;font-family:${BRAND_FONT.sans};font-size:15px;line-height:1.6;color:${BRAND.ink2};`
const H = (size: number) =>
  `margin:24px 0 12px 0;font-family:${BRAND_FONT.serif};font-size:${size}px;font-weight:400;line-height:1.25;color:${BRAND.ink};`

/**
 * The rich editor's HTML, cut down to what an email can carry and given the
 * inline styles mail clients need (they strip <style>). No scripts, no
 * classes, no attributes beyond href/src/alt; links only http(s), mailto, tel
 * or site-relative; images only https.
 */
export function sanitiseEmailHtml(html: string, siteUrl: string): string {
  const abs = (url: string) => (url.startsWith('/') && !url.startsWith('//') ? `${siteUrl}${url}` : url)
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'img'],
    // `style` only on tags transformTags rewrites: their attributes are
    // replaced wholesale, so a pasted style never survives — only ours.
    allowedAttributes: {
      a: ['href', 'style'],
      img: ['src', 'alt', 'width', 'height', 'style'],
      ...Object.fromEntries(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr'].map((t) => [t, ['style']])),
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      p: () => ({ tagName: 'p', attribs: { style: P } }),
      h2: () => ({ tagName: 'h2', attribs: { style: H(24) } }),
      h3: () => ({ tagName: 'h3', attribs: { style: H(20) } }),
      h4: () => ({ tagName: 'h4', attribs: { style: H(17) } }),
      ul: () => ({ tagName: 'ul', attribs: { style: `margin:0 0 16px 0;padding-left:22px;${P}` } }),
      ol: () => ({ tagName: 'ol', attribs: { style: `margin:0 0 16px 0;padding-left:22px;${P}` } }),
      li: () => ({ tagName: 'li', attribs: { style: 'margin:0 0 6px 0;' } }),
      blockquote: () => ({
        tagName: 'blockquote',
        attribs: { style: `margin:0 0 16px 0;padding:4px 0 4px 16px;border-left:3px solid ${BRAND.accent};color:${BRAND.ink};` },
      }),
      hr: () => ({ tagName: 'hr', attribs: { style: `border:0;border-top:1px solid ${BRAND.border};margin:24px 0;` } }),
      a: (_tag, attribs) => ({
        tagName: 'a',
        attribs: { href: abs(attribs.href ?? ''), style: `color:${BRAND.accent};text-decoration:underline;` },
      }),
      img: (_tag, attribs) => ({
        tagName: 'img',
        attribs: {
          src: abs(attribs.src ?? ''),
          alt: attribs.alt ?? '',
          ...(attribs.width ? { width: attribs.width } : {}),
          style: 'display:block;max-width:100%;height:auto;border:0;margin:0 0 16px 0;',
        },
      }),
    },
    exclusiveFilter: (frame) => frame.tag === 'a' && !isUsableLink(frame.attribs.href ?? ''),
  })
}

/** Plain text from email HTML: block ends become line breaks, links keep their URL. */
export function htmlToText(html: string): string {
  return html
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim()
      return text && text !== href ? `${text} (${href})` : href
    })
    .replace(/<li\b[^>]*>/gi, '- ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote|ul|ol)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** True when the rich body shows a reader nothing: no text, no picture. */
export function isBlankBody(html: string | null | undefined): boolean {
  if (!html) return true
  return html.replace(/<img\b[^>]*>/gi, 'x').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
}

/** Every href in rich HTML, for the link check. */
function richLinks(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*href="([^"]*)"/gi)].map((m) => m[1]!)
}

// ── The send gate ──────────────────────────────────────────────────────

export type GateContext = {
  /** Records a block names that no longer resolve (unpublished, deleted). */
  missingRecords: number
  /** How many of the chosen list ids still exist. */
  listsFound: number
}

/**
 * What stops a draft from being sent, keyed by the field to show it next to
 * (`subject`, `preheader`, `body`, `audience`). Empty = ready.
 */
export function campaignProblems(c: CampaignDraft, ctx: GateContext): Record<string, string> {
  const problems: Record<string, string> = {}
  if (!c.subject.trim()) problems.subject = 'Write a subject.'
  else if (placeholderIn(c.subject)) problems.subject = 'The subject still has template text in it.'
  if (placeholderIn(c.preheader)) problems.preheader = 'The preview text still has template text in it.'

  if (c.format === 'blocks') {
    const design = normaliseDesign(c.design)
    if (design.blocks.length === 0) problems.body = 'Add at least one block.'
    else {
      const text = JSON.stringify(design.blocks.map((b) => b.props))
      const badLink = linkSlots(design).find((l) => l.value && !isUsableLink(l.value))
      if (placeholderIn(text)) problems.body = 'Replace the template text the starter left in the blocks.'
      else if (badLink) {
        problems.body = `${badLink.blockLabel} › ${badLink.label} is not a link an email can follow. Use https://…, a page on the site (/contact), mailto: or tel:.`
      } else if (ctx.missingRecords > 0) {
        problems.body = `${ctx.missingRecords} featured item${ctx.missingRecords === 1 ? ' is' : 's are'} no longer published. Remove or replace ${ctx.missingRecords === 1 ? 'it' : 'them'}.`
      }
    }
  } else {
    if (isBlankBody(c.bodyHtml)) problems.body = 'Write the newsletter.'
    else if (placeholderIn(htmlToText(c.bodyHtml))) problems.body = 'Replace the template text the starter left in.'
    else {
      const bad = richLinks(c.bodyHtml).find((h) => !isUsableLink(h))
      if (bad) problems.body = `“${bad.slice(0, 60)}” is not a link an email can follow.`
    }
  }

  if (c.audience === 'none' && c.listIds.length === 0) problems.audience = 'Pick who receives it: the subscribers, a list, or both.'
  else if (ctx.listsFound < c.listIds.length) problems.audience = 'A list chosen for this newsletter has been deleted. Remove it.'
  return problems
}

// ── Rendering ──────────────────────────────────────────────────────────

export type CampaignContent = Pick<CampaignDraft, 'subject' | 'preheader' | 'format' | 'design' | 'bodyHtml'>

export type RecipientKind = 'subscriber' | 'list'

/** Why someone got the email — said in the footer. A list contact did not sign up, so theirs does not say they did. */
export function footerReason(kind: RecipientKind): string {
  return kind === 'subscriber'
    ? 'You are receiving this because you subscribed to the Indus Hydraulics newsletter at indushydraulics.com.'
    : 'You are receiving this because you are on an Indus Hydraulics mailing list.'
}

export type CampaignRenderOptions = Omit<DesignRenderContext, 'subject' | 'preheader' | 'footerReason'> & {
  recipient: RecipientKind
  /** `[Test] ` for a test send. */
  subjectPrefix?: string
}

/** The records a campaign's blocks name — what to resolve before rendering. */
export function campaignRecordRefs(c: Pick<CampaignContent, 'format' | 'design'>) {
  return c.format === 'blocks' ? recordRefs(normaliseDesign(c.design)) : []
}

/** How many named records the map does not have. */
export function countMissingRecords(c: Pick<CampaignContent, 'format' | 'design'>, records: Map<string, ResolvedRecord>): number {
  return campaignRecordRefs(c).reduce((n, r) => n + r.ids.filter((id) => !records.has(recordKey(r.kind, id))).length, 0)
}

/** A campaign as one email: subject, HTML and text, with the legal footer and unsubscribe link. */
export function renderCampaign(c: CampaignContent, opts: CampaignRenderOptions): { subject: string } & RenderedDesign {
  const subject = `${opts.subjectPrefix ?? ''}${c.subject.trim()}`
  const ctx: DesignRenderContext = {
    siteUrl: opts.siteUrl,
    brand: opts.brand,
    records: opts.records,
    unsubscribeUrl: opts.unsubscribeUrl,
    subject,
    preheader: c.preheader.trim() || undefined,
    footerReason: footerReason(opts.recipient),
  }
  if (c.format === 'blocks') return { subject, ...renderDesign(c.design, ctx) }
  // renderShell puts inner HTML edge to edge in the card; prose needs its gutter.
  const html = `<div style="padding:28px 32px 12px 32px;">${sanitiseEmailHtml(c.bodyHtml, opts.siteUrl)}</div>`
  // A rich body still takes the page colours from the design's settings, if a
  // template set any; normaliseDesign falls back to the defaults.
  const settings = normaliseDesign(c.design).settings
  return { subject, ...renderShell({ html, text: htmlToText(html) }, settings, ctx) }
}
