/**
 * The seed hydraulic parts of 2026-05-01, rebuilt from the makers' published
 * data. The seed gave them invented figures (a 315 bar BG-03, a "30MPa"
 * MBR-01 that is a brake valve, a "dual solenoid" 2B valve, warranty and
 * efficiency rows nobody publishes) and, on the KHB ball valve, a brand the
 * product does not carry. Each value below is the maker's; where the maker
 * publishes in kgf/cm², the bar figure in the template field is the
 * conversion (1 kgf/cm² = 0.980665 bar).
 *
 * Not rebuilt — no maker publishes them, so there is nothing to rebuild from;
 * they stay held, for Ayush to decide:
 *   IH-FLCB-LAN-3C4-D24 — no "FLCB" valve exists; "3C4-D24" is Yuken's DSG code.
 *   IH-WC-120-80-600    — no Parker welded series has a 120 mm bore.
 *   IH-CYL-80-50-300    — Rexroth's CDT3 80 mm bore takes 36, 45 or 56 mm rods.
 *   IH-PP-11KW-30-DS    — no Rexroth standard power unit matches; DSG-01 is Yuken.
 */
import type { Entry, Faq, Spec } from './types'

const YUKEN_DSG_50 =
  'Yuken India catalogue EIC-E-1001-1, DSG-01 solenoid operated directional valves (design 50)'
const YUKEN_DSG_70 = 'Yuken Kogyo instruction manual JM-0448, DSG-01 (design 70)'
const YUKEN_BG_JP =
  'Yuken Kogyo instruction manual JM-0201, BT/BG pilot operated relief valves (design 32)'
const YUKEN_BG_IN = 'Yuken India catalogue EIC-C-1002-1, pilot operated relief valves'
const YUKEN_MOD = 'Yuken India catalogue EIC-F-1001-0, 01 series modular valves'
const HYDAC_KHB = 'HYDAC data sheet 5.501.27/11.23, KHB/KHM ball valves'

const p = (s: string) => `<p>${s}</p>`
const h3 = (s: string) => `<h3>${s}</h3>`
const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
const spec = (group: string, label: string, value: string, unit?: string, key?: string): Spec => ({
  group,
  label,
  value,
  ...(unit ? { unit } : {}),
  ...(key ? { key } : {}),
})

// ── Yuken DSG-01 ────────────────────────────────────────────────────────────

const dsgDesignFaq: Faq = {
  question: 'Design 50 or design 70?',
  answer:
    "Both fit the same ISO 4401-03 mounting surface. Design 50, in Yuken India's catalogue, is rated 315 kgf/cm² (about 31 MPa) and 63 L/min. Yuken Japan's current design 70 is rated 35 MPa and 100 L/min, with a different outline. Tell us which you need, or send the nameplate of the valve you are replacing.",
}
const dsgSubplateFaq: Faq = {
  question: 'Which sub-plate does it take?',
  answer:
    "Yuken's design-50 sub-plates are DSGM-01-3080 (1/8 BSP), DSGM-01X-3080 (1/4 BSP) and DSGM-01Y-3080 (3/8 BSP). The valve can also sit on top of a stack of Yuken 01-series modular valves.",
}
const dsgCreepFaq: Faq = {
  question: 'Will it hold a cylinder in position?',
  answer:
    'Not on its own. It is a spool valve, and Yuken notes that spool valves leak internally, so an actuator held only by this valve can creep. Where a load must hold position, add a pilot-operated check or a counterbalance valve.',
}
const dsgSpecs = (o: { code: string; fn: string; spool: string; weight: string }): Spec[] => [
  spec('Performance', 'Function', o.fn, undefined, 'valve_function'),
  spec('Performance', 'Flow rate (max)', '63', 'L/min', 'flow_rate_max'),
  spec('Performance', 'Pressure (max)', '309', 'bar', 'pressure_max'),
  spec('Mechanical', 'CETOP size', 'CETOP 3 (ISO 4401-03)', undefined, 'cetop_size'),
  spec('Electrical', 'Coil voltage', '24 V DC', undefined, 'voltage'),
  spec('Electrical', 'Coil power', '26', 'W', 'coil_power'),
  spec('Mechanical', 'Weight', o.weight, 'kg', 'weight'),
  spec('Identification', 'Model code', o.code),
  spec('Performance', 'Spool', o.spool),
  spec('Performance', 'Max operating pressure (as published)', '315 kgf/cm² (design 50)'),
  spec('Performance', 'Max tank-line back pressure', '160 kgf/cm² (design 50)'),
  spec('Performance', 'Max changeover frequency', '300 cycles/min (DC coil)'),
  spec('Electrical', 'Protection', 'IP65 equivalent'),
]

const DSG_3C4: Entry = {
  sku: 'IH-DSG-01-3C4-D24',
  was: 'Yuken DSG-01 Solenoid Directional Valve 3C4 24VDC',
  title: 'Yuken DSG-01-3C4-D24-50 Solenoid Directional Valve, 4/3 Spring-Centred, 24 V DC',
  seoTitle: 'Yuken DSG-01-3C4-D24-50 Solenoid Valve, CETOP 3',
  seoDescription:
    'Yuken DSG-01-3C4-D24-50: 4/3 spring-centred solenoid valve, ISO 4401-03, 24 V DC 26 W, 315 kgf/cm², 63 L/min (design 50). Request a quote.',
  focusKeyword: 'yuken dsg-01-3c4-d24',
  mpn: 'DSG-01-3C4-D24-50',
  descriptionShort:
    'Yuken DSG-01-3C4-D24-50: a 4/3 spring-centred, double-solenoid directional valve on the ISO 4401-03 (CETOP 3) interface, with a 24 V DC, 26 W coil. Design 50 is rated 315 kgf/cm² and 63 L/min.',
  descriptionLong: [
    p(
      'The Yuken DSG-01-3C4-D24-50 is a solenoid-operated directional valve for sub-plate mounting on the ISO 4401-03 interface, the size sold as CETOP 3 or NG6. Two solenoids shift the spool to start, stop and reverse a cylinder or motor, and springs return it to the centre when both are off.'
    ),
    h3('The model code'),
    ul([
      '<strong>DSG</strong> — solenoid-operated directional valve, sub-plate mounted',
      '<strong>01</strong> — size 01, ISO 4401-03 mounting surface',
      '<strong>3C</strong> — three positions, spring centred, two solenoids',
      '<strong>4</strong> — spool type 4',
      '<strong>D24</strong> — 24 V DC coil, usable from 21.6 to 26.4 V',
      '<strong>50</strong> — design number',
    ]),
    p(
      "With no letter after the coil code the valve has a terminal box and a push-pin manual override; N or N1 in that place gives a DIN connector, N1 with an indicator lamp. In the centre position Yuken's flow tables give spool 4 no path from P to T, so the valve does not unload the pump; Yuken's centre-bypass spools are 5 and 60."
    ),
    h3('Ratings (design 50)'),
    ul([
      'Maximum operating pressure: 315 kgf/cm² (about 31 MPa)',
      'Maximum flow: 63 L/min. With a DC coil, spool 3C4 passes 63 L/min up to 250 kgf/cm² and 35 L/min at 315 kgf/cm².',
      'Maximum tank-line back pressure: 160 kgf/cm²',
      'Maximum changeover frequency: 300 cycles per minute',
      'Coil: 24 V DC, 1.1 A, 26 W; protection equivalent to IP65',
      'Mass: 2.2 kg',
    ]),
    h3('Design 50 and design 70'),
    p(
      'Yuken India builds the DSG-01 to design 50. Yuken in Japan has moved to design 70, which bolts to the same mounting surface but has a different outline and higher ratings: 35 MPa, 100 L/min, a 29 W coil and 1.85 kg. Say which you need, or send the nameplate of the valve you are replacing.'
    ),
    h3('Installing it'),
    p(
      "The solenoids are wet-pin: the core tube fills with oil, which damps shock and noise, so the tank port must stay full of oil and must not see surge pressure. Four M5 × 45 socket-head screws hold it down. Yuken's manual gives a working oil viscosity of 15–400 mm²/s and an oil temperature of −15 to +70 °C."
    ),
    h3('Ordering'),
    p(
      'Give the full model code, the design number and the coil voltage on your RFQ, with the sub-plate if you need one. We supply new valves and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'What does DSG-01-3C4-D24-50 mean?',
      answer:
        'A Yuken solenoid-operated directional valve (DSG), size 01 for the ISO 4401-03 interface, with three positions, spring centring and two solenoids (3C), spool type 4, a 24 V DC coil (D24) and design number 50.',
    },
    {
      question: 'What does spool 4 do in the centre position?',
      answer:
        "Yuken's flow tables give spool 4 no path from P to T in the centre, so the valve does not unload the pump when both solenoids are off. Yuken's centre-bypass spools, which do, are 5 and 60.",
    },
    {
      question: 'How much flow and pressure can it take?',
      answer:
        'Design 50 is rated 315 kgf/cm² (about 31 MPa) and 63 L/min. With a DC coil, spool 3C4 passes 63 L/min up to 250 kgf/cm², falling to 35 L/min at 315 kgf/cm².',
    },
    dsgDesignFaq,
    dsgCreepFaq,
    dsgSubplateFaq,
  ],
  specs: dsgSpecs({
    code: 'DSG-01-3C4-D24-50',
    fn: '4/3 directional, spring centred, double solenoid',
    spool: '3C4 — no P-to-T path in centre',
    weight: '2.2',
  }),
  sources: [YUKEN_DSG_50, YUKEN_DSG_70],
}

