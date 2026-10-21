import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Surface safety valves (SSV) and ESD systems, and valve accessories. Sources read 2026-10-21: SLB "Introduction to API
 * Specification 6A" (SSV definition; second master valve per API RP 14C; minimum PSL 2; all designs PR2; service class
 * I standard / II–III sandy with 500-cycle sand slurry test per API 6AV1; class must be specified; no threaded ends;
 * hydraulic or pneumatic actuators; normally closed; no lock-open devices except heat-sensitive; material classes;
 * temperature classes; pressure ratings); SLB (Cameron) SSV control system brochure (manual reset after a trip,
 * 5,000 psig hand pump, low-pressure pilot circuit with solenoids and fusible plugs, arming valve); eCFR 30 CFR 250.880
 * (SSV monthly test to API 6AV2, any leak = repair or replace; ESD station test intervals); Victaulic 08.20 (padlocking);
 * ISO 5211 scope by title.
 * NOT used: API RP 14H leakage figures; shell test multiples.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'surface-safety-valves-and-esd-systems',
  title: 'Surface safety valves and ESD systems: how an SSV closes a well, and how it is tested',
  excerpt:
    'A surface safety valve is a wellhead gate valve held open by hydraulic or pneumatic pressure and closed by a spring when that pressure is lost — by a pilot sensing high or low line pressure, a fusible plug in a fire, or an ESD button. What API 6A requires of an SSV (PR2, a specified service class, no threaded ends), how the control panel and remote stations work, how often US offshore rules test them, and the accessories — locks, indicators, actuators — that go with them.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Surface Safety Valves (SSV) & ESD Systems Explained',
  seoDescription:
    'How surface safety valves and emergency shutdown systems work: API 6A SSV requirements (PSL 2, PR2, service class I–III), fail-close actuators, ESD panels, pilots and fusible plugs, test intervals under 30 CFR 250.880, and valve accessories.',
  focusKeyword: 'surface safety valve',
  publishedAt: '2026-10-21T23:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An SSV is a power-actuated wellhead valve that closes automatically when actuator pressure is cut off.',
        'API 6A: every SSV design meets PR2; the minimum PSL is 2; service class (I standard, II or III sandy) must be specified when ordering.',
        'API 6A does not permit threaded end connections or lock-open devices (except heat-sensitive designs) on an SSV.',
        'After a trip, the SSV and its controls must be reset by hand.',
        'US offshore rules test SSVs monthly to API 6AV2 — any observed leak means repair or replace.',
      ],
    },
    {
      type: 'lead',
      html: 'The SSV is usually the second master valve on a production tree or the safety valve on a well-test flowhead. It does nothing most of its life except stay open — and then has to close the well, against full pressure, the moment something goes wrong: a line break, a fire, an overpressure downstream, or an operator hitting an ESD station. Everything about how it is specified, controlled and tested follows from that.',
    },

    { type: 'section_head', number: '/01', title: 'What API 6A requires.', anchor: 'api-6a' },
    {
      type: 'comparison_table',
      caption: 'API 6A rules for SSVs, as summarised in SLB’s API 6A guide',
      columns: ['Requirement', 'Rule'],
      rows: [
        { cells: ['Definition', 'Power-actuated wellhead valve that closes automatically on loss of actuator power'], highlight: true },
        { cells: ['Product specification level', 'PSL 2 minimum (PSL 3 for a boarding shutdown valve)'] },
        { cells: ['Performance requirement', 'PR2 for every SSV design'] },
        { cells: ['Service class', 'I standard; II and III sandy service (500-cycle sand-slurry test, API 6AV1) — specify at order'] },
        { cells: ['End connections', 'Threaded ends not permitted'] },
        { cells: ['Actuator', 'Hydraulic or pneumatic; normally closed; no lock-open device except heat-sensitive designs'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Material and temperature classes are specified as for any API 6A valve: DD, EE, FF and HH for sour service to NACE MR0175 / ISO 15156, and temperature classes such as P (−20 to 180 °F) and U (0 to 250 °F) — SLB notes P+U as a common gate-valve rating. Working pressures are 2,000 to 20,000 psi. For reading the nameplate, see <a href="/blog/api-6a-nameplate-markings">API 6A nameplate markings</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'How the ESD system closes it.', anchor: 'esd' },
    {
      type: 'prose',
      html: '<p>A Cameron SSV control system, as SLB describes it, has two circuits. A high-pressure circuit — charged by a hand pump rated to 5,000 psig — holds the actuator open. A low-pressure control circuit of pilot valves, low-wattage solenoids and fusible plugs holds an <strong>arming valve</strong> in the armed position. Any of these trips it:</p><ul><li>a <strong>pilot</strong> sensing an abnormal rise or fall in line pressure;</li><li>a <strong>fusible plug</strong> melting in a fire;</li><li>a <strong>solenoid</strong> de-energised by a remote ESD station or the control system.</li></ul><p>The arming valve vents the actuator and the spring closes the gate without help from well pressure. Restarting is deliberate: SLB states the SSV and controls must be manually reset after a trip. ESD panels for well testing work the same way, with several remote push-button stations around the spread.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Testing.', anchor: 'testing' },
    {
      type: 'prose',
      html: '<p>On US offshore facilities, 30 CFR 250.880 requires SSVs to be tested for operation and leakage once each calendar month, no more than six weeks apart, to <strong>API Standard 6AV2</strong>. If the valve does not operate properly, or any gas or liquid flow is observed during the leak test, it must be repaired or replaced immediately. Pneumatic ESD systems are tested monthly, alternating stations so that each test closes at least one SSV; electronic ESD systems every three months. Onshore and outside the US, follow the operator’s and regulator’s procedure — but the monthly function test is a sound baseline.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Accessories.', anchor: 'accessories' },
    {
      type: 'prose',
      html: '<ul><li><strong>Lockout devices</strong> padlock a valve open or closed for maintenance — part of an energy-control programme such as OSHA 1910.147, not a substitute for one.</li><li><strong>Position indicators</strong> with a 4–20 mA output tell the control room whether the valve has actually moved.</li><li><strong>Actuators and mounting kits</strong>: ISO 5211 is the interface for part-turn (quarter-turn) actuators — ball, plug and butterfly valves; multi-turn gate valves use different interfaces.</li><li><strong>Gear operators</strong> reduce the effort to turn a large manual valve.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a surface safety valve?', answer: 'A power-actuated wellhead valve that closes automatically when its actuator pressure is cut off — usually the second master valve on the tree.' },
        { question: 'What PR level does an SSV need?', answer: 'API 6A requires every SSV design to meet PR2, with PSL 2 as the minimum product specification level.' },
        { question: 'What do SSV Class I, II and III mean?', answer: 'Service class: Class I is standard service; Classes II and III are sandy service, validated with a 500-cycle sand-slurry flow test.' },
        { question: 'How often is an SSV tested?', answer: 'US offshore rules require a monthly operation and leak test to API 6AV2, no more than six weeks apart.' },
        { question: 'Can an SSV have a hammer-union outlet?', answer: 'API 6A does not permit threaded end connections on an SSV; confirm any union-end design with the maker and the operator.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Surface safety valves, the ESD panel that controls them, and valve accessories:</p>' + stockList(['oilfield-ssv-esd-valves', 'wt-esd-panel', 'oilfield-valve-accessories']),
    },
    {
      type: 'product_embed',
      heading: 'SSVs, ESD and accessories',
      skus: ['IH-OFV-SSV-3116-15K-FE-FMC', 'IH-OFV-SSV-2116-15K-FE-CAMERON', 'IH-OFV-SSV-3116-10K-1502-CAMERON', 'IH-ESD-1SSV-SS316-3R', 'IH-OFV-ACC-INDICATOR-POSITION-CAMERON', 'IH-OFV-ACC-LOCK-LOTO-INDUS', 'IH-OFV-ACC-ACTUATOR-HYDRAULIC-DA-CAMERON'],
    },
    { type: 'category_link', slug: 'oilfield-ssv-esd-valves', label: 'Surface safety valves', blurb: 'Hydraulically actuated SSVs, 10K and 15K.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Production trees and well testing.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'slb-6a', text: 'SLB (Cameron). Introduction to API Specification 6A.', url: 'https://www.slb.com/-/media/files/sur/brochure/introduction-to-api-specification-6a.ashx' },
        { id: 'slb-ssv-control', text: 'SLB (Cameron). SSV control system brochure.', url: 'https://www.slb.com/-/media/files/sur/brochure/ssv-control-system-br.ashx' },
        { id: 'cfr-250-880', text: 'US eCFR. 30 CFR 250.880 — Production safety system testing.', url: 'https://www.ecfr.gov/current/title-30/chapter-II/subchapter-B/part-250/subpart-H/section-250.880' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['api-6a-nameplate-markings', 'wellhead-components-explained', 'oilfield-pressure-relief-valves', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'SSV requirements from SLB’s API 6A guide; control system from the SLB (Cameron) brochure; test intervals from 30 CFR 250.880.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying an SSV?',
      body: 'Send the bore and pressure rating, end connections, material and temperature class, service class, PSL, and how it will be controlled. We will quote the valve, actuator and ESD panel together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
