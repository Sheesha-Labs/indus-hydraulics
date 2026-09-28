import type { BlogBlocksInput } from '@indus/domain'

/**
 * The sixteenth blog category, and the first outside fluid power.
 *
 * The Lifting & Rigging vertical went live on 2026-09-25 with 744 product
 * families and no editorial content pointing at any of them. Folding these
 * articles into `specification-standards` would bury them in a hub about hose
 * and threads; a hub of their own is what accumulates internal links for the
 * lifting cluster.
 *
 * `isPublished` is set by the runner from the articles' state, for the reason
 * given in the physical-ai category: a hub is publishable when it has
 * something in it.
 */
export const LIFTING_CATEGORY = {
  slug: 'lifting-rigging',
  name: 'Lifting & rigging',
  description:
    'How lifting gear is rated, specified and inspected: shackles, chain, slings, hooks and the numbers stamped on them.',
  heroCopy:
    'Lifting gear carries a number that matters more than any other on the part — the working load limit — and most of what goes wrong on a lift comes from reading it wrongly. These guides explain the ratings, the shapes and the inspection criteria, using the figures from our own published tables.',
  position: 16,
  seoTitle: 'Lifting & rigging guides — ratings, selection and inspection',
  seoDescription:
    'Guides to lifting and rigging hardware: working load limits, design factors, shackle and chain selection, and when to take a part out of service.',
  focusKeyword: 'lifting and rigging guide',
  bodyBlocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'These guides do not replace a lift plan.',
      body: 'They explain how ratings and hardware work. The rating that governs a lift is the one on the tag and certificate of the item in your hand, applied by a competent person under your site’s lifting procedure.',
    },
  ] satisfies BlogBlocksInput,
}
