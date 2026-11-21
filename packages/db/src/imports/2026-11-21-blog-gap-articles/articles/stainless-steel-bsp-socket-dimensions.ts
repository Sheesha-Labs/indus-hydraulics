import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: thread designations, TPI, pitch and major/minor diameters from ISO 228-1
 * (parallel, G) and ISO 7-1 (taper, R / Rc / Rp), which share the same basic profile and diameters.
 * Product ranges, materials and the only published body dimensions (L, Y, D1, D2 on IH-SS-9240) come
 * from the live listings on stainless-steel-bsp-metric-adapters and stainless-steel-pipe-nipples.
 * No pressure rating, wall thickness, hex size or socket length is given for the F×F adapter because
 * the listings publish none.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-bsp-socket-dimensions',
  title: 'Stainless steel BSP socket dimensions: thread sizes, TPI and diameters by size',
  excerpt:
    'A BSP socket is sized by its thread, not its outside. The ISO 228-1 and ISO 7-1 thread data for every common size, how parallel and taper sockets differ, and the stainless BSP female fittings we list from 1/8" to 2-1/2".',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel BSP Socket Dimensions: Size Chart',
  seoDescription:
    'Stainless steel BSP socket dimensions: thread size, TPI, pitch and major and minor diameters to ISO 228-1 and ISO 7-1, parallel vs taper, 1/8" to 2-1/2".',
  focusKeyword: 'stainless steel bsp socket dimensions',
  publishedAt: '2026-11-21T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the dimensions of a stainless steel BSP socket?',
      answer:
        'A BSP socket is defined by its female thread. Under ISO 228-1 a 1/2" socket has a G1/2 thread at 14 TPI, a 20.955 mm major diameter and an 18.631 mm minor diameter; 1/4" and 3/8" run at 19 TPI, 1" to 2" at 11 TPI. Body length, hex and wall thickness are set by the maker, not the thread standard.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The nominal size of a BSP socket is not a measurement. A 1/2" socket takes a male thread about 21 mm across, not 12.7 mm.',
        'Thread pitch steps with size: 28 TPI at 1/8", 19 TPI at 1/4" and 3/8", 14 TPI from 1/2" to 3/4", and 11 TPI from 1" upwards.',
        'Parallel (G, ISO 228-1) and taper (R, ISO 7-1) share the same diameters and pitch. What differs is how they seal: a parallel socket needs a bonded seal, O-ring or cone; a taper joint seals on the thread.',
        'Body length, hex and wall are maker dimensions. On our stainless BSP shelf only one listing publishes them, so ask for a drawing if a socket has to fit a space.',
        'No pressure rating is published for the stainless BSPP female × female adapter. Do not assume one from the thread.',
      ],
    },
    {
      type: 'lead',
      html: 'Search for BSP socket dimensions and you mostly find charts of outside diameters copied from a single catalogue. They are not much use, because the outside of a socket depends on who made it. What every BSP socket of a given size shares is its thread. This article gives the thread data for each size from ISO 228-1 and ISO 7-1, explains when a socket is parallel and when it is taper, and lists the stainless BSP female fittings on our <a href="/c/stainless-steel-bsp-metric-adapters">stainless steel BSP and metric adapters</a> shelf. For the sealing side in more depth, read <a href="/blog/bspp-vs-bspt">BSPP vs BSPT</a>.',
    },
    { type: 'section_head', number: '/01', title: 'The size chart.', anchor: 'size-chart' },
    {
      type: 'paragraph',
      html: 'The table gives the basic dimensions from ISO 228-1. ISO 7-1 uses the same pitch and the same basic major diameter, measured at the gauge plane of the taper, so the figures hold for both. The minor diameter is the root of the male thread and the crest of the female thread, which is the figure that matters when you check a socket bore with a caliper.',
    },
    {
      type: 'comparison_table',
      caption: 'BSP thread dimensions by size (basic values, ISO 228-1 and ISO 7-1)',
      columns: ['Size', 'Parallel / taper designation', 'TPI', 'Pitch (mm)', 'Major diameter (mm)', 'Minor diameter (mm)'],
      rows: [
        { cells: ['1/8"', 'G1/8 / R1/8, Rc1/8, Rp1/8', '28', '0.907', '9.728', '8.566'] },
        { cells: ['1/4"', 'G1/4 / R1/4, Rc1/4, Rp1/4', '19', '1.337', '13.157', '11.445'] },
        { cells: ['3/8"', 'G3/8 / R3/8, Rc3/8, Rp3/8', '19', '1.337', '16.662', '14.950'] },
        { cells: ['1/2"', 'G1/2 / R1/2, Rc1/2, Rp1/2', '14', '1.814', '20.955', '18.631'], highlight: true },
        { cells: ['5/8"', 'G5/8 (parallel only; not in ISO 7-1)', '14', '1.814', '22.911', '20.587'] },
        { cells: ['3/4"', 'G3/4 / R3/4, Rc3/4, Rp3/4', '14', '1.814', '26.441', '24.117'] },
        { cells: ['1"', 'G1 / R1, Rc1, Rp1', '11', '2.309', '33.249', '30.291'] },
        { cells: ['1-1/4"', 'G1-1/4 / R1-1/4, Rc1-1/4, Rp1-1/4', '11', '2.309', '41.910', '38.952'] },
        { cells: ['1-1/2"', 'G1-1/2 / R1-1/2, Rc1-1/2, Rp1-1/2', '11', '2.309', '47.803', '44.845'] },
        { cells: ['2"', 'G2 / R2, Rc2, Rp2', '11', '2.309', '59.614', '56.656'] },
        { cells: ['2-1/2"', 'G2-1/2 / R2-1/2, Rc2-1/2, Rp2-1/2', '11', '2.309', '75.184', '72.226'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two quick checks follow from the chart. Count the threads over 25.4 mm: 19 means 1/4" or 3/8", 14 means 1/2" to 3/4", 11 means 1" or larger. Then measure across the crests of the male part, or the bore of the socket, and pick the nearest diameter. The 3/8" and 1/2" sizes are the ones most often confused with NPT, because 1/2" BSP and 1/2" NPT are both 14 TPI. The thread angle differs (55° for BSP, 60° for NPT), and the threads will start but not seal.',
    },
    { type: 'section_head', number: '/02', title: 'Parallel or taper socket.', anchor: 'parallel-taper' },
    {
      type: 'paragraph',
      html: 'ISO 228-1 covers parallel threads that do not seal on the thread, marked G. ISO 7-1 covers threads that do seal on the thread: R for a taper male, Rc for a taper female and Rp for a parallel female. A pipe socket made to ISO 7-1 is often Rp, a parallel female thread that seals against a taper R male with sealant or tape. A hydraulic BSPP socket is G: the thread only holds the joint together, and the seal comes from a bonded seal, an O-ring or a cone seat.',
    },
    {
      type: 'paragraph',
      html: 'That difference matters when you replace a socket. A G socket and an Rp socket of the same size share the same diameters, so a male part will screw into either. But a G thread carries no tolerance for sealing on the flanks, so a taper male run into a G socket with tape may weep, and a parallel male in an Rp socket has nothing to seal against without a face seal. Match the socket to the seal you intend to use. The <a href="/blog/bsp-hydraulic-adapters-guide">BSP hydraulic adapters guide</a> covers bonded seals, ED seals and 60° cones in detail.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Socket can mean three things',
      body: 'In hydraulics a BSP socket is usually a female × female threaded adapter. In pipework it is a threaded coupling to a pipe-fitting standard, and a socket-weld fitting is a different thing again, with a plain bore for welding. If you are buying 150# or 3000# threaded pipe fittings, read our article on stainless threaded pipe fittings, which covers couplings and socket weld ends.',
    },
    { type: 'section_head', number: '/03', title: 'What our stainless BSP listings hold.', anchor: 'listings' },
    {
      type: 'paragraph',
      html: 'On our shelf the straight BSP socket is the <a href="/p/stainless-steel-bspp-female-x-bspp-female-adapter">BSPP female × BSPP female adapter</a>, in forged 316L, with eight part numbers from 1/8" to 1-1/2". Both ends are G threads to ISO 228-1. The other female BSP parts are listed below with the ranges their size tables give.',
    },
    {
      type: 'comparison_table',
      caption: 'Stainless BSP female fittings on the stainless steel BSP and metric adapters shelf',
      columns: ['Listing', 'Female end', 'Other end', 'Sizes listed', 'Material'],
      rows: [
        { cells: ['BSPP female × BSPP female adapter', 'G, ISO 228-1', 'G female', '1/8" to 1-1/2" (8 sizes, no 5/8")', '316L, forged'] },
        { cells: ['BSPP female swivel cap', 'G, ISO 228-1', 'Closed', '1/8" to 1-1/2"', 'Stainless steel'] },
        { cells: ['BSPP male × BSPP female swivel adapter', 'G, 1/8" to 1-1/2"', 'G male, 1/4" to 1-1/2"', '10 combinations', 'Stainless steel'] },
        { cells: ['NPT male × BSPP female adapter', 'G, 1/8" to 2-1/2"', 'NPT male, ASME B1.20.1', '9 sizes, same size both ends', 'Stainless steel'] },
        { cells: ['JIC 37° male × BSPP female swivel adapter', 'G, 1/4" to 1"', 'JIC 37° male, SAE J514', '7 combinations', '316L, forged'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Only the <a href="/p/stainless-steel-jic-37-male-x-bspp-female-swivel-adapter">JIC 37° male × BSPP female swivel adapter</a> publishes body dimensions. Its size table gives an overall length L, a Y dimension and bores D1 and D2 in millimetres for four of its seven sizes. They are reproduced here as listed. If you need the same figures for the plain socket, ask and we send the drawing.',
    },
    {
      type: 'comparison_table',
      caption: 'Published dimensions, JIC 37° male × BSPP female swivel adapter (mm, as listed)',
      columns: ['JIC end', 'BSPP end', 'L', 'Y', 'D1', 'D2'],
      rows: [
        { cells: ['1/4" (7/16-20)', 'G1/4', '33.3', '14', '4.4', '4.4'] },
        { cells: ['3/8" (9/16-18)', 'G3/8', '35.1', '19', '7.5', '7.1'] },
        { cells: ['1/2" (3/4-16)', 'G1/2', '43.2', '22', '9.9', '9.9'] },
        { cells: ['3/4" (1-1/16-12)', 'G3/4', '49.3', '27', '15.5', '15.5'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'A parallel socket needs a seal. The <a href="/p/stainless-steel-bonded-seal-bspp">stainless BSPP bonded seal</a> is listed from 1/8" to 2", and the article on <a href="/blog/bspp-bonded-seal-sizing">BSPP bonded seal sizing</a> explains how to pick one. To close a socket, use a <a href="/p/stainless-steel-bspp-hex-head-plug">BSPP hex head plug</a> with a seal, or a BSPT plug where the socket is taper. To join two sockets, the <a href="/p/stainless-steel-bspp-male-nipple">BSPP male nipple</a> runs from 1/8" to 2".',
    },
    { type: 'section_head', number: '/04', title: 'Pressure and material.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'The thread standard does not give a pressure rating, and none of the stainless BSP socket listings on this shelf publishes one. The rating of a joint depends on the body wall, the material and the seal, so it comes from the maker for each part. If your line has a design pressure, send it with the enquiry and we confirm what the part is rated for before you order. On material, the female × female adapter and the JIC × BSPP swivel are forged 316L; the others are listed as stainless steel without a grade. For when the grade matters, see <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316 stainless steel fittings</a>. The full range sits on the <a href="/c/stainless-steel-bsp-metric-adapters">stainless BSP and metric adapters</a> shelf, and stainless NPT nipples on the <a href="/c/stainless-steel-pipe-nipples">stainless steel pipe nipples</a> shelf.',
    },
    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li>The thread on each end, with size and form: G (parallel) or R/Rc/Rp (taper), or NPT if one end is American.</li><li>The thread count over 25.4 mm and a caliper reading across the crests, if the old part is unmarked.</li><li>How the joint seals: bonded seal, O-ring, cone seat or thread sealant.</li><li>The working pressure and the fluid.</li><li>The grade you need, 304, 316 or 316L, and whether you need a material certificate.</li><li>Quantities per size.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What size is a 1/2" BSP socket thread?',
          answer: 'A 1/2" BSP thread has a 20.955 mm major diameter, an 18.631 mm minor diameter and 14 threads per inch (1.814 mm pitch), to ISO 228-1 for parallel and ISO 7-1 for taper. The 1/2" is the nominal pipe size, not a measurement.',
        },
        {
          question: 'Are stainless steel BSP fittings parallel or taper?',
          answer: 'Both exist. Hydraulic BSP fittings are usually BSPP (G, ISO 228-1) and seal with a bonded seal, O-ring or cone. Pipe fittings are often taper, R male and Rc or Rp female to ISO 7-1, sealed on the thread with tape or sealant. Our stainless BSP shelf holds both BSPP and BSPT parts.',
        },
        {
          question: 'Can I screw a BSPT male into a BSPP socket?',
          answer: 'The threads share the same diameters and pitch, so they engage. ISO 7-1 does allow a taper male into a parallel Rp female for a thread seal. Into a G socket made for a face seal the joint is unreliable. Match the socket to the seal.',
        },
        {
          question: 'Do you have stainless steel adaptors from BSP to NPT?',
          answer: 'Yes. The shelf lists BSPP male × NPT female and male, NPT male × BSPP female, and BSPT male × NPT female and male adapters in stainless steel. Their size tables give the size on each end.',
        },
        {
          question: 'What pressure is a stainless BSP socket rated for?',
          answer: 'The thread standard does not set one, and our stainless BSPP female × female adapter listing does not publish one. Send your working pressure and we confirm the rating with the part before you order.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Stainless BSP sockets, seals and plugs',
      skus: ['IH-SS-9043', 'IH-SS-9037', 'IH-SS-9015', 'IH-SS-9500', 'IH-SS-9030', 'IH-SS-9000'],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-bsp-metric-adapters',
      label: 'Stainless steel BSP and metric adapters',
      blurb: 'BSPP and BSPT sockets, nipples, plugs, bonded seals and adapters to NPT, JIC and metric in stainless steel.',
    },
    {
      type: 'related_articles',
      slugs: ['bspp-vs-bspt', 'bsp-hydraulic-adapters-guide', 'stainless-threaded-pipe-fittings-150-vs-3000', 'hydraulic-thread-size-and-pitch-reference'],
    },
    {
      type: 'cta_block',
      heading: 'Need stainless BSP sockets?',
      body: 'Send the thread on each end, the seal and the working pressure. We quote and ship from Dubai, UAE, and confirm the part against your drawing or sample before it leaves.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
