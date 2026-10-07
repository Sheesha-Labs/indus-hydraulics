import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Bauer and ring lock, read from the 10 Bauer and 4 ring lock listings: sizes,
 * the lever ring, flange backs to DIN 2501 PN 10, and what sets the pressure rating.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bauer-couplings-explained',
  title: 'Bauer couplings explained: the lever ring, the ball joint and ring lock lookalikes',
  excerpt:
    'Bauer couplings join irrigation, slurry and dewatering lines with a lever, and tolerate a few degrees of misalignment while they do it. What each part does, the sizes, and why ring lock is not a Bauer.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a Bauer coupling?',
      answer:
        'A Bauer coupling is a lever-locked quick coupling for water, irrigation and slurry lines. The male half has a rounded tip; the female half has a sealing seat and a lever ring with two handles. Push the male in, swing the levers over, and the ring clamps the joint. Because the tip seats like a ball in a cup, the joint tolerates some misalignment, which suits pipe and hose laid across uneven ground. Our Bauer-type couplings run from 2" to 8", and to 12" with hose shanks.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Bauer is male-and-female: a rounded male tip, and a female seat carrying the gasket and the lever ring.',
        'The lever ring is a separate part and the usual one to wear; our listings carry it as a spare from 2" to 8".',
        'Our Bauer-type couplings are zinc-plated carbon steel with a Buna-N gasket, Viton or EPDM on request. Sealfast publishes no working pressure for them, so we confirm it for your duty.',
        'Backs come as hose shanks (2"–12"), male threads, or bolted flanges to the DIN 2501 PN 10 pattern (2"–8").',
        'Ring lock looks similar and is not directly interchangeable with Bauer — confirm half against half before pairing.',
      ],
    },
    {
      type: 'lead',
      html: 'Bauer is the coupling of the field and the dewatering site: the one on irrigation laterals, slurry tankers and the lay-flat and suction lines that get moved every day. It locks with a lever rather than a thread, and the male tip seats like a ball in a cup, so a line laid across rough ground does not have to be perfectly straight at every joint. What it does not tolerate is <strong>mixing patterns</strong> — and there are several couplings that look like a Bauer from three metres away.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Three parts, one lever.',
      anchor: 'parts',
    },
    {
      type: 'paragraph',
      html: 'A Bauer joint is a male half, a female half and a lever ring. The <strong>male</strong> is a cylindrical tip with a rounded nose. The <strong>female</strong> is an open ring with an internal seat and the gasket. The <strong>lever ring</strong>, mounted on the female, carries two handles; swung over, it draws the male tip into the seat and holds it there. The gasket is on the female end — Buna-N as standard in our range, with Viton or EPDM where the medium calls for it.',
    },
    {
      type: 'comparison_table',
      caption: 'Our Bauer-type range',
      columns: ['Part', 'Back end', 'Sizes'],
      rows: [
        { cells: ['Male / female with hose shank', 'Barbed shank for hose bands', '2" – 12"'], highlight: true },
        { cells: ['Male / female, threaded', 'Male NPT or BSP', '2" – 8"'] },
        { cells: ['Male / female, flanged', 'Bolted flange, DIN 2501 PN 10 pattern', '2" – 8"'] },
        { cells: ['Complete sets', 'Shank, threaded or flanged pairs', '2" – 12" (shank), 2" – 8" (others)'] },
        { cells: ['Lever ring (spare)', '—', '2" – 8"'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Rating and material.',
      anchor: 'rating',
    },
    {
      type: 'paragraph',
      html: 'Our Bauer-type couplings are zinc-plated carbon steel. Sealfast does not publish a working pressure for them, so tell us the pressure and the medium and we will confirm the rating before you order. They interchange with the Bauer GmbH pattern and with the Perrot and Selecta couplings made to it. Whatever the coupling is rated to, a shank held by hose bands is limited by the bands and the hose, and an assembly should be marked at its weakest part.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Zinc plating is the corrosion protection, and it wears.',
      body: 'A Bauer half dragged through slurry and left in the sun loses its plating at the tip and inside the lever ring first. Rinse the joint, keep the gasket out of direct sun when the line is stored, and replace a lever ring that no longer pulls the tip fully home rather than levering harder.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Ring lock is not Bauer.',
      anchor: 'ring-lock',
    },
    {
      type: 'paragraph',
      html: 'Ring lock couplings use the same idea — a male tip, a female seat and a lever ring — and our range is 2" to 8" zinc-plated steel, again with no published working pressure. They are <strong>not directly interchangeable</strong> with Bauer. A ring lock male will sit in a Bauer female closely enough to fool someone in a hurry and then leak or part under pressure. If a site runs both, mark the halves and keep the spares separate.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Where Bauer fits, and where something else does.',
      anchor: 'where-it-fits',
    },
    {
      type: 'paragraph',
      html: 'Bauer earns its place on lines that are laid, moved and re-laid: irrigation, slurry spreading, temporary dewatering. For a fixed pump outlet or a tanker connection, cam and groove is the more common choice and connects by hand without a lever; for fire and large-bore water service, a symmetrical Storz head removes the male-female question entirely. The coupling should match what the rest of the site already runs, because the cost of a second pattern is paid every time a hose arrives with the wrong half.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Are Bauer and ring lock couplings interchangeable?',
          answer:
            'No. They work the same way but are made to different patterns. Our ring lock listings say so plainly: similar to Bauer, not directly interchangeable — confirm before pairing.',
        },
        {
          question: 'What pressure is a Bauer coupling rated for?',
          answer:
            'Sealfast does not publish a working pressure for its Bauer-type couplings. Tell us the pressure and the medium when you enquire and we will confirm the rating with the manufacturer. The hose and the shank clamping may limit the assembly to less.',
        },
        {
          question: 'Can I replace just the lever ring?',
          answer:
            'Yes. The lever ring is listed as a spare part from 2" to 8", and it is usually the first component to wear.',
        },
        {
          question: 'What flange does a flanged Bauer coupling have?',
          answer:
            'Our flanged Bauer-type couplings have a bolted flange back to the DIN 2501 PN 10 pattern, from 2" to 8".',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Bauer-type couplings and ring lock',
      skus: [
        'IH-BC-SHANK-COMPLETE',
        'IH-BC-SHANK-MALE',
        'IH-BC-SHANK-FEMALE',
        'IH-BC-FLANGE-SET',
        'IH-BC-MALE-MALE',
        'IH-BC-LEVER-RING',
        'IH-RL-HOSE-SHANK-FEMALE-X-MALE-COUPLING-COMPLE',
        'IH-RL-LEVER-RINGS',
      ],
    },
    {
      type: 'category_link',
      slug: 'bauer-type-couplings',
      label: 'Bauer-type couplings',
      blurb: 'Shank, threaded and flanged halves, sets and lever rings, 2" to 12".',
    },
    {
      type: 'category_link',
      slug: 'ring-lock-couplings',
      label: 'Ring lock couplings',
      blurb: 'Zinc-plated steel ring lock halves and lever rings, 2" to 8".',
    },
    {
      type: 'category_link',
      slug: 'water-suction-delivery-hoses',
      label: 'Water suction and delivery hose',
      blurb: 'Rubber and PVC suction and delivery hose for irrigation and dewatering.',
    },

    {
      type: 'cta_block',
      heading: 'Matching a Bauer line already on site?',
      body: 'Send a photograph of both halves and the hose bore. We will confirm whether it is Bauer or ring lock and quote the halves, the lever rings and the gaskets.',
      quoteLabel: 'Quote Bauer couplings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Sizes, materials, ratings and flange pattern checked against our Bauer-type and ring lock listings.',
    },
  ],
}

export default ARTICLE
