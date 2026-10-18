import type { BlogArticleSeed } from '../shared'

/**
 * Counterfeit and non-conforming rigging hardware. Checked 2026-10-14: US DOE Jefferson Lab lesson
 * learned (2012) — suspect counterfeit shackle with forged stamps, no maker's mark (high); IMCA
 * safety flash (2005) counterfeit shackles in West Africa and Europe (medium); spreader-beam maker
 * warning on genuine parts altered to fit imitation components (medium); US offshore regulator
 * safety alert on defective shackles (exists). No brand named; no unverified "price/finish" claim
 * presented as a source finding — stated as buyer judgement.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-spot-counterfeit-rigging-hardware',
  title: 'How to spot counterfeit and non-conforming rigging hardware',
  excerpt:
    'Counterfeit shackles and hooks have turned up on job sites in Africa, Europe and the US — sometimes sold through legitimate suppliers who were themselves deceived. They look right until you read the markings closely. The red flags investigators and industry alerts have found, a receiving check that catches most fakes, and what to do when you find one.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Spot Counterfeit Shackles and Rigging Hardware',
  seoDescription:
    'How to spot counterfeit and non-conforming rigging hardware: missing or forged markings, no maker’s mark or traceability, mismatched codes, unverifiable certificates and mixed components — with a receiving check and what to do with a suspect item.',
  focusKeyword: 'counterfeit shackles',
  publishedAt: '2026-10-14T10:32:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Counterfeit and non-conforming shackles have been found on sites in several regions, including through suppliers who were themselves deceived.',
        'The strongest red flags are in the markings: no maker’s mark, forged or inconsistent stamps, no traceability code.',
        'Body and pin should carry matching identification; mixed or altered components are a warning sign.',
        'A certificate that cannot be verified with its issuer, or that does not match the item, is as bad as none.',
        'Quarantine a suspect item, keep it as evidence, report it, and check the rest of the batch.',
      ],
    },
    {
      type: 'lead',
      html: 'A counterfeit shackle looks like the real thing from a metre away: same shape, similar finish, a WLL stamp on the bow. Up close, the story changes — no maker’s mark, stamps that do not match the size, a pin from somewhere else. The consequences of missing it can be severe, because a forged rating is a rating nobody tested. Industry alerts have recorded counterfeit shackles in West African, European and US markets, and warned that even suppliers in established markets can be sold fakes. This guide sets out how to catch them.',
    },

    { type: 'section_head', number: '/01', title: 'What has been found.', anchor: 'cases' },
    {
      type: 'prose',
      html: '<ul><li>A US national laboratory found a suspect counterfeit shackle carrying a forged country-of-origin stamp and forged size and capacity marks, with <strong>no maker’s mark</strong> — which the US rigging hardware standard requires. It was tagged and removed.</li><li>An offshore industry safety flash reported counterfeit shackles in West African and European markets, warning that suppliers in Europe or the US could themselves have been sold fakes, so buyers should check where items were actually made.</li><li>A spreader-beam maker warned that genuine components had been altered to fit imitation parts — mixed assemblies are a warning sign.</li><li>Regulators have also circulated makers’ safety notices on defective shackles — a reminder that genuine products can be recalled too.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'Red flags.', anchor: 'red-flags' },
    {
      type: 'comparison_table',
      caption: 'Red flags on rigging hardware',
      columns: ['Check', 'Red flag'],
      rows: [
        { cells: ['Maker’s mark', 'Missing, misspelt, or a different style from the maker’s genuine marking'], highlight: true },
        { cells: ['Rating and size stamps', 'Missing, crude, inconsistent with the item’s size, or obviously added later'] },
        { cells: ['Traceability code', 'None, or codes that do not match between body and pin'] },
        { cells: ['Components', 'Pins, nuts or parts that do not match the body; parts altered to fit'] },
        { cells: ['Certificate', 'Cannot be verified with its issuer, or does not match the type, size or batch received'] },
        { cells: ['Source', 'Supplier cannot say where items were made, or offers documents only after delivery'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How can you tell if a shackle is counterfeit?',
      answer:
        'Check the markings first: a genuine rated shackle carries the maker’s name or mark, its WLL and its size, and usually a traceability code that matches the pin and the certificate. Missing or inconsistent marks, mismatched pins, altered parts, and certificates that cannot be verified with their issuer are the main red flags. Quarantine any suspect item.',
    },

    { type: 'section_head', number: '/03', title: 'A receiving check that catches most.', anchor: 'receiving' },
    {
      type: 'prose',
      html: '<ol><li><strong>Read every mark</strong> on body and pin, against the purchase order — see <a href="/blog/shackle-markings-explained">shackle markings explained</a>.</li><li><strong>Match to the certificate</strong>: type, size, WLL and batch or traceability code.</li><li><strong>Verify the certificate</strong> with its issuer if anything looks wrong.</li><li><strong>Compare</strong> a suspect item with a known genuine one of the same pattern: dimensions, weight, finish, pin fit.</li><li><strong>Ask the supplier</strong> where the items were made and by whom.</li><li><strong>Quarantine</strong> anything that fails, and do not let it enter the <a href="/blog/lifting-equipment-register-uae">lifting register</a>.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Found one? Keep it.',
      body: 'Do not throw a suspect item away. Tag it, quarantine it, photograph the markings, keep the certificate and delivery note, check the rest of the batch, and report it to your supplier, the maker whose name it carries and your site’s safety team.',
    },

    { type: 'section_head', number: '/04', title: 'Buying to avoid it.', anchor: 'buying' },
    {
      type: 'paragraph',
      html: 'Buy rated hardware with a stated pattern or standard, marked with maker, WLL and size, from suppliers who can show the certificate before dispatch and say where it was made. Treat prices far below the market with suspicion and ask why. Our rated items ship marked with their WLL and with the manufacturer’s test certificate under Indus part numbers; see the <a href="/blog/shackle-buying-guide-uae">shackle buying guide</a> and <a href="/blog/commercial-grade-vs-lifting-grade-shackles">commercial grade vs lifting grade</a> for the related question of genuine but lower-rated hardware.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Are counterfeit shackles common?', answer: 'They have been reported in several markets, including through established suppliers who were deceived. Every site should check markings and certificates on receipt.' },
        { question: 'What markings should a genuine shackle have?', answer: 'The maker’s name or mark, its WLL and its size, usually with a traceability code that matches the pin and certificate.' },
        { question: 'Can a certificate be faked?', answer: 'Yes. Verify it with its issuer if the item or the paperwork looks inconsistent.' },
        { question: 'What should I do with a suspect shackle?', answer: 'Quarantine and tag it, keep it as evidence, check the batch, and report it to the supplier, the named maker and your safety team.' },
        { question: 'Is a cheap shackle always counterfeit?', answer: 'No — commercial-grade shackles are genuine products with lower ratings. But a supposedly rated shackle far below market price deserves questions.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Marked, certified hardware',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-SH-8ASPAS', 'IH-LR-SH-SSA2741SP', 'IH-LR-G8-ESHL', 'IH-LR-RL-WAML'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Marked, certified shackles in every pattern.',
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
      slugs: ['shackle-markings-explained', 'commercial-grade-vs-lifting-grade-shackles', 'shackle-buying-guide-uae', 'lifting-gear-test-certificate', 'lifting-equipment-register-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Cases from a US Department of Energy laboratory lesson learned (2012), an offshore industry safety flash (2005), a spreader-beam maker’s warning and a US offshore regulator’s safety alert. Red flags drawn from those sources.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing doubtful hardware?',
      body: 'Send the items and quantities. We will quote marked, certified replacements, with certificates available before dispatch.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
