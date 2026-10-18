import type { BlogArticleSeed } from '../shared'

/**
 * DIN 1480 vs DIN 1478. Checked 2026-10-14 (DIN Media): DIN 1480:2005-09 forged open-type bodies,
 * M6–M56, S235JR, load-capacity provisions added in 2005; DIN 1478:2005-09 bodies of steel tube or
 * round bar, steel or A4 stainless, M6–M80, load capacity + inspection bores added in 2005. Both
 * standards cover the BODY only. A maker's note that DIN 1480 suits less demanding uses (Green Pin
 * user instructions). Ratings from live tables at M12/M20/M24/M30 (M16 deliberately omitted: our
 * DIN 1478 M16 row is under query with the supplier).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'din-1480-vs-din-1478-turnbuckle',
  title: 'DIN 1480 vs DIN 1478 turnbuckles: open frame or closed body?',
  excerpt:
    'DIN 1480 and DIN 1478 are the two German standards behind most metric turnbuckles in the Gulf. One is a forged open frame you can see the threads through; the other a closed tube that hides them. What each standard covers, how their ratings compare size for size, how the end fittings change things, and which to choose for bracing, guying, lashing and fencing.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DIN 1480 vs DIN 1478 Turnbuckle: Open Frame vs Closed Body',
  seoDescription:
    'DIN 1480 forged open-frame and DIN 1478 tube-body turnbuckles compared: scope, sizes, working load limits by size and end fitting, thread engagement and inspection holes, galvanised and stainless, and where each is used.',
  focusKeyword: 'din 1480 turnbuckle',
  publishedAt: '2026-10-14T08:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'DIN 1480 covers forged open-frame turnbuckle bodies, M6 to M56; DIN 1478 covers closed bodies made from steel tube or round bar, M6 to M80.',
        'Both standards cover the body only — the end fittings (eyes, hooks, jaws, stubs) are separate parts.',
        'Size for size, eye-and-eye ratings in our two ranges are close: M20 is 27 kN (DIN 1480) and 2,700 kg (DIN 1478).',
        'Hook ends cut the rating sharply — our DIN 1478 M20 hook-and-eye is 730 kg.',
        'Open frames show thread engagement at a glance; closed bodies look neater and protect the threads, with inspection holes to check engagement.',
      ],
    },
    {
      type: 'lead',
      html: 'Order “a M20 turnbuckle” in Dubai and you may be asked: 1480 or 1478? The two DIN numbers are the metric world’s common turnbuckle standards. They do the same job — draw two threaded ends together — with different bodies, and the choice matters for inspection, appearance, weight and where the turnbuckle will live. For choosing end fittings, tensioning and locking, see <a href="/blog/how-to-choose-and-tension-a-turnbuckle">how to choose and tension a turnbuckle</a>.',
    },

    { type: 'section_head', number: '/01', title: 'What each standard covers.', anchor: 'scope' },
    {
      type: 'comparison_table',
      caption: 'DIN 1480 vs DIN 1478 (scope from the standards’ published listings)',
      columns: ['Property', 'DIN 1480', 'DIN 1478'],
      rows: [
        { cells: ['Body', 'Forged, open frame', 'Closed, from steel tube or round bar'] },
        { cells: ['Thread range', 'M6 to M56', 'M6 to M80'] },
        { cells: ['Materials in the standard', 'Steel (S235JR)', 'Steel, or A4 stainless'] },
        { cells: ['Thread engagement', 'Visible through the frame', 'Inspection holes added in the 2005 edition'], highlight: true },
        { cells: ['Covers end fittings?', 'No — body only', 'No — body only'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between DIN 1480 and DIN 1478?',
      answer:
        'DIN 1480 covers forged open-frame turnbuckle bodies (M6–M56), where the threads are visible through the frame. DIN 1478 covers closed turnbuckle bodies made from steel tube or round bar (M6–M80), which look neater and protect the threads, with inspection holes to check engagement. Both standards cover the body only; ratings depend on size and end fittings.',
    },

    { type: 'section_head', number: '/02', title: 'Ratings size for size.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Eye-and-eye working load limit, from our live size tables (DIN 1480 in kN, DIN 1478 in kg)',
      columns: ['Thread', 'DIN 1480 eye and eye', 'DIN 1478 eye and eye'],
      rows: [
        { cells: ['M12', '9.3 kN', '930 kg'] },
        { cells: ['M20', '27 kN', '2,700 kg'], highlight: true },
        { cells: ['M24', '39.2 kN', '3,920 kg'] },
        { cells: ['M30', '62.5 kN', '6,250 kg'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'In our ranges the two bodies carry similar eye-and-eye ratings at each thread size (1 kN is about 102 kg). The end fittings change things more than the body does: our <a href="/p/din-1478-turnbuckle-galvanized">DIN 1478</a> M20 is rated 2,700 kg eye-and-eye, 1,650 kg jaw-and-jaw and 730 kg hook-and-eye. That DIN 1478 range is marked not for overhead lifting; use these turnbuckles for tensioning, bracing and lashing. Check each listing’s size table for the exact end fitting you order.',
    },

    { type: 'section_head', number: '/03', title: 'Which to choose.', anchor: 'choosing' },
    {
      type: 'prose',
      html: '<ul><li><strong>DIN 1480 open frame</strong> — the workhorse for bracing, guying and general tensioning. Thread engagement can be checked at a glance and the frame is easy to turn with a bar or spanner. Some makers position plain DIN 1480 bodies for less demanding uses such as rope railings, and recommend load-rated turnbuckles for rigging.</li><li><strong>DIN 1478 closed body</strong> — neater and better protected, so common on architecture, facades, balustrades and anywhere it will be seen; also available in stainless. Use the inspection holes to confirm engagement before loading.</li><li><strong>Stainless</strong> — for marine and coastal exposure; our <a href="/p/stainless-steel-din-1480-turnbuckle">stainless DIN 1480</a> runs M5 to M20.</li><li><strong>Heavier or lifting-adjacent duty</strong> — consider a drop-forged, load-rated turnbuckle; see <a href="/p/drop-forged-turnbuckle-us-type">drop-forged US-type turnbuckles</a>.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'kN or kg?',
      body: 'Turnbuckle tables come in both. 1 kN is about 102 kg (0.102 t). Convert before comparing, and always compare the rating for the end fittings you will use.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which is stronger, DIN 1480 or DIN 1478?', answer: 'In our ranges they carry similar eye-and-eye ratings at the same thread size — for example 27 kN and 2,700 kg at M20. End fittings make the bigger difference.' },
        { question: 'Do DIN 1480 and DIN 1478 include the end fittings?', answer: 'No. Both standards cover the turnbuckle body; eyes, hooks, jaws and stubs are separate parts.' },
        { question: 'How do I check thread engagement on a closed turnbuckle?', answer: 'Use the inspection holes in the body, which the 2005 edition of DIN 1478 introduced; the thread should be visible at or past them.' },
        { question: 'Are DIN turnbuckles available in stainless steel?', answer: 'Yes. DIN 1478 includes A4 stainless, and we supply stainless DIN 1480 from M5 to M20.' },
        { question: 'Can DIN 1478 turnbuckles be used for lifting?', answer: 'Our DIN 1478 listing is marked not for overhead lifting. Use them for tensioning, bracing and lashing.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DIN turnbuckles',
      skus: ['IH-LR-TB-D1480', 'IH-LR-TB-D1478TG', 'IH-LR-TB-SSD1480T', 'IH-LR-TB-CTEEC', 'IH-LR-TB-GRSCB', 'IH-LR-TB-US'],
    },
    {
      type: 'category_link',
      slug: 'turnbuckles-rigging-screws',
      label: 'Turnbuckles and rigging screws',
      blurb: 'DIN 1480 open frame, DIN 1478 closed body, stainless and drop-forged.',
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
      slugs: ['how-to-choose-and-tension-a-turnbuckle', 'turnbuckle-types', 'turnbuckles-for-guy-wires-and-cable-bracing', 'stainless-vs-galvanized-rigging-gulf'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Scope of DIN 1480:2005-09 and DIN 1478:2005-09 from the German standards body’s listings. Ratings from the live Indus size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering DIN turnbuckles?',
      body: 'Send the standard, thread size, end fittings, finish and quantity. We will quote from stock.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
