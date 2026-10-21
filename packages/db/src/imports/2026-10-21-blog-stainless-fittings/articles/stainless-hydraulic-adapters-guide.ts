import type { BlogArticleSeed } from '../shared'
import { ADAPTER_SEALS } from '../diagrams'
import { stockList } from '../products'

/**
 * 316 stainless hydraulic adapters overview, plus BSP / metric / NPT adapters. Sources read 2026-10-21: Parker Catalog
 * 4300 (2017 edition; current edition 9/2023 — figures to be re-checked against it): fluid compatibility Table T13
 * (sea water and brine NR for steel, S for 316; steel S for water-base hydraulic oil), zinc-coated steel not
 * recommended for food and beverage, thread standards Table F1, BSP 55° flank, BSPP seals on the spot face (ISO
 * 1179), taper-thread limitations ("prone to galling, especially in stainless steel"; port cracking; poor dynamic
 * sealing), sealant needed even on NPTF, stainless NPT may be slightly modified to minimise galling, ratings by
 * family (Triple-Lok straights SS > steel, elbows lower, Seal-Lok and Ferulok equal, EO metric lower), O-ring
 * defaults (SAE NBR, EO-2 stainless FKM), stainless nuts pre-lubricated / coated / silver-plated. DNV type approval
 * TAP0000167 for VOSS (316Ti approved for sea water, "cannot be considered immune"; thread-sealing connectors not
 * approved for toxic/flammable media, fatigue or crevice corrosion). Swagelok MS-01-147 (always use sealant on
 * tapered threads). Ham-Let pipe-fitting guide (two wraps of PTFE tape on stainless taper threads, male only, never
 * on flared, coned or tube ends).
 * NOT used: any maker statement requiring stainless for water-glycol or HFA (none found); bonded-seal specifics.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-hydraulic-adapters-guide',
  title: 'Stainless steel hydraulic adapters: when 316 is worth it, thread families, ratings and galling',
  excerpt:
    'Parker’s own fluid chart rates carbon steel "not recommended" in sea water and brine and 316 "satisfactory" — which is the whole case for stainless adapters offshore, on deck and in washdown plant. What changes when an adapter is 316: ratings that can be higher or lower than steel depending on the fitting, threads that gall if they are dry, O-ring defaults that differ by maker, and why tapered NPT is the riskiest end of all in stainless.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel Hydraulic Adapters: 316 Ratings, Threads & Galling',
  seoDescription:
    'A guide to 316 stainless steel hydraulic adapters: when stainless is needed, JIC, ORFS, ORB, DIN, BSPP, BSPT and NPT ends, pressure ratings vs carbon steel, galling and anti-seize, O-ring materials and sealing taper threads.',
  focusKeyword: 'stainless steel hydraulic adapters',
  publishedAt: '2026-10-21T17:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Parker’s compatibility chart rates steel fittings "not recommended" for sea water and brine and 316 "satisfactory"; for water-based hydraulic oil it rates both satisfactory. Stainless is a corrosion choice, not a fluid choice.',
        'A 316 adapter is not automatically rated like a steel one: Parker’s 2017 tables rate stainless 37° straights higher than steel, stainless elbows lower, ORFS and flareless equal, and metric 24° fittings lower.',
        'Stainless threads gall when forced together dry. Makers pre-lubricate, coat or silver-plate stainless nuts; keep that coating, and use a galling-resistant sealant on pipe threads.',
        'Tapered NPT and BSPT are the weakest ends in stainless — Parker lists them as prone to galling and able to crack a port. Prefer ORB, ORFS, BSPP with a bonded or soft seal, or SAE flanges.',
        'O-ring defaults differ: Parker’s SAE fittings come with nitrile even in stainless; metric makers fit FKM to stainless as standard. Specify the O-ring.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic panel on an offshore platform can be built entirely of the right fittings and still fail at one plated adapter that rusted through in the salt air. That is the reason 316 stainless adapters exist, and the reason they are specified a whole system at a time. This guide covers when stainless is worth it, how the end connections seal, how stainless changes ratings and assembly, and the thread families of the adapters in between.',
    },

    { type: 'section_head', number: '/01', title: 'When stainless is worth it.', anchor: 'why' },
    {
      type: 'comparison_table',
      caption: 'Parker fluid compatibility, selected media (S satisfactory, F fair, NR not recommended)',
      columns: ['Medium', 'Brass', 'Steel', '316 stainless'],
      rows: [
        { cells: ['Sea water', 'F', 'NR', 'S'], highlight: true },
        { cells: ['Brine (sodium chloride)', 'NR', 'NR', 'S'], highlight: true },
        { cells: ['Water', 'S', 'F', 'S'] },
        { cells: ['Hydraulic oil, water base', 'Insufficient data', 'S', 'S'] },
        { cells: ['Steam below 400 °F', 'F', 'S', 'S'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The chart says it: steel is fine in water-based hydraulic fluid; what it cannot survive is chloride on the outside. Stainless earns its price where the <em>environment</em> is the problem — sea spray and open decks, salt-laden coastal air, brine and chemical plant, and food and beverage lines, where Parker does not recommend zinc-coated steel at all. DNV, approving one maker’s 316Ti cutting-ring fittings for sea-water service (which it defines to include piping on open deck), adds the honest caveat that even this grade "cannot be considered immune to attack under all situations" — stagnant sea water and weld oxides are the usual culprits.</p><p>Modern zinc-nickel plated steel is a real alternative for less severe sites, but once one part of a system is stainless the rest should be too: see <a href="/blog/when-stainless-is-worth-it">when stainless is worth it</a> and <a href="/blog/ss316l-hydraulic-fittings">316L hydraulic fittings</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'How the ends seal.', anchor: 'ends' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'The three common tube-end seals. 37° JIC seals metal to metal between the fitting nose and the tube flare; ORFS seals on an O-ring in the male face; the 24° cone seals as a cutting ring bites the tube and wedges into the cone.',
      alt: 'Three simplified half sections. Left, 37 degree JIC to SAE J514: a body with a 37 degree cone, a flared tube and a nut, sealing metal to metal on the flare. Centre, ORFS to SAE J1453: a flat body face with an O-ring in a groove, a sleeve and a nut. Right, 24 degree cone to ISO 8434-1: a body with a 24 degree cone, a cutting ring on plain tube and a nut, sealing where the ring bites the tube.',
      svg: ADAPTER_SEALS,
    },
    {
      type: 'comparison_table',
      caption: 'Stainless adapter end connections',
      columns: ['End', 'Standard', 'Seals on', 'In stainless'],
      rows: [
        { cells: ['37° JIC', 'SAE J514 / ISO 8434-2', 'Metal flare', 'Common; nuts pre-lubricated against galling'] },
        { cells: ['ORFS', 'SAE J1453 / ISO 8434-3', 'O-ring in face', 'Best leak resistance; rated as steel'], highlight: true },
        { cells: ['ORB (SAE straight thread)', 'SAE J1926 / ISO 11926', 'O-ring at port', 'Preferred port over pipe thread'] },
        { cells: ['24° cone', 'ISO 8434-1 / DIN 2353', 'Cutting ring', 'Rated lower than steel; preset with a tool'] },
        { cells: ['BSPP', 'ISO 228-1 / ISO 1179', 'Spot face (bonded or soft seal)', 'Good; seal not on the thread'] },
        { cells: ['NPT / BSPT', 'ASME B1.20.1 / ISO 7-1', 'The thread', 'Prone to galling; avoid where possible'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Ratings: stainless is not steel.', anchor: 'ratings' },
    {
      type: 'prose',
      html: '<p>Parker’s Catalog 4300 (2017 edition) gives a separate pressure column for steel and 316 on every fitting, and the relationship changes by family:</p><ul><li><strong>37° flare straights and unions</strong> — stainless rated <em>higher</em>: a -4 straight-thread connector is 7,500 psi in steel and 9,000 psi in 316; -16 is 4,500 and 5,400.</li><li><strong>37° flare elbows</strong> — stainless rated <em>lower</em>: -16 is 4,000 psi in steel, 3,000 in 316.</li><li><strong>ORFS and SAE flareless</strong> — equal in both materials.</li><li><strong>Metric 24° cone</strong> — stainless much <em>lower</em>: an L-series union for 6–10 mm tube is 500 bar in steel and 315 bar in stainless.</li></ul><p>So a stainless adapter must be rated from the maker’s stainless column for that exact shape. Where our listing says the manufacturer publishes no figure, tell us the working pressure and we will confirm it before you order.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Galling: keep the threads lubricated.', anchor: 'galling' },
    {
      type: 'prose',
      html: '<p>Galling is local welding of mating metal surfaces, and austenitic stainless against austenitic stainless is prone to it when the threads are forced together dry. Makers design around it: Parker’s stainless 37° nuts carry a pre-applied anti-seize and states that all its stainless nuts are coated to prevent galling at assembly; its metric stainless nuts have silver-plated threads, which it says eliminate galling and cut assembly torque by up to 40%; its flareless stainless nuts are pre-lubricated and need nothing more. Do not clean that coating off, and do not swap a coated nut for a bare one.</p><p>With the coating intact, Parker applies the same 37° assembly torque to properly lubricated stainless as to unlubricated steel — not a reduced figure — and prefers the flats-from-wrench-resistance method for stainless. The details are in <a href="/blog/stainless-jic-fittings">stainless JIC fittings</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'BSP, metric and NPT adapters.', anchor: 'threads' },
    {
      type: 'prose',
      html: '<p>Most adapters in a stainless system exist to join one thread family to another. Parker’s thread table sets them out: NPT to ASME B1.20.1 (NPTF to SAE J476), BSPT to ISO 7-1, BSPP to ISO 228-1, metric to ISO 261. BSP threads have a 55° flank; NPT a 60° one, and the families do not interchange even where sizes look close.</p><ul><li><strong>BSPP (parallel)</strong> seals on the port spot face, not the thread — with a bonded seal, an elastomer soft seal (ISO 1179-2, "ED"), a metal sealing edge (ISO 1179-4) or an O-ring and retaining ring (ISO 1179-3).</li><li><strong>Metric parallel</strong> ports follow ISO 9974-1 or ISO 6149-1; Parker recommends ISO 6149-1 for new designs.</li><li><strong>NPT and BSPT (taper)</strong> seal on the thread and always need sealant — Parker says a sealant is necessary even with dry-seal NPTF. Ham-Let advises two wraps of PTFE tape on stainless tapered threads, on the male thread only, and never on flared, coned or tube-fitting ends.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Taper threads are the weak point in stainless.',
      body: 'Parker lists the limits of tapered pipe threads: poor dynamic sealing, possible expansion and even cracking of the port, limited remakeability, and "prone to galling, especially in stainless steel". DNV does not approve thread-sealing connectors for toxic or flammable media or where fatigue or crevice corrosion is expected. Use an ORB, ORFS, BSPP-with-seal or flange port wherever there is a choice.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'When should I use stainless steel hydraulic fittings?', answer: 'Where the environment is corrosive: sea spray, open decks, coastal plant, brine and chemical service, food and washdown. Parker rates steel "not recommended" in sea water and brine and 316 "satisfactory".' },
        { question: 'Are stainless hydraulic adapters rated the same as steel?', answer: 'Not always. In Parker’s tables stainless 37° straights are rated higher than steel, elbows lower, ORFS and flareless equal, and metric 24° fittings lower. Rate from the maker’s stainless column.' },
        { question: 'How do I stop stainless fittings galling?', answer: 'Keep the maker’s pre-applied lubricant or plating on the nut, lubricate pipe threads with a sealant made for stainless, and avoid over-tightening dry threads.' },
        { question: 'What O-rings come in stainless hydraulic fittings?', answer: 'It depends on the maker: Parker’s SAE fittings use 90-durometer nitrile even in stainless; metric makers fit FKM (Viton) to stainless as standard. Specify FKM if the service needs it.' },
        { question: 'Should I use NPT in a stainless hydraulic system?', answer: 'Only where unavoidable. Taper threads gall easily in stainless, can crack ports and seal poorly under vibration. ORB, ORFS or BSPP with a seal are better.' },
        { question: 'What is the difference between BSPP and BSPT?', answer: 'BSPP is parallel and seals on the port face with a bonded or soft seal; BSPT is tapered and seals on the thread with sealant. Both have a 55° flank.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>316 stainless BSPP, BSPT, metric and NPT adapters, plugs and bonded seals:</p>' + stockList(['stainless-steel-bsp-metric-adapters', 'stainless-steel-npt-pipe-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Stainless thread adapters',
      skus: ['IH-SS-9005', 'IH-SS-9021', 'IH-SS-9059', 'IH-SS-9500V', 'IH-SS-9028', 'IH-SS-5404', 'IH-SS-5406', 'IH-SS-1404'],
    },
    { type: 'category_link', slug: 'stainless-steel-bsp-metric-adapters', label: 'Stainless BSP & metric adapters', blurb: 'BSPP, BSPT and metric adapters, plugs and bonded seals in 316.' },
    { type: 'category_link', slug: 'stainless-steel-npt-pipe-adapters', label: 'Stainless NPT adapters', blurb: 'NPT and NPSM swivel adapters, elbows, tees, plugs and bushings.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck machinery and offshore hydraulics.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'dnv-voss', text: 'DNV. Type Approval Certificate TAP0000167 — VOSS cutting-ring fittings, 2024.', url: 'https://www.voss.net/media/downloads/Aktuallisierung_Okt24/DNV_Certificate_TAP0000167_2SVA__ES-4__ES-4VA_23.08.2024-22.08.2029.pdf' },
        { id: 'swagelok-147', text: 'Swagelok. Pipe Fittings, MS-01-147.', url: 'https://www.swagelok.com/downloads/webcatalogs/en/ms-01-147.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-jic-fittings', 'stainless-orfs-and-orb-fittings', 'stainless-din-2353-and-flareless-bite-fittings', 'when-stainless-is-worth-it', 'ss316l-hydraulic-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, compatibility and galling measures from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure); sea-water approval and thread-connector limits from DNV.',
    },
    {
      type: 'cta_block',
      heading: 'Converting a system to stainless?',
      body: 'Send the fitting list or the ports, tube sizes and working pressure. We will quote every adapter in 316, with the seal material the service needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
