import type { BlogArticleSeed } from '../shared'

/**
 * Stainless vs galvanized rigging in Gulf coastal air.
 *
 * Sources checked 2026-10-01: American Galvanizers Association (ISO 9223
 * first-year zinc corrosion rates C1–CX; hydrogen embrittlement above 150 ksi
 * UTS); Galvanizers Association (ISO 1461 coating thicknesses); IMOA (PREN
 * formula; galvanic corrosion, area ratio, the galvanized-bolts-on-stainless
 * example); SSINA (chloride stress corrosion cracking rare below ~60 °C fully
 * immersed, but wet/dry concentration can crack well below); ASSDA (tea
 * staining; smooth finish); Kito Crosby chain warnings (no galvanizing or
 * plating of chain); WorkSafe WA Bulletin No. 1 (2022) on alloy chain
 * embrittlement near plating/galvanizing; Crosby G-209/S-209 single rating
 * table for galvanized and self-coloured.
 * PREN 19 / 24 for 304 / 316 is from a supplier table (secondary) — used as
 * "about". Coating-life figures are our arithmetic on first-year rates and are
 * labelled as rough, upper-rate estimates.
 * Deliberately no ratings from the stainless families awaiting supplier
 * confirmation; the shackle comparison uses rows already used in the live
 * shackle article.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-vs-galvanized-rigging-gulf',
  title: 'Stainless vs galvanized rigging in Gulf coastal air: what lasts, and what carries less',
  excerpt:
    'On the Gulf coast, zinc on galvanized rigging can be lost at up to 8 µm a year, and faster offshore. Stainless steel does not rust away, but it pits in salt air, can crack in hot chloride conditions, and is usually rated well below carbon or alloy steel of the same size. Here is how to choose.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless vs galvanized rigging in coastal and marine air',
  seoDescription:
    'Galvanized vs stainless steel rigging in Gulf coastal and offshore conditions: zinc corrosion rates, 304 vs 316, chloride cracking, galvanic corrosion, and the rating trade-off.',
  focusKeyword: 'stainless vs galvanized rigging',
  publishedAt: '2026-10-01T12:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Galvanized rigging is protected by a sacrificial zinc layer that is used up over time — in the first year of exposure, 4.2–8.4 µm a year in very high (C5) atmospheres and up to 25 µm in extreme (CX) ones.',
        'Stainless steel does not need a coating, but it pits and tea-stains in salt air. 316, with molybdenum, resists this far better than 304.',
        'Austenitic stainless can suffer chloride stress corrosion cracking in hot conditions, especially where salt deposits dry and concentrate.',
        'Stainless lifting hardware is usually rated well below carbon or alloy steel of the same size. Our 3/4″ stainless anchor shackle is rated about 2 t; a G-209 pattern carbon shackle of that size, 4.75 t.',
        'Alloy lifting chain and Grade 80/100 fittings are not galvanized or plated: the process can embrittle them.',
      ],
    },
    {
      type: 'lead',
      html: 'Salt air, high humidity, heat and dust make the Gulf coast hard on rigging. The usual answer — “use stainless” — solves one problem and can create two others: a much lower rating, and corrosion modes that do not show as rust. Galvanizing has its own limit: it is a coating with a lifespan. The right choice depends on what the part does and where it lives.',
    },

    { type: 'section_head', number: '/01', title: 'How long galvanizing lasts.', anchor: 'galvanizing-life' },
    {
      type: 'paragraph',
      html: 'Hot-dip galvanizing protects steel with a layer of zinc that corrodes first. How fast it goes depends on the atmosphere, classified under ISO 9223:',
    },
    {
      type: 'comparison_table',
      caption: 'First-year zinc corrosion rate by ISO 9223 category',
      columns: ['Category', 'Typical setting', 'Zinc loss per year'],
      rows: [
        { cells: ['C3 — medium', 'Urban', '0.7–2.1 µm'] },
        { cells: ['C4 — high', 'Industrial, coastal', '2.1–4.2 µm'] },
        { cells: ['C5 — very high', 'Marine', '4.2–8.4 µm'], highlight: true },
        { cells: ['CX — extreme', 'Offshore, splash', '8.4–25 µm'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Under ISO 1461, galvanized steel thicker than 6 mm carries at least 85 µm of zinc on average; threaded parts that are spun after dipping carry much less — 50 µm on threads over 6 mm. As a rough estimate, using the upper first-year rates, an 85 µm coating would last about ten years in a C5 atmosphere and could be gone in under four in CX. Long-term rates are usually lower than first-year rates, so this is a cautious figure — but threads, pins and anything that rubs lose their zinc first.',
    },

    { type: 'section_head', number: '/02', title: 'What stainless does — and does not — resist.', anchor: 'stainless' },
    {
      type: 'paragraph',
      html: '<strong>304 and 316.</strong> 316 contains molybdenum, which raises its resistance to pitting in chloride environments. A common index of pitting resistance, PREN, puts 304 at about 19 and 316 at about 24. In coastal air, 304 tends to stain and pit, and 316 or better is generally preferred for marine rigging.',
    },
    {
      type: 'paragraph',
      html: '<strong>Tea staining.</strong> The brown discolouration on stainless near the coast is surface corrosion where salt sits on the steel. A smoother finish and regular washing reduce it; it is a warning sign, not just cosmetic.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Hot salt can crack stainless steel.',
      body: 'Austenitic stainless steels such as 304 and 316 can suffer chloride stress corrosion cracking. Fully immersed, it is rare below about 60 °C — but where salt deposits dry, re-wet and concentrate, cracking can occur at lower temperatures. Load-bearing stainless in hot, salty, wet-and-dry conditions is exactly that case; inspect it closely and do not assume stainless means no maintenance.',
    },

    { type: 'section_head', number: '/03', title: 'The rating trade-off.', anchor: 'ratings' },
    {
      type: 'paragraph',
      html: 'Stainless lifting hardware is generally rated well below carbon and alloy steel of the same size. From our own tables:',
    },
    {
      type: 'comparison_table',
      caption: '3/4″ screw-pin anchor shackle, three materials',
      columns: ['Shackle', 'Finish', 'WLL'],
      rows: [
        { cells: ['Stainless steel, US type', 'Stainless 304 or 316', '4,470 lb (about 2.0 t)'] },
        { cells: ['G-209 pattern, carbon steel', 'Hot-dip galvanized', '4.75 t'] },
        { cells: ['Grade 8 alloy', 'Painted or self-coloured', '7 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Galvanizing does not change a carbon shackle’s rating — makers publish one table for galvanized and self-coloured versions. Switching to stainless for corrosion usually means going up a size or two to keep the same WLL, and every stainless part needs its own published rating. Check the certificate rather than assuming a stainless part matches its carbon equivalent.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never galvanize or plate alloy lifting chain.',
      body: 'Grade 80 and Grade 100 chain and fittings are high-strength steels. Galvanizing and electroplating can cause hydrogen embrittlement, which weakens the steel without any visible change. Chain makers prohibit it, and Western Australia’s regulator has warned about embrittlement of alloy chain even from nearby plating and galvanizing work. Alloy lifting chain comes painted or self-coloured.',
    },

    { type: 'section_head', number: '/04', title: 'Mixing metals.', anchor: 'galvanic' },
    {
      type: 'paragraph',
      html: 'When two different metals touch in salt air or sea water, the less noble one corrodes faster — zinc and carbon steel against stainless. The effect is worst when a small part of the less noble metal is in contact with a large area of the more noble one: galvanized bolts on stainless railings, for example, corrode quickly once their zinc is gone. Isolate dissimilar metals with insulating washers or paint, or use fasteners at least as noble as the parts they join.',
    },
    {
      type: 'decision_tree',
      heading: 'Galvanized, stainless or alloy?',
      intro: 'Start from what the part does.',
      branches: [
        { condition: 'Overhead lifting — chain slings, hooks, master links', outcome: 'Grade 80 or 100 alloy, painted or self-coloured. Never galvanized.' },
        { condition: 'General rigging and shackles on the coast', outcome: 'Hot-dip galvanized carbon steel, inspected for zinc loss on pins and threads.' },
        { condition: 'Marine fittings that must stay bright, or sit in splash zones', outcome: '316 stainless, with its own published rating, sized up as needed.' },
        { condition: 'Stainless and galvanized parts touching', outcome: 'Isolate them, or use one material throughout.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'The shackles compared above',
      skus: ['IH-LR-SH-SSA', 'IH-LR-SH-G209', 'IH-LR-SH-8ASPAS'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is 316 stainless better than 304 for marine rigging?',
          answer:
            'Yes. 316 contains molybdenum and resists pitting in salt air much better than 304. It still needs inspection and washing in coastal conditions.',
        },
        {
          question: 'Does galvanizing reduce a shackle’s rating?',
          answer:
            'Not when the maker galvanizes and rates it: galvanized and self-coloured carbon shackles share one rating table. Galvanizing alloy lifting chain and fittings, though, is prohibited because of hydrogen embrittlement.',
        },
        {
          question: 'How long does galvanizing last on the coast?',
          answer:
            'It depends on the atmosphere. In a very high (C5) atmosphere zinc is lost at 4.2–8.4 µm a year in the first year, so a typical 85 µm coating lasts roughly a decade or more; offshore it can go much faster. Threads and wearing surfaces lose zinc first.',
        },
        {
          question: 'Why is stainless rigging rated lower?',
          answer:
            'Stainless hardware is generally rated below carbon or alloy hardware of the same size — our 3/4″ stainless anchor shackle is about 2 t against 4.75 t for a G-209 pattern carbon shackle. Always check the stainless part’s own rating.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Galvanized carbon, alloy and stainless shackles with full rating tables.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-chain',
      label: 'Stainless steel chain',
      blurb: 'Stainless DIN and long-link chain for marine and corrosive service.',
    },
    {
      type: 'related_articles',
      slugs: ['types-of-shackles', 'chain-grades-explained', 'wire-rope-eye-terminations', 'why-fittings-seize-in-coastal-air', 'galvanic-corrosion-in-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Corrosion rates from ISO 9223 as published by the American Galvanizers Association; coating thickness from ISO 1461; stainless and galvanic behaviour from IMOA, SSINA and ASSDA; embrittlement from Kito Crosby and WorkSafe WA. Coating-life figures are rough estimates.',
    },
    {
      type: 'cta_block',
      heading: 'Rigging for a coastal or offshore site?',
      body: 'Tell us the environment, the load and what each part does. We will quote galvanized, alloy or 316 stainless to suit, each with its own published rating.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
