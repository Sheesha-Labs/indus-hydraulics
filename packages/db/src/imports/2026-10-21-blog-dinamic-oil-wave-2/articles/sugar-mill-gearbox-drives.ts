import type { BlogArticleSeed } from '../shared'

/**
 * Sugar mill gearbox drives. Checked 2026-10-21 against Dinamic Oil's "Sugar Technologies" brochure (ST16/A/EN,
 * 2016): cane carriers, feeder tables, pushers, rake carriers, bagasse elevators and conveyors, GRPF, RBC, wagon
 * tilters; single and multiple mill drives as main or assist; diffusers; GB mill-drive table GB 85000–410000 with
 * nominal and maximum torque; process map by area. Planetary catalogue for GB to 235000 and shrink-disc hollow
 * outputs; cooling units; oil life by temperature (B-15).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sugar-mill-gearbox-drives',
  title: 'Sugar mill gearbox drives: planetary drives for mills, diffusers and cane handling',
  excerpt:
    'A sugar factory runs dozens of drives through a crushing season, from the cane carrier to the dryer, and the mill drives carry millions of newton-metres. Where planetary gearboxes fit in a cane mill, how mill drives are sized, and what to check for continuous seasonal duty.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Sugar Mill Gearbox Drives: Planetary Mill Drives',
  seoDescription:
    'Planetary gearbox drives in sugar mills: mill and diffuser drives, cane carriers and bagasse conveyors, GB mill-drive torques and seasonal duty.',
  focusKeyword: 'sugar mill gearbox',
  publishedAt: '2026-10-21T00:32:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Planetary gearboxes drive almost every stage of a cane sugar factory, from receiving to drying.',
        'Mill drives are the heaviest: Dinamic Oil’s GB mill-drive sizes run from 900 kNm to 4,600 kNm nominal torque.',
        'Shaft-mounted designs with a hollow shrink-disc output and a torque arm replace open gearing and couplings.',
        'Mills run as single or multiple drives, as main drives or as assists to existing ones.',
        'A crushing season is continuous duty: thermal power and oil life decide the selection as much as torque.',
      ],
    },
    {
      type: 'lead',
      html: 'Cane sugar factories are some of the heaviest continuous-duty drive installations outside mining. A mill tandem crushes cane around the clock for a season of several months, with shock loads every time a thick mat of cane enters the rolls. Planetary gearboxes have replaced open gear trains on many mills because they put very high torque into a compact, sealed unit that can sit directly on the roll shaft.',
    },

    { type: 'section_head', number: '/01', title: 'Where the drives are.', anchor: 'map' },
    {
      type: 'comparison_table',
      caption: 'Drives in a cane sugar factory (from Dinamic Oil’s sugar brochure)',
      columns: ['Area', 'Drives', 'Typical arrangement'],
      rows: [
        { cells: ['Cane receiving', 'Unloaders, wagon tipplers, stackers', 'Winches; foot or flange gearboxes'] },
        { cells: ['Cane preparation', 'Shredders, cane carriers, feeder tables, rake carriers', 'Shaft-mounted or foot-mounted gearmotors'] },
        { cells: ['Milling', 'Mill drives (main or assist), GRPF, RBC', 'Large shaft-mounted or foot-mounted planetary gearboxes'], highlight: true },
        { cells: ['Diffuser route', 'Diffuser and dewatering-mill drives', 'Right-angle shaft-mounted gearboxes'] },
        { cells: ['Bagasse and boiler', 'Bagasse reclaimers and conveyors, elevators', 'Shaft-mounted gearmotors'] },
        { cells: ['Process house and drying', 'Clarifiers, crystallizers, dryers, sugar conveyors', 'Foot-mounted or right-angle gearboxes'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Mill drives.', anchor: 'mill' },
    {
      type: 'paragraph',
      html: 'A mill drive turns the top roll of a three- or four-roll mill at a few revolutions per minute against the full crushing load. Dinamic Oil’s brochure lists GB mill-drive sizes from GB 85000 (900 kNm nominal, 1,500 kNm maximum) up to GB 410000 (4,600 kNm nominal, 7,100 kNm maximum), built as single drives or as multiple drives sharing a mill, and as main drives or assist drives added to an existing tandem. Shaft-mounted versions with a hollow output clamped by a shrink disc and held by a torque arm sit directly on the roll shaft, removing the open gearing, couplings and foundations of older drive trains.',
    },
    {
      type: 'direct_answer',
      question: 'What gearbox drives a sugar mill?',
      answer:
        'Many modern cane mills are driven by large planetary gearboxes, shaft-mounted on the top roll with a shrink-disc hollow output and torque arm, or foot-mounted with a coupling. Dinamic Oil’s GB mill-drive range covers 900 kNm to 4,600 kNm nominal output torque.',
    },

    { type: 'section_head', number: '/03', title: 'Diffusers and conveyors.', anchor: 'diffuser' },
    {
      type: 'paragraph',
      html: 'Diffuser factories replace most of the mill tandem with a diffuser that extracts sugar by washing: the drive challenge there is reliability at high torque and very low speed, which suits right-angle planetary gearboxes. Around them, cane carriers, bagasse conveyors and elevators run continuously at moderate torque, where shaft-mounted gearmotors save space and alignment work.',
    },

    { type: 'section_head', number: '/04', title: 'Seasonal duty.', anchor: 'duty' },
    {
      type: 'paragraph',
      html: 'A crushing season is months of continuous running, often in hot, humid mill houses. Check the thermal power before the torque, add an oil cooling unit where the duty exceeds it, and plan oil changes by running temperature: Dinamic Oil’s catalogue gives mineral oil around 7,000 hours at 70 °C but only about 3,000 hours at 90 °C, and synthetic oils roughly double that. Use the off-season for oil changes, seal and bearing checks, so nothing is opened during crushing.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Shaft-mounted or foot-mounted mill drive?', answer: 'Shaft-mounted drives sit on the roll shaft with a torque arm and need no alignment or coupling; foot-mounted drives suit layouts that keep an existing coupling or need the gearbox off the roll.' },
        { question: 'What is an assist drive?', answer: 'A drive added to an existing mill or tandem to raise capacity or share the load, without replacing the main drive.' },
        { question: 'Are the largest mill drives catalogue items?', answer: 'No. Dinamic Oil’s gearbox catalogue runs to GB 235000; the larger GB 310000 and GB 410000 mill drives in its sugar brochure are built to order.' },
        { question: 'How often should the oil be changed?', answer: 'By running temperature: the hotter the oil, the shorter its life. Plan changes for the off-season wherever the hours allow.' },
        { question: 'Are winches used in sugar factories?', answer: 'Yes, for cane unloaders and wagon tipplers in the receiving yard.' },
      ],
    },
    { type: 'product_embed', heading: 'Gearboxes for sugar mills', skus: ['IH-DO-GB', 'IH-DO-GBA', 'IH-DO-RE', 'IH-DO-COOL'] },
    { type: 'category_link', slug: 'planetary-gearboxes', label: 'Planetary gearboxes', blurb: 'RE, RA, GB and GBA to 3.6 MNm.' },
    { type: 'page_link', kind: 'industry', slug: 'steel', label: 'Steel', blurb: 'Other heavy continuous-duty drives.' },
    { type: 'related_articles', slugs: ['how-to-select-a-planetary-gearbox', 'planetary-gearbox-oil-in-hot-climates', 'winch-drive-vs-motor-drum-vs-complete-winch'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-21', note: 'Applications, mill-drive sizes and torques from Dinamic Oil’s Sugar Technologies brochure (2016); oil life from the planetary catalogue (2025).' },
    {
      type: 'cta_block',
      heading: 'Upgrading a mill drive?',
      body: 'Send the mill size, roll speed, installed power and the existing drive arrangement. We will propose a Dinamic Oil planetary drive and confirm it with the factory.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
