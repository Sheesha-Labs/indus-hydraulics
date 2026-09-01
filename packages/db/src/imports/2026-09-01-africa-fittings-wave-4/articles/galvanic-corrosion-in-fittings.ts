import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The mixed-metals article. Sits under both the plating article (wave 2) and
 * the stainless one, and exists because "upgrade the fitting to stainless" is
 * advice that quietly moves the corrosion into the port.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'galvanic-corrosion-in-fittings',
  title: 'Galvanic corrosion in fittings: what an upgrade moves rather than fixes',
  excerpt:
    'Put stainless into a plated steel port on a wet, salty site and the corrosion does not stop — it changes address. Sometimes that is the right trade.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Two dissimilar metals plus a conductive film is a cell, and one of the two corrodes preferentially.',
        'Upgrading only the fitting on a coastal site often moves the attack onto the port rather than removing it.',
        'The relative surface areas matter: a small anodic part next to a large cathodic one corrodes fastest.',
        'Sometimes the trade is right — a port is easier to protect and inspect than an exposed fitting.',
        'What is never right is making the swap without knowing that is what you did.',
      ],
    },
    {
      type: 'lead',
      html: 'Galvanic corrosion is the reason a well-intentioned material upgrade sometimes produces a worse outcome than leaving things alone. It is not an exotic phenomenon and it does not need seawater — humid salt-laden air is enough, and most of the coastal sites we supply have exactly that.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The mechanism, briefly.',
      anchor: 'mechanism',
    },
    {
      type: 'paragraph',
      html: 'Two different metals in electrical contact, with an electrolyte bridging them, form a cell. Current flows, and the less noble of the two gives up material to protect the other. In a hydraulic joint the electrolyte is condensation or salt spray sitting in the thread, and the two metals are whatever the fitting and the port happen to be. <strong>The joint is the cell</strong>, which is why inspecting the two parts separately misses it.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Surface area is half the story.',
      body: 'A small area of the less noble metal against a large area of the more noble one corrodes fast, because the whole cathodic area drives attack onto a small anode. A stainless fitting in a plated port is exactly that geometry, concentrated at the first few threads.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where it shows up on real machines.',
      anchor: 'where',
    },
    {
      type: 'comparison_table',
      caption: 'Common combinations on a coastal site',
      columns: ['Combination', 'What tends to happen'],
      rows: [
        { cells: ['Stainless fitting, plated steel port', 'Attack concentrates in the port threads'], highlight: true },
        { cells: ['Plated fitting, stainless manifold', 'The fitting is consumed; cheaper, and easier to see'] },
        { cells: ['Same material both sides', 'No galvanic driver; ordinary corrosion only'] },
        { cells: ['Dissimilar, but dry and sheltered', 'Usually inconsequential — no electrolyte, no cell'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The second row is worth reading as a strategy rather than a warning. <strong>Deciding which part you would rather lose is a legitimate engineering choice</strong> — a consumable fitting protecting an expensive block is a trade many plants would take deliberately if anyone framed it that way.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to do about it.',
      anchor: 'what-to-do',
    },
    {
      type: 'paragraph',
      html: 'Match materials through the joint where the exposure is severe, and where you cannot, decide knowingly which side is the sacrificial one. Keep the electrolyte out — protecting the outside of an assembled joint is cheap and effective. And <strong>inspect dissimilar joints as joints</strong>, at the interface, rather than glancing at two apparently sound components.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not upgrade one fitting on a machine and consider the problem solved.',
      body: 'The most common version of this on the sites we supply is a single stainless replacement in an otherwise plated system, fitted because the old one corroded. The corrosion reappears six months later in the port, and nobody connects it to the upgrade.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a stainless fitting in a steel port always wrong?',
          answer:
            'No — it is a trade. In a dry sheltered position it is usually inconsequential. In salt air it will concentrate attack on the port, and whether that is acceptable depends on which part you would rather replace.',
        },
        {
          question: 'Does an anti-seize compound prevent it?',
          answer:
            'A compound that keeps moisture out of the thread interferes with the mechanism, which helps. It is a mitigation rather than a solution, and it does nothing for the exposed exterior of the joint.',
        },
        {
          question: 'How do I tell galvanic attack from ordinary corrosion?',
          answer:
            'Look at where it is concentrated. Ordinary corrosion is fairly even over exposed surfaces; galvanic attack clusters at the interface between the two metals and is often much worse there than anywhere else on either part.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Mixing materials on a coastal machine?',
      body: 'Tell us what the port is and what the exposure is. We will say which combination we would supply, which part it sacrifices, and where matching the materials through the joint is worth the cost.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
