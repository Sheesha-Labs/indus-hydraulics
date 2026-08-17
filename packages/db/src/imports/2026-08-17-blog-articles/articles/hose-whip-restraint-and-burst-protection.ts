import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hose-whip-restraint-and-burst-protection',
  title: 'Whip restraints and burst protection: what actually stops a failed hose hurting someone',
  excerpt:
    'A hose that lets go at a coupling becomes a moving object. Restraints, sleeves and guards each solve a different failure — and using the wrong one is the same as using none.',
  categorySlug: 'safety',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hose whip restraints and burst protection sleeves',
  seoDescription:
    'Whip checks, burst sleeves and guards: which failure each addresses, why compressed air whips harder than hydraulics, and where each belongs on a machine.',
  focusKeyword: 'hose whip check restraint',
  publishedAt: '2026-08-17T15:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Restraints, sleeves and guards address three different failures. Fitting one does not cover you for the others.',
        'A whip restraint stops a hose that has separated at a coupling from moving. It does nothing about a hose that splits along its length.',
        'Compressed air and gas whip far harder than hydraulic oil, because the stored energy in a compressible medium is enormously greater.',
        'A burst sleeve is about containing a jet and protecting people nearby — not about keeping the hose working.',
        'None of it substitutes for routing and inspection. Protection is what you fit after the hose is installed correctly, not instead.',
      ],
    },
    {
      type: 'lead',
      html: 'Protection gets specified in a hurry after an incident, and usually as a single product for every problem. The three common devices are not alternatives to each other — they address separation, rupture and abrasion, and each is close to useless against the other two.',
    },

    { type: 'section_head', number: '/01', title: 'Three failures, three devices.', anchor: 'three-devices' },
    {
      type: 'comparison_table',
      caption: 'Which device for which failure',
      columns: ['Device', 'Failure it addresses', 'What it does not do'],
      rows: [
        { cells: ['Whip restraint / safety cable', 'Separation at a coupling', 'Nothing for a split along the hose length'], highlight: true },
        { cells: ['Burst sleeve', 'Rupture — contains and redirects the jet', 'Does not keep the hose in service or stop separation'] },
        { cells: ['Spiral guard / sleeve', 'Abrasion, before it becomes a failure', 'No protection once the hose has actually failed'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The most common specification error is fitting spiral guard and considering the run protected. Guard is a <em>preventive</em> measure — it stops the rub that would eventually breach the cover. It contributes nothing at the moment of failure, and it can conceal the damage it was fitted to prevent, so a guarded run needs inspecting underneath the guard rather than through it.',
    },

    { type: 'section_head', number: '/02', title: 'Why air is worse than oil.', anchor: 'air-vs-oil' },
    {
      type: 'direct_answer',
      question: 'Why does a compressed air hose whip more violently than a hydraulic one?',
      answer:
        'Because gas is compressible and stores energy; hydraulic oil is very nearly not. When an air line separates, the compressed volume expands and drives the hose end for as long as it takes to empty. A hydraulic line at higher pressure releases far less stored energy — its danger is injection and fluid jet, not whip.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Restrain compressed air couplings, always.',
      body: 'This is the case where a low-pressure system is the more violent one. Any air coupling that could separate — particularly quick-release types on a construction site — should carry a restraint across the joint as standard practice, not as a response to an incident.',
    },

    { type: 'section_head', number: '/03', title: 'Where to fit what.', anchor: 'where-to-fit' },
    {
      type: 'decision_tree',
      heading: 'Choosing the protection',
      branches: [
        { condition: 'Coupling that could separate, especially on air or gas', outcome: 'Whip restraint across the joint.', detail: 'Sized so it arrests movement, and fitted to both sides of the coupling rather than to the hose alone.' },
        { condition: 'Hose runs near an operator position or walkway', outcome: 'Burst sleeve over the run.', detail: 'The purpose is to contain and redirect a jet away from people. It does not preserve the assembly.' },
        { condition: 'Hose touches structure or another hose', outcome: 'Spiral guard or sleeve at the contact point — and fix the routing.', detail: 'Guard buys time against abrasion; it does not remove the cause. Inspect underneath it.' },
        { condition: 'Hose is in a hot area', outcome: 'Fire sleeve, and move the run if you can.', detail: 'Shielding a hose from radiant heat is worth more than uprating it.' },
        { condition: 'Hose has already failed once in the same place', outcome: 'Change the installation, not the protection.', detail: 'Protection applied to a bad route just delays the same failure.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Does a burst sleeve keep the hose working after a failure?', answer: 'No. It contains and redirects the escaping fluid so it does not spray an operator. The machine still stops and the assembly still needs replacing.' },
        { question: 'Can spiral guard cause problems of its own?', answer: 'It can trap moisture and grit against the cover, and it hides the surface it protects. Use it where there is a real contact point, inspect underneath it, and do not sleeve everything by default.' },
        { question: 'Are whip restraints needed on hydraulic lines?', answer: 'Less commonly than on air, because the stored energy is far lower — but they are still specified where a separation could put a heavy assembly in motion near people.' },
        { question: 'Is protection a substitute for replacing an old hose?', answer: 'No. Every device here reduces the consequence of a failure. None of them reduces the probability, which is what inspection and replacement do.' },
      ],
    },
    { type: 'product_embed', heading: 'Anti-static air hose for hazardous areas', skus: ['IH-IH-A101AS-T3', 'IH-IH-A190'] },
    { type: 'category_link', slug: 'air-water-hoses', label: 'Air and water hose', blurb: 'Standard and anti-static constructions, with couplings specified to match.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Principles only. Restraint sizing and sleeve ratings are per product — take them from the manufacturer data.' },
    { type: 'cta_block', heading: 'Reviewing protection across a site?', body: 'Tell us where the hoses run and who works near them. Our engineers will say what each run actually needs rather than sleeving everything.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
