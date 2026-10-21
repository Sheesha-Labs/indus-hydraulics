import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Frac and stimulation spread equipment. Sources read 2026-10-21: NOV Pressure Pumping Equipment brochure (frac pumps
 * to 3,000+ BHP, triplex and quintuplex; blenders to 135+ BPM, twin to 150+, automated density and chemical control,
 * auger configurations; hydration units for on-the-fly hydration, 90/180/270 bbl tanks; LAS up to 12 chemical
 * circuits; data vans controlling the spread; acid units; combo units); NOV non-fired nitrogen pumping unit page (rate
 * classes in scf per hour; 360K = 360,000 scfh at 10,000 psi; 90K to 15,000 psi); SLB Energy Glossary (blender,
 * crosslinker, batch mixer, triplex pump, densitometer); Halliburton fracturing equipment page.
 * NOT used: frac manifold, sand silo and frac tank specifics (no maker source read); LN2 gas conversion.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'frac-and-stimulation-equipment',
  title: 'Frac and stimulation equipment: pumpers, blenders, hydration units, manifolds and nitrogen',
  excerpt:
    'A fracturing spread is a factory on trailers: tanks and a hydration unit make the gel, a blender mixes in sand and chemicals, pumpers raise it to treating pressure, a manifold gathers their output into the well, and a data van runs it all. Acid and nitrogen jobs add tanks, batch mixers and a nitrogen pumping unit. What each unit does, how its size is stated — horsepower, barrels per minute, scf per hour — and what to send for a quote.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Frac Spread Equipment: Pumpers, Blender, Hydration, N2',
  seoDescription:
    'Hydraulic fracturing and stimulation equipment explained: frac pumpers, blenders, hydration units, liquid additive systems, frac manifolds, sand silos, frac tanks, data vans, acid tanks, batch mixers and nitrogen pumping units.',
  focusKeyword: 'frac spread equipment',
  publishedAt: '2026-10-22T00:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pumpers are sized in hydraulic horsepower — NOV builds triplex and quintuplex frac pumps to 3,000+ BHP.',
        'Blenders are sized in barrels per minute; they meter sand with augers and control density and chemicals automatically.',
        'A hydration unit makes gel on the fly, so unused pre-gelled fluid does not have to be disposed of.',
        'The crosslinker — usually a metal salt — is added to the gel; proppant is the sand, not a crosslinking agent.',
        'Nitrogen units are named by rate: “360K” means 360,000 scf per hour, not a tank size.',
      ],
    },
    {
      type: 'lead',
      html: 'Hydraulic fracturing pumps fluid into a well faster than the rock can take it, cracking the formation and propping the cracks open with sand. Acidizing dissolves rock near the wellbore instead. Both are done by a spread of trailer- or skid-mounted units that each do one step, connected by low-pressure suction hose and high-pressure treating iron. For the hose and iron, see <a href="/blog/well-service-and-stimulation-hose">well service and stimulation hose</a> and <a href="/blog/flow-iron-explained">flow iron</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The frac spread.', anchor: 'frac' },
    {
      type: 'comparison_table',
      caption: 'Units on a frac spread',
      columns: ['Unit', 'Job', 'Sized by'],
      rows: [
        { cells: ['Frac tanks', 'Store water and base fluid', 'Barrels'] },
        { cells: ['Hydration unit', 'Mixes polymer into water to make gel on the fly', 'Tank size, barrels per minute'] },
        { cells: ['Liquid additive system (LAS)', 'Meters liquid chemicals into the blender', 'Number of chemical circuits'] },
        { cells: ['Sand silos and proppant', 'Store and feed sand to the blender', 'Tonnes'] },
        { cells: ['Blender', 'Mixes fluid, sand and chemicals into slurry and feeds the pumpers', 'Barrels per minute'], highlight: true },
        { cells: ['Frac pumpers', 'Raise slurry to treating pressure', 'Hydraulic horsepower'], highlight: true },
        { cells: ['Frac manifold (missile)', 'Feeds every pumper from the blender and gathers their discharge into one treating line', 'Number of pumpers, pressure'] },
        { cells: ['Data van', 'Monitors and controls the whole spread', '—'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>NOV’s figures give the scale: frac pumps up to 3,000+ brake horsepower in triplex and quintuplex designs; blenders rated to 135+ BPM, twin designs to 150+, with automated density and chemical control and auger sand metering; hydration units with 90, 180 and 270 bbl tanks that hydrate fluid “on the fly” and avoid the cost of disposing of unused pre-gelled fluid; and liquid additive systems with up to 12 automated chemical circuits. The data van controls fracturing, acidizing, pump-down and cementing equipment from one station. Density is monitored constantly, especially when mixing slurries.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Acid and nitrogen.', anchor: 'stimulation' },
    {
      type: 'prose',
      html: '<ul><li><strong>Acid tanks</strong> are lined (commonly FRP) so the acid does not attack the steel shell; transport tanks travel on the pump unit or as separate tanks.</li><li><strong>Batch mixers</strong> prepare treatment fluid in advance, with dry and liquid additive feed, agitation and a manifold to storage or the pumps.</li><li><strong>Pumping units</strong> for stimulation are usually triplex pumps — the most common pump configuration in drilling and well service — mounted in pairs on a trailer.</li><li><strong>Nitrogen pumping units</strong> store liquid nitrogen, pump it to pressure and vaporise it. NOV names its non-fired units by rate: the TR360NF delivers 360,000 scf per hour (6,000 scf/min) at 10,000 psi; its 90K unit reaches 15,000 psi. The highest pressures go with the smallest rate classes.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What equipment is on a frac spread?', answer: 'Frac tanks, a hydration unit, liquid additive system, sand silos, a blender, several frac pumpers, a frac manifold, treating iron and a data van.' },
        { question: 'What does a frac blender do?', answer: 'It mixes base fluid, sand and chemicals into slurry at a controlled density and feeds it to the pumpers.' },
        { question: 'What is a frac missile?', answer: 'The frac manifold: it distributes slurry from the blender to each pumper and gathers their high-pressure discharge into the treating line to the well.' },
        { question: 'What does 360K mean on a nitrogen unit?', answer: 'Its pumping rate class — 360,000 standard cubic feet of nitrogen per hour.' },
        { question: 'Why are acid tanks lined?', answer: 'So the acid does not attack the steel; FRP linings are common.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Frac and stimulation equipment:</p>' + stockList(['frac-pumpers', 'frac-blender', 'frac-hydration-unit', 'frac-las', 'frac-manifold', 'frac-sand-silos', 'frac-tanks', 'frac-transfer-pumps', 'frac-data-van', 'stimulation-pumping-units', 'stimulation-nitrogen-unit', 'stimulation-acid-tanks', 'stimulation-batch-mixers', 'stimulation-transfer-pump']),
    },
    {
      type: 'product_embed',
      heading: 'Frac and stimulation equipment',
      skus: ['IH-FP-2500-TRL-NET', 'IH-FB-MFR-50-ADC-CAS', 'IH-FHU-200-CP1212-90', 'IH-FM-16P-4IN-15K-1502', 'IH-OFE-FSM', 'IH-N2-360-10K-TRK', 'IH-SPU-T2X1000-15K-TRL', 'IH-ATK-ISO20-FRP-6KG'],
    },
    { type: 'category_link', slug: 'frac-manifold', label: 'Frac manifolds', blurb: 'Missiles, zipper and universal manifolds.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Completion and stimulation services.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'nov-pp', text: 'NOV. Pressure Pumping Equipment brochure.', url: 'https://assets.nov.com/NCP4N68N/at/2pkvb894nmcj9v5wft5vhtk8/Pressure_Pumping_Equipment_Brochure.pdf' },
        { id: 'nov-n2', text: 'NOV. Nitrogen Pumping Unit, Non-Fired.', url: 'https://www.nov.com/products/nitrogen-pumping-unit-non-fired' },
        { id: 'slb-crosslinker', text: 'SLB Energy Glossary. Crosslinker.', url: 'https://glossary.slb.com/en/terms/c/crosslinker' },
        { id: 'slb-blender', text: 'SLB Energy Glossary. Blender.', url: 'https://glossary.slb.com/en/terms/b/blender' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['well-service-and-stimulation-hose', 'frac-water-transfer-lay-flat-hose', 'flow-iron-explained', 'oilfield-pressure-relief-valves'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Equipment functions and ratings from NOV brochures and the SLB Energy Glossary.',
    },
    {
      type: 'cta_block',
      heading: 'Building or adding to a spread?',
      body: 'Send the units you need, the treating pressure and rate, and where the equipment will work. We will quote the equipment, manifolds and iron.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
