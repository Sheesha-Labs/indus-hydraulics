import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Plating, for humid and coastal sites.
 *
 * States the relative ordering of common finishes and the test they are rated
 * by, and deliberately publishes no salt-spray hour figures — those are per
 * product and per supplier, and a number quoted here would be read as ours.
 * The article tells the reader to ask for the figure instead.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'plating-and-corrosion-on-fittings',
  title: 'Plating and corrosion on fittings: what survives a humid coastal site',
  excerpt:
    'The plating decides how long a fitting lasts on the outside of a machine. What the common finishes are, how they are rated, and where the corrosion actually starts.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Plating and corrosion on hydraulic fittings — coastal sites',
  seoDescription:
    'Zinc, zinc-nickel and other finishes on hydraulic fittings, how corrosion resistance is rated, and what changes on a humid or coastal site.',
  focusKeyword: 'plating and corrosion',
  publishedAt: '2026-09-01T14:55:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Does the plating and corrosion resistance of a hydraulic fitting actually matter?',
      answer:
        'On a dry inland site, rarely. On a humid coastal one, it decides how long the fitting lasts — because corrosion attacks the thread and the hex from the outside while the joint is still sealing perfectly on the inside. Common finishes are ordered by how long they resist a standardised salt-spray exposure, and the ordering is consistent even though the hours vary by supplier: plain zinc is the baseline, and zinc-nickel is substantially better.',
    },
    {
      type: 'lead',
      html: 'Corrosion on a fitting is a slow problem that becomes an urgent one at the worst moment: the joint is fine until somebody needs to undo it, and then the hex rounds or the thread seizes. On a coastal site that is not an occasional event — it is the normal end of life for external fittings, and the plating is the variable that moves it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How the finishes compare.',
      anchor: 'finishes',
    },
    {
      type: 'comparison_table',
      caption: 'Common finishes, in ascending order of resistance',
      columns: ['Finish', 'Where it makes sense'],
      rows: [
        { cells: ['Plain or clear-passivated zinc', 'Inland, dry, sheltered positions'] },
        { cells: ['Yellow or thick-passivated zinc', 'General duty, some humidity'] },
        { cells: ['Zinc-nickel', 'Coastal, humid, washdown and marine-adjacent sites'], highlight: true },
        { cells: ['Stainless base material', 'Where the corrosion is aggressive enough that plating is not the answer'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Resistance is quoted as hours to a defined level of corrosion under a standardised salt-spray exposure. <strong>The figure is a property of a specific product and supplier, so ask for it rather than assuming a family value</strong> — two parts both described as zinc-nickel can be rated very differently. What holds regardless is the ordering above.',
    },
    {
      type: 'standard_citation',
      standard: 'ASTM B117',
      publisher: 'ASTM International',
      title: 'Standard Practice for Operating Salt Spray (Fog) Apparatus',
      summary:
        'Defines the salt-spray exposure used to compare corrosion resistance of coatings. It is a comparative test rather than a prediction of service life — useful for ranking finishes against each other, not for stating how long a part will last on a particular site.',
      url: 'https://www.astm.org/b0117-19.html',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where corrosion actually starts.',
      anchor: 'where-it-starts',
    },
    {
      type: 'paragraph',
      html: 'Rarely on the flat faces. It starts where the coating is <strong>thinnest or damaged</strong>: the thread crests, the corners of the hex, and anywhere a spanner has slipped. Then it works under the coating from that point. This is why a fitting that has been fitted and removed twice corrodes faster than one that has not — every tool contact is a start point.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Mixing metals accelerates it.',
      body: 'A stainless fitting screwed into a plated carbon-steel port puts two dissimilar metals in contact with salt-laden moisture around them, and the less noble one corrodes preferentially. Where a site is coastal and mixed materials are unavoidable, expect the joint rather than either part to be the thing that fails, and inspect it as a joint.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to specify.',
      anchor: 'specify',
    },
    {
      type: 'paragraph',
      html: 'For a coastal or washdown site, specify the finish rather than accepting the default, and specify it for the external positions where it matters rather than for everything. A practical split: better plating on anything exposed on the outside of a machine, standard plating for parts that live inside a housing, stainless where the environment is aggressive enough to defeat plating altogether.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-hydraulic-fittings',
      label: 'Stainless steel fittings',
      blurb: 'SS316L, for coastal, offshore and chemical service.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can I paint a fitting to protect it?',
          answer:
            'Paint over a thread is a bad idea — it interferes with the make-up and it hides what is happening underneath. Protecting the exposed hex and body of an installed fitting with a suitable coating is defensible; painting the sealing surfaces or the threads is not.',
        },
        {
          question: 'Is stainless always better?',
          answer:
            'For corrosion, usually. For pressure and cost, not automatically — stainless fittings are frequently rated lower than the carbon-steel equivalent and cost considerably more. It is a per-position decision.',
        },
        {
          question: 'What finish do your fittings carry?',
          answer:
            'It varies by family and product line, and it is stated on the quotation when you ask. For a coastal site, tell us at enquiry and we will quote against the finish rather than against the cheapest option.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Coastal or washdown site?',
      body: 'Say so with the enquiry. We will quote the finish alongside the part, flag where stainless is the better answer, and say where paying for the better plating changes nothing.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
