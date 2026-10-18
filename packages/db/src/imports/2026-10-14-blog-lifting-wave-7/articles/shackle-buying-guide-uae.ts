import type { BlogArticleSeed } from '../shared'

/**
 * Pillar: how contractors specify and buy shackles in the UAE and GCC. Ratings quoted only from
 * live size tables (G-209 / G-2130 / Grade 8 / commercial grade). Standards facts checked
 * 2026-10-14: RR-C-271F classes and bow marking (everyspec), ASME B30.26 scope (ASME), Abu Dhabi
 * CoP 34 and Dubai GU48 (memory: uae-lifting-inspection-rules). No customer named.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'shackle-buying-guide-uae',
  title: 'Buying shackles for a UAE or GCC project: what to put on the purchase order',
  excerpt:
    'Most shackle problems on site start at the purchase order: a size with no pattern, a pattern with no pin type, a rating nobody checked, a certificate nobody asked for. A buyer’s guide for contractors in the UAE and the Gulf — pattern, pin, grade, size, finish, certificate and delivery — and the six lines every shackle order should carry.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Shackle Buying Guide for UAE and GCC Projects',
  seoDescription:
    'How contractors in the UAE and GCC should specify shackles: pattern (G-209, G-2130, G-213), pin type, grade, size vs WLL, finish, test certificates and site inspection rules — with a ready-to-use purchase order checklist.',
  focusKeyword: 'shackle supplier uae',
  publishedAt: '2026-10-14T08:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Order shackles by pattern, pin type and working load limit — never by "size" alone.',
        'Screw pin (G-209 pattern) for rigging made and broken often; bolt type (G-2130) for long-term or where the pin could turn; round pin (G-213) only for in-line, non-rotating loads.',
        'The same nominal size carries very different ratings: a 1" G-209 pattern shackle is rated 8.5 t, a 1" commercial-grade shackle 5.5 t, a 1" Grade 8 alloy shackle 12.5 t.',
        'Ask for the test certificate with every consignment, and check that the shackle is marked with its maker, WLL and size.',
        'In Abu Dhabi and Dubai, lifting accessories are examined at 6- or 12-month intervals by approved third parties — buy shackles that will pass.',
      ],
    },
    {
      type: 'lead',
      html: 'A main contractor’s rigging loft might hold a few hundred shackles, from 1/2" pins on tag lines to 2" bow shackles under the crane hook. They arrive in mixed lots, from more than one supplier, against purchase orders that often say no more than “shackle 1 inch, 20 nos”. That order can be filled with a forged, rated, certified shackle — or with something that looks the same and carries a third less. This guide sets out what a shackle order should specify, and why.',
    },

    { type: 'section_head', number: '/01', title: 'Pattern: the shape and pin in one number.', anchor: 'pattern' },
    {
      type: 'paragraph',
      html: 'Shackles sold to the US pattern numbers share dimensions and ratings, so a pattern number tells the supplier the body shape, the pin and the rating table in one word. The common ones are the <a href="/p/screw-pin-anchor-shackle-g-209-pattern">G-209 screw-pin anchor shackle</a>, the <a href="/p/bolt-type-anchor-shackle-g-2130-pattern">G-2130 bolt-type anchor shackle</a> and the <a href="/p/round-pin-anchor-shackle-g-213-pattern">G-213 round-pin anchor shackle</a>, with their chain (dee) equivalents G-210, G-2150 and G-215. They trace to US Federal Specification RR-C-271, which classes shackles as Type IVA (anchor) or IVB (chain), Grade A or B, and Class 1 (round pin), 2 (screw pin) or 3 (bolt, nut and cotter). Our comparison of <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209, G-2130 and G-213</a> explains when each is the right choice, and <a href="/blog/crosby-pattern-numbers-explained">pattern numbers explained</a> decodes the prefixes.',
    },
    {
      type: 'direct_answer',
      question: 'How should I specify a shackle on a purchase order?',
      answer:
        'Give the pattern or standard (e.g. G-209, G-2130, AS 2741 Grade S), the body (anchor/bow or chain/dee), the pin type (screw, bolt or round), the working load limit or size, the finish (galvanised, self-coloured, stainless), the quantity, and the documents required — at minimum the manufacturer’s test certificate.',
    },

    { type: 'section_head', number: '/02', title: 'Size is not a rating.', anchor: 'rating' },
    {
      type: 'comparison_table',
      caption: 'Working load limit by nominal size, from our live size tables',
      columns: ['Size', 'Commercial grade', 'G-209 / G-2130 pattern', 'Grade 8 alloy'],
      rows: [
        { cells: ['1/2"', '1.5 t', '2 t', '3.3 t'] },
        { cells: ['5/8"', '2.25 t', '3.25 t', '5 t'] },
        { cells: ['3/4"', '3.25 t', '4.75 t', '7 t'] },
        { cells: ['7/8"', '4.25 t', '6.5 t', '9.5 t'] },
        { cells: ['1"', '5.5 t', '8.5 t', '12.5 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The nominal size is the diameter of the bow, and three shackles of the same size can carry very different loads. Specify the WLL your rigging plan needs, then let the size follow from the table of the pattern you are buying. Our <a href="/blog/shackle-size-and-capacity-chart">shackle size and capacity chart</a> lists every size; <a href="/blog/commercial-grade-vs-lifting-grade-shackles">commercial grade vs lifting grade</a> explains why the left-hand column exists and where it belongs.',
    },

    { type: 'section_head', number: '/03', title: 'Pin type.', anchor: 'pin' },
    {
      type: 'prose',
      html: '<ul><li><strong>Screw pin</strong> — quick to fit and remove, for rigging that is made and broken often. Must be fully engaged and tightened before each lift.</li><li><strong>Bolt type (safety pin)</strong> — bolt, nut and cotter pin, for long-term installations and wherever the load could slide on the pin and turn it.</li><li><strong>Round pin</strong> — a plain pin held by a cotter, for in-line loads only; makers do not allow side loading or gathering several sling legs on a round-pin shackle.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Finish and material.', anchor: 'finish' },
    {
      type: 'paragraph',
      html: 'Hot-dip galvanised carbon steel is the general-purpose standard on Gulf sites. Self-coloured (painted) shackles are common in heavy-lift and alloy ranges. Stainless shackles are chosen for corrosion — marine, food and chemical plant — not for strength, and their ratings vary by maker. Our <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless vs galvanised rigging in the Gulf</a> covers the trade-off. Grade 8 alloy shackles carry about half as much again as carbon shackles of the same size, which matters where weight and bow size are limited.',
    },

    { type: 'section_head', number: '/05', title: 'Certificates and marking.', anchor: 'certificates' },
    {
      type: 'paragraph',
      html: 'Every rated shackle should be forged or stamped with the maker’s name or mark, its working load limit and its size; RR-C-271 requires that on the bow, and ASME B30.26 sets similar marking for rigging hardware. Ask for the <strong>manufacturer’s test certificate</strong> with every consignment and check the stamp against it on receipt. Unmarked shackles come out of service at inspection. See <a href="/blog/shackle-markings-explained">shackle markings explained</a> and <a href="/blog/lifting-gear-test-certificate">what a lifting gear test certificate should show</a>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'UAE inspection intervals.',
      body: 'In Abu Dhabi, the occupational safety code of practice for lifting sets thorough examination of lifting accessories at 6-month intervals by approved third parties; in Dubai, municipal guidance requires certification at least every 12 months by an accredited third party, and accreditation rules set 6 months for accessories. Shackles enter the lifting register on arrival — see lifting equipment inspection in the UAE.',
    },

    { type: 'section_head', number: '/06', title: 'The purchase order checklist.', anchor: 'checklist' },
    {
      type: 'comparison_table',
      caption: 'Six lines for every shackle order',
      columns: ['Line', 'Example'],
      rows: [
        { cells: ['Pattern or standard', 'G-2130 pattern / AS 2741 Grade S / BS 3032 pattern'] },
        { cells: ['Body and pin', 'Anchor (bow), bolt type'] },
        { cells: ['Size and WLL', '1" — 8.5 t'], highlight: true },
        { cells: ['Finish', 'Hot-dip galvanised'] },
        { cells: ['Quantity and delivery', '20 pcs, site store, Ruwais'] },
        { cells: ['Documents', 'Manufacturer’s test certificate; third-party certificate if the site requires it'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the most common shackle on UAE construction sites?', answer: 'The galvanised screw-pin anchor shackle to the G-209 pattern, with bolt-type G-2130 pattern shackles where rigging stays in place or the pin could rotate.' },
        { question: 'Is a 1 inch shackle rated 8.5 tonnes?', answer: 'A 1" G-209 or G-2130 pattern carbon shackle is rated 8.5 t in our tables; a 1" commercial-grade shackle 5.5 t; a 1" Grade 8 alloy shackle 12.5 t. Always check the table for the pattern you buy.' },
        { question: 'Do your shackles come with certificates?', answer: 'Yes. Rated shackles ship with the manufacturer’s test certificate. If your site needs third-party certification, say so on the enquiry.' },
        { question: 'Can I mix shackles from different suppliers?', answer: 'Yes, if each is marked and certified, but never swap pins between shackles — use only the pin supplied for that shackle.' },
        { question: 'Do you deliver shackles to sites in Abu Dhabi and the Western Region?', answer: 'We ship from Dubai across the UAE and the GCC. Tell us the delivery point and required date with the enquiry.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Shackles we supply',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-SH-G213', 'IH-LR-SH-G210', 'IH-LR-SH-G2150', 'IH-LR-SH-8ASPAS', 'IH-LR-SH-SSA2741SP2', 'IH-LR-SH-WBSSSP'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: '46 shackle ranges: G-209, G-2130, G-213 patterns, Grade 8 alloy, AS 2741, BS 3032, DIN 82101 and stainless.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'oil-gas',
      label: 'Oil and gas',
      blurb: 'Certified rigging for plant and shutdown work.',
    },
    {
      type: 'related_articles',
      slugs: ['rigging-hardware-rfq-checklist', 'site-mobilisation-rigging-kit', 'g-209-vs-g-2130-vs-g-213-shackle', 'how-to-rig-a-shackle-correctly', 'shackle-markings-explained', 'how-to-spot-counterfeit-rigging-hardware'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Ratings from the live Indus shackle size tables. RR-C-271F classes and marking; ASME B30.26 scope; UAE intervals from Abu Dhabi and Dubai guidance read September 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering shackles for a site?',
      body: 'Send the pattern, pin type, sizes or WLLs, quantities and delivery point. We will quote from stock with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
