import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Marine fenders, read from the 17 family listings and their variant rows:
 * fender type, size ranges and, where listed, energy absorption and reaction
 * force. Pneumatic and foam figures are quoted one size at a time and not
 * compared, because the deflection they were rated at is not on the listing.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'types-of-marine-fenders',
  title: 'Types of marine fenders: cone, cell, arch, cylindrical, pneumatic and foam',
  excerpt:
    'A fender turns a berthing ship\'s energy into a reaction force the hull and the quay can take. The main fender types, where each is used, the sizes we list and the two numbers that decide the choice.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of marine fender?',
      answer:
        'Fixed fenders bolted to the quay — cone, cell, arch, leg (element), D, square, W and M profiles, and roller fenders at corners — and floating fenders — pneumatic and foam-filled — that hang or float between ship and quay or between two ships. Cone and cell fenders serve large berths; arch fenders medium berths; cylindrical, D and square fenders small craft and tugs; pneumatic and foam fenders ship-to-ship work and temporary berths.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A fender is chosen on two numbers: the energy it absorbs (kNm) and the reaction force it passes to hull and quay (kN).',
        'Cone and cell fenders are the large-berth types: our cone fenders run 500H to 2000H and cell fenders 500H to 3000H.',
        'Arch fenders bolt straight to the quay face; our arch listings run from 150H × 1000 mm to 400H × 3500 mm.',
        'Pneumatic and foam-filled fenders float. Both are listed from 300 × 500 mm to 4500 × 9000 mm.',
        'Berthing energy is normally calculated to PIANC fender design guidance; the fender is then picked from the maker\'s performance curve.',
      ],
    },
    {
      type: 'lead',
      html: 'A ship coming alongside at a fraction of a metre per second still carries an enormous amount of energy, and all of it has to go somewhere. A fender <strong>absorbs that energy by deflecting</strong>, and the price is a reaction force pushed back into the hull and the quay structure. Every fender type is a different trade between how much energy it takes, how hard it pushes back and where it can be mounted.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Fender types and where they go.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Fender types on our listings',
      columns: ['Type', 'Typical use', 'Sizes we list'],
      rows: [
        { cells: ['Cone (SCB)', 'Large berths, usually with a steel frontal panel', '500H to 2000H'], highlight: true },
        { cells: ['Cell (SCA)', 'Large berths and high-energy quays, with a frontal panel', '500H to 3000H'] },
        { cells: ['Arch and arch DA', 'Medium berths, bolted directly to the quay', '150H to 400H (arch); 150H to 1000H (DA)'] },
        { cells: ['Leg (element)', 'Modular fenders for quays and dolphins', '300H to 1600H'] },
        { cells: ['Cylindrical', 'Tugs, small berths, hung on chain or bar', '150 × 75 to 2000 × 1000 mm'] },
        { cells: ['D, square, W, M, wing', 'Boats, pontoons and tug sides', 'D and square 100 to 500 mm; W and M to 3,000 mm long'] },
        { cells: ['Roller', 'Corners and entrances, guiding vessels past', '600 × 200 to 2400 × 800 mm'] },
        { cells: ['Pneumatic', 'Floating; ship-to-ship transfer, temporary berths', '300 × 500 to 4500 × 9000 mm'] },
        { cells: ['Foam-filled', 'Floating; stays afloat if the skin is cut', '300 × 500 to 4500 × 9000 mm'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Energy and reaction.',
      anchor: 'performance',
    },
    {
      type: 'paragraph',
      html: 'The two performance figures for any fender are the energy it absorbs at its rated deflection and the reaction force it generates while doing so. The design aim is to take the berthing energy with a reaction low enough for the quay and for the hull plating, which is why large fenders are fitted with steel frontal panels that spread the force over a bigger area. Our pneumatic, foam and cylindrical listings give both figures per size — the 1000 × 2000 mm pneumatic fender, for example, is listed at 38 kNm and 217 kN. Those are the maker\'s figures at its own rated deflection, which differs between fender types, so compare types on their datasheet performance curves rather than on one listed point.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Fixed fenders.',
      anchor: 'fixed',
    },
    {
      type: 'paragraph',
      html: 'Cone and cell fenders are moulded rubber units bolted to the quay with a steel panel in front; cone fenders are generally valued for their behaviour at berthing angles, cell fenders for high energy. Arch fenders bolt directly to the quay face without a panel and suit small and medium vessels. Leg or element fenders are modular units that can be combined along a quay or on a dolphin. The profile fenders — D, square, W, M and wing — are extruded or moulded sections fixed along pontoons, small quays and the sides of tugs, and roller fenders turn as a vessel brushes past a corner or a lock entrance.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Floating fenders.',
      anchor: 'floating',
    },
    {
      type: 'paragraph',
      html: 'Pneumatic fenders are air-filled rubber bodies that float between two ships or between ship and quay, and they are the standard fender for ship-to-ship transfers. Our sling-type pneumatic fenders run from 300 × 500 mm to 4500 × 9000 mm (diameter × length). Foam-filled fenders do the same job with a closed-cell foam core under an elastomer skin, so a cut or puncture does not sink them; ours are listed in the same size span. Floating fenders are moored with chains or slings to fittings rated for the load, which on a quay usually means the bollards — see <a href="/blog/types-of-mooring-bollards">types of mooring bollards</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Size the fender to the berthing, not to the vessel length alone.',
      body: 'Berthing energy depends on the vessel\'s displacement, its approach speed and how the berth is laid out, and speed counts twice because energy rises with its square. A fender that is ample for slow, sheltered berthing can be overloaded by the same ship arriving faster in a swell. Use the design berthing energy for the site, then choose the fender from its performance curve.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'For fixed fenders, send the fender type and size, the quay construction and the fixing arrangement, and whether frontal panels and chains are needed. For floating fenders, send the size, the vessels involved and the mooring arrangement. Where the design energy is not yet known, send the largest vessel\'s displacement, the expected approach speed and the berth layout, and we will match a fender family to it.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a cone fender and a cell fender?',
          answer:
            'Both are large moulded rubber fenders used with steel frontal panels on big berths. Cone fenders are generally chosen for their performance at berthing angles; cell fenders for high energy absorption. Our cone fenders run 500H to 2000H and cell fenders 500H to 3000H.',
        },
        {
          question: 'Which fenders are used for ship-to-ship transfer?',
          answer:
            'Floating fenders — normally pneumatic. Foam-filled fenders are an alternative that stays afloat if punctured.',
        },
        {
          question: 'What do energy absorption and reaction force mean on a fender?',
          answer:
            'Energy absorption is how much berthing energy the fender takes at its rated deflection, in kNm. Reaction force is the force it passes to the hull and quay while doing so, in kN.',
        },
        {
          question: 'Where are roller fenders used?',
          answer:
            'At quay corners, lock entrances and narrow passages, where they turn and guide a vessel past rather than stopping it.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Marine fenders',
      skus: [
        'IH-LR-MF-SCFSCB',
        'IH-LR-MF-SCRFSCA',
        'IH-LR-MF-AFDA',
        'IH-LR-MF-CFCYL',
        'IH-LR-MF-DF',
        'IH-LR-MF-RF',
        'IH-LR-MF-PFS',
        'IH-LR-MF-FFPF',
      ],
    },
    {
      type: 'category_link',
      slug: 'marine-fenders',
      label: 'Marine fenders',
      blurb: '17 fixed and floating fender families with size tables.',
    },
    {
      type: 'category_link',
      slug: 'bollards-mooring',
      label: 'Bollards and mooring',
      blurb: 'Ship and dock bollards, cleats, fairleads and chocks.',
    },

    {
      type: 'cta_block',
      heading: 'Fitting out a berth or a vessel?',
      body: 'Send the fender type and size, or the vessel and berth details if the fender is still to be chosen. We will quote fenders with fixings or chains.',
      quoteLabel: 'Quote fenders',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Fender types, size ranges, energy absorption and reaction force checked against our marine fender listings.',
    },
  ],
}

export default ARTICLE
