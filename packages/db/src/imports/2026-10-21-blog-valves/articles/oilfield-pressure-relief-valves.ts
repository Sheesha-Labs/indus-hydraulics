import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Oilfield pressure relief valves: spring-loaded vs pilot-operated, set pressure, union vs flanged ends, sour service.
 * Sources read 2026-10-21: Emerson Anderson Greenwood Type 81P manual (ASME VIII / XIII UV construction; set pressure
 * tolerance ±3% above 70 psig, ±2 psi at or below; cracking 92.5% to +3%; gas set point 93% of pop); Emerson pressure
 * relief valve overview (pilot valves in pop and modulating designs; fixed and adjustable blowdown spring valves);
 * SLB "Introduction to API Specification 6A" (sour service definition, H2S partial pressure, 22 HRC limit, 316 limits);
 * eCFR 30 CFR 250.880 (PSVs tested annually, bench or in place).
 * NOT used: API 520 overpressure percentages, API 527 leakage figures (not read); union ratings from a maker sheet.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-pressure-relief-valves',
  title: 'Oilfield pressure relief valves: spring-loaded or pilot-operated, union or flanged',
  excerpt:
    'A relief valve is the last device between an overpressure and a burst line. On a frac or well-service spread it is a spring-loaded valve with hammer-union ends on the treating iron; on a plant or a test separator it is more often a flanged valve, spring or pilot-operated. How each type opens, what set pressure tolerance means, why a union-end valve is not an API 526 valve, the limits on stainless in sour service, and how often relief valves are tested.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Oilfield Pressure Relief Valves: Spring vs Pilot-Operated',
  seoDescription:
    'How oilfield pressure relief valves work: spring-loaded vs pilot-operated designs, set pressure tolerance, pop and modulating pilots, 1502 and 602 union-end vs flanged valves, sour service limits and test intervals.',
  focusKeyword: 'pressure relief valve',
  publishedAt: '2026-10-21T23:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Spring-loaded valves are held shut by a spring set to the relief pressure; pilot-operated valves use line pressure on a piston or dome, released by a small pilot.',
        'Pilot valves come in pop and modulating designs — modulation is a design choice, not something every pilot valve does.',
        'Emerson’s tolerance on its Type 81P spring valve: ±3% of set pressure above 70 psig.',
        'API 526 covers flanged relief valves; a hammer-union valve on frac iron is outside it.',
        'Sour service limits apply to every material — 316 stainless is acceptable only within NACE MR0175 limits.',
      ],
    },
    {
      type: 'lead',
      html: 'A pump that dead-heads against a closed valve, a plug in a treating line or a blocked separator outlet can raise pressure faster than any person can react. The relief valve is set below the weakest component’s rating and opens on its own. Choosing one means choosing the type, the set pressure, the end connections and the materials — and then making sure it is tested on schedule, because a relief valve that has never lifted is an assumption.',
    },

    { type: 'section_head', number: '/01', title: 'Spring-loaded or pilot-operated.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Relief valve types',
      columns: ['Type', 'How it closes', 'How it opens', 'Typical use'],
      rows: [
        { cells: ['Spring-loaded', 'A spring on the disc, set by compression', 'Line pressure overcomes the spring', 'Treating iron, pumps, small vessels'], highlight: true },
        { cells: ['Pilot-operated (pop)', 'Line pressure on a larger piston or dome area', 'Pilot vents the dome; main valve opens fully', 'Separators, process vessels, larger flows'] },
        { cells: ['Pilot-operated (modulating)', 'As above', 'Pilot opens the main valve in proportion to overpressure', 'Where full-lift relief would upset the process'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Emerson’s Anderson Greenwood range shows the split clearly: spring valves with fixed or adjustable blowdown (the pressure drop below set before the valve reseats), and pilot valves in both pop and modulating designs. Its Type 81P spring valve, built under ASME Section VIII / XIII, holds set pressure within <strong>±3% above 70 psig</strong> (±2 psi at or below), with cracking between 92.5% and 103% of set. On gas, Emerson defines set pressure as 93% of the pressure at which the valve pops.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Union ends or flanges.', anchor: 'ends' },
    {
      type: 'prose',
      html: '<p>On frac and well-service lines the relief valve is part of the treating iron: 2″ or 3″ <strong>1502</strong> (15,000 psi) or <strong>602</strong> (6,000 psi) hammer-union ends, male × female, so it fits straight into the line. Plant and well-test valves use ASME RF or API 6B/6BX flanges. API 526 standardises flanged steel relief valves — orifice letters, flange ratings and dimensions — so a union-end valve is bought against the maker’s own rating, not API 526. Match the union figure number to the line (see <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>) and never mix 1502 and 602 parts.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Set the valve to the weakest part, not the pump.',
      body: 'The set pressure must sit below the lowest rating in the protected system — hose, swivel, union or vessel — and the discharge must be piped to a safe place. A relief valve that vents at head height on a pressure-pumping spread is a hazard in itself.',
    },

    { type: 'section_head', number: '/03', title: 'Sour service and testing.', anchor: 'sour' },
    {
      type: 'prose',
      html: '<p>SLB’s API 6A guide defines sour service as exposure to enough H<sub>2</sub>S to crack materials by the mechanisms NACE MR0175 / ISO 15156 addresses, and gives the H<sub>2</sub>S partial pressure as ppm ÷ 1,000,000 × shut-in pressure. Carbon and low-alloy steels must be no harder than 22 HRC. Austenitic stainless is limited too — for general components, 60 °C at 100 kPa (15 psi) H<sub>2</sub>S partial pressure — so “316 for sour service” is only true within those limits.</p><p>On US offshore facilities BSEE requires pressure safety valves to be tested at least annually, either bench-tested or fitted so they can be tested in place with an external pressure source. Onshore operators set their own interval; record every test against the valve’s tag.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Spring-loaded or pilot-operated relief valve?', answer: 'Spring-loaded for treating iron, pumps and smaller vessels; pilot-operated where flow is large or the operating pressure runs close to set, as on separators.' },
        { question: 'How accurate is a relief valve set pressure?', answer: 'It depends on the valve. Emerson gives ±3% of set pressure above 70 psig for its Type 81P spring valve.' },
        { question: 'Is a 1502 relief valve an API 526 valve?', answer: 'No. API 526 covers flanged steel relief valves; hammer-union valves are bought against the maker’s rating.' },
        { question: 'How often should relief valves be tested?', answer: 'BSEE requires annual testing on US offshore facilities. Elsewhere follow the operator’s procedure and record each test.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Spring-loaded and pilot-operated relief valves with union and flanged ends:</p>' + stockList(['oilfield-pressure-relief-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Pressure relief valves',
      skus: ['IH-OFV-PRV-SPRING-2-1502MF-15K-STD-SPM', 'IH-OFV-PRV-SPRING-2-1502MF-10K-SOUR-CAMERON', 'IH-OFV-PRV-SPRING-2-602MF-6K-SOUR-ANSON', 'IH-OFV-PRV-PILOT-3-600RF-1480-SOUR-FMC', 'IH-OFV-PRV-SPRING-318-5M-FLG-5K-SOUR-STREAMFLO', 'IH-OFV-PRV-SPRING-2-150RF-285-STD-INDUS'],
    },
    { type: 'category_link', slug: 'oilfield-pressure-relief-valves', label: 'Pressure relief valves', blurb: 'Spring and pilot relief valves, union and flanged.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Pressure pumping, well testing and production.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'emerson-81p', text: 'Emerson. Anderson Greenwood Type 81P relief valve manual (FCIM-20294-EN).', url: 'https://www.emerson.com/is/content/emerson/en/final-control/pressure-management/documents/anderson-greenwood-type-81p-relief-valve-manual-fcim-20294-en.pdf' },
        { id: 'emerson-prv', text: 'Emerson. Anderson Greenwood, Crosby and Varec pressure relief valves overview.', url: 'https://www.emerson.com/is/content/emerson/en/final-control/pressure-management/anderson-greenwood/documents/anderson-greenwood-crosby-varec-pressure-relief-valves-en-us-2441860.pdf' },
        { id: 'slb-6a', text: 'SLB (Cameron). Introduction to API Specification 6A.', url: 'https://www.slb.com/-/media/files/sur/brochure/introduction-to-api-specification-6a.ashx' },
        { id: 'cfr-250-880', text: 'US eCFR. 30 CFR 250.880 — Production safety system testing.', url: 'https://www.ecfr.gov/current/title-30/chapter-II/subchapter-B/part-250/subpart-H/section-250.880' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['surface-safety-valves-and-esd-systems', 'hammer-union-figure-numbers', 'flow-iron-explained', 'oilfield-check-valves-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Valve types and tolerances from Emerson documents; sour limits from SLB’s API 6A guide; test intervals from 30 CFR 250.880.',
    },
    {
      type: 'cta_block',
      heading: 'Need a relief valve?',
      body: 'Send the line size and end connection, the set pressure, the fluid and whether it is sour, and the rating of the weakest part it protects. We will quote the valve with its test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
