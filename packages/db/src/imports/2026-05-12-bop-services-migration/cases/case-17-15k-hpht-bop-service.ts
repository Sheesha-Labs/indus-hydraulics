/**
 * Case 17 — 15K HPHT BOP service for sour-gas plays (Hail & Ghasha, Jafurah, Khazzan)
 * 2026-05-12 (BOP services migration wave)
 *
 * Specialist 15K psi HPHT (high-pressure / high-temperature) BOP recertification
 * and qualification work for the GCC's most demanding sour-gas reservoirs — ADNOC
 * Hail & Ghasha (H2S up to 30%), Saudi Aramco Jafurah unconventional sour gas,
 * and Oman Khazzan / Ghazeer tight gas. Cameron UII / Shaffer NXT-15K class with
 * full HPHT trim qualification — charpy, hardness, NACE, elastomer envelope.
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
  slug: '15k-hpht-bop-service-hail-ghasha-jafurah-sour-gas',
  caseNumber: '17',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · 15K HPHT · Sour Gas',
  region: '🇦🇪 UAE · Jebel Ali · ADNOC + Aramco sour-gas plays',
  caseDateLabel: 'PER-ASSET · 8-14 WEEK CYCLE',
  title: 'A 15K HPHT BOP service for the GCC\'s nastiest reservoirs — where 30% H₂S is the design case, not the worst case.',
  titleAccent: 'where 30% H₂S is the design case, not the worst case',
  deck: 'Hail & Ghasha runs sour at concentrations that would scrap a standard 15K stack inside a year. Jafurah and Khazzan add the pressure and the temperature to match. We rebuild and requalify 13-5/8" and 18-3/4" 15K HPHT BOPs for those reservoirs at our Jebel Ali workshop — full API 16A recert under the HPHT addendum, charpy on every metallic, NACE MR0175 hardness on every fastener, elastomer qualification at the operator\'s actual reservoir envelope.',

  heroImageCaption: 'FIG. 01 · 13-5/8" 15K Cameron UII HPHT BOP, bonnets open, ram blocks staged for charpy and hardness rounds',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-04-12',

  metaCells: [
    { label: 'Asset', value: '13-5/8" / 18-3/4"', valueSmall: ' · 15K HPHT', style: 'neutral' },
    { label: 'WP', value: '15,000', valueSmall: ' · psi · cold', style: 'neutral' },
    { label: 'Hydrotest', value: '22,500', valueSmall: ' · psi · 30 min', style: 'neutral' },
    { label: 'TAT', value: '8 — 14', valueSmall: ' weeks', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175 · ≤22 HRC', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'Reservoirs that punish the difference between "rated" and "qualified".'),
    lead(
      'There is a small, expensive class of GCC sour-gas reservoirs where a 15K BOP that arrived with a clean OEM nameplate and a pile of mill certs still goes home and fails. <strong>ADNOC Hail & Ghasha runs H₂S up to 30%.</strong> Saudi Aramco Jafurah is unconventional sour gas at high pressure with the temperature to match. PDO Khazzan and Ghazeer are tight gas at envelopes the previous decade did not need to design for. None of those reservoirs care that your stack has a "15K" stamp on it. They care whether the trim was qualified for the temperature at which the seal actually has to seal.',
    ),
    para(
      'API 16A gives you a 15K rating. The HPHT addendum tells you what you have to do on top of that to be allowed to run that 15K stack at the temperature envelope and the H₂S partial pressure that these specific reservoirs deliver. <strong>Charpy V-notch impact testing on every HPHT-trim metallic at the low-temperature design point.</strong> NACE MR0175 / ISO 15156 hardness on every body, every ram, every stud, every nut, with a paper trail. Elastomer qualification at the elevated-temperature envelope, not the room-temperature catalogue datum. Most of the BOPs we see at our Jebel Ali workshop arrive missing at least one of those three. None of them go back without all three.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"It\'s a 15K stack. We need a recert. Standard scope."',
        body: 'Operator pulls the BOP at the 5-year mark. Asks for an API 16A recert. Treats it as a routine bench job. The PO line item reads the same as a 10K Cameron Type-U recert. The procurement file does not flag the field-specific HPHT envelope. The risk lands on the workshop to either flag it or wear it.',
      },
      {
        label: 'What the engineering review actually finds',
        title: 'HPHT trim that was rated, never qualified, never re-qualified',
        body: 'Charpy records absent on the original ram blocks. Elastomer pack on shelf is HNBR catalogue grade — not qualified at the operator\'s 177°C reservoir envelope. Half the bonnet bolting is unmarked stock. Body hardness logs from the 2021 recert are missing the witnessing signature. None of that is legal under the HPHT addendum. All of it can be closed out — but not in 6 weeks.',
      },
    ),
    para(
      'Our standing answer to the operator is the same every time. <strong>"You don\'t want a recert. You want an HPHT requalification, packaged as a recert."</strong> That conversation usually adds 4-6 weeks to the bench TAT and a non-trivial line on the PO. It also keeps the asset legal on a Hail & Ghasha well, which is the entire point of the exercise.',
    ),

    sectionHead('/02', 'solution', 'Strip, requalify, recert — to the HPHT envelope, not the catalogue datum.'),
    para(
      'A 15K HPHT BOP service in our Jebel Ali workshop is a longer engagement than a 10K recert and substantially more documentation. We strip the stack to component level — bonnets off, ram blocks out, operating cylinders separated, every fastener tagged. Every metallic part goes through the standard <strong>API 16A Annex C</strong> NDT scope (MPI, UT thickness, dimensional vs OEM datum, dye-penetrant on sealing surfaces, Rockwell-C hardness <strong>≤22 HRC per NACE MR0175 / ISO 15156</strong>) and on top of that the HPHT addendum scope: <strong>charpy V-notch impact testing on every HPHT-trim metallic at the low-temperature design point</strong>, run through an ISO 17025 mechanical-test laboratory partner with a witnessed traveller. Body forgings are <strong>AISI 4130</strong> with <strong>Inconel-625</strong> cladding on the metal-to-metal seal lands. Bonnet bolting is <strong>ASTM A193 B7M</strong> studs with 2HM nuts, sour-service rated, mill cert <strong>EN 10204 3.2</strong>.',
    ),
    para(
      'Every elastomer in the BOP is replaced with parts that have been <strong>qualified at the operator\'s actual reservoir envelope</strong> — not the catalogue room-temperature spec. HNBR sour-service grade for the lower-temperature envelope, AFLAS where the temperature pushes past the HNBR ceiling. Every bonnet seal, ram packer, top seal, annular element, piston seal and wear ring is renewed from a kit whose qualification certificate names the temperature and the H₂S partial pressure it was tested at. The shell test is <strong>1.5× WP = 22,500 psi held 30 minutes</strong> with zero pressure drop. Function test follows API STD 53. The deliverable pack runs to a couple of hundred pages and is the difference between a BOP the operator can put on a Hail & Ghasha well and one they cannot.',
    ),
    figure(
      'Day 31, Bay 2. Bonnet open on a 13-5/8" 15K Cameron UII. Ram block staged on the bench with charpy specimens already at the lab. The polished annulus on the bonnet flange is the metal seal land — at 22,500 psi shell test it has to hold zero drop for 30 minutes.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Cameron UII 13-5/8\\" 15K HPHT bonnet open, ram block on bench, charpy specimens labelled\\n1200×675"',
      },
    ),
    pullQuote(
      'Rated for 15K and qualified for 15K at 177°C in 30% H₂S are not the same sentence. The first is a stamp on a nameplate. The second is a folder of charpy curves, hardness logs, elastomer qualification certs and a hydrotest chart. We sell the second.',
      '— Fatima Al Mansoori · HPHT Engineering Authority · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases, 8-14 weeks, one HPHT requalification pack.'),
    para(
      'Every 15K HPHT BOP service we run goes through the same four phases. The cycle time stretches with the trim scope and the lab queue at the charpy partner — never with how hard the bench team is working.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt, intake & HPHT scope',
        body: 'BOP off the truck, weighed, photographed, fluid-drained, witness sample. Operator-specific reservoir envelope confirmed in writing. HPHT scope built against the actual H₂S, temperature and pressure the asset will see.',
        duration: 'Weeks 0 — 1',
      },
      {
        number: 'PHASE 02',
        title: 'Strip, NDT, charpy, hardness',
        body: 'Bonnets off, rams out. MPI, UT thickness, dimensional, dye-penetrant on every metallic. Charpy specimens machined and shipped to the ISO 17025 lab partner. NACE hardness on every fastener.',
        duration: 'Weeks 2 — 6',
      },
      {
        number: 'PHASE 03',
        title: 'Recondition & rebuild · HPHT trim',
        body: 'Hub faces re-machined. Metallics that fail charpy or hardness retired. HPHT-qualified elastomer kit fitted — HNBR or AFLAS to suit the envelope. Reassembled to OEM torque chart, every fastener logged.',
        duration: 'Weeks 6 — 11',
      },
      {
        number: 'PHASE 04',
        title: 'Test, FAT & HPHT release',
        body: 'Shell test at 22,500 psi for 30 min, zero drop. Function test per API STD 53. Operator-witnessed sign-off in Jebel Ali. HPHT recertification pack (~200 pp) delivered. Low-loader to the rig.',
        duration: 'Weeks 11 — 14',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard procedure we run on every HPHT engagement.'),
    para(
      'Below is the abridged version of the SOP that governs a 15K HPHT BOP recert in our Jebel Ali workshop. Full document runs to 96 lines and six annexes (one per HPHT-specific test category). This is the subset that gets ticked off, dated and signed on every work order in this category.',
    ),
    sopBlock(
      'SOP-OG-019 · BOP 15K HPHT REQUAL & RECERT · REV 04 · NACE / API 16A HPHT',
      '21 / 21 STANDARD',
      [
        {
          name: 'Phase 01 · Receipt & HPHT scope',
          rows: [
            { task: 'Goods-in & weighbridge', detail: 'BOP weighed (Cameron UII 13-5/8" 15K typical 18,400 kg dry); photo log against waybill', who: 'Y. AL HASHIMI', tool: 'Crane bay' },
            { task: 'Reservoir envelope confirmation', detail: 'Operator-signed sheet: max H₂S partial pressure, low-temp design, max temp at BOP, sour-service class', who: 'F. AL MANSOORI', tool: 'Operator data' },
            { task: 'HPHT scope build', detail: 'Charpy temperature set, hardness ceiling set at ≤22 HRC, elastomer envelope set against operator data', who: 'F. AL MANSOORI', tool: 'Scope sheet' },
            { task: 'Pre-strip dimensional & fluid drain', detail: 'Bore, bonnet flange flatness, hub-face datum; hydraulic fluid drained, sample retained ISO 4406', who: 'O. AL MAKTOUM', tool: 'CMM + drain rig' },
          ],
        },
        {
          name: 'Phase 02 · Strip, NDT & HPHT testing',
          rows: [
            { task: 'Bonnet break-out & ram extraction', detail: 'Hydraulic torque tool, OEM service-manual sequence; rams to bench, fasteners tagged by position', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'MPI · all ferrous components', detail: 'Wet fluorescent, body, ram blocks, bonnets, locking-screw bores; ASME V Art. 7', who: 'A. AL SUWAIDI', tool: 'MPI bench' },
            { task: 'UT thickness · body & bonnet flanges', detail: 'Min wall vs OEM scrap dim; 32 readings per body, 12 per bonnet flange (HPHT scope expanded vs 10K)', who: 'A. AL SUWAIDI', tool: 'UT gauge' },
            { task: 'Charpy V-notch impact · HPHT trim', detail: 'Specimens machined per ASTM A370; tested at low-temp design point at ISO 17025 partner lab; witnessed traveller', who: 'H. AL AWADI', tool: 'Lab partner' },
            { task: 'Hardness Rockwell C · NACE MR0175', detail: 'Every body, ram block, bonnet, stud, nut tested ≤22 HRC; every test logged with location & operator', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'Dye-penetrant on sealing surfaces', detail: 'Hub faces, ram block seal lands, bonnet seal grooves, Inconel-625 cladding; ASME V Art. 6', who: 'A. AL SUWAIDI', tool: 'DPI kit' },
            { task: 'HPHT findings report · ~24 pp', detail: 'One row per part, status, action, charpy curve, hardness ledger, basis for change-order PO', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 03 · Recondition & HPHT-qualified rebuild',
          rows: [
            { task: 'Hub face re-machining where required', detail: 'Light scoring removed; flatness restored ≤0.025 mm vs datum; surface Ra ≤0.4 µm; re-DPI post', who: 'H. AL AWADI', tool: 'CNC mill' },
            { task: 'Retire metallics failing charpy or hardness', detail: 'Replaced from OEM stock with HPHT-qualified parts; new charpy + hardness on receipt', who: 'O. AL MAKTOUM', tool: 'OEM stock' },
            { task: 'Renew elastomers · HPHT-qualified kit', detail: 'HNBR or AFLAS to suit operator envelope; qual cert names temp + H₂S partial pressure tested', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Bonnet bolting · A193 B7M / 2HM', detail: 'New studs and nuts to OEM torque chart; EN 10204 3.2 cert; hardness verified ≤22 HRC on receipt', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'Reassemble per OEM sequence', detail: 'Bonnets fitted, locking screws set, ram blocks indexed; every torque recorded', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
          ],
        },
        {
          name: 'Phase 04 · Test, FAT & HPHT release',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× WP', detail: '22,500 psi held 30 min · zero pressure drop measured at 0.1% gauge resolution; HPHT-qual fittings', who: 'A. AL SUWAIDI', tool: 'HPHT hydrotest rig' },
            { task: 'Function test per API STD 53', detail: 'Open/close timing on every cavity; closure ≤30 s requirement (largest cavity); operator-spec sour conditions', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'Operator-witnessed sign-off', detail: 'Operator engineer present in Jebel Ali for shell + function tests; counter-signature on cert', who: 'F. AL MANSOORI', tool: 'On-site' },
            { task: 'HPHT recert pack · ~200 pp', detail: 'NDT records, charpy curves, hardness logs, elastomer qual certs, torque sheets, hydrotest chart, function records', who: 'F. AL MANSOORI', tool: 'PDF + paper' },
            { task: 'API 16A HPHT cert issued', detail: 'New recert sticker; HPHT envelope explicitly stated; valid 5 years per API 16A schedule', who: 'F. AL MANSOORI', tool: 'Cert' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'What we typically find on a 15K HPHT BOP at the bench.'),
    para(
      'Below is what we measure on a typical 15K HPHT BOP arriving for service at our Jebel Ali workshop. Three findings on the highlighted rows would normally fail an HPHT addendum audit if the unit had been put back on a Hail & Ghasha or Jafurah well as-is. All three are routinely closed out in Phase 03 of the standard scope.',
    ),
    specTable(
      'TYPICAL FINDINGS · 13-5/8" 15K HPHT BOP · CAMERON UII / SHAFFER NXT-15K · SOUR SERVICE',
      [
        {
          component: 'Charpy records · HPHT trim metallics',
          spec: 'Required at low-temp design point',
          asFound: 'Absent on incoming asset',
          afterRebuild: 'Full charpy ledger (n=18+)',
          status: '↻ Re-tested at ISO 17025 lab',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Elastomer qualification envelope',
          spec: 'Qual at operator T + H₂S envelope',
          asFound: 'Catalogue HNBR · room-T datum',
          afterRebuild: 'HNBR/AFLAS · qual at 177°C',
          status: '↻ Full kit replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet bolting hardness · A193 B7M',
          spec: '≤22 HRC · NACE MR0175',
          asFound: 'Mixed lot · 1 stud at 23.4 HRC',
          afterRebuild: 'New B7M · 21.0 avg',
          status: '↻ All studs replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Body hardness · all locations',
          spec: '≤22 HRC · NACE MR0175',
          asFound: '19.8 — 21.4 HRC (n=24)',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Hub face flatness · all bonnets',
          spec: '≤0.025 mm vs datum',
          asFound: '0.06 — 0.14 mm (typ)',
          afterRebuild: '0.011 — 0.018 mm',
          status: '↻ Re-machined',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Body wall UT thickness · min',
          spec: '≥95% of OEM nominal',
          asFound: '97.4% of nominal (typ)',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Inconel-625 cladding · seal lands',
          spec: 'No cracks · DPI clean',
          asFound: 'DPI clean (typ)',
          afterRebuild: 'DPI clean post-test',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Annular packer · HPHT envelope',
          spec: 'Qual at operator T envelope',
          asFound: 'Stock element · catalogue qual',
          afterRebuild: 'New element · HPHT qual',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test',
          spec: '22,500 psi · 30 min hold',
          asFound: '—',
          afterRebuild: '22,500 psi · 0 psi drop',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Annular closure time',
          spec: '≤30 s · API STD 53',
          asFound: '6.8 s (typ last rig record)',
          afterRebuild: '5.4 — 6.2 s post-rebuild',
          status: '✓ Pass · well inside spec',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'A BOP an operator can put on a Hail & Ghasha well without a phone call.'),
    para(
      'A typical 15K HPHT engagement comes off the test bench between week 11 and week 14, with the operator engineer counter-signing the 22,500 psi hydrotest chart in Jebel Ali. The HPHT recert pack — usually ~200 pages, two paper copies, one PDF, one ZIP of NDT records, charpy curves, hardness logs and elastomer qualification certs — is delivered the same week. The new API 16A recert names the HPHT envelope explicitly, so the operator\'s well-control engineer does not have to reverse-engineer it from the appendix. There is no replacement-rental fall-back at this rating in the GCC: 15K HPHT BOPs are operator-owned. Which is why the asset has to come back on time, and right.',
    ),
    resultBox(
      'Result · typical engagement',
      '15K HPHT BOP returned to a Hail & Ghasha / Jafurah / Khazzan well with a full HPHT requalification pack and an API 16A recert that names the envelope.',
      'Strip-to-component rebuild, full API 16A Annex C NDT scope plus HPHT addendum charpy + hardness + elastomer qualification, hydrotest at 22,500 psi held 30 minutes with zero drop, operator-witnessed function test, ~200-page HPHT recert pack issued. Recert validity 5 years from sign-off. No GCC rental fall-back at this rating.',
      [
        { value: '8 — 14', valueSmall: ' wk', label: 'Bench TAT', style: 'accent' },
        { value: '22,500', valueSmall: ' psi · 0 drop', label: 'Hydrotest', style: 'good' },
        { value: '≤22', valueSmall: ' HRC', label: 'NACE hardness ceiling', style: 'good' },
        { value: '5', valueSmall: ' yr', label: 'HPHT recert validity' },
      ],
    ),

    sectionHead('/07', 'team', 'The Jebel Ali crew that runs the HPHT bench.'),
    teamList(
      'A 15K HPHT BOP service runs longer than a 10K recert, with more lab interface, more documentation and a tighter QA loop. Five engineers sit on every engagement of this class — the same five names every time so the operator never has to re-explain the asset to a different desk.',
      [
        { name: 'Fatima Al Mansoori', role: 'HPHT Engineering Authority', location: 'Jebel Ali', scope: 'Reservoir envelope sign-off, HPHT scope build, charpy interpretation, recert pack compilation, API 16A HPHT cert issue.' },
        { name: 'Yusuf Al Hashimi', role: 'Workshop Manager', location: 'Jebel Ali', scope: 'Goods-in, planning, weighbridge, operator scheduling, low-loader release. Owns the work-order file end to end.' },
        { name: 'Aisha Al Suwaidi', role: 'NDT / Materials QA Lead', location: 'Jebel Ali', scope: 'MPI, UT thickness, hardness Rockwell C, dimensional CMM, dye-penetrant. Witnesses every charpy traveller at the lab partner.' },
        { name: 'Omar Al Maktoum', role: 'Lead HPHT BOP Technician', location: 'Jebel Ali', scope: 'Strip-down, ram extraction, HPHT-qualified elastomer fit, reassembly to OEM torque chart, function test on the bench.' },
        { name: 'Hassan Al Awadi', role: 'HPHT Trim Specialist', location: 'Jebel Ali', scope: 'Hub-face re-machining on bonnets, charpy specimen prep, operating cylinder hone and reseal, HPHT-trim sourcing from OEM.' },
      ],
      'Case file · Service offering · 15K HPHT BOP recertification · Standard SOP-OG-019 Rev 04 · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'There is "rated for 15K" and there is "qualified for 15K at 177°C in 30% H₂S". The first sells a stack. The second keeps it on a Hail & Ghasha well. We make sure the paperwork in our recert pack reads the second sentence, not the first.',
  pullQuoteAuthor: 'Fatima Al Mansoori',
  pullQuoteRole: 'HPHT Engineering Authority',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset class', value: '13-5/8" / 18-3/4" 15K HPHT' },
    { label: 'OEMs', value: 'Cameron UII / TL · Shaffer NXT-15K · NOV' },
    { label: 'Service', value: 'Sour gas · NACE MR0175 / ISO 15156' },
    { label: 'Working pressure', value: '15,000 psi cold' },
    { label: 'Hydrotest', value: '22,500 psi · 30 min' },
    { label: 'HPHT envelope', value: '−29°C to 177°C typ' },
    { label: 'Body material', value: 'AISI 4130 + Inconel-625 cladding' },
    { label: 'Bonnet bolting', value: 'A193 B7M / 2HM · EN 10204 3.2' },
    { label: 'Elastomers', value: 'HNBR / AFLAS · HPHT-qualified' },
    { label: 'Standard', value: 'API 16A + HPHT addendum · API STD 53' },
    { label: 'Charpy partner', value: 'ISO 17025 mech-test lab · witnessed' },
    { label: 'TAT', value: '8 — 14 weeks on bench' },
  ],
  galleryTotalCount: 36,
  downloads: [
    { label: 'HPHT scope template (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'HPHT findings report sample (PDF)', url: '#', size: '24 pp', format: 'PDF' },
    { label: 'Charpy + hardness ledger sample (ZIP)', url: '#', size: '18 MB', format: 'ZIP' },
    { label: 'HPHT recert pack sample (PDF)', url: '#', size: '~200 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · Service offering · 15K HPHT BOP recertification · Standard SOP-OG-019 Rev 04 · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Specialist 15K HPHT BOP recertification at our Jebel Ali workshop — Cameron UII / Shaffer NXT-15K class — with full API 16A HPHT addendum requalification for ADNOC Hail & Ghasha (H₂S to 30%), Saudi Aramco Jafurah and PDO Khazzan / Ghazeer sour-gas reservoirs.',
  cardOutcomePills: [
    { label: 'Hydrotest 22,500 psi · 0 drop', style: 'good' },
    { label: 'Charpy + NACE on every metallic', style: 'good' },
    { label: 'API 16A HPHT recert · 5 yr', style: 'accent' },
    { label: 'HNBR / AFLAS · HPHT-qualified', style: 'neutral' },
  ],
  cardDurationLabel: '8-14 WEEK CYCLE',
  cardTagStyle: 'oil',
  cardTagLabel: '15K HPHT BOP',

  durationDays: 84,

  seoTitle: '15K HPHT BOP Service · API 16A HPHT Recertification · Hail & Ghasha · Jafurah · Khazzan · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Specialist 15,000 psi HPHT BOP recertification at our Jebel Ali workshop for the GCC\'s most demanding sour-gas reservoirs — ADNOC Hail & Ghasha (H₂S up to 30%), Saudi Aramco Jafurah unconventional sour gas, PDO Khazzan / Ghazeer tight gas. Cameron UII / Shaffer NXT-15K / 18-3/4" subsea class. Full API 16A recert with HPHT addendum scope: charpy V-notch impact testing on every HPHT-trim metallic at the low-temperature design point, NACE MR0175 hardness on every body / ram / fastener, HNBR or AFLAS elastomer qualification at the operator\'s actual reservoir envelope, 22,500 psi hydrotest, ~200-page HPHT recert pack. 8-14 week cycle.',
  focusKeyword: '15K HPHT BOP service recertification hail ghasha jafurah jebel ali',
}

export default CASE
