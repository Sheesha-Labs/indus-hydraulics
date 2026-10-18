import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Flanged ends on industrial hose, read from the nine industrial flange
 * listings (ASME B16.5 Class 150/300, MSS SP-43 stub ends, the gunmetal dock
 * flange) and the flanged KC, composite and cam and groove parts.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'flanged-hose-connections',
  title: 'Flanged hose connections: ASME B16.5 flange types, classes and faces on industrial hose',
  excerpt:
    'Where a hose meets fixed pipework, it usually meets a flange. The flange types we stock, what Class 150 and 300 mean, RF against FF against RTJ, and the stub-end trick that lets the bolt holes line up.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which flange goes on an industrial hose?',
      answer:
        'Usually an ASME B16.5 flange matched to the pipework it meets: the same size, the same pressure class and the same face. Class 150 and Class 300 are the common classes — our carbon steel flanges are rated 285 psi and 740 psi respectively. The face must match too: raised face (RF) to RF, flat face (FF) to FF, and ring-type joint (RTJ) to RTJ. A lap-joint flange on a stub end can rotate, which makes lining up bolt holes on a hose much easier.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Match three things to the pipework: nominal size, pressure class and face type.',
        'Our ASME B16.5 flanges are rated 285 psi in Class 150 and 740 psi in Class 300, in A105 carbon steel and A182 304 or 316 stainless.',
        'Slip-on, weld neck, socket weld, threaded, flat, blind and lap-joint flanges are all listed, from 1/2" to 24".',
        'A lap-joint flange on an MSS SP-43 stub end rotates freely, so a hose with a flange at each end can be bolted up without twisting it.',
        'Gaskets follow ASME B16.21 for RF and FF faces; an RTJ face takes a ring joint gasket instead.',
      ],
    },
    {
      type: 'lead',
      html: 'Quick couplings suit hoses that are connected and disconnected; fixed pipework, tank nozzles and loading arms are flanged. Where a transfer hose meets them, the hose end carries a flange too — welded to a KC nipple, swaged onto a composite hose tail or forming the back of a cam and groove half. The flange is the one part of the assembly <strong>dictated entirely by the other side</strong>, so the job is to read the pipework correctly and match it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Size, class and face.',
      anchor: 'match',
    },
    {
      type: 'paragraph',
      html: 'An ASME B16.5 flange is defined by its nominal pipe size, its pressure class and its face. The class sets the bolt circle, the bolt count and the thickness, so a Class 300 flange will not bolt to a Class 150 one of the same size. Our listings rate carbon steel flanges at 285 psi in Class 150 and 740 psi in Class 300 — those are the ambient-temperature ratings, and they fall as temperature rises.',
    },
    {
      type: 'comparison_table',
      caption: 'Face types',
      columns: ['Face', 'What it is', 'Mates with'],
      rows: [
        { cells: ['Raised face (RF)', 'A raised ring around the bore carries the gasket', 'RF only'], highlight: true },
        { cells: ['Flat face (FF)', 'Full flat face, gasket across the whole face', 'FF only — common on cast-iron and plastic equipment'] },
        { cells: ['Ring-type joint (RTJ)', 'A machined groove takes a metal ring gasket', 'RTJ only'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never bolt RF to FF on cast equipment.',
      body: 'A raised-face flange bolted to a flat-faced cast-iron or plastic nozzle bends the nozzle flange around the raised ring as the bolts are tightened, and cast flanges crack. Match the face, or use a flat-faced flange on the hose.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Flange types in our range.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'ASME B16.5 Class 150 / 300 flanges, 1/2" – 24"',
      columns: ['Type', 'How it attaches', 'Faces listed'],
      rows: [
        { cells: ['Slip-on', 'Slides over the pipe or tail and is welded', 'RTJ, RF, FF'] },
        { cells: ['Weld neck', 'Butt-welded through a tapered neck', 'RTJ'] },
        { cells: ['Socket weld', 'Pipe seats in a socket and is fillet-welded', 'RTJ, RF, FF'] },
        { cells: ['Threaded', 'Screws onto a threaded pipe or nipple', 'RTJ, RF, FF'] },
        { cells: ['Flat', 'Plain plate flange', 'RF or FF'] },
        { cells: ['Lap joint', 'Loose flange behind a stub end; rotates', 'FF'], highlight: true },
        { cells: ['Blind', 'Closes a flanged end', 'RTJ, RF, FF'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'All are listed in ASTM A105 carbon steel and ASTM A182 304 or 316 stainless. For a hose, the choice is usually between a welded flange on a KC nipple or composite tail — our heavy-duty KC nipples come with a welded Class 150 flange, and our composite hose tails with an ASME B16.5 flange — and a <strong>lap-joint flange on a stub end</strong>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Why stub ends suit hose.',
      anchor: 'stub-ends',
    },
    {
      type: 'paragraph',
      html: 'A hose with a fixed flange at each end has to be twisted to line the bolt holes up at the second end — and a hose installed with a twist loses life from the first pressurisation. A <strong>lap-joint flange</strong> sits loose behind an MSS SP-43 stub end, so it can be rotated to meet the bolt holes while the hose stays straight. Our stub ends are listed in MSS SP-43 Types A, B and C, in carbon steel and 304 or 316 stainless. The stub end carries the seal; the flange only carries the bolts, so it can even be carbon steel behind a stainless stub end.',
    },
    {
      type: 'paragraph',
      html: 'Two more parts complete the shelf: a blind flange to close an end, and a gunmetal dock flange with a male thread for marine and dockside connections.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Gaskets and bolts.',
      anchor: 'gaskets',
    },
    {
      type: 'paragraph',
      html: 'RF and FF faces take a sheet gasket to ASME B16.21, cut to the face type: a ring gasket inside the bolts for RF, a full-face gasket with bolt holes for FF. An RTJ face takes a metal ring joint gasket in its groove instead — the ring gaskets on our flow iron shelf are a separate subject. Use a new gasket every time the joint is broken, and tighten bolts in a cross pattern so the gasket compresses evenly.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the pressure rating of a Class 150 flange?',
          answer:
            'Our ASME B16.5 carbon steel flanges are listed at 285 psi in Class 150 and 740 psi in Class 300, at ambient temperature. Ratings fall as temperature rises.',
        },
        {
          question: 'Can a Class 150 flange bolt to a Class 300 flange?',
          answer:
            'No. The class sets the bolt circle and bolt count, so flanges of different classes do not match even at the same nominal size.',
        },
        {
          question: 'Why use a lap-joint flange on a hose?',
          answer:
            'Because it rotates on its stub end, so the bolt holes can be lined up without twisting the hose. Our stub ends are MSS SP-43 Types A, B and C.',
        },
        {
          question: 'Which gasket does a raised-face flange take?',
          answer:
            'A ring gasket to ASME B16.21 that sits inside the bolt circle on the raised face. A flat-face flange takes a full-face gasket; an RTJ flange takes a metal ring joint gasket.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Industrial flanges',
      skus: [
        'IH-FLG-SLIP-ON-FLANGE',
        'IH-FLG-WELDING-NECK-FLANGE',
        'IH-FLG-SOCKET-WELD-FLANGE',
        'IH-FLG-THREADED-FLANGE',
        'IH-FLG-LAP-JOINT-FLANGE',
        'IH-FLG-STUB-END-FLANGE',
        'IH-FLG-BLIND-FLANGE',
        'IH-FLG-DOCK-FLANGE-X-MALE-THREAD',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Flanged hose ends',
      skus: ['IH-KC-KC-X-FIXED-FLANGE', 'IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE', 'IH-SPC-FA-150'],
    },
    {
      type: 'category_link',
      slug: 'industrial-flanges',
      label: 'Industrial flanges',
      blurb: 'ASME B16.5 Class 150/300 flanges, MSS SP-43 stub ends and dock flanges, 1/2" to 24".',
    },
    {
      type: 'category_link',
      slug: 'kc-nipple-fittings',
      label: 'KC nipples with flanges',
      blurb: 'Heavy-duty KC nipples with welded Class 150 flanges, 2" to 12".',
    },

    {
      type: 'cta_block',
      heading: 'Matching a hose to a flanged nozzle?',
      body: 'Send the flange size, class and face from the nozzle — or a photograph with the markings — and the hose. We will quote the flanged hose end and the gaskets.',
      quoteLabel: 'Quote flanged hose ends',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Flange types, classes, ratings, faces and materials checked against our industrial flange listings.',
    },
  ],
}

export default ARTICLE
