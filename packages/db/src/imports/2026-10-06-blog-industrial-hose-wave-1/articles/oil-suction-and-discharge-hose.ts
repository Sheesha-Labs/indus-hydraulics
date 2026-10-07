import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Oil suction and delivery hose, read from A430, A460, A400EU, BAKU, A110,
 * A125 and A104: pressures, vacuum, temperatures, tube and cover compounds,
 * aromatic content, anti-static wires, safety factors, sizes.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oil-suction-and-discharge-hose',
  title: 'Oil suction and discharge hose: aromatics, vacuum and the static wire',
  excerpt:
    'An oil hose is chosen on three things a water hose never asks about: how aromatic the oil is, whether the hose must hold vacuum, and how static is carried away. Our range, read on those three.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I choose an oil suction and discharge hose?',
      answer:
        'Check three things after bore and pressure. First, the oil: our rubber oil suction and delivery hoses have NBR tubes rated for hydrocarbons with up to 50% aromatic content. Second, vacuum: a suction hose needs a steel helix, and our listings print the vacuum it holds. Third, static: fuel and oil transfer hose carries anti-static wires bonded to the couplings. Our rubber oil S&D hoses run from 1" to 8" at 10 or 20 bar.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Our rubber oil S&D hoses use NBR tubes suitable for hydrocarbons with up to 50% aromatic content; higher aromatic content needs a different liner.',
        'Suction needs a helix: A430 is printed 0.93 bar vacuum and A460 0.9 bar; a delivery-only hose will flatten.',
        'Anti-static wires only work if they are bonded to the couplings and the couplings are earthed.',
        'A430 is 10 bar, 1"–6"; A460 is 20 bar, 2"–6"; A400EU is 20 bar, 3"–8" for oil, mud and sea water.',
        'PVC oil hose (BAKU) is light and cheap but limited to −10 to +55 °C and 3–9 bar depending on size.',
      ],
    },
    {
      type: 'lead',
      html: 'Oil transfer hose looks like water hose with a different colour stripe, and is bought like it far too often. The questions that matter are ones a water hose never asks: <strong>how aromatic is the oil</strong>, will the hose have to hold a vacuum, and where does the static go. Get those three right and the bore and pressure are the easy part.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The tube and the aromatics.',
      anchor: 'aromatics',
    },
    {
      type: 'paragraph',
      html: 'Petroleum products differ in how aggressive they are to rubber, and the aromatic fraction is the part that does the damage — it swells and softens tube compounds that are fine in a lighter oil. Our rubber oil suction and delivery hoses (A430, A460) and the oil, mud and sea water hose (A400EU) all carry NBR tubes listed as suitable for <strong>50% aromatic hydrocarbons</strong>. That covers diesel, fuel oils and most lubricating and hydraulic oils; for highly aromatic solvents or blends, ask before relying on a rubber tube, and consider a composite or UHMWPE hose instead.',
    },
    {
      type: 'comparison_table',
      caption: 'Our oil suction and delivery hoses',
      columns: ['Hose', 'Working / burst', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['A430 oil S&D, 10 bar', '10 / 30 bar, SF 3:1', '1" – 6"', '−35 to +80 °C'] },
        { cells: ['A460 oil S&D, 20 bar', '20 / 60 bar, SF 3:1', '2" – 6"', '−40 to +100 °C'], highlight: true },
        { cells: ['A400EU oil, mud and sea water, 20 bar', '20 / 80 bar, SF 4:1', '3" – 8"', '−30 to +90 °C'] },
        { cells: ['BAKU PVC oil S&D', '3 – 9 bar by size', '1" – 6"', '−10 to +55 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Suction needs a helix.',
      anchor: 'vacuum',
    },
    {
      type: 'paragraph',
      html: 'A hose that will pull oil from a tank or a drum has to resist being flattened by atmospheric pressure, and only a steel helix does that. A430 and A460 have twin steel helices, and their laylines print the vacuum: <strong>0.93 bar on A430 and 0.9 bar on A460</strong>. A400EU carries a steel helix wire for the same reason. The PVC BAKU hose uses a rigid PVC helix and is listed at 0.88 to 0.78 bar of vacuum depending on size. A delivery-only hose pressed into suction service works until the pump pulls hard, then collapses — and it reads as a pump fault.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Where the static goes.',
      anchor: 'static',
    },
    {
      type: 'paragraph',
      html: 'Oil flowing through a hose builds an electrostatic charge, and a spark at the coupling is an ignition source in fuel vapour. That is why our rubber oil S&D hoses are built with <strong>anti-static wires</strong> alongside the helix. The wires only help if the couplings are bonded to them and the couplings are earthed to the tank and the truck. A hose with a non-conductive tube — such as our red multipurpose A104, listed as non-conductive — is a deliberate choice for some duties and the wrong one for others; it is a decision, not a default.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Test continuity, not just pressure.',
      body: 'An anti-static hose with a broken bond wire looks and pressure-tests exactly like a good one. Check electrical continuity coupling to coupling when the assembly is built and at each inspection, and replace any hose that fails it.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Small-bore oil and air lines.',
      anchor: 'small-bore',
    },
    {
      type: 'paragraph',
      html: 'Below 1", oil service moves to the multipurpose hoses: A110 mineral oil hose (10 bar, 3/16" to 1", −40 to +100 °C, SF 4:1) and A125 mineral oil and air hose (20 bar, 1/4" to 1", −40 to +80 °C). Both have non-conductive NBR tubes and covers resistant to oil, abrasion, ozone and weather. They suit lube lines, workshop oil transfer and compressor connections, not fuel transfer at a tanker.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Couplings for oil transfer.',
      anchor: 'couplings',
    },
    {
      type: 'paragraph',
      html: 'Most oil transfer hose ends in cam and groove halves, with an NBR (Buna-N) gasket for hydrocarbons — and on a large bore the coupling, not the hose, may set the rating: our cam and groove listings step down to 75 psi at 5" and 6". Hammer unions and flanged ends take over on oilfield mud and transfer lines. Whatever the coupling, clamp the shank properly or crimp it; a 20 bar hose on a single band is not a 20 bar assembly.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can an oil suction hose carry petrol?',
          answer:
            'Our A430 and A460 NBR tubes are listed for hydrocarbons with up to 50% aromatic content. For petrol and highly aromatic fuels, confirm the specific fuel with us first; a composite hose may be the better choice.',
        },
        {
          question: 'What vacuum will an oil suction hose hold?',
          answer:
            'A430 is printed 0.93 bar vacuum and A460 0.9 bar. The PVC BAKU hose is listed at 0.88 to 0.78 bar depending on size.',
        },
        {
          question: 'Why does an oil hose need anti-static wires?',
          answer:
            'Flowing oil builds static charge. The wires carry it to the couplings, which must be bonded and earthed, so it cannot discharge as a spark in fuel vapour.',
        },
        {
          question: 'Is a PVC oil hose suitable for hot oil?',
          answer:
            'No. Our PVC oil hose is listed from −10 to +55 °C. For hot oil use a rubber S&D hose such as A460, rated to +100 °C.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Oil suction and delivery hose',
      skus: ['IH-IH-A430', 'IH-IH-A460', 'IH-IH-A400EU', 'IH-IH-BAKU', 'IH-IH-A110', 'IH-IH-A125', 'IH-IH-A104'],
    },
    {
      type: 'category_link',
      slug: 'oil-chemical-purpose-hoses',
      label: 'Oil, chemical and general-purpose hose',
      blurb: 'Oil S&D, UHMWPE chemical, tanker reeling and multipurpose hose.',
    },
    {
      type: 'category_link',
      slug: 'cam-and-groove-couplings',
      label: 'Cam and groove couplings',
      blurb: 'The usual coupling on oil transfer hose, with NBR gaskets.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying an oil transfer hose?',
      body: 'Tell us the product, its temperature, the bore and whether the hose must pull suction. We will quote the hose, couplings and continuity-tested assembly.',
      quoteLabel: 'Quote oil hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, vacuum, temperatures, compounds and sizes checked against our oil hose listings.',
    },
  ],
}

export default ARTICLE
