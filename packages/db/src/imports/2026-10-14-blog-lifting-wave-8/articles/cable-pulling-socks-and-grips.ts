import type { BlogArticleSeed } from '../shared'

/**
 * Cable socks / pulling grips for MEP and electrical contractors. Checked 2026-10-14: grip maker
 * catalogues (single vs double weave, offset eye, split lace; safety factor 5 for pulling grips,
 * 10 for support grips; attach only at the eye; bands near the mesh tail) — medium; cable makers'
 * pulling-tension method (pulling-eye formula, basket-grip limit, sidewall pressure) stated as
 * "cable makers publish" with the maker's figure governing — no numbers quoted as rules.
 * Our listings: "A pulling grip, not a lifting sling."
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cable-pulling-socks-and-grips',
  title: 'Cable pulling socks and grips: choosing, fitting and staying within the cable’s limits',
  excerpt:
    'Every cable pull through a duct or trench ends in a woven steel sock gripping the cable. Choose the wrong size or type and it slips, or worse, pulls the cable past what it can take. The types of cable sock — single eye, double eye, side pull, high-voltage — how to size and fit them, why a swivel matters, and why the cable maker’s pulling limits govern the job, not the grip.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Cable Pulling Socks and Grips: Types, Sizing, Fitting',
  seoDescription:
    'How to choose and fit a cable sock (cable pulling grip): single eye, double eye, side pull and HV types, sizing to cable diameter, swivels, securing the tail, safety factors, and staying within the cable maker’s pulling-tension limits.',
  focusKeyword: 'cable sock',
  publishedAt: '2026-10-14T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A cable sock is a pulling grip, not a lifting sling — never use it to lift loads or people.',
        'Size it to the cable’s outside diameter; a sock too large slips, one too small will not go on or will damage the sheath.',
        'Fit a swivel between sock and pulling rope so the rope’s twist is not passed into the cable.',
        'Secure the sock’s tail with tape or bands so it cannot release, and attach only at the eye.',
        'The cable maker’s pulling-tension and bending limits govern the pull, not the grip’s breaking strength.',
      ],
    },
    {
      type: 'lead',
      html: 'MEP and electrical contractors pull kilometres of cable on a typical Gulf project: feeders through ducts, cables along trenches, risers up shafts. At the front of every pull is a cable sock — a woven steel mesh that tightens on the cable as it is pulled. It is simple and cheap, and it is also the one part of the pull that touches the cable directly. Choose and fit it badly and the pull stops, the sheath tears, or the cable is overstressed without anyone noticing.',
    },

    { type: 'section_head', number: '/01', title: 'Types of cable sock.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Cable sock types',
      columns: ['Type', 'Used for'],
      rows: [
        { cells: ['Single eye', 'Pulling a single cable end through a duct or along a trench'], highlight: true },
        { cells: ['Double eye', 'Pulling from either end, or joining two pulls'] },
        { cells: ['Side pull (split / lace-up)', 'Gripping a cable mid-length where the end is not free'] },
        { cells: ['High-voltage', 'Large-diameter HV cables'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/single-eye-cable-sock-cable-pulling-grip">single-eye</a>, <a href="/p/double-eye-cable-sock-cable-pulling-grip">double-eye</a> and <a href="/p/side-pull-cable-sock-cable-pulling-grip">side-pull</a> cable socks cover cable diameters from 6–10 mm to 120–150 mm, and the <a href="/p/high-voltage-cable-sock-cable-pulling-grip">high-voltage sock</a> from 25–70 mm to 500–630 mm. Makers also offer single- and double-weave meshes — double weave is stronger — and offset-eye designs for pulling round bends.',
    },
    {
      type: 'direct_answer',
      question: 'What size cable sock do I need?',
      answer:
        'One whose diameter range covers the cable’s outside diameter. A sock that is too large will not grip and can slip off; one that is too small will not slide on or will damage the sheath. Choose the type for the job — single eye for most end pulls, side pull where the cable end is not free.',
    },

    { type: 'section_head', number: '/02', title: 'Fitting the sock.', anchor: 'fitting' },
    {
      type: 'prose',
      html: '<ol><li><strong>Push the sock fully onto the cable</strong>, compressing the mesh so it covers the full grip length.</li><li><strong>Stretch it tight</strong> from the eye so the mesh closes down on the sheath.</li><li><strong>Secure the tail</strong> with tape or bands near the end of the mesh — grip makers recommend bands so the sock cannot release.</li><li><strong>Fit a swivel</strong> between the eye and the pulling rope so rope twist is not transferred into the cable.</li><li><strong>Attach only at the eye</strong>, with a shackle or link rated for the pull, and never modify the grip.</li></ol>',
    },

    { type: 'section_head', number: '/03', title: 'The cable’s limits govern.', anchor: 'limits' },
    {
      type: 'paragraph',
      html: 'A cable sock can be far stronger than the cable it grips. What limits the pull is the cable: its maximum pulling tension, its minimum bending radius, and the sidewall pressure it can take round bends. Cable makers publish methods for each — a maximum tension through a pulling eye based on conductor material and size, a lower limit when pulling with a grip on the sheath, and sidewall limits at bends — and those figures govern. Grip makers, for their part, recommend a working safety factor of about 5 on a pulling grip’s strength. Use a dynamometer on long or difficult pulls and stop if tension approaches the cable maker’s limit.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not for lifting.',
      body: 'Cable socks are pulling grips. Our listings say so on every size: they are not lifting slings and must never be used to lift or suspend loads or people. For supporting cables in risers, use support grips designed and rated for that purpose.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a cable sock?', answer: 'A woven steel mesh grip that tightens on a cable as it is pulled, used to pull cable through ducts and along trenches.' },
        { question: 'Do I need a swivel with a cable sock?', answer: 'Yes. A swivel between the sock and pulling rope stops rope twist being passed into the cable.' },
        { question: 'How do I stop a cable sock slipping off?', answer: 'Use the right size, push it fully on, stretch it tight and secure the tail with tape or bands.' },
        { question: 'How much can I pull with a cable sock?', answer: 'As much as the cable maker’s pulling limits allow — not the sock’s strength. Grip makers also recommend keeping to about one-fifth of the grip’s breaking strength.' },
        { question: 'Can a cable sock be used for lifting?', answer: 'No. It is a pulling grip, not a lifting sling.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Cable socks and pulling hardware',
      skus: ['IH-LR-CS-SE', 'IH-LR-CS-DE', 'IH-LR-CS-SP', 'IH-LR-CS-HV', 'IH-LR-RL-G401', 'IH-LR-HO-WRP'],
    },
    {
      type: 'category_link',
      slug: 'cable-socks',
      label: 'Cable socks',
      blurb: 'Single-eye, double-eye, side-pull and high-voltage cable pulling grips.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'power',
      label: 'Power and energy',
      blurb: 'Cable and electrical installation supply.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['snap-hooks-and-quick-links', 'site-mobilisation-rigging-kit', 'snatch-block-vs-pulley-block', 'working-load-limit-vs-breaking-strength'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Grip types, fitting and safety factors from cable grip makers’ catalogues; pulling limits per cable makers’ engineering guides. Your cable maker’s figures govern.',
    },
    {
      type: 'cta_block',
      heading: 'Pulling cable on a project?',
      body: 'Send the cable diameters and pull types. We will quote cable socks, swivels and pulling hardware to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
