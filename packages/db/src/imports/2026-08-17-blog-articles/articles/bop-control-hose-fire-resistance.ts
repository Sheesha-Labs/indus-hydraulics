import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'bop-control-hose-fire-resistance',
  title: 'BOP control hose: why fire survival is half the specification',
  excerpt:
    'An API 16D control hose is rated on pressure like anything else — and then on something most hose never has to do: keep working inside a fire for long enough to shut the well in.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'BOP control hose — API 16D fire resistance and ratings',
  seoDescription:
    'API Spec 16D BOP control hose: 5,000 psi working, fire survival rated 1,300 °F for 30 minutes, tested to ISO 15540. Why the cover is the specification.',
  focusKeyword: 'bop control hose api 16d',
  publishedAt: '2026-08-18T07:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'API Spec 16D governs BOP control hose. The constructions we supply are rated 5,000 psi working.',
        'The defining requirement is not pressure. It is fire survival — our Fireshield constructions are rated 1,300 °F (704 °C) for 30 minutes per API Spec 16D and API RP 17H.',
        'Fire performance is verified by test, to ISO 15540, rather than asserted from the compound.',
        'The reason is functional: the stack has to be operable during the event, not merely intact after it.',
        'A hose that meets the pressure rating and not the fire rating is not a control hose.',
      ],
    },
    {
      type: 'lead',
      html: 'Almost every hose specification is about containing pressure. BOP control hose has a second requirement that reframes the first: it has to still be doing its job while it is on fire, because the moment it is most needed is the moment the rig is burning.',
    },

    { type: 'section_head', number: '/01', title: 'The rating that matters.', anchor: 'the-rating' },
    {
      type: 'direct_answer',
      question: 'What is the fire rating on a BOP control hose?',
      answer:
        'The Fireshield constructions we supply are rated to survive 1,300 °F — 704 °C — for 30 minutes, per API Spec 16D and API RP 17H, with fire performance verified by test to ISO 15540. Pressure rating is 5,000 psi working; the fire requirement is what distinguishes the product.',
    },
    {
      type: 'comparison_table',
      caption: 'What the specification asks for',
      columns: ['Requirement', 'Value', 'Source'],
      rows: [
        { cells: ['Working pressure', '5,000 psi', 'API Spec 16D'] },
        { cells: ['Fire survival', '1,300 °F (704 °C) for 30 minutes', 'API Spec 16D / API RP 17H'], highlight: true },
        { cells: ['Fire test method', 'ISO 15540', 'Test standard'] },
        { cells: ['Size range', '1/4" – 1"', 'As supplied'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Thirty minutes is not an arbitrary number. It is a functional window — long enough for the control system to operate the stack and secure the well while the fire is happening. That is why the requirement is <em>survival with function</em> rather than simply resistance to burning, and why it is demonstrated by a test method rather than inferred from the cover compound.',
    },

    { type: 'section_head', number: '/02', title: 'Tested, not asserted.', anchor: 'tested' },
    {
      type: 'callout',
      tone: 'warning',
      title: '"Fire resistant" is not a specification.',
      body: 'Any number of covers will resist flame to some degree. What matters here is a documented test to a named method at a stated temperature and duration. If a control hose is offered without that documentation, the fire rating is a marketing adjective rather than a qualification.',
    },
    {
      type: 'paragraph',
      html: 'The same logic applies to the assembly rather than the hose alone. The end fittings, the crimp and any protective sheathing are part of what has to survive, which is why control hose is bought as a certified assembly rather than built from bulk hose and whatever ends are in stock.',
    },

    { type: 'section_head', number: '/03', title: 'Where else fire rating appears.', anchor: 'elsewhere' },
    {
      type: 'paragraph',
      html: 'Fire-rated construction is not confined to the control circuit. The Megashield 5000 assemblies we supply carry the same API Spec 16D and ISO 15540 basis at 5,000 psi across a 1/4" to 2" range, and the Flameshield low-pressure oilfield hose carries a flame-resistant cover for general rig service at far lower pressures. The requirement follows the <em>consequence of the fire</em>, not the pressure of the line.',
    },
    { type: 'product_embed', heading: 'Fire-rated oilfield constructions', skus: ['IH-OG-WCT-006', 'IH-OG-LP-001', 'IH-OG-LP-003', 'IH-OG-WCT-007'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Does a fire-rated hose survive indefinitely in a fire?', answer: 'No. The rating is a duration — 30 minutes at the stated temperature on these constructions. It is designed to keep the system functional through the window in which the well can be secured, not to be permanently fireproof.' },
        { question: 'Can I add a fire sleeve to a standard hose instead?', answer: 'A sleeve may help a general hydraulic line survive radiant heat, but it does not turn a standard hose into a 16D control hose. The qualification is of the assembly against a test method, and it cannot be retrofitted.' },
        { question: 'Is API RP 17H the same as API Spec 16D?', answer: 'They are different documents that both bear on this equipment — 16D is the specification for control systems, RP 17H a recommended practice relevant to subsea intervention. Our Fireshield constructions cite both for the fire rating.' },
        { question: 'What documentation should come with a control hose?', answer: 'The certification for the assembly as supplied, including the fire rating basis. Ask for it at order — as with any certified assembly, obtaining it later is much harder than specifying it up front.' },
      ],
    },
    { type: 'category_link', slug: 'blowout-preventers', label: 'BOP equipment and spares', blurb: 'Control units, accumulators, ram blocks and elastomers alongside the control hose.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Ratings from the constructions we stock, resting on the manufacturers’ API certification and ISO 15540 test basis.' },
    { type: 'cta_block', heading: 'Replacing control hose?', body: 'Tell us the stack and the circuit. We supply certified assemblies with the fire-rating documentation, and our services team handles BOP recertification alongside.', quoteLabel: 'Specify control hose' },
  ],
}

export default ARTICLE
