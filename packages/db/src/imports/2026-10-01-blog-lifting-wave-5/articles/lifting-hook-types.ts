import type { BlogArticleSeed } from '../shared'

/**
 * Lifting hook types — eye, clevis, shank, swivel; slip vs grab; latches;
 * removal criteria.
 *
 * Sources checked 2026-10-01: Kito Crosby hooks & swivels warnings (2025) —
 * hook uses by type, latch never supports load, no side/back/tip loading,
 * plain swivels not to rotate under load vs bearing swivels, Shur-Loc removal
 * at 5% throat opening up to 6 mm; Crosby catalogue (2022) p.390 — grab hook
 * shortening −20% unless a cradle grab hook; choke −20%; OSHA 29 CFR
 * 1910.184 (e)(9)(ii) and (f)(5)(vi), 1910.179(j)(2)(iii) — 15% throat /
 * 10° twist. Product figures from our H-330 grab hook and 320 hoist hook rows.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-hook-types',
  title: 'Lifting hook types: eye, clevis and swivel hooks, sling vs grab hooks, and latches',
  excerpt:
    'Hooks are chosen on two things: how they attach (eye, clevis, shank or swivel) and what they do (a sling or slip hook holds a load in its bowl; a grab hook grips a chain link). Use a grab hook to shorten a chain and the sling loses 20% unless the hook is a cradle type. Here is how the types differ, and when a hook comes out of service.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting hook types: eye vs clevis vs swivel, sling vs grab hooks',
  seoDescription:
    'Types of lifting hooks explained: eye, clevis, shank and swivel hooks; sling vs grab hooks and the 20% shortening reduction; latches; and hook removal criteria.',
  focusKeyword: 'types of lifting hooks',
  publishedAt: '2026-10-01T12:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Eye, shank and swivel hooks attach to wire rope or chain fittings; clevis hooks pin directly onto a chain link.',
        'Sling (slip) hooks hold the load in their bowl. Grab hooks have a narrow throat that grips a chain link and are used to shorten or anchor chain.',
        'Shortening a chain sling with a standard grab hook reduces its WLL by 20%. A cradle grab hook, which supports the link, avoids the reduction.',
        'A latch keeps a slack sling in the hook. It must never carry load. The load belongs in the bowl — never on the tip, side or back of the hook.',
        'Remove a hook whose throat has opened or that is twisted. US regulations set 15% and 10°; one major maker’s limit is a 5% opening, up to 6 mm.',
      ],
    },
    {
      type: 'lead',
      html: 'Hooks look interchangeable and are not. The way a hook attaches decides what it can be fitted to; its shape decides what it can hold; and its throat — the gap at the tip — is the first thing to tell you it has been overloaded.',
    },

    { type: 'section_head', number: '/01', title: 'How the hook attaches.', anchor: 'attachment' },
    {
      type: 'comparison_table',
      caption: 'Hook attachment types',
      columns: ['Type', 'Attaches by', 'Typical use'],
      rows: [
        { cells: ['Eye hook', 'A forged eye that takes a shackle, master link or thimbled rope', 'Wire rope and chain slings, hoists'] },
        { cells: ['Clevis hook', 'A clevis and pin straight onto a chain link', 'Chain slings — no connecting link needed'] },
        { cells: ['Shank hook', 'A threaded shank fixed into a block or hoist', 'Built into blocks and crane bottom blocks'] },
        { cells: ['Swivel hook', 'An eye or clevis on a swivel', 'Positioning a load or letting the sling find its line'] },
      ],
    },
    {
      type: 'paragraph',
      html: '<strong>Swivel hooks are not all the same.</strong> A plain swivel hook is for turning the hook into position with no load on it; it is not made to rotate under load. A bearing swivel hook, built around a thrust bearing, is designed to rotate while loaded. Check which you have before spinning a load on it.',
    },

    { type: 'section_head', number: '/02', title: 'Sling hooks and grab hooks.', anchor: 'sling-vs-grab' },
    {
      type: 'paragraph',
      html: 'A <strong>sling hook</strong> — also called a slip hook — has a wide, rounded bowl to hold a sling, ring or link. A <strong>grab hook</strong> has a narrow, straight-sided throat sized to slip over one chain link edgeways and hold it, so it is used to shorten a chain leg or anchor a chain at a point along its length.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Shortening with a grab hook costs 20%.',
      body: 'When a chain sling is shortened with a standard grab hook, its WLL must be reduced by 20%. A cradle grab hook, which supports the link along its length, or a purpose-made shortening clutch, avoids the reduction.',
    },
    {
      type: 'paragraph',
      html: 'Grade and material set the rating. In our 3/8″ clevis grab hooks, the alloy version is rated 7,100 lb and the carbon-steel version 5,400 lb. On a lifting chain sling, the hooks must match the chain grade.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a sling hook and a grab hook?',
      answer:
        'A sling (slip) hook has a wide rounded bowl to hold a sling, ring or link. A grab hook has a narrow throat that grips a single chain link edgeways, for shortening or anchoring chain. Shortening a chain sling with a standard grab hook reduces its WLL by 20%; a cradle grab hook avoids the reduction.',
    },

    { type: 'section_head', number: '/03', title: 'Latches and where the load sits.', anchor: 'latches' },
    {
      type: 'paragraph',
      html: 'A safety latch closes the throat so a sling cannot jump out when it goes slack. It is not a structural part: <strong>the latch must never carry load</strong>. Latches may be required by regulation, by the relevant ASME B30 volume or by an insurer, so check the site rules before removing or omitting one.',
    },
    {
      type: 'paragraph',
      html: 'The load must sit in the bowl, in line with the hook. Do not load the tip, the side or the back of a hook. A sling that rides up onto the point, or two legs spread wide across the bowl, puts the hook in bending it was not designed for. No more than two legs should go onto a hook, with no more than 90° between them; more than that needs a master link — see our <a href="/blog/master-links-explained">guide to master links</a>.',
    },

    { type: 'section_head', number: '/04', title: 'When a hook comes out of service.', anchor: 'removal' },
    {
      type: 'comparison_table',
      caption: 'Hook removal criteria',
      columns: ['Condition', 'US regulation (OSHA)', 'One major hook maker'],
      rows: [
        { cells: ['Throat opening increased', 'More than 15%', 'More than 5%, up to 6 mm'], highlight: true },
        { cells: ['Twist from the plane of the hook', 'More than 10°', 'Any visible twist; tip bent more than 10°'] },
        { cells: ['Wear', '—', 'More than 5–10% of the original section, depending on where'] },
        { cells: ['Cracks, nicks, heat damage', 'Remove', 'Remove'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The stricter figure is the safer one to work to, and the maker’s instructions for the hook in use govern. An opened throat is a clear sign a hook has been overloaded; measure it against the hook’s original dimension.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a hook',
      intro: 'Attachment first, then shape.',
      branches: [
        { condition: 'Fitting directly onto a chain sling leg', outcome: 'Clevis hook of the same grade as the chain.' },
        { condition: 'Fitting onto a shackle, master link or thimbled rope', outcome: 'Eye hook.' },
        { condition: 'Load must turn while lifted', outcome: 'Bearing swivel hook — not a plain swivel.' },
        { condition: 'Shortening or anchoring chain', outcome: 'Cradle grab hook or shortening clutch to keep the full rating.' },
        { condition: 'Sling could come slack during the lift', outcome: 'Hook with a safety latch.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hooks in this guide',
      skus: ['IH-LR-HK-320L', 'IH-LR-HK-322L', 'IH-LR-HK-319L', 'IH-LR-HK-330', 'IH-LR-HK-324L', 'IH-LR-G8-CSHL', 'IH-LR-G8-SHPL'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can a hook latch carry load?',
          answer:
            'No. A latch only keeps a slack sling in the hook. The load must sit in the bowl of the hook; a latch carrying load can fail without warning.',
        },
        {
          question: 'Does shortening a chain with a grab hook reduce the WLL?',
          answer:
            'With a standard grab hook, yes — by 20%. A cradle grab hook or a shortening clutch is designed to keep the full rating.',
        },
        {
          question: 'Can a swivel hook turn under load?',
          answer:
            'Only if it is a bearing swivel designed to rotate under load. A plain swivel hook is for positioning with no load on it.',
        },
        {
          question: 'When should a hook be thrown away?',
          answer:
            'When its throat has opened, it is twisted, it is worn or cracked, or it shows heat damage. US regulations set 15% opening and 10° twist; at least one major maker uses 5% opening, up to 6 mm.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-hooks',
      label: 'Lifting hooks',
      blurb: 'Eye, clevis, shank and swivel hooks; sling and grab hooks; carbon and alloy.',
    },
    {
      type: 'category_link',
      slug: 'grade-80-chain-fittings',
      label: 'Grade 80 chain fittings',
      blurb: 'Grade 80 clevis and eye sling hooks, grab hooks and shortening clutches.',
    },
    {
      type: 'related_articles',
      slugs: ['master-links-explained', 'lifting-gear-rejection-criteria', 'chain-grades-explained', 'types-of-shackles', 'working-load-limit-vs-breaking-strength'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Removal criteria from OSHA 29 CFR 1910.184 and 1910.179 and published manufacturer warnings; grab hook reduction from published manufacturer data. Product figures from the linked size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing hooks on a sling or hoist?',
      body: 'Tell us the chain or rope size and grade, the attachment and the WLL. We will quote a matching hook with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
