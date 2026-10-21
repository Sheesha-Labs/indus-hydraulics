import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * SAE four-bolt flange adapters. Sources read 2026-10-21: Parker Catalog 4300 (2017; current 9/2023) Section L —
 * four-bolt flanges conforming to SAE J518 and ISO 6162-1 and -2, "proven, leak-free connections, especially suited
 * for larger sizes, higher pressures", "Up to 6000 psi capability through 2" size (Code 62 only)"; threaded ports
 * lose pressure capability above size 12 (M27) while torque rises; Parker recommends ORB, four-bolt flange or ISO
 * 6149 over pipe threads. Hydroscand SAE flange table citing SAE J518c (Code 61 / 62 by size; 2½" and 3" Code 61).
 * Listing titles (JIC, ORFS, NPTF, ORB, weld and metric bite-type ends; flange heads and flange pad adapters).
 * NOT used: Code 61 figures above 3" (conflicting); ISO 6162 MPa classes (unverified).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sae-flange-adapters-guide',
  title: 'SAE flange adapters: Code 61 and Code 62 flange heads, pad adapters and how to choose them',
  excerpt:
    'Above 1" and on pump ports, threads give way to four bolts and an O-ring. An SAE flange adapter turns that four-bolt port into a JIC, ORFS, NPTF, ORB or weld connection — in Code 61 to 5,000 psi in small sizes, or Code 62 to 6,000 psi through 2". Flange heads versus flange pad adapters, Code 61 against Code 62, pressure by size, and what an order has to state.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'SAE Flange Adapters: Code 61 vs Code 62, Ratings & Types',
  seoDescription:
    'SAE J518 four-bolt flange adapters explained: Code 61 and Code 62 flange heads and pad adapters, pressure ratings by size, JIC, ORFS, NPTF, ORB and weld ends, and how to specify a flange adapter.',
  focusKeyword: 'sae flange adapter',
  publishedAt: '2026-10-21T19:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'SAE J518 / ISO 6162 four-bolt flanges are the connection for large, high-pressure ports: Parker calls them proven, leak-free and especially suited to larger sizes and higher pressures.',
        'Code 61 is the standard-pressure series: 5,000 psi from ½" to 1", 4,000 psi at 1¼", 3,000 psi at 1½" and 2". Code 62 is 6,000 psi through 2".',
        'Code 61 and Code 62 heads of the same nominal size are different dimensions — the bolt pattern and head thickness differ — and do not interchange.',
        'A flange head adapter is clamped by split flange halves or a one-piece flange; a flange pad adapter bolts directly to the port and offers a thread on its face.',
        'Specify code, nominal size, the other end and the bolts — and whether the port is inch or metric bolted.',
      ],
    },
    {
      type: 'lead',
      html: 'Threaded ports have a size limit. Parker notes that straight-thread O-ring ports keep 6,000 psi and higher capability only up to size 12 (M27); above it the rating falls and the torque needed climbs fast. Pumps, motors and large valves therefore use the four-bolt SAE flange, and the adapter that meets it is how a hose, tube or pipe connects. For telling Code 61 from Code 62 on a machine, see <a href="/blog/sae-j518-code-61-code-62-flanges">SAE J518 Code 61 and Code 62 flanges</a>; this guide is about the adapters.',
    },

    { type: 'section_head', number: '/01', title: 'Code 61 and Code 62.', anchor: 'codes' },
    {
      type: 'comparison_table',
      caption: 'SAE J518 four-bolt flange working pressure by size',
      columns: ['Nominal size', 'Dash', 'Code 61', 'Code 62'],
      rows: [
        { cells: ['½"', '-8', '5,000 psi (345 bar)', '6,000 psi (414 bar)'] },
        { cells: ['¾"', '-12', '5,000 psi (345 bar)', '6,000 psi (414 bar)'] },
        { cells: ['1"', '-16', '5,000 psi (345 bar)', '6,000 psi (414 bar)'], highlight: true },
        { cells: ['1¼"', '-20', '4,000 psi (276 bar)', '6,000 psi (414 bar)'] },
        { cells: ['1½"', '-24', '3,000 psi (207 bar)', '6,000 psi (414 bar)'] },
        { cells: ['2"', '-32', '3,000 psi (207 bar)', '6,000 psi (414 bar)'], highlight: true },
        { cells: ['2½"', '-40', '2,500 psi (172 bar)', '—'] },
        { cells: ['3"', '-48', '2,000 psi (138 bar)', '—'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The nominal size is the flange bore, not a thread. Code 62 holds 6,000 psi to 2" because its head is thicker and its bolts larger; Code 61 trades pressure for a lighter flange and is offered in bigger sizes. Some adapter families also label them "L-series" (3,000 psi class) and "S-series" (6,000 psi class), especially on metric-tube flange connectors — read L as Code 61 and S as Code 62 when matching.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Flange heads and flange pad adapters.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'The two ways an adapter meets a four-bolt port',
      columns: ['Type', 'How it attaches', 'Typical other end'],
      rows: [
        { cells: ['Flange head adapter (straight, 45°, 90°)', 'A flanged head with an O-ring groove, clamped to the port by split flange halves or a one-piece flange and four bolts', 'JIC 37° male, ORFS male, metric 24° bite type, weld tube'], highlight: true },
        { cells: ['One-piece tube elbow', 'Head and bend in one forging — no extra joint at the port', 'JIC 37° male'] },
        { cells: ['Flange pad adapter', 'A block that bolts straight to the port, with its own O-ring', 'NPTF, ORB, JIC or ORFS on its face'] },
        { cells: ['Weld flange connector', 'Flange head with a weld end for tube or pipe', 'Butt weld to the line'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>A flange head needs the clamp hardware: two split flange halves or a one-piece flange, four bolts and an O-ring of the right size and compound. A pad adapter carries its own bolt holes and is the quick way to put a threaded port where a flange was — useful for a gauge or test point, or to adapt a pump to an existing threaded line, at the threaded end’s lower rating. Elbow heads let the line leave the port in the direction it needs without a second fitting.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Tighten the bolts evenly.',
      body: 'Draw a four-bolt flange down in a cross pattern, a little at a time, so the head seats flat on the O-ring. Tightening one bolt fully first cocks the flange, extrudes the O-ring on the far side and can crack a cast port. Use the bolt grade and torque the flange maker gives.',
    },

    { type: 'section_head', number: '/03', title: 'How to order.', anchor: 'order' },
    {
      type: 'comparison_table',
      caption: 'Describing an SAE flange adapter',
      columns: ['Item', 'Example'],
      rows: [
        { cells: ['Code', 'Code 62'], highlight: true },
        { cells: ['Nominal size', '1" (-16)'] },
        { cells: ['Type', 'Flange head, 90° elbow; or flange pad adapter'] },
        { cells: ['Other end', 'JIC 37° male -16; or ORFS male -16; or NPTF female 1"'] },
        { cells: ['Clamp hardware', 'Split flange halves or one-piece flange, bolts (inch or metric), O-ring compound'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between Code 61 and Code 62?', answer: 'Pressure and size. Code 61 is rated 5,000 psi to 1", falling to 3,000 psi at 1½–2"; Code 62 is 6,000 psi through 2" with a thicker head and larger bolts. Same nominal sizes, different dimensions — they do not interchange.' },
        { question: 'What is an SAE flange adapter?', answer: 'A fitting that connects a four-bolt SAE J518 port to another connection — JIC, ORFS, NPTF, ORB or a weld end — either through a flanged head clamped by split flanges or as a pad adapter bolted to the port.' },
        { question: 'Are L-series and S-series the same as Code 61 and 62?', answer: 'In flange adapter ranges, L-series is the 3,000 psi class (Code 61) and S-series the 6,000 psi class (Code 62). Check the bolt pattern to be sure.' },
        { question: 'Why use a flange instead of a threaded port?', answer: 'Threaded O-ring ports lose pressure capability above size 12 (M27) and need very high torque; a four-bolt flange spreads the load over four bolts and seals on an O-ring.' },
        { question: 'What does a flange pad adapter do?', answer: 'It bolts directly to a four-bolt port and provides a threaded port — NPTF, ORB, JIC or ORFS — on its face.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel Code 61 and Code 62 flange heads, one-piece elbows, pad adapters and weld flange connectors:</p>' + stockList(['sae-flange-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'SAE flange adapters',
      skus: ['IH-ST-1800', 'IH-ST-1804', 'IH-ST-FS1700', 'IH-ST-FS1804', 'IH-ST-NB6892', 'IH-ST-W43', 'IH-ST-W48', 'IH-AD-SAEFL-002'],
    },
    { type: 'category_link', slug: 'sae-flange-adapters', label: 'SAE flange adapters', blurb: 'Code 61 and Code 62 flange heads, pad adapters and weld connectors.' },
    { type: 'category_link', slug: 'hydraulic-sae-flanges', label: 'SAE flanges', blurb: 'Split flange halves and one-piece flanges to clamp them.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300, Section L (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'hydroscand-sae', text: 'Hydroscand. SAE flange dimensions (citing SAE J518c).', url: 'https://hydroscand.se/en-us/fakta-guider/sae-flansar-dimensioner' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['sae-j518-code-61-code-62-flanges', 'jic-adapters-guide', 'orfs-and-orb-adapters-guide', 'stainless-jic-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Flange system and port limits from Parker Catalog 4300 (2017 edition); pressures by size from a table citing SAE J518.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a flange port?',
      body: 'Send the code, nominal size and the connection you need on the other side — or a photo of the port with its bolt spacing. We will quote the adapter and the clamp hardware.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
