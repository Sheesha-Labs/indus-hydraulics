import type { BlogArticleSeed } from '../shared'

/**
 * Crane winch load monitoring. Checked 2026-10-21 against Dinamic Oil's hydraulic winch catalogue W21/A pp. 77–88:
 * accessory codes B, C1, C2, D, E, ELD, F1, F2; strain-gauge limiter (Wheatstone bridge on a steel bar, compares
 * with set value, solenoid valve stops hoisting, lowering allowed, independent of rope layer); load cells under a
 * floating base plate; ELD = anti-rotation flange with strain gauges + phonic wheel with two proximity sensors + cable
 * press micro switch + board with 8 connectors (PLC, PC via USB), layer and rope count, line pull shown on remote;
 * limiters on all series except SRD; electro-hydraulic schemes 12–24 V DC.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'crane-winch-load-monitoring',
  title: 'Crane winch load monitoring: limit switches, pull limiters, load cells and ELD',
  excerpt:
    'A crane winch can stop itself at the end of the rope, refuse to lift an overload, or tell the operator exactly what is on the hook. What each kind of winch load protection does, how it measures, and which one a crane needs.',
  categorySlug: 'safety',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Crane Winch Load Monitoring: Limiters and Load Cells',
  seoDescription:
    'Crane winch load monitoring explained: lowering and rotary limit switches, strain-gauge pull limiters, load cells and electronic load detection on every layer.',
  focusKeyword: 'crane winch load monitoring',
  publishedAt: '2026-10-21T00:33:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Limit switches stop travel: the lowering limit keeps the safety wraps on the drum, rotary switches set upper and lower limits.',
        'A pull limiter stops hoisting above a set load and still allows lowering.',
        'Measuring the winch structure gives the same reading on every rope layer; measuring drum torque does not.',
        'Load cells under a floating base plate read the load at the hook for alarms or display.',
        'Electronic load detection reads torque, drum turns and direction to show the real line pull, rope out and working layer.',
      ],
    },
    {
      type: 'lead',
      html: 'On a crane, the winch is where an overload or an over-run turns into an accident: a hook pulled into the boom tip, a rope run off the drum, a load beyond what the structure can hold. Most of that can be prevented at the winch itself, with devices fitted at the factory. Dinamic Oil’s hydraulic winch range shows the full set, from a simple lowering limit to electronic load detection.',
    },

    { type: 'section_head', number: '/01', title: 'Stopping travel.', anchor: 'limits' },
    {
      type: 'paragraph',
      html: 'The first protection is mechanical. A <strong>rope tensioner</strong> (code B) presses the rope onto the drum so it spools tight even with no load. Combined with a <strong>lowering limit switch</strong> — electric (C1) or a hydraulic end-stroke valve (C2) — it stops the winch paying out before the last safety wraps leave the drum. A <strong>rotary limit switch</strong> (F1 electric, F2 hydraulic) counts drum turns through a gear cam and stops hoisting and lowering at set points, the usual protection against two-blocking the hook.',
    },

    { type: 'section_head', number: '/02', title: 'Limiting the pull.', anchor: 'limiters' },
    {
      type: 'comparison_table',
      caption: 'How the load is measured',
      columns: ['Device', 'Measures', 'Reads the same on every layer?', 'Does'],
      rows: [
        { cells: ['Strain-gauge limiter (D)', 'Deformation of the winch structure', 'Yes', 'Stops hoisting above the set load; lowering stays possible'], highlight: true },
        { cells: ['Load cells (E)', 'Force on two cells under a floating base plate', 'Yes', 'Alarm, stop, or display of the load'] },
        { cells: ['Drum-torque sensing', 'Torque at the drum', 'No — the same pull gives more torque on outer layers', 'Needs the layer to be known to read pull'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Dinamic Oil’s strain-gauge limiter mounts a Wheatstone bridge of strain gauges on a steel bar fixed to the winch structure; an electronic board compares the signal with the set value and, above it, a solenoid valve stops hoisting while still allowing the load to be lowered. Because it measures how the structure deflects under rope pull rather than the torque on the drum, it is not fooled by the rope layer. Pull limiters are available across the range except the SRD series.',
    },
    {
      type: 'direct_answer',
      question: 'Why does a winch overload limiter need to know the rope layer?',
      answer:
        'A limiter that measures drum torque sees more torque for the same rope pull as the rope builds up on the drum, so it must know the layer to work out the pull. One that measures the deflection of the winch structure, or the force under the winch, reads the pull directly on any layer.',
    },

    { type: 'section_head', number: '/03', title: 'Electronic load detection.', anchor: 'eld' },
    {
      type: 'paragraph',
      html: 'Dinamic Oil’s ELD system goes further: an anti-rotation flange inside the drum, fitted with strain gauges, measures the torque; a phonic wheel with two proximity sensors measures drum speed and direction; and a rope-end micro switch on the tensioner resets the count. From these the control board knows how much rope is out, which layer is working and the actual line pull, and shows it on the crane’s remote control. It accepts analogue and digital signals and connects to a PLC or a PC.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Protection is not a licence to overload.',
      body: 'Limiters and load displays support the crane’s rated capacity chart and its own load moment system; they do not replace them, and they must be calibrated and tested with the crane.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can these be added to an existing winch?', answer: 'Some can, depending on the series and drum. Send the winch model and serial number to check what can be retrofitted.' },
        { question: 'Electric or hydraulic limit switch?', answer: 'Electric switches suit cranes with an electro-hydraulic control circuit (12–24 V DC); hydraulic end-stroke valves suit purely hydraulic controls.' },
        { question: 'Does ELD replace a load moment indicator?', answer: 'No. It measures the winch line pull, which can feed the crane’s load moment system, but the crane’s own system governs its capacity.' },
        { question: 'What is two-blocking?', answer: 'Hoisting until the hook block hits the boom tip. A rotary or upper limit switch stops the winch before it happens.' },
        { question: 'Which device does a man-riding winch need?', answer: 'A man-riding specification adds a secondary brake and its own protections; it is built to order, not added by accessory code.' },
      ],
    },
    { type: 'product_embed', heading: 'Winches and accessories', skus: ['IH-DO-WACC', 'IH-DO-SE', 'IH-DO-CW', 'IH-DO-S'] },
    { type: 'category_link', slug: 'gearbox-winch-accessories', label: 'Gearbox and winch accessories', blurb: 'Brakes, coolers, limit switches, limiters and ELD.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck and service cranes.' },
    { type: 'related_articles', slugs: ['hydraulic-winch-sizing', 'dnv-type-approval-crane-gearboxes', 'mobile-crane-hydraulic-hose'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-21', note: 'Devices, measuring principles and availability from Dinamic Oil’s hydraulic winch catalogue (W21/A).' },
    {
      type: 'cta_block',
      heading: 'Adding load protection?',
      body: 'Send the crane, winch model and control circuit. We will propose the Dinamic Oil limit switches, limiter or ELD to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