const DSG_2B2: Entry = {
  sku: 'IH-DSG-01-2B2-D24',
  was: 'Yuken DSG-01 Solenoid Directional Valve 2B2 24VDC',
  title: 'Yuken DSG-01-2B2-D24-50 Solenoid Directional Valve, 4/2 Spring-Offset, 24 V DC',
  seoTitle: 'Yuken DSG-01-2B2-D24-50 Solenoid Valve, CETOP 3',
  seoDescription:
    'Yuken DSG-01-2B2-D24-50: 4/2 spring-offset, single-solenoid valve, ISO 4401-03, 24 V DC 26 W, 315 kgf/cm², 63 L/min (design 50). Request a quote.',
  focusKeyword: 'yuken dsg-01-2b2-d24',
  mpn: 'DSG-01-2B2-D24-50',
  descriptionShort:
    'Yuken DSG-01-2B2-D24-50: a 4/2 spring-offset directional valve with a single 24 V DC solenoid on the b side, for the ISO 4401-03 (CETOP 3) interface. Design 50 is rated 315 kgf/cm² and 63 L/min.',
  descriptionLong: [
    p(
      'The Yuken DSG-01-2B2-D24-50 is a two-position, spring-offset directional valve for sub-plate mounting on the ISO 4401-03 interface (CETOP 3, NG6). One solenoid shifts the spool; when it is switched off, the spring returns the spool to its offset position.'
    ),
    h3('The model code'),
    ul([
      '<strong>DSG</strong> — solenoid-operated directional valve, sub-plate mounted',
      '<strong>01</strong> — size 01, ISO 4401-03 mounting surface',
      '<strong>2B</strong> — two positions, spring offset, one solenoid, on the b side as standard',
      '<strong>2</strong> — spool type 2',
      '<strong>D24</strong> — 24 V DC coil',
      '<strong>50</strong> — design number',
    ]),
    p(
      "In Yuken's vent-type table a DSG-01-2B2 connects P to port A when de-energised and P to port B when solenoid b is energised. An L suffix moves the solenoid to the a side. Yuken also uses the 2B2 as the pilot valve on its BSG solenoid-controlled relief valves, to switch between pressure settings."
    ),
    h3('Ratings (design 50)'),
    ul([
      'Maximum operating pressure: 315 kgf/cm² (about 31 MPa)',
      'Maximum flow: 63 L/min. With a DC coil, spool 2B2 passes 63 L/min four-way from 50 to 315 kgf/cm².',
      'Maximum tank-line back pressure: 160 kgf/cm²',
      'Coil: 24 V DC, 1.1 A, 26 W',
      'Mass: 1.6 kg',
    ]),
    h3('Design 50 and design 70'),
    p(
      'Yuken India builds the DSG-01 to design 50; Yuken in Japan has moved to design 70, which fits the same mounting surface with a different outline and is rated 35 MPa and 100 L/min, with a 29 W coil and a mass of 1.4 kg. Say which you need, or send the nameplate of the valve you are replacing.'
    ),
    h3('Ordering'),
    p(
      'Give the full model code, the design number, the coil voltage and the solenoid side (L for the a side) on your RFQ. We supply new valves and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'What does DSG-01-2B2-D24-50 mean?',
      answer:
        'A Yuken solenoid-operated directional valve (DSG), size 01 for the ISO 4401-03 interface, with two positions and spring offset (2B), spool type 2, a 24 V DC coil (D24) and design number 50.',
    },
    {
      question: 'Single or double solenoid?',
      answer:
        'Single. A 2B valve is spring offset with one solenoid, on the b side as standard; order it with the L suffix to put the solenoid on the a side.',
    },
    {
      question: 'Which way does the oil go?',
      answer:
        "Yuken's vent-type table shows P connected to port A with the solenoid off, and P to port B with solenoid b energised.",
    },
    dsgDesignFaq,
    dsgCreepFaq,
    dsgSubplateFaq,
  ],
  specs: dsgSpecs({
    code: 'DSG-01-2B2-D24-50',
    fn: '4/2 directional, spring offset, single solenoid (b side)',
    spool: '2B2 — P to A off, P to B with solenoid b on',
    weight: '1.6',
  }),
  sources: [YUKEN_DSG_50, YUKEN_DSG_70, YUKEN_BG_IN],
}

// ── Yuken BG-03 relief valve ────────────────────────────────────────────────

const BG_03: Entry = {
  sku: 'IH-BG-03-315',
  was: 'Yuken BG-03 Pressure Relief Valve 315 bar',
  title: 'Yuken BG-03 Pilot Operated Relief Valve, up to 25 MPa, 100 L/min',
  seoTitle: 'Yuken BG-03 Pilot Operated Relief Valve',
  seoDescription:
    'Yuken BG-03-32 pilot operated relief valve: sub-plate mounting (ISO 6264), up to 25 MPa, 100 L/min, vent port for remote control. Request a quote.',
  focusKeyword: 'yuken bg-03 relief valve',
  mpn: 'BG-03-32',
  descriptionShort:
    'Yuken BG-03 pilot operated relief valve for sub-plate mounting on the ISO 6264 interface: settable up to 25 MPa (250 bar), 100 L/min, with a vent port for remote setting or pump unloading. Model code BG-03-32.',
  descriptionLong: [
    p(
      'The Yuken BG-03 is a pilot operated relief valve for sub-plate mounting. It protects pumps and control valves from excess pressure and holds system pressure at its setting. Through its vent port it can also be set remotely, or used to unload the pump.'
    ),
    h3('The model code'),
    ul([
      '<strong>B</strong> — pilot operated relief valve',
      '<strong>G</strong> — sub-plate (gasket) mounting; T would be a threaded body',
      '<strong>03</strong> — size 03',
      '<strong>32</strong> — design number',
    ]),
    p(
      'The code carries no pressure field: one valve covers the full range. Add V before the design number (BG-03-V-32) for the high-vent type, which switches back from unloading to load faster, at the cost of higher minimum and vent pressures. An F- prefix is for phosphate-ester fluid.'
    ),
    h3('Ratings'),
    ul([
      'Maximum operating pressure: 25 MPa (250 bar)',
      'Maximum flow: 100 L/min; at least 8 L/min for a stable setting',
      'Pressure change: about 5 MPa per turn of the handle',
      'Mounting surface: ISO 6264-AR-06-2-A',
      'Mass: 4.7 kg',
      'Oil: 15–400 mm²/s, −15 to +70 °C',
    ]),
    h3('Sub-plates and installation'),
    p(
      "Yuken's sub-plates are BGM-03 (3/8 BSP) and BGM-03X (1/2 BSP); the valve is held by two M12 × 70 and two M12 × 95 bolts. Collars under the adjusting handle cap the settable pressure, about 10 MPa each, so remove one if the setting you need cannot be reached. Run the tank line straight to the reservoir rather than into other valves' tank lines, or the setting becomes unstable."
    ),
    h3('Ordering'),
    p(
      'Quote BG-03-32, or BG-03-V-32 for the high-vent type, with the sub-plate if you need one. We supply new valves and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'What does BG-03-32 mean?',
      answer:
        'A Yuken pilot operated relief valve (B) for sub-plate mounting (G), size 03, design number 32. The code has no pressure field: one valve covers the full range, up to 25 MPa.',
    },
    {
      question: 'What pressure can it be set to?',
      answer:
        'Up to 25 MPa (250 bar). Each turn of the handle changes the setting by about 5 MPa. Collars under the handle cap the setting, about 10 MPa each; remove one if you cannot reach the pressure you need.',
    },
    {
      question: 'What is the vent port for?',
      answer:
        'Connecting a remote relief valve to set the pressure from elsewhere, or venting it to tank to unload the pump. The high-vent type (BG-03-V-32) switches back from unloading to load faster.',
    },
    {
      question: 'How much flow does it take?',
      answer:
        'Up to 100 L/min. Yuken asks for at least 8 L/min through the valve for a stable setting.',
    },
    {
      question: 'Which sub-plate does it take?',
      answer:
        "Yuken's BGM-03 (3/8 BSP) or BGM-03X (1/2 BSP). The mounting surface is ISO 6264-AR-06-2-A, the relief-valve interface, not a CETOP directional-valve pattern.",
    },
  ],
  specs: [
    spec(
      'Performance',
      'Function',
      'Pilot operated relief valve, sub-plate mounted',
      undefined,
      'valve_function'
    ),
    spec('Performance', 'Flow rate (max)', '100', 'L/min', 'flow_rate_max'),
    spec('Performance', 'Pressure (max)', '250', 'bar', 'pressure_max'),
    spec('Mechanical', 'Weight', '4.7', 'kg', 'weight'),
    spec('Identification', 'Model code', 'BG-03-32 (BG-03-V-32 high-vent)'),
    spec('Mechanical', 'Mounting surface', 'ISO 6264-AR-06-2-A'),
    spec('Performance', 'Minimum flow', '8 L/min for a stable setting'),
    spec('Performance', 'Pressure change per turn', 'About 5 MPa'),
    spec('Mechanical', 'Sub-plates', 'BGM-03 (3/8 BSP), BGM-03X (1/2 BSP)'),
  ],
  sources: [YUKEN_BG_JP, YUKEN_BG_IN],
}

// ── Yuken MBR-01 brake modular valve ────────────────────────────────────────

