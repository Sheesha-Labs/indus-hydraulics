import type { BlogArticleSeed } from '../shared'

/**
 * Joining chain sling components: hammerlock-type connecting links vs clevis fittings vs eye
 * fittings. Checked 2026-10-14: EN 1677-1 scope — forged Grade 8 components for slings (medium,
 * catalogue summaries); a maker's riveted "missing link" (G-335 pattern) not suitable for Grade 80
 * or 100 chain in overhead lifting (maker catalogue, high); cold shuts not for overhead lifting
 * (maker text via retailers, medium). Reuse of hammerlock links NOT verified — told to follow the
 * maker. Ratings from the live Indus tables. Brand names (e.g. trade names for hammerlocks) not used.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hammerlock-vs-clevis-chain-fittings',
  title: 'Hammerlocks, clevis fittings and connecting links: joining chain sling components',
  excerpt:
    'Every chain sling joins chain to a master link and a hook somewhere. A hammerlock-type connecting link does it with two halves and a pin; a clevis fitting takes the chain straight onto its pin; an eye fitting needs a link to join it. What each joint is, how they are rated, and the look-alike links that must never be used for lifting.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hammerlock vs Clevis Chain Fittings: Connecting Links Explained',
  seoDescription:
    'How chain sling components are joined: hammerlock-type connecting links, clevis fittings and eye fittings, grade and size matching, EN 1677 components — and the split, riveted and cold-shut links that are not for overhead lifting.',
  focusKeyword: 'hammerlock connecting link',
  publishedAt: '2026-10-14T10:42:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A hammerlock-type connecting link joins chain or an eye fitting to a master link with two halves, a load pin and a retaining bush.',
        'A clevis fitting has its own pin: the chain link goes straight into the clevis, with no separate connector.',
        'An eye fitting needs a connecting link (or a master link) to join it to chain.',
        'Every part must match the chain’s grade and size; the sling is rated to its weakest part.',
        'Riveted repair links, split links and cold shuts look similar and are not for overhead lifting with alloy chain.',
      ],
    },
    {
      type: 'lead',
      html: 'Open up a chain sling and the joints are where the choices are. The chain has to meet the master link at the top and the hooks at the bottom, and each meeting is made one of three ways. All three are sound when the parts are matched and rated; the risk is in using a link that looks like a lifting connector and is not. This guide covers the joints; for the parts themselves see <a href="/blog/master-links-explained">master links explained</a> and <a href="/blog/lifting-hook-types">lifting hook types</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Three ways to join.', anchor: 'joints' },
    {
      type: 'comparison_table',
      caption: 'Joining chain sling components',
      columns: ['Joint', 'How it works', 'Typical use'],
      rows: [
        { cells: ['Hammerlock-type connecting link', 'Two forged halves close over a load pin, held by a bush or retaining pin', 'Chain to master link; eye fittings to chain; assembling slings on site'], highlight: true },
        { cells: ['Clevis fitting', 'The chain link sits in the clevis jaw; a pin and retainer close it', 'Hooks, shorteners and links straight onto chain'] },
        { cells: ['Eye fitting', 'A solid eye, joined by a connecting link or directly onto a master link', 'Hooks on master links; where a fitting must be swapped'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a hammerlock and a clevis fitting?',
      answer:
        'A hammerlock is a separate connecting link that joins two components — chain to a master link, or chain to an eye hook. A clevis fitting has its own pin, so the chain fits straight into it without a separate link. Both are rated for lifting when they match the chain’s grade and size.',
    },

    { type: 'section_head', number: '/02', title: 'Matching grade and size.', anchor: 'matching' },
    {
      type: 'paragraph',
      html: 'Connecting links and clevis fittings are sized to the chain: a 10 mm Grade 80 connecting link in our range is rated 3.15 t, matching 10 mm Grade 80 chain; a 10 mm Grade 100 connector is rated 4 t. Fit the same grade throughout, or accept the lower grade’s rating for the whole sling. European forged components for chain slings are made to EN 1677. See <a href="/blog/grade-80-vs-grade-100-chain-slings">Grade 80 vs Grade 100</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Connecting link ratings at three sizes (from our tables)',
      columns: ['Size', 'Grade 80 connecting link', 'Grade 100 connector'],
      rows: [
        { cells: ['6 mm', '1.12 t', '1.4 t'] },
        { cells: ['10 mm', '3.15 t', '4 t'] },
        { cells: ['16 mm', '8 t', '10 t'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Assembling and re-using.', anchor: 'assembly' },
    {
      type: 'paragraph',
      html: 'Assemble connecting links to the maker’s instructions: the load pin fully home, the bush or retaining pin fitted and secured, and the link able to articulate. Check the maker’s instructions before reassembling a used link — some require new pins or bushes — and if in doubt fit a new one. Any sling assembled or repaired on site needs examination by a competent person before use. See <a href="/blog/lifting-gear-rejection-criteria">lifting gear rejection criteria</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Look-alikes that are not lifting links.',
      body: 'Riveted chain repair links (G-335 pattern and similar) are not suitable for Grade 80 or Grade 100 chain in overhead lifting; cold shuts and split links are not for overhead lifting. Quick links are rated differently again. Use only connecting links rated for the sling’s grade.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a hammerlock?', answer: 'A mechanical connecting link of two halves and a load pin, used to join chain, master links and eye fittings in a chain sling.' },
        { question: 'Is a clevis hook better than an eye hook?', answer: 'Neither is stronger when rated for the same chain. A clevis hook fits straight onto chain; an eye hook needs a connecting link or goes on a master link.' },
        { question: 'Can I use a G-335 link to repair a lifting sling?', answer: 'No. Riveted repair links of that pattern are not suitable for Grade 80 or Grade 100 chain in overhead lifting.' },
        { question: 'Can a connecting link be reused?', answer: 'Follow the maker’s instructions; some require new pins or bushes. If in doubt, fit a new link, and have the sling examined.' },
        { question: 'Do connecting links need to match the chain grade?', answer: 'Yes — or the sling takes the lower grade’s rating.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Connecting links and clevis fittings',
      skus: ['IH-LR-G8-CLE', 'IH-LR-G8-CLU', 'IH-LR-G8-CLI', 'IH-LR-G10-CCE', 'IH-LR-G10-NRCL', 'IH-LR-G8-CSHL', 'IH-LR-SC-SSHE'],
    },
    {
      type: 'category_link',
      slug: 'grade-80-chain-fittings',
      label: 'Grade 80 chain fittings',
      blurb: 'Connecting links, clevis and eye hooks, shorteners and master links.',
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
      slugs: ['grade-80-vs-grade-100-chain-slings', 'master-links-explained', 'lifting-hook-types', 'chain-sling-shortening-clutches-and-grab-hooks', 'snap-hooks-and-quick-links', 'lifting-gear-rejection-criteria'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Ratings from the live Indus connecting link tables; EN 1677 scope from standards catalogue summaries; repair-link and cold-shut warnings from makers’ published limitations.',
    },
    {
      type: 'cta_block',
      heading: 'Building or repairing chain slings?',
      body: 'Send the chain grade and size and the fittings you need. We will quote matched, certified components.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
