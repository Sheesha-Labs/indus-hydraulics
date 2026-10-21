import type { BlogArticleSeed } from '../shared'

/**
 * Treating-line instrumentation. 1502 transducers (Barksdale R0084-B: 0–20,000 psi, 4–20 mA, ≤±0.25 %, 1.5× over-range,
 * 2.5× burst; Honeywell Model 437 ±0.2 % FS); debooster 4:1 and 1:1 protectors (maker excerpts only — described as
 * "commonly"); Sensia NUFLO turbine meters (15,000 psi 1502 versions, tungsten carbide bearings, magnetic pickup, ±1 %
 * standard / ±0.5 % industrial linearity); Endress+Hauser magmeter principle and ≥5 µS/cm typical minimum conductivity;
 * Micro Motion Coriolis mass flow and density (HPC data sheet); nuclear-replacement claim presented as maker claim;
 * 4–20 mA loop (Barksdale) and NAMUR NE 43 levels (excerpts — given as "commonly"); API 6A P and U classes (secondary).
 * Our instruments from their listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-pressure-and-flow-instrumentation',
  title: 'Frac and cementing instrumentation: 1502 pressure transducers, deboosters, flowmeters, Coriolis and DAQ',
  excerpt:
    'A treating line runs at up to 15,000 psi with abrasive slurry, and every number on the job report comes from a handful of instruments screwed onto hammer unions. How 1502 pressure transducers and deboosters work, turbine, magnetic and Coriolis flowmeters and which fluids each can measure, pump stroke sensors, 4–20 mA loops, data acquisition and thermowells.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Frac & Cementing Instrumentation: Transducers, Flowmeters, DAQ',
  seoDescription:
    'Oilfield treating-line instrumentation explained: Fig 1502 pressure transducers and deboosters, turbine, magnetic and Coriolis flowmeters, magnetic pickup sensors, 4–20 mA loops, data acquisition systems and API 6A thermowells.',
  focusKeyword: 'frac pressure transducer',
  publishedAt: '2026-10-21T14:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Fig 1502 hammer-union pressure transducers put a 4–20 mA sensor straight onto the treating line: typical ranges run to 15,000 or 20,000 psi at about ±0.2–0.25% of span.',
        'A debooster isolates a gauge from abrasive well fluid — commonly with a stepped piston that reduces line pressure 4:1, so the gauge is scaled to read a quarter of line pressure.',
        'Turbine meters measure volume flow of clean or erosive liquids at 15,000 psi; magnetic meters need a conductive fluid (typically at least 5 µS/cm); Coriolis meters measure mass flow and density directly.',
        'Magnetic pickups count turbine blades and pump strokes; the DAQ turns pulses and 4–20 mA signals into the job record.',
        '4–20 mA has a live zero: 4 mA is zero pressure, so a dead loop reads 0 mA and is not mistaken for zero.',
      ],
    },
    {
      type: 'lead',
      html: 'Fracturing, cementing, acidising and well testing are measured jobs. Pressure, rate, density and volume are recorded every second, the treatment is run against them, and the job report the operator receives is built from them. The instruments that make those numbers sit on 2" Fig 1502 hammer unions on a line full of sand, cement or acid at up to 15,000 psi. This guide covers what each one measures and what it needs to measure it well.',
    },

    { type: 'section_head', number: '/01', title: 'Pressure: transducers, gauges and deboosters.', anchor: 'pressure' },
    {
      type: 'prose',
      html: '<h3>1502 pressure transducers</h3><p>A hammer-union pressure transducer has the sensing diaphragm and a Fig 1502 union machined as one part, so it screws straight onto the treating iron. Published examples: Barksdale’s hammer-union transducer covers 0–5,000, 10,000, 15,000 and 20,000 psi, two-wire 4–20 mA, accuracy within ±0.25% of span, 1.5× over-range and 2.5× burst, Inconel 718 and 316 wetted parts, and an Ex ia hazardous-area rating; Honeywell’s Model 437 wing-union transducer reads to 20,000 psi at ±0.2% of full scale, with a NACE-compliant Inconel 718 option. Our electronic pressure sensor is 0–15,000 psi on a 2" Fig 1502M connection with 4–20 mA output for the DAQ.</p><h3>Deboosters and gauge protectors</h3><p>A mechanical gauge cannot sit in frac slurry: the sand plugs and erodes the Bourdon tube. A <strong>debooster</strong> separates the gauge’s clean fluid from the well fluid. Makers commonly describe a stepped piston that reduces line pressure 4:1, with the gauge scaled to read true line pressure from a quarter of it; a fluid separator replaces the union seal and keeps well fluid away from the gauge fluid. Where no pressure reduction is wanted, a 1:1 diaphragm or piston gauge protector isolates the gauge without changing pressure. Our analogic pressure sensor pairs a 2" Fig 1502 debooster with a 6" glycerine-filled gauge and an adjustable overpressure shutdown proximity switch for interlock with the ESD system, with ranges to 15,000 psi and SS316 wetted parts (NACE MR0175 on request).</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A debooster gauge reads a scaled pressure.',
      body: 'If a debooster reduces pressure 4:1, its gauge is calibrated to show line pressure from a quarter of it. Never swap in an ordinary gauge — it will read a quarter of the real pressure — and never move a debooster gauge to a direct connection.',
    },

    { type: 'section_head', number: '/02', title: 'Flow: turbine, magnetic and Coriolis.', anchor: 'flow' },
    {
      type: 'comparison_table',
      caption: 'Flowmeter principles on treating and cementing lines',
      columns: ['Meter', 'Measures', 'Needs', 'Typical oilfield use'],
      rows: [
        { cells: ['Turbine', 'Volume flow (rotor speed ∝ velocity)', 'Liquid; erosive-service rotors for slurry', 'Frac and cementing rate at 15,000 psi on 1502 unions'], highlight: true },
        { cells: ['Magnetic (electromagnetic)', 'Volume flow (Faraday’s law)', 'Conductive liquid — typically ≥ 5 µS/cm, model dependent', 'Water and water-based fluid on the low-pressure side'] },
        { cells: ['Coriolis', 'Mass flow and density directly, plus temperature', 'Vibrating tube; no straight runs', 'Cement and fluid density, chemical injection'] },
      ],
    },
    {
      type: 'prose',
      html: '<h3>Turbine meters</h3><p>A rotor in the flow turns at a speed proportional to velocity; a magnetic pickup senses each blade and sends a pulse train to the readout. Sensia’s NUFLO 1502 meters, for example, are rated 15,000 psi in 1" to 4" sizes, with tungsten carbide shafts and bearings lubricated by the process liquid, and rotor options for mud, cement slurry and HCl. Their accuracy is quoted by grade — ±1% linearity standard, ±0.5% industrial — so always state which grade a figure refers to. Non-lubricating liquids are limited to the upper part of the flow range, and flushing with clean water after sand slurry extends bearing life. Our 2" turbine flowmeter is Fig 1502 F×M, 15,000 psi, for frac and cementing.</p><h3>Magnetic meters</h3><p>A conductive liquid moving through a magnetic field generates a voltage proportional to its velocity, picked up by electrodes; the reading is unaffected by pressure, temperature or viscosity. The fluid must conduct: Endress+Hauser’s common sensors need at least 5 µS/cm, some models more, so oil and diesel cannot be measured this way. Our 2" wafer magnetic flowmeter is rated 600 psi with 4–20 mA output, with an ATEX Zone 1 variant.</p><h3>Coriolis meters</h3><p>The flow tube is vibrated; the phase shift between sensors gives mass flow and the vibration frequency gives density, with temperature and volume flow derived — all from one meter with no moving parts and no straight-run requirement. Micro Motion’s high-pressure version is rated to 16,401 psi with ±0.10% mass-flow and ±1 kg/m³ density accuracy. Makers promote Coriolis density measurement as a non-radioactive alternative to nuclear densitometers on cementing and blending trucks, removing source licensing, transport and leak-testing. Our 2" Coriolis meter is set up for cementing density control with local and remote display.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Pump strokes, signals and the DAQ.', anchor: 'daq' },
    {
      type: 'prose',
      html: '<p><strong>Magnetic pickup proximity sensors</strong> count passing steel — bolts on a pump shaft, a crankshaft collar, a turbine blade — and output a pulse per passage. On a frac pump they give rpm and stroke count, and with displacement per stroke, a check on rate independent of the flowmeter. Ours is a 5/8-18 UNF mount with an M12 connector.</p><p><strong>4–20 mA loops</strong> carry most analogue signals. A two-wire transmitter draws 4–20 mA from the loop supply (typically 11–28 VDC on Barksdale’s transducers); 4 mA means zero, 20 mA full scale. The “live zero” means a broken wire reads 0 mA and is recognised as a fault rather than as zero pressure. Many systems also follow NAMUR NE 43, which is commonly described as treating signals below about 3.6 mA or above about 21 mA as a failure.</p><p>The <strong>data acquisition system</strong> collects it all. Ours is a multi-channel oilfield DAQ with a 15" touchscreen, taking 4–20 mA, 0–5 V, pulse and frequency inputs and exporting to ASCII or Excel by USB for job reports.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Temperature, power and hazardous areas.', anchor: 'support' },
    {
      type: 'prose',
      html: '<ul><li><strong>Thermowells</strong> keep the thermometer out of the flow and the pressure. Ours is a matched bimetal thermometer and integral SS316 thermowell, 1/2" NPT, stem lengths of 2.5" to 9", rated to 15,000 psi on the process side, with an API 6A P+U temperature range (−20 °F to +250 °F). API 6A’s classes are commonly tabulated as P −20 to 180 °F (−29 to 82 °C) and U 0 to 250 °F (−18 to 121 °C).</li><li><strong>Hazardous areas</strong> — equipment on and near a wellhead sits in a classified zone. Our explosion-proof cast-aluminium electrical panel is ATEX Zone 1 (600 × 800 mm), and our 500 HP AC motor and VFD package for frac and cementing pumpers is in an ATEX Zone 2 enclosure with regenerative braking.</li><li><strong>Instrument power</strong> — a 400 V AC to 24 V DC, 1 kW converter package in a NEMA 4X enclosure feeds 24 V instrument loops from site power.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a 1502 pressure transducer?', answer: 'A pressure transducer with an integral Fig 1502 hammer-union connection, screwed directly onto treating iron, typically 0–15,000 or 20,000 psi with a 4–20 mA output.' },
        { question: 'What does a pressure debooster do?', answer: 'It isolates a gauge from abrasive or corrosive well fluid. Many use a stepped piston that reduces pressure 4:1, with the gauge scaled to read true line pressure; 1:1 gauge protectors isolate without reducing.' },
        { question: 'Can a magnetic flowmeter measure oil?', answer: 'No. Magnetic meters need a conductive liquid — typically at least 5 µS/cm, depending on model — so hydrocarbons such as oil and diesel cannot be measured.' },
        { question: 'What does a Coriolis meter measure?', answer: 'Mass flow and density directly, plus temperature and derived volume flow, from one meter with no moving parts.' },
        { question: 'Why are turbine meters used on frac lines?', answer: 'They measure liquid rate at 15,000 psi on hammer unions, with carbide bearings and rotors available for slurry, cement and acid, and a pulse output for the DAQ.' },
        { question: 'Why 4–20 mA instead of 0–20 mA?', answer: 'Because 4 mA is a live zero: a broken wire reads 0 mA and is recognised as a fault rather than as zero.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Pressure and flow',
      skus: ['IH-EPS-15K-1502M-420', 'IH-APS-1502-DEB-6IN-ADJ', 'IH-TFM-2IN-1502-15K', 'IH-MFM-2IN-WF-600-420', 'IH-NRD-CRL-2IN-CMT', 'IH-PSM-MPU-58UNF-M12'],
    },
    {
      type: 'product_embed',
      heading: 'Data, temperature and power',
      skus: ['IH-DAQ-15IN-MCH-USB', 'IH-TMW-12NPT-PU-SS316', 'IH-EXP-AL-ATX1-600X800', 'IH-VFD-500-AC-ATX2', 'IH-ACDC-400-24-NEMA4X-1K', 'IH-PG-12NPT-BM-6IN-10K'],
    },
    { type: 'category_link', slug: 'instrumentation-controls', label: 'Instrumentation & controls', blurb: 'Sensors, flowmeters, DAQ, thermowells and hazardous-area power.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Treating iron, wellhead and pressure control on one page.' },
    {
      type: 'related_articles',
      slugs: ['flow-iron-explained', 'hammer-union-figure-numbers', 'pressure-gauge-guide', 'how-to-choose-a-pressure-gauge-range'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Instrument principles and example ratings from Barksdale, Honeywell, Sensia, Endress+Hauser and Micro Motion documents; debooster ratio, NE 43 levels and API 6A classes from maker excerpts and secondary reproductions, stated as commonly published; our instruments from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Equipping a treating line or unit?',
      body: 'Send the line size, pressure rating, fluids and what you need recorded. We will quote transducers, deboosters, meters, DAQ and the hammer-union connections as one package.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
