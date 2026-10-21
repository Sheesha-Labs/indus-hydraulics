import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Brass SAE 45° flare, inverted flare and compression fittings. Sources read 2026-10-21: Parker Catalog 3501E (rev
 * 05/22): 45° flare meets SAE J512 and J513 (J512 automotive tube fittings — 45° flare, inverted flare, compression;
 * J513 refrigeration tube fittings), metal-to-metal seal resisting pull-out, long nut resists vibration, UL listed,
 * refrigerant / propane / fuel / natural gas, tubing copper, brass, aluminium and welded steel hydraulic tubing,
 * −65 to +250 °F, pressure by tube OD (⅛" 2,800 … ¾" 550 psi), nut threads (14FL), make-up ¼–½ turn past finger
 * tight; JIC 37° and SAE 45° nose profiles drawn separately; inverted flare: internal metal seal, UL listed for
 * flammable liquid and gas, J512, steel nut option, brake / fuel / refrigerant lines, double flare on thin-wall
 * tube, same pressure table, nut threads (41IF), ½" union tee 244IFHD-8 "Does not meet SAE or UL"; compression:
 * J512, UL listed for flammable liquid, brass or acetal sleeve, no tube preparation, air / lube / cooling lines,
 * copper, aluminium and thermoplastic tube (60PT sleeve + 63PT insert), −65 to +200 °F, pressure with brass sleeve on
 * copper (⅛" 2,800 … ⅞" 450 psi), make-up turns, nut threads (61C).
 * NOT used: "90° included" as a Parker quote; a maker statement banning brass compression from hydraulics.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'brass-flare-and-compression-fittings',
  title: 'Brass flare and compression fittings: SAE 45° flare, inverted flare and compression — ratings and threads',
  excerpt:
    'A ¼" SAE 45° flare nut is 7/16-20 — the same thread as a -4 JIC — and the two will screw together and leak, because one seat is 45° and the other 37°. Brass 45° flare, inverted (double) flare and compression fittings for copper, aluminium, steel and plastic tube: what each is for, Parker’s ratings from 2,800 psi at ⅛" down to 550 psi at ¾", nut threads by size, and how to make each joint up.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Brass Flare & Compression Fittings: 45° vs Inverted Flare, Ratings',
  seoDescription:
    'A guide to brass SAE 45° flare, inverted flare and compression fittings (SAE J512 / J513): uses, pressure ratings by tube size, nut threads, why 45° flare does not mate with 37° JIC, and make-up for copper, steel and plastic tube.',
  focusKeyword: 'brass flare fittings',
  publishedAt: '2026-10-21T20:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three ways to join small tube in brass, all under SAE J512: the 45° flare (also J513 for refrigeration), the inverted flare with its seal inside the fitting, and the compression sleeve that needs no tube preparation.',
        'Parker rates brass 45° and inverted flare fittings by tube size — 2,800 psi at ⅛", 1,400 at ¼", 1,000 at ⅜", 750 at ½", 550 at ¾" — and compression with a brass sleeve on copper the same, down to 450 psi at ⅞".',
        'A ¼" 45° flare nut shares the 7/16-20 thread of a -4 JIC 37°; the seats differ and the joint leaks or cracks the flare. Never mix 45° and 37°.',
        'Inverted flare is the brake- and fuel-line fitting: Parker advises a double flare on thin-wall tube to stop pinch-off or cracked flares.',
        'On plastic tube, a compression fitting needs a plastic sleeve and a tube insert.',
      ],
    },
    {
      type: 'lead',
      html: 'Refrigeration, gas, fuel, lubrication, instrument and brake lines are mostly small copper, aluminium, steel or plastic tube, and they are joined with brass fittings that look a lot like hydraulic ones. They are not hydraulic fittings — they are rated for these services, at these pressures — and the 45° flare in particular is the most common cross-up with a 37° JIC. This guide covers the three brass tube-fitting families and how to choose and use them.',
    },

    { type: 'section_head', number: '/01', title: 'The three families.', anchor: 'families' },
    {
      type: 'comparison_table',
      caption: 'Brass tube fittings to SAE J512 (Parker)',
      columns: ['Family', 'How it seals', 'Typical service', 'Tube'],
      rows: [
        { cells: ['SAE 45° flare', 'Tube flared to 45°, metal to metal on the fitting cone; long nut resists vibration', 'Refrigerant, propane, fuel, natural gas', 'Copper, brass, aluminium, welded steel'], highlight: true },
        { cells: ['Inverted flare', 'Double-flared tube seals inside the fitting; nut threads into the body', 'Brake, fuel and refrigerant lines', 'Copper, brass, aluminium, welded steel'] },
        { cells: ['Compression', 'A brass or acetal sleeve squeezed onto the tube by the nut', 'Air, lubrication and cooling lines', 'Copper, aluminium, thermoplastic (with insert)'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Parker maximum pressure by tube OD, psi',
      columns: ['Tube OD', '45° flare', 'Inverted flare', 'Compression (brass sleeve, copper tube)'],
      rows: [
        { cells: ['1/8"', '2,800', '2,800', '2,800'] },
        { cells: ['3/16"', '1,900', '1,900', '1,900'] },
        { cells: ['1/4"', '1,400', '1,400', '1,400'], highlight: true },
        { cells: ['5/16"', '1,200', '1,200', '1,200'] },
        { cells: ['3/8"', '1,000', '1,000', '1,000'] },
        { cells: ['1/2"', '750', '750', '750'] },
        { cells: ['5/8"', '650', '650', '650'] },
        { cells: ['3/4"', '550', '550', '550'] },
        { cells: ['7/8"', '—', '—', '450'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s temperature range is −65 to +250 °F for both flare types and −65 to +200 °F for compression. Note that Parker lists welded steel hydraulic tubing as compatible with its brass flare fittings — but at these pressures, so a brass flare fitting is for a low-pressure steel line, not a hydraulic circuit.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Nut threads — and the JIC trap.', anchor: 'threads' },
    {
      type: 'comparison_table',
      caption: 'Brass nut threads by tube OD (Parker)',
      columns: ['Tube OD', '45° flare', 'Inverted flare', 'Compression'],
      rows: [
        { cells: ['1/8"', '—', '5/16-28', '5/16-24'] },
        { cells: ['3/16"', '—', '3/8-24', '3/8-24'] },
        { cells: ['1/4"', '7/16-20', '7/16-24', '7/16-24'], highlight: true },
        { cells: ['5/16"', '1/2-20', '1/2-20', '1/2-24'] },
        { cells: ['3/8"', '5/8-18', '5/8-18', '9/16-24'] },
        { cells: ['1/2"', '3/4-16', '3/4-18', '11/16-20'] },
        { cells: ['5/8"', '7/8-14', '7/8-18', '13/16-18'] },
        { cells: ['3/4"', '1-1/16-14', '1-1/16-16', '1-18'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The table shows why mix-ups happen. A ¼" 45° flare nut is 7/16-20, the same thread as a -4 37° JIC; ½" and ⅝" 45° flare nuts match -8 and -10 JIC threads too. Parker draws the 37° and 45° flare noses as separate profiles: the thread engages, the seats do not, and the joint leaks or splits the flare. Inverted flare and compression nuts share several threads with each other at small sizes. Identify by the seat, not the thread — see <a href="/blog/identify-any-hydraulic-fitting">identifying a fitting</a> and <a href="/blog/jic-adapters-guide">JIC adapters</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: '45° and 37° do not mix.',
      body: 'A 45° flare fitting on a 37° flared tube, or a 37° JIC on a 45° fitting, can be screwed fully home and still leak — and tightening further cracks the flare. Check the seat angle on both halves.',
    },

    { type: 'section_head', number: '/03', title: 'Making them up.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<ul><li><strong>45° flare.</strong> Cut the tube square and deburr, slide the nut on, flare to 45° with a flaring tool, then run the nut on finger-tight and turn a further ¼ to ½ turn for the metal-to-metal seal (Parker).</li><li><strong>Inverted flare.</strong> Put the nut on first, then flare. Parker advises a double flare on thin-wall copper, welded or brazed tube to prevent pinch-off or cracked flares; it also offers a piloted nut for single-flared tube. Parker notes that one of its ½" union tees does not meet SAE or UL — check the listing when a certification matters.</li><li><strong>Compression.</strong> No tube preparation beyond a square, clean cut. With a brass sleeve on soft metal tube, Parker gives 1¼ turns from hand-tight for ⅛"–5/16" and 2¼ turns for ⅜"–⅞"; on plastic tube use the plastic sleeve and a tube insert, and 2 turns.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between 45° flare and inverted flare?', answer: 'A 45° flare fitting has the flare on the outside of the fitting cone with the nut over the tube; an inverted flare seals inside the fitting, with the nut threading into the body. Inverted flare is the usual brake- and fuel-line fitting.' },
        { question: 'Can I use a 45° flare fitting with a JIC fitting?', answer: 'No. Some sizes share a thread (¼" 45° flare and -4 JIC are both 7/16-20) but the 45° and 37° seats do not seal against each other.' },
        { question: 'What pressure are brass flare fittings rated for?', answer: 'Parker gives 2,800 psi at ⅛", 1,400 psi at ¼", 1,000 psi at ⅜", 750 psi at ½" and 550 psi at ¾" for both 45° and inverted flare.' },
        { question: 'Do I need a double flare?', answer: 'Parker advises a double flare for inverted flare fittings on thin-wall copper, welded or brazed tube, to prevent pinch-off or cracked flares.' },
        { question: 'Can brass compression fittings be used on plastic tube?', answer: 'Yes, with a plastic sleeve and a tube insert to support the bore.' },
        { question: 'Are brass flare fittings suitable for gas?', answer: 'Parker’s brass 45° flare and inverted flare fittings are UL listed and used on refrigerant, propane, fuel and natural gas lines; follow the local gas code for the installation.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Brass SAE 45° flare, inverted flare and compression fittings, nuts, sleeves and inserts:</p>' + stockList(['brass-sae-45-flare-fittings', 'brass-inverted-flare-fittings', 'brass-compression-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Brass flare and compression fittings',
      skus: ['IH-BR-48', 'IH-BR-49', 'IH-BR-41', 'IH-BR-3202', 'IH-BR-3100', 'IH-BR-68', 'IH-BR-60', 'IH-BR-73'],
    },
    { type: 'category_link', slug: 'brass-sae-45-flare-fittings', label: 'Brass SAE 45° flare fittings', blurb: 'Connectors, elbows, tees, unions, nuts, caps and plugs.' },
    { type: 'category_link', slug: 'brass-inverted-flare-fittings', label: 'Brass inverted flare fittings', blurb: 'Brake- and fuel-line connectors, elbows, tees and nuts.' },
    { type: 'category_link', slug: 'brass-compression-fittings', label: 'Brass compression fittings', blurb: 'Compression connectors, unions, sleeves, nuts and tube inserts.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-3501e', text: 'Parker Hannifin. Catalog 3501E — Brass, Composite and Thermoplastic Fittings and Valves (rev. 05/22), sections G and H.', url: 'https://www.parker.com/content/dam/parker/lam/catalogs/pdf/4---conectores---mangueiras---v%C3%A1lvulas---instrumentos-para-flu%C3%ADdos/1---baixa-press%C3%A3o/Brass,%20Composite%20and.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['brass-pipe-fittings-nptf-and-bsp', 'jic-adapters-guide', 'identify-any-hydraulic-fitting', 'brass-air-brake-fittings-guide', 'compression-fitting-leaks'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Families, ratings, threads and make-up from Parker Catalog 3501E (rev. 05/22).',
    },
    {
      type: 'cta_block',
      heading: 'Matching a brass fitting?',
      body: 'Send the tube OD and material, the service and the seat type (45° flare, inverted flare or compression). We will match the fitting and its nut.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
