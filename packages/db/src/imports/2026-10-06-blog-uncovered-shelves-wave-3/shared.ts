import type { BlogBlocksInput } from '@indus/domain'

/**
 * Uncovered shelves, wave 3 — 2026-10-06.
 *
 * Articles for the published shelves that no post linked to before this wave:
 * the Molykote range, flow iron and hammer unions, ring joint gaskets, wellhead
 * equipment, the oilfield valve shelves, BOP equipment and spares, butterfly
 * and ball valves, and the marine and hardware end of the lifting vertical.
 *
 * Same constraints as waves 1 and 2 (see ../2026-10-06-blog-industrial-hose-wave-1):
 * every figure from the live listing, standards only where our listings cite
 * them and only where the citation is right, links to the deepest shelf, no
 * prices or lead times. Three more for this wave:
 *
 *   - Molykote copy names the products we supply. It never claims an authorised
 *     distribution agreement, because there is no basis for one on file.
 *   - OEM names (Demco, Hydril, Cameron, Weco) appear only as the pattern or
 *     the part number a listing cross-references, never as a claim of origin.
 *   - Lifting figures come from the live variant rows only, every lifting post
 *     that quotes a load rating says a working load limit is not a breaking
 *     load, and a part rated for general use is never presented as an overhead
 *     lifting accessory.
 */
export type BlogArticleSeed = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  authorSlug: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  publishedAt: string
  bodyBlocks: BlogBlocksInput
}

export const AUTHOR_SLUG = 'ayush-bhatia'

export const VERIFIED_ON = '2026-10-06'
