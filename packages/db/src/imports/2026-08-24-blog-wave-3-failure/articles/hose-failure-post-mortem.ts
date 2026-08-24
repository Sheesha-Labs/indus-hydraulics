import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hose-failure-post-mortem',
  title: 'The hose failure post-mortem: eleven questions that stop it recurring',
  excerpt:
    'Most hose failures get replaced, not investigated, so the same position fails again next quarter. This is the record that turns a replacement into a fix — eleven fields, five minutes, and no special equipment.',
  categorySlug: 'failure-analysis',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose failure report template — what to record',
  seoDescription:
    'A practical post-mortem for a failed hydraulic hose assembly: what to record, what to photograph, what to cut open, and how to tell a build fault from an installation fault.',
  focusKeyword: 'hose failure report template',
  publishedAt: '2026-08-24T13:42:16.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A failed hose is the only physical evidence of what went wrong, and it is normally in a skip within the hour.',
        'Eleven fields cover it. Most are answerable from the hose and the machine in front of you.',
        'Service life is the single most diagnostic field: weeks points at the build, years points at the installation.',
        'Photograph the hose in its routing before removing it — that relationship is destroyed the moment it comes off.',
        'A position that has failed twice is an engineering problem. Recording failures is what makes the second one visible as a repeat.',
      ],
    },
    {
      type: 'lead',
      html: 'Nobody is going to fill in a form for a burst hose on a Tuesday afternoon with a machine down. The point of this one is that it is short enough to be filled in anyway, and that the fields were chosen because each one actually changes the conclusion.',
    },

    { type: 'section_head', number: '/01', title: 'Before the hose comes off.', anchor: 'before-removal' },
    {
      type: 'comparison_table',
      caption: 'Two minutes at the machine, which cannot be recovered later',
      columns: ['Record', 'Why it cannot wait'],
      rows: [
        { cells: ['Photograph of the hose in its routing', 'The relationship between the failure and what it touched is gone once removed'], highlight: true },
        { cells: ['Where on the machine, and which circuit', 'Position is what makes a repeat failure identifiable as a repeat'] },
        { cells: ['Machine position at failure, if known', 'Contact often happens only at one point in the travel'] },
        { cells: ['Layline photograph, if still legible', 'Identifies grade and size without measuring; may carry a date code'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The eleven fields.', anchor: 'the-fields' },
    {
      type: 'comparison_table',
      caption: 'Copy these into whatever you already use — a sheet, a notebook, a maintenance system',
      columns: ['#', 'Field', 'What it settles'],
      rows: [
        { cells: ['1', 'Machine and position', 'Whether this position has failed before'] },
        { cells: ['2', 'Date fitted, date failed', 'Service life — the most diagnostic single number'] },
        { cells: ['3', 'Hose grade and size', 'Whether the specification was right for the duty'] },
        { cells: ['4', 'Fitting types, both ends', 'Whether the termination suited the routing'] },
        { cells: ['5', 'Where it failed along its length', 'At the ferrule, mid-length, or at a bend'] },
        { cells: ['6', 'Cover condition at the failure', 'Abrasion, cracking, blistering, or clean'] },
        { cells: ['7', 'Wire condition — bright or corroded', 'Separates a pressure failure from a corrosion failure'], highlight: true },
        { cells: ['8', 'Tube condition, cut lengthways', 'Swollen, hardened or clean — fluid compatibility'] },
        { cells: ['9', 'Layline straight or spiralled', 'Whether it was installed with a twist'] },
        { cells: ['10', 'Fluid and running temperature', 'Compatibility and heat ageing'] },
        { cells: ['11', 'What changed recently', 'New fluid, new duty, new operator, recent repair nearby'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Fields 7, 8 and 9 need thirty seconds with a knife.',
      body: 'Cut a section of the failed hose lengthways. The wire tells you whether water got in, the tube tells you whether the fluid was attacking it, and the layline tells you whether it was twisted. Three of the eleven answers come out of one cut, and none of them is available any other way.',
    },

    { type: 'section_head', number: '/03', title: 'Reading the answers.', anchor: 'reading' },
    {
      type: 'decision_tree',
      heading: 'What the combination points at',
      intro: 'Take service life first, then location, then condition.',
      branches: [
        { condition: 'Failed within weeks, at the ferrule', outcome: 'Build fault. Ask for the crimp specification and the measured value.', detail: 'Early ferrule failures are pull-out or over-crimp until the build is ruled out.' },
        { condition: 'Failed after years, at the ferrule', outcome: 'Installation. The hose has been flexing or bending at the fitting the whole time.', detail: 'Look for an elbow fitting or a longer assembly rather than a like-for-like replacement.' },
        { condition: 'Cover worn through on one side', outcome: 'Abrasion. Find the rub point before fitting the replacement.', detail: 'The worn patch is a map of what it was touching.' },
        { condition: 'Wire corroded, cover otherwise intact', outcome: 'Water entered somewhere and tracked along the reinforcement.', detail: 'Look for the entry breach, which is often nowhere near the corrosion.' },
        { condition: 'Tube swollen or hardened', outcome: 'Fluid incompatibility. Changing hose grade will not help.', detail: 'The tube compound has to change, or the fluid does.' },
        { condition: 'Layline spirals around the hose', outcome: 'Installed with a twist. Fix the installation method, not the hose.', detail: 'Two spanners — hold the fitting while the nut turns.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The second failure at one position is the important one.',
      body: 'A single failure is an event. The same position failing twice is a design or routing problem that will keep consuming hoses until something about the installation changes. Without a record of the first, the second one looks like an event too — which is the whole argument for keeping this record at all.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Replace it, then change what caused it.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a printable version available?', answer: 'Not yet — the table above is the current version, and it is written to be copied into whatever system you already use rather than to add another one. A printable sheet is on the list.' },
        { question: 'Do I need to keep the failed hose?', answer: 'For a first failure, photographs and the eleven fields are enough. For a repeat at the same position, keep it — comparing two failed assemblies from one location is usually what identifies the cause.' },
        { question: 'Who should fill this in?', answer: 'Whoever removes the hose, because half the fields are only answerable at the machine. It is deliberately short for that reason.' },
        { question: 'We do not have fitted dates. Where do we start?', answer: 'With tags on the next set of assemblies. A hose register is the thing that makes field 2 answerable, and field 2 is the one that separates a build fault from an installation fault.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Workshop practice. The eleven fields are the ones that change our own conclusion when a customer sends a failed assembly for review.',
    },
    { type: 'cta_block', heading: 'Send us a completed post-mortem.', body: 'The eleven fields plus photographs are usually enough for us to say what failed and why, and whether a like-for-like replacement will do it again.', quoteLabel: 'Get a failure reviewed' },
  ],
}

export default ARTICLE
