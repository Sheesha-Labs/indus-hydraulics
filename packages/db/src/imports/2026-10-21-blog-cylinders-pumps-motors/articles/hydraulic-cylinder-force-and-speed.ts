import type { BlogArticleSeed } from '../shared'
import { FORCE_3000PSI } from '../diagrams'

/**
 * Cylinder force, speed and sizing. Every figure is arithmetic: F = P × A, v = Q ÷ A, Euler buckling with
 * E = 30 × 10⁶ psi, computed 2026-10-21 and cross-checked against our own listings (3" bore at 3,000 psi =
 * 21,206 lbf, which is the 21,200 lbs column-load ceiling on the 3" welded and tie-rod listings; Rexroth
 * CDT3 100/70 at 160 bar = 125.7 kN, as on IH-CYL-100-70-500).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-cylinder-force-and-speed',
  title: 'Hydraulic cylinder force and speed: how to size bore, rod and stroke from first principles',
  excerpt:
    'Force is pressure times area and speed is flow divided by area, but a cylinder has two areas, a rod that can buckle and a rod end that can multiply pressure. Worked examples in inches and millimetres, the push and pull tables, retract speed, regeneration, buckling and the intensification trap that bursts rod-end seals.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Cylinder Force & Speed Calculation: Sizing Guide',
  seoDescription:
    'Calculate hydraulic cylinder force (P × A) and speed (Q ÷ A) for push and pull, with tables by bore, worked examples, regenerative circuits, rod buckling and rod-end pressure intensification.',
  focusKeyword: 'hydraulic cylinder force calculation',
  publishedAt: '2026-10-21T06:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Push force is pressure × full bore area; pull force is pressure × the annulus (bore area minus rod area), so every double-acting cylinder pulls weaker than it pushes.',
        'A 3" bore at 3,000 psi pushes 21,206 lbf; with a 1.5" rod it pulls 15,904 lbf. A 100 mm bore at 160 bar pushes 125.7 kN.',
        'Speed is flow ÷ area: 10 gpm moves a 3" bore out at 5.4 in/s and back at 7.3 in/s, and the cap end returns 13.3 gpm to tank on the retract stroke.',
        'Size the bore for the pressure that actually reaches the cylinder, with 20–25% margin over the load, not for the relief valve setting.',
        'Long strokes are limited by rod buckling, not by pressure: double the effective length and the buckling load falls to a quarter.',
        'Block the rod end while pressurising the cap end and the rod side sees pressure multiplied by the area ratio — 4,000 psi from a 3,000 psi supply on a 3" × 1.5" cylinder.',
      ],
    },
    {
      type: 'lead',
      html: 'Most cylinder sizing mistakes are not arithmetic mistakes. The formula is one line long. They are mistakes about which pressure, which area and which length: the relief setting used instead of the pressure at the port, the full bore used for a pulling job, the stroke used instead of the length that actually buckles. This guide works through each of those with real numbers, in both inch and metric units, and ends with the checks worth making before an order goes in.',
    },

    { type: 'section_head', number: '/01', title: 'Force is pressure times area.', anchor: 'force' },
    {
      type: 'prose',
      html: '<p>A hydraulic cylinder is a force multiplier with one rule: every square inch of piston exposed to oil at a given pressure pushes with that pressure. So the force a cylinder produces is the pressure behind the piston multiplied by the area it acts on.</p><ul><li><strong>Imperial:</strong> force (lbf) = pressure (psi) × area (in²), where area = π × bore² ÷ 4.</li><li><strong>Metric:</strong> force (kN) = pressure (bar) × area (cm²) ÷ 100, where area = π × bore² ÷ 4 with the bore in centimetres.</li></ul><p>A 3" bore has an area of 7.069 in². At 3,000 psi that is 21,206 lbf — a little over 9.6 tonnes of push. A 100 mm bore has 78.54 cm²; at 160 bar it pushes 125.7 kN, which is the figure printed on the Rexroth CDT3 100/70 tie-rod cylinder we stock.</p><p>Force rises with the <em>square</em> of the bore. Going from a 3" to a 4" bore is a 33% larger diameter but a 78% larger area, so the same pressure pushes 78% harder. That is why bore steps of half an inch matter more at the top of the range than at the bottom.</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Push and pull force at 3,000 psi for the common welded-cylinder bore and rod pairs. The gap between the two bars is the rod area, and it is widest where the rod is large relative to the bore.',
      alt: 'Bar chart of push and pull force at 3,000 psi. 1.5 inch bore with 1 inch rod: 5,301 lbf push, 2,945 lbf pull. 2 inch bore, 1.25 inch rod: 9,425 push, 5,743 pull. 2.5 inch bore, 1.25 inch rod: 14,726 push, 11,045 pull. 3 inch bore, 1.5 inch rod: 21,206 push, 15,904 pull. 3.5 inch bore, 1.75 inch rod: 28,863 push, 21,648 pull. 4 inch bore, 1.75 inch rod: 37,699 push, 30,483 pull. 5 inch bore, 2 inch rod: 58,905 push, 49,480 pull.',
      svg: FORCE_3000PSI,
    },

    { type: 'section_head', number: '/02', title: 'The rod side is smaller, so pulling is weaker.', anchor: 'pull' },
    {
      type: 'prose',
      html: '<p>On the retract stroke, oil enters the rod end and pushes on the ring of piston left around the rod — the <strong>annulus</strong>. Its area is the bore area minus the rod area. For the 3" bore with a 1.5" rod, that is 7.069 − 1.767 = 5.301 in², so at 3,000 psi it pulls 15,904 lbf: exactly three quarters of the push.</p><p>The ratio of the two areas is worth knowing for every cylinder on a machine, because it governs three separate things — pull force, retract speed and how much oil comes back out of the cap end. It is usually written as <em>φ</em> (phi) in European catalogues. Typical values:</p><ul><li>1.5" bore, 1" rod: 1.80</li><li>2" bore, 1.25" rod: 1.64</li><li>3" bore, 1.5" rod: 1.33</li><li>4" bore, 1.75" rod: 1.24</li><li>100 mm bore, 56 mm rod: 1.46; 100 mm bore, 70 mm rod: 1.96</li></ul><p>If the job is pulling — a tensioner, a hitch, a door that is drawn shut — size from the annulus, not the bore. It is the commonest single error we see on enquiries: a cylinder sized correctly for push and fitted the wrong way round.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Push and pull force by bore — imperial, at 2,500 and 3,000 psi',
      columns: ['Bore × rod', 'Bore area (in²)', 'Push @ 2,500 psi (lbf)', 'Push @ 3,000 psi (lbf)', 'Pull @ 3,000 psi (lbf)', 'Area ratio'],
      rows: [
        { cells: ['1.5" × 1"', '1.767', '4,418', '5,301', '2,945', '1.80'] },
        { cells: ['2" × 1.25"', '3.142', '7,854', '9,425', '5,743', '1.64'] },
        { cells: ['2.5" × 1.25"', '4.909', '12,272', '14,726', '11,045', '1.33'] },
        { cells: ['3" × 1.5"', '7.069', '17,671', '21,206', '15,904', '1.33'], highlight: true },
        { cells: ['3.5" × 1.75"', '9.621', '24,053', '28,863', '21,648', '1.33'] },
        { cells: ['4" × 1.75"', '12.566', '31,416', '37,699', '30,483', '1.24'] },
        { cells: ['5" × 2"', '19.635', '49,087', '58,905', '49,480', '1.19'] },
        { cells: ['6" × 2.5"', '28.274', '70,686', '84,823', '70,097', '1.21'] },
        { cells: ['8" × 3"', '50.265', '125,664', '150,796', '129,591', '1.16'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Push and pull force by bore — metric (ISO 3320 bores), at 160 and 250 bar',
      columns: ['Bore / rod (mm)', 'Bore area (cm²)', 'Push @ 160 bar (kN)', 'Push @ 250 bar (kN)', 'Pull @ 250 bar (kN)', 'Area ratio'],
      rows: [
        { cells: ['40 / 22', '12.57', '20.1', '31.4', '21.9', '1.43'] },
        { cells: ['50 / 28', '19.63', '31.4', '49.1', '33.7', '1.46'] },
        { cells: ['63 / 36', '31.17', '49.9', '77.9', '52.5', '1.48'] },
        { cells: ['80 / 45', '50.27', '80.4', '125.7', '85.9', '1.46'] },
        { cells: ['100 / 56', '78.54', '125.7', '196.3', '134.8', '1.46'], highlight: true },
        { cells: ['125 / 70', '122.72', '196.3', '306.8', '210.6', '1.46'] },
        { cells: ['160 / 90', '201.06', '321.7', '502.7', '343.6', '1.46'] },
        { cells: ['200 / 110', '314.16', '502.7', '785.4', '547.8', '1.43'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Speed is flow divided by area.', anchor: 'speed' },
    {
      type: 'prose',
      html: '<p>Pressure sets force; flow sets speed. The piston moves exactly as fast as the oil arriving behind it can fill the space it leaves:</p><ul><li><strong>Imperial:</strong> speed (in/min) = flow (gpm) × 231 ÷ area (in²). Divide by 60 for in/s.</li><li><strong>Metric:</strong> speed (m/min) = flow (L/min) × 10 ÷ area (cm²). For mm/s, multiply by 1,000 and divide by 60.</li></ul><p>A 3" bore fed 10 gpm extends at 10 × 231 ÷ 7.069 = 327 in/min, or 5.4 in/s. A 24" stroke therefore takes about 4.4 seconds. On the return stroke the same 10 gpm fills only the 5.301 in² annulus, so the rod comes back at 7.3 in/s and the stroke takes 3.3 seconds.</p><p>Metric: a 100 mm bore, 56 mm rod cylinder fed 40 L/min extends at 85 mm/s and retracts at 124 mm/s.</p><h3>The return flow is bigger than the supply</h3><p>On the retract stroke, the cap end empties a larger volume than the rod end receives. The oil leaving the cap end is the supply flow multiplied by the area ratio: 10 gpm in, 13.3 gpm out on the 3" × 1.5" cylinder; on a 2" × 1.25" cylinder, 16.4 gpm out. That figure — not the pump flow — is what the return line, the directional valve’s tank path and the return filter have to pass. An undersized return filter on a large-rod cylinder goes into bypass on every retract stroke, and nobody notices until the pump starts to wear.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Extend speed per 1 gpm of flow, by bore (multiply by the pump’s flow)',
      columns: ['Bore', 'Extend, in/s per gpm', 'At 10 gpm, in/s', 'At 20 gpm, in/s'],
      rows: [
        { cells: ['1.5"', '2.18', '21.8', '43.6'] },
        { cells: ['2"', '1.23', '12.3', '24.5'] },
        { cells: ['2.5"', '0.78', '7.8', '15.7'] },
        { cells: ['3"', '0.54', '5.4', '10.9'], highlight: true },
        { cells: ['3.5"', '0.40', '4.0', '8.0'] },
        { cells: ['4"', '0.31', '3.1', '6.1'] },
        { cells: ['5"', '0.20', '2.0', '3.9'] },
        { cells: ['6"', '0.14', '1.4', '2.7'] },
        { cells: ['8"', '0.08', '0.8', '1.5'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Speed is limited by the cylinder too.',
      body: 'Makers cap stroke speed, and the port is usually what sets the cap. Rexroth, for example, limits its CDH1 mill-type cylinders so that oil velocity in the port stays at about 5 m/s — which works out at only 0.20 m/s of piston speed for a 100 mm bore on a G1 port. Seal friction heating and cushion capacity also rise with speed. If the arithmetic gives a speed above the maker’s figure, the pump is too big for the bore, or the ports need to go up a size.',
    },

    { type: 'section_head', number: '/04', title: 'Choosing the bore: a worked example.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<p><strong>The job:</strong> lift a 12,000 lb load vertically, 24" of travel, on a machine with a 3,000 psi relief valve and an 11 gpm gear pump.</p><ol><li><strong>Find the pressure that reaches the cylinder.</strong> The relief valve setting is a ceiling, not a working pressure. Between the pump and the cap port sit a directional valve, hoses, fittings and perhaps a flow control, each costing pressure. On a typical mobile circuit we would plan on 2,500 psi at the port, not 3,000.</li><li><strong>Add margin over the load.</strong> Seal friction, acceleration, a load that is not quite where the drawing says and pressure loss that grows as the oil warms all eat into the force. 20–25% over the static load is a sensible floor: 12,000 × 1.25 = 15,000 lbf.</li><li><strong>Solve for the area.</strong> 15,000 ÷ 2,500 = 6.0 in². The bore with at least that area is 3" (7.069 in²), which pushes 17,671 lbf at 2,500 psi. A 2.5" bore (4.909 in²) would lift 12,272 lbf at 2,500 psi — technically more than the load, but with 2% margin, which is no margin.</li><li><strong>Check the speed.</strong> 11 gpm into 7.069 in² is 6.0 in/s; 24" takes 4 seconds up. Retract with a 1.5" rod: 8.0 in/s.</li><li><strong>Check the rod.</strong> A 24" stroke with a 1.5" rod is nowhere near its buckling limit (section 6). If the stroke were 60", it would be.</li></ol><p>Metric version: 80 kN of load with 25% margin is 100 kN; at 160 bar at the port that needs 62.5 cm², so a 100 mm bore (78.5 cm²) rather than an 80 mm (50.3 cm²).</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Bore selection, step by step',
      intro: 'Work through in order. Each step can change the answer of the one before.',
      branches: [
        { condition: 'Is the working stroke a push or a pull?', outcome: 'Push: size from the full bore area. Pull: size from the annulus (bore area minus rod area).' },
        { condition: 'What pressure reaches the cylinder port?', outcome: 'Use the port pressure, not the relief setting. Allow for valve, hose and fitting losses — often 300–500 psi on a mobile circuit.' },
        { condition: 'Required area = (load × 1.25) ÷ port pressure', outcome: 'Pick the next standard bore up. If two bores are close, the larger buys margin and the smaller buys speed.' },
        { condition: 'Is the speed acceptable at the pump’s flow?', outcome: 'Speed = flow × 231 ÷ area (in/min). Too slow: more flow, or a regenerative circuit for the light part of the stroke.' },
        { condition: 'Is the stroke long, or the cylinder pivot-mounted at both ends?', outcome: 'Check rod buckling against the effective length. Long, slender, pin-to-pin cylinders are buckling-limited, not pressure-limited.' },
        { condition: 'Can the rod end ever be blocked while the cap end is pressurised?', outcome: 'Check the intensified rod-end pressure against the cylinder rating (section 7).' },
      ],
    },

    { type: 'section_head', number: '/05', title: 'Regenerative circuits: speed for free, force at a price.', anchor: 'regen' },
    {
      type: 'prose',
      html: '<p>In a regenerative circuit, the oil leaving the rod end on the extend stroke is routed back into the cap end instead of to tank. Both sides are then at the same pressure, and the net force is that pressure acting on the rod area alone. The cylinder behaves like a ram with the diameter of its rod.</p><ul><li><strong>Speed</strong> = pump flow ÷ rod area. A 3" × 1.5" cylinder on 10 gpm extends at 21.8 in/s in regeneration, against 5.4 in/s normally — four times faster.</li><li><strong>Force</strong> = pressure × rod area. The same cylinder at 2,500 psi pushes 4,418 lbf instead of 17,671.</li></ul><p>It is the right tool for a long approach stroke at low load — a press closing on a part, a ram running out to meet its work — usually switched out of regeneration by a pressure signal when the load arrives. It is the wrong tool for anything that needs force through the whole stroke. A cylinder with a rod exactly half the bore area (area ratio 2:1) extends and retracts at the same speed in regeneration, which is why some presses use 2:1 cylinders.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Long strokes: the rod buckles before the seals give up.', anchor: 'buckling' },
    {
      type: 'prose',
      html: '<p>A cylinder pushing a load is a column, and a slender column fails by bowing sideways long before the steel is crushed. The classic model is Euler’s: the critical load is proportional to the rod’s stiffness (its diameter to the fourth power) and inversely proportional to the square of its effective length.</p><p>That has two consequences that surprise people:</p><ul><li><strong>Length is punished twice.</strong> Double the effective length and the buckling load falls to a quarter. A 1.5" steel rod pinned at both ends over an effective length of 40" has a theoretical Euler load of about 46,000 lbf; at 80" it is about 11,500 lbf — before any safety factor.</li><li><strong>Rod size is rewarded four times.</strong> Going from a 1.5" to a 2" rod raises the buckling load by (2 ÷ 1.5)⁴ = 3.2 times, for a modest increase in weight.</li></ul><p>You can see this in our own listings. The 3" Chief welded cross-tube cylinder is published with a column load of 21,200 lbs at short strokes — the full 3,000 psi push — falling to 3,210 lbs at a 60" stroke. Same bore, same rod, same pressure rating: the long one is limited by buckling, not by hydraulics. When a catalogue gives a column load, it is the number to use, not the push force.</p><h3>Effective length depends on the mount</h3><p>The length that buckles is not the stroke. It is the distance between the points that restrain the cylinder, adjusted for how they restrain it. A cylinder pinned at both ends (clevis to clevis, cross tube to cross tube) buckles over roughly its whole extended length. A cylinder rigidly mounted at the cap and guided at the rod end is far stiffer. Manufacturers publish a <em>stroke factor</em> for each mounting and rod-end condition — multiply the stroke by it to get the “basic length” used in their buckling charts. Pivot-to-pivot mounts carry the highest factors, which is exactly why long agricultural and loader cylinders run oversize rods.</p><h3>Stop tubes</h3><p>On long-stroke cylinders, makers fit a stop tube — a spacer on the rod behind the piston — so that at full extension the piston and gland are further apart. That spreads the bearing support and reduces the side load on both, which is what wears out a long cylinder that is otherwise correctly sized. The rule of thumb in trade guidance is that stop tubes are recommended above about 40" of stroke, with one inch of stop tube for every ten inches of stroke beyond 40": an 80" stroke gets a 4" stop tube, and the cylinder’s gross stroke becomes 84". Makers’ configurators work the same way — gross stroke equals working stroke plus stop tube. A stop tube reduces bearing wear and jack-knifing; it does not stop a rod that is too thin from bending, which only a larger rod does. Confirm against the maker’s chart for the mount you are using.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Theoretical Euler buckling load, steel rod pinned at both ends (no safety factor), lbf',
      columns: ['Rod diameter', '40" effective length', '60"', '80"', '100"'],
      rows: [
        { cells: ['1"', '9,084', '4,037', '2,271', '1,453'] },
        { cells: ['1.25"', '22,177', '9,857', '5,544', '3,548'] },
        { cells: ['1.5"', '45,987', '20,439', '11,497', '7,358'], highlight: true },
        { cells: ['1.75"', '85,197', '37,865', '21,299', '13,631'] },
        { cells: ['2"', '145,342', '64,596', '36,335', '23,255'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'These are failure loads, not working loads.',
      body: 'The table is the ideal Euler load for a perfectly straight, perfectly aligned rod. Real cylinders have clearance in the gland, slightly misaligned pins and a load that is never exactly on the axis, so manufacturers apply a substantial safety factor before publishing a column rating. Codes differ on how big that factor should be — one offshore approach requires the Euler load to be at least four times the working load — and below a slenderness ratio of about 100 (four times the effective length divided by the rod diameter) Euler overestimates the strength and the steel’s yield strength governs. Use the maker’s column load or buckling chart for a purchase decision; use this table only to see how quickly length erodes capacity.',
    },

    { type: 'section_head', number: '/07', title: 'Rod-end intensification: the pressure you did not set.', anchor: 'intensification' },
    {
      type: 'prose',
      html: '<p>Pascal’s law works in both directions. If the cap end is pressurised and the oil in the rod end cannot escape, the piston is held in equilibrium by the trapped oil — and because the annulus is smaller than the bore, the trapped oil must be at a <em>higher</em> pressure to balance it. The rod-end pressure is the cap-end pressure multiplied by the area ratio.</p><ul><li>3" × 1.5" cylinder, 3,000 psi on the cap: <strong>4,000 psi</strong> in the rod end.</li><li>2" × 1.25": <strong>4,923 psi</strong>.</li><li>2" × 1.5" (a heavy rod for its bore): <strong>6,857 psi</strong>.</li><li>Any cylinder with a 2:1 area ratio: <strong>6,000 psi</strong> — double the supply.</li></ul><p>Telescopic cylinders are worse: Parker warns that a blockage on the retract side of a double-acting telescopic can intensify pressure ten times or more, so 2,000 psi from the pump could trap 20,000 psi. Power &amp; Motion has documented a gland blown out of a 2,500 psi cylinder for exactly this reason — on a cold morning, oil below its pour point had blocked the rod-side return.</p><p>This happens in ordinary circuits. A meter-out flow control that is closed down too far, a pilot-operated check that fails to open, a counterbalance valve set wrongly, a quick coupler on the return line that is not fully engaged — any of them can block the rod end while the pump pushes on the cap. The relief valve protects the pump side; nothing protects the rod side except the cylinder’s own rating. Rod seals extruding, gland retaining rings failing and rod-end hoses bursting on a circuit that “never sees more than 3,000 psi” are the usual evidence.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A disconnected coupler can do this too.',
      body: 'On tractors and implements, a return-line quick coupler that is not fully engaged blocks the rod end. Operating the valve then intensifies rod-end pressure by the area ratio, which can rupture the hose or the coupler body. Make sure both couplers are fully connected before moving the lever, and never use a cylinder bypass test (see the drift article) on a cylinder you cannot see the gauge reading for.',
    },

    { type: 'section_head', number: '/08', title: 'Before you order.', anchor: 'checklist' },
    {
      type: 'prose',
      html: '<ol><li><strong>Bore, rod and stroke</strong> — measure the barrel’s outside diameter and subtract twice the wall if you cannot see the bore; measure the rod with a caliper; measure stroke as the difference between closed and extended pin centres.</li><li><strong>Retracted (closed) length</strong>, pin centre to pin centre. A replacement with the right stroke but a longer closed length will not fit back between the pins.</li><li><strong>Mount at each end</strong> — clevis, cross tube, tang, pin eye, swivel eye — with pin diameter and, for a clevis, the gap width. See <a href="/blog/hydraulic-cylinder-mounting-styles">hydraulic cylinder mounting styles</a>.</li><li><strong>Ports</strong> — SAE O-ring boss (ORB) size, NPT or BSPP, and their orientation.</li><li><strong>Working pressure</strong> at the cylinder, and whether the rod end can ever be blocked.</li><li><strong>Duty</strong> — cycles per hour, side load, temperature, and whether the rod is exposed to grit or salt spray.</li></ol>',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 3320',
      publisher: 'ISO',
      title: 'Fluid power systems and components — Cylinder bores and piston rod diameters and area ratios — Metric series',
      summary:
        'Defines the preferred metric bore and rod diameters (32, 40, 50, 63, 80, 100, 125, 160, 200 mm bores and the rods that go with them) and the area ratios they produce. It is why metric cylinders from different makers share bore and rod sizes, and why the metric table above uses those pairs.',
      url: 'https://www.iso.org/standard/71262.html',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I calculate hydraulic cylinder force?', answer: 'Multiply the pressure by the area the oil acts on. Push: pressure × π × bore² ÷ 4. Pull: pressure × (bore area − rod area). In imperial units that gives pounds-force from psi and square inches; in metric, bar × cm² ÷ 100 gives kN.' },
        { question: 'Why does my cylinder pull weaker than it pushes?', answer: 'Because on the retract stroke the oil acts only on the annulus around the rod, which is smaller than the full bore. A 3" bore with a 1.5" rod pulls 75% of what it pushes.' },
        { question: 'Why does my cylinder retract faster than it extends?', answer: 'The same flow fills a smaller volume on the rod side, so the piston moves faster — by the area ratio. On a 3" × 1.5" cylinder it is a third faster.' },
        { question: 'Should I size the cylinder for the relief valve pressure?', answer: 'No. Size it for the pressure that reaches the port after valve, hose and fitting losses, and leave 20–25% margin over the load. The relief valve is a ceiling for protection, not the working pressure.' },
        { question: 'How long a stroke can a cylinder have?', answer: 'Until the rod buckles under the load. Buckling load falls with the square of the effective length, so long pin-to-pin cylinders need oversize rods and often a stop tube. Use the maker’s column load, which already includes a safety factor.' },
        { question: 'What is pressure intensification in a cylinder?', answer: 'If the rod end is blocked while the cap end is pressurised, the rod-end pressure rises to the cap pressure multiplied by the area ratio — 4,000 psi from 3,000 psi on a 3" × 1.5" cylinder. It bursts rod seals and rod-end hoses.' },
        { question: 'What is a regenerative cylinder circuit?', answer: 'A circuit that routes rod-end oil back into the cap end on the extend stroke. The cylinder extends at flow ÷ rod area — much faster — but pushes with only pressure × rod area.' },
        { question: 'How much oil comes back out of the cylinder?', answer: 'On retract, the cap end returns the supply flow multiplied by the area ratio — 13.3 gpm for 10 gpm in on a 3" × 1.5" cylinder. Size the return line and filter for that, not for pump flow.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Cylinders by bore',
      skus: ['IH-CHF-CT-3', 'IH-MAX-CL-3', 'IH-CHF-TR-3', 'IH-MAG-WCTN-CT-4', 'IH-BLY-CT-25', 'IH-CYL-100-70-500'],
      note: 'Each listing gives bore, rod, stroke range and the column load for the stroke you pick.',
    },
    {
      type: 'category_link',
      slug: 'welded-hydraulic-cylinders',
      label: 'Welded hydraulic cylinders',
      blurb: 'Clevis, cross tube, tang, pin eye and swivel eye, 1" to 8" bore.',
    },
    {
      type: 'category_link',
      slug: 'tie-rod-cylinders',
      label: 'Tie-rod hydraulic cylinders',
      blurb: 'NFPA-pattern tie-rod cylinders, 2" to 5" bore, and ISO 6020-2 metric.',
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'hydraulic-cylinder-mounting-styles', 'welded-vs-tie-rod-hydraulic-cylinders', 'how-to-size-a-hydraulic-pump', 'hydraulic-cylinder-drift-diagnosis'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'All forces, speeds and Euler loads computed from first principles (E = 30 × 10⁶ psi for steel) and checked against the column loads on our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Sizing a cylinder for a job?',
      body: 'Send the load, the stroke, the pressure your circuit delivers and how the cylinder is mounted. We will check force, speed and buckling and quote a cylinder that fits between your pins.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
