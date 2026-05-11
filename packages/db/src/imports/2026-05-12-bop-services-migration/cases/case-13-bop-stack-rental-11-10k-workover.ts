/**
 * Case 13 — 11" 10K workover BOP stack rental · Cameron-U + Hydril GK · sour service
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's 11" 10,000 psi workover BOP stack rental — the #1 rental class in the GCC.
 * Complete package: Cameron Type-U double-ram + Hydril GK 11" 10K annular + 3-1/16" 10K
 * choke & kill manifold + Koomey Type 80 control unit. Sour-service trim throughout,
 * pre-mob hydrotested per API STD 53 with a cert ≤14 days old, 5-7 day mobilisation
 * Jebel Ali → rig site, 30-365 day hire windows.
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
  slug: 'bop-stack-rental-11-10k-workover-sour-service',
  caseNumber: '13',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · Stack Rental · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali · GCC mobilisation',
  caseDateLabel: 'ROLLING AVAILABILITY · 2026',
  title: 'The 11" 10K workover BOP stack we keep on a 7-day mob — and a fresh API STD 53 cert in the box.',
  titleAccent: 'a fresh API STD 53 cert in the box',
  deck: 'The 11" 10,000 psi workover BOP stack is the most-rented pressure-control package in the GCC, and the one most often shipped to a rig with a test certificate that has been quietly ageing in a folder. Indus runs the rental fleet differently. Every stack leaves Jebel Ali under a fresh API STD 53 hydrotest dated within fourteen days of mobilisation, with the matched choke & kill manifold, the Koomey control unit, and the spares pool already on the manifest.',

  heroImageCaption: 'FIG. 01 · 11" 10K Cameron Type-U double-ram BOP + Hydril GK annular on the test bench, day before mob to a workover rig.',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-04-22',

  metaCells: [
    { label: 'Asset', value: '11"', valueSmall: ' · Cameron-U + Hydril GK', style: 'neutral' },
    { label: 'WP', value: '10,000', valueSmall: ' · psi', style: 'neutral' },
    { label: 'Mob window', value: '5 — 7', valueSmall: ' · days from PO', style: 'neutral' },
    { label: 'Hire range', value: '30 — 365', valueSmall: ' · days', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A workover rig with a wellhead waiting and a BOP that isn\'t there yet.'),
    lead(
      'A workover spread is, by the standards of the upstream business, a small machine. A coiled-tubing or snubbing or pulling unit, a wireline pickup, a couple of pumps, a few hundred feet of pipe — and at the top of the well, a BOP stack rated for the same pressure as the production casing string under it. <strong>The single most common rental call we take in Jebel Ali is for the 11" 10,000 psi workover stack</strong>, and the single most common reason for the call is that an operator opened a planned-recert window, took the BOP off the rig, and discovered the recert TAT no longer fits the campaign date.',
    ),
    para(
      'It is also the single most common asset where a renter, in a hurry, will accept a stack with a hydrostatic test certificate that is six months old, or twelve months old, or older. API STD 53 does not strictly require that the pre-mobilisation hydrotest be repeated on every rental — but it does require that the test be valid, traceable, and that the unit be in the condition the certificate describes. <strong>"Sitting in the yard since the last hire"</strong> is not a condition that any auditor recognises. The rental that arrives with a freshly-dated cert is the rental that doesn\'t hold the rig up at the wellhead.',
    ),
    problemSolution(
      {
        label: 'The class of call we take',
        title: '"Need an 11" 10K workover stack on the rig in two weeks."',
        body: 'Workover or well-intervention contractors with a campaign date that no longer fits the recert TAT on their own BOP. Operators in the 5-year API 16A window that didn\'t plan the recert backwards from a rig date. Pre-completion rig-ups where the operator has not yet taken delivery of their own stack and needs to bridge a single well or a campaign of three.',
      },
      {
        label: 'The condition the asset has to ship in',
        title: 'Fresh API STD 53 hydrotest, matched manifold, Koomey under cover',
        body: 'A complete pressure-control package — not just the BOP. Hydrostatic shell test inside fourteen days of mobilisation, function test on the bench, ram-block inventory and serial-number register reconciled, choke & kill manifold matched and pressure-tested with the stack, Koomey Type 80 control unit charged and certified, spare-parts pool on the manifest.',
      },
    ),
    para(
      'Three buyers come to Indus for this rental and the brief is broadly the same from each of them — workover contractors, operators inside their 5-year recert window, and pre-completion rig-ups bridging a delivery gap on their own asset. The work in our yard is not the BOP — the work is the discipline of pre-mobilisation testing, the matched-package mobilisation, and the de-mob refresh cycle that makes the next rental ship out under the same conditions as this one.',
    ),

    sectionHead('/02', 'solution', 'A complete 11" 10K stack, freshly tested, on a low-loader inside seven days.'),
    para(
      'The rental package we mobilise from Jebel Ali is a complete pressure-control deck, not a single asset on a pallet. The stack is built on a <strong>Cameron Type-U style 11" 10,000 psi double-ram BOP</strong> — typically configured with one upper pipe ram and one lower blind-shear ram — sitting under a <strong>Hydril GK 11" 10K annular preventer</strong>. Sour-service trim runs end-to-end: <strong>HNBR elastomers</strong> on every cavity, <strong>ASTM A193 B7M</strong> studs and 2HM nuts on the bonnet bolting, <strong>Inconel-625 cladding</strong> on the metal-to-metal sealing lands, and every forging individually verified <strong>≤ 22 HRC per NACE MR0175 / ISO 15156</strong>. Bore is 11" nominal, working pressure 10,000 psi, hydrotest at <strong>15,000 psi</strong> per API 16A.',
    ),
    para(
      'The choke and kill side of the package is matched. A <strong>3-1/16" 10K choke & kill manifold</strong> per <strong>API 16C</strong>, sour-service rated, with adjustable choke and back-pressure isolation. The control unit is a <strong>Koomey Type 80 hydraulic accumulator unit</strong> per <strong>API 16D</strong>, pre-charged to <strong>1,000 psi N₂</strong> per cavity, sized to close the largest cavity inside the API STD 53 timing requirement on a single accumulator failure. Every rental ships with a spares pool — bonnet seals, ram packers, BX-160 ring gaskets, B7M nipple-up kits — staged in Jebel Ali on standby for the duration of the hire.',
    ),
    figure(
      'Day -2 of a typical mobilisation. Cameron-U body and Hydril annular paired up under the gantry, choke manifold in the foreground, Koomey unit on the right. The hydrotest cert is signed and dated at the test bench, twelve days before this stack ships.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"11\\" 10K Cameron-U + Hydril GK + 3-1/16\\" choke manifold + Koomey Type 80 staged for mobilisation\\n1200×675"',
      },
    ),
    pullQuote(
      'There is the rental BOP that is freshly tested. And there is the one that has been sitting in the yard. They look the same on a low-loader. They are not the same when you put a wellhead under them. Every stack we ship has a hydrotest cert dated inside fourteen days. That discipline is the rental.',
      '— Omar Al Maktoum · Pre-Mob QA / Test Engineer · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Pre-mob, mobilisation, on-rig, de-mob — the four phases of every hire.'),
    para(
      'Every 11" 10K stack rental out of Jebel Ali runs through the same four phases. The phase boundaries are where the documentation is signed — and where the next phase will not start until the previous one is closed.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Pre-mobilisation test',
        body: 'Stack pulled from the rental fleet. Visual, function test, full hydrostatic shell test at 15,000 psi held 30 min per API STD 53. Cert dated inside 14 days of mob. Spares pool reconciled.',
        duration: 'Days -7 — -1',
      },
      {
        number: 'PHASE 02',
        title: 'Mobilisation Jebel Ali → rig',
        body: 'Truck and trailer logistics out of JAFZA. Stack on low-loader, manifold on flat-rack, Koomey on its skid, spares container alongside. Transit log per package, GPS tracked.',
        duration: 'Days 0 — 1',
      },
      {
        number: 'PHASE 03',
        title: 'On-rig hand-over & function',
        body: 'Stack landed on the wellhead by the rig crew, Indus engineer present. Function test on every cavity, ram-block inventory reconciled, serial-number register signed, hire-clock starts.',
        duration: 'Days 1 — 2',
      },
      {
        number: 'PHASE 04',
        title: 'De-mob, strip, refresh',
        body: 'Hire window closes. Stack returned to Jebel Ali. Strip, condition report, elastomer refresh cycle, NDT on metallic seal lands. Stack re-enters the fleet ready for the next pre-mob.',
        duration: 'Per hire window',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard procedure on every rental — abridged.'),
    para(
      'Below is the abridged standard procedure that runs on every 11" 10K workover BOP stack rental out of Jebel Ali. The full document runs longer; this is the subset that is checked off, dated and signed against the rental work order before the stack leaves the gate.',
    ),
    sopBlock(
      'SOP-OG-021 · 11" 10K WORKOVER BOP STACK RENTAL · REV 04 · NACE',
      '18 / 18 STANDARD',
      [
        {
          name: 'Phase 01 · Pre-mobilisation',
          rows: [
            { task: 'Stack pulled from rental fleet', detail: 'Cameron-U body, Hydril GK annular, choke manifold, Koomey unit reconciled against rental WO', who: 'Y. AL HASHIMI', tool: 'Fleet log' },
            { task: 'Visual + dimensional pre-check', detail: 'Bore, hub-face condition, bonnet flange flatness, bolting torque check on cold stack', who: 'A. AL SUWAIDI', tool: 'CMM + bore mic' },
            { task: 'Function test on bench', detail: 'Open/close every cavity at rated pressure; closure-time logged on each cavity vs API STD 53', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Hydrostatic shell test · 15,000 psi · 30 min', detail: 'Pre-mob hydrotest per API STD 53 / API 16A; cert dated inside 14 days of ship date', who: 'O. AL MAKTOUM', tool: 'Hydrotest rig' },
            { task: 'Manifold pressure test · 15,000 psi', detail: '3-1/16" 10K choke & kill manifold tested under same cert; per API 16C', who: 'O. AL MAKTOUM', tool: 'Hydrotest rig' },
            { task: 'Koomey accumulator pre-charge & cert', detail: '1,000 psi N₂ per cavity; full closure on single-accumulator-failure scenario timed and logged', who: 'O. AL MAKTOUM', tool: 'N₂ rig' },
          ],
        },
        {
          name: 'Phase 02 · Mobilisation',
          rows: [
            { task: 'Spares pool staged on manifest', detail: 'Bonnet seals, ram packers, BX-160 ring gaskets, B7M nipple-up kits — physically staged, photo log', who: 'A. AL SUWAIDI', tool: 'Container 04' },
            { task: 'Low-loader load + lash', detail: 'Stack lifted, lashed and tarped; rigging plan signed by load-out lead before truck leaves yard', who: 'K. AL MARZOUQI', tool: 'Yard crane' },
            { task: 'Transit log + GPS tracking', detail: 'Mob from Jebel Ali to rig site; GPS-tracked transit, hand-over photos at gate', who: 'K. AL MARZOUQI', tool: 'Logistics' },
          ],
        },
        {
          name: 'Phase 03 · On-rig hand-over',
          rows: [
            { task: 'Stack landed on wellhead', detail: 'Rig crew lands stack; Indus engineer attends nipple-up; B7M studs to API 6A torque chart', who: 'H. AL AWADI', tool: 'On-rig' },
            { task: 'Function test on every cavity', detail: 'Open/close, closure-time logged; every cavity inside API STD 53 limits before hire-clock starts', who: 'H. AL AWADI', tool: 'Stopwatch + logger' },
            { task: 'Ram-block inventory + serial register', detail: 'Every ram block, every elastomer, every spare physically reconciled; serial-number register signed', who: 'A. AL SUWAIDI', tool: 'WO file' },
            { task: 'Hand-over package + hire-clock start', detail: 'Hydrotest cert, function records, accumulator cert, spares manifest handed to operator. Hire begins.', who: 'K. AL MARZOUQI', tool: 'PDF + paper' },
          ],
        },
        {
          name: 'Phase 04 · De-mobilisation & refresh',
          rows: [
            { task: 'De-mob load-out from rig', detail: 'Stack pulled at end of hire; condition photos at the wellhead before lift; transit back to Jebel Ali', who: 'K. AL MARZOUQI', tool: 'Logistics' },
            { task: 'Strip + condition report', detail: 'Bonnets open, ram blocks out, elastomer condition graded, hub-face DPI; report inside 5 days', who: 'O. AL MAKTOUM', tool: 'Strip bench' },
            { task: 'Elastomer refresh cycle · all cavities', detail: 'Every HNBR elastomer renewed before re-entry to fleet; no "looked fine" pass-throughs', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'NDT on metallic seal lands', detail: 'DPI on hub faces and ram block seal lands; MPI on any forging carrying load during the hire', who: 'A. AL SUWAIDI', tool: 'DPI / MPI bench' },
            { task: 'Re-entry to fleet · WO closed', detail: 'Stack tagged ready-for-next-mob; condition report filed; rental WO closed in CMMS', who: 'A. AL SUWAIDI', tool: 'CMMS' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find on a returning stack.'),
    para(
      'The findings table below is what a typical 11" 10K workover stack looks like when it comes off a 60-90 day hire and rolls back into Bay 2 in Jebel Ali. The pattern is consistent across hires; the spread is on which elastomers have done the most work and on whether the hub faces have seen any wellhead misalignment.',
    ),
    specTable(
      'TYPICAL FINDINGS · 11" 10K CAMERON-U + HYDRIL GK · POST-HIRE · SOUR SERVICE',
      [
        {
          component: 'Bonnet seals · HNBR',
          spec: 'No extrusion / no swelling',
          asFound: 'Light extrusion lip after hire',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Renewed all 4',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Ram packers · pipe ram',
          spec: 'OEM Cameron-U geometry',
          asFound: 'Edge wear within tolerance',
          afterRebuild: 'New packer · OEM',
          status: '↻ Renewed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Annular packing element',
          spec: 'Hydril GK 11" 10K · HNBR',
          asFound: '8 — 14% taper deformation',
          afterRebuild: 'New element · OEM Hydril',
          status: '↻ Renewed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hub faces · upper / lower',
          spec: '≤ 0.025 mm flatness vs datum',
          asFound: '0.014 mm typical',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Body hardness · all locations',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '19.6 — 21.4 HRC',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'B7M studs · bonnet bolting',
          spec: '≤ 22 HRC · A193 B7M',
          asFound: '20.2 HRC avg (n=24)',
          afterRebuild: 'New B7M · per nipple-up',
          status: '↻ Renewed at re-entry',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'BX-160 ring gaskets · choke side',
          spec: 'API 6A · 316 SS',
          asFound: 'Single-use · scrapped',
          afterRebuild: 'New BX-160 · 316 SS',
          status: '↻ Renewed',
          asFoundStyle: 'plain',
          afterStyle: 'good',
        },
        {
          component: 'Inconel-625 cladding · seal lands',
          spec: 'No cracks / DPI clean',
          asFound: 'DPI clean',
          afterRebuild: 'DPI clean post-refresh',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Annular closure time',
          spec: '≤ 30 s · API STD 53',
          asFound: '5.1 s (last on-rig log)',
          afterRebuild: '4.7 s · post-refresh',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Pipe-ram closure time',
          spec: '≤ 30 s · API STD 53',
          asFound: '3.3 s',
          afterRebuild: '3.1 s · post-refresh',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What an operator should expect from a typical hire.'),
    para(
      'A typical engagement runs PO to wellhead in 5 to 7 days, with a stack arriving under a hydrotest certificate dated inside fourteen days of ship and a function-test record signed at the on-rig hand-over. Hire windows run from 30 days to a full annual campaign at 365 days. The fleet is sized so that a 24 to 48 hour mobilisation is possible against a stand-by stack when the calendar allows it. On de-mob, the operator gets a condition report inside five working days; on rental extension, the spare-parts pool stays staged in Jebel Ali for the full duration of the hire.',
    ),
    resultBox(
      'Result · summary',
      'A complete 11" 10K workover BOP package, freshly tested, on a 5 — 7 day mob window, with the spare-parts pool staged in Jebel Ali for the duration.',
      'Cameron-U double-ram + Hydril GK annular + 3-1/16" 10K choke manifold + Koomey Type 80, sour-service trim, hydrotest cert ≤14 days, Indus engineer at on-rig hand-over, spares pool on standby for the hire window, de-mob refresh cycle on return.',
      [
        { value: '5 — 7', valueSmall: ' days', label: 'Mob window from PO', style: 'accent' },
        { value: '15,000', valueSmall: ' psi · 30 min', label: 'Hydrotest cert ≤14 d', style: 'good' },
        { value: '30 — 365', valueSmall: ' days', label: 'Hire window', style: 'good' },
        { value: '24 — 48', valueSmall: ' h', label: 'Stand-by mob (when avail)' },
      ],
    ),

    sectionHead('/07', 'team', 'Who runs the rental fleet.'),
    teamList(
      'The rental fleet sits under a small, named team in Jebel Ali. The split is operations / mobilisation / pre-mob QA / inventory / field. Same crew on every hire — same names on the rental WO from pre-mob through de-mob.',
      [
        { name: 'Yusuf Al Hashimi', role: 'Rental Operations Manager', location: 'Jebel Ali', scope: 'Owns the rental fleet end-to-end. Stack allocation against open WOs, calendar against operator campaign dates, scope-of-supply on every PO.' },
        { name: 'Khalid Al Marzouqi', role: 'Mobilisation Lead', location: 'Jebel Ali', scope: 'Truck-and-trailer logistics out of JAFZA. Load plans, lashing, transit logs, GPS tracking, gate-to-gate hand-over photos.' },
        { name: 'Omar Al Maktoum', role: 'Pre-Mob QA / Test Engineer', location: 'Jebel Ali', scope: 'Hydrotest, function test, accumulator pre-charge, choke-manifold cert. Signs the cert that ships with the stack on every mob.' },
        { name: 'Aisha Al Suwaidi', role: 'Inventory + Documentation Lead', location: 'Jebel Ali', scope: 'Ram-block inventory, serial-number register, spares-pool reconciliation, NDT records on de-mob, condition report inside 5 days.' },
        { name: 'Hassan Al Awadi', role: 'Field Crew Supervisor', location: 'Jebel Ali', scope: 'Indus engineer at on-rig hand-over. Nipple-up to API 6A torque chart, function test on every cavity, hire-clock sign-off with the operator.' },
      ],
      'Rental fleet · WO numbering RNT-2026-NNNN · Standard SOP-OG-021 Rev 04 · Updated 2026-04-30',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'A rental BOP and a yard BOP are not the same asset, even when the serial number is the same. The rental is the one with the cert dated inside fourteen days. We don\'t ship the other one.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'Rental Operations Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Stack', value: '11" 10K Cameron-U + Hydril GK' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Working pressure', value: '10,000 psi' },
    { label: 'Hydrotest', value: '15,000 psi · 30 min · cert ≤14 d' },
    { label: 'Choke & kill manifold', value: '3-1/16" 10K · API 16C' },
    { label: 'Control unit', value: 'Koomey Type 80 · API 16D' },
    { label: 'Elastomers', value: 'HNBR · OEM kit' },
    { label: 'Bonnet bolting', value: 'A193 B7M / 2HM' },
    { label: 'Mob window', value: '5 — 7 days from PO' },
    { label: 'Hire window', value: '30 — 365 days' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'Rental scope-of-supply (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'Pre-mob test cert template (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'Spares pool manifest (PDF)', url: '#', size: '6 pp', format: 'PDF' },
    { label: 'On-rig hand-over checklist (PDF)', url: '#', size: '3 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Rental fleet · WO numbering RNT-2026-NNNN · Standard SOP-OG-021 Rev 04 · Updated 2026-04-30',

  cardOneLiner: 'Indus\'s 11" 10,000 psi workover BOP stack rental — Cameron-U double-ram + Hydril GK annular + matched 3-1/16" 10K choke manifold + Koomey Type 80 control unit. Sour-service trim, hydrotest cert dated inside fourteen days of ship, 5 — 7 day mobilisation from Jebel Ali, 30 — 365 day hire windows, spares pool staged for the duration.',
  cardOutcomePills: [
    { label: 'Mob 5 — 7 days from PO', style: 'good' },
    { label: 'Hydrotest cert ≤14 d', style: 'good' },
    { label: 'Spares pool on standby', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: '7-DAY MOB · 30-365 DAYS HIRE',
  cardTagStyle: 'oil',
  cardTagLabel: 'STACK RENTAL',

  durationDays: 30,

  seoTitle: '11" 10K Workover BOP Stack Rental · Cameron-U + Hydril GK · Sour Service · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Rental of an 11" 10,000 psi workover BOP stack from Indus Hydraulics in Jebel Ali. Cameron Type-U double-ram BOP + Hydril GK 11" 10K annular + matched 3-1/16" 10K choke & kill manifold + Koomey Type 80 control unit. NACE MR0175 sour-service trim, HNBR elastomers, B7M bolting, Inconel-625 cladding. Pre-mobilisation hydrotest at 15,000 psi held 30 minutes per API STD 53, certificate dated inside fourteen days of mobilisation. 5 — 7 day mob window from PO, 30 — 365 day hire windows, spares pool on standby.',
  focusKeyword: '11 inch 10k workover BOP stack rental jebel ali sour service',
}

export default CASE