const MBR_01: Entry = {
  sku: 'IH-MBR-01-30',
  was: 'Yuken MBR-01 Pressure Reducing Valve 30MPa',
  title: 'Yuken MBR-01 Brake Modular Valve, 01 Series (CETOP 3)',
  slug: 'yuken-mbr-01-brake-modular-valve',
  seoTitle: 'Yuken MBR-01 Brake Modular Valve, CETOP 3',
  seoDescription:
    'Yuken MBR-01 brake modular valve for 01-series (ISO 4401-03) stacks: 250 kgf/cm², 35 L/min, ranges C and H. Order MBR-01-C-30 or -H-30.',
  focusKeyword: 'yuken mbr-01',
  mpn: null,
  descriptionShort:
    'Yuken MBR-01 brake modular valve: a sandwich module for 01-series stacks on the ISO 4401-03 (CETOP 3) interface, rated 250 kgf/cm² and 35 L/min, in adjustment ranges C or H. Not a reducing valve.',
  descriptionLong: [
    p(
      "The Yuken MBR-01 is a brake valve in Yuken's 01-series modular valve range. It is a sandwich module that stacks between the sub-plate or manifold and a DSG-01 solenoid valve on the ISO 4401-03 interface (CETOP 3, NG6), and brakes the actuator the stack controls."
    ),
    p(
      "It is not a pressure reducing valve, as this page used to say: Yuken's reducing modules are the MRP-01, MRA-01 and MRB-01, acting on the P, A or B line. And the -30 in its code is the design number, not a pressure."
    ),
    h3('Ratings'),
    ul([
      'Maximum operating pressure: 250 kgf/cm² (about 24.5 MPa)',
      'Maximum flow: 35 L/min',
      'Adjustment range C: minimum to 140 kgf/cm²',
      'Adjustment range H: 70 to 210 kgf/cm²',
      'Mass: 1.3 kg',
    ]),
    h3('Setting it'),
    p(
      'Load pressure and back pressure both push the brake valve open. Set below their sum, it slows the actuator in normal running; set too high, braking causes shock. Its minimum setting rises with tank-line back pressure, so add the tank-line pressure drops of every valve in the stack — and mind its position relative to meter-out throttle-check modules.'
    ),
    h3('Stacking'),
    p(
      'A Yuken 01-series stack can be one to five units high, counting the solenoid valve. Stud-bolt kits are MBK-01-*-30 and the seal kit is KS-MBR-01-30. The valve runs on mineral oil, phosphate ester (with the F- prefix), polyol ester or water-glycol, at 15–400 mm²/s and −15 to +70 °C, with fluid kept to NAS 1638 class 12 through a 20 µm filter.'
    ),
    h3('Ordering'),
    p(
      'Order MBR-01-C-30 or MBR-01-H-30, by the adjustment range you need, with the stud-bolt kit for your stack height. We supply new valves and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'What does an MBR-01 do?',
      answer:
        'It brakes the actuator a Yuken 01-series stack controls. It is a sandwich module that fits between the sub-plate or manifold and a DSG-01 solenoid valve, and Yuken lists it among its pressure-control modules as a brake valve.',
    },
    {
      question: 'Is it a pressure reducing valve?',
      answer:
        "No. Yuken's reducing modules are the MRP-01, MRA-01 and MRB-01, for the P, A or B line. The -30 in MBR-01's code is the design number, not 30 MPa.",
    },
    {
      question: 'Which adjustment range do I need?',
      answer:
        'Range C sets from the minimum to 140 kgf/cm²; range H from 70 to 210 kgf/cm². Order MBR-01-C-30 or MBR-01-H-30. The valve is rated 250 kgf/cm² and 35 L/min.',
    },
    {
      question: 'How should it be set?',
      answer:
        'Above the sum of load pressure and back pressure, which both push it open, or it will slow the actuator in normal running — but not so high that braking causes shock. Count the tank-line pressure drops of the whole stack, because they raise its minimum setting.',
    },
    {
      question: 'Where does it go in the stack?',
      answer:
        'Between the sub-plate or manifold and the DSG-01, in a stack of up to five units. Its order relative to meter-out throttle-check modules matters, because back pressure acts on it. Use stud-bolt kit MBK-01-*-30 for the stack height.',
    },
  ],
  specs: [
    spec('Performance', 'Function', 'Brake valve, modular (sandwich)', undefined, 'valve_function'),
    spec('Performance', 'Flow rate (max)', '35', 'L/min', 'flow_rate_max'),
    spec('Performance', 'Pressure (max)', '245', 'bar', 'pressure_max'),
    spec('Mechanical', 'CETOP size', 'CETOP 3 (ISO 4401-AB-03-4-A)', undefined, 'cetop_size'),
    spec('Mechanical', 'Weight', '1.3', 'kg', 'weight'),
    spec('Identification', 'Model code', 'MBR-01-C-30 or MBR-01-H-30'),
    spec('Performance', 'Max operating pressure (as published)', '250 kgf/cm²'),
    spec('Performance', 'Adjustment ranges', 'C: minimum–140 kgf/cm²; H: 70–210 kgf/cm²'),
    spec('Mechanical', 'Seal kit', 'KS-MBR-01-30'),
  ],
  sources: [YUKEN_MOD],
}

// ── KHB-G1/2 block ball valve ───────────────────────────────────────────────

const KHB: Entry = {
  sku: 'IH-KHB-G12-14-2X-S',
  was: 'Bosch Rexroth KHB Ball Valve 1/2" G',
  title: 'KHB-G1/2 High-Pressure Block Ball Valve, PN 500, DN13',
  slug: 'khb-g1-2-high-pressure-ball-valve',
  brand: null,
  seoTitle: 'KHB-G1/2 High-Pressure Ball Valve, PN 500',
  seoDescription:
    'KHB-G1/2 block-type high-pressure ball valve: G 1/2 BSPP, DN13, PN 500 bar in steel. Genuine HYDAC or KHB pattern to the same rating. Request a quote.',
  focusKeyword: 'khb-g1/2 ball valve',
  mpn: null,
  descriptionShort:
    'KHB-G1/2 block-type high-pressure ball valve with G 1/2 BSPP ports: DN13 bore, rated PN 500 bar in steel, with a steel ball, POM sealing cups and NBR seals as standard. Genuine HYDAC or KHB pattern.',
  descriptionLong: [
    p(
      "A KHB-G1/2 block-type ball valve for high-pressure hydraulic lines, with G 1/2 BSPP (ISO 228) female ports. KHB is HYDAC's designation for its block ball valves from DN 4 to DN 25, and valves to the same pattern are made by others. We supply genuine HYDAC or a KHB-pattern valve to the same rating — say which on the RFQ."
    ),
    p(
      'A ball is the shut-off element, turned by the lever through a quarter turn. The valve can be fitted in any orientation and flow can run either way. This listing previously named Bosch Rexroth; the KHB range and its published data are HYDAC’s.'
    ),
    h3('Two G 1/2 bores'),
    ul([
      '<strong>DN13</strong> (12 mm bore): PN 500 bar in steel or stainless steel; 0.59 kg and 84 mm long in steel',
      '<strong>DN16</strong> (15 mm bore): PN 420 bar in steel, 400 bar in stainless; 0.70 kg and 83 mm long in steel',
    ]),
    p('This listing is the DN13, PN 500 version; the DN16 is supplied to order.'),
    h3('Materials'),
    p(
      "HYDAC's order code gives four material digits: housing, ball and spindle, ball sealing cups, and spindle and connection seals. 1112 is the standard build — steel housing, steel ball and spindle, POM sealing cups, NBR seals. The options are:"
    ),
    ul([
      'Housing: steel, zinc plated (standard) or zinc-nickel; or stainless steel',
      'Ball and spindle: steel, stainless steel or hardened steel',
      'Sealing cups: POM, PTFE, PEEK or steel',
      'Seals: NBR, PTFE or FKM',
    ]),
    p('PTFE seals or cups limit the valve to 100 bar.'),
    h3('Service'),
    p(
      'Mineral oil to DIN 51524 parts 1 and 2, with fluid and ambient temperatures from −10 to +80 °C (−40 °C with the TT option, stainless only). Options include an actuator, limit switches, a lock and, as SO940, four fixing holes for panel mounting. The seal kit for the DN13 is HYDAC 703 046.'
    ),
    h3('Ordering'),
    p(
      'Give the bore (DN13 or DN16), materials, seals and any options on your RFQ, and say whether you need genuine HYDAC. Bosch Rexroth also lists a KHB G 1/2 valve as material no. R901082383; quote that number if your drawing calls for it.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'Who makes the KHB ball valve?',
      answer:
        'KHB is HYDAC’s designation for its block-type ball valves, DN 4 to DN 25, and other makers build to the same pattern. We supply genuine HYDAC or a KHB-pattern valve to the same rating, as you specify.',
    },
    {
      question: 'Is it rated 500 bar?',
      answer:
        'The DN13 (12 mm bore) G 1/2 valve is rated PN 500 bar in steel or stainless. The larger DN16 G 1/2 is 420 bar in steel and 400 bar in stainless, and any version with PTFE seals or sealing cups is limited to 100 bar.',
    },
    {
      question: 'What thread are the ports?',
      answer: 'G 1/2 female, the BSPP thread to ISO 228.',
    },
    {
      question: 'Which materials are standard?',
      answer:
        'Code 1112: steel housing, steel ball and spindle, POM sealing cups and NBR seals. Stainless steel, hardened steel, PTFE, PEEK and FKM options are available to order.',
    },
    {
      question: 'Can it be fitted either way round?',
      answer: 'Yes. It can be installed in any orientation and flow can run in either direction.',
    },
  ],
  specs: [
    spec('Identification', 'Product type', 'High-pressure ball valve, block type'),
    spec('Identification', 'Pattern', 'HYDAC KHB'),
    spec('Mechanical', 'Ports', 'G 1/2 female (BSPP, ISO 228)'),
    spec('Mechanical', 'Nominal size', 'DN13 (12 mm bore)'),
    spec('Performance', 'Nominal pressure', 'PN 500 bar (steel, DN13)'),
    spec('Mechanical', 'Housing', 'Steel, zinc plated; stainless to order'),
    spec('Mechanical', 'Ball and spindle', 'Steel; stainless or hardened steel to order'),
    spec(
      'Mechanical',
      'Seals',
      'POM sealing cups, NBR seals; PTFE (100 bar max), PEEK, FKM to order'
    ),
    spec('Performance', 'Temperature', '−10 to +80 °C'),
    spec('Mechanical', 'Weight', '0.59 kg (steel)'),
  ],
  sources: [HYDAC_KHB, 'Bosch Rexroth product page R901082383 (KHB-G1/2-1212-14X-SO760)'],
}

// ── Bosch Rexroth A10VSO series 31 ──────────────────────────────────────────

const RE92711 = 'Bosch Rexroth data sheet RE 92711 (A10VSO series 31), editions 2016, 2021 and 2026'

type A10 = {
  sku: string
  was: string
  size: number
  speed: number
  speedReduced: number
  speedH: number
  flowMax: number
  flow1500: number
  powerMax: number
  power1500: number
  torque: number
  weight: string
  weightTd: string
  pilot: string
  ports: string
  shafts: string
  throughDrive: string
  example: string | null
}

