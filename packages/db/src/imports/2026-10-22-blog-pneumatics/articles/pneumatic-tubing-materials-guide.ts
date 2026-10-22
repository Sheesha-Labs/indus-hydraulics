import { stockList } from '../products'
import type { BlogArticleSeed } from '../shared'

/**
 * Pneumatic tubing materials. Nylon 12, sizes, 20 °C rating (1.5 MPa), bend radii and the 4 mm ≈ 5/32 in, 8 mm ≈ 5/16 in
 * nominal cross-listing (SMC T/TIA catalogue page); soft nylon is nylon 11/12, air only, 1.0 MPa, bend radii (SMC TS/TISA);
 * polyurethane 0.8 MPa, water 0–40 °C, bend radii, inch TIUB sizes (SMC TU/TIUB); hard polyurethane 0.8/0.65/0.5 and
 * 1.0/0.85/0.7 MPa at 20/40/60 °C, ester polyurethane not for water (SMC TUH); wear-resistant polyurethane 0.8/0.6/0.4 MPa
 * at 20/40/60 °C, bend radii, abrasion 0.16 vs 0.46 mm after 10 million cycles, static-piping note (SMC TUZ); coil tubing,
 * do not cut the coil (SMC TCU); clean polyolefin tubing 1.0/0.8/0.6/0.4 and 0.7/0.57/0.43/0.3 MPa at 20/40/60/80 °C,
 * bend radii, not resistant to mineral oil, FDA §175.300 (SMC TPH/TPS); FEP max 200 °C (SMC TH); Super PFA up to 260 °C,
 * derating formula, UL-94 V-0 equivalent, FDA §177.1550, tolerance note on other makers' fittings, lesser-of-tube-and-
 * fitting rule (SMC TL/TIL); modified PTFE 1.6/0.9/0.45/0.23 MPa at 20/100/200/260 °C (SMC TD); flame-resistant TRS and
 * double-layer TRB, strip-the-outer-layer instruction, black-only weather-resistant option (SMC TRS/TRB); antistatic
 * 10^4–10^7 Ω, 0–40 °C, KA fittings, plasticiser caution in clean rooms (SMC TA/TAS/TAU); spatter → FR, static → antistatic,
 * bend radius near fittings, no standard tube where tubing travels (SMC KQ2 fittings & tubing precautions); adiabatic
 * compression, surge, sunlight/radiant heat, outdoor use, dryer/aftercooler (SMC common precautions).
 * Left out as unsourced: PA11 vs PA12 property differences, polyethylene-specific ratings, Parker/ATP/Nycoil ratings
 * (Parker literature not reachable), UV-resistance figures, permeation and chemical-resistance tables.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pneumatic-tubing-materials-guide',
  title: 'Pneumatic tubing materials: nylon, polyurethane, polyolefin and fluoropolymer compared',
  excerpt:
    'Nylon holds pressure, polyurethane bends, polyolefin stays clean and fluoropolymer takes heat and chemicals — and every one of them loses pressure rating as it warms. How the four families compare on SMC’s own data, how far ratings fall with temperature, minimum bend radius, why inch and metric tube are not interchangeable, and when to specify flame-resistant, antistatic or clean-room tubing.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Tubing Materials: Nylon vs Polyurethane vs PFA',
  seoDescription:
    'Nylon, polyurethane, polyolefin and FEP/PFA air tubing compared: SMC pressure derating with temperature, bend radius, inch vs metric OD and special tubing.',
  focusKeyword: 'pneumatic tubing materials',
  publishedAt: '2026-10-22T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Nylon is the stiff, high-pressure choice; polyurethane is the flexible one; polyolefin is for clean and food-adjacent air; FEP and PFA are for heat and chemicals.',
        'Tubing ratings are quoted at 20 °C. SMC’s TUZ polyurethane falls from 0.8 MPa at 20 °C to 0.4 MPa at 60 °C — half its rating — so take the figure at the real line temperature.',
        'A connection is only as strong as its weaker half: SMC says to use the lower of the tube and fitting ratings.',
        'Inch and metric tube differ by 0.35–0.7 mm at 1/4, 3/8 and 1/2 inch. Buy the fitting in the same system as the tube.',
        'Where weld spatter flies, specify flame-resistant tube and fittings; where static matters, antistatic tube and fittings. SMC says ordinary tube should not be used there.',
      ],
    },
    {
      type: 'lead',
      html: 'Air tubing looks like a commodity until a line softens beside a hot machine, kinks behind a cylinder, or pulls out of a fitting because the tube was 6 mm and the fitting was made for 1/4 inch (6.35 mm). The material sets the pressure rating, how tight the tube will bend, how it behaves in heat, and what it may carry. This guide compares the four families on the makers’ own data — chiefly SMC, whose catalogues publish ratings at several temperatures — and links every tubing listing we carry.',
    },

    { type: 'section_head', number: '/01', title: 'The four material families.', anchor: 'materials' },
    {
      type: 'prose',
      html: '<p><strong>Nylon.</strong> SMC’s general-purpose T series is nylon 12, rated 1.5 MPa (15 bar) at 20 °C for air or water, from −20 to +60 °C (water 0 to 40 °C). It is stiff: a 6 mm nylon tube has a minimum bend radius of 24 mm in SMC’s table. That stiffness is what you want on long runs, panel work and higher pressure. SMC’s TS soft nylon, made in nylon 11 and nylon 12, trades some pressure for pliability: 1.0 MPa at 20 °C, air only, and a 15 mm bend radius at 6 mm.</p><p><strong>Polyurethane.</strong> SMC’s TU polyurethane is rated 0.8 MPa at 20 °C, −20 to +60 °C, with a 15 mm bend radius at 6 mm — the flexible tube for moving machinery, short drops to cylinders and tight routing. Two polyurethane cautions come straight from SMC: the ester polyurethane in its TUH hard polyurethane and TAU antistatic tube must not carry water, because it hydrolyses; and polyurethane swells in diameter under pressure, which matters when a used tube is pushed back into a fitting.</p><p><strong>Polyolefin (the polyethylene and polypropylene family).</strong> SMC’s TPH and TPS clean tubing is polyolefin resin for air, nitrogen, water and DI water, −20 to +80 °C, and complies with the FDA §175.300 dissolution test. SMC is explicit that polyolefin is <em>not</em> suitable for regular pneumatic piping because it does not resist mineral oil — so it belongs on dry, oil-free air, not downstream of a lubricator.</p><p><strong>Fluoropolymer (FEP, PFA, PTFE).</strong> SMC’s TH FEP tubing is rated to a maximum of 200 °C and its TL/TIL Super PFA to 260 °C; both are listed as compatible with the FDA §177.1550 dissolution test, and SMC lists the PFA tube as flame resistant, equivalent to UL-94 V-0. Their pressure rating depends heavily on temperature and on wall thickness — SMC notes that two FEP tubes of the same OD rate differently if the bore differs.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'SMC tubing families compared (maker data; ratings at 20 °C unless stated)',
      columns: ['Material (SMC series)', 'Max. operating pressure', 'Temperature', 'Min. bend radius, 6 mm OD', 'Watch for'],
      rows: [
        { cells: ['Nylon 12 (T)', '1.5 MPa (15 bar) at 20 °C; lower when warmer — see SMC curve', '−20 to +60 °C; water 0 to 40 °C', '24 mm', 'Stiff; the long-run, higher-pressure choice'], highlight: true },
        { cells: ['Soft nylon, nylon 11/12 (TS)', '1.0 MPa at 20 °C', '−20 to +60 °C', '15 mm', 'Air only in SMC’s specification'] },
        { cells: ['Polyurethane (TU)', '0.8 MPa at 20 °C', '−20 to +60 °C; water 0 to 40 °C', '15 mm', 'Swells under pressure; may not re-insert'] },
        { cells: ['Wear-resistant polyurethane (TUZ)', '0.8 / 0.6 / 0.4 MPa at 20 / 40 / 60 °C', '−20 to +60 °C', '15 mm', 'About one-third the abrasion of TU in SMC’s test'] },
        { cells: ['Polyolefin, clean (TPH)', '1.0 / 0.8 / 0.6 / 0.4 MPa at 20 / 40 / 60 / 80 °C (4 and 6 mm)', '−20 to +80 °C', '25 mm', 'Not resistant to mineral oil — no lubricated air'] },
        { cells: ['FEP (TH)', 'Falls with temperature and bore — read SMC’s curve', 'Up to 200 °C', 'See SMC table', 'Chemical and food-contact duty'] },
        { cells: ['Super PFA (TL/TIL)', '¼ × burst-pressure drop coefficient × 20 °C burst pressure', 'Up to 260 °C', 'See SMC table', 'Fix the tube; check fit with other makers’ fittings'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Pressure falls as temperature rises.', anchor: 'derating' },
    {
      type: 'prose',
      html: '<p>Every plastic tube is weaker warm than cold, and catalogue headline ratings are quoted at 20 °C. SMC states this on each tubing page and publishes the figures at higher temperatures. The fall is steep:</p><ul><li><strong>SMC TUZ wear-resistant polyurethane:</strong> 0.8 MPa at 20 °C, 0.6 MPa at 40 °C, 0.4 MPa at 60 °C (about 116, 87 and 58 psi). At its 60 °C limit the tube holds half its room-temperature rating.</li><li><strong>SMC TUH hard polyurethane:</strong> 0.8, 0.65 and 0.5 MPa at 20, 40 and 60 °C for the standard type; 1.0, 0.85 and 0.7 MPa for the high-pressure type.</li><li><strong>SMC TPH clean polyolefin, 4 and 6 mm:</strong> 1.0, 0.8, 0.6 and 0.4 MPa at 20, 40, 60 and 80 °C; the 8, 10 and 12 mm sizes start at 0.7 MPa and fall to 0.3 MPa at 80 °C.</li><li><strong>SMC TD modified-PTFE, 4 mm:</strong> 1.6 MPa at 20 °C, 0.9 at 100 °C, 0.45 at 200 °C and 0.23 at 260 °C — high temperature capability does not mean high pressure at that temperature.</li></ul><p>For its Super PFA tube SMC gives the rule behind the numbers: the maximum operating pressure at another temperature is one quarter of the 20 °C burst pressure, multiplied by the burst-pressure drop coefficient read from its curve.</p><p>Two consequences for specifying. First, size the tube for the hottest place it runs, not the compressor setting: tubing beside ovens, compressors, or in a sun-heated panel on a Gulf site sees far more than 20 °C. Second, SMC tells you to observe the lower of the tube and fitting ratings — the push-in fitting has its own limit, and the connection is only as strong as the weaker of the two.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Surges and adiabatic heating burst tubes.',
      body: 'SMC warns on its tubing pages that an abnormal temperature rise from adiabatic compression — air slammed into a dead-ended line — may burst the tube, and that on water service the surge pressure must stay below the maximum operating pressure or fittings and tube will be damaged. Rate the line for its worst moment, not its gauge reading, and, as SMC puts it for its fluoropolymer tube, do not use a tube that is not fixed in place.',
    },

    { type: 'section_head', number: '/03', title: 'Minimum bend radius.', anchor: 'bend-radius' },
    {
      type: 'prose',
      html: '<p>Bend radius decides how tight a tube can be routed before it flattens, kinks or cracks. SMC measures it at 20 °C by bending the tube into a U, fixing one end and closing the loop until the tube breaks or crushes. At 6 mm OD the spread is wide: 15 mm for TU polyurethane and TS soft nylon, 24 mm for T nylon, 25 mm for TPH polyolefin. Across sizes, SMC’s TU polyurethane runs 10, 15, 20, 27 and 35 mm for 4, 6, 8, 10 and 12 mm OD; T nylon runs 13, 24, 48, 60 and 75 mm for the same sizes.</p><p>Three rules from SMC’s precautions:</p><ul><li><strong>Keep the bend radius near a fitting at or above the minimum.</strong> A tube bent hard at the fitting mouth can damage the fitting or crack the tube.</li><li><strong>The figure is for static piping at 20 °C.</strong> SMC notes that at higher temperatures a tube can break or flatten at radii above the published minimum, and that tube in a moving part needs extra length.</li><li><strong>Do not use standard straight tube where the tubing has to travel.</strong> Use coil tubing (SMC’s TCU polyurethane coils) or wear-resistant tube in a cable carrier. SMC adds that a coil must not be cut and pushed into a fitting — it can leak or pull out.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Inch and metric: why the two do not mix.', anchor: 'inch-metric' },
    {
      type: 'prose',
      html: '<p>A push-in fitting grips and seals on the outside of the tube, so it is made for one exact OD. Metric tube is sized in whole millimetres; inch tube in fractions of an inch. SMC sells them as separate series — T and TIA in nylon, TU and TIUB in polyurethane — and the ODs are not the same:</p><ul><li>1/4 inch = 6.35 mm, against 6 mm metric (0.35 mm larger)</li><li>3/8 inch = 9.53 mm, against 10 mm (0.47 mm smaller)</li><li>1/2 inch = 12.7 mm, against 12 mm (0.7 mm larger)</li></ul><p>A tube that is oversize will not go into the fitting; one that is undersize may go in and then leak or pull out under pressure, because the collet teeth and O-ring are sized for a larger tube. SMC itself notes that its fluoropolymer tube sometimes cannot be connected to other makers’ fittings because of dimensional tolerance — and that is within one size system.</p><p>The near-coincidences are 5/32 inch (3.97 mm) against 4 mm and 5/16 inch (7.94 mm) against 8 mm, and SMC’s T-series table lists its 4 mm and 8 mm tubes against those inch nominal sizes. Treat that as the maker’s statement for its own tube and fittings, not a licence to mix. On a mixed fleet — American machines on inch tube, European and Asian on metric — keep the two systems apart: one tube colour per system helps, and order fittings by the tube OD actually fitted, not the port size.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Flame-resistant, antistatic, clean-room and outdoor tubing.', anchor: 'special' },
    {
      type: 'prose',
      html: '<h3>Flame-resistant: weld cells</h3><p>Around spot welders, spatter burns through ordinary nylon and polyurethane. SMC’s fittings-and-tubing precautions say flame-resistant fittings and tubing are recommended where spatter is generated and that ordinary fittings and tubing should not be used there. Its TRS flame-resistant soft nylon is equivalent to UL-94 V-0, −20 to +60 °C. Its TRB double-layer tube puts a flame-resistant PVC (UL-94 V-0 equivalent) jacket over a nylon 12 inner tube; the insertion length is printed on the jacket, and the jacket is stripped back to that mark so only the inner tube enters the push-in fitting.</p><h3>Antistatic: electronics and powder</h3><p>Where static would be a problem, SMC recommends antistatic tubing with antistatic fittings, and again says ordinary fittings and tubing should not be used. Its TA series is conductive, with a surface resistance of 10<sup>4</sup> to 10<sup>7</sup> Ω, rated 0 to 40 °C — a narrower temperature window than standard tube. The soft-nylon version is also flame resistant (UL-94 V-0 equivalent).</p><h3>Clean rooms and oil-free air</h3><p>SMC’s TPH and TPS polyolefin tubing is its clean tubing, for air, nitrogen and DI water. Do not pick soft nylon for a clean room by default: SMC cautions that plasticiser can precipitate on the surface of its antistatic soft nylon and reduce the room’s cleanliness. And remember the polyolefin limit — no mineral oil, so no lubricated air.</p><h3>Wear: cable carriers and moving axes</h3><p>SMC’s TUZ is a special polyurethane for tube that rubs. In SMC’s own accelerated test inside a flexible protection tube, TUZ showed 0.16 mm maximum abrasion after 10 million cycles against 0.46 mm for standard TU — about one-third.</p><h3>Sun and outdoor runs</h3><p>SMC’s common precautions tell users not to expose the products to direct sunlight for an extended period, not to mount them where they take radiant heat, and to consult SMC before outdoor use. For its flame-resistant tube SMC offers an improved weather-resistance version in black only. On a Gulf site, that means routing plastic tube in trunking or shade, keeping it away from hot surfaces, and asking the maker before any long exposed run. Pair that with dry air: SMC recommends an aftercooler and dryer because excessive condensate makes valves and other equipment malfunction.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which tubing?',
      branches: [
        { condition: 'Weld spatter or sparks nearby?', outcome: 'Flame-resistant tube with flame-resistant fittings — SMC TRS or double-layer TRB.' },
        { condition: 'Static a problem — electronics, powder handling?', outcome: 'Antistatic tube with antistatic fittings; mind its 0 to 40 °C range.' },
        { condition: 'Above 80 °C, or chemicals rather than air?', outcome: 'FEP (to 200 °C) or PFA (to 260 °C), rated at the actual temperature.' },
        { condition: 'Oil-free air in a clean or food-adjacent area?', outcome: 'Polyolefin clean tubing — never on lubricated air.' },
        { condition: 'Moving machinery, tight bends, cable carrier?', outcome: 'Polyurethane; wear-resistant polyurethane in a carrier; coil tube where the line travels.' },
        { condition: 'Long fixed runs, higher pressure, panel work?', outcome: 'Nylon — stiff, holds its line, highest rating of the common tubes.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'listings' },
    {
      type: 'prose',
      html: `<p>Our tubing shelf carries SMC’s nylon, soft nylon, polyurethane, wear-resistant, flame-resistant, coil, clean-room polyolefin and fluoropolymer series, Parker PTFE, FEP and polypropylene tubing, and ATP and Nycoil tubing — every listing is below. Each is quoted by maker part number; the ratings above are the makers’ figures, so check the sheet for the exact series and size you order.</p>${stockList(['pneumatic-tubing'])}`,
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is nylon or polyurethane tubing better for compressed air?', answer: 'Nylon for pressure and long fixed runs: SMC rates its T-series nylon at 1.5 MPa at 20 °C. Polyurethane for flexibility: SMC’s TU is rated 0.8 MPa but bends to a 15 mm radius at 6 mm OD against 24 mm for nylon.' },
        { question: 'How much does tubing pressure rating drop with temperature?', answer: 'A lot. SMC rates its TUZ polyurethane at 0.8 MPa at 20 °C, 0.6 MPa at 40 °C and 0.4 MPa at 60 °C. Its 4 mm modified-PTFE tube falls from 1.6 MPa at 20 °C to 0.23 MPa at 260 °C. Always rate at the hottest point on the run.' },
        { question: 'Can I use 6 mm tubing in a 1/4 inch push-in fitting?', answer: 'No. 1/4 inch is 6.35 mm, so a 6 mm tube is 0.35 mm undersize for the fitting’s collet and seal and can leak or pull out. Use fittings in the same size system as the tube.' },
        { question: 'What is the minimum bend radius of pneumatic tubing?', answer: 'It depends on material and size. SMC gives 15 mm for 6 mm polyurethane, 24 mm for 6 mm nylon and 25 mm for 6 mm polyolefin, measured at 20 °C on static piping. Allow more in heat or on moving parts.' },
        { question: 'Can polyurethane air tubing carry water?', answer: 'Some can, some cannot. SMC’s TU polyurethane is rated for water at 0 to 40 °C, but its TUH and TAU tubes use ester polyurethane and must not carry water because of hydrolysis. Check the series.' },
        { question: 'What tubing should I use near welding?', answer: 'Flame-resistant tube with flame-resistant fittings. SMC says ordinary fittings and tubing should not be used where spatter is generated; its TRS and TRB tubes are equivalent to UL-94 V-0.' },
        { question: 'What temperature can PTFE, FEP and PFA tubing take?', answer: 'SMC rates its FEP tube to 200 °C and its Super PFA tube to 260 °C, but the pressure rating falls steeply as temperature rises, so the working pressure at temperature must be read from the maker’s table or curve.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Tubing by material',
      skus: [
        'IH-SMC-T-SERIES-NYLON-TUBING',
        'IH-SMC-TIU-SERIES-POLYURETHANE-TUBING',
        'IH-SMC-TUZ-SERIES-WEAR-RESISTANT-TUBING',
        'IH-SMC-TR-SERIES-FLAME-RESIST-TUBING',
        'IH-SMC-TPH-SERIES-CLEAN-ROOM-POLY-TUBING',
        'IH-SMC-TIL-TL-SERIES-FLUOROPOLYMER-TUBING',
        'IH-PAR-FEP-FLUOROPOLYMER-TUBINGS-METRIC',
        'IH-SMC-TCU-SERIES-COIL-TUBING',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-tubing', label: 'Pneumatic tubing', blurb: 'Nylon, polyurethane, polyolefin, FEP, PFA and PTFE air tubing, metric and inch.' },
    { type: 'category_link', slug: 'push-to-connect-pneumatic-fittings', label: 'Push-to-connect fittings', blurb: 'Push-in connectors, elbows, tees and unions for metric and inch tube.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Every pneumatics shelf: cylinders, valves, FRLs, tubing, fittings, vacuum and air motors.' },
    {
      type: 'related_articles',
      slugs: [
        'push-to-connect-fittings-and-silencers',
        'frl-filter-regulator-lubricator-guide',
        'compressed-air-quality-iso-8573-1',
        'sizing-pneumatic-valves-flow-cv',
        'cylinder-speed-control-and-quick-exhaust-valves',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Ratings, temperature limits, bend radii and precautions from SMC tubing catalogue pages (T, TS, TU, TUH, TUZ, TCU, TPH/TPS, TH, TL, TD, TRS/TRB, TA) and SMC fittings-and-tubing precautions.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying tubing for a hot, dusty or moving line?',
      body: 'Tell us the tube OD in inch or metric, the working pressure, the hottest temperature on the run, and whether it moves, sees spatter or carries oil-free air. We will quote the tubing and matching fittings by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
