import type { BlogArticleSeed } from '../shared'

/**
 * Winch drive vs motor drum vs complete winch. Checked 2026-10-20 against Dinamic Oil's Planetary Winch Drives
 * catalogue: WD 3/4 stages 18–400 kNm FEM, RW 5–18 kNm and 2-stage to ~30 kNm for electric drives, single support
 * bearing (isostatic, outboard drum bearing needed), oil checked from motor side, WDD 7,500–30,000 kg with drum and
 * opposite support, drum to order above minimums, smooth / standard / Lebus grooving; T2 FEM M5-L2-T5 at 25 rpm and
 * coefficient c (L3-T4 at 12 rpm -> 0.90); custom rotating-case units to 3,000,000 Nm; DNV TAS00000YS / TAS00001JK.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'winch-drive-vs-motor-drum-vs-complete-winch',
  title: 'Winch drive, motor drum or complete winch: which to buy for a crane or offshore winch',
  excerpt:
    'Crane and winch builders can buy the drive, the drive already built into its drum, or the whole winch. What each one leaves you to design, how a rotating-case winch drive is rated under FEM, and where class approval comes in.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Winch Drive vs Motor Drum vs Complete Hydraulic Winch',
  seoDescription:
    'Planetary winch drive, motorized drum or complete winch: what each includes, FEM torque ratings and class factors, drum support, brakes and DNV type approval.',
  focusKeyword: 'winch drive vs motor drum',
  publishedAt: '2026-10-20T19:43:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A winch drive is a rotating-case planetary gearbox that sits inside your drum; you design the drum, frame and outboard bearing.',
        'A motor drum is the drive already built into a drum with its outboard support; you design only the frame.',
        'A complete winch arrives tested with motor, brake, valve, drum and frame — the fastest route for standard pulls.',
        'Winch drives are rated by FEM torque at 25 rpm in class M5-L2-T5; other classes take a correction coefficient.',
        'Class approval is easiest when the drive already holds a type approval for the rules the vessel or rig is built to.',
      ],
    },
    {
      type: 'lead',
      html: 'A builder of offshore cranes, piling rigs or deck machinery rarely wants a catalogue winch: the drum length, rope capacity, frame and controls are set by the machine. But building a winch from a bare gearbox means designing bearings, brakes and lubrication too. Dinamic Oil sells all three levels, which makes the trade-off clear.',
    },

    { type: 'section_head', number: '/01', title: 'The three options.', anchor: 'options' },
    {
      type: 'comparison_table',
      caption: 'What each option includes (Dinamic Oil ranges)',
      columns: ['Feature', 'Winch drive (WD, RW)', 'Motor drum (WDD)', 'Complete winch (NP to SRD)'],
      rows: [
        { cells: ['You design', 'Drum, frame, outboard bearing', 'Frame only', 'Mounting and circuit only'] },
        { cells: ['Supplied', 'Gearbox with brake, set up for a motor', 'Gearbox, drum and opposite support', 'Motor, brake, lowering valve, gearbox, drum, frame'], highlight: true },
        { cells: ['Range', 'WD 18–400 kNm, RW 7–33 kNm (FEM)', '7,500 to 30,000 daN line pull', '500 to 29,700 daN line pull'] },
        { cells: ['Drum', 'Your own', 'Length and diameter to order', 'Catalogue sizes'] },
        { cells: ['Class approval', 'DNV type approved (RW, 3-stage WD)', 'Drive approved, drum per project', 'Per project'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Why the drum needs a second bearing.', anchor: 'bearing' },
    {
      type: 'paragraph',
      html: 'A rotating-case winch drive has a fixed flange bolted to the winch frame and a rotating flange bolted to the drum, carried on a single bearing. That keeps the winch isostatic — the load on the drive bearing does not depend on how stiff the frame is — but it means the drum has to be supported on the other end by an outboard bearing. The bearing that carries the rotating flange has its own static and dynamic ratings, and its life (Lh10) has to meet the duty class as well as the gears.',
    },
    {
      type: 'direct_answer',
      question: 'What is a motorized winch drum?',
      answer:
        'A motorized (motor) drum is a winch drum with the planetary drive built inside it and the outboard support already fitted. The builder adds the frame and the motor. Dinamic Oil’s WDD drums are built on its WD winch drives and cover 7,500 to 30,000 daN first-layer pull, with drum length and diameter made to order.',
    },

    { type: 'section_head', number: '/03', title: 'Reading an FEM rating.', anchor: 'fem' },
    {
      type: 'paragraph',
      html: 'Winch drives are rated by <strong>T2 FEM</strong>: the torque the gearbox can transmit in FEM 1.001 mechanism class M5 (load spectrum L2, utilisation T5) at 25 rpm. For another class or speed, find the equivalent class at 25 rpm and multiply T2 FEM by the catalogue coefficient c — class L3-T4 at 12 rpm, for example, is worth 0.90 of the rating. The result must exceed the application torque, including accelerations and drive efficiency, and the dynamic and static peaks must stay below the maximum dynamic and static torques. For continuous input speeds above 1,500 rpm, Dinamic Oil recommends its high-speed brake versions.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Bigger than the catalogue.',
      body: 'For heavier winches Dinamic Oil builds made-to-measure rotating-case drives up to 3,000,000 Nm, in-line or right-angle, with one or several motor inputs.',
    },

    { type: 'section_head', number: '/04', title: 'Class approval.', anchor: 'class' },
    {
      type: 'paragraph',
      html: 'On a classed vessel or offshore unit the winch has to satisfy the class society’s lifting-appliance rules. A drive that already holds a type approval shortens that process: Dinamic Oil’s RW range holds DNV type approval TAS00001JK (shipboard and offshore lifting appliances, lifeboat and davit winches, drilling facilities) and the three-stage WD sizes hold TAS00000YS. See <a href="/blog/dnv-type-approval-crane-gearboxes">DNV and ABS type approval</a> for what a type approval does and does not cover.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I check the oil without unwinding the rope?', answer: 'On the WD range, yes: the oil is checked and changed from the motor side.' },
        { question: 'Hydraulic or electric?', answer: 'The standard build is set up for a hydraulic motor with a negative brake; versions for an electric motor, or with a high-speed input shaft, are available. Two-stage RW drives give ratios suited to electric drives.' },
        { question: 'What brake comes with a winch drive?', answer: 'A negative multi-disc parking brake sized to the gearbox torque — FW up to 1,600 Nm or FY up to 3,600 Nm on the WD range, with an optional freewheel.' },
        { question: 'How is the rope anchored?', answer: 'With clamps as standard, or a wedge lock on request.' },
        { question: 'Which grooving for the drum?', answer: 'Smooth, standard grooving or Lebus-type grooving for multi-layer spooling under load.' },
      ],
    },
    { type: 'product_embed', heading: 'Winch drives and motor drums', skus: ['IH-DO-WD', 'IH-DO-RW', 'IH-DO-WDD', 'IH-DO-SRD'] },
    { type: 'category_link', slug: 'winch-drives', label: 'Winch drives and motor drums', blurb: 'WD, RW and WDD from Dinamic Oil.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck machinery and offshore cranes.' },
    { type: 'related_articles', slugs: ['hydraulic-winch-sizing', 'dnv-type-approval-crane-gearboxes', 'offshore-hydraulic-hose'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Ranges, FEM rating method and approvals from Dinamic Oil’s Planetary Winch Drives catalogue and DNV certificates.' },
    {
      type: 'cta_block',
      heading: 'Building a winch?',
      body: 'Send the line pull, rope, drum space, duty class and any class rules. We will propose a drive, a motor drum or a complete Dinamic Oil winch.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
