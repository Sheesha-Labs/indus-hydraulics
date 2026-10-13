import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Why lay flat hose fails — failure modes, causes and prevention. General engineering practice;
 * product figures (temperature ranges, ratings, wall/ID) from our live listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'why-lay-flat-hose-fails',
  title: 'Why lay flat hose fails: bursts, kinks, abrasion and how to prevent them',
  excerpt:
    'Lay flat hose rarely fails because it was too weak on paper. It fails at a kink, along a worn fold, at a coupling that crept, after a pressure surge, or because it was used on a pump suction. Here are the eight common failure modes, how to read the evidence on a failed hose, and the handling and inspection habits that prevent them.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Why Lay Flat Hose Bursts or Fails: 8 Causes and How to Prevent Them',
  seoDescription:
    'The eight common lay flat hose failures — kinks, fold wear, abrasion, surge, coupling pull-off, heat and UV, suction collapse, chemical attack — how to diagnose each and how to prevent it.',
  focusKeyword: 'lay flat hose burst',
  publishedAt: '2026-10-13T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Most lay flat failures start at a fold, a kink or a coupling — not in the middle of a straight length.',
        'Unroll fully and lay straight before pressurising. A hose charged on the reel or twisted can kink and burst.',
        'Pressure surges from fast valve closure or pump trips can exceed the working pressure; open and close slowly.',
        'Abrasion and sun do slow damage; TPU and NBR covers last far longer than PVC when dragged or left out.',
        'Never use lay flat on a pump suction — it collapses and starves the pump.',
      ],
    },
    {
      type: 'lead',
      html: 'When a lay flat line splits, the first instinct is to order a stronger hose. Usually that is the wrong fix. A hose rated well above the pump’s pressure can still fail if it is charged while twisted, dragged over a sharp edge, folded the same way for years or slammed by a closing valve. The evidence is almost always on the failed length — if you know what to look for.',
    },

    { type: 'section_head', number: '/01', title: 'The eight common failure modes.', anchor: 'failure-modes' },
    {
      type: 'direct_answer',
      question: 'Why does lay flat hose burst?',
      answer:
        'Lay flat hose usually bursts at a kink or a twist where it was pressurised without being laid straight, along a fold worn by repeated rolling, at a damaged or abraded spot, or under a pressure surge from a valve closed quickly or a pump tripping. Overpressure from running above the working pressure for the bore is the other common cause.',
    },
    {
      type: 'comparison_table',
      caption: 'How lay flat hose fails, and what it looks like',
      columns: ['Failure', 'What you see', 'Usual cause'],
      rows: [
        { cells: ['Kink burst', 'Split at a sharp bend or twist', 'Charged while twisted, on the reel, or over an edge'], highlight: true },
        { cells: ['Fold-line wear', 'Cover worn through along the two edges', 'Rolled and stored the same way for years; dragged flat'] },
        { cells: ['Abrasion', 'Patches of exposed woven jacket', 'Dragging over rock, concrete, gravel'] },
        { cells: ['Surge rupture', 'Long split, often near the pump or a valve', 'Fast valve closure or pump trip on a full line'] },
        { cells: ['Coupling pull-off', 'Hose blown off the shank', 'Wrong clamp for the wall, uneven tightening, not re-checked'] },
        { cells: ['Heat and UV', 'Chalky, cracked or stiff cover', 'Long sun exposure empty; PVC worst'] },
        { cells: ['Suction collapse', 'Hose flat at the pump inlet, pump starving', 'Lay flat used on a suction line'] },
        { cells: ['Chemical attack', 'Swollen, soft or blistered cover or tube', 'Fluid not compatible with the polymer'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Kinks and twists.', anchor: 'kinks' },
    {
      type: 'figure',
      imageId: FIG['fig-fails-kink'],
      captionPrefix: 'FIG. 01',
      caption: 'A kink concentrates the whole pressure load on one fold of the jacket. Laid straight, the same hose runs well inside its rating.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'A lay flat hose is designed to be round under pressure. Charge it while it is twisted, still partly on the reel, or bent over a kerb and the wall folds into a sharp crease that concentrates stress on a few yarns of the jacket. The fix is procedural: unroll fully, lay the hose straight with gentle curves, then fill slowly from the pump end with the far end open to let air out. Use hose bridges at road crossings rather than letting vehicles fold it.',
    },

    { type: 'section_head', number: '/03', title: 'Folds, abrasion and dragging.', anchor: 'abrasion' },
    {
      type: 'paragraph',
      html: 'Every time lay flat is rolled, its two edges are folded. Over years the cover along those fold lines wears first — the classic sign is a hose sound everywhere except two strips running its full length. Rolling from alternate ends, and storing coils without heavy loads on top, spreads the wear. Dragging is the other enemy: a hose pulled across rock or concrete loses its cover quickly.',
    },
    {
      type: 'paragraph',
      html: 'Material choice decides how much of this a hose takes. Through-the-weave TPU, as in our <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> and the heavier-walled <a href="/p/tpu-lay-flat-slurry-drag-hose">slurry drag hose</a>, resists abrasion best; nitrile rubber with a ribbed cover, as in our <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a>, comes next; PVC wears fastest. Our <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">materials comparison</a> covers the trade-offs.',
    },

    { type: 'section_head', number: '/04', title: 'Pressure: overpressure and surge.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'Working pressure falls with bore, so a pump that is safe on 6" hose can overpressure 16" hose. Check the rating for the size in use — our TPU dewatering hose runs from 21 bar at 1-1/2" to 10 bar at 16" — and remember a centrifugal pump makes its highest pressure at shut-off. Surge is the sudden spike when moving water stops: a valve snapped shut or a pump tripping can briefly push pressure well above the running value. Open and close valves slowly, and size the hose with headroom. Our guide to <a href="/blog/lay-flat-hose-pressure-ratings">pressure ratings</a> explains how.',
    },

    { type: 'section_head', number: '/05', title: 'Couplings, heat, suction and chemicals.', anchor: 'other-causes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Coupling pull-off.</strong> The clamp must match the hose wall, be tightened evenly and be re-checked after the first pressurisation. On large bores use a dedicated <a href="/c/lay-flat-hose-couplings">lay flat coupling</a> with a forged shank and bolted clamp — see our <a href="/blog/lay-flat-hose-couplings-guide">coupling guide</a>.</li><li><strong>Heat and UV.</strong> An empty hose in direct sun gets much hotter than the air. TPU and NBR are rated to +80 °C in our range and resist UV well; PVC ages fastest. Store coils shaded, and keep working lines full where possible.</li><li><strong>Suction collapse.</strong> Lay flat cannot hold vacuum. Fit a <a href="/p/epdm-pe-suction-hose">rigid-helix suction hose</a> on the pump inlet — see <a href="/blog/suction-hose-vs-lay-flat-hose">suction vs lay flat</a>.</li><li><strong>Chemical attack.</strong> Fuels and oils need NBR or TPU, and fuel transfer needs an <a href="/p/antistatic-tpu-lay-flat-fuel-hose">antistatic hose</a> earthed at both ends. Check compatibility for anything other than water.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'An inspection routine.', anchor: 'inspection' },
    {
      type: 'decision_tree',
      heading: 'Before each deployment',
      intro: 'Five minutes per length, before it goes back into service.',
      branches: [
        { condition: 'Is the cover worn through to the jacket anywhere?', outcome: 'Retire or cut out the section and re-couple; exposed jacket fails quickly under pressure.' },
        { condition: 'Are there blisters, soft spots or swelling?', outcome: 'Suspect chemical attack or delamination — retire the length.' },
        { condition: 'Are the fold lines cracked or thin?', outcome: 'Downgrade to low-pressure duty or retire; roll from the other end next time.' },
        { condition: 'Are couplings, shanks and clamps sound and tight?', outcome: 'Replace damaged parts; re-torque clamps after the first fill.' },
        { condition: 'Is the hose marked or tagged with its size and class?', outcome: 'If not, confirm its rating before using it on a pressurised line.' },
      ],
    },
    {
      type: 'paragraph',
      html: 'A damaged length can often be saved: cut out the damaged section and rejoin the two ends with a <a href="/p/hose-mender">hose mender</a> or a pair of couplings. Our TPU hose is made in lengths up to 400 m, so a cut-down length still has plenty of use.',
    },
    {
      type: 'paragraph',
      html: 'In the Gulf, heat and sun are a failure mode of their own; see <a href="/blog/lay-flat-hose-in-gulf-heat">lay flat hose in Gulf heat</a> for summer practice and storage.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why does my lay flat hose keep splitting along the edge?', answer: 'Edge splits are usually fold-line wear from rolling the same way for a long time, or abrasion from dragging the hose flat. Roll from alternate ends, avoid dragging, and choose a TPU or ribbed NBR cover for heavy handling.' },
        { question: 'Can a lay flat hose burst below its rated pressure?', answer: 'Yes, if it is kinked, twisted, damaged or hit by a pressure surge. The rating assumes the hose is laid straight, undamaged and correctly coupled.' },
        { question: 'How do I stop lay flat hose from kinking?', answer: 'Unroll it fully, lay it straight with gentle curves, and fill it slowly before running at full pressure. Protect it at road crossings with hose bridges.' },
        { question: 'Can I repair lay flat hose?', answer: 'Yes. Cut out the damaged section and rejoin the ends with a hose mender or couplings sized to the hose. Do not patch over a damaged jacket on a pressurised line.' },
        { question: 'Does sun damage lay flat hose?', answer: 'Long exposure ages the cover, especially PVC. TPU and NBR resist UV far better. Store coils shaded and avoid leaving empty hose in direct sun for long periods.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hard-wearing hose and repair parts',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-TSD', 'IH-LF-CVG', 'IH-KC-HOSE-MENDER'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'TPU, NBR and PVC lay flat hose with couplings, reels and suction hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'poland',
      label: 'Lay flat hose supply to Poland',
      blurb: 'Hard-wearing lay flat hose for Polish mining, construction and municipal contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-in-gulf-heat', 'lay-flat-hose-guide', 'tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-pressure-ratings', 'lay-flat-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Product ratings and temperature ranges from the Indus lay flat hose listings as published on 13 October 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a failed line?',
      body: 'Send us a photo of the failure and the duty. We will tell you what probably caused it and recommend the hose, class and couplings that will not repeat it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
