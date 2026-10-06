import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Fibre rope materials, read from the 21 fibre rope and twine listings and
 * their variant rows: material, construction, size range and minimum
 * breaking loads on the ISO and MEG4 bases. Weights are not quoted because the
 * rows do not state their unit. Two rows carry obvious typos (nylon 85 mm's
 * inch size, double-braid PP 104 mm's breaking load) and are not used.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fibre-rope-materials-compared',
  title: 'Fibre rope materials compared: polypropylene, polyethylene, polyester, nylon and HMPE',
  excerpt:
    'At the same diameter, an HMPE rope on our listings breaks at about four times the load of a polyolefin or nylon rope. How the five fibre rope materials differ in strength, stretch, buoyancy and weathering, and how to read an ISO or MEG4 breaking load.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which fibre rope material is strongest?',
      answer:
        'HMPE (UHMWPE) by a wide margin. On our listings a 40 mm HMPE rope has a minimum breaking load of 1,329 kN on the ISO basis, against 350 kN for high-tenacity nylon (dry), 330 kN for polyester/polyolefin mixed rope and 300 kN for high-tenacity PP/PE. Strength is only one property, though: nylon stretches to absorb shock, polyester resists sun and abrasion, and polypropylene floats cheaply.',
    },
    {
      type: 'key_takeaways',
      items: [
        'HMPE is the strongest rope for its size: 1,329 kN at 40 mm on our ISO rows, about four times the polyolefin and nylon ropes.',
        'Nylon stretches the most and absorbs shock, but it is weaker wet — and its MEG4 figure is lower than its dry ISO figure.',
        'Polyester is strong, low-stretch and weathers well; it sinks.',
        'Polypropylene and polyethylene are light and float, at the lowest strength and UV resistance.',
        'Listed figures are minimum breaking loads. The working load is a fraction of them, set by the safety factor for the job.',
      ],
    },
    {
      type: 'lead',
      html: 'Two ropes of the same diameter can differ fourfold in strength, float or sink, stretch a little or a lot, and last years or months in the sun. Diameter tells you very little; <strong>the fibre tells you almost everything</strong>, and the construction — laid, plaited or braided — adds the rest. Choose the fibre for the job first.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Five fibres.',
      anchor: 'fibres',
    },
    {
      type: 'comparison_table',
      caption: 'Fibre rope materials on our listings',
      columns: ['Fibre', 'Character', 'Floats?'],
      rows: [
        { cells: ['Polypropylene (PP, incl. danline)', 'Light and cheap; lowest strength; degrades in sunlight', 'Yes'] },
        { cells: ['Polyethylene (PE)', 'Light, slippery, cheap; similar duty to PP', 'Yes'] },
        { cells: ['Polyester', 'Strong, low stretch, good UV and abrasion resistance', 'No'] },
        { cells: ['Nylon (polyamide)', 'High stretch, absorbs shock loads; weaker when wet', 'No'] },
        { cells: ['HMPE (UHMWPE)', 'Highest strength for size, very low stretch; heat-sensitive', 'Yes'], highlight: true },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Strength at the same size.',
      anchor: 'strength',
    },
    {
      type: 'comparison_table',
      caption: '40 mm ropes, minimum breaking load as listed',
      columns: ['Rope', 'ISO basis', 'MEG4 basis'],
      rows: [
        { cells: ['HMPE (UHMWPE)', '1,329 kN', '1,196 kN'], highlight: true },
        { cells: ['Nylon, high tenacity', '350 kN (dry)', '268 kN'] },
        { cells: ['Polyester / polyolefin mixed', '330 kN', '297 kN'] },
        { cells: ['PP / PE polyolefin, high tenacity', '300 kN', '270 kN'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Most of our mooring rope listings give two breaking loads per size. One is to the ISO rope standard; the other is labelled MEG4, after OCIMF\'s Mooring Equipment Guidelines, and on our rows it runs about ten per cent lower for HMPE, polyester mixed and PP/PE ropes. Nylon is the exception: its ISO figure is quoted dry, and nylon loses strength when wet, so its MEG4 figure sits well below — 268 kN against 350 kN at 40 mm. When a mooring plan specifies a line by breaking load, check which basis it uses before comparing ropes.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Construction.',
      anchor: 'construction',
    },
    {
      type: 'prose',
      html: '<p>The same fibre can be made up several ways, and our listings cover most of them:</p><ul><li><strong>Three-strand twisted (laid) rope</strong> — polypropylene from 4 mm to 30 mm, polyethylene from 6 mm to 20 mm, danline and coloured PE from 4 mm to 60 mm. Easy to splice, it rotates under load.</li><li><strong>Eight-strand plaited rope and hawsers</strong> — braided rope from 3 mm to 20 mm, and mooring hawsers from 40 mm to 120 mm in PE, PP, polyester or nylon. Torque-balanced, so it does not kink.</li><li><strong>Sixteen-strand braid</strong> — 3 mm to 30 mm, for smaller, smoother lines.</li><li><strong>Double braid</strong> — a braided core inside a braided cover, listed in nylon, polyester and polypropylene multifilament.</li><li><strong>Combination rope</strong> — fibre over a steel wire core, from 36 mm (190 kN) to 54 mm (562 kN), or over a lead or chain core for weight.</li></ul><p>Within one construction the fibre still sets the strength: in our double-braid rows, 24 mm nylon is listed at 19.4 t, polyester at 13.6 t and polypropylene multifilament at 7.5 t.</p>',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Choosing the fibre.',
      anchor: 'choosing',
    },
    {
      type: 'paragraph',
      html: 'For mooring tails and towing, where shock loads must be absorbed, nylon\'s stretch is the point. For lines that must stay a fixed length and survive years of sun — static moorings, lashings, guys — polyester. For floating lines, rescue and general utility on a budget, polypropylene or polyethylene. For maximum strength at minimum weight, HMPE, provided it is kept off hot surfaces and sharp edges: it melts at around 150 °C and creeps under sustained load. Lines are made off on fittings rated for them — see <a href="/blog/types-of-mooring-bollards">types of mooring bollards</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Breaking load is not working load.',
      body: 'Every figure on our fibre rope listings is a minimum breaking load. The working load is a fraction of it, set by the safety factor for the application, and knots, splices, wear and UV damage reduce the strength further. Fibre rope from this shelf is general-purpose and mooring rope; it is not a certified lifting sling.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How much stronger is HMPE rope than nylon or polypropylene?',
          answer:
            'About four times at the same diameter on our listings: a 40 mm HMPE rope breaks at 1,329 kN on the ISO basis, against 350 kN for high-tenacity nylon (dry) and 300 kN for high-tenacity PP/PE.',
        },
        {
          question: 'Why is nylon used for mooring tails?',
          answer:
            'It stretches more than any other common rope fibre, so it absorbs shock loads from swell and passing ships. It is weaker when wet, which its MEG4 rating reflects.',
        },
        {
          question: 'Does polypropylene rope float?',
          answer:
            'Yes. Polypropylene and polyethylene float, as does HMPE. Polyester and nylon sink.',
        },
        {
          question: 'What is the difference between ISO and MEG4 breaking loads?',
          answer:
            'They are two bases for the rope\'s minimum breaking load. On our listings the MEG4 figure is about ten per cent below the ISO figure for most ropes, and further below for nylon, whose ISO figure is dry.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Fibre rope',
      skus: [
        'IH-LR-FR-HMPEUR',
        'IH-LR-FR-NPRHT',
        'IH-LR-FR-PPMR2',
        'IH-LR-FR-PPPEPRHT',
        'IH-LR-FR-DBRPPNPEU',
        'IH-LR-FR-8HAW',
        'IH-LR-FR-DAN',
        'IH-LR-FR-CRC',
      ],
    },
    {
      type: 'category_link',
      slug: 'fibre-rope-twine',
      label: 'Fibre rope and twine',
      blurb: '21 ropes and twines in PP, PE, polyester, nylon and HMPE.',
    },
    {
      type: 'category_link',
      slug: 'bollards-mooring',
      label: 'Bollards and mooring',
      blurb: 'Fittings to make mooring lines off on.',
    },

    {
      type: 'cta_block',
      heading: 'Choosing rope for a mooring or a job?',
      body: 'Send the duty, the diameter or breaking load required and the basis (ISO or MEG4), the length and any certification. We will quote the fibre and construction that fit.',
      quoteLabel: 'Quote fibre rope',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Materials, constructions, size ranges and ISO and MEG4 breaking loads checked against our fibre rope listings.',
    },
  ],
}

export default ARTICLE
