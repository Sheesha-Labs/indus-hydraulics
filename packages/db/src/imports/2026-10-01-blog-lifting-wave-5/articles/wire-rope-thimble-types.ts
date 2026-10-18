import type { BlogArticleSeed } from '../shared'

/**
 * Wire rope thimbles — standard, extra heavy, solid; the old DIN/BS names.
 *
 * Sources checked 2026-10-01: Kito Crosby catalogue — G-411 "standard choice
 * for light duty", G-414 "greater protection… longer service life"; Crosby
 * termination manual (thimbles not a primary load-carrying member, not
 * load-rated; without a thimble the shackle must be larger than the rope);
 * LEEA COPSULE 15.3.3 and 15.9.1; DIN Media (DIN 6899 withdrawn, successor
 * family EN 13411); EN 13411-9 abstract (solid thimbles, KT ≥ 0.9 ferrule-
 * secured / ≥ 0.8 spliced); BSI (BS 464 withdrawn 2002).
 * Not used, unverified: "G-414 recommended for slings" (distributor wording
 * only); what distinguishes DIN 6899 form A from form B.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wire-rope-thimble-types',
  title: 'Wire rope thimbles: standard vs extra heavy vs solid, and what the old DIN and BS numbers mean',
  excerpt:
    'A thimble keeps a wire rope eye from crushing and wearing where it bears on a shackle or pin. It is not rated to carry load itself — it protects the rope that does. Here is how standard, extra-heavy and solid thimbles differ, and how to match one to the rope and the fitting.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Wire rope thimble types: standard, extra heavy and solid thimbles',
  seoDescription:
    'Wire rope thimble types explained: standard vs extra-heavy vs solid thimbles, G-411 and G-414 patterns, DIN 6899, DIN 3091 and BS 464, sizing, and when to reject a thimble.',
  focusKeyword: 'wire rope thimble types',
  publishedAt: '2026-10-01T12:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A thimble protects a wire rope eye from abrasion, crushing and point loading where it bears on a fitting. It is not itself load-rated.',
        'Standard thimbles (the G-411 pattern) are for light-duty use. Extra-heavy thimbles (the G-414 pattern) give the eye more protection and a longer service life.',
        'Solid thimbles fill the eye completely, so the eye cannot close up under load; EN 13411-9 now covers them.',
        'Match the thimble to the rope diameter and to the pin or shackle it will bear on.',
        'Reject a sling when its thimble is distorted, worn, or has opened at the throat.',
      ],
    },
    {
      type: 'lead',
      html: 'Bend a wire rope sharply around a shackle pin and it flattens and wears at exactly the point that carries the load. A thimble gives the eye a grooved, rounded bearing surface so that does not happen. It is a small, cheap part, and the eye of a sling is only as good as the thimble in it.',
    },

    { type: 'section_head', number: '/01', title: 'What a thimble does — and does not do.', anchor: 'purpose' },
    {
      type: 'paragraph',
      html: 'A thimble protects the eye: it spreads the bearing load, keeps the eye from closing up, and takes the wear instead of the rope. It is not considered a primary load-carrying member and is not given a WLL — the rating of the termination comes from the rope and its ferrule or splice. Where an eye is used without a thimble, the shackle or pin it bears on must be larger in diameter than the rope.',
    },

    { type: 'section_head', number: '/02', title: 'The main types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Wire rope thimble types',
      columns: ['Type', 'What it is', 'Use'],
      rows: [
        { cells: ['Standard (G-411 pattern)', 'Pressed or formed thimble with an open throat', 'Light-duty loading and fixed terminations'] },
        { cells: ['Extra heavy (G-414 pattern)', 'Heavier section and deeper groove', 'More protection against wear and deformation; longer service life'], highlight: true },
        { cells: ['Solid thimble', 'Cast or forged with a solid centre and a hole for the pin', 'Eyes that must not close up; heavy connections to a pin'] },
        { cells: ['Tube thimble, with or without gusset', 'Tubular bearing for a pin', 'Fixed connections where a pin passes through the eye'] },
        { cells: ['Fibre rope thimble', 'Wider, shallower groove for fibre rope', 'Fibre and synthetic rope eyes — not wire rope'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For the eye of a lifting sling that will see repeated use, an extra-heavy thimble gives more protection against wear and deformation than a light standard one. Heart-shaped thimbles are for eyes that connect to a fitting; reeving thimbles, with a wider shape, let one eye pass through the other in a choke hitch.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a standard and an extra heavy wire rope thimble?',
      answer:
        'A standard thimble (G-411 pattern) is a lighter pressed thimble for light-duty use. An extra heavy thimble (G-414 pattern) has a heavier section that gives the rope eye more protection against wear and deformation and lasts longer. Neither is load-rated: the thimble protects the rope that carries the load.',
    },

    { type: 'section_head', number: '/03', title: 'The DIN and BS numbers.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<ul><li><strong>DIN 6899</strong> covered light, medium and heavy thimbles in forms A and B. It has been withdrawn, and the EN 13411 series on wire rope terminations has taken its place, but the name is still used to order thimbles of that pattern.</li><li><strong>DIN 3091</strong> covered solid thimbles. It has been replaced by <strong>EN 13411-9</strong>, which sets an efficiency of at least 0.9 for solid thimbles in ferrule-secured terminations and at least 0.8 in spliced ones.</li><li><strong>BS 464</strong> was the British thimble standard. It was withdrawn in 2002; galvanised BS 464-pattern thimbles are still made to its dimensions.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A withdrawn standard is still a useful name.',
      body: 'Ordering “DIN 6899 B” or “BS 464” still tells a supplier the shape and size you need. What it no longer guarantees is conformity to a current standard — for a lifting sling, rely on the sling maker’s certificate for the complete termination.',
    },

    { type: 'section_head', number: '/04', title: 'Sizing and inspection.', anchor: 'sizing-inspection' },
    {
      type: 'paragraph',
      html: 'A thimble is sized to the rope diameter: the rope must sit fully in the groove without being pinched or rattling loose. Check also that the thimble’s inside width takes the shackle pin or fitting it will bear on. A thimble that does not match the rope cannot support the eye properly.',
    },
    {
      type: 'paragraph',
      html: 'At inspection, reject the sling if the thimble is damaged or worn, distorted, has come loose in the eye, or its throat has opened noticeably.',
    },
    {
      type: 'product_embed',
      heading: 'Thimbles in this guide',
      skus: ['IH-LR-TH-US', 'IH-LR-TH-EH', 'IH-LR-TH-SWRTD3091', 'IH-LR-TH-D6899A', 'IH-LR-TH-D6899B', 'IH-LR-TH-BS464', 'IH-LR-TH-FRTK3'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Does a thimble have a working load limit?',
          answer:
            'No. A thimble is not a primary load-carrying part; it protects the rope eye. The termination’s rating comes from the rope and its ferrule, splice or socket.',
        },
        {
          question: 'Do I need a thimble in a wire rope eye?',
          answer:
            'It is strongly recommended wherever the eye bears on a shackle, pin or hook. Without one, the fitting must be larger in diameter than the rope, and the eye wears and deforms faster.',
        },
        {
          question: 'Is DIN 6899 still a current standard?',
          answer:
            'No. DIN 6899 has been withdrawn in favour of the EN 13411 series, but the name is still used to order thimbles of that pattern.',
        },
        {
          question: 'Can I use a wire rope thimble on fibre rope?',
          answer: 'Use a fibre rope thimble. Its groove is shaped for fibre rope, which a wire rope thimble would pinch.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-thimbles',
      label: 'Wire rope thimbles',
      blurb: 'Standard, extra-heavy, solid, tube and fibre rope thimbles.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-fittings',
      label: 'Wire rope fittings',
      blurb: 'Thimbles, ferrules, clips and sockets.',
    },
    {
      type: 'related_articles',
      slugs: ['wire-rope-eye-terminations', 'wire-rope-clips-installation', 'types-of-shackles', 'wire-rope-construction-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Thimble roles from published Crosby data and the LEEA Code of Practice; standard status from DIN Media, BSI and the EN 13411-9 abstract.',
    },
    {
      type: 'cta_block',
      heading: 'Need thimbles for a sling or stay?',
      body: 'Tell us the rope diameter, the fitting the eye bears on and the duty. We will quote the right thimble pattern and size.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
