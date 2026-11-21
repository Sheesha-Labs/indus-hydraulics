import type { BlogArticleSeed } from '../shared'

/**
 * Hose barb size chart. The chart is built from the size rows (barb size × thread end) of the live
 * listings on the brass-hose-barbs and stainless-hose-barbs-push-on-fittings shelves: brass barb ×
 * NPTF male straight swivel, 45° and 90° elbows (IH-BR-103, -139, -129); brass barb × NPSM female
 * swivel (IH-BR-124); brass barb × SAE 45° flare and JIC 37° (IH-BR-142, -143, -144, -145); brass
 * menders (IH-BR-177, -179); 316 stainless barb × NPT male straight and 90° (IH-SS-HB-MP, -MP90) and
 * × JIC 37° (IH-SS-HB-FJX, -MJ); 316 stainless push-on × BSPP, JIC and NPT (IH-SS-PO-*). Thread
 * designations (e.g. 1/4-18, G1/4-19, 7/16-20) are as given on those rows; standard names are
 * ASME B1.20.1 (NPT/NPSM), ASME B1.20.3 (NPTF), ISO 228-1 (BSPP), SAE J514 (JIC 37°) and ASME
 * B1.20.7 (garden hose thread). No pressure or temperature figure is given: the listings publish none.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hose-barb-size-chart',
  title: 'Hose barb size chart: standard barb sizes, thread ends, and how to match a barb to your hose',
  excerpt:
    'A hose barb is sized by the inside diameter of the hose it fits, and its thread end is sized separately. A chart of the standard barb sizes from 1/8" to 3", the brass and stainless thread ends each one comes with, and how to measure and choose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hose Barb Size Chart: Standard Hose Barb Sizes',
  seoDescription:
    'Standard hose barb sizes from 1/8" to 3": barb size vs hose ID, NPT, NPTF, NPSM, JIC and BSPP thread ends, brass vs stainless, and how to measure.',
  focusKeyword: 'hose barb sizes',
  publishedAt: '2026-11-21T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the standard hose barb sizes?',
      answer:
        'Hose barbs are sized by the inside diameter (ID) of the hose they fit. Standard inch sizes run 1/8", 3/16", 1/4", 5/16", 3/8", 1/2", 5/8", 3/4" and 1", then 1-1/4", 1-1/2", 2", 2-1/2" and 3". The thread on the other end is sized separately, so a 3/8" barb can come with a 1/8", 1/4", 3/8" or 1/2" thread.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The barb size is the hose ID. Measure the inside of the hose, not the outside, and pick the barb with the same nominal size.',
        'The thread end is a second, independent size. Order a barb by both: for example 1/2" barb × 3/8" NPTF male.',
        'In brass our barbs run 1/8" to 1"; in 316 stainless 1/8" to 3". Push-on stainless fittings run 1/4" to 1" hose ID.',
        'NPT, NPTF, NPSM, BSPP and JIC with the same nominal size are different threads. A 1/4" NPT male (1/4-18) will not seal in a 1/4" BSPP port (G1/4-19).',
        'Never fit a barb a size larger to make a tight fit, or a size smaller to make it easy. Both fail at the clamp.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose barb is a ridged spigot that pushes into a soft hose, with a thread or another barb on the other end. Ordering one goes wrong in two ways: the barb does not match the hose, or the thread does not match the port. This page is the chart. For what barbs are for and where they reach their limits, read <a href="/blog/hose-barbs-and-push-lock-fittings">hose barbs and push-lock fittings</a> and <a href="/blog/stainless-hose-barbs-and-push-on-fittings">stainless hose barbs and push-on fittings</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Barb size is the hose ID.', anchor: 'barb-size' },
    {
      type: 'paragraph',
      html: 'The nominal barb size is the bore of the hose it is meant for. A 3/8" barb goes into 3/8" ID hose. The ridges are slightly larger than the nominal size so they grip the tube, which is why the hose is a tight push. If the hose goes on loosely, it is a size too big for the barb; if you have to heat it and force it, it may be a size too small.',
    },
    {
      type: 'paragraph',
      html: 'Measure the ID with a vernier or a set of drill shanks, not a tape. Hose is often marked in both inch and millimetre, and a hose sold as 10 mm is close to, but not the same as, 3/8" (9.5 mm). For soft PVC or rubber hose that small difference is usually taken up by the barb ridges. For a stiff hose, match the size exactly.',
    },

    { type: 'section_head', number: '/02', title: 'The hose barb size chart.', anchor: 'size-chart' },
    {
      type: 'paragraph',
      html: 'This chart lists every barb size on our <a href="/c/brass-hose-barbs">brass hose barbs</a> and <a href="/c/stainless-hose-barbs-push-on-fittings">stainless hose barbs and push-on fittings</a>, with the thread sizes each one comes with. Read across from the hose ID to find the thread ends available. A dash means we do not list that combination.',
    },
    {
      type: 'comparison_table',
      caption: 'Hose barb sizes and the thread ends available (from our live size tables)',
      columns: ['Barb size (hose ID)', 'Brass × NPTF male', 'Brass × NPSM female swivel', 'Brass × SAE 45° / JIC 37°', 'Stainless × NPT male', 'Stainless × JIC 37°'],
      rows: [
        { cells: ['1/8"', '—', '1/8"', '—', '1/8"', '—'] },
        { cells: ['3/16"', '1/8"', '1/8", 1/4"', '1/4"', '—', '—'] },
        { cells: ['1/4"', '1/8", 1/4", 3/8"', '1/4", 3/8"', '1/4", 5/16", 3/8"', '1/8", 1/4", 3/8", 1/2"', '1/4"'] },
        { cells: ['5/16"', '1/8", 1/4", 3/8"', '1/4", 3/8"', '5/16", 3/8"', '—', '—'] },
        { cells: ['3/8"', '1/8", 1/4", 3/8", 1/2"', '1/4", 3/8", 1/2"', '3/8", 1/2"', '1/8", 1/4", 3/8", 1/2"', '3/8"'] },
        { cells: ['1/2"', '1/4", 3/8", 1/2"', '3/8", 1/2"', '1/2", 5/8"', '1/4", 3/8", 1/2", 3/4"', '1/2"'] },
        { cells: ['5/8"', '3/8", 1/2"', '—', '—', '1/2", 3/4"', '5/8"'] },
        { cells: ['3/4"', '1/2", 3/4"', '3/4"', '3/4"', '1/2", 3/4", 1"', '3/4"'] },
        { cells: ['1"', '3/4", 1"', '—', '—', '3/4", 1", 1-1/4"', '1"'] },
        { cells: ['1-1/4"', '—', '—', '—', '1-1/4"', '1-1/4"'] },
        { cells: ['1-1/2"', '—', '—', '—', '1-1/2"', '1-1/2"'] },
        { cells: ['2"', '—', '—', '—', '2"', '2"'] },
        { cells: ['2-1/2"', '—', '—', '—', '2-1/2"', '—'] },
        { cells: ['3"', '—', '—', '—', '3"', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Not every thread comes in every body shape. The brass NPTF column combines the straight swivel, the 45° elbow and the <a href="/p/brass-hose-barb-x-nptf-male-90-elbow">90° elbow</a>, and the 90° elbow has the widest range. For joining two hoses, brass menders come as a 90° elbow in 1/4" to 1/2" and as a <a href="/p/brass-hose-barb-mender-tee">tee in 3/16" to 3/4"</a>. Stainless push-on fittings, for push-on hose that needs no clamp, are listed in 1/4", 3/8", 1/2", 5/8", 3/4" and 1" hose ID with BSPP or JIC ends, and 1/4" to 1" with NPT male.',
    },

    { type: 'section_head', number: '/03', title: 'The thread end is a different size.', anchor: 'thread-end' },
    {
      type: 'paragraph',
      html: 'A thread’s nominal size is a name, not a measurement, and each family names differently. NPT and NPTF are tapered pipe threads named after a pipe bore. NPSM is a straight pipe thread that seals on a 30° seat, usually as a female swivel. BSPP is a straight British pipe thread that seals on a washer or O-ring. JIC is named after the tube outside diameter, so its thread is larger than its name. These are the threads on our barb listings:',
    },
    {
      type: 'comparison_table',
      caption: 'Thread designations on our barb listings (size – threads per inch)',
      columns: ['Nominal size', 'NPT / NPTF / NPSM', 'BSPP', 'JIC 37°'],
      rows: [
        { cells: ['1/8"', '1/8-27', '—', '—'] },
        { cells: ['1/4"', '1/4-18', 'G1/4-19', '7/16-20'] },
        { cells: ['3/8"', '3/8-18', 'G3/8-19', '9/16-18'] },
        { cells: ['1/2"', '1/2-14', 'G1/2-14', '3/4-16'] },
        { cells: ['5/8"', '—', 'G5/8-14', '7/8-14'] },
        { cells: ['3/4"', '3/4-14', 'G3/4-14', '1-1/16-12'] },
        { cells: ['1"', '1-11.5', 'G1-11', '1-5/16-12'] },
        { cells: ['1-1/4"', '1-1/4-11.5', '—', '1-5/8-12'] },
        { cells: ['1-1/2"', '1-1/2-11.5', '—', '1-7/8-12'] },
        { cells: ['2"', '2-11.5', '—', '2-1/2-12'] },
        { cells: ['2-1/2"', '2-1/2-8', '—', '—'] },
        { cells: ['3"', '3-8', '—', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'At 1/4" and 3/8" the NPT and BSPP threads have nearly the same diameter but different pitch (18 and 19 threads per inch) and a different thread angle. They can start by hand and then jam or leak. If you are not sure which you have, count the threads and check for taper. <a href="/blog/npt-npsm-and-sae-hose-fittings">NPT, NPSM and SAE hose fittings</a> and the <a href="/blog/hydraulic-thread-size-and-pitch-reference">thread size and pitch reference</a> explain how to identify them.',
    },

    { type: 'section_head', number: '/04', title: 'Brass or stainless.', anchor: 'brass-vs-stainless' },
    {
      type: 'paragraph',
      html: 'Brass barbs suit water, air, fuel and general workshop service, and they are the usual choice in small sizes. Our brass range covers 1/8" to 1" barbs with NPTF, NPSM, SAE 45° flare and JIC ends, including the <a href="/p/brass-hose-barb-x-npsm-female-swivel">NPSM female swivel</a> that lets you connect without twisting the hose. Choose 316 stainless for seawater, chemicals, food and process plant, or for bores above 1". The <a href="/p/stainless-steel-hose-barb-x-npt-male">stainless barb × NPT male</a> runs all the way to 3". Do not mix brass and stainless in a wet joint without thinking about galvanic corrosion.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The hose sets the pressure, not the barb.',
      body: 'A barb joint is only as strong as the hose and the clamp. Our barb listings publish no pressure rating for this reason: use the hose maker’s rating for a barbed connection, and fit a suitable clamp on every barb that is not a push-on design. See industrial hose clamps for which clamp suits which hose.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>We quote and ship brass and stainless barbs from Dubai, UAE. To get the right part first time, send:</p><ul><li>The hose ID, and the hose type or a photo of its printing</li><li>The thread family and size on the other end, male or female, and whether it should swivel</li><li>Body shape: straight, 45°, 90° or tee</li><li>Material: brass or 316 stainless, and the fluid</li><li>Quantity per size</li></ul><p>For clamps, read <a href="/blog/industrial-hose-clamps">industrial hose clamps</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a hose barb fitting?', answer: 'A fitting with a ridged spigot that pushes into the bore of a soft hose. The other end carries a thread, a flare, or another barb. The ridges grip the hose, and a clamp over them holds it on.' },
        { question: 'How do I know what size hose barb I need?', answer: 'Measure the inside diameter of the hose and choose the barb with the same nominal size. Then choose the thread on the other end to match the port or fitting it connects to.' },
        { question: 'What are the brass barb fitting sizes?', answer: 'On our listings brass barbs come in 1/8", 3/16", 1/4", 5/16", 3/8", 1/2", 5/8", 3/4" and 1" hose ID, with NPTF male, NPSM female swivel, SAE 45° flare and JIC 37° ends. The chart above gives every combination.' },
        { question: 'Do garden hose barbs use NPT?', answer: 'No. Garden hose connections use garden hose thread (GHT, 3/4-11.5 NH to ASME B1.20.7), which does not mate with 3/4" NPT. The barbs on our listings carry pipe, flare and JIC threads, not GHT.' },
        { question: 'Is a hose barb reducer the same as a barb with a smaller thread?', answer: 'Not quite. A reducing barb-to-barb joins two hose sizes. A barb with a smaller thread, such as 1/2" barb × 1/4" NPTF, changes size between the hose and the port. Our range lists the second kind and same-size menders.' },
        { question: 'Do I need a clamp on a stainless hose barb?', answer: 'Yes for a standard barb. Push-on fittings are designed for push-on hose and hold without a clamp, but only with the hose they are made for.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Brass and stainless hose barbs',
      skus: ['IH-BR-129', 'IH-BR-124', 'IH-BR-179', 'IH-SS-HB-MP', 'IH-SS-HB-FJX', 'IH-SS-PO-MBSP'],
    },
    {
      type: 'category_link',
      slug: 'brass-hose-barbs',
      label: 'Brass hose barbs',
      blurb: 'Brass barbs 1/8" to 1" with NPTF, NPSM, SAE 45° flare and JIC ends, plus elbow and tee menders.',
    },
    {
      type: 'related_articles',
      slugs: ['hose-barbs-and-push-lock-fittings', 'stainless-hose-barbs-and-push-on-fittings', 'npt-npsm-and-sae-hose-fittings', 'industrial-hose-clamps'],
    },
    {
      type: 'cta_block',
      heading: 'Need a barb for an odd hose?',
      body: 'Send the hose ID and the thread on the other end. We will find the barb, or the barb and adapter, and quote from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
