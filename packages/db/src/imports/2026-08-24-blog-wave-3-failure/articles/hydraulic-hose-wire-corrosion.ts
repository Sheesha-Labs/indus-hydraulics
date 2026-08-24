import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-wire-corrosion',
  title: 'Wire corrosion under an intact cover: how the water got in',
  excerpt:
    'A hose can look perfect and have rusted reinforcement. The cover is not waterproof once anything has broken its surface, and in a coastal climate the wire goes long before the rubber shows anything.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose wire corrosion — causes, evidence and prevention',
  seoDescription:
    'Why the steel reinforcement in a hydraulic hose corrodes under an undamaged cover, how water tracks along the wire from a single cut, and what actually prevents it.',
  focusKeyword: 'hydraulic hose wire corrosion',
  publishedAt: '2026-08-25T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The cover keeps water off the wire. It does not keep water away from the wire once there is a way in.',
        'One nick, pinhole or abrasion scar is enough — water tracks along the wire under an otherwise perfect cover, often a long way from where it entered.',
        'This is the failure mode that gives no warning. A corroded hose looks healthy right up until it bursts.',
        'Coastal humidity and salt make it substantially faster, which matters in Jebel Ali, Mussafah and anywhere with a sea breeze.',
        'SAE 100R5 is the exception worth knowing: its textile cover leaves the wire braid visible, so corrosion on it can actually be inspected.',
      ],
    },
    {
      type: 'lead',
      html: 'Almost every hydraulic hose failure gives some warning if you know what to look for. This one does not. The reinforcement rusts away underneath a cover that stays smooth, unmarked and entirely convincing, and the first symptom is the burst.',
    },

    { type: 'section_head', number: '/01', title: 'What the cover is actually for.', anchor: 'what-the-cover-does' },
    {
      type: 'paragraph',
      html: 'The cover on a wire-reinforced hose is a protective layer, not a sealed one. Its job is to keep abrasion, weather and sunlight off the reinforcement. <strong>It does that well while it is intact and it does almost nothing once it is not</strong> — because the space between the wires is a continuous path, and water that gets in at one point can travel along it.',
    },
    {
      type: 'paragraph',
      html: 'That is why the corrosion is so often nowhere near the damage. A cut at a clamp can rust wire half a metre away, and by the time anybody investigates, the cut has been dismissed as cosmetic.',
    },
    {
      type: 'direct_answer',
      question: 'Can a hydraulic hose be corroded inside if the cover looks fine?',
      answer:
        'Yes, and it is one of the more common causes of a burst with no warning. Water entering through a single cut, pinhole or abrasion scar tracks along the wire underneath an otherwise intact cover. The corrosion can be a long way from the entry point, and none of it is visible from outside.',
    },

    { type: 'section_head', number: '/02', title: 'How the water gets in.', anchor: 'how-in' },
    {
      type: 'comparison_table',
      caption: 'Entry points, in rough order of how often they are the cause',
      columns: ['Entry point', 'Where to look'],
      rows: [
        { cells: ['Abrasion scar worn through the cover', 'Against clamps, frames, other hoses — anywhere the hose touches something'], highlight: true },
        { cells: ['Cut from installation or handling', 'Near the ends, and wherever the hose was pulled through a frame'] },
        { cells: ['Pinhole from a fluid leak elsewhere', 'Downstream of any spray or drip'] },
        { cells: ['Cover damage at the ferrule edge', 'Right where the cover meets the fitting'] },
        { cells: ['Pressure washing directly at the cover', 'Anywhere on a machine that gets washed down'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Pressure washing is an entry point, not a cleaning method.',
      body: 'A lance held close to a hose can drive water through the cover at a point that shows nothing afterwards, and it can strip the cover outright at an existing scar. Wash at a distance and away from hose ends. On plant that is washed down daily this is one of the larger contributors to hose life in practice, and it is entirely under your control.',
    },

    { type: 'section_head', number: '/03', title: 'Why it is worse here.', anchor: 'why-worse-here' },
    {
      type: 'paragraph',
      html: 'Corrosion needs moisture and oxygen, and salt accelerates it. A machine working within a few kilometres of the coast is in humid, salt-carrying air more or less permanently, and the daily temperature swing means condensation forms on and inside equipment overnight. <strong>The same hose in the same duty has a materially shorter reinforcement life at Jebel Ali than it does inland.</strong>',
    },
    {
      type: 'paragraph',
      html: 'That does not mean a different hose is needed everywhere near the coast. It means cover damage matters more there, and an abrasion scar that would be a two-year problem inland is a much shorter one on the water.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The one construction where you can actually see it.',
      body: 'SAE 100R5 is built with a textile braid cover that deliberately leaves the wire braid visible underneath. It is the only common construction where corrosion of the reinforcement can be inspected rather than inferred. Where you have R5 in service, look at it — that visibility is part of what the grade is for.',
    },

    { type: 'section_head', number: '/04', title: 'What actually prevents it.', anchor: 'prevention' },
    {
      type: 'decision_tree',
      heading: 'In order of how much difference each makes',
      intro: 'None of these is exotic. The first two account for most of the available improvement.',
      branches: [
        { condition: 'The hose touches anything', outcome: 'Fix the rub point, or sleeve the hose where it rubs.', detail: 'Almost every entry path starts as abrasion. Removing the abrasion removes the entry path.' },
        { condition: 'The cover is cut or scarred anywhere', outcome: 'Treat it as a replacement item, not a cosmetic one.', detail: 'A cut cover on a wire hose is the start of a corrosion path, even when the hose is otherwise perfect.' },
        { condition: 'The machine is washed down regularly', outcome: 'Change how, not whether — distance and angle.', detail: 'Direct lance pressure at hose ends is the version that does damage.' },
        { condition: 'Working coastal or offshore', outcome: 'Shorten the inspection interval rather than changing the hose.', detail: 'The mechanism is the same everywhere; the clock runs faster near salt water.' },
      ],
    },
    { type: 'product_embed', heading: 'Sleeving and the one inspectable grade', skus: ['IH-HOSE-R5'] },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'Stop the abrasion that starts the corrosion.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I paint or coat a hose to stop corrosion?', answer: 'No. Coatings crack as the hose flexes and can attack the cover compound. The cover is already the protective layer — the answer is to stop damaging it, not to add another one on top.' },
        { question: 'How do I check for corrosion without cutting the hose?', answer: 'On most constructions you cannot, which is the problem. What you can do is inspect the cover for any breach and treat every one as significant, and replace on age where the environment is aggressive rather than waiting for evidence that never appears.' },
        { question: 'Is stainless reinforcement available?', answer: 'For hydraulic hose the reinforcement is carbon steel in essentially all common constructions. Where corrosion resistance is the governing requirement the answer is usually a metallic or PTFE hose with stainless braid, not a variant of a rubber hose.' },
        { question: 'Does a rusted hose burst suddenly or leak first?', answer: 'Suddenly is the common case, which is why this mode matters. The reinforcement carries the pressure; when enough of it has gone, the failure is not gradual.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own workshop practice. Cover materials are from the product specifications for the grades we stock.',
    },
    { type: 'cta_block', heading: 'Hoses bursting with no warning?', body: 'Corrosion under an intact cover is the usual explanation, and it is preventable. We can review a machine’s routing and tell you where the entry points are.', quoteLabel: 'Ask for a routing review' },
  ],
}

export default ARTICLE
