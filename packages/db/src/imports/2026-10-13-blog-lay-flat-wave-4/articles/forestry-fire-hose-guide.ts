import type { BlogArticleSeed } from '../shared'

/**
 * Forestry and wildland fire hose. Checked 2026-10-14: JRC/EFFIS 2025 season (opened); Spain and
 * Portugal 2025 figures (press, medium — attributed as reported); Evros 2023 "largest in the EU"
 * (EU civil protection via Al Jazeera) with "more than 80,000 ha"; USFS 5100-186/187 and NWCG
 * PMS 448 sizes/threads and PMS 205 progressive hose lay (search-result text, medium); NFPA 1962
 * forestry service test. Lateral spacing NOT stated. Product facts from IH-LF-FFE / FFN / CER.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'forestry-fire-hose-guide',
  title: 'Forestry fire hose: sizes, construction and the progressive hose lay',
  excerpt:
    '2025 was the EU’s worst wildfire season on record: more than a million hectares burnt. Wildland crews fight those fires on foot, with light hose carried in packs and laid up hillsides from portable pumps. What makes forestry hose different from structural fire hose, the 1" and 1-1/2" sizes and threads used in wildland work, how a progressive hose lay works, and how to choose between EPDM-lined and coated hose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Forestry Fire Hose Guide: Sizes, Threads and Hose Lays',
  seoDescription:
    'Forestry and wildland fire hose explained: light single-jacket construction, 1" and 1-1/2" sizes, NH and NPSH threads, 100 ft lengths, progressive hose lays with laterals, coated vs uncoated hose, and testing.',
  focusKeyword: 'forestry fire hose',
  publishedAt: '2026-10-14T07:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The EU recorded 1,079,538 ha burnt in 2025 — the most since EFFIS records began in 2006, and nearly double the average.',
        'Forestry hose is light, single-jacket hose carried in packs and laid by hand over rough ground from portable pumps and tankers.',
        'In North American wildland practice, 1-1/2" hose usually carries NH threads and 1" hose NPSH threads, in 100 ft lengths.',
        'A progressive hose lay puts wyes or tees into the main line at intervals, with lateral lines run to the fire edge.',
        'Coated hose lasts longer on rock and scrub; uncoated EPDM-lined hose is lighter. Service test forestry hose at the pressure your standard sets.',
      ],
    },
    {
      type: 'lead',
      html: 'Europe’s 2025 wildfire season was the most destructive on record. The EU’s Joint Research Centre reported 1,079,538 hectares burnt across 7,783 mapped fires in 25 member states, with all-time national records in Germany, Spain, Cyprus and Slovakia; an August heatwave alone drove 22 very large fires in Spain and Portugal. Two years earlier, the Evros fire in Greece burned more than 80,000 hectares — described by EU civil protection as the largest single fire in the EU since records began. Aircraft get the headlines; on the ground, fires are held by crews with portable pumps and long lines of light hose.',
    },

    { type: 'section_head', number: '/01', title: 'What makes forestry hose different.', anchor: 'difference' },
    {
      type: 'paragraph',
      html: 'Structural attack hose is built to be dragged from an appliance into a building at high pressure. Forestry hose has a different job: to be <strong>carried</strong> — in packs, over hills, through scrub — and laid out for hundreds of metres from a small portable pump or a tanker. Weight and bulk matter more than anything, so forestry hose is single jacket, small bore and light, and it must still take the abrasion of rock, roots and dry ground. NFPA 1961 (now part of NFPA 1960) recognises forestry hose as its own category, and NFPA 1962 sets its in-service test at a minimum of 300 psi, the same as attack hose.',
    },
    {
      type: 'direct_answer',
      question: 'What size is forestry fire hose?',
      answer:
        'Usually 1" and 1-1/2". In North American wildland practice, US Forest Service specifications cover lined hose in both sizes, supplied in 100 ft lengths, with NH threads on 1-1/2" hose and NPSH threads on 1" hose. European and other users may specify metric sizes and other couplings.',
    },

    { type: 'section_head', number: '/02', title: 'Sizes, threads and lengths.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: 'Wildland hose in North American practice (US Forest Service and NWCG, as reported)',
      columns: ['Size', 'Typical use', 'Thread', 'Length'],
      rows: [
        { cells: ['1-1/2"', 'Main or trunk line from the pump', 'NH (National Hose / NST)', '100 ft'], highlight: true },
        { cells: ['1"', 'Laterals to the fire edge', 'NPSH', '100 ft'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The US Forest Service specifies lined fire hose (5100-186) and lightweight lined fire hose (5100-187) in 1" and 1-1/2" sizes. Elsewhere the couplings follow local practice — Storz in much of Europe, other instantaneous patterns in the UK and Commonwealth. Whatever the pattern, keep it consistent across pumps, hose and appliances, so any length couples to any other. Our <a href="/p/expansion-ring-fire-hose-coupling">expansion ring couplings</a> come in 1" to 2-1/2" with NST, NPSH or BAT threads.',
    },

    { type: 'section_head', number: '/03', title: 'The progressive hose lay.', anchor: 'hose-lay' },
    {
      type: 'paragraph',
      html: 'In a <strong>simple hose lay</strong>, lengths are coupled end to end from the pump to the nozzle. In a <strong>progressive hose lay</strong> — the standard technique for working along a fire edge — wye valves or tees are put into the main line at intervals as it advances, and lateral lines are run from them to the fire. The crew can then hit spot fires and hot spots along the whole length of the line without shutting it down, and extend it length by length as the fire edge is secured. That puts a premium on hose that is quick to carry, couple and lay — and on fittings and couplings that never jam.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Pack it to lay it.',
      body: 'Wildland crews carry hose pre-rolled or packed so it pays out as they walk. Roll forestry hose clean and dry, couplings protected, in the pattern your crew deploys from — see how to roll and store lay flat hose.',
    },

    { type: 'section_head', number: '/04', title: 'Choosing forestry hose.', anchor: 'choosing' },
    {
      type: 'comparison_table',
      caption: 'Our forestry fire hose',
      columns: ['Hose', 'Construction', 'Best for'],
      rows: [
        { cells: ['Forestry fire hose, EPDM liner', 'Single woven polyester jacket, EPDM liner, white', 'Lightest carry; heat, weather and ageing resistance'] },
        { cells: ['Forestry fire hose, rubber liner, PU-coated', 'Natural rubber liner, single jacket, water-based polyurethane coat, yellow', 'Rocky and abrasive terrain where uncoated hose wears out'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/forestry-fire-hose-epdm-liner">EPDM-lined forestry hose</a> keeps weight down for long carries and stores well in hot depots; the <a href="/p/forestry-fire-hose-rubber-liner-pu-coated">PU-coated forestry hose</a> trades a little weight for much better abrasion resistance where hose is dragged over rock and roots. No approval is published for either line — tell us the specification or authority listing you work to. For the liners themselves, see <a href="/blog/fire-hose-liner-materials">fire hose liner materials</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Testing and refurbishing.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Wildland hose takes a beating in a single season. US Forest Service fire caches refurbish used hose and test it — typically to 300 psi — before it goes back into storage, and NFPA 1962 requires hose that fails inspection to be repaired and service tested, or condemned. Wash off ash and mud, dry it fully before rolling (wet hose grows mildew), store it out of the sun, and keep hose awaiting repair tagged and apart from ready stock. See <a href="/blog/how-to-repair-lay-flat-hose">how to repair lay flat hose</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between forestry hose and attack hose?', answer: 'Forestry hose is lighter and smaller, built to be carried and laid by hand over rough ground; attack hose is built for hard use from appliances at structural fires. NFPA treats them as separate categories.' },
        { question: 'What threads does wildland fire hose use?', answer: 'In North American practice, NH threads on 1-1/2" hose and NPSH on 1" hose. Other regions use their own coupling patterns.' },
        { question: 'What is a progressive hose lay?', answer: 'A hose lay in which wyes or tees are put into the main line at intervals as it advances, with lateral lines run to the fire edge.' },
        { question: 'What pressure is forestry hose tested at?', answer: 'NFPA 1962 sets the in-service test for forestry hose at a minimum of 300 psi, or the service test pressure marked on the hose.' },
        { question: 'How bad was the 2025 wildfire season in Europe?', answer: 'The worst on record in the EU: 1,079,538 hectares burnt, according to the EU’s Joint Research Centre, nearly double the 2006–2024 average.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Forestry fire hose and couplings',
      skus: ['IH-LF-FFE', 'IH-LF-FFN', 'IH-LF-CER', 'IH-LF-FSU'],
    },
    {
      type: 'category_link',
      slug: 'jacketed-fire-hoses',
      label: 'Jacketed fire hoses',
      blurb: 'Forestry, single and double jacket fire hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'spain',
      label: 'Forestry hose supply to Spain',
      blurb: 'Wildland fire hose for Spanish forest fire services.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'france',
      label: 'Forestry hose supply to France',
      blurb: 'Forestry fire hose for French wildland crews.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'italy',
      label: 'Forestry hose supply to Italy',
      blurb: 'Wildland fire hose for Italian forestry and civil protection.',
    },
    {
      type: 'related_articles',
      slugs: ['single-vs-double-jacket-fire-hose', 'fire-hose-liner-materials', 'fire-hose-standards-en-14540-bs-6391-nfpa', 'how-to-roll-and-store-lay-flat-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'EU 2025 season from the Joint Research Centre (EFFIS); Evros from EU civil protection statements; wildland hose practice from US Forest Service and NWCG publications. Product facts from the Indus forestry hose listings.',
    },
    {
      type: 'cta_block',
      heading: 'Equipping wildland crews?',
      body: 'Send the sizes, lengths, coupling pattern and the specification you work to. We will confirm what can be supplied against it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
