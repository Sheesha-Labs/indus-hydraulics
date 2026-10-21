import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * BSP, metric, DIN 24° and JIS / Komatsu hose fittings. Sources read 2026-10-21: Parker Catalog 4400 US (ISO 12151-2
 * 24° cone L and S, "previously DIN 20 078 Part 4, 5, 8, 9", ISO 8434-1 / 8434-4; ISO 12151-6 BSPP 60° cone end
 * configurations; assembly rated at its weakest component). Parker Catalog 4300 (BS 5200 60° cone seals on a single
 * line of contact; JIS 30° flare and 60° cone interfaces with BSP threads; JIS 60° and BS 5200 60° cones not
 * interchangeable; Komatsu-style 30° flare, metric 1.5 mm pitch threads M14×1.5 … M42×1.5, 4,000 psi generally;
 * DIN L and S nut threads by tube OD). Listing copy (BSP 60° cone, flat seat, multiseal, double hex, compact,
 * BSPT male, banjo eye and bolt; metric 60° cone, 74° cone, flat seat, multiseal, banjo, waterwash insert; DIN 24° cone
 * light and heavy, O-ring cone, multiseal, male cone, standpipe, DIN 3870 nuts and DIN 3861 rings; JIS flange, JIS gas
 * 60° cone, Komatsu and Toyota female).
 * NOT used: JIS B8363 scope; "60° included" for the Komatsu 30° flare.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bsp-metric-din-and-jis-hose-fittings',
  title: 'BSP, metric, DIN and JIS hose fittings: 60° cones, 24° cones, banjos and Komatsu ends',
  excerpt:
    'A hose end has to match the port the machine was built with, and on European and Asian machines that means one of four families: BSP 60° cone, metric 24° cone (light or heavy), metric 60° and 74° cones, or JIS — including the Komatsu 30° flare on 1.5 mm-pitch threads that fits nothing else. The hose-end range for each family, the ISO 12151 parts that define them, banjos, multiseal and flat-seat ends, and how to identify the one you need.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'BSP, Metric, DIN & JIS Hose Fittings: 60°, 24° Cone, Komatsu',
  seoDescription:
    'A guide to BSP, metric, DIN 24° and JIS / Komatsu hydraulic hose fittings: 60° cone (ISO 12151-6), 24° cone light and heavy (ISO 12151-2), multiseal and flat seat, banjos, JIS and Komatsu 30° ends, and identification.',
  focusKeyword: 'bsp hose fittings',
  publishedAt: '2026-10-21T22:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'BSP female swivels seal on a 60° cone (BS 5200, ISO 12151-6) — a single line of contact with the male cone.',
        'Metric 24° cone hose ends (ISO 12151-2, formerly DIN 20078) come in light (L) and heavy (S) series with different nut threads for the same tube size; O-ring cone versions seal better than a plain cone.',
        '"Multiseal" and flat-seat ends seal on a 60° cone or a flat face; banjos seal on washers either side of the eye.',
        'JIS ends use BSP threads but their own 30° flare and 60° cone seats — Parker warns JIS and BS 5200 60° cones do not interchange.',
        'Komatsu-style 30° flare ends use metric 1.5 mm-pitch threads in every size (M14×1.5 to M42×1.5), so they do not fit 2 mm-pitch metric ports.',
      ],
    },
    {
      type: 'lead',
      html: 'A European excavator, an Indian tractor, a Japanese crane and a Chinese loader can all arrive in the same workshop, and none of them uses JIC. Their hoses end in BSP 60° cones, metric 24° cones, metric 60° cones or Japanese seats. This guide covers the hose ends for each family; for the adapters on the port side see <a href="/blog/bsp-hydraulic-adapters-guide">BSP adapters</a>, <a href="/blog/metric-hydraulic-adapters-guide">metric adapters</a> and <a href="/blog/din-2353-adapters-guide">DIN 2353 adapters</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The four families.', anchor: 'families' },
    {
      type: 'comparison_table',
      caption: 'Hose-end families on European and Asian machines',
      columns: ['Family', 'Standard', 'Seals on', 'Forms in our range'],
      rows: [
        { cells: ['BSP 60° cone', 'BS 5200 / ISO 12151-6', 'Female swivel nose on the male 60° cone', 'Female straight, 45°, 90°, compact and double hex; male 60° cone; flat seat; multiseal; BSPT male; banjo'], highlight: true },
        { cells: ['Metric 24° cone (DIN)', 'ISO 12151-2 (formerly DIN 20078); ISO 8434-1', 'Swivel nose in the 24° cone; O-ring cone for better sealing', 'Light and heavy female swivels straight, 45°, 90°; O-ring cone; multiseal; male cone; standpipe'] },
        { cells: ['Metric 60° and 74° cone', '—', '60° or 74° cone seats on metric threads', 'Female and male 60° cone, 74° cone, flat seat, multiseal, banjo'] },
        { cells: ['JIS and Komatsu', 'JIS (Parker: JIS B8363 for its 60° cones)', 'JIS 30° flare or 60° cone; Komatsu 30° flare', 'JIS flange, JIS gas 60° cone male, Komatsu and Toyota female'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'BSP 60° cone hose ends.', anchor: 'bsp' },
    {
      type: 'prose',
      html: '<p>Parker describes the BS 5200 60° seat as designed for sealing with BSP hose swivels, the seal being a single line of contact between the cone seat and the ballnose of the swivel — the BSP equivalent of an NPSM swivel. Parker lists its BSPP 60° cone ends under ISO 12151-6. Variants in our range: compact elbows for tight spaces, double-hex swivels so the fitting can be held while the nut turns, flat-seat ends for flat-face ports, "multiseal" ends that seal on either a 60° cone or a flat face, BSPT male for tapered ports, and banjo eyes with banjo bolts and sealing washers. Watch the JIS look-alike below.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Metric 24° cone (DIN) hose ends.', anchor: 'din' },
    {
      type: 'prose',
      html: '<p>The 24° cone hose end mates with a DIN 2353 / ISO 8434-1 male cone, and Parker lists it under ISO 12151-2 — previously DIN 20078. It comes in <strong>light (L)</strong> and <strong>heavy (S)</strong> series that share tube sizes but not threads (for 12 mm tube, M18×1.5 L and M20×1.5 S), so order the series. Female swivels with an O-ring in the 24° cone seal better than a plain cone; Parker classes the 24° cone with soft seal among its zero-leak connections. Our range also has 24° male cones, a standpipe for a cutting-ring fitting, and loose DIN 3870 nuts and DIN 3861 cutting rings in both series.</p>',
    },

    { type: 'section_head', number: '/04', title: 'JIS and Komatsu hose ends.', anchor: 'jis' },
    {
      type: 'prose',
      html: '<p>Japanese and Korean machines use JIS ends with BSP threads and their own 30° flare and 60° cone seats. Parker states that JIS and BS 5200 60° cones use the same thread and seat angle but differ in thread length, cone diameter and the BS 5200 bonded-seal pilot, and cannot be interchanged because the differences cause leaks. The Komatsu style is different again: a 30° flare on metric threads, 1.5 mm pitch at every size from M14×1.5 to M42×1.5, used only as a hose end and generally rated 4,000 psi. An M33×1.5 Komatsu nut will not thread onto an M33×2 port. Toyota-pattern female ends are listed separately. See <a href="/blog/fittings-on-a-used-japanese-machine">the 30° seat problem</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Identify by seat, pitch and series.',
      body: 'Three measurements settle most cases: the seat angle (60°, 30°, 24°, flat), the thread with its pitch (BSP TPI or metric pitch), and for 24° cones the series (L or S, from the nut thread). A hose end that threads on is not proof it seals.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a BSP hose fitting seal?', answer: 'The BSP female swivel’s nose seals on a 60° cone in the male (BS 5200, ISO 12151-6) — a single line of contact. Flat-seat and multiseal variants seal on a flat face.' },
        { question: 'What is a DIN hose fitting?', answer: 'A metric 24° cone hose end (ISO 12151-2, formerly DIN 20078) that mates with a DIN 2353 / ISO 8434-1 male cone, in light or heavy series.' },
        { question: 'What is a multiseal hose fitting?', answer: 'A female swivel designed to seal on either a 60° cone or a flat face, so one end fits both port styles.' },
        { question: 'Are JIS and BSP hose fittings interchangeable?', answer: 'No. They share BSP threads, but Parker says JIS and BS 5200 60° cones differ in thread length and cone diameter and cannot be interchanged.' },
        { question: 'What thread are Komatsu hose fittings?', answer: 'Metric with 1.5 mm pitch at every size (M14×1.5 to M42×1.5), with a 30° flare. They do not fit 2 mm-pitch metric ports.' },
        { question: 'How do banjo hose fittings seal?', answer: 'On two washers — one either side of the banjo eye — clamped by the hollow banjo bolt.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>BSP, metric, DIN 24° and JIS / Komatsu hose fittings:</p>' + stockList(['bsp-hose-fittings', 'metric-hose-fittings', 'din-hose-fittings', 'japanese-hose-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'BSP, metric, DIN and JIS hose fittings',
      skus: ['IH-BSP-FEM-60-45', 'IH-BSP-FEM-MS', 'IH-BSP-BANJO', 'IH-DF-FEM-24-OR-HS', 'IH-DF-FEM-24-MS-LS', 'IH-MF-FEM-60', 'IH-JP-KOMATSU-FEM', 'IH-JP-FLANGE'],
    },
    { type: 'category_link', slug: 'bsp-hose-fittings', label: 'BSP hose fittings', blurb: '60° cone, flat seat, multiseal and banjo hose ends.' },
    { type: 'category_link', slug: 'din-hose-fittings', label: 'DIN hose fittings', blurb: 'Metric 24° cone hose ends, light and heavy series.' },
    { type: 'category_link', slug: 'japanese-hose-fittings', label: 'Japanese hose fittings', blurb: 'JIS, Komatsu and Toyota hose ends.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'European and Asian site machines.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 — sections H, I and J (2017 edition).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['bsp-hydraulic-adapters-guide', 'metric-hydraulic-adapters-guide', 'fittings-on-a-used-japanese-machine', 'fittings-on-european-machines', 'braided-hose-crimp-fittings-guide', 'jic-orfs-and-npt-hose-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'End standards from Parker Catalog 4400; seat, thread and interchange rules from Parker Catalog 4300; forms from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a hose end?',
      body: 'Send the seat angle, thread and pitch (or a photo with a ruler), the series for 24° cones, and the hose. We will match the end and quote it with the ferrule.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
