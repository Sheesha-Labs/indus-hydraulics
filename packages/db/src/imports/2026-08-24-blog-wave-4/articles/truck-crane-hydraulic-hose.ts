import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'truck-crane-hydraulic-hose',
  title: 'Truck-mounted cranes: hoses that live on a moving boom',
  excerpt:
    'A lorry loader spends its life folded up and driven around, then unfolds and lifts. The hoses have to survive both, and the routing that suits one position rarely suits the other.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Truck-mounted crane hydraulic hose — routing and replacement',
  seoDescription:
    'Why lorry loader and truck crane hoses fail: folded transit position, telescoping sections, stabiliser exposure and road debris. How to specify replacements.',
  focusKeyword: 'truck crane hydraulic hose',
  publishedAt: '2026-08-24T14:32:08.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The transit position is a working position for the hoses. Folded tight for a two-hour drive is a real duty.',
        'Telescoping sections need hoses that extend and retract, which is a different routing problem from bending.',
        'Stabiliser hoses hang low, get road spray, and are the most exposed on the vehicle.',
        'Lifting circuits are safety-critical: a failure can drop or shift a suspended load.',
        'Road vibration adds a cycle count nothing on a static machine experiences.',
      ],
    },
    {
      type: 'lead',
      html: 'A lorry loader is a crane that also does several hundred kilometres a week. That second job is invisible in most hose discussions and it is responsible for a good share of the failures — vibration, road debris and a folded transit geometry nobody measured the hoses in.',
    },

    { type: 'section_head', number: '/01', title: 'Two geometries, one hose.', anchor: 'two-geometries' },
    {
      type: 'paragraph',
      html: 'A replacement measured with the crane deployed can be pinched, stretched or trapped when the boom folds for transit — and it spends far more hours folded than deployed. <strong>Check both positions before the machine leaves.</strong>',
    },
    {
      type: 'comparison_table',
      caption: 'What to check, and in which position',
      columns: ['Check', 'Position'],
      rows: [
        { cells: ['Hose not pulled tight', 'Full extension and full slew'], highlight: true },
        { cells: ['Hose not pinched or trapped', 'Fully folded transit position'], highlight: true },
        { cells: ['Slack not able to snag', 'Both, and everything between'] },
        { cells: ['Clear of the load bed and the load', 'Folded, loaded'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Road vibration is a fatigue cycle nobody counts.',
      body: 'A crane that works twice a day and drives for five hours is putting far more small-amplitude cycles into its hoses than the lifting duty suggests. It concentrates where the hose leaves a fitting, which is why lorry loaders fail at the ferrule more often than yard cranes do.',
    },

    { type: 'section_head', number: '/02', title: 'Telescoping and stabilisers.', anchor: 'telescoping' },
    {
      type: 'paragraph',
      html: 'Telescoping sections carry hoses that have to change length with the boom, usually over a sheave or in a chain-and-hose arrangement. That is a specialist routing and it is unforgiving of an assembly made to the wrong length — too short and it is torn out at full extension, too long and it fouls when retracted.',
    },
    {
      type: 'paragraph',
      html: 'Stabiliser hoses have the opposite problem: they are simple, static and almost entirely neglected. They hang below the vehicle, take road spray, salt and stones, and their failure is the one that leaves a crane unable to set up on site.',
    },
    {
      type: 'direct_answer',
      question: 'Why do truck-mounted crane hoses fail early?',
      answer:
        'Because the vehicle duty is invisible in the hose specification. Road vibration adds fatigue cycles that concentrate at the fittings, road debris and spray attack the stabiliser lines, and a hose measured in the deployed position can be pinched for the many more hours the crane spends folded in transit.',
    },
    { type: 'product_embed', heading: 'Grades used on lorry loader circuits', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SH'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Proof tested and tagged for lifting duty.' },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'For under-vehicle and stabiliser runs.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Should truck crane hoses be replaced on age?', answer: 'On lifting circuits, yes — the consequence of failure is why. That needs tagged assemblies with known build dates, which is worth setting up before it is needed rather than after.' },
        { question: 'Can I use a compact hose to improve the folded routing?', answer: 'Often, and it is a good fit for this problem — roughly half the bend radius at the same pressure class. Confirm the pressure at the bore first.' },
        { question: 'The stabiliser creeps down overnight. Hose or cylinder?', answer: 'Either, and it is worth diagnosing rather than guessing. A wet hose or fitting points one way; a dry machine that still creeps points at cylinder seals or a valve.' },
        { question: 'Do you fit on site?', answer: 'Yes, across the UAE. For a crane that cannot fold for transit, that is usually the only workable option.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own field service practice. No model-specific dimensions or circuit pressures.',
    },
    { type: 'cta_block', heading: 'Lorry loader down?', body: 'Send photographs of the failed hose in both positions if you can — deployed and folded. It is the fastest way to get the replacement right first time.', quoteLabel: 'Get a crane hose made' },
  ],
}

export default ARTICLE
