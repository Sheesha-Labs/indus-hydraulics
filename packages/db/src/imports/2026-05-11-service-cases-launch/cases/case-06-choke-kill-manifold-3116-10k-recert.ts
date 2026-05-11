/**
 * Case 06 — Choke & Kill Manifold · 3-1/16" 10K · API 16C 5-Year Recert
 * 2026-05-11
 *
 * A 3-1/16" 10,000 psi sour-service choke & kill manifold from ADNOC Offshore
 * (Lower Zakum) came in for its mandatory 5-year API 16C recertification:
 * full strip, NACE-compliant trim swap on 8 gate valves and 2 chokes, NDT
 * everything, 15,000 psi shell test, and a fresh 5-year stamp out the door.
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
  slug: 'choke-kill-manifold-3116-10k-api-16c-recert',
  caseNumber: '06',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'Choke & Kill · API 16C · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'FEB 2026 · BAY 1 / WORKSHOP',
  title:
    'A 3-1/16" 10K choke & kill manifold, eight gate valves, and the trim swap that bought it five more years of sour service.',
  titleAccent: 'the trim swap that bought it five more years of sour service',
  deck:
    'A 10,000 psi choke & kill stack from ADNOC Offshore Lower Zakum landed in our Jebel Ali bay with the API 16C clock at 4 years 11 months. Twenty-eight days later it left with eight rebuilt gate valves, two re-trimmed chokes, every metallic part NDT-cleared, a 15,000 psi shell-test record on every body, and a fresh five-year recert stamp valid through 2031.',

  heroImageCaption:
    'FIG. 01 · 3-1/16" 10K choke & kill manifold on the bench · Bay 1, Jebel Ali · day 2',
  heroImageCredit: 'PHOTO · Y. AL HASHIMI · 2026-02-04',

  metaCells: [
    { label: 'Asset', value: 'C&K-3116-10K', valueSmall: ' · API 16C', style: 'neutral' },
    { label: 'Gate valves', value: '8', valueSmall: ' · 3-1/16" 10K', style: 'neutral' },
    { label: 'Chokes', value: '2', valueSmall: ' · 1× hyd / 1× man', style: 'neutral' },
    { label: 'Turnaround', value: '28', valueSmall: ' days', style: 'accent' },
    { label: 'Sour service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A 5-year clock, a sour-service stack, and a stamp that was about to expire.'),
    lead(
      'The transporter rolled in on a Tuesday afternoon. A 3-1/16" 10,000 psi choke & kill manifold from ADNOC Offshore — Lower Zakum platform, sour-service trim, painted ADNOC red — sat strapped to the trailer with a stamped tag that said the <strong>API 16C 5-year recert was due in 27 days</strong>. It came in alongside a BOP stack from the same platform that we recerted in parallel; this is the choke and kill side of that intake.',
    ),
    para(
      'The customer brief was tight and honest: full <strong>API 16C 5-year recertification</strong> per the standard, NACE MR0175 / ISO 15156 compliance, hydrostatic shell test at 1.5× working pressure, function test on every valve and choke, and a clean FAT pack the operator could hand to ADNOC HSE without a single yellow tag. The deadline was Lower Zakum\'s next workover slot. Twenty-eight days. Eight gate valves and two chokes. Every body, every stem, every stud — on the bench.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Strip, NDT, trim swap, hydrotest. Standard 5-year recert."',
        body:
          'ADNOC sent the manifold in with a clean inbound report: in-service for 4 years 11 months, no recorded kicks above 6,500 psi, no visible external corrosion. The asks: full strip, NACE-compliant trim, NDT scope per API 16C Annex F, 15,000 psi shell test, fresh recert.',
      },
      {
        label: 'What the inspection actually found',
        title: 'Three seats eroded from kick cycling, two stems with chloride pitting, half the bolting non-NACE',
        body:
          'Strip-down day 3: 3 of 8 gate-valve seats showed cyclic-pressure erosion at the seal land. 2 stems carried chloride pitting consistent with sour-service exposure. The hydraulic choke\'s orifice was 0.6 mm out vs OEM. And a count of the bolting found 38 of 64 studs were non-NACE B7 — they had to come out.',
      },
    ),
    para(
      'API 16C is unambiguous on this. A 5-year recert is not a clean-and-paint exercise; it is a full strip, NDT pass, hydrotest hold and FAT certification — and on a sour-service stack, the trim must be NACE MR0175 / ISO 15156 compliant from seat to packing to bolting. The operator\'s ask was correct. The inspection just told us how much trim was actually coming out of the boxes.',
    ),

    sectionHead('/02', 'solution', 'Strip everything. NDT everything. Trim everything. Stamp it for five more years.'),
    para(
      'Twenty-eight days, end to end. We stripped all 8 gate valves and both chokes down to bare bodies, sent every metallic part through MPI + UT + hardness verification per <strong>NACE MR0175</strong> (≤ 22 HRC ceiling), replaced every seat in the stack with <strong>Inconel-625-clad NACE-trim</strong> seats, swapped every stem packing to <strong>HNBR + FKM back-up</strong>, replaced both choke trim sets with OEM dimensional kits, and pulled all 64 body studs to put <strong>ASTM A193 B7M / 2HM</strong> sour-service bolting back in. Every body went through a hydrostatic shell test at 1.5× WP — <strong>15,000 psi held for 30 minutes</strong> — and every valve got a function-cycle test on the closed-loop rig before it went into the FAT pack.',
    ),
    para(
      'The bodies themselves — AISI 4130 alloy steel forgings, 10K class — passed UT and MPI with no rejectable indications. That was the easy part. The harder part was the stem-packing chamber on two of the gate valves: chloride pitting deep enough that we re-machined the chamber 0.15 mm under and fitted oversize HNBR seals to rebuild the seal land cleanly. That work is in the spec table at /05.',
    ),
    figure(
      'Day 14 — Bay 1 trim bench. All 8 gate-valve seats laid out in NACE MR0175 trim alongside the as-found seats they replaced. Inconel-625 cladding on every sealing surface; B7M studs fanned out below.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Gate-valve trim bench, NACE seats laid out for swap\\n1200×675"',
      },
    ),
    pullQuote(
      'On a sour-service recert what matters most is what is NOT in the trim. No standard B7 studs. No NBR seals. No plain carbon-steel seat inserts. You don\'t pass API 16C by hitting numbers — you pass it by having nothing in the assembly that violates NACE.',
      '— Omar Al Maktoum · Lead Valve Technician · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases on the bench, twenty-eight days, no overtime.'),
    para(
      'Every API 16C 5-year recert we run goes through the same four phases. The clock varies with what the bodies and trim hand us; the phase names don\'t change. This one ran clean to the day.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt, strip & survey',
        body:
          'Manifold offloaded into Bay 1, photo log, traceability tags on every body. Full strip-down to bare metal — bonnets off, gates out, choke trim out, all 64 studs pulled.',
        duration: 'Days 0 — 3',
      },
      {
        number: 'PHASE 02',
        title: 'NDT & material verification',
        body:
          'MPI on every machined surface, UT on every body, hardness test on every metallic component. NACE MR0175 ≤ 22 HRC ceiling enforced. Mill certs cross-checked against EN 10204 3.1 / 3.2.',
        duration: 'Days 4 — 10',
      },
      {
        number: 'PHASE 03',
        title: 'Trim swap & rebuild',
        body:
          'New Inconel-625-clad seats fitted, HNBR + FKM packing repacked, both choke trim sets swapped, all 64 studs replaced with B7M, torqued to API 6A spec.',
        duration: 'Days 11 — 22',
      },
      {
        number: 'PHASE 04',
        title: 'Hydrotest, function & FAT',
        body:
          '15,000 psi shell hold, 30 min, on every body. Function cycle on every gate valve, choke open/close on both chokes. FAT pack signed by ADNOC vendor rep on day 28.',
        duration: 'Days 23 — 28',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we followed, line by line.'),
    para(
      'Below is the abridged checklist from <strong>SOP-OG-018</strong>, the procedure we use for every API 16C 5-year recert in the Jebel Ali bay. The full document runs 41 lines; this is the subset that was ticked off on this manifold, in order.',
    ),
    sopBlock(
      'SOP-OG-018 · CHOKE & KILL API 16C 5-YEAR RECERT · REV 06 · NACE',
      '23 / 23 COMPLETE',
      [
        {
          name: 'Phase 01 · Receipt, strip & survey',
          rows: [
            {
              task: 'Inbound traceability tags on every body',
              detail: 'Bay 1 receipt — manifold serial, 8× valve bodies, 2× choke bodies, 64× studs all logged',
              who: 'Y. AL HASHIMI',
              tool: 'Tag printer',
            },
            {
              task: 'Full strip to bare metal',
              detail: 'Bonnets off, gates out, choke trim out, every stud pulled, every elastomer disposed',
              who: 'O. AL MAKTOUM',
              tool: 'Workshop',
            },
            {
              task: 'As-found dimensional & visual survey',
              detail: 'Seat sealing land, stem chamber, choke orifice, body bore — measured against OEM print',
              who: 'A. AL SUWAIDI',
              tool: 'Micrometer',
            },
            {
              task: 'Bolting audit',
              detail: '64 studs counted, marked for grade — found 38× B7 (non-NACE), all flagged for replacement',
              who: 'A. AL SUWAIDI',
              tool: 'Hardness pen',
            },
          ],
        },
        {
          name: 'Phase 02 · NDT & material verification',
          rows: [
            {
              task: 'MPI on every machined surface',
              detail: 'Wet-fluorescent MPI per ASTM E709 — every body, bonnet, gate, stem, choke needle',
              who: 'A. AL SUWAIDI',
              tool: 'MPI bench',
            },
            {
              task: 'UT on all body forgings',
              detail: 'Straight-beam UT per API 16C Annex F — 8× valve bodies + 2× choke bodies + manifold spool',
              who: 'A. AL SUWAIDI',
              tool: 'UT probe',
            },
            {
              task: 'Hardness verification — NACE MR0175',
              detail: '≤ 22 HRC ceiling enforced on every wetted metallic part. 3 readings per part, averaged',
              who: 'A. AL SUWAIDI',
              tool: 'Brinell',
            },
            {
              task: 'Mill cert cross-check',
              detail: 'EN 10204 3.1 / 3.2 certs pulled and cross-referenced against heat numbers stamped on parts',
              who: 'F. AL MANSOORI',
              tool: 'Cert file',
            },
          ],
        },
        {
          name: 'Phase 03 · Trim swap & rebuild',
          rows: [
            {
              task: 'Re-machine 2× stem packing chambers',
              detail: 'Chloride pits 0.08 mm deep cleaned out at 0.15 mm undercut; oversize HNBR fitted',
              who: 'H. AL AWADI',
              tool: 'CNC lathe',
            },
            {
              task: 'Fit 8× Inconel-625-clad NACE seats',
              detail: 'OEM seat kits, factory-clad sealing surfaces, fitted to torque per OEM 6A spec',
              who: 'O. AL MAKTOUM',
              tool: 'Press fit',
            },
            {
              task: 'Repack 8× stems · HNBR + FKM',
              detail: 'HNBR primary + FKM back-up, all NACE MR0175 grade, lubricated with NACE-rated grease',
              who: 'O. AL MAKTOUM',
              tool: 'Pack tool',
            },
            {
              task: 'Swap both choke trim sets',
              detail: 'Hyd choke: new tungsten-carbide needle + cage. Manual choke: new TC seat + needle',
              who: 'O. AL MAKTOUM',
              tool: 'Workshop',
            },
            {
              task: 'Replace 64× body studs · B7M / 2HM',
              detail: 'ASTM A193 B7M studs + ASTM A194 2HM nuts, torqued to API 6A spec, witness-marked',
              who: 'H. AL AWADI',
              tool: 'Torque wrench',
            },
            {
              task: 'Reassemble manifold spool',
              detail: 'Valves and chokes assembled to spool body in OEM configuration, ring gaskets renewed',
              who: 'O. AL MAKTOUM',
              tool: 'Workshop',
            },
          ],
        },
        {
          name: 'Phase 04 · Hydrotest, function & FAT',
          rows: [
            {
              task: 'Hydrostatic shell test · 15,000 psi · 30 min',
              detail: '1.5× 10K WP, held 30 min per body, leak-rate ≤ 0 psi drop on all 8 valves + 2 chokes',
              who: 'A. AL SUWAIDI',
              tool: 'Hydrotest rig',
            },
            {
              task: 'Function test · every gate valve',
              detail: 'Open/close cycle, hand-wheel torque measured, gate-stem indicator verified — all 8 pass',
              who: 'O. AL MAKTOUM',
              tool: 'Test bench',
            },
            {
              task: 'Function test · both chokes',
              detail: 'Hyd choke: full open/close vs HMI position. Manual choke: full sweep, indicator verified',
              who: 'O. AL MAKTOUM',
              tool: 'Test bench',
            },
            {
              task: 'NACE MR0175 / ISO 15156 compliance cert',
              detail: 'Cert issued covering every wetted metallic part + every elastomer in the assembly',
              who: 'F. AL MANSOORI',
              tool: 'QA pack',
            },
            {
              task: 'API 16C 5-year recert stamp',
              detail: 'Recert tag stamped on manifold spool: valid through 2031-02, signed by Engineering Authority',
              who: 'F. AL MANSOORI',
              tool: 'Stamp',
            },
            {
              task: 'Client-witnessed FAT',
              detail: 'ADNOC vendor rep on bench day 28 — every test re-verified, FAT pack signed live',
              who: 'K. AL MARZOUQI',
              tool: 'On-bench',
            },
            {
              task: 'Issue FAT pack',
              detail: '58 pp · NDT records, hardness logs, hydrotest curves, mill certs, NACE certs, photos × 42',
              who: 'F. AL MANSOORI',
              tool: 'PDF + paper',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we measured, before and after.'),
    para(
      'Below is what the as-found survey returned against OEM and API 16C tolerance, and what the rebuild handed back. Four findings would have failed an API 16C audit on the spot — all four are highlighted, all four were corrected in Phase 03.',
    ),
    specTable(
      'FINDINGS · C&K-3116-10K · SERIAL CKM-3116-2087 · SOUR SERVICE',
      [
        {
          component: 'Gate-valve seat sealing land (avg of 8)',
          spec: 'OEM contour, no erosion',
          asFound: '3 of 8 eroded, 0.4 mm',
          afterRebuild: '8 of 8 new, OEM',
          status: '↻ All 8 seats replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Gate-valve seat material',
          spec: 'NACE MR0175 trim',
          asFound: 'B7 / std carbide',
          afterRebuild: 'Inconel-625 clad',
          status: '↻ Replaced — NACE',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Stem packing material',
          spec: 'NACE HNBR + FKM',
          asFound: 'Standard NBR',
          afterRebuild: 'HNBR + FKM b/u',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Stem chamber surface (2 of 8)',
          spec: 'Ra ≤ 0.8 µm, no pits',
          asFound: 'Cl⁻ pits, 0.08 mm',
          afterRebuild: '0.15 mm undercut, OS pack',
          status: '↻ Re-machined',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Body stud grade (count of 64)',
          spec: 'ASTM A193 B7M (NACE)',
          asFound: '38× B7 / 26× B7M',
          afterRebuild: '64× B7M',
          status: '↻ All 64 replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hyd choke needle/orifice',
          spec: 'OEM dim ± 0.1 mm',
          asFound: '+0.6 mm erosion',
          afterRebuild: 'New TC kit, OEM',
          status: '↻ Trim swapped',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Manual choke trim',
          spec: 'OEM TC seat + needle',
          asFound: 'Light wear, in tol',
          afterRebuild: 'New TC kit, OEM',
          status: '↻ Trim swapped',
          afterStyle: 'good',
        },
        {
          component: 'Body NDT (MPI + UT)',
          spec: 'No rejectable indications',
          asFound: '0 indications',
          afterRebuild: '0 indications',
          status: '✓ Pass · 8/8 + 2/2',
          afterStyle: 'good',
        },
        {
          component: 'Hardness (every wetted part)',
          spec: 'NACE ≤ 22 HRC',
          asFound: '18 — 21 HRC range',
          afterRebuild: '17 — 21 HRC range',
          status: '✓ NACE compliant',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test, 1.5× WP',
          spec: '15,000 psi · 30 min hold',
          asFound: '—',
          afterRebuild: '30 min, 0 psi drop',
          status: '✓ Pass · 8/8 + 2/2',
          afterStyle: 'good',
        },
        {
          component: 'Function test · gate valves',
          spec: 'Full open/close cycle',
          asFound: '—',
          afterRebuild: '8 of 8 cycled',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Function test · chokes',
          spec: 'Open/close, position OK',
          asFound: '—',
          afterRebuild: '2 of 2 cycled',
          status: '✓ Pass',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Five years on the stamp, NACE compliance certified, back to Lower Zakum.'),
    para(
      'On day 28, the ADNOC vendor rep walked the FAT pack on the bench and signed every page live. The manifold left Jebel Ali on day 29, low-loaded back to the Lower Zakum deployment yard, and was scheduled for redeployment on the next workover slot. The recert stamp on the spool reads valid through <strong>February 2031</strong>. NACE MR0175 / ISO 15156 compliance is certified on every wetted metallic part and every elastomer in the assembly. The 58-page FAT pack is on file at the operator\'s document control.',
    ),
    resultBox(
      'Result · summary',
      'Eight rebuilt gate valves, two re-trimmed chokes, every body NDT-cleared and 15K-tested, and a 5-year API 16C recert stamp valid through 2031.',
      'Delivered on schedule at 28 days, no overtime, no rework. ADNOC vendor witness signed the FAT pack on the bench on day 28. NACE MR0175 / ISO 15156 compliance certified end-to-end — every seat, every packing, every stud — backed by EN 10204 3.1 / 3.2 mill certs.',
      [
        { value: '28', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
        { value: '10 / 10', label: '15K shell test pass', style: 'good' },
        { value: '8 / 8 + 2 / 2', label: 'Function test pass', style: 'good' },
        { value: '60', valueSmall: ' mo', label: 'API 16C recert validity' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the bench.'),
    teamList(
      'Six engineers logged time against this work order in the Jebel Ali bay. If you call the workshop and ask about case 06, any of them can pull the file in under a minute.',
      [
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope: 'Inbound receipt, bay scheduling, FAT pack release, ADNOC vendor liaison',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Lead Valve Technician',
          location: 'Jebel Ali',
          scope: 'Strip-down on all 8 gate valves, trim fit on every seat, stem repack, choke trim swap, function test',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'QA / NDT Inspector',
          location: 'Jebel Ali',
          scope: 'MPI + UT + hardness on every metallic part, hydrostatic test witness, NACE compliance audit',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'Machinist',
          location: 'Jebel Ali',
          scope: 'Re-machined 2× stem chambers to 0.15 mm undercut, B7M stud torque, ring-gasket fitment',
        },
        {
          name: 'Fatima Al Mansoori',
          role: 'Engineering Authority',
          location: 'Jebel Ali',
          scope: 'API 16C recert sign-off, mill cert reconciliation, NACE MR0175 / ISO 15156 cert issue, recert stamp',
        },
        {
          name: 'Khalid Al Marzouqi',
          role: 'Field Lead',
          location: 'Jebel Ali',
          scope: 'On-bench client liaison, FAT walk-through with ADNOC vendor rep, redeployment coordination',
        },
      ],
      'Case file · INTAKE-2026-02-038 · WO-2026-1018 · Published 2026-03-04 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'Five-year recerts are a paperwork test masquerading as an engineering test. If your trim is NACE end-to-end and your bodies pass NDT, the hydrotest is the easy part. If they\'re not, no amount of clever assembly will save you.',
  pullQuoteAuthor: 'Fatima Al Mansoori',
  pullQuoteRole: 'Engineering Authority',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset', value: 'C&K manifold' },
    { label: 'Standard', value: 'API 16C' },
    { label: 'Working pressure', value: '10,000 psi' },
    { label: 'Bore', value: '3-1/16"' },
    { label: 'Gate valves', value: '8' },
    { label: 'Chokes', value: '2 (1 hyd + 1 man)' },
    { label: 'Trim', value: 'Inconel-625 clad' },
    { label: 'Bolting', value: 'A193 B7M / A194 2HM' },
    { label: 'Elastomers', value: 'HNBR + FKM' },
    { label: 'Compliance', value: 'NACE MR0175' },
  ],
  galleryTotalCount: 42,
  downloads: [
    { label: 'NDT records (PDF)', url: '#', size: '24 pp', format: 'PDF' },
    { label: 'Hardness log (XLSX)', url: '#', size: '40 rows', format: 'XLSX' },
    { label: 'Mill + NACE certs (ZIP)', url: '#', size: '18 MB', format: 'ZIP' },
    { label: 'API 16C FAT pack (PDF)', url: '#', size: '58 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-02-038 · WO-2026-1018 · Published 2026-03-04 · Updated 2026-05-09',

  cardOneLiner:
    'A 3-1/16" 10K choke & kill manifold from ADNOC Lower Zakum, recerted to API 16C with full NACE trim swap on 8 gate valves and 2 chokes. 28 days on the bench, 15K shell test on every body, fresh 5-year stamp valid through 2031.',
  cardOutcomePills: [
    { label: '5-YR RECERT STAMPED', style: 'good' },
    { label: '15K HYDROTEST · 10/10', style: 'good' },
    { label: 'NACE MR0175 CERT', style: 'accent' },
  ],
  cardDurationLabel: '28 D ON BENCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'CHOKE & KILL',

  durationDays: 28,

  seoTitle:
    'Choke & Kill Manifold API 16C 5-Year Recert · 3-1/16" 10K · ADNOC Lower Zakum · Indus Hydraulics Jebel Ali',
  seoDescription:
    'Case study: 3-1/16" 10,000 psi sour-service choke & kill manifold from ADNOC Offshore (Lower Zakum), recerted to API 16C in 28 days at Indus Hydraulics, Jebel Ali. Full NACE MR0175 trim swap on 8 gate valves + 2 chokes, Inconel-625-clad seats, B7M bolting, 15,000 psi hydrostatic shell test, fresh 5-year recert stamp valid through 2031.',
  focusKeyword: 'API 16C choke and kill manifold 5-year recertification UAE',
}

export default CASE
