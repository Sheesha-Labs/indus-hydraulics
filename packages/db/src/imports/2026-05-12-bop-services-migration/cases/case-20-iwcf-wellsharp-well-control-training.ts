/**
 * Case 20 — IWCF / IADC WellSharp Well Control Training (Levels 2-4)
 * 2026-05-12 (BOP services migration wave)
 *
 * IWCF and IADC WellSharp accredited well-control certification delivered from
 * the Indus Dubai training centre. Monthly open-enrolment courses across the
 * Drilling Well Control progression (Roughneck / Driller / Supervisor) and the
 * Well Intervention Pressure Control track (CT / Snubbing / Wireline), plus
 * 2-year recertification refreshers and bulk corporate enrolment for ADNOC
 * Drilling, Aramco and KDC crews.
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
} from '../../2026-05-11-service-cases-launch/shared'

const CASE: ServiceCaseSeed = {
  slug: 'iwcf-iadc-wellsharp-well-control-training-levels-2-4',
  caseNumber: '20',
  isFeatured: false,
  category: 'field_service',
  topicLabel: 'Field Service · Well Control Training · Certification',
  region: '🇦🇪 UAE · Dubai training centre',
  caseDateLabel: 'MONTHLY OPEN COURSES · BULK ENROLMENT',
  title: 'IWCF and IADC WellSharp well-control certification — the cards Aramco asks for, taught by people who have closed a real BOP under a real kick.',
  titleAccent: 'taught by people who have closed a real BOP under a real kick',
  deck: 'Indus is an IWCF and IADC WellSharp accredited training provider running the full well-control certification ladder out of our Dubai centre. Drilling Well Control Levels 2-4 — Roughneck through Supervisor. Well Intervention Pressure Control across CT, Snubbing and Wireline. Open-enrolment courses every month, bulk corporate intakes of 15+ candidates at the centre or on-rig anywhere in the GCC, and the 2-year recertification refresher that keeps cards live.',

  heroImageCaption: 'FIG. 01 · IWCF Supervisor cohort on the drilling simulator suite, Dubai training centre — kick recognition exercise, day 4 of 5',
  heroImageCredit: 'PHOTO · A. AL SUWAIDI · 2026-04-22',

  metaCells: [
    { label: 'Accreditation', value: 'IWCF', valueSmall: ' + IADC WellSharp', style: 'neutral' },
    { label: 'Levels', value: '2 — 4', valueSmall: ' · Roughneck → Supervisor', style: 'neutral' },
    { label: 'Recert cycle', value: '2', valueSmall: ' yr', style: 'neutral' },
    { label: 'Course length', value: '2 — 5', valueSmall: ' D / level', style: 'accent' },
    { label: 'Languages', value: 'EN / AR', valueSmall: ' · on request', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'The card on the wall is the difference between the rig running and the rig stood down.'),
    lead(
      'A drilling supervisor without a current IWCF or IADC WellSharp certificate cannot stand the chair on a rig in this region. <strong>Aramco wants Assistant Drillers carrying supervisor-level certs</strong>; ADNOC Drilling and KDC procure training in bulk; the IWCF 2-year clock runs whether the candidate is on hitch or off. When the card lapses, the seat empties. That is the operational picture every drilling contractor in the GCC manages around — and it is the reason a training programme has to run on time, every month, and certify cleanly the first time.',
    ),
    para(
      'Operators do not call us because well-control training is exotic. They call us because the alternative — sending crews to Aberdeen, Houston or Singapore for two weeks — costs flight, hotel, hitch overlap and a translation problem. <strong>An IWCF Supervisor course on a candidate from Iraq south or KSA fails when the simulator exam is run in technical English the candidate cannot follow under pressure</strong>. We run it in Dubai, on a UAE-time clock, with bilingual delivery on request, and the candidate is back on the rig the following Sunday with a wallet card that opens the gate.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Twelve Drillers and four Assistant Drillers due for IWCF recert next quarter."',
        body: 'A typical bulk-enrolment brief from an ADNOC Drilling rig manager. Recerts due, hitch rotations to plan around, two of the candidates from Iraq south needing Arabic-language delivery on the simulator exam. Open-enrolment slots not aligned with the rotation. Operator wants a single intake, one PO, all certs issued before the cards go red.',
      },
      {
        label: 'What the audit requirement actually says',
        title: 'IWCF Supervisor + simulator exam, every 2 years, no exceptions.',
        body: 'IWCF Drilling Well Control Level 4 (Supervisor) requires a 5-day course plus a simulator exam against the IWCF question bank. The 2-year recertification cycle is non-negotiable per the IWCF programme rules. Aramco SAEP-1142 lifts the bar further: Assistant Drillers must hold supervisor-level certification, not just driller-level. One missed cert window and the seat goes empty.',
      },
    ),
    para(
      'That gap — between the certification calendar the standard demands and the rig rotation the operator actually runs — is the gap a regional accredited training centre fills. <strong>We exist so the cards stay current and the rigs stay manned.</strong> The rest of this page is what we deliver, how we deliver it, and what the candidate walks away with.',
    ),

    sectionHead('/02', 'solution', 'The full IWCF and IADC WellSharp ladder, run on a monthly clock from Dubai.'),
    para(
      'Indus is dual-accredited: <strong>IWCF (International Well Control Forum)</strong> for the Drilling Well Control and Well Intervention Pressure Control programmes, and <strong>IADC WellSharp</strong> for the Driller and Supervisor tracks that operators in the region also recognise. Course inventory: <strong>IWCF Drilling Well Control Levels 2 / 3 / 4</strong> (Roughneck-Roustabout 2 days, Driller 4 days plus simulator, Supervisor 5 days plus simulator); <strong>IWCF Well Intervention Pressure Control</strong> across the CT, Snubbing and Wireline tracks at Levels 2 / 3 / 4; <strong>IADC WellSharp Driller and Supervisor</strong> certifications on equivalent durations; and the <strong>2-year recertification refresher</strong> for any candidate already inside the cycle.',
    ),
    para(
      'Two delivery models. <strong>Open-enrolment courses run every month</strong> at the Dubai training centre — published schedule, single-candidate booking, classroom plus full drilling simulator suite, exam day on the last day of the course. <strong>Bulk corporate enrolment from 15 candidates</strong> can be run at the Dubai centre on a private cohort schedule or delivered on-rig anywhere in the GCC where the rig has a suitable training cabin. Bilingual delivery in English and Arabic is available on request — relevant for crews out of KSA, Iraq south, Oman and parts of the UAE — and lifts the simulator-exam pass rate noticeably for native Arabic speakers being asked to interpret a kick scenario under time pressure.',
    ),
    figure(
      'Drilling simulator console during an IWCF Supervisor exam — full BOP stack representation, choke-and-kill manifold, kill-sheet calculation under live well-bore pressure response.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Drilling simulator console with full BOP stack and choke manifold representation\\n1200×675"',
      },
    ),
    pullQuote(
      'A good well-control crew and a certified well-control crew are not the same crew. The card is the start. The simulator hours, the kill-sheet drills, the kick recognition under noise — that is what means the difference between a card and a Driller who can actually shut a well in.',
      '— Khalid Al Marzouqi · Lead Instructor (IWCF Level 4 + Master Trainer) · Dubai',
    ),

    sectionHead('/03', 'approach', 'Four phases, every cohort, every month.'),
    para(
      'A monthly training cycle is not a thing you improvise. It is a procedure, run on a calendar, with checkpoints at every step. We run every cohort through the same four phases — open-enrolment singles and 30-candidate corporate intakes alike.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Enrolment & pre-course',
        body: 'Candidate roster confirmed against the operator PO or open-enrolment booking. Pre-course materials issued in EN or AR. Visa / training-centre access confirmed for non-UAE candidates. Hitch rotation cross-checked.',
        duration: 'T-21 to T-3 days',
      },
      {
        number: 'PHASE 02',
        title: 'Classroom delivery',
        body: 'Theory days run by a master trainer to the IWCF or WellSharp curriculum. Kick recognition, well-control principles, BOP stack architecture, choke-and-kill manifold, kill-sheet methodology, regulatory framework.',
        duration: 'Days 1 — 3',
      },
      {
        number: 'PHASE 03',
        title: 'Simulator drills & exam',
        body: 'Full drilling simulator suite. Live kick scenarios under instructor control, kill-sheet against real-time pressure response, BOP function drills. Final day: simulator exam against the IWCF question bank.',
        duration: 'Days 3 — 5',
      },
      {
        number: 'PHASE 04',
        title: 'Certification & dispatch',
        body: 'Exam result report issued same day. IWCF or WellSharp certificate (digital + hard copy) inside 5 working days. Wallet card with cert number and 2-year expiry. Renewal reminder added to the operator account calendar.',
        duration: 'Day 5 + 5 D',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard procedure we run on every cohort.'),
    para(
      'Below is the abridged version of the cohort-delivery SOP. The full document covers candidate vetting, instructor rotation, simulator booking, exam-paper handling and certificate issue against IWCF audit requirements. This is the part you would see if you sat in on a course.',
    ),
    sopBlock(
      'SOP-OG-101 · IWCF / WELLSHARP COHORT DELIVERY · REV 06 · ACCREDITED',
      '18 / 18 COMPLETE',
      [
        {
          name: 'Phase 01 · Enrolment & pre-course',
          rows: [
            { task: 'Operator PO or open-enrolment intake', detail: 'Roster matched against course slot; level confirmed (Roughneck / Driller / Supervisor); cert history pulled', who: 'H. AL AWADI', tool: 'IWCF portal' },
            { task: 'Language preference confirmation', detail: 'EN default; AR delivery requested per candidate; bilingual instructor assigned where needed', who: 'F. AL MANSOORI', tool: 'Cohort log' },
            { task: 'Pre-course pack issued', detail: 'IWCF or WellSharp reference manual, kill-sheet template, calculator policy, agenda, dress code', who: 'H. AL AWADI', tool: 'Email + LMS' },
            { task: 'Centre access & visa check', detail: 'Non-UAE candidates: visa, hotel, transfer; UAE candidates: gate-pass and PPE confirmation', who: 'Y. AL HASHIMI', tool: 'Ops sheet' },
          ],
        },
        {
          name: 'Phase 02 · Classroom delivery',
          rows: [
            { task: 'Day 1 · Well-control fundamentals', detail: 'Hydrostatics, formation pressure, kick indicators, BOP stack architecture per API 16A', who: 'K. AL MARZOUQI', tool: 'Classroom A' },
            { task: 'Day 2 · Kill methods & calculations', detail: "Driller's method, Wait-and-Weight, kill-sheet construction, ICP / FCP, choke schedule", who: 'K. AL MARZOUQI', tool: 'Classroom A' },
            { task: 'Day 3 · Equipment & regulatory', detail: 'Choke-and-kill manifold per API 16C, control units per API 16D, API STD 53 testing regime', who: 'K. AL MARZOUQI', tool: 'Classroom A' },
            { task: 'Continuous assessment', detail: 'Daily knowledge checks; weak areas flagged for one-on-one before simulator drills', who: 'K. AL MARZOUQI', tool: 'Assessment log' },
          ],
        },
        {
          name: 'Phase 03 · Simulator drills & exam',
          rows: [
            { task: 'Simulator induction', detail: 'Console layout, BOP stack representation, choke panel, kill-sheet display, scenario controls', who: 'A. AL SUWAIDI', tool: 'Simulator suite' },
            { task: 'Live kick scenarios · supervised', detail: 'Multiple kick types under instructor control; kill-sheet, BOP closure, choke schedule executed live', who: 'K. AL MARZOUQI', tool: 'Simulator suite' },
            { task: 'Pre-exam dry runs', detail: 'Each candidate runs an unscored exam-equivalent scenario; gaps closed before live exam', who: 'A. AL SUWAIDI', tool: 'Simulator suite' },
            { task: 'Final simulator exam', detail: 'IWCF / WellSharp exam against question bank; supervised, timed, scored against pass threshold', who: 'A. AL SUWAIDI', tool: 'Exam protocol' },
            { task: 'Result reconciliation', detail: 'Scores reconciled with written assessment; pass / refer / fail flagged per candidate', who: 'A. AL SUWAIDI', tool: 'IWCF portal' },
          ],
        },
        {
          name: 'Phase 04 · Certification & dispatch',
          rows: [
            { task: 'Same-day result report', detail: 'Each candidate gets a one-page exam report; corporate sponsor gets the cohort summary same day', who: 'F. AL MANSOORI', tool: 'PDF + email' },
            { task: 'Certificate issue · digital + hard', detail: 'IWCF or WellSharp certificate generated against accreditation portal; PDF + posted hard copy', who: 'F. AL MANSOORI', tool: 'IWCF portal' },
            { task: 'Wallet card production', detail: 'Cert number, candidate photo, validity date; couriered with the hard-copy certificate', who: 'H. AL AWADI', tool: 'Card printer' },
            { task: 'Renewal calendar entry', detail: '2-year recert reminder added to the operator account calendar; T-90 day notice scheduled', who: 'H. AL AWADI', tool: 'CRM' },
            { task: 'Refer / fail follow-up', detail: 'Candidates referred for one section: re-sit slot booked at no charge inside 30 days', who: 'F. AL MANSOORI', tool: 'CRM' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What a typical IWCF / WellSharp cohort looks like.'),
    para(
      'Below is the typical-cohort profile from the last twelve months of training out of the Dubai centre — open-enrolment singles aggregated, plus the median bulk-enrolment intake. Use it as a rough guide; the actual mix per cohort depends on operator demand and the calendar.',
    ),
    specTable(
      'TYPICAL FINDINGS · DUBAI TRAINING CENTRE · IWCF + IADC WELLSHARP · BULK + OPEN INTAKE',
      [
        {
          component: 'IWCF Drilling WC Level 4 (Supervisor)',
          spec: '5 D + simulator exam',
          asFound: 'Most-requested level',
          afterRebuild: '~40% of monthly seats',
          status: '✓ Monthly slot',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'IWCF Drilling WC Level 3 (Driller)',
          spec: '4 D + simulator exam',
          asFound: 'Steady demand',
          afterRebuild: '~30% of monthly seats',
          status: '✓ Monthly slot',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'IWCF Drilling WC Level 2 (Roughneck)',
          spec: '2 D classroom only',
          asFound: 'New-hire pipeline',
          afterRebuild: '~15% of monthly seats',
          status: '✓ Monthly slot',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'WIPC tracks · CT / Snubbing / Wireline',
          spec: 'Levels 2 / 3 / 4',
          asFound: 'Specialist intake',
          afterRebuild: 'Quarterly + on-demand',
          status: '✓ Scheduled',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'IADC WellSharp Driller + Supervisor',
          spec: 'Equivalent durations',
          asFound: 'Operator-driven',
          afterRebuild: 'Monthly + private cohorts',
          status: '✓ Scheduled',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: '2-year recertification refresher',
          spec: 'Per IWCF programme rules',
          asFound: 'Largest single segment',
          afterRebuild: 'Open + bulk delivery',
          status: '✓ Continuous',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bulk corporate enrolment',
          spec: '≥ 15 candidates / cohort',
          asFound: 'ADNOC Drilling, KDC, Aramco contractors',
          afterRebuild: 'Dubai centre or on-rig GCC',
          status: '✓ PO-driven',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bilingual delivery (EN / AR)',
          spec: 'Arabic on request',
          asFound: 'KSA, Iraq south, Oman crews',
          afterRebuild: 'Bilingual instructor + paper',
          status: '✓ On request',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Simulator exam first-time pass',
          spec: 'IWCF / WellSharp threshold',
          asFound: 'Cohort dependent',
          afterRebuild: '~92% across last 12 mo',
          status: '✓ Above region avg',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Cert issue · digital + hard copy',
          spec: 'Inside 5 working days',
          asFound: 'IWCF portal + courier',
          afterRebuild: 'Wallet card included',
          status: '✓ Per programme',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What the candidate, the rig manager and the auditor each walk away with.'),
    para(
      'For the candidate: an IWCF or IADC WellSharp certificate they can produce on a gate, an exam report with their actual score, course materials and a reference manual to take back to the rig, a wallet card with the cert number and the expiry date. For the rig manager: a cohort report with every candidate listed, every score recorded, and the renewal date scheduled into the operator account calendar so the next cycle does not catch the rotation off-guard. For the auditor: a paper trail that maps to the IWCF or WellSharp accreditation requirement, line by line. That is what an accredited course is for.',
    ),
    resultBox(
      'Result · summary',
      'Monthly IWCF and IADC WellSharp certification — Roughneck through Supervisor, on time, EN or AR, with the simulator hours that turn the card into a working competency.',
      'Open-enrolment courses every month at the Dubai training centre. Bulk corporate cohorts of 15+ candidates at the centre or on-rig anywhere in the GCC. 2-year recertification refresher for candidates already in the cycle. Per-candidate deliverables: certificate (digital + hard), simulator exam report, course materials, wallet card with expiry, renewal calendar entry against the operator account. Bilingual delivery on request.',
      [
        { value: '5', valueSmall: ' D / Supervisor', label: 'Course length', style: 'accent' },
        { value: '2', valueSmall: ' yr', label: 'Recert cycle', style: 'good' },
        { value: '~92', valueSmall: ' %', label: 'Sim-exam first-time pass', style: 'good' },
        { value: '15 +', label: 'Bulk-cohort min' },
      ],
    ),

    sectionHead('/07', 'team', 'The instructors and the centre crew.'),
    teamList(
      'A well-control training centre is its instructors. Below is the standing crew at the Dubai centre — five names, all in Dubai, all reachable through the centre line. Bulk-enrolment customers usually deal with one of them by the end of the first cohort.',
      [
        { name: 'Fatima Al Mansoori', role: 'Training Centre Director', location: 'Dubai', scope: 'Accreditation owner against IWCF and IADC WellSharp; signs every certificate; owns the audit relationship.' },
        { name: 'Khalid Al Marzouqi', role: 'Lead Instructor · IWCF Level 4 + Master Trainer', location: 'Dubai', scope: 'Delivers the Supervisor and Driller classroom days; runs the live simulator drills; the voice on most pull-quotes.' },
        { name: 'Yusuf Al Hashimi', role: 'Training Operations Manager', location: 'Dubai', scope: 'Owns the monthly schedule, instructor rotation, simulator booking and the on-rig deployment kit for off-centre cohorts.' },
        { name: 'Aisha Al Suwaidi', role: 'Simulator Exam Coordinator', location: 'Dubai', scope: 'Runs the simulator suite, supervises every IWCF / WellSharp exam, reconciles scores against the question bank.' },
        { name: 'Hassan Al Awadi', role: 'Bulk Enrolment Liaison', location: 'Dubai', scope: 'Single point of contact for ADNOC Drilling, KDC, Aramco contractor cohorts. Handles roster, certs, wallet cards, renewals.' },
      ],
      'Programme file · TRG-OG-IWCF-2026 · Centre code IND-DXB-001 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: 'Cohort due for IWCF or WellSharp recert this quarter?',
  ctaCardBody: 'Send the candidate roster, the levels each candidate needs, and the rotation window. The Dubai training centre will return a cohort plan with course dates, language and exam slots inside 24 h.',
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'Holding the card and being able to shut a well in are not the same skill. Our job is to teach the second one and certify the first. The simulator hours are where one becomes the other.',
  pullQuoteAuthor: 'Khalid Al Marzouqi',
  pullQuoteRole: 'Lead Instructor (IWCF Level 4 + Master Trainer)',
  pullQuoteLocation: 'DUBAI',

  specsAtGlance: [
    { label: 'Accreditation', value: 'IWCF + IADC WellSharp' },
    { label: 'Drilling WC levels', value: '2 / 3 / 4 (Roughneck → Supervisor)' },
    { label: 'WIPC tracks', value: 'CT / Snubbing / Wireline · Lvl 2-4' },
    { label: 'Supervisor course', value: '5 D + simulator exam' },
    { label: 'Driller course', value: '4 D + simulator exam' },
    { label: 'Roughneck course', value: '2 D classroom' },
    { label: 'Recertification cycle', value: '2 years' },
    { label: 'Open-enrolment schedule', value: 'Monthly · Dubai centre' },
    { label: 'Bulk-cohort minimum', value: '15 candidates' },
    { label: 'Languages', value: 'English / Arabic on request' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Course catalogue 2026 (PDF)', url: '#', size: '24 pp', format: 'PDF' },
    { label: 'Open-enrolment monthly schedule (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'Bulk corporate enrolment guide (PDF)', url: '#', size: '12 pp', format: 'PDF' },
    { label: 'IWCF + WellSharp accreditation evidence (ZIP)', url: '#', size: '8 MB', format: 'ZIP' },
  ],
  caseFileMeta: 'Programme file · TRG-OG-IWCF-2026 · Centre code IND-DXB-001 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'IWCF and IADC WellSharp accredited well-control certification from the Dubai training centre. Drilling Well Control Levels 2-4, WIPC tracks (CT / Snubbing / Wireline), 2-year recerts. Monthly open enrolment plus 15+ candidate bulk cohorts at the centre or on-rig anywhere in the GCC. Bilingual EN / AR on request.',
  cardOutcomePills: [
    { label: 'IWCF + IADC WellSharp accredited', style: 'good' },
    { label: 'Aramco-spec supervisor cert', style: 'accent' },
    { label: 'Bilingual EN / AR on request', style: 'neutral' },
    { label: 'Monthly open enrolment', style: 'neutral' },
  ],
  cardDurationLabel: '2-5 D / COURSE',
  cardTagStyle: 'oil',
  cardTagLabel: 'IWCF TRAINING',

  durationDays: 5,

  seoTitle: 'IWCF + IADC WellSharp Well Control Training · Levels 2-4 · Dubai Training Centre · Indus Hydraulics',
  seoDescription: 'IWCF and IADC WellSharp accredited well-control certification from the Indus Dubai training centre. Drilling Well Control Levels 2-4 (Roughneck / Driller / Supervisor), Well Intervention Pressure Control (CT / Snubbing / Wireline), 2-year recertification. Monthly open enrolment plus 15+ candidate bulk corporate cohorts at the centre or on-rig across the GCC. Bilingual English / Arabic delivery on request for KSA, Iraq south and Oman crews. Aramco-spec supervisor certification, ADNOC Drilling and KDC bulk-enrolment provider.',
  focusKeyword: 'IWCF IADC WellSharp well control training Dubai supervisor certification',
}

export default CASE
