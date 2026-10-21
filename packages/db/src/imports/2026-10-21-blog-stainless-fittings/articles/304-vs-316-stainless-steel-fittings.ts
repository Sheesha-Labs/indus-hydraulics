import type { BlogArticleSeed } from '../shared'

/**
 * 304 vs 316 (and L grades, duplex) for stainless fittings. Sources read 2026-10-21: Outokumpu Core and Supra
 * typical compositions (304 / 1.4301 C 0.04 Cr 18.1 Ni 8.1; 316 / 1.4401 Cr 17.2 Ni 10.1 Mo 2.1; L grades C 0.02;
 * "due to their molybdenum content … increased demand for corrosion resistance"); Alleima SAF 2205 datasheet
 * (PRE = Cr + 3.3 Mo + 16 N; 316L 24, 317L 30, 2205 >35; 304L and 316L prone to chloride SCC above 60 °C (140 °F),
 * lower with H2S; 2205 much higher SCC resistance); SSINA chloride SCC page (rare below 60 °C; evaporative wet/dry
 * conditions crack well below immersion thresholds; chlorides concentrate); cast CF8 / CF8M equivalence and 316 Mo
 * 2.0–3.0 % (maker booklet); sensitisation 425–815 °C and L-grade 0.03 % C max (secondary references).
 * NOT used: a computed PREN for 304 as a published figure (stated as calculated).
 */