function a10(o: A10): Entry {
  const code = `A10VSO ${o.size}`
  return {
    sku: o.sku,
    was: o.was,
    title: `Bosch Rexroth A10VSO ${o.size} Variable Axial Piston Pump, ${o.size} cm³/rev`,
    seoTitle: `Rexroth A10VSO ${o.size} Axial Piston Pump, ${o.size} cm³`,
    seoDescription: `Bosch Rexroth A10VSO ${o.size} series 31 variable axial piston pump: ${o.size} cm³/rev, 280 bar nominal, 350 bar max, ${o.speed} rpm, open circuit. Request a quote.`,
    focusKeyword: `rexroth a10vso ${o.size}`,
    mpn: null,
    descriptionShort: `Bosch Rexroth A10VSO ${o.size} series 31: a variable-displacement swashplate axial piston pump for open circuits, ${o.size} cm³/rev, rated 280 bar nominal and 350 bar maximum, up to ${o.speed} rpm at full displacement.`,
    descriptionLong: [
      p(
        `The Bosch Rexroth ${code} is a variable-displacement axial piston pump of swashplate design for hydrostatic drives in an open circuit. Its flow is proportional to drive speed and displacement, and the displacement changes steplessly with the swashplate angle. Rexroth positions series 31 as its all-purpose medium-pressure pump, in sizes 18 to 100, with good suction behaviour, low noise, long life and short control times.`
      ),
      h3(`Ratings, size ${o.size}`),
      ul([
        `Displacement: ${o.size} cm³/rev`,
        'Pressure: 280 bar nominal, 350 bar maximum',
        `Speed: ${o.speed} rpm at full displacement; ${o.speedReduced} rpm only at reduced displacement with raised inlet pressure; ${o.speedH} rpm for the high-speed H version`,
        `Flow (theoretical): ${o.flowMax} L/min at ${o.speed} rpm, ${o.flow1500} L/min at 1500 rpm`,
        `Power (theoretical, 280 bar): ${o.powerMax} kW at ${o.speed} rpm, ${o.power1500} kW at 1500 rpm`,
        `Torque at 280 bar: ${o.torque} Nm`,
        `Weight: about ${o.weight} kg, or ${o.weightTd} kg with a through drive`,
      ]),
      h3('The type code'),
      p(
        `A full Rexroth type code reads like ${o.example ?? `A10VSO ${o.size} DR/31R-VPA…`}: A10VS for the swashplate unit, O for open circuit, ${o.size} for the size, then the control, series 31, the direction of rotation (R clockwise, L counter-clockwise), the seals (V for FKM, the standard), the drive shaft, the mounting flange, the port plate and the through drive.${o.example ? ` That one is a common build with a DR pressure controller and no through drive.` : ''} Quote the full code from your pump's nameplate so we supply the same configuration.`
      ),
      ul([
        'Controls: DG, DR, DFR, DFR1, DRG, ED72, ER72 and DFLR',
        `Mounting: ISO 3019-2 two-hole flange, Ø${o.pilot} mm pilot`,
        `Drive shafts: ${o.shafts}`,
        `Ports: ${o.ports}`,
        `Through drives: ${o.throughDrive}`,
      ]),
      h3('Pressure control'),
      p(
        'With the DR pressure controller the pump runs at full displacement until the set pressure, adjustable from 50 to 280 bar, is reached; it then swivels back and supplies only the flow the circuit takes. Rexroth still calls for a separate relief valve, because pressure control is not overload protection. A through drive can carry a second pump of up to the same size on the same drive.'
      ),
      h3('Fluid and installation'),
      p(
        'HLP mineral oil to DIN 51524-2; HFA, HFB and HFC fluids need the E version. Operating viscosity 10–400 mm²/s, optimum 16–36 mm²/s, and up to +110 °C at the drain port with FKM seals. Filter to at least ISO 4406 20/18/15. The case drain must run to the reservoir, with case pressure no more than 2 bar absolute; inlet pressure must stay above 0.8 bar absolute.'
      ),
      h3('Ordering'),
      p(
        'Send the full type code or the Rexroth material number from the nameplate. We supply new pumps and confirm lead time on the quotation.'
      ),
    ].join(''),
    faqs: [
      {
        question: 'What does the A10VSO type code mean?',
        answer: `A10VS is Rexroth's variable swashplate axial piston unit and O means open circuit; ${o.size} is the size in cm³/rev. Then come the control (for example DR), series 31, rotation (R or L), seals (V for FKM), shaft, flange, port plate and through drive. Quote the full code from the nameplate.`,
      },
      {
        question: 'How fast can it run?',
        answer: `${o.speed} rpm at full displacement. Rexroth allows ${o.speedReduced} rpm only at reduced displacement with raised inlet pressure, and the high-speed H version runs to ${o.speedH} rpm.`,
      },
      {
        question: 'What flow does it deliver?',
        answer: `Theoretically ${o.flow1500} L/min at 1500 rpm and ${o.flowMax} L/min at ${o.speed} rpm, at full displacement and before efficiency losses.`,
      },
      {
        question: 'What does the DR controller do?',
        answer:
          'It holds the pump at full displacement until the set pressure (50 to 280 bar) is reached, then reduces displacement so the pump delivers only the flow the circuit takes. It is not overload protection: Rexroth requires a separate relief valve.',
      },
      {
        question: 'Can it drive a second pump?',
        answer:
          'Yes, with a through drive: a second gear or axial piston pump of up to the same size can be mounted on it. The through drive is part of the type code.',
      },
      {
        question: 'Which fluid and filtration does it need?',
        answer:
          'HLP mineral oil to DIN 51524-2, filtered to at least ISO 4406 20/18/15. With FKM seals it runs up to +110 °C at the drain port. Fire-resistant HFA, HFB and HFC fluids need the E version.',
      },
    ],
    specs: [
      spec('Hydraulic', 'Displacement', String(o.size), 'cm³/rev', 'displacement'),
      spec('Hydraulic', 'Pressure (peak)', '350', 'bar', 'pressure_peak'),
      spec('Hydraulic', 'Speed (max)', String(o.speed), 'rpm', 'speed_max'),
      spec(
        'Hydraulic',
        'Pump type',
        'Axial piston, swashplate, variable, open circuit',
        undefined,
        'pump_type'
      ),
      spec(
        'Mechanical',
        'Mounting',
        `ISO 3019-2 two-hole flange, Ø${o.pilot} mm pilot`,
        undefined,
        'mounting'
      ),
      spec(
        'Mechanical',
        'Rotation',
        'Clockwise (R); counter-clockwise (L) to order',
        undefined,
        'rotation'
      ),
      spec('Mechanical', 'Weight', o.weight, 'kg', 'weight'),
      spec('Hydraulic', 'Nominal pressure', '280', 'bar'),
      spec('Hydraulic', 'Flow at 1500 rpm (theoretical)', String(o.flow1500), 'L/min'),
      spec('Hydraulic', 'Controls available', 'DG, DR, DFR, DFR1, DRG, ED72, ER72, DFLR'),
      spec('Mechanical', 'Weight with through drive', o.weightTd, 'kg'),
      spec('Hydraulic', 'Fluid', 'HLP mineral oil (DIN 51524-2); up to +110 °C with FKM seals'),
    ],
    sources: [
      RE92711,
      ...(o.example ? ['Bosch Rexroth product page R910916629 (A10VSO 45 DR/31R-VPA12N00)'] : []),
    ],
  }
}

const A10_45 = a10({
  sku: 'IH-AP45-D-R-V',
  was: 'Bosch Rexroth A10VSO 45cc Axial Piston Pump',
  size: 45,
  speed: 2600,
  speedReduced: 3100,
  speedH: 3000,
  flowMax: 117,
  flow1500: 68,
  powerMax: 55,
  power1500: 32,
  torque: 200,
  weight: '23.5',
  weightTd: '25.1',
  pilot: '100',
  ports: 'SAE flange ports to ISO 6162-1 with metric threads — pressure 1 in, suction 1 1/2 in',
  shafts: 'S or R, 1 in 15T 16/32DP splined; P, Ø25 mm keyed',
  throughDrive: 'none (N00), or K01, K52, K68, K04, KB2, KB3, KB4, K57',
  example: 'A10VSO 45 DR/31R-VPA12N00 (Rexroth material no. R910916629)',
})

const A10_71 = a10({
  sku: 'IH-AP71-D-R-V',
  was: 'Bosch Rexroth A10VSO 71cc Axial Piston Pump',
  size: 71,
  speed: 2200,
  speedReduced: 2600,
  speedH: 2550,
  flowMax: 156,
  flow1500: 107,
  powerMax: 73,
  power1500: 50,
  torque: 316,
  weight: '35.2',
  weightTd: '38',
  pilot: '125',
  ports: 'SAE flange ports to ISO 6162-1 with metric threads — pressure 1 in, suction 2 in',
  shafts: 'S or R, 1 1/4 in 14T 12/24DP splined; P, Ø32 mm keyed',
  throughDrive: 'none (N00), or K01, K52, K68, K04, K07, KB2, KB3, KB4, KB5, K57',
  example: null,
})

const A10_100 = a10({
  sku: 'IH-AP100-D-R-V',
  was: 'Bosch Rexroth A10VSO 100cc Axial Piston Pump',
  size: 100,
  speed: 2000,
  speedReduced: 2400,
  speedH: 2300,
  flowMax: 200,
  flow1500: 150,
  powerMax: 93,
  power1500: 70,
  torque: 445,
  weight: '49.5',
  weightTd: '55.4',
  pilot: '125',
  ports:
    'pressure 1 1/4 in SAE flange (ISO 6162-2 high-pressure series), suction 2 1/2 in SAE flange (ISO 6162-1)',
  shafts: 'S, 1 1/2 in 17T 12/24DP splined; P, Ø40 mm keyed',
  throughDrive: 'none (N00), or K01, K52, K68, K04, K07 (SAE C), K24, KB2–KB6, K57',
  example: null,
})

// ── Bosch Rexroth PGH4 internal gear pump ───────────────────────────────────

const RE10227 =
  'Bosch Rexroth data sheet RE 10227 (PGH series 3X, frame sizes 4 and 5), edition 2025-02'

