import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Push-to-connect pneumatic fittings. Sources read 2026-10-21: our listings (engineering-plastic body, POM release
 * collet, stainless gripping teeth, internal O-ring; manufacturer's rating 0–150 psi, vacuum to −29.5 inHg, 32–140 °F;
 * compressed air only, not other gases, water, oil or hydraulic service; inch OD nylon or polyurethane tube cut
 * square). SMC KQ2 catalogue (stainless chuck grips, POM collet and release button, NBR packing; special profile seals
 * and eases insertion; chuck and collet release so they do not bite excessively; inch KQ2 1.0 MPa max operating,
 * 3.0 MPa proof; −5 to 60 °C; surge pressure must stay under max operating pressure). Parker Catalog 3501E (Prestolok
 * PLP: stainless grab ring, nitrile seal, up to 300 psi depending on tubing, 28" Hg vacuum, 95 Shore A polyurethane;
 * composite Prestolok 290 psi; cut square, max 15° off; mark insertion length, insert to bottom, pull to verify;
 * insertion depth tables). ISO 14743:2020 scope (push-in connectors for thermoplastic tube 3–16 mm OD incl. inch; not
 * for air braking systems).
 * NOT used: tube OD tolerance figures (not found for pneumatic tube); SMC "not for leak testers" wording.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'push-to-connect-air-fittings',
  title: 'Push-to-connect air fittings: how they grip and seal, ratings, tube, and the mistakes that make them leak',
  excerpt:
    'A push-to-connect fitting does two jobs with two parts: stainless teeth grip the tube, an O-ring seals it. Push the tube only past the teeth and it holds — and leaks. Straight, elbow, tee, Y, bulkhead and banjo fittings for plastic air tube: how they work, ratings (ours 0–150 psi, vacuum to −29.5 inHg, 32–140 °F), the tube they need, ISO 14743, and why they never belong on hydraulic or air-brake lines.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Push-to-Connect Air Fittings: Ratings, Tube & Installation',
  seoDescription:
    'A guide to push-to-connect pneumatic fittings: how the collet and O-ring grip and seal, pressure, vacuum and temperature ratings, nylon and polyurethane tube, cutting and insertion depth, ISO 14743, and what not to use them for.',
  focusKeyword: 'push to connect air fittings',
  publishedAt: '2026-10-21T20:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Inside every push-to-connect fitting: a ring of stainless teeth that grips the tube, an O-ring that seals on its outside diameter, and a release collet that frees it.',
        'Our plastic-bodied range is rated by its maker at 0–150 psi, vacuum to −29.5 inHg and 32–140 °F, for compressed air only.',
        'Ratings vary by make and by the tube: SMC gives 1.0 MPa (145 psi) for its KQ2 inch range; Parker up to 300 psi for metal Prestolok "depending on tubing".',
        'Cut the tube square (Parker allows at most 15° off), mark the insertion depth, push it to the bottom and pull to check.',
        'Not for hydraulics, water hammer or air brakes — ISO 14743, the push-in connector standard, explicitly excludes air braking systems.',
      ],
    },
    {
      type: 'lead',
      html: 'Push-to-connect fittings changed how pneumatic machines are built: no spanners, no nuts, a tube that goes in by hand and comes out by pressing a collar. They are also the fitting most often blamed for leaks that are really installation faults. This guide covers how they work, what they are rated for, the tube they need and how to fit them so they stay tight.',
    },

    { type: 'section_head', number: '/01', title: 'How they grip and seal.', anchor: 'how' },
    {
      type: 'prose',
      html: '<p>SMC describes its KQ2 design plainly: a stainless steel chuck grips the tube, a POM collet and release button free it, and an NBR packing seals with a profile that both seals and eases insertion. Parker’s metal Prestolok uses a stainless grab ring and a nitrile seal. Pressing the release collet lifts the teeth off the tube; SMC notes this also stops the teeth biting in excessively when the tube is removed. Our range follows the same pattern — an engineering-plastic body, POM release collet, stainless teeth and an internal O-ring — in straight and reducing unions, elbows, tees, crosses, Y connectors, bulkheads, banjo elbows, plugs and end caps, with NPT threads where they meet a port.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Ratings.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Push-to-connect ratings by maker and range',
      columns: ['Range', 'Pressure', 'Vacuum', 'Temperature'],
      rows: [
        { cells: ['Our push-to-connect range (maker’s figures)', '0–150 psi (0–9.9 bar)', 'to −29.5 inHg', '32–140 °F (0–60 °C)'], highlight: true },
        { cells: ['SMC KQ2, inch', '1.0 MPa (145 psi) max operating; 3.0 MPa proof', '—', '−5 to 60 °C'] },
        { cells: ['Parker Prestolok PLP (metal)', 'Up to 300 psi, depending on tubing', '28" Hg', '0 to +200 °F'] },
        { cells: ['Parker Prestolok composite', '290 psi (20 bar)', '—', '−4 to +175 °F'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two rules sit behind every figure. The tube can limit the joint before the fitting does — Parker states its Prestolok rating depends on the tubing used. And surges count: SMC requires surge pressure to stay below the maximum operating pressure, so a line that sees pressure spikes needs headroom. Our range is for compressed air only — not other gases, water, oil or hydraulic service.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Tube and installation.', anchor: 'install' },
    {
      type: 'prose',
      html: '<ul><li><strong>Use the right tube.</strong> Nylon or polyurethane air tube of the fitting’s outside diameter. Parker specifies 95 Shore A polyurethane for its metal Prestolok; softer tube may need a tube support.</li><li><strong>Cut it square.</strong> Use a tube cutter, not side cutters. Parker allows a maximum of 15° off square.</li><li><strong>Mark the insertion depth</strong> and push the tube in until it bottoms. Parker publishes full insertion depth and the minimum to pass the O-ring for each size — for example 0.78" full and 0.51" to the O-ring for ⅜" tube in its metal range.</li><li><strong>Pull to check.</strong> A tube pushed past the grab ring but not the O-ring will hold and still leak.</li><li><strong>To release,</strong> push the tube in slightly, hold the collet down and pull the tube out. Re-cut a scored tube end before refitting.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not for air brakes, hydraulics or water hammer.',
      body: 'ISO 14743, the push-in connector standard for thermoplastic tube from 3 to 16 mm OD, states that it does not apply to air braking systems — use DOT air brake fittings there. Push-in fittings are not hydraulic fittings, and a pressure spike above their rating can eject the tube.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 14743:2020',
      publisher: 'ISO',
      title: 'Pneumatic fluid power — Push-in connectors for thermoplastic tubes',
      summary:
        'General requirements and test methods for the design and performance of push-in connectors for thermoplastic tubes from 3 mm to 16 mm OD, including inch sizes. It does not apply to air braking systems.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do push-to-connect fittings work?', answer: 'Stainless teeth grip the tube as it is pushed in and an O-ring seals on its outside diameter. Pressing the release collet lifts the teeth so the tube can be pulled out.' },
        { question: 'What pressure are push-to-connect fittings rated for?', answer: 'It depends on the make and the tube. Our range is rated 0–150 psi; SMC’s KQ2 inch range 145 psi (1.0 MPa); Parker’s metal Prestolok up to 300 psi depending on tubing.' },
        { question: 'Why is my push-in fitting leaking?', answer: 'Usually the tube is not fully inserted, was cut at an angle, is scored, or is the wrong OD or too soft. Re-cut square, push to the bottom and pull to check.' },
        { question: 'Can push-to-connect fittings be used for water?', answer: 'Our range is for compressed air only. Some makers offer push-in fittings rated for water; use one that states it.' },
        { question: 'Can I use push-in fittings on truck air brakes?', answer: 'No. Use DOT air brake push-in fittings made to SAE J2494 and FMVSS 106; ISO 14743 pneumatic connectors exclude air brakes.' },
        { question: 'Do push-to-connect fittings work on vacuum?', answer: 'Many do — ours are rated to −29.5 inHg, Parker’s metal Prestolok to 28" Hg.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Push-to-connect fittings for inch plastic air tube:</p>' + stockList(['push-to-connect-pneumatic-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Push-to-connect fittings',
      skus: ['IH-PN-PC', 'IH-PN-PL', 'IH-PN-PUC', 'IH-PN-PUT', 'IH-PN-PT', 'IH-PN-PMM', 'IH-PN-PWT', 'IH-PN-PP'],
    },
    { type: 'category_link', slug: 'push-to-connect-pneumatic-fittings', label: 'Push-to-connect pneumatic fittings', blurb: 'Unions, elbows, tees, Y, bulkhead and banjo fittings for air tube.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'smc-kq2', text: 'SMC. One-touch Fittings Series KQ2 catalogue.', url: 'https://content2.smcetech.com/pdf/KQ2.pdf' },
        { id: 'parker-3501e', text: 'Parker Hannifin. Catalog 3501E — Brass, Composite and Thermoplastic Fittings and Valves (rev. 05/22).', url: 'https://www.parker.com/content/dam/parker/lam/catalogs/pdf/4---conectores---mangueiras---v%C3%A1lvulas---instrumentos-para-flu%C3%ADdos/1---baixa-press%C3%A3o/Brass,%20Composite%20and.pdf' },
        { id: 'iso-14743', text: 'ISO 14743:2020 — Push-in connectors for thermoplastic tubes.', url: 'https://www.iso.org/standard/73164.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['brass-air-brake-fittings-guide', 'brass-pipe-fittings-nptf-and-bsp', 'brass-flare-and-compression-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Our range’s ratings are the maker’s published figures on each listing; SMC and Parker figures from their catalogues; scope from ISO 14743.',
    },
    {
      type: 'cta_block',
      heading: 'Plumbing an air line?',
      body: 'Send the tube OD and material, the threads at each port and the working pressure. We will quote push-to-connect fittings to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
