import type { BlogArticleSeed } from '../shared'

/**
 * Master links — single links vs assemblies, and sizing.
 *
 * Product figures: our Grade 80 master link assembly to EN 1677-4 — each
 * assembly's WLL equals the EN 818-4 four-leg Grade 8 sling rating (β 0–45°)
 * for its chain size: 6 mm 2.36 t, 8 mm 4.25 t, 10 mm 6.7 t, 13 mm 11.2 t.
 * Maker statements (checked 2026-10-01): RUD sling chain user manual (master
 * link free in the hook bowl); Crosby/Gunnebo hook warnings (never on the
 * point or wedged; max 90° between two legs in a hook; collector ring for more
 * than two legs); Crosby A-342 (5:1, rating covers multi-leg up to 120°
 * included) and A-345 (each sub-link ≤ 75% of assembly WLL).
 * EN 1677-4 scope from the catalogue abstract only.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'master-links-explained',
  title: 'Master links explained: single links, assemblies with sub-links, and sizing to the hook',
  excerpt:
    'The master link is the top of a multi-leg sling: it gathers the legs and sits in the crane hook. Two legs can share a single master link; three or four need an assembly with sub-links. And the link has to fit the hook as well as the chain. Here is how to choose one.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Master links explained: master link vs master link assembly',
  seoDescription:
    'What a master link does, when a sling needs a master link assembly with sub-links, how to size it to the chain and the crane hook, and the fitting rules.',
  focusKeyword: 'master link assembly',
  publishedAt: '2026-10-01T12:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A master link gathers the legs of a sling into one fitting that sits in the crane hook.',
        'One- and two-leg slings use a single master link. Three- and four-leg slings use a master link assembly: a master link with two sub-links, each carrying two legs.',
        'Size the master link to the chain grade and size and to the crane hook it must sit in. It has to hang free in the bowl of the hook, never wedged.',
        'Our Grade 80 EN 1677-4 assemblies are rated to match a four-leg Grade 8 chain sling of the same chain size, up to 45° from vertical.',
        'Never put more than two legs straight onto a hook. More than two legs need a master link or other collector ring.',
      ],
    },
    {
      type: 'lead',
      html: 'Most attention in a chain or wire rope sling goes to the legs. The top fitting is the part that ties it all together, takes the whole load into the crane hook, and is most often the wrong size for the hook it ends up on.',
    },

    { type: 'section_head', number: '/01', title: 'Master link or master link assembly.', anchor: 'link-or-assembly' },
    {
      type: 'comparison_table',
      caption: 'Which top fitting a sling needs',
      columns: ['Sling', 'Top fitting', 'Why'],
      rows: [
        { cells: ['Single leg', 'Master link', 'One leg into one link'] },
        { cells: ['Two-leg', 'Master link', 'Both legs share one link'] },
        { cells: ['Three- or four-leg', 'Master link assembly — master link plus two sub-links', 'Each sub-link takes two legs, so the master link stays free in the hook'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Hanging four legs straight from one master link would crowd them into the link and twist it in the hook. Two sub-links gather the legs in pairs and keep the load on the master link in line. In a US-pattern assembly, each sub-link is rated at no more than three-quarters of the assembly’s WLL.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not more than two legs on a hook.',
      body: 'Two legs may go straight onto a hook if the angle between them is no more than 90° and neither is more than 45° from the hook’s centre line. Three or more legs need a master link or other collector ring so the hook carries a single, in-line load.',
    },

    { type: 'section_head', number: '/02', title: 'Sizing to the chain.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'A master link assembly is matched to the chain size and grade of the sling below it. Our Grade 80 assemblies to EN 1677-4 are rated at exactly the four-leg sling rating for that chain size, up to 45° from vertical:',
    },
    {
      type: 'comparison_table',
      caption: 'Grade 80 master link assembly (EN 1677-4), from our table',
      columns: ['Chain size', 'Assembly WLL'],
      rows: [
        { cells: ['6 mm', '2.36 t'] },
        { cells: ['8 mm', '4.25 t'] },
        { cells: ['10 mm', '6.7 t'], highlight: true },
        { cells: ['13 mm', '11.2 t'] },
        { cells: ['16 mm', '17 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Match the grade as well as the size: a Grade 80 sling needs Grade 80 top fittings, and a Grade 100 sling needs Grade 100. A lower-grade master link limits the whole sling to its rating. The four-leg rating is 2.1 times the single-leg rating, from the sling angle rules in our <a href="/blog/sling-angle-chart">sling angle chart</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Sizing to the hook.', anchor: 'hook-fit' },
    {
      type: 'paragraph',
      html: 'The master link must hang freely in the bowl of the crane hook. A link too small for the hook sits on its point or wedges across the bowl; a link wedged in the hook is loaded in a way neither part was designed for. Large crane hooks — DIN 15401 and similar forged hooks — need enlarged or wider master links made for them.',
    },
    {
      type: 'paragraph',
      html: 'Before ordering, check the hook’s bowl width and depth against the master link’s inside width and length. If the sling will be used on more than one crane, size the link for the largest hook it will meet.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a master link and a master link assembly?',
      answer:
        'A master link is a single oval or pear-shaped link at the top of a one- or two-leg sling. A master link assembly adds two smaller sub-links (intermediate links) below the master link, so a three- or four-leg sling can hang two legs from each sub-link while the master link sits freely in the crane hook.',
    },

    { type: 'section_head', number: '/04', title: 'Standards and design factors.', anchor: 'standards' },
    {
      type: 'paragraph',
      html: '<strong>EN 1677-4</strong> covers Grade 8 master links, intermediate links and master link assemblies for chain, wire rope and textile slings. In the US, master links are made to their makers’ ratings, typically at a 5:1 design factor — higher than the 4:1 of the chain itself — and one maker’s rating applies to single-leg use and to multi-leg slings with up to 120° between legs.',
    },
    {
      type: 'paragraph',
      html: '<strong>Welded or forged.</strong> Master links are made both ways. Either is acceptable when it is made and rated for lifting and carries its grade and WLL marking. Check for wear, stretching, nicks and cracks at every inspection, like any other sling component.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing the top fitting',
      intro: 'Three questions.',
      branches: [
        { condition: 'How many legs?', outcome: 'One or two: master link. Three or four: master link assembly.' },
        { condition: 'What chain size and grade?', outcome: 'An assembly of the same grade, rated for that chain size.' },
        { condition: 'Which crane hook?', outcome: 'Check the link hangs free in the hook bowl; use an enlarged link for large forged hooks.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Master links in this guide',
      skus: ['IH-LR-G8-MLAE16774', 'IH-LR-G8-EWMLA', 'IH-LR-G8-MLA', 'IH-LR-G8-WMLAE', 'IH-LR-RL-WAML'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Why does a four-leg sling need sub-links?',
          answer:
            'So that each sub-link carries two legs and the master link takes one, in-line load in the crane hook. Four legs crowded into one link would twist it in the hook.',
        },
        {
          question: 'How do I size a master link assembly?',
          answer:
            'To the chain size and grade of the legs, and to the crane hook. Our Grade 80 EN 1677-4 assemblies are rated at the four-leg sling rating for their chain size, and the link must sit freely in the hook bowl.',
        },
        {
          question: 'Can I put two sling legs straight on a crane hook?',
          answer:
            'Yes, if there is no more than 90° between them and neither is more than 45° from the hook’s centre line. Three or more legs need a master link.',
        },
        {
          question: 'Can a Grade 80 master link be used with Grade 100 chain?',
          answer: 'Only at the Grade 80 rating. A sling is rated at its weakest component, so match the grade of every part.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'grade-80-chain-fittings',
      label: 'Grade 80 chain fittings',
      blurb: 'Master link assemblies, enlarged links, sling hooks and connectors.',
    },
    {
      type: 'category_link',
      slug: 'master-links-rings-swivels',
      label: 'Master links, rings and swivels',
      blurb: 'Weldless and welded master links, rings and swivels.',
    },
    {
      type: 'related_articles',
      slugs: ['sling-angle-chart', 'lifting-hook-types', 'chain-grades-explained', 'types-of-lifting-slings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Ratings from the linked size tables. Fitting rules from published manufacturer instructions; EN 1677-4 scope from the standard’s abstract.',
    },
    {
      type: 'cta_block',
      heading: 'Building a multi-leg sling?',
      body: 'Tell us the chain size and grade, the number of legs and the crane hook. We will quote a master link or assembly that fits both, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
