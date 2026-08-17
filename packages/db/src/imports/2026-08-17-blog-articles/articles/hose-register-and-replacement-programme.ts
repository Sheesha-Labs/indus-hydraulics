import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hose-register-and-replacement-programme',
  title: 'Building a hose replacement programme that actually ends unplanned failures',
  excerpt:
    'Most fleets replace hoses when they burst. Moving to planned replacement needs three things — a register, a criticality ranking, and an interval that comes from your own data rather than a catalogue.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose replacement programme and hose register',
  seoDescription:
    'How to build a hose register and criticality ranking, set replacement intervals from your own failure data, and tag assemblies so the record survives staff turnover.',
  focusKeyword: 'hose management programme',
  publishedAt: '2026-08-17T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'You cannot plan replacement for assemblies you have not listed. The register comes before the interval.',
        'Rank by consequence of failure, not by cost of the hose. The cheapest assembly on a machine is often the one that strands it.',
        'Intervals should come from your own failure records. A number from a catalogue knows nothing about your duty or your ambient.',
        'Tag the assembly physically. A register that depends on someone remembering which hose is which stops working the moment they leave.',
        'The programme pays for itself in avoided downtime, not in hose cost — hoses get slightly more expensive and outages get much rarer.',
      ],
    },
    {
      type: 'lead',
      html: 'Nearly every fleet starts on breakdown replacement, and most stay there because the alternative sounds like a project. It is smaller than it looks: the useful version of a hose programme is three columns and a decision about consequence.',
    },

    { type: 'section_head', number: '/01', title: 'The register.', anchor: 'the-register' },
    {
      type: 'paragraph',
      html: 'A hose register lists every assembly on every machine you intend to manage, with enough detail to re-order it without going back to the machine. That is the whole trick — <strong>the register is what turns a two-hour identification job into a two-minute one</strong> when something fails at an inconvenient time.',
    },
    {
      type: 'sop_block',
      header: 'HOSE REGISTER · MINIMUM USEFUL RECORD',
      completion: '6 fields',
      phases: [
        {
          name: 'Per assembly',
          rows: [
            { task: 'Unique ID', detail: 'Physically tagged on the assembly. Everything else hangs off this.', who: 'Maintenance', tool: 'Hose tag' },
            { task: 'Machine and position', detail: 'Which machine, which circuit, where on it. Specific enough that someone who has not seen it can find it.', who: 'Maintenance', tool: 'Register' },
            { task: 'Specification', detail: 'Bore, grade, length, both fitting types and the angle between them.', who: 'Maintenance', tool: 'Register' },
            { task: 'Date fitted', detail: 'The single most useful field, and the one most often missing.', who: 'Fitter', tool: 'Register' },
            { task: 'Criticality', detail: 'What happens to production if this one fails. Drives everything downstream.', who: 'Engineer', tool: 'Ranking' },
            { task: 'Failure history', detail: 'What failed, where, and what was changed. This is what turns a guess into an interval.', who: 'Maintenance', tool: 'Register' },
          ],
        },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Rank by consequence.', anchor: 'criticality' },
    {
      type: 'direct_answer',
      question: 'How do you decide which hoses to include in a replacement programme?',
      answer:
        'By the consequence of failure, not the cost of the part. Rank each assembly on what its failure does — stops production, creates a safety hazard, causes environmental release, or is merely inconvenient — and put the top band on planned replacement first. A programme covering everything usually covers nothing.',
    },
    {
      type: 'comparison_table',
      caption: 'A workable criticality ranking',
      columns: ['Band', 'Failure consequence', 'Approach'],
      rows: [
        { cells: ['A', 'Stops production, or creates a safety or environmental hazard', 'Planned replacement, spares held'], highlight: true },
        { cells: ['B', 'Degrades output or takes a machine off for hours', 'Planned replacement, spares available at short notice'] },
        { cells: ['C', 'Inconvenient, easily worked around', 'Condition-based; replace on inspection finding'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The band-A list is usually far shorter than people expect, and that is the point. A programme that begins with the twenty assemblies that actually stop the plant gets adopted; one that begins with every hose on site gets abandoned in month two.',
    },

    { type: 'section_head', number: '/03', title: 'Where the interval comes from.', anchor: 'interval' },
    {
      type: 'paragraph',
      html: 'From your own failure history, which is why the register has a failure column. Once you have a year of records on band-A assemblies you can see where they actually fail and roughly when — and that is a defensible interval in a way a published figure is not, because it already accounts for your duty cycle, your ambient temperature and your installation quality.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'In Gulf conditions, borrowed intervals run optimistic.',
      body: 'Heat, UV and airborne sand all shorten hose life relative to temperate-climate assumptions. An interval lifted from a European fleet manual is a starting hypothesis at best — treat the first year of your own data as the thing that corrects it.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is planned replacement not just throwing away good hoses?', answer: 'Some, yes — that is the trade. The question is whether the value of the hose discarded early is less than the cost of the outages avoided. On band-A assemblies it usually is by a wide margin; on band-C it usually is not, which is why they stay condition-based.' },
        { question: 'What do we tag assemblies with?', answer: 'Anything durable that survives the environment and carries a unique ID. The technology matters far less than whether the ID is legible in three years and links to a record someone maintains.' },
        { question: 'Can we run this without maintenance software?', answer: 'Yes. A spreadsheet with those six fields beats an unused module in an expensive system. Move it into your CMMS when the discipline is established, not before.' },
        { question: 'How long before it shows a result?', answer: 'You see the register pay off immediately in faster identification. The reduction in unplanned failures follows the first full replacement cycle on band A.' },
      ],
    },
    { type: 'product_embed', heading: 'Common band-A replacement grades', skus: ['IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'For stocking the assemblies your programme puts on planned replacement.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Method only. No replacement intervals published — the article argues they should come from your own failure data.' },
    { type: 'cta_block', heading: 'Setting up a programme?', body: 'Send the machine list and what has failed in the last year. We can help set criticality and work out what needs holding as spares.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
