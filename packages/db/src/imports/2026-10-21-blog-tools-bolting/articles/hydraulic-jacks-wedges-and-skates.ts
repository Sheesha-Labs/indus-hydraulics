import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Hydraulic jacks, lifting wedges, machine lifts and load skates, and the safety rules for lifting with them.
 * Sources read 2026-10-21: Enerpac Industrial Tools Catalog E330 (GBJ bottle jacks 2–110 t, by-pass port, ANSI/PALD/
 * CE; JHA/JH jacks; LW16 wedge 0.39 in clearance; POW'R-RISER 60–200 t with locking rings for cribbing, 3 in spacer
 * limit; Pow'R-LOCK positive locking to ASME B30.1; SOH machine lifts 8.5–20 t, toe clearance 0.79–1.18 in; ER skates
 * up to 80 t each, "two skates to take full load"; safety pages) and Enerpac Bolting Tools Catalog E415 (safety pages:
 * 80% of rating, keep away from >65 °C, hose bend radius 4½ in).
 * NOT used: listing names for skate ranges that the catalogues do not carry; trailer-jack figures (no maker source read).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-jacks-wedges-and-skates',
  title: 'Hydraulic jacks, lifting wedges and load skates: lifting and moving heavy machinery safely',
  excerpt:
    'Moving a press, a transformer or a pump skid is a sequence: a wedge or toe jack to get under it, a jack to raise it, cribbing to hold it, skates to roll it. Which tool does which part, how to size each one by load, closed height and stroke, and the rules Enerpac prints in every catalogue — a level, solid base, the whole saddle on the load, and nobody under a load that is held only by hydraulics.',
  categorySlug: 'hydraulic-tools-bolting',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Jacks, Lifting Wedges & Load Skates: Safe Use',
  seoDescription:
    'How to choose hydraulic bottle jacks, aluminium jacks, lifting wedges, machine toe lifts, locking jacks and load skates for moving heavy machinery, and the safety rules for jacking, cribbing and skating a load.',
  focusKeyword: 'hydraulic jacks',
  publishedAt: '2026-10-21T23:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Size a jack by load, closed height (the gap you have) and stroke (the lift you need) — then use only about 80% of its rating.',
        'Where there is no gap under the load, start with a lifting wedge or a toe lift: Enerpac’s LW16 wedge needs 0.39 in of clearance.',
        'Never work under a load held only by a jack. Crib it, or use a jack that locks mechanically.',
        'Jack on a level, solid base, with the whole saddle in contact with the load.',
        'Skate sets are sized so two skates can carry the full load on an uneven floor.',
      ],
    },
    {
      type: 'lead',
      html: 'Heavy machinery is rarely lifted by crane inside a building. It is wedged, jacked, cribbed and rolled — a few inches at a time, with the load resting on timber or steel between every lift. Each step uses a different tool, and the accidents come from using one tool to do another’s job: a jack used as a support, a bottle jack on soft ground, a single skate taking a corner of a load it was never sized for.',
    },

    { type: 'section_head', number: '/01', title: 'The tools and what each one is for.', anchor: 'tools' },
    {
      type: 'comparison_table',
      caption: 'Enerpac lifting and moving tools (catalogue E330)',
      columns: ['Tool', 'Capacity', 'Job'],
      rows: [
        { cells: ['LW lifting wedge', '16 t', 'Open a gap from 0.39 in so a jack or toe can go in'] },
        { cells: ['SOH machine lift (toe jack)', '8.5–20 t', 'Lift on a toe from 0.79–1.18 in clearance'] },
        { cells: ['GBJ bottle jack', '2–110 t', 'General lifting with an over-extension by-pass'], highlight: true },
        { cells: ['JHA aluminium / JH steel jack', '7–35 t / 30–100 t', 'Portable lifting at 10,000 psi'] },
        { cells: ['POW’R-RISER', '60–200 t', 'Heavy lifts with locking rings for mechanical cribbing'] },
        { cells: ['Locking jack (Pow’R-LOCK)', '—', 'Continuous positive mechanical lock under load'] },
        { cells: ['Load skates', 'Up to 80 t each', 'Roll the load once it is lifted'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>Sizing.</strong> Three numbers decide a jack: the <strong>load</strong> on that lift point (not the whole machine divided evenly, unless it truly is), the <strong>closed height</strong> — the gap under the lift point — and the <strong>stroke</strong> you need. Enerpac’s standing advice is to treat the rated load and stroke as maximum safe limits and use only 80% of them. Where the gap is smaller than any jack, a wedge or toe lift comes first.</p><p><strong>Moving.</strong> With the load raised and cribbed, skates go under the lift points. Enerpac sizes its skate sets so that two skates can take the full load on an uneven floor — a load on four skates will not always be on four.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The safety rules.', anchor: 'safety' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never place any part of your body under the load.',
      body: 'Enerpac: ensure the load is on a solid support — cribbing — before venturing under it. A hydraulic jack is a lifting device, not a support; a seal or hose can let go without warning.',
    },
    {
      type: 'prose',
      html: '<ul><li>Provide a level and solid support for the whole jack base — steel plate on soft or uneven ground.</li><li>The entire saddle must be in contact with the load; never use a cylinder without its saddle.</li><li>Lift slowly and check often; keep out of the line of force.</li><li>Raise the cribbing with the load, so the fall distance is never more than a short step.</li><li>On a POW’R-RISER, never exceed 3 in of total spacer height; use its locking rings as mechanical cribbing.</li><li>Keep hydraulic equipment away from open flame and temperatures above 65 °C (150 °F), and do not kink hoses — Enerpac gives a minimum bend radius of 4½ in.</li><li>Use the oil the maker specifies when topping up a jack or pump.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I choose a hydraulic jack capacity?', answer: 'From the load on that lift point, with margin — Enerpac advises using only 80% of the rated capacity — then check closed height and stroke.' },
        { question: 'Can I leave a load on a hydraulic jack?', answer: 'Not as a support. Crib the load or use a jack with a mechanical lock before anyone goes near or under it.' },
        { question: 'What if there is no room under the machine for a jack?', answer: 'Use a lifting wedge (from 0.39 in clearance on Enerpac’s LW16) or a toe lift to raise it enough to get a jack or cribbing in.' },
        { question: 'How many skates do I need?', answer: 'Enough that two skates can carry the full load — on uneven floors the load will not share evenly across four.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Jacks, wedges, machine lifts, skates and the oil for them:</p>' + stockList(['hydraulic-jacks-skates']) + '<ul><li><a href="/p/enerpac-hf-and-lx-hydraulic-oil">Enerpac HF and LX Hydraulic Oil</a></li></ul>',
    },
    {
      type: 'product_embed',
      heading: 'Jacks and skates',
      skus: ['IH-ENE-GBJ', 'IH-ENE-JH', 'IH-ENE-LW', 'IH-ENE-SOH', 'IH-ENE-PRE', 'IH-ENE-ER', 'IH-ENE-OIL'],
    },
    { type: 'category_link', slug: 'hydraulic-jacks-skates', label: 'Jacks and skates', blurb: 'Bottle jacks, aluminium jacks, wedges, machine lifts and skates.' },
    { type: 'page_link', kind: 'industry', slug: 'power', label: 'Power', blurb: 'Moving transformers, pumps and generators.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'enerpac-e330', text: 'Enerpac. Industrial Tools Catalog E330 (EN-US), including the safety pages.', url: 'https://vault.enerpac.com/m/633ff0c42dd24838/original/Enerpac_Industrial_Tools_Catalog_E330_EN-US.pdf' },
        { id: 'enerpac-e415', text: 'Enerpac. Bolting Tools Catalog E415 (EN-US), safety pages.', url: 'https://vault.enerpac.com/m/70e0e0d9d5787fed/original/Enerpac_Bolting_Tools_Catalog_E415_EN-US.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-pullers-presses-and-cutters', 'high-pressure-hydraulic-cylinders-and-pumps', 'hydraulic-fluid-injection-injury', 'chain-block-vs-lever-hoist-vs-electric-hoist'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Capacities, clearances and safety rules from Enerpac catalogues E330 and E415.',
    },
    {
      type: 'cta_block',
      heading: 'Moving heavy equipment?',
      body: 'Send the weight, the lift points, the gap under each and how far it has to travel. We will quote the wedges, jacks, cribbing aids and skates for the job.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
