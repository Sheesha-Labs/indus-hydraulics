import type { BlogArticleSeed } from '../shared'

/**
 * Pillar: rigging kit for a new site. Example quantities are labelled as an example to adapt to the
 * lift plan, not a standard. UAE inspection/register facts from memory uae-lifting-inspection-rules
 * (Abu Dhabi CoP 34: accessories 6-monthly by approved third party, registers, SWL marking; Dubai
 * GU48: 12-monthly EIAC-accredited certification; colour coding not statutory per LEEA).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'site-mobilisation-rigging-kit',
  title: 'Rigging kit for a new site: what to order when mobilising in the UAE and GCC',
  excerpt:
    'A new project needs a rigging loft before the first lift: slings, shackles, hooks, chain blocks, tag lines, and a register to track them. What to order, in what mix, how to size it to your cranes and lifts, and how to set up the store, register and inspection cycle so the kit passes its first third-party examination — with an example starter list for a mid-size building site.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Site Mobilisation Rigging Kit: What to Order (UAE, GCC)',
  seoDescription:
    'What rigging gear a new construction site needs: slings, shackles, hooks, master links, chain blocks, beam clamps and tag lines, sized to your cranes — plus an example starter list, rigging loft set-up, register and UAE inspection intervals.',
  focusKeyword: 'rigging equipment list for construction site',
  publishedAt: '2026-10-14T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Size the kit from the lift plan: the heaviest planned lifts, the crane hooks, and the number of crews working at once.',
        'Buy in matched sets — slings, shackles and master links rated for the same loads — so riggers never improvise a connection.',
        'Order a spread of capacities, with more of the light and medium sizes that do most of the daily work.',
        'Set up a rigging loft and a lifting register before the first lift; every item is marked, certified and registered on arrival.',
        'In Abu Dhabi lifting accessories are examined every 6 months by approved third parties; plan the first examination into the programme.',
      ],
    },
    {
      type: 'lead',
      html: 'Mobilisation is when a site’s rigging habits are set. If the loft opens with a mixed bag of slings from the last project, unmarked shackles and no register, every lift for the next two years inherits it. If it opens with a matched, certified, registered kit sized to the cranes and the lift plan, riggers have the right gear to hand and the first third-party examination is a formality. This guide sets out what to order and how to organise it.',
    },

    { type: 'section_head', number: '/01', title: 'Start from the lift plan.', anchor: 'plan' },
    {
      type: 'prose',
      html: '<ul><li><strong>Cranes and hooks</strong>: tower and mobile cranes on site, their hook sizes and the heaviest load each will handle.</li><li><strong>Typical lifts</strong>: rebar bundles, formwork, steel members, precast, MEP plant, materials in stillages.</li><li><strong>Heaviest lifts</strong>: these set the top of the range — they may need dedicated rigging, engineered by the lifting engineer.</li><li><strong>Crews</strong>: how many rigging crews work at once, so there is a set per crew plus spares in quarantine and inspection.</li><li><strong>Fixed lifting</strong>: plant rooms, lift shafts and workshops where chain blocks, beam trolleys and clamps will live.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'The core kit.', anchor: 'core' },
    {
      type: 'comparison_table',
      caption: 'Core rigging kit by family — what it is for',
      columns: ['Family', 'Used for', 'Notes'],
      rows: [
        { cells: ['Round slings and webbing slings', 'General lifting, finished surfaces, choker hitches', 'Colour-coded by WLL (EN 1492); protect from sharp edges'] },
        { cells: ['Chain slings, 2- and 4-leg', 'Steel, precast, heavy and hot loads', 'Grade 80 or 100; master link sized to the crane hook'], highlight: true },
        { cells: ['Wire rope slings', 'Heavy and long-term rigging, abrasive loads', 'Ferrule-secured or spliced eyes; thimbles where eyes bear on pins'] },
        { cells: ['Shackles', 'Joining slings to lugs, hooks and each other', 'Bolt type for anything left in place; see the shackle buying guide'] },
        { cells: ['Hooks, master links, swivels', 'Making up and connecting assemblies', 'Latched hooks; matched grades'] },
        { cells: ['Chain blocks, lever hoists, beam trolleys, beam clamps', 'Positioning and lifting in plant rooms and shafts', 'Lever hoists for pulling and tensioning'] },
        { cells: ['Tag lines', 'Controlling load rotation from a safe distance', 'Non-conductive fibre rope'] },
        { cells: ['Lifting points and eye bolts', 'Attaching to equipment and fabrications', 'Use rated points; see eye bolt types and angled loads'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'An example starter list.', anchor: 'example' },
    {
      type: 'paragraph',
      html: 'As an <em>example only</em> — for a mid-size building site with two tower cranes, two rigging crews and lifts mostly under 5 t — a starter kit might look like the list below. Your lift plan and lifting engineer set the real quantities and capacities; treat this as a checklist of families, not a standard.',
    },
    {
      type: 'comparison_table',
      caption: 'Example starter kit — two tower cranes, two crews, lifts mostly under 5 t (adapt to your lift plan)',
      columns: ['Item', 'Example mix'],
      rows: [
        { cells: ['Round slings', '1 t, 2 t, 3 t, 5 t in 2–6 m lengths; several of each per crew'] },
        { cells: ['Webbing slings', '2 t and 3 t, 3–4 m, for finished and fragile items'] },
        { cells: ['Chain slings', 'Two- and four-leg Grade 80, sized for the heaviest routine lifts'] },
        { cells: ['Shackles', 'Screw-pin and bolt-type anchor shackles, 2 t to 8.5 t, with spares'] },
        { cells: ['Chain blocks and lever hoists', '1 t to 3 t chain blocks, 1.5 t lever hoists'] },
        { cells: ['Beam clamps and trolleys', 'Matched to plant-room beam flanges'] },
        { cells: ['Tag lines', 'One or two per crew, plus spares'] },
        { cells: ['Quarantine stock', 'Spare slings and shackles to cover items out for inspection or rejected'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What rigging equipment does a construction site need?',
      answer:
        'A matched set of slings (round, webbing, chain and wire rope), shackles, hooks and master links, chain blocks and lever hoists, beam clamps and trolleys, tag lines and rated lifting points — sized from the site’s lift plan and cranes, with enough sets for each rigging crew plus spares, all marked, certified and entered in a lifting register.',
    },

    { type: 'section_head', number: '/04', title: 'The rigging loft and register.', anchor: 'loft' },
    {
      type: 'prose',
      html: '<ol><li><strong>Receive</strong>: check each item against the purchase order and its certificate, and read its markings — see <a href="/blog/shackle-markings-explained">shackle markings explained</a>.</li><li><strong>Register</strong>: give every item a unique ID, record WLL, certificate number and next examination date.</li><li><strong>Store</strong>: slings hung off the floor, out of sun and away from chemicals; shackles and hooks in labelled bins by size; chain blocks on racks.</li><li><strong>Issue and return</strong>: issue against the register, inspect on return, quarantine anything damaged.</li><li><strong>Examine</strong>: book the periodic thorough examination; colour or tag items to show they are in date if your site uses a system — not a legal requirement in itself, but a useful one.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'UAE examination intervals.',
      body: 'Abu Dhabi’s lifting code of practice requires thorough examination of lifting accessories every 6 months (and lifting equipment every 12) by approved third parties, with daily checks and site registers. Dubai’s guidance requires certification at least every 12 months by an accredited third party, and accreditation rules set 6 months for accessories. See lifting equipment inspection in the UAE.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How many slings does a construction site need?', answer: 'Enough sets for each rigging crew to work without borrowing, plus spares for items out for inspection or rejected. Your lift plan sets the capacities.' },
        { question: 'Should I buy Grade 80 or Grade 100 chain slings?', answer: 'Grade 100 carries more for the same chain size and weight. Do not mix grades within one assembly; see chain grades explained.' },
        { question: 'Do rigging items need certificates on arrival?', answer: 'Yes. Each item should be marked with its WLL and come with the manufacturer’s test certificate, which goes into the lifting register.' },
        { question: 'Is colour coding of lifting gear required in the UAE?', answer: 'The Abu Dhabi and Dubai documents we have read do not require it, but many sites use colour or tag systems to show items are in date.' },
        { question: 'Can you supply a full rigging kit?', answer: 'Yes. Send the lift plan or a list of families and capacities, and we will quote a matched kit with certificates.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Core rigging kit',
      skus: ['IH-LR-SY-PRSE', 'IH-LR-SY-PFWSEE', 'IH-LR-CS-G80DOS', 'IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-G8-MLA', 'IH-LR-CB-A', 'IH-LR-CB-LVA'],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting and rigging',
      blurb: 'Slings, shackles, hooks, chain, blocks and hoists — certified, from Dubai.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['shackle-buying-guide-uae', 'types-of-lifting-slings', 'lifting-equipment-inspection-uae', 'sling-colour-code-chart', 'chain-sling-capacity-chart', 'lifting-gear-test-certificate'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Kit structure is general practice; quantities are an example to adapt to the lift plan. UAE intervals from Abu Dhabi and Dubai lifting guidance read September 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Mobilising a site?',
      body: 'Send your crane list and lift plan, or the families and capacities you need. We will quote a matched, certified rigging kit from stock.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
