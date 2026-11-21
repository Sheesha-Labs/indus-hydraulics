import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: nipple types, grades, schedules, manufacture (welded / seamless), size ranges,
 * part-number counts and lengths in mm from the seven live listings on stainless-steel-pipe-nipples
 * (length rows seen for 1/8", 1/4" and 3/8"; larger sizes are on the listing tables). NPT thread counts
 * from ASME B1.20.1. Pipe OD and Sch 40 / Sch 80 wall from ASME B36.19M / B36.10M. HS heading 7307
 * from the Harmonized System nomenclature. No pressure rating is given because no listing publishes one.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-pipe-nipple-size-chart',
  title: 'Stainless steel pipe nipple size chart: types, NPT threads, schedules and lengths',
  excerpt:
    'A pipe nipple is ordered by four things: pipe size, thread, schedule and length. The size chart for stainless NPT nipples from 1/8" to 6", the lengths we list, close, hex and reducing hex nipples, and Sch 40 welded against Sch 80 seamless.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel Pipe Nipple Size Chart',
  seoDescription:
    'Stainless steel pipe nipple size chart: NPT threads, pipe OD, Sch 40 and Sch 80 wall, lengths, and close, hex and reducing hex nipples in 304 and 316.',
  focusKeyword: 'stainless steel pipe nipple size chart',
  publishedAt: '2026-11-21T10:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What sizes do stainless steel pipe nipples come in?',
      answer:
        'Stainless pipe nipples are sized by nominal pipe size, from 1/8" to 6" in our range, with NPT male threads to ASME B1.20.1 on both ends. A 1/2" nipple is cut from pipe 21.3 mm across, with 14 threads per inch. Lengths run from a close nipple, threaded end to end, up to 12" in 304 and 316.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Order a nipple by pipe size, thread, schedule, length and grade. Missing any one of them gets you the wrong part.',
        'The nominal size is not the outside diameter: a 1/2" nipple is 21.3 mm OD and a 1" nipple 33.4 mm, per ASME B36.19M.',
        'We list pipe nipples in 304 and 316 as Sch 40 welded and Sch 80 seamless, plus 316 hex nipples and reducing hex nipples in 304 and 316. All are NPT male both ends.',
        'Listed lengths start at the close nipple (19 mm for 1/8", 22.2 mm for 1/4", 25.4 mm for 3/8"), then 1-1/2" to 6" in 1/2" steps, then 8", 10" and 12".',
        'No pressure rating is published for these nipples. A threaded nipple is weaker than the pipe it is cut from, so ask before using one near a pressure limit.',
      ],
    },
    {
      type: 'lead',
      html: 'Pipe nipples are the simplest stainless fitting and one of the easiest to order wrongly. The same 1/2" nipple can come in two schedules, two grades and a dozen lengths, and a BSP nipple will screw into an NPT fitting just far enough to mislead you. This article gives the size chart for the nipples on our <a href="/c/stainless-steel-pipe-nipples">stainless steel pipe nipples</a> shelf, the types it holds, and what to send when you order. Couplings, tees and elbows are covered in <a href="/blog/stainless-threaded-pipe-fittings-150-vs-3000">stainless threaded pipe fittings: 150# vs 3000#</a>.',
    },
    { type: 'section_head', number: '/01', title: 'The size chart.', anchor: 'size-chart' },
    {
      type: 'paragraph',
      html: 'A pipe nipple is a short piece of pipe threaded on both ends, so its outside diameter and wall are those of the pipe. The table gives the pipe OD and wall for Sch 40 and Sch 80 from ASME B36.19M, which for these sizes match the ASME B36.10M schedules, and the NPT thread count from ASME B1.20.1. The last column shows which listings on our shelf cover each size.',
    },
    {
      type: 'comparison_table',
      caption: 'Stainless steel NPT pipe nipple sizes: thread, pipe OD and wall (mm)',
      columns: ['Size', 'NPT TPI', 'Pipe OD', 'Sch 40 wall', 'Sch 80 wall', 'Listed in'],
      rows: [
        { cells: ['1/8"', '27', '10.3', '1.73', '2.41', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['1/4"', '18', '13.7', '2.24', '3.02', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['3/8"', '18', '17.1', '2.31', '3.20', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['1/2"', '14', '21.3', '2.77', '3.73', 'Sch 40 and Sch 80, 304 and 316; 316 hex'], highlight: true },
        { cells: ['3/4"', '14', '26.7', '2.87', '3.91', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['1"', '11.5', '33.4', '3.38', '4.55', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['1-1/4"', '11.5', '42.2', '3.56', '4.85', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['1-1/2"', '11.5', '48.3', '3.68', '5.08', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['2"', '11.5', '60.3', '3.91', '5.54', 'Sch 40 and Sch 80, 304 and 316; 316 hex'] },
        { cells: ['2-1/2"', '8', '73.0', '5.16', '7.01', 'Sch 40 and Sch 80, 304 and 316'] },
        { cells: ['3"', '8', '88.9', '5.49', '7.62', 'Sch 40 and Sch 80, 304 and 316'] },
        { cells: ['4"', '8', '114.3', '6.02', '8.56', 'Sch 40 and Sch 80, 304 and 316'] },
        { cells: ['6"', '8', '168.3', '7.11', '10.97', 'Sch 40 in 304 and 316; Sch 80 in 316'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Size ranges follow the listing headers: 304 Sch 40 welded and 316 Sch 40 welded run 1/8" to 6", 316 Sch 80 seamless runs 1/8" to 6", and 304 Sch 80 seamless stops at 4". The chart shows the end points and the common sizes between them; the size table on each listing is the record of exactly which size and length combinations it holds, so check it before you rely on one.',
    },
    { type: 'section_head', number: '/02', title: 'Lengths.', anchor: 'lengths' },
    {
      type: 'paragraph',
      html: 'Nipple length is the overall length, end to end, including both threads. The size tables on the pipe nipple listings give every length in millimetres. For the small sizes they run as follows, and the same pattern is repeated for the 304 and 316 listings in both schedules.',
    },
    {
      type: 'comparison_table',
      caption: 'Listed nipple lengths, 1/8" to 3/8" (overall length)',
      columns: ['Size', 'Shortest (close)', 'Then', 'Longest listed'],
      rows: [
        { cells: ['1/8"', '19.0 mm (3/4")', '38.1 to 152.4 mm (1-1/2" to 6") in 12.7 mm steps, then 203.2 and 254 mm', '304.8 mm (12")'] },
        { cells: ['1/4"', '22.2 mm (7/8")', '38.1 to 152.4 mm in 12.7 mm steps, then 203.2 and 254 mm', '304.8 mm (12")'] },
        { cells: ['3/8"', '25.4 mm (1")', '38.1 to 152.4 mm in 12.7 mm steps, then 203.2 mm and longer', 'See listing'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The 316 Sch 80 seamless listing also has a 177.8 mm (7") length at 1/8". For 1/2" and larger the close nipple is longer, because each NPT thread is longer, and the lengths are on the listings. A close nipple has no plain section between the threads, so it cannot be gripped with a pipe wrench once the threads are engaged; use a nipple wrench or choose the next length up if you need to grip it.',
    },
    { type: 'section_head', number: '/03', title: 'Types of nipple.', anchor: 'types' },
    {
      type: 'paragraph',
      html: 'Our shelf holds three types, all with NPT male threads on both ends.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Pipe nipples.</strong> Cut from pipe in 304 or 316, as <a href="/p/304-stainless-steel-npt-pipe-nipple-sch-40-welded">304 Sch 40 welded</a>, <a href="/p/316-stainless-steel-npt-pipe-nipple-sch-40-welded">316 Sch 40 welded</a>, 304 Sch 80 seamless or <a href="/p/316-stainless-steel-npt-pipe-nipple-sch-80-seamless">316 Sch 80 seamless</a>. Between 135 and 163 part numbers per listing, by size and length.</li><li><strong>Hex nipples.</strong> A short nipple with a hex in the middle, so it can be tightened with a spanner. The <a href="/p/316-stainless-steel-npt-hex-nipple">316 hex nipple</a> runs 1/8" to 2" in nine sizes.</li><li><strong>Reducing hex nipples.</strong> A hex nipple with a different size each end. The 304 listing holds seven combinations from 3/8" × 1/4" to 4" × 3"; the <a href="/p/316-stainless-steel-npt-reducing-hex-nipple">316 reducing hex nipple</a> holds twelve from 1/4" × 1/8" to 3" × 2-1/2".</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Other types exist and are not on this shelf: barrel nipples with a plain centre, nipples threaded one end only for welding, swaged nipples and nipples with BSP threads. BSP male nipples, BSPP to 2", are listed with our stainless BSP adapters. If you need one of the others, ask.',
    },
    { type: 'section_head', number: '/04', title: 'Schedule, grade and pressure.', anchor: 'schedule' },
    {
      type: 'paragraph',
      html: 'The schedule sets the wall. Sch 80 has the thicker wall, and on our listings the Sch 80 nipples are seamless while the Sch 40 nipples are welded. Cutting an NPT thread removes metal from the wall, so a threaded nipple has less wall at the thread root than the pipe it is made from, and on small Sch 40 sizes that loss is a large share of the wall. That is why Sch 80 is the usual choice for threaded joints that see pressure or vibration. None of the nipple listings publishes a pressure rating, so we do not give one here. Send the design pressure and temperature and we confirm the part.',
    },
    {
      type: 'paragraph',
      html: 'On grade, 316 carries molybdenum and resists chlorides better than 304, which matters on coastal sites and with seawater or brine. See <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316 stainless steel fittings</a> for when the difference is worth paying for. The full nipple range is on the <a href="/c/stainless-steel-pipe-nipples">stainless steel pipe nipples</a> shelf.',
    },
    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li>The nominal size, or both sizes for a reducing nipple.</li><li>The thread: NPT, or BSP if your fittings are British or European.</li><li>The type: pipe nipple, hex or reducing hex.</li><li>The schedule, Sch 40 or Sch 80, and the overall length in mm or inches.</li><li>The grade, 304 or 316, and whether you need a material certificate.</li><li>The working pressure and medium, and quantities per size and length.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What are the dimensions of a 1/2" stainless steel pipe nipple?',
          answer: 'A 1/2" nipple is cut from pipe 21.3 mm across, with a 2.77 mm wall in Sch 40 or 3.73 mm in Sch 80 (ASME B36.19M), and a 1/2-14 NPT thread on each end. Length is ordered separately; the listing tables give every length we hold.',
        },
        {
          question: 'What is a close nipple?',
          answer: 'A nipple threaded along its whole length, with no plain section in the middle. It is the shortest nipple for a given size: on our listings 19 mm for 1/8", 22.2 mm for 1/4" and 25.4 mm for 3/8".',
        },
        {
          question: 'Should I use Sch 40 or Sch 80 nipples?',
          answer: 'Sch 80 has the thicker wall, which leaves more metal under the thread. It is the usual choice for pressure, vibration or corrosive service. Sch 40 suits low-pressure lines where it matches the pipe. Our Sch 80 nipples are seamless and our Sch 40 nipples welded.',
        },
        {
          question: 'Do you have BSP pipe nipples in stainless steel?',
          answer: 'The pipe nipple shelf is NPT. Stainless BSPP male nipples from 1/8" to 2" are listed with our stainless BSP adapters. Tell us the thread and size and we confirm what we have.',
        },
        {
          question: 'What is the HS code for a stainless steel pipe nipple?',
          answer: 'Threaded pipe fittings of steel fall under Harmonized System heading 7307. The subheading, and the national tariff line beyond it, is decided by the importing country’s customs, so confirm it with your broker.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Stainless steel pipe nipples',
      skus: ['IH-PF-N6S8', 'IH-PF-N6W4', 'IH-PF-N4W4', 'IH-PF-N4S8', 'IH-PF-N6H', 'IH-PF-N6RH'],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-pipe-nipples',
      label: 'Stainless steel pipe nipples',
      blurb: 'NPT pipe nipples in 304 and 316, Sch 40 welded and Sch 80 seamless, with hex and reducing hex nipples.',
    },
    {
      type: 'related_articles',
      slugs: ['stainless-threaded-pipe-fittings-150-vs-3000', 'stainless-steel-pipe-fittings-guide', '304-vs-316-stainless-steel-fittings', 'stopping-an-npt-thread-leak'],
    },
    {
      type: 'cta_block',
      heading: 'Ordering stainless pipe nipples?',
      body: 'Send the size, thread, schedule, length and grade for each line. We quote and ship from Dubai, UAE, and check every line against the listing tables before we confirm.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
