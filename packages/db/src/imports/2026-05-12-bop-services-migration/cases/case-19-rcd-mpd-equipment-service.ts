/**
 * Case 19 — Rotating Control Device (RCD) service & MPD equipment support
 * 2026-05-12 (BOP services migration wave)
 *
 * Indus's RCD service supports Managed Pressure Drilling on tight-gas, depleted-reservoir
 * and unconventional plays across the GCC. We service Weatherford SafeShield, SLB SecureDrill,
 * NOV-Williams Quest and Halliburton GeoBalance assets out of Jebel Ali — passive seal element
 * renewal, bearing stack rebuild, hydrostatic shell test, full RPM function test, and the
 * MPD ancillary equipment that lives downstream of the RCD.
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
  slug: 'rotating-control-device-rcd-service-mpd-equipment-support',
  caseNumber: '19',
  isFeatured: false,
  category: 'bop_pressure_control',
  topicLabel: 'BOP & Pressure Control · RCD · MPD',
  region: '🇦🇪 UAE · Jebel Ali · MPD-active fields',
  caseDateLabel: 'PER-ASSET · ROLLING SCHEDULE',
  title: 'The RCD service line that keeps Managed Pressure Drilling inside its narrow window — passive seals, bearings, and the ancillary kit downstream.',
  titleAccent: 'inside its narrow window',
  deck: 'Indus services Rotating Control Devices and the MPD equipment downstream of them — Weatherford SafeShield, SLB SecureDrill, NOV-Williams Quest and Halliburton GeoBalance assets — for operators drilling Jafurah unconventional sour gas, Khazzan and Ghazeer tight gas, and Hail & Ghasha narrow-margin ultra-sour. Passive seal renewal, bearing rebuild, choke and NRV qualification, all NACE MR0175 sour-service rated.',

  heroImageCaption: 'FIG. 01 · A Weatherford SafeShield RCD on the bench — bonnet retainer off, passive seal element exposed for measurement before extraction',
  heroImageCredit: 'PHOTO · O. AL MAKTOUM · 2026-04-22',

  metaCells: [
    { label: 'Asset', value: 'RCD', valueSmall: ' · 4 OEM families', style: 'neutral' },
    { label: 'Function test', value: '200', valueSmall: ' · rpm', style: 'neutral' },
    { label: 'Annular WP', value: '500–2,500', valueSmall: ' · psi', style: 'neutral' },
    { label: 'Cycle', value: '2–6', valueSmall: ' wks · per asset', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'A consumable that the well treats like a structural part.'),
    lead(
      'A Rotating Control Device is a deceptively simple piece of equipment. A passive elastomer seal, two bearing stacks, a containment ring, a pressure-rated body — and a job description that asks it to hold annular pressure on a rotating drill string for the full length of an MPD section. The seal is a <strong>consumable</strong>. Typical life is 50 to 200 rotating hours depending on RPM, mud abrasiveness, H₂S partial pressure, and which compound the operator chose. The well doesn\'t care that it\'s a consumable. The well treats it like a structural part.',
    ),
    para(
      'Managed Pressure Drilling exists because the conventional ECD window — the gap between pore pressure and fracture pressure — has closed on a lot of the GCC\'s remaining gas reserves. <strong>Jafurah unconventional sour gas</strong>, <strong>Khazzan and Ghazeer tight gas</strong>, <strong>Hail & Ghasha ultra-sour with narrow margins</strong>: these are wells that cannot be drilled with a static mud weight. The annulus has to be actively pressurised, and the RCD is what makes that possible. Which is why operators care, urgently, about how the RCD comes back from a service — and which is why the seal life data the operator hands us at intake is rarely complete.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Just put a new seal in it."',
        body: 'A typical RCD comes off the rig with a torn or badly worn passive seal element, sometimes a bearing complaint, and a request to "swap the seal kit and send it back." The schedule pressure is real — MPD spreads cost a lot per day. The seal-only narrative is appealing.',
      },
      {
        label: 'What the inspection actually finds',
        title: 'Bearings tired, ring scored, H₂S history in the elastomer',
        body: 'On most assets we strip the bearing stack and find at least one race showing brinelling or scoring from running the seal past its useful life. The pressure containment ring usually carries DPI-visible marks. The retired seal compound is often the wrong grade for the H₂S exposure the well actually saw. Seal-only is rarely the right scope.',
      },
    ),
    para(
      'This is the engineering case for sending an inspection engineer to look at the asset before the kitting clerk pulls a seal. We do RCD work this way for every operator we service: <strong>strip first, scope second, kit third</strong>. The standard seal-only swap is a service we offer; it\'s also a service we recommend roughly 20% of the time. The other 80% needs more.',
    ),

    sectionHead('/02', 'solution', 'A full RCD scope, plus the MPD equipment that lives downstream.'),
    para(
      'Our standard per-asset RCD scope: passive seal element renewal in the correct compound for the operator\'s sour-service exposure (HNBR for moderate H₂S, AFLAS for elevated, FKM where temperature drives the choice); upper and lower bearing stack service — thrust and radial — with new races and rolling elements; pressure containment ring inspection with DPI on every sealing surface; full hardness verification on every metallic per <strong>NACE MR0175 / ISO 15156</strong> at <strong>≤ 22 HRC</strong>; hydrostatic shell test at <strong>1.5× rated working pressure</strong> with a 30-minute hold; and a function test that runs the unit at full RPM (typically up to <strong>200 rpm</strong>) under full annular pressure (operator-specified between <strong>500 and 2,500 psi</strong>) with mud or test fluid through the bore. We service the four OEM families that dominate the GCC: <strong>Weatherford SafeShield</strong>, <strong>SLB SecureDrill</strong>, <strong>NOV-Williams Quest</strong>, and <strong>Halliburton GeoBalance</strong>. OEM seal kits, OEM bearings, OEM-traceable consumables — no aftermarket on the wear surfaces.',
    ),
    para(
      'The RCD doesn\'t work alone. We extend the same workshop scope to the MPD ancillary equipment that lives downstream of it: the <strong>choke manifold control system</strong> (Coriolis flow, choke positioner calibration, PLC firmware verification), <strong>non-return valve testing</strong> (back-pressure verification per the well control plan), and the <strong>MPD riser system</strong> (joint inspection, flange face condition, gasket renewal). Operators that bring us the RCD alone end up bringing us the choke system on the next trip — at this point most just send the full MPD package together. <strong>API STD 53</strong> coverage of MPD equipment is still emerging; we run our SOP against the current revision and OEM service manuals in combination.',
    ),
    figure(
      'A passive seal element on the bench mid-inspection. The taper deformation along the upper sealing lip is the classic signature of running a seal past its useful rotating-hour life — common on tight-gas wells with long sections.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"RCD passive seal element on inspection bench, taper deformation visible\\n1200×675"',
      },
    ),
    pullQuote(
      'Seal life on an RCD is not a number, it\'s a band. Rotating hours, mud abrasiveness, H₂S partial pressure, the compound the operator picked, the section length — all of those move the band. Which is why we track every one of them on the asset history sheet, and why we ask before we kit.',
      '— Fatima Al Mansoori · MPD Engineering Lead · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Four phases per asset, two to six weeks bench TAT.'),
    para(
      'Every RCD that lands at our Jebel Ali workshop runs the same four-phase sequence. The total bench time is two to six weeks per asset depending on the OEM, the sour-service compound lead time, and whether the MPD ancillary kit is in scope.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Receipt, history & strip',
        body: 'Asset off the truck, weighed, photographed. Operator asset-history sheet logged: rotating hours, H₂S exposure, compound on retirement, last service date. Bonnet retainer off, seal extracted, bearing stack out.',
        duration: 'Days 0 — 3',
      },
      {
        number: 'PHASE 02',
        title: 'NDT, dimensional & scoping',
        body: 'MPI on body and containment ring, DPI on all sealing surfaces, UT thickness on the body wall, hardness Rockwell C on every forging. Findings written up, scope confirmed with operator inside 72 h.',
        duration: 'Days 4 — 9',
      },
      {
        number: 'PHASE 03',
        title: 'Rebuild & sour-service kit',
        body: 'New passive seal in the correct compound, new bearing races and rolling elements, containment ring reconditioned where in tolerance or replaced. Reassembled to OEM torque chart with every fastener logged.',
        duration: 'Days 10 — 18',
      },
      {
        number: 'PHASE 04',
        title: 'Hydrotest, function & MPD ancillary',
        body: 'Hydrostatic shell at 1.5× WP, 30-min hold. Function test to 200 rpm at full annular pressure. MPD choke / NRV / riser tested in parallel where in scope. FAT pack issued, low-loader to the rig.',
        duration: 'Days 19 — 21',
      },
    ]),

    sectionHead('/04', 'sop', 'The standard SOP every RCD runs through.'),
    para(
      'The procedure below is the workshop SOP we run on every RCD, regardless of OEM. The OEM-specific torque values, bearing pre-load and seal install fixtures live in the relevant Weatherford / SLB / NOV-Williams / Halliburton service manual; this SOP is the wrapper that ensures every asset gets the same scope of inspection, test and certification.',
    ),
    sopBlock(
      'SOP-OG-022 · RCD SERVICE & MPD ANCILLARY SUPPORT · REV 04 · NACE',
      '18 / 18 COMPLETE',
      [
        {
          name: 'Phase 01 · Receipt & strip',
          rows: [
            { task: 'Goods-in & asset history sheet', detail: 'Weighbridge, photo log, operator-supplied rotating hours, H₂S exposure, compound retired', who: 'Y. AL HASHIMI', tool: 'Crane bay' },
            { task: 'Sour-service classification confirm', detail: 'H₂S partial pressure from operator gas data — NACE MR0175 / ISO 15156 scope set', who: 'F. AL MANSOORI', tool: 'Operator data' },
            { task: 'Bonnet retainer break-out', detail: 'Hydraulic torque, OEM sequence; passive seal extracted intact for inspection where possible', who: 'O. AL MAKTOUM', tool: 'HYTORC' },
            { task: 'Bearing stack extraction', detail: 'Upper + lower thrust + radial bearings out; races and rolling elements bagged for inspection', who: 'O. AL MAKTOUM', tool: 'Hydraulic press' },
          ],
        },
        {
          name: 'Phase 02 · NDT, dimensional & scoping',
          rows: [
            { task: 'MPI · body & containment ring', detail: 'Wet fluorescent on every ferrous part; per ASME V Art. 7; logged with operator and location', who: 'A. AL SUWAIDI', tool: 'MPI bench' },
            { task: 'DPI · all sealing surfaces', detail: 'Containment ring, body seal grooves, bonnet seal lands; per ASME V Art. 6', who: 'A. AL SUWAIDI', tool: 'DPI kit' },
            { task: 'UT thickness · body wall', detail: 'Min wall vs OEM scrap dim; grid pattern, 20 readings minimum per body', who: 'A. AL SUWAIDI', tool: 'UT gauge' },
            { task: 'Hardness Rockwell C · NACE', detail: 'All forgings tested ≤ 22 HRC; bearing housings, bonnet, body — every reading logged', who: 'A. AL SUWAIDI', tool: 'Hardness tester' },
            { task: 'Findings report & operator scope confirm', detail: 'One row per finding, photo, recommendation; operator countersign within 72 h to release Phase 03', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
        {
          name: 'Phase 03 · Rebuild & sour-service kit',
          rows: [
            { task: 'Passive seal element · correct compound', detail: 'HNBR / FKM / AFLAS per H₂S exposure and temperature; OEM-sourced; EN 10204 3.1 cert', who: 'O. AL MAKTOUM', tool: 'OEM kit' },
            { task: 'Upper & lower bearing rebuild', detail: 'New races and rolling elements; pre-load to OEM spec; rotation check by hand pre-install', who: 'O. AL MAKTOUM', tool: 'OEM bearings' },
            { task: 'Containment ring service', detail: 'Reconditioned to OEM datum where in tolerance; replaced where DPI-flagged; surface Ra ≤ 0.4 µm', who: 'H. AL AWADI', tool: 'CNC mill' },
            { task: 'Reassemble per OEM sequence', detail: 'Bonnet retainer torqued in sequence; calibrated wrench; every fastener logged with reading', who: 'O. AL MAKTOUM', tool: 'Calibrated TQ' },
          ],
        },
        {
          name: 'Phase 04 · Hydrotest, function & MPD ancillary',
          rows: [
            { task: 'Hydrostatic shell test · 1.5× rated WP', detail: 'Full hold 30 min · zero pressure drop measured at 0.1% gauge resolution; chart retained', who: 'A. AL SUWAIDI', tool: 'Hydrotest rig' },
            { task: 'Function test · full RPM under pressure', detail: 'Up to 200 rpm at operator-specified annular pressure; bearing temp & vibration monitored', who: 'O. AL MAKTOUM', tool: 'Function rig' },
            { task: 'MPD choke manifold (when in scope)', detail: 'Coriolis flow calibration, choke positioner zero & span, PLC firmware version logged', who: 'H. AL AWADI', tool: 'Calibration rig' },
            { task: 'NRV testing (when in scope)', detail: 'Back-pressure verification at well control plan setpoint; leak-rate < 5 ml/min', who: 'H. AL AWADI', tool: 'NRV test bench' },
            { task: 'FAT pack & sour-service certs', detail: 'NDT records, hardness logs, hydrotest curve, function chart, NACE MR0175 traceability', who: 'F. AL MANSOORI', tool: 'PDF' },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'Typical findings on a returning RCD asset.'),
    para(
      'Below is what we measure on a representative RCD coming back from an MPD section in the GCC. The first three rows are highlighted because they are the recurring safety findings — the issues that close out scoping conversations and turn "seal-only" into the full service scope.',
    ),
    specTable(
      'TYPICAL FINDINGS · RCD RETURN FROM MPD SECTION · SOUR SERVICE',
      [
        {
          component: 'Passive seal element',
          spec: 'OEM compound for H₂S exposure',
          asFound: 'End-of-life · taper deformation',
          afterRebuild: 'New OEM seal · correct compound',
          status: '↻ Renewed',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Upper bearing race',
          spec: 'No brinelling / DPI clean',
          asFound: 'Brinelling at 4 positions',
          afterRebuild: 'New race · DPI clean',
          status: '↻ Replaced',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Pressure containment ring',
          spec: 'No cracks · Ra ≤ 0.4 µm',
          asFound: 'Light scoring · Ra 0.9 µm',
          afterRebuild: 'Re-machined · Ra 0.32 µm',
          status: '↻ Reconditioned',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Lower bearing race',
          spec: 'No brinelling / DPI clean',
          asFound: 'DPI clean',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Body hardness · all locations',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '20.1 — 21.4 HRC',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Bonnet retainer hardness',
          spec: '≤ 22 HRC',
          asFound: '21.0 HRC avg',
          afterRebuild: 'No change · in spec',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Body wall UT thickness · min',
          spec: '≥ 95% of OEM nominal',
          asFound: '97.6% of nominal',
          afterRebuild: 'No change · pass',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Seal compound vs operator H₂S',
          spec: 'AFLAS for > 5% H₂S',
          asFound: 'HNBR retired · marginal',
          afterRebuild: 'AFLAS installed · correct',
          status: '↻ Compound corrected',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hydrostatic shell test',
          spec: '1.5× rated WP · 30 min hold',
          asFound: '—',
          afterRebuild: 'Full hold · 0 psi drop',
          status: '✓ Pass',
          afterStyle: 'good',
        },
        {
          component: 'Function test · 200 rpm',
          spec: 'Bearing temp ≤ 80°C',
          asFound: '—',
          afterRebuild: '62°C steady at full RPM',
          status: '✓ Pass',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Asset back on the rig with a service history a planner can trust.'),
    para(
      'A typical RCD comes off our test bench with a fresh passive seal in the right sour-service compound, two rebuilt bearing stacks, a hydrotest chart at 1.5× WP, and a function test record showing the unit running steady at 200 rpm under operator-specified annular pressure. The MPD ancillary equipment — choke manifold, NRVs, riser joints — comes back to the rig with the same paperwork standard. The asset history sheet gets updated with the rotating hours retired against the seal compound used, so the next planner has actual data to work from instead of an OEM nominal life.',
    ),
    resultBox(
      'Result · summary',
      'Per-asset RCD service across four OEM families, with the MPD ancillary equipment that lives downstream — sour-service rated, hydrotested, function-tested at full RPM.',
      'OEM-traceable seal kits, NDT-cleared bearings, NACE MR0175 hardness verification, hydrotest at 1.5× rated WP held 30 minutes, function test to 200 rpm under full annular pressure, FAT pack with sour-service traceability. Bench TAT 2 to 6 weeks per asset depending on OEM lead time and ancillary scope.',
      [
        { value: '21', valueSmall: ' days', label: 'Typical bench TAT', style: 'accent' },
        { value: '4', label: 'OEM families serviced', style: 'good' },
        { value: '200', valueSmall: ' rpm', label: 'Function test RPM', style: 'good' },
        { value: '1.5×', valueSmall: ' WP', label: 'Hydrotest factor' },
      ],
    ),

    sectionHead('/07', 'team', 'The crew that runs the RCD bench.'),
    teamList(
      'Five engineers carry the RCD service line at our Jebel Ali workshop. The role profile below is the standard crew composition for any RCD plus MPD ancillary work order — names rotate by availability but the role coverage is constant.',
      [
        { name: 'Fatima Al Mansoori', role: 'MPD Engineering Lead', location: 'Jebel Ali', scope: 'Asset history review, sour-service compound selection, scope-confirmation calls with the operator, FAT pack sign-off and MPD section data feedback.' },
        { name: 'Yusuf Al Hashimi', role: 'Workshop Manager', location: 'Jebel Ali', scope: 'Goods-in, OEM kit lead-time management, bay scheduling across the four OEM families, low-loader release back to the rig.' },
        { name: 'Omar Al Maktoum', role: 'RCD Technician', location: 'Jebel Ali', scope: 'Strip-down, bonnet retainer break-out, bearing extraction, seal install, reassembly to OEM torque chart, function-test operation.' },
        { name: 'Aisha Al Suwaidi', role: 'NDT / Sealing Element Inspection', location: 'Jebel Ali', scope: 'MPI, DPI, UT thickness, hardness Rockwell C; passive seal element forensics on retirement; signs every NDT record on every asset.' },
        { name: 'Hassan Al Awadi', role: 'MPD Ancillary Specialist', location: 'Jebel Ali', scope: 'Choke manifold calibration, NRV bench testing, MPD riser joint inspection, containment ring re-machining when within recovery tolerance.' },
      ],
      'Service file · INTAKE-ROLLING-RCD · WO-2026-RCD-NN · Published 2026-05-12 · Updated 2026-05-12',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText: 'People look at an RCD passive seal and see a $4,000 elastomer ring. What it actually is, is a 50-to-200-hour structural part that controls annular pressure on a rotating drill string. Treat it like a structural part on the bench and the well will let you treat it like a consumable on the rig.',
  pullQuoteAuthor: 'Fatima Al Mansoori',
  pullQuoteRole: 'MPD Engineering Lead',
  pullQuoteLocation: 'JEBEL ALI',

  specsAtGlance: [
    { label: 'Asset class', value: 'Rotating Control Device' },
    { label: 'OEM families', value: 'Weatherford / SLB / NOV-Williams / Halliburton' },
    { label: 'Service', value: 'Sour gas / NACE MR0175' },
    { label: 'Annular WP', value: '500 — 2,500 psi typical' },
    { label: 'Hydrotest', value: '1.5× rated WP · 30 min' },
    { label: 'Function test', value: 'Up to 200 rpm under pressure' },
    { label: 'Seal compounds', value: 'HNBR / FKM / AFLAS' },
    { label: 'Bonnet bolting', value: 'A193 B7M / 2HM' },
    { label: 'Standards', value: 'API STD 53 (emerging) · OEM service manuals' },
    { label: 'Bench TAT', value: '2 — 6 weeks per asset' },
  ],
  galleryTotalCount: 32,
  downloads: [
    { label: 'RCD service scope (PDF)', url: '#', size: '6 pp', format: 'PDF' },
    { label: 'OEM family coverage matrix (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'Sour-service compound guide (PDF)', url: '#', size: '8 pp', format: 'PDF' },
    { label: 'Sample FAT pack (PDF)', url: '#', size: '54 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Service file · INTAKE-ROLLING-RCD · WO-2026-RCD-NN · Published 2026-05-12 · Updated 2026-05-12',

  cardOneLiner: 'Per-asset Rotating Control Device service for MPD operations across the GCC — Weatherford, SLB, NOV-Williams and Halliburton families. Passive seal renewal, bearing rebuild, containment ring inspection, hydrotest at 1.5× WP, function test at 200 rpm under full annular pressure. Plus the MPD ancillary kit downstream.',
  cardOutcomePills: [
    { label: '4 OEM families serviced', style: 'good' },
    { label: 'Function test 200 rpm under pressure', style: 'good' },
    { label: 'NACE MR0175 sour service', style: 'accent' },
    { label: 'MPD ancillary in scope', style: 'neutral' },
  ],
  cardDurationLabel: '2-6 WEEK CYCLE',
  cardTagStyle: 'oil',
  cardTagLabel: 'RCD / MPD',

  durationDays: 21,

  seoTitle: 'Rotating Control Device (RCD) Service & MPD Equipment Support · Weatherford SafeShield · SLB SecureDrill · NOV-Williams Quest · Halliburton GeoBalance · Jebel Ali · Indus Hydraulics',
  seoDescription: 'Per-asset RCD service for Managed Pressure Drilling operations across the GCC. Weatherford SafeShield, SLB SecureDrill, NOV-Williams Quest and Halliburton GeoBalance families. Passive seal renewal in correct sour-service compound, upper and lower bearing rebuild, pressure containment ring inspection, hydrotest at 1.5× rated WP, function test up to 200 rpm at full annular pressure. MPD choke manifold, NRV testing and riser inspection in scope. NACE MR0175 / ISO 15156 sour-service certified. 2 to 6 week bench TAT at our Jebel Ali workshop.',
  focusKeyword: 'rotating control device RCD service MPD managed pressure drilling jebel ali',
}

export default CASE
