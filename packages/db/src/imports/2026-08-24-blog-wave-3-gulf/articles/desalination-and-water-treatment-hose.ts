import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'desalination-and-water-treatment-hose',
  title: 'Desalination and water treatment: seawater is not the difficult part',
  excerpt:
    'Brine, chlorine, antiscalants and cleaning chemicals all pass through hose on a desalination plant, and they are chemically very different from each other. Selecting on "water" gets it wrong.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Desalination plant hose — brine, chlorine and CIP chemicals',
  seoDescription:
    'How to select hose for desalination and water treatment duty: seawater intake, concentrated brine, dosing lines and clean-in-place chemicals each need different compatibility.',
  focusKeyword: 'desalination plant hose',
  publishedAt: '2026-08-24T13:55:58.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A desalination plant runs at least four chemically distinct duties through hose, and "water" describes only one of them.',
        'Concentrated brine is more aggressive than seawater, and it is what the plant produces continuously.',
        'Dosing lines carry small volumes of very aggressive chemicals — the hardest compatibility problem on the site.',
        'Clean-in-place chemistry attacks hose that the process fluid never touches.',
        'Fittings and clamps are exposed to salt from outside as well, so material selection applies to hardware, not only to the hose.',
      ],
    },
    {
      type: 'lead',
      html: 'Desalination is one of the few industries where a plant deliberately concentrates the corrosive component of its own feedstock and then has to handle the result. Specifying hose for it on the basis that the medium is water is the most common and most expensive simplification.',
    },

    { type: 'section_head', number: '/01', title: 'Four duties, four answers.', anchor: 'four-duties' },
    {
      type: 'comparison_table',
      caption: 'What actually runs through hose on a desalination or treatment plant',
      columns: ['Duty', 'What makes it difficult'],
      rows: [
        { cells: ['Seawater intake', 'Salt, plus suspended solids that abrade the tube'] },
        { cells: ['Concentrated brine reject', 'More aggressive than the feed, and produced continuously'], highlight: true },
        { cells: ['Chemical dosing', 'Small lines, very aggressive chemistry — chlorine, acids, antiscalants'], highlight: true },
        { cells: ['Clean-in-place', 'Periodic exposure to chemistry the process fluid never involves'] },
        { cells: ['Permeate and product water', 'The easy one, and often the only one people specify for'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What hose is used on a desalination plant?',
      answer:
        'Not one type. Seawater intake, concentrated brine, chemical dosing, clean-in-place and product water are chemically different duties needing different tube compounds. Dosing lines are usually the hardest — small bore carrying the most aggressive chemistry on site — and are the ones most often specified as an afterthought.',
    },

    { type: 'section_head', number: '/02', title: 'Dosing lines are the hard part.', anchor: 'dosing' },
    {
      type: 'paragraph',
      html: 'Chemical dosing lines carry very small volumes, so they look trivial next to the main flows and they get specified last. But they carry the most aggressive chemistry on the plant — hypochlorite, acids, antiscalants — often at ambient temperature but continuously. <strong>A dosing line failure is also a chemical release into a plant room</strong>, which makes it a safety event rather than a maintenance one.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Compatibility has to be checked at the actual concentration.',
      body: 'A chart rating a compound against a chemical is rating it at a stated concentration and temperature. Dosing chemicals are frequently supplied and handled far more concentrated than the process sees them. Specify against the concentration in the line, not the concentration in the process.',
    },
    {
      type: 'paragraph',
      html: 'Where the chemistry is aggressive enough, PTFE is the answer — chemically inert, and rated to a far higher temperature than it will ever see on this duty. It costs more and it is worth it on a line whose failure empties a chemical drum onto a floor.',
    },

    { type: 'section_head', number: '/03', title: 'Outside as well as inside.', anchor: 'outside-too' },
    {
      type: 'paragraph',
      html: 'A plant on the Gulf coast puts salt-laden air on the outside of every hose and fitting while the process puts brine on the inside. Both matter. Carbon-steel clamps and fittings on a seawater plant have a short and unhappy life, and <strong>the failure is frequently a seized fitting rather than a leaking hose.</strong>',
    },
    { type: 'product_embed', heading: 'Where the chemistry governs', skus: ['IH-HOSE-R14'] },
    { type: 'category_link', slug: 'oil-chemical-purpose-hoses', label: 'Chemical and general-purpose hose', blurb: 'Selected on the medium, not the pressure.' },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'SS316L fittings', blurb: 'For plant where the air is as corrosive as the process.' },
    { type: 'category_link', slug: 'water-suction-delivery-hoses', label: 'Water suction and delivery hose', blurb: 'Where collapse resistance is the requirement.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can one hose type cover the whole plant?', answer: 'No, and trying is how dosing lines end up under-specified. Group the duties and specify each group; the process water lines are genuinely straightforward and the chemical lines genuinely are not.' },
        { question: 'Is brine really worse than seawater?', answer: 'It is more concentrated, which is the point of the process. Anything selected on seawater compatibility should be re-checked before it is used on the reject side.' },
        { question: 'What about the CIP chemicals?', answer: 'They are a separate compatibility question and they are periodic, which is why they get forgotten. A hose that handles the process fluid perfectly can be attacked during cleaning.' },
        { question: 'Does temperature matter on these duties?', answer: 'Less than on hydraulics, but it still shifts compatibility. Where a chart rating is marginal, a warmer line can move it from acceptable to not.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Selection guidance from our own practice supplying water treatment and process plant. Chemical compatibility must be confirmed against the specific chemical, concentration and temperature in the line.',
    },
    { type: 'cta_block', heading: 'Specifying for a treatment plant?', body: 'Send us the duty list — intake, reject, dosing, CIP and product — with concentrations and temperatures. We will specify each group rather than giving you one hose for all of it.', quoteLabel: 'Specify plant hose' },
  ],
}

export default ARTICLE
