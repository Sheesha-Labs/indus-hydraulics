/**
 * Case 05 — Coiled-tubing injector skid, emergency repair
 * 2026-05-11
 *
 * A CT injector skid was pulled mid-job from a Saudi Aramco sour-gas well in
 * the Eastern Province with a slipping gripper-block chain and an accumulator
 * that had lost its N₂ pre-charge. The contractor's next slot was 7 days out.
 * Indus stripped, re-faced, re-bladdered, re-tuned, function-tested and
 * dispatched in 5 — same-week return.
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
  slug: 'coiled-tubing-injector-skid-emergency-repair',
  caseNumber: '05',
  isFeatured: false,

  category: 'ct_wireline',
  topicLabel: 'CT & Wireline · Emergency · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'MAR 2026 · BAY 5 / EMERGENCY',
  title: 'A CT injector skid pulled mid-job from a sour Aramco well — back on location in five days, not seven.',
  titleAccent: 'back on location in five days, not seven',
  deck:
    'A coiled-tubing contractor in the Eastern Province had 7 days between a chain-block failure on a sour-gas well and their next slot back at the same wellhead. The skid landed in our Jebel Ali yard on a Wednesday night. It rolled out function-tested on the following Monday — chain re-faced, accumulators re-bladdered, control loop re-tuned, OEM commissioning script ticked off line by line.',

  heroImageCaption: 'FIG. 01 · CT injector head stripped on the bench, gripper blocks pulled for re-facing',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-03-18',

  metaCells: [
    { label: 'Asset', value: 'CT-INJ-80K', valueSmall: ' · 80 klb injector', style: 'neutral' },
    { label: 'Gripper blocks', value: '2', valueSmall: ' · re-faced pair', style: 'neutral' },
    { label: 'Accumulators', value: '2', valueSmall: ' · re-bladdered', style: 'neutral' },
    { label: 'Turnaround', value: '5', valueSmall: ' days', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A skid pulled off a well mid-job, with a 7-day clock.'),
    lead(
      'The call came in at 19:40 on a Wednesday. A coiled-tubing contractor working a sour-gas well in the Eastern Province had pulled their 80,000-lb injector skid off location after the gripper-block chain started slipping under load on a CT pull. One of the two N₂ accumulators on the injector head circuit had quietly lost its pre-charge over the previous month, the chain blocks were grabbing inconsistently, and the well slot was booked for the following Wednesday. <strong>Five working days, including transport, to make the unit safe to put back into a sour string.</strong>',
    ),
    para(
      'A coiled-tubing contractor does not own its slots — Aramco does. If the injector is not back on location on the day, the rig moves to the next program, and the contractor goes to the back of a queue that stretches into the following quarter. The contractor we work with has done 14 jobs through us; this was the first emergency. The skid was loaded onto a low-bed at the wellsite, cleared the Saudi border early Thursday and was in our Jebel Ali bay by Thursday afternoon. We had a hydraulics technician, a machinist and a QA inspector standing by from the moment customs cleared the vehicle.',
    ),
    problemSolution(
      {
        label: 'What the contractor told us',
        title: '"Chain slipping under load — and one accumulator pre-charge is gone."',
        body:
          'Two complaints, one obvious, one suspected. The chain had visibly slipped on the last pull. The accumulator had been logged at 620 psi against a 1,000 psi specification at the previous pre-job check. Asked us to "do whatever the chain needs and recharge the bottle."',
      },
      {
        label: 'What the strip-down actually showed',
        title: 'Both gripper blocks worn out of dimension; both accumulators bladders failed; control loop drifted.',
        body:
          'Chain-wear faces on both gripper blocks were down 0.31 mm and 0.27 mm respectively, well past the OEM minimum. The good accumulator had a perished bladder also drifting; the closed-loop hydraulic control on the injector head had a steady-state error that explained the inconsistent grip — not just the chain.',
      },
    ),
    para(
      'You do not get a second chance with a CT contractor\'s well slot. The cheapest version of this job — re-tension the chain and recharge the bottle — would have put the unit on a sour-gas string with two gripper blocks below OEM dimension and a control loop that was already wandering. We took the strip-down all the way to the head bearings. What we shipped back five days later was, in effect, a re-commissioned injector.',
    ),

    sectionHead('/02', 'solution', 'Strip, re-face, re-bladder, re-tune, function-test.'),
    para(
      'The work split into five disciplines and we ran them in parallel from Friday morning. The injector head came apart on the bench by Thursday night; gripper blocks, drive chains and the closed-loop hydraulic block all came off as sub-assemblies. The two accumulators were pulled to the high-pressure bay. Our machinist had both gripper blocks on the surface grinder by Friday lunchtime, re-facing the chain-wear contact surfaces back to OEM dimension within <strong>± 0.05 mm</strong> with a finished surface roughness of <strong>Ra ≤ 0.8 µm</strong> — the spec the OEM uses on new blocks. Hardened-steel chain-wear faces, ground in one set-up, indicated against a master block we keep in QA for exactly this asset family.',
    ),
    para(
      'Both accumulators were rebuilt with new <strong>HNBR sour-service bladders</strong> rated for H₂S exposure under <strong>NACE MR0175 / ISO 15156</strong>, refilled with traceable nitrogen against bottle numbers logged in QA, and pre-charged to <strong>1,000 psi</strong> with a 24-hour decay check before the assembly bay would accept them back. The closed-loop hydraulic control on the injector head was bench-tuned against a calibrated load — PID gains adjusted on response time and steady-state error until the head held a commanded pull force inside 1% of setpoint at 3,000 psi delivered hydraulic pressure.',
    ),
    figure('Day 2 in Bay 5 — both gripper blocks indicated on the surface grinder, chain-wear face being restored to OEM ± 0.05 mm. The reference master block sits to the right of the chuck.', {
      captionPrefix: 'FIG. 02',
      placeholderLabel: '"Gripper-block re-facing on surface grinder, master block at right\\n1200×675"',
    }),
    pullQuote(
      'You don\'t get a second chance with a CT contractor\'s well slot. The chain was the symptom; the head was the patient. We were not putting that skid back on a sour string with anything less than OEM commissioning.',
      '— Khalid Al Marzouqi · Emergency Response Field Lead · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, ninety hours of bench time.'),
    para(
      'Emergency CT-injector work on a sour-service skid runs through four phases. We compress the schedule but we do not compress the procedure — every step in the OEM commissioning script gets ticked off, the same as a planned overhaul.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Pickup & strip',
        body: 'Skid received from low-bed, photo log, fluid sample drained, injector head and accumulators broken out as sub-assemblies on the bench in Bay 5.',
        duration: 'Day 0',
      },
      {
        number: 'PHASE 02',
        title: 'Re-face & re-bladder',
        body: 'Both gripper blocks ground to OEM ± 0.05 mm with Ra ≤ 0.8 µm finish. Both accumulators stripped, HNBR bladders fitted, traceable N₂ pre-charge.',
        duration: 'Days 1 — 2',
      },
      {
        number: 'PHASE 03',
        title: 'Control re-tune & rebuild',
        body: 'Closed-loop PID re-tuned on calibrated load. Injector head reassembled with re-faced blocks and rebuilt accumulators. Hydraulic circuits hydrotested at 1.5× MAWP.',
        duration: 'Day 3',
      },
      {
        number: 'PHASE 04',
        title: 'Function-test & dispatch',
        body: 'Full skid run against OEM commissioning script: push/pull cycle, gripper engage/disengage, accumulator dump test. Sign-off pack issued, low-bed loaded for return.',
        duration: 'Days 4 — 5',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we ran, line by line.'),
    para(
      'Below is the actual procedure we ticked off — abridged from the master document. SOP-OG-024 is the Indus standard for emergency CT-injector repair on sour-service skids, currently at revision 03.',
    ),
    sopBlock(
      'SOP-OG-024 · CT INJECTOR EMERGENCY REPAIR · REV 03 · NACE',
      '24 / 24 COMPLETE',
      [
        {
          name: 'Phase 01 · Pickup, strip & inspect',
          rows: [
            { task: 'Asset received & photo-logged', detail: 'Low-bed offload at Bay 5; full perimeter walk-around; nameplate, OEM serial and run-hours recorded against intake', who: 'K. AL MARZOUQI', tool: 'Intake' },
            { task: 'Sour-service classification confirmed', detail: 'Aramco well data: H₂S partial pressure > 0.3 kPa — NACE MR0175 / ISO 15156 applies to all wetted elastomers', who: 'QA', tool: 'Gas data' },
            { task: 'Injector head broken out', detail: 'Drive chains removed; gripper-block carriers pulled; closed-loop hydraulic block isolated and lifted as sub-assembly', who: 'O. AL MAKTOUM', tool: 'Workshop' },
            { task: 'Accumulators removed', detail: '2× injector-head circuit accumulators dropped, isolated, depressurised through bleed valve and tagged for high-pressure bay', who: 'O. AL MAKTOUM', tool: 'Workshop' },
            { task: 'Dimensional inspection of gripper blocks', detail: 'Chain-wear faces both measured under-spec: 0.31 mm / 0.27 mm below OEM minimum dimension', who: 'QA', tool: 'Micrometer' },
          ],
        },
        {
          name: 'Phase 02 · Gripper-block re-face',
          rows: [
            { task: 'Master-block reference set up', detail: 'Indus master block for this injector family pulled from QA store, indicated against grinder chuck before either job block goes on', who: 'A. AL SUWAIDI', tool: 'Master' },
            { task: 'Surface-grind both gripper blocks', detail: 'Chain-wear contact faces restored in single set-up to OEM dimension ± 0.05 mm; finish to Ra ≤ 0.8 µm verified', who: 'A. AL SUWAIDI', tool: 'Surface grinder' },
            { task: 'Flatness & parallelism check', detail: 'Both blocks within 0.02 mm flatness and parallel within 0.03 mm across full chain-wear face', who: 'QA', tool: 'Granite plate' },
          ],
        },
        {
          name: 'Phase 03 · Accumulator change-out',
          rows: [
            { task: 'Strip both accumulators', detail: 'Old bladders removed, shells cleaned, all wetted ports inspected for pitting; both shells passed visual + dye-pen', who: 'O. AL MAKTOUM', tool: 'HP bay' },
            { task: 'Fit HNBR sour-service bladders', detail: 'New HNBR bladders rated to NACE MR0175 / ISO 15156 fitted, all O-rings replaced with FKM back-ups', who: 'O. AL MAKTOUM', tool: 'Bladder kit' },
            { task: 'Pre-charge with traceable N₂', detail: 'Both bottles charged to 1,000 psi N₂; bottle numbers logged against work order; 24 h decay check ≤ 1.5%', who: 'K. AL MARZOUQI', tool: 'N₂ rig' },
            { task: 'Hydrotest accumulator circuit', detail: '1.5× MAWP hydrotest on hydraulic side, 30 min hold, 0 bar drop on both units', who: 'QA', tool: 'Closed-loop rig' },
          ],
        },
        {
          name: 'Phase 04 · Control re-tune & reassembly',
          rows: [
            { task: 'Bench-tune closed-loop PID', detail: 'Hydraulic control on injector head tuned against calibrated load; response < 80 ms, steady-state error < 1% of setpoint', who: 'O. AL MAKTOUM', tool: 'Bench rig' },
            { task: 'Reassemble injector head', detail: 'Re-faced gripper blocks fitted, drive chains re-tensioned to OEM, control block reinstalled; torque sequence per OEM', who: 'O. AL MAKTOUM', tool: 'Torque wrench' },
            { task: 'Hydrotest full hydraulic circuit', detail: '1.5× MAWP across head and accumulator circuits, 30 min hold; leak-rate < 5 ml/min on entire skid', who: 'QA', tool: 'Closed-loop rig' },
          ],
        },
        {
          name: 'Phase 05 · Function-test & dispatch',
          rows: [
            { task: 'Push/pull cycle vs OEM script', detail: 'Push to depth target, pull at calibrated 60,000 lb load; 8 cycles run, force trace within 1% of setpoint throughout', who: 'QA', tool: 'OEM script' },
            { task: 'Gripper engage/disengage test', detail: 'Simulated kick-back load applied; gripper blocks held without slip across 12 engage/disengage cycles', who: 'QA', tool: 'Test rig' },
            { task: 'Accumulator dump test', detail: 'Both accumulators dumped against simulated pressure-loss event; recovery time and post-dump pre-charge logged', who: 'QA', tool: 'Test rig' },
            { task: 'Push/pull force calibration', detail: 'Calibrated at 3,000 psi delivered hydraulic pressure; force certificate issued and bound into sign-off pack', who: 'H. AL AWADI', tool: 'Cert' },
            { task: 'Sign-off pack issued', detail: '38 pp · OEM commissioning trace, NACE certs, N₂ traceability, hydrotest curves, photos × 32', who: 'H. AL AWADI', tool: 'PDF + paper' },
            { task: 'Skid loaded onto low-bed', detail: 'Wrapped, strapped, and dispatched on Day 5 morning for same-week return to wellsite', who: 'K. AL MARZOUQI', tool: 'Dispatch' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The numbers, before and after.'),
    para(
      'Below is what we measured against OEM commissioning tolerance. Four findings would have failed an Aramco vendor audit. All four were corrected in Phase 02 and 03; the function test in Phase 05 confirmed they stayed corrected.',
    ),
    specTable(
      'FINDINGS · CT-INJ-80K · SERIAL CTI-80-1144 · SOUR SERVICE',
      [
        {
          component: 'Gripper-block chain-wear face (LH)',
          spec: 'OEM dimension ± 0.05 mm',
          asFound: '−0.31 mm under spec',
          afterRebuild: '+0.02 mm vs OEM',
          status: '↻ Re-faced, master-checked',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Gripper-block chain-wear face (RH)',
          spec: 'OEM dimension ± 0.05 mm',
          asFound: '−0.27 mm under spec',
          afterRebuild: '+0.01 mm vs OEM',
          status: '↻ Re-faced, master-checked',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Chain-wear face surface finish',
          spec: 'Ra ≤ 0.8 µm',
          asFound: 'Ra 2.1 µm (galled)',
          afterRebuild: 'Ra 0.6 µm',
          status: '↻ Ground in single set-up',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Chain-block flatness',
          spec: '≤ 0.03 mm across face',
          asFound: '0.11 mm (worn unevenly)',
          afterRebuild: '0.02 mm',
          status: '↻ Restored',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator A — N₂ pre-charge',
          spec: '1,000 psi · ≤ 6 mo',
          asFound: '0 psi · bladder ruptured',
          afterRebuild: '1,000 psi · bottle traced',
          status: '↻ Re-bladdered (HNBR)',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator B — N₂ pre-charge',
          spec: '1,000 psi · ≤ 6 mo',
          asFound: '620 psi · bladder perished',
          afterRebuild: '1,000 psi · bottle traced',
          status: '↻ Re-bladdered (HNBR)',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Bladder elastomer',
          spec: 'NACE HNBR · sour-service',
          asFound: 'Standard NBR (out of spec)',
          afterRebuild: 'HNBR · MR0175',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Closed-loop response time',
          spec: '< 100 ms to 90% setpoint',
          asFound: '180 ms (drifted)',
          afterRebuild: '74 ms',
          status: '↻ PID re-tuned',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Closed-loop steady-state error',
          spec: '< 1% of setpoint',
          asFound: '3.2% (low side)',
          afterRebuild: '0.6%',
          status: '↻ PID re-tuned',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Push/pull force at 3,000 psi',
          spec: 'OEM curve · ± 2%',
          asFound: 'Off curve below 50 klb',
          afterRebuild: 'On curve · 8 cycles',
          status: '✓ Calibrated',
          afterStyle: 'good',
        },
        {
          component: 'Full-skid hydrotest',
          spec: '1.5× MAWP · 30 min hold',
          asFound: '—',
          afterRebuild: '0 bar drop, < 5 ml/min',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Function test vs OEM script',
          spec: 'All steps pass',
          asFound: '—',
          afterRebuild: '24 / 24 steps pass',
          status: '✓ Pass',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Skid back on location, slot held.'),
    para(
      'The skid left our Jebel Ali yard on Day 5 at 09:20 GST, cleared the Saudi border the same evening and was on location at the wellhead by Day 6 afternoon. The CT contractor met their Day 7 slot. The closed-loop hydraulic test was run end-to-end against the OEM commissioning sequence with the contractor\'s own QA on the line for the witness. Both gripper blocks, both accumulators and the re-tuned hydraulic control are covered under a single 6-month assembled-system warranty — not just parts. Aramco vendor sign-off cleared on the same paperwork.',
    ),
    resultBox(
      'Result · summary',
      'Sour-service CT injector skid stripped, re-faced, re-bladdered, re-tuned and function-tested in five days — slot held, contractor on location.',
      'Delivered inside the contractor\'s 7-day window with two days of margin to spare. Full OEM commissioning script ticked off, NACE certs on every wetted elastomer, traceable N₂ on both accumulators. Both gripper blocks restored to OEM dimension with Ra ≤ 0.8 µm finish. Closed-loop control re-tuned to < 80 ms response and < 1% steady-state error.',
      [
        { value: '5', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
        { value: '24 / 24', label: 'OEM commissioning steps', style: 'good' },
        { value: '2 / 2', label: 'Accumulators re-bladdered', style: 'good' },
        { value: '6', valueSmall: ' mo', label: 'System warranty' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the job.'),
    teamList(
      'Five engineers in Jebel Ali logged time against this work order across 90 hours of bench time. The strip-down on Day 0 ran into the night; the function test on Day 4 ran into Day 5 morning. If you call the JAFZA yard and ask about case 05, any of them can pull the file.',
      [
        {
          name: 'Khalid Al Marzouqi',
          role: 'Emergency Response Field Lead',
          location: 'Jebel Ali',
          scope: 'Intake, customer liaison through the 5 days, accumulator N₂ traceability, dispatch and low-bed sign-off.',
        },
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope: 'Bay 5 scheduling, parallel-tracking the gripper-block, accumulator and control-loop work to compress the 5-day window.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Lead Hydraulics Technician',
          location: 'Jebel Ali',
          scope: 'Injector head strip and rebuild, accumulator change-out, closed-loop PID re-tune against calibrated load, full-skid hydrotest.',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'Machinist',
          location: 'Jebel Ali',
          scope: 'Surface-grinding both gripper blocks back to OEM dimension in a single set-up, master-block reference, flatness verification.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'QA',
          location: 'Jebel Ali',
          scope: 'Dimensional inspection, NACE MR0175 sign-off on bladder elastomers, OEM commissioning function test, sign-off pack.',
        },
      ],
      'Case file · INTAKE-2026-03-184 · WO-2026-1142 · Published 2026-04-02 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'Five days end to end. Strip on Wednesday night, OEM commissioning script ticked off Sunday evening, low-bed Monday morning. The chain was the symptom — the head was the patient.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Workshop Manager · Jebel Ali',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'CT-INJ-80K' },
    { label: 'Service', value: 'Sour gas' },
    { label: 'Gripper blocks', value: '2 × re-faced' },
    { label: 'Accumulators', value: '2 × HNBR' },
    { label: 'Pre-charge', value: '1,000 psi N₂' },
    { label: 'Hydrotest', value: '1.5× MAWP' },
    { label: 'Standard', value: 'NACE MR0175' },
    { label: 'TAT', value: '5 days' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '18 pp', format: 'PDF' },
    { label: 'OEM commissioning trace (XLSX)', url: '#', size: '24 steps', format: 'XLSX' },
    { label: 'NACE & N₂ certs (ZIP)', url: '#', size: '8 MB', format: 'ZIP' },
    { label: 'Sign-off pack (PDF)', url: '#', size: '38 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-03-184 · WO-2026-1142 · Published 2026-04-02 · Updated 2026-05-09',

  cardOneLiner:
    'A CT injector skid was pulled mid-job from a sour Aramco well with chain-block slip and a dead accumulator. We stripped, re-faced, re-bladdered, re-tuned and function-tested it in 5 days — back on location for the same-week return slot.',
  cardOutcomePills: [
    { label: '5-day turnaround · slot held', style: 'good' },
    { label: 'OEM commissioning · 24/24', style: 'neutral' },
    { label: 'Same-week return', style: 'accent' },
  ],
  cardDurationLabel: '5 D EMERGENCY',
  cardTagStyle: 'oil',
  cardTagLabel: 'CT & WIRELINE',

  durationDays: 5,

  seoTitle:
    'Coiled-tubing injector skid — emergency 5-day repair on a sour Saudi Aramco well · Indus Hydraulics Jebel Ali',
  seoDescription:
    'A CT contractor pulled an 80K injector skid mid-job from a sour-gas well in the Eastern Province with chain-block slip and a failed accumulator. Indus stripped, re-faced both gripper blocks to OEM dimension, re-bladdered both accumulators with HNBR, re-tuned the closed-loop hydraulic control and function-tested against OEM commissioning in 5 days — same-week return slot held.',
  focusKeyword: 'coiled tubing injector emergency repair sour service Jebel Ali',
}

export default CASE
