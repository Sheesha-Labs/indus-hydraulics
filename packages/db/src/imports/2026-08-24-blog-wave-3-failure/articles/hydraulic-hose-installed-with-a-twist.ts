import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-installed-with-a-twist',
  title: 'Installed with a twist: the fault that shortens a hose from day one',
  excerpt:
    'A hose fitted with a twist in it has been failing since the moment it was tightened. The layline shows you immediately, it takes seconds to check, and almost nobody does.',
  categorySlug: 'failure-analysis',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose twist on installation — why it fails early',
  seoDescription:
    'Why a twisted hydraulic hose fails early, how the printed layline makes the twist visible in seconds, and how to tighten a fitting without putting one in.',
  focusKeyword: 'hydraulic hose twist installation',
  publishedAt: '2026-08-24T13:42:11.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pressure tries to untwist a twisted hose. That force works against the reinforcement continuously, for the whole life of the assembly.',
        'The layline is a straight printed line down the hose. If it spirals, the hose is twisted — that is the entire inspection.',
        'The twist is almost always put in during tightening, by turning the hose instead of turning the nut.',
        'A twisted hose also sits shorter than it should, so it is under tension as well as torsion.',
        'This one is free to fix and free to prevent, which is what makes it worth checking on every assembly you fit.',
      ],
    },
    {
      type: 'lead',
      html: 'There is a fault that costs nothing to find, nothing to fix, and takes a hose down to a fraction of the life it was built for. It is installed by a competent person with a spanner, in about four seconds, and it is visible from two metres away if anybody looks.',
    },

    { type: 'section_head', number: '/01', title: 'What the twist does.', anchor: 'what-it-does' },
    {
      type: 'paragraph',
      html: 'A hydraulic hose carries pressure through layers of wire wound in opposing directions. Those layers are balanced: under pressure the hose tries to grow in length and diameter, and the opposing windings hold it. <strong>Twist the hose and that balance is gone.</strong> One direction of winding tightens and the other slackens, so the load is no longer shared evenly between them.',
    },
    {
      type: 'paragraph',
      html: 'Then every pressure cycle works on the imbalance. The hose is permanently trying to unwind itself, pulling against the fittings at both ends. It is not a dramatic effect on any single cycle — it is a small unfair share of load, applied a few million times.',
    },
    {
      type: 'direct_answer',
      question: 'How much does a twist shorten hydraulic hose life?',
      answer:
        'Enough that it is the first thing to check on any assembly failing well before its expected life. A twisted hose loads its reinforcement layers unequally and is under constant torsion from the pressure trying to untwist it. The precise reduction depends on construction, pressure and cycle rate — but a hose failing early with a spiralled layline has told you why.',
    },

    { type: 'section_head', number: '/02', title: 'The layline makes it visible.', anchor: 'the-layline' },
    {
      type: 'paragraph',
      html: 'The printed line running along the cover is straight when the hose leaves the factory. It is straight because that is useful: <strong>it is a built-in twist indicator on every hose ever made.</strong> If it spirals around the assembly, the hose is twisted, and the number of turns tells you by how much.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Check it before you tighten the second end.',
      body: 'The twist goes in when the second fitting is tightened, so that is when to look. Watch the layline as you turn — if it starts to wind, the hose is turning with the nut and something needs holding.',
    },

    { type: 'section_head', number: '/03', title: 'How it gets there.', anchor: 'how-it-happens' },
    {
      type: 'comparison_table',
      caption: 'The three ways a twist gets installed',
      columns: ['Cause', 'What to do instead'],
      rows: [
        { cells: ['Turning the hose while tightening the nut', 'Hold the hose or the fitting hex with a second spanner'], highlight: true },
        { cells: ['Fitting a hose that is too short, and forcing it round', 'Get the length right — a short hose is under tension as well'] },
        { cells: ['Both ends fixed, hose routed round an obstruction afterwards', 'Route first, then connect. Order matters.'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Two spanners, not one.',
      body: 'Almost every installed twist comes from tightening with a single spanner and letting the hose take the reaction. Holding the fitting hex while the nut turns is the whole technique, and it is the difference between an assembly that lasts and one that does not.',
    },

    { type: 'section_head', number: '/04', title: 'A twisted hose is also a short hose.', anchor: 'also-short' },
    {
      type: 'paragraph',
      html: 'Twisting a hose pulls its ends together. An assembly cut to the right length and then twisted into place ends up under tension as well as torsion, which puts load into both fittings and removes the slack the routing needed. <strong>Two faults from one installation error</strong>, and the tension is the one that shows up as a failure at the ferrule.',
    },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Swivel ends exist precisely so the hose does not have to turn.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I get a twist out of a hose already fitted?', answer: 'Loosen one end, let the hose find its own position, and re-tighten while holding the fitting. If it will not sit straight without the twist, the assembly is the wrong length or the routing is wrong — the twist was doing work.' },
        { question: 'Does a swivel fitting prevent this?', answer: 'It is designed to. A female swivel end lets the nut turn without the hose turning, which is exactly the mechanism that puts twists in. It only helps if the hose is still held while tightening.' },
        { question: 'The layline spirals slightly. Is that acceptable?', answer: 'A slight spiral is worth removing when it costs nothing to remove — loosen, straighten, re-tighten. It is not a reason to condemn a working assembly, but it is a reason to look again at whether the length and routing are right.' },
        { question: 'Can a hose twist itself in service?', answer: 'On a circuit where one end moves relative to the other, yes — which is why hoses on moving circuits need routing that lets the movement happen as bending rather than as twisting.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Installation guidance from our own workshop practice. No percentage life-reduction figure is quoted here because the ones in circulation are widely repeated without attribution.',
    },
    { type: 'cta_block', heading: 'Assemblies failing early?', body: 'Check the laylines first. If they spiral, the installation is the fault and no replacement hose will fix it. We can walk a maintenance team through it on site.', quoteLabel: 'Ask about on-site training' },
  ],
}

export default ARTICLE
