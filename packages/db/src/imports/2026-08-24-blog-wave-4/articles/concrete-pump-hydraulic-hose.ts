import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'concrete-pump-hydraulic-hose',
  title: 'Concrete pumps: the highest-pressure hydraulics on most sites',
  excerpt:
    'A truck-mounted pump runs pumping pressures well above ordinary construction plant, on a duty cycle that reverses continuously. Do not confuse the hydraulic hoses with the delivery hose — they are different problems entirely.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Concrete pump hydraulic hose — pumping circuits and boom lines',
  seoDescription:
    'Hydraulic hose on truck-mounted concrete pumps: high-pressure pumping circuits, boom and outrigger lines, cyclic duty, and why delivery hose is a separate subject.',
  focusKeyword: 'concrete pump hydraulic hose',
  publishedAt: '2026-08-27T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The hydraulic circuit that drives the pump and the delivery line that carries concrete are completely different components. Do not conflate them.',
        'Pumping circuits run high pressure and reverse continuously, which is impulse duty rather than steady duty.',
        'Impulse duty is what spiral construction exists for — braid loses rating steeply as bore rises.',
        'Boom hoses run the length of a folding, slewing structure and see everything the truck crane hoses see.',
        'Outriggers hold a top-heavy machine upright while it pumps. Their hoses are structural.',
      ],
    },
    {
      type: 'lead',
      html: 'A concrete pump is the machine on a typical site whose hydraulics are working hardest — high pressure, high flow, and a cycle that reverses every few seconds for hours. It is also the machine where the word "hose" means two entirely different things depending on who is speaking.',
    },

    { type: 'section_head', number: '/01', title: 'Two kinds of hose, one machine.', anchor: 'two-kinds' },
    {
      type: 'comparison_table',
      caption: 'Do not confuse these',
      columns: ['Property', 'Hydraulic hose', 'Concrete delivery hose'],
      rows: [
        { cells: ['Carries', 'Hydraulic fluid', 'Concrete'] },
        { cells: ['Selected on', 'Pressure at bore, bend radius, temperature', 'Abrasion life and burst rating for concrete duty'], highlight: true },
        { cells: ['Fails as', 'Loss of function; injection risk', 'Blockage, burst, or whipping under pressure'] },
        { cells: ['Covered here', 'Yes', 'No — a separate subject'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A concrete delivery line failure is a different hazard entirely.',
      body: 'A blocked or bursting delivery line can whip and can discharge under pressure. Nothing in this article is about that; it is about the hydraulics that drive the machine. If your question is about the delivery line, treat it as its own specification and its own safety case.',
    },

    { type: 'section_head', number: '/02', title: 'Why pumping circuits are impulse duty.', anchor: 'impulse' },
    {
      type: 'paragraph',
      html: 'The pumping cylinders alternate: one pushes while the other draws, then they swap, continuously. From the hose’s point of view that is not steady pressure — it is a pressure cycle, repeated for as long as the pour lasts. <strong>Cycle count, not peak pressure, is what consumes an assembly on this duty.</strong>',
    },
    {
      type: 'paragraph',
      html: 'That is the case spiral construction exists for. Braided hose loses rating steeply as bore rises, while spiral holds a near-flat figure across its range — which is why the large-bore, high-pressure, high-cycle circuits on a pump are spiral rather than braid.',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure in bar at large bore — why spiral is used here',
      columns: ['Construction', '−16', '−20', '−24', '−32'],
      rows: [
        { cells: ['EN 853 2SN braid', '165', '125', '90', '80'] },
        { cells: ['EN 856 4SH spiral', '380', '350', '300', '250'], highlight: true },
        { cells: ['SAE 100R13 spiral', '350', '350', '350', '350'], highlight: true },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What hose is used on a concrete pump’s hydraulics?',
      answer:
        'Spiral construction on the high-pressure pumping circuits, because the duty is cyclic and the bores are large — braided hose loses most of its rating as bore rises, while spiral holds a near-flat figure. Boom, outrigger and ancillary circuits use grades appropriate to their own pressures. The concrete delivery line is a separate component entirely.',
    },

    { type: 'section_head', number: '/03', title: 'Boom and outriggers.', anchor: 'boom-outriggers' },
    {
      type: 'paragraph',
      html: 'The placing boom folds, slews and telescopes, and carries hoses along its length in the same way a truck crane does — with the same transit-versus-deployed geometry problem, and the same tendency for a replacement measured in one position to fail in the other.',
    },
    {
      type: 'paragraph',
      html: 'Outriggers on a pump are carrying a machine with a long boom extended over a site. <strong>They are structural to the safety of the whole operation</strong>, and their hoses sit low, get concrete on them, and get washed down aggressively at the end of every pour.',
    },
    { type: 'product_embed', heading: 'Spiral constructions for pumping circuits', skus: ['IH-HOSE-4SH', 'IH-HOSE-R13', 'IH-HOSE-R15'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Spiral constructions for impulse duty.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I fit braided hose to a pumping circuit to save cost?', answer: 'Not at the bores these circuits use. At −24 a two-wire braid is rated 90 bar against 300 for four-spiral; that is not a saving, it is a different component. Compare at the bore before treating any substitution as equivalent.' },
        { question: 'Washing the machine down damages hoses. What can we do?', answer: 'Keep the lance at a distance and away from hose ends and fittings. Close-range pressure washing drives water through covers and strips them at existing scars — which then corrodes the reinforcement invisibly.' },
        { question: 'How often should pump hydraulic hoses be replaced?', answer: 'On a schedule reflecting cycle count rather than calendar age alone. A pump doing continuous pours accumulates cycles far faster than a machine of similar age doing intermittent work.' },
        { question: 'Do you cover concrete delivery hose?', answer: 'It is a separate specification with its own safety considerations and is not what this article covers. Ask us and we will point you at the right product rather than at this page.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Pressure figures from the Intertraco (Italia) S.p.A. catalogue for the constructions we stock. No machine-specific circuit pressures — those come from the pump manufacturer.',
    },
    { type: 'cta_block', heading: 'Pump down mid-pour?', body: 'Tell us the circuit and the bore. Spiral grades are stocked in Dubai and we build same day, on site where needed.', quoteLabel: 'Get a pump hose made' },
  ],
}

export default ARTICLE
