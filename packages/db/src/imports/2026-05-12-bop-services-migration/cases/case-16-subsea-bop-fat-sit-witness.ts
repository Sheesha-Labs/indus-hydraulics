/**
 * Case 16 — Subsea BOP stack FAT/SIT witness · operator engineering proxy
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's senior BOP engineering authority mobilises to OEM workshops
 * (Cameron / SLB Pressure Control Houston, NOV Houston, Hydril Houston) to
 * witness FAT and SIT on new-build subsea BOP stacks entering service for
 * ADNOC Offshore and Saudi Aramco offshore. Operator's technical proxy where
 * direct attendance is not feasible.
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
  slug: 'subsea-bop-stack-fat-sit-witness-engineering-support',
  caseNumber: '16',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Subsea · Engineering',
  region: '🇦🇪 UAE-engaged · OEM workshops globally · Operator base UAE',
  caseDateLabel: 'PER-PROJECT · 4-8 WEEK ENGAGEMENT',
  title: 'Your eyes on the OEM floor — independent FAT and SIT witness on a new-build subsea BOP stack.',
  titleAccent: 'eyes on the OEM floor',
  deck: 'A new 18-3/4" 15K subsea BOP stack costs the price of a small office tower and arrives with a documentation pack the size of a phone book. The OEM\'s test report says it passed. Our engineering authority stands on the test bay, watches every cavity close, walks the documentation pack line by line against the operator specification, and signs a witness report that the operator can put behind glass. Operator-stamp coordination, mobilisation and travel handled in full from Jebel Ali.',

  heroImageCaption: 'FIG. 01 · 18-3/4" 15K subsea BOP stack on the OEM test bay, mid-FAT — annular and four ram cavities visible',
  heroImageCredit: 'PHOTO · F. AL MANSOORI · 2026-04-14',

  metaCells: [
    { label: 'Asset', value: '18-3/4"', valueSmall: ' · subsea stack', style: 'neutral' },
    { label: 'WP', value: '15,000', valueSmall: ' · psi · 15K', style: 'neutral' },
    { label: 'Engagement', value: '4 — 8', valueSmall: ' · weeks', style: 'neutral' },
    { label: 'Authority', value: '15+', valueSmall: ' · yrs', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'The OEM said it passed. The operator wants to know that for themselves.'),
    lead(
      'A new-build <strong>18-3/4" 15K subsea BOP stack</strong> ships out of Cameron / SLB Pressure Control Houston, or NOV Houston, or Hydril Houston, with an OEM-issued FAT report stamped, bound and slipped into a transit case. The operator in Abu Dhabi or Dhahran has paid eight figures for the stack. The OEM is the OEM. The standard is API 16A. And the stack is going on a wellhead in <strong>Hail &amp; Ghasha</strong> ultra-sour gas, or <strong>Lower Zakum</strong>, or <strong>Marjan</strong>. There is no second chance to find out the test was light.',
    ),
    para(
      'The operator typically does not have a senior subsea-BOP engineer free to fly to Houston for six weeks of FAT and SIT. The operator typically also does not want the OEM marking its own homework. <strong>API 16A</strong> permits operator-witnessed acceptance and the operator specification almost always requires it — but "permits" and "happens" are not the same thing. What the operator needs is an independent technical authority, with the right certifications, the right tickets, and 15+ years of subsea BOP experience, to stand on that test bay and act as the operator\'s engineering proxy. That is the engagement we are describing here.',
    ),
    problemSolution(
      {
        label: 'What the operator typically asks for',
        title: '"We need our eyes on the FAT — Cameron, NOV, or Hydril Houston, four to eight weeks."',
        body: 'New-build subsea BOP stack on order. Operator specification calls for witnessed FAT and SIT per API 16A and operator stamp on the documentation pack. Operator engineering bench is committed elsewhere. Schedule is tied to the OEM build slot — no flex.',
      },
      {
        label: 'What we deliver',
        title: 'Senior BOP authority on the OEM floor — pre-FAT review, on-site FAT, SIT, doc-pack sign-off',
        body: 'Pre-FAT documentation review against operator spec. On-site FAT witness — every cavity, every cycle, every hydrostatic hold. SIT witness on BOP + control system + LMRP integration. Documentation-pack walk-down line by line. Operator-stamp coordination. One signed witness report.',
      },
    ),
    para(
      'The job has nothing to do with hours-on-bay or yard space. The job is risk transfer — the operator wants the technical risk on the witness, not on the OEM\'s self-certification, before that stack leaves Houston on a heavy-lift to Jebel Ali. Engagement is scheduled <strong>4 to 8 weeks ahead of the FAT date</strong> against the OEM build slot. Travel, mobilisation, visas, OEM site-access coordination — all handled by Indus from Jebel Ali.',
    ),

    sectionHead('/02', 'solution', 'What the witness package actually covers.'),
    para(
      'Scope of every engagement. <strong>Pre-FAT documentation review</strong> — operator specification cross-walked against the OEM build pack, flagging every gap before the stack hits the test bay. <strong>On-site FAT witness</strong> at the OEM workshop — function-test verification on every BOP cavity, annular and control system; <strong>hydrostatic shell test</strong> verification at <strong>1.5× WP (22,500 psi on a 15K stack)</strong> with witness signature on the chart; closure-time records on every cavity per <strong>API STD 53</strong>. <strong>SIT witness</strong> — System Integration Test on BOP plus control system plus LMRP, including hot-line failure modes and accumulator response. <strong>Documentation-pack verification</strong> — NACE MR0175 / ISO 15156 compliance certs, NDT reports, mill certificates to <strong>EN 10204 3.2</strong>, hardness Rockwell C reports, charpy V-notch impact data at the low-temperature design condition.',
    ),
    para(
      'Operator-stamp coordination with the OEM closes the engagement — the operator\'s acceptance stamp is applied to the documentation pack only after our engineering authority has signed the witness report and the OEM has closed any non-conformance items raised during FAT or SIT. The witness report is the deliverable: 80 to 120 pages, photo-evidenced, cross-referenced to the operator specification clause-by-clause, formatted to drop straight into the operator\'s asset file. Mobilisation to operator base in Abu Dhabi or Dhahran for hand-over is included where the operator wants the engineering authority to walk the file in person.',
    ),
    figure(
      'OEM test bay during FAT. 18-3/4" 15K stack pressurised on hydrostatic, witness chart in the foreground. The orange marker is where the witness signature lands when the 30-minute hold completes with zero drop.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Subsea BOP stack on OEM hydrostatic test bay, witness chart in foreground\\n1200×675"',
      },
    ),
    pullQuote(
      'There is a difference between "the OEM said it passed" and "I watched it pass with my own eyes plus I read every line of the documentation pack." The first one is a piece of paper. The second one is what the operator actually paid us to bring back.',
      '— Fatima Al Mansoori · Senior BOP Engineering Authority · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases inside a typical 4-8 week engagement.'),
    para(
      'Engagement length flexes with the OEM build slot and the size of the documentation pack, but every job runs through the same four phases. Travel and OEM site-access coordination overlap the back end of Phase 01.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Pre-FAT desk review',
        body: 'Operator specification walked clause-by-clause against the OEM build pack. Gap list issued to the operator and the OEM. Open items closed before the stack hits the test bay.',
        duration: 'Weeks 1 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'On-site FAT witness',
        body: 'Engineering authority on the OEM floor. Function test on every cavity, hydrostatic shell at 1.5× WP, closure-time records, annular cycles. Daily witness log, photo evidence, NCR tracking.',
        duration: 'Weeks 3 — 5',
      },
      {
        number: 'PHASE 03',
        title: 'SIT + doc-pack walk-down',
        body: 'System Integration Test on BOP + control system + LMRP. Documentation pack walked line by line — NACE certs, NDT reports, mill certs, hardness, charpy. Operator-stamp coordination.',
        duration: 'Weeks 5 — 7',
      },
      {
        number: 'PHASE 04',
        title: 'Witness report + hand-over',
        body: 'Witness report compiled — 80 to 120 pages, photo-evidenced, cross-referenced to operator spec. Mobilisation to operator base in Abu Dhabi or Dhahran for in-person file hand-over.',
        duration: 'Weeks 7 — 8',
      },
    ]),

    sectionHead('/04', 'sop', 'The standing procedure we run on every engagement.'),
    para(
      'Below is the abridged SOP that governs an Indus subsea-BOP FAT/SIT witness engagement. It is the same procedure for Cameron, NOV and Hydril workshops — the witness chairs and the test-bay layouts change; the engineering does not.',
    ),
    sopBlock(
      'SOP-OG-024 · SUBSEA BOP FAT/SIT WITNESS · REV 04 · NACE MR0175',
      '18 / 18 STANDARD STEPS',
      [
        {
          name: 'Phase 01 · Pre-FAT desk review',
          rows: [
            { task: 'Operator specification ingest', detail: 'Spec walked clause-by-clause; checklist built against API 16A, 17D, NACE MR0175', who: 'F. AL MANSOORI', tool: 'Spec doc' },
            { task: 'OEM build-pack cross-walk', detail: 'Drawings, BOM, material certs vs operator spec; gap list issued by week 2', who: 'O. AL MAKTOUM', tool: 'Build pack' },
            { task: 'NCR pre-list to operator + OEM', detail: 'Open items raised in writing before stack hits test bay; close-out tracked', who: 'A. AL SUWAIDI', tool: 'NCR log' },
            { task: 'Test plan witness brief', detail: 'OEM FAT/SIT plan reviewed and counter-signed; witness hold-points marked', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 02 · On-site FAT witness',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× WP', detail: '22,500 psi on 15K stack; 30-minute hold; chart witnessed and counter-signed', who: 'F. AL MANSOORI', tool: 'OEM hydrotest rig' },
            { task: 'Function test · every cavity', detail: 'Annular, upper pipe, blind-shear, lower pipe; closure cycles recorded per API STD 53', who: 'F. AL MANSOORI', tool: 'OEM function rig' },
            { task: 'Closure-time records', detail: 'All cavities timed against ≤ 30 s API STD 53 spec; logged with hydraulic pressure trace', who: 'O. AL MAKTOUM', tool: 'Logger' },
            { task: 'Annular pressure cycles', detail: 'Three full close-open cycles at WP; element inspected at conclusion', who: 'F. AL MANSOORI', tool: 'On-bay' },
            { task: 'Daily witness log + photos', detail: 'One log per shift; photo evidence indexed against test-plan hold-points', who: 'O. AL MAKTOUM', tool: 'Log + camera' },
          ],
        },
        {
          name: 'Phase 03 · SIT + documentation walk-down',
          rows: [
            { task: 'SIT · BOP + control system + LMRP', detail: 'Hot-line failure modes, accumulator response per API 16D, ROV stab integration', who: 'F. AL MANSOORI', tool: 'OEM SIT bay' },
            { task: 'NACE MR0175 cert review', detail: 'Every metallic component traced; hardness Rockwell C ≤ 22 HRC verified per cert', who: 'A. AL SUWAIDI', tool: 'Cert pack' },
            { task: 'NDT report review · all metallics', detail: 'MPI, UT, dye-pen reports walked against ASME V; signed against the part list', who: 'A. AL SUWAIDI', tool: 'NDT pack' },
            { task: 'Mill cert + EN 10204 3.2 verify', detail: 'Body forgings, ram blocks, bonnets — EN 10204 3.2 minimum; chemistry cross-checked', who: 'A. AL SUWAIDI', tool: 'Mill certs' },
            { task: 'Charpy V-notch low-temp impact', detail: 'Data at design temperature; energy values verified against operator spec floor', who: 'A. AL SUWAIDI', tool: 'Test data' },
            { task: 'Operator stamp coordination', detail: 'Stamp applied only after witness report signed and all NCRs closed by OEM', who: 'K. AL MARZOUQI', tool: 'Liaison' },
          ],
        },
        {
          name: 'Phase 04 · Witness report + hand-over',
          rows: [
            { task: 'Witness report compile · 80-120 pp', detail: 'Photo-evidenced, cross-referenced to operator spec clauses, all NCR close-out attached', who: 'F. AL MANSOORI', tool: 'PDF' },
            { task: 'Engineering authority sign-off', detail: 'Senior BOP authority signature on the cover page; IWCF cert reference noted', who: 'F. AL MANSOORI', tool: 'Sign' },
            { task: 'Hand-over to operator base', detail: 'Mobilisation to Abu Dhabi or Dhahran; in-person walk-through of the file with operator', who: 'K. AL MARZOUQI', tool: 'Travel' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find — and what gets caught at FAT instead of on a wellhead.'),
    para(
      'Below is the typical-findings table built from engagements over the last three years across Cameron, NOV and Hydril workshops. Three highlighted rows are the kind of item that — left unflagged — would have travelled out of the OEM workshop with the stamp on the cert.',
    ),
    specTable(
      'TYPICAL FINDINGS · 18-3/4" 15K SUBSEA BOP STACK · FAT/SIT WITNESS · NACE MR0175',
      [
        {
          component: 'Operator-spec clause cross-walk',
          spec: 'Every clause traced',
          asFound: 'Avg 8 — 14 gaps on intake',
          afterRebuild: 'All gaps closed pre-FAT',
          status: '↻ Closed in Phase 01',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test · 1.5× WP',
          spec: '22,500 psi · 30 min hold',
          asFound: 'OEM test plan + chart',
          afterRebuild: '22,500 psi · 0 drop · witnessed',
          status: '✓ Witness signed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Function test · all cavities',
          spec: '≤ 30 s API STD 53',
          asFound: 'OEM-recorded',
          afterRebuild: 'Independently witnessed',
          status: '✓ Witness signed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'NACE MR0175 hardness · forgings',
          spec: '≤ 22 HRC every part',
          asFound: 'Occasional outlier flagged',
          afterRebuild: 'Outliers re-tested or replaced',
          status: '↻ NCR raised + closed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'EN 10204 3.2 mill certs · body',
          spec: '3.2 minimum on body + rams',
          asFound: '3.1 substituted occasionally',
          afterRebuild: 'OEM re-issues to 3.2',
          status: '↻ NCR raised + closed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Charpy V-notch · low-temp impact',
          spec: 'Energy ≥ operator spec floor',
          asFound: 'Reviewed against design temp',
          afterRebuild: 'Verified pass · cert attached',
          status: '✓ Verified',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'NDT pack · MPI / UT / dye-pen',
          spec: 'ASME V coverage + sign-off',
          asFound: 'Walked against the part list',
          afterRebuild: 'No coverage gaps · sign-off complete',
          status: '✓ Verified',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'SIT · BOP + control + LMRP',
          spec: 'Hot-line failure modes per API 16D',
          asFound: 'OEM bench test + ROV stab sim',
          afterRebuild: 'Independently witnessed',
          status: '✓ Witness signed',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator pre-charge · N₂',
          spec: '1,000 psi N₂ · API 16D',
          asFound: 'Verified at SIT',
          afterRebuild: 'Pass · log attached',
          status: '✓ Verified',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Operator-stamp coordination',
          spec: 'Stamp after witness sign-off',
          asFound: 'Sequencing held',
          afterRebuild: 'Stamp applied · no NCRs open',
          status: '✓ Closed',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What the operator gets back from the engagement.'),
    para(
      'A typical engagement closes with the engineering authority on a flight back to Dubai, witness report under arm, hand-over scheduled in Abu Dhabi or Dhahran for the following week. The operator receives an independent, signed, photo-evidenced acceptance package — clause-cross-walked against their own specification — that drops straight into the asset file and survives any future audit. The OEM has closed every NCR raised during FAT or SIT before the stamp went on. The stack ships from Houston with the operator\'s confidence already loaded, not still pending.',
    ),
    resultBox(
      'Result · summary',
      'Independent senior-engineer FAT and SIT witness on a new-build subsea BOP stack — operator confidence locked in before the heavy-lift leaves Houston.',
      'Pre-FAT desk review closes typical 8-14 specification gaps. On-site witness on every cavity, every cycle, every hold. SIT witness on BOP + control system + LMRP integration. Documentation pack walked line by line. Operator stamp coordinated, witness report signed, in-person hand-over in Abu Dhabi or Dhahran.',
      [
        { value: '4 — 8', valueSmall: ' wks', label: 'Typical engagement', style: 'accent' },
        { value: '22,500', valueSmall: ' psi · 30 min', label: 'Shell test witnessed', style: 'good' },
        { value: '80 — 120', valueSmall: ' pp', label: 'Witness report', style: 'good' },
        { value: '15+', valueSmall: ' yrs', label: 'Engineer authority' },
      ],
    ),

    sectionHead('/07', 'team', 'The engineering authority and the support bench.'),
    teamList(
      'Indus runs this engagement with a small, senior team. The engineering authority is the named witness on the report; everyone else supports from Jebel Ali so the authority on the OEM floor stays focused on the test bay.',
      [
        { name: 'Fatima Al Mansoori', role: 'Senior BOP Engineering Authority', location: 'Jebel Ali (mobilises to OEM)', scope: '15+ years subsea BOP. API 16A engineering authority. IWCF Drilling Well Control Supervisor + Well Intervention. Named witness on every report.' },
        { name: 'Yusuf Al Hashimi', role: 'Engineering Operations Manager', location: 'Jebel Ali', scope: 'Engagement scoping against the OEM build slot. Travel, visas, OEM site-access coordination. Owns the engagement file end to end.' },
        { name: 'Aisha Al Suwaidi', role: 'Documentation + Compliance Lead', location: 'Jebel Ali', scope: 'NACE / NDT / mill cert review. Charpy data verification. EN 10204 3.2 cross-check. Walks the documentation pack with the authority.' },
        { name: 'Khalid Al Marzouqi', role: 'Operator Liaison', location: 'Jebel Ali', scope: 'Operator-stamp coordination with OEM. NCR close-out tracking. Hand-over scheduling in Abu Dhabi or Dhahran for the file walk-through.' },
        { name: 'Omar Al Maktoum', role: 'Technical Reviewer', location: 'Jebel Ali', scope: 'Pre-FAT cross-walk against operator specification. OEM build-pack drawing review. Witness-log compilation and photo indexing.' },
      ],
      'Case file · INTAKE-2026-04-021 · WO-2026-1116 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'You can fly an OEM cert back to Abu Dhabi in a transit case. You cannot fly back the four weeks of context that tells you whether the cert is a piece of paper or a piece of evidence. That context is what the witness brings home.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Engineering Operations Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset class', value: '18-3/4" 15K subsea BOP stack' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Working pressure', value: '15,000 psi (also 10K)' },
    { label: 'Hydrotest witnessed', value: '22,500 psi · 30 min' },
    { label: 'Standards', value: 'API 16A · 16D · 17D · STD 53' },
    { label: 'Authority cert', value: 'IWCF Supervisor + WI' },
    { label: 'Authority experience', value: '15+ yrs subsea BOP' },
    { label: 'OEM workshops', value: 'Cameron / SLB · NOV · Hydril Houston' },
    { label: 'Operators served', value: 'ADNOC Offshore · Saudi Aramco' },
    { label: 'Engagement length', value: '4 — 8 weeks per project' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Pre-FAT spec cross-walk template (PDF)', url: '#', size: '14 pp', format: 'PDF' },
    { label: 'Witness report sample (PDF)', url: '#', size: '92 pp', format: 'PDF' },
    { label: 'NCR log + close-out template (XLSX)', url: '#', size: '180 KB', format: 'XLSX' },
    { label: 'Engagement scope + commercial brief (PDF)', url: '#', size: '8 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-021 · WO-2026-1116 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Senior BOP engineering authority mobilises to Cameron, NOV and Hydril Houston workshops to witness FAT and SIT on new-build 18-3/4" subsea BOP stacks for ADNOC Offshore and Saudi Aramco offshore. Independent technical proxy where direct operator attendance is not feasible.',
  cardOutcomePills: [
    { label: 'IWCF Supervisor + 15+ yr authority', style: 'good' },
    { label: 'API 16A · 16D · 17D witness', style: 'good' },
    { label: 'Operator stamp + signed report', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: 'PER-PROJECT · 4-8 WEEK',
  cardTagStyle: 'oil',
  cardTagLabel: 'SUBSEA FAT/SIT',

  durationDays: 42,

  seoTitle: 'Subsea BOP Stack FAT and SIT Witness · Operator Engineering Proxy at Cameron, NOV and Hydril Workshops · Indus Hydraulics',
  seoDescription: 'Indus engineering authority mobilises to OEM workshops to witness FAT and SIT on new-build 18-3/4" 15K subsea BOP stacks for ADNOC Offshore and Saudi Aramco offshore. Pre-FAT spec cross-walk, on-site hydrostatic and function-test witness, SIT on BOP + control system + LMRP, NACE MR0175 documentation-pack walk-down, operator-stamp coordination, signed witness report. 4-8 week engagement scheduled against the OEM build slot.',
  focusKeyword: 'subsea BOP FAT SIT witness operator engineering proxy',
}

export default CASE
