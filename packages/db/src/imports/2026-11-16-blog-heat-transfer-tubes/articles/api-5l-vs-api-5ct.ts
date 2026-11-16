import type { BlogArticleSeed } from '../shared'

/**
 * API 5L vs API 5CT. Sources: approved data for IH-TF-LP-LNP (API 5L / ISO 3183, grades B–X65,
 * PSL1/PSL2, sour gathering lines PSL2 Annex H, NPS 1/2–8 rows to ASME B36.10M) and IH-TF-LP-OCT
 * (API 5CT / ISO 11960, API 5B threads, J55/K55/N80-1/N80Q, drift test, 2 3/8–13 3/8 in), and the
 * A53/A106/A333 pipe listings. General definitions only beyond that; no pressure ratings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'api-5l-vs-api-5ct',
  title: 'API 5L vs API 5CT: line pipe, casing and tubing',
  excerpt:
    'API 5L line pipe carries oil, gas and water between facilities; API 5CT casing and tubing line and produce the well. How the two standards differ — grades, product levels, ends and threads, tests — and where A53, A106 and A333 pipe fit.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'API 5L vs API 5CT Pipe Explained',
  seoDescription:
    'API 5L line pipe vs API 5CT casing and tubing: grades B to X65 and J55 to N80, PSL1 and PSL2, threads, drift tests, and A53, A106, A333 pipe.',
  focusKeyword: 'api 5l vs api 5ct',
  publishedAt: '2026-11-16T09:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'API 5L (ISO 3183) is line pipe for transporting oil, gas and water; API 5CT (ISO 11960) is casing and tubing for wells.',
        'Line pipe grades are named by minimum yield in ksi: B, X42 … X65 and up; casing and tubing grades are J55, K55, N80 and higher.',
        'Line pipe comes in two product levels: PSL1, and PSL2 with tighter chemistry, toughness and testing — Annex H for sour service.',
        'Casing and tubing are threaded and coupled to API 5B and drift-tested; line pipe is usually plain-end or bevelled for welding.',
        'For plant piping, A106 (high temperature), A53 (general) and A333 (low temperature) are the usual pipe standards.',
      ],
    },
    {
      type: 'lead',
      html: 'Seamless steel pipe looks the same on the rack whether it is going into a flowline or down a well, but the two are bought to different API standards with different grades, ends and tests. Mixing them up on an enquiry is a common source of wrong quotations.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between API 5L and API 5CT?',
      answer:
        'API 5L covers line pipe for carrying oil, gas and water in pipelines and flowlines, in grades B to X-grades such as X65, at product levels PSL1 and PSL2. API 5CT covers casing and tubing that line and produce oil and gas wells, in grades such as J55, K55 and N80, threaded and coupled to API 5B and drift-tested. They are not interchangeable.',
    },

    { type: 'section_head', number: '/01', title: 'Side by side.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'API 5L and API 5CT compared',
      columns: ['Point', 'API 5L line pipe', 'API 5CT casing and tubing'],
      rows: [
        { cells: ['ISO equivalent', 'ISO 3183', 'ISO 11960'] },
        { cells: ['Purpose', 'Transport: pipelines, flowlines, gathering lines', 'Wells: casing strings and production tubing'] },
        { cells: ['Grades', 'B, X42, X46, X52, X56, X60, X65 …', 'J55, K55, N80-1, N80Q and higher'] },
        { cells: ['Product levels', 'PSL1 and PSL2 (Annex H for sour service)', 'PSL1 to PSL3'] },
        { cells: ['Ends', 'Plain or bevelled for welding', 'Threaded and coupled to API 5B, or plain'] },
        { cells: ['Sized by', 'NPS and wall or schedule (ASME B36.10M)', 'OD and weight per foot'] },
        { cells: ['Key test', 'Hydrostatic test; PSL2 adds toughness', 'Hydrostatic and drift test'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Line pipe.', anchor: 'line-pipe' },
    {
      type: 'paragraph',
      html: 'The number in an X-grade is the minimum yield strength in thousands of psi: X52 is 52 ksi. PSL2 adds tighter chemistry and carbon-equivalent limits, mandatory notch toughness and more testing; sour-gas gathering lines are ordered PSL2 to Annex H. Our <a href="/p/line-pipe-api-5l">API 5L listing</a> covers grades B to X65 PSL1 and PSL2 by NPS and schedule.',
    },

    { type: 'section_head', number: '/03', title: 'Casing and tubing.', anchor: 'octg' },
    {
      type: 'paragraph',
      html: 'Casing lines the borehole and tubing carries production inside it. Both are ordered by OD, weight per foot, grade and connection, and every length is drift-tested with a mandrel to prove the inside diameter. Our <a href="/p/casing-and-tubing-api-5ct">API 5CT listing</a> covers J55, K55 and N80 in tubing and casing sizes.',
    },

    { type: 'section_head', number: '/04', title: 'Plant piping: A53, A106, A333.', anchor: 'plant' },
    {
      type: 'paragraph',
      html: 'Inside the fence, process and utility piping is usually bought to ASTM: <a href="/p/high-temperature-carbon-steel-pipe-astm-a106">A106</a> for high-temperature process and steam lines, <a href="/p/black-and-galvanised-steel-pipe-astm-a53">A53</a> for water, air, utility and fire-water piping, and <a href="/p/low-temperature-carbon-steel-pipe-astm-a333">A333</a> for low-temperature service such as LNG, LPG and ethane lines, with Charpy impact testing.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can API 5L pipe be used as casing?', answer: 'No. Casing must meet API 5CT, including its threads, drift and test requirements.' },
        { question: 'What does X52 mean?', answer: 'API 5L grade with a minimum yield strength of 52,000 psi.' },
        { question: 'What is the difference between PSL1 and PSL2?', answer: 'PSL2 has tighter chemistry, mandatory toughness testing and more inspection. Sour service is ordered PSL2 to Annex H.' },
        { question: 'Is A106 the same as API 5L?', answer: 'They overlap in chemistry, and dual-certified pipe exists, but A106 is a plant-piping standard for high temperature and API 5L a line-pipe standard. Order to the one your specification names.' },
        { question: 'What is a drift test?', answer: 'A mandrel of specified diameter is passed through each length of casing or tubing to prove the minimum inside diameter.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Pipe in the catalogue',
      skus: ['IH-TF-LP-LNP', 'IH-TF-LP-OCT', 'IH-TF-CP-HT', 'IH-TF-CP-BLK', 'IH-TF-CP-LT'],
    },
    { type: 'category_link', slug: 'line-pipe-octg', label: 'Line pipe and OCTG', blurb: 'API 5L line pipe and API 5CT casing and tubing.' },
    { type: 'category_link', slug: 'carbon-steel-pipe', label: 'Carbon steel pipe', blurb: 'A53, A106 and A333 pipe by NPS and schedule.' },
    {
      type: 'related_articles',
      slugs: ['a179-vs-a192-vs-a210-vs-a213', 'heat-transfer-tube-buyers-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Summary of API 5L and 5CT scope; the current editions govern.',
    },
    {
      type: 'cta_block',
      heading: 'Pipe or OCTG enquiry?',
      body: 'Send the standard, grade, PSL, size, wall or weight, ends and quantity. We quote with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
