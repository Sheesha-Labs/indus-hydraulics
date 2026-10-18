import type { BlogArticleSeed } from '../shared'

/**
 * DIN 763, 764, 766 and 5685 chain — what each covers, and why none is a
 * lifting chain.
 *
 * Sources checked 2026-10-01: DIN Media abstracts — DIN 766:2015-06 (pitch
 * 2.8d, chain conveyors, grade 3, quenched and tempered, tested, 10–42 mm,
 * −20 to +400 °C; "shall not be used as lifting accessories, slings…"),
 * DIN 764-1:2010-10 (pitch 3.5d, chain conveyors, grade 3, tested; not as
 * slings); DIN 5685-1/-2/-3:2003 titles ("non proof loaded" long, semi-long,
 * short link). DIN 763:1990-12 title from din.de; its not-for-lifting
 * statement only from a hosted copy — so phrased as the standard's intent,
 * cited by number.
 * Product figures from our DIN chain and Grade 80 tables. Our DIN 764 weight
 * column is a known data error (about ten times too high) and is not used.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'din-link-chain-standards',
  title: 'DIN 763, 764, 766 and 5685 chain: what each standard covers, and why none is lifting chain',
  excerpt:
    'DIN link chains are named for their link length and whether they are tested and calibrated — and the current DIN 764 and DIN 766 are written for chain conveyors, with an explicit ban on use as slings or lifting accessories. Here is what each standard covers, how they compare with Grade 80 lifting chain, and what they are actually for.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DIN 763 vs DIN 764 vs DIN 766 vs DIN 5685 chain explained',
  seoDescription:
    'DIN link chain standards decoded: DIN 763 long link, DIN 764 medium link, DIN 766 short link calibrated and DIN 5685 chain — pitch, testing, uses, and why they are not lifting chain.',
  focusKeyword: 'din 766 vs din 764 chain',
  publishedAt: '2026-10-01T12:55:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'DIN 763 is tested long-link chain; DIN 764 medium-link and DIN 766 short-link chain are calibrated to a tight pitch; DIN 5685 is light chain that is not proof-loaded.',
        'The current DIN 764 and DIN 766 are standards for chain conveyors, and both say the chain must not be used as slings or lifting accessories with cranes or hoists.',
        'Calibrated means the links are held to a close pitch tolerance so the chain runs smoothly on a sprocket or pocket wheel.',
        'At the same size, DIN chain is far weaker than lifting chain: 10 mm DIN 766 breaks at 50 kN against 126 kN for our 10 mm Grade 80.',
        'For lifting, use Grade 80 or Grade 100 alloy chain. DIN link chain is for conveyors, barriers, securing and general use.',
      ],
    },
    {
      type: 'lead',
      html: 'DIN chain looks like lifting chain — round steel links, sold by diameter, often galvanized — and it is easy to buy by the metre for a job it was never meant for. The standards themselves are clear about what they cover, and lifting is not on the list.',
    },

    { type: 'section_head', number: '/01', title: 'The four standards.', anchor: 'standards' },
    {
      type: 'comparison_table',
      caption: 'DIN round steel link chains',
      columns: ['Standard', 'What it is', 'Intended use'],
      rows: [
        { cells: ['DIN 763', 'Long-link chain, tested, not calibrated', 'General purpose — not for slings or lifting accessories'] },
        { cells: ['DIN 764', 'Medium-link chain (pitch 3.5 × d), calibrated and tested, grade 3', 'Chain conveyors — not for slings or lifting'] },
        { cells: ['DIN 766', 'Short-link chain (pitch 2.8 × d), calibrated and tested, grade 3, quenched and tempered', 'Chain conveyors — not for slings or lifting'], highlight: true },
        { cells: ['DIN 5685', 'Long, semi-long and short-link chain, not proof-loaded', 'Barriers, securing, light general use'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The current DIN 766 (2015) covers chain from 10 mm to 42 mm, for use from −20 °C to 400 °C, and states that it shall not be used as a lifting accessory, sling or load-bearing device with cranes or hoists. DIN 764-1 (2010) carries the same restriction. DIN 5685 chain is, by its own title, not proof-loaded at all.',
    },
    {
      type: 'direct_answer',
      question: 'Can DIN 766 chain be used for lifting?',
      answer:
        'No. The current DIN 766 is a standard for chain conveyors, and it states that the chain shall not be used as a lifting accessory, sling or load-bearing device with cranes or hoists. For lifting, use Grade 80 or Grade 100 alloy lifting chain with fittings of the same grade.',
    },

    { type: 'section_head', number: '/02', title: 'What “calibrated” means.', anchor: 'calibrated' },
    {
      type: 'paragraph',
      html: 'Calibrated chain is made to a tight tolerance on its pitch — the inside length of each link — so it engages a sprocket or pocket wheel link after link without riding up or jumping. Our DIN 764 medium-link chain, for example, is offered in more than one pitch tolerance at each size, down to ±0.2 mm on 4 mm and 5 mm chain. Uncalibrated chain such as DIN 763 has no such control and is not made to run on a pocket wheel.',
    },
    {
      type: 'paragraph',
      html: 'Galvanized DIN 766-pattern chain is also sold as anchor chain for boat windlasses whose gypsy is made for that pitch. If you buy it for that, match the chain to the gypsy maker’s specification — the size and pitch both matter.',
    },

    { type: 'section_head', number: '/03', title: 'How they compare with lifting chain.', anchor: 'compared' },
    {
      type: 'comparison_table',
      caption: 'Minimum breaking load at 10 mm, from our tables',
      columns: ['Chain', 'Breaking load', 'Lifting?'],
      rows: [
        { cells: ['DIN 766 short link', '50 kN', 'No'] },
        { cells: ['DIN 764 medium link', '50 kN', 'No'] },
        { cells: ['Grade 80 alloy lifting chain', '126 kN', 'Yes'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'At the same size, Grade 80 chain breaks at about two and a half times the load of DIN conveyor chain — and it is made, tested and certified to a lifting standard, with a family of matching hooks and links. Our DIN 763 long-link chain carries a published WLL for general use (100 kg at 4 mm), but that is not a lifting rating. See our <a href="/blog/chain-grades-explained">guide to chain grades</a> for what lifting chain is.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Galvanized DIN chain is not a cheap lifting chain.',
      body: 'DIN link chain is sold by the metre, often galvanized, and looks the part. It is not tested or rated as lifting chain, and the current DIN 764 and 766 standards forbid using it as slings or lifting accessories. Never make a lifting sling from it.',
    },
    {
      type: 'decision_tree',
      heading: 'Which chain?',
      intro: 'Start from the job.',
      branches: [
        { condition: 'Lifting, slings or hoisting', outcome: 'Grade 80 or Grade 100 alloy lifting chain — not DIN link chain.' },
        { condition: 'Running on a sprocket or pocket wheel', outcome: 'Calibrated DIN 766 or DIN 764 to the wheel maker’s pitch.' },
        { condition: 'Barriers, fencing, securing light items', outcome: 'DIN 5685 or DIN 763.' },
        { condition: 'Corrosive or marine service', outcome: 'Stainless DIN chain, with its own published rating.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Chain in this guide',
      skus: ['IH-LR-CH-D766', 'IH-LR-CH-D766CCG', 'IH-LR-CH-D764', 'IH-LR-CH-D763', 'IH-LR-CH-D5685', 'IH-LR-CH-G80'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the difference between DIN 764 and DIN 766 chain?',
          answer:
            'Link length. DIN 766 is short-link chain with a pitch of 2.8 times the wire diameter; DIN 764 is medium-link with a pitch of 3.5 times. Both are calibrated, tested chains written for chain conveyors.',
        },
        {
          question: 'Is DIN 763 chain tested?',
          answer:
            'Yes — DIN 763 is tested long-link chain, but it is not calibrated and it is not lifting chain. DIN 5685 chain, by contrast, is not proof-loaded.',
        },
        {
          question: 'Can I use DIN 766 chain as anchor chain?',
          answer:
            'Galvanized DIN 766-pattern chain is sold for boat windlasses whose gypsy matches its pitch. Match the chain size and pitch to the windlass maker’s specification.',
        },
        {
          question: 'Why can’t DIN chain be used for lifting?',
          answer:
            'Because it is not made or rated as lifting chain — the current DIN 764 and DIN 766 explicitly exclude use as slings and lifting accessories — and it is much weaker than Grade 80 chain of the same size.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'din-link-chain',
      label: 'DIN link chain',
      blurb: 'DIN 763, 764, 766 and 5685 chain for conveyors, barriers and general use.',
    },
    {
      type: 'category_link',
      slug: 'alloy-lifting-chain',
      label: 'Alloy lifting chain',
      blurb: 'Grade 80 and Grade 100 chain for lifting.',
    },
    {
      type: 'related_articles',
      slugs: ['chain-grades-explained', 'types-of-lifting-slings', 'stainless-vs-galvanized-rigging-gulf'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Standard scopes from DIN Media’s abstracts of DIN 764-1:2010 and DIN 766:2015 and the titles of DIN 763 and DIN 5685. Breaking loads from the linked size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Need chain for a conveyor, windlass or barrier?',
      body: 'Tell us the job, the size and, for a sprocket or gypsy, the pitch. We will quote the right DIN chain — or lifting chain, if the job is a lift.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
