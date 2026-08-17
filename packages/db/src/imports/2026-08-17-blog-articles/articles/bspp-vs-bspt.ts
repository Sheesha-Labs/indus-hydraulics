import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'bspp-vs-bspt',
  title: 'BSPP vs BSPT: why a parallel thread needs a seal and a tapered one does not',
  excerpt:
    'They share a thread form and a size designation, and they do not seal the same way. How to tell them apart on the bench, and what happens when they are mixed.',
  categorySlug: 'fitting-identification',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'BSPP vs BSPT — difference, identification and what interchanges',
  seoDescription:
    'BSPP is parallel and seals on a cone or bonded washer. BSPT is tapered and seals on the threads. How to tell them apart, and why mixing them leaks.',
  focusKeyword: 'bspp vs bspt difference',
  publishedAt: '2026-08-17T07:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'BSPP and BSPT share the same 55° Whitworth thread form and the same size designation. Only the taper differs.',
        'BSPP is parallel and seals on a separate feature — a 60° cone seat or a bonded washer. The threads only clamp.',
        'BSPT is tapered and seals on thread interference, which needs a sealant and is why it must not be repeatedly re-made.',
        'A parallel male in a tapered female will bottom out and leak. It is a common field substitution and it does not work.',
        'Measure the crest diameter at the first and last thread. If it changes, it is tapered.',
      ],
    },
    {
      type: 'lead',
      html: 'Two fittings marked <strong>1/2 BSP</strong>, from the same drawer, that will not do the same job. The designation refers to the thread size only — it says nothing about whether the thread is parallel or tapered, and that is the property which decides how the joint seals.',
    },

    { type: 'section_head', number: '/01', title: 'The same thread, cut two ways.', anchor: 'same-thread', },
    {
      type: 'paragraph',
      html: 'Both are Whitworth-form threads with a 55° included angle and the same threads-per-inch for a given size. Put a pitch gauge on them and you get the same reading. The difference is that BSPP is cut parallel along its length and BSPT is cut on a taper, so a BSPT thread grows in diameter from the leading thread backwards.',
    },
    {
      type: 'comparison_table',
      caption: 'BSPP and BSPT compared',
      columns: ['Property', 'BSPP (parallel)', 'BSPT (tapered)'],
      rows: [
        { cells: ['Thread form', '55° Whitworth', '55° Whitworth'] },
        { cells: ['Profile along the thread', 'Constant diameter', 'Increasing diameter'] },
        { cells: ['What makes the seal', '60° cone seat, or a bonded washer under the head', 'Interference between the threads themselves'] },
        { cells: ['Needs a sealant', 'No', 'Yes'] },
        { cells: ['Re-makeable', 'Yes — the sealing face is reusable', 'Limited — each make deforms the threads'], highlight: true },
        { cells: ['Reference standard', 'ISO 228-1', 'ISO 7-1'] },
      ],
    },
    {
      type: 'standard_citation',
      standard: 'ISO 228-1',
      publisher: 'ISO',
      title:
        'Pipe threads where pressure-tight joints are not made on the threads — Part 1: Dimensions, tolerances and designation',
      summary:
        'The title carries the whole argument. This is the parallel-thread standard, and it states in its own name that the joint is not sealed by the threads — which is precisely why a BSPP connection needs a cone seat or a bonded washer to function at all.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 7-1',
      publisher: 'ISO',
      title:
        'Pipe threads where pressure-tight joints are made on the threads — Part 1: Dimensions, tolerances and designation',
      summary:
        'The tapered counterpart, and note the inverted title. Here the threads do make the joint, with a sealant, which is what limits how many times a BSPT connection can be broken and re-made before it stops sealing.',
    },

    { type: 'section_head', number: '/02', title: 'Telling them apart.', anchor: 'telling-them-apart' },
    {
      type: 'direct_answer',
      question: 'How do you tell BSPP from BSPT?',
      answer:
        'Measure across the thread crests at the first thread and again at the last. A parallel thread reads the same at both ends; a tapered one grows measurably along its length. On a female port, look for a cone seat — a 60° seat means the port is designed for a parallel male.',
    },
    {
      type: 'paragraph',
      html: 'On smaller sizes the taper is easy to miss by eye, which is how the substitution happens. A caliper settles it in seconds. On a female port the giveaway is the seat: a machined cone means the port expects a parallel male and a cone-seated fitting to seal against it.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A parallel male will start into a tapered female.',
      body: 'It will engage, take a wrench, and feel tight, because the tapered female closes on it. The threads are not sealing against a matching taper and the joint will weep under pressure — usually after the machine has gone back to work.',
    },

    {
      type: 'product_embed',
      heading: 'BSP fittings we stock',
      skus: ['IH-BSP-FEM-60-45', 'IH-BSP-FEM-60-90'],
      note: 'Both are female 60° cone — the parallel-thread pattern. If the port on your machine is tapered, you need the BSPT equivalent instead; send us a photo and we will confirm which.',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is "G" thread the same as BSPP?', answer: 'Yes. The G designation from ISO 228-1 is the parallel thread. "R" is the tapered external thread and "Rc" the tapered internal one under ISO 7-1.' },
        { question: 'Can I use PTFE tape on a BSPP joint?', answer: 'It will not do what you want. The seal on a parallel joint is the cone or the bonded washer; tape on the threads adds nothing and can hold the fitting off its seat. If a BSPP joint leaks, look at the seat and the washer.' },
        { question: 'How many times can a BSPT joint be re-made?', answer: 'Fewer than people assume. Each make deforms the mating threads slightly, so sealing degrades with every break. If a tapered joint has been disturbed several times and still weeps, replace the fitting rather than adding sealant.' },
        { question: 'Is BSP the same as NPT?', answer: 'No, and this is the more damaging mix-up. BSP is a 55° thread form and NPT is 60°, so the flanks never mate properly even when the sizes appear compatible. They will start together and the joint will leak.' },
      ],
    },

    { type: 'category_link', slug: 'hoses-fittings', label: 'BSP fittings and adapters', blurb: 'Parallel and tapered BSP, plus adapters into JIC, ORFS and metric.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Thread geometry checked against ISO 228-1 and ISO 7-1. No pressure ratings published here.' },
    { type: 'cta_block', heading: 'Not sure which one you have?', body: 'Photograph the thread against a rule and send it over. We identify fittings from photographs every day.', quoteLabel: 'Identify my fitting' },
  ],
}

export default ARTICLE
