import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'steam-hose-safety',
  title: 'Steam hose: why the coupling matters more than the hose',
  excerpt:
    'Steam hose failures hurt people, and most of them happen at the ends rather than in the middle. What steam service demands, and why push-on couplings have no place on it.',
  categorySlug: 'industrial-hose',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Steam hose safety — couplings, condensate and inspection',
  seoDescription:
    'Steam hose selection and safety: why saturated steam temperature follows pressure, why couplings must be mechanically secured, and what condensate does to a hose.',
  focusKeyword: 'steam hose safety',
  publishedAt: '2026-08-17T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Saturated steam temperature follows pressure. Raising the pressure raises the temperature the hose actually sees, so the pressure rating is a temperature rating in disguise.',
        'Couplings must be mechanically secured — bolted clamps or interlocking types. A push-on coupling on steam is a projectile with a burn attached.',
        'Steam hose ages faster than almost anything else in an industrial hose store, and it does so from the inside where you cannot see it.',
        'Drain the line after use. Trapped condensate corrodes, and slugs of water in a steam line cause hammer.',
        'Escaping steam is close to invisible near the leak. Never sweep a hand along a suspected steam leak.',
      ],
    },
    {
      type: 'lead',
      html: 'Steam is the service where the consequences of getting hose selection wrong are immediate and physical. It is also the service where the hose itself is least often the problem — the great majority of incidents happen at a coupling that was never suitable for the duty.',
    },

    { type: 'section_head', number: '/01', title: 'The pressure rating is a temperature rating.', anchor: 'pressure-is-temperature' },
    {
      type: 'paragraph',
      html: 'For saturated steam, temperature and pressure are locked together — you cannot raise one without the other. That means a steam hose’s pressure rating is really telling you the temperature its tube and cover must survive continuously. Running a hose rated for a lower pressure on a higher-pressure line is not a margin question; it is running the rubber above the temperature it was compounded for.',
    },
    {
      type: 'direct_answer',
      question: 'Can I use a 7 bar steam hose on an 18 bar line at reduced pressure?',
      answer:
        'Only if the line genuinely cannot exceed the hose rating — and that means a physical restriction, not an operating instruction. Saturated steam at higher pressure is hotter, so an over-pressure event on a steam line is simultaneously an over-temperature event, and the hose has no margin in either direction.',
    },

    { type: 'section_head', number: '/02', title: 'Couplings.', anchor: 'couplings' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Push-on and worm-drive clips do not belong on steam.',
      body: 'A coupling that releases under pressure on a water line makes a mess. On steam it releases a jet at well above boiling point, usually at chest height, usually toward whoever is standing at the connection. Steam couplings are bolted or interlocking types, fitted so they cannot back off.',
    },
    {
      type: 'paragraph',
      html: 'This is the single most important thing on the page. Hose selection tends to get attention because it is the item being purchased; the coupling gets whatever is in the drawer. On steam that inversion is dangerous, and it is worth specifying the assembly — hose, coupling and clamp — as one item rather than three.',
    },

    { type: 'section_head', number: '/03', title: 'Condensate, ageing and inspection.', anchor: 'condensate' },
    {
      type: 'comparison_table',
      caption: 'What shortens steam hose life',
      columns: ['Cause', 'What it does', 'Practice'],
      rows: [
        { cells: ['Trapped condensate', 'Corrodes reinforcement from inside; causes hammer on restart', 'Drain after every use'], highlight: true },
        { cells: ['Thermal cycling', 'Repeated expansion and contraction fatigues the tube', 'Expect shorter life than a comparable water hose'] },
        { cells: ['Kinking while hot', 'Permanent deformation; the tube does not recover', 'Handle and store on a reel, not in a coil on the floor'] },
        { cells: ['External damage', 'Breaches the cover and exposes reinforcement to moisture', 'Inspect ends and contact points before each use'] },
        { cells: ['Exceeding rated pressure', 'Over-temperature as well as over-pressure', 'Physical restriction, not a procedure'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Steam hose deteriorates from the inside, which is exactly where inspection cannot reach. That is why steam service relies on <strong>replacement on a defined programme</strong> rather than on condition alone, and why a steam hose that looks fine on the outside is not thereby fit for another season.',
    },
    { type: 'product_embed', heading: 'Saturated steam constructions', skus: ['IH-IH-A235BK', 'IH-IH-A230', 'IH-IH-A235BU'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How often should steam hose be replaced?', answer: 'On a programme rather than on appearance, because the deterioration is internal. Set the interval from the duty and the number of thermal cycles, and treat any external damage as an immediate condemnation rather than a data point.' },
        { question: 'Can steam hose be used for hot water?', answer: 'Generally yes, and some constructions are specifically dual-rated. The reverse does not hold — a hot water hose is not a steam hose, because saturated steam is hotter than the water service it is rated for.' },
        { question: 'Why does my steam hose stiffen over time?', answer: 'Thermal ageing of the tube and cover. It is a reliable sign the hose is late in life, and it makes kinking more likely, which is itself a failure mode.' },
        { question: 'Do steam hoses need electrical continuity?', answer: 'Not for steam itself, but if the hose is used in a hazardous area or with flammable products the continuity requirement comes from the atmosphere, not the medium.' },
      ],
    },
    { type: 'category_link', slug: 'industrial-steam-hoses', label: 'Steam hose', blurb: 'Saturated steam constructions with couplings specified to match the duty.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Principles and practice only. Pressure and temperature ratings are per construction — take them from the hose datasheet.' },
    { type: 'cta_block', heading: 'Specify the whole assembly.', body: 'Tell us the line pressure and how the hose is handled. We will specify hose, couplings and clamps together rather than leaving the ends to chance.', quoteLabel: 'Specify a steam assembly' },
  ],
}

export default ARTICLE
