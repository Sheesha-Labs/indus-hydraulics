import type { BlogArticleSeed } from '../shared'

/**
 * Wheel drive selection. Checked 2026-10-21 against Dinamic Oil's Wheel & Track Drive catalogue (2025) and website:
 * GR 80 / GR 200 with integrated orbital motor (ratios 5.23 / 6.2), T2cont / T2maxint / T2peak with pressure drops,
 * n2max, flow 30 L/min; EH 210/240 (S, SC, PD versions) and EW 700–2500, T2max 3,950–24,000 Nm, 2/3 stages;
 * EHe/EWe PMSM 48/96 VDC with built-in negative electric brake; mechanical release optional on GR/EH, standard on EW;
 * bearings carry up to 8,000 kg on EH (website); applications: vine straddle robot, skid steer, container AGV,
 * scissor lift, boom lift.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wheel-drive-selection-guide',
  title: 'Wheel drive selection: torque, speed, hydraulic or electric, and towing release',
  excerpt:
    'A wheel drive has to start the machine on a slope, carry its weight and let it be towed when it breaks down. How to size one from tractive effort, read continuous, intermittent and peak torque, and choose between hydraulic and 48/96 V electric drives.',
  categorySlug: 'specification-standards',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Wheel Drive Selection: Torque, Speed and Motor',
  seoDescription:
    'How to select a wheel drive: tractive effort, continuous vs peak torque, output speed, wheel load, orbital or 48/96 V electric motors and towing release.',
  focusKeyword: 'wheel drive selection',
  publishedAt: '2026-10-21T00:31:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Torque at the wheel = tractive force × rolling radius; the force covers rolling resistance, gradient and acceleration.',
        'Use continuous torque for steady travel, intermittent for short manoeuvres and peak for starting on a slope.',
        'The drive’s bearings carry the machine’s weight on that wheel — check the load as well as the torque.',
        'Battery machines can use the same planetary drives with a 48 V or 96 V PMSM motor and an electric parking brake.',
        'A mechanical release lets a broken-down machine be towed without dragging the drive.',
      ],
    },
    {
      type: 'lead',
      html: 'Scissor and boom lifts, skid-steer loaders, container AGVs and vineyard robots all move on hub drives: a planetary gearbox in the wheel, driven by a hydraulic or electric motor. They are small, but they carry the machine, start it on ramps and hold it on slopes. Selecting one is a short calculation and a few checks.',
    },

    { type: 'section_head', number: '/01', title: 'Torque from tractive effort.', anchor: 'torque' },
    {
      type: 'paragraph',
      html: 'Work out the tractive force each driven wheel must deliver: the weight on that wheel times the rolling resistance of the ground, plus the weight times the sine of the steepest gradient, plus the force to accelerate. Multiply by the wheel’s rolling radius to get the wheel torque. Then compare it with the drive’s ratings: <strong>continuous</strong> torque for steady travel, <strong>maximum intermittent</strong> for short manoeuvres, and <strong>peak</strong> for starting on the steepest slope. Dinamic Oil quotes each with the motor pressure drop it needs, so the same table tells you what the hydraulic circuit must supply.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between continuous and peak torque on a wheel drive?',
      answer:
        'Continuous torque is what the drive can deliver indefinitely, for steady travel. Peak torque is the short-term maximum for starting or climbing; running at it continuously overheats the motor and wears the gears. Size the drive so normal travel sits within the continuous rating.',
    },

    { type: 'section_head', number: '/02', title: 'Speed and wheel load.', anchor: 'speed' },
    {
      type: 'paragraph',
      html: 'The machine’s top speed divided by the wheel’s rolling circumference gives the output speed the drive must reach; check it against the maximum output speed, which on an integrated-motor drive depends on the motor fitted and the oil flow. Then check the wheel load: the drive’s output bearings carry the machine’s weight on that wheel, and their capacity — up to about 8,000 kg on Dinamic Oil’s EH models — is why the same drives also work as track drives.',
    },

    { type: 'section_head', number: '/03', title: 'Hydraulic or electric.', anchor: 'motor' },
    {
      type: 'comparison_table',
      caption: 'Dinamic Oil wheel drive ranges',
      columns: ['Range', 'Motor', 'Torque', 'Notes'],
      rows: [
        { cells: ['GR 80, GR 200', 'Integrated orbital hydraulic motor', '470 to 1,600 Nm continuous, up to 2,500 Nm peak', 'Single ratio; motor displacement chosen by variant'] },
        { cells: ['EH 210, EH 240', 'Orbital or axial piston motor, or electric', 'T2max 3,950 to 5,600 Nm', 'S, SC, PD output versions; release optional'], highlight: true },
        { cells: ['EW 700 to EW 2500', 'Orbital or axial piston motor, or electric', 'T2max 7,000 to 24,000 Nm', 'Mechanical release standard'] },
        { cells: ['EHe, EWe', 'PMSM electric, 48 V or 96 V DC', 'As EH / EW', 'Built-in negative electric brake'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Hydraulic drives suit machines that already have a pump for lifting or digging. For battery machines such as electric aerial platforms and AGVs, the EHe and EWe versions pair the same planetary stages with a permanent-magnet synchronous motor on a 48 V or 96 V DC bus, and a negative electric brake that holds the machine when power is off.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Plan for the tow.',
      body: 'A broken-down machine has to be moved. With a mechanical release, the drive disconnects so the wheels turn freely; it is standard on the EW range and an option on GR and EH.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How many driven wheels do I need?', answer: 'Enough that the torque per wheel stays within the continuous rating on the steepest gradient; two-wheel drive suits flat floors, four-wheel drive rough sites and ramps.' },
        { question: 'Can a wheel drive also be a track drive?', answer: 'Yes, where the bearing load allows: the EH models’ bearing capacity suits both.' },
        { question: 'What does GR80-MR100 mean?', answer: 'The GR 80 drive with an orbital motor of about 100 cm³/rev; the motor sets the torque per bar and the top speed.' },
        { question: 'Does the electric version need a separate brake?', answer: 'No. EHe and EWe drives have a built-in negative electric brake.' },
        { question: 'What voltages are available?', answer: '48 V and 96 V DC as standard; other executions on request from Dinamic Oil.' },
      ],
    },
    { type: 'product_embed', heading: 'Wheel drives', skus: ['IH-DO-GR', 'IH-DO-EW'] },
    { type: 'category_link', slug: 'wheel-drives', label: 'Wheel drives', blurb: 'GR, EH and EW, hydraulic or electric.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Access platforms and site machines.' },
    { type: 'related_articles', slugs: ['how-to-select-a-planetary-gearbox', 'slewing-drive-selection-guide', 'planetary-gearbox-oil-in-hot-climates'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-21', note: 'Ranges, ratings, electric versions and release options from Dinamic Oil’s Wheel & Track Drive catalogue (2025).' },
    {
      type: 'cta_block',
      heading: 'Selecting a wheel drive?',
      body: 'Send the machine weight, wheel size, top speed, steepest gradient and the motor or battery voltage. We will size the Dinamic Oil drive.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
