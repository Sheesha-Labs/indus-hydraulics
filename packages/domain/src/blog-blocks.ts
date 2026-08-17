/**
 * BlogPost body block types — typed discriminated union with Zod runtime
 * validation. Stored as a JSONB array on `blog_posts.bodyBlocks`.
 *
 * The eleven blocks that already exist for ServiceCase are reused verbatim
 * rather than forked: a spec table is a spec table whether it appears in a
 * rebuild write-up or a hose selection guide, and two copies would drift.
 * `./service-case-blocks` is therefore the shared home for those; this module
 * adds the blocks a knowledge-base article needs and composes its own union.
 *
 * The additions fall into three groups:
 *
 *   Retrieval — `key_takeaways`, `direct_answer`, `as_of_stamp`. Answer
 *   engines extract a leading summary, a short answer directly under a
 *   question heading, and a freshness date. These exist to be quoted.
 *
 *   Commerce — `product_embed`, `category_link`, `cta_block`. The blog earns
 *   nothing unless articles route into the catalogue, so linking is a block
 *   type rather than something an author remembers to do in prose.
 *
 *   Accuracy — `standard_citation`. Pressure ratings and standard numbers
 *   quoted from memory are a safety problem and a credibility problem. Making
 *   the citation a structured field means an article either has the reference
 *   or visibly does not.
 */
import { z } from 'zod'
import {
  ApproachGridBlockSchema,
  DownloadSchema,
  FigureBlockSchema,
  LeadBlockSchema,
  ParagraphBlockSchema,
  ProblemSolutionBlockSchema,
  PullQuoteBlockSchema,
  ResultBoxBlockSchema,
  SectionHeadBlockSchema,
  SopBlockSchema,
  SpecTableBlockSchema,
  TeamListBlockSchema,
} from './service-case-blocks'

// ── Shared atoms ──────────────────────────────────────────────────────────

const NonEmpty = (max: number) => z.string().trim().min(1).max(max)
const OptionalText = (max: number) => z.string().trim().max(max).optional().nullable()

/** Kebab-case slug, matching the anchor convention already used by section_head. */
const Slug = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case')

// ── Block: key takeaways ──────────────────────────────────────────────────
// Opens the article. The highest-value block for answer-engine extraction:
// a model summarising the page will lift these almost verbatim.
export const KeyTakeawaysBlockSchema = z.object({
  type: z.literal('key_takeaways'),
  heading: OptionalText(80),
  items: z.array(NonEmpty(300)).min(2).max(6),
})
export type KeyTakeawaysBlock = z.infer<typeof KeyTakeawaysBlockSchema>

// ── Block: direct answer ──────────────────────────────────────────────────
// Sits immediately under a question-shaped H2. Deliberately capped short —
// a 60-word answer gets quoted whole; a 300-word one gets paraphrased or
// skipped, which is the difference between a citation and nothing.
export const DirectAnswerBlockSchema = z.object({
  type: z.literal('direct_answer'),
  question: NonEmpty(200),
  answer: NonEmpty(600),
})
export type DirectAnswerBlock = z.infer<typeof DirectAnswerBlockSchema>

// ── Block: comparison table ───────────────────────────────────────────────
// Generic N-column compare — R1 vs R2 vs 4SP, JIC vs ORFS vs BSPP. Distinct
// from spec_table, which is shaped as-found/after-rebuild for service cases.
//
// Rendered as real HTML table markup, never an image: most competitor spec
// charts are trapped in JPEGs and PDFs, and an answer engine cannot cite what
// it cannot parse. That is the cheapest advantage available in this niche.
export const ComparisonTableBlockSchema = z
  .object({
    type: z.literal('comparison_table'),
    caption: OptionalText(200),
    /** Column headers. First column is the row label, e.g. "Property". */
    columns: z.array(NonEmpty(80)).min(2).max(8),
    rows: z
      .array(
        z.object({
          cells: z.array(z.string().trim().max(200)).min(2).max(8),
          /** Visually emphasises a row — the recommended option, typically. */
          highlight: z.boolean().optional().default(false),
        }),
      )
      .min(1)
      .max(60),
  })
  .refine(
    (block) => block.rows.every((row) => row.cells.length === block.columns.length),
    // A ragged table renders as a silently misaligned grid — the reader sees
    // a value under the wrong heading, which in a pressure-rating table is
    // worse than showing nothing.
    { message: 'every row must have exactly one cell per column', path: ['rows'] },
  )
export type ComparisonTableBlock = z.infer<typeof ComparisonTableBlockSchema>

