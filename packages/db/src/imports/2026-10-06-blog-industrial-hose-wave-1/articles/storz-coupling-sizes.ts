import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Storz, read from the 26 Storz listings: DIN 14301, lug distance as the size,
 * the two gasket colours, materials, the FDC fittings and the one published rating.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'storz-coupling-sizes',
  title: 'Storz coupling sizes: lug distance, gaskets and the parts that make a connection',
  excerpt:
    'A Storz coupling has no male or female, and its size is the distance between the lugs, not the bore. How to identify one, which gasket goes in it, and what the fire-connection versions add.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How are Storz coupling sizes measured?',
      answer:
        'By the lug distance — the distance across the two hook-shaped lugs on the coupling face — not by the hose bore. Two Storz heads connect only if their lug distance matches. Our listings give 115 mm for a 4" Storz head, 148 mm for 5" and 160 mm for 6". Because every Storz head is the same on both sides, there is no male or female: any two heads of the same size lock together with a quarter turn.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Storz is symmetrical: identical heads lock together with a quarter turn, so there is no male or female half to mismatch.',
        'Size is the lug distance — 115 mm for 4", 148 mm for 5" and 160 mm for 6" on our listings — not the bore of the hose.',
        'The gasket sets the duty: grey for suction, black for pressure.',
        'Our Storz heads and adapters are listed to DIN 14301; the only working pressure Sunpool publishes is 250 psi, for the fire department connection 30° elbow.',
        'The tail is a choice: long hose shank for binding or crimping, or a male, female or swivel thread in NPT, BSP or NST.',
      ],
    },
    {
      type: 'lead',
      html: 'Storz is the coupling that solves the half-mismatch problem by not having halves. Every head carries the same pair of lugs and the same gasket seat, so any two heads of one size lock together with a quarter turn — no thread to cross, no male end missing from the van. That is why it is the standard large-bore fire and water coupling across much of Europe, and on a great many fire department connections elsewhere. The one thing it asks is that you <strong>size it by the lugs</strong>, because the bore on the hose tells you very little.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Size is the lug distance.',
      anchor: 'lug-distance',
    },
    {
      type: 'paragraph',
      html: 'A Storz head is identified by the distance across its two lugs — the hook-shaped claws that engage the matching ramps on the opposite head. Heads with different lug distances cannot lock, whatever the hose behind them. Measure across the lugs with a caliper and the size is settled; measure the hose bore and you may land one size out, because the same lug distance is fitted to more than one hose diameter and adapters change the bore freely.',
    },
    {
      type: 'comparison_table',
      caption: 'Lug distance on our large Storz heads',
      columns: ['Nominal size', 'Lug distance', 'Typical use in our range'],
      rows: [
        { cells: ['4"', '115 mm', 'Fire department connections, adapters with safety latch'] },
        { cells: ['5"', '148 mm', 'Large-diameter supply hose, FDC adapters'], highlight: true },
        { cells: ['6"', '160 mm', 'Adapters and couplings with safety latch'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Smaller heads — our aluminium, brass and stainless adapters run from 1" up — are sized the same way. Reducers join two Storz sizes directly; our range lists 3" × 2" and 3" × 2-1/2".',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Grey gasket, black gasket.',
      anchor: 'gaskets',
    },
    {
      type: 'paragraph',
      html: 'The seal is a lip gasket in the face of each head, and it comes in two forms that look almost the same. A <strong>suction gasket</strong> (grey) is built to hold against vacuum on a pump inlet; a <strong>pressure gasket</strong> (black) is built for delivery. Both are NBR in our range and both come from 1" to 12". Fitting a pressure gasket on a suction line is a common reason a pump will not hold its prime even though every coupling is locked.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Keep both colours in the kit.',
      body: 'Storz gaskets are cheap and they wear at the lip, which is the only sealing surface on the joint. A coupling that has to be pushed hard to lock, or that weeps at the face, usually needs a gasket rather than a new head.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Heads, tails and threads.',
      anchor: 'tails',
    },
    {
      type: 'paragraph',
      html: 'Behind the face, a Storz part is defined by its tail. A <strong>long-shank coupling</strong> takes a hose — the long shank is there for binding with wire or for crimping, and our listings offer it in forged and cast aluminium, brass and stainless. A <strong>thread adapter</strong> puts a Storz face on equipment: male or female, in NPT, BSP or NST, and a swivel female thread where the head has to turn without unscrewing the port. Caps and the forged 3-segment clamp complete the set.',
    },
    {
      type: 'comparison_table',
      caption: 'Materials in our Storz range',
      columns: ['Material', 'Listed for'],
      rows: [
        { cells: ['Forged aluminium 6061-T6', 'Heads, adapters, FDC fittings, safety-latch couplings'], highlight: true },
        { cells: ['Cast aluminium A356', 'Long-shank couplings and thread adapters, 1" to 6"'] },
        { cells: ['Brass, gunmetal (LG2)', 'Thread adapters and long-shank couplings'] },
        { cells: ['Stainless 304 / 316', 'Thread adapters and long-shank couplings, 1-1/2" to 5"'] },
      ],
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ratings, latches and fire connections.',
      anchor: 'ratings',
    },
    {
      type: 'paragraph',
      html: 'Our Storz heads and adapters are listed to DIN 14301, the German Storz connection standard. Sunpool does not publish a working pressure for them, so we confirm it for your duty. The fire department connection (FDC) fittings, in 4" and 5" Storz with a 4" or 5" female NPT or BSP thread, straight or at 30°, are UL listed, and the FDC 30° elbow is rated to 250 psi. A <strong>safety latch</strong> — a stainless catch that stops the heads rotating apart — is fitted on our larger adapters and couplings, and it is worth having anywhere a hose is dragged or vibrates.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A coupling rating is not a hose rating.',
      body: 'A Storz head does not raise the rating of the hose behind it. The assembly is rated at its weakest part — usually the hose, sometimes the binding on the shank.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Do Storz couplings have a male and a female?',
          answer:
            'No. Storz heads are symmetrical — every head has the same lugs and gasket seat — so any two heads of the same lug distance lock together with a quarter turn.',
        },
        {
          question: 'What is the difference between the grey and black Storz gasket?',
          answer:
            'Grey is the suction gasket, made to hold against vacuum on a pump inlet. Black is the pressure gasket for delivery. Our listings carry both in NBR, 1" to 12".',
        },
        {
          question: 'How do I measure a Storz coupling?',
          answer:
            'Measure across the two lugs on the face. Our listings give 115 mm for 4", 148 mm for 5" and 160 mm for 6". Do not size a Storz head from the hose bore.',
        },
        {
          question: 'Can a Storz head take an NPT or BSP thread?',
          answer:
            'Yes. Thread adapters put a Storz face on male or female NPT, BSP or NST threads, and swivel female versions let the head turn on the port.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Storz heads, adapters and gaskets',
      skus: [
        'IH-STZ-STORZ-COUPLING-LONG-SHANK',
        'IH-STZ-STORZ-ADAPTER-MALE-THREAD',
        'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD',
        'IH-STZ-STORZ-ADAPTER-X-SWIVEL-FEMALE-THREAD',
        'IH-STZ-STORZ-COUPLING-WITH-SAFETY-LATCH',
        'IH-STZ-STORZ-FDC-UL-LISTED-PAINTED',
        'IH-STZ-STORZ-SUCTION-GASKET-GRAY',
        'IH-STZ-STORZ-PRESSURE-GASKET-BLACK',
      ],
    },
    {
      type: 'category_link',
      slug: 'storz-couplings',
      label: 'Storz couplings and adapters',
      blurb: 'DIN 14301 heads, thread adapters, FDC fittings and gaskets, 1" to 6".',
    },
    {
      type: 'category_link',
      slug: 'water-suction-delivery-hoses',
      label: 'Water suction and delivery hose',
      blurb: 'Rubber and PVC suction hose to put behind a Storz head.',
    },

    {
      type: 'cta_block',
      heading: 'Not sure which Storz size you have?',
      body: 'Send the lug distance, or a photograph of the face beside a ruler, and the thread or hose it has to meet. We will name the head and the gasket.',
      quoteLabel: 'Quote Storz couplings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Lug distances, materials, ratings and standards checked against our Storz listings.',
    },
  ],
}

export default ARTICLE
