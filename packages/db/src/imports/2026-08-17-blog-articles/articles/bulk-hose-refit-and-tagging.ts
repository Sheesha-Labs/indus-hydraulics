import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'bulk-hose-refit-and-tagging',
  title: 'Re-hosing a whole machine: bulk build, tagging and why it beats replacing as they fail',
  excerpt:
    'On a rebuild, recommissioning or cold-stack return, building every assembly at once produces a better machine and a better record than replacing hoses one failure at a time.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'Bulk hydraulic hose refit — re-hosing a machine or rig',
  seoDescription:
    'Re-hosing a machine or rig in one build: how assemblies are scheduled, tagged and recorded, and why it beats replacing hoses as they fail.',
  focusKeyword: 'bulk hydraulic hose assembly',
  publishedAt: '2026-08-18T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A machine coming back from cold stack or a rebuild has hoses of the same age and duty. They fail in a cluster, not one at a time.',
        'Building the set in one pass is cheaper per assembly and produces a record you can actually use afterwards.',
        'Tagging every assembly is what makes the next replacement a two-minute job instead of a two-hour one.',
        'The schedule is the deliverable, not just the hoses — bore, length, ends and position, captured once.',
        'Do it in the bay. Throughput, crimp range and documentation are all better where the equipment lives.',
      ],
    },
    {
      type: 'lead',
      html: 'Hoses on a machine that has been in service together are the same age, in the same conditions, with the same duty. When one goes, the rest are not far behind — which is why replacing them individually as they fail is the most expensive way to arrive at the same place.',
    },

    { type: 'section_head', number: '/01', title: 'When a bulk refit is the right call.', anchor: 'when' },
    {
      type: 'decision_tree',
      heading: 'Refit or replace as they fail',
      branches: [
        { condition: 'Machine returning from cold stack or long storage', outcome: 'Refit the set.', detail: 'Age and storage conditions apply to every assembly equally, and shelf ageing does not care that a hose was never used.' },
        { condition: 'Major rebuild or recommissioning', outcome: 'Refit the set.', detail: 'The machine is already down and accessible. The marginal cost of the remaining hoses is small against a second stoppage later.' },
        { condition: 'Third or fourth failure on the same machine in a season', outcome: 'Refit the set.', detail: 'The cluster has started. Individual replacement from here is just paying the mobilisation repeatedly.' },
        { condition: 'One failure on an otherwise healthy machine', outcome: 'Replace the one, inspect the rest.', detail: 'A single early failure is usually installation, not age. Fix the cause and check the neighbours.' },
        { condition: 'Fleet standardisation exercise', outcome: 'Refit machine by machine.', detail: 'This is where consolidating grades and ends across a fleet actually happens.' },
      ],
    },

    { type: 'section_head', number: '/02', title: 'What a bulk build actually produces.', anchor: 'what-it-produces' },
    {
      type: 'paragraph',
      html: 'Two things: the assemblies, and the schedule. The second is the one customers underestimate. A refit captures bore, construction, length, both fitting types and the position on the machine for every hose — once, at the point where somebody is holding each one. That schedule is the difference between a future replacement taking two minutes and taking two hours with a torch and a tape measure.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/services/sour-service-hose-assembly-build-100-line-rig-refit">112-assembly build for a cold-stacked rig</a> is the shape of this: 14 days in the Jebel Ali hose bay, every assembly tagged and recorded. The tagging was not administrative overhead — it is what makes the next failure on that rig a phone call with an ID rather than an identification exercise.',
    },
    {
      type: 'comparison_table',
      caption: 'Bulk refit against replace-as-they-fail',
      columns: ['Compared on', 'Bulk refit', 'One at a time'],
      rows: [
        { cells: ['Cost per assembly', 'Lower — one setup, one batch', 'Higher — mobilisation each time'], highlight: true },
        { cells: ['Machine downtime', 'One planned stoppage', 'Repeated unplanned stoppages'] },
        { cells: ['Record produced', 'Full schedule, tagged', 'Whatever anyone wrote down'] },
        { cells: ['Consistency', 'One grade decision applied throughout', 'Whatever was available that day'] },
        { cells: ['Best for', 'Rebuilds, recommissioning, clustered failures', 'Isolated early failure' ] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Why the bay, not the site.', anchor: 'why-the-bay' },
    {
      type: 'direct_answer',
      question: 'Should a bulk hose refit be done on site or in a workshop?',
      answer:
        'In the workshop, in almost every case. Throughput, the full crimp range including large-bore and spiral constructions, proof testing and the documentation all live there. On-site service exists to remove transport from an urgent single failure — a planned refit has no urgency to trade against, so the advantages run the other way.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Send the machine, or send the hoses.',
      body: 'Where a machine cannot travel, the workable version is removing the assemblies, building the set in the bay against them, and refitting in one visit. It is still one planned stoppage rather than several unplanned ones.',
    },
    { type: 'product_embed', heading: 'Grades a typical refit draws on', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can you build from the old assemblies?', answer: 'Yes — that is the normal way a refit runs. Each failed or removed assembly is the specification for its replacement, which is why removing them in a controlled way and labelling positions matters.' },
        { question: 'What do we get at the end besides hoses?', answer: 'The schedule: every assembly with its bore, construction, length, ends and position, tagged so the record links to the physical hose. That is the asset that keeps paying.' },
        { question: 'Is it worth re-hosing a machine we plan to sell?', answer: 'Often, yes — a machine with a documented full re-hose and a schedule is a materially easier sale than one with unknown hose age, particularly for export.' },
        { question: 'Can you standardise ends across the machine while you are at it?', answer: 'Where the ports allow. A refit is the natural moment to consolidate onto fewer fitting families, because everything is off the machine and in one place.' },
      ],
    },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Hose, fittings and ferrules', blurb: 'Everything a bulk refit is built from, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Method and scope. Turnaround depends on the number of assemblies, grades and availability.' },
    { type: 'cta_block', heading: 'Recommissioning a machine or a rig?', body: 'Send the machine list or the removed assemblies. We will schedule the build, tag every assembly and hand back the record with them.', quoteLabel: 'Quote a refit' },
  ],
}

export default ARTICLE
