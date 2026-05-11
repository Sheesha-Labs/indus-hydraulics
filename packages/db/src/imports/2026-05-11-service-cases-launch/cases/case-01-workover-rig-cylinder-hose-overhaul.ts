/**
 * Case 01 — Workover Rig Cylinder & Hose Overhaul · Jebel Ali
 * 2026-05-11
 *
 * Featured "Case of the Week" — eight tie-rod cylinders, 96 hoses, and a
 * 50,000-lb hydraulic workover unit pulled off a sour-gas well in the Rub' al
 * Khali. Rebuilt to NACE MR0175 in the JAFZA yard and back skidding on a
 * wellhead 23 days after the call came in.
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
  // Identity ───────────────────────────────────────────────────────────────
  slug: 'workover-rig-cylinder-hose-overhaul-jebel-ali',
  caseNumber: '01',
  isFeatured: true,

  // Hero ───────────────────────────────────────────────────────────────────
  category: 'cylinders',
  topicLabel: 'Cylinders · Hoses · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'MAR 2026 · BAY 2 / ON-SITE',
  title:
    'Eight tie-rod cylinders, 96 hoses, and a workover rig that needed to be back on a well in 19 days.',
  titleAccent: 'back on a well in 19 days',
  deck:
    'An ADNOC sub-contractor running a hydraulic workover unit in the Rub’ al Khali had four cylinders weeping at the gland, two hoses ruptured at the swage, and a recerts file three months overdue. We took the call on a Sunday. The unit was back skidding on a wellhead the third Friday after.',

  heroImageCaption:
    'FIG. 01 · HWO-50K skid in JAFZA yard, day 2 — cylinders being broken out',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-03-04',

  // Meta strip — exactly 5 cells ───────────────────────────────────────────
  metaCells: [
    { label: 'Asset', value: 'HWO-50K', valueSmall: ' · 50 klb HWU', style: 'neutral' },
    { label: 'Cylinders', value: '8', valueSmall: ' · 6″ bore tie-rod', style: 'neutral' },
    { label: 'Hoses replaced', value: '96', valueSmall: ' · 4SP + 2SN', style: 'neutral' },
    { label: 'Turnaround', value: '19', valueSmall: ' days', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  // Body ───────────────────────────────────────────────────────────────────
  bodyBlocks: [
    // /01 — Problem ────────────────────────────────────────────────────────
    sectionHead('/01', 'problem', 'The problem on the rig.'),
    lead(
      'The call came in at 22:14 on a Sunday. A 50,000-lb hydraulic workover unit had been pulled off a sour-gas well in the Rub’ al Khali because two main jack cylinders were weeping at the gland and a 1″ pressure hose had ruptured at the swage. The client had a slot booked at Habshan in three weeks. <strong>The clock was already running.</strong>',
    ),
    para(
      'By Monday morning a transporter was rolling the unit into our Jebel Ali yard. The story we got was: “seal kits, please.” The story the unit told, once it was in the bay, was longer than that. Three of the four jack cylinders were out of straightness. Six hoses had cover degradation consistent with ambient temps north of 55 °C and a year on a rig without UV shrouds. The accumulator pre-charge file hadn’t been updated since the 2024 rainy season — there isn’t one in Abu Dhabi, but you know what we mean.',
    ),
    problemSolution(
      {
        label: '⚠ What the operator told us',
        title: '“Weeping seals, one burst hose — seal kits, please.”',
        body:
          'Two jack cylinders weeping at the gland, one pressure hose ruptured at the swage. Operator wanted a 5-day seal-and-swap and back on hire. They asked for parts. They did not ask for an engineer.',
      },
      {
        label: '✓ What the inspection actually found',
        title: 'Three bent rods, 96 hoses end-of-life, recerts overdue',
        body:
          'Rod straightness out on 3/4 jacks. Hose covers cracked across the boom run. Accumulator nitrogen + relief valves out of recert by 7 months — we couldn’t legally re-skid the unit on sour service without sign-off.',
      },
    ),
    para(
      'This is the case for sending an inspection engineer before you send a seal kit. The cheapest version of this job — the one the operator asked for — would have put the unit back on a wellhead with two cylinders that were going to fail inside a month, on a sour-gas job where failure is not a paperwork problem. We didn’t do that. We wrote it up properly, costed three options, and let the customer pick.',
    ),

    // /02 — Solution ──────────────────────────────────────────────────────
    sectionHead('/02', 'solution', 'What we did instead.'),
    para(
      'We rebuilt all eight tie-rod cylinders (four jacks, two snubbing, two travelling), replaced 96 hoses across the boom, jack circuit and accumulator manifold, repressurised the four accumulators with traceable nitrogen, and ran a closed-loop function test against the rig’s original commissioning sequence. Nineteen days, end to end, with three of our engineers on-site at JAFZA and two more on the bench in our Jebel Ali shop for the hose end-fitting work. Every assembly went out tagged, every test report sat on the customer’s rig manager’s desk before the unit was loaded.',
    ),
    para(
      'Every hose was built in-house to <strong>EN 856 4SP</strong> on the high-pressure circuits, <strong>EN 853 2SN</strong> on the return and case-drain lines, and <strong>API 7K Grade D</strong> on the two rotary-line replacements. End fittings are <strong>316 SS</strong> with <strong>NACE MR0175</strong>-compliant elastomers throughout — non-negotiable on sour service, and not a corner you cut to save a day.',
    ),
    figure(
      'Day 6 — JAFZA hose bay. Every assembly is laid out, tagged with circuit ID, swage number and proof-test record before it leaves the bench.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Hose crimping bay — 96 assemblies built to spec\n1200×675"',
      },
    ),
    pullQuote(
      'You can’t argue with sour service. NACE elastomers, 316 fittings, proof test on every assembly. The minute you cut a corner, you’re betting somebody’s life against three days of schedule.',
      '— Khalid Al Marzouqi · Field Lead · Jebel Ali',
    ),

    // /03 — Approach ──────────────────────────────────────────────────────
    sectionHead('/03', 'approach', 'How we approached it — the four phases.'),
    para(
      'Every workover-rig hydraulic overhaul we run in the Gulf goes through the same four phases. Names don’t change; the durations vary with how much we find on the bench.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Mobilise & inspect',
        body:
          'Engineer on rig within 24 h. Photo log, fluid sample, dimensional survey, recerts audit. Report on operator’s desk inside 48 h.',
        duration: 'Days 0 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'Quote & PO release',
        body:
          'Three-option quote: minimum-fix, recommended, full-recert. Hose schedule attached, with EN/API/SAE specs called out per circuit.',
        duration: 'Days 3 — 4',
      },
      {
        number: 'PHASE 03',
        title: 'Rebuild & assemble',
        body:
          'Cylinders honed, rods chromed, sealed to NACE. 96 hoses built in JAFZA bay. Accumulators re-bladdered, N₂ recharged.',
        duration: 'Days 5 — 14',
      },
      {
        number: 'PHASE 04',
        title: 'Function-test & release',
        body:
          'Closed-loop test vs OEM commissioning sequence. Witnessed by client rep. Sign-off pack: 42 pages, two paper copies on the skid.',
        duration: 'Days 15 — 19',
      },
    ]),

    // /04 — SOP ───────────────────────────────────────────────────────────
    sectionHead('/04', 'sop', 'The SOP we followed, line by line.'),
    para(
      'Below is the actual SOP for a tie-rod cylinder &amp; rig-hose overhaul on a sour-service workover unit — abridged. The full SOP-OG-014 runs 46 lines; this is the subset that was ticked off on this job, signed by the QA lead and counter-signed by the customer’s HSE rep.',
    ),
    sopBlock(
      'SOP-OG-014 · HWU CYLINDER & HOSE OVERHAUL · REV 06 · NACE',
      '20 / 20 COMPLETE',
      [
        {
          name: 'Phase 01 · Mobilise & inspect',
          rows: [
            {
              task: 'On-site inspection within 24 h',
              detail:
                'Engineer dispatched from JAFZA yard; photo log, walk-around, fluid sample',
              who: 'K. AL MARZOUQI',
              tool: 'Site visit',
            },
            {
              task: 'Sour-service classification',
              detail:
                'Confirmed H₂S partial pressure > 0.3 kPa — NACE MR0175 applies',
              who: 'QA',
              tool: 'Gas data',
            },
            {
              task: 'Cylinder rod straightness survey',
              detail: '3 of 4 jacks > 0.3 mm/m TIR — flagged for removal',
              who: 'QA',
              tool: 'Dial gauge',
            },
            {
              task: 'Hose schedule audit',
              detail:
                '96 assemblies inventoried by circuit, length, fitting, rated pressure',
              who: 'H. AL AWADI',
              tool: 'Tag sheet',
            },
            {
              task: 'Recerts & pressure-vessel audit',
              detail:
                'Accumulator N₂ pre-charge file 7 mo overdue; relief valves 4 mo overdue',
              who: 'QA',
              tool: 'Recerts log',
            },
          ],
        },
        {
          name: 'Phase 02 · Quote & PO release',
          rows: [
            {
              task: 'Three-option intake report (PDF)',
              detail: '22 pp · costed minimum, recommended, full-recert paths',
              who: 'Y. AL HASHIMI',
              tool: 'PDF',
            },
            {
              task: 'Customer PO & LOI received',
              detail: 'Recommended-path PO; LOI on file dated 2026-03-06 09:40 GST',
              who: 'SALES',
              tool: 'Email',
            },
          ],
        },
        {
          name: 'Phase 03 · Cylinder rebuild',
          rows: [
            {
              task: 'Disassemble 8× tie-rod cylinders',
              detail:
                '4× jack 6″ bore, 2× snubbing 4½″ bore, 2× travelling 5″ bore — tagged by position',
              who: 'O. AL MAKTOUM',
              tool: 'Workshop',
            },
            {
              task: 'Straighten & re-chrome 3× rods',
              detail:
                'Press-straightened to < 0.1 mm/m TIR; 80 µm hard chrome, ground to size',
              who: 'A. AL SUWAIDI',
              tool: 'Press + lathe',
            },
            {
              task: 'Hone 8× barrels',
              detail: '0.05 mm oversize bore; cross-hatch pattern at 45°, Ra 0.4 µm',
              who: 'A. AL SUWAIDI',
              tool: 'Hone bar',
            },
            {
              task: 'Fit NACE-spec seal kits',
              detail: 'HNBR rod & piston seals, FKM back-ups; all to MR0175',
              who: 'O. AL MAKTOUM',
              tool: 'Press fit',
            },
            {
              task: 'Wet-test each cylinder at 1.5× MAWP',
              detail: '525 bar held 30 min; leak-rate < 5 ml/min on all 8',
              who: 'QA',
              tool: 'Closed-loop rig',
            },
          ],
        },
        {
          name: 'Phase 04 · Hose build & install',
          rows: [
            {
              task: 'Build 60× hi-pressure hoses · EN 856 4SP',
              detail:
                '3/4″ & 1″ ID, 316 stainless fittings, proof-tested at 2× WP',
              who: 'H. AL AWADI',
              tool: 'Crimp bay',
            },
            {
              task: 'Build 28× return-line hoses · EN 853 2SN',
              detail: '1″ & 1¼″ ID, abrasion sleeve on boom run',
              who: 'H. AL AWADI',
              tool: 'Crimp bay',
            },
            {
              task: 'Build 8× rotary lines · API 7K Grade D',
              detail: '2″ ID, 5,000 psi WP, fire-resistant cover',
              who: 'H. AL AWADI',
              tool: 'API bay',
            },
            {
              task: 'Tag & certify every assembly',
              detail: 'Each hose: circuit ID, swage no., proof-test date, batch trace',
              who: 'QA',
              tool: 'Tag printer',
            },
            {
              task: 'Re-pressurise 4× accumulators',
              detail: '1,000 psi N₂ pre-charge, traceable bottle nos. on file',
              who: 'K. AL MARZOUQI',
              tool: 'N₂ rig',
            },
          ],
        },
        {
          name: 'Phase 05 · Function-test & release',
          rows: [
            {
              task: 'Closed-loop function test',
              detail:
                'Full skidding, jacking, snubbing sequence vs OEM commissioning script',
              who: 'QA',
              tool: 'Test rig',
            },
            {
              task: 'Client-witnessed sign-off',
              detail: 'Operator HSE rep present; ADNOC vendor cert verified',
              who: 'Y. AL HASHIMI',
              tool: 'On-site',
            },
            {
              task: 'Issue return packet',
              detail:
                '42 pp · test curves, NACE certs, hose register, recerts, photos × 38',
              who: 'Y. AL HASHIMI',
              tool: 'PDF + paper',
            },
          ],
        },
      ],
    ),

    // /05 — Technicals ────────────────────────────────────────────────────
    sectionHead('/05', 'technicals', 'The numbers, before and after.'),
    para(
      'Below is what we actually measured on the cylinders and hose population, against OEM and API/EN tolerance. Four cylinder findings and two hose findings would have failed an audit — all six were fixed in Phase 03. Numbers in the as-found column are the worst-case reading per population; after-rebuild is the average across the eight units or 96 hoses.',
    ),
    specTable(
      'FINDINGS · HWO-50K · SERIAL HWU-50-2218 · SOUR SERVICE',
      [
        {
          component: 'Jack rod straightness (avg of 4)',
          spec: '< 0.1 mm/m TIR',
          asFound: '0.42 mm/m',
          afterRebuild: '0.06 mm/m',
          status: '↻ Straightened + re-chromed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Barrel bore (jacks)',
          spec: '152.4 mm ± 0.05',
          asFound: '152.78 mm',
          afterRebuild: '152.45 mm',
          status: '↻ Honed +0.05',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Rod seal compound',
          spec: 'NACE HNBR',
          asFound: 'Standard NBR',
          afterRebuild: 'HNBR + FKM b/u',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hi-pressure hose cover (boom)',
          spec: 'EN 856 4SP, sound',
          asFound: 'UV-cracked, 60% pop.',
          afterRebuild: '100% new, tagged',
          status: '↻ All 60 replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'End fittings',
          spec: '316 SS, NACE',
          asFound: 'Mix of plated CS + 316',
          afterRebuild: '100% 316 SS',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator N₂ pre-charge',
          spec: '1,000 psi · ≤ 6 mo',
          asFound: '700 psi · 19 mo',
          afterRebuild: '1,000 psi · day 0',
          status: '↻ Re-charged, traceable',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Relief valve set pressure',
          spec: '5,250 psi ± 100',
          asFound: '5,180 psi',
          afterRebuild: '5,250 psi',
          status: '↻ Re-certified',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Cylinder wet-test, 525 bar',
          spec: '30 min hold',
          asFound: '—',
          afterRebuild: '30 min, 0 bar drop',
          status: '✓ Pass · all 8',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Hose proof-test, 2× WP',
          spec: '5 min hold',
          asFound: '—',
          afterRebuild: '96 / 96 passed',
          status: '✓ Pass',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
      ],
    ),

    // /06 — Outcome ───────────────────────────────────────────────────────
    sectionHead('/06', 'outcome', 'Outcome & sign-off.'),
    para(
      'The unit left our JAFZA yard on day 19, low-loaded back to the Rub’ al Khali on day 20, and was skidding on a wellhead by day 23. The operator made their Habshan slot with four days of margin to spare. All eight cylinders, the 96 new hoses and the four accumulators are covered under a single 12-month warranty for the assembled hydraulic system — not just parts, the whole circuit. We’ve since been added to the ADNOC AVL for hydraulic field services on the back of this job.',
    ),
    resultBox(
      'Result · summary',
      'Eight rebuilt cylinders, 96 new hoses, four re-certed accumulators — and a workover unit fit for sour service for the next 12 months.',
      'Delivered inside the operator’s 21-day window with four days of margin to spare. ADNOC vendor sign-off, NACE certs on every consumable, traceable from end fitting to nitrogen bottle. The unit went straight from low-loader to wellhead with zero rework on first power-up.',
      [
        { value: '19', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
        { value: '96 / 96', label: 'Hoses proof-passed', style: 'good' },
        { value: '8 / 8', label: 'Cyl. wet-test pass', style: 'good' },
        { value: '12', valueSmall: ' mo', label: 'System warranty' },
      ],
    ),

    // /07 — Team ──────────────────────────────────────────────────────────
    sectionHead('/07', 'team', 'The team on the job.'),
    teamList(
      'Five engineers logged time against this work order, all out of our Jebel Ali / JAFZA yard. If you call the workshop and ask about case 01, any of them can pull the file off the shelf within a minute.',
      [
        {
          name: 'Khalid Al Marzouqi',
          role: 'Field Lead',
          location: 'Jebel Ali',
          scope:
            'On-site inspection, accumulator re-charge, client-witness sign-off. First boots on the rig, last signature on the return packet.',
        },
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope:
            'Three-option quote, sign-off pack, customer-facing review. Owned the 42-page return packet and the ADNOC vendor verification.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Lead Fitter',
          location: 'Jebel Ali',
          scope:
            'Cylinder disassembly, NACE seal-kit fitting, wet-test on the closed-loop rig at 525 bar. Eight cylinders, eight clean test reports.',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'Machinist',
          location: 'Jebel Ali',
          scope:
            'Rod straightening, 80 µm hard chroming, barrel honing to 0.05 mm oversize at 45° cross-hatch and Ra 0.4 µm.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'Hose-bay Supervisor',
          location: 'JAFZA',
          scope:
            'All 96 hose assemblies built and tagged in-house. End-fitting traceability on every swage, proof test record on every line.',
        },
      ],
      'Case file · INTAKE-2026-03-097 · WO-2026-1077 · Published 2026-04-12 · Updated 2026-05-09',
    ),
  ],

  // Right rail ─────────────────────────────────────────────────────────────
  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,

  pullQuoteText:
    'You can’t argue with sour service. The minute you cut a corner, you’re betting somebody’s life against three days of schedule.',
  pullQuoteAuthor: 'Khalid Al Marzouqi',
  pullQuoteRole: 'Field Lead',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'HWO-50K' },
    { label: 'Service', value: 'Sour gas' },
    { label: 'Cylinders', value: '8 tie-rod' },
    { label: 'Hi-P hose', value: 'EN 856 4SP' },
    { label: 'Rotary line', value: 'API 7K-D' },
    { label: 'Elastomers', value: 'HNBR / FKM' },
    { label: 'Standard', value: 'NACE MR0175' },
    { label: 'TAT', value: '19 days' },
  ],

  galleryTotalCount: 38,

  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '22 pp', format: 'PDF' },
    { label: 'Hose register (XLSX)', url: '#', size: '96 rows', format: 'XLSX' },
    { label: 'NACE certs (ZIP)', url: '#', size: '12 MB', format: 'ZIP' },
    { label: 'Sign-off pack (PDF)', url: '#', size: '42 pp', format: 'PDF' },
  ],

  caseFileMeta:
    'Case file · INTAKE-2026-03-097 · WO-2026-1077 · Published 2026-04-12 · Updated 2026-05-09',

  // Card grid display ──────────────────────────────────────────────────────
  cardOneLiner:
    'ADNOC sub-contractor pulled a 50,000-lb hydraulic workover unit off a sour-gas well in the Rub’ al Khali. We rebuilt eight tie-rod cylinders, 96 hoses and four accumulators in our JAFZA yard — back skidding 23 days later.',
  cardOutcomePills: [
    { label: '19 D TAT', style: 'good' },
    { label: 'NACE MR0175', style: 'neutral' },
    { label: 'ADNOC AVL', style: 'accent' },
    { label: '12 MO WARRANTY', style: 'neutral' },
  ],
  cardDurationLabel: '19 D ON BENCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'CYLINDERS · OILFIELD',

  // Sort dimensions ────────────────────────────────────────────────────────
  durationDays: 19,
  // savingsAmount / savingsCurrency intentionally omitted — this is a
  // turnaround-time story, not a savings story.

  // SEO ────────────────────────────────────────────────────────────────────
  seoTitle:
    'Workover Rig Cylinder & Hose Overhaul, Jebel Ali — 19-day NACE rebuild on an ADNOC HWO-50K | Indus Hydraulics',
  seoDescription:
    'Eight tie-rod cylinders rebuilt, 96 hoses replaced (EN 856 4SP / EN 853 2SN / API 7K-D), four accumulators re-certed to NACE MR0175. ADNOC HWO-50K back skidding on a sour-gas wellhead 23 days after the call. Indus Hydraulics, Jebel Ali / JAFZA yard.',
  focusKeyword: 'workover rig cylinder overhaul Jebel Ali',
}

export default CASE
