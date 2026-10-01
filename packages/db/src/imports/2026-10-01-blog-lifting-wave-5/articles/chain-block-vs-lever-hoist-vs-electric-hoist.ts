import type { BlogArticleSeed } from '../shared'

/**
 * Chain block vs lever hoist vs electric hoist.
 *
 * Sources checked 2026-10-01: ASME B30.16 and B30.21 scope pages (asme.org);
 * EN 13157 / EN 14492-2 scopes (catalogue abstracts only — described in plain
 * words, not quoted); Kito M3 hand chain hoist manual, CM 602/603 and Yale PSB
 * lever hoist manuals, Kito L5 lever hoist manual, Kito ER2 electric hoist
 * manual (ISO 4301 M5 = 1,600 h at full rated load).
 * Product figures: our Type A manual chain block and Type B electric chain
 * hoist tables. We do not list lever hoists; the copy says so.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-block-vs-lever-hoist-vs-electric-hoist',
  title: 'Chain block vs lever hoist vs electric hoist: which to use for the lift',
  excerpt:
    'A chain block lifts straight up and down, from overhead. A lever hoist pulls, lifts and tensions in any direction, as long as the pull runs straight hook to hook. An electric hoist does the work for you, all day, rated by duty class. Here is how they compare and which one fits the job.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Chain block vs lever hoist vs electric hoist compared',
  seoDescription:
    'Chain block vs lever hoist vs electric hoist: what each is for, the standards that cover them, hand pull, duty class, and the rules every hoist shares.',
  focusKeyword: 'chain block vs lever hoist',
  publishedAt: '2026-10-01T12:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A chain block (hand chain hoist) is for vertical lifting from an overhead point, with the load centred underneath it.',
        'A lever hoist lifts, pulls and tensions in any position, provided the pull runs in a straight line from hook to hook.',
        'An electric hoist is for repeated lifting at a workstation. It is selected on duty class as well as capacity.',
        'Never extend a hoist lever with a pipe, never wrap the load chain around the load, and never load the tip of the hook.',
        'All three are rated by WLL on the nameplate. The hand pull or motor size is not a measure of capacity.',
      ],
    },
    {
      type: 'lead',
      html: 'All three lift loads with a chain, and on a busy site they get used interchangeably. They should not be. Each one is built and rated for a particular way of working, and the standards that cover them say so.',
    },

    { type: 'section_head', number: '/01', title: 'The three at a glance.', anchor: 'at-a-glance' },
    {
      type: 'comparison_table',
      caption: 'Chain block, lever hoist and electric hoist compared',
      columns: ['Aspect', 'Chain block', 'Lever hoist', 'Electric hoist'],
      rows: [
        { cells: ['Direction', 'Vertical lifting only', 'Any position, straight pull hook to hook', 'Vertical lifting only'] },
        { cells: ['Operated by', 'Hand chain', 'Ratchet lever', 'Pendant control'] },
        { cells: ['Best for', 'Occasional lifts from a beam or gantry', 'Pulling, tensioning, positioning, short lifts', 'Frequent lifts at a fixed station'] },
        { cells: ['Covered by', 'ASME B30.16; EN 13157', 'ASME B30.21; EN 13157', 'ASME B30.16; EN 14492-2'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a chain block and a lever hoist?',
      answer:
        'A chain block is operated by a hand chain and is made for lifting a freely hanging load vertically from an overhead point. A lever hoist is operated by a ratchet lever and can lift, pull and tension in any position, as long as the pull runs straight from hook to hook. Use a lever hoist for pulling and tensioning; use a chain block for overhead lifts.',
    },

    { type: 'section_head', number: '/02', title: 'Chain blocks.', anchor: 'chain-blocks' },
    {
      type: 'paragraph',
      html: 'A chain block hangs from a beam, trolley or gantry and lifts the load straight up. Pulling the hand chain drives a gear train, so a modest hand pull lifts a heavy load. Our Type A chain block needs about 324 N on the hand chain to lift its 1 t rating, and about 504 N at 5 t. ASME B30.16 covers hand-chain hoists for the vertical lifting of freely suspended, unguided loads; tensioning and non-vertical lifting are outside it.',
    },
    {
      type: 'prose',
      html: '<ul><li>Keep the load centred under the hoist; do not pull at an angle.</li><li>Do not use the hoist chain as a sling, and never wrap it around the load.</li><li>Do not support a load on the tip of the hook.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Lever hoists.', anchor: 'lever-hoists' },
    {
      type: 'paragraph',
      html: 'A lever hoist — also called a ratchet lever hoist or lever block — is worked by a short handle and can be used in any position: lifting, pulling a load across a floor, tensioning a line, or aligning flanges and machinery. ASME B30.21 covers lever hoists for lifting, pulling and tensioning. The condition is that the pull runs in a straight line from hook to hook, with the body free to swivel on its top hook.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never extend the lever.',
      body: 'Lever hoist makers prohibit cheater bars and pipe extensions on the handle. The lever is sized so that a person’s pull matches the rated load; if it will not move, the hoist is overloaded or jammed. Extending the lever overrides that warning and can overload the hoist.',
    },
    {
      type: 'paragraph',
      html: 'We do not list lever hoists in the online catalogue. They are available on request; send the capacity, the chain length and the work.',
    },

    { type: 'section_head', number: '/04', title: 'Electric hoists.', anchor: 'electric-hoists' },
    {
      type: 'paragraph',
      html: 'An electric chain or wire rope hoist lifts at the push of a button and suits a workstation where the same lift happens many times a day. Electric hoists are classed by <strong>duty</strong> as well as capacity — how long and how often they can run. Our Type B electric chain hoists are rated M4 or M5 under the ISO 4301 classification; one major maker states that an M5 hoist is designed for 1,600 hours of running at full rated load.',
    },
    {
      type: 'paragraph',
      html: 'Duty class matters as much as capacity. A hoist with the right capacity but too low a duty class will overheat or wear out early on a busy line. Tell the supplier how many lifts an hour, at what fraction of the rated load, and over what height.',
    },

    { type: 'section_head', number: '/05', title: 'What every hoist shares.', anchor: 'common-rules' },
    {
      type: 'prose',
      html: '<ul><li><strong>Rated by WLL.</strong> The nameplate states it; our chain blocks are proof-tested at 1.5 times WLL.</li><li><strong>Suspension rated too.</strong> The beam, trolley or anchor above the hoist must carry the load plus the hoist’s own weight.</li><li><strong>No chain slings.</strong> The load chain is not a sling; use a proper sling between hook and load.</li><li><strong>Hook in the bowl.</strong> Seat the load in the bowl of the hook with the latch closed — never on the tip.</li><li><strong>Inspected.</strong> Hoists are lifting equipment under the UAE inspection rules — see our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a>.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Which hoist?',
      intro: 'Start from the direction of the pull and how often you lift.',
      branches: [
        { condition: 'Occasional vertical lift from a beam', outcome: 'Manual chain block, on a beam clamp or trolley.' },
        { condition: 'Pulling, tensioning or aligning sideways', outcome: 'Lever hoist, pulling straight hook to hook.' },
        { condition: 'Repeated lifting at one station', outcome: 'Electric chain hoist, selected on duty class.' },
        { condition: 'Low headroom under the beam', outcome: 'Close-headroom trolley hoist.' },
        { condition: 'Long rope runs, pulling or lowering', outcome: 'Wire rope puller (rope-grip hoist).' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hoists in this guide',
      skus: ['IH-LR-CB-A', 'IH-LR-CB-B', 'IH-LR-CB-CHT', 'IH-LR-EH-CA', 'IH-LR-EH-CB', 'IH-LR-HO-WRP'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I use a chain block horizontally?',
          answer:
            'No. Chain blocks are made for vertical lifting of a freely hanging load, centred under the hoist. For horizontal pulling or tensioning, use a lever hoist.',
        },
        {
          question: 'Can a lever hoist be used for lifting?',
          answer:
            'Yes. Lever hoists are made for lifting, pulling and tensioning, in any position, provided the pull runs straight from hook to hook.',
        },
        {
          question: 'Why can’t I put a pipe on a lever hoist handle?',
          answer:
            'Because the handle is sized so a person’s pull matches the rated load. If it will not move, the hoist is overloaded or jammed, and an extension can overload it.',
        },
        {
          question: 'What does M4 or M5 mean on an electric hoist?',
          answer:
            'It is the hoist’s duty classification under ISO 4301 — how much running it is designed for. Higher classes suit more frequent, heavier use. One maker rates an M5 hoist for 1,600 hours at full rated load.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'chain-blocks-manual-hoists',
      label: 'Chain blocks and manual hoists',
      blurb: 'Manual chain blocks, close-headroom trolley hoists and wire rope pullers.',
    },
    {
      type: 'category_link',
      slug: 'electric-hoists',
      label: 'Electric hoists',
      blurb: 'Electric chain hoists and wire rope hoists, with duty class.',
    },
    {
      type: 'category_link',
      slug: 'beam-trolleys',
      label: 'Beam trolleys',
      blurb: 'Push and geared trolleys to carry a hoist along a beam.',
    },
    {
      type: 'related_articles',
      slugs: ['snatch-block-vs-pulley-block', 'lifting-hook-types', 'lifting-equipment-inspection-uae', 'working-load-limit-vs-breaking-strength'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Standard scopes from ASME B30.16 and B30.21; operating rules from published Kito, CM and Yale manuals. Product figures from the linked size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a hoist for a job?',
      body: 'Tell us the load, the lift height, how often you lift and what the hoist hangs from. We will quote the right hoist and suspension, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
