import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-cover-blistering',
  title: 'Cover blistering and pinholes: usually permeation, not a defect',
  excerpt:
    'A bubble under the cover looks like a manufacturing fault and normally is not. It is gas that got through the tube and could not get out through the cover — which tells you something specific about the fluid and the duty.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose cover blistering — what causes it and what to do',
  seoDescription:
    'Why hydraulic hose covers blister or bubble: gas permeation through the tube, trapped fluid from a tube pinhole, and external heat. How to tell which, and which pin-pricked covers are normal.',
  focusKeyword: 'hydraulic hose blistering',
  publishedAt: '2026-08-24T13:42:08.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A blister is something trapped between the tube and the cover. What is trapped tells you the cause.',
        'Gas permeation is the common one: gas dissolved in the fluid passes through the tube faster than it escapes through the cover, and collects.',
        'A blister full of oil is different and more serious — it means the tube has failed and only the cover is holding pressure.',
        'Some hose is supplied with the cover deliberately pin-pricked to let permeated gas escape. Those holes are a feature, not damage.',
        'Cut a blister open before deciding. Gas and oil are immediately distinguishable and the diagnosis follows from which one it is.',
      ],
    },
    {
      type: 'lead',
      html: 'A raised bubble under the cover of an otherwise healthy hose looks exactly like a defect, and it is one of the more common reasons an assembly gets returned. Most of the time it is the hose doing what it was always going to do in that duty — but the exception is a hose that is one thin layer of rubber away from bursting.',
    },

    { type: 'section_head', number: '/01', title: 'What is inside the blister.', anchor: 'inside' },
    {
      type: 'comparison_table',
      caption: 'Cut it open. The contents are the diagnosis.',
      columns: ['What comes out', 'What it means', 'Urgency'],
      rows: [
        { cells: ['Gas, no fluid', 'Permeation — gas passing through the tube and collecting under the cover', 'Normal in some duties; review the specification'] },
        { cells: ['Hydraulic fluid', 'The tube has failed. Only the cover is containing pressure.', 'Replace immediately'], highlight: true },
        { cells: ['Nothing — the cover has simply lifted', 'Adhesion failure between cover and reinforcement, or external heat damage', 'Replace; investigate heat source'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A blister full of oil is a hose about to burst.',
      body: 'The cover is not a pressure-containing layer. It is there to protect the reinforcement from abrasion and weather. If fluid has reached it, the tube and the reinforcement have already been breached and the only thing between working pressure and the outside world is a few millimetres of unreinforced rubber. Take the machine out of service rather than finishing the shift.',
    },

    { type: 'section_head', number: '/02', title: 'Permeation, and why it is not a fault.', anchor: 'permeation' },
    {
      type: 'paragraph',
      html: 'Rubber is not a perfect barrier. Gas dissolved in hydraulic fluid — air, or in some systems something less benign — migrates slowly through the tube wall. In most duties it migrates out through the cover at a similar rate and nothing happens. <strong>Where the gas gets in faster than it gets out, it collects, and a blister is the result.</strong>',
    },
    {
      type: 'paragraph',
      html: 'That is a property of the fluid, the pressure and the temperature rather than a defect in a particular length of hose, which is why replacing a blistered hose with an identical one usually produces another blistered hose. The fix, when one is needed, is a different tube compound or a cover designed to vent.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Pin-pricked covers are deliberate.',
      body: 'Some hose is supplied with the cover perforated at intervals so permeated gas can escape rather than accumulate. If you find neat, evenly spaced holes in a cover, that is what they are — do not condemn the hose for them, and do not add your own to a cover that does not have them.',
    },
    {
      type: 'direct_answer',
      question: 'Is a blistered hydraulic hose safe to use?',
      answer:
        'Only if the blister contains gas and not fluid. A gas blister from permeation is a specification question rather than an immediate hazard. A blister containing hydraulic fluid means the tube has already failed and the cover alone is holding pressure — that hose comes out of service now, not at the next service interval.',
    },

    { type: 'section_head', number: '/03', title: 'What to change.', anchor: 'what-to-change' },
    {
      type: 'comparison_table',
      caption: 'By cause',
      columns: ['Finding', 'What to change'],
      rows: [
        { cells: ['Gas blisters, recurring on every hose in that circuit', 'Tube compound, or a construction rated for that fluid and duty'] },
        { cells: ['Gas blisters on one hose only', 'Check that hose is the specified grade — it may not be'] },
        { cells: ['Fluid blister', 'Replace, then find out why the tube failed — usually fluid incompatibility or heat'] },
        { cells: ['Cover lifted with nothing inside, near a hot component', 'Routing and heat shielding, not the hose'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Where the fluid is aggressive or the duty is unusual, a PTFE tube changes the problem entirely — it is chemically inert and does not permeate the way a nitrile tube does. It is a more expensive answer and it is the right one where nitrile keeps failing.',
    },
    { type: 'product_embed', heading: 'When the tube compound is the problem', skus: ['IH-HOSE-R14', 'IH-HOSE-R7-TP'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Nitrile, polyamide and PTFE tubes, stocked in Dubai.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I just cut the blister and carry on?', answer: 'Cut it to diagnose it, then act on what you find. If it is gas the hose may continue in service while you review the specification; if it is fluid the hose is finished. Cutting the cover does not repair anything either way — it only tells you which situation you are in.' },
        { question: 'Why does it always blister in the same place?', answer: 'Usually the hottest part of the run, because permeation rises with temperature. A blister that appears repeatedly at one point is often pointing at a heat source rather than at the hose.' },
        { question: 'Does blistering mean the hose was stored badly?', answer: 'No. Storage problems show as cracking, hardening or set, not as blisters. A blister forms in service, from something passing through the tube.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own workshop practice. Tube compounds and temperature ranges are from the product specifications for the grades we stock.',
    },
    { type: 'cta_block', heading: 'Blistering on every hose in a circuit?', body: 'That is a specification question, not a batch of bad hose. Tell us the fluid, the pressure and the running temperature and we will tell you what tube compound the duty actually needs.', quoteLabel: 'Review a specification' },
  ],
}

export default ARTICLE
