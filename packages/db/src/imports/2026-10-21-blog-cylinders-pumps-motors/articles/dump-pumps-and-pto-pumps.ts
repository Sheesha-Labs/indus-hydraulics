import type { BlogArticleSeed } from '../shared'

/**
 * Truck hydraulics: PTOs, dump pumps, PTO gear pumps and clutch pumps. PTO speed %, duty derate (5 min in 15 =
 * continuous, 70%), >2,000 rpm = continuous, backlash, bracket rule (≥40 lb), DIN 5462 and SAE outputs, rotation
 * relative to crankshaft and fretting, all from the Muncie QR2021 PTO catalogue; dump pump 2,500 psi and 2-line /
 * 3-line from Muncie and Work Truck; telescopic oil volume example (21.31 gal) from Parker HY18-0008. Our pump
 * ranges from the Permco, Heavy Motions, Cross, DFC and Prince listings. Fill-time and HP example computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'dump-pumps-and-pto-pumps',
  title: 'Dump pumps, PTO pumps and clutch pumps: truck hydraulics from the gearbox to the hoist',
  excerpt:
    'A tipper, crane truck or roll-off runs its hydraulics from the engine through a power take-off. How PTO ratio sets pump speed, how a dump pump with its built-in valve differs from a PTO gear pump, two-line and three-line systems, mounting, rotation and support, clutch pumps, and the duty rules that stop a PTO chewing its own splines.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Dump Pumps & PTO Pumps for Trucks: Sizing, Lines & Mounting',
  seoDescription:
    'Truck hydraulics explained: PTO speed ratio and duty ratings, dump pumps vs PTO gear pumps, 2-line vs 3-line dump systems, SAE and DIN 5462 mounts, rotation, support brackets, clutch pumps and sizing a tipper hoist pump.',
  focusKeyword: 'dump pump',
  publishedAt: '2026-10-21T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pump speed is engine speed × PTO ratio: at 1,800 engine rpm, a 70% PTO turns the pump at 1,260 rpm.',
        'A dump pump is a gear pump with its tipping valve and relief built in; a PTO gear pump is a plain pump that feeds a separate valve for cranes, hooklifts and other functions.',
        'Two-line dump systems return oil through the pump; three-line systems return it straight to the tank, so they lower faster and run cooler. Running a two-line pump in neutral is the commonest dump-pump failure.',
        'PTO makers treat full output for five minutes or more in every fifteen as continuous duty and derate the PTO to 70% for it.',
        'Pumps weighing 40 lb or more with their fittings, hose and oil need a support bracket, and PTO-to-transmission backlash must be set — the two most common installation faults.',
      ],
    },
    {
      type: 'lead',
      html: 'On a truck, the hydraulic pump has no electric motor of its own. It is driven from the engine, through the gearbox, by a power take-off — and that one fact decides the pump’s speed, its rotation, how it is mounted and what kind of duty it can do. This guide follows the drive from the gearbox to the hoist, covering the PTO, the three kinds of pump fitted to trucks, and how to size them.',
    },

    { type: 'section_head', number: '/01', title: 'The PTO sets the pump’s speed and rotation.', anchor: 'pto' },
    {
      type: 'prose',
      html: '<p>A PTO bolts to an opening on the side or back of the truck’s transmission and takes drive from a gear inside it. Its output turns at a fixed percentage of engine speed, set by its internal gearing: a 65% PTO at 1,000 engine rpm turns at 650 rpm, and at 1,800 engine rpm at 1,170 rpm. Catalogues offer ratios from about 40% to 150% on single-speed PTOs, with output speed limited to around 2,500 rpm.</p><p><strong>Pump speed = engine rpm × PTO ratio.</strong> To deliver a target flow, divide the flow by pump speed to get the displacement: a PTO maker’s own example takes a 2,000 rpm engine and a 60% PTO (1,200 rpm) and needs 15 × 231 ÷ 1,200 = 2.89 in³/rev for 15 gpm.</p><h3>Rotation</h3><p>PTO rotation is stated relative to the engine crankshaft — “crank” (same as the crankshaft) or “opposite” — and crankshafts turn clockwise viewed from the front of the engine. Pump rotation is stated viewed from the pump’s shaft end. Get the two the wrong way round and the pump will not prime. A gear adapter can reverse rotation, but it moves the PTO outward about 3" and often reduces its rating.</p><h3>Duty</h3><p>PTOs are rated for intermittent duty. One major PTO maker treats any use at full output for five minutes or more in every fifteen as continuous, derates the PTO to 70% for it, and counts any output speed above 2,000 rpm as continuous regardless. A dump body lifting a few times an hour is intermittent; a hydraulic blower, a pump-off tanker or a mixer drum is continuous.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Three kinds of truck pump.', anchor: 'pumps' },
    {
      type: 'comparison_table',
      caption: 'Truck pumps on our shelf',
      columns: ['Type', 'What it is', 'Typical use', 'On our shelf'],
      rows: [
        { cells: ['Dump pump', 'Gear pump with built-in tipping valve and relief', 'Tippers, dump trailers', 'Permco DM, DMD, DMR, DG, RG (3.08–5.9 in³/rev); Heavy Motions HC and HG (5.1–6.37 in³/rev)'], highlight: true },
        { cells: ['PTO gear pump', 'Plain direct-mount gear pump, separate valve', 'Cranes, hooklifts, roll-offs, multiple functions', 'Cross 50T (4.6–15.6 in³/rev); DFC GP-PTO cast iron (56–160 cc/rev, 2,500 psi); Prince HC-PTO (3.6–9.9 in³/rev)'] },
        { cells: ['Clutch pump', 'Belt-driven from the engine through an electromagnetic clutch', 'Where no PTO opening is available, or for engine-speed independence of the gearbox', 'Permco CP124 (0.93–2.48 in³/rev, 3.6–10 gpm)'] },
      ],
    },
    {
      type: 'prose',
      html: '<h3>Dump pumps</h3><p>A dump pump puts the pump, the raise–hold–lower valve and the relief valve in one body bolted to the PTO. A cable or air control at the cab moves the valve: raise sends flow to the hoist, hold traps it, lower opens the hoist to tank and the body comes down under its own weight — the single-acting “power up, gravity down” arrangement of almost every tipper. Dump pumps are rated for intermittent cycles; one maker’s dump pumps are rated 2,500 psi across the range.</p><h3>PTO gear pumps</h3><p>Where the truck runs more than a tipping body — a crane, a hooklift, a walking floor, outriggers — the pump is a plain gear pump on the PTO and the valves are separate. Cast-iron PTO gear pumps carry higher continuous pressure and take the abuse of truck service better than light aluminium pumps.</p><h3>Clutch pumps</h3><p>A clutch pump is driven by a belt from the engine’s crankshaft pulley through an electromagnetic clutch, which engages when the operator switches on the hydraulics. They suit trucks without a usable PTO opening and smaller duties such as tow trucks and light equipment.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Two-line or three-line?', anchor: 'lines' },
    {
      type: 'prose',
      html: '<p>Dump pumps are plumbed one of two ways:</p><ul><li><strong>Two-line:</strong> a suction line from the tank and a pressure line to the hoist. When the body is lowered, the oil returns back through the pressure line into the pump and out through its inlet to the tank.</li><li><strong>Three-line:</strong> adds a separate return line from the pump’s valve straight to the tank.</li></ul><p>Three-line systems lower faster and run cooler. A two-line system is acceptable only if the pump is not left engaged in neutral for long: with nowhere to go, the oil circulates inside the pump and heats up, and overheating from running in neutral is the most common dump-pump failure. If drivers leave the PTO engaged between tips — and they do — fit three-line.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Sizing the pump for a hoist.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<p>The hoist’s oil volume and the time you want it to take set the flow. Parker’s telescopic manual gives a worked example: a three-stage hoist with 134" of stroke needs about 21.3 US gallons to extend fully (not counting the oil to fill an empty cylinder). With a 6 in³/rev dump pump on a PTO turning at 1,200 rpm, flow is 6 × 1,200 ÷ 231 = 31.2 gpm, so the body rises in about 41 seconds.</p><p>Power at the PTO: 2,500 psi × 31.2 gpm ÷ 1,714 = 45.5 hydraulic HP, about 53 HP at the pump shaft at 85%. That has to be inside the PTO’s intermittent rating at that speed — and if the truck also runs continuous-duty hydraulics on the same PTO, inside its 70% continuous rating. The general method is in <a href="/blog/how-to-size-a-hydraulic-pump">how to size a hydraulic pump</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Tank size follows the hoist.',
      body: 'A large telescopic hoist holds tens of litres when extended. The tank must hold all of it plus enough to keep the pump inlet covered at full tip — on the 134" example, more than 21 gallons of working oil before any reserve.',
    },

    { type: 'section_head', number: '/05', title: 'Mounting: flanges, splines, brackets and backlash.', anchor: 'mounting' },
    {
      type: 'prose',
      html: '<ul><li><strong>Flanges.</strong> Direct-mount pumps use SAE pump mounts — SAE A 2-bolt (3.25" pilot), SAE B 2- or 4-bolt (4.00" pilot), SAE C for large pumps — and many European PTOs offer a DIN 5462 splined output for ISO-pattern pumps. The PTO’s output code names which.</li><li><strong>Support.</strong> PTO makers require a support bracket for any pump system weighing 40 lb or more with its fittings, hose and oil; some rear-mount PTOs limit direct-mounted pumps to 25–30 lb. An unsupported pump hangs off the PTO housing and cracks it.</li><li><strong>Backlash.</strong> The PTO-to-transmission gear backlash is set with gaskets, typically to 0.006–0.012". Too many gaskets: rattle at no load. Too few: whine and hard shifting.</li><li><strong>Splines.</strong> Fretting corrosion — wear of the PTO and pump splines from tiny relative movement — has become more common with electronically controlled diesels and is excluded from at least one maker’s warranty. Use the maker’s spline lubricant and keep the pump properly supported.</li><li><strong>Driveshaft-driven pumps</strong> mounted on the chassis need the pump shaft parallel to the PTO shaft, U-joint working angles of a few degrees, yokes in phase, and never solid shafting.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Which truck pump?',
      branches: [
        { condition: 'Tipper or dump trailer only?', outcome: 'Dump pump on the PTO, three-line if the PTO is left engaged.', sku: 'IH-PMC-DUMP' },
        { condition: 'Crane, hooklift, roll-off or several functions?', outcome: 'PTO gear pump with a separate sectional valve.', sku: 'IH-DFC-GP-PTO' },
        { condition: 'Continuous duty — blower, pump-off, mixer?', outcome: 'PTO and pump rated for continuous duty at the speed used; consider a piston pump for efficiency.', sku: 'IH-CRS-50T' },
        { condition: 'No usable PTO opening, light duty?', outcome: 'Clutch pump on the engine belt drive.', sku: 'IH-PMC-CP124' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a dump pump?', answer: 'A gear pump with the tipping valve and relief built into its body, mounted on the truck’s PTO, used to raise and lower a dump body. Most work as power-up, gravity-down systems.' },
        { question: 'What is the difference between a 2-line and 3-line dump pump?', answer: 'A 2-line system returns oil through the pump to the tank; a 3-line system has a separate return line to the tank. 3-line lowers faster and runs cooler, and survives the pump being left engaged in neutral.' },
        { question: 'How do I calculate PTO pump speed?', answer: 'Engine rpm × PTO ratio. A 70% PTO at 1,800 engine rpm drives the pump at 1,260 rpm.' },
        { question: 'What size pump do I need for a dump truck?', answer: 'Divide the hoist’s oil volume by the time you want the lift to take to get the flow, then divide by pump speed for the displacement. A 21-gallon hoist lifted in about 40 seconds needs about 31 gpm — 6 in³/rev at 1,200 rpm.' },
        { question: 'Why does my dump pump overheat?', answer: 'Most often a 2-line system left engaged in neutral, so oil circulates inside the pump. Fit a 3-line return or disengage the PTO between tips.' },
        { question: 'Does a PTO pump need a support bracket?', answer: 'If the pump, fittings, hose and oil weigh 40 lb or more, yes — PTO makers require it. Some rear-mount PTOs have lower limits.' },
        { question: 'What is a clutch pump?', answer: 'A pump belt-driven from the engine through an electromagnetic clutch, switched on from the cab. It is used where there is no PTO, or for smaller duties.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Truck pumps',
      skus: ['IH-PMC-DUMP', 'IH-HVM-DUMP', 'IH-CRS-50T', 'IH-DFC-GP-PTO', 'IH-PRN-HCPTO', 'IH-PMC-CP124', 'IH-PMC-ACC'],
    },
    { type: 'category_link', slug: 'dump-clutch-pto-pumps', label: 'Dump, clutch and PTO pumps', blurb: 'Dump pumps, PTO gear pumps, clutch pumps and their controls.' },
    { type: 'category_link', slug: 'telescopic-specialty-cylinders', label: 'Telescopic and dump-hoist cylinders', blurb: 'The hoists these pumps drive.' },
    {
      type: 'related_articles',
      slugs: ['telescopic-hydraulic-cylinders', 'how-to-size-a-hydraulic-pump', 'hydraulic-pump-types-gear-vane-piston', 'two-stage-hydraulic-pumps-log-splitter'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'PTO speed, duty, backlash, bracket and spline facts from a PTO maker’s catalogue; line systems from trade press; pump ranges from our listings; sizing example computed.',
    },
    {
      type: 'cta_block',
      heading: 'Fitting out a truck?',
      body: 'Send the truck and transmission, the PTO if one is fitted, and what the hydraulics drive. We will match the pump, the valve, the tank and the hoses, and check the PTO rating.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
