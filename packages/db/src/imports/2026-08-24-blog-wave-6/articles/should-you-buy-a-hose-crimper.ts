import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'should-you-buy-a-hose-crimper',
  title: 'Should you buy a crimper? The real economics of making your own hoses',
  excerpt:
    'Sometimes the answer is yes. The machine is rarely the expensive part, the dies usually are, and the thing that decides it is not cost at all — it is how far away your machines break down.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Buying a hydraulic hose crimper — when it makes sense',
  seoDescription:
    'An honest look at making your own hydraulic hoses: what a crimper really costs once dies are included, what changes about liability and traceability, and the fleet size where it starts paying.',
  focusKeyword: 'buy hydraulic hose crimper',
  publishedAt: '2026-08-24T18:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The crimper is the cheap part. Dies, ferrule and fitting stock, hose stock and a cut-off saw are where the money goes.',
        'Crimp specifications are set by the hose and fitting manufacturer as a matched system. A die set does not make two brands interchangeable.',
        'Distance is the real driver. A fleet an hour from a hose shop has a much stronger case than a bigger fleet ten minutes away.',
        'You take on responsibility for the assembly. That matters most on lifting, access and certified equipment.',
        'The half-way position — you hold hose and fittings, we build — captures most of the benefit with none of the calibration burden.',
      ],
    },
    {
      type: 'lead',
      html: 'We sell hose assemblies, so treat what follows accordingly — but the honest answer is that plenty of operations should own a crimper, and pretending otherwise would be obvious to anybody who has waited half a day for a hose in the middle of a harvest or a shutdown. What matters is doing the arithmetic on the whole system rather than on the machine price.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What it actually costs to be able to build a hose.',
      anchor: 'what-it-costs',
    },
    {
      type: 'comparison_table',
      caption: 'The shopping list nobody quotes you up front',
      columns: ['Item', 'Note'],
      rows: [
        {
          cells: ['Crimping machine', 'The advertised price, and the smallest line item over time'],
        },
        {
          cells: [
            'Die sets',
            'One set per crimp diameter range. This is usually the largest single cost',
          ],
          highlight: true,
        },
        {
          cells: [
            'Ferrules and fittings',
            'Held in every size and thread family you might need at 2 a.m.',
          ],
          highlight: true,
        },
        { cells: ['Hose stock', 'By grade and bore. Hose has a shelf life, so stock ages'] },
        {
          cells: [
            'Cut-off saw and cleaning kit',
            'A clean square cut and a clean bore are not optional',
          ],
        },
        {
          cells: [
            'Calibration and maintenance',
            'A crimper that has drifted produces assemblies that look right',
          ],
          highlight: true,
        },
        {
          cells: [
            'Training and a written method',
            'The part that is always skipped and always matters',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The stock is the commitment, not the machine.',
      body: 'A crimper only removes downtime if the fitting you need is on the shelf when the hose bursts. Holding one bore in one grade with two thread families is a small investment; covering a mixed fleet properly is a different scale of decision, and hose that sits unused ages out.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where it genuinely pays.',
      anchor: 'where-it-pays',
    },
    {
      type: 'decision_tree',
      heading: 'The case for owning a crimper',
      intro: 'Any two of these together usually settle it.',
      branches: [
        {
          condition: 'How far are you from a hose service?',
          outcome: 'Distance is the strongest single argument.',
          detail:
            'Remote sites, farms, quarries and vessels lose hours per failure that a workshop in an industrial area does not.',
        },
        {
          condition: 'What does an hour of downtime cost?',
          outcome:
            'If it is a crew standing idle or a production line stopped, the machine pays for itself quickly.',
          detail: 'The comparison is against downtime, not against the price of an assembly.',
        },
        {
          condition: 'How narrow is the range you need?',
          outcome: 'A fleet of similar machines needs few sizes. A mixed fleet needs many.',
          detail:
            'Narrow range is what makes stock affordable, and stock is what makes the crimper useful.',
        },
        {
          condition: 'Do you have someone who will own the process?',
          outcome: 'A named person, trained, with the manufacturer crimp charts to hand.',
          detail:
            'Without this it becomes an occasional-use machine, and occasional use is where inconsistent assemblies come from.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What changes when you build them yourself.',
      anchor: 'what-changes',
    },
    {
      type: 'paragraph',
      html: 'The technical part is straightforward and the responsibility part is the one worth thinking about. <strong>Crimp specifications are published by the hose and fitting manufacturer for their own matched combination</strong> — a crimp diameter, a die, and often a skive depth. Mixing a ferrule from one source with hose from another leaves you without a published specification to work to, and the assembly cannot then be said to meet anything in particular.',
    },
    {
      type: 'comparison_table',
      caption: 'Buying assemblies against building them',
      columns: ['Consideration', 'Bought assembly', 'Built in house'],
      rows: [
        {
          cells: [
            'Time to a hose at 2 a.m.',
            'Travel plus build',
            'Minutes, if the stock is there',
          ],
          highlight: true,
        },
        {
          cells: [
            'Crimp specification',
            'The supplier works to the published chart',
            'You work to it, and you hold the record',
          ],
        },
        {
          cells: [
            'Traceability of the finished assembly',
            'Tagged and recorded by the supplier',
            'Yours to create and keep',
          ],
        },
        {
          cells: ['Responsibility if it fails', 'Sits with the supplier', 'Sits with you'],
          highlight: true,
        },
        {
          cells: [
            'Certified and lifting equipment',
            'Straightforward — certificates come with it',
            'Check your inspection regime before assuming it is acceptable',
          ],
          highlight: true,
        },
        {
          cells: [
            'Cost per assembly at volume',
            'Higher',
            'Lower, once the fixed costs are absorbed',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The cheapest crimper is not a bargain.',
      body: 'Consistency is the entire product. A machine that closes to a slightly different diameter each time produces assemblies that look identical and are not, and the failure appears weeks later on a machine, not on the bench. If the budget only reaches the cheapest machine on the market, the money is better spent on stock and a supplier relationship.',
    },
    {
      type: 'direct_answer',
      question: 'Is it worth buying a hydraulic hose crimper?',
      answer:
        'It is worth it when you are far from a hose service, downtime is expensive, and your fleet needs a narrow range of sizes you can realistically stock. Budget for dies, ferrules, fittings and hose stock rather than the machine alone, and be clear that you take on responsibility for the crimp specification and for traceability — which matters most on lifting, access and certified equipment.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The middle option most people end up at.',
      anchor: 'middle-option',
    },
    {
      type: 'paragraph',
      html: 'Two arrangements capture most of the benefit without the calibration and record-keeping. <strong>Hold a kit of made-up assemblies for the failures you actually get</strong>, built and tagged by a supplier, so the common ones are already on the shelf. Or <strong>hold bulk hose and fittings and let a supplier build in batches</strong>, so you control the stock and somebody else owns the specification.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'By the metre for your own stock, or built and tagged.',
    },
    {
      type: 'category_link',
      slug: 'crimp-ferrules',
      label: 'Crimp ferrules',
      blurb: 'Matched to the hose grade they are specified against.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hose fittings by thread type',
      blurb: 'The stock list that decides whether a crimper is any use.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I use any ferrule with any hose?',
          answer:
            'No. The crimp specification is published for a matched hose and ferrule combination. Mixing them leaves no published crimp diameter to work to, and the assembly has no stated rating.',
        },
        {
          question: 'How do I know a crimp is correct?',
          answer:
            'Measure the crimp diameter across the flats with a caliper and compare it against the manufacturer chart for that hose and ferrule, on every assembly. Visual inspection does not detect a crimp that is a fraction of a millimetre out.',
        },
        {
          question: 'Do I need to skive the hose?',
          answer:
            'It depends entirely on the fitting. Some are specified skive, some no-skive, and the crimp chart tells you which along with the depth. Guessing produces a joint that leaks or one that pulls out.',
        },
        {
          question: 'Is a hand or bench crimper good enough?',
          answer:
            'For small bores and low pressure grades, often yes. Check the machine is rated for the bore and grade you intend to build, and that dies exist for the ferrules you will actually use.',
        },
        {
          question: 'Can I still buy hose and fittings from you if I build my own?',
          answer:
            'Yes, and many customers do exactly that. We supply hose by the metre, ferrules and fittings, with the crimp data for the combination.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'No prices quoted deliberately — machine, die and stock costs move, and a stale figure is worse than none.',
    },
    {
      type: 'cta_block',
      heading: 'Tell us the fleet and we will tell you the stock list.',
      body: 'Whether or not you buy a crimper, the useful output is the same: which sizes and grades actually fail on your machines, and what is worth holding. We will put that list together from your machine list.',
      quoteLabel: 'Ask about a stock list',
    },
  ],
}

export default ARTICLE
