import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'
import { HELD_SKUS } from '../held'

/**
 * Specialty metal hose: cryogenic transfer, chlorine, steam-jacketed, electrically heated, pipe loops, insulation
 * covers. Sources read 2026-10-21: Thorburn Flex Metallic Hose Assemblies catalogue (p.4 certifications — Canadian Gas
 * Association CGA96/UL536; p.30–35 cryogenic hose 400 psi, −269 to 538 °C, CGA V-6 connections, CO2 snowballing,
 * Cryo-Therm cover, vacuum-jacketed TJHC, boiling points; p.35 TJH jacketed hose; p.36 Sure-Temp; p.38 M96ZC; p.39
 * CGA96/UL96 fuel-gas hose; p.40 Thor-Loop); Thorburn ThermaCover brochure; Hose Master cryogenics, LNG and ChlorSafe
 * pages (C276, Pamphlet 6 Appendix A, 375 psi, helium leak test); Witzenmann corrugated hose page.
 * NOT used: CGA G-4.1 / ASTM G93 wording; Chlorine Institute replacement intervals; Thorburn's methane boiling point.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cryogenic-jacketed-and-heated-metal-hose',
  title: 'Cryogenic, chlorine, steam-jacketed and heated metal hose: specialty assemblies explained',
  excerpt:
    'Some liquids cannot go through an ordinary hose: liquid nitrogen and oxygen at −196 and −183 °C, chlorine that attacks most metals, asphalt and sulphur that set solid if they cool. Specialty corrugated metal hose handles each — with CGA V-6 cryogenic ends and foam or vacuum insulation, all-Monel or Hastelloy construction to Chlorine Institute rules, a steam jacket or an electric heating cable. What each type is, the ratings makers publish, and what “CGA96” on a hose does and does not mean.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Cryogenic, Chlorine & Steam-Jacketed Metal Hose Guide',
  seoDescription:
    'Specialty metal hose explained: cryogenic LIN, LOX, LNG and CO₂ transfer hose (CGA V-6, insulation, 400 psi), Monel and C276 chlorine hose to CI Pamphlet 6, steam-jacketed and electrically heated hose, Thor-Loop pipe loops and insulation covers.',
  focusKeyword: 'cryogenic transfer hose',
  publishedAt: '2026-10-22T00:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Thorburn’s cryogenic unloading hose is braided corrugated stainless rated 400 psi (27.6 bar), −269 to 538 °C, with CGA V-6 connections; vacuum-jacketed hose is a separate design.',
        'CO₂ hose is lined (helical or PTFE) to reduce snowballing; oxygen hose is cleaned and capped for oxygen service.',
        'Chlorine hose is all-Monel (Thorburn M96ZC, tested at 750 psi) or C276 (Hose Master ChlorSafe), built to Chlorine Institute Pamphlet 6 Appendix A.',
        '“CGA96” in Thorburn’s catalogue is a Canadian Gas Association fuel-gas certification — not an oxygen or argon standard.',
        'Steam-jacketed hose is a hose within a hose; electrically heated hose holds a set temperature with an MI cable and RTD.',
      ],
    },
    {
      type: 'lead',
      html: 'Corrugated stainless hose is the default answer whenever rubber cannot take the temperature or the chemistry. The specialty assemblies build on it: insulation for cryogens, exotic alloys for chlorine, jackets and heating cables for products that must stay hot. For the basics of corrugated metal hose — braid, pressure and bend radius — see <a href="/blog/metal-hose-guide">the metal hose guide</a>; for nickel alloys, <a href="/blog/exotic-alloy-metal-hose">exotic alloy metal hose</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Cryogenic transfer hose.', anchor: 'cryogenic' },
    {
      type: 'comparison_table',
      caption: 'Common cryogens (Thorburn catalogue boiling points)',
      columns: ['Liquid', 'Normal boiling point', 'Hose notes'],
      rows: [
        { cells: ['Liquid oxygen (LOX)', '−183.0 °C', 'Cleaned for oxygen service; CGA V-6 OX connections'], highlight: true },
        { cells: ['Liquid nitrogen (LIN)', '−195.8 °C', 'CGA V-6 NI connections'] },
        { cells: ['Liquid argon (LAR)', '—', 'CGA V-6 AR connections'] },
        { cells: ['Liquid CO₂', '—', 'Helical or PTFE liner against snowballing; brass ACME ends'] },
        { cells: ['LNG', '≈ −160 °C', 'Unloading hose, or vacuum-jacketed hose for ship-to-shore'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Thorburn’s cryogenic unloading hose is a braided corrugated stainless hose, with optional armour, rated to <strong>400 psi (27.6 bar)</strong> and −269 to 538 °C; high-pressure versions go to 3,500 psi. End connections for LIN, LOX and LAR comply with <strong>CGA V-6</strong>, using NI, OX and AR ACME fittings so a nitrogen hose cannot be connected to an oxygen system. Insulation is either a <strong>Cryo-Therm foam cover</strong> (−196 to 302 °C) — Thorburn’s example is 25 L of LN2 lost per fill on a bare hose against 2.5 L with the cover — or a vacuum jacket on its TJHC hose. Hose Master builds corrugated hose for temperatures as low as −325 °F and LNG hose with ABS type approval.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: '“CGA96” is not an oxygen or argon rating.',
      body: 'In Thorburn’s catalogue, CGA96/UL96 hose meets the Canadian Gas Association and American Gas Association requirements for natural gas, propane, anhydrous ammonia, methane and sour gas. The Compressed Gas Association, which publishes CGA V-6 and the cylinder connection numbers, is a different body.',
    },

    { type: 'section_head', number: '/02', title: 'Chlorine hose.', anchor: 'chlorine' },
    {
      type: 'prose',
      html: '<p>Chlorine transfer hose is built to the Chlorine Institute’s Pamphlet 6, Appendix A. Thorburn’s <strong>M96ZC</strong> is all Monel 400 — core, braid and filler — with an Armor-Flex guard; every assembly is tested at 750 psi, then tagged, cleaned and capped. Hose Master’s ChlorSafe uses C276 alloy for every wetted part and the braid, rated 375 psi in ¾–2 in with a 5:1 safety factor and helium leak-tested. Use only the alloy and construction the pamphlet allows, and replace on the operator’s schedule.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Jacketed and heated hose.', anchor: 'heated' },
    {
      type: 'prose',
      html: '<ul><li><strong>Steam-jacketed hose</strong> (Thorburn TJH) is a hose within a hose: product inside, steam in the jacket, each a separate pressure carrier, joined by port couplings. Used for asphalt, pitch, sulphur, slurry and viscous chemicals. A double-containment version adds a breach warning.</li><li><strong>Electrically heated hose</strong> (Thorburn Sure-Temp) wraps the hose in a spiral MI heating cable with a Pt100 RTD and controller: 5–250 °C for liquids, 5–450 °C for gas sampling, typically to 300 psi (20 bar), with an FM Class I Div 2 Group D option.</li><li><strong>Removable insulation covers</strong> (ThermaCover) keep heat in and protect people: fibreglass jackets rated to 260 °C over aerogel or mineral-wool cores.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Pipe loops.', anchor: 'loops' },
    {
      type: 'prose',
      html: '<p>A <strong>Thor-Loop</strong> is two metal hoses and a 180° return set into a pipe run, in a U or V shape, absorbing up to 500 mm (20 in) of thermal and seismic movement in every direction. Thorburn lists them as UL-listed and CGA-certified for sprinkler and gas systems; support the return in any orientation other than hanging down.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure is a cryogenic transfer hose rated for?', answer: 'Thorburn’s cryogenic unloading hose is rated 400 psi (27.6 bar); high-pressure versions are available to 3,500 psi.' },
        { question: 'What is CGA V-6?', answer: 'The Compressed Gas Association standard for cryogenic liquid transfer connections, with different fittings for nitrogen, oxygen and argon so they cannot be cross-connected.' },
        { question: 'Why do CO₂ hoses snowball?', answer: 'Liquid CO₂ flashes to dry ice as pressure drops; lined hoses (helical or PTFE) are designed to reduce the build-up.' },
        { question: 'What hose is used for chlorine?', answer: 'All-Monel or C276 corrugated hose built to Chlorine Institute Pamphlet 6, Appendix A.' },
        { question: 'Steam-jacketed or electrically heated hose?', answer: 'Steam where plant steam is available and the product needs a lot of heat; electric where there is no steam or the temperature must be held precisely.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Cryogenic, chlorine, steam-jacketed and heated hose, pipe loops and insulation covers:</p>' + stockList(['metallic-specialty-assemblies'], (l) => !HELD_SKUS.includes(l.sku)),
    },
    {
      type: 'product_embed',
      heading: 'Specialty metal hose',
      skus: ['IH-MH-THORBURN-CRYO-LIN', 'IH-MH-THORBURN-CRYO-LOX', 'IH-MH-THORBURN-CRYO-CO2-DEWAR', 'IH-MH-THORBURN-M96ZC-RAIL', 'IH-MH-THORBURN-TSJ-2IN-ASPHALT', 'IH-MH-THORBURN-SURETEMP-1IN', 'IH-MH-THORBURN-THORLOOP-ULOOP', 'IH-MH-THORBURN-THERMACOVER-STD'],
    },
    { type: 'category_link', slug: 'metallic-specialty-assemblies', label: 'Specialty metal hose', blurb: 'Cryogenic, chlorine, jacketed and heated assemblies.' },
    { type: 'page_link', kind: 'industry', slug: 'lng-future-fuels', label: 'LNG & future fuels', blurb: 'Cryogenic transfer and bunkering.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'thorburn-metallic', text: 'Thorburn Flex. Metallic Hose Assemblies catalogue.', url: 'https://www.thorburnflex.com/pdf/Metallic%20Hose%20Catalog.pdf' },
        { id: 'thorburn-thermacover', text: 'Thorburn Flex. ThermaCover brochure.', url: 'https://www.thorburnflex.com/pdf/ThermaCover2.pdf' },
        { id: 'hosemaster-chlorsafe', text: 'Hose Master. ChlorSafe corrugated metal hose.', url: 'https://www.hosemaster.com/products/corrugated-metal-hose/chlorsafe-1' },
        { id: 'hosemaster-cryo', text: 'Hose Master. Cryogenics.', url: 'https://www.hosemaster.com/industries-applications/cryogenics' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['cryogenic-transfer-hose', 'fire-sleeves-and-metal-hose-guards', 'exotic-alloy-metal-hose', 'metal-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings and constructions from the Thorburn catalogue and ThermaCover brochure, and Hose Master product pages.',
    },
    {
      type: 'cta_block',
      heading: 'Need a specialty metal hose?',
      body: 'Send the fluid, its temperature and pressure, the bore and length, both end connections and any standard the plant works to. We will confirm the build with the maker.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
