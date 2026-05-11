/**
 * Case 11 — BOP pressure testing per API STD 53 · 14-day cycle · GCC-wide
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's recurring BOP pressure-testing service per API STD 53 — the
 * highest-frequency BOP service in the GCC. Crews mobilise from Jebel Ali
 * to every active rig in KSA / UAE / Iraq / Oman on a rolling 14-day cycle
 * with chart-recorder traces, per-test PDF reports and 3rd-party witness.
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
  slug: 'bop-pressure-testing-service-api-std-53',
  caseNumber: '11',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Testing · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali · GCC-wide deployment',
  caseDateLabel: 'ROLLING SCHEDULE · 2026 ·  ON-RIG',
  title: 'The 14-day BOP test cycle, per API STD 53 — every active rig in the GCC, every two weeks, on the chart.',
  titleAccent: 'every active rig in the GCC, every two weeks, on the chart',
  deck: 'API STD 53 says the BOP stack gets tested every 14 days. Every operator in the GCC enforces it. Indus runs a standing pressure-test crew out of Jebel Ali — IWCF Level 4 supervisor, chart operator, assistant — that mobilises within 48-72 h to any active rig in KSA, UAE, Iraq or Oman, runs the low-pressure and high-pressure phases on every cavity, and hands over a per-test PDF the same shift the chart comes off the recorder.',

  heroImageCaption: 'FIG. 01 · Pressure test in progress · 10K stack on a Hail & Ghasha rig · chart recorder trace mid-high-pressure phase',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-04-22',

  metaCells: [
    { label: 'Standard', value: 'API STD 53', valueSmall: ' · Well Control', style: 'neutral' },
    { label: 'Cycle', value: '14', valueSmall: ' · day rotation', style: 'neutral' },
    { label: 'Coverage', value: '5K · 10K · 15K', valueSmall: ' · stacks', style: 'neutral' },
    { label: 'Mobilisation', value: '48 — 72', valueSmall: ' h to rig', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A test cadence the rig cannot move.'),
    lead(
      'Every active drilling rig in the GCC runs on a clock that the rig manager did not choose. <strong>API STD 53</strong> writes that clock — every 14 days the BOP stack comes off well-control duty for a full pressure-test sequence. Skip a cycle and the well-control insurance walks. Run it badly and the operator HSE rep does not sign the chart. The rig does not turn until that signature is on the page.',
    ),
    para(
      'The test sequence itself is not negotiable: <strong>low-pressure phase at 250 — 350 psi held 5 minutes per cavity</strong>, <strong>high-pressure phase at full rated WP held 10 minutes per cavity</strong>, annular tested on every pipe and casing OD in use, blind-shear ram seal plus bore-isolation function, choke and kill manifold per <strong>API 16C</strong>, wellhead seal, full chart-recorder traces, sour-service test fittings, third-party witness on operator request. Aramco\'s revised 2023+ Well Control Manual tightened the H₂S clauses; ADNOC SPC and PDO followed inside a year. The work is not getting smaller.',
    ),
    problemSolution(
      {
        label: 'What the operator needs',
        title: 'A crew that arrives on cycle and a chart the auditor will sign.',
        body: 'Most rigs do not staff a dedicated pressure-test crew. The toolpusher and the company man cannot run a 14-day cycle plus a full operations day. They need a service that mobilises on the day, brings the test pump and chart recorder, runs the standard, and leaves the rig with a per-test PDF on the company man\'s desk before the next tour change.',
      },
      {
        label: 'What we deliver into that slot',
        title: 'Standing test crew, Jebel Ali to rig in 48 — 72 h.',
        body: 'IWCF Level 4 BOP test supervisor, chart operator, assistant. Sour-service test stack, calibrated chart recorder, NACE MR0175 fittings. We run the API STD 53 sequence on every cavity, generate the chart and the PDF the same shift, and arrange TUV / DNV / Lloyd\'s witness when the operator wants third-party sign-off.',
      },
    ),
    para(
      'This is the most-bought BOP service in the GCC — by frequency, not by ticket size. Operators do not ring us about the test cycle the way they ring about a recert. They ring us once. They put us on the rotation. From there we live on the rig schedule, not the phone.',
    ),

    sectionHead('/02', 'solution', 'Low pressure, high pressure, every cavity, on the chart.'),
    para(
      'A test cycle on a 10K stack typically runs one full day on the rig. We start with the low-pressure phase — <strong>250 — 350 psi held for 5 minutes per cavity</strong> — to seat the elastomers and prove the seal at the floor where casual leaks live. Then the high-pressure phase — <strong>full rated working pressure (5,000 / 10,000 / 15,000 psi depending on stack class) held 10 minutes per cavity</strong>. Every annular preventer is tested on each pipe OD and each casing OD in current use. Blind-shear rams get a seal test and a bore-isolation function. The choke and kill manifold is sequenced through every operating valve per <strong>API 16C</strong>. Wellhead seal goes through the same envelope. Every step is logged to the chart with timestamps and operator initials.',
    ),
    para(
      'Test fittings are <strong>NACE MR0175 / ISO 15156 sour-service</strong> by default — <strong>HNBR</strong> and <strong>FKM</strong> elastomers, <strong>316 SS</strong> manifold, <strong>B7M / L7M</strong> bolting on the test cap. The chart recorder is calibrated against a <strong>0.05% full-scale</strong> reference dead-weight tester before mobilisation and again on return. When the operator wants TUV, DNV or Lloyd\'s on the floor for the test, we book the witness inspector through their GCC office and align the test schedule to their availability. Witnessed tests get an extra signature page and a notarised cover sheet.',
    ),
    figure(
      'Test cap rigged on a 13-5/8" 10K Cameron stack, low-pressure phase at 300 psi. Chart recorder in the background — analog trace plus digital logger running side by side.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"BOP test cap rigged, chart recorder running, supervisor watching the gauge\\n1200×675"',
      },
    ),
    pullQuote(
      'The chart is the deliverable. Not the seal. The seal is what we tested — the chart is what the auditor reads three years from now when something on the rig went wrong on a different day. "We tested it" is a sentence. "Trust me, the chart shows it" is a document.',
      '— Khalid Al Marzouqi · BOP Test Supervisor (IWCF Level 4) · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, one shift on the rig, paper before tour change.'),
    para(
      'Every Indus pressure-test engagement runs through the same four phases. The cycle does not change between operators or stack classes — only the cavity count and the WP envelope.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Mobilise & rig-up',
        body: 'Operator request via the rotation. Crew + test stack + recorder dispatched from Jebel Ali within 48 — 72 h. Calibration check on the chart recorder before sailing. Rig-up on the BOP stack with NACE-rated test cap.',
        duration: 'Day 0 — 1',
      },
      {
        number: 'PHASE 02',
        title: 'Low-pressure phase',
        body: '250 — 350 psi held 5 minutes per cavity. Seat the elastomers, log every cavity, every annular OD and the manifold path. Chart recorder runs continuously. Catch any soft leak before high pressure stresses it.',
        duration: 'Day 1 · AM',
      },
      {
        number: 'PHASE 03',
        title: 'High-pressure phase',
        body: 'Full rated WP — 5K / 10K / 15K depending on stack — held 10 minutes per cavity. Annular on every pipe and casing OD. Blind-shear seal + bore isolation. Choke / kill per API 16C. Wellhead seal envelope.',
        duration: 'Day 1 · PM',
      },
      {
        number: 'PHASE 04',
        title: 'Chart, PDF, sign-off',
        body: 'Chart recorder strip annotated. Per-test PDF generated on the rig laptop — timestamps, hold envelope, stack drawing showing tested cavities, sour-service tag. Operator HSE counter-signature. Witness sign-off where applicable.',
        duration: 'Day 1 · before tour change',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we run, every rig, every cycle.'),
    para(
      'Below is the standard procedure that governs an Indus pressure-test engagement. The full SOP runs 22 lines plus a calibration annex. This is the abridged set that gets ticked, signed and stapled to the chart on every job.',
    ),
    sopBlock(
      'SOP-OG-022 · API STD 53 BOP TEST · REV 04 · NACE',
      '17 / 17 COMPLETE',
      [
        {
          name: 'Phase 01 · Mobilise & rig-up',
          rows: [
            { task: 'Chart recorder calibration', detail: 'Reference dead-weight tester · 0.05% full-scale · cert pre-mob, pre-cycle and post-cycle', who: 'A. AL SUWAIDI', tool: 'DWT bench' },
            { task: 'Test stack & fittings prep', detail: 'NACE MR0175 fittings, HNBR seals, 316 SS manifold, B7M / L7M bolting on test cap', who: 'O. AL MAKTOUM', tool: 'Workshop' },
            { task: 'Mobilisation to rig', detail: 'Crew + stack + recorder dispatched within 48 — 72 h of operator request via rotation', who: 'Y. AL HASHIMI', tool: 'Logistics' },
            { task: 'Rig-up on BOP stack', detail: 'Test cap landed, manifold lined up, recorder hard-piped, isolation valves verified', who: 'H. AL AWADI', tool: 'On-rig' },
          ],
        },
        {
          name: 'Phase 02 · Low-pressure phase',
          rows: [
            { task: 'Annular low-pressure test', detail: '250 — 350 psi · 5 min hold · each pipe OD + each casing OD in current use', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Pipe-ram low-pressure test', detail: '250 — 350 psi · 5 min hold · upper and lower cavities, each pipe OD', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Blind-shear low-pressure test', detail: '250 — 350 psi · 5 min hold · seal envelope + bore isolation function', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Choke / kill low-pressure test', detail: 'Manifold per API 16C · each operating valve sequenced and held', who: 'O. AL MAKTOUM', tool: 'Manifold rig' },
          ],
        },
        {
          name: 'Phase 03 · High-pressure phase',
          rows: [
            { task: 'Annular high-pressure test', detail: 'Full rated WP · 10 min hold · each pipe OD + each casing OD · seal log', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Pipe-ram high-pressure test', detail: 'Full rated WP · 10 min hold · upper and lower · pressure-trap and bleed log', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Blind-shear high-pressure test', detail: 'Full rated WP · 10 min hold · seal + bore-isolation function · stopwatch on closure', who: 'K. AL MARZOUQI', tool: 'Test pump' },
            { task: 'Choke / kill high-pressure test', detail: 'Per API 16C · each operating valve · full rated WP · 10 min hold', who: 'O. AL MAKTOUM', tool: 'Manifold rig' },
            { task: 'Wellhead seal envelope', detail: 'Test against the spool-to-stack seal · full WP · 10 min hold · operator confirm', who: 'K. AL MARZOUQI', tool: 'Test pump' },
          ],
        },
        {
          name: 'Phase 04 · Chart, PDF, sign-off',
          rows: [
            { task: 'Chart strip annotation', detail: 'Operator + chart-op initials, timestamps, cavity ID, hold envelope on every test', who: 'A. AL SUWAIDI', tool: 'Chart pen' },
            { task: 'Per-test PDF generation', detail: 'Stack drawing with tested cavities, hold envelope plot, sour-service tag, NACE cert', who: 'A. AL SUWAIDI', tool: 'Rig laptop' },
            { task: 'Operator HSE sign-off', detail: 'Counter-signature on chart + PDF · witness inspector on the page when booked', who: 'K. AL MARZOUQI', tool: 'On-rig' },
            { task: 'Witness sign-off (where booked)', detail: 'TUV / DNV / Lloyd\'s GCC office inspector · notarised cover sheet on the FAT pack', who: 'K. AL MARZOUQI', tool: 'On-rig' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'Typical findings — what a 14-day cycle catches.'),
    para(
      'Across the rolling rotation we run hundreds of cycles per year on stacks across KSA, UAE, Iraq and Oman. The table below is what an Indus crew typically finds and corrects on an in-cycle test of a stack in good service. Three of these are the recurring critical catches — they fail an audit if they go unaddressed and they are the main reason the standard requires the test in the first place.',
    ),
    specTable(
      'TYPICAL FINDINGS · API STD 53 BOP TEST CYCLE · STACK CLASS 5K / 10K / 15K · SOUR SERVICE',
      [
        {
          component: 'Annular low-pressure seat',
          spec: '250 — 350 psi · 5 min · 0 drop',
          asFound: 'Slow seat (1.2 — 4 min)',
          afterRebuild: 'Seated · 0 drop @ 5 min',
          status: '↻ Re-seated, logged',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Annular high-pressure hold',
          spec: 'Rated WP · 10 min · 0 drop',
          asFound: 'Hold confirmed @ chart',
          afterRebuild: 'Cert issued',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Blind-shear seal envelope',
          spec: 'Rated WP · 10 min · 0 drop',
          asFound: '~5% catch rate · soft seal',
          afterRebuild: 'Element renewed on rig',
          status: '↻ Critical · re-tested',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Pipe-ram packer seat',
          spec: '5 + 10 min hold · 0 drop',
          asFound: 'Bleed-back > 50 psi/min',
          afterRebuild: 'Packer change · pass',
          status: '↻ Critical · packer change',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Choke / kill manifold valve seat',
          spec: 'API 16C · rated WP · 10 min',
          asFound: 'Seat cut on one valve',
          afterRebuild: 'Trim renewed · pass',
          status: '↻ Critical · trim swap',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Wellhead seal envelope',
          spec: 'Rated WP · 10 min · 0 drop',
          asFound: 'Pass',
          afterRebuild: 'Cert issued',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Chart recorder calibration',
          spec: '0.05% full-scale vs DWT',
          asFound: 'Pre-mob within 0.03%',
          afterRebuild: 'Post-cycle within 0.04%',
          status: '✓ Pass · cert attached',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'NACE / sour-service fittings',
          spec: 'MR0175 / ISO 15156',
          asFound: 'Fittings cert pre-job',
          afterRebuild: 'Cert in FAT pack',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'IWCF supervisor on the floor',
          spec: 'Level 4 · BOP test',
          asFound: 'Cert verified at intake',
          afterRebuild: 'Counter-sig on chart',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Per-test PDF + chart strip',
          spec: 'Issued before tour change',
          asFound: '—',
          afterRebuild: 'On company-man desk',
          status: '✓ Issued same shift',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'A standing rotation that the rig schedule plans around.'),
    para(
      'When an operator places Indus on the pressure-test rotation, the work moves out of the phone log and into the rig schedule. We arrive on the cycle date, run the standard, hand the company man the chart and the PDF before tour change, and the rig is back on well-control duty by the next morning. Across a year a single rig will run roughly 24 — 26 cycles on the 14-day cadence (or 17 — 18 on the 21-day variant under some operator standards). Indus crews typically run 200+ cycles per year across the rotation, which is the volume base under the API STD 53 documentation discipline.',
    ),
    resultBox(
      'Result · summary',
      'A 48 — 72 h mobilisation, a one-day on-rig test cycle, and the chart and PDF on the company man\'s desk before tour change.',
      'IWCF Level 4 supervisor, calibrated chart recorder, NACE MR0175 sour-service fittings. Low-pressure phase 250 — 350 psi · 5 min per cavity. High-pressure phase rated WP · 10 min per cavity. Annular on every OD in use. Choke / kill per API 16C. Per-test PDF same shift. Witness sign-off (TUV / DNV / Lloyd\'s) on operator request.',
      [
        { value: '48 — 72', valueSmall: ' h to rig', label: 'Mobilisation', style: 'accent' },
        { value: '5K · 10K · 15K', label: 'Stack class coverage', style: 'good' },
        { value: '14 / 21', valueSmall: ' day cadence', label: 'Cycle options', style: 'good' },
        { value: 'Same shift', label: 'PDF + chart issue' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew that lives on the rotation.'),
    teamList(
      'A standing pressure-test crew is three field people plus a documentation lead in Jebel Ali. The crew profile below is the standard rotation; a witnessed cycle adds the operator HSE rep and the third-party inspector on the floor.',
      [
        { name: 'Khalid Al Marzouqi', role: 'BOP Test Supervisor (IWCF Level 4)', location: 'Jebel Ali', scope: 'Runs the test sequence, owns the chart, signs the operator counter-signature page. The face on the rig.' },
        { name: 'Yusuf Al Hashimi', role: 'Operations Manager', location: 'Jebel Ali', scope: 'Owns the rotation. Books mobilisations against the operator schedule, dispatches crew and stack within the 48 — 72 h window.' },
        { name: 'Hassan Al Awadi', role: 'Lead Field Crew', location: 'Jebel Ali', scope: 'Rig-up and rig-down on the BOP stack. Test cap landing, manifold line-up, pump operation through the cycle.' },
        { name: 'Aisha Al Suwaidi', role: 'Documentation Lead', location: 'Jebel Ali', scope: 'Chart annotation, per-test PDF generation, calibration cert handling, FAT pack assembly for the witness inspector when booked.' },
        { name: 'Omar Al Maktoum', role: 'Mobile Test Crew', location: 'Jebel Ali', scope: 'Choke / kill manifold sequencing per API 16C, sour-service fitting prep, NACE-cert verification at intake.' },
      ],
      'Case file · INTAKE-2026-04-088 · WO-2026-2211 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'In BOP test work, "we tested it" is a sentence. "Trust me, the chart shows it" is a document. The whole point of API STD 53 is that the chart outlasts every conversation about the rig that day. We test the stack so the chart can do the talking later.',
  pullQuoteAuthor: 'Khalid Al Marzouqi',
  pullQuoteRole: 'BOP Test Supervisor (IWCF Level 4)',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Standard', value: 'API STD 53 · API 16C' },
    { label: 'Cycle options', value: '14-day · 21-day operator-spec' },
    { label: 'Stack classes', value: '5K · 10K · 15K' },
    { label: 'Low-pressure phase', value: '250 — 350 psi · 5 min / cavity' },
    { label: 'High-pressure phase', value: 'Rated WP · 10 min / cavity' },
    { label: 'Mobilisation', value: '48 — 72 h to rig' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Fittings', value: '316 SS · HNBR · B7M / L7M' },
    { label: 'Supervisor cert', value: 'IWCF Level 4 / WellSharp' },
    { label: 'Witness option', value: 'TUV · DNV · Lloyd\'s' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Test SOP & calibration annex (PDF)', url: '#', size: '22 pp', format: 'PDF' },
    { label: 'Per-test PDF · sample (PDF)', url: '#', size: '14 pp', format: 'PDF' },
    { label: 'NACE / fittings cert pack (ZIP)', url: '#', size: '8 MB', format: 'ZIP' },
    { label: 'Operator-spec compliance matrix (PDF)', url: '#', size: '6 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-088 · WO-2026-2211 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'API STD 53 says the BOP stack gets tested every 14 days. Every operator in the GCC enforces it. Indus runs a standing pressure-test crew out of Jebel Ali — IWCF Level 4 supervisor, chart operator, assistant — that mobilises within 48 — 72 h to any active rig in KSA, UAE, Iraq or Oman.',
  cardOutcomePills: [
    { label: 'API STD 53 · 14-day cycle', style: 'good' },
    { label: '5K · 10K · 15K stacks', style: 'good' },
    { label: 'IWCF Level 4 supervisor', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: 'PER-RIG · 14-DAY CYCLE',
  cardTagStyle: 'oil',
  cardTagLabel: 'PRESSURE TESTING',

  durationDays: 1,

  seoTitle: 'BOP Pressure Testing Service · API STD 53 · 14-Day Cycle · GCC-Wide · Indus Hydraulics',
  seoDescription: 'Standing BOP pressure-test crew out of Jebel Ali — IWCF Level 4 supervisor, chart operator, assistant — running the API STD 53 14-day test cycle on every active rig in KSA, UAE, Iraq and Oman. Low-pressure 250 — 350 psi · 5 min per cavity. High-pressure rated WP (5K / 10K / 15K) · 10 min per cavity. Annular on every OD, blind-shear seal + function, choke / kill per API 16C. Per-test PDF same shift. NACE MR0175 sour-service. TUV / DNV / Lloyd\'s witness on operator request. 48 — 72 h mobilisation.',
  focusKeyword: 'BOP pressure testing service API STD 53 jebel ali',
}

export default CASE
