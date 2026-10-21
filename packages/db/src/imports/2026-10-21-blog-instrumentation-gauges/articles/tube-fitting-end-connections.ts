import type { BlogArticleSeed } from '../shared'

/**
 * Tube fitting end connections. Thread standards and sealing from Swagelok MS-01-140 p.9 and MS-13-151, Parker
 * Bulletin 4200-B4 pp.59–63; bored-through derating 0.75/0.50/0.25 (Swagelok); insert rule for soft plastic tube;
 * O-seal and positionable make-up. ISO 11926 twin of SAE J1926 not asserted (unverified). Our listing ends from the
 * IH-TF size tables (NPT to ASME B1.20.1, BSPT to ISO 7-1, BSPP gauge, SAE straight thread, socket and pipe weld).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tube-fitting-end-connections',
  title: 'Tube fitting end connections: NPT, BSPT, BSPP gauge ports, SAE straight thread, weld and bulkhead ends',
  excerpt:
    'The tube end of an instrument fitting is the easy half; the other end has to match a valve, gauge, transmitter or pipe that was chosen by someone else. Every common end — NPT and BSPT tapers, BSP parallel and gauge connectors, SAE straight-thread O-ring ports, socket and pipe weld, bulkhead, port connectors, inserts and bored-through fittings — with the standard, how it seals and the mistakes that make it leak.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Tube Fitting End Connections: NPT, BSPP, SAE, Weld & Bulkhead',
  seoDescription:
    'Instrument tube fitting end connections explained: NPT and BSPT taper threads, BSPP and gauge connectors, SAE straight thread O-ring ports, socket and pipe weld, bulkhead and port connectors, inserts and bored-through fittings.',
  focusKeyword: 'tube fitting end connections',
  publishedAt: '2026-10-21T13:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Tapered threads — NPT (ASME B1.20.1) and BSPT (ISO 7) — seal on the threads and always need a thread sealant; they are not interchangeable with each other.',
        'Parallel threads — BSPP (ISO 228-1) and SAE straight thread (SAE J1926) — do not seal on the thread; a washer, gasket or O-ring does.',
        'Gauge connectors use a BSP parallel female thread with a copper, nickel or PTFE gasket, based on EN 837 gauge ends.',
        'Bored-through fittings for thermocouples are derated: 0.75 of the tube rating up to 1/2", 0.50 to 3/4", 0.25 above.',
        'Soft plastic tube needs an insert so the ferrules have something to grip against.',
      ],
    },
    {
      type: 'lead',
      html: 'An instrument line starts and ends at somebody else’s equipment: a transmitter with a 1/2" NPT process connection, a European valve with BSP ports, a hydraulic manifold with SAE O-ring bosses, a gauge with a G 1/2 stem, a welded header. The tube fitting has to bridge the tube to each of them. This guide covers the end connections and how each one seals — because a joint that seals on its threads and one that seals on a washer are made up in completely different ways.',
    },

    { type: 'section_head', number: '/01', title: 'Tapered threads: NPT and BSPT.', anchor: 'taper' },
    {
      type: 'prose',
      html: '<p>Tapered threads seal by wedging: as the male thread goes in, the taper tightens it against the female thread and the flanks seal — with help from a thread sealant filling the spiral leak path at the crests and roots.</p><ul><li><strong>NPT</strong> — American taper pipe thread to ASME B1.20.1: 60° thread angle, taper of 1° 47′ on the diameter. Our NPT connectors are cut to ASME B1.20.1, in 1/16" to 1" sizes.</li><li><strong>BSPT</strong> — British taper pipe thread, ISO 7-1 (equivalents include BS EN 10226-1, DIN 2999 and JIS B0203): 55° thread angle, same 1° 47′ taper. Parker notes plainly that BSPT will not substitute for NPT.</li></ul><p>Both makers’ rule for tapered threads: <strong>always use a thread sealant</strong> — an anaerobic sealant or PTFE tape — on the male thread, kept off the first thread so it cannot shed into the line. Never put sealant on the tube end of a compression fitting; the ferrules seal there.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'NPT and BSPT look close and do not mate.',
      body: 'The thread angle (60° against 55°) and the pitch on several sizes differ. A BSPT male in an NPT port may start a few turns and feel tight, but it seals on a fraction of the thread and leaks or lets go under pressure. Identify the thread with a pitch gauge before ordering — see the fitting identification articles.',
    },

    { type: 'section_head', number: '/02', title: 'Parallel threads: BSPP and gauge connectors.', anchor: 'bspp' },
    {
      type: 'prose',
      html: '<p>A parallel thread holds the joint together but does not seal it. The seal is made on the face of the port, by something squeezed between the fitting and the port face:</p><ul><li><strong>Bonded or elastomer seal</strong> — ISO 1179-3 / ISO 228-1 style ends, often with an O-ring and retaining ring (Parker’s “Form A” uses a bonded washer).</li><li><strong>Metal-to-metal or metal gasket</strong> — ISO 1179-1/1179-4 style ends with a sealing edge or a copper gasket (Parker’s “Form B”).</li><li><strong>Gauge connectors</strong> — a female BSP parallel thread designed for pressure gauges, based on EN 837-1 and EN 837-3 gauge ends, sealing with a copper or nickel gasket, or a PTFE gasket. Our gauge connectors are listed as tube × BSPP female in 1/4" to 1/2" tube sizes.</li></ul><p>Never use thread sealant on a parallel thread to stop a leak: it does nothing for a face seal and can stop the face seating properly. Replace the washer or gasket instead.</p>',
    },

    { type: 'section_head', number: '/03', title: 'SAE straight thread O-ring ports.', anchor: 'sae' },
    {
      type: 'prose',
      html: '<p>The SAE straight-thread O-ring port — SAE J1926, the same port as MS16142 — is the standard port on North American hydraulic components. A UN/UNF straight thread holds the fitting, and an O-ring in a chamfer at the port mouth seals it. Swagelok lists light-duty (SAE J1926/3) and heavy-duty (SAE J1926/2) versions. Straight-thread tube fittings use 90-durometer fluorocarbon O-rings as standard.</p><p><strong>Positionable elbows and tees</strong> use the same port with a locknut and backup washer so the fitting can be turned to face the tube before it is locked: screw it in until the washer meets the port face, back it out up to one turn to align, then run the locknut down until the washer meets the face again.</p><p><strong>O-seal male connectors</strong> (straight thread or NPT) carry a 70-durometer nitrile O-ring for vacuum and low-pressure service; make them up finger-tight to metal-to-metal contact, then slightly with a wrench, and leave the factory lubricant on the O-ring.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Weld ends.', anchor: 'weld' },
    {
      type: 'prose',
      html: '<p>Where a tube line joins welded pipework or a vessel, makers offer <strong>socket weld</strong>, <strong>male pipe weld</strong> and <strong>tube butt weld</strong> connectors and elbows. Before welding, remove the nut and ferrules and fit a plug or spare nut to protect the threads; use a heat sink on the tube-fitting end; tack at four points 90° apart and then complete the weld. After welding carbon-steel fittings, re-lubricate the threads. Welding bulkhead unions are available for panel penetrations that are welded rather than locked with a nut.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Bulkheads, port connectors, reducers and plugs.', anchor: 'panel' },
    {
      type: 'prose',
      html: '<ul><li><strong>Bulkhead unions and connectors</strong> pass through a panel or enclosure wall and lock with a nut, so a tube line can cross the wall with a fitting on each side.</li><li><strong>Port connectors</strong> have a machined ferrule at one end, so two fittings can be joined directly without a length of tube between them. Discard the original ferrules and tighten 1/4 turn (1/8 turn on 1/16"–3/16").</li><li><strong>Reducers</strong> step tube size down inside a fitting. Swagelok specifies long reducers only in female tube-fitting ends.</li><li><strong>Caps and plugs</strong> close a tube end or a fitting port; plugs take 1/4 turn past finger-tight (1/8 on small sizes).</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Inserts and bored-through fittings.', anchor: 'special' },
    {
      type: 'prose',
      html: '<p><strong>Inserts</strong> are short metal sleeves pushed into the end of soft or pliable plastic tube so the ferrules compress the tube against something rigid. Swagelok’s rule is to always use one with extremely soft plastic tubing, and to size it from both the tube’s OD and ID.</p><p><strong>Bored-through fittings</strong> have the body’s tube stop machined away so a thermocouple, a dip tube or a smaller tube can pass straight through — the basis of a thermocouple gland or a heat-exchanger tee. Removing the stop removes some of the body’s strength, so they are derated: Swagelok rates them at <strong>0.75</strong> of the tube rating up to 1/2" (12 mm), <strong>0.50</strong> above 1/2" to 3/4" (12–18 mm), and <strong>0.25</strong> above 3/4". Our single-ferrule thermocouple connectors are bored-through tube × NPT male.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'End connections at a glance',
      columns: ['End', 'Standard', 'Seals on', 'Sealant?'],
      rows: [
        { cells: ['NPT male/female', 'ASME B1.20.1', 'Thread flanks (taper)', 'Always'] },
        { cells: ['BSPT male', 'ISO 7-1', 'Thread flanks (taper)', 'Always'] },
        { cells: ['BSPP (port)', 'ISO 228-1, ISO 1179', 'Washer, O-ring or metal edge', 'Never'] },
        { cells: ['Gauge connector', 'Based on EN 837-1/-3', 'Copper, nickel or PTFE gasket', 'Never'], highlight: true },
        { cells: ['SAE straight thread', 'SAE J1926', 'O-ring in port chamfer', 'Never'] },
        { cells: ['Socket / pipe / butt weld', 'Per pipe spec', 'Weld', '—'] },
        { cells: ['Tube end', 'Maker’s own design', 'Ferrules', 'Never'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do I need PTFE tape on a compression fitting?', answer: 'Not on the tube end — the ferrules seal there. Use sealant only on tapered pipe threads (NPT, BSPT), where makers say to always use it, kept off the first thread.' },
        { question: 'Can I use an NPT fitting in a BSP port?', answer: 'No. NPT has a 60° thread and BSP 55°, and several pitches differ. Taper and parallel threads also seal differently. Identify the port thread before ordering.' },
        { question: 'What is a gauge connector?', answer: 'A tube fitting with a BSP parallel female end designed for a pressure gauge stem, sealing with a copper, nickel or PTFE gasket rather than on the thread.' },
        { question: 'How does an SAE straight thread fitting seal?', answer: 'With an O-ring compressed into the chamfer at the mouth of the port; the thread only holds the fitting. It is the SAE J1926 port.' },
        { question: 'What is a bored-through fitting?', answer: 'A fitting with its internal tube stop removed so a thermocouple or tube can pass through. It is derated to 0.75, 0.50 or 0.25 of the tube rating depending on size.' },
        { question: 'When do I need a tube insert?', answer: 'With soft or pliable plastic tube, so the ferrules grip against a rigid sleeve. Size the insert from the tube’s OD and ID.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Connectors by end type',
      skus: ['IH-TF-AM', 'IH-TF-CF', 'IH-TF-CG', 'IH-TF-MCS-SF', 'IH-TF-LS', 'IH-TF-CSW', 'IH-TF-CBF', 'IH-TF-MCT-SF'],
    },
    { type: 'category_link', slug: 'double-ferrule-tube-fittings', label: 'Double ferrule tube fittings', blurb: 'NPT, BSPP, SAE, weld, bulkhead and port connector ends.' },
    { type: 'category_link', slug: 'single-ferrule-tube-fittings', label: 'Single ferrule tube fittings', blurb: 'Including BSPT metric connectors and thermocouple fittings.' },
    {
      type: 'related_articles',
      slugs: ['instrumentation-tube-fittings-guide', 'how-to-make-up-a-compression-fitting', 'bspp-vs-bspt', 'stopping-an-npt-thread-leak', 'sealant-on-hydraulic-threads'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Standards and sealing methods from Swagelok and Parker literature; derating and insert rules from Swagelok; our ends from our tube fitting listings.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a fitting to a port?',
      body: 'Send the tube size and the port — thread type and size, or a photograph with a pitch gauge on it. We will quote the right connector and the gasket or O-ring it needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
