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
 * Added 2026-10-21 (actuators, WHCP, HIPPS): SLB API 6A guide again (actuators and actuated valves for general use are
 * in API 6A; PSLs not applicable to actuators, FAT per 14.16.4; retained-fluid actuators removed in the 21st edition,
 * valve cannot be monogrammed with one; SSV PSL-1 not applicable); SLB API Spec 6A Technologies page (pneumatic piston
 * actuators in air-operated systems, sequenced closure; hydraulic for large-bore, high-pressure, high-thrust, no gas
 * source or well gas too sour; double-acting actuated gate valves for positive control of frac valves); NOV Axelson
 * pneumatic safety valves flyer 12931 (fail-safe diaphragm, large area for low control pressure, 150 psi max, rolling
 * diaphragm with no moving O-rings, relief valve); SLB HIPPS brochure (SIS preventing overpressure; IEC 61508 / 61511;
 * redundancy in initiators, logic solver and final elements at least as reliable as a relief valve; 1oo2 / 2oo3
 * transmitters, two spring-return shutdown valves; independent of PSD/ESD; fail-close on loss of power or signal;
 * reduces relief and flare load; SIL per safety function, SIL 3 = PFD 1e-4 to 1e-3; partial or full-stroke testing).
 * NOT used: API RP 14H leakage figures; shell test multiples; HIPPS closure times; IEC 61511 clause wording (not read).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'surface-safety-valves-and-esd-systems',
  title: 'Surface safety valves and ESD systems: how an SSV closes a well, and how it is tested',
  excerpt:
    'A surface safety valve is a wellhead gate valve held open by hydraulic or pneumatic pressure and closed by a spring when that pressure is lost — by a pilot sensing high or low line pressure, a fusible plug in a fire, or an ESD button. What API 6A requires of an SSV (PR2, a specified service class, no threaded ends), how the control panel and remote stations work, how often US offshore rules test them, and the actuators, control panels, HIPPS and accessories that go with them.',
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

    { type: 'section_head', number: '/05', title: 'Actuators for API 6A gate valves.', anchor: 'actuators' },
    {
      type: 'prose',
      html: '<p>API 6A covers actuators and actuated valves for general use as well as SSVs. Two points from SLB’s guide matter when ordering. <strong>Product specification levels do not apply to actuators</strong> — there is one level of requirements, with its own factory acceptance test — so PSL belongs on the valve, not the actuator. And <strong>retained-fluid actuators were removed in the 21st edition</strong>: a valve fitted with one cannot carry the API monogram. For an SSV the actuator must be hydraulic or pneumatic and the valve normally closed.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Actuator types for API 6A gate valves',
      columns: ['Type', 'How it works', 'Where it fits'],
      rows: [
        { cells: ['Pneumatic diaphragm', 'A large diaphragm holds the gate open against a spring on low-pressure air or gas; NOV’s design runs to 150 psi control pressure, with no moving O-ring seals', 'Wellhead SSVs, flowlines, headers and pipeline ESD valves'], highlight: true },
        { cells: ['Pneumatic piston', 'A piston in place of the diaphragm, on the same supply media', 'Air-operated systems; SLB cites sequenced closure during shutdown'] },
        { cells: ['Hydraulic, spring return', 'Hydraulic pressure opens, a spring closes on loss of pressure', 'Large-bore, high-pressure valves; where there is no gas supply or the well gas is too sour'] },
        { cells: ['Hydraulic, double acting', 'Hydraulic pressure drives the gate both ways; no spring, so no fail position of its own', 'Frac and manifold valves needing positive control — not an SSV, which must be normally closed'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>We list <a href="/p/pneumatic-diaphragm-actuator-api-6a">pneumatic diaphragm</a> and <a href="/p/pneumatic-piston-actuator-api-6a">pneumatic piston</a> actuators, <a href="/p/hydraulic-single-acting-actuator-api-6a">single-acting</a> and <a href="/p/hydraulic-double-acting-actuator-api-6a">double-acting</a> hydraulic actuators, and a <a href="/p/compact-hydraulic-actuator-api-6a">compact hydraulic actuator</a> for crowded platforms and frac wellheads. To size one, send the valve make, bore, working pressure and bonnet, the supply medium and pressure available, and whether it must fail closed or open.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Wellhead control panels and HIPPS.', anchor: 'whcp-hipps' },
    {
      type: 'prose',
      html: '<p>A <strong>wellhead control panel</strong> applies the arming principle described above to one well or many: it supplies the hydraulic pressure that holds the downhole safety valve, the SSV and other shutdown valves open, and dumps it on a pilot trip, a fusible plug, a gas alarm or a command from the control room. Our <a href="/p/wellhead-control-panel-whcp">WHCP</a> covers single and multi-well systems; for a remote site with no air or power, a <a href="/p/hydraulic-emergency-shutdown-system-self-contained">self-contained hydraulic ESD system</a> opens the valve with a hand pump and holds it hydraulically.</p><p>A <strong>HIPPS</strong> (high integrity pressure protection system) does a different job. SLB describes it as a safety instrumented system, built to IEC 61508 and IEC 61511, that closes the source of overpressure before it reaches lower-rated pipe or plant downstream. It has redundancy in all three parts — pressure transmitters voting one-out-of-two or two-out-of-three, a logic solver, and two spring-return shutdown valves — and runs independently of the process shutdown and ESD systems, failing closed on loss of power or signal. Because it is at least as reliable as a relief valve, it can reduce the relief and flare load.</p><p>A safety integrity level is a property of each safety function, not of a box: SLB’s table, after IEC 61508-1, puts SIL 3 at a probability of failure on demand of 10⁻⁴ to 10⁻³. When buying a <a href="/p/hipps-high-integrity-pressure-protection-system">HIPPS</a>, ask for the SIL certificate for the complete loop, the proof-test interval it assumes, and whether partial-stroke testing is included.</p>',
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
        { question: 'What is the difference between an ESD system and a HIPPS?', answer: 'An ESD system shuts the well or plant on many causes. A HIPPS is an independent, redundant safety instrumented system built to IEC 61508 and 61511 that closes the line only to stop overpressure reaching lower-rated equipment.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Surface safety valves and HIPPS, actuators for API 6A gate valves, wellhead control panels and ESD systems, and valve accessories:</p>' + stockList(['oilfield-ssv-esd-valves', 'valve-actuators', 'wellhead-control-panels', 'wt-esd-panel', 'oilfield-valve-accessories']),
    },
    {
      type: 'product_embed',
      heading: 'SSVs, actuators, control panels and accessories',
      skus: ['IH-OFE-SSV', 'IH-OFV-SSV-3116-15K-FE-FMC', 'IH-OFV-SSV-2116-15K-FE-CAMERON', 'IH-ESD-1SSV-SS316-3R', 'IH-OFE-AHS', 'IH-OFE-APD', 'IH-OFE-WHC', 'IH-OFE-HIP'],
    },
    { type: 'category_link', slug: 'oilfield-ssv-esd-valves', label: 'Surface safety valves', blurb: 'Hydraulically actuated SSVs, 10K and 15K.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Production trees and well testing.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'slb-6a', text: 'SLB (Cameron). Introduction to API Specification 6A.', url: 'https://www.slb.com/-/media/files/sur/brochure/introduction-to-api-specification-6a.ashx' },
        { id: 'slb-ssv-control', text: 'SLB (Cameron). SSV control system brochure.', url: 'https://www.slb.com/-/media/files/sur/brochure/ssv-control-system-br.ashx' },
        { id: 'slb-6a-tech', text: 'SLB (Cameron). API Spec 6A Technologies — valves and actuators.', url: 'https://www.slb.com/zh-cn/valves/api-spec-6a-technologies' },
        { id: 'nov-pneumatic-ssv', text: 'NOV. Axelson Pneumatic Safety Valves flyer (12931).', url: 'https://assets.nov.com/NCP4N68N/at/qf7so4-3cuo88-7ccbet/12931_CAPS_ISE_WLFL_Axelson_Pneumatic_Safety_Valves_FLYR.pdf' },
        { id: 'slb-hipps', text: 'SLB (Cameron). HIPPS — High Integrity Pressure Protection Systems brochure.', url: 'https://www.slb.com/-/media/files/sur/brochure/hipps-br.ashx' },
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
      note: 'SSV and actuator requirements from SLB’s API 6A guide; actuator types from SLB and NOV; control system and HIPPS from SLB (Cameron) brochures; test intervals from 30 CFR 250.880.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying an SSV?',
      body: 'Send the bore and pressure rating, end connections, material and temperature class, service class, PSL, the actuator supply available, and how it will be controlled. We will quote the valve, actuator and control panel together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
