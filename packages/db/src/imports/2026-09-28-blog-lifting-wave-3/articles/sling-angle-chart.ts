import type { BlogArticleSeed } from '../shared'

/**
 * Sling angles — the load in each leg, and how rating tables account for it.
 *
 * The geometry is exact (tension = share of load ÷ cos of the angle from
 * vertical). The rating factors are not asserted from memory: they are read
 * back out of our own EN 13414 wire rope sling tables on 2026-09-28, where the
 * 12 mm two-leg and four-leg ratings are exactly 1.4 / 1.0 and 2.1 / 1.5 times
 * the single-leg rating. The hitch figures are the 10 mm Flemish-eye sling.
 *
 * Standard-level statements were checked on 2026-09-28 against the texts of
 * EN 13414-1/-2, EN 818-4 and EN 1492-1/-2: mode factors 1.4 / 1.0 / 2.1 / 1.5,
 * choke 0.8, one leg of a four-leg sling treated as redundant, no use beyond
 * 60° from vertical.
 */

const DIAGRAM = `<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
<title>Load in each leg of a two-leg sling at three angles</title>
<g stroke="#1f2937" fill="none">
<circle cx="110" cy="32" r="7" stroke-width="2"/>
<line x1="110" y1="40" x2="35" y2="170" stroke-width="3"/>
<line x1="110" y1="40" x2="185" y2="170" stroke-width="3"/>
<line x1="110" y1="40" x2="110" y2="170" stroke="#9ca3af" stroke-dasharray="4 4"/>
<rect x="25" y="170" width="170" height="36" fill="#e5e7eb"/>
<circle cx="340" cy="32" r="7" stroke-width="2"/>
<line x1="340" y1="40" x2="234" y2="146" stroke-width="3"/>
<line x1="340" y1="40" x2="446" y2="146" stroke-width="3"/>
<line x1="340" y1="40" x2="340" y2="146" stroke="#9ca3af" stroke-dasharray="4 4"/>
<rect x="224" y="146" width="232" height="36" fill="#e5e7eb"/>
<circle cx="600" cy="32" r="7" stroke-width="2"/>
<line x1="600" y1="40" x2="470" y2="115" stroke-width="3"/>
<line x1="600" y1="40" x2="730" y2="115" stroke-width="3"/>
<line x1="600" y1="40" x2="600" y2="115" stroke="#9ca3af" stroke-dasharray="4 4"/>
<rect x="460" y="115" width="280" height="36" fill="#e5e7eb"/>
</g>
<g fill="#1f2937" text-anchor="middle">
<text x="110" y="193" font-size="13">Load 10 t</text>
<text x="340" y="169" font-size="13">Load 10 t</text>
<text x="600" y="138" font-size="13">Load 10 t</text>
<text x="110" y="256" font-size="15" font-weight="600">30° from vertical</text>
<text x="340" y="256" font-size="15" font-weight="600">45° from vertical</text>
<text x="600" y="256" font-size="15" font-weight="600">60° from vertical</text>
<text x="110" y="278" font-size="13" fill="#4b5563">60° between legs</text>
<text x="340" y="278" font-size="13" fill="#4b5563">90° between legs</text>
<text x="600" y="278" font-size="13" fill="#4b5563">120° between legs</text>
<text x="110" y="304" font-size="15" font-weight="700" fill="#b91c1c">5.8 t in each leg</text>
<text x="340" y="304" font-size="15" font-weight="700" fill="#b91c1c">7.1 t in each leg</text>
<text x="600" y="304" font-size="15" font-weight="700" fill="#b91c1c">10 t in each leg</text>
</g>
</svg>`

