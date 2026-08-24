import type { BlogArticleSeed } from '../shared'

/**
 * The dash-size reference.
 *
 * The R5 exception is the reason this article is worth writing rather than
 * being a single conversion table: in HOSE_SIZE_TABLES, R5 at −08 is DN10
 * while every other grade at −08 is DN12. That offset runs through the whole
 * R5 range and it is visible in our own source data, not recalled — R5 is
 * sized on tube outside diameter, so its dash number is not the same kind of
 * number as everybody else's.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-dash-sizes',
  title: 'Hose dash sizes: −04 to −48, and the one grade where the number means something else',
  excerpt:
    'A dash size is sixteenths of an inch of bore. Except on SAE 100R5, where −08 is a 10 mm bore rather than 12 mm — because R5 is sized on tube outside diameter. Here is the full conversion, and where it breaks.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'What does −08 mean? Hydraulic hose dash sizes explained',
  seoDescription:
    'What a hydraulic hose dash size actually describes, what it does not, and the SAE 100R5 range where the number is not measuring the bore at all.',
  focusKeyword: 'what does dash size mean hydraulic hose',
  publishedAt: '2026-08-24T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A dash size is the nominal bore in sixteenths of an inch: −08 is 8/16, or half an inch.',
        'The dash number describes the inside of the hose. It says nothing about the outside, which varies by construction at the same dash.',
        'SAE 100R5 is the exception that catches people: it is sized on tube outside diameter, so −08 R5 is a DN10 bore, not DN12.',
        'Fittings and ferrules are ordered by dash size too, and a fitting dash must match the hose dash — matching it to the port thread size instead is a common and expensive error.',
        'Outside diameter is what clamps, sleeves, bulkheads and bundle spacing care about. Read it off the grade, never off the dash.',
      ],
    },
    {
      type: 'lead',
      html: 'Dash sizes are the one piece of hydraulic shorthand that genuinely is simple: divide by sixteen and you have the bore in inches. The trouble is that people extend the shorthand to things it was never describing — the outside of the hose, the port thread, and one grade where the number is not measuring the bore at all.',
    },

    { type: 'section_head', number: '/01', title: 'The conversion.', anchor: 'the-conversion' },
    {
      type: 'paragraph',
      html: 'Dash size is nominal bore in sixteenths of an inch. Nominal is doing real work in that sentence: it is the size the hose is called, and the actual bore is close to it rather than exactly it. DN is the metric nominal equivalent, and it is the figure European drawings and fittings use.',
    },
    {
      type: 'comparison_table',
      caption: 'Dash size, inch bore and DN — for every grade except SAE 100R5',
      columns: ['Dash', 'Inch bore', 'DN', 'Common name'],
      rows: [
        { cells: ['−03', '3/16"', 'DN 5', 'Three'] },
        { cells: ['−04', '1/4"', 'DN 6', 'Quarter inch'] },
        { cells: ['−05', '5/16"', 'DN 8', 'Five'] },
        { cells: ['−06', '3/8"', 'DN 10', 'Three-eighths'] },
        { cells: ['−08', '1/2"', 'DN 12', 'Half inch'] },
        { cells: ['−10', '5/8"', 'DN 16', 'Five-eighths'] },
        { cells: ['−12', '3/4"', 'DN 19', 'Three-quarter'] },
        { cells: ['−16', '1"', 'DN 25', 'One inch'] },
        { cells: ['−20', '1.1/4"', 'DN 31', 'Inch and a quarter'] },
        { cells: ['−24', '1.1/2"', 'DN 38', 'Inch and a half'] },
        { cells: ['−32', '2"', 'DN 51', 'Two inch'] },
        { cells: ['−40', '2.1/2"', 'DN 63', 'Two and a half'] },
        { cells: ['−48', '3"', 'DN 76', 'Three inch'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'If you only want the conversion, our <a href="/tools/dash-size-chart">dash size chart</a> gives it to four decimal places and nothing else. The rest of this page is about the three places where the conversion stops being the answer.',
    },
    {
      type: 'direct_answer',
      question: 'What does −08 mean on a hydraulic hose?',
      answer:
        'Eight sixteenths of an inch of nominal bore — half an inch, DN 12. The number describes the inside of the hose only. Outside diameter at −08 ranges from 17.2 mm to 23.0 mm across the grades we stock, so a clamp or bulkhead sized from the dash number alone will be wrong for most of them.',
    },

    { type: 'section_head', number: '/02', title: 'The R5 exception.', anchor: 'r5-exception' },
    {
      type: 'paragraph',
      html: 'SAE 100R5 does not follow the rule above. It is sized on <strong>tube outside diameter</strong> — the size of the rigid tube the hose was designed to replace — rather than on its own bore. The result is that an R5 dash number sits one step out from everybody else’s for most of the range.',
    },
    {
      type: 'comparison_table',
      caption: 'The same dash number, two different bores',
      columns: ['Dash', 'DN on every other grade', 'DN on SAE 100R5'],
      rows: [
        { cells: ['−04', 'DN 6', 'DN 5'] },
        { cells: ['−06', 'DN 10', 'DN 8'] },
        { cells: ['−08', 'DN 12', 'DN 10'], highlight: true },
        { cells: ['−10', 'DN 16', 'DN 12'] },
        { cells: ['−12', 'DN 19', 'DN 16'] },
        { cells: ['−16', 'DN 25', 'DN 22'] },
        { cells: ['−20', 'DN 31', 'DN 28'] },
        { cells: ['−24', 'DN 38', 'DN 35'] },
        { cells: ['−32', 'DN 51', 'DN 46'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'This is not a typographical quirk, it is a smaller hose.',
      body: 'Order −08 R5 expecting a half-inch bore and you get a hose two DN sizes down, with a correspondingly higher fluid velocity and pressure drop. On a long return line that shows up as heat rather than as an obvious fault, which is why it can run for months before anyone connects the two.',
    },

    { type: 'section_head', number: '/03', title: 'What the dash number does not tell you.', anchor: 'not-the-outside' },
    {
      type: 'paragraph',
      html: 'The most consequential misuse of a dash size is treating it as a description of the outside of the hose. It is not, and the spread is wide. Here is the same −08 bore across every construction we stock.',
    },
    {
      type: 'comparison_table',
      caption: 'Outside diameter at −08, by construction',
      columns: ['Construction', 'Outside diameter'],
      rows: [
        { cells: ['SAE 100R14 (PTFE)', '17.2 mm'] },
        { cells: ['SAE 100R5', '19.1 mm'] },
        { cells: ['SAE 100R6', '19.5 mm'] },
        { cells: ['EN 857 1SC', '20.0 mm'] },
        { cells: ['SAE 100R7', '20.3 mm'] },
        { cells: ['EN 853 1SN', '20.4 mm'] },
        { cells: ['EN 857 2SC', '20.8 mm'] },
        { cells: ['EN 853 2SN', '22.2 mm'] },
        { cells: ['EN 856 4SP', '23.0 mm'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Nearly six millimetres between the slimmest and the fattest at an identical bore. That is the difference between a bundle that fits its clamp and one that does not, and it is invisible if you specify by dash size alone. <strong>Anything that touches the outside of the hose — clamps, sleeves, spiral guard, bulkhead penetrations, bundle spacing — has to be sized from the grade’s outside diameter.</strong>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'And it does not tell you the port size either.',
      body: 'A −08 hose very often terminates in a fitting whose thread is not "size 8" in any system. Hose dash and port thread are two independent selections: the hose dash is set by the flow, and the port thread is set by whatever the component manufacturer put in the casting. A fitting is ordered as both — hose dash and port thread — and a fitting ordered on one number alone is a coin toss.',
    },

    { type: 'section_head', number: '/04', title: 'Ordering without ambiguity.', anchor: 'ordering' },
    {
      type: 'decision_tree',
      heading: 'What to state when you order',
      intro: 'Four items. Any three of them leaves something for somebody to guess.',
      branches: [
        { condition: 'Hose dash size', outcome: 'State it as the dash, not as an inch measurement of the outside.', detail: 'If you have measured rather than read it, say what you measured — a 22 mm reading is a −08 2SN or a −10 of something slimmer.' },
        { condition: 'Grade or construction', outcome: 'This is what fixes the outside diameter and therefore the ferrule.', detail: 'Two hoses at the same dash take different ferrules if the constructions differ.' },
        { condition: 'Port thread at each end', outcome: 'Independent of the hose dash — state it separately, per end.', detail: 'Both ends, even when they are the same. "Same both ends" written down is worth more than an assumption.' },
        { condition: 'Overall length and orientation', outcome: 'Length between sealing faces, plus the angle between the two ends if either is an elbow.', detail: 'Elbow orientation is the detail most often left out and most often responsible for a remake.' },
      ],
    },
    { type: 'product_embed', heading: 'Grades in the tables above', skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-R5'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a −08 hose the same as a 1/2 inch hose?', answer: 'Yes on every grade here except SAE 100R5, where −08 is a DN10 bore — closer to 3/8 inch. Everywhere else, −08 is a half-inch nominal bore, DN 12.' },
        { question: 'How do I work out the dash size of a hose I already have?', answer: 'Read the layline first — it is printed along the cover and usually states the size directly. If the print has worn off, measure the outside diameter and tell us the construction; outside diameter plus grade identifies the dash unambiguously, whereas outside diameter alone does not.' },
        { question: 'Does the fitting dash have to match the hose dash?', answer: 'Yes. The fitting dash refers to the hose it crimps onto, and it must match the hose. The port thread on the other end of that fitting is a separate selection and frequently a different-sounding size.' },
        { question: 'Why is DN 19 called three-quarter inch when 19 mm is not 3/4 of an inch?', answer: 'Both are nominal designations rounded for convenience — 3/4 inch is 19.05 mm, which is called DN 19 in the metric series. They are the same size described in two conventions, not two different sizes.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Every construction in these tables, cut and crimped to length in Dubai.' },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Bore, DN and outside diameter figures from the Intertraco (Italia) S.p.A. hydraulic hose catalogue, for the constructions we stock. The SAE 100R5 offset is as published in that source.',
    },
    { type: 'cta_block', heading: 'Not sure what size you are holding?', body: 'Send a photograph of the layline, or the outside diameter and the number of wire layers if the print has gone. We will identify the size and the grade and quote the replacement.', quoteLabel: 'Identify a hose' },
  ],
}

export default ARTICLE
