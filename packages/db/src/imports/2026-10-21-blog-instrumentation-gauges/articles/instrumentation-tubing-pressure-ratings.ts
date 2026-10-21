import type { BlogArticleSeed } from '../shared'
import { TUBE_PRESSURE } from '../diagrams'

/**
 * Instrument tubing selection and ratings. Working pressures (ASME B31.3, S = 20,000 psi, ASTM A269) from Swagelok
 * Tubing Data MS-01-107 Table 3 and Parker catalogue 4230/4233 pp.80–81 (the two agree to within 100 psi); metric
 * 6 mm and 12 mm rows from Swagelok (high-confidence cells only); temperature factors from Swagelok Table 26 and
 * Parker Table 8; welded derating 0.85/0.80; hardness 90 HRB max (Parker 80 HRB recommended); gas-service wall;
 * Parker bend radii and support spacing (Bulletin 4200-B4). Worked derating examples computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'instrumentation-tubing-pressure-ratings',
  title: 'Instrumentation tubing: pressure ratings by OD and wall, temperature derating, hardness and how to choose',
  excerpt:
    'A compression fitting is rated to the tube it is on, so the tube decides the line’s pressure. 316 seamless working pressures by OD and wall, the temperature factors, the welded-tube derating, why hardness and finish matter as much as wall, the heavier wall gas needs, bend radii and support spacing — with worked examples.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Instrument Tubing Pressure Ratings: OD, Wall & Temp',
  seoDescription:
    '316 stainless instrumentation tubing working pressure by OD and wall thickness, temperature derating factors, welded vs seamless, hardness (90 HRB max), gas-service wall, bend radius and support spacing, with examples.',
  focusKeyword: 'stainless tubing pressure rating',
  publishedAt: '2026-10-21T13:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        '316 seamless 1/4" × 0.035" tube is rated 5,100 psig; 3/8" × 0.049" is 4,800 psig; 1/2" × 0.049" is 3,700 psig — at ambient temperature, on the ASME B31.3 basis both major fitting makers use.',
        'Ratings fall with temperature: multiply by about 0.96 at 400 °F (204 °C), 0.85 at 600 °F (315 °C) and 0.80 at 800 °F (426 °C) for 316.',
        'Welded tube is derated: × 0.85 for double-welded, × 0.80 for single-welded.',
        'Stainless tube must be fully annealed and no harder than 90 HRB to seal — Parker recommends 80 HRB or less, especially for gas.',
        'Gas service needs heavier wall so the ferrules can coin out small surface defects; thin wall gives way instead.',
      ],
    },
    {
      type: 'lead',
      html: 'Instrument fittings do not carry a pressure rating of their own in the way a flange does. They are tested across a range of tube walls for every size, and the working pressure the makers publish is a property of the tube. So choosing tube is choosing the pressure rating of the whole line — and choosing the hardness and finish that decide whether it seals at all.',
    },

    { type: 'section_head', number: '/01', title: 'Working pressure by OD and wall.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: '316/304 seamless tubing, working pressure at ambient temperature (psig) — ASME B31.3 basis, ASTM A269',
      columns: ['OD × wall (in)', 'Swagelok', 'Parker seamless', 'Parker welded'],
      rows: [
        { cells: ['1/8 × 0.028', '8,500', '8,600', '7,300'] },
        { cells: ['1/4 × 0.028', '4,000', '4,000', '3,400'] },
        { cells: ['1/4 × 0.035', '5,100', '5,100', '4,400'], highlight: true },
        { cells: ['1/4 × 0.049', '7,500', '7,500', '6,400'] },
        { cells: ['1/4 × 0.065', '10,200', '10,300', '8,700'] },
        { cells: ['3/8 × 0.035', '3,300', '3,300', '2,800'] },
        { cells: ['3/8 × 0.049', '4,800', '4,800', '4,100'] },
        { cells: ['3/8 × 0.065', '6,500', '6,600', '5,600'] },
        { cells: ['1/2 × 0.035', '2,600', '2,600', '2,200'] },
        { cells: ['1/2 × 0.049', '3,700', '3,700', '3,200'] },
        { cells: ['1/2 × 0.065', '5,100', '5,100', '4,300'] },
        { cells: ['1/2 × 0.083', '6,700', '6,700', '5,700'] },
        { cells: ['3/4 × 0.065', '3,300', '3,300', '2,800'] },
        { cells: ['1 × 0.083', '3,100', '3,200', '2,700'] },
      ],
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'How wall thickness and diameter trade off. For the same wall, a larger tube holds less pressure; to hold the same pressure in a larger tube, the wall must grow roughly in proportion to the diameter.',
      alt: 'Bar chart of 316 seamless tube working pressure in psig. 1/4 inch tube: 4,000 at 0.028 wall, 5,100 at 0.035, 7,500 at 0.049, 10,200 at 0.065. 3/8 inch: 3,300 at 0.035, 4,800 at 0.049, 6,500 at 0.065. 1/2 inch: 2,600 at 0.035, 3,700 at 0.049, 5,100 at 0.065, 6,700 at 0.083.',
      svg: TUBE_PRESSURE,
    },
    {
      type: 'prose',
      html: '<p>The two makers’ tables agree to within 100 psi on every row, because both calculate from ASME B31.3 with an allowable stress of 20,000 psi for 316 to ASTM A269. Parker states that its figures are calculated at maximum OD and minimum wall. Two notes from Swagelok’s tables are worth keeping: the 1/4" × 0.065" rating needs Swagelok’s medium-pressure fittings above that point, and some ratings are based on fitting tests with a 4:1 design factor rather than on the tube formula.</p><p>Metric 316 seamless tube to EN ISO 1127, from Swagelok’s metric table at −28 to 37 °C: 6 mm tube is rated 320 bar at 0.8 mm wall, 430 bar at 1.0 mm, 550 bar at 1.2 mm and 720 bar at 1.5 mm; 12 mm tube is 200 bar at 1.0 mm and 330 bar at 1.5 mm.</p><p>Walls outside the maker’s tested range are not rated: Swagelok does not recommend its fittings outside the minimum and maximum walls in its tables, and Parker treats any combination without a pressure figure as not recommended.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Temperature derating.', anchor: 'temperature' },
    {
      type: 'comparison_table',
      caption: 'Elevated-temperature factors — multiply the ambient rating',
      columns: ['Temperature', '316/316L (Swagelok)', '304/304L (Swagelok)', '316 (Parker)'],
      rows: [
        { cells: ['200 °F (93 °C)', '1.00', '1.00', '1.00'] },
        { cells: ['400 °F (204 °C)', '0.96', '0.93', '0.97'] },
        { cells: ['600 °F (315 °C)', '0.85', '0.82', '0.85'], highlight: true },
        { cells: ['800 °F (426 °C)', '0.80', '0.76', '0.80'] },
        { cells: ['1000 °F (537 °C)', '0.76', '0.69', '0.77'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Worked examples:</p><ul><li>1/2" × 0.035" 316 at 1,000 °F: 2,600 × 0.76 = 1,976 psig (Swagelok’s own example).</li><li>1/2" × 0.049" 316 at 800 °F: 3,700 × 0.80 = 2,960 psi (Parker’s own example).</li><li>3/8" × 0.049" 316 at 600 °F: 4,800 × 0.85 = 4,080 psig.</li></ul><p>Other alloys derate faster. Swagelok’s factors at 400 °F are 0.91 for 2507 super duplex and 0.74 for 6Mo, and 2507 must not be used above 250 °C (482 °F) at all, because its microstructure changes and it embrittles. Above about 425 °C (800 °F), Parker notes that 300-series stainless can suffer carbide precipitation and intergranular corrosion.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Seamless or welded.', anchor: 'welded' },
    {
      type: 'prose',
      html: '<p>Welded-and-drawn tube is acceptable for compression fittings, but it is derated: Swagelok multiplies the seamless rating by <strong>0.85 for double-welded</strong> and <strong>0.80 for single-welded</strong> tube, and Parker publishes a separate welded table (the right-hand column above). So 1/2" × 0.049" double-welded tube is good for about 3,700 × 0.85 = 3,145 psig. We stock 304 and 316 in both seamless (ASTM A269 / A213) and welded (ASTM A269 / A270, 3-A) forms; the welded tube is often chosen for sanitary and low-pressure process duty, the seamless for high-pressure instrument lines.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Hardness and finish decide whether it seals.', anchor: 'hardness' },
    {
      type: 'prose',
      html: '<ul><li><strong>Fully annealed, softer than the fitting.</strong> The ferrules must be able to deform the tube surface. Swagelok specifies stainless tube no harder than 90 HRB (200 HV) and has tested its fittings to that limit. Parker treats 90 HRB as the ASTM maximum and recommends 80 HRB or less, particularly for gas — its sample purchase order reads “fully annealed, 80 Rb or less”.</li><li><strong>OD tolerance.</strong> Swagelok’s requirement for small tube is tight — no more than ±0.003" on 1/16" OD.</li><li><strong>Ovality.</strong> Some austenitic tube is allowed an ovality of twice the OD tolerance, which may not fit precision fittings. Never force an oval tube into a fitting.</li><li><strong>Surface.</strong> Scratches, dents and raised marks where the ferrule sits are leak paths, and the larger the tube the more likely a defect lands under the ferrule. Low-density gases such as helium and argon cannot be sealed on damaged tube.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Gas service needs heavier wall.',
      body: 'Heavy-wall tube resists the ferrules, so they coin out small surface imperfections as they swage. Thin-wall tube gives way instead and the imperfection stays under the seal. Both makers shade the thin-wall cells in their tables as unsuitable for gas: choose a wall outside them.',
    },

    { type: 'section_head', number: '/05', title: 'Bending, routing and support.', anchor: 'routing' },
    {
      type: 'comparison_table',
      caption: 'Bend radius and support spacing (Parker Bulletin 4200-B4)',
      columns: ['Tube OD', 'Bender radius', 'Support spacing'],
      rows: [
        { cells: ['1/8"', '3/8"', '—'] },
        { cells: ['1/4"', '9/16"', '3 ft (0.9 m)'] },
        { cells: ['3/8"', '15/16"', '3–4 ft (0.9–1.2 m)'] },
        { cells: ['1/2"', '1-1/2"', '3–4 ft (0.9–1.2 m)'], highlight: true },
        { cells: ['3/4"', '2-1/4"', '4 ft (1.2 m)'] },
        { cells: ['1"', '3"', '5 ft (1.5 m)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s support table prints overlapping bands for 3/8"–1/2" (3 ft for 1/4–1/2", 4 ft for 3/8–7/8"); take the shorter where vibration is present. Clamp as close to each bend as possible, and on both sides of it. Unsupported tube vibrates, loosens its fittings and can fatigue through. In long runs, put in U-bends to take expansion and contraction — Parker’s warning is that a strained joint will eventually leak. And allow for stretch: a tube grows by about one tube diameter per 90° bend, which matters when measuring a run before cutting.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing instrument tube',
      branches: [
        { condition: 'What is the maximum working pressure and temperature?', outcome: 'Find the OD and wall whose ambient rating × temperature factor exceeds it, with margin.' },
        { condition: 'Gas, vacuum or liquid?', outcome: 'Gas and vacuum: heavier wall, outside the shaded thin-wall cells, and scratch-free tube.' },
        { condition: 'Seamless or welded?', outcome: 'Seamless for high-pressure instrument lines; welded is derated by 0.85 or 0.80.' },
        { condition: 'Which grade?', outcome: '316/316L for most; 6Mo or 2507 for hot marine air (2507 not above 250 °C); NACE-compliant material for sour service.' },
        { condition: 'Is the tube fully annealed and within hardness?', outcome: 'Stainless no harder than 90 HRB; 80 HRB or less preferred.' },
        { condition: 'Inside the fitting maker’s wall range for that size?', outcome: 'If not, the joint is unrated whatever the tube formula says.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure is 1/4 inch stainless tubing rated for?', answer: '316 seamless 1/4" tube is rated 4,000 psig at 0.028" wall, 5,100 at 0.035", 7,500 at 0.049" and about 10,200 at 0.065", at ambient temperature on the ASME B31.3 basis.' },
        { question: 'What pressure is 1/2 inch stainless tubing rated for?', answer: '316 seamless 1/2" tube is rated 2,600 psig at 0.035" wall, 3,700 at 0.049", 5,100 at 0.065" and 6,700 at 0.083", at ambient temperature.' },
        { question: 'How much does temperature reduce tubing pressure rating?', answer: 'For 316, multiply the ambient rating by about 0.96 at 400 °F, 0.85 at 600 °F, 0.80 at 800 °F and 0.76 at 1,000 °F.' },
        { question: 'Is welded tubing OK for compression fittings?', answer: 'Yes, welded-and-drawn tube is acceptable, but derated: × 0.85 for double-welded and × 0.80 for single-welded.' },
        { question: 'What hardness should stainless instrument tubing be?', answer: 'Fully annealed and no harder than 90 HRB (200 HV); Parker recommends 80 HRB or less, especially for gas service.' },
        { question: 'Why does gas service need thicker wall tubing?', answer: 'Heavier wall resists the ferrules so they coin out minor surface defects as they swage; thin wall yields and leaves the defect under the seal.' },
        { question: 'How often should instrument tubing be supported?', answer: 'Parker gives about 3 ft (0.9 m) for 1/4"–1/2", 4 ft (1.2 m) up to 7/8", 5 ft (1.5 m) for 1" and 7 ft (2.1 m) above, with clamps close to each bend.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Tubing and fittings',
      skus: ['IH-TB-ST6', 'IH-TB-ST6W', 'IH-TB-ST4', 'IH-TB-ST4W', 'IH-TF-AM', 'IH-TF-CF', 'IH-TF-LM'],
    },
    { type: 'category_link', slug: 'stainless-steel-instrumentation-tubing', label: 'Stainless instrumentation tubing', blurb: '304 and 316, seamless and welded, 1/8" to 2" OD.' },
    { type: 'category_link', slug: 'double-ferrule-tube-fittings', label: 'Double ferrule tube fittings', blurb: 'Rated to the tube, up to 12,000 psi on 316.' },
    {
      type: 'related_articles',
      slugs: ['instrumentation-tube-fittings-guide', 'how-to-make-up-a-compression-fitting', 'stainless-tube-fittings-corrosion-gulf', 'compression-fitting-leaks'],
    },
    {
      type: 'standard_citation',
      standard: 'Swagelok MS-01-107',
      publisher: 'Swagelok',
      title: 'Tubing Data',
      clause: 'Tables 3 and 26',
      summary: 'Working pressures for 316 and 304 tube by OD and wall on the ASME B31.3 basis, hardness and tolerance requirements, welded-tube factors and elevated-temperature factors; Parker’s catalogue 4230/4233 gives matching figures.',
      url: 'https://www.swagelok.com/downloads/webcatalogs/en/ms-01-107.pdf',
      edition: 'Rev W, 2023',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, factors and hardness from Swagelok Tubing Data and Parker’s catalogue; bend and support figures from Parker’s installation manual; examples computed.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying tube for a line?',
      body: 'Send the working pressure, temperature, fluid and OD. We will confirm the wall, grade and seamless or welded, and quote the tube with fittings to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
