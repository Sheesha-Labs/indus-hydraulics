import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-crimp-faults',
  title: 'Crimp too tight, crimp too loose: what each one leaves behind',
  excerpt:
    'A crimp is a measured diameter with a tolerance in tenths of a millimetre. Miss it in either direction and the assembly fails — but it fails differently, and the difference is visible on the failed part.',
  categorySlug: 'failure-analysis',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose crimp faults — too tight, too loose, wrong ferrule',
  seoDescription:
    'How to tell an over-crimped hose assembly from an under-crimped one, what a wrong ferrule looks like, and what to ask a workshop about crimp verification.',
  focusKeyword: 'hydraulic hose crimp problems',
  publishedAt: '2026-08-24T13:42:15.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A crimp is a specified diameter, verified with callipers after pressing — not a feel or a machine setting.',
        'Under-crimped assemblies let the hose walk out of the fitting. The failure is early and dramatic.',
        'Over-crimped assemblies cut the reinforcement at the ferrule mouth. The failure is early too, and looks like a hose fault.',
        'A ferrule that fits physically is not evidence it is the right ferrule — the crimp specification is per hose-and-ferrule combination.',
        'Any workshop building assemblies properly can state the crimp diameter it worked to and confirm it was measured.',
      ],
    },
    {
      type: 'lead',
      html: 'The crimp is the only part of a hose assembly that is manufactured rather than selected, and it is the only part where the tolerance is measured in tenths of a millimetre. It is also the part nobody can inspect once the assembly is on the machine.',
    },

    { type: 'section_head', number: '/01', title: 'What a crimp actually is.', anchor: 'what-a-crimp-is' },
    {
      type: 'paragraph',
      html: 'Crimping compresses a steel ferrule onto the hose until the reinforcement is gripped hard enough to hold working pressure and not so hard that the grip damages it. <strong>The target is a finished outside diameter</strong>, published by the fitting manufacturer for that specific combination of hose construction and ferrule, and reached with a specific die.',
    },
    {
      type: 'paragraph',
      html: 'Three things therefore have to match: hose, ferrule and die. Change any one and the specified diameter changes with it. This is why a skive fitting on a no-skive hose, or a ferrule that merely fits, produces an assembly whose rating nobody can state.',
    },
    {
      type: 'direct_answer',
      question: 'How do you know if a hydraulic hose has been crimped correctly?',
      answer:
        'By measuring the crimp diameter with callipers after pressing and comparing it against the figure published for that hose and ferrule combination. There is no visual test that substitutes for it — a crimp that looks right can be a tenth of a millimetre out in either direction, and that is enough.',
    },

    { type: 'section_head', number: '/02', title: 'The two directions of error.', anchor: 'two-errors' },
    {
      type: 'comparison_table',
      caption: 'What each fault leaves on the failed assembly',
      columns: ['Fault', 'Evidence', 'Failure mode'],
      rows: [
        { cells: ['Under-crimped', 'Hose pulled out or moved in the ferrule; tube marks show it walked', 'Blow-off under pressure, often early and total'], highlight: true },
        { cells: ['Over-crimped', 'Wire cut or crushed at the ferrule mouth; sharp failure line at the edge', 'Burst right at the ferrule edge'], highlight: true },
        { cells: ['Wrong ferrule for the construction', 'Ferrule length or profile does not match the hose reinforcement', 'Either of the above, unpredictably'] },
        { cells: ['Not skived where required', 'Cover trapped under the ferrule instead of removed', 'Grip on cover rather than on wire; pull-out'] },
        { cells: ['Insufficient insertion depth', 'Short witness mark; hose not seated to the fitting shoulder', 'Pull-out'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The witness mark is a free check.',
      body: 'Marking the hose at the correct insertion depth before crimping leaves a visible line at the ferrule afterwards. If the mark has disappeared under the ferrule the hose went in far enough; if there is a gap it did not. It costs one pen stroke and catches the most common build error there is.',
    },

    { type: 'section_head', number: '/03', title: 'Why "it held on test" is not proof.', anchor: 'not-proof' },
    {
      type: 'paragraph',
      html: 'A proof test confirms the assembly holds a pressure now. It does not confirm the crimp is within specification, because a marginal crimp holds a static test comfortably and then fails after a few thousand pressure cycles. <strong>The test and the crimp measurement answer different questions</strong>, and a workshop that does one and not the other is checking the easier thing.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Questions worth asking a hose supplier.',
      body: 'What crimp diameter did you work to for this combination? Was it measured after pressing? Which die was used? None of those is an unreasonable question and all three have specific answers. A supplier who cannot produce them is not necessarily building bad assemblies — but nobody can tell, including them.',
    },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Skive and no-skive, matched to construction.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'One-piece and two-piece, every family.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can an over-crimped hose be identified before it fails?', answer: 'Only by measuring the crimp diameter, which means measuring it at build. Once the assembly is fitted there is no external sign, which is why the measurement has to happen in the workshop rather than being inferred later.' },
        { question: 'Is a field crimp less reliable than a workshop crimp?', answer: 'Not inherently — the same specification applies and portable machines are capable of meeting it. What changes is the working conditions and whether the verification actually happens with the machine standing in the sun.' },
        { question: 'The ferrule fits the hose. Is that enough?', answer: 'No. Ferrules are specified per hose construction, not per dash size, and several will physically slide onto the same hose. The crimp diameter published for the combination is what makes it the right ferrule.' },
        { question: 'Can I re-crimp an assembly that pulled out?', answer: 'No. The ferrule is deformed and the hose end has been damaged by walking out of it. Cut back to sound hose and use a new fitting.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Workshop practice. Crimp diameters are per hose-and-ferrule combination and come from the fitting manufacturer, not from any general rule.',
    },
    { type: 'cta_block', heading: 'Assemblies failing at the ferrule?', body: 'Ask us what crimp diameter we work to for your combination — we will tell you, and we measure every one after pressing.', quoteLabel: 'Order assemblies' },
  ],
}

export default ARTICLE
