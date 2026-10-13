import type { BlogBlocksInput } from '@indus/domain'

/**
 * The seventeenth blog category: capacity and size charts for rigging gear.
 *
 * Chart posts answer a different question from the lifting-rigging guides —
 * "what does a 13 mm sling carry", not "how does a sling work" — and they are
 * searched for as charts. A hub of their own lets them link to each other and
 * keeps the guides hub readable. The two charts written in earlier waves
 * (sling angle, sling colour code) move here in the same runner.
 *
 * `isPublished` is set by the runner, as in the lifting-rigging category.
 */
export const CHARTS_CATEGORY = {
  slug: 'rigging-capacity-charts',
  name: 'Rigging capacity charts',
  description:
    'Capacity, size and breaking-strength charts for slings, shackles, eye bolts and wire rope, built from our own published tables.',
  heroCopy:
    'Every figure in these charts is read from the size tables on our product pages, for the specific products named — not copied from a generic chart. Find the item and size, read across to the way you will rig it, and then check the figure against the tag or certificate on the part in your hand.',
  position: 17,
  seoTitle: 'Rigging capacity charts — slings, shackles, eye bolts and wire rope',
  seoDescription:
    'Lifting and rigging capacity charts: chain, wire rope and polyester sling WLL by hitch and angle, shackle and eye bolt sizes and ratings, and wire rope breaking strength.',
  focusKeyword: 'rigging capacity chart',
  bodyBlocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'A chart is not a rating.',
      body: 'The rating that governs a lift is the one marked on the item and its certificate, applied under your site’s lifting procedure. Use these charts to choose and check gear, never to rate a sling or fitting that has lost its tag or marking.',
    },
    {
      type: 'prose',
      html: '<p>How the charts are read:</p><ul><li><strong>Angles</strong> are measured from the vertical, as in the European standards. 45° from vertical is 90° between two legs.</li><li><strong>Converted units</strong> (kN to tonnes, pounds to kilograms) are rounded down, so a conversion never overstates a rating.</li><li><strong>How each rating works</strong> — design factors, hitches, inspection — is explained in the <a href="/blog/c/lifting-rigging">lifting and rigging guides</a>.</li></ul>',
    },
  ] satisfies BlogBlocksInput,
}
