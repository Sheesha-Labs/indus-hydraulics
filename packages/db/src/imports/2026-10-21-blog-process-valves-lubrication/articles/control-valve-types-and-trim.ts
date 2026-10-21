import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Control valve types and trim: globe (post/top-guided vs cage-guided, balanced vs unbalanced), leakage classes,
 * V-notch segmented ball, angle valves, bellows seals, cavitation/flashing and multi-stage trim, Cv sizing,
 * inherent characteristics, actuators and positioners.
 * Sources read 2026-10-21:
 * - Emerson, Control Valve Handbook (D101881X012, 2023): single-port is the most common body; cage or retainer trim
 *   retains the seat ring, guides the plug and sets the characteristic, and trim swaps change characteristic,
 *   capacity, noise or cavitation; post- and port-guided plugs are unbalanced, the unbalanced force must be
 *   considered in actuator selection, and they can be susceptible to high-pressure-drop vibration; in balanced cage
 *   designs downstream pressure acts on both sides of the plug and nullifies most static unbalanced force, permitting
 *   smaller actuators; cage trim through NPS 36 and to Class 4500; double-ported designs largely abandoned, Class II
 *   (sometimes III) shutoff; angle valves used in boiler feedwater and heater drain and where the valve also serves as
 *   an elbow, with expanded outlets, restricted trim or outlet liners against erosion, flashing or cavitation;
 *   seat leakage table to ANSI/FCI 70-2 and IEC 60534-4 (Class I–VI, test media, pressures) and Class VI ml/min and
 *   bubble table; inherent vs installed characteristic; quick-opening mainly on/off, linear for liquid level and
 *   constant-gain flow, equal-percentage for pressure control and where most of the drop is absorbed by the system or
 *   pressure drop varies widely; ISA committee from 1967, ANSI/ISA-75.01.01 and IEC 60534-2-1 harmonised, limits
 *   (single-phase, Newtonian, ideal gases, Cv/d² < 30); Cv and FL are matched sets; choked flow uses ∆Pchoked;
 *   Cv definition (US gpm of 60 °F water at 1 psi drop); V-notch ball gives equal-percentage, rangeability over
 *   300:1, shearing action against the seal, suited to erosive or viscous fluids, paper stock and slurries, mates with
 *   Class 150/300/600 flanges; vena contracta; high-recovery (ball) vs low-recovery (globe) valves; flashing
 *   (P2 below vapour pressure, smooth polished damage, cannot be prevented by any valve) vs cavitation (P2 above
 *   vapour pressure, rough cinder-like damage, gravel noise); erosion minimised by fewer direction changes (angle
 *   valves, straight-through rotary), expanded outlets, hard materials; flashing water + steel → low-alloy steel
 *   minimum; multi-stage trim splits the drop so each vena contracta stays above vapour pressure; small anti-cavitation
 *   passages can clog with particulate; bellows seal bonnets for leakage below 1×10⁻⁶ cc/s helium, toxic, volatile,
 *   radioactive or expensive fluids, packing above as back-up, ratings fall with temperature, welded-leaf vs
 *   mechanically-formed bellows; spring-and-diaphragm actuators most common, net thrust = diaphragm minus spring,
 *   piston actuators to 150 psig supply, double-acting or spring-return fail-open/closed; fail-open/fail-closed
 *   definitions; positioner function, 3–15 psig pneumatic, 4–20 mA I/P, HART digital.
 * - IEC 60534-4:2021 abstract (Standards Norway listing): inspection and routine testing of control valves to the
 *   other IEC 60534 parts, ratings to Class 2500, actuator requirements for pneumatic actuators only.
 * - ISA product page: ANSI/ISA-75.01.01-2012 (60534-2-1 MOD) title, sizing equations under installed conditions.
 * NOT used: bellows cycle-life figures (100,000 to 1,000,000 cycles in our listing; no source read gives them);
 *   specific noise prediction (IEC 60534-8) figures; pressure-drop limits of any named trim; exact Class VI figures
 *   above 8 in; which seat material suits each class (handbook gives seat load only).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'control-valve-types-and-trim',
  title: 'Control valve types and trim: globe, cage, V-ball, angle and anti-cavitation valves, and how to specify them',
  excerpt:
    'How a top-guided globe valve differs from a cage-guided balanced valve, where a V-notch ball or an angle valve does better, when a bellows seal is worth it, and what multi-stage trim does about cavitation. Also: leakage Classes IV, V and VI, Cv sizing to IEC 60534-2-1, and the equal-percentage, linear and quick-opening characteristics.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Control Valve Types and Trim: Globe, Cage, V-Ball, Angle',
  seoDescription:
    'Globe, cage-guided, V-notch ball and angle control valves; balanced trim; leakage Class IV–VI; bellows seals; cavitation trim; Cv sizing and characteristics.',
  focusKeyword: 'control valve types',
  publishedAt: '2026-10-22T02:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Unbalanced post- or top-guided plugs give tight shutoff in smaller sizes; balanced cage-guided plugs cancel most of the pressure force, so a smaller actuator can drive a larger valve.',
        'Leakage is classed I to VI under ANSI/FCI 70-2 and IEC 60534-4: Class IV is 0.01% of rated capacity, Class V is measured in water per inch of port per psi, Class VI is a bubble count set by port size.',
        'A V-notch segmental ball gives equal-percentage control with a shearing seat, for slurries, fibres and viscous fluids.',
        'Cavitation can be designed out with multi-stage trim; flashing cannot be prevented by any valve, only survived with an angle body, an expanded outlet and hard trim.',
        'Cv is the US gallons per minute of 60 °F water passed at 1 psi drop; ISA-75.01.01 and IEC 60534-2-1 give the same sizing equations.',
        'Send fluid, flows, P1, P2, temperature, vapour pressure, leakage class and fail action with any enquiry.',
      ],
    },
    {
      type: 'lead',
      html: 'An isolation valve is either open or shut. A control valve spends its life part-open, taking a pressure drop on purpose to hold a flow, level, pressure or temperature at set point. That is why the trim — plug, seat, cage or ball — matters more than the body, and why the same line size can need a plain globe valve on one duty and a multi-stage anti-cavitation valve on the next. This guide covers the main types we supply, the leakage classes and the sizing terms that appear on a control valve data sheet. For manual globe valves to API 623, see <a href="/blog/api-600-602-603-gate-and-globe-valves">API 600, 602, 603 and 623 valves</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Globe control valves: how the plug is guided and balanced.', anchor: 'globe' },
    {
      type: 'prose',
      html: '<p>The single-port globe valve is the most common control valve body. Two things set its behaviour: how the plug is guided, and whether line pressure is balanced across it.</p><ul><li><strong>Post-, stem- or top-guided, unbalanced plug.</strong> The plug is guided at the top and closes onto a single seat ring. Upstream pressure loads the whole port area, so the actuator has to overcome that unbalanced force as well as seat the plug. It suits smaller sizes and stringent shutoff, with metal or soft (PTFE-type) seats. The Emerson handbook warns that these plugs can be prone to vibration at high pressure drop. Our <a href="/p/single-seated-globe-control-valve">top-guided single-seated globe valve</a> is this type, for general clean-fluid loops.</li><li><strong>Cage-guided, balanced plug.</strong> A cylindrical cage holds the seat ring, guides the plug along its stroke and sets the flow characteristic through the shape of its windows. Balance holes let downstream pressure act on both faces of the plug, which cancels most of the static force, so a smaller actuator can drive a larger valve or a higher drop. A seal between the plug and the cage bore limits leakage of upstream fluid past the plug. Changing the cage changes the characteristic or the capacity, or adds noise or cavitation reduction, without changing the body. See our <a href="/p/cage-guided-control-valve-balanced">cage-guided balanced valve</a>.</li><li><strong>Double-ported.</strong> Two plugs on one stem, nearly balanced by flow. The industry has largely moved away from them: metal-seated double-port valves usually reach only Class II shutoff.</li></ul>',
    },
    {
      type: 'comparison_table',
      caption: 'Seat leakage classes to ANSI/FCI 70-2 and IEC 60534-4',
      columns: ['Class', 'Maximum leakage', 'Test medium and pressure', 'Recommended seat load (Emerson)'],
      rows: [
        { cells: ['II', '0.5% of rated capacity', 'Air or water, 3–4 bar (45–60 psig) or max. operating ∆P, whichever is lower', '20 lb per inch of port circumference'] },
        { cells: ['III', '0.1% of rated capacity', 'As Class II', '40 lb per inch of port circumference'] },
        { cells: ['IV', '0.01% of rated capacity', 'As Class II', '40 lb/in up to a 4-3/8 in port; 80 lb/in above'], highlight: true },
        { cells: ['V', '0.0005 ml/min of water per inch of port diameter per psi ∆P', 'Water at max. service ∆P, body cavity filled, net actuator thrust only', 'Metal seats: rises with shutoff pressure drop'] },
        { cells: ['VI', 'By port size, e.g. 0.15 ml/min (1 bubble/min) at 1 in, 6.75 ml/min (45/min) at 8 in', 'Air or nitrogen, 3.5 bar (50 psig) or max. rated ∆P, whichever is lower', 'Metal seats: 300 lb per inch of port circumference'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Class I means no test, by agreement. Ask for the class you need rather than “tight shutoff”: each step up needs more seat load, and so a larger actuator.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Rotary and angle valves.', anchor: 'rotary-angle' },
    {
      type: 'prose',
      html: '<p><strong>V-notch segmental ball.</strong> Only part of a sphere is used, with a V-shaped notch at its leading edge. As the shaft turns, the notch opens progressively against the seal ring, giving an equal-percentage characteristic and wide rangeability; the handbook quotes better than 300:1 for one design. The ball stays in contact with the seal through its travel, so it shears fibres and solids as it closes instead of trapping them. That makes our <a href="/p/v-notch-segmental-ball-control-valve">V-notch ball control valve</a> the usual choice for pulp, slurries, viscous and erosive fluids. Segmental ball valves mate with Class 150, 300 and 600 flanges, which matches the range we list.</p><p><strong>Angle valves.</strong> An angle body turns the flow through 90° and can replace an elbow. It is the traditional answer to flashing and erosive duties because the flow path has few changes of direction and the throttled jet leaves into the outlet pipe rather than impinging on the body wall. Angle valves are used on boiler feedwater and heater drains, often with an expanded outlet to slow the flow, restricted trim, or an outlet liner. The plug and seat take the wear, so hard materials — hard facing, carbides or ceramics — are specified. Our <a href="/p/angle-anti-erosion-control-valve">erosion-resistant angle valve</a> is built this way.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Cavitation, flashing and multi-stage trim.', anchor: 'cavitation' },
    {
      type: 'prose',
      html: '<p>As liquid passes the throttling point it speeds up and its pressure falls to a minimum at the <strong>vena contracta</strong>, just downstream of the restriction. Downstream the flow slows and pressure partly recovers. Streamlined valves such as ball valves recover a lot of pressure (high-recovery); globe valves recover less (low-recovery). If the vena contracta pressure falls below the liquid’s vapour pressure, vapour bubbles form. What happens next depends on the outlet pressure:</p><ul><li><strong>Cavitation:</strong> outlet pressure recovers above vapour pressure and the bubbles collapse. It sounds like gravel in the line and leaves a rough, cinder-like surface on the trim, body or downstream pipe. High-recovery valves are more prone to it.</li><li><strong>Flashing:</strong> outlet pressure stays below vapour pressure, so the vapour stays in the stream. Damage is smooth and polished, worst at the seat line. Because outlet pressure is set by the plant, no control valve can prevent flashing; you choose geometry and materials to survive it. Flashing water in plain carbon steel combines corrosion with erosion, so low-alloy steel is the minimum.</li></ul><p>Cavitation, unlike flashing, can be designed out. <strong>Multi-stage trim</strong> splits the total drop into several smaller drops in series, each small enough that its own vena contracta stays above vapour pressure, so bubbles never form. Our <a href="/p/multi-stage-pressure-reducing-control-valve">multi-stage pressure-reducing valve</a> does this with stacked sleeves on a balanced plug, for duties such as boiler feed recirculation. The other options are to harden and isolate the surfaces the cavitation reaches, or to raise the outlet pressure. Small anti-cavitation passages can clog, so tell us about any solids in the fluid.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Bellows seals for fluids that must not leak.', anchor: 'bellows' },
    {
      type: 'prose',
      html: '<p>Packing seals a moving stem well, but not perfectly. A <strong>bellows seal bonnet</strong> welds a metal bellows between the plug stem and the bonnet, so the process fluid never reaches the stem or the packing. The Emerson handbook places it where stem leakage below 1 × 10⁻⁶ cc/s of helium is required: toxic, volatile, radioactive or very expensive fluids. A conventional or low-emission packing box sits above the bellows as a back-up if the bellows fails. Bellows pressure ratings fall as temperature rises, and cycle life depends on the bellows material and type — welded-leaf bellows are shorter, mechanically formed bellows are taller and more repeatable — so give the stroke frequency with the enquiry. We list the <a href="/p/bellows-seal-single-seated-control-valve">single-seated bellows valve</a> and a <a href="/p/bellows-seal-cage-guided-control-valve">cage-guided bellows valve</a> for larger balanced duties.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Sizing, characteristic and actuator.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<p><strong>Cv.</strong> The flow coefficient is the number of US gallons per minute of 60 °F water that passes with a 1 psi drop at a given travel. The sizing equations come from <strong>ANSI/ISA-75.01.01</strong>, which is harmonised with <strong>IEC 60534-2-1</strong>, so either may be used. They assume a single-phase Newtonian fluid with fully turbulent flow; slurries and high-viscosity fluids need extra care. For liquids, if the actual drop exceeds the choked drop (∆Pchoked), the choked figure is used — and that is the warning that the valve will cavitate or flash. Cv and the recovery factor FL are a matched set for one valve at one travel, which is why the sizing belongs to the valve supplier.</p><h3>Inherent characteristics</h3><ul><li><strong>Equal percentage:</strong> each increment of travel changes flow by the same percentage of the existing flow. Used for pressure control and where most of the system drop is outside the valve, or the drop varies widely.</li><li><strong>Linear:</strong> flow is proportional to travel, for constant gain. Common on liquid level and some flow loops.</li><li><strong>Quick opening:</strong> most of the flow in the first part of travel; used mainly for on/off duty.</li></ul><p>These are measured at constant drop. Installed, the drop changes with flow, so the installed characteristic is what the loop sees.</p><h3>Actuators and positioners</h3><p>The spring-and-diaphragm actuator is the most common: air pushes the diaphragm, the spring pushes back, and the spring sets the fail action — <strong>fail-closed</strong> or <strong>fail-open</strong> when air is lost. Piston actuators work on plant air up to about 150 psig for higher thrust and faster stroking, double-acting or spring-return. A <strong>positioner</strong> reads stem or shaft position and drives the actuator until it matches the control signal: 3–15 psig on pneumatic loops, 4–20 mA on most modern plants, often with HART diagnostics. Routine shop testing of control valves, including the pneumatic actuator, is covered by <strong>IEC 60534-4</strong>, which applies to ratings up to Class 2500.</p>',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a top-guided and a cage-guided control valve?', answer: 'A top-guided plug is unbalanced and seats on a single ring, good for small sizes and tight shutoff. A cage-guided plug is guided by a cage, usually balanced, so it needs less actuator force at high drop.' },
        { question: 'Which leakage class should I specify?', answer: 'Class IV (0.01% of rated capacity) suits most metal-seated throttling duties. Ask for Class V for metal seats that must hold close to tight, and Class VI, tested by bubble count, only where the duty needs the tightest class: it needs the most seat load.' },
        { question: 'Can a control valve stop flashing?', answer: 'No. Flashing happens because the outlet pressure is below the vapour pressure, which the plant sets. An angle body, expanded outlet and hardened trim limit the damage.' },
        { question: 'How does anti-cavitation trim work?', answer: 'It takes the pressure drop in several stages, so no single stage drops the local pressure below vapour pressure. No bubbles form, so none collapse against the metal.' },
        { question: 'When is a V-notch ball better than a globe valve?', answer: 'On slurries, pulp, fibrous or viscous fluids, and where high capacity and wide rangeability are needed at moderate pressure classes.' },
        { question: 'What data do you need to size a control valve?', answer: 'Fluid, minimum, normal and maximum flow, inlet and outlet pressure at each, temperature, density, vapour and critical pressure, viscosity, line size and schedule, leakage class and fail action.' },
      ],
    },
    {
      type: 'prose',
      html:
        '<h3>What we list</h3><p>Control valves built to the data sheet, with actuator, positioner and accessories assembled and tested:</p>' +
        stockList(['control-valves']) +
        '<p>For a quote, send the process data sheet or: fluid and phase, minimum/normal/maximum flow with P1 and P2 at each, temperature, vapour pressure, line size and schedule, pressure class and end connection, body and trim material, leakage class, fail action, signal (3–15 psig or 4–20 mA, HART) and any noise limit. For cryogenic duty, see the <a href="/p/cryogenic-control-valve">cryogenic globe control valve</a> and our guide to <a href="/blog/cryogenic-valves-explained">cryogenic valves</a>.</p>',
    },
    {
      type: 'product_embed',
      heading: 'Control valves',
      skus: ['IH-PV-CVS', 'IH-PV-CVC', 'IH-PV-CVV', 'IH-PV-CVA', 'IH-PV-CVM', 'IH-PV-CVB', 'IH-PV-CVG'],
    },
    { type: 'category_link', slug: 'control-valves', label: 'Control valves', blurb: 'Globe, cage-guided, V-notch ball, angle, bellows-seal and multi-stage control valves.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Control valves for process plant, letdown and recirculation duties.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'emerson-cvh', text: 'Emerson. Control Valve Handbook (D101881X012), 2023.', url: 'https://www.emerson.com/documents/automation/control-valve-handbook-en-3661206.pdf' },
        { id: 'iec-60534-4', text: 'IEC 60534-4:2021, Industrial-process control valves — Part 4: Inspection and routine testing (abstract).', url: 'https://online.standard.no/en/iec-60534-4-2021-ed4' },
        { id: 'isa-75-01', text: 'ISA. ANSI/ISA-75.01.01-2012 (60534-2-1 MOD), Flow capacity — Sizing equations for fluid flow under installed conditions.', url: 'https://www.isa.org/products/ansi-isa-75-01-01-2012-60534-2-1-mod-industrial-pr' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['api-600-602-603-gate-and-globe-valves', 'cryogenic-valves-explained', 'floating-vs-trunnion-mounted-ball-valves', 'safety-relief-valve-types', 'needle-globe-and-instrumentation-valves', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Leakage classes, trim types, cavitation and sizing terms from the Emerson Control Valve Handbook (2023); IEC 60534-4 scope from the 2021 abstract.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a control valve?',
      body: 'Send the process data sheet, or the fluid, flows, pressures, temperature, leakage class and fail action. We will propose the body and trim, check for cavitation and flashing, and quote the assembled valve.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
