import type { BlogArticleSeed } from '../shared'

/**
 * Pillar A anchor. The thesis — SAE 100R is a catalogue of unrelated
 * specifications, not a strength ladder — is evidenced entirely from our own
 * stocked range: R6 at 28 bar sits four designations above R2AT at 400 bar.
 *
 * Grades we do not stock are named but carry NO pressure figures. Publishing
 * a remembered number for a hose we have never handled is exactly the failure
 * this article warns readers about.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sae-100r-hose-types',
  title: 'SAE 100R types: the numbers are a catalogue, not a ranking',
  excerpt:
    'R6 is rated 28 bar. R2AT is rated 400 bar. The higher number is fourteen times weaker. Here is what each SAE 100R designation actually specifies, and why the sequence tells you nothing about strength.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'SAE 100R hose types explained — R1 to R17, with real figures',
  seoDescription:
    'What each SAE 100R designation means: construction, reinforcement and working pressure for R1AT, R2AT, R5, R6, R7, R13, R14 and R15, with per-size figures from a published catalogue.',
  focusKeyword: 'sae 100r hose types',
  publishedAt: '2026-08-24T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'SAE 100R is a list of separate specifications that happen to share a prefix. The number is an index, not a grade.',
        'R6 — a textile-reinforced hose rated 28 bar — carries a higher number than R2AT, which is rated 400 bar.',
        'The designation tells you the construction, not the pressure. Pressure depends on construction AND bore, and both have to be read together.',
        'Four different reinforcement families sit inside the same numbering: wire braid, wire spiral, textile braid and thermoplastic or PTFE.',
        'An AT suffix (R1AT, R2AT) means the hose meets the standard with a thinner cover and a smaller outside diameter than the original R1 or R2.',
      ],
    },
    {
      type: 'lead',
      html: 'Somebody asks for “a hundred-R-nine hose” because the machine had R7 on it and they want something stronger. It is a reasonable-sounding request built on a wrong assumption, and it is the single most common misunderstanding about hydraulic hose specification.',
    },

    { type: 'section_head', number: '/01', title: 'The numbers are not a scale.', anchor: 'not-a-scale' },
    {
      type: 'paragraph',
      html: 'SAE J517 defines a series of hose specifications, each given a 100R number as it was added. The numbers were allocated in roughly the order the constructions were standardised, which is not the order of anything a buyer cares about — not pressure, not size, not quality, not price. <strong>Reading the sequence as a ranking produces exactly the wrong answer.</strong>',
    },
    {
      type: 'paragraph',
      html: 'The clearest demonstration comes from two grades we stock. R6 is a textile-braid hose for return and suction lines. R2AT is a two-wire-braid hose for high-pressure service. R6 has the higher number.',
    },
    {
      type: 'comparison_table',
      caption: 'Higher number, lower pressure — both at −08 (1/2 in bore)',
      columns: ['Designation', 'Reinforcement', 'Working pressure', 'Burst'],
      rows: [
        { cells: ['SAE 100R2AT', 'Two wire braids', '275 bar', '1,100 bar'], highlight: true },
        { cells: ['SAE 100R6', 'One textile braid', '28 bar', '112 bar'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Ten times the working pressure, four designations lower. The two hoses are not competitors and were never meant to be compared — R6 exists to return oil to tank at low pressure without costing what a wire hose costs. But nothing in the numbering says so.',
    },
    {
      type: 'direct_answer',
      question: 'Is a higher SAE 100R number a stronger hose?',
      answer:
        'No. The numbers are an index of separate specifications, allocated roughly in the order they were standardised. SAE 100R6 is rated 28 bar and SAE 100R2AT is rated 400 bar at its smallest size, despite the lower number. Read the construction and the per-size pressure table, never the designation number.',
    },

    { type: 'section_head', number: '/02', title: 'The four families inside the numbering.', anchor: 'four-families' },
    {
      type: 'paragraph',
      html: 'Every 100R designation belongs to one of four reinforcement families, and the family is what actually predicts behaviour — pressure capability, bend radius, weight and price all follow from it.',
    },
    {
      type: 'comparison_table',
      caption: 'The reinforcement families, with the grades we stock in each',
      columns: ['Family', 'How it is built', 'Grades we stock', 'What it is for'],
      rows: [
        { cells: ['Wire braid', 'One or two braided steel layers', 'R1AT, R2AT', 'General high-pressure service'] },
        { cells: ['Wire spiral', 'Four or six helically wrapped layers', 'R13, R15', 'Large bore at high pressure, impulse duty'] },
        { cells: ['Textile', 'Braided fibre, sometimes over one wire braid', 'R5, R6', 'Return, suction, low-pressure lines'] },
        { cells: ['Thermoplastic / PTFE', 'Extruded core, fibre or wire reinforced', 'R7, R14', 'Chemical resistance, tight routing, heat'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'What the AT suffix means.',
      body: 'R1AT and R2AT are the same reinforcement as R1 and R2 built to a reduced outside diameter with a thinner cover. The working pressures are the same; the hose is slimmer, lighter and takes a different ferrule. If a machine was built around R2 and you fit R2AT, check the fitting and clamp sizing rather than assuming they carry across.',
    },

    { type: 'section_head', number: '/03', title: 'Working pressure for every grade we stock.', anchor: 'the-figures' },
    {
      type: 'paragraph',
      html: 'Figures are from the Intertraco catalogue for the constructions we carry. Every one is quoted at a stated bore, because a grade does not have a single working pressure — it has one per size, and the spread across a grade is often several-fold.',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure in bar, by dash size — wire-reinforced grades',
      columns: ['Designation', '−04', '−08', '−12', '−16', '−24', '−32'],
      rows: [
        { cells: ['R1AT / EN 853 1SN', '225', '160', '105', '88', '50', '40'] },
        { cells: ['R2AT / EN 853 2SN', '400', '275', '215', '165', '90', '80'] },
        { cells: ['R13 (4/6 spiral)', '—', '—', '350', '350', '350', '350'], highlight: true },
        { cells: ['R15 (6 spiral)', '—', '—', '420', '420', '420', '420'], highlight: true },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure in bar, by dash size — textile and thermoplastic grades',
      columns: ['Designation', '−04', '−06', '−08', '−12', '−16'],
      rows: [
        { cells: ['R5 (textile over wire)', '210', '155', '140', '105', '56'] },
        { cells: ['R6 (textile braid)', '28', '28', '28', '21', '20'] },
        { cells: ['R7 (thermoplastic)', '200', '175', '140', '90', '70'] },
        { cells: ['R14 (PTFE)', '175', '135', '120', '90', '65'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read the spiral rows across and the reason spiral construction exists becomes obvious: <strong>R13 holds 350 bar at every size it is made in, and R15 holds 420.</strong> The braided grades lose four fifths of their rating over the same range. That single difference is why large-bore high-pressure circuits are spiral and why substituting braid at −32 to save money is not a compromise, it is a mistake.',
    },

    { type: 'section_head', number: '/04', title: 'The designations we do not stock.', anchor: 'not-stocked' },
    {
      type: 'paragraph',
      html: 'The 100R series runs beyond the grades above — R3, R4, R8, R9, R10, R12, R16 and R17 all exist, and several are in common use. <strong>We are not going to publish pressure figures for hose we do not carry.</strong> Numbers for those grades vary between manufacturers, and a remembered figure printed on a supplier’s website is precisely the sort of thing that ends up specified into a machine.',
    },
    {
      type: 'paragraph',
      html: 'If you are working to one of those designations, the datasheet for the hose actually being fitted is the only source worth using. If you tell us the designation, the bore and the pressure, we will tell you which of the constructions we carry is a genuine equivalent — and say so plainly when none of them is.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A designation alone is not a specification.',
      body: 'Two hoses can both meet SAE 100R2AT and differ in cover compound, temperature range, bend radius and fitting compatibility. The standard sets minimum performance, not a recipe. When a drawing says "R2AT" and nothing else, the drawing is incomplete — bore, temperature range, fluid and fitting termination all still need answering.',
    },

    { type: 'section_head', number: '/05', title: 'How to specify without using the number as a shortcut.', anchor: 'specifying' },
    {
      type: 'decision_tree',
      heading: 'Four questions, in this order',
      intro: 'Answer them in sequence. Each one narrows what the next can be.',
      branches: [
        { condition: 'Bore is fixed by the flow the circuit needs', outcome: 'Settle the bore before anything else — it decides which grades are even offered.', detail: 'Several grades do not exist below −10 or above −16. Choosing a designation first can commit you to a bore the circuit does not want.' },
        { condition: 'Working pressure is known at that bore', outcome: 'Compare candidate grades only at that bore, never on headline figures.', detail: 'A catalogue headline is almost always the value at the smallest size in the range. Two grades quoted at different bores are not comparable numbers.' },
        { condition: 'Routing is tighter than the grade’s bend radius', outcome: 'Move to a compact construction rather than forcing the bend.', detail: 'At −08, EN 857 2SC bends to 90 mm where EN 853 2SN needs 180 mm — the same pressure class in half the space.', sku: 'IH-HOSE-2SC' },
        { condition: 'Fluid or temperature is out of the ordinary', outcome: 'Tube compound decides this, and it can rule out a grade that passed on pressure.', detail: 'PTFE and thermoplastic constructions exist for exactly the cases where a nitrile tube will not survive. Gulf ambient counts here as much as fluid temperature.', sku: 'IH-HOSE-R14' },
      ],
    },
    {
      type: 'paragraph',
      html: 'Answer those four and the designation falls out at the end as a result. Start from the designation and you are choosing a hose by the order in which a committee happened to standardise it.',
    },
    { type: 'product_embed', heading: 'The grades in these tables', skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-R13', 'IH-HOSE-R15', 'IH-HOSE-R5', 'IH-HOSE-R7-TP'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between SAE 100R1 and SAE 100R1AT?', answer: 'Same single wire braid and the same working pressures; R1AT is built to a smaller outside diameter with a thinner cover. The practical differences are ferrule selection, clamp sizing and how much room the hose needs in a bundle.' },
        { question: 'Is SAE 100R2AT the same as EN 853 2SN?', answer: 'The constructions we stock are certified to both, and the catalogue lists them as one product. They are separate standards published by separate bodies with closely aligned requirements, so a hose can meet both — but "equivalent" is a claim about a specific product, not about the two standards in general.' },
        { question: 'Which SAE grade replaces a four-spiral EN 856 4SP hose?', answer: 'There is no clean one-to-one swap. 4SP and 4SH are EN 856 constructions; the nearest SAE spiral grades are R12, R13 and R15, and which one fits depends on the bore and pressure you actually need. Compare at the bore, not by designation.' },
        { question: 'Why do two suppliers quote different pressures for the same 100R number?', answer: 'Because the standard sets a minimum, not a fixed value, and because headline figures are usually quoted at the smallest bore in the range. Check which size the number belongs to before treating two quotes as comparable.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Braid, compact, spiral, textile and thermoplastic constructions, stocked in Dubai.' },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Pressure and size figures from the Intertraco (Italia) S.p.A. hydraulic hose catalogue, for the constructions we stock. Confirm against the datasheet for the assembly actually supplied.',
    },
    { type: 'cta_block', heading: 'Working to a designation you cannot source?', body: 'Send the designation, the bore, the working pressure and a photograph of the old hose. We will tell you which construction in our range genuinely matches it — and say so if none does.', quoteLabel: 'Ask about a grade' },
  ],
}

export default ARTICLE
