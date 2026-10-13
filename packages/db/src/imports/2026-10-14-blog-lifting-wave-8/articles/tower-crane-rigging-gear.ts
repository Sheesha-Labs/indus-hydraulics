import type { BlogArticleSeed } from '../shared'

/**
 * Tower crane rigging gear and practice. Checked 2026-10-14: WorkSafeBC §14.92 (anemometer readable
 * at controls; without maker specs stop at 50 km/h) — quoted as one regulator's default; offshore
 * regulator (BSEE Safety Alert 461) tag-line entanglements; Dubai GU48 EIAC-certified operators,
 * riggers and signallers and Abu Dhabi CoP 34 intervals (memory). No CPA wind figure (unverified).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tower-crane-rigging-gear',
  title: 'Tower crane rigging gear: what a crane crew uses every day, and how to keep it in service',
  excerpt:
    'A tower crane on a Gulf high-rise may make a hundred lifts a day — rebar, formwork, blockwork, MEP, steel. Its rigging crew works through heat, dust and wind with a small set of gear used over and over. What that kit is, how each item is chosen and checked, how wind and tag lines are managed, and who is allowed to rig in the UAE.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Tower Crane Rigging Gear: Daily Kit and Checks',
  seoDescription:
    'The rigging gear a tower crane crew uses every day — slings, chain slings, shackles, master links, stillages and tag lines — with daily checks, wind limits, rigger and signaller certification in Dubai and Abu Dhabi, and care in Gulf heat.',
  focusKeyword: 'tower crane rigging equipment',
  publishedAt: '2026-10-14T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Tower crane rigging is a small kit used intensively: round and webbing slings, chain slings, shackles, master links, lifting stillages and tag lines.',
        'Every item is checked before use each day, and examined periodically by an approved third party — 6-monthly for accessories in Abu Dhabi.',
        'In Dubai, operators, riggers and signallers must be certified by an accredited body.',
        'Wind limits come from the crane maker; one regulator’s default without maker data is 50 km/h.',
        'Heat, UV and grit age synthetic slings fast in the Gulf — store them out of the sun and retire them on condition.',
      ],
    },
    {
      type: 'lead',
      html: 'A tower crane is the heartbeat of a high-rise site, and its hook is never still for long: bundles of rebar, formwork tables, pallets of block, MEP modules, steel. The rigging that goes on that hook is a small kit, used by the same crew hundreds of times a week, in heat and wind, and it wears accordingly. Getting the kit right — and keeping it right — is what keeps the crane productive and the people under it safe. For setting up the whole loft, see the <a href="/blog/site-mobilisation-rigging-kit">site mobilisation rigging kit</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The daily kit.', anchor: 'kit' },
    {
      type: 'comparison_table',
      caption: 'A tower crane crew’s everyday rigging',
      columns: ['Item', 'Used for'],
      rows: [
        { cells: ['Round slings and webbing slings', 'Bundles, formwork, finished items; chokers on rebar'] },
        { cells: ['Two- and four-leg chain slings', 'Steel, stillages, heavy and hot loads'], highlight: true },
        { cells: ['Anchor shackles', 'Connecting slings to lugs and stillages'] },
        { cells: ['Master links and hooks', 'Making up assemblies on the crane hook'] },
        { cells: ['Lifting stillages, cages and skips', 'Loose and small materials — never lift loose loads on slings'] },
        { cells: ['Tag lines', 'Controlling rotation in wind'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What rigging equipment does a tower crane crew need?',
      answer:
        'Round and webbing slings, two- and four-leg chain slings, anchor shackles, master links and latched hooks, rated lifting stillages or cages for loose materials, and tag lines — each marked with its WLL, checked before use every day, and examined periodically by an approved third party.',
    },

    { type: 'section_head', number: '/02', title: 'Daily checks.', anchor: 'checks' },
    {
      type: 'prose',
      html: '<ul><li><strong>Slings</strong>: cuts, abrasion, heat or chemical damage, damaged stitching, missing labels — see the <a href="/blog/sling-colour-code-chart">sling colour code chart</a>.</li><li><strong>Chain slings</strong>: stretched or bent links, damaged hooks and latches, missing tag.</li><li><strong>Shackles</strong>: pins fully engaged, no bending, markings legible — see <a href="/blog/shackle-markings-explained">shackle markings explained</a>.</li><li><strong>Hooks</strong>: latch working, no opening of the throat.</li><li><strong>Anything doubtful</strong> goes to quarantine — see <a href="/blog/lifting-gear-rejection-criteria">lifting gear rejection criteria</a>.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Who may rig in the UAE.', anchor: 'certification' },
    {
      type: 'paragraph',
      html: 'In Dubai, municipal guidance requires lifting equipment to be certified at least every 12 months by an accredited third party, and operators, riggers and signallers to be certified too. In Abu Dhabi, the lifting code of practice requires thorough examination of lifting accessories every 6 months and equipment every 12 by approved third parties, with daily checks and site registers. See <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Wind and tag lines.', anchor: 'wind' },
    {
      type: 'paragraph',
      html: 'Tower cranes have in-service wind limits set by the maker; the crane’s anemometer and the operator’s judgment decide when to stop. As one example of a regulator’s default, British Columbia requires an anemometer readable at the controls and, without maker specifications, a 50 km/h limit — and a stop whenever wind makes the load unsafe. Large, light loads such as formwork panels catch the wind long before the crane’s limit. Tag lines help control them, but must never be wrapped round a hand: offshore regulators have recorded workers lifted off their feet by entangled tag lines.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Gulf heat and dust.',
      body: 'UV and heat age polyester slings faster than anywhere temperate. Store slings off the ground and out of the sun when not in use, keep grit out of chain and shackle threads, and retire synthetic slings on condition — faded, stiff or abraded — not on a calendar.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How often must tower crane rigging be inspected in the UAE?', answer: 'Before use each day by the user, and periodically by an approved third party — every 6 months for lifting accessories in Abu Dhabi; Dubai guidance requires certification at least every 12 months.' },
        { question: 'Do riggers need certification in Dubai?', answer: 'Yes. Dubai guidance requires operators, riggers and signallers to be certified by an accredited body.' },
        { question: 'At what wind speed should a tower crane stop?', answer: 'At the limit the crane maker sets, or sooner if the load is unsafe. One regulator’s default without maker data is 50 km/h.' },
        { question: 'Can I lift loose materials on slings?', answer: 'No. Use rated stillages, cages or skips for loose and small materials.' },
        { question: 'How long do polyester slings last in the Gulf?', answer: 'It depends on use and storage. Heat and UV age them quickly; retire them on condition at inspection.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For tower crane crews',
      skus: ['IH-LR-SY-PRSE', 'IH-LR-SY-PFWSEE', 'IH-LR-CS-G80QOS', 'IH-LR-CS-G80DOS', 'IH-LR-SH-G209', 'IH-LR-G8-MLA', 'IH-LR-G8-ESHL', 'IH-LR-FR-PPMR'],
    },
    {
      type: 'category_link',
      slug: 'lifting-slings',
      label: 'Lifting slings',
      blurb: 'Round, webbing, chain and wire rope slings.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['site-mobilisation-rigging-kit', 'lifting-equipment-inspection-uae', 'sling-colour-code-chart', 'lifting-gear-rejection-criteria', 'types-of-lifting-slings', 'steel-erection-rigging-equipment'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'UAE requirements from Dubai and Abu Dhabi lifting guidance read September 2026; wind default from British Columbia’s crane regulation; tag-line hazard from an offshore regulator’s safety alert. The crane maker’s limits govern.',
    },
    {
      type: 'cta_block',
      heading: 'Re-stocking a crane crew?',
      body: 'Send the slings, chain slings and hardware you need. We will quote from stock with certificates, ready for your register.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
