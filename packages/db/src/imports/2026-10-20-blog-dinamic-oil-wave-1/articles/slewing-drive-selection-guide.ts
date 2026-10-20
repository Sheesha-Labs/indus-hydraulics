import type { BlogArticleSeed } from '../shared'

/**
 * Slewing drive selection. Checked 2026-10-20 against Dinamic Oil's slewing gearbox catalogue (2025) A-2/A-3 and
 * B-1: T2 FEM = nominal output torque, F.E.M. M5 (L2-T5) at 15 rpm, indicative; support T2max static (100 % Rs) and
 * dynamic (90 % Rs) apply to the support only, compare with gearset T2max and take the lower; static never exceeded;
 * eccentric output mounting for backlash; splined or integral pinions, pinion table m / z / x / tip / face width;
 * pinions outside catalogue to ring-gear data; low-opening-pressure brake for closed loop, dry brake for high-speed
 * motors (website); oil or grease; RE 240–8010, GB 12010–26000; ABS PDA thruster builds.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'slewing-drive-selection-guide',
  title: 'Slewing drive selection: torque, pinion, backlash and brake for crane and platform slewing',
  excerpt:
    'A slewing gearbox drives a pinion into a slewing ring, and the pinion is often what limits it. How to size the torque, read the support limits, set the backlash and choose the brake for a crane, aerial platform or thruster slewing drive.',
  categorySlug: 'specification-standards',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Slewing Drive Selection: Torque, Pinion and Brake',
  seoDescription:
    'How to select a slewing drive: slewing torque, T2 FEM ratings, output support limits, pinion module and backlash, open- and closed-loop brakes, and approvals.',
  focusKeyword: 'slewing drive selection',
  publishedAt: '2026-10-20T19:44:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Size on the slewing torque at the ring divided by the ring-to-pinion ratio and the number of drives.',
        'The gearset rating and the output-support rating are separate: the lower one governs, and the static limit is absolute.',
        'Pinion data — module, teeth, profile shift, face width — has to match the slewing ring, not just the gearbox.',
        'Eccentric supports let the backlash be set on assembly; fixed supports rely on ring-gear tolerances.',
        'Closed-loop slewing circuits need a low-opening-pressure brake; high-speed motors need a dry brake.',
      ],
    },
    {
      type: 'lead',
      html: 'Slewing is where cranes, aerial platforms, excavators and thrusters take their highest shock loads: the start and stop of a heavy upper structure, wind on a boom, a vessel rolling. A slewing gearbox is a planetary gearbox with a reinforced output support built to take the radial load of a pinion meshing with a slewing ring. Selecting one means checking three things the gears alone do not tell you.',
    },

    { type: 'section_head', number: '/01', title: 'The torque.', anchor: 'torque' },
    {
      type: 'paragraph',
      html: 'Start from the torque needed at the slewing ring: the ring bearing’s friction torque, the wind load on the upper structure and the inertia torque to accelerate it, plus the effect of any heel or trim. Divide by the ratio between the ring gear and the pinion, and by the number of drives sharing the ring — large rings often use two or more. Compare the result with <strong>T2 FEM</strong>: Dinamic Oil’s nominal output torque for F.E.M. class M5 (L2-T5) at 15 rpm output. It is an indicative figure, confirmed by the maker for the actual duty.',
    },

    { type: 'section_head', number: '/02', title: 'Support limits.', anchor: 'support' },
    {
      type: 'paragraph',
      html: 'The output support — the housing and bearings that carry the pinion — has its own maximum static and dynamic torques. They are a different limit from the gearset’s T2max: compare the two and use the lower. The static limit must never be exceeded for any reason; if it is, the gearbox must be inspected before it runs again. That is why emergency stops and slewing brakes are part of the selection, not an afterthought.',
    },
    {
      type: 'direct_answer',
      question: 'Is the pinion torque the gearbox rating?',
      answer:
        'No. The static and dynamic torques published with a slewing gearbox’s pinion and support apply to the output support only. They must be compared with the gearset’s maximum torque, and the lower value governs.',
    },

    { type: 'section_head', number: '/03', title: 'Pinion and backlash.', anchor: 'pinion' },
    {
      type: 'paragraph',
      html: 'Pinions are either splined onto the output shaft and retained by end screws, or cut integral with the shaft. Each is defined by module, number of teeth, profile shift, tip diameter and face width, and its position from the support face — all of which must suit the slewing ring. For a ring outside the catalogue pinions, send the full ring-gear data and the pinion is made to match. Eccentric supports let the gearbox be turned in its seat to set the pinion-to-ring backlash on assembly; with a fixed support, the backlash depends on the ring and housing tolerances.',
    },

    { type: 'section_head', number: '/04', title: 'Brake and motor.', anchor: 'brake' },
    {
      type: 'comparison_table',
      caption: 'Choosing the slewing brake',
      columns: ['Circuit', 'Brake', 'Why'],
      rows: [
        { cells: ['Closed loop (hydrostatic)', 'Low opening pressure', 'Releases from the charge pressure available in the loop'], highlight: true },
        { cells: ['High-speed hydraulic or electric motor', 'Dry brake', 'Suited to high input speeds'] },
        { cells: ['Open loop', 'Standard negative multi-disc', 'Released by the slewing pressure through a shuttle'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For marine work, specific Dinamic Oil RE and RA builds with pinion output hold ABS product design assessments for azimuth-thruster steering, and design approval by DNV, ABS, RINA, Bureau Veritas, Lloyd’s Register or CCS is available on demand for other slewing drives.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How many drives does a slewing ring need?', answer: 'As many as the torque and the space allow. Sharing the load between two or more drives keeps each pinion smaller and balances the ring load.' },
        { question: 'Oil or grease?', answer: 'Both are available, depending on the mounting and duty; Dinamic Oil specifies it with the order.' },
        { question: 'What output speed is a slewing drive rated at?', answer: 'T2 FEM is quoted at 15 rpm output; at other speeds the maker corrects the rating.' },
        { question: 'Can a slewing drive be electric?', answer: 'Yes. Inputs for electric motors are available as well as orbital and axial piston hydraulic motors.' },
        { question: 'What sizes are available?', answer: 'Dinamic Oil’s RE slewing range runs from RE 240 to RE 8010, and the GB range from GB 12010 to GB 26000 at up to 460,000 Nm.' },
      ],
    },
    { type: 'product_embed', heading: 'Slewing gearboxes', skus: ['IH-DO-SLR', 'IH-DO-SLG'] },
    { type: 'category_link', slug: 'slewing-gearboxes', label: 'Slewing gearboxes', blurb: 'RE and GB slewing gearboxes with pinion output.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck cranes and thrusters.' },
    { type: 'related_articles', slugs: ['how-to-select-a-planetary-gearbox', 'dnv-type-approval-crane-gearboxes', 'truck-crane-hydraulic-hose'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Rating definitions, support limits, pinion and brake options from Dinamic Oil’s slewing gearbox catalogue (2025) and website.' },
    {
      type: 'cta_block',
      heading: 'Selecting a slewing drive?',
      body: 'Send the slewing torque, the ring-gear data, the number of drives, the motor and the circuit type. We will propose the Dinamic Oil size, support, pinion and brake.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
