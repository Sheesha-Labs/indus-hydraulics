import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Hose nipples by any other name: KC, shank, pin lug and menders, read from the
 * 13 KC, 6 shank, 3 pin-lug and 3 mender listings plus the KC ferrules and
 * sleeves on the clamps shelf.
 *
 * KC is described as a combination nipple, never as a Korean pattern: the
 * listings still say "Korean / Asian industrial standard", which the
 * 2026-10-06 shelf-copy fix already corrected on the category.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'kc-nipples-and-shank-couplings',
  title: 'KC nipples and shank couplings: the plain hose end, and how to make it hold',
  excerpt:
    'A serrated tail, a thread or a flange, and a clamp: KC nipples, shank couplings, pin-lug couplings and menders are the simplest hose ends there are. Which one to use, and the clamp that decides the rating.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a KC nipple?',
      answer:
        'A KC nipple is a combination hose nipple: a serrated tail that goes inside the hose, and a threaded or flanged end that connects to pipe, a valve or another coupling. It has no quick-release face of its own. The joint is made by the clamp, ferrule or sleeve over the hose, which is why the clamp decides how much pressure the assembly holds. Our heavy-duty KC nipples are SCH40 wall, 1" to 6", rated 300 psi.',
    },
    {
      type: 'key_takeaways',
      items: [
        'KC (combination) nipples are a serrated tail with an NPT, BSPT or flanged end; there is no coupling face.',
        'The rating of a nipple is not the rating of the joint: the clamp, ferrule or sleeve over the hose decides that.',
        'Our heavy-duty KC nipples are SCH40 wall with a longer tail, 1" to 6", rated 300 psi, in carbon steel, 304 or 316 stainless.',
        'Shank couplings pair a male and female nipple into a threaded union: steel long shank for heavier lines, brass short shank for light service.',
        'A mender joins two lengths of the same hose; it is a repair, so mark the hose and plan the replacement.',
      ],
    },
    {
      type: 'lead',
      html: 'The simplest hose end there is has no moving parts: a tail with serrations that grips the inside of the hose, and on the other end a thread or a flange. KC nipples, shank couplings, pin-lug couplings and hose menders are all variations on it. They are cheap, they are everywhere, and they are only as good as <strong>what is clamped around the hose</strong> — which is the part that most often goes on as an afterthought.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'KC nipples.',
      anchor: 'kc-nipples',
    },
    {
      type: 'paragraph',
      html: 'A KC nipple is a combination nipple — serrated tail one end, connection the other. Our range runs from a standard KC nipple and a grooved KC nipple (1/2" to 12", carbon steel, 304 or 316 stainless) to a heavy-duty KC nipple with a thicker SCH40 wall and a longer tail (1" to 6", NPT or BSPT, rated 300 psi). Heavy-duty versions also come with a welded Class 150 flange, as a fixed flange or a turnback flange.',
    },
    {
      type: 'comparison_table',
      caption: 'KC nipples and related parts in our range',
      columns: ['Part', 'Sizes', 'Notes from the listing'],
      rows: [
        { cells: ['KC nipple', '1/2" – 12"', 'NPT or BSPT; carbon steel, 304, 316'] },
        { cells: ['Grooved KC nipple', '1/2" – 12"', 'Serrated tail with a clamp groove'] },
        { cells: ['Heavy-duty KC nipple', '1" – 6"', 'SCH40 wall, longer tail, 300 psi'], highlight: true },
        { cells: ['Heavy-duty KC × fixed / turnback flange', '1" – 6"', 'Welded Class 150 flange, 300 psi'] },
        { cells: ['Suction hose coupling', '1-1/2" – 6"', 'Brass, plated steel or aluminium with brass nut; NPT, BSP or NPSM'] },
        { cells: ['206 hose hammer union', '1" – 6"', 'Figure 206 union on a hose tail'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The clamp is the rating.',
      anchor: 'clamp',
    },
    {
      type: 'paragraph',
      html: 'A nipple pushed into a hose and held by a worm-drive band will hold low pressure on a soft hose and not much else. The serrations grip only as hard as the hose is squeezed onto them, and a band applies that squeeze along a narrow line. For anything that matters, use a clamp made for the job: an interlocking or double-bolt clamp sized to the hose outside diameter, a swaged <strong>ferrule for KC and cam-lock shanks</strong> (1/2" to 6"), or a crimped sleeve (1" to 8"). Each of those spreads the grip along the tail, which is what the serrations were designed for.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Clamp to the hose OD, not the nipple size.',
      body: 'Two hoses of the same bore can differ by several millimetres over the cover. Our sleeves for KC and cam-lock shanks are listed by the bore range they fit for each hose size — use that, or measure the outside diameter, before choosing a clamp.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Shank couplings and pin-lug couplings.',
      anchor: 'shank-couplings',
    },
    {
      type: 'paragraph',
      html: 'A <strong>shank coupling</strong> pairs a male and a female nipple into a threaded union, so a hose can be broken without unclamping it. Our steel long-shank nipples (male, female and complete sets, 1/2" to 2") suit heavier transfer lines, where the long shank gives more grip in the hose; brass short-shank nipples (1/2" to 3/4" sizes) suit lighter service. A zinc-plated steel male NPT × hose-barb nipple covers the small sizes, from 1/8" × 1/4" up to 1" × 1". All are rated up to 250 psi in our listings, subject to the clamp.',
    },
    {
      type: 'paragraph',
      html: '<strong>Pin-lug couplings</strong> are the water-service version: an aluminium shank with a brass nut carrying pin lugs for a spanner, 1-1/2" to 6", rated up to 150 psi with a rubber washer in the nut. They are made to be tightened and loosened often, on irrigation and wash-down lines rather than pressure transfer.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Menders: a repair, labelled as one.',
      anchor: 'menders',
    },
    {
      type: 'paragraph',
      html: 'A hose mender is a tube with a serrated tail at each end, used to join two lengths of the same hose after a cut or a burst. Our brass menders run from 1/8" to 3/4" for light hose up to 150 psi, and steel and stainless menders on the KC shelf from 1/2" to 12". A mender restores flow, not the hose\'s original rating — the joint is limited by its two clamps, and the hose either side is the same age as the part that failed.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does KC stand for in a KC nipple?',
          answer:
            'KC refers to a combination nipple — a serrated hose tail combined with a threaded or flanged end. It is a hose-end pattern, not a national standard.',
        },
        {
          question: 'What pressure will a KC nipple hold?',
          answer:
            'Our heavy-duty KC nipples are rated 300 psi, but the joint is rated by the clamp, ferrule or sleeve over the hose and by the hose itself. Rate the assembly at its weakest part.',
        },
        {
          question: 'Should I use a band clamp on a KC nipple?',
          answer:
            'Only on low-pressure, soft hose. For transfer service use an interlocking or bolted clamp sized to the hose OD, or a swaged ferrule or crimped sleeve made for KC shanks.',
        },
        {
          question: 'Is a hose mender a permanent repair?',
          answer:
            'Treat it as a repair, not a restoration. The mender joint is limited by its clamps, and the hose either side has aged with the part that failed.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'KC nipples, shank couplings and menders',
      skus: [
        'IH-KC-KC-NIPPLE',
        'IH-KC-KC-NIPPLE-2',
        'IH-KC-KC-X-FIXED-FLANGE',
        'IH-KC-SUCTION-HOSE',
        'IH-SHK-LONG-SHANK-HOSE-NIPPLE-COMPLETE-SET',
        'IH-HN-MALE-NPT-X-HOSE-BARB-HOSE-NIPPLE',
        'IH-PLS-SHANK-COUPLING-COMPLETE-SET-BRASS-NUT',
        'IH-MND-HOSE-MENDERS',
      ],
    },
    {
      type: 'product_embed',
      heading: 'What holds it on',
      skus: ['IH-CLP-FERRULE-KC-CAMLOCK', 'IH-CLP-SLEEVE-KC-CAMLOCK', 'IH-CLP-INTERLOCKING', 'IH-CLP-DOUBLE-BOLT'],
    },
    {
      type: 'category_link',
      slug: 'kc-nipple-fittings',
      label: 'KC nipple and hose fittings',
      blurb: 'KC nipples, flanged KC, suction couplings and menders.',
    },
    {
      type: 'category_link',
      slug: 'shank-couplings',
      label: 'Shank couplings',
      blurb: 'Steel long-shank and brass short-shank hose nipples.',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'Interlocking, bolted and safety clamps; ferrules and sleeves for KC shanks.',
    },

    {
      type: 'cta_block',
      heading: 'Building a transfer hose with plain ends?',
      body: 'Tell us the hose, its outside diameter and the working pressure. We will quote the nipples and the clamp, ferrule or sleeve that makes the joint hold.',
      quoteLabel: 'Quote hose nipples',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Sizes, materials and ratings checked against our KC, shank, pin-lug and mender listings.',
    },
  ],
}

export default ARTICLE
