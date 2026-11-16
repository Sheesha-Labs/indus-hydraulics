import type { BlogArticleSeed } from '../shared'
import { COG_DIAGRAM } from '../diagrams'

/**
 * Centre of gravity in lifting: load share, tilt and stability. Statics only: lever-rule load share,
 * tilt tan φ = e / h, and stability about the axis through two lifting points. The modular beam example
 * uses the live 8 t beam (IH-LR-BH-MSB-8): end units and link plates rated 4 t each, 3 m span rated 8 t
 * at 30° (row -0300).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'centre-of-gravity-in-lifting',
  title: 'Centre of gravity in lifting: load share, tilt and why lifting points belong above it',
  excerpt:
    'A suspended load turns until its centre of gravity hangs directly under the hook. That one rule tells you how much each sling leg carries, how far a load will tilt, and why lifting from below the centre of gravity can roll a load over. With worked numbers and what it means for spreader beams.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Centre of Gravity in Lifting Explained',
  seoDescription:
    'How the centre of gravity sets each sling leg’s share, how far a load tilts, why lifting points belong above it, and what an offset load does to a spreader.',
  focusKeyword: 'centre of gravity in lifting',
  publishedAt: '2026-11-16T13:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The centre of gravity (CoG) is the point the whole weight of a load acts through. It depends on shape and on what the load is made of and holds — not on where the lifting lugs happen to be.',
        'Hung from a hook, a load turns until its CoG is directly below the hook. Plan the lift so that position is level, or know exactly how far it will tilt.',
        'Legs share the load in inverse proportion to their distance from the CoG: a lug 1 m from the CoG on 4 m centres carries 75% of the weight.',
        'The higher the CoG above the lifting point, the further an off-centre load tilts.',
        'A load lifted at two points can roll about the line joining them. It is stable only if its CoG lies below that line — which is why lifting points belong above the CoG.',
      ],
    },
    {
      type: 'lead',
      html: 'Every lift plan asks for the weight. The better ones also ask where the weight is. A skid with its pump at one end, a valve with its actuator, a tank with liquid left in it, a generator set with the fuel tank full — all of them weigh the same whichever way round you lift them, but they hang very differently. The centre of gravity decides how much each leg carries, whether the load comes up level, and in the worst case whether it stays the right way up.',
    },
    {
      type: 'direct_answer',
      question: 'How does the centre of gravity affect a lift?',
      answer:
        'A suspended load turns until its centre of gravity is directly below the crane hook. If the lifting points are not symmetric about the centre of gravity, the load tilts and the legs share the weight unequally — the leg nearer the centre of gravity carries more. If the lifting points are below the centre of gravity, the load can topple about them, so lifting points are best placed above it.',
    },

    { type: 'section_head', number: '/01', title: 'What the centre of gravity is.', anchor: 'what' },
    {
      type: 'paragraph',
      html: 'Engineers treat the whole weight of an object as if it acted at one point: the centre of gravity. For a solid block of one material it is in the middle. Change the shape — a step, a bracket, a motor on one end — and it moves toward the bulk. Change the contents and it moves again: an empty box tips off a shelf when half of it overhangs the edge, but fill one end with something heavy and it tips much sooner. So the CoG is a property of the load as it will be lifted, including anything left inside it.',
    },
    {
      type: 'prose',
      html: '<p>Where to get it:</p><ul><li><strong>The maker’s data</strong> — the general arrangement drawing or rigging sheet for skids, packaged plant, vessels and modules usually marks the CoG with the quartered-circle symbol.</li><li><strong>Calculation</strong> — from the weights and positions of the main parts, for fabrications made in-house.</li><li><strong>Weighing</strong> — load cells under each support give each corner’s share, from which the CoG follows directly.</li><li><strong>A trial lift</strong> — raise the load a few centimetres, stop and watch which way it tilts before committing to the full lift.</li></ul><p>Allow for what the drawing may not show: water left after a hydrotest, fuel, packing, loose items and accessories fitted on site.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The rule: CoG under the hook.', anchor: 'under-hook' },
    {
      type: 'paragraph',
      html: 'A suspended load is free to swing and turn, and it settles where its weight acts straight down through the hook. That is all the planning needs: put the hook over the CoG and the load comes up level; put it anywhere else and the load turns until the CoG gets there on its own.',
    },
    {
      type: 'diagram',
      svg: COG_DIAGRAM,
      captionPrefix: 'FIG. 01',
      caption: 'Left: hook over the centre of gravity, legs sharing the load unequally. Right: a load hung from one central point tilts until its centre of gravity is under the hook — further when the centre of gravity is higher.',
      alt: 'Left, a 10 tonne load on a two-leg sling with lifting points 4 metres apart and the centre of gravity 1 metre from point A and 3 metres from point B; the hook is directly above the centre of gravity; leg A carries 7.5 tonnes vertically and 8.2 tonnes along the leg, leg B 2.5 tonnes vertically and 4.2 tonnes along the leg. Right, the same box hung from a single lifting point at the middle of its top edge, with the centre of gravity offset to one side: with a low centre of gravity the box tilts about 31 degrees, with the same offset higher up it tilts about 56 degrees.',
    },

    { type: 'section_head', number: '/03', title: 'How the legs share the load.', anchor: 'share' },
    {
      type: 'paragraph',
      html: 'With the hook over the CoG, each lifting point carries a share in inverse proportion to its distance from the CoG — the lever rule. For a 10 t load on lugs 4 m apart, with the CoG 1 m from lug A and 3 m from lug B:',
    },
    {
      type: 'prose',
      html: '<ul><li>Lug A carries 10 × 3 ÷ 4 = <strong>7.5 t</strong>; lug B carries 10 × 1 ÷ 4 = <strong>2.5 t</strong>.</li><li>With the hook 2.2 m above the lugs, leg A leans 1 m off vertical and leg B 3 m. Leg A’s tension is 7.5 × 2.42 ÷ 2.2 = <strong>8.2 t</strong>; leg B’s is 2.5 × 3.72 ÷ 2.2 = <strong>4.2 t</strong>.</li><li>The legs are different lengths — 2.4 m and 3.7 m — because the hook is not over the middle of the load.</li></ul><p>Two consequences. A two-leg sling’s rating assumes the legs share equally: one marked 10 t for angles up to 45° has legs of about 7.1 t each (10 ÷ 1.4), so leg A at 8.2 t is overloaded although the load matches the marking — and leg B, at 54° from vertical, is outside that band altogether. And equal-length legs cannot put the hook over this CoG: the load would tilt toward lug A until it found its own balance. Use legs of the right lengths, or adjust one with a <a href="/blog/chain-sling-shortening-clutches-and-grab-hooks">shortening clutch</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'How far an off-centre load tilts.', anchor: 'tilt' },
    {
      type: 'paragraph',
      html: 'Hang a load from a single point and it tilts until the CoG is under that point. The angle is set by two distances measured on the load: how far the CoG is off to the side of the lifting point (e) and how far below it (h). The tilt is tan⁻¹(e ÷ h). With the CoG 0.3 m to one side and 0.5 m below the lifting point the load tilts about 31°; raise the CoG to 0.2 m below the lifting point and the same offset tilts it about 56°. A high CoG magnifies every error in where the lifting point is placed.',
    },

    { type: 'section_head', number: '/05', title: 'Above or below: stability.', anchor: 'stability' },
    {
      type: 'paragraph',
      html: 'Lift a load at two points and it can rotate freely about the line joining them — the slings do not change length as it turns. Whether it stays upright depends on where the CoG sits relative to that line.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>CoG below the line</strong> — lugs on top of the load. If the load is disturbed it swings back, like a pendulum. This is the stable case and the reason lifting points are best placed above the CoG.</li><li><strong>CoG above the line</strong> — lifting from the base, or a single bar through the bottom of the load. The load is balanced like a pencil on its point: any disturbance, a gust or a snag, and it rolls over about the lifting points.</li></ul><p>Four lifting points that are not in one line remove that freedom — the load cannot roll about a single axis — but only if all four legs stay loaded. Base-lifted loads are where engineered lifting bars and frames earn their keep; see <a href="/blog/lifting-bars-for-air-handling-units">lifting bars for air handling units</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never lift a top-heavy load at two low points.',
      body: 'A load lifted at two points below its centre of gravity can roll over in the air. Lift from points above the centre of gravity, or use four points with a frame that keeps every leg loaded, and plan the lift with someone competent to check it.',
    },

    { type: 'section_head', number: '/06', title: 'Offset loads under a spreader beam.', anchor: 'spreader' },
    {
      type: 'paragraph',
      html: 'A spreader beam does not change the rule: the hook still has to be over the CoG, so with an offset load the top slings are unequal lengths and one end of the beam carries more than half. Modular beams are rated component by component. On our <a href="/p/modular-spreader-beam-8-tonne">8 t modular spreader beam</a> each end unit and link plate is rated 4 t. Built to 3 m and rigged at 30°, the chart allows 8 t — but put a 7 t load on it with its CoG 0.4 m off centre and the near end carries 7 × 1.9 ÷ 3 = 4.4 t. The beam is within its chart; the end unit is not.',
    },
    {
      type: 'paragraph',
      html: 'For loads that are always offset, a <a href="/p/fixed-lifting-beams">lifting beam</a> with an offset or sliding top lug puts the hook over the CoG and keeps the load level. Loads that must be hung away from the crane altogether — into a building, under an overhang — use a <a href="/p/counterweight-lifting-beams">counterweight lifting beam</a>, whose design depends entirely on knowing the CoG.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the centre of gravity of a load?', answer: 'The single point through which the whole weight of the load acts. It depends on the load’s shape and on what it is made of and contains.' },
        { question: 'Why does a load tilt when it is lifted?', answer: 'A suspended load turns until its centre of gravity is directly under the hook. If the hook is not over the centre of gravity at the start, the load tilts until it is.' },
        { question: 'How do I calculate the load on each sling leg with an offset centre of gravity?', answer: 'With the hook over the centre of gravity, each lifting point carries the load times the distance from the other point to the centre of gravity, divided by the distance between points. Then divide by the cosine of that leg’s angle from vertical for its tension.' },
        { question: 'Why are lifting points on top of a load safer?', answer: 'A load lifted at two points can rotate about the line between them. With the points above the centre of gravity it hangs stably; with them below, it can topple.' },
        { question: 'How do I find the centre of gravity of a skid or module?', answer: 'From the maker’s general arrangement drawing, by calculation from component weights, by weighing each support with load cells, or with a short trial lift to see which way it tilts.' },
        { question: 'Can a spreader beam lift a load with an offset centre of gravity?', answer: 'Yes, with the hook over the centre of gravity and unequal top slings, provided each end of the beam stays within its own rating as well as the beam’s chart.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Beams for balanced and offset loads',
      skus: ['IH-LR-BH-MSB-8', 'IH-LR-BH-FLB', 'IH-LR-BH-SSB', 'IH-LR-BH-CWB', 'IH-LR-BH-MCB-16'],
    },
    { type: 'category_link', slug: 'lifting-beams', label: 'Lifting beams', blurb: 'Fixed, multi-point, semi-spreader and counterweight beams for loads that are not balanced.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Lifting, rigging and plant supply for contractors.' },
    {
      type: 'related_articles',
      slugs: ['spreader-beam-vs-lifting-beam', 'sling-angle-compression-force', 'lifting-bars-for-air-handling-units', 'sling-angle-chart', 'chain-sling-shortening-clutches-and-grab-hooks'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Load share and tilt are exact statics. Beam and component ratings are from our live listing; the certificate and user instructions for a specific beam govern.',
    },
    {
      type: 'cta_block',
      heading: 'Lifting an unbalanced load?',
      body: 'Send the weight, the centre of gravity and the lifting points from the drawing. We will size the legs and propose a sling set or beam that brings it up level.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
