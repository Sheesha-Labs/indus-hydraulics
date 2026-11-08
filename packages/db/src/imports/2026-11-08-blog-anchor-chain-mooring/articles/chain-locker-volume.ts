import type { BlogArticleSeed } from '../shared'
import { LOCKER_VOLUME } from '../reference'

/**
 * Chain locker volume. Formula S = 1.1 · d² · (l/2) · 10⁻⁵ m³, attributed to Germanischer Lloyd on a
 * stockist's "recommended volume of chain locker per 100 m anchor chain" sheet (verified on a render);
 * its 72-row table equals 0.0011 · d² per 100 m. Our table is computed from the formula. Class rule
 * text (adequate capacity, direct lead to the spurling pipe, separate port/starboard spaces, watertight
 * to the weather deck) as quoted on the same sheet. End fastening per IACS Rec. No. 10 from the weak
 * link sheet.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-locker-volume',
  title: 'Chain locker volume: how much space anchor chain needs, with a formula and table',
  excerpt:
    'A chain locker must hold the whole cable with room for it to pile and run free. The formula classification practice uses, the volume per 100 m and per shot for every chain size from 12.5 to 162 mm, a worked example, and the rules for the locker itself.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Chain Locker Volume — Formula and Table per 100 m of Chain',
  seoDescription:
    'How to size a chain locker: the S = 1.1 · d² · (l/2) · 10⁻⁵ m³ formula, chain locker volume per 100 m and per 27.5 m shot for chain from 12.5 to 162 mm, a worked example and the class rules.',
  focusKeyword: 'chain locker volume',
  publishedAt: '2026-11-08T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A common rule, from Germanischer Lloyd, sizes each chain locker at S = 1.1 × d² × (l/2) × 10⁻⁵ m³, with d the chain diameter in mm and l the total length of both cables in metres.',
        'Put simply: each 100 m of chain needs about 0.0011 × d² cubic metres — 6.36 m³ for 76 mm chain.',
        'Volume rises with the square of the diameter, so a change of chain size changes the locker more than a change of length.',
        'Port and starboard cables need separate lockers, with a direct lead from the spurling pipe and watertight boundaries up to the weather deck.',
        'Moving to a higher chain grade at a smaller diameter is one way to fit more cable into an existing locker.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain locker is not a box the chain is packed into; it is a space the chain falls into, piling up in a cone under the spurling pipe and running out again freely when the anchor is let go. Too small and the cable jams, piles back up the pipe or cannot be fully stowed. The volume needed is set mostly by the chain’s diameter, and there is a simple rule for it.',
    },
    {
      type: 'direct_answer',
      question: 'How do you calculate chain locker volume?',
      answer:
        'With S = 1.1 × d² × (l/2) × 10⁻⁵ m³, where d is the chain diameter in mm and l the total length of both cables in metres, so l/2 is the length in each locker. That is about 0.0011 × d² m³ per 100 m of chain: 2.75 m³ for 50 mm chain and 6.36 m³ for 76 mm.',
    },

    { type: 'section_head', number: '/01', title: 'The formula.', anchor: 'formula' },
    {
      type: 'callout',
      tone: 'note',
      title: 'S = 1.1 · d² · (l/2) · 10⁻⁵ m³',
      body: 'S is the storage volume of each locker in m³; d is the chain diameter in mm; l is the total length of chain in metres, divided by two because it is split between the port and starboard lockers. The rule is attributed to Germanischer Lloyd. It gives the space the cable occupies — add room above it for the cable to pile and for access.',
    },
    {
      type: 'paragraph',
      html: '<strong>Worked example.</strong> A ship with 495 m of 50 mm chain in total carries 247.5 m in each locker. S = 1.1 × 2,500 × 247.5 × 10⁻⁵ = 6.8 m³ per locker. In grade 3 the same ship could carry 44 mm chain — see <a href="/blog/equipment-number-anchor-chain-sizing">equipment number</a> — and the locker volume falls to 5.3 m³.',
    },

    { type: 'section_head', number: '/02', title: 'Volume by chain size.', anchor: 'table' },
    {
      type: 'comparison_table',
      caption: 'Chain locker volume from the formula (m³)',
      columns: ['Chain diameter (mm)', 'Per 100 m of chain', 'Per 27.5 m shot'],
      rows: LOCKER_VOLUME,
    },

    { type: 'section_head', number: '/03', title: 'The locker itself.', anchor: 'rules' },
    {
      type: 'prose',
      html: '<p>The class rules, as quoted on the same reference sheet, require that:</p><ul><li>the chain locker has adequate capacity and a suitable form for proper stowage, with an easy, direct lead into the spurling pipe when the cable is fully stowed;</li><li>port and starboard cables have separate spaces — three bower anchors and three hawse pipes mean three spaces;</li><li>the spurling pipes and chain lockers are watertight up to the weather deck.</li></ul><p>The inboard end of each cable is secured to an <a href="/p/end-fastening-for-anchor-chain-cable-din-81860">end fastening</a> that can be released from outside the locker — see <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a>. A <a href="/p/chain-locker-securing-device">chain locker securing device</a> does the same job in a compact fitting.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much space does 100 m of 76 mm anchor chain need?', answer: 'About 6.36 m³, from 0.0011 × 76².' },
        { question: 'Why is the length divided by two in the formula?', answer: 'Because l is the total chain on board, split between the port and starboard lockers. S is the volume of each locker.' },
        { question: 'Does stud link chain need more space than studless?', answer: 'The rule uses the chain diameter only, for either type. Use the locker volume the class society approves for the ship.' },
        { question: 'Can I fit more chain in an existing locker?', answer: 'Often by moving to a higher grade at a smaller diameter, since volume rises with the square of the diameter. The class society must approve the change.' },
        { question: 'Must chain lockers be watertight?', answer: 'Yes — chain lockers and spurling pipes must be watertight up to the weather deck.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Locker and cable fittings',
      skus: ['IH-MR-DF-EFC', 'IH-MR-DF-CLD', 'IH-MR-CN-WKL', 'IH-LR-AC-SLACGU1U2', 'IH-MR-DF-CWL'],
    },
    { type: 'category_link', slug: 'towing-mooring-fittings', label: 'Towing & mooring fittings', blurb: 'Chain stoppers, cable lifters, end fastenings, chocks, fairleads and quick-release hooks.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-weight-chart', 'equipment-number-anchor-chain-sizing', 'anchor-chain-cable-arrangement', 'anchor-chain-size-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Formula attributed to Germanischer Lloyd and rule text as quoted on a chain stockist’s reference sheet; table computed from the formula. The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Fitting out a chain locker?',
      body: 'Send the chain size and length. We will quote the cable, end fastenings and stoppers together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
