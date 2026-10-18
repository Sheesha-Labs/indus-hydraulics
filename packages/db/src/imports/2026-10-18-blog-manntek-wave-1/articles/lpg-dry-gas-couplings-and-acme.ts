import type { BlogArticleSeed } from '../shared'

/**
 * LPG dry gas couplings vs open ACME. Checked 2026-10-18 against manntek.se DGC page, ACME/Whitworth accessory page,
 * Design 2.0 brochure XB43, rDME page and the configurator: designed for LPG, EN 13175, 1" heavy-duty vehicle adapter
 * to EN 13760, 1"–8", stainless, low-temp FKM, 25 bar, Design 2.0 up to 45 % flow / 40 % force, ACME/Whitworth
 * threads and MannTek's statement on open ACME losses (high). No ACME pressure or leak figures are given — none sourced.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lpg-dry-gas-couplings-and-acme',
  title: 'LPG transfer couplings: dry gas couplings, EN 13175 and replacing open ACME',
  excerpt:
    'Open ACME couplings vent LPG every time a bobtail or tanker hose is disconnected. A dry gas coupling closes both halves before they part. What a dry gas coupling is, the standards it is built to, sizes by duty, and how to fit one to existing ACME connections.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'LPG Dry Gas Couplings vs ACME: EN 13175, Sizes, Changeover',
  seoDescription:
    'LPG dry gas couplings explained: valves in both halves, EN 13175, 1" to 8" by duty, low-temperature seals, Design 2.0, and fitting them to existing ACME connections.',
  focusKeyword: 'lpg dry gas coupling',
  publishedAt: '2026-10-18T11:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An open ACME connection lets LPG escape each time the hose is disconnected; MannTek cites high product losses, environmental effects and health risks.',
        'A dry gas coupling (DGC) has a valve in each half and closes both before they separate.',
        'MannTek designs and makes the DGC to standards such as EN 13175; the 1" size serves as a heavy-duty vehicle adapter to EN 13760.',
        'Sizes run from 1" to 8": small for vehicles and bobtails, 2" and 3" for tankers and rail cars, 4" to 8" ship-to-shore.',
        'ACME and Whitworth-threaded DGC halves fit directly onto existing connections, so a changeover needs no pipework change.',
      ],
    },
    {
      type: 'lead',
      html: 'LPG is stored and moved as a liquid under pressure, and every time a transfer hose is disconnected the liquid trapped between the last valves flashes off. On an open ACME connection that happens at the operator’s hands. A dry gas coupling puts a valve in both halves of the joint and closes them before the joint opens. It is the LPG member of the dry disconnect family described in <a href="/blog/dry-disconnect-vs-camlock-couplings">dry disconnect vs camlock</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Open ACME vs dry gas coupling.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Open ACME connection vs MannTek dry gas coupling',
      columns: ['Feature', 'Open ACME connection', 'Dry gas coupling (DGC)'],
      rows: [
        { cells: ['Valve in the joint', 'No; relies on separate valves upstream', 'One in each half'] },
        { cells: ['On disconnect', 'Liquid between the valves escapes', 'Both valves close before the halves part'], highlight: true },
        { cells: ['Connection', 'Threaded nut, turned up by hand', 'Couple and turn; one motion opens both valves'] },
        { cells: ['Standards (DGC)', '—', 'Designed and made to standards such as EN 13175'] },
        { cells: ['Body and seals (DGC)', '—', 'Stainless steel; low-temperature FKM for all LPG qualities'] },
        { cells: ['Working pressure (DGC)', '—', '25 bar (MannTek)'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is a dry gas coupling for LPG?',
      answer:
        'A dry break coupling designed for liquefied petroleum gas. Each half, the fixed tank unit and the hose unit, has its own valve. Turning the coupling to connect opens both; turning it to disconnect closes both before the halves separate, so LPG is not released at the joint as it is with an open ACME connection. MannTek’s DGC is built to standards such as EN 13175 and rated 25 bar.',
    },

    { type: 'section_head', number: '/02', title: 'Sizes by duty.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: 'MannTek DGC sizes and typical duty (configurator)',
      columns: ['Size', 'Socket', 'Flow (MannTek)', 'Typical duty'],
      rows: [
        { cells: ['1" (DN 25)', 'Ø 56 mm', 'up to 460 L/min', 'Heavy-duty vehicle adapter to EN 13760'] },
        { cells: ['2" (DN 50)', 'Ø 71 mm', 'up to 1,680 L/min', 'Bobtail and tank-truck loading to EN 13175'] },
        { cells: ['3" (DN 80)', 'Ø 119 mm', 'up to 3,850 L/min', 'Tank trucks and rail cars'] },
        { cells: ['4" to 8"', 'Ø 164 to 272 mm', 'up to 24,200 L/min at 8"', 'Ship-to-shore loading'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The 2" and 3" hose units are MannTek’s Design 2.0 generation. MannTek reports up to 45 % more flow capacity and up to 40 % lower coupling force than the original design, which shortens loading and eases handling on a busy filling bay.',
    },

    { type: 'section_head', number: '/03', title: 'Changing over from ACME.', anchor: 'acme' },
    {
      type: 'paragraph',
      html: 'MannTek makes DGC tank units and hose units with ACME and Whitworth threads for direct assembly on existing connections, also with a drain connection to release trapped liquid. That means the tank or bobtail keeps its pipework and only the coupling changes. Options worth specifying on LPG duty include a pressure equalizing valve, so the coupling can still be made against trapped pressure, a pressure bleeding valve for lines that warm up, stop before disconnect and a hose unit with an integrated safety breakaway.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Blending rDME?',
      body: 'For renewable DME blended into LPG, MannTek makes a separate 2" rDME coupling that connects anticlockwise, so it cannot be cross-connected with ordinary LPG equipment.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is the dry gas coupling only for LPG?', answer: 'It was designed for LPG (propane and butane); MannTek states it is now used for many other gases and gaseous media.' },
        { question: 'Can I keep my existing ACME pipework?', answer: 'Yes. ACME and Whitworth-threaded DGC halves fit directly onto existing connections.' },
        { question: 'Which size for a bobtail?', answer: 'MannTek lists the 2" DGC for bobtail and tank-truck loading to EN 13175, and the 1" as a heavy-duty vehicle adapter to EN 13760.' },
        { question: 'What seals are used?', answer: 'MannTek’s low-temperature FKM, for all LPG qualities and operating temperatures.' },
        { question: 'What pressure is it rated for?', answer: 'MannTek publishes 25 bar working pressure for the DGC.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'LPG couplings',
      skus: ['IH-MNT-DGC-TU', 'IH-MNT-DGC-HU', 'IH-MNT-RDME', 'IH-MNT-SBC'],
    },
    {
      type: 'category_link',
      slug: 'dry-disconnect-couplings',
      label: 'Dry disconnect couplings',
      blurb: 'MannTek dry gas, dry disconnect and dry aviation couplings.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'lng-future-fuels',
      label: 'LNG and future fuels',
      blurb: 'Couplings and transfer equipment for LNG, methanol, ammonia, CO₂ and rDME.',
    },
    {
      type: 'related_articles',
      slugs: ['tanker-loading-and-vapour-recovery-hose', 'industrial-hose-couplings-guide', 'cam-and-groove-coupling-types'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-18',
      note: 'DGC standards, sizes, flow, seals and pressure from MannTek’s DGC page, Design 2.0 brochure, ACME/Whitworth accessory page and configurator.',
    },
    {
      type: 'cta_block',
      heading: 'Changing an LPG fleet over?',
      body: 'Send the sizes, the existing thread (ACME or Whitworth) and the duty. We will quote matching MannTek DGC tank and hose units.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
