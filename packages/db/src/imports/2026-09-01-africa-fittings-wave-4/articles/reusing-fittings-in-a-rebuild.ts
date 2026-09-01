import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * A rebuild is where good fittings and scrap fittings get mixed back together
 * in one tray. The article is about the sorting decision, which nobody has
 * written down anywhere the fitter can see it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'reusing-fittings-in-a-rebuild',
  title: 'Reusing fittings in a rebuild: what survives, and what belongs in the bin',
  excerpt:
    'Half the parts in the tray are perfectly good and half are finished. Sorting them takes a light and two minutes, and getting it wrong shows up after reassembly.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:52:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Steel adapters in good condition are reusable; the elastomers with them are not.',
        'The sealing face decides it — a mark across a cone or flat face is a leak path.',
        'A fitting that came off a seized or over-tightened joint starts as scrap until inspection says otherwise.',
        'Bite rings and crimped ends belong to the tube or hose they were made up on.',
        'Sorting during dismantling costs nothing; sorting after reassembly costs the whole job again.',
      ],
    },
    {
      type: 'lead',
      html: 'Reusing fittings in a rebuild is normal, sensible and how most workshops on a long lane keep a machine moving. What goes wrong is not the reuse — it is that the sorting happens with the parts already mixed in a tray, at the end of a long day, under pressure to reassemble.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Sort while you dismantle, not after.',
      anchor: 'sort-while',
    },
    {
      type: 'paragraph',
      html: 'Every fitting that comes off carries information that disappears the moment it lands in a common tray: which port it came from, whether it fought coming off, whether the seat looked wrong. <strong>Three trays — reuse, inspect, scrap — decided as parts come off</strong> preserves that, and it costs nothing but the trays.',
    },
    {
      type: 'comparison_table',
      caption: 'The sorting rule',
      columns: ['Condition on removal', 'Tray'],
      rows: [
        { cells: ['Came off easily, seat clean under a light', 'Reuse, with new elastomers'] },
        { cells: ['Came off hard, or from a joint that was weeping', 'Inspect properly before deciding'], highlight: true },
        { cells: ['Any mark across the sealing face', 'Scrap'] },
        { cells: ['Thread pickup, galling, or a rounded hex', 'Scrap'] },
        { cells: ['Bite ring, crimped end, or anything deformed onto its mate', 'Scrap — it belongs to that tube or hose'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The elastomers are not a judgement call.',
      anchor: 'elastomers',
    },
    {
      type: 'paragraph',
      html: 'O-rings, bonded seals and dowty washers have taken a set under load and are single-use in practice. They cost almost nothing, they are the commonest reason a rebuilt joint weeps on first pressurisation, and re-using them is how a good rebuild acquires a fault that looks like bad workmanship. <strong>Buy them by the box and change every one</strong> — this is the least controversial line in this article and the most often ignored.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A rebuild is judged on its leaks, fairly or not.',
      body: 'A machine that comes back from an overhaul weeping at two joints is remembered as a bad rebuild regardless of what else was done well. Both of those joints are usually a re-used seal, which makes the seal box the cheapest reputational insurance in the workshop.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to do with the "inspect" tray.',
      anchor: 'inspect-tray',
    },
    {
      type: 'paragraph',
      html: 'Look at the sealing face at an angle under a light; run a known nut down the thread; check the hex on a spanner for rounding. Anything that fails one of the three goes to scrap. The temptation on a remote site is to keep marginal parts because the replacement is weeks away — and that is exactly the site where a leak found after reassembly costs the most.',
    },
    {
      type: 'paragraph',
      html: 'The better answer to that constraint is upstream: hold the common ends in stock so the marginal part can be discarded without stopping the job. It is the same short list as everywhere else in this series — the two or three bores that actually fail.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can a fitting that came off a seized joint be reused?',
          answer:
            'Treat it as scrap until it has been inspected properly. Something in that joint was corroded or damaged, and the forces used to free it are not kind to threads or seats.',
        },
        {
          question: 'Are crimped hose ends reusable?',
          answer:
            'No. The ferrule has been deformed onto that hose and belongs to it. Re-crimping a used end onto new hose is a joint whose retention nobody can vouch for.',
        },
        {
          question: 'What about reusing a bite ring on the same tube?',
          answer:
            'It has already cut into that tube at one position. Best practice is a new ring and a freshly cut tube end; a re-made joint using the old ring is the usual explanation for a tube fitting that will not stop weeping.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Rebuild coming up?',
      body: 'Send the machine and the circuits being opened. We will quote the seal kit and the ends worth having on the bench before it starts, so nothing marginal gets refitted because the alternative was a two-week wait.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
