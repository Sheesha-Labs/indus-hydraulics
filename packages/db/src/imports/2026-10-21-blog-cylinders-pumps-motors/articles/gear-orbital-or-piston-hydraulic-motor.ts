import type { BlogArticleSeed } from '../shared'
import { MOTOR_TORQUE_RANGES } from '../diagrams'

/**
 * Motor types compared. Ratings from maker documents read 2026-10-21: Cross 40-series gear motors (3,000 psi,
 * 3,600 rpm, 0.5–1.8 in³); Danfoss orbital range (8–800 cc, ~2,500 rpm small to ~600 rpm large, 13–2,700 Nm);
 * Char-Lynn 10000 (2,700/3,440 Nm); Rexroth A2FM series 70 bent-axis (400/450 bar, 6,300–6,900 rpm size 23,
 * 146–796 Nm at 400 bar); Hägglunds CA (350/420 bar, η_m 0.98); Poclain MS (to 77,000 Nm). Low-speed smoothness
 * and starting-torque rules from Power & Motion "Fundamentals of Hydraulic Motors" (2014). Gear-motor max torque
 * computed: 1.8 in³ × 3,000 psi ÷ 2π ≈ 860 lb-in ≈ 97 Nm.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'gear-orbital-or-piston-hydraulic-motor',
  title: 'Gear, orbital, vane or piston: which hydraulic motor for the job?',
  excerpt:
    'Hydraulic motors split into high-speed, low-torque types that usually need a gearbox and low-speed, high-torque types that drive the load directly. How gear, orbital, vane, axial piston and radial piston motors compare on speed, torque, pressure, efficiency and price — with real ratings — and how to pick one for a fan, an auger, a wheel or a winch.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Types of Hydraulic Motors: Gear vs Orbital vs Piston Compared',
  seoDescription:
    'Hydraulic motor types compared: gear, orbital (gerotor), vane, axial piston and radial piston motors — speed, torque, pressure, efficiency, low-speed smoothness, cost and which to choose for fans, augers, wheels and winches.',
  focusKeyword: 'types of hydraulic motors',
  publishedAt: '2026-10-21T09:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Gear motors are cheap, simple and fast — a Cross 40-series runs to 3,600 rpm at 3,000 psi — but small: about 97 Nm at the top of the range.',
        'Orbital motors are the low-cost low-speed, high-torque option, from 8 to about 940 cc/rev and up to 2,700 Nm continuous on the largest Char-Lynn.',
        'Bent-axis piston motors are the most efficient high-speed motors and the highest-pressure common type: 400 bar nominal, 450 bar maximum on the Rexroth A2FM.',
        'Radial piston (cam-lobe) motors deliver the most torque — up to 77,000 Nm on the largest Poclain MS — with mechanical efficiency around 98% once running.',
        'Starting torque is the trap for every type: about 70–80% of theoretical against about 90% running.',
      ],
    },
    {
      type: 'lead',
      html: 'Choosing a hydraulic motor starts with one question: should the motor turn fast and drive through a gearbox, or turn slowly and drive the load directly? The answer sorts the five common motor types into two groups, and within each group the choice is about pressure, efficiency, smoothness at low speed, and how much the machine can afford to spend.',
    },

    { type: 'section_head', number: '/01', title: 'Two families: HSLT and LSHT.', anchor: 'families' },
    {
      type: 'prose',
      html: '<p><strong>High-speed, low-torque (HSLT)</strong> motors — gear, vane and most axial piston motors — run at hundreds to thousands of rpm with small displacements. They are compact and efficient at speed, and when the load needs slow, heavy torque they drive it through a gearbox: a winch drive, a planetary wheel drive, a slew gearbox.</p><p><strong>Low-speed, high-torque (LSHT)</strong> motors — orbital motors and radial piston motors — have large displacements and turn at tens to a few hundred rpm, producing high torque directly. They usually drive the load without a gearbox: an auger on the shaft, a wheel on the flange, a conveyor pulley on a coupling.</p><p>Neither is better. A gearbox adds cost and a component to maintain, but lets a small, efficient motor do the work; an LSHT motor removes the gearbox but is larger and, in the orbital case, less efficient.</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Maximum torque by motor type, from maker ratings, on a logarithmic scale. Each step of the scale is ten times the last, which is the only way to show a gear motor and a cam-lobe radial piston motor on one chart.',
      alt: 'Logarithmic bar chart of maximum torque by motor type. Gear motor, Cross 40 series at 3,000 psi: about 97 Nm. Bent-axis piston motor, Rexroth A2FMM 125 at 400 bar: 796 Nm. Orbital motor, Char-Lynn 10000 series: 2,700 Nm continuous. Radial piston cam-lobe motor, Poclain MS125: 77,000 Nm.',
      svg: MOTOR_TORQUE_RANGES,
    },

    { type: 'section_head', number: '/02', title: 'Gear motors.', anchor: 'gear' },
    {
      type: 'prose',
      html: '<p>A gear motor is a gear pump run backwards: oil pushes on the gear teeth and turns them. Cross’s 40-series gear motors are typical — 0.5 to 1.8 in³/rev, rated 3,000 psi with 3,500 psi shock, 3,600 rpm continuous, bi-directional, SAE A 2-bolt with a 5/8" spline or keyed shaft. The 50 series moves to an SAE B flange and the 60 series to SAE C for larger sizes.</p><p>At 1.8 in³/rev and 3,000 psi a gear motor makes about 860 lb-in (97 Nm) in theory. They are inexpensive and work well at higher speeds; their efficiency falls as the teeth wear, and their starting torque is modest. The natural uses are loads that need speed and little torque at standstill: <strong>fans</strong> (whose torque rises with speed), centrifugal pumps, spreaders and spinners, and drives through a reduction gearbox.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Orbital (gerotor and geroler) motors.', anchor: 'orbital' },
    {
      type: 'prose',
      html: '<p>Orbital motors are the workhorse LSHT motor of mobile and light industrial hydraulics. Danfoss’s range covers 8–800 cc/rev, with maximum speeds of about 2,500 rpm for the smallest and about 600 rpm for the largest, and torque from 13 to about 2,700 Nm peak; Char-Lynn’s reaches about 940 cc/rev and 225 bar continuous, with the 10000 series rated 2,700 Nm continuous and 3,440 Nm intermittent.</p><ul><li><strong>Strengths:</strong> high torque at low speed from a small, cheap motor; drives the load directly; a wide choice of flanges, wheel mounts, brakes and shafts.</li><li><strong>Limits:</strong> lower efficiency than piston motors — measured overall efficiency at a rated point runs from about 73% on a budget clone to 83% on a Danfoss OMT; speed can be uneven at very low rpm on small spool-valve motors; shaft seals are sensitive to back pressure.</li><li><strong>Uses:</strong> augers, conveyors, sweeper brushes, mixers, compact-machine wheel drives, winches, slew drives, agricultural implements.</li></ul><p>The families, codes and mounts are covered in <a href="/blog/orbital-hydraulic-motor-guide">the orbital motor guide</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Vane motors.', anchor: 'vane' },
    {
      type: 'prose',
      html: '<p>Vane motors work like vane pumps in reverse. They offer good efficiency — though less than piston motors — smooth running, and speeds into the thousands of rpm on small sizes. Their low-speed ability is limited, except in special high-displacement low-speed designs. They are found in fan drives with integrated valves, industrial drives and machine tools more than on mobile equipment.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Axial piston motors.', anchor: 'axial' },
    {
      type: 'prose',
      html: '<p>Pistons in a rotating cylinder block push against a swashplate (inline design) or are set at an angle to the shaft (bent-axis design), turning pressure into torque. Bent-axis motors are the reference for efficiency and pressure: Rexroth’s A2FM series 70 is rated 400 bar nominal and 450 bar maximum in its medium-pressure version, with the 23 cc size running to 6,300 rpm (6,900 maximum) and the 125 cc size to 4,000 rpm, producing 146 to 796 Nm at 400 bar.</p><ul><li><strong>Variable displacement:</strong> bent-axis and swashplate motors can be built variable. At large angle (around 30° on bent-axis units) displacement and torque are at maximum; at small angle (around 7.5°) speed is at maximum — a two-speed or continuously variable drive from one motor.</li><li><strong>Low-speed smoothness:</strong> inline axial piston motors run smoothly down to about 100 rpm; bent-axis designs down to about 4 rpm.</li><li><strong>Limits:</strong> cost; they need clean oil and a case drain at low pressure — the A2FM allows only 2 bar continuous at the shaft seal.</li><li><strong>Uses:</strong> hydrostatic drives for tracks and wheels through planetary gearboxes, winches, high-power industrial drives.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Radial piston motors.', anchor: 'radial' },
    {
      type: 'prose',
      html: '<p>In a cam-lobe radial piston motor, pistons arranged radially press rollers against a multi-lobed cam ring; each piston strokes several times per revolution, so a large-diameter motor produces enormous torque at very low speed with no gearbox. Two families dominate: Hägglunds, whose CA motors run to 350 bar operating and 420 bar peak with mechanical efficiency of about 0.98 (Rexroth notes this is not the starting efficiency), and Poclain’s MS range, from the MS05 at 750 cc and 4,770 Nm to the MS125 at 15,000 cc and 77,000 Nm.</p><ul><li><strong>Strengths:</strong> the highest torque of any type, smooth at very low speed, high efficiency, direct drive.</li><li><strong>Limits:</strong> size, weight and price; strict case pressure limits; a charge pressure is needed when braking.</li><li><strong>Uses:</strong> ship winches and capstans, mining and recycling shredders, conveyors and crushers, wheel and track drives on heavy machines.</li></ul>',
    },

    { type: 'section_head', number: '/07', title: 'Comparing them.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Hydraulic motor types — ratings from maker documents',
      columns: ['Type', 'Typical speed', 'Torque (examples)', 'Pressure (examples)', 'Efficiency', 'Cost'],
      rows: [
        { cells: ['Gear', 'Up to 3,600 rpm (Cross 40)', 'About 97 Nm at 1.8 in³, 3,000 psi', '3,000 psi (Cross); to 276 bar (Danfoss cast iron)', 'Moderate; falls with wear', 'Lowest'] },
        { cells: ['Orbital', 'About 600–2,500 rpm max, by size', 'Up to 2,700 Nm continuous (Char-Lynn 10000)', 'Up to 225 bar continuous', 'About 73–83% overall at rated point', 'Low'], highlight: true },
        { cells: ['Vane', 'High on small sizes', 'Small to medium', 'Medium', 'Good', 'Medium'] },
        { cells: ['Axial piston (bent-axis)', 'To 6,300–6,900 rpm (A2FM 23)', '146–796 Nm at 400 bar (A2FM)', '400 / 450 bar', 'Highest of the HSLT types', 'High'] },
        { cells: ['Radial piston (cam-lobe)', 'Up to a few hundred rpm', 'Up to 77,000 Nm (Poclain MS125)', '350 / 420 bar (Hägglunds CA); 450 bar (Poclain)', 'η_m about 0.98 running', 'Highest'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Starting torque applies to all of them.',
      body: 'Trade guidance puts running torque for common gear, vane and piston motors at about 90% of theoretical and starting torque at 70–80%. Danfoss’s OMT 160 data shows the same pattern for orbital motors: 460 Nm running at 200 bar, 340 Nm guaranteed from standstill. If the load is hardest to move from rest, size on the starting figure — see motor torque and speed.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a motor type',
      branches: [
        { condition: 'Fan, spinner, centrifugal pump — fast, light at start?', outcome: 'Gear motor.' },
        { condition: 'Auger, conveyor, brush or mixer at tens to a few hundred rpm, moderate torque?', outcome: 'Orbital motor, direct drive.' },
        { condition: 'Wheel drive on a compact machine?', outcome: 'Orbital wheel motor with tapered bearings, or a bent-axis motor into a planetary wheel drive for higher power.' },
        { condition: 'Winch or slew needing efficiency and a brake?', outcome: 'Piston or orbital motor through a gearbox with an integral holding brake.' },
        { condition: 'Very high torque at very low speed — shredder, ship winch, heavy conveyor?', outcome: 'Cam-lobe radial piston motor.' },
        { condition: 'Two speeds or variable speed from one motor?', outcome: 'Variable or two-speed piston motor, or a two-speed orbital (Char-Lynn 2000 two-speed).' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the main types of hydraulic motor?', answer: 'Gear, vane and axial piston motors (high-speed, low-torque), and orbital and radial piston motors (low-speed, high-torque).' },
        { question: 'What is the difference between LSHT and HSLT motors?', answer: 'LSHT motors have large displacements and produce high torque at low speed, driving the load directly. HSLT motors are small and fast and usually drive through a gearbox.' },
        { question: 'Which hydraulic motor is most efficient?', answer: 'Piston motors — bent-axis among the HSLT types and cam-lobe radial piston among the LSHT types. Orbital motors are the least efficient but the cheapest LSHT option.' },
        { question: 'Is a gear motor or orbital motor better?', answer: 'For speed with little starting load — fans, spinners — a gear motor. For slow, heavy torque driven directly — augers, conveyors, wheels — an orbital motor.' },
        { question: 'Which motor runs smoothest at very low speed?', answer: 'Radial piston and bent-axis piston motors; bent-axis designs run smoothly down to a few rpm. Small spool-valve orbital motors can run unevenly below about 30–50 rpm; disc-valve orbital motors are smoother.' },
        { question: 'Can any hydraulic motor hold a load?', answer: 'No. All hydraulic motors leak internally and creep under load. Use a mechanical holding brake.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Motors on our shelf',
      skus: ['IH-CRS-MH', 'IH-DFC-BMRS-4B', 'IH-DFC-BMSY-WHL', 'IH-DFC-BMV', 'IH-CL-112-119', 'IH-FLD-WF109-4BC'],
    },
    { type: 'category_link', slug: 'hydraulic-gear-motors', label: 'Gear motors', blurb: 'Cross MH gear motors, 0.5–5.2 in³/rev.' },
    { type: 'category_link', slug: 'orbital-hydraulic-motors', label: 'Orbital motors', blurb: '8 to 990 cc/rev, every common mount.' },
    {
      type: 'related_articles',
      slugs: ['orbital-hydraulic-motor-guide', 'hydraulic-motor-torque-and-speed', 'winch-drive-vs-motor-drum-vs-complete-winch', 'hydraulic-pump-types-gear-vane-piston'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings from Cross, Danfoss, Char-Lynn, Rexroth and Poclain documents; low-speed and starting-torque rules from Power & Motion.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a motor?',
      body: 'Send the torque and speed the load needs, how it starts, the pressure and flow available and the mount. We will recommend a type and size and quote it with its fittings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
