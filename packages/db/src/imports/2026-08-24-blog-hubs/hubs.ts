import type { BlogBlocksInput } from '@indus/domain'

/**
 * Hub bodies and head-term targeting for the blog category pages.
 *
 * WHY
 *
 * The hubs already own the CollectionPage JSON-LD and collect the internal
 * links from every article in their topic — the route comment calls them "the
 * ranking asset, not a filter view" — but every one of them rendered an H1,
 * one line of hero copy and a card grid. Nothing on the page answered a
 * question, so nothing on it could be cited or linked.
 *
 * All ten also had `seoTitle` and `focusKeyword` NULL, which means no hub was
 * targeting anything. That is the cheaper half of this fix.
 *
 * KEYWORD SPLIT
 *
 * Hubs take the head term, articles keep the long tail. Every `focusKeyword`
 * below was checked against the focus keywords already set on the 36 published
 * articles AND against /tools/dash-size-chart and /tools/thread-identifier,
 * which target "hydraulic hose dash size chart" and thread identification
 * respectively. Nothing here duplicates one.
 *
 * SOURCING
 *
 * The one table carrying figures — the grade summary on
 * `specification-standards` — comes from HOSE_SIZE_TABLES, the same Intertraco
 * extract behind the articles. Every other table is categorical: it names
 * things and says what they are for, without asserting a pressure, a dimension
 * or a temperature that would need a source.
 */
export type BlogHubSeed = {
  /** BlogCategory slug — must already exist. */
  slug: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  bodyBlocks: BlogBlocksInput
}

