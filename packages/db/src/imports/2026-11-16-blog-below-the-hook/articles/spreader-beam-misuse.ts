import type { BlogArticleSeed } from '../shared'
import { MISUSE_DIAGRAM } from '../diagrams'

/**
 * Spreader beam misuse: the rigging errors that leave a spreader idle, put it in tension or bending, or
 * overload one end. Force reasoning is statics (horizontal balance at each beam end). The 6° bottom-sling
 * limit is the figure spreader makers' user instructions commonly give (checked 2026-11-16 in two makers'
 * published instructions); it is attributed to "the maker's instructions", not to a clause of EN 13155.
 * Listing facts are from the live 8 t modular beam (IH-LR-BH-MSB-8): 3 m at 45° rated 5 t, minimum top
 * sling 2.1 m; end units 4 t; M10 × 30 grade 8.8 bolts at 80 Nm; no more than six struts.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'spreader-beam-misuse',
  title: 'Spreader beam misuse: seven rigging errors that turn a spreader into a hazard',
  excerpt:
    'A spreader beam is designed for one load case: vertical drops at its ends, angled top slings, compression in between. Change the rigging and the forces change with it — the beam can end up doing nothing, being pulled apart, bent, or overloaded at one end. Seven common errors, why each matters, and how to spot them before the lift.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Spreader Beam Misuse: 7 Rigging Errors',
  seoDescription:
    'Seven spreader beam rigging errors: angled bottom slings, beams in tension or bending, short top slings, offset loads and mixed parts, and how to spot them.',
  focusKeyword: 'spreader beam misuse',
  publishedAt: '2026-11-16T13:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A spreader beam is rated for one arrangement: bottom slings vertical (makers commonly allow up to 6° from vertical), top slings within the chart angle, load only at the two end links.',
        'Bottom slings in line with the top slings: the beam carries nothing and the load takes all the compression.',
        'Bottom slings splayed wider than the top slings: the beam is pulled apart in tension, which its bolts and end units were not designed for.',
        'A load hung from the middle, or a single top sling, puts a compression member into bending — the quickest way to fail one.',
        'Short top slings, offset loads, mixed components and wrong bolts overload a beam that looks correctly rigged.',
      ],
    },
    {
      type: 'lead',
      html: 'Spreader beams look simple, and that is the problem. A length of tube with a shackle at each end does not look like precision equipment, so it gets rigged the way the slings happen to fit. But a spreader is light precisely because it is designed for one load case — compression between two vertical drops — and every departure from that case moves force somewhere it was not designed to go. Most of the errors below are visible from the ground, in the photos a project proudly posts afterwards.',
    },
    {
      type: 'diagram',
      svg: MISUSE_DIAGRAM,
      captionPrefix: 'FIG. 01',
      caption: 'The angle of the bottom slings decides what the beam is doing. Only the first rig uses the beam as designed.',
      alt: 'Three spreader beam rigs. First, correct: top slings angled to the hook, bottom slings hanging vertically from the beam ends to the load; the beam is in compression. Second, the bottom slings continue in a straight line from the top slings to lifting points wider than the beam; the beam carries nothing and the load is squeezed. Third, the bottom slings splay out even wider than the top slings; the beam is pulled apart in tension.',
    },

    { type: 'section_head', number: '/01', title: 'Bottom slings in line with the top slings.', anchor: 'in-line' },
    {
      type: 'paragraph',
      html: 'The lifting points on the load are further apart than the beam, and the bottom slings run out at the same angle as the top slings, so each side of the rig is one straight line from hook to lug. At the beam end nothing changes direction, so no force goes into the beam. Take the beam away and the slings, the angles and the forces in the load would be exactly the same. The beam is a passenger.',
    },
    {
      type: 'paragraph',
      html: 'The beam will not fail — but the load is now carrying all the compression the spreader was bought to remove, and whoever planned the lift believes it is not. A long panel, a tank or a module that cannot take end compression can buckle or crack. How big that squeeze is, angle by angle, is in <a href="/blog/sling-angle-compression-force">sling angle compression force</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Bottom slings splayed wider still.', anchor: 'tension' },
    {
      type: 'paragraph',
      html: 'Now the bottom slings lean out further than the top slings lean in. At each beam end the bottom sling pulls outward harder than the top sling pulls inward, and the beam is what holds the two ends together — in tension. A modular beam is designed for compression: its flange bolts are sized for the shear and bending of a strut, not for pulling the joint apart. Tension the designer never allowed for adds to those stresses, and the beam can fail at a joint well below its rating. This rig is worse than the first: the load is still squeezed, and the beam is now at risk too.',
    },
    {
      type: 'paragraph',
      html: 'The opposite fault — bottom slings leaning inward to lugs closer together than the beam ends — adds their inward pull to the top slings’, so the beam carries more compression than its chart allows for. The cure for all three is the same: <strong>make the beam span equal to the lifting point spacing</strong>, so the drops hang vertically. Makers’ instructions commonly allow the bottom slings no more than 6° from vertical.',
    },

    { type: 'section_head', number: '/03', title: 'Using a spreader as a lifting beam.', anchor: 'bending' },
    {
      type: 'paragraph',
      html: 'Hanging a load from the middle of a spreader, or from a strut, or rigging the whole beam from a single top sling, makes it a lifting beam — and puts it in bending. A spreader is a fraction of the section a lifting beam of the same capacity needs, so this is the error most likely to end with a bent beam and a dropped load. Load a spreader only at its two end links. If the job needs one top point or extra pick points along the length, use a <a href="/c/lifting-beams">lifting beam</a>. The difference is in <a href="/blog/spreader-beam-vs-lifting-beam">spreader beam vs lifting beam</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Top slings too short.', anchor: 'short-slings' },
    {
      type: 'paragraph',
      html: 'A spreader’s rating depends on its top sling angle as well as its span, and the chart gives the shortest top sling for each angle. Our <a href="/p/modular-spreader-beam-8-tonne">8 t modular beam</a> at a 3 m span is rated 5 t at 45° to the vertical and needs top slings of at least 2.1 m to stay within it. Use 1.5 m slings because they were in the container and the angle opens past 45° — outside every row of the chart, with compression rising steeply. Measure the top slings, and read the column for the angle you actually rig.',
    },

    { type: 'section_head', number: '/05', title: 'An offset load on a beam rated by halves.', anchor: 'offset' },
    {
      type: 'paragraph',
      html: 'If the load’s centre of gravity is off centre, one end of the beam carries more than half. Modular beams are rated component by component — on the 8 t beam each end unit and link plate is rated 4 t — so a load within the beam’s chart can still overload one end. Work out each end’s share from the centre of gravity before the lift; <a href="/blog/centre-of-gravity-in-lifting">centre of gravity in lifting</a> shows how.',
    },

    { type: 'section_head', number: '/06', title: 'Mixed parts, wrong bolts, too many struts.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<p>A modular beam is certified as a system, for the configurations in its chart. It stops being that system when:</p><ul><li><strong>Components are mixed</strong> — struts from another size, another series or another maker. Flanges that bolt up are not the same as parts designed together.</li><li><strong>Bolts are substituted or under-tightened.</strong> The 8 t beam specifies M10 × 30 grade 8.8 bolts, nuts and washers at 80 Nm; a hardware-store bolt of the right diameter is not a replacement.</li><li><strong>The span is not in the chart</strong>, or the beam carries more struts than allowed (six on the 8 t beam), or there is a flange joint at mid-span when the instructions put the longest strut in the middle.</li><li><strong>The beam is modified</strong> — a lug welded on, a hole drilled for a tag line. Any change voids the certificate until the maker re-rates it.</li></ul>',
    },

    { type: 'section_head', number: '/07', title: 'Clashes and twisted end links.', anchor: 'clashes' },
    {
      type: 'paragraph',
      html: 'End links should hang toward the load, and no shackle or sling should bear on the beam itself. A sling bent over the end of the tube or a shackle jammed against a flange is carrying load in a direction nobody rated. Before the lift, take the slack out, stop, and look along the rig from both ends.',
    },
    {
      type: 'decision_tree',
      heading: 'Before every spreader lift',
      intro: 'Five checks from the ground.',
      branches: [
        { condition: 'Do the bottom slings hang vertically?', outcome: 'If not, change the span to match the lifting points. Makers commonly allow 6° at most.' },
        { condition: 'Is the load hung only from the two end links?', outcome: 'Anything else is a lifting beam job.' },
        { condition: 'Are the top slings at least the chart minimum for the span and angle?', outcome: 'If not, use the 45° column, or longer slings.' },
        { condition: 'Is the centre of gravity central?', outcome: 'If not, check each end’s share against its own rating.' },
        { condition: 'Is it one system, assembled to the instructions, with its marking and certificate?', outcome: 'No mixed parts, correct bolts and torque, span in the chart.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What angle can the bottom slings of a spreader beam be at?', answer: 'They should hang vertically. Makers’ instructions commonly allow no more than 6° from vertical. Beyond that the beam is either idle, in tension or overloaded in compression, depending on which way they lean.' },
        { question: 'Can a spreader beam be used as a lifting beam?', answer: 'No, unless its instructions give a lifting-beam rating. A spreader is designed for compression and is much lighter than a lifting beam; a load hung from its middle puts it in bending.' },
        { question: 'Why does a spreader beam not reduce the load on my lifting points?', answer: 'If the bottom slings are angled in line with the top slings, the beam carries nothing and the load and its lugs see the same forces as without it. The bottom slings must hang vertically.' },
        { question: 'Can I mix struts from different spreader beams?', answer: 'No. A modular beam is certified as one system for the configurations in its chart. Parts from another size, series or maker are not covered by that certificate.' },
        { question: 'What happens if the top slings are too short?', answer: 'The top sling angle opens beyond the chart row you chose, the compression in the beam rises and the beam is overloaded. Use the chart’s minimum top sling length for the span and angle.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Spreader beams with full span charts',
      skus: ['IH-LR-BH-MSB-4', 'IH-LR-BH-MSB-8', 'IH-LR-BH-MSB-13', 'IH-LR-BH-MSB-24', 'IH-LR-BH-TSB', 'IH-LR-BH-FSB'],
    },
    { type: 'category_link', slug: 'spreader-beams', label: 'Spreader beams', blurb: 'Every modular beam listed with its load chart and minimum top sling length at 45°, 30° and 20°.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Lifting, rigging and plant supply for contractors.' },
    {
      type: 'related_articles',
      slugs: ['spreader-beam-vs-lifting-beam', 'sling-angle-compression-force', 'centre-of-gravity-in-lifting', 'lifting-gear-rejection-criteria', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Force reasoning is statics. Beam figures are from our live listing; the 6° bottom-sling limit is as commonly given in makers’ user instructions. The instructions for a specific beam govern.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure your rig is right?',
      body: 'Send a sketch or photo of the rig with the load weight, lifting-point spacing and sling lengths. We will check the beam size and span against its chart and quote what is missing.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