// ── Block: standard citation ──────────────────────────────────────────────
// Structured reference to a published standard. Exists because the
// shelf-life figures circulating across this industry are misattributed to
// SAE when they originate in ARPM IP-11-1, with storage in ISO 8331/2230 and
// inspection practice in SAE J1273. Being the source that gets attribution
// right is precisely what makes a page worth citing.
export const StandardCitationBlockSchema = z.object({
  type: z.literal('standard_citation'),
  /** Designation as published, e.g. "SAE J1273" or "ISO 18752". */
  standard: NonEmpty(60),
  /** Issuing body, e.g. "SAE International", "ISO", "API", "ARPM". */
  publisher: NonEmpty(80),
  /** Full title of the document. */
  title: NonEmpty(300),
  /** Clause or section actually relied on, e.g. "§4.2" or "Table 3". */
  clause: OptionalText(60),
  /** What it says, in our words. Never a substitute for reading the standard. */
  summary: NonEmpty(1200),
  /** Link to the published standard or its purchase page. */
  url: OptionalText(800),
  /** Edition or revision year, so a reader can tell if we are behind. */
  edition: OptionalText(40),
})
export type StandardCitationBlock = z.infer<typeof StandardCitationBlockSchema>

// ── Block: FAQ ────────────────────────────────────────────────────────────
// Renders an accordion and feeds FAQPage JSON-LD from the same data, so the
// visible content and the structured data cannot disagree.
export const FaqBlockSchema = z.object({
  type: z.literal('faq_block'),
  heading: OptionalText(120),
  items: z
    .array(
      z.object({
        question: NonEmpty(300),
        answer: NonEmpty(2000),
      }),
    )
    .min(1)
    .max(20),
})
export type FaqBlock = z.infer<typeof FaqBlockSchema>

// ── Block: decision tree ──────────────────────────────────────────────────
// Branching selection logic — hose grade by pressure, thread family by seat
// angle. The format engineers screenshot, which is the format that earns links.
export const DecisionTreeBlockSchema = z.object({
  type: z.literal('decision_tree'),
  heading: NonEmpty(200),
  intro: OptionalText(600),
  branches: z
    .array(
      z.object({
        /** The test, e.g. "Working pressure above 350 bar?" */
        condition: NonEmpty(200),
        /** What that means, e.g. "Four-spiral — EN 856 4SP or 4SH." */
        outcome: NonEmpty(300),
        detail: OptionalText(600),
        /** Optional SKU to jump straight to the part. */
        sku: OptionalText(80),
      }),
    )
    .min(2)
    .max(12),
})
export type DecisionTreeBlock = z.infer<typeof DecisionTreeBlockSchema>

// ── Block: callout ────────────────────────────────────────────────────────
export const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  /** `danger` is reserved for genuine safety content — injection injury,
   *  stored energy, whip restraint. Overusing it spends its meaning. */
  tone: z.enum(['note', 'warning', 'danger']).default('note'),
  title: NonEmpty(120),
  body: NonEmpty(1200),
})
export type CalloutBlock = z.infer<typeof CalloutBlockSchema>

// ── Block: product embed ──────────────────────────────────────────────────
// Referenced by SKU rather than by product id: SKUs are stable, human-readable
// and survive a re-import, so an author can write one without a database
// lookup and a broken reference is legible in the raw JSON.
export const ProductEmbedBlockSchema = z.object({
  type: z.literal('product_embed'),
  heading: OptionalText(120),
  skus: z.array(NonEmpty(80)).min(1).max(8),
  note: OptionalText(400),
})
export type ProductEmbedBlock = z.infer<typeof ProductEmbedBlockSchema>

// ── Block: category link ──────────────────────────────────────────────────
export const CategoryLinkBlockSchema = z.object({
  type: z.literal('category_link'),
  /** Category slug — resolves to /c/[slug]. */
  slug: Slug(120),
  label: NonEmpty(120),
  blurb: OptionalText(400),
})
export type CategoryLinkBlock = z.infer<typeof CategoryLinkBlockSchema>

// ── Block: download ───────────────────────────────────────────────────────
export const DownloadBlockSchema = z.object({
  type: z.literal('download_block'),
  heading: OptionalText(120),
  items: z.array(DownloadSchema).min(1).max(10),
})
export type DownloadBlock = z.infer<typeof DownloadBlockSchema>

