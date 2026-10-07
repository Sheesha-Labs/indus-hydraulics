import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Plug valves for flow iron and process duty, read from the 16 listings:
 * lubricated (LT) and non-lubricated (TE) designs, trims, seals, end
 * connections, ratings, port and operator. Greasing intervals are not on the
 * listings, so the article defers to the maker and operator.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lubricated-vs-non-lubricated-plug-valves',
  title: 'Lubricated against non-lubricated plug valves: how each seals, and which suits the job',
  excerpt:
    'Plug valves isolate treating lines, manifolds and process piping with a quarter turn. How a lubricated valve seals with injected sealant, how a non-lubricated valve seals with a liner, and what our listings rate each one for.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between lubricated and non-lubricated plug valves?',
      answer:
        'A lubricated plug valve seals by injecting sealant between the plug and the body inserts, which also lowers the turning torque; it needs regular re-greasing. A non-lubricated plug valve seals against a liner or sleeve — PEEK on our listings — and needs no sealant. On our listings the lubricated valves are 17-4PH plugs in 410 stainless inserts with 1502 union ends; the non-lubricated valves add 206, 602, API 6A flanged and ASME flanged ends.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Both are quarter-turn isolation valves: a plug with a through-port turns in the body.',
        'Lubricated valves (LT) seal with injected sealant and must be greased on the maker\'s and operator\'s schedule.',
        'Non-lubricated valves (TE) seal against a PEEK liner on our listings and need no sealant.',
        'Ratings follow the ends: 1502 at 15,000 psi standard and 10,000 psi sour; 2-1/16" API 6A flanged at 15,000 psi; ASME Class 300 at 740 psi.',
        'Plug valves are for fully open or fully closed service. Throttling erodes the plug and inserts.',
      ],
    },
    {
      type: 'lead',
      html: 'On a frac spread or a cement unit, the valves that isolate each line are usually plug valves: a quarter turn, a full bore when open, and a compact body that sits in a line of iron. The design question is <strong>how the plug seals against the body</strong> — with grease pumped in, or with a liner that does the job dry. Each answer brings its own maintenance and its own failure modes.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How a plug valve works.',
      anchor: 'how',
    },
    {
      type: 'paragraph',
      html: 'A plug valve is a body with a plug inside it, bored through. Turned a quarter turn one way, the bore lines up with the line and the valve is open, full port on most of our listings; a quarter turn back and the solid side of the plug faces the flow. The seal is made between the plug and inserts or a liner in the body, and everything else about the valve — torque, maintenance, tolerance of sand and acid — follows from how that seal is made.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Lubricated and non-lubricated, side by side.',
      anchor: 'compare',
    },
    {
      type: 'comparison_table',
      caption: 'Plug valve designs on our listings',
      columns: ['Property', 'Lubricated (LT)', 'Non-lubricated (TE)'],
      rows: [
        { cells: ['How it seals', 'Sealant injected between plug and body inserts', 'Plug against a PEEK liner'], highlight: true },
        { cells: ['Plug and body', '17-4PH plug, 410 stainless inserts', '17-4PH or Inconel 625 plug, PEEK liner'] },
        { cells: ['Seals (as listed)', 'RPTFE and Viton; HNBR and graphite packing in sour', 'PEEK and HNBR; RPTFE and Viton on standard units'] },
        { cells: ['Ends and ratings', '1502: 15,000 psi standard, 10,000 psi sour', '206, 602, 1502, API 6A 15M flanged, ASME 300 and 900 RF'] },
        { cells: ['Maintenance', 'Regular re-greasing', 'No sealant; inspect liner and plug'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Lubricated valves.',
      anchor: 'lubricated',
    },
    {
      type: 'paragraph',
      html: 'In a lubricated valve, sealant is pumped through a fitting into grooves between the plug and the body inserts. It fills the clearances that would otherwise leak, eases the plug so it turns more easily, and keeps sand and fluid out of the sealing faces. The cost is maintenance: sealant is lost every time the valve cycles under pressure, so it has to be replenished on a schedule — set by the valve maker and the operator, and on stimulation work often between stages. Our lubricated valves are 2" and 3" full port and 2" × 1" reduced port with 1502 ends, manual or gear-operated.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Non-lubricated valves.',
      anchor: 'non-lubricated',
    },
    {
      type: 'paragraph',
      html: 'A non-lubricated valve replaces the sealant with a liner — PEEK on our listings — that seals against the plug directly. There is no grease to inject or lose, which suits manifolds and process lines where greasing is impractical, and the sour versions pair the liner with an Inconel 625 plug and HNBR seals. Our non-lubricated range runs from 2" and 3" Figure 206 valves at 2,000 psi through 602 and 1502 union valves to a 2-1/16" API 6A 15M flanged valve at 15,000 psi, and to ASME raised-face valves to API 6D: 3" Class 300 at 740 psi and 2" Class 900 at 2,220 psi.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Open or closed — nothing in between.',
      body: 'A partly open plug valve directs high-velocity flow across the edge of the plug and the inserts or liner, and on sand-laden fluid that erodes the sealing faces quickly. Use plug valves fully open or fully closed and control flow with a choke. Never grease, adjust or dismantle a valve that is under pressure.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the size, the end connections (union figure and gender, or flange standard and class), standard or sour service, lubricated or non-lubricated, and the operator — lever, handle or gear. Union-ended valves take the rating of their figure, explained in <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>; the lines they isolate are described in <a href="/blog/flow-iron-explained">flow iron explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Why do plug valves need greasing?',
          answer:
            'Lubricated plug valves seal with injected sealant, which is lost as the valve cycles. Re-greasing restores the seal and keeps the turning torque down. Non-lubricated valves do not need it.',
        },
        {
          question: 'What pressure is a 1502 plug valve rated for?',
          answer:
            'Our 1502 plug valves are 15,000 psi for standard service and 10,000 psi for sour service.',
        },
        {
          question: 'Can a plug valve be used to throttle flow?',
          answer:
            'No. Partly open, it erodes the plug and its seals. Use it fully open or fully closed and throttle with a choke.',
        },
        {
          question: 'What is a TE plug valve?',
          answer:
            'On our listings, TE marks the non-lubricated design, which seals against a PEEK liner rather than injected sealant.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Plug valves',
      skus: [
        'IH-OFV-PLUG-LT-2-1502MF-15K-STD-ANSON',
        'IH-OFV-PLUG-LT-3-1502MF-15K-STD-FMC',
        'IH-OFV-PLUG-LT-3-1502MF-15K-STD-WOM',
        'IH-OFV-PLUG-TE-2-1502MF-10K-SOUR-ANSON',
        'IH-OFV-PLUG-TE-2116-15M-15K-STD-FMC',
        'IH-OFV-PLUG-TE-2-602MF-6K-SOUR-ANSON',
        'IH-OFV-PLUG-TE-3-206MF-2K-SOUR-INDUS',
        'IH-OFV-PLUG-TE-3-300RF-740-SOUR-STREAMFLO',
      ],
    },
    {
      type: 'category_link',
      slug: 'oilfield-plug-valves',
      label: 'Oilfield plug valves',
      blurb: 'Lubricated and non-lubricated, union, API and ASME ends.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-manifolds',
      label: 'Manifolds',
      blurb: 'Multi-well and diverter manifolds with plug-valve isolation.',
    },

    {
      type: 'cta_block',
      heading: 'Need plug valves for a spread or a skid?',
      body: 'Send the size, ends, pressure, service and operator. We will quote valves, sealant or redress parts and documents together.',
      quoteLabel: 'Quote plug valves',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Designs, trims, seals, ends, ratings, port and operators checked against our plug valve listings.',
    },
  ],
}

export default ARTICLE
