/**
 * Case 10 — Custom 16-port EN24 manifold for a press-control retrofit
 * 2026-05-11
 *
 * A UAE steel-stamping plant outgrew its OEM 8-port manifold. The plant
 * engineer brought us a hand-drawn circuit on grid paper. We engineered it,
 * machined it from EN24 billet, hydrotested it at 630 bar, and bolted it to
 * the press the same day it landed. Four-week build, sketch to certified part.
 */
import {
  type ServiceCaseSeed,
  COMMON_CTA_PHONE,
  COMMON_CTA_TITLE,
  COMMON_CTA_BODY,
  approachGrid,
  figure,
  lead,
  para,
  problemSolution,
  pullQuote,
  resultBox,
  sectionHead,
  sopBlock,
  specTable,
  teamList,
} from '../shared'

const CASE: ServiceCaseSeed = {
  slug: 'custom-16-port-manifold-en24-420-bar-press-control',
  caseNumber: '10',
  isFeatured: false,
  category: 'custom_builds',
  topicLabel: 'Custom Build · Manifold · Industrial',
  region: '🇦🇪 UAE · Jebel Ali (workshop)',
  caseDateLabel: 'MAY 2026 · BAY 7 / WORKSHOP',
  title:
    'A plant engineer walked in with a sketch on grid paper. Four weeks later we bolted his 16-port manifold to the press.',
  titleAccent: 'a sketch on grid paper',
  deck:
    'A UAE steel-stamping plant had outgrown an OEM 8-port block. The plant engineer arrived in our Jebel Ali workshop with a hand-drawn circuit, a target pressure of 420 bar, and an opinion about cross-bore failures. We turned the sketch into a CAD model, then a billet of EN24, then a certified part bolted to the press the same day it landed.',

  heroImageCaption: 'FIG. 01 · 16-port EN24 manifold on the hydrotest bench, day 24 — 630 bar held 30 min',
  heroImageCredit: 'PHOTO · A. AL SUWAIDI · 2026-05-08',

  metaCells: [
    { label: 'Asset', value: 'CMB-16P', valueSmall: ' · custom manifold', style: 'neutral' },
    { label: 'Ports', value: '16', valueSmall: ' · ISO 6149', style: 'neutral' },
    { label: 'Working pressure', value: '420', valueSmall: ' bar (~6,090 psi)', style: 'neutral' },
    { label: 'Build cycle', value: '28', valueSmall: ' days', style: 'accent' },
    { label: 'Material cert', value: 'EN 10204 3.1', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A press line that had outgrown its block.'),
    lead(
      'The plant engineer walked into our Jebel Ali workshop on a Tuesday with a roll of A3 grid paper under his arm. His employer, a UAE steel-stamping plant feeding the construction trade, had upgraded its largest hydraulic press for a planned product-mix change — heavier blanks, deeper draws, longer cycles. The OEM-supplied 8-port manifold block was the bottleneck. He had drawn the replacement himself, in pencil, port-by-port. He was looking for someone who could turn it into a part.',
    ),
    para(
      'The plant had been running the press on a stacked-modular manifold sourced when the line was first commissioned. Production had grown around it: an extra unloader valve bolted on with a sub-plate, a sequence-priority circuit improvised at the JIC fittings, three relief valves where two would have done. The sketch in his hand cleaned all of that up — <strong>16 ports, two unloader valves, a clean sequence-priority circuit</strong>, all on a single block bolted directly to the press frame. The intent was right. The pressure rating was the catch: <strong>420 bar working, 630 bar hydrotest</strong>, and a press that runs a duty cycle harder than most mobile gear.',
    ),
    problemSolution(
      {
        label: 'What the plant engineer brought us',
        title: '"Make this. 16 ports. 420 bar. Four weeks."',
        body:
          'A pencil sketch on A3 grid paper. ISO-style symbols, port positions called out, two unloader valves, sequence-priority circuit on the punch side. Target: replace the OEM 8-port block one bay over without re-routing the press plumbing.',
      },
      {
        label: 'What the job actually required',
        title: 'Engineer it, validate cross-bores, machine, certify.',
        body:
          'Convert sketch to ISO 1219 schematic + 3D solid + drill plan; validate every cross-bore intersection in CAD before cutting metal; machine from a single EN24 billet (quenched + tempered); hydrotest at 1.5× MAWP; leak-test every port-to-port path; full cert pack to EN 10204 3.1.',
      },
    ),
    para(
      'A custom manifold is not a part you order. It is a part you engineer. The sketch told us what the customer wanted the hydraulics to do. The cross-bore plan, the material spec, the hydrotest regime, the cleanliness target — those are choices made by the engineer who signs the drawing. On a press running 420 bar with the operator standing two metres away, those choices are the difference between a part that lasts a decade and one that cracks a billet on first pressurisation.',
    ),

    sectionHead('/02', 'solution', 'Sketch to CAD to billet to certified part.'),
    para(
      'We took the sketch, redrew it as an <strong>ISO 1219 hydraulic schematic</strong>, modelled the block as a 3D solid in CAD, and laid out the drill plan port-by-port. Every cross-bore intersection — every place two drilled passages meet inside the block — was checked in CAD against a <strong>minimum-wall rule of 3× bore diameter</strong> for high-pressure service. Three intersections came up tight on the first pass; two were resolved by repositioning a port 6 mm, the third by stepping a passage diameter down from 12 mm to 10 mm. None of them got cut into a billet.',
    ),
    para(
      'The block was machined from a single billet of <strong>EN24 alloy steel</strong> to BS 970 grade, quenched and tempered, with a tensile strength <strong>≥ 850 MPa</strong> certified per the rolling mill batch. Sixteen ports were drilled and threaded to <strong>ISO 6149 metric</strong> (a mix of M27, M22 and M14 across the circuit), all cross-bores cut per the verified plan, every internal passage deburred and flushed to <strong>ISO 16232 cleanliness</strong>. Hydrotest at 630 bar for 30 minutes, then a port-to-port pressure-decay leak test on every path with an acceptance limit of <strong>&lt; 0.1 ml/min per joint</strong>. Cert pack issued to EN 10204 3.1.',
    ),
    figure(
      'Day 18, machining bay. EN24 billet, 16 of 16 ports drilled and tapped, cross-bores cut per the verified plan. The block goes from here to deburr, then cleanliness, then hydrotest.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Finish-machined EN24 manifold block, ports tagged, on the inspection bench\\n1200×675"',
      },
    ),
    pullQuote(
      'Cross-bore validation in CAD is not a nice-to-have. The day you skip it is the day you crack a billet at 600 bar with three weeks of machining time inside it. We caught three tight intersections on this block before the first cut.',
      '— Hassan Al Awadi · CAD Draftsman / Cross-Bore Checker · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases — sketch to bolted-up.'),
    para(
      'Every custom-manifold build we run goes through the same four phases. The sketch goes in at one end. A certified part bolts to the customer\'s press at the other. Names don\'t change; only the durations move with the complexity of the circuit.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Engineering & validation',
        body:
          'Sketch to ISO 1219 schematic. 3D solid model of the block. Port-by-port drill plan. Cross-bore minimum-wall check in CAD before any metal is cut.',
        duration: 'Days 0 — 7',
      },
      {
        number: 'PHASE 02',
        title: 'Material & machining',
        body:
          'EN24 billet sourced with mill cert. Quenched + tempered to ≥ 850 MPa. Sixteen ports drilled and threaded to ISO 6149. Cross-bores per the validated plan.',
        duration: 'Days 8 — 21',
      },
      {
        number: 'PHASE 03',
        title: 'Test & certify',
        body:
          'Deburr, flush to ISO 16232 cleanliness. Hydrotest at 630 bar for 30 min. Pressure-decay leak test on every port-to-port path. Cert pack assembled.',
        duration: 'Days 22 — 25',
      },
      {
        number: 'PHASE 04',
        title: 'Delivery & bolt-up',
        body:
          'Crated and shipped to the plant. Bolted to the press in the same shift it landed. Witnessed pressurisation against the OEM control sequence; cert pack handed over.',
        duration: 'Days 26 — 28',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we followed, line by line.'),
    para(
      'Below is the actual SOP we run for a custom manifold build — abridged. SOP-IND-040 in full runs 38 lines covering sketch intake, CAD generation, cross-bore validation, material verification, machining, deburring, cleanliness coding, hydrotest, leak test, and the cert pack. This is the subset that was ticked off on this job.',
    ),
    sopBlock(
      'SOP-IND-040 · CUSTOM MANIFOLD BUILD · REV 02',
      '24 / 24 COMPLETE',
      [
        {
          name: 'Phase 01 · Engineering & validation',
          rows: [
            {
              task: 'Sketch intake & circuit review',
              detail:
                'Plant engineer\'s grid-paper sketch reviewed; intent captured against ISO 1219 schematic standard',
              who: 'F. AL MANSOORI',
              tool: 'Review',
            },
            {
              task: 'Convert sketch to ISO 1219 schematic',
              detail: '16 ports, 2 unloaders, sequence-priority circuit redrawn to standard symbols',
              who: 'F. AL MANSOORI',
              tool: 'CAD',
            },
            {
              task: '3D solid model of the block',
              detail: 'Full block geometry modelled; ports placed for direct bolt-up to existing press frame',
              who: 'H. AL AWADI',
              tool: 'CAD',
            },
            {
              task: 'Drill plan & port schedule',
              detail: 'Every passage tagged: diameter, depth, thread, sealing face. 16 ports + 11 cross-bores',
              who: 'H. AL AWADI',
              tool: 'Drill plan',
            },
            {
              task: 'Cross-bore minimum-wall validation',
              detail: '3× bore-diameter rule checked at every intersection. 3 tight passes flagged + resolved',
              who: 'H. AL AWADI',
              tool: 'CAD check',
            },
          ],
        },
        {
          name: 'Phase 02 · Material & machining',
          rows: [
            {
              task: 'EN24 billet sourced with mill cert',
              detail: 'BS 970 grade, quenched + tempered. EN 10204 3.1 cert on file before machining starts',
              who: 'Y. AL HASHIMI',
              tool: 'Material cert',
            },
            {
              task: 'Tensile + hardness verification',
              detail: '≥ 850 MPa tensile, hardness banding to 248 — 302 HB. Sample coupon tested in-house',
              who: 'A. AL SUWAIDI',
              tool: 'Tensile rig',
            },
            {
              task: 'Block roughed from billet',
              detail: 'Outer geometry to drawing, mounting-face flatness to 0.05 mm across 320 mm',
              who: 'O. AL MAKTOUM',
              tool: 'CNC mill',
            },
            {
              task: 'Drill 16 ports + 11 cross-bores',
              detail: 'Per validated plan: M27 × 2, M22 × 6, M14 × 8. ISO 6149 sealing faces',
              who: 'O. AL MAKTOUM',
              tool: 'CNC mill',
            },
            {
              task: 'Thread & deburr every port',
              detail: 'Tapped ports gauge-checked; cross-bore intersections deburred with carbide rotary',
              who: 'O. AL MAKTOUM',
              tool: 'Tap + burr',
            },
          ],
        },
        {
          name: 'Phase 03 · Cleanliness & test',
          rows: [
            {
              task: 'Internal flush + cleanliness coding',
              detail: 'Block flushed; particle count to ISO 16232 N100 limit for industrial hydraulic components',
              who: 'A. AL SUWAIDI',
              tool: 'Flush rig',
            },
            {
              task: 'Hydrotest @ 1.5× MAWP',
              detail: '630 bar held 30 min on every port; gauge witness + chart recorder. Zero bar drop',
              who: 'A. AL SUWAIDI',
              tool: 'Hydrotest',
            },
            {
              task: 'Port-to-port leak test',
              detail: 'Pressure-decay on every cross-bore path. Limit < 0.1 ml/min per joint. All 27 paths passed',
              who: 'A. AL SUWAIDI',
              tool: 'Decay test',
            },
            {
              task: 'External seal + plug acceptance',
              detail: '8 working plugs torqued to spec; 8 spare ports plugged with shop plugs for transit',
              who: 'O. AL MAKTOUM',
              tool: 'Torque wr.',
            },
            {
              task: 'Cert pack assembled',
              detail:
                'Material 3.1, hydrotest cert, cleanliness cert, ISO schematic, drill plan, port schedule — 38 pp',
              who: 'A. AL SUWAIDI',
              tool: 'PDF',
            },
          ],
        },
        {
          name: 'Phase 04 · Delivery & bolt-up',
          rows: [
            {
              task: 'Crate, tag, ship',
              detail: 'Block crated with desiccant, port plugs verified, transit shock indicator fitted',
              who: 'Y. AL HASHIMI',
              tool: 'Logistics',
            },
            {
              task: 'On-site fit to press frame',
              detail: 'Old OEM block removed, mounting face cleaned, new block bolted up — same shift',
              who: 'O. AL MAKTOUM',
              tool: 'On-site',
            },
            {
              task: 'Re-route plant plumbing to new ports',
              detail: 'Plant engineer\'s tag list followed; every line re-terminated to ISO 6149 sealing face',
              who: 'O. AL MAKTOUM',
              tool: 'Wrench set',
            },
            {
              task: 'Witnessed first-pressurisation',
              detail: 'Press control system run through OEM sequence; manifold held 420 bar working',
              who: 'F. AL MANSOORI',
              tool: 'On-site',
            },
            {
              task: 'Cert pack handover & sign-off',
              detail: 'Customer countersign on cert pack; 12-month manufacturer warranty issued',
              who: 'Y. AL HASHIMI',
              tool: 'Paper',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'Material, geometry, pressure — the numbers.'),
    para(
      'Below is what we specified, what we measured, and what we certified on the finished block. Material, cross-bore validation and the hydrotest are the three load-bearing items on a custom manifold — all three are highlighted, all three passed first time.',
    ),
    specTable(
      'BUILD RECORD · CMB-16P · SERIAL CMB-2026-010 · INDUSTRIAL PRESS',
      [
        {
          component: 'Block material',
          spec: 'EN24 (BS 970), Q+T',
          asFound: 'Billet, mill cert',
          afterRebuild: 'EN24, 3.1 cert',
          status: '✓ Verified',
          highlight: true,
          afterStyle: 'good',
        },
        {
          component: 'Tensile strength',
          spec: '≥ 850 MPa',
          asFound: '892 MPa (coupon)',
          afterRebuild: '892 MPa',
          status: '✓ Pass',
          highlight: true,
          afterStyle: 'good',
        },
        {
          component: 'Hardness band',
          spec: '248 — 302 HB',
          asFound: '281 HB (avg n=5)',
          afterRebuild: '281 HB',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Port count',
          spec: '16, ISO 6149',
          asFound: '—',
          afterRebuild: '16 / 16 gauged',
          status: '✓ All pass',
          afterStyle: 'good',
        },
        {
          component: 'Port mix',
          spec: 'M27 / M22 / M14',
          asFound: '—',
          afterRebuild: '2 / 6 / 8',
          status: '✓ Per drawing',
          afterStyle: 'good',
        },
        {
          component: 'Cross-bore intersections',
          spec: '11, ≥ 3× bore wall',
          asFound: '3 flagged tight',
          afterRebuild: '11 / 11 valid',
          status: '↻ Repositioned in CAD',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Mounting-face flatness',
          spec: '≤ 0.05 mm / 320 mm',
          asFound: '—',
          afterRebuild: '0.03 mm',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Cleanliness code',
          spec: 'ISO 16232 N100',
          asFound: '—',
          afterRebuild: 'N100 verified',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Hydrotest @ 1.5× MAWP',
          spec: '630 bar / 30 min hold',
          asFound: '—',
          afterRebuild: '630 bar / 30 min, 0 bar drop',
          status: '✓ Pass first time',
          highlight: true,
          afterStyle: 'good',
        },
        {
          component: 'Port-to-port leak rate',
          spec: '< 0.1 ml/min per joint',
          asFound: '—',
          afterRebuild: '0.00 — 0.04 ml/min',
          status: '✓ All 27 paths',
          afterStyle: 'good',
        },
        {
          component: 'Working pressure rating',
          spec: '420 bar (~6,090 psi)',
          asFound: '—',
          afterRebuild: '420 bar certified',
          status: '✓ Stamped on block',
          afterStyle: 'good',
        },
        {
          component: 'Material certificate',
          spec: 'EN 10204 3.1',
          asFound: 'Mill cert in hand',
          afterRebuild: '3.1 issued',
          status: '✓ Filed',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Same-day bolt-up, press back in production.'),
    para(
      'The block landed at the plant on the morning of day 27. By the end of the same shift the old OEM 8-port manifold was off the press, the new 16-port EN24 block was bolted to the frame, the plant\'s lines had been re-routed to the new port positions, and the press control system had run a witnessed first-pressurisation against its OEM commissioning sequence. The press was back in production on day 28 — on schedule for the customer\'s product-mix change. Full cert pack handed over: material, hydrotest, cleanliness, ISO schematic, drill plan. 12-month manufacturer warranty on the assembled block.',
    ),
    resultBox(
      'Result · summary',
      'Sketch to certified 16-port EN24 manifold in 28 days. Bolted to the press the same shift it landed, hydrotested 50% above working pressure, zero leaks across 27 internal paths.',
      'Plant engineer\'s pencil sketch turned into an ISO 1219 schematic, a 3D model, a validated drill plan, and a billet of EN24 — then certified at 1.5× MAWP and bolted to the press in the same shift it landed at the plant. Full cert pack to EN 10204 3.1, 12-month warranty, press back in production on day 28.',
      [
        { value: '28', valueSmall: ' days', label: 'Sketch to bolted-up', style: 'accent' },
        { value: '27 / 27', label: 'Leak-test paths passed', style: 'good' },
        { value: '630', valueSmall: ' bar / 30 min', label: 'Hydrotest hold', style: 'good' },
        { value: '12', valueSmall: ' mo', label: 'Warranty on assembled block' },
      ],
    ),

    sectionHead('/07', 'team', 'Five engineers, one workshop, one block.'),
    teamList(
      'Five engineers logged time against this work order, all in our Jebel Ali workshop. The customer dealt with one engagement lead from sketch intake to bolt-up. If you call the workshop and ask about case 10, any of them can pull the file.',
      [
        {
          name: 'Fatima Al Mansoori',
          role: 'Design Engineer',
          location: 'Jebel Ali',
          scope:
            'Sketch intake, ISO 1219 schematic conversion, customer engagement, on-site witness of first-pressurisation.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'CAD Draftsman / Cross-Bore Checker',
          location: 'Jebel Ali',
          scope:
            '3D solid model of the block, drill plan, cross-bore minimum-wall validation. Caught three tight intersections before any metal was cut.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Machinist',
          location: 'Jebel Ali',
          scope:
            'Billet rough-out, port drilling and threading, deburr. Bolt-up at the customer plant on delivery day.',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'QA / Hydrotest Lead',
          location: 'Jebel Ali',
          scope:
            'Tensile coupon, ISO 16232 cleanliness, 630 bar hydrotest, port-to-port leak test, cert pack assembly.',
        },
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope:
            'Material sourcing, EN 10204 3.1 cert chain, build-cycle scheduling, customer handover and warranty issue.',
        },
      ],
      'Case file · INTAKE-2026-04-128 · WO-2026-1184 · Published 2026-05-10 · Updated 2026-05-11',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'The customer brought us a sketch on grid paper. He didn\'t need a salesperson; he needed an engineer who could turn his circuit into a part that wouldn\'t crack at 600 bar. That\'s what a custom build is — concept-stage engineering all the way through to a stamped pressure cert.',
  pullQuoteAuthor: 'Fatima Al Mansoori',
  pullQuoteRole: 'DESIGN ENGINEER',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'CMB-16P' },
    { label: 'Service', value: 'Industrial press' },
    { label: 'Material', value: 'EN24 (BS 970)' },
    { label: 'Tensile', value: '≥ 850 MPa' },
    { label: 'Ports', value: '16 · ISO 6149' },
    { label: 'Working pressure', value: '420 bar' },
    { label: 'Hydrotest', value: '630 bar / 30 min' },
    { label: 'Leak rate', value: '< 0.1 ml/min/joint' },
    { label: 'Cleanliness', value: 'ISO 16232 N100' },
    { label: 'Cert', value: 'EN 10204 3.1' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'ISO 1219 schematic (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'Drill plan & port schedule (PDF)', url: '#', size: '6 pp', format: 'PDF' },
    { label: 'Material + hydrotest certs (ZIP)', url: '#', size: '8 MB', format: 'ZIP' },
    { label: 'Build record & cert pack (PDF)', url: '#', size: '38 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-128 · WO-2026-1184 · Published 2026-05-10 · Updated 2026-05-11',

  cardOneLiner:
    'A UAE steel-stamping plant brought us a hand-drawn 16-port circuit on grid paper. We turned the sketch into an EN24 manifold, hydrotested it at 630 bar, and bolted it to the press the same shift it landed.',
  cardOutcomePills: [
    { label: '630 BAR HYDROTEST · PASS', style: 'good' },
    { label: '27 / 27 LEAK PATHS', style: 'good' },
    { label: 'EN24 · 850 MPA', style: 'neutral' },
    { label: '4-WK BUILD CYCLE', style: 'accent' },
  ],
  cardDurationLabel: '4 WK BUILD',
  cardTagStyle: 'standard',
  cardTagLabel: 'BUILD',

  durationDays: 28,

  seoTitle:
    'Custom 16-port EN24 manifold, 420 bar press control — sketch to certified part in 4 weeks · Indus Hydraulics Jebel Ali',
  seoDescription:
    'Case study: UAE steel-stamping plant brought a hand-drawn 16-port circuit to our Jebel Ali workshop. We engineered it to ISO 1219, validated cross-bores in CAD, machined a single EN24 billet, hydrotested at 630 bar (1.5× MAWP), leak-tested every port-to-port path, and bolted the certified manifold to the press the same shift it landed. Full EN 10204 3.1 cert pack, 12-month warranty.',
  focusKeyword: 'custom hydraulic manifold UAE EN24 420 bar press control',
}

export default CASE
