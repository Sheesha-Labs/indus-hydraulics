/**
 * Case 08 — Sour-service hose assembly build, 100-line rig refit
 * 2026-05-11
 *
 * A drilling rig coming out of cold-stack needed a complete hose-assembly refresh
 * before re-mobilising to a sour-service well in the GCC. JAFZA hose bay built
 * 112 assemblies in 14 days against a fixed BOM, NACE-compliant end to end.
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
  slug: 'sour-service-hose-assembly-build-100-line-rig-refit',
  caseNumber: '08',
  isFeatured: false,
  category: 'hoses',
  topicLabel: 'Hoses · Sour Service · Industrial',
  region: '🇦🇪 UAE · Jebel Ali (JAFZA hose bay)',
  caseDateLabel: 'APR 2026 · JAFZA HOSE BAY',
  title: '112 assemblies, 14 days, every hose tagged. A cold-stacked rig refitted for sour service.',
  titleAccent: 'every hose tagged',
  deck:
    'A drilling rig coming out of cold-stack needed a full hose-assembly refresh before re-mobilising to a sour-gas well in the GCC. The drilling engineer handed us a 112-line bill of materials with a 14-day deadline. Every assembly NACE MR0175, every fitting 316 stainless, every hose proof-tested and traceable back to the mill cert. Built in our JAFZA hose bay.',

  heroImageCaption: 'FIG. 01 · JAFZA hose bay during build week — 112 assemblies laid out by circuit',
  heroImageCredit: 'PHOTO · H. AL AWADI · 2026-04-09',

  metaCells: [
    { label: 'Asset', value: 'BOM-112', valueSmall: ' · drilling rig refit', style: 'neutral' },
    { label: 'Assemblies', value: '112', valueSmall: ' · across 4 circuits', style: 'neutral' },
    { label: 'Build duration', value: '14', valueSmall: ' days', style: 'accent' },
    { label: 'Proof-pass rate', value: '112 / 112', style: 'good' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A cold-stacked rig and a 14-day window.'),
    lead(
      'The rig had been cold-stacked for fourteen months on a yard outside Mussafah. The operator had won a sour-gas drilling contract in the GCC and the re-mobilisation date was non-negotiable. The drilling engineer walked into our Jebel Ali office on a Tuesday with a printed bill of materials — 112 hose assemblies, four circuits, every line called out by hose grade, ID, length, end-fitting type and orientation — and asked one question: <strong>can you build this in fourteen days, NACE compliant?</strong>',
    ),
    para(
      'Cold-stack is hard on hydraulic hose. Fourteen months under Gulf sun, no flow, no maintenance: covers crack, swages corrode, elastomers go hard. A rig commissioning team can rebuild a top drive or recertify a BOP, but they cannot send a rig back to a sour-service well with field-built hose assemblies of unknown provenance. The operator wanted everything new, everything traceable, everything built to one specification. The risk was not the build — the risk was that a high-volume hose bay, building 112 assemblies in 14 days, would mix one EN-spec carbon-steel fitting into a NACE assembly by accident. <strong>One swage with the wrong elastomer in a sour-gas line is a fatality waiting for the right pressure spike.</strong>',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"112 assemblies, fourteen days, NACE — confirm or decline."',
        body:
          'Drilling engineer brought a fixed BOM, four circuits, fourteen-day window. He needed a yes/no by end of day Tuesday so he could decide whether to source elsewhere. No room for negotiation on spec or schedule.',
      },
      {
        label: 'What the build risk actually was',
        title: 'High volume + NACE = procedural discipline, not throughput',
        body:
          'A 112-assembly batch can be hit in 14 days by any reputable hose bay. The hard part is preventing one wrong fitting, one non-NACE elastomer, one untraceable coil from slipping into the batch. The build process had to make that mistake structurally impossible.',
      },
    ),
    para(
      'We confirmed by Tuesday evening on three conditions: the drilling engineer signed off on the BOM unchanged before we cut a single hose, every coil and every fitting got a mill-cert audit at the door before it touched the crimper, and every assembly carried a tag with circuit ID, swage number, proof-test date and batch trace from the day it left the bench. He signed. We started cutting Wednesday morning.',
    ),

    sectionHead('/02', 'solution', '112 assemblies across four circuits, all traceable.'),
    para(
      'The build broke into four parallel work-streams matched to the four circuits on the BOM. <strong>60 hi-pressure boom-circuit hoses</strong> built to <strong>EN 856 4SP</strong> in 3/4" and 1" ID — four-spiral construction for the high-cycle jacking and pull-down lines, working pressure in the 6,000 psi range. <strong>30 return-line and case-drain hoses</strong> built to <strong>EN 853 2SN</strong> in 1" and 1-1/4" ID for the lower-pressure circuits. <strong>12 rotary-line hoses</strong> built to <strong>API 7K Grade D</strong> in 2" ID, 5,000 psi WP, fire-resistant cover — the only hoses on a drilling rig that have to survive a rig-floor fire long enough to shut the well in. <strong>10 short-radius accumulator-circuit hoses</strong> built to <strong>EN 856 4SP</strong> in 1/2" ID for the BOP control manifold.',
    ),
    para(
      'Every assembly across all four circuits used the same fitting and elastomer recipe: <strong>316 stainless steel end fittings</strong> (the entire JAFZA stock of plated carbon-steel fittings was physically removed from the bay for the duration of the build, to make a wrong-fitting selection impossible), <strong>HNBR rod packing inside the swage</strong>, <strong>FKM (Viton) cover</strong> for sour-service compatibility. Proof-tested at <strong>2× working pressure for 5 minutes</strong> on every assembly. Tagged with circuit ID, swage number, proof-test date and a batch-trace reference that links the assembly back to the mill cert (EN 10204 3.1) on the raw hose coil.',
    ),
    figure(
      'Day 8 — JAFZA crimp bay. Four-spiral EN 856 4SP coil being cut to length for a boom-circuit assembly. The yellow tag carries the BOM line number; nothing leaves the bay without it.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Crimp bay during build, hose coil staged with BOM tag\\n1200×675"',
      },
    ),
    pullQuote(
      'The difference between a hose shop and a NACE-compliant hose shop is one word — traceability. Anybody can crimp a swage. The question is whether you can hand the drilling engineer a binder that links every assembly back to the mill cert. If you cannot, you are not in sour service.',
      '— Hassan Al Awadi · Hose Bay Supervisor · JAFZA',
    ),

    sectionHead('/03', 'approach', 'Four phases across fourteen days.'),
    para(
      'A high-volume NACE build is not a sprint — it is four sequential gates with hard go/no-go criteria at each one. Skip a gate and the cost shows up at proof-test, where you scrap assemblies. We hit zero scrap on this build because we did not skip the gates.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'BOM verify + raw-material inspection',
        body:
          'Drilling engineer sign-off on the BOM. Mill-cert audit on every coil and every fitting at the door. Plated-carbon fittings removed from the bay.',
        duration: 'Days 0 — 1',
      },
      {
        number: 'PHASE 02',
        title: 'Build',
        body:
          '112 assemblies cut, swaged, marked. Crimp die-set verified before each new hose grade. BOM tag follows every assembly from cutting bench to crimp to QA.',
        duration: 'Days 2 — 11',
      },
      {
        number: 'PHASE 03',
        title: 'Proof test + tag',
        body:
          'Every assembly proof-tested at 2× WP for 5 min on closed-loop rig. Pass logged, tag printed: circuit ID, swage no., proof date, batch trace.',
        duration: 'Days 12 — 13',
      },
      {
        number: 'PHASE 04',
        title: 'Delivery + sign-off',
        body:
          '112 assemblies palletised by circuit. Traceability ledger handed over: mill certs, crimp logs, proof records, NACE certs. Drilling engineer signs.',
        duration: 'Day 14',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we followed, line by line.'),
    para(
      'The full SOP-OG-014 covers every NACE-rated hose-assembly build that leaves the JAFZA bay. Below is the abridged version that was ticked off across the 14 days — 22 lines covering raw material inspection, crimp-setup verification, build, proof-test and batch traceability.',
    ),
    sopBlock(
      'SOP-OG-014 · HOSE ASSEMBLY BUILD · REV 06 · NACE',
      '22 / 22 COMPLETE',
      [
        {
          name: 'Phase 01 · BOM verify + raw-material inspection',
          rows: [
            {
              task: 'BOM signed by drilling engineer',
              detail: '112 lines, four circuits, all spec callouts confirmed unchanged before cutting',
              who: 'H. AL AWADI',
              tool: 'BOM PDF',
            },
            {
              task: 'Mill-cert audit on every hose coil',
              detail: 'EN 10204 3.1 cert checked against coil batch number on each of 14 coils received',
              who: 'A. AL SUWAIDI',
              tool: 'Cert binder',
            },
            {
              task: 'Fitting cert audit · 316 SS only',
              detail: '418 fittings inspected at the door; cert + heat number logged per fitting type',
              who: 'A. AL SUWAIDI',
              tool: 'Heat log',
            },
            {
              task: 'Plated-CS fittings removed from bay',
              detail: 'All non-316 fittings physically lifted out of the build bay before Day 2 cut start',
              who: 'O. AL MAKTOUM',
              tool: 'Bay sweep',
            },
            {
              task: 'Elastomer batch verified · HNBR + FKM',
              detail: 'Sour-service compound batch numbers logged on the build sheet for each circuit',
              who: 'A. AL SUWAIDI',
              tool: 'Batch log',
            },
          ],
        },
        {
          name: 'Phase 02 · Build · 112 assemblies',
          rows: [
            {
              task: 'Crimp die-set verified · EN 856 4SP',
              detail: 'Test crimp on offcut measured against fitting OEM crimp chart before batch start',
              who: 'O. AL MAKTOUM',
              tool: 'Crimp gauge',
            },
            {
              task: 'Build 60× hi-pressure hoses · EN 856 4SP',
              detail: '3/4" and 1" ID, 316 SS fittings, BOM tag attached at cut and walked through to QA',
              who: 'O. AL MAKTOUM',
              tool: 'Crimp bay',
            },
            {
              task: 'Build 30× return-line hoses · EN 853 2SN',
              detail: '1" and 1-1/4" ID, 316 SS fittings, abrasion sleeve on case-drain run',
              who: 'O. AL MAKTOUM',
              tool: 'Crimp bay',
            },
            {
              task: 'Build 12× rotary-line hoses · API 7K-D',
              detail: '2" ID, 5,000 psi WP, fire-resistant cover, 316 SS hammer-union fittings',
              who: 'O. AL MAKTOUM',
              tool: 'API bay',
            },
            {
              task: 'Build 10× accumulator-circuit hoses · EN 856 4SP',
              detail: '1/2" ID short-radius assemblies for BOP control manifold; tight-bend swage check',
              who: 'O. AL MAKTOUM',
              tool: 'Crimp bay',
            },
            {
              task: 'Crimp dimension log per assembly',
              detail: 'Crimp diameter measured and logged against OEM spec for every one of 112 assemblies',
              who: 'A. AL SUWAIDI',
              tool: 'Caliper + log',
            },
          ],
        },
        {
          name: 'Phase 03 · Proof test + tag',
          rows: [
            {
              task: 'Proof test rig calibration check',
              detail: 'Pressure transducer calibration cert verified in date; rig zeroed before batch start',
              who: 'A. AL SUWAIDI',
              tool: 'Test rig',
            },
            {
              task: 'Proof test 60× EN 856 4SP at 12,000 psi',
              detail: '2× WP held 5 min, leak rate logged; one assembly per rack proof-tested at a time',
              who: 'A. AL SUWAIDI',
              tool: 'Closed-loop',
            },
            {
              task: 'Proof test 30× EN 853 2SN at 6,000 psi',
              detail: '2× WP held 5 min on every return-line and case-drain assembly',
              who: 'A. AL SUWAIDI',
              tool: 'Closed-loop',
            },
            {
              task: 'Proof test 12× API 7K-D at 10,000 psi',
              detail: '2× WP held 5 min on every rotary-line assembly with hammer-union end loaded',
              who: 'A. AL SUWAIDI',
              tool: 'API rig',
            },
            {
              task: 'Proof test 10× accumulator hoses at 12,000 psi',
              detail: '2× WP held 5 min on short-radius BOP-circuit assemblies, tight-bend integrity logged',
              who: 'A. AL SUWAIDI',
              tool: 'Closed-loop',
            },
            {
              task: 'Tag print + attach · 112 assemblies',
              detail: 'Tag carries circuit ID, swage no., proof-test date, batch trace ref, NACE marker',
              who: 'A. AL SUWAIDI',
              tool: 'Tag printer',
            },
          ],
        },
        {
          name: 'Phase 04 · Delivery + sign-off',
          rows: [
            {
              task: 'Palletise by circuit',
              detail: 'Four pallets — boom, return, rotary, accumulator — each circuit BOM stapled to the pallet',
              who: 'Y. AL HASHIMI',
              tool: 'Workshop',
            },
            {
              task: 'Compile traceability ledger',
              detail: '112 entries · mill cert ref + crimp log + proof record + NACE marker per assembly',
              who: 'A. AL SUWAIDI',
              tool: 'PDF + paper',
            },
            {
              task: 'Drilling engineer sign-off',
              detail: 'On-site witness at JAFZA bay; spot-check on 8 random assemblies against ledger entries',
              who: 'K. AL MARZOUQI',
              tool: 'On-site',
            },
            {
              task: 'Issue NACE certificate per assembly',
              detail: '112 individual NACE MR0175 certs issued, signed, scanned and emailed to drilling engineer',
              who: 'Y. AL HASHIMI',
              tool: 'PDF',
            },
            {
              task: 'Low-loader release to rig yard',
              detail: 'Four pallets released on Day 14 evening; transport docs cross-referenced to ledger',
              who: 'K. AL MARZOUQI',
              tool: 'Dispatch',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'Spec table — what was built and how it tested.'),
    para(
      'The build sheet below shows the four circuits side by side: hose grade, ID range, end-fitting material, elastomer compound, proof-test pressure and pass rate. Four rows are highlighted as the critical findings — the ones the drilling engineer audited on the spot before signing.',
    ),
    specTable(
      'BUILD · BOM-112 · DRILLING RIG REFIT · SOUR SERVICE NACE MR0175',
      [
        {
          component: 'Hi-pressure boom-circuit hose',
          spec: 'EN 856 4SP · 6,000 psi WP',
          asFound: '60 assemblies cut',
          afterRebuild: '60 / 60 proof-passed at 12,000 psi',
          status: '✓ Pass · all 60',
          highlight: true,
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Return + case-drain hose',
          spec: 'EN 853 2SN · 3,000 psi WP',
          asFound: '30 assemblies cut',
          afterRebuild: '30 / 30 proof-passed at 6,000 psi',
          status: '✓ Pass · all 30',
          highlight: true,
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Rotary-line hose',
          spec: 'API 7K Grade D · 5,000 psi WP',
          asFound: '12 assemblies cut',
          afterRebuild: '12 / 12 proof-passed at 10,000 psi',
          status: '✓ Pass · all 12',
          highlight: true,
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Accumulator-circuit hose',
          spec: 'EN 856 4SP · 1/2" ID short-radius',
          asFound: '10 assemblies cut',
          afterRebuild: '10 / 10 proof-passed at 12,000 psi',
          status: '✓ Pass · all 10',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'End-fitting material',
          spec: '316 SS · NACE MR0175',
          asFound: '418 fittings cert-audited',
          afterRebuild: '100% 316 SS · 0 plated-CS in bay',
          status: '✓ Confirmed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Rod packing inside swage',
          spec: 'HNBR · sour-service rated',
          asFound: '4 batch numbers verified',
          afterRebuild: '100% HNBR · batch logged per assembly',
          status: '✓ Confirmed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Hose cover compound',
          spec: 'FKM (Viton) · sour-service rated',
          asFound: 'Coil cover spec verified',
          afterRebuild: '112 / 112 FKM cover',
          status: '✓ Confirmed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Proof-test pressure',
          spec: '2× WP held 5 min',
          asFound: 'Test rig cal cert in date',
          afterRebuild: 'Held to spec on 112 / 112',
          status: '✓ Pass',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Mill-cert traceability',
          spec: 'EN 10204 3.1 per coil',
          asFound: '14 coils received with cert',
          afterRebuild: '100% logged · ledger ref per assembly',
          status: '✓ Logged',
          highlight: true,
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Crimp-dimension verification',
          spec: 'OEM crimp chart ± 0.1 mm',
          asFound: 'Die-set verified per grade',
          afterRebuild: '112 / 112 in spec · logged per assembly',
          status: '✓ Pass',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'NACE certificate per assembly',
          spec: 'MR0175 / ISO 15156',
          asFound: '—',
          afterRebuild: '112 / 112 issued',
          status: '✓ Issued',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', '112 / 112 first-pass, ledger handed over on Day 14.'),
    para(
      'Every assembly passed proof-test on first attempt. No scrap, no re-builds, no slipped tags. The traceability ledger went over to the drilling engineer on Day 14 evening — 112 entries, each with the mill cert reference for the raw coil, the crimp log entry for the fitting, the proof-test record and an individual NACE MR0175 certificate. He spot-checked eight assemblies at random against the ledger before signing. The four pallets — boom, return, rotary, accumulator — were on a low-loader to the rig yard at Mussafah by midnight. The rig re-mobilised to its sour-gas well three weeks later, on schedule.',
    ),
    resultBox(
      'Result · summary',
      '112 assemblies built in 14 days, every one NACE-traceable from end-fitting to mill cert.',
      'Delivered inside the drilling engineer\'s window with zero scrap on the proof bench. The traceability ledger is the deliverable that mattered — without it, the assemblies cannot legally go on a sour-service well, no matter how well they are crimped. JAFZA bay closed the build with 112 individual NACE certs, four pallets, and one signed BOM.',
      [
        { value: '14', valueSmall: ' days', label: 'Build duration', style: 'accent' },
        { value: '112 / 112', label: 'Proof-test first pass', style: 'good' },
        { value: '112 / 112', label: 'Mill-cert traceable', style: 'good' },
        { value: '0', label: 'Scrap or rebuilds' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the bench in JAFZA.'),
    teamList(
      'Five engineers logged time against this build, all out of the JAFZA hose bay and the Jebel Ali workshop. The build is a team sport when the volume is high and the standard is NACE — every gate has a different signature on it. If you call the bay and ask about case 08, any of them can pull the file.',
      [
        {
          name: 'Hassan Al Awadi',
          role: 'Hose Bay Supervisor',
          location: 'JAFZA',
          scope: 'BOM sign-off coordination, build-bay sequencing, daily progress against the 14-day schedule',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'QA · Materials & Traceability',
          location: 'JAFZA',
          scope: 'Mill-cert audit on every coil, fitting heat-number log, crimp-dimension log, traceability ledger',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Lead Crimp Operator',
          location: 'JAFZA',
          scope: 'Die-set verification per hose grade, all 112 swage operations across the four circuits',
        },
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope: 'Build-bay sweep of plated-CS fittings, palletisation by circuit, NACE certificate issuance',
        },
        {
          name: 'Khalid Al Marzouqi',
          role: 'Field Lead · Sign-off',
          location: 'Jebel Ali',
          scope: 'On-site witness for drilling engineer sign-off, dispatch coordination to the rig yard at Mussafah',
        },
      ],
      'Case file · INTAKE-2026-04-114 · WO-2026-1184 · Published 2026-05-02 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'Anybody can build 112 hoses in 14 days. The question on a sour-service well is whether you can hand the drilling engineer one binder that links every swage back to the mill cert. That is the only difference that matters.',
  pullQuoteAuthor: 'Aisha Al Suwaidi',
  pullQuoteRole: 'QA / Materials · JAFZA',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: '112-line BOM' },
    { label: 'Service', value: 'Sour gas · NACE MR0175' },
    { label: 'Hi-P circuit', value: 'EN 856 4SP · 60 ea' },
    { label: 'Return', value: 'EN 853 2SN · 30 ea' },
    { label: 'Rotary line', value: 'API 7K-D · 12 ea' },
    { label: 'Accumulator', value: 'EN 856 4SP · 10 ea' },
    { label: 'End fittings', value: '316 stainless steel' },
    { label: 'Elastomers', value: 'HNBR rod / FKM cover' },
    { label: 'Proof test', value: '2× WP · 5 min hold' },
    { label: 'Build duration', value: '14 days' },
  ],
  galleryTotalCount: 42,
  downloads: [
    { label: 'Bill of materials (PDF)', url: '#', size: '12 pp', format: 'PDF' },
    { label: 'Traceability ledger (XLSX)', url: '#', size: '112 rows', format: 'XLSX' },
    { label: 'NACE certs · all 112 (ZIP)', url: '#', size: '18 MB', format: 'ZIP' },
    { label: 'Proof-test records (PDF)', url: '#', size: '38 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-114 · WO-2026-1184 · Published 2026-05-02 · Updated 2026-05-09',

  cardOneLiner:
    'Drilling rig coming out of cold-stack. Drilling engineer hands us a 112-line BOM with a 14-day window, sour-service NACE across all four circuits. Built in JAFZA hose bay; every assembly tagged and traceable.',
  cardOutcomePills: [
    { label: '112 / 112 PROOF-PASS', style: 'good' },
    { label: '14-DAY BUILD', style: 'neutral' },
    { label: 'NACE MR0175 PER ASSEMBLY', style: 'accent' },
  ],
  cardDurationLabel: '14 D BUILD',
  cardTagStyle: 'standard',
  cardTagLabel: 'HOSES',

  durationDays: 14,

  seoTitle:
    '112 sour-service hose assemblies built in 14 days for a cold-stacked rig refit · NACE MR0175 · JAFZA hose bay · Indus Hydraulics Case 08',
  seoDescription:
    'Indus Hydraulics built 112 NACE-compliant hose assemblies in 14 days at the JAFZA hose bay for a drilling rig coming out of cold-stack. EN 856 4SP, EN 853 2SN, API 7K Grade D. 316 stainless fittings, HNBR rod, FKM cover. Every assembly proof-tested at 2× WP and traceable from end-fitting to mill cert.',
  focusKeyword: 'sour service hose assembly NACE MR0175 JAFZA',
}

export default CASE
