import type { BlogArticleSeed } from '../shared'

/**
 * Oteco Model 72 vs DM mud gate valves. Sources: _faq/facts/oteco-gate-valves.json (listings
 * IH-OTC-M72-2/3/4/5 and IH-OTC-DM-2/3/4/5: ratings, trims, shell-test tables, model schemes, dimensions),
 * oteco-gate-valve-spares.json (kit contents, interchange statements) and _raw/brochure-review.md sections 1
 * (Oteco DM brochure), 4 (Oteco Model 72 brochure) and 8 (Oteco products overview: Cameron Type 'S' statement).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'model-72-vs-dm-gate-valve',
  title: 'Model 72 or DM: choosing an Oteco mud gate valve',
  excerpt:
    'Oteco makes two mud gate valves. The Model 72 is a rising-stem valve to 5,000 psi with body subs for its ends and a published Cameron Type ‘S’ parts interchange. The DM reaches 7,500 psi and rebuilds in line. How they differ, how to read their model numbers, and which one to specify.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Model 72 or DM Mud Gate Valve: Oteco',
  seoDescription:
    'Oteco Model 72 or DM mud gate valve: pressure classes, body design, trims, model number codes and repair kits compared, and how to choose for mud service.',
  focusKeyword: 'mud gate valve',
  publishedAt: '2026-11-19T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The Model 72 is rated 2,000, 3,000 and 5,000 psi in 2 to 5 inches. The DM covers 2,000 to 7,500 psi in the same sizes. If you need 7,500 psi, the DM is the Oteco valve.',
        'On the Model 72 the end connections screw into the body as subs, so one body can be threaded, butt-weld, union or flanged. Oteco states that Model 72 parts interchange with Cameron Type ‘S’ Flex-Seal parts.',
        'Oteco publishes no interchange for the DM. We match DM parts by Oteco part number or DM model number.',
        'The two valves have separate repair kits and parts lists. A minor kit is not the same item in both: Model 72 minors renew the gate packing, DM minors renew the gate, seat and bonnet seal.',
        'Read the model number first. It gives the size and the pressure class, and it picks the kit.',
      ],
    },
    {
      type: 'lead',
      html: 'Both valves are built for drilling mud, standpipe and manifold service, both are repaired in line, and both are made by Oteco in Houston. They are not the same valve. Which one you hold decides the kit, the subs and the pressure you can run, so it is worth knowing how to tell them apart before you order.',
    },

    { type: 'section_head', number: '/01', title: 'The Model 72: a rising-stem valve with body subs.', anchor: 'model-72' },
    {
      type: 'paragraph',
      html: 'The Model 72 is a rising-stem gate valve with a one-piece forged gate and stem. Because the stem rises with the gate, you can see from across the manifold whether it is open, part open or closed. Large ball bearings and heavy stem threads keep the handwheel load down at full pressure, and interlocking gate packings and wear plates seal the gate and protect the body. Bonded packings, with the wear plates moulded in, are an option. The valves are rated from −20 °F to 250 °F.',
    },
    {
      type: 'paragraph',
      html: 'The distinctive feature is the body sub. The end connections screw into the body, so a valve moves from line pipe thread to butt weld, union or flange by changing the two subs, not the body. Oteco makes subs for line pipe, EUE, NUE and casing threads, butt-weld ends, Figure 602, 1002 and 1502 hammer unions made to mate with FMC Weco unions, and API and ASME flanges. The valves are listed by size: <a href="/p/oteco-model-72-gate-valve-2-inch">2 inch</a>, <a href="/p/oteco-model-72-gate-valve-3-inch">3 inch</a>, <a href="/p/oteco-model-72-gate-valve-4-inch">4 inch</a> and <a href="/p/oteco-model-72-gate-valve-5-inch">5 inch</a>. The 5-inch valve is built on the 4-inch body with 5-inch subs at the ends.',
    },

    { type: 'section_head', number: '/02', title: 'The DM: cast alloy body, up to 7,500 psi.', anchor: 'dm' },
    {
      type: 'paragraph',
      html: 'The DM is described by Oteco as a low-cost, in-line repairable gate valve for water, oil and gas service in mud, standpipe and production manifolds. It has a high-strength weldable cast alloy body and bonnet, a corrosion-resistant gate and stem, high-strength steel seat inserts and 90-durometer main seals. Studs and nuts are zinc-chromate plated with extended thread engagement. Its trim options are standard (SD), stainless (SS), sour gas (SG, H2S), cold service (CS) and high pressure (HP, 7,500 psi). The sour gas and cold-service trims use HNBR seats, which extend the lower temperature limit to −40 °F. The valves are listed by end-connection size: <a href="/p/oteco-dm-gate-valve-2-inch">2 inch</a>, <a href="/p/oteco-dm-gate-valve-3-inch">3 inch</a>, <a href="/p/oteco-dm-gate-valve-4-inch">4 inch</a> and <a href="/p/oteco-dm-gate-valve-5-inch">5 inch</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Side by side.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Oteco Model 72 and DM compared (from the Oteco brochures)',
      columns: ['Feature', 'Model 72', 'DM'],
      rows: [
        { cells: ['Pressure classes', '2,000, 3,000 and 5,000 psi', '2,000, 3,000, 5,000 and 7,500 psi'] },
        { cells: ['Sizes', '2, 3, 4 and 5 in', '2, 3, 4 and 5 in end connections'] },
        { cells: ['End connections', 'Body subs: change the subs, keep the body', 'Threaded, butt-weld, hammer-union (Fig. 1002, 1502) and API flange options'] },
        { cells: ['Stem', 'Rising, one-piece forged gate and stem', 'Corrosion-resistant gate and stem'] },
        { cells: ['Service trims', 'Standard, sour gas (H2S), waterflood', 'Standard, stainless, sour gas (H2S), cold service, high pressure'] },
        { cells: ['Temperature', '−20 °F to 250 °F', '−20 °F to 250 °F; −40 °F with HNBR seats'] },
        { cells: ['Minor kit', 'Gate packings, wear plates, O-rings', 'Gate, seat, bonnet seal'] },
        { cells: ['Published interchange', 'Cameron Type ‘S’ Flex-Seal parts', 'None published'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Cameron and Weco are trademarks of their owners. A published interchange is Oteco’s statement, so we still check the model and Oteco part number before we confirm a part.',
    },

    { type: 'section_head', number: '/04', title: 'Reading the model number.', anchor: 'codes' },
    {
      type: 'paragraph',
      html: 'Model 72 numbers start with GV, then a size digit, then two digits for the class: 24 is 2,000 psi, 36 is 3,000 and 50 is 5,000. A GV436 is a 4-inch, 3,000 psi valve; a GV550 is a 5-inch, 5,000 psi valve on the 4-inch body. Oteco parts lists drop the GV (224, 236, 550), and the 236 and 250 share most parts, as do the 336 and 350.',
    },
    {
      type: 'paragraph',
      html: 'DM numbers use two digits. The first is the end-connection size in inches and the second the pressure class: 2 is 2,000 psi, 3 is 3,000, 5 is 5,000 and 8 is 7,500. A DM 45 is a 4-inch, 5,000 psi valve. Where a part name carries two sizes, such as 3X2 or 4X5, they are the body size and the end-connection size, so a DM 48 sold as 4X5 is a 4-inch body with 5-inch ends. DM kits are listed by body: DM25 for models 22, 23 and 25; DM35 for the 35; DM38 HP for the 28 and 38; DM45 for the 45 and 55; DM48 HP for the 48 and 58.',
    },

    { type: 'section_head', number: '/05', title: 'Choosing between them.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<ul><li><strong>You need 7,500 psi:</strong> the DM. The Model 72 stops at 5,000 psi, and a DM at 7,500 psi with flanged ends uses 10,000 psi ring-joint flanges.</li><li><strong>You hold or plan to hold Cameron Type ‘S’ valves:</strong> the Model 72, because that is the Oteco valve with a published parts interchange.</li><li><strong>The end connection may change:</strong> the Model 72, since the subs change and the body stays.</li><li><strong>Corrosive injection water:</strong> the Model 72 lists a waterflood version with stainless trim. The DM has stainless and cold-service trims of its own.</li><li><strong>Replacing what is in the line:</strong> match the installed valve. Do not change family to save a kit.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The end connection can set the rating.',
      body: 'A valve is only as strong as its end connection. On the 4-inch GV450, a line pipe end has a shell test of 7,500 psi, against 10,000 psi for a butt-weld Sch. XXS or flanged end, and Sch. 80 butt weld is not recommended at that class. Check the end connection against the working pressure before you quote a valve.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I tell a Model 72 from a DM on site?', answer: 'Read the nameplate. A GV number such as GV436 is a Model 72; a two-digit DM number such as DM 45 is a DM. If the nameplate is unreadable, send us the size, end connections and a photo.' },
        { question: 'Can a DM kit go in a Model 72?', answer: 'No. They have separate kits and parts lists, with their own Oteco part numbers. Order the kit listed for the valve’s family and model.' },
        { question: 'Does Oteco publish a DM interchange?', answer: 'No. Oteco states an interchange for the Model 72 only, with Cameron Type ‘S’ Flex-Seal parts. DM parts are matched by Oteco part number or DM model.' },
        { question: 'Do the valves come in sour gas trim?', answer: 'Yes, both list sour gas (H2S) trims. The Model 72 uses stainless gates, wear plates and stem packing rings with low-temperature nitrile packings; the DM uses HNBR seats. Say what service you run when you order.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Model 72 and DM valves and kits',
      skus: ['IH-OTC-M72-2', 'IH-OTC-M72-4', 'IH-OTC-DM-2', 'IH-OTC-DM-4', 'IH-OTC-M72-KITS', 'IH-OTC-DM-KITS'],
    },
    { type: 'category_link', slug: 'oilfield-gate-valves', label: 'Gate valves', blurb: 'Oteco Model 72 and DM mud gate valves, 2 to 5 inch.' },
    { type: 'category_link', slug: 'gate-valve-repair-kits', label: 'Gate valve repair kits and parts', blurb: 'Minor and major kits, subs and spares for mud gate valves.' },
    {
      type: 'related_articles',
      slugs: ['rebuilding-a-model-72-gate-valve', 'mud-gate-valve-repair-kits', 'oteco-drilling-equipment-guide', 'hammer-union-figure-numbers', 'shear-pin-vs-reset-relief-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Specifying a mud gate valve?',
      body: 'Send the size, pressure, end connections and service, or the Oteco part number. We keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
