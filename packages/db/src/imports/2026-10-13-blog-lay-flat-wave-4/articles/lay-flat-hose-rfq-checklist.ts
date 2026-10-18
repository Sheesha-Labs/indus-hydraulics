import type { BlogArticleSeed } from '../shared'

/**
 * What to send for a lay flat hose quotation, including export to the GCC and Europe. General
 * procurement practice; HS headings named only as the candidate chapters (3917, 4009, 5909) with
 * classification left to the importer's broker.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-rfq-checklist',
  title: 'Lay flat hose RFQ checklist: what to send for a fast, accurate quote',
  excerpt:
    'Most lay flat hose quotes stall on the same missing details: the pressure, the couplings, the length per piece, the approval. A one-page checklist of what to send — application, bore, length, pressure, temperature, couplings, standards, packing and delivery — so the first quote is the right one, whether the hose is going to a site in Riyadh or a farm in Cork.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose RFQ Checklist: What to Send for a Quote',
  seoDescription:
    'What to include in a lay flat hose request for quotation: application and fluid, bore, length per piece, pressure, temperature, couplings, approvals, quantity, packing, delivery terms and documents for GCC and European orders.',
  focusKeyword: 'lay flat hose quote',
  publishedAt: '2026-10-14T07:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Start with what the hose does: fluid, application and where it lies — that picks the material.',
        'Give the bore, the length of each piece and the total length; lay flat is priced and packed by piece.',
        'Give the pump’s pressure at duty and shut-off, not just “high pressure”.',
        'Specify couplings at both ends: type, size, thread or flange standard, and material.',
        'Name any standard or approval and the delivery terms up front — they change the price more than anything else.',
      ],
    },
    {
      type: 'lead',
      html: 'A lay flat hose request that reads “need 500 m of 6-inch layflat, please quote” can mean a cheap PVC irrigation line or a pressure-rated TPU transfer main with flanged couplings and test certificates — at five times the price. The quote that comes back will be a guess, and the follow-up questions cost a week. This checklist covers what a supplier needs to quote properly. Send it with the first email and the first quote can be the final one.',
    },

    { type: 'section_head', number: '/01', title: 'The checklist.', anchor: 'checklist' },
    {
      type: 'comparison_table',
      caption: 'What to send with a lay flat hose enquiry',
      columns: ['Item', 'What we need', 'Why it matters'],
      rows: [
        { cells: ['Application', 'What the hose does and where: dewatering, frac water, fuel, drinking water, fire, slurry, irrigation', 'Chooses the material and construction'] },
        { cells: ['Fluid', 'Water, seawater, slurry, diesel, chemicals — with the analysis if it is not clean water', 'Material compatibility'] },
        { cells: ['Bore', 'Nominal size (inch or DN), or the pump outlet size', 'Flow, friction and couplings'] },
        { cells: ['Length', 'Length of each piece and total length or number of pieces', 'Pricing, packing and coupling count'], highlight: true },
        { cells: ['Pressure', 'Pump duty and shut-off pressure, or head and flow', 'Hose class and coupling rating'] },
        { cells: ['Temperature', 'Fluid and ambient, especially above 40 °C or below 0 °C', 'Material and pressure rating'] },
        { cells: ['Couplings', 'Type and size at each end (Storz, camlock, Bauer, grooved, flanged, threaded), standard and material', 'Fitting, sealing and pressure limit'] },
        { cells: ['Standard or approval', 'Any required standard, certification or authority listing', 'Whether and how we can supply'] },
        { cells: ['Quantity and timing', 'Quantity, required date, any call-offs', 'Lead time and price'] },
        { cells: ['Delivery', 'Destination, Incoterm, how it will be received', 'Freight, packing and documents'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What information do I need to get a lay flat hose quote?',
      answer:
        'The application and fluid, the bore, the length of each piece and the total, the pump pressure, the temperature, the couplings at each end, any standard or approval required, the quantity and date, and the delivery destination and terms. With those, a supplier can quote the right hose first time.',
    },

    { type: 'section_head', number: '/02', title: 'The details that change the price.', anchor: 'price' },
    {
      type: 'prose',
      html: '<ul><li><strong>Material.</strong> PVC, NBR and TPU differ several-fold in price and life. Our <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">materials comparison</a> explains when each is worth it.</li><li><strong>Pressure class.</strong> A line that must carry 15 bar is a different hose from one that carries 3. See <a href="/blog/lay-flat-hose-pressure-ratings">pressure ratings</a>.</li><li><strong>Couplings.</strong> On large bores, two flanged stainless couplings can cost more than the hose between them. See the <a href="/blog/lay-flat-hose-couplings-guide">coupling guide</a>.</li><li><strong>Approvals.</strong> Drinking-water approval, fire hose certification and civil defence listings narrow the choice of product and add documentation.</li><li><strong>Length per piece.</strong> Lay flat comes in long lengths — up to 400 m for TPU — so fewer, longer pieces mean fewer couplings.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Exporting to the GCC and Europe.', anchor: 'export' },
    {
      type: 'paragraph',
      html: 'We ship from the UAE across the Gulf, to Europe and beyond. For export orders, tell us the <strong>Incoterm</strong> (for example EXW, FOB, CIF or DAP) and destination, who the importer of record is, and which <strong>documents</strong> your customs broker and site need — typically a commercial invoice, packing list and certificate of origin, plus any test certificates or certificates of conformity. Hose is classified under different customs headings depending on its construction (tubes and hoses of plastics, of rubber, or textile hosepiping); confirm the classification with your broker. For <strong>packing</strong>, say how the hose will be handled at site: coils on pallets, on reels, or made-up assemblies with couplings fitted and capped.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Send a photo.',
      body: 'For a replacement, a photo of the existing hose, its coupling and any printed marking — with the flat width measured — answers half the checklist. See our lay flat hose size chart for how to measure.',
    },

    { type: 'section_head', number: '/04', title: 'A sample enquiry.', anchor: 'sample' },
    {
      type: 'paragraph',
      html: '<em>“Construction dewatering, Doha. Groundwater, slightly saline, some silt. 6" lay flat, 10 pieces of 100 m. Diesel pump, duty 8 bar, shut-off 11 bar. Ambient up to 48 °C. Grooved coupling one end to suit the pump manifold, Storz the other end. No approval required. Needed on site by 30 November, DAP Doha, coils on pallets with couplings fitted. Commercial invoice, packing list, certificate of origin.”</em> That enquiry has everything needed for an accurate first quote.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What length does lay flat hose come in?', answer: 'Long lengths — up to 400 m per piece for our TPU hose — or cut and coupled to the lengths you specify.' },
        { question: 'Do I need to give the pump pressure?', answer: 'Yes. The working pressure at the pump, and ideally its shut-off pressure, decides the hose class and coupling rating.' },
        { question: 'Can you supply hose with couplings fitted?', answer: 'Yes. We supply made-up assemblies with couplings fitted, or hose and couplings loose.' },
        { question: 'Do you ship to Europe?', answer: 'Yes. Tell us the Incoterm, destination and documents your broker needs.' },
        { question: 'What if I do not know the size?', answer: 'Measure the flat width and send a photo of the coupling; our size chart explains how.' },
      ],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Every lay flat hose, coupling and reel we supply.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Lay flat hose supply to Saudi Arabia',
      blurb: 'Hose, couplings and assemblies shipped from the UAE.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Lay flat hose supply to the UK',
      blurb: 'Hose and couplings shipped to UK sites and stockists.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-size-chart', 'lay-flat-hose-guide', 'lay-flat-hose-couplings-guide', 'lay-flat-hose-pressure-ratings', 'tpu-vs-nbr-vs-pvc-lay-flat-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Checklist reflects the details Indus requests on lay flat hose enquiries. Customs classification and documents depend on the destination — confirm with your broker.',
    },
    {
      type: 'cta_block',
      heading: 'Ready to send your enquiry?',
      body: 'Use the checklist above, attach photos if you have them, and we will come back with a quotation.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
