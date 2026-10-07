import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The tanker end of the job, read from A420 tanker reeling hose, the A901AG
 * vapour recovery and A901GG oil composite hoses (EN 13765), the four Sealfast
 * dry disconnect listings and the Met-O-Seal and T92H couplings on the
 * metallic shelf.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tanker-loading-and-vapour-recovery-hose',
  title: 'Tanker loading and vapour recovery hose: reeling hose, composite and dry disconnects',
  excerpt:
    'A fuel tanker uses three different hoses and a coupling that must not drip. What a reeling hose is built for, why vapour recovery is composite, and when a dry disconnect earns its price.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What hose does a fuel tanker use?',
      answer:
        'Usually three. A reeling hose on the delivery reel — our A420 is a 17 bar, 1-1/2" hose with an NBR tube for diesel and unleaded petrol and copper anti-static braids. A bottom-loading or discharge hose, often composite. And a vapour recovery hose — our A901AG is a 14 bar composite hose to EN 13765:2015 Type 3. Where spills matter, the coupling is a dry disconnect that closes both halves before they part.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Reeling hose must coil on a drum day after day; A420 is a 17 bar, DN35 / 1-1/2" hose with textile yarn and two copper anti-static braids.',
        'Vapour recovery returns displaced fuel vapour to the tank; our A901AG is composite to EN 13765:2015 Type 3, 14 bar, DN75 and DN100.',
        'Composite oil hose (A901GG) is 20 bar from 1" to DN100, lighter than rubber of the same bore.',
        'Dry disconnect couplings close a valve in each half before the halves separate, so the joint parts without a drip.',
        'Our Sealfast dry disconnects pair only with Sealfast halves of the same size; they are rated up to 150 psi.',
      ],
    },
    {
      type: 'lead',
      html: 'A road tanker is a hose application in miniature: a reel that coils a delivery hose dozens of times a day, a loading connection that has to seal against fuel, and a vapour line that keeps the displaced vapour out of the air. Each one wants a different hose, and the connection between them wants a coupling that <strong>does not leave fuel on the ground</strong> when it is broken.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The reeling hose.',
      anchor: 'reeling',
    },
    {
      type: 'paragraph',
      html: 'A delivery reel winds the hose on and off a drum at every drop, so the hose has to be flexible, light enough to pull, and tough on the cover. Our A420 tanker reeling hose is rated 17 bar with a 51 bar minimum burst (SF 3:1), in DN35 and 1-1/2". Its tube is smooth NBR listed for diesel, domestic fuels and unleaded petrol; it is reinforced with two high-strength textile yarns and carries <strong>two copper braided anti-static wires</strong>; the red cover resists oil, abrasion, ozone and weather. It is rated −20 to +70 °C.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Bond and earth the reel.',
      body: 'The copper braids carry static along the hose; the reel, the nozzle and the truck must be bonded to them and earthed before fuel flows. Check continuity end to end at every inspection.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Composite for loading and vapour.',
      anchor: 'composite',
    },
    {
      type: 'paragraph',
      html: 'Composite hose is built from layers of polymer film and fabric between an inner and an outer wire, with no bonded rubber at all. It is lighter than rubber of the same bore and its film layers can be chosen for the product. Our <strong>vapour recovery composite hose (A901AG)</strong> is printed EN 13765:2015 Type 3, rated 14 bar with a 4:1 safety factor, −30 to +80 °C, in DN75 and DN100, with an orange PVC cover and a galvanised external wire. Our <strong>oil composite hose (A901GG)</strong> is rated 20 bar from 1" to DN100 for fuel and oil transfer.',
    },
    {
      type: 'comparison_table',
      caption: 'Tanker hoses in our range',
      columns: ['Hose', 'Rating', 'Sizes'],
      rows: [
        { cells: ['A420 tanker reeling hose', '17 bar, SF 3:1, −20 to +70 °C', 'DN35, 1-1/2"'] },
        { cells: ['A901AG vapour recovery composite', '14 bar, SF 4:1, EN 13765:2015 Type 3', 'DN75, DN100'], highlight: true },
        { cells: ['A901GG oil composite', '20 bar, SF 4:1, −30 to +80 °C', '1" – DN100'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Composite hose needs composite fittings: a spiral tail that threads into the hose\'s internal wire, held by a ferrule or lug nut. Our composite fittings — cam lock C and E with spiral tails, female liners with lug nuts, hex male and flanged tails — are made for composite hose; Sunpool publishes no working pressure for the fittings themselves.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Dry disconnect couplings.',
      anchor: 'dry-disconnect',
    },
    {
      type: 'paragraph',
      html: 'A dry disconnect coupling has a valve in each half. Connect them and both valves open; disconnect and both close before the faces part, so the joint breaks with no spill. Our Sealfast dry disconnect couplers and adapters are aluminium with 316 stainless valve parts, 1-1/2" to 3", on a female NPT back, with Viton or PTFE-encapsulated seals — PTFE where the product is an aggressive acid or solvent. They are rated up to 150 psi, and the Viton coupler is listed to 28" Hg vacuum. They use a proprietary face: <strong>pair only with Sealfast halves of the same size</strong>.',
    },
    {
      type: 'paragraph',
      html: 'For heavier tanker duty, the metallic shelf adds Met-O-Seal tanker couplings (MTS4 heavy duty, 2" to 6", 25 bar; MT3TL lightweight, 2" to 4", 16 bar) and the T92H dry-break quick coupling, 1" to 6" at 70 bar with an API 6FA fire-test option.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is a tanker reeling hose?',
          answer:
            'A flexible fuel delivery hose built to be wound on and off a reel. Our A420 is 17 bar, 1-1/2", with an NBR tube for diesel and unleaded petrol and two copper anti-static braids.',
        },
        {
          question: 'Which standard covers vapour recovery composite hose?',
          answer:
            'Our A901AG vapour recovery hose is printed EN 13765:2015 Type 3, the European standard for composite hose, rated 14 bar.',
        },
        {
          question: 'Are dry disconnect couplings interchangeable between makers?',
          answer:
            'Not necessarily. Our Sealfast dry disconnects use a proprietary face and pair only with Sealfast halves of the same size.',
        },
        {
          question: 'Do composite hoses need special fittings?',
          answer:
            'Yes. Composite hose uses spiral-tail fittings that engage its internal wire, held by a ferrule or lug nut. Sunpool designs ours for composite hose, and the spiral tail suits most composite hose worldwide.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Tanker hoses and couplings',
      skus: [
        'IH-IH-A420',
        'IH-IH-A901AG',
        'IH-IH-A901GG',
        'IH-DDC-COUPLER-VITON',
        'IH-DDC-ADAPTER-VITON',
        'IH-DDC-COUPLER-PTFE',
        'IH-MH-THORBURN-MTS4-METO-SEAL',
        'IH-MH-THORBURN-T92H-DRY-BREAK',
      ],
    },
    {
      type: 'category_link',
      slug: 'dry-disconnect-couplings',
      label: 'Dry disconnect couplings',
      blurb: 'Sealfast aluminium dry disconnect couplers and adapters, 1-1/2" to 3".',
    },
    {
      type: 'category_link',
      slug: 'composite-hoses',
      label: 'Composite hose',
      blurb: 'Oil, chemical, PTFE chemical and vapour recovery composite hose.',
    },
    {
      type: 'category_link',
      slug: 'composite-hose-fittings',
      label: 'Composite hose fittings',
      blurb: 'Spiral-tail cam locks, liners, lug nuts and flanged tails to EN 13765.',
    },

    {
      type: 'cta_block',
      heading: 'Re-hosing a tanker?',
      body: 'Tell us the product, the reel size, the loading and vapour connections and the couplings the terminal uses. We will quote the hoses and couplings as continuity-tested assemblies.',
      quoteLabel: 'Quote tanker hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Hose ratings, standards, sizes and coupling details checked against our tanker, composite and dry disconnect listings.',
    },
  ],
}

export default ARTICLE
