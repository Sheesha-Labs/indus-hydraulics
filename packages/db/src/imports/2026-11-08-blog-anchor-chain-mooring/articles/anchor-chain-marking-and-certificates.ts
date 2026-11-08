import type { BlogArticleSeed } from '../shared'

/**
 * Chain marks and class certificates. Sources: two chain makers' certificate lists (class certificates
 * for anchor chain and accessories and for offshore mooring chain from ABS, BV, CCS, DNV, KR, LR, NK,
 * RINA, RS, IRS, CR), a maker's note that most Australian projects ask for one society's certificate, a
 * stockist's statements that all stock ships with class certificates and its anti-twist marking news
 * item, makers' traceability statements (every link's weld recorded; batch traceability), and the
 * proof/break tests "in the presence of the Surveyor". The research has no text of the class marking
 * rule: the stamped-mark paragraph is general (grade, certificate number, society's mark at both ends
 * of each length) and points to the society's rules.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-marking-and-certificates',
  title: 'Anchor chain marks and class certificates: what to check before a cable goes aboard',
  excerpt:
    'Every length of class-approved anchor or mooring chain, and every shackle and swivel in it, should arrive stamped and with a certificate from a classification society. What the stamps show, what the certificate should contain, which societies issue them, and how to match chain, paperwork and ship.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Marking and Certificates',
  seoDescription:
    'How anchor and mooring chain is marked and certified: stamped grade and certificate number, what a class certificate shows, and checks on delivery.',
  focusKeyword: 'anchor chain marking',
  publishedAt: '2026-11-08T11:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Class-approved chain is made at a works approved by the classification society and tested in front of its surveyor.',
        'Each length is stamped near its ends with at least its grade, certificate number and the society’s mark; accessories carry their own marks.',
        'The certificate ties those marks to the chain’s size, grade, length, proof and break test results and the mill.',
        'The society must be one the ship’s class — or the project specification — accepts. Some markets expect one particular society.',
        'Check marks against paperwork piece by piece on delivery. A length or shackle that cannot be matched to its certificate should not go aboard.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain certificate is the only proof that a length of chain is what it is sold as. Diameter can be measured on the quay; grade, heat treatment and test results cannot. That is why classed ships and offshore units only accept chain and accessories with a certificate from a recognised classification society, and why the marks on the steel matter as much as the paper.',
    },
    {
      type: 'direct_answer',
      question: 'What certificate does anchor chain need?',
      answer:
        'A classification society certificate — from a society such as ABS, BV, CCS, DNV, KR, LR, NK, RINA or RS — issued after the chain was made at an approved works and proof and break tested in the presence of the society’s surveyor. It records the size, grade, length, test loads and identification marks, and each accessory has its own certificate.',
    },

    { type: 'section_head', number: '/01', title: 'The marks on the chain.', anchor: 'marks' },
    {
      type: 'paragraph',
      html: 'After testing, each length of class-approved chain is stamped near both ends — at least with the chain grade, the certificate number and the society’s stamp. Shackles, swivels and special links are stamped individually; one stockist notes that each of its swivels carries a serial number on the body. The exact content and position of the marks are set by each society’s rules. Makers now also record the flash-butt weld of every link and keep batch traceability, so a mark can be followed back to the bar it was made from.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Painted marks are not stamps.',
      body: 'Mooring chain often carries painted bands on some links — to count length, or to show twist while the line is laid. They are useful on deck, but they are not identification. The stamped marks and the certificate are what identify the chain.',
    },

    { type: 'section_head', number: '/02', title: 'What the certificate shows.', anchor: 'certificate' },
    {
      type: 'prose',
      html: '<p>A class certificate for chain or accessories should give:</p><ul><li>the society, certificate number and the surveyor;</li><li>the maker and works;</li><li>the product — stud link or studless chain, or the type of accessory — its nominal diameter and grade;</li><li>the number and length of the lengths, or the number of pieces;</li><li>the proof load and breaking load applied, and the result;</li><li>mechanical and impact test results, or a reference to them;</li><li>the identification marks stamped on the steel.</li></ul><p>The tests behind it are explained in <a href="/blog/anchor-chain-testing-proof-break-ndt">anchor chain testing</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Which society.', anchor: 'societies' },
    {
      type: 'paragraph',
      html: 'The chain mills we work with hold factory approvals and class certificates from up to a dozen societies — among them ABS, BV, CCS, DNV, KR, LR, NK, RINA, RS, IRS and CR — for anchor chain and accessories and, separately, for offshore mooring chain. A ship needs the society that classes it, or one it accepts; an offshore project needs what its specification names. Some markets lean on one society: one chain maker reports that most projects in Australia ask for a particular society’s certificate. Say which you need when you enquire, because it decides which mill and which stock can supply.',
    },

    { type: 'section_head', number: '/04', title: 'Checks on delivery.', anchor: 'delivery' },
    {
      type: 'prose',
      html: '<ol><li>Count the lengths and accessories against the certificates.</li><li>Read the stamped marks on each length and piece, and find them on a certificate.</li><li>Check size and grade on the certificate against the order and the ship’s requirement — <a href="/blog/equipment-number-anchor-chain-sizing">equipment number</a> for ships, the mooring specification offshore.</li><li>Check the test loads against the <a href="/blog/anchor-chain-size-chart">size chart</a>.</li><li>Keep the certificates in the ship’s file: the surveyor will ask for them at every renewal survey.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a mill test certificate enough for anchor chain?', answer: 'Not for a classed ship or offshore unit. They need a classification society certificate issued after testing witnessed by the society’s surveyor.' },
        { question: 'Where are the marks on anchor chain?', answer: 'Stamped near both ends of each length; accessories are stamped individually. The society’s rules set the content and position.' },
        { question: 'Which classification societies certify anchor chain?', answer: 'Among others ABS, BV, CCS, DNV, KR, LR, NK, RINA, RS, IRS and CR.' },
        { question: 'Do shackles and swivels need their own certificates?', answer: 'Yes. Each accessory is proof tested and certified, separately from the chain.' },
        { question: 'What if a mark cannot be matched to a certificate?', answer: 'Do not fit it. Ask the supplier for the matching certificate or a replacement.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Class-certified chain and accessories',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-MR-MC-SL', 'IH-MR-MC-SS', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-SFACGU2U3', 'IH-MR-AC-BSW'],
    },
    { type: 'category_link', slug: 'marine-equipment-uae', label: 'Marine equipment', blurb: 'Chain, anchors, connectors, chasers, deck fittings, buoys and aquaculture moorings.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-testing-proof-break-ndt', 'how-anchor-chain-is-made', 'anchor-proof-load-testing', 'anchor-chain-size-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Society list and certificate practice from chain makers’ published approvals and a stockist’s statements. Marking content and position are set by each classification society’s rules.',
    },
    {
      type: 'cta_block',
      heading: 'Need chain to a named society?',
      body: 'Tell us the classification society with the size, grade and length. We will quote chain and accessories certified to it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
