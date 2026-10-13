/**
 * Applies an in-text link list to article seeds before they are imported.
 *
 * The content waves from 2026-10-06 keep their link lists beside the seeds
 * rather than inside the copy; this is the one function that merges the two,
 * so every wave applies links the same way the live-article runner does —
 * whole words only, never in a heading or an existing link, never in the
 * lead's opening words. A phrase that is not found is an error, not a skip.
 */
import { db } from '../../index'
import { hrefsIn, linkPhraseInHtml } from './link-text'

import type { BlogBlocksInput } from '@indus/domain'
import type { InlineLink } from './plans'

type Seed = { slug: string; bodyBlocks: BlogBlocksInput }
type HtmlBlock = { type: string; html?: string }

const LINKABLE = new Set(['paragraph', 'prose', 'lead'])
const LEAD_MIN_OFFSET = 25

export function applyInlineLinks<T extends Seed>(
  seeds: T[],
  links: Record<string, InlineLink[]>,
): { seeds: T[]; errors: string[]; applied: number } {
  const errors: string[] = []
  let applied = 0
  const known = new Set(seeds.map((s) => s.slug))
  for (const slug of Object.keys(links)) if (!known.has(slug)) errors.push(`inline links name an unknown article: ${slug}`)

  const out = seeds.map((seed) => {
    const list = links[seed.slug]
    if (!list?.length) return seed
    const blocks = seed.bodyBlocks.map((b) => ({ ...(b as object) })) as Array<HtmlBlock & Record<string, unknown>>
    const proseHrefs = () => blocks.flatMap((b) => (LINKABLE.has(b.type) && b.html ? hrefsIn(b.html) : []))
    const seen = new Set<string>()
    for (const link of list) {
      if (seen.has(link.href)) errors.push(`${seed.slug}: ${link.href} is listed twice`)
      seen.add(link.href)
      if (proseHrefs().includes(link.href)) continue
      let done = false
      for (const b of blocks) {
        if (done || !LINKABLE.has(b.type) || !b.html) continue
        const r = linkPhraseInHtml(b.html, link.phrase, link.href, {
          minOffset: b.type === 'lead' ? LEAD_MIN_OFFSET : 0,
        })
        if (r.linked) {
          b.html = r.html
          done = true
        }
      }
      if (done) applied++
      else errors.push(`${seed.slug}: phrase not found as a whole word in prose: "${link.phrase}"`)
    }
    return { ...seed, bodyBlocks: blocks as unknown as BlogBlocksInput }
  })
  return { seeds: out, errors, applied }
}

/** Every /p/ and /c/ href in the seeds' prose that does not resolve to a live, indexable page. */
export async function unresolvedCatalogueHrefs(seeds: Seed[]): Promise<string[]> {
  const hrefs = new Set<string>()
  for (const s of seeds) {
    for (const b of s.bodyBlocks as HtmlBlock[]) {
      if (LINKABLE.has(b.type) && b.html) for (const h of hrefsIn(b.html)) hrefs.add(h)
    }
  }
  const products = [...hrefs].filter((h) => h.startsWith('/p/')).map((h) => h.slice(3))
  const categories = [...hrefs].filter((h) => h.startsWith('/c/')).map((h) => h.slice(3))
  const [liveP, liveC] = await Promise.all([
    db.product.findMany({ where: { slug: { in: products }, status: 'active', robotsIndex: true }, select: { slug: true } }),
    db.category.findMany({ where: { slug: { in: categories }, isPublished: true }, select: { slug: true } }),
  ])
  const okP = new Set(liveP.map((x) => x.slug))
  const okC = new Set(liveC.map((x) => x.slug))
  return [
    ...products.filter((s) => !okP.has(s)).map((s) => `/p/${s}`),
    ...categories.filter((s) => !okC.has(s)).map((s) => `/c/${s}`),
  ]
}

/** Every /blog/ href in the seeds' prose that names neither a live article nor one in this batch. */
export async function unresolvedArticleHrefs(seeds: Seed[]): Promise<string[]> {
  const slugs = new Set<string>()
  for (const s of seeds) {
    for (const b of s.bodyBlocks as HtmlBlock[]) {
      if (LINKABLE.has(b.type) && b.html) {
        for (const h of hrefsIn(b.html)) if (h.startsWith('/blog/')) slugs.add(h.slice(6))
      }
    }
  }
  const batch = new Set(seeds.map((s) => s.slug))
  const live = await db.blogPost.findMany({
    where: { slug: { in: [...slugs] }, isPublished: true, deletedAt: null },
    select: { slug: true },
  })
  const ok = new Set([...live.map((x) => x.slug), ...batch])
  return [...slugs].filter((s) => !ok.has(s)).map((s) => `/blog/${s}`)
}
