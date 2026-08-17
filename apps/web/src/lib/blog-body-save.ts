import type { BlogBlockInput, BlogBlocks } from '@indus/domain'
import { parseBlogBlocks } from '@indus/domain'
import { sanitizeBlogProseHtml } from './blog-prose-html'

/**
 * The two pure steps between "the editor submitted a body" and "the row is
 * written". They live outside the server action because a `'use server'`
 * module may export nothing but async functions, and because getting either
 * one wrong silently rewrites an author's article rather than failing.
 */

/**
 * Validate and sanitise the block array submitted by the editor.
 *
 * The payload is opaque at this point — the editor's node set constrains what
 * an author can produce in the browser, not what reaches the server — so every
 * block is re-validated and every HTML field re-sanitised.
 *
 * Invalid blocks are dropped rather than rejecting the whole save. Someone who
 * has just written 900 words should not lose them to one malformed block, and
 * a block that fails validation here is one `parseBlogBlocks` would drop on the
 * way out to the article anyway.
 */
export function readBodyBlocks(raw: unknown): BlogBlocks {
  if (typeof raw !== 'string' || !raw.trim()) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  const { blocks } = parseBlogBlocks(parsed)
  return blocks.map((block) =>
    block.type === 'prose' || block.type === 'paragraph' || block.type === 'lead'
      ? { ...block, html: sanitizeBlogProseHtml(block.html) }
      : block,
  )
}

/**
 * Plain text of the article, for the legacy `body` column.
 *
 * `body` is NOT NULL, feeds the `search_tsv` weighting, and is what the
 * storefront falls back to for posts written before the block editor. Keeping
 * the blocks' prose in it keeps search honest for block-authored articles
 * without creating a second source of truth for the rendered body — the
 * article page renders blocks whenever there are any.
 */
export function blocksToPlainText(blocks: Array<BlogBlocks[number] | BlogBlockInput>): string {
  const strip = (html: string) =>
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      // Tags become a space so `a<br>b` does not fuse into `ab`; that leaves a
      // gap before punctuation whenever a mark ends mid-sentence, which is
      // what search indexes and excerpt fallbacks would then carry.
      .replace(/\s+([,.;:!?)\]])/g, '$1')
      .trim()
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'lead':
        case 'paragraph':
        case 'prose':
          return strip(block.html)
        case 'section_head':
          return block.title
        case 'key_takeaways':
          return block.items.join(' ')
        case 'direct_answer':
          return `${block.question} ${block.answer}`
        case 'callout':
          return `${block.title} ${block.body}`
        case 'faq_block':
          return block.items.map((i) => `${i.question} ${i.answer}`).join(' ')
        case 'figure':
          return block.caption
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')
}

/**
 * The excerpt an article ships with, given what the author typed.
 *
 * A blank excerpt is not a neutral choice: the index card renders without a
 * blurb and the page goes out with no meta description at all unless the SEO
 * tab was filled in separately. Deriving one from the article's own opening is
 * strictly better than nothing, and an author who wants something sharper
 * still overrides it by typing.
 *
 * Section headings and figure captions are skipped. An article that opens with
 * a heading would otherwise take its social preview from three words of
 * navigation, and one that opens with a figure from "Fig. 01 — crimped hose
 * end", where a summary of the piece belongs.
 */
export function deriveExcerpt(
  typed: string | null | undefined,
  blocks: Array<BlogBlocks[number] | BlogBlockInput>,
  maxChars = 240,
): string | null {
  const cleaned = (typed ?? '').trim()
  if (cleaned) return cleaned.slice(0, maxChars)

  const prose = blocks.filter(
    (b) => b.type === 'lead' || b.type === 'paragraph' || b.type === 'prose',
  )
  const text = blocksToPlainText(prose).replace(/\n+/g, ' ').trim()
  if (!text) return null
  if (text.length <= maxChars) return text

  // Cut at a word boundary — a summary that stops mid-word reads as a bug on
  // the card and in the search result.
  const cut = text.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * What to write to the legacy `body` column and the reading time.
 *
 * `body` is plain text derived from the blocks, and the storefront's fallback
 * for any post written before the block editor existed. A submission with NO
 * blocks against a row that HAS a body is not an author clearing the article —
 * it is the editor having failed to load one, or a legacy row saved before its
 * content was migrated across. Writing the derived empty string there destroys
 * the only copy of the text, and the article renders blank with nothing in the
 * logs to say why.
 *
 * So an empty submission leaves the legacy body alone. An author who genuinely
 * wants an empty article gets one as soon as the row has no legacy body left
 * to protect.
 */
export function resolveBodyWrite(input: {
  blocks: Array<BlogBlocks[number] | BlogBlockInput>
  existingBody: string | null
  existingReadingMinutes: number | null
  estimateMinutes: (blocks: BlogBlocks) => number
}): { body: string; readingMinutes: number | null; preservedLegacy: boolean } {
  const hasLegacyBody = (input.existingBody ?? '').trim().length > 0

  if (input.blocks.length === 0 && hasLegacyBody) {
    return {
      body: input.existingBody ?? '',
      readingMinutes: input.existingReadingMinutes,
      preservedLegacy: true,
    }
  }

  return {
    body: blocksToPlainText(input.blocks),
    readingMinutes:
      input.blocks.length > 0 ? input.estimateMinutes(input.blocks as BlogBlocks) : null,
    preservedLegacy: false,
  }
}