const PGH4: Entry = {
  sku: 'IH-PGH4-21-020',
  was: 'Bosch Rexroth PGH4 Gear Pump 20cc',
  title: 'Bosch Rexroth PGH4 Size 20 Internal Gear Pump, 20.1 cm³/rev',
  seoTitle: 'Rexroth PGH4 Size 20 Internal Gear Pump',
  seoDescription:
    'Bosch Rexroth PGH4-3X/020RE11VU2 internal gear pump: 20.1 cm³/rev, 315 bar continuous, 350 bar peak, 3000 rpm, 101-2 flange. Request a quote.',
  focusKeyword: 'rexroth pgh4 020',
  mpn: 'PGH4-3X/020RE11VU2',
  descriptionShort:
    'Bosch Rexroth PGH4 size 20 internal gear pump: gap-compensated, fixed displacement, 20.1 cm³/rev, rated 315 bar with 350 bar peaks, up to 3000 rpm. Current type PGH4-3X/020RE11VU2, material no. R901147100.',
  descriptionLong: [
    p(
      "The Bosch Rexroth PGH4 size 20 is a gap-compensated internal gear pump with fixed displacement. A pinion shaft running in hydrodynamic plain bearings drives an internally toothed ring gear, and the oil carried in the tooth spaces moves from the suction side to the pressure port. System pressure presses axial washers and radial segments against the gears, so the clearances adjust themselves and volumetric efficiency stays high over the pump's life; the long tooth mesh keeps flow pulsation and noise low."
    ),
    p(
      'Rexroth builds it for durable high-power, high-pressure drives with very high load-cycle counts: plastics machines, automated presses, foundry machines and accumulator-charging circuits, including variable-speed drives. It is an internal gear pump, not an external one, as this page used to say.'
    ),
    h3('Ratings'),
    ul([
      'Displacement: 20.1 cm³/rev',
      'Pressure: 315 bar maximum operating; 350 bar peak, for 10 ms at a time',
      'Speed: 400 to 3000 rpm',
      'Flow: 28.9 L/min at 1450 rpm and 10 bar',
      'Drive power: 1.1 to 35 kW',
      'Mass: 14 kg',
    ]),
    h3('The type code'),
    p(
      "PGH4-3X/020RE11VU2 reads: PG internal gear pump, H high-pressure, frame size 4, series 3X, size 020, R clockwise rotation, E keyed Ø25 mm shaft, 11 pressure port to ISO 6162-2, V FKM seals, U2 two-hole 101-2 flange to ISO 3019-1. Series 2X is no longer offered in frame size 4; Rexroth's current pump is the 3X, material no. R901147100."
    ),
    ul([
      'Mounting: U2, two-hole flange 101-2 to ISO 3019-1 (Ø101.6 mm pilot); or E4, four-hole flange to ISO 3019-2',
      'Shaft: E, Ø25 mm keyed; or R, 15T 16/32DP splined',
      'Ports: suction DN25 (SAE 1 in), pressure DN19 (SAE 3/4 in), SAE flange ports',
      'Seals: V, FKM; or W, NBR shaft seal with FKM seals',
      'Rotation: R or L, not reversible',
    ]),
    h3('Fluid and installation'),
    p(
      'HLP mineral oil to DIN 51524, from −10 to +80 °C, filtered to ISO 4406 class 20/18/15. Suction pressure 0.8 to 2 bar absolute. Mount it preferably horizontal with the suction port at the bottom. The pump has no built-in pressure limiting, so the circuit needs a relief valve. A through drive lets it carry other PGH, vane or axial piston pumps.'
    ),
    h3('Ordering'),
    p(
      "Quote PGH4-3X/020RE11VU2, or your pump's nameplate code if it differs in shaft, flange, ports or rotation. We supply new pumps and confirm lead time on the quotation."
    ),
  ].join(''),
  faqs: [
    {
      question: 'Is the PGH4 an external or an internal gear pump?',
      answer:
        "Internal. Rexroth's PGH is a gap-compensated internal gear pump: a pinion drives an internally toothed ring gear, which keeps pulsation and noise low.",
    },
    {
      question: 'What pressure is it rated for?',
      answer:
        '315 bar maximum operating pressure for size 20, with pressure peaks to 350 bar lasting no more than 10 ms each.',
    },
    {
      question: 'Is PGH4-2X still available?',
      answer:
        "Not in frame size 4: Rexroth's current data sheet covers it only as series 3X. The current size-20 pump is PGH4-3X/020RE11VU2, material no. R901147100. Send your old nameplate and we check the fit.",
    },
    {
      question: 'Does it need a relief valve?',
      answer:
        'Yes. The pump has no built-in pressure limiting, so the circuit must have a pressure relief valve.',
    },
    {
      question: 'How fast can it run?',
      answer: 'From 400 to 3000 rpm on mineral oil; Rexroth limits it to 2000 rpm on HFC fluid.',
    },
  ],
  specs: [
    spec('Hydraulic', 'Displacement', '20.1', 'cm³/rev', 'displacement'),
    spec('Hydraulic', 'Pressure (peak)', '350', 'bar', 'pressure_peak'),
    spec('Hydraulic', 'Speed (max)', '3000', 'rpm', 'speed_max'),
    spec(
      'Hydraulic',
      'Pump type',
      'Internal gear, gap-compensated, fixed displacement',
      undefined,
      'pump_type'
    ),
    spec(
      'Mechanical',
      'Mounting',
      'Two-hole flange 101-2 to ISO 3019-1 (U2)',
      undefined,
      'mounting'
    ),
    spec(
      'Mechanical',
      'Rotation',
      'Clockwise (R); counter-clockwise (L) to order',
      undefined,
      'rotation'
    ),
    spec('Mechanical', 'Weight', '14', 'kg', 'weight'),
    spec('Hydraulic', 'Max operating pressure', '315', 'bar'),
    spec('Hydraulic', 'Flow at 1450 rpm, 10 bar', '28.9', 'L/min'),
    spec('Identification', 'Rexroth material no.', 'R901147100 (PGH4-3X/020RE11VU2)'),
  ],
  sources: [RE10227, 'Bosch Rexroth product page R901147100 (PGH4-3X/020RE11VU2)'],
}

// ── HYDAC filter elements ───────────────────────────────────────────────────

const HYDAC_DFN = 'HYDAC brochure E 7.557.5/11.16, inline filter DFN/DFNF/LFN/LFNF to DIN 24550'
const HYDAC_RF = 'HYDAC brochure E 7.116.7/11.16, return line filter RF'
const HYDAC_USA = 'HYDAC USA filter element data sheets (1268869; 1262993)'

const DN_0160: Entry = {
  sku: 'IH-0160DN010BN4HC',
  was: 'HYDAC 0160DN Suction Filter 10 Micron',
  title: 'HYDAC 0160 DN 010 BN4HC Pressure Filter Element, 10 µm, DIN 24550',
  slug: 'hydac-0160-dn-010-bn4hc-pressure-filter-element',
  seoTitle: 'HYDAC 0160 DN 010 BN4HC Pressure Filter Element',
  seoDescription:
    'HYDAC 0160 DN 010 BN4HC: 10 µm Betamicron pressure filter element to DIN 24550 for the DFN 160 inline filter, no bypass, NBR seals. Request a quote.',
  focusKeyword: 'hydac 0160 dn 010 bn4hc',
  mpn: '0160 DN 010 BN4HC',
  descriptionShort:
    "HYDAC 0160 DN 010 BN4HC: a 10 µm Betamicron pressure filter element to DIN 24550, the replacement element for HYDAC's DFN 160 inline filter. No bypass, NBR seals, 20 bar collapse rating. HYDAC material no. 1268869.",
  descriptionLong: [
    p(
      "The HYDAC 0160 DN 010 BN4HC is a pressure-line filter element built to DIN 24550. It is the replacement element for HYDAC's DFN, DFNF, LFN and LFNF inline filters, and the 0160 size fits the DFN 160 housing. It is not a suction filter, and 0160 is the element size, not a flow rating — both errors this page used to carry."
    ),
    h3('The code'),
    ul([
      '<strong>0160</strong> — element size, matching the DFN 160 filter',
      '<strong>DN</strong> — pressure element to DIN 24550',
      '<strong>010</strong> — 10 µm filtration rating',
      '<strong>BN4HC</strong> — Betamicron glass-fibre media, low-collapse grade',
    ]),
    p(
      'With no suffix it has NBR seals and no bypass; /-V gives FPM seals. HYDAC also makes the same element in BH4HC media, rated to 210 bar differential, for duties where the element may see high differential pressure.'
    ),
    h3('Data'),
    ul([
      'Filtration: 10 µm, βx(c) ≥ 1000 (99.9 %), as HYDAC USA states it',
      'Collapse rating: 20 bar',
      'Bypass: none, closed end cap',
      'Seals: NBR',
      'Construction: microglass media on a steel support tube with outer sleeve; flow outside to inside',
      'Operating temperature: −30 to +100 °C',
      'Size: 40.1 mm ID × 80 mm OD × 160 mm long',
      'Pressure drop: HYDAC sizes it with a gradient coefficient of 3.8 mbar per L/min at 30 mm²/s, rising in proportion to viscosity',
    ]),
    h3('The housing'),
    p(
      'The DFN 160 is an inline pressure filter to DIN 24550, rated 210 bar nominal. It comes without a bypass valve as standard (7 bar optional) and with a port for a clogging indicator, set to 5 bar as standard. HYDAC lists it for mineral hydraulic oils, lubricating and compressor oils, biodegradable HETG, HEES and HEPG fluids and fire-resistant HFA to HFD fluids.'
    ),
    h3('Ordering'),
    p(
      'Quote 0160 DN 010 BN4HC, or HYDAC material no. 1268869. We supply genuine HYDAC elements and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'Is this a suction filter?',
      answer:
        "No. DN is HYDAC's pressure-line element to DIN 24550, for its DFN and LFN inline filters; HYDAC's suction elements are type S. The 0160 size fits the DFN 160 housing.",
    },
    {
      question: 'Does 0160 mean 160 L/min?',
      answer:
        'No, 0160 is the element size, matching the DFN 160 filter. HYDAC sizes the pressure drop with a gradient coefficient instead: 3.8 mbar per L/min for this element at 30 mm²/s.',
    },
    {
      question: 'Does it have a bypass?',
      answer:
        'No. The element has a closed end cap and no bypass, and the DFN housing has none as standard; a 7 bar bypass valve is a housing option.',
    },
    {
      question: 'What does BN4HC mean?',
      answer:
        "Betamicron glass-fibre media in HYDAC's low-collapse grade, rated 20 bar. The BH4HC version of the same element is rated 210 bar, for duties with high differential pressure.",
    },
    {
      question: 'What is the filtration efficiency?',
      answer: 'HYDAC USA rates the element βx(c) ≥ 1000, 99.9 % efficient at its 10 µm rating.',
    },
  ],
  specs: [
    spec('Performance', 'Filtration rating', '10', 'µm', 'filtration_micron'),
    spec(
      'Mechanical',
      'Mount style',
      'Element for the DFN 160 inline pressure filter (DIN 24550)',
      undefined,
      'mount_style'
    ),
    spec('Identification', 'Element type', 'DN pressure element to DIN 24550'),
    spec('Performance', 'Filter media', 'Betamicron BN4HC (glass fibre, low collapse)'),
    spec('Performance', 'Collapse rating', '20', 'bar'),
    spec('Performance', 'Beta ratio', 'βx(c) ≥ 1000 (99.9 %)'),
    spec('Performance', 'Bypass', 'None'),
    spec('Mechanical', 'Seals', 'NBR'),
    spec('Mechanical', 'Dimensions', '40.1 mm ID × 80 mm OD × 160 mm'),
    spec('Performance', 'Operating temperature', '−30 to +100 °C'),
    spec('Identification', 'HYDAC material no.', '1268869'),
  ],
  sources: [HYDAC_DFN, HYDAC_USA, 'HYDAC shop, material no. 1268869'],
}