// ── Block: CTA ────────────────────────────────────────────────────────────
// Wraps LeadCapturePanel. Every article ends with one — an article that ranks
// and offers no path to a quote is a cost, not an asset.
export const CtaBlockSchema = z.object({
  type: z.literal('cta_block'),
  heading: NonEmpty(160),
  body: NonEmpty(600),
  quoteLabel: OptionalText(60),
  /** Overrides the default /quote destination, e.g. for a service enquiry. */
  quoteUrl: OptionalText(300),
})
export type CtaBlock = z.infer<typeof CtaBlockSchema>

// ── Block: as-of stamp ────────────────────────────────────────────────────
// Explicit freshness marker for spec and price content. Separate from
// publishedAt because a 2024 article can carry a 2026-verified chart.
export const AsOfStampBlockSchema = z.object({
  type: z.literal('as_of_stamp'),
  /** ISO date (YYYY-MM-DD) the figures on this page were last checked. */
  verifiedOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'verifiedOn must be an ISO date (YYYY-MM-DD)'),
  note: OptionalText(300),
})
export type AsOfStampBlock = z.infer<typeof AsOfStampBlockSchema>

// ── Block: prose run ──────────────────────────────────────────────────────
// A continuous run of formatted writing: paragraphs, sub-headings, lists,
// quotes, inline links and emphasis, as one HTML fragment.
//
// `paragraph` already carries HTML, but it renders inside a `<p>`, so a list
// or an h3 in that field produces invalid markup the browser silently hoists
// out of the paragraph. The block editor needs somewhere to put the shapes a
// writer actually reaches for between the structured blocks, and this is it —
// one block per uninterrupted run rather than one per paragraph, because that
// is how the editor's document is shaped.
//
// The HTML is written by the editor but NOT trusted from it: it arrives at the
// server action as an opaque string, and it is rendered with
// dangerouslySetInnerHTML. `sanitizeBlogProseHtml` in apps/web is the actual
// boundary; this schema only bounds the size.
export const ProseBlockSchema = z.object({
  type: z.literal('prose'),
  html: NonEmpty(20000),
})
export type ProseBlock = z.infer<typeof ProseBlockSchema>

// ── Discriminated union ───────────────────────────────────────────────────

export const BlogBlockSchema = z.discriminatedUnion('type', [
  // Reused from ServiceCase.
  SectionHeadBlockSchema,
  LeadBlockSchema,
  ParagraphBlockSchema,
  ProblemSolutionBlockSchema,
  FigureBlockSchema,
  PullQuoteBlockSchema,
  ApproachGridBlockSchema,
  SopBlockSchema,
  SpecTableBlockSchema,
  ResultBoxBlockSchema,
  TeamListBlockSchema,
  // Blog-specific.
  ProseBlockSchema,
  KeyTakeawaysBlockSchema,
  DirectAnswerBlockSchema,
  ComparisonTableBlockSchema,
  StandardCitationBlockSchema,
  FaqBlockSchema,
  DecisionTreeBlockSchema,
  CalloutBlockSchema,
  ProductEmbedBlockSchema,
  CategoryLinkBlockSchema,
  DownloadBlockSchema,
  CtaBlockSchema,
  AsOfStampBlockSchema,
])
export type BlogBlock = z.infer<typeof BlogBlockSchema>

export const BlogBlocksSchema = z.array(BlogBlockSchema)
export type BlogBlocks = z.infer<typeof BlogBlocksSchema>

/**
 * The AUTHORING type — what you write, before Zod applies defaults.
 *
 * `z.infer` gives the *output* type, in which every field carrying a
 * `.default()` is required: `comparison_table` rows would demand an explicit
 * `highlight: false` and every `sop_block` row an explicit `done: true`. That
 * is correct for a renderer, which is guaranteed those fields exist after
 * parsing, and wrong for a seed file, where the whole point of a default is
 * not having to write it.
 *
 * Import scripts and any future authoring UI should type their input as this;
 * everything downstream of `parseBlogBlocks` uses `BlogBlocks`.
 */
export type BlogBlocksInput = z.input<typeof BlogBlocksSchema>
export type BlogBlockInput = z.input<typeof BlogBlockSchema>

// ── Parsing ───────────────────────────────────────────────────────────────

export interface BlogBlockParseResult {
  /** Blocks that validated, in their original order. */
  blocks: BlogBlocks
  /** One entry per rejected block, for server-side logging. */
  dropped: Array<{ index: number; reason: string }>
}

