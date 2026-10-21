import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Steel DIN 2353 / ISO 8434-1 24° cone adapters. Sources read 2026-10-21: DIN Media (DIN 2353:2013-01 current, covers
 * stud-end fittings not in DIN EN ISO 8434-1); Parker Catalog 4300 (2017; current 9/2023) Section E: EO made to DIN
 * 2353 "which today is represented by international standard 8434-1"; union ratings for zinc-plated steel (CF) by
 * series and OD; steel tube max HRB 75; presetting in the fitting body acceptable for steel and copper tube; hardened
 * pre-assembly tool for frequent presetting; hydraulic tool recommended above 18 mm; manual preset 1½ turns, final
 * wrench resistance + 1/12 turn; support sleeves; EO-2 steel NBR seals. VOSS/DNV certificate: L 500/400/250, S
 * 800/630/420 bar by OD; carbon-steel pressure reduction above 120 °C. Volz series threads (L12 M18×1.5, L22 M30×2,
 * S12 M20×1.5, S38 M52×2). Listing titles (stud ends with ED seal, BSPP, BSPT, NPT, metric; banjos; swivels; weld and
 * orbital-weld nipples; pump connectors).
 * NOT used: per-size thread table beyond the examples above.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'din-2353-adapters-guide',
  title: 'DIN 2353 adapters: 24° cone fittings in L and S series — ratings, stud ends and presetting',
  excerpt:
    'Every DIN 2353 fitting is two choices before it is a shape: light or heavy series, and which stud end. A 12 mm L-series union and a 12 mm S-series union take the same tube and different nuts, and their pressure ratings differ by more than half again. The steel 24° cone range — unions, elbows, tees, stud connectors with ED seals, banjos, swivels and weld nipples — with series ratings by tube size and how to preset the ring.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DIN 2353 Fittings: L & S Series Ratings, Stud Ends, Presetting',
  seoDescription:
    'A guide to steel DIN 2353 / ISO 8434-1 24° cone cutting-ring adapters: LL, L and S series, pressure ratings by tube OD, ED-seal and BSPP stud ends, banjos and swivels, presetting and how to order.',
  focusKeyword: 'din 2353 fittings',
  publishedAt: '2026-10-21T19:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'DIN 2353 24° cone cutting-ring fittings are now standardised mainly as ISO 8434-1; DIN 2353:2013 remains current for the stud-end fittings ISO 8434-1 does not contain.',
        'Order the series as well as the tube: L (light) and S (heavy) share tube ODs but not nut threads — 12 mm is M18×1.5 in L and M20×1.5 in S.',
        'Steel ratings by tube OD: L series 500 bar at 6–10 mm, 400 bar at 12–18 mm, 250 bar at 22–42 mm; S series 800, 630 and 420 bar.',
        'The stud end is a separate decision: BSPP or metric with an ED soft seal or metal edge, BSPT and NPT tapers, or banjo.',
        'In steel the ring can be preset in the fitting body; larger sizes and frequent work want a hardened tool or a hydraulic presetting machine.',
      ],
    },
    {
      type: 'lead',
      html: 'Open the hydraulics on a European excavator, crane, tractor or machine tool and the tube joints are almost all 24° cone cutting-ring fittings. The connection itself is simple; the ordering is not, because every fitting carries a series, a tube size and often a stud end. This guide covers the range and how to specify it. For why European machines use it and how to spot L and S on the machine, see <a href="/blog/fittings-on-european-machines">fittings on European machines</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Series and ratings.', anchor: 'series' },
    {
      type: 'comparison_table',
      caption: 'Steel 24° cone fitting ratings by series and tube OD (Parker EO, zinc-plated steel; VOSS under DNV)',
      columns: ['Series', 'Tube OD (mm)', 'Rating', 'Nut thread examples'],
      rows: [
        { cells: ['LL — extra light', '4–12', '100 bar', '—'] },
        { cells: ['L — light', '6, 8, 10', '500 bar', '—'] },
        { cells: ['L — light', '12, 15, 18', '400 bar', 'L12: M18×1.5'], highlight: true },
        { cells: ['L — light', '22, 28, 35, 42', '250 bar', 'L22: M30×2'] },
        { cells: ['S — heavy', '6, 8, 10', '800 bar', '—'] },
        { cells: ['S — heavy', '12, 14, 16', '630 bar', 'S12: M20×1.5'], highlight: true },
        { cells: ['S — heavy', '20, 25, 30, 38', '420 bar', 'S38: M52×2'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>VOSS’s figures under its DNV type approval match Parker’s steel column, and DNV notes that carbon-steel ratings are reduced above 120 °C. Stainless is rated lower — see <a href="/blog/stainless-din-2353-and-flareless-bite-fittings">stainless DIN 2353</a>. Because L and S use different nut threads on the same tube, a heavy-series body will not take a light-series nut; mixing them is the most common DIN ordering mistake.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The shapes and stud ends.', anchor: 'shapes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Tube-to-tube</strong>: straight unions, union elbows, tees, crosses and bulkhead unions, all with 24° cones, nuts and cutting rings.</li><li><strong>Stud connectors and stud elbows</strong>: a 24° cone on one end and a port thread on the other — BSPP or metric parallel with an <strong>ED</strong> elastomer seal or a metal sealing edge, or tapered BSPT or NPT.</li><li><strong>Adjustable stud ends</strong>: elbows and tees with a locknut and O-ring stud so they can be aimed before locking.</li><li><strong>Swivel connectors</strong>: a 24° female swivel nut onto a male 24° cone, BSPP 60° cone, metric or flat face — for joining to a fitting without turning it.</li><li><strong>Banjos</strong>: high-pressure banjo elbows for tight clearances.</li><li><strong>Weld and orbital-weld nipples</strong> and <strong>pump connectors</strong> for weld-in and pump-port joints.</li><li><strong>Nuts, cutting rings, plugs and soft-seal caps</strong> for spares and blanking.</li></ul><p>A stud end with an ED seal seals on the port face, not the thread; see <a href="/blog/bsp-hydraulic-adapters-guide">BSP adapters</a> and <a href="/blog/metric-hydraulic-adapters-guide">metric adapters</a> for the port forms.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Presetting the ring in steel.', anchor: 'preset' },
    {
      type: 'prose',
      html: '<p>The cutting ring has to be preset — driven into its cone until its edge cuts into the tube — before the joint is finally made up. Parker’s guidance for steel tube:</p><ul><li>Use seamless steel tube no harder than HRB 75.</li><li>Steel and copper tube can be preset in the fitting body itself; for frequent presetting, a hardened pre-assembly tool lasts longer.</li><li>Above 18 mm, a hydraulic presetting tool is recommended.</li><li>Manual preset is 1½ turns; final assembly is to wrench resistance plus 1/12 turn.</li><li>Fit support sleeves in thin-wall tube so the ring cannot collapse it.</li></ul><p>After presetting, the bite is visible: a raised collar of tube material ahead of the ring’s edge. No collar, no grip.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not mix makers’ rings and nuts.',
      body: 'Cutting rings, nuts and bodies are designed together. A ring from one maker in another maker’s body may look identical and still bite differently. Keep each joint to one maker, and replace the ring if the tube is cut back.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between DIN 2353 L and S series?', answer: 'L (light) and S (heavy) take the same tube ODs but use different nut threads and bodies; S is rated higher. A 12 mm L-series nut is M18×1.5, an S-series nut M20×1.5.' },
        { question: 'What pressure are DIN 2353 fittings rated for?', answer: 'In steel, L series 500 bar at 6–10 mm, 400 bar at 12–18 mm and 250 bar at 22–42 mm; S series 800, 630 and 420 bar. Ratings fall above 120 °C.' },
        { question: 'Is DIN 2353 the same as ISO 8434-1?', answer: 'For the connection, yes — ISO 8434-1 is now the main standard. DIN 2353:2013 is still current for stud-end fittings ISO 8434-1 does not cover.' },
        { question: 'What is an ED seal?', answer: 'An elastomer seal held in a groove under the stud end’s hex, sealing on the port face of a BSPP or metric parallel port — not on the thread.' },
        { question: 'Can I preset a cutting ring in the fitting body?', answer: 'For steel tube, yes; Parker recommends a hardened tool for frequent presetting and a hydraulic tool above 18 mm. For stainless, use the tool.' },
        { question: 'Can I reuse a cutting ring?', answer: 'A preset ring stays on its tube and can be remade on the same body. If the tube is cut back, fit a new ring.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel 24° cone DIN 2353 fittings and adapters:</p>' + stockList(['din-2353-bite-type-adapters-uae']),
    },
    {
      type: 'product_embed',
      heading: 'DIN 2353 adapters',
      skus: ['IH-AD-DIN-044', 'IH-AD-DIN-045', 'IH-AD-DIN-014', 'IH-AD-DIN-040', 'IH-AD-DIN-038', 'IH-AD-DIN-019', 'IH-AD-DIN-037', 'IH-AD-DIN-003'],
    },
    { type: 'category_link', slug: 'din-2353-bite-type-adapters-uae', label: 'DIN 2353 adapters', blurb: 'Steel 24° cone unions, stud ends, swivels, banjos, nuts and rings.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'European excavators, cranes and site machines.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300, Section E (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'din-2353-2013', text: 'DIN Media. DIN 2353:2013-01 — Non-soldering compression fittings with cutting ring.', url: 'https://www.dinmedia.de/en/standard/din-2353/169118397' },
        { id: 'dnv-voss', text: 'DNV. Type Approval Certificate TAP0000167 — VOSS cutting-ring fittings, 2024.', url: 'https://www.voss.net/media/downloads/Aktuallisierung_Okt24/DNV_Certificate_TAP0000167_2SVA__ES-4__ES-4VA_23.08.2024-22.08.2029.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['fittings-on-european-machines', 'stainless-din-2353-and-flareless-bite-fittings', 'metric-hydraulic-adapters-guide', 'bsp-or-metric-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, tube and presetting from Parker Catalog 4300 Section E (2017 edition) and VOSS’s DNV approval; standard status from DIN Media.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering DIN fittings?',
      body: 'Send the tube OD, the series (or the nut thread), the shape and the stud end. We will match the part and quote it with rings and nuts from the same range.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