export const HUBS: BlogHubSeed[] = [
  // ── Pillar A ────────────────────────────────────────────────────────────
  {
    slug: 'specification-standards',
    seoTitle: 'Hydraulic hose specifications — grades, standards and ratings',
    seoDescription:
      'How hydraulic hose grades are specified: SAE 100R, EN 853, EN 856 and EN 857, what each construction family is for, and how to compare two grades honestly.',
    focusKeyword: 'hydraulic hose specifications',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'How is a hydraulic hose specified?',
        answer:
          'By four things, in order: bore, working pressure at that bore, bend radius, and the fluid and temperature. The grade designation — 2SN, R13, 4SH — falls out at the end as a result of those four. Starting from the designation is the most common way to specify the wrong hose.',
      },
      {
        type: 'paragraph',
        html: 'The articles below take the standards one at a time. What follows is the map: four reinforcement families, what each is for, and the single fact that decides between them.',
      },
      {
        type: 'comparison_table',
        caption: 'The four reinforcement families, and the grades we stock in each',
        columns: ['Family', 'Grades', 'Pressure behaviour as bore rises', 'Typical use'],
        rows: [
          { cells: ['Wire braid', '1SN / R1AT, 2SN / R2AT', 'Falls steeply — 2SN loses four fifths from −04 to −32', 'General high-pressure service'] },
          { cells: ['Compact braid', '1SC, 2SC', 'As braid, in roughly half the bend radius', 'Tight routing at braid pressures'] },
          { cells: ['Wire spiral', '4SP, 4SH, R13, R15', 'Almost flat — R13 holds 350 bar across its whole range', 'Large bore, high pressure, impulse duty'], highlight: true },
          { cells: ['Textile / thermoplastic', 'R5, R6, R7, R14', 'Low throughout; selected on medium, not pressure', 'Return, suction, chemical, tight routing'] },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Never compare two grades on their headline pressures.',
        body: 'A catalogue headline is the figure at the smallest bore in the range. 2SC is listed at 400 bar and 4SH at 420, which reads as near-identical — but 2SC’s figure is at −04 and 4SH’s is at −12. At the one bore they share, 4SH is 68% stronger. Compare at the bore you are actually specifying, or you are comparing two different things.',
      },
      {
        type: 'faq_block',
        heading: 'Where to start',
        items: [
          { question: 'I have a designation and need to know what it means.', answer: 'Start with the SAE 100R article — it explains why the numbers are a catalogue rather than a ranking, and gives the working pressures by bore for every grade we stock.' },
          { question: 'My drawing says EN and my supplier quotes SAE.', answer: 'The cross-reference article covers which pairings are genuine, which are approximations worth checking, and which have no counterpart at all.' },
          { question: 'I need the pressure at a particular size.', answer: 'The pressure-by-size article carries the full per-bore tables for every construction, small bore and large.' },
          { question: 'I am reading markings off a hose in front of me.', answer: 'The layline article decodes every element printed on the cover, and covers what to do when the printing has worn away.' },
        ],
      },
      { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Every construction discussed here, cut and crimped in Dubai.' },
      { type: 'cta_block', heading: 'Specifying against a drawing?', body: 'Send the designation, the bore and the working pressure. We will tell you what genuinely matches, what is an approximation, and what has no equivalent in our range.', quoteLabel: 'Check a specification' },
    ],
  },

  // ── Pillar B ────────────────────────────────────────────────────────────
  {
    slug: 'fitting-identification',
    seoTitle: 'Hydraulic fitting types — telling the six families apart',
    seoDescription:
      'The six hydraulic fitting families in use, how each one seals, and which of them share a thread and will assemble into a joint that leaks.',
    focusKeyword: 'hydraulic fitting types',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'How do you identify a hydraulic fitting?',
        answer:
          'By three independent properties: the thread (size and pitch), the seat (how it seals) and the gender. A thread gauge and callipers settle the first. Only looking at the end face settles the second — and the seat is what decides whether a joint holds, which is why a thread match alone is not an identification.',
      },
      {
        type: 'paragraph',
        html: 'Most misidentification is not a failure of measurement. It is stopping after the thread, because the thread is the part a gauge can tell you and the seat is the part it cannot.',
      },
      {
        type: 'comparison_table',
        caption: 'The six families, and what each one seals on',
        columns: ['Family', 'Thread', 'Seals on'],
        rows: [
          { cells: ['JIC 37°', 'Parallel UN/UNF', 'Metal-to-metal on a 37° cone'] },
          { cells: ['ORFS', 'Parallel UN/UNF', 'O-ring against a flat face'] },
          { cells: ['BSPP (G)', 'Parallel', 'Bonded washer or O-ring — not the thread'] },
          { cells: ['BSPT (R / Rc)', 'Tapered', 'Thread interference'] },
          { cells: ['NPT / NPTF', 'Tapered, 60° flank', 'Thread interference'] },
          { cells: ['Metric DIN 24°', 'Parallel metric', 'Cone, or a captive O-ring in the cone'] },
        ],
      },
      {
        type: 'callout',
        tone: 'danger',
        title: 'Two thread sizes assemble across families and then leak.',
        body: '9/16"-18 and 1.3/16"-12 exist in both JIC and ORFS. The parts will thread together, the 37° cone will bottom against the flat face, the O-ring will have nothing to seal against, and the joint will weep under pressure rather than immediately. That delay is what turns a bench error into a field failure.',
      },
      {
        type: 'faq_block',
        heading: 'Where to start',
        items: [
          { question: 'I have a fitting in my hand and no idea what it is.', answer: 'The four-step identification article walks it: parallel or tapered, then pitch, then seat, then confirm against a real family size.' },
          { question: 'I need pitches for a specific size.', answer: 'The thread pitch reference lists every designation and pitch we carry, family by family, with the cross-family collisions marked.' },
          { question: 'I keep confusing BSPP and BSPT.', answer: 'They share every pitch, which is exactly why. The BSPP-versus-BSPT article covers how to tell them apart and why one needs a seal and the other does not.' },
        ],
      },
      { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Per-size dimension tables on every product page.' },
      { type: 'category_link', slug: 'hydraulic-adapters', label: 'Adapters by family', blurb: 'BSP, JIC, ORFS, NPT, metric and DIN 2353.' },
      { type: 'cta_block', heading: 'Send a photograph of the end face.', body: 'The seat is what resolves the families that share a thread, and it is visible in a photograph. Add the measured diameter and the pitch and we will identify it.', quoteLabel: 'Identify a fitting' },
    ],
  },

  // ── Pillar C ────────────────────────────────────────────────────────────
  {
    slug: 'failure-analysis',
    seoTitle: 'Hydraulic hose failure analysis — reading the failed hose',
    seoDescription:
      'What each hydraulic hose failure mode leaves behind, and what the evidence tells you about the cause. Burst location, cover condition, wire state and tube condition.',
    focusKeyword: 'hydraulic hose failure analysis',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'Why do hydraulic hoses fail?',
        answer:
          'Almost never from a defect in the hose. The common causes are abrasion at a rub point, installation with a twist, a bend tighter than the rated radius, heat ageing, fluid incompatibility and a crimp outside specification. Each leaves distinct physical evidence, which is why a failed hose is worth examining rather than binning.',
      },
      {
        type: 'paragraph',
        html: 'A hose that failed once will fail again in the same place unless the cause changes. <strong>The replacement is the easy half; the diagnosis is the half that stops it recurring.</strong>',
      },
      {
        type: 'comparison_table',
        caption: 'What the evidence points at',
        columns: ['What you find', 'Points at'],
        rows: [
          { cells: ['Burst at or just behind the fitting', 'Crimp, flexing at the ferrule, or a bend starting too close to the end'] },
          { cells: ['Burst mid-length, wire splayed', 'Pressure event, or a hose past its impulse life'] },
          { cells: ['Cover worn through on one side only', 'Abrasion at a rub point — the hose was routed against something'] },
          { cells: ['Wire corroded under an intact cover', 'Water tracking under the cover, often from a pinhole or a cut'] },
          { cells: ['Cover cracked all over', 'Heat ageing or ozone and UV exposure'] },
          { cells: ['Tube swollen, soft or hardened', 'Fluid incompatible with the tube compound'] },
          { cells: ['Hose twisted along its length', 'Installed with a twist — it has been losing life since day one'] },
        ],
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'Photograph it before it goes in the bin.',
        body: 'The failed hose is the only physical record of what happened. A photograph of the burst, of the routing it came out of, and of the fitting ends costs nothing and is the difference between a diagnosis and a guess. Where a failure has repeated, keep the hose itself.',
      },
      { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Replace it, then change what caused it.' },
      { type: 'cta_block', heading: 'Same hose failing repeatedly?', body: 'Send photographs of the failure and the routing. A hose that fails twice in the same place is a routing or specification problem, and replacing it again will not fix it.', quoteLabel: 'Get a failure reviewed' },
    ],
  },

  // ── Pillar D ────────────────────────────────────────────────────────────
  {
    slug: 'hose-assembly',
    seoTitle: 'Hydraulic hose assembly — how a certified assembly is built',
    seoDescription:
      'What happens between bulk hose and a certified assembly: measurement, fitting selection, skiving, crimp specification, proof testing and the documentation that comes with it.',
    focusKeyword: 'hydraulic hose assembly',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'What goes into building a hydraulic hose assembly?',
        answer:
          'Six steps: establish the overall length, select the fittings for the hose construction, cut to the derived cut length, skive if the fitting requires it, crimp to the specified diameter and verify it, then proof test and tag. Each step has a figure that has to be checked rather than assumed.',
      },
      {
        type: 'paragraph',
        html: 'An assembly is not a length of hose with ends on it. It is a pressure-containing component whose rating depends on the fitting matching the hose construction and on the crimp landing inside a tolerance measured in tenths of a millimetre.',
      },
      {
        type: 'comparison_table',
        caption: 'The build sequence, and what is checked at each step',
        columns: ['Step', 'What is checked'],
        rows: [
          { cells: ['Measure', 'Overall length face to face — not the length of rubber'] },
          { cells: ['Select fittings', 'Fitting matched to the hose construction, not merely to the dash size'] },
          { cells: ['Cut', 'Cut length derived from overall length and the insertion depth at each end'] },
          { cells: ['Skive', 'Whether the fitting requires it at all, and to what depth if it does'] },
          { cells: ['Crimp', 'Crimp diameter verified with callipers against the published figure'], highlight: true },
          { cells: ['Test and tag', 'Proof test, then a tag carrying what the layline will not survive'] },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'A new assembly can destroy a pump.',
        body: 'Cutting hose generates debris, and an assembly built without a cleanliness step delivers it straight into the circuit. On a system with tight clearances the damage is done long before anybody suspects the new hose. Ask what cleanliness standard an assembly was built to — the answer should be a number, not a reassurance.',
      },
      { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Skive and no-skive, matched to construction.' },
      { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'One-piece and two-piece, every family.' },
      { type: 'cta_block', heading: 'Need assemblies built?', body: 'Send the length, the ends and the grade — or send the old hose. We cut, crimp, proof test and tag, and the certificate states what was actually tested.', quoteLabel: 'Order assemblies' },
    ],
  },

  // ── Pillar E ────────────────────────────────────────────────────────────
  {
    slug: 'machine-down',
    seoTitle: 'Hydraulic hose replacement by machine — what failed and where',
    seoDescription:
      'Which hydraulic circuit failed on a stopped machine, how to tell from the symptom, and what a replacement needs to specify. Excavators, forklifts, tippers and mixers.',
    focusKeyword: 'hydraulic hose replacement',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'How do I tell which hydraulic hose has failed?',
        answer:
          'From what stopped working. A machine that has lost one function has lost the hose feeding that circuit; a machine that has lost everything has lost a pump or main pressure line. The oil trail points at the burst, and the function that died points at the circuit — together they identify the hose without dismantling anything.',
      },
      {
        type: 'paragraph',
        html: 'The articles below cover specific machines. The reasoning is the same on all of them: <strong>symptom identifies the circuit, oil identifies the hose, routing identifies why it failed.</strong>',
      },
      {
        type: 'comparison_table',
        caption: 'Symptom to circuit',
        columns: ['What stopped', 'Circuit'],
        rows: [
          { cells: ['One function only', 'The service line to that function'] },
          { cells: ['Everything, engine still running', 'Pump supply, main pressure line, or a pump failure'] },
          { cells: ['Function drifts or drops under load', 'Often a cylinder or valve rather than a hose'] },
          { cells: ['Function slow, no visible leak', 'Internal leak, or a hose collapsed on the suction side'] },
          { cells: ['Oil visible only when the function moves', 'A hose failing at a flex point, not under static pressure'] },
        ],
      },
      {
        type: 'callout',
        tone: 'danger',
        title: 'Never find a leak with your hand.',
        body: 'Hydraulic fluid at working pressure penetrates skin without a visible wound and is a surgical emergency, not a first-aid matter. Use cardboard, and treat any pinhole spray as capable of doing it. Our article on fluid injection injury covers what to do and how fast it has to happen.',
      },
      { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Stocked in Dubai, assemblies same day.' },
      { type: 'cta_block', heading: 'Machine down now?', body: 'Send a photograph of the failed hose and both ends. For stocked grades we build same day, and we come to site across the UAE.', quoteLabel: 'Get a hose made' },
    ],
  },

  // ── Pillar F ────────────────────────────────────────────────────────────
  {
    slug: 'industrial-hose',
    seoTitle: 'Industrial hose types — selecting on the medium, not the pressure',
    seoDescription:
      'How industrial hose is selected: by what runs through it, what it has to survive and what certification the job requires. Chemical, food, steam, water and abrasive.',
    focusKeyword: 'industrial hose types',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'How is industrial hose different from hydraulic hose?',
        answer:
          'Hydraulic hose is selected on pressure; industrial hose is selected on the medium. What runs through it decides the tube compound, and the tube compound decides everything else. A hose that passes on pressure and fails on chemical compatibility is the standard way this goes wrong.',
      },
      {
        type: 'comparison_table',
        caption: 'What the medium decides',
        columns: ['Medium', 'What governs selection'],
        rows: [
          { cells: ['Chemicals', 'Tube compatibility with that specific chemical, at that concentration and temperature'] },
          { cells: ['Food and beverage', 'Certification, and the paperwork that proves it, as much as the hose'] },
          { cells: ['Steam', 'The coupling and its attachment — more failures start there than in the hose'] },
          { cells: ['Water, suction and delivery', 'Whether it must resist collapse under suction, which is a different rating'] },
          { cells: ['Abrasive solids', 'Tube wear life, which decides service life far more than pressure does'] },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'A compatibility chart is not a yes or a no.',
        body: 'Charts rate a compound against a chemical at a stated concentration and temperature. Move either and the rating moves with it. Where a chart says "conditional", that is an instruction to check the actual duty, not a soft yes.',
      },
      { type: 'category_link', slug: 'industrial-hose-suppliers-uae', label: 'Industrial hose', blurb: 'Chemical, food, steam, water, air and abrasive.' },
      { type: 'cta_block', heading: 'Tell us what runs through it.', body: 'The medium, the concentration, the temperature and the pressure. That is what selects an industrial hose — and in that order.', quoteLabel: 'Specify a hose' },
    ],
  },

  // ── Pillar G ────────────────────────────────────────────────────────────
  {
    slug: 'oilfield-pressure-control',
    seoTitle: 'Oilfield hose standards — API 7K, 16C and 16D compared',
    seoDescription:
      'Which API standard governs which hose on a rig, what each one actually requires, and why their safety factors differ so widely from industrial practice.',
    focusKeyword: 'oilfield hose standards',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'Which API standard applies to which rig hose?',
        answer:
          'API 7K covers rotary and vibrator hose and cement lines. API 16C covers choke and kill lines. API 16D covers BOP control hose, where fire survival is half the specification. They are not interchangeable, and a hose certified to one is not evidence of anything about the others.',
      },
      {
        type: 'comparison_table',
        caption: 'What each standard governs',
        columns: ['Standard', 'Covers', 'The defining requirement'],
        rows: [
          { cells: ['API 7K', 'Rotary, vibrator and cementing hose', 'Working pressure with safety clamps and coupling retention'] },
          { cells: ['API 16C', 'Choke and kill lines', 'Liner, temperature rating and a far tighter design factor'] },
          { cells: ['API 16D', 'BOP control hose', 'Fire survival — the hose must still function while burning'], highlight: true },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Oilfield design factors are not industrial design factors.',
        body: 'The 4:1 ratio of burst to working pressure that holds across every industrial hydraulic grade does not carry into the oilfield standards, which run considerably tighter. Applying an industrial rule of thumb to a rig hose overstates the margin you actually have.',
      },
      { type: 'category_link', slug: 'oil-gas-hoses', label: 'Oil & gas hose', blurb: 'Drilling, well control, well service and tensioner lines.' },
      { type: 'cta_block', heading: 'Specifying to an API standard?', body: 'Tell us the standard, the pressure rating and the service. We will confirm what certification comes with the assembly before you order it.', quoteLabel: 'Specify a rig hose' },
    ],
  },

  // ── Pillar H ────────────────────────────────────────────────────────────
  {
    slug: 'safety',
    seoTitle: 'Hydraulic hose safety — injection injury, whip and stored energy',
    seoDescription:
      'The three hydraulic hazards that injure people: fluid injection through skin, hose whip on failure, and stored energy in an isolated circuit. What actually controls each.',
    focusKeyword: 'hydraulic hose safety',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'What is the most serious hydraulic hose hazard?',
        answer:
          'Fluid injection injury. Hydraulic fluid escaping a pinhole at working pressure penetrates skin leaving a mark that can look trivial, and it is a surgical emergency measured in hours, not a first-aid matter. Hose whip on failure and stored energy in an isolated circuit are the other two that put people in hospital.',
      },
      {
        type: 'comparison_table',
        caption: 'Hazard and control',
        columns: ['Hazard', 'What actually controls it'],
        rows: [
          { cells: ['Fluid injection', 'Never searching for leaks by hand; treating any pinhole as capable of it; getting to surgery fast'], highlight: true },
          { cells: ['Hose whip on failure', 'Whip restraints on the lines that warrant them, sized and anchored properly'] },
          { cells: ['Stored energy after isolation', 'Bleeding the circuit and verifying zero pressure before breaking a joint'] },
          { cells: ['Burns from a hot line', 'Guarding and routing, not warning signs'] },
        ],
      },
      {
        type: 'callout',
        tone: 'danger',
        title: 'An injection injury does not look like an emergency.',
        body: 'The entry wound can be a pinprick and the pain can be mild for the first hour. The damage is happening under the skin the whole time, and delay is what costs people fingers and hands. Anyone who has been sprayed by a hydraulic leak goes to hospital immediately and tells them it was a high-pressure injection injury, whatever the wound looks like.',
      },
      { type: 'cta_block', heading: 'Reviewing hose safety on a site?', body: 'Whip restraints, guarding and a hose register are the three that change outcomes. We can review what is fitted and what is missing.', quoteLabel: 'Ask about site safety' },
    ],
  },

  // ── Pillar I ────────────────────────────────────────────────────────────
  {
    slug: 'maintenance-reliability',
    seoTitle: 'Hydraulic hose maintenance — inspection, registers and replacement',
    seoDescription:
      'Moving hose replacement from reactive to planned: what to inspect and how often, what a hose register has to record, and how age-based replacement works in practice.',
    focusKeyword: 'hydraulic hose maintenance',
    bodyBlocks: [
      {
        type: 'direct_answer',
        question: 'How often should hydraulic hoses be replaced?',
        answer:
          'There is no universal interval — it depends on duty, temperature, flexing and environment. What works is a register: record every assembly with its build date and position, inspect on a set frequency, and replace on the evidence plus an age limit set for that machine. Without a register neither half is possible.',
      },
      {
        type: 'paragraph',
        html: 'Unplanned hose failure is expensive not because the hose costs anything but because of what stops around it. <strong>The whole point of a register is converting that cost into a scheduled one.</strong>',
      },
      {
        type: 'comparison_table',
        caption: 'What a hose register has to record',
        columns: ['Field', 'Why'],
        rows: [
          { cells: ['Position on the machine', 'Without it, no assembly can be found again'] },
          { cells: ['Build date', 'The only basis for age-based replacement'], highlight: true },
          { cells: ['Grade, size and end types', 'Turns a replacement into a lookup rather than a measuring job'] },
          { cells: ['Last inspection and finding', 'Distinguishes a hose that was checked from one that was not'] },
          { cells: ['Failure history at that position', 'A position that fails twice has a routing problem, not a hose problem'] },
        ],
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'The tag is what makes the register possible.',
        body: 'A layline carries the build information but does not survive sun, sand and rub points — in Gulf conditions it often goes first. A crimped-on tag applied at build is what keeps the assembly identifiable for the rest of its life, and it is the cheapest part of the whole assembly.',
      },
      { type: 'cta_block', heading: 'Starting a hose register?', body: 'We tag every assembly we build and can supply the schedule of what went where. On a fleet refit that record is worth more than the hoses.', quoteLabel: 'Ask about hose management' },
    ],
  },
]

/**
 * Categories to unpublish.
 *
 * `procurement-export` is published, in the sitemap, and has zero articles, so
 * it renders "No articles in this topic yet." to anyone who lands on it. That
 * is a thin page being actively submitted to Google. It is Pillar G in the
 * content plan and gets eight articles later; it should be republished then,
 * not held open empty in the meantime.
 */
export const UNPUBLISH: string[] = ['procurement-export']
