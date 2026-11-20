import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: facts family oteco-manifold-fittings (listing descriptions with Oteco’s
 * maximum working / test pressure table by end connection; variant rows for part numbers, ends and
 * ratings; IH-OTC-CONNECTOR for the OTECO Connector and its Grayloc interchange statement) and
 * _raw/brochure-review.md section 5 (Oteco manifold fittings brochure: styles, model codes, materials,
 * test rule, weld-end bevel). No API, NACE or other approval is claimed; the brochure names none.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'manifold-fitting-pressure-ratings',
  title: 'Long-sweep manifold fittings: why the end connection sets the rating',
  excerpt:
    'A long-sweep tee or ell is a casting, but its working pressure depends on how it is joined to the line. Oteco rates the same casting at 2,000 to 5,000 psi by pipe schedule or thread. How to read the table, choose an end and avoid a weak link.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Manifold Fittings: End Connection Ratings',
  seoDescription:
    'Why the end connection sets the working pressure of long-sweep manifold fittings: Oteco ratings by Sch. 40, 80, 120, 160, XXS and line pipe ends.',
  focusKeyword: 'manifold fittings',
  publishedAt: '2026-11-19T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Oteco’s long-sweep manifold fittings are castings in 2 in to 5 in (with 6 in on request) for pump discharge, standpipe and choke and kill manifolds.',
        'The working pressure belongs to the fitting with its end connection, not to the casting alone. The same 4 in tee is rated 3,000 psi with line pipe threads and 5,000 psi with Sch. 160 or XXS weld ends.',
        'Oteco publishes a working and test pressure for Sch. 40, 80, 120, 160, XXS and API line pipe ends. The weld end must match the pipe schedule you are welding to, or the joint is limited by the pipe.',
        'Fittings with mixed ends are rated at the lower of the two. Always confirm the rating from the part number.',
        'Every fitting is hydrostatically tested to at least 1.5 times working pressure, and sour gas (H2S) service is available on all of them.',
      ],
    },
    {
      type: 'lead',
      html: 'Specify a manifold tee by size and style and you have only described its shape. The pressure it can carry depends on a third thing: what is on the ends. A butt weld end is only as strong as the pipe it is welded to, and a threaded end is only as strong as its thread. Oteco’s published table makes this explicit. This article explains how to read it. For the wider circuit these fittings sit in, see <a href="/blog/flow-iron-explained">flow iron explained</a>.',
    },
    { type: 'section_head', number: '/01', title: 'What the casting is.', anchor: 'casting' },
    {
      type: 'paragraph',
      html: 'Long-sweep fittings have a gentle radius through every turn, so abrasive mud flows with less erosion and pressure loss than through a short-radius fitting. Oteco casts them in ASTM A216 Grade WCC for the 2 in to 5 in 5,000 psi fittings and in A487 Grade 4D modified for the 5 in 7,500 and 8,000 psi extra-heavy-wall fittings. They are machined in single chuckings on horizontal machining centres. Butt weld ends have a 37.5° bevel and match ASME B36.10 outside and inside diameters, and line pipe threads are cut in the 2 in, 3 in and 4 in sizes.',
    },
    {
      type: 'paragraph',
      html: 'The styles are the <a href="/p/oteco-long-sweep-full-flow-crosses">full flow cross</a>, <a href="/p/oteco-long-sweep-full-flow-tees">full flow tee</a>, <a href="/p/oteco-long-sweep-tees">long-sweep tee</a>, <a href="/p/oteco-long-sweep-y-fittings">Y</a>, <a href="/p/oteco-45-degree-long-sweep-ells">45° ell</a>, <a href="/p/oteco-90-degree-long-sweep-ells">90° ell</a>, the 90° ell with a 2 in outlet, and the standpipe goosenecks at <a href="/p/oteco-160-degree-standpipe-goosenecks">160°</a> and 180° with or without a top outlet. The model code gives the leg sizes: 555T is a 5 in tee and 424L90 is a 4 in ell with a 2 in outlet.',
    },
    { type: 'section_head', number: '/02', title: 'The rating table.', anchor: 'table' },
    {
      type: 'paragraph',
      html: 'Oteco publishes one table that applies across the range. Each cell is working pressure over test pressure, in psi, for the fitting with that end connection.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco maximum working / test pressure by end connection, psi',
      columns: ['Size', 'Sch. 40', 'Sch. 80', 'Sch. 120', 'Sch. 160', 'Sch. XXS', 'API line pipe'],
      rows: [
        { cells: ['2 in', '2,000 / 4,000', '3,000 / 6,000', 'Not listed', '5,000 / 7,500', '5,000 / 10,000', '5,000 / 10,000'] },
        { cells: ['3 in', '2,000 / 4,000', '3,000 / 6,000', 'Not listed', '5,000 / 7,500', '5,000 / 10,000', '3,000 / 6,000'] },
        { cells: ['4 in', '2,000 / 3,000', '3,000 / 4,500', '4,000 / 6,000', '5,000 / 7,500', '5,000 / 10,000', '3,000 / 6,000'] },
        { cells: ['5 in', '2,000 / 3,000', '3,000 / 4,500', '4,000 / 6,000', '5,000 / 7,500', '5,000 / 10,000', 'Not listed'] },
        { cells: ['5 in 7,500 psi', '-', '-', '-', '-', '7,500 / 11,250', '-'] },
        { cells: ['5 in and 6 in 8,000 psi extra heavy wall', '-', '-', '-', '-', '8,000 / 12,000', '-'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read across a row and the same size moves from 2,000 psi to 5,000 psi. Read down the line pipe column and the 2 in thread is rated higher than the 3 in and 4 in threads. Nothing in the casting changed; the connection did. The 7,500 and 8,000 psi fittings are made in Sch. XXS ends only.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A weld end is not a free upgrade.',
      body: 'A Sch. XXS weld end on the fitting joined to Sch. 80 pipe does not make a 5,000 psi joint. The line is rated by its weakest member. Match the fitting end to the pipe schedule and the pressure the system is designed for.',
    },
    { type: 'section_head', number: '/03', title: 'The same fitting, different ends.', anchor: 'examples' },
    {
      type: 'paragraph',
      html: 'The part numbers show how this plays out. A 4 in long-sweep tee, model 444T, comes as IH-OTC-414011 with line pipe thread ends at 3,000 psi, and as IH-OTC-414013 (Sch. 160) and IH-OTC-414014 (Sch. XXS) at 5,000 psi. The 2 in 222T is IH-OTC-412016 with Sch. 80 ends at 3,000 psi, against IH-OTC-412013 with Sch. 160 ends at 5,000 psi. A mixed-end part follows the lower rating: the 5 in 90° ell IH-OTC-410029, with Sch. XXS weld on one end and a 4 in line pipe thread on the other, is listed at 3,000 psi.',
    },
    {
      type: 'comparison_table',
      caption: 'Example Oteco part numbers showing the end connection setting the rating',
      columns: ['Part number', 'Fitting', 'Ends', 'Working pressure'],
      rows: [
        { cells: ['IH-OTC-414011', '4 in full flow tee 444T', 'Line pipe thread', '3,000 psi'] },
        { cells: ['IH-OTC-414013', '4 in full flow tee 444T', 'Butt weld, Sch. 160', '5,000 psi'] },
        { cells: ['IH-OTC-414014', '4 in full flow tee 444T', 'Butt weld, Sch. XXS', '5,000 psi'] },
        { cells: ['IH-OTC-412016', '2 in full flow tee 222T', 'Butt weld, Sch. 80', '3,000 psi'] },
        { cells: ['IH-OTC-410029', '5 in 90° ell 54L90', 'Butt weld Sch. XXS x 4 in line pipe thread', '3,000 psi'] },
        { cells: ['IH-OTC-417035', '5 in full flow cross 5555X', 'Butt weld, Sch. XXS', '7,500 psi'] },
        { cells: ['IH-OTC-418035', '5 in full flow cross 5555X', 'Butt weld, Sch. XXS', '8,000 psi'] },
      ],
    },
    { type: 'section_head', number: '/04', title: 'Testing and sour service.', anchor: 'test' },
    {
      type: 'paragraph',
      html: 'Oteco hydrostatically tests every fitting to a minimum of 1.5 times working pressure. The table shows the test is higher on some ends: the 2 in Sch. XXS end is tested at twice its working pressure. Sour gas (H2S) service is available on all fittings, and material tensile and chemical certification is available on request. Special ends, such as socket weld or metric, are made on request, and so are 6 in 8,000 psi butt weld ends. Send us the application and we check it with Oteco.',
    },
    { type: 'section_head', number: '/05', title: 'Where flanges and clamps come in.', anchor: 'connectors' },
    {
      type: 'paragraph',
      html: 'Where a manifold must be broken often, or a welded joint is not wanted, a clamp connector does the job of a flange in less space. The <a href="/p/oteco-hub-clamp-connector">OTECO Connector</a> uses two hubs, a clamp and a seal ring, in sizes 1 in to 12 in, and Oteco states it is interchangeable with Grayloc clamp connectors (Grayloc is a trademark of its owner). It is quoted to order. For union connections on the same line see <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>. The full range is on our <a href="/c/mud-manifold-fittings">mud manifold fittings shelf</a>, and an overview is in <a href="/blog/oteco-drilling-equipment-guide">our Oteco guide</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Why does the same 4 in tee have two pressure ratings?',
          answer: 'Because the rating belongs to the fitting with its end connection. Oteco lists a 4 in tee with line pipe threads at 3,000 psi and with Sch. 160 or Sch. XXS weld ends at 5,000 psi.',
        },
        {
          question: 'What is the difference between working pressure and test pressure?',
          answer: 'Working pressure is the pressure the fitting is rated to carry in service. Test pressure is the hydrostatic pressure used at the factory to prove it, at least 1.5 times working pressure on Oteco fittings.',
        },
        {
          question: 'Can I get a 5 in fitting with threaded ends?',
          answer: 'Oteco’s rating table shows no line pipe rating for 5 in, and the fittings in this size are normally butt weld. A few special 5 in threaded parts are listed, so ask us if you need one and we confirm the rating.',
        },
        {
          question: 'Do you supply sour gas fittings?',
          answer: 'Yes. Sour gas (H2S) service is available on all Oteco manifold fittings, and several are listed as separate part numbers for sour gas.',
        },
        {
          question: 'What do I send for a quote?',
          answer: 'The style, size, end connections and the pressure, or the Oteco part number. We confirm the rating, material and delivery, and send the dimension drawing with the quotation.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco long-sweep manifold fittings',
      skus: ['IH-OTC-MF-FFC', 'IH-OTC-MF-LSFFT', 'IH-OTC-MF-LST', 'IH-OTC-MF-LSE90', 'IH-OTC-MF-GSNK160', 'IH-OTC-CONNECTOR'],
    },
    { type: 'category_link', slug: 'mud-manifold-fittings', label: 'Mud manifold fittings', blurb: 'Long-sweep tees, crosses, ells, Y fittings and standpipe goosenecks.' },
    {
      type: 'related_articles',
      slugs: ['flow-iron-explained', 'hammer-union-figure-numbers', 'oteco-drilling-equipment-guide', 'cementing-and-drilling-fluid-equipment'],
    },
    {
      type: 'cta_block',
      heading: 'Building or repairing a manifold?',
      body: 'Send the style, size, end connections and working pressure. We are an authorised Oteco distributor for the Middle East, keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
