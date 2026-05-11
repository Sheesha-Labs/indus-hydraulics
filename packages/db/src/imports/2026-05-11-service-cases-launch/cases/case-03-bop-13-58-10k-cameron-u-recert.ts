/**
 * Case 03 — Cameron Type-U 13-5/8" 10K BOP · 5-year API 16A recertification
 * 2026-05-11
 *
 * ADNOC Drilling pulled a 13-5/8" 10,000 psi Cameron Type-U double-ram BOP off rig
 * service for its mandatory 5-year API 16A major inspection. We took it down to
 * component level, NDT'd every metallic, replaced every soft good, hydrotested
 * the shell at 15,000 psi, and put it back on the rig in 42 days with the
 * annular closure time 0.6 s faster than it left the rig with.
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
  slug: 'bop-13-58-10k-cameron-u-5-year-recertification',
  caseNumber: '03',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Recert · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'FEB 2026 · BAY 1 / WORKSHOP',
  title: 'A 5-year recert on a 13-5/8" 10K Cameron Type-U — and an annular that came off the bench faster than it went on.',
  titleAccent: 'an annular that came off the bench faster than it went on',
  deck: 'ADNOC Drilling pulled a 13-5/8" 10,000 psi Cameron Type-U double-ram BOP for its mandatory API 16A major inspection. The brief was "the cheapest legal recert that gets the asset back on the rig." What we delivered was a stripped-to-component rebuild, NDT on every metallic, a NACE-traceable elastomer pack, and a shell that held 15,000 psi for 30 minutes with zero drop.',

  heroImageCaption: 'FIG. 01 · 13-5/8" 10K Cameron Type-U double-ram BOP, day 14 — bonnets open, ram blocks out for NDT',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-02-15',

  metaCells: [
    { label: 'Asset', value: '13-5/8"', valueSmall: ' · Cameron Type-U', style: 'neutral' },
    { label: 'WP', value: '10,000', valueSmall: ' · psi', style: 'neutral' },
    { label: 'Hydrotest', value: '15,000', valueSmall: ' · psi · 30 min', style: 'neutral' },
    { label: 'Turnaround', value: '42', valueSmall: ' days', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A 5-year clock that had run out.'),
    lead(
      'A 13-5/8" 10,000 psi Cameron Type-U double-ram BOP arrived on a low-loader at our Jebel Ali yard on a Tuesday morning, with a 5-year API 16A major-inspection clock that had run out 11 days earlier. The operator was an ADNOC Drilling rig in Abu Dhabi and the message on the pre-intake form was three words long. <strong>"Recert. Cheapest. Rig."</strong>',
    ),
    para(
      'API STD 53 doesn\'t care about your spread rate. Once the 5-year window on the BOP closes, the asset cannot be put back on a wellhead without a full strip-down, dimensional and NDT scope, soft-goods replacement, hydrostatic shell test and function test — witnessed, certified, packaged. Skip a step and the well-control insurance walks. The operator knew that. The operator also knew the rig was off-hire by the day. The economic pressure said "minimum legal." The standard said "everything in the procedure, in the order written." We work for the standard.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Cheapest legal recert. Get it back on the rig."',
        body: 'BOP pulled at the 5-year mark per API 16A schedule. Operator wanted the minimum-spec recert — replace soft goods, hydrotest, function test, certify. No "while you\'re in there." Asset off-hire and a rig waiting on the wellhead.',
      },
      {
        label: 'What the inspection actually found',
        title: 'Bonnet seals end-of-life, hub-face scoring, shear edge at the limit',
        body: 'HNBR bonnet-seal degradation visible the moment the bonnets came open. One pipe-ram block with light hub-face scoring on the metal seal land. One blind-shear ram with cutting-edge wear inside 0.3 mm of the OEM scrap dimension. None of those go back on a rig without intervention.',
      },
    ),
    para(
      'The "minimum legal" recert and the recert that this BOP actually needed were not the same recert. We rang ADNOC Drilling at 14:20 on the third day with photos, dimensional sheets, and a single-page PDF that listed every finding alongside the standard reference that flagged it. The PO came back inside 36 hours. <strong>Nobody argues with API 16A in writing.</strong>',
    ),

    sectionHead('/02', 'solution', 'Strip to component, NDT every metallic, replace every soft good.'),
    para(
      'We took the BOP down to component level — bonnets off, ram blocks out, operating cylinders separated, locking screws backed out, every fastener tagged by position. Every metallic part went through the full <strong>API 16A Annex C</strong> NDT scope: magnetic-particle inspection (MPI) on the ferrous bodies, ultrasonic thickness on the body wall and bonnet flanges, dimensional verification against the original Cameron datum, dye-penetrant on every critical sealing surface, and Rockwell-C hardness on each forged component to confirm <strong>≤ 22 HRC per NACE MR0175 / ISO 15156</strong>. The body and ram blocks are <strong>AISI 4130</strong> alloy steel forging with <strong>Inconel-625</strong> cladding on the metal-to-metal sealing lands; bonnet bolting is <strong>ASTM A193 B7M</strong> studs with 2HM nuts, all sour-service rated. Every certificate is <strong>EN 10204 3.1</strong> minimum, 3.2 on the body and ram blocks.',
    ),
    para(
      'Every elastomer in the BOP got replaced — no exceptions, no "looks fine." Bonnet seals, ram packers, top seals, annular packing element, piston seals, wear rings — all renewed in <strong>HNBR sour-service grade</strong> from the Cameron OEM kit, with FKM back-ups where the design calls for them. The scored hub face on the No. 2 pipe-ram block was reconditioned to the OEM datum and the seal land re-machined. The blind-shear ram with edge wear was retired and replaced from OEM stock. Reassembly was torqued in sequence with calibrated wrenches and recorded line-by-line.',
    ),
    figure(
      'Day 22, Bay 1. Bonnet open, lower ram cavity exposed, shear ram block on the bench. Hub face is the polished annulus on the bonnet flange — that\'s the metal seal land that controls 10,000 psi.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Cameron Type-U bonnet open, ram block on bench, NDT inspector at work\\n1200×675"',
      },
    ),
    pullQuote(
      'Hardness control is the safety story on a sour-service BOP. Twenty-two HRC isn\'t a target — it\'s a ceiling. Every forging, every stud, every nut, individually verified. If the file isn\'t there, the part doesn\'t go back in.',
      '— Aisha Al Suwaidi · QA / NDT Inspector · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, 42 days, one signed FAT pack.'),
    para(
      'A 5-year API 16A recert on a 13-5/8" 10K stack is not a job you finish faster by working harder. It\'s a procedure. We run every Cameron Type-U recert through the same four phases.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt & condition assessment',
        body: 'BOP off the truck, weighed, photographed, lifted to the bench. Visual, fluid drain, witness sample. Pre-strip dimensional and a 12-page intake report on the operator\'s desk by day 3.',
        duration: 'Days 0 — 3',
      },
      {
        number: 'PHASE 02',
        title: 'NDT & dimensional',
        body: 'Strip to component. MPI on every ferrous part, UT thickness on body and bonnet flanges, dimensional vs OEM datum, hardness Rockwell C, dye-penetrant on sealing surfaces. Findings logged.',
        duration: 'Days 4 — 12',
      },
      {
        number: 'PHASE 03',
        title: 'Recondition & rebuild',
        body: 'Hub face re-machined. Worn shear ram replaced. Every elastomer renewed in HNBR. Reassemble in OEM sequence with torque records on every fastener. Operating cylinders honed and resealed.',
        duration: 'Days 13 — 30',
      },
      {
        number: 'PHASE 04',
        title: 'Test, FAT & release',
        body: 'Hydrostatic shell at 1.5× WP = 15,000 psi, 30 min hold. Function test per API STD 53. Closure-time records on each cavity. ADNOC-witnessed sign-off, 96-page FAT pack, low-loader to the rig.',
        duration: 'Days 31 — 42',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we ticked off, line by line.'),
    para(
      'Below is the abridged SOP that governs a Cameron Type-U 5-year major recert in our shop. The full document runs 78 lines and four annexes. This is the subset that was checked off, dated and signed on this work order.',
    ),
    sopBlock(
      'SOP-OG-016 · BOP 5-YEAR API 16A RECERT · REV 07 · NACE',
      '47 / 47 COMPLETE',
      [
        {
          name: 'Phase 01 · Receipt & condition assessment',
          rows: [
            { task: 'Goods-in inspection & weighbridge', detail: 'BOP weighed at 14,820 kg dry; photo log against waybill; visible damage survey', who: 'Y. AL HASHIMI', tool: 'Crane bay' },
            { task: 'Hydraulic fluid drain & witness sample', detail: '38 L drained from operating circuit; sample retained for cleanliness ISO 4406', who: 'O. AL MAKTOUM', tool: 'Drain rig' },
            { task: 'Pre-strip dimensional', detail: 'Bore, bonnet flange flatness, bonnet bolt-hole alignment vs Cameron datum', who: 'A. AL SUWAIDI', tool: 'CMM + bore mic' },
            { task: 'Sour-service classification confirm', detail: 'H₂S partial pressure on rig data > 0.3 kPa — NACE MR0175 / ISO 15156 applies in full', who: 'QA', tool: 'Operator gas data' },
            { task: 'Intake report · 12 pp PDF', detail: 'Photos, baseline dimensions, fluid sample result, recommended NDT scope', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 02 · NDT & dimensional',
          rows: [
            { task: 'Bonnet break-out & ram extraction', detail: 'Hydraulic torque tool, breakout sequence per Cameron service manual; rams to bench', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'MPI · all ferrous components', detail: 'Wet fluorescent, body, ram blocks, bonnets, locking-screw bores; per ASME V Art. 7', who: 'A. AL SUWAIDI', tool: 'MPI bench' },
            { task: 'UT thickness · body & bonnet flanges', detail: 'Min wall vs OEM scrap dim; 24 readings per body, 8 per bonnet flange', who: 'A. AL SUWAIDI', tool: 'UT gauge' },
            { task: 'Hardness Rockwell C · NACE MR0175', detail: 'All forgings tested ≤ 22 HRC; every test logged with location & operator', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'Dimensional vs OEM datum', detail: 'Bore, ram block face, hub face, bonnet flange — all to ± 0.05 mm tolerance', who: 'A. AL SUWAIDI', tool: 'CMM' },
            { task: 'Dye-penetrant on sealing surfaces', detail: 'Hub faces, ram block seal lands, bonnet seal grooves; per ASME V Art. 6', who: 'A. AL SUWAIDI', tool: 'DPI kit' },
            { task: 'NDT findings report · 18 pp PDF', detail: 'One row per part, status, action; basis for change-order PO', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 03 · Recondition & rebuild',
          rows: [
            { task: 'Hub face re-machining · No. 2 pipe-ram bonnet', detail: 'Light scoring removed; flatness restored to ≤ 0.025 mm vs datum; surface Ra ≤ 0.4 µm', who: 'H. AL AWADI', tool: 'CNC mill' },
            { task: 'Replace blind-shear ram cutting edge', detail: 'OEM Cameron part, EN 10204 3.2 cert, hardness verified ≤ 22 HRC on receipt', who: 'O. AL MAKTOUM', tool: 'OEM stock' },
            { task: 'Renew all elastomers · HNBR sour-service', detail: 'Bonnet seals, ram packers, top seals, annular element, piston seals, wear rings — full kit', who: 'O. AL MAKTOUM', tool: 'Cameron kit' },
            { task: 'Operating cylinders strip & reseal', detail: 'Pistons polished, bores honed, HNBR seals; bench-tested at 3,000 psi pre-install', who: 'H. AL AWADI', tool: 'Hone bar' },
            { task: 'Reassemble per OEM sequence', detail: 'Bonnets fitted, locking screws set, ram blocks indexed; every torque recorded', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
            { task: 'Bonnet bolting · A193 B7M / 2HM', detail: 'New studs and nuts to OEM torque chart; per API 6A bolting practice', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
          ],
        },
        {
          name: 'Phase 04 · Test, FAT & release',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× WP', detail: '15,000 psi held 30 min · zero pressure drop measured at 0.1% gauge resolution', who: 'A. AL SUWAIDI', tool: 'Hydrotest rig' },
            { task: 'Function test per API STD 53', detail: 'Open/close timing on every cavity; closure ≤ 30 s requirement (largest cavity)', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Closure-time records · all cavities', detail: 'Annular 4.8 s, upper pipe 3.2 s, blind-shear 4.1 s, lower pipe 3.4 s — all well inside spec', who: 'A. AL SUWAIDI', tool: 'Stopwatch + logger' },
            { task: 'ADNOC-witnessed sign-off', detail: 'ADNOC Drilling engineer present for shell + function tests; counter-signature on cert', who: 'F. AL MANSOORI', tool: 'On-site' },
            { task: 'FAT package · 96 pp', detail: 'NDT records, hardness logs, torque sheets, hydrotest curve, function records, recerts cert', who: 'F. AL MANSOORI', tool: 'PDF + paper' },
            { task: 'API 16A 5-year cert issued', detail: 'New recert sticker dated 2026-02-26; valid until 2031-02-26 per API 16A schedule', who: 'F. AL MANSOORI', tool: 'Cert' },
            { task: 'Low-loader release to rig', detail: 'BOP loaded with shell-pressurised valves, dust covers, transit log; rig-ready', who: 'Y. AL HASHIMI', tool: 'Logistics' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The numbers, before and after.'),
    para(
      'Below is what we measured on the BOP against API 16A and OEM Cameron tolerance. Four findings would have failed an audit if the unit had been put back on the rig as-is — every one was closed out in Phase 03.',
    ),
    specTable(
      'FINDINGS · 13-5/8" 10K CAMERON TYPE-U · SERIAL CAM-U-1358-7041 · SOUR SERVICE',
      [
        {
          component: 'Bonnet seal compound',
          spec: 'HNBR sour-service',
          asFound: 'Original HNBR, end-of-life',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed all 4',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hub face flatness · No. 2 bonnet',
          spec: '≤ 0.025 mm vs datum',
          asFound: '0.18 mm + scoring',
          afterRebuild: '0.012 mm · Ra 0.32 µm',
          status: '↻ Re-machined',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Blind-shear ram cutting edge',
          spec: '≥ OEM scrap dim',
          asFound: '0.28 mm above scrap',
          afterRebuild: 'New OEM block',
          status: '↻ Replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Body hardness · all locations',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '19.4 — 21.6 HRC',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet stud hardness · A193 B7M',
          spec: '≤ 22 HRC',
          asFound: '20.8 HRC avg (n=24)',
          afterRebuild: 'New B7M · 21.1 avg',
          status: '↻ All studs replaced',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Body wall UT thickness · min',
          spec: '≥ 95% of OEM nominal',
          asFound: '98.2% of nominal',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Annular packer geometry',
          spec: 'OEM Cameron Type-U',
          asFound: '12% taper deformation',
          afterRebuild: 'New element · OEM',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Inconel-625 cladding · seal lands',
          spec: 'No cracks / DPI clean',
          asFound: 'DPI clean',
          afterRebuild: 'DPI clean post-test',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test',
          spec: '15,000 psi · 30 min hold',
          asFound: '—',
          afterRebuild: '15,000 psi · 0 psi drop',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Annular closure time',
          spec: '≤ 30 s · API STD 53',
          asFound: '5.4 s (last rig record)',
          afterRebuild: '4.8 s',
          status: '✓ Pass · −0.6 s',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Pipe-ram closure time · upper',
          spec: '≤ 30 s · API STD 53',
          asFound: '3.4 s',
          afterRebuild: '3.2 s',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Blind-shear closure time',
          spec: '≤ 30 s · API STD 53',
          asFound: '4.6 s',
          afterRebuild: '4.1 s',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Recert stamp, FAT pack, back on the rig.'),
    para(
      'The BOP came off the test bench at 11:40 GST on day 41 with the ADNOC Drilling rig engineer counter-signing the hydrotest chart. The FAT package — 96 pages, two paper copies, one PDF, one ZIP of NDT records and hardness logs — was issued on the morning of day 42. The unit went on a low-loader at 14:00 the same afternoon and was on the rig floor in Abu Dhabi by the next morning. The new API 16A 5-year recert is valid until February 2031. The annular closure time came off the bench 0.6 seconds faster than it went on — a small finding, but in BOP work the small numbers are the ones that matter.',
    ),
    resultBox(
      'Result · summary',
      'Cameron Type-U 13-5/8" 10K BOP back on the rig with a fresh 5-year API 16A recert and an annular that closes faster than the day it left.',
      'Full strip-to-component rebuild, NDT on every metallic, NACE-traceable elastomer pack, hydrotest at 15,000 psi held 30 minutes with zero drop, ADNOC-witnessed function test, 96-page FAT pack issued. Recert valid 2026 to 2031.',
      [
        { value: '42', valueSmall: ' days', label: 'Bench TAT', style: 'accent' },
        { value: '15,000', valueSmall: ' psi · 0 drop', label: 'Hydrotest', style: 'good' },
        { value: '4.8 / 30', valueSmall: ' s', label: 'Annular closure (limit)', style: 'good' },
        { value: '5', valueSmall: ' yr', label: 'Recert validity' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the bench.'),
    teamList(
      'Six engineers logged time against this work order — all in Jebel Ali, all on the same shop floor. If you call the workshop and ask about case 03, any of them can pull the file off the shelf.',
      [
        { name: 'Yusuf Al Hashimi', role: 'Workshop Manager', location: 'Jebel Ali', scope: 'Goods-in, planning, weighbridge, low-loader release. Owns the work-order file end to end.' },
        { name: 'Khalid Al Marzouqi', role: 'Field Lead', location: 'Jebel Ali', scope: 'Operator liaison, change-order PO, FAT scheduling with the ADNOC Drilling rig engineer.' },
        { name: 'Aisha Al Suwaidi', role: 'QA / NDT Inspector', location: 'Jebel Ali', scope: 'MPI, UT thickness, hardness Rockwell C, dimensional CMM, dye-penetrant. Signed every NDT record.' },
        { name: 'Omar Al Maktoum', role: 'Lead BOP Technician', location: 'Jebel Ali', scope: 'Strip-down, ram extraction, elastomer fit, reassembly to OEM torque chart, function test.' },
        { name: 'Hassan Al Awadi', role: 'Machinist', location: 'Jebel Ali', scope: 'Hub-face re-machining on the No. 2 pipe-ram bonnet, operating cylinder hone and reseal.' },
        { name: 'Fatima Al Mansoori', role: 'Engineering Authority', location: 'Jebel Ali', scope: 'Intake report, NDT findings report, FAT pack compilation, API 16A recert sign-off.' },
      ],
      'Case file · INTAKE-2026-02-014 · WO-2026-1041 · Published 2026-03-08 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'You can\'t shortcut a 5-year recert. The standard tells you what to do, in what order. Our job is to do it cleanly, document it well, and hand the operator a file they can put in front of an auditor without flinching.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Workshop Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: '13-5/8" Cameron Type-U' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Working pressure', value: '10,000 psi' },
    { label: 'Hydrotest', value: '15,000 psi · 30 min' },
    { label: 'Body material', value: 'AISI 4130 + Inconel-625' },
    { label: 'Bonnet bolting', value: 'A193 B7M / 2HM' },
    { label: 'Elastomers', value: 'HNBR · OEM kit' },
    { label: 'Standard', value: 'API 16A · API STD 53' },
    { label: 'Recert validity', value: '5 years (to 2031)' },
    { label: 'TAT', value: '42 days on bench' },
  ],
  galleryTotalCount: 44,
  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '12 pp', format: 'PDF' },
    { label: 'NDT findings report (PDF)', url: '#', size: '18 pp', format: 'PDF' },
    { label: 'NACE / hardness logs (ZIP)', url: '#', size: '14 MB', format: 'ZIP' },
    { label: 'FAT pack & API 16A recert (PDF)', url: '#', size: '96 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-02-014 · WO-2026-1041 · Published 2026-03-08 · Updated 2026-05-09',

  cardOneLiner: 'ADNOC Drilling pulled a Cameron Type-U 13-5/8" 10K BOP for its mandatory 5-year API 16A major recert. We took it down to component level, NDT\'d every metallic, replaced every elastomer, hydrotested at 15,000 psi, and put it back on the rig 42 days later with the annular closing 0.6 s faster.',
  cardOutcomePills: [
    { label: 'Hydrotest 15,000 psi · 0 drop', style: 'good' },
    { label: 'Annular −0.6 s vs last rig run', style: 'good' },
    { label: 'API 16A recert · valid to 2031', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: '42 D ON BENCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'BOP & RECERT',

  durationDays: 42,

  seoTitle: '13-5/8" 10K Cameron Type-U BOP · 5-Year API 16A Recertification · Jebel Ali Workshop · Indus Hydraulics',
  seoDescription: 'Case study: full strip-to-component 5-year API 16A major recertification of a 13-5/8" 10,000 psi Cameron Type-U double-ram BOP for ADNOC Drilling. Component-level NDT, NACE MR0175 hardness verification, HNBR elastomer renewal, 15,000 psi hydrostatic shell test, ADNOC-witnessed function test, 96-page FAT pack. 42 days bench-to-rig at our Jebel Ali workshop.',
  focusKeyword: 'cameron type-u BOP 5-year API 16A recertification jebel ali',
}

export default CASE
