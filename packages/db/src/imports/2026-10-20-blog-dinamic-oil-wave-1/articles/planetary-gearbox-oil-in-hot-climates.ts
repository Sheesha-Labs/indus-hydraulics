import type { BlogArticleSeed } from '../shared'

/**
 * Planetary gearbox oil and maintenance in hot climates. Checked 2026-10-20 against Dinamic Oil's planetary gearbox
 * catalogue (2025) B-14/B-15 and the gearbox and winch use-and-maintenance manuals: EP gear oil ISO VG 220–320
 * (ISO 3448), synthetic for very high ambient or wide swings, expansion tank for vertical continuous units, first
 * change 150 h then by oil-temperature table / max 2 years, 3-monthly checks, ambient -15/-20 to +40 °C, cooling
 * units to 50 kW, storage -5 to +30 °C and oil fill over 6 months; winches use ISO VG 46 HLP or VG 150 by series,
 * first change 150 h then yearly; P series grease every 250 h; towing winches ISO VG 150, first change 500 h.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'planetary-gearbox-oil-in-hot-climates',
  title: 'Planetary gearbox oil in hot climates: grade, change intervals and heat in Gulf duty',
  excerpt:
    'Most planetary gearboxes and winches are rated for an ambient of +40 °C — a figure the Gulf passes for months every year. Which oil to use, when to change it, how to tell when a gearbox is running too hot, and how to store spares so they are serviceable when needed.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Planetary Gearbox Oil in Hot Climates: Grades & Intervals',
  seoDescription:
    'Gearbox oil for Gulf heat: ISO VG 220–320 EP or synthetic, first change at 150 h, two years at most, thermal power, cooling units and storing spares.',
  focusKeyword: 'planetary gearbox oil',
  publishedAt: '2026-10-20T19:42:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Planetary gearboxes run in EP gear oil of ISO VG 220 to 320; synthetic oil is the maker’s choice for very high ambient temperatures.',
        'Change the oil after the first 150 operating hours, then by the oil-temperature table — and never less often than every two years.',
        'Standard units are rated to +40 °C ambient: above that, check the thermal power, not just the torque.',
        'Hydraulic winches often use a different oil from the gearboxes around them — check the manual for the series.',
        'Spare gearboxes kept over six months should be filled with oil and turned over regularly.',
      ],
    },
    {
      type: 'lead',
      html: 'A planetary gearbox does not fail from heat the way a hose does. It fails slowly: the oil thins, the film between the gear teeth gets thinner, the oil oxidises faster, seals harden, and the first sign is a leak or a noise months later. In the Gulf, where summer ambient is above the +40 °C most makers rate their standard units for, the oil and the duty decide how long the gearbox lasts. The guidance below follows Dinamic Oil’s catalogues and maintenance manuals.',
    },

    { type: 'section_head', number: '/01', title: 'Which oil.', anchor: 'grade' },
    {
      type: 'paragraph',
      html: 'Dinamic Oil specifies a mechanical transmission oil with EP (extreme pressure) additives in viscosity class <strong>ISO VG 220 to ISO VG 320</strong> to ISO 3448, chosen on the ambient temperature and the actual running temperature of the gearbox. Mineral EP oils such as Shell Omala S2 G, Mobilgear XMP or Castrol Alpha SP are listed; for very high ambient temperatures or wide temperature swings, the recommendation is a synthetic oil — Omala S4 GX, Mobilgear SHC or Alphasyn EP class. The heavier grade is the usual choice for a gearbox that works through a Gulf summer.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A winch is not a gearbox.',
      body: 'Dinamic Oil’s hydraulic winches use ISO VG 46 HLP or ISO VG 150 oil depending on the series, and the P series is grease-lubricated. Filling a winch with gearbox oil, or the reverse, is a common mistake on mixed fleets.',
    },

    { type: 'section_head', number: '/02', title: 'When to change it.', anchor: 'intervals' },
    {
      type: 'comparison_table',
      caption: 'Service intervals from Dinamic Oil’s manuals',
      columns: ['Unit', 'First oil change', 'Then', 'Routine checks'],
      rows: [
        { cells: ['Planetary gearbox, winch drive', '150 h', 'By oil temperature, at most every 2 years', 'Every 3 months: level, leaks, play, noise, temperature'], highlight: true },
        { cells: ['Hydraulic hoisting winch', '150 h', 'Once a year', 'Oil level every 250 h, rope daily'] },
        { cells: ['P series winch (grease)', '—', 'Grease every 250 h', 'Rope daily'] },
        { cells: ['Towing / recovery winch', '500 h', 'Once a year', 'Oil level every 250 h, rope daily'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The first change matters more than any other: it removes the wear particles from running-in. Check the magnetic plugs at the same time — a little fine paste is normal, flakes or chips are not. The oil-temperature table in the manual shortens the interval as the running temperature rises, which is why a gearbox in the Gulf is often on a shorter cycle than the same model in Europe.',
    },

    { type: 'section_head', number: '/03', title: 'When it runs too hot.', anchor: 'heat' },
    {
      type: 'paragraph',
      html: 'Every gearbox has a thermal power: the power it can transmit continuously before the oil reaches its limit. It depends on the mounting and the ambient air. If the transmitted power is above it — a mixer, conveyor or travel drive running all shift in summer — the cure is not a different oil but more cooling: an independent oil/water or oil/air cooling unit (Dinamic Oil’s dissipate up to 50 kW) or a larger frame. Vertical gearboxes in continuous duty can overheat the oil at the top; an external expansion tank keeps them filled. Keep the housing and cooling paths clean: dust on a gearbox is insulation.',
    },
    {
      type: 'direct_answer',
      question: 'What ambient temperature are standard planetary gearboxes rated for?',
      answer:
        'Dinamic Oil rates its standard planetary gearboxes for −15 °C to +40 °C ambient, and its winch drives for −20 °C to +40 °C. Above +40 °C, the selection should be checked with the maker for oil grade, thermal power and seals.',
    },

    { type: 'section_head', number: '/04', title: 'Storing spares.', anchor: 'storage' },
    {
      type: 'paragraph',
      html: 'A spare gearbox in a container yard is not a spare. Dinamic Oil’s manual calls for dry storage between −5 °C and +30 °C, on timber, not stacked, with anti-corrosion grease on flanges and shafts after two months; over six months, fill it with service oil, fit the breather on top and turn the input over periodically (release the brake with a hand pump). Seals begin to deteriorate after six months on the shelf, so renew them before a long-stored unit goes into service.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I mix mineral and synthetic oil?', answer: 'Not as a rule. Drain and flush when changing type; some synthetic bases are not compatible with mineral oil or with every seal material.' },
        { question: 'Does the brake need its own oil?', answer: 'Multi-disc brakes on Dinamic Oil gearboxes hold a small volume of oil that is changed with the gearbox oil.' },
        { question: 'How do I know the oil is overheating?', answer: 'Darkening oil, a burnt smell, a housing too hot to touch and weeping seals. Measure the running temperature and compare it with the manual’s table.' },
        { question: 'Is the catalogue oil quantity exact?', answer: 'No. It varies with the ratio, input and output. Fill to the level plug, run for a few minutes and check again.' },
        { question: 'Where do I find the intervals for my unit?', answer: 'In the use and maintenance manual attached to each Dinamic Oil product page on our site.' },
      ],
    },
    { type: 'product_embed', heading: 'Gearboxes and winch drives', skus: ['IH-DO-RE', 'IH-DO-GB', 'IH-DO-WD', 'IH-DO-SLR'] },
    { type: 'category_link', slug: 'gearboxes-winches', label: 'Gearboxes and winches', blurb: 'Planetary and slewing gearboxes, wheel drives, winch drives and winches.' },
    { type: 'page_link', kind: 'industry', slug: 'mining', label: 'Mining', blurb: 'Continuous-duty drives in dust and heat.' },
    { type: 'related_articles', slugs: ['how-to-select-a-planetary-gearbox', 'molykote-lubricant-types-explained', 'hydraulic-winch-sizing'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Oil grades, intervals, temperature ratings and storage from Dinamic Oil’s catalogues and use-and-maintenance manuals.' },
    {
      type: 'cta_block',
      heading: 'Gearbox running hot?',
      body: 'Send the model, duty, ambient and running temperature. We will check the oil, thermal power and cooling options with Dinamic Oil.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
