import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'where-jic-is-the-wrong-choice',
  title: 'Where JIC is the wrong choice',
  excerpt:
    'JIC is the default on most of this continent and it deserves to be. It is also the wrong answer in four specific situations, and every one of them is a situation where people keep specifying it anyway.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'JIC fitting disadvantages — when to use ORFS instead',
  seoDescription:
    'The four cases where a 37 degree JIC connection is the wrong specification: high vibration, frequent make and break, high impulse, and large bore. What to use instead and why.',
  focusKeyword: 'jic fitting disadvantages',
  publishedAt: '2026-08-24T18:43:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'JIC seals metal to metal on a 37 degree cone. Everything good and everything bad about it follows from that one fact.',
        'Under sustained vibration the metal seat has no resilience, so a joint that was perfect can begin weeping without anything having been done to it.',
        'Repeated make and break work-hardens and marks the cone. ORFS tolerates it far better because a soft seal is replaced each time.',
        'High impulse duty favours ORFS or flange. JIC is not the choice for a breaker or a press line.',
        'Above about one inch, split flange is usually the right answer rather than any threaded connection.',
      ],
    },
    {
      type: 'lead',
      html: 'This is not an argument against JIC. It is inexpensive, available everywhere, tolerant of imperfect assembly, easy to identify by eye and easy to seal without consumables — which is why it is the sensible default and why most of a machine should be built with it. The point is the four cases where defaulting to it costs you, and where the alternative is well established and not much more expensive.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a metal cone gives you, and what it costs.',
      anchor: 'metal-cone',
    },
    {
      type: 'comparison_table',
      caption: 'The trade in one table',
      columns: ['Property', 'JIC 37 degree', 'ORFS'],
      rows: [
        { cells: ['Seals on', 'Metal cone', 'Face O-ring'], highlight: true },
        { cells: ['Consumable required', 'None', 'An O-ring per assembly'] },
        {
          cells: [
            'Tolerance of imperfect assembly',
            'Good',
            'Good, provided the O-ring is present and correct',
          ],
        },
        {
          cells: [
            'Resilience under vibration',
            'Poor — no elastic element',
            'Good — the elastomer follows movement',
          ],
          highlight: true,
        },
        {
          cells: [
            'Repeated make and break',
            'Degrades the cone each time',
            'New O-ring restores the seal',
          ],
          highlight: true,
        },
        {
          cells: [
            'Sensitivity to over-tightening',
            'High — the cone flattens permanently',
            'Moderate — the O-ring extrudes, the seat survives',
          ],
        },
        { cells: ['Cost per connection', 'Lower', 'Higher'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The four cases.', anchor: 'four-cases' },
    {
      type: 'decision_tree',
      heading: 'Where to specify something else',
      intro: 'If a circuit matches one of these, the default is worth overriding.',
      branches: [
        {
          condition: 'Sustained vibration — engine-mounted, screening plant, compactors',
          outcome: 'ORFS.',
          detail:
            'A metal cone has no elastic recovery. Micro-movement at the seat unloads it a fraction at a time until it weeps, and no amount of re-tightening fixes it permanently because each re-tighten marks the cone further.',
        },
        {
          condition: 'The joint is broken and remade regularly',
          outcome: 'ORFS, or a quick coupler if it is genuinely routine.',
          detail:
            'Every make-up marks the cone slightly. A test point or a component that comes off for service monthly is on borrowed time with JIC.',
        },
        {
          condition: 'High impulse — breakers, presses, hammers, fast-cycling circuits',
          outcome: 'ORFS or split flange, depending on bore.',
          detail:
            'Impulse loading is what pulls a metal-to-metal seat apart momentarily. This is the case where a failure is most likely to be sudden rather than a weep.',
        },
        {
          condition: 'Bore above roughly one inch',
          outcome: 'SAE split flange.',
          detail:
            'The nut size becomes impractical to torque correctly and the thread carries the whole load. Flanges spread it across four bolts and are easier to make up in a confined space.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Where JIC remains the right answer.',
      body: 'Static or lightly-loaded circuits, anything assembled once and left alone, field repairs where an O-ring of the correct size may not be available, and anywhere a fitter without a parts kit has to get a machine running. Robustness against missing consumables is a real engineering property, and JIC has it.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The practical objections to switching.',
      anchor: 'objections',
    },
    {
      type: 'comparison_table',
      caption: 'What people actually say, and whether it holds',
      columns: ['Objection', 'Assessment'],
      rows: [
        {
          cells: [
            '"ORFS needs an O-ring we will not have"',
            'Fair on a remote site. Answered by stocking the sizes you use, not by accepting the wrong connection',
          ],
        },
        {
          cells: [
            '"The whole machine is JIC already"',
            'Fair. Change the circuit that keeps failing, not the machine',
          ],
          highlight: true,
        },
        {
          cells: [
            '"ORFS costs more"',
            'True per connection, and irrelevant next to one unplanned failure on the circuit that keeps weeping',
          ],
        },
        {
          cells: [
            '"We can just tighten it more"',
            'This is the belief that destroys the cone and makes the leak permanent',
          ],
          highlight: true,
        },
        {
          cells: [
            '"It has always been JIC there"',
            'Worth checking whether it has always leaked there too',
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What are the disadvantages of JIC fittings?',
      answer:
        'A JIC connection seals metal to metal on a 37 degree cone, so it has no elastic element. That makes it vulnerable in four situations: sustained vibration, where micro-movement gradually unloads the seat; repeated make and break, which marks the cone a little each time; high impulse duty, which can momentarily part a metal seat; and large bores, where the nut becomes impractical to torque. ORFS or SAE split flange is the better specification in those cases.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not mix 37 and 45 degree parts while changing anything.',
      body: 'Several sizes share a thread between JIC 37 degree and SAE 45 degree flare. The nut threads on, feels correct, and seals on a single line of contact that leaks forever. If a circuit is being converted, confirm the seat angle on every part rather than trusting the thread.',
    },
    {
      type: 'standard_citation',
      standard: 'SAE J514',
      publisher: 'SAE International',
      title: 'Hydraulic Tube Fittings',
      summary:
        'Defines the 37 degree flare connection and the related fitting families, including the dimensions that make certain 37 and 45 degree parts thread together. Read the seat angle from the standard rather than inferring it from a thread size.',
    },
    {
      type: 'category_link',
      slug: 'orfs-hose-fittings',
      label: 'ORFS hose fittings',
      blurb: 'The alternative where vibration or impulse rules JIC out.',
    },
    {
      type: 'category_link',
      slug: 'jic-37-hose-fittings',
      label: 'JIC 37 degree hose fittings',
      blurb: 'Still the right default for most of a machine.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-sae-flanges',
      label: 'Hydraulic SAE flanges',
      blurb: 'Where bore makes a threaded connection impractical.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is ORFS simply better than JIC?',
          answer:
            'No. It is better under vibration, impulse and repeated assembly, and worse when the consumable O-ring is unavailable or when cost per connection matters across a whole machine. They are different tools.',
        },
        {
          question: 'Can I convert one JIC port to ORFS?',
          answer:
            'Yes, with an adapter, though every adapter adds a joint and a leak path. On a circuit that keeps failing it is usually worth doing the whole run properly rather than adapting one end.',
        },
        {
          question: 'My JIC joint weeps only when the machine is working. Why?',
          answer:
            'Vibration and thermal cycling unloading a metal seat that has already been marked. Inspect the cone; if it has a witness ring off centre or a radial scratch, replace both halves rather than re-tightening.',
        },
        {
          question: 'What about BSPP with a bonded seal instead?',
          answer:
            'A reasonable option in the same situations, and common on European machines. It shares the advantage of a soft seal, with the same consumable caveat.',
        },
        {
          question: 'At what bore should I move to flanges?',
          answer:
            'Around one inch is where it usually starts to make sense, but pressure and access matter as much as bore. If a nut is hard to reach with a torque wrench, that is the real signal.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'A position piece. The trade-offs are physical; the thresholds are our practice.',
    },
    {
      type: 'cta_block',
      heading: 'Which circuit keeps failing?',
      body: 'Tell us the machine and the position, and we will say whether the connection type is the reason. Sometimes it is routing, and changing the fitting family would have wasted your money.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
