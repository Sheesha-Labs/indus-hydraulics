import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * 316L stainless hydraulic hose fittings. Sources read 2026-10-21: Parker Catalog 4300 (2017; current 9/2023) fluid
 * compatibility Table T13 (sea water and brine NR for steel, S for 316); zinc-coated steel not recommended for food and
 * beverage; stainless nuts coated / pre-lubricated against galling; O-ring defaults (SAE NBR, metric stainless FKM);
 * SAE J518 Code 61 / 62 (6,000 psi through 2" Code 62). DNV TAP0000167 (316Ti approved for sea water incl. open deck,
 * "cannot be considered immune"). Outokumpu / Alleima (316L composition, PREN 24, chloride SCC above 60 °C). Listing
 * copy (316L passivated, no plating; BSP, JIC, ORFS, NPSM, metric 24°, SAE flange, banjo, double-hex and standpipe
 * forms; "pressure rating tracks the host hose grade").
 * NOT used: crimp diameters for stainless (maker-specific, not researched); any stainless hose-end impulse figure.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-316l-hose-fittings',
  title: '316L stainless hose fittings: when a hose end has to be stainless, and the forms available',
  excerpt:
    'On a deck crane or a washdown line the hose often outlives its plated fittings — the ends rust first. 316L stainless hose fittings fix that, in every common end form: BSP 60° cone and flat seat, JIC 37°, ORFS, NPSM, metric 24°, SAE Code 61 and 62 flange heads, banjos, double-hex swivels and standpipes. When stainless is worth it, what changes with a stainless hose end, and how to specify one.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: '316L Stainless Hose Fittings: Forms, Uses and How to Specify',
  seoDescription:
    'A guide to 316L stainless steel hydraulic hose fittings: when stainless hose ends are needed, BSP, JIC, ORFS, NPSM, metric 24°, SAE flange, banjo and standpipe forms, galling, O-rings, crimping and ordering.',
  focusKeyword: 'stainless steel hose fittings',
  publishedAt: '2026-10-21T21:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stainless hose ends are a corrosion choice: Parker rates steel fittings "not recommended" in sea water and brine and 316 "satisfactory", and does not recommend zinc-coated steel for food and beverage.',
        '316L stainless hose fittings come in the same end forms as steel — BSP, JIC, ORFS, NPSM, metric 24° cone, SAE flange heads, banjos — plus standpipes for weld, tube and DIN connections.',
        'A hose fitting is rated with its hose and ferrule as an assembly; crimp a stainless fitting only to the crimp specification for that fitting, ferrule and hose.',
        'Stainless swivel nuts gall when run up dry: keep the maker’s lubricant or coating, and lubricate threads on assembly.',
        'Specify the O-ring compound on O-ring ends; FKM is the usual stainless choice for heat and aggressive fluids.',
      ],
    },
    {
      type: 'lead',
      html: 'Offshore, on ships, on coastal plant and in food and chemical factories, a hydraulic hose can be in good condition when its fittings have already rusted through the plating at the swivel nut and crimp. The fix is a stainless hose end — and, ideally, stainless adapters behind it. This guide covers when 316L hose fittings are worth it and the forms in the range; for stainless adapters see <a href="/blog/stainless-hydraulic-adapters-guide">stainless hydraulic adapters</a>.',
    },

    { type: 'section_head', number: '/01', title: 'When a hose end should be stainless.', anchor: 'when' },
    {
      type: 'prose',
      html: '<p>Parker’s compatibility chart rates steel fittings "not recommended" in sea water and brine and 316 stainless "satisfactory", and it does not recommend zinc-coated steel where low toxicity and low corrosion are required, as in food and beverage. DNV, approving a maker’s 316Ti fittings for sea-water service — which it defines to include piping on open deck — still notes that stainless "cannot be considered immune" in every situation. So the cases are: decks, splash zones and coastal plant; washdown and food lines; chemical and fertiliser plant; and any line where rust on a fitting would contaminate the process. 316L is the grade for chlorides; it can still stress-corrosion crack above about 60 °C where chlorides concentrate — see <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The forms.', anchor: 'forms' },
    {
      type: 'comparison_table',
      caption: '316L stainless hose fitting forms',
      columns: ['Form', 'Seals on', 'Where used'],
      rows: [
        { cells: ['BSP female swivel — 60° cone, with or without O-ring', 'The 60° cone of the male (BS 5200)', 'British, European and Asian equipment'], highlight: true },
        { cells: ['BSP flat seat / BSPT male', 'A flat face with a seal / the taper thread', 'BSP ports and flat-face swivels'] },
        { cells: ['JIC 37° female swivel and male', 'The 37° cone', 'North American and inch equipment'] },
        { cells: ['ORFS female swivel and male', 'O-ring in the male face', 'Vibration and higher pressure'] },
        { cells: ['NPSM female swivel, NPT male', 'The seat of the male NPT; NPT on the thread', 'Pipe-thread ports'] },
        { cells: ['Metric 24° cone female swivel with O-ring, male stud', 'The 24° cone and O-ring', 'DIN 2353 / ISO 8434-1 systems'] },
        { cells: ['SAE Code 61 / 62 flange heads, split flanges, seals', 'O-ring under a four-bolt flange', 'Large, high-pressure ports'] },
        { cells: ['Banjo (BSP, metric)', 'Washers either side of the eye', 'Tight spaces'] },
        { cells: ['Standpipes — weld, gas tube, DIN, double crimp', 'Tube end for a tube fitting or weld', 'Hose to tube or pipe'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>Double-hex</strong> swivels carry a second hex behind the nut so the fitting can be held while the nut is turned, which keeps the hose from twisting during make-up. Standpipes give a hose a plain tube end, for a cutting-ring fitting, a weld or a gas-tube connection. Flange heads are offered in Code 61 (3,000 psi class) and Code 62 (6,000 psi class) — Code 62 is rated 6,000 psi through 2" — with stainless split flanges, counter-flanges and seals to clamp them. Our range also includes hexagon nuts and standpipes for high-pressure washdown machines.</p>',
    },

    { type: 'section_head', number: '/03', title: 'What changes with a stainless hose end.', anchor: 'changes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Rating.</strong> A hose fitting is rated as an assembly with its hose and ferrule; our listings say the rating tracks the hose grade. Rate the assembly from the hose and fitting maker’s published figures, not from the fitting alone.</li><li><strong>Crimping.</strong> Crimp a stainless fitting and ferrule only to the crimp specification for that combination and hose; a crimp chart for steel ends is not a stainless chart. See <a href="/blog/braided-hose-crimp-fittings-guide">braided crimp fittings</a>.</li><li><strong>Galling.</strong> Stainless threads gall when run up dry. Makers coat or pre-lubricate stainless nuts; keep that coating, and lubricate the thread with system fluid or a suitable anti-seize.</li><li><strong>O-rings.</strong> On ORFS, 24° O-ring cones and flange heads, specify the compound — makers fit FKM to many stainless fittings as standard; nitrile is the usual steel default.</li><li><strong>One material through the line.</strong> A stainless hose end on a plated adapter in salt air leaves the adapter to rust; plan the adapters in 316 too.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'When should I use stainless hose fittings?', answer: 'Where plated steel corrodes or contaminates: decks and splash zones, coastal plant, washdown, food, chemical and fertiliser service. Parker rates steel "not recommended" in sea water and brine.' },
        { question: 'Are stainless hose fittings rated the same as steel?', answer: 'The rating belongs to the assembly — hose, fitting and ferrule together. Use the hose and fitting maker’s published figure for the stainless combination.' },
        { question: 'Can I crimp stainless fittings with my steel crimp chart?', answer: 'No. Crimp stainless fittings and ferrules only to the crimp specification for that stainless combination and hose.' },
        { question: 'Why do stainless swivel nuts seize?', answer: 'Stainless threads gall when tightened dry. Keep the maker’s coating or lubricant and lubricate on assembly.' },
        { question: 'What is a double-hex hose fitting?', answer: 'A swivel fitting with a second hex behind the nut, so the body can be held while the nut is turned and the hose does not twist.' },
        { question: 'What is a standpipe?', answer: 'A hose fitting with a plain tube end instead of a threaded swivel — to fit a cutting-ring tube fitting, a weld or a gas-tube connection.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>316L stainless hose fittings, flange hardware and standpipes:</p>' + stockList(['ss316l-bsp-fittings', 'ss316l-jic-37-fittings', 'ss316l-orfs-fittings', 'ss316l-npt-npsm-fittings', 'ss316l-metric-fittings', 'ss316l-sae-fittings', 'ss316l-sae-flanges-for-hoses', 'ss316l-banjos', 'ss316l-double-hexagonal-fittings', 'ss316l-standpipes', 'ss316l-hydrowashing-couplings']),
    },
    {
      type: 'product_embed',
      heading: '316L stainless hose fittings',
      skus: ['IH-SS-BSP-013', 'IH-SS-BSP-010', 'IH-SS-JIC-001', 'IH-SS-ORFS-005', 'IH-SS-MET-001', 'IH-SS-SAE-006', 'IH-SS-FL-003', 'IH-SS-SP-006'],
    },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'Stainless hydraulic hose fittings', blurb: '316L hose ends, flanges, banjos and standpipes.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Deck machinery and offshore hose lines.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'dnv-voss', text: 'DNV. Type Approval Certificate TAP0000167 — VOSS fittings, 2024.', url: 'https://www.voss.net/media/downloads/Aktuallisierung_Okt24/DNV_Certificate_TAP0000167_2SVA__ES-4__ES-4VA_23.08.2024-22.08.2029.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hydraulic-adapters-guide', 'ss316l-hydraulic-fittings', '304-vs-316-stainless-steel-fittings', 'braided-hose-crimp-fittings-guide', 'when-stainless-is-worth-it'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Compatibility, galling and O-ring guidance from Parker Catalog 4300 (2017 edition); sea-water approval from DNV; forms from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Need stainless hose ends?',
      body: 'Send the hose type and size, both end forms and the working pressure. We will quote 316L fittings and ferrules matched to the hose, and the adapters behind them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
