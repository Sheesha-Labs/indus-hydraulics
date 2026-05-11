/**
 * Case 02 — Mud Pump Fluid End Rebuild · 12-P-160 · Bab Field
 * 2026-05-11
 *
 * An ADNOC Onshore drilling contractor mobilised a triplex mud pump fluid end
 * to Jebel Ali after the rig crew called the deck scrap and asked for a quote
 * on a new one. Inspection found the deck reusable; the rebuild went out at
 * 37% of replacement cost, eleven days on the bench, hydrotested to 7,500 psi.
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
  slug: 'mud-pump-fluid-end-rebuild-12-p-160',
  caseNumber: '02',
  isFeatured: false,

  category: 'pumps',
  topicLabel: 'Pumps · Mud Pump · Oilfield',
  region: '🇦🇪 UAE · Jebel Ali',
  caseDateLabel: 'APR 2026 · BAY 4 / WORKSHOP',
  title: 'A 12-P-160 fluid end the operator wanted to scrap — and the AED 1.4 million we talked them out of spending.',
  titleAccent: 'AED 1.4 million we talked them out of spending',
  deck: 'An ADNOC Onshore contractor at the Bab field shipped a triplex mud pump fluid end into our Jebel Ali bay with a single line of paperwork: "deck scrap, send a quote on a new one." Eleven days later the same deck was back on a low-loader, hydrotested to 7,500 psi and warrantied for twelve months — at 37% of new-build cost.',

  heroImageCaption: 'FIG. 01 · 12-P-160 fluid end on the rebuild bench, day 7 — liners out, valve seats lapped',
  heroImageCredit: 'PHOTO · Y. AL HASHIMI · 2026-04-09',

  metaCells: [
    { label: 'Asset', value: '12-P-160', valueSmall: ' · triplex fluid end', style: 'neutral' },
    { label: 'Liner bore', value: '5½″', valueSmall: ' · 12″ stroke', style: 'neutral' },
    { label: 'Valves replaced', value: '24', valueSmall: ' · 12 seats + 12 valves', style: 'neutral' },
    { label: 'Turnaround', value: '11', valueSmall: ' days', style: 'accent' },
    { label: 'H₂S service', value: 'NACE MR0175', style: 'good' },
  ],

  bodyBlocks: [
    sectionHead('/01', 'problem', 'The fluid end the operator was ready to scrap.'),
    lead(
      'The intake form was a single sentence. <strong>"Deck scrap on 12-P-160 unit BAB-MP-04, send quote on new fluid end."</strong> The rig crew at Bab had been pulling sand-laden mud through this pump for eighteen months without a redress, the liners were chewed out, and somewhere between the rig floor and the dispatch desk the verdict on the deck — the heavy central body that holds the liners and valves — had hardened into a fact. New fluid end list price: AED 3.8 million.',
    ),
    para(
      'The unit landed in our Jebel Ali yard on a Monday morning, low-loaded down from the Bab field by an ADNOC Onshore drilling contractor running a 1,500 hp triplex on a sour-gas development well. The pump itself was a National-class triplex, 12″ stroke, 5,000 psi MAWP, the same fluid-end family that has been on Gulf rigs for thirty years. We pressure-washed the deck on Tuesday morning and sent an inspection engineer over with a coordinate measuring arm before anyone wrote a single line of a quote.',
    ),
    problemSolution(
      {
        label: 'What the operator told us',
        title: '"Deck is scrap. Quote a new fluid end. Need it on the rig in three weeks."',
        body: 'Drilling contractor pulled the unit after a liner blew through; rig superintendent looked at the washouts inside the deck cavity and called for a replacement fluid end. PO desk was already pricing a new National-class deck assembly at AED 3.8M list. Three-week skid date locked in.',
      },
      {
        label: 'What the inspection actually found',
        title: 'Liner bores washed out. Deck body within OEM tolerance. Reusable.',
        body: 'CMM survey showed deck flatness at 0.04 mm/m (OEM limit 0.05). Suction-discharge bridge web within hardness spec. Liner bore washouts and seat-pocket erosion were real but consumable-side — replace liners, seats, valves, manifold cap, full elastomer pack and you keep the deck.',
      },
    ),
    para(
      'This is the case for sending an inspection engineer before you sign a purchase order. The deck on a 12-P-160 is the most expensive piece of forged carbon steel on the entire pump skid. It is also the part that fails last. What fails first is everything bolted into it — liners, seats, valves, packing — and on a sour-service well that has not been redressed since 2024, all of those things had failed at once. The operator was reading the symptoms and condemning the wrong patient.',
    ),

    sectionHead('/02', 'solution', 'What we replaced. What we kept.'),
    para(
      'We kept the deck. We kept the suction and discharge cover bolting (after Charpy V-notch retest on three random studs). Everything else came out and went back in new. Three liners at <strong>5½″ bore × 12″ stroke</strong>, six suction valves and six discharge valves, all twelve valve seats lapped to a fresh sealing surface, the suction manifold cap (which had a hairline crack at the inboard threaded port — easier to replace than to weld), and the full elastomer pack in <strong>HNBR sour-service grade</strong> for rod packing, valve packing and the gland o-rings. Bolting to <strong>ASTM A193 B7M</strong> studs with <strong>2HM</strong> nuts on every flange make-up, mill-test certs to <strong>EN 10204 3.1</strong>. Re-stamped MIT (manufacturer\'s identification &amp; test) per <strong>API 7K</strong> on the rebuilt assembly, signed by our QA and witnessed by the operator\'s third-party inspector.',
    ),
    para(
      'The deck itself went through a full NDT pass before we put a single new part back into it: <strong>magnetic particle inspection</strong> on every load-bearing face, <strong>ultrasonic thickness</strong> on the inter-bore webs, <strong>dye penetrant</strong> around the liner pockets and the gland bores. Hardness checked at 22 HRC max per NACE MR0175 in eight locations on the deck and on the suction manifold replacement. Two of the original eight stud holes in the discharge cover face had thread damage; we re-tapped one and inserted the second with a Heli-Coil. None of that is glamorous and none of it costs AED 3.8 million.',
    ),
    figure(
      'Day 7 — three new liners staged for installation alongside the rebuilt deck. The deck flatness datum is checked one more time with the bore-pocket faces machined clean, then liners go in dry-fit before final assembly with HNBR packing.',
      {
        captionPrefix: 'FIG. 02',
        placeholderLabel: '"Three 5½″ liners staged next to a rebuilt fluid end deck on the bench, Bay 4\\n1200×675"',
      },
    ),
    pullQuote(
      'Replacing a fluid end deck looks cheap on the quote line until you actually inspect what is wrong versus what is right. On this one, what was wrong cost AED 1.4 million less than what the operator thought was wrong.',
      '— Yusuf Al Hashimi · Workshop Manager · Jebel Ali',
    ),

    sectionHead('/03', 'approach', 'Eleven days on the bench, four phases.'),
    para(
      'Every fluid-end rebuild we run goes through the same four phases. The names don\'t change. The clock changes — this one was tight because the rig had a sour-gas development well booked at Bab for the second week of May and we had no margin past day 11.',
    ),
    approachGrid([
      {
        number: 'PHASE 01',
        title: 'Mobilise & inspect',
        body: 'Strip wash, CMM survey of deck flatness and bore geometry, full NDT pass (MPI, UT, DP), hardness map. Intake report on the operator\'s desk inside 48 h.',
        duration: 'Days 0 — 2',
      },
      {
        number: 'PHASE 02',
        title: 'Quote & PO release',
        body: 'Two-option quote: rebuild path (recommended) versus new-build path (the one they asked for). Photos of the deck datum survey attached. PO released day 4 morning.',
        duration: 'Days 3 — 4',
      },
      {
        number: 'PHASE 03',
        title: 'Rebuild & hydrotest',
        body: 'Liner pockets re-machined, three new liners fit, twelve valve seats lapped, full elastomer change, manifold cap swapped. Hydrotest at 7,500 psi held 30 minutes.',
        duration: 'Days 5 — 9',
      },
      {
        number: 'PHASE 04',
        title: 'Function-test & release',
        body: 'Stroke length verified end-to-end, MIT re-stamp per API 7K, sign-off pack issued, low-loader booked. Unit on the rig pad by day 13, skidding by day 14.',
        duration: 'Days 10 — 11',
      },
    ]),

    sectionHead('/04', 'sop', 'The SOP we followed, line by line.'),
    para(
      'Below is the abridged SOP-OG-022 for a triplex mud-pump fluid-end rebuild on sour service. The full procedure runs 38 lines; this is the subset that was ticked off on this work order, witnessed by both our QA and the operator\'s third-party inspector.',
    ),
    sopBlock(
      'SOP-OG-022 · MUD PUMP FLUID END REBUILD · REV 04 · NACE',
      '24 / 24 COMPLETE',
      [
        {
          name: 'Phase 01 · Mobilise & inspect',
          rows: [
            {
              task: 'Strip wash & visual map',
              detail: 'Deck steam-cleaned; every face photographed and tagged before any teardown',
              who: 'O. AL MAKTOUM',
              tool: 'Wash bay',
            },
            {
              task: 'CMM survey · deck datum',
              detail: 'Deck flatness 0.04 mm/m (OEM ≤ 0.05); bore-pocket co-planarity within 0.03 mm',
              who: 'A. AL SUWAIDI',
              tool: 'CMM arm',
            },
            {
              task: 'NDT pass · MPI / UT / DP',
              detail: 'Magnetic particle on load faces, ultrasonic on inter-bore webs, DP around liner pockets',
              who: 'H. AL AWADI',
              tool: 'NDT bay',
            },
            {
              task: 'Hardness survey · 8 points',
              detail: 'All readings ≤ 22 HRC per NACE MR0175; deck cleared for sour service',
              who: 'H. AL AWADI',
              tool: 'Equotip',
            },
            {
              task: 'Intake report issued (PDF)',
              detail: '18 pp · datum survey, NDT findings, recommended scope, 2-option cost compare',
              who: 'Y. AL HASHIMI',
              tool: 'PDF',
            },
          ],
        },
        {
          name: 'Phase 02 · Quote & PO release',
          rows: [
            {
              task: 'Two-option quote issued',
              detail: 'Rebuild AED 1.41M vs new fluid end AED 3.80M list — savings of AED 2.39M on parts, time-on-bench equal',
              who: 'SALES',
              tool: 'PDF',
            },
            {
              task: 'Customer PO received',
              detail: 'Rebuild path approved; LOI on file dated 2026-04-04 11:20 GST; ADNOC vendor cert verified',
              who: 'SALES',
              tool: 'Email',
            },
          ],
        },
        {
          name: 'Phase 03 · Rebuild & hydrotest',
          rows: [
            {
              task: 'Re-machine 3× liner pockets',
              detail: 'Skim cut to clean sealing land, surface finish Ra 0.8 µm, OEM datum held',
              who: 'A. AL SUWAIDI',
              tool: 'Vertical mill',
            },
            {
              task: 'Lap 12× valve seats',
              detail: 'Suction + discharge seats lapped to 0.4 µm Ra; sealing band continuous on every seat',
              who: 'O. AL MAKTOUM',
              tool: 'Lapping plate',
            },
            {
              task: 'Fit 3× new liners (5½″ bore)',
              detail: 'OEM-spec hardened liners, dry-fit checked, HNBR packing seated cold; runout 0.04 mm at bore',
              who: 'O. AL MAKTOUM',
              tool: 'Press fit',
            },
            {
              task: 'Fit 12× valves + 12× seats',
              detail: 'Six suction, six discharge; spring rates on every valve within ± 6% of OEM',
              who: 'O. AL MAKTOUM',
              tool: 'Hand fit',
            },
            {
              task: 'Replace suction manifold cap',
              detail: 'Original had hairline crack at inboard threaded port; new cap to OEM spec, MTC EN 10204 3.1',
              who: 'O. AL MAKTOUM',
              tool: 'Bench',
            },
            {
              task: 'Bolt up · ASTM A193 B7M studs',
              detail: 'All flange make-ups to torque chart; 2HM nuts, anti-seize, ten-pass cross pattern',
              who: 'O. AL MAKTOUM',
              tool: 'Hyd. wrench',
            },
            {
              task: 'Hydrotest at 7,500 psi',
              detail: '1.5× MAWP, held 30 min, leak rate < 5 ml/min, witnessed by client TPI',
              who: 'A. AL SUWAIDI',
              tool: 'Hydro rig',
            },
          ],
        },
        {
          name: 'Phase 04 · Function-test & release',
          rows: [
            {
              task: 'Stroke length verification',
              detail: '12.00″ stroke checked on all three plungers; deviation < 0.5 mm end-to-end',
              who: 'K. AL MARZOUQI',
              tool: 'Dial gauge',
            },
            {
              task: 'MIT re-stamp · API 7K',
              detail: 'Manufacturer Identification & Test plate re-stamped, serial chain preserved, traceable to deck SN',
              who: 'H. AL AWADI',
              tool: 'Stamp set',
            },
            {
              task: 'Sign-off pack issued',
              detail: '38 pp · CMM survey, NDT certs, hardness map, hydrotest curve, MTC pack, photos × 42',
              who: 'Y. AL HASHIMI',
              tool: 'PDF + paper',
            },
            {
              task: 'Client-witnessed release',
              detail: 'Operator HSE rep + TPI present; ADNOC vendor cert verified at gate',
              who: 'K. AL MARZOUQI',
              tool: 'On-site',
            },
            {
              task: 'Low-loader dispatch',
              detail: 'Unit secured, sour-service tag fitted, escort booked Jebel Ali → Bab field for day 13 arrival',
              who: 'Y. AL HASHIMI',
              tool: 'Logistics',
            },
          ],
        },
      ],
    ),

    sectionHead('/05', 'technicals', 'The numbers, before and after.'),
    para(
      'Below is what we measured on the deck, the bores, the seats and the new consumables, against OEM and NACE MR0175. Four findings are highlighted: the two pieces of good news that saved the operator AED 1.4 million, and the two pieces of bad news that explained why the unit came off the rig in the first place.',
    ),
    specTable(
      'FINDINGS · 12-P-160 · SERIAL NOV-12P160-2204 · SOUR SERVICE',
      [
        {
          component: 'Deck flatness (OEM datum)',
          spec: '≤ 0.05 mm/m',
          asFound: '0.04 mm/m',
          afterRebuild: '0.04 mm/m',
          status: '✓ Within tolerance · re-used',
          highlight: true,
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Liner bore washout (avg of 3)',
          spec: '5½″ ± 0.05 mm',
          asFound: '+0.62 mm scored',
          afterRebuild: '+0.04 mm new',
          status: '↻ Pockets re-machined, new liners',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Liner bore roundness',
          spec: '≤ 0.05 mm at 5½″',
          asFound: '0.18 mm out',
          afterRebuild: '0.03 mm',
          status: '↻ New OEM liners',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Valve seat sealing band',
          spec: 'Continuous, Ra ≤ 0.4 µm',
          asFound: 'Pitted, broken band',
          afterRebuild: 'Continuous, 0.4 µm',
          status: '↻ All 12 lapped + new',
          highlight: true,
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Valve spring rate',
          spec: 'OEM ± 10%',
          asFound: '−18% (fatigued)',
          afterRebuild: '+4% (new)',
          status: '↻ All 12 valves replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Deck hardness (8-point map)',
          spec: '≤ 22 HRC · NACE MR0175',
          asFound: '19.4 HRC avg',
          afterRebuild: '19.4 HRC avg',
          status: '✓ Sour-service compliant',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'Suction manifold cap',
          spec: 'No through-port cracks',
          asFound: 'Hairline at inboard port',
          afterRebuild: 'New OEM cap',
          status: '↻ Replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Elastomers (rod + valve packing)',
          spec: 'NACE HNBR',
          asFound: 'Standard NBR, glazed',
          afterRebuild: 'HNBR sour-service',
          status: '↻ Full pack replaced',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Flange bolting',
          spec: 'A193 B7M / 2HM, NACE',
          asFound: 'Mixed B7 / B7M (3 studs)',
          afterRebuild: '100% B7M / 2HM',
          status: '↻ Bolting upgraded',
          asFoundStyle: 'bad',
          afterStyle: 'good',
        },
        {
          component: 'Hydrotest · 7,500 psi (1.5× MAWP)',
          spec: '30 min hold',
          asFound: '—',
          afterRebuild: '30 min, 0 psi drop',
          status: '✓ Pass · TPI witnessed',
          highlight: true,
          afterStyle: 'good',
        },
        {
          component: 'Stroke length (3× plungers)',
          spec: '12.00″ ± 0.5 mm',
          asFound: '11.98 / 12.01 / 12.00',
          afterRebuild: '12.00 / 12.00 / 12.00',
          status: '✓ Within OEM',
          asFoundStyle: 'num',
          afterStyle: 'good',
        },
        {
          component: 'MIT re-stamp · API 7K',
          spec: 'Plate retained, serial chain',
          asFound: 'Original 2018 plate',
          afterRebuild: 'Re-stamped 2026-04-15',
          status: '✓ Traceable to deck SN',
          afterStyle: 'good',
        },
      ],
    ),

    sectionHead('/06', 'outcome', 'Outcome & sign-off.'),
    para(
      'The unit left our Jebel Ali yard on day 11, was on the rig pad at Bab on day 13, and was pumping mud on the development well by day 14 — comfortably ahead of the operator\'s second-week-of-May skid date. Final invoice landed at <strong>AED 1.41 million</strong> against a new-build comparable of <strong>AED 3.80 million</strong>, which is the AED 1.4M of savings the headline talks about. Twelve-month parts-and-assembly warranty on the rebuilt fluid end, MIT re-stamped, traceable from deck serial number through to every batch number on every consumable that went into it.',
    ),
    resultBox(
      'Result · summary',
      'A 12-P-160 fluid end back on the rig at 37% of replacement cost, hydrotested to 7,500 psi, and warrantied for twelve months on sour service.',
      'Eleven days on the bench, two days of road haul. Operator made the May skid date with three days of margin. ADNOC TPI signed the release pack on the bench. We have since been added to the operator\'s AVL for fluid-end rebuilds across their Bab and Bu Hasa fleet.',
      [
        { value: '11', valueSmall: ' days', label: 'Turnaround', style: 'accent' },
        { value: '37 / 100', label: 'Cost vs new-build', style: 'good' },
        { value: '24 / 24', label: 'SOP lines complete', style: 'good' },
        { value: '12', valueSmall: ' mo', label: 'System warranty' },
      ],
    ),

    sectionHead('/07', 'team', 'The team on the job.'),
    teamList(
      'Five engineers logged time against this work order, all of them based out of our Jebel Ali yard or the JAFZA QA office. If you call the workshop and ask about case 02, any of them can pull the file and walk you through the datum survey.',
      [
        {
          name: 'Yusuf Al Hashimi',
          role: 'Workshop Manager',
          location: 'Jebel Ali',
          scope: 'Owned the rebuild plan, two-option quote, and the conversation with the operator about the deck.',
        },
        {
          name: 'Khalid Al Marzouqi',
          role: 'Field Lead',
          location: 'Jebel Ali',
          scope: 'Stroke verification, client-witnessed release, low-loader dispatch and rig-pad handover at Bab.',
        },
        {
          name: 'Omar Al Maktoum',
          role: 'Lead Fitter',
          location: 'Jebel Ali',
          scope: 'Liner pocket re-machine, valve seat lapping, full assembly and bolt-up to torque chart.',
        },
        {
          name: 'Aisha Al Suwaidi',
          role: 'Machinist',
          location: 'Jebel Ali',
          scope: 'CMM datum survey, liner pocket skim cuts, hydrotest rig set-up and witnessed pressure hold.',
        },
        {
          name: 'Hassan Al Awadi',
          role: 'QA Lead',
          location: 'JAFZA',
          scope: 'NDT pass (MPI, UT, DP), hardness map, MIT re-stamp per API 7K, full sign-off pack.',
        },
      ],
      'Case file · INTAKE-2026-04-082 · WO-2026-1142 · Published 2026-04-22 · Updated 2026-05-09',
    ),
  ],

  ctaCardTitle: COMMON_CTA_TITLE,
  ctaCardBody: COMMON_CTA_BODY,
  ctaCardPhone: COMMON_CTA_PHONE,
  pullQuoteText:
    'The rig crew was right that the unit was finished. They were wrong about which part. The deck was the only piece on the whole fluid end that did not need replacing.',
  pullQuoteAuthor: 'Hassan Al Awadi',
  pullQuoteRole: 'QA LEAD · JAFZA',
  pullQuoteLocation: 'JAFZA',

  specsAtGlance: [
    { label: 'Asset', value: '12-P-160 triplex' },
    { label: 'Service', value: 'Sour gas · Bab' },
    { label: 'Liner bore', value: '5½″ × 12″' },
    { label: 'MAWP', value: '5,000 psi' },
    { label: 'Hydrotest', value: '7,500 psi · 30 min' },
    { label: 'Elastomers', value: 'HNBR sour-service' },
    { label: 'Bolting', value: 'A193 B7M / 2HM' },
    { label: 'Standard', value: 'API 7K · NACE MR0175' },
    { label: 'TAT', value: '11 days' },
    { label: 'Saving vs new', value: 'AED 1.4 M' },
  ],
  galleryTotalCount: 42,
  downloads: [
    { label: 'Intake report (PDF)', url: '#', size: '18 pp', format: 'PDF' },
    { label: 'NDT cert pack (ZIP)', url: '#', size: '8 MB', format: 'ZIP' },
    { label: 'Hydrotest curve (PDF)', url: '#', size: '4 pp', format: 'PDF' },
    { label: 'Sign-off pack (PDF)', url: '#', size: '38 pp', format: 'PDF' },
  ],
  caseFileMeta: 'Case file · INTAKE-2026-04-082 · WO-2026-1142 · Published 2026-04-22 · Updated 2026-05-09',

  cardOneLiner:
    'An ADNOC Bab field contractor was about to buy a new triplex mud pump fluid end at AED 3.8M list. The deck was reusable. We rebuilt it in eleven days at 37% of replacement cost, hydrotested to 7,500 psi.',
  cardOutcomePills: [
    { label: 'AED 1.4 M saved', style: 'good' },
    { label: '11 days on bench', style: 'neutral' },
    { label: '7,500 psi hydrotest', style: 'accent' },
  ],
  cardDurationLabel: '11 D ON BENCH',
  cardTagStyle: 'oil',
  cardTagLabel: 'MUD PUMP',

  durationDays: 11,
  savingsAmount: 1400000,
  savingsCurrency: 'AED',

  seoTitle:
    'Mud Pump Fluid End Rebuild · 12-P-160 · Bab Field · Saved AED 1.4M vs New Build — Indus Hydraulics Case 02',
  seoDescription:
    'How an ADNOC Onshore drilling contractor saved AED 1.4 million on a National-class 12-P-160 triplex mud pump fluid end at the Bab field. Deck reused, liners and valves replaced, 7,500 psi hydrotest, eleven days on the bench in our Jebel Ali workshop. NACE MR0175 sour service, API 7K MIT re-stamp.',
  focusKeyword: 'mud pump fluid end rebuild Jebel Ali',
}

export default CASE
