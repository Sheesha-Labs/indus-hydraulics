import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Surface well testing spread: order of equipment and what each does. Sources read 2026-10-21: SLB Oilfield Review,
 * Spring 2007, "The Expanding Scope of Well Testing" (separator downstream of the choke manifold, heater upstream,
 * surge tank downstream, burner after the surge tank; separator by gravity and density; surge tank shrinkage; heater
 * purpose; MPFM venturi + dual-energy gamma, no separation, upstream of the separator); SLB Modular Compact Well Test
 * System product sheet (component ratings and codes: separator 1,440 psi ASME VIII Div 2, DNV 2.7-1 skids, SSV and
 * flowhead 10,000 psi API 6A PSL3 PR2; capacities); SLB Energy Glossary (choke manifold, test separator); ASME
 * certification page (U, U2, U3 stamps); 30 CFR 250.880 not used here.
 * NOT used: positions of data header and sand filter as maker-documented (industry practice stated as such).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'surface-well-testing-equipment',
  title: 'Surface well testing equipment: the spread from flowhead to flare, and what each unit does',
  excerpt:
    'A well test brings reservoir fluid to surface and measures it: through a flowhead and safety valve, a data header and sand filter, a choke manifold, a heater, a three-phase separator that splits and meters oil, gas and water, a surge tank, a transfer pump and a flare. The order of the spread, what each vessel does, how pressure ratings and ASME and DNV codes are read, and where a multiphase meter fits in.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Surface Well Testing Equipment: Separator, Surge Tank, Flare',
  seoDescription:
    'How a surface well testing spread works: flowhead, SSV and ESD, data header, sand filter, choke manifold, heater, three-phase test separator, surge tank, transfer pump, flare, multiphase flow meters, and ASME U/U2 and DNV 2.7-1 codes.',
  focusKeyword: 'surface well testing equipment',
  publishedAt: '2026-10-22T00:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The usual order is flowhead and SSV, data header, sand filter, choke manifold, heater, separator, surge tank, transfer pump, flare.',
        'The test separator splits oil, gas and water by gravity and density and meters each as it leaves.',
        'A surge tank downstream of the separator absorbs pressure surges and lets oil shrinkage be measured.',
        'ASME U, U2 and U3 stamps mark pressure vessels built to Section VIII Division 1, 2 or 3; DNV 2.7-1 covers skids and frames lifted offshore.',
        'A multiphase meter measures oil, gas and water without separating them, usually upstream of the separator.',
      ],
    },
    {
      type: 'lead',
      html: 'A well test answers the questions a field development depends on — how much the well will flow, of what, at what pressure — and it does so with a temporary plant built on the wellsite or rig deck. The spread is assembled from skid-mounted units joined by high-pressure flow iron, and each unit has one job. This guide follows the fluid from the wellhead to the flare.',
    },

    { type: 'section_head', number: '/01', title: 'The spread, in order.', anchor: 'order' },
    {
      type: 'comparison_table',
      caption: 'A typical surface well testing spread',
      columns: ['Unit', 'What it does'],
      rows: [
        { cells: ['Flowhead and SSV, ESD panel', 'Control the well at surface; the SSV closes it automatically on an ESD trip'], highlight: true },
        { cells: ['Data header', 'Ports for pressure and temperature gauges, sampling and chemical injection'] },
        { cells: ['Sand filter', 'Removes produced sand before it erodes the choke and separator'] },
        { cells: ['Choke manifold', 'Controls flow rate; one adjustable choke can be isolated for repair while the other runs'] },
        { cells: ['Heater', 'Warms the stream to prevent hydrates, reduce viscosity and break emulsions'] },
        { cells: ['Three-phase separator', 'Splits oil, gas and water by gravity and meters each phase'] },
        { cells: ['Surge tank', 'Absorbs pressure surges; oil shrinkage is measured here'] },
        { cells: ['Transfer pump', 'Moves separated oil to storage, a pipeline or the burner'] },
        { cells: ['Flare or burner', 'Disposes of produced gas, and liquids that cannot be stored'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>SLB’s description of the chain: the separator sits downstream of the choke manifold that controls flow at surface; the heater is placed upstream of the separator; the surge tank downstream of it; and the burner downstream of the surge tank disposes of the gas. The data header and sand filter usually go upstream of the choke, close to the well, where pressure is highest. On knock-out drums ahead of the flare, liquid carried over with the gas is caught before it reaches the flame.</p><p>For the flowhead, SSV and ESD system, see <a href="/blog/surface-safety-valves-and-esd-systems">surface safety valves and ESD</a>; for the iron that joins the units, <a href="/blog/flow-iron-explained">flow iron</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Ratings and codes.', anchor: 'codes' },
    {
      type: 'prose',
      html: '<p>Equipment upstream of the choke sees full well pressure; equipment downstream sees the separator’s working pressure. In SLB’s compact well test system, for example, the SSV and flowhead are rated 10,000 psi to API 6A PSL 3 PR2, the separator 1,440 psi to ASME Section VIII Division 2, and the vertical surge tank 150 psi.</p><ul><li><strong>ASME stamps:</strong> U is a Section VIII Division 1 pressure vessel, U2 Division 2 (alternative rules), U3 Division 3 (high pressure).</li><li><strong>DNV 2.7-1</strong> is applied to the skids and frames of separators and tanks lifted offshore; SLB applies DNV 2.7-3 to portable units such as SSVs, flowheads and pumps.</li><li><strong>NACE MR0175 / ISO 15156</strong> materials are needed wherever the well may produce H₂S.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Multiphase meters.', anchor: 'mpfm' },
    {
      type: 'prose',
      html: '<p>A multiphase flow meter measures oil, gas and water rates without separating the stream — SLB’s PhaseTester combines a venturi with a dual-energy gamma-ray detector. It is typically installed close to the wellhead, upstream of the separator, and lets the well be measured during clean-up, when a separator cannot yet be put on line; SLB notes clean-up can otherwise take two to three days of progressive choke adjustments.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What equipment is in a well testing spread?', answer: 'Typically a flowhead and SSV with an ESD panel, data header, sand filter, choke manifold, heater, three-phase separator, surge tank, transfer pump and flare or burner, joined by flow iron.' },
        { question: 'What does a three-phase test separator do?', answer: 'It separates the well stream into oil, gas and water by gravity and density, and meters each phase as it leaves the vessel.' },
        { question: 'What is a surge tank for?', answer: 'It takes liquid from the separator, absorbs pressure surges, and lets oil shrinkage be measured as gas leaves solution.' },
        { question: 'What is the difference between ASME U and U2?', answer: 'U marks a vessel built to ASME Section VIII Division 1; U2 to Division 2, the alternative rules.' },
        { question: 'Where does a multiphase meter go?', answer: 'Usually near the wellhead, upstream of the separator; it measures without separating the phases.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Well testing equipment:</p>' + stockList(['wt-3-phase-separator', 'wt-surge-tank', 'wt-knock-out-drum', 'wt-sand-filter', 'wt-data-header', 'wt-mpfm-system', 'wt-transfer-pump', 'wt-flush-test-pump', 'wt-piping-packages', 'wt-flare-stack', 'wt-esd-panel']),
    },
    {
      type: 'product_embed',
      heading: 'Well testing equipment',
      skus: ['IH-3PS-1440-60X15-DNV', 'IH-WTS-DC100-600-DNV', 'IH-SFL-DP-10K-SS316-DNV', 'IH-OFE-DHD', 'IH-MPFM-SKD-RXE-CMPCT', 'IH-FLS-TRL-HYD-60-TRI', 'IH-ESD-1SSV-SS316-3R', 'IH-WTPP-1502-15K-NACE'],
    },
    { type: 'category_link', slug: 'wt-3-phase-separator', label: 'Well test separators', blurb: 'Three-phase test separators.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Exploration and appraisal well testing.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'slb-or-2007', text: 'Aghar et al. “The Expanding Scope of Well Testing.” SLB Oilfield Review, Spring 2007, pp. 44–59.', url: 'https://www.slb.com/-/media/files/oilfield-review/p44-59-english' },
        { id: 'slb-mcwt', text: 'SLB. Modular Compact Well Test System product sheet.', url: 'https://www.slb.com/-/media/files/testing-services/product-sheet/mcwt-ps.ashx' },
        { id: 'asme-stamps', text: 'ASME. Boiler and Pressure Vessel Certification Program.', url: 'https://www.asme.org/certification-accreditation/boiler-and-pressure-vessel-certification-program' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['surface-safety-valves-and-esd-systems', 'flow-iron-explained', 'positive-vs-adjustable-chokes', 'oilfield-pressure-and-flow-instrumentation'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Spread order, functions and ratings from SLB Oilfield Review (2007) and SLB’s compact well test system sheet; stamps from ASME.',
    },
    {
      type: 'cta_block',
      heading: 'Putting a test spread together?',
      body: 'Send the well pressure and expected rates, H₂S content, onshore or offshore, and the units you need. We will quote the equipment and the iron that joins it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
