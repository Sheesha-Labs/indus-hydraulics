import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Manual, mechanical and air-piloted valves. Symbol conventions — actuation drawn at the ends of the position squares,
 * the symbol shows stability and reset (Hafner-Pneumatik training course ch. 5, citing DIN ISO 1219). Pilot ports
 * 12/14 (Festo training table citing ISO 5599-3). Two-hand control: definition, type I/II/IIIA/IIIB/IIIC requirement
 * table, synchronous actuation ≤0.5 s, PL c / PL d cat 3 / PL e cat 4 by type, controls outside the hazardous area,
 * protection only for the person actuating, safety distance S = 1.6 × t + 0.25 m, equal-length pilot tubes,
 * ≤10 m to the machine, Type IIIA device: 0.4 s, 2.5–8 bar, −10 to +60 °C, PL c (Metal Work SAFE AIR two-hand
 * control device manual, code 0227700000, citing EN ISO 13851:2019 and EN ISO 13849-1:2015). ISO 13851 scope: does
 * not say which machines need a two-hand device or which type — risk assessment (ISO 13851:2019 abstract, national
 * standards bodies). Valve leakage / not for holding (SMC common solenoid valve precautions). Logic functions (OR via
 * shuttle, AND, NOT, memory) described from circuit logic; no maker figures used. Left out as unsourced: pilot
 * pressure minimums for specific air-pilot listings, operating forces of levers/pedals/rollers, any claim that our
 * pedal or lever valves have guards or locks.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'manual-and-pilot-operated-air-valves',
  title: 'Manual and air-pilot valves: hand-lever, foot-pedal, push-button, roller and pilot valves explained',
  excerpt:
    'How hand-lever, foot-pedal, push-button, cam and roller, and air-piloted valves work, detented vs spring-return action, how they build pneumatic logic without electricity — and why a two-hand control is a safety function under ISO 13851, not a pair of buttons.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Manual and Air Pilot Valves: Lever, Pedal, Roller, Pilot',
  seoDescription:
    'Hand-lever, foot-pedal, push-button, roller and air-pilot valves: detented vs spring return, logic, and why two-hand control is an ISO 13851 safety function.',
  focusKeyword: 'manual air control valve',
  publishedAt: '2026-10-22T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A manual or mechanical valve has the same functions as a solenoid valve — 2/2, 3/2, 5/2, 5/3 — but is shifted by a hand, a foot, a cam or a pilot signal instead of a coil.',
        'Spring-return valves go back when released (hold-to-run). Detented valves stay where they are put until moved again. Choose by what should happen when the operator lets go.',
        'Air-piloted valves are switched by an air signal, so a whole control circuit can run with no electricity at the machine.',
        'Shuttle, AND, NOT and memory functions let air valves build logic, but every valve in a pneumatic circuit leaks a little and none of them is a safety device on its own.',
        'Two-hand control is a safety function defined by ISO 13851 (types I, II and IIIA–IIIC), with synchronous actuation within 0.5 s for type III. Two ordinary push-button valves are not one.',
      ],
    },
    {
      type: 'lead',
      html: 'Not every air valve needs a coil. Fixtures, presses, workshop equipment and machines in wet or hazardous areas are often controlled entirely by hand levers, pedals, roller valves and air pilots. These valves are simple and robust, but the choice between detented and spring-return, and the line between a control valve and a safety device, matter more than on a PLC-driven machine where software can make up for them.',
    },

    { type: 'section_head', number: '/01', title: 'How a valve is moved.', anchor: 'actuators' },
    {
      type: 'prose',
      html: '<p>In the ISO 1219 symbol, the method of actuation is drawn at the end of the position squares — a lever, a pedal, a button, a roller, a pilot line, a spring — and the symbol also shows whether each position is stable and how the valve resets. The valve inside is the same family of 3/2, 5/2 and 5/3 functions described in our guide to <a href="/blog/solenoid-valve-functions-3-2-5-2-5-3">solenoid valve functions</a>; only the actuator changes.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Manual, mechanical and pilot actuators',
      columns: ['Actuator', 'Moved by', 'Typical return', 'Typical uses', 'Examples we list'],
      rows: [
        { cells: ['Hand lever (straight or rotary)', 'Operator’s hand', 'Spring return or detented; 3-position levers usually spring-centred or detented', 'Jogging a cylinder, manual positioning, set-up', 'Numatics 4-way 3-position lever; ARO MaxAir rotary lever and hand-lever valves; Parker Viking Xtreme perpendicular lever'] },
        { cells: ['Foot pedal', 'Operator’s foot', 'Usually spring return; some detented', 'Clamping and feeding with both hands on the work', 'ARO MaxAir foot pedal valves'] },
        { cells: ['Push-button / palm button', 'Hand press', 'Spring return (momentary) or push-pull detented', 'Start, jog, reset signals into an air logic circuit', 'Parker and SMC manual air control valve ranges (actuator varies by part number)'] },
        { cells: ['Cam, roller or plunger (limit valve)', 'A moving part of the machine', 'Spring return', 'Sensing end of stroke, sequencing', 'ARO 400 series 3-way limit valves; SMC VM mechanical valves'] },
        { cells: ['Air pilot', 'An air signal on port 12 or 14', 'Spring or air return (single pilot) or none (double pilot)', 'Amplifying a small signal; remote and non-electric control', 'Parker air pilot and N series; Numatics air pilot 4-way; Parker B series air-piloted'] },
        { cells: ['Hand valve (shut-off / slide)', 'Operator’s hand', 'Stays where set', 'Isolating and exhausting a branch', 'SMC VH hand valves; Metal Work and Wilkerson shut-off valves'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Detented or spring return.', anchor: 'detent-spring' },
    {
      type: 'prose',
      html: '<p>The return mechanism decides what happens when the operator lets go — which is the most important question for any manually controlled machine.</p><ul><li><strong>Spring return (momentary, monostable).</strong> The valve is shifted only while the lever, pedal or button is held. Let go and it springs back. On a 3/2 or 5/2 this means the cylinder returns; on a spring-centred 5/3 lever valve it means the cylinder stops (closed centre) or is released (exhaust centre). This is hold-to-run behaviour: motion stops or reverses when the operator stops acting.</li><li><strong>Detented (maintained, bistable).</strong> A detent — a spring-loaded ball or notch — holds the valve in each position. Let go and it stays. On a 5/3 lever valve, a detent in the centre and both ends lets an operator set a cylinder going and walk away. Convenient, but the machine keeps moving with nobody at the control.</li><li><strong>Pilot memory.</strong> A double-pilot 5/2 valve has no spring, so it stays in the last position it was signalled to — the air equivalent of a double-solenoid valve. A short pulse on 14 shifts it one way; a pulse on 12 shifts it back.</li></ul><p>As a rule, choose spring return wherever a moving part could injure the operator, and detented only where the valve sets a steady state — a supply on or off, a clamp that must stay applied, a mode selector. Even a spring-return valve is not a guard: the operator’s other hand, or a second person, can still be in the danger zone.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Air-piloted valves.', anchor: 'air-pilot' },
    {
      type: 'prose',
      html: '<p>An air-piloted valve is shifted by air pressure on its pilot port instead of a solenoid. Port 14 is the pilot that connects supply 1 to outlet 4; port 12 connects 1 to 2. A single-pilot valve returns on a spring (or on supply air) when the signal is removed; a double-pilot valve stays in the last position signalled.</p><p>Air pilots are used to:</p><ul><li><strong>Amplify a signal.</strong> A small push-button or roller valve sends a pilot signal through thin tubing to a large valve near the cylinder, so the operator’s control can be small and the large valve close to the load.</li><li><strong>Avoid electricity at the machine.</strong> Wash-down areas, wet locations and places where an electrical device would need hazardous-area certification can be controlled entirely with air. (The valves themselves still need to suit the area — ask the maker for any certification you need.)</li><li><strong>Build air logic and sequencing</strong> without a PLC, as below.</li></ul><p>Every pilot-operated valve needs enough pilot pressure to shift it. Check the maker’s minimum pilot pressure against the lowest pressure the pilot signal will see — a long, thin pilot line with a small signal valve can deliver less than you expect, and slowly.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Pneumatic logic.', anchor: 'logic' },
    {
      type: 'prose',
      html: '<p>Air valves can make the same basic logic functions as relays. The classic building blocks are:</p><ul><li><strong>OR — shuttle valve.</strong> Two inlets, one outlet; whichever inlet is pressurised passes to the outlet while a ball or spool blocks the other. Used where either of two controls should start the same action. We list Parker shuttle valves.</li><li><strong>AND.</strong> An output only when two signals are both present — two 3/2 valves in series, or a dedicated two-pressure valve.</li><li><strong>NOT.</strong> A normally-open 3/2 air-piloted valve: output present when there is no signal, removed when there is.</li><li><strong>Memory.</strong> A double-pilot 5/2 valve, as above.</li><li><strong>Time delay.</strong> A flow control filling a small volume until the pressure is high enough to shift a pilot valve.</li></ul><p>Makers sell valves specifically for this work: Parker’s miniature high-speed pneumatic logic valves and Moduflex T series, and ARO’s circuitry valves, appear in our list. Air logic is simple and needs no electrical supply, but it has limits. Every connection leaks a little and every pilot line has a delay, so long sequences become slow and hard to fault-find; and a logic circuit that drives a hazard is part of the machine’s safety-related control system, to be designed and validated as such — not improvised from catalogue valves.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A plain valve is not a safety device.',
      body: 'A push-button, pedal or lever valve does not keep anyone’s hands out of a press or clamp. A foot pedal leaves both hands free to be in the danger zone; two push-buttons piped together can be tied down or operated with an elbow and a hand. Where an operator must be protected, use a safety function designed and validated for the risk — a guard, a two-hand control device to ISO 13851, or another measure from the machine’s risk assessment — and isolate and exhaust the air under lockout for maintenance.',
    },

    { type: 'section_head', number: '/05', title: 'Two-hand control is a safety function (ISO 13851).', anchor: 'two-hand' },
    {
      type: 'prose',
      html: '<p>ISO 13851:2019 sets the safety requirements for two-hand control devices. As Metal Work quotes it in the manual for its own pneumatic two-hand device, a two-hand control is a device that needs at least simultaneous actuation by both hands to start and to keep any operation of a machine going while a hazardous condition exists — and it protects only the person who actuates it. The standard defines types I, II and III (with III split into IIIA, IIIB and IIIC), with requirements that increase by type:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'ISO 13851 two-hand control types (as tabulated in Metal Work’s SAFE AIR manual)',
      columns: ['Requirement', 'Type I', 'Type II', 'Type IIIA', 'Type IIIB', 'Type IIIC'],
      rows: [
        { cells: ['Both hands, simultaneous actuation', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'] },
        { cells: ['Output only while both inputs held; ceases on release', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'] },
        { cells: ['Prevention of accidental operation and of defeat', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'] },
        { cells: ['Re-initiation: both controls released before a new output', '—', 'Yes', 'Yes', 'Yes', 'Yes'] },
        { cells: ['Synchronous actuation (inputs start within 0.5 s)', '—', '—', 'Yes', 'Yes', 'Yes'] },
        { cells: ['Safety performance (ISO 13849-1 / IEC 62061)', 'At least PL c or SIL 1', 'At least PL d, category 3, or SIL 2', 'At least PL c or SIL 1', 'At least PL d, category 3, or SIL 2', 'PL e, category 4, or SIL 3'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Points from the standard and from Metal Work’s manual that every buyer should know:</p><ul><li><strong>The standard does not choose for you.</strong> ISO 13851 does not say which machines need a two-hand control or which type; that comes from the machine’s risk assessment and any machine-specific standard.</li><li><strong>Distance matters.</strong> The controls must be far enough from the hazard that the machine stops, or the dangerous part moves away, before a released hand can reach it. Metal Work gives the minimum safety distance as S = 1.6 × t + 0.25, with S in metres and t the time in seconds from releasing a control to the machine stopping. The controls must be outside the hazardous area.</li><li><strong>Pneumatic devices have their own installation rules.</strong> Metal Work’s type IIIA device, rated PL c, accepts the two signals if they arrive within 0.4 s, runs at 2.5–8 bar with identical input pressures, and is rated −10 to +60 °C. It requires the tubes from the two controls to be identical in diameter and length so the timing stays within limits, and the line from the device to the machine to be no longer than 10 m.</li><li><strong>It protects one person.</strong> Others near the machine need other measures.</li></ul><p>A purpose-built two-hand device, or a safety controller with two-hand inputs, is a safety component; a pair of push-button valves from a general catalogue is not, however they are piped. If a machine needs two-hand control, buy a device declared to the ISO 13851 type its risk assessment calls for, and have the installation validated.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which manual or pilot valve?',
      branches: [
        { condition: 'Operator moves a cylinder while watching it?', outcome: 'Spring-return lever or button valve (hold-to-run); spring-centred 5/3 for stop-in-place.' },
        { condition: 'Valve sets a steady state — supply on/off, clamp held, mode?', outcome: 'Detented lever or hand valve.' },
        { condition: 'Machine part must signal end of stroke?', outcome: 'Cam, roller or plunger limit valve.' },
        { condition: 'Small signal must switch a large valve, or no electricity at the machine?', outcome: 'Air-piloted valve; check the minimum pilot pressure.' },
        { condition: 'Either of two controls should start the same action?', outcome: 'Shuttle valve (OR).' },
        { condition: 'Operator’s hands must be kept out of a hazard?', outcome: 'A safety function from the risk assessment — e.g. an ISO 13851 two-hand control device — never a plain valve.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a detented and a spring return valve?', answer: 'A spring-return valve goes back to its rest position when the operator releases it. A detented valve is held in each position by a detent and stays where it was put until moved again.' },
        { question: 'What is an air pilot valve?', answer: 'A directional valve shifted by an air signal on its pilot port (12 or 14) instead of a solenoid. Single-pilot versions return on a spring; double-pilot versions stay in the last position signalled.' },
        { question: 'What is a pneumatic limit valve?', answer: 'A valve shifted by a cam, roller or plunger touched by a moving part of the machine, used to signal end of stroke or to sequence the next action in an air logic circuit.' },
        { question: 'What does a shuttle valve do in a pneumatic circuit?', answer: 'It is an OR function: it passes air from whichever of its two inlets is pressurised to a single outlet, blocking the other inlet so the signal cannot escape back through it.' },
        { question: 'Is a two-hand control valve a safety device?', answer: 'Only if it is a two-hand control device built and declared to ISO 13851 for the type the machine’s risk assessment requires, and installed and validated accordingly. Two ordinary push-button valves piped together are not a safety device.' },
        { question: 'What is the time limit for two-hand control?', answer: 'For ISO 13851 type III devices, the two inputs must start within 0.5 s of each other (synchronous actuation). Individual devices may be tighter — Metal Work’s pneumatic type IIIA device uses 0.4 s.' },
        { question: 'Can a foot pedal valve be used on a press?', answer: 'Only where the machine’s risk assessment allows it. A foot pedal leaves both hands free and gives no hand protection, so it must be combined with guarding or another safety measure where hands can reach the hazard.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our manual and pilot control valves shelf — hand, foot, mechanical and air-piloted valves, logic and shuttle valves, shut-off valves and media valves, from Parker, SMC, ARO, Numatics, Legris and others — sold by maker part number.</p>' + stockList(['pneumatic-control-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Manual, mechanical and pilot valves',
      skus: [
        'IH-SMC-VH-SERIES-HAND-VALVE',
        'IH-SMC-VM-SERIES-MECHANICAL-VALVE',
        'IH-NUM-4-WAY-3-POSITION-LEVER-MANUAL-AIR-CONTROL-VALVE',
        'IH-ARO-MAXAIR-SERIES-FOOT-PEDAL-VALVES',
        'IH-ARO-400-SERIES-3-WAY-LIMIT-VALVES',
        'IH-PAR-AIR-PILOT-VALVES',
        'IH-PAR-SHUTTLE-VALVES',
        'IH-PAR-MINIATURE-HIGH-SPEED-PNEUMATIC-LOGIC-CONTROL-VALV',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-control-valves', label: 'Manual and pilot control valves', blurb: 'Hand-lever, foot, mechanical, air-pilot, logic and shut-off valves.' },
    { type: 'category_link', slug: 'pneumatic-safety-lockout-valves', label: 'Safety and lockout valves', blurb: 'Lockout, soft-start and dump valves for isolating and exhausting air.' },
    {
      type: 'related_articles',
      slugs: [
        'solenoid-valve-functions-3-2-5-2-5-3',
        'air-safety-relief-soft-start-and-lockout-valves',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'pneumatic-cylinder-types-guide',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Two-hand control types, timing, performance levels and installation rules from Metal Work’s SAFE AIR manual citing EN ISO 13851:2019; ISO 13851 scope from the standard’s published abstract; symbol conventions from ISO 1219 training material.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a lever, pedal or pilot valve?',
      body: 'Send us the maker part number, or the function (3/2, 5/2, 5/3), actuator, return type (spring or detent) and port size. For two-hand control, tell us the ISO 13851 type your risk assessment requires.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
