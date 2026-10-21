import type { BlogArticleSeed } from '../shared'

/**
 * Corrosion of stainless instrument tubing and fittings. PREN formula and values from JPT (Bollinger, 2020) and
 * PTQ/Digital Refining (Schiroky et al., 2009) — offshore crevice and pitting experience, 6Mo/2507 recommendation
 * for hot marine environments; 316 CPT ~20 °C (ASTM G150) from Parker catalogue 4230/4233; NACE MR0175 / ISO 15156
 * tables from Swagelok MS-06-124; 2507 250 °C limit from Swagelok Tubing Data; jacketed tube from Swagelok MS-02-188.
 * Gulf ambient temperatures are not quoted as figures (no met-office source fetched).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-tube-fittings-corrosion-gulf',
  title: 'Stainless tube fittings and tubing in salt air: 316, 6Mo, 2507 and sour service',
  excerpt:
    '316 stainless is the default for instrument tubing and the material that has pitted and crevice-corroded on offshore platforms worldwide. What PREN measures, where the corrosion starts, when 6Mo or 2507 is worth the cost, what NACE MR0175 / ISO 15156 allows for instrument tube, and the installation habits that make any alloy last longer on a hot coast.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: '316 vs 6Mo vs 2507 Instrument Tubing: Corrosion & Sour Service',
  seoDescription:
    'Corrosion of stainless instrument tubing and fittings in marine and Gulf environments: PREN, pitting and crevice corrosion of 316, when to use 6Mo or 2507, NACE MR0175 / ISO 15156 limits, jacketed tube and installation practice.',
  focusKeyword: '316 stainless tubing corrosion',
  publishedAt: '2026-10-21T13:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pitting resistance is ranked by PREN = %Cr + 3.3 × %Mo + 16 × %N: about 24–26 for 316, about 30 for 317, about 43 for 6Mo and 2507.',
        '316 instrument tubing has pitted and crevice-corroded offshore in the Gulf of Mexico, the North Sea and the Caribbean; in side-by-side trials 2507 showed none.',
        'Corrosion starts in crevices — under clamps and supports, between touching runs, under deposits — more than on open tube.',
        'For hot marine environments the guidance is 6Mo or 2507; 316 may do in cooler climates with a proven record. 2507 must not be used above 250 °C.',
        'Under NACE MR0175 / ISO 15156, 316 instrument and control-line tubing with its fittings is allowed in surface applications without environmental limits (Table A.4); as general equipment it is limited to 60 °C at 100 kPa H2S (Table A.2).',
      ],
    },
    {
      type: 'lead',
      html: 'On a coastal plant or an offshore platform, a stainless instrument line spends its life wet with salt — spray, condensation that dries into chloride film, washdown, and in the Gulf, high temperatures that make every chloride more aggressive. 316 is the default material because it is affordable and usually good enough. This article is about the places where it is not, and what to use instead.',
    },

    { type: 'section_head', number: '/01', title: 'How stainless corrodes in salt air.', anchor: 'mechanism' },
    {
      type: 'prose',
      html: '<p>Stainless steel resists corrosion because of a thin chromium-oxide film. Chlorides attack that film locally. Two forms matter for instrument lines:</p><ul><li><strong>Pitting</strong> — small, deep pits on open surfaces where chloride deposits sit and the film breaks down. A pinhole through a thin tube wall is a leak.</li><li><strong>Crevice corrosion</strong> — the same process in a gap too narrow for oxygen to replenish the film: under a tube clamp, under a support strip, between two runs of tube touching each other, under a label, under a deposit. Crevices are more dangerous than open surfaces because the chemistry inside them becomes more acidic as corrosion proceeds, and tight crevices are the worst.</li></ul><p>Offshore experience published by engineers from Swagelok, BP and Shell describes exactly this: 316 tubing corroding worldwide, with the damage concentrated at tube supports, at clamps, between adjacent runs and under deposits. In a side-by-side installation, 316 corroded heavily while 2507 showed none; the few 2507 crevice cases were under plastic support strips and neoprene gaskets.</p>',
    },

    { type: 'section_head', number: '/02', title: 'PREN: ranking the alloys.', anchor: 'pren' },
    {
      type: 'prose',
      html: '<p>The Pitting Resistance Equivalent Number ranks stainless and nickel alloys by their resistance to chloride pitting:</p><p><strong>PREN = %Cr + 3.3 × %Mo + 16 × %N</strong></p><p>It is a ranking, not a guarantee, but it is the number specifications use. Temperature matters as much: Parker gives the critical pitting temperature of standard 316 (ASTM G150) as about 20 °C — the temperature above which pitting can start in the standard test solution — which explains why 316 that survives in a cool climate can pit on a hot one.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Typical PREN of instrument tubing alloys',
      columns: ['Alloy', 'Type', 'Typical PREN', 'Notes'],
      rows: [
        { cells: ['316/316L', 'Austenitic stainless', 'About 24–26', 'Default; depends on actual Mo and N'] },
        { cells: ['317', 'Austenitic stainless', 'About 30', 'Little gain over 316'] },
        { cells: ['6Mo (254, AL-6XN, 25-6Mo)', 'Super-austenitic', 'About 43', 'Good offshore record'], highlight: true },
        { cells: ['2507', 'Super duplex', 'About 43', 'Strong and resistant; not above 250 °C'] },
        { cells: ['625, C-276', 'Nickel alloys', 'Higher still', 'Sour gas, severe localised corrosion'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'When to step up from 316.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<p>Published guidance (JPT, 2020) is direct: in hot marine environments, specify 6Mo or 2507; 316/316L may be adequate in cold climates where it has a proven service history; and moving from 316 to 317 gains little. For a Gulf coastal plant or offshore installation, that puts most exposed instrument lines in the 6Mo/2507 case.</p><ul><li><strong>6Mo</strong> is austenitic like 316, so it bends and makes up like 316 tube, with its own fittings in 6Mo. Its temperature factors fall faster than 316’s (Swagelok: 0.74 at 400 °F).</li><li><strong>2507</strong> is stronger, so the same wall takes more pressure — but it needs its own tooling (Swagelok’s hydraulic swaging units do not cover 2507 tube 1/2" and under) and must not be used above <strong>250 °C (482 °F)</strong>, where it embrittles.</li><li><strong>Match the fittings to the tube.</strong> Makers offer fitting bodies, nuts and ferrules in 6Mo, 2507, 625 and 825; mixing a 316 fitting with alloy tube brings back the hardness and galvanic problems makers warn about.</li></ul><p>Where an upgrade is not possible, <strong>jacketed tube</strong> — 316 with a TPU or PVC sheath, made to protect tubing from external corrosion and abrasion — keeps salt off the tube between fittings. Seal the jacket ends so water does not wick under it and create the crevice you were trying to avoid.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Sour service: NACE MR0175 / ISO 15156.', anchor: 'sour' },
    {
      type: 'prose',
      html: '<p>Where instrument lines carry hydrogen sulphide, NACE MR0175 / ISO 15156 governs the materials. Swagelok’s summary of how it applies to instrument tubing and fittings:</p><ul><li><strong>316/316L, Table A.4</strong> — surface applications only, covering instrument tubing, control-line tubing and their compression and threaded fittings: <strong>no environmental restrictions</strong>, subject to the standard’s cautionary remarks.</li><li><strong>316/316L, Table A.2</strong> (any equipment) — limited to <strong>60 °C (140 °F) at 100 kPa (15 psi) H2S partial pressure</strong>.</li><li><strong>6Mo</strong> — Table A.11 for instrument tubing and fittings without restriction; 60 °C at 100 kPa under the general table.</li><li><strong>2507</strong> — Table A.24: 232 °C at 20 kPa (3 psi) partial pressure.</li><li><strong>625</strong> — Table A.14: 232 °C at 200 kPa, or 149 °C at any partial pressure.</li></ul><p>The nut and back ferrule are not wetted, so they sit outside the internal sour-service requirements. Our oilfield instruments — pressure deboosters, gauges and sensors — are offered with SS316 wetted parts and NACE MR0175 materials on request. Confirm the table the project specification calls for before ordering.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Galling is a material problem too.',
      body: 'Stainless nuts on stainless bodies gall. Makers deal with it in the nut: Parker silver-plates its A-LOK nuts and moly-coats its CPI nuts; Swagelok ships a thread lubricant with fittings over 1" and offers silver-plated front ferrules for service above 232 °C (450 °F). Do not strip the coating or the factory lubricant.',
    },

    { type: 'section_head', number: '/05', title: 'Installation habits that make any alloy last.', anchor: 'practice' },
    {
      type: 'prose',
      html: '<ul><li><strong>Keep runs apart.</strong> Tubes touching each other make a crevice along the whole contact line. Use spacer clamps.</li><li><strong>Choose clamp inserts carefully.</strong> Gaskets and strips that trap water against the tube make crevices; prefer designs that drain and do not wick.</li><li><strong>Do not leave deposits.</strong> Salt and dust build up on horizontal runs and under labels. Wash down with fresh water where practical.</li><li><strong>Avoid scratching and iron contamination.</strong> Carbon-steel tools and wire brushes leave iron on the surface that rusts and starts pits. Use stainless-only tools on stainless tube.</li><li><strong>Inspect the hidden places.</strong> When looking for corrosion, open the clamps and look where the tube was covered — that is where it starts.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is 316 stainless tubing suitable for offshore use?', answer: 'It is widely used, but it has pitted and crevice-corroded offshore worldwide. For hot marine environments, published guidance recommends 6Mo or 2507; 316 may do in cooler climates with a proven record.' },
        { question: 'What is PREN?', answer: 'The Pitting Resistance Equivalent Number, %Cr + 3.3 × %Mo + 16 × %N, which ranks stainless alloys by chloride pitting resistance. 316 is about 24–26; 6Mo and 2507 about 43.' },
        { question: 'Where does stainless tubing corrode first?', answer: 'In crevices — under clamps and supports, between touching tubes, under labels and deposits — rather than on open, washed surfaces.' },
        { question: 'Can 2507 tubing be used at high temperature?', answer: 'Not above 250 °C (482 °F), where its microstructure changes and it embrittles and loses corrosion resistance.' },
        { question: 'Is 316 tubing NACE MR0175 compliant?', answer: 'For instrument and control-line tubing and fittings in surface applications, 316/316L is listed in ISO 15156 Table A.4 without environmental limits. As general equipment (Table A.2) it is limited to 60 °C at 100 kPa H2S partial pressure.' },
        { question: 'Does jacketed tubing stop corrosion?', answer: 'It protects the tube between fittings from external corrosion and abrasion, provided the jacket ends are sealed so water cannot wick in underneath.' },
      ],
    },
    {
      type: 'product_embed',
      heading: '316 tube and fittings, and NACE-option instruments',
      skus: ['IH-TB-ST6', 'IH-TF-CF', 'IH-TF-BUW', 'IH-TF-L', 'IH-APS-1502-DEB-6IN-ADJ', 'IH-PG-12NPT-BM-6IN-10K'],
    },
    { type: 'category_link', slug: 'instrumentation-tube-fittings', label: 'Instrumentation tube fittings', blurb: '316L forged fittings and 304/316 tubing.' },
    {
      type: 'related_articles',
      slugs: ['instrumentation-tubing-pressure-ratings', 'instrumentation-tube-fittings-guide', 'compression-fitting-leaks', 'stainless-vs-galvanized-rigging-gulf'],
    },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'bollinger-2020', text: 'Bollinger, B. (2020). How to optimise tubing material selections using PREN value. Journal of Petroleum Technology, 22 April 2020.', url: 'https://jpt.spe.org/how-optimize-tubing-material-selections-using-pren-value' },
        { id: 'schiroky-2009', text: 'Schiroky, G., Dam, A., Okeremi, A. and Speed, C. (2009). Pitting and crevice corrosion of offshore stainless steel tubing. PTQ / Digital Refining.', url: 'https://digitalrefining.com/article/1000087/pitting-and-crevice-corrosion-of-offshore-stainless-steel-tubing' },
        { id: 'swagelok-nace', text: 'Swagelok. NACE MR0175/MR0103 and ISO 15156/17945 Compliant Swagelok Fittings, MS-06-124.', url: 'https://origin-www.swagelok.com/downloads/webcatalogs/en/MS-06-124.PDF' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'PREN values and offshore experience from the JPT and PTQ papers; NACE tables from Swagelok’s compliance summary; galling and alloy limits from Swagelok and Parker.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying tube for a coastal or offshore site?',
      body: 'Tell us the location, the fluid, any H2S, and the temperature. We will propose 316, 6Mo or 2507 tube with matching fittings and the material certificates the specification calls for.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
