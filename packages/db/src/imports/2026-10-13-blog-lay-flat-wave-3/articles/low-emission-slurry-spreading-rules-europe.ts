import type { BlogArticleSeed } from '../shared'

/**
 * Low-emission slurry spreading rules: Ireland, Germany, Denmark, Netherlands, UK. Checked
 * 2026-10-13 against: DAFM Nitrates Information Leaflet (Sept 2022) / S.I. 113 of 2022; DüV § 6
 * (gesetze-im-internet.de); Danish BEK nr 931 of 2024 § 6; Dutch government publication on
 * trailing shoe on clay and peat (2019) and WUR; UK written answer (2 Oct 2020); SAC Consulting on
 * Scotland's GBRs (2026); DAERA and Oireachtas answers on ammonia reductions. England's 2025
 * pledge is NOT described as law (not verified). UNECE figures are not attributed. Not legal advice.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'low-emission-slurry-spreading-rules-europe',
  title: 'Low-emission slurry spreading rules in Europe: Ireland, Germany, Denmark, the Netherlands and the UK',
  excerpt:
    'Splash plates are on their way out across north-west Europe. Ireland’s LESS rules now reach farms above 100 kg organic N per hectare; Germany requires strip application on grassland from February 2025; Denmark and the Netherlands have required low-emission methods for years; Scotland bans splash plates and goes further in 2027. What each country requires, which equipment counts, and what it means for hose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Low-Emission Slurry Spreading Rules: Ireland, Germany, UK',
  seoDescription:
    'LESS rules in Ireland, the German DüV strip-application rule, Danish and Dutch low-emission requirements, and Scotland’s splash-plate ban compared: who must comply, from when, which equipment counts, and ammonia savings.',
  focusKeyword: 'low emission slurry spreading rules',
  publishedAt: '2026-10-13T21:01:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Ireland: LESS required above 150 kg N/ha from 2023, 130 kg from 2024 and 100 kg from 2025, and for all pig slurry; closed period from 1 October.',
        'Germany: strip application or direct incorporation on planted arable land since February 2020, and on grassland since February 2025; bare arable land incorporated within 1 hour from 2025.',
        'Denmark: liquid manure only by trailing hose, trailing shoe or injection; acidification can substitute for injection in some cases.',
        'Netherlands: low-emission application on all land; trailing shoe on clay and peat only with diluted slurry since 2019.',
        'Scotland: splash plates banned since 2023, precision application on all farms from 2027. England’s 2025 commitment had not been put into law as far as we could verify.',
      ],
    },
    {
      type: 'lead',
      html: 'Agriculture is the dominant source of ammonia emissions in Europe, and most of it comes from manure. Spreading slurry with a splash plate throws it into the air, where much of its nitrogen is lost as ammonia; placing it in bands at the base of the crop, or injecting it into the soil, keeps far more of it. That is why governments from Dublin to Copenhagen have moved, step by step, to require low-emission application. This guide sets out what we could verify from official sources in October 2026. Rules change and have exemptions — check with your department, advisor or local authority before relying on it.',
    },

    { type: 'section_head', number: '/01', title: 'The methods.', anchor: 'methods' },
    {
      type: 'comparison_table',
      caption: 'Slurry application methods',
      columns: ['Method', 'How it works', 'Ammonia reduction vs splash plate'],
      rows: [
        { cells: ['Splash plate', 'Slurry thrown upward onto a plate and broadcast', 'Baseline'] },
        { cells: ['Trailing hose (dribble bar)', 'Hoses on a boom drop slurry in bands on the surface', 'Treated as about half as effective as trailing shoe in UK and Irish inventories'] },
        { cells: ['Trailing shoe', 'Shoes part the grass and place slurry at its base', 'About 60% (Northern Ireland); 36% on average in Irish field trials'], highlight: true },
        { cells: ['Shallow injection', 'Discs cut slots and place slurry in them', 'About 70% (Northern Ireland)'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Reductions vary with weather, soil, crop height and slurry, which is why trial results and inventory factors differ. All of these methods can be fed by tanker or by an <a href="/blog/slurry-umbilical-system-guide">umbilical system</a>; the umbilical adds lower soil compaction and no road traffic.',
    },

    { type: 'section_head', number: '/02', title: 'Ireland.', anchor: 'ireland' },
    {
      type: 'paragraph',
      html: 'Ireland’s rules sit in the Good Agricultural Practice regulations (S.I. No. 113 of 2022, as amended). <strong>Low-emission slurry spreading (LESS)</strong> became compulsory for farms above 150 kg organic nitrogen per hectare from January 2023, above 130 kg from January 2024, and above 100 kg from January 2025 — Irish farm press estimated about 15,000 farms at the 100 kg step. All pig slurry must be spread by LESS from 2023, and manure on arable land must be applied with low-emission equipment or incorporated within 24 hours. The <strong>closed period</strong> for slurry starts on 1 October in every zone and ends on 12, 15 or 31 January depending on zone. TAMS 3 offers grant aid on LESS equipment, limited to trailing shoe and disc injection; umbilical systems qualify only with one of those applicators.',
    },

    { type: 'section_head', number: '/03', title: 'Germany.', anchor: 'germany' },
    {
      type: 'paragraph',
      html: 'The German Fertiliser Ordinance (Düngeverordnung, DüV) § 6 requires liquid manure on <strong>planted arable land</strong> to be applied in strips or put directly into the soil from 1 February 2020, and extends the same rule to <strong>grassland, permanent grassland and multi-cut forage</strong> from 1 February 2025. On bare arable land, manure must be incorporated within 4 hours, cut to <strong>1 hour</strong> from 1 February 2025. Strip application means trailing hose (<em>Schleppschlauch</em>), trailing shoe (<em>Schleppschuh</em>) or slot injection. The federal states can approve equivalent low-emission methods and grant exceptions where farm structure or site makes compliance unreasonable — Bavaria, for example, has exempted small farms and very thin slurry.',
    },

    { type: 'section_head', number: '/04', title: 'Denmark.', anchor: 'denmark' },
    {
      type: 'paragraph',
      html: 'Danish rules allow liquid manure to be applied only by <strong>trailing hose, trailing shoe or injection</strong>; broadcast spreading has been banned since 2001. Where injection is required, it must leave only a negligible amount on the surface, and in grass the slots must hold the full amount applied. <strong>Acidification</strong> — lowering slurry pH to cut ammonia loss — can substitute for injection on fodder grass and bare soil, but not within 200 m of towns, as it does nothing for odour.',
    },

    { type: 'section_head', number: '/05', title: 'The Netherlands.', anchor: 'netherlands' },
    {
      type: 'paragraph',
      html: 'The Netherlands requires low-emission application on all land, and surface broadcasting is not allowed. On grassland that means shallow injection, slot coulter or — with conditions — trailing shoe. On sand and loess soils trailing shoe on grassland has not been allowed since 2012, and on clay and peat since 1 January 2019 a trailing shoe may only be used with slurry diluted at one part water to two parts slurry, notified to the national agency (RVO) before first use each year.',
    },

    { type: 'section_head', number: '/06', title: 'The UK.', anchor: 'uk' },
    {
      type: 'paragraph',
      html: 'In <strong>Scotland</strong>, amended General Binding Rules took effect in January 2022: raised splash plates and rain guns have been banned since January 2023, and precision application — dribble bar or band spreader, trailing hose, trailing shoe or injection — becomes mandatory on all farms from 1 January 2027, with larger farms and contractors required to comply earlier. In <strong>England</strong>, the 2019 Clean Air Strategy committed to requiring low-emission spreading of slurry and digestate by 2025, and the government confirmed in 2020 that it would use existing powers; we could not find an instrument that put that requirement into law, so check current DEFRA guidance.',
    },
    {
      type: 'direct_answer',
      question: 'Is splash plate slurry spreading banned?',
      answer:
        'In much of north-west Europe, yes or nearly. Denmark banned broadcast spreading in 2001 and the Netherlands does not allow surface broadcasting; Germany requires strip application on arable land and grassland; Ireland requires low-emission spreading above 100 kg organic N/ha; Scotland banned raised splash plates from 2023. England had not legislated its 2025 commitment as far as we could verify.',
    },

    { type: 'section_head', number: '/07', title: 'What it means for hose.', anchor: 'hose' },
    {
      type: 'paragraph',
      html: 'Low-emission booms are heavier than splash plates, and the soil-compaction case for keeping tankers off wet ground has grown with them. Umbilical systems answer both: the applicator rides on a light tractor and the slurry comes by hose. That puts the load on two lay flat hoses — a <a href="/p/tpu-lay-flat-slurry-supply-hose">supply line</a> that runs from the store, and a <a href="/p/tpu-lay-flat-slurry-drag-hose">drag hose</a> that the tractor pulls all day — joined by <a href="/p/lay-flat-slurry-hose-coupling">slurry couplings</a> built for wet, gloved hands. Our <a href="/blog/slurry-drag-hose-sizing-and-life">drag hose sizing guide</a> covers bore and wear.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not legal advice.',
      body: 'This summarises official sources as we read them in October 2026. Thresholds, dates, zones and exemptions change and depend on your farm. Confirm with your department of agriculture, advisor or local authority.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Who must use LESS in Ireland?', answer: 'Farms above 100 kg organic N per hectare from January 2025 (150 kg from 2023, 130 kg from 2024), and all pig slurry from 2023.' },
        { question: 'When does the German trailing hose rule apply to grassland?', answer: 'From 1 February 2025, under § 6 of the Düngeverordnung. It has applied to planted arable land since 1 February 2020.' },
        { question: 'Does a dribble bar count as low-emission?', answer: 'It counts in Germany, Denmark and Scotland, but Irish TAMS 3 grant aid excludes dribble bars, and inventories treat trailing hose as less effective than trailing shoe.' },
        { question: 'Is acidification allowed instead of injection in Denmark?', answer: 'In some cases — on fodder grass and bare soil — but not within 200 m of towns.' },
        { question: 'When is the Irish slurry closed period?', answer: 'From 1 October until 12, 15 or 31 January depending on zone.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For low-emission umbilical systems',
      skus: ['IH-LF-TSS', 'IH-LF-TSD', 'IH-LF-CAG', 'IH-LF-EHR', 'IH-LF-EHM'],
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'ireland',
      label: 'Slurry hose supply to Ireland',
      blurb: 'Umbilical supply and drag hose for LESS-compliant spreading.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'germany',
      label: 'Slurry hose supply to Germany',
      blurb: 'Schleppschlauch and supply hose for DüV-compliant application.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'denmark',
      label: 'Slurry hose supply to Denmark',
      blurb: 'Drag and supply hose for Danish slurry application.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'netherlands',
      label: 'Slurry hose supply to the Netherlands',
      blurb: 'Sleepslang and supply hose for Dutch contractors.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Slurry hose supply to the UK',
      blurb: 'Umbilical hose for Scottish and English farms.',
    },
    {
      type: 'related_articles',
      slugs: ['slurry-umbilical-system-guide', 'slurry-drag-hose-sizing-and-life', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Ireland: DAFM Nitrates leaflet and S.I. 113 of 2022. Germany: DüV § 6. Denmark: BEK 931/2024. Netherlands: government and WUR. UK: Parliament written answer (2020), SAC Consulting. Not legal advice.',
    },
    {
      type: 'cta_block',
      heading: 'Moving to low-emission spreading?',
      body: 'If you are switching to an umbilical system for a trailing shoe or injector, send your distances and outputs. We will size the supply line, drag hose and couplings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
