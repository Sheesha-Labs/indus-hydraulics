/**
 * Case 15 — CT, Snubbing & Wireline BOP testing & recertification
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's specialised intervention-BOP testing and recertification line —
 * separate from drilling BOPs, separate workshop discipline. Covers Coiled
 * Tubing Quad BOPs, Snubbing stacks with stripper rams, and Slickline /
 * Wireline grease-injection BOPs for Halliburton, SLB, Expro, Cansco, Axis
 * and Cudd intervention crews working sour service across Aramco, ADNOC,
 * PDO and KOC fields.
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
  slug: 'ct-snubbing-wireline-bop-testing-recertification',
  caseNumber: '15',
  isFeatured: false,
  category: 'ct_wireline',
  topicLabel: 'CT & Wireline · BOP Service · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali · GCC intervention fleet',
  caseDateLabel: 'ROLLING SCHEDULE · API 16A 5-YR CYCLE',
  title: 'Intervention BOPs are not drilling BOPs — and the workshop discipline is not the same.',
  titleAccent: 'the workshop discipline is not the same',
  deck: 'Indus runs a dedicated intervention-BOP line for Coiled Tubing Quads, Snubbing stacks with stripper rams, and Slickline / Wireline grease BOPs. Smaller bores than drilling stacks, different cavity logic, different elastomer kits, different test fixtures — and a sour-service requirement that does not negotiate. The crews that send us their iron are the ones who plan an intervention to the hour.',

  heroImageCaption: 'FIG. 01 · CT 5-1/8" 10K Quad BOP, bonnets open, blind / shear / slip / pipe ram cavities exposed for NDT',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-04-22',

  metaCells: [
    { label: 'Asset class', value: '3', valueSmall: ' · CT / Snub / WL', style: 'neutral' },
    { label: 'Pressure class', value: '10,000', valueSmall: ' · psi WP typical', style: 'neutral' },
    { label: 'Cycle TAT', value: '2-6', valueSmall: ' · weeks · per asset', style: 'accent' },
    { label: 'Recert validity', value: '5', valueSmall: ' yr · API 16A', style: 'good' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'Same standard, different iron, different mistakes.'),
    lead(
      'Intervention crews bring us their BOPs because the workshops they used to use kept treating a <strong>5-1/8" 10K Coiled Tubing Quad</strong> like a small drilling stack. It isn\'t. A CT Quad has four cavities that have to coordinate a single closure event around a piece of live coil — blind, shear, slip, pipe — and if the seal kit you fitted last week was the wrong durometer, you find out at 7,000 psi with the well open.',
    ),
    para(
      'Snubbing stacks have a different problem. The <strong>upper and lower stripper rams</strong> have to seal under tubing motion, not against a static joint. Wireline grease BOPs have a third problem again — the seal is not a ram at all but a column of injected grease and a stack of replaceable packing. Three asset classes, three workshop disciplines, one test bench that has to know the difference. Most general-rotating shops don\'t.',
    ),
    problemSolution(
      {
        label: 'What the intervention crew tells us',
        title: '"Test, recert, back on the unit before the next job."',
        body: 'A CT spread or snubbing unit comes off a well with a known cycle count, a known elastomer date, and a known API 16A 5-year clock. The crew wants the iron tested, recertified, packaged, and back on their truck or container with paperwork an operator HSE will accept on first read.',
      },
      {
        label: 'What the bench actually finds',
        title: 'Stripper extrusion, slip die wear, packing-stack wash, sour-grade elastomer end-of-life',
        body: 'Stripper packers extruded past the OEM scrap dim. Slip dies on the CT Quad with rounded teeth from coiled-tubing pull cycles. Wireline grease packing washed asymmetrically. NBR (not HNBR) elastomers in stacks that ran sour. Hardness drift on shear blocks. Each of those is a "do not run" finding under API 16A.',
      },
    ),
    para(
      'Our job on the way in is to find what the unit log doesn\'t. Our job on the way out is to hand back a stack and a file the operator HSE engineer can sign in five minutes. That paperwork is the difference between getting on the well-pad and waiting in the lay-down yard.',
    ),

    sectionHead('/02', 'solution', 'Three asset lines, one bench discipline.'),
    para(
      'For a <strong>CT Quad BOP</strong> — typically <strong>5-1/8" 10K</strong>, Cameron / NOV / Hydril — the standard scope is: full strip to component, MPI on every ferrous part, UT thickness on the body, dimensional CMM against the OEM datum, hardness Rockwell C with a <strong>≤ 22 HRC ceiling per NACE MR0175 / ISO 15156</strong>, dye-penetrant on every sealing surface, replace every elastomer in <strong>HNBR sour-service grade</strong>, replace blind and shear blocks where the cutting edge is inside the OEM scrap dim, hydrostatic shell at <strong>1.5× WP = 15,000 psi held 30 minutes</strong>, function test on each of the four cavities with closure-time records, and an API 16A 5-year recert stamp on release. Typical TAT is <strong>4-6 weeks</strong> bench-to-truck.',
    ),
    para(
      'For a <strong>snubbing BOP stack</strong> — typically <strong>7-1/16" 10K</strong> with upper + lower stripper rams plus a safety ram and pipe ram — the scope is the same plus a <strong>stripper ram rebuild</strong> that is its own discipline. Stripper packers are renewed in HNBR, the stripper bore is honed and re-measured, and the function test includes a moving-tubing leak check. Typical TAT is <strong>6-10 weeks</strong>. For <strong>slickline / wireline BOPs</strong> — bore typically <strong>5-1/8"</strong> or smaller, grease-injection plus packing — the scope reduces to grease-circuit strip, packing-stack renewal, hydrotest, function. Typical TAT is <strong>1-2 weeks</strong>; mostly grease and packing.',
    ),
    figure(
      'Day 9 of a snubbing-stack rebuild. Upper and lower stripper bonnets open, stripper packers on the bench, stripper bore mid-honing. The polished bore is what every tubing motion seals against — Ra and roundness both matter.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Snubbing BOP stack with stripper bonnets open, stripper packers on bench, hone bar in cavity\\n1200×675"',
      },
    ),
    pullQuote(
      'A drilling BOP closes on a static drill pipe and holds. A snubbing stripper has to seal a tubing string that is moving in or out. That is not the same elastomer problem and it is not the same test. If your shop runs both lines through the same mental model, you are going to lose a stripper at the wrong time.',
      '— Hassan Al Awadi · Stripper Rebuild Specialist · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, three asset classes, one file format.'),
    para(
      'Every CT, snubbing or wireline BOP that comes through the bay runs through the same four phases. The phase content changes by asset class; the discipline does not.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Goods-in & class triage',
        body: 'Asset weighed, photographed, classified by line (CT Quad / snub / WL). Cycle log, fluid sample, elastomer date and last recert sticker logged. Pre-strip dimensional. Intake report inside 48 h.',
        duration: 'Days 0 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'Strip & NDT',
        body: 'Down to component. MPI on ferrous parts, UT body thickness, hardness Rockwell C, CMM vs OEM datum, DPI on seal lands and hub faces. Findings against API 16A Annex C, logged row-by-row.',
        duration: 'Days 3 — 10',
      },
      {
        number: 'PHASE 03',
        title: 'Recondition & rebuild',
        body: 'CT Quad: blind / shear / slip / pipe rams refit or renewed. Snubbing: stripper bore hone, packer renewal. Wireline: packing stack and grease injector. All elastomers HNBR sour-service.',
        duration: 'Days 11 — N',
      },
      {
        number: 'PHASE 04',
        title: 'Test, FAT & release',
        body: 'Hydrostatic shell at 1.5× WP held 30 min. Function on every cavity / stripper / packing element with closure or seat-time records. Operator-witnessed sign-off where required. API 16A recert sticker.',
        duration: 'Days N — N+5',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard procedure, line by line.'),
    para(
      'Below is the abridged SOP that governs an intervention-BOP recert in our shop. The full document is asset-class specific and runs to three annexes. This is the subset that gets ticked off, dated and signed on every work order.',
    ),
    sopBlock(
      'SOP-OG-024 · CT / SNUB / WL BOP RECERT · REV 04 · NACE',
      '18 / 18 COMPLETE',
      [
        {
          name: 'Phase 01 · Goods-in & class triage',
          rows: [
            { task: 'Class triage & cycle-log capture', detail: 'CT Quad / snubbing / wireline classification; cycle count and last-recert sticker logged on intake', who: 'Y. AL HASHIMI', tool: 'Goods-in bay' },
            { task: 'Sour-service confirm', detail: 'H₂S exposure history from operator; NACE MR0175 / ISO 15156 applied as default', who: 'A. AL SUWAIDI', tool: 'Operator log' },
            { task: 'Hydraulic fluid drain & sample', detail: 'Witness sample retained; ISO 4406 cleanliness for cross-check vs unit pump', who: 'O. AL MAKTOUM', tool: 'Drain rig' },
            { task: 'Pre-strip dimensional', detail: 'Bore, bonnet flange, stripper bore (snub) or grease bore (WL) vs OEM datum', who: 'A. AL SUWAIDI', tool: 'CMM + bore mic' },
            { task: 'Intake report · 8 pp PDF', detail: 'Asset class, baseline dimensions, fluid sample, recommended NDT scope, elastomer pack list', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 02 · Strip & NDT',
          rows: [
            { task: 'Bonnet break-out · CT Quad / snub / WL', detail: 'Hydraulic torque tool, OEM breakout sequence; blocks / strippers / packing extracted to bench', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'MPI · all ferrous parts', detail: 'Wet fluorescent, body, ram blocks, stripper bonnets, locking screws; per ASME V Art. 7', who: 'A. AL SUWAIDI', tool: 'MPI bench' },
            { task: 'Hardness Rockwell C · NACE MR0175', detail: 'All forgings ≤ 22 HRC ceiling; every test logged with location and operator', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'DPI on sealing surfaces', detail: 'Hub faces, ram block seal lands, stripper bore, grease packing seats; per ASME V Art. 6', who: 'A. AL SUWAIDI', tool: 'DPI kit' },
            { task: 'NDT findings report · 12 pp PDF', detail: 'Row per part with status and action; basis for any change-order PO before Phase 03', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 03 · Recondition & rebuild',
          rows: [
            { task: 'Blind / shear ram refit · CT Quad', detail: 'Cutting edge vs OEM scrap dim; replace if inside 0.30 mm of scrap; OEM stock, EN 10204 3.2 cert', who: 'O. AL MAKTOUM', tool: 'OEM stock' },
            { task: 'Slip ram die set · CT Quad', detail: 'Tooth profile vs OEM gauge; replace as set, not individuals; coil-OD compatibility check', who: 'O. AL MAKTOUM', tool: 'Profile gauge' },
            { task: 'Stripper bore hone · snubbing', detail: 'Bore re-honed to OEM Ra / roundness spec; bore mic verification at 4 stations', who: 'H. AL AWADI', tool: 'Hone bar + bore mic' },
            { task: 'Renew all elastomers · HNBR sour-service', detail: 'Bonnet seals, ram packers, stripper packers, grease packing, piston seals — every soft good', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Reassemble · OEM torque sequence', detail: 'Bonnets / strippers / grease cap fitted to OEM chart; every torque recorded against fastener ID', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
          ],
        },
        {
          name: 'Phase 04 · Test, FAT & release',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× WP', detail: '15,000 psi held 30 min for 10K assets; zero pressure drop measured at 0.1% gauge resolution', who: 'A. AL SUWAIDI', tool: 'Hydrotest rig' },
            { task: 'Function test · per asset class', detail: 'CT Quad: 4 cavity closures. Snub: ram + stripper seat under motion. WL: grease injection seal', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Closure / seat time records', detail: 'Each cavity / stripper / packing logged against API STD 53 / OEM time spec', who: 'A. AL SUWAIDI', tool: 'Stopwatch + logger' },
            { task: 'API 16A 5-year cert · recert sticker', detail: 'Sticker dated on release; valid 5 years from cert date per API 16A schedule', who: 'F. AL MANSOORI', tool: 'Cert stock' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find on intervention BOPs.'),
    para(
      'Below is the typical-findings table across a year of intervention-BOP intakes. The three highlighted rows are the ones we see most often that an operator HSE engineer will not let on a well-pad without intervention.',
    ),
    specTable(
      'TYPICAL FINDINGS · INTERVENTION BOP CLASS · CT / SNUB / WL · SOUR SERVICE',
      [
        {
          component: 'Stripper packer extrusion · snubbing',
          spec: 'OEM extrusion limit',
          asFound: 'Past scrap dim on ~70% of intakes',
          afterRebuild: 'New HNBR · within OEM',
          status: '↻ Always renew',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Slip ram die teeth · CT Quad',
          spec: 'OEM tooth profile',
          asFound: 'Rounded teeth on ~40% of CT intakes',
          afterRebuild: 'New die set · OEM',
          status: '↻ Replace as set',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet seal compound',
          spec: 'HNBR sour-service',
          asFound: 'NBR (wrong grade) on ~15% of intakes',
          afterRebuild: 'New HNBR · OEM kit',
          status: '↻ Always renew',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Shear ram cutting edge · CT Quad',
          spec: '≥ OEM scrap dim',
          asFound: '~25% inside 0.30 mm of scrap',
          afterRebuild: 'New OEM block where flagged',
          status: '↻ Replace per finding',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Stripper bore Ra & roundness · snub',
          spec: 'OEM Ra ≤ 0.4 µm',
          asFound: 'Drift on ~50% of strippers',
          afterRebuild: 'Re-honed · within OEM',
          status: '↻ Hone to spec',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Wireline grease packing wash',
          spec: 'OEM packing stack',
          asFound: 'Asymmetric wash on ~60% of WL intakes',
          afterRebuild: 'New stack · OEM',
          status: '↻ Always renew',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Body hardness · all locations',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '19 — 22 HRC typical',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass · per intake',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Body wall UT thickness',
          spec: '≥ 95% of OEM nominal',
          asFound: '≥ 96% on ~95% of intakes',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test · 10K assets',
          spec: '15,000 psi · 30 min hold',
          asFound: '—',
          afterRebuild: '15,000 psi · 0 psi drop',
          status: '✓ Pass on release',
          afterStyle: 'good',
        },
        {
          component: 'Function test · all cavities',
          spec: 'Per OEM / API STD 53',
          asFound: '—',
          afterRebuild: 'Within OEM time spec',
          status: '✓ Pass on release',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'What the intervention crew gets back.'),
    para(
      'On release the unit goes back on the truck or container with a fresh API 16A 5-year recert sticker, a single FAT pack — NDT records, hardness logs, torque sheets, hydrotest curve, function records, recert cert — and a closure / seat time record per cavity. The crew can hand the file straight to the operator HSE engineer and clear the well-pad on first read. The same file format applies whether the asset is a CT Quad, a snubbing stack or a wireline grease BOP.',
    ),
    resultBox(
      'Result · summary',
      'Intervention BOP back on the unit with a fresh API 16A recert, a sour-service-grade rebuild, and a FAT pack the operator HSE accepts on first read.',
      'Three asset lines — CT Quad, snubbing, wireline — run through one bench discipline. Hydrotest at 1.5× WP held 30 minutes. Function test recorded per cavity, stripper or packing element. NACE MR0175 hardness ceiling enforced on every forging. HNBR elastomer pack throughout. Recert valid 5 years from cert date.',
      [
        { value: '2-6', valueSmall: ' wk', label: 'Cycle TAT', style: 'accent' },
        { value: '15,000', valueSmall: ' psi · 0 drop', label: 'Hydrotest', style: 'good' },
        { value: '5', valueSmall: ' yr', label: 'Recert validity', style: 'good' },
        { value: '3', valueSmall: ' classes', label: 'Asset lines covered' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew on the intervention bench.'),
    teamList(
      'Five engineers run the intervention-BOP line out of Jebel Ali. The crew is deliberately separate from the drilling-BOP bays — different fixtures, different elastomer stocks, different mental model. If you call the workshop and ask for the intervention line, you reach this team.',
      [
        { name: 'Yusuf Al Hashimi', role: 'CT/Snub/WL Workshop Manager', location: 'Jebel Ali', scope: 'Goods-in, class triage, scheduling against operator-side intervention windows, low-loader release.' },
        { name: 'Omar Al Maktoum', role: 'Lead Intervention BOP Technician', location: 'Jebel Ali', scope: 'Strip-down and reassembly across all three asset classes; OEM torque sequence; function-test lead.' },
        { name: 'Aisha Al Suwaidi', role: 'NDT / QA Inspector', location: 'Jebel Ali', scope: 'MPI, UT thickness, hardness Rockwell C, dimensional CMM, dye-penetrant. Signs every NDT and hydrotest record.' },
        { name: 'Hassan Al Awadi', role: 'Stripper Rebuild Specialist', location: 'Jebel Ali', scope: 'Snubbing stripper bore hone, packer renewal, moving-tubing leak check, stripper-specific FAT.' },
        { name: 'Khalid Al Marzouqi', role: 'Field Liaison · Intervention Crews', location: 'Jebel Ali', scope: 'Operator and intervention-crew interface; cycle-log capture; HSE-side cert package handover.' },
      ],
      'Case file · INTAKE-2026-04-118 · WO-2026-2208 · Published 2026-05-08 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'CT Quads, snubbing strippers, wireline grease BOPs — three different sealing problems that all happen to be called "the BOP" on the unit log. We run them as three lines on purpose. The day you start treating a stripper rebuild like a pipe-ram rebuild is the day you lose one at the wrong moment.',
  pullQuoteAuthor: 'Yusuf Al Hashimi',
  pullQuoteRole: 'CT/Snub/WL Workshop Manager',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset classes', value: 'CT Quad · Snub · Wireline' },
    { label: 'CT Quad bore', value: '5-1/8" · 10K typical' },
    { label: 'Snubbing bore', value: '7-1/16" · 10K typical' },
    { label: 'Wireline bore', value: '5-1/8" or smaller' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Hydrotest', value: '1.5× WP · 30 min' },
    { label: 'Elastomers', value: 'HNBR sour-service throughout' },
    { label: 'Standards', value: 'API 16A · API STD 53' },
    { label: 'Recert validity', value: '5 years per API 16A' },
    { label: 'Cycle TAT', value: '2-6 weeks per asset' },
  ],
  galleryTotalCount: 36,
  downloads: [
    { label: 'Intake report template (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'NDT findings report template (PDF)', url: '#', size: '12 pp', format: 'PDF' },
    { label: 'Hardness / NACE logs (ZIP)', url: '#', size: '10 MB', format: 'ZIP' },
    { label: 'FAT pack & API 16A recert sample (PDF)', url: '#', size: '64 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-118 · WO-2026-2208 · Published 2026-05-08 · Updated 2026-05-12',

  cardOneLiner: 'Indus runs a dedicated intervention-BOP line — CT Quads, snubbing stacks with stripper rams, wireline grease BOPs — separate from the drilling bays. Sour-service rebuild, API 16A 5-year recert, hydrotest at 1.5× WP, function test per cavity. 2-6 week cycle TAT for Halliburton, SLB, Expro, Cansco, Axis and Cudd intervention crews.',
  cardOutcomePills: [
    { label: 'CT Quad · Snub · Wireline', style: 'good' },
    { label: 'Hydrotest 1.5× WP · 30 min', style: 'good' },
    { label: 'API 16A recert · 5 yr', style: 'accent' },
    { label: 'NACE MR0175 sour service', style: 'neutral' },
  ],
  cardDurationLabel: '2-6 WEEK CYCLE',
  cardTagStyle: 'oil',
  cardTagLabel: 'CT/SNUB/WL BOP',

  durationDays: 21,

  seoTitle: 'CT, Snubbing & Wireline BOP Testing & Recertification · API 16A · Sour Service · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Indus runs a dedicated intervention-BOP recertification line at Jebel Ali for Coiled Tubing Quad BOPs (5-1/8" 10K), snubbing stacks with stripper rams (7-1/16" 10K), and wireline / slickline grease BOPs. Full strip, NDT, NACE MR0175 hardness verification, HNBR sour-service elastomer renewal, 1.5× WP hydrostatic shell test, function test per cavity, API 16A 5-year recert. 2-6 week cycle TAT for Halliburton, SLB, Expro, Cansco, Axis, Cudd intervention crews working ADNOC, Aramco, PDO, KOC sour fields.',
  focusKeyword: 'CT snubbing wireline BOP testing recertification jebel ali sour service',
}

export default CASE
