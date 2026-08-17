import type { BlogArticleSeed } from '../shared'

/**
 * Method, not a compatibility table. Publishing "material X is fine with
 * chemical Y" from memory is exactly the claim that gets someone hurt —
 * compatibility depends on concentration, temperature and dwell, and the
 * authoritative source is the liner manufacturer's own chart.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chemical-transfer-hose-selection',
  title: 'Chemical transfer hose: how to read a compatibility chart properly',
  excerpt:
    'The liner decides everything. How compatibility charts work, why concentration and temperature change the answer, and what else has to be right before the hose is safe to use.',
  categorySlug: 'industrial-hose',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Chemical transfer hose selection — reading a compatibility chart',
  seoDescription:
    'Selecting chemical transfer hose: liner materials, how compatibility ratings work, why concentration and temperature matter, and the role of continuity and couplings.',
  focusKeyword: 'chemical transfer hose selection',
  publishedAt: '2026-08-17T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The liner is the only part of the hose that meets the product. Everything about chemical suitability is a property of that material.',
        'Compatibility is not yes or no. Ratings assume a concentration, a temperature and a contact time, and change when any of those change.',
        'A hose that is compatible can still be the wrong choice if the couplings, gaskets or O-rings are not.',
        'On flammable transfer, electrical continuity through the whole assembly is a safety requirement and is verified periodically, not once.',
        'Composite hose earns its place here partly because it tends to weep before it fails outright.',
      ],
    },
    {
      type: 'lead',
      html: 'Chemical hose selection goes wrong in a predictable way: someone checks the hose against the chemical, finds a green tick, and fits it with whatever couplings were on the shelf. The hose is then the only compatible part of the assembly.',
    },

    { type: 'section_head', number: '/01', title: 'Compatibility is conditional.', anchor: 'conditional' },
    {
      type: 'paragraph',
      html: 'A compatibility chart is a statement about a material, a chemical, a concentration and a temperature — usually ambient, often at a stated concentration, and generally assuming intermittent rather than continuous contact. Change any of those and the rating can change with it. A liner rated for a dilute solution at 20 °C is not thereby rated for a concentrated one at 60 °C.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'This article does not contain a compatibility table.',
      body: 'Deliberately. Publishing "this liner is fine with that chemical" from memory is precisely the claim that gets someone hurt. Use the liner manufacturer’s own chart, at your concentration and temperature, and treat anything marginal as unsuitable.',
    },
    {
      type: 'direct_answer',
      question: 'What does a "conditional" or "limited" compatibility rating mean?',
      answer:
        'That the material will be attacked at a rate which may be acceptable for short contact but not for continuous service — and that the margin narrows as concentration or temperature rises. For transfer duty where the hose is drained between uses it may be workable; for a line that stays full it usually is not.',
    },

    { type: 'section_head', number: '/02', title: 'The whole assembly, not the hose.', anchor: 'whole-assembly' },
    {
      type: 'sop_block',
      header: 'CHEMICAL HOSE ASSEMBLY · SPECIFICATION CHECKS',
      completion: '6 checks',
      phases: [
        {
          name: 'Before ordering',
          rows: [
            { task: 'Liner against the medium', detail: 'At your concentration and temperature, from the manufacturer chart. Not the hose "type" — the liner material.', who: 'Engineer', tool: 'Compatibility chart' },
            { task: 'Couplings and gaskets', detail: 'Wetted metal and every seal must be compatible too. This is the step that is most often skipped.', who: 'Engineer', tool: 'Chart' },
            { task: 'Temperature, both sides', detail: 'Medium temperature and Gulf ambient. A hose in direct sun runs well above shade temperature.', who: 'Engineer', tool: 'Process data' },
            { task: 'Suction or delivery', detail: 'If it has to lift, it needs suction reinforcement. A delivery hose collapses under vacuum.', who: 'Engineer', tool: '—' },
            { task: 'Electrical continuity', detail: 'Required wherever the medium or atmosphere is flammable. Must be continuous through the couplings, not just the hose.', who: 'Engineer', tool: 'Continuity tester' },
            { task: 'Documentation', detail: 'Test certificate and traceability, specified at order rather than requested afterwards.', who: 'Procurement', tool: '—' },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'The coupling point deserves emphasis because it is the common failure. A compatible hose fitted with an incompatible gasket fails at the gasket, and because the hose was the thing that got checked, the investigation tends to start in the wrong place.',
    },

    { type: 'section_head', number: '/03', title: 'Why composite is standard on transfer.', anchor: 'composite' },
    {
      type: 'paragraph',
      html: 'Composite hose is built from multiple unbonded film and fabric layers held between wire helices, and the films can be selected for the duty. Two consequences matter operationally: it is <strong>lighter</strong> for a given bore, which is significant on hoses handled by people rather than cranes, and it tends to <strong>weep before it fails outright</strong> rather than letting go suddenly. On flammable or aggressive transfer, a hose that warns you is worth a great deal.',
    },
    {
      type: 'paragraph',
      html: 'The trade-off is handling. Composite is less tolerant of being crushed, dragged over a quay edge or driven over than a rubber hose of the same bore, so it rewards proper handling and storage in a way rubber will forgive.',
    },
    { type: 'product_embed', heading: 'Composite and chemical service', skus: ['IH-IH-A906PG', 'IH-IH-A901GG', 'IH-IH-A125'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How long does a chemical hose last?', answer: 'There is no interval that survives contact with a real duty. Service life depends on the medium, the concentration, the temperature, how often it is drained and how it is handled between uses. Manage it by inspection and test rather than by a number.' },
        { question: 'Can I use the same hose for two different chemicals?', answer: 'Only if the liner is compatible with both and there is no cross-contamination risk. Dedicating hoses per product and marking them is normal practice for good reasons.' },
        { question: 'Does electrical continuity need testing after installation?', answer: 'It is verified periodically through the life of the assembly, not just at build. Continuity can be lost at a coupling without anything visible changing.' },
        { question: 'What about food-grade and potable duty?', answer: 'Different question again — that is a compliance and traceability requirement as much as a material one. The certificate matters as much as the hose.' },
      ],
    },
    { type: 'category_link', slug: 'composite-hoses', label: 'Composite hose', blurb: 'Chemical and oil transfer constructions, with couplings specified to match.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Method only. No compatibility table is published here — use the liner manufacturer chart at your concentration and temperature.' },
    { type: 'cta_block', heading: 'Send us the medium and the conditions.', body: 'Chemical, concentration, temperature, pressure and whether it lifts. We will specify the hose, the couplings and the gaskets as one assembly.', quoteLabel: 'Specify an assembly' },
  ],
}

export default ARTICLE
