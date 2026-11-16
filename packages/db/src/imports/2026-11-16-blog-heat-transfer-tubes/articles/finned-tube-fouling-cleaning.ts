import type { BlogArticleSeed } from '../shared'

/**
 * Finned tube fouling. Sources: the finned listings' approved facts (fin density ranges, H-fin straight
 * gas lanes resisting fouling, solid fins preferred where gas is dirty, opened-up fin spacing for dusty
 * air in the coil copy, studded tubes for fuel-oil firing). Cleaning practice is general; no
 * performance-loss percentages or pressure limits are given because none were sourced.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'finned-tube-fouling-cleaning',
  title: 'Finned tube fouling and cleaning in Gulf dust',
  excerpt:
    'Dust, sand and salt clog air-cooler fins across the Gulf every summer, just when the coolers are working hardest. How fouling builds up on finned tube, how to clean it without flattening the fins, and the design choices that make the next bundle easier to keep clean.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Finned Tube Fouling and Cleaning',
  seoDescription:
    'How dust and salt foul air-cooler finned tubes in the Gulf, how to clean fins safely, and how fin type and density reduce fouling on the next bundle.',
  focusKeyword: 'finned tube cleaning',
  publishedAt: '2026-11-16T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Air-side fouling blocks the gaps between fins, cutting airflow and heat transfer at the hottest time of year.',
        'Clean from the air-exit side back through the bundle, with low-pressure water or air, keeping the jet in line with the fins.',
        'High pressure or an angled jet bends fins over; bent fins block airflow permanently.',
        'Fewer fins per inch, full-cover fins and the right tube layout make dusty sites easier to keep clean.',
        'In dirty flue gas, solid fins, H-fins and studs foul less than serrated fins.',
      ],
    },
    {
      type: 'lead',
      html: 'An air cooler pulls a great deal of air through its fins, and in the Gulf that air carries sand, dust, salt and sometimes oily mist from the plant around it. Deposits build up on the air-inlet face and between the fins, airflow falls, and the process outlet temperature climbs — usually in summer, when the margin is already thin.',
    },
    {
      type: 'direct_answer',
      question: 'How do you clean finned tubes on an air cooler?',
      answer:
        'With low-pressure water or compressed air directed straight along the fins, working from the air-exit side so deposits are pushed back out the way they came. Keep the nozzle in line with the fins and well back from them; high pressure or an angled jet flattens fins and blocks the bundle permanently. Clean before the hot season, with the fans stopped and locked out.',
    },

    { type: 'section_head', number: '/01', title: 'How fins foul.', anchor: 'how' },
    {
      type: 'paragraph',
      html: 'Dust lodges first on the inlet face, then bridges the gaps between fins. Salt and humidity cement it, and oily mist makes it sticky. The finer the fin pitch, the faster the gap closes. On wound L fins, salt also creeps between foot and tube, corroding the contact and loosening the fin — which is why coastal bundles favour <a href="/blog/extruded-fin-tubes-coastal-air-coolers">extruded or LL fins</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Cleaning without damage.', anchor: 'cleaning' },
    {
      type: 'prose',
      html: '<ol><li>Stop and lock out the fans.</li><li>Clean from the air-exit side where you can reach it, so deposits leave the way they entered.</li><li>Use low-pressure water or air, with the jet parallel to the fins and the nozzle held back from the face.</li><li>For oily deposits, use a cleaner the fin and tube metals tolerate, then rinse.</li><li>Comb out any bent fins before returning to service.</li></ol>',
    },

    { type: 'section_head', number: '/03', title: 'Designing for dusty sites.', anchor: 'design' },
    {
      type: 'paragraph',
      html: 'When a bundle is replaced, fouling can be designed against. A lower fin density opens the gaps between fins; our aluminium air-cooler fins run from 4 to 12 fins per inch, and dusty sites sit at the lower end, at the cost of some surface. Full-cover fins keep salt off the tube. For flue gas, choose <a href="/blog/serrated-vs-solid-spiral-fin-tubes">solid rather than serrated fins</a> where the gas is dirty, <a href="/p/h-fin-and-rectangular-fin-tubes">H-fins</a> whose straight gas lanes resist fouling, or <a href="/p/studded-tubes">studded tubes</a> for fuel-oil firing.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I pressure-wash air-cooler fins?', answer: 'Only at low pressure and with the jet in line with the fins. High pressure flattens aluminium fins.' },
        { question: 'Which side should be cleaned first?', answer: 'The air-exit side, pushing deposits back towards the inlet face.' },
        { question: 'Does fin density affect fouling?', answer: 'Yes. Fewer fins per inch leave wider gaps that take longer to bridge.' },
        { question: 'Which fins resist fouling in flue gas?', answer: 'Solid spiral fins, H-fins with straight gas lanes, and studs for fuel-oil firing.' },
        { question: 'When should coolers be cleaned?', answer: 'Before the hot season, and after sandstorms, so they start the summer clean.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Finned tube in the catalogue',
      skus: ['IH-TF-EX-ALU', 'IH-TF-WF-LL', 'IH-TF-HR-HFN', 'IH-TF-HF-HFW', 'IH-TF-ST-STD'],
    },
    { type: 'category_link', slug: 'finned-tubes', label: 'Finned tubes', blurb: 'Every fin type we supply, with sizes and part numbers.' },
    {
      type: 'related_articles',
      slugs: ['types-of-finned-tubes', 'air-cooler-bundle-replacement-data-sheet'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'General cleaning practice; follow the cooler maker’s instructions and your site’s isolation procedures.',
    },
    {
      type: 'cta_block',
      heading: 'Fins beyond cleaning?',
      body: 'Send the bundle data. We quote replacement finned tube or a complete bundle.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
