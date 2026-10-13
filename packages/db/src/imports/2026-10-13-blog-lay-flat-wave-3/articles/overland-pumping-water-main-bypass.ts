import type { BlogArticleSeed } from '../shared'

/**
 * Over-pumping and temporary water main bypass with lay flat hose (UK, Ireland, Netherlands).
 * Checked 2026-10-13: Water UK Technical Guidance Notes (TGN6 temporary overland mains; TGN2
 * disinfection), DWI Regulation 31 pages and Section B.3 notes, BS 8551:2015 scope, RIVM/Kiwa
 * Water Mark (NL), a published contractor case study (2,200 L/s over-pump). The NSF/ANSI 61 line
 * is the maker's listing for IH-LF-TPW — Reg 31 approval is NOT claimed. Not legal advice.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'overland-pumping-water-main-bypass',
  title: 'Over-pumping and water main bypass: lay flat hose for sewer and mains work',
  excerpt:
    'When a sewer is relined or a water main is repaired, the flow has to go somewhere else. Over-pumping moves sewage around the work; a temporary overland main keeps customers in drinking water. Both are often laid in lay flat hose. How each is planned, what UK hygiene rules require for temporary drinking-water mains, and why the two kinds of hose must never meet.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Over-Pumping and Water Main Bypass Hose: Lay Flat Guide',
  seoDescription:
    'How over-pumping and temporary water main bypass work: sizing lay flat hose, Water UK guidance on temporary overland mains, disinfection, DWI Regulation 31 and emergency products, and keeping sewage and drinking-water hose apart.',
  focusKeyword: 'over-pumping hose',
  publishedAt: '2026-10-13T21:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Over-pumping takes sewage or surface water from upstream of a repair to a point downstream, through temporary pipe or hose.',
        'A temporary overland main keeps drinking water flowing while a main is out of service — and is a hygiene-critical, restricted operation in the UK.',
        'Water UK guidance requires temporary mains to be disinfected, sampled and passed before use, with joints and fittings disinfected at 1,000 mg/L free chlorine.',
        'Products for public water supply in England and Wales need Regulation 31 approval; emergency-use products are time-limited.',
        'Sewage hose and drinking-water hose are separate stocks, identified by colour, and never swapped.',
      ],
    },
    {
      type: 'lead',
      html: 'Most of the UK’s water and sewer networks are maintained live. A sewer being relined still receives flow from every house upstream; a main being repaired still has customers expecting water at the tap. The answer in both cases is a temporary bypass laid over the ground — <strong>over-pumping</strong> for sewage, a <strong>temporary overland main</strong> for drinking water. The volumes can be large: one published case study of a trunk sewer rehabilitation for an English water company describes over-pumping about 2,200 litres a second through temporary overland pipework.',
    },

    { type: 'section_head', number: '/01', title: 'Over-pumping.', anchor: 'over-pumping' },
    {
      type: 'paragraph',
      html: 'In over-pumping, pumps draw from a manhole or wet well upstream of the work and discharge through a temporary line to a manhole downstream. Water companies also use it to manage groundwater infiltration and to keep networks running during pumping-station work. The line has to carry peak flow, including storm flow, for as long as the work lasts — so it is sized on the worst day, not the average one, with standby pumps. Lay flat hose is the quick option for shorter runs and lower flows, laid along kerbs and verges and protected at crossings with hose ramps; for the largest flows and long durations, rigid temporary pipe takes over. See <a href="/blog/lay-flat-hose-vs-hdpe-pipe">lay flat hose vs HDPE pipe</a>.',
    },
    {
      type: 'paragraph',
      html: 'Sewage carries rags, grit and fats, so over-pumping hose needs abrasion and chemical resistance: <a href="/p/tpu-lay-flat-dewatering-hose">TPU transfer hose</a> for longer, higher-pressure lines, or <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> where oil and fats are heavy. Every pump needs rigid <a href="/c/suction-hoses">suction hose</a> on its inlet, and the discharge end must be secured so it cannot whip out of the receiving manhole when the pump starts.',
    },

    { type: 'section_head', number: '/02', title: 'Temporary drinking-water mains.', anchor: 'bypass' },
    {
      type: 'paragraph',
      html: 'A temporary overland main bypasses a section of water main that is being repaired, replaced or relined, and keeps customers supplied. In the UK, Water UK’s Technical Guidance Note on <em>Temporary (Overland) Mains and Services</em> treats them as a short-term measure where no other satisfactory supply exists, and installing one as a <strong>restricted operation</strong>: the people doing it must hold National Water Hygiene registration. The main points:',
    },
    {
      type: 'prose',
      html: '<ul><li>A pre-planned temporary main is <strong>disinfected, sampled and must pass</strong> before it is commissioned.</li><li>All joints and fittings are disinfected with <strong>1,000 mg/L free chlorine</strong>.</li><li>The risk of oil, petrol or solvents permeating plastic pipe must be checked; on contaminated land, use barrier pipe.</li><li>Chlorinated water discharged afterwards is dechlorinated where necessary.</li><li>A bypass main moved during relining that has been out of service for 14 days or less and is judged clean can be re-disinfected at 50 mg/L for 30 minutes; otherwise the company’s new-mains procedure applies.</li></ul>',
    },
    {
      type: 'direct_answer',
      question: 'Can lay flat hose be used as a temporary water main?',
      answer:
        'Yes, if the hose is approved for drinking water where it is used and the installation follows the water company’s hygiene procedure. In the UK that means a product accepted under Regulation 31 (or a DWI emergency-use listing), installation by hygiene-registered staff, and disinfection, sampling and a pass before the main goes into service.',
    },

    { type: 'section_head', number: '/03', title: 'Product approval.', anchor: 'approval' },
    {
      type: 'paragraph',
      html: 'In England and Wales, <strong>Regulation 31</strong> of the Water Supply (Water Quality) Regulations 2016 governs products used by water companies from source to customer; the Drinking Water Inspectorate (DWI) maintains the approved list. A separate section of that list covers products for <strong>emergency, limited use</strong> that may not be permanently installed — the DWI asks for its advice before use beyond 90 days on any one occasion, and names flexible hoses among emergency equipment. In the Netherlands, materials in contact with drinking water are certified under the Kiwa Water Mark, recognised by the ministry as proof of compliance. For temporary supplies outside the public network — building sites, events — BS 8551 covers the design and operation of temporary water supply systems.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-drinking-water-hose">TPU drinking-water hose</a> is blue for identification and its manufacturer lists NSF/ANSI 61 certification, the North American drinking-water standard. That is not a UK Regulation 31 approval or a Kiwa Water Mark: if your water company or authority requires either, tell us before ordering and we will confirm what can be supplied against it.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Two stocks, never mixed.',
      body: 'Hose that has carried sewage, flood water or anything else non-potable must never be used for drinking water, however well it is cleaned. Keep drinking-water hose as a separate, identified stock — blue, capped, stored clean — and record where each length has been used.',
    },

    { type: 'section_head', number: '/04', title: 'Sizing the bypass.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'A drinking-water bypass must carry peak demand at a pressure customers will accept, so friction matters as much as on any pumped line. Over a few hundred metres, one size larger than the main’s outlet often keeps losses acceptable; for longer runs use our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>. Our TPU drinking-water hose runs from 1-1/2" to 16" — 21 bar up to 2-1/2", 17 bar at 3" and 4", 14–15 bar from 6" to 14" and 10 bar at 16" — in lengths up to 400 m, so long bypasses have few joints to disinfect.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is over-pumping?', answer: 'Pumping sewage or surface water from upstream of a section under repair to a point downstream, through temporary pipe or hose, so the network keeps working during the work.' },
        { question: 'Who can install a temporary water main in the UK?', answer: 'Water UK guidance treats it as a restricted operation: installers must hold National Water Hygiene registration, and the water company’s procedure applies.' },
        { question: 'How is a temporary main disinfected?', answer: 'Under Water UK guidance it is disinfected, sampled and must pass before use; joints and fittings are disinfected with 1,000 mg/L free chlorine.' },
        { question: 'Is NSF/ANSI 61 accepted in the UK?', answer: 'Not as a substitute for Regulation 31 approval for public water supply in England and Wales. Confirm the approval your water company needs before ordering.' },
        { question: 'Can over-pumping hose be cleaned and used for drinking water?', answer: 'No. Keep sewage and drinking-water hose as separate stocks.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For over-pumping and bypass',
      skus: ['IH-LF-TPW', 'IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-SEP', 'IH-LF-CVG', 'IH-LF-CFL'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Drinking-water and transfer hose for bypass and over-pumping.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Lay flat hose supply to the UK',
      blurb: 'Over-pumping and bypass hose for UK water and sewer contractors.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'ireland',
      label: 'Lay flat hose supply to Ireland',
      blurb: 'Bypass and transfer hose for Irish water infrastructure work.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'netherlands',
      label: 'Lay flat hose supply to the Netherlands',
      blurb: 'Transfer and bypass hose for Dutch water work.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-vs-hdpe-pipe', 'lay-flat-hose-flow-and-friction-loss', 'flood-response-pumping-lay-flat-hose', 'suction-hose-vs-lay-flat-hose', 'lay-flat-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Water UK Technical Guidance Notes on temporary overland mains and disinfection; DWI Regulation 31 and emergency-use notes; BS 8551:2015; RIVM on the Kiwa Water Mark. Not legal advice.',
    },
    {
      type: 'cta_block',
      heading: 'Planning an over-pump or bypass?',
      body: 'Send the flow, distance, duration and the approval your water company requires. We will size the hose and confirm what can be supplied against it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
