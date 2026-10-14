import type { BlogArticleSeed } from '../shared'

/**
 * ASME B30.26 explained. Checked 2026-10-14: scope list and current edition (ASME's page lists
 * B30.26-2026); inspection categories, marking and removal criteria from a rigging distributor's
 * summary (medium — stated as "as summarised"); shackle temperature range −40 °F to +400 °F and
 * eyebolt +30 °F to +275 °F from a US DOE site rigging manual citing B30.26 (high). Paywalled text
 * not quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'asme-b30-26-rigging-hardware-explained',
  title: 'ASME B30.26 explained: the US standard for shackles, hooks, turnbuckles and other rigging hardware',
  excerpt:
    'ASME B30.26 is the standard behind most rigging hardware specifications in Gulf oil and gas and on US-designed projects: shackles, links, rings, swivels, turnbuckles, eyebolts, hoist rings, wire rope clips and more. What it covers, what it requires to be marked, how it structures inspection, and the removal criteria every rigger should know.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'ASME B30.26 Rigging Hardware Standard Explained',
  seoDescription:
    'ASME B30.26 explained: which rigging hardware it covers, marking requirements, initial, frequent and periodic inspection, removal criteria such as 10% wear, temperature limits, and how it applies on Gulf projects.',
  focusKeyword: 'asme b30.26',
  publishedAt: '2026-10-14T10:22:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'ASME B30.26 covers detachable rigging hardware: shackles, links, rings, swivels, turnbuckles, eyebolts, hoist rings, wire rope clips, wedge sockets, rigging blocks and load indicators.',
        'It sets requirements for marking, use, inspection and removal — not dimensions or ratings, which come from makers and product standards.',
        'Inspection runs at three levels: initial before first use, frequent (daily or before use), and periodic — at least yearly, more often in severe service.',
        'Common removal criteria include missing markings, heat damage, cracks, bending, damaged threads and 10% loss of original dimension.',
        'ASME lists a 2026 edition; many specifications still cite 2015 — check which your contract names.',
      ],
    },
    {
      type: 'lead',
      html: 'Specifications for Gulf oil and gas projects, and for anything designed by a US engineering house, often require rigging hardware to “comply with ASME B30.26”. It is a short phrase with a lot behind it. B30.26 is one volume of the ASME B30 safety standard for cranes and rigging, and it governs the detachable hardware that connects slings to loads and hooks. This guide explains what it does and does not cover. Where we describe its detail, we draw on published summaries of the standard; the paid text governs.',
    },

    { type: 'section_head', number: '/01', title: 'What it covers.', anchor: 'scope' },
    {
      type: 'paragraph',
      html: 'B30.26 covers the construction, installation, operation, inspection and maintenance of detachable rigging hardware used for load handling: <a href="/c/shackles">shackles</a>, links, rings, swivels, <a href="/c/turnbuckles-rigging-screws">turnbuckles</a>, <a href="/c/eye-bolts-eye-nuts">eyebolts</a>, swivel hoist rings, <a href="/c/wire-rope-clips">wire rope clips</a>, wedge sockets, rigging blocks and load-indicating devices. Slings themselves are covered by a separate volume, B30.9, and hooks by B30.10. B30.26 does not set the dimensions or ratings of the hardware — those come from the maker and from product specifications such as US Federal Specification RR-C-271 for shackles.',
    },
    {
      type: 'direct_answer',
      question: 'What is ASME B30.26?',
      answer:
        'ASME B30.26 is the US safety standard for detachable rigging hardware — shackles, links, rings, swivels, turnbuckles, eyebolts, hoist rings, wire rope clips, wedge sockets, rigging blocks and load indicators. It sets requirements for marking, use, inspection and removal from service, while ratings and dimensions come from the maker.',
    },

    { type: 'section_head', number: '/02', title: 'Marking.', anchor: 'marking' },
    {
      type: 'paragraph',
      html: 'As summarised by industry, B30.26 requires a shackle body to be marked with the maker’s name or trademark, the rated load and the size, and the pin with the maker’s name or trademark plus its grade, material or rating; turnbuckles carry the maker’s name or trademark and size or rated load. The user must keep markings legible for the life of the hardware, because missing or illegible markings are themselves a removal criterion. See <a href="/blog/shackle-markings-explained">shackle markings explained</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Inspection.', anchor: 'inspection' },
    {
      type: 'comparison_table',
      caption: 'B30.26 inspection levels (as summarised by industry)',
      columns: ['Level', 'Who and when'],
      rows: [
        { cells: ['Initial', 'A designated person, before first use — new, altered, modified or repaired hardware'] },
        { cells: ['Frequent', 'The user or a designated person, visually, each day or before use'], highlight: true },
        { cells: ['Periodic', 'A designated person, at intervals not exceeding one year — monthly to quarterly in severe service'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Local rules sit on top: in Abu Dhabi, lifting accessories are thoroughly examined every 6 months by approved third parties, which is more frequent than B30.26’s yearly maximum. Follow whichever is stricter — see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Removal criteria.', anchor: 'removal' },
    {
      type: 'prose',
      html: '<p>As summarised by industry, hardware comes out of service for:</p><ul><li>missing or illegible maker’s name, trademark or rated load;</li><li>heat damage, weld spatter or arc strikes;</li><li>excessive pitting or corrosion;</li><li>bent, twisted, distorted, stretched, elongated, cracked or broken load-bearing parts;</li><li>excessive nicks or gouges;</li><li>10% reduction of the original or catalogue dimension at any point;</li><li>incomplete pin engagement or excessive thread damage;</li><li>unauthorised welding or modification.</li></ul><p>It returns to service only if a qualified person approves it. Our <a href="/blog/lifting-gear-rejection-criteria">lifting gear rejection criteria</a> covers slings and other items too.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Temperature limits.',
      body: 'A US Department of Energy site rigging manual, citing B30.26, gives a shackle temperature range of −40 °F to +400 °F (−40 °C to about +204 °C) and eyebolts +30 °F to +275 °F. Outside those ranges, consult the maker.',
    },

    { type: 'section_head', number: '/05', title: 'Using it on Gulf projects.', anchor: 'gulf' },
    {
      type: 'paragraph',
      html: 'When a specification calls for B30.26 compliance, buy hardware whose maker states compliance for that product, marked as the standard requires and supplied with a certificate; inspect it to B30.26 and to local rules, whichever is stricter; and keep it in the site register. For shackles, see the <a href="/blog/shackle-buying-guide-uae">shackle buying guide</a> and <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle</a>; for turnbuckles, <a href="/blog/how-to-choose-and-tension-a-turnbuckle">how to choose and tension a turnbuckle</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What does ASME B30.26 cover?', answer: 'Detachable rigging hardware: shackles, links, rings, swivels, turnbuckles, eyebolts, hoist rings, wire rope clips, wedge sockets, rigging blocks and load-indicating devices.' },
        { question: 'Does ASME B30.26 cover slings and hooks?', answer: 'No — slings are in ASME B30.9 and hooks in B30.10.' },
        { question: 'How often must rigging hardware be inspected under B30.26?', answer: 'Visually each day or before use, and periodically at intervals not exceeding one year — more often in severe service. Local rules may be stricter.' },
        { question: 'What is the 10% rule?', answer: 'Hardware with a 10% reduction of its original or catalogue dimension at any point should be removed from service, as B30.26 is commonly summarised.' },
        { question: 'Which edition of ASME B30.26 is current?', answer: 'ASME lists a 2026 edition; many specifications still cite 2015. Use the edition your contract names.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Rigging hardware',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-TB-US', 'IH-LR-RL-G401', 'IH-LR-RL-WAML', 'IH-LR-LP-SHR100'],
    },
    {
      type: 'category_link',
      slug: 'rigging-hardware',
      label: 'Rigging hardware',
      blurb: 'Shackles, hooks, turnbuckles, eye bolts, links, rings and swivels.',
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
      slugs: ['lifting-gear-rejection-criteria', 'shackle-markings-explained', 'shackle-buying-guide-uae', 'how-to-choose-and-tension-a-turnbuckle', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Scope and edition from ASME; inspection, marking and removal criteria as summarised by industry sources; temperature limits from a US DOE site rigging manual. The ASME text governs.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying to ASME B30.26?',
      body: 'Send the hardware list and the edition your specification names. We will confirm what can be supplied against it, with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
