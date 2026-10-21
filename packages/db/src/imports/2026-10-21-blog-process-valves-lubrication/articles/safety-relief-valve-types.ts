import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Safety, relief and safety relief valves: types, back pressure, API 526/527, levers, ASME I vs VIII, tank vents.
 * Sources read 2026-10-21:
 * - Pentair Pressure Relief Valve Engineering Handbook TP-V300 (2012): safety / relief / safety relief valve
 *   definitions (adopted from ASME PTC 25); restricted-lift vs full-lift; conventional vs balanced definitions;
 *   conventional built-up back pressure not to exceed the overpressure (10% at 10% overpressure, per API 520 Part I);
 *   API 526 bellows valves to 30% total back pressure at 10% overpressure, bellows limit 230 psig small sizes to
 *   30 psig on some 8" x 10"; bellows isolates spring and guide, vented bonnet shows a leak; pilot seating force rises
 *   with pressure, operation to 95% (some 98%) of set, superimposed back pressure does not change opening pressure,
 *   capacity still corrected; API 526 is a purchasing standard with lettered orifices, covers flanged direct-spring
 *   and pilot valves with different envelopes; API 527 gas test at 90% of set, 40 bubbles/min for metal-seated
 *   orifices up to 0.307 in² below 1,000 psig, 20 for larger, soft seats zero bubbles; API 527 not used for Section I
 *   valves (no visible steam leakage instead); Section VIII 10% / 16% multiple / 21% fire accumulation; Section I 3%
 *   overpressure, 4% blowdown, 6% accumulation with multiple valves; lift lever at 75% of set for air, steam and water
 *   over 140 °F / 60 °C (Section VIII); Section I no isolation valves, Code Case 2254 changeover valves for drums to
 *   800 psig; Appendix M block valves with locks and procedures; API 2000 = ISO 28300, fixed-roof tanks full vacuum to
 *   15 psig, weight-loaded pallets (conservation / breather vents), vacuum pallet, emergency hatches, seat tightness
 *   at 75% of set; thermal relief from hydraulic expansion, API 521 notes a 3/4" x 1" valve is common; ISO 4126-1
 *   spring-loaded vs ISO 4126-4 pilot-operated; handbook excludes Section III nuclear use.
 * - Spirax Sarco, "Types of safety valve": ASME I opens within 3% and closes within 4%, ASME VIII within 10% / 7%;
 *   full/high/low lift (1/4, 1/12, 1/24 of bore); open lever where small leakage is tolerable, packed lever where
 *   media must not escape; open bonnet for high temperature.
 * - Neutrium, "Relief valve orifice area to API RP 526": D–T effective areas.
 * - National Board, PRD certification document: V = Section I, NV = Section III, UV/HV/UD = Section XIII.
 * - ASME, Section XIII product page: rules for overpressure protection of boilers, pressure vessels and piping.
 * NOT used: specific API 520 equations and coefficients; API 2000 venting rate tables; nuclear set pressures and
 * temperatures quoted in our listings (not found in any source read); Section I blowdown lower limit.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'safety-relief-valve-types',
  title: 'Safety relief valve types: conventional, balanced bellows, pilot-operated, and what API 526 and 527 mean',
  excerpt:
    'A safety valve pops, a relief valve opens in proportion, and a safety relief valve does either. How conventional, balanced bellows and pilot-operated valves handle back pressure, what the API 526 orifice letters D to T stand for, how API 527 seat tightness is tested, when ASME requires a lifting lever, how Section I steam valves differ from Section VIII, and where changeover valves, thermal relief valves and API 2000 tank vents fit.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Safety Relief Valve Types: Bellows, Pilot, API 526 and 527',
  seoDescription:
    'Safety vs relief valves; conventional, bellows and pilot types; back pressure; API 526 orifices D–T; API 527 seat tightness; ASME I vs VIII; tank vents.',
  focusKeyword: 'safety relief valve types',
  publishedAt: '2026-10-22T01:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A safety valve opens rapidly (compressible fluids), a relief valve opens in proportion (liquids), a safety relief valve can do either.',
        'Back pressure decides the type: conventional for low built-up back pressure, balanced bellows to about 30% total, pilot-operated beyond what a bellows can take.',
        'API 526 fixes the flanged envelope and the orifice letter, from D (0.110 in²) to T (26.0 in²); API 520 Part I sizes the valve.',
        'API 527 tests seat tightness at 90% of set pressure; soft-seated valves must show zero bubbles.',
        'ASME Section VIII wants a lifting lever on air, steam and water over 60 °C; Section I boiler valves open within 3% and reseat within 4%.',
        'Tank vents are a different family: API 2000 covers tanks from full vacuum to 15 psig.',
      ],
    },
    {
      type: 'lead',
      html: 'A pressure relief valve is the last thing between an upset and a ruptured vessel, and it is sized, set and certified for one specific relieving case. The names on a data sheet — safety valve, relief valve, safety relief valve, balanced, pilot, packed lever, Section I — each carry a requirement. This guide explains what they mean for process plant, boilers and storage tanks. For union-end relief valves on frac and well-service iron, see <a href="/blog/oilfield-pressure-relief-valves">oilfield pressure relief valves</a>; those sit outside API 526.',
    },

    { type: 'section_head', number: '/01', title: 'Safety, relief, or safety relief.', anchor: 'terms' },
    {
      type: 'prose',
      html: '<p>The terms come from ASME PTC 25 and are used the same way in API documents. All three are pressure relief valves: they open on inlet static pressure and reclose once normal conditions return.</p><ul><li><strong>Safety valve:</strong> rapid opening and closing — the “pop” — normally used on compressible fluids such as steam, air and gas.</li><li><strong>Relief valve:</strong> gradual opening and closing, roughly in proportion to the rise and fall in pressure; normally used on liquids.</li><li><strong>Safety relief valve:</strong> either characteristic, and suited to compressible or incompressible fluids. Most API 526 process valves are sold under this name, with gas or liquid trim.</li></ul><p>Lift is the other dividing line. In a <strong>full-lift</strong> valve the discharge area does not depend on how far the disc rises; in a <strong>restricted- or low-lift</strong> valve it does. Spirax Sarco gives typical lifts of at least a quarter of the bore for full lift and about 1/24 for low lift, which has the lowest capacity of the three classes. A low-lift valve such as our <a href="/p/low-lift-safety-relief-valve-liquid">low-lift liquid valve</a> trades capacity for a gentler, proportional opening on liquid service.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Conventional, bellows or pilot: decided by back pressure.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'The three main designs and their back-pressure limits',
      columns: ['Design', 'How it closes', 'Back pressure', 'Typical use'],
      rows: [
        { cells: ['Conventional spring-loaded', 'Spring on the disc; bonnet vented to the outlet', 'Changes set pressure. Built-up back pressure should not exceed the overpressure — 10% of set at 10% overpressure', 'Discharge to atmosphere or a low, steady header'], highlight: true },
        { cells: ['Balanced bellows', 'Spring on the disc; bellows isolates the disc top, bonnet vented to atmosphere', 'Most API 526 gas valves take total back pressure to 30% of set with no capacity loss; bellows strength sets an absolute limit', 'Closed headers with variable back pressure; corrosive or fouling fluids'] },
        { cells: ['Pilot-operated', 'System pressure on a piston or dome holds the main valve shut; a small pilot releases it', 'Superimposed back pressure does not change opening pressure; capacity is still corrected', 'Large orifices, high set pressure, operation close to set, high back pressure'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Back pressure comes in two kinds. <strong>Superimposed</strong> back pressure is already in the outlet before the valve lifts — a flare header shared with other units. <strong>Built-up</strong> back pressure is generated by the valve’s own flow through the discharge piping. On a <a href="/p/conventional-safety-relief-valve-api-526">conventional valve</a> superimposed back pressure adds to the spring and raises the opening pressure, and built-up back pressure above the allowed overpressure can make the valve unstable.</p><p>A <a href="/p/balanced-bellows-safety-relief-valve">balanced bellows valve</a> exposes equal areas above and below the disc holder to back pressure, so opening pressure stays put. The bellows also keeps the spring and guide out of the process and discharge fluid, which is why it is chosen for dirty or corrosive service and for <a href="/p/jacketed-safety-relief-valve">jacketed valves</a> on fluids that solidify. The bonnet vent must stay open to atmosphere: it relieves anything that leaks past the bellows and shows that the bellows has failed. The bellows itself has a pressure limit; the TP-V300 handbook notes API 526 examples from 230 psig on small valves down to 30 psig on some 8" × 10" sizes.</p><p>A <a href="/p/pilot-operated-safety-relief-valve">pilot-operated valve</a> works the other way round from a spring valve: seating force rises with system pressure, so it is tightest just before it must open. Most designs allow operation at 95% of set without leakage, some to 98%. Pilots come in snap-action (pop) and modulating types. Small pilot lines can block with debris or condensate, which is a point to settle on dirty service; elastomer pilot seals are replaced by metal seats in <a href="/p/high-temperature-pilot-operated-safety-valve">high-temperature steam designs</a>. Spring valves are covered by ISO 4126-1 and pilot-operated valves by ISO 4126-4.</p>',
    },

    { type: 'section_head', number: '/03', title: 'API 520, 526 and 527.', anchor: 'api' },
    {
      type: 'prose',
      html: '<p><strong>API 520 Part I</strong> is the sizing and selection practice: it gives the equations that turn a relieving rate into a required effective orifice area. <strong>API 526</strong> is a purchasing standard for flanged steel valves, direct-spring and pilot-operated. It fixes the centre-to-face envelope, the flange ratings and a minimum orifice for each letter, so a valve ordered by size and letter — 1D2 to 8T10, inlet, orifice, outlet — from one maker drops into the same piping as another’s. Direct-spring and pilot valves of the same letter can have different envelopes, so the type has to be stated.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'API 526 orifice letters and effective areas',
      columns: ['Letter', 'Effective area, in²', 'Letter', 'Effective area, in²'],
      rows: [
        { cells: ['D', '0.110', 'L', '2.853'] },
        { cells: ['E', '0.196', 'M', '3.60'] },
        { cells: ['F', '0.307', 'N', '4.34'] },
        { cells: ['G', '0.503', 'P', '6.38'] },
        { cells: ['H', '0.785', 'Q', '11.05'] },
        { cells: ['J', '1.287', 'R', '16.00'] },
        { cells: ['K', '1.838', 'T', '26.00'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>API 527</strong> sets seat tightness. For gas service the inlet is raised to 90% of set pressure and leakage is counted as bubbles from a tube held half an inch under water. A metal-seated valve set up to 1,000 psig may pass 40 bubbles a minute with an orifice of 0.307 in² or less, and 20 with a larger orifice; the allowance rises with set pressure. Soft-seated valves must show no bubbles at all. Liquid valves are tested with water and steam valves with steam. API 527 is not applied to ASME Section I valves, which must show no visible leakage of steam.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Levers, steam valves and changeovers.', anchor: 'asme' },
    {
      type: 'prose',
      html: '<p><strong>Lifting levers.</strong> Under ASME rules a valve on air, steam, or water above 60 °C (140 °F) must have a device to prove the trim is free when pressure is at least 75% of set — a lever on a spring valve, a lever or field test connection on a pilot valve. An <a href="/p/safety-relief-valve-open-lever-steam">open lever</a> suits steam and air, where a little leakage at the cap is acceptable; a <a href="/p/safety-relief-valve-packed-lever">packed lever</a> seals the cap where the fluid must not escape. ISO 4126 does not mandate a lever.</p><p><strong>Section I against Section VIII.</strong> Section I covers boilers. A <a href="/p/high-performance-steam-safety-valve-asme-i">Section I steam safety valve</a> must open within 3% overpressure and reseats with about 4% blowdown, usually using two adjusting rings; with more than one valve, accumulation may reach 6%. Pressure vessel valves (formerly Section VIII, now under Section XIII’s overpressure rules) are sized at 10% overpressure for a single valve, 16% for multiple valves and 21% for fire. Each certified design carries its code designator: V for Section I, UV for pressure vessels under Section XIII, NV for Section III nuclear valves. Open bonnets are common on boiler valves because they keep the spring cool.</p><p><strong>Duty and standby.</strong> Section I forbids isolation valves between the boiler and its safety valves; Code Case 2254 permits a changeover (diverter) valve on drums up to 800 psig, provided both safety valves can never be blocked at once and the active valve is clearly indicated. For pressure vessels, ASME allows locked block valves under a managed procedure. A <a href="/p/safety-valve-changeover-valve">changeover valve</a> on a twin manifold does the same job in one handwheel, so one valve can be pulled for testing while the other stays on line.</p><p><strong>Thermal relief.</strong> Liquid trapped between closed valves expands when it is heated by the process or the sun. API 521 notes the required rate is hard to calculate and that a small 3/4" × 1" valve is commonly fitted; our <a href="/p/thermal-relief-valve-threaded">thermal relief valves</a> are threaded for that job.</p><p><strong>Nuclear.</strong> Safety valves for reactor coolant, main steam and auxiliary systems are built to ASME Section III and marked NV, under a nuclear quality programme. They are specified by the plant’s design authority; send the full Section III data sheet with any enquiry.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Storage tank venting to API 2000.', anchor: 'tanks' },
    {
      type: 'prose',
      html: '<p>Atmospheric and low-pressure tanks are a separate problem. API 2000 (identical to ISO 28300) covers fixed-roof tanks designed from full vacuum to 15 psig, and the pressures involved are in millibar. Pumping in and warming make a tank breathe out; pumping out and cooling pull it into vacuum, and a thin roof can collapse.</p><ul><li><strong>Pressure relief (breather) vent:</strong> a weight- or spring-loaded pallet that opens at a low set pressure — see <a href="/p/tank-pressure-relief-valve-api-2000">tank pressure relief valves</a>.</li><li><strong>Vacuum relief vent:</strong> a pallet that lets air or blanket gas in — <a href="/p/tank-vacuum-relief-valve-api-2000">tank vacuum relief valves</a>.</li><li><strong>Pressure/vacuum conservation vent:</strong> both pallets in one body, sealed in between to hold vapour in — <a href="/p/pressure-vacuum-relief-valve-api-2000">conservation vents</a>.</li><li><strong>Emergency vent:</strong> a weighted hinged cover on a manway, set above the breather, for the much larger flow when fire boils the contents — <a href="/p/tank-emergency-vent-api-2000">emergency vents</a>.</li></ul><p>Weighted pallets can need close to 100% overpressure to reach full lift, so the setting has to leave margin below the tank’s design pressure. API 2000 checks seat tightness at 75% of set.</p>',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a safety valve and a relief valve?', answer: 'A safety valve opens rapidly with a pop and is used on gas, vapour and steam; a relief valve opens gradually in proportion to overpressure and is used on liquids. A safety relief valve can do either.' },
        { question: 'When do I need a balanced bellows valve?', answer: 'When the outlet sees variable superimposed back pressure, or built-up back pressure above the allowed overpressure, as in a shared flare header. It also protects the spring from corrosive fluid.' },
        { question: 'What does an API 526 orifice letter mean?', answer: 'Each letter, D to T, is a minimum effective orifice area with a fixed flanged envelope, from 0.110 in² for D to 26.0 in² for T. API 520 Part I sizing selects the letter.' },
        { question: 'What is the API 527 leakage limit?', answer: 'For metal-seated gas valves set up to 1,000 psig, 40 bubbles a minute at 90% of set for orifices up to F, 20 for larger ones. Soft seats allow none.' },
        { question: 'Does every relief valve need a lifting lever?', answer: 'Under ASME, valves on air, steam and water above 60 °C need one, usable from 75% of set. Use a packed lever where the fluid must not escape at the cap.' },
        { question: 'Is a tank breather vent a safety valve?', answer: 'It is a pressure relief device, but sized and tested to API 2000 for tanks up to 15 psig, not to API 526. Fire relief needs an emergency vent as well.' },
      ],
    },
    {
      type: 'prose',
      html:
        '<h3>What we list</h3><p>Safety and relief valves, changeover valves and tank vents, all supplied with the data sheet and test records:</p>' +
        stockList(['safety-relief-valves']) +
        '<p>For a quote, send the fluid and phase, relieving rate and case, set pressure, back pressure (superimposed and built-up), relieving temperature, inlet and outlet ratings, the code (ASME Section I, Section VIII/XIII, API 2000, ISO 4126 or Section III) and any lever or material requirement.</p>',
    },
    {
      type: 'product_embed',
      heading: 'Safety and relief valves',
      skus: ['IH-SR-CSV', 'IH-SR-BSV', 'IH-SR-POV', 'IH-SR-STM', 'IH-SR-PLV', 'IH-SR-TRV', 'IH-SR-CHG', 'IH-SR-PVV'],
    },
    { type: 'category_link', slug: 'safety-relief-valves', label: 'Safety and relief valves', blurb: 'API 526 relief valves, steam safety valves and API 2000 tank vents.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Relief protection for process plant, headers and tank farms.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'tpv300', text: 'Pentair. Pressure Relief Valve Engineering Handbook, Technical Publication TP-V300, 2012.', url: 'https://www.iomosaic.com/diersweb/docs/pvcmc-0296-us_tcm106-35825.pdf' },
        { id: 'spirax-types', text: 'Spirax Sarco. “Types of safety valve.” Learn about steam.', url: 'https://www.spiraxsarco.com/learn-about-steam/safety-valves/types-of-safety-valve' },
        { id: 'neutrium-526', text: 'Neutrium. “Relief valve orifice area to API RP 526.”', url: 'https://neutrium.net/articles/equipment/relief-valve-orifice-area-to-api-rp-526/' },
        { id: 'nb-prd', text: 'National Board of Boiler and Pressure Vessel Inspectors. Pressure relief device certification: code designators.', url: 'https://www.nationalboard.org/SiteDocuments/NB18/PRDCert.pdf' },
        { id: 'asme-xiii', text: 'ASME. BPVC Section XIII, Rules for Overpressure Protection.', url: 'https://www.asme.org/codes-standards/find-codes-standards/bpvc-xiii-bpvc-section-xiii-rules-overpressure-protection' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['oilfield-pressure-relief-valves', 'surface-safety-valves-and-esd-systems', 'needle-globe-and-instrumentation-valves', 'steam-hose-safety', 'api-600-602-603-gate-and-globe-valves'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Definitions, back-pressure limits, API 526/527 and ASME rules from the TP-V300 handbook (2012) and Spirax Sarco; code designators from the National Board.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a relief valve?',
      body: 'Send the data sheet, or the fluid, relieving rate, set and back pressure, temperature and governing code. We will confirm the type and orifice and quote with the test records.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
