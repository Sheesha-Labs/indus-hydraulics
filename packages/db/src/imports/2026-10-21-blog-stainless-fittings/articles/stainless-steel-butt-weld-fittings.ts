import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless butt-weld fittings. Sources read 2026-10-21: ASME B16.9 scope page (NPS ½–48, factory-made wrought
 * buttwelding fittings; excludes low-pressure corrosion-resistant fittings; short-radius elbows formerly B16.28 now
 * included); Engineering ToolBox ASME B36.19M stainless pipe table (5S/10S/40S/80S walls, inch values used as master);
 * MSS SP-43 publisher summary (fittings for Sch 5S and 10S; centre-to-end as B16.9 except lap-joint stub ends);
 * ASTM A403 abstract and older-edition summaries (WP-S seamless, WP-W welded, WP-WX radiographed, WP-WU
 * ultrasonic); Wermac (LR 1.5 × NPS, SR 1.0 × NPS). Listing copy states fittings are "rated to the pipe they are
 * welded to", consistent with B16.9.
 * NOT used: the exact WP-W radiography trigger in the current A403 edition; the A403 materials list beyond grades.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-butt-weld-fittings',
  title: 'Stainless steel butt-weld fittings: ASME B16.9, schedules 10S and 40S, A403 grades and classes',
  excerpt:
    'A butt-weld elbow has no pressure rating of its own: it is rated to the pipe it is welded into. That is why ordering one means naming a schedule, a grade and a class, not a pressure. ASME B16.9 and MSS SP-43, long and short radius, Sch 5S to 80S walls, WP316L and the WP-S, WP-W, WP-WX and WP-WU classes.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Butt-Weld Fittings: B16.9, Sch 10S/40S & A403 Grades',
  seoDescription:
    'Stainless steel butt-weld fittings explained: ASME B16.9 vs MSS SP-43, long vs short radius elbows, Sch 5S, 10S, 40S and 80S wall thickness, ASTM A403 WP304L/WP316L grades and WP-S, WP-W, WP-WX classes.',
  focusKeyword: 'stainless steel butt weld fittings',
  publishedAt: '2026-10-21T16:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A butt-weld fitting is rated to the pipe it is welded to: order it by size, schedule and grade, and it holds what that pipe holds.',
        'ASME B16.9 covers wrought butt-weld fittings from NPS ½ to 48; light-wall Sch 5S and 10S stainless fittings come under MSS SP-43 with the same centre-to-end dimensions.',
        'Stainless pipe walls are set by ASME B36.19M: for 2" pipe, 10S is 0.109" and 40S is 0.154". Match the fitting schedule to the pipe, not just the size.',
        'ASTM A403 grades the material (WP304L, WP316L …) and its class says how the fitting was made and tested: WP-S seamless, WP-W welded, WP-WX radiographed, WP-WU ultrasonically examined.',
        'Short-radius elbows used to be ASME B16.28; they are now part of B16.9.',
      ],
    },
    {
      type: 'lead',
      html: 'Once it is welded in, a butt-weld fitting stops being a fitting and becomes part of the pipe: a full-penetration weld, a smooth bore and no thread or socket for corrosion or product to sit in. That is why it is the default in process, chemical, water and food piping above small bore. It also means everything about it — wall, grade, inspection — has to match the pipe it joins.',
    },

    { type: 'section_head', number: '/01', title: 'B16.9 and MSS SP-43.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<p><strong>ASME B16.9</strong> covers factory-made wrought butt-weld fittings from NPS ½ to 48 (DN 15–1200): their dimensions, tolerances, ratings, testing and marking. Its rating rule is the one to remember — the fitting is rated to the matching pipe of the same material and wall. Since short-radius elbows and returns were folded in from the old B16.28, B16.9 is now the single reference for both radii.</p><p>B16.9 does not cover low-pressure corrosion-resistant fittings. Those are <strong>MSS SP-43</strong>: wrought and fabricated butt-weld fittings for Schedule 5S and 10S stainless pipe, with the same centre-to-end dimensions as B16.9 (except lap-joint stub ends). The thin 5S wall dates from the 1950 edition, for service where contamination rather than corrosion was the main concern. Our Sch 10 fittings carry both standards on the listing.</p>',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B16.9',
      publisher: 'ASME',
      title: 'Factory-Made Wrought Buttwelding Fittings',
      summary:
        'Overall dimensions, tolerances, ratings, testing and marking for wrought butt-weld fittings in NPS ½ through 48 (DN 15–1200), including short-radius elbows and returns formerly in B16.28. Low-pressure corrosion-resistant fittings are excluded and covered by MSS SP-43.',
    },

    { type: 'section_head', number: '/02', title: 'Schedules: match the wall.', anchor: 'schedules' },
    {
      type: 'comparison_table',
      caption: 'Stainless pipe wall thickness by schedule (ASME B36.19M), inches (mm)',
      columns: ['NPS', 'OD', '5S', '10S', '40S', '80S'],
      rows: [
        { cells: ['½"', '0.840" (21.3)', '0.065" (1.65)', '0.083" (2.11)', '0.109" (2.77)', '0.147" (3.73)'] },
        { cells: ['1"', '1.315" (33.4)', '0.065" (1.65)', '0.109" (2.77)', '0.133" (3.38)', '0.179" (4.55)'] },
        { cells: ['2"', '2.375" (60.3)', '0.065" (1.65)', '0.109" (2.77)', '0.154" (3.91)', '0.218" (5.54)'], highlight: true },
        { cells: ['4"', '4.500" (114.3)', '0.083" (2.11)', '0.120" (3.05)', '0.237" (6.02)', '0.337" (8.56)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>At any NPS the outside diameter is the same for every schedule; the schedule changes the wall and so the bore. 5S and 10S exist only for stainless (B36.19M). 40S and 80S match carbon-steel Sch 40 and 80 up to NPS 10 and then part company, so above 10" a "Sch 40" fitting is not automatically the same as a 40S one.</p><p>A fitting thinner than its pipe weakens the joint; one thicker than its pipe leaves a step in the bore at the weld that has to be tapered. Both are avoided by ordering the fitting in the pipe’s schedule.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Grades and classes: ASTM A403.', anchor: 'a403' },
    {
      type: 'prose',
      html: '<p>Stainless butt-weld fittings are made to <strong>ASTM A403</strong>, wrought austenitic stainless piping fittings. The grade carries a WP prefix — WP304, WP304L, WP316, WP316L — and a class that says how the fitting was made and what inspection its welds received:</p><ul><li><strong>WP-S</strong> — made from seamless product.</li><li><strong>WP-W</strong> — welded construction, with radiography required only in the cases the edition specifies (such as welds added by the fitting maker).</li><li><strong>WP-WX</strong> — welded, with all welds radiographed.</li><li><strong>WP-WU</strong> — welded, with all welds ultrasonically examined in place of radiography.</li></ul><p>Projects with full-inspection piping classes call out WP-WX or WP-WU; general service accepts WP-S or WP-W. Choose L grades (WP304L, WP316L) for anything that will be welded — see <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316, and why L</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Shapes: radius, reducers, tees.', anchor: 'shapes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Long-radius elbows</strong> have a centreline radius of 1.5 × NPS; <strong>short-radius</strong> elbows 1 × NPS. Long radius is the default — lower pressure drop and gentler on the flow; short radius only where space forces it.</li><li><strong>45° elbows</strong> for offsets and laterals.</li><li><strong>Concentric reducers</strong> keep the centreline; <strong>eccentric reducers</strong> keep one side flat — flat on top at a pump suction so no air pocket forms, flat on the bottom where a line must drain.</li><li><strong>Equal and reducing tees</strong> and <strong>crosses</strong> for branches; for a branch much smaller than the run, a weld outlet is often used instead (see <a href="/blog/stainless-steel-weld-outlets">weld outlets</a>).</li><li><strong>Caps</strong> close a line end with a full weld.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Purge the root.',
      body: 'A stainless butt weld made without a back purge oxidises on the inside — the "sugaring" that destroys the corrosion resistance the fitting was bought for. Purge the bore with inert gas until the root is welded, and use L-grade fittings so the heat-affected zone does not sensitise.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure is a butt-weld elbow rated for?', answer: 'It has no rating of its own: under ASME B16.9 it is rated to straight pipe of the same material and wall. A Sch 40S 316 elbow holds what Sch 40S 316 pipe holds.' },
        { question: 'What is the difference between Sch 10 and Sch 40 fittings?', answer: 'Wall thickness. For 2" pipe, 10S is 0.109" and 40S is 0.154"; the OD is the same. Order the fitting in the same schedule as the pipe.' },
        { question: 'What does WP316L mean?', answer: 'ASTM A403 grade WP316L — a wrought 316L stainless butt-weld fitting. The class after it (S, W, WX, WU) says whether it is seamless or welded and how its welds were examined.' },
        { question: 'Is ASME B16.28 still used?', answer: 'Short-radius elbows and returns that were in B16.28 are now included in B16.9. B16.28 on an old drawing means a B16.9 short-radius elbow.' },
        { question: 'Long radius or short radius elbow?', answer: 'Long radius (1.5 × NPS) unless space forces short radius (1 × NPS). Long radius has lower pressure loss.' },
        { question: 'Concentric or eccentric reducer at a pump suction?', answer: 'Eccentric, flat side up, so no air pocket forms at the pump inlet.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>304 and 316 butt-weld fittings in Sch 10 and Sch 40, from ½" to 12" NPS:</p>' + stockList(['stainless-steel-butt-weld-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Butt-weld fittings',
      skus: ['IH-PF-W490LES6', 'IH-PF-W445ES6', 'IH-PF-W4TS6', 'IH-PF-W4RTS6', 'IH-PF-W4CRS6', 'IH-PF-W4ERS6', 'IH-PF-W4CS6', 'IH-PF-W190LES6'],
    },
    { type: 'category_link', slug: 'stainless-steel-butt-weld-fittings', label: 'Stainless butt-weld fittings', blurb: '304 and 316, Sch 10 and Sch 40, elbows, tees, reducers, crosses and caps.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'asme-b16-9', text: 'ASME B16.9 — Factory-Made Wrought Buttwelding Fittings, scope.', url: 'https://www.asme.org/codes-standards/find-codes-standards/b16-9-factory-made-wrought-buttwelding-fittings' },
        { id: 'toolbox-b36-19', text: 'Engineering ToolBox. ANSI stainless steel pipes — ASME B36.19M dimensions.', url: 'https://www.engineeringtoolbox.com/ansi-stainless-steel-pipes-d_247.html' },
        { id: 'astm-a403', text: 'ASTM A403/A403M — Wrought Austenitic Stainless Steel Piping Fittings (abstract).', url: 'https://www.dinmedia.de/en/standard/astm-a-403-a-403ma/30074855' },
        { id: 'wermac-sr', text: 'Wermac. Short-radius 90° elbows to ASME B16.9.', url: 'https://www.wermac.org/fittings/dim_elbows_b.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-steel-pipe-fittings-guide', 'stainless-steel-weld-outlets', 'stainless-steel-flanges-asme-b16-5', '304-vs-316-stainless-steel-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Scope from ASME and MSS summaries; walls from ASME B36.19M tables; A403 classes from the specification abstract. Check the current A403 edition for the exact WP-W examination rule.',
    },
    {
      type: 'cta_block',
      heading: 'Quoting a butt-weld package?',
      body: 'Send the sizes, schedule, grade, A403 class and quantities. We will quote the fittings to match the pipe, with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
