import type { BlogArticleSeed } from '../shared'

/**
 * Every designation and pitch here is taken from `product_variants.portLabel`
 * on our own catalogue, restricted to labels that appear on a substantial
 * number of variants within their family. The long tail of single-occurrence
 * labels in each category is the OTHER end of an adapter (a JIC × BSPT elbow
 * carries a BSPT label too) plus a handful of transcription slips, and
 * publishing those as family sizes would be wrong.
 *
 * The column a reader most wants — measured male thread outside diameter — is
 * NOT in our data and is therefore absent rather than recalled. The article
 * says so in §04 instead of quietly omitting it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-thread-size-and-pitch-reference',
  title: 'Thread size and pitch, by family: the reference table for the bench',
  excerpt:
    'JIC 9/16"-18 and ORFS 9/16"-18 are the same thread. They will assemble, and one of them will leak. Every designation and pitch we stock, grouped by family, with the collisions marked.',
  categorySlug: 'fitting-identification',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic thread pitch by family — BSP, NPT, JIC, ORFS, metric',
  seoDescription:
    'Thread designations and pitches for BSPP, BSPT, NPT, JIC 37°, ORFS and metric DIN fittings, taken from a live catalogue. Includes the designations that collide between families.',
  focusKeyword: 'hydraulic thread pitch chart',
  publishedAt: '2026-08-24T11:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Thread designation and pitch identify the thread. They do not identify the fitting — seat geometry is a separate property, and two fittings can share a thread and seal completely differently.',
        'JIC and ORFS collide directly: 9/16"-18 and 1.3/16"-12 appear in both families, with a 37° cone on one and a flat face with an O-ring on the other.',
        'BSP parallel (G) and BSP tapered (R) share pitches exactly. The thread will engage either way; only one of them seals correctly in a given port.',
        'NPT pitches are close to BSP but not equal — 1/2" is 14 TPI on both, while 1/4" is 18 on NPT and 19 on BSP. That single-thread difference is enough to damage a port.',
        'Metric DIN threads state their pitch in the designation, which makes them the least ambiguous family to identify and the easiest to order correctly.',
      ],
    },
    {
      type: 'lead',
      html: 'A thread gauge tells you the pitch. Callipers tell you the diameter. Together they will get you to a designation — and a designation is only two thirds of the answer, because the thing that decides whether a joint seals is the seat, and the seat is not something a thread gauge can see.',
    },

    { type: 'section_head', number: '/01', title: 'What a designation does and does not settle.', anchor: 'what-it-settles' },
    {
      type: 'paragraph',
      html: 'Every fitting has three independent properties: the <strong>thread</strong> (size and pitch), the <strong>seat</strong> (how it seals), and the <strong>gender</strong>. A designation like 9/16"-18 describes the first only. Two fittings sharing it can be entirely different parts.',
    },
    {
      type: 'comparison_table',
      caption: 'The same thread, two families, two seals',
      columns: ['Family', 'Designation', 'How it seals'],
      rows: [
        { cells: ['JIC 37°', '9/16"-18', 'Metal-to-metal on a 37° cone'], highlight: true },
        { cells: ['ORFS', '9/16"-18', 'O-ring compressed against a flat face'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Both appear in our catalogue at that size, on dozens of variants each. They will thread together. <strong>The cone will bottom against the flat face, the O-ring will have nothing to seal against, and the joint will weep under pressure</strong> — usually not immediately, which is what makes it a field problem rather than a bench one.',
    },
    {
      type: 'direct_answer',
      question: 'Can a JIC fitting screw into an ORFS port?',
      answer:
        'At the sizes where the threads coincide — 9/16"-18 and 1.3/16"-12 among them — yes, it will screw in. It will not seal reliably, because JIC seals on a 37° cone and ORFS seals with an O-ring against a flat face. The thread matching is not evidence that the parts belong together.',
    },

    { type: 'section_head', number: '/02', title: 'The families, size by size.', anchor: 'the-tables' },
    {
      type: 'paragraph',
      html: 'Designations below are the ones carried across our own catalogue, family by family. Pitch is threads per inch on the imperial families and millimetres on metric.',
    },
    {
      type: 'comparison_table',
      caption: 'BSP parallel (G) and BSP tapered (R / Rc) — pitch in TPI',
      columns: ['Nominal', 'BSPP (G)', 'BSPT male (R)', 'BSPT female (Rc)'],
      rows: [
        { cells: ['1/8"', '28', '28', '28'] },
        { cells: ['1/4"', '19', '19', '19'] },
        { cells: ['3/8"', '19', '19', '19'] },
        { cells: ['1/2"', '14', '14', '14'] },
        { cells: ['5/8"', '14', '—', '—'] },
        { cells: ['3/4"', '14', '14', '14'] },
        { cells: ['1"', '11', '11', '11'] },
        { cells: ['1.1/4"', '11', '11', '11'] },
        { cells: ['1.1/2"', '11', '11', '11'] },
        { cells: ['2"', '11', '11', '11'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'G and R share every pitch. That is the whole problem.',
      body: 'A parallel male will start into a tapered female and a tapered male will start into a parallel female, because the pitches are identical. One of the two combinations seals on a bonded washer or an O-ring and the other seals on thread interference, and mixing them gives you a joint that holds at low pressure and weeps at working pressure. If the port is parallel, the fitting must be parallel.',
    },
    {
      type: 'comparison_table',
      caption: 'NPT — pitch in TPI, with BSP alongside for comparison',
      columns: ['Nominal', 'NPT', 'BSP', 'Same?'],
      rows: [
        { cells: ['1/8"', '27', '28', 'No'] },
        { cells: ['1/4"', '18', '19', 'No'] },
        { cells: ['3/8"', '18', '19', 'No'] },
        { cells: ['1/2"', '14', '14', 'Yes — thread form still differs'], highlight: true },
        { cells: ['3/4"', '14', '14', 'Yes — thread form still differs'], highlight: true },
        { cells: ['1"', '11.5', '11', 'No'] },
        { cells: ['1.1/4"', '11.5', '11', 'No'] },
        { cells: ['1.1/2"', '11.5', '11', 'No'] },
        { cells: ['2"', '11.5', '11', 'No'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'At 1/2" and 3/4" the pitches match exactly, and the two will engage. They still are not the same thread — NPT has a 60° flank angle and BSP has 55°, so the flanks never seat properly along their length. <strong>Forcing one into the other damages the port</strong>, and on a cast-iron valve body that is the expensive kind of damage.',
    },
    {
      type: 'comparison_table',
      caption: 'JIC 37° and ORFS — pitch in TPI',
      columns: ['JIC 37°', 'Pitch', 'ORFS', 'Pitch'],
      rows: [
        { cells: ['7/16"', '20', '—', '—'] },
        { cells: ['1/2"', '20', '—', '—'] },
        { cells: ['9/16"', '18', '9/16"', '18'], highlight: true },
        { cells: ['3/4"', '16', '11/16"', '16'] },
        { cells: ['7/8"', '14', '13/16"', '16'] },
        { cells: ['1.1/16"', '12', '1"', '14'] },
        { cells: ['1.3/16"', '12', '1.3/16"', '12'], highlight: true },
        { cells: ['1.5/16"', '12', '1.7/16"', '12'] },
        { cells: ['1.5/8"', '12', '1.11/16"', '12'] },
        { cells: ['1.7/8"', '12', '2"', '12'] },
        { cells: ['2.1/2"', '12', '—', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The two highlighted rows are the collisions. Everywhere else the families diverge in diameter even where the pitch coincides, so the parts will not start — which is the safe failure. <strong>9/16"-18 and 1.3/16"-12 are the two sizes where the wrong part goes in without complaint.</strong>',
    },
    {
      type: 'comparison_table',
      caption: 'Metric DIN 2353 — the designations carried in our catalogue',
      columns: ['1.0 mm pitch', '1.5 mm pitch', '2.0 mm pitch'],
      rows: [
        { cells: ['M10×1', 'M12×1.5', 'M27×2'] },
        { cells: ['—', 'M14×1.5', 'M30×2'] },
        { cells: ['—', 'M16×1.5', 'M33×2'] },
        { cells: ['—', 'M18×1.5', 'M36×2'] },
        { cells: ['—', 'M20×1.5', 'M39×2'] },
        { cells: ['—', 'M22×1.5', 'M42×2'] },
        { cells: ['—', 'M24×1.5', 'M45×2'] },
        { cells: ['—', 'M26×1.5', 'M48×2'] },
        { cells: ['—', 'M30×1.5', 'M52×2'] },
        { cells: ['—', 'M33×1.5', 'M60×2'] },
        { cells: ['—', 'M36×1.5', 'M64×2'] },
        { cells: ['—', 'M42×1.5', '—'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Why metric is the easiest family to get right — and where it still bites.',
      body: 'The designation carries the pitch, so M22×1.5 is unambiguous in a way that "half inch" never is. The trap is elsewhere: DIN 2353 fittings come in a light (L) and a heavy (S) series, the two series overlap in thread designation, and the thread alone does not say which you are holding. What separates them is the tube outside diameter the fitting is built for. Order on the thread designation without stating the series and the tube size, and a light-series body can arrive for a heavy-series job.',
    },

    { type: 'section_head', number: '/03', title: 'Identifying a thread on the bench.', anchor: 'identifying' },
    {
      type: 'decision_tree',
      heading: 'Four steps, in order',
      intro: 'Do all four. Stopping after two is how the collisions above get through.',
      branches: [
        { condition: 'Is it parallel or tapered?', outcome: 'Run callipers along the thread at both ends of its length.', detail: 'A visible reduction means tapered — NPT, BSPT. Constant diameter means parallel — BSPP, JIC, ORFS, metric.' },
        { condition: 'What is the pitch?', outcome: 'Use a thread pitch gauge, not a ruler and a count.', detail: 'The difference between 18 and 19 TPI is what separates NPT from BSP at 1/4", and it is not something the eye resolves.' },
        { condition: 'What is the seat?', outcome: 'Look at the end face — cone, flat face with a groove, or nothing.', detail: 'A 37° cone is JIC. A flat face with an O-ring groove is ORFS. A flat end with no seat means the thread itself seals, so it is tapered.' },
        { condition: 'Does the answer match a real family size?', outcome: 'Check it against the tables above before ordering.', detail: 'A measurement that lands between two published sizes is a measurement error, not a rare thread.' },
      ],
    },

    { type: 'section_head', number: '/04', title: 'What this table does not have.', anchor: 'not-here' },
    {
      type: 'paragraph',
      html: 'There is no measured male thread outside diameter column here, and it is the column most people want — the one that turns “I measured 15.8 mm” into a designation. <strong>We do not hold that measurement as data, so we are not publishing it.</strong> A table of thread diameters recalled rather than measured is precisely the artefact that causes the errors this article is about.',
    },
    {
      type: 'paragraph',
      html: 'What works instead, today: measure the diameter and the pitch, then send both with a photograph of the end face. The seat is visible in a photograph and it is the property that resolves the JIC and ORFS collision that a diameter alone cannot. Our <a href="/tools/thread-identifier">thread identifier</a> walks the same four questions interactively if you would rather answer them one at a time.',
    },
    { type: 'category_link', slug: 'jic-adapters', label: 'JIC 37° adapters', blurb: 'Every size in the table above, in stock.' },
    { type: 'category_link', slug: 'orfs-adapters', label: 'ORFS adapters', blurb: 'Flat face and O-ring, the family JIC is mistaken for.' },
    { type: 'category_link', slug: 'bsp-hydraulic-adapters-uae', label: 'BSP adapters', blurb: 'Parallel and tapered, both series.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I tell BSPP from BSPT without a gauge?', answer: 'Run callipers along the thread at each end of its length. A parallel thread reads the same at both; a tapered one visibly reduces. Where the fitting has a bonded washer or an O-ring under a shoulder, it is parallel — the seal is not the thread.' },
        { question: 'Is NPT interchangeable with BSPT at 1/2 inch?', answer: 'No. The pitches happen to match at 14 TPI, so the two will engage, but the flank angles differ — 60° against 55° — so they never seat correctly. Forcing the combination damages the softer of the two, which is usually the port.' },
        { question: 'What pitch gauge do I need for hydraulic work?', answer: 'One covering both imperial TPI and metric pitch. The imperial leaves need to include 11, 11.5, 12, 14, 16, 18, 19, 20, 24 and 27 to cover the families in these tables; the metric leaves need 1.0, 1.25, 1.5 and 2.0.' },
        { question: 'Why is a metric thread designation not enough to order a DIN fitting?', answer: 'Because DIN 2353 defines a light and a heavy series on tube outside diameter rather than on thread size, and the two overlap in thread designation. The bodies differ even where the thread does not, so the series and the tube size have to be stated alongside the thread.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Designations and pitches taken from the port labels on our own adapter catalogue, restricted to sizes carried across a substantial number of variants in each family. Thread outside diameters are not published because we do not hold them as verified data.',
    },
    { type: 'cta_block', heading: 'Measured it and still not sure?', body: 'Send the diameter, the pitch and a photograph of the end face. The seat is what resolves the families that share a thread, and it is visible in a photograph.', quoteLabel: 'Identify a thread' },
  ],
}

export default ARTICLE
