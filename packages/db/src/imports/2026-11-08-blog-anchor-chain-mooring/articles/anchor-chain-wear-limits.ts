import type { BlogArticleSeed } from '../shared'
import { WEAR_LIMITS } from '../reference'

/**
 * Anchor chain wear limits. The 12% rule and its table come from a stockist's "minimum mean diameter for
 * chain cable — class society (IACS) 12%" sheet; our table is computed as 0.88 × d rather than copied,
 * because the sheet misprints 28 mm (26.64 for 24.64). The sources give no measurement method and no
 * other renewal criteria: the measuring advice and the other condemning defects below are stated as
 * general practice, with the surveyor named as the authority.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-wear-limits',
  title: 'Anchor chain wear limits: the 12% rule and when to renew a length',
  excerpt:
    'Anchor chain wears where links rub against each other and the windlass. Classification societies allow the mean diameter to fall 12% below nominal before a length must be renewed. The minimum diameter for every size from 12.5 to 162 mm, how to measure, and the other defects that condemn a length.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Wear Limits — the 12% Rule, 12.5–162 mm',
  seoDescription:
    'Anchor chain wear limits: the class society 12% diameter reduction rule, minimum mean diameter for every chain size from 12.5 to 162 mm, how to measure worn links, and when to renew a length.',
  focusKeyword: 'anchor chain wear limits',
  publishedAt: '2026-11-08T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Class societies allow the mean diameter of an anchor chain link to wear to 88% of its nominal size — a 12% reduction — before the length must be renewed.',
        'For 76 mm chain the minimum mean diameter is 66.88 mm; for 50 mm it is 44 mm.',
        'Wear concentrates where links bear on each other and on the cable lifter, so measure there, not on the straight sides.',
        'Wear is not the only reason to renew: cracks, bent or stretched links and loose or missing studs condemn a length too.',
        'Renew by the length: replace the worn 27.5 m shot and its joining shackle, ordered to the same size and grade.',
      ],
    },
    {
      type: 'lead',
      html: 'Every time the anchor is weighed, each link grinds against its neighbours and against the pockets of the cable lifter, and over years the bar wears thin where it bears. Strength falls with the square of the remaining diameter, so a little wear matters. That is why the classification societies set a limit, and why a surveyor will put calipers on your chain at every special survey.',
    },
    {
      type: 'direct_answer',
      question: 'What is the wear limit for anchor chain?',
      answer:
        'Classification societies generally require a length of anchor chain to be renewed when the mean diameter of a link has worn to 88% of the nominal diameter — a 12% reduction. For 76 mm chain the minimum is 66.88 mm, for 50 mm 44 mm, for 32 mm 28.16 mm.',
    },

    { type: 'section_head', number: '/01', title: 'Minimum mean diameter by size.', anchor: 'table' },
    {
      type: 'comparison_table',
      caption: 'Minimum mean diameter at 12% wear (mm)',
      columns: ['Nominal diameter', 'Minimum mean diameter'],
      rows: WEAR_LIMITS,
    },

    { type: 'section_head', number: '/02', title: 'Measuring a worn link.', anchor: 'measuring' },
    {
      type: 'prose',
      html: '<p>The limit is on the <strong>mean</strong> diameter, so a single reading is not enough. In general practice:</p><ul><li>Find the most worn part of the link — usually the inside of the crown, where it bears on the next link, and the areas that ride in the cable lifter pockets.</li><li>Clean off scale and growth, then take two caliper readings across the bar at right angles to each other.</li><li>Average them: that is the mean diameter to compare with the table.</li><li>Measure several links along each length, concentrating on the shots that work hardest — the ones nearest the anchor and those that sit on the windlass at anchor.</li></ul><p>The class surveyor decides how many links and where; record the readings by shot so the trend can be followed from survey to survey.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Other reasons to renew.', anchor: 'other' },
    {
      type: 'prose',
      html: '<p>A length can be condemned before it reaches the wear limit. A surveyor will look for:</p><ul><li>cracks, especially at the flash-butt weld and around the stud;</li><li>links that are bent, twisted or visibly stretched;</li><li>studs that are loose, cracked or missing;</li><li>deep pitting or gouges;</li><li>joining shackles and swivels that are worn, distorted or seized, or Kenter shackles whose taper pins and lead plugs are missing.</li></ul><p>The 5% elongation limit in a chain’s factory proof test is not an in-service limit — see <a href="/blog/anchor-chain-testing-proof-break-ndt">anchor chain testing</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Turning the cable end for end.',
      body: 'The lengths nearest the anchor wear fastest. Some owners swap the cable end for end at survey, bringing less-worn inboard shots to the working end; it extends the cable’s life but does not change the wear limit for any link.',
    },

    { type: 'section_head', number: '/04', title: 'Renewing a length.', anchor: 'renewing' },
    {
      type: 'paragraph',
      html: 'Worn chain is replaced by the 27.5 m length. Order the replacement to the same nominal diameter, grade and type, with a new <a href="/p/kenter-shackle-grades-u2-and-u3">Kenter shackle</a> or <a href="/p/joining-shackle-d-type-grades-u2-and-u3">joining shackle</a> and, where the join needs them, <a href="/p/end-link-stud-link-anchor-chain-grades-u2-and-u3">end</a> and <a href="/p/enlarged-link-stud-link-anchor-chain-grades-u2-and-u3">enlarged links</a>. The certificate for the new length goes into the ship’s file with the old ones. If a whole cable is near the limit, compare a full renewal with a higher grade at a smaller size — see <a href="/blog/equipment-number-anchor-chain-sizing">equipment number</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much wear is allowed on anchor chain?', answer: 'Generally 12% of the nominal diameter, measured as the mean diameter of the most worn part of the link.' },
        { question: 'What is the minimum diameter for 76 mm anchor chain?', answer: '66.88 mm.' },
        { question: 'Where does anchor chain wear most?', answer: 'Where links bear on each other at the crowns, and where they ride in the cable lifter, mostly in the shots nearest the anchor.' },
        { question: 'Do I have to renew the whole cable?', answer: 'No. Worn or damaged lengths are replaced individually, to the same size and grade, with new joining shackles.' },
        { question: 'Does the wear limit apply to mooring chain?', answer: 'Offshore mooring chain has its own inspection and wear criteria under its mooring integrity plan and the class rules; this page covers ship anchor chain.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Replacement lengths and joining parts',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-JSDGU2U3', 'IH-MR-AC-END', 'IH-MR-AC-ENL', 'IH-MR-AC-LPL'],
    },
    { type: 'category_link', slug: 'anchor-chain', label: 'Anchor chain', blurb: 'Stud link and studless ship anchor chain, grades U1 to U3, by the 27.5 m length.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-size-chart', 'anchor-chain-cable-arrangement', 'how-to-assemble-a-kenter-shackle', 'anchor-chain-testing-proof-break-ndt'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Minimum diameters computed from the 12% class society (IACS) rule as tabled by a chain stockist. Measurement practice and condemning defects are general guidance — the class surveyor decides.',
    },
    {
      type: 'cta_block',
      heading: 'Lengths condemned at survey?',
      body: 'Send the size, grade, number of lengths and the survey date. We will quote certified replacement lengths and joining shackles for delivery before the ship sails.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