const R_0330: Entry = {
  sku: 'IH-0330R010BN4HC',
  was: 'HYDAC 0330R Return Line Filter 10 Micron',
  title: 'HYDAC 0330 R 010 BN4HC Return Line Filter Element, 10 µm, for RF 330',
  seoTitle: 'HYDAC 0330 R 010 BN4HC Return Line Element',
  seoDescription:
    'HYDAC 0330 R 010 BN4HC: 10 µm return line filter element for the RF 330 filter, 3 bar bypass in the element, NBR seals. Request a quote.',
  focusKeyword: 'hydac 0330 r 010 bn4hc',
  mpn: '0330 R 010 BN4HC',
  descriptionShort:
    "HYDAC 0330 R 010 BN4HC: a 10 µm return line filter element for HYDAC's RF 330 filter, with a 3 bar bypass valve in the element and NBR seals. HYDAC now lists the 0330 R 010 element in ON or SN media.",
  descriptionLong: [
    p(
      "The HYDAC 0330 R 010 BN4HC is a return line filter element for HYDAC's RF 330 return line filter, which takes one 0330 R element. As with every R element, the 0330 is the element size, not a flow rating."
    ),
    h3('The code'),
    ul([
      '<strong>0330</strong> — element size, matching the RF 330 filter',
      '<strong>R</strong> — return line element',
      '<strong>010</strong> — 10 µm filtration rating',
      '<strong>BN4HC</strong> — Betamicron glass-fibre media, low-collapse grade (20 bar)',
    ]),
    p(
      "The element carries the filter's bypass valve, cracking at 3 bar as standard; /-B6 gives 6 bar, /-KB no bypass and /-V FPM seals."
    ),
    h3('Current HYDAC supply'),
    p(
      "HYDAC no longer lists a 0330 R 010 element in BN4HC media. Its current 10 µm glass-fibre element in this size is 0330 R 010 ON (HYDAC USA) or 0330 R 010 SN Sustainmicron (HYDAC's global shop), material no. 1262993. HYDAC does not say that it supersedes BN4HC, so tell us whether you need BN4HC specifically or will take the current media."
    ),
    h3('Data'),
    ul([
      'Filtration: 10 µm',
      'Bypass: 3 bar, in the element',
      'Collapse rating: 20 bar (BN4HC media)',
      'Element size (HYDAC data for 0330 R 010 ON): 48 mm ID × 95 mm OD × 195 mm long',
      'Construction: microglass media on a steel support tube with NBR seals; flow outside to inside',
      'Operating temperature: −30 to +100 °C',
    ]),
    h3('The housing'),
    p(
      'The RF 330 mounts on the tank top or inline. It is rated 25 bar nominal, has an aluminium housing with G 2 or SAE 2 in ports, and weighs 4.1 kg with its element.'
    ),
    h3('Ordering'),
    p(
      'Quote 0330 R 010 BN4HC, or the media you will accept. We supply genuine HYDAC elements and confirm lead time on the quotation.'
    ),
  ].join(''),
  faqs: [
    {
      question: 'Which filter does it fit?',
      answer:
        "HYDAC's RF 330 return line filter, which takes one 0330 R element. 0330 is the element size, not a flow rating.",
    },
    {
      question: 'Does it have a bypass?',
      answer:
        'Yes. On RF filters the bypass valve sits in the element, cracking at 3 bar as standard. /-B6 sets 6 bar and /-KB removes it.',
    },
    {
      question: 'Is BN4HC still made in this size?',
      answer:
        'HYDAC no longer lists 0330 R 010 BN4HC. Its current 10 µm element in this size is 0330 R 010 ON or SN, material no. 1262993. Tell us if you need BN4HC specifically.',
    },
    {
      question: 'What collapse pressure does it take?',
      answer: "20 bar, HYDAC's rating for BN4HC media. The RF 330 housing is rated 25 bar nominal.",
    },
    {
      question: 'Which way does the oil flow through it?',
      answer: 'Outside to inside, through pleated microglass media supported on a steel tube.',
    },
  ],
  specs: [
    spec('Performance', 'Filtration rating', '10', 'µm', 'filtration_micron'),
    spec(
      'Mechanical',
      'Mount style',
      'Element for the RF 330 return line filter',
      undefined,
      'mount_style'
    ),
    spec('Identification', 'Element type', 'R return line element'),
    spec('Performance', 'Filter media', 'Betamicron BN4HC (glass fibre, low collapse)'),
    spec('Performance', 'Bypass', '3 bar, in the element'),
    spec('Performance', 'Collapse rating', '20', 'bar'),
    spec('Mechanical', 'Seals', 'NBR'),
    spec('Mechanical', 'Dimensions', '48 mm ID × 95 mm OD × 195 mm (0330 R size)'),
    spec('Identification', 'Current HYDAC equivalent', '0330 R 010 ON / SN, material no. 1262993'),
  ],
  sources: [HYDAC_RF, HYDAC_USA, 'HYDAC shop, material no. 1262993'],
}

// ── HYDAC SB330 bladder accumulators ────────────────────────────────────────

const HYDAC_SB = 'HYDAC brochure EN 3.201.32/05.24, bladder accumulators, standard design'

type Sb = {
  sku: string
  was: string
  size: string
  gas: string
  weight: string
  thread: string
  flow: string
  dims: string
  spares: string
  variant: string
}

function sb(o: Sb): Entry {
  const code = `SB330-${o.size}A1/112A9-330A`
  return {
    sku: o.sku,
    was: o.was,
    title: `HYDAC ${code} Bladder Accumulator, ${o.size} L, 330 bar`,
    seoTitle: `HYDAC SB330 ${o.size} L Bladder Accumulator, 330 bar`,
    seoDescription: `HYDAC ${code} bladder accumulator: ${o.size} L nominal, ${o.gas} L gas volume, 330 bar, NBR bladder, ${o.thread} port. Request a quote.`,
    focusKeyword: `hydac sb330 ${o.size} l`,
    mpn: code,
    descriptionShort: `HYDAC ${code}: a ${o.size} L bladder accumulator rated 330 bar, with ${o.gas} L effective gas volume, an NBR bladder in a carbon steel shell and a ${o.thread} BSP fluid port. It weighs ${o.weight} kg.`,
    descriptionLong: [
      p(
        `The HYDAC ${code} is a ${o.size}-litre bladder accumulator from HYDAC's standard SB330 range. A closed NBR bladder holds a nitrogen charge inside a seamless steel shell. As system pressure rises, oil flows in and compresses the gas; when pressure falls, the gas expands and pushes the stored oil back into the circuit. An oil valve at the port closes when the oil has been expelled, so the bladder stays inside the shell.`
      ),
      p(
        'HYDAC lists energy storage, shock absorption, pulsation damping, leakage-loss compensation and volume compensation as typical uses.'
      ),
      h3('The model code'),
      ul([
        '<strong>SB330</strong> — standard bladder accumulator series',
        `<strong>${o.size}</strong> — nominal volume, litres`,
        '<strong>A</strong> — standard fluid port, thread with internal seal face',
        '<strong>1</strong> — standard gas side, 7/8-14UNF gas valve',
        '<strong>112</strong> — carbon steel fluid port and shell, NBR bladder',
        '<strong>A9</strong> — certification code: China and Hong Kong',
        '<strong>330</strong> — permitted operating pressure, bar',
        `<strong>A</strong> — fluid connection threaded to ISO 228 (BSP), ${o.thread}`,
      ]),
      p(
        'The certification code matters for installation in the UAE: HYDAC supplies test documents for the country of installation, which must be stated at order, and the permitted pressure can differ between certifications. Tell us where the accumulator will be installed. The pre-charge pressure is not part of the code either; HYDAC sets it to the figure you give at order.'
      ),
      h3('Data'),
      ul([
        `Nominal volume: ${o.size} L; effective gas volume: ${o.gas} L`,
        'Permitted operating pressure: 330 bar',
        `Fluid port: ${o.thread} (ISO 228); gas valve 7/8-14UNF`,
        `Maximum fluid flow: ${o.flow} under optimum conditions, installed vertically`,
        'Operating temperature: −10 to +80 °C',
        `Weight: ${o.weight} kg`,
        `Dimensions: ${o.dims}`,
      ]),
      p(o.variant),
      h3('Pre-charge'),
      p(
        "Charge with nitrogen of at least class 2.8, never air or oxygen. HYDAC's limits: the pre-charge pressure no more than 0.9 times the minimum operating pressure, and the maximum operating pressure no more than four times the pre-charge."
      ),
      h3('Installation and spares'),
      p(
        `Mount it vertically, horizontally or at an angle, with the oil valve pointing down when vertical or slanted; vertical is preferred for energy storage, because horizontal or slanted mounting reduces the usable volume and flow. HYDAC recommends its mounting clamps on accumulators over 1 L or where vibration is strong. Spares: ${o.spares}.`
      ),
      h3('Ordering'),
      p(
        `Quote ${code} with the pre-charge pressure and the country of installation. We supply genuine HYDAC accumulators and confirm lead time on the quotation.`
      ),
    ].join(''),
    faqs: [
      {
        question: 'What pre-charge pressure is it supplied with?',
        answer:
          "The one you specify at order: the pre-charge is not part of the model code. HYDAC's rule is no more than 0.9 times your minimum operating pressure, with the maximum operating pressure no more than four times the pre-charge.",
      },
      {
        question: 'What does A9 in the model code mean?',
        answer:
          'Certification for China and Hong Kong. HYDAC supplies test documents for the country of installation, which must be given at order, so tell us where the accumulator will be installed.',
      },
      {
        question: `How much oil does the ${o.size} L accumulator hold?`,
        answer: `Its nominal volume is ${o.size} L and its effective gas volume ${o.gas} L. The usable oil volume depends on the pre-charge and on the minimum and maximum operating pressures.`,
      },
      {
        question: 'Which gas is used?',
        answer: 'Nitrogen, at least class 2.8 — never air or oxygen.',
      },
      {
        question: 'Can it be mounted horizontally?',
        answer:
          'Yes, or vertically or at an angle, but with the oil valve pointing down when vertical or slanted. Vertical is preferred for energy storage; horizontal mounting reduces the usable volume and flow.',
      },
    ],
    specs: [
      spec('Performance', 'Capacity', o.size, 'L', 'capacity_l'),
      spec('Performance', 'Pressure (max)', '330', 'bar', 'pressure_max'),
      spec('Mechanical', 'Bladder material', 'NBR', undefined, 'bladder_material'),
      spec('Mechanical', 'Weight', o.weight, 'kg', 'weight'),
      spec('Performance', 'Pre-charge', 'Set to order (nitrogen)', undefined, 'pre_charge_bar'),
      spec('Performance', 'Effective gas volume', o.gas, 'L'),
      spec('Mechanical', 'Fluid port', `${o.thread} (ISO 228)`),
      spec('Mechanical', 'Gas valve', '7/8-14UNF'),
      spec('Mechanical', 'Shell', 'Carbon steel'),
      spec('Performance', 'Operating temperature', '−10 to +80 °C'),
      spec('Identification', 'Certification code', 'A9 (China / Hong Kong)'),
    ],
    sources: [HYDAC_SB, 'HYDAC shop, SB330 standard bladder accumulators'],
  }
}

