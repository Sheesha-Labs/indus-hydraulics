import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Abrasive duty, read from A361 and PREMFLEX and the six sandblast coupling
 * listings (Sealfast\'s nozzle holders are NPSH-threaded).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bulk-material-and-sandblast-hose',
  title: 'Bulk material and sandblast hose: abrasion, static and the coupling that takes the blast',
  excerpt:
    'Sand, cement, grain and grit wear a hose from the inside. What an abrasive-duty hose is built with, why it must be anti-static, and how sandblast couplings and nozzle holders are matched.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What hose is used for bulk material and abrasive transfer?',
      answer:
        'A hose with an abrasion-resistant, anti-static tube and a helix for suction. Our bulk material suction and delivery hose (A361) has an anti-static natural rubber tube, textile plies, a steel helix and anti-static wires, rated 10 bar in 3" and 4". For lighter abrasive slurries and chemicals, our MDSE PVC hose runs 1-1/2" to 6" at 3–5 bar. Sandblasting adds its own couplings and nozzle holders, threaded NPSH.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Abrasive media wear the tube from the inside, so the tube compound, not the cover, decides the hose life.',
        'A361 has an anti-static natural rubber tube, steel helix and anti-static wires; 10 bar, 3" and 4", −40 to +70 °C.',
        'Moving powders and grit build static; the anti-static path must run coupling to coupling and to earth.',
        'Sealfast\'s aluminium nozzle holders thread NPSH (ASME B1.20.7); the one published rating is 110 psi, on Sealfast\'s aluminium female NPT crowfoot end.',
        'Wear concentrates on the outside of bends; route abrasive hose in long, gentle curves.',
      ],
    },
    {
      type: 'lead',
      html: 'Most hoses fail from the outside — abrasion, sun, a rub point on a frame. Abrasive-duty hose fails from the inside. Sand, cement, fly ash, grain and blasting grit scour the tube with every metre they travel, and they <strong>scour hardest wherever the hose bends</strong>. Choosing a hose for that duty is mostly choosing the tube, and then making sure the static the flow generates has somewhere to go.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The tube does the work.',
      anchor: 'tube',
    },
    {
      type: 'paragraph',
      html: 'Our bulk material suction and delivery hose (A361) is built for dry and slurried abrasives: a black <strong>anti-static natural rubber tube</strong> — natural rubber being the classic compound for resisting sliding abrasion — over high-tensile textile plies, a steel helix for suction and anti-static wires, under an abrasion, weather and ozone resistant cover. It is rated 10 bar with a 30 bar burst (SF 3:1), −40 to +70 °C, in 3" and 4". For lighter slurries, and where some chemical resistance is wanted, the MDSE chemical and abrasion PVC hose (PREMFLEX) runs from 1-1/2" to 6" at 3 to 5 bar, −10 to +55 °C.',
    },
    {
      type: 'comparison_table',
      caption: 'Abrasive-duty hose in our range',
      columns: ['Hose', 'Rating', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['A361 bulk material S&D', '10 bar, SF 3:1, anti-static NR tube', '3", 4"', '−40 to +70 °C'], highlight: true },
        { cells: ['PREMFLEX MDSE PVC', '3 – 5 bar by size, SF 3:1', '1-1/2" – 6"', '−10 to +55 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Static, and why it matters with powders.',
      anchor: 'static',
    },
    {
      type: 'paragraph',
      html: 'Dry powders and grit sliding along a hose wall build an electrostatic charge, and in a dusty atmosphere a discharge can ignite the dust or simply give the operator a heavy shock. That is why A361 has both an anti-static tube and anti-static wires. As with any anti-static hose, the path only works if the couplings are bonded to the wires and the couplings are earthed — check continuity when the assembly is made and at every inspection.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Bends are where it wears.',
      anchor: 'bends',
    },
    {
      type: 'paragraph',
      html: 'Abrasive particles travel in straight lines and strike the outside of every bend, so that is where the tube wears through first. Route abrasive hose in long, gentle curves rather than tight ones, support it so it does not sag into a kink, and where a bend cannot be avoided, plan to rotate the hose a quarter turn at intervals so the wear is spread around the tube. A361\'s minimum bend radius is listed at 380 mm on 3" and 550 mm on 4"; staying well above it on abrasive duty buys life.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Sandblast couplings and nozzle holders.',
      anchor: 'sandblast',
    },
    {
      type: 'paragraph',
      html: 'Blasting hose has its own small family of ends. Our sandblast range covers aluminium hose ends with crowfoot faces (3/4" to 1-1/2"), NPSH-threaded nozzle holders (3/4" to 1-1/2"), and nylon hose couplers, female thread adapters and nozzle holders in 1-1/4" and 1-1/2", in yellow or red. Sealfast\'s nozzle holders are <strong>NPSH-threaded (ASME B1.20.7)</strong>, and only one part has a published rating: Sealfast\'s aluminium female NPT crowfoot end, at 110 psi. Confirm the rest for your blast pressure — and the hose still sets the limit.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Blasting hose is a high-energy line.',
      body: 'A blasting hose that separates at a coupling releases air and abrasive at the operator. Pin the couplings, fit whip checks across the joints, use a deadman control at the nozzle, and replace a coupling or a hose end that shows wear at the first sign.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Why is natural rubber used for abrasive hose tubes?',
          answer:
            'Natural rubber resists sliding abrasion well, which is why our bulk material hose A361 uses an anti-static natural rubber tube.',
        },
        {
          question: 'Does bulk material hose need to be anti-static?',
          answer:
            'For dry powders and grit, yes. Flow builds static charge. A361 has an anti-static tube and anti-static wires, which must be bonded to earthed couplings.',
        },
        {
          question: 'What thread do sandblast couplings use?',
          answer:
            'Sealfast\'s aluminium nozzle holders are threaded NPSH (ASME B1.20.7), and one of its crowfoot ends has a female NPT thread. Sunpool does not state a thread for its nylon parts.',
        },
        {
          question: 'Where does abrasive hose wear out first?',
          answer:
            'On the outside of bends, where the particles strike the tube. Route the hose in gentle curves and rotate it periodically to spread the wear.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Abrasive hose and sandblast couplings',
      skus: [
        'IH-IH-A361',
        'IH-IH-PREMFLEX',
        'IH-SB-HOSE-END-WITH-CROWFOOT',
        'IH-SB-NPSH-THREADED-HOSE-END-NOZZLE-HOLDERS',
        'IH-SB-NOZZLE-HOLDER',
        'IH-SB-HOSE-COUPLER',
        'IH-SB-FEMALE-THREAD-ADAPTER',
      ],
    },
    {
      type: 'category_link',
      slug: 'abrasive-hoses',
      label: 'Abrasive and bulk-material hose',
      blurb: 'Bulk material suction and delivery hose and abrasion-resistant PVC hose.',
    },
    {
      type: 'category_link',
      slug: 'sandblast-couplings',
      label: 'Sandblast couplings',
      blurb: 'Hose ends, couplers, thread adapters and nozzle holders, NPSH thread.',
    },

    {
      type: 'cta_block',
      heading: 'Moving abrasive material?',
      body: 'Tell us the material, dry or wet, the bore, the length and the routing. We will quote the hose, the couplings and the continuity-tested assembly.',
      quoteLabel: 'Quote abrasive hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Ratings, compounds, sizes, threads and coupling details checked against our abrasive hose and sandblast coupling listings.',
    },
  ],
}

export default ARTICLE
