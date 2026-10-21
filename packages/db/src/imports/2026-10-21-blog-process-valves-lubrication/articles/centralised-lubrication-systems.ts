import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Centralised (automatic) lubrication systems: SLR, PDI, progressive, Dualine and multi-line; oil vs grease; drives;
 * chain lubrication; choosing; monitoring. All sources are Bijur Delimon's own pages and documents, read 2026-10-21
 * (from the maker's download URLs, via the Bijur Delimon document export):
 * - Automatic Lubrication Systems FAQ page (definition of a centralised system; oil mainly on stationary machines such
 *   as CNC, grease mainly on mobile units; one-line descriptions of SLR, PDI, series progressive and dual line).
 * - Brochure 258, Single Line Resistance Systems (up to 100 points; the resistance fitting, not the lubricator,
 *   apportions oil; manual, automatic cyclic and continuous systems; type F meter units vs type C control units;
 *   5/32 in main tube; oil 20–2000 cSt passing a 25–40 micron filter).
 * - Brochure 262, SureFire SLR (75 psi relief, 130 psi three-phase; up to 100 points).
 * - Brochure 200, SureFire PDI (injector firing, pressure switch, quick-release valve venting the line so injectors
 *   reset; 450 psi max; oil 20–1500 cSt, soft grease NLGI 000/00; points added or removed easily; ZEM injectors
 *   0.01–1.5 cc/cycle; 220 psi needed at the injector).
 * - Datasheet 35635, PVB divider (progressive sequence; 0.20 cc per outlet per cycle, outlets combinable; 6–20
 *   outlets; 350 bar; one cycle switch monitors the system; NLGI 000–2 grease, ISO VG 68–1500 oil).
 * - Brochure DL29, Farval Dualine (two supply lines alternately pressurised by a reversing valve; central station =
 *   lubricator + cycle switch + reversing valve; economical above 20 points; a blocked branch does not stop the
 *   system; light oil to NLGI 2; adjustable discharge; DD/DM valves 3,500 psi; DC41 pressure switches + FR20 valve).
 * - Datasheet 35214, FZ-A (multi-line direct feed to 12 points, more via progressive dividers; flange motor or machine
 *   drive by ratchet or rotary drive; ultrasonic level switch for automatic refill; working outlets never plugged).
 * - Datasheet P_2006_1 ZP5000 (one delivery element per point, up to 16 points, 160 bar; or supply pump to
 *   progressive dividers).
 * - Datasheet 20349, AirMatic (shop air, spring-return piston, 2–10 cc per stroke, 3/2 solenoid valve, dry air via an
 *   FRL; SLR, PDI, progressive and injector systems).
 * - Datasheet 35948, PulseFire (plumbed into a regularly cycled hydraulic actuator line; up to 15 cc per stroke;
 *   8 outlets with meter units; drive chains on agricultural machines with brushes).
 * - Datasheet 24795, rotary-drive gear pump (driven from a machine shaft, 20–1000 rpm, about 50 cc/min per 100 rpm).
 * - Manual BA_2018_1 WS-E (chains, joints, rollers; 40–900 cSt; 30 bar; up to 7 cycles a second; ZE-E dynamic
 *   dividers, "flying drop"; furthest ZE-E within 5 m of the pump).
 * - Datasheet 36980, MultiPort II progressive (12/24 VDC mobile; up to three elements; IP69K; integral controller,
 *   SMDC or customer PLC).
 * - Datasheet 36922, Electric Barrel Pump (AC or DC replacement for air or hydraulic barrel pumps; 300 bar max;
 *   progressive, injector with vent valve, Dualine with reversing valve).
 * - CS2000 operator manual 2011F (low-level warning switch, visual level and adjustable relief valve standard; high-level
 *   switch option) and GPO datasheet 35641 (level indicator and gauge standard; bypass valve on progressive versions,
 *   dump valve on PDI versions).
 * NOT used: distance limits for SLR and PDI main lines, grease pumpability limits by temperature, any comparison of
 * running costs between system types — not stated in the documents read. No prices.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'centralised-lubrication-systems',
  title: 'Centralised lubrication systems: SLR, PDI, progressive, dual-line and multi-line compared',
  excerpt:
    'A centralised lubrication system feeds measured lubricant to many points from one pump while the machine runs. The five ways of distributing it — single-line resistance, positive displacement injectors, progressive dividers, dual-line and multi-line — differ in what meters the dose, which lubricants they handle and how many points they suit. How each works, oil against grease, electric, air, hydraulic and machine drives, chain lubrication, and what to send for a quote.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Centralised Lubrication Systems: SLR, PDI, Progressive',
  seoDescription:
    'How centralised lubrication systems work: SLR, PDI injectors, progressive dividers, Dualine and multi-line pumps, oil vs grease, drives and monitoring.',
  focusKeyword: 'centralised lubrication system',
  publishedAt: '2026-10-22T01:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'In a single-line resistance (SLR) system the fitting at each point, not the pump, sets how much oil that point gets.',
        'PDI injectors each discharge a fixed shot when the line is pressurised, then reset when the pump vents the line.',
        'Progressive dividers discharge outlet by outlet in a fixed sequence, so one cycle switch can prove the whole block.',
        'Dual-line systems alternate pressure between two main lines and suit large plants; Bijur rates them economical above 20 points.',
        'Multi-line pumps feed each point from its own pumping element, with no distribution valves between pump and bearing.',
      ],
    },
    {
      type: 'lead',
      html: 'Bijur Delimon defines a centralised lubrication system as one that delivers controlled amounts of lubricant to multiple points on a machine while it is operating. Every system has the same three parts — a pump and reservoir, a distribution network, and a device at or near each point that meters the dose — and the type of system is named after that metering device. Choosing the type comes first; the pump follows from it.',
    },

    { type: 'section_head', number: '/01', title: 'Five ways to split the flow.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Centralised lubrication system types',
      columns: ['System', 'What meters the dose', 'Lubricant', 'Typical use'],
      rows: [
        { cells: ['Single-line resistance (SLR)', 'Meter or control unit (a calibrated restrictor) at each point', 'Oil', 'Machine tools and small to medium machines, up to about 100 points'], highlight: true },
        { cells: ['Positive displacement injector (PDI)', 'Injector discharges a fixed shot, then resets when the line vents', 'Oil, fluid grease', 'Industrial and mobile machines; points easy to add or remove'] },
        { cells: ['Series progressive', 'Divider segments discharge in a fixed sequence', 'Oil, grease to NLGI 2', 'Mobile plant and industrial grease systems'] },
        { cells: ['Dual-line (Dualine)', 'Measuring valves worked by two main lines in turn', 'Light oil to NLGI 2 grease', 'Steel, pulp and paper, mining; large point counts and long lines'] },
        { cells: ['Multi-line (direct feed)', 'One pumping element per point', 'Oil, grease', 'Machines with a few individually fed points; can also supply progressive dividers'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>Single-line resistance.</strong> The pump pressurises one main line — typically 5/32″ tube on Bijur systems — and a resistance fitting at each point lets through its share. Bijur’s SLR brochure is explicit that the amount at each point is apportioned by the fitting, not the lubricator; the pump only sets the total available. Cyclic systems fire at intervals and use type F meter units; continuous systems run constantly through type C control units. A <a href="/p/bijur-delimon-surefire-ii-single-phase-lubrication-pumps">SureFire II</a> SLR pump runs at a 75 psi relief setting, and Bijur rates SLR systems at up to 100 points. The oil must be clean mineral oil of 20–2,000 cSt that passes a 25–40 micron filter.</p><p><strong>Positive displacement injectors.</strong> Each injector stores a fixed volume. When the pump pressurises the line every injector fires its shot; a pressure switch stops the motor, and a quick-release valve vents the line to the reservoir so the injectors spring back and refill. Bijur’s ZEM injectors range from 0.01 to 1.5 cc per cycle and need 220 psi at the injector to fire. Because each injector meters its own shot, points can be added to or removed from the system without redesigning it.</p><p><strong>Series progressive.</strong> A divider block is a stack of piston segments; each segment completes its stroke and discharges to its point before the next one moves. If any outlet blocks, the sequence stops, so a single cycle switch on one segment proves every outlet. Bijur’s PVB divider gives a fixed 0.20 cc per outlet per cycle, with 6 to 20 outlets that can be combined for larger doses.</p><p><strong>Dual-line.</strong> Two main lines run past measuring valves mounted close to the points. A reversing valve pressurises line 1, then line 2; each change drives the valve pistons and discharges a set, adjustable volume. Farval DD and DM valves are rated 3,500 psi, and a blocked branch does not shut down the rest of the system. Bijur calls Dualine economical above 20 bearing points.</p><p><strong>Multi-line.</strong> The pump has one element per outlet and feeds each point directly. The <a href="/p/bijur-delimon-fz-a-multi-line-grease-lubricators">FZ-A</a> serves up to 12 points this way, and a <a href="/p/bijur-delimon-zp3000-zp4000-zp5000-and-zp6000-multi-line-pumps">ZP5000</a> up to 16 at 160 bar; either can also supply progressive dividers to reach more points. A working outlet on a multi-line pump must never be plugged.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Oil or grease.', anchor: 'lubricant' },
    {
      type: 'prose',
      html: '<p>Bijur’s rule of thumb: oil systems are used mainly on stationary manufacturing equipment such as CNC machines, and grease systems mainly on mobile units — trucks, mining and construction plant. The lubricant then narrows the system type:</p><ul><li><strong>SLR is oil only.</strong> The resistance fittings depend on oil flowing through a restriction.</li><li><strong>PDI takes oil or fluid grease.</strong> The SureFire PDI pump handles oil of 20–1,500 cSt and soft greases of NLGI 000 and 00.</li><li><strong>Progressive, dual-line and multi-line take grease</strong> — typically up to NLGI 2 — as well as oil.</li></ul><p>Grease grade comes from the bearing, not the system — see <a href="/blog/grease-selection-base-oil-thickener-nlgi">grease selection by base oil, thickener and NLGI grade</a> — but the system must be able to push it. Check the pump’s NLGI range against the grease before you order.</p>',
    },

    { type: 'section_head', number: '/03', title: 'What drives the pump.', anchor: 'drives' },
    {
      type: 'prose',
      html: '<ul><li><strong>Electric AC</strong> — single- or three-phase motors for plant. SureFire II, V5, GPO and TM-1 oil pumps; BM-B and BS-B grease pumps for dual-line and large systems.</li><li><strong>Electric DC</strong> — 12 or 24 VDC for mobile machines. <a href="/p/bijur-delimon-multiport-ii-lubricators">MultiPort II</a> takes up to three pumping elements, is rated IP69K and runs from its own controller, an external one or the machine PLC; Dynamis Maxx and CLP are the other DC grease pumps.</li><li><strong>Compressed air</strong> — air-operated piston pumps cycled by a 3/2 solenoid valve. The <a href="/p/bijur-delimon-airmatic-air-operated-oil-lubricators">AirMatic</a> discharges 2–10 cc of oil per stroke into SLR, PDI or progressive systems; Bijur specifies dry air through a filter-regulator-lubricator.</li><li><strong>Machine hydraulics</strong> — the <a href="/p/bijur-delimon-pulsefire-hydraulic-oilers">PulseFire</a> is plumbed into a regularly cycled actuator line and dispenses up to 15 cc on every actuator stroke, with no electrics at all.</li><li><strong>Mechanical</strong> — driven by the machine itself. Bijur’s rotary gear pumps run from a shaft at 20–1,000 rpm, giving about 50 cc/min per 100 rpm; the FZ-A can be driven by ratchet or rotary drive, so output follows machine speed without a separate controller.</li></ul><p>Where grease is fed straight from the drum, an <a href="/p/bijur-delimon-electric-barrel-pumps">Electric Barrel Pump</a> (to 300 bar, AC or DC) can replace an air or hydraulic barrel pump on progressive, injector or Dualine systems. For manual and drum pumps, see <a href="/blog/grease-and-oil-drum-pumps-and-manual-lubricators">grease and oil drum pumps and manual lubricators</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Chains.', anchor: 'chains' },
    {
      type: 'prose',
      html: '<p>A moving chain cannot be piped, so the lubricant has to be placed on it in flight. Bijur Delimon’s <a href="/p/bijur-delimon-ws-e-chain-lubrication-units">WS-E</a> is a gear pump unit for chains, joints, rollers and hinges. With ZE-E dynamic dividers it places a metered drop on the moving part — up to seven per second, depending on viscosity — using mineral oil of 40 to 900 cSt at up to 30 bar. The furthest ZE-E divider must be within 5 m of the pump. On agricultural machines the PulseFire does the same job hydraulically, through meter units and brushes.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Choosing, and proving it works.', anchor: 'choosing' },
    {
      type: 'prose',
      html: '<p>Work through the machine in this order:</p><ul><li><strong>Points and their demand.</strong> List each point, what it is (bearing, slide, pin, gear, chain) and how much it needs. SLR suits up to about 100 closely grouped oil points; PDI suits machines where points will be added later; progressive suits grease on mobile plant; dual-line suits large plants with long main lines.</li><li><strong>Lubricant.</strong> Oil viscosity in cSt at operating temperature, or grease NLGI grade. This rules system types in or out (section 02).</li><li><strong>Power available.</strong> Mains AC, 12/24 VDC, shop air, machine hydraulics or a drive shaft.</li><li><strong>Environment.</strong> Outdoor and wash-down duty, temperature, and hazardous areas — the FZ-A and FZ-B come in ATEX versions.</li></ul><p><strong>Reservoir and monitoring.</strong> Size the reservoir for the refill interval you want; The FZ-A and FZ-B take an ultrasonic level switch and fill port so the reservoir can be refilled automatically. Low-level switches are standard or optional across the range, and the controller should treat a low level as a fault. Pressure proves delivery: SureFire PDI pumps carry a pressure switch that ends each cycle, DC41 Dualine stations reverse on a pressure switch in each main line, and progressive systems are proved by the cycle switch on the divider. A system that cannot report a missed cycle will fail without anyone noticing.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a centralised lubrication system?', answer: 'A system that feeds measured amounts of lubricant to many points on a machine from one pump and reservoir, usually automatically and while the machine is running.' },
        { question: 'What is the difference between SLR and PDI?', answer: 'In SLR, a restrictor at each point shares out oil from a low-pressure line. In PDI, each injector discharges a fixed shot when the line is pressurised and resets when the pump vents the line; PDI also takes fluid grease.' },
        { question: 'Can a progressive system use grease?', answer: 'Yes. Bijur’s PVB dividers handle grease of NLGI 000 to 2 and oil of ISO VG 68 to 1500.' },
        { question: 'When is a dual-line system worth it?', answer: 'On large plants with many points and long main lines; Bijur Delimon rates Dualine economical above 20 bearing points, and a blocked branch does not stop the rest of the system.' },
        { question: 'How is a centralised system monitored?', answer: 'With a low-level switch on the reservoir, plus a pressure switch (SLR, PDI, Dualine) or a divider cycle switch (progressive) that proves each cycle to the controller or PLC.' },
        { question: 'Can a lubricator run without electricity?', answer: 'Yes. Air-operated pumps run on shop air, the PulseFire runs from machine hydraulics, and gear pumps and the FZ-A can be driven by the machine itself.' },
      ],
    },
    {
      type: 'prose',
      html:
        '<h3>What we list</h3><p>Electric lubrication pumps (Bijur Delimon):</p>' +
        stockList(['electric-lubrication-pumps']) +
        '<p>Air- and hydraulic-operated lubrication pumps:</p>' +
        stockList(['pneumatic-lubrication-pumps']) +
        '<p>Gear pumps and mechanical lubricators:</p>' +
        stockList(['lubrication-gear-pumps']) +
        '<p>Service kits and spare parts for Bijur Delimon pumps and lubricators, by pump family:</p>' +
        stockList(['lubrication-pump-spare-parts']),
    },
    {
      type: 'product_embed',
      heading: 'Centralised lubrication pumps',
      skus: ['IH-BD-SFX1', 'IH-BD-MP2', 'IH-BD-DYX', 'IH-BD-DC', 'IH-BD-FZA', 'IH-BD-WSE', 'IH-BD-AIRM', 'IH-BD-PULSE'],
    },
    { type: 'category_link', slug: 'electric-lubrication-pumps', label: 'Electric lubrication pumps', blurb: 'Bijur Delimon oil and grease pumps for SLR, PDI, progressive, Dualine and multi-line systems.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'bd-faq', text: 'Bijur Delimon International. Automatic Lubrication Systems FAQ.', url: 'https://www.bijurdelimon.com/automatic-lubrication-faq.html' },
        { id: 'bd-258', text: 'Bijur Delimon International. Single Line Resistance Systems, brochure 258.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/319/' },
        { id: 'bd-200', text: 'Bijur Delimon International. SureFire PDI, brochure 200.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/294/' },
        { id: 'bd-pvb', text: 'Bijur Delimon International. PVB Divider Valve, datasheet 35635.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/103/' },
        { id: 'bd-dl29', text: 'Bijur Delimon International. Farval Dualine Systems, brochure DL29.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/202/' },
        { id: 'bd-fza', text: 'Bijur Delimon International. FZ-A Lubricator, datasheet 35214.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/70/' },
        { id: 'bd-zp5000', text: 'Delimon. Central lubrication pump ZP5000, datasheet P_2006_1.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/700/' },
        { id: 'bd-wse', text: 'Delimon. WS-E chain lubrication unit, operating instructions BA_2018_1.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/698/' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['grease-and-oil-drum-pumps-and-manual-lubricators', 'grease-selection-base-oil-thickener-nlgi', 'grease-and-zerk-fittings', 'anti-friction-coatings-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'System principles, ratings and point counts from Bijur Delimon’s FAQ, SLR, SureFire PDI and Dualine brochures, and the PVB, FZ-A, ZP5000, WS-E, AirMatic, PulseFire and gear pump datasheets.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a lubrication system?',
      body: 'Send the machine, the number and type of lubrication points, the oil or grease in use, the power available and the environment. We will propose the Bijur Delimon pump, distribution and monitoring to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
