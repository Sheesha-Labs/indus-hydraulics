import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * PTFE hose, read from the three industrial PTFE listings, the R14 hydraulic
 * PTFE hose and the PTFE chemical composite.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ptfe-hose-explained',
  title: 'PTFE hose explained: smoothbore against convoluted, and where each one belongs',
  excerpt:
    'PTFE is the most chemically inert hose liner there is, and it runs from −73 to +260 °C. The difference between smoothbore and convoluted PTFE hose, what the braid adds, and how it compares with R14.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is PTFE hose used for?',
      answer:
        'PTFE hose carries media and temperatures that defeat rubber: aggressive chemicals, solvents, steam and hot oils, from −73 to +260 °C on our listings. Smoothbore PTFE with a stainless braid takes high pressure — up to 350 bar at the smallest size — and cleans easily. Convoluted PTFE is far more flexible with a tighter bend, at lower pressure: 16 bar with a polypropylene braid and 25 bar with a stainless braid.',
    },
    {
      type: 'key_takeaways',
      items: [
        'PTFE is chemically inert to almost everything a hose carries, does not age, and does not taint.',
        'Our PTFE hoses run from −73 to +260 °C.',
        'Smoothbore with 304 braid: up to 350 bar, DN5 to DN50 — high pressure, smooth bore, easy to clean, stiffer.',
        'Convoluted: 16 bar (polypropylene braid) or 25 bar (304 braid), DN10 to DN75 — flexible, tight bend radius, harder to clean.',
        'For hydraulic circuits, R14 is PTFE hose to SAE 100R14: 200 bar at −03, −54 to +204 °C.',
      ],
    },
    {
      type: 'lead',
      html: 'PTFE — polytetrafluoroethylene — is about as close to universally chemically resistant as an engineering material gets. As a hose liner it carries acids, solvents, steam and hot oils that would swell, harden or dissolve rubber, it does not age on the shelf, and nothing sticks to it. The choice is less about whether PTFE will handle the medium than about <strong>which construction</strong> suits the installation.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Smoothbore or convoluted.',
      anchor: 'constructions',
    },
    {
      type: 'paragraph',
      html: 'A <strong>smoothbore</strong> PTFE hose has a plain, round PTFE tube under the braid. It carries high pressure, drains completely and cleans easily, which suits process lines, steam and hydraulic duty — but the plain tube kinks if bent too tightly. A <strong>convoluted</strong> PTFE hose has a tube formed into corrugations, like a metal hose. It bends far more tightly and resists kinking, which suits tight routing and frequent movement, at a lower pressure and with a bore that is harder to clean and drain.',
    },
    {
      type: 'comparison_table',
      caption: 'PTFE hose in our range',
      columns: ['Hose', 'Braid', 'Up to', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['PTFE smoothbore', '304 stainless', '350 bar (smallest size)', 'DN5 – DN50', '−73 to +260 °C'], highlight: true },
        { cells: ['Convoluted PTFE', 'Polypropylene', '16 bar', 'DN10 – DN50', '−73 to +260 °C'] },
        { cells: ['Convoluted PTFE', '304 stainless', '25 bar', 'DN10 – DN75', '−73 to +260 °C'] },
        { cells: ['R14 PTFE hydraulic (SAE 100R14)', 'Stainless, or stainless + aramid', '200 bar at −03', '−03 to −16', '−54 to +204 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What the braid adds.',
      anchor: 'braid',
    },
    {
      type: 'paragraph',
      html: 'PTFE on its own is not strong; the braid carries the pressure and protects the tube. A 304 stainless braid gives the high ratings and abrasion resistance. A polypropylene braid on the convoluted hose keeps it light and metal-free where the outside atmosphere would attack stainless, at the cost of pressure. The temperature limit on our listings is the same for all three — −73 to +260 °C — but the end fittings, and any gaskets in them, need to match it.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'PTFE needs PTFE fittings.',
      body: 'PTFE hose is assembled with fittings and ferrules made for it — a standard rubber-hose ferrule will not grip the tube properly. Our crimp ferrule range includes a specialty ferrule for PTFE / Teflon hose; use the fitting the hose maker specifies.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Hydraulic PTFE: R14.',
      anchor: 'r14',
    },
    {
      type: 'paragraph',
      html: 'For hydraulic circuits there is a PTFE hose built to the SAE 100R14 standard: our R14 has a virgin PTFE tube under a single stainless braid (Type A) or stainless braid plus aramid (Type B), rated from 200 bar at −03 down to 65 bar at −16, and from −54 to +204 °C. It is the answer where a hydraulic line runs near heat, carries a fluid nitrile cannot, or blisters a rubber tube through permeation. For large-bore chemical transfer, the PTFE chemical composite hose takes PTFE to 1"–DN100 at 20 bar.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What temperature can PTFE hose handle?',
          answer:
            'Our industrial PTFE hoses are listed from −73 to +260 °C. The R14 hydraulic PTFE hose is rated −54 to +204 °C.',
        },
        {
          question: 'Is smoothbore or convoluted PTFE hose better?',
          answer:
            'Smoothbore for pressure, drainage and cleaning; convoluted for flexibility and tight bends at lower pressure. Our smoothbore is rated to 350 bar at the smallest size; convoluted to 16 or 25 bar.',
        },
        {
          question: 'Does PTFE hose need special fittings?',
          answer:
            'Yes. Use fittings and ferrules made for PTFE hose; our range includes a specialty crimp ferrule for PTFE / Teflon hose.',
        },
        {
          question: 'What is SAE 100R14?',
          answer:
            'The SAE standard for PTFE hydraulic hose. Our R14 is built to it, from −03 to −16, 200 bar at −03.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'PTFE hose',
      skus: ['IH-IH-PTFE-SMOOTHBORE-SS', 'IH-IH-PTFE-CONVOLUTED-SS', 'IH-IH-PTFE-CONVOLUTED-POLYMER', 'IH-HOSE-R14', 'IH-IH-A911SG', 'IH-CF-TEFLON'],
    },
    {
      type: 'category_link',
      slug: 'ptfe-hoses',
      label: 'PTFE hose',
      blurb: 'Smoothbore and convoluted PTFE hose, −73 to +260 °C.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose',
      blurb: 'Including R14 PTFE hydraulic hose to SAE 100R14.',
    },

    {
      type: 'cta_block',
      heading: 'Choosing between PTFE constructions?',
      body: 'Send the medium, temperature, pressure, bore and routing. We will recommend smoothbore or convoluted and quote the assembly with the right fittings.',
      quoteLabel: 'Quote PTFE hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Constructions, ratings, temperatures and sizes checked against our PTFE hose listings.',
    },
  ],
}

export default ARTICLE
