import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'
import { HELD_SKUS } from '../held'

/**
 * Fire sleeves, fire tape and metal hose guards: interlocked lock-section, Smooth-Flex and ball-joint Armor-Flex.
 * Sources read 2026-10-21: Thorburn Flex Metallic Hose Assemblies catalogue (LS lock section p.20 with packing limits;
 * AF Armor-Flex p.21, 1100 °C with insulation; SFM Smooth-Flex p.22, low pressure, packing temperatures; FJ72/FJ73
 * Fry-Sil p.23: 260 °C continuous, 1090 °C 15–20 min, 1650 °C 15–30 s); Witzenmann stripwound hose page (less
 * leak-tight than corrugated; material limits); ISO 15541 scope (non-metallic hose fire test); FM 1637 and UL 2443
 * (flexible sprinkler hose); API 6FA / API 607 / ISO 10497 are valve fire tests.
 * NOT used: any ISO 10380 fire-test clause; 304 vs 316 pitting claims.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fire-sleeves-and-metal-hose-guards',
  title: 'Fire sleeves and metal hose guards: what “fire-safe” means, and how interlocked hose differs',
  excerpt:
    'A silicone-coated fire sleeve buys a hydraulic hose a few minutes near a furnace; an interlocked metal hose carries dust, exhaust or grain but is not leak-tight; a ball-joint guard protects a hose from impact and molten splash. What the maker’s fire ratings actually say — continuous versus 15-minute versus 30-second — why “fire-safe” on a hose usually borrows a valve standard, and how to choose between lock-section, Smooth-Flex and Armor-Flex.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Fire Sleeves & Metal Hose Guards: Ratings Explained',
  seoDescription:
    'Fire sleeve and fire tape ratings (continuous vs short exposure), what fire-safe hose standards really cover, interlocked lock-section vs Smooth-Flex vs ball-joint Armor-Flex hose guards, packing and temperature limits.',
  focusKeyword: 'hose fire sleeve',
  publishedAt: '2026-10-22T00:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Read fire-sleeve ratings by duration: Thorburn’s Fry-Sil jacket is 260 °C continuous, 1090 °C for 15–20 minutes, 1650 °C for 15–30 seconds.',
        'API 6FA, API 607 and ISO 10497 are fire tests for valves; ISO 15540/15541 cover non-metallic hose on ships — check what a “fire-safe” hose claim actually cites.',
        'Interlocked (stripwound) hose is not leak-tight unless packed; it carries air, exhaust and dry bulk, or protects other hoses.',
        'Smooth-Flex is interlocked hose with a smooth liner for bulk conveying, rated only to about 15–20 psi.',
        'Ball-joint Armor-Flex guards have no interlocking parts to limit bending; with insulation Thorburn rates them to 1100 °C.',
      ],
    },
    {
      type: 'lead',
      html: 'Hoses near furnaces, ladles, welding bays and hot exhausts fail from the outside in. The usual fixes are a fire sleeve over the hose, a metal guard around it, or an all-metal hose in place of it. Each protects against something different, and the ratings that sell them are easy to misread. For corrugated pressure-tight metal hose itself, see <a href="/blog/corrugated-stainless-steel-hose">corrugated stainless steel hose</a> and <a href="/blog/metal-hose-guide">the metal hose guide</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Fire sleeves and fire tape.', anchor: 'sleeves' },
    {
      type: 'comparison_table',
      caption: 'Thorburn FJ72 Fry-Sil fire jacket ratings',
      columns: ['Exposure', 'Rating'],
      rows: [
        { cells: ['Continuous', '260 °C (500 °F)'], highlight: true },
        { cells: ['15–20 minutes', 'Up to 1090 °C (2000 °F)'] },
        { cells: ['15–30 seconds', 'Up to 1650 °C (3000 °F)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The jacket is woven fibreglass coated in iron-oxide silicone rubber: it protects against molten spatter and short flame exposure, and is oil- and water-resistant. It does not make a hose rated for 1000 °C service — the continuous figure is the one to design to. Where a sleeve cannot be slid on because the hose or cable cannot be disconnected, the same material comes as <strong>fire tape</strong> (FJ73) in 1, 2 and 3 in widths.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check what a “fire-safe” claim cites.',
      body: 'API 6FA, API 607 and ISO 10497 are fire tests for valves, not hoses. ISO 15541 covers non-metallic hose assemblies on ships (up to 150 mm, 16 bar, water). Flexible sprinkler hose has its own approvals — FM 1637 and UL 2443. An all-metal hose is fire-resistant by construction; a rubber hose with a sleeve is fire-protected for a time.',
    },

    { type: 'section_head', number: '/02', title: 'Interlocked hose and guards.', anchor: 'guards' },
    {
      type: 'comparison_table',
      caption: 'Thorburn metal hose guards and interlocked hose',
      columns: ['Product', 'Construction', 'Pressure', 'Use'],
      rows: [
        { cells: ['LS lock section', 'Single strip, S-profile interlock', 'Not leak-tight unless packed', 'Air, exhaust, dry bulk, protective casing'], highlight: true },
        { cells: ['SFM Smooth-Flex', 'Interlock with smooth inner liner', 'About 15–20 psi with packing', 'Pneumatic and gravity bulk conveying'] },
        { cells: ['AF Armor-Flex', 'Concave and convex ball-joint sections', 'None — a guard', 'Impact, abrasion and molten splash protection'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Interlocked hose’s temperature limit is set by its <strong>packing</strong>, not just its metal: Thorburn gives cotton and elastomer packing to 180 °F, Pyro-Pak to 1000 °F, and hard copper or stainless wire to 1200 °F. Witzenmann gives material limits of 400 °C for hot-dip galvanised steel and 600 °C for 1.4301 stainless. Galvanised steel belongs in guards and interlocked hose, never in a pressure-tight corrugated core.</p><p>Armor-Flex is different in kind: an articulated shield of rolling sections with nothing to restrict bending, fitted over a metal or rubber hose. Thorburn makes it in carbon steel, 304 and 316 stainless.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How hot can a hose fire sleeve go?', answer: 'Thorburn’s Fry-Sil jacket is rated 260 °C continuous, 1090 °C for 15–20 minutes and 1650 °C for 15–30 seconds. Design to the continuous figure.' },
        { question: 'Is interlocked metal hose leak-tight?', answer: 'No, not on its own — it can be supplied packed for better sealing. It suits air, exhaust and dry bulk, not pressurised liquids.' },
        { question: 'What is a fire-safe hose?', answer: 'There is no single standard. All-metal hose is fire-resistant by construction; check whether a claim cites a hose test or a valve test such as API 6FA.' },
        { question: 'What is Smooth-Flex hose for?', answer: 'Pneumatic and gravity conveying of dry bulk such as grain, pellets and powders — interlocked hose with a smooth liner, at low pressure.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Fire jackets, fire tape, interlocked hose and hose guards:</p>' + stockList(['metallic-fire-protection-hoses'], (l) => !HELD_SKUS.includes(l.sku)),
    },
    {
      type: 'product_embed',
      heading: 'Fire sleeves and hose guards',
      skus: ['IH-MH-THORBURN-FJ72-FIRE-JACKET', 'IH-MH-THORBURN-FJ73-FIRE-TAPE', 'IH-MH-THORBURN-LS-304SS', 'IH-MH-THORBURN-AF-304SS', 'IH-MH-THORBURN-SFM-S6', 'IH-MH-THORBURN-SFM-HDG'],
    },
    { type: 'category_link', slug: 'metallic-fire-protection-hoses', label: 'Fire protection and guards', blurb: 'Fire jackets, tape, interlocked hose and Armor-Flex.' },
    { type: 'page_link', kind: 'industry', slug: 'steel', label: 'Steel', blurb: 'Hoses near furnaces, ladles and casters.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'thorburn-metallic', text: 'Thorburn Flex. Metallic Hose Assemblies catalogue.', url: 'https://www.thorburnflex.com/pdf/Metallic%20Hose%20Catalog.pdf' },
        { id: 'witzenmann-stripwound', text: 'Witzenmann. Stripwound hoses.', url: 'https://www.witzenmann.com/en/products/flexible-metal-hoses/stripwound-hoses/' },
        { id: 'iso-15541', text: 'ISO 15541:2016 — Fire resistance of non-metallic hose assemblies and compensators — test bench.', url: 'https://committee.iso.org/standard/67286.html' },
        { id: 'fm-1637', text: 'FM Approvals. Standard 1637 — Flexible Sprinkler Hose with Threaded End Fittings.', url: 'https://www.fmapprovals.com/-/media/Feature/Approval-Standards/1637-pdf.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['cryogenic-jacketed-and-heated-metal-hose', 'metal-hose-guide', 'corrugated-stainless-steel-hose', 'hose-whip-restraint-and-burst-protection'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings and constructions from the Thorburn metallic hose catalogue and Witzenmann; standard scopes from ISO and FM Approvals.',
    },
    {
      type: 'cta_block',
      heading: 'Protecting hoses from heat?',
      body: 'Send the hose OD, the length to cover, the heat source and how long the exposure lasts. We will quote a sleeve, tape, guard or all-metal hose.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
