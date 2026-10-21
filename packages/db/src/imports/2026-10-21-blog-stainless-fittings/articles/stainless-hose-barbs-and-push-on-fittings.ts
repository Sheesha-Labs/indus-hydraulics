import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless hose barbs, push-on (push-lock) and crimp hose fittings. Sources read 2026-10-21: Parker Push-Lok
 * brochure B4480-B176 ("the self-grip hose system for low-pressure applications"; no clamps or tools; 82-series
 * fittings in brass, steel and stainless with DIN, BSP, SAE, JIC and ORFS ends; design factor 4; 801PLUS hose max WP
 * 350 psi at -4/-6, 300 psi at -8 to -12, 200 psi at -16; other Push-Lok hoses 150–300 psi); Parker fluid chart
 * (316 for sea water and brine). Our listings: barbed × JIC/NPT, push-on × BSPP/JIC/NPT swivel and male, stainless
 * crimp fittings × ORB / NPT swivel / tube stub; "an assembly is rated to the lower of the hose and the end".
 * NOT used: clamp pressure limits for barbed hose (no maker source); a published rating for a stainless push-on end
 * alone (none found — the hose sets the limit).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-hose-barbs-and-push-on-fittings',
  title: 'Stainless hose barbs, push-on and crimp hose fittings: what each is for and what limits them',
  excerpt:
    'A stainless hose barb will outlast every hose pushed onto it — which is exactly why the hose, not the barb, decides the pressure. Barbed, push-on (push-lock) and crimp hose ends in 316: how each holds the hose, Parker’s published push-on hose limits of 200 to 350 psi, why push-on hose needs no clamp, and when a low-pressure line should be a crimped assembly instead.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Hose Barbs & Push-On Fittings: Pressure Limits & Use',
  seoDescription:
    'Stainless steel hose barbs, push-on (push-lock) and crimp hose fittings: how each holds the hose, push-on hose pressure limits by size, clamps, JIC, NPT and BSPP ends, and when to use a crimped assembly instead.',
  focusKeyword: 'stainless steel hose barb',
  publishedAt: '2026-10-21T17:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three ways to hold a hose: a barb with a clamp, a push-on fitting gripped by its matching self-gripping hose, or a ferrule crimped over the hose.',
        'The hose sets the limit. Parker’s Push-Lok 801PLUS hose is rated 350 psi at -4/-6, 300 psi at -8 to -12 and 200 psi at -16, with a design factor of 4.',
        'Push-on fittings need no clamp — but only with hose designed for them; a plain hose on a push-on barb is a barbed joint with no clamp.',
        'Stainless ends are chosen for washdown, food, chemical and marine hose lines where brass or plated steel would corrode; the far end can be JIC, NPT or BSPP.',
        'Above a few hundred psi, or with pulsation, use a crimped hose assembly rated as a whole.',
      ],
    },
    {
      type: 'lead',
      html: 'Not every hose in a plant is a hydraulic pressure line. Coolant, compressed air, washdown water, drains, returns, cleaning chemicals and sampling lines all run at low pressure — and in a food, chemical or marine plant all of them need ends that will not corrode. That is where stainless barbed and push-on fittings earn their place, as long as nobody mistakes them for a pressure fitting.',
    },

    { type: 'section_head', number: '/01', title: 'Barb, push-on or crimp.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'How each stainless hose end holds the hose',
      columns: ['End', 'Holds the hose by', 'Clamp?', 'Typical use'],
      rows: [
        { cells: ['Hose barb', 'Ridged shank inside the hose', 'Yes — a hose clamp', 'Water, air, drains, transfer at low pressure'] },
        { cells: ['Push-on (push-lock)', 'Barb profile gripped by self-gripping hose', 'No — with matching hose', 'Air, coolant, lubrication, return lines'], highlight: true },
        { cells: ['Crimp fitting', 'Ferrule swaged over the hose', 'No', 'Hydraulic pressure hose, rated as an assembly'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker describes its Push-Lok range as "the self-grip hose system for low-pressure applications": the hose is designed to grip the fitting’s barb by itself, so no clamps or special tools are needed, and the fittings come in brass, steel and stainless with DIN, BSP, SAE, JIC and ORFS ends. The grip depends on the hose. Push a general rubber or PVC hose onto a push-on fitting and you have a barbed joint without a clamp.</p>',
    },

    { type: 'section_head', number: '/02', title: 'What limits the pressure.', anchor: 'pressure' },
    {
      type: 'comparison_table',
      caption: 'Parker Push-Lok 801PLUS hose, maximum working pressure (design factor 4)',
      columns: ['Size', 'Max working pressure', 'Minimum burst'],
      rows: [
        { cells: ['-4, -6', '350 psi (2.4 MPa)', '1,400 psi'], highlight: true },
        { cells: ['-8, -10, -12', '300 psi (2.1 MPa)', '1,200 psi'] },
        { cells: ['-16', '200 psi (1.4 MPa)', '800 psi'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s other push-on hoses — high-temperature water, phosphate ester, fire-resistant and others — carry working pressures from about 150 to 300 psi. No rating is published for the stainless push-on fitting on its own, because the hose fails first: an assembly is rated to the lower of the hose and its end. For a barbed hose with a clamp, rate it to the hose maker’s figure for clamped connections, and keep it well below that where the line can be knocked or pulled.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never on hydraulic pressure lines.',
      body: 'Barbed and push-on ends are for low-pressure service. A hydraulic pressure line — pump to valve, valve to cylinder — needs a crimped or reusable hose assembly rated for the system pressure. A hose blowing off a barb at pressure whips, and a fine jet of oil can inject through skin.',
    },

    { type: 'section_head', number: '/03', title: 'Stainless crimp fittings.', anchor: 'crimp' },
    {
      type: 'prose',
      html: '<p>Where a hose line in a corrosive area does carry pressure, the answer is a stainless crimp fitting: a stem and ferrule swaged onto a matched hose to the crimp maker’s specification, rated with that hose as an assembly. Our stainless crimp ends have ORB male, NPT male swivel and tube-stub connections. They must be crimped to the dimension specified for the exact hose series — the fitting series and the hose series are a pair, not interchangeable parts.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which stainless hose end?',
      branches: [
        { condition: 'Low-pressure air, coolant or return line, matching push-on hose available?', outcome: 'Push-on fitting, no clamp.', sku: 'IH-SS-PO-MJ' },
        { condition: 'Water, drain or transfer hose of any make, low pressure?', outcome: 'Hose barb with a stainless clamp.', sku: 'IH-SS-HB-MP' },
        { condition: 'Hydraulic pressure, pulsation or a line that must not blow off?', outcome: 'Crimped assembly on a matched hose.', sku: 'IH-SS-T43-MOR' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure can a push-on hose fitting take?', answer: 'The hose decides. Parker’s Push-Lok 801PLUS hose is rated 350 psi at -4/-6, 300 psi at -8 to -12 and 200 psi at -16; its other push-on hoses are about 150–300 psi.' },
        { question: 'Do push-on hose fittings need clamps?', answer: 'Not with hose designed for them — the hose grips the barb. On ordinary hose, a push-on fitting needs a clamp like any barb.' },
        { question: 'Why use stainless hose barbs?', answer: 'For corrosion: washdown, food, chemical and marine lines where brass or plated steel would corrode or contaminate.' },
        { question: 'Can I use a hose barb on a hydraulic line?', answer: 'Only on low-pressure lines such as drains and returns within the hose rating. Pressure lines need crimped or reusable assemblies.' },
        { question: 'What ends are available on stainless push-on fittings?', answer: 'Ours come with 37° JIC male and female swivel, NPT male, male swivel and female swivel, and BSPP male and female swivel ends.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Stainless hose barbs, push-on hose fittings and stainless crimp hose fittings:</p>' + stockList(['stainless-hose-barbs-push-on-fittings', 'stainless-crimp-hose-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Stainless hose ends',
      skus: ['IH-SS-PO-MJ', 'IH-SS-PO-FJX', 'IH-SS-PO-MP', 'IH-SS-PO-FBX', 'IH-SS-HB-MP', 'IH-SS-HB-FJX', 'IH-SS-T43-MOR', 'IH-SS-THY-TS'],
    },
    { type: 'category_link', slug: 'stainless-hose-barbs-push-on-fittings', label: 'Stainless hose barbs & push-on fittings', blurb: 'Barbed and push-lock ends with JIC, NPT and BSPP connections.' },
    { type: 'category_link', slug: 'stainless-crimp-hose-fittings', label: 'Stainless crimp hose fittings', blurb: 'Crimp ends with ORB, NPT swivel and tube-stub connections.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-pushlok', text: 'Parker. Push-Lok Hoses and Fittings — the self-grip hose system for low-pressure applications (B4480-B176).', url: 'https://project-cms-rpc-endcap.web.cern.ch/RPC/Services/HiLumiPhase3/Cooling/Modification%20to%20RE2%20Flexibles/B4480-B176%20PushLok%20UK.indb.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hydraulic-adapters-guide', 'stainless-jic-fittings', 'sanitary-tri-clamp-fittings-guide', 'hydraulic-fluid-injection-injury'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Push-on system behaviour and hose ratings from Parker’s Push-Lok brochure; ends and connections from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Low-pressure hose in a corrosive area?',
      body: 'Send the hose, size, medium, pressure and end connection. We will quote stainless barbed, push-on or crimped ends to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
