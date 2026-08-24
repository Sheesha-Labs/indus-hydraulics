import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'offshore-hydraulic-hose',
  title: 'Offshore and splash zone: where the fittings stop being an afterthought',
  excerpt:
    'Offshore, the hose is often the least of it. Carbon-steel fittings in a splash zone corrode on a schedule nobody planned for, and a seized fitting is a different kind of problem from a worn hose.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Offshore hydraulic hose — splash zone, stainless fittings, standards',
  seoDescription:
    'What changes for hydraulic hose offshore: fitting material, cover choice, inspection access and which oilfield standards govern pressure-control lines.',
  focusKeyword: 'offshore hydraulic hose',
  publishedAt: '2026-08-26T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Fitting material is usually the first thing to change offshore, before the hose does.',
        'The splash zone is the hardest environment on the structure — wet, dry, salt, oxygen, repeatedly.',
        'Access decides maintenance strategy. A hose nobody can reach has to be replaced on age, not on inspection.',
        'Pressure-control lines on a rig are governed by API standards and are a different conversation from general hydraulics.',
        'A seized fitting is its own failure mode: the assembly may be sound and still unserviceable because nothing will come apart.',
      ],
    },
    {
      type: 'lead',
      html: 'Offshore work concentrates every environmental problem in this region into one place — salt, humidity, sun and mechanical duty, on equipment that is difficult to reach and expensive to stop. It also shifts which component fails first.',
    },

    { type: 'section_head', number: '/01', title: 'The fittings go first.', anchor: 'fittings-first' },
    {
      type: 'paragraph',
      html: 'A hose cover is a corrosion barrier over its whole length. A fitting is bare steel with threads, flats and a sealing face, all of them exposed. <strong>In salt spray the fitting is the vulnerable component</strong>, and the practical consequence is not usually a leak — it is a joint that cannot be undone when the hose needs changing.',
    },
    {
      type: 'comparison_table',
      caption: 'What changes offshore, in order of how often it matters',
      columns: ['Component', 'Change', 'Why'],
      rows: [
        { cells: ['Fittings and adapters', 'Stainless — SS316L', 'Carbon steel corrodes and seizes in salt spray'], highlight: true },
        { cells: ['Cover specification', 'Weather-resistant, not only abrasion-resistant', 'Exposure is constant; rubbing may not be'] },
        { cells: ['Inspection interval', 'Shorter, or replaced on age where access is poor', 'Reinforcement corrosion is not inspectable'] },
        { cells: ['Tagging', 'Mandatory in practice', 'Age-based replacement requires a fitted date'] },
        { cells: ['Pressure-control lines', 'Governed by API 16C, 16D or 7K', 'Different standards, different design factors'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is different about hydraulic hose offshore?',
      answer:
        'Mostly the fittings and the maintenance regime rather than the hose. Carbon-steel fittings corrode and seize in salt spray, so stainless is usual; covers should be specified for weather as well as abrasion; and because reinforcement corrosion cannot be inspected, assemblies in poor-access locations are replaced on age, which requires them to be tagged with a fitted date.',
    },

    { type: 'section_head', number: '/02', title: 'The splash zone is the worst of it.', anchor: 'splash-zone' },
    {
      type: 'paragraph',
      html: 'Permanently submerged steel corrodes at a moderate rate; permanently dry steel corrodes slowly. The splash zone does neither — it alternates, so the surface is repeatedly wetted with salt water and then exposed to oxygen. <strong>That cycling is what makes it the most aggressive band on any offshore structure</strong>, and equipment routed through it needs specifying on that basis rather than on the general offshore environment.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Access is a specification input, not a logistics detail.',
      body: 'Where an assembly can be inspected monthly, cover condition is a usable control. Where reaching it needs a shutdown or a rope team, it is not — and the specification has to assume replacement on age. Deciding this at design time is much cheaper than discovering it during an unplanned intervention.',
    },

    { type: 'section_head', number: '/03', title: 'Rig pressure control is a separate subject.', anchor: 'pressure-control' },
    {
      type: 'paragraph',
      html: 'Everything above is about general hydraulics — cranes, winches, deck equipment, power units. Choke and kill lines, BOP control hose and rotary hose are governed by API standards with their own requirements and much tighter design factors, and none of the industrial rules of thumb carry across. Those are covered separately in our oilfield material.',
    },
    { type: 'product_embed', heading: 'Where the environment governs', skus: ['IH-HOSE-R14'] },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'SS316L fittings', blurb: 'BSP, JIC, ORFS, metric and SAE, in stainless.' },
    { type: 'category_link', slug: 'oil-gas-hoses', label: 'Oil & gas hose', blurb: 'API 7K, 16C and 16D constructions.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do I need stainless fittings on everything offshore?', answer: 'On anything exposed, and especially anything in the splash zone or that must be undone in service. Inside a sheltered machinery space the case is weaker. The question worth asking is whether you will need to undo this joint in five years.' },
        { question: 'Can I mix stainless fittings with a carbon-steel hose ferrule?', answer: 'It is common and it works, but the ferrule is then the corroding part. Where the whole assembly needs to survive, specify the ferrule material as well rather than assuming it follows the fitting.' },
        { question: 'Is a metallic hose better offshore than rubber?', answer: 'For corrosion resistance, yes. It is stiffer, needs different routing and costs more, so it is the right answer where the environment governs and over-specified where it does not.' },
        { question: 'How often should offshore hoses be replaced?', answer: 'On an interval set from your own failure history and access constraints rather than a published number. What makes that possible is tagging assemblies at build so their age is knowable.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own practice supplying offshore and coastal operations. API-governed pressure-control lines are covered separately.',
    },
    { type: 'cta_block', heading: 'Specifying for offshore?', body: 'Tell us where the assembly sits, whether it is in the splash zone and how hard it is to reach. Those three answers usually settle the fitting material and the replacement strategy.', quoteLabel: 'Specify for offshore' },
  ],
}

export default ARTICLE
