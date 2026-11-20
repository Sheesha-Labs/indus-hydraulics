import type { BlogArticleSeed } from '../shared'

/**
 * Rebuilding an Oteco Model 72 gate valve. Sources: _faq/facts/oteco-gate-valve-spares.json (listings
 * IH-OTC-M72-KITS, IH-OTC-M72-SUBS, IH-OTC-M72-PARTS: kit contents, Fits rules, sub types, materials,
 * example part numbers IH-OTC-120012 and IH-OTC-120101), oteco-gate-valves.json (Model 72 trims, shell-test
 * tables, Weco statement from EB-004) and _raw/brochure-review.md section 4 (Oteco Model 72 brochure: kit
 * contents, replacement parts items 1-18, model scheme) and section 8 (Cameron Type 'S' statement).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'rebuilding-a-model-72-gate-valve',
  title: 'Rebuilding a Model 72 gate valve: minor and major kits, body subs and packing',
  excerpt:
    'An Oteco Model 72 is rebuilt in line with a minor kit (gate packings, wear plates, O-rings) or a major kit (the same plus the gate and stem packing). How to choose the kit by model, trim and packing style, when to change body subs, and what to send for the part numbers.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Model 72 Gate Valve Repair Kit Guide',
  seoDescription:
    'Rebuilding an Oteco Model 72 gate valve: minor and major repair kit contents, NBR, sour gas and bonded packing, body subs, and how to order by model.',
  focusKeyword: 'gate valve repair kit',
  publishedAt: '2026-11-19T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A Model 72 minor repair kit holds the gate packings, wear plates and O-rings, the parts that seal the gate. A major kit is the minor kit plus the gate and the stem packing.',
        'Kits are chosen by valve model, not by size alone. The 236 and 250 share a kit, as do the 336 and 350, and the 5-inch valves use the 4-inch kits.',
        'Match the trim: standard nitrile (NBR), stainless inserts, low-temperature nitrile or sour gas (H2S). Match the packing style too: separate wear plates or bonded (BD) packing.',
        'To change a valve’s end connection, change the body subs, not the body.',
        'Oteco states that Model 72 parts interchange with Cameron Type ‘S’ Flex-Seal parts. We still confirm by model and Oteco part number.',
      ],
    },
    {
      type: 'lead',
      html: 'A mud gate valve that weeps at the gate or will not hold on a pressure test is usually a packing and wear-plate job, not a new-valve job. The Model 72 is built to be rebuilt in line, and Oteco sells the parts in three tiers: kits, body subs and individual spares. Knowing which tier you need, and which part number inside it, is most of the work.',
    },

    { type: 'section_head', number: '/01', title: 'What is inside a minor and a major kit.', anchor: 'kits' },
    {
      type: 'paragraph',
      html: 'Oteco’s <a href="/p/oteco-model-72-gate-valve-repair-kits">Model 72 repair kits</a> come in two sizes of job. The <strong>minor kit</strong> renews the parts that seal the gate: the gate packings, the wear plates and the O-rings. The <strong>major kit</strong> adds the gate itself and the stem packing. A minor kit suits a valve whose gate is still sound; a major kit is for a gate that is scored or worn, or a stem that leaks.',
    },
    {
      type: 'paragraph',
      html: 'Inside the Model 72, interlocking gate packings and wear plates seal the gate and protect the body and cap. A <strong>BD kit</strong> uses bonded gate packing, where the wear plates are moulded into the packing instead of being loose parts. Use the packing style your valve was built with, so order the kit that matches it.',
    },

    { type: 'section_head', number: '/02', title: 'Choosing the kit.', anchor: 'choose' },
    {
      type: 'paragraph',
      html: 'Four facts pick the part number. First, the valve model on the nameplate (GV436, GV250 and so on; Oteco lists parts without the GV). Second, the service trim. Standard valves have a 4130 gate, electroless nickel plated, with nitrile packings. Sour gas (H2S) valves have stainless gates, wear plates and stem packing rings with low-temperature nitrile packings. Third, minor or major. Fourth, loose or bonded packing.',
    },
    {
      type: 'comparison_table',
      caption: 'Model 72 kit selection',
      columns: ['Your valve', 'Kit listed under', 'Note'],
      rows: [
        { cells: ['GV224', '224', 'Own kit'] },
        { cells: ['GV236 or GV250', '236 / 250', 'Shared kit; bonded kits are listed 236/250 together'] },
        { cells: ['GV336 or GV350', '336 / 350', 'Shared kit'] },
        { cells: ['GV424', '424 (and 524)', '5-inch 2,000 psi valve uses the 4-inch kit'] },
        { cells: ['GV436 or GV450', '436 / 450', 'The 5-inch GV536 and GV550 use the 4-inch kits'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The listing’s Fits column carries these models, so a kit described as “Minor Repair Kit, 224 Gate Valve (NBR/SS)” is IH-OTC-120012 and fits the 224. If your model is not obvious from the kit description, check the Fits column or send us the nameplate.',
    },

    { type: 'section_head', number: '/03', title: 'Body subs: changing the end connection.', anchor: 'subs' },
    {
      type: 'paragraph',
      html: 'On a Model 72 the ends screw into the body. That means a worn or damaged end can be replaced on its own, and a valve can be re-ended for a different line. The <a href="/p/oteco-model-72-gate-valve-body-subs">body subs</a> are listed by connection and service: threaded (line pipe, EUE, NUE, casing), butt weld in Sch. 80, 160 and XXS with a 37.5° bevel to ASME B36.10 schedules, male and female Figure 602, 1002 and 1502 unions made to mate with FMC Weco unions, and API ring-joint and ASME raised-face flanges, some xylan coated. A sour gas butt-weld sub looks like IH-OTC-120101: 3 inch, Sch. XXS, sour gas service, fitting the 336 and 350.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Re-ending a valve changes what it can take.',
      body: 'The end connection decides the shell test pressure, and Oteco does not recommend some combinations. On a GV250, for example, a Sch. 80 butt-weld end is not recommended, against 10,000 psi for a line pipe end. Check Oteco’s table for the model and connection before you re-end a valve, and treat Oteco’s hammer-union subs as made to mate with Weco unions only, unless another make is confirmed compatible (Oteco Engineering Bulletin EB-004).',
    },

    { type: 'section_head', number: '/04', title: 'Single parts when a kit is not enough.', anchor: 'parts' },
    {
      type: 'paragraph',
      html: 'The <a href="/p/oteco-model-72-gate-valve-spare-parts">spare parts</a> listing covers what a kit does not: valve bodies, body caps, split bonnets, handwheels, stem nuts and bearing races, gates, wear plates, gate and stem packings, O-rings, studs and nuts. Gates are 4130 electroless nickel plated for standard service and stainless for sour gas and waterflood; wear plates are carburised 1026 steel or stainless; packings are standard nitrile or low-temperature nitrile. A body or cap is a bigger decision than a kit, so tell us what you found when you opened the valve.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li>The Model 72 number from the nameplate, or the size and pressure class if the plate is gone.</li><li>The trim: standard, sour gas (H2S), stainless or waterflood.</li><li>Minor or major, and whether the packing is loose or bonded.</li><li>For subs: the connection, size, pressure class and service.</li><li>Any old part numbers, which we match against the Oteco part number.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Cameron, Flex-Seal and Weco are trademarks of their owners. If you are comparing the Model 72 with Oteco’s other mud gate valve, see <a href="/blog/model-72-vs-dm-gate-valve">Model 72 or DM</a>; for a general view of repair kits, see <a href="/blog/mud-gate-valve-repair-kits">mud gate valve repair kits</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I rebuild a Model 72 without taking it out of the line?', answer: 'Oteco designs its minor and major kits to rebuild the valve in line. Isolate and depressurise the line first, following your site procedure.' },
        { question: 'When do I need a major kit rather than a minor one?', answer: 'Use a major kit when the gate or the stem packing needs renewing as well. If you are unsure, open the valve and look at the gate; send us what you find.' },
        { question: 'Do 5-inch Model 72 valves have their own kits?', answer: 'No. The 5-inch valves are built on the 4-inch body, and they use the 4-inch kits. Their 5-inch end connections are body subs.' },
        { question: 'Do Model 72 parts fit a Cameron Type ‘S’ valve?', answer: 'Oteco states that Model 72 parts interchange with Cameron Type ‘S’ Flex-Seal parts. It is Oteco’s statement, so we check the valve and the Oteco part number before confirming.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Model 72 kits, subs, parts and valves',
      skus: ['IH-OTC-M72-KITS', 'IH-OTC-M72-SUBS', 'IH-OTC-M72-PARTS', 'IH-OTC-M72-3', 'IH-OTC-M72-4'],
    },
    { type: 'category_link', slug: 'gate-valve-repair-kits', label: 'Gate valve repair kits and parts', blurb: 'Minor and major kits, body subs and spares for mud gate valves.' },
    { type: 'category_link', slug: 'oilfield-gate-valves', label: 'Gate valves', blurb: 'Oteco Model 72 and DM mud gate valves, 2 to 5 inch.' },
    {
      type: 'related_articles',
      slugs: ['model-72-vs-dm-gate-valve', 'mud-gate-valve-repair-kits', 'oteco-drilling-equipment-guide', 'hammer-union-figure-numbers'],
    },
    {
      type: 'cta_block',
      heading: 'Need a Model 72 kit or sub?',
      body: 'Send the valve model, trim and the kit or connection you need. We keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