/**
 * Parse a stored `bodyBlocks` array, validating each block independently.
 *
 * The ServiceCase renderer validates the whole array at once and returns null
 * on any failure, so a single malformed block blanks the entire article body —
 * the page still renders its header and chrome, giving no clue that the
 * content is missing. Per-block parsing degrades to a gap instead, and names
 * the offender in `dropped` so it shows up in logs rather than as a mystery.
 *
 * A non-array input yields no blocks rather than throwing: `bodyBlocks`
 * defaults to `[]` in the database, but a hand-edited row could hold anything.
 */
export function parseBlogBlocks(raw: unknown): BlogBlockParseResult {
  if (!Array.isArray(raw)) {
    return { blocks: [], dropped: raw == null ? [] : [{ index: 0, reason: 'not an array' }] }
  }

  const blocks: BlogBlocks = []
  const dropped: Array<{ index: number; reason: string }> = []

  raw.forEach((candidate, index) => {
    const parsed = BlogBlockSchema.safeParse(candidate)
    if (!parsed.success) {
      dropped.push({ index, reason: summariseZodError(parsed.error) })
      return
    }
    blocks.push(parsed.data)
  })

  return { blocks, dropped }
}

function summariseZodError(error: z.ZodError): string {
  const first = error.issues[0]
  if (!first) return 'invalid block'
  const path = first.path.join('.')
  return path ? `${path}: ${first.message}` : first.message
}

/**
 * Anchors for the sticky table of contents, in document order.
 * Mirrors how CaseToc derives its entries from `section_head` blocks.
 */
export function blogTocEntries(blocks: BlogBlocks): Array<{ anchor: string; title: string }> {
  return blocks
    .filter((b): b is Extract<BlogBlock, { type: 'section_head' }> => b.type === 'section_head')
    .map((b) => ({ anchor: b.anchor, title: b.title }))
}

/**
 * Every SKU referenced by a `product_embed`, de-duplicated and order-preserving.
 * The page resolves these in one query rather than one per block.
 */
export function blogReferencedSkus(blocks: BlogBlocks): string[] {
  const seen = new Set<string>()
  for (const block of blocks) {
    if (block.type !== 'product_embed') continue
    for (const sku of block.skus) if (!seen.has(sku)) seen.add(sku)
  }
  return [...seen]
}

/**
 * Every catalogue category slug referenced by a `category_link`, de-duplicated
 * and order-preserving. Counterpart to `blogReferencedSkus` — both exist so
 * the article's outbound links can be mirrored into relation rows, which is
 * what lets a category or product page ask the reverse question.
 */
export function blogReferencedCategorySlugs(blocks: BlogBlocks): string[] {
  const seen = new Set<string>()
  for (const block of blocks) {
    if (block.type !== 'category_link') continue
    if (!seen.has(block.slug)) seen.add(block.slug)
  }
  return [...seen]
}

/**
 * Q&A pairs across every `faq_block`, for FAQPage JSON-LD. Reading them back
 * out of the blocks — rather than storing them a second time — is what keeps
 * the structured data and the visible accordion from drifting apart.
 */
export function blogFaqPairs(blocks: BlogBlocks): Array<{ question: string; answer: string }> {
  return blocks.flatMap((block) => (block.type === 'faq_block' ? block.items : []))
}

/**
 * Reading time from block text. Counts the words a reader actually sees —
 * prose, headings, table cells, answers — and ignores anchors, SKUs and block
 * discriminators, which would otherwise inflate the estimate on a spec-heavy
 * article that is genuinely quick to skim.
 */
export function estimateReadingMinutes(blocks: BlogBlocks): number {
  const WORDS_PER_MINUTE = 220
  let words = 0

  const count = (text: string | null | undefined) => {
    if (!text) return
    words += text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'lead':
      case 'paragraph':
      case 'prose':
        count(block.html)
        break
      case 'section_head':
        count(block.title)
        break
      case 'key_takeaways':
        block.items.forEach(count)
        break
      case 'direct_answer':
        count(block.question)
        count(block.answer)
        break
      case 'faq_block':
        block.items.forEach((i) => {
          count(i.question)
          count(i.answer)
        })
        break
      case 'standard_citation':
        count(block.summary)
        break
      case 'callout':
        count(block.title)
        count(block.body)
        break
      case 'comparison_table':
        block.rows.forEach((r) => r.cells.forEach(count))
        break
      case 'decision_tree':
        block.branches.forEach((b) => {
          count(b.condition)
          count(b.outcome)
          count(b.detail)
        })
        break
      case 'problem_solution':
        count(block.problem.body)
        count(block.solution.body)
        break
      case 'pull_quote':
        count(block.quote)
        break
      default:
        break
    }
  }

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
