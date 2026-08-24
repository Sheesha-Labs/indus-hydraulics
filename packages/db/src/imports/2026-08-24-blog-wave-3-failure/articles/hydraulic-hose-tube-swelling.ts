import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-tube-swelling',
  title: 'Swollen or hardened tube: reading fluid incompatibility off the failure',
  excerpt:
    'Cut a failed hose open and the tube tells you whether the fluid was wrong. Swollen and soft is one problem, shrunken and brittle is the opposite one, and both mean the hose and the fluid were never suited.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose tube swelling — fluid incompatibility diagnosis',
  seoDescription:
    'How to tell fluid incompatibility from a cut hydraulic hose: swollen soft tube, hardened brittle tube, and delamination. Which tube compound to move to.',
  focusKeyword: 'hydraulic hose swollen inside',
  publishedAt: '2026-08-25T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cut the failed hose lengthways. The tube is the evidence and it is only visible from inside.',
        'Swollen, soft or spongy means the fluid is being absorbed into the tube compound.',
        'Hardened, shrunken or cracked means the fluid has extracted the plasticisers that kept the rubber flexible.',
        'Nearly every hydraulic hose we stock has a nitrile (NBR) tube, which suits mineral oil and does not suit everything else.',
        'Where the fluid is the problem, changing hose grade within the same tube compound changes nothing.',
      ],
    },
    {
      type: 'lead',
      html: 'Most hose diagnosis happens from outside. This one cannot: a tube attacked by the fluid it is carrying can sit inside a cover that looks entirely healthy, and the only way to see it is to cut the hose open along its length.',
    },

    { type: 'section_head', number: '/01', title: 'The two opposite failures.', anchor: 'two-failures' },
    {
      type: 'comparison_table',
      caption: 'What the tube looks like, and what it means',
      columns: ['Tube condition', 'Mechanism', 'Typical cause'],
      rows: [
        { cells: ['Swollen, soft, spongy, oversized', 'Fluid absorbed into the compound, swelling it', 'A fluid the tube was not selected for'], highlight: true },
        { cells: ['Hard, brittle, shrunken, cracked', 'Plasticisers extracted, leaving the rubber stiff', 'Aggressive solvent, or sustained heat'] },
        { cells: ['Tube separated from the reinforcement', 'Adhesion lost, often after swelling', 'Advanced incompatibility'] },
        { cells: ['Tube eroded or thinned, smooth', 'Mechanical, not chemical — abrasive fluid', 'Contaminated or particulate-laden fluid'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Compare against a new offcut.',
      body: 'Swelling and hardening are obvious side by side and easy to talk yourself out of alone. Keep a short offcut of the same grade to hold against the failed piece — a few centimetres of new hose is the cheapest diagnostic tool in the workshop.',
    },

    { type: 'section_head', number: '/02', title: 'What our hose is actually made of.', anchor: 'tube-compounds' },
    {
      type: 'paragraph',
      html: 'Almost every wire-reinforced hydraulic hose in our range has a nitrile tube. It is the standard choice because it suits mineral hydraulic oil, which is what most systems run. <strong>The moment the fluid is not mineral oil, that assumption needs checking.</strong>',
    },
    {
      type: 'comparison_table',
      caption: 'Tube compounds across the grades we stock',
      columns: ['Tube', 'Grades', 'Suits'],
      rows: [
        { cells: ['Nitrile (NBR)', '1SN, 2SN, 1SC, 2SC, 4SP, 4SH, R5, R6, R13, R15', 'Mineral hydraulic oil'] },
        { cells: ['Polyamide (nylon)', 'R7, R8 thermoplastic', 'Hydraulic fluid, tighter routing, lighter weight'] },
        { cells: ['PTFE', 'R14', 'Chemically inert — the answer where nitrile fails'], highlight: true },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Why is my hydraulic hose swelling from the inside?',
      answer:
        'The fluid is being absorbed into the tube compound. It means the hose and the fluid are not compatible — most commonly a nitrile tube carrying something other than mineral oil, such as a phosphate-ester fire-resistant fluid, a synthetic, or a chemical the circuit was not designed around. Changing hose grade will not fix it; changing tube compound will.',
    },

    { type: 'section_head', number: '/03', title: 'Heat makes everything else worse.', anchor: 'heat' },
    {
      type: 'paragraph',
      html: 'Chemical attack accelerates with temperature. A fluid the tube tolerates at 60 °C can attack it steadily at 100 °C, so a marginal combination that ran for years can start failing when the duty changes — a higher ambient, a hotter summer, a cooler that has silted up.',
    },
    {
      type: 'paragraph',
      html: 'The grades we stock are rated to 100 °C on most constructions and 121 °C on the spiral and R5 lines, with PTFE at 204 °C. <strong>Those are limits for the hose in its intended fluid, not licences to run any fluid up to that temperature.</strong>',
    },
    { type: 'product_embed', heading: 'When the tube compound has to change', skus: ['IH-HOSE-R14', 'IH-HOSE-R7-TP'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Nitrile, polyamide and PTFE tubes.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'We changed to a fire-resistant fluid and hoses started failing. Related?', answer: 'Almost certainly. Phosphate-ester fluids in particular are not compatible with the nitrile tube used in standard hydraulic hose. A fluid change is a hose specification change, and it applies to seals and paint as well.' },
        { question: 'How do I check compatibility before committing?', answer: 'Against the tube compound, at the actual concentration and temperature — not against the hose grade. Tell us the fluid and the running temperature and we will tell you which tube suits it.' },
        { question: 'The tube looks fine but the hose keeps leaking at the fittings.', answer: 'Check the seals and O-rings in the same fluid. A tube that tolerates a fluid does not guarantee that every elastomer in the circuit does, and the seals usually go first.' },
        { question: 'Is PTFE always the safe answer?', answer: 'It is chemically inert and handles far higher temperatures, so it solves most compatibility problems. It is more expensive, less flexible in the small sizes and needs different fittings — worth it where nitrile keeps failing, over-specified where it does not.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Tube compounds and temperature ranges from the product specifications for the grades we stock. Compatibility must be checked against the specific fluid, concentration and temperature.',
    },
    { type: 'cta_block', heading: 'Changing fluid, or already seeing swelling?', body: 'Tell us the fluid, the concentration and the running temperature. We will tell you which tube compound the duty needs — and whether your seals need the same conversation.', quoteLabel: 'Check compatibility' },
  ],
}

export default ARTICLE
