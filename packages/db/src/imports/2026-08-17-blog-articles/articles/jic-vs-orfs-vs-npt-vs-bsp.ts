import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'jic-vs-orfs-vs-npt-vs-bsp',
  title: 'JIC vs ORFS vs NPT vs BSP: the four connector families, compared',
  excerpt:
    'Four families cover almost every hydraulic connection you will meet. What each one seals on, which are re-makeable, and which pairs will thread together and still fail.',
  categorySlug: 'fitting-identification',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'JIC vs ORFS vs NPT vs BSP — differences and what interchanges',
  seoDescription:
    'Compare JIC 37°, ORFS, NPT and BSP hydraulic fittings: sealing method, re-makeability, vibration tolerance and which combinations leak.',
  focusKeyword: 'jic vs orfs vs npt',
  publishedAt: '2026-08-17T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The families differ in one thing that matters most: what makes the seal. Two use a metal cone, one uses an elastomer, and one uses the threads themselves.',
        'ORFS is the most tolerant of vibration, because an O-ring keeps sealing through movement that would work a metal cone loose.',
        'JIC is the most widely stocked and the easiest to source anywhere — including at short notice in the Gulf.',
        'Thread-sealing families (NPT, BSPT) degrade each time they are broken and re-made. Cone and face-seal families do not.',
        'BSP and NPT are the pairing to watch. Different thread angles, similar sizes, and a joint that leaks after the machine goes back to work.',
      ],
    },
    {
      type: 'lead',
      html: 'Most arguments about which fitting family is "best" are really arguments about the application. A connection on a static power pack and one on an excavator boom face completely different problems, and the family that suits one is a poor choice for the other.',
    },

    { type: 'section_head', number: '/01', title: 'Side by side.', anchor: 'side-by-side' },
    {
      type: 'comparison_table',
      caption: 'The four families on the properties that decide selection',
      columns: ['Property', 'JIC 37°', 'ORFS', 'BSP parallel', 'NPT'],
      rows: [
        { cells: ['What seals', '37° metal cone', 'O-ring on a flat face', '60° cone or bonded washer', 'Thread interference'] },
        { cells: ['Thread form', '60° UN/UNF', '60° UN/UNF', '55° Whitworth', '60° UN, tapered'] },
        { cells: ['Needs a sealant', 'No', 'No', 'No', 'Yes'] },
        { cells: ['Tolerates vibration', 'Moderate', 'Best of the four', 'Moderate', 'Poor'], highlight: true },
        { cells: ['Re-makeable', 'Yes', 'Yes, replace the O-ring', 'Yes', 'Degrades each make'] },
        { cells: ['Fails when…', 'Flare is nicked or over-torqued', 'O-ring is missing or perished', 'Seat or washer is damaged', 'Threads are worn or sealant is wrong'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read that table by column and a pattern appears. The three parallel families put the seal on a dedicated feature and use the threads only for clamping force, which is why all three survive being taken apart. NPT makes the threads do both jobs, and that is the source of both its convenience and its limitations.',
    },

    { type: 'section_head', number: '/02', title: 'Choosing between them.', anchor: 'choosing' },
    {
      type: 'direct_answer',
      question: 'Which hydraulic fitting is best for high vibration?',
      answer:
        'ORFS. The seal is an elastomeric O-ring compressed between two flat faces, so it continues to seal through relative movement that would gradually unseat a metal cone. On mobile equipment and anything with a reciprocating load, it is the family that stays dry longest.',
    },
    {
      type: 'decision_tree',
      heading: 'What the application is telling you',
      branches: [
        { condition: 'Mobile plant, high vibration, connections that stay made for years', outcome: 'ORFS.', detail: 'Best vibration tolerance of the four. The trade-off is that the O-ring is a consumable you must not lose during service.', sku: 'IH-ORFS-FEM-45' },
        { condition: 'General hydraulics, connections broken regularly for service', outcome: 'JIC 37°.', detail: 'Re-makeable, universally stocked, and the flare is inspectable — you can see whether the seat is damaged.', sku: 'IH-JIC-FEM-37-45' },
        { condition: 'Existing British or Indian-built equipment', outcome: 'BSP, matching whatever the port already is.', detail: 'Changing family on an installed machine means adapters, and every adapter is another joint that can leak.', sku: 'IH-BSP-FEM-60-45' },
        { condition: 'European or Japanese equipment with metric ports', outcome: 'Metric DIN 24° cone — light or heavy series.', detail: 'Confirm the series before ordering; L and S share the seat angle but not the thread.', sku: 'IH-DF-FEM-24-OR-LS-45' },
        { condition: 'Low-pressure ancillary, gauges, drains', outcome: 'NPT is acceptable and often what is already there.', detail: 'Accept that each break degrades the joint, and replace rather than re-sealing a connection that has been made several times.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Adapting between families adds joints.',
      body: 'Every adapter is another potential leak path and another thing to identify at 2am. Where a machine is consistently one family, staying with it is usually worth more than the theoretical advantage of switching.',
    },

    { type: 'section_head', number: '/03', title: 'What does not interchange.', anchor: 'what-does-not' },
    {
      type: 'paragraph',
      html: 'The dangerous combinations are the ones that <em>partially</em> work. <strong>BSP and NPT</strong> share nothing but approximate size — 55° against 60° thread angle — yet will start together and take a wrench. <strong>JIC 37° and Komatsu 30°</strong> will mate and seal poorly, because the flare and the seat touch on a line rather than a face. Neither failure is obvious at assembly.',
    },
    {
      type: 'product_embed',
      heading: 'One from each family',
      skus: ['IH-JIC-FEM-37-45', 'IH-ORFS-FEM-45', 'IH-BSP-FEM-60-45', 'IH-DF-FEM-24-OR-LS-45'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is ORFS worth the extra cost over JIC?', answer: 'On mobile equipment and anything vibrating, usually yes — the failure it prevents costs more than the fitting. On a static installation broken open regularly for service, JIC is easier to live with and easier to source.' },
        { question: 'Can I put a JIC fitting into an ORFS port?', answer: 'No. The threads may be similar on some sizes but the sealing faces are completely different geometries — a cone against a flat face with an O-ring groove. There is nothing for either to seal against.' },
        { question: 'Why is NPT still so common if it degrades?', answer: 'It is cheap, widely available, and perfectly adequate where a joint is made once and left. The problems appear on connections that get broken repeatedly, which is a maintenance pattern rather than a property of the fitting.' },
        { question: 'What do I do if a machine has all four?', answer: 'That is normal on older plant and on anything rebuilt more than once. Standardise as you replace assemblies rather than in one campaign, and keep an identification chart at the bench.' },
      ],
    },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Fittings and adapters, all four families', blurb: 'JIC, ORFS, BSP, metric DIN and SAE flange, plus the adapters between them.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Comparison covers sealing method and geometry. No pressure ratings published here — those are per size and grade.' },
    { type: 'cta_block', heading: 'Standardising a fleet?', body: 'Send us the machine list and what is currently fitted. We will come back with a consolidated line and what it costs to move to it.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
