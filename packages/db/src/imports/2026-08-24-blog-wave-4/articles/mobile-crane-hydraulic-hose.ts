import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'mobile-crane-hydraulic-hose',
  title: 'Mobile crane hoses: the circuits where a failure is a lifting incident',
  excerpt:
    'On most machines a hose failure stops work. On a crane, some of them drop a load. Which circuit a hose belongs to decides whether it is a maintenance item or a safety-critical component.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Mobile crane hydraulic hose — safety-critical circuits and replacement',
  seoDescription:
    'Which mobile crane hydraulic circuits are safety-critical, why holding valves matter, what certification and traceability a lifting machine needs, and how to specify a replacement.',
  focusKeyword: 'mobile crane hydraulic hose',
  publishedAt: '2026-08-24T14:32:05.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Hoist, luffing, telescoping and outrigger circuits can all drop or destabilise a load. They are not ordinary hoses.',
        'Load-holding valves are what stop a burst hose becoming a dropped load. Their presence is the reason a failure is usually survivable.',
        'A lifting machine needs traceability: what was fitted, when, to what specification, with a test certificate.',
        'Never substitute a lower-rated grade on a crane circuit because it was what the van had.',
        'Outrigger hoses are exposed, forgotten, and structural to the machine’s stability.',
      ],
    },
    {
      type: 'lead',
      html: 'Most of this site treats a hose failure as downtime. On a crane it can be an incident with people underneath it, and the difference between those two outcomes is usually a valve rather than the hose. That does not make the hose less important — it makes the specification less negotiable.',
    },

    { type: 'section_head', number: '/01', title: 'The circuits, and what a failure does.', anchor: 'the-circuits' },
    {
      type: 'comparison_table',
      caption: 'Consequence by circuit',
      columns: ['Circuit', 'What a hose failure does', 'Class'],
      rows: [
        { cells: ['Main hoist', 'Load descent if holding is lost', 'Safety-critical'], highlight: true },
        { cells: ['Luffing / derricking', 'Boom angle change under load', 'Safety-critical'], highlight: true },
        { cells: ['Telescoping', 'Section movement, boom geometry change', 'Safety-critical'] },
        { cells: ['Outriggers', 'Loss of levelling or support — stability', 'Safety-critical'], highlight: true },
        { cells: ['Slew', 'Loss of controlled rotation', 'Serious'] },
        { cells: ['Steering, deck functions', 'Machine unusable, load unaffected', 'Operational'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Holding valves are the reason a burst hose is not automatically a dropped load.',
      body: 'Counterbalance and load-holding valves are fitted at the cylinder so that a failure downstream of them does not release the load. They are safety devices and they are not a reason to be relaxed about hose condition — they are the last line, and nobody should be relying on the last line.',
    },

    { type: 'section_head', number: '/02', title: 'Specification is not negotiable here.', anchor: 'specification' },
    {
      type: 'paragraph',
      html: 'The temptation on a crane down on a job is to fit whatever will connect and get the machine finished. <strong>On a lifting appliance that is the wrong trade.</strong> A grade rated below the circuit, a fitting that seals but is not the specified type, or an assembly with no test record all put an undocumented component into a machine whose whole basis of safe use is documentation.',
    },
    {
      type: 'comparison_table',
      caption: 'What a crane hose assembly should come with',
      columns: ['Item', 'Why'],
      rows: [
        { cells: ['Correct grade for the circuit pressure at that bore', 'Headline figures mislead — compare at the actual bore'] },
        { cells: ['Proof test record', 'Evidence the assembly was tested, not assumed'] },
        { cells: ['Traceability tag with build date', 'Age-based replacement is impossible without it'], highlight: true },
        { cells: ['Correct fitting types both ends', 'A fitting that seals is not necessarily the specified fitting'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Are mobile crane hydraulic hoses different from ordinary hoses?',
      answer:
        'The hose construction is often the same. What differs is the consequence of failure and therefore the discipline around it: hoist, luffing, telescoping and outrigger circuits can drop or destabilise a load, so those assemblies need the specified grade, a proof test record and a traceability tag rather than whatever connects.',
    },

    { type: 'section_head', number: '/03', title: 'Outriggers are the forgotten ones.', anchor: 'outriggers' },
    {
      type: 'paragraph',
      html: 'Outrigger hoses sit low on the machine, get splashed, scraped, driven over and parked in whatever the site surface is. They are also structural: the machine’s stability calculation assumes the outriggers are down, level and holding. <strong>They are among the most exposed hoses on the crane and among the least inspected.</strong>',
    },
    { type: 'product_embed', heading: 'Grades used on crane circuits', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SH', 'IH-HOSE-R13'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Built, proof tested and tagged.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can a crane be returned to service after a hose replacement without re-certification?', answer: 'That depends on your inspection regime and the competent person who signs it, not on us. What we can do is supply the assembly with a proof test record and a tag so the evidence exists when the question is asked.' },
        { question: 'How often should crane hoses be replaced?', answer: 'On a schedule set from age and duty rather than on failure, because failure on these circuits is the outcome the schedule exists to prevent. That requires tagged assemblies with known build dates.' },
        { question: 'Is a higher-rated hose always safer on a crane?', answer: 'Not automatically — an over-specified hose can be stiffer and route worse, which introduces a different failure mode. Specify to the circuit rather than upward for reassurance.' },
        { question: 'Do you supply assemblies with test certificates?', answer: 'Yes. Every assembly we build is proof tested and tagged, and the certificate states what was actually tested rather than a generic statement.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic and specification guidance from our own practice. Inspection and certification requirements for lifting appliances are set by your regime and your competent person, not by us.',
    },
    { type: 'cta_block', heading: 'Crane down on a job?', body: 'Tell us the circuit and send photographs of both ends. Assemblies come proof tested and tagged, and we come to site across the UAE.', quoteLabel: 'Get a crane hose made' },
  ],
}

export default ARTICLE
