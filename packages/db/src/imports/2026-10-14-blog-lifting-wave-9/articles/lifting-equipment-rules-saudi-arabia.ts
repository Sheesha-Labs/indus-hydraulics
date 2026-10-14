import type { BlogArticleSeed } from '../shared'

/**
 * Saudi lifting equipment rules. Checked 2026-10-14 by reading the English text of SASO Technical
 * Regulation for Machinery Safety – Part 3: Lifting Equipment (No. 01-05-21-182, approved
 * 14/10/2021, gazetted 17/12/2021; Arabic text authentic): Art 6/1 CoC (Type 1a), 6/3 used
 * equipment and 6/4 post-installation inspection certificates from SASO-approved notified bodies,
 * 6/5 periodic examination (no interval), 4/6 marking, 5/3 Arabic labels, Art 11 transition, annex
 * standards. Aramco GI 7.025 operator certification (medium — unofficial copy). Aramco GI 7.030
 * contents, intervals and colour codes NOT verified — not stated.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-equipment-rules-saudi-arabia',
  title: 'Lifting equipment rules in Saudi Arabia: what SASO’s technical regulation requires',
  excerpt:
    'Saudi Arabia regulates lifting equipment and lifting accessories — slings, chains and their fittings included — through a SASO technical regulation that took effect in 2022. What it covers, the conformity certificate suppliers need, the inspection certificates before equipment goes into service, the marking and Arabic labelling rules, and how client standards such as Saudi Aramco’s sit on top.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Saudi Lifting Equipment Rules: SASO Regulation Explained',
  seoDescription:
    'Saudi Arabia’s SASO technical regulation for lifting equipment and lifting accessories: scope, certificates of conformity, notified-body inspection before use, periodic examination, marking and Arabic labels, referenced EN standards and client requirements.',
  focusKeyword: 'saso lifting equipment',
  publishedAt: '2026-10-14T10:26:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'SASO’s Technical Regulation for Machinery Safety – Part 3: Lifting Equipment was approved in October 2021 and published in December 2021; only the Arabic text is legally authentic.',
        'Its definition of lifting fittings includes slings and their parts, so rigging accessories are in scope.',
        'Suppliers need a SASO certificate of conformity before placing products on the market.',
        'Used equipment, and equipment after installation, needs an inspection certificate from a SASO-approved notified body before going into service.',
        'Periodic examination is required, but the regulation sets no interval — client standards and the operator’s procedures fill that gap.',
      ],
    },
    {
      type: 'lead',
      html: 'Contractors moving rigging into Saudi Arabia — from the UAE, or from anywhere else — meet two layers of rules: the national technical regulation that governs what may be placed on the market and put into service, and the client’s own standards on site. This guide covers the first, from the English text of the SASO regulation, and points to the second. The Arabic text is the legally authentic version; read it, or have it read, before relying on any detail.',
    },

    { type: 'section_head', number: '/01', title: 'The regulation and what it covers.', anchor: 'scope' },
    {
      type: 'paragraph',
      html: 'SASO’s <strong>Technical Regulation for Machinery Safety – Part 3: Lifting Equipment</strong> (No. 01-05-21-182) was approved on 14 October 2021 and published in the Official Gazette on 17 December 2021, with transition periods for suppliers to comply. It covers lifting equipment and lifting accessories. Its definition of lifting fittings expressly includes slings and their parts, and its annex references the European standards for chain slings and Grade 8 chain (EN 818 series), webbing and round slings (EN 1492), chain components (EN 1677) and wire rope slings (EN 13414), adopted as SASO GSO standards.',
    },
    {
      type: 'direct_answer',
      question: 'What are the lifting equipment regulations in Saudi Arabia?',
      answer:
        'SASO’s Technical Regulation for Machinery Safety – Part 3: Lifting Equipment, in force since 2022, governs lifting equipment and accessories including slings. Suppliers need a SASO certificate of conformity; used equipment and newly installed equipment need an inspection certificate from a SASO-approved notified body before use; periodic examination is required; and items must be marked, with Arabic labelling. Client standards such as Saudi Aramco’s add site requirements.',
    },

    { type: 'section_head', number: '/02', title: 'Certificates.', anchor: 'certificates' },
    {
      type: 'comparison_table',
      caption: 'Certificates under the SASO lifting equipment regulation (from the English text)',
      columns: ['Stage', 'Requirement'],
      rows: [
        { cells: ['Placing on the market', 'Supplier holds a SASO certificate of conformity (Type 1a scheme to ISO/IEC 17067)'], highlight: true },
        { cells: ['Used equipment', 'Inspection certificate from a SASO-approved notified body'] },
        { cells: ['After installation, before service', 'Inspection certificate from a SASO-approved notified body'] },
        { cells: ['In service', 'Periodic examinations and inspections of equipment and fittings — interval not set in the regulation'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Marking and labels.', anchor: 'marking' },
    {
      type: 'paragraph',
      html: 'The regulation requires lifting fittings to be marked with their working load limit and, where needed for safe use, their material. Chains, ropes and webbing must carry the maker’s name and address, nominal size, construction, material, any special heat treatment, the test method and the WLL. Labels and instructions must be in Arabic. Rated items we supply ship marked with their WLL and with the manufacturer’s test certificate; tell us if a shipment to Saudi Arabia needs Arabic labelling or specific conformity documents, and we will confirm what can be provided. See <a href="/blog/shackle-markings-explained">shackle markings explained</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Client standards on site.', anchor: 'clients' },
    {
      type: 'paragraph',
      html: 'Major clients add their own requirements. Saudi Aramco, for example, has general instructions on lifting — including GI 7.025 on testing and certifying heavy equipment operators — and its contractors work to Aramco’s lifting and rigging procedures, which are not public. Their inspection intervals, colour codes and inspector qualifications are set by the client and the contract; get them from the client’s documents, not from general articles. The SASO regulation is the floor; the contract is usually stricter.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not legal advice.',
      body: 'This summarises the English text of the SASO regulation as we read it in October 2026. The Arabic text is authentic, and SASO conformity schemes and notified-body lists change. Confirm requirements with SASO, your notified body and your client before shipping or lifting.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Does the SASO lifting regulation cover slings and shackles?', answer: 'Its definition of lifting fittings includes slings and their parts, and its annex references the EN standards for chain, chain slings, webbing and round slings, chain components and wire rope slings.' },
        { question: 'How often must lifting equipment be inspected in Saudi Arabia?', answer: 'The SASO regulation requires periodic examinations but sets no interval. Client standards and site procedures set the interval.' },
        { question: 'Do lifting accessories need Arabic labels in Saudi Arabia?', answer: 'The regulation requires labels and instructions in Arabic.' },
        { question: 'Who inspects lifting equipment before use in Saudi Arabia?', answer: 'For used equipment and after installation, a SASO-approved notified body issues an inspection certificate before it goes into service.' },
        { question: 'Can you ship certified rigging to Saudi Arabia?', answer: 'Yes, we ship from Dubai overland. Tell us the conformity and labelling documents your shipment needs and we will confirm what can be provided.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Certified rigging for Saudi projects',
      skus: ['IH-LR-SH-G2130', 'IH-LR-CS-G80DOS', 'IH-LR-SY-PRSE', 'IH-LR-SY-PFWSEE', 'IH-LR-WS-SWG', 'IH-LR-G8-MLAE16774'],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting and rigging',
      blurb: 'Certified slings, shackles, hooks, chain and hoists, shipped from Dubai.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Saudi Arabia',
      blurb: 'Overland from Jebel Ali, with the documents each consignment needs.',
    },
    {
      type: 'related_articles',
      slugs: ['lifting-equipment-rules-gcc', 'lifting-equipment-inspection-uae', 'lifting-gear-test-certificate', 'lifting-equipment-register-uae', 'shackle-markings-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'SASO Technical Regulation for Machinery Safety – Part 3: Lifting Equipment (No. 01-05-21-182), English text read October 2026; the Arabic text is authentic. Not legal advice.',
    },
    {
      type: 'cta_block',
      heading: 'Shipping rigging to Saudi Arabia?',
      body: 'Send the item list, the project and the documents your client and notified body require. We will confirm what can be supplied against them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
