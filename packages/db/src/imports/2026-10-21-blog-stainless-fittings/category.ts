import type { BlogBlocksInput } from '@indus/domain'

/**
 * The stainless steel fittings hub.
 *
 * Created 2026-10-21, after the instrumentation hub, because seventeen stainless shelves — 392 products —
 * had not one article pointing at them: butt-weld, threaded, socket-weld and sanitary process fittings,
 * flanges and weld outlets on one side; 316 JIC, ORFS, ORB, DIN 2353, BSP and NPT hydraulic adapters on the
 * other. The steel flareless bite-type shelf, the one zero-article adapter shelf that is not stainless, is
 * covered here too because it is bought against DIN 2353 and read in the same article. Process piping and
 * hydraulic adapters share a buyer — the person specifying a corrosion-resistant skid, panel or plant — so
 * they share a hub rather than being split between pipework and hose fittings.
 */
export const STAINLESS_FITTINGS_CATEGORY = {
  slug: 'stainless-steel-fittings',
  name: 'Stainless steel fittings',
  description:
    'Stainless steel pipe fittings and hydraulic adapters — butt-weld, threaded and socket-weld fittings, flanges, weld outlets and sanitary tri-clamp fittings, and 316 JIC, ORFS, ORB, DIN 2353, BSP and NPT adapters: standards, ratings, grades and how to specify them.',
  heroCopy:
    'Stainless is bought to stop one thing — corrosion — and lost to a dozen others: a 304 elbow in a 316 line, a cast 150# fitting where the pressure needed forged 3000#, a sanitary clamp with the wrong gasket, a stainless JIC nut that galled on its first make-up. These guides cover the standards, grades and details that decide whether a stainless line outlasts the plant or becomes the weakest part of it.',
  seoTitle: 'Stainless steel pipe fittings & hydraulic adapters — guides',
  seoDescription:
    'Guides to stainless steel pipe fittings and adapters: butt-weld, threaded, socket-weld and sanitary fittings, ASME B16.5 flanges, weld outlets, 304 vs 316, and 316 JIC, ORFS, ORB, DIN 2353, BSP and NPT hydraulic adapters.',
  focusKeyword: 'stainless steel fittings',
  position: 20,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of stainless steel fittings?',
      answer:
        'Two families. Process pipe fittings join stainless pipe and tube by welding (butt-weld to ASME B16.9, socket-weld to B16.11), by threads (cast 150# or forged 3000# NPT fittings), by flanges (ASME B16.5) or by hygienic clamps (tri-clamp sanitary fittings). Hydraulic adapters join hoses, tubes and ports in 316 stainless — 37° JIC, ORFS, ORB, DIN 2353 24° cone, BSP and NPT — where carbon steel would corrode.',
    },
    {
      type: 'comparison_table',
      caption: 'Which stainless fitting family fits the job',
      columns: ['Family', 'Joins', 'Typical service'],
      rows: [
        { cells: ['Butt-weld (B16.9)', 'Pipe by full-penetration weld', 'Process, chemical and water piping'], highlight: true },
        { cells: ['Forged threaded / socket-weld (B16.11)', 'Pipe to 4" by thread or fillet weld', 'Higher-pressure small-bore piping'] },
        { cells: ['Cast 150# threaded', 'Pipe by NPT thread', 'Water, air and chemical at moderate pressure'] },
        { cells: ['Flanges (B16.5)', 'Pipe to valves and vessels, bolted', 'Anywhere a joint must come apart'] },
        { cells: ['Sanitary tri-clamp', 'Polished tube by clamp and gasket', 'Food, dairy, beverage and pharma'] },
        { cells: ['Hydraulic adapters', 'Hose, tube and ports', 'Offshore, marine and washdown hydraulics'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-pipe-fittings',
      label: 'Stainless steel pipe fittings',
      blurb: 'Butt-weld, threaded, socket-weld and sanitary fittings, flanges, weld outlets and nipples in 304 and 316.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-jic-adapters',
      label: 'Stainless JIC adapters',
      blurb: '316 stainless 37° JIC unions, elbows, tees, bulkheads and swivels.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-din-2353-fittings',
      label: 'Stainless DIN 2353 fittings',
      blurb: '24° cone cutting-ring fittings in light, heavy and extra-light series.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-sanitary-fittings',
      label: 'Sanitary fittings',
      blurb: 'Tri-clamp ferrules, elbows, tees, reducers, gaskets and tube in 304 and 316.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a stainless line?',
      body: 'Send the sizes, grade, end connections, pressure and temperature. We will quote the fittings, flanges and adapters in one grade, with mill certificates if the project needs them.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
