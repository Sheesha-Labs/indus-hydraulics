import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Slurry drag hose sizing and wear life. Product facts from IH-LF-TSD / TSS / CAG / EHR / EHM.
 * Friction figures are Hazen–Williams estimates for water (C = 140) on actual IDs, labelled as
 * such — slurry with more dry matter loses more. Flow examples are illustrative arithmetic.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'slurry-drag-hose-sizing-and-life',
  title: 'Slurry drag hose: choosing 4", 5" or 6", and making it last',
  excerpt:
    'The drag hose is the part of an umbilical system that works hardest: pulled, turned and scrubbed across the field all day. Size it too small and the pump fights friction; too big and the tractor fights the weight. How to choose between 4", 5" and 6" drag hose, how supply and drag sizes fit together, and what shortens — and extends — drag hose life.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Slurry Drag Hose Sizing: 4" vs 5" vs 6", and Hose Life',
  seoDescription:
    'How to size a slurry umbilical drag hose: flow, friction per 100 m and hose weight for 4", 5" and 6", matching supply and drag bores with intermating couplings, and the handling habits that make drag hose last.',
  focusKeyword: 'slurry drag hose',
  publishedAt: '2026-10-13T21:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Size the drag hose on the flow the applicator needs: application rate × hectares per hour.',
        'At 100 m³/h a 4" drag hose loses roughly three times as much pressure per metre as a 5", and seven times as much as a 6" (water figures).',
        'Bigger is not free: full of slurry, 6" drag hose weighs about twice as much per metre as 4", and the tractor drags all of it.',
        'The supply line can be one or two sizes larger than the drag hose; intermating couplings join them without adapters.',
        'Drag hose wears at the edges and folds — wide turns, rotating the hose end for end, and flushing after use add seasons.',
      ],
    },
    {
      type: 'lead',
      html: 'In an umbilical system the pump at the lagoon pushes slurry through a <strong>supply line</strong> laid along the field edge, and from a manifold at the field the tractor pulls a <strong>drag hose</strong> back and forth as it spreads. The supply line lies still; the drag hose is dragged over stubble, grass, stones and gateways for hours at a time, turned through tight loops at every headland, and pulled taut against the tractor hitch. It is the hose that decides how much work the pump does and how long the system lasts between hose replacements. Our <a href="/blog/slurry-umbilical-system-guide">umbilical system guide</a> explains the full layout.',
    },

    { type: 'section_head', number: '/01', title: 'Start from the flow.', anchor: 'flow' },
    {
      type: 'paragraph',
      html: 'The flow the drag hose must carry is the applicator’s output: the <strong>application rate</strong> (m³ per hectare) times the <strong>work rate</strong> (hectares per hour). An applicator spreading 33 m³/ha (about 3,000 gallons per acre) while covering 2 ha an hour needs about 65 m³/h; double the work rate and it needs 130 m³/h. Irish farm press has reported outputs from 25 m³/h on farm systems to 60 m³/h and more on contractor rigs. Work out the flow for your heaviest planned dressing at your normal working speed — that is the number the hose must carry without the pump running out of pressure at the far end of the field.',
    },
    {
      type: 'direct_answer',
      question: 'What size drag hose do I need for a slurry umbilical system?',
      answer:
        '4" (100 mm) drag hose is the most common, and contractors wanting more output are moving to 5" and 6". Choose by the flow the applicator needs and the length of drag hose: a larger bore cuts friction sharply but roughly doubles the weight the tractor pulls at 6". Check pump pressure, hose rating and tractor power together.',
    },

    { type: 'section_head', number: '/02', title: 'Friction: why bore matters so much.', anchor: 'friction' },
    {
      type: 'comparison_table',
      caption: 'Estimated pressure loss per 100 m of TPU drag hose, clean water (Hazen–Williams, C = 140, actual inside diameters). Slurry with more dry matter loses more.',
      columns: ['Flow', '4" (102 mm)', '5" (125 mm)', '6" (152 mm)'],
      rows: [
        { cells: ['60 m³/h', '0.4 bar', '0.1 bar', '0.05 bar'] },
        { cells: ['100 m³/h', '1.0 bar', '0.4 bar', '0.1 bar'], highlight: true },
        { cells: ['150 m³/h', '2.1 bar', '0.8 bar', '0.3 bar'] },
        { cells: ['200 m³/h', '3.5 bar', '1.3 bar', '0.5 bar'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Friction rises with roughly the square of the flow and falls steeply with bore. At 150 m³/h, 500 m of 4" drag hose would cost over 10 bar in water terms — more than its 12 bar working pressure leaves room for once the supply line and applicator are added. The same length of 5" costs about 4 bar. Real slurry costs more than water, especially above a few percent dry matter, so treat these as the floor, not the estimate. Our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> explains the method.',
    },

    { type: 'section_head', number: '/03', title: 'Weight: the other side of the trade.', anchor: 'weight' },
    {
      type: 'paragraph',
      html: 'The tractor pulls the drag hose and everything in it. A metre of 4" hose holds about 8 litres of slurry, a metre of 6" about 18. With the hose itself — 1.6 kg/m at 4", 3.2 kg/m at 6" for our <a href="/p/tpu-lay-flat-slurry-drag-hose">TPU drag hose</a> — a full 6" line weighs roughly twice as much per metre as a 4". On wet ground and slopes that is the difference between a smooth headland turn and wheelslip. Irish farm press puts the pull at over 100 hp for a typical umbilical, on top of the pumping power. 4" is still the most common drag hose, but contractors chasing output are moving to 5" and 6", and 5-1/2" and 7-1/2" sizes exist for fine-tuning.',
    },
    {
      type: 'comparison_table',
      caption: 'Our TPU slurry drag hose — selected sizes',
      columns: ['Size', 'Inside diameter', 'Working pressure', 'Hose weight', 'Slurry inside, per metre'],
      rows: [
        { cells: ['4"', '102 mm', '12 bar', '1.6 kg/m', '≈ 8 L'] },
        { cells: ['5"', '125 mm', '10 bar', '2.05 kg/m', '≈ 12 L'], highlight: true },
        { cells: ['6"', '152 mm', '10 bar', '3.18 kg/m', '≈ 18 L'] },
        { cells: ['8"', '204 mm', '10 bar', '4.58 kg/m', '≈ 33 L'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Supply and drag together.', anchor: 'supply' },
    {
      type: 'paragraph',
      html: 'The supply line does not move while spreading, so weight hardly matters and it can be sized generously to cut friction over the long run from the lagoon, and our <a href="/p/tpu-lay-flat-slurry-supply-hose">slurry supply hose</a> runs from 5" to 16" at 14–15 bar (10 bar at 16"). The drag hose is then one or two sizes smaller. <a href="/p/lay-flat-slurry-hose-coupling">Slurry hose couplings</a> make this simple: the 4", 5" and 6" couplings intermate without adapters, and so do the 7" and 8", so a 6" supply line connects straight to a 5" drag hose. The couplings have knurled grip ribs for gloved, wet hands and anodised aluminium that resists manure.',
    },
    {
      type: 'figure',
      imageId: FIG['fig-slurry-coupling'],
      captionPrefix: 'FIG. 01',
      caption: 'Slurry hose couplings in the 4" to 6" group intermate, so supply and drag hose of different bores join directly in the field.',
      aspectRatio: '16/9',
    },

    { type: 'section_head', number: '/05', title: 'What wears a drag hose out.', anchor: 'wear' },
    {
      type: 'prose',
      html: '<ul><li><strong>Edge abrasion.</strong> A lay flat hose drags on its edges when it is turned, so the folds wear first. Wide headland turns help more than anything else.</li><li><strong>Kinks at the hitch.</strong> A tight angle where the hose meets the applicator flexes the same few centimetres all day; a swivel and a hose guide spread the load.</li><li><strong>Stones and gateways.</strong> Sharp stones, concrete edges and steel gateposts cut covers; lay the hose clear and protect gateways.</li><li><strong>Leaving slurry inside.</strong> Slurry left standing attacks weaker materials and sets in folds. Flush with water after each job and blow or roll it out.</li><li><strong>Storage.</strong> Store on a reel or rolled, out of sun and away from rodents; never stack heavy coils on top of each other for long.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Irish contractors have reported replacing drag hose roughly every five years. Two habits add seasons: <strong>turn the hose end for end</strong> periodically so wear is spread along its length, and <strong>cut out a worn section and re-couple</strong> rather than running until it bursts in the field. The cover material matters too — TPU drag hose is extruded through the jacket in one pass, with no adhesive layer to fail, and resists abrasion, kinking, hydrolysis and fungus; it comes in red for visibility. For handling, a <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a> lays and recovers supply line, and a <a href="/p/lay-flat-hose-mover">hose mover</a> repositions long lines without dragging them across rough ground.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is 4" or 5" drag hose better?', answer: '5" loses about a third of the pressure of 4" at the same flow, which matters on long drag runs and heavy application rates. 4" is lighter to pull and still the most common; 5" and 6" suit higher output and longer drag runs.' },
        { question: 'How long can a drag hose be?', answer: 'It depends on flow, bore and pump pressure. Add the friction of supply line and drag hose and keep the total within the pump’s capacity and the hose’s working pressure, with a margin for thicker slurry.' },
        { question: 'Can I join a 6" supply line to a 5" drag hose?', answer: 'Yes. Our 4", 5" and 6" slurry couplings intermate without adapters, as do the 7" and 8".' },
        { question: 'Why does drag hose wear at the edges?', answer: 'Lay flat hose rests on its folds when dragged and turned. Wide turns, swivels at the hitch and turning the hose end for end spread the wear.' },
        { question: 'Should drag hose be flushed after use?', answer: 'Yes. Flush with water and empty the hose before storing it, so slurry does not set in the folds.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For umbilical systems',
      skus: ['IH-LF-TSD', 'IH-LF-TSS', 'IH-LF-CAG', 'IH-LF-EHR', 'IH-LF-EHM', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Slurry drag and supply hose, with transfer, riser and fuel hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'ireland',
      label: 'Umbilical hose supply to Ireland',
      blurb: 'Drag hose, supply line and couplings for Irish contractors.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Umbilical hose supply to the UK',
      blurb: 'Slurry drag and supply hose for UK farms and contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['slurry-umbilical-system-guide', 'low-emission-slurry-spreading-rules-europe', 'lay-flat-hose-flow-and-friction-loss', 'why-lay-flat-hose-fails', 'lay-flat-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Sizes, weights and pressures from the Indus TPU slurry drag and supply hose listings. Friction losses are water estimates; slurry with more dry matter loses more.',
    },
    {
      type: 'cta_block',
      heading: 'Sizing an umbilical system?',
      body: 'Send your application rate, working speed, supply and drag lengths and pump. We will size supply line, drag hose and couplings together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
