/**
 * Case 07 — 50 HP HPU refurb: the schematic on file was wrong
 * 2026-05-11
 *
 * A 50 HP rig auxiliary hydraulic power unit came in noisy, sluggish, and
 * tripping on low pressure. The operator wanted a filter swap. We found
 * ISO 4406 22/19/16 oil, a tired motor, cracked manifold gasket faces, and
 * an OEM schematic that didn't match the actual plumbing. Eight days on
 * the bench, schematic redrawn from scratch, noise floor down 7 dB.
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
  slug: 'hpu-50hp-drilling-rig-auxiliary-refurbishment',
  caseNumber: '07',
  isFeatured: false,

  category: 'pumps',
  topicLabel: 'Power Packs · HPU · Industrial',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'MAY 2026 · BAY 6 / WORKSHOP',
  title: 'A 50 HP rig HPU came in for a filter change. The schematic on file was wrong, the oil was at 22/19/16, and the noise floor was 7 dB louder than the operator remembered.',
  titleAccent: 'the schematic on file was wrong',
  deck: 'A Nabors land rig in the UAE pulled their auxiliary HPU off the BOP-handler, top-drive lubrication and choke circuit because it was noisy, sluggish, and dropping out on low-pressure trips. The operator asked for a filter swap. We rebuilt the reservoir, the motor, the manifold and the as-built drawing — and dropped the cabin noise floor by 7 dB at the operator console.',

  heroImageCaption: 'FIG. 01 · 50 HP HPU on the wash-down stand in Bay 6, day 1 — reservoir lid pulled, baseline oil sample bagged',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-05-04',

  metaCells: [
    { label: 'Asset', value: 'HPU-50', valueSmall: ' · rig auxiliary', style: 'neutral' },
    { label: 'Motor', value: '50', valueSmall: ' HP · 415V', style: 'neutral' },
    { label: 'Oil cleanliness', value: '22/19/16 → 17/15/12', style: 'neutral' },
    { label: 'Turnaround', value: '8', valueSmall: ' days', style: 'accent' },
    { label: 'Noise drop', value: '−7 dB', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'Noisy. Sluggish. Tripping on low pressure.'),
    lead('The intake call came in from a Nabors / ADES land rig running in the UAE northern fields. The auxiliary hydraulic power unit — the skid that drives the BOP-handler rams, the top-drive lubrication pumps and the choke-actuator — was making noise the operator described as <em>"a coffee grinder full of gravel"</em>, the BOP rams were taking 4–6 seconds longer than usual to move, and the unit was tripping out on low-pressure faults two to four times a shift. <strong>The rig boss wanted a filter change and the unit back inside a week.</strong>'),

    para('We took the call, said yes to the week, and asked for an oil sample before the unit moved. The sample bottle that came back to JAFZA the next morning told us this was not a filter job. Particle counts were at <strong>ISO 4406 22/19/16</strong> against a target of 17/15/12 — three full code increments dirty across all three size bands, which on a 50 HP closed-loop HPU means the contamination has been there long enough to have eaten its way into the gear pump, the relief valves and the directional control coils. A filter swap on this oil would have clogged the new element inside two weeks.'),

    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Filter change should fix it. Get it back by Friday."',
        body: 'Operator diagnosis was a clogged return-line filter. They wanted the element swapped, the indicator reset, the unit dropped back on the rig. Five-day turnaround, ideally less. The Sunday call ended with: "It is just dirt, lads."',
      },
      {
        label: 'What the inspection actually found',
        title: 'Oil at 22/19/16, motor bearings worn, manifold cracked, drawing wrong',
        body: 'Oil sample three codes dirty across the board. 50 HP motor showing bearing-wear vibration signature on both ends. Manifold gasket faces cracked and weeping. And the OEM hydraulic schematic on the rig file did not match what was actually plumbed on the skid — apparently changed in a previous repair without being documented.',
      },
    ),

    para('This is the case for sending an engineer with the toolbox before you send a part. The cheapest version of this job — one filter element, one Saturday afternoon — would have put the unit back on a wellhead with three ticking failures in series and a drawing nobody could trust the next time something went wrong. We took the longer path.'),

    sectionHead('/02', 'solution', 'Strip it. Flush it. Rewind it. Then redraw the drawing.'),
    para('The eight days broke into four pieces of work that ran partly in parallel. We <strong>drained and flushed the reservoir</strong> down to bare metal, stripped the strainers, vacuumed the bottom plate, scrubbed the baffles and recharged with fresh <strong>ISO VG 46</strong> hydraulic fluid through a 1-micron kidney loop. We pulled the 50 HP, 4-pole, <strong>415V/50Hz</strong> drive motor and sent it to a certified UAE motor shop for a full rewind — both DE and NDE bearings replaced, stator dipped and baked, vibration baselined on their test bench at 1.8 mm/s RMS. We pulled the manifold, surface-ground both gasket faces back to <strong>≤ 0.05 mm flatness</strong> and <strong>≤ 1.6 µm Ra</strong> finish, and re-stamped the port labels because three of them were illegible. And we redrew the hydraulic schematic from scratch by tracing every line on the skid with a fitter and a draughtsman walking it together.'),

    para('The redraw is the part most shops skip. The drawing on the rig file showed two parallel pressure-line filters — the actual skid had one in series with the relief manifold and a second on the return. The drawing showed a 3,000 psi relief setting on the main; the actual valve was set at 2,850 psi by somebody who had clearly nudged it down to stop the unit tripping. The drawing showed a single accumulator on the BOP-handler circuit; there were two. We laminated the corrected drawing, attached it to the skid in a weather-proof pouch, and put a copy in the rig file at the operator desk.'),

    figure('Day 4 — the new schematic on the draughtsman\'s board next to the original OEM print. The differences are circled in orange. Three of them changed how we tested the unit on Day 7.', { captionPrefix: 'FIG. 02', placeholderLabel: '"Bay 6 draughtsman bench, two prints overlaid, orange highlighter\\n1200×675"' }),

    pullQuote('Half the HPUs we see in the GCC have a schematic on file that does not match the skid in front of you. Somebody changed it in 2019, somebody else changed it in 2022, and the drawing was never updated. If you do not redraw before you commission, you are testing against a fiction.', '— Aisha Al Suwaidi · QA / Engineering · Jebel Ali'),

    sectionHead('/03', 'approach', 'Four phases. Eight days. Two of them on the drawing alone.'),
    para('Every HPU refurbishment we run through Bay 6 follows the same four-phase plan. The intake-and-sample phase is the one that tends to surprise the operator — most asks are "filter change, please" and the inspection comes back with a longer list. This one was no different.'),

    approachGrid([
      { number: 'PHASE 01', title: 'Intake & oil sample', body: 'Skid offloaded, photo log, baseline oil sample to lab, motor vibration baseline, schematic compare against the print on file. Findings memo on the operator\'s desk inside 24 h.', duration: 'Days 0 — 1' },
      { number: 'PHASE 02', title: 'Strip, flush & diagnose', body: 'Reservoir drained, dismantled, scrubbed; strainers + magnetic plug pulled; motor sent to rewind shop; manifold pulled for surface grinding; schematic walked line-by-line with a draughtsman.', duration: 'Days 2 — 3' },
      { number: 'PHASE 03', title: 'Motor + manifold + drawing', body: 'Motor returned from rewind, bench-tested at 1.8 mm/s RMS; manifold refit with new gaskets; reservoir recharged with VG 46 through a 1 µm kidney loop; corrected schematic laminated.', duration: 'Days 4 — 6' },
      { number: 'PHASE 04', title: 'Function test & dispatch', body: 'OEM-style commissioning sequence run end-to-end; pressure relief reset to 3,000 psi; acoustic survey at the operator console before-and-after; client-witnessed sign-off; skid dispatched.', duration: 'Days 7 — 8' },
    ]),

    sectionHead('/04', 'sop', 'SOP-IND-031, line by line.'),
    para('Below is the abridged SOP that ran on this work order. The full SOP-IND-031 covers 38 line items across the same five phases — this is the subset that was ticked off on the morning of Day 8.'),

    sopBlock(
      'SOP-IND-031 · HPU REFURBISHMENT · REV 04',
      '24 / 24 COMPLETE',
      [
        {
          name: 'Phase 01 · Intake & oil sample',
          rows: [
            { task: 'Skid offload + photo log', detail: 'Hi-res photo log of every face of the skid, hose runs, gauge faces and nameplates before any tool touches it', who: 'K. AL MARZOUQI', tool: 'Camera' },
            { task: 'Baseline oil sample to lab', detail: 'Two bottles drawn from the reservoir return port, one to lab, one retained — particle count + water + viscosity + ferrous index', who: 'AISHA / QA', tool: 'Sample kit' },
            { task: 'Motor vibration baseline', detail: 'DE + NDE bearing housings logged at 1.5 mm/s and 4.2 mm/s RMS — both above 1.8 mm/s ISO 10816 alarm', who: 'AISHA / QA', tool: 'Accelerometer' },
            { task: 'Schematic compare', detail: 'OEM print from rig file walked against the actual skid plumbing — flagged 11 discrepancies for redraw', who: 'AISHA / QA', tool: 'Print + pen' },
          ],
        },
        {
          name: 'Phase 02 · Strip, flush & diagnose',
          rows: [
            { task: 'Reservoir drain + dismantle', detail: 'Old oil decanted, lid pulled, baffles + strainers + magnetic plug removed; bottom plate vacuumed dry', who: 'O. AL MAKTOUM', tool: 'Workshop' },
            { task: 'Reservoir scrub + lint-free wipe', detail: 'Scrubbed with hydraulic-grade detergent, rinsed with VG 46 base oil, wiped with lint-free cloth, daylight inspected', who: 'O. AL MAKTOUM', tool: 'Hand' },
            { task: 'Motor uncoupled + dispatched to rewind', detail: '50 HP 415V/50Hz motor uncoupled, drained, crated, dispatched to certified UAE motor shop with a 5-day SLA', who: 'K. AL MARZOUQI', tool: 'Sub-contract' },
            { task: 'Manifold removed for re-machining', detail: 'Manifold de-piped, ports plugged, transferred to surface grinder; gasket faces flatness logged before grinding', who: 'H. AL AWADI', tool: 'Surface grinder' },
            { task: 'Schematic walked line-by-line', detail: 'Fitter + draughtsman walked every hose, every fitting, every valve — drew the as-built from scratch on B-size paper', who: 'AISHA + O. AL MAKTOUM', tool: 'Pen + tape' },
          ],
        },
        {
          name: 'Phase 03 · Motor, manifold & drawing',
          rows: [
            { task: 'Motor returned + bench-tested', detail: 'Motor back from rewind shop on Day 5; new DE + NDE bearings, stator dipped + baked; vibration logged at 1.8 mm/s RMS no-load', who: 'O. AL MAKTOUM', tool: 'Test bench' },
            { task: 'Manifold gasket faces ground', detail: 'Both gasket faces surface-ground to ≤ 0.05 mm flatness, ≤ 1.6 µm Ra; port labels re-stamped where illegible', who: 'H. AL AWADI', tool: 'Surface grinder' },
            { task: 'Manifold refit with new gaskets', detail: 'Composite gaskets installed, bolts torqued to OEM spec in star pattern, hand-cranked to seat', who: 'O. AL MAKTOUM', tool: 'Torque wrench' },
            { task: 'Reservoir recharge through 1 µm kidney loop', detail: 'Fresh ISO VG 46 hydraulic fluid pumped through a 1-micron β > 200 kidney filter for 4 h before the unit was first energised', who: 'O. AL MAKTOUM', tool: 'Kidney loop' },
            { task: 'Corrected schematic laminated', detail: 'Final B-size as-built drawing printed, laminated, stuck to the skid in a weather pouch + a copy filed for the rig', who: 'AISHA / QA', tool: 'Lamination' },
            { task: 'Filter elements swapped (3 µm β > 200)', detail: 'Pressure-line + return-line filter elements replaced with 3 µm β > 200 elements per ISO 16889', who: 'O. AL MAKTOUM', tool: 'Spanner' },
          ],
        },
        {
          name: 'Phase 04 · Function test, acoustic & dispatch',
          rows: [
            { task: 'Function test vs OEM commissioning sequence', detail: 'Full BOP-handler + top-drive-lube + choke-actuator sequence run end-to-end against OEM commissioning script', who: 'AISHA / QA', tool: 'Test rig' },
            { task: 'Pressure relief reset to 3,000 psi ± 50', detail: 'Main relief returned to OEM 3,000 psi setting, lockwired, witnessed; previous 2,850 psi setting flagged in the close-out', who: 'AISHA / QA', tool: 'Test gauge' },
            { task: 'Pump output flow calibration', detail: 'Pump output measured at 122 l/min against OEM rated 120 l/min — within +2% spec', who: 'AISHA / QA', tool: 'Flow meter' },
            { task: 'Acoustic survey at operator console', detail: 'Sound pressure logged at 1 m from the operator console, before-and-after baseline, on the same calibrated meter', who: 'AISHA / QA', tool: 'SPL meter' },
            { task: 'Post-flush oil sample to lab', detail: 'Second bottle pulled from the same return port — confirmed ISO 4406 17/15/12 against target before sign-off', who: 'AISHA / QA', tool: 'Sample kit' },
            { task: 'Client-witnessed sign-off', detail: 'Operator HSE rep present for the function test and acoustic survey; sign-off pack handed over in 28 pp', who: 'Y. AL HASHIMI', tool: 'On-site' },
            { task: 'Skid loaded for return', detail: 'Skid bagged, banded, low-loaded for the rig; corrected schematic in the weather pouch + a printed copy in the file', who: 'K. AL MARZOUQI', tool: 'Transport' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The numbers, before and after.'),
    para('Below is what we actually measured on the unit, the oil and the acoustic survey, against OEM and ISO targets. Four findings would have failed an audit if the unit had been put back on the rig with a fresh filter and nothing else — all four were closed in Phase 03.'),

    specTable(
      'FINDINGS · HPU-50 · SERIAL HPU-50-1804 · INDUSTRIAL',
      [
        {
          component: 'Reservoir oil cleanliness',
          spec: 'ISO 4406 ≤ 17/15/12',
          asFound: '22/19/16',
          afterRebuild: '17/15/12',
          status: '↻ Drained, flushed, recharged',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hydraulic fluid grade',
          spec: 'ISO VG 46',
          asFound: 'VG 46 (degraded)',
          afterRebuild: 'VG 46 (fresh)',
          status: '↻ Recharged via 1 µm loop',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Drive motor (DE bearing)',
          spec: '≤ 1.8 mm/s RMS · ISO 10816',
          asFound: '4.2 mm/s RMS',
          afterRebuild: '1.6 mm/s RMS',
          status: '↻ Rewound + new bearings',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Drive motor (NDE bearing)',
          spec: '≤ 1.8 mm/s RMS · ISO 10816',
          asFound: '3.1 mm/s RMS',
          afterRebuild: '1.4 mm/s RMS',
          status: '↻ Rewound + new bearings',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Manifold gasket-face flatness',
          spec: '≤ 0.05 mm',
          asFound: '0.18 mm (cracked)',
          afterRebuild: '0.03 mm',
          status: '↻ Surface-ground',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Manifold surface finish',
          spec: '≤ 1.6 µm Ra',
          asFound: '4.2 µm Ra',
          afterRebuild: '0.9 µm Ra',
          status: '↻ Surface-ground',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Pressure relief valve setting',
          spec: '3,000 psi ± 50',
          asFound: '2,850 psi',
          afterRebuild: '3,005 psi',
          status: '↻ Re-set + lockwired',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Pump output flow',
          spec: '120 l/min OEM rated',
          asFound: '108 l/min',
          afterRebuild: '122 l/min',
          status: '↻ Within +2%',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'System working pressure',
          spec: '3,000 psi',
          asFound: '2,850 psi (clipped)',
          afterRebuild: '3,000 psi (full)',
          status: '↻ Restored',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Filter element rating',
          spec: '3 µm β > 200 · ISO 16889',
          asFound: '10 µm β > 75',
          afterRebuild: '3 µm β > 200',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Schematic completeness',
          spec: '100% lines documented',
          asFound: '~ 60% (11 errors)',
          afterRebuild: '100% (laminated)',
          status: '↻ Redrawn from skid',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Acoustic survey @ 1 m console',
          spec: '≤ 78 dB SPL target',
          asFound: '83 dB SPL',
          afterRebuild: '76 dB SPL',
          status: '✓ −7 dB drop',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'HPU back on the rig. Drawing on the wall. Cabin 7 dB quieter.'),
    para('The unit left Bay 6 on the morning of Day 8, low-loaded back to the rig the same afternoon, and was driving the BOP-handler rams on shift change the next day. The post-flush oil sample came back at the target ISO 4406 17/15/12 from the lab two days later — same bottle protocol, same return-port draw. The corrected schematic is laminated on the skid and a printed copy sits in the rig file at the driller\'s desk. The acoustic survey at the operator console dropped from 83 dB SPL to 76 dB SPL on the same calibrated meter at the same 1 m offset — a 7 dB drop, which is roughly half-loudness to a human ear. We carry a 6-month parts and labour warranty on the rebuild.'),

    resultBox(
      'Result · summary',
      'A 50 HP rig HPU back on the wellhead in 8 days, oil at target, motor rewound, manifold trued, schematic finally correct, and the operator cabin 7 dB quieter.',
      'Delivered inside the rig boss\'s one-week ask with one day of margin, and with three findings closed that a filter swap would have left ticking. The corrected as-built drawing is the part the operator quietly cared about most — they have lost three rig-hours in the last year chasing faults against a wrong schematic. Six-month parts + labour warranty on the assembled HPU.',
      [
        { value: '8', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
        { value: '17 / 15 / 12', label: 'ISO 4406 oil cleanliness', style: 'good' },
        { value: '−7 dB', label: 'Cabin noise floor drop', style: 'good' },
        { value: '6', valueSmall: ' mo', label: 'System warranty' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the job.'),
    teamList(
      'Five Indus engineers in Jebel Ali logged time against this work order across the eight days, with one external sub-contract to a certified UAE motor rewind shop. If you call JAFZA and ask about case 07, any of them can pull the file.',
      [
        { name: 'Yusuf Al Hashimi', role: 'Workshop Manager', location: 'Jebel Ali', scope: 'Bay 6 scheduling, sub-contract co-ordination with the motor rewind shop, client-witness sign-off on Day 8.' },
        { name: 'Omar Al Maktoum', role: 'Lead Hydraulics Technician', location: 'Jebel Ali', scope: 'Reservoir strip + flush, manifold refit, kidney-loop recharge, function-test bench operation.' },
        { name: 'Aisha Al Suwaidi', role: 'QA / Engineering', location: 'Jebel Ali', scope: 'Oil sampling protocol, vibration baseline, schematic walk + redraw, acoustic survey, sign-off pack.' },
        { name: 'Hassan Al Awadi', role: 'Manifold Machinist', location: 'Jebel Ali', scope: 'Surface grinding both gasket faces to ≤ 0.05 mm flatness and ≤ 1.6 µm Ra finish, port-label re-stamping.' },
        { name: 'Khalid Al Marzouqi', role: 'Field Lead', location: 'Jebel Ali', scope: 'Intake call, photo log, motor uncouple + dispatch to rewind shop, transport co-ordination back to the rig.' },
      ],
      'Case file · INTAKE-2026-05-114 · WO-2026-1184 · Published 2026-05-11 · Updated 2026-05-11',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'Half the HPUs we see in the GCC have a schematic on file that does not match the skid in front of you. If you do not redraw before you commission, you are testing against a fiction.',
  pullQuoteAuthor: 'Aisha Al Suwaidi',
  pullQuoteRole: 'QA / Engineering · Jebel Ali',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'HPU-50 rig aux' },
    { label: 'Service', value: 'Industrial' },
    { label: 'Motor', value: '50 HP · 4-pole' },
    { label: 'Supply', value: '415V / 50Hz' },
    { label: 'System pressure', value: '3,000 psi' },
    { label: 'Pump rated', value: '120 l/min' },
    { label: 'Hydraulic fluid', value: 'ISO VG 46' },
    { label: 'Filter rating', value: '3 µm β > 200' },
    { label: 'Oil cleanliness', value: 'ISO 4406 17/15/12' },
    { label: 'TAT', value: '8 days' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '18 pp', format: 'PDF' },
    { label: 'Oil-sample lab certs (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'As-built schematic (PDF)', url: '#', size: 'B-size · 2 sh', format: 'PDF' },
    { label: 'Sign-off pack (PDF)', url: '#', size: '28 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-05-114 · WO-2026-1184 · Published 2026-05-11 · Updated 2026-05-11',

  cardOneLiner: 'A 50 HP auxiliary HPU off a UAE land rig came in for what the operator thought was a filter change. Eight days later it left with new bearings, a trued manifold, oil at target ISO 4406 17/15/12, the right schematic on the skid, and the operator cabin 7 dB quieter.',
  cardOutcomePills: [
    { label: 'OIL 17/15/12', style: 'good' },
    { label: '−7 DB CABIN', style: 'good' },
    { label: 'SCHEMATIC REDRAWN', style: 'accent' },
    { label: '6 MO WARRANTY', style: 'neutral' },
  ],
  cardDurationLabel: '8 D ON BENCH',
  cardTagStyle: 'standard',
  cardTagLabel: 'HPU',

  durationDays: 8,

  seoTitle: '50 HP rig HPU refurbishment in Jebel Ali — oil 22/19/16 to 17/15/12, schematic redrawn, 7 dB quieter — Indus Hydraulics Case 07',
  seoDescription: 'A 50 HP auxiliary hydraulic power unit off a UAE land rig came in for a filter change. We rebuilt the reservoir, rewound the motor, trued the manifold, redrew the OEM schematic from scratch, and dropped the operator-console noise floor by 7 dB. Eight days on the bench in Jebel Ali, ISO 4406 17/15/12 to lab, six-month parts and labour warranty.',
  focusKeyword: 'hydraulic power unit refurbishment Jebel Ali',
}

export default CASE
