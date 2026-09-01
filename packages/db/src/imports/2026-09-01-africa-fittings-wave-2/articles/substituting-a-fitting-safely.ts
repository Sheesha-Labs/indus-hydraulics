import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The safety article of the wave. Substitution happens whether or not anyone
 * approves of it, so the useful position is a rule for doing it responsibly and
 * a clear line for when the answer is no.
 *
 * Publishes no substitution table — the same reason we publish no interchange
 * table for hose or fittings. The rule is the deliverable.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'substituting-a-fitting-safely',
  title: 'Substituting a fitting safely: the four things that must match',
  excerpt:
    'Substitution happens at two in the morning with a machine down. Here is the rule that makes it defensible, and the one case where the answer has to be no.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Substituting a hydraulic fitting safely',
  seoDescription:
    'What must match before substituting a hydraulic fitting — thread and seat, pressure rating, material and bore — and when a substitution should be refused.',
  focusKeyword: 'substituting a fitting safely',
  publishedAt: '2026-09-01T15:15:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'When is it safe to substitute a hydraulic fitting?',
      answer:
        'When four things match: the thread and seat at each end, the pressure rating against the line, the material against the fluid and environment, and the bore against the flow. Get all four and the substitution is an engineering equivalent, not a compromise. Miss the rating and you have a part that fits, works, and fails later under load — which is the one failure mode in this article that hurts somebody.',
    },
    {
      type: 'lead',
      html: 'Nobody substitutes a fitting in an office. It happens on a night shift with a machine blocking a road, using what is in the store, and the decision gets made by whoever is holding the spanner. Telling people not to do it achieves nothing. Giving them a rule they can apply in four minutes is worth a great deal.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The four.',
      anchor: 'the-four',
    },
    {
      type: 'comparison_table',
      caption: 'What has to match, and what happens when it does not',
      columns: ['Property', 'If it does not match'],
      rows: [
        { cells: ['Thread and seat, both ends', 'It will not seal — obvious, immediate, harmless'] },
        { cells: ['Pressure rating against the line', 'It seals, works, and fails later'], highlight: true },
        { cells: ['Material against fluid and environment', 'Corrosion or attack, over weeks'] },
        { cells: ['Bore against flow', 'Restriction, heat and pressure drop'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Note the asymmetry in the second column. <strong>Three of the four announce themselves; one does not.</strong> A thread mismatch is discovered in the first minute and a corrosion mismatch over a season, but a rating mismatch behaves perfectly until the day the circuit sees its design pressure. That is why rating is the check to make first, even though it is the one you cannot see.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What counts as knowing the rating.',
      anchor: 'knowing-rating',
    },
    {
      type: 'paragraph',
      html: 'The rating of the part, from its supplier, in that size — not the rating of the family, not the rating printed on a similar-looking part, and not an inference from the wall thickness. Where the rating is genuinely unknown, treat the part as unrated: acceptable on a return or case-drain line at low pressure, not acceptable on a pump or service line.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never substitute upward in pressure on an unknown part.',
      body: 'Fitting an unrated or lower-rated part into a high-pressure line is the one substitution in this article with a person on the other end of it. If the choice is between an unknown part in a pump line and a machine standing until morning, the machine stands.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The temporary fix, done properly.',
      anchor: 'temporary',
    },
    {
      type: 'paragraph',
      html: 'Temporary fixes are legitimate. What makes them dangerous is that nobody records them, so a bridge intended to last one shift is still there two years later, invisible among a hundred correct joints. Three habits fix that entirely: <strong>write it on the job card, mark the joint, and put the correct part on the next order.</strong> A tag or a paint mark on the hex takes ten seconds and makes the joint findable.',
    },
    {
      type: 'decision_tree',
      heading: 'Substituting on a night shift',
      branches: [
        {
          condition: 'All four match and you can show it',
          outcome: 'Fit it, and record the substitution anyway',
          detail: 'It is an equivalent, but the next person still needs to know it is not the original part.',
        },
        {
          condition: 'Rating unknown, low-pressure line',
          outcome: 'Acceptable as a temporary fix — mark it and order the correct part',
          detail: 'Return, drain and case lines tolerate this. Write it down.',
        },
        {
          condition: 'Rating unknown, high-pressure line',
          outcome: 'No',
          detail: 'Cap the line and work around it, or the machine waits.',
        },
        {
          condition: 'The seat is right but the thread is close-but-not-quite',
          outcome: 'No — this is the cross-threading case',
          detail: 'It will damage the port, which turns a part into a repair.',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can I use an adapter to make a substitution work?',
          answer:
            'One correct adapter, with its own rating checked, is a legitimate bridge. A stack of adapters to reach the thread is not a substitution — it is a new joint with several new leak paths and a lever arm on the port.',
        },
        {
          question: 'Is a higher-rated part always a safe substitute?',
          answer:
            'For pressure, yes. It can still be wrong on material, bore or geometry, and a much heavier part can load the port differently. Check all four rather than treating rating as a licence.',
        },
        {
          question: 'How do I record a temporary fix so it actually gets corrected?',
          answer:
            'Mark the joint physically, note it on the job card, and add the correct part to the next order the same day. The step people skip is the third one, and it is the one that closes the loop.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Carrying temporary fixes you want to close out?',
      body: 'Send the list of marked joints with photographs. We will name the correct parts, quote them as one consignment, and flag any joint where what is currently fitted should come out sooner rather than at the next service.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
