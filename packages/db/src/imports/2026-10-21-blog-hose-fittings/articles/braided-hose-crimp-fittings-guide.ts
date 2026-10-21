import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Crimp fittings and ferrules for wire-braided hose. Sources read 2026-10-21: Parker Catalog 4400 US (series and
 * "use with hose" lists — 43 Series for 1SN/R1AT 422/482, 2SN/R2AT 302, 2SC 471TC, R16 436, R12 722, ISO 18752
 * 387/487; part-number structure 1JC43-12-8C; 2SN and 1SN working pressures by dash; 4:1 design factor; safety guide
 * "DO NOT MIX & MATCH", three tenets per SAE J1273, §3.2 / §3.3 / §3.5 (no reuse of crimped fittings); crimp diameter
 * measured on the flats, crimper decal; eight-segment dies colour coded and stamped with series and dash; assembly
 * rated at its weakest component); Parker 4400/UK (same 302 hose takes 48 Series in Europe; No-Skive principle;
 * insertion depth marking; Crimpsource); Gates crimp manual (skive / buff definitions; most Gates products no longer
 * need skiving; crimp chart columns; crimp OD ±0.005" / ±0.010" by family; measure at the centre of the crimp, on the
 * flats; cut within 5° of square) and catalogue ("A 3,000 psi coupling on a 3,000 psi hose doesn't always equal a
 * 3,000 psi assembly"; mix-and-match restricted); Danfoss (non-skive definition; STAMPED). Listing copy (43 Series and
 * own-label braided crimp ends by end form; no-skive and skive ferrules for 1SN/2SN, R1A/R2A, 1ST/2ST, R12, 4SP, 4SH,
 * R13, R7/R8, R5, PTFE, A/C; Manuli ferrules).
 * NOT used: consequence of not skiving a skive-type hose (no maker statement); 2SC pressures by size.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'braided-hose-crimp-fittings-guide',
  title: 'Crimp fittings for braided hydraulic hose: series, ferrules, skive or no-skive, and the crimp diameter',
  excerpt:
    'Gates puts it bluntly: a 3,000 psi coupling on a 3,000 psi hose does not always make a 3,000 psi assembly. What makes it one is a fitting series approved for that hose, the matching ferrule, the right die and a crimp diameter inside a tolerance of a few thousandths of an inch. Crimp fittings and ferrules for 1SN, 2SN, 2SC and R16 braided hose — the end forms, skive and no-skive, ratings by size, and how to check a crimp.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Braided Hose Crimp Fittings: Series, Ferrules, Crimp Diameter',
  seoDescription:
    'A guide to crimp fittings for braided hydraulic hose (1SN, 2SN, 2SC, R16): fitting series and hose matching, skive and no-skive ferrules, 2SN and 1SN pressures by size, crimp specifications and measuring crimp diameter.',
  focusKeyword: 'hydraulic hose crimp fittings',
  publishedAt: '2026-10-21T21:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A crimp fitting belongs to a series, and a series is approved for listed hoses only: Parker’s 43 Series covers 1SN, 2SN, 2SC and R16 braided hose (and some spiral) in the US — and the same 2SN hose takes 48 Series in Parker’s European catalogue.',
        'Parker’s rule, after SAE J1273: same make of hose and fitting, a crimper approved by that maker, crimp only to the maker’s specification — and do not mix and match.',
        'Most modern braided hose is no-skive: the ferrule crimps over the cover. Skive ferrules need the cover removed to the reinforcement first.',
        'Check every crimp: measure the diameter on the flats at the middle of the crimp; Gates gives tolerances of ±0.005" or ±0.010" depending on coupling family.',
        'An assembly is rated to its weakest part: 2SN hose is 5,800 psi at -4 and 2,400 psi at -16, and the fitting end may be lower still.',
      ],
    },
    {
      type: 'lead',
      html: 'Two-wire braided hose is the workhorse of mobile and industrial hydraulics, and almost every assembly made in a hose shop is braided hose with two crimped ends. The crimp is the part that fails if anything in the chain is wrong — the wrong series, the wrong ferrule, the wrong die or a crimper set by feel. This guide covers the braided crimp range and how to make an assembly that holds its rating. For braided against spiral fittings see <a href="/blog/braided-vs-spiral-hose-fittings">braided vs spiral</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Series, and why they do not mix.', anchor: 'series' },
    {
      type: 'prose',
      html: '<p>Hose fittings are designed as a system with particular hoses. In Parker’s US catalogue the <strong>43 Series</strong> is listed for 1SN and 2SN (100R1AT, 100R2AT), EN 857 2SC, 100R16 and ISO 18752 braided hose, among others; its part numbers read connection, series, end size and hose size — 1JC43-12-8 is a crimp, female ORFS swivel, 43 Series, -12 end on -8 hose. The same 2SN hose is paired with 48 Series fittings in Parker’s European catalogue. Every maker publishes such lists, and none of them cross over.</p><p>Parker’s safety guide is explicit: do not mix and match — components from different manufacturers should not be combined into hose assemblies. Its three tenets, consistent with SAE J1273: only assemble hoses and fittings of the same make; always use a crimper approved by the maker of the hose and fittings; crimp only to the maker’s specification. Gates lists mix-and-match hose and couplings among its restricted applications.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never reuse a crimped fitting.',
      body: 'Parker: do not reuse a permanent (crimped or swaged) hose fitting or any part of it, and do not fit new ends to hose that has been in service. EN ISO 4413 likewise forbids building hose assemblies from components already used in another assembly.',
    },

    { type: 'section_head', number: '/02', title: 'Ferrules, skive and no-skive.', anchor: 'ferrules' },
    {
      type: 'prose',
      html: '<p>A crimp fitting is a stem (the nipple with the end connection) and a ferrule (the shell crimped over the hose). Some series are one-piece with the ferrule attached; others, like the ferrules in our range, are separate and chosen for the hose. Gates defines <strong>skiving</strong> as removing the hose cover down to the reinforcement, with a wire wheel or hand tool, and <strong>buffing</strong> as removing some cover while still leaving the reinforcement covered; Danfoss notes that a skive can remove the cover, the inner tube or both. Most current braided hose is <strong>no-skive</strong> — Parker’s No-Skive principle is that the reinforcement stays intact through the progressive compression of the crimp, with no tool and no cover removal — and Gates says most of its products no longer need skiving. Skive ferrules remain for some hose types (older R1A/R2A and 1ST/2ST, and most four- and six-spiral hose); get the skive length right and do not damage the wire. See <a href="/blog/skiving-and-fitting-selection">skiving explained</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Ratings: the hose, then the end.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker braided hose working pressure by dash size, psi (4:1 design factor)',
      columns: ['Dash', '1SN / 100R1AT (422)', '2SN / 100R2AT (302)'],
      rows: [
        { cells: ['-4 (1/4")', '3,250', '5,800'], highlight: true },
        { cells: ['-6 (3/8")', '2,600', '4,750'] },
        { cells: ['-8 (1/2")', '2,325', '4,000'] },
        { cells: ['-12 (3/4")', '1,525', '3,100'] },
        { cells: ['-16 (1")', '1,275', '2,400'], highlight: true },
        { cells: ['-20 (1-1/4")', '900', '1,800'] },
        { cells: ['-24 (1-1/2")', '725', '1,300'] },
        { cells: ['-32 (2")', '575', '1,150'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s rule: the maximum working pressure of an assembly is the lower of the published maximums of the hose and the fittings used. A JIC or NPT end can sit below the hose rating — see <a href="/blog/jic-adapters-guide">JIC adapter ratings</a> — and Gates adds that hose OD and crimp tolerances stack, so an assembly built at the edge of both loses life. Braided hose ratings fall with size; for large bores at high pressure, use spiral hose (<a href="/blog/spiral-hose-crimp-fittings-guide">spiral crimp fittings</a>).</p>',
    },

    { type: 'section_head', number: '/04', title: 'Making and checking the crimp.', anchor: 'crimp' },
    {
      type: 'prose',
      html: '<ul><li><strong>Cut square</strong> — Gates: within 5° of perpendicular to meet SAE and ISO standards — and clean the bore.</li><li><strong>Mark the insertion depth</strong> on the hose and push the stem fully home; Parker allows a drop of hose oil on braided hose.</li><li><strong>Select the die</strong> by hose size and type from the crimper’s chart; Parker’s eight-segment dies are colour-coded and stamped with series and dash size.</li><li><strong>Crimp to the chart diameter.</strong> A maker’s crimp chart lists hose and stem, crimp length and crimp OD with tolerance, crimper, die set and setting.</li><li><strong>Measure it.</strong> Gates: measure at the centre of the crimp length, on the flats, not the ridges; tolerances are ±0.005" for swaged couplings and ±0.010" for crimp OD on other families. Parker: never use an assembly with an incorrect crimp diameter.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Which ferrule?',
      branches: [
        { condition: '1SN or 2SN hose (EN 853), no-skive?', outcome: 'No-skive ferrule for 1SN / 2SN.', sku: 'IH-CF-NS-1SN2SN' },
        { condition: 'R1AT or R2AT (SAE 100R1AT / R2AT)?', outcome: 'No-skive ferrule for R1AT / R2AT.', sku: 'IH-CF-NS-R2T2SN' },
        { condition: 'Older R1A / R2A or 1ST / 2ST with a thick cover?', outcome: 'Skive ferrule — remove the cover to the wire first.', sku: 'IH-CF-SK-R2A2ST' },
        { condition: 'Four-spiral 4SP / 4SH / R12, or R13?', outcome: 'A spiral skive or interlock ferrule — see spiral crimp fittings.', sku: 'IH-CF-SK-4SH-IL' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I use one brand’s fittings on another brand’s hose?', answer: 'Makers say no: Parker’s safety guide says do not mix and match hose and fittings from different manufacturers, and to crimp only to the maker’s specification with an approved crimper.' },
        { question: 'What is a no-skive fitting?', answer: 'A fitting and ferrule designed to crimp over the hose cover, so the cover does not have to be stripped to the reinforcement first.' },
        { question: 'What pressure is 2SN hose rated for?', answer: 'Parker’s 2SN (302) is 5,800 psi at -4, 4,000 psi at -8, 2,400 psi at -16 and 1,150 psi at -32. The assembly is rated to the lower of hose and fitting.' },
        { question: 'How do I check a crimp?', answer: 'Measure the crimp diameter at the middle of the crimp, on the flats, with calipers, and compare it with the maker’s chart; Gates’ tolerances are ±0.005" or ±0.010" depending on the coupling family.' },
        { question: 'Can I reuse a crimp fitting?', answer: 'No. Parker forbids reusing any part of a crimped fitting, and EN ISO 4413 forbids building assemblies from used components.' },
        { question: 'What does 1JC43-12-8 mean?', answer: 'A Parker part number: 1 = crimp, JC = female ORFS swivel, 43 = fitting series, 12 = end size, 8 = hose size.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Crimp fittings for braided hose — including Parker 43 Series — and skive, no-skive and Manuli ferrules:</p>' + stockList(['braided-hose-crimp-fittings', 'crimp-ferrules', 'ferrules']),
    },
    {
      type: 'product_embed',
      heading: 'Braided hose crimp fittings',
      skus: ['IH-CF43-JICF', 'IH-CF43-JICF-90', 'IH-CF43-BSPF', 'IH-CF43-DINLF', 'IH-CF43-C61', 'IH-CF-NS-1SN2SN', 'IH-CF-NS-R2T2SN', 'IH-FER-M00310'],
    },
    { type: 'category_link', slug: 'braided-hose-crimp-fittings', label: 'Braided hose crimp fittings', blurb: 'Crimp ends for 1SN, 2SN, 2SC and R16 hose in every end form.' },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Skive, no-skive and interlock ferrules by hose type.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4400-uk', text: 'Parker Hannifin. Catalogue 4400/UK — Technical Handbook.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Polymer-Hose-Division-Europe/Sales-and-Marketing-Bulletins/4400_Rubber-Hydraulic/Technical-Handbook-UK.pdf' },
        { id: 'gates-crimp', text: 'Gates. Crimp Data and Dies manual.', url: 'https://www.gates.com/content/dam/documents-library/operating-manuals/crimp-data-and-dies-manual.pdf' },
        { id: 'gates-cat', text: 'Gates. Hydraulic Hoses & Couplings Product & Application Guide 2024.', url: 'https://www.gates.com/content/dam/documents-library/catalogs/gates-hydraulic-catalogue-in-en.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['braided-vs-spiral-hose-fittings', 'skiving-and-fitting-selection', 'spiral-hose-crimp-fittings-guide', 'crimped-reusable-or-ready-made-hose-assemblies', 'hose-burst-at-the-fitting', 'en-853-856-857-vs-sae-100r'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Series, ratings, safety rules and crimp checks from Parker Catalog 4400 (US and UK), Gates and Danfoss literature.',
    },
    {
      type: 'cta_block',
      heading: 'Making up braided assemblies?',
      body: 'Send the hose make and type, the size and both end forms. We will quote fittings and ferrules from the matching series, or the finished assembly.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
