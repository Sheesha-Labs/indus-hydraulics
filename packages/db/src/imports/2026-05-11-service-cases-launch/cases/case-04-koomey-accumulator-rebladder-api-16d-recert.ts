/**
 * Case 04 — Koomey Type 80 BOP control unit · API 16D 5-year recert
 * 2026-05-11
 *
 * KOC pulled an 11-station Koomey closing unit off a sour-gas drilling rig in
 * northern Kuwait one month before its 5-year API 16D clock ran out. We
 * rebladdered all 11 nitrogen accumulators, overhauled the SPM valves, recharged
 * to 1,000 psi N₂ on traceable bottles, and put the API 16D recert stamp back
 * on the unit in 8 days on the bench.
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
  slug: 'koomey-accumulator-rebladder-api-16d-recert',
  caseNumber: '04',
  isFeatured: false,

  category: 'bop_pressure_control',
  topicLabel: 'Koomey · API 16D · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'JAN 2026 · BAY 3 / WORKSHOP',
  title: 'Eleven nitrogen bottles, four spent bladders, and an API 16D 5-year clock with thirty days left.',
  titleAccent: 'an API 16D 5-year clock with thirty days left',
  deck:
    'A KOC Koomey Type 80 closing unit came in from a sour-gas rig in northern Kuwait at 4 years 11 months on the meter. We rebladdered all eleven accumulators, overhauled the SPM stack, recharged on traceable nitrogen, and stamped the API 16D recert before the operator’s rig-up window opened. Eight days on the bench. Nine days door-to-door.',

  heroImageCaption: 'FIG. 01 · Koomey Type 80 skid in JAFZA Bay 3, day 2 — bottles down, SPM bank stripped',
  heroImageCredit: 'PHOTO · Y. AL HASHIMI · 2026-01-08',

  metaCells: [
    { label: 'Asset', value: 'Koomey T80', valueSmall: ' · 11-stn closing unit', style: 'neutral' },
    { label: 'Bottles', value: '11', valueSmall: ' · 80 gal usable', style: 'neutral' },
    { label: 'SPM valves', value: '11', valueSmall: ' · sub-plate-mounted', style: 'neutral' },
    { label: 'Turnaround', value: '8', valueSmall: ' days', style: 'accent' },
    { label: 'Recert', value: 'API 16D · 5-yr', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A 5-year clock and a rig waiting.'),
    lead(
      'The intake call was short. KOC had pulled a Koomey Type 80 BOP closing unit off a sour-gas drilling rig in northern Kuwait at 4 years 11 months on the meter. The API 16D 5-year recertification window had thirty days of margin left on it, and the operator wanted the unit <strong>"in and out — we have a rig waiting"</strong>. The skid arrived in our Jebel Ali yard on a low-loader before the recerts file did.',
    ),
    para(
      'On paper this should have been a recharge-and-stamp. In practice, four of the eleven nitrogen accumulator bladders showed permeation loss above the API 16D 10% / 24 hr ceiling. Six of the eleven SPM (sub-plate-mounted) valves had seat-and-stem packing that had degraded past anything that could be called "in service". One of the two air-hydraulic pumps had a worn diaphragm that was venting 3,000 psi hydraulic back into the rig air supply. The unit had been running on H₂S service for almost five years; nothing on it surprised us, but everything on it had to be touched.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Recharge and recert. We have a rig waiting in Kuwait."',
        body:
          'KOC drilling supervisor wanted a topup on the N₂ pre-charge, a function test, and the API 16D 5-year stamp re-issued. Five days on the bench, end to end. The rig-up date in the field had already been booked.',
      },
      {
        label: 'What the inspection actually found',
        title: '4 spent bladders, 6 worn SPM valves, 1 dead pump diaphragm',
        body:
          'Bladder permeation > 10% N₂ loss / 24 hr on bottles 02, 05, 07 and 09. SPM seat kits glazed and split on 6 of 11 stations. Number-2 air-hydraulic pump diaphragm vented hydraulic into rig air at 3,000 psi. Recharge alone would not pass an API 16D witness.',
      },
    ),
    para(
      'There is a difference between a rebladder and an API 16D 5-year recert. The first is a parts swap. The second is a documented requalification of every closing-unit subsystem against API 16D, witnessed and signed. We told KOC the second was the only path that would survive an audit on a sour-gas well. They cleared the scope inside a working day and we opened the work order.',
    ),

    sectionHead('/02', 'solution', 'What the recert actually involved.'),
    para(
      'We stripped and rebladdered all eleven nitrogen accumulators with <strong>HNBR-FKM bladder kits</strong> in sour-service grade — not the standard NBR replacements that ship with most aftermarket kits. We overhauled all eleven SPM valve assemblies with <strong>NACE MR0175 / ISO 15156</strong> seat and stem packing kits, replaced both air-hydraulic pump diaphragms, and recharged each accumulator to the OEM Cameron specification of <strong>1,000 psi N₂ pre-charge</strong>. Every nitrogen bottle used in the recharge was logged by batch, fill-station ID and lot number into the recerts file. Eight days on the bench in Bay 3 of the Jebel Ali workshop.',
    ),
    para(
      'The function test on day 8 ran the complete closing sequence against an <strong>API STD 53</strong> simulated BOP load — annular, upper rams, middle rams, lower rams, choke and kill — with closure times measured station-by-station against the API STD 53 ceilings. Everything actuated inside spec. The 5-year recert pack went out with the unit on day 9 and the operator low-loaded it back to Kuwait the same morning.',
    ),
    figure(
      'Day 4 — eleven nitrogen bottles laid out in Bay 3, bladders out, shells inspected for internal corrosion and N₂-side pitting before the new HNBR-FKM kits go in.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Eleven Koomey accumulator bottles on the bench, bladders removed\\n1200×675"',
      },
    ),
    pullQuote(
      'A rebladder is a parts swap. A 5-year recert is a documented requalification — every bottle, every SPM, every nitrogen lot number, witnessed against API 16D. The line between the two is what an auditor reads when something goes wrong on a sour-gas well.',
      '— Yusuf Al Hashimi · Workshop Manager · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, eight days on the bench.'),
    para(
      'API 16D 5-year recerts on a Koomey closing unit don’t vary much in shape. They vary in what the inspection finds. This one needed all four phases run end-to-end, with no shortcuts on the SPM bank.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt & strip',
        body:
          'Skid intake, recerts file audit, hydraulic reservoir drained and sampled, SPM bank tagged by station, all eleven nitrogen bottles depressurised and removed.',
        duration: 'Days 0 — 1',
      },
      {
        number: 'PHASE 02',
        title: 'Bladder + SPM rebuild',
        body:
          'Eleven HNBR-FKM bladder kits installed, eleven SPM valves overhauled with NACE MR0175 seat + stem packing kits, both air-hydraulic pump diaphragms swapped on the bench.',
        duration: 'Days 2 — 5',
      },
      {
        number: 'PHASE 03',
        title: 'Recharge & reassemble',
        body:
          'Each accumulator recharged to 1,000 psi N₂ on traceable bottles, batch and fill-station ID logged. SPM bank reseated to manifold, hydraulic side primed, air-hydraulic pumps re-piped and tested.',
        duration: 'Days 6 — 7',
      },
      {
        number: 'PHASE 04',
        title: 'Function test & sign-off',
        body:
          'Closing sequence run against API STD 53 simulated BOP load, station-by-station closure times logged, API 16D 5-year recert stamp issued. Pack assembled and witnessed.',
        duration: 'Day 8',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we ran, line by line.'),
    para(
      'Below is the working subset of SOP-OG-019 — our standing procedure for an API 16D 5-year recert on a Koomey-type BOP closing unit. The full revision runs 38 lines; the 23 below are what was ticked off and witnessed on this unit.',
    ),
    sopBlock(
      'SOP-OG-019 · KOOMEY API 16D 5-YEAR RECERT · REV 05 · NACE',
      '23 / 23 COMPLETE',
      [
        {
          name: 'Phase 01 · Receipt & strip',
          rows: [
            {
              task: 'Skid intake & recerts file audit',
              detail: 'Last recert 2021-02 verified; OEM serial confirmed; sour-service classification validated',
              who: 'Y. AL HASHIMI',
              tool: 'Intake bay',
            },
            {
              task: 'Drain & sample hydraulic reservoir',
              detail: 'Reservoir drained to 80-gal sample drum; particle count + water content logged',
              who: 'O. AL MAKTOUM',
              tool: 'Sample kit',
            },
            {
              task: 'Tag & remove eleven SPM stations',
              detail: 'Each station tagged S01–S11 by manifold position; torque-witnessed during break-out',
              who: 'H. AL AWADI',
              tool: 'Torque wrench',
            },
            {
              task: 'Depressurise & remove eleven N₂ bottles',
              detail: 'Each bottle bled to atmosphere through the test port, removed to bladder bench',
              who: 'O. AL MAKTOUM',
              tool: 'Bleed manifold',
            },
            {
              task: 'Bottle-shell internal inspection',
              detail: 'Endoscope sweep of each shell; N₂-side pitting + ovality check vs. ASME VIII baseline',
              who: 'A. AL SUWAIDI',
              tool: 'Endoscope',
            },
          ],
        },
        {
          name: 'Phase 02 · Bladder & SPM rebuild',
          rows: [
            {
              task: 'Install 11× HNBR-FKM bladder kits',
              detail: 'Sour-service grade kits, OEM Cameron part nos.; pre-soaked + lubricated to OEM spec',
              who: 'H. AL AWADI',
              tool: 'Bladder bench',
            },
            {
              task: 'SPM seat + stem packing rebuild · 11 stations',
              detail: 'NACE MR0175 / ISO 15156 seal kits, FKM packing, 316 stainless stems',
              who: 'O. AL MAKTOUM',
              tool: 'SPM bench',
            },
            {
              task: 'SPM bench-test each station',
              detail: 'Each valve cycled 25× on test rig; seat leak < 5 ml/min at 3,000 psi WP',
              who: 'A. AL SUWAIDI',
              tool: 'Test rig',
            },
            {
              task: 'Air-hydraulic pump diaphragm replacement · 2 pumps',
              detail: 'Both diaphragms swapped, NACE elastomer; rebuilt on bench, no field-fit',
              who: 'H. AL AWADI',
              tool: 'Pump bench',
            },
            {
              task: 'Air-hydraulic pump bench-test',
              detail: '90 psi air supply → 3,000 psi hydraulic; flow + delivery curves logged vs. OEM',
              who: 'A. AL SUWAIDI',
              tool: 'Pump rig',
            },
          ],
        },
        {
          name: 'Phase 03 · Recharge & reassemble',
          rows: [
            {
              task: 'N₂ pre-charge · 11 accumulators',
              detail: '1,000 psi pre-charge per OEM Cameron spec; verified after 24 hr settling check',
              who: 'O. AL MAKTOUM',
              tool: 'N₂ rig',
            },
            {
              task: 'Log nitrogen bottle traceability',
              detail: 'Bottle batch, fill-station ID, lot number recorded against each accumulator station',
              who: 'A. AL SUWAIDI',
              tool: 'Recerts log',
            },
            {
              task: '24-hr pre-charge hold check',
              detail: 'Each bottle held overnight; pre-charge re-measured day 7 — drift < 1% across all 11',
              who: 'A. AL SUWAIDI',
              tool: 'Pressure gauge',
            },
            {
              task: 'Reseat SPM bank to manifold',
              detail: 'All 11 stations torqued to OEM spec; flange faces witness-checked',
              who: 'H. AL AWADI',
              tool: 'Torque wrench',
            },
            {
              task: 'Hydraulic-side prime & vent',
              detail: 'Reservoir refilled with fresh ISO VG 32; system primed and air bled at all high points',
              who: 'O. AL MAKTOUM',
              tool: 'Fill rig',
            },
          ],
        },
        {
          name: 'Phase 04 · Function test & API 16D sign-off',
          rows: [
            {
              task: 'Closing sequence test · API STD 53 load',
              detail: 'Annular + 4 ram positions + choke/kill simulated at OEM working pressure',
              who: 'Y. AL HASHIMI',
              tool: 'Test bench',
            },
            {
              task: 'Station-by-station closure timing',
              detail: 'Each station timed against API STD 53 ceilings; logged on test sheet',
              who: 'A. AL SUWAIDI',
              tool: 'Stopwatch + DAQ',
            },
            {
              task: 'Accumulator usable-volume verification',
              detail: 'Full sequence drawn against pre-charge curve; usable volume confirmed at 80 gal nominal',
              who: 'A. AL SUWAIDI',
              tool: 'Flow meter',
            },
            {
              task: 'API 16D 5-year recert stamp',
              detail: 'Witnessed and signed; valid until 2031-01; serial + lot numbers cross-referenced',
              who: 'Y. AL HASHIMI',
              tool: 'Recert stamp',
            },
            {
              task: 'Issue 5-year recert pack',
              detail: '34 pp · test sheets, N₂ traceability, NACE certs, SPM bench logs, photos × 41',
              who: 'A. AL SUWAIDI',
              tool: 'PDF + paper',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The findings, before and after.'),
    para(
      'Below is what we measured against API 16D and OEM Cameron tolerance on every subsystem of the unit. Four highlighted findings would have failed the 5-year recert witness if the unit had gone out as a recharge-and-stamp.',
    ),
    specTable(
      'FINDINGS · KOOMEY T80 · SERIAL KCU-T80-2189 · SOUR SERVICE',
      [
        {
          component: 'Bladder permeation · bottles 02, 05, 07, 09',
          spec: '< 10% N₂ loss / 24 hr',
          asFound: '14 — 19% / 24 hr',
          afterRebuild: '< 2% / 24 hr',
          status: '↻ Rebladdered · HNBR-FKM',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Bladder permeation · remaining 7 bottles',
          spec: '< 10% N₂ loss / 24 hr',
          asFound: '4 — 7% / 24 hr',
          afterRebuild: '< 2% / 24 hr',
          status: '↻ Rebladdered · HNBR-FKM',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'SPM valve seat condition · 6 of 11 stations',
          spec: 'NACE MR0175 · sound',
          asFound: 'Glazed / split',
          afterRebuild: '316 SS · NACE kit',
          status: '↻ Overhauled',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'SPM valve seat condition · remaining 5 stations',
          spec: 'NACE MR0175 · sound',
          asFound: 'Worn within tolerance',
          afterRebuild: '316 SS · NACE kit',
          status: '↻ Overhauled (kit · all 11)',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Air-hydraulic pump diaphragm · pump 2',
          spec: 'NACE elastomer · 0 leak',
          asFound: 'Worn · 3,000 psi vent',
          afterRebuild: 'Replaced · 0 leak',
          status: '↻ Replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Air-hydraulic pump diaphragm · pump 1',
          spec: 'NACE elastomer · 0 leak',
          asFound: 'Within tolerance',
          afterRebuild: 'Replaced · 0 leak',
          status: '↻ Replaced (kit)',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator pre-charge · all 11 bottles',
          spec: '1,000 psi N₂ · OEM',
          asFound: '420 — 690 psi · drifted',
          afterRebuild: '1,000 psi · day 0',
          status: '↻ Recharged · traceable',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'N₂ bottle traceability',
          spec: 'Batch + fill-stn ID · logged',
          asFound: 'Last log 2024-08',
          afterRebuild: '11 lot nos. on file',
          status: '✓ On file',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator usable volume',
          spec: '80 gal nominal',
          asFound: '— (drifted pre-charge)',
          afterRebuild: '80 gal verified',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Closing-sequence time vs API STD 53',
          spec: 'Within STD 53 ceilings',
          asFound: '— (not run pre-strip)',
          afterRebuild: 'All 11 stns inside spec',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Hydraulic working pressure · system',
          spec: '3,000 psi nominal',
          asFound: '2,920 psi (pump 2 vent)',
          afterRebuild: '3,000 psi held',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'API 16D 5-year recert',
          spec: 'Witness-signed · valid 5 yr',
          asFound: 'Expires 2026-02',
          afterRebuild: 'Valid until 2031-01',
          status: '✓ Stamp issued',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'API 16D stamp re-issued. Skid back in Kuwait day 9.'),
    para(
      'The unit cleared sign-off on day 8. The KOC drilling supervisor witnessed the closing-sequence test in person, signed the API STD 53 sheet on the bench, and the 5-year API 16D recert stamp went on the unit the same afternoon. Low-loader rolled day 9. Skid was back on the rig site in northern Kuwait inside the operator’s rig-up window. All eleven accumulators, all eleven SPM stations and the air-hydraulic pumps go forward under a single 12-month system warranty against the new recert. Sour-service compliance was reconfirmed against NACE MR0175 / ISO 15156 across every elastomer in the unit.',
    ),
    resultBox(
      'Result · summary',
      'Eleven rebladdered accumulators, eleven overhauled SPM stations, API 16D recert valid until 2031 — and a Koomey T80 closing unit fit for sour service for the next five years.',
      'Delivered inside the operator’s 30-day window with three weeks of margin to spare on the API 16D clock. KOC drilling supervisor witnessed the closing-sequence test on the bench. Every nitrogen bottle, every elastomer, every SPM seat kit traceable from lot number to station ID.',
      [
        { value: '8', valueSmall: ' days', label: 'Bench turnaround', style: 'accent' },
        { value: '11 / 11', label: 'Accumulators rebladdered', style: 'good' },
        { value: '11 / 11', label: 'SPM stations passed', style: 'good' },
        { value: '60', valueSmall: ' mo', label: 'API 16D recert valid' },
      ],
    ),

    sectionHead('/07', 'team', 'The team in Bay 3.'),
    teamList(
      'Five engineers logged time against this work order, all in the Jebel Ali workshop. If you call the JAFZA yard and ask about case 04, any of them can pull the recerts file.',
      [
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope: 'Scope clearance with KOC, witnessed the API STD 53 closing-sequence test, signed the API 16D 5-year recert stamp.',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'QA Lead',
          location: 'Jebel Ali',
          scope: 'Bottle-shell endoscope sweeps, SPM bench-test logs, N₂ traceability file, 24-hr pre-charge hold check, recert pack assembly.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Hydraulics Technician',
          location: 'Jebel Ali',
          scope: 'Reservoir drain and sample, SPM bank rebuild, N₂ recharge on all eleven bottles, hydraulic-side prime and vent.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'Lead Fitter',
          location: 'Jebel Ali',
          scope: 'SPM station tag-out, eleven HNBR-FKM bladder kits installed, both air-hydraulic pump diaphragms rebuilt on the bench.',
        },
        {
          name: 'Khalid Al Marzouqi',
          role: 'Field Lead',
          location: 'Jebel Ali',
          scope: 'KOC interface, low-loader release on day 9, intake handover, customer-witness coordination on the function test.',
        },
      ],
      'Case file · INTAKE-2026-01-019 · WO-2026-1042 · Published 2026-02-04 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'Traceable nitrogen is not paperwork — it is what an auditor reads when a BOP doesn’t close on a sour-gas well. Lot number, fill station, bottle batch, every accumulator station. We don’t recharge from an unmarked bottle.',
  pullQuoteAuthor: 'Aisha Al Suwaidi',
  pullQuoteRole: 'QA LEAD',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'Koomey Type 80' },
    { label: 'Service', value: 'Sour gas / H₂S' },
    { label: 'Stations', value: '11 SPM' },
    { label: 'Usable vol', value: '80 gal' },
    { label: 'Hyd. WP', value: '3,000 psi' },
    { label: 'N₂ pre-charge', value: '1,000 psi' },
    { label: 'Bladder', value: 'HNBR-FKM' },
    { label: 'Standard', value: 'API 16D · STD 53' },
    { label: 'Sour spec', value: 'NACE MR0175' },
    { label: 'TAT', value: '8 days' },
  ],
  galleryTotalCount: 41,
  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '18 pp', format: 'PDF' },
    { label: 'API 16D recert pack (PDF)', url: '#', size: '34 pp', format: 'PDF' },
    { label: 'N₂ bottle traceability (XLSX)', url: '#', size: '11 rows', format: 'XLSX' },
    { label: 'NACE certs (ZIP)', url: '#', size: '9 MB', format: 'ZIP' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-01-019 · WO-2026-1042 · Published 2026-02-04 · Updated 2026-05-09',

  cardOneLiner:
    'KOC pulled an 11-station Koomey Type 80 closing unit at 4 yr 11 mo. We rebladdered all 11 accumulators, overhauled the SPM stack, recharged on traceable nitrogen, and stamped the API 16D 5-year recert in 8 bench days.',
  cardOutcomePills: [
    { label: 'API 16D · 5-yr stamp', style: 'good' },
    { label: '11 / 11 SPM passed', style: 'good' },
    { label: '8 days bench', style: 'accent' },
    { label: 'NACE MR0175', style: 'neutral' },
  ],
  cardDurationLabel: '8 D ON BENCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'KOOMEY',

  durationDays: 8,

  seoTitle:
    'Koomey Type 80 BOP closing unit · API 16D 5-year recert · 11 accumulators rebladdered · KOC sour-gas drilling rig · Indus Hydraulics Jebel Ali',
  seoDescription:
    'Case 04 — KOC sour-gas Koomey Type 80 closing unit, 11 accumulators rebladdered with HNBR-FKM kits, 11 SPM valves overhauled to NACE MR0175, recharged to 1,000 psi N₂ on traceable bottles, API 16D 5-year recert stamp valid until 2031. Eight bench days in JAFZA Bay 3.',
  focusKeyword: 'Koomey API 16D 5-year recertification UAE',
}

export default CASE
