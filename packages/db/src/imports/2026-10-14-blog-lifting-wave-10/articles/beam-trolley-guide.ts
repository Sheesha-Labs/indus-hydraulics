import type { BlogArticleSeed } from '../shared'

/**
 * Beam trolleys: push vs geared, sizing. Checked 2026-10-14: LEEA COPSULE §8.5.3 — geared trolleys
 * for heavier loads, greater control, and where height makes push trolleys impractical (high); a
 * maker's trolley manual — 2–4 mm wheel clearance per side, minimum curve radius 1 m (1.5 t) to 5 m
 * (25 t), separate tapered/flat-beam versions (high); another maker's wheels for 14 % flange incline
 * (DIN 1025-1) (high). EN 13157 hand-powered lifting equipment (medium); ASME B30.17 now covers
 * monorails and underhung trolleys (medium). Flange ranges and weights from live Indus tables. The
 * meaning of Type B/C/F in our listings is not stated — not explained.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'beam-trolley-guide',
  title: 'Beam trolleys: push or geared, and how to size one to the beam',
  excerpt:
    'A beam trolley turns a chain block into a travelling hoist along an I-beam. Push trolleys move by pushing the load; geared trolleys travel by a hand chain. When each makes sense, how to size a trolley to the load and the flange, why tapered and parallel flanges matter, and the checks before first use.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Beam Trolley Guide: Push vs Geared, Sizing to the Beam',
  seoDescription:
    'How to choose a beam trolley: push vs geared, capacity for hoist and load, flange width ranges from our tables, wheel clearance, tapered vs parallel flanges, curves and end stops, and the standards that apply.',
  focusKeyword: 'beam trolley',
  publishedAt: '2026-10-14T10:48:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Push trolleys travel when the load is pushed; geared trolleys travel by pulling a hand chain.',
        'Geared trolleys suit heavier loads, more precise positioning, and beams too high to push the load comfortably.',
        'Size on two numbers: capacity (hoist plus load) and the beam flange width range.',
        'Wheels must suit the flange profile — tapered or parallel — with the clearance the maker specifies.',
        'The beam itself must be rated for the load, with end stops fitted.',
      ],
    },
    {
      type: 'lead',
      html: 'Hang a chain block from a trolley on an I-beam and it can travel the length of a workshop, a pump house or a plant room. On shutdowns and in plant rooms, beam trolleys move valves, motors and pumps where no crane can reach. Choosing one comes down to how it travels, how much it carries and which beam it fits. For the hoist itself, see <a href="/blog/chain-block-vs-lever-hoist-vs-electric-hoist">chain block vs lever hoist vs electric hoist</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Push or geared.', anchor: 'push-geared' },
    {
      type: 'comparison_table',
      caption: 'Push vs geared beam trolleys',
      columns: ['Feature', 'Push trolley', 'Geared trolley'],
      rows: [
        { cells: ['Travel', 'Pushing or pulling the load', 'Pulling a hand chain on a geared wheel'] },
        { cells: ['Control', 'Load can swing and run on', 'Slow, precise positioning'], highlight: true },
        { cells: ['Best for', 'Lighter loads, low beams, short travel', 'Heavier loads, precise placing, high beams'] },
        { cells: ['Weight (1 t, from our table)', '8 kg', '15 kg'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'When should I use a geared beam trolley instead of a push trolley?',
      answer:
        'When the load is heavy, when it must be positioned precisely, or when the beam is too high to push the load comfortably. The UK lifting industry code describes geared trolleys as giving a greater degree of control for heavier loads. Push trolleys suit lighter loads moved short distances on low beams.',
    },

    { type: 'section_head', number: '/02', title: 'Sizing to the beam.', anchor: 'sizing' },
    {
      type: 'comparison_table',
      caption: 'Flange width ranges in our range (mm)',
      columns: ['Capacity', 'Type B', 'Type C', 'Type F'],
      rows: [
        { cells: ['0.5 t', '75–125', '64–140', '50–220'] },
        { cells: ['1 t', '75–125', '64–140', '58–220'] },
        { cells: ['2 t', '100–150', '76–165 (geared) / 76–203 (push)', '66–220'] },
        { cells: ['5 t', '125–175', '88–203', '90–220'] },
        { cells: ['10 t', '125–180', '125–203', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Choose a capacity that covers the hoist and its load together, then a trolley whose flange range includes your beam’s flange width. Set the wheels to the maker’s clearance — one maker specifies 2–4 mm each side — not jammed against the flange. Wheels are profiled for tapered or parallel flanges: tapered-flange beams to DIN 1025-1 have a sloping flange that wheels must be designed for. Curved track needs a trolley rated for the curve radius; makers publish minimums that grow with capacity.',
    },

    { type: 'section_head', number: '/03', title: 'Before first use.', anchor: 'checks' },
    {
      type: 'prose',
      html: '<ul><li>The beam is rated for the load and the trolley, confirmed by whoever is responsible for the structure.</li><li>End stops are fitted at both ends of the beam.</li><li>The trolley’s and the hoist’s ratings are marked and certified, and the pair is examined after installation.</li><li>Clearance and wheel profile match the beam.</li></ul><p>Hand-operated trolleys are covered in Europe by EN 13157 and in the US by ASME B30.17; local rules on examination apply — see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A trolley is only as good as the beam.',
      body: 'Never hang a trolley on a beam, pipe rack or steel member that has not been confirmed as rated for the load. The trolley’s rating says nothing about the structure.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I size a beam trolley?', answer: 'By capacity — enough for the hoist and its load — and by the flange width range, which must include your beam’s flange.' },
        { question: 'What is the difference between a push and a geared trolley?', answer: 'A push trolley moves when the load is pushed; a geared trolley moves by a hand chain on a geared wheel, for more control.' },
        { question: 'Can a beam trolley go round curves?', answer: 'Yes, if rated for the curve radius. Makers publish minimum radii that increase with capacity.' },
        { question: 'Do beam trolleys work on tapered flanges?', answer: 'Yes, if the wheels are designed for the flange profile. Check the trolley suits your beam’s flange slope.' },
        { question: 'Do your trolleys come certified?', answer: 'Yes, with the manufacturer’s test certificate.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Beam trolleys and hoists',
      skus: ['IH-LR-BT-PB', 'IH-LR-BT-GB', 'IH-LR-BT-PC', 'IH-LR-BT-GC', 'IH-LR-BT-PF', 'IH-LR-BT-GF', 'IH-LR-CB-A'],
    },
    {
      type: 'category_link',
      slug: 'beam-trolleys',
      label: 'Beam trolleys',
      blurb: 'Push and geared beam trolleys from 0.5 t to 20 t.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'oil-gas',
      label: 'Oil and gas',
      blurb: 'Certified lifting gear for plant and shutdown work.',
    },
    {
      type: 'related_articles',
      slugs: ['chain-block-vs-lever-hoist-vs-electric-hoist', 'shutdown-and-turnaround-rigging', 'lifting-chillers-and-rooftop-plant', 'vertical-vs-horizontal-plate-lifting-clamps', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Flange ranges and weights from the live Indus beam trolley tables; push/geared guidance from the UK lifting industry code of practice; clearance, curves and flange profiles from makers’ manuals.',
    },
    {
      type: 'cta_block',
      heading: 'Fitting a trolley to a beam?',
      body: 'Send the load, the beam size and flange width, and push or geared. We will quote a trolley and hoist that fit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