const SB_4 = sb({
  sku: 'IH-SB330-4A1',
  was: 'HYDAC Bladder Accumulator SB330 4L 330 bar',
  size: '4',
  gas: '3.7',
  weight: '15',
  thread: 'G 1 1/4',
  flow: '10 L/s',
  dims: '412 mm long overall, 170 mm diameter (maximum)',
  spares: 'bladder assembly 236046, seal kit 353609, repair kit 2106204',
  variant:
    'HYDAC tabulates weights and dimensions for its CC U and CC S builds; the A9 build is presumed identical in the vessel.',
})

const SB_10 = sb({
  sku: 'IH-SB330-10A1',
  was: 'HYDAC Bladder Accumulator SB330 10L 330 bar',
  size: '10',
  gas: '9.3',
  weight: '33',
  thread: 'G 2',
  flow: '15 L/s',
  dims: '582 mm long overall, 229 mm diameter (maximum)',
  spares: 'bladder assembly 236088, seal kit 353621, repair kit 2106212',
  variant:
    "These figures are for the standard 10 L. HYDAC also makes a slimline 10 L, marked (SV), with a G 1 1/4 port, 170 mm diameter and 31 kg; the model code here carries no SV. Weights are tabulated for HYDAC's CC U and CC S builds.",
})

// ── Parker T6C / T7B vane pumps ─────────────────────────────────────────────

const PARKER_T7 =
  'Parker catalogue HY29-0001/UK, industrial vane pumps T7/T67/T6 (Denison technology)'
const PARKER_T6R = 'Parker catalogue HY29-0027/UK, thru-drive vane pumps T6*R'

const T6C: Entry = {
  sku: 'IH-T6C-012-1R00-B1',
  was: 'Parker T6C Vane Pump 12cc',
  title: 'Parker T6C Vane Pump, 012 Cartridge, 37.1 cm³/rev',
  seoTitle: 'Parker T6C-012 Vane Pump, 37.1 cm³/rev',
  seoDescription:
    'Parker (Denison) T6C-012-1R00-B1 single vane pump: 37.1 cm³/rev, 275 bar intermittent, 240 bar continuous, 2800 rpm, SAE B flange. Request a quote.',
  focusKeyword: 'parker t6c 012 vane pump',
  descriptionShort:
    'Parker T6C-012-1R00-B1: a Denison-technology fixed-displacement single vane pump with the 012 cartridge, 37.1 cm³/rev, rated 275 bar intermittent and 240 bar continuous on antiwear oil, up to 2800 rpm. Supplied new.',
  descriptionLong: [
    p(
      "The Parker T6C is a fixed-displacement industrial vane pump from Parker's Denison-technology T7, T67 and T6 range, made in Vierzon, France. Its pumping parts sit in a replaceable cartridge, so the pump can be serviced or converted by changing the cartridge. The 012 cartridge displaces 37.1 cm³/rev — not 12 cm³, as this page used to say; Parker's current catalogue writes it B12."
    ),
    h3('The model code'),
    ul([
      '<strong>T6C</strong> — T6 single vane pump, C cartridge, SAE B two-bolt flange',
      '<strong>012</strong> — cartridge, 37.1 cm³/rev (B12 in current notation)',
      '<strong>1</strong> — keyed SAE B shaft, 22.2 mm',
      '<strong>R</strong> — clockwise rotation, viewed on the shaft end',
      '<strong>00</strong> — standard porting',
      '<strong>B</strong> — design letter',
      '<strong>1</strong> — S1 nitrile seals, for mineral oil',
    ]),
    h3('Ratings'),
    ul([
      'Pressure on antiwear mineral oil (HF-0, HF-2): 275 bar intermittent, 240 bar continuous',
      'On HF-1, water glycol (HF-4) and synthetic fluids (HF-5): 210 bar intermittent, 175 bar continuous; on invert emulsion (HF-3): 175 / 140 bar',
      'Speed: 600 to 2800 rpm on mineral oil; 1800 rpm on HF-3, HF-4 and HF-5',
      'Flow at 1500 rpm, 24 cSt: 55.6 L/min at 0 bar, 50.6 at 140 bar, 47.1 at 240 bar',
      'Input power at 1500 rpm: 14.4 kW at 140 bar, 24.1 kW at 240 bar',
      'Ports: suction 1 1/2 in, pressure 1 in, SAE J518 four-bolt flanges',
      'Weight: 15.7 kg',
    ]),
    h3('Single pump, not thru-drive'),
    p(
      'The plain T6C is a single pump with no rear drive. For tandem arrangements Parker sells the separate T6*R thru-drive series, with SAE A, B or C rear drives.'
    ),
    h3('Ordering'),
    p(
      "Quote T6C-012-1R00-B1 or its current form T6C-B12-1R00-B1, or the code on your pump's nameplate if the shaft, rotation, porting or seals differ. We supply new pumps and confirm lead time on the quotation."
    ),
  ].join(''),
  faqs: [
    {
      question: 'Is this a 12 cc pump?',
      answer:
        "No. 012 is the cartridge code, and the 012 cartridge displaces 37.1 cm³/rev. Parker's current catalogue writes the same cartridge as B12.",
    },
    {
      question: 'What pressure is it rated for?',
      answer:
        'On antiwear mineral oil, 275 bar intermittent and 240 bar continuous. Water glycol and synthetic fluids lower that to 210 / 175 bar, and invert emulsions to 175 / 140 bar.',
    },
    {
      question: 'Can a second pump be driven from it?',
      answer:
        "Not from the plain T6C, which has no rear drive. Parker's T6*R series is the thru-drive version for tandem pumps.",
    },
    {
      question: 'What flow does it give?',
      answer:
        'At 1500 rpm and 24 cSt, 55.6 L/min at no load, 50.6 L/min at 140 bar and 47.1 L/min at 240 bar.',
    },
    {
      question: 'Can the cartridge be replaced?',
      answer:
        'Yes. The pumping parts are a replaceable cartridge, so the pump can be serviced, or its displacement changed, by fitting a new cartridge.',
    },
  ],
  specs: [
    spec('Hydraulic', 'Displacement', '37.1', 'cm³/rev', 'displacement'),
    spec('Hydraulic', 'Pressure (peak)', '275', 'bar', 'pressure_peak'),
    spec('Hydraulic', 'Speed (max)', '2800', 'rpm', 'speed_max'),
    spec('Hydraulic', 'Pump type', 'Vane, fixed displacement, single', undefined, 'pump_type'),
    spec('Mechanical', 'Mounting', 'SAE B two-bolt flange (SAE J744)', undefined, 'mounting'),
    spec('Mechanical', 'Rotation', 'Clockwise (R)', undefined, 'rotation'),
    spec('Mechanical', 'Weight', '15.7', 'kg', 'weight'),
    spec('Hydraulic', 'Continuous pressure', '240', 'bar'),
    spec('Hydraulic', 'Flow at 1500 rpm, 0 bar', '55.6', 'L/min'),
    spec('Mechanical', 'Shaft', 'Keyed SAE B, 22.2 mm'),
    spec('Mechanical', 'Seals', 'S1 nitrile (mineral oil)'),
  ],
  sources: [PARKER_T7, PARKER_T6R],
}

const T7B: Entry = {
  sku: 'IH-T7B-B09-2R00-A100',
  was: 'Parker T7B Vane Pump 09cc',
  title: 'Parker T7B Vane Pump, B09 Cartridge, 28.0 cm³/rev',
  seoTitle: 'Parker T7B B09 Vane Pump, 28.0 cm³/rev',
  seoDescription:
    'Parker (Denison) T7B single vane pump, B09 cartridge: 28.0 cm³/rev, 320 bar intermittent, 290 bar continuous, 3600 rpm, ISO 3019-2 flange. Request a quote.',
  focusKeyword: 'parker t7b b09 vane pump',
  mpn: null,
  descriptionShort:
    'Parker T7B single vane pump with the B09 cartridge: 28.0 cm³/rev, rated 320 bar intermittent and 290 bar continuous on antiwear oil, up to 3600 rpm, on an ISO 3019-2 two-bolt flange. SAE B flange version: T7BS.',
  descriptionLong: [
    p(
      "The Parker T7B is a fixed-displacement industrial vane pump from Parker's Denison-technology T7, T67 and T6 range, built for high pressure in a small envelope. The B09 cartridge displaces 28.0 cm³/rev — not 9 cm³, as this page used to say — and sits in the T7B group rated 320 bar intermittent; the larger B11 to B14 cartridges drop to 300 bar and B15 to 280 bar."
    ),
    h3('T7B or T7BS'),
    p(
      "The B cartridge is shared by two pumps: the T7B, on an ISO 3019-2 100A2HW two-bolt flange, and the T7BS, on an SAE B two-bolt flange with extra SAE shaft options. This page used to give the flange as SAE A, which belongs to the T7AS. The code it carried, T7B-B09-2R00-A100, is not a combination in Parker's current catalogue: the 00 port-thread suffix is listed only for the T7BS. The nearest current codes are T7B-B09-2R00-A1M0 (ISO flange, metric port threads) and T7BS-B09-2R00-A100 (SAE flange, UNC threads) — tell us which you need."
    ),
    h3('Ratings'),
    ul([
      'Pressure on antiwear mineral oil (HF-0, HF-2): 320 bar intermittent, 290 bar continuous',
      'On HF-1, HF-4 and HF-5 fluids: 240 / 210 bar; on invert emulsion (HF-3): 175 / 140 bar',
      'Speed: 600 to 3600 rpm on mineral oil; 1800 rpm on HF-3, HF-4 and HF-5',
      'Flow at 1500 rpm, 24 cSt: 42.0 L/min at 0 bar, 40.3 at 140 bar, 38.1 at 320 bar',
      'Input power at 1500 rpm: 10.4 kW at 140 bar, 23.2 kW at 320 bar',
      'Shaft code 2: keyed to ISO R775, 25 mm',
      'Ports: suction 1 1/2 in, pressure 1 in or 3/4 in, SAE J518 four-bolt flanges',
      'Weight: 23.0 kg, as Parker prints it',
    ]),
    h3('Ordering'),
    p(
      "Send the code on your pump's nameplate, or say whether you need the ISO-flange T7B or the SAE-flange T7BS. We supply new pumps and confirm lead time on the quotation."
    ),
  ].join(''),
  faqs: [
    {
      question: 'Is this a 9 cc pump?',
      answer: 'No. B09 is the cartridge code, and the B09 cartridge displaces 28.0 cm³/rev.',
    },
    {
      question: 'What is the difference between the T7B and the T7BS?',
      answer:
        'The flange. The T7B mounts on an ISO 3019-2 100A2HW two-bolt flange; the T7BS on an SAE B two-bolt flange, with extra SAE shaft options. Both take the same B cartridges.',
    },
    {
      question: 'What pressure is it rated for?',
      answer:
        'With the B09 cartridge on antiwear mineral oil, 320 bar intermittent and 290 bar continuous. Water glycol and synthetic fluids lower that to 240 / 210 bar.',
    },
    {
      question: 'What flow does it give?',
      answer:
        'At 1500 rpm and 24 cSt, 42.0 L/min at no load, 40.3 L/min at 140 bar and 38.1 L/min at 320 bar.',
    },
    {
      question: 'How fast can it run?',
      answer:
        'From 600 to 3600 rpm on mineral oil; 1800 rpm on water glycol, invert emulsion and synthetic fluids.',
    },
  ],
  specs: [
    spec('Hydraulic', 'Displacement', '28.0', 'cm³/rev', 'displacement'),
    spec('Hydraulic', 'Pressure (peak)', '320', 'bar', 'pressure_peak'),
    spec('Hydraulic', 'Speed (max)', '3600', 'rpm', 'speed_max'),
    spec('Hydraulic', 'Pump type', 'Vane, fixed displacement, single', undefined, 'pump_type'),
    spec(
      'Mechanical',
      'Mounting',
      'ISO 3019-2 100A2HW two-bolt flange (T7BS: SAE B)',
      undefined,
      'mounting'
    ),
    spec('Mechanical', 'Rotation', 'Clockwise (R)', undefined, 'rotation'),
    spec('Mechanical', 'Weight', '23.0', 'kg', 'weight'),
    spec('Hydraulic', 'Continuous pressure', '290', 'bar'),
    spec('Hydraulic', 'Flow at 1500 rpm, 0 bar', '42.0', 'L/min'),
    spec('Mechanical', 'Shaft', 'Keyed, ISO R775, 25 mm'),
  ],
  sources: [PARKER_T7],
}

