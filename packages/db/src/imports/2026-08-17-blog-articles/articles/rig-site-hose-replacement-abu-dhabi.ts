import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'rig-site-hose-replacement-abu-dhabi',
  title: 'Rig-site hose replacement in Abu Dhabi and Al Dhafra: planning around the permit',
  excerpt:
    'On a drilling rig the hose work is the easy part. Access, permits and certification are what set the clock — and all three can be shortened before anything fails.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Rig-site hydraulic hose replacement — Abu Dhabi, Habshan, Al Dhafra',
  seoDescription:
    'Hose replacement on drilling rigs and gas plant in Abu Dhabi, Habshan and Al Dhafra. Why permits set the timeline, what to pre-stage, and how certification is handled.',
  focusKeyword: 'rig hose replacement abu dhabi',
  publishedAt: '2026-08-18T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'On a rig or a gas plant the hose is rarely the constraint. Permit to work, escorted access and certification are.',
        'Anything on a pressure-control circuit is a certified assembly and is not built at the wellsite — it is supplied qualified and fitted.',
        'General rig hydraulics — power tongs, HPUs, catwalks, auxiliaries — usually can be built on site once access is granted.',
        'The single biggest lever on downtime is pre-staging: the assemblies you already hold are the ones that do not need a permit written for them.',
        'H₂S awareness and valid safety training are entry conditions, not paperwork to sort out at the gate.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask what delayed a rig hose replacement and the answer is almost never the hose. It is that the visit needed a permit, the permit needed a scope, the scope needed the assembly specified, and the assembly needed identifying — a sequence that runs for hours while the rig stands.',
    },

    { type: 'section_head', number: '/01', title: 'Two categories, two routes.', anchor: 'two-categories' },
    {
      type: 'comparison_table',
      caption: 'What can be built on site and what cannot',
      columns: ['Circuit', 'Route', 'Why'],
      rows: [
        { cells: ['Choke and kill, well control', 'Supplied as a certified assembly', 'API 16C qualification belongs to the assembly, ends included'], highlight: true },
        { cells: ['BOP control hose', 'Supplied as a certified assembly', 'Fire rating is qualified by test — it cannot be field-built'] },
        { cells: ['Rotary and vibrator', 'Supplied as a certified assembly', 'API 7K coupling method is applied at manufacture'] },
        { cells: ['HPU and auxiliary hydraulics', 'On site', 'Standard hydraulic assemblies to EN or SAE'] },
        { cells: ['Power tongs, catwalk, ancillary', 'On site', 'Same — measure, crimp, fit'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'That split is not a commercial preference, it is what the specifications require. A choke and kill line is qualified as a complete assembly with its flanged ends; a rotary hose carries a coupling method applied under controlled conditions at manufacture. Neither is something a mobile unit can legitimately produce at a wellsite, and anyone offering to is offering an unqualified assembly.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A field-terminated pressure-control hose is an unqualified assembly.',
      body: 'However well it is made. The qualification covers the hose, the ends and the process together, which is why these arrive built and certified rather than being assembled where they are fitted.',
    },

    { type: 'section_head', number: '/02', title: 'The permit is the timeline.', anchor: 'the-permit' },
    {
      type: 'direct_answer',
      question: 'What actually delays a rig-site hose replacement?',
      answer:
        'Access. The physical work of measuring, building and fitting a general hydraulic assembly is short. Writing the permit, arranging escorted access, confirming safety training and getting the crew to the location is what consumes the day — which is why the assemblies you already hold on site are worth far more than their cost.',
    },
    {
      type: 'sop_block',
      header: 'RIG-SITE VISIT · WHAT SHORTENS IT',
      completion: '5 items',
      phases: [
        {
          name: 'Before the failure',
          rows: [
            { task: 'Register the critical assemblies', detail: 'The circuits that stop the rig. Specification recorded, so a replacement can be built without a site visit to measure it.', who: 'Maintenance', tool: 'Hose register' },
            { task: 'Hold the short list', detail: 'The assemblies whose failure stops work. Pre-staged, they need no permit written to identify them.', who: 'Stores', tool: 'Spares' },
          ],
        },
        {
          name: 'At the call',
          rows: [
            { task: 'State the circuit and the access regime', detail: 'Pressure control or general hydraulics, and what the permit requires. This decides whether we mobilise a van or supply an assembly.', who: 'Rig', tool: '—' },
            { task: 'Confirm training requirements', detail: 'H₂S awareness and any site-specific induction. These are entry conditions and cannot be resolved at the gate.', who: 'Rig / HSE', tool: '—' },
            { task: 'Say what documentation is needed', detail: 'Test certificates and traceability are far easier specified at order than requested afterwards.', who: 'Rig', tool: '—' },
          ],
        },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Habshan, Al Dhafra and the coast.', anchor: 'locations' },
    {
      type: 'paragraph',
      html: 'The Al Dhafra region and Habshan are gas and processing country, and the access regime reflects it — permit to work, escorted movement, and safety training verified before arrival rather than on the day. Mussafah and ICAD, by contrast, are workshop and fabrication environments where a mobile unit can generally be dispatched and inducted the same day. The hose work is often identical; the planning is not.',
    },
    {
      type: 'paragraph',
      html: 'Where a rig or unit is being recommissioned rather than repaired, bulk build in the bay wins outright. Our <a href="/services/sour-service-hose-assembly-build-100-line-rig-refit">112-assembly refit for a cold-stacked rig</a> was built and tagged over 14 days at the Jebel Ali hose bay — that is a throughput and traceability job, and doing it a hose at a time at the wellsite would have taken far longer and produced a worse record.',
    },
    { type: 'product_embed', heading: 'Certified oilfield constructions', skus: ['IH-OG-DRL-001', 'IH-OG-WCT-006', 'IH-OG-WCT-001'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can you attend a wellsite at short notice?', answer: 'Subject to the site’s own access and permit regime, which is usually the binding constraint rather than our availability. Tell us the location and the permit requirement when you call and we will be straight about what is achievable.' },
        { question: 'Do your crews hold H₂S and well-control certification?', answer: 'Our field service crews are H₂S trained and IWCF carded — that is the basis on which the BOP field-service day-rate crew operates. Confirm the specific certification your site requires and we will confirm what we hold.' },
        { question: 'Can you supply a certified choke and kill line at short notice?', answer: 'It depends on the class, size and liner. These are built and certified assemblies rather than stock items in every configuration, so lead time is a real constraint — which is the argument for holding the critical ones.' },
        { question: 'What is worth pre-staging?', answer: 'The assemblies whose failure stops the rig, identified from the register rather than from memory. It is usually a much shorter list than people expect, and it is the highest-return spares decision available.' },
      ],
    },
    { type: 'category_link', slug: 'oil-gas-hoses', label: 'Oil & gas hose', blurb: 'Drilling, well control and low-pressure oilfield constructions, supplied certified.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Service scope only. No response-time commitments — rig-site attendance depends on the operator’s access and permit regime.' },
    { type: 'cta_block', heading: 'Planning a rig hose scope?', body: 'Send the circuit list and the access regime. We will separate what must be supplied certified from what can be built on site, and tell you what is worth holding.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
