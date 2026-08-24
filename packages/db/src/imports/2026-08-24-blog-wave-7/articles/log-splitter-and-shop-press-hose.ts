import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'log-splitter-and-shop-press-hose',
  title: 'Log splitters, presses and home-shop circuits: specifying hose for a small build',
  excerpt:
    'Small circuits are where the pressures are highest relative to the budget and where the specification is most often copied from whatever the last person used.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose for a log splitter or shop press',
  seoDescription:
    'Choosing hose for a small hydraulic build: why the pump relief setting is the number that matters, suction line sizing, and the mistakes that make a press lose pressure when warm.',
  focusKeyword: 'log splitter hydraulic hose',
  publishedAt: '2026-08-24T19:31:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Specify against the relief valve setting, not against the pressure the circuit normally sees.',
        'The suction line is the one most often undersized, and it is the cause of most small-build performance complaints.',
        'A press that loses force as it warms is usually leaking internally, not short of hose capacity.',
        'A log splitter that is weak at full extension is a cylinder or valve issue, not a hose one.',
        'Small does not mean low pressure. Many of these circuits run higher than the mobile equipment around them.',
      ],
    },
    {
      type: 'lead',
      html: 'Log splitters, shop presses, small tippers and workshop rams are built and rebuilt constantly, usually by capable people working from a parts pile rather than a drawing. The hydraulics are simple, which is exactly the problem — a simple circuit hides the fact that it may be running at a higher pressure than the excavator parked next to it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Specify against the relief setting.',
      anchor: 'relief-setting',
    },
    {
      type: 'paragraph',
      html: 'The working pressure of a circuit is not the number that sizes the hose. <strong>The relief valve setting is</strong>, because that is the highest pressure the circuit can reach — and on a log splitter it reaches it on every single cycle, at the moment the wedge stalls in a knot. A hose specified against normal running pressure is being asked to hold relief pressure thousands of times a season.',
    },
    {
      type: 'comparison_table',
      caption: 'What to establish before choosing anything',
      columns: ['Figure', 'How to get it', 'Why it matters'],
      rows: [
        {
          cells: [
            'Relief valve setting',
            'From the valve, or measured with a gauge',
            'Sets the hose grade',
          ],
          highlight: true,
        },
        {
          cells: [
            'Pump flow',
            'From the pump rating and drive speed',
            'Sets the bore of pressure and return lines',
          ],
          highlight: true,
        },
        {
          cells: [
            'Suction requirement',
            'From the pump manufacturer data',
            'Sets the suction hose bore and type',
          ],
        },
        {
          cells: [
            'Fluid and temperature',
            'What is in it, and how hot it gets in service',
            'Affects hose and seal material',
          ],
        },
        {
          cells: [
            'Cycles per hour',
            'Realistically, not optimistically',
            'Impulse duty is what ages a hose',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never use a pressure hose on the suction side.',
      body: 'A pressure hose is built to resist pressure from inside, not vacuum from outside. On a suction line it can collapse internally with no visible sign, starving the pump and causing cavitation that destroys it. Suction lines need hose rated for vacuum.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The two complaints we hear most.',
      anchor: 'complaints',
    },
    {
      type: 'decision_tree',
      heading: 'Diagnosing before re-plumbing',
      intro:
        'Both of these usually turn out not to be hose problems, which is worth knowing before buying hose.',
      branches: [
        {
          condition: 'Press or splitter loses force as the oil warms',
          outcome: 'Internal leakage past a seal or valve.',
          detail:
            'Warm oil is thinner and passes a worn clearance more easily. Hose capacity does not change with temperature in a way that produces this symptom.',
        },
        {
          condition: 'Weak only at full extension',
          outcome: 'Cylinder or valve, not the supply.',
          detail:
            'A supply restriction is weak everywhere. A fault that appears only at one end of travel points at the cylinder or its end-of-stroke behaviour.',
        },
        {
          condition: 'Slow everywhere, hot oil, noisy pump',
          outcome: 'Suction restriction — this one really is plumbing.',
          detail:
            'Check suction bore, hose type, filter condition and the height of the tank relative to the pump.',
        },
        {
          condition: 'Fast but stalls under load',
          outcome: 'Relief setting or pump condition.',
          detail:
            'Measure with a gauge before changing anything. Guessing at relief settings on a home-built circuit is how a hose gets over-pressured.',
        },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Building it so it lasts.', anchor: 'building' },
    {
      type: 'comparison_table',
      caption: 'The choices that matter on a small build',
      columns: ['Choice', 'Guidance'],
      rows: [
        {
          cells: [
            'Hose grade',
            'Chosen against relief pressure with the standard safety factor, not against normal running pressure',
          ],
          highlight: true,
        },
        {
          cells: [
            'Suction hose',
            'Rated for vacuum, generously sized, as short and straight as possible',
          ],
          highlight: true,
        },
        {
          cells: [
            'Fitting family',
            'JIC is a sensible default on a build assembled once. ORFS if it will be dismantled often',
          ],
        },
        {
          cells: [
            'Routing',
            'Bend radius respected, no twist, clear of the moving ram and the working area',
          ],
          highlight: true,
        },
        {
          cells: [
            'Guarding',
            'On a splitter especially — an operator stands within reach of the pressure lines',
          ],
          highlight: true,
        },
        {
          cells: [
            'Return line',
            'Sized for full pump flow; a restricted return builds back pressure and heat',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'The operator is close to these circuits.',
      body: 'On a log splitter or a shop press the hands and face of the operator are within a metre of hoses carrying full relief pressure. A pinhole leak at that distance is an injection injury, which is a surgical emergency. Route pressure lines away from the operating position and guard them where you cannot.',
    },
    {
      type: 'direct_answer',
      question: 'What hose should I use on a log splitter or shop press?',
      answer:
        'Specify the pressure lines against the relief valve setting rather than normal working pressure, because a splitter reaches relief on every cycle. Size the suction line generously and use hose rated for vacuum — a pressure hose can collapse internally on suction. Size the return line for full pump flow. Establish the relief setting with a gauge rather than assuming it, since many small circuits run higher than the mobile equipment around them.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'When it is worth having assemblies made.',
      anchor: 'made-assemblies',
    },
    {
      type: 'paragraph',
      html: 'Small builds are exactly where reusable screw-together fittings are most tempting and least appropriate. They exist and they work within their ratings, but <strong>the ratings are lower than a crimped assembly and the assembly quality depends entirely on the person who made it.</strong> On a circuit running at relief pressure with an operator standing over it, crimped assemblies made to a published specification are worth the trip.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'By the metre, or built to your measurements.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hose fittings by thread type',
      blurb: 'For a build assembled once and left alone.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How do I find the relief setting on a home-built circuit?',
          answer:
            'Fit a gauge on the pressure line and stall the cylinder against its stop or against the work. Reading it is the only reliable method — relief valves are frequently adjusted and rarely labelled.',
        },
        {
          question: 'Can I use the same hose for pressure and return?',
          answer:
            'Often yes for grade, provided the bore is sized for full pump flow on the return. What you cannot do is use either of them on the suction side.',
        },
        {
          question: 'My splitter is slow. Will bigger hose fix it?',
          answer:
            'Only if the restriction is in the hose, which is usually on the suction side. Slow-everywhere with a noisy pump points at suction; slow-under-load points at the pump or the relief.',
        },
        {
          question: 'Are screw-together reusable fittings acceptable?',
          answer:
            'Within their published rating and assembled correctly, they have a place. On a circuit running at relief pressure with an operator alongside, crimped assemblies are the better choice.',
        },
        {
          question: 'Does hose length affect performance?',
          answer:
            'Only marginally on short runs at these flows. Bore and suction condition dominate; a longer hose correctly sized will outperform a short one that is too narrow.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'General guidance for small circuits. Always specify against the actual relief setting of the circuit in front of you.',
    },
    {
      type: 'cta_block',
      heading: 'Tell us the relief setting and the pump flow.',
      body: 'With those two numbers and the fitting ends, we can specify the whole set. If you do not know them yet, that is the first thing to measure — and we will tell you how.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
