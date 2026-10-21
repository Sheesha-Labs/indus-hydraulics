import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Grease and oil drum pumps and manual lubricators. Sources read 2026-10-21, all Bijur Delimon documents:
 * BF-G datasheet P_2017_2_GB_BFG and manual BA_2017_2_GB_BFG (grease pressure ≈ air pressure × internal ratio;
 * 15:1 / 50:1 / 70:1 air ranges, discharge per ratio; follower piston with rubber sealing lip; NLGI 000–2 from 50 and
 * 200 L barrels to DIN 6644-2/-4 and DIN EN 13008; base oil max 200 cSt at 40 °C);
 * PM45/PM60 grease datasheet 36407 (ratios 25:1–80:1, flow per ratio at 100 psi air, bulk tote 3" camlock, follower
 * plate and cover in the typical layout, air shut-off valve warning, never lay the pump on the floor);
 * PM45/PM60 oil datasheet 36749 (3:1 to 250 ft, 6:1 to 500 ft, 10:1 and 12:1 to 750 ft);
 * PM35 60:1 datasheet 36752 (145 psi max air, 8,700 psi max outlet, 35/120/400 lb containers);
 * PM26 sheet 35260 (120 lb = 16 gal / 57 L, 400 lb = 55 gal / 200 L; oil to NLGI 2);
 * PM3 sheet 35993 (55:1, 140 psi air, recommended 90 psi);
 * brochure 33136 (PM2 1:1 short runs, PM2 3:1 420 psi at 140 psi air, PM4 SAE 140 through long lines, PM35 grease cart
 * packages on two- and four-wheel carts for 35 lb, 120 lb and 400 lb containers);
 * L2P 24797, L5P 21967, L18P 21968, L5H 24373, HAP-P 24375, HIP-P 24374 (spring discharge, shot sizes, pressures,
 * Type F meter units, meter-unit limits, 40 µm filter, viscosity does not affect volume);
 * L13 27877 (PDI manual pump, 20 bar discharge, 0.7 bar relief, 75% rule); L100P 35711 (1 cc/stroke, 140 bar, NLGI 1–3);
 * TB-D hand-lever P_2005_1_GB_TBD_H (multi-line, 0.5 cm³ per outlet, 25 bar); DA 35518 and 35495 (double-action rack
 * pump, 7.4 cc, dual-line operating procedure at 1,500 psi); grease gun 35521 (17,000 psi head burst, 0.1 oz/stroke,
 * three loading methods); grease fill pump kits 35744 (1 lb per 6 strokes, 500 psi, cover and flexible follower).
 * NOT used: third-party statements on follower plates preventing air pockets (only distributor pages found);
 * any automatic-system threshold figures (none in a source read); air consumption figures.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'grease-and-oil-drum-pumps-and-manual-lubricators',
  title: 'Grease and oil drum pumps and manual lubricators: pump ratio, drum size and when to go automatic',
  excerpt:
    'An air-operated drum pump multiplies air pressure by its ratio: a low ratio moves oil in volume, a high ratio pushes grease through long lines and reels. How to read the ratio, match the pump to the pail, drum or tote, and where follower plates and grease carts fit — then the manual side: one-shot oil lubricators, hand-operated injector and progressive pumps, grease guns and fill pumps, and the point at which a machine needs an automatic system.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Grease and Oil Drum Pumps: Pump Ratio and Manual Lubricators',
  seoDescription:
    'Air-operated grease and oil drum pumps: pump ratio and outlet pressure, drum sizes, follower plates, grease carts, one-shot lubricators and grease guns.',
  focusKeyword: 'grease drum pump',
  publishedAt: '2026-10-22T02:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Outlet pressure of an air-operated drum pump is roughly air pressure × ratio: a 60:1 pump on 145 psi air gives up to 8,700 psi.',
        'Oil pumps run low ratios (1:1 to 12:1) for volume; grease pumps run high ratios (25:1 to 80:1) for pressure. Higher ratio, less flow.',
        'Match the pump to the container: 35 lb pail, 120 lb (57 L) drum, 400 lb (200 L) drum or bulk tote.',
        'Manual one-shot oil lubricators are spring discharge: the shot size is set by the stroke, not by the oil viscosity.',
        'A manual lubricator works only when someone uses it. Many points, short intervals or critical bearings call for an automatic system.',
      ],
    },
    {
      type: 'lead',
      html: 'Most lubrication in a workshop, a mine or a plant starts at a drum. An air-operated pump takes oil or grease from a pail, drum or tote and pushes it to a gun, a hose reel or the reservoir of a lubrication system. At the small end, a machine with a few points gets a hand-operated lubricator. This guide explains how to choose both, using the published data for the Bijur Delimon pumps we supply.',
    },

    { type: 'section_head', number: '/01', title: 'What the pump ratio means.', anchor: 'ratio' },
    {
      type: 'prose',
      html: '<p>An air-operated drum pump is an air motor driving a smaller pump piston. The ratio is the area of the air piston against the area of the fluid piston. Bijur Delimon’s BF-G manual puts it simply: the grease pressure the pump can reach is approximately the air pressure multiplied by the ratio. So:</p><ul><li>A <strong>60:1</strong> PM35 grease pump allows 145 psi (10 bar) of air and is rated 8,700 psi (600 bar) at the outlet — 60 × 145.</li><li>A <strong>55:1</strong> PM3 on 140 psi air gives 7,700 psi.</li><li>A <strong>3:1</strong> PM2 oil pump on 140 psi air gives 420 psi.</li></ul><p>These are stall figures. The pump runs when an outlet opens and stalls against a closed gun at its pressure limit. For the same air motor, a higher ratio means less flow. Bijur’s PM45 grease pumps show it: at 100 psi air the 25:1 delivers 13.5 lb/min, the 40:1 7.5 lb/min and the 70:1 4.5 lb/min. On the BF-G the 15:1 discharges up to 2.64 L/min, the 50:1 0.95 L/min and the 70:1 0.35 L/min. Pick the lowest ratio that still overcomes the line, the hose reel and the fitting at the far end.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Oil pumps and grease pumps.', anchor: 'oil-grease' },
    {
      type: 'comparison_table',
      caption: 'Bijur Delimon air-operated drum pumps by ratio (maker data)',
      columns: ['Pump', 'Ratio', 'Lubricant', 'Typical duty'],
      rows: [
        { cells: ['PM2', '1:1, 3:1', 'Oils, diesel, kerosene', '1:1: high volume through short runs; 3:1: lines, reels and meters'] },
        { cells: ['PM4', '3:1, 5:1', 'Oils up to SAE 140', 'Long lines, hose reels and meters, several outlets at once'] },
        { cells: ['PM45 / PM60 oil', '3:1 to 12:1', 'Engine, gear and hydraulic oil, ATF', '3:1 to 250 ft (75 m); 6:1 to 500 ft (150 m); 10:1 and 12:1 to 750 ft (230 m)'] },
        { cells: ['PM26', '26:1', 'Oil up to NLGI 2 grease', '120 lb and 400 lb drums, 5,200 psi'] },
        { cells: ['PM3', '55:1', 'Grease up to NLGI 2', 'Pail and drum pumps for single-reel and mobile use'], highlight: true },
        { cells: ['PM35', '60:1 (5:1, 8:1 oil)', 'Mineral greases', 'Medium-length piping; pails, drums and grease carts'] },
        { cells: ['PM45 / PM60 grease', '25:1 to 80:1', 'Mineral and synthetic grease, NLGI 2', 'Large installations, long piping, several outlets'] },
        { cells: ['BF-G', '15:1, 50:1, 70:1', 'Grease NLGI 000 to 2', '50 L and 200 L barrels; feeding central systems'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Oil flows easily, so oil pumps trade pressure for volume. The distance figures above come from Bijur’s PM45/PM60 oil sheet. Grease barely moves until it is pushed hard, and line losses climb with grade, length and cold, so grease pumps start at 25:1. Check the grease as well as the pump: the BF-G suits mineral-oil greases up to NLGI 2 with a base-oil viscosity of no more than 200 cSt at 40 °C. For reading a grease data sheet, see <a href="/blog/grease-selection-base-oil-thickener-nlgi">grease selection by base oil, thickener and NLGI grade</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Drums, followers and carts.', anchor: 'containers' },
    {
      type: 'prose',
      html: '<p>The pump tube is cut to the container, so the container is part of the order:</p><ul><li><strong>35 lb pail</strong>, <strong>120 lb drum</strong> (16 gal, 57 L) and <strong>400 lb drum</strong> (55 gal, 200 L) are the US sizes used throughout Bijur’s PM range. The BF-G takes 50 L and 200 L barrels to DIN 6644-2/-4 and DIN EN 13008.</li><li><strong>Bulk tote</strong> versions of the PM45 and PM60 are short stub pumps with the male half of a 3-inch camlock. They connect sideways to the tote’s outlet.</li><li><strong>Cover and bung adapter</strong> hold the pump at height in the drum’s 2-inch bung. On the heavier PM45 and PM60, Bijur recommends a reinforced cover.</li></ul><p>For grease, a <strong>follower plate</strong> sits on the grease surface inside the drum and drops as the drum empties. Bijur shows one in every grease pump layout and sells it separately, sized to the drum. The BF-G’s follower piston has a rubber lip that seals against the barrel wall. A <strong>grease cart</strong> is the mobile version: Bijur packages the 60:1 PM35 with cover, follower plate, 15 ft delivery hose and grease control handle on two-wheel or four-wheel carts, for 35 lb, 120 lb and 400 lb containers.</p><p>Two installation rules from Bijur’s sheets are worth repeating. Fit an air shut-off valve and close it at the end of the day: if a grease line leaks overnight, the pump starts on its own and empties the drum. And never lay the pump down on the floor, because dirt on the pump tube damages the internal seals. Run it from a filter-regulator; Bijur recommends about 90 psi (6 bar) for most PM grease pumps.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Manual lubricators for small machines.', anchor: 'manual' },
    {
      type: 'comparison_table',
      caption: 'Manual lubricators by distribution system (Bijur Delimon data)',
      columns: ['Type', 'Models', 'How it works', 'Key figures'],
      rows: [
        { cells: ['One-shot oil, single-line resistance', 'L2P, L5P, L5H, L18P, HAP-P, HIP-P', 'Pull or push the handle to charge a spring; release and the spring delivers the shot through meter units', '1 to 18 cc per shot; 30 to 75 psi'] },
        { cells: ['Oil, positive-displacement injectors', 'L13', 'Pull to pressurise and fire the injectors; return the handle to vent the line so they reset', '13 cc; 20 bar; vents to 0.7 bar'] },
        { cells: ['Grease, progressive', 'L100P', 'Hand lever; count strokes to the dose', '1 cc per stroke; 140 bar; NLGI 1–3'] },
        { cells: ['Grease, multi-line', 'TB-D hand lever', 'One piston feeds each outlet in turn', '0.5 cm³ per outlet per stroke; 25 bar; up to 8 outlets'] },
        { cells: ['Grease or oil, dual-line / injector or single-line', 'DA', 'Double-acting rack-and-piston pump with gauge', '7.4 cc; 2 to 6 kg grease reservoirs'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>One-shot oil lubricators</strong> are the usual choice on small machine tools. The shot is set by the piston stroke: on the L5P it can be set from 1 to 5 cc, and on the L18P from 6 to 18 cc. Bijur states that oil viscosity does not change the volume, though it can change the system pressure. They feed Type F meter units, and each model has a limit — 60 meter units on the L2P, 70 on the L5P and L18P. Discharge pressure drops as the shot gets smaller and the meter units get more numerous. The 40-micron inlet filter should be inspected every six months.</p><p><strong>Injector and progressive hand pumps</strong> follow the rules of their systems. On the L13, the oil demand of the injectors should not exceed 75% of the pump’s 13 cc output, leaving margin to build pressure. The L100P is dosed by counting strokes, and Bijur warns against over-lubricating. Grease used in it must filter to 40 microns without separating. The <strong>DA</strong> is the heavy-industry hand pump: on a dual-line system the operator pumps to 1,500 psi, holds for a minute, then reverses the slide valve and repeats for the second line.</p><p><strong>Grease guns and fill pumps</strong> complete the manual kit. Bijur’s lever and pistol guns have cast-iron heads (17,000 psi head burst), deliver 0.1 oz per stroke, and load by cartridge, by suction or from a filler pump. If a gun fails to pump after loading, loosen the barrel two or three turns to let trapped air out. The grease fill pump kits sit on a 35 lb pail or 120 lb drum under a cover with a flexible follower and fill system reservoirs at 1 lb per 6 strokes. A closed transfer like this keeps dirt out of the reservoir. For the fittings guns connect to, see <a href="/blog/grease-and-zerk-fittings">grease and zerk fittings</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'When to go automatic.', anchor: 'automatic' },
    {
      type: 'prose',
      html: '<p>Every manual lubricator data sheet says the same thing: operate it at the intervals the machine maker recommends. A manual lubricator delivers exactly what it is designed to, but only when someone remembers to use it. Move to a powered pump with a controller when:</p><ul><li>there are more points than an operator will reliably reach, or they are hard to get to safely;</li><li>the interval is short — every shift, or every few hours of running;</li><li>the bearings are critical enough that a skipped shot means a failure;</li><li>you need a record that lubrication happened — pressure switches and controllers give one, a hand lever does not.</li></ul><p>The distribution side often carries over. Meter units, injectors and progressive dividers fed by a hand pump can usually be fed by an electric or air pump instead. See <a href="/blog/centralised-lubrication-systems">centralised lubrication systems</a> for the automatic side.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What does 50:1 mean on a grease pump?', answer: 'The air piston has 50 times the area of the grease piston, so outlet pressure is roughly 50 times the air pressure. On 100 psi air, a 50:1 pump stalls at around 5,000 psi.' },
        { question: 'Why do oil pumps have low ratios?', answer: 'Oil needs volume more than pressure. A 1:1 or 3:1 pump moves several gallons a minute through short runs; higher oil ratios (6:1 to 12:1) are for longer lines to distant outlets.' },
        { question: 'Do I need a follower plate?', answer: 'For grease, yes. Bijur includes a follower plate in every grease drum pump layout. It sits on the grease and drops as the drum empties. Order it to the drum size.' },
        { question: 'Does oil viscosity change the shot from a one-shot lubricator?', answer: 'Not the volume. On Bijur’s spring-discharge lubricators the stroke sets the shot; viscosity can change the system pressure.' },
        { question: 'What should I send for a drum pump quote?', answer: 'The lubricant and grade, the container (pail, 120 lb, 400 lb, tote), the line length and number of outlets, the air pressure available, and whether it is fixed or on a cart.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Barrel and drum pumps, manual lubricators, grease guns and fill pumps — all Bijur Delimon:</p>' + stockList(['lubrication-barrel-pumps', 'manual-lubrication-pumps']),
    },
    {
      type: 'product_embed',
      heading: 'Drum pumps and manual lubricators',
      skus: ['IH-BD-PM35', 'IH-BD-PM45', 'IH-BD-PM60', 'IH-BD-BFG', 'IH-BD-PM2', 'IH-BD-MSLR', 'IH-BD-MPDI', 'IH-BD-HAND'],
    },
    { type: 'category_link', slug: 'lubrication-barrel-pumps', label: 'Lubrication barrel pumps', blurb: 'Air-operated oil and grease drum pumps.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'bd-bfg', text: 'Bijur Delimon. Pump BF-G product description, P_2017_2_GB_BFG.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/328/' },
        { id: 'bd-pm-grease', text: 'Bijur Delimon. PM45 & PM60 air-operated grease pump datasheet, 36407 R3.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/160/' },
        { id: 'bd-pm-oil', text: 'Bijur Delimon. PM45 & PM60 air-operated oil pump datasheet, 36749 R0.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/173/' },
        { id: 'bd-pm35', text: 'Bijur Delimon. PM35 60:1 grease pump datasheet, 36752 R0.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/175/' },
        { id: 'bd-33136', text: 'Bijur Delimon. Industrial Lubrication Pumps, Hose Reels & Accessories, brochure 33136 R21.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/62/' },
        { id: 'bd-l5p', text: 'Bijur Delimon. L5P Lubricator datasheet, 21967 R4.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/17/' },
        { id: 'bd-l13', text: 'Bijur Delimon. L13 Lubricator (PDI, manual) datasheet, 27877 R3.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/54/' },
        { id: 'bd-tbdh', text: 'Bijur Delimon. Pump TB-D hand lever product description, P_2005_1_GB_TBD.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/406/' },
        { id: 'bd-gun', text: 'Bijur Delimon. Manual grease gun datasheet, 35521 R0.', url: 'https://www.bijurdelimon.com/amfile/file/download/file/90/' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['centralised-lubrication-systems', 'grease-selection-base-oil-thickener-nlgi', 'grease-and-zerk-fittings', 'anti-friction-coatings-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratios, pressures, flows and shot sizes from Bijur Delimon datasheets and brochure 33136.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a drum pump or a manual lubricator?',
      body: 'Send the lubricant and grade, the container, the line length and number of outlets, and the air supply — or, for a small machine, the number of points and the system type. We will propose the pump and the parts that go with it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
