import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: facts family oteco-pressure-gauges (listings IH-OTC-PG6/PG7/PG8, SD/SG/SW:
 * case sizes, heights, ranges, part counts, end connections, interchange statements, rebuilding) and
 * _raw/brochure-review.md section 7 (Oteco pressure gauge brochure: sub-connection tables, part number
 * scheme, dial faces, ABS/DNV unit certification on request). The brochure quotes -20 F to 250 F while the
 * listings say -20 F to 180 F, so no operating temperature is given here.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'drilling-pressure-gauge-models',
  title: 'Drilling pressure gauges: the Model 6, 7 and 8, their subs, trims and ranges',
  excerpt:
    'Oteco makes three dampened drilling gauges, the Model 6, 7 and 8, in standard, salt water and sour gas trims. How they differ, why the sub connection rather than the dial sets the pressure limit, and what to send us to match an existing gauge.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Drilling Pressure Gauges: Models 6, 7, 8',
  seoDescription:
    'Oteco Model 6, 7 and 8 drilling pressure gauges compared: case size, ranges, trims, sub connections, part numbers and the sub-rating rule that limits pressure.',
  focusKeyword: 'drilling pressure gauge',
  publishedAt: '2026-11-19T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Oteco makes three dampened drilling gauges. The Model 6 has a 4-7/8 in case and reads to 20,000 psi, the Model 7 has a 7-5/8 in case and reads to 6,000 psi, and the Model 8 has an 8-1/8 in case, a 6 in dial and reads to 20,000 psi.',
        'The maximum pressure of a gauge is the lower of its dial range and the rating of its sub connection. A 20,000 psi dial on a line pipe sub is not a 20,000 psi gauge.',
        'Each model comes in standard, salt water and sour gas (H2S) trims. The trim is part of the part number, so it has to be stated in the order.',
        'Oteco states that the Model 6 and Model 7 are interchangeable with the Cameron, Totco, Geosource, Wadeco and Gauges International gauges it names. Match range, units and sub, then pick the part number.',
        'Oteco rebuilds its own gauges and most Cameron-style gauges, and we arrange the exchange.',
      ],
    },
    {
      type: 'lead',
      html: 'A standpipe gauge looks simple until you have to replace one. The dial range is only one of five things on the order: model, trim, units, dial face and sub connection. Get the sub wrong and you can end up with a gauge whose dial reads higher than the connection it hangs on can hold. This article walks through the three Oteco drilling gauges, how to read their part numbers, and how to choose between them. For the basics of reading a gauge and choosing a range, see our <a href="/blog/pressure-gauge-guide">pressure gauge guide</a> and <a href="/blog/how-to-choose-a-pressure-gauge-range">range selection guide</a>.',
    },
    { type: 'section_head', number: '/01', title: 'Three models, three jobs.', anchor: 'models' },
    {
      type: 'paragraph',
      html: 'All three are heavy-duty gauges for standpipe, mud pump, choke and kill, cementing and well-testing lines. Inside, a built-in dampener protects the movement from pump pulsation and mechanical shock, heavy-duty seals keep line fluid out of the mechanism, and the movement runs in a special oil. A low-pressure plug on the back protects the case and lens if the mechanism ever leaks internally. What separates the models is size, range and sub.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco drilling pressure gauges compared',
      columns: ['Feature', 'Model 6', 'Model 7', 'Model 8'],
      rows: [
        { cells: ['Dial case', '4-7/8 in', '7-5/8 in', '8-1/8 in'] },
        { cells: ['Height on standard sub', 'About 9-7/8 in', 'About 14-3/4 in', 'About 13-1/4 in'] },
        { cells: ['Maximum range', '20,000 psi', '6,000 psi', '20,000 psi'] },
        { cells: ['Standard threaded sub', '2 in line pipe male x 1 in female', '2 in line pipe female', '2 in line pipe male x 1 in female'] },
        { cells: ['Dial face', 'Standard or luminous', 'Standard or luminous', '6 in dial, acrylic lens; dual-unit dials'] },
        { cells: ['Trims', 'Standard, salt water, sour gas', 'Standard, salt water, sour gas', 'Standard, salt water, sour gas'] },
        { cells: ['Salt water trim ranges to', '10,000 psi', '6,000 psi', '10,000 psi'] },
        { cells: ['Part numbers (standard / sour gas / salt water)', '118 / 138 / 32', '38 / 35 / 26', '58 / 66 / 23'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The <a href="/p/oteco-model-6-pressure-gauge-standard">Model 6</a> is the compact, high-range gauge, and the one that appears most on manifolds and test lines. The <a href="/p/oteco-model-7-pressure-gauge-standard">Model 7</a> is the large-case gauge for 6,000 psi service, easier to read from a distance. The <a href="/p/oteco-model-8-pressure-gauge-standard">Model 8</a> combines a large dial with the high range of the Model 6, and is the model offered with dual-unit dials: psi with kg/cm², or bar or kPa with psi. That helps on a rig where drillers and service crews read different units.',
    },
    { type: 'section_head', number: '/02', title: 'The sub sets the limit, not the dial.', anchor: 'sub' },
    {
      type: 'paragraph',
      html: 'This is the point that catches people out. Oteco states that the maximum pressure of a gauge is the lower of its dial range and the rating of its sub end connection. The dial only tells you how far the needle can go. The sub is the pressure-containing part, and it is rated on its own. In the Oteco brochure a Model 6 on a 2 in line pipe thread sub is listed at 6,000 psi for the 1,000, 3,000 and 6,000 psi dials, and at 10,000 psi for the 10,000 psi dial. Higher ranges go on flanged or union subs.',
    },
    {
      type: 'comparison_table',
      caption: 'Model 6 sub connections and the maximum pressure Oteco lists for them',
      columns: ['Sub connection', 'Maximum pressure', 'Dial ranges offered on it'],
      rows: [
        { cells: ['2 in line pipe thread', '6,000 psi', '1,000, 3,000, 6,000 psi'] },
        { cells: ['2 in line pipe thread', '10,000 psi', '10,000 psi'] },
        { cells: ['2-1/16 in 5,000 psi flange (R-24)', '5,000 psi', '1,000, 3,000 psi'] },
        { cells: ['2-1/16 in 10,000 psi flange (BX-152)', '10,000 psi', '10,000 psi'] },
        { cells: ['2-1/16 in 15,000 psi flange (BX-152)', '15,000 psi', '15,000 psi'] },
        { cells: ['2 in Fig. 1502 union, male', '6,000 psi', '1,000, 3,000, 6,000 psi'] },
        { cells: ['2 in Fig. 2002 union, male', '20,000 psi', '20,000 psi'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A 5,000 psi flange does not take a 10,000 psi dial.',
      body: 'The R-24 flange sub is listed at 5,000 psi and is offered with the lower dial ranges. Choose the sub from the connection on the line, then the dial from the working pressure, leaving headroom above it.',
    },
    {
      type: 'paragraph',
      html: 'Hammer-union subs are made to mate with FMC Weco Figure 1502, 2002 and 2202 unions. If you are not sure which figure number is on your line, our <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers guide</a> explains how to read it, and <a href="/blog/flow-iron-explained">flow iron explained</a> shows where gauges sit in the circuit. Flanged subs follow the usual API ring groove numbers (R-24, BX-151, BX-152), and stainless or Inconel inlaid ring grooves are available on request. Weco, FMC, Cameron, Totco, Geosource, Wadeco and Gauges International are trademarks of their owners; Indus Hydraulics is not affiliated with them.',
    },
    { type: 'section_head', number: '/03', title: 'Choosing the trim.', anchor: 'trim' },
    {
      type: 'prose',
      html: '<ul><li><strong>Standard</strong> for normal drilling mud service.</li><li><strong>Salt water</strong> where the line fluid is brine or salt water. This trim is listed to 10,000 psi on the Model 6 and 8 and to 6,000 psi on the Model 7, and only on line pipe subs.</li><li><strong>Sour gas (H2S)</strong> where hydrogen sulphide may be present. It is the largest listing of the three on the Model 6 (138 part numbers) and Model 8 (66), and covers flanged and union subs too.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'The trim changes the part number, not just a stamp on the dial. Sub end connections that are not listed in sour gas trim can be requested, and Oteco states that ABS and DNV unit certification is available on request, so say at enquiry if a classed unit is needed.',
    },
    { type: 'section_head', number: '/04', title: 'Reading the part number.', anchor: 'numbers' },
    {
      type: 'paragraph',
      html: 'Oteco gauge assembly numbers are six digits. The first three tell you the model: 36 for the Model 6, 37 for the Model 7 and 38 for the Model 8. The rest encode range, unit, trim, dial face and sub. For example IH-OTC-360000 is a Model 6, 0 to 10,000 psi, standard dial, on a 2-1/16 in 10,000 psi flange (BX-152); 360001 is the same gauge with a luminous dial; 361111 is a Model 6, 0 to 1,000 psi, on the 2 in line pipe male by 1 in female sub. We do not ask you to decode the rest. Send the nameplate details or the range, units, sub and trim and we confirm the number against Oteco’s tables.',
    },
    { type: 'section_head', number: '/05', title: 'Replacing an old gauge, and rebuilding it.', anchor: 'replace' },
    {
      type: 'paragraph',
      html: 'Oteco states that the Model 6 is interchangeable with the Cameron Type F, Totco Type 6, Geosource Type F, Wadeco Model 10 and Gauges International Model 6, and that the Model 7 is interchangeable with the Cameron Type D, Totco Type 4, Geosource Type D, Wadeco Model 12 and Gauges International Model 7. It publishes no equivalent statement for the Model 8. When you replace one, match three things from the old gauge: dial range and units, sub connection, and trim. Then take the part number from the matching listing.',
    },
    {
      type: 'paragraph',
      html: 'A gauge that still has a sound case does not always need replacing. Oteco rebuilds and refurbishes its gauges and most Cameron-style gauges to like-new condition, and we arrange the exchange. See the full range on our <a href="/c/ic-pressure-gauges">HP pressure gauges shelf</a>, and the overview in <a href="/blog/oteco-drilling-equipment-guide">the Oteco drilling equipment guide</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I put a 20,000 psi dial gauge on a line pipe sub?',
          answer: 'No. The maximum pressure is the lower of the dial range and the sub rating, and Oteco lists the 2 in line pipe thread sub at 6,000 or 10,000 psi depending on the sub. Use a flanged or union sub for 15,000 and 20,000 psi ranges.',
        },
        {
          question: 'What is the difference between the Model 6 and the Model 8?',
          answer: 'Both read to 20,000 psi and use the same standard threaded sub. The Model 8 has a larger 8-1/8 in case with a 6 in dial behind an acrylic lens, and is the model offered with dual-unit dials. The Model 6 has a 4-7/8 in case.',
        },
        {
          question: 'Which model do I need for a 5,000 psi standpipe?',
          answer: 'Any of the three covers it in range. The Model 7 is the large-dial gauge to 6,000 psi; the Model 6 and 8 also cover it. Choose by dial size, sub connection and trim, and leave headroom above the working pressure.',
        },
        {
          question: 'Do you supply gauges with luminous dials?',
          answer: 'Yes. Most ranges are offered with a standard or a luminous dial face, and each is a separate part number.',
        },
        {
          question: 'Can a gauge be rebuilt rather than replaced?',
          answer: 'Oteco rebuilds its own gauges and most Cameron-style gauges to like-new condition. Send the model, nameplate and condition and we arrange the exchange.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco drilling pressure gauges',
      skus: ['IH-OTC-PG6-SD', 'IH-OTC-PG6-SG', 'IH-OTC-PG7-SD', 'IH-OTC-PG8-SD', 'IH-OTC-PG8-SG', 'IH-OTC-PG6-SW'],
    },
    { type: 'category_link', slug: 'ic-pressure-gauges', label: 'HP pressure gauges', blurb: 'Oteco Model 6, 7 and 8 drilling gauges and other high-pressure gauges.' },
    {
      type: 'related_articles',
      slugs: ['pressure-gauge-guide', 'how-to-choose-a-pressure-gauge-range', 'hammer-union-figure-numbers', 'flow-iron-explained', 'oteco-drilling-equipment-guide'],
    },
    {
      type: 'cta_block',
      heading: 'Replacing a standpipe or manifold gauge?',
      body: 'Send the model or nameplate, range and units, sub connection and trim. We are an authorised Oteco distributor for the Middle East, keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
