import type { BlogArticleSeed } from '../shared'

/**
 * Hydraulic winch sizing. Checked 2026-10-20 against Dinamic Oil hydraulic winch catalogue W21/A, technical notes
 * pp. 5–10: rope-capacity formulas (smooth / standard grooved / special grooved), flange margin K (1.5 Øf standard,
 * 2.5 ABS/API 2C, 2 DNV, 1/2" ANSI B30), drum torque and hoisting pressure, reeving F = P / (n x eta) with the
 * plain/antifriction efficiency table, power Pm = vf x F / 6000, ISO 4301/1 classes by series, 4 wraps minimum.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-winch-sizing',
  title: 'Hydraulic winch sizing: line pull per layer, reeving, rope capacity and oil flow',
  excerpt:
    'A winch rated at 5,000 daN does not pull 5,000 daN on every layer, and a hook block does not simply divide the load by the number of falls. How to size a hydraulic hoisting winch — pull on the working layer, reeving losses, rope capacity, pressure and flow — with the formulas from Dinamic Oil’s winch catalogue.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Winch Sizing: Line Pull, Rope and Oil Flow',
  seoDescription:
    'How to size a hydraulic winch: line pull per rope layer, reeving efficiency, rope capacity, flange margin for DNV and ABS, hoisting pressure and oil flow.',
  focusKeyword: 'hydraulic winch sizing',
  publishedAt: '2026-10-20T19:41:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Line pull falls and rope speed rises with every layer: size on the layer the winch actually lifts from.',
        'With a hook block, drum pull = hook load ÷ (falls × reeving efficiency) — four falls on plain sheaves is 0.93, not 1.',
        'Rope capacity depends on drum length and diameter, rope diameter, layers and grooving, minus a flange margin.',
        'DNV asks for 2 rope diameters of flange margin above the top layer, ABS and API 2C for 2.5; the standard is 1.5.',
        'Pressure sets the pull, flow sets the speed: check both against what the machine’s pump delivers.',
      ],
    },
    {
      type: 'lead',
      html: 'Winch catalogues headline the first-layer pull because it is the biggest number. On the top layer the rope sits on a larger diameter, so the same drum torque gives less pull and more speed — on a typical four-layer winch, around 20 % less pull. Pick a winch on its first-layer rating for a lift made from the top layer, and the load stops halfway up. The method below uses the notes in Dinamic Oil’s hydraulic winch catalogue.',
    },

    { type: 'section_head', number: '/01', title: 'Pull at the drum, not at the hook.', anchor: 'reeving' },
    {
      type: 'paragraph',
      html: 'With a hook block, the drum pull is the hook load divided by the number of falls and by the efficiency of the reeving: <strong>F = P ÷ (n × η)</strong>. Every sheave loses a little, so η falls as falls are added.',
    },
    {
      type: 'comparison_table',
      caption: 'Reeving efficiency by number of falls (Dinamic Oil winch catalogue)',
      columns: ['Falls', '2', '3', '4', '5', '6', '8', '10'],
      rows: [
        { cells: ['Plain bearings', '0.97', '0.95', '0.93', '0.91', '0.90', '0.86', '0.83'] },
        { cells: ['Antifriction bearings', '0.98', '0.97', '0.96', '0.95', '0.94', '0.92', '0.90'], highlight: true },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How much drum pull does a 10 tonne load on four falls need?',
      answer:
        'With 10,000 daN at the hook, four falls and plain-bearing sheaves (efficiency 0.93), the drum must pull 10,000 ÷ (4 × 0.93) = 2,690 daN on the layer the load is lifted from — not 2,500 daN.',
    },

    { type: 'section_head', number: '/02', title: 'Rope capacity and flange margin.', anchor: 'capacity' },
    {
      type: 'paragraph',
      html: 'Rope length on a drum follows from the drum length l, the barrel diameter Øt, the rope diameter Øf and the number of layers z. On a smooth drum, <strong>L = [l ÷ Øf − 1] × [(Øt + Øf) + Øf × (z − 1)] × π × z ÷ 1000</strong> metres; on a grooved drum the groove pitch p replaces Øf in the first bracket. Above the top layer the flange must stand proud by a margin K: 1.5 rope diameters as standard, 2 under DNV rules, 2.5 under ABS and API 2C, and half an inch under ANSI B30. A class job therefore holds less rope on the same drum.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never run the drum empty.',
      body: 'Keep at least four wraps of rope on the drum of a hoisting winch (five on a pulling winch): the rope anchor is not designed to carry the load.',
    },

    { type: 'section_head', number: '/03', title: 'Pressure, flow and power.', anchor: 'hydraulics' },
    {
      type: 'paragraph',
      html: 'The hoisting pressure follows from the drum torque, the ratio and the motor displacement; the rope speed follows from the oil flow. The mechanical power at the rope is <strong>Pm (kW) = rope speed (m/min) × pull (daN) ÷ 6,000</strong>, and the hydraulic power supplied, flow (L/min) × pressure (bar) ÷ 600, must exceed it after the gear, drum and motor losses. Datasheets give the pressure and flow for each model; check them against the pump and relief setting you have, and keep the return-line back-pressure under 5 bar.',
    },

    { type: 'section_head', number: '/04', title: 'Duty class.', anchor: 'class' },
    {
      type: 'paragraph',
      html: 'Winches are classified by mechanism group under ISO 4301/1 (FEM 1.001): how often, how long and how heavily they lift. Dinamic Oil’s compact NP and A series sit in M4 to M6, the CW crane winches M2 to M5, the S and SE series M4 to M5 and the heavy SRD series M5 to M7. A winch on a crane that lifts all day needs a higher class than one that lifts a few times a shift, even at the same pull.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which layer should I size on?', answer: 'The layer the load is lifted from in the worst case, usually the top layer of a full drum.' },
        { question: 'Smooth or grooved drum?', answer: 'Grooved drums spool more evenly and protect the rope; smooth drums hold slightly more rope and suit low-layer work.' },
        { question: 'Can a hoisting winch lift people?', answer: 'Not a standard one. Man-riding needs a winch built to that specification, with a second brake.' },
        { question: 'Why does my winch slow down near the top?', answer: 'It should speed up as layers build. If it slows, check the flow at the winch and the relief setting.' },
        { question: 'What rope should I use?', answer: 'The diameter the drum is grooved for, in a construction suited to multi-layer spooling; Dinamic Oil recommends anti-twist ropes for hook blocks.' },
      ],
    },
    { type: 'product_embed', heading: 'Hydraulic winches', skus: ['IH-DO-S', 'IH-DO-SE', 'IH-DO-CW', 'IH-DO-SRD', 'IH-DO-WDD'] },
    { type: 'category_link', slug: 'hydraulic-winches', label: 'Hydraulic winches', blurb: 'Dinamic Oil NP to SRD, 500 to 29,700 daN.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Cranes, piling and drilling rigs.' },
    { type: 'related_articles', slugs: ['wire-rope-construction-explained', 'winch-drive-vs-motor-drum-vs-complete-winch', 'mobile-crane-hydraulic-hose'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Formulas, efficiencies, flange margins and classes from Dinamic Oil’s hydraulic winch catalogue (W21/A).' },
    {
      type: 'cta_block',
      heading: 'Sizing a winch?',
      body: 'Send the hook load, reeving, lift height, rope speed and the pump flow and pressure you have. We will propose the Dinamic Oil model and send its layer-by-layer datasheet.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
