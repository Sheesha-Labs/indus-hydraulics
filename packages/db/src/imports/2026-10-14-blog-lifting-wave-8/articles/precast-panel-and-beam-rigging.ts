import type { BlogArticleSeed } from '../shared'

/**
 * Precast rigging above the anchor. Checked 2026-10-14: LEEA code §1.A5.5.3.3–4 (uniform load method
 * assumes 3 of 4 legs; rigid loads, two legs may carry most — derate to 2/3 in extreme cases);
 * precast insert/clutch safety factors from Queensland and NZ regulator guidance (medium — attributed
 * and hedged); Victoria guidance on rigging diagrams and marking (medium). Not EN/ASME multi-leg text.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'precast-panel-and-beam-rigging',
  title: 'Precast panel and beam rigging: slings, clutches and multi-leg rules above the anchor',
  excerpt:
    'A precast element is lifted on anchors cast into it, but the anchors are only half the system. The clutches, chain slings, master link and spreader above them decide whether the load is shared as designed. How to rig precast panels and beams, why a four-leg sling rarely shares a rigid load evenly, and what regulators’ codes say about anchors, clutches and rigging diagrams.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Precast Panel and Beam Rigging: Clutches, Slings, Multi-Leg',
  seoDescription:
    'How to rig precast concrete panels and beams: lifting clutches, chain slings and master links, why four-leg slings do not share rigid loads equally (LEEA), sling angles, spreaders, rigging diagrams and anchor safety factors.',
  focusKeyword: 'precast concrete rigging',
  publishedAt: '2026-10-14T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Follow the precast designer’s rigging diagram: anchor type and position, sling lengths, angles and any spreader are designed together.',
        'A rigid precast unit on a four-leg sling rarely loads all four legs: the UK lifting association’s code assumes three, and two may carry most of the weight.',
        'Clutches must match the anchor system and size exactly; both are marked with their capacity and maker.',
        'Keep sling angles within the design — capacity falls and anchor loads rise as angles open.',
        'Regulators’ precast codes set minimum factors of safety for anchors and clutches and require rigging designed by a competent engineer.',
      ],
    },
    {
      type: 'lead',
      html: 'Precast walls, beams, stairs and hollow-core planks arrive with lifting anchors cast in, and the temptation is to treat the anchors as the whole story. They are not. The clutch that engages the anchor, the sling legs, the master link and the crane hook form a system whose geometry decides how much each anchor actually carries. This guide covers the rigging above the anchor; our article on the <a href="/blog/precast-concrete-lifting-clutch">precast concrete lifting clutch</a> covers the clutch itself.',
    },

    { type: 'section_head', number: '/01', title: 'Follow the rigging diagram.', anchor: 'diagram' },
    {
      type: 'paragraph',
      html: 'Each precast element should come with a design that shows its weight, the concrete strength required at lifting, the anchor type and positions, and how it is to be rigged — sling lengths, angles and any spreader beam. Regulator guidance in Australia, for example, expects rigging diagrams with sling lengths and spreader requirements on the shop drawings. Rig to the diagram, with the clutches, slings and links it specifies. If the site cannot rig it that way, go back to the designer before lifting.',
    },

    { type: 'section_head', number: '/02', title: 'Why four legs do not mean four shares.', anchor: 'multi-leg' },
    {
      type: 'paragraph',
      html: 'A precast panel is rigid. Hang it on a four-leg sling and the tiniest difference in leg length or anchor position means two legs take most of the load while the other two go slack. The UK lifting association’s code of practice reflects this: its uniform-load method for three- and four-leg slings assumes only <strong>three</strong> legs bear the load; it notes that with a rigid load two legs are likely to carry the majority of the weight, and that in extreme cases the sling should be de-rated to two-thirds of its standard rating. Where the assumptions do not hold, it says to assume one leg carries all of the load. That is why precast designers often specify equalising arrangements — spreaders, compensating sheaves or two-point lifts — rather than a plain four-leg sling.',
    },
    {
      type: 'direct_answer',
      question: 'Does a four-leg sling share a precast load equally?',
      answer:
        'Usually not. A rigid precast unit tends to load two legs while the others go slack. The UK lifting association’s code assumes only three legs carry the load in its uniform-load method, notes that two legs may carry most of a rigid load, and advises de-rating to two-thirds in extreme cases. Use the precast designer’s rigging arrangement, with equalisers where specified.',
    },

    { type: 'section_head', number: '/03', title: 'Clutches, slings and links.', anchor: 'components' },
    {
      type: 'prose',
      html: '<ul><li><strong>Clutches</strong> must match the anchor system and size; they and the anchors are permanently marked with capacity and maker.</li><li><strong>Chain slings</strong> — Grade 80 or 100, with the master link sized to the crane hook and the legs to the clutches; see <a href="/blog/master-links-explained">master links explained</a>.</li><li><strong>Shortening</strong> — clutches on the chain let riggers set equal leg lengths; never knot chain.</li><li><strong>Spreader or equaliser</strong> where the design calls for one; we do not stock spreader beams, but supply the slings, shackles and links that go with them.</li><li><strong>Tag lines</strong> on every panel to stop rotation in wind.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Anchors and safety factors.', anchor: 'factors' },
    {
      type: 'paragraph',
      html: 'Regulators set minimum factors of safety for the parts embedded in the concrete. Queensland’s guidance, for example, cites a minimum of 2.5 against failure of the anchor, concrete or reinforcement, and at least 5 for clutches; New Zealand guidance calls for anchors designed to at least 3, and 5 for repeated lifting, with the design load including suction, dynamic and rigging-angle effects. These are design matters for the precast engineer — the site’s job is to lift only when the concrete has reached the strength on the drawing and to rig as designed.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Watch the angles.',
      body: 'Opening the sling angle to clear a deck or reach an anchor raises the load on each anchor and clutch and lowers the sling’s capacity. Keep within the angles on the rigging diagram — see the sling angle chart.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How many legs carry the load on a four-leg sling?', answer: 'For rigid loads such as precast, assume fewer than four: the UK lifting association’s method assumes three, and two may carry most of the weight.' },
        { question: 'Can I lift a precast panel before the concrete reaches design strength?', answer: 'No. Lift only when the concrete has reached the strength shown on the drawing for lifting.' },
        { question: 'Do lifting clutches need to match the anchors?', answer: 'Yes — the same system and size, both marked with capacity and maker.' },
        { question: 'Who designs precast rigging?', answer: 'The precast designer or a competent lifting engineer, shown on the shop drawings or a rigging diagram.' },
        { question: 'Do you supply spreader beams?', answer: 'Not in our standard range; we supply the chain slings, master links, shackles and clutches used with them.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For precast lifting',
      skus: ['IH-LR-LP-PCLC', 'IH-LR-CS-G80QOS', 'IH-LR-CS-G100QOS', 'IH-LR-CS-G80DOS', 'IH-LR-G8-MLAE16774', 'IH-LR-G8-CSC', 'IH-LR-SH-G2130'],
    },
    {
      type: 'category_link',
      slug: 'chain-slings',
      label: 'Chain slings',
      blurb: 'Grade 80 and Grade 100 one-, two-, three- and four-leg chain slings.',
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
      slugs: ['precast-concrete-lifting-clutch', 'sling-angle-chart', 'chain-sling-capacity-chart', 'master-links-explained', 'chain-sling-codes-explained', 'site-mobilisation-rigging-kit'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Multi-leg loading from the UK lifting association’s code of practice; precast anchor factors and rigging-diagram practice from Australian and New Zealand regulator guidance. Your precast designer’s drawings govern.',
    },
    {
      type: 'cta_block',
      heading: 'Rigging precast?',
      body: 'Send the element weights, anchor system and rigging diagram. We will quote chain slings, master links, clutches and shackles to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
