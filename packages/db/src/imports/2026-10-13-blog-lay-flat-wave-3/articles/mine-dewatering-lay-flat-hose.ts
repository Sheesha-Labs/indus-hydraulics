import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Mine dewatering with lay flat hose: TPU vs NBR, head and pressure, acid water. Facts checked
 * 2026-10-13: Upper Silesian mine water volumes (IMWA 2008 paper; MDPI Energies 2024), acid mine
 * drainage pH (USGS). No acid-resistance comparison between TPU and NBR is claimed — readers are
 * asked for the water analysis. Product facts from IH-LF-TDW / NBR / NBRH / SEP / CHP.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mine-dewatering-lay-flat-hose',
  title: 'Mine dewatering hose: TPU vs NBR lay flat, head, pressure and acid water',
  excerpt:
    'Mines pump water every hour they operate — Upper Silesia’s coal basin alone moves around half a million cubic metres a day. In open pits and temporary underground lines, lay flat hose carries much of it. How to choose between TPU and nitrile, how pit depth turns into hose pressure, what acid mine water means for the hose, and how to lay lines that survive blasting, haul roads and sharp rock.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Mine Dewatering Hose: TPU vs NBR Lay Flat for Pits',
  seoDescription:
    'How to choose mine dewatering hose: TPU vs NBR lay flat, converting pit depth to working pressure, high-pressure couplings, acid mine water pH, and laying lines on haul roads and benches — for open pits and underground.',
  focusKeyword: 'mine dewatering hose',
  publishedAt: '2026-10-13T21:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pressure at the pump is set by lift as much as by distance: every 10 m of vertical rise adds about 1 bar before friction.',
        'TPU lay flat is lighter and more abrasion-resistant for long, dragged lines; NBR suits oily water and high-wear discharge from smaller pumps; heavy-duty NBR suits continuous high-head duty.',
        'Mine water ranges from acidic (pH 2–6 in acid mine drainage) to near neutral — send the analysis before choosing hose and coupling materials.',
        'High-head lines need couplings rated for the pressure: the line is only as strong as its weakest joint.',
        'Lay hose clear of blast zones and haul traffic, cross roads under ramps, and inspect daily.',
      ],
    },
    {
      type: 'lead',
      html: 'Mining below the water table means pumping, continuously, for the life of the mine. The scale is easy to underestimate: in 2006 the active and abandoned coal mines of Poland’s Upper Silesian basin pumped 162.8 million cubic metres of water, and recent estimates put the basin at around half a million cubic metres a day, with inflows to individual mines from 1 to 60 m³ a minute. Main shaft pumping runs through fixed steel pipe. But the pit-bottom pumps, the sumps that move as the face advances, the in-pit transfer lines and emergency pumping after a storm are where lay flat hose earns its place.',
    },

    { type: 'section_head', number: '/01', title: 'Where lay flat fits in a mine.', anchor: 'where' },
    {
      type: 'figure',
      imageId: FIG['fig-mine-pontoon'],
      captionPrefix: 'FIG. 01',
      caption: 'A pontoon pump in the pit-bottom sump, its discharge carried up the benches in lay flat hose that moves as the pit deepens.',
      aspectRatio: '16/9',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Open-pit sumps</strong>: pontoon and skid pumps in the pit bottom, discharging up the benches to a settling pond. The pump moves as the pit deepens; lay flat follows it.</li><li><strong>In-pit and haul-road transfer</strong>: moving water between sumps, ponds and treatment, often over kilometres.</li><li><strong>Underground temporary lines</strong>: face and development pumping into the main sump, where rigid pipe would have to be re-laid every few weeks.</li><li><strong>Storm and emergency pumping</strong>: extra pumps brought in after heavy rain or an inrush.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'From pit depth to hose pressure.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'A dewatering line’s highest pressure is at the pump, and in a pit most of it is lift. Every 10 m of vertical rise needs about 1 bar; add friction along the hose and the pressure at the outlet. A pump lifting 120 m from the pit bottom to the rim through a kilometre of hose might need 12 bar for the lift and several more for friction — beyond some hoses, comfortably within others. Our <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> is rated 21 bar from 1-1/2" to 2-1/2", 17 bar at 3" and 4", 14–15 bar from 6" to 14" and 10 bar at 16", with burst at three times working. For the friction side, see our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> and <a href="/blog/lay-flat-hose-pressure-ratings">how pressure ratings work</a>.',
    },
    {
      type: 'direct_answer',
      question: 'What pressure rating does mine dewatering hose need?',
      answer:
        'At least the pump’s pressure at its duty point plus surge, and preferably its shut-off pressure. In a pit, allow about 1 bar for every 10 m of vertical lift, plus friction along the hose. Check the couplings to the same rating.',
    },

    { type: 'section_head', number: '/03', title: 'TPU or NBR?', anchor: 'material' },
    {
      type: 'comparison_table',
      caption: 'Lay flat hose for mine dewatering',
      columns: ['Hose', 'Strengths', 'Best for'],
      rows: [
        { cells: ['TPU dewatering hose', 'Light, very abrasion-resistant, smooth bore, 1-1/2" to 16", up to 21 bar', 'Long transfer lines, high flows, lines dragged over rock'], highlight: true },
        { cells: ['NBR discharge hose', 'Nitrile tube and ribbed cover, oil resistant, 10 bar', 'Smaller pumps, oily water from plant areas'] },
        { cells: ['Heavy-duty NBR hose', 'High-strength jacket, oil, abrasion and weather resistant', 'Continuous, high-intensity pit pumping'] },
        { cells: ['EPDM/PE suction hose', 'Rigid helix, vacuum rated', 'Pump suction — never lay flat'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For most open-pit transfer, <strong>TPU</strong> wins on weight and abrasion: a 12" hose weighs 4.6 kg/m, so a kilometre is a reel, not a truckload of pipe. <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> and <a href="/p/heavy-duty-nbr-lay-flat-hose">heavy-duty NBR hose</a> suit the oily water from workshops and plant areas, and the high-wear duty of continuous pumps. Our <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">materials comparison</a> goes further.',
    },

    { type: 'section_head', number: '/04', title: 'Acid mine water.', anchor: 'acid' },
    {
      type: 'paragraph',
      html: 'Where sulphide minerals meet air and water, mine water turns acidic. The US Geological Survey puts acid mine drainage typically at pH 2 to 6, though near-neutral mine water (pH 5 to 8) is also common, and extreme sites go far lower. Acidity matters more for couplings than for the hose: aluminium couplings corrode in strongly acidic water, where stainless steel is the safer choice. Hose compatibility depends on the acid, its concentration and the temperature, so <strong>send the water analysis</strong> — pH, sulphate, chloride, metals and any oil — and we will confirm hose and coupling materials against it.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Couplings set the limit.',
      body: 'On high-head lines, use couplings rated for the line pressure — high-pressure male × female couplings are built and leak-tested for it — and torque clamp bolts evenly, re-checking after the first pressurisation.',
    },

    { type: 'section_head', number: '/05', title: 'Laying lines in a working mine.', anchor: 'laying' },
    {
      type: 'prose',
      html: '<ol><li><strong>Keep clear of blast zones</strong>; move or protect hose before each blast.</li><li><strong>Run along the bench edge</strong>, not across haul roads; where it must cross, bury it or use heavy-duty ramps rated for haul trucks.</li><li><strong>Support the line on steep sections</strong> so its weight full of water does not hang off the coupling.</li><li><strong>Avoid sharp rock</strong> at bends and crests; pad contact points.</li><li><strong>Walk the line daily</strong> for abrasion, cuts and coupling weeps.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is TPU or NBR better for mine dewatering?', answer: 'TPU for long, dragged transfer lines and high flows, because it is lighter and very abrasion resistant. NBR for oily water and high-wear discharge from smaller pumps.' },
        { question: 'Can lay flat hose handle acidic mine water?', answer: 'Often, but it depends on the acid, concentration and temperature. Send the water analysis and we will confirm hose and coupling materials; stainless couplings are safer in strongly acidic water.' },
        { question: 'How much pressure does pumping out of a pit need?', answer: 'About 1 bar for every 10 m of vertical lift, plus friction along the hose and surge allowance.' },
        { question: 'Can lay flat hose be used underground?', answer: 'Yes, for temporary and face pumping lines. Check the mine’s rules on hose materials for underground use, including any fire and antistatic requirements.' },
        { question: 'What couplings suit high-head mine lines?', answer: 'High-pressure male × female couplings for the line, flanged or grooved couplings to pumps and pipework, matched to the hose wall and pressure.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For mine dewatering',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-NBRH', 'IH-LF-SEP', 'IH-LF-CHP', 'IH-LF-CFL', 'IH-LF-CVG'],
    },
    {
      type: 'category_link',
      slug: 'nbr-lay-flat-hoses',
      label: 'NBR lay flat hoses',
      blurb: 'Nitrile discharge and heavy-duty hose for oily and high-wear pumping.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'poland',
      label: 'Mine dewatering hose supply to Poland',
      blurb: 'Lay flat and suction hose for Polish mines and quarries.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'sweden',
      label: 'Mine dewatering hose supply to Sweden',
      blurb: 'Transfer hose and couplings for Swedish mines.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'romania',
      label: 'Mine dewatering hose supply to Romania',
      blurb: 'Dewatering hose for Romanian mining and quarrying.',
    },
    {
      type: 'related_articles',
      slugs: ['tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-pressure-ratings', 'lay-flat-hose-flow-and-friction-loss', 'suction-hose-vs-lay-flat-hose', 'why-lay-flat-hose-fails'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Mine water volumes from published studies of the Upper Silesian coal basin; acid mine drainage pH from the US Geological Survey. Hose ratings from the Indus lay flat listings.',
    },
    {
      type: 'cta_block',
      heading: 'Dewatering a pit or mine?',
      body: 'Send the pump duty, lift, line length and water analysis. We will recommend hose, suction hose and couplings rated for the line.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
