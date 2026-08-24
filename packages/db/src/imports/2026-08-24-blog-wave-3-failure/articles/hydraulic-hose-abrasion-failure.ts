import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-abrasion-failure',
  title: 'Abrasion failure: finding the rub point before it finds you',
  excerpt:
    'The most preventable hose failure there is. A hose worn flat on one side has been telling you where it touches something for months — and the wear pattern points straight at the cause.',
  categorySlug: 'failure-analysis',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose abrasion — rub points, wear patterns and protection',
  seoDescription:
    'How to read an abrasion wear pattern on a hydraulic hose, find the rub point that caused it, and choose between re-routing, clamping and sleeving.',
  focusKeyword: 'hydraulic hose abrasion protection',
  publishedAt: '2026-08-25T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Wear on one side only means the hose is touching something. Wear all round means it is moving inside a clamp or against another hose.',
        'The worn patch is a map: its shape and position tell you what it was rubbing on and whether the contact is constant or only at certain machine positions.',
        'Sleeving protects the hose but does not stop the rubbing. It buys time and it hides the evidence.',
        'Re-routing is the only fix that removes the cause. Everything else manages the symptom.',
        'On a wire hose, an abrasion scar is also a corrosion entry point, so it matters long after the cover has stopped looking serious.',
      ],
    },
    {
      type: 'lead',
      html: 'Of all the ways a hydraulic hose fails, this is the one that was visible for longest and ignored for longest. A hose does not wear through quickly. It wears through over months, in plain sight, while everyone walks past it.',
    },

    { type: 'section_head', number: '/01', title: 'Reading the wear pattern.', anchor: 'wear-pattern' },
    {
      type: 'comparison_table',
      caption: 'What the shape of the worn area tells you',
      columns: ['Pattern', 'What it means'],
      rows: [
        { cells: ['Flat patch on one side, sharp edges', 'Constant contact with a fixed edge — a bracket, frame or plate'], highlight: true },
        { cells: ['Long shallow scuff along the hose', 'The hose slides against something as the machine moves'] },
        { cells: ['Worn all the way round at one point', 'Movement inside a clamp, or the clamp is too loose'] },
        { cells: ['Two hoses worn where they cross', 'Hose-on-hose abrasion — both will fail, usually not together'] },
        { cells: ['Wear only visible at full extension', 'Contact happens at one machine position only, which is why nobody saw it'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Photograph the hose in place before removing it.',
      body: 'Once the assembly is off the machine, the relationship between the worn patch and whatever it was rubbing on is gone, and with it most of the diagnosis. One photograph of the hose sitting in its routing is worth more than the failed hose itself.',
    },

    { type: 'section_head', number: '/02', title: 'Contact you will not see standing still.', anchor: 'moving-contact' },
    {
      type: 'paragraph',
      html: 'A machine at rest shows you one geometry. The hose failed in a different one. <strong>Boom, tilt and attachment circuits contact things only through part of their travel</strong>, and inspecting a parked machine tells you nothing about the position where the rubbing actually happens.',
    },
    {
      type: 'paragraph',
      html: 'Where a hose has worn and nothing obvious is touching it, cycle the machine slowly through full travel and watch. The contact is usually obvious the moment you see it — and usually at an extreme of movement that nobody thought to check.',
    },
    {
      type: 'direct_answer',
      question: 'What causes hydraulic hose abrasion?',
      answer:
        'The hose touching something — a frame, a bracket, another hose, or the inside of its own clamp. Wear on one side means constant contact with a fixed object; wear all round usually means the hose is moving inside a loose clamp. Contact often occurs only at one point in the machine’s travel, which is why it is missed on a parked inspection.',
    },

    { type: 'section_head', number: '/03', title: 'Re-route, clamp or sleeve.', anchor: 'the-three-fixes' },
    {
      type: 'comparison_table',
      caption: 'What each fix actually does',
      columns: ['Fix', 'Removes the cause?', 'Use when'],
      rows: [
        { cells: ['Re-route', 'Yes', 'There is room to move the hose away from what it touches'], highlight: true },
        { cells: ['Clamp', 'Yes, if it stops the movement', 'The hose needs to be held in a position it will not stay in on its own'] },
        { cells: ['Sleeve or spiral guard', 'No — protects the hose, rubbing continues', 'Contact is unavoidable, or as an interim while a re-route is arranged'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Sleeving hides the evidence as well as protecting the hose.',
      body: 'A sleeved hose still rubs; you just cannot see how badly any more. That is an acceptable trade where contact genuinely cannot be designed out, but it means the assembly now has to come off the inspection list by age rather than by appearance. Sleeving a hose and then inspecting it visually is worse than doing neither, because it looks like a control and is not one.',
    },
    {
      type: 'paragraph',
      html: 'Clamping deserves more credit than it usually gets. A hose held properly at sensible intervals does not swing into things, and most hose-on-hose abrasion is really a clamping problem wearing an abrasion mask. <strong>The clamp has to hold the hose without gripping it so tightly that the hose cannot move through it at all</strong> — a hose that must slide, and is clamped so it cannot, fails at the clamp instead.',
    },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'Sized on hose outside diameter, not on dash size.' },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Covers rated for abrasion where the duty demands it.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much cover wear is too much?', answer: 'Once any reinforcement is visible, the hose is finished — the wire is exposed to water and the protective layer has gone. Before that point it is a judgement about rate: a hose halfway through its cover in six months has a fix worth making, not a replacement worth scheduling.' },
        { question: 'What size sleeve do I need?', answer: 'Sized on the hose outside diameter, which varies by construction at the same dash size — at −08 the grades we stock range from 17.2 mm to 23.0 mm outside. Give us the grade as well as the size.' },
        { question: 'Is an abrasion-resistant cover worth specifying?', answer: 'Where contact is genuinely unavoidable, yes, and several of the constructions we stock carry one. It extends the time before the cover is breached; it does not change the fact that something is rubbing.' },
        { question: 'Two hoses are rubbing on each other. Which one do I move?', answer: 'Whichever has room. If neither does, separate them with a clamp rather than sleeving both — a clamp fixes the geometry and sleeving only slows the wear on two hoses instead of one.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own workshop practice. Outside diameter figures are from the Intertraco (Italia) S.p.A. catalogue for the constructions we stock.',
    },
    { type: 'cta_block', heading: 'Same hose wearing through repeatedly?', body: 'Send a photograph of the hose in its routing, not just the failed hose. The rub point is usually obvious from the picture, and the fix is usually a bracket rather than a better hose.', quoteLabel: 'Ask for a routing review' },
  ],
}

export default ARTICLE