// ── Bosch Rexroth CDT3 tie-rod cylinders ────────────────────────────────────

const RE17051 = 'Bosch Rexroth data sheet RE 17051 (CDT3 tie-rod cylinders), edition 2022-10'

type Cdt3 = {
  sku: string
  was: string
  bore: number
  rod: number
  stroke: number
  mount: 'clevis' | 'foot'
  rods: string
  maxStroke: string
  push: string
  pull: string
  ports: string
  velocity: string
  weight: string
}

function cdt3(o: Cdt3): Entry {
  const mountName = o.mount === 'foot' ? 'Foot Mounting MS2' : 'Clevis Mounting MP1'
  const mountText =
    o.mount === 'foot'
      ? 'MS2, foot mounting'
      : 'MP1, clevis at the base (MP5 for a self-aligning clevis, MP3 for a swivel eye)'
  const code = `CDT3${o.mount === 'foot' ? 'MS2' : 'MP1'}/${o.bore}/${o.rod}/${o.stroke}Z3X/…`
  return {
    sku: o.sku,
    was: o.was,
    title: `Rexroth CDT3 Tie-Rod Cylinder ${o.bore}/${o.rod} × ${o.stroke} mm, ${mountName} (ISO 6020-2)`,
    seoTitle: `Rexroth CDT3 Cylinder ${o.bore}/${o.rod} × ${o.stroke}, ISO 6020-2`,
    seoDescription: `Bosch Rexroth CDT3 tie-rod cylinder, ${o.bore} mm bore, ${o.rod} mm rod, ${o.stroke} mm stroke, ${o.mount === 'foot' ? 'MS2 foot' : 'MP1 clevis'} mounting, ISO 6020-2, 160 bar. Request a quote.`,
    focusKeyword: `rexroth cdt3 ${o.bore} ${o.rod}`,
    mpn: null,
    descriptionShort: `Bosch Rexroth CDT3 tie-rod differential cylinder to ISO 6020-2: ${o.bore} mm piston, ${o.rod} mm rod, ${o.stroke} mm stroke, ${o.mount === 'foot' ? 'MS2 foot' : 'MP1 clevis'} mounting. Rated 160 bar nominal; 210 bar maximum for static loads only.`,
    descriptionLong: [
      p(
        `A Bosch Rexroth CDT3 tie-rod differential cylinder, ${o.bore} mm piston and ${o.rod} mm rod, ${o.stroke} mm stroke. CDT3 is Rexroth's tie-rod series with installation dimensions to ISO 6020-2, so it is interchangeable with other ISO 6020-2 cylinders of the same size and mounting. Rexroth offers it in 13 mounting types, pistons from 25 to 200 mm and strokes up to 3000 mm, with an integrated guide socket for quicker maintenance, optional end cushioning and a patented safety bleed.`
      ),
      p(
        'This page used to rate it 250 bar. Rexroth rates the CDT3 160 bar nominal, and 210 bar maximum only for static loads — fewer than 10,000 load cycles; for dynamic loads the limit is 75 % of that.'
      ),
      h3(`This size`),
      ul([
        `Piston ${o.bore} mm; rods offered: ${o.rods}`,
        `Stroke ${o.stroke} mm; maximum available ${o.maxStroke}, subject to a buckling check`,
        `Mounting: ${mountText}`,
        `Theoretical force at 160 bar: ${o.push} push, ${o.pull} pull`,
        `Line connections: ${o.ports}`,
        `Maximum stroke velocity: ${o.velocity}`,
        `Weight: ${o.weight}`,
        'Test pressure: 240 bar (static)',
      ]),
      h3('The type code'),
      p(
        `Rexroth's code starts ${code}: CD differential cylinder, T3 tie-rod series, the mounting, piston, rod and stroke, Z for tie-rod design and 3X for the component series. The rest specifies the line connections, rod end, cushioning, seals and rod finish. The code this page carried was not a Rexroth code; give the full code from your cylinder's nameplate, or the options you need, on the RFQ.`
      ),
      h3('Seals and fluid'),
      p(
        'Rexroth offers seal system M as standard (HL, HLP and HFA fluids), T for servo quality and low friction (also HFC), and S for HFDR phosphate ester and up to +120 °C. It does not publish the elastomers. With seal system M on mineral oil the fluid may run from −20 to +80 °C. Rexroth asks for ISO 4406 20/18/15 cleanliness or better, and at least 10 bar operating pressure with no load.'
      ),
      h3('Ordering'),
      p(
        'Send the full type code or the options on your RFQ. We supply new cylinders and confirm lead time on the quotation.'
      ),
    ].join(''),
    faqs: [
      {
        question: 'What pressure is the CDT3 rated for?',
        answer:
          '160 bar nominal. Rexroth allows 210 bar maximum only for static loads (fewer than 10,000 load cycles); for dynamic loads the limit is 75 % of that. The static test pressure is 240 bar.',
      },
      {
        question: `Which rods are offered for the ${o.bore} mm bore?`,
        answer: `${o.rods}. Changing the rod changes the pull force and the buckling limit, so state the rod with the bore and stroke.`,
      },
      {
        question: 'How much force does it give?',
        answer: `In theory, at 160 bar: ${o.push} pushing and ${o.pull} pulling with the ${o.rod} mm rod.`,
      },
      {
        question: 'Is it interchangeable with other ISO cylinders?',
        answer: `Yes, with other ISO 6020-2 cylinders of the same bore, rod, stroke and mounting: CDT3 follows ISO 6020-2 installation dimensions.`,
      },
      {
        question: 'Which seals does it have?',
        answer:
          'Rexroth names seal systems rather than elastomers: M as standard for mineral oil and HFA, T for servo quality and low friction, S for phosphate ester and up to +120 °C.',
      },
    ],
    specs: [
      spec('Dimensions', 'Bore', String(o.bore), 'mm', 'bore'),
      spec('Dimensions', 'Rod diameter', String(o.rod), 'mm', 'rod_diameter'),
      spec('Dimensions', 'Stroke', String(o.stroke), 'mm', 'stroke'),
      spec('Mechanical', 'Mount style', mountText, undefined, 'mount_style'),
      spec('Performance', 'Push force', o.push.replace(' kN', ''), 'kN', 'push_force_kn'),
      spec(
        'Mechanical',
        'Seal material',
        'Seal system M (standard), T or S',
        undefined,
        'seal_type'
      ),
      spec('Performance', 'Nominal pressure', '160', 'bar'),
      spec('Performance', 'Maximum operating pressure', '210 bar, static loads only'),
      spec('Identification', 'Series', 'Rexroth CDT3, ISO 6020-2'),
      spec('Mechanical', 'Line connections', o.ports),
    ],
    sources: [RE17051],
  }
}

const CYL_63 = cdt3({
  sku: 'IH-CYL-63-45-200',
  was: 'ISO Tie-Rod Cylinder 63×45×200mm Stroke',
  bore: 63,
  rod: 45,
  stroke: 200,
  mount: 'clevis',
  rods: '28, 36 or 45 mm',
  maxStroke: '1400 mm',
  push: '49.9 kN',
  pull: '24.4 kN',
  ports: 'G1/2 standard, G3/4 enlarged',
  velocity: '0.50 m/s with standard ports, 0.70 m/s enlarged',
  weight: 'about 10.2 kg at 200 mm stroke (8.0 kg at 100 mm plus 2.2 kg per 100 mm more, MP1)',
})

const CYL_100 = cdt3({
  sku: 'IH-CYL-100-70-500',
  was: 'ISO Tie-Rod Cylinder 100×70×500mm Stroke',
  bore: 100,
  rod: 70,
  stroke: 500,
  mount: 'foot',
  rods: '45, 56 or 70 mm',
  maxStroke: '2000 mm',
  push: '125.7 kN',
  pull: '64.1 kN',
  ports: 'G3/4 standard, G1 enlarged',
  velocity: '0.30 m/s with standard ports, 0.50 m/s enlarged',
  weight: 'about 41.4 kg at 500 mm stroke (21 kg at 100 mm plus 5.1 kg per 100 mm more, MS2)',
})

export const HYDRAULICS: Entry[] = [
  DSG_3C4,
  DSG_2B2,
  BG_03,
  MBR_01,
  KHB,
  A10_45,
  A10_71,
  A10_100,
  PGH4,
  DN_0160,
  R_0330,
  SB_4,
  SB_10,
  T6C,
  T7B,
  CYL_63,
  CYL_100,
]
