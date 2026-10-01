import type { BlogArticleSeed } from '../shared'

/**
 * Crosby pattern numbers decoded.
 *
 * Source: Crosby & Gunnebo Industries Catalog, Imperial 2025-2026 (Kito
 * Crosby), checked 2026-10-01 — prefix key (p.3), product pages, product
 * identification (p.15), "Red Pin" / "Red U-Bolt" marks, and the note that
 * Crosby warnings apply to Crosby products only.
 * Not in the current catalogue (so described as numbers "still used in the
 * trade", never as current Crosby products): H-323, H-324, A-324, H-330,
 * H-331, G-401, G-275. The H / HG / M letters are not in Crosby's key and are
 * not explained.
 * Several of our pattern families carry those legacy numbers in their titles;
 * the copy says so plainly.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'crosby-pattern-numbers-explained',
  title: 'Crosby pattern numbers decoded: G-209, G-2130, S-320 and what the letters mean',
  excerpt:
    'G-209, S-209, G-2130, A-342 — Crosby’s catalogue numbers have become the trade’s shorthand for rigging shapes. The letter tells you the finish or material; the number tells you the shape. Here is the key, a table of the common numbers, and why a part made to a Crosby pattern is not a Crosby part.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Crosby part numbers decoded: G-209, G-2130, S-320 and prefixes',
  seoDescription:
    'What Crosby pattern numbers like G-209, S-209, G-2130 and A-342 mean: the letter prefixes, a table of common numbers, and the difference between a pattern part and a genuine Crosby part.',
  focusKeyword: 'crosby part numbers',
  publishedAt: '2026-10-01T15:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'In Crosby’s numbering the letter is the finish or material and the number is the shape: G-209 and S-209 are the same screw-pin anchor shackle, coated and self-coloured.',
        'Crosby’s key: G = coated for corrosion protection (often hot-dip galvanized), S or SC = self-coloured, painted or oiled, A = alloy, C = carbon, SS = stainless, L = supplied with a latch.',
        'The numbers are so widely used that other makers make parts “to the G-209 pattern” — the same shape and ratings, but not Crosby parts.',
        'A pattern part’s rating comes from its own maker’s certificate. Crosby’s warnings and application data apply to Crosby products only.',
        'Some numbers still used in the trade, including several on our own pattern pages, no longer appear in Crosby’s current catalogue.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask a rigger for “a 3/4 two-oh-nine” and you will get a screw-pin anchor shackle of that size from almost anyone. The Crosby Group’s catalogue numbers have become the common language for rigging hardware, including for parts Crosby did not make. Reading them properly tells you the shape, the finish and the material — and knowing where they stop tells you what a pattern part does and does not promise.',
    },

    { type: 'section_head', number: '/01', title: 'The letter: finish or material.', anchor: 'prefixes' },
    {
      type: 'comparison_table',
      caption: 'Crosby prefix key (Crosby catalogue)',
      columns: ['Prefix', 'Means'],
      rows: [
        { cells: ['G', 'Coated for corrosion protection — may be hot-dip galvanized, electro-deposited or another coating'], highlight: true },
        { cells: ['S or SC', 'Self-coloured, painted or oiled'], highlight: true },
        { cells: ['A', 'Alloy steel'] },
        { cells: ['C', 'Carbon steel'] },
        { cells: ['SS', 'Stainless steel'] },
        { cells: ['B', 'Bronze'] },
        { cells: ['L', 'Hook supplied with a latch kit'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'So G-209 and S-209 are one product in two finishes, with one rating table. G-2130 and S-2130 are the bolt-type anchor shackle, galvanized or self-coloured. A-342 is an alloy master link. Prefixes such as H, HG and M also appear in catalogues and on the market, but they are not in Crosby’s published key.',
    },

    { type: 'section_head', number: '/02', title: 'The number: the shape.', anchor: 'numbers' },
    {
      type: 'comparison_table',
      caption: 'Common Crosby numbers and the shapes they describe',
      columns: ['Number', 'What it is', 'Our guide'],
      rows: [
        { cells: ['G-209 / S-209', 'Screw-pin anchor (bow) shackle', 'Shackle types'] },
        { cells: ['G-210', 'Screw-pin chain (dee) shackle', 'Shackle types'] },
        { cells: ['G-213 / G-215', 'Round-pin anchor / chain shackle', 'Shackle types'] },
        { cells: ['G-2130 / G-2150', 'Bolt-type anchor / chain shackle', 'Shackle types'] },
        { cells: ['G-2140', 'Alloy bolt-type anchor shackle', 'Shackle types'] },
        { cells: ['G-2160', 'Wide-body shackle', 'Shackle types'] },
        { cells: ['A-342', 'Alloy master link', 'Master links'] },
        { cells: ['S-319', 'Shank hook', 'Lifting hook types'] },
        { cells: ['L-320 / L-322', 'Eye hook / swivel hook with latch (also seen as S-320 / S-322)', 'Lifting hook types'] },
        { cells: ['A-330 / A-331', 'Alloy clevis grab hook / clevis slip hook', 'Lifting hook types'] },
        { cells: ['G-402 / G-403', 'Regular swivel / jaw end swivel', '—'] },
        { cells: ['G-411 / G-414', 'Standard / extra-heavy wire rope thimble', 'Thimble types'] },
        { cells: ['G-416 / G-417', 'Open / closed spelter socket', 'Spelter sockets'] },
        { cells: ['S-421T', 'Wedge socket', 'Spelter sockets'] },
        { cells: ['G-450 / G-429', 'Wire rope clip / fist grip', 'Wire rope clips'] },
        { cells: ['S-505 / S-506', 'Flemish eye sleeve / duplex sleeve', 'Eye terminations'] },
        { cells: ['G-277 / G-291', 'Shoulder nut eye bolt / regular nut eye bolt', 'Eye bolts'] },
        { cells: ['S-279 / M-279', 'Machinery eye bolt, UNC / metric thread', 'Eye bolts'] },
        { cells: ['G-335', 'Split connecting link', '—'] },
        { cells: ['HG-223, HG-226, HG-227, HG-228', 'Turnbuckles: hook & hook, eye & eye, jaw & eye, jaw & jaw', 'Turnbuckle types'] },
        { cells: ['404 / 418 / 419', 'McKissick snatch blocks: tail board / hook / shackle', 'Snatch blocks'] },
      ],
    },
    {
      type: 'paragraph',
      html: '<strong>Older numbers.</strong> Some numbers still in everyday use — H-323 and H-324 eye hooks, H-330 and H-331 clevis hooks, G-401 chain swivels, G-275 screw eyes — no longer appear in Crosby’s current catalogue, and several of our own pattern pages carry them. We use them the way the trade does: as a name for a shape. Hook and swivel numbering has also changed, with the latched eye and swivel hooks now sold as L-320 and L-322.',
    },
    {
      type: 'direct_answer',
      question: 'What does the G in G-209 mean?',
      answer:
        'In Crosby’s numbering, G means the part is coated for corrosion protection — usually hot-dip galvanized, though Crosby’s key also allows other coatings. S means self-coloured, painted or oiled. G-209 and S-209 are the same screw-pin anchor shackle in two finishes, with the same ratings.',
    },

    { type: 'section_head', number: '/03', title: 'Pattern part or Crosby part.', anchor: 'pattern-vs-genuine' },
    {
      type: 'paragraph',
      html: 'Crosby marks its own products: each carries a forged product identification code, its size or working load limit and Crosby’s name or logo. Crosby shackles have its Red Pin, and Crosby wire rope clips its Red U-Bolt. Crosby’s warnings and application information state that they apply to Crosby products only.',
    },
    {
      type: 'paragraph',
      html: 'A part sold “to the G-209 pattern” — like ours — is made to the shape and dimensions that number describes, so it interchanges in a rigging plan. It is not a Crosby product and does not carry Crosby’s marks. Its rating, its material and its test record come from its own manufacturer and that maker’s certificate.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Rate a pattern part from its own certificate.',
      body: 'Do not assume a pattern part carries the Crosby catalogue rating, or that Crosby’s application tables were written for it. Read the WLL marked on the part and stated on its certificate, and follow its maker’s instructions. See our guide to what a test certificate proves.',
    },
    {
      type: 'product_embed',
      heading: 'Some of our pattern ranges',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-HK-320L', 'IH-LR-TH-EH', 'IH-LR-ST-OSSG416', 'IH-LR-FS-S505', 'IH-LR-BP-418'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the difference between G-209 and S-209?',
          answer:
            'Only the finish. G-209 is coated for corrosion protection, usually hot-dip galvanized; S-209 is self-coloured. They are the same screw-pin anchor shackle with the same ratings.',
        },
        {
          question: 'Is a G-209 pattern shackle the same as a Crosby G-209?',
          answer:
            'It is made to the same shape and dimensions, so it interchanges, but it is not a Crosby product. Its rating comes from its own manufacturer’s marking and certificate.',
        },
        {
          question: 'What does the A prefix mean on Crosby parts?',
          answer: 'Alloy steel — for example A-342 alloy master links and A-330 alloy clevis grab hooks.',
        },
        {
          question: 'Why can’t I find H-330 in the Crosby catalogue?',
          answer:
            'Some numbers still used in the trade, including H-330 and H-331 clevis hooks and H-323 and H-324 eye hooks, are no longer in Crosby’s current catalogue. They remain in use as names for those hook shapes.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'rigging-hardware',
      label: 'Rigging hardware',
      blurb: 'Shackles, hooks, links and eye bolts, cross-referenced to the common pattern numbers.',
    },
    {
      type: 'related_articles',
      slugs: ['types-of-shackles', 'lifting-hook-types', 'lifting-gear-test-certificate', 'wire-rope-thimble-types'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Prefix key and product numbers from the Crosby & Gunnebo Industries catalogue (Imperial, 2025-2026). Crosby, Red Pin and Red U-Bolt are Crosby’s marks; our pattern parts are not Crosby products.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering by a Crosby number?',
      body: 'Send the number and size you use. We will quote the matching pattern part from stock, with its own WLL and manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
