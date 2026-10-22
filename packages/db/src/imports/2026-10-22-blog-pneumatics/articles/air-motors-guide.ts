import { stockList } from '../products'
import type { BlogArticleSeed } from '../shared'

/**
 * Air motors. Ingersoll Rand Air Motors catalogue (multi-vane, spur gear, Series Select lube free, piston; pp. 2–8,
 * 86–92): advantages (variable speed/torque by regulation, instant start/stop/reverse, will not overheat or burn out
 * when overloaded or stalled, no electrical sparks, cool running in hot/wet/dusty surroundings, 150 °F standard /
 * 300 °F high-temperature lubrication); range 0.10–30 hp, 23–26,000 rpm; vane vs radial piston descriptions;
 * non-reversible rated slightly higher than reversible; ratings at 90 psig, inconsistent below 40 psig, more
 * maintenance above 100 psig; size on ~70% of lowest available pressure; max power at ~50% of free speed ungoverned,
 * ~80% governed (22 and 55 Series only); select on operating speed not free speed; do not run ungoverned motors
 * unloaded; starting torque ~75% of stall; torque = hp × 5,250 / rpm and kW × 9,550 / rpm; Fig. 1–3 curve behaviour
 * (torque max at zero speed, speed falls as load rises; pressure lowers speed, torque and power; gearing steepens
 * the torque curve and keeps power); pressure table at 40–100 psig; pressure at the motor, exhaust restriction;
 * reversible models need a 4-way (3-position, spring-centred recommended) or two 3-way valves to keep the secondary
 * exhaust open; lubrication "a must"; lubricator between Liquidator filter and motor; Series Select motors are a
 * lube-free four-vane design. Gast AM Series Air Motors O&M manual 45-200 D170 Rev. S: pressure limits 100 psi/7 bar
 * lubricated, 80 psi/5.5 bar LL and NLP (1UP lower); LL/NLP run with or without lubrication; ambient limits
 * (non-hazardous to 121 °C, hazardous 1–40 °C, cooling air ≤40 °C); motors carrying the Ex symbol meet Directive
 * 2014/34/EU for zones 1 and 2, label check, driven equipment must also be ATEX-approved, belts <10^9 Ω, ground the
 * motor; 5-micron filter, moisture trap, regulator for speed and torque; lubricator ≤18 in (0.5 m), level or above;
 * 1 drop per 50 CFM (later 50–75 CFM, 1.5–2 m³/min) or 1 drop per minute; gear reducer needs no lubrication; manual
 * lubrication 10–20 drops every 8 h; line sizes; 4-way valve to reverse; starting torque less than running torque and
 * varies with vane position; do not run at high speed unloaded; surface temperature ≤135 °C; moisture → rust or ice
 * in the muffler; non-lubricated muffler checks every 90 days. Chicago Pneumatic Air Motors Technical Guide: vane,
 * piston and turbine are the most common types; vane motors to ~5 kW; stall indefinitely; no sparks, salt-laden and
 * corrosive atmospheres; stall torque ≈ 2 × torque at max power; reversible motors have greater starting-torque
 * variation; air consumption rises with speed, highest at free speed, some even at stall; inlet vs exhaust throttling;
 * pressure regulation for stall-torque control; gearbox keeps power, trades speed for torque; planetary = compact,
 * high torque for size; helical = pinion and wheel, multi-step for high ratios; lube-free vanes of low-friction
 * material, lubricated vanes typically 2,000 h vs lube-free 1,000 h in mixed duty; dry running costs 5–15% max output
 * and 10–30% free speed; 50 mm³ oil per m³ air, 1 drop ≈ 15 mm³; dew point ≤ +10 °C, refrigerated dryer; filter
 * 15 µm and >90% water; long life → larger motor run restricted or at lower pressure.
 * Left out as unsourced: any performance data for gear-type air motors (no maker data read), noise levels,
 * efficiency comparisons with electric motors, and any ATEX status for the listed ranges (none of the titles says so).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'air-motors-guide',
  title: 'Air motors: vane or piston, how the torque curve behaves, and how to size one at your pressure',
  excerpt:
    'An air motor stalls without damage, reverses on a valve and makes no electrical sparks, but its speed falls as the load rises and its output drops with every bar of pressure you lose. How vane and piston motors differ, what the curves mean, air consumption, lubricated vs lube-free, planetary vs spur gearing, and a sizing method using Ingersoll Rand, Gast and Chicago Pneumatic data.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Air Motors Guide: Vane vs Piston, Torque Curves, Sizing',
  seoDescription:
    'Air motors explained: vane vs piston, stall torque and power curves, air use, reversing, lubrication, planetary vs spur gears, and sizing at your pressure.',
  focusKeyword: 'air motor sizing',
  publishedAt: '2026-10-22T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Air motor torque is highest at stall and zero at free speed; as load rises, speed falls until it stalls, without damage (Ingersoll Rand, Chicago Pneumatic).',
        'Ingersoll Rand: an ungoverned air motor gives its maximum power at about 50% of free speed. Select on the operating speed, not the free speed.',
        'Ratings are at 90 psig (Ingersoll Rand) or 6.3 bar (Chicago Pneumatic). At 60 psig Ingersoll Rand gives 58% of rated power and 67% of stall torque; size on about 70% of the lowest available pressure.',
        'Lube-free vane motors run on dry air but give up some output and vane life. Gast limits its LL and NLP lube-free models to 80 psi against 100 psi for lubricated models.',
        'No electrical sparks makes air motors a natural fit for hazardous areas, but ATEX use needs a motor marked for it. Gast restricts hazardous-area use to 40 °C ambient.',
      ],
    },
    {
      type: 'lead',
      html: 'An air motor suits a drive that must stall against a load and wait, work where sparks are not welcome, or have its speed and torque set by a regulator. Ingersoll Rand warns that its curves do not match an electric motor’s, so it cannot be sized like one. This guide covers the curves, the pressure effect, and the choice of motor type, lubrication and gearing, using Ingersoll Rand, Gast and Chicago Pneumatic data.',
    },

    { type: 'section_head', number: '/01', title: 'Vane, piston and gear motors.', anchor: 'types' },
    {
      type: 'prose',
      html: '<p><strong>Vane motors</strong> are the common type. A slotted rotor turns off-centre in a cylinder, and sliding vanes divide the space into chambers that expand as air drives the rotor. Ingersoll Rand calls them smaller, lighter and cheaper than piston motors of similar power, able to run in almost any position, and the most widely used type. Chicago Pneumatic builds vane motors up to about 5 kW. Every motor on our shelf is a vane motor.</p><p><strong>Radial piston motors</strong> drive the shaft from several pistons. Ingersoll Rand says they run slower than vane motors, have excellent starting and speed control, and are especially good for “lugging” heavy loads at slow speed. They mount horizontally as standard.</p><p><strong>Gear motors</strong> are a third design, in which air drives a pair of meshing gears. Chicago Pneumatic names vane, piston and turbine as the most common types, and Ingersoll Rand’s catalogue covers vane and piston only. We have no maker data for gear motors and list none, so we make no claims for them.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Vane vs piston air motors (Ingersoll Rand and Chicago Pneumatic descriptions)',
      columns: ['Property', 'Vane motor', 'Radial piston motor'],
      rows: [
        { cells: ['Size and cost for the power', 'Smaller, lighter, less expensive', 'Larger and heavier for the same power'], highlight: true },
        { cells: ['Speed', 'Broad range; high free speeds, usually geared down', 'Lower speeds'] },
        { cells: ['Starting', 'Starting torque varies with vane position; Ingersoll Rand gives about 75% of stall', 'Excellent starting and speed control'] },
        { cells: ['Best at', 'General drives, compact machines, most applications', 'Heavy loads at slow speed'] },
        { cells: ['Mounting', 'Almost any position', 'Horizontal as standard'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Reading the curves.', anchor: 'curves' },
    {
      type: 'prose',
      html: '<p>An air motor at constant inlet pressure has a nearly straight-line torque–speed characteristic. Ingersoll Rand: torque is maximum at zero speed and zero at free speed. As load rises, speed falls and torque rises until the motor stalls; if load eases, speed rises until torque matches it. The motor finds its own working point, which helps in tensioning and fastening and hurts where speed must stay constant.</p><ul><li><strong>Stall torque</strong> is the torque at the moment the motor is braked to a stop. Chicago Pneumatic estimates it as about twice the torque at maximum power.</li><li><strong>Starting torque</strong> is lower and less certain, because it depends on where the vanes stopped relative to the inlet port. Ingersoll Rand puts it at about 75% of stall torque. Gast says starting torque is less than running torque. Chicago Pneumatic adds that reversible motors vary more. If the load must break away from rest, size on starting torque.</li><li><strong>Power</strong> peaks between stall and free speed. Ingersoll Rand gives maximum power at about <strong>50% of free speed</strong> for ungoverned motors and about 80% for governed ones; the only governed models in its catalogue are the 22 and 55 Series.</li><li><strong>Free speed</strong> is speed with no load. Ingersoll Rand says ungoverned motors should not be run unloaded, and Gast warns that running at high speed with no load overheats the motor internally. Select on the speed under load.</li></ul><p>Stalling does no harm: Ingersoll Rand says its motors will not overheat or burn out when overloaded or stalled, and Chicago Pneumatic that they can be stalled indefinitely.</p><h3>Pressure changes everything</h3><p>Ingersoll Rand rates its motors at 90 psig (620 kPa) and Chicago Pneumatic at 6.3 bar. Ingersoll Rand says its motors will run below 40 psig but not consistently, and can run above 100 psig at the cost of more maintenance. Its correction table shows how fast output falls:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Ingersoll Rand ungoverned air motors: performance as a percentage of the 90 psig rating',
      columns: ['Air pressure', 'Free speed', 'Max power', 'Speed at max power', 'Torque at max power', 'Air use at max power', 'Stall / starting torque'],
      rows: [
        { cells: ['40 psig (2.8 bar)', '80%', '30%', '80%', '37.5%', '45%', '45%'] },
        { cells: ['50 psig (3.4 bar)', '84%', '44%', '84%', '52.4%', '56%', '56%'] },
        { cells: ['60 psig (4.1 bar)', '88%', '58%', '88%', '65.9%', '67%', '67%'], highlight: true },
        { cells: ['70 psig (4.8 bar)', '92%', '72%', '92%', '78.3%', '78%', '78%'] },
        { cells: ['80 psig (5.5 bar)', '96%', '86%', '96%', '89.6%', '89%', '89%'] },
        { cells: ['90 psig (6.2 bar)', '100%', '100%', '100%', '100%', '100%', '100%'] },
        { cells: ['100 psig (6.9 bar)', '104%', '114%', '104%', '109.6%', '111%', '111%'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Lose 30 psi and you lose 42% of the power. Ingersoll Rand’s rule is to <strong>size on about 70% of the lowest available air pressure</strong>, which leaves power for starting and overload. It warns that compressor pressure is not the pressure at a running motor, and that supply and exhaust restrictions often cause poor performance. Gast asks for supply lines the same size as the motor inlet for runs under 2 m (7 ft) and one size larger beyond that.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Air consumption and speed control.', anchor: 'air-consumption' },
    {
      type: 'prose',
      html: '<p>Chicago Pneumatic states that air consumption rises with speed and is highest at free speed. Even at stall it uses some air through internal leakage. Consumption is quoted as free air (scfm, or l/s); read it from the curve at your working speed. Gast says to choose the air supply, valve and regulator from the motor’s air consumption, not its port size.</p><p>There are two ways to turn the output down:</p><ul><li><strong>Throttling</strong> (flow control) affects speed more than torque. Chicago Pneumatic notes that a throttle in the inlet reduces air consumption, while a throttle in the exhaust keeps a slightly higher starting torque.</li><li><strong>Pressure regulation</strong> is always in the inlet. Chicago Pneumatic recommends it where you need to control stall torque and high starting torque matters less. Gast fits a regulator ahead of every motor.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Reversing and lubrication.', anchor: 'reversing-lubrication' },
    {
      type: 'prose',
      html: '<h3>Reversing</h3><p>A reversible motor has two rotation ports. Whichever port is not being pressurised becomes a secondary exhaust and must be open to atmosphere. Ingersoll Rand specifies a four-way valve, or two three-way valves, so that port is never blocked, and recommends a three-position, spring-centred four-way valve with a muffler on each valve exhaust. Gast also uses a four-way valve piped to both ports. Ingersoll Rand rates its non-reversible motors at slightly higher speed, torque and power than the reversible motors of the same family.</p><h3>Lubricated or lube-free</h3><p>A traditional vane motor is lubricated by oil mist in the supply air. Ingersoll Rand calls proper lubrication a must, to prevent vane wear and rust. Gast’s instructions are specific:</p><ul><li>Fit an automatic line lubricator no more than 18 in (0.5 m) from the motor, level with or above it.</li><li>Set it to one drop of oil for every 50–75 CFM (1.5–2 m³/min) of air, or one drop per minute for high-speed or continuous duty. Do not overfeed, or the exhaust air carries oil.</li><li>With manual lubrication, add 10–20 drops at the inlet every 8 hours.</li></ul><p>Chicago Pneumatic gives 50 mm³ of oil per cubic metre of air, one drop being about 15 mm³.</p><p><strong>Lube-free</strong> motors use vanes of a low-friction material and permanently lubricated bearings. Ingersoll Rand’s Series Select motors are a lube-free four-vane design. Gast’s LL and NLP models run with or without oil, though Gast still recommends lubrication for best service life, and limits them to 80 psi / 5.5 bar against 100 psi / 7 bar for lubricated models. Chicago Pneumatic puts numbers on the trade-off: running dry costs 5–15% of maximum output and 10–30% of free speed, and in mixed duty its lubricated vanes last about 2,000 hours against 1,000 for lube-free. Choose lube-free where oil in the exhaust is unacceptable, lubricated where vane life comes first.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Wet air shortens motor life.',
      body: 'Gast warns that excessive moisture in the line can cause rust, or ice in the muffler as the air expands through the motor. It asks for a moisture separator and 5-micron filter ahead of the motor. Chicago Pneumatic recommends a pressure dew point of +10 °C or lower and a refrigerated dryer. On a humid site, treat these as the minimum.',
    },

    { type: 'section_head', number: '/05', title: 'Hazardous, hot and wet locations.', anchor: 'hazardous' },
    {
      type: 'prose',
      html: '<p>Ingersoll Rand lists safe operation in hazardous conditions, with no electrical sparks, among the reasons to choose an air motor, and says cool running reduces the effect of hot, wet or dusty surroundings. Chicago Pneumatic adds that their construction suits salt-laden and corrosive atmospheres.</p><p>“No electrical sparks” is not the same as an approval for a classified area. Gast says its motors carrying the explosion-protection symbol meet Directive 2014/34/EU (ATEX) for zones 1 and 2. Before installing one in a hazardous area, Gast asks you to:</p><ul><li>check the label for the zone, category, equipment group, temperature class and maximum surface temperature;</li><li>confirm that the driven equipment is also ATEX-approved;</li><li>use belts with electrical leakage resistance below 10⁹ Ω and ground the motor.</li></ul><p>Gast limits hazardous-area operation to an ambient of 1–40 °C, with cooling air no hotter than 40 °C, against up to 121 °C in non-hazardous service. An outdoor installation in Gulf summer heat can exceed that, so a hazardous-area air motor may need shade or ventilation. Ingersoll Rand rates its motors to 150 °F (66 °C) with standard lubrication.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the marking, not the principle.',
      body: 'None of the air motor ranges we list carries an ATEX claim in its title. For a classified zone, tell us the zone, gas or dust group and temperature class, and we will quote a model the maker marks for it. No electrics does not mean approved.',
    },

    { type: 'section_head', number: '/06', title: 'Gearing and sizing.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<h3>Planetary or spur gear</h3><p>Vane motors run fast, so most are geared down. A gearbox keeps the power and trades speed for torque (Chicago Pneumatic); it also steepens the curve, so a heavily geared motor holds its speed better under load (Ingersoll Rand).</p><ul><li><strong>Planetary gears</strong>, in Chicago Pneumatic’s description, are used when small size matters, because they carry high torque for their size. A sun wheel drives planet wheels inside a ring gear, and the planet carrier is the output shaft, on the motor’s own axis. Ingersoll Rand’s M002, M004, M007, 0-Series, 2200 and 3800 ranges on our shelf are this type.</li><li><strong>Spur and helical gears</strong> are the basic parallel-shaft type: a pinion driving a larger wheel, so the output shaft is offset from the motor shaft. Chicago Pneumatic notes that high ratios would need a very large wheel, so they are built in several stages. Ingersoll Rand’s 92 Series and its spur-gear multi-vane ranges are this type.</li></ul><h3>A sizing method</h3><ol><li><strong>Define the working point:</strong> the speed the load must turn at and the torque it needs at that speed. Note the breakaway torque from rest separately.</li><li><strong>Calculate power:</strong> torque (N·m) = kW × 9,550 ÷ rpm, or torque (lb-ft) = hp × 5,250 ÷ rpm.</li><li><strong>Correct for pressure:</strong> take about 70% of the lowest pressure available at the motor and scale the catalogue figures with the table above.</li><li><strong>Choose a motor</strong> whose maximum-power speed is near your working speed, and whose starting torque at your pressure exceeds the breakaway torque.</li><li><strong>Check</strong> air consumption against your supply, and shaft radial load if a pulley or pinion is fitted.</li></ol><p><strong>Worked example (our arithmetic, Ingersoll Rand factors).</strong> A drive needs 20 N·m (about 14.8 lb-ft) at 150 rpm, which is 20 × 150 ÷ 9,550 ≈ 0.31 kW (about 0.42 hp). The plant holds 85 psig at the motor, and 70% of that is about 60 psig. At 60 psig Ingersoll Rand gives 58% of rated maximum power and 88% of the speed at maximum power. So pick a motor rated at about 0.54 kW or more at 90 psig, with maximum power near 170 rpm, and confirm that its starting torque at 60 psig (67% of the 90 psig figure) clears the breakaway load. For long life, Chicago Pneumatic suggests a larger motor run throttled or at lower pressure.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which air motor?',
      branches: [
        { condition: 'Heavy load at low speed, hard start from rest?', outcome: 'Radial piston motor, or a vane motor with a high gear reduction, sized on starting torque.' },
        { condition: 'Compact drive, in-line shaft, moderate torque?', outcome: 'Vane motor with an in-line planetary gearbox.', sku: 'IH-IRD-M004-SERIES-IN-LINE-PLANETARY-GEAR-MULTI-VANE-AIR' },
        { condition: 'Output shaft can be offset from the motor axis?', outcome: 'Spur-gear multi-vane motor.', sku: 'IH-IRD-92-SERIES-SPUR-GEAR-MULTI-VANE-AIR-MOTORS' },
        { condition: 'No oil allowed in the exhaust?', outcome: 'Lube-free model (Gast LL or NLP, Ingersoll Rand Series Select). Accept the lower pressure limit and vane life.' },
        { condition: 'Classified hazardous zone?', outcome: 'A model marked by the maker for the zone and temperature class. Check the ambient limit.' },
      ],
    },

    { type: 'section_head', number: '/07', title: 'What we list.', anchor: 'stock' },
    {
      type: 'prose',
      html: `<p>Our air motor shelf carries Ingersoll Rand multi-vane motors with in-line planetary or spur gearing, an Ingersoll Rand aluminium and steel rotary vane gearmotor, and Gast’s 2AM, 4AM, 6AM and 8AM vane motors. Every range is listed by maker part number:</p>${stockList(['air-motors'])}`,
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do you size an air motor?', answer: 'Work out the torque and speed the load needs, then the power. Correct the catalogue figures to about 70% of your lowest available air pressure, as Ingersoll Rand advises. Choose a motor whose maximum-power speed is near your working speed and whose starting torque clears the breakaway load.' },
        { question: 'Can an air motor be stalled?', answer: 'Yes. Ingersoll Rand says its air motors will not overheat or burn out even when overloaded or run to stall. Chicago Pneumatic says they can be stalled indefinitely and started and stopped without limit.' },
        { question: 'How do you reverse an air motor?', answer: 'Use a reversible motor and a four-way valve piped to both ports, or two three-way valves, so the port not being pressurised can exhaust. Ingersoll Rand recommends a three-position, spring-centred four-way valve with mufflers on the valve exhausts.' },
        { question: 'Do air motors need lubrication?', answer: 'Lubricated vane motors do. Gast sets one drop of oil per 50–75 CFM of air from a lubricator within 0.5 m of the motor. Lube-free models run on dry air but lose some output and vane life, and Gast limits them to 80 psi.' },
        { question: 'Are air motors explosion-proof?', answer: 'They make no electrical sparks, which suits hazardous areas, but use in a classified zone needs a motor marked for it, such as Gast models carrying the 2014/34/EU symbol for zones 1 and 2. Check the label, the ambient limit and that the driven equipment is approved too.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Air motors',
      skus: [
        'IH-IRD-M004-SERIES-IN-LINE-PLANETARY-GEAR-MULTI-VANE-AIR',
        'IH-IRD-M007-SERIES-IN-LINE-PLANETARY-GEAR-MULTI-VANE-AIR',
        'IH-IRD-2200-SERIES-IN-LINE-PLANETARY-GEAR-MULTI-VANE-AIR',
        'IH-IRD-92-SERIES-SPUR-GEAR-MULTI-VANE-AIR-MOTORS',
        'IH-GST-2AM-SERIES-AIR-MOTORS',
        'IH-GST-4AM-SERIES-ROTARY-VANE-AIR-MOTORS',
        'IH-GST-6AM-SERIES-AIR-MOTORS',
        'IH-GST-8AM-SERIES-AIR-MOTORS',
      ],
    },
    { type: 'category_link', slug: 'air-motors', label: 'Air motors', blurb: 'Ingersoll Rand multi-vane motors with planetary or spur gearing, and Gast AM vane motors.' },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Air preparation & FRLs', blurb: 'Filters, regulators and lubricators sized for the motor’s air consumption.' },
    {
      type: 'related_articles',
      slugs: [
        'frl-filter-regulator-lubricator-guide',
        'compressed-air-quality-iso-8573-1',
        'sizing-pneumatic-valves-flow-cv',
        'solenoid-valve-functions-3-2-5-2-5-3',
        'push-to-connect-fittings-and-silencers',
        'pneumatic-grippers-and-vacuum-guide',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Curves, pressure factors, reversing and lubrication from the Ingersoll Rand Air Motors catalogue, Gast AM Series manual (45-200 D170 Rev. S) and Chicago Pneumatic Air Motors Technical Guide. Figures quoted per maker.',
    },
    {
      type: 'cta_block',
      heading: 'Sizing an air motor?',
      body: 'Tell us the torque and speed at the shaft, the breakaway load, the lowest air pressure at the motor, whether it must reverse, and the area classification. We will quote the motor and the valve and FRL to run it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
