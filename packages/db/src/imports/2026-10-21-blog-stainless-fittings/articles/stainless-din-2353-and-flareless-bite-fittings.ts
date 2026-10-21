import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless DIN 2353 / ISO 8434-1 24° cutting-ring fittings and (carbon-steel) SAE flareless bite-type fittings.
 * Sources read 2026-10-21: DIN Media catalogue entries (DIN 2353:1991-06 withdrawn, replaced 1998-12; DIN
 * 2353:2013-01 current, covering fittings with DIN 3852 stud ends not contained in DIN EN ISO 8434-1); Parker Catalog
 * 4300 (2017; current 9/2023): EO "manufactured in accordance with DIN 2353 (summary) which today is represented by
 * international standard 8434-1"; EO union ratings by series and OD for steel (CF), stainless 1.4571 (71) and brass;
 * stainless tube 1.4571 / 1.4541 seamless to DIN/EN/ISO 1127, max HRB 90 (steel HRB 75), EN 10216-5; preset with a
 * hardened pre-assembly tool, not the body, for stainless; hydraulic preset above 18 mm, strongly recommended for
 * 30S/35L/38S/42L; manual preset 1½ turns, final wrench resistance + 1/12 turn; stainless nuts silver-plated
 * (15L–42L, 12S–38S); EO-2 stainless FKM; support sleeves. Ferulok: SAE J514 flareless, inch tube, UN/UNF nuts
 * matching 37° dash threads, 24° body cone, preset 1¾ turns in a hardened tool or body, hydraulic preset preferred
 * above size 8, never preset by torque, stainless ferrule springs back more, stainless = steel ratings, stainless tube
 * A269/A213 RB90 (steel RB72). VOSS 2S VA page (to 315 bar L, 630 bar S). DNV/VOSS certificate (stainless pressure
 * reduction above 50 °C).
 * NOT used: ISO 8434-1's own stainless PN values (standard text not checked); cross-maker interchangeability claims.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-din-2353-and-flareless-bite-fittings',
  title: 'Stainless DIN 2353 cutting-ring fittings (ISO 8434-1) and SAE flareless bite-type fittings',
  excerpt:
    'A 24° cutting ring holds by biting into the tube — and in stainless the bite needs more force, a hardened presetting tool and tube no harder than HRB 90. Stainless is also rated well below steel in the metric series: Parker gives 315 bar against 500 for a light-series union on 6–10 mm tube. DIN 2353 and ISO 8434-1, L, S and LL series, stainless ratings, presetting, and the inch flareless fittings that look similar and are not.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless DIN 2353 Fittings & Flareless Bite Type: Ratings, Preset',
  seoDescription:
    'Stainless DIN 2353 / ISO 8434-1 24° cutting-ring fittings: L, S and LL series, stainless vs steel pressure ratings, 1.4571 tube to HRB 90, presetting with a hardened tool, FKM seals — and how SAE flareless bite-type fittings differ.',
  focusKeyword: 'stainless din 2353 fittings',
  publishedAt: '2026-10-21T17:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The 24° cutting-ring fitting is now standardised mainly as ISO 8434-1; DIN 2353:2013 is still current and covers the fittings ISO 8434-1 leaves out.',
        'Three series: LL (extra light), L (light) and S (heavy), each with its own nut threads — L12 is M18×1.5, S12 is M20×1.5.',
        'Stainless is rated lower than steel: Parker’s stainless L-series union is 315 bar for 6–18 mm and 160 bar for 22–42 mm tube, against 500/400/250 bar in steel.',
        'Use seamless 1.4571 or 1.4541 tube no harder than HRB 90, and preset stainless rings in a hardened pre-assembly tool — Parker does not recommend presetting stainless in the fitting body.',
        'SAE flareless bite-type fittings are the inch-tube cousin: a similar bite, but inch tube and UN/UNF nuts, so they do not mix with metric 24° parts.',
      ],
    },
    {
      type: 'lead',
      html: 'European machinery and most offshore hydraulics are built on the 24° cone cutting-ring fitting: plain metric tube, a ring, a nut and a body, with no flaring and no welding. In carbon steel it is forgiving. In stainless it is not — the tube is harder, the ring must bite deeper, and the rating drops. This guide covers the standard, the series, what stainless changes, and the inch flareless fittings often confused with it.',
    },

    { type: 'section_head', number: '/01', title: 'DIN 2353 and ISO 8434-1.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<p>The cutting-ring fitting began as DIN 2353, and Parker describes its EO range as made to DIN 2353, "which today is represented by international standard 8434-1". ISO 8434-1 (DIN EN ISO 8434-1) is now the main standard. DIN 2353 has not simply disappeared, though: its 1991 edition was withdrawn, but <strong>DIN 2353:2013</strong> is current and covers the complete fittings with DIN 3852 stud ends that ISO 8434-1 does not contain. "DIN 2353" on a drawing and "ISO 8434-1" in a specification mean the same connection.</p><p>The body has a 24° internal cone. Tightening the nut drives the cutting ring into the cone, which closes it so its edge cuts into the tube wall — the bite that holds the tube — and seals ring to cone.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Series and nut threads (examples)',
      columns: ['Series', 'Use', 'Tube OD', 'Example nut threads'],
      rows: [
        { cells: ['LL — extra light', 'Low pressure, small tube', '4–12 mm', '—'] },
        { cells: ['L — light', 'General hydraulics', '6–42 mm', 'L12 M18×1.5, L22 M30×2'], highlight: true },
        { cells: ['S — heavy', 'High pressure', '6–38 mm', 'S12 M20×1.5, S38 M52×2'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Ratings: stainless is lower.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker EO straight union, pressure rating in bar: zinc-plated steel vs stainless 1.4571 (Catalog 4300, 2017)',
      columns: ['Series', 'Tube OD (mm)', 'Steel', 'Stainless'],
      rows: [
        { cells: ['LL', '4–12', '100', '100'] },
        { cells: ['L', '6, 8, 10', '500', '315'], highlight: true },
        { cells: ['L', '12, 15, 18', '400', '315'] },
        { cells: ['L', '22, 28, 35, 42', '250', '160'], highlight: true },
        { cells: ['S', '6, 8, 10', '800', '630'] },
        { cells: ['S', '12, 14', '630', '630'] },
        { cells: ['S', '16', '630', '400'] },
        { cells: ['S', '20, 25, 30', '420', '400'] },
        { cells: ['S', '38', '420', '315'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>VOSS rates its stainless cutting ring "up to 315 bar in the L series, up to 630 bar in the S series", consistent with Parker’s top figures. Temperature cuts further: in DNV’s approval of VOSS fittings, pressure reduction factors apply to stainless above 50 °C, against 120 °C for carbon steel. Our stainless DIN listings carry no manufacturer figure, so tell us the series, tube and working pressure and we will confirm them.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Tube and presetting in stainless.', anchor: 'preset' },
    {
      type: 'prose',
      html: '<p>Parker specifies seamless cold-drawn stainless tube in 1.4571 or 1.4541 to DIN/EN/ISO 1127, with a maximum hardness of <strong>HRB 90</strong> (steel tube is HRB 75). Harder tube resists the bite.</p><ul><li><strong>Preset in a hardened tool.</strong> Parker allows presetting steel and copper tube in the fitting body, but for stainless tube it does not recommend it and strongly recommends a hardened pre-assembly tool. Above 18 mm it recommends a hydraulic presetting tool, and strongly so for 30S, 35L, 38S and 42L.</li><li><strong>Turns.</strong> Parker’s manual preset is 1½ turns, then final assembly in the body to wrench resistance plus 1/12 turn. Expect stainless to need more force than steel for the same bite.</li><li><strong>Support sleeves</strong> go inside thin-wall tube so it does not collapse under the ring; Parker publishes a separate chart for stainless tube.</li><li><strong>Silver-plated nuts.</strong> Parker’s stainless nuts in 15L–42L and 12S–38S have silver-plated threads, which it says eliminate galling and cut assembly torque by up to 40%.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the bite before final assembly.',
      body: 'After presetting, a visible collar of tube material should be raised ahead of the ring’s cutting edge all the way round. No collar means no bite — and a stainless tube that slips out under pressure. Re-preset with the right tool rather than overtightening in the body.',
    },
    {
      type: 'prose',
      html: '<p>On soft-seal and swivel parts, metric makers fit FKM seals to stainless as standard. Our range includes stainless straight, elbow, tee, cross and bulkhead unions, NPT male connectors and elbows, female swivels, nuts, cutting rings, plugs and soft-seal caps in L, S and LL series.</p>',
    },

    { type: 'section_head', number: '/04', title: 'SAE flareless bite-type fittings.', anchor: 'flareless' },
    {
      type: 'prose',
      html: '<p>The inch-tube system that works on the same principle is the SAE flareless fitting to SAE J514 — Parker’s Ferulok is the best-known example. A one-piece sleeve (ferrule) bites into plain inch tube as the nut is tightened, with a visible bite, and the body has a 24° cone. But it is an inch system throughout: tube by inch OD, and nut threads that follow the 37° JIC thread for each dash size (-4 7/16-20, -8 3/4-16, -16 1 5/16-12). Inch flareless and metric 24° parts look alike on a bench and do not interchange.</p><ul><li><strong>Preset:</strong> Parker presets Ferulok sleeves finger-tight plus 1¾ turns in a hardened tool or the fitting body, with hydraulic presetting preferred above size 8, and final assembly at wrench resistance plus 1/6 to 1/4 turn. It warns that wrench torque must never be used as the gauge of a good preset.</li><li><strong>Ratings:</strong> in Parker’s tables stainless flareless is rated the same as steel — -4 6,000 psi, -8 5,000, -16 4,000.</li><li><strong>Tube:</strong> steel tube to RB72; stainless 304 or 316 to RB90. Parker notes a stainless sleeve springs back more than steel.</li></ul><p>Our flareless bite-type range is in <strong>zinc-plated carbon steel</strong> — unions, connectors, elbows and tees to NPTF, ORB and 37° JIC, nuts and sleeves — for inch-tube systems that do not need stainless. Where they do, ask and we will quote the stainless equivalent.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is DIN 2353 obsolete?', answer: 'No. ISO 8434-1 is now the main standard for 24° cutting-ring fittings, but DIN 2353:2013 is current and covers the stud-end fittings ISO 8434-1 leaves out.' },
        { question: 'What pressure are stainless DIN 2353 fittings rated for?', answer: 'Less than steel. In Parker’s tables a stainless L-series union is 315 bar for 6–18 mm and 160 bar for 22–42 mm tube; S series 630 bar at 6–14 mm, falling to 315 at 38 mm. VOSS quotes up to 315 bar L and 630 bar S.' },
        { question: 'What is the difference between L and S series?', answer: 'L (light) is general hydraulics; S (heavy) is the high-pressure series with heavier bodies and different nut threads for the same tube — L12 is M18×1.5, S12 is M20×1.5.' },
        { question: 'Can I preset stainless cutting rings in the fitting body?', answer: 'Parker does not recommend it for stainless tube; it strongly recommends a hardened pre-assembly tool, and a hydraulic tool for larger sizes.' },
        { question: 'What tube for stainless DIN fittings?', answer: 'Seamless cold-drawn 1.4571 or 1.4541 to DIN/EN/ISO 1127, maximum hardness HRB 90, per Parker.' },
        { question: 'Are SAE flareless and DIN 2353 fittings interchangeable?', answer: 'No. Flareless is an inch-tube system with UN/UNF nuts; DIN 2353 is metric tube with metric nut threads.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Stainless DIN 2353 cutting-ring fittings, and carbon-steel SAE flareless bite-type fittings:</p>' + stockList(['stainless-steel-din-2353-fittings', 'flareless-bite-type-tube-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Cutting-ring and flareless fittings',
      skus: ['IH-SS-5000L', 'IH-SS-5000S', 'IH-SS-5055L', 'IH-SS-5080L', 'IH-SS-5007L', 'IH-SS-5300L', 'IH-ST-47305', 'IH-ST-47205'],
    },
    { type: 'category_link', slug: 'stainless-steel-din-2353-fittings', label: 'Stainless DIN 2353 fittings', blurb: '24° cone cutting-ring fittings in L, S and LL series.' },
    { type: 'category_link', slug: 'flareless-bite-type-tube-fittings', label: 'Flareless bite-type fittings', blurb: 'SAE flareless fittings for inch tube, zinc-plated steel.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck machinery and ship hydraulics.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'din-2353-2013', text: 'DIN Media. DIN 2353:2013-01 — Non-soldering compression fittings with cutting ring.', url: 'https://www.dinmedia.de/en/standard/din-2353/169118397' },
        { id: 'voss-2sva', text: 'VOSS Fluid. Cutting ring 2S VA.', url: 'https://www.voss.net/en/products/product/cutting-ring-2s-va/' },
        { id: 'dnv-voss', text: 'DNV. Type Approval Certificate TAP0000167 — VOSS cutting-ring fittings, 2024.', url: 'https://www.voss.net/media/downloads/Aktuallisierung_Okt24/DNV_Certificate_TAP0000167_2SVA__ES-4__ES-4VA_23.08.2024-22.08.2029.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hydraulic-adapters-guide', 'stainless-jic-fittings', 'stainless-orfs-and-orb-fittings', 'fittings-on-european-machines'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Standard status from DIN Media; ratings, tube, presetting and Ferulok data from Parker Catalog 4300 (2017 edition — check the current edition); stainless ratings and temperature reduction from VOSS and DNV.',
    },
    {
      type: 'cta_block',
      heading: 'Metric tube in stainless?',
      body: 'Send the series, tube OD and wall, the ends and the working pressure and temperature. We will quote stainless cutting-ring fittings and confirm the rating.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
