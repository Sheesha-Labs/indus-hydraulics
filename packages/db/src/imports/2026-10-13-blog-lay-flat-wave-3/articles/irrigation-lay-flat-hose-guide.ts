import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Irrigation lay flat hose: mains and drip sub-mains, PVC vs TPU. Checked 2026-10-13: Spain ESYRCE
 * 2023 (MAPA) irrigated area and method shares; extension sources on sub-mains feeding drip
 * laterals (Texas A&M; Delaware State). No claim that lay flat is "the standard" sub-main.
 * Product facts from IH-LF-PVC / TDW / TPW / EHR / EHM.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'irrigation-lay-flat-hose-guide',
  title: 'Lay flat hose for irrigation: supply mains, drip sub-mains, and PVC vs TPU',
  excerpt:
    'Spain irrigates 3.7 million hectares, and more than half of it by drip. Between the pump and the drip tape there is a lot of hose — supply mains across the farm and sub-mains along the head of every block. Where lay flat fits in an irrigation system, how to choose between PVC and TPU, how to size mains and sub-mains, and how to make seasonal hose last more than a season.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Irrigation Lay Flat Hose: Mains, Drip Sub-Mains, PVC vs TPU',
  seoDescription:
    'How lay flat hose is used in irrigation: temporary supply mains and drip sub-mains, PVC vs TPU, sizing for flow and pressure, take-off connections, handling with reels and movers, and storage between seasons.',
  focusKeyword: 'irrigation lay flat hose',
  publishedAt: '2026-10-13T21:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Spain irrigated 3.71 million hectares in 2023, 57.6% of it by localised (drip) irrigation, according to the agriculture ministry’s ESYRCE survey.',
        'Lay flat serves two jobs: temporary supply mains from pump or reservoir to the field, and sub-mains that feed drip laterals along the head of each block.',
        'PVC lay flat is light and cheap for seasonal, low-pressure use; TPU lasts longer, takes higher pressure and resists UV, abrasion and chemicals.',
        'Size mains for the whole farm’s peak flow; size sub-mains so pressure along the block stays even for the drip tape.',
        'Drain, roll and store hose out of the sun between seasons — sun and rodents end more irrigation hose than pressure does.',
      ],
    },
    {
      type: 'lead',
      html: 'In southern Europe, irrigation is what makes high-value farming possible. Spain’s agriculture ministry recorded 3,713,936 hectares under irrigation in 2023 — about 23% of cropland, producing around 65% of the value of crop output — and 57.6% of that area was watered by localised (drip) irrigation, ahead of gravity, sprinkler and self-propelled systems. Drip lines get the attention, but every block of drip tape is fed by a sub-main, and every sub-main by a main from the pump. Much of that is lay flat hose.',
    },

    { type: 'section_head', number: '/01', title: 'Where lay flat fits.', anchor: 'where' },
    {
      type: 'prose',
      html: '<ul><li><strong>Supply mains</strong>: temporary or seasonal lines from the pump, well or reservoir to the fields, moved between plots as crops rotate.</li><li><strong>Drip sub-mains</strong>: the line along the head of a block that feeds each drip lateral through a take-off connector, often with a pressure regulator and a flush valve at the end.</li><li><strong>Transfer and filling</strong>: moving water between reservoirs, tanks and ponds.</li><li><strong>Emergency and drought supply</strong>: bringing water from a distant source when local supplies fail.</li></ul>',
    },
    {
      type: 'figure',
      imageId: FIG['fig-drip-submain'],
      captionPrefix: 'FIG. 01',
      caption: 'A lay flat sub-main along the head of a block, feeding each drip line through a take-off connector.',
      aspectRatio: '16/9',
    },
    {
      type: 'direct_answer',
      question: 'What is lay flat hose used for in irrigation?',
      answer:
        'Lay flat hose carries water from the pump or reservoir to the fields as a temporary supply main, and runs along the head of each block as a sub-main feeding the drip laterals. It rolls flat for storage and moves easily between plots and seasons.',
    },

    { type: 'section_head', number: '/02', title: 'PVC or TPU?', anchor: 'material' },
    {
      type: 'comparison_table',
      caption: 'Irrigation lay flat hose materials',
      columns: ['Property', 'PVC lay flat', 'TPU lay flat'],
      rows: [
        { cells: ['Cost', 'Lowest', 'Higher'] },
        { cells: ['Weight', 'Light — one person can run it out', 'Light for its strength'] },
        { cells: ['Pressure', 'Low-pressure water', '21 bar at small bores, 14–15 bar to 14"'] },
        { cells: ['Sun, heat and cold', 'Ages and stiffens fastest', 'Resists UV and ozone; −50 to +80 °C'], highlight: true },
        { cells: ['Abrasion and dragging', 'Moderate', 'High'] },
        { cells: ['Best for', 'Seasonal sub-mains, short low-pressure runs', 'Long mains, multi-season use, higher pressure'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For a drip sub-main that works at low pressure, is laid in spring and lifted in autumn, <a href="/p/pvc-lay-flat-discharge-hose">PVC lay flat</a> is often enough. For long supply mains, pumped lines with real pressure, and hose that has to last many seasons in sun and on rough ground, <a href="/p/tpu-lay-flat-dewatering-hose">TPU lay flat</a> pays back its higher price. Where the water also serves people or livestock, use <a href="/p/tpu-lay-flat-drinking-water-hose">drinking-water hose</a>. Our <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">materials comparison</a> goes into more detail.',
    },

    { type: 'section_head', number: '/03', title: 'Sizing mains and sub-mains.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'A <strong>main</strong> carries the peak flow of every block running at once, so it is sized on friction loss over its length, like any pumped line — see our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>. A <strong>sub-main</strong> has a different job: to deliver nearly the same pressure to the first and last drip lateral. Because flow falls along the sub-main as each lateral draws off, the loss is less than for a pipe carrying full flow throughout, but a sub-main that is too small or too long still starves the far end. Drip tape works at low pressure, so keep the variation along the sub-main within what the tape maker allows, and fit a pressure regulator at the inlet where the main runs higher.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Take-off connectors.',
      body: 'Drip laterals connect to a lay flat sub-main through take-off connectors punched into the hose wall. Match the connector to the hose wall thickness and pressure, and make the holes with the correct punch — a ragged hole leaks and can tear under pressure.',
    },

    { type: 'section_head', number: '/04', title: 'Handling and storage.', anchor: 'handling' },
    {
      type: 'paragraph',
      html: 'Large farms move hose a lot. A <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a> lays and recovers about 610 m of 6" lay flat from the tractor hydraulics, and a <a href="/p/lay-flat-hose-mover">hose mover</a> relocates long lines between fields without dragging them. At the end of the season, drain and flush the hose, roll it flat from the far end, and store it under cover, out of the sun and away from rodents — the same practice we recommend for <a href="/blog/lay-flat-hose-in-gulf-heat">lay flat hose in Gulf heat</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is PVC or TPU lay flat better for irrigation?', answer: 'PVC for seasonal, low-pressure sub-mains where cost matters most; TPU for long mains, higher pressure and hose that must last several seasons in the sun.' },
        { question: 'What size lay flat hose for a drip sub-main?', answer: 'Large enough that pressure at the last lateral stays within the drip tape maker’s allowed variation. Send the block length, number of laterals and flow per lateral and we will size it.' },
        { question: 'How do you connect drip tape to lay flat hose?', answer: 'With take-off connectors fitted through holes punched in the hose wall, matched to the hose wall thickness and pressure.' },
        { question: 'How much of Spain is drip irrigated?', answer: '57.6% of Spain’s 3.71 million irrigated hectares in 2023, according to the ESYRCE survey.' },
        { question: 'How should irrigation hose be stored over winter?', answer: 'Drained, flushed, rolled flat and stored under cover, out of the sun and away from rodents.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For irrigation',
      skus: ['IH-LF-PVC', 'IH-LF-TDW', 'IH-LF-TPW', 'IH-LF-EHR', 'IH-LF-EHM', 'IH-LF-SEP'],
    },
    {
      type: 'category_link',
      slug: 'lightweight-lay-flat-hoses',
      label: 'Lightweight lay flat hoses',
      blurb: 'PVC lay flat for irrigation and low-pressure water.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'spain',
      label: 'Irrigation hose supply to Spain',
      blurb: 'Lay flat mains and sub-mains for Spanish growers.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'italy',
      label: 'Irrigation hose supply to Italy',
      blurb: 'Irrigation lay flat hose for Italian farms.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'romania',
      label: 'Irrigation hose supply to Romania',
      blurb: 'Supply mains and transfer hose for Romanian agriculture.',
    },
    {
      type: 'related_articles',
      slugs: ['tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-in-gulf-heat', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Spanish irrigation figures from the ESYRCE 2023 survey (Ministry of Agriculture, Fisheries and Food). Hose facts from the Indus lay flat listings.',
    },
    {
      type: 'cta_block',
      heading: 'Laying out an irrigation system?',
      body: 'Send the flows, distances, block layout and how long the hose must last. We will recommend PVC or TPU and size mains and sub-mains.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
