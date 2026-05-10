/**
 * Shared types + helpers for the 10-case Services launch seed.
 *
 * The launch cases are defined as `ServiceCaseSeed` objects (same shape as
 * the Prisma input but with a few quality-of-life conveniences). The runner
 * (../run.ts) iterates the array, validates the body blocks via Zod, then
 * upserts to the live DB.
 */
import {
  type BodyBlock,
  type CardOutcomePill,
  type Download,
  type MetaCell,
  type SpecAtGlance,
} from '@indus/domain'

export type ServiceCaseSeed = {
  // Identity
  slug: string
  caseNumber: string
  isFeatured?: boolean

  // Hero
  category:
    | 'cylinders'
    | 'hoses'
    | 'pumps'
    | 'valves_manifolds'
    | 'bop_pressure_control'
    | 'ct_wireline'
    | 'wellhead'
    | 'field_service'
    | 'lab_forensics'
    | 'custom_builds'
  topicLabel: string
  region: string
  caseDateLabel: string
  title: string
  titleAccent?: string
  deck: string
  heroImageCaption?: string
  heroImageCredit?: string

  // Meta strip
  metaCells: MetaCell[]

  // Body
  bodyBlocks: BodyBlock[]

  // Right rail
  ctaCardTitle: string
  ctaCardBody: string
  ctaCardPhone?: string
  pullQuoteText: string
  pullQuoteAuthor: string
  pullQuoteRole: string
  pullQuoteLocation: string
  specsAtGlance: SpecAtGlance[]
  galleryTotalCount: number
  downloads: Download[]
  caseFileMeta: string

  // Card grid display
  cardOneLiner: string
  cardOutcomePills: CardOutcomePill[]
  cardDurationLabel: string
  cardTagStyle: 'standard' | 'oil'
  cardTagLabel: string

  // Sort dimensions
  durationDays?: number
  savingsAmount?: number
  savingsCurrency?: 'AED'

  // SEO
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
}

// ── Block-builder shorthands ─────────────────────────────────────────────
// The body blocks in raw form are verbose. These helpers cut the noise so
// case authors can focus on content rather than shape.

export const sectionHead = (number: string, anchor: string, title: string): BodyBlock => ({
  type: 'section_head',
  number,
  anchor,
  title,
})

export const lead = (html: string): BodyBlock => ({ type: 'lead', html })

export const para = (html: string): BodyBlock => ({ type: 'paragraph', html })

export const problemSolution = (
  problem: { label: string; title: string; body: string },
  solution: { label: string; title: string; body: string },
): BodyBlock => ({ type: 'problem_solution', problem, solution })

export const figure = (
  caption: string,
  opts: { captionPrefix?: string; placeholderLabel?: string; aspectRatio?: '16/9' | '21/9' | '4/3' | '1/1' } = {},
): BodyBlock => ({
  type: 'figure',
  imageId: null,
  caption,
  captionPrefix: opts.captionPrefix ?? null,
  placeholderLabel: opts.placeholderLabel ?? null,
  aspectRatio: opts.aspectRatio ?? '16/9',
})

export const pullQuote = (quote: string, cite: string): BodyBlock => ({
  type: 'pull_quote',
  quote,
  cite,
})

export const approachGrid = (
  phases: Array<{ number: string; title: string; body: string; duration: string }>,
): BodyBlock => ({ type: 'approach_grid', phases })

export const sopBlock = (
  header: string,
  completion: string,
  phases: Array<{
    name: string
    rows: Array<{ task: string; detail: string; who: string; tool: string; done?: boolean }>
  }>,
): BodyBlock => ({
  type: 'sop_block',
  header,
  completion,
  phases: phases.map((p) => ({
    name: p.name,
    rows: p.rows.map((r) => ({ ...r, done: r.done ?? true })),
  })),
})

export const specTable = (
  caption: string,
  rows: Array<{
    component: string
    spec: string
    asFound: string
    afterRebuild: string
    status: string
    highlight?: boolean
    asFoundStyle?: 'bad' | 'num' | 'plain'
    afterStyle?: 'good' | 'num' | 'plain'
  }>,
): BodyBlock => ({
  type: 'spec_table',
  caption,
  rows: rows.map((r) => ({
    component: r.component,
    spec: r.spec,
    asFound: r.asFound,
    afterRebuild: r.afterRebuild,
    status: r.status,
    highlight: r.highlight ?? false,
    asFoundStyle: r.asFoundStyle ?? 'plain',
    afterStyle: r.afterStyle ?? 'good',
  })),
})

export const resultBox = (
  label: string,
  title: string,
  body: string,
  cells: Array<{ value: string; valueSmall?: string; label: string; style?: 'neutral' | 'good' | 'accent' }>,
): BodyBlock => ({
  type: 'result_box',
  label,
  title,
  body,
  cells: cells.map((c) => ({
    value: c.value,
    valueSmall: c.valueSmall ?? null,
    label: c.label,
    style: c.style ?? 'neutral',
  })),
})

export const teamList = (
  intro: string,
  members: Array<{ name: string; role: string; location?: string; scope: string }>,
  caseFileMeta?: string,
): BodyBlock => ({
  type: 'team_list',
  intro,
  members: members.map((m) => ({
    name: m.name,
    role: m.role,
    location: m.location ?? null,
    scope: m.scope,
  })),
  caseFileMeta: caseFileMeta ?? null,
})

// ── Common fixtures for the launch ───────────────────────────────────────
// Ten cases share a UAE / Jebel Ali / ADNOC context. Reusing these strings
// keeps the cases consistent without hardcoding inside each one.

export const COMMON_CTA_PHONE = '+971 4 881 2345'
export const COMMON_CTA_TITLE = 'Got an asset that needs to be back next month?'
export const COMMON_CTA_BODY =
  'Send photos, the OEM nameplate, and the well or shop slot date. A field engineer in Jebel Ali will be on your skid within 24 h.'
