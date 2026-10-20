import type { BlogArticleSeed } from '../shared'

/**
 * Selecting a planetary gearbox. Checked 2026-10-20 against Dinamic Oil's planetary gearbox catalogue (2025),
 * sections B-6 to B-12: ratings to ISO 6336 / ISO 281, selection on service factor and output speed, then thermal
 * power, peak torque and radial/axial loads; T2max = occasional peak; brake rule Tb x ie / eta >= T2 and <= T2max;
 * braking torque falls with circuit back-pressure; RE 1.78–198 kNm, GB to 3.62 MNm; order code positions.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-select-a-planetary-gearbox',
  title: 'How to select a planetary gearbox: torque, service factor, thermal power and brakes',
  excerpt:
    'Picking a planetary gearbox from a catalogue table is easy; picking the right one means checking four things in order — output torque times service factor, peak torque, thermal power and shaft loads — and then the brake. A worked method using Dinamic Oil’s RE and GB ranges.',
  categorySlug: 'specification-standards',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Select a Planetary Gearbox: Torque, Ratio, Brake',
  seoDescription:
    'Planetary gearbox selection step by step: torque times service factor, T2max peaks, thermal power, radial and axial loads, ratio and the parking brake.',
  focusKeyword: 'select a planetary gearbox',
  publishedAt: '2026-10-20T19:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Select on the continuous output torque the machine needs multiplied by its service factor, not on the peak rating.',
        'T2max is the peak the gearbox may see occasionally — starting, braking, shock — and the peaks must stay below it.',
        'Thermal power limits continuous duty: if the gearbox cannot shed the heat, it needs a cooler or a bigger frame.',
        'Radial and axial loads on the output shaft are a separate check against the bearing curves.',
        'A parking brake must hold the load (Tb × ratio ÷ efficiency ≥ T2) without being able to overload the gearbox (≤ T2max).',
      ],
    },
    {
      type: 'lead',
      html: 'A planetary gearbox is chosen once and then lives with the machine for years. Most early failures trace back to a selection that matched the torque on paper and ignored the duty: a slewing drive that sees shock at every stop, a mixer running continuously in 45 °C ambient, or a brake big enough to break the gears it is meant to hold. The method below follows the order Dinamic Oil sets out in its planetary gearbox catalogue, and works for any maker that rates its gears to ISO 6336 and its bearings to ISO 281.',
    },

    { type: 'section_head', number: '/01', title: 'Start from torque and speed.', anchor: 'torque' },
    {
      type: 'paragraph',
      html: 'Work out the output torque the machine needs in continuous service and the output speed it must run at. With an electric motor, the motor’s rated speed divided by the output speed gives the ratio; with a hydraulic motor, the ratio is chosen together with the motor displacement and the oil flow available. Then multiply the required torque by a <strong>service factor</strong> for the duty — uniform, moderate shock or heavy shock, and the hours per day — and look for a gearbox whose catalogue torque at that input speed is at least that figure.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between T2 and T2max on a gearbox datasheet?',
      answer:
        'T2 is the output torque the gearbox can transmit continuously for its rated life at a given input speed; it is what you select on, after applying the service factor. T2max is the maximum torque it may see occasionally — starting, braking or shock peaks. A gearbox selected on T2max will be running at its peak limit all the time and will fail early.',
    },

    { type: 'section_head', number: '/02', title: 'Then check the limits.', anchor: 'limits' },
    {
      type: 'comparison_table',
      caption: 'The four checks after the torque selection',
      columns: ['Check', 'What it protects', 'What to compare'],
      rows: [
        { cells: ['Peak torque', 'Gears and splines', 'Starting, braking and shock torque against T2max'] },
        { cells: ['Thermal power', 'Oil and seals', 'Transmitted power in continuous duty against the thermal power Pt for the mounting'], highlight: true },
        { cells: ['Radial and axial load', 'Output bearings', 'Pinion, sprocket or pulley load against the radial-load curve, corrected for the life you need'] },
        { cells: ['Input speed', 'Input bearings, brake', 'Motor speed against the maximum input speed of the gearbox and brake'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Thermal power is the one most often skipped. A planetary gearbox is compact, so in continuous duty it can reach its oil temperature limit long before its gears are loaded to their rating. If the power you transmit continuously is above the thermal power, add an independent cooling unit — Dinamic Oil offers oil/water and oil/air units that dissipate up to 50 kW — or step up a frame. In Gulf conditions, check this before anything else; see <a href="/blog/planetary-gearbox-oil-in-hot-climates">gearbox oil in hot climates</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Size the parking brake both ways.', anchor: 'brake' },
    {
      type: 'paragraph',
      html: 'Most planetary gearboxes on winches, slewing and travel drives carry a negative multi-disc brake: springs clamp the discs, and hydraulic pressure releases them. The brake acts on the input, so its torque is multiplied by the ratio. Two conditions apply: the brake torque times the ratio, divided by the gearbox efficiency, must be at least the output torque it has to hold; and, except in special cases, it must not exceed the gearbox’s T2max — otherwise an emergency stop can do the damage the brake was meant to prevent.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Back-pressure weakens the brake.',
      body: 'Catalogue braking torque is at zero release pressure. Any back-pressure in the release line partly opens the brake: actual torque = catalogue torque × (opening pressure − back-pressure) ÷ opening pressure. Drain the brake line freely to tank.',
    },

    { type: 'section_head', number: '/04', title: 'Write the order code.', anchor: 'order' },
    {
      type: 'paragraph',
      html: 'Once the size and ratio are fixed, the order code fills in the rest: execution (in-line RE or GB, right-angle RA or GBA), frame size and number of stages, ratio, output support and shaft, output accessories, input (motor flange, adapter or input shaft), brake, and mounting position — which sets where the fill, level and drain plugs go. Dinamic Oil’s RE and RA ranges run from 1,780 Nm to 198 kNm peak torque, and GB and GBA to 3.62 MNm.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What service factor should I use?', answer: 'It depends on the shock level and hours per day; the maker’s table gives it. Uniform loads at a few hours a day need little margin; heavy shock and continuous duty need much more.' },
        { question: 'Do I need a cooling unit?', answer: 'Only if the power transmitted in continuous duty exceeds the gearbox’s thermal power for its mounting position and ambient temperature.' },
        { question: 'In-line or right-angle?', answer: 'In-line (RE, GB) is shorter in the drive direction and more efficient; right-angle (RA, GBA) adds a bevel head so the motor sits at 90° where space demands it.' },
        { question: 'How many stages?', answer: 'As many as the ratio needs. Each stage adds roughly 3:1 to 7:1; a single stage suits direct drives, four or five stages suit slow-turning electric drives.' },
        { question: 'Are gearboxes supplied with oil?', answer: 'Dinamic Oil gearboxes ship without oil and unpainted, apart from a primer on some parts. Fill with EP gear oil, ISO VG 220 to 320, before start-up.' },
      ],
    },
    { type: 'product_embed', heading: 'Planetary gearboxes', skus: ['IH-DO-RE', 'IH-DO-RA', 'IH-DO-GB', 'IH-DO-GBA'] },
    { type: 'category_link', slug: 'planetary-gearboxes', label: 'Planetary gearboxes', blurb: 'Dinamic Oil RE, RA, GB and GBA, 1.8 kNm to 3.6 MNm.' },
    { type: 'page_link', kind: 'industry', slug: 'steel', label: 'Steel', blurb: 'Drives for steel-plant and heavy industrial machines.' },
    { type: 'related_articles', slugs: ['planetary-gearbox-oil-in-hot-climates', 'slewing-drive-selection-guide', 'winch-drive-vs-motor-drum-vs-complete-winch'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Selection order, brake rules and ranges from Dinamic Oil’s planetary gearbox catalogue (2025).' },
    {
      type: 'cta_block',
      heading: 'Selecting a gearbox?',
      body: 'Send the output torque and speed, the motor, the duty and the mounting. We will propose the Dinamic Oil size, ratio and brake and confirm the order code with the factory.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
