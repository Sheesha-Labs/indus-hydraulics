/**
 * Case 18 — 21-1/4" 2K diverter system · API 16A 5-year recertification
 * 2026-05-12 (BOP services migration wave)
 *
 * Recurring API 16A 5-year recertification on 21-1/4" 2K class top-hole
 * diverter systems for offshore jack-ups and platforms drilling shallow-gas
 * zones in the GCC. Strip, NDT, reseal, hydrotest at 3,000 psi, function-test
 * the close-divert sequence, recertify. 4-8 week TAT at the Jebel Ali workshop.
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
  slug: 'diverter-system-recertification-21-1-4-2k-offshore',
  caseNumber: '18',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Diverter · Offshore',
  region: '🇦🇪 UAE · Jebel Ali · ADNOC offshore',
  caseDateLabel: 'API 16A 5-YR CYCLE · OFFSHORE FLEET',
  title: 'A 21-1/4" 2K diverter recert — because shallow gas doesn\'t belong on the rig floor.',
  titleAccent: 'because shallow gas doesn\'t belong on the rig floor',
  deck: 'On every offshore jack-up drilling shallow-gas zones in the GCC, the diverter is the unsung defence that keeps a top-hole kick from reaching the rig floor. API 16A says it gets a full 5-year strip-down, NDT scope, sealing-element renewal, hydrotest at 3,000 psi and a witnessed close-divert function test. We run that programme out of Jebel Ali on a rolling cycle for ADNOC Offshore and Saudi Aramco offshore fleets.',

  heroImageCaption: 'FIG. 01 · 21-1/4" 2K Cameron diverter mid-strip in Bay 4 — sealing element out, overboard valve trim on the bench',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-04-18',

  metaCells: [
    { label: 'Asset', value: '21-1/4"', valueSmall: ' · 2K diverter', style: 'neutral' },
    { label: 'WP', value: '2,000', valueSmall: ' · psi', style: 'neutral' },
    { label: 'Hydrotest', value: '3,000', valueSmall: ' · psi · 30 min', style: 'neutral' },
    { label: 'Recert cycle', value: '5', valueSmall: ' yr · API 16A', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'The asset that protects the rig floor — not the well.'),
    lead(
      'A diverter is not a BOP. The job is the opposite. A BOP shuts the well in; a diverter sends a shallow-gas kick out — port and starboard, overboard, away from the rig floor — because at top-hole depths there is no casing strong enough to contain it. On every offshore jack-up and platform rig drilling the GCC\'s shallow-gas zones, this is the asset that decides whether a top-hole kick becomes a paragraph in the morning report or a headline. <strong>API 16A</strong> gives it a 5-year clock. When the clock runs out, the rig cannot spud the next well.',
    ),
    para(
      'Operators come to us when that 5-year clock is closing. ADNOC Offshore on the <strong>Lower Zakum</strong>, <strong>Upper Zakum</strong> and <strong>Hail & Ghasha</strong> satellite jack-ups; Saudi Aramco offshore on <strong>Marjan</strong>, <strong>Safaniyah</strong> and <strong>Berri</strong>. The brief is always the same shape: pull the diverter at the next rig move, ship it to Jebel Ali, recertify it inside the next slot in the drilling programme, ship it back. The constraint is the rig schedule, not the workshop. Miss the slot and the rig waits — at offshore day-rates that nobody wants to read out loud.',
    ),
    problemSolution(
      {
        label: 'What the operator typically tells us',
        title: '"Diverter is at 4 yr 11 months. Next slot in the programme is November."',
        body: 'A 21-1/4" 2K Cameron / NOV / Hydril diverter, on its way out of the 5-year API 16A window, with a fixed re-installation slot at the next rig move. Operator wants the unit recertified, packaged, and back on a supply boat in time. The clock and the schedule do most of the talking.',
      },
      {
        label: 'What the inspection usually finds',
        title: 'Sealing element on borrowed time, overboard trim eroded, hub bolting at hardness ceiling',
        body: 'The primary sealing element rarely makes it to the 5-year mark in service condition — shallow-gas duty is abrasive. Overboard line valve trim shows wash from the few times the diverter has actually been actuated. Hub bolting often sits at the upper edge of the NACE MR0175 hardness window. None of it goes back to a rig as-is.',
      },
    ),
    para(
      'This is a service offering, not a heroics story. The 5-year diverter recert is a recurring, scheduled, written-down piece of work. We run it the same way every time, document it the same way every time, and hand the operator the same shape of FAT pack every time. <strong>The standard tells you what to do, in what order. Our job is to do it cleanly and on the rig\'s schedule.</strong>',
    ),

    sectionHead('/02', 'solution', 'Strip, NDT, reseal, hydrotest, function-test, recertify.'),
    para(
      'The standard scope on every 21-1/4" 2K diverter recert: full strip to component, every metallic part through the <strong>API 16A Annex C</strong> NDT scope (<strong>MPI</strong> on ferrous bodies, <strong>UT thickness</strong> on body wall and overboard line spools, <strong>dimensional</strong> verification against the OEM datum, <strong>dye-penetrant</strong> on every critical sealing surface, <strong>Rockwell-C hardness</strong> on each forging to confirm <strong>≤ 22 HRC per NACE MR0175 / ISO 15156</strong>), primary sealing element renewed in <strong>HNBR sour-service grade</strong> from the OEM kit, overboard line valve trim replaced, all elastomers refreshed, reassembly to OEM torque chart, hydrostatic shell test at <strong>1.5× 2K WP = 3,000 psi held 30 min</strong>, function test of the close-divert sequence under simulated kick load per <strong>API STD 53</strong>, and the <strong>API 16A 5-year recert stamp</strong>. Body castings are typically <strong>AISI 4130</strong> with <strong>Inconel-625</strong> cladding on the seal lands; hub bolting is <strong>ASTM A193 B7M</strong> with 2HM nuts.',
    ),
    para(
      'The standard deliverables: a 12-page intake report on the operator\'s desk by day 3, an NDT findings report by day 10, a costed change-order for any out-of-scope renewals before Phase 03 begins, a witnessed FAT on the bench in Phase 04, and an 80–100 page FAT pack with NDT records, hardness logs, torque sheets, hydrotest curves, function records, and the new <strong>API 16A 5-year cert</strong> dated and counter-signed. Mobilisation to and from the offshore platform is by supply boat or helicopter — coordinated through the operator\'s logistics desk and our offshore mobilisation lead.',
    ),
    figure(
      'Day 18, Bay 4. Diverter body open, primary sealing element out for replacement, port overboard valve on the bench for trim renewal. The yellow-handled lever in frame is the manual override for the close-divert sequence — function-tested every recert.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"21-1/4 2K Cameron diverter mid-strip, sealing element out, overboard valve on bench\\n1200×675"',
      },
    ),
    pullQuote(
      'A diverter is the asset nobody talks about until the morning the alarm goes off on a 200 m hole. By then it\'s either ready or it isn\'t. Our job is to make sure that on the day it gets called on, it does what API 16A says it will do — vent the kick, save the floor.',
      '— Omar Al Maktoum · Lead Diverter Technician · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, 4–8 week cycle, one signed FAT pack.'),
    para(
      'Every 21-1/4" 2K diverter recert at Jebel Ali runs through the same four phases. Total bench time depends on findings — 4 weeks for a clean unit, 8 weeks if hub bolting needs full replacement and a body weld repair gets pulled in. The phases themselves do not change.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt & condition assessment',
        body: 'Diverter off the supply boat, weighbridge, photo log, fluid drain, witness sample. Pre-strip dimensional and a 12-page intake report on the operator\'s desk by day 3.',
        duration: 'Days 0 — 3',
      },
      {
        number: 'PHASE 02',
        title: 'NDT & dimensional',
        body: 'Strip to component. MPI on every ferrous part, UT thickness on body and overboard spools, dimensional vs OEM datum, hardness Rockwell C, dye-penetrant on seal lands. Findings logged.',
        duration: 'Days 4 — 10',
      },
      {
        number: 'PHASE 03',
        title: 'Recondition & rebuild',
        body: 'Primary sealing element renewed, overboard valve trim replaced, every elastomer refreshed, reassembly in OEM sequence with torque records on every fastener.',
        duration: 'Days 11 — 25',
      },
      {
        number: 'PHASE 04',
        title: 'Test, FAT & mobilisation',
        body: 'Hydrostatic shell at 1.5× 2K = 3,000 psi held 30 min. Function test of the close-divert sequence. Operator-witnessed sign-off. FAT pack issued. Supply boat or helicopter back to platform.',
        duration: 'Days 26 — 35',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we run on every diverter recert.'),
    para(
      'Below is the standard SOP we tick off, in order, on every 21-1/4" 2K class diverter that comes through Jebel Ali for an API 16A 5-year recert. The full document runs 56 lines. This is the abridged version — every row is real.',
    ),
    sopBlock(
      'SOP-OG-024 · DIVERTER 5-YEAR API 16A RECERT · REV 04 · NACE',
      '18 / 18 STANDARD',
      [
        {
          name: 'Phase 01 · Receipt & condition assessment',
          rows: [
            { task: 'Goods-in inspection & weighbridge', detail: 'Diverter weighed; photo log against waybill; supply-boat manifest cross-checked; visible damage survey', who: 'Y. AL HASHIMI', tool: 'Crane bay' },
            { task: 'Hydraulic fluid drain & witness sample', detail: 'Operating circuit drained; sample retained for cleanliness ISO 4406; volume reconciled to OEM spec', who: 'O. AL MAKTOUM', tool: 'Drain rig' },
            { task: 'Pre-strip dimensional', detail: 'Bore, hub flange flatness, overboard line spool alignment vs OEM datum (Cameron / NOV / Hydril)', who: 'A. AL SUWAIDI', tool: 'CMM + bore mic' },
            { task: 'Sour-service classification confirm', detail: 'Operator H₂S data reviewed; NACE MR0175 / ISO 15156 default applies in full unless waived in writing', who: 'QA', tool: 'Operator gas data' },
            { task: 'Intake report · 12 pp PDF', detail: 'Photos, baseline dimensions, fluid sample result, recommended NDT scope, on operator desk by day 3', who: 'Y. AL HASHIMI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 02 · NDT & dimensional',
          rows: [
            { task: 'Hub break-out & sealing-element extraction', detail: 'Hydraulic torque tool, breakout sequence per OEM service manual; primary element to bench for measurement', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'MPI · all ferrous components', detail: 'Wet fluorescent, body, overboard spools, hub flanges, valve bodies; per ASME V Art. 7', who: 'A. AL SUWAIDI', tool: 'MPI bench' },
            { task: 'UT thickness · body & overboard spools', detail: 'Min wall vs OEM scrap dim; emphasis on overboard elbows where shallow-gas wash occurs', who: 'A. AL SUWAIDI', tool: 'UT gauge' },
            { task: 'Hardness Rockwell C · NACE MR0175', detail: 'All forgings tested ≤ 22 HRC; every test logged with location & operator; hub bolting individually verified', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'Dye-penetrant on sealing surfaces', detail: 'Hub faces, sealing-element seat, overboard valve seats; per ASME V Art. 6', who: 'A. AL SUWAIDI', tool: 'DPI kit' },
            { task: 'NDT findings report · 14 pp PDF', detail: 'One row per part, status, action; basis for change-order PO before Phase 03 begins', who: 'A. AL SUWAIDI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 03 · Recondition & rebuild',
          rows: [
            { task: 'Primary sealing element renewal', detail: 'OEM HNBR sour-service element fitted; geometry verified against datum; cure-date on certificate within window', who: 'H. AL AWADI', tool: 'OEM kit' },
            { task: 'Overboard valve trim replacement · port + stbd', detail: 'New trim sets installed; valve bodies bench-tested at 3,000 psi pre-install; both lines symmetrical', who: 'O. AL MAKTOUM', tool: 'OEM stock' },
            { task: 'Renew all elastomers · HNBR sour-service', detail: 'Hub seals, valve stem packing, hydraulic piston seals, wear rings — full kit, no exceptions', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Hub bolting · A193 B7M / 2HM', detail: 'New studs and nuts to OEM torque chart; per API 6A bolting practice; every torque recorded', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'Reassemble per OEM sequence', detail: 'Body closed, overboard spools landed, sealing element seated; calibrated torque on every fastener', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
          ],
        },
        {
          name: 'Phase 04 · Test, FAT & mobilisation',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× WP', detail: '3,000 psi held 30 min · zero pressure drop measured at 0.1% gauge resolution; chart retained', who: 'A. AL SUWAIDI', tool: 'Hydrotest rig' },
            { task: 'Function test · close-divert sequence', detail: 'Simulated kick load · sealing element closes, overboard valves open port + stbd; timing logged per API STD 53', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Operator-witnessed sign-off', detail: 'ADNOC Offshore / Aramco offshore engineer present for shell + function tests; counter-signature on cert', who: 'Y. AL HASHIMI', tool: 'On-site' },
            { task: 'FAT package · 80–100 pp', detail: 'NDT records, hardness logs, torque sheets, hydrotest curve, function records, API 16A 5-year cert', who: 'Y. AL HASHIMI', tool: 'PDF + paper' },
            { task: 'Supply boat / helicopter mobilisation', detail: 'Diverter loaded with shell-pressurised valves, dust covers, transit log; offshore lead coordinates with logistics', who: 'K. AL MARZOUQI', tool: 'Logistics' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find on a 5-year diverter.'),
    para(
      'Below is the typical findings sheet on a 21-1/4" 2K diverter at the 5-year mark. The numbers vary unit by unit; the pattern doesn\'t. Three findings — sealing element, overboard trim, hub bolting — are flagged on almost every recert. Your unit will have its own version of this table in the FAT pack.',
    ),
    specTable(
      'TYPICAL FINDINGS · 21-1/4" 2K DIVERTER · 5-YEAR RECERT · SOUR SERVICE',
      [
        {
          component: 'Primary sealing element',
          spec: 'HNBR sour-service · OEM',
          asFound: 'Original element, end-of-life',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed every recert',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Overboard valve trim · port + stbd',
          spec: 'OEM trim sets',
          asFound: 'Wash on seats, leak past',
          afterRebuild: 'New trim · 3,000 psi pass',
          status: '↻ Renewed every recert',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hub bolting hardness · A193 B7M',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '21.6 HRC avg (n=24)',
          afterRebuild: 'New B7M · 21.0 avg',
          status: '↻ All studs replaced',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Hub face flatness',
          spec: '≤ 0.025 mm vs datum',
          asFound: '0.018 mm typical',
          afterRebuild: '0.012 mm post-clean',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Body wall UT thickness · min',
          spec: '≥ 95% of OEM nominal',
          asFound: '97.4% of nominal',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Overboard spool wall · UT thickness',
          spec: '≥ 90% of OEM nominal',
          asFound: '92.1% (port elbow min)',
          afterRebuild: 'No change · pass',
          status: '✓ Pass · monitor',
          asFoundStyle: 'num',
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
          component: 'Hydraulic operating piston',
          spec: 'OEM tolerance · HNBR seals',
          asFound: 'Light bore wear · seals tired',
          afterRebuild: 'Honed, new HNBR pack',
          status: '↻ Resealed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test',
          spec: '3,000 psi · 30 min hold',
          asFound: '—',
          afterRebuild: '3,000 psi · 0 psi drop',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Close-divert function · sealing element',
          spec: 'Closes under kick load',
          asFound: '—',
          afterRebuild: 'Closes & seats clean',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Close-divert function · overboard valves',
          spec: 'Both open · port + stbd',
          asFound: '—',
          afterRebuild: 'Both open in sequence',
          status: '✓ Pass',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What you can expect on a typical engagement.'),
    para(
      'A typical 21-1/4" 2K diverter recert exits the test bench at week 4–5 for a clean unit, week 7–8 if findings drag a body weld or full hub-bolting renewal into scope. The operator-witnessed FAT happens on the bench at the end of Phase 04, the 80–100 page FAT pack ships with the unit, and the new <strong>API 16A 5-year recert</strong> is valid for the next five years to the day. Mobilisation back to the platform is supply boat from Jebel Ali or Mina Zayed, or helicopter from the operator\'s onshore base if the rig schedule cannot wait. Most units are back on the riser inside ten days of the FAT.',
    ),
    resultBox(
      'Result · summary',
      '21-1/4" 2K diverter back on the offshore rig with a fresh 5-year API 16A recert and a witnessed close-divert function record.',
      'Standard scope: full strip-to-component rebuild, NDT on every metallic, NACE-traceable HNBR sealing element renewal, overboard valve trim replacement port + starboard, hydrotest at 3,000 psi held 30 min with zero drop, operator-witnessed close-divert function test under simulated kick load, 80–100 page FAT pack and new API 16A cert valid for the next 5 years.',
      [
        { value: '4 — 8', valueSmall: ' wk', label: 'Bench TAT', style: 'accent' },
        { value: '3,000', valueSmall: ' psi · 0 drop', label: 'Hydrotest target', style: 'good' },
        { value: '5', valueSmall: ' yr', label: 'API 16A recert validity', style: 'good' },
        { value: '80 — 100', valueSmall: ' pp', label: 'FAT pack' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew that runs the diverter cycle.'),
    teamList(
      'Five core engineers in Jebel Ali run the rolling diverter recert programme. The same crew sees every unit through every phase — it\'s why the SOP runs on rails and the FAT pack lands the same shape every time. If you call the workshop and ask about diverter case 18, any of them can pull the file.',
      [
        { name: 'Yusuf Al Hashimi', role: 'Diverter Workshop Manager', location: 'Jebel Ali', scope: 'Goods-in, planning, weighbridge, FAT scheduling, low-loader release. Owns the work-order file end to end.' },
        { name: 'Aisha Al Suwaidi', role: 'NDT / QA Inspector', location: 'Jebel Ali', scope: 'MPI, UT thickness, hardness Rockwell C, dimensional CMM, dye-penetrant. Signs every NDT record on the FAT pack.' },
        { name: 'Omar Al Maktoum', role: 'Lead Diverter Technician', location: 'Jebel Ali', scope: 'Strip-down, sealing-element extraction, valve trim renewal, reassembly to OEM torque chart, function test under kick load.' },
        { name: 'Khalid Al Marzouqi', role: 'Offshore Mobilisation Lead', location: 'Jebel Ali', scope: 'Operator liaison, supply-boat and helicopter logistics, platform handover, rig-up coordination at the riser.' },
        { name: 'Hassan Al Awadi', role: 'Sealing Element Specialist', location: 'Jebel Ali', scope: 'OEM HNBR element fit and seating verification, cure-date traceability, hub seal pack renewal, geometry vs datum.' },
      ],
      'Case file · SOP-OG-024 · Programme: Diverter 5-yr API 16A recert · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'A diverter is the asset that protects the rig floor, not the well. People remember BOPs because BOPs shut wells in. Diverters get talked about on the day they save a top-hole. That\'s the whole job — be ready for that day, with the API 16A cert in the file.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Diverter Workshop Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: '21-1/4" 2K diverter' },
    { label: 'OEM', value: 'Cameron / NOV / Hydril' },
    { label: 'Service', value: 'Top-hole shallow gas / NACE MR0175' },
    { label: 'Working pressure', value: '2,000 psi' },
    { label: 'Hydrotest', value: '3,000 psi · 30 min' },
    { label: 'Body material', value: 'AISI 4130 + Inconel-625' },
    { label: 'Hub bolting', value: 'A193 B7M / 2HM' },
    { label: 'Sealing element', value: 'HNBR · OEM kit' },
    { label: 'Standard', value: 'API 16A · API STD 53' },
    { label: 'Recert validity', value: '5 years' },
    { label: 'TAT', value: '4 — 8 weeks at Jebel Ali' },
  ],
  galleryTotalCount: 36,
  downloads: [
    { label: 'Diverter recert SOP-OG-024 (PDF)', url: '#', size: '14 pp', format: 'PDF' },
    { label: 'Typical NDT findings template (PDF)', url: '#', size: '14 pp', format: 'PDF' },
    { label: 'NACE / hardness logs (ZIP sample)', url: '#', size: '11 MB', format: 'ZIP' },
    { label: 'FAT pack template & API 16A cert (PDF)', url: '#', size: '92 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · SOP-OG-024 · Programme: Diverter 5-yr API 16A recert · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Recurring API 16A 5-year recertification on 21-1/4" 2K class top-hole diverter systems for ADNOC Offshore and Saudi Aramco offshore jack-ups. Strip, NDT, reseal, hydrotest at 3,000 psi, witnessed close-divert function test, 5-year recert stamp. 4–8 week cycle out of Jebel Ali.',
  cardOutcomePills: [
    { label: 'Hydrotest 3,000 psi · 0 drop', style: 'good' },
    { label: 'Close-divert function · witnessed', style: 'good' },
    { label: 'API 16A recert · 5 yr validity', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: '4-8 WEEK CYCLE',
  cardTagStyle: 'oil',
  cardTagLabel: 'DIVERTER RECERT',

  durationDays: 35,

  seoTitle: '21-1/4" 2K Diverter System · 5-Year API 16A Recertification · Offshore · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Service offering: recurring 5-year API 16A recertification on 21-1/4" 2K class top-hole diverter systems (Cameron / NOV / Hydril) for ADNOC Offshore (Lower Zakum, Upper Zakum, Hail & Ghasha) and Saudi Aramco offshore (Marjan, Safaniyah, Berri) jack-ups. Full strip, component-level NDT, NACE MR0175 hardness verification, HNBR sealing element renewal, overboard line valve trim replacement, 3,000 psi hydrostatic shell test, witnessed close-divert function test under simulated kick load, 5-year recert stamp. 4–8 week cycle at our Jebel Ali workshop.',
  focusKeyword: '21-1/4 2k diverter system api 16a 5-year recertification jebel ali offshore',
}

export default CASE
