import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Hydraulic power unit components: reservoirs, breathers, sight glasses, filters and clogging indicators, bell
 * housings and jaw couplings, bladder accumulators, seal kits. Sources read 2026-10-21: HYDAC bladder accumulator
 * brochure 3.201.32 (p0 ≤ 0.9 p1, p2:p0 ≤ 4:1 as maximum values; ~10% residual fluid; nitrogen class 2.8; clamps above
 * 1 L or with vibration; certification codes U/S/A9 etc., others on request); HYDAC DFN pressure filter data
 * (clogging indicator 5 bar, optional 7 bar bypass); Lovejoy jaw coupling catalogue (NBR spider 1° angular, 0.015 in
 * parallel; urethane not for start/stop; fail-safe; L-type bore and torque; sizing example with service factor);
 * filter efficiency = 1 − 1/β. Reservoir sizing given as trade rule of thumb only.
 * NOT used: ISO 16889 / DIN 24550 wording (not read); breather maker data.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-power-unit-components',
  title: 'Hydraulic power unit components: reservoirs, filters, bell housings, couplings and accumulators',
  excerpt:
    'Around every pump and motor in a power unit sit the parts that keep it alive: a reservoir sized to let oil cool and settle, a breather and sight glass, return and pressure filters with an indicator that warns before the bypass opens, a bell housing and jaw coupling that hold the pump in line with the motor, and an accumulator charged with nitrogen to the right pressure. How each is sized, the maker rules that matter, and what to send to replace one.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Power Unit Parts: Reservoir, Filter, Accumulator',
  seoDescription:
    'Hydraulic power unit components explained: reservoir sizing, breathers and sight glasses, filter elements, beta ratio and clogging indicators, bell housings and jaw couplings, bladder accumulator pre-charge rules and certification.',
  focusKeyword: 'hydraulic power unit components',
  publishedAt: '2026-10-22T00:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A common rule of thumb sizes an industrial open-circuit reservoir at about three times pump flow per minute; mobile machines run smaller tanks.',
        'Change a filter element when its indicator trips — HYDAC sets the DFN indicator at 5 bar, below the 7 bar bypass — not after the bypass has opened.',
        'A filter’s beta ratio converts to efficiency as 1 − 1/β: β = 1000 is 99.9% at the rated particle size.',
        'Lovejoy’s standard NBR jaw-coupling spider takes 1° angular and 0.015 in parallel misalignment.',
        'HYDAC’s bladder accumulator rule: pre-charge no more than 0.9 × minimum working pressure, and a pressure ratio of no more than 4:1.',
      ],
    },
    {
      type: 'lead',
      html: 'Most hydraulic failures that look like a pump problem start in the parts around the pump: a tank too small to cool the oil, a clogged filter running in bypass, a coupling worn by misalignment, an accumulator with no gas left in it. They are cheap parts, and replacing them correctly is mostly a matter of getting the size and the setting right. For the pump itself, see <a href="/blog/how-to-size-a-hydraulic-pump">how to size a hydraulic pump</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Reservoir, breather and sight glass.', anchor: 'reservoir' },
    {
      type: 'prose',
      html: '<p>The reservoir stores oil, lets air and dirt settle out and sheds heat. A widely used rule of thumb sizes an industrial open-circuit tank at about three times the pump’s flow per minute plus an air space; mobile machines — where weight and space matter — run much smaller tanks and rely on coolers. Saddle and side-mount tanks on trucks are sized to the PTO pump and duty cycle. A <strong>breather</strong> lets air in and out as the level changes, filtering it as it does; a <strong>sight glass</strong> or level gauge shows the oil level and colour at a glance.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Filters and indicators.', anchor: 'filters' },
    {
      type: 'prose',
      html: '<p>Return-line filters clean oil going back to tank; pressure filters protect sensitive components downstream of the pump. Filter elements are rated by particle size and beta ratio — the ratio of particles upstream to downstream — and efficiency is 1 − 1/β, so β = 1000 means 99.9% capture at the rated size. HYDAC’s DFN inline pressure filter, built to DIN 24550, comes without a bypass as standard (7 bar optional) and with a clogging indicator set to 5 bar. The indicator is there to be read: <strong>change the element when it trips</strong>, before a bypass opens and lets unfiltered oil through.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Bell housings and jaw couplings.', anchor: 'couplings' },
    {
      type: 'prose',
      html: '<p>A bell housing bolts the pump to the motor flange and holds the shafts in line; a jaw coupling transmits torque through an elastomer spider. Lovejoy’s figures for its standard NBR spider: −40 to 100 °C, 1° angular and 0.015 in parallel misalignment, high damping. Urethane spiders carry 1.5 times the torque but are not recommended for cyclic or start-stop duty; Hytrel takes higher temperatures with ½° angular. Jaw couplings are fail-safe — they keep driving if the spider fails. Size by torque: Lovejoy’s example is 20 hp at 1,800 rpm, 700 in-lb nominal, × 1.25 service factor = 875 in-lb design torque.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Bladder accumulators.', anchor: 'accumulators' },
    {
      type: 'comparison_table',
      caption: 'HYDAC bladder accumulator rules (brochure 3.201.32)',
      columns: ['Rule', 'Value'],
      rows: [
        { cells: ['Pre-charge pressure p0', '≤ 0.9 × minimum working pressure p1'], highlight: true },
        { cells: ['Pressure ratio p2 : p0', '≤ 4 : 1'] },
        { cells: ['Residual fluid', 'About 10% of effective gas volume left in the shell'] },
        { cells: ['Charging gas', 'Nitrogen, minimum class 2.8 — never oxygen or air'] },
        { cells: ['Mounting', 'Clamps for volumes above 1 L or with strong vibration'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>HYDAC states these are maximum values, not a permanent load. Accumulators are pressure vessels and are certified for the country they are installed in — HYDAC codes include U for the EU (PED), S for the USA and A9 for China; others, including GCC countries, are on request, so state the destination when ordering.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How big should a hydraulic reservoir be?', answer: 'A common rule of thumb for an industrial open circuit is about three times pump flow per minute; mobile machines use smaller tanks with coolers.' },
        { question: 'When should I change a hydraulic filter element?', answer: 'When its clogging indicator trips — before the bypass opens. HYDAC sets the DFN indicator at 5 bar against a 7 bar bypass.' },
        { question: 'What is a filter beta ratio?', answer: 'Particles upstream divided by particles downstream at a given size; efficiency is 1 − 1/β, so β = 1000 is 99.9%.' },
        { question: 'What pre-charge should a bladder accumulator have?', answer: 'HYDAC: no more than 0.9 times the minimum working pressure, with a maximum-to-pre-charge ratio of no more than 4:1, using nitrogen only.' },
        { question: 'How much misalignment can a jaw coupling take?', answer: 'Lovejoy’s standard NBR spider: 1° angular and 0.015 in parallel. Align better than that for long life.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Reservoirs, breathers, sight glasses, filters and gauges, pump mounts and couplings, filter elements, accumulators and seal kits:</p>' + stockList(['hydraulic-reservoirs-breathers', 'hydraulic-filters', 'pump-mounts-jaw-couplings', 'seals-accessories', 'hydraulic-fitting-seal-kits']),
    },
    {
      type: 'product_embed',
      heading: 'Power unit components',
      skus: ['IH-AMP-TANK', 'IH-BYR-BREATHER', 'IH-CRS-FILTER', 'IH-0330R010BN4HC', 'IH-MGL-MOUNT', 'IH-LVJ-L', 'IH-SB330-10A1', 'IH-HBX-KITS'],
    },
    { type: 'category_link', slug: 'hydraulic-reservoirs-breathers', label: 'Reservoirs and breathers', blurb: 'Steel and aluminium tanks, breathers and sight glasses.' },
    { type: 'category_link', slug: 'pump-mounts-jaw-couplings', label: 'Pump mounts and couplings', blurb: 'Bell housings, brackets and jaw coupling hubs.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'hydac-sb', text: 'HYDAC. Bladder Accumulators, Standard Version (3.201.32).', url: 'https://salesportal.hydac.com/shop/media/catalog/crossbase/PRD_DOC_PRO/PRD_DOC_PRO_3201-00001__SEN__AIN__V32.pdf' },
        { id: 'lovejoy-jaw', text: 'Lovejoy (Timken). Jaw Type Couplings catalogue section.', url: 'https://www.lovejoy-inc.com/wp-content/uploads/2025/12/jaw-section-2025-jw21kept.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['how-to-size-a-hydraulic-pump', 'hydraulic-pump-types-gear-vane-piston', 'dump-pumps-and-pto-pumps', 'contamination-during-a-hose-change'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Accumulator and filter rules from HYDAC; coupling data from Lovejoy; reservoir size as a stated rule of thumb.',
    },
    {
      type: 'cta_block',
      heading: 'Rebuilding a power unit?',
      body: 'Send the pump flow and pressure, motor frame and shaft, filter part numbers and accumulator size. We will quote the tank, filters, mount, coupling and accumulator to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
