import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Construction dewatering hose systems on GCC sites. Groundwater context from peer-reviewed and
 * press sources gathered 2026-10-13 (sabkha water tables; Doha's rising water table and the Metro
 * Red Line, Peninsula 2015; Jeddah groundwater rise, ASCE 1989 and AJGS 2014; Kuwait City, UAEU
 * 2001; Jeddah coralline limestone and wellpoints). Dubai Local Order 8/2002 for the sand-trap rule.
 * Product facts from the IH-LF listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'construction-dewatering-hose-gcc',
  title: 'Construction dewatering hose in the GCC: wellpoints, deep wells and the discharge line',
  excerpt:
    'Across much of the Gulf coast the water table sits a metre or two below the surface, and in Doha, Jeddah and Kuwait City it has been rising. Almost every basement, tunnel and utility trench has to be dewatered. How the hose system is put together — wellpoint connections, suction, header and lay flat discharge to a settlement tank — and how to size and specify each part.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Construction Dewatering Hose in the GCC: Wellpoints to Discharge',
  seoDescription:
    'How GCC construction dewatering hose systems work: why water tables are high in Dubai, Doha, Jeddah and Kuwait, wellpoint and deep-well layouts, suction vs lay flat discharge hose, sizing, saline groundwater and settlement tanks.',
  focusKeyword: 'construction dewatering hose',
  publishedAt: '2026-10-13T17:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Coastal sabkha in the Gulf typically holds groundwater within 1–2 m of the surface, and urban water tables in Doha, Jeddah and Kuwait City have risen for decades.',
        'Wellpoints suit shallow excavations in permeable ground; deep wells suit deeper basements; sumps and ditches handle the rest.',
        'Everything on the suction side — wellpoint connections, header-to-pump hose — must be rigid-wall hose. Lay flat belongs on the discharge.',
        'Size the discharge for the total pump flow and the distance to the settlement tank or outfall; one size up often halves friction loss.',
        'Groundwater here is often saline and aggressive: TPU and nitrile hose resist it; choose coupling metals with care.',
      ],
    },
    {
      type: 'lead',
      html: 'Dig a basement almost anywhere along the Gulf coast and you meet water within a few metres. Studies of coastal sabkha find the water table close to 2 m below ground, sometimes much less. In Doha a rising water table — blamed on rapid development, leaking older networks and seawater intrusion — flooded key projects and halted tunnelling on the Metro Red Line in 2015. Jeddah’s groundwater rose for decades with seepage from cesspools and irrigation, damaging roads and foundations, and Kuwait City has seen similar rises from over-irrigation and leaking networks. Dewatering is not a special case on GCC sites; it is part of the programme.',
    },

    { type: 'section_head', number: '/01', title: 'The three methods.', anchor: 'methods' },
    {
      type: 'comparison_table',
      caption: 'Construction dewatering methods and their hose',
      columns: ['Method', 'Suits', 'Hose on the suction side', 'Discharge'],
      rows: [
        { cells: ['Wellpoints', 'Shallow excavations and trenches in sand and permeable ground', 'Flexible swing connections from each wellpoint to the header, header hose to the pump', 'Lay flat to settlement tank'] },
        { cells: ['Deep wells', 'Deeper basements and shafts', 'None at surface — submersible pump in each well, riser to the well head', 'Lay flat or pipe collector to the tank'] },
        { cells: ['Sump pumping', 'Open excavations, rainwater, seepage', 'Rigid-helix suction hose or submersible pump', 'Lay flat to the tank'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Ground conditions drive the choice. Research on Jeddah’s highly permeable coralline limestone, for example, recommends wellpoints in the coastal zone and ditches and sumps further inland, and warns that deep wells there would draw enormous volumes and wash fines out of the ground. Dubai’s own drainage regulation refers to deep-well dewatering. Your dewatering designer sets the method; the hose has to match it.',
    },

    { type: 'section_head', number: '/02', title: 'A wellpoint system, end to end.', anchor: 'wellpoints' },
    {
      type: 'figure',
      imageId: FIG['fig-wellpoints'],
      captionPrefix: 'FIG. 01',
      caption: 'Wellpoints at close spacing along the excavation, each joined to the header by a flexible connection.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'A line of wellpoints — small-diameter screened tubes jetted into the ground at close centres — is joined to a <strong>header</strong> pipe along the edge of the excavation by short flexible connections. A vacuum-assisted wellpoint pump draws water from the whole header. Every one of those connections works under vacuum, so they must be <a href="/c/suction-hoses">suction hose</a> with a rigid helix; a lay flat hose there would collapse. On the pump’s outlet the pressure is positive, and that is where <a href="/c/lay-flat-hoses">lay flat hose</a> takes over, carrying the water to the settlement tank and outfall. Our article on <a href="/blog/suction-hose-vs-lay-flat-hose">suction hose vs lay flat hose</a> explains the split.',
    },
    {
      type: 'direct_answer',
      question: 'What hose is used for construction dewatering?',
      answer:
        'Two kinds. Rigid-helix suction hose on the suction side — wellpoint connections and pump inlets — because it works under vacuum. Lay flat hose on the discharge side, from the pump to the settlement tank and outfall, because it is light, rolls up and runs long distances under pressure. TPU or nitrile lay flat is preferred for long, outdoor or oily-water lines.',
    },

    { type: 'section_head', number: '/03', title: 'Sizing the discharge line.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Add up the flow of every pump that feeds the line, then choose a bore that keeps friction loss well within the pump’s head at that flow. Discharge lines on GCC sites are often long, because the settlement tank, lagoon or approved outfall is at the site boundary or beyond it. As a rough guide from our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>, 6" lay flat carries 150 m³/h for several hundred metres at modest loss; at 400 m³/h and above, 8" to 10" is the usual starting point. Most site dewatering runs at low pressure, so the <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> (10 bar) or <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> (14 to 21 bar by size) both have ample margin.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Saline and aggressive groundwater.',
      body: 'Gulf groundwater is often saline, and research has linked it to aggressive conditions in foundations. TPU and nitrile hose are not affected. For couplings that stay in service for months, ask about stainless steel or coated options, flush the line with fresh water before storage, and keep seals clean.',
    },

    { type: 'section_head', number: '/04', title: 'Settlement tank and outfall.', anchor: 'discharge' },
    {
      type: 'paragraph',
      html: 'Pumped groundwater carries sand and silt. Dubai’s drainage regulation requires a sand trap, kept clean, before dewatering water enters the public network, and Qatar’s authorities expect sedimentation tanks or filters and regular water-quality reporting. The hose layout should bring every pump’s discharge into the tank inlet, take clear water from the outlet to the approved discharge point, and make the line easy to inspect for leaks. See our guide to <a href="/blog/dewatering-discharge-permits-dubai-qatar">dewatering discharge permits in Dubai, Abu Dhabi and Qatar</a> for what the permit will ask for.',
    },

    { type: 'section_head', number: '/05', title: 'Choosing the hose.', anchor: 'choosing' },
    {
      type: 'decision_tree',
      heading: 'Which discharge hose?',
      branches: [
        { condition: 'Is the line long, outdoors for months, or dragged over rough ground?', outcome: 'TPU lay flat dewatering hose.', sku: 'IH-LF-TDW' },
        { condition: 'Is there oil, fuel or cement residue in the water?', outcome: 'NBR lay flat discharge hose.', sku: 'IH-LF-NBR' },
        { condition: 'High-head or continuous pumping where a standard hose wears through?', outcome: 'Heavy-duty NBR lay flat hose.', sku: 'IH-LF-NBRH' },
        { condition: 'Short, low-pressure, temporary run of clean water?', outcome: 'PVC lay flat hose.', sku: 'IH-LF-PVC' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why is groundwater so high on Gulf construction sites?', answer: 'Coastal sabkha naturally holds water within a metre or two of the surface, and in cities such as Doha, Jeddah and Kuwait City leaking networks, irrigation and seepage have raised the water table further.' },
        { question: 'Can lay flat hose be used on a wellpoint system?', answer: 'Only on the discharge side. The wellpoint connections and header-to-pump hose work under vacuum and must be rigid-helix suction hose.' },
        { question: 'What size discharge hose does a dewatering pump need?', answer: 'Match the pump outlet as a minimum, then size up for long lines: one size larger often halves the friction loss. Tell us the flow and distance and we will size it.' },
        { question: 'Does saline groundwater damage lay flat hose?', answer: 'No. TPU and nitrile resist salt water. Coupling metals need more care on long-running systems.' },
        { question: 'What couplings do dewatering lines use?', answer: 'Camlock and Bauer on smaller lines, grooved, Storz or flanged on large-bore lines. See our lay flat hose coupling guide.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For dewatering systems',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-NBRH', 'IH-LF-SEP', 'IH-LF-PVC', 'IH-LF-CVG', 'IH-LF-CFL'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Discharge and transfer hose in TPU, nitrile and PVC, with suction hose and couplings.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Dewatering hose supply to Qatar',
      blurb: 'Discharge and suction hose for Doha basements, tunnels and utility works.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Dewatering hose supply to Saudi Arabia',
      blurb: 'Hose for Jeddah, Riyadh and Eastern Province excavations.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'kuwait',
      label: 'Dewatering hose supply to Kuwait',
      blurb: 'Suction and lay flat discharge hose for Kuwait construction sites.',
    },
    {
      type: 'related_articles',
      slugs: ['dewatering-discharge-permits-dubai-qatar', 'suction-hose-vs-lay-flat-hose', 'water-suction-and-dewatering-hose', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-in-gulf-heat', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Groundwater context from peer-reviewed studies of Gulf sabkha, Jeddah and Kuwait City groundwater, and press reports of Doha’s water table (2015). Regulatory references: Dubai Local Order No. 8 of 2002. Product facts from the Indus lay flat and suction hose listings.',
    },
    {
      type: 'cta_block',
      heading: 'Dewatering a site?',
      body: 'Send the pump schedule, the distance to the settlement tank and outfall, and the water analysis if you have it. We will size suction and discharge hose and couplings as one package.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
