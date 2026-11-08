import type { BlogArticleSeed } from '../shared'

/**
 * How anchor chain is made. Sources: one maker's 16-step process diagram and captioned equipment photos;
 * a second maker's 14-step process page (1 mm blanking tolerance, medium-frequency bar heating, the four
 * flash-butt parameters, continuous quench-and-temper furnace with six zones held within ±5 °C, proof
 * testing a 27.5 m length in six sections) and its 2026 news pages (traceable flash welding of every
 * link, phased-array UT). The first maker's news page: almost all chain is flash welded, cast chain is
 * rare, forged chain largely gone except for accessories. No source gives quench or temper temperatures,
 * so none are stated.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-anchor-chain-is-made',
  title: 'How anchor chain is made: cutting, bending, flash-butt welding, stud setting and heat treatment',
  excerpt:
    'Almost all anchor and mooring chain is made the same way: steel bar is cut, heated, bent into a link through the one before it, flash-butt welded shut, studded, heat treated, and then every length is proof loaded. The steps in order, what each one decides about the finished chain, and what changes for offshore mooring chain.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How Anchor Chain Is Made, Step by Step',
  seoDescription:
    'How anchor chain is made: bar cutting, heating, bending, flash-butt welding, stud setting, quench-and-temper heat treatment, proof testing and NDT.',
  focusKeyword: 'how anchor chain is made',
  publishedAt: '2026-11-08T09:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Anchor chain is made from round steel bar, one link at a time: cut, heated, bent through the previous link, then flash-butt welded shut.',
        'Almost all chain today is flash welded. Cast chain is rare and forged chain has largely disappeared — though most shackles and swivels are still forged.',
        'Studs are set after welding, and the whole chain is then quenched and tempered in a continuous furnace to reach its grade.',
        'Every 27.5 m length is proof loaded; samples are broken; offshore chain is also examined link by link with non-destructive testing.',
        'The weld is the critical point: its quality is controlled by current, flashing, upset length and upset pressure, and makers now record the parameters of every link.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain is only as strong as its worst link, and a mooring line may have thousands of them. That is why chain making is a tightly controlled sequence rather than a craft: the same bar length, the same temperature, the same weld cycle and the same heat treatment for every link in a batch. Here is the sequence two chain makers publish for their lines, and what each step does.',
    },
    {
      type: 'direct_answer',
      question: 'How is anchor chain manufactured?',
      answer:
        'Steel bar is cut to length, heated and bent into a link that is threaded through the previous one. The open joint is flash-butt welded and the weld upset is trimmed. Studs are pressed in for stud link chain. The chain is quenched and tempered, shot blasted, and every 27.5 m length is proof tested, with sample links break tested. Offshore chain is also examined by NDT and marked.',
    },

    { type: 'section_head', number: '/01', title: 'The sequence.', anchor: 'sequence' },
    {
      type: 'comparison_table',
      caption: 'Chain making, step by step (a maker’s published 16-step process, condensed)',
      columns: ['Step', 'What happens', 'Why it matters'],
      rows: [
        { cells: ['1. Bar and cutting', 'Round bar is checked on arrival and cut to length — one maker holds the cut to 1 mm', 'A wrong length gives a wrong link shape and diameter'] },
        { cells: ['2. Heating', 'The bar is heated in a temperature-controlled medium-frequency furnace', 'Every bar in a batch bends at the same temperature'] },
        { cells: ['3. Bending', 'The hot bar is bent into a link through the last link made', 'Sets the link’s length and width'] },
        { cells: ['4. Flash-butt welding', 'The two bar ends are flashed and forged together', 'The weld is the most critical point of the link'] },
        { cells: ['5. Trimming', 'The upset metal around the weld is sheared off', 'Leaves a clean, even bar section'] },
        { cells: ['6. Stud setting', 'A stud is pressed into each link of stud link chain', 'Holds the link open under load'] },
        { cells: ['7. Heat treatment', 'Continuous quench and temper', 'Brings the steel to its grade’s strength and toughness'] },
        { cells: ['8. Shot blasting', 'Scale is blasted off', 'Prepares the surface for inspection and coating'] },
        { cells: ['9. Proof and break tests', 'Every length is proof loaded; samples are pulled to the breaking load', 'Proves the chain before it leaves the works'] },
        { cells: ['10. Offshore extras', 'Stud expansion check, NDT of every link, marking', 'Mooring chain stays under load for decades'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Makers do not all run the steps in quite the same order — one publishes shot blasting before heat treatment in one diagram and after it in another — but the logic is the same everywhere: form and weld the link, give it its strength by heat treatment, then prove it by load.',
    },

    { type: 'section_head', number: '/02', title: 'Flash-butt welding.', anchor: 'flash-butt' },
    {
      type: 'paragraph',
      html: 'In flash-butt welding the two ends of the bent bar are clamped and brought together under a high current. Contact points melt and are expelled in a shower of sparks — the flash — until the faces are evenly hot, and then the ends are forced together hard, upsetting the metal and squeezing out oxides. Four settings control the result: the welding current, the flashing, the upset length and the upset pressure. Modern lines are computer controlled and record the weld curve of every link, so a bad weld can be traced to its place in the chain. One maker reports raising its weld qualification rate from 95% to 100% by tuning those four parameters.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Why not forged or cast chain?',
      body: 'Forged and cast chain were once common. Flash-butt welding makes a stronger, more consistent link at far lower cost, and it has largely replaced both for chain itself. Shackles, swivels and other accessories, with their more complex shapes, are still mostly forged.',
    },

    { type: 'section_head', number: '/03', title: 'Heat treatment.', anchor: 'heat-treatment' },
    {
      type: 'paragraph',
      html: 'The welded chain runs through a continuous furnace at a steady speed: it is heated, quenched and tempered. One maker’s furnace has six quenching zones held within ±5 °C of their set point, fired by gas under automatic control. Quenching hardens the steel; tempering trades some hardness back for toughness. The result has to meet the grade’s tensile, yield, elongation and Charpy minimums — see <a href="/blog/offshore-mooring-chain-grades-r3-r4-r5">mooring chain grades</a>. The temperatures themselves are each mill’s qualified procedure and are approved by the classification society.',
    },

    { type: 'section_head', number: '/04', title: 'Testing and finishing.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Each 27.5 m length is proof loaded in a tensile machine; one maker pulls the length in six sections rather than all at once, to load every link evenly. Sample links are break tested, test pieces are cut for tensile and impact tests, and for offshore chain every link is examined by non-destructive testing — one maker now uses phased-array ultrasonic inspection — and measured. The chain is then painted or coated, marked and certified. The detail is in <a href="/blog/anchor-chain-testing-proof-break-ndt">anchor chain testing</a> and <a href="/blog/anchor-chain-marking-and-certificates">chain marking and certificates</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is anchor chain welded or forged?', answer: 'Almost all anchor and mooring chain is flash-butt welded. Forged chain has largely disappeared, though most accessories are forged.' },
        { question: 'What is flash-butt welding?', answer: 'A resistance welding process in which the bar ends are heated by flashing under high current and then forged together under pressure, with no filler metal.' },
        { question: 'When are the studs fitted?', answer: 'After welding and trimming, before heat treatment.' },
        { question: 'Why is chain heat treated?', answer: 'Quenching and tempering give the steel the strength and toughness its grade requires.' },
        { question: 'Is every link tested?', answer: 'Every length is proof loaded, which loads every link. Offshore chain is also examined link by link by NDT. Breaking tests are made on samples.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Chain from the mill',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-SACGU1U2U', 'IH-MR-MC-SL', 'IH-MR-MC-SS'],
    },
    { type: 'category_link', slug: 'offshore-mooring-chain', label: 'Offshore mooring chain', blurb: 'Stud link and studless chain in grades ORQ to R5.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-testing-proof-break-ndt', 'offshore-mooring-chain-grades-r3-r4-r5', 'anchor-chain-marking-and-certificates', 'stud-link-vs-studless-chain'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Process steps, welding parameters and furnace control as published by two chain makers. Heat-treatment temperatures are mill procedures approved by the classification society and are not given here.',
    },
    {
      type: 'cta_block',
      heading: 'Need chain with mill traceability?',
      body: 'Send the size, grade, type and length. We will quote class-certified chain with the mill’s test records.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
