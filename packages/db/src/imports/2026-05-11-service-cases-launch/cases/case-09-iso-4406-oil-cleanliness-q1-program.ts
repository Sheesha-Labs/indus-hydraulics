/**
 * Case 09 — ISO 4406 / ferrography / SOA · Q1 2026 quarterly oil-condition program
 * 2026-05-11
 *
 * An Emirates-based aluminium smelter runs a quarterly oil-condition monitoring
 * program with Indus on 14 hydraulic systems. In Q1 2026, ferrography on system
 * #7 — an anode-handling press HPU — flagged a rising iron and chromium wear
 * signature consistent with main pump bearing failure. The verdict was issued
 * three weeks before the bearing would have grenaded. Pump pulled 18 days later;
 * bearing 75% spalled. Operator avoided an estimated AED 800K in unplanned
 * downtime and an emergency replacement HPU.
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
  slug: 'iso-4406-oil-cleanliness-coding-q1-2026-aluminum-smelter',
  caseNumber: '09',
  isFeatured: false,

  category: 'lab_forensics',
  topicLabel: 'Lab · ISO 4406 · Industrial',
  region: '🇦🇪 UAE · Jebel Ali (lab)',
  caseDateLabel: 'Q1 2026 · LAB · OFF-SITE SAMPLING',
  title: 'Fourteen hydraulic systems, one rising iron trend, and a pump bearing caught three weeks before it grenaded.',
  titleAccent: 'three weeks before it grenaded',
  deck:
    'An Emirates-based aluminium smelter runs a quarterly oil-condition program with our Jebel Ali lab on 14 hydraulic systems — cast-house tilters, pot-room rectifier cooling, anode-handling presses. The Q1 2026 round looked like routine paperwork until ferrography on system #7 surfaced an iron-and-chromium signature climbing past baseline. The pump came down 18 days after our verdict. The bearing was 75% spalled. The line never stopped.',

  heroImageCaption: 'FIG. 01 · Q1 2026 ferrogram from system #7 — iron and chromium wear particles separated on the DR ferrograph slide',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-02-12',

  metaCells: [
    { label: 'Asset', value: 'Smelter HPU fleet', valueSmall: ' · 14 systems', style: 'neutral' },
    { label: 'Samples', value: '14', valueSmall: ' · Q1 2026 round', style: 'neutral' },
    { label: 'Early-warning save', value: 'Sys #7', valueSmall: ' · anode press HPU', style: 'neutral' },
    { label: 'Per-sample TAT', value: '5', valueSmall: ' days', style: 'accent' },
    { label: 'Standard', value: 'ISO 4406:2017', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'Quarterly screening, with one standing instruction.'),
    lead(
      'The smelter has run a quarterly oil-condition program with our Jebel Ali lab for the past four quarters. Fourteen hydraulic systems — cast-house tilting cylinders, pot-room rectifier cooling skids, anode-handling press HPUs — sampled on-site by an Indus engineer, shipped to the lab, screened for cleanliness and wear. The standing instruction from the operator’s reliability team is short: <strong>"tell us what is wrong before it stops the line."</strong> A cast-house line stop on a smelter is measured in molten metal and missed shipment slots, not in hours.',
    ),
    para(
      'When the Q1 2026 round of bottles landed in the intake bay on a Wednesday morning, sample #7 — the anode-handling press HPU — looked unremarkable on the first pass. Visual: clear, no haze, no free water. Viscosity at 40 °C: in spec for ISO VG 46. Water by Karl Fischer: 96 ppm, well under the 200 ppm action ceiling. ISO 4406 cleanliness coding came in at <strong>20/18/15</strong> against a target of 20/18/15 — green by every standard metric the operator tracks on their CMMS dashboard. On paper, sample #7 was a non-event.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Run the quarterly. Tell us if anything is moving."',
        body:
          'Reliability team’s instruction was the same as every quarter — pull 14 samples, run the standard ISO 4406 + ferrography + SOA panel, return one-page verdicts. No specific worry on system #7. The press HPU had been running clean for the previous three quarters and was not on the watch list.',
      },
      {
        label: 'What the lab actually surfaced',
        title: 'Fe and Cr wear-particle trend climbing past baseline on system #7',
        body:
          'ISO 4406 was within spec. Visual was clean. But the ferrography slide showed cutting and rolling-fatigue wear particles, and SOA put iron at 38 ppm and chromium at 9 ppm — both more than 2× the four-quarter rolling baseline. Signature consistent with main pump bearing race spalling. Cleanliness coding alone would have missed it.',
      },
    ),
    para(
      'This is the case for not buying oil analysis on cleanliness coding alone. ISO 4406 tells you how dirty the oil is. It does not tell you what is wearing. A pump can be days from a bearing failure with cleanliness still inside spec — because the wear particles being shed are mostly in the sub-4 µm range that ISO 4406 does not count, and because a working filter is pulling the larger particles out faster than the bearing is shedding them. You need ferrography and SOA to see the trend before the filter loses the race.',
    ),

    sectionHead('/02', 'solution', 'A one-page verdict that pulled the pump 18 days later.'),
    para(
      'The lab issued a single-page PDF verdict against sample #7 on day 5 after intake. Cleanliness coding: green at <strong>20/18/15</strong>. Water content: green. Viscosity: green. Ferrography: <strong>amber — rising bearing-wear signature, recommend pump-down inspection within 30 days</strong>. The SOA panel was attached as a trend chart over the four prior quarters showing iron at 11 / 14 / 17 / <strong>38 ppm</strong> and chromium at 2 / 3 / 4 / <strong>9 ppm</strong> — both crossing the 2× baseline trigger that fires an amber flag. Verdict went to the smelter’s reliability lead before lunch.',
    ),
    para(
      'The operator pulled the pump on day 23 — 18 days after verdict release. The shop teardown report came back the same week. The main pump bearing race was <strong>75% spalled</strong>, with the cage starting to deform. The pump would have seized inside the next four to six weeks of running. A seized main pump on an anode-handling press HPU does not stop politely — it grenades, takes the pump body and the discharge line with it, and on a smelter line that runs three-shift seven days, replacing it under emergency mobilisation runs into a replacement HPU plus a multi-day production hold.',
    ),
    figure(
      'Day 5 — DR ferrogram from sample #7 under bichromatic light. The dark, elongated cutting wear particles in the upper-third of the slide are the signature that took the verdict from green to amber.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"DR ferrograph slide under bichromatic light, cutting + rolling-fatigue particles\\n1200×675"',
      },
    ),
    pullQuote(
      'Cleanliness coding tells you how dirty the oil is. Ferrography tells you what is wearing. The two are not the same question. A pump can be three weeks from a bearing failure with ISO 4406 still green — because the bearing is shedding sub-4 µm steel faster than your code can see it. Oil tells you what is failing before the equipment does, but only if you are reading the right slide.',
      '— Omar Al Maktoum · Ferrography Lead · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases — sampling to verdict, five days each.'),
    para(
      'Quarterly oil-condition rounds at the smelter follow the same four phases every quarter. The first two are time-boxed by the on-site sampling window; the last two are run in the lab on a strict 5-day per-sample TAT clock from intake to verdict.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'On-site sampling',
        body:
          'Indus engineer on-site with sterile bottles + circuit-port adapters. Each of the 14 systems sampled at operating temperature, machine-hours logged, sampling port photographed.',
        duration: 'Days 0 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'Lab intake & screen',
        body:
          'Bottles logged into the intake bay, one barcode per sample. Visual, viscosity at 40 °C, water by Karl Fischer, particle count for ISO 4406:2017 cleanliness coding.',
        duration: 'Day 3',
      },
      {
        number: 'PHASE 03',
        title: 'Ferrography + SOA',
        body:
          'DR ferrograph slide for every sample. ICP-OES spectrometric oil analysis on the standard 12-element wear-metals panel. Trending against four-quarter rolling baseline.',
        duration: 'Day 4',
      },
      {
        number: 'PHASE 04',
        title: 'Verdict & report',
        body:
          'One-page PDF per sample with traffic-light grading, specific recommendation, trend chart attached. Verdicts on the operator’s reliability lead’s desk on day 5 after intake.',
        duration: 'Day 5',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we ran on every one of the 14 samples.'),
    para(
      'Below is the working subset of SOP-LAB-007 — our standing procedure for a quarterly oil-condition round running ISO 4406 cleanliness coding plus ferrography plus SOA. The full revision runs 31 lines; the 22 below are what was ticked off and signed against the Q1 2026 round.',
    ),
    sopBlock(
      'SOP-LAB-007 · ISO 4406 / FERROGRAPHY / SOA SAMPLE FLOW · REV 03',
      '22 / 22 COMPLETE',
      [
        {
          name: 'Phase 01 · On-site sampling protocol',
          rows: [
            {
              task: 'Pre-sampling kit prep',
              detail: 'Sterile sample bottles (250 ml borosilicate), circuit-port adapters, lint-free flush bottles, per-system tag set',
              who: 'H. AL AWADI',
              tool: 'Sample kit',
            },
            {
              task: 'Sample at operating temperature',
              detail: 'Each of the 14 systems run for 30 min before draw; oil at full operating temp to suspend wear particles',
              who: 'H. AL AWADI',
              tool: 'Port adapter',
            },
            {
              task: 'Live-zone draw protocol',
              detail: 'Sample drawn from the live circuit (return line, downstream of pump) — never from reservoir bottom or stagnant zone',
              who: 'H. AL AWADI',
              tool: 'Sterile bottle',
            },
            {
              task: 'Per-sample metadata capture',
              detail: 'Machine-hours, last filter change, last oil change, system pressure, sampling port photo — logged on intake sheet',
              who: 'H. AL AWADI',
              tool: 'Tag sheet',
            },
            {
              task: 'Chain-of-custody seal',
              detail: 'Each bottle barcoded, tamper-evident seal applied, batched into chilled transport box for Jebel Ali lab',
              who: 'H. AL AWADI',
              tool: 'Barcode + seal',
            },
          ],
        },
        {
          name: 'Phase 02 · Lab intake & screening panel',
          rows: [
            {
              task: 'Intake log & barcode reconciliation',
              detail: 'Each of the 14 bottles scanned in, cross-checked against the on-site tag sheet, opened in the intake bay',
              who: 'A. AL SUWAIDI',
              tool: 'Intake bay',
            },
            {
              task: 'Visual + viscosity at 40 °C',
              detail: 'Appearance, free water check, kinematic viscosity (cSt) measured against ISO VG grade for each system',
              who: 'A. AL SUWAIDI',
              tool: 'Viscometer',
            },
            {
              task: 'Water content · Karl Fischer titration',
              detail: 'ppm water measured on every sample; action ceiling 200 ppm for ISO VG 46 hydraulic systems',
              who: 'A. AL SUWAIDI',
              tool: 'KF titrator',
            },
            {
              task: 'ISO 4406:2017 particle count',
              detail: 'Optical particle counter, 3-number cleanliness code at 4 µm / 6 µm / 14 µm vs. per-system target code',
              who: 'A. AL SUWAIDI',
              tool: 'Particle counter',
            },
          ],
        },
        {
          name: 'Phase 03 · Ferrography + SOA',
          rows: [
            {
              task: 'DR ferrograph slide preparation',
              detail: 'Direct-reading ferrograph slide for every sample; particles deposited under magnetic gradient by size + ferromagnetism',
              who: 'O. AL MAKTOUM',
              tool: 'DR ferrograph',
            },
            {
              task: 'Microscope reading · bichromatic',
              detail: 'Each slide read under bichromatic light at 100×, 500×; wear modes classified — cutting, rolling-fatigue, sliding, rubbing',
              who: 'O. AL MAKTOUM',
              tool: 'Microscope',
            },
            {
              task: 'SOA · ICP-OES wear metals panel',
              detail: '12-element panel: Fe, Cr, Cu, Pb, Sn, Al, Ni, Si, Na, K, Mo, Zn — measured in ppm against four-quarter baseline',
              who: 'K. AL MARZOUQI',
              tool: 'ICP-OES',
            },
            {
              task: 'Trend chart vs. rolling baseline',
              detail: 'Per-sample wear-metals plotted against last four quarters; > 2× baseline triggers amber, > 4× triggers red',
              who: 'K. AL MARZOUQI',
              tool: 'Trend tool',
            },
            {
              task: 'Cross-correlation · ferrography ↔ SOA',
              detail: 'Wear-mode signature on slide cross-checked against SOA elemental signature — bearing, gear, ring, bushing pattern matched',
              who: 'O. AL MAKTOUM',
              tool: 'Atlas',
            },
          ],
        },
        {
          name: 'Phase 04 · Verdict authoring & sign-off',
          rows: [
            {
              task: 'One-page verdict PDF · per sample',
              detail: 'Traffic-light grading on cleanliness, water, viscosity, ferrography, SOA; specific recommendation in plain language',
              who: 'A. AL SUWAIDI',
              tool: 'Verdict template',
            },
            {
              task: 'System #7 · amber flag escalation',
              detail: 'Verdict re-reviewed by lab supervisor + ferrography lead; recommendation set to "pump-down inspection within 30 days"',
              who: 'A. AL SUWAIDI',
              tool: 'Escalation log',
            },
            {
              task: 'Reliability lead notification',
              detail: 'Amber + red verdicts called through to the operator’s reliability lead before email release; all 14 PDFs sent end of day 5',
              who: 'Y. AL HASHIMI',
              tool: 'Phone + email',
            },
            {
              task: 'Round-summary deliverable',
              detail: 'One-page Q1 2026 round summary: 14 systems, status grid, trending narrative on system #7, recommended re-sample interval',
              who: 'Y. AL HASHIMI',
              tool: 'PDF',
            },
            {
              task: 'CMMS monitoring-point update',
              detail: 'System #7 re-cycled from 90-day to 14-day sampling interval in the operator’s CMMS as a permanent monitoring point',
              who: 'Y. AL HASHIMI',
              tool: 'CMMS',
            },
            {
              task: 'Q1 round file archive',
              detail: 'All 14 verdicts, slides, particle counts, ICP-OES traces, trend charts archived under Q1-2026 round file',
              who: 'A. AL SUWAIDI',
              tool: 'Archive',
            },
            {
              task: 'Round-pack sign-off',
              detail: '24 pp · 14 verdict PDFs, one round-summary, ferrography slide images, SOA trend charts, sampling chain-of-custody log',
              who: 'Y. AL HASHIMI',
              tool: 'Sign-off pack',
            },
            {
              task: 'Pump teardown reconciliation',
              detail: 'Day 23 — operator pulled pump on system #7. Teardown report cross-filed against Q1 verdict; bearing condition logged',
              who: 'O. AL MAKTOUM',
              tool: 'Teardown log',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The Q1 2026 round, system by system.'),
    para(
      'Below is the actual Q1 2026 round result against ISO 4406 target codes, water-content ceilings and the four-quarter rolling baseline on the SOA panel. Highlighted findings are the four that did not pass cleanly — three amber, one red on the wear-trend column for system #7.',
    ),
    specTable(
      'FINDINGS · SMELTER FLEET · 14 SYSTEMS · Q1 2026 ROUND',
      [
        {
          component: 'System #7 · anode-handling press HPU · Fe trend',
          spec: '< 2× baseline (16 ppm)',
          asFound: '38 ppm · 3.5× baseline',
          afterRebuild: 'Pump pulled day 23',
          status: '⚠ Amber → bearing 75% spalled',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'System #7 · anode-handling press HPU · Cr trend',
          spec: '< 2× baseline (4 ppm)',
          asFound: '9 ppm · 2.6× baseline',
          afterRebuild: 'Pump pulled day 23',
          status: '⚠ Amber → bearing race confirmed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'System #7 · ferrography wear mode',
          spec: 'Rubbing only · normal',
          asFound: 'Cutting + rolling-fatigue',
          afterRebuild: 'Bearing replaced',
          status: '⚠ Amber → bearing failure',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'System #7 · ISO 4406:2017 cleanliness',
          spec: '20 / 18 / 15 target',
          asFound: '20 / 18 / 15 (in spec)',
          afterRebuild: '19 / 17 / 14 post-pump',
          status: '✓ Green (cleanliness alone missed it)',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Systems #3, #11 · cast-house tilters · water content',
          spec: '< 200 ppm',
          asFound: '310, 280 ppm',
          afterRebuild: 'Desiccant breathers fitted',
          status: '⚠ Amber → water ingress',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Remaining 11 systems · ISO 4406:2017 cleanliness',
          spec: 'Per-system target ± 1 code',
          asFound: 'All within target ± 1',
          afterRebuild: 'No action required',
          status: '✓ Green',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Remaining 11 systems · viscosity at 40 °C',
          spec: 'ISO VG 46 ± 10%',
          asFound: '41.4 — 50.2 cSt',
          afterRebuild: 'No action required',
          status: '✓ Green',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Remaining 11 systems · Karl Fischer water',
          spec: '< 200 ppm',
          asFound: '38 — 142 ppm',
          afterRebuild: 'No action required',
          status: '✓ Green',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Remaining 11 systems · Fe wear-trend',
          spec: '< 2× baseline',
          asFound: '0.7 — 1.4× baseline',
          afterRebuild: 'No action required',
          status: '✓ Green',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Remaining 11 systems · Cu / Pb / Sn (bushing wear)',
          spec: '< 2× baseline',
          asFound: '0.5 — 1.6× baseline',
          afterRebuild: 'No action required',
          status: '✓ Green',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Per-sample TAT · intake → verdict',
          spec: '5 days',
          asFound: '14 / 14 inside SLA',
          afterRebuild: 'Avg 4.6 days',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Round-pack delivery · Q1 2026',
          spec: '24 pp · sign-off witnessed',
          asFound: '24 pp · all 14 verdicts',
          afterRebuild: 'Reliability lead signed',
          status: '✓ Issued',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Bearing 75% spalled. Line never stopped.'),
    para(
      'Pump came down on day 23 — 18 days after our verdict landed on the operator’s desk. The teardown shop confirmed what the ferrogram had said: the main pump bearing race was 75% spalled, the cage was starting to deform, the pump was inside the four-to-six-week window before a hard seizure. Replacement parts were ordered through the operator’s standard procurement window, the pump-down was scheduled around a planned production maintenance slot, and the line never stopped. Estimated savings against the unplanned-failure case: <strong>~AED 800K</strong> in avoided unplanned downtime and an emergency replacement HPU. System #7 has been moved to a 14-day monitoring cycle in the operator’s CMMS while the rebuilt pump beds in.',
    ),
    resultBox(
      'Result · summary',
      'One amber verdict on day 5 turned a hard pump failure into a planned overhaul — three weeks of margin, one production slot, no line stop.',
      'The other 13 systems came back green-or-water on the Q1 round. System #7 is now on a 14-day re-sample interval until the rebuilt pump establishes a fresh four-quarter baseline. The operator’s reliability team has added the cross-correlation between ferrography wear-mode and SOA elemental trend to their standing audit pack — a verdict they would not have read off cleanliness coding alone.',
      [
        { value: '5', valueSmall: ' days', label: 'Per-sample TAT', style: 'accent' },
        { value: '14 / 14', label: 'Verdicts on time', style: 'good' },
        { value: '~ AED 800K', label: 'Estimated saving', style: 'good' },
        { value: '18', valueSmall: ' days', label: 'Verdict to pump-down' },
      ],
    ),

    sectionHead('/07', 'team', 'The team in the Jebel Ali lab.'),
    teamList(
      'Five engineers logged time against this round, all working out of the Jebel Ali lab. If you call the JAFZA lab and ask about the Q1 2026 smelter round, any of them can pull the verdict file on system #7.',
      [
        {
          name: 'Aisha Al Suwaidi',
          role: 'Lab Supervisor',
          location: 'Jebel Ali',
          scope:
            'Q1 2026 round ownership. Intake log reconciliation, ISO 4406 particle counts on all 14 samples, verdict authoring, escalation on system #7, round-pack sign-off.',
        },
        {
          name: 'Yusuf Al Hashimi',
          role: 'Customer Engagement',
          location: 'Jebel Ali',
          scope:
            'Operator interface. Phoned the system #7 amber verdict to the reliability lead before email release, set the CMMS update from 90-day to 14-day sampling, signed the round-summary.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'Sampling Engineer',
          location: 'Jebel Ali',
          scope:
            'On-site sampling across all 14 systems at the smelter. Live-zone draw protocol, machine-hours and port-photo capture, chain-of-custody seal, transport to the Jebel Ali intake bay.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Ferrography Lead',
          location: 'Jebel Ali',
          scope:
            'DR ferrograph slide preparation and bichromatic microscope reading on every sample. Wear-mode classification, cross-correlation against the SOA panel, system #7 cutting-particle call.',
        },
        {
          name: 'Khalid Al Marzouqi',
          role: 'SOA Spectroscopist',
          location: 'Jebel Ali',
          scope:
            'ICP-OES wear-metals panel on all 14 samples. Four-quarter trend charting, 2× / 4× baseline trigger evaluation, Fe + Cr signature confirmation against ferrography for system #7.',
        },
      ],
      'Case file · INTAKE-2026-02-073 · WO-2026-1093 · Published 2026-03-15 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'A filter-change mindset asks "is the oil dirty?". A wear-trend mindset asks "what is the oil telling me about the steel?". Same bottle, two different questions. Most pumps fail on the second question while the first one is still answering green.',
  pullQuoteAuthor: 'Aisha Al Suwaidi',
  pullQuoteRole: 'LAB SUPERVISOR',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Program', value: 'Quarterly · 14 systems' },
    { label: 'Round', value: 'Q1 2026' },
    { label: 'Cleanliness', value: 'ISO 4406:2017' },
    { label: 'Wear analysis', value: 'DR ferrography' },
    { label: 'Elemental', value: 'ICP-OES SOA' },
    { label: 'Wear-metals panel', value: '12 elements' },
    { label: 'Water', value: 'Karl Fischer' },
    { label: 'Trend trigger', value: '> 2× baseline' },
    { label: 'Per-sample TAT', value: '5 days' },
    { label: 'Verdict format', value: '1-page PDF · traffic light' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Q1 2026 round summary (PDF)', url: '#', size: '24 pp', format: 'PDF' },
    { label: 'System #7 verdict (PDF)', url: '#', size: '1 pp', format: 'PDF' },
    { label: 'SOA trend charts · 14 systems (XLSX)', url: '#', size: '14 sheets', format: 'XLSX' },
    { label: 'Ferrography slide gallery (ZIP)', url: '#', size: '46 MB', format: 'ZIP' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-02-073 · WO-2026-1093 · Published 2026-03-15 · Updated 2026-05-09',

  cardOneLiner:
    'Quarterly oil-condition round on 14 hydraulic systems at an Emirates aluminium smelter. ISO 4406 was green on system #7 — but ferrography flagged a rising Fe + Cr signature. Pump pulled 18 days later. Bearing 75% spalled. Estimated AED 800K avoided.',
  cardOutcomePills: [
    { label: '14 / 14 verdicts on time', style: 'good' },
    { label: 'Bearing caught at 75% spall', style: 'good' },
    { label: '~AED 800K avoided', style: 'accent' },
    { label: 'ISO 4406:2017', style: 'neutral' },
  ],
  cardDurationLabel: '5 D / SAMPLE',
  cardTagStyle: 'standard',
  cardTagLabel: 'LAB',

  durationDays: 5,
  savingsAmount: 800000,
  savingsCurrency: 'AED',

  seoTitle:
    'ISO 4406:2017 oil cleanliness coding + ferrography + SOA · Q1 2026 quarterly oil-condition round · UAE aluminium smelter · 14 hydraulic systems · Indus Hydraulics Jebel Ali lab',
  seoDescription:
    'Case 09 — Quarterly oil-condition program on 14 hydraulic systems at an Emirates-based aluminium smelter. ISO 4406 cleanliness coding, DR ferrography, ICP-OES spectrometric oil analysis. Q1 2026 ferrogram on the anode-handling press HPU caught a rising iron and chromium wear signature 18 days before the pump bearing would have seized — estimated AED 800K saved against an unplanned failure.',
  focusKeyword: 'ISO 4406 oil cleanliness coding ferrography UAE',
}

export default CASE
