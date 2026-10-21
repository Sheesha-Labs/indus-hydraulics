import type { BlogArticleSeed } from '../shared'
import { TRI_CLAMP_SECTION } from '../diagrams'
import { stockList } from '../products'

/**
 * Sanitary tri-clamp fittings. Sources read 2026-10-21: Alfa Laval "Tubes and Fittings Introduction" (clamp
 * dimensions by tube OD, wall 0.065" to 3" and 0.083" at 4", clamp pressure table 13MHHM / 13MHHS / A13MHP at
 * 70 and 250 °F, gasket table, 316L chemistry, controlled sulphur 0.005–0.017 % on BPE weld ends, Ra < 0.8 µm
 * hygienic per 3-A 33-01); Dixon Sanitary "Sanitary Fittings Identification" (20° clamp taper, symmetrical
 * ferrules, pipe-size vs tube-size flanges, DIN 11851 / SMS / IDF / RJT / bevel seat / I-Line thread and clamp
 * forms); Steel & O'Brien clamp rating sheet (assumptions: elastomer gasket, wing nut 25 in·lb, no water hammer;
 * "PTFE gaskets are not recommended for use with 13MHP clamps") and BPE fittings specification (SF table, sulphur);
 * VNE fittings catalogue (13MHHM 4" 200 psi, the one maker that differs); 3-A SSI history; 3-A 63-04 scope
 * (excludes the clamps); 21 CFR 177.2600; Alfa Laval DIN 32676 / ISO 2852 ferrule pages (A = 50.5 mm).
 * NOT used: dead-leg L/D figures (secondary sources only), delta ferrite limits, EHEDG class detail, any Gulf
 * market claim.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sanitary-tri-clamp-fittings-guide',
  title: 'Sanitary tri-clamp fittings: sizes, clamps, gaskets, finishes and pressure ratings',
  excerpt:
    'A tri-clamp joint is two identical ferrules, a gasket and a clamp — and almost every problem with one comes from treating it as simpler than that. How clamp sizes map to tube OD (and why a 1" and a 1½" ferrule share a clamp), what the clamp is really rated for, which gasket survives steam, CIP or fat, what 3-A and ASME BPE actually cover, and how the other hygienic unions differ.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Tri-Clamp Sanitary Fittings: Sizes, Gaskets & Pressure Ratings',
  seoDescription:
    'Sanitary tri-clamp fittings explained: clamp sizes by tube OD, the shared 1"/1½" flange, clamp pressure ratings by size and temperature, EPDM vs FKM vs silicone vs PTFE gaskets, 3-A and ASME BPE finishes, 304 vs 316L.',
  focusKeyword: 'tri clamp fittings',
  publishedAt: '2026-10-21T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Sanitary tube is sized by its actual outside diameter: 2" sanitary tube is 2.000" OD, a 2" pipe is 2.375" — and their clamp ferrules do not mate.',
        'Clamp flanges are shared: ½" and ¾" use one mini flange (about 25 mm), and 1" and 1½" both use the 1.984" (50.5 mm) flange — the same one as DIN 32676 DN25 and ISO 2852 38 mm.',
        'The pressure rating belongs to the whole clamped joint. A standard 1–1½" heavy-duty clamp is rated 500 psi at 70 °F and 300 psi at 250 °F by Alfa Laval and Steel & O’Brien; larger sizes are rated lower.',
        'Choose the gasket for the process: EPDM for steam and alkaline CIP but poor with fats and oils; FKM and Buna-N for oils and fats; silicone for heat; PTFE for chemicals, with a lower temperature limit because it cold-flows.',
        '3-A 63 covers the fittings up to the gasket, not the clamps; ASME BPE adds 316L, controlled sulphur on weld ends and surface finishes down to 15 µin Ra.',
      ],
    },
    {
      type: 'lead',
      html: 'Walk through any dairy, brewery, juice plant or pharmaceutical suite and the pipework comes apart by hand: a hinged clamp, a wing nut, two polished flanges and a white gasket. That is the tri-clamp joint, and it exists because a hygienic line has to be opened, inspected and cleaned without leaving anywhere for product to lodge. This guide covers how the joint works, how its sizes are counted, what it is rated for, and the choices — gasket, grade, finish — that decide whether it stays clean and tight.',
    },

    { type: 'section_head', number: '/01', title: 'How the joint seals.', anchor: 'joint' },
    {
      type: 'prose',
      html: '<p>A clamp connection is three parts. Two <strong>ferrules</strong> — short lengths of tube with a flange on one end — are welded to the tube ends. A <strong>gasket</strong> sits between the flange faces. A <strong>clamp</strong> closes over the outside of both flanges. Dixon draws the flange back faces with a <strong>20° taper</strong> on sizes from 1" to 12", and notes that the flanges are symmetrical: there is no male and no female ferrule, so any two of the same size mate. Closing the clamp rides it down the tapers, which pulls the ferrules together and squeezes the gasket.</p><p>The bore of the ferrule matches the bore of the tube, and the gasket sits flush with it, so the inside of the joint is smooth — no thread, no recess, no ledge for product or bacteria to collect. That, more than speed of assembly, is why hygienic plants use it.</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'A clamp joint in section. The ferrules are butt-welded to the tube ends; the clamp bears on the tapered back faces of the flanges and drives them together onto the gasket. The bore stays flush with the tube through the joint.',
      alt: 'Cross-section of a sanitary clamp joint. Two tubes are butt-welded to two identical flanged ferrules. A dark gasket sits between the ferrule faces, flush with the tube bore. A clamp hugs the tapered outer faces of both flanges. Notes say that the bore stays flush with the tube, leaving no crevice for product, and that tightening the clamp on the tapered faces pulls the ferrules together and squeezes the gasket.',
      svg: TRI_CLAMP_SECTION,
    },

    { type: 'section_head', number: '/02', title: 'Sizes: tube OD, and the shared flanges.', anchor: 'sizes' },
    {
      type: 'prose',
      html: '<p>Sanitary fittings are sized by the <strong>outside diameter of the tube</strong>, not by nominal pipe size. A 2" sanitary tube measures 2.000" across; a 2" pipe measures 2.375". Dixon publishes a separate series of pipe-size clamp ferrules, and for the same nominal size the flange is different — a 2" pipe-size ferrule has a 3.047" flange, a 2" tube ferrule a 2.516" one — so a "2-inch" tube clamp and a "2-inch" pipe clamp do not fit each other. Always say which you mean.</p><p>The clamp size is set by the <em>flange</em>, and two pairs of tube sizes share one. Alfa Laval and Dixon both show it:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Inch sanitary tube and clamp flange (Alfa Laval Tri-Clamp dimensions)',
      columns: ['Tube OD', 'Wall', 'Tube ID', 'Clamp flange (A)', 'Shares a clamp with'],
      rows: [
        { cells: ['½"', '0.065" (16 ga)', '0.37"', '0.984" (mini)', '¾"'] },
        { cells: ['¾"', '0.065" (16 ga)', '0.62"', '0.984" (mini)', '½"'] },
        { cells: ['1"', '0.065" (16 ga)', '0.87"', '1.984" (50.5 mm)', '1½", DIN 32676 DN25, ISO 2852 38 mm'], highlight: true },
        { cells: ['1½"', '0.065" (16 ga)', '1.37"', '1.984" (50.5 mm)', '1", DIN 32676 DN25, ISO 2852 38 mm'], highlight: true },
        { cells: ['2"', '0.065" (16 ga)', '1.87"', '2.516"', '—'] },
        { cells: ['2½"', '0.065" (16 ga)', '2.37"', '3.047"', '2" pipe-size ferrule'] },
        { cells: ['3"', '0.065" (16 ga)', '2.87"', '3.579"', '—'] },
        { cells: ['4"', '0.083" (14 ga)', '3.87"', '4.682"', '—'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two details catch buyers out. The mini flange is given as 0.984" by Alfa Laval and 0.992" by Dixon — about 25 mm either way — so if you are mixing makers, check before relying on it. And the wall is 0.065" (16 gauge) only up to 3"; from 4" it is 0.083" (14 gauge), and Alfa Laval lists 6" and 8" tube at 0.109".</p><h3>Metric clamps</h3><p>In Europe the clamp is DIN 32676 or ISO 2852. The 50.5 mm flange of a DIN 32676 DN25 ferrule (29 × 1.5 mm tube) and an ISO 2852 38 mm ferrule is the same flange as the inch 1" and 1½" — which is why one clamp closes all of them. The tube underneath is not the same, so a metric and an inch ferrule on one clamp still need matching bores to stay hygienic. Alfa Laval notes that DIN 11850 tube was replaced by EN 10357 in 2014, whose series A follows the old DIN sizes and series C follows ASME BPE.</p>',
    },

    { type: 'section_head', number: '/03', title: 'What a clamp is rated for.', anchor: 'pressure' },
    {
      type: 'prose',
      html: '<p>A clamp rating is a rating for the <strong>clamped union</strong> — clamp, two ferrules and gasket together — and it falls with size and temperature. Steel &amp; O’Brien state the assumptions: elastomer gaskets, weld ferrules, a properly aligned joint, wing nuts torqued to 25 in·lb, and no water hammer. They add that the clamp on its own would rate higher, but that figure means nothing without the gasket.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Clamped-union pressure ratings, psi at 70 °F / 250 °F (Alfa Laval and Steel & O’Brien)',
      columns: ['Clamp', '1–1½"', '2"', '2½"', '3"', '4"', '6"'],
      rows: [
        { cells: ['Standard heavy-duty, single pin (13MHHM)', '500 / 300', '450 / 300', '400 / 200', '350 / 195', '300 / 150', '150 / 75'], highlight: true },
        { cells: ['Heavy-duty (13MHHS)', '600 / 300', '550 / 275', '450 / 225', '350 / 175', '300 / 150', '—'] },
        { cells: ['High-pressure bolted (13MHP)', '1,000–1,500 / 800–1,200', '1,000 / 800', '1,000 / 800', '1,000 / 800', '800 / 600', '300 / 200'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Makers do not always agree. For the 1–1½" bolted clamp, Alfa Laval and VNE give 1,500 psi at 70 °F while Steel &amp; O’Brien give 1,000; for the 4" standard clamp, VNE gives 200 psi against the others’ 300. Use the figure of the clamp you are actually fitting. Two maker rules are worth repeating: Alfa Laval recommends only bolted high-pressure clamps above 250 °F, and Steel &amp; O’Brien do not recommend PTFE gaskets in bolted high-pressure clamps. Light-duty hinged clamps (VNE’s EG13 is rated 150 psi at 70 °F) belong on low-pressure gravity and transfer lines.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Water hammer is outside every rating.',
      body: 'Every clamp table assumes no water hammer. A quick-closing valve downstream of a clamped line can spike pressure far above the working figure; size the clamp for the surge, or slow the valve.',
    },

    { type: 'section_head', number: '/04', title: 'Gaskets: choose for the process, not the price.', anchor: 'gaskets' },
    {
      type: 'comparison_table',
      caption: 'Tri-clamp gasket materials (Alfa Laval gasket table)',
      columns: ['Gasket', 'Temperature', 'Good with', 'Poor with'],
      rows: [
        { cells: ['EPDM', '−60 to 300 °F (−51 to 149 °C)', 'Steam, hot water, alkaline CIP, acids', 'Fats and oils'], highlight: true },
        { cells: ['FKM (Viton)', '−20 to 350 °F (−29 to 177 °C)', 'Oils, fats, acids', 'Alkalis (poor to good)'] },
        { cells: ['Buna-N (NBR)', '−65 to 200 °F (−54 to 93 °C)', 'Fats and oils, abrasion', 'Higher temperatures'] },
        { cells: ['Silicone', '−40 to 400 °F (−40 to 204 °C)', 'Heat; low compression set', 'Abrasion, oils, alkali'] },
        { cells: ['PTFE', '−40 to 200 °F (−40 to 93 °C)', 'Almost all chemicals, fats, alkalis', 'Cold flow — limits temperature'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Alfa Laval limits PTFE to 200 °F not because the polymer cannot take heat but because it cold-flows and does not compress, so a hot PTFE gasket can creep and leak. Other makers publish different temperature limits for nominally the same materials, so quote the gasket maker’s own figures.</p><p>For food contact in the US the rubber is made to FDA 21 CFR 177.2600, which sets extraction limits for repeated-use rubber articles — for aqueous foods no more than 20 mg/in² in the first seven hours and 1 mg/in² in the next two. For pharmaceutical lines, Alfa Laval offers EPDM, FKM and silicone gaskets with a USP Class VI certificate on request.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which gasket?',
      branches: [
        { condition: 'Steam sterilising or hot alkaline CIP, no fat?', outcome: 'EPDM.', sku: 'IH-PF-SF04G' },
        { condition: 'Dairy cream, edible oils, fats?', outcome: 'FKM (or Buna-N at lower temperature) — not EPDM.' },
        { condition: 'Aggressive chemicals or a mix of products?', outcome: 'PTFE, kept below its temperature limit and not in a bolted high-pressure clamp.', sku: 'IH-PF-SF16G' },
        { condition: 'Hot product, low pressure, frequent opening?', outcome: 'Silicone.' },
      ],
    },

    { type: 'section_head', number: '/05', title: 'Grade, finish and the standards.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<h3>304 or 316L</h3><p>Clamp fittings come in both. Alfa Laval’s chemistry shows the difference: 304 is 18–20% chromium and 8–13% nickel; 316L drops carbon to 0.030% and adds 2–3% molybdenum, which is what resists chlorides — brines, salted products, chlorinated cleaning water. Use 316L on product contact where any of those appear; 304 suits water, beer and general transfer. Do not mix them in one line. See <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316</a>.</p><h3>3-A</h3><p>3-A Sanitary Standards date from dairy equipment in the 1920s; the 3-A Symbol has been licensed since 1956, now with a third-party inspection. The fittings standard, <strong>3-A 63-04</strong>, covers fittings from the connection up to and including the gasket — and explicitly excludes the clamps themselves. Alfa Laval’s hygienic range quotes an internal finish of Ra &lt; 0.8 µm (about 32 µin) to 3-A.</p><h3>ASME BPE</h3><p>For bioprocessing and pharmaceutical lines, ASME BPE sets materials, dimensions, tolerances, marking and finish. BPE fittings are 316L, and their weld ends carry controlled sulphur of 0.005–0.017%, which Steel &amp; O’Brien say improves orbital weld consistency and penetration. Finishes are designated by maximum Ra on product contact:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'ASME BPE product-contact surface designations (maximum Ra)',
      columns: ['Designation', 'Ra max', 'Process'],
      rows: [
        { cells: ['SF1', '20 µin (0.51 µm)', 'Mechanically polished'], highlight: true },
        { cells: ['SF2', '25 µin (0.64 µm)', 'Mechanically polished'] },
        { cells: ['SF3', '30 µin (0.76 µm)', 'Mechanically polished'] },
        { cells: ['SF4', '15 µin (0.38 µm)', 'Mechanically polished and electropolished'] },
        { cells: ['SF5', '20 µin (0.51 µm)', 'Mechanically polished and electropolished'] },
        { cells: ['SF6', '25 µin (0.64 µm)', 'Mechanically polished and electropolished'] },
      ],
    },
    {
      type: 'standard_citation',
      standard: '3-A 63-04',
      publisher: '3-A Sanitary Standards, Inc.',
      title: 'Sanitary Fittings',
      summary:
        'Covers sanitary fittings from the equipment or pipeline connection up to and including the gasket, O-ring or seal. It does not cover the clamps, recessed ferrules attached by expansion or soldering, or rolled-on fittings; fittings on hose assemblies come under 3-A 62.',
    },

    { type: 'section_head', number: '/06', title: 'The fittings, and the other hygienic unions.', anchor: 'range' },
    {
      type: 'prose',
      html: '<p>A clamp system is built from a small set of shapes: weld ferrules (short, long, recessless and tank-weld), clamp-end and weld-end 45° and 90° elbows, tees and reducing tees, concentric and eccentric reducers, end caps, and adapters to NPT thread or to hose. BPE elbows are drawn on a centreline radius of 1.5 × tube OD.</p><p>Clamps are not the only hygienic union, and the others do not interchange with them or with each other:</p><ul><li><strong>Bevel seat</strong> — a plain and a threaded bevel-seat ferrule drawn together by a hex nut on an Acme thread; long used on North American dairy.</li><li><strong>I-Line</strong> — male and female ferrules held by a 37° clamp (30° on 6–8"); its flanges are not tri-clamp sizes.</li><li><strong>DIN 11851</strong> — the German dairy union with a round slotted nut, for DIN 11850 tube.</li><li><strong>SMS 1145, IDF (ISO 2853) and RJT</strong> — Swedish, international and British dairy unions, each with its own thread form.</li></ul>',
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Every sanitary listing in 304 and 316 stainless — clamp-end and weld-end fittings, ferrules, bevel-seat and I-Line parts, adapters, gaskets, tube hangers and sanitary tube:</p>' + stockList(['stainless-steel-sanitary-fittings']),
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size is a 1.5" tri-clamp?', answer: 'A 1½" sanitary tube is 1.5" OD with a 1.984" (50.5 mm) clamp flange — the same flange as a 1" ferrule, so one 1–1½" clamp fits both.' },
        { question: 'Is a 2" tri-clamp the same as a 2" pipe clamp?', answer: 'No. Sanitary tube is sized by OD (2.000"), pipe by nominal size (2.375" OD). A 2" tube ferrule has a 2.516" flange and a 2" pipe-size ferrule a 3.047" one; they do not mate.' },
        { question: 'What pressure can a tri-clamp hold?', answer: 'It depends on size, clamp type and temperature. A standard 1–1½" heavy-duty clamp is rated about 500 psi at 70 °F and 300 psi at 250 °F; 4" about 300 / 150 psi; bolted high-pressure clamps 800–1,500 psi. Use the clamp maker’s own table.' },
        { question: 'Which tri-clamp gasket is best for steam?', answer: 'EPDM is the usual choice for steam and alkaline CIP. It is poor with fats and oils, where FKM is used instead.' },
        { question: 'Can I use PTFE tri-clamp gaskets?', answer: 'Yes, for chemical resistance, but PTFE cold-flows: Alfa Laval limits it to about 200 °F, and Steel & O’Brien do not recommend it in bolted high-pressure clamps.' },
        { question: 'Are tri-clamp fittings 3-A approved?', answer: 'Fittings can be made to 3-A 63-04, which covers fittings up to and including the gasket. The clamps themselves are outside that standard.' },
        { question: 'What does SF1 mean on a sanitary fitting?', answer: 'An ASME BPE surface designation: mechanically polished product-contact surface, maximum 20 µin (0.51 µm) Ra. SF4 is electropolished to 15 µin.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Sanitary fittings',
      skus: ['IH-PF-SF16CSF16', 'IH-PF-SF16C90E', 'IH-PF-SF16CT', 'IH-PF-SF16CR', 'IH-PF-SF16SC', 'IH-PF-SF04G', 'IH-PF-SF16G', 'IH-PF-SNT6'],
    },
    { type: 'category_link', slug: 'stainless-steel-sanitary-fittings', label: 'Sanitary fittings', blurb: 'Clamp and weld-end fittings, ferrules, gaskets and sanitary tube in 304 and 316.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'alfa-laval-tubes', text: 'Alfa Laval. Tubes and Fittings Introduction (installation material product leaflet).', url: 'https://www.alfalaval.com/globalassets/documents/products/fluid-handling/installation-material/alfa-laval-installation-material---product-leaflet---ese00301.pdf' },
        { id: 'dixon-id', text: 'Dixon Sanitary. Sanitary Fittings Identification (2014).', url: 'https://dixonvalve.com/sites/default/files/downloadable_resources/product_literature/fittings%20identification_2014.pdf' },
        { id: 'sob-clamps', text: 'Steel & O’Brien. Stainless Steel Sanitary Clamp — Temperature/Pressure Ratings.', url: 'https://www.steelobrien.com/wp-content/uploads/2020/06/SOB-Clamp-Ratings.pdf' },
        { id: 'sob-bpe', text: 'Steel & O’Brien. BPE Fittings Specifications.', url: 'https://www.steelobrien.com/wp-content/uploads/2020/06/BPE-Fittings-Submittal-Documentation.pdf' },
        { id: 'cfr-177-2600', text: 'US Code of Federal Regulations, 21 CFR 177.2600 — Rubber articles intended for repeated use.', url: 'https://www.law.cornell.edu/cfr/text/21/177.2600' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['304-vs-316-stainless-steel-fittings', 'stainless-steel-pipe-fittings-guide', 'stainless-steel-butt-weld-fittings', 'stainless-hose-barbs-and-push-on-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Dimensions, clamp ratings, gasket data and BPE finishes from Alfa Laval, Dixon, Steel & O’Brien and VNE literature; standards scope from 3-A SSI. Maker figures differ in places and are quoted as such.',
    },
    {
      type: 'cta_block',
      heading: 'Building a hygienic line?',
      body: 'Send the tube OD, grade, product, cleaning regime and temperature. We will quote ferrules, fittings and the gasket material to suit, and clamps sized for the pressure.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
