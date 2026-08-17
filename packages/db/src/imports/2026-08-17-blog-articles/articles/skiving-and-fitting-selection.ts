import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'skiving-and-fitting-selection',
  title: 'Skiving explained: when a fitting needs it, and what happens if you skip it',
  excerpt:
    'Skive and no-skive fittings are not interchangeable, and the difference is invisible once the assembly is crimped. What each does, and why the mistake only shows up under pressure.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'Skiving hydraulic hose — skive vs no-skive fittings explained',
  seoDescription:
    'What skiving is, why some hydraulic fittings require it, and what happens when a skive fitting is crimped onto unskived hose. One-piece vs two-piece fittings compared.',
  focusKeyword: 'skive vs no-skive hose fitting',
  publishedAt: '2026-08-17T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Skiving means removing hose material — cover, tube, or both — so the fitting grips the reinforcement directly rather than through rubber.',
        'Skive and no-skive fittings are designed around different amounts of material. They are not interchangeable in either direction.',
        'Getting it wrong produces an assembly that looks correct and holds at rest. It fails under pressure or cycling, usually by blowing off the fitting.',
        'No-skive is the default on most modern braid hose because it removes a step where a person can be inconsistent.',
        'The crimp specification belongs to the hose and fitting combination, not to either one alone.',
      ],
    },
    {
      type: 'lead',
      html: 'Skiving is one of the few hose-assembly decisions with no visible consequence. A wrongly matched fitting crimps up, looks like every other assembly on the rack, and passes a casual inspection. The failure arrives later, at pressure, and takes the fitting with it.',
    },

    { type: 'section_head', number: '/01', title: 'What skiving actually removes.', anchor: 'what-it-removes' },
    {
      type: 'comparison_table',
      caption: 'The three arrangements',
      columns: ['Type', 'What is removed', 'What the ferrule grips'],
      rows: [
        { cells: ['External skive', 'A band of outer cover at the hose end', 'The reinforcement directly'] },
        { cells: ['Internal skive', 'A band of inner tube', 'Nipple seats against reinforcement from inside'] },
        { cells: ['No-skive', 'Nothing', 'Through the intact cover'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'The point of removing the cover is grip. Rubber creeps; wire does not. A skive fitting is dimensioned assuming the ferrule closes onto reinforcement, so crimping it over an intact cover leaves the wire held through a compressible layer — which is exactly the layer that relaxes over the following weeks.',
    },
    {
      type: 'direct_answer',
      question: 'What happens if you crimp a skive fitting without skiving the hose?',
      answer:
        'The crimp closes onto cover rather than reinforcement, so grip depends on rubber that will relax. The assembly usually passes a proof test and holds at rest, then blows the fitting off under pressure cycling — often weeks later, and rarely anywhere convenient.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The reverse mistake is just as bad.',
      body: 'Skiving a hose intended for a no-skive fitting removes material the crimp specification assumed was there. The ferrule then over-compresses the reinforcement, which damages the wire rather than gripping it.',
    },

    { type: 'section_head', number: '/02', title: 'One-piece and two-piece.', anchor: 'one-and-two-piece' },
    {
      type: 'paragraph',
      html: 'A one-piece fitting arrives with the ferrule and nipple already assembled; a two-piece has them separate. For most fleet work one-piece is the better answer for an unglamorous reason: <strong>there is no way to get the parts wrong</strong>. Two-piece gives more flexibility across hose types and more opportunity for the wrong ferrule to end up on the right nipple.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I tell whether a fitting is skive or no-skive?', answer: 'From the manufacturer designation, not by eye — the difference is in the internal dimensions and the crimp specification, and it is not reliably visible on the bench. If the part number is unknown, treat the fitting as unidentified rather than guessing.' },
        { question: 'Where do I find the crimp diameter?', answer: 'In the manufacturer crimp chart for that hose and fitting combination. It belongs to the pair, not to either part alone, which is why mixing brands across a joint is a bad idea even when the parts appear to fit.' },
        { question: 'Can I mix one manufacturer’s hose with another’s fittings?', answer: 'It is not recommended. The crimp specification is validated for the combination, and outside that combination nobody has tested what the crimp actually does to the reinforcement.' },
        { question: 'Is no-skive weaker than skive?', answer: 'No — it is a different design, validated to its own specification. It is more common on modern braid hose largely because it removes a manual step where results vary between people.' },
      ],
    },
    { type: 'product_embed', heading: 'No-skive ferrules by hose type', skus: ['IH-CF-NS-R1T1SN', 'IH-CF-NS-R2T2SN', 'IH-CF-NS-1SN2SN'] },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Matched to the hose type they are specified for.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Principles only. Crimp diameters and skive lengths are per hose-and-fitting combination — take them from the manufacturer chart.' },
    { type: 'cta_block', heading: 'Not sure which fitting your hose takes?', body: 'Send the hose layline and a photograph of the fitting. We will confirm the combination and the crimp specification before anything is built.', quoteLabel: 'Check a combination' },
  ],
}

export default ARTICLE
