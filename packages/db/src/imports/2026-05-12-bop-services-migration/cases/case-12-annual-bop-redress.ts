/**
 * Case 12 — Annual BOP Redress · 12-Month Elastomer Service
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's recurring 12-month elastomer redress service for BOP fleets running
 * to Saudi Aramco / ADNOC / KOC / PDO / QatarEnergy annual schedules. Strip
 * the bonnets, renew every wearing soft good in HNBR / AFLAS sour-service
 * grade, dimensional check the ram blocks, function and pressure test, issue
 * a 12-month redress certificate. Five to ten days at-rig, or two to three
 * weeks workshop ex-Jebel Ali with a replacement BOP available on rental.
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
  slug: 'annual-bop-redress-12-month-elastomer-service',
  caseNumber: '12',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Annual Redress · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali · GCC-wide deployment',
  caseDateLabel: 'ROLLING SCHEDULE · 12-MONTH CYCLE',
  title: 'The 12-month BOP redress — Aramco-spec elastomer renewal, on-rig in a week or workshop in three.',
  titleAccent: 'Aramco-spec elastomer renewal',
  deck: 'Saudi Aramco specifies 12-month elastomer replacement on every BOP in the fleet. ADNOC, KOC, PDO and QatarEnergy follow the equivalent annual cadence. We run that redress on rotation across the GCC — strip the bonnets, renew every soft good in HNBR / AFLAS sour-service grade, dimensional-check the ram blocks, function and pressure test, sign the 12-month certificate. Five to ten days at-rig or two to three weeks at our Jebel Ali workshop.',

  heroImageCaption: 'FIG. 01 · Annular bonnet open, packing element out, head and piston seals on the bench mid-redress',
  heroImageCredit: 'PHOTO · K. AL MARZOUQI · 2026-04-22',

  metaCells: [
    { label: 'Cycle', value: '12', valueSmall: ' · months', style: 'neutral' },
    { label: 'On-rig TAT', value: '5 — 10', valueSmall: ' · days', style: 'neutral' },
    { label: 'Workshop TAT', value: '2 — 3', valueSmall: ' · weeks', style: 'neutral' },
    { label: 'Standard', value: 'API 16A', valueSmall: ' · annual redress', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A 12-month clock that ticks on every BOP in the fleet.'),
    lead(
      'Saudi Aramco runs a 12-month elastomer-replacement spec on every BOP in its drilling fleet. The instruction is plain — every wearing soft good comes out at the annual mark, regardless of run hours, regardless of whether it looks fine. <strong>ADNOC Drilling, KOC, PDO and QatarEnergy</strong> run equivalent annual cycles drawn from the same engineering logic. The clock starts the day the BOP is recertified and it doesn\'t stop for a busy drilling program.',
    ),
    para(
      'The class of operator who calls us is the one who knows the clock matters and doesn\'t want a surprise on a wellsite audit. The standard call goes: "We have a Cameron / Hydril / Shaffer stack at 11 months and 2 weeks on the redress sticker — when can your crew be on the rig?" The annual redress sits between the 5-year API 16A major recert and the per-well function check. It is not optional, it is not paper-only, and it is not a "while we\'re on the rig anyway" job. It runs to a procedure, with parts cards, with a witness, and it ends with a certificate that an operator HSE auditor can read without flinching.',
    ),
    problemSolution(
      {
        label: 'What operators come to us with',
        title: '"Annual redress due — when can you be on the rig?"',
        body: 'Drilling contractor or NOC operator running an Aramco / ADNOC / KOC / PDO / QatarEnergy annual schedule. BOP within four weeks of the 12-month redress sticker. Operator wants the redress booked, parts staged, crew mobilised — either at the rig in the next stand-down window, or at our workshop with a rental stack covering the gap.',
      },
      {
        label: 'What we usually find when we open the bonnets',
        title: 'Most soft goods serviceable. Some are not. The standard says all of them.',
        body: 'Eight times in ten the elastomers we pull out look serviceable to the naked eye. One or two cavities will have a top seal with visible compression set, or a piston seal with a witness mark from a missed alignment. The standard doesn\'t care which — at 12 months, every soft good comes out. That is the discipline of a fleet maintenance spec.',
      },
    ),
    para(
      'There is a difference between <strong>"12-month redress"</strong> and <strong>"we replaced what was leaking."</strong> The first is a maintenance posture; the second is a repair. Operators who run annual schedules understand that the seal you don\'t replace this year is the well-control event you don\'t see coming next year. We work to the maintenance posture. Every redress, every cavity, every soft good listed on the parts card.',
    ),

    sectionHead('/02', 'solution', 'Per-cavity scope, OEM kits, two delivery options.'),
    para(
      'The scope per cavity is non-negotiable. <strong>Top seal, front packer, side packers, bonnet primary seal, bonnet secondary backup</strong> — out and replaced on every cavity. On the annular: <strong>packing element, head seal, piston seal</strong> — out and replaced. Every elastomer comes from the OEM kit in <strong>HNBR or AFLAS sour-service grade</strong>, NACE MR0175 / ISO 15156 traceable, with EN 10204 3.1 minimum certification on the sealing components and 3.2 on the metallic backups. Bonnet bolting goes back with calibrated torque, line by line, recorded against the OEM service manual.',
    ),
    para(
      'Ram blocks come out for dimensional check whether or not we plan to re-machine. Sealing surfaces are measured against the Cameron / Hydril / Shaffer datum. Anything outside tolerance is re-machined to factory geometry; anything beyond rework is replaced from OEM stock. Critical metal surfaces are hardness re-checked against <strong>≤ 22 HRC per NACE MR0175</strong> for sour service — a hardness drift through a thermal cycle is rare, but the redress is the moment it gets caught. The reassembly runs in OEM sequence with torque records, and the BOP rolls onto the test bench for function, low-pressure, and high-pressure checks before the certificate is signed.',
    ),
    figure(
      'Day 4 of an at-rig redress in Abu Dhabi. Bonnets back, ram block out, seal land scope on the bench, OEM kit staged in trays. The discipline of the procedure is in the layout — every part has a spot, every spot has a card.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Annular bonnet open at-rig with new HNBR packing element on the bench\\n1200×675"',
      },
    ),
    pullQuote(
      'There is a real difference between a 12-month redress and a campaign that replaces what was leaking. The first is fleet maintenance. The second is repair. We do the first one — every cavity, every seal, whether it looks like it needed it or not. That is the spec.',
      '— Omar Al Maktoum · Lead BOP Technician · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, two delivery modes, one certificate at the end.'),
    para(
      'A 12-month redress runs through the same four phases whether the BOP stays on the rig or comes to Jebel Ali. The shape of the work is identical; the only thing that changes is the bench under it.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Schedule, parts, mobilisation',
        body: 'Cert sticker date and BOP serial logged. OEM kits staged from Jebel Ali stock for the model and cavity count. Crew briefed on rig procedures or workshop bay assigned. JSA and lift plan issued.',
        duration: 'Days −10 — 0',
      },
      {
        number: 'PHASE 02',
        title: 'Bonnet break-out & strip',
        body: 'Bonnets opened in OEM sequence. Ram blocks out, annular packing element out. Old elastomers bagged and tagged to cavity. Seal lands cleaned, dimensioned, photographed against datum.',
        duration: 'Days 1 — 3',
      },
      {
        number: 'PHASE 03',
        title: 'Renewal & reassembly',
        body: 'New HNBR / AFLAS soft goods fitted per cavity. Ram blocks re-machined if outside tolerance, replaced if beyond rework. Bonnets reassembled in OEM sequence with calibrated torque on every fastener.',
        duration: 'Days 4 — 6',
      },
      {
        number: 'PHASE 04',
        title: 'Test, certify, release',
        body: 'Function test on every cavity. Low-pressure leak test 250 — 350 psi. High-pressure operability at rated WP, 10-min hold per API STD 53. Annual redress certificate issued, valid 12 months.',
        duration: 'Days 7 — 10',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard procedure that runs on every redress.'),
    para(
      'Below is the abridged SOP that governs an annual elastomer redress in our shop or on a customer\'s rig. The full document runs to 38 lines and an annex per BOP make. This is the subset that gets ticked, dated, and signed on every work order.',
    ),
    sopBlock(
      'SOP-OG-021 · BOP 12-MONTH ELASTOMER REDRESS · REV 04 · NACE',
      '18 / 18 COMPLETE',
      [
        {
          name: 'Phase 01 · Schedule & mobilisation',
          rows: [
            { task: 'Redress sticker & serial verification', detail: 'Cert sticker date confirmed against operator BOP register; serial cross-checked to OEM data book', who: 'Y. AL HASHIMI', tool: 'Operator file' },
            { task: 'OEM kit pull from stock', detail: 'HNBR / AFLAS kit pulled from Jebel Ali stock per BOP make, model, and cavity count', who: 'Y. AL HASHIMI', tool: 'Stock card' },
            { task: 'JSA & lift plan issued', detail: 'Job safety analysis and lift plan prepared per rig HSE requirements; toolbox talk scheduled', who: 'H. AL AWADI', tool: 'JSA form' },
            { task: 'Crew brief & mobilisation', detail: 'Field crew briefed on procedure, rig access, customer-specific permit requirements', who: 'K. AL MARZOUQI', tool: 'Crew brief' },
          ],
        },
        {
          name: 'Phase 02 · Bonnet break-out & strip',
          rows: [
            { task: 'Bonnet break-out per OEM sequence', detail: 'Hydraulic torque tool, OEM-specified break sequence; bolting tagged by position for reuse decision', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'Ram block extraction & tag', detail: 'Each ram block tagged to cavity; bagged to prevent cross-contamination of seal grooves', who: 'O. AL MAKTOUM', tool: 'Bench' },
            { task: 'Old elastomer log', detail: 'Top seal, packers, bonnet primary, secondary backup logged per cavity; condition photographed', who: 'A. AL SUWAIDI', tool: 'Photo log' },
            { task: 'Seal land dimensional check', detail: 'Hub face flatness, ram seal land geometry vs OEM datum; recorded line by line', who: 'A. AL SUWAIDI', tool: 'CMM / mic' },
          ],
        },
        {
          name: 'Phase 03 · Renewal & reassembly',
          rows: [
            { task: 'New HNBR / AFLAS fit per cavity', detail: 'Top seal, front packer, side packers, bonnet primary, secondary backup — full set per cavity', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Annular packing element renewal', detail: 'Packing element, head seal, piston seal — full annular soft-goods set replaced', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Ram block re-machining (if required)', detail: 'Seal lands re-machined to OEM datum where dimensional tolerance exceeded; surface Ra ≤ 0.4 µm', who: 'H. AL AWADI', tool: 'Mill / surface gauge' },
            { task: 'Hardness re-check · sour service', detail: 'Critical metal surfaces verified ≤ 22 HRC per NACE MR0175; logged with location', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'Reassemble per OEM service manual', detail: 'Bonnets fitted, locking screws set, ram blocks indexed; every torque recorded', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
          ],
        },
        {
          name: 'Phase 04 · Test, certify, release',
          rows: [
            { task: 'Function test · all cavities', detail: 'Open / close on each cavity; closure timing logged per API STD 53 method', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Low-pressure leak test', detail: 'Hold at 250 — 350 psi per API STD 53; leak rate measured below threshold on every cavity', who: 'A. AL SUWAIDI', tool: 'LP rig' },
            { task: 'High-pressure operability test', detail: 'Hold at rated working pressure for 10 minutes per API STD 53; zero pressure drop required', who: 'A. AL SUWAIDI', tool: 'Hydrotest rig' },
            { task: 'Annual redress certificate', detail: 'Certificate issued naming serial, kit batch, tests run; valid 12 months from issue date', who: 'Y. AL HASHIMI', tool: 'Cert' },
            { task: 'Operator handover & sign-off', detail: 'Customer engineer counter-signs test record and certificate; redress sticker updated on stack', who: 'K. AL MARZOUQI', tool: 'On-site' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find on a 12-month redress.'),
    para(
      'Below is the typical findings sheet from an annual redress on a Cameron / Hydril / Shaffer stack in GCC sour service. Roughly half the cavities show a finding that would not by itself justify a teardown — but every one of them is closed out on the redress, every time, because that is the spec.',
    ),
    specTable(
      'TYPICAL FINDINGS · 12-MONTH BOP REDRESS · SOUR SERVICE · GCC FLEET',
      [
        {
          component: 'Top seal · per cavity',
          spec: 'HNBR sour-service · OEM',
          asFound: 'Compression set, light',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed all cavities',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Front packer · per cavity',
          spec: 'HNBR sour-service · OEM',
          asFound: 'Original, end-of-cycle',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed all cavities',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Side packers · per cavity',
          spec: 'HNBR sour-service · OEM',
          asFound: 'Witness marks, no extrusion',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed all cavities',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet primary seal',
          spec: 'HNBR / AFLAS · sour',
          asFound: 'Serviceable visually',
          afterRebuild: 'New element · OEM',
          status: '↻ Renewed per spec',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet secondary backup',
          spec: 'AFLAS sour-service',
          asFound: 'Serviceable visually',
          afterRebuild: 'New element · OEM',
          status: '↻ Renewed per spec',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Annular packing element',
          spec: 'OEM make-specific',
          asFound: 'Light taper deformation',
          afterRebuild: 'New element · OEM',
          status: '↻ Renewed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Annular head seal',
          spec: 'HNBR sour-service',
          asFound: 'Serviceable',
          afterRebuild: 'New seal · OEM',
          status: '↻ Renewed per spec',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Annular piston seal',
          spec: 'HNBR sour-service',
          asFound: 'Light witness mark',
          afterRebuild: 'New seal · OEM',
          status: '↻ Renewed per spec',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Ram block sealing surface',
          spec: 'OEM datum · ± 0.05 mm',
          asFound: 'In tolerance, no rework',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Critical surface hardness',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '19.6 — 21.4 HRC',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Low-pressure leak test',
          spec: '250 — 350 psi · API STD 53',
          asFound: '—',
          afterRebuild: 'Hold pass · all cavities',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'High-pressure operability',
          spec: 'Rated WP · 10 min · STD 53',
          asFound: '—',
          afterRebuild: '0 psi drop · 10 min',
          status: '✓ Pass',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'A signed 12-month certificate, ready for the next audit.'),
    para(
      'A typical at-rig redress closes out in five to ten days depending on cavity count and rig stand-down windows. A workshop redress out of Jebel Ali runs two to three weeks, and we keep a replacement BOP available on rental for operators who can\'t carry the gap on their drilling programme — see <strong>case 14 / SVC-RENTAL</strong>. Either way the deliverable is the same: every wearing soft good renewed per spec, the stack tested at low and high pressure, and a 12-month redress certificate signed and on the operator\'s file. The next clock starts the moment the certificate is issued.',
    ),
    resultBox(
      'Result · expected from a typical engagement',
      'Annual elastomer redress closed out per Aramco / ADNOC / KOC / PDO / QatarEnergy specification, certificate valid 12 months, BOP back to drilling.',
      'Every wearing soft good renewed in HNBR / AFLAS sour-service grade per cavity. Ram blocks dimensional-checked and re-machined where required. Hardness re-verified ≤ 22 HRC per NACE MR0175. Function test, low-pressure leak test 250 — 350 psi, high-pressure operability test at rated WP per API STD 53, customer-witnessed sign-off, 12-month redress certificate.',
      [
        { value: '5 — 10', valueSmall: ' days', label: 'On-rig TAT', style: 'accent' },
        { value: '2 — 3', valueSmall: ' weeks', label: 'Workshop TAT', style: 'good' },
        { value: '12', valueSmall: ' mo', label: 'Cert validity', style: 'good' },
        { value: 'API STD 53', label: 'Pressure test basis' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew that runs an annual redress.'),
    teamList(
      'A 12-month BOP redress is run by a five-person crew out of Jebel Ali, with the same role profile whether the work is on a customer rig or on our workshop bench. Anyone of them can pick up an open redress file and tell you where it is in the procedure.',
      [
        { name: 'Yusuf Al Hashimi', role: 'Workshop Manager', location: 'Jebel Ali', scope: 'Owns the work-order file end to end. Schedules the redress against operator certificate dates, pulls OEM kits from stock, signs the issued certificate.' },
        { name: 'Khalid Al Marzouqi', role: 'Field Redress Lead', location: 'Jebel Ali', scope: 'Operator interface from booking through handover. On the rig with the crew for at-rig redress; takes the customer engineer through the test record and signs the redress sticker.' },
        { name: 'Omar Al Maktoum', role: 'Lead BOP Technician', location: 'Jebel Ali', scope: 'Bonnet break-out, ram extraction, elastomer fit per cavity, reassembly to OEM torque chart, function test. Owns the procedure on the bench or the rig floor.' },
        { name: 'Aisha Al Suwaidi', role: 'QA Lead', location: 'Jebel Ali', scope: 'Dimensional checks against OEM datum, hardness re-verification, low-pressure and high-pressure test witness, certificate compilation. Signs every test record.' },
        { name: 'Hassan Al Awadi', role: 'Crew Supervisor', location: 'Jebel Ali', scope: 'JSA and lift plan, rig HSE compliance, ram-block re-machining when required, crew safety on the bench or in the rig stand-down window.' },
      ],
      'Case file · INTAKE-2026-04-088 · WO-2026-1112 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'There is a real difference between a 12-month redress and a campaign that replaces what was leaking. The first is fleet maintenance. The second is repair. We do the first one — every cavity, every seal, whether it looked like it needed it or not. That is the spec.',
  pullQuoteAuthor: 'Omar Al Maktoum',
  pullQuoteRole: 'Lead BOP Technician',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Service', value: '12-month BOP elastomer redress' },
    { label: 'Cycle', value: '12 months · Aramco / ADNOC / KOC / PDO / QatarEnergy spec' },
    { label: 'Standard', value: 'API 16A · API STD 53 · NACE MR0175' },
    { label: 'Per cavity', value: 'Top seal · front packer · sides · bonnet seals' },
    { label: 'Annular scope', value: 'Packing element · head seal · piston seal' },
    { label: 'Elastomers', value: 'HNBR / AFLAS · OEM kits · sour service' },
    { label: 'Pressure tests', value: 'LP 250 — 350 psi · HP at rated WP · 10 min hold' },
    { label: 'On-rig TAT', value: '5 — 10 days' },
    { label: 'Workshop TAT', value: '2 — 3 weeks ex-Jebel Ali' },
    { label: 'Certificate', value: '12-month annual redress' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Annual redress scope (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'OEM kit reference matrix (PDF)', url: '#', size: '12 pp', format: 'PDF' },
    { label: 'Sample 12-month certificate (PDF)', url: '#', size: '2 pp', format: 'PDF' },
    { label: 'At-rig vs workshop comparison (PDF)', url: '#', size: '4 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-088 · WO-2026-1112 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Saudi Aramco specifies 12-month elastomer replacement on every BOP in the fleet. ADNOC, KOC, PDO and QatarEnergy run the same annual cadence. We deliver that redress on rotation across the GCC — five to ten days at-rig, or two to three weeks at our Jebel Ali workshop with a rental BOP available.',
  cardOutcomePills: [
    { label: 'Per-cavity HNBR / AFLAS soft goods', style: 'good' },
    { label: 'API STD 53 pressure tests', style: 'good' },
    { label: '12-month redress certificate', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: '12-MONTH CYCLE · 5-10 D',
  cardTagStyle: 'oil',
  cardTagLabel: 'ANNUAL REDRESS',

  durationDays: 7,

  seoTitle: 'Annual BOP Redress · 12-Month Elastomer Service · Aramco / ADNOC Spec · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Service offering: 12-month elastomer redress for BOP fleets running Saudi Aramco, ADNOC, KOC, PDO or QatarEnergy annual schedules. Per-cavity HNBR / AFLAS sour-service soft goods, ram-block dimensional check and re-machining, hardness re-verification per NACE MR0175, function test, low-pressure 250-350 psi and high-pressure operability test per API STD 53, 12-month redress certificate. Five to ten days at-rig or two to three weeks workshop ex-Jebel Ali with replacement BOP rental available.',
  focusKeyword: 'annual BOP redress 12-month elastomer service jebel ali aramco',
}

export default CASE
