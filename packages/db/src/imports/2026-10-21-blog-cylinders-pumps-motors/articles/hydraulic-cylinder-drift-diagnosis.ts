import type { BlogArticleSeed } from '../shared'

/**
 * Cylinder drift and leak diagnosis. The volume argument (a double-acting cylinder with both ports truly sealed
 * cannot drift far on piston-seal bypass alone, because the rod-side and cap-side volumes change by different
 * amounts) is first-principles. Thermal contraction uses a volumetric expansion coefficient of about 0.0007 per
 * °C for mineral oil, the order of value published for hydraulic oils; the 0.76" example is computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-cylinder-drift-diagnosis',
  title: 'Why a hydraulic cylinder drifts: piston seal, valve or oil — and how to test which',
  excerpt:
    'A boom that sinks overnight is blamed on the cylinder far more often than the cylinder deserves. Why piston-seal bypass alone rarely drops a load, the valve leakage and thermal contraction that usually do, a safe step-by-step test, and how to read external leaks, scored rods and blown seals.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Cylinder Drift: Causes & How to Test (Seal vs Valve)',
  seoDescription:
    'Diagnose hydraulic cylinder drift: piston seal bypass vs valve spool leakage vs thermal contraction, a safe bypass test procedure, load-holding valves, and what rod scoring, external leaks and seal extrusion mean.',
  focusKeyword: 'hydraulic cylinder drift',
  publishedAt: '2026-10-21T07:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'In a double-acting cylinder with both ports genuinely sealed, a leaking piston seal alone cannot let the load fall far: the two sides change volume by different amounts, and oil does not compress.',
        'Most drift comes from oil escaping the cylinder through the valve — spool clearance in an ordinary directional valve, or a worn or contaminated load-holding valve.',
        'Oil cooling after work also drifts a cylinder: 254 in³ of oil cooling 30 °C shrinks by about 5 in³, which lets a 3" bore cylinder move about three quarters of an inch.',
        'A bypass test isolates the piston seal, but must only be done with the load lowered or blocked and the cylinder at the end of its stroke.',
        'External leaks at the gland almost always follow rod damage or grit; replacing the seal without fixing the rod buys days.',
      ],
    },
    {
      type: 'lead',
      html: 'The boom was up at the end of the shift and on its stops by the morning. The log splitter will not hold its wedge. The tipper body creeps down on the road. In every case the first suspect is the cylinder, the first remedy a seal kit, and in a large share of cases the cylinder is fine. This article explains why, and how to prove where the leak is before money is spent.',
    },

    { type: 'section_head', number: '/01', title: 'Why the piston seal is usually not the culprit.', anchor: 'physics' },
    {
      type: 'prose',
      html: '<p>Take a double-acting cylinder holding a load that is trying to retract it — a boom held up, a press platen hanging. The cap side is pressurised by the load; the rod side is at low pressure. Now suppose both ports are perfectly sealed and the piston seal leaks.</p><p>For the rod to retract by one inch, the cap side must lose a full bore’s worth of oil (bore area × 1"). The only place that oil can go is across the piston into the rod side — but the rod side only grows by the <em>annulus</em> area × 1", which is smaller by the rod’s own area. There is nowhere for the difference to go. Oil is, for practical purposes, incompressible, so the piston can only move as far as the oil compresses and the hoses swell: very little. The pressure on both sides simply rises until the rod area alone carries the load.</p><p>So for a double-acting cylinder to drift <em>significantly</em> under load, oil has to leave the cylinder altogether — and that means through the valve or fittings that are supposed to be holding it, or past the rod seal to the outside, where you would see it. Brendan Casey, writing in Power &amp; Motion, makes the same point and adds the catch: once a bypassing seal equalises the two sides, the static pressure rises — in his example from 2,000 psi to about 3,000 psi, depending on area ratio. If that higher pressure reaches the setting of a port relief valve, or is enough to crack a counterbalance valve, the cylinder <em>will</em> creep. A bypassing piston seal therefore causes drift indirectly, by pushing pressure up to a valve that then lets oil out.</p><p>This is not to say piston seals never fail. A bypassing piston seal shows up as a cylinder that loses force or speed under load, will not hold pressure in a bypass test, runs hot, or drifts when the valve <em>also</em> leaks a little. It is to say that drift alone is not proof.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Single-acting cylinders are different.',
      body: 'A single-acting or ram cylinder has only one working chamber. Any leak past its seal goes straight to the vented side or to the outside, and the load comes down. For those cylinders, drift does point at the seal — or at the valve, the hose or the check that holds the line.',
    },

    { type: 'section_head', number: '/02', title: 'Where the oil really goes.', anchor: 'causes' },
    {
      type: 'prose',
      html: '<h3>Spool valve leakage</h3><p>An ordinary spool-type directional valve is not leak-tight. The spool slides in its bore with a small running clearance, and oil under load pressure seeps past it to tank. New valves leak a little; worn valves, and valves running hot thin oil, leak more. A cylinder held only by a spool valve will always drift eventually. That is why loads that must stay put are held by poppet-type load-holding valves.</p><h3>Load-holding valves</h3><p>Pilot-operated check valves and counterbalance valves are poppet valves that seal much more tightly. When they drift, the usual causes are contamination holding the poppet off its seat, a worn or eroded seat, a counterbalance set too low for the load, or a pilot line that is pressurised when it should not be. They are cartridges: cleaning or replacing one is quicker than a cylinder rebuild.</p><h3>Thermal contraction</h3><p>Hydraulic oil shrinks as it cools — by roughly 0.07–0.08% of its volume for every degree Celsius, the range usually given for mineral oils. A 3" bore cylinder extended 36" holds about 254 in³ on the cap side. Cool it from 70 °C at the end of the shift to 40 °C overnight and the oil shrinks by about 5.3 in³, which lets the piston move about 0.76" with no leak anywhere. A cylinder that settles a fixed amount after a hot shift and then stops is almost always this.</p><h3>Leaking fittings and hoses</h3><p>A weeping fitting on the cap side lets oil out as surely as a valve. Look for wet fittings and dust stuck to oil on the lines between the valve and the cylinder.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Reading the symptom',
      columns: ['Symptom', 'Most likely cause', 'First check'],
      rows: [
        { cells: ['Settles a fixed amount after a hot shift, then stops', 'Thermal contraction', 'Does it happen when the oil is already cool?'] },
        { cells: ['Creeps steadily, faster when hot', 'Spool valve leakage', 'Is the load held only by a spool valve?'], highlight: true },
        { cells: ['Drifts despite a counterbalance or pilot check', 'Contaminated or worn load-holding cartridge, or setting too low', 'Swap or clean the cartridge; check the setting'] },
        { cells: ['Slow, weak, hot under load; fails a bypass test', 'Piston seal bypass', 'Bypass test at end of stroke'] },
        { cells: ['Oil on the rod, dripping from the gland', 'Rod seal or wiper failure, usually from rod damage', 'Inspect the rod for scoring, pitting or bend'] },
        { cells: ['Creeps only under the heaviest loads', 'Piston bypass raising static pressure to a port relief or counterbalance setting', 'Gauge the holding pressure; compare with relief and counterbalance settings'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'The bypass test, done safely.', anchor: 'test' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never open a cylinder line under load.',
      body: 'Lower the load to the ground or block it mechanically before loosening any fitting. A line opened on a cylinder that is holding a load releases the load and can eject oil at injection-injury pressure. Relieve pressure, wear eye protection, and keep hands clear of the rod path.',
    },
    {
      type: 'prose',
      html: '<p>The bypass test isolates the piston seal from everything else. On a double-acting cylinder:</p><ol><li>Lower or block the load so the cylinder is carrying nothing, and relieve all pressure.</li><li>Run the cylinder to the end of its stroke in the direction you want to test — fully extended to test the seal against cap-side pressure.</li><li>Disconnect the hose from the <em>opposite</em> port (the rod-end port, for the extended test) and either cap the hose or direct the open cylinder port into a clean container. The open port must stay open: a capped cylinder port turns the test into the intensification trap described in <a href="/blog/hydraulic-cylinder-force-and-speed">cylinder force and speed</a>.</li><li>Pressurise the cap end gently with the valve, up to working pressure, with the piston held against its stop.</li><li>Watch the open rod-end port. A good seal lets at most a few drops pass. A steady stream means the piston seal is bypassing.</li><li>Repeat in the other direction — fully retracted, cap-end port open — to test the seal the other way.</li></ol><p>If the cylinder passes and still drifts, the leak is in the valve, the load-holding cartridge or the lines. If it fails, a seal kit is justified — but inspect the barrel bore when it is apart, because a scored barrel will cut the new seal just as quickly.</p><p>The end-of-stroke test has one blind spot: with the piston against its stop, it does not show a barrel that balloons under pressure and lets the seal bypass only mid-stroke. Workshops with test benches use a mid-stroke hydrostatic test with gauges on both sides instead — the rod side is pressurised with the piston parked mid-stroke and the cap side locked in, and the two gauges should hold a steady ratio set by the areas. It needs valves and gauges on both ports and must never have flow directed into a locked chamber; it is a bench test, not a field one.</p>',
    },

    { type: 'section_head', number: '/04', title: 'External leaks and what they tell you.', anchor: 'external' },
    {
      type: 'prose',
      html: '<p>Oil on the rod, a ring of grime at the gland, or drips on the ground under the cylinder mean the rod seal or wiper has failed. The seal is rarely the root cause — and one cause is invisible: a standard rod seal is built to keep pressurised oil in, not to keep air out, so a cylinder pulled out faster than the pump fills the rod side draws air past the seal. Compressing that air-oil mix can ignite it (dieseling), scorching the seals from inside. A misadjusted load-control valve is the usual culprit; pre-filling both sides and cycling without load after a rebuild is the prevention.</p><p>The other causes are on the rod:</p><ul><li><strong>Scored or pitted rod.</strong> Grit carried in past a worn wiper, or corrosion on a rod left extended in salt air, cuts the seal lip on every stroke. Run a fingernail along the rod: if it catches, a new seal will not last.</li><li><strong>Bent rod.</strong> Side load or a knock; the seal opens on one side. Roll the rod on a flat surface or check it with a dial gauge.</li><li><strong>Worn gland bearing.</strong> Side load wears the bearing oval, the rod moves off centre, and the seal cannot follow it.</li><li><strong>Extruded seal.</strong> Pressure spikes or rod-end intensification push the seal into the clearance gap, leaving a nibbled, feathered edge.</li><li><strong>Heat.</strong> A hardened, cracked seal points at oil temperature above the compound’s range.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Rods left extended in coastal air.',
      body: 'A chrome rod left extended for weeks on a machine parked near the sea — a jetty crane, a port reach stacker, a dredger — can pit in places the wiper cannot clean. Park cylinders retracted where possible, wipe and protect exposed rods, and inspect for pitting before resealing.',
    },

    { type: 'section_head', number: '/05', title: 'Repair or replace?', anchor: 'decide' },
    {
      type: 'prose',
      html: '<p>Reseal when the barrel bore and rod chrome are undamaged and the cylinder is straight. Replace when the rod is pitted, scored or bent, the barrel is scored, or the cylinder is a common stock size where a new one costs little more than the labour of a rebuild. For common welded sizes the replacement is usually the better value; for large tie-rod and special cylinders, re-chroming and honing can be worth it. Either way, fix whatever damaged the rod — wiper, side load, rod boot, parking habit — or the next set of seals will fail the same way.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Drift, in the order to check it',
      branches: [
        { condition: 'Does it only settle after a hot shift, then stop?', outcome: 'Thermal contraction. Normal; nothing to fix.' },
        { condition: 'Is the load held only by a spool valve?', outcome: 'Spool leakage is expected. Fit a pilot-operated check or counterbalance valve if the load must hold.' },
        { condition: 'Is there a load-holding valve?', outcome: 'Clean or swap the cartridge and check its setting before touching the cylinder.' },
        { condition: 'Any wet fittings or hoses between valve and cylinder?', outcome: 'Fix the leak, then retest.' },
        { condition: 'Does the cylinder fail a bypass test?', outcome: 'Piston seal bypass confirmed. Reseal, and inspect the barrel.' },
        { condition: 'Oil at the gland?', outcome: 'Rod seal or wiper. Inspect the rod before ordering seals.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why does my hydraulic cylinder drift down?', answer: 'Usually because oil is escaping through the directional valve, a load-holding valve or a fitting, or because the oil has cooled and shrunk. A leaking piston seal alone rarely lets a double-acting cylinder drift far, because the two sides change volume by different amounts.' },
        { question: 'How do I test a hydraulic cylinder for internal leakage?', answer: 'With the load lowered or blocked, run the cylinder to the end of its stroke, disconnect the opposite port into a container, and pressurise. A steady flow from the open port means the piston seal is bypassing. Never cap the open cylinder port.' },
        { question: 'Can a bad piston seal cause drift?', answer: 'On a single-acting cylinder, yes. On a double-acting cylinder, only significantly if oil can also leave the cylinder — through the valve or a fitting. Alone, it shows as loss of force or speed and a failed bypass test.' },
        { question: 'Why does my cylinder drift more when the oil is hot?', answer: 'Hot oil is thinner, so it leaks faster past the spool clearance in the valve. The same valve that holds tolerably when cold drifts noticeably when hot.' },
        { question: 'What stops a hydraulic cylinder from drifting?', answer: 'A poppet-type load-holding valve — a pilot-operated check valve or counterbalance valve — mounted as close to the cylinder as possible, in good condition and correctly set.' },
        { question: 'Why does my cylinder keep leaking at the rod after new seals?', answer: 'The rod is almost always damaged — scored, pitted or bent — or the gland bearing is worn. A new seal on a damaged rod fails quickly. Inspect the rod, and fix the cause: the wiper, side load or exposure.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Replacement cylinders and repair kits',
      skus: ['IH-CHF-CL-3', 'IH-MAX-CT-3', 'IH-MAG-WTGN-TG-2', 'IH-BLY-TR-35', 'IH-ENE-CYL-RC-KIT', 'IH-ENE-CYL-RC'],
    },
    { type: 'category_link', slug: 'welded-hydraulic-cylinders', label: 'Welded cylinders', blurb: 'Stock replacements by bore, stroke and mount.' },
    { type: 'category_link', slug: 'high-pressure-cylinders', label: '10,000 psi cylinders and repair kits', blurb: 'Including RC-series repair kits.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'hydraulic-cylinder-force-and-speed', 'welded-vs-tie-rod-hydraulic-cylinders', 'hydraulic-fluid-injection-injury', 'contamination-during-a-hose-change'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Volume and thermal-contraction figures computed 2026-10-21; contraction uses a typical published expansion coefficient for mineral hydraulic oil.',
    },
    {
      type: 'cta_block',
      heading: 'Cylinder that will not hold?',
      body: 'Tell us what drifts, how fast, whether it is worse hot, and what valve holds it. If it is the cylinder, send the measurements and we will quote a replacement or a seal kit.',
      quoteLabel: 'Ask us',
    },
  ],
}

export default ARTICLE