const ARTICLE: BlogArticleSeed = {
  slug: 'sling-angle-chart',
  title: 'Sling angle chart: how the angle changes the load in each leg',
  excerpt:
    'Two sling legs do not each carry half the load unless they hang straight down. At 45° from vertical each leg carries 71% of the load; at 60° each carries all of it. Here is the chart, the one-line formula behind it, and how rating tables for multi-leg slings build it in.',
  categorySlug: 'rigging-capacity-charts',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Sling angle chart: load per leg at 30°, 45° and 60°',
  seoDescription:
    'How sling angle increases the load in each leg, with a sling angle factor chart, the formula, multi-leg sling rating factors, and a quick way to measure the angle on site.',
  focusKeyword: 'sling angle chart',
  publishedAt: '2026-09-28T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The tension in each sling leg is its share of the load divided by the cosine of the leg’s angle from vertical.',
        'At 45° from vertical (90° between two legs) each leg carries 71% of the load. At 60° from vertical (120° between legs) each leg carries 100% of it.',
        'Angles are quoted two ways — from vertical in European standards, from horizontal in many US charts. Confusing the two is the most common sling-angle error.',
        'Multi-leg sling ratings build the angle in: our tables rate a two-leg sling at 1.4 times the single leg up to 45° from vertical, and 1.0 times from 45° to 60°. Beyond 60° is not rated.',
        'On site, divide the leg length by the vertical height from hook to load. That ratio is the factor.',
      ],
    },
    {
      type: 'lead',
      html: 'Pick up a 10-tonne load with two slings hanging straight down and each carries 5 tonnes. Spread the same two slings to a wide angle and each can end up carrying the full 10. Nothing about the load changed; only the geometry did. That is why every sling rating table has an angle in it.',
    },

    { type: 'section_head', number: '/01', title: 'The formula.', anchor: 'the-formula' },
    {
      type: 'paragraph',
      html: 'A sling leg at an angle has to pull sideways as well as up, and only the upward part of its tension holds the load. So the tension rises as the angle opens: <strong>tension in each leg = (load ÷ number of legs) ÷ cos(angle from vertical)</strong>. The multiplier 1 ÷ cos(angle) is the sling angle factor.',
    },
    {
      type: 'diagram',
      svg: DIAGRAM,
      captionPrefix: 'FIG. 01',
      caption: 'The same 10 t load on a two-leg sling at three angles. Only the geometry changes, but the load in each leg nearly doubles.',
      alt: 'Three two-leg slings lifting the same 10 tonne load. At 30 degrees from vertical, with 60 degrees between the legs, each leg carries 5.8 tonnes. At 45 degrees from vertical, 90 degrees between legs, each carries 7.1 tonnes. At 60 degrees from vertical, 120 degrees between legs, each carries 10 tonnes.',
    },
    {
      type: 'comparison_table',
      caption: 'Sling angle factor, and the load in each leg of a two-leg sling lifting 10 t',
      columns: ['From vertical', 'From horizontal', 'Between legs', 'Factor', 'Each leg'],
      rows: [
        { cells: ['0°', '90°', '0°', '1.000', '5.0 t'] },
        { cells: ['15°', '75°', '30°', '1.035', '5.2 t'] },
        { cells: ['30°', '60°', '60°', '1.155', '5.8 t'] },
        { cells: ['45°', '45°', '90°', '1.414', '7.1 t'], highlight: true },
        { cells: ['60°', '30°', '120°', '2.000', '10.0 t'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check which angle a chart means.',
      body: 'European standards and our tables measure the angle from vertical. Many US charts measure it from horizontal, so their “60°” is our 30°. Read a horizontal-angle chart as if it were vertical and a leg at 30° from horizontal — which carries the full load — looks like a comfortable 30°.',
    },
    {
      type: 'direct_answer',
      question: 'How does sling angle affect the load in each leg?',
      answer:
        'Each leg’s tension is its share of the load divided by the cosine of its angle from vertical. For a two-leg sling that is 58% of the load per leg at 30°, 71% at 45° and 100% at 60° from vertical. Above 60° the tension climbs steeply, which is why multi-leg slings are not rated beyond it.',
    },

    { type: 'section_head', number: '/02', title: 'How rating tables build it in.', anchor: 'rating-tables' },
    {
      type: 'paragraph',
      html: 'Multi-leg slings are not rated by working the formula each time. They carry a WLL for an <strong>angle band</strong>, set by multiplying the single-leg rating by a fixed factor. Our EN 13414 wire rope sling tables show the factors exactly:',
    },
    {
      type: 'comparison_table',
      caption: '12 mm wire rope slings from our tables, by angle band',
      columns: ['Sling', '0° to 45° from vertical', '45° to 60° from vertical'],
      rows: [
        { cells: ['Single leg', '11.8 kN', '—'] },
        { cells: ['Two-leg', '16.5 kN (1.4 ×)', '11.8 kN (1.0 ×)'] },
        { cells: ['Four-leg', '24.8 kN (2.1 ×)', '17.7 kN (1.5 ×)'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'The two-leg factors are the formula at the top of each band: two legs at 45° give 2 × cos 45° = 1.41, and at 60° give 2 × cos 60° = 1.0. The four-leg factors are the same arithmetic for <strong>three</strong> legs, not four: 3 × cos 45° = 2.12, and 3 × cos 60° = 1.5.',
    },
    {
      type: 'paragraph',
      html: 'That is deliberate. On a rigid load, four legs almost never share the load equally — slight differences in leg length or lifting-point height let two or three legs take it while the others go slack. EN 13414-1 rates a four-leg sling on the assumption that one leg is redundant, and its user guidance, EN 13414-2, warns that on a rigid load two legs may end up carrying most of the weight. The same factors apply to Grade 8 chain slings under EN 818-4 and to polyester slings under EN 1492.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'No rating beyond 60° from vertical.',
      body: 'Above 60° from vertical — more than 120° between two legs — each leg carries more than the whole load, and the tension rises steeply with every extra degree. Multi-leg sling tables stop there. If the geometry needs a wider angle, use longer legs or a spreader beam.',
    },

    { type: 'section_head', number: '/03', title: 'Hitches change the rating too.', anchor: 'hitches' },
    {
      type: 'paragraph',
      html: 'The way a single sling goes around the load has its own factor. Our 10 mm Flemish-eye wire rope sling is rated:',
    },
    {
      type: 'comparison_table',
      caption: '10 mm Flemish-eye wire rope sling, by hitch, from our table',
      columns: ['Hitch', 'WLL', 'Against vertical'],
      rows: [
        { cells: ['Vertical', '1.2 t', '1.0 ×'] },
        { cells: ['Choke', '0.9 t', '0.75 ×'] },
        { cells: ['Basket, legs vertical', '2.4 t', '2.0 ×'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'A basket hitch doubles the rating only while both legs hang vertically. Once the legs spread, the angle factor applies to the basket just as it does to two separate legs. A choke loses capacity where the sling bends sharply through its own eye. The European standards set the choked rating at 80% of vertical; this sling’s table is more conservative at 75%, and the lower figure is the one that applies to it. Either way, the rating assumes the choke is allowed to draw up naturally rather than being forced down against the load.',
    },

    { type: 'section_head', number: '/04', title: 'Measuring the angle on site.', anchor: 'measuring' },
    {
      type: 'paragraph',
      html: 'Nobody carries a protractor to a lift. There is an easier way: measure the <strong>length of a leg (L)</strong> from the hook to the lifting point, and the <strong>vertical height (H)</strong> from the hook down to the level of the lifting points. The sling angle factor is simply <strong>L ÷ H</strong>.',
    },
    {
      type: 'paragraph',
      html: 'A 4 m leg with the hook 3 m above the lifting points gives 4 ÷ 3 = 1.33. On a 10 t two-leg lift, each leg carries 5 t × 1.33 = 6.7 t. And if H is less than half of L, the leg is past 60° from vertical and outside every rating table.',
    },
    {
      type: 'paragraph',
      html: 'For planning, a useful rule of thumb: make each leg at least as long as the distance between the lifting points. That keeps two legs at 60° or less between them, which is 30° from vertical and a factor of 1.155.',
    },

    { type: 'section_head', number: '/05', title: 'The force that pulls inward.', anchor: 'inward-force' },
    {
      type: 'paragraph',
      html: 'An angled leg also pulls sideways, toward the centre of the load. Each leg’s horizontal pull is its tension × sin(angle from vertical). On our 10 t two-leg example, each leg pulls inward with about 2.9 t at 30°, 5.0 t at 45° and 8.7 t at 60°.',
    },
    {
      type: 'paragraph',
      html: 'That pull squeezes the load, which matters for anything that can buckle or crush, and it puts a side load on the lifting points. A plain eye bolt or a dee shackle loaded that way carries far less than its rating — see our <a href="/blog/types-of-shackles">guide to shackle types</a> for the side-load reductions. Spreader beams exist to take this force out of the load.',
    },
    {
      type: 'decision_tree',
      heading: 'Before the lift',
      intro: 'Four checks on a multi-leg lift.',
      branches: [
        { condition: 'Which convention is the chart using?', outcome: 'Confirm it measures the angle from vertical before reading a WLL off it.' },
        { condition: 'What is L ÷ H on the longest leg?', outcome: 'Up to 1.41 is the 45° band; up to 2.0 is the 45°–60° band; above 2.0 is not rated.' },
        { condition: 'Is the load rigid with four lifting points?', outcome: 'Rate the sling on three legs, or two if the legs cannot be equalised.' },
        { condition: 'Are the lifting points rated for the side pull?', outcome: 'Use bow shackles or swivel lifting points, and derate eye bolts for angled loads.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Slings in the tables above',
      skus: ['IH-LR-SL-SLWRSEF', 'IH-LR-SL-TWRS', 'IH-LR-SL-FWRS', 'IH-LR-SL-FEWRS', 'IH-LR-SY-PRSEE', 'IH-LR-SY-PFWSEE'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the maximum sling angle?',
          answer:
            '60° from vertical, which is 120° between two legs. Multi-leg sling ratings stop there, because each leg is already carrying the full load and the tension rises steeply beyond it.',
        },
        {
          question: 'Why is a four-leg sling not rated at four times one leg?',
          answer:
            'Because four legs rarely share a rigid load equally. The rating assumes only three legs carry it: 2.1 times the single leg up to 45° from vertical, and 1.5 times from 45° to 60°.',
        },
        {
          question: 'Is a 60° sling angle measured from vertical or horizontal?',
          answer:
            'It depends on the chart, and that is the trap. European standards and our tables measure from vertical. Many US charts measure from horizontal, where 60° is a comfortable angle; 60° from vertical is the limit. Always check.',
        },
        {
          question: 'How do I work out the sling angle factor without measuring the angle?',
          answer:
            'Divide the leg length by the vertical height from the hook to the lifting points. A 4 m leg with a 3 m height gives 1.33, so each leg carries 1.33 times its share of the load.',
        },
        {
          question: 'Does sling angle matter for a basket hitch?',
          answer:
            'Yes. A basket hitch doubles the vertical rating only when both legs hang straight. As the legs spread, apply the same angle factor as for two separate legs.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-slings',
      label: 'Wire rope slings',
      blurb: 'Single, two-leg and four-leg slings with ratings by angle band.',
    },
    {
      type: 'category_link',
      slug: 'synthetic-slings',
      label: 'Synthetic slings',
      blurb: 'Polyester web and round slings, colour-coded by WLL.',
    },
    {
      type: 'category_link',
      slug: 'master-links-rings-swivels',
      label: 'Master links, rings and swivels',
      blurb: 'The top fittings that gather multi-leg slings onto the hook.',
    },
    {
      type: 'related_articles',
      slugs: ['working-load-limit-vs-breaking-strength', 'eye-bolt-types-and-angled-loads', 'sling-colour-code-chart', 'types-of-shackles', 'chain-grades-explained', 'wire-rope-clips-installation'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'Angle factors are exact geometry. Sling ratings are from the size tables on the linked product pages; the certificate for a specific sling governs.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a multi-leg lift?',
      body: 'Send the load weight, the lifting-point layout and the headroom. We will size the legs and top fitting to keep the angle inside the rated band, and quote with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
