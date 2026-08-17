import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-inspection',
  title: 'Hydraulic hose inspection: what to look for, and what it means',
  excerpt:
    'A walk-round that takes ten minutes finds most of what is about to fail. What to look at, what each finding actually indicates, and where the judgement calls are.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose inspection checklist — what to look for',
  seoDescription:
    'What to check on a hydraulic hose: cover damage, exposed reinforcement, twist, routing, fittings and leaks. What each finding means and when to take the machine off.',
  focusKeyword: 'hydraulic hose inspection checklist',
  publishedAt: '2026-08-17T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Exposed reinforcement is not a judgement call. The assembly is failing and the machine should come off.',
        'Most of what you are looking for is at the ends and at contact points, not in the middle of a run.',
        'Twist is the finding people miss, because a twisted hose looks like a hose. Read the layline.',
        'A weep at a crimped fitting is not a torque problem, and re-torquing it does not help.',
        'Inspect with the system depressurised. Never run a hand along a line to find a leak.',
      ],
    },
    {
      type: 'lead',
      html: 'Hose inspection is one of the highest-return maintenance tasks there is, because the failures it catches are the ones that strand a machine and occasionally injure someone. It is also one of the easiest to do badly — a glance along a run is not an inspection.',
    },

    { type: 'section_head', number: '/01', title: 'Depressurise first.', anchor: 'depressurise' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never search for a leak with your hand.',
      body: 'A pinhole leak can inject fluid through intact skin, and the entry wound looks trivial. Depressurise before inspecting. If you genuinely cannot, use cardboard held at arm’s length — a glove offers no protection whatsoever at hydraulic pressures.',
    },

    { type: 'section_head', number: '/02', title: 'The walk-round.', anchor: 'walk-round' },
    {
      type: 'sop_block',
      header: 'HOSE INSPECTION · VISUAL WALK-ROUND',
      completion: '7 checks',
      phases: [
        {
          name: 'The hose itself',
          rows: [
            { task: 'Cover damage', detail: 'Cuts, gouges, blistering or a flat worn patch. A blister suggests the liner has failed and fluid is between the layers.', who: 'Technician', tool: 'Eyes' },
            { task: 'Exposed reinforcement', detail: 'Any wire visible through the cover. Not a judgement call — take the machine off and replace the assembly.', who: 'Technician', tool: 'Eyes' },
            { task: 'Hardening or crazing', detail: 'Cover that has gone stiff or crackled has heat-aged. It tells you about ambient exposure, not about the reinforcement underneath.', who: 'Technician', tool: 'Hand' },
            { task: 'Twist', detail: 'Follow the layline. If it spirals, the assembly is loaded in a way it was not designed for.', who: 'Technician', tool: 'Eyes' },
          ],
        },
        {
          name: 'Ends and installation',
          rows: [
            { task: 'Fitting condition', detail: 'Weeping at the ferrule, corrosion, or hose visibly pulled from the fitting. A weep here means the crimp or the seat is compromised.', who: 'Technician', tool: 'Eyes' },
            { task: 'Bend radius at the ends', detail: 'A tight bend immediately behind a fitting is the most common installation fault, and the most common place to find a kink.', who: 'Technician', tool: 'Eyes' },
            { task: 'Contact points', detail: 'Anywhere the hose touches structure or another hose. This is where abrasion starts and where it is cheapest to fix.', who: 'Technician', tool: 'Eyes' },
          ],
        },
      ],
    },

    { type: 'section_head', number: '/03', title: 'What each finding means.', anchor: 'what-it-means' },
    {
      type: 'comparison_table',
      caption: 'Finding, likely cause, action',
      columns: ['What you find', 'What it usually means', 'Action'],
      rows: [
        { cells: ['Wire visible through the cover', 'Abrasion or a cut has breached the cover; reinforcement is now corroding', 'Replace now'], highlight: true },
        { cells: ['Flat worn patch, no wire yet', 'Rubbing on structure or another hose', 'Replace at next opportunity, and fix the contact point'] },
        { cells: ['Blistered cover', 'Liner failure — fluid between the layers', 'Replace now'] },
        { cells: ['Weep at the ferrule', 'Crimp or seat compromised', 'Replace the assembly; do not re-torque'] },
        { cells: ['Layline spirals', 'Installed with twist', 'Re-install without twist and clamp so it cannot rotate'] },
        { cells: ['Stiff, crazed cover', 'Heat and UV ageing', 'Assess; plan replacement and shield the run'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How often should hydraulic hoses be inspected?',
      answer:
        'Frequently enough that a developing failure is caught between inspections — which depends on duty, environment and how critical the machine is, not on a universal number. In Gulf conditions, where heat and airborne sand accelerate cover damage and abrasion, intervals set for a temperate climate are optimistic.',
    },
    {
      type: 'paragraph',
      html: 'This article deliberately does not give an interval in hours. Any figure that ignores duty cycle, ambient temperature and criticality is a number pretending to be guidance. What is defensible is the method: inspect against a written checklist, record what was found, and let the findings set the next interval.',
    },
    { type: 'product_embed', heading: 'Replacement grades', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is surface cracking on the cover enough to condemn a hose?', answer: 'On its own it tells you the hose has aged, not what state the reinforcement is in. Treat it as a signal to plan replacement rather than as an immediate failure — unless there is wire visible, which is.' },
        { question: 'Should we pressure test hoses in service?', answer: 'In-service proof testing is not routine and can itself damage an aged assembly. Inspection plus a planned replacement programme is the normal approach; testing belongs at build.' },
        { question: 'Can a hose be repaired rather than replaced?', answer: 'No. There is no field repair for a hydraulic hose assembly that restores it to specification. Replace it.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Single and two-wire braid through four-spiral, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Inspection method and findings only. No replacement intervals published — those depend on duty, environment and criticality.' },
    { type: 'cta_block', heading: 'Building an inspection programme?', body: 'Tell us the fleet and the duty. Our engineers can help set criticality and a replacement plan that fits how the machines are actually used.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
