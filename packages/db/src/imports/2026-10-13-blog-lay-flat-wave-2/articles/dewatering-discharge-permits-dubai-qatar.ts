import type { BlogArticleSeed } from '../shared'

/**
 * Dewatering discharge permits in Dubai, Abu Dhabi and Qatar, and what they mean for the hose and
 * pump plan. Sources checked 2026-10-13: Dubai Municipality services list; Dubai Local Order No. 8
 * of 2002 (Arts 27–30); Dubai Law No. 11 of 2024; Dubai Development Authority dewatering NOC page;
 * Abu Dhabi Law No. 5 of 2016 (via UNEP LEAP); Ashghal "Management of Construction Dewatering"
 * guideline (2014) and press quoting Ashghal (2014, 2018). Saudi Arabia and Kuwait could not be
 * verified, so they are not described. No numeric discharge limits are given — none were verified.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'dewatering-discharge-permits-dubai-qatar',
  title: 'Dewatering discharge permits in Dubai, Abu Dhabi and Qatar: what the hose and pump plan must show',
  excerpt:
    'Pumping groundwater out of an excavation is regulated in every Gulf city, and the permit is built around the equipment: how many dewatering points, how many pumps and of what capacity, what diameter of discharge line, and what settlement tank. A plain guide to the Dubai, Abu Dhabi and Qatar regimes, and how to put together a hose and pump plan that gets through.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Dewatering Discharge Permits: Dubai, Abu Dhabi and Qatar',
  seoDescription:
    'Who issues construction dewatering and discharge permits in Dubai, Abu Dhabi and Qatar, what the application asks for — dewatering points, pumps, pipe diameter, settlement tank — and how to plan the hose and pump layout to match.',
  focusKeyword: 'dewatering discharge permit',
  publishedAt: '2026-10-13T17:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'In Dubai, Dubai Municipality issues a permit to dewater groundwater on construction sites, with separate NOCs for discharge to temporary lagoons and to the sea; the Dubai Development Authority runs its own dewatering NOC in its area.',
        'Dubai’s Local Order No. 8 of 2002 makes the permit specify the number of dewatering points, the number and capacity of pumps, the pipe diameter and the sedimentation tank.',
        'In Abu Dhabi, groundwater activities are licensed under Law No. 5 of 2016, and the municipality’s dewatering guidelines govern site applications.',
        'In Qatar, Ashghal’s construction dewatering guideline sets the rules; discharge to its drainage network goes through approved contractors.',
        'Whatever the city, the hose and pump plan is part of the application — size and document it before you apply.',
      ],
    },
    {
      type: 'lead',
      html: 'On a Gulf construction site the dewatering pumps often start before the piling rig arrives — and before they do, someone has to obtain permission to discharge the water. The rules differ from city to city, but they share a logic: the authority wants to know how much water will be pumped, where it will go, how the sand and silt will be taken out of it, and that the equipment on site matches the paperwork. This guide sets out what we could verify from official and published sources in October 2026. Rules change; always confirm with the authority or your consultant before applying.',
    },

    { type: 'section_head', number: '/01', title: 'Dubai.', anchor: 'dubai' },
    {
      type: 'paragraph',
      html: '<strong>Dubai Municipality</strong> lists a <em>Permit to Dewater Groundwater in Construction Sites</em> among its services, alongside an <em>NOC to Discharge Groundwater into Temporary Lagoons</em> and an <em>NOC to Withdraw or Discharge Water from and to the Sea</em>. The underlying rules for discharge into the public drainage network are in <strong>Local Order No. 8 of 2002</strong> on sewerage, irrigation and water:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Article 27</strong> — discharging dewatering water into the rainwater drainage network requires a written permit, which states the number of dewatering points, the number and capacity of pumps, the pipe diameter and the specification of the sedimentation tank.</li><li><strong>Article 28</strong> — a sand trap must be provided and kept clean at all times.</li><li><strong>Article 29</strong> — pumping must stop if infiltration or leakage is found.</li><li><strong>Article 30</strong> — the site must be restored and a completion certificate obtained; the order also sets a security deposit and daily charges per dewatering point.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Two further points. Within its own area, the <strong>Dubai Development Authority</strong> issues a separate <em>Dewatering NOC</em> for discharge to the storm network or a temporary lagoon; its published terms are a 6-month validity and an application that includes the dewatering contractor’s trade licence and a drawing. And Dubai Law No. 11 of 2024, which created the Dubai Environment and Climate Change Authority, gives that authority groundwater licensing powers — so check which body handles your application today.',
    },

    { type: 'section_head', number: '/02', title: 'Abu Dhabi.', anchor: 'abu-dhabi' },
    {
      type: 'paragraph',
      html: 'Abu Dhabi regulates groundwater under <strong>Law No. 5 of 2016</strong>, which makes the Environment Agency – Abu Dhabi the licensing body for groundwater activities. Construction dewatering applications have been handled by the municipality under its dewatering design guidelines, which set monitoring requirements by hazard zone, distance to neighbouring structures and depth of excavation. We could not confirm the current permit name or issuing department, so treat this as orientation and confirm with the municipality and EAD.',
    },

    { type: 'section_head', number: '/03', title: 'Qatar.', anchor: 'qatar' },
    {
      type: 'paragraph',
      html: 'In Qatar, <strong>Ashghal</strong> (the Public Works Authority) published its guideline <em>Management of Construction Dewatering</em> in 2014, including requirements for treating the effluent. Ashghal prequalifies dewatering contractors, and approved contractors apply for permission to discharge into its drainage networks. Ashghal has described five routes for dewatering water: the storm network, direct to sea, temporary lagoons, injection into deep aquifers, and reuse on site. Developer permit-to-work requirements we have seen add sedimentation tanks or filters to Ashghal’s standard, calibrated flow meters and weekly reporting of TSS, TDS, pH, turbidity and odour.',
    },
    {
      type: 'direct_answer',
      question: 'Do you need a permit to discharge dewatering water in Dubai?',
      answer:
        'Yes. Dubai Municipality issues a permit to dewater groundwater on construction sites and separate NOCs to discharge to temporary lagoons or the sea; the Dubai Development Authority issues its own dewatering NOC within its area. Under Local Order No. 8 of 2002 the permit specifies the dewatering points, pumps, pipe diameter and sedimentation tank.',
    },

    { type: 'section_head', number: '/04', title: 'Elsewhere in the GCC.', anchor: 'elsewhere' },
    {
      type: 'paragraph',
      html: 'Saudi Arabia, Kuwait, Oman and Bahrain all regulate discharges to drains, the sea and the environment, usually through the municipality and the environmental regulator, but we could not verify a specific construction dewatering permit for them from official sources. Ask the main contractor or consultant which approvals apply to the project, and expect the same questions: flow, discharge point, sediment removal and monitoring.',
    },

    { type: 'section_head', number: '/05', title: 'Building the hose and pump plan.', anchor: 'plan' },
    {
      type: 'paragraph',
      html: 'Because the permit describes the equipment, the equipment has to be decided first. A plan that gets through quickly answers these questions on one drawing and one schedule:',
    },
    {
      type: 'comparison_table',
      caption: 'What the application asks, and the hose and pump decision behind it',
      columns: ['Permit asks for', 'Decision behind it', 'Where to start'],
      rows: [
        { cells: ['Number of dewatering points', 'Method: wellpoints, deep wells or sumps', 'Dewatering design'] },
        { cells: ['Number and capacity of pumps', 'Total flow, duty and standby pumps', 'Pump schedule'] },
        { cells: ['Pipe diameter', 'Discharge line bore for total flow and length', 'Friction loss check — lay flat or pipe'], highlight: true },
        { cells: ['Sedimentation tank', 'Tank size and inlet and outlet connections', 'Hose couplings to suit the tank'] },
        { cells: ['Discharge point', 'Route to network, lagoon or sea', 'Hose length and road crossings'] },
        { cells: ['Monitoring', 'Flow meter and sampling point on the line', 'Flanged or grooved connections for the meter'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For the discharge line, lay flat hose is the usual choice: it runs from pumps to tank and from tank to outfall in long lengths, and it is easy to re-route as the excavation advances. Size the bore for the total flow over the full length using our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>, use <a href="/p/large-bore-flanged-lay-flat-coupling">flanged</a> or <a href="/p/large-bore-lay-flat-grooved-coupling">grooved couplings</a> where the line meets a flow meter or tank, and remember Article 29: leaks stop the pumping. Couplings fitted properly and a daily walk of the line are part of compliance.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check before you rely on this.',
      body: 'Authorities, fees and procedures change, and responsibilities in Dubai have been moving between bodies. This article is a guide to the questions, not legal advice — confirm the current requirements with the issuing authority or your consultant before you apply or start pumping.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Who issues dewatering permits in Dubai?', answer: 'Dubai Municipality issues the permit to dewater groundwater on construction sites and NOCs for discharge to lagoons or the sea; the Dubai Development Authority issues a dewatering NOC in its area. The Dubai Environment and Climate Change Authority also holds groundwater licensing powers under Law No. 11 of 2024 — confirm which applies.' },
        { question: 'What does a Dubai dewatering discharge permit specify?', answer: 'Under Local Order No. 8 of 2002: the number of dewatering points, the number and capacity of pumps, the pipe diameter and the sedimentation tank specification.' },
        { question: 'Who regulates construction dewatering in Qatar?', answer: 'Ashghal, under its Management of Construction Dewatering guideline. Discharge to its drainage network is through prequalified dewatering contractors.' },
        { question: 'Is a settlement tank required?', answer: 'Dubai requires a sand trap kept clean at all times before discharge to the network, and Qatar expects sedimentation tanks or filters. Plan for one on every site.' },
        { question: 'Can lay flat hose be used for the permitted discharge line?', answer: 'Yes. It is the usual discharge line from pumps to settlement tank and outfall. Record the bore on the application and use the same size on site.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For the discharge line',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-CFL', 'IH-LF-CVG', 'IH-LF-SEP'],
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Dewatering hose supply to Qatar',
      blurb: 'Lay flat discharge and suction hose for Ashghal-permitted dewatering.',
    },
    {
      type: 'related_articles',
      slugs: ['construction-dewatering-hose-gcc', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-couplings-guide', 'water-suction-and-dewatering-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Dubai Municipality services, Local Order No. 8 of 2002, Law No. 11 of 2024 and the DDA dewatering NOC; Abu Dhabi Law No. 5 of 2016; Ashghal’s 2014 dewatering guideline. Not legal advice — confirm with the authority.',
    },
    {
      type: 'cta_block',
      heading: 'Preparing a dewatering application?',
      body: 'Send the pump schedule and the route to the settlement tank and outfall. We will size the discharge line and couplings so the hose on site matches the permit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
