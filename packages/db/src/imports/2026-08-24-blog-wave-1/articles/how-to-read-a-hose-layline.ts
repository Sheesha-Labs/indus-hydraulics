import type { BlogArticleSeed } from '../shared'

/**
 * Deliberately does NOT publish a specimen layline string presented as ours.
 *
 * Layline content is set by the manufacturer and is not recorded as a spec on
 * our hydraulic hose products — only the industrial hose lines carry a
 * "Hose Branding (Printed)" spec, and inventing a hydraulic one to illustrate
 * the article would put a fabricated marking on a page whose whole subject is
 * trusting printed markings. The designation examples used here are the real
 * `standard` strings from HOSE_SIZE_TABLES.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-read-a-hose-layline',
  title: 'Reading a hose layline: what the printing on the cover is telling you',
  excerpt:
    'The line of text down the side of a hydraulic hose identifies it completely — grade, size, pressure, maker and often the date it was built. Here is how to read each element, and what to do when it has worn away.',
  categorySlug: 'specification-standards',
  authorSlug: 'mehul-rana',
  seoTitle: 'How to read a hydraulic hose layline — every marking explained',
  seoDescription:
    'What each element of a hydraulic hose layline means: manufacturer, series, size, standard designation, working pressure and date code. Plus how to identify a hose whose printing has worn off.',
  focusKeyword: 'how to read hydraulic hose layline',
  publishedAt: '2026-08-24T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The layline is the printed line running along the cover. It is the fastest and most reliable way to identify a hose that is still in one piece.',
        'It normally carries five things: who made it, what series it is, what size it is, what standard it meets, and what pressure it is rated for.',
        'Standard designations often appear in pairs — a hose can be certified to both an EN and an SAE specification and will print both.',
        'A date or lot code, where present, is what makes age-based replacement possible. Without it, nobody can tell a two-year-old hose from a twelve-year-old one.',
        'Abrasion and UV destroy laylines. On a hose that has been in Gulf sun or against a rub point, the printing is often the first thing to go — which is the argument for tagging assemblies at build.',
      ],
    },
    {
      type: 'lead',
      html: 'Every hydraulic hose leaves the factory carrying its own specification printed along its side. It is the most useful two seconds of identification available anywhere in the workshop, and it is routinely ignored in favour of measuring the old hose with a tape and guessing at the rest.',
    },

    { type: 'section_head', number: '/01', title: 'The five elements.', anchor: 'five-elements' },
    {
      type: 'paragraph',
      html: 'Exact wording and order vary by manufacturer — there is no standard that dictates the layout of the line itself. What is consistent is the information carried. Read left to right and you will find most or all of the following.',
    },
    {
      type: 'comparison_table',
      caption: 'What each element of a layline is doing',
      columns: ['Element', 'Looks like', 'What it settles'],
      rows: [
        { cells: ['Manufacturer or brand', 'A company or series name', 'Whose datasheet governs. Without this the rest is hard to verify.'] },
        { cells: ['Series or type', 'A product family name or code', 'Which specific construction within that maker’s range.'] },
        { cells: ['Size', 'A dash number, a DN, or an inch bore', 'The bore — and therefore the ferrule and fitting dash.'] },
        { cells: ['Standard designation', 'e.g. EN 853 2SN / SAE 100R2AT', 'The construction class and its minimum performance.'], highlight: true },
        { cells: ['Working pressure', 'A bar and/or psi figure', 'The rating at that specific bore — not for the grade generally.'] },
        { cells: ['Date or lot code', 'A quarter and year, or a batch number', 'Age, and traceability back to a production batch.'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The pressure on the layline belongs to that size only.',
      body: 'It is printed on a specific hose of a specific bore, so it is the figure for that bore. Reading it off a −08 hose and applying it to the −20 on the next machine is the same error as quoting a catalogue headline: the grade’s rating falls as the bore rises, often steeply.',
    },

    { type: 'section_head', number: '/02', title: 'Why two standards often appear together.', anchor: 'dual-designation' },
    {
      type: 'paragraph',
      html: 'A layline reading <strong>EN 853 2SN / SAE 100R2AT</strong> is not a hedge or a marketing flourish. It means the hose is certified to both specifications, which manufacturers do because their customers work to different drawings. The wire-braid constructions are the ones where this is routine.',
    },
    {
      type: 'paragraph',
      html: 'It is also the fastest answer to the cross-reference question. If a drawing calls for one designation and the hose in your hand prints both, the substitution question is already settled — and settled visibly, for whoever inspects the machine afterwards.',
    },
    {
      type: 'comparison_table',
      caption: 'Designation strings you will see on the constructions we stock',
      columns: ['Printed designation', 'Construction'],
      rows: [
        { cells: ['EN 853 1SN / SAE 100R1AT', 'Single wire braid'] },
        { cells: ['EN 853 2SN / SAE 100R2AT', 'Double wire braid'] },
        { cells: ['EN 857 1SC', 'Compact single braid — EN only'] },
        { cells: ['EN 857 2SC', 'Compact double braid — EN only'] },
        { cells: ['EN 856 4SP', 'Four-spiral'] },
        { cells: ['EN 856 4SH', 'Four-spiral, heavy duty'] },
        { cells: ['SAE 100R13', 'Spiral — SAE only'] },
        { cells: ['SAE 100R7 / EN 855 R7', 'Thermoplastic'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What does the writing on the side of a hydraulic hose mean?',
      answer:
        'It identifies the hose: the manufacturer, the product series, the bore size, the standard or standards it is built to, and the working pressure at that bore. Many also carry a date or batch code. Read together, those elements are a complete enough specification to order an exact replacement without measuring anything.',
    },

    { type: 'section_head', number: '/03', title: 'When the printing has gone.', anchor: 'worn-off' },
    {
      type: 'paragraph',
      html: 'Laylines are ink on rubber. Sun, sand, solvent and any rub point will take them off, and in Gulf conditions a hose on an exposed boom can lose its printing long before it loses its integrity. That leaves you identifying the hose from its physical properties instead.',
    },
    {
      type: 'decision_tree',
      heading: 'Identifying a hose with no readable layline',
      intro: 'Each step narrows it. Do them in order; the first two are usually enough.',
      branches: [
        { condition: 'Cut end is available', outcome: 'Count the reinforcement layers and note whether they are braided or spiral-wrapped.', detail: 'One braid, two braids, four spirals and six spirals are visually distinct on a clean cut. This alone puts the hose in a construction family.' },
        { condition: 'Reinforcement is visible but you cannot cut', outcome: 'Measure the outside diameter and the bore with callipers.', detail: 'Outside diameter and bore together identify the dash size and narrow the grade — at −08 the constructions we stock spread from 17.2 mm to 23.0 mm outside.' },
        { condition: 'Hose is still on the machine and cannot be removed', outcome: 'Photograph the fitting ends and the routing, and measure outside diameter.', detail: 'The fitting tells us the termination; the routing tells us the bend radius the replacement has to achieve.' },
        { condition: 'A sibling hose on the same machine is readable', outcome: 'Read that one instead.', detail: 'Machines are usually built with one or two grades throughout. A legible layline elsewhere in the same bundle is strong evidence.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A hose whose layline has gone cannot be age-checked.',
      body: 'The date code goes with the printing, and with it the ability to say how long the assembly has been in service. If a hose register matters to you — and on lifting equipment or anything carrying a permit it does — the marking has to be duplicated onto a crimped-on tag at build, because the layline will not survive the machine.',
    },

    { type: 'section_head', number: '/04', title: 'Photograph it before you cut it.', anchor: 'photograph-first' },
    {
      type: 'paragraph',
      html: 'The single most useful habit in hose replacement: <strong>photograph the layline before the hose comes off the machine.</strong> It takes a moment, it survives the hose being cut up, and it turns a specification conversation into a reading exercise.',
    },
    {
      type: 'paragraph',
      html: 'Shoot along the hose rather than square onto it so the whole line is legible in one frame, and get the fitting ends in a second photograph. Between them, that is enough to build an exact replacement without the machine being measured at all.',
    },
    { type: 'product_embed', heading: 'Constructions whose designations appear above', skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SH', 'IH-HOSE-R13'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is the layline printed on every hydraulic hose?', answer: 'On virtually all wire-reinforced hydraulic hose, yes. Some thermoplastic and PTFE constructions carry it differently, and hose supplied in short pre-made assemblies may have had the printed section cut away — which is one more reason for a tag.' },
        { question: 'Can the layline tell me how old the hose is?', answer: 'Only if the manufacturer prints a date or lot code, and not all do. Where it is present it is usually a quarter and year. Where it is absent, age has to come from your own records or from a tag applied at build.' },
        { question: 'The layline says a pressure lower than my system. Is the hose wrong?', answer: 'Possibly, but check the bore first — the printed figure is for that size, and a larger-bore hose of the same grade carries a lower rating. If the figure really is below your working pressure at that bore, stop and have the specification reviewed before running it.' },
        { question: 'Two hoses on the same machine print different standards. Is that a problem?', answer: 'Not necessarily. Different circuits have different requirements and a well-specified machine may deliberately use a compact grade where routing is tight and a standard braid elsewhere. It becomes a problem when nobody knows why, which is what a hose register is for.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Identify what you have, then replace it from stock in Dubai.' },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Designation strings are those carried by the constructions we stock, per the Intertraco (Italia) S.p.A. catalogue. Layline layout and content are set by each manufacturer and are not governed by a standard.',
    },
    { type: 'cta_block', heading: 'Send us the photograph.', body: 'A clear shot along the layline and one of each fitting end is enough for us to identify the hose and quote an exact replacement — usually without anyone measuring anything.', quoteLabel: 'Identify from a photo' },
  ],
}

export default ARTICLE
