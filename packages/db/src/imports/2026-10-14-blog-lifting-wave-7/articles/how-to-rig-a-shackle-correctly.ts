import type { BlogArticleSeed } from '../shared'

/**
 * Rigging practice for shackles: pin orientation, side loading, multi-leg slings, running lines.
 * Checked 2026-10-14: Crosby Applications & Warnings 2023 (pp. 362–365) and 2025 — side-load
 * table for screw/bolt shackles 3/16"–3", 120° two-leg rule, round-pin restrictions; Gunnebo
 * 0/45/90 table; LEEA code of practice on bolts and running lines. Each maker's table is quoted
 * separately and stated to apply to that maker's products. Never merged.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-rig-a-shackle-correctly',
  title: 'How to rig a shackle correctly: pin orientation, side loading and multi-leg slings',
  excerpt:
    'A shackle is only as strong as the way it is rigged. Load it in line and it carries its full rating; side load it and the rating can halve; gather slings on the pin or let a running line turn the screw and it can fail at a fraction of its WLL. The rules makers publish for pin orientation, side loading, two-leg slings and running lines — in one place.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Rig a Shackle: Pin Orientation, Side Loads, Slings',
  seoDescription:
    'How to rig a shackle correctly: which way the pin goes, maker side-load reduction tables, two-leg slings up to 120°, centring the load in the bow, running lines, mousing screw pins and why a bolt never replaces a pin.',
  focusKeyword: 'how to rig a shackle',
  publishedAt: '2026-10-14T08:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The pin goes on the fixed point — the hook or lifting lug — and the slings go in the bow.',
        'In-line loads use the full WLL; side loads need the maker’s reduction — down to 50% at 90° in published tables.',
        'Round-pin shackles must never be side loaded or used to gather sling legs.',
        'A two-leg sling in an anchor shackle can use full WLL up to a 120° included angle (in one maker’s published rules) — never wider.',
        'Never let a running line turn a screw pin, and never replace a pin with a bolt.',
      ],
    },
    {
      type: 'lead',
      html: 'Most shackle failures are not material failures. They are rigging failures: a shackle loaded across its body, a screw pin unwound by a sling sliding over it, a bolt pushed through where the pin was lost. The rules that prevent them are short, and every major maker publishes them. This article brings them together. Where it quotes a maker’s figures, they are that maker’s, for its own shackles — for any other shackle, use its maker’s instructions.',
    },

    { type: 'section_head', number: '/01', title: 'Which way the pin goes.', anchor: 'orientation' },
    {
      type: 'prose',
      html: '<ul><li><strong>Pin on the fixed point.</strong> Put the pin through the hook, eye or lifting lug that does not move, and the slings in the bow.</li><li><strong>Centre the load in the bow.</strong> A load pulled to one side of the bow side-loads the shackle; spacers can keep it central.</li><li><strong>Nothing running over the pin.</strong> A sling or rope that moves across a screw pin can turn it and unscrew it.</li><li><strong>Full engagement.</strong> Screw pins seated and tightened before every lift; bolt-type pins with nut and cotter fitted.</li></ul>',
    },
    {
      type: 'direct_answer',
      question: 'Which way should a shackle pin face?',
      answer:
        'Put the pin on the fixed point — the crane hook or lifting lug — and the sling legs in the bow, with the load centred. Never let a sling or running line bear on and slide over the pin, because it can turn a screw pin loose.',
    },

    { type: 'section_head', number: '/02', title: 'Side loading.', anchor: 'side-loading' },
    {
      type: 'paragraph',
      html: 'A shackle is designed to be pulled in line with its body. Pull it at an angle across the body and the working load limit falls. Makers publish their own reduction tables, and they differ — use the one for the shackle you have. Crosby’s current table for its screw-pin and bolt-type shackles, 3/16" to 3", is:',
    },
    {
      type: 'comparison_table',
      caption: 'Side-load reduction — Crosby screw pin and bolt type shackles 3/16"–3" (maker’s published table; applies to Crosby products only)',
      columns: ['Angle from in-line', 'Adjusted WLL'],
      rows: [
        { cells: ['0–10°', '100%'] },
        { cells: ['11–20°', '85%'] },
        { cells: ['21–30°', '75%'] },
        { cells: ['31–45°', '70%'] },
        { cells: ['46–55°', '60%'] },
        { cells: ['56–70°', '55%'] },
        { cells: ['71–90°', '50%'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Another maker, Gunnebo Industries, publishes 100% at 0°, 70% at 45° and 50% at 90° for its shackles and advises avoiding side loads altogether. For larger shackles the allowances tighten: Crosby allows only small angles on shackles above 3" and asks for its engineers to be consulted on side loads above 5° for its largest sizes. Round-pin shackles — G-213 and G-215 patterns — must not be side loaded at all.',
    },

    { type: 'section_head', number: '/03', title: 'Two-leg slings and the 120° rule.', anchor: 'multi-leg' },
    {
      type: 'paragraph',
      html: 'Gathering two sling legs in the bow of an anchor shackle is normal practice, and Crosby rates its screw-pin and bolt-type shackles at their full WLL for a symmetrical two-leg sling up to a 120° included angle — never more — with the load in the plane of the bow; for its shackles above 125 t the limit is 90°. The legs go in the bow, not on the pin, and the sling’s own capacity still falls with angle — see the <a href="/blog/sling-angle-chart">sling angle chart</a>. Round-pin shackles must never be used to gather sling legs.',
    },

    { type: 'section_head', number: '/04', title: 'Running lines, mousing and pins.', anchor: 'pins' },
    {
      type: 'prose',
      html: '<ul><li><strong>Running lines.</strong> Where a rope runs through or over the shackle, the pin must not bear on the moving line; use a bolt-type shackle where rotation is possible.</li><li><strong>Long-term rigging.</strong> Use a bolt-type shackle, or secure (mouse) a screw pin with wire against rotation.</li><li><strong>Lost pin?</strong> Replace it only with the maker’s pin for that size and grade. The UK lifting association’s code of practice warns never to replace a pin with an ordinary bolt, which will bend under load.</li><li><strong>Choker hitches.</strong> Do not let the live part of a choker run over a screw pin.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never weld, heat or grind a shackle.',
      body: 'Heat and welding change the steel’s properties; ground or worn sections lose rating. A shackle with heat damage, weld spatter or more than 10% wear at any point comes out of service — see lifting gear rejection criteria.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much does side loading reduce a shackle’s capacity?', answer: 'It depends on the maker. One major maker’s published table runs from 100% in line to 70% at 45° and 50% at 90° for its screw-pin and bolt-type shackles. Use the table for the shackle you have.' },
        { question: 'Can I put two slings on a shackle pin?', answer: 'No. Gather sling legs in the bow, with the pin on the hook or lug.' },
        { question: 'What is the maximum sling angle in a shackle?', answer: 'One major maker rates its screw-pin and bolt-type shackles at full WLL for a two-leg sling up to a 120° included angle, and never more.' },
        { question: 'What is mousing a shackle?', answer: 'Securing a screw pin with wire through the pin eye and around the body so it cannot rotate loose.' },
        { question: 'Can I use a bolt instead of a shackle pin?', answer: 'No. Use only the maker’s pin for that shackle; a hardware bolt is not rated and can bend.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Shackles for multi-leg and long-term rigging',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-SH-8ABAS', 'IH-LR-SH-WBSSSP', 'IH-LR-SH-EBOW'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Screw pin and bolt type anchor shackles for sling work.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['lynch-pins-r-clips-and-wire-lock-pins', 'g-209-vs-g-2130-vs-g-213-shackle', 'sling-angle-chart', 'shackle-buying-guide-uae', 'lifting-gear-rejection-criteria', 'types-of-shackles'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Side-load and multi-leg rules from shackle makers’ published applications and warnings (2023–2025), each applying to that maker’s products; pin replacement from the UK lifting association’s code of practice.',
    },
    {
      type: 'cta_block',
      heading: 'Kitting out a rigging loft?',
      body: 'Send the sizes and patterns you need, including bolt-type shackles for long-term rigging. We will quote from stock with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
