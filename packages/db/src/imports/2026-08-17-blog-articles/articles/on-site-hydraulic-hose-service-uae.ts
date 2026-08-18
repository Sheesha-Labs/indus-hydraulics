import type { BlogArticleSeed } from '../shared'

/**
 * Localised service content. Two deliberate omissions:
 *
 *  - No named operator. Naming a client publicly usually needs written
 *    consent, and a page that reads as implying approved-vendor status is a
 *    fast route off the vendor lists it is meant to win.
 *  - No response-time SLA. Zone arrival times are operational commitments;
 *    publishing one the operation cannot meet is worse than publishing none.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'on-site-hydraulic-hose-service-uae',
  title: 'On-site hydraulic hose service across the UAE: what it actually involves',
  excerpt:
    'Bringing the hose bay to the machine instead of the machine to the bay. What on-site assembly can and cannot do, and how it differs across the seven areas we cover.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'On-site hydraulic hose service UAE — Dubai, Abu Dhabi, Sharjah',
  seoDescription:
    'On-site hydraulic hose assembly and replacement across Dubai, Abu Dhabi, Habshan, Sharjah, Ajman, Ras Al Khaimah and Fujairah. What on-site service covers and when the bay is better.',
  focusKeyword: 'on site hydraulic hose service uae',
  publishedAt: '2026-08-18T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'On-site service exists to remove transport from the critical path. The hose was never the slow part — moving the machine or the fitter was.',
        'Most failed assemblies can be measured, built and fitted at the machine. A few genuinely cannot, and knowing which is the useful part.',
        'Certification and traceability do not stop at the yard gate. An assembly built on site should carry the same test record as one built in the bay.',
        'What "on site" means differs by area — a quarry in Ras Al Khaimah, a workshop in Sharjah and a gas plant in Al Dhafra impose completely different access and permit conditions.',
        'Bring the failed assembly if the machine can wait; call us out if it cannot. That is the whole decision.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic hose is rarely the expensive part of a breakdown. The expensive part is the hours between the failure and the machine working again — and most of those hours are transport, not manufacture. On-site service is simply the decision to move the smaller object.',
    },

    { type: 'section_head', number: '/01', title: 'What can be done at the machine.', anchor: 'at-the-machine' },
    {
      type: 'paragraph',
      html: 'A mobile hose service carries bulk hose, fittings, ferrules and a crimper. That covers the large majority of failures: measure the failed assembly or the run it came from, cut, crimp, proof the joint and fit. The work is identical to bay work — the same crimp specification for the same hose-and-fitting combination, because the specification belongs to the parts, not to the building they are assembled in.',
    },
    {
      type: 'comparison_table',
      caption: 'On site or in the bay',
      columns: ['Situation', 'Best handled', 'Why'],
      rows: [
        { cells: ['Single failed assembly, machine down', 'On site', 'Transport is the whole delay'], highlight: true },
        { cells: ['Several hoses on one machine, same visit', 'On site', 'One mobilisation covers the lot'] },
        { cells: ['Large-bore or spiral hose beyond mobile crimper capacity', 'In the bay', 'Crimp force and die range are physical limits'] },
        { cells: ['Assemblies needing documented proof test to a customer spec', 'In the bay', 'Test equipment and records live there'] },
        { cells: ['Bulk build — a refit, a rebuild, a new unit', 'In the bay', 'Throughput and tagging are better done in one place'] },
        { cells: ['Anything requiring a permit and a toolbox talk', 'Either, with lead time', 'The permit is the constraint, not the hose'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The honest limit is crimp capacity, not willingness.',
      body: 'A mobile unit carries a crimper with a finite force and a finite set of dies. Above a certain bore and construction, the assembly has to be built where the larger machine is. Anyone who tells you every hose can be made at the roadside is describing a smaller range than they think.',
    },

    { type: 'section_head', number: '/02', title: 'The seven areas are not the same job.', anchor: 'seven-areas' },
    {
      type: 'paragraph',
      html: 'We service on site across <strong>Dubai, Abu Dhabi, Habshan, Sharjah, Ajman, Ras Al Khaimah and Fujairah</strong>, and the practical differences between them are not distance. They are access, permitting and what the machine is doing.',
    },
    {
      type: 'comparison_table',
      caption: 'What changes by area',
      columns: ['Area', 'Typical work', 'What governs the visit'],
      rows: [
        { cells: ['Dubai — Al Quoz, Ras Al Khor, Jebel Ali, DIP', 'Workshops, plant, port equipment, construction', 'Traffic windows and site induction'] },
        { cells: ['Abu Dhabi — Mussafah, ICAD', 'Heavy fleet workshops, fabrication, marine', 'Site access and gate passes'] },
        { cells: ['Habshan and Al Dhafra', 'Rig and plant hydraulics, drilling support', 'Permit to work, H₂S awareness, escorted access'], highlight: true },
        { cells: ['Sharjah — Sajja and the industrial areas', 'Manufacturing, assembly workshops, transport fleets', 'Density — often several jobs in one trip'] },
        { cells: ['Ajman', 'Industrial units, transport, small plant', 'Usually straightforward access'] },
        { cells: ['Ras Al Khaimah — Khor Khwair', 'Quarrying, crushing and screening, cement', 'Dust, abrasion, and plant that cannot stop mid-shift'] },
        { cells: ['Fujairah', 'Port and bunkering equipment, quarry belt, shipping', 'Port access control and marine scheduling'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The two ends of that table are worth drawing out. A quarry at Khor Khwair is an abrasion problem — hoses fail from dust and impact, and the same run fails repeatedly until the routing changes. A gas plant in Al Dhafra is a <em>permit</em> problem — the hose work is straightforward and the access is not, so the visit has to be planned rather than dispatched.',
    },

    { type: 'section_head', number: '/03', title: 'Certification does not stop at the gate.', anchor: 'certification' },
    {
      type: 'direct_answer',
      question: 'Can an assembly built on site be certified?',
      answer:
        'Yes, and it should be. The crimp specification, the traceability of the hose and fittings, and the proof test record are the same requirements wherever the assembly is built. Where a customer specification demands a documented proof test on dedicated equipment, that assembly is built in the bay — but that is a small subset, not the norm.',
    },
    {
      type: 'paragraph',
      html: 'This matters more in some of these areas than others. On plant and rig work, an undocumented assembly is a finding at the next audit even if it never leaks. If your site requires certificates, say so when you call — retro-fitting a record to an assembly already in service is the hard version of an easy job. Our bay work carries this by default; the 112-assembly rig refit we ran out of the Jebel Ali hose bay was tagged and recorded assembly by assembly for exactly this reason.',
    },
    { type: 'product_embed', heading: 'What the van carries', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-CF-NS-R2T2SN', 'IH-JIC-FEM-37-45'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do you cover all seven emirates?', answer: 'We service on site across Dubai, Abu Dhabi, Habshan, Sharjah, Ajman, Ras Al Khaimah and Fujairah. Tell us where the machine is and what it is, and we will tell you plainly whether it is an on-site job or a bay job.' },
        { question: 'Can you work inside a restricted site?', answer: 'Where the site permits it and the paperwork is in place. Plant and rig access typically needs a permit to work, valid safety training and often an escort — none of which can be arranged at the gate, so give us the requirement when you call rather than when we arrive.' },
        { question: 'Is on-site more expensive than bringing it in?', answer: 'The assembly costs the same. The mobilisation does not. Where a machine is stopped, the mobilisation is almost always cheaper than the downtime; where it is not stopped, bringing the hose in is the better answer.' },
        { question: 'What if the hose is too big to crimp on site?', answer: 'We build it in the bay and fit it. That is a two-visit job, so we would rather identify it on the phone than discover it at the machine — which is why the first questions are always bore, construction and fitting type.' },
      ],
    },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Hose, fittings and ferrules', blurb: 'The range the mobile units and the hose bay both build from.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Service scope and coverage areas. No response-time commitments are published here — arrival depends on location, access and permitting.' },
    { type: 'cta_block', heading: 'Machine down, or planning a shutdown?', body: 'Tell us where the machine is, what failed and whether the site needs a permit. We will tell you whether it is an on-site job or a bay job before anyone travels.', quoteLabel: 'Request on-site service' },
  ],
}

export default ARTICLE
