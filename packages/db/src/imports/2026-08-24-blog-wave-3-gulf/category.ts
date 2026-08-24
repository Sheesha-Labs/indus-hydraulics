import type { BlogBlocksInput } from '@indus/domain'

/**
 * The Gulf-conditions pillar hub.
 *
 * Created rather than reused: none of the nine existing blog categories covers
 * environment. The closest, `maintenance-reliability`, is about regime —
 * registers, intervals, inspection — and putting climate articles there would
 * bury them under a heading nobody searching for heat or salt would open.
 *
 * The hub carries a body from the day it is created, unlike the nine that
 * shipped empty in August and had to be retrofitted in wave 2. Its head term
 * was checked against the focus keywords on all 46 published articles, the
 * nine existing hubs, and /tools/dash-size-chart and /tools/thread-identifier.
 */
export const GULF_CATEGORY = {
  slug: 'gulf-conditions',
  name: 'Gulf operating conditions',
  description:
    'What heat, sun, sand and salt air do to hydraulic and industrial hose in the UAE, and what changes in specification, routing and replacement practice as a result.',
  heroCopy:
    'Almost everything published about hose life assumes a temperate climate, a cool store and air without salt in it. None of those hold here — so the intervals, the storage practice and sometimes the specification have to move.',
  seoTitle: 'Hydraulic hose in Gulf conditions — heat, sun, sand and salt',
  seoDescription:
    'How UAE operating conditions shorten hydraulic and industrial hose life: ambient heat, UV and ozone, sand abrasion, coastal salt and storage. What to change, and what not to.',
  focusKeyword: 'hydraulic hose uae conditions',
  position: 11,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Does hose really wear out faster in the UAE?',
      answer:
        'Yes, and for four separate reasons that compound: ambient heat ages rubber continuously, sun and ozone crack covers that are never touched, sand turns every contact point into a grinding point, and salt-laden humid air corrodes reinforcement wherever a cover has been breached. Only the last one is invisible, which is why it is the one that causes failures without warning.',
    },
    {
      type: 'paragraph',
      html: 'Manufacturer guidance on hose life is written for temperate conditions. It is not wrong — it is answering a question about a different environment, and the gap between that environment and a Mussafah summer is where a surprising amount of unplanned downtime lives.',
    },
    {
      type: 'comparison_table',
      caption: 'The four factors, and where each one does its damage',
      columns: ['Factor', 'What it attacks', 'Visible?'],
      rows: [
        { cells: ['Ambient heat', 'Cover and tube compound — ageing is cumulative', 'Eventually — hardening and crazing'] },
        { cells: ['UV and ozone', 'Cover, on the sun-facing side and on the outside of bends', 'Yes'] },
        { cells: ['Sand', 'Cover, at every contact point and inside clamps', 'Yes'] },
        { cells: ['Salt air and condensation', 'Steel reinforcement, through any breach in the cover', 'No — this is the dangerous one'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Three of the four warn you. The fourth does not.',
      body: 'Heat, sun and sand all leave marks on the outside of the hose, so an inspection regime catches them. Reinforcement corrosion happens under a cover that stays smooth and convincing, and the first symptom is the burst. That asymmetry is the reason coastal operations need age-based replacement rather than inspection alone — and therefore need assemblies tagged with a fitted date.',
    },
    {
      type: 'paragraph',
      html: 'Most of the available improvement is not in buying different hose. <strong>Routing, shielding, shading, clamping and storage account for more hose life in this climate than any grade change</strong>, and all of them are cheaper. The higher-rated construction is the right answer where heat genuinely cannot be designed out — not as the first move.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Rated to 100 °C, 121 °C and 204 °C, stocked in Dubai.' },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'SS316L fittings', blurb: 'For coastal and offshore service.' },
    {
      type: 'cta_block',
      heading: 'Fleet working in heat, sand or salt?',
      body: 'Tell us where the machines work and where the hoses run. The answer is usually shielding, clamping and a shorter interval rather than a different hose — and we will say so when it is.',
      quoteLabel: 'Ask for a review',
    },
  ] satisfies BlogBlocksInput,
}
