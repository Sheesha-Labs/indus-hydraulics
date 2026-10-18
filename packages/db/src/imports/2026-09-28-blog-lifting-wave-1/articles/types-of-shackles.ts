import type { BlogArticleSeed } from '../shared'

/**
 * Shackle types — the head-term article for the Shackles shelf (46 families).
 *
 * Sizes, dimensions and WLLs are read from the live G-209 pattern variants and
 * the 3/4″ rows of five other families on 2026-09-28. The G-209 2-1/2″ row
 * was published at 35 t until the same day (a source error; the pattern
 * rating is 55 t) and was corrected in the payload and the DB before this
 * table included it.
 *
 * "G-209" and friends are The Crosby Group's catalogue numbers. The article
 * says so, and says our parts are made to the pattern rather than being Crosby
 * product — the same line the product pages take.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'types-of-shackles',
  title: 'Types of shackles: anchor vs chain, and screw pin vs bolt type vs round pin',
  excerpt:
    'A shackle is chosen on two decisions: the body shape, which sets the directions it can be loaded from, and the pin, which sets how securely it stays closed. Here is how anchor and chain shackles differ, when each pin type is right, and how material changes the rating at the same size.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Types of shackles: anchor vs chain, screw pin vs bolt type',
  seoDescription:
    'The main types of shackles compared: bow and dee bodies, screw-pin, bolt-type and round-pin shackles, side-load reductions, materials, and when to take one out of service.',
  focusKeyword: 'types of shackles',
  publishedAt: '2026-09-28T09:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A shackle is specified on two independent choices: the body (anchor or chain) and the pin (screw, bolt-type or round).',
        'Anchor (bow) shackles take multiple sling legs and tolerate some side load. Chain (dee) shackles are for a single in-line pull.',
        'Screw pins suit temporary rigging that is checked each time. Bolt-type pins, with a nut and cotter, suit long-term or unattended installations. Round pins are for in-line pulls only.',
        'At the same nominal size, material changes the rating a great deal: at 3/4″, our tables run from about 2 t in stainless to 7 t in Grade 8 alloy.',
        'Discard a shackle with 10% wear, a bent pin, a spread or twisted body, or an unreadable WLL marking.',
      ],
    },
    {
      type: 'lead',
      html: 'Shackles look like a solved problem — a U of steel and a pin — which is why they get picked by size and whatever is in the bin. But there are two separate decisions inside every shackle, and each one fails in its own way. The body shape decides which directions it can be loaded from. The pin decides whether it stays closed.',
    },

    { type: 'section_head', number: '/01', title: 'Anchor or chain: the body.', anchor: 'anchor-or-chain' },
    {
      type: 'paragraph',
      html: 'An <strong>anchor shackle</strong>, also called a bow shackle, has a rounded body wider than the gap between its ears. The extra room lets it gather two or more sling legs, and the curve lets it accept a load that is not exactly in line with the pin. The screw-pin version is the G-209 pattern, the most common rigging shackle in use.',
    },
    {
      type: 'paragraph',
      html: 'A <strong>chain shackle</strong>, also called a dee shackle, has straight parallel sides. It is made to join two things in a straight line — a chain to a padeye, a sling eye to a hook — and it should not be loaded from the side. The screw-pin version is the G-210 pattern.',
    },
    {
      type: 'paragraph',
      html: 'In the carbon-steel Crosby patterns, the shape does not change the rating: at 3/4″ the G-209 anchor, G-210 chain, G-2130 and G-213 are all rated 4.75 t in our tables. What the shape changes is <em>which directions</em> that 4.75 t may come from.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between an anchor shackle and a chain shackle?',
      answer:
        'An anchor (bow) shackle has a rounded body that can gather several sling legs and accept a reduced side load. A chain (dee) shackle has straight sides and is for a single pull in line with its body only. At the same size and grade they usually carry the same WLL; the shape decides how that load may be applied.',
    },

    { type: 'section_head', number: '/02', title: 'Screw, bolt or round: the pin.', anchor: 'pin-types' },
    {
      type: 'comparison_table',
      caption: 'The three pin types',
      columns: ['Pin', 'Use for', 'Avoid'],
      rows: [
        {
          cells: [
            'Screw pin, threaded into one ear — G-209, G-210',
            'Temporary rigging that is checked every time it is made up',
            'Anywhere a rope or load could rotate the pin loose; long-term installations',
          ],
        },
        {
          cells: [
            'Bolt type: bolt, nut and cotter — G-2130, G-2150',
            'Long-term or permanent rigging, and lifts where the pin cannot be checked once loaded',
            'Jobs that need fast re-rigging',
          ],
          highlight: true,
        },
        {
          cells: [
            'Round pin, held by a cotter — G-213, G-215',
            'Tie-down, towing and suspension where the pull is strictly in line',
            'Side loads and multi-leg lifts — the pin can roll under load',
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'Screw pins are quick, and that is their risk. A screw pin must be turned home until the shoulder is fully seated against the ear, and backed off no more than it takes to align the eye. If a sling eye or a running rope bears on the pin, the movement can rotate it loose during the lift. When the shackle will stay rigged for days, or the pin will be out of sight, a bolt-type shackle removes that failure entirely.',
    },
    {
      type: 'paragraph',
      html: 'Round-pin shackles are the lightest of the three and the easiest to misuse. Many site lifting procedures exclude them from lifting altogether and keep them for towing and tie-down.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never replace a shackle pin with a bolt.',
      body: 'A shackle pin is made from the same grade of steel as the body and heat-treated to match it. A bolt from the stores looks like a fit and may have a fraction of the strength. A lost pin means a new shackle, or a replacement pin from the same manufacturer for that exact size and pattern.',
    },

    { type: 'section_head', number: '/03', title: 'What the size means.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'A shackle’s nominal size is roughly the diameter of the steel in its body, and the pin is one step larger. So a 3/4″ G-209 has a 19 mm body, a 22.4 mm pin and a 31.8 mm gap between the ears. For fit, the two numbers that matter are the pin diameter, which has to pass through whatever it is connecting to, and the width between the ears, which has to accept the fitting going the other way.',
    },
    {
      type: 'comparison_table',
      caption: 'G-209 pattern screw-pin anchor shackle — sizes and ratings from our table',
      columns: ['Size', 'Body (mm)', 'Pin (mm)', 'Width at pin (mm)', 'WLL (t)'],
      rows: [
        { cells: ['3/16″', '4.8', '6.3', '9.7', '0.33'] },
        { cells: ['1/4″', '6.3', '7.9', '11.9', '0.5'] },
        { cells: ['5/16″', '7.9', '9.7', '13.5', '0.75'] },
        { cells: ['3/8″', '9.7', '11.2', '16.8', '1'] },
        { cells: ['7/16″', '11.2', '12.7', '19.0', '1.5'] },
        { cells: ['1/2″', '12.7', '16.0', '20.6', '2'] },
        { cells: ['5/8″', '16.0', '19.0', '26.9', '3.25'] },
        { cells: ['3/4″', '19.0', '22.4', '31.8', '4.75'], highlight: true },
        { cells: ['7/8″', '22.4', '25.4', '36.6', '6.5'] },
        { cells: ['1″', '25.4', '28.7', '42.9', '8.5'] },
        { cells: ['1-1/8″', '29.5', '31.8', '46.0', '9.5'] },
        { cells: ['1-1/4″', '32.8', '35.1', '51.6', '12'] },
        { cells: ['1-3/8″', '36.1', '38.1', '57.1', '13.5'] },
        { cells: ['1-1/2″', '39.1', '41.4', '60.5', '17'] },
        { cells: ['1-3/4″', '46.7', '50.8', '73.2', '25'] },
        { cells: ['2″', '52.8', '57.1', '82.5', '35'] },
        { cells: ['2-1/2″', '68.8', '69.8', '104.9', '55'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The G-number is The Crosby Group’s catalogue number for each shape, and it has become the trade’s shorthand for the shape and its ratings. Our shackles are made to those patterns and cross-referenced to them on each product page; they are not Crosby products.',
    },

    { type: 'section_head', number: '/04', title: 'Material changes the rating.', anchor: 'material' },
    {
      type: 'paragraph',
      html: 'Two shackles of the same nominal size can differ in strength by a factor of three. The size stamp tells you the dimensions; only the WLL stamp tells you what it can carry.',
    },
    {
      type: 'comparison_table',
      caption: 'The same 3/4″ size in four materials, from our tables',
      columns: ['Shackle', 'Material', 'WLL'],
      rows: [
        { cells: ['Stainless steel screw-pin anchor shackle, US type', 'Stainless 304 or 316', '4,470 lb (about 2.0 t)'] },
        { cells: ['Commercial-grade screw-pin anchor shackle', 'Carbon steel', '3.25 t'] },
        { cells: ['G-209 pattern screw-pin anchor shackle', 'Carbon steel, quenched and tempered', '4.75 t'] },
        { cells: ['Grade 8 alloy screw-pin anchor shackle', 'Alloy steel', '7 t'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: '<strong>Alloy</strong> shackles carry the most at a given size, and are what you want where a shackle has to pass through a small lifting point. <strong>Stainless</strong> shackles are chosen for corrosion — marine, food and chemical service — and carry a good deal less. <strong>Commercial-grade</strong> shackles are light-duty general rigging; use one for lifting only if it is marked with a WLL and covered by a certificate.',
    },
    {
      type: 'paragraph',
      html: 'Metric European bow and dee shackles are rated on a different basis again, often in kilograms: our 20 mm European large bow shackle is rated 1,100 kg. Never assume two shackles of similar size are interchangeable.',
    },

    { type: 'section_head', number: '/05', title: 'Side loading and multi-leg rigging.', anchor: 'side-loading' },
    {
      type: 'paragraph',
      html: 'Only anchor shackles should be side-loaded, and even then the WLL falls. The reduction most manufacturers of these patterns publish is:',
    },
    {
      type: 'comparison_table',
      caption: 'Anchor (bow) shackle WLL under side load',
      columns: ['Load angle from the shackle’s centre line', 'Usable share of WLL', 'On a 4.75 t shackle'],
      rows: [
        { cells: ['0° — in line', '100%', '4.75 t'] },
        { cells: ['45°', '70%', '3.3 t'] },
        { cells: ['90° — square to the body', '50%', '2.4 t'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'When a bow shackle gathers two sling legs, the legs go in the bow and the pin goes on the hook or lifting point, never the other way round. Keep the angle between the legs to 120° or less. Loading the legs across the pin spreads the ears and puts a bending load on the pin it was not designed for.',
    },
    {
      type: 'paragraph',
      html: 'The sling angle also raises the load in each leg — at 120° between legs, each leg carries the whole weight. Our guide to <a href="/blog/working-load-limit-vs-breaking-strength">working load limit and breaking strength</a> works through the numbers.',
    },

    { type: 'section_head', number: '/06', title: 'Specialist shapes.', anchor: 'specialist-shapes' },
    {
      type: 'prose',
      html: '<p>Beyond the six Crosby patterns, several shapes solve particular problems:</p><ul><li><strong>Wide-body sling shackles</strong> have a large bearing radius so a synthetic sling or wire rope bends gently over the bow rather than being pinched. They protect the sling and keep more of its rating. Ours run from 7 t to 500 t.</li><li><strong>Grade S shackles to AS 2741</strong> and <strong>BS 3032 shackles</strong> are the Australian and British standard designs, specified by name on projects that follow those standards.</li><li><strong>DIN 82101 shackles</strong> are the German marine pattern, in forms A, B and C.</li><li><strong>Kenter and joining shackles</strong> connect lengths of anchor chain and pass over a windlass; they belong with anchor chain, not lifting gear.</li><li><strong>Snap shackles</strong> release under load for sailing and are not lifting components.</li></ul>',
    },

    { type: 'section_head', number: '/07', title: 'When to take a shackle out of service.', anchor: 'inspection' },
    {
      type: 'prose',
      html: '<p>Check before every use and at every thorough examination. Remove the shackle if any of these is true:</p><ul><li>The body is spread, bent or twisted, or the ears are out of line.</li><li>The pin is bent, its thread is damaged, or it will not screw fully home by hand.</li><li>Wear anywhere reaches 10% of the original dimension — the removal criterion in ASME B30.26.</li><li>There are cracks, deep nicks or gouges, or signs of heat damage or weld spatter.</li><li>The WLL, size or manufacturer marking is missing or unreadable.</li><li>The pin is not the original, or not a genuine replacement for that size and pattern.</li></ul><p>A shackle is never repaired by welding, grinding out a crack or heating it to straighten it.</p>',
    },
    {
      type: 'product_embed',
      heading: 'The shackles in this guide',
      skus: [
        'IH-LR-SH-G209',
        'IH-LR-SH-G210',
        'IH-LR-SH-G2130',
        'IH-LR-SH-G2150',
        'IH-LR-SH-G213',
        'IH-LR-SH-8ASPAS',
        'IH-LR-SH-WBSSSP',
        'IH-LR-SH-SSA',
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is a bow shackle the same as an anchor shackle?',
          answer:
            'Yes. Bow shackle and anchor shackle are two names for the rounded-body shape. Dee shackle and chain shackle are likewise two names for the straight-sided shape.',
        },
        {
          question: 'Can a D shackle be side-loaded?',
          answer:
            'No. A chain (dee) shackle is for a load in line with its body only. If the load will come from more than one direction, or the shackle gathers more than one sling leg, use an anchor (bow) shackle and apply its side-load reduction.',
        },
        {
          question: 'Which shackle should I use for an overhead lift?',
          answer:
            'A rated screw-pin or bolt-type shackle with a legible WLL and a test certificate. Choose bolt type where the shackle stays rigged or the pin cannot be checked once loaded. Avoid round-pin shackles for lifting.',
        },
        {
          question: 'Should I mouse a screw pin?',
          answer:
            'Where the pin could be turned by the load or by vibration, yes — seizing wire through the pin eye and around the body stops it backing out. On long-term installations a bolt-type shackle is the better fix.',
        },
        {
          question: 'What does G-209 mean?',
          answer:
            'It is The Crosby Group’s catalogue number for its screw-pin anchor shackle, and it is widely used to describe that shape and its ratings. Our G-209 pattern shackles match the pattern’s dimensions and ratings; they are not Crosby products.',
        },
        {
          question: 'Does galvanising reduce a shackle’s rating?',
          answer:
            'Not when the manufacturer galvanises it and rates it as galvanised. Galvanising a shackle yourself is a different matter: the heat of the zinc bath can affect a quenched-and-tempered part, so it should not be done after manufacture.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: '46 shackle families — anchor, chain, alloy, stainless, marine and wide-body — with full size tables.',
    },
    {
      type: 'category_link',
      slug: 'rigging-hardware',
      label: 'Rigging hardware',
      blurb: 'Shackles, hooks, master links, eye bolts and turnbuckles.',
    },
    {
      type: 'related_articles',
      slugs: ['working-load-limit-vs-breaking-strength', 'sling-angle-chart', 'eye-bolt-types-and-angled-loads', 'turnbuckle-types', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'Dimensions and WLLs are taken from the size tables on the linked product pages. The side-load reductions are the values commonly published for Crosby-pattern bow shackles; a specific manufacturer’s published figures govern.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a shackle to a lifting point?',
      body: 'Send the WLL you need and the pin and jaw clearance available, or a photo of the shackle you are replacing. We will quote the right pattern and size, with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
