import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Mobile and industrial hydraulic control valves: monoblock directional valves, solenoid valves on CETOP 3, relief,
 * flow control, flow dividers, check and selector valves. Sources read 2026-10-21: Cross Manufacturing pages (Model BA
 * monoblock 2,500/3,000 psi, 30 GPM, built-in relief set 2,000 psi, open/closed centre, power beyond; SD4 6-way
 * selector; RV pilot relief 400–3,000 psi, 40 GPM; SQV alternating row-marker valve; FD proportional divider);
 * Prince Manufacturing (RD2500 monoblock 3,000 psi, 150 psi tank, relief 1,500 psi adjustable 1,000–3,000; RD100
 * pressure-compensated flow control 3,000 psi, 30 GPM, excess-flow port; RD range); Yuken India catalogues (DSG-01
 * 63 L/min, 315 kgf/cm², spool codes, ISO 4401-AB-03-4-A; BG-03 250 kgf/cm², 100 L/min, tank line direct to reservoir,
 * 8 L/min minimum; 01 modular 250 kgf/cm², 35 L/min, 1–5 stacks; MBR-01 brake valve).
 * NOT used: log-splitter detent kick-out pressure; rotary-gear divider accuracy (no maker figure read).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mobile-hydraulic-control-valves-guide',
  title: 'Hydraulic control valves: directional, relief, flow control and flow dividers explained',
  excerpt:
    'A hydraulic circuit is steered by a handful of valve types: a directional valve that sends oil to one side of a cylinder or the other, a relief valve that caps the pressure, flow controls and dividers that set speed, and check and selector valves that hold or route the flow. How monoblock spool valves, CETOP 3 solenoid valves and modular stacks work, what open and closed centre mean, and what to send to get the right replacement.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Control Valves: Directional, Relief & Flow Control',
  seoDescription:
    'How hydraulic control valves work: monoblock directional spool valves, open vs closed centre, power beyond, CETOP 3 solenoid valves, pilot relief valves, pressure-compensated flow controls, flow dividers, check, selector and log-splitter valves.',
  focusKeyword: 'hydraulic control valve',
  publishedAt: '2026-10-21T23:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Directional valves choose where oil goes; relief valves cap pressure; flow controls and dividers set speed; check and selector valves hold and route flow.',
        'Match the centre type to the pump: open-centre valves suit fixed-displacement gear pumps, closed-centre valves suit pressure-compensated pumps.',
        'Monoblock valves carry a built-in relief — Cross ships its Model BA set at 2,000 psi — which must be set for the circuit, not left as found.',
        'CETOP 3 (ISO 4401-03) solenoid valves such as Yuken’s DSG-01 are rated 63 L/min and 315 kgf/cm².',
        'A pressure-compensated flow control holds speed as load changes; a plain needle valve does not.',
      ],
    },
    {
      type: 'lead',
      html: 'On a tractor, log splitter, loader or press, the pump makes flow and the valves decide what it does. Replacing a valve is mostly a matching exercise — spool count and type, centre, ports, relief setting and flow — and most failures to work after a swap come from one of those being different, not from a faulty valve. This guide sits alongside the pump and cylinder guides in this section: see <a href="/blog/hydraulic-pump-types-gear-vane-piston">hydraulic pump types</a> and <a href="/blog/hydraulic-cylinder-guide">hydraulic cylinders</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Directional control valves.', anchor: 'directional' },
    {
      type: 'prose',
      html: '<p>A <strong>spool valve</strong> slides a spool in a bore to connect the pump and tank to the work ports. A <strong>monoblock</strong> valve has one to three spools in one casting; a <strong>sectional</strong> valve bolts sections together. Typical mobile monoblocks are 3-position, 4-way and spring-centred: Cross’s Model BA runs 2,500–3,000 psi at 30 GPM with one to three spools; Prince’s RD2500 is rated 3,000 psi with a 150 psi tank-port limit.</p><ul><li><strong>Open centre</strong> — in neutral the pump flow returns to tank. The normal choice with a fixed-displacement gear pump.</li><li><strong>Closed centre</strong> — in neutral the pump port is blocked. Used with pressure-compensated or load-sensing pumps; Cross sells a conversion kit for its BA valve.</li><li><strong>Power beyond</strong> — the neutral flow is carried on, under pressure, to a second valve downstream instead of to tank.</li><li><strong>Float</strong> — a fourth spool position that connects both work ports to tank, so a loader bucket or blade can follow the ground.</li><li><strong>Detents</strong> hold the spool in position; log-splitter valves use an auto-return detent that kicks the spool back to neutral at the end of the stroke.</li></ul><p>Industrial circuits use <strong>solenoid valves</strong> on a standard mounting face. Yuken’s DSG-01 sits on the ISO 4401-03 (CETOP 3, NG6) pattern and is rated 63 L/min at 315 kgf/cm²; its model code gives positions and spring arrangement — 3C is three-position spring-centred, 2B two-position spring-offset — and the coil voltage.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Relief, check and selector valves.', anchor: 'relief' },
    {
      type: 'prose',
      html: '<ul><li><strong>Relief valves</strong> open to tank when pressure reaches the setting, protecting the pump, hoses and cylinder. Pilot-operated reliefs such as Cross’s Model RV (400–3,000 psi, 40 GPM) or Yuken’s BG-03 (up to 250 kgf/cm², 100 L/min) hold the setting more closely over a range of flow. Yuken’s instruction for the BG-03: pipe its tank line straight to the reservoir, not into another valve’s tank line.</li><li><strong>Check valves</strong> let oil through one way only — to hold a load, isolate a pump or bypass a filter.</li><li><strong>Selector valves</strong> send one supply to one of two circuits: Cross’s SD4 is a manual 6-way, 2-position valve. Not every “sequence” valve sequences by pressure — Cross’s SQV is an alternating valve for row-marker cylinders on planters.</li><li><strong>Modular valves</strong> stack under a solenoid valve on the same face — Yuken’s 01 series stacks one to five valves at 250 kgf/cm² and 35 L/min, including a brake valve (MBR-01) that controls a running-away load.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Flow control and flow dividers.', anchor: 'flow' },
    {
      type: 'prose',
      html: '<p>A <strong>needle valve</strong> is a variable orifice: flow through it changes when the load pressure changes. A <strong>pressure-compensated flow control</strong> holds flow nearly constant as pressure varies — Prince’s RD100 does this at up to 3,000 psi and 30 GPM, sending excess flow to a second port that can feed another circuit or return to tank. <strong>Priority dividers</strong> feed one circuit first (steering, typically) and pass the rest on; <strong>proportional dividers</strong> split flow between two circuits, by spool or by a set of rotary gears turning together. Cross’s FD is a proportional divider used to stop one wheel spinning out on a hydrostatic drive.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Open centre or closed centre valve?', answer: 'Open centre for a fixed-displacement (gear) pump, so flow returns to tank in neutral; closed centre for a pressure-compensated or load-sensing pump.' },
        { question: 'What is power beyond?', answer: 'A port or sleeve that carries the valve’s neutral flow on to a second valve under pressure, instead of returning it to tank.' },
        { question: 'What is a CETOP 3 valve?', answer: 'A valve on the ISO 4401-03 (NG6) mounting face — the common small industrial pattern, used by valves such as Yuken’s DSG-01.' },
        { question: 'Why does my cylinder speed change with load?', answer: 'A plain needle valve is not pressure-compensated; use a pressure-compensated flow control to hold speed as load varies.' },
        { question: 'What should I send to replace a monoblock valve?', answer: 'The number of spools, spool type and detents, open or closed centre, port threads, flow, relief setting and any power-beyond or float function — or a photo of the nameplate.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Directional, solenoid, relief, check, selector and flow-control valves and flow dividers:</p>' + stockList(['directional-control-valves', 'valves-manifolds', 'check-relief-selector-valves', 'flow-control-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Hydraulic control valves',
      skus: ['IH-CRS-SPOOL', 'IH-PRN-DCV', 'IH-DSG-01-3C4-D24', 'IH-BG-03-315', 'IH-MBR-01-30', 'IH-CRS-RSV', 'IH-PRN-FC', 'IH-DFC-FDA'],
    },
    { type: 'category_link', slug: 'directional-control-valves', label: 'Directional control valves', blurb: 'Monoblock spool valves, log-splitter valves, detent kits and cables.' },
    { type: 'category_link', slug: 'flow-control-valves', label: 'Flow control valves', blurb: 'Needle valves, pressure-compensated flow controls and dividers.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'cross-valves', text: 'Cross Manufacturing. Hydraulic valve product pages (Model BA, SD4, RV, SQV, FD).', url: 'https://crossmfg.com/hydraulics/valves' },
        { id: 'prince-valves', text: 'Prince Manufacturing. Hydraulic valve product pages (RD2500, RD100).', url: 'https://www.princehyd.com/Products/Hydraulic-Valves' },
        { id: 'yuken-dsg01', text: 'Yuken India. DSG-01 Series Solenoid Operated Directional Valves.', url: 'https://www.yukenindia.com/wp-content/uploads/2021/09/DSG-01-Series-Solenoid-Operated-Directional-Valves.pdf' },
        { id: 'yuken-bg', text: 'Yuken India. Pilot Operated Relief Valves.', url: 'https://www.yukenindia.com/wp-content/uploads/2021/08/Pilot-Operated-Relief-Valve.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-pump-types-gear-vane-piston', 'two-stage-hydraulic-pumps-log-splitter', 'hydraulic-cylinder-drift-diagnosis', 'dump-pumps-and-pto-pumps'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Valve functions and ratings from Cross, Prince and Yuken maker documents.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a hydraulic valve?',
      body: 'Send a photo of the nameplate, or the spool count, centre type, port threads, flow and relief setting. We will match the valve and any detent kits, handles or cables it needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
