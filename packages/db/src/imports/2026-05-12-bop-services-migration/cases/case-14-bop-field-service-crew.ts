/**
 * Case 14 — BOP Field Service Crew · H₂S-trained · Day-Rate · 24×7 Dispatch
 * 2026-05-12 (BOP services migration wave)
 *
 * Day-rate BOP field service crew out of Jebel Ali — H₂S-trained, IWCF Level 4,
 * IADC WellSharp certified, mobilising to land rigs across the GCC inside
 * 48-72 hours (24 h on emergency call). Typical crew: 1 supervisor + 2
 * technicians, full sour-service PPE, tooling and certification stack to
 * meet Aramco SAEP-1142, ADNOC SPC and the major operator vendor lists.
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
  slug: 'bop-field-service-crew-h2s-trained-day-rate',
  caseNumber: '14',
  isFeatured: false,
  category: 'field_service',
  topicLabel: 'Field Service · BOP Crew · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali · GCC-wide dispatch',
  caseDateLabel: 'DAY-RATE · 24×7 DISPATCH',
  title: 'A BOP field service crew on day-rate — IWCF cards, H₂S certs, and a truck rolling out of Jebel Ali in 48 hours.',
  titleAccent: 'a truck rolling out of Jebel Ali in 48 hours',
  deck: 'Indus runs a stationed BOP field service crew out of Jebel Ali. H₂S-trained to current OPITO, IWCF Level 4 well-control cards, IADC WellSharp Supervisor, SAEP-1142 NDT-equivalent, HUET for offshore mobilisation. Day-rate billing, 48-72 hour standard dispatch, 24-hour emergency response, long-term contracts placing a crew on the rig for 30+ day campaigns.',

  heroImageCaption: 'FIG. 01 · Day-rate BOP crew on a land rig — supervisor and two techs running a function test on a 13-5/8" stack',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-04-19',

  metaCells: [
    { label: 'Crew', value: '1 + 2', valueSmall: ' · Supv + Techs', style: 'neutral' },
    { label: 'Dispatch', value: '48 — 72', valueSmall: ' h · standard', style: 'neutral' },
    { label: 'Emergency', value: '24', valueSmall: ' h · call-out', style: 'accent' },
    { label: 'Well control', value: 'IWCF L4', valueSmall: ' · WellSharp', style: 'good' },
    { label: 'Sour service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'The gap between "we\'ll send someone" and a crew on the rig.'),
    lead(
      'Every land-rig contractor in the Gulf has the same problem at 03:00 on a Tuesday morning. The BOP needs a function test before the next casing run, the rig\'s own crew don\'t carry IWCF Level 4 cards, the operator company-man wants <strong>SAEP-1142-equivalent</strong> documentation on every signature, and the nearest service vendor says they can have someone there "in a few days." A few days is not a number you can put in a tour report. The well is waiting on the BOP and the BOP is waiting on a crew.',
    ),
    para(
      'The class of problem operators bring us is rarely about the BOP itself. It\'s about the certification stack, the mobilisation time, and the paperwork. Aramco won\'t accept a function-test record signed by anyone without the right cards. ADNOC Drilling won\'t put a crew on the rig without HUET, H₂S Awareness + Escape, and a current operator vendor-list entry. KOC, PDO, QatarEnergy and BAPCO each have their own pre-mobilisation checklist that takes a week to clear if you\'re starting from cold. The work itself — function test, ram change, redress — is well-defined. Getting a crew that can legally do it on that rig, on that day, is the bottleneck.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"We need a BOP crew on the rig by Friday."',
        body: 'Function test due before next casing run. Rig contractor\'s own crew not IWCF carded for the supervisor signature. Operator company-man requires SAEP-1142-equivalent NDT documentation on every replaced part. The vendor on the previous well needed five working days to mobilise. The casing run cannot wait five days.',
      },
      {
        label: 'What we put on the rig',
        title: 'Crew of three on a low-loader inside 48 hours, all paperwork pre-cleared',
        body: 'One supervisor (IWCF Level 4 + IADC WellSharp Supervisor), two technicians (IWCF Level 2 + SAEP-1142 trained). All H₂S Awareness + Escape current, HUET in date for the supervisor. Operator vendor-list entry already on file for ADNOC, ADNOC Drilling, ADNOC Offshore, Aramco, KOC, PDO and QatarEnergy. Tooling and PPE on the truck.',
      },
    ),
    para(
      'This is the case for keeping a stationed crew at Jebel Ali rather than scrambling per-job contractors. The certifications, the operator vendor-list approvals, the tooling box, the relationship with the company-man on the rig — none of those things rebuild themselves on every call-out. <strong>You either have the crew or you don\'t.</strong>',
    ),

    sectionHead('/02', 'solution', 'A day-rate crew, the certification stack, and the tooling box.'),
    para(
      'The standard offering is a three-person crew on day-rate: one <strong>BOP Field Crew Supervisor</strong> (IWCF Well Intervention + Drilling Well Control Level 4, IADC WellSharp Supervisor, HUET, H₂S, SAEP-1142 NDT-equivalent, OPITO emergency) plus two <strong>Senior BOP Technicians</strong> (IWCF Level 2-3, WellSharp Workover, H₂S Awareness + Escape, full sour-service PPE issue). Crew composition scales — for a heavy nipple-up or a stack handler operation we add the BOP Stack Handler Operator. For long campaigns (30+ days) we station a crew at the rig and rotate on a 28-day cycle. Day-rate billing covers the crew, all certifications, IWCF / WellSharp re-cert renewals, all PPE consumables, and on-rig vehicle.',
    ),
    para(
      'Scope on a typical rig engagement: <strong>BOP nipple-up support</strong> (wellhead-to-BOP stack make-up, flange torquing per <strong>API 6A</strong>), <strong>API STD 53</strong> function-test execution with chart-recorder operation, leak diagnosis and on-rig troubleshooting, ram-block change-out on the operator\'s schedule, field redress (bonnet-open elastomer replacement, hub-face inspection, wear-ring renewal), BOP stack handler operation (hydraulic stack handler / bridge crane), pressure-test execution to <strong>1.5× MAWP</strong> with chart records, and on-rig training of operator personnel where contractually required. Every job ends with a <strong>daily field service report</strong>: hours-on-job breakdown, function-test records, replaced-parts traceability log, on-rig hand-over sign-off from the operator company-man, end-of-job summary.',
    ),
    figure(
      'Day 2 of a 30-day campaign · ADNOC Drilling rig in the Western Region. Supervisor on the chart-recorder, tech on the closing-time stopwatch, second tech inside the substructure on the BOP control panel. This is what a function test looks like when the paperwork has been pre-cleared.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"BOP field crew running API STD 53 function test on land rig, supervisor with chart recorder\\n1200×675"',
      },
    ),
    pullQuote(
      'There\'s a difference between "we\'ll send someone" and "your crew will be on the rig in 48 hours with H₂S certification, IWCF Level 4 cards and the right tooling on the truck." Every operator in the Gulf knows the difference. We\'ve built our whole field service offering around the second one.',
      '— Khalid Al Marzouqi · Field Crew Supervisor (IWCF L4) · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, every engagement, day one to demob.'),
    para(
      'Whether the call-out is a single function-test day or a 30-day stationed campaign, every engagement runs the same four-phase pattern. The phases scale; the structure does not change.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Mobilisation & pre-job',
        body: 'Operator vendor-list entry confirmed. Crew certifications cross-checked against the operator\'s pre-mobilisation matrix. PPE issued, tooling box loaded, low-loader dispatched. Supervisor on the rig for pre-tour brief.',
        duration: 'Day 0 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'On-rig execution',
        body: 'Function test, nipple-up, ram change, redress or troubleshooting per the work scope. Every action chart-recorded, every torque logged, every replaced part traceability-tagged. Supervisor counter-signs all records.',
        duration: 'Day 2 — N',
      },
      {
        number: 'PHASE 03',
        title: 'Documentation & hand-over',
        body: 'Daily field service report compiled: hours-on-job, function-test records, replaced-parts log, photo evidence. Operator company-man signature on every shift hand-over. End-of-job summary on the company-man\'s desk.',
        duration: 'Daily',
      },
      {
        number: 'PHASE 04',
        title: 'Demob & post-job',
        body: 'Crew demobilised, tooling box returned to Jebel Ali, consumables replenished. Final field service report to the operator within 48 hours of demob. Crew available for next call-out within 24 hours.',
        duration: 'Day N — N+2',
      },
    ]),

    sectionHead('/04', 'sop', 'The procedure we run on every engagement.'),
    para(
      'Below is the abridged SOP that governs a day-rate BOP field service engagement out of Jebel Ali. The full document covers nine annexes including operator-specific addenda. This is the core procedure that runs on every job, regardless of operator.',
    ),
    sopBlock(
      'SOP-FS-014 · BOP FIELD SERVICE CREW · DAY-RATE · REV 09 · NACE',
      '18 / 18 COMPLETE',
      [
        {
          name: 'Phase 01 · Mobilisation & pre-job',
          rows: [
            { task: 'Operator vendor-list confirm', detail: 'ADNOC SPC, Aramco SAP, KOC vendor list entry checked & current; operator approval ref logged', who: 'Y. AL HASHIMI', tool: 'Vendor matrix' },
            { task: 'Crew certification cross-check', detail: 'IWCF L4, WellSharp, HUET, H₂S, SAEP-1142, OPITO — all in date for crew rostered against the job', who: 'A. AL SUWAIDI', tool: 'Cert register' },
            { task: 'PPE issue · sour-service rated', detail: 'H₂S escape sets, fire-retardant coveralls, breathing apparatus, gas detectors charged & calibrated', who: 'O. AL MAKTOUM', tool: 'PPE store' },
            { task: 'Tooling box load · per scope', detail: 'Hydraulic torque tools, function-test rig, chart recorder, calibrated gauges, ram-change tooling, lifting accessories', who: 'O. AL MAKTOUM', tool: 'Tool crib' },
            { task: 'Low-loader dispatched · 48 h', detail: 'Crew vehicle plus tooling truck; route plan filed; rig-floor arrival confirmed with rig contractor', who: 'Y. AL HASHIMI', tool: 'Logistics' },
          ],
        },
        {
          name: 'Phase 02 · On-rig execution',
          rows: [
            { task: 'Pre-tour HSE brief', detail: 'Supervisor briefs crew + rig contractor on scope, HAZOP, H₂S muster, rig-specific permits-to-work', who: 'K. AL MARZOUQI', tool: 'On-rig' },
            { task: 'BOP function test · API STD 53', detail: 'Open/close every cavity, closing-time stopwatch, chart-recorder pressure trace, 10-min hold per circuit', who: 'K. AL MARZOUQI', tool: 'Function rig' },
            { task: 'Pressure test · 1.5× MAWP', detail: 'Hydrostatic to spec, chart-recorder running, witness sign-off from operator company-man', who: 'H. AL AWADI', tool: 'Test pump' },
            { task: 'Ram change / redress (if scoped)', detail: 'Bonnet open, ram block out, elastomer renewal in HNBR sour-service grade, torque per OEM chart', who: 'H. AL AWADI', tool: 'HYTORC' },
            { task: 'Replaced-parts traceability', detail: 'Every part removed and replaced logged with serial / batch / cert reference; photo evidence', who: 'A. AL SUWAIDI', tool: 'Logbook + camera' },
          ],
        },
        {
          name: 'Phase 03 · Documentation & hand-over',
          rows: [
            { task: 'Daily field service report', detail: 'Hours-on-job per crew member, scope completed, findings, next-shift handover. PDF on company-man\'s desk by 18:00', who: 'A. AL SUWAIDI', tool: 'PDF' },
            { task: 'Function-test record', detail: 'Chart-recorder traces, closing-time logs, witness sign-off; one record per cavity per test cycle', who: 'K. AL MARZOUQI', tool: 'Chart pack' },
            { task: 'On-rig hand-over sign-off', detail: 'Operator company-man signature on every shift hand-over and at end-of-job; counter-sign on supervisor copy', who: 'K. AL MARZOUQI', tool: 'On-rig' },
            { task: 'End-of-job summary', detail: 'One-page summary: scope as-executed vs as-planned, deliverables status, parts replaced, recommendations', who: 'K. AL MARZOUQI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 04 · Demob & post-job',
          rows: [
            { task: 'Crew demobilised', detail: 'Tooling box and PPE returned to Jebel Ali; consumables replenished; gas detectors recalibrated', who: 'O. AL MAKTOUM', tool: 'Tool crib' },
            { task: 'Final field service report · 48 h', detail: 'Full job pack: daily reports compiled, photo log, replaced-parts traceability, function-test records', who: 'A. AL SUWAIDI', tool: 'PDF + ZIP' },
            { task: 'Operator post-job review', detail: 'Optional 30-min call with company-man on findings, recommendations, follow-on scope', who: 'K. AL MARZOUQI', tool: 'Call' },
            { task: 'Crew available · 24 h reset', detail: 'Crew rostered as available for next call-out; certification register updated; vehicle re-prepped', who: 'Y. AL HASHIMI', tool: 'Roster' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What you get against what the operator typically requires.'),
    para(
      'Below is the standard certification, capability and deliverable matrix for the day-rate BOP field service crew, set against the typical operator vendor-list requirement in the GCC. Three highlighted rows are the ones that most disqualify under-qualified crews from the rig before the truck even rolls.',
    ),
    specTable(
      'CAPABILITY · DAY-RATE BOP FIELD SERVICE CREW · GCC OPERATOR-SPEC COMPLIANT',
      [
        {
          component: 'Supervisor well-control card',
          spec: 'IWCF Level 4 · WellSharp Supervisor',
          asFound: 'Operator-required',
          afterRebuild: 'In date · IWCF L4 + WellSharp Supv',
          status: '✓ Compliant',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'H₂S Awareness + Escape',
          spec: 'OPITO or equivalent · current',
          asFound: 'Operator-required',
          afterRebuild: 'All crew · OPITO current',
          status: '✓ Compliant',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'SAEP-1142 NDT-equivalent training',
          spec: 'Aramco / equivalent',
          asFound: 'Required for KSA work',
          afterRebuild: 'Supv + 1 tech · SAEP-1142',
          status: '✓ Compliant',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'HUET (Helicopter Underwater)',
          spec: 'OPITO BOSIET / FOET',
          asFound: 'Required offshore-mob',
          afterRebuild: 'Supv current; techs on roster',
          status: '✓ Compliant',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Operator vendor-list entry',
          spec: 'Pre-cleared per operator',
          asFound: 'Per operator · ref-on-file',
          afterRebuild: 'ADNOC, Aramco, KOC, PDO, QE, BAPCO',
          status: '✓ Listed',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'API Q2 service quality system',
          spec: 'API Q2 · field service',
          asFound: 'Increasingly required',
          afterRebuild: 'Indus QMS · API Q2 aligned',
          status: '✓ Aligned',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Standard mobilisation',
          spec: 'Operator-tour critical',
          asFound: '5 — 7 days (typical vendor)',
          afterRebuild: '48 — 72 h (Jebel Ali)',
          status: '↓ 60% faster',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Emergency call-out',
          spec: 'Well-control event',
          asFound: 'Often "next available"',
          afterRebuild: '24 h dispatch · 24×7',
          status: '✓ Available',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Crew composition (typical)',
          spec: 'Per scope',
          asFound: '1 + 2 (Supv + Techs)',
          afterRebuild: 'Scales with scope',
          status: '✓ Standard',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Long-term campaign cover',
          spec: '30+ day rigs',
          asFound: 'Crew rotation needed',
          afterRebuild: 'Stationed crew · 28-day rotation',
          status: '✓ Covered',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Daily field service report',
          spec: 'Operator-required',
          asFound: 'Often delayed / incomplete',
          afterRebuild: 'On company-man\'s desk by 18:00',
          status: '✓ Same shift',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Tooling self-sufficiency',
          spec: 'No rig-loan reliance',
          asFound: 'Vendor-supplied or rig-loan',
          afterRebuild: 'Full tooling on the truck',
          status: '✓ Self-sufficient',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What you get from a typical engagement.'),
    para(
      'On a single function-test day-trip, the deliverable is a chart-recorded API STD 53 function test, replaced-parts traceability for any soft-goods renewed, an end-of-job summary on the company-man\'s desk before tour change, and a final field service report PDF inside 48 hours of demob. On a 30-day stationed campaign, the deliverable is the same — every shift, every day, the same paperwork stack — plus a single end-of-campaign job pack with operator sign-off. Day-rate billing means the operator sees one line on the invoice per crew member per day on the rig, with mobilisation and demob travel covered separately. No surprise charges, no overtime ambiguity, no scope creep.',
    ),
    resultBox(
      'Result · what to expect',
      'A certified, operator-listed BOP crew on the rig inside 48 hours, with the paperwork stack the company-man needs to sign off the well.',
      'Day-rate billing, IWCF Level 4 supervisor with IADC WellSharp Supervisor card, H₂S-trained crew, SAEP-1142 NDT-equivalent for KSA work, full sour-service PPE and tooling on the truck. Pre-cleared on the vendor lists of every major GCC operator (ADNOC, Aramco, KOC, PDO, QatarEnergy, BAPCO). 24-hour emergency dispatch available. Daily field service report on the company-man\'s desk every shift.',
      [
        { value: '48 — 72', valueSmall: ' h', label: 'Standard dispatch', style: 'accent' },
        { value: '24', valueSmall: ' h · emergency', label: 'Call-out response', style: 'good' },
        { value: 'IWCF L4', valueSmall: ' · WellSharp', label: 'Well-control cards', style: 'good' },
        { value: '6', valueSmall: ' operators', label: 'Vendor-list entries' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew on the truck.'),
    teamList(
      'A typical day-rate crew is one supervisor and two technicians, all rostered out of Jebel Ali. For heavy nipple-up or stack-handler operations we add the stack-handler operator. Documentation is owned back at the workshop. The crew you meet on the rig is the same crew on every campaign — we don\'t sub-contract.',
      [
        { name: 'Khalid Al Marzouqi', role: 'Field Crew Supervisor (IWCF Level 4)', location: 'Jebel Ali', scope: 'On-rig supervisor on every engagement. IWCF L4, IADC WellSharp Supervisor, HUET, SAEP-1142. Owns the company-man relationship and the witness sign-off.' },
        { name: 'Hassan Al Awadi', role: 'Senior BOP Technician', location: 'Jebel Ali', scope: 'Lead hands-on tech for ram change, redress, function test execution, pressure-test rig-up. IWCF Level 3, H₂S Awareness + Escape.' },
        { name: 'Omar Al Maktoum', role: 'BOP Stack Handler Operator', location: 'Jebel Ali', scope: 'Hydraulic stack handler / bridge crane operations on nipple-up jobs. Tooling box ownership, PPE issue, vehicle prep on every dispatch.' },
        { name: 'Aisha Al Suwaidi', role: 'Documentation Lead', location: 'Jebel Ali', scope: 'Daily field service reports, replaced-parts traceability, function-test record packs, end-of-job summary, certification register upkeep.' },
        { name: 'Yusuf Al Hashimi', role: 'Operations Manager', location: 'Jebel Ali', scope: 'Crew rostering, operator vendor-list maintenance, low-loader dispatch, day-rate contract administration. First call on emergency call-outs.' },
      ],
      'Service file · INTAKE-2026-05-FS014 · WO-2026-FS-2014 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'A day-rate crew is only worth what its paperwork is worth. The IWCF cards, the operator vendor-list entry, the SAEP-1142 training, the daily field service report on the company-man\'s desk by 18:00 — that\'s the whole product. The work itself is the easy part.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Operations Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Service', value: 'BOP field service crew · day-rate' },
    { label: 'Crew (typical)', value: '1 supervisor + 2 technicians' },
    { label: 'Well-control', value: 'IWCF Level 4 · WellSharp Supervisor' },
    { label: 'H₂S', value: 'OPITO Awareness + Escape · current' },
    { label: 'KSA-specific', value: 'SAEP-1142 NDT-equivalent' },
    { label: 'Offshore-mob', value: 'HUET / BOSIET on supervisor' },
    { label: 'Quality system', value: 'API Q2 aligned' },
    { label: 'Standard mobilisation', value: '48 — 72 h ex-Jebel Ali' },
    { label: 'Emergency dispatch', value: '24 h · 24×7' },
    { label: 'Operator vendor lists', value: 'ADNOC · Aramco · KOC · PDO · QE · BAPCO' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Crew certification register (PDF)', url: '#', size: '14 pp', format: 'PDF' },
    { label: 'Operator vendor-list summary (PDF)', url: '#', size: '6 pp', format: 'PDF' },
    { label: 'Day-rate scope-of-work template (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'Field service report sample pack (ZIP)', url: '#', size: '22 MB', format: 'ZIP' },
  ],
  caseFileMeta: 'Service file · INTAKE-2026-05-FS014 · WO-2026-FS-2014 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Day-rate BOP field service crew out of Jebel Ali — IWCF Level 4 supervisor, H₂S-trained technicians, SAEP-1142 NDT-equivalent for KSA work. 48-72 h standard dispatch, 24 h emergency response, full sour-service PPE and tooling on the truck. Pre-cleared on every major GCC operator vendor list.',
  cardOutcomePills: [
    { label: '48 h standard dispatch · 24 h emergency', style: 'good' },
    { label: 'IWCF L4 + WellSharp + SAEP-1142', style: 'good' },
    { label: 'Day-rate · 30+ day campaigns', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: 'DAY-RATE · 48 H DISPATCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'FIELD CREW',

  durationDays: 1,

  seoTitle: 'BOP Field Service Crew · H₂S-Trained · IWCF Level 4 · Day-Rate · 48 h GCC Dispatch · Indus Hydraulics Jebel Ali',
  seoDescription: 'Day-rate BOP field service crew out of Jebel Ali. H₂S-trained, IWCF Level 4 well-control supervisor, IADC WellSharp Supervisor, SAEP-1142 NDT-equivalent for Aramco work, HUET for offshore mobilisation. 48-72 hour standard dispatch, 24 hour emergency response, 30+ day stationed campaigns. Pre-cleared on ADNOC, Aramco, KOC, PDO, QatarEnergy and BAPCO vendor lists. Full sour-service PPE and tooling on the truck.',
  focusKeyword: 'BOP field service crew day-rate IWCF H2S jebel ali',
}

export default CASE
