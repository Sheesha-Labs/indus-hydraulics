import type { BlogArticleSeed } from '../shared'

/**
 * Scoped to method, not to an equivalence table. See the note in shared.ts:
 * we do not hold verified interchange data for the major brands, and "our X
 * replaces their Y" is a specification claim about a part that ends up on a
 * machine. This article teaches the check instead of asserting the answer.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-cross-reference-a-hydraulic-hose',
  title: 'Cross-referencing a hose or fitting: what actually has to match',
  excerpt:
    'Somebody hands you a part number from a brand you cannot buy locally. Here is how to find something that genuinely replaces it — and why the cross-reference tables you will find online are not evidence.',
  categorySlug: 'procurement-export',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'How to cross-reference a hydraulic hose or fitting part number',
  seoDescription:
    'The method for finding a genuine equivalent to a hydraulic hose or fitting: what has to match, what a designation does not settle, and why online cross-reference tables are unreliable.',
  focusKeyword: 'hydraulic hose cross reference',
  publishedAt: '2026-08-24T15:18:40.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A part number is a brand’s internal identifier. It carries no information anyone outside that brand can decode reliably.',
        'What has to match is the specification, not the number: bore, construction, pressure at that bore, temperature, tube compound, and the fitting geometry.',
        'A shared standard designation is a floor, not an equivalence — two hoses can both meet 2SN and differ in outside diameter, cover and bend radius.',
        'Outside diameter is the one that catches people, because it decides the ferrule and the crimp specification.',
        'Cross-reference tables found online are usually application equivalence with no statement of what was checked. Treat them as a starting point, never as the answer.',
      ],
    },
    {
      type: 'lead',
      html: 'This page does not contain a cross-reference table. That is deliberate, and the reason is the same reason you should be careful with the ones you find elsewhere: publishing "this replaces that" is a claim about a part that ends up carrying pressure on somebody’s machine, and it should only be made by someone who has actually checked.',
    },

    { type: 'section_head', number: '/01', title: 'What a part number is not.', anchor: 'part-numbers' },
    {
      type: 'paragraph',
      html: 'A manufacturer part number is an internal identifier. It may encode size or series in a pattern their own catalogue explains, and it may encode nothing at all. <strong>It is not a specification and it cannot be decoded from outside</strong>, which is why the first move is always to get from the number back to the specification.',
    },
    {
      type: 'paragraph',
      html: 'Usually that means the manufacturer’s own datasheet. Sometimes it means the hose in your hand, which carries more information on its layline than the part number does.',
    },
    {
      type: 'direct_answer',
      question: 'How do I find an equivalent to a hydraulic hose part number?',
      answer:
        'Work back to the specification rather than across to another number. Establish bore, construction, working pressure at that bore, temperature range, tube compound and outside diameter, then find a hose that meets all of them. A shared standard designation such as 2SN is a minimum performance floor, not proof that two hoses are interchangeable.',
    },

    { type: 'section_head', number: '/02', title: 'The six things that have to match.', anchor: 'six-things' },
    {
      type: 'comparison_table',
      caption: 'For a hose',
      columns: ['Property', 'Why it matters', 'Where to get it'],
      rows: [
        { cells: ['Bore', 'Sets flow and velocity; wrong bore is wrong hose', 'Layline, or the original datasheet'] },
        { cells: ['Working pressure at that bore', 'Headline figures are quoted at the smallest size', 'Per-size table, not the catalogue headline'], highlight: true },
        { cells: ['Construction', 'Braid, compact or spiral changes bend radius and behaviour', 'Designation, or count the layers on a cut end'] },
        { cells: ['Temperature range', 'Both ends of it — Gulf ambient matters at the top', 'Datasheet'] },
        { cells: ['Tube compound', 'Fluid compatibility; nitrile is not universal', 'Datasheet'] },
        { cells: ['Outside diameter', 'Decides the ferrule and the crimp specification', 'Measure it, or the per-size table'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Outside diameter is the one people skip.',
      body: 'Two hoses that match on bore, pressure and designation can differ in outside diameter — and the ferrule, the die and the crimp diameter are all selected from it. A substitution that is correct on paper and wrong on OD produces an assembly whose crimp specification nobody can state. This is the single most common way a cross-reference goes wrong quietly.',
    },
    {
      type: 'comparison_table',
      caption: 'For a fitting',
      columns: ['Property', 'Why it matters'],
      rows: [
        { cells: ['Thread size and pitch', 'The obvious one, and the only one a gauge settles'] },
        { cells: ['Seat type', 'JIC and ORFS share thread sizes and seal completely differently'], highlight: true },
        { cells: ['Gender and swivel', 'A rigid male is not a female swivel, whatever the thread says'] },
        { cells: ['Hose end: construction and dash', 'The ferrule is matched to the hose, not just to the size'] },
        { cells: ['Material', 'Carbon steel and stainless are not interchangeable in a coastal duty'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Why the tables online are unreliable.', anchor: 'tables-online' },
    {
      type: 'paragraph',
      html: 'Most published cross-reference tables state that A corresponds to B and say nothing about what was compared. Was it bore and pressure only? Was outside diameter checked? Was the tube compound considered? <strong>Without that statement the table is an assertion, not a check</strong> — and it is frequently an application equivalence, meaning "one will usually do the other’s job", which is a different and much weaker claim.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Three questions to ask of any cross-reference, including ours.',
      body: 'What was compared? At which bore? And does the outside diameter match, or does the ferrule specification change? A supplier who can answer all three has done the work. One who cannot has copied a table.',
    },
    {
      type: 'paragraph',
      html: 'That standard is why this page has no table on it. We do not currently hold verified interchange data for the major hose brands, and we are not going to publish inferred equivalences for parts that end up carrying pressure. <strong>What we will do is check a specific part number against our range properly and tell you what genuinely matches — including when nothing does.</strong>',
    },

    { type: 'section_head', number: '/04', title: 'The practical route.', anchor: 'practical-route' },
    {
      type: 'decision_tree',
      heading: 'In order',
      intro: 'Each step is easier than the one below it, so start at the top.',
      branches: [
        { condition: 'You have the physical hose or fitting', outcome: 'Photograph the layline and both ends, and measure the outside diameter.', detail: 'This is the best case — the part carries most of its own specification.' },
        { condition: 'You have a datasheet for the original', outcome: 'Work from the six properties above.', detail: 'Compare at the bore you actually need, not at the headline figure.' },
        { condition: 'You have only a part number', outcome: 'Send it to us with the machine and the circuit.', detail: 'Context narrows it considerably even when the number alone does not.' },
        { condition: 'You have a number and no context at all', outcome: 'Go back to the machine and photograph what is fitted.', detail: 'Five minutes at the machine beats an afternoon of searching a number nobody can decode.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Per-size data published on every product page.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Dimension tables, size by size.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Will you tell me if you cannot match something?', answer: 'Yes, and it happens. Saying "nothing in our range genuinely matches this" is more useful than selling you something close, because close is what fails at the crimp or at the seat.' },
        { question: 'Is a 2SN from one maker the same as a 2SN from another?', answer: 'They meet the same minimum performance standard. They can still differ in outside diameter, cover compound, bend radius and temperature range — so they are comparable, not identical. Check OD before assuming the ferrule carries across.' },
        { question: 'Can you cross-reference fittings as well as hose?', answer: 'Yes, and fittings are usually easier because the geometry is measurable. Send the thread size, the pitch and a photograph of the end face; the seat is what a photograph settles.' },
        { question: 'Do you publish an interchange table?', answer: 'Not at present, because we do not hold verified interchange data for the major brands and we are not prepared to publish inferred equivalences. Send us the part number and we will check it properly.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Method from our own practice. This page deliberately contains no brand equivalence table — see the body for why.',
    },
    { type: 'cta_block', heading: 'Send us the part number.', body: 'With the machine and the circuit if you have them, or a photograph of the part if you do not. We will tell you what genuinely matches, and say so plainly when nothing does.', quoteLabel: 'Check a part number' },
  ],
}

export default ARTICLE