const ARTICLE: BlogArticleSeed = {
  slug: '304-vs-316-stainless-steel-fittings',
  title: '304 vs 316 stainless steel fittings: molybdenum, chlorides, L grades and when to go duplex',
  excerpt:
    'The difference between 304 and 316 is about 2% molybdenum — and on a coastal plant, a chlorinated water line or a brine service that 2% is the difference between a fitting that stays bright and one that pits. What each grade is made of, how PREN ranks them, why both crack in hot chlorides, when the L grades matter, and when 316 is not enough.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: '304 vs 316 Stainless Fittings: Which Grade, and Why L Grades',
  seoDescription:
    '304 vs 316 stainless steel fittings compared: molybdenum and PREN, pitting in chlorides, the 60 °C stress-corrosion limit, 304L and 316L for welding, cast CF8 and CF8M, and when to use duplex 2205.',
  focusKeyword: '304 vs 316 stainless steel fittings',
  publishedAt: '2026-10-21T16:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        '316 is 304 plus about 2–3% molybdenum (Outokumpu typical: 17.2% Cr, 10.1% Ni, 2.1% Mo). The molybdenum is what resists pitting and crevice corrosion in chlorides.',
        'PREN ranks pitting resistance: Alleima gives 316L 24, 317L 30 and duplex 2205 over 35; 304 calculates to about 18–19.',
        'Both 304L and 316L are prone to chloride stress-corrosion cracking above about 60 °C (140 °F) — and below it where chlorides concentrate on wet/dry surfaces.',
        'Choose L grades (0.03% carbon max) for anything that will be welded, so the heat-affected zone does not sensitise.',
        'Cast fittings use the equivalents CF8 (304) and CF8M (316). Never mix 304 and 316 in one line and expect the line to behave like 316.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless is not one material, and "stainless fitting" is not a specification. The two grades you will be offered for almost every fitting — 304 and 316 — look identical, machine alike and cost a little differently. In fresh water and food they behave alike too. Bring chlorides into the picture — sea air, brine, chlorinated cleaning water, salty product — and they part company. This guide explains why, and how to choose.',
    },

    { type: 'section_head', number: '/01', title: 'What is in them.', anchor: 'composition' },
    {
      type: 'comparison_table',
      caption: 'Typical compositions, % (Outokumpu)',
      columns: ['Grade', 'EN', 'C', 'Cr', 'Ni', 'Mo'],
      rows: [
        { cells: ['304', '1.4301', '0.04', '18.1', '8.1', '—'] },
        { cells: ['304L', '1.4307', '0.02', '18.1', '8.1', '—'] },
        { cells: ['316', '1.4401', '0.04', '17.2', '10.1', '2.1'], highlight: true },
        { cells: ['316L', '1.4404', '0.02', '17.2', '10.1', '2.1'], highlight: true },
      ],
    },
    {
      type: 'prose',
      html: '<p>Chromium forms the passive film that makes stainless stainless. Molybdenum strengthens that film where chloride ions try to break through it — Outokumpu says plainly that it is the molybdenum that lets the CrNiMo grades serve where corrosion resistance demands more. The specification range for 316 is 2.0–3.0% Mo; typical mill product sits near the bottom of it. Castings use their own designations: <strong>CF8</strong> is the cast equivalent of 304 and <strong>CF8M</strong> of 316, which is what a cast 150# fitting is made of.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Pitting: PREN.', anchor: 'pren' },
    {
      type: 'prose',
      html: '<p>The pitting resistance equivalent number weights the alloying elements by how much they help: <strong>PRE = %Cr + 3.3 × %Mo + 16 × %N</strong>. Alleima’s duplex datasheet gives 316L at 24, 317L at 30 and SAF 2205 above 35. Worked from Outokumpu’s typical figures, 304 comes out at about 18–19. The gap between 304 and 316 is almost entirely the molybdenum term. PREN is a ranking, not a guarantee: it says which grade pits first, not whether a given grade will pit in a given service.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Pitting resistance ranking (PRE)',
      columns: ['Grade', 'PRE', 'Source'],
      rows: [
        { cells: ['304', '≈ 18–19', 'Calculated from Outokumpu typical composition'] },
        { cells: ['316L', '24', 'Alleima'], highlight: true },
        { cells: ['317L', '30', 'Alleima'] },
        { cells: ['Duplex 2205', '> 35', 'Alleima'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'The 60 °C limit: chloride stress-corrosion cracking.', anchor: 'scc' },
    {
      type: 'prose',
      html: '<p>Molybdenum does not save 316 from the other chloride failure. Alleima states that both 304L and 316L are prone to <strong>stress-corrosion cracking</strong> in chloride-bearing solutions above 60 °C (140 °F), and lower still where hydrogen sulphide is present. SSINA, the US stainless industry body, agrees that chloride SCC is rare below 60 °C — under full immersion. Under evaporative conditions, where a few ppm of chloride dries out and concentrates to hundreds, stainless can crack well below that threshold.</p><p>That is the Gulf case: insulated hot lines that get wet under the cladding, splash zones, cooling-water evaporation, salt deposited on hot surfaces in the sun. There the choice is no longer 304 or 316 but whether either austenitic grade belongs at all. Alleima says duplex 2205 has much higher SCC resistance than the standard austenitic grades and can be used at considerably higher temperatures and chloride levels without pitting.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Hot, wet and salty: question 316.',
      body: 'Above about 60 °C with chlorides — or anywhere chlorides can dry and concentrate on a warm surface — 316L can crack. Ask whether the service needs duplex, a higher-alloy grade or a design change, not a thicker 316 fitting.',
    },

    { type: 'section_head', number: '/04', title: 'L grades and welding.', anchor: 'l-grades' },
    {
      type: 'prose',
      html: '<p>Heat a standard-carbon austenitic stainless steel through roughly 425–815 °C — which the band beside every weld passes through — and chromium carbides form at the grain boundaries, leaving the metal next to them short of chromium. That <em>sensitised</em> band corrodes along the grain boundaries a few millimetres from the weld: weld decay. The L grades cap carbon at 0.03%, too little to form significant carbide during welding. So the rule is simple: <strong>specify 304L or 316L for butt-weld and socket-weld fittings, flanges and anything else that will be welded</strong>. Dual-certified 316/316L material meets both specifications.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Choosing.', anchor: 'choose' },
    {
      type: 'decision_tree',
      heading: '304, 316 or something else?',
      branches: [
        { condition: 'Fresh water, air, beer, dry indoor service?', outcome: '304 (304L if welded).', sku: 'IH-PF-W490LES4' },
        { condition: 'Coastal or offshore air, sea spray, brine, chlorinated cleaning water, salty product?', outcome: '316 (316L if welded).', sku: 'IH-PF-W490LES6' },
        { condition: 'Chlorides above about 60 °C, or chlorides drying on a hot surface?', outcome: 'Question austenitic grades — duplex 2205 or higher alloy.' },
        { condition: 'Any welding?', outcome: 'An L grade, whichever base grade you chose.' },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two practical rules finish it. Keep one grade through a line: a 304 elbow in a 316 system becomes its weakest point, and a stainless fitting next to plain carbon steel in salt air invites galvanic attack on the steel. And remember the crevices — threads, socket-weld gaps, gasket faces and clamps under insulation are where chlorides concentrate first; see <a href="/blog/stainless-tube-fittings-corrosion-gulf">stainless in salt air</a> and <a href="/blog/when-stainless-is-worth-it">when stainless is worth it</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between 304 and 316 stainless fittings?', answer: '316 contains about 2–3% molybdenum and a little more nickel; 304 contains none. The molybdenum gives 316 much better resistance to pitting and crevice corrosion in chlorides.' },
        { question: 'Is 316 stainless suitable for seawater?', answer: 'For sea air and splash it is the usual minimum. In warm seawater and crevices it can still pit, and above about 60 °C with chlorides it can stress-corrosion crack; duplex or higher alloys are used there.' },
        { question: 'What does the L in 316L mean?', answer: 'Low carbon — 0.03% maximum. It stops the area beside a weld sensitising and corroding along grain boundaries. Use L grades for anything welded.' },
        { question: 'What is CF8M?', answer: 'The cast equivalent of 316 stainless (CF8 is the cast 304). Cast 150# threaded fittings are usually CF8 or CF8M.' },
        { question: 'What is PREN?', answer: 'Pitting resistance equivalent number: %Cr + 3.3 × %Mo + 16 × %N. Higher is more resistant to pitting. 316L is about 24, duplex 2205 over 35.' },
        { question: 'Can I mix 304 and 316 fittings?', answer: 'They can be joined, but the line is only as resistant as its 304 parts. Keep one grade through a system exposed to chlorides.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'The same fittings in 304 and 316',
      skus: ['IH-PF-W490LES4', 'IH-PF-W490LES6', 'IH-PF-C90-B4', 'IH-PF-C90-B6', 'IH-PF-WNRF-304', 'IH-PF-WNRF-316', 'IH-PF-SF04CT', 'IH-PF-SF16CT'],
    },
    { type: 'category_link', slug: 'stainless-steel-pipe-fittings', label: 'Stainless steel pipe fittings', blurb: 'Every family in 304 and 316.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Where sea air decides the grade.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'outokumpu-core', text: 'Outokumpu. Core 304/4301 range — typical composition.', url: 'https://www.outokumpu.com/en/core' },
        { id: 'outokumpu-supra', text: 'Outokumpu. Supra 316/4401 range — typical composition.', url: 'https://www.outokumpu.com/en/supra' },
        { id: 'alleima-2205', text: 'Alleima. SAF 2205 datasheet (PRE table; SCC of 304L and 316L above 60 °C), 2023.', url: 'https://www.alleima.com/contentassets/ec1159b850fd417195a24799c0c0bab5/datasheet-saf-2205-en-v2023-11-09-1439-version-1.pdf/download' },
        { id: 'ssina-scc', text: 'SSINA. Chloride stress corrosion cracking.', url: 'https://www.ssina.com/education/corrosion/chloride-stress-corrosion-cracking/' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['when-stainless-is-worth-it', 'stainless-tube-fittings-corrosion-gulf', 'stainless-steel-pipe-fittings-guide', 'ss316l-hydraulic-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Compositions from Outokumpu; PRE and SCC limits from Alleima and SSINA; sensitisation range from metallurgical references. Service selection should be confirmed against the actual fluid, temperature and chloride level.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which grade?',
      body: 'Tell us the fluid, its chloride content and temperature, and whether the line is insulated or outdoors. We will recommend 304, 316 or a step up, and quote the fittings in one grade.',
      quoteLabel: 'Ask us',
    },
  ],
}

export default ARTICLE
