import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Crimp fittings for spiral hose, flange-head hose fittings and SAE flange hardware. Sources read 2026-10-21: Parker
 * Catalog 4400 US (77 Series for ISO 18752 387/487/787/797; 71 for R12; 79 for R15 792LT; 70 for phosphate-ester
 * F42; ISO 18752 constant-pressure hoses 3,000/4,000/5,000/6,000 psi; R12 722 4,000 psi -6 to -16, 3,000 at -20,
 * 2,500 at -24; 77 Series "SAE Code 61 Special Flange Head 5,000 psi"; ISO 12151-3 S-L = Code 61, S-S = Code 62;
 * minimum bend radius definition; §3.7 no sharp bend at the hose-fitting juncture); Parker 4400/UK high-pressure
 * section (No-Skive series 70 4SP / 73 4SH / 78 R13 / 79 R15 / 76 8,000 psi; ParLock skive VS, V4, V6 by hose and size;
 * Interlock definition; 4SH 731 pressures by size, falling; 4SP 701; R13 781 5,000 psi all sizes; R15 791/792TC 6,000
 * psi; S6 Code 61 SFL 5,000 / Code 62 SFS 6,000; internal and external skiving "into the direction of the spiral
 * layers", clean after; 2-piece fittings not on Parkrimp crimpers, 320 / 340 tons for V4 / V6; conicity measured in two
 * planes; "Do not lubricate if using spiral hose"); Danfoss 1W internal skive to 500 bar, 2 million flex impulse;
 * ISO 18752 class table (AC/BC/CC/DC). Listing copy (Parker 77 Series, own-label 71 and BW series; Supercat flange-on
 * fittings; split flange clamps; weld, socket-weld, threaded and blind SAE flanges, O-rings and bolts).
 * NOT used: failure mode of unskived skive-type hose.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'spiral-hose-crimp-fittings-guide',
  title: 'Spiral hose crimp fittings: 4SP, 4SH, R12, R13 and R15 — interlock, skive, flange heads and crimping',
  excerpt:
    'Spiral hose is where the pressures are highest and the crimps hardest: Parker’s R15 hose is rated 6,000 psi in every size, and its skive fittings need 320 to 340 tons of crimping force. The spiral range — crimp fittings in every end form, Code 61 and 62 flange heads, Supercat flange-on fittings, split flanges and SAE flange hardware — with how interlock and skive fittings grip the wire, ratings by hose class, and how to crimp and check them.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Spiral Hose Crimp Fittings: 4SH, R13, R15, Interlock & Flanges',
  seoDescription:
    'A guide to crimp fittings for four- and six-spiral hydraulic hose (4SP, 4SH, R12, R13, R15): interlock and skive fittings, pressure by hose class and size, SAE Code 61 and 62 flange heads, split flanges and crimping.',
  focusKeyword: 'spiral hose fittings',
  publishedAt: '2026-10-21T21:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Spiral hose (EN 856 4SP and 4SH, SAE 100R12, R13 and R15) carries the highest pressures, and its fittings grip the wire itself: Parker calls it Interlock — the reinforcement locked between shell and nipple.',
        'Two routes: no-skive interlock fittings, or skive fittings that need the cover and inner tube cut back; Parker’s ParLock skive fittings need 320–340 tons and an adjustable crimper.',
        'Ratings depend on the class: R13 is 5,000 psi and R15 6,000 psi at every size; 4SH falls from 6,000 psi at -12 to 3,600 psi at -32; R12 is 4,000 psi to -16.',
        'Large spiral hose usually ends in an SAE flange head: Code 61 (Parker’s 77 Series special head 5,000 psi) or Code 62 (6,000 psi) — ISO 12151-3 S-L and S-S.',
        'Do not lubricate spiral hose for assembly, skive in the direction of the spiral, and clean the hose after skiving.',
      ],
    },
    {
      type: 'lead',
      html: 'Excavator booms, mining shovels, presses and drilling rigs run four- and six-spiral hose, because braided hose cannot carry 5,000–6,000 psi at an inch and above. The fittings that go on it are heavier, the crimps harder, and the rules stricter than for braided hose. This guide covers the spiral crimp range and how to assemble it; for the braided side see <a href="/blog/braided-hose-crimp-fittings-guide">braided crimp fittings</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The spiral hose classes.', anchor: 'classes' },
    {
      type: 'comparison_table',
      caption: 'Spiral hose classes and Parker example ratings, psi',
      columns: ['Class', 'Parker hose', 'Rating', 'Parker fitting series'],
      rows: [
        { cells: ['EN 856 4SP', '701', '6,500 (-6) to 4,000 (-16)', '70 (Europe)'] },
        { cells: ['EN 856 4SH', '731', '6,000 (-12) to 3,600 (-32)', '73 (Europe); ParLock V4 skive'] },
        { cells: ['SAE 100R12', '722', '4,000 to -16; 3,000 at -20; 2,500 at -24', '71 / 43'] },
        { cells: ['SAE 100R13', '781', '5,000 at every size', '78 (Europe)'], highlight: true },
        { cells: ['SAE 100R15', '791TC / 792TC / 792LT', '6,000 at every size', '79'], highlight: true },
        { cells: ['ISO 18752 constant pressure', '387 / 487 / 787 / 797', '3,000 / 4,000 / 5,000 / 6,000, -4 to -32', '43 (small) / 77'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The EN 856 classes fall with size; R13, R15 and ISO 18752 hoses hold one pressure across their range, which makes them easier to standardise on a machine. ISO 18752 also grades hose by impulse life: class AC and BC at 100 °C for 200,000 and 500,000 cycles, CC and DC at 120 °C for 500,000 and 1,000,000. For the names, see <a href="/blog/en-853-856-857-vs-sae-100r">EN 853, 856 and 857 against SAE 100R</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Interlock and skive.', anchor: 'interlock' },
    {
      type: 'prose',
      html: '<p>Parker describes fittings that lock the metal reinforcement of the hose directly between the metal shell and nipple as <strong>Interlock</strong>. It offers two routes. <strong>Interlock No-Skive</strong> fittings (its 77 Series on 787TC and 797TC) are designed to engage the inside of the tube into the spiral wire. <strong>ParLock skive</strong> fittings need the hose prepared: external skive only (VS) on smaller 4SP, or internal and external skive (V4, V6) on 4SH and larger R13- and R15-class hoses. Danfoss offers an internal-skive spiral fitting to 500 bar (7,250 psi), tested to two million flex-impulse cycles.</p><p>Parker’s skiving rules: distinguish internal (inner tube) from external (cover) skiving; always skive in the direction of the spiral layers; clean the hose immediately afterwards with projectiles. Two-piece skive fittings must not be crimped on Parkrimp crimpers — only on adjustable crimpers, with at least 320 tons for V4 and 340 tons for V6 — and Parker measures their conicity at both ends of the ferrule in two planes 90° apart. And for any spiral hose: do not lubricate it for assembly.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Match the ferrule to the spiral hose exactly.',
      body: 'Spiral skive, interlock and no-skive ferrules are not interchangeable, and neither are spiral ferrules from different makers. Use the ferrule and crimp specification the hose maker lists for that hose and size — never a braided ferrule on spiral hose.',
    },

    { type: 'section_head', number: '/03', title: 'Flange heads and SAE flange hardware.', anchor: 'flanges' },
    {
      type: 'prose',
      html: '<p>From about -12 up, spiral hose usually ends in an SAE four-bolt flange head clamped to the port. ISO 12151-3 covers hose fittings with ISO 6162 flange ends; Parker marks Code 61 heads "S-L" and Code 62 heads "S-S". On its European S6 Series a Code 61 head is rated 5,000 psi and a Code 62 head 6,000 psi; its US 77 Series offers a "Code 61 Special Flange Head" at 5,000 psi; its 76 Series uses 8,000 psi flange heads. Our range includes straight, 45°, 90° and long-drop Code 61 and 62 heads, "Supercat" flange-on fittings with the flange already fitted, split flange clamp pairs with bolts, and SAE flanges for the pipe side — threaded, socket-weld, butt-weld and blind — with O-rings and bolt sets. See <a href="/blog/sae-flange-adapters-guide">SAE flange adapters</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Routing spiral hose.', anchor: 'routing' },
    {
      type: 'prose',
      html: '<p>Parker defines minimum bend radius as the smallest arc a hose can be bent to before its life is greatly reduced — beyond it, kinking, tube washout and overstressed reinforcement follow — and warns against sharp bending at the hose-to-fitting juncture and against installations that twist the hose. Spiral hose is stiff, so elbow heads and long-drop elbows earn their place: they let the hose leave the port in the direction it must go without a bend at the ferrule. When an assembly has two elbows, state the angle between them, measured clockwise.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an interlock hose fitting?', answer: 'A fitting that locks the hose’s spiral wire reinforcement directly between its shell and nipple. It may be no-skive or need the hose skived first, depending on the series.' },
        { question: 'Do spiral hoses need skiving?', answer: 'Some do. Parker’s No-Skive spiral series crimp over the cover; its ParLock skive series need the cover, and for V4 and V6 the inner tube too, cut back first.' },
        { question: 'What pressure is R13 and R15 hose rated for?', answer: 'Parker rates R13 hose at 5,000 psi and R15 at 6,000 psi in every size listed.' },
        { question: 'Is 4SH a constant-pressure hose?', answer: 'No. Parker’s 4SH falls from 6,000 psi at -12 to 3,600 psi at -32.' },
        { question: 'Code 61 or Code 62 flange head?', answer: 'Code 62 for the highest pressures — Parker rates its Code 62 heads 6,000 psi and Code 61 heads 5,000 psi on spiral hose. Match the head to the port’s code.' },
        { question: 'Can I crimp skive spiral fittings on any crimper?', answer: 'Parker says two-piece skive fittings must not be crimped on its Parkrimp crimpers — only on adjustable crimpers of at least 320–340 tons.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Crimp fittings for spiral hose — including Parker 77 Series and BW series — flange-head hose fittings, split flanges and SAE flanges:</p>' + stockList(['spiral-hose-crimp-fittings', 'bw-series-crimp-fittings', 'sae-flange-fittings', 'hydraulic-sae-flanges']),
    },
    {
      type: 'product_embed',
      heading: 'Spiral hose crimp fittings and flanges',
      skus: ['IH-CF71-C62', 'IH-CF71-C62-90', 'IH-CF71-C61', 'IH-CF71-JICF', 'IH-FL-SUPERCAT', 'IH-FL-CLAMP-62', 'IH-ST-BW-C6222', 'IH-CF-SK-4SH-IL'],
    },
    { type: 'category_link', slug: 'spiral-hose-crimp-fittings', label: 'Spiral hose crimp fittings', blurb: 'Crimp ends for 4SP, 4SH, R12, R13 and R15 hose.' },
    { type: 'category_link', slug: 'sae-flange-fittings', label: 'SAE flange hose fittings', blurb: 'Code 61 and 62 flange heads, Supercat fittings and clamps.' },
    { type: 'page_link', kind: 'industry', slug: 'mining', label: 'Mining', blurb: 'Shovels, excavators and haul fleet hydraulics.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4400-hp', text: 'Parker Hannifin. Catalogue 4400/UK — High pressure hose and fittings.', url: 'https://www.parker.com/content/dam/parker/lam/catalogs/pdf/4---conectores---mangueiras---v%C3%A1lvulas---instrumentos-para-flu%C3%ADdos/6---mangueiras-e-conex%C3%B5es/05_C4400_UK_High_Pressure_Hose_and_Fi.pdf' },
        { id: 'parker-4400-uk', text: 'Parker Hannifin. Catalogue 4400/UK — Technical Handbook.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Polymer-Hose-Division-Europe/Sales-and-Marketing-Bulletins/4400_Rubber-Hydraulic/Technical-Handbook-UK.pdf' },
        { id: 'danfoss-hose', text: 'Danfoss (Aeroquip). Rubber Hydraulic Hose & Fitting Catalog.', url: 'https://assets.danfoss.com/documents/latest/407914/AF447562429531en-010106.pdf' },
        { id: 'iso-12151-3', text: 'ISO 12151-3:2021 — Hose fittings with ISO 6162 flange ends (abstract).', url: 'https://www.iso.org/standard/79705.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['braided-hose-crimp-fittings-guide', 'braided-vs-spiral-hose-fittings', 'skiving-and-fitting-selection', 'sae-j518-code-61-code-62-flanges', 'sae-flange-adapters-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Hose classes, ratings, interlock and skive rules from Parker Catalog 4400 (US and UK); Danfoss spiral fitting data; ISO 12151-3 scope.',
    },
    {
      type: 'cta_block',
      heading: 'Spiral assemblies to build?',
      body: 'Send the hose make and class, the size, both ends and the flange code. We will quote the matching fittings and ferrules, or the finished assembly.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
