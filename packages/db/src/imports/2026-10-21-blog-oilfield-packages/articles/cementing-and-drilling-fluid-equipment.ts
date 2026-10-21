import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Cementing and drilling-fluid surface equipment. Sources read 2026-10-21: NOV Pressure Pumping Equipment brochure
 * (batch mix units for exact-density slurry, one tank mixing while the other discharges, recirculating mixer,
 * non-nuclear density; cement pumpers with recirculating mixer and twin displacement tanks; automatic density control;
 * bulk tanks and pneumatic conveying); SLB Energy Glossary (recirculating mixer; mud balance ±0.1 lbm/gal; pressurised
 * mud balance; degasser — vacuum and surface-area types, mud gas separator for heavily gas-cut mud; standpipe about
 * one-third up the derrick, dual standpipes; triplex pump).
 * NOT used: mud pump model ratings, U-tube seal sizing, API RP 13B / 10B wording (not read).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cementing-and-drilling-fluid-equipment',
  title: 'Cementing and drilling-fluid equipment: cementing units, mixers, silos, mud tanks and degassers',
  excerpt:
    'Two surface systems keep a well under control while it is drilled and cased. The mud system — tanks, a liquid mud plant, pumps, a standpipe manifold and a degasser — circulates drilling fluid. The cementing system — bulk silos, batch or on-the-fly mixers, a cementing unit and its pumps — places cement behind casing at an exact density. What each unit does, how density is controlled and measured, and the difference between a vacuum degasser and a mud gas separator.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Cementing & Drilling Fluid Equipment: Mixers, Mud Tanks',
  seoDescription:
    'Oilfield cementing and drilling-fluid surface equipment explained: cementing units, batch and recirculating mixers, bulk cement silos, density control, mud tanks, liquid mud plants, mud pumps, standpipe manifolds and degassers.',
  focusKeyword: 'oilfield cementing equipment',
  publishedAt: '2026-10-22T00:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cement slurry is mixed to an exact density; batch mixers make a whole job’s slurry before pumping, recirculating (on-the-fly) mixers make it as it is pumped.',
        'Density is measured in pounds per gallon or specific gravity — SG × 8.33 = ppg — and a mud balance reads to about ±0.1 lb/gal.',
        'Twin-tank batch mixers let one tank mix while the other discharges.',
        'Degassers come in vacuum and surface-area types; heavily gas-cut mud goes to a mud gas separator (“poor-boy degasser”) that vents to the flare.',
        'The standpipe manifold routes pump discharge up the derrick to the kelly hose or top drive; large rigs often have two standpipes.',
      ],
    },
    {
      type: 'lead',
      html: 'Drilling fluid holds back formation pressure, carries cuttings out and cools the bit; cement seals the casing to the rock so the well does not leak behind the pipe. Both are pumped from surface equipment that sits on the rig site for the whole job, and both depend on getting the fluid’s density right.',
    },

    { type: 'section_head', number: '/01', title: 'Cementing equipment.', anchor: 'cementing' },
    {
      type: 'comparison_table',
      caption: 'Cementing units and what they do',
      columns: ['Unit', 'Job'],
      rows: [
        { cells: ['Bulk cement silos', 'Store dry cement; aerated and conveyed pneumatically to the mixer'] },
        { cells: ['Batch mixer', 'Mixes the whole slurry to an exact density before pumping; twin tanks mix and discharge in turn'] },
        { cells: ['On-the-fly (recirculating) mixer', 'Mixes slurry continuously; recirculation keeps it uniform'] },
        { cells: ['Cementing unit', 'Pumps (usually triplex) with displacement tanks and density control'], highlight: true },
        { cells: ['Dust collector', 'Captures cement dust vented from silos and bulk transfer'] },
        { cells: ['Rock catcher', 'Strains debris out of the slurry before it reaches the pumps'] },
        { cells: ['Cutting bottle', 'Opens bulk bags of cement or additive into the system'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>NOV describes batch mix units as the economical way to ensure homogeneous slurry of an exact density, with recirculating mixers and non-nuclear density measurement, and cement pumpers with high-energy recirculating mixers, twin displacement tanks and mix-water flowmeters. Density is held by automated control of mix water and cement feed. For field checks, SLB gives the mud balance’s accuracy as ±0.1 lbm/gal; a pressurised balance removes the effect of entrained air.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Drilling-fluid equipment.', anchor: 'mud' },
    {
      type: 'prose',
      html: '<ul><li><strong>Mud tanks</strong> hold the active system, with agitators, guns and sight gauges; <strong>workover tanks</strong> hold brine and completion fluids.</li><li>A <strong>liquid mud plant</strong> stores and mixes mud in bulk — at a base or on a large location — for delivery to rigs.</li><li><strong>Mud pumps</strong> — triplex on most rigs — circulate the fluid; the <strong>standpipe manifold</strong> routes their discharge up the derrick, about one-third of its height, to the kelly hose or top drive. Many large rigs have dual standpipes.</li><li><strong>Degassers</strong> remove entrained gas so the mud keeps its density and the pumps keep their suction: the vacuum type expands bubbles under vacuum, the surface-area type spreads mud over baffles. Heavily gas-cut mud goes first to a <strong>mud gas separator</strong>, which has more capacity and sends the gas to the flare.</li><li>A <strong>mobile mud lab</strong> lets the mud engineer test density, viscosity and filtration on site.</li></ul><p>For the hose between pump and standpipe, see <a href="/blog/api-7k-rotary-vibrator-hose">API 7K rotary and vibrator hose</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Batch mixer or on-the-fly mixer for cementing?', answer: 'A batch mixer prepares the whole job’s slurry to an exact density first; an on-the-fly recirculating mixer mixes continuously while pumping, with automatic density control.' },
        { question: 'How do I convert specific gravity to ppg?', answer: 'Multiply by 8.33: a 2.5 SG slurry is about 20.8 lb/gal.' },
        { question: 'What is the difference between a degasser and a mud gas separator?', answer: 'A degasser (vacuum or surface-area) removes entrained gas from mud returning to the tanks; a mud gas separator handles heavily gas-cut returns and vents the gas to the flare.' },
        { question: 'What does a standpipe manifold do?', answer: 'It routes mud pump discharge to the standpipe and on to the kelly hose or top drive, with valves to isolate pumps and lines.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Cementing and drilling-fluid equipment:</p>' + stockList(['cementing-units', 'cementing-batch-mixer', 'cementing-on-the-fly-mixer', 'cementing-silos', 'cementing-dust-collector', 'cementing-rock-catcher', 'cementing-cutting-bottle', 'dw-mud-tanks', 'dw-liquid-mud-plant', 'dw-mud-pump-package', 'dw-mud-manifolds', 'dw-mud-degasser', 'dw-workover-tanks', 'dw-mobile-labs-workshops']),
    },
    {
      type: 'product_embed',
      heading: 'Cementing and mud equipment',
      skus: ['IH-CMU-S600-SKD', 'IH-CBM-2X100-CRL', 'IH-OTF-20-ADC', 'IH-CSL-1500-LC', 'IH-MTK-500-ISO40', 'IH-MPP-T1600-EDR-MOD', 'IH-OFE-SPM', 'IH-MDG-V1000-UT-NACE'],
    },
    { type: 'category_link', slug: 'cementing-units', label: 'Cementing units', blurb: 'Skid-mounted cementing units with density control.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Drilling, completion and workover.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'nov-pp', text: 'NOV. Pressure Pumping Equipment brochure.', url: 'https://assets.nov.com/NCP4N68N/at/2pkvb894nmcj9v5wft5vhtk8/Pressure_Pumping_Equipment_Brochure.pdf' },
        { id: 'slb-degasser', text: 'SLB Energy Glossary. Degasser.', url: 'https://glossary.slb.com/en/terms/d/degasser' },
        { id: 'slb-mud-balance', text: 'SLB Energy Glossary. Mud balance.', url: 'https://glossary.slb.com/en/terms/m/mud_balance' },
        { id: 'slb-standpipe', text: 'SLB Energy Glossary. Standpipe.', url: 'https://glossary.slb.com/en/terms/s/standpipe' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['api-7k-rotary-vibrator-hose', 'frac-and-stimulation-equipment', 'well-service-and-stimulation-hose', 'mud-gate-valve-repair-kits'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Equipment functions from NOV’s pressure pumping brochure and the SLB Energy Glossary.',
    },
    {
      type: 'cta_block',
      heading: 'Equipping a rig site?',
      body: 'Send the units you need, the pressure and volume, and where they will work. We will quote cementing, mud and bulk equipment with the manifolds and hose to connect it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
