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
