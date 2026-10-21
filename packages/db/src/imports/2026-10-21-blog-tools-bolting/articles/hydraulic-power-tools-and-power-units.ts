import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Open-centre hydraulic power tools (STANLEY) and the HTMA flow classes. Sources read 2026-10-21: STANLEY TP08 and
 * MHP3 user manuals (HTMA table: Type I 4–6 gpm, II 7–9, RR 9–10.5, III 11–13; 1500 psi nominal; relief 2100–2250
 * psi (RR 2200–2300); 250 psi max back pressure; 140 °F max fluid; 25 micron filtration; 20–82 cSt; open-centre
 * warning); BR67 and BR50 breaker manuals (Type II / I & II, Category D, hoses rated 2500 psi); HP8 spec sheet
 * (5 or 8 gpm at 2000 psi, open centre); TP08 pump (800 gpm water, 7–10 gpm drive).
 * NOT used: manual cooling kW figures for RR and III (appear transposed); HP8 circuit-type wording (contradicts itself);
 * EHTMA category letters (not all extracted).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-power-tools-and-power-units',
  title: 'Hydraulic power tools: HTMA flow classes, power units and running tools off a machine',
  excerpt:
    'Hydraulic breakers, saws, drills, grinders and submersible pumps run on open-centre circuits sorted into HTMA classes by flow — Type I at 4–6 gpm, Type II at 7–9, Type III at 11–13. Match the tool to the class of the power unit or carrier, keep back pressure and oil temperature inside the limits, and never connect an open-centre tool to a closed-centre system. The figures from STANLEY’s manuals, and what to check before ordering.',
  categorySlug: 'hydraulic-tools-bolting',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Power Tools: HTMA Classes & Power Units',
  seoDescription:
    'How open-centre hydraulic power tools work: HTMA Type I, II, RR and III flow and pressure classes, relief and back-pressure limits, filtration and oil, power units, breakers and submersible pumps, and the closed-centre warning.',
  focusKeyword: 'hydraulic power tools',
  publishedAt: '2026-10-21T23:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'HTMA classes are set by flow: Type I 4–6 gpm, Type II 7–9 gpm, Type RR 9–10.5 gpm, Type III 11–13 gpm.',
        'STANLEY’s manuals give 1,500 psi nominal operating pressure and a 2,100–2,250 psi relief setting for these classes.',
        'Back pressure at the tool’s return must stay under 250 psi, and the oil under 140 °F (60 °C).',
        'Never connect an open-centre tool to a closed-centre hydraulic system.',
        'Choose the power unit by the class of the tool, not by its engine size.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic breaker, chain saw or submersible pump carries no engine. It runs on oil from a portable power unit, or from the auxiliary circuit of an excavator, skid steer or truck — which is why one power unit can drive a whole kit of tools on a construction, utility or rail job. The catch is that tool and power source have to agree on flow and pressure, and the industry’s HTMA classes are how they agree.',
    },

    { type: 'section_head', number: '/01', title: 'HTMA classes.', anchor: 'htma' },
    {
      type: 'comparison_table',
      caption: 'HTMA hydraulic system requirements, as printed in STANLEY tool manuals',
      columns: ['Requirement', 'Type I', 'Type II', 'Type RR', 'Type III'],
      rows: [
        { cells: ['Flow', '4–6 gpm (15–23 lpm)', '7–9 gpm (26–34 lpm)', '9–10.5 gpm (34–40 lpm)', '11–13 gpm (42–49 lpm)'], highlight: true },
        { cells: ['Nominal operating pressure', '1,500 psi (103 bar)', '1,500 psi', '1,500 psi', '1,500 psi'] },
        { cells: ['System relief setting', '2,100–2,250 psi', '2,100–2,250 psi', '2,200–2,300 psi', '2,100–2,250 psi'] },
        { cells: ['Max. back pressure at tool return', '250 psi (17 bar)', '250 psi', '250 psi', '250 psi'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Across all classes STANLEY specifies: oil no hotter than 140 °F (60 °C), full-flow filtration at 25 microns sized for at least 30 gpm, and premium anti-wear, non-conductive petroleum fluid at 100–400 SSU (20–82 cSt). The relief setting caps the pressure the tool can see; the back-pressure limit is why return hoses must not be undersized or run through restrictive couplers.</p><p>Each tool is rated for one or more classes — a STANLEY BR67 breaker, for example, is Type II, 7–9 gpm; the BR50 is offered for Type I or Type II. Running a tool above its class over-speeds and overheats it; running it below makes it slow and weak.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Open-centre tools on closed-centre systems.',
      body: 'STANLEY’s manuals warn in capitals: do not connect open-centre tools to closed-centre hydraulic systems — it can cause loss of other functions powered by the same system and severe personal injury. Check the carrier’s circuit before plugging a tool in.',
    },

    { type: 'section_head', number: '/02', title: 'Power units and tools.', anchor: 'units' },
    {
      type: 'prose',
      html: '<ul><li><strong>Power units</strong> are petrol, diesel or electric packs with an open-centre pump, tank, filter and cooler. STANLEY’s HP8, for example, gives 5 or 8 gpm at 2,000 psi through HTMA flush-face couplers. Choose by the flow class of the tools, and whether two tools must run at once.</li><li><strong>Percussion tools</strong> — breakers, rock drills, post drivers — carry the highest duty; STANLEY asks for hoses rated to at least 2,500 psi.</li><li><strong>Cutting tools</strong> — chain saws, cut-off saws, pruners — and <strong>grinders, wrenches and drills</strong> run continuously, so oil temperature and cooling matter.</li><li><strong>Submersible pumps</strong> move water without electricity at the pump: STANLEY’s TP08 moves up to 800 gpm of water on a 7–10 gpm drive.</li><li><strong>Rail maintenance tools</strong> — spike drivers, rail saws, drills and tie tampers — run from the same circuits.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an HTMA Type II tool?', answer: 'A tool designed for 7–9 gpm (26–34 lpm) of flow on an open-centre circuit, at 1,500 psi nominal with a 2,100–2,250 psi relief, per the HTMA table in STANLEY’s manuals.' },
        { question: 'Can I run a hydraulic breaker off my excavator?', answer: 'Yes, if the auxiliary circuit is open-centre and its flow and relief match the tool’s HTMA class. Do not connect it to a closed-centre circuit.' },
        { question: 'Why is my hydraulic tool overheating?', answer: 'Common causes are too much flow for the tool’s class, high back pressure from undersized return hoses or couplers, or not enough cooling — STANLEY limits oil to 140 °F (60 °C).' },
        { question: 'What hose do hydraulic breakers need?', answer: 'STANLEY’s breaker manuals ask for hoses rated for a minimum working pressure of 2,500 psi (172 bar).' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>STANLEY hydraulic power units and tools:</p>' + stockList(['hydraulic-power-tools']),
    },
    {
      type: 'product_embed',
      heading: 'Hydraulic power tools',
      skus: ['IH-STN-HPU', 'IH-STN-PT', 'IH-STN-CTT', 'IH-STN-SP', 'IH-STN-WD', 'IH-STN-G', 'IH-STN-RMT', 'IH-STN-HT'],
    },
    { type: 'category_link', slug: 'hydraulic-power-tools', label: 'Hydraulic power tools', blurb: 'Breakers, saws, grinders, drills, pumps and power units.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Breaking, cutting and dewatering on site.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'stanley-tp08', text: 'STANLEY. TP08 submersible pump user manual (HTMA / EHTMA requirements table).', url: 'https://www.industrialtoolsandattachments.com/content/dam/brands/industrialtoolsandattachments/stanley/manuals/pumps/STANLEY%20-%20TP08013H%20User%20Manual%204-2024%20Ver28.pdf' },
        { id: 'stanley-br67', text: 'STANLEY. BR67 hydraulic breaker user manual.', url: 'https://www.industrialtoolsandattachments.com/content/dam/brands/industrialtoolsandattachments/stanley/manuals/breakers/BR67%20User%20Manual%2004-2024%20v38.pdf' },
        { id: 'stanley-hp8', text: 'STANLEY. HP8 power unit specification sheet (March 2025).', url: 'https://www.industrialtoolsandattachments.com/content/dam/brands/industrialtoolsandattachments/stanley/spec-sheets/core-product-list/power-units/STANLEY%20-%20Spec%20Sheet%20-%20HP8%20Power%20Unit%20-%20March%202025.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['water-suction-and-dewatering-hose', 'hydraulic-pump-types-gear-vane-piston', 'skid-steer-hydraulic-hose', 'construction-dewatering-hose-gcc'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'HTMA classes, limits and tool figures from STANLEY manuals and spec sheets.',
    },
    {
      type: 'cta_block',
      heading: 'Kitting out a tool trailer?',
      body: 'Send the tools you need, the carrier or power unit you have, and its flow and pressure if you know them. We will match the tools, power unit, hoses and couplers to one HTMA class.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
