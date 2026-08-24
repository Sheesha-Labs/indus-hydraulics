import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'contamination-during-a-hose-change',
  title: 'Contamination during a field hose change: what gets in while the line is open',
  excerpt:
    'The pump that fails three weeks after a hose change did not fail by coincidence. Everything that ruins it entered during the twenty minutes the port was open.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic contamination during a hose change — prevention',
  seoDescription:
    'What contaminates a hydraulic system during a field hose replacement: airborne dust, debris from the failed assembly, and the new hose itself. A practical field procedure.',
  focusKeyword: 'hydraulic contamination hose change',
  publishedAt: '2026-08-24T19:07:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three sources: the environment around the open port, debris from the failed assembly, and the inside of the new hose.',
        'A burst hose sends its own wire and cover fragments downstream before anyone touches it.',
        'New hose is not clean hose. It carries cutting debris and manufacturing residue unless it is cleaned after cutting.',
        'The failure is delayed. Damage shows up weeks later as a valve fault or pump wear, which is why it is so rarely attributed to the hose change.',
        'Caps, cleanliness and a filter change afterwards cost minutes. A pump does not.',
      ],
    },
    {
      type: 'lead',
      html: 'Hose changes happen where the machine stopped: a yard, a quarry face, a site road in a crosswind. It is the single dirtiest moment in a hydraulic system’s life and the one nobody counts, because nothing goes wrong for a month. This is the largest cluster of unanswered questions we found in the field and it deserves a procedure rather than good intentions.',
    },

    { type: 'section_head', number: '/01', title: 'Where it comes from.', anchor: 'sources' },
    {
      type: 'comparison_table',
      caption: 'Three sources, in order of how much they matter',
      columns: ['Source', 'What enters', 'How to stop it'],
      rows: [
        {
          cells: [
            'The open port and open hose ends',
            'Airborne dust, sand, grit off the machine',
            'Clean around the joint first, cap immediately',
          ],
          highlight: true,
        },
        {
          cells: [
            'The failed assembly',
            'Reinforcement wire, cover and tube fragments',
            'Assume it happened; change filters after',
          ],
          highlight: true,
        },
        {
          cells: [
            'The new assembly',
            'Cutting debris, manufacturing residue, packaging dust',
            'Buy assemblies capped; do not uncap until fitting',
          ],
        },
        {
          cells: [
            'Top-up fluid',
            'Whatever was in the drum and the funnel',
            'Filtered transfer, clean containers',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Sand is the local variable.',
      body: 'Gulf site dust is fine, abrasive and constantly airborne. A port left open and pointing upwind for a few minutes on a yard here collects more than the same port would in a temperate workshop in an hour. Orientation and timing genuinely matter — cap it even if you are coming straight back.',
    },

    { type: 'section_head', number: '/02', title: 'The field procedure.', anchor: 'procedure' },
    {
      type: 'decision_tree',
      heading: 'A hose change that does not cost you a pump',
      intro: 'None of this adds much time. Most of it is order of operations.',
      branches: [
        {
          condition: 'Before opening anything',
          outcome: 'Clean the whole area around both connections.',
          detail:
            'Degreaser and a rag, then dry. Whatever is on the outside of the joint goes inside the moment the joint is broken.',
        },
        {
          condition: 'Position the machine if you can',
          outcome: 'Ports downwind and, where possible, pointing down.',
          detail: 'Free, and it removes most airborne ingress.',
        },
        {
          condition: 'The moment a port is open',
          outcome: 'Cap it. Every port, every time, even for two minutes.',
          detail:
            'Caps and plugs in the common sizes belong on the van. A rag stuffed in a port is worse than nothing — it sheds fibres.',
        },
        {
          condition: 'Before fitting the new assembly',
          outcome: 'Check it is capped, and keep the caps on until the moment of connection.',
          detail:
            'If it arrived uncapped, treat it as dirty and have it flushed rather than fitting it.',
        },
        {
          condition: 'After the change',
          outcome: 'Run the circuit, then change the return filter.',
          detail:
            'This is the step that gets skipped. Whatever entered is now circulating, and the filter is the only thing that will remove it.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Why the bill arrives late.',
      anchor: 'delayed-failure',
    },
    {
      type: 'paragraph',
      html: 'Contamination damage is cumulative and silent. Fine particles pass through clearances in pumps and valves, abrading them slightly on every pass. <strong>By the time a symptom appears — a slow circuit, a valve that sticks, a pump that whines — the hose change is a month back in the record and nobody connects the two.</strong> That is precisely why the discipline is hard to sustain: the feedback loop is too long to teach anyone anything.',
    },
    {
      type: 'comparison_table',
      caption: 'What turns up later, and what it usually was',
      columns: ['Symptom weeks later', 'Common contamination cause'],
      rows: [
        {
          cells: [
            'Proportional or servo valve sticking',
            'Fine particulate, often including PTFE tape debris',
          ],
          highlight: true,
        },
        { cells: ['Pump wear, falling output', 'Abrasive dust ingested at a hose change'] },
        {
          cells: ['Repeated filter blockage', 'Debris from the original burst still circulating'],
          highlight: true,
        },
        { cells: ['Cylinder seal failure', 'Particles scoring the rod or bore'] },
        {
          cells: ['New hose fails early at the fitting', 'Debris trapped at the seat on assembly'],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How do I stop contamination getting in during a hydraulic hose change?',
      answer:
        'Clean around both connections before breaking them, position the ports downwind and downward if you can, and cap every port and hose end immediately — including for short interruptions. Keep the new assembly capped until the moment it is connected, and never plug a port with a rag. After the change, run the circuit and change the return filter, because anything that did get in is now circulating.',
    },

    { type: 'section_head', number: '/04', title: 'What to carry.', anchor: 'what-to-carry' },
    {
      type: 'comparison_table',
      caption: 'The contamination kit for a service van',
      columns: ['Item', 'Why'],
      rows: [
        {
          cells: [
            'Plastic caps and plugs, all common sizes',
            'The single highest-value item on this list',
          ],
          highlight: true,
        },
        { cells: ['Degreaser and lint-free cloth', 'Rags shed fibres; lint-free does not'] },
        {
          cells: [
            'Spare return filter for the common machines',
            'Removes the excuse for skipping the filter change',
          ],
          highlight: true,
        },
        {
          cells: [
            'Clean drain tray and a sealed waste container',
            'So the oil you catch does not become the oil you spill',
          ],
        },
        {
          cells: [
            'Sealed top-up oil with a clean transfer pump',
            'Drum-and-funnel top-ups undo everything else',
          ],
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Assemblies supplied capped, so they arrive clean.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Caps, plugs and the small parts that keep dirt out.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is it really worth capping a port for five minutes?',
          answer:
            'On a dusty site, yes. Ingress is a function of exposure and airborne concentration, and both are high here. The cap costs nothing and takes two seconds.',
        },
        {
          question: 'Should I flush the system after a burst hose?',
          answer:
            'Consider it whenever the failure was violent, when reinforcement wire was released, or where the machine has sensitive valving. At minimum, change the return filter and check it again shortly afterwards.',
        },
        {
          question: 'Are new hose assemblies clean inside?',
          answer:
            'Only if they were cleaned after cutting and capped afterwards. Ask how your supplier handles it — it is a reasonable question and the answer tells you a lot.',
        },
        {
          question: 'Can I use a rag to plug a port?',
          answer:
            'No. Rags shed fibres directly into the port, and fibres are difficult to filter out. Use a proper cap or plug.',
        },
        {
          question: 'How soon should the filter be changed after a hose failure?',
          answer:
            'Run the machine briefly to circulate, then change it. Check the replacement again after a short period — a second early blockage means debris is still coming through and the system needs more attention.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Field procedure as used by our own mobile teams.',
    },
    {
      type: 'cta_block',
      heading: 'Ask for assemblies capped, because they should be.',
      body: 'Every assembly we build is cleaned after cutting and capped both ends. If you want a written cleanliness statement with a batch, tell us at the point of order.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
