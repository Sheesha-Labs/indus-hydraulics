import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Brass hose barbs, brass push-lock barbs and steel beaded barb adapters. Sources read 2026-10-21: Parker Push-Lok
 * brochure B4480-B176 ("the self-grip hose system for low-pressure applications"; no clamps or special tools; 82-series
 * fittings in brass, steel and stainless with DIN, BSP, SAE, JIC and ORFS ends; design factor 4; 801PLUS hose max WP
 * 350 psi at -4/-6, 300 psi at -8 to -12, 200 psi at -16 with minimum burst 1,400 / 1,200 / 800 psi; other Push-Lok
 * hoses 150–300 psi). Parker Catalog 3501E (brass NPTF Dryseal threads with sealant; SAE 45° flare and inverted flare
 * ends). Listing copy (brass barbs with clamp, push-lock barbs without clamps, steel beaded barbs with NBR-sealed ORB
 * ends; "an assembly is rated to the lower of the hose and the end connection").
 * NOT used: clamp pressure limits (no maker source); a rating for a barb alone (none published — the hose decides).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hose-barbs-and-push-lock-fittings',
  title: 'Hose barbs and push-lock fittings: brass and steel barbs, push-lock hose, and the pressure the hose allows',
  excerpt:
    'A barb holds a hose by its ridges, a push-lock barb by the hose gripping it, and neither has a pressure rating of its own — the hose does. Parker rates its Push-Lok hose at 350 psi in small sizes and 200 psi at -16. Brass hose barbs, brass push-lock barbs, steel beaded barbs with ORB ends and menders: what each is for, the threaded ends they carry, and where they stop being the right fitting.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hose Barbs & Push-Lock Fittings: Brass, Steel and Pressure Limits',
  seoDescription:
    'A guide to brass hose barbs, push-lock hose barbs and steel beaded barb adapters: how barbs and push-lock hose hold, Parker Push-Lok hose pressures by size, NPTF, JIC, SAE flare, BSPP and ORB ends, and when to crimp instead.',
  focusKeyword: 'push lock hose fittings',
  publishedAt: '2026-10-21T21:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Plain hose barbs need a clamp; push-lock barbs need push-lock hose, which grips the barb by itself with no clamp or tool.',
        'Neither has a pressure rating of its own: an assembly is rated to the lower of hose and end. Parker’s Push-Lok 801PLUS hose is 350 psi at -4/-6, 300 psi at -8 to -12 and 200 psi at -16, with a design factor of 4.',
        'The other end is a normal threaded connection — NPTF, NPSM swivel, SAE 45° flare, inverted flare, JIC 37°, BSPP, ORB or garden-hose thread — so the barb fits the machine.',
        'Steel beaded barbs with an ORB end put a low-pressure hose straight onto a hydraulic port for case drains and returns.',
        'For pressure lines, pulsation or anything that must not come off, use a crimped assembly.',
      ],
    },
    {
      type: 'lead',
      html: 'Not every hose on a machine is a pressure hose. Air, coolant, lubrication, fuel, case drains, tank returns and breathers all run at low pressure, and for those a barbed end is quicker, cheaper and repairable on site. The catch is that a barb is only as strong as the hose and the way it is held. This guide covers the brass and steel barb range and where each belongs; for stainless barbs see <a href="/blog/stainless-hose-barbs-and-push-on-fittings">stainless hose barbs and push-on fittings</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Barb, push-lock or beaded barb.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Three barbed hose ends',
      columns: ['End', 'Holds the hose by', 'Needs', 'Typical use'],
      rows: [
        { cells: ['Brass hose barb', 'Ridges inside the hose', 'A hose clamp', 'Air, water, fuel, coolant'] },
        { cells: ['Brass push-lock barb', 'Barb profile gripped by self-gripping hose', 'Push-lock hose — no clamp', 'Air, lubrication, coolant, low-pressure oil'], highlight: true },
        { cells: ['Steel beaded barb', 'A bead that resists pull-off', 'Push-on hose rated for the medium', 'Case drains, returns, breathers on hydraulic ports'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker describes its Push-Lok range as the self-grip hose system for low-pressure applications: no clamps or special tools, with fittings in brass, steel and stainless and DIN, BSP, SAE, JIC and ORFS ends. The grip depends entirely on the hose — push ordinary rubber or PVC hose onto a push-lock barb and you have a barbed joint with no clamp. Menders (elbows and tees with barbs on every leg) join or branch hose on site without a threaded fitting.</p>',
    },

    { type: 'section_head', number: '/02', title: 'What sets the pressure.', anchor: 'pressure' },
    {
      type: 'comparison_table',
      caption: 'Parker Push-Lok 801PLUS hose (design factor 4)',
      columns: ['Size', 'Max working pressure', 'Minimum burst'],
      rows: [
        { cells: ['-4, -6', '350 psi (2.4 MPa)', '1,400 psi'], highlight: true },
        { cells: ['-8, -10, -12', '300 psi (2.1 MPa)', '1,200 psi'] },
        { cells: ['-16', '200 psi (1.4 MPa)', '800 psi'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s other push-lock hoses — for high-temperature water, phosphate ester and fire-resistant fluids — are rated roughly 150 to 300 psi. No rating is published for the barb alone, because the hose fails first; our listings say the same: an assembly is rated to the lower of the hose and the end. On a clamped barb, use the hose maker’s figure for clamped connections and stay well below it where the line can be pulled or knocked.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Not on pressure lines.',
      body: 'Barbed ends are for low pressure. A pump, valve or cylinder line needs a crimped or reusable assembly rated for system pressure. A hose blowing off a barb whips, and a pinhole jet of oil can inject through skin.',
    },

    { type: 'section_head', number: '/03', title: 'The threaded ends.', anchor: 'ends' },
    {
      type: 'prose',
      html: '<p>The value of a barb fitting is its other end. Our brass barbs carry NPTF male (fixed and swivel, straight, 45° and 90°), NPSM female swivel with ball or gasket seat, SAE 45° flare male and female swivel, dual-seat female swivels, inverted flare male and female swivels, JIC 37° male and female swivel, BSPP female swivel, NPT female, tube shank and garden-hose threads. The steel beaded barbs carry NPTF and ORB male ends, the ORB with a nitrile O-ring. Each end seals the way its family does — tapered NPTF on the thread with sealant, SAE flare and JIC on their cones, ORB on its O-ring — so read <a href="/blog/brass-flare-and-compression-fittings">brass flare fittings</a> and <a href="/blog/orfs-and-orb-adapters-guide">ORB ports</a> before mixing families.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a hose barb and a push-lock fitting?', answer: 'A plain barb needs a clamp to hold the hose. A push-lock barb is shaped to be gripped by push-lock hose, so it needs no clamp — but only with that hose.' },
        { question: 'What pressure can a push-lock fitting take?', answer: 'The hose decides. Parker’s Push-Lok 801PLUS hose is rated 350 psi at -4 and -6, 300 psi at -8 to -12 and 200 psi at -16.' },
        { question: 'Do push-lock fittings need clamps?', answer: 'Not with hose designed for them. On ordinary hose they behave like any barb and need a clamp.' },
        { question: 'Can I use a barbed fitting for a hydraulic case drain?', answer: 'Yes, within the hose rating and if the drain line is genuinely low pressure — a steel beaded barb with an ORB end is made for that. Check the motor or pump maker’s case pressure limit.' },
        { question: 'Brass or steel barbs?', answer: 'Brass for air, water, fuel and coolant and where corrosion matters; zinc-plated steel beaded barbs with ORB ends for low-pressure oil on hydraulic ports.' },
        { question: 'What is a hose mender?', answer: 'A barbed elbow or tee with barbs on every leg, used to join or branch low-pressure hose without a threaded fitting.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Brass hose barbs and menders, brass push-lock barbs, and steel beaded barb adapters — including Tompkins-made parts:</p>' + stockList(['brass-hose-barbs', 'brass-push-lock-hose-barbs', 'steel-hose-barb-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Hose barbs and push-lock fittings',
      skus: ['IH-BR-271', 'IH-BR-273', 'IH-BR-4311', 'IH-BR-8900', 'IH-BR-103', 'IH-BR-145', 'IH-ST-4604', 'IH-ST-4601'],
    },
    { type: 'category_link', slug: 'brass-push-lock-hose-barbs', label: 'Brass push-lock barbs', blurb: 'Push-lock barbs with NPTF, JIC, SAE flare, BSPP and garden-hose ends.' },
    { type: 'category_link', slug: 'brass-hose-barbs', label: 'Brass hose barbs', blurb: 'Clamp-on barbs, ball-seat adapters and menders.' },
    { type: 'category_link', slug: 'steel-hose-barb-adapters', label: 'Steel hose barb adapters', blurb: 'Beaded barbs with NPTF and ORB ends.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-pushlok', text: 'Parker. Push-Lok Hoses and Fittings — the self-grip hose system for low-pressure applications (B4480-B176).', url: 'https://project-cms-rpc-endcap.web.cern.ch/RPC/Services/HiLumiPhase3/Cooling/Modification%20to%20RE2%20Flexibles/B4480-B176%20PushLok%20UK.indb.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hose-barbs-and-push-on-fittings', 'crimped-reusable-or-ready-made-hose-assemblies', 'brass-flare-and-compression-fittings', 'push-to-connect-air-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Push-lock system and hose ratings from Parker’s Push-Lok brochure; ends and materials from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Low-pressure line to plumb?',
      body: 'Send the hose ID, the medium, the pressure and the thread at each end. We will quote barbs or push-lock ends and the hose to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
