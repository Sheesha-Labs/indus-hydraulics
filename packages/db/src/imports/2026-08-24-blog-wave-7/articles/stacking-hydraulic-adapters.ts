import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'stacking-hydraulic-adapters',
  title: 'Adapter stacking: when it is fine, and when it is the leak',
  excerpt:
    'Everyone stacks adapters. Nobody writes down where it stops being acceptable, so here it is — three rules, and the one arrangement that is always wrong.',
  categorySlug: 'fitting-identification',
  authorSlug: 'mehul-rana',
  seoTitle: 'Stacking hydraulic adapters — when it causes leaks',
  seoDescription:
    'Why stacked hydraulic adapters leak: added joints, leverage on the port, flow restriction and clearance. When a stack is acceptable and when to specify a hose with the right ends instead.',
  focusKeyword: 'stacking hydraulic adapters',
  publishedAt: '2026-08-24T18:59:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Every adapter in a stack is another joint, and every joint is a place that can leak.',
        'The real damage is leverage. A long stack turns hose movement into a bending load on the port thread.',
        'One adapter to change thread family is normal engineering. Three to reach a hose that is the wrong length is a repair waiting to fail.',
        'Stacked reducers restrict flow and can cause heating and cavitation on suction and return lines.',
        'The permanent fix is almost always a hose built with the correct ends, not a better stack.',
      ],
    },
    {
      type: 'lead',
      html: 'A stack of adapters is the most honest thing on a machine: it records exactly what was on the shelf the day something failed. Some of it is fine and stays fine for years. The rest is a slow leak and, occasionally, a cracked port — and the difference between the two is not really about how many adapters there are.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a stack actually costs.',
      anchor: 'what-it-costs',
    },
    {
      type: 'comparison_table',
      caption: 'Four separate problems, only one of which is obvious',
      columns: ['Effect', 'Why it matters'],
      rows: [
        {
          cells: [
            'More joints',
            'Each is an independent chance of a leak, and they are hard to isolate once oil is tracking',
          ],
          highlight: true,
        },
        {
          cells: [
            'Leverage on the port',
            'Hose movement is amplified into a bending moment at the port thread',
          ],
          highlight: true,
        },
        {
          cells: [
            'Flow restriction',
            'Stacked reducers narrow the path; on suction lines this causes cavitation',
          ],
        },
        {
          cells: [
            'Clearance and access',
            'The stack lengthens the run and can foul structure or reduce bend radius at the hose end',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The number of adapters is not the rule.',
      body: 'A single long adapter can apply more leverage than two short ones. What matters is the total distance from the port face to the hose end, whether the hose can move, and whether every joint in the stack is a type that seals reliably. Counting parts is a proxy for those, not a substitute.',
    },

    { type: 'section_head', number: '/02', title: 'When it is fine.', anchor: 'when-fine' },
    {
      type: 'decision_tree',
      heading: 'A stack that will not cause you trouble',
      intro: 'All four of these together. Miss one and it is worth reconsidering.',
      branches: [
        {
          condition: 'One adapter, doing one job',
          outcome: 'Converting a port thread family, or changing direction once.',
          detail:
            'This is normal design, not a compromise. Machines ship like this from the factory.',
        },
        {
          condition: 'Short, and close to the port face',
          outcome: 'Minimal leverage on the port thread.',
          detail: 'The load a hose applies grows with the distance it acts through.',
        },
        {
          condition: 'No reduction in bore',
          outcome: 'Same size through, or larger.',
          detail:
            'A reduction inside a stack is invisible from the outside and shows up as heat or a slow circuit.',
        },
        {
          condition: 'The hose is properly supported and correctly long',
          outcome: 'Nothing is pulling on the stack.',
          detail:
            'If the hose is short and under tension, the stack is carrying that tension into the port.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'When it is the leak.',
      anchor: 'when-its-the-leak',
    },
    {
      type: 'comparison_table',
      caption: 'Arrangements worth replacing rather than re-sealing',
      columns: ['Arrangement', 'What happens'],
      rows: [
        {
          cells: [
            'Two or more elbows stacked to reach a position',
            'Long lever arm, and every cycle works the port thread',
          ],
          highlight: true,
        },
        {
          cells: [
            'A stack compensating for a hose that is too short',
            'The stack is in permanent tension. It will loosen or crack',
          ],
          highlight: true,
        },
        {
          cells: [
            'Reducer, then expander, back to the original size',
            'Pure restriction for no reason — usually a shelf artefact',
          ],
        },
        {
          cells: [
            'A tapered thread buried in the middle of the stack',
            'The one joint that cannot be re-made without disturbing everything',
          ],
        },
        {
          cells: [
            'A stack on a vibrating component',
            'Fatigue at the port, and the crack appears in the casting, not the adapter',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The failure lands on the expensive part.',
      body: 'When a stack finally does damage, it is not usually the adapters that break. It is the port they are threaded into — a valve block, a pump housing, a cylinder end cap. The adapters are the cheapest components in the assembly and they are the last to fail.',
    },
    {
      type: 'direct_answer',
      question: 'Is it bad to stack hydraulic adapters?',
      answer:
        'One adapter changing a thread family or direction is normal. Problems come from length and load rather than count: a long stack turns hose movement into a bending load on the port thread, each extra joint is another potential leak, and stacked reducers restrict flow. A stack that exists because the hose is the wrong length or ends should be replaced by a hose built with the correct ends.',
    },

    { type: 'section_head', number: '/04', title: 'What to do instead.', anchor: 'instead' },
    {
      type: 'comparison_table',
      caption: 'Options, cheapest first',
      columns: ['Option', 'When it is the right call'],
      rows: [
        {
          cells: [
            'A hose built with the correct ends',
            'Almost always. Removes the stack and the leverage in one step',
          ],
          highlight: true,
        },
        {
          cells: [
            'A single adapter of the right form',
            'When the port genuinely is a different family from the hose end',
          ],
        },
        {
          cells: [
            'A 45 or 90 degree hose end fitting',
            'When the stack exists purely to change direction',
          ],
          highlight: true,
        },
        {
          cells: [
            'A longer hose with a proper routing path',
            'When the stack is compensating for tension',
          ],
        },
        {
          cells: [
            'Keep the stack',
            'Short, single reduction-free, supported, and it has never leaked',
          ],
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'The right single adapter, rather than three of the wrong ones.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Built with the ends the machine actually needs.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How many adapters is too many?',
          answer:
            'There is no fixed number. Two short adapters close to the port on a static circuit can be fine; one long elbow on a vibrating pump housing may not be. Judge by total length from the port face, load on the port, and whether bore is reduced anywhere.',
        },
        {
          question: 'Does each adapter reduce pressure rating?',
          answer:
            'Each part has its own rating and the assembly is limited by the lowest. The more common practical issue is that a long stack applies bending loads the parts were not rated for at all.',
        },
        {
          question: 'Is thread sealant a fix for a leaking stack?',
          answer:
            'Only on the tapered joints in it, and only if those are the ones leaking. On JIC, ORFS and BSPP joints sealant makes it worse. A stack that leaks under load is usually leaking because of movement, not sealing.',
        },
        {
          question: 'Why do reducers in a stack cause heating?',
          answer:
            'A narrower path at the same flow means higher velocity and more pressure drop, and that energy appears as heat. On a suction line it can drop the pressure enough to cause cavitation, which damages the pump.',
        },
        {
          question: 'The machine came from the factory with a stack. Is that different?',
          answer:
            'Usually yes — a designed arrangement accounts for the loads and the bore. What is worth checking is whether it has been added to since.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Assessment criteria are our own practice rather than a published rule.',
    },
    {
      type: 'cta_block',
      heading: 'Photograph the stack before you rebuild it.',
      body: 'Send a photograph of the port and the stack with a rule alongside. Most of the time we can specify one hose with the right ends that removes the whole arrangement.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
