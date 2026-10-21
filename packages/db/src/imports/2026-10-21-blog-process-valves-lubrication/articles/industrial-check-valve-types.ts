import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Industrial check valve types: swing, lift/piston, tilting disc, dual plate, axial (nozzle); slam, orientation, specifying.
 * Sources read 2026-10-21: J. V. Ballun, "Company Examines Slam Characteristics of Check Valves", Water Technology
 * Online, 2003 (slam mechanism after pump stop; deceleration and its causes; typical <20 ft/s² single low-head pump,
 * up to ~40 ft/s² multi-pump high-head; fast-close vs slow-close with dashpot; 1 ft/s reverse velocity ≈ 100 ft head
 * ≈ 43 psi; mild 0.5–1.0 ft/s; ranking spring-assisted > tilted disc > swing and ball; vertical pipes: gravity helps
 * dual disc, may make swing and tilted disc more prone to slam; headloss, laying length as other factors);
 * J. McIlroy and I. Noble, "An Introduction to Axial Flow Check Valves", Valve Magazine, 2022 (spring-loaded low-mass
 * disc, venturi, cracking pressure, spring sized so disc sits on backstop at normal flow; applications incl. centrifugal
 * compressor discharge, boiler feed, gathering, midstream; API 6D, ASME B16.34, B16.10, API 598 listed; swing long
 * response, dual plate less inertia); API Std 594 9th ed. (2022) abstract via normservis.sk (Type A wafer/lug/double
 * flanged, single or dual plate; Type B B16.10 flanged/butt-weld swing or pivoting disc; NPS 2–48; Classes 150–2500;
 * axial, centre-spring, nozzle and lift types excluded); API Std 602 11th ed. (2022) abstract via normservis.sk
 * (compact gate, globe and check valves DN 8–100; Classes 150, 300, 600, 800, 1500; Class 800 intermediate);
 * BS 1868:1975+A1:1990 abstract via BSI Knowledge and SFS (swing for vertical or horizontal flow; piston and ball
 * lift for angle or horizontal; ball and disk type for vertical; Class 150–2500; DN 15–600).
 * NOT used: pressure drop or Cv figures for any type; API 6D 2021 scope wording (not read); a claim that axial checks
 * suit every orientation; reciprocating-compressor guidance (only an unverified blog).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'industrial-check-valve-types',
  title: 'Industrial check valve types: swing, lift, tilting disc, dual plate and axial nozzle checks compared',
  excerpt:
    'A check valve has one job — stop reverse flow — but the way its disc moves decides whether it closes quietly or slams. How swing, lift and piston, tilting disc, dual plate and axial (nozzle) checks differ, what API 594, API 602, API 6D and BS 1868 actually cover, why deceleration matters more than the valve alone, and what to send for a quote.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Industrial Check Valve Types: Swing, Dual Plate, Axial',
  seoDescription:
    'Swing, lift, tilting disc, dual plate and axial nozzle check valves compared: slam and water hammer, closing speed vs deceleration, orientation, API 594, API 602, API 6D and BS 1868.',
  focusKeyword: 'check valve types',
  publishedAt: '2026-10-22T01:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A check valve slams when flow reverses before the disc has seated; the reverse flow drives it shut and the sudden stop is water hammer.',
        'Short-stroke, spring-assisted designs (dual plate, axial nozzle) close fastest; long-stroke swing and ball checks have the most slam potential.',
        'How fast the line decelerates after a pump trip matters as much as the valve: multi-pump, high-head stations decelerate fastest.',
        'API 594 covers wafer, lug and flanged checks NPS 2 to 48; it excludes axial, nozzle and lift types. API 602 covers compact forged valves to DN 100.',
        'BS 1868 lists swing checks for horizontal or vertical flow; a swing disc closes under its own weight, so a vertical line must flow upward.',
      ],
    },
    {
      type: 'lead',
      html: 'Most check valve problems are not leaks but noise, slam and pressure surges after a pump stops. The disc that worked quietly on one line hammers on another because the system, not just the valve, decides how fast flow reverses. This guide covers plant and pipeline check valves — flanged, wafer and forged. For the union-end dart and swing checks used on frac and cementing iron, see <a href="/blog/oilfield-check-valves-explained">oilfield check valves explained</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The five types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Industrial check valve types at a glance',
      columns: ['Type', 'How the disc moves', 'Standards', 'Typical use'],
      rows: [
        { cells: ['Swing', 'Single disc hangs from a hinge pin and swings off the seat; long travel, closes by gravity and reverse flow', 'BS 1868 (DN 15–600), API 594 Type B, ASME B16.34', 'Horizontal process and utility lines'] },
        { cells: ['Lift or piston', 'Disc or piston rises off the seat on a guide and drops back', 'API 602 (forged, to DN 100), BS 1868', 'Small-bore process, utility and steam lines'] },
        { cells: ['Tilting disc', 'Disc pivots on an axis just above its centre; shorter stroke than a swing', 'ASME B16.34; API 594 allows pivoting discs', 'Steam and high-energy lines'] },
        { cells: ['Dual plate', 'Two half-plates on a central pin, closed by springs', 'API 594 Type A (wafer, lug, double flanged)', 'Process, cooling water, pump discharge where length and weight matter'], highlight: true },
        { cells: ['Axial flow (nozzle)', 'Low-mass disc on the pipe axis, spring-loaded, short stroke in a venturi body', 'API 6D, ASME B16.34 (not API 594)', 'Compressor and pump discharge, pipelines, fast-reversing systems'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>API 594 is the check valve standard most often quoted, and it is narrower than people think. Its Type A valves are short face-to-face wafer, lug or double-flanged bodies with single or dual plates; Type B valves are flanged or butt-weld swing or pivoting-disc valves with B16.10 dimensions. It runs from NPS 2 to 48 and Class 150 to 2500, and it explicitly excludes axial disc, centre-spring, nozzle and lift check valves. API 602 covers compact forged gate, globe and check valves from DN 8 to DN 100 in Classes 150, 300, 600, 800 and 1500, where Class 800 is an intermediate class used for socket-weld and threaded valves. BS 1868 covers cast or forged steel swing and lift checks with flanged or butt-weld ends from DN 15 to 600.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Slam, water hammer and deceleration.', anchor: 'slam' },
    {
      type: 'prose',
      html: '<p>When a pump stops, the liquid column slows down, stops and starts to run backwards. A check valve that has not closed by then is slammed shut by the reverse flow, and the sudden stop sends a pressure wave down the line. Most of the noise is the pipe stretching, not the disc striking the seat. Valve engineer John Ballun puts the scale at roughly 100 ft of head, about 43 psi, for every 1 ft/s of reverse velocity at closure; 0.5 to 1 ft/s is a mild slam, more than that should be designed out.</p><p>There are two ways to avoid it. Either the valve closes very fast, before reverse flow builds — which needs a light disc, a short stroke or a spring — or it closes slowly once reverse flow has started, with an oil dashpot, and the pump must tolerate some backspin. Which one a line needs depends on its deceleration: how fast the column slows after a trip, set by pump inertia, pipe length, friction and static head. Ballun quotes under 20 ft/s² for a single low-head pump and up to about 40 ft/s² for high-head, multi-pump stations, normally found from a transient analysis.</p><p>Tested in horizontal lines, spring-assisted dual disc and centre-guided valves showed the least slam, angled-seat tilted disc valves came next, and long-stroke swing and ball checks had the most. Axial nozzle checks, with a single low-mass disc and a spring sized to hold it on its backstop at normal flow, react as soon as flow starts to fall. The point is to match the valve to the system: a swing check that is fine on a gravity-fed utility line can hammer on a high-head pump header.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Orientation and pressure drop.', anchor: 'orientation' },
    {
      type: 'prose',
      html: '<p>BS 1868 lists swing checks for horizontal or vertical flow. A swing disc falls shut under its own weight, so in a vertical line the flow has to run upward. Its piston and ball lift checks are listed for angle or horizontal flow, with separate ball and disk designs for vertical lines — so a lift check is ordered for its orientation, not swapped in. Gravity also changes slam behaviour: Ballun notes that in vertical pipe it helps dual disc valves close but can make swing and tilted disc valves more prone to slam.</p><p>Every check valve costs some pressure drop, and a spring adds cracking pressure the flow must overcome before the disc opens. The venturi body of an axial check narrows towards the seat so the disc opens fully and quickly. For an energy-sensitive line, ask for the loss coefficient or Cv at the design flow rather than comparing types in general.</p>',
    },

    { type: 'section_head', number: '/04', title: 'How to specify.', anchor: 'specify' },
    {
      type: 'prose',
      html: '<ul><li><strong>Service and duty:</strong> fluid, temperature, flow rate (normal and minimum) and what sits upstream — single pump, parallel pumps, centrifugal compressor, or a pipeline.</li><li><strong>Size, class and ends:</strong> NPS, ASME class, and RF, RTJ, butt-weld, wafer, lug, socket-weld or threaded ends with the pipe schedule.</li><li><strong>Orientation:</strong> horizontal, vertical up-flow or angle.</li><li><strong>Type, or the problem:</strong> name the type, or say the line slams today and send the deceleration or transient study if one exists.</li><li><strong>Standard:</strong> API 594, API 602, API 6D or BS 1868 — check the valve type and size fall inside that standard’s scope.</li><li><strong>Materials and documents:</strong> body and trim, NACE MR0175 if sour, material certificates, test standard and any third-party inspection.</li></ul><p>Give the minimum flow as well as the design flow: on a spring-loaded check the spring is chosen so the disc sits fully open and stable against its backstop at normal flow, and that depends on the real flow range.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why does my check valve slam?', answer: 'Flow reversed before the disc had seated. It is worst with long-stroke swing or ball checks on lines that decelerate quickly, such as high-head stations with several pumps.' },
        { question: 'What is a non-slam check valve?', answer: 'A design that closes before appreciable reverse flow builds, usually with a light disc, a short stroke and a spring — dual plate and axial nozzle checks are the common examples.' },
        { question: 'Can a swing check valve be installed vertically?', answer: 'Yes, with the flow running upward: BS 1868 lists swing checks for vertical or horizontal flow, and the disc closes under its own weight, so it cannot close against downward flow.' },
        { question: 'Does API 594 cover axial or nozzle check valves?', answer: 'No. API 594 excludes axial disc, centre-spring, nozzle and lift types. Axial check valves for pipelines are usually specified to API 6D and ASME B16.34.' },
        { question: 'What size range does API 602 cover?', answer: 'Compact forged valves from DN 8 to DN 100 (NPS 4), in Classes 150, 300, 600, 800 and 1500.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Industrial check valves, built to order:</p>' + stockList(['industrial-check-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Industrial check valves',
      skus: ['IH-PV-SCC', 'IH-PV-DPC', 'IH-PV-AFC', 'IH-PV-TDC', 'IH-PV-FCK'],
    },
    { type: 'category_link', slug: 'industrial-check-valves', label: 'Industrial check valves', blurb: 'Swing, forged lift, tilting disc, dual plate and axial flow checks.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Process plant, pipeline and compressor station valves.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'ballun-slam', text: 'Ballun, J. V. “Company Examines Slam Characteristics of Check Valves.” Water Technology Online, 2003.', url: 'https://watertechonline.com/home/article/14172607/company-examines-slam-characteristics-of-check-valves' },
        { id: 'vm-axial', text: 'McIlroy, J. and Noble, I. “An Introduction to Axial Flow Check Valves.” Valve Magazine, 2022.', url: 'https://www.valvemagazine.com/articles/an-introduction-to-axial-flow-check-valves' },
        { id: 'api-594', text: 'API Std 594, Check Valves: Flanged, Lug, Wafer, and Butt-welding, 9th ed., 2022 — abstract.', url: 'https://eshop.normservis.sk/norma/apistd-594-ed-9-1.2.2022.html' },
        { id: 'api-602', text: 'API Std 602, Gate, Globe, and Check Valves for Sizes DN 100 (NPS 4) and Smaller, 11th ed., 2022 — abstract.', url: 'https://eshop.normservis.sk/norma/apistd-602-ed-11-1.5.2022.html' },
        { id: 'bs-1868', text: 'BSI. BS 1868:1975+A1:1990, Specification for steel check valves (flanged and butt-welding ends) for the petroleum, petrochemical and allied industries.', url: 'https://knowledge.bsigroup.com/products/specification-for-steel-check-valves-flanged-and-butt-welding-ends-for-the-petroleum-petrochemical-and-allied-industries' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['oilfield-check-valves-explained', 'butterfly-valves-wafer-lug-and-grooved', 'needle-globe-and-instrumentation-valves', 'api-600-602-603-gate-and-globe-valves', 'floating-vs-trunnion-mounted-ball-valves'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Standard scopes from the published API 594, API 602 and BS 1868 abstracts; slam data from Ballun (2003); axial check construction from Valve Magazine (2022).',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a check valve?',
      body: 'Send the line size and class, fluid, normal and minimum flow, orientation, what sits upstream, and the standard you need. If the line slams today, say so — we will suggest the type to quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
