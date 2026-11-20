import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: facts family oteco-float-valves (listings IH-OTC-FV-PLUNGER, -FLAPPER, -BAFFLE,
 * -KITS, -SPARES: model scheme, size and dimension table, bit-sub table, materials, kit contents, part
 * numbers) and _raw/brochure-review.md section 2 (Oteco float valve brochure) plus the products overview
 * for the interchange statement. The brochure mentions no API, NACE, ABS or DNV approval, so none is made.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'drill-pipe-float-valve-models',
  title: 'Drill pipe float valves: plunger or flapper, models F to GCA, sizes and kits',
  excerpt:
    'A drill pipe float valve stops mud and well fluid flowing back up the string. Oteco makes plunger valves (F, FC, FA) and flapper valves (G, GA, GC, GCA) in ten sizes. How the models differ, how to read the size codes, and what a repair kit actually replaces.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Drill Pipe Float Valve Models: F to GCA',
  seoDescription:
    'Oteco drill pipe float valves compared: plunger models F, FC, FA and flapper models G, GA, GC, GCA, size codes 1R to 6F, baffle plates, repair kits and pullers.',
  focusKeyword: 'drill pipe float valve',
  publishedAt: '2026-11-19T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A float valve sits in a float sub or bit sub above the bit and stops drilling fluid, cuttings and well fluid flowing back up the drill string.',
        'Oteco makes two designs. Plunger valves are Models F, FC and FA; flapper valves are Models G, GA, GC and GCA. The letter A means pressure monitoring and C means automatic fill.',
        'Size is a code, not an inch figure: 1R, 1F-2R, 2F-3R, 3F, 3.5IF, 4R, 4F, 5R, 5F-6R and 6F. R, F and IF refer to the tool-joint type the valve is made for.',
        'Oteco makes its float valves and parts to standard industry dimensions and states they interchange with other major makers’ parts.',
        'Metal repair kits dress a valve three times and rubber kits four times. Pullers remove the valve from its sub.',
      ],
    },
    {
      type: 'lead',
      html: 'Pull a string and a float valve decides whether the stand arrives dry or arrives as a mud shower. The valve itself is small and cheap beside the rest of the bottom hole assembly, yet the model code on it carries four separate decisions: plunger or flapper, automatic fill or not, pressure monitoring or not, and standard or sour gas service. This article explains the Oteco range, how to size a valve to a sub, and which kits and spares go with it. Related check valve principles are covered in <a href="/blog/oilfield-check-valves-explained">oilfield check valves explained</a>.',
    },
    { type: 'section_head', number: '/01', title: 'Plunger or flapper.', anchor: 'designs' },
    {
      type: 'paragraph',
      html: 'In a plunger valve a spring-loaded plunger sits on a seal and lifts off it when pump flow pushes through. In a flapper valve a hinged flap swings open with the flow and closes on a seal when flow stops. Both are one-piece cast bodies, not welded, in ductile iron or low-alloy steel heat treated to 22 HRC or below for sour-gas hardness. Plungers are machined from one solid piece, flappers are case-hardened low-alloy steel, springs are Inconel as standard and seals are nitrile, HNBR or Viton. Oteco gives 0 °F to 450 °F depending on the seal.',
    },
    {
      type: 'paragraph',
      html: 'The two designs do not have the same passage through them. Oteco’s published valve ID shows it: at 3F the plunger Model F has a 1-7/8 in valve ID where the flapper Model G has 1-5/8 in, so check the figures for your size if flow area or tool passage matters. The <a href="/p/oteco-drill-pipe-float-valve-plunger">plunger listing</a> and the <a href="/p/oteco-drill-pipe-float-valve-flapper">flapper listing</a> carry the full size tables.',
    },
    { type: 'section_head', number: '/02', title: 'Reading the model letters.', anchor: 'models' },
    {
      type: 'comparison_table',
      caption: 'Oteco float valve models and the sizes each is offered in',
      columns: ['Model', 'Design', 'What it does', 'Sizes'],
      rows: [
        { cells: ['F', 'Plunger', 'Standard', '1R to 6F'] },
        { cells: ['FC', 'Plunger', 'Automatic fill: a key holds the plunger open while running in, until flow releases it', '2F-3R to 6F'] },
        { cells: ['FA', 'Plunger', 'Pressure monitoring: a port through the plunger lets you read shut-in pressure below the valve', 'All sizes'] },
        { cells: ['G', 'Flapper', 'Standard', '1F-2R to 5F-6R'] },
        { cells: ['GA', 'Flapper', 'Pressure monitoring: tungsten-carbide insert with a 1/4 in orifice in the flapper', '1F-2R to 5F-6R'] },
        { cells: ['GC', 'Flapper', 'Automatic fill with a self-releasing key', '2F-3R to 5F-6R'] },
        { cells: ['GCA', 'Flapper', 'Automatic fill and pressure monitoring', '2F-3R to 5F-6R'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Automatic fill lets the string fill from the annulus while you run in, instead of arriving with a dry pipe that has to be filled from the top. Pressure monitoring gives you a route to read pressure under the valve after it has closed. Standard and sour gas (H2S) service are separate part number families: 4801 and 4802 for standard, 4803 for sour gas. Not every model is made in sour gas trim, so if you need an automatic-fill sour gas flapper, confirm the model and size with us before ordering.',
    },
    { type: 'section_head', number: '/03', title: 'Sizing to the sub.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'The size code refers to the tool-joint family. R is regular, F is full hole and IF is internal flush, so 4R fits a 4-1/2 in API Regular connection and 4F a 4-1/2 in full hole one. Oteco publishes a tool joint guide covering fifteen joint types. As a start, its bit-sub table pairs 1R with a 2-3/8 in thread, 1F-2R with 2-7/8 in, 2F-3R with 3-1/2 in, 4R with 4-1/2 in and 5R with 5-1/2 in, all API Regular.',
    },
    {
      type: 'comparison_table',
      caption: 'Selected Oteco float valve dimensions, inches',
      columns: ['Size', 'Valve diameter D', 'Recess diameter R', 'Length L', 'Valve ID, Model F', 'Valve ID, Model G'],
      rows: [
        { cells: ['1F-2R', '1-29/32', '1-15/16', '6-1/4', '1-1/4', '1'] },
        { cells: ['2F-3R', '2-13/32', '2-7/16', '6-1/2', '1-9/16', '1-1/4'] },
        { cells: ['4R', '3-15/32', '3-1/2', '8-5/16', '2-5/16', '1-31/32'] },
        { cells: ['4F', '3-21/32', '3-11/16', '12', '2-1/2', '2-3/16'] },
        { cells: ['5F-6R', '4-25/32', '4-13/16', '11-3/4', '3-1/4', '2-7/8'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The recess in the sub follows Oteco’s rule: recess depth A is the valve length L plus the tool-joint pin length plus 1/4 in of clearance. Ignore the baffle recess dimension T if it is the same as or smaller than the tool-joint ID. If you are cutting a new sub, send us the connection and we send the drawing.',
    },
    { type: 'section_head', number: '/04', title: 'Baffle plates, kits and pullers.', anchor: 'spares' },
    {
      type: 'paragraph',
      html: '<a href="/p/oteco-float-valve-baffle-plates">Baffle plates</a> sit below the valve to catch dropped balls and darts and give survey tools a landing seat. Oteco makes ring and spider types for use on the bit, in a tool joint or in a float sub, and each part number gives the connection, float valve size and plate OD. The valve is serviced with <a href="/p/oteco-float-valve-repair-kits">repair kits</a>, which come in two kinds for each design:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Rubber kit F</strong> (F, FC, FA): eight side seals and two valve seals. <strong>Metal kit F</strong>: plunger valve, seal disc, valve guide and three springs.</li><li><strong>Rubber kit G</strong> (G, GA, GC, GCA): eight side seals, a shock absorber, a seal retainer and two valve seals. <strong>Metal kit G</strong>: flapper valve, three spring assemblies, three hinge pins and a seal retainer.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Oteco states that a metal kit is good for three dressings and a rubber kit for four. Individual parts such as hinge pins, springs and seals are also listed on the <a href="/p/oteco-float-valve-spare-parts-pullers">spare parts and pullers listing</a>, along with the puller assemblies that remove the valve from the sub. Kits and pullers are specific to the model, size and service, so quote the assembly part number from the valve or your record and we match the kit.',
    },
    { type: 'section_head', number: '/05', title: 'Interchange, and what to send.', anchor: 'order' },
    {
      type: 'paragraph',
      html: 'Oteco states that its float valves and replacement parts are made to standard industry dimensions and are interchangeable with other major manufacturers’ parts. It does not name the makers, and neither do we. Practical advice: do not mix parts from different makers inside one valve unless you have checked the fit, and when in doubt send the size, model and service. The range is described in <a href="/blog/oteco-drilling-equipment-guide">our Oteco drilling equipment guide</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What do the letters A and C mean in a float valve model?',
          answer: 'A means pressure monitoring: the plunger has a port, or the flapper has a carbide insert with a 1/4 in orifice, so you can read pressure below the valve. C means automatic fill: a key holds the valve open while running in until flow releases it. GCA has both.',
        },
        {
          question: 'Is there a flapper valve in 6F?',
          answer: 'Not in Oteco’s published range. Flapper Models G and GA run from 1F-2R to 5F-6R and GC and GCA from 2F-3R to 5F-6R. The 6F size is a plunger valve.',
        },
        {
          question: 'How many times can a float valve be redressed?',
          answer: 'Oteco states that metal repair kits dress a valve three times and rubber kits four times. Replace the valve if the body is damaged.',
        },
        {
          question: 'Which seal material should I choose?',
          answer: 'Oteco offers nitrile, HNBR and Viton seals, with a temperature range of 0 °F to 450 °F depending on the seal. Tell us the well fluid and temperature and we confirm the assembly.',
        },
        {
          question: 'Do I need a baffle plate?',
          answer: 'If you run balls, darts or survey tools through the string, a baffle plate below the valve protects it and provides a seat. Choose by connection and float valve size.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco float valves, kits and spares',
      skus: ['IH-OTC-FV-PLUNGER', 'IH-OTC-FV-FLAPPER', 'IH-OTC-FV-BAFFLE', 'IH-OTC-FV-KITS', 'IH-OTC-FV-SPARES'],
    },
    { type: 'category_link', slug: 'oilfield-float-valves', label: 'Oilfield float valves', blurb: 'Plunger and flapper float valves, baffle plates, repair kits and pullers.' },
    {
      type: 'related_articles',
      slugs: ['oilfield-check-valves-explained', 'oteco-drilling-equipment-guide', 'cementing-and-drilling-fluid-equipment', 'ram-vs-annular-bop'],
    },
    {
      type: 'cta_block',
      heading: 'Need a float valve or a kit?',
      body: 'Send the size code, model and service, or the assembly part number from the valve. We are an authorised Oteco distributor for the Middle East, keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
