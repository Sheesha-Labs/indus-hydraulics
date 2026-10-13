import type { BlogArticleSeed } from '../shared'

/**
 * Concrete placement hose. Checked 2026-10-13: Pumps & Systems and World Pumps on the Burj Khalifa
 * pumping record (601 m, Nov 2007; 606 m, Apr 2008); trade sources on boom/line pump pressures
 * (medium — given as "typically"); WorkSafe Queensland on hose whip causes and controls; EN 12001
 * scope (SIS). EN 12001's end-hose clauses are NOT described (paywalled). Product facts from
 * IH-LF-TCP; the 3"/4" standard-class working pressure is unpublished.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'concrete-placement-hose-guide',
  title: 'Concrete placement hose: pressure classes, pump pressures and hose whip',
  excerpt:
    'Concrete pumps work at pressures that would burst most hose, and the flexible end hose is where crews stand. How boom and line pumps differ, what pressure the placement hose actually sees, how to choose between standard and high-pressure classes, and how to prevent the most dangerous event on a pour — hose whip.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Concrete Placement Hose: Pressure Classes and Hose Whip',
  seoDescription:
    'How to choose concrete placement hose: boom vs line pump pressures, standard vs high-pressure hose classes, where flexible hose belongs in the delivery line, hose whip causes and controls, and EN 12001.',
  focusKeyword: 'concrete placement hose',
  publishedAt: '2026-10-13T21:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Boom pumps commonly run at about 85 bar (low setting) or 130 bar (high), with boom delivery lines typically limited to 85 bar; trailer-mounted line pumps are often rated 125–160 bar.',
        'Pressure is highest at the pump and falls along the line, so flexible hose belongs where the rating covers the pressure at that point — usually the end.',
        'Our TPU placement hose comes in a standard class and a high-pressure class rated 75–85 bar working, 150–170 bar burst.',
        'Hose whip is mostly caused by trapped air — at start-up, after moving the pump and after clearing a blockage.',
        'No metal fittings on the free end, start slowly, keep an exclusion zone, and never clean out with compressed air.',
      ],
    },
    {
      type: 'lead',
      html: 'In November 2007 concrete was pumped to a height of 601 metres at the Burj Khalifa — then called Burj Dubai — through a 150 mm steel pipeline, a world record raised to 606 m in April 2008. Most pours are less dramatic, but the physics is the same: a piston pump forces a heavy, abrasive, semi-solid material through a pipeline at high pressure, and at the end a flexible hose lets the crew put it exactly where it is needed. That last hose is the part people hold — and the part that must be specified right.',
    },

    { type: 'section_head', number: '/01', title: 'Boom pumps, line pumps and pressure.', anchor: 'pumps' },
    {
      type: 'paragraph',
      html: 'A <strong>boom pump</strong> carries its delivery line along a folding boom and places concrete through an end hose hanging from the tip. A <strong>line pump</strong> (trailer or truck-mounted) pushes concrete through steel pipe and hose laid across the site or up the building — the method for long horizontal runs, tunnels and high-rise cores. Trade sources describe boom pumps with two common pressure settings, around 85 bar and 130 bar, with boom delivery lines typically limited to 85 bar, and mainstream line pumps rated around 125 to 160 bar. The highest pressure is at the pump outlet; it falls along the line as the concrete overcomes friction and lift.',
    },
    {
      type: 'direct_answer',
      question: 'What pressure rating does concrete pump hose need?',
      answer:
        'At least the maximum concrete pressure at the point in the line where the hose is fitted. That is highest at the pump — commonly 85 bar or more on boom pumps and up to 125–160 bar on line pumps — and falls along the line. Use high-pressure hose or steel pipe near the pump, and check the end hose against the pump’s maximum setting.',
    },

    { type: 'section_head', number: '/02', title: 'Choosing a pressure class.', anchor: 'classes' },
    {
      type: 'comparison_table',
      caption: 'Our TPU lay flat concrete placement hose',
      columns: ['Class', 'Sizes', 'Working pressure', 'Burst pressure'],
      rows: [
        { cells: ['Standard', '3", 4", 5"', '50 bar at 5"; 3" and 4" confirmed with the quotation', '100–126 bar'] },
        { cells: ['High-pressure', '3" to 5"', '75–85 bar', '150–170 bar'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-concrete-placement-hose">TPU concrete placement hose</a> is light and flexible enough for crews to move the end by hand, flattens for transport, and has a smooth bore that keeps flow steady and resists blockage. Match the class to the pump’s maximum concrete pressure at the point of use: the high-pressure class for long or high pumping lines, the standard class where pressure at the hose is lower, such as grouting and short placing runs. Where the line pressure exceeds the hose rating, use steel delivery pipe and keep the hose to the end, where pressure has fallen.',
    },

    { type: 'section_head', number: '/03', title: 'Hose whip.', anchor: 'whip' },
    {
      type: 'paragraph',
      html: 'Hose whip is the uncontrolled, violent movement of the flexible end hose, and it can cause serious injury or death. Workplace safety regulators such as WorkSafe Queensland identify trapped air as the main cause: air pockets compress in the line and release suddenly at the outlet. It happens most at <strong>start-up</strong>, after the pump has been <strong>moved or the line extended</strong>, and after a <strong>blockage has been cleared</strong>.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>No metal fittings on the free end</strong> of the hose — a whipping coupling or reducer is a weapon.</li><li><strong>Start the pump slowly</strong>, and restart slowly after any stop, move or blockage.</li><li><strong>Keep the hose near vertical</strong>, not stretched out or bent back on itself.</li><li><strong>Keep an exclusion zone</strong> around the hose at start-up and after stoppages; nobody holds the hose until flow is steady.</li><li><strong>Clean out with water, not compressed air.</strong></li><li><strong>Follow the pump maker’s instructions</strong> and EN 12001, the European safety standard for concrete pumps and their delivery lines.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Wear is a pressure problem.',
      body: 'Concrete is abrasive. A hose that has worn thin inside no longer has its rated pressure. Inspect end hoses before every pour, retire them on a schedule, and never use a hose that shows bulges, cover damage or coupling movement.',
    },

    { type: 'section_head', number: '/04', title: 'After the pour.', anchor: 'cleaning' },
    {
      type: 'paragraph',
      html: 'Clean the line and hose immediately with water and a cleaning ball or sponge, before the concrete starts to set; concrete left in a hose ends its life in hours. Flush the couplings, drain the hose, and store it flat or coiled loosely out of the sun. Lay flat placement hose rolls flat for transport, which saves space on the truck. For grout and cement slurry in tunnels and mines, the same hose and the same cleaning discipline apply.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is concrete hose whip?', answer: 'The sudden, violent movement of the flexible end hose, mostly caused by trapped air released at the outlet — at start-up, after moving the pump or after clearing a blockage.' },
        { question: 'What pressure do concrete pumps run at?', answer: 'Boom pumps commonly around 85 bar or 130 bar depending on setting, with boom lines typically limited to 85 bar; line pumps often 125–160 bar.' },
        { question: 'Can lay flat hose be used for concrete?', answer: 'Yes, if it is built for concrete and rated for the pressure at its position in the line. Our TPU placement hose comes in standard and high-pressure (75–85 bar) classes.' },
        { question: 'Should the end hose have a metal fitting?', answer: 'No. Safety regulators advise against metal fittings on the free end, because a whipping fitting can cause serious injury.' },
        { question: 'How high has concrete been pumped?', answer: 'To 606 m at the Burj Khalifa in April 2008, after a 601 m record in November 2007, through steel pipeline.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For concrete and grout',
      skus: ['IH-LF-TCP', 'IH-LF-CFL', 'IH-LF-CVG'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Including concrete placement hose in standard and high-pressure classes.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Concrete hose supply to Saudi Arabia',
      blurb: 'Placement hose for Saudi high-rise and infrastructure projects.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'norway',
      label: 'Concrete hose supply to Norway',
      blurb: 'Placement and grout hose for Norwegian tunnelling.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'germany',
      label: 'Concrete hose supply to Germany',
      blurb: 'Placement hose for German construction.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-pressure-ratings', 'why-lay-flat-hose-fails', 'tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Burj Khalifa pumping record from Pumps & Systems and World Pumps; hose whip from WorkSafe Queensland; pump pressures from trade sources. Hose facts from the Indus concrete placement hose listing.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying placement hose?',
      body: 'Send the pump type, maximum concrete pressure, line layout and hose position. We will recommend the class and confirm the rating.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
