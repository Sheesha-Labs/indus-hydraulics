import type { BlogArticleSeed } from '../shared'
import { FORCE_TRIANGLE } from '../diagrams'

/**
 * Why an angled sling carries more than its share, and where the extra goes: the force triangle and the
 * compression it puts into the load or a spreader beam. Exact statics (tension = V / cos θ, inward
 * force = V tan θ, θ from vertical). Kept distinct from /blog/sling-angle-chart, which tabulates leg
 * tension and rating bands; this one is about the horizontal component. The spreader check uses the
 * live 8 t modular beam chart at 4 m (IH-LR-BH-MSB-8-0400: 3 / 5 / 8 t at 45 / 30 / 20°).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sling-angle-compression-force',
  title: 'Sling angle compression force: why an angled sling pulls harder, and what it does to the load',
  excerpt:
    'An angled sling has to pull sideways as well as up, so it always carries more than its share of the weight. The sideways part squeezes the load between the lifting points. How to find both forces with one triangle, the mistake that doubles the compression, and how a spreader beam takes it out of the load.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Sling Angle Compression Force Explained',
  seoDescription:
    'Why an angled sling carries more than its share of the load, how to work out the inward compression with one triangle, and how a spreader beam takes it away.',
  focusKeyword: 'sling angle compression',
  publishedAt: '2026-11-16T13:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Only the vertical part of a sling’s pull holds the load up. At an angle the sling also pulls sideways, so its tension is always more than its share of the weight.',
        'Tension = share of the load ÷ cos(angle from vertical). The sideways pull = share of the load × tan(angle from vertical).',
        'The two sideways pulls meet in the load and squeeze it. The compression equals ONE leg’s sideways pull, not the two added together.',
        'Worked example: a 12 t load on two legs at 40° from vertical puts 7.8 t in each leg — too much for a 6.5 t shackle — and 5.0 t of compression in the load.',
        'A spreader beam moves that compression out of the load and into the beam. Its load chart is a compression limit in disguise.',
      ],
    },
    {
      type: 'lead',
      html: 'Most riggers know the rule: open the sling angle and the load in each leg goes up. Fewer can say why, and fewer still think about where the extra force goes. It does not disappear — it pushes the lifting points toward each other, and the load between them has to resist it. For a solid steel block that hardly matters. For a thin-walled tank, a long precast panel, a timber truss or a cladding unit, it can be the force that damages the load before it ever leaves the ground.',
    },

    { type: 'section_head', number: '/01', title: 'One leg at a time.', anchor: 'one-leg' },
    {
      type: 'paragraph',
      html: 'Take a 12 t load with its centre of gravity in the middle, lifted by a two-leg sling from lugs at each end. Each lug carries half the weight: 6 t. If the legs hung straight down, each would carry exactly 6 t. But the legs meet at a hook above the middle of the load, so each one leans inward — say at 40° from vertical.',
    },
    {
      type: 'paragraph',
      html: 'A sling can only pull along its own length. Pulling at 40°, part of that pull is upward and part is sideways, toward the other lug. The upward part has to equal the 6 t share or the load does not leave the ground; the sideways part comes along whether you want it or not. Because the sling has to supply both, its tension is larger than either.',
    },
    {
      type: 'diagram',
      svg: FORCE_TRIANGLE,
      captionPrefix: 'FIG. 01',
      caption: 'The three forces at one lifting point form a right-angled triangle. Draw the vertical side to scale and the angle fixes the other two.',
      alt: 'Left, a load lifted by a two-leg sling with each leg at 40 degrees from vertical; arrows show 5.0 tonnes of compression squeezing the load between the lifting points. Right, the force triangle for one lifting point, drawn to scale: a vertical side of 6.0 tonnes, a horizontal side of 5.0 tonnes and a sloping side, the sling, of 7.8 tonnes, with the 40 degree angle between the vertical and the sling.',
    },

    { type: 'section_head', number: '/02', title: 'The triangle does the maths.', anchor: 'triangle' },
    {
      type: 'prose',
      html: '<p>The three forces at the lug — vertical, horizontal and the pull in the sling — form a right-angled triangle with the same 40° angle as the sling. You can solve it by drawing it to scale on squared paper, or with two lines of trigonometry:</p><ul><li><strong>Sling tension</strong> = 6 t ÷ cos 40° = 6 ÷ 0.766 = <strong>7.8 t</strong>.</li><li><strong>Sideways pull</strong> = 6 t × tan 40° = 6 × 0.839 = <strong>5.0 t</strong>.</li></ul><p>So the answer to “will a 6.5 t shackle and sling do on each leg?” is no, even though two of them add up to 13 t on a 12 t load. Each leg sees 7.8 t; the next size up, an 8.5 t shackle, is the one that works. The same factors, for every angle, are tabulated in the <a href="/blog/sling-angle-chart">sling angle chart</a>.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Two-leg lift of a 10 t load with a central centre of gravity',
      columns: ['Angle from vertical', 'Tension in each leg', 'Compression in the load'],
      rows: [
        { cells: ['0° (legs vertical)', '5.0 t', '0'] },
        { cells: ['15°', '5.2 t', '1.3 t'] },
        { cells: ['20°', '5.3 t', '1.8 t'] },
        { cells: ['30°', '5.8 t', '2.9 t'] },
        { cells: ['40°', '6.5 t', '4.2 t'] },
        { cells: ['45°', '7.1 t', '5.0 t'] },
        { cells: ['60°', '10.0 t', '8.7 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Notice how differently the two columns grow. Between 0° and 30° the leg tension rises only 16%, but the compression goes from nothing to almost 30% of the load. By 60° the load is being squeezed with nearly its own weight. Angles here are measured from vertical; many US charts measure from horizontal, so their 60° is this table’s 30°.',
    },

    { type: 'section_head', number: '/03', title: 'The mistake that doubles it.', anchor: 'doubling' },
    {
      type: 'paragraph',
      html: 'Two lugs, two inward pulls of 5.0 t each — so the load is squeezed with 10 t? No. The two pulls are the same force seen from each end, the way the rope in a tug of war carries the pull of one team, not both added together. One end pushes inward with 5.0 t; the other end resists with 5.0 t; the load between them is in 5.0 t of compression. Doubling it over-designs the load check, which is harmless; the reverse mistake — forgetting the compression altogether — is the one that crushes things.',
    },

    { type: 'section_head', number: '/04', title: 'What the compression does.', anchor: 'effects' },
    {
      type: 'prose',
      html: '<ul><li><strong>It squeezes the load.</strong> Long, slender or hollow loads — pipe spools, tanks, ducting, precast panels, modules and trusses — can bow, buckle or crack. Ask the designer of the load what end compression it can take.</li><li><strong>It loads the lifting points sideways.</strong> A lug or eye bolt loaded at an angle carries much less than its vertical rating; see <a href="/blog/eye-bolt-types-and-angled-loads">eye bolts and angled loads</a> and <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a>.</li><li><strong>It acts on the casing, not just the lugs.</strong> A sling that touches the side of a unit on its way up presses into it with this force — the usual way a crane lift dents the cladding of plant and equipment.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'Where a spreader beam comes in.', anchor: 'spreader' },
    {
      type: 'paragraph',
      html: 'A <a href="/c/spreader-beams">spreader beam</a> moves the angle above the load. The bottom slings hang vertically from the beam ends to the lugs, so the load feels no sideways pull at all. The top slings still lean in toward the hook, and their sideways pull is still share × tan(angle) — but now the beam takes it, as compression, instead of the load. More on the difference in <a href="/blog/spreader-beam-vs-lifting-beam">spreader beam vs lifting beam</a>.',
    },
    {
      type: 'paragraph',
      html: 'You can see the compression in a spreader beam’s load chart. Our <a href="/p/modular-spreader-beam-8-tonne">8 t modular spreader beam</a> built to a 4 m span is rated:',
    },
    {
      type: 'comparison_table',
      caption: '8 t modular spreader beam at 4 m span (from our listing), with the compression it implies',
      columns: ['Top slings to vertical', 'Rated load', 'Compression in the beam'],
      rows: [
        { cells: ['45°', '3 t', '1.5 t'] },
        { cells: ['30°', '5 t', '1.4 t'] },
        { cells: ['20°', '8 t', '1.5 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Three very different ratings, but the compression they put into the beam is about the same: roughly 1.5 t, which is what a 4 m strut of that section will carry. Steeper top slings mean less squeeze per tonne of load, so the same beam lifts more. The price is length — the chart’s minimum top sling at 4 m goes from 2.8 m at 45° to 5.8 m at 20° — so the angle you can use is often set by the headroom.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Read the chart at the angle you actually rig.',
      body: 'A top sling shorter than the chart’s minimum opens the angle beyond the row you chose and overloads the beam in compression. Measure the sling legs before the lift, and if they are short, drop to the 45° column or change the slings.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why is the force in an angled sling greater than the load it carries?', answer: 'A sling pulls along its own length. At an angle, only part of that pull is upward; the rest is sideways. The sling must supply the full upward share plus the sideways part, so its tension is share ÷ cos(angle from vertical).' },
        { question: 'How do I work out the compression in the load?', answer: 'For a symmetric two-leg lift, compression = half the load × tan(angle from vertical). At 45° that is half the load; at 30°, about 29% of the load.' },
        { question: 'Is the compression doubled because both legs pull inward?', answer: 'No. The two inward pulls balance each other; the load is in compression equal to one of them.' },
        { question: 'How can I reduce the compression?', answer: 'Use longer slings so the legs hang steeper, or use a spreader beam so the bottom slings hang vertically and the beam takes the compression instead of the load.' },
        { question: 'Do four-leg slings squeeze the load too?', answer: 'Yes, in both directions — along the length and across the width — whenever the legs meet at one hook. A spreader frame keeps all four legs vertical.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For lifts that must not be squeezed',
      skus: ['IH-LR-BH-MSB-8', 'IH-LR-BH-MSB-13', 'IH-LR-BH-TSB', 'IH-LR-BH-MSF', 'IH-LR-SH-G209'],
    },
    { type: 'category_link', slug: 'spreader-beams', label: 'Spreader beams', blurb: 'Modular, telescopic and lattice spreader beams with span charts at 45°, 30° and 20°.' },
    {
      type: 'related_articles',
      slugs: ['sling-angle-chart', 'spreader-beam-vs-lifting-beam', 'spreader-beam-misuse', 'centre-of-gravity-in-lifting', 'eye-bolt-types-and-angled-loads'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Forces are exact geometry for a symmetric two-leg lift. Beam ratings are from the load chart on our live listing; the certificate for a specific beam governs.',
    },
    {
      type: 'cta_block',
      heading: 'Is your load strong enough to be squeezed?',
      body: 'Send the weight, the lifting-point spacing and the hook height. We will work out the leg loads and propose slings, shackles or a spreader beam to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
